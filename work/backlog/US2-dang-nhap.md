---
id: US2
tieu_de: "Đăng ký và đăng nhập bằng mã email"
loai: US
trang_thai: dang-lam
thuc_hien: [YC1.2@3]
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
Canvas bản PWA đã có A2, A2-01 đến A2-04, A11, A11-01, A11-02 (PR #10). Màn nhập lại số sau khi xóa tài khoản chưa vẽ: dùng khối số của A2.

## Màn phải làm
| Màn | Loại | Đổi gì | Theo |
|---|---|---|---|
| A2, A2-01 đến A2-04, A11, A11-01, A11-02 | đã vẽ | Không | YC1.2 |

## Làm tiêu chí nào
YC1.2-NT1 đến NT8, NT10 đến NT13. NT9 bỏ vì trùng YC6.3-NT1, kiểm ở US37 (YC1 r4, QD25).

## Quy tắc, hành vi dùng
HV4, HV5, QT6.5

## Màn hình
A2, A2-01, A2-02, A2-03, A2-04, A11, A11-01, A11-02

## Quyền
PQ1, PQ2, PQ6, PQ9, PQ11, PQ20, PQ23 và các test vi phạm ở mục "Ai được làm gì" của YC1-tai-khoan.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- Đăng nhập bằng mật khẩu: không làm ở môi trường nào (QD22).
- Phần đầu YC1-tai-khoan.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC1.2 HV4 HV5 QT6.5 PQ1 PQ2 PQ6 PQ9 PQ11 PQ20 PQ23
YC1-tai-khoan.md#Quy tắc của nhóm
YC1-tai-khoan.md#Ai được làm gì
YC1-tai-khoan.md#Dữ liệu
YC1-tai-khoan.md#Trạng thái màn (mọi mục)

## Test case
Kịch bản test tay: tests/kb/US2-dang-nhap.md (KB1 đến KB6).

## Task
- [x] US2-TA1 Thiết kế · Design: canvas bản PWA, PR #10
- [ ] US2-TA2 Code · Claude Code (opus, CL14.6a): hàm tạo hồ sơ và lệnh đăng ký kèm test database (YC1.2-NT5, NT6, NT10), màn theo canvas, test unit, e2e cho YC1.2-NT1 đến NT8, NT10 đến NT13. NT9 bỏ vì trùng YC6.3-NT1, kiểm ở US37 (YC1 r4, QD25).
- [ ] US2-TA3 Test tay · Đức: chạy tests/kb/US2-dang-nhap.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC1.2@1 (QD21)
- 2026-11-19 · Claude · thuc_hien lên YC1.2@2 theo QD22; nhận phần tạo hồ sơ từ EN3 (đã hủy)
- 2026-11-19 · Claude · thuc_hien lên bản 3 theo canvas PWA (PR #10)

- 2026-11-19 · Claude · viết tests/kb/US2-dang-nhap.md, bỏ YC1.2-NT9 (trùng YC6.3-NT1), sang dang-lam

## Bằng chứng
