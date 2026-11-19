---
id: US53
tieu_de: "Sale nhận kết quả"
loai: US
trang_thai: moi
thuc_hien: [YC9.4@1]
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
Là sale, tôi làm được việc "Sale nhận kết quả" đúng như YC9.4 mô tả.

## Làm tiêu chí nào
YC9.4-NT1 đến NT8; HV3-NT3 (hành vi chung gắn màn này, QD27)

## Quy tắc, hành vi dùng
QT1.1, QT1.4, QT2.1, QT5.6, QT6.2

## Màn hình
S3-04, S3-04-01, S3-05, S3-09

## Quyền
PQ2, PQ5, PQ7, PQ10, PQ11, PQ19 và các test vi phạm ở mục "Ai được làm gì" của YC9-yeu-cau-dat-phong.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- YC9-H3, H5 đã Claude tự chốt (QD25, YC9 r3). YC9-H6 làm ở US50.
- Phần đầu YC9-yeu-cau-dat-phong.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC9.4 QT1.1 QT1.4 QT2.1 QT5.6 QT6.2 PQ2 PQ5 PQ7 PQ10 PQ11 PQ19 S3-04 S3-04-01 S3-05 S3-09
YC9-yeu-cau-dat-phong.md#Quy tắc của nhóm
YC9-yeu-cau-dat-phong.md#Ai được làm gì
YC9-yeu-cau-dat-phong.md#Dữ liệu
YC9-yeu-cau-dat-phong.md#Trạng thái màn (mọi mục)

## Test case
Kịch bản test tay: tests/kb/US53-sale-nhan-ket-qua.md.

## Task
- [ ] US53-TA1 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy và test database cho YC9.4-NT1, YC9.4-NT4, YC9.4-NT5, YC9.4-NT6, YC9.4-NT7
- [ ] US53-TA2 Code · Claude Code (sonnet, CL14.6a): màn S3-04, S3-04-01, S3-05, S3-09 theo canvas, test unit, e2e cho YC9.4-NT1 đến NT5, NT8
- [ ] US53-TA3 Test tay · Đức: chạy tests/kb/US53-sale-nhan-ket-qua.md, chế độ nhanh rồi đủ.

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC9.4@1 (QD21)
- 2026-11-19 · Claude · nhận HV3-NT3 từ EN4 (QD27)
- 2026-11-19 · Claude (QD25) · YC9 r3 tự chốt câu mở, thêm NT

## Bằng chứng
