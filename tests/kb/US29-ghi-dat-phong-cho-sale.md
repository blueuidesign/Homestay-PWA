---
id: US29-KB
us: US29
rev: 1
---
# Kịch bản test tay US29 · Ghi đặt phòng cho sale

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md (DLM.3): Chị Hoa chia sẻ mọi căn cho Sale Hùng, chỉ 1509 cho Sale Lan. Hùng có mức cộng 1509 +200.000đ. Sale Nga chưa kết nối Chị Hoa.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US29-KB1 · Chủ nhà ghi đặt phòng cho sale `[Chính]`
- **Mục đích:** sale gọi điện báo khách, chủ nhà ghi giúp mà sale vẫn có giá bán và tiền chênh của mình.
- **Làm:** đăng nhập Chị Hoa, thêm đặt phòng 1509 từ 20/10 tới 22/10, tiền phòng 1.800.000đ, chọn chip "Sale Hùng", bấm "Thêm đặt phòng". Đăng nhập Sale Hùng, mở Thông báo rồi Thống kê.
- **Mong đợi:** toast "Đã thêm đặt phòng Sale Hùng · 1509". Hùng có thông báo chủ ghi đặt phòng cho mình kèm 1509 và 20/10 → 22/10. Thống kê tháng 10 của Hùng có thêm 2.200.000đ doanh số, chênh 400.000đ.
- **Nguồn:** YC5.4-NT1, YC5.4-NT2
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US29-KB2 · Khách lẻ và sale không được ghi `[Biên]`
- **Làm:** Chị Hoa ghi một đặt phòng chọn "Khách lẻ". Rồi ngừng chia sẻ cho Hùng và thử ghi đặt phòng cho Hùng. Đổi Lan sang chỉ được xem 3402, rồi ghi 1509 cho Lan.
- **Mong đợi:** khách lẻ: không sale nào có thông báo, thống kê sale không đổi. Ghi cho Hùng: ở lại form, toast đỏ "Sale này không đang kết nối với bạn". Ghi 1509 cho Lan: toast đỏ "Sale này không được xem căn này".
- **Nguồn:** YC5.4-NT4, YC5.4-NT5
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US29-KB3 · Sale không thấy khách của chủ `[Biên]`
- **Làm:** Sale Lan bật "làm tròn 50 nghìn", mức cộng mặc định 120.000đ. Chị Hoa ghi 1509 hai đêm thường cho Lan. Lan mở chi tiết đặt phòng.
- **Mong đợi:** giá bán điền sẵn 2.100.000đ (mỗi đêm 1.020.000đ làm tròn lên 1.050.000đ). Không có tên, số khách nào của Chị Hoa.
- **Nguồn:** YC5.4-NT1, YC5.4-NT3
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
