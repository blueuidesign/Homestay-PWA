---
id: US12-KB
us: US12
rev: 1
---
# Kịch bản test tay US12 · Đặt phòng sắp tới

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md (DLM.5): Chị Hoa có B1 đến B9. Hôm nay giả định 07/10/2026; thử trên máy thật thì dùng ngày thật và đặt phòng tạo quanh ngày đó.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US12-KB1 · Xem đặt phòng sắp tới `[Chính]`
- **Mục đích:** chủ nhà biết sắp có khách nào mà không phải lật từng ngày.
- **Chuẩn bị:** đăng nhập Chị Hoa, tab Lịch, Tháng 10/2026.
- **Làm:** kéo xuống dưới lịch.
- **Mong đợi:** danh sách "Đặt phòng sắp tới" theo thứ tự B1, B5, B6, B2, B7, B8; mỗi dòng có người đặt, "Phòng … · ngày nhận → ngày trả (số đêm)", tiền phòng, trạng thái tiền; B5, B2 ghi "Chưa cọc"; không có B3, B4, B9.
- **Nguồn:** YC2.4-NT1, YC2.4-NT2, YC2.4-NT3
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US12-KB2 · Chạm một dòng `[Chính]`
- **Làm:** chạm dòng B1.
- **Mong đợi:** mở chi tiết đặt phòng "Đặt phòng · Sale Hùng".
- **Nguồn:** YC2.4 bước 15
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US12-KB3 · Chưa có đặt phòng sắp tới `[Biên]`
- **Chuẩn bị:** tài khoản chủ nhà mới có căn nhưng chưa có đặt phòng.
- **Làm:** mở tab Lịch, kéo xuống.
- **Mong đợi:** "Chưa có đặt phòng sắp tới. Bấm "+ Đặt phòng" để ghi khách đầu tiên."
- **Nguồn:** YC2.4 bước 16
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US12-KB4 · Đặt phòng đã hủy không hiện `[Biên]`
- **Làm:** xóa một đặt phòng khách lẻ sắp tới (hay hủy khi đã có chức năng hủy), xem lại danh sách.
- **Mong đợi:** đặt phòng đó không còn trong danh sách.
- **Nguồn:** YC2.4 (YC2-H3)
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
