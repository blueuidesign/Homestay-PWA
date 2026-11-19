-- US16 · Ảnh căn (YC3.3). Kho ảnh riêng tư anh-can, ảnh tạm fn_them_anh_tam, gắn ảnh khi tạo căn (fn_tao_can p_anh).
-- YC3.3-NT3, NT5, NT6 (phần database), PQ3.CHU, PQ3.SALE, PQ3.LINK, QT5.7, YC3 "Ai được làm gì", YC3 "Dữ liệu".
-- Viết trước migration (US16-TA1, CL14.5): task sau không sửa file này.
-- Kho ảnh chạy trên giả lập storage (supabase/gia-lap/00_supabase.sql). Cỡ file và loại file thật do kho của
-- Supabase chặn theo cấu hình bucket: ở đây kiểm cấu hình, còn lệnh tải thật nằm ở tests/e2e/supabase/anh-can.spec.ts.
select t.fixture();

-- Chạy câu lệnh, mong bị từ chối với đúng mã lỗi và đúng câu (QT5.5).
create or replace function t.loi_cau(cau text, ma_mong text, cau_mong text, ten text) returns void
language plpgsql as $$
declare ma text; cau_loi text;
begin
  begin
    execute cau;
  exception when others then
    get stacked diagnostics ma = returned_sqlstate, cau_loi = message_text;
    if ma = ma_mong and cau_loi = cau_mong then
      raise notice 'ok - %', ten;
    else
      raise notice 'not ok - % (ra: % "%", mong: % "%")', ten, ma, cau_loi, ma_mong, cau_mong;
    end if;
    return;
  end;
  raise notice 'not ok - % (không bị từ chối)', ten;
end $$;

-- Đường dẫn file của một người trong kho: <uid>/<tên>.
create or replace function t.dd(nguoi text, ten text) returns text
language sql immutable as $$ select t.id(nguoi)::text || '/' || ten $$;

-- Đặt file vào kho bằng vai chủ database (như kho đã nhận file), rồi người tải ghi ảnh tạm bằng fn_them_anh_tam.
-- Trả id ảnh tạm, null nếu bị từ chối. Gọi khi đang ở vai chủ database; xong thì về vai chủ database.
create or replace function t.anh_tam(nguoi text, ten text) returns uuid
language plpgsql as $$
declare v text;
begin
  perform t.thoat();
  insert into storage.objects (bucket_id, name, owner, metadata)
  values ('anh-can', t.dd(nguoi, ten), t.id(nguoi), '{"size": 350000, "mimetype": "image/jpeg"}')
  on conflict do nothing;
  perform t.dang_nhap(t.id(nguoi));
  v := t.gt(format('public.fn_them_anh_tam(%L)', t.dd(nguoi, ten)));
  perform t.thoat();
  return v::uuid;
end $$;

-- Mảng id ảnh tạm a1..an của một người (tạo mới mỗi lần gọi với tiền tố khác nhau).
create or replace function t.ds_anh(nguoi text, tien_to text, n int) returns uuid[]
language plpgsql as $$
declare kq uuid[] := '{}'; i int;
begin
  for i in 1..n loop
    kq := kq || t.anh_tam(nguoi, tien_to || i || '.jpg');
  end loop;
  return kq;
end $$;

-- Đếm file trong kho anh-can mà vai hiện tại đọc được, theo đường dẫn.
create or replace function t.thay_file(duong_dan text) returns bigint
language plpgsql as $$
begin
  return coalesce(t.so(format('select 1 from storage.objects where bucket_id = %L and name = %L', 'anh-can', duong_dan)), 0);
end $$;

grant execute on all functions in schema t to anon, authenticated;

-- ===== Danh mục: kho ảnh, lệnh ghi =====
select t.ok(exists (select 1 from storage.buckets where id = 'anh-can' and public is false),
            'YC3.3-NT5 QT5.7 danh mục: có kho ảnh anh-can, riêng tư (không mở được bằng đường dẫn công khai)');
select t.bang((select file_size_limit from storage.buckets where id = 'anh-can'), 15728640::bigint,
              'YC3.3-NT6 danh mục: kho ảnh anh-can chỉ nhận file tới 15 MB');
select t.bang((select array(select unnest(allowed_mime_types) order by 1) from storage.buckets where id = 'anh-can'),
              array['image/heic', 'image/jpeg', 'image/png']::text[],
              'YC3.3-NT6 danh mục: kho ảnh anh-can chỉ nhận JPEG, PNG, HEIC (không nhận PDF)');
select t.ok(exists (select 1 from pg_proc where proname = 'fn_them_anh_tam' and pronamespace = 'public'::regnamespace and prosecdef),
            'YC3.3 bước 23 danh mục: có lệnh fn_them_anh_tam chạy security definer');
select t.ok(exists (select 1 from pg_proc p where p.proname = 'fn_them_anh_tam' and p.pronamespace = 'public'::regnamespace
                    and has_function_privilege('authenticated', p.oid, 'execute'))
            and not exists (select 1 from pg_proc p where p.proname = 'fn_them_anh_tam' and p.pronamespace = 'public'::regnamespace
                            and has_function_privilege('anon', p.oid, 'execute')),
            'YC3.3-NT5 danh mục: người chưa đăng nhập không gọi được fn_them_anh_tam, người đã đăng nhập gọi được');
select t.ok(exists (select 1 from pg_proc p where p.proname = 'fn_tao_can' and p.pronamespace = 'public'::regnamespace
                    and 'p_anh' = any (p.proargnames)),
            'YC3.3-NT3 danh mục: lệnh tạo căn nhận danh sách ảnh p_anh (lưu căn và gắn ảnh trong một giao dịch)');
select t.ok(not has_table_privilege('authenticated', 'public.anh_can', 'insert')
            and not has_table_privilege('authenticated', 'public.anh_can', 'update')
            and not has_table_privilege('authenticated', 'public.anh_can', 'delete')
            and not has_table_privilege('anon', 'public.anh_can', 'insert'),
            'YC3.3-NT5 danh mục: app không ghi thẳng bảng anh_can (ghi qua fn_*)');
select t.ok(exists (select 1 from pg_proc p where p.proname = 'fn_don_anh_tam' and p.pronamespace = 'public'::regnamespace)
            and not exists (select 1 from pg_proc p where p.proname = 'fn_don_anh_tam' and p.pronamespace = 'public'::regnamespace
                            and (has_function_privilege('authenticated', p.oid, 'execute') or has_function_privilege('anon', p.oid, 'execute'))),
            'YC3.3 ảnh tạm quá 24 giờ danh mục: có fn_don_anh_tam, app không gọi được');

-- ===== YC3.3-NT5: tải file vào thư mục người khác, gắn ảnh tạm của người khác =====
-- Chị Hoa tải file vào thư mục của mình: được.
select t.dang_nhap(t.id('hoa'));
select t.khong_loi(format($$insert into storage.objects (bucket_id, name, owner, metadata)
                            values ('anh-can', %L, auth.uid(), '{"size": 350000, "mimetype": "image/jpeg"}')$$,
                          t.dd('hoa', 'tu-tai.jpg')),
                   'YC3.3-NT5 PQ3.CHU Chị Hoa tải file vào thư mục của chính mình trong kho ảnh thì được');
select t.loi(format($$insert into storage.objects (bucket_id, name, owner, metadata)
                      values ('anh-can', %L, auth.uid(), '{}')$$, 'tu-tai-goc.jpg'),
             '42501', 'YC3.3-NT5 Chị Hoa tải file ra ngoài thư mục của mình (gốc kho) thì bị từ chối');
select t.thoat();

-- Anh Tuấn tải file vào thư mục của Chị Hoa: bị từ chối.
select t.dang_nhap(t.id('tuan'));
select t.loi(format($$insert into storage.objects (bucket_id, name, owner, metadata)
                      values ('anh-can', %L, auth.uid(), '{"size": 350000, "mimetype": "image/jpeg"}')$$,
                    t.dd('hoa', 'tuan-chen.jpg')),
             '42501', 'YC3.3-NT5 Anh Tuấn tải file vào thư mục của Chị Hoa trong kho ảnh thì bị từ chối');
select t.thoat();
select t.bang((select count(*) from storage.objects where name = t.dd('hoa', 'tuan-chen.jpg')), 0::bigint,
              'YC3.3-NT5 kho không có file Anh Tuấn chen vào thư mục của Chị Hoa');

-- Người chưa đăng nhập tải file: bị từ chối.
select t.khach();
select t.ok(t.ma_loi(format($$insert into storage.objects (bucket_id, name, metadata) values ('anh-can', %L, '{}')$$,
                            t.dd('hoa', 'khach.jpg'))) is not null,
            'YC3.3-NT5 người chưa đăng nhập tải file vào kho ảnh thì bị từ chối');
select t.thoat();

-- Ảnh tạm của Chị Hoa.
select set_config('t.anh_hoa1', coalesce(t.anh_tam('hoa', 'h1.jpg')::text, ''), true);
select t.ok(nullif(current_setting('t.anh_hoa1', true), '') is not null,
            'YC3.3 bước 23 Chị Hoa ghi ảnh tạm cho file vừa tải vào thư mục của mình thì lệnh trả mã ảnh');
select t.bang((select coalesce(can_id::text, 'tam') || '|' || nguoi_tai::text || '|' || duong_dan
               from public.anh_can where id = nullif(current_setting('t.anh_hoa1', true), '')::uuid),
              'tam|' || t.id('hoa')::text || '|' || t.dd('hoa', 'h1.jpg'),
              'YC3.3 bước 23 ảnh tạm ghi người tải là Chị Hoa, chưa gắn căn');

-- Anh Tuấn ghi ảnh tạm bằng file trong thư mục của Chị Hoa: bị từ chối.
select t.dang_nhap(t.id('tuan'));
select t.ok(t.ma_loi(format('select public.fn_them_anh_tam(%L)', t.dd('hoa', 'h1.jpg'))) is not null,
            'YC3.3-NT5 Anh Tuấn ghi ảnh tạm bằng file trong thư mục của Chị Hoa thì bị từ chối');
-- File trong thư mục Chị Hoa chưa ai ghi ảnh tạm (thêm sau phép thử làm hỏng: file đã ghi thì lỗi trùng che mất lỗi quyền).
select t.ok(t.ma_loi(format('select public.fn_them_anh_tam(%L)', t.dd('hoa', 'tu-tai.jpg'))) is not null,
            'YC3.3-NT5 Anh Tuấn ghi ảnh tạm bằng file trong thư mục của Chị Hoa (file chưa ai ghi) thì bị từ chối');
select t.bang(coalesce(t.so(format('select * from public.anh_can where id = %L', current_setting('t.anh_hoa1'))), 0),
              0::bigint, 'YC3.3-NT5 Anh Tuấn không đọc được ảnh tạm của Chị Hoa');
select t.bang(t.thay_file(t.dd('hoa', 'h1.jpg')), 0::bigint,
              'YC3.3-NT5 Anh Tuấn không mở được file ảnh tạm của Chị Hoa trong kho');

-- Anh Tuấn gắn ảnh tạm của Chị Hoa vào căn mới của mình: bị từ chối, không tạo căn, ảnh vẫn là ảnh tạm của Chị Hoa.
select t.loi(format($$select public.fn_tao_can(p_ma_can => '9001', p_so_phong_ngu => 1,
                       p_client_id => '00000000-0000-0000-00bb-000000000001', p_anh => array[%L]::uuid[])$$,
                    current_setting('t.anh_hoa1')),
             '42501', 'YC3.3-NT5 Anh Tuấn gửi lệnh gắn ảnh tạm của Chị Hoa vào căn của mình thì bị từ chối (lỗi quyền)');
select t.thoat();
select t.bang((select count(*) from public.can where nguoi_giu = t.id('tuan') and ma_can = '9001'), 0::bigint,
              'YC3.3-NT5 lệnh bị từ chối thì Anh Tuấn không có căn 9001');
select t.bang((select can_id from public.anh_can where id = current_setting('t.anh_hoa1')::uuid), null::uuid,
              'YC3.3-NT5 ảnh của Chị Hoa vẫn là ảnh tạm, không gắn vào căn của Anh Tuấn');

-- Chị Hoa vẫn đọc được ảnh tạm và file của mình.
select t.dang_nhap(t.id('hoa'));
select t.bang(t.so(format('select * from public.anh_can where id = %L', current_setting('t.anh_hoa1'))), 1::bigint,
              'YC3.3 bước 23 Chị Hoa đọc được ảnh tạm của mình');
select t.bang(t.thay_file(t.dd('hoa', 'h1.jpg')), 1::bigint, 'YC3.3 bước 23 Chị Hoa mở được file ảnh tạm của mình');
select t.thoat();

-- Người chưa đăng nhập ghi ảnh tạm, mở file: bị từ chối.
select t.khach();
select t.ok(t.ma_loi(format('select public.fn_them_anh_tam(%L)', t.dd('hoa', 'h1.jpg'))) is not null,
            'YC3.3-NT5 người chưa đăng nhập ghi ảnh tạm thì bị từ chối');
select t.bang(t.thay_file(t.dd('hoa', 'h1.jpg')), 0::bigint,
              'YC3.3-NT5 người chưa đăng nhập mở ảnh bằng đường dẫn trực tiếp thì không thấy file');
select t.thoat();

-- ===== Gắn 3 ảnh khi tạo căn 2105; ai mở được ảnh căn (PQ3.CHU, PQ3.SALE) =====
select set_config('t.ds3', t.ds_anh('hoa', 'c', 3)::text, true);
select t.dang_nhap(t.id('hoa'));
select set_config('t.can2105',
  coalesce(t.gt(format($$public.fn_tao_can(p_ma_can => '2105', p_so_phong_ngu => 1,
                         p_client_id => '00000000-0000-0000-00bb-000000000002', p_anh => %L::uuid[])$$,
                       current_setting('t.ds3'))), ''), true);
select t.ok(nullif(current_setting('t.can2105', true), '') is not null,
            'YC3.3 bước 23 Chị Hoa thêm căn 2105 kèm 3 ảnh tạm thì lệnh trả mã căn');
select t.thoat();
select t.bang((select string_agg(a.duong_dan || '@' || a.thu_tu, ',' order by a.thu_tu)
               from public.anh_can a where a.can_id = nullif(current_setting('t.can2105', true), '')::uuid),
              t.dd('hoa', 'c1.jpg') || '@1,' || t.dd('hoa', 'c2.jpg') || '@2,' || t.dd('hoa', 'c3.jpg') || '@3',
              'YC3.3 bước 24 3 ảnh gắn vào căn 2105 theo đúng thứ tự gửi, ảnh đầu thứ tự 1');
select t.dang_nhap(t.id('hoa'));
select t.bang(t.gt($$(select anh_dai_dien || '|' || so_anh from public.v_can_cua_toi
                      where id = nullif(current_setting('t.can2105', true), '')::uuid)$$),
              t.dd('hoa', 'c1.jpg') || '|3',
              'YC3.3 bước 24 ảnh chọn đầu tiên là ảnh đại diện trên thẻ căn 2105, thẻ ghi 3 ảnh');
select t.bang(t.thay_file(t.dd('hoa', 'c1.jpg')), 1::bigint, 'YC3.3-NT5 PQ3.CHU Chị Hoa mở được ảnh căn 2105 của mình');
select t.thoat();

select t.dang_nhap(t.id('hung'));
select t.bang(t.thay_file(t.dd('hoa', 'c1.jpg')), 1::bigint,
              'YC3.3-NT5 PQ3.SALE Sale Hùng (được chia sẻ tất cả căn) mở được ảnh căn 2105');
select t.bang(t.thay_file(t.dd('hoa', 'h1.jpg')), 0::bigint,
              'YC3.3-NT5 PQ3.SALE Sale Hùng không mở được ảnh tạm chưa gắn căn của Chị Hoa');
select t.thoat();
select t.dang_nhap(t.id('lan'));
select t.bang(t.thay_file(t.dd('hoa', 'c1.jpg')), 0::bigint,
              'YC3.3-NT5 PQ3.SALE Sale Lan (chỉ được chia sẻ 1509) không mở được ảnh căn 2105');
select t.thoat();
select t.dang_nhap(t.id('nga'));
select t.bang(t.thay_file(t.dd('hoa', 'c1.jpg')), 0::bigint,
              'YC3.3-NT5 Sale Nga (chưa kết nối) không mở được ảnh căn 2105');
select t.bang(coalesce(t.so(format('select * from public.anh_can where can_id = %L', current_setting('t.can2105'))), 0), 0::bigint,
              'YC3.3-NT5 Sale Nga không đọc được dòng ảnh của căn 2105');
select t.thoat();
select t.dang_nhap(t.id('tuan'));
select t.bang(t.thay_file(t.dd('hoa', 'c1.jpg')), 0::bigint,
              'YC3.3-NT5 PQ3.CHU Anh Tuấn (chủ nhà khác) không mở được ảnh căn 2105 của Chị Hoa');
select t.thoat();
select t.khach();
select t.bang(t.thay_file(t.dd('hoa', 'c1.jpg')), 0::bigint,
              'YC3.3-NT5 PQ3.LINK người chưa đăng nhập không mở được ảnh căn bằng đường dẫn trực tiếp');
select t.thoat();

-- Ảnh đang gắn căn 2105 không gắn được sang căn khác (chỉ ảnh tạm của người gọi hoặc ảnh của chính căn này).
select t.dang_nhap(t.id('hoa'));
select t.loi(format($$select public.fn_tao_can(p_ma_can => '2106', p_so_phong_ngu => 1,
                       p_client_id => '00000000-0000-0000-00bb-000000000003', p_anh => array[%L]::uuid[])$$,
                    (current_setting('t.ds3')::uuid[])[1]),
             '42501', 'YC3.3 Luật kiểm Ảnh: ảnh đang gắn căn 2105 gắn sang căn mới 2106 thì bị từ chối (lỗi quyền)');
-- Gửi lại cùng mã lần gửi thì trả căn đã có, ảnh không đổi (QT5.6).
select t.bang(t.gt(format($$public.fn_tao_can(p_ma_can => '2105', p_so_phong_ngu => 1,
                            p_client_id => '00000000-0000-0000-00bb-000000000002', p_anh => %L::uuid[])$$,
                          current_setting('t.ds3'))),
              current_setting('t.can2105'),
              'YC3.3 bước 23 QT5.6 gửi lại lệnh tạo căn 2105 kèm ảnh với cùng mã lần gửi thì trả căn đã có');
select t.thoat();
select t.bang((select count(*) from public.anh_can where can_id = current_setting('t.can2105')::uuid), 3::bigint,
              'YC3.3 bước 23 QT5.6 gửi lại thì căn 2105 vẫn đúng 3 ảnh');

-- ===== YC3.3-NT3: 12 ảnh được, 13 ảnh bị từ chối; danh sách trùng bị từ chối =====
select set_config('t.ds13', t.ds_anh('hoa', 'm', 13)::text, true);
select t.dang_nhap(t.id('hoa'));
select t.loi_cau(format($$select public.fn_tao_can(p_ma_can => '3001', p_so_phong_ngu => 2,
                           p_client_id => '00000000-0000-0000-00bb-000000000013', p_anh => %L::uuid[])$$,
                        current_setting('t.ds13')),
                 'P0001', 'Mỗi căn tối đa 12 ảnh',
                 'YC3.3-NT3 lệnh gắn 13 ảnh gửi thẳng tới database bị từ chối với câu "Mỗi căn tối đa 12 ảnh"');
select t.thoat();
select t.bang((select count(*) from public.can where nguoi_giu = t.id('hoa') and ma_can = '3001'), 0::bigint,
              'YC3.3-NT3 gắn 13 ảnh bị từ chối thì không có căn 3001 (lưu căn và gắn ảnh cùng một giao dịch)');
select t.bang((select count(*) from public.anh_can where id = any (current_setting('t.ds13')::uuid[]) and can_id is null), 13::bigint,
              'YC3.3-NT3 gắn 13 ảnh bị từ chối thì 13 ảnh vẫn là ảnh tạm');

select t.dang_nhap(t.id('hoa'));
select t.loi_cau(format($$select public.fn_tao_can(p_ma_can => '3002', p_so_phong_ngu => 2,
                           p_client_id => '00000000-0000-0000-00bb-000000000014', p_anh => array[%L, %L]::uuid[])$$,
                        (current_setting('t.ds13')::uuid[])[1], (current_setting('t.ds13')::uuid[])[1]),
                 'P0001', 'Danh sách ảnh bị trùng',
                 'YC3.3 Luật kiểm Ảnh: danh sách ảnh có một ảnh hai lần thì bị từ chối với câu "Danh sách ảnh bị trùng"');
select set_config('t.can3003',
  coalesce(t.gt(format($$public.fn_tao_can(p_ma_can => '3003', p_so_phong_ngu => 2,
                         p_client_id => '00000000-0000-0000-00bb-000000000015', p_anh => %L::uuid[])$$,
                       (current_setting('t.ds13')::uuid[])[1:12])), ''), true);
select t.ok(nullif(current_setting('t.can3003', true), '') is not null,
            'YC3.3-NT3 thêm căn kèm đúng 12 ảnh thì được');
select t.khong_loi($$select public.fn_tao_can(p_ma_can => '3004', p_so_phong_ngu => 2,
                      p_client_id => '00000000-0000-0000-00bb-000000000016', p_anh => '{}'::uuid[])$$,
                   'YC3.3 Luật kiểm Ảnh: ảnh không bắt buộc, danh sách ảnh rỗng thì vẫn thêm được căn');
select t.thoat();
select t.bang((select count(*) || '|' || min(thu_tu) || '|' || max(thu_tu) from public.anh_can
               where can_id = nullif(current_setting('t.can3003', true), '')::uuid),
              '12|1|12', 'YC3.3-NT3 căn 3003 có đúng 12 ảnh, thứ tự 1 đến 12');

-- ===== YC3 "Dữ liệu": một người giữ tối đa 50 ảnh tạm =====
-- Chị Hoa đang có 2 ảnh tạm (h1, m13) và file tu-tai.jpg chưa ghi. Thêm cho đủ 50 ảnh tạm.
select t.bang(cardinality(array_remove(t.ds_anh('hoa', 'g', 48), null)), 48,
              'YC3 Dữ liệu ảnh tạm: Chị Hoa ghi được tới 50 ảnh tạm');
select t.bang((select count(*) from public.anh_can where nguoi_tai = t.id('hoa') and can_id is null), 50::bigint,
              'YC3 Dữ liệu ảnh tạm: Chị Hoa đang có đúng 50 ảnh tạm');
select t.dang_nhap(t.id('hoa'));
select t.loi_cau(format('select public.fn_them_anh_tam(%L)', t.dd('hoa', 'tu-tai.jpg')),
                 'P0001', 'Bạn đang có quá nhiều ảnh chưa gắn vào căn. Thêm căn hoặc bỏ bớt ảnh rồi thử lại.',
                 'YC3 Dữ liệu ảnh tạm: ảnh tạm thứ 51 bị từ chối với câu "Bạn đang có quá nhiều ảnh chưa gắn vào căn..."');
select t.thoat();

-- ===== Ảnh tạm không gắn căn nào sau 24 giờ thì bị xóa =====
update public.anh_can set tao_luc = now() - interval '25 hours' where id = current_setting('t.anh_hoa1')::uuid;
update public.anh_can set tao_luc = now() - interval '25 hours' where id = (current_setting('t.ds3')::uuid[])[1];
select t.ok(t.dd('hoa', 'h1.jpg') in (select public.fn_don_anh_tam()),
            'YC3.3 ảnh tạm quá 24 giờ: fn_don_anh_tam trả đường dẫn file ảnh tạm h1 để xóa');
select t.bang((select count(*) from public.anh_can where id = current_setting('t.anh_hoa1')::uuid), 0::bigint,
              'YC3.3 ảnh tạm quá 24 giờ không gắn căn nào thì bị xóa');
select t.bang((select count(*) from public.anh_can where id = (current_setting('t.ds3')::uuid[])[1]), 1::bigint,
              'YC3.3 ảnh đã gắn căn 2105 thì không bị dọn dù quá 24 giờ');
select t.bang((select count(*) from public.anh_can where nguoi_tai = t.id('hoa') and can_id is null), 49::bigint,
              'YC3.3 ảnh tạm chưa quá 24 giờ thì còn nguyên');
