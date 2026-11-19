---
id: QD8
tieu_de: Link mời của chủ nhà
trang_thai: da-chot
loai: san-pham
nguoi_chot: tung
ngay_chot: 2026-11-18
thay_cho: []
nguon: Quyet_dinh.md của bản PWA (QD8)
anh_huong: []
rev: 1
---
# QD8 · Link mời của chủ nhà

## Câu hỏi
chủ nhà muốn gửi một link qua Zalo cho nhiều sale, không phải duyệt từng người, mà không lộ giá cho người lạ.

## Phương án
(không ghi)

## Quyết định
ai có link cũng mở được, kể cả chưa đăng nhập. Màn Thêm lịch hiện tên chủ, các căn (mã, phòng ngủ, giường, view), không có giá. Sale phải tự bấm "Thêm lịch". Đã thêm rồi thì báo. Link hết hạn sau 21 ngày, chủ thu hồi được; sale đã thêm trước đó vẫn giữ kết nối. Chủ thêm căn mới thì sale được chia sẻ "tất cả căn" tự thấy. Người chốt: Tùng (28/10 và 03/11/2026). Chi tiết: story YC1.3.

## Hệ quả
`link_moi`, `fn_tao_link_moi`, `fn_xem_link_moi` (vai anon gọi được), `fn_them_lich_tu_link`, `fn_thu_hoi_link_moi`. Thu hồi ở màn nào, người mở link hỏng thấy gì: YC6-H10. Test: `t_06_link_moi.sql`.

Thay cho: không. Trạng thái gốc: Đang hiệu lực.

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Tách từ `docs/decisions/`, đổi mã QD8 thành QD8 | Cả file |
