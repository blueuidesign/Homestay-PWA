-- KT-DB.3.3 · Sale chỉ thấy căn được chia sẻ, và chỉ qua my_shared_can_ids() (PQ3.SALE, PQ17, QD7, QD8).
select t.fixture();

-- Hàm dùng chung: security definer, có search_path.
select t.bang((select string_agg(p.proname, ', ' order by p.proname)
               from pg_proc p join pg_namespace n on n.oid = p.pronamespace
               where n.nspname = 'public'
                 and p.proname in ('local_today', 'can_dang_nhap', 'my_own_can_ids', 'my_shared_can_ids', 'o_lich')
                 and p.prosecdef
                 and exists (select 1 from unnest(p.proconfig) c where c like 'search_path=%')),
              'can_dang_nhap, local_today, my_own_can_ids, my_shared_can_ids, o_lich',
              'KT-DB.3.3 danh mục: các hàm dùng chung có đủ, security definer và đặt search_path');

select t.bang((select string_agg(p.oid::regprocedure::text, ', ' order by 1)
               from pg_proc p join pg_namespace n on n.oid = p.pronamespace
               where n.nspname = 'public' and p.proname like 'fn\_%'
                 and (not p.prosecdef or not exists (select 1 from unnest(p.proconfig) c where c like 'search_path=%'))),
              null::text, 'KT-DB.3.3 danh mục: mọi hàm public fn_* là security definer và đặt search_path');

select t.bang((select string_agg(p.oid::regprocedure::text, ', ' order by 1)
               from pg_proc p join pg_namespace n on n.oid = p.pronamespace
               where n.nspname = 'public' and p.proname like 'fn\_%' and p.proname <> 'fn_xem_link_moi'
                 and (has_function_privilege('anon', p.oid, 'execute')
                      or exists (select 1 from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
                                 where a.grantee = 0 and a.privilege_type = 'EXECUTE'))),
              null::text, 'KT-DB.3.3 danh mục: hàm fn_* không cho anon và public gọi');

-- Mọi policy đọc của căn và giá dùng my_shared_can_ids() (không tự viết lại luật chia sẻ).
select t.bang((select string_agg(tb, ', ' order by tb) from unnest(array['can', 'gia_thang', 'gia_dip']) tb
               where not exists (select 1 from pg_policies p where p.schemaname = 'public' and p.tablename = tb
                                 and p.qual ilike '%my_shared_can_ids%')),
              null::text, 'KT-DB.3.3 danh mục: policy của can, gia_thang, gia_dip dùng my_shared_can_ids()');

-- my_shared_can_ids theo từng người.
select t.dang_nhap(t.id('hung'));
select t.bang(t.so('select * from public.my_shared_can_ids()'), 2::bigint, 'KT-DB.3.3 Hùng (tất cả căn của Hoa) được chia sẻ 2 căn');
select t.bang(t.so($$select * from public.my_shared_can_ids() x where x in (t.can('1509'), t.can('3402'))$$), 2::bigint,
              'KT-DB.3.3 Hùng được chia sẻ đúng 1509 và 3402');
select t.bang(t.so($$select * from public.my_shared_can_ids() x where x = t.can('villa')$$), 0::bigint,
              'KT-DB.3.3 căn tự nhập của Hùng không nằm trong căn được chia sẻ');
select t.bang(t.so($$select * from public.my_shared_can_ids() x where x = t.can('1103')$$), 0::bigint,
              'KT-DB.3.3 PQ Luật chung 3 Hùng chưa kết nối Anh Tuấn: không có 1103');
select t.bang(t.so('select * from public.my_own_can_ids()'), 1::bigint, 'KT-DB.3.3 my_own_can_ids của Hùng là căn tự nhập của Hùng');
select t.bang(t.so('select * from public.can'), 3::bigint, 'KT-DB.3.3 PQ3.SALE Hùng đọc 3 căn: 1509, 3402 và căn của mình');
select t.thoat();

select t.dang_nhap(t.id('lan'));
select t.bang(t.so('select * from public.my_shared_can_ids()'), 1::bigint, 'KT-DB.3.3 PQ3.SALE Lan (chọn căn) chỉ được chia sẻ 1 căn');
select t.bang(t.so($$select * from public.my_shared_can_ids() x where x = t.can('1509')$$), 1::bigint,
              'KT-DB.3.3 PQ3.SALE Lan được chia sẻ đúng 1509');
select t.bang(t.so('select * from public.can'), 1::bigint, 'KT-DB.3.3 PQ3.SALE Lan đọc được 1 căn');
select t.ok(coalesce(t.so($$select * from public.can where id = t.can('3402')$$), 0) = 0,
            'KT-DB.3.3 PQ3.SALE Lan không đọc được 3402 (ngoài phạm vi chọn căn)');
select t.thoat();

select t.dang_nhap(t.id('nga'));
select t.bang(t.so('select * from public.my_shared_can_ids()'), 0::bigint, 'KT-DB.3.3 PQ Luật chung 3 Nga chưa kết nối: không được chia sẻ căn nào');
select t.ok(coalesce(t.so('select * from public.can'), 0) = 0, 'KT-DB.3.3 PQ Luật chung 3 Nga không đọc được căn nào');
select t.thoat();

select t.dang_nhap(t.id('hoa'));
select t.bang(t.so('select * from public.my_shared_can_ids()'), 0::bigint, 'KT-DB.3.3 Chị Hoa không là sale của ai: không có căn được chia sẻ');
select t.bang(t.so('select * from public.my_own_can_ids()'), 2::bigint, 'KT-DB.3.3 my_own_can_ids của Chị Hoa là 2 căn');
select t.bang(t.so('select * from public.can'), 2::bigint, 'KT-DB.3.3 PQ3.CHU Chị Hoa đọc 2 căn của mình');
select t.ok(coalesce(t.so($$select * from public.can where id in (t.can('1103'), t.can('villa'))$$), 0) = 0,
            'KT-DB.3.3 PQ3.CHU Chị Hoa không đọc căn của người khác');
select t.thoat();

select t.dang_nhap(t.id('tuan'));
select t.bang(t.so('select * from public.can'), 1::bigint, 'KT-DB.3.3 PQ3.CHU Anh Tuấn chỉ đọc 1103');
select t.thoat();

-- Kết nối, kết nối căn: chủ và sale của dòng đọc.
select t.dang_nhap(t.id('hoa'));
select t.bang(t.so('select * from public.ket_noi'), 2::bigint, 'KT-DB.3.3 PQ17.CHU Chị Hoa đọc 2 kết nối của mình');
select t.bang(t.so('select * from public.ket_noi_can'), 1::bigint, 'KT-DB.3.3 PQ17.CHU Chị Hoa đọc ket_noi_can của mình');
select t.thoat();
select t.dang_nhap(t.id('hung'));
select t.bang(t.so('select * from public.ket_noi'), 1::bigint, 'KT-DB.3.3 PQ17.SALE Hùng chỉ đọc kết nối của mình');
select t.ok(coalesce(t.so('select * from public.ket_noi_can'), 0) = 0, 'KT-DB.3.3 PQ17.SALE Hùng không đọc ket_noi_can của Lan');
select t.thoat();
select t.dang_nhap(t.id('nga'));
select t.ok(coalesce(t.so('select * from public.ket_noi'), 0) = 0, 'KT-DB.3.3 PQ17.SALE Nga không đọc kết nối của người khác');
select t.thoat();
select t.dang_nhap(t.id('tuan'));
select t.ok(coalesce(t.so('select * from public.ket_noi'), 0) = 0, 'KT-DB.3.3 PQ17.CHU Anh Tuấn không đọc kết nối của Chị Hoa');
select t.thoat();

-- Ảnh căn: đọc theo quyền đọc căn; ảnh tạm chỉ người tải đọc.
insert into public.anh_can (can_id, nguoi_tai, duong_dan, thu_tu)
values (t.can('1509'), t.id('hoa'), 'thu/1509-1.jpg', 1),
       (t.can('3402'), t.id('hoa'), 'thu/3402-1.jpg', 1),
       (null,          t.id('hoa'), 'thu/tam-1.jpg', 1),
       (t.can('1103'), t.id('tuan'), 'thu/1103-1.jpg', 1);
select t.dang_nhap(t.id('hoa'));
select t.bang(t.so('select * from public.anh_can'), 3::bigint, 'KT-DB.3.3 PQ3.CHU Chị Hoa đọc ảnh 2 căn và ảnh tạm của mình');
select t.thoat();
select t.dang_nhap(t.id('hung'));
select t.bang(t.so('select * from public.anh_can'), 2::bigint, 'KT-DB.3.3 PQ3.SALE Hùng đọc ảnh 1509, 3402, không đọc ảnh tạm của Hoa');
select t.thoat();
select t.dang_nhap(t.id('lan'));
select t.bang(t.so('select * from public.anh_can'), 1::bigint, 'KT-DB.3.3 PQ3.SALE Lan chỉ đọc ảnh 1509');
select t.thoat();
select t.dang_nhap(t.id('nga'));
select t.ok(coalesce(t.so('select * from public.anh_can'), 0) = 0, 'KT-DB.3.3 PQ3.SALE Nga không đọc ảnh nào');
select t.thoat();

-- Link mời: chỉ chủ tạo đọc (PQ18).
insert into public.link_moi (ma, loai, chu_id, het_han_luc) values ('thu-ma-1', 'moi_sale', t.id('hoa'), now() + interval '21 days');
insert into public.link_xin_lich (ma, sale_id) values ('thu-xin-1', t.id('nga'));
select t.dang_nhap(t.id('hoa'));
select t.bang(t.so('select * from public.link_moi'), 1::bigint, 'KT-DB.3.3 PQ18.CHU Chị Hoa đọc link mời của mình');
select t.ok(coalesce(t.so('select * from public.link_xin_lich'), 0) = 0, 'KT-DB.3.3 PQ18.CHU Chị Hoa không đọc link xin lịch của Nga');
select t.thoat();
select t.dang_nhap(t.id('hung'));
select t.ok(coalesce(t.so('select * from public.link_moi'), 0) = 0, 'KT-DB.3.3 PQ18.SALE Hùng không đọc link mời của Chị Hoa');
select t.thoat();
select t.dang_nhap(t.id('nga'));
select t.bang(t.so('select * from public.link_xin_lich'), 1::bigint, 'KT-DB.3.3 PQ18.SALE Nga đọc link xin lịch của mình');
select t.thoat();

-- Phạm vi "tất cả căn" gồm căn thêm sau; "chọn căn" thì không.
insert into public.can (id, nguoi_giu, loai, ma_can) values ('00000000-0000-0000-0001-000000002000', t.id('hoa'), 'co_lich', '2000');
select t.dang_nhap(t.id('hung'));
select t.bang(t.so($$select * from public.my_shared_can_ids() x where x = '00000000-0000-0000-0001-000000002000'$$), 1::bigint,
              'KT-DB.3.3 PQ3.SALE tất cả căn: căn Chị Hoa thêm sau tự vào phạm vi của Hùng');
select t.thoat();
select t.dang_nhap(t.id('lan'));
select t.bang(t.so($$select * from public.my_shared_can_ids() x where x = '00000000-0000-0000-0001-000000002000'$$), 0::bigint,
              'KT-DB.3.3 PQ3.SALE chọn căn: căn Chị Hoa thêm sau không vào phạm vi của Lan');
select t.thoat();

-- Chọn thêm 3402 cho Lan thì Lan thấy 3402.
insert into public.ket_noi_can (ket_noi_id, can_id) values (t.kn('hoa', 'lan'), t.can('3402'));
select t.dang_nhap(t.id('lan'));
select t.bang(t.so('select * from public.my_shared_can_ids()'), 2::bigint, 'KT-DB.3.3 PQ3.SALE Lan được chọn thêm 3402 thì thấy 2 căn');
select t.thoat();
delete from public.ket_noi_can where ket_noi_id = t.kn('hoa', 'lan') and can_id = t.can('3402');

-- Căn chủ nhà loại tu_nhap (nếu có) không chia sẻ.
insert into public.can (id, nguoi_giu, loai, ma_can, chu_can_ten) values ('00000000-0000-0000-0001-000000002001', t.id('hoa'), 'tu_nhap', 'Nhà quen', 'Người quen');
select t.dang_nhap(t.id('hung'));
select t.bang(t.so($$select * from public.my_shared_can_ids() x where x = '00000000-0000-0000-0001-000000002001'$$), 0::bigint,
              'KT-DB.3.3 căn tu_nhap của chủ không được chia sẻ cho sale');
select t.thoat();

-- Căn đã ẩn thì sale thôi thấy; chủ vẫn đọc căn đã ẩn của mình.
update public.can set an_luc = now() where id = t.can('3402');
select t.dang_nhap(t.id('hung'));
select t.bang(t.so($$select * from public.my_shared_can_ids() x where x = t.can('3402')$$), 0::bigint,
              'KT-DB.3.3 căn đã ẩn không còn trong my_shared_can_ids');
select t.ok(coalesce(t.so($$select * from public.can where id = t.can('3402')$$), 0) = 0,
            'KT-DB.3.3 PQ3.SALE sale không đọc được căn đã ẩn');
select t.thoat();
select t.dang_nhap(t.id('hoa'));
select t.bang(t.so($$select * from public.can where id = t.can('3402')$$), 1::bigint, 'KT-DB.3.3 PQ3.CHU chủ vẫn đọc căn đã ẩn của mình');
select t.thoat();
update public.can set an_luc = null where id = t.can('3402');

-- Kết nối không hiệu lực thì sale không thấy căn nào.
update public.ket_noi set trang_thai = 'chu_ngung' where id = t.kn('hoa', 'hung');
select t.dang_nhap(t.id('hung'));
select t.bang(t.so('select * from public.my_shared_can_ids()'), 0::bigint, 'KT-DB.3.3 PQ3.SALE chủ ngừng cho xem: Hùng không còn căn được chia sẻ');
select t.ok(coalesce(t.so($$select * from public.can where nguoi_giu = t.id('hoa')$$), 0) = 0,
            'KT-DB.3.3 PQ3.SALE bị ngừng: Hùng không đọc căn của Chị Hoa');
select t.thoat();
update public.ket_noi set trang_thai = 'sale_bo' where id = t.kn('hoa', 'hung');
select t.dang_nhap(t.id('hung'));
select t.bang(t.so('select * from public.my_shared_can_ids()'), 0::bigint, 'KT-DB.3.3 sale bỏ nguồn: Hùng không còn căn được chia sẻ');
select t.thoat();
update public.ket_noi set trang_thai = 'chua_ket_noi' where id = t.kn('hoa', 'hung');
select t.dang_nhap(t.id('hung'));
select t.bang(t.so('select * from public.my_shared_can_ids()'), 0::bigint, 'KT-DB.3.3 chưa kết nối: Hùng không có căn được chia sẻ');
select t.thoat();
update public.ket_noi set trang_thai = 'da_ket_noi' where id = t.kn('hoa', 'hung');

-- Ràng buộc của kết nối và căn.
select t.ok(t.ma_loi($$insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon, pham_vi, xem_coc)
                       values (t.id('hoa'), t.id('hung'), 'da_ket_noi', 'them_tay', 'tat_ca', true)$$) = '23505',
            'KT-DB.3.3 ket_noi duy nhất theo (chu_id, sale_id)');
select t.ok(t.ma_loi($$insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon, pham_vi, xem_coc)
                       values (t.id('hoa'), t.id('hoa'), 'da_ket_noi', 'them_tay', 'tat_ca', true)$$) = '23514',
            'KT-DB.3.3 ket_noi không cho chủ tự kết nối với chính mình');
select t.ok(t.ma_loi($$insert into public.can (nguoi_giu, loai, ma_can) values (t.id('hoa'), 'co_lich', ' 1509 ')$$) like '23%',
            'KT-DB.3.3 một người giữ không có hai căn chưa ẩn trùng mã (bỏ khoảng trắng, không phân biệt hoa thường)');
select t.ok(t.ma_loi($$insert into public.can (nguoi_giu, loai, ma_can) values (t.id('tuan'), 'co_lich', '1509')$$) is null,
            'KT-DB.3.3 người giữ khác được có căn cùng mã');
select t.ok(t.ma_loi($$update public.can set an_luc = now() where id = t.can('3402');
                       insert into public.can (nguoi_giu, loai, ma_can) values (t.id('hoa'), 'co_lich', '3402')$$) is null,
            'KT-DB.3.3 căn đã ẩn không giữ mã: tạo lại căn cùng mã được');
select t.ok(t.ma_loi($$insert into public.toa_nha (ten, home247_dat_san) values ('icon40', false)$$) = '23505',
            'KT-DB.3.3 tên tòa nhà không trùng, không phân biệt hoa thường');

-- toa_nha, ngay_le: mọi người đăng nhập đọc.
select t.dang_nhap(t.id('nga'));
select t.bang(t.so($$select * from public.toa_nha where id in (t.toa('icon40'), t.toa('sapphire'))$$), 2::bigint, 'KT-DB.3.3 mọi người đăng nhập đọc toa_nha');
select t.ok(t.so('select * from public.ngay_le') is not null, 'KT-DB.3.3 mọi người đăng nhập đọc ngay_le');
select t.thoat();
