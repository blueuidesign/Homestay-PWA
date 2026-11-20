-- US5 · Giờ nhận, trả phòng mặc định (YC1.5). Lệnh fn_dat_gio_nhan_tra. Chỉ thêm, không sửa migration cũ.
-- Cột profiles.gio_nhan, gio_tra đã có (EN2); S3 của sale đọc giờ của chủ nhà qua fn_chi_tiet_can_sale (US46).

-- YC1.5 bước 3, YC1.5-NT1, NT2, NT3, PQ1, PQ6, QT4.1, YC1-H11 (tự chốt): ghi giờ nhận, trả mặc định của CHÍNH người gọi.
-- Không nhận mã người. Không đụng đặt phòng đã có: giờ đã chép vào booking lúc tạo (US27).
create or replace function public.fn_dat_gio_nhan_tra(p_nhan time, p_tra time) returns void
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
begin
  if p_nhan is null or p_tra is null then
    raise exception 'Chọn giờ nhận và giờ trả phòng' using errcode = '22023';
  end if;
  update public.profiles set gio_nhan = p_nhan, gio_tra = p_tra, sua_luc = now()
  where id = v_nguoi and da_xoa_luc is null;
  if not found then
    raise exception 'Không tìm thấy hồ sơ' using errcode = '42501';
  end if;
end $$;

revoke execute on function public.fn_dat_gio_nhan_tra(time, time) from public, anon, authenticated;
grant execute on function public.fn_dat_gio_nhan_tra(time, time) to authenticated;
