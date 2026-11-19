-- US26 · Mở form, chọn căn và ngày, kiểm trùng sớm (YC5.1). Lệnh ghi fn_tao_booking: phần US26 làm là kiểm căn và ngày.
-- YC5.1-NT2 (database): trùng đêm thì database từ chối (QT1.1-VD1, QD6). YC5.1-NT6: câu lỗi của ngày.
-- YC5 "Ai được làm gì", PQ7.CHU: chỉ người giữ căn ghi được; chủ nhà khác, sale được chia sẻ, người chưa đăng nhập thì không.
select t.fixture();

-- DLM.4: B1 1509 10/10 → 12/10 của Sale Hùng.
select t.tao_booking('B1', t.can('1509'), '2026-10-10', '2026-10-12', 2200000, t.id('hung'), 'tu_yeu_cau');

-- Số booking chưa hủy của một căn (đọc bằng vai chủ database).
create or replace function pg_temp.so_booking(p_can uuid) returns bigint language sql as $$
  select count(*) from public.booking where can_id = p_can and trang_thai <> 'da_huy'
$$;

-- ===== Danh mục: hàm ghi chạy security definer, chỉ authenticated gọi =====
select t.ok((select prosecdef from pg_proc where proname = 'fn_tao_booking' and pronamespace = 'public'::regnamespace),
            'YC5.1 danh mục: fn_tao_booking chạy security definer');
select t.ok(not has_function_privilege('anon', (select oid from pg_proc where proname = 'fn_tao_booking' and pronamespace = 'public'::regnamespace), 'execute'),
            'YC5.1 danh mục PQ7.LINK: người chưa đăng nhập không có quyền gọi fn_tao_booking');
select t.ok(exists (select 1 from information_schema.columns
                    where table_schema = 'public' and table_name = 'booking' and column_name = 'ghi_chu'),
            'YC5.2 bước 8c danh mục: booking có cột ghi_chu');

-- ===== YC5.1-NT2 database, QT1.1-VD1: Chị Hoa ghi 1509 11/10 → 13/10 khi đã có B1 thì bị từ chối =====
select t.dang_nhap(t.id('hoa'));
select t.loi($$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-10-11', p_ngay_tra => '2026-10-13',
                                            p_tien_phong => 1800000, p_client_id => gen_random_uuid())$$,
             'Căn đã có đặt phòng trong những đêm này',
             'YC5.1-NT2 QT1.1-VD1 trùng đêm 11/10 với B1 thì database từ chối với câu "Căn đã có đặt phòng trong những đêm này"');
select t.bang(t.ma_loi($$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-10-09', p_ngay_tra => '2026-10-11',
                                                      p_tien_phong => 1800000)$$), 'P0001',
              'YC5.1-NT2 QT1.1 trùng đêm 10/10 trả mã P0001 để app hiện nguyên câu (QT5.5)');
select t.thoat();
select t.bang(pg_temp.so_booking(t.can('1509')), 1::bigint, 'YC5.1-NT2 lệnh trùng không ghi gì: 1509 vẫn chỉ có B1');

-- Ngày trả của B1 không phải đêm của B1 (QT1.1-VD2), khác căn thì không trùng (QT1.1-VD3): lệnh qua.
select t.dang_nhap(t.id('hoa'));
select t.khong_loi($$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-10-12', p_ngay_tra => '2026-10-13',
                                                  p_tien_phong => 900000, p_client_id => gen_random_uuid())$$,
                   'YC5.1-NT2 QT1.1-VD2 Chị Hoa ghi 1509 12/10 → 13/10 qua fn_tao_booking thì lưu được');
select t.khong_loi($$select public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => '2026-10-10', p_ngay_tra => '2026-10-12',
                                                  p_tien_phong => 1600000, p_client_id => gen_random_uuid())$$,
                   'YC5.1-NT2 QT1.1-VD3 Chị Hoa ghi 3402 10/10 → 12/10 qua fn_tao_booking thì lưu được');
select t.khong_loi('set constraints all immediate',
                   'YC5.1 QT4 KT-DB.3.10 đặt phòng ghi qua fn_tao_booking có tiền từng đêm khớp tiền phòng');
select t.thoat();
select t.bang(t.gt($$select nguon || '|' || coalesce(sale_id::text, 'khach_le') || '|' || tao_boi || '|' || tien_phong
                     from public.booking where can_id = t.can('3402')$$),
              'chu_ghi|khach_le|' || t.id('hoa') || '|1600000',
              'YC5.1 PQ7.CHU đặt phòng ghi qua fn_tao_booking là của Chị Hoa, khách lẻ, đúng tiền phòng');

-- Đặt phòng đã hủy không chiếm đêm (QT2.1): ghi lại đêm của nó được.
update public.booking set trang_thai = 'da_huy' where can_id = t.can('3402');
select t.dang_nhap(t.id('hoa'));
select t.khong_loi($$select public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => '2026-10-11', p_ngay_tra => '2026-10-12',
                                                  p_tien_phong => 800000)$$,
                   'YC5.1-NT2 QT2.1 đêm của đặt phòng đã hủy ghi lại được qua fn_tao_booking');
select t.thoat();

-- ===== YC5.1-NT6: ngày trả không sau ngày nhận, dài hơn 365 đêm =====
select t.dang_nhap(t.id('hoa'));
select t.loi($$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-11-05', p_ngay_tra => '2026-11-05',
                                            p_tien_phong => 900000)$$,
             'Ngày trả phải sau ngày nhận', 'YC5.1-NT6 ngày trả bằng ngày nhận thì từ chối "Ngày trả phải sau ngày nhận"');
select t.loi($$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-11-05', p_ngay_tra => '2026-11-03',
                                            p_tien_phong => 900000)$$,
             'Ngày trả phải sau ngày nhận', 'YC5.1-NT6 ngày trả trước ngày nhận thì từ chối "Ngày trả phải sau ngày nhận"');
select t.loi($$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-11-05', p_ngay_tra => null,
                                            p_tien_phong => 900000)$$,
             'Ngày trả phải sau ngày nhận', 'YC5.1-NT6 thiếu ngày trả thì từ chối "Ngày trả phải sau ngày nhận"');
select t.loi($$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2027-01-01', p_ngay_tra => date '2027-01-01' + 366,
                                            p_tien_phong => 366000000)$$,
             'Một đặt phòng dài tối đa 365 đêm', 'YC5.1-NT6 366 đêm thì từ chối "Một đặt phòng dài tối đa 365 đêm"');
select t.bang(t.ma_loi($$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2027-01-01', p_ngay_tra => date '2027-01-01' + 366,
                                                      p_tien_phong => 366000000)$$), 'P0001',
              'YC5.1-NT6 câu lỗi ngày trả mã P0001 (QT5.5)');
select t.khong_loi($$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2027-01-01', p_ngay_tra => date '2027-01-01' + 365,
                                                  p_tien_phong => 365000000)$$,
                   'YC5.1-NT6 đúng 365 đêm thì lưu được');
select t.khong_loi($$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2020-03-01', p_ngay_tra => '2020-03-02',
                                                  p_tien_phong => 900000)$$,
                   'YC5.3 Luật kiểm ngày nhận trong quá khứ được phép (ghi bù)');
select t.thoat();

-- ===== Tiền phòng bắt buộc, lớn hơn 0 (US26 tạm ghi khách lẻ với tiền phòng) =====
select t.dang_nhap(t.id('hoa'));
select t.loi($$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-12-01', p_ngay_tra => '2026-12-02',
                                            p_tien_phong => null)$$,
             'Cần nhập tiền phòng', 'YC5.3 Luật kiểm thiếu tiền phòng thì từ chối "Cần nhập tiền phòng" (database không tự điền)');
select t.loi($$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-12-01', p_ngay_tra => '2026-12-02',
                                            p_tien_phong => 0)$$,
             'Tiền phòng phải lớn hơn 0', 'YC5.3 Luật kiểm tiền phòng 0 thì từ chối "Tiền phòng phải lớn hơn 0"');
select t.thoat();

-- ===== QT5.6: gửi lại cùng mã lần gửi thì trả đặt phòng đã có, không ghi lần hai =====
select t.dang_nhap(t.id('hoa'));
select set_config('t.ma_gui', gen_random_uuid()::text, true);
select set_config('t.ma_lan1', coalesce(t.gt($$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-12-10',
                     p_ngay_tra => '2026-12-12', p_tien_phong => 1800000, p_client_id => current_setting('t.ma_gui')::uuid)$$), ''), true);
select t.bang(t.gt($$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-12-10', p_ngay_tra => '2026-12-12',
                     p_tien_phong => 1800000, p_client_id => current_setting('t.ma_gui')::uuid)$$),
              nullif(current_setting('t.ma_lan1'), ''), 'YC5.1 QT5.6 gửi lại cùng mã lần gửi thì trả đặt phòng đã có');
select t.thoat();
select t.bang(t.so($$select * from public.booking where can_id = t.can('1509') and ngay_nhan = '2026-12-10'$$), 1::bigint,
              'YC5.1 QT5.6 gửi lại cùng mã lần gửi không ghi đặt phòng thứ hai');

-- Ghi chú lưu vào cột ghi_chu (YC5.2 bước 8c, CN3 hiện).
select t.dang_nhap(t.id('hoa'));
select set_config('t.ma_gc', coalesce(t.gt($$select public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => '2026-12-20',
                     p_ngay_tra => '2026-12-21', p_tien_phong => 800000, p_ghi_chu => 'Khách có trẻ nhỏ')$$), ''), true);
select t.bang(t.gt($$select ghi_chu from public.booking where id = nullif(current_setting('t.ma_gc'), '')::uuid$$), 'Khách có trẻ nhỏ',
              'YC5.2 bước 8c Chị Hoa đọc lại ghi chú đã ghi');
select t.thoat();

-- ===== YC5 "Ai được làm gì" PQ7.CHU: vi phạm quyền ghi =====
select t.dang_nhap(t.id('tuan'));
select t.loi($$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-10-20', p_ngay_tra => '2026-10-21',
                                            p_tien_phong => 900000, p_client_id => gen_random_uuid())$$,
             '42501', 'YC5.1 PQ7.CHU Anh Tuấn ghi đặt phòng vào căn 1509 của Chị Hoa thì database từ chối');
select t.loi($$select public.fn_tao_booking(p_can_id => gen_random_uuid(), p_ngay_nhan => '2026-10-20', p_ngay_tra => '2026-10-21',
                                            p_tien_phong => 900000)$$,
             '42501', 'YC5.1 PQ7.CHU căn không có thật trả cùng lỗi quyền, không lộ căn có tồn tại hay không');
select t.loi($$insert into public.booking (can_id, ngay_nhan, ngay_tra, nguon, tao_boi, tien_phong)
               values (t.can('1509'), '2026-10-20', '2026-10-21', 'chu_ghi', t.id('tuan'), 900000)$$,
             '42501', 'YC5.1 PQ7.CHU Anh Tuấn ghi thẳng bảng booking thì bị từ chối');
select t.thoat();

select t.dang_nhap(t.id('hung'));
select t.loi($$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-10-20', p_ngay_tra => '2026-10-21',
                                            p_tien_phong => 900000, p_client_id => gen_random_uuid())$$,
             '42501', 'YC5.1 PQ7.SALE Sale Hùng (được chia sẻ 1509) gọi fn_tao_booking cho 1509 thì database từ chối');
select t.loi($$select public.fn_tao_booking(p_can_id => t.can('villa'), p_ngay_nhan => '2026-10-20', p_ngay_tra => '2026-10-21',
                                            p_tien_phong => 1400000)$$,
             '42501', 'YC5.1 PQ7.CHU căn tự nhập không có lịch: fn_tao_booking từ chối (lịch căn tự nhập ghi ở YC10)');
select t.loi($$insert into public.booking (can_id, ngay_nhan, ngay_tra, nguon, tao_boi, tien_phong)
               values (t.can('1509'), '2026-10-20', '2026-10-21', 'chu_ghi', t.id('hung'), 900000)$$,
             '42501', 'YC5.1 PQ7.SALE Sale Hùng ghi thẳng bảng booking thì bị từ chối');
select t.thoat();

select t.khach();
select t.loi($$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-10-20', p_ngay_tra => '2026-10-21',
                                            p_tien_phong => 900000)$$,
             '42501', 'YC5.1 PQ7.LINK người chưa đăng nhập gọi fn_tao_booking thì bị từ chối');
select t.thoat();
select t.bang(t.so($$select * from public.booking where can_id = t.can('1509') and ngay_nhan = '2026-10-20'$$), 0::bigint,
              'YC5.1 PQ7.CHU lịch 1509 không đổi sau các lệnh ghi bị từ chối');

-- Căn đã ẩn: chủ nhà không ghi thêm đặt phòng (YC5 Trạng thái màn, HV5).
update public.can set an_luc = now() where id = t.can('3402');
select t.dang_nhap(t.id('hoa'));
select t.loi($$select public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => '2026-11-20', p_ngay_tra => '2026-11-21',
                                            p_tien_phong => 800000)$$,
             '42501', 'YC5.1 PQ7.CHU căn đã ẩn thì fn_tao_booking từ chối');
select t.thoat();
