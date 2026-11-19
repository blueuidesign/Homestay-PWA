---
id: US18
tieu_de: "Sửa căn"
loai: US
trang_thai: moi
thuc_hien: [YC3.5@1]
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
Là chủ nhà, tôi làm được việc "Sửa căn" đúng như YC3.5 mô tả.

## Làm tiêu chí nào
YC3.5-NT1 đến NT5

## Quy tắc, hành vi dùng
QT5.5, QT5.7, QT6.3

## Màn hình
CN5-02

## Quyền
PQ1, PQ3, PQ13 và các test vi phạm ở mục "Ai được làm gì" của YC3-can.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- Chỗ chưa quyết trong mục, chưa code tới khi Tùng trả lời: YC3-H4.
- Phần đầu YC3-can.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC3.5 QT5.5 QT5.7 QT6.3 PQ1 PQ3 PQ13 CN5-02
YC3-can.md#Quy tắc của nhóm
YC3-can.md#Ai được làm gì
YC3-can.md#Dữ liệu
YC3-can.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US18-sua-can.md, chưa viết. Viết trước khi item sang san-sang (CL14.5a).

## Task
- [ ] US18-TA1 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC3.5-NT2 đến NT5, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5)
- [ ] US18-TA2 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng
- [ ] US18-TA3 Code · Claude Code (sonnet, CL14.6a): màn CN5-02 theo canvas, test unit, e2e cho YC3.5-NT1, YC3.5-NT2, YC3.5-NT4
- [ ] US18-TA4 Test tay · Đức: chạy tests/kb/US18-sua-can.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC3.5@1 (QD21)

## Bằng chứng
