---
id: US2
tieu_de: "Đăng ký và đăng nhập bằng mã email"
loai: US
trang_thai: moi
thuc_hien: [YC1.2@2]
truoc: [EN1, EN2, EN4]
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
Là người dùng (chủ nhà hoặc sale), tôi làm được việc "Đăng ký và đăng nhập" đúng như YC1.2 mô tả: nhận mã qua email, người mới nhập tên và số điện thoại xong mới vào app (QD22).

## Vì sao sửa
Canvas chưa có hình cho phần "Đăng ký và đăng nhập" (YC1.2, dòng "Màn:" ghi "chưa có"). Không vẽ trước thì task Code phải tự đặt bố cục và chữ, dễ lệch với các màn khác và với YC.

## Màn phải làm
| Màn | Loại | Đổi gì | Theo |
|---|---|---|---|
| <mã mới, Design đặt theo CL13> | thêm | Màn và trạng thái cho các bước của YC1.2, chữ đúng như bảng bước | YC1.2 |

## Làm tiêu chí nào
YC1.2-NT1 đến NT9

## Quy tắc, hành vi dùng
HV4, HV5, QT6.5

## Màn hình
chưa có

## Quyền
PQ1, PQ2, PQ6, PQ9, PQ11, PQ20, PQ23 và các test vi phạm ở mục "Ai được làm gì" của YC1-tai-khoan.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- Chỗ chưa quyết trong mục, chưa code tới khi Tùng trả lời: YC1-H12 (mã mấy số, hạn, gửi lại), YC1-H13 (số trùng tài khoản khác).
- Đăng nhập bằng mật khẩu: không làm ở môi trường nào (QD22).
- Phần đầu YC1-tai-khoan.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC1.2 HV4 HV5 QT6.5 PQ1 PQ2 PQ6 PQ9 PQ11 PQ20 PQ23
YC1-tai-khoan.md#Quy tắc của nhóm
YC1-tai-khoan.md#Ai được làm gì
YC1-tai-khoan.md#Dữ liệu
YC1-tai-khoan.md#Trạng thái màn (mọi mục)

## Test case
Kịch bản test tay: tests/kb/US2-dang-nhap.md, chưa viết. Viết trước khi item sang san-sang (CL14.5a).

## Task
- [ ] US2-TA1 Thiết kế · Design: làm theo CL13 bảng "Màn phải làm". Xong thì Design tự thêm task kiểm cho Claude Code (CL13.3)
- [ ] US2-TA2 Code · Claude Code (opus, CL14.6a): hàm tạo hồ sơ và lệnh đăng ký kèm test database (YC1.2-NT5, NT6), màn theo canvas, test unit, e2e cho YC1.2-NT1 đến NT9
- [ ] US2-TA3 Test tay · Đức: chạy tests/kb/US2-dang-nhap.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC1.2@1 (QD21)
- 2026-11-19 · Claude · thuc_hien lên YC1.2@2 theo QD22; nhận phần tạo hồ sơ từ EN3 (đã hủy)

## Bằng chứng
