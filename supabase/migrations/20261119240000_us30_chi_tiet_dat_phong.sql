-- US30 · Chi tiết đặt phòng và thu tiền (YC5.5). Cột nhớ trạng thái tiền trước khi thu đủ, hàm đọc chi tiết cho chủ nhà,
-- lệnh ghi đã thu đủ và hoàn tác. Chỉ thêm, không sửa migration cũ. Đổi trạng thái tiền bằng tay khi sửa: YC5.6 ([MỞ: YC5-H6]).

-- YC5.5 bước 20, 21, QT6.1: trạng thái tiền trước khi bấm "Đã thu đủ"; hoàn tác trả về giá trị này rồi xóa.
alter table public.booking add column trang_thai_tien_truoc text
  check (trang_thai_tien_truoc in ('chua_coc', 'da_coc'));

-- YC5.5 bước 16, 17, 17b, 19, 22, QT6.1, QT6.2, QD11, QD13, PQ7.CHU, PQ8.CHU, PQ9.CHU, PQ11.CHU, PQ2.
-- Chỉ người giữ căn đọc được; người khác (kể cả sale của đặt phòng) không có dòng nào. Khách là phần riêng của chính
-- người gọi (không bao giờ khách do sale nhập). Số sale chỉ khi sale đang kết nối với người gọi và chưa xóa tài khoản.
-- Không có giá bán, mức cộng, tiền thu khách của sale.
create or replace function public.fn_chi_tiet_dat_phong(p_booking_id uuid)
returns table (
  id uuid, can_id uuid, ma_can text, ngay_nhan date, ngay_tra date, gio_nhan time, gio_tra time,
  tien_phong bigint, tien_coc bigint, trang_thai_tien text, co_hoan_tac boolean, trang_thai text, nguon text,
  ghi_chu text, sale_id uuid, ten_sale text, sdt_sale text, sale_da_xoa boolean,
  ten_khach text, sdt_khach text, so_khach int, sua_luc timestamptz
)
language sql stable security definer set search_path = ''
as $$
  select b.id, b.can_id, c.ma_can, b.ngay_nhan, b.ngay_tra, b.gio_nhan, b.gio_tra,
         b.tien_phong, b.tien_coc, b.trang_thai_tien,
         (b.trang_thai_tien = 'da_thanh_toan' and b.trang_thai_tien_truoc is not null),
         b.trang_thai, b.nguon, b.ghi_chu, b.sale_id,
         ps.ten_hien_thi,
         case when ps.da_xoa_luc is null and exists (
                select 1 from public.ket_noi k
                where k.chu_id = c.nguoi_giu and k.sale_id = b.sale_id and k.trang_thai = 'da_ket_noi')
              then ps.so_dien_thoai end,
         coalesce(ps.da_xoa_luc is not null, false),
         r.ten_khach, r.sdt_khach, r.so_khach, b.sua_luc
  from public.booking b
  join public.can c on c.id = b.can_id
  left join public.profiles ps on ps.id = b.sale_id
  left join public.booking_rieng r on r.booking_id = b.id and r.nguoi_id = c.nguoi_giu
  where b.id = p_booking_id and c.nguoi_giu = public.can_dang_nhap()
$$;

revoke execute on function public.fn_chi_tiet_dat_phong(uuid) from public, anon, authenticated;
grant execute on function public.fn_chi_tiet_dat_phong(uuid) to authenticated;

-- Khóa và kiểm đặt phòng cho lệnh thu đủ, hoàn tác (PQ7.CHU, PQ8.SALE): chỉ người giữ căn; người khác và đặt phòng không
-- có thật cùng lỗi quyền 42501. Đặt phòng đã hủy: HV5. Hàm nội bộ, app không gọi.
create or replace function public.khoa_booking_cua_chu(p_booking_id uuid)
returns public.booking
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_b public.booking%rowtype;
begin
  select b.* into v_b from public.booking b join public.can c on c.id = b.can_id
  where b.id = p_booking_id and c.nguoi_giu = public.can_dang_nhap()
  for update of b;
  if not found then
    raise exception 'Không tìm thấy đặt phòng' using errcode = '42501';
  end if;
  if v_b.trang_thai = 'da_huy' then
    raise exception 'Đặt phòng này không còn' using errcode = 'P0001';
  end if;
  if v_b.trang_thai_tien is null then
    raise exception 'Đặt phòng này không có trạng thái tiền' using errcode = 'P0001';
  end if;
  return v_b;
end $$;

revoke execute on function public.khoa_booking_cua_chu(uuid) from public, anon, authenticated;

-- YC5.5 bước 20, YC5.5-NT2, NT5, QT6.1, QT5.6, PQ7.CHU, PQ8.SALE: trạng thái tiền thành đã thanh toán, nhớ trạng thái trước,
-- tiền cọc giữ nguyên. Gửi lại khi đã thanh toán thì không đổi gì. Nhật ký sửa: trigger booking_nhat_ky (QD2).
create or replace function public.fn_da_thu_du(p_booking_id uuid)
returns text
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_b public.booking%rowtype := public.khoa_booking_cua_chu(p_booking_id);
begin
  if v_b.trang_thai_tien = 'da_thanh_toan' then
    return v_b.trang_thai_tien;
  end if;
  update public.booking
     set trang_thai_tien_truoc = v_b.trang_thai_tien, trang_thai_tien = 'da_thanh_toan', sua_luc = now()
   where id = v_b.id;
  return 'da_thanh_toan';
end $$;

revoke execute on function public.fn_da_thu_du(uuid) from public, anon, authenticated;
grant execute on function public.fn_da_thu_du(uuid) to authenticated;

-- YC5.5 bước 21, YC5.5-NT3, NT5, QT6.1, QT5.6, PQ7.CHU, PQ8.SALE: về trạng thái đã nhớ rồi bỏ trạng thái nhớ. Gửi lại khi đã
-- hoàn tác thì không đổi gì. Đã thanh toán mà không nhớ trạng thái trước (thanh toán lúc ghi) thì từ chối.
create or replace function public.fn_hoan_tac_thu_du(p_booking_id uuid)
returns text
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_b public.booking%rowtype := public.khoa_booking_cua_chu(p_booking_id);
begin
  if v_b.trang_thai_tien <> 'da_thanh_toan' then
    return v_b.trang_thai_tien;
  end if;
  if v_b.trang_thai_tien_truoc is null then
    raise exception 'Đặt phòng này không hoàn tác được' using errcode = 'P0001';
  end if;
  update public.booking
     set trang_thai_tien = v_b.trang_thai_tien_truoc, trang_thai_tien_truoc = null, sua_luc = now()
   where id = v_b.id;
  return v_b.trang_thai_tien_truoc;
end $$;

revoke execute on function public.fn_hoan_tac_thu_du(uuid) from public, anon, authenticated;
grant execute on function public.fn_hoan_tac_thu_du(uuid) to authenticated;
