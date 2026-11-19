---
id: US61
tieu_de: "Popup thông báo mới"
loai: US
trang_thai: moi
thuc_hien: [YC12.1@1]
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
Là sale, tôi làm được việc "Popup thông báo mới" đúng như YC12.1 mô tả.

## Làm tiêu chí nào
YC12.1-NT1 đến NT7

## Quy tắc, hành vi dùng
Không có.

## Màn hình
S1-06, S1-06-01

## Quyền
PQ19 và các test vi phạm ở mục "Ai được làm gì" của YC12-thong-bao.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- Phần đầu YC12-thong-bao.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC12.1 PQ19 S1-06 S1-06-01
YC12-thong-bao.md#Quy tắc của nhóm
YC12-thong-bao.md#Ai được làm gì
YC12-thong-bao.md#Dữ liệu
YC12-thong-bao.md#Trạng thái màn (mọi mục)

## Test case
Kịch bản test tay: tests/kb/US61-popup-thong-bao-moi.md, chưa viết. Viết trước khi item sang san-sang (CL14.5a).

## Task
- [ ] US61-TA1 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy và test database cho YC12.1-NT1 đến NT7
- [ ] US61-TA2 Code · Claude Code (sonnet, CL14.6a): màn S1-06, S1-06-01 theo canvas, test unit, e2e cho YC12.1-NT1, YC12.1-NT3, YC12.1-NT4, YC12.1-NT5
- [ ] US61-TA3 Test tay · Đức: chạy tests/kb/US61-popup-thong-bao-moi.md, chế độ nhanh rồi đủ.

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC12.1@1 (QD21)

## Bằng chứng
