-- KT-DB.3.1 · Khách chưa đăng nhập không đọc được bảng nào có giá. anon chỉ gọi được fn_xem_link_moi (QD8, PQ Luật chung 4).
select t.fixture();

-- Danh mục: phải có các bảng của hợp đồng, để các phép kiểm "mọi bảng" bên dưới không qua vì không có gì.
select t.bang((select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace
               where n.nspname = 'public' and c.relkind in ('r', 'p')
                 and c.relname in ('profiles', 'can', 'gia_thang', 'gia_dip', 'booking', 'booking_dem',
                                   'yeu_cau_dat_phong', 'yeu_cau_rieng', 'muc_cong', 'booking_rieng', 'admins')),
              11::bigint, 'KT-DB.3.1 danh mục: có đủ các bảng chính của hợp đồng');

select t.bang((select string_agg(c.relname, ', ' order by c.relname)
               from pg_class c join pg_namespace n on n.oid = c.relnamespace
               where n.nspname = 'public' and c.relkind in ('r', 'p') and not c.relrowsecurity),
              null::text, 'KT-DB.3.1 mọi bảng public bật RLS');

select t.bang((select string_agg(c.relname, ', ' order by c.relname)
               from pg_class c join pg_namespace n on n.oid = c.relnamespace
               where n.nspname = 'public' and c.relkind in ('r', 'p', 'v', 'm', 'f')
                 and has_table_privilege('anon', c.oid, 'select')),
              null::text, 'KT-DB.3.1 anon không có quyền select trên bảng, view nào');

select t.bang((select string_agg(c.relname, ', ' order by c.relname)
               from pg_class c join pg_namespace n on n.oid = c.relnamespace
               where n.nspname = 'public' and c.relkind in ('r', 'p', 'v', 'm', 'f')
                 and (has_table_privilege('anon', c.oid, 'insert') or has_table_privilege('anon', c.oid, 'update')
                      or has_table_privilege('anon', c.oid, 'delete') or has_table_privilege('anon', c.oid, 'truncate'))),
              null::text, 'KT-DB.3.1 anon không có quyền ghi trên bảng, view nào');

-- Hàm của extension (btree_gist...) không tính.
select t.bang((select string_agg(p.oid::regprocedure::text, ', ' order by 1)
               from pg_proc p join pg_namespace n on n.oid = p.pronamespace
               where n.nspname = 'public' and p.proname <> 'fn_xem_link_moi'
                 and not exists (select 1 from pg_depend d where d.classid = 'pg_proc'::regclass
                                 and d.objid = p.oid and d.deptype = 'e')
                 and has_function_privilege('anon', p.oid, 'execute')),
              null::text, 'KT-DB.3.1 anon không execute hàm public nào ngoài fn_xem_link_moi');

-- Hành vi: đóng vai anon, đọc thẳng các bảng, view có giá hay dữ liệu người dùng đều bị từ chối.
select t.khach();
select t.loi('select * from public.gia_thang', '42501', 'KT-DB.3.1 PQ5.LINK anon đọc gia_thang bị từ chối');
select t.loi('select * from public.gia_dip', '42501', 'KT-DB.3.1 PQ5.LINK anon đọc gia_dip bị từ chối');
select t.loi('select * from public.can', '42501', 'KT-DB.3.1 PQ3.LINK anon đọc can bị từ chối');
select t.loi('select * from public.booking', '42501', 'KT-DB.3.1 PQ8.LINK anon đọc booking bị từ chối');
select t.loi('select * from public.booking_dem', '42501', 'KT-DB.3.1 PQ8.LINK anon đọc booking_dem bị từ chối');
select t.loi('select * from public.yeu_cau_dat_phong', '42501', 'KT-DB.3.1 PQ10.LINK anon đọc yeu_cau_dat_phong bị từ chối');
select t.loi('select * from public.yeu_cau_rieng', '42501', 'KT-DB.3.1 PQ11.LINK anon đọc yeu_cau_rieng bị từ chối');
select t.loi('select * from public.muc_cong', '42501', 'KT-DB.3.1 PQ11.LINK anon đọc muc_cong bị từ chối');
select t.loi('select * from public.profiles', '42501', 'KT-DB.3.1 PQ2.LINK anon đọc profiles bị từ chối');
select t.loi('select * from public.v_lich_sale', '42501', 'KT-DB.3.1 PQ4.LINK anon đọc v_lich_sale bị từ chối');
select t.loi('select * from public.v_booking_cua_sale', '42501', 'KT-DB.3.1 PQ8.LINK anon đọc v_booking_cua_sale bị từ chối');
select t.loi('select * from public.v_nguoi_ket_noi', '42501', 'KT-DB.3.1 PQ2.LINK anon đọc v_nguoi_ket_noi bị từ chối');
select t.loi('select * from public.my_shared_can_ids()', '42501', 'KT-DB.3.1 anon gọi my_shared_can_ids bị từ chối');
select t.loi($$select public.o_lich('00000000-0000-0000-0001-000000001509', '2026-10-10')$$, '42501',
             'KT-DB.3.1 anon gọi o_lich bị từ chối');
select t.loi($$insert into public.gia_thang (can_id, thang, gia_thuong, gia_cuoi_tuan)
               values ('00000000-0000-0000-0001-000000001103', '2027-01-01', 1, 1)$$, '42501',
             'KT-DB.3.1 anon ghi gia_thang bị từ chối');
select t.thoat();

-- can_dang_nhap: chưa đăng nhập thì lỗi 28000.
select t.loi('select public.can_dang_nhap()', '28000', 'KT-DB.3.1 can_dang_nhap khi chưa có người gọi báo lỗi 28000');
select t.dang_nhap(t.id('hoa'));
select t.bang(t.gt('public.can_dang_nhap()'), t.id('hoa')::text, 'KT-DB.3.1 can_dang_nhap trả id người đã đăng nhập');
select t.thoat();
