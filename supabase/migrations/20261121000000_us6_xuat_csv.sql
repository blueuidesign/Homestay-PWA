-- US6 · Xuất file CSV (YC1.6). Lệnh xuất fn_xuat_csv và lệnh đếm fn_dem_xuat_csv. Chỉ thêm, không sửa migration cũ.
-- Câu tự chốt (QD25, chờ Tùng duyệt lại): YC1-H2 đặt phòng thuộc khoảng theo ngày nhận; YC1-H3 không gồm đặt phòng đã hủy;
-- YC1-H4 "Tất cả" gồm căn đã xóa; YC1-H5 sale không xuất được, kể cả căn tự nhập (PQ20.SALE); YC1-H9 giữ cột Khách, SĐT,
-- chỉ điền khách do chính chủ nhà nhập (QD11).

-- YC1.6 bước 3 đến 6, YC1.6-NT1, NT4, NT5, PQ1, PQ20, QT6.1, QT6.5: dòng của file, một dòng một đặt phòng còn hiệu lực.
-- p_can_ids null là "Tất cả" (mọi căn có lịch của người gọi, kể cả căn đã xóa). Tổng tiền là tiền phòng giá chủ nhà;
-- không đọc tiền thu khách hay khách do sale nhập (bất biến giá hai lớp, khách riêng).
create or replace function public.fn_xuat_csv(p_tu date, p_den date, p_can_ids uuid[] default null)
returns table (ma_can text, ngay_nhan date, ngay_tra date, so_dem integer, ten_khach text, sdt_khach text,
               ten_sale text, sale_da_xoa boolean, tong_tien bigint, da_coc bigint, con_lai bigint, ghi_chu text)
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_can uuid[];
begin
  -- PQ20.SALE: chỉ chủ nhà xuất file.
  if not exists (select 1 from public.profiles p where p.id = v_nguoi and p.vai_chon = 'chu_nha' and p.da_xoa_luc is null) then
    raise exception 'Không tìm thấy' using errcode = '42501';
  end if;
  -- Luật kiểm: đến ngày không trước từ ngày, tối đa 366 ngày.
  if p_tu is null or p_den is null or p_den < p_tu or p_den - p_tu > 365 then
    raise exception 'Chọn tối đa 1 năm' using errcode = '22023';
  end if;
  if p_can_ids is null then
    select coalesce(array_agg(c.id), '{}') into v_can from public.can c where c.nguoi_giu = v_nguoi and c.loai = 'co_lich';
  else
    v_can := array(select distinct u from unnest(p_can_ids) u);
    -- Luật kiểm: tối đa 50 căn, đều là căn có lịch của người gọi (YC1.6-NT5).
    if cardinality(p_can_ids) > 50 or cardinality(v_can) = 0 or exists (
         select 1 from unnest(v_can) u
         where not exists (select 1 from public.can c where c.id = u and c.nguoi_giu = v_nguoi and c.loai = 'co_lich')) then
      raise exception 'Không tìm thấy' using errcode = '42501';
    end if;
  end if;

  return query
  select c.ma_can, b.ngay_nhan, b.ngay_tra, (b.ngay_tra - b.ngay_nhan)::integer,
         r.ten_khach, r.sdt_khach,
         coalesce(s.ten_hien_thi, s.ten), (s.da_xoa_luc is not null),
         b.tien_phong,
         -- QT6.1: còn lại = tiền phòng − tiền cọc; đã thanh toán thì còn 0.
         case when b.trang_thai_tien in ('da_coc', 'da_thanh_toan') then coalesce(b.tien_coc, 0) else 0 end,
         case when b.trang_thai_tien = 'da_thanh_toan' then 0
              when b.trang_thai_tien = 'da_coc' then greatest(b.tien_phong - coalesce(b.tien_coc, 0), 0)
              else b.tien_phong end,
         b.ghi_chu
  from public.booking b
  join public.can c on c.id = b.can_id
  left join public.booking_rieng r on r.booking_id = b.id and r.nguoi_id = v_nguoi
  left join public.profiles s on s.id = b.sale_id
  where b.can_id = any (v_can)
    and b.trang_thai = 'hieu_luc'
    and b.ngay_nhan between p_tu and p_den
  order by b.ngay_nhan, c.ma_can, b.tao_luc;
end $$;

-- YC1.6 bước 5, YC1 "Dữ liệu": lệnh đếm dùng đúng bộ lọc của lệnh xuất, nên số dòng luôn khớp.
create or replace function public.fn_dem_xuat_csv(p_tu date, p_den date, p_can_ids uuid[] default null) returns integer
language sql stable security definer set search_path = ''
as $$ select count(*)::integer from public.fn_xuat_csv(p_tu, p_den, p_can_ids) $$;

revoke execute on function public.fn_xuat_csv(date, date, uuid[]) from public, anon, authenticated;
revoke execute on function public.fn_dem_xuat_csv(date, date, uuid[]) from public, anon, authenticated;
grant execute on function public.fn_xuat_csv(date, date, uuid[]) to authenticated;
grant execute on function public.fn_dem_xuat_csv(date, date, uuid[]) to authenticated;
