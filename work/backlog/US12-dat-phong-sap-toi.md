---
id: US12
tieu_de: "Đặt phòng sắp tới"
loai: US
trang_thai: dang-lam
thuc_hien: [YC2.4@1]
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
Là chủ nhà, tôi làm được việc "Đặt phòng sắp tới" đúng như YC2.4 mô tả.

## Làm tiêu chí nào
YC2.4-NT1 đến NT3

## Quy tắc, hành vi dùng
QT2, QT6.1

## Màn hình
CN1, CN1-01

## Quyền
PQ4, PQ7, PQ8, PQ9, PQ16 và các test vi phạm ở mục "Ai được làm gì" của YC2-lich-chu-nha.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
- src/man/CN1LichThang.tsx (+ .test.tsx, .css), src/man/ManChu.tsx
- src/lib/dichVuLich.ts, src/lib/lich.ts (+ .test.ts)
- tests/e2e/supabase/lich-thang.spec.ts (thêm test mới)
- Không có migration: đọc bảng booking qua RLS booking_doc có sẵn.

## Ngoài phạm vi
- Phần đầu YC2-lich-chu-nha.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC2.4 QT2 QT6.1 PQ4 PQ7 PQ8 PQ9 PQ16 DLM.5 CN1 CN1-01
YC2-lich-chu-nha.md#Quy tắc của nhóm
YC2-lich-chu-nha.md#Ai được làm gì
YC2-lich-chu-nha.md#Dữ liệu
YC2-lich-chu-nha.md#Trạng thái màn (mọi mục)

## Test case
Kịch bản test tay: tests/kb/US12-dat-phong-sap-toi.md.

## Task
- [ ] US12-TA1 Code · Claude Code (sonnet, CL14.6a): màn CN1, CN1-01 theo canvas, test unit, e2e cho YC2.4-NT1 đến NT3
- [ ] US12-TA2 Test tay · Đức: chạy tests/kb/US12-dat-phong-sap-toi.md, chế độ nhanh rồi đủ.

## Kế hoạch
1. lich.ts: hàm thuần `datPhongSapToi(ds, homNay, nam, thang)` (chưa hủy, trả > hôm nay, nhận < ngày 1 tháng sau, xếp theo ngày nhận) và `dongSapToi(b, maCan)` (người đặt, "Phòng 1509 · 10/10 → 12/10 (2 đêm)", tiền phòng, "Cọc 1.000.000đ" / "Chưa cọc" / "Đã thanh toán"). Test unit YC2.4-NT1..NT3 trước, thấy đỏ.
2. dichVuLich.ts: `layThang` nhận thêm hôm nay, đọc thêm booking chưa hủy có ngày trả sau hôm nay và ngày nhận trước tháng sau (qua RLS), gắn người đặt như CN3, trả `sapToi`.
3. CN1LichThang.tsx: khối "Đặt phòng sắp tới" dưới khối doanh thu, chạm dòng gọi onMoDatPhong (CN3-02); rỗng thì CN1-01. CN1-00 (chưa có đặt phòng nào) giữ như cũ, không hiện khối.
4. e2e trong lich-thang.spec.ts: kéo xuống thấy danh sách đúng thứ tự, chạm dòng mở CN3-02.

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC2.4@1 (QD21)
- 2026-11-19 · Claude (agent phụ) · code US12-TA1 trên nhánh US12-dat-phong-sap-toi; e2e chưa chạy vì Docker tắt
- 2026-11-19 · Claude (phiên chính) · chạy cả thư mục tests/e2e/supabase: 38 đạt; mở PR

## Bằng chứng
- Unit `npx vitest run src/lib/lich.test.ts`: lần đầu đỏ 3 test (YC2.4-NT1, NT2, NT3, chưa có hàm), code 1 vòng thì xanh.
- Unit màn `npx vitest run src/man/CN1LichThang.test.tsx`: lần đầu đỏ 4 test YC2.4 mới; sau khi code đỏ 1 test cũ YC2.2 bước 6, 7 (đếm mọi listitem), đổi danh sách sắp tới sang nút trong div, 2 vòng, xanh 28/28.
- `npx vitest run`: 39 file, 430 test xanh. `npm run typecheck`, `npm run build`: qua. `python3 scripts/kiem.py --diff origin/main`: không có lỗi.
- e2e `tests/e2e/supabase/lich-thang.spec.ts` (YC2.4-NT1 NT2 NT3 luồng chính): phiên chính bật lại Docker và Supabase local, chạy cả thư mục tests/e2e/supabase ngày 19/11: 38 test đạt.
