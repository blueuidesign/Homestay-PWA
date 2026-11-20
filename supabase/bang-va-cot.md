# Bảng và cột · máy sinh bằng scripts/bang-cot.sh từ supabase/migrations. Không sửa tay.

## admins

RLS: bật

| Cột | Kiểu | Null | Mặc định |
|---|---|---|---|
| email | text | không |  |
| nguoi_id | uuid | có |  |
| la_goc | boolean | không | false |
| them_luc | timestamp with time zone | không | now() |

Ràng buộc:
- admins_nguoi_id_fkey: FOREIGN KEY (nguoi_id) REFERENCES auth.users(id)
- admins_pkey: PRIMARY KEY (email)
- admins_mot_goc: CREATE UNIQUE INDEX admins_mot_goc ON public.admins USING btree (la_goc) WHERE la_goc

Policy:

## anh_can

RLS: bật

| Cột | Kiểu | Null | Mặc định |
|---|---|---|---|
| id | uuid | không | gen_random_uuid() |
| can_id | uuid | có |  |
| nguoi_tai | uuid | không |  |
| duong_dan | text | không |  |
| thu_tu | smallint | có |  |
| tao_luc | timestamp with time zone | không | now() |

Ràng buộc:
- anh_can_can_id_fkey: FOREIGN KEY (can_id) REFERENCES can(id) ON DELETE CASCADE
- anh_can_duong_dan_key: UNIQUE (duong_dan)
- anh_can_nguoi_tai_fkey: FOREIGN KEY (nguoi_tai) REFERENCES profiles(id)
- anh_can_pkey: PRIMARY KEY (id)
- anh_can_can: CREATE INDEX anh_can_can ON public.anh_can USING btree (can_id, thu_tu)

Policy:
- anh_can_doc (SELECT, authenticated): (((can_id IS NULL) AND (nguoi_tai = ( SELECT auth.uid() AS uid))) OR (can_id IN ( SELECT my_own_can_ids() AS my_own_can_ids)) OR (can_id IN ( SELECT my_shared_can_ids() AS my_shared_can_ids)))

## audit_log

RLS: bật

| Cột | Kiểu | Null | Mặc định |
|---|---|---|---|
| id | bigint | không |  |
| bang | text | không |  |
| ban_ghi_id | uuid | có |  |
| hanh_dong | text | không |  |
| nguoi | uuid | có |  |
| luc | timestamp with time zone | không | now() |
| truoc | jsonb | có |  |
| sau | jsonb | có |  |

Ràng buộc:
- audit_log_pkey: PRIMARY KEY (id)

Policy:

## booking

RLS: bật

| Cột | Kiểu | Null | Mặc định |
|---|---|---|---|
| id | uuid | không | gen_random_uuid() |
| can_id | uuid | không |  |
| ngay_nhan | date | không |  |
| ngay_tra | date | không |  |
| dem | daterange | có | daterange(ngay_nhan, ngay_tra, '[)'::text) |
| nguon | text | không |  |
| sale_id | uuid | có |  |
| tao_boi | uuid | không |  |
| tien_phong | bigint | không |  |
| trang_thai_tien | text | có |  |
| tien_coc | bigint | có |  |
| trang_thai | text | không | 'hieu_luc'::text |
| huy_xin_boi | uuid | có |  |
| huy_xin_luc | timestamp with time zone | có |  |
| huy_tra_loi | text | có |  |
| huy_tra_loi_boi | uuid | có |  |
| huy_tra_loi_luc | timestamp with time zone | có |  |
| yeu_cau_id | uuid | có |  |
| client_id | uuid | có |  |
| tao_luc | timestamp with time zone | không | now() |
| sua_luc | timestamp with time zone | không | now() |
| ghi_chu | text | có |  |
| gio_nhan | time without time zone | có |  |
| gio_tra | time without time zone | có |  |
| trang_thai_tien_truoc | text | có |  |

Ràng buộc:
- booking_can_id_fkey: FOREIGN KEY (can_id) REFERENCES can(id)
- booking_client_id_khong_trung: UNIQUE (tao_boi, client_id)
- booking_huy_tra_loi_boi_fkey: FOREIGN KEY (huy_tra_loi_boi) REFERENCES profiles(id)
- booking_huy_tra_loi_check: CHECK ((huy_tra_loi = ANY (ARRAY['dong_y'::text, 'tu_choi'::text])))
- booking_huy_xin_boi_fkey: FOREIGN KEY (huy_xin_boi) REFERENCES profiles(id)
- booking_khong_trung: EXCLUDE USING gist (can_id WITH =, dem WITH &&) WHERE ((trang_thai <> 'da_huy'::text))
- booking_ngay_hop_le: CHECK ((ngay_tra > ngay_nhan))
- booking_nguon_check: CHECK ((nguon = ANY (ARRAY['chu_ghi'::text, 'tu_yeu_cau'::text, 'sale_tu_ghi'::text])))
- booking_pkey: PRIMARY KEY (id)
- booking_sale_id_fkey: FOREIGN KEY (sale_id) REFERENCES profiles(id)
- booking_tao_boi_fkey: FOREIGN KEY (tao_boi) REFERENCES profiles(id)
- booking_tien_coc_check: CHECK ((tien_coc >= 0))
- booking_tien_dem_khop: TRIGGER DEFERRABLE INITIALLY DEFERRED
- booking_tien_phong_check: CHECK ((tien_phong >= 0))
- booking_trang_thai_check: CHECK ((trang_thai = ANY (ARRAY['hieu_luc'::text, 'da_huy'::text])))
- booking_trang_thai_tien_check: CHECK ((trang_thai_tien = ANY (ARRAY['chua_coc'::text, 'da_coc'::text, 'da_thanh_toan'::text])))
- booking_trang_thai_tien_truoc_check: CHECK ((trang_thai_tien_truoc = ANY (ARRAY['chua_coc'::text, 'da_coc'::text])))
- booking_yeu_cau_id_fkey: FOREIGN KEY (yeu_cau_id) REFERENCES yeu_cau_dat_phong(id)
- booking_sale: CREATE INDEX booking_sale ON public.booking USING btree (sale_id)

Policy:
- booking_doc (SELECT, authenticated): (can_id IN ( SELECT my_own_can_ids() AS my_own_can_ids))

## booking_dem

RLS: bật

| Cột | Kiểu | Null | Mặc định |
|---|---|---|---|
| booking_id | uuid | không |  |
| dem | date | không |  |
| tien | bigint | không |  |

Ràng buộc:
- booking_dem_booking_id_fkey: FOREIGN KEY (booking_id) REFERENCES booking(id) ON DELETE CASCADE
- booking_dem_khop: TRIGGER DEFERRABLE INITIALLY DEFERRED
- booking_dem_pkey: PRIMARY KEY (booking_id, dem)
- booking_dem_tien_check: CHECK ((tien >= 0))

Policy:
- booking_dem_doc (SELECT, authenticated): (EXISTS ( SELECT 1
-    FROM booking b
-   WHERE ((b.id = booking_dem.booking_id) AND (b.can_id IN ( SELECT my_own_can_ids() AS my_own_can_ids)))))

## booking_rieng

RLS: bật

| Cột | Kiểu | Null | Mặc định |
|---|---|---|---|
| booking_id | uuid | không |  |
| nguoi_id | uuid | không |  |
| ten_khach | text | có |  |
| sdt_khach | text | có |  |
| so_khach | integer | có |  |
| tien_thu_khach | bigint | có |  |

Ràng buộc:
- booking_rieng_booking_id_fkey: FOREIGN KEY (booking_id) REFERENCES booking(id) ON DELETE CASCADE
- booking_rieng_nguoi_id_fkey: FOREIGN KEY (nguoi_id) REFERENCES profiles(id)
- booking_rieng_pkey: PRIMARY KEY (booking_id, nguoi_id)
- booking_rieng_so_khach_check: CHECK ((so_khach > 0))
- booking_rieng_tien_thu_khach_check: CHECK ((tien_thu_khach >= 0))

Policy:
- booking_rieng_doc (SELECT, authenticated): (nguoi_id = ( SELECT auth.uid() AS uid))

## cai_dat_rieng

RLS: bật

| Cột | Kiểu | Null | Mặc định |
|---|---|---|---|
| nguoi_id | uuid | không |  |
| muc_cong_mac_dinh | bigint | không | 0 |
| lam_tron_50k | boolean | không | false |
| mau_tin | text | có |  |
| thong_bao_tat | text[] | không | '{}'::text[] |
| sua_luc | timestamp with time zone | không | now() |

Ràng buộc:
- cai_dat_rieng_muc_cong_mac_dinh_check: CHECK ((muc_cong_mac_dinh >= 0))
- cai_dat_rieng_muc_cong_trong_khoang: CHECK (((muc_cong_mac_dinh >= 0) AND (muc_cong_mac_dinh <= 5000000)))
- cai_dat_rieng_nguoi_id_fkey: FOREIGN KEY (nguoi_id) REFERENCES profiles(id)
- cai_dat_rieng_pkey: PRIMARY KEY (nguoi_id)

Policy:
- cai_dat_rieng_doc (SELECT, authenticated): (nguoi_id = ( SELECT auth.uid() AS uid))

## can

RLS: bật

| Cột | Kiểu | Null | Mặc định |
|---|---|---|---|
| id | uuid | không | gen_random_uuid() |
| nguoi_giu | uuid | không |  |
| loai | text | không | 'co_lich'::text |
| ma_can | text | không |  |
| so_phong_ngu | smallint | có |  |
| so_giuong | smallint | có |  |
| loai_view | text | có |  |
| toa_nha_id | uuid | có |  |
| mo_ta | text | có |  |
| chu_can_ten | text | có |  |
| chu_can_sdt | text | có |  |
| gia_chu_thuong | bigint | có |  |
| gia_chu_cuoi_tuan | bigint | có |  |
| an_luc | timestamp with time zone | có |  |
| lich_doi_luc | timestamp with time zone | không | now() |
| client_id | uuid | có |  |
| tao_luc | timestamp with time zone | không | now() |

Ràng buộc:
- can_client_id_khong_trung: UNIQUE (nguoi_giu, client_id)
- can_gia_chu_cuoi_tuan_check: CHECK ((gia_chu_cuoi_tuan > 0))
- can_gia_chu_thuong_check: CHECK ((gia_chu_thuong > 0))
- can_loai_check: CHECK ((loai = ANY (ARRAY['co_lich'::text, 'tu_nhap'::text])))
- can_ma_can_check: CHECK ((btrim(ma_can) <> ''::text))
- can_nguoi_giu_fkey: FOREIGN KEY (nguoi_giu) REFERENCES profiles(id)
- can_pkey: PRIMARY KEY (id)
- can_toa_nha_id_fkey: FOREIGN KEY (toa_nha_id) REFERENCES toa_nha(id)
- can_ma_khong_trung: CREATE UNIQUE INDEX can_ma_khong_trung ON public.can USING btree (nguoi_giu, lower(btrim(ma_can))) WHERE ((an_luc IS NULL) AND (loai = 'co_lich'::text))
- can_tu_nhap_ma_khong_trung: CREATE UNIQUE INDEX can_tu_nhap_ma_khong_trung ON public.can USING btree (nguoi_giu, COALESCE(toa_nha_id, '00000000-0000-0000-0000-000000000000'::uuid), lower(btrim(ma_can))) WHERE (loai = 'tu_nhap'::text)

Policy:
- can_doc (SELECT, authenticated): ((nguoi_giu = ( SELECT auth.uid() AS uid)) OR (id IN ( SELECT my_shared_can_ids() AS my_shared_can_ids)))

## file_cho_xoa

RLS: bật

| Cột | Kiểu | Null | Mặc định |
|---|---|---|---|
| duong_dan | text | không |  |
| them_luc | timestamp with time zone | không | now() |

Ràng buộc:
- file_cho_xoa_pkey: PRIMARY KEY (duong_dan)

Policy:

## gia_dip

RLS: bật

| Cột | Kiểu | Null | Mặc định |
|---|---|---|---|
| id | uuid | không | gen_random_uuid() |
| can_id | uuid | không |  |
| tu_ngay | date | không |  |
| den_ngay | date | không |  |
| ten | text | có |  |
| gia | bigint | không |  |
| la_ngay_le | boolean | không | false |
| sua_luc | timestamp with time zone | không | now() |

Ràng buộc:
- gia_dip_can_id_fkey: FOREIGN KEY (can_id) REFERENCES can(id)
- gia_dip_dai_hop_le: CHECK (((den_ngay >= tu_ngay) AND ((den_ngay - tu_ngay) <= 9)))
- gia_dip_gia_check: CHECK ((gia > 0))
- gia_dip_khong_chong: EXCLUDE USING gist (can_id WITH =, daterange(tu_ngay, den_ngay, '[]'::text) WITH &&)
- gia_dip_pkey: PRIMARY KEY (id)

Policy:
- gia_dip_doc (SELECT, authenticated): ((can_id IN ( SELECT my_own_can_ids() AS my_own_can_ids)) OR (can_id IN ( SELECT my_shared_can_ids() AS my_shared_can_ids)))

## gia_thang

RLS: bật

| Cột | Kiểu | Null | Mặc định |
|---|---|---|---|
| can_id | uuid | không |  |
| thang | date | không |  |
| gia_thuong | bigint | không |  |
| gia_cuoi_tuan | bigint | không |  |
| sua_luc | timestamp with time zone | không | now() |

Ràng buộc:
- gia_thang_can_id_fkey: FOREIGN KEY (can_id) REFERENCES can(id)
- gia_thang_gia_cuoi_tuan_check: CHECK ((gia_cuoi_tuan > 0))
- gia_thang_gia_thuong_check: CHECK ((gia_thuong > 0))
- gia_thang_pkey: PRIMARY KEY (can_id, thang)
- gia_thang_thang_check: CHECK ((EXTRACT(day FROM thang) = (1)::numeric))

Policy:
- gia_thang_doc (SELECT, authenticated): ((can_id IN ( SELECT my_own_can_ids() AS my_own_can_ids)) OR (can_id IN ( SELECT my_shared_can_ids() AS my_shared_can_ids)))

## ket_noi

RLS: bật

| Cột | Kiểu | Null | Mặc định |
|---|---|---|---|
| id | uuid | không | gen_random_uuid() |
| chu_id | uuid | không |  |
| sale_id | uuid | không |  |
| trang_thai | text | không | 'chua_ket_noi'::text |
| nguon | text | không |  |
| pham_vi | text | không | 'tat_ca'::text |
| xem_coc | boolean | không | true |
| tao_luc | timestamp with time zone | không | now() |
| sua_luc | timestamp with time zone | không | now() |
| ngung_luc | timestamp with time zone | có |  |

Ràng buộc:
- ket_noi_chu_id_fkey: FOREIGN KEY (chu_id) REFERENCES profiles(id)
- ket_noi_hai_nguoi: CHECK ((chu_id <> sale_id))
- ket_noi_mot_cap: UNIQUE (chu_id, sale_id)
- ket_noi_nguon_check: CHECK ((nguon = ANY (ARRAY['link_moi'::text, 'sale_xin'::text, 'gui_lich'::text, 'them_tay'::text])))
- ket_noi_pham_vi_check: CHECK ((pham_vi = ANY (ARRAY['tat_ca'::text, 'chon_can'::text])))
- ket_noi_pkey: PRIMARY KEY (id)
- ket_noi_sale_id_fkey: FOREIGN KEY (sale_id) REFERENCES profiles(id)
- ket_noi_trang_thai_check: CHECK ((trang_thai = ANY (ARRAY['chua_ket_noi'::text, 'da_ket_noi'::text, 'chu_ngung'::text, 'sale_bo'::text])))
- ket_noi_sale: CREATE INDEX ket_noi_sale ON public.ket_noi USING btree (sale_id)

Policy:
- ket_noi_doc (SELECT, authenticated): ((chu_id = ( SELECT auth.uid() AS uid)) OR (sale_id = ( SELECT auth.uid() AS uid)))

## ket_noi_can

RLS: bật

| Cột | Kiểu | Null | Mặc định |
|---|---|---|---|
| ket_noi_id | uuid | không |  |
| can_id | uuid | không |  |

Ràng buộc:
- ket_noi_can_can_id_fkey: FOREIGN KEY (can_id) REFERENCES can(id)
- ket_noi_can_ket_noi_id_fkey: FOREIGN KEY (ket_noi_id) REFERENCES ket_noi(id) ON DELETE CASCADE
- ket_noi_can_pkey: PRIMARY KEY (ket_noi_id, can_id)

Policy:
- ket_noi_can_doc (SELECT, authenticated): (EXISTS ( SELECT 1
-    FROM ket_noi k
-   WHERE ((k.id = ket_noi_can.ket_noi_id) AND ((k.chu_id = ( SELECT auth.uid() AS uid)) OR (k.sale_id = ( SELECT auth.uid() AS uid))))))

## lan_gui_khach

RLS: bật

| Cột | Kiểu | Null | Mặc định |
|---|---|---|---|
| id | uuid | không | gen_random_uuid() |
| sale_id | uuid | không |  |
| can_id | uuid | không |  |
| dem | daterange | không |  |
| gui_luc | timestamp with time zone | không | now() |

Ràng buộc:
- lan_gui_khach_can_id_fkey: FOREIGN KEY (can_id) REFERENCES can(id)
- lan_gui_khach_pkey: PRIMARY KEY (id)
- lan_gui_khach_sale_id_fkey: FOREIGN KEY (sale_id) REFERENCES profiles(id)

Policy:
- lan_gui_khach_doc (SELECT, authenticated): (sale_id = ( SELECT auth.uid() AS uid))

## link_moi

RLS: bật

| Cột | Kiểu | Null | Mặc định |
|---|---|---|---|
| id | uuid | không | gen_random_uuid() |
| ma | text | không |  |
| loai | text | không |  |
| chu_id | uuid | không |  |
| het_han_luc | timestamp with time zone | không | (now() + '21 days'::interval) |
| thu_hoi_luc | timestamp with time zone | có |  |
| so_lan_gui | integer | không | 0 |
| gui_cuoi_luc | timestamp with time zone | có |  |
| tao_luc | timestamp with time zone | không | now() |

Ràng buộc:
- link_moi_chu_id_fkey: FOREIGN KEY (chu_id) REFERENCES profiles(id)
- link_moi_loai_check: CHECK ((loai = ANY (ARRAY['moi_sale'::text, 'gui_lich'::text])))
- link_moi_ma_key: UNIQUE (ma)
- link_moi_pkey: PRIMARY KEY (id)
- link_moi_chu: CREATE INDEX link_moi_chu ON public.link_moi USING btree (chu_id, loai) WHERE (thu_hoi_luc IS NULL)

Policy:
- link_moi_doc (SELECT, authenticated): (chu_id = ( SELECT auth.uid() AS uid))

## link_moi_can

RLS: bật

| Cột | Kiểu | Null | Mặc định |
|---|---|---|---|
| link_id | uuid | không |  |
| can_id | uuid | không |  |

Ràng buộc:
- link_moi_can_can_id_fkey: FOREIGN KEY (can_id) REFERENCES can(id)
- link_moi_can_link_id_fkey: FOREIGN KEY (link_id) REFERENCES link_moi(id) ON DELETE CASCADE
- link_moi_can_pkey: PRIMARY KEY (link_id, can_id)

Policy:
- link_moi_can_doc (SELECT, authenticated): (EXISTS ( SELECT 1
-    FROM link_moi l
-   WHERE ((l.id = link_moi_can.link_id) AND (l.chu_id = ( SELECT auth.uid() AS uid)))))

## link_xin_lich

RLS: bật

| Cột | Kiểu | Null | Mặc định |
|---|---|---|---|
| id | uuid | không | gen_random_uuid() |
| ma | text | không |  |
| sale_id | uuid | không |  |
| so_lan_gui | integer | không | 0 |
| gui_cuoi_luc | timestamp with time zone | có |  |
| tao_luc | timestamp with time zone | không | now() |

Ràng buộc:
- link_xin_lich_ma_key: UNIQUE (ma)
- link_xin_lich_pkey: PRIMARY KEY (id)
- link_xin_lich_sale_id_fkey: FOREIGN KEY (sale_id) REFERENCES profiles(id)
- link_xin_lich_sale_id_key: UNIQUE (sale_id)

Policy:
- link_xin_lich_doc (SELECT, authenticated): (sale_id = ( SELECT auth.uid() AS uid))

## muc_cong

RLS: bật

| Cột | Kiểu | Null | Mặc định |
|---|---|---|---|
| sale_id | uuid | không |  |
| can_id | uuid | không |  |
| muc | bigint | không |  |
| sua_luc | timestamp with time zone | không | now() |

Ràng buộc:
- muc_cong_can_id_fkey: FOREIGN KEY (can_id) REFERENCES can(id)
- muc_cong_muc_check: CHECK ((muc >= 0))
- muc_cong_pkey: PRIMARY KEY (sale_id, can_id)
- muc_cong_sale_id_fkey: FOREIGN KEY (sale_id) REFERENCES profiles(id)

Policy:
- muc_cong_doc (SELECT, authenticated): (sale_id = ( SELECT auth.uid() AS uid))

## ngay_le

RLS: bật

| Cột | Kiểu | Null | Mặc định |
|---|---|---|---|
| id | uuid | không | gen_random_uuid() |
| nam | integer | không |  |
| ten | text | không |  |
| tu_ngay | date | không |  |
| den_ngay | date | không |  |

Ràng buộc:
- ngay_le_check: CHECK ((den_ngay >= tu_ngay))
- ngay_le_pkey: PRIMARY KEY (id)

Policy:
- ngay_le_doc (SELECT, authenticated): true

## profiles

RLS: bật

| Cột | Kiểu | Null | Mặc định |
|---|---|---|---|
| id | uuid | không |  |
| ten | text | có |  |
| ten_hien_thi | text | có |  |
| anh_dai_dien | text | có |  |
| so_dien_thoai | text | có |  |
| vai_chon | text | có |  |
| dong_y_dieu_khoan_luc | timestamp with time zone | có |  |
| gio_nhan | time without time zone | có | '14:00:00'::time without time zone |
| gio_tra | time without time zone | có | '12:00:00'::time without time zone |
| dem_cuoi_tuan | smallint[] | không | '{5,6}'::smallint[] |
| mo_app_luc | timestamp with time zone | có |  |
| da_xoa_luc | timestamp with time zone | có |  |
| tao_luc | timestamp with time zone | không | now() |
| sua_luc | timestamp with time zone | không | now() |

Ràng buộc:
- profiles_dem_cuoi_tuan_hop_le: CHECK (((cardinality(dem_cuoi_tuan) >= 1) AND (dem_cuoi_tuan <@ '{1,2,3,4,5,6,7}'::smallint[])))
- profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id)
- profiles_pkey: PRIMARY KEY (id)
- profiles_vai_chon_check: CHECK ((vai_chon = ANY (ARRAY['chu_nha'::text, 'sale'::text])))
- profiles_xoa_tai_khoan_bo_so: CHECK (((da_xoa_luc IS NULL) OR (so_dien_thoai IS NULL)))
- profiles_so_khong_trung: CREATE UNIQUE INDEX profiles_so_khong_trung ON public.profiles USING btree (so_dien_thoai) WHERE ((da_xoa_luc IS NULL) AND (so_dien_thoai IS NOT NULL))

Policy:
- profiles_doc (SELECT, authenticated): (id = ( SELECT auth.uid() AS uid))

## sale_them_tay

RLS: bật

| Cột | Kiểu | Null | Mặc định |
|---|---|---|---|
| id | uuid | không | gen_random_uuid() |
| chu_id | uuid | không |  |
| ten | text | không |  |
| so_dien_thoai | text | có |  |
| tao_luc | timestamp with time zone | không | now() |

Ràng buộc:
- sale_them_tay_chu_id_fkey: FOREIGN KEY (chu_id) REFERENCES profiles(id)
- sale_them_tay_pkey: PRIMARY KEY (id)

Policy:
- sale_them_tay_doc (SELECT, authenticated): (chu_id = ( SELECT auth.uid() AS uid))

## thong_bao

RLS: bật

| Cột | Kiểu | Null | Mặc định |
|---|---|---|---|
| id | uuid | không | gen_random_uuid() |
| nguoi_nhan | uuid | không |  |
| loai | text | không |  |
| noi_dung | jsonb | không | '{}'::jsonb |
| doi_tuong_loai | text | có |  |
| doi_tuong_id | uuid | có |  |
| tao_luc | timestamp with time zone | không | now() |
| doc_luc | timestamp with time zone | có |  |

Ràng buộc:
- thong_bao_nguoi_nhan_fkey: FOREIGN KEY (nguoi_nhan) REFERENCES profiles(id)
- thong_bao_pkey: PRIMARY KEY (id)
- thong_bao_nguoi_nhan: CREATE INDEX thong_bao_nguoi_nhan ON public.thong_bao USING btree (nguoi_nhan, tao_luc DESC)
- thong_bao_nhac_coc_mot_lan: CREATE UNIQUE INDEX thong_bao_nhac_coc_mot_lan ON public.thong_bao USING btree (doi_tuong_id) WHERE (loai = 'dat_phong_chua_coc'::text)

Policy:
- thong_bao_doc (SELECT, authenticated): (nguoi_nhan = ( SELECT auth.uid() AS uid))

## tim_gan_day

RLS: bật

| Cột | Kiểu | Null | Mặc định |
|---|---|---|---|
| id | uuid | không | gen_random_uuid() |
| sale_id | uuid | không |  |
| tu_ngay | date | không |  |
| den_ngay | date | không |  |
| bo_loc | jsonb | không | '{}'::jsonb |
| tim_luc | timestamp with time zone | không | now() |

Ràng buộc:
- tim_gan_day_pkey: PRIMARY KEY (id)
- tim_gan_day_sale_id_fkey: FOREIGN KEY (sale_id) REFERENCES profiles(id)

Policy:
- tim_gan_day_doc (SELECT, authenticated): (sale_id = ( SELECT auth.uid() AS uid))

## toa_nha

RLS: bật

| Cột | Kiểu | Null | Mặc định |
|---|---|---|---|
| id | uuid | không | gen_random_uuid() |
| ten | text | không |  |
| home247_dat_san | boolean | không | false |
| tao_boi | uuid | có |  |
| tao_luc | timestamp with time zone | không | now() |
| khu_vuc | text | có |  |

Ràng buộc:
- toa_nha_pkey: PRIMARY KEY (id)
- toa_nha_tao_boi_fkey: FOREIGN KEY (tao_boi) REFERENCES profiles(id)
- toa_nha_ten_check: CHECK ((btrim(ten) <> ''::text))
- toa_nha_ten_khong_trung: CREATE UNIQUE INDEX toa_nha_ten_khong_trung ON public.toa_nha USING btree (lower(btrim(ten)))

Policy:
- toa_nha_doc (SELECT, authenticated): true

## xem_link_dem

RLS: bật

| Cột | Kiểu | Null | Mặc định |
|---|---|---|---|
| dia_chi | text | không |  |
| phut | timestamp with time zone | không |  |
| so | integer | không | 0 |

Ràng buộc:
- xem_link_dem_pkey: PRIMARY KEY (dia_chi, phut)

Policy:

## yeu_cau_dat_phong

RLS: bật

| Cột | Kiểu | Null | Mặc định |
|---|---|---|---|
| id | uuid | không | gen_random_uuid() |
| can_id | uuid | không |  |
| sale_id | uuid | không |  |
| ngay_nhan | date | không |  |
| ngay_tra | date | không |  |
| dem | daterange | có | daterange(ngay_nhan, ngay_tra, '[)'::text) |
| loi_nhan | text | có |  |
| gia_chu_dem | bigint[] | có |  |
| trang_thai | text | không | 'cho'::text |
| ly_do_tu_choi | text | có |  |
| gui_luc | timestamp with time zone | không | now() |
| han_luc | timestamp with time zone | không | (now() + '14 days'::interval) |
| tra_loi_luc | timestamp with time zone | có |  |
| booking_id | uuid | có |  |
| client_id | uuid | có |  |
| tu_choi_vi_booking | uuid | có |  |

Ràng buộc:
- yeu_cau_booking: FOREIGN KEY (booking_id) REFERENCES booking(id)
- yeu_cau_client_id_khong_trung: UNIQUE (sale_id, client_id)
- yeu_cau_dat_phong_can_id_fkey: FOREIGN KEY (can_id) REFERENCES can(id)
- yeu_cau_dat_phong_loi_nhan_check: CHECK ((char_length(loi_nhan) <= 500))
- yeu_cau_dat_phong_pkey: PRIMARY KEY (id)
- yeu_cau_dat_phong_sale_id_fkey: FOREIGN KEY (sale_id) REFERENCES profiles(id)
- yeu_cau_dat_phong_trang_thai_check: CHECK ((trang_thai = ANY (ARRAY['cho'::text, 'da_chot'::text, 'bi_tu_choi'::text, 'da_huy'::text, 'het_han'::text])))
- yeu_cau_ngay_hop_le: CHECK ((ngay_tra > ngay_nhan))
- yeu_cau_can: CREATE INDEX yeu_cau_can ON public.yeu_cau_dat_phong USING btree (can_id, trang_thai)

Policy:
- yeu_cau_doc (SELECT, authenticated): ((sale_id = ( SELECT auth.uid() AS uid)) OR ((trang_thai <> 'da_huy'::text) AND (can_id IN ( SELECT my_own_can_ids() AS my_own_can_ids))))

## yeu_cau_rieng

RLS: bật

| Cột | Kiểu | Null | Mặc định |
|---|---|---|---|
| yeu_cau_id | uuid | không |  |
| sale_id | uuid | không |  |
| gia_ban_dem | bigint[] | có |  |
| ten_khach | text | có |  |
| sdt_khach | text | có |  |

Ràng buộc:
- yeu_cau_rieng_pkey: PRIMARY KEY (yeu_cau_id)
- yeu_cau_rieng_sale_id_fkey: FOREIGN KEY (sale_id) REFERENCES profiles(id)
- yeu_cau_rieng_yeu_cau_id_fkey: FOREIGN KEY (yeu_cau_id) REFERENCES yeu_cau_dat_phong(id) ON DELETE CASCADE

Policy:
- yeu_cau_rieng_doc (SELECT, authenticated): (sale_id = ( SELECT auth.uid() AS uid))

## View

- v_booking_cua_sale: id, can_id, ma_can, chu_id, ten_chu, chu_da_xoa_tai_khoan, ngay_nhan, ngay_tra, nguon, tien_phong, trang_thai, huy_xin_boi, huy_xin_luc, huy_tra_loi, huy_tra_loi_luc, tao_luc
- v_can_cua_toi: id, ma_can, so_phong_ngu, so_giuong, loai_view, ten_toa, tao_luc, moi_them, so_anh, anh_dai_dien, khach_den
- v_lich_sale: can_id, dem
- v_nguoi_ket_noi: id, ten_hien_thi, so_dien_thoai, da_xoa_tai_khoan

## Hàm

- anh_can_vao_hang_xoa() → trigger · security definer
- can_chia_se_cho_sale(p_sale uuid, p_can uuid) → boolean · security definer
- can_cua_link(p_link link_moi) → SETOF uuid · security definer
- can_dang_nhap() → uuid · security definer · gọi được: authenticated
- can_gui_khach_duoc(p_nguoi uuid) → SETOF uuid · security definer
- can_la_sale() → uuid · security definer
- can_tim(p_nguoi uuid, p_tu date, p_den date, p_pn smallint[], p_toa uuid[], p_view text[]) → TABLE(can_id uuid, nhom text, ma_can text, toa_nha_id uuid, ten_toa text, ten_chu text, so_phong_ngu smallint, loai_view text, lich_doi_luc timestamp with time zone, tong_gia_chu bigint, tong_gia_ban bigint) · security definer
- chu_dai_ngay(p_tu date, p_den date) → text · gọi được: authenticated
- chuan_hoa_so(p_so text) → text · security definer
- dem_can_trong(p_nguoi uuid, p_tu date, p_den date, p_pn smallint[], p_toa uuid[], p_view text[], OUT so integer, OUT ten_toa jsonb) → record · security definer
- fn_bo_dong_sale(p_ket_noi_id uuid) → void · security definer · gọi được: authenticated
- fn_bo_muc_cong(p_can_id uuid) → void · security definer · gọi được: authenticated
- fn_can_tu_nhap(p_can_id uuid) → jsonb · security definer · gọi được: authenticated
- fn_can_tuong_tu(p_yeu_cau_id uuid) → jsonb · security definer · gọi được: authenticated
- fn_chap_nhan_yeu_cau(p_yeu_cau_id uuid) → jsonb · security definer · gọi được: authenticated
- fn_chi_tiet_can_cua_toi(p_can_id uuid, p_tu date) → jsonb · security definer · gọi được: authenticated
- fn_chi_tiet_chu_nha(p_ket_noi_id uuid, p_ngay date) → jsonb · security definer · gọi được: authenticated
- fn_chi_tiet_dat_phong(p_booking_id uuid) → TABLE(id uuid, can_id uuid, ma_can text, ngay_nhan date, ngay_tra date, gio_nhan time without time zone, gio_tra time without time zone, tien_phong bigint, tien_coc bigint, trang_thai_tien text, co_hoan_tac boolean, trang_thai text, nguon text, ghi_chu text, sale_id uuid, ten_sale text, sdt_sale text, sale_da_xoa boolean, ten_khach text, sdt_khach text, so_khach integer, sua_luc timestamp with time zone) · security definer · gọi được: authenticated
- fn_chon_vai(p_vai text) → void · security definer · gọi được: authenticated
- fn_chu_xem_yeu_cau(p_yeu_cau_id uuid) → jsonb · security definer · gọi được: authenticated
- fn_da_thu_du(p_booking_id uuid) → text · security definer · gọi được: authenticated
- fn_da_xoa_file(p_duong_dan text[]) → void · security definer
- fn_dang_ky(p_ten text, p_so text) → void · security definer · gọi được: authenticated
- fn_danh_dau_da_doc(p_ids uuid[]) → integer · security definer · gọi được: authenticated
- fn_danh_sach_sale(p_bo_qua integer) → jsonb · security definer · gọi được: authenticated
- fn_dat_cai_dat_thong_bao(p_tat text[]) → void · security definer · gọi được: authenticated
- fn_dat_dem_cuoi_tuan(p_dem smallint[]) → void · security definer · gọi được: authenticated
- fn_dat_gia_thang(p_can_id uuid, p_thang date[], p_gia_thuong bigint, p_gia_cuoi_tuan bigint) → void · security definer · gọi được: authenticated
- fn_dat_gia_thang_nhieu(p_can_ids uuid[], p_thang date[], p_gia_thuong bigint, p_gia_cuoi_tuan bigint) → void · security definer · gọi được: authenticated
- fn_dat_gio_nhan_tra(p_nhan time without time zone, p_tra time without time zone) → void · security definer · gọi được: authenticated
- fn_dat_mau_tin(p_mau text) → void · security definer · gọi được: authenticated
- fn_dat_muc_cong(p_can_id uuid, p_muc bigint) → void · security definer · gọi được: authenticated
- fn_dat_muc_cong_mac_dinh(p_muc bigint, p_lam_tron boolean) → void · security definer · gọi được: authenticated
- fn_dat_phong_cua_sale(p_sale_id uuid) → TABLE(id uuid, can_id uuid, ma_can text, ngay_nhan date, ngay_tra date, tien_phong bigint, trang_thai text, trang_thai_tien text) · security definer · gọi được: authenticated
- fn_dat_xem_coc(p_ket_noi_id uuid, p_bat boolean) → boolean · security definer · gọi được: authenticated
- fn_dem_xuat_csv(p_tu date, p_den date, p_can_ids uuid[]) → integer · security definer · gọi được: authenticated
- fn_doanh_thu_thang(p_thang date) → TABLE(doanh_thu bigint, so_dem integer, doanh_thu_thang_truoc bigint) · security definer · gọi được: authenticated
- fn_doi_link_moi() → void · security definer · gọi được: authenticated
- fn_don_anh_tam() → SETOF text · security definer
- fn_dong_y_xin_lich(p_ma text, p_xem_coc boolean) → jsonb · security definer · gọi được: authenticated
- fn_ds_sale_cua_toi() → TABLE(id uuid, loai text, sale_id uuid, ten text, so_dien_thoai text, nhom text, da_xoa_tai_khoan boolean, xem_coc boolean, so_dat_phong integer, tong_tien_phong bigint, ket_noi_luc timestamp with time zone, ngung_luc timestamp with time zone) · security definer · gọi được: authenticated
- fn_ds_thong_bao(p_truoc_luc timestamp with time zone, p_truoc_id uuid) → jsonb · security definer · gọi được: authenticated
- fn_file_cho_xoa(p_so integer) → SETOF text · security definer
- fn_ghi_dat_phong_tu_ghi(p_can_id uuid, p_ngay_nhan date, p_ngay_tra date, p_tra_chu bigint, p_thu_khach bigint, p_client_id uuid) → uuid · security definer · gọi được: authenticated
- fn_ghi_lan_gui(p_can_ids uuid[], p_tu date, p_den date) → integer · security definer · gọi được: authenticated
- fn_gia_chu_cac_dem(p_can_id uuid, p_ngay_nhan date, p_ngay_tra date) → TABLE(dem date, gia bigint) · security definer · gọi được: authenticated
- fn_gia_dien_san_tu_ghi(p_can_id uuid, p_ngay_nhan date, p_ngay_tra date) → jsonb · security definer · gọi được: authenticated
- fn_gia_tuan_cua_toi(p_tu date) → TABLE(can_id uuid, gia_thap bigint, gia_cao bigint) · security definer · gọi được: authenticated
- fn_gia_tung_dem_cua_toi(p_tu date, p_den date) → TABLE(can_id uuid, dem date, gia bigint) · security definer · gọi được: authenticated
- fn_gui_lich(p_can_ids uuid[]) → TABLE(ma text, so_lan_gui integer, het_han_luc timestamp with time zone) · security definer · gọi được: authenticated
- fn_gui_link_xin_lich() → TABLE(ma text, so_lan_gui integer, gui_cuoi_luc timestamp with time zone) · security definer · gọi được: authenticated
- fn_gui_yeu_cau(p_can_id uuid, p_ngay_nhan date, p_ngay_tra date, p_loi_nhan text, p_client_id uuid) → jsonb · security definer · gọi được: authenticated
- fn_het_han_yeu_cau() → integer · security definer
- fn_hoan_tac_thu_du(p_booking_id uuid) → text · security definer · gọi được: authenticated
- fn_huy_yeu_cau(p_yeu_cau_id uuid) → jsonb · security definer · gọi được: authenticated
- fn_ket_qua_yeu_cau(p_yeu_cau_id uuid) → jsonb · security definer · gọi được: authenticated
- fn_lay_link_moi() → TABLE(ma text, so_lan_gui integer, het_han_luc timestamp with time zone) · security definer · gọi được: authenticated
- fn_lay_link_xin_lich() → text · security definer · gọi được: authenticated
- fn_lich_gia_thang(p_can_id uuid, p_thang date) → TABLE(dem date, gia bigint, loai text, co_khach boolean) · security definer · gọi được: authenticated
- fn_luu_gia_dip(p_can_id uuid, p_tu_ngay date, p_den_ngay date, p_ten text, p_gia bigint, p_la_ngay_le boolean) → uuid · security definer · gọi được: authenticated
- fn_mau_tin() → text · security definer · gọi được: authenticated
- fn_mo_app() → TABLE(id uuid, loai text, noi_dung jsonb, doi_tuong_loai text, doi_tuong_id uuid, tao_luc timestamp with time zone, doc_luc timestamp with time zone) · security definer · gọi được: authenticated
- fn_muc_cong_mac_dinh() → jsonb · security definer · gọi được: authenticated
- fn_ngung_cho_xem(p_ket_noi_id uuid) → text · security definer · gọi được: authenticated
- fn_nhac_chua_coc() → integer · security definer
- fn_sale_bo_dong_chu(p_ket_noi_id uuid) → void · security definer · gọi được: authenticated
- fn_sale_bo_nguon(p_ket_noi_id uuid) → void · security definer · gọi được: authenticated
- fn_sale_chi_tiet_can(p_can_id uuid, p_tu date, p_den date) → jsonb · security definer · gọi được: authenticated
- fn_sale_da_coc(p_booking_id uuid) → boolean · security definer · gọi được: authenticated
- fn_sale_lich(p_tu date, p_den date) → TABLE(can_id uuid, nhom text, ma_can text, ten_toa text, ten_chu text, so_phong_ngu smallint, loai_view text, lich_doi_luc timestamp with time zone, so_ban integer, dem date, o text, gia_ban bigint) · security definer · gọi được: authenticated
- fn_sale_sua_gia_ban(p_booking_id uuid, p_gia_ban bigint) → void · security definer · gọi được: authenticated
- fn_sale_tim(p_tu date, p_den date, p_so_phong_ngu smallint[], p_toa_nha uuid[], p_view text[]) → jsonb · security definer · gọi được: authenticated
- fn_sale_xem_dat_phong(p_booking_id uuid) → jsonb · security definer · gọi được: authenticated
- fn_sao_chep_gia(p_tu_can uuid, p_den_can uuid[], p_thang boolean, p_ngay_le boolean, p_dip boolean, p_nam integer) → jsonb · security definer · gọi được: authenticated
- fn_soan_tin_gui_khach(p_can_ids uuid[], p_tu date, p_den date) → jsonb · security definer · gọi được: authenticated
- fn_sua_booking(p_booking_id uuid, p_sua_luc timestamp with time zone, p_can_id uuid, p_ngay_nhan date, p_ngay_tra date, p_tien_phong bigint, p_trang_thai_tien text, p_tien_coc bigint, p_ten_khach text, p_sdt_khach text, p_so_khach integer, p_gio_nhan time without time zone, p_gio_tra time without time zone, p_ghi_chu text) → timestamp with time zone · security definer · gọi được: authenticated
- fn_sua_can(p_can_id uuid, p_sua jsonb) → void · security definer · gọi được: authenticated
- fn_sua_can_tu_nhap(p_can_id uuid, p_sua jsonb) → void · security definer · gọi được: authenticated
- fn_sua_dat_phong_tu_ghi(p_booking_id uuid, p_ngay_nhan date, p_ngay_tra date, p_tra_chu bigint, p_thu_khach bigint) → void · security definer · gọi được: authenticated
- fn_sua_ho_so(p_ten text, p_ten_hien_thi text, p_so text, p_anh text) → void · security definer · gọi được: authenticated
- fn_tab_can_sale() → TABLE(nhom text, can_id uuid, ma_can text, ten_toa text, so_phong_ngu smallint, so_giuong smallint, loai_view text, khach_den date, ket_noi_id uuid, chu_id uuid, ten_chu text, chu_da_xoa_tai_khoan boolean, cap_nhat_luc timestamp with time zone, chu_can_ten text, chu_ngung boolean) · security definer · gọi được: authenticated
- fn_tao_booking(p_can_id uuid, p_ngay_nhan date, p_ngay_tra date, p_tien_phong bigint, p_client_id uuid, p_sale_id uuid, p_ten_khach text, p_sdt_khach text, p_trang_thai_tien text, p_tien_coc bigint, p_so_khach integer, p_gio_nhan time without time zone, p_gio_tra time without time zone, p_ghi_chu text) → uuid · security definer · gọi được: authenticated
- fn_tao_can(p_ma_can text, p_so_phong_ngu integer, p_client_id uuid, p_so_giuong integer, p_loai_view text, p_toa_nha_id uuid, p_mo_ta text, p_anh uuid[]) → uuid · security definer · gọi được: authenticated
- fn_tao_can_tu_nhap(p_chu_can_ten text, p_chu_can_sdt text, p_ma_can text, p_so_phong_ngu integer, p_client_id uuid, p_toa_nha_id uuid, p_loai_view text, p_so_giuong integer, p_gia_chu_thuong bigint, p_gia_chu_cuoi_tuan bigint, p_anh uuid[]) → uuid · security definer · gọi được: authenticated
- fn_ten_khach_da_dung() → TABLE(ten text) · security definer · gọi được: authenticated
- fn_them_anh_tam(p_duong_dan text) → uuid · security definer · gọi được: authenticated
- fn_them_lich_link_moi(p_ma text) → text · security definer · gọi được: authenticated
- fn_them_sale_tay(p_ten text, p_so text) → uuid · security definer · gọi được: authenticated
- fn_them_toa(p_ten text) → uuid · security definer · gọi được: authenticated
- fn_thong_ke_chu(p_thang date, p_so_thang integer) → jsonb · security definer · gọi được: authenticated
- fn_thong_ke_sale(p_thang date, p_so_thang integer) → jsonb · security definer · gọi được: authenticated
- fn_tinh_trang_huy(p_booking_id uuid) → jsonb · security definer · gọi được: authenticated
- fn_tra_loi_huy(p_booking_id uuid, p_dong_y boolean) → void · security definer · gọi được: authenticated
- fn_tu_choi_yeu_cau(p_yeu_cau_id uuid, p_ly_do text) → jsonb · security definer · gọi được: authenticated
- fn_xem_link_moi(p_ma text) → jsonb · security definer · gọi được: anon, authenticated
- fn_xem_link_xin_lich(p_ma text) → jsonb · security definer · gọi được: authenticated
- fn_xin_huy(p_booking_id uuid) → void · security definer · gọi được: authenticated
- fn_xoa_booking(p_booking_id uuid) → void · security definer · gọi được: authenticated
- fn_xoa_can(p_can_id uuid) → void · security definer · gọi được: authenticated
- fn_xoa_can_tu_nhap(p_can_id uuid) → void · security definer · gọi được: authenticated
- fn_xoa_dat_phong_tu_ghi(p_booking_id uuid) → void · security definer · gọi được: authenticated
- fn_xoa_sale_tay(p_id uuid) → void · security definer · gọi được: authenticated
- fn_xoa_tai_khoan() → void · security definer · gọi được: authenticated
- fn_xuat_csv(p_tu date, p_den date, p_can_ids uuid[]) → TABLE(ma_can text, ngay_nhan date, ngay_tra date, so_dem integer, ten_khach text, sdt_khach text, ten_sale text, sale_da_xoa boolean, tong_tien bigint, da_coc bigint, con_lai bigint, ghi_chu text) · security definer · gọi được: authenticated
- fn_yeu_cau_cua_toi(p_yeu_cau_id uuid) → jsonb · security definer · gọi được: authenticated
- fn_yeu_cau_dang_cho() → jsonb · security definer · gọi được: authenticated
- gan_anh_can(p_can_id uuid, p_nguoi uuid, p_anh uuid[], p_chi_kiem boolean) → void · security definer
- ghi_thong_bao_dong_y(p_chu uuid, p_sale uuid, p_ket_noi uuid) → void · security definer
- gia_ban_dem(p_sale_id uuid, p_can_id uuid, p_dem date) → bigint · security definer
- gia_ban_tu_tien_dem(p_sale_id uuid, p_can_id uuid, p_tien_dem bigint[]) → bigint · security definer
- gia_chu_dem(p_can_id uuid, p_dem date) → bigint · security definer
- gia_gui_khach_dem(p_nguoi uuid, p_can_id uuid, p_dem date) → bigint · security definer
- het_han_vi(p_y yeu_cau_dat_phong) → text · security definer
- ket_qua_tra_loi(p_id uuid, p_doi boolean) → jsonb · security definer
- khoa_booking_cua_chu(p_booking_id uuid) → booking · security definer
- khoa_booking_hai_ben(p_booking_id uuid, p_khoa boolean) → TABLE(b booking, chu_id uuid, ma_can text, ten_toa text, loai_can text) · security definer
- khoa_yeu_cau_cua_chu(p_yeu_cau_id uuid) → yeu_cau_dat_phong · security definer
- kiem_can_tu_nhap(p_nguoi uuid, p_can_id uuid, p_ten text, p_sdt text, p_ma text, p_so_pn integer, p_toa uuid, p_view text, p_so_giuong integer, p_gia_thuong bigint, p_gia_cuoi_tuan bigint, p_bat_buoc text[]) → void · security definer
- kiem_dat_phong_tu_ghi(p_can_id uuid, p_bo_id uuid, p_ngay_nhan date, p_ngay_tra date, p_tra_chu bigint, p_thu_khach bigint) → void · security definer
- kiem_du_lieu_booking(p_ngay_nhan date, p_ngay_tra date, p_tien_phong bigint, p_trang_thai_tien text, p_tien_coc bigint, p_ten_khach text, p_sdt_khach text, p_so_khach integer, p_ghi_chu text, OUT o_trang_thai_tien text, OUT o_tien_coc bigint, OUT o_ten_khach text, OUT o_sdt_khach text, OUT o_ghi_chu text) → record
- kiem_lenh_gui_khach(p_nguoi uuid, p_can_ids uuid[], p_tu date, p_den date) → void · security definer
- kiem_tien_dem(p_booking_id uuid) → void · security definer
- link_xin_lich_dung_duoc(p_link link_xin_lich, p_nguoi uuid) → boolean · security definer
- loai_thong_bao_chu() → text[]
- loai_thong_bao_sale() → text[]
- local_today() → date · security definer · gọi được: authenticated
- ly_do_mat_quyen_can(p_sale uuid, p_can_id uuid) → text · security definer
- ma_link_chu_cai() → text
- ma_view(p text) → text · security definer
- mau_tin_mac_dinh() → text
- my_own_can_ids() → SETOF uuid · security definer · gọi được: authenticated
- my_shared_can_ids() → SETOF uuid · security definer · gọi được: authenticated
- o_lich(p_can_id uuid, p_dem date) → text · security definer · gọi được: authenticated
- tach_tien_theo_dem(p_tong bigint, p_so_dem integer) → bigint[] · security definer · gọi được: authenticated
- tg_bao_chu_them_can() → trigger · security definer
- tg_bao_yeu_cau_bi_tu_choi() → trigger · security definer
- tg_bao_yeu_cau_het_han() → trigger · security definer
- tg_booking_bao_lan_gui_khi_sua() → trigger · security definer
- tg_booking_can_chua_an() → trigger · security definer
- tg_booking_huy_hai_ben() → trigger · security definer
- tg_booking_nhat_ky() → trigger · security definer
- tg_booking_sau_khi_ghi() → trigger · security definer
- tg_booking_sau_khi_sua() → trigger · security definer
- tg_booking_sau_khi_xoa() → trigger · security definer
- tg_booking_tu_choi_yeu_cau_trung() → trigger · security definer
- tg_ket_noi_can_sale_da_xoa() → trigger · security definer
- tg_ket_noi_sale_da_xoa() → trigger · security definer
- tg_kiem_tien_dem() → trigger · security definer
- tg_tao_ho_so() → trigger · security definer
- tg_thong_bao_cong_tac() → trigger · security definer
- tg_yeu_cau_can_chua_an() → trigger · security definer
- thong_bao_bat(p_nguoi uuid, p_loai text) → boolean · security definer
- tien_cac_dem(p_can_id uuid, p_ngay_nhan date, p_ngay_tra date, p_tong bigint) → bigint[] · security definer
- tien_dem_tu_ghi(p_can_id uuid, p_ngay_nhan date, p_ngay_tra date, p_tong bigint) → bigint[] · security definer
- trang_thai_link_moi(p_link link_moi) → text · security definer
- xin_lich_cua_toi() → TABLE(ma text, so_lan_gui integer, gui_cuoi_luc timestamp with time zone, so_chu_dong_y integer, co_nguon boolean) · gọi được: authenticated
- yeu_cau_cho_chu(p_id uuid) → jsonb · security definer
- yeu_cau_cho_sale(p_id uuid) → jsonb · security definer
- yeu_cau_qua_han(p_y yeu_cau_dat_phong) → boolean · security definer
- yeu_cau_trung_chi_tiet(p_id uuid) → jsonb · security definer
- yeu_cau_trung_voi(p_id uuid) → jsonb · security definer
- yeu_cau_tu_choi_theo(p_id uuid) → jsonb · security definer
