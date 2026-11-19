-- EN2 · Database nền: bảng và ràng buộc (thiet-ke-db.md mục 1, 2, 3).
-- Đọc qua RLS (file _quyen), ghi qua hàm fn_* tự kiểm người gọi (thêm ở các US sau). Tiền là bigint đồng.
-- Ngày nghiệp vụ theo giờ Việt Nam. Một lần ở là daterange nửa mở [ngày nhận, ngày trả) (QT5.1).

create extension if not exists btree_gist with schema extensions;

-- ===== Người dùng =====

-- YC1, QD5, QD13: một hồ sơ cho mỗi người đăng nhập; vai_chon chỉ để chọn màn mở đầu.
create table public.profiles (
  id uuid primary key references auth.users (id),
  ten text,
  ten_hien_thi text,
  anh_dai_dien text,
  so_dien_thoai text,
  vai_chon text check (vai_chon in ('chu_nha', 'sale')),
  dong_y_dieu_khoan_luc timestamptz,
  gio_nhan time default '14:00',
  gio_tra time default '12:00',
  -- QT5.1, YC4.6: đêm cuối tuần theo isodow (5 = đêm thứ Sáu, 6 = đêm thứ Bảy), ít nhất một đêm.
  dem_cuoi_tuan smallint[] not null default '{5,6}',
  mo_app_luc timestamptz,
  da_xoa_luc timestamptz,
  tao_luc timestamptz not null default now(),
  sua_luc timestamptz not null default now(),
  constraint profiles_dem_cuoi_tuan_hop_le check (
    cardinality(dem_cuoi_tuan) >= 1 and dem_cuoi_tuan <@ '{1,2,3,4,5,6,7}'::smallint[]
  ),
  -- KT-DB.3.9, QD13: đã xóa tài khoản thì không còn số điện thoại.
  constraint profiles_xoa_tai_khoan_bo_so check (da_xoa_luc is null or so_dien_thoai is null)
);

-- QD16 mục 1, PQ11: cài đặt chỉ mình mình thấy (mức cộng mặc định, làm tròn, mẫu tin, loại thông báo đã tắt).
create table public.cai_dat_rieng (
  nguoi_id uuid primary key references public.profiles (id),
  muc_cong_mac_dinh bigint not null default 0 check (muc_cong_mac_dinh >= 0),
  lam_tron_50k boolean not null default false,
  mau_tin text,
  thong_bao_tat text[] not null default '{}',
  sua_luc timestamptz not null default now()
);

-- YC13, QD16 mục 6, KT-DB.3.12: danh sách quản trị viên; chỉ một quản trị viên đầu tiên.
create table public.admins (
  email text primary key,
  nguoi_id uuid references auth.users (id),
  la_goc boolean not null default false,
  them_luc timestamptz not null default now()
);
create unique index admins_mot_goc on public.admins (la_goc) where la_goc;

-- ===== Căn =====

-- YC3.4, YC13: tên tòa không trùng, không phân biệt hoa thường (giả định GD21).
create table public.toa_nha (
  id uuid primary key default gen_random_uuid(),
  ten text not null check (btrim(ten) <> ''),
  home247_dat_san boolean not null default false,
  tao_boi uuid references public.profiles (id),
  tao_luc timestamptz not null default now()
);
create unique index toa_nha_ten_khong_trung on public.toa_nha (lower(btrim(ten)));

-- YC3, YC10, QD5: một bảng cho căn có lịch (của chủ nhà hay của sale) và căn sale tự nhập.
-- Xóa căn có lịch là ẩn căn (an_luc); dữ liệu cũ giữ nguyên (YC3.6).
create table public.can (
  id uuid primary key default gen_random_uuid(),
  nguoi_giu uuid not null references public.profiles (id),
  loai text not null default 'co_lich' check (loai in ('co_lich', 'tu_nhap')),
  ma_can text not null check (btrim(ma_can) <> ''),
  so_phong_ngu smallint,
  so_giuong smallint,
  loai_view text,
  toa_nha_id uuid references public.toa_nha (id),
  mo_ta text,
  chu_can_ten text,
  chu_can_sdt text,
  gia_chu_thuong bigint check (gia_chu_thuong > 0),
  gia_chu_cuoi_tuan bigint check (gia_chu_cuoi_tuan > 0),
  an_luc timestamptz,
  lich_doi_luc timestamptz not null default now(),
  client_id uuid,
  tao_luc timestamptz not null default now(),
  constraint can_client_id_khong_trung unique (nguoi_giu, client_id)
);
-- YC3.2: một người giữ không có hai căn chưa xóa cùng mã (bỏ khoảng trắng đầu cuối, không phân biệt hoa thường).
create unique index can_ma_khong_trung on public.can (nguoi_giu, lower(btrim(ma_can))) where an_luc is null;

-- YC3.3, QT5.7: ảnh tạm có can_id null cho tới khi gắn vào căn.
create table public.anh_can (
  id uuid primary key default gen_random_uuid(),
  can_id uuid references public.can (id) on delete cascade,
  nguoi_tai uuid not null references public.profiles (id),
  duong_dan text not null unique,
  thu_tu smallint,
  tao_luc timestamptz not null default now()
);
create index anh_can_can on public.anh_can (can_id, thu_tu);

-- ===== Kết nối chủ nhà và sale =====

-- YC6, QD7, QD8: mỗi cặp chủ nhà và sale tối đa một kết nối. Không có công tắc giá; chỉ có xem_coc.
create table public.ket_noi (
  id uuid primary key default gen_random_uuid(),
  chu_id uuid not null references public.profiles (id),
  sale_id uuid not null references public.profiles (id),
  trang_thai text not null default 'chua_ket_noi'
    check (trang_thai in ('chua_ket_noi', 'da_ket_noi', 'chu_ngung', 'sale_bo')),
  nguon text not null check (nguon in ('link_moi', 'sale_xin', 'gui_lich', 'them_tay')),
  pham_vi text not null default 'tat_ca' check (pham_vi in ('tat_ca', 'chon_can')),
  xem_coc boolean not null default true,
  tao_luc timestamptz not null default now(),
  sua_luc timestamptz not null default now(),
  constraint ket_noi_mot_cap unique (chu_id, sale_id),
  constraint ket_noi_hai_nguoi check (chu_id <> sale_id)
);
create index ket_noi_sale on public.ket_noi (sale_id);

-- YC6.6: căn được chọn khi pham_vi = 'chon_can'.
create table public.ket_noi_can (
  ket_noi_id uuid not null references public.ket_noi (id) on delete cascade,
  can_id uuid not null references public.can (id),
  primary key (ket_noi_id, can_id)
);

-- YC6.3, QD8, QT5.9: link mời sale và link gửi lịch của chủ nhà; hạn 21 ngày, thu hồi được.
create table public.link_moi (
  id uuid primary key default gen_random_uuid(),
  ma text not null unique,
  loai text not null check (loai in ('moi_sale', 'gui_lich')),
  chu_id uuid not null references public.profiles (id),
  het_han_luc timestamptz not null default (now() + interval '21 days'),
  thu_hoi_luc timestamptz,
  so_lan_gui integer not null default 0,
  gui_cuoi_luc timestamptz,
  tao_luc timestamptz not null default now()
);

create table public.link_moi_can (
  link_id uuid not null references public.link_moi (id) on delete cascade,
  can_id uuid not null references public.can (id),
  primary key (link_id, can_id)
);

-- YC6.4, QT5.9: mỗi sale một link xin lịch.
create table public.link_xin_lich (
  id uuid primary key default gen_random_uuid(),
  ma text not null unique,
  sale_id uuid not null unique references public.profiles (id),
  so_lan_gui integer not null default 0,
  gui_cuoi_luc timestamptz,
  tao_luc timestamptz not null default now()
);

-- YC6.2: sale chủ nhà thêm tay; chỉ chủ nhà đó đọc.
create table public.sale_them_tay (
  id uuid primary key default gen_random_uuid(),
  chu_id uuid not null references public.profiles (id),
  ten text not null,
  so_dien_thoai text,
  tao_luc timestamptz not null default now()
);

-- ===== Giá =====

-- YC4.2: giá tháng; thang là ngày 1 của tháng.
create table public.gia_thang (
  can_id uuid not null references public.can (id),
  thang date not null check (extract(day from thang) = 1),
  gia_thuong bigint not null check (gia_thuong > 0),
  gia_cuoi_tuan bigint not null check (gia_cuoi_tuan > 0),
  sua_luc timestamptz not null default now(),
  primary key (can_id, thang)
);

-- YC4.3: giá dịp theo dải ngày (tối đa 10 ngày); hai dải của một căn không chồng ngày.
create table public.gia_dip (
  id uuid primary key default gen_random_uuid(),
  can_id uuid not null references public.can (id),
  tu_ngay date not null,
  den_ngay date not null,
  ten text,
  gia bigint not null check (gia > 0),
  la_ngay_le boolean not null default false,
  sua_luc timestamptz not null default now(),
  constraint gia_dip_dai_hop_le check (den_ngay >= tu_ngay and den_ngay - tu_ngay <= 9),
  constraint gia_dip_khong_chong exclude using gist (
    can_id with =, daterange(tu_ngay, den_ngay, '[]') with &&
  )
);

-- YC4.3, YC13.2: dải ngày lễ chung theo năm; quản trị viên nhập (QD16 mục 9).
create table public.ngay_le (
  id uuid primary key default gen_random_uuid(),
  nam integer not null,
  ten text not null,
  tu_ngay date not null,
  den_ngay date not null check (den_ngay >= tu_ngay)
);

-- YC7.5, PQ11: mức cộng riêng từng căn của sale.
create table public.muc_cong (
  sale_id uuid not null references public.profiles (id),
  can_id uuid not null references public.can (id),
  muc bigint not null check (muc >= 0),
  sua_luc timestamptz not null default now(),
  primary key (sale_id, can_id)
);

-- ===== Yêu cầu đặt phòng =====

-- YC9: phần chủ nhà và sale cùng thấy. Giá bán nằm ở yeu_cau_rieng (KT-DB.3.6, QD11).
create table public.yeu_cau_dat_phong (
  id uuid primary key default gen_random_uuid(),
  can_id uuid not null references public.can (id),
  sale_id uuid not null references public.profiles (id),
  ngay_nhan date not null,
  ngay_tra date not null,
  dem daterange generated always as (daterange(ngay_nhan, ngay_tra, '[)')) stored,
  loi_nhan text check (char_length(loi_nhan) <= 500),
  gia_chu_dem bigint[],
  trang_thai text not null default 'cho'
    check (trang_thai in ('cho', 'da_chot', 'bi_tu_choi', 'da_huy', 'het_han')),
  ly_do_tu_choi text,
  gui_luc timestamptz not null default now(),
  han_luc timestamptz not null default (now() + interval '14 days'),
  tra_loi_luc timestamptz,
  booking_id uuid,
  client_id uuid,
  constraint yeu_cau_ngay_hop_le check (ngay_tra > ngay_nhan),
  constraint yeu_cau_client_id_khong_trung unique (sale_id, client_id)
);
create index yeu_cau_can on public.yeu_cau_dat_phong (can_id, trang_thai);

-- YC9, QD11: phần riêng của sale trong yêu cầu.
create table public.yeu_cau_rieng (
  yeu_cau_id uuid primary key references public.yeu_cau_dat_phong (id) on delete cascade,
  sale_id uuid not null references public.profiles (id),
  gia_ban_dem bigint[],
  ten_khach text,
  sdt_khach text
);

-- ===== Booking =====

-- YC5, QD6, QD12, KT-DB.3.2: phần mọi bên cùng thấy. Khách và tiền thu khách ở booking_rieng.
create table public.booking (
  id uuid primary key default gen_random_uuid(),
  can_id uuid not null references public.can (id),
  ngay_nhan date not null,
  ngay_tra date not null,
  dem daterange generated always as (daterange(ngay_nhan, ngay_tra, '[)')) stored,
  nguon text not null check (nguon in ('chu_ghi', 'tu_yeu_cau', 'sale_tu_ghi')),
  sale_id uuid references public.profiles (id),
  tao_boi uuid not null references public.profiles (id),
  tien_phong bigint not null check (tien_phong >= 0),
  trang_thai_tien text check (trang_thai_tien in ('chua_coc', 'da_coc', 'da_thanh_toan')),
  tien_coc bigint check (tien_coc >= 0),
  trang_thai text not null default 'hieu_luc' check (trang_thai in ('hieu_luc', 'da_huy')),
  huy_xin_boi uuid references public.profiles (id),
  huy_xin_luc timestamptz,
  huy_tra_loi text check (huy_tra_loi in ('dong_y', 'tu_choi')),
  huy_tra_loi_boi uuid references public.profiles (id),
  huy_tra_loi_luc timestamptz,
  yeu_cau_id uuid references public.yeu_cau_dat_phong (id),
  client_id uuid,
  tao_luc timestamptz not null default now(),
  sua_luc timestamptz not null default now(),
  constraint booking_ngay_hop_le check (ngay_tra > ngay_nhan),
  constraint booking_client_id_khong_trung unique (tao_boi, client_id),
  -- QD6, QT1.1, QT1.2, QT1.3: hai booking chưa hủy của cùng căn không có chung đêm.
  constraint booking_khong_trung exclude using gist (can_id with =, dem with &&) where (trang_thai <> 'da_huy')
);
create index booking_sale on public.booking (sale_id);

alter table public.yeu_cau_dat_phong
  add constraint yeu_cau_booking foreign key (booking_id) references public.booking (id);

-- QD10, QT4, KT-DB.3.10: tiền từng đêm; mỗi đêm thuộc tháng của chính nó (QT2.2).
create table public.booking_dem (
  booking_id uuid not null references public.booking (id) on delete cascade,
  dem date not null,
  tien bigint not null check (tien >= 0),
  primary key (booking_id, dem)
);

-- QD11, KT-DB.3.6: phần riêng của từng người trong booking (khách, tiền thu khách).
create table public.booking_rieng (
  booking_id uuid not null references public.booking (id) on delete cascade,
  nguoi_id uuid not null references public.profiles (id),
  ten_khach text,
  sdt_khach text,
  so_khach integer check (so_khach > 0),
  tien_thu_khach bigint check (tien_thu_khach >= 0),
  primary key (booking_id, nguoi_id)
);

-- ===== Thông báo, gửi khách, tìm gần đây =====

-- YC12, QT5.8: thông báo do database ghi, chép nội dung lúc ghi theo quyền người nhận. Không xóa.
create table public.thong_bao (
  id uuid primary key default gen_random_uuid(),
  nguoi_nhan uuid not null references public.profiles (id),
  loai text not null,
  noi_dung jsonb not null default '{}',
  doi_tuong_loai text,
  doi_tuong_id uuid,
  tao_luc timestamptz not null default now(),
  doc_luc timestamptz
);
create index thong_bao_nguoi_nhan on public.thong_bao (nguoi_nhan, tao_luc desc);

-- YC8.1, PQ12: lần gửi khách của sale.
create table public.lan_gui_khach (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.profiles (id),
  can_id uuid not null references public.can (id),
  dem daterange not null,
  gui_luc timestamptz not null default now()
);

-- YC7.2 (giả định GD17): lần tìm gần đây của sale.
create table public.tim_gan_day (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.profiles (id),
  tu_ngay date not null,
  den_ngay date not null,
  bo_loc jsonb not null default '{}',
  tim_luc timestamptz not null default now()
);

-- QD2: nhật ký sửa, xóa booking. App không đọc.
create table public.audit_log (
  id bigint generated always as identity primary key,
  bang text not null,
  ban_ghi_id uuid,
  hanh_dong text not null,
  nguoi uuid,
  luc timestamptz not null default now(),
  truoc jsonb,
  sau jsonb
);
