-- US11 · Doanh thu tháng (YC2.3). Lệnh đọc doanh thu tháng fn_doanh_thu_thang(p_thang date): một dòng gồm doanh_thu,
-- so_dem (đêm có khách, đếm theo đêm của từng căn), doanh_thu_thang_truoc. QT2.1, QT2.2, QD10, QD12, PQ16.
-- YC2 "Ai được làm gì": doanh thu chỉ tính căn của người hỏi; sale, chủ khác, người chưa đăng nhập có test vi phạm ở cuối.
-- Số theo DLM.4, DLM.5: tháng 10 của Chị Hoa 11.800.000đ, 13 đêm (1509: 7 đêm, 3402: 6 đêm). Tháng 9 dùng dữ liệu riêng
-- của file này, cộng 9.600.000đ (YC2.3: chưa thêm vào bộ mẫu).
select t.fixture();

-- DLM.4: B1 có Sale Hùng đứng tên; người bán khác không ảnh hưởng doanh thu nên để chủ tự ghi.
select t.tao_booking('B1', t.can('1509'), '2026-10-10', '2026-10-12', 2200000, t.id('hung'), 'tu_yeu_cau');
select t.tao_booking('B2', t.can('3402'), '2026-10-17', '2026-10-19', 1900000);
select t.tao_booking('B3', t.can('1509'), '2026-10-04', '2026-10-06', 1800000);
select t.tao_booking('B4', t.can('3402'), '2026-10-05', '2026-10-07', 1600000);
select t.tao_booking('B5', t.can('1509'), '2026-10-13', '2026-10-15', 1800000);
select t.tao_booking('B6', t.can('3402'), '2026-10-14', '2026-10-15', 800000);
select t.tao_booking('B7', t.can('1509'), '2026-10-19', '2026-10-20', 900000);
select t.tao_booking('B8', t.can('3402'), '2026-10-21', '2026-10-22', 800000);
select t.tao_booking('B9', t.can('3402'), '2026-11-30', '2026-12-02', 1600000);
-- Tháng 9 riêng của file: 6.000.000đ (1509, 6 đêm) + 3.600.000đ (3402, 4 đêm) = 9.600.000đ.
select t.tao_booking('S1', t.can('1509'), '2026-09-05', '2026-09-11', 6000000);
select t.tao_booking('S2', t.can('3402'), '2026-09-19', '2026-09-23', 3600000);
-- QD12: đặt phòng đã hủy trong tháng 10 (3402, 25/10 → 27/10, 2.000.000đ) không tính.
select t.tao_booking('H1', t.can('3402'), '2026-10-25', '2026-10-27', 2000000);
update public.booking set trang_thai = 'da_huy' where id = t.b('H1');
-- Chủ khác: Anh Tuấn có 1103, tháng 10 một đêm 700.000đ.
select t.tao_booking('T1', t.can('1103'), '2026-10-10', '2026-10-11', 700000);
-- Sale Hùng tự ghi ở căn tự nhập của mình (Villa Tuần Châu), tháng 10: không phải doanh thu chủ nhà (PQ16.SALE).
select t.tao_booking('V1', t.can('villa'), '2026-10-10', '2026-10-12', 2800000, t.id('hung'));

-- Một dòng của hàm, dạng "doanh_thu|so_dem|doanh_thu_thang_truoc", bằng vai hiện tại.
create or replace function pg_temp.dt(p_thang date) returns text language plpgsql as $$
begin
  return t.gt(format($q$select string_agg(doanh_thu || '|' || so_dem || '|' || doanh_thu_thang_truoc, ';')
                        from public.fn_doanh_thu_thang(%L)$q$, p_thang));
end $$;

-- ===== Danh mục =====
select t.ok(exists (select 1 from pg_proc where proname = 'fn_doanh_thu_thang'
                      and pronamespace = 'public'::regnamespace and prosecdef),
            'YC2.3-NT1 danh mục: fn_doanh_thu_thang có và chạy security definer');
select t.ok(not exists (select 1 from pg_proc p where p.proname = 'fn_doanh_thu_thang'
                          and p.pronamespace = 'public'::regnamespace and has_function_privilege('anon', p.oid, 'execute')),
            'YC2.3-NT1 PQ16.LINK người chưa đăng nhập không có quyền gọi fn_doanh_thu_thang');
select t.ok(not exists (select 1 from information_schema.routines r
                        join information_schema.parameters p on p.specific_name = r.specific_name
                        where r.routine_schema = 'public' and r.routine_name = 'fn_doanh_thu_thang' and p.parameter_mode = 'OUT'
                          and (p.parameter_name ilike '%gia_ban%' or p.parameter_name ilike '%chenh%' or p.parameter_name ilike '%muc_cong%')),
            'YC2.3-NT1 KT-DB.3.11 PQ11.CHU fn_doanh_thu_thang không có cột giá bán, mức cộng, tiền chênh');

-- ===== YC2.3-NT1: Chị Hoa xem tháng 10 =====
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.dt('2026-10-01'), '11800000|13|9600000',
              'YC2.3-NT1 Chị Hoa xem tháng 10: 11.800.000đ, 13 đêm có khách, tháng 9: 9.600.000đ (DLM.5)');
select t.bang(pg_temp.dt('2026-10-20'), '11800000|13|9600000',
              'YC2.3-NT1 ngày bất kỳ trong tháng 10 cho cùng số của tháng 10');
select t.thoat();

-- ===== YC2.3 bước 12: đổi tháng, QT2.2 đêm vắt qua hai tháng chia đúng tháng =====
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.dt('2026-11-01'), '800000|1|11800000',
              'YC2.3-NT1 QT2.2-VD1 tháng 11: B9 chỉ tính đêm 30/11 (800.000đ, 1 đêm), tháng trước 11.800.000đ');
select t.bang(pg_temp.dt('2026-12-01'), '800000|1|800000',
              'YC2.3-NT1 QT2.2-VD1 tháng 12: B9 chỉ tính đêm 01/12 (800.000đ, 1 đêm), tháng trước 800.000đ');
select t.bang(pg_temp.dt('2026-09-01'), '9600000|10|0',
              'YC2.3-NT1 tháng 9: 9.600.000đ, 10 đêm; tháng 8 không có doanh thu thì doanh thu tháng trước là 0');
select t.bang(pg_temp.dt('2027-01-01'), '0|0|800000',
              'YC2.3 bước 13 tháng không có đặt phòng: 0đ, 0 đêm (màn không hiện khối)');
select t.thoat();

-- ===== QD12: đặt phòng đã hủy không tính; hủy B1 thì tháng 10 giảm đúng tiền B1 =====
-- B1 có Sale Hùng đứng tên: hủy theo QD12 (chủ xin, sale đồng ý), trigger tg_booking_huy_hai_ben chặn hủy thẳng.
update public.booking set huy_xin_boi = t.id('hoa'), huy_xin_luc = now(), huy_tra_loi = 'dong_y',
       huy_tra_loi_boi = t.id('hung'), huy_tra_loi_luc = now(), trang_thai = 'da_huy'
 where id = t.b('B1');
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.dt('2026-10-01'), '9600000|11|9600000',
              'YC2.3-NT1 QD12 bỏ đặt phòng đã hủy: hủy B1 thì tháng 10 còn 9.600.000đ, 11 đêm');
select t.thoat();
update public.booking set trang_thai = 'hieu_luc' where id = t.b('B1');

-- ===== Tính cả căn đã ẩn (xóa) =====
update public.can set an_luc = now() where id = t.can('3402');
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.dt('2026-10-01'), '11800000|13|9600000',
              'YC2.3-NT1 tính cả căn đã xóa: ẩn 3402 thì tháng 10 vẫn 11.800.000đ, 13 đêm');
select t.thoat();
update public.can set an_luc = null where id = t.can('3402');

-- ===== Vi phạm quyền: doanh thu chỉ tính căn của người hỏi (YC2 "Ai được làm gì", PQ16) =====
-- PQ16.CHU: Anh Tuấn (chủ khác) chỉ thấy căn của mình.
select t.dang_nhap(t.id('tuan'));
select t.bang(pg_temp.dt('2026-10-01'), '700000|1|0',
              'YC2.3-NT1 PQ16.CHU Anh Tuấn (chủ khác) chỉ có doanh thu 1103, không có số của Chị Hoa');
select t.thoat();

-- PQ16.SALE: sale không bao giờ có doanh thu chủ nhà, kể cả sale được chia sẻ mọi căn của Chị Hoa.
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.dt('2026-10-01'), '0|0|0',
              'YC2.3-NT1 PQ16.SALE Sale Hùng (được xem mọi căn của Chị Hoa) gọi lệnh doanh thu tháng 10 thì 0, không có số của Chị Hoa');
select t.thoat();
select t.dang_nhap(t.id('lan'));
select t.bang(pg_temp.dt('2026-10-01'), '0|0|0',
              'YC2.3-NT1 PQ16.SALE Sale Lan (được xem 1509) gọi lệnh doanh thu tháng 10 thì 0');
select t.thoat();
select t.dang_nhap(t.id('nga'));
select t.bang(pg_temp.dt('2026-10-01'), '0|0|0',
              'YC2.3-NT1 PQ16.SALE Sale Nga (chưa kết nối) gọi lệnh doanh thu tháng 10 thì 0');
select t.thoat();

-- PQ16.LINK: người chưa đăng nhập bị từ chối.
select t.khach();
select t.loi($$select * from public.fn_doanh_thu_thang('2026-10-01')$$, '42501',
             'YC2.3-NT1 PQ16.LINK người chưa đăng nhập gọi lệnh doanh thu tháng thì bị từ chối');
select t.thoat();
