---
id: QD7
tieu_de: Sale được thấy gì của chủ nhà
trang_thai: da-chot
loai: san-pham
nguoi_chot: tung
ngay_chot: 2026-11-18
thay_cho: []
nguon: Quyet_dinh.md của bản PWA (QD7)
anh_huong: []
rev: 1
---
# QD7 · Sale được thấy gì của chủ nhà

## Câu hỏi
chủ nhà chia sẻ lịch để sale bán được, nên sale cần thấy đủ để báo khách, nhưng không thấy việc riêng của chủ và của sale khác.

## Phương án
(không ghi)

## Quyết định
căn đã chia sẻ cho sale nào thì sale đó luôn thấy giá chủ nhà. Sale thấy mọi đêm đã kín của căn được chia sẻ là "đã đặt", không thấy ai đặt. Tình trạng cọc chỉ cho booking của chính sale, chỉ là đã cọc hay chưa, chỉ khi chủ bật quyền; không bao giờ thấy số tiền cọc. Sale thấy số điện thoại chủ đã kết nối. Chủ ngừng cho xem thì sale mất lịch và giá, vẫn xem booking cũ của mình. **Không có công tắc tắt giá**; quyền duy nhất chủ bật tắt cho từng sale là tình trạng cọc. Người chốt: Tùng (03/11 và 04/11/2026). Chi tiết: story YC1.14.

## Hệ quả
`my_shared_can_ids()`, `v_lich_sale`, `v_booking_cua_sale`, `ket_noi.quyen_tinh_trang_coc`, `fn_chu_ngung_sale`. Test: `t_02_gia.sql`, `t_05_yeu_cau_huy_khach.sql`.

Thay cho: không. Trạng thái gốc: Đang hiệu lực.

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Tách từ `docs/decisions/`, đổi mã QD7 thành QD7 | Cả file |
