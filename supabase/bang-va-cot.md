# Bảng và cột · [tự sinh] bởi scripts/bang-cot.sh từ supabase/migrations. Không sửa tay.

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
- can_ma_khong_trung: CREATE UNIQUE INDEX can_ma_khong_trung ON public.can USING btree (nguoi_giu, lower(btrim(ma_can))) WHERE (an_luc IS NULL)

Policy:
- can_doc (SELECT, authenticated): ((nguoi_giu = ( SELECT auth.uid() AS uid)) OR (id IN ( SELECT my_shared_can_ids() AS my_shared_can_ids)))

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

Ràng buộc:
- toa_nha_pkey: PRIMARY KEY (id)
- toa_nha_tao_boi_fkey: FOREIGN KEY (tao_boi) REFERENCES profiles(id)
- toa_nha_ten_check: CHECK ((btrim(ten) <> ''::text))
- toa_nha_ten_khong_trung: CREATE UNIQUE INDEX toa_nha_ten_khong_trung ON public.toa_nha USING btree (lower(btrim(ten)))

Policy:
- toa_nha_doc (SELECT, authenticated): true

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
- yeu_cau_doc (SELECT, authenticated): ((sale_id = ( SELECT auth.uid() AS uid)) OR (can_id IN ( SELECT my_own_can_ids() AS my_own_can_ids)))

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
- v_lich_sale: can_id, dem
- v_nguoi_ket_noi: id, ten_hien_thi, so_dien_thoai, da_xoa_tai_khoan

## Hàm

- can_dang_nhap() → uuid · security definer · gọi được: authenticated
- kiem_tien_dem(p_booking_id uuid) → void · security definer
- local_today() → date · security definer · gọi được: authenticated
- my_own_can_ids() → SETOF uuid · security definer · gọi được: authenticated
- my_shared_can_ids() → SETOF uuid · security definer · gọi được: authenticated
- o_lich(p_can_id uuid, p_dem date) → text · security definer · gọi được: authenticated
- tach_tien_theo_dem(p_tong bigint, p_so_dem integer) → bigint[] · security definer · gọi được: authenticated
- tg_booking_huy_hai_ben() → trigger · security definer
- tg_booking_nhat_ky() → trigger · security definer
- tg_kiem_tien_dem() → trigger · security definer
