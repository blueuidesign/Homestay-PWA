-- US47 · Mức cộng giá mặc định (YC7.5, P10). Lệnh đọc fn_muc_cong_mac_dinh, lệnh ghi fn_dat_muc_cong_mac_dinh.
-- Chỉ thêm, không sửa migration cũ. Giá bán từng đêm vẫn tính ở gia_ban_dem (US43), đã làm tròn từng đêm (GD13).

-- YC7.5-NT6, YC7-H10: mức cộng mặc định từ 0 đến 5.000.000đ, chặn cả khi ghi không qua hàm.
alter table public.cai_dat_rieng
  add constraint cai_dat_rieng_muc_cong_trong_khoang check (muc_cong_mac_dinh between 0 and 5000000);

-- YC7.5 bước 1, PQ11.SALE, KT-DB.3.6: mức cộng mặc định và cờ làm tròn của chính người gọi; chưa có dòng thì 0, không làm tròn.
create or replace function public.fn_muc_cong_mac_dinh() returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_la_sale();
  v jsonb;
begin
  select jsonb_build_object('muc_cong_mac_dinh', cd.muc_cong_mac_dinh, 'lam_tron_50k', cd.lam_tron_50k) into v
  from public.cai_dat_rieng cd where cd.nguoi_id = v_nguoi;
  return coalesce(v, jsonb_build_object('muc_cong_mac_dinh', 0, 'lam_tron_50k', false));
end $$;

-- YC7.5 bước 5, YC7.5-NT3, NT4, NT6, YC7-H10, QT5.4, PQ11.SALE, PQ11.CHU, KT-DB.3.6: ghi mức cộng mặc định và cờ làm tròn
-- vào dòng cai_dat_rieng của chính người gọi (giữ các cột khác). Chỉ sale.
create or replace function public.fn_dat_muc_cong_mac_dinh(p_muc bigint, p_lam_tron boolean) returns void
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_la_sale();
begin
  if p_muc is null or p_muc < 0 or p_muc > 5000000 then
    raise exception 'Mức cộng từ 0 đến 5.000.000đ' using errcode = '22023';
  end if;
  if p_lam_tron is null then
    raise exception 'Chưa chọn làm tròn' using errcode = '22023';
  end if;
  insert into public.cai_dat_rieng (nguoi_id, muc_cong_mac_dinh, lam_tron_50k, sua_luc)
  values (v_nguoi, p_muc, p_lam_tron, now())
  on conflict (nguoi_id) do update
    set muc_cong_mac_dinh = excluded.muc_cong_mac_dinh, lam_tron_50k = excluded.lam_tron_50k, sua_luc = excluded.sua_luc;
end $$;

revoke execute on function public.fn_muc_cong_mac_dinh(), public.fn_dat_muc_cong_mac_dinh(bigint, boolean)
  from public, anon, authenticated;
grant execute on function public.fn_muc_cong_mac_dinh(), public.fn_dat_muc_cong_mac_dinh(bigint, boolean) to authenticated;
