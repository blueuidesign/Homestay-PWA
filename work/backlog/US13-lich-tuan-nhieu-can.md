---
id: US13
tieu_de: "Lịch tuần nhiều căn"
loai: US
trang_thai: dang-lam
thuc_hien: [YC2.5@1]
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
Là chủ nhà, tôi làm được việc "Lịch tuần nhiều căn" đúng như YC2.5 mô tả.

## Làm tiêu chí nào
YC2.5-NT1 đến NT7

## Quy tắc, hành vi dùng
QT2, QT6.1

## Màn hình
CN2, CN2-00

## Quyền
PQ4, PQ7, PQ8, PQ9, PQ16 và các test vi phạm ở mục "Ai được làm gì" của YC2-lich-chu-nha.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
- supabase/migrations/20261119280000_us13_gia_tuan_tung_dem.sql (mới), tests/db/49_us13_gia_tuan_tung_dem.sql (mới), scripts/thu-lam-hong.txt (thêm dòng), supabase/bang-va-cot.md (sinh lại)
- src/lib/lichTuan.ts (+ .test.ts) mới; src/lib/dichVuLich.ts (thêm layTuan)
- src/man/CN2LichTuan.tsx (+ .css, .test.tsx) mới; src/man/CN1LichThang.tsx (+ .css, .test.tsx) chỉ thêm nút Tháng/Tuần; src/man/ManChu.tsx
- tests/e2e/supabase/lich-tuan.spec.ts (mới)

## Ngoài phạm vi
- YC2-H2, YC2-H4, YC2-H5 đã Claude tự chốt (QD25), ghi ở YC2.5 r5.
- Phần đầu YC2-lich-chu-nha.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC2.5 QT2 QT6.1 PQ4 PQ7 PQ8 PQ9 PQ16 CN2 CN2-00
YC2-lich-chu-nha.md#Quy tắc của nhóm
YC2-lich-chu-nha.md#Ai được làm gì
YC2-lich-chu-nha.md#Dữ liệu
YC2-lich-chu-nha.md#Trạng thái màn (mọi mục)

## Test case
Kịch bản test tay: tests/kb/US13-lich-tuan-nhieu-can.md.

## Task
- [ ] US13-TA1 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy và test database cho YC2.5-NT2
- [ ] US13-TA2 Code · Claude Code (sonnet, CL14.6a): màn CN2, CN2-00 theo canvas, test unit, e2e cho YC2.5-NT1 đến NT7
- [ ] US13-TA3 Test tay · Đức: chạy tests/kb/US13-lich-tuan-nhieu-can.md, chế độ nhanh rồi đủ.

## Kế hoạch
1. TA1: viết tests/db/49 trước (YC2.5-NT2 giá 1509 08/10 900.000đ, 3402 09/10 1.100.000đ, đêm chưa giá null, vi phạm: chủ khác, sale, anon), rồi migration fn_gia_tung_dem_cua_toi(p_tu, p_den) dùng lại fn_lich_gia_thang, chỉ căn có lịch chưa ẩn của người gọi. Thêm dòng thu-lam-hong, sinh lại bang-va-cot.md.
2. TA2: test unit lichTuan.test.ts, CN2LichTuan.test.tsx, thêm test nút Tháng/Tuần ở CN1 trước; rồi src/lib/lichTuan.ts (hàng, cột, thanh, ô giá, tóm tắt, chip), dichVuLich.layTuan, màn CN2/CN2-00, nút Tháng/Tuần ở CN1, ManChu nối hai màn (giữ trạng thái xem tuần trong ManChu vì dieuHuong.ts ngoài phạm vi).
3. e2e lich-tuan.spec.ts cho NT6; chạy test db, unit, typecheck, build, e2e, kiem.py.

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC2.5@1 (QD21)
- 2026-11-19 · Claude · tự chốt YC2-H2, H4, H5 (QD25), thêm NT6, NT7 vào YC2.5 r5; viết kịch bản test tay; giao agent code

## Bằng chứng
