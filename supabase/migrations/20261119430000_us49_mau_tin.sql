-- US49 · Mẫu tin gửi khách (YC8.2, P11). Lệnh đọc fn_mau_tin, lệnh lưu fn_dat_mau_tin. Chỉ thêm, không sửa migration cũ.
-- Lệnh soạn tin fn_soan_tin_gui_khach (US48) đã đọc cai_dat_rieng.mau_tin của người gọi, nên S5 theo mẫu đã lưu.
-- Kiểm mẫu ở lệnh lưu, không thêm ràng buộc ở bảng (dòng cũ có thể đã ghi mẫu khác trước US49).

-- YC8 "Mẫu tin gửi khách": mẫu mặc định (giống chữ trong fn_soan_tin_gui_khach). Hàm nội bộ.
create or replace function public.mau_tin_mac_dinh() returns text
language sql immutable set search_path = ''
as $$
  select 'Em gửi anh chị [Số căn] căn còn trống [Ngày] ([Số đêm]):' || chr(10) || '[Danh sách căn]' || chr(10)
         || 'Anh chị ưng căn nào báo em giữ phòng nhé.'
$$;

-- YC8.2 bước 1, YC8.2-NT4, PQ11.SALE, KT-DB.3.6: mẫu tin của chính người gọi; chưa có thì mẫu mặc định. Chỉ sale.
create or replace function public.fn_mau_tin() returns text
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_la_sale();
begin
  return coalesce((select nullif(btrim(cd.mau_tin), '') from public.cai_dat_rieng cd where cd.nguoi_id = v_nguoi),
                  public.mau_tin_mac_dinh());
end $$;

-- YC8.2 bước 5, YC8.2-NT3, NT4, NT5, YC8-H9, PQ11.SALE, PQ11.CHU, KT-DB.3.6: ghi mẫu tin vào dòng cai_dat_rieng của chính
-- người gọi (giữ các cột khác). Chỉ sale. Từ chối mẫu rỗng, thiếu [Danh sách căn], quá 2.000 ký tự; mẫu cũ giữ nguyên.
create or replace function public.fn_dat_mau_tin(p_mau text) returns void
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_la_sale();
begin
  if p_mau is null or btrim(p_mau) = '' or strpos(p_mau, '[Danh sách căn]') = 0 then
    raise exception 'Mẫu cần có [Danh sách căn]' using errcode = '22023';
  end if;
  if char_length(p_mau) > 2000 then
    raise exception 'Mẫu tin tối đa 2.000 ký tự' using errcode = '22023';
  end if;
  insert into public.cai_dat_rieng (nguoi_id, mau_tin, sua_luc)
  values (v_nguoi, p_mau, now())
  on conflict (nguoi_id) do update set mau_tin = excluded.mau_tin, sua_luc = excluded.sua_luc;
end $$;

revoke execute on function public.mau_tin_mac_dinh() from public, anon, authenticated;
revoke execute on function public.fn_mau_tin(), public.fn_dat_mau_tin(text) from public, anon, authenticated;
grant execute on function public.fn_mau_tin(), public.fn_dat_mau_tin(text) to authenticated;
