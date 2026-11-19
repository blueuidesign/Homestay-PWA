-- KT-DB.3.2 · Chặn trùng ở database: ràng buộc booking_khong_trung (QD6, QT1.1, QT1.2, QT1.3).
-- Yêu cầu đang chờ không chiếm đêm. Ghi thẳng bằng vai chủ database: ràng buộc phải chặn cả khi không qua app.
select t.fixture();

select t.bang((select contype::text from pg_constraint
               where conrelid = 'public.booking'::regclass and conname = 'booking_khong_trung'),
              'x', 'KT-DB.3.2 danh mục: booking_khong_trung là ràng buộc exclude trên booking');

-- B1: 1509, 10/10 → 12/10 (DLM.4), sale Hùng.
select t.tao_booking('B1', t.can('1509'), '2026-10-10', '2026-10-12', 2200000, t.id('hung'));

select t.bang((select dem from public.booking where id = t.b('B1')), daterange('2026-10-10', '2026-10-12', '[)'),
              'KT-DB.3.2 QT2.1 cột dem tự sinh = các đêm từ ngày nhận tới trước ngày trả');

select t.loi($$select t.tao_booking(null, t.can('1509'), '2026-10-11', '2026-10-13', 1800000)$$, '23P01',
             'KT-DB.3.2 QT1.1-VD1 1509 11/10 → 13/10 trùng đêm 11/10 của B1 bị từ chối');
select t.khong_loi($$select t.tao_booking(null, t.can('1509'), '2026-10-12', '2026-10-13', 900000)$$,
             'KT-DB.3.2 QT1.1-VD2 1509 12/10 → 13/10 lưu được (12/10 là ngày trả của B1)');
select t.khong_loi($$select t.tao_booking(null, t.can('3402'), '2026-10-10', '2026-10-12', 1900000)$$,
             'KT-DB.3.2 QT1.1-VD3 3402 10/10 → 12/10 lưu được (khác căn)');
select t.loi($$select t.tao_booking(null, t.can('1509'), '2026-10-09', '2026-10-14', 4000000)$$, '23P01',
             'KT-DB.3.2 QT1.1 booking bao trùm B1 bị từ chối');

-- QT1.2: sửa booking bỏ chính nó ra khi kiểm trùng.
select t.tao_booking('B5', t.can('1509'), '2026-10-13', '2026-10-15', 1800000);
select t.khong_loi($$update public.booking set tien_phong = 2000000 where id = t.b('B1')$$,
             'KT-DB.3.2 QT1.2-VD1 B1 giữ ngày, đổi tiền lưu được');
select t.loi($$update public.booking set ngay_tra = '2026-10-14' where id = t.b('B1')$$, '23P01',
             'KT-DB.3.2 QT1.2-VD2 B1 thành 10/10 → 14/10 trùng đêm 13/10 của B5 bị từ chối');

-- QT1.3: căn tự nhập chỉ chặn trùng trong chính căn đó.
select t.tao_booking('V2', t.can('villa'), '2026-10-08', '2026-10-09', 1400000);
select t.loi($$select t.tao_booking(null, t.can('villa'), '2026-10-08', '2026-10-10', 2800000)$$, '23P01',
             'KT-DB.3.2 QT1.3-VD1 Villa Tuần Châu của Hùng 08/10 → 10/10 trùng đêm 08/10 bị từ chối');
insert into public.can (id, nguoi_giu, loai, ma_can, chu_can_ten, gia_chu_thuong, gia_chu_cuoi_tuan)
values ('00000000-0000-0000-0001-00000000f222', t.id('lan'), 'tu_nhap', 'Villa Tuần Châu', 'Chú Bình', 1400000, 1400000);
select t.khong_loi($$select t.tao_booking(null, '00000000-0000-0000-0001-00000000f222', '2026-10-08', '2026-10-09', 1400000)$$,
             'KT-DB.3.2 QT1.3-VD2 Villa Tuần Châu của Lan 08/10 → 09/10 lưu được (hai căn tự nhập khác nhau)');

-- Booking đã hủy không chiếm đêm (booking khách lẻ, không có sale đứng tên).
select t.khong_loi($$update public.booking set trang_thai = 'da_huy' where id = t.b('B5')$$,
             'KT-DB.3.2 hủy booking khách lẻ B5');
select t.khong_loi($$select t.tao_booking(null, t.can('1509'), '2026-10-13', '2026-10-15', 1800000)$$,
             'KT-DB.3.2 đêm của booking đã hủy ghi lại được');
select t.loi($$update public.booking set trang_thai = 'hieu_luc' where id = t.b('B5')$$, '23P01',
             'KT-DB.3.2 khôi phục booking đã hủy mà đêm đã có booking khác bị từ chối');

-- Yêu cầu đang chờ không chiếm đêm.
select t.tao_yeu_cau('Y1', t.can('3402'), t.id('hung'), '2026-10-17', '2026-10-19');
select t.tao_yeu_cau('Y2', t.can('3402'), t.id('lan'), '2026-10-17', '2026-10-19');
select t.khong_loi($$select t.tao_booking(null, t.can('3402'), '2026-10-17', '2026-10-19', 1900000)$$,
             'KT-DB.3.2 yêu cầu đang chờ không chiếm đêm: chủ ghi booking 3402 17/10 → 19/10 được');

-- Ngày trả phải sau ngày nhận.
select t.loi($$insert into public.booking (can_id, ngay_nhan, ngay_tra, nguon, tao_boi, tien_phong)
               values (t.can('1103'), '2026-10-20', '2026-10-20', 'chu_ghi', t.id('tuan'), 0)$$, '23514',
             'KT-DB.3.2 QT2.1 booking ngày trả bằng ngày nhận bị từ chối');
