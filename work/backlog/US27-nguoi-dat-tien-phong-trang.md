---
id: US27
tieu_de: "Người đặt, tiền phòng, trạng thái tiền"
loai: US
trang_thai: cho-test
thuc_hien: [YC5.2@2]
truoc: [EN1, EN2, EN4, US2]
lien_quan: []
thay_cho: []
nguon: QD21
nguoi: tung
rui_ro: cao
nghiem_thu: khong
uoc_luong:
thuc_te:
can_duyet: []
based_on:
pr: [32]
ngay_tao: 2026-11-18
---
## Mục tiêu
Là chủ nhà, tôi làm được việc "Người đặt, tiền phòng, trạng thái tiền" đúng như YC5.2 mô tả.

## Làm tiêu chí nào
YC5.2-NT1 đến NT13

## Quy tắc, hành vi dùng
QT1, QT2, QT3.1, QT4, QT4.1, QT4.2, QT5.3, QT5.6, QT6.1, QT6.2

## Màn hình
CN4, CN4-01

## Quyền
PQ4, PQ7, PQ8, PQ9, PQ11, PQ17 và các test vi phạm ở mục "Ai được làm gì" của YC5-dat-phong.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Theo ô "Được sửa" của work/goi/US27.md: migration 20261119220000_us27_nguoi_dat_tien.sql, tests/db/42_us27_nguoi_dat_tien.sql, scripts/thu-lam-hong.txt, supabase/bang-va-cot.md; src/man/CN4ThemDatPhong.tsx (+ .css, .test.tsx), CN4NguoiDat.tsx, CN4TienPhong.tsx, src/lib/datPhong.ts, dichVuDatPhong.ts, tien.ts, src/man/ManChu.tsx; tests/e2e/supabase/them-dat-phong.spec.ts.

## Ngoài phạm vi
- Phần đầu YC5-dat-phong.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC5.2 QT1 QT2 QT3.1 QT4 QT4.1 QT4.2 QT5.3 QT5.6 QT6.1 QT6.2 PQ4 PQ7 PQ8 PQ9 PQ11 PQ17 CN4 CN4-01
YC5-dat-phong.md#Quy tắc của nhóm
YC5-dat-phong.md#Ai được làm gì
YC5-dat-phong.md#Dữ liệu
YC5-dat-phong.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US27-nguoi-dat-tien-phong-trang.md.

## Task
- [x] US27-TA1 Code · PR #32
- [x] US27-TA2 Code · PR #32
- [x] US27-TA3 Code · PR #32
- [ ] US27-TA4 Test tay · Đức: chạy tests/kb/US27-nguoi-dat-tien-phong-trang.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch
1. TA1: tests/db/42 cho NT1, 2, 4, 7, 9, 11, 12, 13 và vi phạm quyền (Tuấn đọc khách, Hùng ghi, sale không kết nối, sale không được xem căn).
2. TA2: migration thêm booking.gio_nhan, gio_tra; fn_gia_chu_cac_dem (giá từng đêm qua fn_lich_gia_thang); tien_cac_dem (QT4.2); fn_tao_booking create or replace (người đặt, phần riêng chủ, cọc GD20, giờ mặc định, sđt 9-11 số); fn_ten_khach_da_dung. Thêm phép thử làm hỏng.
3. TA3: CN4NguoiDat (chip), CN4TienPhong (ô tiền, dòng từng đêm, trạng thái tiền, cọc), phần Thêm chi tiết, nút lưu nối fn_tao_booking, lưu xong về tab Lịch với toast. Unit + e2e.

## Nhật ký
- 2026-11-19 · Claude · TA1, TA2, TA3 code xong trên nhánh US27-nguoi-dat-tien, mở PR nháp · bất ngờ: thêm default cho p_tien_phong làm đổi 3 phép thử US26
- 2026-11-19 · Claude · trả lời YC5-H1, H2, H12, H19, viết tests/kb, soạn gói việc, sang dang-lam
- 2026-11-18 · Claude · tạo item từ YC5.2@1 (QD21)
- 2026-11-19 · Claude · gộp PR #32 theo QD25 (CI xanh), sang cho-test; CN4-03 mở sẵn ngày để US28 · 5 phút

## Bằng chứng
- `scripts/test-db.sh` (Postgres thật): trước migration 33 test YC5.2 đỏ; sau migration 1 đỏ (NT4 bỏ hẳn tham số), sửa 1 vòng; cuối 812 qua, 0 hỏng.
- `scripts/thu-lam-hong.sh`: 113 đạt, 0 không đạt (thêm 13 phép thử US27; 3 phép thử US26 sửa chữ ký p_tien_phong default null).
- `npx vitest run`: lần đầu 2 đỏ (nhãn ô tiền chứa dòng lỗi), sửa 1 vòng; cuối 361 qua. `npm run typecheck` 1 vòng sửa, qua. `npm run build` qua.
- E2e `E2E_SUPABASE=1 CI=1 npx playwright test --trace off`: ca US27 lần đầu đỏ (nút "Đặt phòng" trùng tên), sửa 1 vòng; cả bộ 33 qua.
- `python3 scripts/kiem.py --diff origin/main`: không có lỗi.
