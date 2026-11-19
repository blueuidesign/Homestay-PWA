-- US2 · Đăng ký và đăng nhập bằng mã email (YC1.2, QD22). Hồ sơ tạo khi có người dùng mới, lệnh đăng ký
-- fn_dang_ky ghi tên và số của chính người gọi. PQ1, PQ2, PQ23, QT6.5.
select t.fixture();

-- Người mới: Mới (chưa đăng ký xong) và Mới 2. Email giả.
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-000000000020', 'moi1@vidu.test'),
  ('00000000-0000-0000-0000-000000000021', 'moi2@vidu.test');
update auth.users set email = 'hoa@vidu.test' where id = t.id('hoa');
-- Trigger tạo hồ sơ chạy lúc commit (để dữ liệu mẫu tự ghi hồ sơ được); ở đây cho chạy ngay.
set constraints all immediate;
set constraints all deferred;

-- ===== Trigger tạo hồ sơ =====
select t.bang((select count(*) from public.profiles where id = '00000000-0000-0000-0000-000000000020'
                 and ten is null and so_dien_thoai is null), 1::bigint,
              'YC1.2 có người dùng mới thì có hồ sơ rỗng (chưa tên, chưa số)');
select t.bang((select ten from public.profiles where id = t.id('hoa')), 'Chị Hoa',
              'YC1.2 trigger không ghi đè hồ sơ đã có');

-- ===== YC1.2-NT5: tên trống hay số sai luật kiểm thì từ chối, hồ sơ không đổi =====
select t.dang_nhap('00000000-0000-0000-0000-000000000020');
select t.loi($$select public.fn_dang_ky('', '0912345678')$$, '22023', 'YC1.2-NT5 tên trống bị từ chối');
select t.loi($$select public.fn_dang_ky('   ', '0912345678')$$, '%họ và tên%', 'YC1.2-NT5 tên chỉ có khoảng trắng bị từ chối, báo câu về họ và tên');
select t.loi($$select public.fn_dang_ky(null, '0912345678')$$, '22023', 'YC1.2-NT5 tên null bị từ chối');
select t.loi($$select public.fn_dang_ky(repeat('a', 101), '0912345678')$$, '22023', 'YC1.2-NT5 tên quá 100 ký tự bị từ chối');
select t.loi($$select public.fn_dang_ky('Chị Mới', '12ab')$$, '%9 đến 15 chữ số%', 'YC1.2-NT5 số có chữ bị từ chối, báo câu 9 đến 15 chữ số');
select t.loi($$select public.fn_dang_ky('Chị Mới', '09123456')$$, '22023', 'YC1.2-NT5 số 8 chữ số bị từ chối');
select t.loi($$select public.fn_dang_ky('Chị Mới', '0912345678901234')$$, '22023', 'YC1.2-NT5 số 16 chữ số bị từ chối');
select t.loi($$select public.fn_dang_ky('Chị Mới', '09+12345678')$$, '22023', 'YC1.2-NT5 dấu + không ở đầu bị từ chối');
select t.loi($$select public.fn_dang_ky('Chị Mới', null)$$, '22023', 'YC1.2-NT5 số null bị từ chối');
select t.thoat();
select t.bang((select count(*) from public.profiles where id = '00000000-0000-0000-0000-000000000020'
                 and ten is null and so_dien_thoai is null and dong_y_dieu_khoan_luc is null), 1::bigint,
              'YC1.2-NT5 sau các lệnh bị từ chối hồ sơ không đổi');

-- Đúng luật thì ghi: bỏ khoảng trắng đầu cuối của tên; bỏ khoảng trắng, chấm, gạch của số.
select t.dang_nhap('00000000-0000-0000-0000-000000000020');
select t.khong_loi($$select public.fn_dang_ky('  Chị Mới  ', ' 0912.345-678 ')$$, 'YC1.2-NT4 lệnh đăng ký đúng luật thì qua');
select t.bang(t.gt($$select ten || '|' || so_dien_thoai || '|' || ten_hien_thi from public.profiles$$),
              'Chị Mới|0912345678|Chị Mới', 'YC1.2-NT4 hồ sơ có tên đã bỏ khoảng trắng và số đã chuẩn hóa, tên hiển thị lấy theo tên');
select t.bang(t.gt($$select (dong_y_dieu_khoan_luc is not null)::text from public.profiles$$), 'true',
              'YC1.2 lệnh đăng ký ghi lúc đồng ý điều khoản');
select t.thoat();

select t.dang_nhap('00000000-0000-0000-0000-000000000021');
select t.khong_loi($$select public.fn_dang_ky('Anh Mới', '+84 912 000 111')$$, 'YC1.2-NT5 số có dấu + ở đầu và 11 chữ số thì qua');
select t.bang(t.gt($$select so_dien_thoai from public.profiles$$), '+84912000111', 'YC1.2 số lưu dạng đã bỏ khoảng trắng, giữ dấu +');
select t.thoat();

-- ===== YC1.2-NT6: hồ sơ đã có số, hay nhắm vào hồ sơ người khác, thì từ chối và không gì đổi =====
select t.dang_nhap('00000000-0000-0000-0000-000000000020');
select t.loi($$select public.fn_dang_ky('Tên Khác', '0912999888')$$, 'P0001', 'YC1.2-NT6 hồ sơ đã có số thì lệnh đăng ký bị từ chối');
select t.loi($$update public.profiles set so_dien_thoai = '0912999888' where id = '00000000-0000-0000-0000-000000000020'$$, '42501',
             'YC1.2-NT6 PQ2 không ghi thẳng số vào bảng hồ sơ được, kể cả của mình');
select t.loi($$update public.profiles set ten = 'Mạo danh', so_dien_thoai = '0912999888' where id = t.id('hoa')$$, '42501',
             'YC1.2-NT6 PQ1.CHU, PQ2 không sửa được hồ sơ, số của người khác');
select t.loi($$insert into public.profiles (id, ten, so_dien_thoai) values (gen_random_uuid(), 'Giả', '0912999777')$$, '42501',
             'YC1.2-NT6 không tự tạo hồ sơ được');
select t.thoat();
select t.bang((select ten || '|' || so_dien_thoai from public.profiles where id = '00000000-0000-0000-0000-000000000020'),
              'Chị Mới|0912345678', 'YC1.2-NT6 hồ sơ của người gọi không đổi');
select t.bang((select ten || '|' || so_dien_thoai from public.profiles where id = t.id('hoa')),
              'Chị Hoa|0900000001', 'YC1.2-NT6 hồ sơ của Chị Hoa không đổi');
select t.bang((select pronargs::int from pg_proc where proname = 'fn_dang_ky' and pronamespace = 'public'::regnamespace), 2,
              'YC1.2-NT6 lệnh đăng ký không nhận mã người: chỉ ghi hồ sơ của người gọi (tên, số)');
select t.khach();
select t.loi($$select public.fn_dang_ky('Khách', '0912777666')$$, '%', 'YC1.2-NT6 người chưa đăng nhập không gọi được lệnh đăng ký');
select t.thoat();

-- ===== YC1.2-NT10: số đã thuộc tài khoản khác chưa xóa thì từ chối =====
insert into auth.users (id, email) values ('00000000-0000-0000-0000-000000000022', 'moi3@vidu.test');
set constraints all immediate;
set constraints all deferred;
select t.dang_nhap('00000000-0000-0000-0000-000000000022');
select t.loi($$select public.fn_dang_ky('Người Trùng', '0900000003')$$, '23505', 'YC1.2-NT10 số của Sale Hùng bị từ chối');
select t.loi($$select public.fn_dang_ky('Người Trùng', '0900.000.003')$$, '%Số này đã có tài khoản%',
             'YC1.2-NT10 số trùng viết kiểu khác vẫn bị từ chối, báo đúng câu YC1-H13');
select t.loi($$select public.fn_dang_ky('Người Trùng', '0912345678')$$, '23505', 'YC1.2-NT10 số của người mới đăng ký trước bị từ chối');
select t.thoat();
select t.bang((select count(*) from public.profiles where id = '00000000-0000-0000-0000-000000000022'
                 and ten is null and so_dien_thoai is null), 1::bigint, 'YC1.2-NT10 hồ sơ của người gọi không đổi');
select t.ok((select count(*) from pg_indexes where schemaname = 'public' and tablename = 'profiles'
               and indexdef ilike '%unique%so_dien_thoai%da_xoa_luc is null%') = 1,
            'YC1.2-NT10 ràng buộc không trùng số nằm ở database (mục unique một phần)');

-- ===== QT6.5, PQ23.LINK: người đã xóa tài khoản nhập lại số thì dùng lại như trước =====
update public.profiles set so_dien_thoai = null, da_xoa_luc = now() where id = t.id('hung');
select t.dang_nhap('00000000-0000-0000-0000-000000000022');
select t.khong_loi($$select public.fn_dang_ky('Người Mới 3', '0900000003')$$,
                   'YC1.2-NT10 số của tài khoản đã xóa thì không tính là trùng');
select t.thoat();
update public.profiles set so_dien_thoai = null where id = '00000000-0000-0000-0000-000000000022';
update public.profiles set so_dien_thoai = null, da_xoa_luc = now() where id = t.id('hoa');
select t.dang_nhap(t.id('hoa'));
select t.khong_loi($$select public.fn_dang_ky('Chị Hoa', '0900000001')$$, 'QT6.5 Chị Hoa đã xóa tài khoản nhập lại số thì qua');
select t.bang(t.gt($$select so_dien_thoai || '|' || (da_xoa_luc is null)::text from public.profiles$$), '0900000001|true',
              'QT6.5 PQ23.LINK nhập lại số thì bỏ dấu đã xóa tài khoản');
select t.thoat();
select t.dang_nhap(t.id('lan'));
select t.ok(t.can('1509') in (select public.my_shared_can_ids()), 'QT6.5 kết nối cũ nối lại: Sale Lan lại thấy 1509');
select t.thoat();

-- ===== Người chưa đăng nhập =====
select t.khach();
select t.loi($$select * from public.profiles$$, '42501', 'PQ1.LINK, PQ2.LINK người chưa đăng nhập không đọc được hồ sơ, số');
select t.thoat();
