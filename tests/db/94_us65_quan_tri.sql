-- US65 · Đăng nhập trang quản trị và quản trị viên (YC13.1, PQ21, vai ADMIN, KT-DB.3.12).
-- YC13.1-NT2 đến NT5 ở lớp database. Viết trước migration (US65-TA1, CL14.5): task sau không sửa file này.
select t.fixture();
-- Email đăng nhập nằm ở auth.users (Supabase Auth). Fixture không có email: đặt cho người thử.
update auth.users set email = 'quantri@example.invalid' where id = t.id('quantri');
update auth.users set email = 'hoa@example.invalid' where id = t.id('hoa');
update auth.users set email = 'hung@example.invalid' where id = t.id('hung');

-- NT3: email chưa được thêm thì app không gửi mã; email trong danh sách thì gửi (không phân biệt hoa thường).
select t.khach();
select t.bang(public.fn_quan_tri_co_the_gui_ma('hoa@example.invalid'), false, 'YC13.1-NT3 email chưa được thêm: không gửi mã');
select t.bang(public.fn_quan_tri_co_the_gui_ma(' QuanTri@Example.invalid '), true, 'YC13.1-NT3 email quản trị viên đầu tiên: gửi mã');
select t.thoat();

-- NT3: người không trong danh sách gọi lệnh quản trị bị từ chối.
select t.dang_nhap(t.id('hoa'));
select t.bang(public.fn_la_quan_tri(), false, 'YC13.1-NT3 chủ nhà không phải quản trị viên');
select t.loi('select public.fn_quan_tri_vao()', '42501', 'YC13.1-NT3 chủ nhà vào trang quản trị bị từ chối');
select t.loi('select * from public.fn_quan_tri_danh_sach()', '42501', 'YC13.1-NT3 chủ nhà xem danh sách quản trị viên bị từ chối');
select t.loi($$select public.fn_quan_tri_them('hoa@example.invalid')$$, '42501', 'YC13.1-NT3 chủ nhà tự thêm mình bị từ chối');
select t.thoat();
select t.bang((select count(*) from public.admins)::int, 1, 'YC13.1-NT3 danh sách không đổi sau lệnh bị từ chối');
select t.khach();
select t.loi('select * from public.fn_quan_tri_danh_sach()', '42501', 'YC13.1-NT3 anon xem danh sách quản trị viên bị từ chối');
select t.thoat();

-- NT1 (phần database): quản trị viên đầu tiên vào được, nguoi_id được ghi.
select t.dang_nhap(t.id('quantri'));
select t.bang(public.fn_la_quan_tri(), true, 'YC13.1-NT1 quản trị viên đầu tiên có quyền quản trị');
select t.bang((public.fn_quan_tri_vao() ->> 'la_goc')::boolean, true, 'YC13.1-NT1 vào trang quản trị, biết mình là quản trị viên đầu tiên');

-- NT2: quản trị viên đầu tiên thêm một email.
select public.fn_quan_tri_them(' Hung@Example.invalid ');
select t.bang((select count(*) from public.fn_quan_tri_danh_sach())::int, 2, 'YC13.1-NT2 danh sách có người vừa thêm');
select t.loi($$select public.fn_quan_tri_them('hung@example.invalid')$$, 'Email này đã có trong danh sách', 'YC13.1 thêm email đã có bị từ chối');
select t.loi($$select public.fn_quan_tri_them('khong-phai-email')$$, 'Email chưa đúng', 'YC13.1 email sai dạng bị từ chối');
select t.loi($$select public.fn_quan_tri_go('quantri@example.invalid')$$, 'Không gỡ được quản trị viên đầu tiên', 'YC13.1-NT5 quản trị viên đầu tiên không gỡ được chính mình');
select t.thoat();
select t.khach();
select t.bang(public.fn_quan_tri_co_the_gui_ma('hung@example.invalid'), true, 'YC13.1-NT2 người vừa thêm nhận được mã');
select t.thoat();
select t.dang_nhap(t.id('hung'));
select t.bang(public.fn_la_quan_tri(), true, 'YC13.1-NT2 người vừa thêm đăng nhập là có quyền quản trị');
select t.bang((public.fn_quan_tri_vao() ->> 'la_goc')::boolean, false, 'YC13.1-NT2 người vừa thêm là đồng quản trị');

-- NT4: người đồng quản trị thêm hay gỡ quản trị viên bị từ chối, danh sách không đổi.
select t.loi($$select public.fn_quan_tri_them('lan@example.invalid')$$, '42501', 'YC13.1-NT4 đồng quản trị thêm quản trị viên bị từ chối');
select t.loi($$select public.fn_quan_tri_go('quantri@example.invalid')$$, '42501', 'YC13.1-NT4 đồng quản trị gỡ quản trị viên bị từ chối');
select t.loi($$select public.fn_quan_tri_go('hung@example.invalid')$$, '42501', 'YC13.1-NT4 đồng quản trị tự gỡ mình bị từ chối');
select t.thoat();
select t.bang((select string_agg(email, ',' order by email) from public.admins), 'hung@example.invalid,quantri@example.invalid',
              'YC13.1-NT4 danh sách không đổi sau lệnh của đồng quản trị');

-- NT5: quản trị viên đầu tiên gỡ một người: lần sau không nhận mã; phiên đang mở mất quyền ngay (YC13-H6).
select t.dang_nhap(t.id('quantri'));
select public.fn_quan_tri_go('HUNG@example.invalid');
select t.bang((select count(*) from public.fn_quan_tri_danh_sach())::int, 1, 'YC13.1-NT5 người bị gỡ rời danh sách');
select t.thoat();
select t.khach();
select t.bang(public.fn_quan_tri_co_the_gui_ma('hung@example.invalid'), false, 'YC13.1-NT5 người bị gỡ không nhận được mã');
select t.thoat();
select t.dang_nhap(t.id('hung'));
select t.bang(public.fn_la_quan_tri(), false, 'YC13.1-NT5 phiên của người bị gỡ mất quyền ở lệnh kế tiếp');
select t.loi('select * from public.fn_quan_tri_danh_sach()', '42501', 'YC13.1-NT5 người bị gỡ gọi lệnh quản trị bị từ chối');
select t.thoat();

-- Chỉ hàm quản trị ghi admins; app vẫn không đọc, ghi thẳng (KT-DB.3.12 giữ nguyên).
select t.dang_nhap(t.id('quantri'));
select t.ok(coalesce(t.so('select * from public.admins'), 0) = 0, 'YC13.1 quản trị viên vẫn không đọc thẳng bảng admins');
select t.thoat();
