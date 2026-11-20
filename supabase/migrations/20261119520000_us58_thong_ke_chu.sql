-- US58 · Thống kê của chủ nhà (YC11.1). Lệnh đọc số liệu tháng của chủ nhà fn_thong_ke_chu. Chỉ thêm, không sửa migration cũ.

-- YC11.1 bước 1 đến 9, YC11 "Quy tắc của nhóm", YC11 "Dữ liệu", QT2.1, QT2.2, QT4.2, QT6.1, QD10, QD12, YC11-H7, YC11-H9,
-- PQ7.CHU, PQ9.CHU, PQ11.CHU, PQ15.CHU, PQ16, KT-DB.3.11.
-- Chỉ căn có lịch người gọi giữ, kể cả đã ẩn; cộng từ booking_dem lúc đọc, bỏ đặt phòng đã hủy. Không đọc booking_rieng
-- (giá bán, khách của sale), không trả tiền cọc. Chưa thu: đặt phòng có ngày nhận trong tháng.
create or replace function public.fn_thong_ke_chu(p_thang date, p_so_thang int default 6)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_dau date;
  v_sau date;
  v_hom_nay date := public.local_today();
  v_kq jsonb;
begin
  if p_thang is null or p_so_thang is null or p_so_thang < 1 or p_so_thang > 12 then
    raise exception 'Tháng không hợp lệ' using errcode = '22023';
  end if;
  v_dau := date_trunc('month', p_thang)::date;
  v_sau := (v_dau + interval '1 month')::date;

  with
  can_chu as (
    select c.id, c.ma_can, (c.an_luc is not null) as da_an,
           (c.tao_luc at time zone 'Asia/Ho_Chi_Minh')::date as tao_ngay,
           (c.an_luc at time zone 'Asia/Ho_Chi_Minh')::date as an_ngay
    from public.can c
    where c.nguoi_giu = v_nguoi and c.loai = 'co_lich'
  ),
  -- QT2.1, QT2.2, QD10, QD12: mỗi đêm chưa hủy của căn người gọi, trong cửa sổ p_so_thang tháng.
  dem as (
    select bd.dem, bd.tien, b.can_id, b.sale_id
    from public.booking_dem bd
    join public.booking b on b.id = bd.booking_id
    join can_chu c on c.id = b.can_id
    where b.trang_thai <> 'da_huy'
      and bd.dem >= (v_dau - make_interval(months => p_so_thang - 1))::date and bd.dem < v_sau
  ),
  dem_thang as (select * from dem where dem >= v_dau),
  -- YC11-H7: đêm của tháng mà căn đã có (từ ngày tạo) và chưa ẩn (tới trước ngày ẩn), giờ Việt Nam.
  theo_can as (
    select c.id, c.ma_can, c.da_an,
           greatest(0, least(v_sau, coalesce(c.an_ngay, v_sau)) - greatest(v_dau, c.tao_ngay)) as dem_co,
           coalesce((select sum(d.tien) from dem_thang d where d.can_id = c.id), 0)::bigint as doanh_thu,
           (select count(*) from dem_thang d where d.can_id = c.id)::int as so_dem
    from can_chu c
  ),
  can_hien as (
    select * from theo_can where dem_co > 0 or so_dem > 0
  ),
  -- YC11 "Khách lẻ", YC5.4: đặt phòng không có sale đứng tên vào dòng khách lẻ.
  nguoi_ban as (
    select d.sale_id, sum(d.tien)::bigint as doanh_thu,
           case when d.sale_id is not null then (select coalesce(p.ten_hien_thi, p.ten) from public.profiles p
                                                 where p.id = d.sale_id) end as ten
    from dem_thang d
    group by d.sale_id
  ),
  cac_thang as (
    select g::date as thang,
           coalesce((select sum(d.tien) from dem d
                     where d.dem >= g::date and d.dem < (g + interval '1 month')::date), 0)::bigint as doanh_thu
    from generate_series((v_dau - make_interval(months => p_so_thang - 1))::date, v_dau, interval '1 month') g
  ),
  -- YC11 "Chưa thu tiền", QT6.1, YC11-H9: chưa cọc thì cả tiền phòng; đã cọc thì tiền phòng trừ tiền cọc khi còn dư.
  chua_thu as (
    select b.id as booking_id, b.can_id, c.ma_can, b.sale_id, b.ngay_nhan, b.ngay_tra, b.trang_thai_tien,
           case when b.trang_thai_tien = 'chua_coc' then b.tien_phong else b.tien_phong - b.tien_coc end as so_tien,
           (b.ngay_nhan - v_hom_nay) as con_ngay,
           case when b.sale_id is not null then (select coalesce(p.ten_hien_thi, p.ten) from public.profiles p
                                                 where p.id = b.sale_id) end as ten
    from public.booking b
    join can_chu c on c.id = b.can_id
    where b.trang_thai <> 'da_huy' and b.ngay_nhan >= v_dau and b.ngay_nhan < v_sau
      and (b.trang_thai_tien = 'chua_coc'
           or (b.trang_thai_tien = 'da_coc' and b.tien_coc is not null and b.tien_coc < b.tien_phong))
  )
  select jsonb_build_object(
    'thang', v_dau,
    'hom_nay', v_hom_nay,
    'doanh_thu', coalesce((select sum(tien) from dem_thang), 0)::bigint,
    'doanh_thu_thang_truoc', coalesce((select sum(d.tien) from dem d
                                        where d.dem >= (v_dau - interval '1 month')::date and d.dem < v_dau), 0)::bigint,
    'so_dem', (select count(*) from dem_thang)::int,
    'mau_so', coalesce((select sum(dem_co) from theo_can), 0)::int,
    'cong_suat', coalesce((select round((select count(*) from dem_thang) * 100.0 / nullif(sum(dem_co), 0), 1)
                           from theo_can), 0.0),
    'can', coalesce((select jsonb_agg(jsonb_build_object('can_id', id, 'ma_can', ma_can, 'doanh_thu', doanh_thu,
                                                         'so_dem', so_dem, 'da_an', da_an) order by ma_can, id)
                     from can_hien), '[]'::jsonb),
    'cac_thang', (select jsonb_agg(jsonb_build_object('thang', thang, 'doanh_thu', doanh_thu) order by thang)
                  from cac_thang),
    'nguoi_ban', coalesce((select jsonb_agg(jsonb_build_object('sale_id', sale_id, 'ten', ten,
                                                               'khach_le', sale_id is null, 'doanh_thu', doanh_thu)
                                            order by doanh_thu desc, (sale_id is null), ten, sale_id)
                           from nguoi_ban), '[]'::jsonb),
    'chua_thu', coalesce((select jsonb_agg(jsonb_build_object('booking_id', booking_id, 'can_id', can_id, 'ma_can', ma_can,
                                                              'sale_id', sale_id, 'ten', ten, 'khach_le', sale_id is null,
                                                              'ngay_nhan', ngay_nhan, 'ngay_tra', ngay_tra,
                                                              'trang_thai_tien', trang_thai_tien, 'so_tien', so_tien,
                                                              'con_ngay', con_ngay)
                                           order by ngay_nhan, ma_can, booking_id)
                          from chua_thu), '[]'::jsonb),
    'tong_chua_thu', coalesce((select sum(so_tien) from chua_thu), 0)::bigint
  ) into v_kq;
  return v_kq;
end $$;

revoke execute on function public.fn_thong_ke_chu(date, int) from public, anon, authenticated;
grant execute on function public.fn_thong_ke_chu(date, int) to authenticated;
