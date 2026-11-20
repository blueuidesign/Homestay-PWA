-- EN10 · Xóa file ảnh tạm quá 24 giờ và ảnh bị bỏ khỏi căn trong kho anh-can (YC3 "Dữ liệu", QT5.7).
-- Hàng đợi file_cho_xoa, lệnh fn_file_cho_xoa, fn_da_xoa_file chỉ cho service_role (việc định kỳ ở server, không phải app).
-- Viết trước migration (EN10-TA1).
select t.fixture();

create or replace function pg_temp.loi(p_cau text) returns text language plpgsql as $$
declare ma text;
begin
  execute p_cau;
  return 'qua';
exception when others then
  get stacked diagnostics ma = returned_sqlstate;
  return ma;
end $$;

-- Dựng: ba file trong kho của Chị Hoa. a.jpg là ảnh tạm 25 giờ trước, b.jpg gắn 1509 (tải 2 giờ trước), c.jpg file tải lên 30 giờ trước mà không ghi ảnh tạm.
insert into storage.objects (bucket_id, name, created_at) values
  ('anh-can', t.id('hoa') || '/a.jpg', now() - interval '25 hours'),
  ('anh-can', t.id('hoa') || '/b.jpg', now() - interval '2 hours'),
  ('anh-can', t.id('hoa') || '/c.jpg', now() - interval '30 hours'),
  ('anh-can', t.id('hoa') || '/d.jpg', now() - interval '1 hour');
insert into public.anh_can (nguoi_tai, duong_dan, tao_luc) values (t.id('hoa'), t.id('hoa') || '/a.jpg', now() - interval '25 hours');
insert into public.anh_can (nguoi_tai, duong_dan, tao_luc, can_id) values (t.id('hoa'), t.id('hoa') || '/b.jpg', now() - interval '25 hours', t.can('1509'));

-- ===== Danh mục =====
select t.ok(not has_table_privilege('authenticated', 'public.file_cho_xoa', 'select')
            and not has_table_privilege('anon', 'public.file_cho_xoa', 'select')
            and not has_table_privilege('authenticated', 'public.file_cho_xoa', 'insert'),
            'EN10 danh mục: app không đọc, không ghi hàng đợi file_cho_xoa');
select t.ok(exists (select 1 from pg_proc p where p.proname in ('fn_file_cho_xoa', 'fn_da_xoa_file') and p.pronamespace = 'public'::regnamespace)
            and not exists (select 1 from pg_proc p where p.proname in ('fn_file_cho_xoa', 'fn_da_xoa_file') and p.pronamespace = 'public'::regnamespace
                            and (has_function_privilege('authenticated', p.oid, 'execute') or has_function_privilege('anon', p.oid, 'execute'))),
            'EN10 danh mục: chỉ service_role gọi được fn_file_cho_xoa, fn_da_xoa_file');
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi($$select * from public.fn_file_cho_xoa(100)$$), '42501', 'EN10 Chị Hoa gọi fn_file_cho_xoa bị từ chối');
select t.thoat();

-- ===== Ảnh tạm quá 24 giờ =====
select t.bang((select count(*) from public.fn_don_anh_tam()), 1::bigint, 'EN10 YC3 Dữ liệu dọn ảnh tạm quá 24 giờ xóa dòng a.jpg');
select t.bang((select array_agg(x order by x) from public.fn_file_cho_xoa(100) x)::text,
              array[t.id('hoa') || '/a.jpg', t.id('hoa') || '/c.jpg']::text,
              'EN10 YC3 Dữ liệu file cần xóa: a.jpg (ảnh tạm quá 24 giờ) và c.jpg (file không ghi ảnh, quá 24 giờ); không có b.jpg đã gắn căn, d.jpg mới tải');

-- ===== Ảnh bị bỏ khỏi căn =====
delete from public.anh_can where duong_dan = t.id('hoa') || '/b.jpg';
select t.ok(t.id('hoa') || '/b.jpg' in (select * from public.fn_file_cho_xoa(100)),
            'EN10 YC3 Dữ liệu ảnh bị bỏ khỏi căn (xóa dòng anh_can) thì file b.jpg vào danh sách cần xóa');

-- ===== Đã xóa file =====
select public.fn_da_xoa_file(array[t.id('hoa') || '/a.jpg', t.id('hoa') || '/b.jpg']);
delete from storage.objects where name in (t.id('hoa') || '/a.jpg', t.id('hoa') || '/b.jpg'); -- dịch vụ kho đã xóa file
select t.bang((select array_agg(x order by x) from public.fn_file_cho_xoa(100) x)::text, array[t.id('hoa') || '/c.jpg']::text,
              'EN10 file đã xóa khỏi kho không còn trong danh sách');
select t.bang((select count(*) from public.fn_file_cho_xoa(0)), 0::bigint, 'EN10 giới hạn 0 thì không trả file nào');
