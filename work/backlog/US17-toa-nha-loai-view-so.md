---
id: US17
tieu_de: "Tòa nhà, loại view, số giường, mô tả"
loai: US
trang_thai: moi
thuc_hien: [YC3.4@3]
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
Là chủ nhà, tôi làm được việc "Tòa nhà, loại view, số giường, mô tả" đúng như YC3.4 mô tả.

## Làm tiêu chí nào
YC3.4-NT1 đến NT4

## Quy tắc, hành vi dùng
QT5.5, QT5.7, QT6.3

## Màn hình
CN5-A1 (phần mở rộng), CN5-A1b

## Quyền
PQ1, PQ3, PQ13 và các test vi phạm ở mục "Ai được làm gì" của YC3-can.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- YC3-H5, YC3-H7 đã trả lời (YC3 r3, Claude tự quyết QD25).
- Phần đầu YC3-can.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC3.4 QT5.5 QT5.7 QT6.3 PQ1 PQ3 PQ13 CN5-A1b
YC3-can.md#Quy tắc của nhóm
YC3-can.md#Ai được làm gì
YC3-can.md#Dữ liệu
YC3-can.md#Trạng thái màn (mọi mục)

## Test case
Kịch bản test tay: tests/kb/US17-toa-nha-loai-view-so.md (KB1 đến KB3).

## Task
- [ ] US17-TA1 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy và test database cho YC3.4-NT3, YC3.4-NT4
- [ ] US17-TA2 Code · Claude Code (sonnet, CL14.6a): màn CN5-A1 (phần mở rộng), CN5-A1b theo canvas, test unit, e2e cho YC3.4-NT1, YC3.4-NT2
- [ ] US17-TA3 Test tay · Đức: chạy tests/kb/US17-toa-nha-loai-view-so.md, chế độ nhanh rồi đủ.

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC3.4@1 (QD21)

## Bằng chứng
