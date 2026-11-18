---
id: QD9
tieu_de: Căn tự nhập của sale
trang_thai: da-chot
loai: san-pham
nguoi_chot: tung
ngay_chot: 2026-11-18
thay_cho: []
nguon: Quyet_dinh.md của bản PWA (QD9)
anh_huong: []
rev: 1
---
# QD9 · Căn tự nhập của sale

## Câu hỏi
nhiều chủ nhà chưa dùng app; sale vẫn cần lưu căn của họ để gửi khách và tính doanh số.

## Phương án
(không ghi)

## Quyết định
sale thêm căn của chủ chưa dùng app. Căn không có lịch trống: ô ngày hiện "?". Tên, số chủ căn chỉ sale đó thấy, không chia cho ai, không xuất file, sale xóa được. Sale ghi booking đã chốt cho căn đó; chỉ chặn trùng trong chính căn đó. Người chốt: Tùng (02/11/2026). Chi tiết: story YC6, QT1.3.

## Hệ quả
`can.loai = 'tu_nhap'`, `fn_sale_ghi_tu_nhap`. Căn tự nhập không bao giờ vào `my_shared_can_ids()`. Test: `t_01_phan_quyen.sql`, `t_03_chan_trung.sql`.

Thay cho: không. Trạng thái gốc: Đang hiệu lực.

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Tách từ `docs/decisions/`, đổi mã QD9 thành QD9 | Cả file |
