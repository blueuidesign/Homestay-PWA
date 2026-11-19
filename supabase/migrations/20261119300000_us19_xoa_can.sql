-- US19 · Xóa căn (YC3.6). Lệnh xóa căn fn_xoa_can (ẩn căn) và trigger khóa căn trước khi ghi đặt phòng, yêu cầu
-- (YC3 Dữ liệu, YC3.6-NT11). Không có lệnh bỏ ẩn (YC3.6-NT9). Chỉ thêm, không sửa migration cũ.

-- YC3.6 bước 42 đến 44, YC3 quy tắc "Xóa căn là ẩn căn", QT5.1, QT5.5, PQ3.CHU, PQ3.SALE, PQ13, PQ17.
-- Chỉ người giữ căn; căn không có, đã ẩn hay của người khác: 42501 (QT5.5: như không thấy). Còn đặt phòng chưa hủy có
-- ngày trả sau hôm nay (giờ Việt Nam) hay yêu cầu đang chờ chưa hết hạn: P0001. Không báo ai.
-- Đặt phòng, tiền từng đêm, thống kê giữ nguyên; sale thôi thấy căn qua my_shared_can_ids (KT-DB.3.3).
create or replace function public.fn_xoa_can(p_can_id uuid) returns void
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
begin
  -- YC3 Dữ liệu, YC3.6-NT11: khóa căn trước khi kiểm; lệnh ghi đặt phòng, yêu cầu vào căn này phải chờ.
  perform 1 from public.can
  where id = p_can_id and nguoi_giu = v_nguoi and an_luc is null
  for update;
  if not found then
    raise exception 'Không tìm thấy căn' using errcode = '42501';
  end if;

  -- YC3.6 bước 43.
  if exists (select 1 from public.booking b
             where b.can_id = p_can_id and b.trang_thai <> 'da_huy' and b.ngay_tra > public.local_today())
     or exists (select 1 from public.yeu_cau_dat_phong y
                where y.can_id = p_can_id and y.trang_thai = 'cho' and y.han_luc > now()) then
    raise exception 'Căn còn đặt phòng sắp tới' using errcode = 'P0001';
  end if;

  -- YC3.6 bước 44.
  update public.can set an_luc = now() where id = p_can_id;
end $$;

revoke execute on function public.fn_xoa_can(uuid) from public, anon, authenticated;
grant execute on function public.fn_xoa_can(uuid) to authenticated;

-- YC3 Dữ liệu, YC3.6-NT11: ghi đặt phòng chưa hủy có ngày trả sau hôm nay thì khóa dòng căn rồi mới kiểm căn chưa ẩn.
-- Lệnh ẩn đang chạy giữ khóa căn: lệnh ghi chờ, ẩn xong thì bị từ chối như căn không thấy (QT5.5). Khóa "no key update"
-- để hai lệnh ghi cùng căn xếp hàng nhau, không khóa chéo với lệnh cập nhật giờ lịch đổi của căn.
create or replace function public.tg_booking_can_chua_an() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.trang_thai <> 'da_huy' and new.ngay_tra > public.local_today() then
    perform 1 from public.can where id = new.can_id and an_luc is null for no key update;
    if not found then
      raise exception 'Không tìm thấy căn' using errcode = '42501';
    end if;
  end if;
  return new;
end $$;

create trigger booking_can_chua_an
  before insert or update of can_id, ngay_nhan, ngay_tra, trang_thai on public.booking
  for each row execute function public.tg_booking_can_chua_an();

-- YC3 Dữ liệu: yêu cầu đang chờ vào căn cũng khóa căn và kiểm căn chưa ẩn (lệnh gửi yêu cầu làm ở YC9).
create or replace function public.tg_yeu_cau_can_chua_an() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.trang_thai = 'cho' then
    perform 1 from public.can where id = new.can_id and an_luc is null for no key update;
    if not found then
      raise exception 'Không tìm thấy căn' using errcode = '42501';
    end if;
  end if;
  return new;
end $$;

create trigger yeu_cau_can_chua_an
  before insert or update of can_id, trang_thai on public.yeu_cau_dat_phong
  for each row execute function public.tg_yeu_cau_can_chua_an();

revoke execute on function public.tg_booking_can_chua_an() from public, anon, authenticated;
revoke execute on function public.tg_yeu_cau_can_chua_an() from public, anon, authenticated;
