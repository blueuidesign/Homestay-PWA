---
id: US58
tieu_de: "Thống kê của chủ nhà"
loai: US
trang_thai: cho-test
thuc_hien: [YC11.1@2]
truoc: [EN1, EN2, EN4, US2]
lien_quan: []
thay_cho: []
nguon: QD21
nguoi: tung
rui_ro: cao
nghiem_thu: khong
uoc_luong:
thuc_te:
can_duyet: []
based_on:
pr: [67]
ngay_tao: 2026-11-18
---
## Mục tiêu
Là chủ nhà, tôi làm được việc "Thống kê của chủ nhà" đúng như YC11.1 mô tả.

## Làm tiêu chí nào
YC11.1-NT1 đến NT13

## Quy tắc, hành vi dùng
QT2.1, QT2.2, QT3.1, QT3.2, QT4.2, QT6.1

## Màn hình
CN8, CN8-00

## Quyền
PQ7, PQ9, PQ10, PQ11, PQ14, PQ15, PQ16 và các test vi phạm ở mục "Ai được làm gì" của YC11-thong-ke.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- Chỗ chưa quyết trong mục, chưa code tới khi Tùng trả lời: YC11-H1.
- Phần đầu YC11-thong-ke.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC11.1 QT2.1 QT2.2 QT3.1 QT3.2 QT4.2 QT6.1 PQ7 PQ9 PQ10 PQ11 PQ14 PQ15 PQ16 CN8 CN8-00
YC11-thong-ke.md#Quy tắc của nhóm
YC11-thong-ke.md#Ai được làm gì
YC11-thong-ke.md#Dữ liệu
YC11-thong-ke.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US58-thong-ke-cua-chu-nha.md.

## Task
- [x] US58-TA1 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC11.1-NT1, YC11.1-NT2, YC11.1-NT4, YC11.1-NT7, YC11.1-NT8, YC11.1-NT9, YC11.1-NT10, YC11.1-NT12, YC11.1-NT13, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5) · PR #67
- [x] US58-TA2 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng · PR #67
- [x] US58-TA3 Code · Claude Code (sonnet, CL14.6a): màn CN8, CN8-00 theo canvas, test unit, e2e cho YC11.1-NT1, YC11.1-NT2, YC11.1-NT3, YC11.1-NT5, YC11.1-NT6, YC11.1-NT7, YC11.1-NT9, YC11.1-NT11 · PR #67
- [ ] US58-TA4 Test tay · Đức: chạy tests/kb/US58-thong-ke-cua-chu-nha.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch
- TA1: tests/db/74_us58_thong_ke_chu.sql theo DLM.4 (thêm Sale Minh, "hôm nay" 07/10), hợp đồng fn_thong_ke_chu(p_thang, p_so_thang = 6) → jsonb; viết trước, đỏ.
- TA2: migration 20261119520000_us58_thong_ke_chu.sql cộng từ booking_dem, mẫu số theo can.tao_luc/an_luc (giờ VN), chưa thu theo tháng ngày nhận; phép làm hỏng.
- TA3: src/lib/thongKeChu.ts (tính chữ, %), dichVuThongKeChu.ts (rpc), CN8ThongKe.tsx thay bản tạm ở ManChu; unit, e2e.

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC11.1@1 (QD21)
- 2026-11-20 · Claude (QD25) · YC11 r2: Claude tự chốt YC11-H1 đến H9 (trừ H4), cập nhật NT và task.
- 2026-11-20 · Claude · TA1–TA3 trên nhánh US58-thong-ke-chu: fn_thong_ke_chu, CN8, CN8-00 · bất ngờ: B1 đã cọc lệch DLM.5, sửa theo YC11 r3 · 1 phiên
- 2026-11-20 · Claude (QD25) · YC11 r3: sửa YC11-H9 (chưa thu chỉ gồm chưa cọc) cho khớp DLM.5, CN8 và NT9; sửa NT13.
- 2026-11-20 · Claude (QD25) · Gộp PR #67 khi CI xanh cả 4 việc; trạng thái chờ test; migration 20261119520000 gửi thread staging.

## Bằng chứng
- TA1 `CHI_FILE_CO_MA=1 scripts/test-db.sh YC11.1`: lần đầu 49 hỏng, 3 qua (chưa có hàm).
- TA2 cùng lệnh sau migration: 52 qua, 0 hỏng, 0 vòng sửa. `scripts/test-db.sh` cả bộ: 2476 qua, 0 hỏng. `supabase db reset`, `scripts/bang-cot.sh` qua.
- `scripts/thu-lam-hong.sh YC11.1`: 8/8 đạt (1 phép sửa lại vì phép đầu không phá được).
- TA3 `npx vitest run`: 987 qua (test mới xanh lần đầu); `npm run typecheck`, `npm run build` qua.
- e2e `thong-ke-chu.spec.ts`: 1 qua lần đầu; `lich-thang`, `dem-cuoi-tuan` vẫn qua. `kiem.py --diff origin/main`: không có lỗi.
- YC11 r3 (H9 chỉ chưa cọc): sửa NT13 trước, đỏ 4; sửa migration thì `test-db.sh YC11.1` 48 qua, cả bộ 2472 qua; thu-lam-hong 8/8; vitest 987, e2e thong-ke-chu, kiem.py qua.
