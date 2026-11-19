---
id: US10
tieu_de: "Chi tiết một ngày"
loai: US
trang_thai: dang-lam
thuc_hien: [YC2.2@1]
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
pr: 30
ngay_tao: 2026-11-18
---
## Mục tiêu
Là chủ nhà, tôi làm được việc "Chi tiết một ngày" đúng như YC2.2 mô tả.

## Làm tiêu chí nào
YC2.2-NT1 đến NT3

## Quy tắc, hành vi dùng
QT2, QT6.1

## Màn hình
CN3

## Quyền
PQ4, PQ7, PQ8, PQ9, PQ16 và các test vi phạm ở mục "Ai được làm gì" của YC2-lich-chu-nha.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
- Mới: src/man/CN3ChiTietNgay.tsx, src/man/CN3ChiTietNgay.test.tsx, src/man/CN3ChiTietNgay.css.
- Sửa: src/man/CN1LichThang.tsx, src/lib/dichVuLich.ts, src/lib/lich.ts, src/lib/lich.test.ts, src/man/ManChu.tsx.
- Test: tests/db/40_us10_chi_tiet_ngay.sql, tests/e2e/supabase/chi-tiet-ngay.spec.ts, scripts/thu-lam-hong.txt (thêm dòng).
- Không thêm migration: RLS có sẵn (booking_doc, booking_dem_doc, booking_rieng_doc, v_nguoi_ket_noi) đủ cho YC2.2.

## Ngoài phạm vi
- Phần đầu YC2-lich-chu-nha.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC2.2 QT2 QT6.1 PQ4 PQ7 PQ8 PQ9 PQ16 CN3
YC2-lich-chu-nha.md#Quy tắc của nhóm
YC2-lich-chu-nha.md#Ai được làm gì
YC2-lich-chu-nha.md#Dữ liệu
YC2-lich-chu-nha.md#Trạng thái màn (mọi mục)

## Test case
Kịch bản test tay: tests/kb/US10-chi-tiet-mot-ngay.md.

## Task
- [x] US10-TA1 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy và test database cho YC2.2-NT3
- [x] US10-TA2 Code · Claude Code (sonnet, CL14.6a): màn CN3 theo canvas, test unit, e2e cho YC2.2-NT2
- [ ] US10-TA3 Test tay · Đức: chạy tests/kb/US10-chi-tiet-mot-ngay.md, chế độ nhanh rồi đủ.

## Kế hoạch
1. TA1: tests/db/40 cho YC2.2-NT3 (Anh Tuấn, Sale Hùng đọc thẳng booking, booking_dem, booking_rieng của Chị Hoa ra 0 dòng; Chị Hoa đọc được đúng câu đọc của app), thêm phép thử làm hỏng. Không cần migration.
2. TA2: lich.ts thêm hàm tính dòng CN3 (tiêu đề ngày, người đặt, khoảng ngày, tiền theo QT6.1), test unit. CN3ChiTietNgay.tsx + test YC2.2-NT2. dichVuLich đọc thêm tiền, sale_id cùng câu đọc tháng; booking_rieng (tên khách mình nhập) và v_nguoi_ket_noi (tên, số sale).
3. CN1 gắn CN3 dưới lưới khi chạm ngày (theo chip). ManChu: chạm dòng có khách và nút "Đặt phòng" báo "Sẽ có ở bản sau" (YC5 chưa có).
4. e2e YC2.2-NT1. Chạy test-db, thu-lam-hong, vitest, typecheck, build, e2e, kiem.py.

## Nhật ký
- 2026-11-19 · Claude · code TA1, TA2 trên nhánh US10-chi-tiet-ngay (không thêm migration), mở PR
- 2026-11-19 · Claude · trả lời YC2-H6, viết tests/kb, soạn gói việc, sang dang-lam
- 2026-11-18 · Claude · tạo item từ YC2.2@1 (QD21)

## Bằng chứng
- Test database: `PGHOST=localhost PGUSER=postgres PGPASSWORD=postgres scripts/test-db.sh` · tests/db/40 viết trước, xanh ngay lần đầu (RLS có sẵn đủ, không thêm migration) · cuối: 708 qua, 0 hỏng.
- Thử làm hỏng: `scripts/thu-lam-hong.sh YC2.2-NT3` · lần đầu 4/5 đạt (một câu phá không chạm được do RLS lồng), sửa câu phá 1 vòng · cuối: 5/5 đạt.
- Unit: `npx vitest run` · lần đầu đỏ 8 test và 1 file không nạp được (CN3 chưa có) · sửa 1 vòng · cuối: 35 file, 311 test qua.
- E2E: `E2E_SUPABASE=1 CI=1 npx playwright test` · YC2.2-NT1 xanh lần đầu; dem-cuoi-tuan đỏ do database máy thiếu migration US25, `supabase db reset` rồi chạy lại · cuối: 31 qua.
- `npm run typecheck`, `npm run build` qua. `python3 scripts/kiem.py --diff origin/main`: không có lỗi.
