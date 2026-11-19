-- EN2 · Hàm dùng chung và trigger giữ bất biến (thiet-ke-db.md mục 1, 3).
-- Hàm chạy security definer với search_path rỗng, nên mọi tên đều ghi kèm schema.

-- QT5.1: hôm nay theo giờ Việt Nam.
create or replace function public.local_today() returns date
language sql stable security definer set search_path = ''
as $$ select (now() at time zone 'Asia/Ho_Chi_Minh')::date $$;

-- PQ Luật chung 4, thiet-ke-db.md mục 1: người gọi; chưa đăng nhập thì từ chối. Hàm fn_* gọi hàm này đầu tiên.
create or replace function public.can_dang_nhap() returns uuid
language plpgsql stable security definer set search_path = ''
as $$
declare v uuid := auth.uid();
begin
  if v is null then
    raise exception 'Bạn cần đăng nhập để làm việc này.' using errcode = '28000';
  end if;
  return v;
end $$;

-- PQ3.CHU, QD5: căn người gọi giữ (kể cả đã ẩn, để đọc lại dữ liệu cũ).
create or replace function public.my_own_can_ids() returns setof uuid
language sql stable security definer set search_path = ''
as $$ select c.id from public.can c where c.nguoi_giu = auth.uid() $$;

-- KT-DB.3.3, PQ3.SALE, PQ4.SALE, PQ5.SALE, QD7, QD8, QD13: chỗ duy nhất trả lời "sale này thấy căn nào".
-- Kết nối đang hiệu lực, đúng phạm vi, chủ chưa xóa tài khoản, căn có lịch và chưa ẩn.
create or replace function public.my_shared_can_ids() returns setof uuid
language sql stable security definer set search_path = ''
as $$
  select c.id
  from public.ket_noi k
  join public.profiles chu on chu.id = k.chu_id
  join public.can c on c.nguoi_giu = k.chu_id
  where k.sale_id = auth.uid()
    and k.trang_thai = 'da_ket_noi'
    and chu.da_xoa_luc is null
    and c.loai = 'co_lich'
    and c.an_luc is null
    and (
      k.pham_vi = 'tat_ca'
      or exists (select 1 from public.ket_noi_can kc where kc.ket_noi_id = k.id and kc.can_id = c.id)
    )
$$;

-- KT-DB.3.7, YC7.1, YC10.3, PQ4.SALE, PQ14.SALE: trạng thái một ô lịch cho người gọi.
-- Căn tự nhập chỉ có 'ban' (booking sale tự ghi) hoặc 'chua_biet'; không bao giờ 'trong' hay 'kin'.
create or replace function public.o_lich(p_can_id uuid, p_dem date) returns text
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_nguoi uuid := auth.uid();
  v_can public.can%rowtype;
  v_kin boolean;
begin
  select * into v_can from public.can where id = p_can_id;
  if not found or v_nguoi is null then
    return null;
  end if;
  select exists (
    select 1 from public.booking b
    where b.can_id = p_can_id and b.trang_thai <> 'da_huy' and b.dem @> p_dem
  ) into v_kin;
  if v_can.loai = 'tu_nhap' then
    if v_can.nguoi_giu <> v_nguoi then
      return null;
    end if;
    return case when v_kin then 'ban' else 'chua_biet' end;
  end if;
  if v_can.nguoi_giu = v_nguoi or p_can_id in (select public.my_shared_can_ids()) then
    return case when v_kin then 'kin' else 'trong' end;
  end if;
  return null;
end $$;

-- QT4.2, QD10, KT-DB.3.10: chia đều tổng tiền cho các đêm, phần lẻ dồn vào đêm cuối.
create or replace function public.tach_tien_theo_dem(p_tong bigint, p_so_dem integer) returns bigint[]
language plpgsql immutable security definer set search_path = ''
as $$
declare
  v_moi bigint;
  v_kq bigint[];
begin
  if p_tong is null or p_tong < 0 or p_so_dem is null or p_so_dem < 1 then
    raise exception 'Tiền phòng và số đêm không hợp lệ.' using errcode = '22023';
  end if;
  v_moi := p_tong / p_so_dem;
  v_kq := array_fill(v_moi, array[p_so_dem]);
  v_kq[p_so_dem] := p_tong - v_moi * (p_so_dem - 1);
  return v_kq;
end $$;

-- ===== Trigger giữ bất biến =====

-- KT-DB.3.8, QD12, PQ7: booking có sale đứng tên không bên nào tự xóa; hủy cần một bên xin, bên kia đồng ý;
-- bị từ chối thì không xin lại. Chặn ở database, kể cả lệnh ghi thẳng của chủ database.
create or replace function public.tg_booking_huy_hai_ben() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare v_chu uuid;
begin
  if tg_op = 'DELETE' then
    if old.sale_id is not null then
      raise exception 'Đặt phòng có sale đứng tên không xóa được. Hãy xin hủy, bên kia đồng ý thì đặt phòng mới hủy.'
        using errcode = 'P0001';
    end if;
    return old;
  end if;

  if old.sale_id is null then
    return new;
  end if;

  select c.nguoi_giu into v_chu from public.can c where c.id = new.can_id;

  -- Bị từ chối hủy thì giữ nguyên lời xin và lời từ chối; không bên nào xin lại.
  if old.huy_tra_loi = 'tu_choi' and (
       new.huy_xin_boi is distinct from old.huy_xin_boi or new.huy_xin_luc is distinct from old.huy_xin_luc
       or new.huy_tra_loi is distinct from old.huy_tra_loi or new.huy_tra_loi_boi is distinct from old.huy_tra_loi_boi) then
    raise exception 'Lời xin hủy đã bị từ chối, không xin hủy lại được.' using errcode = 'P0001';
  end if;

  if new.huy_xin_boi is not null and new.huy_xin_boi not in (v_chu, new.sale_id) then
    raise exception 'Chỉ chủ nhà hoặc sale đứng tên mới xin hủy được.' using errcode = 'P0001';
  end if;

  if new.huy_tra_loi is not null then
    if new.huy_xin_boi is null then
      raise exception 'Chưa có lời xin hủy để trả lời.' using errcode = 'P0001';
    end if;
    if new.huy_tra_loi_boi is null or new.huy_tra_loi_boi not in (v_chu, new.sale_id)
       or new.huy_tra_loi_boi = new.huy_xin_boi then
      raise exception 'Người xin hủy không tự đồng ý được. Bên kia phải trả lời.' using errcode = 'P0001';
    end if;
  end if;

  if new.trang_thai = 'da_huy' and old.trang_thai <> 'da_huy' then
    if new.huy_xin_boi is null or new.huy_tra_loi is distinct from 'dong_y' then
      raise exception 'Đặt phòng có sale đứng tên chỉ hủy được khi một bên xin và bên kia đồng ý.'
        using errcode = 'P0001';
    end if;
  end if;
  return new;
end $$;

create trigger booking_huy_hai_ben
  before update or delete on public.booking
  for each row execute function public.tg_booking_huy_hai_ben();

-- KT-DB.3.10, QD10, QT4: lúc commit, tập đêm trong booking_dem đúng bằng các đêm của booking
-- và tổng tiền các đêm bằng tiền phòng.
create or replace function public.kiem_tien_dem(p_booking_id uuid) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_b public.booking%rowtype;
  v_tong bigint;
  v_lech integer;
begin
  select * into v_b from public.booking where id = p_booking_id;
  if not found then
    return;
  end if;
  select coalesce(sum(d.tien), 0) into v_tong from public.booking_dem d where d.booking_id = p_booking_id;
  select count(*) into v_lech from (
    (select g::date from generate_series(v_b.ngay_nhan, v_b.ngay_tra - 1, interval '1 day') g
     except select d.dem from public.booking_dem d where d.booking_id = p_booking_id)
    union all
    (select d.dem from public.booking_dem d where d.booking_id = p_booking_id
     except select g::date from generate_series(v_b.ngay_nhan, v_b.ngay_tra - 1, interval '1 day') g)
  ) x;
  if v_lech > 0 then
    raise exception 'Tiền từng đêm của đặt phòng không khớp các đêm của đặt phòng.' using errcode = 'P0001';
  end if;
  if v_tong <> v_b.tien_phong then
    raise exception 'Tổng tiền các đêm (%) khác tiền phòng (%).', v_tong, v_b.tien_phong using errcode = 'P0001';
  end if;
end $$;

create or replace function public.tg_kiem_tien_dem() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if tg_table_name = 'booking' then
    perform public.kiem_tien_dem(new.id);
  elsif tg_op = 'DELETE' then
    perform public.kiem_tien_dem(old.booking_id);
  else
    perform public.kiem_tien_dem(new.booking_id);
    if tg_op = 'UPDATE' and old.booking_id <> new.booking_id then
      perform public.kiem_tien_dem(old.booking_id);
    end if;
  end if;
  return null;
end $$;

create constraint trigger booking_tien_dem_khop
  after insert or update of ngay_nhan, ngay_tra, tien_phong on public.booking
  deferrable initially deferred
  for each row execute function public.tg_kiem_tien_dem();

create constraint trigger booking_dem_khop
  after insert or update or delete on public.booking_dem
  deferrable initially deferred
  for each row execute function public.tg_kiem_tien_dem();

-- QD2: nhật ký sửa, xóa booking (ai, lúc nào, trước và sau).
create or replace function public.tg_booking_nhat_ky() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.audit_log (bang, ban_ghi_id, hanh_dong, nguoi, truoc, sau)
  values ('booking', old.id, lower(tg_op), auth.uid(), to_jsonb(old),
          case when tg_op = 'UPDATE' then to_jsonb(new) end);
  return null;
end $$;

create trigger booking_nhat_ky
  after update or delete on public.booking
  for each row execute function public.tg_booking_nhat_ky();
