---
id: QD2
tieu_de: Booking sửa được qua hàm và ghi nhật ký, không theo sổ cái chỉ thêm
trang_thai: cho-chot
loai: san-pham
nguoi_chot: tung
ngay_chot:
thay_cho: []
nguon: Quyet_dinh.md của bản PWA (QD2)
anh_huong: []
rev: 1
---
# QD2 · Booking sửa được qua hàm và ghi nhật ký, không theo sổ cái chỉ thêm

## Câu hỏi
bộ khởi tạo gốc bắt mọi bảng có tiền phải "chỉ thêm, sai thì ghi bản đảo". Booking của Home247 lại có trạng thái và sửa được (YC4.3, YC4.9, QT1.2).

## Phương án
(A) mỗi lần sửa booking ghi một bản đảo và một bản mới; (B) sửa thẳng dòng booking qua hàm `fn_*`, mỗi lần sửa ghi `audit_log` bản cũ và bản mới.

## Quyết định
B. Người chốt: chưa. Lý do: ràng buộc chặn trùng chạy trên dòng hiện tại; với A, bản đảo và bản mới phải loại nhau khỏi phép chặn trùng, dễ sai.

## Hệ quả
`fn_chu_sua_booking` ghi `audit_log`. Tiền theo đêm ở `booking_dem` tính lại mỗi lần sửa. Thống kê đọc `booking_dem` của booking chưa hủy.

Thay cho: luật "sổ cái chỉ thêm" của bộ khởi tạo, chỉ riêng cho booking. Trạng thái gốc: Đề xuất, chờ Tùng chốt.

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Tách từ `docs/decisions/`, đổi mã QD2 thành QD2 | Cả file |
