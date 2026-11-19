---
item: EN2
task: [EN2-TA1]
model: opus
soan_bang: tay (item EN không có mục thuc_hien để scripts/goi.py chép)
---
# Gói việc EN2-TA1 · test database viết trước

## Việc
Viết test database cho từng bất biến ở `docs/architecture/thiet-ke-db.md` mục 3 (mã KT-DB.3.1 đến KT-DB.3.12), cùng các phép thử làm hỏng. Viết từ bất biến và hợp đồng dưới đây, không nhìn code migration. Task sau (EN2-TA2, viết migration) không được sửa các file test này.

## Hợp đồng database (tên do EN2-TA2 làm theo)
Mọi bảng ở schema `public`. Khóa `uuid` (`gen_random_uuid()`), tiền `bigint` (đồng), ngày `date`, lúc `timestamptz`.
Mọi bảng bật RLS. App (vai `authenticated`) chỉ có quyền `select`, không có `insert`, `update`, `delete` trên bảng nào. Vai `anon` không có quyền trên bảng, view nào; chỉ được gọi hàm `fn_xem_link_moi` (hàm này chưa có ở EN2).

Người dùng:
- `profiles(id → auth.users, ten, ten_hien_thi, so_dien_thoai, vai_chon in ('chu_nha','sale'), gio_nhan time, gio_tra time, dem_cuoi_tuan smallint[] (isodow, mặc định {5,6}, ít nhất 1 phần tử), mo_app_luc, da_xoa_luc, tao_luc)`. Ràng buộc: `da_xoa_luc` có giá trị thì `so_dien_thoai` phải null. RLS: mỗi người chỉ đọc dòng của mình.
- `v_nguoi_ket_noi(id, ten_hien_thi, so_dien_thoai, da_xoa_tai_khoan boolean)`: người kia trong các kết nối `da_ket_noi` của người gọi (cả hai chiều). Chủ đã xóa tài khoản: so_dien_thoai null, cờ true.
- `cai_dat_rieng(nguoi_id pk, muc_cong_mac_dinh bigint, lam_tron_50k boolean, mau_tin text, thong_bao_tat text[])`: chỉ chính người đó đọc.
- `admins(email pk, nguoi_id, la_goc boolean, them_luc)`: app không đọc. Tối đa một dòng `la_goc = true`.

Căn:
- `toa_nha(id, ten, home247_dat_san boolean, tao_boi, tao_luc)`: mọi người đăng nhập đọc. Tên không trùng không phân biệt hoa thường.
- `can(id, nguoi_giu → profiles, loai in ('co_lich','tu_nhap'), ma_can, so_phong_ngu, so_giuong, loai_view, toa_nha_id, mo_ta, chu_can_ten, chu_can_sdt, gia_chu_thuong, gia_chu_cuoi_tuan, an_luc (căn đã xóa = đã ẩn), lich_doi_luc, tao_luc)`. Một người giữ không có hai căn chưa ẩn trùng `lower(btrim(ma_can))`. RLS: người giữ đọc mọi căn của mình (kể cả đã ẩn); sale đọc căn có id trong `my_shared_can_ids()`.
- `anh_can(id, can_id null khi ảnh tạm, nguoi_tai, duong_dan, thu_tu, tao_luc)`: đọc theo quyền đọc căn; ảnh tạm chỉ người tải đọc.

Kết nối:
- `ket_noi(id, chu_id, sale_id, trang_thai in ('chua_ket_noi','da_ket_noi','chu_ngung','sale_bo'), nguon in ('link_moi','sale_xin','gui_lich','them_tay'), pham_vi in ('tat_ca','chon_can'), xem_coc boolean, tao_luc, sua_luc)`, duy nhất `(chu_id, sale_id)`, `chu_id <> sale_id`. Không có cột nào bật tắt giá (QD7). RLS: chủ và sale của dòng đọc.
- `ket_noi_can(ket_noi_id, can_id)`: căn được chọn khi `pham_vi = 'chon_can'`. Đọc như `ket_noi`.
- `link_moi(id, ma unique, loai in ('moi_sale','gui_lich'), chu_id, het_han_luc, thu_hoi_luc, so_lan_gui, gui_cuoi_luc, tao_luc)`, `link_moi_can(link_id, can_id)`: chỉ chủ tạo đọc.
- `link_xin_lich(id, ma unique, sale_id unique, so_lan_gui, gui_cuoi_luc, tao_luc)`: chỉ sale đó đọc.
- `sale_them_tay(id, chu_id, ten, so_dien_thoai, tao_luc)`: chỉ chủ đó đọc.

Giá:
- `gia_thang(can_id, thang date (ngày 1 của tháng), gia_thuong bigint > 0, gia_cuoi_tuan bigint > 0)`, khóa `(can_id, thang)`.
- `gia_dip(id, can_id, tu_ngay, den_ngay, ten, gia bigint > 0, la_ngay_le boolean)`: tối đa 10 ngày; hai dải của một căn không chồng ngày (ràng buộc `gia_dip_khong_chong`).
- RLS của `gia_thang`, `gia_dip`: người giữ căn và sale có căn trong `my_shared_can_ids()`.
- `ngay_le(id, nam, ten, tu_ngay, den_ngay)`: mọi người đăng nhập đọc.
- `muc_cong(sale_id, can_id, muc bigint)`: chỉ sale đó đọc.

Đặt phòng:
- `booking(id, can_id, ngay_nhan, ngay_tra, dem daterange (tự sinh = daterange(ngay_nhan, ngay_tra, '[)')), nguon in ('chu_ghi','tu_yeu_cau','sale_tu_ghi'), sale_id (sale đứng tên, null nếu khách lẻ), tao_boi, tien_phong bigint not null >= 0, trang_thai_tien in ('chua_coc','da_coc','da_thanh_toan') hoặc null, tien_coc bigint, trang_thai in ('hieu_luc','da_huy') mặc định 'hieu_luc', huy_xin_boi, huy_xin_luc, huy_tra_loi in ('dong_y','tu_choi'), huy_tra_loi_boi, huy_tra_loi_luc, yeu_cau_id, client_id, tao_luc, sua_luc)`. `ngay_tra > ngay_nhan`.
  - Ràng buộc `booking_khong_trung`: `exclude using gist (can_id with =, dem with &&) where (trang_thai <> 'da_huy')`, mã lỗi 23P01.
  - Booking có `sale_id` (bất biến 8), chặn bằng trigger ở database, kể cả khi chủ database ghi thẳng: không xóa được dòng; chỉ sang `da_huy` khi đã có `huy_xin_boi`, `huy_tra_loi = 'dong_y'` và `huy_tra_loi_boi <> huy_xin_boi`; người xin và người trả lời phải là chủ căn hoặc sale đứng tên; booking đã có `huy_tra_loi = 'tu_choi'` thì không đặt lại `huy_xin_boi` khác null được (không xin lại). Câu lỗi tiếng Việt, mã lỗi P0001.
  - RLS: chỉ người giữ căn đọc (`can_id in (select my_own_can_ids())`). Sale không đọc được booking căn người khác.
- `booking_dem(booking_id, dem date, tien bigint >= 0)`, khóa `(booking_id, dem)`. Bất biến 10, kiểm lúc commit (constraint trigger deferred): tập đêm đúng bằng các đêm của `booking.dem` và tổng `tien` bằng `booking.tien_phong`. Sai thì commit lỗi, mã P0001. Trong test chạy trong một giao dịch, dùng `set constraints all immediate` để ép kiểm ngay.
- `tach_tien_theo_dem(p_tong bigint, p_so_dem int) returns bigint[]`: chia đều, phần lẻ dồn vào đêm cuối (QT4.2-VD2: 1.000.000đ, 3 đêm → {333333,333333,333334}).
- `booking_rieng(booking_id, nguoi_id, ten_khach, sdt_khach, tien_thu_khach)`, khóa `(booking_id, nguoi_id)`: chỉ chính người đó đọc.
- `yeu_cau_dat_phong(id, can_id, sale_id, ngay_nhan, ngay_tra, loi_nhan (<= 500 ký tự), gia_chu_dem bigint[], trang_thai in ('cho','da_chot','bi_tu_choi','da_huy','het_han'), ly_do_tu_choi, gui_luc, han_luc, booking_id, client_id)`: sale gửi và chủ căn đọc. Không có cột giá bán.
- `yeu_cau_rieng(yeu_cau_id pk, sale_id, gia_ban_dem bigint[], ten_khach, sdt_khach)`: chỉ sale đó đọc.
- `v_lich_sale(can_id, dem date)`: đêm kín của căn trong `my_shared_can_ids()` (booking chưa hủy). Không có cột người đặt, tiền.
- `v_booking_cua_sale(id, can_id, ma_can, chu_id, ten_chu, ngay_nhan, ngay_tra, nguon, tien_phong, trang_thai, huy_xin_boi, huy_tra_loi)`: booking có `sale_id` = người gọi, kể cả khi đã bị ngừng hay chủ đã xóa tài khoản. Không có `tien_coc`, `trang_thai_tien`, khách của chủ.

Khác:
- `thong_bao(id, nguoi_nhan, loai, noi_dung jsonb, doi_tuong_loai, doi_tuong_id, tao_luc, doc_luc)`: chỉ người nhận đọc.
- `lan_gui_khach(id, sale_id, can_id, dem daterange, gui_luc)`, `tim_gan_day(id, sale_id, tu_ngay, den_ngay, bo_loc jsonb, tim_luc)`: chỉ sale đó đọc.
- `audit_log(id, bang, ban_ghi_id, hanh_dong, nguoi, luc, truoc jsonb, sau jsonb)`: app không đọc. Sửa, xóa `booking` ghi một dòng.

Hàm dùng chung (schema public, `security definer`, `set search_path = ''`):
- `local_today() returns date`: hôm nay theo giờ Việt Nam.
- `can_dang_nhap() returns uuid`: trả `auth.uid()`, chưa đăng nhập thì lỗi 28000.
- `my_own_can_ids() returns setof uuid`: căn người gọi giữ.
- `my_shared_can_ids() returns setof uuid`: căn `co_lich` của chủ, có kết nối `da_ket_noi` với người gọi là sale, đúng phạm vi (`tat_ca` gồm căn thêm sau; `chon_can` chỉ căn trong `ket_noi_can`), chủ chưa xóa tài khoản, căn chưa ẩn.
- `o_lich(p_can_id uuid, p_dem date) returns text`: trạng thái một ô lịch cho người gọi. Căn `tu_nhap` của người gọi: `'ban'` khi có booking chưa hủy của căn phủ đêm đó, không thì `'chua_biet'`; không bao giờ `'trong'` hay `'kin'`. Căn `co_lich` người gọi giữ hoặc được chia sẻ: `'kin'` hay `'trong'`. Căn không có quyền: null.
- Mọi hàm ghi sau này tên `fn_*`, `security definer`, có `set search_path`, không cho `anon` và `public` gọi.

## Bất biến của Home247
Chép từ CLAUDE.md, mục "Home247 khác app đặt phòng thông thường": hai lớp giá; khách không thấy giá chủ; chủ không thấy mức cộng, giá bán, tiền chênh của sale. Căn đã chia sẻ thì sale luôn thấy giá chủ (QD7). Mỗi người chỉ thấy khách do mình nhập (QD11). Đêm từ ngày nhận tới trước ngày trả. Tiền nguyên đồng. Căn tự nhập không có lịch trống. Chặn trùng ở database (QD6). Sale không đọc bảng booking. Booking có sale: một bên xin hủy, bên kia đồng ý (QD12). Xóa tài khoản chỉ xóa số điện thoại (QD13).

## Khung test (có sẵn, không sửa)
- `scripts/test-db.sh [mã]`: dựng database `home247_test` từ `supabase/gia-lap/`, `supabase/migrations/`, nạp `tests/db/00_khung.sql` rồi `tests/db/01_helpers.sql`, rồi chạy từng file `tests/db/[1-9]*.sql` trong một giao dịch rồi rollback.
- `tests/db/00_khung.sql`: `t.ok(dk, ten)`, `t.bang(thuc, mong, ten)`, `t.loi(cau_sql, ma_loi_hoac_mau_ilike, ten)`, `t.khong_loi(cau_sql, ten)`, `t.dem(cau_select) → bigint`, `t.dang_nhap(uuid)`, `t.khach()`, `t.thoat()`.
- Tên test mở đầu bằng mã: `KT-DB.3.<n>` và mã ví dụ QT nếu có, ví dụ `KT-DB.3.2 QT1.1-VD1 trùng đêm 11/10 bị từ chối`.

## Được sửa
`tests/db/01_helpers.sql` (fixture `t.fixture()` theo `docs/product/du-lieu-mau.md` mục "Bộ rút gọn cho test database"), `tests/db/1*.sql` trở đi, `scripts/thu-lam-hong.txt` (danh sách phép thử làm hỏng).
