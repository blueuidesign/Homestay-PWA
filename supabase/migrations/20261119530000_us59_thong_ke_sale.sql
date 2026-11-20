-- US59 · Thống kê của sale (YC11.2). Lệnh đọc số liệu tháng của sale fn_thong_ke_sale. Chỉ thêm, không sửa migration cũ.

-- YC11.2 bước 1 đến 5, YC11 "Quy tắc của nhóm", YC11 "Dữ liệu", YC11-H1, YC11-H2, YC11-H6, YC11-H8, QT2.1, QT2.2, QT3.1,
-- QT3.2, QT4.2, QD10, QD12, QD13, PQ7.SALE, PQ9.SALE, PQ10.SALE, PQ11.SALE, PQ14.SALE, PQ15.SALE, PQ16.SALE, KT-DB.3.5,
-- KT-DB.3.11. Đặt phòng của người gọi: sale_id là người gọi ở căn không phải của mình, hoặc nguồn sale_tu_ghi ở căn tự nhập
-- của người gọi; kể cả chủ đã ngừng, đã xóa tài khoản, căn đã ẩn. Cộng từ booking_dem lúc đọc, bỏ đặt phòng đã hủy.
-- Không trả khách, tiền cọc, doanh thu chủ nhà, số của sale khác. Yêu cầu chờ: mọi yêu cầu chưa quá hạn (giả định GD26).
create or replace function public.fn_thong_ke_sale(p_thang date, p_so_thang int default 2)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_dau date;
  v_sau date;
  v_tu date;
  v_kq jsonb;
begin
  if p_thang is null or p_so_thang is null or p_so_thang < 1 or p_so_thang > 12 then
    raise exception 'Tháng không hợp lệ' using errcode = '22023';
  end if;
  v_dau := date_trunc('month', p_thang)::date;
  v_sau := (v_dau + interval '1 month')::date;
  -- Cửa sổ đọc: p_so_thang tháng tới tháng đang xem, và luôn có tháng trước để so sánh.
  v_tu := (v_dau - make_interval(months => greatest(p_so_thang - 1, 1)))::date;

  with
  -- YC11 "Đặt phòng của sale", YC11-H1, QD5, QD12: đặt phòng chưa hủy của người gọi, có đêm hay ngày nhận trong cửa sổ.
  bk as (
    select b.id, b.can_id, b.ngay_nhan, b.tien_phong,
           c.loai, c.nguoi_giu, c.chu_can_ten,
           coalesce(r.tien_thu_khach, b.tien_phong) as gia_ban
    from public.booking b
    join public.can c on c.id = b.can_id
    left join public.booking_rieng r on r.booking_id = b.id and r.nguoi_id = v_nguoi
    where b.trang_thai <> 'da_huy'
      and b.ngay_tra > v_tu and b.ngay_nhan < v_sau
      and ((b.sale_id = v_nguoi and c.nguoi_giu <> v_nguoi)
           or (b.nguon = 'sale_tu_ghi' and b.tao_boi = v_nguoi and c.loai = 'tu_nhap' and c.nguoi_giu = v_nguoi))
  ),
  -- YC11-H2: phần giá bán của mỗi đêm theo tỉ lệ tiền đêm trong tiền phòng, làm tròn xuống; đêm cuối nhận phần dư;
  -- tiền phòng 0 thì chia đều. QT3.2: chênh của đêm = phần giá bán trừ giá chủ đêm đó.
  dem_tho as (
    select bk.id as booking_id, bd.dem, bd.tien, bk.gia_ban,
           sum(bd.tien) over (partition by bk.id) as tong,
           count(*) over (partition by bk.id) as so,
           row_number() over (partition by bk.id order by bd.dem desc) = 1 as cuoi
    from bk
    join public.booking_dem bd on bd.booking_id = bk.id
  ),
  dem_chia as (
    select d.booking_id, d.dem, d.tien, d.cuoi, d.gia_ban,
           case when d.tong > 0 then floor(d.gia_ban::numeric * d.tien / d.tong)
                else floor(d.gia_ban::numeric / d.so) end::bigint as phan
    from dem_tho d
  ),
  dem as (
    select d.booking_id, d.dem, d.tien,
           case when d.cuoi
                then d.gia_ban - coalesce(sum(d.phan) filter (where not d.cuoi) over (partition by d.booking_id), 0)
                else d.phan end::bigint as ban
    from dem_chia d
  ),
  cac_thang as (
    select g::date as thang,
           (select count(*) from bk where bk.ngay_nhan >= g::date and bk.ngay_nhan < (g + interval '1 month')::date)::int
             as so_dat_phong,
           coalesce((select sum(d.ban) from dem d
                     where d.dem >= g::date and d.dem < (g + interval '1 month')::date), 0)::bigint as doanh_so,
           coalesce((select sum(d.ban - d.tien) from dem d
                     where d.dem >= g::date and d.dem < (g + interval '1 month')::date), 0)::bigint as tien_chenh
    from generate_series(v_tu, v_dau, interval '1 month') g
  ),
  -- YC11.2 bước 4: theo chủ nhà; căn tự nhập theo chủ căn ghi ở căn (US56), mỗi căn tự nhập một dòng.
  theo_chu as (
    select case when bk.loai = 'tu_nhap' then null else bk.nguoi_giu end as chu_id,
           (bk.loai = 'tu_nhap') as tu_nhap,
           case when bk.loai = 'tu_nhap' then bk.can_id end as can_tu_nhap,
           case when bk.loai = 'tu_nhap' then bk.chu_can_ten
                else (select coalesce(p.ten_hien_thi, p.ten) from public.profiles p where p.id = bk.nguoi_giu) end as ten,
           sum(d.ban)::bigint as doanh_so,
           sum(d.ban - d.tien)::bigint as tien_chenh
    from dem d
    join bk on bk.id = d.booking_id
    where d.dem >= v_dau and d.dem < v_sau
    group by 1, 2, 3, 4
  ),
  -- YC11.2 bước 5, QT3.1, PQ10.SALE: yêu cầu của người gọi đang chờ, chưa quá hạn; không theo tháng (giả định GD26).
  cho as (
    select y.id, y.can_id, c.ma_can, tn.ten as ten_toa, y.ngay_nhan, y.ngay_tra, y.gui_luc,
           coalesce(chu.ten_hien_thi, chu.ten) as ten_chu
    from public.yeu_cau_dat_phong y
    join public.can c on c.id = y.can_id
    join public.profiles chu on chu.id = c.nguoi_giu
    left join public.toa_nha tn on tn.id = c.toa_nha_id
    where y.sale_id = v_nguoi and y.trang_thai = 'cho' and not public.yeu_cau_qua_han(y)
  )
  select jsonb_build_object(
    'thang', v_dau,
    'so_dat_phong', (select so_dat_phong from cac_thang where thang = v_dau),
    'doanh_so', (select doanh_so from cac_thang where thang = v_dau),
    'tien_chenh', (select tien_chenh from cac_thang where thang = v_dau),
    'so_dat_phong_thang_truoc', (select so_dat_phong from cac_thang where thang = (v_dau - interval '1 month')::date),
    'doanh_so_thang_truoc', (select doanh_so from cac_thang where thang = (v_dau - interval '1 month')::date),
    'tien_chenh_thang_truoc', (select tien_chenh from cac_thang where thang = (v_dau - interval '1 month')::date),
    'cac_thang', (select jsonb_agg(jsonb_build_object('thang', thang, 'so_dat_phong', so_dat_phong, 'doanh_so', doanh_so,
                                                      'tien_chenh', tien_chenh) order by thang)
                  from cac_thang
                  where thang >= (v_dau - make_interval(months => p_so_thang - 1))::date),
    'theo_chu', coalesce((select jsonb_agg(jsonb_build_object('chu_id', chu_id, 'tu_nhap', tu_nhap, 'ten', ten,
                                                              'doanh_so', doanh_so, 'tien_chenh', tien_chenh)
                                           order by doanh_so desc, ten, chu_id, can_tu_nhap)
                          from theo_chu), '[]'::jsonb),
    'cho_chu', coalesce((select jsonb_agg(jsonb_build_object('yeu_cau_id', id, 'can_id', can_id, 'ma_can', ma_can,
                                                             'ten_toa', ten_toa, 'ngay_nhan', ngay_nhan, 'ngay_tra', ngay_tra,
                                                             'gui_luc', gui_luc, 'ten_chu', ten_chu)
                                          order by gui_luc desc, id)
                         from cho), '[]'::jsonb),
    'so_cho_chu', (select count(*) from cho)::int
  ) into v_kq;
  return v_kq;
end $$;

revoke execute on function public.fn_thong_ke_sale(date, int) from public, anon, authenticated;
grant execute on function public.fn_thong_ke_sale(date, int) to authenticated;
