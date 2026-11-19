---
id: US9
tieu_de: "Lịch tháng và lọc theo căn"
loai: US
trang_thai: cho-test
thuc_hien: [YC2.1@1]
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
pr: [29]
ngay_tao: 2026-11-18
---
## Mục tiêu
Là chủ nhà, tôi làm được việc "Lịch tháng và lọc theo căn" đúng như YC2.1 mô tả.

## Làm tiêu chí nào
YC2.1-NT1 đến NT6; HV1-NT2, HV2-NT3 (hành vi chung gắn màn này, QD27)

## Quy tắc, hành vi dùng
QT2, QT6.1

## Màn hình
CN1, CN1-00, CN1-02

## Quyền
PQ4, PQ7, PQ8, PQ9, PQ16 và các test vi phạm ở mục "Ai được làm gì" của YC2-lich-chu-nha.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
src/man/CN1LichThang.tsx, .css, .test.tsx; src/lib/lich.ts, lich.test.ts, dichVuLich.ts; src/lib/dichVuCan.ts; src/man/ManChu.tsx; tests/db/39_us9_lich_thang.sql; tests/e2e/supabase/lich-thang.spec.ts. Không thêm migration.

## Ngoài phạm vi
- Phần đầu YC2-lich-chu-nha.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC2.1 QT2 QT6.1 PQ4 PQ7 PQ8 PQ9 PQ16 CN1 CN1-00 CN1-02
YC2-lich-chu-nha.md#Quy tắc của nhóm
YC2-lich-chu-nha.md#Ai được làm gì
YC2-lich-chu-nha.md#Dữ liệu
YC2-lich-chu-nha.md#Trạng thái màn (mọi mục)

## Test case
Kịch bản test tay: tests/kb/US9-lich-thang-va-loc-theo.md.

## Task
- [x] US9-TA1 Code · PR #29
- [ ] US9-TA2 Test tay · Đức: chạy tests/kb/US9-lich-thang-va-loc-theo.md, chế độ nhanh rồi đủ.

## Kế hoạch
- Không thêm migration: chủ nhà đọc thẳng `booking` qua RLS `booking_doc` (chỉ căn của mình), lọc `trang_thai <> 'da_huy'` (QT2.1).
- src/lib/lich.ts: đêm có khách theo căn trong tháng (QT2), chữ chip "Cả 2 phòng"/"Tất cả", tên tháng, màu căn theo thứ tự.
- src/lib/dichVuLich.ts: đọc booking chưa hủy có đêm trong tháng, và có booking nào chưa (CN1-00); gắn vào DichVuCan.lich.
- src/man/CN1LichThang.tsx (+ .css): CN1, CN1-02, CN1-00; bộ nhớ tháng đã xem do ManChu giữ (HV1-NT2); đổi tháng lỗi thì giữ tháng đang hiện (HV2).
- ManChu: tab Lịch có căn thì CN1; "Đặt phòng" toast "Sẽ có ở bản sau"; chạm ngày chỉ viền ô.
- Test trước: lich.test.ts, CN1LichThang.test.tsx (YC2.1-NT1..NT6, HV1-NT2, HV2-NT3), tests/db/39, e2e lich-thang.spec.ts.

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC2.1@1 (QD21)
- 2026-11-19 · Claude · nhận HV1-NT2, HV2-NT3 từ EN4 (QD27)
- 2026-11-19 · Claude · trả lời QT2-H1, viết tests/kb, soạn gói việc, sang dang-lam
- 2026-11-19 · Claude · US9-TA1 code CN1, CN1-00, CN1-02, test unit, database, e2e; không cần migration · PR nháp
- 2026-11-19 · Claude · gộp main vào nhánh, gộp PR #29 theo QD25 (CI xanh), sang cho-test · 5 phút

## Bằng chứng
- `npx vitest run src/lib/lich.test.ts src/man/CN1LichThang.test.tsx`: lần đầu 16 test màn đỏ (chưa có màn), sau đó 2 đỏ (đổi tháng), sửa 1 vòng, 28 xanh. Cả bộ `npx vitest run`: 272 xanh.
- `scripts/test-db.sh`: 646 qua, 0 hỏng (lọc YC2: 14 qua).
- `E2E_SUPABASE=1 CI=1 npx playwright test`: 29 qua (lich-thang.spec.ts 2 qua lần đầu).
- `npm run typecheck`, `npm run build`: qua. `python3 scripts/kiem.py --diff origin/main`: không có lỗi.
