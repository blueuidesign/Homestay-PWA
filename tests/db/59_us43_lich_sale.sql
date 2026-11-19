-- US43 · Màn đầu tiên và lịch 7 ngày của sale (YC7.1). Viết trước migration (US43-TA1, CL14.5): task sau không sửa file này.
-- Hợp đồng database (YC7 "Dữ liệu", thiet-ke-db.md mục 3 bất biến 3, 5, 7):
--   fn_sale_lich(p_tu date, p_den date) trả mỗi căn sale được xem, mỗi đêm từ p_tu tới trước p_den một dòng:
--   (can_id, nhom, ma_can, ten_toa, ten_chu, so_phong_ngu, loai_view, lich_doi_luc, so_ban, dem, o, gia_ban).
--   nhom: 'cua_toi' (căn có lịch của chính người gọi), 'nguon' (căn trong my_shared_can_ids()), 'tu_nhap' (căn tự nhập
--   của người gọi; màn đếm chung vào "NGUỒN PHÒNG" như canvas S1 và DLM: "Nguồn phòng 5 căn: ... 1 tự nhập").
--   o: 'kin' | 'trong' cho căn có lịch; 'ban' | 'chua_biet' cho căn tự nhập (o_lich, KT-DB.3.7).
--   gia_ban: căn của tôi là giá đêm của chính sale (giá chủ của căn mình); căn nguồn là giá chủ + mức cộng (riêng căn,
--   không thì mặc định), bật làm tròn thì làm tròn lên 50.000đ (QT5.4, GD13, GD16); căn tự nhập luôn null.
--   Không cột tên người đặt, khách, tiền phòng, giá chủ nhà. Khoảng 1 đến 31 đêm. Người chưa đăng nhập không gọi được.
--   so_ban: số đặt phòng chưa hủy của chính người gọi ở căn đó có ngày nhận trong 90 ngày gần nhất (YC7-H9).
select t.fixture();

-- Căn của Sale Hùng (DLM.3): Green Bay 0812, Mường Thanh 1605. Căn À La Carte 2208 của Anh Tuấn. Id cố định cho gọn.
insert into public.toa_nha (id, ten, home247_dat_san, tao_boi) values
  ('00000000-0000-0000-0002-000000043001', 'Green Bay', true, null),
  ('00000000-0000-0000-0002-000000043002', 'Mường Thanh', true, null),
  ('00000000-0000-0000-0002-000000043003', 'À La Carte', true, null);
insert into public.can (id, nguoi_giu, loai, ma_can, so_phong_ngu, loai_view, toa_nha_id) values
  ('00000000-0000-0000-0001-000000430812', t.id('hung'), 'co_lich', '0812', 2, 'biển', '00000000-0000-0000-0002-000000043001'),
  ('00000000-0000-0000-0001-000000431605', t.id('hung'), 'co_lich', '1605', 1, 'biển', '00000000-0000-0000-0002-000000043002'),
  ('00000000-0000-0000-0001-000000432208', t.id('tuan'), 'co_lich', '2208', 1, 'biển', '00000000-0000-0000-0002-000000043003');
insert into public.gia_thang (can_id, thang, gia_thuong, gia_cuoi_tuan) values
  ('00000000-0000-0000-0001-000000430812', '2026-10-01', 750000, 900000),
  ('00000000-0000-0000-0001-000000432208', '2026-10-01', 1500000, 1500000);
-- Anh Tuấn đã kết nối Sale Hùng (tất cả căn). Mức cộng của Hùng: 1103 +100k, 2208 +300k (DLM).
insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon, pham_vi, xem_coc)
values (t.id('tuan'), t.id('hung'), 'da_ket_noi', 'link_moi', 'tat_ca', true);
insert into public.muc_cong (sale_id, can_id, muc) values
  (t.id('hung'), t.can('1103'), 100000),
  (t.id('hung'), '00000000-0000-0000-0001-000000432208', 300000);
-- Sale Nga có lời kết nối Chị Hoa chưa được đồng ý.
insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon, pham_vi, xem_coc)
values (t.id('hoa'), t.id('nga'), 'chua_ket_noi', 'sale_xin', 'tat_ca', true);

-- Đặt phòng: Green Bay kín 08/10, 09/10 (DLM); 3402 Chị Hoa ghi 10/10 → 12/10; V2 Villa Tuần Châu 08/10 → 09/10 (sale tự ghi).
select t.tao_booking('GB', '00000000-0000-0000-0001-000000430812', '2026-10-08', '2026-10-10', 1500000);
select t.tao_booking('H3402', t.can('3402'), '2026-10-10', '2026-10-12', 1600000);
select t.tao_booking('V2', t.can('villa'), '2026-10-08', '2026-10-09', 1400000);

-- Ô của một căn một đêm, bằng vai hiện tại: 'o|gia_ban' ('-' khi gia null), 'không có dòng' khi không có dòng.
create or replace function pg_temp.o(p_can uuid, p_dem date, p_tu date default '2026-10-07', p_den date default '2026-10-14')
returns text language plpgsql as $$
declare v text;
begin
  select l.o || '|' || coalesce(l.gia_ban::text, '-') into v from public.fn_sale_lich(p_tu, p_den) l
  where l.can_id = p_can and l.dem = p_dem;
  return coalesce(v, 'không có dòng');
exception when others then
  raise notice 'lỗi: % (fn_sale_lich)', sqlerrm;
  return null;
end $$;

-- Số căn của một nhóm trong lịch 07/10 → 13/10, bằng vai hiện tại.
create or replace function pg_temp.so_can(p_nhom text[]) returns bigint language plpgsql as $$
begin
  return t.so(format($q$select distinct can_id from public.fn_sale_lich('2026-10-07', '2026-10-14') where nhom = any (%L)$q$, p_nhom));
end $$;

-- ===== Danh mục =====
select t.ok(exists (select 1 from pg_proc where proname = 'fn_sale_lich' and pronamespace = 'public'::regnamespace and prosecdef),
            'YC7.1-NT2 danh mục: có lệnh fn_sale_lich chạy security definer');
select t.ok(exists (select 1 from pg_proc p where p.proname = 'fn_sale_lich' and p.pronamespace = 'public'::regnamespace)
            and not exists (select 1 from pg_proc p where p.proname = 'fn_sale_lich' and p.pronamespace = 'public'::regnamespace
                              and has_function_privilege('anon', p.oid, 'execute')),
            'YC7.1 PQ4.LINK người chưa đăng nhập không có quyền gọi fn_sale_lich');
select t.bang((select string_agg(p.parameter_name, ',' order by p.ordinal_position)
               from information_schema.routines r
               join information_schema.parameters p on p.specific_name = r.specific_name
               where r.routine_schema = 'public' and r.routine_name = 'fn_sale_lich' and p.parameter_mode = 'OUT'),
              'can_id,nhom,ma_can,ten_toa,ten_chu,so_phong_ngu,loai_view,lich_doi_luc,so_ban,dem,o,gia_ban',
              'YC7.1-NT4 KT-DB.3.5 fn_sale_lich chỉ có các cột đã định (không tên người đặt, khách, tiền phòng, giá chủ nhà)');

-- ===== YC7.1-NT2: nhóm "CĂN CỦA TÔI · 2" trên "NGUỒN PHÒNG · 5" =====
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.so_can(array['cua_toi']), 2::bigint, 'YC7.1-NT2 Sale Hùng: nhóm căn của tôi có 2 căn (0812, 1605)');
select t.bang(pg_temp.so_can(array['nguon', 'tu_nhap']), 5::bigint,
              'YC7.1-NT2 Sale Hùng: nguồn phòng có 5 căn (1509, 3402, 1103, 2208, Villa Tuần Châu)');
select t.bang(pg_temp.so_can(array['tu_nhap']), 1::bigint, 'YC7.1-NT2 Sale Hùng: Villa Tuần Châu ở nhóm tu_nhap');
select t.bang(t.so($$select * from public.fn_sale_lich('2026-10-07', '2026-10-14')$$), 49::bigint,
              'YC7.1-NT2 7 căn × 7 đêm = 49 dòng');
select t.bang(t.gt($$(select string_agg(distinct nhom, ',') from public.fn_sale_lich('2026-10-07', '2026-10-14')
                      where can_id in ('00000000-0000-0000-0001-000000430812', '00000000-0000-0000-0001-000000431605'))$$),
              'cua_toi', 'YC7.1-NT2 Green Bay 0812, Mường Thanh 1605 ở nhóm cua_toi');
select t.bang(t.gt($$(select string_agg(distinct ten_chu, ',' order by ten_chu) from public.fn_sale_lich('2026-10-07', '2026-10-14')
                      where nhom = 'nguon')$$),
              'Anh Tuấn,Chị Hoa', 'YC7.1 bước 3 hàng nguồn phòng có tên chủ nhà');
select t.bang(t.gt($$(select ten_chu || '|' || ma_can from public.fn_sale_lich('2026-10-07', '2026-10-14') where nhom = 'tu_nhap' limit 1)$$),
              'Chú Bình|Villa Tuần Châu', 'YC7.1 bước 4 hàng căn tự nhập có tên chủ căn Chú Bình');
select t.bang(t.gt($$(select ten_toa || '|' || so_phong_ngu || '|' || loai_view from public.fn_sale_lich('2026-10-07', '2026-10-14')
                      where can_id = '00000000-0000-0000-0001-000000430812' limit 1)$$),
              'Green Bay|2|biển', 'YC7.1 bước 3 hàng căn của tôi có tòa, số phòng ngủ, view');
select t.bang(t.gt($$(select min(dem)::text || '|' || max(dem)::text from public.fn_sale_lich('2026-10-07', '2026-10-14'))$$),
              '2026-10-07|2026-10-13', 'YC7.1-NT2 khoảng 07/10 → 13/10 (p_den không thuộc khoảng)');
select t.ok(t.gt($$(select bool_and(lich_doi_luc is not null) from public.fn_sale_lich('2026-10-07', '2026-10-14') where nhom = 'nguon')$$) = 'true',
            'YC7 Độ tươi lịch: căn của chủ nhà có lúc lịch đổi');
select t.thoat();

-- ===== YC7.1-NT3: ô kín ghi "Kín", ô trống ghi giá bán một đêm =====
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.o(t.can('3402'), '2026-10-08'), 'trong|1200000',
              'YC7.1-NT3 3402 đêm 08/10 trống, giá bán 1.200.000đ (800.000đ + 400.000đ mức cộng mặc định)');
select t.bang(pg_temp.o(t.can('3402'), '2026-10-09'), 'trong|1500000',
              'YC7.1-NT3 3402 đêm 09/10 (T6, cuối tuần) giá bán 1.500.000đ (1.100.000đ + 400.000đ)');
select t.bang(split_part(pg_temp.o(t.can('3402'), '2026-10-10'), '|', 1), 'kin', 'YC7.1-NT3 3402 đêm 10/10 có đặt phòng: kín');
select t.bang(split_part(pg_temp.o(t.can('3402'), '2026-10-11'), '|', 1), 'kin', 'YC7.1-NT3 3402 đêm 11/10 có đặt phòng: kín');
select t.bang(split_part(pg_temp.o(t.can('3402'), '2026-10-12'), '|', 1), 'trong',
              'YC7.1-NT3 QT2.1 3402 ngày trả 12/10 không phải đêm có khách: trống');
select t.bang(pg_temp.o(t.can('1509'), '2026-10-08'), 'trong|1100000',
              'YC7.1-NT3 QT5.4 1509 có mức cộng riêng +200k: đêm 08/10 giá bán 1.100.000đ');
select t.bang(pg_temp.o(t.can('1103'), '2026-10-08'), 'trong|800000',
              'YC7.1-NT3 QT5.4 1103 của Anh Tuấn mức cộng riêng +100k: 800.000đ');
select t.bang(pg_temp.o('00000000-0000-0000-0001-000000430812', '2026-10-07'), 'trong|750000',
              'YC7.1-NT3 căn của tôi Green Bay 0812 đêm 07/10 ghi giá đêm của chính sale 750.000đ, không cộng mức cộng');
select t.bang(split_part(pg_temp.o('00000000-0000-0000-0001-000000430812', '2026-10-08'), '|', 1), 'kin',
              'YC7.1-NT3 căn của tôi Green Bay 0812 đêm 08/10 có đặt phòng: kín');
select t.bang(pg_temp.o('00000000-0000-0000-0001-000000431605', '2026-10-07'), 'trong|-',
              'YC7.1-NT3 PQ11.SALE Mường Thanh 1605 chưa đặt giá: trống, không có giá (không bao giờ 0)');
select t.bang(t.so($$select * from public.fn_sale_lich('2026-10-07', '2026-10-14') where gia_ban = 0$$), 0::bigint,
              'YC7.1-NT3 không ô nào có giá bán 0');
select t.thoat();

-- QT5.4, GD13: bật làm tròn 50.000đ thì làm tròn lên từng đêm. Hùng mặc định +430k: 3402 đêm 08/10 1.230.000đ → 1.250.000đ.
update public.cai_dat_rieng set muc_cong_mac_dinh = 430000, lam_tron_50k = true where nguoi_id = t.id('hung');
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.o(t.can('3402'), '2026-10-08'), 'trong|1250000',
              'YC7.1-NT3 GD13 làm tròn lên 50.000đ: 800.000đ + 430.000đ = 1.230.000đ ghi 1.250.000đ');
select t.bang(pg_temp.o(t.can('1509'), '2026-10-08'), 'trong|1100000',
              'YC7.1-NT3 GD13 giá đã chẵn 50.000đ (900.000đ + 200.000đ) giữ nguyên 1.100.000đ');
select t.thoat();
update public.cai_dat_rieng set muc_cong_mac_dinh = 400000, lam_tron_50k = false where nguoi_id = t.id('hung');

-- Sale không có dòng cài đặt riêng thì mức cộng 0: Lan thấy 1509 đêm 08/10 bằng giá chủ nhà 900.000đ.
select t.dang_nhap(t.id('lan'));
select t.bang(pg_temp.o(t.can('1509'), '2026-10-08'), 'trong|900000',
              'YC7.1-NT3 PQ11.SALE Sale Lan dùng mức cộng của Lan (chưa đặt: 0), không dùng mức cộng +200k của Hùng');
select t.thoat();

-- ===== YC7.1-NT4: Chị Hoa vừa lưu đặt phòng 1509 cho khách lẻ =====
select t.dang_nhap(t.id('hoa'));
select t.khong_loi($$select public.fn_tao_booking(p_can_id => '00000000-0000-0000-0001-000000001509', p_ngay_nhan => '2026-10-07',
                     p_ngay_tra => '2026-10-09', p_tien_phong => 1830000, p_ten_khach => 'Khách Minh Thư',
                     p_sdt_khach => '0900000077')$$,
                   'YC7.1-NT4 Chị Hoa lưu đặt phòng 1509 07/10 → 09/10 cho khách lẻ');
select t.thoat();
select t.dang_nhap(t.id('hung'));
select t.bang(split_part(pg_temp.o(t.can('1509'), '2026-10-07'), '|', 1) || ',' || split_part(pg_temp.o(t.can('1509'), '2026-10-08'), '|', 1),
              'kin,kin', 'YC7.1-NT4 lần đọc sau của Sale Hùng: 1509 kín 07/10, 08/10');
select t.bang(split_part(pg_temp.o(t.can('1509'), '2026-10-09'), '|', 1), 'trong', 'YC7.1-NT4 Sale Hùng: 1509 đêm 09/10 (ngày trả) trống');
select t.bang(t.so($$select * from public.fn_sale_lich('2026-10-07', '2026-10-14') l
                     where l::text ilike '%Minh Thư%' or l::text like '%0900000077%' or l::text like '%1830000%'$$), 0::bigint,
              'YC7.1-NT4 QD11 lịch của Sale Hùng không có tên, số người đặt, tiền phòng');
select t.thoat();
select t.dang_nhap(t.id('lan'));
select t.bang(split_part(pg_temp.o(t.can('1509'), '2026-10-07'), '|', 1) || ',' || split_part(pg_temp.o(t.can('1509'), '2026-10-08'), '|', 1),
              'kin,kin', 'YC7.1-NT4 lần đọc sau của Sale Lan: 1509 kín 07/10, 08/10');
select t.bang(t.so($$select * from public.fn_sale_lich('2026-10-07', '2026-10-14') l
                     where l::text ilike '%Minh Thư%' or l::text like '%0900000077%' or l::text like '%1830000%'$$), 0::bigint,
              'YC7.1-NT4 QD11 lịch của Sale Lan không có tên, số người đặt, tiền phòng');
select t.thoat();

-- ===== YC7.1-NT5: căn tự nhập: "?" trừ đêm sale đã ghi ("Bạn"); không giá, không trống =====
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.o(t.can('villa'), '2026-10-08'), 'ban|-', 'YC7.1-NT5 Villa Tuần Châu đêm 08/10 có V2: ô "Bạn", không giá');
select t.bang(pg_temp.o(t.can('villa'), '2026-10-07'), 'chua_biet|-', 'YC7.1-NT5 Villa Tuần Châu đêm 07/10: ô "?", không giá');
select t.bang(pg_temp.o(t.can('villa'), '2026-10-09'), 'chua_biet|-', 'YC7.1-NT5 QT2.1 Villa ngày trả 09/10 của V2: ô "?"');
select t.bang(t.so($$select * from public.fn_sale_lich('2026-10-07', '2026-10-14') where can_id = '00000000-0000-0000-0001-00000000f111'
                     and (o not in ('ban', 'chua_biet') or gia_ban is not null)$$), 0::bigint,
              'YC7.1-NT5 KT-DB.3.7 căn tự nhập không ô nào trống, kín hay có giá');
select t.bang(t.so($$select * from public.fn_sale_lich('2026-10-07', '2026-10-14') where can_id <> '00000000-0000-0000-0001-00000000f111'
                     and o not in ('kin', 'trong')$$), 0::bigint,
              'YC7.1-NT5 căn có lịch chỉ có ô kín hay trống');
select t.thoat();
-- Đặt phòng căn tự nhập đã hủy không còn ghi "Bạn".
update public.booking set trang_thai = 'da_huy' where id = t.b('V2');
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.o(t.can('villa'), '2026-10-08'), 'chua_biet|-', 'YC7.1-NT5 QT2.1 đặt phòng căn tự nhập đã hủy: ô về "?"');
select t.thoat();
update public.booking set trang_thai = 'hieu_luc' where id = t.b('V2');

-- ===== YC7.1-NT6: ngừng, xóa tài khoản, xóa căn =====
-- Chị Hoa ngừng Sale Hùng.
select t.dang_nhap(t.id('hoa'));
select t.bang(t.gt(format('public.fn_ngung_cho_xem(%L)', t.kn('hoa', 'hung'))), 'chu_ngung', 'YC7.1-NT6 Chị Hoa ngừng cho Sale Hùng xem');
select t.thoat();
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.o(t.can('1509'), '2026-10-08'), 'không có dòng', 'YC7.1-NT6 Chị Hoa ngừng Sale Hùng: không còn 1509');
select t.bang(pg_temp.o(t.can('3402'), '2026-10-08'), 'không có dòng', 'YC7.1-NT6 Chị Hoa ngừng Sale Hùng: không còn 3402');
select t.bang(pg_temp.so_can(array['nguon', 'tu_nhap']), 3::bigint, 'YC7.1-NT6 Chị Hoa ngừng Sale Hùng: nguồn phòng còn 3 căn');
select t.bang(pg_temp.so_can(array['cua_toi']), 2::bigint, 'YC7.1-NT6 Chị Hoa ngừng Sale Hùng: căn của tôi vẫn 2');
select t.thoat();
update public.ket_noi set trang_thai = 'da_ket_noi', ngung_luc = null where id = t.kn('hoa', 'hung');

-- Chị Hoa xóa tài khoản (QD13: chỉ xóa số điện thoại, đánh dấu đã xóa).
update public.profiles set da_xoa_luc = now(), so_dien_thoai = null where id = t.id('hoa');
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.o(t.can('1509'), '2026-10-08'), 'không có dòng', 'YC7.1-NT6 PQ23.SALE Chị Hoa xóa tài khoản: không còn 1509');
select t.bang(pg_temp.so_can(array['nguon', 'tu_nhap']), 3::bigint, 'YC7.1-NT6 PQ23.SALE Chị Hoa xóa tài khoản: nguồn phòng còn 3 căn');
select t.bang(t.so($$select * from public.fn_sale_lich('2026-10-07', '2026-10-14') where ten_chu = 'Chị Hoa'$$), 0::bigint,
              'YC7.1-NT6 PQ23.SALE không còn dòng nào của Chị Hoa');
select t.thoat();
select t.dang_nhap(t.id('lan'));
select t.bang(pg_temp.so_can(array['cua_toi', 'nguon', 'tu_nhap']), 0::bigint, 'YC7.1-NT6 PQ23.SALE Chị Hoa xóa tài khoản: lịch của Sale Lan rỗng');
select t.thoat();
update public.profiles set da_xoa_luc = null, so_dien_thoai = '0900000001' where id = t.id('hoa');

-- Chị Hoa xóa căn 3402 (ẩn căn, YC3.6).
update public.can set an_luc = now() where id = t.can('3402');
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.o(t.can('3402'), '2026-10-08'), 'không có dòng', 'YC7.1-NT6 Chị Hoa xóa căn 3402: không còn 3402');
select t.bang(pg_temp.so_can(array['nguon', 'tu_nhap']), 4::bigint, 'YC7.1-NT6 Chị Hoa xóa căn 3402: nguồn phòng còn 4 căn');
select t.thoat();
update public.can set an_luc = null where id = t.can('3402');

-- Căn của tôi, căn tự nhập đã xóa (ẩn) cũng không còn.
update public.can set an_luc = now() where id in (t.can('villa'), '00000000-0000-0000-0001-000000431605');
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.so_can(array['cua_toi']), 1::bigint, 'YC7.1-NT6 căn của tôi đã xóa không còn trong lịch');
select t.bang(pg_temp.so_can(array['tu_nhap']), 0::bigint, 'YC7.1-NT6 căn tự nhập đã xóa không còn trong lịch');
select t.thoat();
update public.can set an_luc = null where id in (t.can('villa'), '00000000-0000-0000-0001-000000431605');

-- ===== Vi phạm quyền (YC7 "Ai được làm gì") =====
-- Sale chưa kết nối (Nga có lời xin chưa được đồng ý), chưa có căn: lịch rỗng (YC7.1 bước 1).
select t.dang_nhap(t.id('nga'));
select t.bang(t.so($$select * from public.fn_sale_lich('2026-10-07', '2026-10-14')$$), 0::bigint,
              'YC7.1-NT6 PQ4.SALE Sale Nga chưa kết nối, chưa có căn: lịch trả rỗng');
select t.thoat();
-- Căn ngoài phạm vi: Lan chỉ được xem 1509.
select t.dang_nhap(t.id('lan'));
select t.bang(pg_temp.o(t.can('3402'), '2026-10-08'), 'không có dòng', 'YC7.1-NT6 PQ3.SALE căn 3402 ngoài phạm vi của Sale Lan không có');
select t.bang(pg_temp.o(t.can('1103'), '2026-10-08'), 'không có dòng', 'YC7.1-NT6 PQ3.SALE căn 1103 của chủ chưa kết nối Lan không có');
-- Căn của tôi, căn tự nhập của Sale Hùng không có trong lịch của Sale Lan.
select t.bang(pg_temp.o('00000000-0000-0000-0001-000000430812', '2026-10-08'), 'không có dòng',
              'YC7.1-NT6 PQ13.SALE căn Green Bay 0812 của Sale Hùng không có trong lịch của Sale Lan');
select t.bang(pg_temp.o(t.can('villa'), '2026-10-08'), 'không có dòng',
              'YC7.1-NT6 PQ14.SALE căn tự nhập Villa Tuần Châu của Sale Hùng không có trong lịch của Sale Lan');
select t.bang(pg_temp.so_can(array['cua_toi', 'nguon', 'tu_nhap']), 1::bigint, 'YC7.1-NT6 Sale Lan chỉ có 1 căn (1509)');
select t.thoat();
-- Chủ nhà không đọc được mức cộng, giá bán của sale: Chị Hoa gọi lệnh chỉ thấy căn của mình với giá chủ nhà.
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.o(t.can('3402'), '2026-10-08'), 'trong|800000',
              'YC7.1 PQ11.CHU Chị Hoa gọi fn_sale_lich: 3402 ghi giá của chính chủ 800.000đ, không có giá bán của Sale Hùng');
select t.bang(t.so($$select * from public.fn_sale_lich('2026-10-07', '2026-10-14') where nhom <> 'cua_toi'$$), 0::bigint,
              'YC7.1 PQ11.CHU Chị Hoa không nhận căn nguồn hay căn tự nhập của sale nào');
select t.bang(pg_temp.o(t.can('villa'), '2026-10-08'), 'không có dòng', 'YC7.1 PQ14.CHU Chị Hoa không thấy căn tự nhập của Sale Hùng');
select t.thoat();
-- Người chưa đăng nhập bị từ chối.
select t.khach();
select t.loi($$select * from public.fn_sale_lich('2026-10-07', '2026-10-14')$$, '42501',
             'YC7.1 PQ4.LINK người chưa đăng nhập gọi fn_sale_lich thì bị từ chối');
select t.thoat();

-- ===== Khoảng ngày =====
select t.dang_nhap(t.id('hung'));
select t.loi($$select * from public.fn_sale_lich('2026-10-14', '2026-10-07')$$, 'P0001', 'YC7.1 khoảng ngược bị từ chối');
select t.loi($$select * from public.fn_sale_lich(null, '2026-10-14')$$, 'P0001', 'YC7.1 thiếu ngày bị từ chối');
select t.loi($$select * from public.fn_sale_lich('2026-10-01', '2026-12-01')$$, 'P0001', 'YC7.1 khoảng quá 31 đêm bị từ chối');
-- Bước 6: lùi, tiến 7 ngày đọc khoảng mới (tuần vắt qua tháng chưa đặt giá thì không giá, vẫn có dòng).
select t.bang(t.so($$select * from public.fn_sale_lich('2026-10-14', '2026-10-21')$$), 49::bigint, 'YC7.1 bước 6 tiến 7 ngày: 49 dòng');
select t.bang(pg_temp.o('00000000-0000-0000-0001-000000430812', '2026-11-02', '2026-10-28', '2026-11-04'), 'trong|-',
              'YC7.1 bước 6 Green Bay 0812 chưa đặt giá tháng 11: trống, không giá');
select t.thoat();

-- ===== Sắp xếp "Bán nhiều nhất" (YC7-H9): đặt phòng chưa hủy của chính sale, ngày nhận trong 90 ngày gần nhất =====
select t.tao_booking('BH1', t.can('1103'), public.local_today() - 10, public.local_today() - 8, 1400000, t.id('hung'), 'tu_yeu_cau');
select t.tao_booking('BH2', t.can('1103'), public.local_today() - 30, public.local_today() - 29, 700000, t.id('hung'), 'tu_yeu_cau');
select t.tao_booking('BH3', t.can('1103'), public.local_today() - 120, public.local_today() - 119, 700000, t.id('hung'), 'tu_yeu_cau');
select t.tao_booking('BL1', t.can('1509'), public.local_today() - 5, public.local_today() - 4, 900000, t.id('lan'), 'tu_yeu_cau');
select t.dang_nhap(t.id('hung'));
select t.bang(t.gt($$(select so_ban from public.fn_sale_lich('2026-10-07', '2026-10-14') where can_id = '00000000-0000-0000-0001-000000001103' limit 1)$$),
              '2', 'YC7.1 Sắp xếp Bán nhiều nhất: 1103 có 2 đặt phòng của Hùng trong 90 ngày (không tính đặt phòng 120 ngày trước)');
select t.bang(t.gt($$(select so_ban from public.fn_sale_lich('2026-10-07', '2026-10-14') where can_id = '00000000-0000-0000-0001-000000001509' limit 1)$$),
              '0', 'YC7.1 Sắp xếp Bán nhiều nhất: đặt phòng 1509 của Sale Lan không tính cho Hùng');
select t.thoat();
