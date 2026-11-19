-- US45 · Kết quả tìm phòng (YC7.3). Viết trước code (US45-TA1, CL14.5): task sau không sửa file này.
-- Hợp đồng database dùng cho S2, S4 (YC7 "Dữ liệu", thiet-ke-db.md mục 3 bất biến 3, 5, 6, 7):
--   S2 lấy từ fn_sale_tim (US44): {"so_can_trong", "can": [{can_id, nhom, ma_can, ten_toa, ten_chu, so_phong_ngu,
--   loai_view, lich_doi_luc, tong_gia_chu, tong_gia_ban, khong_co_lich}], "goi_y"}. so_can_trong không đếm căn tự nhập.
--   S4 lấy từ fn_sale_lich (US43) bảy ngày từ ngày nhận, chỉ giữ các căn của kết quả tìm (cùng điều kiện).
--   tong_gia_ban: giá chủ mỗi đêm + mức cộng riêng căn, không có thì mức cộng mặc định (QT5.4, GD13).
select t.fixture();

-- "Hôm nay" là 06/10/2026 (thay local_today() trong giao dịch của file này, như 51_us19_xoa_can.sql).
create or replace function pg_temp.hom_nay(p_ngay date) returns void language plpgsql as $hn$
begin
  execute format('create or replace function public.local_today() returns date '
                 'language sql stable security definer set search_path = '''' as $b$ select date %L $b$', p_ngay);
end $hn$;
select pg_temp.hom_nay('2026-10-06');

-- Dữ liệu theo canvas S2 (DLM): Green Bay 0812 của Sale Hùng; À La Carte 2208 của Anh Tuấn; Anh Tuấn kết nối Hùng (tất cả
-- căn) và Lan (rồi ngừng). Căn A9 của Chị Hoa đã xóa; Mường Thanh 1605 của Hùng kín đêm 10/10.
insert into public.toa_nha (id, ten, home247_dat_san, tao_boi) values
  ('00000000-0000-0000-0002-000000045001', 'Green Bay', true, null),
  ('00000000-0000-0000-0002-000000045002', 'À La Carte', true, null),
  ('00000000-0000-0000-0002-000000045003', 'Mường Thanh', true, null);
insert into public.can (id, nguoi_giu, loai, ma_can, so_phong_ngu, loai_view, toa_nha_id) values
  ('00000000-0000-0000-0001-000000450812', t.id('hung'), 'co_lich', '0812', 2, 'bien', '00000000-0000-0000-0002-000000045001'),
  ('00000000-0000-0000-0001-000000451605', t.id('hung'), 'co_lich', '1605', 1, 'bien', '00000000-0000-0000-0002-000000045003'),
  ('00000000-0000-0000-0001-000000452208', t.id('tuan'), 'co_lich', '2208', 1, 'bien', '00000000-0000-0000-0002-000000045002'),
  ('00000000-0000-0000-0001-0000004500a9', t.id('hoa'), 'co_lich', 'A9', 2, 'bien', t.toa('icon40'));
update public.can set loai_view = 'bien' where id in (t.can('1509'), t.can('3402'));
update public.can set loai_view = 'thanh_pho' where id = t.can('1103');
insert into public.gia_thang (can_id, thang, gia_thuong, gia_cuoi_tuan) values
  ('00000000-0000-0000-0001-000000450812', '2026-10-01', 750000, 900000),
  ('00000000-0000-0000-0001-000000452208', '2026-10-01', 1500000, 1500000),
  ('00000000-0000-0000-0001-0000004500a9', '2026-10-01', 500000, 500000);
update public.can set an_luc = now() where id = '00000000-0000-0000-0001-0000004500a9';
insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon, pham_vi, xem_coc) values
  (t.id('tuan'), t.id('hung'), 'da_ket_noi', 'link_moi', 'tat_ca', true),
  (t.id('tuan'), t.id('lan'), 'da_ket_noi', 'link_moi', 'tat_ca', true);
select t.dang_nhap(t.id('tuan'));
select t.bang(t.gt(format('public.fn_ngung_cho_xem(%L)',
                          (select id from public.ket_noi where chu_id = t.id('tuan') and sale_id = t.id('lan')))),
              'chu_ngung', 'YC7.3 Anh Tuấn ngừng cho Sale Lan xem');
select t.thoat();
select t.tao_booking('MT', '00000000-0000-0000-0001-000000451605', '2026-10-10', '2026-10-11', 700000);

-- Gọi lệnh tìm bằng vai hiện tại; lỗi thì in NOTICE và trả null.
create or replace function pg_temp.tim(p_tu date, p_den date) returns jsonb
language plpgsql as $$
begin
  return public.fn_sale_tim(p_tu, p_den);
exception when others then
  raise notice 'lỗi: % % (fn_sale_tim)', sqlstate, sqlerrm;
  return null;
end $$;

-- Mã căn trong kết quả theo nhóm ('*' là mọi nhóm), sắp theo mã.
create or replace function pg_temp.ma(p_kq jsonb, p_nhom text default '*') returns text language sql as $$
  select coalesce(string_agg(c ->> 'ma_can', ',' order by c ->> 'ma_can'), '')
  from jsonb_array_elements(coalesce(p_kq -> 'can', '[]')) c
  where p_nhom = '*' or c ->> 'nhom' = p_nhom
$$;

-- Một trường của một căn trong kết quả.
create or replace function pg_temp.truong(p_kq jsonb, p_ma text, p_truong text) returns text language sql as $$
  select c ->> p_truong from jsonb_array_elements(coalesce(p_kq -> 'can', '[]')) c where c ->> 'ma_can' = p_ma
$$;

-- ===== Danh mục (KT-DB.3.3) =====
select t.ok(not exists (select 1 from pg_proc p where p.proname in ('fn_sale_tim', 'fn_sale_lich')
                          and p.pronamespace = 'public'::regnamespace
                          and (not p.prosecdef or p.proconfig::text not like '%search_path=%'
                               or has_function_privilege('anon', p.oid, 'execute'))),
            'YC7.3 KT-DB.3.3 lệnh tìm, lệnh lịch của S2, S4 chạy security definer, đặt search_path, anon không gọi được');
select t.khach();
select t.loi($$select public.fn_sale_tim('2026-10-10', '2026-10-12')$$, '42501',
             'YC7.3 PQ4.LINK người chưa đăng nhập không lấy được kết quả tìm');
select t.thoat();

-- ===== YC7.3-NT1: 5 căn trống, 1 ở "CỦA TÔI", 4 ở "NGUỒN PHÒNG", Villa Tuần Châu riêng =====
select t.dang_nhap(t.id('hung'));
create temp table kq as select pg_temp.tim('2026-10-10', '2026-10-12') as kq;
select t.bang(((select kq from kq) ->> 'so_can_trong')::int, 5,
              'YC7.3-NT1 Sale Hùng tìm 10/10 → 12/10 ngày 06/10: "5 căn trống"');
select t.bang(pg_temp.ma((select kq from kq), 'cua_toi'), '0812',
              'YC7.3-NT1 nhóm "CỦA TÔI" có 1 căn: Green Bay 0812 (Mường Thanh 1605 kín đêm 10/10)');
select t.bang(pg_temp.ma((select kq from kq), 'nguon'), '1103,1509,2208,3402',
              'YC7.3-NT1 nhóm "NGUỒN PHÒNG" có 4 căn: Sapphire 1103, ICON40 1509, À La Carte 2208, 3402');
select t.bang(pg_temp.ma((select kq from kq), 'tu_nhap'), 'Villa Tuần Châu',
              'YC7.3-NT1 QT6.4 Villa Tuần Châu ở nhóm "TỰ NHẬP · chưa biết lịch"');
select t.bang((select count(*)::int from jsonb_array_elements((select kq from kq) -> 'can') c where c ->> 'nhom' <> 'tu_nhap'),
              ((select kq from kq) ->> 'so_can_trong')::int,
              'YC7.3-NT1 QT6.4 căn tự nhập không tính vào số căn trống');
select t.bang(pg_temp.truong((select kq from kq), 'Villa Tuần Châu', 'khong_co_lich') || '|'
              || coalesce(pg_temp.truong((select kq from kq), 'Villa Tuần Châu', 'tong_gia_ban'), '-') || '|'
              || coalesce(pg_temp.truong((select kq from kq), 'Villa Tuần Châu', 'ten_chu'), '-'),
              'true|-|Chú Bình', 'YC7.3-NT5 QT6.4 căn tự nhập có cờ không có lịch, không giá, có tên chủ căn để gợi ý gọi');
select t.bang((select string_agg(c ->> 'nhom', ',' order by n)
               from jsonb_array_elements((select kq from kq) -> 'can') with ordinality x(c, n)),
              'cua_toi,nguon,nguon,nguon,nguon,tu_nhap',
              'YC7.3 Quy tắc "Căn của tôi đứng đầu": căn của tôi trước, nguồn phòng, rồi căn tự nhập');
-- Độ tươi: căn của chủ nhà có lúc lịch đổi đúng của căn; căn của tôi, căn tự nhập không có (màn ghi câu riêng).
select t.ok(pg_temp.truong((select kq from kq), '1509', 'lich_doi_luc')::timestamptz
              = (select lich_doi_luc from public.can where id = t.can('1509')),
            'YC7.3 bước 3 thẻ 1509 có lúc lịch đổi của căn');
select t.bang(coalesce(pg_temp.truong((select kq from kq), '0812', 'lich_doi_luc'), '-') || '|'
              || coalesce(pg_temp.truong((select kq from kq), 'Villa Tuần Châu', 'lich_doi_luc'), '-'),
              '-|-', 'YC7.3 bước 3 căn của tôi, căn tự nhập không có lúc lịch đổi');
select t.bang(pg_temp.truong((select kq from kq), '0812', 'tong_gia_chu') || '|' || pg_temp.truong((select kq from kq), '0812', 'tong_gia_ban'),
              '1650000|1650000', 'YC7.3 bước 1 căn của tôi Green Bay 0812: giá của chính sale, không cộng (900k thứ Bảy + 750k)');
select t.ok(pg_temp.truong((select kq from kq), '2208', 'ten_chu') = 'Anh Tuấn'
            and pg_temp.truong((select kq from kq), '2208', 'ten_toa') = 'À La Carte'
            and pg_temp.truong((select kq from kq), '2208', 'loai_view') = 'bien'
            and pg_temp.truong((select kq from kq), '2208', 'so_phong_ngu') = '1',
            'YC7.3 bước 1 thẻ À La Carte 2208 có tòa, số phòng ngủ, chủ nhà, view');
select t.ok(not exists (select 1 from jsonb_array_elements((select kq from kq) -> 'can') c, jsonb_object_keys(c) k
                        where k ilike any (array['%khach%', '%dat%', '%booking%', '%tien_phong%', '%coc%', '%sdt%', '%dien_thoai%'])),
            'YC7.3 KT-DB.3.5 KT-DB.3.6 kết quả không có người đặt, khách, tiền phòng, tiền cọc, số điện thoại');
select t.thoat();

-- ===== YC7.3-NT2: mức cộng mặc định +400k, thẻ 1509 "2.200.000đ · bạn bán 3.000.000đ" =====
-- 1509 10/10 (thứ Bảy, cuối tuần) 1.300.000đ + 11/10 900.000đ = 2.200.000đ. Hùng không có mức cộng riêng cho 1509 thì dùng
-- mức cộng mặc định: (1.300.000 + 400.000) + (900.000 + 400.000) = 3.000.000đ.
delete from public.muc_cong where sale_id = t.id('hung') and can_id = t.can('1509');
select t.dang_nhap(t.id('hung'));
create temp table kq2 as select pg_temp.tim('2026-10-10', '2026-10-12') as kq;
select t.bang(pg_temp.truong((select kq from kq2), '1509', 'tong_gia_chu') || '|' || pg_temp.truong((select kq from kq2), '1509', 'tong_gia_ban'),
              '2200000|3000000', 'YC7.3-NT2 QT5.4 Hùng mức cộng mặc định +400k: 1509 giá chủ 2.200.000đ, bạn bán 3.000.000đ');
select t.bang(pg_temp.truong((select kq from kq2), '2208', 'tong_gia_chu') || '|' || pg_temp.truong((select kq from kq2), '2208', 'tong_gia_ban'),
              '3000000|3800000', 'YC7.3-NT2 QT5.4 À La Carte 2208 cũng dùng mức cộng mặc định: 3.000.000đ, bán 3.800.000đ');
select t.thoat();
-- Mức cộng riêng căn thắng mức mặc định (như US44): +200k thì bán 2.600.000đ.
insert into public.muc_cong (sale_id, can_id, muc) values (t.id('hung'), t.can('1509'), 200000);
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.truong(pg_temp.tim('2026-10-10', '2026-10-12'), '1509', 'tong_gia_ban'), '2600000',
              'YC7.3-NT2 QT5.4 có mức cộng riêng +200k cho 1509 thì bán 2.600.000đ');
select t.thoat();
-- Bật làm tròn 50.000đ: làm tròn từng đêm rồi cộng (GD13). Mức cộng 425.000đ: 1.725.000 → 1.750.000, 1.325.000 → 1.350.000.
delete from public.muc_cong where sale_id = t.id('hung') and can_id = t.can('1509');
update public.cai_dat_rieng set muc_cong_mac_dinh = 425000, lam_tron_50k = true where nguoi_id = t.id('hung');
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.truong(pg_temp.tim('2026-10-10', '2026-10-12'), '1509', 'tong_gia_ban'), '3100000',
              'YC7.3-NT2 QT5.4 GD13 làm tròn lên 50.000đ từng đêm rồi cộng: 3.100.000đ');
select t.thoat();
update public.cai_dat_rieng set muc_cong_mac_dinh = 400000, lam_tron_50k = false where nguoi_id = t.id('hung');
-- Đêm chưa có giá thì không có tổng (màn ghi "Chưa có giá"): 1509 chưa có giá tháng 1/2027.
select t.dang_nhap(t.id('hung'));
select t.bang(coalesce(pg_temp.truong(pg_temp.tim('2026-12-31', '2027-01-02'), '1509', 'tong_gia_chu'), '-') || '|'
              || coalesce(pg_temp.truong(pg_temp.tim('2026-12-31', '2027-01-02'), '1509', 'tong_gia_ban'), '-'),
              '-|-', 'YC7.3 bước 2 PQ11.SALE khoảng có đêm chưa có giá: không có tổng giá chủ, tổng giá bán');
select t.thoat();

-- ===== YC7.3 bước 5: S4 dùng cùng tập căn, bảy ngày từ ngày nhận =====
select t.dang_nhap(t.id('hung'));
create temp table lich as
  select l.* from public.fn_sale_lich('2026-10-10', '2026-10-17') l
  where l.can_id in (select (c ->> 'can_id')::uuid from jsonb_array_elements((select kq from kq) -> 'can') c);
select t.bang((select count(distinct can_id)::int from lich),
              jsonb_array_length((select kq from kq) -> 'can'),
              'YC7.3-NT4 S4 có đúng các căn của kết quả tìm (5 căn trống và căn tự nhập)');
select t.bang((select string_agg(o, ',' order by dem) from lich where ma_can = 'Villa Tuần Châu'),
              'chua_biet,chua_biet,chua_biet,chua_biet,chua_biet,chua_biet,chua_biet',
              'YC7.3 bước 5 QT6.4 hàng Villa Tuần Châu ở S4 là "?" cả bảy ngày, không bao giờ trống');
select t.bang((select string_agg(o, ',' order by dem) from lich where ma_can = '1509' and dem < '2026-10-12'),
              'trong,trong', 'YC7.3 bước 5 QT2.1 đêm khách hỏi của căn trống trong kết quả đều trống ở S4');
select t.bang((select gia_ban from lich where ma_can = '1509' and dem = '2026-10-10'), 1700000::bigint,
              'YC7.3 bước 5 QT5.4 ô S4 ghi giá bán một đêm (1.300.000đ + 400k mặc định)');
select t.thoat();

-- ===== Ai được làm gì: sale bị ngừng, chưa kết nối, ngoài phạm vi, căn đã xóa, chủ nhà xóa tài khoản =====
select t.dang_nhap(t.id('lan'));
create temp table kq_lan as select pg_temp.tim('2026-10-10', '2026-10-12') as kq;
select t.bang(pg_temp.ma((select kq from kq_lan)), '1509',
              'YC7.3 PQ3.SALE Sale Lan (chỉ được 1509) tìm 10/10 → 12/10: kết quả chỉ có 1509');
select t.ok(pg_temp.ma((select kq from kq_lan)) not like '%3402%',
            'YC7.3 PQ3.SALE căn ngoài phạm vi (3402) không có trong kết quả của Lan');
select t.ok(pg_temp.ma((select kq from kq_lan)) not like '%1103%' and pg_temp.ma((select kq from kq_lan)) not like '%2208%',
            'YC7.3 PQ4.SALE Anh Tuấn ngừng cho Lan xem: 1103, 2208 không có trong kết quả của Lan');
select t.ok(pg_temp.ma((select kq from kq_lan)) not like '%A9%' and pg_temp.ma((select kq from kq)) not like '%A9%',
            'YC7.3 PQ3.SALE căn A9 đã xóa không có trong kết quả của Lan, của Hùng');
select t.ok(pg_temp.ma((select kq from kq_lan)) !~ '0812|1605|Villa',
            'YC7.3 PQ13.SALE PQ14.SALE căn của tôi, căn tự nhập của Sale Hùng không có trong kết quả của Sale Lan');
select t.bang((select count(distinct can_id)::int from public.fn_sale_lich('2026-10-10', '2026-10-17')
               where can_id not in (t.can('1509'))), 0,
              'YC7.3 PQ13.SALE PQ14.SALE lịch tuần (S4) của Lan chỉ có 1509');
select t.bang(pg_temp.truong((select kq from kq_lan), '1509', 'tong_gia_ban'), pg_temp.truong((select kq from kq_lan), '1509', 'tong_gia_chu'),
              'YC7.3 PQ11.SALE Lan không có mức cộng: giá bán bằng giá chủ, không dùng mức cộng của Hùng');
select t.thoat();
select t.dang_nhap(t.id('nga'));
select t.bang(pg_temp.ma(pg_temp.tim('2026-10-10', '2026-10-12')) || '|' || (pg_temp.tim('2026-10-10', '2026-10-12') ->> 'so_can_trong'),
              '|0', 'YC7.3 PQ4.SALE Sale Nga chưa kết nối: kết quả rỗng, 0 căn trống');
select t.thoat();
-- Chị Hoa xóa tài khoản: Hùng mất 1509, 3402 ở kết quả và ở S4.
update public.profiles set da_xoa_luc = now(), so_dien_thoai = null where id = t.id('hoa');
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.ma(pg_temp.tim('2026-10-10', '2026-10-12'), 'nguon'), '1103,2208',
              'YC7.3 PQ23.SALE Chị Hoa xóa tài khoản: kết quả của Hùng không còn 1509, 3402');
select t.bang((select count(*)::int from public.fn_sale_lich('2026-10-10', '2026-10-17') where can_id in (t.can('1509'), t.can('3402'))), 0,
              'YC7.3 PQ23.SALE Chị Hoa xóa tài khoản: lịch tuần của Hùng không còn 1509, 3402');
select t.thoat();
update public.profiles set da_xoa_luc = null, so_dien_thoai = '0900000001' where id = t.id('hoa');
-- Anh Tuấn ngừng cho Hùng xem: 1103, 2208 mất khỏi kết quả.
select t.dang_nhap(t.id('tuan'));
select t.gt(format('public.fn_ngung_cho_xem(%L)', (select id from public.ket_noi where chu_id = t.id('tuan') and sale_id = t.id('hung'))));
select t.thoat();
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.ma(pg_temp.tim('2026-10-10', '2026-10-12'), 'nguon') || '|' || (pg_temp.tim('2026-10-10', '2026-10-12') ->> 'so_can_trong'),
              '1509,3402|3', 'YC7.3 PQ4.SALE Hùng bị Anh Tuấn ngừng: không còn 1103, 2208; 3 căn trống');
select t.thoat();

-- ===== Mức cộng, giá bán: sale khác không đổi được, chủ nhà không đọc được =====
select t.dang_nhap(t.id('lan'));
select t.ok(coalesce(t.so($$select 1 from public.muc_cong where sale_id = t.id('hung')$$), 0) = 0
            and coalesce(t.so($$select 1 from public.cai_dat_rieng where nguoi_id = t.id('hung')$$), 0) = 0,
            'YC7.3 PQ11.SALE Sale Lan không đọc mức cộng, cài đặt của Hùng');
-- Lan thử sửa mức cộng mặc định, mức cộng riêng của Hùng (bị từ chối hay không trúng dòng nào); kết quả kiểm sau t.thoat().
select t.ma_loi($$update public.cai_dat_rieng set muc_cong_mac_dinh = 0 where nguoi_id = t.id('hung')$$);
select t.ma_loi($$update public.muc_cong set muc = 0 where sale_id = t.id('hung')$$);
select t.ok(t.ma_loi(format($q$insert into public.muc_cong (sale_id, can_id, muc) values (%L, %L, 1)$q$, t.id('hung'), t.can('1509'))) is not null,
            'YC7.3 PQ11.SALE Sale Lan không ghi được mức cộng cho Hùng');
select t.thoat();
select t.bang((select muc_cong_mac_dinh from public.cai_dat_rieng where nguoi_id = t.id('hung')), 400000::bigint,
              'YC7.3 PQ11.SALE Sale Lan không đổi được mức cộng mặc định của Hùng: vẫn +400k');
select t.dang_nhap(t.id('hoa'));
select t.ok(coalesce(t.so('select 1 from public.muc_cong'), 0) = 0
            and coalesce(t.so($$select 1 from public.cai_dat_rieng where nguoi_id = t.id('hung')$$), 0) = 0,
            'YC7.3 PQ11.CHU Chị Hoa không đọc mức cộng của Hùng');
select t.bang(coalesce(pg_temp.ma(pg_temp.tim('2026-10-12', '2026-10-13'), 'nguon'), ''), '',
              'YC7.3 PQ11.CHU Chị Hoa gọi lệnh tìm không nhận căn nguồn hay giá bán của sale nào');
select t.bang(pg_temp.truong(pg_temp.tim('2026-10-12', '2026-10-13'), '1509', 'tong_gia_ban'),
              pg_temp.truong(pg_temp.tim('2026-10-12', '2026-10-13'), '1509', 'tong_gia_chu'),
              'YC7.3 PQ11.CHU kết quả của Chị Hoa cho 1509 chỉ là giá của chính chủ, không có mức cộng của Hùng');
select t.thoat();

-- ===== Tìm gần đây theo người gọi =====
select t.dang_nhap(t.id('lan'));
select t.bang(coalesce(t.so(format('select 1 from public.tim_gan_day where sale_id = %L', t.id('hung'))), 0), 0::bigint,
              'YC7.3 PQ11.SALE Sale Lan không đọc lần tìm của Hùng');
select t.thoat();
select t.ok((select count(*) from public.tim_gan_day where sale_id = t.id('hung') and tu_ngay = '2026-10-10' and den_ngay = '2026-10-12') = 1,
            'YC7.3 lần tìm 10/10 → 12/10 ghi theo người gọi (Hùng), một dòng');
