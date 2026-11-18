# Bảng, cột, view, hàm và policy

[tự sinh] bằng `scripts/bang-cot.sh` từ `supabase/migrations/`. Không sửa tay. Ý định và bất biến của từng bảng: `docs/Thiet_ke_DB.md`.

## Bảng

### admins

| Cột | Kiểu | Bắt buộc | Mặc định |
| --- | --- | --- | --- |
| user_id | uuid | có |  |
| la_goc | boolean | có | `false` |
| created_at | timestamp with time zone | có | `now()` |

Policy:
- `admins_read` (SELECT, authenticated): ((user_id = ( SELECT auth.uid() AS uid)) OR ( SELECT is_admin() AS is_admin))

### anh_can

| Cột | Kiểu | Bắt buộc | Mặc định |
| --- | --- | --- | --- |
| id | uuid | có | `gen_random_uuid()` |
| nguoi_tai | uuid | có |  |
| can_id | uuid |  |  |
| duong_dan | text | có |  |
| thu_tu | smallint |  |  |
| created_at | timestamp with time zone | có | `now()` |

Ràng buộc:
- `anh_can_duong_dan_key`: UNIQUE (duong_dan)

Policy:
- `anh_can_read` (SELECT, authenticated): ((nguoi_tai = ( SELECT auth.uid() AS uid)) OR (can_id IN ( SELECT my_visible_can_ids() AS my_visible_can_ids)))

### audit_log

| Cột | Kiểu | Bắt buộc | Mặc định |
| --- | --- | --- | --- |
| id | bigint | có |  |
| actor_id | uuid |  |  |
| table_name | text | có |  |
| row_id | uuid |  |  |
| action | text | có |  |
| old_row | jsonb |  |  |
| new_row | jsonb |  |  |
| at | timestamp with time zone | có | `now()` |

Policy:
- `audit_admin` (SELECT, authenticated): ( SELECT is_admin() AS is_admin)

### booking

| Cột | Kiểu | Bắt buộc | Mặc định |
| --- | --- | --- | --- |
| id | uuid | có | `gen_random_uuid()` |
| can_id | uuid | có |  |
| dem | daterange | có |  |
| nguon | text | có |  |
| chu_nha_id | uuid | có |  |
| sale_id | uuid |  |  |
| yeu_cau_id | uuid |  |  |
| client_id | uuid |  |  |
| tien_phong | integer | có |  |
| trang_thai_tien | text |  |  |
| tien_coc | integer |  |  |
| trang_thai_tien_truoc | text |  |  |
| gio_nhan | time without time zone |  |  |
| gio_tra | time without time zone |  |  |
| ghi_chu | text |  |  |
| trang_thai | text | có | `'hieu_luc'::text` |
| xin_huy_boi | uuid |  |  |
| xin_huy_luc | timestamp with time zone |  |  |
| tu_choi_huy_luc | timestamp with time zone |  |  |
| created_by | uuid |  |  |
| created_at | timestamp with time zone | có | `now()` |
| updated_at | timestamp with time zone | có | `now()` |

Ràng buộc:
- `booking_check`: CHECK (((trang_thai = 'hieu_luc'::text) OR ((xin_huy_boi IS NOT NULL) AND (xin_huy_luc IS NOT NULL))))
- `booking_check1`: CHECK (((tien_coc IS NULL) OR (trang_thai_tien = ANY (ARRAY['da_coc_con_thu'::text, 'da_thanh_toan'::text]))))
- `booking_check2`: CHECK (((tien_coc IS NULL) OR (tien_coc <= tien_phong)))
- `booking_client_id_key`: UNIQUE (client_id)
- `booking_dem_check`: CHECK ((lower_inc(dem) AND (NOT upper_inc(dem)) AND (NOT isempty(dem))))
- `booking_ghi_chu_check`: CHECK ((char_length(ghi_chu) <= 1000))
- `booking_khong_trung`: EXCLUDE USING gist (can_id WITH =, dem WITH &&) WHERE ((trang_thai <> 'da_huy'::text))
- `booking_nguon_check`: CHECK ((nguon = ANY (ARRAY['chu_tu_ghi'::text, 'tu_yeu_cau'::text, 'sale_tu_ghi'::text])))
- `booking_tien_coc_check`: CHECK ((tien_coc > 0))
- `booking_tien_phong_check`: CHECK ((tien_phong > 0))
- `booking_trang_thai_check`: CHECK ((trang_thai = ANY (ARRAY['hieu_luc'::text, 'cho_huy'::text, 'da_huy'::text])))
- `booking_trang_thai_tien_check`: CHECK ((trang_thai_tien = ANY (ARRAY['chua_coc'::text, 'da_coc_con_thu'::text, 'da_thanh_toan'::text])))

Policy:
- `booking_read` (SELECT, authenticated): ((can_id IN ( SELECT my_own_can_ids() AS my_own_can_ids)) OR ( SELECT is_admin() AS is_admin))

### booking_dem

| Cột | Kiểu | Bắt buộc | Mặc định |
| --- | --- | --- | --- |
| booking_id | uuid | có |  |
| dem | date | có |  |
| tien | integer | có |  |

Policy:
- `booking_dem_read` (SELECT, authenticated): (booking_id IN ( SELECT booking.id    FROM booking))

### booking_rieng

| Cột | Kiểu | Bắt buộc | Mặc định |
| --- | --- | --- | --- |
| booking_id | uuid | có |  |
| nguoi | uuid | có |  |
| ten_khach | text |  |  |
| sdt_khach | text |  |  |
| so_khach | smallint |  |  |
| tien_thu_khach | integer |  |  |

Ràng buộc:
- `booking_rieng_so_khach_check`: CHECK ((so_khach > 0))
- `booking_rieng_tien_thu_khach_check`: CHECK ((tien_thu_khach > 0))

Policy:
- `booking_rieng_read` (SELECT, authenticated): ((nguoi = ( SELECT auth.uid() AS uid)) OR ( SELECT is_admin() AS is_admin))

### bootstrap_admins

| Cột | Kiểu | Bắt buộc | Mặc định |
| --- | --- | --- | --- |
| email | text | có |  |
| la_goc | boolean | có | `false` |

Policy: không có. Bật RLS mà không có policy nghĩa là app không đọc, không ghi thẳng được.

### cai_dat_rieng

| Cột | Kiểu | Bắt buộc | Mặc định |
| --- | --- | --- | --- |
| user_id | uuid | có |  |
| muc_cong_mac_dinh | integer | có | `0` |
| lam_tron_50k | boolean | có | `false` |
| mau_tin | text |  |  |
| thong_bao_tat | text[] | có | `'{}'::text[]` |
| mo_app_luc | timestamp with time zone |  |  |

Ràng buộc:
- `cai_dat_rieng_mau_tin_check`: CHECK ((char_length(mau_tin) <= 2000))
- `cai_dat_rieng_muc_cong_mac_dinh_check`: CHECK ((muc_cong_mac_dinh >= 0))

Policy:
- `cai_dat_rieng_read` (SELECT, authenticated): (user_id = ( SELECT auth.uid() AS uid))

### can

| Cột | Kiểu | Bắt buộc | Mặc định |
| --- | --- | --- | --- |
| id | uuid | có | `gen_random_uuid()` |
| nguoi_giu | uuid | có |  |
| loai | text | có | `'co_lich'::text` |
| ma_can | text | có |  |
| so_phong_ngu | smallint | có |  |
| so_giuong | smallint |  |  |
| loai_view | text |  |  |
| toa_nha_id | uuid |  |  |
| mo_ta_gui_khach | text |  |  |
| ten_chu_can | text |  |  |
| sdt_chu_can | text |  |  |
| gia_chu_thuong | integer |  |  |
| gia_chu_cuoi_tuan | integer |  |  |
| an_luc | timestamp with time zone |  |  |
| lich_cap_nhat_luc | timestamp with time zone | có | `now()` |
| created_at | timestamp with time zone | có | `now()` |

Ràng buộc:
- `can_check`: CHECK (((loai = 'tu_nhap'::text) OR ((ten_chu_can IS NULL) AND (sdt_chu_can IS NULL) AND (gia_chu_thuong IS NULL) AND (gia_chu_cuoi_tuan IS NULL))))
- `can_check1`: CHECK (((loai = 'co_lich'::text) OR (ten_chu_can IS NOT NULL)))
- `can_gia_chu_cuoi_tuan_check`: CHECK ((gia_chu_cuoi_tuan > 0))
- `can_gia_chu_thuong_check`: CHECK ((gia_chu_thuong > 0))
- `can_loai_check`: CHECK ((loai = ANY (ARRAY['co_lich'::text, 'tu_nhap'::text])))
- `can_loai_view_check`: CHECK ((loai_view = ANY (ARRAY['bien'::text, 'thanh_pho'::text, 'nui'::text])))
- `can_ma_can_check`: CHECK (((char_length(ma_can) >= 1) AND (char_length(ma_can) <= 50)))
- `can_mo_ta_gui_khach_check`: CHECK ((char_length(mo_ta_gui_khach) <= 2000))
- `can_sdt_chu_can_check`: CHECK ((sdt_chu_can ~ '^\+?[0-9]{9,15}$'::text))
- `can_so_giuong_check`: CHECK (((so_giuong >= 1) AND (so_giuong <= 50)))
- `can_so_phong_ngu_check`: CHECK (((so_phong_ngu >= 0) AND (so_phong_ngu <= 4)))
- `can_ten_chu_can_check`: CHECK ((char_length(ten_chu_can) <= 100))

Policy:
- `can_read` (SELECT, authenticated): (id IN ( SELECT my_visible_can_ids() AS my_visible_can_ids))

### gia_dip

| Cột | Kiểu | Bắt buộc | Mặc định |
| --- | --- | --- | --- |
| id | uuid | có | `gen_random_uuid()` |
| can_id | uuid | có |  |
| ten | text | có |  |
| la_ngay_le | boolean | có | `false` |
| dai | daterange | có |  |
| gia_moi_dem | integer | có |  |

Ràng buộc:
- `gia_dip_dai_check`: CHECK ((lower_inc(dai) AND (NOT upper_inc(dai)) AND (NOT isempty(dai)) AND ((upper(dai) - lower(dai)) <= 10)))
- `gia_dip_gia_moi_dem_check`: CHECK ((gia_moi_dem > 0))
- `gia_dip_khong_chong`: EXCLUDE USING gist (can_id WITH =, dai WITH &&)
- `gia_dip_ten_check`: CHECK (((char_length(ten) >= 1) AND (char_length(ten) <= 100)))

Policy:
- `gia_dip_read` (SELECT, authenticated): (can_id IN ( SELECT my_visible_can_ids() AS my_visible_can_ids))

### gia_thang

| Cột | Kiểu | Bắt buộc | Mặc định |
| --- | --- | --- | --- |
| can_id | uuid | có |  |
| thang | date | có |  |
| gia_ngay_thuong | integer | có |  |
| gia_cuoi_tuan | integer | có |  |

Ràng buộc:
- `gia_thang_gia_cuoi_tuan_check`: CHECK ((gia_cuoi_tuan > 0))
- `gia_thang_gia_ngay_thuong_check`: CHECK ((gia_ngay_thuong > 0))
- `gia_thang_thang_check`: CHECK ((EXTRACT(day FROM thang) = (1)::numeric))

Policy:
- `gia_read` (SELECT, authenticated): (can_id IN ( SELECT my_visible_can_ids() AS my_visible_can_ids))

### ket_noi

| Cột | Kiểu | Bắt buộc | Mặc định |
| --- | --- | --- | --- |
| id | uuid | có | `gen_random_uuid()` |
| chu_nha_id | uuid | có |  |
| sale_id | uuid | có |  |
| trang_thai | text | có | `'da_ket_noi'::text` |
| nguon | text | có |  |
| pham_vi | text | có | `'tat_ca_can'::text` |
| quyen_tinh_trang_coc | boolean | có | `true` |
| ket_noi_luc | timestamp with time zone | có | `now()` |

Ràng buộc:
- `ket_noi_check`: CHECK ((chu_nha_id <> sale_id))
- `ket_noi_chu_nha_id_sale_id_key`: UNIQUE (chu_nha_id, sale_id)
- `ket_noi_nguon_check`: CHECK ((nguon = ANY (ARRAY['link_moi'::text, 'sale_xin'::text, 'chu_gui_lich'::text, 'chu_them_tay'::text])))
- `ket_noi_pham_vi_check`: CHECK ((pham_vi = ANY (ARRAY['tat_ca_can'::text, 'chon_can'::text])))
- `ket_noi_trang_thai_check`: CHECK ((trang_thai = ANY (ARRAY['da_ket_noi'::text, 'chu_ngung'::text, 'sale_bo'::text])))

Policy:
- `ket_noi_read` (SELECT, authenticated): ((chu_nha_id = ( SELECT auth.uid() AS uid)) OR (sale_id = ( SELECT auth.uid() AS uid)) OR ( SELECT is_admin() AS is_admin))

### ket_noi_can

| Cột | Kiểu | Bắt buộc | Mặc định |
| --- | --- | --- | --- |
| ket_noi_id | uuid | có |  |
| can_id | uuid | có |  |

Policy:
- `ket_noi_can_read` (SELECT, authenticated): (ket_noi_id IN ( SELECT ket_noi.id    FROM ket_noi))

### lan_gui_khach

| Cột | Kiểu | Bắt buộc | Mặc định |
| --- | --- | --- | --- |
| id | uuid | có | `gen_random_uuid()` |
| sale_id | uuid | có |  |
| can_id | uuid | có |  |
| dem | daterange | có |  |
| gui_luc | timestamp with time zone | có | `now()` |
| da_bao | boolean | có | `false` |

Ràng buộc:
- `lan_gui_khach_dem_check`: CHECK ((lower_inc(dem) AND (NOT upper_inc(dem)) AND (NOT isempty(dem))))

Policy:
- `lan_gui_khach_read` (SELECT, authenticated): (sale_id = ( SELECT auth.uid() AS uid))

### link_moi

| Cột | Kiểu | Bắt buộc | Mặc định |
| --- | --- | --- | --- |
| ma | text | có | `encode(gen_random_bytes(12), 'hex'::text)` |
| chu_nha_id | uuid | có |  |
| loai | text | có | `'moi_sale'::text` |
| het_han_luc | timestamp with time zone | có | `(now() + '21 days'::interval)` |
| thu_hoi_luc | timestamp with time zone |  |  |
| so_lan_gui | integer | có | `0` |
| gui_cuoi_luc | timestamp with time zone |  |  |
| created_at | timestamp with time zone | có | `now()` |

Ràng buộc:
- `link_moi_loai_check`: CHECK ((loai = ANY (ARRAY['moi_sale'::text, 'gui_lich'::text])))

Policy:
- `link_moi_read` (SELECT, authenticated): ((chu_nha_id = ( SELECT auth.uid() AS uid)) OR ( SELECT is_admin() AS is_admin))

### link_moi_can

| Cột | Kiểu | Bắt buộc | Mặc định |
| --- | --- | --- | --- |
| ma | text | có |  |
| can_id | uuid | có |  |

Policy:
- `link_moi_can_read` (SELECT, authenticated): (ma IN ( SELECT link_moi.ma    FROM link_moi))

### link_xin_lich

| Cột | Kiểu | Bắt buộc | Mặc định |
| --- | --- | --- | --- |
| ma | text | có | `encode(gen_random_bytes(12), 'hex'::text)` |
| sale_id | uuid | có |  |
| so_lan_gui | integer | có | `0` |
| gui_cuoi_luc | timestamp with time zone |  |  |
| created_at | timestamp with time zone | có | `now()` |

Ràng buộc:
- `link_xin_lich_sale_id_key`: UNIQUE (sale_id)

Policy:
- `link_xin_lich_read` (SELECT, authenticated): (sale_id = ( SELECT auth.uid() AS uid))

### muc_cong

| Cột | Kiểu | Bắt buộc | Mặc định |
| --- | --- | --- | --- |
| sale_id | uuid | có |  |
| can_id | uuid | có |  |
| so_tien | integer | có |  |

Ràng buộc:
- `muc_cong_so_tien_check`: CHECK ((so_tien >= 0))

Policy:
- `muc_cong_read` (SELECT, authenticated): (sale_id = ( SELECT auth.uid() AS uid))

### ngay_le

| Cột | Kiểu | Bắt buộc | Mặc định |
| --- | --- | --- | --- |
| id | uuid | có | `gen_random_uuid()` |
| nam | smallint | có |  |
| ten | text | có |  |
| ngay_dau | date | có |  |
| ngay_cuoi | date | có |  |

Ràng buộc:
- `ngay_le_check`: CHECK ((ngay_cuoi >= ngay_dau))
- `ngay_le_nam_ten_key`: UNIQUE (nam, ten)
- `ngay_le_ten_check`: CHECK (((char_length(ten) >= 1) AND (char_length(ten) <= 100)))

Policy:
- `ngay_le_read` (SELECT, authenticated): true

### profiles

| Cột | Kiểu | Bắt buộc | Mặc định |
| --- | --- | --- | --- |
| id | uuid | có |  |
| ten | text |  |  |
| ho_ten | text |  |  |
| anh_dai_dien | text |  |  |
| sdt | text |  |  |
| vai_chon | text |  |  |
| dem_cuoi_tuan | int2[] | có | `'{5,6}'::smallint[]` |
| gio_nhan | time without time zone | có | `'14:00:00'::time without time zone` |
| gio_tra | time without time zone | có | `'12:00:00'::time without time zone` |
| dong_y_dieu_khoan_luc | timestamp with time zone |  |  |
| da_xoa_luc | timestamp with time zone |  |  |
| created_at | timestamp with time zone | có | `now()` |

Ràng buộc:
- `profiles_dem_cuoi_tuan_check`: CHECK ((dem_cuoi_tuan <@ '{0,1,2,3,4,5,6}'::smallint[]))
- `profiles_ho_ten_check`: CHECK ((char_length(ho_ten) <= 100))
- `profiles_sdt_check`: CHECK ((sdt ~ '^\+?[0-9]{9,15}$'::text))
- `profiles_ten_check`: CHECK ((char_length(ten) <= 100))
- `profiles_vai_chon_check`: CHECK ((vai_chon = ANY (ARRAY['chu_nha'::text, 'sale'::text])))

Policy:
- `profiles_read` (SELECT, authenticated): ((id = ( SELECT auth.uid() AS uid)) OR ( SELECT is_admin() AS is_admin) OR (id IN ( SELECT my_contact_ids() AS my_contact_ids)))

### sale_them_tay

| Cột | Kiểu | Bắt buộc | Mặc định |
| --- | --- | --- | --- |
| id | uuid | có | `gen_random_uuid()` |
| chu_nha_id | uuid | có |  |
| ten | text | có |  |
| sdt | text |  |  |
| created_at | timestamp with time zone | có | `now()` |

Ràng buộc:
- `sale_them_tay_sdt_check`: CHECK ((sdt ~ '^\+?[0-9]{9,15}$'::text))
- `sale_them_tay_ten_check`: CHECK (((char_length(ten) >= 1) AND (char_length(ten) <= 100)))

Policy:
- `sale_them_tay_read` (SELECT, authenticated): (chu_nha_id = ( SELECT auth.uid() AS uid))

### thong_bao

| Cột | Kiểu | Bắt buộc | Mặc định |
| --- | --- | --- | --- |
| id | uuid | có | `gen_random_uuid()` |
| nguoi_nhan | uuid | có |  |
| loai | text | có |  |
| du_lieu | jsonb | có | `'{}'::jsonb` |
| booking_id | uuid |  |  |
| yeu_cau_id | uuid |  |  |
| khoa_gom | text |  |  |
| tao_luc | timestamp with time zone | có | `now()` |
| doc_luc | timestamp with time zone |  |  |

Ràng buộc:
- `thong_bao_loai_check`: CHECK ((loai = ANY (ARRAY['chu_dong_y_ket_noi'::text, 'chu_chap_nhan_yeu_cau'::text, 'chu_sua_booking'::text, 'chu_tu_choi_yeu_cau'::text, 'yeu_cau_het_han'::text, 'chu_them_can'::text, 'sale_gui_yeu_cau'::text, 'sale_xin_xem_lich'::text, 'chu_xoa_tai_khoan'::text, 'can_da_gui_co_nguoi_dat'::text, 'chu_ngung_ket_noi'::text, 'xin_huy_booking'::text, 'tra_loi_huy_booking'::text, 'chu_ghi_booking_cho_sale'::text])))

Policy:
- `thong_bao_read` (SELECT, authenticated): (nguoi_nhan = ( SELECT auth.uid() AS uid))

### tim_gan_day

| Cột | Kiểu | Bắt buộc | Mặc định |
| --- | --- | --- | --- |
| id | uuid | có | `gen_random_uuid()` |
| sale_id | uuid | có |  |
| dieu_kien | jsonb | có |  |
| tim_luc | timestamp with time zone | có | `now()` |

Policy:
- `tim_gan_day_read` (SELECT, authenticated): (sale_id = ( SELECT auth.uid() AS uid))

### toa_nha

| Cột | Kiểu | Bắt buộc | Mặc định |
| --- | --- | --- | --- |
| id | uuid | có | `gen_random_uuid()` |
| ten | text | có |  |
| khu_vuc | text |  |  |
| tao_boi | uuid |  |  |
| created_at | timestamp with time zone | có | `now()` |

Ràng buộc:
- `toa_nha_ten_check`: CHECK (((char_length(ten) >= 1) AND (char_length(ten) <= 100)))
- `toa_nha_ten_key`: UNIQUE (ten)

Policy:
- `toa_nha_read` (SELECT, authenticated): true

### yeu_cau_dat_phong

| Cột | Kiểu | Bắt buộc | Mặc định |
| --- | --- | --- | --- |
| id | uuid | có | `gen_random_uuid()` |
| can_id | uuid | có |  |
| sale_id | uuid | có |  |
| dem | daterange | có |  |
| client_id | uuid |  |  |
| trang_thai | text | có | `'cho'::text` |
| ly_do_ma | text |  |  |
| ly_do_tu_choi | text |  |  |
| loi_nhan | text |  |  |
| het_han_luc | timestamp with time zone | có | `(now() + '14 days'::interval)` |
| created_at | timestamp with time zone | có | `now()` |
| tra_loi_luc | timestamp with time zone |  |  |

Ràng buộc:
- `yeu_cau_dat_phong_client_id_key`: UNIQUE (client_id)
- `yeu_cau_dat_phong_dem_check`: CHECK ((lower_inc(dem) AND (NOT upper_inc(dem)) AND (NOT isempty(dem))))
- `yeu_cau_dat_phong_loi_nhan_check`: CHECK ((char_length(loi_nhan) <= 500))
- `yeu_cau_dat_phong_ly_do_ma_check`: CHECK ((ly_do_ma = ANY (ARRAY['da_co_khach'::text, 'dang_sua_phong'::text, 'ly_do_khac'::text, 'chu_nhan_dat_khac'::text])))
- `yeu_cau_dat_phong_trang_thai_check`: CHECK ((trang_thai = ANY (ARRAY['cho'::text, 'chap_nhan'::text, 'tu_choi'::text, 'het_han'::text, 'da_huy'::text])))

Policy:
- `yeu_cau_read` (SELECT, authenticated): ((sale_id = ( SELECT auth.uid() AS uid)) OR (can_id IN ( SELECT my_own_can_ids() AS my_own_can_ids)) OR ( SELECT is_admin() AS is_admin))

### yeu_cau_rieng

| Cột | Kiểu | Bắt buộc | Mặc định |
| --- | --- | --- | --- |
| yeu_cau_id | uuid | có |  |
| ten_khach | text |  |  |
| sdt_khach | text |  |  |
| so_khach | smallint |  |  |
| tien_thu_khach | integer |  |  |

Ràng buộc:
- `yeu_cau_rieng_so_khach_check`: CHECK ((so_khach > 0))
- `yeu_cau_rieng_tien_thu_khach_check`: CHECK ((tien_thu_khach > 0))

Policy:
- `yeu_cau_rieng_read` (SELECT, authenticated): ((yeu_cau_id IN ( SELECT yeu_cau_dat_phong.id    FROM yeu_cau_dat_phong   WHERE (yeu_cau_dat_phong.sale_id = ( SELECT auth.uid() AS uid)))) OR ( SELECT is_admin() AS is_admin))

## View

### v_booking_cua_sale

- id (uuid)
- can_id (uuid)
- dem (daterange)
- nguon (text)
- chu_nha_id (uuid)
- tien_phong (integer)
- tien_thu_khach (integer)
- tien_chenh (integer)
- da_coc (boolean)
- trang_thai (text)
- xin_huy_boi (uuid)
- bi_tu_choi_huy (boolean)
- created_at (timestamp with time zone)

### v_lich_sale

- can_id (uuid)
- dem (daterange)

## Hàm app gọi được (vai authenticated)

- `fn_an_can(p_can uuid)` trả void
- `fn_cap_nhat_ho_so(p jsonb)` trả void
- `fn_chu_doi_quyen_sale(p_sale uuid, p jsonb)` trả void
- `fn_chu_dong_y_xin_lich(p_ma text, p jsonb DEFAULT '{}'::jsonb)` trả uuid
- `fn_chu_ghi_booking(p jsonb)` trả jsonb
- `fn_chu_hoan_tac_thu_du(p_id uuid)` trả void
- `fn_chu_ngung_sale(p_sale uuid)` trả void
- `fn_chu_sua_booking(p_id uuid, p jsonb)` trả void
- `fn_chu_them_sale_tay(p_ten text, p_sdt text DEFAULT NULL::text)` trả uuid
- `fn_chu_thu_du(p_id uuid)` trả void
- `fn_chu_tra_loi_yeu_cau(p_id uuid, p_chap_nhan boolean, p_tien_phong integer DEFAULT NULL::integer, p_ly_do text DEFAULT NULL::text)` trả jsonb
- `fn_chu_xoa_booking(p_id uuid)` trả void
- `fn_chu_xoa_sale_tay(p_id uuid)` trả void
- `fn_dang_ky_anh(p_duong_dan text)` trả uuid
- `fn_danh_dau_da_doc(p_ids uuid[] DEFAULT NULL::uuid[])` trả void
- `fn_dat_gia_nhieu_can(p_cans uuid[], p_thangs date[], p_thuong integer, p_cuoi_tuan integer)` trả void
- `fn_dat_gia_thang(p_can uuid, p_thangs date[], p_thuong integer, p_cuoi_tuan integer)` trả void
- `fn_dat_muc_cong(p_can uuid, p_so_tien integer)` trả void
- `fn_dem_gui_link(p_ma text)` trả void
- `fn_dem_gui_xin_lich()` trả void
- `fn_gan_anh_can(p_can uuid, p_anh_ids uuid[])` trả void
- `fn_ghi_khach(p_booking uuid, p jsonb)` trả void
- `fn_ghi_lan_gui(p_can uuid, p_nhan date, p_tra date)` trả uuid
- `fn_ghi_tim(p_dieu_kien jsonb)` trả void
- `fn_lay_link_moi()` trả text
- `fn_lay_link_xin_lich()` trả text
- `fn_luu_cai_dat(p jsonb)` trả void
- `fn_luu_gia_dip(p_can uuid, p jsonb)` trả uuid
- `fn_mo_app(p_client_id uuid DEFAULT NULL::uuid)` trả jsonb
- `fn_qt_go_admin(p_email text)` trả void
- `fn_qt_luu_ngay_le(p jsonb)` trả uuid
- `fn_qt_luu_toa_nha(p jsonb)` trả uuid
- `fn_qt_them_admin(p_email text)` trả void
- `fn_qt_xoa_ngay_le(p_id uuid)` trả void
- `fn_sale_bo_nguon(p_chu uuid)` trả void
- `fn_sale_ghi_tu_nhap(p jsonb)` trả jsonb
- `fn_sale_gia(p_can uuid, p_nhan date, p_tra date)` trả jsonb
- `fn_sale_gui_yeu_cau(p jsonb)` trả jsonb
- `fn_sale_huy_yeu_cau(p_id uuid)` trả void
- `fn_sale_lich(p_tu date DEFAULT NULL::date, p_so_ngay integer DEFAULT 7)` trả jsonb
- `fn_sale_sua_tu_nhap(p_id uuid, p jsonb)` trả void
- `fn_sale_tim(p jsonb)` trả jsonb
- `fn_sale_xoa_tu_nhap(p_id uuid)` trả void
- `fn_sao_chep_gia(p_nguon uuid, p_dichs uuid[], p_phan text[])` trả void
- `fn_sua_can(p_can uuid, p jsonb)` trả void
- `fn_tao_can(p jsonb)` trả uuid
- `fn_tao_link_gui_lich(p_can_ids uuid[])` trả text
- `fn_tao_link_moi()` trả text
- `fn_them_lich_tu_link(p_ma text)` trả uuid
- `fn_them_toa_nha(p_ten text)` trả uuid
- `fn_thong_ke_chu(p_thang date DEFAULT NULL::date)` trả jsonb
- `fn_thong_ke_sale(p_thang date DEFAULT NULL::date)` trả jsonb
- `fn_thu_hoi_link_moi(p_ma text)` trả void
- `fn_tra_loi_huy(p_id uuid, p_dong_y boolean)` trả void
- `fn_xem_link_moi(p_ma text)` trả jsonb · **khách chưa đăng nhập gọi được**
- `fn_xem_link_xin_lich(p_ma text)` trả jsonb
- `fn_xin_huy(p_id uuid)` trả void
- `fn_xoa_gia_dip(p_id uuid)` trả void
- `fn_xoa_tai_khoan()` trả void
- `fn_xuat_booking(p_tu date, p_den date, p_can uuid DEFAULT NULL::uuid)` trả TABLE(ma_can text, ngay_nhan date, ngay_tra date, so_dem integer, nguoi_dat text, ten_khach text, sdt_khach text, so_khach smallint, tien_phong integer, trang_thai_tien text, tien_coc integer, trang_thai text, ghi_chu text)

## Hàm nội bộ (app không gọi được)

- `can_con_dat_phong(p_can uuid)`
- `can_dang_nhap()`
- `can_la_admin()`
- `dich_loi_trung()`
- `don_dep()`
- `ghi_booking_dem(p_booking uuid)`
- `ghi_thong_bao(p_nguoi uuid, p_loai text, p_du_lieu jsonb, p_booking uuid DEFAULT NULL::uuid, p_yeu_cau uuid DEFAULT NULL::uuid, p_khoa_gom text DEFAULT NULL::text)`
- `gia_ban_dem(p_can uuid, p_dem date)`
- `gia_ban_goi_y(p_sale uuid, p_can uuid, p_tien_phong integer, p_so_dem integer)`
- `gia_dem(p_can uuid, p_dem date)`
- `handle_new_user()`
- `het_han_yeu_cau()`
- `is_admin()`
- `local_today()`
- `my_contact_ids()`
- `my_own_can_ids()`
- `my_shared_can_ids()`
- `my_visible_can_ids()`
- `phan_cua_dem(p_tong bigint, p_n integer, p_i integer)`
- `tb_booking()`
- `tb_can_moi()`
- `tb_ket_noi()`
- `tb_xoa_tai_khoan()`
- `tb_yeu_cau()`
- `the_can(p_can uuid)`
- `tien_phong_goi_y(p_can uuid, p_nhan date, p_tra date)`
- `tu_choi_yeu_cau_trung(p_can uuid, p_dem daterange)`
