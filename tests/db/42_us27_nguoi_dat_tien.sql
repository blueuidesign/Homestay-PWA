-- US27 · Người đặt, tiền phòng, trạng thái tiền (YC5.2). Lệnh ghi fn_tao_booking (create or replace của US27),
-- hàm giá chủ nhà từng đêm fn_gia_chu_cac_dem, hàm tên khách đã dùng fn_ten_khach_da_dung.
-- YC5 "Ai được làm gì": PQ7.CHU, PQ9, PQ17.CHU có test vi phạm ở cuối file. Số theo DLM.3 (1509: thường 900.000đ,
-- cuối tuần 1.300.000đ, tháng 10 tới 12/2026; tháng 1/2027 chưa đặt giá).
select t.fixture();

-- Số booking chưa hủy của một căn (đọc bằng vai chủ database).
create or replace function pg_temp.so_booking(p_can uuid) returns bigint language sql as $$
  select count(*) from public.booking where can_id = p_can and trang_thai <> 'da_huy'
$$;
-- Tiền từng đêm của booking, dạng "2026-10-31:1300000,2026-11-01:900000" (đọc bằng vai chủ database).
create or replace function pg_temp.tien_dem(p_id uuid) returns text language sql as $$
  select string_agg(dem::text || ':' || tien, ',' order by dem) from public.booking_dem where booking_id = p_id
$$;
-- Ghi một booking bằng vai hiện tại, cất id vào t.ma_<ma>. Lỗi thì id rỗng (t.gt in lỗi ra NOTICE).
create or replace function pg_temp.ghi(p_ma text, p_cau text) returns void language plpgsql as $$
begin
  perform set_config('t.ma_' || lower(p_ma), coalesce(t.gt(p_cau), ''), true);
end $$;

-- ===== Danh mục =====
select t.ok((select bool_and(prosecdef) from pg_proc
             where proname in ('fn_tao_booking', 'fn_gia_chu_cac_dem', 'fn_ten_khach_da_dung') and pronamespace = 'public'::regnamespace)
            and (select count(distinct proname) from pg_proc
                 where proname in ('fn_tao_booking', 'fn_gia_chu_cac_dem', 'fn_ten_khach_da_dung') and pronamespace = 'public'::regnamespace) = 3,
            'YC5.2 danh mục: fn_tao_booking, fn_gia_chu_cac_dem, fn_ten_khach_da_dung có và chạy security definer');
select t.ok(not exists (select 1 from pg_proc p where p.proname in ('fn_gia_chu_cac_dem', 'fn_ten_khach_da_dung')
                          and p.pronamespace = 'public'::regnamespace and has_function_privilege('anon', p.oid, 'execute')),
            'YC5.2 danh mục PQ7.LINK: người chưa đăng nhập không có quyền gọi fn_gia_chu_cac_dem, fn_ten_khach_da_dung');
select t.ok((select count(*) from information_schema.columns
             where table_schema = 'public' and table_name = 'booking' and column_name in ('gio_nhan', 'gio_tra')) = 2,
            'YC5.2-NT11 danh mục: booking có cột gio_nhan, gio_tra');

-- ===== YC5.2-NT1 (database): giá chủ nhà từng đêm của 1509, nhận 31/10 trả 02/11 (QT4.1-VD1) =====
select t.dang_nhap(t.id('hoa'));
select t.bang(t.gt($$select string_agg(dem::text || ':' || coalesce(gia::text, 'chua_co'), ',' order by dem)
                     from public.fn_gia_chu_cac_dem(t.can('1509'), '2026-10-31', '2026-11-02')$$),
              '2026-10-31:1300000,2026-11-01:900000',
              'YC5.2-NT1 QT4.1-VD1 hàm giá từng đêm của 1509 31/10 → 02/11: 31/10 1.300.000đ, 01/11 900.000đ');
select t.bang(t.gt($$select sum(gia) from public.fn_gia_chu_cac_dem(t.can('1509'), '2026-10-31', '2026-11-02')$$),
              '2200000', 'YC5.2-NT1 QT4.1-VD1 tổng giá chủ nhà hai đêm là 2.200.000đ');
-- YC5.2-NT5 (dữ liệu cho màn), QT5.3 mục 4: đêm chưa có giá trả null, không phải 0.
select t.bang(t.gt($$select string_agg(dem::text || ':' || coalesce(gia::text, 'chua_co'), ',' order by dem)
                     from public.fn_gia_chu_cac_dem(t.can('1509'), '2026-12-30', '2027-01-02')$$),
              '2026-12-30:900000,2026-12-31:900000,2027-01-01:chua_co',
              'YC5.2-NT1 QT5.3 1509 30/12 → 02/01: đêm tháng 1/2027 chưa đặt giá trả "chưa có giá" (null)');
select t.bang(t.gt($$select count(*) from public.fn_gia_chu_cac_dem(t.can('1509'), '2026-12-30', '2027-01-02')$$),
              '3', 'YC5.2-NT1 QT2.1 khoảng 30/12 → 02/01 có ba đêm (ngày trả không phải đêm)');
-- QT5.3 mục 1: giá dịp thay giá tháng (3402, dịp 24/10 – 25/10 1.300.000đ; 23/10 là đêm thứ Sáu 1.100.000đ).
select t.bang(t.gt($$select string_agg(dem::text || ':' || coalesce(gia::text, 'chua_co'), ',' order by dem)
                     from public.fn_gia_chu_cac_dem(t.can('3402'), '2026-10-23', '2026-10-26')$$),
              '2026-10-23:1100000,2026-10-24:1300000,2026-10-25:1300000',
              'YC5.2-NT1 QT5.3 giá dịp thay giá tháng: 3402 24/10, 25/10 là 1.300.000đ');
select t.thoat();

-- ===== YC5.2-NT2 (database): tiền từng đêm khi lưu (QT4.2) =====
select t.dang_nhap(t.id('hoa'));
select pg_temp.ghi('vd3', $$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-10-31', p_ngay_tra => '2026-11-02',
                                                         p_tien_phong => 2200000, p_client_id => gen_random_uuid())$$);
select t.khong_loi('set constraints all immediate', 'YC5.2-NT2 KT-DB.3.10 tiền từng đêm khớp tiền phòng 2.200.000đ');
select t.thoat();
select t.bang(pg_temp.tien_dem(t.b('vd3')), '2026-10-31:1300000,2026-11-01:900000',
              'YC5.2-NT2 QT4.2-VD3 giữ 2.200.000đ thì đêm 31/10 1.300.000đ, đêm 01/11 900.000đ');
delete from public.booking where id = t.b('vd3');

select t.dang_nhap(t.id('hoa'));
select pg_temp.ghi('vd1', $$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-10-31', p_ngay_tra => '2026-11-02',
                                                         p_tien_phong => 2000000, p_client_id => gen_random_uuid())$$);
select t.khong_loi('set constraints all immediate', 'YC5.2-NT2 KT-DB.3.10 tiền từng đêm khớp tiền phòng 2.000.000đ');
select t.thoat();
select t.bang(pg_temp.tien_dem(t.b('vd1')), '2026-10-31:1000000,2026-11-01:1000000',
              'YC5.2-NT2 QT4.2-VD1 gõ 2.000.000đ thì mỗi đêm 1.000.000đ');

select t.dang_nhap(t.id('hoa'));
select pg_temp.ghi('vd2', $$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-12-01', p_ngay_tra => '2026-12-04',
                                                         p_tien_phong => 1000000, p_client_id => gen_random_uuid())$$);
select t.khong_loi('set constraints all immediate', 'YC5.2-NT2 KT-DB.3.10 tiền từng đêm khớp tiền phòng 1.000.000đ');
select t.thoat();
select t.bang(pg_temp.tien_dem(t.b('vd2')), '2026-12-01:333333,2026-12-02:333333,2026-12-03:333334',
              'YC5.2-NT2 QT4.2-VD2 3 đêm gõ 1.000.000đ thì 333.333đ, 333.333đ, 333.334đ (đêm cuối nhận phần lẻ)');

-- Có đêm chưa có giá thì không có tổng bảng giá để giữ: chia đều, kể cả khi số gõ bằng tổng các đêm có giá.
select t.dang_nhap(t.id('hoa'));
select pg_temp.ghi('thieu', $$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-12-30', p_ngay_tra => '2027-01-02',
                                                           p_tien_phong => 1800000, p_client_id => gen_random_uuid())$$);
select t.thoat();
select t.bang(pg_temp.tien_dem(t.b('thieu')), '2026-12-30:600000,2026-12-31:600000,2027-01-01:600000',
              'YC5.2-NT2 QT4.2 có đêm chưa đặt giá thì chia đều tiền phòng cho các đêm');

-- ===== YC5.2-NT4: lệnh không có tiền phòng gửi thẳng tới database =====
select t.dang_nhap(t.id('hoa'));
select t.loi($$select public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => '2026-11-10', p_ngay_tra => '2026-11-12',
                                            p_tien_phong => null, p_client_id => gen_random_uuid())$$,
             'Cần nhập tiền phòng', 'YC5.2-NT4 lệnh không có tiền phòng thì database từ chối với câu "Cần nhập tiền phòng"');
select t.bang(t.ma_loi($$select public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => '2026-11-10', p_ngay_tra => '2026-11-12',
                                                      p_tien_phong => null)$$), 'P0001',
              'YC5.2-NT4 QT5.5 câu "Cần nhập tiền phòng" trả mã P0001');
select t.loi($$select public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => '2026-11-10', p_ngay_tra => '2026-11-12')$$,
             'Cần nhập tiền phòng', 'YC5.2-NT4 lệnh bỏ hẳn tham số tiền phòng thì database từ chối (database không tự điền)');
select t.thoat();
select t.bang(pg_temp.so_booking(t.can('3402')), 0::bigint, 'YC5.2-NT4 lịch 3402 không đổi sau lệnh thiếu tiền phòng');

-- ===== YC5.2-NT7: tiền cọc lớn hơn tiền phòng (giả định GD20); trạng thái tiền (QT6.1) =====
select t.dang_nhap(t.id('hoa'));
select t.loi($$select public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => '2026-11-14', p_ngay_tra => '2026-11-16',
                                            p_tien_phong => 2200000, p_trang_thai_tien => 'da_coc_con_thu', p_tien_coc => 3000000)$$,
             'Tiền cọc không được lớn hơn tiền phòng',
             'YC5.2-NT7 GD20 cọc 3.000.000đ, tiền phòng 2.200.000đ thì database từ chối "Tiền cọc không được lớn hơn tiền phòng"');
select t.bang(t.ma_loi($$select public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => '2026-11-14', p_ngay_tra => '2026-11-16',
                                                      p_tien_phong => 2200000, p_trang_thai_tien => 'da_coc_con_thu', p_tien_coc => 3000000)$$),
              'P0001', 'YC5.2-NT7 QT5.5 câu tiền cọc trả mã P0001');
select t.thoat();
select t.bang(pg_temp.so_booking(t.can('3402')), 0::bigint, 'YC5.2-NT7 lịch 3402 không đổi sau lệnh cọc lớn hơn tiền phòng');

select t.dang_nhap(t.id('hoa'));
select pg_temp.ghi('coc', $$select public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => '2026-11-14', p_ngay_tra => '2026-11-16',
                     p_tien_phong => 2200000, p_trang_thai_tien => 'da_coc_con_thu', p_tien_coc => 2200000)$$);
select pg_temp.ghi('coc_trong', $$select public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => '2026-11-16', p_ngay_tra => '2026-11-17',
                     p_tien_phong => 800000, p_trang_thai_tien => 'da_coc_con_thu', p_tien_coc => null)$$);
select pg_temp.ghi('tt', $$select public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => '2026-11-17', p_ngay_tra => '2026-11-18',
                     p_tien_phong => 800000, p_trang_thai_tien => 'da_thanh_toan', p_tien_coc => 500000)$$);
select pg_temp.ghi('chua', $$select public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => '2026-11-18', p_ngay_tra => '2026-11-19',
                     p_tien_phong => 800000)$$);
select t.loi($$select public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => '2026-11-19', p_ngay_tra => '2026-11-20',
                                            p_tien_phong => 800000, p_trang_thai_tien => 'da_tra_mot_nua')$$,
             'Trạng thái tiền không hợp lệ', 'YC5.3 Luật kiểm trạng thái tiền lạ thì từ chối "Trạng thái tiền không hợp lệ"');
select t.loi($$select public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => '2026-11-19', p_ngay_tra => '2026-11-20',
                                            p_tien_phong => 800000, p_trang_thai_tien => null)$$,
             'Trạng thái tiền không hợp lệ', 'YC5.3 Luật kiểm thiếu trạng thái tiền thì từ chối "Trạng thái tiền không hợp lệ"');
select t.thoat();
select t.bang(t.gt($$select trang_thai_tien || '|' || coalesce(tien_coc::text, '-') from public.booking where id = t.b('coc')$$),
              'da_coc|2200000', 'YC5.2-NT7 GD20 cọc bằng tiền phòng thì lưu được, trạng thái đã cọc, cọc 2.200.000đ');
select t.bang(t.gt($$select trang_thai_tien || '|' || coalesce(tien_coc::text, '-') from public.booking where id = t.b('coc_trong')$$),
              'da_coc|-', 'YC5.2 bước 8b YC5-H19 "Đã cọc · còn thu" để trống tiền cọc vẫn lưu được');
select t.bang(t.gt($$select trang_thai_tien || '|' || coalesce(tien_coc::text, '-') from public.booking where id = t.b('tt')$$),
              'da_thanh_toan|-', 'YC5.2 bước 8b chọn "Đã thanh toán" thì tiền cọc gửi kèm bị bỏ');
select t.bang(t.gt($$select trang_thai_tien || '|' || coalesce(tien_coc::text, '-') from public.booking where id = t.b('chua')$$),
              'chua_coc|-', 'YC5.2 bước 8a GD19 không gửi trạng thái tiền thì là "Chưa cọc"');

-- ===== YC5.2-NT11: giờ nhận, giờ trả lấy theo cài đặt của chủ nhà lúc lưu =====
select t.dang_nhap(t.id('hoa'));
select pg_temp.ghi('gio1', $$select public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => '2026-11-20', p_ngay_tra => '2026-11-21',
                     p_tien_phong => 800000)$$);
select t.thoat();
select t.bang(t.gt($$select to_char(gio_nhan, 'HH24:MI') || '→' || to_char(gio_tra, 'HH24:MI') from public.booking where id = t.b('gio1')$$),
              '14:00→12:00', 'YC5.2-NT11 không mở "Thêm chi tiết" thì giờ nhận, giờ trả là 14:00, 12:00 theo cài đặt của Chị Hoa');
update public.profiles set gio_nhan = '15:30', gio_tra = '11:00' where id = t.id('hoa');
select t.dang_nhap(t.id('hoa'));
select pg_temp.ghi('gio2', $$select public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => '2026-11-21', p_ngay_tra => '2026-11-22',
                     p_tien_phong => 800000)$$);
select pg_temp.ghi('gio3', $$select public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => '2026-11-22', p_ngay_tra => '2026-11-23',
                     p_tien_phong => 800000, p_gio_nhan => '13:00', p_gio_tra => '10:00')$$);
select t.thoat();
select t.bang(t.gt($$select to_char(gio_nhan, 'HH24:MI') || '→' || to_char(gio_tra, 'HH24:MI') from public.booking where id = t.b('gio2')$$),
              '15:30→11:00', 'YC5.2-NT11 cài đặt của Chị Hoa đổi thành 15:30, 11:00 thì đặt phòng lưu sau đó lấy 15:30, 11:00');
select t.bang(t.gt($$select to_char(gio_nhan, 'HH24:MI') || '→' || to_char(gio_tra, 'HH24:MI') from public.booking where id = t.b('gio3')$$),
              '13:00→10:00', 'YC5.2 bước 8c giờ nhận, giờ trả gửi kèm thì lưu đúng giờ đó');
select t.bang(t.gt($$select to_char(gio_nhan, 'HH24:MI') || '→' || to_char(gio_tra, 'HH24:MI') from public.booking where id = t.b('gio1')$$),
              '14:00→12:00', 'YC5.2-NT11 đặt phòng đã lưu giữ giờ lúc lưu khi cài đặt đổi sau đó');
update public.profiles set gio_nhan = '14:00', gio_tra = '12:00' where id = t.id('hoa');

-- ===== YC5.2-NT12, NT9, NT13: khách lẻ, tên đã dùng, số điện thoại khách (phần riêng của chủ nhà, QD11) =====
select t.dang_nhap(t.id('hoa'));
select pg_temp.ghi('ba_lan', $$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-11-03', p_ngay_tra => '2026-11-04',
                     p_tien_phong => 900000, p_ten_khach => '  Bà Lan  ', p_so_khach => 4)$$);
select t.bang(t.gt($$select ten_khach || '|' || so_khach from public.booking_rieng where booking_id = t.b('ba_lan')$$),
              'Bà Lan|4', 'YC5.2-NT12 Chị Hoa chọn "Khách lẻ", gõ tên "Bà Lan" rồi lưu thì đọc lại được tên (bỏ khoảng trắng) và số khách');
select t.ok(coalesce(t.gt($$select bool_or(ten = 'Bà Lan') from public.fn_ten_khach_da_dung()$$), 'false')::boolean,
            'YC5.2-NT12 lần mở form sau, tên đã dùng của Chị Hoa có "Bà Lan"');
select t.bang(t.gt($$select sale_id is null and nguon = 'chu_ghi' from public.booking where id = t.b('ba_lan')$$), 'true',
              'YC5.2 bước 6b đặt phòng khách lẻ có tên vẫn là khách lẻ (không có sale)');
select t.thoat();

select t.dang_nhap(t.id('hoa'));
select pg_temp.ghi('dung', $$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-11-04', p_ngay_tra => '2026-11-05',
                     p_tien_phong => 900000, p_ten_khach => 'Dung Đỗ', p_sdt_khach => '0912.345.678')$$);
select t.loi($$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-11-05', p_ngay_tra => '2026-11-06',
                                            p_tien_phong => 900000, p_sdt_khach => '0912 345')$$,
             'Số điện thoại khách không hợp lệ', 'YC5.2-NT13 số "0912 345" (7 chữ số) thì database từ chối "Số điện thoại khách không hợp lệ"');
select t.loi($$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-11-05', p_ngay_tra => '2026-11-06',
                                            p_tien_phong => 900000, p_sdt_khach => '0912-345-678-90')$$,
             'Số điện thoại khách không hợp lệ', 'YC5.2-NT13 số 12 chữ số thì database từ chối');
select t.loi($$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-11-05', p_ngay_tra => '2026-11-06',
                                            p_tien_phong => 900000, p_sdt_khach => '09a2345678')$$,
             'Số điện thoại khách không hợp lệ', 'YC5.2-NT13 số có chữ cái thì database từ chối');
select t.bang(t.ma_loi($$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-11-05', p_ngay_tra => '2026-11-06',
                                                      p_tien_phong => 900000, p_sdt_khach => '0912 345')$$), 'P0001',
              'YC5.2-NT13 QT5.5 câu số điện thoại trả mã P0001');
select t.bang(t.gt($$select sdt_khach from public.booking_rieng where booking_id = t.b('dung')$$), '0912345678',
              'YC5.2-NT13 số "0912.345.678" lưu được (bỏ dấu chấm) và Chị Hoa đọc lại được');
select t.thoat();
select t.bang(t.so($$select * from public.booking where can_id = t.can('1509') and ngay_nhan = '2026-11-05'$$), 0::bigint,
              'YC5.2-NT13 lệnh có số sai không ghi đặt phòng nào');

-- YC5.2-NT13, PQ9: chỉ chủ nhà đọc được số, tên khách.
select t.dang_nhap(t.id('tuan'));
select t.ok(coalesce(t.so($$select * from public.booking_rieng where booking_id = t.b('dung')$$), 0) = 0,
            'YC5.2-NT13 PQ9.CHU Anh Tuấn không đọc được số, tên khách Chị Hoa nhập');
select t.thoat();
select t.dang_nhap(t.id('hung'));
select t.ok(coalesce(t.so($$select * from public.booking_rieng where booking_id = t.b('dung')$$), 0) = 0,
            'YC5.2-NT13 PQ9.SALE Sale Hùng không đọc được số, tên khách Chị Hoa nhập');
select t.thoat();

-- YC5.2-NT9: thứ tự tên đã dùng (mới nhất trước, mỗi tên một lần, tối đa 10).
update public.booking set tao_luc = now() - interval '10 days' where id = t.b('ba_lan');
update public.booking set tao_luc = now() - interval '5 days' where id = t.b('dung');
select t.dang_nhap(t.id('hoa'));
select t.bang(t.gt($$select string_agg(ten, ',') from public.fn_ten_khach_da_dung()$$), 'Dung Đỗ,Bà Lan',
              'YC5.2-NT9 tên đã dùng của Chị Hoa: mới nhất trước ("Dung Đỗ" ghi sau "Bà Lan")');
do $$
declare i int;
begin
  for i in 1..11 loop
    perform public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => date '2027-03-01' + i, p_ngay_tra => date '2027-03-01' + i + 1,
                                  p_tien_phong => 800000, p_ten_khach => 'Khách ' || i);
  end loop;
end $$;
select pg_temp.ghi('dung2', $$select public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => '2027-04-01', p_ngay_tra => '2027-04-02',
                     p_tien_phong => 800000, p_ten_khach => 'Dung Đỗ')$$);
select t.thoat();
update public.booking set tao_luc = now() - interval '4 days' + (extract(day from ngay_nhan) || ' hours')::interval
  where can_id = t.can('3402') and ngay_nhan between '2027-03-02' and '2027-03-12';
update public.booking set tao_luc = now() where id = t.b('dung2');
select t.dang_nhap(t.id('hoa'));
select t.bang(t.gt($$select string_agg(ten, ',') from public.fn_ten_khach_da_dung()$$),
              'Dung Đỗ,Khách 11,Khách 10,Khách 9,Khách 8,Khách 7,Khách 6,Khách 5,Khách 4,Khách 3',
              'YC5.2-NT9 tên đã dùng: mới nhất trước, "Dung Đỗ" dùng lại chỉ hiện một lần, tối đa 10 tên');
select t.thoat();

-- YC5.2-NT9 (RLS): Anh Tuấn mở form của mình thì không thấy "Dung Đỗ" của Chị Hoa.
select t.dang_nhap(t.id('tuan'));
select t.bang(coalesce(t.gt($$select count(*) from public.fn_ten_khach_da_dung()$$), '0'), '0',
              'YC5.2-NT9 PQ9.CHU Anh Tuấn gọi fn_ten_khach_da_dung không thấy tên khách nào của Chị Hoa');
select t.ok(coalesce(t.so($$select * from public.booking_rieng where ten_khach = 'Dung Đỗ'$$), 0) = 0,
            'YC5.2-NT9 PQ9.CHU Anh Tuấn đọc thẳng booking_rieng không thấy "Dung Đỗ"');
select t.thoat();
select t.dang_nhap(t.id('hung'));
select t.bang(coalesce(t.gt($$select count(*) from public.fn_ten_khach_da_dung()$$), '0'), '0',
              'YC5.2-NT9 PQ9.SALE Sale Hùng gọi fn_ten_khach_da_dung không thấy tên khách nào của Chị Hoa');
select t.thoat();
select t.khach();
select t.loi($$select * from public.fn_ten_khach_da_dung()$$, '42501',
             'YC5.2-NT9 PQ9.LINK người chưa đăng nhập gọi fn_ten_khach_da_dung thì bị từ chối');
select t.thoat();

-- ===== YC5.2 bước 6c, YC5.3 Luật kiểm "Người đặt": chọn sale làm người đặt (PQ17.CHU) =====
select t.dang_nhap(t.id('hoa'));
select pg_temp.ghi('sale', $$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-11-06', p_ngay_tra => '2026-11-07',
                     p_tien_phong => 900000, p_sale_id => t.id('hung'), p_ten_khach => 'Khách Của Sale', p_sdt_khach => '0912345678',
                     p_so_khach => 2)$$);
select t.thoat();
select t.bang(t.gt($$select sale_id::text || '|' || nguon || '|' || tao_boi::text from public.booking where id = t.b('sale')$$),
              t.id('hung')::text || '|chu_ghi|' || t.id('hoa')::text,
              'YC5.2 bước 6c Chị Hoa chọn Sale Hùng (đang kết nối, xem mọi căn) thì đặt phòng 1509 có Sale Hùng làm người đặt');
select t.bang(t.gt($$select count(*) from public.booking_rieng where booking_id = t.b('sale') and (ten_khach is not null or sdt_khach is not null)$$),
              '0', 'YC5.2-NT12 QD11 chọn sale thì không ghi tên, số điện thoại khách vào phần riêng của chủ nhà');
select t.dang_nhap(t.id('hoa'));
select t.ok(not coalesce(t.gt($$select bool_or(ten = 'Khách Của Sale') from public.fn_ten_khach_da_dung()$$), 'false')::boolean,
            'YC5.2-NT12 tên gửi kèm đặt phòng có sale không thành tên khách đã dùng của chủ nhà');
select t.thoat();

select t.dang_nhap(t.id('hoa'));
select t.khong_loi($$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-11-07', p_ngay_tra => '2026-11-08',
                                                  p_tien_phong => 900000, p_sale_id => t.id('lan'))$$,
                   'YC5.3 Luật kiểm PQ17.CHU Sale Lan (chỉ được xem 1509) làm người đặt cho 1509 thì lưu được');
select t.loi($$select public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => '2026-11-25', p_ngay_tra => '2026-11-26',
                                            p_tien_phong => 800000, p_sale_id => t.id('lan'))$$,
             'Sale này không được xem căn này',
             'YC5.3 Luật kiểm PQ17.CHU Sale Lan (chỉ được xem 1509) làm người đặt cho 3402 thì từ chối "Sale này không được xem căn này"');
select t.loi($$select public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => '2026-11-25', p_ngay_tra => '2026-11-26',
                                            p_tien_phong => 800000, p_sale_id => t.id('nga'))$$,
             'Sale này không đang kết nối với bạn',
             'YC5.3 Luật kiểm PQ17.CHU ghi với Sale Nga (không kết nối Chị Hoa) thì từ chối "Sale này không đang kết nối với bạn"');
select t.loi($$select public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => '2026-11-25', p_ngay_tra => '2026-11-26',
                                            p_tien_phong => 800000, p_sale_id => t.id('tuan'))$$,
             'Sale này không đang kết nối với bạn',
             'YC5.3 Luật kiểm PQ17.CHU ghi với người không phải sale của mình (Anh Tuấn) thì từ chối');
select t.thoat();
update public.ket_noi set trang_thai = 'chu_ngung' where id = t.kn('hoa', 'hung');
select t.dang_nhap(t.id('hoa'));
select t.loi($$select public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => '2026-11-25', p_ngay_tra => '2026-11-26',
                                            p_tien_phong => 800000, p_sale_id => t.id('hung'))$$,
             'Sale này không đang kết nối với bạn',
             'YC5.3 Luật kiểm PQ17.CHU Chị Hoa đã ngừng cho Sale Hùng xem thì ghi với Sale Hùng bị từ chối');
select t.thoat();
update public.ket_noi set trang_thai = 'da_ket_noi' where id = t.kn('hoa', 'hung');
select t.bang(t.so($$select * from public.booking where can_id = t.can('3402') and ngay_nhan = '2026-11-25'$$), 0::bigint,
              'YC5.3 PQ17.CHU lệnh ghi với sale không hợp lệ không ghi đặt phòng nào');

-- ===== YC5.3 Luật kiểm dùng cho YC5.2: độ dài tên, số khách, ghi chú, tiền cọc =====
select t.dang_nhap(t.id('hoa'));
select t.loi($$select public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => '2026-11-26', p_ngay_tra => '2026-11-27',
                                            p_tien_phong => 800000, p_ten_khach => repeat('a', 101))$$,
             'Tên khách dài tối đa 100 ký tự', 'YC5.3 Luật kiểm tên khách 101 ký tự thì từ chối "Tên khách dài tối đa 100 ký tự"');
select t.loi($$select public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => '2026-11-26', p_ngay_tra => '2026-11-27',
                                            p_tien_phong => 800000, p_so_khach => 0)$$,
             'Số khách từ 1 đến 99', 'YC5.3 Luật kiểm số khách 0 thì từ chối "Số khách từ 1 đến 99"');
select t.loi($$select public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => '2026-11-26', p_ngay_tra => '2026-11-27',
                                            p_tien_phong => 800000, p_so_khach => 100)$$,
             'Số khách từ 1 đến 99', 'YC5.3 Luật kiểm số khách 100 thì từ chối "Số khách từ 1 đến 99"');
select t.loi($$select public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => '2026-11-26', p_ngay_tra => '2026-11-27',
                                            p_tien_phong => 800000, p_ghi_chu => repeat('a', 501))$$,
             'Ghi chú dài tối đa 500 ký tự', 'YC5.3 Luật kiểm ghi chú 501 ký tự thì từ chối "Ghi chú dài tối đa 500 ký tự"');
select t.loi($$select public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => '2026-11-26', p_ngay_tra => '2026-11-27',
                                            p_tien_phong => 800000, p_trang_thai_tien => 'da_coc_con_thu', p_tien_coc => 0)$$,
             'P0001', 'YC5.3 Luật kiểm tiền cọc 0 khi "Đã cọc · còn thu" thì từ chối (cọc phải lớn hơn 0)');
select t.thoat();
select t.bang(t.so($$select * from public.booking where can_id = t.can('3402') and ngay_nhan = '2026-11-26'$$), 0::bigint,
              'YC5.3 Luật kiểm lệnh sai dữ liệu không ghi đặt phòng nào');

-- ===== YC5 "Ai được làm gì": vi phạm quyền =====
-- PQ7.CHU: Sale Hùng (được chia sẻ 1509) không gọi được lệnh ghi vào căn của Chị Hoa, kể cả tự chọn mình làm người đặt.
select t.dang_nhap(t.id('hung'));
select t.loi($$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-11-28', p_ngay_tra => '2026-11-29',
                                            p_tien_phong => 900000, p_sale_id => t.id('hung'), p_ten_khach => 'Khách Hùng')$$,
             '42501', 'YC5.2 PQ7.SALE Sale Hùng gọi fn_tao_booking ghi vào 1509 của Chị Hoa thì database từ chối');
select t.loi($$select * from public.fn_gia_chu_cac_dem(t.can('1509'), '2026-10-31', '2026-11-02')$$,
             '42501', 'YC5.2-NT1 PQ5 Sale Hùng gọi hàm giá từng đêm của 1509 (lệnh của người giữ căn) thì bị từ chối');
select t.thoat();
-- PQ7.CHU: Anh Tuấn không ghi, không đọc giá từng đêm qua hàm của căn Chị Hoa; căn không có thật cùng một lỗi.
select t.dang_nhap(t.id('tuan'));
select t.loi($$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-11-28', p_ngay_tra => '2026-11-29',
                                            p_tien_phong => 900000, p_ten_khach => 'Khách Tuấn')$$,
             '42501', 'YC5.2 PQ7.CHU Anh Tuấn gọi fn_tao_booking ghi vào 1509 của Chị Hoa thì database từ chối');
select t.loi($$select * from public.fn_gia_chu_cac_dem(t.can('1509'), '2026-10-31', '2026-11-02')$$,
             '42501', 'YC5.2-NT1 PQ5.CHU Anh Tuấn gọi hàm giá từng đêm của 1509 thì bị từ chối');
select t.loi($$select * from public.fn_gia_chu_cac_dem(gen_random_uuid(), '2026-10-31', '2026-11-02')$$,
             '42501', 'YC5.2-NT1 căn không có thật trả cùng lỗi quyền với hàm giá từng đêm');
-- Ghi với sale của chủ nhà khác: Sale Hùng không kết nối Anh Tuấn.
select t.loi($$select public.fn_tao_booking(p_can_id => t.can('1103'), p_ngay_nhan => '2026-11-28', p_ngay_tra => '2026-11-29',
                                            p_tien_phong => 700000, p_sale_id => t.id('hung'))$$,
             'Sale này không đang kết nối với bạn',
             'YC5.2 PQ17.CHU Anh Tuấn ghi với Sale Hùng (không kết nối Anh Tuấn) thì database từ chối');
select t.thoat();
select t.khach();
select t.loi($$select * from public.fn_gia_chu_cac_dem(t.can('1509'), '2026-10-31', '2026-11-02')$$,
             '42501', 'YC5.2-NT1 PQ5.LINK người chưa đăng nhập gọi hàm giá từng đêm thì bị từ chối');
select t.thoat();
select t.bang(t.so($$select * from public.booking where ngay_nhan = '2026-11-28'$$), 0::bigint,
              'YC5.2 PQ7.CHU lịch không đổi sau các lệnh ghi bị từ chối');
