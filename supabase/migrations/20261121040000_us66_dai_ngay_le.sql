-- US66 · Dải ngày lễ ở trang quản trị (YC13.2, PQ21). Chỉ thêm, không sửa migration cũ.
-- Đọc dải vẫn qua policy ngay_le_doc (mọi người đã đăng nhập); ghi chỉ qua fn_quan_tri_* (quản trị viên).
-- Không đụng gia_dip: giá dịp của chủ nhà giữ ngày cũ khi dải đổi (YC13-H3).

-- YC13.2 Luật kiểm, YC13-H2, YC13-H4: tối đa 10 ngày, không chồng ngày trong cùng năm.
alter table public.ngay_le
  add constraint ngay_le_toi_da_10_ngay check (den_ngay - tu_ngay <= 9),
  add constraint ngay_le_khong_chong exclude using gist (nam with =, daterange(tu_ngay, den_ngay, '[]') with &&);

-- YC13.2 bước 2: thêm (p_id null) hay sửa một dải. Trả id dải.
create or replace function public.fn_quan_tri_luu_ngay_le(p_id uuid, p_nam integer, p_ten text, p_tu_ngay date, p_den_ngay date)
returns uuid
language plpgsql volatile security definer set search_path = ''
as $$
declare v_ten text := btrim(coalesce(p_ten, '')); v_id uuid; v_trung text;
begin
  perform public.fn_doi_quan_tri();
  if v_ten = '' or length(v_ten) > 80 then raise exception 'Nhập tên dịp' using errcode = 'P0001'; end if;
  if p_nam is null or p_nam < 2000 or p_nam > 2100 or p_tu_ngay is null or p_den_ngay is null
     or (extract(year from p_tu_ngay) <> p_nam and extract(year from p_den_ngay) <> p_nam) then
    raise exception 'Ngày phải thuộc năm đã chọn' using errcode = 'P0001';
  end if;
  if p_den_ngay < p_tu_ngay then raise exception 'Ngày cuối phải từ ngày đầu trở đi' using errcode = 'P0001'; end if;
  if p_den_ngay - p_tu_ngay > 9 then raise exception 'Một dải tối đa 10 ngày' using errcode = 'P0001'; end if;
  select n.ten into v_trung from public.ngay_le n
  where n.nam = p_nam and n.id is distinct from p_id
    and daterange(n.tu_ngay, n.den_ngay, '[]') && daterange(p_tu_ngay, p_den_ngay, '[]')
  order by n.tu_ngay limit 1;
  if found then raise exception 'Dải này trùng ngày với %', v_trung using errcode = 'P0001'; end if;

  if p_id is null then
    insert into public.ngay_le (nam, ten, tu_ngay, den_ngay) values (p_nam, v_ten, p_tu_ngay, p_den_ngay) returning id into v_id;
  else
    update public.ngay_le set nam = p_nam, ten = v_ten, tu_ngay = p_tu_ngay, den_ngay = p_den_ngay where id = p_id returning id into v_id;
    if v_id is null then raise exception 'Dải này không còn, tải lại trang' using errcode = 'P0001'; end if;
  end if;
  return v_id;
end $$;
revoke execute on function public.fn_quan_tri_luu_ngay_le(uuid, integer, text, date, date) from public, anon;
grant execute on function public.fn_quan_tri_luu_ngay_le(uuid, integer, text, date, date) to authenticated;

-- YC13.2 bước 3, NT3: xóa một dải; giá dịp đã lưu của chủ nhà không đổi.
create or replace function public.fn_quan_tri_xoa_ngay_le(p_id uuid) returns void
language plpgsql volatile security definer set search_path = ''
as $$
begin
  perform public.fn_doi_quan_tri();
  delete from public.ngay_le where id = p_id;
end $$;
revoke execute on function public.fn_quan_tri_xoa_ngay_le(uuid) from public, anon;
grant execute on function public.fn_quan_tri_xoa_ngay_le(uuid) to authenticated;
