-- =====================================================================================
-- 20261118000000_nen_tang.sql · Nền tảng: hồ sơ người dùng, quản trị viên, nhật ký, hàm dùng chung
-- Vì sao: QD-001 (bộ khởi tạo), QD-005 (vai theo quan hệ người với căn, không theo tổ chức)
-- Thay đổi: profiles, cai_dat_rieng, admins, bootstrap_admins, audit_log; local_today, is_admin, handle_new_user,
--           fn_cap_nhat_ho_so, fn_luu_cai_dat, fn_xoa_tai_khoan
-- Tương thích ngược: migration đầu tiên
-- Kiểm thử: tests/db/t_01_phan_quyen.sql
-- =====================================================================================
-- Khác bộ khởi tạo của Kho BaBa: Home247 không có "tổ chức → đơn vị → nhân viên".
-- Một người là CHỦ của căn mình giữ, và là SALE của căn người khác chia sẻ cho mình (QD-005, QD-007).
-- Vì vậy không có bảng vai. Quyền tính từ bảng can (người giữ) và ket_noi (ai chia sẻ cho ai), ở migration sau.

create extension if not exists pgcrypto with schema extensions;
create extension if not exists btree_gist with schema extensions;   -- cho ràng buộc chặn trùng booking (uuid =, daterange &&)

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  ten text check (char_length(ten) <= 100),              -- tên hiển thị: tên người đã kết nối thấy (mục "Hồ sơ (Thông tin cá nhân)" (US21))
  ho_ten text check (char_length(ho_ten) <= 100),        -- họ và tên, chỉ mình và quản trị dùng
  anh_dai_dien text,                                     -- đường dẫn ảnh trong Storage, trống thì hiện chữ cái đầu
  sdt text check (sdt ~ '^\+?[0-9]{9,15}$'),             -- số điện thoại; người đã kết nối thấy số của nhau (QD-007)
  vai_chon text check (vai_chon in ('chu_nha', 'sale')), -- vai chọn lúc đầu, chỉ để chọn màn mở đầu. Quyền KHÔNG dựa vào cột này
  dem_cuoi_tuan smallint[] not null default '{5,6}',     -- thứ của các ĐÊM tính giá cuối tuần, theo extract(dow): 5 = đêm T6, 6 = đêm T7 (mục "Ngày tính giá cuối tuần" (US4), DLM.3)
  gio_nhan time not null default '14:00',                -- giờ nhận phòng mặc định của mọi căn mình giữ (mục "Giờ nhận, trả phòng mặc định" (US21))
  gio_tra time not null default '12:00',
  dong_y_dieu_khoan_luc timestamptz,                     -- lúc bấm "Bắt đầu ngay" ở A1 (mục "Đăng nhập" (US1))
  da_xoa_luc timestamptz,                                -- đã xóa tài khoản: giữ tên, xóa số, ngừng chia sẻ (QD-013)
  created_at timestamptz not null default now(),
  check (dem_cuoi_tuan <@ '{0,1,2,3,4,5,6}'::smallint[])
);

-- Cài đặt riêng của từng người. Tách khỏi profiles vì người đã kết nối đọc được profiles của nhau,
-- còn mức cộng và mẫu tin của sale thì chủ nhà không bao giờ được thấy (PQ11).
create table public.cai_dat_rieng (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  muc_cong_mac_dinh integer not null default 0 check (muc_cong_mac_dinh >= 0),   -- tiền sale cộng mỗi đêm (mục "Mức cộng giá mặc định" (US13))
  lam_tron_50k boolean not null default false,                                    -- làm tròn giá bán lên bội số 50.000đ
  mau_tin text check (char_length(mau_tin) <= 2000),                              -- mẫu tin gửi khách (mục "Mẫu tin gửi khách" (US14)); trống là mẫu mặc định
  thong_bao_tat text[] not null default '{}',                                     -- các loại thông báo đã tắt (mục "Cài đặt thông báo" (US21))
  mo_app_luc timestamptz                                                          -- mốc lần mở app trước, cho popup thông báo mới (mục "Popup thông báo mới" (US30))
);

-- Quản trị viên Home247: xem được mọi dữ liệu (QD-007). Chỉ thêm bằng SQL hoặc bootstrap_admins.
create table public.admins (
  user_id uuid primary key references public.profiles(id),
  la_goc boolean not null default false,   -- quản trị viên đầu tiên: chỉ người này thêm, gỡ người đồng quản trị; không bị gỡ (mục "Thêm người đồng quản trị" (US34))
  created_at timestamptz not null default now()
);

-- Email được tự gán quản trị khi đăng nhập lần đầu. Không ai đọc được qua API. Không ghi email thật vào repo.
create table public.bootstrap_admins (email text primary key, la_goc boolean not null default false);

-- Nhật ký ai sửa gì. Booking sửa được qua hàm (QD-002), nên mọi lần sửa booking ghi một dòng ở đây.
create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid,
  table_name text not null,
  row_id uuid,
  action text not null,
  old_row jsonb,
  new_row jsonb,
  at timestamptz not null default now()
);
create index audit_log_row_idx on public.audit_log (table_name, row_id);

-- ---------- Hàm dùng chung ----------

create or replace function public.local_today() returns date
language sql stable set search_path = public as $$ select (now() at time zone 'Asia/Ho_Chi_Minh')::date $$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where user_id = (select auth.uid()))
$$;

create or replace function public.can_dang_nhap() returns uuid
language plpgsql stable set search_path = public as $$
declare v uuid := (select auth.uid());
begin
  if v is null then raise exception 'Bạn cần đăng nhập' using errcode = '42501'; end if;
  return v;
end $$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id) values (new.id) on conflict (id) do nothing;
  if new.email is not null and exists (select 1 from bootstrap_admins where lower(email) = lower(new.email)) then
    insert into admins (user_id, la_goc)
    select new.id, b.la_goc from bootstrap_admins b where lower(b.email) = lower(new.email) on conflict do nothing;
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Hồ sơ: chỉ người đó sửa. Đặt lại số sau khi đã xóa tài khoản thì dùng lại như trước (QD-013).
-- Các ô nhận: ten, ho_ten, sdt, vai_chon, dem_cuoi_tuan, gio_nhan, gio_tra, anh_dai_dien, dong_y_dieu_khoan (true).
create or replace function public.fn_cap_nhat_ho_so(p jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap(); v_sdt text := nullif(regexp_replace(coalesce(p->>'sdt', ''), '[\s.-]', '', 'g'), '');
begin
  if v_sdt is not null and v_sdt !~ '^\+?[0-9]{9,15}$' then
    raise exception 'Số điện thoại không đúng' using errcode = 'P0001';
  end if;
  if char_length(coalesce(p->>'ten', '')) > 100 or char_length(coalesce(p->>'ho_ten', '')) > 100 then
    raise exception 'Tên dài quá 100 ký tự' using errcode = 'P0001';
  end if;
  update profiles set
    ten = coalesce(nullif(btrim(p->>'ten'), ''), ten),
    ho_ten = coalesce(nullif(btrim(p->>'ho_ten'), ''), ho_ten),
    sdt = case when p ? 'sdt' then v_sdt else sdt end,
    vai_chon = coalesce(p->>'vai_chon', vai_chon),
    gio_nhan = coalesce((p->>'gio_nhan')::time, gio_nhan),
    gio_tra = coalesce((p->>'gio_tra')::time, gio_tra),
    anh_dai_dien = case when p ? 'anh_dai_dien' then nullif(p->>'anh_dai_dien', '') else anh_dai_dien end,
    dong_y_dieu_khoan_luc = case when (p->>'dong_y_dieu_khoan')::boolean then coalesce(dong_y_dieu_khoan_luc, now()) else dong_y_dieu_khoan_luc end,
    dem_cuoi_tuan = coalesce((select array_agg(x::smallint) from jsonb_array_elements_text(p->'dem_cuoi_tuan') x), dem_cuoi_tuan),
    da_xoa_luc = case when v_sdt is not null then null else da_xoa_luc end
  where id = v_me;
end $$;

-- Cài đặt riêng: mức cộng mặc định, làm tròn, mẫu tin, loại thông báo đã tắt. Chỉ ghi ô có trong p.
create or replace function public.fn_luu_cai_dat(p jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap();
begin
  if (p->>'muc_cong_mac_dinh')::int < 0 then raise exception 'Mức cộng không được âm' using errcode = 'P0001'; end if;
  insert into cai_dat_rieng (user_id) values (v_me) on conflict do nothing;
  update cai_dat_rieng set
    muc_cong_mac_dinh = coalesce((p->>'muc_cong_mac_dinh')::int, muc_cong_mac_dinh),
    lam_tron_50k = coalesce((p->>'lam_tron_50k')::boolean, lam_tron_50k),
    mau_tin = case when p ? 'mau_tin' then nullif(p->>'mau_tin', '') else mau_tin end,
    thong_bao_tat = coalesce((select array_agg(x) from jsonb_array_elements_text(p->'thong_bao_tat') x), thong_bao_tat)
  where user_id = v_me;
end $$;

-- Xóa tài khoản (QD-013): xóa số điện thoại, giữ tên để hiện kèm "Đã xóa tài khoản",
-- giữ căn, lịch, giá, booking. Sale không còn xem lịch, không gửi được yêu cầu. Booking cũ vẫn xem được.
create or replace function public.fn_xoa_tai_khoan() returns void
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap();
begin
  update profiles set sdt = null, da_xoa_luc = now() where id = v_me;
  insert into audit_log (actor_id, table_name, row_id, action) values (v_me, 'profiles', v_me, 'xoa_tai_khoan');
end $$;

-- ---------- Phân quyền (RLS) ----------
alter table public.profiles enable row level security;
alter table public.cai_dat_rieng enable row level security;
alter table public.admins enable row level security;
alter table public.bootstrap_admins enable row level security;   -- không có policy: không ai đọc qua API
alter table public.audit_log enable row level security;

-- profiles: policy đọc cho người đã kết nối nằm ở migration căn và kết nối (cần bảng ket_noi)
create policy cai_dat_rieng_read on public.cai_dat_rieng for select to authenticated using (user_id = (select auth.uid()));
create policy admins_read on public.admins for select to authenticated using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy audit_admin on public.audit_log for select to authenticated using ((select public.is_admin()));

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.fn_cap_nhat_ho_so(jsonb), public.fn_luu_cai_dat(jsonb), public.fn_xoa_tai_khoan() from public, anon;
