-- US29 · Ghi đặt phòng cho sale (YC5.4). Viết trước code (US29-TA1, CL14.5): task sau không sửa kỳ vọng của file này.
-- Hợp đồng: chủ nhà gọi fn_tao_booking(..., p_sale_id => sale) như YC5.3. Database thêm phần riêng của sale đó với giá bán
-- điền sẵn = từng đêm (tiền đêm của đặt phòng + mức cộng của sale cho căn, không có thì mức mặc định), làm tròn lên 50.000đ
-- từng đêm khi sale bật làm tròn (QT5.4, GD13; YC5-H13 Claude tự chốt US29), rồi cộng các đêm. Thông báo "chủ ghi đặt phòng
-- cho bạn" cho sale (US28). Tên, số khách chủ gửi kèm không ghi (QD11, YC5-H12).
-- QT1, QT2, QT3.1, QT4, QT5.4, QT5.6, QT6.2, QD11, PQ4, PQ7, PQ8, PQ9, PQ11, PQ17, KT-DB.3.6.
select t.fixture();

-- DLM.3: Sale Lan bật làm tròn 50 nghìn, mức cộng mặc định +120.000đ, không có mức riêng cho 1509.
insert into public.cai_dat_rieng (nguoi_id, muc_cong_mac_dinh, lam_tron_50k) values (t.id('lan'), 120000, true);

create or replace function pg_temp.luu(p_ten text, v text) returns void language sql as $$
  select set_config('t.' || p_ten, coalesce(v, ''), true)
$$;
create or replace function pg_temp.doc(p_ten text) returns text language sql stable as $$
  select nullif(current_setting('t.' || p_ten, true), '')
$$;

-- ===== YC5.4-NT1: Chị Hoa ghi 1509 20/10 → 22/10, tiền phòng 1.800.000đ, người đặt Sale Hùng =====
select t.dang_nhap(t.id('hoa'));
select pg_temp.luu('b1', t.gt($$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-10-20',
  p_ngay_tra => '2026-10-22', p_tien_phong => 1800000, p_sale_id => t.id('hung'),
  p_ten_khach => 'Khách Chủ Ghi', p_sdt_khach => '0900000044', p_so_khach => 2)$$));
select t.thoat();

select t.bang((select r.tien_thu_khach from public.booking_rieng r
               where r.booking_id = pg_temp.doc('b1')::uuid and r.nguoi_id = t.id('hung')), 2200000::bigint,
              'YC5.4-NT1 QT5.4 phần riêng của Hùng có giá bán điền sẵn 2.200.000đ (1.800.000đ + 2 × 200.000đ)');
select t.dang_nhap(t.id('hung'));
select t.bang((select r.tien_thu_khach from public.booking_rieng r where r.booking_id = pg_temp.doc('b1')::uuid), 2200000::bigint,
              'YC5.4-NT1 Hùng đọc phần riêng của mình: giá bán 2.200.000đ');
select t.bang((public.fn_thong_ke_sale('2026-10-01') ->> 'tien_chenh'), '400000',
              'YC5.4-NT1 QT3.1 tiền chênh tháng 10 của Hùng 400.000đ (2.200.000đ − 1.800.000đ)');
select t.thoat();
select t.bang((select b.nguon || '|' || b.sale_id::text || '|' || b.tien_phong from public.booking b where b.id = pg_temp.doc('b1')::uuid),
              'chu_ghi|' || t.id('hung')::text || '|1800000', 'YC5.4-NT1 đặt phòng do chủ ghi, Hùng đứng tên, tiền phòng 1.800.000đ');
select t.ok(pg_temp.doc('b1') is not null
            and not exists (select 1 from public.booking_rieng r where r.booking_id = pg_temp.doc('b1')::uuid
                              and r.nguoi_id = t.id('hoa') and r.tien_thu_khach is not null),
            'YC5.4-NT1 QD11 phần của Chị Hoa không có giá bán của sale');

-- ===== YC5.4-NT2: thông báo cho Hùng =====
select t.dang_nhap(t.id('hung'));
select t.bang((select tb.loai || '|' || (tb.noi_dung ->> 'ma_can') || '|' || (tb.noi_dung ->> 'ngay_nhan') || '|'
                      || (tb.noi_dung ->> 'ngay_tra')
               from public.thong_bao tb where tb.doi_tuong_id = pg_temp.doc('b1')::uuid),
              'chu_ghi_dat_phong_cho_sale|1509|2026-10-20|2026-10-22',
              'YC5.4-NT2 Hùng có thông báo "chủ ghi đặt phòng cho bạn" kèm căn và ngày ở');
select t.thoat();

-- ===== YC5.4-NT3: Hùng không thấy tên, số khách Chị Hoa gửi kèm =====
select t.dang_nhap(t.id('hung'));
select t.ok(not exists (select 1 from public.booking_rieng r
                        where r.booking_id = pg_temp.doc('b1')::uuid
                          and (r.ten_khach is not null or r.sdt_khach is not null)),
            'YC5.4-NT3 QD11 phần Hùng đọc không có tên và số khách Chị Hoa nhập');
select t.ok(coalesce(t.so('select 1 from public.booking'), 0) = 0,
            'YC5.4-NT3 PQ8.SALE KT-DB.3.5 Hùng không đọc bảng đặt phòng');
select t.ok(position('0900000044' in coalesce(public.fn_thong_ke_sale('2026-10-01')::text, '')) = 0
            and position('Khách Chủ Ghi' in coalesce(public.fn_thong_ke_sale('2026-10-01')::text, '')) = 0,
            'YC5.4-NT3 thống kê của Hùng không có tên, số khách');
select t.thoat();
select t.ok(not exists (select 1 from public.booking_rieng r where r.booking_id = pg_temp.doc('b1')::uuid
                          and (r.ten_khach = 'Khách Chủ Ghi' or r.sdt_khach = '0900000044')),
            'YC5.4-NT3 QD11 YC5-H12 tên, số khách chủ gửi kèm đặt phòng có sale không được lưu ở đâu');

-- ===== YC5-H13 (Claude tự chốt): sale bật làm tròn thì giá bán điền sẵn làm tròn lên 50.000đ từng đêm =====
select t.dang_nhap(t.id('hoa'));
select pg_temp.luu('b2', t.gt($$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-10-27',
  p_ngay_tra => '2026-10-29', p_tien_phong => 1800000, p_sale_id => t.id('lan'))$$));
select t.thoat();
select t.bang((select r.tien_thu_khach from public.booking_rieng r
               where r.booking_id = pg_temp.doc('b2')::uuid and r.nguoi_id = t.id('lan')), 2100000::bigint,
              'YC5.4-NT1 QT5.4 GD13 Lan: mỗi đêm 900.000đ + 120.000đ làm tròn lên 1.050.000đ, hai đêm 2.100.000đ');

-- Chủ gõ tiền phòng khác bảng giá: giá chủ từng đêm theo QT4.2 rồi mới cộng mức cộng.
select t.dang_nhap(t.id('hoa'));
select pg_temp.luu('b3', t.gt($$select public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => '2026-10-06',
  p_ngay_tra => '2026-10-09', p_tien_phong => 1000000, p_sale_id => t.id('hung'))$$));
select t.thoat();
select t.bang((select r.tien_thu_khach from public.booking_rieng r
               where r.booking_id = pg_temp.doc('b3')::uuid and r.nguoi_id = t.id('hung')), 2200000::bigint,
              'YC5.4-NT1 QT4.2 QT5.4 tiền phòng 1.000.000đ chia 3 đêm, cộng mức mặc định 3 × 400.000đ: 2.200.000đ');

-- ===== YC5.4-NT4: khách lẻ =====
select t.dang_nhap(t.id('hoa'));
select pg_temp.luu('b4', t.gt($$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-10-13',
  p_ngay_tra => '2026-10-15', p_tien_phong => 1800000, p_ten_khach => 'Khách Lẻ', p_sdt_khach => '0900000033')$$));
select t.thoat();
select t.ok(pg_temp.doc('b4') is not null
            and not exists (select 1 from public.thong_bao tb where tb.doi_tuong_id = pg_temp.doc('b4')::uuid),
            'YC5.4-NT4 khách lẻ: không sale nào có thông báo');
select t.ok(pg_temp.doc('b4') is not null
            and not exists (select 1 from public.booking_rieng r where r.booking_id = pg_temp.doc('b4')::uuid
                              and r.nguoi_id <> t.id('hoa')),
            'YC5.4-NT4 khách lẻ: không có phần riêng của sale nào');
select t.dang_nhap(t.id('hung'));
select t.bang(public.fn_thong_ke_sale('2026-10-01') ->> 'so_dat_phong', '2',
              'YC5.4-NT4 thống kê tháng 10 của Hùng chỉ có 2 đặt phòng chủ ghi cho Hùng, không có đặt phòng khách lẻ');
select t.thoat();
select t.dang_nhap(t.id('lan'));
select t.bang(public.fn_thong_ke_sale('2026-10-01') ->> 'so_dat_phong', '1',
              'YC5.4-NT4 thống kê tháng 10 của Lan chỉ có đặt phòng chủ ghi cho Lan');
select t.thoat();

-- ===== YC5.4-NT5: sale không kết nối, không được xem căn =====
select t.dang_nhap(t.id('hoa'));
select t.loi($$select public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => '2026-11-03', p_ngay_tra => '2026-11-04',
                 p_tien_phong => 800000, p_sale_id => t.id('nga'))$$,
             'Sale này không đang kết nối với bạn', 'YC5.4-NT5 PQ17.CHU sale không kết nối với Chị Hoa: từ chối');
select t.thoat();
update public.ket_noi set pham_vi = 'chon_can' where id = t.kn('hoa', 'lan');
delete from public.ket_noi_can where ket_noi_id = t.kn('hoa', 'lan');
insert into public.ket_noi_can (ket_noi_id, can_id) values (t.kn('hoa', 'lan'), t.can('3402'));
select t.dang_nhap(t.id('hoa'));
select t.loi($$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-11-03', p_ngay_tra => '2026-11-04',
                 p_tien_phong => 900000, p_sale_id => t.id('lan'))$$,
             'Sale này không được xem căn này', 'YC5.4-NT5 PQ4.SALE Lan chỉ được chia sẻ 3402, Chị Hoa ghi 1509: từ chối');
select t.thoat();
select t.ok(not exists (select 1 from public.booking b where b.ngay_nhan = '2026-11-03'),
            'YC5.4-NT5 bị từ chối thì không có đặt phòng nào được ghi');
-- Sale đã bị ngừng chia sẻ.
update public.ket_noi set trang_thai = 'chu_ngung', ngung_luc = now() where id = t.kn('hoa', 'hung');
select t.dang_nhap(t.id('hoa'));
select t.loi($$select public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => '2026-11-05', p_ngay_tra => '2026-11-06',
                 p_tien_phong => 800000, p_sale_id => t.id('hung'))$$,
             'Sale này không đang kết nối với bạn', 'YC5.4-NT5 chủ đã ngừng chia sẻ cho Hùng: từ chối');
select t.thoat();

-- ===== PQ11, QD11: sale không tự ghi phần riêng hay đặt phòng cho căn chủ nhà =====
select t.dang_nhap(t.id('hung'));
select t.ok(t.ma_loi(format($$insert into public.booking_rieng (booking_id, nguoi_id, tien_thu_khach) values (%L, %L, 1)$$,
                            pg_temp.doc('b4'), t.id('hung'))) is not null,
            'YC5.4-NT1 PQ11 sale không tự thêm phần riêng vào đặt phòng của chủ nhà');
select t.loi($$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-11-10', p_ngay_tra => '2026-11-11',
                 p_tien_phong => 900000, p_sale_id => t.id('hung'))$$,
             '42501', 'YC5.4-NT5 PQ7.SALE sale không ghi đặt phòng cho căn của chủ nhà');
select t.thoat();
