---
id: QD5
tieu_de: Vai tính theo quan hệ người với căn, không theo tài khoản
trang_thai: da-chot
loai: san-pham
nguoi_chot: tung
ngay_chot: 2026-11-18
thay_cho: []
nguon: Quyet_dinh.md của bản PWA (QD5)
anh_huong: []
rev: 1
---
# QD5 · Vai tính theo quan hệ người với căn, không theo tài khoản

## Câu hỏi
một người có thể vừa có căn vừa bán căn người khác (đại lý). Bộ khởi tạo gốc dùng "tổ chức → đơn vị → nhân viên", không hợp với mạng lưới nhiều chủ nhà và nhiều sale. Người chốt: Tùng (03/11/2026).

## Phương án
(không ghi)

## Quyết định
không có bảng vai. Một người là chủ của căn mình giữ, là sale của căn người khác chia sẻ cho mình. Sale có căn riêng thì có mọi quyền của chủ với căn đó. Chủ nhà không bán căn của chủ khác. `profiles.vai_chon` chỉ để chọn màn mở đầu.

## Hệ quả
bỏ `orgs`, `units`, `memberships` của bộ gốc; thay bằng `can.nguoi_giu`, `ket_noi`, `ket_noi_can` và các hàm `my_own_can_ids`, `my_shared_can_ids`, `my_visible_can_ids`. Đội nhóm sale (YC8) chưa làm.

Thay cho: không. Trạng thái gốc: Đang hiệu lực.

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Tách từ `docs/decisions/`, đổi mã QD5 thành QD5 | Cả file |
