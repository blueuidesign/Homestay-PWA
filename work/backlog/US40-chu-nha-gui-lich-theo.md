---
id: US40
tieu_de: "Chủ nhà gửi lịch theo căn đã chọn"
loai: US
trang_thai: dang-lam
thuc_hien: [YC6.6@2]
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
pr:
ngay_tao: 2026-11-18
---
## Mục tiêu
Là chủ nhà, tôi làm được việc "Chủ nhà gửi lịch theo căn đã chọn" đúng như YC6.6 mô tả.

## Làm tiêu chí nào
YC6.6-NT1 đến NT7

## Quy tắc, hành vi dùng
HV8

## Màn hình
CN10, CN10-00, CN10-01, CN10-02

## Quyền
PQ1, PQ2, PQ4, PQ17, PQ18, PQ23 và các test vi phạm ở mục "Ai được làm gì" của YC6-ket-noi-sale.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- YC6-H7, H8, H9 đã Claude tự chốt (QD25, YC6 r9).
- Phần đầu YC6-ket-noi-sale.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC6.6 HV8 PQ1 PQ2 PQ4 PQ17 PQ18 PQ23 CN10 CN10-00 CN10-01 CN10-02
YC6-ket-noi-sale.md#Quy tắc của nhóm
YC6-ket-noi-sale.md#Ai được làm gì
YC6-ket-noi-sale.md#Dữ liệu
YC6-ket-noi-sale.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US40-chu-nha-gui-lich-theo.md.

## Task
- [x] US40-TA1 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC6.6-NT1, YC6.6-NT2, YC6.6-NT4, YC6.6-NT5, YC6.6-NT7, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5)
- [x] US40-TA2 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng
- [x] US40-TA3 Code · Claude Code (sonnet, CL14.6a): màn CN10, CN10-00, CN10-01, CN10-02 theo canvas, test unit, e2e cho YC6.6-NT3, YC6.6-NT6
- [ ] US40-TA4 Test tay · Đức: chạy tests/kb/US40-chu-nha-gui-lich-theo.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch
- TA1: tests/db/56_us40_gui_lich.sql (NT1, NT2, NT4, NT5, NT7, vi phạm quyền PQ17, PQ18, PQ23), chạy thấy đỏ trước migration.
- TA2: migration 20261119350000_us40_gui_lich.sql: fn_gui_lich (luôn link mới, kiểm căn của mình chưa xóa), can_cua_link; fn_xem_link_moi, fn_them_lich_link_moi, rieng.anh_cua_link_moi nhận loại gui_lich (không thu hẹp quyền, YC6-H7). 5 phép thử làm hỏng.
- TA3: CN10GuiLich (CN10, CN10-00, CN10-01), ô "Gửi lịch cho sale" ở CN1, ManChu mở CN10 trong tab Lịch, toast "Đã gửi lịch" (CN10-02); dichVuLinkMoi.guiLich; e2e gui-lich.spec.ts.

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC6.6@1 (QD21)
- 2026-11-19 · Claude · thuc_hien lên bản mới theo QD22
- 2026-11-19 · Claude · YC8-H5 đã trả lời (nút Chia sẻ)
- 2026-11-19 · Claude (QD25) · tự chốt YC6-H7, H8, H9 (YC6 r9, thêm NT5 đến NT7); viết kịch bản test tay; soạn gói việc; giao agent code
- 2026-11-19 · Claude (agent code) · TA1, TA2, TA3 xong trên nhánh US40-gui-lich, chưa mở PR · bất ngờ: guiChu coi đóng bảng chia sẻ là đã gửi nên CN10 tự gọi share

## Bằng chứng
- 2026-11-19 · test DB `scripts/test-db.sh`: trước migration 52 hỏng/22 qua (sửa 1 lỗi dựng dữ liệu trong test), sau migration vòng 1 xanh: 1525 qua, 0 hỏng.
- `scripts/thu-lam-hong.sh`: 193/193 đạt (5 phép mới YC6.6, 1 vòng sửa khóa có dấu nháy).
- `npx vitest run`: 58 file, 590 test qua (lần đầu 2 file đỏ vì chưa có màn). `npm run typecheck`, `npm run build`: qua.
- e2e `playwright test tests/e2e/supabase`: 57 qua (gui-lich.spec.ts: 3; 1 vòng sửa chờ đăng nhập xong).
