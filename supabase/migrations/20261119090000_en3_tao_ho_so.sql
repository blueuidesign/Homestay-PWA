-- EN3 · Tạo hồ sơ ở lần đầu đăng nhập (YC1 mục Dữ liệu, YC1.2 bước 2).
-- App gọi hàm này ngay sau khi có phiên (đăng nhập tạm trên staging, sau này cách đăng nhập theo QD22).
-- Chưa có hồ sơ thì tạo hồ sơ trống (chưa tên, chưa số, chưa chọn vai); có rồi thì giữ nguyên.

-- YC1.2, PQ1, PQ2, PQ Luật chung 4: chỉ tạo hồ sơ của chính người gọi; số điện thoại không ghi ở đây (YC6.1).
create or replace function public.fn_tao_ho_so() returns public.profiles
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_ho_so public.profiles;
begin
  insert into public.profiles (id) values (v_nguoi) on conflict (id) do nothing;
  select * into v_ho_so from public.profiles where id = v_nguoi;
  return v_ho_so;
end $$;

revoke execute on function public.fn_tao_ho_so() from public, anon;
grant execute on function public.fn_tao_ho_so() to authenticated;
