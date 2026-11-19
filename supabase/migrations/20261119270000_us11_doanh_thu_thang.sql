-- US11 · Doanh thu tháng (YC2.3). Lệnh đọc doanh thu tháng của chủ nhà fn_doanh_thu_thang. Chỉ thêm, không sửa migration cũ.

-- YC2.3 bước 11, 12, 13, YC2.3-NT1, YC2 Dữ liệu, QT2.1, QT2.2, QD10, QD12, PQ16.CHU, PQ16.SALE, PQ16.LINK, KT-DB.3.11.
-- Một dòng: tổng tiền từng đêm (booking_dem) thuộc tháng của p_thang, số đêm có khách (mỗi đêm của mỗi căn tính một, DLM.5),
-- tổng tiền tháng trước. Chỉ căn có lịch người gọi giữ, kể cả đã ẩn; bỏ booking đã hủy. Không có giá bán, tiền chênh.
create or replace function public.fn_doanh_thu_thang(p_thang date)
returns table (doanh_thu bigint, so_dem int, doanh_thu_thang_truoc bigint)
language sql stable security definer set search_path = ''
as $$
  with m as (
    select date_trunc('month', p_thang)::date as dau,
           (date_trunc('month', p_thang) - interval '1 month')::date as truoc,
           (date_trunc('month', p_thang) + interval '1 month')::date as sau
  ),
  d as (
    select bd.dem, bd.tien
    from public.booking_dem bd
    join public.booking b on b.id = bd.booking_id
    join public.can c on c.id = b.can_id
    cross join m
    where c.nguoi_giu = public.can_dang_nhap() and c.loai = 'co_lich' and b.trang_thai <> 'da_huy'
      and bd.dem >= m.truoc and bd.dem < m.sau
  )
  select coalesce(sum(d.tien) filter (where d.dem >= m.dau), 0)::bigint,
         (count(d.dem) filter (where d.dem >= m.dau))::int,
         coalesce(sum(d.tien) filter (where d.dem < m.dau), 0)::bigint
  from m left join d on true
  group by m.dau
$$;

revoke execute on function public.fn_doanh_thu_thang(date) from public, anon, authenticated;
grant execute on function public.fn_doanh_thu_thang(date) to authenticated;
