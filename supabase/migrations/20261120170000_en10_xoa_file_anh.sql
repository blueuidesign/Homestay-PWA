-- EN10 · Xóa file ảnh tạm quá 24 giờ và ảnh bị bỏ khỏi căn khỏi kho anh-can (YC3 "Dữ liệu", QT5.7). Chỉ thêm, không sửa migration cũ.
-- Database không xóa thẳng storage.objects. Việc định kỳ ở server (scripts/don-anh-tam.mjs, GitHub Actions) đọc danh sách
-- bằng fn_file_cho_xoa, xóa file qua dịch vụ kho bằng khóa service_role (secret của GitHub, không bao giờ trong app), rồi gọi fn_da_xoa_file.

-- YC3 Dữ liệu: hàng đợi đường dẫn file đã mất dòng anh_can. App không đọc, không ghi.
create table public.file_cho_xoa (
  duong_dan text primary key,
  them_luc timestamptz not null default now()
);
alter table public.file_cho_xoa enable row level security;
revoke all on public.file_cho_xoa from public, anon, authenticated;

-- YC3 Dữ liệu: dòng anh_can bị xóa (ảnh tạm quá 24 giờ, ảnh bị bỏ khỏi căn) thì file vào hàng đợi.
create or replace function public.anh_can_vao_hang_xoa() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.file_cho_xoa (duong_dan) values (old.duong_dan) on conflict (duong_dan) do nothing;
  return old;
end $$;
revoke execute on function public.anh_can_vao_hang_xoa() from public, anon, authenticated;

create trigger anh_can_xoa_file after delete on public.anh_can
  for each row execute function public.anh_can_vao_hang_xoa();

-- YC3 Dữ liệu, QT5.7: file cần xóa = hàng đợi, cộng file trong kho anh-can quá 24 giờ không có dòng anh_can nào
-- (tải lên rồi không ghi ảnh tạm). Không trả file còn dòng anh_can. Chỉ service_role.
create or replace function public.fn_file_cho_xoa(p_so integer) returns setof text
language sql stable security definer set search_path = ''
as $$
  select x.duong_dan from (
    select q.duong_dan, q.them_luc as luc from public.file_cho_xoa q
    union
    select o.name, o.created_at from storage.objects o
    where o.bucket_id = 'anh-can' and o.created_at < now() - interval '24 hours'
  ) x
  where exists (select 1 from storage.objects o where o.bucket_id = 'anh-can' and o.name = x.duong_dan)
    and not exists (select 1 from public.anh_can a where a.duong_dan = x.duong_dan)
  group by x.duong_dan
  order by min(x.luc), x.duong_dan
  limit greatest(coalesce(p_so, 0), 0)
$$;

-- EN10: sau khi dịch vụ kho xóa file thì bỏ khỏi hàng đợi. Chỉ service_role.
create or replace function public.fn_da_xoa_file(p_duong_dan text[]) returns void
language sql volatile security definer set search_path = ''
as $$
  delete from public.file_cho_xoa where duong_dan = any (coalesce(p_duong_dan, '{}'))
$$;

revoke execute on function public.fn_file_cho_xoa(integer), public.fn_da_xoa_file(text[]) from public, anon, authenticated;
grant execute on function public.fn_file_cho_xoa(integer), public.fn_da_xoa_file(text[]) to service_role;
grant execute on function public.fn_don_anh_tam() to service_role;
