-- US67 · Tòa nhà ở trang quản trị (YC13.3, PQ21, QT6.3). Chỉ thêm, không sửa migration cũ.
-- Đọc tòa vẫn qua policy toa_nha_doc; người dùng vẫn thêm tòa bằng fn_them_toa (YC3.4). Ghi ở đây chỉ quản trị viên.

-- YC13.3 bước 2, 3, NT2, YC13-H7: thêm (p_id null, cờ Home247 đặt sẵn) hay sửa tên, khu vực một tòa (giữ cờ).
create or replace function public.fn_quan_tri_luu_toa(p_id uuid, p_ten text, p_khu_vuc text) returns uuid
language plpgsql volatile security definer set search_path = ''
as $$
declare v_ten text := btrim(coalesce(p_ten, '')); v_kv text := nullif(btrim(coalesce(p_khu_vuc, '')), ''); v_id uuid;
begin
  perform public.fn_doi_quan_tri();
  if v_ten = '' or length(v_ten) > 80 then raise exception 'Nhập tên tòa' using errcode = 'P0001'; end if;
  if exists (select 1 from public.toa_nha t where lower(btrim(t.ten)) = lower(v_ten) and t.id is distinct from p_id) then
    raise exception 'Đã có tòa tên này, hãy gộp' using errcode = 'P0001';
  end if;
  if p_id is null then
    insert into public.toa_nha (ten, khu_vuc, home247_dat_san) values (v_ten, v_kv, true) returning id into v_id;
  else
    update public.toa_nha set ten = v_ten, khu_vuc = v_kv where id = p_id returning id into v_id;
    if v_id is null then raise exception 'Tòa này không còn, tải lại trang' using errcode = 'P0001'; end if;
  end if;
  return v_id;
end $$;
revoke execute on function public.fn_quan_tri_luu_toa(uuid, text, text) from public, anon;
grant execute on function public.fn_quan_tri_luu_toa(uuid, text, text) to authenticated;

-- YC13.3 bước 4, NT5, YC13-H5: một lệnh chuyển mọi căn của tòa gộp vào sang tòa giữ lại, rồi xóa tòa gộp vào.
create or replace function public.fn_quan_tri_gop_toa(p_giu uuid, p_gop uuid) returns void
language plpgsql volatile security definer set search_path = ''
as $$
begin
  perform public.fn_doi_quan_tri();
  if p_giu is null or p_gop is null or p_giu = p_gop then raise exception 'Chọn tòa khác để gộp' using errcode = 'P0001'; end if;
  perform 1 from public.toa_nha where id in (p_giu, p_gop) for update;
  if (select count(*) from public.toa_nha where id in (p_giu, p_gop)) <> 2 then
    raise exception 'Tòa này không còn, tải lại trang' using errcode = 'P0001';
  end if;
  update public.can set toa_nha_id = p_giu where toa_nha_id = p_gop;
  delete from public.toa_nha where id = p_gop;
end $$;
revoke execute on function public.fn_quan_tri_gop_toa(uuid, uuid) from public, anon;
grant execute on function public.fn_quan_tri_gop_toa(uuid, uuid) to authenticated;
