-- US25 · Những đêm tính giá cuối tuần (YC4.6). Lệnh đổi đêm cuối tuần của chính người gọi.
-- Chỉ thêm, không sửa migration cũ. Cột profiles.dem_cuoi_tuan và lịch giá fn_lich_gia_thang đã có (EN2, US21).

-- YC4.6 bước 4, YC4.6-NT2, YC4.6-NT4, YC4 "Quy tắc của nhóm" (Luôn có giá cuối tuần), YC4 "Dữ liệu", QT5.5, PQ6.CHU.
-- Quy ước số: 1 = T2 ... 6 = T7, 7 = CN. Chỉ ghi hồ sơ của người gọi (không nhận người khác); bỏ trùng, sắp xếp.
-- Cập nhật lúc lịch đổi của mọi căn của người gọi (độ tươi, YC7). Không đụng booking đã có (QT4.1, YC4 "Đặt phòng giữ giá riêng").
create or replace function public.fn_dat_dem_cuoi_tuan(p_dem smallint[])
returns void
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_moi smallint[];
begin
  if p_dem is null or cardinality(p_dem) = 0 then
    raise exception 'Chọn ít nhất một đêm cuối tuần' using errcode = 'P0001';
  end if;
  if exists (select 1 from unnest(p_dem) d where d is null or d not between 1 and 7) then
    raise exception 'Đêm cuối tuần không hợp lệ' using errcode = 'P0001';
  end if;
  select array_agg(d order by d) into v_moi from (select distinct unnest(p_dem) as d) x;

  update public.profiles set dem_cuoi_tuan = v_moi, sua_luc = now() where id = v_nguoi;
  if not found then
    raise exception 'Không tìm thấy hồ sơ' using errcode = 'P0001';
  end if;

  update public.can set lich_doi_luc = now() where nguoi_giu = v_nguoi;
end $$;

revoke execute on function public.fn_dat_dem_cuoi_tuan(smallint[]) from public, anon, authenticated;
grant execute on function public.fn_dat_dem_cuoi_tuan(smallint[]) to authenticated;
