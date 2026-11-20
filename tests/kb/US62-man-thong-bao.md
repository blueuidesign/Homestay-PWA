---
id: US62-KB
us: US62
rev: 1
---
# Kịch bản test tay US62 · Màn Thông báo

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Chị Hoa (chủ nhà), Sale Hùng (đã kết nối với Chị Hoa, có B1 ở căn 1509).
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Luật viết kịch bản: CL14.5a.

### US62-KB1 · Xem danh sách thông báo `[Chính]`
- **Mục đích:** thấy đủ thông báo, phân biệt chưa đọc và đã đọc.
- **Chuẩn bị:** Chị Hoa sửa B1 (đổi ngày), và từ chối một yêu cầu đặt phòng của Hùng. Hùng chưa mở thông báo nào.
- **Làm:** Hùng vào Cá nhân > "Thông báo".
- **Mong đợi:** "2 chưa đọc"; nhóm "Hôm nay" có 2 dòng nền xanh nhạt, chấm xanh, chữ đậm, giờ dạng "10:15"; thông báo cũ hơn nằm ở nhóm "Trước đó", nền trắng; mới nhất ở trên.
- **Nguồn:** YC12.2-NT1
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US62-KB2 · Chạm một dòng mở đúng màn `[Chính]`
- **Mục đích:** chạm thông báo là tới đúng việc.
- **Chuẩn bị:** như KB1.
- **Làm:** Hùng chạm dòng "Yêu cầu đặt phòng bị từ chối". Rồi quay lại và chạm dòng "Chị Hoa đã sửa đặt phòng của bạn".
- **Mong đợi:** dòng đầu mở màn kết quả của đúng yêu cầu đó; dòng sau mở chi tiết đặt phòng phía sale. Quay lại về màn Thông báo, hai dòng đã thành nền trắng và nhãn "0 chưa đọc".
- **Nguồn:** YC12.2-NT2
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US62-KB3 · Đánh dấu đã đọc tất cả `[Chính]`
- **Mục đích:** gom việc xóa chấm xanh bằng một nút.
- **Chuẩn bị:** Hùng có từ 2 thông báo chưa đọc.
- **Làm:** bấm "Đánh dấu đã đọc".
- **Mong đợi:** mọi dòng nền trắng, "0 chưa đọc", nút mờ đi. Thoát ra vào lại vẫn "0 chưa đọc"; dòng "Thông báo" ở Cá nhân không còn số.
- **Nguồn:** YC12.2-NT3
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US62-KB4 · Chủ nhà đã ngừng cho xem `[Biên]`
- **Mục đích:** chạm thông báo ngừng chia sẻ không lộ lịch cũ.
- **Chuẩn bị:** Anh Tuấn ngừng cho Hùng xem lịch.
- **Làm:** Hùng chạm "Anh Tuấn đã ngừng cho bạn xem lịch".
- **Mong đợi:** mở danh sách đặt phòng và yêu cầu (S7-03); không thấy lịch hay giá của Anh Tuấn.
- **Nguồn:** YC12.2-NT4
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US62-KB5 · Chưa có thông báo `[Biên]`
- **Mục đích:** hộp thư trống không bị lỗi.
- **Chuẩn bị:** tài khoản mới chưa có thông báo nào.
- **Làm:** vào Cá nhân > "Thông báo".
- **Mong đợi:** "Chưa có thông báo nào" và dòng gợi ý "Khi chủ nhà đồng ý cho xem lịch hay có yêu cầu đặt phòng, thông báo hiện ở đây."
- **Nguồn:** YC12.2-NT6
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US62-KB6 · Chủ nhà chạm yêu cầu mới `[Biên]`
- **Mục đích:** chủ nhà mở được yêu cầu từ thông báo và quay về đúng chỗ.
- **Chuẩn bị:** Sale Hùng gửi yêu cầu đặt phòng cho Chị Hoa.
- **Làm:** Chị Hoa vào Cá nhân > "Thông báo", chạm "Sale Hùng đặt phòng 1509", rồi bấm quay lại.
- **Mong đợi:** mở màn trả lời yêu cầu; quay lại về màn Thông báo; giá chỉ có giá của chủ nhà.
- **Nguồn:** YC12.2-NT2, PQ19
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
