---
id: US39
tieu_de: "Chủ nhà duyệt lời xin xem lịch"
loai: US
trang_thai: moi
thuc_hien: [YC6.5@1]
truoc: [EN1, EN2, EN3, EN4]
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
Là chủ nhà, tôi làm được việc "Chủ nhà duyệt lời xin xem lịch" đúng như YC6.5 mô tả.

## Làm tiêu chí nào
YC6.5-NT1 đến NT5

## Quy tắc, hành vi dùng
HV5

## Màn hình
A8, A8-P1, A8-01

## Quyền
PQ1, PQ2, PQ4, PQ17, PQ18, PQ23 và các test vi phạm ở mục "Ai được làm gì" của YC6-ket-noi-sale.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- Chỗ chưa quyết trong mục, chưa code tới khi Tùng trả lời: YC6-H12.
- Phần đầu YC6-ket-noi-sale.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC6.5 HV5 PQ1 PQ2 PQ4 PQ17 PQ18 PQ23 A8 A8-P1 A8-01
YC6-ket-noi-sale.md#Quy tắc của nhóm
YC6-ket-noi-sale.md#Ai được làm gì
YC6-ket-noi-sale.md#Dữ liệu
YC6-ket-noi-sale.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US39-chu-nha-duyet-loi-xin.md, chưa viết. Viết trước khi item sang san-sang (CL14.5a).

## Task
- [ ] US39-TA1 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC6.5-NT1 đến NT5, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5)
- [ ] US39-TA2 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng
- [ ] US39-TA3 Code · Claude Code (sonnet, CL14.6a): màn A8, A8-P1, A8-01 theo canvas, test unit, e2e cho YC6.5-NT1
- [ ] US39-TA4 Test tay · Đức: chạy tests/kb/US39-chu-nha-duyet-loi-xin.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC6.5@1 (QD21)

## Bằng chứng
