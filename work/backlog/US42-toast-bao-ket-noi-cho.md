---
id: US42
tieu_de: "Toast báo kết nối cho sale"
loai: US
trang_thai: dang-lam
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
pr:
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
- [ ] US42-TA1 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy và test database cho YC6.8-NT2, YC6.8-NT3
- [ ] US42-TA2 Code · Claude Code (sonnet, CL14.6a): màn A9, A9-02 theo canvas, test unit, e2e cho YC6.8-NT1, YC6.8-NT2, YC6.8-NT4
- [ ] US42-TA3 Test tay · Đức: chạy tests/kb/US42-toast-bao-ket-noi-cho.md, chế độ nhanh rồi đủ.

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC6.8@1 (QD21)
- 2026-11-19 · Claude (QD25) · tự chốt YC6-H19, H20 (YC6 r11, thêm NT3, NT4); viết kịch bản test tay; soạn gói việc; giao agent code

## Bằng chứng
