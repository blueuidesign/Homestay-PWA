---
id: US7
tieu_de: "Hướng dẫn và nhắn Home247"
loai: US
trang_thai: dang-lam
thuc_hien: [YC1.7@1]
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
Là người dùng (chủ nhà hoặc sale), tôi làm được việc "Hướng dẫn và nhắn Home247" đúng như YC1.7 mô tả.

## Làm tiêu chí nào
YC1.7-NT1, YC1.7-NT2

## Quy tắc, hành vi dùng
HV4, HV5, QT6.5

## Màn hình
P9

## Quyền
PQ1, PQ2, PQ6, PQ9, PQ11, PQ20, PQ23 và các test vi phạm ở mục "Ai được làm gì" của YC1-tai-khoan.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
src/lib/huongDan.ts (mới), src/man/P9HuongDan.tsx và .css (mới), src/lib/dieuHuong.ts, src/man/ManChu.tsx, src/man/ManSale.tsx, unit test kèm, tests/e2e/supabase/huong-dan.spec.ts, tests/kb/US7-huong-dan-va-nhan-home247.md. Không có migration: chữ có sẵn trong app.

## Ngoài phạm vi
- YC1-H10 đã tự chốt 20/11 (QD25): sale có nhóm hướng dẫn riêng.
- Phần đầu YC1-tai-khoan.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC1.7 HV4 HV5 QT6.5 PQ1 PQ2 PQ6 PQ9 PQ11 PQ20 PQ23 P9
YC1-tai-khoan.md#Quy tắc của nhóm
YC1-tai-khoan.md#Ai được làm gì
YC1-tai-khoan.md#Dữ liệu
YC1-tai-khoan.md#Trạng thái màn (mọi mục)

## Test case
Kịch bản test tay: tests/kb/US7-huong-dan-va-nhan-home247.md (2 kịch bản, 2 [Chính]).

## Task
- [x] US7-TA1 Code · Claude Code (sonnet, CL14.6a): màn P9 theo canvas, test unit, e2e cho YC1.7-NT1, YC1.7-NT2
- [ ] US7-TA2 Test tay · Đức: chạy tests/kb/US7-huong-dan-va-nhan-home247.md, chế độ nhanh rồi đủ.

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC1.7@1 (QD21)

- 2026-11-20 · Claude (tự chạy, QD25) · tự chốt YC1-H10, viết tests/kb, màn P9, mở PR · khoảng 20 phút

## Bằng chứng
- `npx vitest run src/man/P9HuongDan.test.tsx src/lib/dieuHuong.test.ts`: 20 qua. `npm run typecheck`: qua. Bộ đầy đủ, e2e: CI chạy.
