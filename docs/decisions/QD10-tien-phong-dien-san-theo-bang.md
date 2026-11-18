---
id: QD10
tieu_de: Tiền phòng điền sẵn theo bảng giá, chia theo đêm, đêm thuộc tháng của chính nó
trang_thai: da-chot
loai: san-pham
nguoi_chot: tung
ngay_chot: 2026-11-18
thay_cho: []
nguon: Quyet_dinh.md của bản PWA (QD10)
anh_huong: []
rev: 1
---
# QD10 · Tiền phòng điền sẵn theo bảng giá, chia theo đêm, đêm thuộc tháng của chính nó

## Câu hỏi
thống kê theo tháng cần biết tiền của từng đêm, trong khi chủ nhà hay gõ một tổng tiền khác bảng giá.

## Phương án
(không ghi)

## Quyết định
tiền phòng điền sẵn bằng tổng giá chủ nhà các đêm; chủ sửa được; bắt buộc có. Giữ đúng tổng bảng giá thì mỗi đêm giữ giá của nó; khác thì chia đều, lẻ dồn đêm cuối. Doanh thu, đêm có khách, tiền chênh chia theo tháng của từng đêm. Đêm cuối tuần mặc định là đêm T6, T7, chủ đổi được. Người chốt: Tùng (02/11 và 03/11/2026). Chi tiết: story QT2, QT4.

## Hệ quả
`booking_dem`, `ghi_booking_dem`, `tien_phong_goi_y`, `gia_dem`, `profiles.dem_cuoi_tuan`. Giá ngày lễ, dịp đặc biệt (YC3.5) chưa làm. Số booking đếm theo tháng nào: YC11-H6. Test: `t_02_gia.sql`, `t_04_tien_phong.sql`.

Thay cho: không. Trạng thái gốc: Đang hiệu lực.

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Tách từ `docs/decisions/`, đổi mã QD10 thành QD10 | Cả file |
