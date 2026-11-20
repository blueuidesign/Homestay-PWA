-- US4 · Hồ sơ (YC1.4). Lệnh sửa hồ sơ fn_sua_ho_so ghi hồ sơ của chính người gọi.
-- YC1.4-NT1, NT2, NT4, NT5, YC1 "Ai được làm gì" (PQ1, PQ2, PQ6, PQ9, PQ20, PQ23), QT6.5.
-- Viết trước migration (US4-TA1, CL14.5).
select t.fixture();

-- ===== Danh mục =====
select t.ok(exists (select 1 from pg_proc where proname = 'fn_sua_ho_so' and pronamespace = 'public'::regnamespace and prosecdef),
            'YC1.4 danh mục: có lệnh fn_sua_ho_so chạy security definer');
select t.ok(not exists (select 1 from pg_proc p where p.proname = 'fn_sua_ho_so' and p.pronamespace = 'public'::regnamespace
                        and has_function_privilege('anon', p.oid, 'execute')),
            'YC1.4 danh mục PQ1: người chưa đăng nhập không gọi được fn_sua_ho_so');
select t.ok(not has_table_privilege('authenticated', 'public.profiles', 'UPDATE')
            and not has_table_privilege('authenticated', 'public.profiles', 'INSERT'),
            'YC1.4-NT4 danh mục: app không ghi thẳng bảng profiles, chỉ qua fn_sua_ho_so');
select t.ok(not exists (select 1 from information_schema.parameters p
                        where p.specific_schema = 'public' and p.specific_name like 'fn_sua_ho_so%'
                          and p.parameter_name in ('p_id', 'p_nguoi', 'p_vai', 'p_vai_chon', 'p_nguoi_id')),
            'YC1.4-NT4 danh mục: lệnh sửa hồ sơ không nhận mã người hay vai');

-- ===== YC1.4-NT1: Chị Hoa sửa tên hiển thị, Sale Hùng thấy tên mới =====
select t.dang_nhap(t.id('hoa'));
select t.bang(t.ma_loi($$select public.fn_sua_ho_so('Nguyễn Thị Hoa', '  Chị Hoa Mới  ', '0900000001')$$), null::text,
              'YC1.4-NT1 Chị Hoa sửa tên hiển thị và lưu thì qua');
select t.dang_nhap(t.id('hung'));
select t.bang(t.gt($$select ten_hien_thi from public.v_nguoi_ket_noi where id = '00000000-0000-0000-0000-000000000001'$$),
              'Chị Hoa Mới', 'YC1.4-NT1 Sale Hùng thấy tên mới (đã bỏ khoảng trắng đầu cuối) ở người đã kết nối');

-- ===== YC1.4-NT2: sửa số =====
select t.dang_nhap(t.id('hoa'));
select t.bang(t.ma_loi($$select public.fn_sua_ho_so('Nguyễn Thị Hoa', 'Chị Hoa Mới', '0904 118.772')$$), null::text,
              'YC1.4-NT2 Chị Hoa sửa số đúng luật kiểm (có dấu cách, chấm) và lưu thì qua');
select t.dang_nhap(t.id('hung'));
select t.bang(t.gt($$select so_dien_thoai from public.v_nguoi_ket_noi where id = '00000000-0000-0000-0000-000000000001'$$),
              '0904118772', 'YC1.4-NT2 Sale Hùng thấy số mới đã chuẩn hóa của Chị Hoa');
select t.dang_nhap(t.id('hoa'));
select t.bang(t.gt($$select ten from public.profiles where id = auth.uid()$$), 'Nguyễn Thị Hoa', 'YC1.4 họ và tên giữ khi gửi lại cùng giá trị');
-- Gửi lại đúng số của mình không bị coi là trùng.
select t.bang(t.ma_loi($$select public.fn_sua_ho_so('Nguyễn Thị Hoa', 'Chị Hoa Mới', '0904118772')$$), null::text,
              'YC1.4-NT2 gửi lại số của chính mình không bị coi là trùng');

-- ===== YC1.4-NT5: số sai luật kiểm hay số của tài khoản khác =====
select t.bang(t.ma_loi($$select public.fn_sua_ho_so('Nguyễn Thị Hoa', 'Chị Hoa Mới', '12345')$$), '22023',
              'YC1.4-NT5 số ngắn hơn 9 chữ số bị từ chối');
select t.bang(t.ma_loi($$select public.fn_sua_ho_so('Nguyễn Thị Hoa', 'Chị Hoa Mới', '09ab1187722')$$), '22023',
              'YC1.4-NT5 số có chữ bị từ chối');
select t.bang(t.ma_loi($$select public.fn_sua_ho_so('Nguyễn Thị Hoa', 'Chị Hoa Mới', '0900000002')$$), '23505',
              'YC1.4-NT5 số của Anh Tuấn (tài khoản khác chưa xóa) bị từ chối');
select t.bang(t.gt($$select so_dien_thoai from public.profiles where id = auth.uid()$$), '0904118772',
              'YC1.4-NT5 lệnh bị từ chối thì hồ sơ không đổi');
select t.bang(t.ma_loi($$select public.fn_sua_ho_so('   ', 'Chị Hoa Mới', '0904118772')$$), '22023', 'YC1.4 họ và tên trống bị từ chối');
select t.bang(t.ma_loi($$select public.fn_sua_ho_so('Nguyễn Thị Hoa', '   ', '0904118772')$$), '22023', 'YC1.4 tên hiển thị trống bị từ chối');
select t.bang(t.ma_loi($$select public.fn_sua_ho_so('Nguyễn Thị Hoa', repeat('a', 101), '0904118772')$$), '22023',
              'YC1.4 tên hiển thị dài hơn 100 ký tự bị từ chối');
select t.bang(t.gt($$select ten_hien_thi from public.profiles where id = auth.uid()$$), 'Chị Hoa Mới', 'YC1.4-NT5 tên hiển thị không đổi sau các lệnh bị từ chối');

-- Số của tài khoản đã xóa thì dùng được (QT6.5).
select t.thoat();
update public.profiles set so_dien_thoai = null, da_xoa_luc = now() where id = t.id('tuan');
select t.dang_nhap(t.id('hoa'));
select t.bang(t.ma_loi($$select public.fn_sua_ho_so('Nguyễn Thị Hoa', 'Chị Hoa Mới', '0900000002')$$), null::text,
              'YC1.4-NT5 số của tài khoản đã xóa thì dùng được (QT6.5)');

-- ===== YC1.4-NT4: người khác, vai, mã người =====
select t.dang_nhap(t.id('lan'));
select t.bang(t.ma_loi($$update public.profiles set ten_hien_thi = 'Bị sửa' where id = '00000000-0000-0000-0000-000000000001'$$), '42501',
              'YC1.4-NT4 Sale Lan sửa thẳng hồ sơ Chị Hoa bị từ chối');
select t.bang(t.ma_loi($$select public.fn_sua_ho_so('Lan', 'Sale Lan', '0900000004', p_nguoi => '00000000-0000-0000-0000-000000000001')$$), '42883',
              'YC1.4-NT4 gửi mã người trong lệnh sửa bị từ chối (lệnh không có tham số đó)');
select t.bang(t.ma_loi($$select public.fn_sua_ho_so('Lan', 'Sale Lan', '0900000004', p_vai => 'chu_nha')$$), '42883',
              'YC1.4-NT4 gửi vai trong lệnh sửa bị từ chối');
select t.thoat();
select t.bang((select ten_hien_thi || '|' || vai_chon from public.profiles where id = t.id('hoa')), 'Chị Hoa Mới|chu_nha',
              'YC1.4-NT4 hồ sơ Chị Hoa không đổi sau lệnh của Sale Lan');
select t.bang((select vai_chon from public.profiles where id = t.id('lan')), 'sale', 'YC1.4-NT4 vai của Sale Lan không đổi');

