-- US6 · Xuất file CSV (YC1.6). Lệnh đếm fn_dem_xuat_csv và lệnh xuất fn_xuat_csv dùng chung một bộ lọc.
-- YC1.6-NT1, NT4, NT5, luật kiểm của YC1.6, YC1 "Ai được làm gì" (PQ1, PQ20), QT6.1, QT6.5.
-- Câu tự chốt (QD25): YC1-H2 theo ngày nhận, YC1-H3 bỏ đặt phòng đã hủy, YC1-H4 "Tất cả" gồm căn đã xóa,
-- YC1-H5 sale không xuất (PQ20.SALE), YC1-H9 giữ cột Khách, SĐT chỉ với khách chủ nhà tự nhập.
-- Viết trước migration (US6-TA1, CL14.5). Số theo DLM.4.
select t.fixture();

create or replace function pg_temp.dem(p_tu date, p_den date, p_can uuid[] default null) returns text language sql as $$
  select t.gt(format('select public.fn_dem_xuat_csv(%L::date, %L::date, %L::uuid[])', p_tu, p_den, p_can))
$$;
create or replace function pg_temp.dong(p_tu date, p_den date, p_can uuid[] default null) returns text language sql as $$
  select t.gt(format('select count(*) from public.fn_xuat_csv(%L::date, %L::date, %L::uuid[])', p_tu, p_den, p_can))
$$;
create or replace function pg_temp.loi(p_tu date, p_den date, p_can uuid[] default null) returns text language sql as $$
  select t.ma_loi(format('select count(*) from public.fn_xuat_csv(%L::date, %L::date, %L::uuid[])', p_tu, p_den, p_can))
$$;
create or replace function pg_temp.loi_dem(p_tu date, p_den date, p_can uuid[] default null) returns text language sql as $$
  select t.ma_loi(format('select public.fn_dem_xuat_csv(%L::date, %L::date, %L::uuid[])', p_tu, p_den, p_can))
$$;
-- Một ô của dòng có ngày nhận p_nhan ở căn p_ma (đọc bằng vai hiện tại).
create or replace function pg_temp.o(p_cot text, p_ma text, p_nhan date) returns text language sql as $$
  select t.gt(format('select %I::text from public.fn_xuat_csv(''2026-10-01'', ''2026-12-31'') where ma_can = %L and ngay_nhan = %L',
                     p_cot, p_ma, p_nhan))
$$;

-- ===== Danh mục =====
select t.ok((select count(*) from pg_proc where proname in ('fn_dem_xuat_csv', 'fn_xuat_csv')
             and pronamespace = 'public'::regnamespace and prosecdef) = 2,
            'YC1.6 danh mục: có lệnh đếm fn_dem_xuat_csv và lệnh xuất fn_xuat_csv chạy security definer');
select t.ok(not exists (select 1 from pg_proc p where p.proname in ('fn_dem_xuat_csv', 'fn_xuat_csv')
                        and p.pronamespace = 'public'::regnamespace and has_function_privilege('anon', p.oid, 'execute')),
            'YC1.6 danh mục PQ1, PQ20.KHACH: người chưa đăng nhập không gọi được lệnh đếm, lệnh xuất');

-- ===== Dữ liệu: B1 đến B9 của Chị Hoa (DLM.4), thêm các ca loại trừ =====
select t.tao_booking('B1', t.can('1509'), '2026-10-10', '2026-10-12', 2200000, t.id('hung'), 'tu_yeu_cau');
update public.booking set trang_thai_tien = 'da_coc', tien_coc = 1000000 where id = t.b('B1');
select t.tao_booking('B2', t.can('3402'), '2026-10-17', '2026-10-19', 1900000, t.id('lan'), 'tu_yeu_cau');
update public.booking set trang_thai_tien = 'chua_coc' where id = t.b('B2');
select t.tao_booking('B3', t.can('1509'), '2026-10-04', '2026-10-06', 1800000, t.id('hung'), 'tu_yeu_cau');
update public.booking set trang_thai_tien = 'da_thanh_toan' where id = t.b('B3');
select t.tao_booking('B4', t.can('3402'), '2026-10-05', '2026-10-07', 1600000, t.id('lan'), 'tu_yeu_cau');
update public.booking set trang_thai_tien = 'da_thanh_toan' where id = t.b('B4');
select t.tao_booking('B5', t.can('1509'), '2026-10-13', '2026-10-15', 1800000);
update public.booking set trang_thai_tien = 'chua_coc', ghi_chu = 'Khách xin nhận sớm' where id = t.b('B5');
select t.tao_booking('B6', t.can('3402'), '2026-10-14', '2026-10-15', 800000);
update public.booking set trang_thai_tien = 'da_thanh_toan' where id = t.b('B6');
select t.tao_booking('B7', t.can('1509'), '2026-10-19', '2026-10-20', 900000, t.id('hung'), 'tu_yeu_cau');
update public.booking set trang_thai_tien = 'da_thanh_toan' where id = t.b('B7');
select t.tao_booking('B8', t.can('3402'), '2026-10-21', '2026-10-22', 800000, t.id('hung'), 'tu_yeu_cau');
update public.booking set trang_thai_tien = 'da_thanh_toan' where id = t.b('B8');
select t.tao_booking('B9', t.can('3402'), '2026-11-30', '2026-12-02', 1600000, t.id('hung'), 'tu_yeu_cau');
update public.booking set trang_thai_tien = 'da_thanh_toan' where id = t.b('B9');
-- Đặt phòng đã hủy trong tháng 10 (YC1-H3): không vào file.
select t.tao_booking('BH', t.can('1509'), '2026-10-25', '2026-10-27', 1800000);
update public.booking set trang_thai = 'da_huy' where id = t.b('BH');
-- Đặt phòng của Anh Tuấn tháng 10: không vào file của Chị Hoa.
select t.tao_booking('BT', t.can('1103'), '2026-10-10', '2026-10-11', 700000);
-- Đặt phòng sale Hùng tự ghi ở căn tự nhập: không vào file nào.
select t.tao_booking('BV', t.can('villa'), '2026-10-10', '2026-10-11', 1400000);
-- Khách: B1 do Sale Hùng nhập, thu khách 2.600.000đ (giá bán); B5 do Chị Hoa nhập (QD11).
insert into public.booking_rieng (booking_id, nguoi_id, ten_khach, sdt_khach, so_khach, tien_thu_khach)
values (t.b('B1'), t.id('hung'), 'Khách của Hùng', '0900000088', 2, 2600000),
       (t.b('B5'), t.id('hoa'), 'Khách Mai', '0900000077', 2, null);

-- ===== YC1.6-NT1: Tháng này (tháng 10), Tất cả rồi 1509 =====
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.dem('2026-10-01', '2026-10-31'), '8', 'YC1.6-NT1 Chị Hoa chọn tháng 10 và "Tất cả" thì lệnh đếm ra 8 đặt phòng');
select t.bang(pg_temp.dong('2026-10-01', '2026-10-31'), '8', 'YC1.6-NT1 file tháng 10 "Tất cả" có đúng 8 dòng');
select t.bang(pg_temp.dem('2026-10-01', '2026-10-31', array[t.can('1509')]), '4', 'YC1.6-NT1 chọn "1509" thì 4 đặt phòng');
select t.bang(pg_temp.dong('2026-10-01', '2026-10-31', array[t.can('1509')]), '4', 'YC1.6-NT1 file "1509" có đúng 4 dòng');
select t.bang(t.gt(format('select string_agg(ngay_nhan::text, '','' order by ord) from public.fn_xuat_csv(''2026-10-01'', ''2026-10-31'', %L::uuid[]) with ordinality as x(ma_can, ngay_nhan, ngay_tra, so_dem, ten_khach, sdt_khach, ten_sale, sale_da_xoa, tong_tien, da_coc, con_lai, ghi_chu, ord)', array[t.can('1509')])),
              '2026-10-04,2026-10-10,2026-10-13,2026-10-19', 'YC1.6 dòng xếp theo ngày nhận tăng dần');
select t.bang(pg_temp.dem('2026-09-01', '2026-09-30'), '0', 'YC1.6-NT6 khoảng không có đặt phòng thì lệnh đếm ra 0 (P8-00)');

-- ===== YC1-H2: theo ngày nhận =====
select t.bang(pg_temp.dem('2026-11-01', '2026-11-30'), '1', 'YC1-H2 tháng 11 có B9 (nhận 30/11)');
select t.bang(pg_temp.dem('2026-12-01', '2026-12-31'), '0', 'YC1-H2 tháng 12 không có B9 dù có một đêm 01/12 (tính theo ngày nhận)');

-- ===== Cột và tiền (QT6.1) =====
select t.bang(pg_temp.o('so_dem', '1509', '2026-10-10'), '2', 'YC1.6 B1 số đêm 2');
select t.bang(pg_temp.o('ngay_tra', '1509', '2026-10-10'), '2026-10-12', 'YC1.6 B1 ngày trả 12/10');
select t.bang(pg_temp.o('tong_tien', '1509', '2026-10-10'), '2200000', 'YC1.6 B1 tổng tiền là tiền phòng giá chủ nhà 2.200.000đ');
select t.bang(pg_temp.o('da_coc', '1509', '2026-10-10'), '1000000', 'QT6.1 B1 đã cọc 1.000.000đ');
select t.bang(pg_temp.o('con_lai', '1509', '2026-10-10'), '1200000', 'QT6.1 B1 còn lại 1.200.000đ');
select t.bang(pg_temp.o('ten_sale', '1509', '2026-10-10'), 'Sale Hùng', 'YC1.6 B1 cột Sale là Sale Hùng');
select t.bang(pg_temp.o('da_coc', '3402', '2026-10-17'), '0', 'QT6.1 B2 chưa cọc: đã cọc 0');
select t.bang(pg_temp.o('con_lai', '3402', '2026-10-17'), '1900000', 'QT6.1 B2 chưa cọc: còn lại cả tiền phòng');
select t.bang(pg_temp.o('con_lai', '1509', '2026-10-04'), '0', 'QT6.1 B3 đã thanh toán: còn lại 0');
select t.bang(pg_temp.o('ten_sale', '1509', '2026-10-13'), null::text, 'YC1.6 B5 khách lẻ: cột Sale trống');
select t.bang(pg_temp.o('ghi_chu', '1509', '2026-10-13'), 'Khách xin nhận sớm', 'YC1.6 B5 có ghi chú của đặt phòng');

-- ===== YC1.6-NT4, PQ20.CHU, QD11: khách do sale nhập không vào file, không có giá bán =====
select t.bang(pg_temp.o('ten_khach', '1509', '2026-10-10'), null::text, 'YC1.6-NT4 B1 có khách do Sale Hùng nhập thì ô Khách trống');
select t.bang(pg_temp.o('sdt_khach', '1509', '2026-10-10'), null::text, 'YC1.6-NT4 B1 ô SĐT trống');
select t.bang(t.gt($$select count(*) from public.fn_xuat_csv('2026-10-01', '2026-12-31') x
                     where 2600000 in (x.tong_tien, x.da_coc, x.con_lai) or concat_ws('|', x.ten_khach, x.sdt_khach, x.ghi_chu) like '%2600000%'$$),
              '0', 'YC1.6-NT4 không ô nào có 2.600.000 (giá bán của sale)');
select t.bang(pg_temp.o('ten_khach', '1509', '2026-10-13'), 'Khách Mai', 'PQ20.CHU B5 có tên khách do Chị Hoa tự nhập (YC1-H9)');
select t.bang(pg_temp.o('sdt_khach', '1509', '2026-10-13'), '0900000077', 'PQ20.CHU B5 có số khách do Chị Hoa tự nhập (YC1-H9)');

-- ===== YC1-H4: "Tất cả" gồm căn đã xóa =====
select t.thoat();
update public.can set an_luc = now() where id = t.can('3402');
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.dem('2026-10-01', '2026-10-31'), '8', 'YC1-H4 căn 3402 đã xóa: "Tất cả" vẫn gồm đặt phòng của căn đó (8)');
select t.thoat();
update public.can set an_luc = null where id = t.can('3402');

-- ===== QT6.5: sale đã xóa tài khoản =====
update public.profiles set so_dien_thoai = null, da_xoa_luc = now() where id = t.id('lan');
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.o('sale_da_xoa', '3402', '2026-10-17'), 'true', 'QT6.5 B2 của Sale Lan đã xóa tài khoản: dòng có dấu đã xóa');
select t.bang(pg_temp.o('ten_sale', '3402', '2026-10-17'), 'Sale Lan', 'QT6.5 B2 vẫn giữ tên cũ của Sale Lan');
select t.thoat();
update public.profiles set so_dien_thoai = '0900000004', da_xoa_luc = null where id = t.id('lan');

-- ===== YC1.6-NT5, PQ20: người khác, sale, khách chưa đăng nhập bị từ chối =====
select t.dang_nhap(t.id('tuan'));
select t.bang(pg_temp.loi('2026-10-01', '2026-10-31', array[t.can('1509')]), '42501', 'YC1.6-NT5 Anh Tuấn xuất với căn 1509 thì database từ chối');
select t.bang(pg_temp.loi_dem('2026-10-01', '2026-10-31', array[t.can('1509')]), '42501', 'YC1.6-NT5 Anh Tuấn đếm với căn 1509 cũng bị từ chối');
select t.bang(pg_temp.loi('2026-10-01', '2026-10-31', array[t.can('1103'), t.can('1509')]), '42501', 'YC1.6-NT5 Anh Tuấn gộp căn mình với 1509 cũng bị từ chối');
select t.bang(pg_temp.dem('2026-10-01', '2026-10-31'), '1', 'PQ20.CHU Anh Tuấn chọn "Tất cả" chỉ thấy đặt phòng căn mình (1)');
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.loi('2026-10-01', '2026-10-31', array[t.can('1509')]), '42501', 'YC1.6-NT5 Sale Hùng xuất với căn được chia sẻ thì database từ chối');
select t.bang(pg_temp.loi('2026-10-01', '2026-10-31'), '42501', 'PQ20.SALE Sale Hùng xuất "Tất cả" cũng bị từ chối');
select t.bang(pg_temp.loi('2026-10-01', '2026-10-31', array[t.can('villa')]), '42501', 'PQ20.SALE YC1-H5 Sale Hùng xuất căn tự nhập của mình cũng bị từ chối');
select t.bang(pg_temp.loi_dem('2026-10-01', '2026-10-31'), '42501', 'PQ20.SALE Sale Hùng không đếm được');
select t.khach();
select t.ok(pg_temp.loi('2026-10-01', '2026-10-31') is not null, 'YC1.6-NT5 PQ1 người chưa đăng nhập bị từ chối');

-- ===== Luật kiểm của YC1.6 =====
select t.dang_nhap(t.id('hoa'));
select t.loi($$select public.fn_dem_xuat_csv('2026-10-31', '2026-10-01')$$, 'Chọn tối đa 1 năm', 'YC1.6 luật kiểm: đến ngày trước từ ngày thì "Chọn tối đa 1 năm"');
select t.loi($$select public.fn_dem_xuat_csv('2026-01-01', '2027-01-02')$$, 'Chọn tối đa 1 năm', 'YC1.6 luật kiểm: quá 366 ngày thì "Chọn tối đa 1 năm"');
select t.bang(pg_temp.dem('2026-01-01', '2027-01-01'), '9', 'YC1.6 luật kiểm: đúng 366 ngày thì qua (năm 2026 thêm một ngày)');
select t.loi($$select public.fn_xuat_csv(null, '2026-10-01')$$, 'Chọn tối đa 1 năm', 'YC1.6 luật kiểm: thiếu từ ngày thì từ chối');
select t.loi(format('select public.fn_dem_xuat_csv(%L, %L, %L::uuid[])', '2026-10-01', '2026-10-31',
                    (select array_agg(t.can('1509')) from generate_series(1, 51))),
             'Không tìm thấy', 'YC1.6 luật kiểm: quá 50 căn thì "Không tìm thấy"');
select t.bang(pg_temp.loi('2026-10-01', '2026-10-31', array[gen_random_uuid()]), '42501', 'YC1.6 luật kiểm: căn không có thì "Không tìm thấy"');
select t.thoat();
