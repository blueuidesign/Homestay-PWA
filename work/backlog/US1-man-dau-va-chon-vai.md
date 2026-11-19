---
id: US1
tieu_de: "Màn đầu và chọn vai"
loai: US
trang_thai: moi
thuc_hien: [YC1.1@3]
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
pr:
ngay_tao: 2026-11-18
---
## Mục tiêu
Là người dùng (chủ nhà hoặc sale), tôi làm được việc "Màn đầu và chọn vai" đúng như YC1.1 mô tả.

## Làm tiêu chí nào
YC1.1-NT1 đến NT7

## Quy tắc, hành vi dùng
HV4, HV5, QT6.5

## Màn hình
A1, A3, A3-00

## Quyền
PQ1, PQ2, PQ6, PQ9, PQ11, PQ20, PQ23 và các test vi phạm ở mục "Ai được làm gì" của YC1-tai-khoan.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- Phần đầu YC1-tai-khoan.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC1.1 HV4 HV5 QT6.5 PQ1 PQ2 PQ6 PQ9 PQ11 PQ20 PQ23 A1 A3 A3-00
YC1-tai-khoan.md#Quy tắc của nhóm
YC1-tai-khoan.md#Ai được làm gì
YC1-tai-khoan.md#Dữ liệu
YC1-tai-khoan.md#Trạng thái màn (mọi mục)

## Test case
Kịch bản test tay: tests/kb/US1-man-dau-va-chon-vai.md, chưa viết. Viết trước khi item sang san-sang (CL14.5a).

## Task
- [ ] US1-TA1 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy và test database cho YC1.1-NT5, YC1.1-NT7
- [ ] US1-TA2 Code · Claude Code (sonnet, CL14.6a): màn A1, A3, A3-00 theo canvas, test unit, e2e cho YC1.1-NT1 đến NT6
- [ ] US1-TA3 Test tay · Đức: chạy tests/kb/US1-man-dau-va-chon-vai.md, chế độ nhanh rồi đủ.

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC1.1@1 (QD21)
- 2026-11-19 · Claude · thuc_hien lên bản mới theo QD22
- 2026-11-19 · Claude · thuc_hien lên bản 3 theo canvas PWA (PR #10)

## Bằng chứng
