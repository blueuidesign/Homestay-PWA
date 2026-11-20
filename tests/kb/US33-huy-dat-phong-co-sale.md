---
id: US33-KB
us: US33
rev: 1
---
# Kịch bản test tay US33 · Hủy đặt phòng có sale

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md (DLM.4): B1 1509 10/10 → 12/10 của Sale Hùng ở căn Chị Hoa; B5 khách lẻ. Cần hai máy (hoặc hai trình duyệt) đăng nhập Chị Hoa và Hùng.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US33-KB1 · Sale xin hủy, chủ đồng ý `[Chính]`
- **Mục đích:** hai bên cùng hủy được một đặt phòng có sale, không bên nào tự bỏ.
- **Làm:** Hùng mở B1 (Thống kê, "Xem tất cả đặt phòng và yêu cầu"), bấm "Xin hủy", xác nhận. Chị Hoa mở B1 ở lịch, bấm "Đồng ý hủy". Chị Hoa thử ghi đặt phòng mới 1509 10/10 → 12/10.
- **Mong đợi:** hộp hỏi "Xin hủy đặt phòng 1509 · 10/10 → 12/10? Chị Hoa phải đồng ý thì mới hủy.". Sau khi xin: Hùng thấy "Chờ đồng ý hủy", không có nút trả lời; lịch 1509 vẫn kín. Chị Hoa thấy "Sale Hùng xin hủy đặt phòng này" và hai nút. Đồng ý xong: hai bên thấy "Đã hủy", đặt phòng vẫn còn trong danh sách, ghi được đặt phòng mới vào hai đêm đó, thống kê không còn tính B1.
- **Nguồn:** YC5.8-NT1, YC5.8-NT2
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US33-KB2 · Chủ xin hủy, sale không đồng ý `[Chính]`
- **Làm:** Chị Hoa mở một đặt phòng khác của Hùng, bấm "Xin hủy", xác nhận. Hùng mở đặt phòng đó, bấm "Không đồng ý".
- **Mong đợi:** hai bên thấy "Bị từ chối hủy", đặt phòng như cũ, không còn nút "Xin hủy" ở cả hai bên.
- **Nguồn:** YC5.8-NT3, YC5.8-NT4
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US33-KB3 · Khách lẻ và người ngoài `[Biên]`
- **Làm:** Chị Hoa mở B5. Đăng nhập Sale Lan, xem danh sách đặt phòng của mình.
- **Mong đợi:** B5 không có nút "Xin hủy", chỉ có "Xóa đặt phòng". Lan không thấy B1 của Hùng ở đâu cả.
- **Nguồn:** YC5.8-NT5, YC5.8-NT6
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
