---
id: US44
tieu_de: "Tìm phòng trống theo ngày"
loai: US
trang_thai: dang-lam
thuc_hien: [YC7.2@1]
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
Là sale, tôi làm được việc "Tìm phòng trống theo ngày" đúng như YC7.2 mô tả.

## Làm tiêu chí nào
YC7.2-NT1 đến NT8

## Quy tắc, hành vi dùng
QT1.3, QT2.1, QT3.1, QT5.4, QT6.4

## Màn hình
S1-02, S1-03, S2-00

## Quyền
PQ2, PQ3, PQ4, PQ5, PQ6, PQ11, PQ13, PQ14, PQ23 và các test vi phạm ở mục "Ai được làm gì" của YC7-lich-va-tim-phong-cua-sale.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- YC7-H1, H2, H3, H5 đã Claude tự chốt (QD25, YC7 r3).
- Màn kết quả S2, S4 là YC7.3 (US45). Ở US44, lệnh tìm đã trả kết quả đủ cho S2; có căn trống thì app tạm hiện một màn đơn giản ghi số căn trống và nút "Sửa tìm kiếm", US45 thay bằng S2.
- Phần đầu YC7-lich-va-tim-phong-cua-sale.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC7.2 QT1.3 QT2.1 QT3.1 QT5.4 QT6.4 PQ2 PQ3 PQ4 PQ5 PQ6 PQ11 PQ13 PQ14 PQ23 S1-02 S1-03 S2-00
YC7-lich-va-tim-phong-cua-sale.md#Quy tắc của nhóm
YC7-lich-va-tim-phong-cua-sale.md#Ai được làm gì
YC7-lich-va-tim-phong-cua-sale.md#Dữ liệu
YC7-lich-va-tim-phong-cua-sale.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US44-tim-phong-trong-theo-ngay.md.

## Task
- [ ] US44-TA1 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC7.2-NT3, YC7.2-NT5, YC7.2-NT6, YC7.2-NT8, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5)
- [ ] US44-TA2 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng
- [ ] US44-TA3 Code · Claude Code (sonnet, CL14.6a): màn S1-02, S1-03, S2-00 theo canvas, test unit, e2e cho YC7.2-NT1, YC7.2-NT2, YC7.2-NT3, YC7.2-NT4, YC7.2-NT7
- [ ] US44-TA4 Test tay · Đức: chạy tests/kb/US44-tim-phong-trong-theo-ngay.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC7.2@1 (QD21)
- 2026-11-19 · Claude (QD25) · tự chốt YC7-H1, H2, H3, H5 (YC7 r3, thêm NT8); viết kịch bản test tay; soạn gói việc; giao agent code

## Bằng chứng
