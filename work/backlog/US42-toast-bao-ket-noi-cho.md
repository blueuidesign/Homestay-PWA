---
id: US42
tieu_de: "Toast báo kết nối cho sale"
loai: US
trang_thai: cho-test
thuc_hien: [YC6.8@1]
truoc: [EN1, EN2, EN4, US2]
lien_quan: []
thay_cho: []
nguon: QD21
nguoi: tung
rui_ro: thap
nghiem_thu: khong
uoc_luong:
thuc_te:
can_duyet: []
based_on:
pr: [50]
ngay_tao: 2026-11-18
---
## Mục tiêu
Là người dùng (chủ nhà hoặc sale), tôi làm được việc "Toast báo kết nối cho sale" đúng như YC6.8 mô tả.

## Làm tiêu chí nào
YC6.8-NT1 đến NT4

## Quy tắc, hành vi dùng
Không có.

## Màn hình
A9, A9-02

## Quyền
PQ1, PQ2, PQ4, PQ17, PQ18, PQ23 và các test vi phạm ở mục "Ai được làm gì" của YC6-ket-noi-sale.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- YC6-H19, H20 đã Claude tự chốt (QD25, YC6 r11).
- Popup thông báo mới và đánh dấu đã đọc: YC12. Nguồn phòng: YC10.1 (US54).
- Phần đầu YC6-ket-noi-sale.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC6.8 PQ1 PQ2 PQ4 PQ17 PQ18 PQ23 A9 A9-02
YC6-ket-noi-sale.md#Quy tắc của nhóm
YC6-ket-noi-sale.md#Ai được làm gì
YC6-ket-noi-sale.md#Dữ liệu
YC6-ket-noi-sale.md#Trạng thái màn (mọi mục)

## Test case
Kịch bản test tay: tests/kb/US42-toast-bao-ket-noi-cho.md.

## Task
- [x] US42-TA1 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy và test database cho YC6.8-NT2, YC6.8-NT3 · PR #50
- [x] US42-TA2 Code · Claude Code (sonnet, CL14.6a): màn A9, A9-02 theo canvas, test unit, e2e cho YC6.8-NT1, YC6.8-NT2, YC6.8-NT4 · PR #50
- [ ] US42-TA3 Test tay · Đức: chạy tests/kb/US42-toast-bao-ket-noi-cho.md, chế độ nhanh rồi đủ.

## Kế hoạch
- TA1: test `tests/db/58_us42_toast_ket_noi.sql` trước, rồi migration `20261119360000_us42_toast_ket_noi.sql`: hàm `ghi_thong_bao_dong_y` (security definer, không cấp cho app) ghi hay gom thông báo `chu_dong_y_ket_noi` (khóa theo sale; gom vào dòng chưa đọc tạo chưa quá 10 phút); `fn_dong_y_xin_lich` gọi nó. noi_dung giữ `ten_chu`, `so_can` (US39) và thêm `cac_chu` (tên, tòa + mã tối đa 3 căn theo mã, số căn), `so_chu`, `ket_noi`.
- TA2: `src/lib/toastKetNoi.ts` dựng chữ, `src/lib/dichVuThongBao.ts` đọc qua RLS, `src/man/A9ToastKetNoi.tsx` lấy khi mở, quay lại từ nền, mỗi 60 giây; nhớ dòng đã hiện ở localStorage; gắn cho sale ở `src/App.tsx`. Unit trước, e2e `toast-ket-noi.spec.ts`.

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC6.8@1 (QD21)
- 2026-11-19 · Claude (QD25) · tự chốt YC6-H19, H20 (YC6 r11, thêm NT3, NT4); viết kịch bản test tay; soạn gói việc; giao agent code
- 2026-11-19 · Claude (agent code) · TA1, TA2 xong trên nhánh US42-toast-ket-noi, chưa mở PR · e2e qua ngay lần đầu
- 2026-11-19 · Claude (QD25) · Gộp PR #50, CI xanh 4/4. Chuyển cho-test, chờ Đức test tay TA3.

## Bằng chứng
- DB: `CHI_FILE_CO_MA=1 scripts/test-db.sh YC6.8` lần đầu 14 đỏ (chưa có migration), 1 vòng sửa: 21 qua. Cả bộ `scripts/test-db.sh`: 1546 qua, 0 hỏng (55_us39 vẫn xanh). `scripts/thu-lam-hong.sh YC6.8`: 2/2 đạt.
- Unit: test mới đỏ (chưa có module), 1 vòng: `npx vitest run` 62 file, 610 test qua. `npm run typecheck`, `npm run build` qua.
- e2e: `playwright test tests/e2e/supabase` 58 qua (toast-ket-noi.spec.ts qua lần đầu).
- `python3 scripts/kiem.py --diff origin/main`: không có lỗi.
