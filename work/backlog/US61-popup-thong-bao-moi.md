---
id: US61
tieu_de: "Popup thông báo mới"
loai: US
trang_thai: cho-test
thuc_hien: [YC12.1@1]
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
pr: 83
ngay_tao: 2026-11-18
---
## Mục tiêu
Là sale, tôi làm được việc "Popup thông báo mới" đúng như YC12.1 mô tả.

## Làm tiêu chí nào
YC12.1-NT1 đến NT7

## Quy tắc, hành vi dùng
Không có.

## Màn hình
S1-06, S1-06-01

## Quyền
PQ19 và các test vi phạm ở mục "Ai được làm gì" của YC12-thong-bao.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
supabase/migrations/20261120210000_us61_mo_app.sql, supabase/bang-va-cot.md, tests/db/87_us61_popup_thong_bao.sql, scripts/thu-lam-hong.txt, src/lib/thongBao.ts (mới), src/lib/dichVuThongBao.ts, src/man/S106PopupThongBao.tsx và .css (mới), src/App.tsx, unit test kèm, tests/e2e/supabase/popup-thong-bao.spec.ts, tests/kb/US61-popup-thong-bao-moi.md, work/gia-dinh.md (GD33).

## Ngoài phạm vi
- Chạm một dòng để mở màn và đánh dấu đã đọc, nút "Xem tất cả thông báo" mở P13: làm ở US62 (YC12.2). Popup đã có hai chỗ gọi (onChamDong, onXemTatCa).
- Phần đầu YC12-thong-bao.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC12.1 PQ19 S1-06 S1-06-01
YC12-thong-bao.md#Quy tắc của nhóm
YC12-thong-bao.md#Ai được làm gì
YC12-thong-bao.md#Dữ liệu
YC12-thong-bao.md#Trạng thái màn (mọi mục)

## Test case
Kịch bản test tay: tests/kb/US61-popup-thong-bao-moi.md (5 kịch bản, 3 [Chính]).

## Task
- [x] US61-TA1 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy và test database cho YC12.1-NT1 đến NT7
- [x] US61-TA2 Code · Claude Code (sonnet, CL14.6a): màn S1-06, S1-06-01 theo canvas, test unit, e2e cho YC12.1-NT1, YC12.1-NT3, YC12.1-NT4, YC12.1-NT5
- [ ] US61-TA3 Test tay · Đức: chạy tests/kb/US61-popup-thong-bao-moi.md, chế độ nhanh rồi đủ.

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC12.1@1 (QD21)
- 2026-11-20 · Claude (tự chạy, QD25) · test database trước, fn_mo_app, popup S1-06, tests/kb, tự chốt GD33 (lần mở đầu chưa có mốc: không popup) · khoảng 40 phút

## Bằng chứng
- `CHI_FILE_CO_MA=1 scripts/test-db.sh YC12.1`: lần đầu đỏ (chưa có hàm), sau hai vòng sửa test (đồng hồ trong một giao dịch, mốc dùng clock_timestamp) 24 qua, 0 hỏng. `scripts/thu-lam-hong.sh YC12.1`: 3 đạt. `npx vitest run src/man/S106PopupThongBao.test.tsx src/lib/thongBao.test.ts`: qua. `npm run typecheck`: qua. `python3 scripts/kiem.py --diff origin/main`: không lỗi. e2e: CI chạy.
- CI e2e đỏ lần 1 (9 test của sale): popup che màn khi test có sẵn thông báo trước lần đăng nhập đầu, và khi test quay lại từ nền sau khi có thông báo mới. Sửa: GD33 đổi thành lần mở đầu không popup; test quay lại từ nền đóng popup trước khi bấm.
- 2026-11-20 · Claude (tự chạy, QD25) · gộp PR #83 (CI xanh sau 3 vòng e2e: popup che màn ở test cũ, một lần cổng máy CI bận); chuyển cho-test, chờ Đức TA3
