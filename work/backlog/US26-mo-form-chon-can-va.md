---
id: US26
tieu_de: "Mở form, chọn căn và ngày, kiểm trùng sớm"
loai: US
trang_thai: moi
thuc_hien: [YC5.1@1]
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
Là chủ nhà, tôi làm được việc "Mở form, chọn căn và ngày, kiểm trùng sớm" đúng như YC5.1 mô tả.

## Làm tiêu chí nào
YC5.1-NT1 đến NT6; HV3-NT1, HV3-NT4 (hành vi chung gắn màn này, QD27)

## Quy tắc, hành vi dùng
QT1, QT1.1, QT2, QT3.1, QT4, QT5.6, QT6.1, QT6.2

## Màn hình
CN4, CN3

## Quyền
PQ4, PQ7, PQ8, PQ9, PQ11, PQ17 và các test vi phạm ở mục "Ai được làm gì" của YC5-dat-phong.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- Phần đầu YC5-dat-phong.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC5.1 QT1 QT1.1 QT2 QT3.1 QT4 QT5.6 QT6.1 QT6.2 PQ4 PQ7 PQ8 PQ9 PQ11 PQ17 CN4 CN3
YC5-dat-phong.md#Quy tắc của nhóm
YC5-dat-phong.md#Ai được làm gì
YC5-dat-phong.md#Dữ liệu
YC5-dat-phong.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US26-mo-form-chon-can-va.md.

## Task
- [ ] US26-TA1 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC5.1-NT2, YC5.1-NT6, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5)
- [ ] US26-TA2 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng
- [ ] US26-TA3 Code · Claude Code (sonnet, CL14.6a): màn CN4, CN3 theo canvas, test unit, e2e cho YC5.1-NT1 đến NT4
- [ ] US26-TA4 Test tay · Đức: chạy tests/kb/US26-mo-form-chon-can-va.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC5.1@1 (QD21)
- 2026-11-19 · Claude · nhận HV3-NT1, HV3-NT4 từ EN4 (QD27)

## Bằng chứng
