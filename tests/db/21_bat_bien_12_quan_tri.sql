-- KT-DB.3.12 · Chỉ quản trị viên đầu tiên thêm, gỡ được người đồng quản trị; hàm quản trị từ chối người không phải
-- quản trị (YC13.1, PQ Vai ADMIN). Hàm quản trị thuộc US sau; ở EN2 kiểm: app không đọc, không ghi admins và audit_log,
-- tối đa một dòng la_goc = true.
select t.fixture();

select t.dang_nhap(t.id('quantri'));
select t.ok(coalesce(t.so('select * from public.admins'), 0) = 0, 'KT-DB.3.12 app (kể cả chính quản trị viên) không đọc admins');
select t.ok(coalesce(t.so('select * from public.audit_log'), 0) = 0, 'KT-DB.3.12 app không đọc audit_log');
select t.loi($$insert into public.admins (email, nguoi_id, la_goc) values ('khac@example.invalid', t.id('hoa'), false)$$, '42501',
             'KT-DB.3.12 app thêm quản trị viên thẳng vào admins bị từ chối');
select t.loi($$delete from public.admins$$, '42501', 'KT-DB.3.12 app gỡ quản trị viên thẳng bị từ chối');
select t.thoat();
select t.dang_nhap(t.id('hoa'));
select t.ok(coalesce(t.so('select * from public.admins'), 0) = 0, 'KT-DB.3.12 người dùng thường không đọc admins');
select t.loi($$update public.admins set la_goc = false$$, '42501', 'KT-DB.3.12 người dùng thường sửa admins bị từ chối');
select t.thoat();
select t.khach();
select t.loi('select * from public.admins', '42501', 'KT-DB.3.12 anon không đọc admins');
select t.thoat();

select t.bang((select string_agg(pr, ', ' order by pr) from unnest(array['select', 'insert', 'update', 'delete']) pr
               where has_table_privilege('authenticated', 'public.admins', pr) or has_table_privilege('anon', 'public.admins', pr)),
              null::text, 'KT-DB.3.12 danh mục: authenticated, anon không có quyền nào trên admins');

select t.ok(t.ma_loi($$insert into public.admins (email, nguoi_id, la_goc) values ('goc2@example.invalid', t.id('hoa'), true)$$) in ('23505', '23P01', '23514', 'P0001'),
            'KT-DB.3.12 thêm dòng la_goc thứ hai bị từ chối (tối đa một quản trị viên đầu tiên)');
select t.ok(t.ma_loi($$insert into public.admins (email, nguoi_id, la_goc) values ('dongqt@example.invalid', t.id('hoa'), false)$$) is null,
            'KT-DB.3.12 thêm người đồng quản trị (la_goc = false) được');
select t.ok(t.ma_loi($$update public.admins set la_goc = true where email = 'dongqt@example.invalid'$$) in ('23505', '23P01', '23514', 'P0001'),
            'KT-DB.3.12 đổi người đồng quản trị thành la_goc khi đã có người đầu tiên bị từ chối');
