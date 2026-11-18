---
id: US11
tieu_de: "Doanh thu tháng"
loai: US
trang_thai: moi
thuc_hien: [YC2.3@1]
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
Là chủ nhà, tôi làm được việc "Doanh thu tháng" đúng như YC2.3 mô tả.

## Làm tiêu chí nào
YC2.3-NT1, YC2.3-NT2

## Quy tắc, hành vi dùng
QT2, QT6.1

## Màn hình
CN1, CN1-02

## Quyền
PQ4, PQ7, PQ8, PQ9, PQ16 và các test vi phạm ở mục "Ai được làm gì" của YC2-lich-chu-nha.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- Chỗ chưa quyết trong mục, chưa code tới khi Tùng trả lời: YC2-H1.
- Phần đầu YC2-lich-chu-nha.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC2.3 QT2 QT6.1 PQ4 PQ7 PQ8 PQ9 PQ16 CN1 CN1-02
YC2-lich-chu-nha.md#Quy tắc của nhóm
YC2-lich-chu-nha.md#Ai được làm gì
YC2-lich-chu-nha.md#Dữ liệu
YC2-lich-chu-nha.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US11-doanh-thu-thang.md, chưa viết. Viết trước khi item sang san-sang (CL14.5a).

## Task
- [ ] US11-TA1 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC2.3-NT1, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5)
- [ ] US11-TA2 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng
- [ ] US11-TA3 Code · Claude Code (sonnet, CL14.6a): màn CN1, CN1-02 theo canvas, test unit, e2e cho YC2.3-NT1, YC2.3-NT2
- [ ] US11-TA4 Test tay · Đức: chạy tests/kb/US11-doanh-thu-thang.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC2.3@1 (QD21)

## Bằng chứng
