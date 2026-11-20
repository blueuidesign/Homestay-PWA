-- US34 · Phía sale: đặt phòng chủ nhà ghi giúp (YC5.9). Sale đọc một đặt phòng mình đứng tên fn_sale_xem_dat_phong và sửa
-- giá bán của mình fn_sale_sua_gia_ban. Chỉ thêm, không sửa migration cũ.

-- YC5.9 bước 38, YC5.6 (S3-10), QT3.1, QT6.1, QD7, QD11, QD12, QD13, PQ7.SALE, PQ8.SALE, PQ9.SALE, PQ11.SALE, KT-DB.3.5,
-- KT-DB.3.6. Đặt phòng sale đứng tên ở căn chủ nhà (không phải căn của mình, không phải căn tự nhập), kể cả đã hủy, chủ đã
-- ngừng chia sẻ. Không tiền cọc, không khách chủ nhập. Cọc chỉ là đã cọc hay chưa, khi chủ còn kết nối và bật xem cọc (QD7).
-- Số chủ khi còn kết nối và chủ chưa xóa tài khoản. Không phải của người gọi: như không có.
create or replace function public.fn_sale_xem_dat_phong(p_booking_id uuid) returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_kq jsonb;
begin
  select jsonb_build_object(
           'id', b.id, 'can_id', b.can_id, 'ma_can', c.ma_can, 'ten_toa', tn.ten, 'so_phong_ngu', c.so_phong_ngu,
           'ten_chu', coalesce(chu.ten_hien_thi, chu.ten),
           'sdt_chu', case when k.trang_thai = 'da_ket_noi' and chu.da_xoa_luc is null then chu.so_dien_thoai end,
           'ngay_nhan', b.ngay_nhan, 'ngay_tra', b.ngay_tra, 'trang_thai', b.trang_thai,
           'tien_phong', b.tien_phong, 'gia_ban', coalesce(r.tien_thu_khach, b.tien_phong),
           'tien_chenh', coalesce(r.tien_thu_khach, b.tien_phong) - b.tien_phong,
           'da_coc', case when k.trang_thai = 'da_ket_noi' and k.xem_coc
                          then coalesce(b.trang_thai_tien, 'chua_coc') <> 'chua_coc' end,
           'ghi_giup', b.nguon = 'chu_ghi',
           'sua_gan_nhat', (select jsonb_build_object('luc', tb.tao_luc, 'noi_dung', tb.noi_dung)
                            from public.thong_bao tb
                            where tb.nguoi_nhan = v_nguoi and tb.loai = 'chu_sua_dat_phong'
                              and tb.doi_tuong_loai = 'booking' and tb.doi_tuong_id = b.id
                            order by tb.tao_luc desc, tb.id limit 1))
    into v_kq
  from public.booking b
  join public.can c on c.id = b.can_id
  join public.profiles chu on chu.id = c.nguoi_giu
  left join public.toa_nha tn on tn.id = c.toa_nha_id
  left join public.ket_noi k on k.chu_id = c.nguoi_giu and k.sale_id = v_nguoi
  left join public.booking_rieng r on r.booking_id = b.id and r.nguoi_id = v_nguoi
  where b.id = p_booking_id and b.sale_id = v_nguoi and c.nguoi_giu <> v_nguoi and c.loai = 'co_lich'
    and b.nguon <> 'sale_tu_ghi';
  if v_kq is null then
    raise exception 'Không tìm thấy đặt phòng' using errcode = '42501';
  end if;
  return v_kq;
end $$;

-- YC5.9 bước 39, YC5.9-NT1, NT2, YC5-H10 (Claude tự chốt US34: chênh âm được, sale đã bị ngừng vẫn sửa), QD11, PQ8.SALE,
-- PQ11.SALE, KT-DB.3.6. Chỉ sale đứng tên ghi giá bán của mình; chủ nhà, sale khác: như không có. Giá bán > 0.
create or replace function public.fn_sale_sua_gia_ban(p_booking_id uuid, p_gia_ban bigint) returns void
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_b public.booking%rowtype;
begin
  select b.* into v_b from public.booking b join public.can c on c.id = b.can_id
  where b.id = p_booking_id and b.sale_id = v_nguoi and c.nguoi_giu <> v_nguoi and c.loai = 'co_lich'
    and b.nguon <> 'sale_tu_ghi'
  for update of b;
  if not found then
    raise exception 'Không tìm thấy đặt phòng' using errcode = '42501';
  end if;
  if v_b.trang_thai = 'da_huy' then
    raise exception 'Đặt phòng đã hủy, không sửa được giá bán' using errcode = 'P0001';
  end if;
  if p_gia_ban is null or p_gia_ban <= 0 then
    raise exception 'Giá bán phải lớn hơn 0' using errcode = 'P0001';
  end if;
  insert into public.booking_rieng (booking_id, nguoi_id, tien_thu_khach)
  values (p_booking_id, v_nguoi, p_gia_ban)
  on conflict (booking_id, nguoi_id) do update set tien_thu_khach = excluded.tien_thu_khach;
end $$;

revoke execute on function public.fn_sale_xem_dat_phong(uuid), public.fn_sale_sua_gia_ban(uuid, bigint)
  from public, anon, authenticated;
grant execute on function public.fn_sale_xem_dat_phong(uuid), public.fn_sale_sua_gia_ban(uuid, bigint) to authenticated;
