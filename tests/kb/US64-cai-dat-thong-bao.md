---
id: US64-KB
us: US64
rev: 1
---
# Kịch bản test tay US64 · Cài đặt thông báo

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Chị Hoa (chủ nhà), Sale Hùng (đã kết nối với Chị Hoa).
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Luật viết kịch bản: CL14.5a.

### US64-KB1 · Chủ nhà xem công tắc `[Chính]`
- **Mục đích:** chủ nhà thấy đủ công tắc, mặc định bật.
- **Chuẩn bị:** đăng nhập Chị Hoa, tab Cá nhân.
- **Làm:** bấm "Cài đặt thông báo".
- **Mong đợi:** dòng ở Cá nhân ghi "3 loại đang bật"; màn có 3 công tắc "Sale đặt phòng mới", "Sale xin xem lịch", "Đặt phòng chưa cọc", đều bật, không có chữ "gửi qua Zalo".
- **Nguồn:** YC12.4-NT1
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US64-KB2 · Sale tắt một loại thông báo `[Chính]`
- **Mục đích:** tắt một loại thì không nhận loại đó, loại khác vẫn nhận.
- **Chuẩn bị:** Sale Hùng đã gửi một căn của Chị Hoa cho khách (ngày ở đã chọn).
- **Làm:** Hùng vào Cá nhân > "Cài đặt thông báo", tắt "Căn bạn đã gửi khách vừa có người đặt", bấm "Lưu thay đổi". Chị Hoa ghi một đặt phòng trùng các đêm đó. Hùng mở tab Cá nhân.
- **Mong đợi:** dòng ghi "3 loại đang bật" sau khi lưu; Hùng không có thông báo "vừa có người đặt"; các loại khác (ví dụ Chị Hoa đồng ý cho xem lịch) vẫn tới.
- **Nguồn:** YC12.4-NT2
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
