-- US43 · Màn đầu tiên và lịch 7 ngày của sale (YC7.1). Lệnh lịch của sale fn_sale_lich.
-- Chỉ thêm, không sửa migration cũ. Sale không đọc bảng booking (KT-DB.3.5): ô lịch lấy từ o_lich, căn nguồn từ my_shared_can_ids.

-- QT5.3, QT5.5, PQ5: giá chủ nhà một đêm của một căn, cùng cách tính với fn_lich_gia_thang (giá dịp, rồi giá tháng theo
-- đêm cuối tuần của người giữ căn; căn tự nhập dùng giá chủ sale lưu). Null khi đêm chưa có giá. Hàm nội bộ, app không gọi.
create or replace function public.gia_chu_dem(p_can_id uuid, p_dem date) returns bigint
language sql stable security definer set search_path = ''
as $$
  select coalesce(
    (select g.gia from public.gia_dip g where g.can_id = c.id and p_dem between g.tu_ngay and g.den_ngay limit 1),
    case
      when c.loai = 'tu_nhap' then
        case when extract(isodow from p_dem)::smallint = any (coalesce(p.dem_cuoi_tuan, '{5,6}'))
             then c.gia_chu_cuoi_tuan else c.gia_chu_thuong end
      else
        (select case when extract(isodow from p_dem)::smallint = any (coalesce(p.dem_cuoi_tuan, '{5,6}'))
                     then gt.gia_cuoi_tuan else gt.gia_thuong end
         from public.gia_thang gt where gt.can_id = c.id and gt.thang = date_trunc('month', p_dem)::date)
    end)
  from public.can c
  join public.profiles p on p.id = c.nguoi_giu
  where c.id = p_can_id
$$;

-- QT5.4, GD13, GD16, PQ11.SALE: giá bán một đêm của sale cho căn được chia sẻ = giá chủ + mức cộng riêng căn (không có thì
-- mặc định của sale); bật làm tròn thì làm tròn lên 50.000đ. Null khi đêm chưa có giá. Hàm nội bộ, app không gọi.
create or replace function public.gia_ban_dem(p_sale_id uuid, p_can_id uuid, p_dem date) returns bigint
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_gia bigint := public.gia_chu_dem(p_can_id, p_dem);
  v_muc bigint;
  v_tron boolean;
begin
  if v_gia is null then
    return null;
  end if;
  select coalesce(m.muc, cd.muc_cong_mac_dinh, 0), coalesce(cd.lam_tron_50k, false)
    into v_muc, v_tron
  from (select 1) x
  left join public.muc_cong m on m.sale_id = p_sale_id and m.can_id = p_can_id
  left join public.cai_dat_rieng cd on cd.nguoi_id = p_sale_id;
  v_gia := v_gia + coalesce(v_muc, 0);
  if v_tron then
    v_gia := ((v_gia + 49999) / 50000) * 50000;
  end if;
  return v_gia;
end $$;

revoke execute on function public.gia_chu_dem(uuid, date), public.gia_ban_dem(uuid, uuid, date) from public, anon, authenticated;

-- YC7.1 bước 1 đến 4, 6, 11, YC7.1-NT2 đến NT6, YC7 "Dữ liệu", "Quy tắc của nhóm" (Ô ngày ghi giá bán, Độ tươi lịch,
-- Sắp xếp), QT2.1, QT5.4, QT6.4, PQ3.SALE, PQ4.SALE, PQ5.SALE, PQ11, PQ13, PQ14.SALE, PQ23.SALE, QD7, QD11, QD13,
-- KT-DB.3.3, KT-DB.3.5, KT-DB.3.7.
-- Mỗi căn người gọi được xem, mỗi đêm từ p_tu tới trước p_den một dòng. nhom: 'cua_toi', 'nguon', 'tu_nhap'.
-- o: 'kin' | 'trong' (căn có lịch), 'ban' | 'chua_biet' (căn tự nhập). Không trả tên người đặt, khách, tiền phòng, giá chủ.
create or replace function public.fn_sale_lich(p_tu date, p_den date)
returns table (
  can_id uuid, nhom text, ma_can text, ten_toa text, ten_chu text, so_phong_ngu smallint, loai_view text,
  lich_doi_luc timestamptz, so_ban integer, dem date, o text, gia_ban bigint
)
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_nay date := public.local_today();
begin
  if p_tu is null or p_den is null then
    raise exception 'Chưa chọn khoảng ngày' using errcode = 'P0001';
  end if;
  if p_den <= p_tu or p_den - p_tu > 31 then
    raise exception 'Khoảng ngày không hợp lệ' using errcode = 'P0001';
  end if;
  return query
  with ds as (
    select c.id, c.nguoi_giu, c.ma_can, c.so_phong_ngu, c.loai_view, c.lich_doi_luc, c.chu_can_ten, c.toa_nha_id,
           case when c.nguoi_giu = v_nguoi and c.loai = 'co_lich' then 'cua_toi'
                when c.nguoi_giu = v_nguoi then 'tu_nhap'
                else 'nguon' end as nhom
    from public.can c
    where c.an_luc is null
      and (c.nguoi_giu = v_nguoi or c.id in (select public.my_shared_can_ids()))
  )
  select ds.id, ds.nhom, ds.ma_can, tn.ten,
         case ds.nhom when 'nguon' then chu.ten_hien_thi when 'tu_nhap' then ds.chu_can_ten end,
         ds.so_phong_ngu, ds.loai_view,
         case when ds.nhom = 'nguon' then ds.lich_doi_luc end,
         (select count(*)::integer from public.booking b
          where b.can_id = ds.id and b.trang_thai <> 'da_huy'
            and (b.sale_id = v_nguoi or ds.nguoi_giu = v_nguoi)
            and b.ngay_nhan > v_nay - 90 and b.ngay_nhan <= v_nay),
         d.dem,
         public.o_lich(ds.id, d.dem),
         case ds.nhom
           when 'cua_toi' then public.gia_chu_dem(ds.id, d.dem)
           when 'nguon' then public.gia_ban_dem(v_nguoi, ds.id, d.dem)
         end
  from ds
  join public.profiles chu on chu.id = ds.nguoi_giu
  left join public.toa_nha tn on tn.id = ds.toa_nha_id
  cross join lateral (select g::date as dem from generate_series(p_tu, p_den - 1, interval '1 day') g) d
  order by case ds.nhom when 'cua_toi' then 0 when 'nguon' then 1 else 2 end, ds.ma_can, ds.id, d.dem;
end $$;

revoke execute on function public.fn_sale_lich(date, date) from public, anon, authenticated;
grant execute on function public.fn_sale_lich(date, date) to authenticated;
