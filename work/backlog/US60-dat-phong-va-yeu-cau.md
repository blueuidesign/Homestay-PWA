---
id: US60
tieu_de: "Đặt phòng và yêu cầu của sale"
loai: US
trang_thai: moi
thuc_hien: [YC11.3@2]
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
Là sale, tôi làm được việc "Đặt phòng và yêu cầu của sale" đúng như YC11.3 mô tả.

## Làm tiêu chí nào
YC11.3-NT1 đến NT9

## Quy tắc, hành vi dùng
QT2.1, QT2.2, QT3.1, QT3.2, QT4.2, QT6.1

## Màn hình
S7-03, S7-03-00

## Quyền
PQ7, PQ9, PQ10, PQ11, PQ14, PQ15, PQ16 và các test vi phạm ở mục "Ai được làm gì" của YC11-thong-ke.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- Chỗ chưa quyết trong mục, chưa code tới khi Tùng trả lời: YC11-H5, YC11-H3.
- Phần đầu YC11-thong-ke.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC11.3 QT2.1 QT2.2 QT3.1 QT3.2 QT4.2 QT6.1 PQ7 PQ9 PQ10 PQ11 PQ14 PQ15 PQ16 S7-03 S7-03-00
YC11-thong-ke.md#Quy tắc của nhóm
YC11-thong-ke.md#Ai được làm gì
YC11-thong-ke.md#Dữ liệu
YC11-thong-ke.md#Trạng thái màn (mọi mục)

## Test case
Kịch bản test tay: tests/kb/US60-dat-phong-va-yeu-cau.md.

## Task
- [ ] US60-TA1 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy và test database cho YC11.3-NT2, YC11.3-NT4, YC11.3-NT6, YC11.3-NT7, YC11.3-NT8
- [ ] US60-TA2 Code · Claude Code (sonnet, CL14.6a): màn S7-03, S7-03-00 theo canvas, test unit, e2e cho YC11.3-NT1 đến NT6, NT9
- [ ] US60-TA3 Test tay · Đức: chạy tests/kb/US60-dat-phong-va-yeu-cau.md, chế độ nhanh rồi đủ.

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC11.3@1 (QD21)
- 2026-11-20 · Claude (QD25) · YC11 r2: Claude tự chốt YC11-H1 đến H9 (trừ H4), cập nhật NT và task.

## Bằng chứng
