---
id: US28
tieu_de: "Lưu và chặn trùng"
loai: US
trang_thai: cho-test
thuc_hien: [YC5.3@2]
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
pr: [33]
ngay_tao: 2026-11-18
---
## Mục tiêu
Là chủ nhà, tôi làm được việc "Lưu và chặn trùng" đúng như YC5.3 mô tả.

## Làm tiêu chí nào
YC5.3-NT1 đến NT7; HV7-NT1, HV7-NT2 (hành vi chung gắn màn này, QD27)

## Quy tắc, hành vi dùng
QT1, QT1.1, QT1.4, QT2, QT3.1, QT4, QT4.2, QT5.5, QT5.6, QT6.1, QT6.2

## Màn hình
CN4, CN4-03

## Quyền
PQ4, PQ7, PQ8, PQ9, PQ11, PQ17 và các test vi phạm ở mục "Ai được làm gì" của YC5-dat-phong.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
supabase/migrations/20261119230000_us28_luu_chan_trung.sql, supabase/bang-va-cot.md, scripts/thu-lam-hong.txt, tests/db/43_us28_luu_chan_trung.sql, src/man/CN4ThemDatPhong.tsx, src/man/ManChu.tsx, src/man/CN1LichThang.tsx, src/lib/dichVuDatPhong.ts và test của các file đó, tests/e2e/supabase/them-dat-phong.spec.ts.

## Ngoài phạm vi
- Phần đầu YC5-dat-phong.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC5.3 QT1 QT1.1 QT1.4 QT2 QT3.1 QT4 QT4.2 QT5.5 QT5.6 QT6.1 QT6.2 PQ4 PQ7 PQ8 PQ9 PQ11 PQ17 CN4 CN4-03
YC5-dat-phong.md#Quy tắc của nhóm
YC5-dat-phong.md#Ai được làm gì
YC5-dat-phong.md#Dữ liệu
YC5-dat-phong.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US28-luu-va-chan-trung.md.

## Task
- [x] US28-TA1 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC5.3-NT2 đến NT7, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5) · PR #33
- [x] US28-TA2 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng · PR #33
- [x] US28-TA3 Code · Claude Code (sonnet, CL14.6a): màn CN4, CN4-03 theo canvas · PR #33
- [ ] US28-TA4 Test tay · Đức: chạy tests/kb/US28-luu-va-chan-trung.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch
- TA1: tests/db/43 NT2 tới NT7 (NT3 hai phiên thật qua dblink, không có thì nối tiếp), test vi phạm PQ7, PQ8, PQ9, PQ4, PQ11, PQ17.
- TA2: fn_tao_booking của US27 đã đủ chặn trùng, mã lần gửi, quyền; thêm trigger sau khi ghi booking: lich_doi_luc, yêu cầu chờ trùng thành bị từ chối (GD11), thông báo cho sale (YC12); trigger báo "Yêu cầu bị từ chối". Phép thử làm hỏng YC5.3.
- TA3: CN4 bước 11 tới 13 (trùng dòng đỏ, lỗi dữ liệu, mất mạng/15 giây cùng mã lần gửi, HV5), HV7-NT1 làm mới phiên rồi gửi lại; CN4-03 về đúng tháng, chi tiết ngày mở sẵn.

## Nhật ký
- 2026-11-19 · Claude · TA1, TA2, TA3 trên nhánh US28-luu-chan-trung · HV7-NT2 dừng: gói ghi unit, HV7 ghi e2e
- 2026-11-19 · Claude · viết tests/kb, soạn gói việc, sang dang-lam
- 2026-11-18 · Claude · tạo item từ YC5.3@1 (QD21)
- 2026-11-19 · Claude · nhận HV7-NT1, HV7-NT2 từ EN4 (QD27)
- 2026-11-19 · Claude · sửa lộ thông báo cho sale không còn chia sẻ căn, làm HV7-NT2 (e2e), gộp PR #33 theo QD25 · 875 test DB, 32 e2e xanh

## Bằng chứng
- `scripts/test-db.sh`: lần đầu (trước migration) 9 hỏng (NT5, giờ lịch đổi, thông báo); sau migration 1 hỏng do test 43 tự đặt mốc sai, sửa 1 vòng; NT3 phép thử làm hỏng ban đầu xanh vì phiên B rollback, sửa test cho B commit. Cuối: 871 qua, 0 hỏng.
- `scripts/thu-lam-hong.sh YC5.3`: 10/10 đạt.
- `npx vitest run`: 372 qua (lần đầu đỏ typecheck 2 lỗi trong test mới, sửa 1 vòng). `npm run typecheck`, `npm run build`: qua.
- `E2E_SUPABASE=1 CI=1 npx playwright test --trace off` (sau `supabase db reset`): 34 qua, lần đầu.
- `python3 scripts/kiem.py --diff origin/main`: không có lỗi.
