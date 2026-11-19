-- US48 · Gửi thông tin cho khách (YC8.1). Viết trước migration (US48-TA1, CL14.5): task sau không sửa file này.
-- Hợp đồng database (YC8 "Dữ liệu", "Ai được làm gì", "Quy tắc của nhóm", thiet-ke-db.md mục 3 bất biến 3, 5, 6, 7):
--   fn_soan_tin_gui_khach(p_can_ids uuid[], p_tu date, p_den date) returns jsonb. Không ghi gì.
--     {"tu", "den", "so_dem", "mau_tin" (mẫu của người gọi, không có thì mẫu mặc định), "ten_sale",
--      "can": [{can_id, ma_can, ten_toa, so_phong_ngu, so_giuong, "chu" (chữ gửi khách của căn),
--               "so_anh" (tổng số ảnh), "anh": [đường dẫn trong kho anh-can, theo thu_tu, tối đa 10],
--               "tong_gia_ban" (null khi có đêm chưa có giá)}] theo thứ tự p_can_ids}.
--     Chữ một căn: dòng 1 "<tòa> <mã> · 2PN · 3 giường, view biển Bãi Cháy" (phần chưa nhập thì bỏ), dòng 2
--     "10/10 → 12/10 (2 đêm): 2.600.000đ"; có đêm chưa có giá thì dòng 2 ghi "Giá: hỏi lại", không số tiền nào.
--     Không có giá chủ nhà, mức cộng, số khách, tiện ích.
--   fn_ghi_lan_gui(p_can_ids uuid[], p_tu date, p_den date) returns integer: mỗi căn một lần gửi (căn, đêm p_tu tới trước
--     p_den, lúc gửi) của người gọi; cùng căn cùng đêm đã có lần gửi thì chỉ cập nhật lúc gửi (không thêm dòng).
--   Cả hai lệnh: căn được gửi là căn trong my_shared_can_ids(), căn của chính người gọi chưa ẩn (kể cả căn tự nhập).
--     Có một căn khác (ngoài phạm vi, đã xóa, tự nhập của sale khác) thì từ chối cả lệnh, mã 42501.
--     Danh sách rỗng hay quá 10 căn: từ chối, mã 22023, câu "Mỗi lần gửi tối đa 10 căn" (YC8-H1).
--   Đặt phòng đổi căn hay ngày (after update) sang ít nhất một đêm của lần gửi còn hiệu lực mà trước đó không chạm:
--     thông báo 'can_da_gui_co_nguoi_dat' như khi tạo đặt phòng (YC8-H2).
-- Giá 1509 (DLM): 900.000đ thường, 1.300.000đ cuối tuần. 10/10/2026 là đêm thứ Bảy: 2.200.000đ giá chủ, Hùng +200k: 2.600.000đ.
select t.fixture();

update public.toa_nha set khu_vuc = 'Bãi Cháy' where id = t.toa('icon40');
update public.can set loai_view = 'bien' where id = t.can('1509');
-- Anh Tuấn chia sẻ tất cả căn cho Sale Hùng (để Hùng gửi được Sapphire 1103).
insert into public.ket_noi (id, chu_id, sale_id, trang_thai, nguon, pham_vi, xem_coc)
values ('00000000-0000-0000-0003-000000004801', t.id('tuan'), t.id('hung'), 'da_ket_noi', 'link_moi', 'tat_ca', true);

-- Ảnh: 1509 có 12 ảnh (thứ tự 11 về 0), 3402 không ảnh.
insert into storage.objects (bucket_id, name, owner, metadata)
select 'anh-can', t.id('hoa') || '/1509-' || lpad(i::text, 2, '0') || '.jpg', t.id('hoa'), '{"mimetype":"image/jpeg","size":1}'
from generate_series(0, 11) i;
insert into public.anh_can (can_id, nguoi_tai, duong_dan, thu_tu)
select t.can('1509'), t.id('hoa'), t.id('hoa') || '/1509-' || lpad(i::text, 2, '0') || '.jpg', i
from generate_series(11, 0, -1) i;

-- Căn 1510 của Chị Hoa chỉ có giá đêm 10/10 (dịp đặc biệt một đêm), chưa có giá đêm 11/10.
insert into public.can (id, nguoi_giu, loai, ma_can, so_phong_ngu, so_giuong, toa_nha_id)
values ('00000000-0000-0000-0001-000000001510', t.id('hoa'), 'co_lich', '1510', 1, 1, t.toa('icon40'));
insert into public.gia_dip (can_id, tu_ngay, den_ngay, ten, gia, la_ngay_le)
values ('00000000-0000-0000-0001-000000001510', '2026-10-10', '2026-10-10', 'Dịp một đêm', 1000000, false);

-- Gọi lệnh soạn tin bằng vai hiện tại; lỗi thì null (in lỗi ra NOTICE).
create or replace function pg_temp.st(p_can uuid[], p_tu date default '2026-10-10', p_den date default '2026-10-12')
returns jsonb language plpgsql as $$
declare v jsonb;
begin
  select public.fn_soan_tin_gui_khach(p_can, p_tu, p_den) into v;
  return v;
exception when others then
  raise notice 'lỗi: % (fn_soan_tin_gui_khach)', sqlerrm;
  return null;
end $$;

-- Khối của một căn trong kết quả soạn tin.
create or replace function pg_temp.khoi(v jsonb, p_can uuid) returns jsonb language sql as $$
  select k from jsonb_array_elements(v -> 'can') k where k ->> 'can_id' = p_can::text
$$;

-- Số lần gửi (đọc bằng chủ database) của một sale cho một căn và đêm.
create or replace function pg_temp.so_lan(p_sale uuid, p_can uuid, p_tu date default '2026-10-10', p_den date default '2026-10-12')
returns bigint language sql security definer as $$
  select count(*) from public.lan_gui_khach where sale_id = p_sale and can_id = p_can and dem = daterange(p_tu, p_den)
$$;

-- Số thông báo "căn đã gửi có người đặt" của một người cho một căn (đọc bằng chủ database).
create or replace function pg_temp.so_tb(p_nguoi uuid, p_can uuid) returns bigint language sql security definer as $$
  select count(*) from public.thong_bao where nguoi_nhan = p_nguoi and loai = 'can_da_gui_co_nguoi_dat' and doi_tuong_id = p_can
$$;

-- ===== Danh mục =====
select t.ok((select bool_and(p.prosecdef) and count(*) = 2 from pg_proc p
             where p.pronamespace = 'public'::regnamespace and p.proname in ('fn_soan_tin_gui_khach', 'fn_ghi_lan_gui')),
            'YC8.1 KT-DB.3.3 có fn_soan_tin_gui_khach, fn_ghi_lan_gui chạy security definer');
select t.ok((select bool_and(exists (select 1 from unnest(p.proconfig) c where c like 'search_path=%')) from pg_proc p
             where p.pronamespace = 'public'::regnamespace and p.proname in ('fn_soan_tin_gui_khach', 'fn_ghi_lan_gui')),
            'YC8.1 KT-DB.3.3 hai lệnh đặt search_path');
select t.ok(exists (select 1 from pg_proc p where p.proname = 'fn_soan_tin_gui_khach' and p.pronamespace = 'public'::regnamespace)
            and not exists (select 1 from pg_proc p where p.pronamespace = 'public'::regnamespace
                              and p.proname in ('fn_soan_tin_gui_khach', 'fn_ghi_lan_gui')
                              and has_function_privilege('anon', p.oid, 'execute')),
            'YC8.1 PQ12.LINK KT-DB.3.1 người chưa đăng nhập không gọi được hai lệnh');
select t.ok(not has_table_privilege('authenticated', 'public.lan_gui_khach', 'insert')
            and not has_table_privilege('authenticated', 'public.lan_gui_khach', 'update')
            and not has_table_privilege('authenticated', 'public.lan_gui_khach', 'delete'),
            'YC8.1 PQ12.SALE app không ghi thẳng bảng lần gửi');

-- ===== YC8.1 bước 2, 3: Hùng soạn tin 1509, 1103, Villa Tuần Châu cho 10/10 → 12/10 =====
select t.dang_nhap(t.id('hung'));
select t.bang((select jsonb_agg(k ->> 'ma_can') from jsonb_array_elements(
                 pg_temp.st(array[t.can('1509'), t.can('1103'), t.can('villa')]) -> 'can') k),
              '["1509", "1103", "Villa Tuần Châu"]'::jsonb, 'YC8.1 bước 3 YC8.1-NT1 ba khối theo thứ tự gửi lên');
select t.bang((select concat_ws('|', v ->> 'tu', v ->> 'den', v ->> 'so_dem', v ->> 'ten_sale')
               from pg_temp.st(array[t.can('1509')]) v),
              '2026-10-10|2026-10-12|2|Sale Hùng', 'YC8.1 bước 2 khoảng ngày, số đêm, tên sale');
select t.bang(pg_temp.st(array[t.can('1509')]) ->> 'mau_tin',
              'Em gửi anh chị [Số căn] căn còn trống [Ngày] ([Số đêm]):' || chr(10) || '[Danh sách căn]' || chr(10)
              || 'Anh chị ưng căn nào báo em giữ phòng nhé.',
              'YC8.1 bước 7 YC8 Mẫu tin gửi khách: chưa có mẫu riêng thì mẫu mặc định');
select t.thoat();
update public.cai_dat_rieng set mau_tin = 'Mẫu riêng [Danh sách căn]' where nguoi_id = t.id('hung');
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.st(array[t.can('1509')]) ->> 'mau_tin', 'Mẫu riêng [Danh sách căn]',
              'YC8.1 bước 7 YC8 Mẫu tin gửi khách: mẫu của người gọi');
select t.thoat();
update public.cai_dat_rieng set mau_tin = null where nguoi_id = t.id('hung');
select t.dang_nhap(t.id('hung'));

-- YC8.1-NT4: chữ có giá bán 2.600.000đ, dữ liệu trả về không có giá chủ 2.200.000đ (hay giá từng đêm của chủ).
select t.bang(pg_temp.khoi(pg_temp.st(array[t.can('1509')]), t.can('1509')) ->> 'chu',
              'ICON40 1509 · 2PN · 3 giường, view biển Bãi Cháy' || chr(10) || '10/10 → 12/10 (2 đêm): 2.600.000đ',
              'YC8.1-NT4 YC8.1-NT5 chữ 1509 của Hùng: 2PN · 3 giường, giá bán 2.600.000đ');
select t.bang((pg_temp.khoi(pg_temp.st(array[t.can('1509')]), t.can('1509')) ->> 'tong_gia_ban')::bigint, 2600000::bigint,
              'YC8.1-NT4 tổng giá bán 1509 là 2.600.000đ');
select t.ok((select v::text not like '%2200000%' and v::text not like '%2.200.000%'
                    and v::text not like '%1300000%' and v::text not like '%1.300.000%'
                    and v::text not like '%900000%' and v::text not like '%900.000%'
                    and v::text not like '%gia_chu%' and v::text not like '%muc_cong%'
             from pg_temp.st(array[t.can('1509')]) v)
            and pg_temp.st(array[t.can('1509')]) is not null,
            'YC8.1-NT4 PQ5.KHACH dữ liệu trả về không có giá chủ 2.200.000đ, giá đêm của chủ, mức cộng');
select t.ok((select k ->> 'chu' not ilike '%khách%' and k ->> 'chu' not ilike '%bếp%'
             from pg_temp.khoi(pg_temp.st(array[t.can('1509')]), t.can('1509')) k),
            'YC8.1-NT5 chữ không có số khách, không có tiện ích');
-- Căn của Anh Tuấn: không mức cộng riêng, dùng mặc định +400k: 700.000đ x 2 + 800.000đ = 2.200.000đ.
select t.bang(pg_temp.khoi(pg_temp.st(array[t.can('1103')]), t.can('1103')) ->> 'chu',
              'Sapphire 1103 · 3PN · 2 giường' || chr(10) || '10/10 → 12/10 (2 đêm): 2.200.000đ',
              'YC8.1-NT5 QT5.4 chữ 1103: mức cộng mặc định của Hùng, phần chưa nhập (view) thì bỏ');
-- Căn tự nhập của Hùng: 1.400.000đ x 2 + 400.000đ x 2 = 3.600.000đ.
select t.bang(pg_temp.khoi(pg_temp.st(array[t.can('villa')]), t.can('villa')) ->> 'chu',
              'Villa Tuần Châu' || chr(10) || '10/10 → 12/10 (2 đêm): 3.600.000đ',
              'YC8.1 PQ14.SALE căn tự nhập của chính Hùng gửi được, giá bán theo mức cộng');

-- YC8.1-NT15 (phần database), YC8-H6: 12 ảnh, trả tổng 12 và 10 đường dẫn đầu theo thứ tự ảnh.
select t.bang((pg_temp.khoi(pg_temp.st(array[t.can('1509')]), t.can('1509')) ->> 'so_anh')::int, 12,
              'YC8.1 bước 3 YC8-H6 1509 có 12 ảnh');
select t.bang(pg_temp.khoi(pg_temp.st(array[t.can('1509')]), t.can('1509')) -> 'anh',
              (select jsonb_agg(t.id('hoa') || '/1509-' || lpad(i::text, 2, '0') || '.jpg' order by i) from generate_series(0, 9) i),
              'YC8.1 bước 5 YC8-H6 đường dẫn 10 ảnh đầu theo thứ tự ảnh của căn');
select t.bang(pg_temp.khoi(pg_temp.st(array[t.can('3402')]), t.can('3402')) -> 'anh', '[]'::jsonb,
              'YC8.1 bước 3 căn chưa có ảnh: danh sách ảnh rỗng');

-- YC8.1-NT14: 1510 chưa có giá đêm 11/10.
select t.ok((select k ->> 'chu' like '%Giá: hỏi lại%'
                    and k ->> 'chu' !~ '[0-9]{1,3}(\.[0-9]{3})+ ?đ'
                    and k ->> 'tong_gia_ban' is null
                    and k::text not like '%1000000%' and k::text not like '%1.400.000%'
             from pg_temp.khoi(pg_temp.st(array['00000000-0000-0000-0001-000000001510'::uuid]),
                               '00000000-0000-0000-0001-000000001510') k),
            'YC8.1-NT14 YC8-H4 căn chưa có giá đêm 11/10: chữ ghi "Giá: hỏi lại", không có số tiền nào');

-- Soạn tin không ghi gì.
select t.thoat();
select t.bang((select count(*) from public.lan_gui_khach), 0::bigint, 'YC8 Dữ liệu lệnh soạn tin không ghi lần gửi');

-- ===== YC8.1-NT6, PQ3.SALE, PQ14.SALE: căn không được gửi thì từ chối cả lệnh =====
select t.dang_nhap(t.id('lan'));
select t.ok(pg_temp.st(array[t.can('1509')]) is not null, 'YC8.1-NT6 Sale Lan soạn tin 1509 trong phạm vi được');
select t.loi($$select public.fn_soan_tin_gui_khach(array[t.can('1509'), t.can('villa')], '2026-10-10', '2026-10-12')$$, '42501',
             'YC8.1-NT6 PQ14.SALE Sale Lan soạn tin có Villa Tuần Châu của Hùng: từ chối cả lệnh');
select t.loi($$select public.fn_soan_tin_gui_khach(array[t.can('1509'), t.can('3402')], '2026-10-10', '2026-10-12')$$, '42501',
             'YC8.1-NT6 PQ3.SALE Sale Lan soạn tin có 3402 ngoài phạm vi: từ chối cả lệnh');
select t.loi($$select public.fn_ghi_lan_gui(array[t.can('1509'), t.can('villa')], '2026-10-10', '2026-10-12')$$, '42501',
             'YC8.1-NT6 PQ14.SALE Sale Lan ghi lần gửi có Villa Tuần Châu của Hùng: từ chối cả lệnh');
select t.thoat();
select t.bang((select count(*) from public.lan_gui_khach where sale_id = t.id('lan')), 0::bigint,
              'YC8.1-NT6 lệnh bị từ chối không ghi lần gửi nào, kể cả 1509');
update public.can set an_luc = now() where id = t.can('3402');
select t.dang_nhap(t.id('hung'));
select t.loi($$select public.fn_soan_tin_gui_khach(array[t.can('1509'), t.can('3402')], '2026-10-10', '2026-10-12')$$, '42501',
             'YC8.1-NT6 YC3.6 Hùng soạn tin có 3402 đã xóa: từ chối cả lệnh');
select t.loi($$select public.fn_ghi_lan_gui(array[t.can('1509'), t.can('3402')], '2026-10-10', '2026-10-12')$$, '42501',
             'YC8.1-NT6 YC3.6 Hùng ghi lần gửi có 3402 đã xóa: từ chối cả lệnh');
select t.loi($$select public.fn_soan_tin_gui_khach(array[t.can('1509'), null], '2026-10-10', '2026-10-12')$$, '42501',
             'YC8.1-NT6 danh sách có căn rỗng: từ chối cả lệnh');
select t.thoat();
update public.can set an_luc = null where id = t.can('3402');
select t.bang((select count(*) from public.lan_gui_khach), 0::bigint, 'YC8.1-NT6 không lần gửi nào được ghi');

-- ===== YC8.1-NT12, YC8-H1: tối đa 10 căn =====
insert into public.can (id, nguoi_giu, loai, ma_can)
select ('00000000-0000-0000-0001-0000000048' || lpad(i::text, 2, '0'))::uuid, t.id('hoa'), 'co_lich', 'N' || i
from generate_series(1, 11) i;
select t.dang_nhap(t.id('hung'));
select t.loi($$select public.fn_soan_tin_gui_khach(
               (select array_agg(('00000000-0000-0000-0001-0000000048' || lpad(i::text, 2, '0'))::uuid) from generate_series(1, 11) i),
               '2026-10-10', '2026-10-12')$$, 'Mỗi lần gửi tối đa 10 căn%',
             'YC8.1-NT12 YC8-H1 lệnh soạn tin 11 căn: từ chối cả lệnh');
select t.loi($$select public.fn_soan_tin_gui_khach(
               (select array_agg(('00000000-0000-0000-0001-0000000048' || lpad(i::text, 2, '0'))::uuid) from generate_series(1, 11) i),
               '2026-10-10', '2026-10-12')$$, '22023', 'YC8.1-NT12 lệnh soạn tin 11 căn: mã 22023');
select t.loi($$select public.fn_ghi_lan_gui(
               (select array_agg(('00000000-0000-0000-0001-0000000048' || lpad(i::text, 2, '0'))::uuid) from generate_series(1, 11) i),
               '2026-10-10', '2026-10-12')$$, '22023', 'YC8.1-NT12 lệnh ghi lần gửi 11 căn: từ chối');
select t.bang(jsonb_array_length(pg_temp.st(
                (select array_agg(('00000000-0000-0000-0001-0000000048' || lpad(i::text, 2, '0'))::uuid) from generate_series(1, 10) i)) -> 'can'),
              10, 'YC8.1-NT12 lệnh soạn tin 10 căn được');
select t.loi($$select public.fn_soan_tin_gui_khach('{}'::uuid[], '2026-10-10', '2026-10-12')$$, '22023',
             'YC8.1 lệnh soạn tin không có căn nào: từ chối');
select t.loi($$select public.fn_soan_tin_gui_khach(array[t.can('1509')], '2026-10-12', '2026-10-10')$$, 'P0001',
             'YC8.1 khoảng ngày ngược: từ chối');

-- ===== YC8.1-NT2, NT13: ghi lần gửi =====
select t.bang(t.gt($$public.fn_ghi_lan_gui(array[t.can('1509')], '2026-10-10', '2026-10-12')$$), '1',
              'YC8.1-NT2 Hùng bấm "Chia sẻ chữ" ở khối 1509: ghi một lần gửi');
select t.thoat();
select t.bang(pg_temp.so_lan(t.id('hung'), t.can('1509')), 1::bigint,
              'YC8.1-NT2 database có một lần gửi 1509 cho đêm 10/10, 11/10');
select t.dang_nhap(t.id('hung'));
select t.gt($$public.fn_ghi_lan_gui(array[t.can('1509')], '2026-10-10', '2026-10-12')$$);
select t.thoat();
select t.bang(pg_temp.so_lan(t.id('hung'), t.can('1509')), 1::bigint,
              'YC8.1-NT13 bấm "Sao chép chữ" (hay "Gửi ảnh") sau "Chia sẻ chữ" ở khối 1509: vẫn một lần gửi 1509 cho 10/10, 11/10');
select t.dang_nhap(t.id('hung'));
select t.bang(t.gt($$public.fn_ghi_lan_gui(array[t.can('1509'), t.can('1103'), t.can('villa')], '2026-10-10', '2026-10-12')$$), '3',
              'YC8.1-NT13 bấm "Sao chép chữ cả 3 căn": ghi cho 3 căn');
select t.thoat();
select t.ok(pg_temp.so_lan(t.id('hung'), t.can('1509')) = 1 and pg_temp.so_lan(t.id('hung'), t.can('1103')) = 1
            and pg_temp.so_lan(t.id('hung'), t.can('villa')) = 1,
            'YC8.1-NT13 database có lần gửi cho cả 3 căn, mỗi căn một dòng');

-- ===== YC8.1-NT7, PQ12: lần gửi chỉ sale đó đọc =====
select t.dang_nhap(t.id('hung'));
select t.bang(t.so('select * from public.lan_gui_khach'), 3::bigint, 'YC8.1 PQ12.SALE Hùng đọc được 3 lần gửi của mình');
select t.dang_nhap(t.id('hoa'));
select t.bang(coalesce(t.so('select * from public.lan_gui_khach'), 0), 0::bigint,
              'YC8.1-NT7 PQ12.CHU Chị Hoa không đọc được lần gửi khách của Hùng');
select t.dang_nhap(t.id('lan'));
select t.bang(coalesce(t.so('select * from public.lan_gui_khach'), 0), 0::bigint,
              'YC8.1-NT7 PQ12.SALE Sale Lan không đọc được lần gửi khách của Hùng');
select t.khach();
select t.bang(coalesce(t.so('select * from public.lan_gui_khach'), 0), 0::bigint,
              'YC8.1-NT7 PQ12.LINK người chưa đăng nhập không đọc được lần gửi');
select t.thoat();

-- ===== YC8.1-NT8 đến NT11, NT16: báo căn đã gửi có người đặt =====
-- Ngày tương đối với hôm nay: T = hôm nay + 40. Hùng gửi Sapphire 1103 cho T → T+2.
delete from public.lan_gui_khach;
select set_config('t.ngay', (public.local_today() + 40)::text, true);
create or replace function pg_temp.n(i int) returns date language sql as $$
  select current_setting('t.ngay')::date + i
$$;
select t.dang_nhap(t.id('hung'));
select t.gt(format('public.fn_ghi_lan_gui(array[%L::uuid], %L::date, %L::date)', t.can('1103'), pg_temp.n(0), pg_temp.n(2)));
select t.thoat();
-- Anh Tuấn ghi một đặt phòng cho 1103 đêm T+1.
select t.tao_booking('B48A', t.can('1103'), pg_temp.n(1), pg_temp.n(2), 700000);
select t.bang(pg_temp.so_tb(t.id('hung'), t.can('1103')), 1::bigint,
              'YC8.1-NT8 Hùng có đúng một thông báo khi Anh Tuấn ghi đặt phòng chiếm đêm của lần gửi');
select t.bang((select noi_dung - 'lan_gui_id' from public.thong_bao
               where nguoi_nhan = t.id('hung') and loai = 'can_da_gui_co_nguoi_dat'),
              jsonb_build_object('ten_toa', 'Sapphire', 'ma_can', '1103', 'ngay_nhan', pg_temp.n(0), 'ngay_tra', pg_temp.n(2)),
              'YC8.1-NT8 QD11 PQ19.SALE thông báo "Sapphire 1103 · T → T+2", không tên người đặt, không giá');
select t.bang(pg_temp.so_tb(t.id('tuan'), t.can('1103')), 0::bigint, 'YC8.1-NT8 Anh Tuấn không có thông báo này');
select t.dang_nhap(t.id('tuan'));
select t.bang(coalesce(t.so($$select * from public.thong_bao where loai = 'can_da_gui_co_nguoi_dat'$$), 0), 0::bigint,
              'YC8.1-NT8 PQ19 Anh Tuấn không đọc được thông báo của Hùng');
select t.dang_nhap(t.id('hung'));
select t.bang(t.so($$select * from public.thong_bao where loai = 'can_da_gui_co_nguoi_dat'$$), 1::bigint,
              'YC8.1-NT8 PQ19.SALE Hùng đọc được thông báo của mình');
select t.thoat();

-- YC8.1-NT11: đặt phòng thứ hai chiếm đêm T của cùng lần gửi: vẫn một thông báo.
select t.tao_booking('B48B', t.can('1103'), pg_temp.n(0), pg_temp.n(1), 700000);
select t.bang(pg_temp.so_tb(t.id('hung'), t.can('1103')), 1::bigint,
              'YC8.1-NT11 hai đặt phòng mới cùng chiếm đêm của một lần gửi: chỉ một thông báo');

-- YC8.1-NT9: chính Hùng có đặt phòng mới (chủ nhà ghi đặt phòng có Hùng đứng tên): không báo.
delete from public.thong_bao; delete from public.lan_gui_khach;
select t.dang_nhap(t.id('hung'));
select t.gt(format('public.fn_ghi_lan_gui(array[%L::uuid], %L::date, %L::date)', t.can('1509'), pg_temp.n(0), pg_temp.n(2)));
select t.thoat();
select t.tao_booking('B48C', t.can('1509'), pg_temp.n(0), pg_temp.n(2), 2200000, t.id('hung'));
select t.bang(pg_temp.so_tb(t.id('hung'), t.can('1509')), 0::bigint,
              'YC8.1-NT9 chính Hùng là người có đặt phòng mới: Hùng không có thông báo');

-- YC8.1-NT10: lần gửi có ngày nhận đã qua (hôm nay - 2 → hôm nay + 1), đặt phòng mới tạo hôm nay: không báo.
delete from public.thong_bao; delete from public.lan_gui_khach;
select t.dang_nhap(t.id('hung'));
select t.gt(format('public.fn_ghi_lan_gui(array[%L::uuid], %L::date, %L::date)', t.can('1103'),
                   public.local_today() - 2, public.local_today() + 1));
select t.thoat();
select t.tao_booking('B48D', t.can('1103'), public.local_today(), public.local_today() + 1, 700000);
select t.bang(pg_temp.so_tb(t.id('hung'), t.can('1103')), 0::bigint,
              'YC8.1-NT10 đặt phòng mới tạo sau ngày nhận của lần gửi: không có thông báo');

-- YC8.1-NT16, YC8-H2: Anh Tuấn đổi đặt phòng 1103 từ T+4 → T+5 sang T+1 → T+2: một thông báo; sang T+3 → T+4: không.
delete from public.thong_bao; delete from public.lan_gui_khach;
update public.booking set trang_thai = 'da_huy' where id in (t.b('B48A'), t.b('B48B'));
select t.tao_booking('B48E', t.can('1103'), pg_temp.n(4), pg_temp.n(5), 700000);
select t.dang_nhap(t.id('hung'));
select t.gt(format('public.fn_ghi_lan_gui(array[%L::uuid], %L::date, %L::date)', t.can('1103'), pg_temp.n(0), pg_temp.n(2)));
select t.thoat();
select t.bang(pg_temp.so_tb(t.id('hung'), t.can('1103')), 0::bigint, 'YC8.1-NT16 trước khi đổi ngày chưa có thông báo');
update public.booking set ngay_nhan = pg_temp.n(3), ngay_tra = pg_temp.n(4) where id = t.b('B48E');
select t.bang(pg_temp.so_tb(t.id('hung'), t.can('1103')), 0::bigint,
              'YC8.1-NT16 đổi đặt phòng sang T+3 → T+4 (không chạm đêm của lần gửi): không có thông báo');
update public.booking set ngay_nhan = pg_temp.n(1), ngay_tra = pg_temp.n(2) where id = t.b('B48E');
select t.bang(pg_temp.so_tb(t.id('hung'), t.can('1103')), 1::bigint,
              'YC8.1-NT16 đổi đặt phòng sang T+1 → T+2: Hùng có đúng một thông báo');
select t.bang((select noi_dung - 'lan_gui_id' from public.thong_bao
               where nguoi_nhan = t.id('hung') and loai = 'can_da_gui_co_nguoi_dat'),
              jsonb_build_object('ten_toa', 'Sapphire', 'ma_can', '1103', 'ngay_nhan', pg_temp.n(0), 'ngay_tra', pg_temp.n(2)),
              'YC8.1-NT16 thông báo "Sapphire 1103 · T → T+2 vừa có người đặt", chỉ căn và ngày');
update public.booking set ngay_nhan = pg_temp.n(0), ngay_tra = pg_temp.n(2) where id = t.b('B48E');
select t.bang(pg_temp.so_tb(t.id('hung'), t.can('1103')), 1::bigint,
              'YC8.1-NT16 đổi tiếp trong đêm của lần gửi: vẫn một thông báo');
select t.bang(pg_temp.so_tb(t.id('tuan'), t.can('1103')), 0::bigint, 'YC8.1-NT16 Anh Tuấn không có thông báo này');
