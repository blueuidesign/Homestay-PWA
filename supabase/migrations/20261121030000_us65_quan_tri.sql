-- US65 · Đăng nhập trang quản trị và quản trị viên (YC13.1, PQ21, vai ADMIN, KT-DB.3.12).
-- Chỉ thêm, không sửa migration cũ. Bảng admins vẫn không cấp quyền cho app; mọi lệnh đi qua hàm fn_* tự kiểm người gọi.
-- Email quản trị viên đầu tiên (dòng la_goc) do Tùng ghi bằng SQL ở mỗi môi trường, không có trong repo (YC15.1-NT3).

-- YC13.1: email đăng nhập của người gọi, đọc từ Supabase Auth (đã xác minh bằng mã email).
create or replace function public.fn_email_nguoi_goi() returns text
language sql stable security definer set search_path = ''
as $$ select lower(btrim(u.email)) from auth.users u where u.id = auth.uid() $$;
revoke execute on function public.fn_email_nguoi_goi() from public, anon, authenticated;

-- YC13.1 bước 6, YC13-H6: quyền quản trị kiểm ở mỗi lệnh, người vừa bị gỡ mất quyền ngay.
create or replace function public.fn_la_quan_tri() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.admins a where lower(a.email) = public.fn_email_nguoi_goi()) $$;
revoke execute on function public.fn_la_quan_tri() from public, anon;
grant execute on function public.fn_la_quan_tri() to authenticated;

-- YC13.1-NT3, NT5: app chỉ gửi mã khi email trong danh sách. Màn luôn hiện cùng một câu (YC13.1 ghi chú).
create or replace function public.fn_quan_tri_co_the_gui_ma(p_email text) returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.admins a where lower(a.email) = lower(btrim(coalesce(p_email, '')))) $$;
revoke execute on function public.fn_quan_tri_co_the_gui_ma(text) from public;
grant execute on function public.fn_quan_tri_co_the_gui_ma(text) to anon, authenticated;

-- Dùng trong các hàm quản trị: không có quyền thì từ chối 42501.
create or replace function public.fn_doi_quan_tri() returns boolean
language plpgsql stable security definer set search_path = ''
as $$
declare v_goc boolean;
begin
  select a.la_goc into v_goc from public.admins a where lower(a.email) = public.fn_email_nguoi_goi();
  if not found then
    raise exception 'Email này không có quyền quản trị' using errcode = '42501';
  end if;
  return v_goc;
end $$;
revoke execute on function public.fn_doi_quan_tri() from public, anon, authenticated;

-- YC13.1 bước 2, NT1: vào trang quản trị; ghi nguoi_id để tóm tắt lỗi hằng sáng (YC15.3) tìm được người nhận.
create or replace function public.fn_quan_tri_vao() returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare v_goc boolean; v_email text;
begin
  v_goc := public.fn_doi_quan_tri();
  v_email := public.fn_email_nguoi_goi();
  update public.admins set nguoi_id = auth.uid() where lower(email) = v_email and nguoi_id is distinct from auth.uid();
  return jsonb_build_object('email', v_email, 'la_goc', v_goc);
end $$;
revoke execute on function public.fn_quan_tri_vao() from public, anon;
grant execute on function public.fn_quan_tri_vao() to authenticated;

-- YC13.1 bước 3: danh sách quản trị viên, chỉ quản trị viên xem.
create or replace function public.fn_quan_tri_danh_sach()
returns table (email text, la_goc boolean, them_luc timestamptz)
language plpgsql stable security definer set search_path = ''
as $$
begin
  perform public.fn_doi_quan_tri();
  return query select a.email, a.la_goc, a.them_luc from public.admins a order by a.la_goc desc, a.them_luc;
end $$;
revoke execute on function public.fn_quan_tri_danh_sach() from public, anon;
grant execute on function public.fn_quan_tri_danh_sach() to authenticated;

-- YC13.1 bước 4, NT2, NT4: chỉ quản trị viên đầu tiên thêm người đồng quản trị.
create or replace function public.fn_quan_tri_them(p_email text) returns void
language plpgsql volatile security definer set search_path = ''
as $$
declare v_email text := lower(btrim(coalesce(p_email, '')));
begin
  if not public.fn_doi_quan_tri() then
    raise exception 'Chỉ quản trị viên đầu tiên thêm, gỡ được quản trị viên' using errcode = '42501';
  end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or length(v_email) > 254 then
    raise exception 'Email chưa đúng' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.admins a where lower(a.email) = v_email) then
    raise exception 'Email này đã có trong danh sách' using errcode = 'P0001';
  end if;
  insert into public.admins (email, la_goc) values (v_email, false);
end $$;
revoke execute on function public.fn_quan_tri_them(text) from public, anon;
grant execute on function public.fn_quan_tri_them(text) to authenticated;

-- YC13.1 bước 5, NT4, NT5: chỉ quản trị viên đầu tiên gỡ; không gỡ được dòng la_goc.
create or replace function public.fn_quan_tri_go(p_email text) returns void
language plpgsql volatile security definer set search_path = ''
as $$
declare v_email text := lower(btrim(coalesce(p_email, ''))); v_goc boolean;
begin
  if not public.fn_doi_quan_tri() then
    raise exception 'Chỉ quản trị viên đầu tiên thêm, gỡ được quản trị viên' using errcode = '42501';
  end if;
  select a.la_goc into v_goc from public.admins a where lower(a.email) = v_email;
  if not found then
    raise exception 'Email này không có trong danh sách' using errcode = 'P0001';
  end if;
  if v_goc then
    raise exception 'Không gỡ được quản trị viên đầu tiên' using errcode = 'P0001';
  end if;
  delete from public.admins where lower(email) = v_email;
end $$;
revoke execute on function public.fn_quan_tri_go(text) from public, anon;
grant execute on function public.fn_quan_tri_go(text) to authenticated;
