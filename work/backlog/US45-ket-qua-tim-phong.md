---
id: US45
tieu_de: "Kết quả tìm phòng"
loai: US
trang_thai: dang-lam
thuc_hien: [YC7.3@1]
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
Là sale, tôi làm được việc "Kết quả tìm phòng" đúng như YC7.3 mô tả.

## Làm tiêu chí nào
YC7.3-NT1 đến NT6

## Quy tắc, hành vi dùng
QT1.3, QT2.1, QT3.1, QT5.4, QT6.4

## Màn hình
S2, S4

## Quyền
PQ2, PQ3, PQ4, PQ5, PQ6, PQ11, PQ13, PQ14, PQ23 và các test vi phạm ở mục "Ai được làm gì" của YC7-lich-va-tim-phong-cua-sale.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- YC7-H4 đã Claude tự chốt (QD25, YC7 r4).
- S6-07 (US54) và S6-03 (US56) chưa có: chạm căn của tôi, căn tự nhập mở màn tạm mang đúng tên màn và tên căn, để NT6 kiểm được; US54, US56 thay bằng màn thật. Chạm căn của chủ nhà mở S3 (US46): chưa có thì chưa làm gì. "Gửi cho khách" mở YC8 (US48): chưa có thì nút bấm được nhưng hiện toast "Gửi cho khách sẽ có ở bản sau".
- Phần đầu YC7-lich-va-tim-phong-cua-sale.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC7.3 QT1.3 QT2.1 QT3.1 QT5.4 QT6.4 PQ2 PQ3 PQ4 PQ5 PQ6 PQ11 PQ13 PQ14 PQ23 S2 S4
YC7-lich-va-tim-phong-cua-sale.md#Quy tắc của nhóm
YC7-lich-va-tim-phong-cua-sale.md#Ai được làm gì
YC7-lich-va-tim-phong-cua-sale.md#Dữ liệu
YC7-lich-va-tim-phong-cua-sale.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US45-ket-qua-tim-phong.md.

## Task
- [ ] US45-TA1 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC7.3-NT1, YC7.3-NT2, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5)
- [ ] US45-TA2 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng
- [ ] US45-TA3 Code · Claude Code (sonnet, CL14.6a): màn S2, S4 theo canvas, test unit, e2e cho YC7.3-NT1 đến NT6
- [ ] US45-TA4 Test tay · Đức: chạy tests/kb/US45-ket-qua-tim-phong.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC7.3@1 (QD21)
- 2026-11-19 · Claude (QD25) · tự chốt YC7-H4 (YC7 r4); viết kịch bản test tay; soạn gói việc; giao agent code

## Bằng chứng
