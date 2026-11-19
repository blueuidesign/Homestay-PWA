-- US32 · Xóa đặt phòng khách lẻ (YC5.7). Lệnh xóa fn_xoa_booking và trigger sau khi xóa (giờ lịch đổi của căn).
-- Nhật ký xóa: trigger booking_nhat_ky có sẵn (EN2, QD2). Các đêm, phần riêng: xóa theo khóa ngoại on delete cascade.
-- Chỉ thêm, không sửa migration cũ.

-- YC5.7 bước 31, 32, YC5.6 Luật kiểm "Xóa", quy tắc "Không xóa đặt phòng của sale", QD2, QD12, QT2.1, PQ7.CHU, PQ7.SALE.
-- Chỉ người giữ căn; đặt phòng không có hay không phải của người gọi cùng lỗi quyền 42501. Đặt phòng có sale đứng tên
-- (thành từ yêu cầu hay chủ nhà ghi giúp sale) thì từ chối, chỉ sửa hay xin hủy. Không báo ai.
create or replace function public.fn_xoa_booking(p_booking_id uuid) returns void
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_b public.booking%rowtype;
begin
  -- PQ7.CHU, PQ7.SALE: khóa dòng, chỉ người giữ căn hiện tại.
  select b.* into v_b from public.booking b join public.can c on c.id = b.can_id
  where b.id = p_booking_id and c.nguoi_giu = v_nguoi
  for update of b;
  if not found then
    raise exception 'Không tìm thấy đặt phòng' using errcode = '42501';
  end if;

  -- YC5.7 bước 32, QD12: chỉ đặt phòng khách lẻ chủ nhà tự ghi.
  if v_b.sale_id is not null or v_b.nguon <> 'chu_ghi' then
    raise exception 'Đặt phòng của sale không xóa được, hãy xin hủy' using errcode = 'P0001';
  end if;

  -- QT2.1: xóa dòng thì các đêm trống lại (booking_dem, booking_rieng xóa theo).
  delete from public.booking where id = v_b.id;
end $$;

revoke execute on function public.fn_xoa_booking(uuid) from public, anon, authenticated;
grant execute on function public.fn_xoa_booking(uuid) to authenticated;

-- YC5 Dữ liệu "Ghi, sửa, xóa đặt phòng thì cập nhật lúc lịch đổi của căn" (YC7 dùng), YC5.7 bước 31.
create or replace function public.tg_booking_sau_khi_xoa() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  update public.can set lich_doi_luc = now() where id = old.can_id;
  return null;
end $$;

create trigger booking_sau_khi_xoa
  after delete on public.booking
  for each row execute function public.tg_booking_sau_khi_xoa();

revoke execute on function public.tg_booking_sau_khi_xoa() from public, anon, authenticated;
