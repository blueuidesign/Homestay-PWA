---
id: US10-KB
us: US10
rev: 1
---
# Kịch bản test tay US10 · Chi tiết một ngày

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Chị Hoa có 1509 và 3402, booking B1 đến B9 (DLM.4); Sale Hùng kết nối với Chị Hoa; Anh Tuấn là chủ nhà khác. Trước khi có form ghi đặt phòng (YC5), booking nạp bằng dữ liệu mẫu trên staging.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US10-KB1 · Xem ai ở ngày 10/10 `[Chính]`
- **Mục đích:** sale gọi hỏi thì chủ nhà chạm một ngày là trả lời được.
- **Chuẩn bị:** đăng nhập Chị Hoa, tab Lịch, Tháng 10/2026, chip "Cả 2 phòng".
- **Làm:** chạm ô 10/10.
- **Mong đợi:** ô 10/10 viền đậm; ngay dưới lưới có "Ngày 10/10/2026"; dòng 1509 ghi "Sale Hùng", số điện thoại của Sale Hùng, "10/10 → 12/10 (2 đêm)", "2.200.000đ · Cọc: 1.000.000đ"; dòng 3402 ghi "Trống ✓" và nút "Đặt phòng".
- **Nguồn:** YC2.2-NT1, YC2.2-NT2
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US10-KB2 · Chip đang chọn giới hạn chi tiết ngày `[Biên]`
- **Mục đích:** chi tiết ngày khớp với căn đang lọc.
- **Chuẩn bị:** như KB1.
- **Làm:** chạm chip "3402", rồi chạm ô 10/10.
- **Mong đợi:** chỉ có dòng 3402 "Trống ✓", không có dòng 1509.
- **Nguồn:** YC2.2 bước 7
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US10-KB3 · Ngày đã qua `[Biên]`
- **Mục đích:** chủ nhà ghi bù được khách đã ở.
- **Chuẩn bị:** như KB1, chọn một ngày trước hôm nay.
- **Làm:** chạm ngày đó.
- **Mong đợi:** chi tiết ngày mở như ngày khác; căn trống vẫn có nút "Đặt phòng".
- **Nguồn:** YC2.2 (YC2-H6 đã trả lời)
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-19 | Claude | main | Bản đầu (QD25) | Cả file |
