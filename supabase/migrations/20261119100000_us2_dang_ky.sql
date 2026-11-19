-- US2 · Đăng ký và đăng nhập bằng mã email (YC1.2, QD22). Tạo hồ sơ khi có người dùng mới, lệnh đăng ký
-- ghi tên và số của chính người gọi. Kiểm email đã có tài khoản (A2-01, A11-01) dùng Supabase Auth
-- (signInWithOtp không tạo người dùng), không thêm hàm cho anon: KT-DB.3.1 chỉ cho anon gọi fn_xem_link_moi.

-- YC1.2, pwa.md P2: chuẩn hóa số điện thoại (bỏ khoảng trắng, chấm, gạch); sai luật thì null.
create or replace function public.chuan_hoa_so(p_so text) returns text
language sql immutable security definer set search_path = ''
as $$
  select case when x ~ '^\+?[0-9]{9,15}$' then x end
  from (select regexp_replace(coalesce(p_so, ''), '[[:space:].-]', '', 'g') as x) s
$$;

-- YC1-H13, YC1.2-NT10: một số chỉ thuộc một tài khoản chưa xóa. Số đã chuẩn hóa trước khi ghi (fn_dang_ky).
create unique index profiles_so_khong_trung on public.profiles (so_dien_thoai)
  where da_xoa_luc is null and so_dien_thoai is not null;

-- YC1 Dữ liệu: mỗi người đăng nhập có một hồ sơ, tạo ở lần đầu (rỗng, chưa tên, chưa số).
-- Chạy lúc commit, để lệnh ghi hồ sơ trong cùng giao dịch (dữ liệu mẫu, test) đi trước và không bị đè.
create or replace function public.tg_tao_ho_so() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return null;
end $$;

create constraint trigger auth_users_tao_ho_so
  after insert on auth.users
  deferrable initially deferred
  for each row execute function public.tg_tao_ho_so();

-- YC1.2, QD22, PQ1, PQ2, QT6.5, PQ23.LINK: lệnh đăng ký. Chỉ ghi hồ sơ của người gọi; hồ sơ đã có số thì từ chối.
-- Người đã xóa tài khoản nhập lại số thì bỏ dấu đã xóa, kết nối cũ dùng lại.
create or replace function public.fn_dang_ky(p_ten text, p_so text) returns void
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_ten text := btrim(coalesce(p_ten, ''));
  v_so text := public.chuan_hoa_so(p_so);
  v_cu public.profiles%rowtype;
begin
  if v_ten = '' or char_length(v_ten) > 100 then
    raise exception 'Nhập họ và tên để sale và chủ nhà biết bạn là ai.' using errcode = '22023';
  end if;
  if v_so is null then
    raise exception 'Số điện thoại cần từ 9 đến 15 chữ số.' using errcode = '22023';
  end if;

  insert into public.profiles (id) values (v_nguoi) on conflict (id) do nothing;
  select * into v_cu from public.profiles where id = v_nguoi for update;
  if v_cu.so_dien_thoai is not null then
    raise exception 'Tài khoản đã có số điện thoại. Sửa số ở mục Cá nhân.' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.profiles p
             where p.so_dien_thoai = v_so and p.da_xoa_luc is null and p.id <> v_nguoi) then
    raise exception 'Số này đã có tài khoản. Đăng nhập bằng email của tài khoản đó.' using errcode = '23505';
  end if;

  begin
    update public.profiles
    set ten = v_ten,
        ten_hien_thi = coalesce(ten_hien_thi, v_ten),
        so_dien_thoai = v_so,
        dong_y_dieu_khoan_luc = coalesce(dong_y_dieu_khoan_luc, now()),
        da_xoa_luc = null,
        sua_luc = now()
    where id = v_nguoi;
  exception when unique_violation then
    -- Hai người ghi cùng số cùng lúc: mục unique chặn người sau.
    raise exception 'Số này đã có tài khoản. Đăng nhập bằng email của tài khoản đó.' using errcode = '23505';
  end;
end $$;

revoke execute on function public.chuan_hoa_so(text), public.tg_tao_ho_so(),
  public.fn_dang_ky(text, text) from public, anon, authenticated;
grant execute on function public.fn_dang_ky(text, text) to authenticated;
