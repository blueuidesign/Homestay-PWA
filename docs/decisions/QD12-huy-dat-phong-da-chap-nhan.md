---
id: QD12
tieu_de: Hủy đặt phòng đã chấp nhận cần bên kia đồng ý
trang_thai: da-chot
loai: san-pham
nguoi_chot: tung
ngay_chot: 2026-11-18
thay_cho: []
nguon: Quyet_dinh.md của bản PWA (QD12)
anh_huong: []
rev: 1
---
# QD12 · Hủy đặt phòng đã chấp nhận cần bên kia đồng ý

## Câu hỏi
khách của sale đổi ý thì đặt phòng đã nhận cần có đường ra khỏi lịch, mà một bên không tự bỏ được phần của bên kia.

## Phương án
(không ghi)

## Quyết định
chủ nhà hoặc sale của booking xin hủy. Bên kia đồng ý thì "Đã hủy", vẫn hiện cho cả hai, các đêm trống lại và bán được. Bên kia từ chối thì giữ nguyên, ghi "Bị từ chối hủy", không xin lại được. Booking khách lẻ chủ tự ghi thì chủ xóa thẳng. Booking có sale thì chủ không xóa được. Người chốt: Tùng (03/11/2026). Chi tiết: story YC4.4, YC4.9.

## Hệ quả
`booking.trang_thai`, `fn_xin_huy`, `fn_tra_loi_huy`, `fn_chu_xoa_booking`. Test: `t_05_yeu_cau_huy_khach.sql`. Thời hạn xin hủy: YC5-H18.

Thay cho: không. Trạng thái gốc: Đang hiệu lực.

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Tách từ `docs/decisions/`, đổi mã QD12 thành QD12 | Cả file |
