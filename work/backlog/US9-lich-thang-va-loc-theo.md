---
id: US9
tieu_de: "Lịch tháng và lọc theo căn"
loai: US
trang_thai: moi
thuc_hien: [YC2.1@1]
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
Là chủ nhà, tôi làm được việc "Lịch tháng và lọc theo căn" đúng như YC2.1 mô tả.

## Làm tiêu chí nào
YC2.1-NT1 đến NT6

## Quy tắc, hành vi dùng
QT2, QT6.1

## Màn hình
CN1, CN1-00, CN1-02

## Quyền
PQ4, PQ7, PQ8, PQ9, PQ16 và các test vi phạm ở mục "Ai được làm gì" của YC2-lich-chu-nha.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- Phần đầu YC2-lich-chu-nha.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC2.1 QT2 QT6.1 PQ4 PQ7 PQ8 PQ9 PQ16 CN1 CN1-00 CN1-02
YC2-lich-chu-nha.md#Quy tắc của nhóm
YC2-lich-chu-nha.md#Ai được làm gì
YC2-lich-chu-nha.md#Dữ liệu
YC2-lich-chu-nha.md#Trạng thái màn (mọi mục)

## Test case
Kịch bản test tay: tests/kb/US9-lich-thang-va-loc-theo.md, chưa viết. Viết trước khi item sang san-sang (CL14.5a).

## Task
- [ ] US9-TA1 Code · Claude Code (sonnet, CL14.6a): màn CN1, CN1-00, CN1-02 theo canvas, test unit, e2e cho YC2.1-NT1 đến NT6
- [ ] US9-TA2 Test tay · Đức: chạy tests/kb/US9-lich-thang-va-loc-theo.md, chế độ nhanh rồi đủ.

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC2.1@1 (QD21)

## Bằng chứng
