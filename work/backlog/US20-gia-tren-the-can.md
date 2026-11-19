---
id: US20
tieu_de: "Giá trên thẻ căn"
loai: US
trang_thai: moi
thuc_hien: [YC4.1@1]
truoc: [EN1, EN2, EN3, EN4]
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
Là chủ nhà, tôi làm được việc "Giá trên thẻ căn" đúng như YC4.1 mô tả.

## Làm tiêu chí nào
YC4.1-NT1, YC4.1-NT2

## Quy tắc, hành vi dùng
QT4.1, QT5.3

## Màn hình
CN5

## Quyền
PQ5, PQ6, PQ21 và các test vi phạm ở mục "Ai được làm gì" của YC4-gia.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- Phần đầu YC4-gia.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC4.1 QT4.1 QT5.3 PQ5 PQ6 PQ21 CN5
YC4-gia.md#Quy tắc của nhóm
YC4-gia.md#Ai được làm gì
YC4-gia.md#Dữ liệu
YC4-gia.md#Trạng thái màn (mọi mục)

## Test case
Kịch bản test tay: tests/kb/US20-gia-tren-the-can.md, chưa viết. Viết trước khi item sang san-sang (CL14.5a).

## Task
- [ ] US20-TA1 Code · Claude Code (sonnet, CL14.6a): màn CN5 theo canvas, test unit, e2e cho YC4.1-NT1, YC4.1-NT2
- [ ] US20-TA2 Test tay · Đức: chạy tests/kb/US20-gia-tren-the-can.md, chế độ nhanh rồi đủ.

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC4.1@1 (QD21)

## Bằng chứng
