-- EN7 · Theo dõi lỗi (YC15.3, YC15 "Báo lỗi", QD29 Claude tự quyết). Bảng loi_app, lệnh ghi fn_ghi_loi, việc hằng ngày
-- fn_bao_loi_hang_ngay ghi thông báo trong app cho quản trị viên. Chỉ thêm, không sửa migration cũ.

create table public.loi_app (
  id bigint generated always as identity primary key,
  tao_luc timestamptz not null default now(),
  nguoi_id uuid references public.profiles(id),
  phien_ban text,
  duong_dan text,
  thong_diep text not null,
  ngan_xep text,
  trinh_duyet text
);
create index loi_app_tao_luc on public.loi_app (tao_luc);
create index loi_app_nguoi on public.loi_app (nguoi_id, tao_luc);
-- RLS bật, không policy: app không đọc được (chỉ quản trị đọc bằng SQL Editor).
alter table public.loi_app enable row level security;
revoke all on table public.loi_app from anon, authenticated;

-- YC15 "Báo lỗi", YC15.3-NT1: bỏ số điện thoại (chuỗi 9 chữ số trở lên, kể cả có dấu cách, chấm, gạch), email.
create or replace function public.lam_sach_loi(p text, p_toi_da integer) returns text
language sql immutable set search_path = ''
as $$
  select left(regexp_replace(regexp_replace(coalesce(p, ''),
           '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+', '[email]', 'g'),
           '\+?\d(?:[ .\-]?\d){8,}', '[số]', 'g'), p_toi_da)
$$;
revoke execute on function public.lam_sach_loi(text, integer) from public, anon, authenticated;

-- YC15.3-NT1, KT-DB.3.1: người đã đăng nhập ghi một lỗi của app. Không nhận tên hay dữ liệu form; làm sạch lần nữa ở đây
-- dù app đã làm. Mỗi người tối đa 30 bản ghi một giờ, quá thì bỏ qua không báo lỗi. Bản ghi cũ hơn 30 ngày bị xóa.
create or replace function public.fn_ghi_loi(p_thong_diep text, p_ngan_xep text, p_duong_dan text, p_phien_ban text, p_trinh_duyet text)
returns void
language plpgsql volatile security definer set search_path = ''
as $$
declare v_nguoi uuid := public.can_dang_nhap();
begin
  if (select count(*) from public.loi_app l where l.nguoi_id = v_nguoi and l.tao_luc > now() - interval '1 hour') >= 30 then
    return;
  end if;
  insert into public.loi_app (nguoi_id, phien_ban, duong_dan, thong_diep, ngan_xep, trinh_duyet)
  values (v_nguoi, left(p_phien_ban, 40), public.lam_sach_loi(split_part(coalesce(p_duong_dan, ''), '?', 1), 200),
          coalesce(nullif(public.lam_sach_loi(p_thong_diep, 500), ''), '(không có thông điệp)'),
          nullif(public.lam_sach_loi(p_ngan_xep, 4000), ''), left(p_trinh_duyet, 300));
  delete from public.loi_app where tao_luc < now() - interval '30 days';
end $$;
revoke execute on function public.fn_ghi_loi(text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.fn_ghi_loi(text, text, text, text, text) to authenticated;

-- YC15.3-NT1: mỗi ngày 08:00 giờ Việt Nam, có lỗi trong 24 giờ qua thì mỗi quản trị viên có một thông báo
-- "loi_app_hang_ngay" (số lỗi, số người gặp, thông điệp hay gặp nhất). Trả số thông báo đã ghi.
create or replace function public.fn_bao_loi_hang_ngay() returns integer
language plpgsql volatile security definer set search_path = ''
as $$
declare v_so integer; v_nguoi integer; v_hay text; v_ghi integer;
begin
  select count(*), count(distinct nguoi_id) into v_so, v_nguoi from public.loi_app where tao_luc > now() - interval '24 hours';
  if v_so = 0 then return 0; end if;
  select thong_diep into v_hay from public.loi_app where tao_luc > now() - interval '24 hours'
  group by thong_diep order by count(*) desc limit 1;
  insert into public.thong_bao (nguoi_nhan, loai, noi_dung)
  select a.nguoi_id, 'loi_app_hang_ngay', jsonb_build_object('so_loi', v_so, 'so_nguoi', v_nguoi, 'hay_gap', left(v_hay, 120))
  from public.admins a join public.profiles p on p.id = a.nguoi_id
  where a.nguoi_id is not null;
  get diagnostics v_ghi = row_count;
  return v_ghi;
end $$;
revoke execute on function public.fn_bao_loi_hang_ngay() from public, anon, authenticated;

do $$ begin
  if exists (select 1 from pg_namespace where nspname = 'cron') then
    perform cron.schedule('en7-bao-loi-hang-ngay', '0 1 * * *', 'select public.fn_bao_loi_hang_ngay()');
  end if;
end $$;
