---
id: US4
tieu_de: "Hồ sơ"
loai: US
trang_thai: cho-test
thuc_hien: [YC1.4@3]
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
pr: 79
ngay_tao: 2026-11-18
---
## Mục tiêu
Là người dùng (chủ nhà hoặc sale), tôi làm được việc "Hồ sơ" đúng như YC1.4 mô tả.

## Làm tiêu chí nào
YC1.4-NT1, NT2, NT4, NT5 (NT3 bỏ)

## Quy tắc, hành vi dùng
HV4, HV5, QT6.5

## Màn hình
P2

## Quyền
PQ1, PQ2, PQ6, PQ9, PQ11, PQ20, PQ23 và các test vi phạm ở mục "Ai được làm gì" của YC1-tai-khoan.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
supabase/migrations/20261120180000_us4_ho_so.sql, supabase/bang-va-cot.md, tests/db/84_us4_ho_so.sql, scripts/thu-lam-hong.txt, src/lib/dichVuHoSo.ts (mới), src/lib/dichVuCan.ts, src/lib/dieuHuong.ts, src/man/P2HoSo.tsx và .css (mới), src/man/ManChu.tsx, src/man/ManSale.tsx, src/App.tsx, unit test kèm, tests/e2e/supabase/ho-so.spec.ts, tests/kb/US4-ho-so.md.

## Ngoài phạm vi
- Chỗ chưa quyết trong mục: không còn.
- Phần đầu YC1-tai-khoan.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC1.4 HV4 HV5 QT6.5 PQ1 PQ2 PQ6 PQ9 PQ11 PQ20 PQ23 P2
YC1-tai-khoan.md#Quy tắc của nhóm
YC1-tai-khoan.md#Ai được làm gì
YC1-tai-khoan.md#Dữ liệu
YC1-tai-khoan.md#Trạng thái màn (mọi mục)

## Test case
Kịch bản test tay: tests/kb/US4-ho-so.md (3 kịch bản, 1 [Chính]).

## Task
- [x] US4-TA1 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy và test database cho YC1.4-NT1, YC1.4-NT2, YC1.4-NT4, YC1.4-NT5
- [x] US4-TA2 Code · Claude Code (sonnet, CL14.6a): màn P2 theo canvas, test unit, e2e cho YC1.4-NT1, YC1.4-NT2
- [ ] US4-TA3 Test tay · Đức: chạy tests/kb/US4-ho-so.md, chế độ nhanh rồi đủ.

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC1.4@1 (QD21)
- 2026-11-19 · Claude · thuc_hien lên bản mới theo QD22
- 2026-11-19 · Claude · thuc_hien lên bản 3 theo canvas PWA (PR #10)

- 2026-11-20 · Claude (tự chạy, QD25) · viết test database và tests/kb, migration fn_sua_ho_so, màn P2, mở PR · khoảng 40 phút
- 2026-11-20 · Claude (tự chạy, QD25) · CI xanh, gộp PR #79, chuyển cho-test · gộp main nhiều lần vì nhánh chồng nhau


## Bằng chứng
- `CHI_FILE_CO_MA=1 scripts/test-db.sh YC1.4`: 24 qua, 0 hỏng. `scripts/thu-lam-hong.sh YC1.4`: 2 đạt. `npx vitest run src/man/P2HoSo.test.tsx src/lib/dieuHuong.test.ts`: 20 qua. `npm run typecheck`: qua. Ảnh đại diện (kho anh-dai-dien) tự quyết, xem PR. Bộ đầy đủ, e2e: CI chạy.
