-- US32 · Xóa đặt phòng khách lẻ (YC5.7). Viết trước migration (US32-TA1); task sau không sửa file này (CL14.5).
-- Lệnh xóa fn_xoa_booking: chỉ chủ nhà giữ căn (PQ7.CHU), chỉ đặt phòng không có sale (YC5.7 bước 32, quy tắc "Không xóa
-- đặt phòng của sale", QD12); ghi nhật ký (QD2); xóa dòng và các đêm, đêm trống lại (QT2.1); cập nhật giờ lịch đổi của căn
-- (YC5 Dữ liệu); không báo ai (bước 31).
-- YC5 "Ai được làm gì": PQ7.CHU, PQ7.SALE, PQ7.LINK có test vi phạm trong file.
-- Số theo DLM.3: B1 1509, 10/10 → 12/10, Sale Hùng (thành từ yêu cầu); B5 khách lẻ 1509, 13/10 → 15/10;
-- GH: Chị Hoa ghi giúp Sale Hùng 1509, 20/10 → 22/10, 1.800.000đ (YC5.4-NT1).
select t.fixture();

select t.tao_booking('B1', t.can('1509'), '2026-10-10', '2026-10-12', 2200000, t.id('hung'), 'tu_yeu_cau');
insert into public.booking_rieng (booking_id, nguoi_id, ten_khach, sdt_khach, so_khach)
values (t.b('B1'), t.id('hung'), 'Khách Của Hùng', '0900000077', 3);

select t.tao_booking('B5', t.can('1509'), '2026-10-13', '2026-10-15', 1800000);
update public.booking set trang_thai_tien = 'chua_coc', ghi_chu = 'Khách lẻ B5.' where id = t.b('B5');
insert into public.booking_rieng (booking_id, nguoi_id, ten_khach, sdt_khach, so_khach)
values (t.b('B5'), t.id('hoa'), 'Khách Lẻ Năm', '0900000055', 2);

select t.tao_booking('GH', t.can('1509'), '2026-10-20', '2026-10-22', 1800000, t.id('hung'), 'chu_ghi');

-- Chạy câu bằng vai hiện tại, trả "mã lỗi|câu lỗi" hay 'qua'.
create or replace function pg_temp.loi(p_cau text) returns text language plpgsql as $$
declare ma text; cau text;
begin
  execute p_cau;
  return 'qua';
exception when others then
  get stacked diagnostics ma = returned_sqlstate, cau = message_text;
  return ma || '|' || cau;
end $$;
-- Câu xóa một đặt phòng.
create or replace function pg_temp.cau_xoa(p_id uuid) returns text language sql as $$
  select format('select public.fn_xoa_booking(p_booking_id => %L)', p_id)
$$;
-- Đặt phòng còn không, số đêm, số phần riêng (vai chủ database).
create or replace function pg_temp.con(p_id uuid) returns text language sql security definer as $$
  select (select count(*) from public.booking where id = p_id) || '|'
         || (select count(*) from public.booking_dem where booking_id = p_id) || '|'
         || (select count(*) from public.booking_rieng where booking_id = p_id)
$$;
-- Câu ghi đặt phòng mới khách lẻ cho 1509.
create or replace function pg_temp.cau_ghi(p_nhan date, p_tra date) returns text language sql as $$
  select format('select public.fn_tao_booking(p_can_id => %L, p_ngay_nhan => %L, p_ngay_tra => %L, '
                || 'p_tien_phong => 1800000, p_client_id => %L)', t.can('1509'), p_nhan, p_tra, gen_random_uuid())
$$;

-- ===== Danh mục =====
select t.ok(exists (select 1 from pg_proc where proname = 'fn_xoa_booking' and pronamespace = 'public'::regnamespace and prosecdef),
            'YC5.7 danh mục: fn_xoa_booking có và chạy security definer');
select t.ok(not exists (select 1 from pg_proc p where p.proname = 'fn_xoa_booking' and p.pronamespace = 'public'::regnamespace
                          and has_function_privilege('anon', p.oid, 'execute')),
            'YC5.7 PQ7.LINK người chưa đăng nhập không có quyền gọi fn_xoa_booking');
select t.ok(not has_table_privilege('authenticated', 'public.booking', 'DELETE')
            and not has_table_privilege('authenticated', 'public.booking_dem', 'DELETE'),
            'YC5.7 PQ7.CHU authenticated không xóa thẳng bảng booking, booking_dem, chỉ qua hàm');

-- ===== YC5 "Ai được làm gì": vi phạm quyền với B5 (khách lẻ của Chị Hoa) =====
select t.dang_nhap(t.id('hung'));
select t.loi(pg_temp.cau_xoa(t.b('B5')), '42501', 'YC5.7 PQ7.SALE Sale Hùng (được xem 1509) gửi lệnh xóa B5 thì database từ chối');
select t.thoat();
select t.dang_nhap(t.id('lan'));
select t.loi(pg_temp.cau_xoa(t.b('B5')), '42501', 'YC5.7 PQ7.SALE Sale Lan (được xem 1509) gửi lệnh xóa B5 thì database từ chối');
select t.thoat();
select t.dang_nhap(t.id('tuan'));
select t.loi(pg_temp.cau_xoa(t.b('B5')), '42501', 'YC5.7 PQ7.CHU Anh Tuấn (chủ khác) gửi lệnh xóa B5 thì database từ chối');
select t.thoat();
select t.khach();
select t.loi(pg_temp.cau_xoa(t.b('B5')), '42501', 'YC5.7 PQ7.LINK người chưa đăng nhập gửi lệnh xóa B5 thì bị từ chối');
select t.thoat();
select t.dang_nhap(t.id('hoa'));
select t.loi(pg_temp.cau_xoa(gen_random_uuid()), '42501', 'YC5.7 PQ7.CHU đặt phòng không có thật trả cùng lỗi quyền');
select t.thoat();
select t.bang(pg_temp.con(t.b('B5')), '1|2|1', 'YC5.7 PQ7.CHU B5 còn nguyên sau mọi lệnh xóa bị từ chối');

-- ===== YC5.7-NT4: lệnh xóa B1 (thành từ yêu cầu của Sale Hùng) gửi thẳng tới database =====
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi(pg_temp.cau_xoa(t.b('B1'))), 'P0001|Đặt phòng của sale không xóa được, hãy xin hủy',
              'YC5.7-NT4 Chị Hoa gửi thẳng lệnh xóa B1 thì database từ chối "Đặt phòng của sale không xóa được, hãy xin hủy"');
select t.thoat();
select t.bang(pg_temp.con(t.b('B1')), '1|2|1', 'YC5.7-NT4 B1 còn nguyên: dòng, hai đêm, phần riêng của Sale Hùng');
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi(pg_temp.cau_ghi('2026-10-10', '2026-10-11')), 'P0001|Căn đã có đặt phòng trong những đêm này',
              'YC5.7-NT4 đêm 10/10 của 1509 vẫn kín sau lệnh xóa B1 bị từ chối');
select t.bang(pg_temp.loi(pg_temp.cau_ghi('2026-10-11', '2026-10-12')), 'P0001|Căn đã có đặt phòng trong những đêm này',
              'YC5.7-NT4 đêm 11/10 của 1509 vẫn kín sau lệnh xóa B1 bị từ chối');
select t.thoat();
-- PQ7.SALE: sale của đặt phòng cũng không xóa được (chỉ xin hủy).
select t.dang_nhap(t.id('hung'));
select t.loi(pg_temp.cau_xoa(t.b('B1')), '42501', 'YC5.7-NT4 PQ7.SALE Sale Hùng (sale của B1) gửi lệnh xóa B1 thì database từ chối');
select t.thoat();
select t.dang_nhap(t.id('lan'));
select t.loi(pg_temp.cau_xoa(t.b('B1')), '42501', 'YC5.7-NT4 PQ7.SALE Sale Lan (sale khác) gửi lệnh xóa B1 thì database từ chối');
select t.thoat();
select t.dang_nhap(t.id('tuan'));
select t.loi(pg_temp.cau_xoa(t.b('B1')), '42501', 'YC5.7-NT4 PQ7.CHU Anh Tuấn (chủ khác) gửi lệnh xóa B1 thì database từ chối');
select t.thoat();
select t.bang(pg_temp.con(t.b('B1')), '1|2|1', 'YC5.7-NT4 B1 còn nguyên sau mọi lệnh xóa');

-- ===== YC5.7-NT5: đặt phòng Chị Hoa ghi giúp Sale Hùng (YC5.4-NT1) =====
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi(pg_temp.cau_xoa(t.b('GH'))), 'P0001|Đặt phòng của sale không xóa được, hãy xin hủy',
              'YC5.7-NT5 Chị Hoa gửi thẳng lệnh xóa đặt phòng chị ghi giúp Sale Hùng thì database từ chối');
select t.thoat();
select t.bang(pg_temp.con(t.b('GH')), '1|2|0', 'YC5.7-NT5 đặt phòng ghi giúp Sale Hùng còn nguyên');
select t.dang_nhap(t.id('hung'));
select t.loi(pg_temp.cau_xoa(t.b('GH')), '42501', 'YC5.7-NT5 PQ7.SALE Sale Hùng gửi lệnh xóa đặt phòng Chị Hoa ghi giúp thì database từ chối');
select t.thoat();
select t.ok(not exists (select 1 from public.audit_log where hanh_dong = 'delete'),
            'YC5.7 QD2 lệnh xóa bị từ chối không ghi nhật ký xóa');

-- ===== YC5.7-NT2: Chị Hoa xác nhận xóa B5 =====
update public.can set lich_doi_luc = '2000-01-01' where id = t.can('1509');
select set_config('t.so_tb', (select count(*)::text from public.thong_bao), true);
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi(pg_temp.cau_xoa(t.b('B5'))), 'qua', 'YC5.7-NT2 Chị Hoa xóa B5 (khách lẻ 1509, 13/10 → 15/10) thì lưu được');
select t.thoat();
select t.bang(pg_temp.con(t.b('B5')), '0|0|0', 'YC5.7-NT2 B5 bị xóa cùng các đêm và phần riêng (khách) của Chị Hoa');
select t.ok(exists (select 1 from public.audit_log where bang = 'booking' and ban_ghi_id = t.b('B5') and hanh_dong = 'delete'
                      and nguoi = t.id('hoa') and truoc->>'ngay_nhan' = '2026-10-13' and truoc->>'ngay_tra' = '2026-10-15'
                      and truoc->>'tien_phong' = '1800000'),
            'YC5.7 bước 31 QD2 lệnh xóa ghi nhật ký: Chị Hoa, giá trị cũ của B5');
select t.ok((select lich_doi_luc from public.can where id = t.can('1509')) > '2000-01-01',
            'YC5.7 YC5 Dữ liệu xóa đặt phòng cập nhật giờ lịch đổi của căn');
select t.bang((select count(*)::text from public.thong_bao), current_setting('t.so_tb'),
              'YC5.7 bước 31 xóa đặt phòng khách lẻ thì không ai có thông báo');
select t.bang(pg_temp.con(t.b('B1')) || ',' || pg_temp.con(t.b('GH')), '1|2|1,1|2|0',
              'YC5.7-NT2 xóa B5 không đụng đặt phòng khác của 1509');
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi(pg_temp.cau_xoa(t.b('B5'))), '42501|Không tìm thấy đặt phòng',
              'YC5.7 HV5 xóa lại B5 đã bị xóa thì database báo không tìm thấy');
select t.bang(pg_temp.loi(pg_temp.cau_ghi('2026-10-13', '2026-10-15')), 'qua',
              'YC5.7-NT2 QT2.1 đêm 13/10 và 14/10 của 1509 trống lại: ghi được đặt phòng mới 13/10 → 15/10');
select t.thoat();
select t.bang((select count(*) from public.booking where can_id = t.can('1509') and ngay_nhan = '2026-10-13'
                 and ngay_tra = '2026-10-15')::int, 1, 'YC5.7-NT2 đặt phòng mới 13/10 → 15/10 của 1509 đã lưu');
