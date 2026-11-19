---
id: US30
tieu_de: "Chi tiết đặt phòng và thu tiền"
loai: US
trang_thai: dang-lam
thuc_hien: [YC5.5@2]
truoc: [EN1, EN2, EN4, US2]
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
Là chủ nhà, tôi làm được việc "Chi tiết đặt phòng và thu tiền" đúng như YC5.5 mô tả.

## Làm tiêu chí nào
YC5.5-NT1 đến NT6

## Quy tắc, hành vi dùng
QT1, QT2, QT3.1, QT4, QT5.6, QT6.1, QT6.2

## Màn hình
CN3-02, CN3-02-01

## Quyền
PQ4, PQ7, PQ8, PQ9, PQ11, PQ17 và các test vi phạm ở mục "Ai được làm gì" của YC5-dat-phong.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- Phần đầu YC5-dat-phong.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC5.5 QT1 QT2 QT3.1 QT4 QT5.6 QT6.1 QT6.2 PQ4 PQ7 PQ8 PQ9 PQ11 PQ17 CN3-02 CN3-02-01
YC5-dat-phong.md#Quy tắc của nhóm
YC5-dat-phong.md#Ai được làm gì
YC5-dat-phong.md#Dữ liệu
YC5-dat-phong.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US30-chi-tiet-dat-phong-va.md.

## Task
- [ ] US30-TA1 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC5.5-NT2 đến NT5, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5)
- [ ] US30-TA2 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng
- [ ] US30-TA3 Code · Claude Code (sonnet, CL14.6a): màn CN3-02, CN3-02-01 theo canvas, test unit, e2e cho YC5.5-NT1, YC5.5-NT2, YC5.5-NT4
- [ ] US30-TA4 Test tay · Đức: chạy tests/kb/US30-chi-tiet-dat-phong-va.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch
- TA1: tests/db/45_us30_chi_tiet_dat_phong.sql: hàm đọc chi tiết fn_chi_tiet_dat_phong, lệnh fn_da_thu_du, fn_hoan_tac_thu_du (NT2, NT3, NT4 không còn số, NT5, vi phạm quyền sale khác, chủ khác, khách chưa đăng nhập).
- TA2: migration 20261119240000: cột booking.trang_thai_tien_truoc; ba hàm security definer, tự kiểm người gọi giữ căn (PQ7.CHU, PQ8.SALE); hàm đọc không trả khách do sale nhập (QD11), số sale chỉ khi đang kết nối và chưa xóa tài khoản (QD13). Phép thử làm hỏng vào scripts/thu-lam-hong.txt.
- TA3: màn CN3-02, CN3-02-01 (src/man/CN302ChiTietDatPhong.tsx), đường dẫn /dat-phong/<id>, ManChu mở từ CN3; tính tiền còn lại ở src/lib/datPhong.ts; test unit, e2e mở từ CN3, thu đủ, hoàn tác.

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC5.5@1 (QD21)

## Bằng chứng
