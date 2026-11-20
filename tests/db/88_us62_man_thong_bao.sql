-- US62 · Màn Thông báo (YC12.2). Lệnh đọc danh sách fn_ds_thong_bao (50 dòng mỗi lần, mới trước, kèm số chưa đọc) và lệnh
-- đánh dấu đã đọc fn_danh_dau_da_doc (theo danh sách mã 1 đến 100, hay tất cả). PQ19: chỉ thông báo của mình.
-- YC12.2-NT1, NT2, NT3, NT5 và các test vi phạm ở YC12 "Ai được làm gì". Viết trước migration (US62-TA1, CL14.5).
select t.fixture();

create or replace function pg_temp.them_tb(p_nguoi uuid, p_loai text, p_tao timestamptz, p_ten text default 'ghi',
                                           p_doc timestamptz default null, p_dt uuid default null) returns uuid
language sql security definer as $$
  insert into public.thong_bao (nguoi_nhan, loai, noi_dung, doi_tuong_loai, doi_tuong_id, tao_luc, doc_luc)
  values (p_nguoi, p_loai, jsonb_build_object('ten', p_ten), 'yeu_cau', p_dt, p_tao, p_doc) returning id
$$;
-- Chạy bằng vai đang đăng nhập: trả jsonb của fn_ds_thong_bao.
create or replace function pg_temp.ds(p_nguoi uuid, p_luc timestamptz default null, p_id uuid default null) returns jsonb
language plpgsql as $$
declare r jsonb;
begin
  perform t.dang_nhap(p_nguoi);
  select public.fn_ds_thong_bao(p_luc, p_id) into r;
  perform t.thoat();
  return r;
end $$;
create or replace function pg_temp.ten_dong(p jsonb) returns text language sql as $$
  select coalesce(string_agg(x ->> 'ten', ',' order by ord), '') from (
    select (d -> 'noi_dung') as x, ord from jsonb_array_elements(p -> 'dong') with ordinality as e(d, ord)) s
$$;
create or replace function pg_temp.doc_luc(p_id uuid) returns timestamptz language sql security definer as $$
  select doc_luc from public.thong_bao where id = p_id
$$;

delete from public.thong_bao where nguoi_nhan in (t.id('hung'), t.id('lan'), t.id('hoa'), t.id('tuan'));

-- ===== Danh mục =====
select t.ok(exists (select 1 from pg_proc where proname = 'fn_ds_thong_bao' and pronamespace = 'public'::regnamespace and prosecdef)
            and exists (select 1 from pg_proc where proname = 'fn_danh_dau_da_doc' and pronamespace = 'public'::regnamespace and prosecdef),
            'YC12.2 danh mục: có fn_ds_thong_bao và fn_danh_dau_da_doc chạy security definer');
select t.ok(not exists (select 1 from pg_proc p where p.proname in ('fn_ds_thong_bao', 'fn_danh_dau_da_doc') and p.pronamespace = 'public'::regnamespace
                        and has_function_privilege('anon', p.oid, 'execute')),
            'YC12.2 danh mục PQ19: người chưa đăng nhập không gọi được hai lệnh');
select t.ok(not exists (select 1 from information_schema.parameters p
                        where p.specific_schema = 'public' and (p.specific_name like 'fn_ds_thong_bao%' or p.specific_name like 'fn_danh_dau_da_doc%')
                          and p.parameter_name in ('p_nguoi', 'p_nguoi_id', 'p_id_nguoi')),
            'YC12.2 danh mục PQ19: hai lệnh không nhận mã người');
select t.ok(not has_table_privilege('authenticated', 'public.thong_bao', 'UPDATE'),
            'YC12.2-NT5 danh mục: app không sửa thẳng bảng thong_bao, chỉ qua lệnh');

-- ===== YC12.2-NT1: Hùng có 2 chưa đọc =====
select pg_temp.them_tb(t.id('hung'), 'yeu_cau_bi_tu_choi', now() - interval '3 days', 'cũ đã đọc', now() - interval '2 days');
select pg_temp.them_tb(t.id('hung'), 'chu_sua_dat_phong', now() - interval '3 hours', 'giữa');
select pg_temp.them_tb(t.id('hung'), 'yeu_cau_bi_tu_choi', now() - interval '1 hour', 'mới', null, '00000000-0000-0000-0062-000000000004');
select t.bang((pg_temp.ds(t.id('hung')) ->> 'chua_doc')::int, 2, 'YC12.2-NT1 số chưa đọc của Hùng là 2');
select t.bang(pg_temp.ten_dong(pg_temp.ds(t.id('hung'))), 'mới,giữa,cũ đã đọc', 'YC12.2-NT1 ba dòng, mới trước');
select t.bang((select count(*)::int from jsonb_array_elements(pg_temp.ds(t.id('hung')) -> 'dong') d where d ->> 'doc_luc' is null), 2,
              'YC12.2-NT1 đúng 2 dòng chưa đọc (doc_luc trống)');

-- ===== YC12.2-NT2: chạm một dòng thì dòng đó thành đã đọc =====
select t.dang_nhap(t.id('hung'));
select t.bang(public.fn_danh_dau_da_doc(array[(select id from public.thong_bao where nguoi_nhan = t.id('hung') and noi_dung ->> 'ten' = 'mới')]), 1,
              'YC12.2-NT2 đánh dấu một dòng: đổi 1 dòng');
select t.thoat();
select t.ok(pg_temp.doc_luc((select id from public.thong_bao where nguoi_nhan = t.id('hung') and noi_dung ->> 'ten' = 'mới')) is not null,
            'YC12.2-NT2 dòng "bị từ chối" của Y4 thành đã đọc');
select t.bang((pg_temp.ds(t.id('hung')) ->> 'chua_doc')::int, 1, 'YC12.2-NT2 còn 1 chưa đọc');

-- ===== YC12.2-NT3: "Đánh dấu đã đọc" tất cả; bấm lại không đổi lúc đọc cũ =====
select t.dang_nhap(t.id('hung'));
select t.bang(public.fn_danh_dau_da_doc(null), 1, 'YC12.2-NT3 đánh dấu tất cả: đổi nốt 1 dòng chưa đọc');
select t.thoat();
select t.bang((pg_temp.ds(t.id('hung')) ->> 'chua_doc')::int, 0, 'YC12.2-NT3 0 chưa đọc');
select set_config('t.luc_doc', (select string_agg(doc_luc::text, ',' order by id) from public.thong_bao where nguoi_nhan = t.id('hung')), true);
select t.dang_nhap(t.id('hung'));
select t.bang(public.fn_danh_dau_da_doc(null), 0, 'YC12.2-NT3 bấm lại: không đổi dòng nào');
select public.fn_danh_dau_da_doc(array[(select id from public.thong_bao where nguoi_nhan = t.id('hung') limit 1)]);
select t.thoat();
select t.bang((select string_agg(doc_luc::text, ',' order by id) from public.thong_bao where nguoi_nhan = t.id('hung')), current_setting('t.luc_doc'),
              'YC12.2-NT3 gọi lại: lúc đọc cũ không đổi');

-- ===== YC12.2-NT5: Lan không thấy, không đổi dòng của Hùng =====
select pg_temp.them_tb(t.id('hung'), 'chu_sua_dat_phong', now() - interval '10 minutes', 'riêng Hùng');
select pg_temp.them_tb(t.id('lan'), 'yeu_cau_het_han', now() - interval '20 minutes', 'của Lan');
select t.bang(pg_temp.ten_dong(pg_temp.ds(t.id('lan'))), 'của Lan', 'YC12.2-NT5 PQ19.SALE Lan chỉ thấy dòng của mình');
select t.bang((pg_temp.ds(t.id('lan')) ->> 'chua_doc')::int, 1, 'YC12.2-NT5 số chưa đọc của Lan chỉ đếm dòng của Lan');
select set_config('t.id_hung', (select id::text from public.thong_bao where nguoi_nhan = t.id('hung') and noi_dung ->> 'ten' = 'riêng Hùng'), true);
select set_config('t.id_lan', (select id::text from public.thong_bao where nguoi_nhan = t.id('lan')), true);
select t.dang_nhap(t.id('lan'));
select t.bang(t.ma_loi(format($$select public.fn_danh_dau_da_doc(array[%L::uuid, %L::uuid])$$, current_setting('t.id_lan'), current_setting('t.id_hung'))), '42501',
              'YC12.2-NT5 PQ19.SALE Lan đánh dấu một lô có một mã của Hùng thì bị từ chối');
select t.thoat();
select t.ok(pg_temp.doc_luc(current_setting('t.id_hung')::uuid) is null, 'YC12.2-NT5 dòng của Hùng không đổi');
select t.ok(pg_temp.doc_luc(current_setting('t.id_lan')::uuid) is null, 'YC12.2-NT5 không dòng nào đổi, kể cả dòng của chính Lan trong lô');
select t.dang_nhap(t.id('lan'));
select t.bang(t.ma_loi($$select public.fn_danh_dau_da_doc(array[gen_random_uuid()])$$), '42501',
              'YC12.2-NT5 mã không có thật cũng bị từ chối như mã của người khác (không lộ dòng có tồn tại hay không)');
select t.thoat();

-- ===== Giới hạn lô 1 đến 100 =====
select t.dang_nhap(t.id('hung'));
select t.bang(t.ma_loi($$select public.fn_danh_dau_da_doc(array[]::uuid[])$$), '22023', 'YC12 Dữ liệu: lô rỗng bị từ chối');
select t.bang(t.ma_loi($$select public.fn_danh_dau_da_doc((select array_agg(gen_random_uuid()) from generate_series(1, 101)))$$), '22023',
              'YC12 Dữ liệu: lô 101 mã bị từ chối');
select t.thoat();

-- ===== Trang 50 dòng =====
delete from public.thong_bao where nguoi_nhan = t.id('hung');
insert into public.thong_bao (nguoi_nhan, loai, noi_dung, tao_luc)
select t.id('hung'), 'chu_sua_dat_phong', jsonb_build_object('ten', 'd' || lpad(i::text, 3, '0')), now() - make_interval(mins => i)
from generate_series(1, 120) i;
select set_config('t.t1', pg_temp.ds(t.id('hung'))::text, true);
select t.bang(jsonb_array_length(current_setting('t.t1')::jsonb -> 'dong'), 50, 'YC12.2 bước 2 trang đầu 50 dòng');
select t.bang((current_setting('t.t1')::jsonb ->> 'con_nua')::boolean, true, 'YC12.2 bước 2 còn trang sau');
select t.bang((current_setting('t.t1')::jsonb ->> 'chua_doc')::int, 120, 'YC12.2 số chưa đọc đếm cả phần chưa tải');
select set_config('t.t2', pg_temp.ds(t.id('hung'), (current_setting('t.t1')::jsonb -> 'dong' -> 49 ->> 'tao_luc')::timestamptz,
                                     (current_setting('t.t1')::jsonb -> 'dong' -> 49 ->> 'id')::uuid)::text, true);
select t.bang(jsonb_array_length(current_setting('t.t2')::jsonb -> 'dong'), 50, 'YC12.2 bước 2 trang hai 50 dòng');
select t.bang(current_setting('t.t2')::jsonb -> 'dong' -> 0 -> 'noi_dung' ->> 'ten', 'd051', 'YC12.2 trang hai nối đúng dòng d051');
select set_config('t.t3', pg_temp.ds(t.id('hung'), (current_setting('t.t2')::jsonb -> 'dong' -> 49 ->> 'tao_luc')::timestamptz,
                                     (current_setting('t.t2')::jsonb -> 'dong' -> 49 ->> 'id')::uuid)::text, true);
select t.bang(jsonb_array_length(current_setting('t.t3')::jsonb -> 'dong'), 20, 'YC12.2 trang ba còn 20 dòng');
select t.bang((current_setting('t.t3')::jsonb ->> 'con_nua')::boolean, false, 'YC12.2 trang ba hết');

-- ===== Anh Tuấn không có thông báo về yêu cầu Hùng gửi Chị Hoa (YC12.2-NT5, YC12 "Ai được làm gì") =====
insert into public.gia_thang (can_id, thang, gia_thuong, gia_cuoi_tuan)
select t.can('1509'), (date_trunc('month', public.local_today()) + make_interval(months => m))::date, 900000, 1300000
from generate_series(0, 4) m on conflict (can_id, thang) do nothing;
select t.dang_nhap(t.id('hung'));
select public.fn_gui_yeu_cau(t.can('1509'), public.local_today() + 40, public.local_today() + 42, null, gen_random_uuid());
select t.thoat();
select t.bang(pg_temp.ten_dong(pg_temp.ds(t.id('tuan'))), '', 'YC12.2-NT5 Anh Tuấn không có thông báo nào về yêu cầu Hùng gửi Chị Hoa');
select t.bang((select count(*)::int from jsonb_array_elements(pg_temp.ds(t.id('hoa')) -> 'dong') d where d ->> 'loai' = 'yeu_cau_moi'), 1,
              'YC12.2 Chị Hoa có thông báo yêu cầu mới của Hùng');

-- Người chưa đăng nhập.
select t.khach();
select t.bang(t.ma_loi($$select public.fn_ds_thong_bao(null, null)$$), '42501', 'YC12.2 PQ19.KHACH người chưa đăng nhập đọc danh sách bị từ chối');
select t.bang(t.ma_loi($$select public.fn_danh_dau_da_doc(null)$$), '42501', 'YC12.2 PQ19.KHACH người chưa đăng nhập đánh dấu bị từ chối');
select t.thoat();
