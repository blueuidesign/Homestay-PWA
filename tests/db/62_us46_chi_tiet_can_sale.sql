-- US46 · Chi tiết căn của chủ nhà và giá bán (YC7.4, HV5). Viết trước migration (US46-TA1, CL14.5): task sau không sửa file này.
-- Hợp đồng database (YC7 "Dữ liệu", "Ai được làm gì", thiet-ke-db.md mục 3 bất biến 3, 4, 5, 6):
--   fn_sale_chi_tiet_can(p_can_id uuid, p_tu date, p_den date) returns jsonb. Căn trong my_shared_can_ids() của người gọi:
--     {"khong_con_quyen": false, can_id, ma_can, ten_toa, khu_vuc, so_phong_ngu, so_giuong, loai_view, lich_doi_luc,
--      "anh": [đường dẫn trong kho anh-can, theo thu_tu], "chu": {ten, so_dien_thoai (null khi chưa cho số), so_can},
--      gio_nhan, gio_tra ('HH:MI'), tu, den, "dem": [{ngay, gia_chu, gia_ban}], tong_gia_chu, tong_gia_ban (null khi có đêm
--      chưa có giá), muc_cong (đang áp), muc_cong_rieng (null khi dùng mặc định), muc_cong_mac_dinh, lam_tron_50k,
--      "lich": 14 ngày từ thứ Hai của tuần có p_tu, [{ngay, o: 'kin' | 'trong'}]}.
--     Không được xem: chỉ {"khong_con_quyen": true, "ly_do": text | null} (HV5), không giá, lịch, ảnh.
--     ly_do: 'Chủ nhà đã ngừng chia sẻ lịch' (kết nối chu_ngung), 'Chủ nhà đã xóa tài khoản' (chủ có da_xoa_luc).
--   fn_dat_muc_cong(p_can_id uuid, p_muc bigint): ghi mức cộng riêng của người gọi cho căn được xem (0 là "Không cộng").
--   fn_bo_muc_cong(p_can_id uuid): xóa mức cộng riêng của người gọi cho căn (chip "Mặc định", YC7-H7).
--   Căn không được xem: hai lệnh ghi từ chối 42501. Mức cộng âm: từ chối.
-- Giá 1509 (DLM): 900.000đ thường, 1.300.000đ cuối tuần. 10/10/2026 là đêm thứ Bảy, 11/10 là đêm Chủ nhật: 2.200.000đ.
select t.fixture();

-- Ảnh 1509: hai ảnh trong kho của Chị Hoa (thứ tự 1, 0). Ảnh 3402 một ảnh.
insert into storage.objects (bucket_id, name, owner, metadata) values
  ('anh-can', t.id('hoa') || '/1509-b.jpg', t.id('hoa'), '{"mimetype":"image/jpeg","size":1}'),
  ('anh-can', t.id('hoa') || '/1509-a.jpg', t.id('hoa'), '{"mimetype":"image/jpeg","size":1}'),
  ('anh-can', t.id('hoa') || '/3402-a.jpg', t.id('hoa'), '{"mimetype":"image/jpeg","size":1}');
insert into public.anh_can (can_id, nguoi_tai, duong_dan, thu_tu) values
  (t.can('1509'), t.id('hoa'), t.id('hoa') || '/1509-b.jpg', 1),
  (t.can('1509'), t.id('hoa'), t.id('hoa') || '/1509-a.jpg', 0),
  (t.can('3402'), t.id('hoa'), t.id('hoa') || '/3402-a.jpg', 0);
update public.toa_nha set khu_vuc = 'Bãi Cháy' where id = t.toa('icon40');
update public.can set loai_view = 'bien' where id = t.can('1509');
-- 1509 kín 13/10 → 15/10 (Chị Hoa ghi, khách lẻ).
select t.tao_booking('K1', t.can('1509'), '2026-10-13', '2026-10-15', 1800000);

-- Chi tiết bằng vai hiện tại; lỗi thì null (in lỗi ra NOTICE).
create or replace function pg_temp.ct(p_can uuid, p_tu date default '2026-10-10', p_den date default '2026-10-12')
returns jsonb language plpgsql as $$
declare v jsonb;
begin
  select public.fn_sale_chi_tiet_can(p_can, p_tu, p_den) into v;
  return v;
exception when others then
  raise notice 'lỗi: % (fn_sale_chi_tiet_can)', sqlerrm;
  return null;
end $$;

-- Mức cộng riêng của một sale cho một căn, đọc bằng chủ database ('-' khi không có dòng).
create or replace function pg_temp.muc(p_sale uuid, p_can uuid) returns text language sql as $$
  select coalesce((select muc::text from public.muc_cong where sale_id = p_sale and can_id = p_can), '-')
$$;

-- ===== Danh mục =====
select t.ok((select bool_and(p.prosecdef) and count(*) = 3 from pg_proc p
             where p.pronamespace = 'public'::regnamespace
               and p.proname in ('fn_sale_chi_tiet_can', 'fn_dat_muc_cong', 'fn_bo_muc_cong')),
            'YC7.4 KT-DB.3.3 có fn_sale_chi_tiet_can, fn_dat_muc_cong, fn_bo_muc_cong chạy security definer');
select t.ok((select bool_and(exists (select 1 from unnest(p.proconfig) c where c like 'search_path=%')) from pg_proc p
             where p.pronamespace = 'public'::regnamespace
               and p.proname in ('fn_sale_chi_tiet_can', 'fn_dat_muc_cong', 'fn_bo_muc_cong')),
            'YC7.4 KT-DB.3.3 ba lệnh đặt search_path');
select t.ok(exists (select 1 from pg_proc p where p.proname = 'fn_sale_chi_tiet_can' and p.pronamespace = 'public'::regnamespace)
            and not exists (select 1 from pg_proc p where p.pronamespace = 'public'::regnamespace
                              and p.proname in ('fn_sale_chi_tiet_can', 'fn_dat_muc_cong', 'fn_bo_muc_cong')
                              and has_function_privilege('anon', p.oid, 'execute')),
            'YC7.4 PQ4.LINK người chưa đăng nhập không gọi được ba lệnh');

-- ===== YC7.4 bước 1, 2, 3, 5, 6: Hùng mở 1509 cho 10/10 → 12/10 =====
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.ct(t.can('1509')) ->> 'khong_con_quyen', 'false', 'YC7.4 bước 1 Sale Hùng xem được chi tiết 1509');
select t.bang((select concat_ws('|', j ->> 'ma_can', j ->> 'ten_toa', j ->> 'khu_vuc', j ->> 'so_phong_ngu', j ->> 'so_giuong', j ->> 'loai_view')
               from pg_temp.ct(t.can('1509')) j),
              '1509|ICON40|Bãi Cháy|2|3|bien', 'YC7.4 bước 1 YC7.4-NT4 1509: tòa, khu vực, 2 phòng ngủ, 3 giường, view');
select t.ok(pg_temp.ct(t.can('1509')) ->> 'lich_doi_luc' is not null, 'YC7.4 bước 1 YC7 Độ tươi lịch: có lúc lịch đổi');
select t.bang(pg_temp.ct(t.can('1509')) -> 'anh',
              jsonb_build_array(t.id('hoa') || '/1509-a.jpg', t.id('hoa') || '/1509-b.jpg'),
              'YC7.4 bước 1 YC7.4-NT6 ảnh 1509 là đường dẫn trong kho, theo thứ tự');
select t.bang((select concat_ws('|', j -> 'chu' ->> 'ten', j -> 'chu' ->> 'so_dien_thoai', j -> 'chu' ->> 'so_can')
               from pg_temp.ct(t.can('1509')) j),
              'Chị Hoa|0900000001|2', 'YC7.4 bước 2 PQ2.SALE "Chị Hoa · Chủ nhà · 2 căn", có số của chủ nhà đã kết nối');
select t.bang((select concat_ws('|', j ->> 'gio_nhan', j ->> 'gio_tra') from pg_temp.ct(t.can('1509')) j),
              '14:00|12:00', 'YC7.4 bước 6 giờ nhận 14:00, giờ trả 12:00 của chủ nhà');
select t.bang((select jsonb_agg(jsonb_build_array(d ->> 'ngay', (d ->> 'gia_chu')::bigint))
               from jsonb_array_elements(pg_temp.ct(t.can('1509')) -> 'dem') d),
              '[["2026-10-10", 1300000], ["2026-10-11", 900000]]'::jsonb,
              'YC7.4 bước 3 QT2.1 giá chủ từng đêm: 10/10 (đêm thứ Bảy) 1.300.000đ, 11/10 900.000đ');
select t.bang((pg_temp.ct(t.can('1509')) ->> 'tong_gia_chu')::bigint, 2200000::bigint,
              'YC7.4 bước 3 "Giá chủ nhà 2.200.000đ" cho 10/10 → 12/10');
select t.bang((select jsonb_array_length(j -> 'lich') || '|' || (j -> 'lich' -> 0 ->> 'ngay') || '|' || (j -> 'lich' -> 13 ->> 'ngay')
               from pg_temp.ct(t.can('1509')) j),
              '14|2026-10-05|2026-10-18', 'YC7.4 bước 5 lịch 14 ngày từ thứ Hai 05/10 tới 18/10');
select t.bang((select string_agg(l ->> 'ngay' || ':' || (l ->> 'o'), ',' order by l ->> 'ngay')
               from jsonb_array_elements(pg_temp.ct(t.can('1509')) -> 'lich') l
               where l ->> 'ngay' between '2026-10-12' and '2026-10-15'),
              '2026-10-12:trong,2026-10-13:kin,2026-10-14:kin,2026-10-15:trong',
              'YC7.4 bước 5 QT2.1 lịch: 13/10, 14/10 kín; ngày trả 15/10 trống');
select t.ok((select count(*) = 0 from jsonb_object_keys(pg_temp.ct(t.can('1509'))) k
             where k in ('ten_khach', 'sdt_khach', 'tien_phong', 'tien_coc', 'nguoi_dat')),
            'YC7.4 KT-DB.3.5 chi tiết không có khách, tiền phòng, tiền cọc, người đặt');
select t.ok((pg_temp.ct(t.can('1509')) -> 'lich' @? '$[*] ? (@.o != "kin" && @.o != "trong")') is false,
            'YC7.4 bước 5 ô lịch chỉ có kín hay trống, không có người đặt');
select t.thoat();

-- ===== YC7.4-NT1: Hùng chọn "+200k" cho 1509: 2.200.000đ + 200.000đ × 2 = 2.600.000đ =====
select t.dang_nhap(t.id('hung'));
select t.khong_loi(format('select public.fn_dat_muc_cong(%L, 200000)', t.can('1509')), 'YC7.4-NT1 Hùng gửi lệnh đặt mức cộng +200k cho 1509');
select t.bang((pg_temp.ct(t.can('1509')) ->> 'tong_gia_ban')::bigint, 2600000::bigint,
              'YC7.4-NT1 giá bán 1509 cho 10/10 → 12/10 là 2.600.000đ');
select t.bang((select jsonb_agg((d ->> 'gia_ban')::bigint) from jsonb_array_elements(pg_temp.ct(t.can('1509')) -> 'dem') d),
              '[1500000, 1100000]'::jsonb, 'YC7.4-NT1 QT5.4 giá bán từng đêm = giá chủ + 200.000đ');
select t.bang((select concat_ws('|', j ->> 'muc_cong', j ->> 'muc_cong_rieng', j ->> 'muc_cong_mac_dinh', j ->> 'lam_tron_50k')
               from pg_temp.ct(t.can('1509')) j),
              '200000|200000|400000|false', 'YC7.4-NT1 mức cộng đang áp +200k (riêng căn), mặc định +400k');
select t.khong_loi(format('select public.fn_dat_muc_cong(%L, 300000)', t.can('1509')), 'YC7.4-NT1 Hùng đổi sang +300k');
select t.bang((pg_temp.ct(t.can('1509')) ->> 'tong_gia_ban')::bigint, 2800000::bigint, 'YC7.4-NT1 +300k: giá bán 2.800.000đ');
select t.khong_loi(format('select public.fn_dat_muc_cong(%L, 0)', t.can('1509')), 'YC7.4-NT1 Hùng chọn "Không cộng"');
select t.bang((select concat_ws('|', j ->> 'tong_gia_ban', j ->> 'muc_cong_rieng') from pg_temp.ct(t.can('1509')) j),
              '2200000|0', 'YC7.4-NT1 "Không cộng" là mức riêng 0: giá bán bằng giá chủ 2.200.000đ, không dùng mặc định');
select t.khong_loi(format('select public.fn_dat_muc_cong(%L, 200000)', t.can('1509')), 'YC7.4-NT1 Hùng chọn lại +200k');
select t.thoat();
select t.bang(pg_temp.muc(t.id('hung'), t.can('1509')), '200000', 'YC7.4-NT1 bước 4 database ghi mức cộng riêng 200.000đ của Hùng cho 1509');

-- ===== YC7.4-NT2: sale thấy cả giá chủ và giá bán; chủ nhà không đọc được mức cộng, giá bán =====
select t.dang_nhap(t.id('hung'));
select t.ok((select j ? 'tong_gia_chu' and j ? 'tong_gia_ban' and (j ->> 'tong_gia_chu') <> (j ->> 'tong_gia_ban')
             from pg_temp.ct(t.can('1509')) j),
            'YC7.4-NT2 QD7 Hùng thấy cả giá chủ nhà và giá bán của 1509');
select t.thoat();
select t.dang_nhap(t.id('hoa'));
select t.bang(coalesce(t.so('select * from public.muc_cong'), 0), 0::bigint, 'YC7.4-NT2 PQ11 Chị Hoa không đọc được mức cộng nào (kể cả 1509 của mình)');
select t.bang(coalesce(t.so(format('select * from public.cai_dat_rieng where nguoi_id = %L', t.id('hung'))), 0), 0::bigint,
              'YC7.4-NT2 PQ11 Chị Hoa không đọc được mức cộng mặc định của Hùng');
select t.bang(pg_temp.ct(t.can('1509')), '{"khong_con_quyen": true, "ly_do": null}'::jsonb,
              'YC7.4-NT2 KT-DB.3.6 Chị Hoa gọi chi tiết sale cho 1509: không có giá bán, mức cộng');
select t.ok(not exists (select 1 from information_schema.role_column_grants g
                        where g.grantee = 'authenticated' and g.privilege_type = 'SELECT'
                          and g.table_schema = 'public' and g.table_name not in ('muc_cong', 'cai_dat_rieng', 'yeu_cau_rieng', 'booking_rieng')
                          and g.column_name in ('muc_cong', 'muc_cong_rieng', 'gia_ban', 'tong_gia_ban')),
            'YC7.4-NT2 KT-DB.3.6 không bảng, view nào chủ đọc được có cột mức cộng hay giá bán của sale');
select t.thoat();

-- ===== YC7.4-NT5: mức cộng là của riêng sale; chủ nhà gửi lệnh thì database từ chối =====
select t.dang_nhap(t.id('lan'));
select t.khong_loi(format('select public.fn_dat_muc_cong(%L, 100000)', t.can('1509')), 'YC7.4-NT5 Sale Lan đặt mức cộng +100k cho 1509');
select t.bang((pg_temp.ct(t.can('1509')) ->> 'tong_gia_ban')::bigint, 2400000::bigint, 'YC7.4-NT5 giá bán 1509 của Lan là 2.400.000đ');
select t.bang(coalesce(t.so(format('select * from public.muc_cong where sale_id = %L', t.id('hung'))), 0), 0::bigint,
              'YC7.4-NT5 PQ11.SALE Lan không đọc được mức cộng của Hùng');
select t.loi(format('select public.fn_dat_muc_cong(%L, 100000)', t.can('3402')), '42501',
             'YC7.4-NT5 PQ3.SALE Lan đặt mức cộng cho 3402 ngoài phạm vi: database từ chối');
select t.loi(format($$insert into public.muc_cong (sale_id, can_id, muc) values (%L, %L, 0)$$, t.id('hung'), t.can('1509')), '42501',
             'YC7.4-NT5 Lan ghi thẳng bảng muc_cong (mức của Hùng): bị từ chối');
select t.loi(format($$update public.muc_cong set muc = 0 where can_id = %L$$, t.can('1509')), '42501',
             'YC7.4-NT5 Lan sửa thẳng bảng muc_cong: bị từ chối');
select t.thoat();
select t.bang(pg_temp.muc(t.id('hung'), t.can('1509')), '200000', 'YC7.4-NT5 mức cộng của Hùng cho 1509 vẫn 200.000đ');
select t.bang(pg_temp.muc(t.id('lan'), t.can('1509')), '100000', 'YC7.4-NT5 mức cộng của Lan cho 1509 là 100.000đ');
select t.dang_nhap(t.id('hung'));
select t.bang((pg_temp.ct(t.can('1509')) ->> 'tong_gia_ban')::bigint, 2600000::bigint,
              'YC7.4-NT5 Sale Lan đặt mức cộng cho 1509: giá bán của Hùng cho 1509 không đổi (2.600.000đ)');
select t.thoat();
select t.dang_nhap(t.id('hoa'));
select t.loi(format('select public.fn_dat_muc_cong(%L, 100000)', t.can('1509')), '42501',
             'YC7.4-NT5 Chị Hoa gửi lệnh đặt mức cộng cho 1509: database từ chối');
select t.loi(format('select public.fn_bo_muc_cong(%L)', t.can('1509')), '42501',
             'YC7.4-NT5 Chị Hoa gửi lệnh bỏ mức cộng cho 1509: database từ chối');
select t.thoat();
select t.bang(pg_temp.muc(t.id('hung'), t.can('1509')) || ',' || pg_temp.muc(t.id('lan'), t.can('1509')), '200000,100000',
              'YC7.4-NT5 sau lệnh của Chị Hoa, mức cộng của Hùng và Lan cho 1509 không đổi');
select t.dang_nhap(t.id('hung'));
select t.ok(t.ma_loi(format('select public.fn_dat_muc_cong(%L, -100000)', t.can('1509'))) is not null,
            'YC7.4-NT5 QT5.2 mức cộng âm: database từ chối');
select t.ok(t.ma_loi(format('select public.fn_dat_muc_cong(%L, null)', t.can('1509'))) is not null,
            'YC7.4-NT5 mức cộng trống: database từ chối');
select t.thoat();
select t.bang(pg_temp.muc(t.id('hung'), t.can('1509')), '200000', 'YC7.4-NT5 lệnh sai không đổi mức cộng của Hùng');

-- ===== YC7.4-NT7: Hùng đã đặt "+200k" cho 1509 rồi chọn chip "Mặc định" (mặc định +400k) =====
select t.dang_nhap(t.id('hung'));
select t.khong_loi(format('select public.fn_bo_muc_cong(%L)', t.can('1509')), 'YC7.4-NT7 Hùng chọn chip "Mặc định" cho 1509');
select t.bang((pg_temp.ct(t.can('1509')) ->> 'tong_gia_ban')::bigint, 3000000::bigint,
              'YC7.4-NT7 giá bán 1509 cho 10/10 → 12/10 là 3.000.000đ (2.200.000đ + 400.000đ × 2)');
select t.bang((select concat_ws('|', j ->> 'muc_cong', coalesce(j ->> 'muc_cong_rieng', '-')) from pg_temp.ct(t.can('1509')) j),
              '400000|-', 'YC7.4-NT7 đang dùng mức mặc định +400k, không còn mức riêng');
select t.khong_loi(format('select public.fn_bo_muc_cong(%L)', t.can('1509')), 'YC7.4-NT7 chọn "Mặc định" lần nữa vẫn được');
select t.thoat();
select t.bang(pg_temp.muc(t.id('hung'), t.can('1509')), '-', 'YC7.4-NT7 mức cộng riêng của Hùng cho 1509 đã bị xóa');
select t.bang(pg_temp.muc(t.id('lan'), t.can('1509')), '100000', 'YC7.4-NT7 mức cộng riêng của Lan cho 1509 vẫn giữ');
-- GD13: bật làm tròn 50.000đ, mặc định +430k: 1.730.000đ → 1.750.000đ, 1.330.000đ → 1.350.000đ.
update public.cai_dat_rieng set muc_cong_mac_dinh = 430000, lam_tron_50k = true where nguoi_id = t.id('hung');
select t.dang_nhap(t.id('hung'));
select t.bang((pg_temp.ct(t.can('1509')) ->> 'tong_gia_ban')::bigint, 3100000::bigint,
              'YC7.4-NT7 QT5.4 GD13 làm tròn lên 50.000đ từng đêm rồi mới cộng: 3.100.000đ');
select t.thoat();
update public.cai_dat_rieng set muc_cong_mac_dinh = 400000, lam_tron_50k = false where nguoi_id = t.id('hung');

-- Đêm chưa có giá: tổng không có (không bao giờ 0).
delete from public.gia_thang where can_id = t.can('1509') and thang = '2026-12-01';
select t.dang_nhap(t.id('hung'));
select t.bang((select coalesce(j ->> 'tong_gia_chu', '-') || '|' || coalesce(j ->> 'tong_gia_ban', '-')
               from pg_temp.ct(t.can('1509'), '2026-11-30', '2026-12-02') j),
              '-|-', 'YC7.4 bước 3 PQ11.SALE khoảng có đêm chưa có giá: không có tổng giá');
select t.ok(t.ma_loi(format($$select public.fn_sale_chi_tiet_can(%L, '2026-10-12', '2026-10-12')$$, t.can('1509'))) is not null,
            'YC7.4 khoảng 0 đêm: database từ chối');
select t.thoat();

-- ===== YC7.4-NT6: ngoài phạm vi, chưa kết nối, căn đã xóa, sale bị ngừng, chủ xóa tài khoản: không đọc được chi tiết =====
select t.dang_nhap(t.id('lan'));
select t.bang(pg_temp.ct(t.can('3402')), '{"khong_con_quyen": true, "ly_do": null}'::jsonb,
              'YC7.4-NT6 PQ3.SALE Sale Lan mở 3402 ngoài phạm vi: không đọc được chi tiết');
select t.bang((pg_temp.ct(t.can('1509')) -> 'chu' ->> 'so_can'), '1', 'YC7.4 bước 2 Chị Hoa chia sẻ cho Lan 1 căn');
select t.bang(coalesce(t.so(format('select * from public.anh_can where can_id = %L', t.can('3402'))), 0), 0::bigint,
              'YC7.4-NT6 PQ3.SALE Lan không đọc được dòng ảnh 3402 ngoài phạm vi');
select t.bang(coalesce(t.so(format($$select * from storage.objects where bucket_id = 'anh-can' and name = %L$$, t.id('hoa') || '/3402-a.jpg')), 0),
              0::bigint, 'YC7.4-NT6 Lan không mở được file ảnh 3402 (không xin được đường dẫn có hạn)');
select t.thoat();
select t.dang_nhap(t.id('nga'));
select t.bang(pg_temp.ct(t.can('1509')), '{"khong_con_quyen": true, "ly_do": null}'::jsonb,
              'YC7.4-NT6 PQ13.SALE Sale Nga chưa kết nối mở 1509: không đọc được chi tiết');
select t.thoat();
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.ct(t.can('villa')), '{"khong_con_quyen": true, "ly_do": null}'::jsonb,
              'YC7.4-NT6 căn tự nhập của chính Hùng không mở bằng chi tiết căn chủ nhà');
select t.bang(pg_temp.ct('00000000-0000-0000-0001-0000000ffff0'), '{"khong_con_quyen": true, "ly_do": null}'::jsonb,
              'YC7.4-NT6 căn không có: không đọc được chi tiết');
select t.thoat();
select t.ok(exists (select 1 from storage.buckets where id = 'anh-can' and public is false),
            'YC7.4-NT6 QT5.7 kho ảnh không công khai: ảnh chỉ mở bằng đường dẫn có hạn do kho cấp');

-- Số điện thoại chủ nhà trống khi chủ chưa cho số.
update public.profiles set so_dien_thoai = null where id = t.id('hoa');
select t.dang_nhap(t.id('hung'));
select t.ok((select (j -> 'chu') ? 'so_dien_thoai' and j -> 'chu' -> 'so_dien_thoai' = 'null'::jsonb from pg_temp.ct(t.can('1509')) j),
            'YC7.4-NT6 PQ2.SALE chủ nhà chưa cho số: số điện thoại chủ nhà trống');
select t.thoat();
update public.profiles set so_dien_thoai = '0900000001' where id = t.id('hoa');

-- Căn đã xóa.
update public.can set an_luc = now() where id = t.can('3402');
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.ct(t.can('3402')) ->> 'khong_con_quyen', 'true', 'YC7.4-NT6 PQ3.SALE căn 3402 đã xóa: không đọc được chi tiết');
select t.ok(not (pg_temp.ct(t.can('3402')) ?| array['anh', 'dem', 'lich', 'tong_gia_chu', 'chu']),
            'YC7.4-NT6 căn đã xóa: không trả giá, lịch, ảnh');
select t.bang((pg_temp.ct(t.can('1509')) -> 'chu' ->> 'so_can'), '1', 'YC7.4 bước 2 căn đã xóa không tính vào số căn chủ chia sẻ');
select t.loi(format('select public.fn_dat_muc_cong(%L, 100000)', t.can('3402')), '42501',
             'YC7.4-NT6 căn đã xóa: database từ chối đặt mức cộng');
select t.thoat();
update public.can set an_luc = null where id = t.can('3402');

-- HV5-NT1: Chị Hoa ngừng cho Sale Hùng xem; Hùng mở 1509 từ thông báo cũ.
select t.dang_nhap(t.id('hoa'));
select t.bang(t.gt(format('public.fn_ngung_cho_xem(%L)', t.kn('hoa', 'hung'))), 'chu_ngung', 'HV5-NT1 Chị Hoa ngừng cho Sale Hùng xem');
select t.thoat();
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.ct(t.can('1509')), '{"khong_con_quyen": true, "ly_do": "Chủ nhà đã ngừng chia sẻ lịch"}'::jsonb,
              'HV5-NT1 YC7.4-NT6 Sale Hùng bị ngừng mở 1509: chỉ có lý do, không giá, lịch, ảnh');
select t.loi(format('select public.fn_dat_muc_cong(%L, 100000)', t.can('1509')), '42501',
             'YC7.4-NT6 Sale Hùng bị ngừng: database từ chối đặt mức cộng cho 1509');
select t.loi(format('select public.fn_bo_muc_cong(%L)', t.can('1509')), '42501',
             'YC7.4-NT6 Sale Hùng bị ngừng: database từ chối bỏ mức cộng cho 1509');
select t.bang(coalesce(t.so(format('select * from public.anh_can where can_id = %L', t.can('1509'))), 0), 0::bigint,
              'HV5-NT1 YC7.4-NT6 Sale Hùng bị ngừng không đọc được dòng ảnh 1509');
select t.bang(coalesce(t.so(format($$select * from storage.objects where bucket_id = 'anh-can' and name = %L$$, t.id('hoa') || '/1509-a.jpg')), 0),
              0::bigint, 'HV5-NT1 YC7.4-NT6 Sale Hùng bị ngừng không xin được đường dẫn ảnh 1509');
select t.thoat();
update public.ket_noi set trang_thai = 'da_ket_noi', ngung_luc = null where id = t.kn('hoa', 'hung');
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.ct(t.can('1509')) ->> 'khong_con_quyen', 'false', 'HV5-NT1 kết nối lại thì Hùng xem lại được 1509');
select t.bang(coalesce(t.so(format($$select * from storage.objects where bucket_id = 'anh-can' and name = %L$$, t.id('hoa') || '/1509-a.jpg')), 0),
              1::bigint, 'YC7.4-NT6 sale được xem mở được file ảnh 1509 (xin được đường dẫn có hạn)');
select t.thoat();

-- HV5-NT2: Chị Hoa đã xóa tài khoản; Hùng mở 1509 từ thông báo cũ.
update public.profiles set da_xoa_luc = now(), so_dien_thoai = null where id = t.id('hoa');
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.ct(t.can('1509')), '{"khong_con_quyen": true, "ly_do": "Chủ nhà đã xóa tài khoản"}'::jsonb,
              'HV5-NT2 YC7.4-NT6 PQ23.SALE Chị Hoa đã xóa tài khoản: lý do "Chủ nhà đã xóa tài khoản", không dữ liệu');
select t.loi(format('select public.fn_dat_muc_cong(%L, 100000)', t.can('1509')), '42501',
             'YC7.4-NT6 PQ23.SALE chủ đã xóa tài khoản: database từ chối đặt mức cộng');
select t.thoat();
update public.profiles set da_xoa_luc = null, so_dien_thoai = '0900000001' where id = t.id('hoa');

-- Người chưa đăng nhập.
select t.khach();
select t.ok(t.ma_loi(format($$select public.fn_sale_chi_tiet_can(%L, '2026-10-10', '2026-10-12')$$, t.can('1509'))) is not null,
            'YC7.4 PQ4.LINK người chưa đăng nhập gọi chi tiết căn: bị từ chối');
select t.ok(t.ma_loi(format('select public.fn_dat_muc_cong(%L, 100000)', t.can('1509'))) is not null,
            'YC7.4 PQ4.LINK người chưa đăng nhập gọi đặt mức cộng: bị từ chối');
select t.thoat();
