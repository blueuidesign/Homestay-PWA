---
id: US5-KB
us: US5
rev: 1
---
# Kịch bản test tay US5 · Giờ nhận, trả phòng mặc định

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Chị Hoa (có đặt phòng), Sale Hùng (đã kết nối).
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Luật viết kịch bản: CL14.5a.

### US5-KB1 · Đổi giờ nhận, trả `[Chính]`
- **Mục đích:** chủ nhà đổi giờ chung, sale thấy giờ mới khi xem căn.
- **Chuẩn bị:** đăng nhập Chị Hoa, tab Cá nhân.
- **Làm:** bấm "Giờ nhận, trả phòng mặc định", chọn nhận 15:00, trả 11:00, bấm "Lưu thay đổi". Đăng nhập Sale Hùng, mở một căn của Chị Hoa.
- **Mong đợi:** Chị Hoa về Cá nhân, dòng ghi "15:00 · 11:00". Màn căn của Sale Hùng ghi "Nhận phòng 15:00 · Trả phòng 11:00".
- **Nguồn:** YC1.5-NT1
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US5-KB2 · Đặt phòng cũ giữ giờ `[Biên]`
- **Mục đích:** đổi giờ không làm đổi đặt phòng đã ghi.
- **Chuẩn bị:** Chị Hoa có đặt phòng ghi giờ 14:00 và 12:00 (xem chi tiết đặt phòng).
- **Làm:** làm KB1 rồi mở lại chi tiết đặt phòng đó.
- **Mong đợi:** đặt phòng vẫn ghi 14:00 và 12:00.
- **Nguồn:** YC1.5-NT2
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
