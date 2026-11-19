---
id: US49-KB
us: US49
rev: 1
---
# Kịch bản test tay US49 · Mẫu tin gửi khách

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Sale Hùng, Sale Lan. Khoảng ngày 10/10 → 12/10, 3 căn ICON40 1509, Sapphire 1103, À La Carte 2208.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US49-KB1 · Sửa mẫu tin và gửi theo mẫu `[Chính]`
- **Mục đích:** sale viết lời chào theo ý mình một lần, mọi tin gửi khách sau đó theo mẫu.
- **Làm:** Hùng vào Cá nhân, "Mẫu tin gửi khách". Đặt con trỏ cuối dòng đầu, chạm "[Tên sale]". Xem "KHÁCH SẼ NHẬN ĐƯỢC". Bấm "Lưu thay đổi". Tìm 10/10 → 12/10, tích 3 căn, "Gửi cho khách", bấm "Sao chép chữ cả 3 căn", dán vào ghi chú.
- **Mong đợi:** mẫu có thêm [Tên sale] đúng chỗ con trỏ; bản xem trước hiện tên Hùng, ngày "10/10 → 12/10", "2 đêm", 3 dòng căn giống chữ khối ở màn Gửi cho khách. Toast "Đã lưu mẫu tin". Chữ dán ra theo mẫu mới.
- **Nguồn:** YC8.2-NT1, YC8.2-NT3
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US49-KB2 · Dùng lại mẫu mặc định `[Chính]`
- **Làm:** ở Mẫu tin gửi khách bấm "Dùng lại mẫu mặc định", rồi Lưu.
- **Mong đợi:** ô mẫu về "Em gửi anh chị [Số căn] căn còn trống [Ngày] ([Số đêm]):", "[Danh sách căn]", "Anh chị ưng căn nào báo em giữ phòng nhé."
- **Nguồn:** YC8.2-NT2
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US49-KB3 · Mẫu không hợp lệ, mẫu của người khác `[Biên]`
- **Làm:** xóa "[Danh sách căn]" khỏi mẫu. Lần khác dán một đoạn rất dài (hơn 2.000 ký tự). Sau đó Lan sửa và lưu mẫu của Lan, Hùng mở lại mẫu của Hùng.
- **Mong đợi:** thiếu [Danh sách căn] thì nút Lưu mờ và ghi "Mẫu cần có [Danh sách căn]"; quá dài thì không lưu được. Mẫu của Hùng không đổi khi Lan lưu.
- **Nguồn:** YC8.2-NT4, YC8.2-NT5
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
