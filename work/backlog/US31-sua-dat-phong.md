---
id: US31
tieu_de: "Sửa đặt phòng"
loai: US
trang_thai: cho-test
thuc_hien: [YC5.6@2]
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
pr: [36]
ngay_tao: 2026-11-18
---
## Mục tiêu
Là chủ nhà, tôi làm được việc "Sửa đặt phòng" đúng như YC5.6 mô tả.

## Làm tiêu chí nào
YC5.6-NT1 đến NT11

## Quy tắc, hành vi dùng
QT1, QT1.2, QT2, QT3.1, QT4, QT4.2, QT5.6, QT6.1, QT6.2

## Màn hình
CN4-02. S3-10 (sale xem đặt phòng chủ đã sửa) chuyển sang US34 (Claude tự quyết, QD25): màn đó là chi tiết đặt phòng phía sale (YC5.9), US34 làm.

## Quyền
PQ4, PQ7, PQ8, PQ9, PQ11, PQ17 và các test vi phạm ở mục "Ai được làm gì" của YC5-dat-phong.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- Đổi người đặt (YC5-H5): xóa hay xin hủy rồi ghi mới, thuộc US32, US33.
- Phần đầu YC5-dat-phong.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC5.6 QT1 QT1.2 QT2 QT3.1 QT4 QT4.2 QT5.6 QT6.1 QT6.2 PQ4 PQ7 PQ8 PQ9 PQ11 PQ17 CN4-02 S3-10
YC5-dat-phong.md#Quy tắc của nhóm
YC5-dat-phong.md#Ai được làm gì
YC5-dat-phong.md#Dữ liệu
YC5-dat-phong.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US31-sua-dat-phong.md.

## Task
- [x] US31-TA1 test database tests/db/46_us31_sua_dat_phong.sql · nhánh US31-sua-dat-phong
- [x] US31-TA2 migration 20261119250000 (fn_sua_booking, kiem_du_lieu_booking, trigger booking_sau_khi_sua), 5 phép thử làm hỏng · nhánh US31-sua-dat-phong
- [x] US31-TA3 Code: màn CN4-02 (unit, e2e); S3-10 chuyển sang US34 · PR #36
- [ ] US31-TA4 Test tay · Đức: chạy tests/kb/US31-sua-dat-phong.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch
- S3-10 (sale xem đặt phòng chủ đã sửa) chưa làm: cần màn chi tiết phía sale (YC5.9, US34), ngoài ô Được sửa. Database đã ghi thông báo chu_sua_dat_phong đủ ngày, căn, tiền cũ và mới cho màn đó.

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC5.6@1 (QD21)
- 2026-11-19 · Claude (agent code) · TA1, TA2, TA3 phần CN4-02 trên nhánh US31-sua-dat-phong, chưa mở PR · S3-10 ngoài phạm vi file · ~1 giờ
- 2026-11-19 · Claude · gộp PR #36 theo QD25 · 993 test DB, 405 unit, 34 e2e xanh

## Bằng chứng
- `PGHOST=localhost PGUSER=postgres PGPASSWORD=postgres scripts/test-db.sh`: lần đầu (chỉ test) 48 hỏng; sau migration 993 qua, 0 hỏng (1 vòng).
- `scripts/thu-lam-hong.sh YC5.6`: 5 đạt, 0 không đạt.
- `npx vitest run`: 405 qua (thêm 17 test YC5.6), xanh ngay lần chạy đầu sau khi code.
- e2e `tests/e2e/supabase/sua-dat-phong.spec.ts`: lần đầu đỏ 1 (đổi ngày thì ô tiền trống vì căn chưa đặt giá, test phải gõ lại tiền), 1 vòng; cả thư mục 34 qua.
- `npm run typecheck`, `npm run build`, `python3 scripts/kiem.py --diff origin/main`: qua, không lỗi.
