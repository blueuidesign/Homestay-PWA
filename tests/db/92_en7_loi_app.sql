-- EN7 · Theo dõi lỗi (YC15.3-NT1, YC15 "Báo lỗi", QD29). Lệnh fn_ghi_loi ghi lỗi của app đã bỏ số điện thoại, email;
-- việc định kỳ fn_bao_loi_hang_ngay báo quản trị viên trong app mỗi ngày. Viết trước migration (CL14.5).
select t.fixture();

select t.ok(exists (select 1 from pg_proc where proname = 'fn_ghi_loi' and pronamespace = 'public'::regnamespace and prosecdef),
            'YC15.3 danh mục: có lệnh fn_ghi_loi chạy security definer');
select t.ok(not exists (select 1 from pg_proc p where p.proname = 'fn_ghi_loi' and p.pronamespace = 'public'::regnamespace
                        and has_function_privilege('anon', p.oid, 'execute')),
            'YC15.3 danh mục KT-DB.3.1: người chưa đăng nhập không gọi được fn_ghi_loi');
select t.ok(not exists (select 1 from pg_proc p where p.proname = 'fn_bao_loi_hang_ngay' and p.pronamespace = 'public'::regnamespace
                        and (has_function_privilege('anon', p.oid, 'execute') or has_function_privilege('authenticated', p.oid, 'execute'))),
            'YC15.3 danh mục: app không gọi được việc báo lỗi hằng ngày');
select t.ok(not has_table_privilege('authenticated', 'public.loi_app', 'SELECT') and not has_table_privilege('anon', 'public.loi_app', 'SELECT'),
            'YC15.3 danh mục: app không đọc được bảng lỗi');

-- ===== YC15.3-NT1: bản ghi lỗi không có số điện thoại, email =====
select t.dang_nhap(t.id('hoa'));
select t.bang(t.ma_loi($$select public.fn_ghi_loi('Không lưu được khách 0912 345 678, gọi 0900000077 hay mai.nguyen@gmail.com',
                        'at luu (CN4.tsx:12)', '/dat-phong/moi?sdt=0912345678', '1.0.0', 'Mozilla/5.0')$$), null::text,
              'YC15.3-NT1 app gửi lỗi thì ghi được');
select t.thoat();
select t.bang((select count(*) from public.loi_app), 1::bigint, 'YC15.3-NT1 có một bản ghi lỗi');
select t.ok((select thong_diep !~ '\d{3}[ .]?\d{3}[ .]?\d{3}' and thong_diep not like '%@%' and duong_dan not like '%?%'
             from public.loi_app limit 1),
            'YC15.3-NT1 bản ghi lỗi không có số điện thoại, email, phần sau dấu ? của đường dẫn');
select t.bang((select duong_dan from public.loi_app limit 1), '/dat-phong/moi', 'YC15.3-NT1 đường dẫn chỉ giữ phần trước dấu ?');
select t.bang((select nguoi_id from public.loi_app limit 1), t.id('hoa'), 'YC15.3 bản ghi biết ai gặp lỗi (để hỏi lại), không chép tên');

-- Gửi dồn quá 30 lỗi một giờ thì bỏ bớt (không để một máy làm đầy bảng).
select t.dang_nhap(t.id('hung'));
select public.fn_ghi_loi('lỗi ' || i, null, '/', '1.0.0', null) from generate_series(1, 40) i;
select t.thoat();
select t.bang((select count(*) from public.loi_app where nguoi_id = t.id('hung')), 30::bigint, 'YC15.3 mỗi người tối đa 30 bản ghi lỗi một giờ');

-- ===== YC15.3-NT1: Tùng (quản trị viên) biết trong ngày =====
delete from public.thong_bao;
select t.bang(public.fn_bao_loi_hang_ngay(), 1, 'YC15.3-NT1 việc hằng ngày báo cho mỗi quản trị viên một thông báo');
select t.bang((select (noi_dung ->> 'so_loi')::int from public.thong_bao where nguoi_nhan = t.id('quantri') and loai = 'loi_app_hang_ngay'),
              31, 'YC15.3-NT1 thông báo ghi số lỗi trong 24 giờ qua (31)');
select t.bang((select count(*) from public.thong_bao where loai = 'loi_app_hang_ngay' and nguoi_nhan <> t.id('quantri')), 0::bigint,
              'YC15.3 người không phải quản trị viên không nhận thông báo lỗi');
delete from public.loi_app;
delete from public.thong_bao;
select t.bang(public.fn_bao_loi_hang_ngay(), 0, 'YC15.3 ngày không có lỗi thì không báo');
