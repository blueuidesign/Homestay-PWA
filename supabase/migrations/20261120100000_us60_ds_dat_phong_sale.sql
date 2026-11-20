-- US60 · Đặt phòng và yêu cầu của sale (YC11.3). Lệnh đọc danh sách của sale fn_danh_sach_sale. Chỉ thêm, không sửa
-- migration cũ.

-- YC11.3 bước 1 đến 6, YC11 "Dữ liệu", YC11 "Đặt phòng của sale", YC11-H1, YC11-H3, YC9-H5, QT3.1, QD5, QD11, QD12, QD13,
-- PQ7.SALE, PQ9.SALE, PQ10.SALE, PQ14.SALE, PQ15.SALE, PQ16.SALE, KT-DB.3.5, KT-DB.3.11. Của người gọi, không nhận mã sale.
-- Đặt phòng: sale_id là người gọi ở căn không phải của mình, kể cả đã hủy (QD12, Claude tự chốt US60), chủ đã ngừng, đã xóa
-- tài khoản; không có sale_tu_ghi. Yêu cầu: mọi yêu cầu trừ đã chốt (đã chốt hiện ở dòng đặt phòng); chờ mà quá hạn đọc ra
-- het_han. Mới nhất trước theo mốc, mỗi lần 50 dòng. Không trả tên, số khách, tiền cọc, giá từng đêm.
create or replace function public.fn_danh_sach_sale(p_bo_qua int default 0)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_kq jsonb;
begin
  if p_bo_qua is null or p_bo_qua < 0 then
    raise exception 'Số dòng bỏ qua không hợp lệ' using errcode = '22023';
  end if;

  with
  dp as (
    select 'dat_phong'::text as loai, b.id, b.can_id, c.ma_can, tn.ten as ten_toa, b.ngay_nhan, b.ngay_tra,
           case when b.trang_thai = 'da_huy' then 'da_huy' else 'da_chot' end as trang_thai,
           coalesce(y.gui_luc, b.tao_luc) as moc, y.gui_luc,
           coalesce(r.tien_thu_khach, b.tien_phong) - b.tien_phong as tien_chenh,
           case when b.nguon = 'chu_ghi' then coalesce(chu.ten_hien_thi, chu.ten) end as ghi_giup,
           null::text as tu_choi, null::text as het_han_vi
    from public.booking b
    join public.can c on c.id = b.can_id
    join public.profiles chu on chu.id = c.nguoi_giu
    left join public.toa_nha tn on tn.id = c.toa_nha_id
    left join public.yeu_cau_dat_phong y on y.id = b.yeu_cau_id
    left join public.booking_rieng r on r.booking_id = b.id and r.nguoi_id = v_nguoi
    where b.sale_id = v_nguoi and c.nguoi_giu <> v_nguoi and b.nguon <> 'sale_tu_ghi'
  ),
  yc as (
    select 'yeu_cau'::text as loai, y.id, y.can_id, c.ma_can, tn.ten as ten_toa, y.ngay_nhan, y.ngay_tra,
           case when public.yeu_cau_qua_han(y) then 'het_han' else y.trang_thai end as trang_thai,
           y.gui_luc as moc, y.gui_luc,
           null::bigint as tien_chenh, null::text as ghi_giup,
           case when y.trang_thai <> 'bi_tu_choi' then null
                when y.ly_do_tu_choi = 'Đã nhận đặt phòng khác' then 'dat_phong_khac'
                else 'khong_nhan' end as tu_choi,
           public.het_han_vi(y) as het_han_vi
    from public.yeu_cau_dat_phong y
    join public.can c on c.id = y.can_id
    left join public.toa_nha tn on tn.id = c.toa_nha_id
    where y.sale_id = v_nguoi and y.trang_thai <> 'da_chot'
  ),
  tat_ca as (select * from dp union all select * from yc),
  trang as (
    select * from tat_ca order by moc desc, id limit 51 offset p_bo_qua
  ),
  so as (select row_number() over (order by moc desc, id) as i, trang.* from trang)
  select jsonb_build_object(
    'dong', coalesce((select jsonb_agg(jsonb_build_object(
                        'loai', loai, 'id', id, 'can_id', can_id, 'ma_can', ma_can, 'ten_toa', ten_toa,
                        'ngay_nhan', ngay_nhan, 'ngay_tra', ngay_tra, 'trang_thai', trang_thai, 'moc', moc,
                        'gui_luc', gui_luc, 'tien_chenh', tien_chenh, 'ghi_giup', ghi_giup, 'tu_choi', tu_choi,
                        'het_han_vi', het_han_vi) order by i)
                      from so where i <= 50), '[]'::jsonb),
    'con_nua', (select count(*) from so) > 50
  ) into v_kq;
  return v_kq;
end $$;

revoke execute on function public.fn_danh_sach_sale(int) from public, anon, authenticated;
grant execute on function public.fn_danh_sach_sale(int) to authenticated;
