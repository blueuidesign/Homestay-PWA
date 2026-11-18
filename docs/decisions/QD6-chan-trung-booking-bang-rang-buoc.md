---
id: QD6
tieu_de: Chặn trùng booking bằng ràng buộc database
trang_thai: da-chot
loai: san-pham
nguoi_chot: tung
ngay_chot: 2026-11-18
thay_cho: []
nguon: Quyet_dinh.md của bản PWA (QD6)
anh_huong: []
rev: 1
---
# QD6 · Chặn trùng booking bằng ràng buộc database

## Câu hỏi
hai người ghi cùng lúc mà chỉ kiểm ở giao diện hay ở hàm thì cả hai đều lọt. Người chốt hướng: Tùng (02/11/2026).

## Phương án
(không ghi)

## Quyết định
ràng buộc `exclude using gist (can_id with =, dem with &&) where (trang_thai <> 'da_huy')` trên `booking`. Yêu cầu đang chờ không chiếm đêm. Sale gửi yêu cầu vào đêm đã kín thì không tạo. Chủ chấp nhận một yêu cầu hay tự ghi booking thì yêu cầu đang chờ trùng đêm thành bị từ chối.

## Hệ quả
extension `btree_gist`. Test: `t_03_chan_trung.sql` có đủ ví dụ QT1.1 đến QT1.4.

Thay cho: không. Trạng thái gốc: Đang hiệu lực.

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Tách từ `docs/decisions/`, đổi mã QD6 thành QD6 | Cả file |
