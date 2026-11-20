---
id: US5
tieu_de: "Giờ nhận, trả phòng mặc định"
loai: US
trang_thai: cho-test
thuc_hien: [YC1.5@1]
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
pr: 80
ngay_tao: 2026-11-18
---
## Mục tiêu
Là người dùng (chủ nhà hoặc sale), tôi làm được việc "Giờ nhận, trả phòng mặc định" đúng như YC1.5 mô tả.

## Làm tiêu chí nào
YC1.5-NT1 đến NT3

## Quy tắc, hành vi dùng
HV4, HV5, QT6.5

## Màn hình
P5

## Quyền
PQ1, PQ2, PQ6, PQ9, PQ11, PQ20, PQ23 và các test vi phạm ở mục "Ai được làm gì" của YC1-tai-khoan.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
supabase/migrations/20261120190000_us5_gio_nhan_tra.sql, supabase/bang-va-cot.md, tests/db/85_us5_gio_nhan_tra.sql, scripts/thu-lam-hong.txt, src/lib/dichVuGio.ts (mới), src/lib/dichVuCan.ts, src/lib/dieuHuong.ts, src/man/P5GioNhanTra.tsx (mới, dùng chung CSS P2HoSo.css), src/man/ManChu.tsx, unit test kèm, tests/e2e/supabase/gio-nhan-tra.spec.ts, tests/kb/US5-gio-nhan-tra-phong-mac.md.

## Ngoài phạm vi
- Phần đầu YC1-tai-khoan.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC1.5 HV4 HV5 QT6.5 PQ1 PQ2 PQ6 PQ9 PQ11 PQ20 PQ23 P5
YC1-tai-khoan.md#Quy tắc của nhóm
YC1-tai-khoan.md#Ai được làm gì
YC1-tai-khoan.md#Dữ liệu
YC1-tai-khoan.md#Trạng thái màn (mọi mục)

## Test case
Kịch bản test tay: tests/kb/US5-gio-nhan-tra-phong-mac.md (2 kịch bản, 1 [Chính]).

## Task
- [x] US5-TA1 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy và test database cho YC1.5-NT1 đến NT3
- [x] US5-TA2 Code · Claude Code (sonnet, CL14.6a): màn P5 theo canvas, test unit, e2e cho YC1.5-NT1
- [ ] US5-TA3 Test tay · Đức: chạy tests/kb/US5-gio-nhan-tra-phong-mac.md, chế độ nhanh rồi đủ.

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC1.5@1 (QD21)

- 2026-11-20 · Claude (tự chạy, QD25) · tự chốt YC1-H11, viết test database và tests/kb, migration fn_dat_gio_nhan_tra, màn P5, mở PR · khoảng 25 phút
- 2026-11-20 · Claude (tự chạy, QD25) · CI xanh, gộp PR #80, chuyển cho-test · gộp main nhiều lần vì nhánh chồng nhau


## Bằng chứng
- `CHI_FILE_CO_MA=1 scripts/test-db.sh YC1.5`: 15 qua, 0 hỏng (một vòng sửa tên hàm trong test). `scripts/thu-lam-hong.sh YC1.5`: 2 đạt. `npx vitest run src/man/P5GioNhanTra.test.tsx src/lib/dieuHuong.test.ts`: 18 qua. `npm run typecheck`: qua. Bộ đầy đủ, e2e: CI chạy.
