---
id: US38
tieu_de: "Sale xin chủ nhà cho xem lịch"
loai: US
trang_thai: moi
thuc_hien: [YC6.4@2]
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
Là sale, tôi làm được việc "Sale xin chủ nhà cho xem lịch" đúng như YC6.4 mô tả.

## Làm tiêu chí nào
YC6.4-NT1 đến NT5

## Quy tắc, hành vi dùng
Không có.

## Màn hình
A5, A6, A7, A7-00, A7-01

## Quyền
PQ1, PQ2, PQ4, PQ17, PQ18, PQ23 và các test vi phạm ở mục "Ai được làm gì" của YC6-ket-noi-sale.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- Chỗ chưa quyết trong mục, chưa code tới khi Tùng trả lời: YC6-H13, YC6-H2.
- Phần đầu YC6-ket-noi-sale.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC6.4 PQ1 PQ2 PQ4 PQ17 PQ18 PQ23 A5 A6 A7 A7-00 A7-01
YC6-ket-noi-sale.md#Quy tắc của nhóm
YC6-ket-noi-sale.md#Ai được làm gì
YC6-ket-noi-sale.md#Dữ liệu
YC6-ket-noi-sale.md#Trạng thái màn (mọi mục)

## Test case
Kịch bản test tay: tests/kb/US38-sale-xin-chu-nha-cho.md, chưa viết. Viết trước khi item sang san-sang (CL14.5a).

## Task
- [ ] US38-TA1 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy và test database cho YC6.4-NT2, YC6.4-NT4, YC6.4-NT5
- [ ] US38-TA2 Code · Claude Code (sonnet, CL14.6a): màn A5, A6, A7, A7-00, A7-01 theo canvas, test unit, e2e cho YC6.4-NT1 đến NT3
- [ ] US38-TA3 Test tay · Đức: chạy tests/kb/US38-sale-xin-chu-nha-cho.md, chế độ nhanh rồi đủ.

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC6.4@1 (QD21)
- 2026-11-19 · Claude · thuc_hien lên bản mới theo QD22
- 2026-11-19 · Claude · YC8-H5 đã trả lời (nút Chia sẻ)

## Bằng chứng
