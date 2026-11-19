---
id: QD11
tieu_de: Mỗi người chỉ thấy khách và tiền thu khách do mình nhập
trang_thai: da-chot
loai: san-pham
nguoi_chot: tung
ngay_chot: 2026-11-18
thay_cho: []
nguon: Quyet_dinh.md của bản PWA (QD11)
anh_huong: []
rev: 1
---
# QD11 · Mỗi người chỉ thấy khách và tiền thu khách do mình nhập

## Câu hỏi
chủ nhà và sale đều cần ghi khách của mình, nhưng khách và phần chênh của sale là việc làm ăn riêng của sale.

## Phương án
(không ghi)

## Quyết định
chủ nhà và sale được lưu tên, số điện thoại khách của mình; người nhập tự xin phép khách. Sale không bao giờ thấy khách của chủ; chủ không thấy khách của sale, không thấy sale thu khách bao nhiêu. Người chốt: Tùng (02/11/2026).

## Hệ quả
tách bảng `booking_rieng`, `yeu_cau_rieng`, mỗi dòng thuộc một người, RLS chỉ người đó đọc. Không để khách hay tiền thu khách trên bảng `booking`. Chính sách quyền riêng tư ghi rõ điều này. Test: `t_05_yeu_cau_huy_khach.sql`.

Thay cho: không. Trạng thái gốc: Đang hiệu lực.

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Tách từ `docs/decisions/`, đổi mã QD11 thành QD11 | Cả file |
