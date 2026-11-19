-- US49 · Mẫu tin gửi khách (YC8.2, P11). Viết trước migration (US49-TA1, CL14.5): task sau không sửa file này.
-- Hợp đồng database (YC8 "Dữ liệu", "Ai được làm gì", "Mẫu tin gửi khách", PQ11.SALE, thiet-ke-db.md mục 3 bất biến 6):
--   fn_mau_tin() returns text: mẫu tin của chính người gọi; chưa có (dòng cai_dat_rieng không có hay mau_tin null) thì
--     mẫu mặc định. Chỉ sale (can_la_sale), còn lại từ chối 42501.
--   fn_dat_mau_tin(p_mau text) returns void: ghi mau_tin vào dòng cai_dat_rieng của chính người gọi (thêm hoặc sửa, giữ
--     các cột khác). Chỉ sale, còn lại 42501. Mẫu null, rỗng, chỉ khoảng trắng, thiếu "[Danh sách căn]" hay dài quá
--     2.000 ký tự: 22023, mẫu cũ giữ nguyên. Không có tham số người: sale không ghi được mẫu của sale khác.
--   fn_soan_tin_gui_khach (US48) trả "mau_tin" là mẫu đã lưu.
-- Sale Hùng có dòng cài đặt (+400k), Sale Lan chưa có dòng cài đặt.
select t.fixture();

-- Mẫu tin đang lưu của một người, đọc bằng chủ database: '-' khi không có dòng, '(null)' khi cột null.
create or replace function pg_temp.mt(p_nguoi uuid) returns text language sql as $$
  select coalesce((select coalesce(mau_tin, '(null)') from public.cai_dat_rieng where nguoi_id = p_nguoi), '-')
$$;

-- Mẫu mặc định (YC8 "Mẫu tin gửi khách").
create or replace function pg_temp.mac_dinh() returns text language sql as $$
  select 'Em gửi anh chị [Số căn] căn còn trống [Ngày] ([Số đêm]):' || chr(10) || '[Danh sách căn]' || chr(10)
         || 'Anh chị ưng căn nào báo em giữ phòng nhé.'
$$;

-- ===== Danh mục =====
select t.ok((select bool_and(p.prosecdef) and count(*) = 2 from pg_proc p
             where p.pronamespace = 'public'::regnamespace and p.proname in ('fn_mau_tin', 'fn_dat_mau_tin')),
            'YC8.2 KT-DB.3.6 có fn_mau_tin, fn_dat_mau_tin chạy security definer');
select t.ok((select bool_and(exists (select 1 from unnest(p.proconfig) c where c like 'search_path=%')) and count(*) = 2
             from pg_proc p
             where p.pronamespace = 'public'::regnamespace and p.proname in ('fn_mau_tin', 'fn_dat_mau_tin')),
            'YC8.2 hai lệnh mẫu tin đặt search_path');
select t.ok(exists (select 1 from pg_proc p where p.proname = 'fn_dat_mau_tin' and p.pronamespace = 'public'::regnamespace)
            and not exists (select 1 from pg_proc p where p.pronamespace = 'public'::regnamespace
                              and p.proname in ('fn_mau_tin', 'fn_dat_mau_tin')
                              and has_function_privilege('anon', p.oid, 'execute')),
            'YC8.2-NT4 PQ11.LINK người chưa đăng nhập không có quyền gọi hai lệnh mẫu tin');
select t.bang((select string_agg(p.parameter_name, ',' order by p.ordinal_position)
               from information_schema.routines r
               join information_schema.parameters p on p.specific_name = r.specific_name
               where r.routine_schema = 'public' and r.routine_name = 'fn_dat_mau_tin' and p.parameter_mode = 'IN'),
              'p_mau', 'YC8.2-NT4 PQ11.SALE lệnh lưu mẫu không có tham số người: chỉ ghi được mẫu của chính mình');
select t.ok(not has_table_privilege('authenticated', 'public.cai_dat_rieng', 'insert')
            and not has_table_privilege('authenticated', 'public.cai_dat_rieng', 'update')
            and not has_table_privilege('authenticated', 'public.cai_dat_rieng', 'delete'),
            'YC8.2-NT4 KT-DB.3.6 app không ghi thẳng mẫu tin vào cai_dat_rieng');

-- ===== Bước 1: đọc mẫu của chính mình, chưa có thì mẫu mặc định =====
select t.dang_nhap(t.id('hung'));
select t.bang(t.gt($$public.fn_mau_tin()$$), pg_temp.mac_dinh(), 'YC8.2 bước 1 Sale Hùng chưa có mẫu riêng: mẫu mặc định');
select t.thoat();
select t.dang_nhap(t.id('lan'));
select t.bang(t.gt($$public.fn_mau_tin()$$), pg_temp.mac_dinh(),
              'YC8.2 bước 1 Sale Lan chưa có dòng cài đặt: mẫu mặc định');
select t.thoat();

-- ===== YC8.2-NT3: lưu mẫu mới thì S5 (fn_soan_tin_gui_khach) theo mẫu đó =====
select t.dang_nhap(t.id('hung'));
select t.khong_loi($$select public.fn_dat_mau_tin('Chào anh chị, [Tên sale] gửi [Số căn] căn [Ngày]:' || chr(10) || '[Danh sách căn]')$$,
                   'YC8.2-NT3 Sale Hùng lưu mẫu mới');
select t.bang(t.gt($$public.fn_mau_tin()$$), 'Chào anh chị, [Tên sale] gửi [Số căn] căn [Ngày]:' || chr(10) || '[Danh sách căn]',
              'YC8.2-NT3 Sale Hùng đọc lại thấy mẫu mới');
select t.bang(t.gt($$public.fn_soan_tin_gui_khach(array['00000000-0000-0000-0001-000000001509']::uuid[], '2026-10-10', '2026-10-12') ->> 'mau_tin'$$),
              'Chào anh chị, [Tên sale] gửi [Số căn] căn [Ngày]:' || chr(10) || '[Danh sách căn]',
              'YC8.2-NT3 lệnh soạn tin của S5 trả mẫu Sale Hùng vừa lưu');
select t.thoat();
select t.bang((select muc_cong_mac_dinh from public.cai_dat_rieng where nguoi_id = t.id('hung')), 400000::bigint,
              'YC8.2-NT3 lưu mẫu tin không đổi mức cộng mặc định của Hùng');

-- ===== YC8.2-NT4: Sale Lan đọc hay ghi mẫu tin chỉ chạm mẫu của Lan; mẫu của Hùng không đổi =====
select t.dang_nhap(t.id('lan'));
select t.bang(t.gt($$public.fn_mau_tin()$$), pg_temp.mac_dinh(),
              'YC8.2-NT4 PQ11.SALE Sale Lan đọc mẫu tin: mẫu mặc định, không phải mẫu của Hùng');
select t.khong_loi($$select public.fn_dat_mau_tin('Lan gửi [Số căn] căn:' || chr(10) || '[Danh sách căn]')$$,
                   'YC8.2-NT4 Sale Lan lưu mẫu của mình');
select t.bang(t.gt($$public.fn_mau_tin()$$), 'Lan gửi [Số căn] căn:' || chr(10) || '[Danh sách căn]',
              'YC8.2-NT4 Sale Lan đọc lại mẫu của mình');
select t.bang(coalesce(t.so(format('select * from public.cai_dat_rieng where nguoi_id = %L', t.id('hung'))), 0), 0::bigint,
              'YC8.2-NT4 PQ11.SALE Sale Lan không đọc được mẫu tin của Sale Hùng');
select t.loi(format('update public.cai_dat_rieng set mau_tin = %L where nguoi_id = %L', 'Lan sửa [Danh sách căn]', t.id('hung')), '42501',
             'YC8.2-NT4 PQ11.SALE Sale Lan sửa thẳng mẫu tin của Sale Hùng: bị từ chối');
select t.thoat();
select t.bang(pg_temp.mt(t.id('hung')), 'Chào anh chị, [Tên sale] gửi [Số căn] căn [Ngày]:' || chr(10) || '[Danh sách căn]',
              'YC8.2-NT4 mẫu tin của Hùng không đổi sau khi Lan lưu');
select t.bang(pg_temp.mt(t.id('lan')), 'Lan gửi [Số căn] căn:' || chr(10) || '[Danh sách căn]',
              'YC8.2-NT4 mẫu tin của Lan ghi vào dòng của Lan');
select t.dang_nhap(t.id('hung'));
select t.bang(t.gt($$public.fn_mau_tin()$$), 'Chào anh chị, [Tên sale] gửi [Số căn] căn [Ngày]:' || chr(10) || '[Danh sách căn]',
              'YC8.2-NT4 Sale Hùng đọc mẫu tin: vẫn mẫu của Hùng');
select t.thoat();

-- Chị Hoa (chỉ là chủ nhà).
select t.dang_nhap(t.id('hoa'));
select t.loi($$select public.fn_dat_mau_tin('Chủ nhà [Danh sách căn]')$$, '42501',
             'YC8.2-NT4 PQ11.CHU tài khoản chỉ là chủ nhà (Chị Hoa) lưu mẫu tin: bị từ chối');
select t.loi($$select public.fn_mau_tin()$$, '42501', 'YC8.2-NT4 PQ11.CHU Chị Hoa gọi lệnh đọc mẫu tin: bị từ chối');
select t.bang(coalesce(t.so(format('select * from public.cai_dat_rieng where nguoi_id in (%L, %L)', t.id('hung'), t.id('lan'))), 0), 0::bigint,
              'YC8.2-NT4 PQ11.CHU Chị Hoa không đọc được mẫu tin của Sale Hùng, Sale Lan');
select t.thoat();
select t.bang(pg_temp.mt(t.id('hoa')), '-', 'YC8.2-NT4 PQ11.CHU Chị Hoa bị từ chối: không có dòng mẫu tin nào cho Chị Hoa');

-- Người chưa đăng nhập.
select t.khach();
select t.loi($$select public.fn_dat_mau_tin('Khách [Danh sách căn]')$$, '42501',
             'YC8.2-NT4 PQ11.LINK người chưa đăng nhập lưu mẫu tin: bị từ chối');
select t.loi($$select public.fn_mau_tin()$$, '42501', 'YC8.2-NT4 PQ11.LINK người chưa đăng nhập đọc mẫu tin: bị từ chối');
select t.bang(coalesce(t.so('select * from public.cai_dat_rieng'), 0), 0::bigint,
              'YC8.2-NT4 PQ11.LINK KT-DB.3.1 người chưa đăng nhập không đọc được cai_dat_rieng');
select t.thoat();

-- ===== YC8.2-NT5: mẫu thiếu [Danh sách căn] hay dài 2.001 ký tự thì database từ chối, mẫu cũ giữ nguyên =====
select t.dang_nhap(t.id('lan'));
select t.loi($$select public.fn_dat_mau_tin('Em gửi anh chị [Số căn] căn [Ngày]')$$, '22023',
             'YC8.2-NT5 Sale Lan lưu mẫu không có [Danh sách căn]: bị từ chối');
select t.loi($$select public.fn_dat_mau_tin('[Danh sách căn]' || repeat('a', 1986))$$, '22023',
             'YC8.2-NT5 Sale Lan lưu mẫu dài 2.001 ký tự: bị từ chối');
select t.loi($$select public.fn_dat_mau_tin('')$$, '22023', 'YC8.2-NT5 Sale Lan lưu mẫu rỗng: bị từ chối');
select t.loi($$select public.fn_dat_mau_tin('   ')$$, '22023', 'YC8.2-NT5 Sale Lan lưu mẫu chỉ có khoảng trắng: bị từ chối');
select t.loi($$select public.fn_dat_mau_tin(null)$$, '22023', 'YC8.2-NT5 Sale Lan lưu mẫu trống (null): bị từ chối');
select t.loi($$select public.fn_dat_mau_tin('[danh sách căn] viết thường')$$, '22023',
             'YC8.2-NT5 Sale Lan lưu mẫu có [danh sách căn] viết thường: bị từ chối');
select t.thoat();
select t.bang(pg_temp.mt(t.id('lan')), 'Lan gửi [Số căn] căn:' || chr(10) || '[Danh sách căn]',
              'YC8.2-NT5 bị từ chối: mẫu cũ của Lan giữ nguyên');
select t.dang_nhap(t.id('lan'));
select t.bang(t.gt($$public.fn_soan_tin_gui_khach(array['00000000-0000-0000-0001-000000001509']::uuid[], '2026-10-10', '2026-10-12') ->> 'mau_tin'$$),
              'Lan gửi [Số căn] căn:' || chr(10) || '[Danh sách căn]',
              'YC8.2-NT5 bị từ chối: S5 của Lan vẫn dùng mẫu cũ');
-- Biên: đúng 2.000 ký tự lưu được (15 ký tự "[Danh sách căn]" + 1.985 chữ "ạ" nhiều byte).
select t.khong_loi($$select public.fn_dat_mau_tin('[Danh sách căn]' || repeat('ạ', 1985))$$,
                   'YC8.2-NT5 Sale Lan lưu mẫu đúng 2.000 ký tự: được');
select t.thoat();
select t.bang((select char_length(mau_tin) from public.cai_dat_rieng where nguoi_id = t.id('lan')), 2000,
              'YC8.2-NT5 mẫu 2.000 ký tự của Lan đã ghi');
-- Sale chưa có dòng cài đặt gửi mẫu sai: không có dòng nào được tạo.
select t.dang_nhap(t.id('nga'));
select t.loi($$select public.fn_dat_mau_tin('Không có danh sách')$$, '22023',
             'YC8.2-NT5 Sale Nga lưu mẫu không có [Danh sách căn]: bị từ chối');
select t.thoat();
select t.bang(pg_temp.mt(t.id('nga')), '-', 'YC8.2-NT5 Sale Nga bị từ chối: không có dòng cài đặt nào được tạo');
-- Mẫu đã lưu trùng mẫu mặc định: đọc lại vẫn là mẫu mặc định.
select t.dang_nhap(t.id('nga'));
select t.khong_loi(format('select public.fn_dat_mau_tin(%L)', pg_temp.mac_dinh()), 'YC8.2 bước 4, 5 Sale Nga lưu lại mẫu mặc định');
select t.bang(t.gt($$public.fn_mau_tin()$$), pg_temp.mac_dinh(), 'YC8.2 bước 4, 5 Sale Nga đọc lại mẫu mặc định');
select t.thoat();
