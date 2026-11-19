---
id: US38
tieu_de: "Sale xin chủ nhà cho xem lịch"
loai: US
trang_thai: dang-lam
thuc_hien: [YC6.4@2]
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
Là sale, tôi làm được việc "Sale xin chủ nhà cho xem lịch" đúng như YC6.4 mô tả.

## Làm tiêu chí nào
YC6.4-NT1 đến NT5

## Quy tắc, hành vi dùng
Không có.

## Màn hình
A5, A6, A7, A7-00, A7-01

## Quyền
PQ1, PQ2, PQ4, PQ17, PQ18, PQ23 và các test vi phạm ở mục "Ai được làm gì" của YC6-ket-noi-sale.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- YC6-H13 (YC6.2 r5), YC6-H2 (YC6.4 r7) đã Claude tự chốt (QD25).
- Phần đầu YC6-ket-noi-sale.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC6.4 PQ1 PQ2 PQ4 PQ17 PQ18 PQ23 A5 A6 A7 A7-00 A7-01
YC6-ket-noi-sale.md#Quy tắc của nhóm
YC6-ket-noi-sale.md#Ai được làm gì
YC6-ket-noi-sale.md#Dữ liệu
YC6-ket-noi-sale.md#Trạng thái màn (mọi mục)

## Test case
Kịch bản test tay: tests/kb/US38-sale-xin-chu-nha-cho.md.

## Task
- [x] US38-TA1 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy và test database cho YC6.4-NT2, YC6.4-NT4, YC6.4-NT5
- [x] US38-TA2 Code · Claude Code (sonnet, CL14.6a): màn A5, A6, A7, A7-00, A7-01 theo canvas, test unit, e2e cho YC6.4-NT1 đến NT3
- [ ] US38-TA3 Test tay · Đức: chạy tests/kb/US38-sale-xin-chu-nha-cho.md, chế độ nhanh rồi đủ.

## Kế hoạch
- TA1: test `tests/db/54_us38_xin_lich.sql` trước, rồi migration `20261119330000_us38_xin_lich.sql`: `fn_lay_link_xin_lich()` (sale, lấy hay tạo, mã 32 chữ cái không chữ số), `fn_gui_link_xin_lich()` (tăng số lần gửi, ghi lần gửi cuối), `xin_lich_cua_toi()` (security invoker, đọc qua RLS: mã, số lần gửi, lần gửi cuối, số chủ đã đồng ý, có nguồn chưa). Thêm dòng thử làm hỏng ở scripts/thu-lam-hong.txt.
- TA2: `src/lib/dichVuXinLich.ts`, màn A5, A6, A7 (A7-00, A7-01) trong `src/man/`, nối ở ManTam (tab Lịch của sale chưa có nguồn), `dichVuCan.ts`, e2e `xin-lich.spec.ts`. "Thêm căn thủ công" chờ US56: toast tạm.

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC6.4@1 (QD21)
- 2026-11-19 · Claude · thuc_hien lên bản mới theo QD22
- 2026-11-19 · Claude · YC8-H5 đã trả lời (nút Chia sẻ)
- 2026-11-19 · Claude (QD25) · tự chốt PQ18-H1 (PQ r2: link xin lịch không hết hạn); soạn gói việc; giao agent code
- 2026-11-19 · Claude (agent code) · TA1, TA2 xong trên nhánh US38-xin-lich, chưa mở PR; hàm đọc đặt tên xin_lich_cua_toi vì fn_* phải security definer

## Bằng chứng
- TA1 `PGHOST=localhost PGUSER=postgres PGPASSWORD=postgres CHI_FILE_CO_MA=1 scripts/test-db.sh YC6.4`: lần đầu (chưa migration) 22 đỏ; sau migration 30 qua. Cả bộ lần đầu 1 đỏ (KT-DB.3.3: fn_* phải security definer), đổi tên hàm đọc thành xin_lich_cua_toi, 1 vòng: 1391 qua, 0 hỏng.
- `scripts/thu-lam-hong.sh YC6.4`: 4 đạt, 0 không đạt.
- TA2 `npx vitest run`: lần đầu 3 file đỏ (chưa có màn), sau khi viết màn 0 vòng sửa: 54 file, 559 test qua.
- `npm run typecheck`, `npm run build`: qua.
- e2e `E2E_SUPABASE=1 CI=1 npx playwright test tests/e2e/supabase`: 52 qua (2 test mới ở xin-lich.spec.ts).
- `python3 scripts/kiem.py --diff origin/main`: không có lỗi.
