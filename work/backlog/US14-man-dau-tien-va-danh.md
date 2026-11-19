---
id: US14
tieu_de: "Màn đầu tiên và danh sách căn"
loai: US
trang_thai: cho-test
thuc_hien: [YC3.1@1]
truoc: [EN1, EN2, EN4, US2]
lien_quan: []
thay_cho: []
nguon: QD21
nguoi: tung
rui_ro: tb
nghiem_thu: khong
uoc_luong:
thuc_te:
can_duyet: []
based_on:
pr: [21]
ngay_tao: 2026-11-18
---
## Mục tiêu
Là chủ nhà, tôi làm được việc "Màn đầu tiên và danh sách căn" đúng như YC3.1 mô tả.

## Làm tiêu chí nào
YC3.1-NT1 đến NT5

## Quy tắc, hành vi dùng
QT5.5, QT5.7, QT6.3

## Màn hình
A4, A4-01, CN5

## Quyền
PQ1, PQ3, PQ13 và các test vi phạm ở mục "Ai được làm gì" của YC3-can.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- Phần đầu YC3-can.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC3.1 QT5.5 QT5.7 QT6.3 PQ1 PQ3 PQ13 A4 A4-01 CN5
YC3-can.md#Quy tắc của nhóm
YC3-can.md#Ai được làm gì
YC3-can.md#Dữ liệu
YC3-can.md#Trạng thái màn (mọi mục)

## Test case
Kịch bản test tay: tests/kb/US14-man-dau-tien-va-danh.md (KB1, KB2).

## Task
- [x] US14-TA1 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy và test database cho YC3.1-NT2
- [x] US14-TA2 Code · Claude Code (sonnet, CL14.6a): màn A4, A4-01, CN5 theo canvas, test unit, e2e cho YC3.1-NT1 đến NT5
- [ ] US14-TA3 Test tay · Đức: chạy tests/kb/US14-man-dau-tien-va-danh.md, chế độ nhanh rồi đủ.

## Kế hoạch
- TA1: migration 20261119120000_us14_ds_can.sql thêm view `v_can_cua_toi` (security_invoker, đọc qua RLS sẵn có): căn có lịch, chưa ẩn của người gọi, kèm tên tòa, số ảnh, ảnh đại diện, ngày trả của đặt phòng có đêm hôm nay, cờ "Mới thêm" (GD14). Test tests/db/32_us14_ds_can.sql (YC3.1-NT2, PQ3, PQ13), thêm dòng thu-lam-hong.txt.
- TA2: src/lib/can.ts (dòng thẻ, tình trạng hôm nay, tên căn), src/lib/dichVuCan.ts (đọc view, xin đường dẫn ảnh 1 giờ), màn src/man/A4ChuaCoCan.tsx (A4, A4-01), src/man/CN5DanhSachCan.tsx, thanh tab chủ nhà src/man/TabChu.tsx, đường dẫn /can, /can/moi, /can/<id> và các tab tạm trong dieuHuong.ts. Test unit mang mã YC3.1-NT1 đến NT5, e2e trên Supabase máy.

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC3.1@1 (QD21)
- 2026-11-19 · Claude · viết kịch bản test tay
- 2026-11-19 · Claude · code TA1, TA2 (view v_can_cua_toi, A4, A4-01, CN5, thanh tab chủ); sửa dòng kiểm "Chủ nhà" của US1 vì tab Lịch thành A4 · khoảng 1 giờ
- 2026-11-19 · Claude · gộp PR #21 theo QD25 (CI xanh: kiem.py, app, database, e2e-supabase), sang cho-test

## Bằng chứng
- `scripts/test-db.sh` (Postgres 16 máy): lần đầu 1 file lỗi (chưa có view), sau migration 365 qua, 0 hỏng; lọc YC3.1 21 qua. `scripts/thu-lam-hong.sh YC3.1`: 3/3 đạt.
- `npx vitest run`: lần đầu 4 file đỏ (chưa có màn); sau code 1 đỏ là YC1.1-NT6 của US1 kiểm dòng "Chủ nhà" của màn tạm, đổi sang kiểm A4 theo YC1.1 bước 5; 1 vòng sửa; cuối 22 file, 109 test qua.
- `npm run typecheck`, `npm run build`: qua. `CI=1 npx playwright test`: 3 qua.
- `E2E_SUPABASE=1 CI=1 npx playwright test tests/e2e/supabase` (Supabase máy, sau `db reset`): 13 qua, gồm YC3.1-NT1, NT2 (kèm NT3, NT5 trên thẻ). Lần đầu xanh.
- `python3 scripts/kiem.py --diff origin/main`: không có lỗi. Đã chụp A4, CN5 trên khung 390×844, khớp canvas (trừ giá tuần này, thuộc YC4).
