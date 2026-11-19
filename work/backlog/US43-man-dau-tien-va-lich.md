---
id: US43
tieu_de: "Màn đầu tiên và lịch 7 ngày của sale"
loai: US
trang_thai: dang-lam
thuc_hien: [YC7.1@1]
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
Là sale, tôi làm được việc "Màn đầu tiên và lịch 7 ngày của sale" đúng như YC7.1 mô tả.

## Làm tiêu chí nào
YC7.1-NT1 đến NT8; HV8-NT3 (hành vi chung gắn màn này, QD27)

## Quy tắc, hành vi dùng
QT1.3, QT2.1, QT3.1, QT5.4, QT6.4

## Màn hình
A5, S1, S1-04, S1-05

## Quyền
PQ2, PQ3, PQ4, PQ5, PQ6, PQ11, PQ13, PQ14, PQ23 và các test vi phạm ở mục "Ai được làm gì" của YC7-lich-va-tim-phong-cua-sale.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- YC7-H8, YC7-H9 đã Claude tự chốt (QD25, YC7 r2).
- Chạm căn mở S3 (YC7.4, US46), S6-07, S6-03 (YC10, US54, US56): chưa có màn thì chạm căn chưa làm gì, ghi trong PR. Ô tìm mở YC7.2 (US44): chưa có thì chưa làm gì. Mức cộng do sale đặt (YC7.5, US47): chưa có thì dùng mức cộng đã có trong database (bảng muc_cong).
- Phần đầu YC7-lich-va-tim-phong-cua-sale.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC7.1 QT1.3 QT2.1 QT3.1 QT5.4 QT6.4 PQ2 PQ3 PQ4 PQ5 PQ6 PQ11 PQ13 PQ14 PQ23 A5 S1 S1-04 S1-05
YC7-lich-va-tim-phong-cua-sale.md#Quy tắc của nhóm
YC7-lich-va-tim-phong-cua-sale.md#Ai được làm gì
YC7-lich-va-tim-phong-cua-sale.md#Dữ liệu
YC7-lich-va-tim-phong-cua-sale.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US43-man-dau-tien-va-lich.md.

## Task
- [ ] US43-TA1 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC7.1-NT2 đến NT6, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5)
- [ ] US43-TA2 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng
- [ ] US43-TA3 Code · Claude Code (sonnet, CL14.6a): màn A5, S1, S1-04, S1-05 theo canvas, test unit, e2e cho YC7.1-NT1, YC7.1-NT2, YC7.1-NT3, YC7.1-NT5, YC7.1-NT7, YC7.1-NT8
- [ ] US43-TA4 Test tay · Đức: chạy tests/kb/US43-man-dau-tien-va-lich.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC7.1@1 (QD21)
- 2026-11-19 · Claude · nhận HV8-NT3 từ EN4 (QD27)
- 2026-11-19 · Claude (QD25) · tự chốt YC7-H8, H9 (YC7 r2); viết kịch bản test tay; soạn gói việc; giao agent code

## Bằng chứng
