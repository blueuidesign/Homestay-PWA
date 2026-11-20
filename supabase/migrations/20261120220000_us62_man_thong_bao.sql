-- US62 · Màn Thông báo (YC12.2). Lệnh đọc danh sách và lệnh đánh dấu đã đọc. App không sửa thẳng bảng thong_bao (PQ19, QD4).

-- YC12.2 bước 1, 2, PQ19.CHU, PQ19.SALE: thông báo của chính người gọi, mới trước, 50 dòng mỗi lần.
-- Trang sau: truyền tao_luc và id của dòng cuối trang trước. Trả số chưa đọc của cả hộp (không chỉ trang này) và có trang sau không.
-- Không nhận mã người: chỉ đọc của người gọi.
create or replace function public.fn_ds_thong_bao(p_truoc_luc timestamptz default null, p_truoc_id uuid default null)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_dong jsonb;
  v_so int;
  v_chua_doc int;
begin
  select count(*) into v_chua_doc from public.thong_bao tb where tb.nguoi_nhan = v_nguoi and tb.doc_luc is null;
  select coalesce(jsonb_agg(to_jsonb(x) order by x.tao_luc desc, x.id desc), '[]'::jsonb), count(*)
    into v_dong, v_so
  from (
    select tb.id, tb.loai, tb.noi_dung, tb.doi_tuong_loai, tb.doi_tuong_id, tb.tao_luc, tb.doc_luc
    from public.thong_bao tb
    where tb.nguoi_nhan = v_nguoi
      and (p_truoc_luc is null or (tb.tao_luc, tb.id) < (p_truoc_luc, coalesce(p_truoc_id, 'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid)))
    order by tb.tao_luc desc, tb.id desc
    limit 51
  ) x;
  -- Lấy 51 dòng để biết còn trang sau; trả 50.
  return jsonb_build_object(
    'chua_doc', v_chua_doc,
    'con_nua', v_so > 50,
    'dong', case when v_so > 50 then (select jsonb_agg(e) from (select e from jsonb_array_elements(v_dong) with ordinality t(e, o) where o <= 50 order by o) q) else v_dong end
  );
end $$;

-- YC12.2 bước 3, 4, YC12.2-NT3, YC12.2-NT5, PQ19: đánh dấu đã đọc theo danh sách mã (1 đến 100) hay tất cả (p_ids rỗng-null).
-- Lô có một mã không phải của người gọi (hay không có thật) thì từ chối cả lô, không dòng nào đổi. Dòng đã đọc giữ lúc đọc cũ.
-- Trả số dòng vừa đổi.
create or replace function public.fn_danh_dau_da_doc(p_ids uuid[] default null) returns integer
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_ids uuid[];
  v_so integer;
begin
  if p_ids is not null then
    select coalesce(array_agg(distinct x), '{}') into v_ids from unnest(p_ids) x where x is not null;
    if cardinality(v_ids) < 1 or cardinality(v_ids) > 100 then
      raise exception 'Chọn từ 1 đến 100 thông báo' using errcode = '22023';
    end if;
    if (select count(*) from public.thong_bao tb where tb.nguoi_nhan = v_nguoi and tb.id = any (v_ids)) <> cardinality(v_ids) then
      raise exception 'Bạn không có quyền với thông báo này' using errcode = '42501';
    end if;
  end if;
  update public.thong_bao tb set doc_luc = now()
  where tb.nguoi_nhan = v_nguoi and tb.doc_luc is null and (v_ids is null or tb.id = any (v_ids));
  get diagnostics v_so = row_count;
  return v_so;
end $$;

revoke execute on function public.fn_ds_thong_bao(timestamptz, uuid), public.fn_danh_dau_da_doc(uuid[]) from public, anon, authenticated;
grant execute on function public.fn_ds_thong_bao(timestamptz, uuid), public.fn_danh_dau_da_doc(uuid[]) to authenticated;
