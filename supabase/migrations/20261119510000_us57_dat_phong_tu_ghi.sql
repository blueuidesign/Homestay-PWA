-- US57 · Ghi đặt phòng cho căn tự nhập (YC10.4). Lệnh điền sẵn fn_gia_dien_san_tu_ghi (S6-05), ghi fn_ghi_dat_phong_tu_ghi,
-- sửa fn_sua_dat_phong_tu_ghi, xóa fn_xoa_dat_phong_tu_ghi. Đọc danh sách ở fn_can_tu_nhap (US56), ô "Bạn" ở fn_sale_lich (US43).
-- Đặt phòng tự ghi là dòng booking nguồn 'sale_tu_ghi', tao_boi là sale, sale_id null: căn tự nhập là căn của chính sale, không
-- có chủ nhà bên kia để xin hủy, nên luật hủy hai bên (QD12, tg_booking_huy_hai_ben) không áp và xóa đặt phòng, xóa căn tự
-- nhập (fn_xoa_can_tu_nhap) chạy được. Trả chủ ở tiền phòng và booking_dem (QD10), thu khách ở booking_rieng của sale (QD11).
-- Chỉ thêm, không sửa migration cũ.

-- YC10.4 Luật kiểm, QT1.3, QT1.1, PQ14.SALE: kiểm ngày, tiền và đêm trùng với đặt phòng tự ghi khác của căn (bỏ p_bo_id khi
-- sửa). Người gọi đã được kiểm giữ căn và đã khóa dòng căn. Hàm nội bộ, app không gọi.
create or replace function public.kiem_dat_phong_tu_ghi(
  p_can_id uuid, p_bo_id uuid, p_ngay_nhan date, p_ngay_tra date, p_tra_chu bigint, p_thu_khach bigint
) returns void
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_dem date;
begin
  if p_ngay_nhan is null or p_ngay_tra is null or p_ngay_tra <= p_ngay_nhan then
    raise exception 'Ngày trả phải sau ngày nhận' using errcode = 'P0001';
  end if;
  if p_ngay_tra - p_ngay_nhan > 365 then
    raise exception 'Một đặt phòng dài tối đa 365 đêm' using errcode = 'P0001';
  end if;
  if p_tra_chu is null or p_tra_chu <= 0 then
    raise exception 'Cần nhập tiền trả chủ' using errcode = 'P0001';
  end if;
  if p_thu_khach is null or p_thu_khach <= 0 then
    raise exception 'Cần nhập tiền thu khách' using errcode = 'P0001';
  end if;
  -- QT1.3: chỉ so trong chính căn này; báo đêm trùng đầu tiên.
  select greatest(b.ngay_nhan, p_ngay_nhan) into v_dem
  from public.booking b
  where b.can_id = p_can_id and b.trang_thai <> 'da_huy' and b.id is distinct from p_bo_id
    and b.dem && daterange(p_ngay_nhan, p_ngay_tra, '[)')
  order by 1
  limit 1;
  if v_dem is not null then
    raise exception 'Bạn đã ghi đặt phòng cho căn này đêm %', to_char(v_dem, 'DD/MM') using errcode = 'P0001';
  end if;
end $$;

-- QD10, KT-DB.3.10: tiền trả chủ từng đêm. Trả chủ bằng tổng giá chủ các đêm thì mỗi đêm giữ giá của nó; không thì chia đều,
-- phần lẻ dồn đêm cuối. Hàm nội bộ, app không gọi.
create or replace function public.tien_dem_tu_ghi(p_can_id uuid, p_ngay_nhan date, p_ngay_tra date, p_tong bigint)
returns bigint[]
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_gia bigint[];
begin
  select array_agg(public.gia_chu_dem(p_can_id, g::date) order by g) into v_gia
  from generate_series(p_ngay_nhan, p_ngay_tra - 1, interval '1 day') g;
  if array_position(v_gia, null) is null and (select sum(x) from unnest(v_gia) x) = p_tong then
    return v_gia;
  end if;
  return public.tach_tien_theo_dem(p_tong, p_ngay_tra - p_ngay_nhan);
end $$;

-- YC10.4 bước 4, YC10.4-NT2, YC10 "Giá điền sẵn", YC4.6, YC7.5, QT3.1, PQ14.SALE: trả chủ từ giá chủ sale đã lưu (đêm cuối tuần
-- theo cài đặt của sale), thu khách từ giá bán của sale (gia_ban_dem, mức cộng riêng hay mặc định). Một đêm chưa có giá chủ
-- thì hai tổng null (hai ô trống). Chỉ căn tự nhập của người gọi; khác: 42501.
create or replace function public.fn_gia_dien_san_tu_ghi(p_can_id uuid, p_ngay_nhan date, p_ngay_tra date) returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_dem jsonb;
  v_thieu boolean;
  v_chu bigint;
  v_ban bigint;
begin
  if not exists (select 1 from public.can c where c.id = p_can_id and c.nguoi_giu = v_nguoi and c.loai = 'tu_nhap') then
    raise exception 'Không tìm thấy căn' using errcode = '42501';
  end if;
  if p_ngay_nhan is null or p_ngay_tra is null or p_ngay_tra <= p_ngay_nhan then
    raise exception 'Ngày trả phải sau ngày nhận' using errcode = 'P0001';
  end if;
  if p_ngay_tra - p_ngay_nhan > 365 then
    raise exception 'Một đặt phòng dài tối đa 365 đêm' using errcode = 'P0001';
  end if;
  select jsonb_agg(jsonb_build_object('dem', d.dem, 'tra_chu', d.chu, 'thu_khach', d.ban) order by d.dem),
         bool_or(d.chu is null or d.ban is null), sum(d.chu), sum(d.ban)
    into v_dem, v_thieu, v_chu, v_ban
  from (select g::date as dem, public.gia_chu_dem(p_can_id, g::date) as chu,
               public.gia_ban_dem(v_nguoi, p_can_id, g::date) as ban
        from generate_series(p_ngay_nhan, p_ngay_tra - 1, interval '1 day') g) d;
  return jsonb_build_object('tra_chu', case when v_thieu then null else v_chu end,
                            'thu_khach', case when v_thieu then null else v_ban end,
                            'dem', coalesce(v_dem, '[]'::jsonb));
end $$;

-- YC10.4 bước 5, 5a, YC10.4-NT3 đến NT6, HV1-NT1, YC10 "Dữ liệu", "Đặt phòng tự ghi không phải lịch", "Chặn trùng trong căn
-- tự nhập", QT1.3, QT3.1, QT5.6, QD6, QD10, QD11, PQ7.SALE, PQ14.SALE: ghi đặt phòng tự ghi cho căn tự nhập của người gọi.
-- Không trạng thái tiền, không cọc. Cùng p_client_id thì trả đặt phòng đã lưu. Ràng buộc booking_khong_trung là lớp cuối (QD6).
create or replace function public.fn_ghi_dat_phong_tu_ghi(
  p_can_id uuid, p_ngay_nhan date, p_ngay_tra date, p_tra_chu bigint, p_thu_khach bigint, p_client_id uuid
) returns uuid
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_id uuid;
  v_tien bigint[];
begin
  -- PQ14.SALE: khóa dòng căn để hai lệnh ghi cùng căn xếp hàng, kiểm trùng trước khi ghi mới đúng.
  perform 1 from public.can c where c.id = p_can_id and c.nguoi_giu = v_nguoi and c.loai = 'tu_nhap' for no key update;
  if not found then
    raise exception 'Không tìm thấy căn' using errcode = '42501';
  end if;
  if p_client_id is not null then
    select b.id into v_id from public.booking b where b.tao_boi = v_nguoi and b.client_id = p_client_id and b.can_id = p_can_id;
    if v_id is not null then return v_id; end if;
  end if;

  perform public.kiem_dat_phong_tu_ghi(p_can_id, null, p_ngay_nhan, p_ngay_tra, p_tra_chu, p_thu_khach);
  v_tien := public.tien_dem_tu_ghi(p_can_id, p_ngay_nhan, p_ngay_tra, p_tra_chu);

  begin
    insert into public.booking (can_id, ngay_nhan, ngay_tra, nguon, sale_id, tao_boi, tien_phong, trang_thai_tien, tien_coc, client_id)
    values (p_can_id, p_ngay_nhan, p_ngay_tra, 'sale_tu_ghi', null, v_nguoi, p_tra_chu, null, null, p_client_id)
    returning id into v_id;
  exception
    when exclusion_violation then
      raise exception 'Bạn đã ghi đặt phòng cho căn này đêm %', to_char(p_ngay_nhan, 'DD/MM') using errcode = 'P0001';
    when unique_violation then
      select b.id into v_id from public.booking b where b.tao_boi = v_nguoi and b.client_id = p_client_id;
      if v_id is not null then return v_id; end if;
      raise;
  end;

  insert into public.booking_dem (booking_id, dem, tien)
  select v_id, p_ngay_nhan + (i - 1), v_tien[i] from generate_series(1, p_ngay_tra - p_ngay_nhan) i;
  insert into public.booking_rieng (booking_id, nguoi_id, tien_thu_khach) values (v_id, v_nguoi, p_thu_khach);
  return v_id;
end $$;

-- YC10.4-NT8, QT1.3, QT1.2, QD10, QD11, PQ14.SALE: sửa ngày, trả chủ, thu khách của đặt phòng tự ghi của người gọi. Chặn trùng
-- bỏ chính nó. Không phải đặt phòng tự ghi của căn tự nhập của người gọi: 42501.
create or replace function public.fn_sua_dat_phong_tu_ghi(
  p_booking_id uuid, p_ngay_nhan date, p_ngay_tra date, p_tra_chu bigint, p_thu_khach bigint
) returns void
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_b public.booking%rowtype;
  v_tien bigint[];
begin
  select b.* into v_b from public.booking b join public.can c on c.id = b.can_id
  where b.id = p_booking_id and c.nguoi_giu = v_nguoi and c.loai = 'tu_nhap' and b.nguon = 'sale_tu_ghi'
  for update of b;
  if not found then
    raise exception 'Không tìm thấy đặt phòng' using errcode = '42501';
  end if;
  perform 1 from public.can where id = v_b.can_id for no key update;

  perform public.kiem_dat_phong_tu_ghi(v_b.can_id, v_b.id, p_ngay_nhan, p_ngay_tra, p_tra_chu, p_thu_khach);

  if (v_b.ngay_nhan, v_b.ngay_tra, v_b.tien_phong) is distinct from (p_ngay_nhan, p_ngay_tra, p_tra_chu) then
    v_tien := public.tien_dem_tu_ghi(v_b.can_id, p_ngay_nhan, p_ngay_tra, p_tra_chu);
    begin
      update public.booking set ngay_nhan = p_ngay_nhan, ngay_tra = p_ngay_tra, tien_phong = p_tra_chu, sua_luc = now()
       where id = v_b.id;
    exception when exclusion_violation then
      raise exception 'Bạn đã ghi đặt phòng cho căn này đêm %', to_char(p_ngay_nhan, 'DD/MM') using errcode = 'P0001';
    end;
    delete from public.booking_dem where booking_id = v_b.id;
    insert into public.booking_dem (booking_id, dem, tien)
    select v_b.id, p_ngay_nhan + (i - 1), v_tien[i] from generate_series(1, p_ngay_tra - p_ngay_nhan) i;
  end if;

  insert into public.booking_rieng (booking_id, nguoi_id, tien_thu_khach) values (v_b.id, v_nguoi, p_thu_khach)
  on conflict (booking_id, nguoi_id) do update set tien_thu_khach = excluded.tien_thu_khach;
end $$;

-- YC10.4-NT9, YC10 "Dữ liệu", QT2.1, QD2, PQ14.SALE: xóa thật đặt phòng tự ghi của người gọi (booking_dem, booking_rieng xóa
-- theo khóa ngoại; nhật ký qua booking_nhat_ky). Không phải của người gọi hay không còn: 42501.
create or replace function public.fn_xoa_dat_phong_tu_ghi(p_booking_id uuid) returns void
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_id uuid;
begin
  select b.id into v_id from public.booking b join public.can c on c.id = b.can_id
  where b.id = p_booking_id and c.nguoi_giu = v_nguoi and c.loai = 'tu_nhap' and b.nguon = 'sale_tu_ghi'
  for update of b;
  if v_id is null then
    raise exception 'Không tìm thấy đặt phòng' using errcode = '42501';
  end if;
  delete from public.booking where id = v_id;
end $$;

revoke execute on function public.kiem_dat_phong_tu_ghi(uuid, uuid, date, date, bigint, bigint),
  public.tien_dem_tu_ghi(uuid, date, date, bigint),
  public.fn_gia_dien_san_tu_ghi(uuid, date, date),
  public.fn_ghi_dat_phong_tu_ghi(uuid, date, date, bigint, bigint, uuid),
  public.fn_sua_dat_phong_tu_ghi(uuid, date, date, bigint, bigint),
  public.fn_xoa_dat_phong_tu_ghi(uuid)
  from public, anon, authenticated;
grant execute on function public.fn_gia_dien_san_tu_ghi(uuid, date, date),
  public.fn_ghi_dat_phong_tu_ghi(uuid, date, date, bigint, bigint, uuid),
  public.fn_sua_dat_phong_tu_ghi(uuid, date, date, bigint, bigint),
  public.fn_xoa_dat_phong_tu_ghi(uuid)
  to authenticated;

-- YC10.4-NT10, YC10-H9 (YC10 r5): căn tự nhập chưa lưu giá cuối tuần thì đêm cuối tuần dùng giá ngày thường.
-- Thay gia_chu_dem của US43; căn có lịch giữ nguyên cách tính (QT5.3, QT5.5, PQ5). Hàm nội bộ, app không gọi.
create or replace function public.gia_chu_dem(p_can_id uuid, p_dem date) returns bigint
language sql stable security definer set search_path = ''
as $$
  select coalesce(
    (select g.gia from public.gia_dip g where g.can_id = c.id and p_dem between g.tu_ngay and g.den_ngay limit 1),
    case
      when c.loai = 'tu_nhap' then
        case when extract(isodow from p_dem)::smallint = any (coalesce(p.dem_cuoi_tuan, '{5,6}'))
             then coalesce(c.gia_chu_cuoi_tuan, c.gia_chu_thuong) else c.gia_chu_thuong end
      else
        (select case when extract(isodow from p_dem)::smallint = any (coalesce(p.dem_cuoi_tuan, '{5,6}'))
                     then gt.gia_cuoi_tuan else gt.gia_thuong end
         from public.gia_thang gt where gt.can_id = c.id and gt.thang = date_trunc('month', p_dem)::date)
    end)
  from public.can c
  join public.profiles p on p.id = c.nguoi_giu
  where c.id = p_can_id
$$;
revoke execute on function public.gia_chu_dem(uuid, date) from public, anon, authenticated;
