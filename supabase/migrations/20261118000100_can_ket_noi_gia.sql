-- =====================================================================================
-- 20261118000100_can_ket_noi_gia.sql · Căn, kết nối chủ nhà và sale, link mời, giá theo tháng
-- Vì sao: QD-005 (vai theo quan hệ), QD-007 (sale thấy gì), QD-008 (link mời), QD-009 (căn tự nhập)
-- Thay đổi: toa_nha, can, anh_can, ket_noi, ket_noi_can, sale_them_tay, link_moi, link_moi_can, link_xin_lich,
--           gia_thang, gia_dip, ngay_le, muc_cong; bucket Storage anh-can;
--           my_own_can_ids, my_shared_can_ids, my_visible_can_ids, gia_dem, gia_ban_dem;
--           căn: fn_tao_can, fn_sua_can, fn_an_can, fn_them_toa_nha, fn_dang_ky_anh, fn_gan_anh_can;
--           giá: fn_dat_gia_thang, fn_dat_gia_nhieu_can, fn_luu_gia_dip, fn_xoa_gia_dip, fn_sao_chep_gia, fn_dat_muc_cong, fn_sale_gia;
--           kết nối: fn_tao_link_moi, fn_lay_link_moi, fn_tao_link_gui_lich, fn_dem_gui_link, fn_thu_hoi_link_moi, fn_xem_link_moi,
--           fn_them_lich_tu_link, fn_lay_link_xin_lich, fn_dem_gui_xin_lich, fn_xem_link_xin_lich, fn_chu_dong_y_xin_lich,
--           fn_chu_them_sale_tay, fn_chu_xoa_sale_tay, fn_chu_doi_quyen_sale, fn_chu_ngung_sale, fn_sale_bo_nguon
-- Tương thích ngược: chỉ thêm
-- Kiểm thử: tests/db/t_01_phan_quyen.sql, t_02_gia.sql, t_06_link_moi.sql
-- =====================================================================================

create table public.toa_nha (
  id uuid primary key default gen_random_uuid(),
  ten text not null unique check (char_length(ten) between 1 and 100),
  khu_vuc text,
  tao_boi uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- Một bảng cho căn của chủ nhà, căn của sale (sale cũng là người giữ căn) và căn tự nhập.
create table public.can (
  id uuid primary key default gen_random_uuid(),
  nguoi_giu uuid not null references public.profiles(id),
  loai text not null default 'co_lich' check (loai in ('co_lich', 'tu_nhap')),
  ma_can text not null check (char_length(ma_can) between 1 and 50),
  so_phong_ngu smallint not null check (so_phong_ngu between 0 and 4),   -- 0 là Studio, 4 là 4PN+
  so_giuong smallint check (so_giuong between 1 and 50),
  loai_view text check (loai_view in ('bien', 'thanh_pho', 'nui')),
  toa_nha_id uuid references public.toa_nha(id),
  mo_ta_gui_khach text check (char_length(mo_ta_gui_khach) <= 2000),
  -- Chỉ căn tự nhập: thông tin chủ ngoài đời, chỉ sale đã nhập thấy (QD-009, QD-011)
  ten_chu_can text check (char_length(ten_chu_can) <= 100),
  sdt_chu_can text check (sdt_chu_can ~ '^\+?[0-9]{9,15}$'),
  gia_chu_thuong integer check (gia_chu_thuong > 0),
  gia_chu_cuoi_tuan integer check (gia_chu_cuoi_tuan > 0),
  an_luc timestamptz,                    -- chủ xóa căn: chỉ ẩn, booking và thống kê còn (mục "Xóa căn" (US1))
  lich_cap_nhat_luc timestamptz not null default now(),
  created_at timestamptz not null default now(),
  check (loai = 'tu_nhap' or (ten_chu_can is null and sdt_chu_can is null and gia_chu_thuong is null and gia_chu_cuoi_tuan is null)),
  check (loai = 'co_lich' or ten_chu_can is not null)
);
create unique index can_ma_theo_nguoi_giu on public.can (nguoi_giu, lower(ma_can)) where an_luc is null;

-- Một dòng cho một cặp chủ nhà và sale.
create table public.ket_noi (
  id uuid primary key default gen_random_uuid(),
  chu_nha_id uuid not null references public.profiles(id),
  sale_id uuid not null references public.profiles(id),
  trang_thai text not null default 'da_ket_noi' check (trang_thai in ('da_ket_noi', 'chu_ngung', 'sale_bo')),
  nguon text not null check (nguon in ('link_moi', 'sale_xin', 'chu_gui_lich', 'chu_them_tay')),
  pham_vi text not null default 'tat_ca_can' check (pham_vi in ('tat_ca_can', 'chon_can')),
  quyen_tinh_trang_coc boolean not null default true,   -- sale thấy booking của mình đã cọc hay chưa, không bao giờ thấy số tiền cọc
  ket_noi_luc timestamptz not null default now(),
  unique (chu_nha_id, sale_id),
  check (chu_nha_id <> sale_id)
);
create index ket_noi_sale_idx on public.ket_noi (sale_id) where trang_thai = 'da_ket_noi';

create table public.ket_noi_can (
  ket_noi_id uuid not null references public.ket_noi(id) on delete cascade,
  can_id uuid not null references public.can(id),
  primary key (ket_noi_id, can_id)
);

-- Link mời của chủ nhà: ai mở cũng được, sale phải tự bấm "Thêm lịch" (QD-008).
create table public.link_moi (
  ma text primary key default encode(extensions.gen_random_bytes(12), 'hex'),
  chu_nha_id uuid not null references public.profiles(id),
  loai text not null default 'moi_sale' check (loai in ('moi_sale', 'gui_lich')),   -- gui_lich: chỉ các căn trong link_moi_can (mục "Chủ nhà chủ động gửi lịch cho sale" (US26))
  het_han_luc timestamptz not null default now() + interval '21 days',
  thu_hoi_luc timestamptz,
  so_lan_gui integer not null default 0,     -- app đếm mỗi lần mở bảng chia sẻ hay sao chép; app không biết gửi cho ai
  gui_cuoi_luc timestamptz,
  created_at timestamptz not null default now()
);
create table public.link_moi_can (
  ma text not null references public.link_moi(ma) on delete cascade,
  can_id uuid not null references public.can(id),
  primary key (ma, can_id)
);

-- Link xin lịch của sale: mỗi sale đúng một link, gửi cho nhiều chủ nhà (mục "Sale xin chủ nhà cho xem lịch" (US17)). Mã ngẫu nhiên, không chứa số điện thoại.
create table public.link_xin_lich (
  ma text primary key default encode(extensions.gen_random_bytes(12), 'hex'),
  sale_id uuid not null unique references public.profiles(id),
  so_lan_gui integer not null default 0,
  gui_cuoi_luc timestamptz,
  created_at timestamptz not null default now()
);

-- Sale chủ nhà thêm tay bằng tên và số, chưa dùng app: nhóm "Chưa kết nối" ở CN7 (mục "Chủ nhà quản lý danh sách sale" (US5)). Chỉ chủ nhà đó thấy.
create table public.sale_them_tay (
  id uuid primary key default gen_random_uuid(),
  chu_nha_id uuid not null references public.profiles(id),
  ten text not null check (char_length(ten) between 1 and 100),
  sdt text check (sdt ~ '^\+?[0-9]{9,15}$'),
  created_at timestamptz not null default now()
);

-- Ảnh căn. File nằm ở bucket riêng tư "anh-can" của Storage, đường dẫn <id người tải>/<tên file>.
-- Ảnh tải lên ngay khi chọn (HV3), lúc đó căn có thể chưa có, nên can_id trống cho tới khi gắn.
create table public.anh_can (
  id uuid primary key default gen_random_uuid(),
  nguoi_tai uuid not null references public.profiles(id),
  can_id uuid references public.can(id),
  duong_dan text not null unique,
  thu_tu smallint,                           -- 1 là ảnh đại diện
  created_at timestamptz not null default now()
);
create index anh_can_can_idx on public.anh_can (can_id, thu_tu);

-- Giá chủ nhà theo tháng. Không có dòng nghĩa là "Chưa đặt".
create table public.gia_thang (
  can_id uuid not null references public.can(id),
  thang date not null check (extract(day from thang) = 1),
  gia_ngay_thuong integer not null check (gia_ngay_thuong > 0),
  gia_cuoi_tuan integer not null check (gia_cuoi_tuan > 0),
  primary key (can_id, thang)
);

-- Giá riêng cho một dải ngày: ngày lễ hoặc dịp đặc biệt. Đêm trong dải dùng giá dải, không dùng giá tháng (mục "Giá ngày lễ và dịp đặc biệt" (US8)).
-- dai là [ngày đầu, ngày cuối + 1). Hai dải của một căn không được có ngày chung: chặn ở database.
create table public.gia_dip (
  id uuid primary key default gen_random_uuid(),
  can_id uuid not null references public.can(id),
  ten text not null check (char_length(ten) between 1 and 100),
  la_ngay_le boolean not null default false,
  dai daterange not null check (lower_inc(dai) and not upper_inc(dai) and not isempty(dai) and upper(dai) - lower(dai) <= 10),
  gia_moi_dem integer not null check (gia_moi_dem > 0),
  constraint gia_dip_khong_chong exclude using gist (can_id with =, dai with &&)
);

-- Dải nghỉ lễ hằng năm do Home247 đặt sẵn, chủ nhà chọn nhanh ở CN6-02 (mục "Giá ngày lễ và dịp đặc biệt" (US8), mục "Quản trị dải ngày lễ hằng năm" (US23))
create table public.ngay_le (
  id uuid primary key default gen_random_uuid(),
  nam smallint not null,
  ten text not null check (char_length(ten) between 1 and 100),
  ngay_dau date not null,
  ngay_cuoi date not null check (ngay_cuoi >= ngay_dau),
  unique (nam, ten)
);

-- Mức cộng riêng của một sale cho một căn: tiền cộng MỖI ĐÊM vào giá chủ nhà (mục "Chi tiết căn và giá bán" (US13)). Chỉ sale đó đọc được.
create table public.muc_cong (
  sale_id uuid not null references public.profiles(id),
  can_id uuid not null references public.can(id),
  so_tien integer not null check (so_tien >= 0),
  primary key (sale_id, can_id)
);

-- ---------- Hàm quyền ----------
-- Dùng trong policy dạng `can_id in (select my_..._can_ids())` để Postgres tính MỘT LẦN mỗi truy vấn (QUY_TRINH 7.3).

-- Căn mình giữ (chủ nhà với căn của mình, sale với căn của mình và căn tự nhập)
create or replace function public.my_own_can_ids() returns setof uuid
language sql stable security definer set search_path = public as $$
  select id from can where nguoi_giu = (select auth.uid())
$$;

-- Căn người khác chia sẻ cho mình: kết nối còn hiệu lực, căn chưa ẩn, chủ chưa xóa tài khoản.
-- Đây là chỗ DUY NHẤT quyết định sale thấy căn nào. Mọi policy và view của sale đi qua hàm này.
create or replace function public.my_shared_can_ids() returns setof uuid
language sql stable security definer set search_path = public as $$
  select c.id
    from ket_noi k
    join can c on c.nguoi_giu = k.chu_nha_id and c.loai = 'co_lich' and c.an_luc is null
    join profiles p on p.id = k.chu_nha_id and p.da_xoa_luc is null
   where k.sale_id = (select auth.uid())
     and k.trang_thai = 'da_ket_noi'
     and (k.pham_vi = 'tat_ca_can' or exists (select 1 from ket_noi_can kc where kc.ket_noi_id = k.id and kc.can_id = c.id))
$$;

create or replace function public.my_visible_can_ids() returns setof uuid
language sql stable security definer set search_path = public as $$
  select id from can where (select public.is_admin())
  union select public.my_own_can_ids()
  union select public.my_shared_can_ids()
$$;

-- Giá chủ nhà của một đêm theo bảng giá: đêm có thứ nằm trong dem_cuoi_tuan của người giữ căn thì giá cuối tuần.
-- Trả null khi tháng đó chưa đặt giá. Dùng nội bộ, không kiểm quyền.
-- Thứ tự: giá dịp chứa đêm đó, rồi giá tháng. Căn tự nhập: giá chủ sale đã nhập cho căn.
create or replace function public.gia_dem(p_can uuid, p_dem date) returns integer
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select d.gia_moi_dem from gia_dip d where d.can_id = c.id and d.dai @> p_dem),
    case when c.loai = 'tu_nhap' then
           case when extract(dow from p_dem)::smallint = any (p.dem_cuoi_tuan) then coalesce(c.gia_chu_cuoi_tuan, c.gia_chu_thuong) else c.gia_chu_thuong end
         when extract(dow from p_dem)::smallint = any (p.dem_cuoi_tuan) then g.gia_cuoi_tuan
         else g.gia_ngay_thuong end)
    from can c
    join profiles p on p.id = c.nguoi_giu
    left join gia_thang g on g.can_id = c.id and g.thang = date_trunc('month', p_dem)::date
   where c.id = p_can
$$;

-- Giá bán một đêm của sale đang đăng nhập = giá chủ nhà + mức cộng của sale cho căn đó (không có thì mức mặc định).
-- Bật làm tròn thì làm tròn LÊN bội số 50.000đ từng đêm (giả định GD13). Null khi đêm chưa có giá.
create or replace function public.gia_ban_dem(p_can uuid, p_dem date) returns integer
language sql stable security definer set search_path = public as $$
  select case when cd.lam_tron then (ceil(x.gia / 50000.0) * 50000)::int else x.gia end
    from (select gia_dem(p_can, p_dem)
                 + coalesce((select so_tien from muc_cong where sale_id = (select auth.uid()) and can_id = p_can),
                            (select muc_cong_mac_dinh from cai_dat_rieng where user_id = (select auth.uid())), 0) as gia) x,
         (select coalesce((select lam_tron_50k from cai_dat_rieng where user_id = (select auth.uid())), false) as lam_tron) cd
$$;
revoke execute on function public.gia_ban_dem(uuid, date) from public, anon, authenticated;
revoke execute on function public.gia_dem(uuid, date) from public, anon, authenticated;

-- ---------- Hàm ghi ----------

create or replace function public.fn_tao_can(p jsonb) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap(); v_id uuid; v_loai text := coalesce(p->>'loai', 'co_lich');
begin
  if coalesce(btrim(p->>'ma_can'), '') = '' then raise exception 'Mã căn không được trống' using errcode = 'P0001'; end if;
  if char_length(btrim(p->>'ma_can')) > 50 then raise exception 'Mã căn dài quá 50 ký tự' using errcode = 'P0001'; end if;
  if (p->>'so_phong_ngu') is null then raise exception 'Cần chọn số phòng ngủ' using errcode = 'P0001'; end if;
  if v_loai = 'tu_nhap' and coalesce(btrim(p->>'ten_chu_can'), '') = '' then
    raise exception 'Căn tự nhập cần tên chủ căn' using errcode = 'P0001';
  end if;
  if v_loai = 'tu_nhap' and coalesce(btrim(p->>'sdt_chu_can'), '') = '' then
    raise exception 'Căn tự nhập cần số điện thoại chủ căn' using errcode = 'P0001';
  end if;
  if v_loai = 'co_lich' and (p ? 'ten_chu_can' or p ? 'sdt_chu_can' or p ? 'gia_chu_thuong' or p ? 'gia_chu_cuoi_tuan') then
    raise exception 'Căn có lịch không có thông tin chủ căn tự nhập' using errcode = 'P0001';
  end if;
  insert into can (nguoi_giu, loai, ma_can, so_phong_ngu, so_giuong, loai_view, toa_nha_id, mo_ta_gui_khach,
                   ten_chu_can, sdt_chu_can, gia_chu_thuong, gia_chu_cuoi_tuan)
  values (v_me, v_loai, btrim(p->>'ma_can'), (p->>'so_phong_ngu')::smallint, (p->>'so_giuong')::smallint, p->>'loai_view',
          (p->>'toa_nha_id')::uuid, p->>'mo_ta_gui_khach',
          nullif(btrim(p->>'ten_chu_can'), ''), nullif(btrim(p->>'sdt_chu_can'), ''),
          (p->>'gia_chu_thuong')::int, (p->>'gia_chu_cuoi_tuan')::int)
  returning id into v_id;
  if p ? 'anh_ids' then
    perform fn_gan_anh_can(v_id, array(select x::uuid from jsonb_array_elements_text(p->'anh_ids') x));
  end if;
  return v_id;
exception when unique_violation then
  raise exception 'Đã có căn %. Kiểm tra lại mã căn.', btrim(p->>'ma_can') using errcode = 'P0001';
end $$;

-- Sửa thông tin căn mình giữ. Chỉ ghi ô có trong p. Ô nhận: ma_can, so_phong_ngu, so_giuong, loai_view, toa_nha_id,
-- mo_ta_gui_khach, anh_ids (thay cả danh sách ảnh, phần tử đầu là ảnh đại diện); căn tự nhập thêm ten_chu_can,
-- sdt_chu_can, gia_chu_thuong, gia_chu_cuoi_tuan.
create or replace function public.fn_sua_can(p_can uuid, p jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap(); c can;
begin
  select * into c from can where id = p_can and nguoi_giu = v_me and an_luc is null for update;
  if not found then raise exception 'Không tìm thấy căn của bạn' using errcode = '42501'; end if;
  if p ? 'ma_can' and coalesce(btrim(p->>'ma_can'), '') = '' then raise exception 'Mã căn không được trống' using errcode = 'P0001'; end if;
  if c.loai = 'co_lich' and (p ? 'ten_chu_can' or p ? 'sdt_chu_can' or p ? 'gia_chu_thuong' or p ? 'gia_chu_cuoi_tuan') then
    raise exception 'Căn có lịch không có thông tin chủ căn tự nhập' using errcode = 'P0001';
  end if;
  if c.loai = 'tu_nhap' and p ? 'ten_chu_can' and coalesce(btrim(p->>'ten_chu_can'), '') = '' then
    raise exception 'Căn tự nhập cần tên chủ căn' using errcode = 'P0001';
  end if;
  update can set
    ma_can = coalesce(nullif(btrim(p->>'ma_can'), ''), ma_can),
    so_phong_ngu = coalesce((p->>'so_phong_ngu')::smallint, so_phong_ngu),
    so_giuong = case when p ? 'so_giuong' then (p->>'so_giuong')::smallint else so_giuong end,
    loai_view = case when p ? 'loai_view' then p->>'loai_view' else loai_view end,
    toa_nha_id = case when p ? 'toa_nha_id' then (p->>'toa_nha_id')::uuid else toa_nha_id end,
    mo_ta_gui_khach = case when p ? 'mo_ta_gui_khach' then nullif(p->>'mo_ta_gui_khach', '') else mo_ta_gui_khach end,
    ten_chu_can = case when p ? 'ten_chu_can' then btrim(p->>'ten_chu_can') else ten_chu_can end,
    sdt_chu_can = case when p ? 'sdt_chu_can' then nullif(btrim(p->>'sdt_chu_can'), '') else sdt_chu_can end,   -- xóa số thì không còn giữ số (mục "Thêm căn tự nhập" (US16))
    gia_chu_thuong = case when p ? 'gia_chu_thuong' then (p->>'gia_chu_thuong')::int else gia_chu_thuong end,
    gia_chu_cuoi_tuan = case when p ? 'gia_chu_cuoi_tuan' then (p->>'gia_chu_cuoi_tuan')::int else gia_chu_cuoi_tuan end
  where id = p_can;
  if p ? 'anh_ids' then
    perform fn_gan_anh_can(p_can, array(select x::uuid from jsonb_array_elements_text(p->'anh_ids') x));
  end if;
exception when unique_violation then
  raise exception 'Đã có căn %. Kiểm tra lại mã căn.', btrim(p->>'ma_can') using errcode = 'P0001';
end $$;

-- Ghi nhận một ảnh vừa tải lên Storage (đường dẫn phải nằm trong thư mục của chính mình). Trả id ảnh tạm.
create or replace function public.fn_dang_ky_anh(p_duong_dan text) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap(); v_id uuid;
begin
  if split_part(p_duong_dan, '/', 1) <> v_me::text then raise exception 'Đường dẫn ảnh không thuộc về bạn' using errcode = '42501'; end if;
  insert into anh_can (nguoi_tai, duong_dan) values (v_me, p_duong_dan) returning id into v_id;
  return v_id;
end $$;

-- Gắn danh sách ảnh vào căn theo thứ tự (tối đa 12, phần tử đầu là ảnh đại diện). Ảnh cũ của căn không có trong
-- danh sách thì bỏ khỏi căn và xóa dòng; file trong Storage do việc dọn định kỳ xóa.
create or replace function public.fn_gan_anh_can(p_can uuid, p_anh_ids uuid[]) returns void
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap();
begin
  if not exists (select 1 from can where id = p_can and nguoi_giu = v_me) then raise exception 'Không tìm thấy căn của bạn' using errcode = '42501'; end if;
  if coalesce(array_length(p_anh_ids, 1), 0) > 12 then raise exception 'Mỗi căn tối đa 12 ảnh' using errcode = 'P0001'; end if;
  if (select count(distinct x) from unnest(p_anh_ids) x) <> coalesce(array_length(p_anh_ids, 1), 0) then
    raise exception 'Danh sách ảnh bị trùng' using errcode = 'P0001';
  end if;
  if exists (select 1 from unnest(p_anh_ids) x
              where not exists (select 1 from anh_can a where a.id = x and a.nguoi_tai = v_me and (a.can_id is null or a.can_id = p_can))) then
    raise exception 'Có ảnh không phải của bạn hoặc đã gắn vào căn khác' using errcode = '42501';
  end if;
  delete from anh_can where can_id = p_can and not (id = any (coalesce(p_anh_ids, '{}')));
  update anh_can a set can_id = p_can, thu_tu = o.stt
    from unnest(p_anh_ids) with ordinality o(id, stt) where a.id = o.id;
end $$;

-- Thêm tòa mới vào danh sách chung, không cần duyệt (mục "Thêm căn" (US1)). Trùng tên (không kể hoa thường) thì trả tòa đã có.
create or replace function public.fn_them_toa_nha(p_ten text) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap(); v_id uuid; v_ten text := btrim(coalesce(p_ten, ''));
begin
  if v_ten = '' or char_length(v_ten) > 100 then raise exception 'Tên tòa từ 1 đến 100 ký tự' using errcode = 'P0001'; end if;
  select id into v_id from toa_nha where lower(ten) = lower(v_ten);
  if found then return v_id; end if;
  insert into toa_nha (ten, tao_boi) values (v_ten, v_me) returning id into v_id;
  return v_id;
end $$;

-- Ẩn căn (xóa căn của chủ nhà): booking và thống kê còn nguyên
create or replace function public.fn_an_can(p_can uuid) returns void
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap();
begin
  if not exists (select 1 from can where id = p_can and nguoi_giu = v_me and an_luc is null) then
    raise exception 'Không tìm thấy căn của bạn' using errcode = '42501';
  end if;
  -- Còn booking chưa tới ngày trả, hoặc yêu cầu đang chờ: không xóa (mục "Xóa căn" (US1)). can_con_dat_phong ở migration booking.
  if can_con_dat_phong(p_can) then raise exception 'Căn còn đặt phòng sắp tới' using errcode = 'P0001'; end if;
  update can set an_luc = now() where id = p_can;
end $$;

-- Đặt giá cho một hay nhiều tháng của một căn mình giữ
create or replace function public.fn_dat_gia_thang(p_can uuid, p_thangs date[], p_thuong int, p_cuoi_tuan int) returns void
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap(); m date;
begin
  if not exists (select 1 from can where id = p_can and nguoi_giu = v_me and loai = 'co_lich') then
    raise exception 'Bạn không đặt giá được cho căn này' using errcode = '42501';
  end if;
  if coalesce(p_thuong, 0) <= 0 or coalesce(p_cuoi_tuan, 0) <= 0 then raise exception 'Giá phải lớn hơn 0' using errcode = 'P0001'; end if;
  foreach m in array p_thangs loop
    insert into gia_thang (can_id, thang, gia_ngay_thuong, gia_cuoi_tuan)
    values (p_can, date_trunc('month', m)::date, p_thuong, p_cuoi_tuan)
    on conflict (can_id, thang) do update set gia_ngay_thuong = excluded.gia_ngay_thuong, gia_cuoi_tuan = excluded.gia_cuoi_tuan;
  end loop;
  update can set lich_cap_nhat_luc = now() where id = p_can;
end $$;

-- Đặt giá tháng cho nhiều căn mình giữ một lần (mục "Đặt giá nhiều căn" (US7))
create or replace function public.fn_dat_gia_nhieu_can(p_cans uuid[], p_thangs date[], p_thuong int, p_cuoi_tuan int) returns void
language plpgsql security definer set search_path = public as $$
declare c uuid;
begin
  if coalesce(array_length(p_cans, 1), 0) = 0 then raise exception 'Chưa chọn căn nào' using errcode = 'P0001'; end if;
  foreach c in array p_cans loop perform fn_dat_gia_thang(c, p_thangs, p_thuong, p_cuoi_tuan); end loop;
end $$;

-- Thêm hay sửa một dải giá dịp (mục "Giá ngày lễ và dịp đặc biệt" (US8)). p: id (khi sửa), ten, la_ngay_le, ngay_dau, ngay_cuoi, gia_moi_dem.
-- Bỏ trống tên thì đặt "Dịp đặc biệt <ngày đầu> – <ngày cuối>". Dài hơn 10 ngày hay chồng ngày dải khác thì từ chối.
create or replace function public.fn_luu_gia_dip(p_can uuid, p jsonb) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_me uuid := can_dang_nhap(); v_id uuid := nullif(p->>'id', '')::uuid;
  v_dau date := (p->>'ngay_dau')::date; v_cuoi date := (p->>'ngay_cuoi')::date;
  v_ten text := nullif(btrim(coalesce(p->>'ten', '')), '');
begin
  if not exists (select 1 from can where id = p_can and nguoi_giu = v_me and loai = 'co_lich') then
    raise exception 'Bạn không đặt giá được cho căn này' using errcode = '42501';
  end if;
  if v_dau is null or v_cuoi is null or v_cuoi < v_dau then raise exception 'Ngày cuối phải từ ngày đầu trở đi' using errcode = 'P0001'; end if;
  if v_cuoi - v_dau + 1 > 10 then raise exception 'Một dải tối đa 10 ngày' using errcode = 'P0001'; end if;
  if coalesce((p->>'gia_moi_dem')::int, 0) <= 0 then raise exception 'Giá phải lớn hơn 0' using errcode = 'P0001'; end if;
  v_ten := coalesce(v_ten, 'Dịp đặc biệt ' || to_char(v_dau, 'DD/MM') || ' – ' || to_char(v_cuoi, 'DD/MM'));
  begin
    if v_id is null then
      insert into gia_dip (can_id, ten, la_ngay_le, dai, gia_moi_dem)
      values (p_can, v_ten, coalesce((p->>'la_ngay_le')::boolean, false), daterange(v_dau, v_cuoi + 1), (p->>'gia_moi_dem')::int)
      returning id into v_id;
    else
      update gia_dip set ten = v_ten, la_ngay_le = coalesce((p->>'la_ngay_le')::boolean, la_ngay_le),
                         dai = daterange(v_dau, v_cuoi + 1), gia_moi_dem = (p->>'gia_moi_dem')::int
       where id = v_id and can_id = p_can;
      if not found then raise exception 'Không tìm thấy dải giá' using errcode = '42501'; end if;
    end if;
  exception when exclusion_violation then
    raise exception 'Dải này trùng ngày với một dải giá khác của căn' using errcode = 'P0001';
  end;
  update can set lich_cap_nhat_luc = now() where id = p_can;
  return v_id;
end $$;

create or replace function public.fn_xoa_gia_dip(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap();
begin
  delete from gia_dip d using can c where d.id = p_id and c.id = d.can_id and c.nguoi_giu = v_me;
  if not found then raise exception 'Không tìm thấy dải giá' using errcode = '42501'; end if;
end $$;

-- Sao chép giá từ một căn sang các căn khác của mình (mục "Sao chép giá sang căn khác" (US7)). p_phan gồm: 'thang', 'ngay_le', 'dip'.
-- Tháng nguồn có giá thì thay giá tháng đó ở đích; tháng nguồn chưa đặt thì giữ giá đích.
-- Dải nguồn trùng đúng ngày một dải đích thì thay giá và tên; chồng ngày mà không trùng đúng thì giữ dải đích, bỏ dải nguồn;
-- dải đích mà nguồn không có thì giữ nguyên.
create or replace function public.fn_sao_chep_gia(p_nguon uuid, p_dichs uuid[], p_phan text[]) returns void
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap(); c uuid;
begin
  if coalesce(array_length(p_dichs, 1), 0) = 0 then raise exception 'Chọn căn để sao chép' using errcode = 'P0001'; end if;
  if exists (select 1 from unnest(array_append(p_dichs, p_nguon)) x
              where not exists (select 1 from can where id = x and nguoi_giu = v_me and loai = 'co_lich' and an_luc is null)) then
    raise exception 'Chỉ sao chép giữa các căn của bạn' using errcode = '42501';
  end if;
  foreach c in array p_dichs loop
    continue when c = p_nguon;
    if 'thang' = any (p_phan) then
      insert into gia_thang (can_id, thang, gia_ngay_thuong, gia_cuoi_tuan)
      select c, thang, gia_ngay_thuong, gia_cuoi_tuan from gia_thang where can_id = p_nguon
      on conflict (can_id, thang) do update set gia_ngay_thuong = excluded.gia_ngay_thuong, gia_cuoi_tuan = excluded.gia_cuoi_tuan;
    end if;
    if 'ngay_le' = any (p_phan) or 'dip' = any (p_phan) then
      update gia_dip d set gia_moi_dem = n.gia_moi_dem, ten = n.ten
        from gia_dip n
       where d.can_id = c and n.can_id = p_nguon and d.dai = n.dai and d.la_ngay_le = n.la_ngay_le
         and ((n.la_ngay_le and 'ngay_le' = any (p_phan)) or (not n.la_ngay_le and 'dip' = any (p_phan)));
      insert into gia_dip (can_id, ten, la_ngay_le, dai, gia_moi_dem)
      select c, n.ten, n.la_ngay_le, n.dai, n.gia_moi_dem from gia_dip n
       where n.can_id = p_nguon
         and ((n.la_ngay_le and 'ngay_le' = any (p_phan)) or (not n.la_ngay_le and 'dip' = any (p_phan)))
         and not exists (select 1 from gia_dip d where d.can_id = c and d.dai && n.dai);
    end if;
    update can set lich_cap_nhat_luc = now() where id = c;
  end loop;
end $$;

-- Sale đặt mức cộng riêng cho một căn được chia sẻ hay căn của mình. p_so_tien null là bỏ mức riêng, dùng mức mặc định.
create or replace function public.fn_dat_muc_cong(p_can uuid, p_so_tien int) returns void
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap();
begin
  if p_can not in (select my_shared_can_ids() union select my_own_can_ids()) then
    raise exception 'Bạn không được xem căn này' using errcode = '42501';
  end if;
  if p_so_tien is null then delete from muc_cong where sale_id = v_me and can_id = p_can; return; end if;
  if p_so_tien < 0 then raise exception 'Mức cộng không được âm' using errcode = 'P0001'; end if;
  insert into muc_cong (sale_id, can_id, so_tien) values (v_me, p_can, p_so_tien)
  on conflict (sale_id, can_id) do update set so_tien = excluded.so_tien;
end $$;

-- Giá chủ nhà và giá bán từng đêm của một căn cho sale đang đăng nhập (S3, S3-02). Đêm chưa đặt giá thì giá null,
-- và tổng cũng null. Chỉ căn được chia sẻ hoặc căn của mình.
create or replace function public.fn_sale_gia(p_can uuid, p_nhan date, p_tra date) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap(); r jsonb;
begin
  if p_can not in (select my_shared_can_ids() union select my_own_can_ids()) then
    raise exception 'Bạn không được xem căn này' using errcode = '42501';
  end if;
  if p_tra <= p_nhan then raise exception 'Ngày trả phải sau ngày nhận' using errcode = 'P0001'; end if;
  select jsonb_build_object(
           'dem', jsonb_agg(jsonb_build_object('dem', d::date, 'gia_chu', gia_dem(p_can, d::date), 'gia_ban', gia_ban_dem(p_can, d::date)) order by d),
           'tong_gia_chu', case when bool_and(gia_dem(p_can, d::date) is not null) then sum(gia_dem(p_can, d::date)) end,
           'tong_gia_ban', case when bool_and(gia_dem(p_can, d::date) is not null) then sum(gia_ban_dem(p_can, d::date)) end)
    into r from generate_series(p_nhan, p_tra - 1, interval '1 day') d;
  return r;
end $$;

-- ---------- Link mời, link gửi lịch (chủ nhà) ----------

-- Tạo một link mời mới cho mọi căn của mình
create or replace function public.fn_tao_link_moi() returns text
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap(); v text;
begin
  insert into link_moi (chu_nha_id) values (v_me) returning ma into v;
  return v;
end $$;

-- Lấy link mời đang dùng nếu còn hạn, không thì tạo mới (nút "Gửi link mời", "Sao chép link" ở CN7)
create or replace function public.fn_lay_link_moi() returns text
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap(); v text;
begin
  select ma into v from link_moi
   where chu_nha_id = v_me and loai = 'moi_sale' and thu_hoi_luc is null and het_han_luc > now()
   order by created_at desc limit 1;
  if v is null then v := fn_tao_link_moi(); end if;
  return v;
end $$;

-- Link gửi lịch các căn đã chọn (CN10, mục "Chủ nhà chủ động gửi lịch cho sale" (US26)): sale mở link chỉ được các căn này
create or replace function public.fn_tao_link_gui_lich(p_can_ids uuid[]) returns text
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap(); v text;
begin
  if coalesce(array_length(p_can_ids, 1), 0) = 0 then raise exception 'Chưa chọn căn nào' using errcode = 'P0001'; end if;
  if exists (select 1 from unnest(p_can_ids) x
              where not exists (select 1 from can where id = x and nguoi_giu = v_me and loai = 'co_lich' and an_luc is null)) then
    raise exception 'Chỉ gửi được lịch căn của bạn' using errcode = '42501';
  end if;
  insert into link_moi (chu_nha_id, loai) values (v_me, 'gui_lich') returning ma into v;
  insert into link_moi_can (ma, can_id) select v, x from unnest(p_can_ids) x group by x;
  return v;
end $$;

-- Đếm một lần mở bảng chia sẻ hay sao chép link. App không biết đã gửi cho ai.
create or replace function public.fn_dem_gui_link(p_ma text) returns void
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap();
begin
  update link_moi set so_lan_gui = so_lan_gui + 1, gui_cuoi_luc = now() where ma = p_ma and chu_nha_id = v_me;
  if not found then raise exception 'Không tìm thấy link của bạn' using errcode = '42501'; end if;
end $$;

create or replace function public.fn_thu_hoi_link_moi(p_ma text) returns void
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap();
begin
  update link_moi set thu_hoi_luc = now() where ma = p_ma and chu_nha_id = v_me and thu_hoi_luc is null;
  if not found then raise exception 'Không tìm thấy link của bạn' using errcode = '42501'; end if;
end $$;

-- Màn Thêm lịch: ai có link cũng xem được, kể cả chưa đăng nhập. KHÔNG có giá (QD-008, QD-007).
-- Link gửi lịch chỉ hiện các căn đã chọn. da_them: người đang đăng nhập đã có đủ các căn này chưa (A10-01).
create or replace function public.fn_xem_link_moi(p_ma text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare l link_moi; v_ten text; v_me uuid := (select auth.uid()); k ket_noi;
begin
  select * into l from link_moi where ma = p_ma;
  if not found or l.thu_hoi_luc is not null then raise exception 'Link mời không còn dùng được' using errcode = 'P0001'; end if;
  if l.het_han_luc < now() then raise exception 'Link mời đã hết hạn' using errcode = 'P0001'; end if;
  select ten into v_ten from profiles where id = l.chu_nha_id and da_xoa_luc is null;
  if not found then raise exception 'Link mời không còn dùng được' using errcode = 'P0001'; end if;
  if v_me is not null then select * into k from ket_noi where chu_nha_id = l.chu_nha_id and sale_id = v_me; end if;
  return jsonb_build_object(
    'chu_nha', v_ten,
    'loai', l.loai,
    'da_them', coalesce(k.trang_thai = 'da_ket_noi' and (k.pham_vi = 'tat_ca_can' or (l.loai = 'gui_lich' and not exists (
                 select 1 from link_moi_can lc where lc.ma = l.ma
                    and not exists (select 1 from ket_noi_can kc where kc.ket_noi_id = k.id and kc.can_id = lc.can_id)))), false),
    'can', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'ma_can', ma_can, 'so_phong_ngu', so_phong_ngu,
                                                        'so_giuong', so_giuong, 'loai_view', loai_view) order by ma_can)
                       from can where nguoi_giu = l.chu_nha_id and loai = 'co_lich' and an_luc is null
                        and (l.loai = 'moi_sale' or id in (select can_id from link_moi_can where ma = l.ma))), '[]'::jsonb));
end $$;

-- Sale bấm "Thêm lịch". Link mời: được mọi căn (căn mới tự thêm, mục "Căn mới của chủ nhà tự hiện cho sale" (US6)). Link gửi lịch: chỉ các căn của link.
-- Đã có đủ rồi thì báo, không nhân đôi (A10-01).
create or replace function public.fn_them_lich_tu_link(p_ma text) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap(); l link_moi; k ket_noi; v_id uuid; v_xem jsonb;
begin
  v_xem := fn_xem_link_moi(p_ma);                        -- cùng luật hết hạn, thu hồi
  select * into l from link_moi where ma = p_ma;
  if l.chu_nha_id = v_me then raise exception 'Đây là link mời của chính bạn' using errcode = 'P0001'; end if;
  select * into k from ket_noi where chu_nha_id = l.chu_nha_id and sale_id = v_me for update;
  if found and k.trang_thai = 'chu_ngung' then raise exception 'Chủ nhà đã ngừng cho bạn xem lịch' using errcode = '42501'; end if;
  if (v_xem->>'da_them')::boolean then raise exception 'Bạn đã thêm lịch của chủ nhà này rồi' using errcode = 'P0001'; end if;
  if l.loai = 'moi_sale' then
    if found then
      update ket_noi set trang_thai = 'da_ket_noi', nguon = 'link_moi', pham_vi = 'tat_ca_can', ket_noi_luc = now() where id = k.id returning id into v_id;
      delete from ket_noi_can where ket_noi_id = v_id;
    else
      insert into ket_noi (chu_nha_id, sale_id, nguon) values (l.chu_nha_id, v_me, 'link_moi') returning id into v_id;
    end if;
  else
    if found then
      update ket_noi set trang_thai = 'da_ket_noi', ket_noi_luc = now(),
                         pham_vi = case when k.trang_thai = 'da_ket_noi' then pham_vi else 'chon_can' end,
                         nguon = case when k.trang_thai = 'da_ket_noi' then nguon else 'chu_gui_lich' end
       where id = k.id returning id into v_id;
      if k.trang_thai <> 'da_ket_noi' then delete from ket_noi_can where ket_noi_id = v_id; end if;
    else
      insert into ket_noi (chu_nha_id, sale_id, nguon, pham_vi) values (l.chu_nha_id, v_me, 'chu_gui_lich', 'chon_can') returning id into v_id;
    end if;
    insert into ket_noi_can (ket_noi_id, can_id)
    select v_id, lc.can_id from link_moi_can lc join can c on c.id = lc.can_id and c.an_luc is null where lc.ma = l.ma
    on conflict do nothing;
  end if;
  return v_id;
end $$;

-- ---------- Link xin lịch (sale) ----------

-- Mỗi sale một link, tạo khi cần
create or replace function public.fn_lay_link_xin_lich() returns text
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap(); v text;
begin
  select ma into v from link_xin_lich where sale_id = v_me;
  if v is null then insert into link_xin_lich (sale_id) values (v_me) returning ma into v; end if;
  return v;
end $$;

create or replace function public.fn_dem_gui_xin_lich() returns void
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap();
begin
  update link_xin_lich set so_lan_gui = so_lan_gui + 1, gui_cuoi_luc = now() where sale_id = v_me;
end $$;

-- Chủ nhà mở link xin lịch (A8): thấy tên và số của sale. Cần đăng nhập, vì trả số điện thoại.
-- Sale đã xóa tài khoản, hoặc đã bị chính chủ nhà này ngừng: không dùng được, không trả tên hay số (A8-01).
create or replace function public.fn_xem_link_xin_lich(p_ma text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap(); l link_xin_lich; pr profiles; k ket_noi;
begin
  select * into l from link_xin_lich where ma = p_ma;
  if not found then raise exception 'Link không còn dùng được' using errcode = 'P0001'; end if;
  if l.sale_id = v_me then raise exception 'Đây là link xin lịch của chính bạn' using errcode = 'P0001'; end if;
  select * into pr from profiles where id = l.sale_id;
  if pr.da_xoa_luc is not null then raise exception 'Link không còn dùng được' using errcode = 'P0001'; end if;
  select * into k from ket_noi where chu_nha_id = v_me and sale_id = l.sale_id;
  if found and k.trang_thai = 'chu_ngung' then raise exception 'Link không còn dùng được' using errcode = 'P0001'; end if;
  return jsonb_build_object('sale_id', pr.id, 'ten', pr.ten, 'sdt', pr.sdt, 'da_ket_noi', coalesce(k.trang_thai = 'da_ket_noi', false));
end $$;

-- Chủ nhà bấm "Đồng ý cho xem lịch" ở A8. p: pham_vi ('tat_ca_can' mặc định, hoặc 'chon_can' kèm can_ids),
-- quyen_tinh_trang_coc (mặc định bật). Không có quyền giá: sale luôn thấy giá căn được chia sẻ (QD-007).
create or replace function public.fn_chu_dong_y_xin_lich(p_ma text, p jsonb default '{}'::jsonb) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap(); v_xem jsonb := fn_xem_link_xin_lich(p_ma); v_sale uuid := (v_xem->>'sale_id')::uuid; v_id uuid;
begin
  insert into ket_noi (chu_nha_id, sale_id, nguon, pham_vi, quyen_tinh_trang_coc)
  values (v_me, v_sale, 'sale_xin', coalesce(p->>'pham_vi', 'tat_ca_can'), coalesce((p->>'quyen_tinh_trang_coc')::boolean, true))
  on conflict (chu_nha_id, sale_id) do update set trang_thai = 'da_ket_noi', nguon = 'sale_xin', pham_vi = excluded.pham_vi,
    quyen_tinh_trang_coc = excluded.quyen_tinh_trang_coc, ket_noi_luc = now()
  returning id into v_id;
  delete from ket_noi_can where ket_noi_id = v_id;
  if coalesce(p->>'pham_vi', 'tat_ca_can') = 'chon_can' then
    insert into ket_noi_can (ket_noi_id, can_id)
    select v_id, c.id from can c where c.nguoi_giu = v_me and c.loai = 'co_lich' and c.an_luc is null
       and c.id in (select x::uuid from jsonb_array_elements_text(p->'can_ids') x);
    if not found then raise exception 'Chưa chọn căn nào' using errcode = 'P0001'; end if;
  end if;
  return v_id;
end $$;

-- ---------- Chủ nhà quản lý sale ----------

create or replace function public.fn_chu_them_sale_tay(p_ten text, p_sdt text default null) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap(); v_id uuid; v_sdt text := nullif(regexp_replace(coalesce(p_sdt, ''), '[\s.-]', '', 'g'), '');
begin
  if coalesce(btrim(p_ten), '') = '' then raise exception 'Cần nhập tên sale' using errcode = 'P0001'; end if;
  if v_sdt is not null and v_sdt !~ '^\+?[0-9]{9,15}$' then raise exception 'Số điện thoại không đúng' using errcode = 'P0001'; end if;
  insert into sale_them_tay (chu_nha_id, ten, sdt) values (v_me, btrim(p_ten), v_sdt) returning id into v_id;
  return v_id;
end $$;

create or replace function public.fn_chu_xoa_sale_tay(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap();
begin
  delete from sale_them_tay where id = p_id and chu_nha_id = v_me;
  if not found then raise exception 'Không tìm thấy' using errcode = '42501'; end if;
end $$;

-- Đổi phạm vi chia sẻ và quyền tình trạng cọc cho một sale đang kết nối. Có tác dụng ngay ở lần đọc sau của sale.
create or replace function public.fn_chu_doi_quyen_sale(p_sale uuid, p jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap(); v_id uuid;
begin
  update ket_noi set pham_vi = coalesce(p->>'pham_vi', pham_vi),
                     quyen_tinh_trang_coc = coalesce((p->>'quyen_tinh_trang_coc')::boolean, quyen_tinh_trang_coc)
   where chu_nha_id = v_me and sale_id = p_sale and trang_thai = 'da_ket_noi' returning id into v_id;
  if v_id is null then raise exception 'Sale này không đang kết nối với bạn' using errcode = 'P0001'; end if;
  if p ? 'can_ids' then
    delete from ket_noi_can where ket_noi_id = v_id;
    insert into ket_noi_can (ket_noi_id, can_id)
    select v_id, c.id from can c where c.nguoi_giu = v_me and c.loai = 'co_lich' and c.an_luc is null
       and c.id in (select x::uuid from jsonb_array_elements_text(p->'can_ids') x);
  end if;
end $$;

-- Chủ nhà ngừng cho một sale xem: sale mất lịch và giá, vẫn xem được booking cũ của mình (QD-007)
create or replace function public.fn_chu_ngung_sale(p_sale uuid) returns void
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap();
begin
  update ket_noi set trang_thai = 'chu_ngung' where chu_nha_id = v_me and sale_id = p_sale and trang_thai = 'da_ket_noi';
  if not found then raise exception 'Sale này không đang kết nối với bạn' using errcode = 'P0001'; end if;
end $$;

-- Sale bỏ một nguồn phòng (S6-04), hoặc bỏ dòng chủ nhà đã xóa tài khoản khỏi danh sách (S6-08). Booking cũ vẫn còn.
create or replace function public.fn_sale_bo_nguon(p_chu uuid) returns void
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap();
begin
  update ket_noi set trang_thai = 'sale_bo' where sale_id = v_me and chu_nha_id = p_chu and trang_thai = 'da_ket_noi';
  if not found then raise exception 'Bạn không đang kết nối với chủ nhà này' using errcode = 'P0001'; end if;
end $$;

-- ---------- Phân quyền (RLS) ----------
alter table public.toa_nha enable row level security;
alter table public.can enable row level security;
alter table public.ket_noi enable row level security;
alter table public.ket_noi_can enable row level security;
alter table public.link_moi enable row level security;
alter table public.gia_thang enable row level security;
alter table public.gia_dip enable row level security;
alter table public.ngay_le enable row level security;
alter table public.muc_cong enable row level security;
alter table public.anh_can enable row level security;
alter table public.link_moi_can enable row level security;
alter table public.link_xin_lich enable row level security;
alter table public.sale_them_tay enable row level security;

create policy toa_nha_read on public.toa_nha for select to authenticated using (true);

-- Căn: người giữ, sale được chia sẻ, quản trị. Cột ten_chu_can, sdt_chu_can chỉ có ở căn tự nhập, mà căn tự nhập
-- không bao giờ nằm trong my_shared_can_ids (chỉ lấy loai = 'co_lich'), nên chỉ sale đã nhập đọc được.
create policy can_read on public.can for select to authenticated using (id in (select public.my_visible_can_ids()));

-- Giá chủ nhà: căn đã chia sẻ cho sale nào thì sale đó luôn thấy giá (QD-007). Khách không bao giờ thấy:
-- vai anon không có policy nào ở bảng này.
create policy gia_read on public.gia_thang for select to authenticated using (can_id in (select public.my_visible_can_ids()));

create policy gia_dip_read on public.gia_dip for select to authenticated using (can_id in (select public.my_visible_can_ids()));
create policy ngay_le_read on public.ngay_le for select to authenticated using (true);
-- Mức cộng: chỉ sale đó. Chủ nhà và quản trị cũng không đọc (PQ11).
create policy muc_cong_read on public.muc_cong for select to authenticated using (sale_id = (select auth.uid()));
-- Ảnh: người tải, và ai xem được căn của ảnh
create policy anh_can_read on public.anh_can for select to authenticated
  using (nguoi_tai = (select auth.uid()) or can_id in (select public.my_visible_can_ids()));
create policy link_moi_can_read on public.link_moi_can for select to authenticated using (ma in (select ma from public.link_moi));
create policy link_xin_lich_read on public.link_xin_lich for select to authenticated using (sale_id = (select auth.uid()));
create policy sale_them_tay_read on public.sale_them_tay for select to authenticated using (chu_nha_id = (select auth.uid()));

create policy ket_noi_read on public.ket_noi for select to authenticated
  using (chu_nha_id = (select auth.uid()) or sale_id = (select auth.uid()) or (select public.is_admin()));
create policy ket_noi_can_read on public.ket_noi_can for select to authenticated
  using (ket_noi_id in (select id from public.ket_noi));
create policy link_moi_read on public.link_moi for select to authenticated
  using (chu_nha_id = (select auth.uid()) or (select public.is_admin()));

-- Hồ sơ: chính mình, quản trị, và người có kết nối với mình (kể cả kết nối đã ngừng: sale vẫn thấy tên chủ trên booking cũ)
create or replace function public.my_contact_ids() returns setof uuid
language sql stable security definer set search_path = public as $$
  select sale_id from ket_noi where chu_nha_id = (select auth.uid())
  union select chu_nha_id from ket_noi where sale_id = (select auth.uid())
$$;
create policy profiles_read on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()) or id in (select public.my_contact_ids()));

revoke execute on function
  public.fn_tao_can(jsonb), public.fn_sua_can(uuid, jsonb), public.fn_an_can(uuid), public.fn_them_toa_nha(text),
  public.fn_dang_ky_anh(text), public.fn_gan_anh_can(uuid, uuid[]),
  public.fn_dat_gia_thang(uuid, date[], int, int), public.fn_dat_gia_nhieu_can(uuid[], date[], int, int),
  public.fn_luu_gia_dip(uuid, jsonb), public.fn_xoa_gia_dip(uuid), public.fn_sao_chep_gia(uuid, uuid[], text[]),
  public.fn_dat_muc_cong(uuid, int), public.fn_sale_gia(uuid, date, date),
  public.fn_tao_link_moi(), public.fn_lay_link_moi(), public.fn_tao_link_gui_lich(uuid[]), public.fn_dem_gui_link(text),
  public.fn_thu_hoi_link_moi(text), public.fn_them_lich_tu_link(text),
  public.fn_lay_link_xin_lich(), public.fn_dem_gui_xin_lich(), public.fn_xem_link_xin_lich(text), public.fn_chu_dong_y_xin_lich(text, jsonb),
  public.fn_chu_them_sale_tay(text, text), public.fn_chu_xoa_sale_tay(uuid), public.fn_chu_doi_quyen_sale(uuid, jsonb),
  public.fn_chu_ngung_sale(uuid), public.fn_sale_bo_nguon(uuid)
  from public, anon;
grant execute on function public.fn_xem_link_moi(text) to anon, authenticated;

-- ---------- Storage: bucket riêng tư cho ảnh căn ----------
-- Tải lên: chỉ vào thư mục mang id của chính mình. Đọc: file của mình, hoặc ảnh đã gắn vào căn mình xem được.
-- App đọc ảnh bằng URL có chữ ký (createSignedUrl), hết hạn sau 1 giờ. Vai anon không đọc được ảnh nào.
insert into storage.buckets (id, name, public) values ('anh-can', 'anh-can', false) on conflict (id) do nothing;
create policy anh_can_tai_len on storage.objects for insert to authenticated
  with check (bucket_id = 'anh-can' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy anh_can_doc on storage.objects for select to authenticated
  using (bucket_id = 'anh-can' and ((storage.foldername(name))[1] = (select auth.uid())::text
         or name in (select duong_dan from public.anh_can where can_id in (select public.my_visible_can_ids()))));
create policy anh_can_xoa on storage.objects for delete to authenticated
  using (bucket_id = 'anh-can' and (storage.foldername(name))[1] = (select auth.uid())::text);
