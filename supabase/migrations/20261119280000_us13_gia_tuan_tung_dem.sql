-- US13 · Lịch tuần nhiều căn (YC2.5). Lệnh đọc giá chủ nhà từng đêm của mọi căn của người gọi trong một khoảng ngày.
-- Chỉ thêm, không sửa migration cũ. Đặt phòng của tuần vẫn đọc qua RLS booking_doc (PQ7.CHU).

-- YC2.5 bước 17, 22, YC2.5-NT2, YC2.5-NT7, YC2 "Dữ liệu", QT5.3, PQ5.CHU, PQ4.CHU.
-- Mỗi căn có lịch chưa ẩn của người gọi, mỗi đêm từ p_tu tới trước p_den một dòng; đêm chưa đặt giá thì gia null (không bao giờ 0).
-- Dùng lại cách tính giá đêm của fn_lich_gia_thang (không viết lại công thức). Sale không có căn có lịch nên không nhận dòng nào.
-- Khoảng tối đa 62 đêm để một lần gọi không đọc quá nhiều.
create or replace function public.fn_gia_tung_dem_cua_toi(p_tu date, p_den date)
returns table (can_id uuid, dem date, gia bigint)
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
begin
  if p_tu is null or p_den is null then
    raise exception 'Chưa chọn khoảng ngày' using errcode = 'P0001';
  end if;
  if p_den <= p_tu or p_den - p_tu > 62 then
    raise exception 'Khoảng ngày không hợp lệ' using errcode = 'P0001';
  end if;
  return query
  select c.id, l.dem, l.gia::bigint
  from public.can c
  cross join (select distinct date_trunc('month', d)::date as thang
              from generate_series(p_tu, p_den - 1, interval '1 day') d) m
  cross join lateral public.fn_lich_gia_thang(c.id, m.thang) l
  where c.nguoi_giu = v_nguoi and c.loai = 'co_lich' and c.an_luc is null
    and l.dem >= p_tu and l.dem < p_den
  order by c.id, l.dem;
end $$;

revoke execute on function public.fn_gia_tung_dem_cua_toi(date, date) from public, anon, authenticated;
grant execute on function public.fn_gia_tung_dem_cua_toi(date, date) to authenticated;
