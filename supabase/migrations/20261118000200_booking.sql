-- =====================================================================================
-- 20261118000200_booking.sql · Booking, tiền theo đêm, khách của booking, yêu cầu đặt phòng, hủy hai bên
-- Vì sao: QD-002 (booking sửa qua hàm), QD-006 (chặn trùng ở database), QD-010 (tiền phòng), QD-011 (khách), QD-012 (hủy)
-- Thay đổi: booking, booking_dem, booking_rieng, yeu_cau_dat_phong, yeu_cau_rieng; v_lich_sale, v_booking_cua_sale;
--           fn_chu_ghi_booking, fn_chu_sua_booking, fn_chu_xoa_booking, fn_chu_thu_du, fn_chu_hoan_tac_thu_du,
--           fn_sale_gui_yeu_cau, fn_sale_huy_yeu_cau, fn_chu_tra_loi_yeu_cau, het_han_yeu_cau,
--           fn_sale_ghi_tu_nhap, fn_sale_sua_tu_nhap, fn_sale_xoa_tu_nhap, fn_xin_huy, fn_tra_loi_huy, fn_ghi_khach, can_con_dat_phong
-- Tương thích ngược: chỉ thêm
-- Kiểm thử: tests/db/t_03_chan_trung.sql, t_04_tien_phong.sql, t_05_yeu_cau_huy_khach.sql
-- =====================================================================================

create table public.booking (
  id uuid primary key default gen_random_uuid(),
  can_id uuid not null references public.can(id),
  dem daterange not null check (lower_inc(dem) and not upper_inc(dem) and not isempty(dem)),  -- [ngày nhận, ngày trả)
  nguon text not null check (nguon in ('chu_tu_ghi', 'tu_yeu_cau', 'sale_tu_ghi')),
  chu_nha_id uuid not null references public.profiles(id),     -- người giữ căn lúc ghi
  sale_id uuid references public.profiles(id),                  -- trống là khách lẻ của chủ nhà
  yeu_cau_id uuid,
  client_id uuid unique,                                        -- app gửi lại khi rớt mạng không tạo trùng
  tien_phong integer not null check (tien_phong > 0),           -- tổng giá chủ nhà; căn tự nhập là tiền trả chủ
  trang_thai_tien text check (trang_thai_tien in ('chua_coc', 'da_coc_con_thu', 'da_thanh_toan')),
  tien_coc integer check (tien_coc > 0),                        -- sale KHÔNG BAO GIỜ thấy cột này (QD-007)
  trang_thai_tien_truoc text,                                   -- trạng thái tiền trước khi bấm "Đã thu đủ", để hoàn tác (mục "Chi tiết booking và đánh dấu đã thu đủ" (US10))
  gio_nhan time,                                                -- chép từ giờ mặc định của chủ lúc ghi; đổi giờ mặc định không đổi booking cũ (mục "Giờ nhận, trả phòng mặc định" (US21))
  gio_tra time,
  ghi_chu text check (char_length(ghi_chu) <= 1000),            -- ghi chú của chủ nhà, sale không thấy
  trang_thai text not null default 'hieu_luc' check (trang_thai in ('hieu_luc', 'cho_huy', 'da_huy')),
  xin_huy_boi uuid references public.profiles(id),
  xin_huy_luc timestamptz,
  tu_choi_huy_luc timestamptz,                                  -- có giá trị thì không xin hủy lại được (QD-012)
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Chặn trùng ở database (QD-006, QT1): một đêm của một căn chỉ thuộc một booking chưa hủy.
  -- Khoảng nửa mở nên booking 10→12 và 12→13 không trùng (QT1.1-VD2). Khi sửa, Postgres tự bỏ chính dòng đang sửa (QT1.2).
  constraint booking_khong_trung exclude using gist (can_id with =, dem with &&) where (trang_thai <> 'da_huy'),
  check (trang_thai = 'hieu_luc' or (xin_huy_boi is not null and xin_huy_luc is not null)),
  check (tien_coc is null or trang_thai_tien in ('da_coc_con_thu', 'da_thanh_toan')),
  check (tien_coc is null or tien_coc <= tien_phong)
);
create index booking_sale_idx on public.booking (sale_id);

-- Tiền của từng đêm, để chia doanh thu và tiền chênh theo tháng của đêm (QD-010, QT2.2, QT4.2)
create table public.booking_dem (
  booking_id uuid not null references public.booking(id) on delete cascade,
  dem date not null,
  tien integer not null,
  primary key (booking_id, dem)
);

-- Phần riêng của từng người trên một booking: khách do người đó nhập, và với sale là tiền thu khách.
-- Mỗi người chỉ đọc phần của mình (QD-011, QT3): sale không bao giờ thấy khách của chủ nhà;
-- chủ nhà không thấy khách của sale, không thấy sale bán cho khách giá bao nhiêu.
create table public.booking_rieng (
  booking_id uuid not null references public.booking(id) on delete cascade,
  nguoi uuid not null references public.profiles(id),
  ten_khach text,
  sdt_khach text,
  so_khach smallint check (so_khach > 0),
  tien_thu_khach integer check (tien_thu_khach > 0),   -- chỉ của sale, để tính tiền chênh (QT3)
  primary key (booking_id, nguoi)
);

create table public.yeu_cau_dat_phong (
  id uuid primary key default gen_random_uuid(),
  can_id uuid not null references public.can(id),
  sale_id uuid not null references public.profiles(id),
  dem daterange not null check (lower_inc(dem) and not upper_inc(dem) and not isempty(dem)),
  client_id uuid unique,
  -- cho → chap_nhan | tu_choi (chủ từ chối, hoặc chủ nhận booking khác trùng đêm) | het_han (quá 14 ngày) | da_huy (sale tự hủy). mục "Booking"
  trang_thai text not null default 'cho' check (trang_thai in ('cho', 'chap_nhan', 'tu_choi', 'het_han', 'da_huy')),
  ly_do_ma text check (ly_do_ma in ('da_co_khach', 'dang_sua_phong', 'ly_do_khac', 'chu_nhan_dat_khac')),
  ly_do_tu_choi text,                                           -- câu sale đọc được
  loi_nhan text check (char_length(loi_nhan) <= 500),           -- "Nhắn chủ nhà (không bắt buộc)" ở S3-02
  het_han_luc timestamptz not null default now() + interval '14 days',
  created_at timestamptz not null default now(),
  tra_loi_luc timestamptz
);
-- Phần riêng của sale trên yêu cầu: chủ nhà không đọc được. Chép sang booking_rieng khi chấp nhận.
create table public.yeu_cau_rieng (
  yeu_cau_id uuid primary key references public.yeu_cau_dat_phong(id) on delete cascade,
  ten_khach text, sdt_khach text, so_khach smallint check (so_khach > 0),
  tien_thu_khach integer check (tien_thu_khach > 0)
);

create index yeu_cau_can_cho_idx on public.yeu_cau_dat_phong using gist (can_id, dem) where trang_thai = 'cho';
alter table public.booking add constraint booking_yeu_cau_fk foreign key (yeu_cau_id) references public.yeu_cau_dat_phong(id);

-- ---------- Hàm nội bộ ----------

-- Chia tiền phòng cho các đêm (QT4.2): giữ đúng tổng bảng giá thì mỗi đêm giữ giá của đêm đó;
-- tổng khác bảng giá thì chia đều, phần lẻ dồn đêm cuối.
create or replace function public.ghi_booking_dem(p_booking uuid) returns void
language plpgsql security definer set search_path = public as $$
declare b booking; v_n int; v_tong_bang_gia bigint; v_co_du_gia boolean;
begin
  select * into b from booking where id = p_booking;
  delete from booking_dem where booking_id = p_booking;
  v_n := upper(b.dem) - lower(b.dem);
  select sum(gia_dem(b.can_id, d::date)), bool_and(gia_dem(b.can_id, d::date) is not null)
    into v_tong_bang_gia, v_co_du_gia
    from generate_series(lower(b.dem), upper(b.dem) - 1, interval '1 day') d;
  if v_co_du_gia and v_tong_bang_gia = b.tien_phong then
    insert into booking_dem (booking_id, dem, tien)
    select p_booking, d::date, gia_dem(b.can_id, d::date) from generate_series(lower(b.dem), upper(b.dem) - 1, interval '1 day') d;
  else
    insert into booking_dem (booking_id, dem, tien)
    select p_booking, d::date,
           case when d::date = upper(b.dem) - 1 then b.tien_phong - (b.tien_phong / v_n) * (v_n - 1) else b.tien_phong / v_n end
      from generate_series(lower(b.dem), upper(b.dem) - 1, interval '1 day') d;
  end if;
end $$;

-- Tiền phòng điền sẵn = tổng giá chủ nhà các đêm theo bảng giá (QT4.1). Null khi có đêm chưa đặt giá.
create or replace function public.tien_phong_goi_y(p_can uuid, p_nhan date, p_tra date) returns integer
language sql stable security definer set search_path = public as $$
  select case when bool_and(gia_dem(p_can, d::date) is not null) then sum(gia_dem(p_can, d::date))::int end
    from generate_series(p_nhan, p_tra - 1, interval '1 day') d
$$;

-- Từ chối mọi yêu cầu đang chờ trùng đêm với một booking vừa chiếm đêm (QT1.4-VD2, mục "Yêu cầu trùng ngày" (US15)).
-- Lý do sale đọc: "<chủ nhà> đã nhận đặt phòng khác cho <ngày>". Không có tên người đặt.
create or replace function public.tu_choi_yeu_cau_trung(p_can uuid, p_dem daterange) returns void
language sql security definer set search_path = public as $$
  update yeu_cau_dat_phong y set trang_thai = 'tu_choi', ly_do_ma = 'chu_nhan_dat_khac', tra_loi_luc = now(),
         ly_do_tu_choi = coalesce((select pr.ten from can c join profiles pr on pr.id = c.nguoi_giu where c.id = y.can_id), 'Chủ nhà')
                         || ' đã nhận đặt phòng khác cho ' || to_char(lower(y.dem), 'DD/MM') || ' → ' || to_char(upper(y.dem), 'DD/MM')
   where y.can_id = p_can and y.trang_thai = 'cho' and y.dem && p_dem
$$;

-- Căn còn booking chưa tới ngày trả (tính theo hôm nay giờ Việt Nam) hoặc còn yêu cầu đang chờ: không xóa căn được (mục "Xóa căn" (US27))
create or replace function public.can_con_dat_phong(p_can uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from booking where can_id = p_can and trang_thai <> 'da_huy' and upper(dem) > local_today())
      or exists (select 1 from yeu_cau_dat_phong where can_id = p_can and trang_thai = 'cho' and het_han_luc > now())
$$;

-- Giá bán điền sẵn khi chủ nhà ghi booking cho một sale (mục "Booking chủ nhà ghi cho sale" (US28)): tiền phòng + mức cộng của sale đó × số đêm.
create or replace function public.gia_ban_goi_y(p_sale uuid, p_can uuid, p_tien_phong int, p_so_dem int) returns integer
language sql stable security definer set search_path = public as $$
  select case when coalesce(cd.lam_tron_50k, false) then (ceil(x.t / 50000.0) * 50000)::int else x.t end
    from (select p_tien_phong + p_so_dem * coalesce((select so_tien from muc_cong where sale_id = p_sale and can_id = p_can),
                                                    (select muc_cong_mac_dinh from cai_dat_rieng where user_id = p_sale), 0) as t) x
    left join cai_dat_rieng cd on cd.user_id = p_sale
$$;

create or replace function public.dich_loi_trung() returns text language sql immutable as $$ select 'Căn đã có đặt phòng trong những đêm này' $$;

revoke execute on function public.ghi_booking_dem(uuid), public.tu_choi_yeu_cau_trung(uuid, daterange), public.can_con_dat_phong(uuid),
  public.gia_ban_goi_y(uuid, uuid, int, int) from public, anon, authenticated;

-- ---------- Hàm ghi ----------

-- Chủ nhà ghi booking cho căn mình (khách lẻ, hoặc chọn một sale đang kết nối: coi như booking của sale đó)
create or replace function public.fn_chu_ghi_booking(p jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_me uuid := can_dang_nhap();
  v_can uuid := (p->>'can_id')::uuid;
  v_nhan date := (p->>'ngay_nhan')::date;
  v_tra date := (p->>'ngay_tra')::date;
  v_client uuid := nullif(p->>'client_id', '')::uuid;
  v_sale uuid := nullif(p->>'sale_id', '')::uuid;
  v_tien int;
  v_id uuid;
begin
  if not exists (select 1 from can where id = v_can and nguoi_giu = v_me and loai = 'co_lich' and an_luc is null) then
    raise exception 'Bạn không ghi được đặt phòng cho căn này' using errcode = '42501';
  end if;
  if v_client is not null then
    select id into v_id from booking where client_id = v_client;
    if found then return jsonb_build_object('id', v_id, 'trung_lan_gui', true); end if;
  end if;
  if v_nhan is null or v_tra is null or v_tra <= v_nhan then raise exception 'Ngày trả phải sau ngày nhận' using errcode = 'P0001'; end if;
  if v_sale is not null and not exists (select 1 from ket_noi where chu_nha_id = v_me and sale_id = v_sale and trang_thai = 'da_ket_noi') then
    raise exception 'Sale này không đang kết nối với bạn' using errcode = 'P0001';
  end if;
  v_tien := coalesce((p->>'tien_phong')::int, tien_phong_goi_y(v_can, v_nhan, v_tra));
  if v_tien is null then raise exception 'Cần nhập tiền phòng' using errcode = 'P0001'; end if;
  begin
    insert into booking (can_id, dem, nguon, chu_nha_id, sale_id, client_id, tien_phong, trang_thai_tien, tien_coc,
                         gio_nhan, gio_tra, ghi_chu, created_by)
    select v_can, daterange(v_nhan, v_tra), 'chu_tu_ghi', v_me, v_sale, v_client, v_tien,
           coalesce(p->>'trang_thai_tien', 'chua_coc'), (p->>'tien_coc')::int,
           coalesce((p->>'gio_nhan')::time, pr.gio_nhan), coalesce((p->>'gio_tra')::time, pr.gio_tra), nullif(p->>'ghi_chu', ''), v_me
      from profiles pr where pr.id = v_me
    returning id into v_id;
  exception when exclusion_violation then
    raise exception '%', dich_loi_trung() using errcode = 'P0001';
  end;
  perform ghi_booking_dem(v_id);
  perform tu_choi_yeu_cau_trung(v_can, daterange(v_nhan, v_tra));
  if p ? 'khach' then
    insert into booking_rieng (booking_id, nguoi, ten_khach, sdt_khach, so_khach)
    values (v_id, v_me, p->'khach'->>'ten', p->'khach'->>'sdt', (p->'khach'->>'so_khach')::smallint);
  end if;
  -- Chủ ghi cho một sale: coi như booking của sale đó, giá bán điền sẵn theo mức cộng của sale (mục "Booking chủ nhà ghi cho sale" (US28), QT3.1-VD3).
  -- Khách chủ nhà nhập nằm ở dòng của chủ, sale không thấy.
  if v_sale is not null then
    insert into booking_rieng (booking_id, nguoi, tien_thu_khach)
    values (v_id, v_sale, gia_ban_goi_y(v_sale, v_can, v_tien, v_tra - v_nhan));
  end if;
  update can set lich_cap_nhat_luc = now() where id = v_can;
  return jsonb_build_object('id', v_id, 'tien_phong', v_tien);
end $$;

-- Chủ nhà sửa booking của căn mình: ngày, tiền phòng, tình trạng tiền. Mọi lần sửa ghi audit_log (QD-002).
create or replace function public.fn_chu_sua_booking(p_id uuid, p jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap(); b booking; v_dem daterange;
begin
  select * into b from booking where id = p_id for update;
  if not found or b.chu_nha_id <> v_me or b.nguon = 'sale_tu_ghi' then
    raise exception 'Không tìm thấy đặt phòng của bạn' using errcode = '42501';
  end if;
  if b.trang_thai = 'da_huy' then raise exception 'Đặt phòng đã hủy, không sửa được' using errcode = 'P0001'; end if;
  v_dem := daterange(coalesce((p->>'ngay_nhan')::date, lower(b.dem)), coalesce((p->>'ngay_tra')::date, upper(b.dem)));
  begin
    update booking set dem = v_dem,
                       tien_phong = coalesce((p->>'tien_phong')::int, tien_phong),
                       trang_thai_tien = coalesce(p->>'trang_thai_tien', trang_thai_tien),
                       tien_coc = case when p ? 'tien_coc' then (p->>'tien_coc')::int else tien_coc end,
                       gio_nhan = coalesce((p->>'gio_nhan')::time, gio_nhan),
                       gio_tra = coalesce((p->>'gio_tra')::time, gio_tra),
                       ghi_chu = case when p ? 'ghi_chu' then nullif(p->>'ghi_chu', '') else ghi_chu end,
                       updated_at = now()
     where id = p_id;
  exception when exclusion_violation then
    raise exception '%', dich_loi_trung() using errcode = 'P0001';
  end;
  perform ghi_booking_dem(p_id);
  perform tu_choi_yeu_cau_trung(b.can_id, v_dem);
  insert into audit_log (actor_id, table_name, row_id, action, old_row, new_row)
  values (v_me, 'booking', p_id, 'sua', to_jsonb(b), (select to_jsonb(x) from booking x where id = p_id));
  update can set lich_cap_nhat_luc = now() where id = b.can_id;
end $$;

-- "Đã thu đủ" (mục "Chi tiết booking và đánh dấu đã thu đủ" (US10)): nhãn thành Đã thanh toán, nhớ trạng thái trước để hoàn tác. Tiền cọc giữ nguyên.
create or replace function public.fn_chu_thu_du(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap();
begin
  update booking set trang_thai_tien_truoc = trang_thai_tien, trang_thai_tien = 'da_thanh_toan', updated_at = now()
   where id = p_id and chu_nha_id = v_me and nguon <> 'sale_tu_ghi' and trang_thai <> 'da_huy' and trang_thai_tien <> 'da_thanh_toan';
  if not found then raise exception 'Không đánh dấu được đặt phòng này' using errcode = 'P0001'; end if;
end $$;

create or replace function public.fn_chu_hoan_tac_thu_du(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap();
begin
  update booking set trang_thai_tien = coalesce(trang_thai_tien_truoc, case when tien_coc is null then 'chua_coc' else 'da_coc_con_thu' end),
                     trang_thai_tien_truoc = null, updated_at = now()
   where id = p_id and chu_nha_id = v_me and trang_thai_tien = 'da_thanh_toan' and nguon <> 'sale_tu_ghi';
  if not found then raise exception 'Đặt phòng này chưa ghi đã thu đủ' using errcode = 'P0001'; end if;
end $$;

-- Chủ nhà xóa booking khách lẻ mình tự ghi. Booking có sale thì không xóa, phải xin hủy (mục "Xóa booking" (US10), QD-012).
create or replace function public.fn_chu_xoa_booking(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap(); b booking;
begin
  select * into b from booking where id = p_id for update;
  if not found or b.chu_nha_id <> v_me or b.nguon = 'sale_tu_ghi' then raise exception 'Không tìm thấy đặt phòng của bạn' using errcode = '42501'; end if;
  if b.sale_id is not null then raise exception 'Đặt phòng của sale không xóa được, hãy xin hủy' using errcode = 'P0001'; end if;
  insert into audit_log (actor_id, table_name, row_id, action, old_row) values (v_me, 'booking', p_id, 'xoa', to_jsonb(b));
  delete from booking where id = p_id;
end $$;

-- Sale gửi yêu cầu đặt phòng cho căn được chia sẻ
create or replace function public.fn_sale_gui_yeu_cau(p jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_me uuid := can_dang_nhap();
  v_can uuid := (p->>'can_id')::uuid;
  v_dem daterange := daterange((p->>'ngay_nhan')::date, (p->>'ngay_tra')::date);
  v_client uuid := nullif(p->>'client_id', '')::uuid;
  v_id uuid;
begin
  if v_client is not null then
    select id into v_id from yeu_cau_dat_phong where client_id = v_client;
    if found then return jsonb_build_object('id', v_id, 'trung_lan_gui', true); end if;
  end if;
  if not exists (select 1 from can where id = v_can) then raise exception 'Không tìm thấy căn' using errcode = '42501'; end if;
  if exists (select 1 from can c join profiles pr on pr.id = c.nguoi_giu where c.id = v_can and pr.da_xoa_luc is not null) then
    raise exception 'Không gửi được yêu cầu. Chủ nhà đã xóa tài khoản trên Home247.' using errcode = 'P0001';
  end if;
  if v_can not in (select my_shared_can_ids()) then raise exception 'Bạn không được xem căn này' using errcode = '42501'; end if;
  if isempty(v_dem) then raise exception 'Ngày trả phải sau ngày nhận' using errcode = 'P0001'; end if;
  if exists (select 1 from booking where can_id = v_can and dem && v_dem and trang_thai <> 'da_huy') then
    raise exception 'Căn này đã được đặt rồi' using errcode = 'P0001';          -- QT1.4-VD1
  end if;
  insert into yeu_cau_dat_phong (can_id, sale_id, dem, client_id, loi_nhan)
  values (v_can, v_me, v_dem, v_client, nullif(btrim(coalesce(p->>'loi_nhan', '')), '')) returning id into v_id;
  -- Giá bán là số riêng của sale: app không gửi thì lấy giá bán theo mức cộng (null nếu có đêm chưa đặt giá).
  insert into yeu_cau_rieng (yeu_cau_id, ten_khach, sdt_khach, so_khach, tien_thu_khach)
  values (v_id, p->'khach'->>'ten', p->'khach'->>'sdt', (p->'khach'->>'so_khach')::smallint,
          coalesce((p->>'tien_thu_khach')::int,
                   (select case when bool_and(gia_dem(v_can, d::date) is not null) then sum(gia_ban_dem(v_can, d::date))::int end
                      from generate_series(lower(v_dem), upper(v_dem) - 1, interval '1 day') d)));
  return jsonb_build_object('id', v_id);
end $$;

-- Sale hủy yêu cầu đang chờ của mình (mục "Sale gửi yêu cầu đặt phòng" (US15))
create or replace function public.fn_sale_huy_yeu_cau(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap();
begin
  update yeu_cau_dat_phong set trang_thai = 'da_huy', tra_loi_luc = now() where id = p_id and sale_id = v_me and trang_thai = 'cho';
  if not found then raise exception 'Không tìm thấy yêu cầu đang chờ của bạn' using errcode = 'P0001'; end if;
end $$;

-- Việc định kỳ: yêu cầu chờ quá 14 ngày thành Hết hạn (US15-NT6). pg_cron gọi mỗi 10 phút; không ai gọi qua API.
create or replace function public.het_han_yeu_cau() returns integer
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  update yeu_cau_dat_phong set trang_thai = 'het_han', tra_loi_luc = now() where trang_thai = 'cho' and het_han_luc <= now();
  get diagnostics n = row_count;
  return n;
end $$;
revoke execute on function public.het_han_yeu_cau() from public, anon, authenticated;

-- Chủ nhà chấp nhận hay từ chối. Chấp nhận thì thành booking của sale, các yêu cầu trùng đêm thành bị từ chối.
create or replace function public.fn_chu_tra_loi_yeu_cau(p_id uuid, p_chap_nhan boolean, p_tien_phong int default null, p_ly_do text default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap(); y yeu_cau_dat_phong; v_tien int; v_id uuid;
begin
  select * into y from yeu_cau_dat_phong where id = p_id for update;
  if not found or not exists (select 1 from can where id = y.can_id and nguoi_giu = v_me) then
    raise exception 'Không tìm thấy yêu cầu' using errcode = '42501';
  end if;
  if y.trang_thai = 'cho' and y.het_han_luc <= now() then
    update yeu_cau_dat_phong set trang_thai = 'het_han', tra_loi_luc = now() where id = p_id;
    return jsonb_build_object('id', p_id, 'trang_thai', 'het_han');
  end if;
  if y.trang_thai <> 'cho' then raise exception 'Yêu cầu này đã được trả lời' using errcode = 'P0001'; end if;
  if not p_chap_nhan then
    -- p_ly_do: một trong ba mã 'da_co_khach', 'dang_sua_phong', 'ly_do_khac' (ba chip ở CN9-02), hoặc chữ tự do
    update yeu_cau_dat_phong set trang_thai = 'tu_choi', tra_loi_luc = now(),
           ly_do_ma = case when p_ly_do in ('da_co_khach', 'dang_sua_phong', 'ly_do_khac') then p_ly_do else 'ly_do_khac' end,
           ly_do_tu_choi = case p_ly_do when 'da_co_khach' then 'Đã có khách đặt' when 'dang_sua_phong' then 'Đang sửa phòng'
                                        when 'ly_do_khac' then 'Lý do khác' else p_ly_do end
     where id = p_id;
    return jsonb_build_object('id', p_id, 'trang_thai', 'tu_choi');
  end if;
  v_tien := coalesce(p_tien_phong, tien_phong_goi_y(y.can_id, lower(y.dem), upper(y.dem)));
  if v_tien is null then raise exception 'Cần nhập tiền phòng' using errcode = 'P0001'; end if;
  begin
    insert into booking (can_id, dem, nguon, chu_nha_id, sale_id, yeu_cau_id, tien_phong, trang_thai_tien, gio_nhan, gio_tra, created_by)
    select y.can_id, y.dem, 'tu_yeu_cau', v_me, y.sale_id, y.id, v_tien, 'chua_coc', pr.gio_nhan, pr.gio_tra, v_me
      from profiles pr where pr.id = v_me
    returning id into v_id;
  exception when exclusion_violation then
    raise exception '%', dich_loi_trung() using errcode = 'P0001';
  end;
  update yeu_cau_dat_phong set trang_thai = 'chap_nhan', tra_loi_luc = now() where id = p_id;
  perform ghi_booking_dem(v_id);
  perform tu_choi_yeu_cau_trung(y.can_id, y.dem);
  insert into booking_rieng (booking_id, nguoi, ten_khach, sdt_khach, so_khach, tien_thu_khach)
  select v_id, y.sale_id, ten_khach, sdt_khach, so_khach, tien_thu_khach from yeu_cau_rieng where yeu_cau_id = y.id;
  update can set lich_cap_nhat_luc = now() where id = y.can_id;
  return jsonb_build_object('id', p_id, 'trang_thai', 'chap_nhan', 'booking_id', v_id);
end $$;

-- Sale ghi booking đã chốt cho căn tự nhập của mình. Chỉ chặn trùng trong chính căn đó (QT1.3).
create or replace function public.fn_sale_ghi_tu_nhap(p jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_me uuid := can_dang_nhap();
  v_can uuid := (p->>'can_id')::uuid;
  v_client uuid := nullif(p->>'client_id', '')::uuid;
  v_id uuid;
begin
  if not exists (select 1 from can where id = v_can and nguoi_giu = v_me and loai = 'tu_nhap') then
    raise exception 'Không tìm thấy căn tự nhập của bạn' using errcode = '42501';
  end if;
  if v_client is not null then
    select id into v_id from booking where client_id = v_client;
    if found then return jsonb_build_object('id', v_id, 'trung_lan_gui', true); end if;
  end if;
  if (p->>'tien_phong') is null then raise exception 'Cần nhập tiền trả chủ' using errcode = 'P0001'; end if;
  begin
    insert into booking (can_id, dem, nguon, chu_nha_id, sale_id, client_id, tien_phong, created_by)
    values (v_can, daterange((p->>'ngay_nhan')::date, (p->>'ngay_tra')::date), 'sale_tu_ghi', v_me, v_me, v_client,
            (p->>'tien_phong')::int, v_me)
    returning id into v_id;
  exception when exclusion_violation then
    raise exception '%', dich_loi_trung() using errcode = 'P0001';
  end;
  perform ghi_booking_dem(v_id);
  insert into booking_rieng (booking_id, nguoi, ten_khach, sdt_khach, so_khach, tien_thu_khach)
  values (v_id, v_me, p->'khach'->>'ten', p->'khach'->>'sdt', (p->'khach'->>'so_khach')::smallint, (p->>'tien_thu_khach')::int);
  return jsonb_build_object('id', v_id);
end $$;

-- Sale sửa booking mình ghi cho căn tự nhập: ngày, tiền trả chủ, tiền thu khách, khách
create or replace function public.fn_sale_sua_tu_nhap(p_id uuid, p jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap(); b booking;
begin
  select * into b from booking where id = p_id and nguon = 'sale_tu_ghi' and created_by = v_me for update;
  if not found then raise exception 'Không tìm thấy đặt phòng của bạn' using errcode = '42501'; end if;
  begin
    update booking set dem = daterange(coalesce((p->>'ngay_nhan')::date, lower(dem)), coalesce((p->>'ngay_tra')::date, upper(dem))),
                       tien_phong = coalesce((p->>'tien_phong')::int, tien_phong), updated_at = now()
     where id = p_id;
  exception when exclusion_violation then
    raise exception '%', dich_loi_trung() using errcode = 'P0001';
  end;
  perform ghi_booking_dem(p_id);
  if p ? 'tien_thu_khach' or p ? 'khach' then
    update booking_rieng set tien_thu_khach = coalesce((p->>'tien_thu_khach')::int, tien_thu_khach),
           ten_khach = case when p ? 'khach' then p->'khach'->>'ten' else ten_khach end,
           sdt_khach = case when p ? 'khach' then p->'khach'->>'sdt' else sdt_khach end,
           so_khach = case when p ? 'khach' then (p->'khach'->>'so_khach')::smallint else so_khach end
     where booking_id = p_id and nguoi = v_me;
  end if;
end $$;

create or replace function public.fn_sale_xoa_tu_nhap(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap();
begin
  delete from booking where id = p_id and nguon = 'sale_tu_ghi' and created_by = v_me;
  if not found then raise exception 'Không tìm thấy đặt phòng của bạn' using errcode = '42501'; end if;
end $$;

-- Xin hủy booking đã chấp nhận: chủ nhà hoặc sale của booking (QD-012)
create or replace function public.fn_xin_huy(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap(); b booking;
begin
  select * into b from booking where id = p_id for update;
  if not found or v_me not in (b.chu_nha_id, coalesce(b.sale_id, b.chu_nha_id)) then
    raise exception 'Không tìm thấy đặt phòng của bạn' using errcode = '42501';
  end if;
  if b.sale_id is null or b.nguon = 'sale_tu_ghi' then raise exception 'Đặt phòng này không cần xin hủy' using errcode = 'P0001'; end if;
  if b.trang_thai <> 'hieu_luc' then raise exception 'Đặt phòng đang chờ hủy hoặc đã hủy' using errcode = 'P0001'; end if;
  if b.tu_choi_huy_luc is not null then raise exception 'Đã bị từ chối hủy, không xin hủy lại được' using errcode = 'P0001'; end if;
  update booking set trang_thai = 'cho_huy', xin_huy_boi = v_me, xin_huy_luc = now(), updated_at = now() where id = p_id;
end $$;

-- Bên còn lại đồng ý hay từ chối hủy. Đồng ý thì "Đã hủy", các đêm trống lại. Từ chối thì giữ nguyên, ghi "Bị từ chối hủy".
create or replace function public.fn_tra_loi_huy(p_id uuid, p_dong_y boolean) returns void
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap(); b booking;
begin
  select * into b from booking where id = p_id for update;
  if not found or b.trang_thai <> 'cho_huy' or v_me not in (b.chu_nha_id, b.sale_id) then
    raise exception 'Không có lời xin hủy nào chờ bạn' using errcode = 'P0001';
  end if;
  if v_me = b.xin_huy_boi then raise exception 'Người kia phải trả lời lời xin hủy của bạn' using errcode = '42501'; end if;
  if p_dong_y then
    update booking set trang_thai = 'da_huy', updated_at = now() where id = p_id;
  else
    update booking set trang_thai = 'hieu_luc', tu_choi_huy_luc = now(), updated_at = now() where id = p_id;
  end if;
end $$;

-- Ghi hay sửa phần riêng của mình trên một booking: khách, và với sale là tiền thu khách.
create or replace function public.fn_ghi_khach(p_booking uuid, p jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap(); b booking;
begin
  select * into b from booking where id = p_booking;
  if not found or v_me not in (b.chu_nha_id, coalesce(b.sale_id, b.chu_nha_id)) then
    raise exception 'Không tìm thấy đặt phòng của bạn' using errcode = '42501';
  end if;
  insert into booking_rieng (booking_id, nguoi, ten_khach, sdt_khach, so_khach, tien_thu_khach)
  values (p_booking, v_me, p->>'ten', p->>'sdt', (p->>'so_khach')::smallint,
          case when v_me = b.sale_id then (p->>'tien_thu_khach')::int end)
  on conflict (booking_id, nguoi) do update set ten_khach = excluded.ten_khach, sdt_khach = excluded.sdt_khach,
    so_khach = excluded.so_khach, tien_thu_khach = coalesce(excluded.tien_thu_khach, booking_rieng.tien_thu_khach);
end $$;

-- ---------- Đọc dành cho sale (view) ----------
-- Sale KHÔNG đọc thẳng bảng booking: bảng có tiền cọc, khách, tên sale khác. Sale đọc qua hai view dưới,
-- mỗi view chỉ có đúng các cột sale được thấy. View không bật security_invoker để chạy với quyền chủ view,
-- nên điều kiện quyền phải viết ngay trong WHERE (dòng có chú thích "QUYỀN").

-- Lịch trống, đã đặt của căn được chia sẻ: chỉ căn và đêm, không có ai đặt (QD-007)
create view public.v_lich_sale as
  select b.can_id, b.dem
    from public.booking b
   where b.trang_thai <> 'da_huy'
     and b.can_id in (select public.my_shared_can_ids());          -- QUYỀN
comment on view public.v_lich_sale is 'Sale xem đêm nào đã kín của căn được chia sẻ. Không có cột nào khác.';

-- Booking của chính sale: kể cả khi chủ đã ngừng cho xem (QD-007) hay đã xóa tài khoản (QD-013).
-- Tình trạng cọc chỉ là đã cọc hay chưa, và chỉ khi chủ bật quyền. Không có số tiền cọc.
create view public.v_booking_cua_sale as
  select b.id, b.can_id, b.dem, b.nguon, b.chu_nha_id, b.tien_phong, r.tien_thu_khach,
         r.tien_thu_khach - b.tien_phong as tien_chenh,
         case when coalesce(k.quyen_tinh_trang_coc, true) then b.trang_thai_tien in ('da_coc_con_thu', 'da_thanh_toan') end as da_coc,
         b.trang_thai, b.xin_huy_boi, b.tu_choi_huy_luc is not null as bi_tu_choi_huy, b.created_at
    from public.booking b
    left join public.ket_noi k on k.chu_nha_id = b.chu_nha_id and k.sale_id = b.sale_id
    left join public.booking_rieng r on r.booking_id = b.id and r.nguoi = b.sale_id
   where b.sale_id = (select auth.uid());                          -- QUYỀN
comment on view public.v_booking_cua_sale is 'Booking của chính sale đang đăng nhập. Không có tiền cọc, không có khách của chủ nhà.';

revoke all on public.v_lich_sale, public.v_booking_cua_sale from anon;

-- ---------- Phân quyền (RLS) ----------
alter table public.booking enable row level security;
alter table public.booking_dem enable row level security;
alter table public.booking_rieng enable row level security;
alter table public.yeu_cau_rieng enable row level security;
alter table public.yeu_cau_dat_phong enable row level security;

-- Bảng booking đầy đủ: chỉ người giữ căn (chủ nhà, hoặc sale với căn tự nhập của mình) và quản trị
create policy booking_read on public.booking for select to authenticated
  using (can_id in (select public.my_own_can_ids()) or (select public.is_admin()));
create policy booking_dem_read on public.booking_dem for select to authenticated
  using (booking_id in (select id from public.booking));
create policy booking_rieng_read on public.booking_rieng for select to authenticated
  using (nguoi = (select auth.uid()) or (select public.is_admin()));
create policy yeu_cau_rieng_read on public.yeu_cau_rieng for select to authenticated
  using (yeu_cau_id in (select id from public.yeu_cau_dat_phong where sale_id = (select auth.uid())) or (select public.is_admin()));
create policy yeu_cau_read on public.yeu_cau_dat_phong for select to authenticated
  using (sale_id = (select auth.uid()) or can_id in (select public.my_own_can_ids()) or (select public.is_admin()));

revoke execute on function public.fn_chu_ghi_booking(jsonb), public.fn_chu_sua_booking(uuid, jsonb), public.fn_chu_xoa_booking(uuid),
  public.fn_chu_thu_du(uuid), public.fn_chu_hoan_tac_thu_du(uuid),
  public.fn_sale_gui_yeu_cau(jsonb), public.fn_sale_huy_yeu_cau(uuid), public.fn_chu_tra_loi_yeu_cau(uuid, boolean, int, text),
  public.fn_sale_ghi_tu_nhap(jsonb), public.fn_sale_sua_tu_nhap(uuid, jsonb), public.fn_sale_xoa_tu_nhap(uuid),
  public.fn_xin_huy(uuid), public.fn_tra_loi_huy(uuid, boolean), public.fn_ghi_khach(uuid, jsonb),
  public.tien_phong_goi_y(uuid, date, date)
  from public, anon;
