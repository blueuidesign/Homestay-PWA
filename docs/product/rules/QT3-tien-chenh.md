---
id: QT3
tieu_de: Tiền chênh của sale
trang_thai: de-xuat
nguoi_chu: tung
rev: 1
---
# QT3 · Tiền chênh của sale

Chỉ sale đó thấy (PQ15.SALE).

## QT3.1 · Tính tiền chênh
Rủi ro: cao
Tiền chênh của một booking bằng tiền sale thu khách trừ tiền trả chủ nhà (giá chủ nhà). Chỉ tính booking đã chốt: booking thành từ yêu cầu đã chốt, booking chủ nhà ghi chọn sale làm người đặt (YC5.4, coi như booking của sale), và booking sale tự ghi cho căn tự nhập. Yêu cầu đang chờ, bị từ chối, hết hạn, đã hủy không tính.

| Mã | Booking | Thu khách | Trả chủ | Phải ra |
|---|---|---|---|---|
| QT3.1-VD1 | B1 (1509, 2 đêm) | 2.600.000đ | 2.200.000đ | 400.000đ |
| QT3.1-VD2 | V2 (Villa Tuần Châu, căn tự nhập, 1 đêm) | 1.600.000đ | 1.400.000đ | 200.000đ |
| QT3.1-VD3 | Chị Hoa ghi 1509 10/10 → 12/10 cho Sale Hùng, mức cộng +200k mỗi đêm (YC5.4-NT1) | 2.600.000đ | 2.200.000đ | 400.000đ |

## QT3.2 · Tiền chênh thuộc tháng nào
Rủi ro: tb
Tiền chênh chia theo đêm, như doanh thu (QD10, QT2.2). Mỗi đêm mang phần chênh của đêm đó: giá bán đêm đó trừ giá chủ đêm đó. Booking chỉ có tổng tiền, không có giá từng đêm (căn tự nhập), thì chia đều tiền chênh cho các đêm (giả định GD12).

| Mã | Booking | Phải ra |
|---|---|---|
| QT3.2-VD1 | B1: 10/10 → 12/10, mức cộng 200.000đ mỗi đêm | Tháng 10: 400.000đ |

Chưa có ví dụ booking của sale qua hai tháng trong dữ liệu mẫu.

Các ví dụ dùng số trong `docs/product/du-lieu-mau.md`.

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Tách từ docs/luat-chung/QT.md (QD21) | Cả file |
