---
id: US20
tieu_de: "Giá trên thẻ căn"
loai: US
trang_thai: dang-lam
thuc_hien: [YC4.1@2]
truoc: [EN1, EN2, EN4, US2]
lien_quan: []
thay_cho: []
nguon: QD21
nguoi: tung
rui_ro: thap
nghiem_thu: khong
uoc_luong:
thuc_te:
can_duyet: []
based_on:
pr:
ngay_tao: 2026-11-18
---
## Mục tiêu
Là chủ nhà, tôi làm được việc "Giá trên thẻ căn" đúng như YC4.1 mô tả.

## Làm tiêu chí nào
YC4.1-NT1, YC4.1-NT2

## Quy tắc, hành vi dùng
QT4.1, QT5.3

## Màn hình
CN5

## Quyền
PQ5, PQ6, PQ21 và các test vi phạm ở mục "Ai được làm gì" của YC4-gia.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- Phần đầu YC4-gia.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC4.1 QT4.1 QT5.3 PQ5 PQ6 PQ21 CN5
YC4-gia.md#Quy tắc của nhóm
YC4-gia.md#Ai được làm gì
YC4-gia.md#Dữ liệu
YC4-gia.md#Trạng thái màn (mọi mục)

## Test case
Kịch bản test tay: tests/kb/US20-gia-tren-the-can.md (KB1, KB2).

## Task
- [ ] US20-TA1 Code · Claude Code (sonnet, CL14.6a): màn CN5 theo canvas, test unit, e2e cho YC4.1-NT1, YC4.1-NT2
- [ ] US20-TA2 Test tay · Đức: chạy tests/kb/US20-gia-tren-the-can.md, chế độ nhanh rồi đủ.

## Kế hoạch
Test trước (db 37, unit can/CN5/ManChuGiaTuan), thấy đỏ; rồi migration fn_gia_tuan_cua_toi (gọi lại fn_lich_gia_thang), dichVuGia.layGiaTuan, thẻ CN5, nối ManChu, e2e gia-the-can.

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC4.1@1 (QD21)
- 2026-11-19 · Claude · viết tests/kb, soạn gói việc, sang dang-lam
- 2026-11-19 · Claude · code US20-TA1 xong, mở PR nháp, e2e 24 qua

## Bằng chứng
- `scripts/test-db.sh YC4.1`: lần đầu đỏ 18 test (lệnh chưa có); sau migration `scripts/test-db.sh` 629 qua, 0 hỏng. `scripts/thu-lam-hong.sh YC4.1`: 3 đạt, 0 không đạt.
- `npx vitest run`: lần đầu đỏ 11 test, sửa 1 vòng (lỗi tên thẻ trong test mới), cuối 244 qua. typecheck, build qua.
- e2e Supabase máy: `E2E_SUPABASE=1 CI=1 npx playwright test tests/e2e/supabase --trace off` 24 qua.
