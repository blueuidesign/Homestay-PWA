-- US1 · Màn đầu và chọn vai (YC1.1). Lệnh chọn vai ghi vai và lúc đồng ý điều khoản của chính người gọi.

-- YC1.1 bước 5, YC1.1-NT5, YC1.1-NT7, PQ1, QD5, YC1 Quy tắc "Chưa đăng ký xong thì chưa vào app", QT6.5.
create or replace function public.fn_chon_vai(p_vai text) returns void
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_ho_so public.profiles%rowtype;
begin
  if p_vai is null or p_vai not in ('chu_nha', 'sale') then
    raise exception 'Vai không hợp lệ' using errcode = '22023';
  end if;

  select * into v_ho_so from public.profiles where id = v_nguoi for update;
  if not found or v_ho_so.ten is null or v_ho_so.so_dien_thoai is null then
    raise exception 'Nhập tên và số điện thoại trước khi chọn vai.' using errcode = 'P0001';
  end if;

  update public.profiles
  set vai_chon = p_vai,
      dong_y_dieu_khoan_luc = coalesce(dong_y_dieu_khoan_luc, now()),
      sua_luc = now()
  where id = v_nguoi;
end $$;

revoke execute on function public.fn_chon_vai(text) from public, anon, authenticated;
grant execute on function public.fn_chon_vai(text) to authenticated;
