---
id: US10
tieu_de: "Chi tiết một ngày"
loai: US
trang_thai: moi
thuc_hien: [YC2.2@1]
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
Là chủ nhà, tôi làm được việc "Chi tiết một ngày" đúng như YC2.2 mô tả.

## Làm tiêu chí nào
YC2.2-NT1 đến NT3

## Quy tắc, hành vi dùng
QT2, QT6.1

## Màn hình
CN3

## Quyền
PQ4, PQ7, PQ8, PQ9, PQ16 và các test vi phạm ở mục "Ai được làm gì" của YC2-lich-chu-nha.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- Phần đầu YC2-lich-chu-nha.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC2.2 QT2 QT6.1 PQ4 PQ7 PQ8 PQ9 PQ16 CN3
YC2-lich-chu-nha.md#Quy tắc của nhóm
YC2-lich-chu-nha.md#Ai được làm gì
YC2-lich-chu-nha.md#Dữ liệu
YC2-lich-chu-nha.md#Trạng thái màn (mọi mục)

## Test case
Kịch bản test tay: tests/kb/US10-chi-tiet-mot-ngay.md.

## Task
- [ ] US10-TA1 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy và test database cho YC2.2-NT3
- [ ] US10-TA2 Code · Claude Code (sonnet, CL14.6a): màn CN3 theo canvas, test unit, e2e cho YC2.2-NT2
- [ ] US10-TA3 Test tay · Đức: chạy tests/kb/US10-chi-tiet-mot-ngay.md, chế độ nhanh rồi đủ.

## Kế hoạch

## Nhật ký
- 2026-11-19 · Claude · trả lời YC2-H6, viết tests/kb
- 2026-11-18 · Claude · tạo item từ YC2.2@1 (QD21)

## Bằng chứng
