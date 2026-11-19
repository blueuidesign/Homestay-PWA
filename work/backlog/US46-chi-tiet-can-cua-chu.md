---
id: US46
tieu_de: "Chi tiết căn của chủ nhà và giá bán"
loai: US
trang_thai: dang-lam
thuc_hien: [YC7.4@1]
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
Là sale, tôi làm được việc "Chi tiết căn của chủ nhà và giá bán" đúng như YC7.4 mô tả.

## Làm tiêu chí nào
YC7.4-NT1 đến NT7; HV5-NT1, HV5-NT2 (hành vi chung gắn màn này, QD27)

## Quy tắc, hành vi dùng
QT1.3, QT2.1, QT3.1, QT5.4, QT6.4

## Màn hình
S3

## Quyền
PQ2 và các test vi phạm ở mục "Ai được làm gì" của YC7-lich-va-tim-phong-cua-sale.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- YC7-H6, H7 đã Claude tự chốt (QD25, YC7 r5).
- "Gửi yêu cầu đặt phòng" mở S3-02 (YC9.1, US50): chưa có thì mở màn tạm S3-02 mang đúng căn và ngày để NT3 kiểm được. "Gửi cho khách" (YC8, US48): toast "Gửi cho khách sẽ có ở bản sau".
- Phần đầu YC7-lich-va-tim-phong-cua-sale.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC7.4 QT1.3 QT2.1 QT3.1 QT5.4 QT6.4 PQ2 S3
YC7-lich-va-tim-phong-cua-sale.md#Quy tắc của nhóm
YC7-lich-va-tim-phong-cua-sale.md#Ai được làm gì
YC7-lich-va-tim-phong-cua-sale.md#Dữ liệu
YC7-lich-va-tim-phong-cua-sale.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US46-chi-tiet-can-cua-chu.md.

## Task
- [ ] US46-TA1 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC7.4-NT1, YC7.4-NT2, YC7.4-NT5, YC7.4-NT6, YC7.4-NT7, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5)
- [ ] US46-TA2 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng
- [ ] US46-TA3 Code · Claude Code (sonnet, CL14.6a): màn S3 theo canvas, test unit, e2e cho YC7.4-NT1 đến NT4
- [ ] US46-TA4 Test tay · Đức: chạy tests/kb/US46-chi-tiet-can-cua-chu.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC7.4@1 (QD21)
- 2026-11-19 · Claude · nhận HV5-NT1, HV5-NT2 từ EN4 (QD27)
- 2026-11-19 · Claude (QD25) · tự chốt YC7-H6, H7 (YC7 r5, thêm NT7); viết kịch bản test tay; soạn gói việc; giao agent code

## Bằng chứng
