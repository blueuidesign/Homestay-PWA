---
id: QD13
tieu_de: Xóa tài khoản giữ dữ liệu, chỉ xóa số điện thoại
trang_thai: da-chot
loai: san-pham
nguoi_chot: tung
ngay_chot: 2026-11-18
thay_cho: []
nguon: Quyet_dinh.md của bản PWA (QD13)
anh_huong: []
rev: 1
---
# QD13 · Xóa tài khoản giữ dữ liệu, chỉ xóa số điện thoại

## Câu hỏi
người dùng thôi dùng app thì số điện thoại của họ không được hiện cho ai nữa, nhưng người đã giao dịch với họ vẫn cần xem lại đặt phòng cũ.

## Phương án
(A) xóa sạch mọi dữ liệu; (B) xóa số điện thoại, giữ tên để hiện kèm "Đã xoá tài khoản", giữ căn, lịch, giá, booking.

## Quyết định
B. Người chốt: Tùng (04/11/2026). Chi tiết: story US22, mục YC9.8. Cách người dùng bấm xóa trên PWA: YC1-H6.

## Hệ quả
`profiles.da_xoa_luc`, `fn_xoa_tai_khoan`; `my_shared_can_ids()` bỏ căn của chủ đã xóa; sale không gửi được yêu cầu; booking cũ vẫn xem được; đặt lại số điện thoại thì dùng lại như trước. Test: `t_02_gia.sql`.

Thay cho: không. Trạng thái gốc: Đang hiệu lực (chờ YC1-H6 cho phần giao diện).

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Tách từ `docs/decisions/`, đổi mã QD13 thành QD13 | Cả file |
