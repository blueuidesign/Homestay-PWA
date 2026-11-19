---
id: US50-KB
us: US50
rev: 1
---
# Kịch bản test tay US50 · Sale gửi và hủy yêu cầu

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Sale Hùng (mức cộng +400.000đ), Sale Lan, Chị Hoa (ICON40 1509), Anh Tuấn (À La Carte 2208). Khoảng ngày 10/10 → 12/10.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US50-KB1 · Gửi yêu cầu đặt phòng `[Chính]`
- **Mục đích:** sale chốt đêm với chủ nhà ngay trong app, không phải gọi.
- **Làm:** Hùng mở chi tiết 1509 cho 10/10 → 12/10, bấm "Gửi yêu cầu đặt phòng". Gõ lời nhắn "Khách gia đình 2 người lớn 1 bé", bấm gửi.
- **Mong đợi:** màn gửi có tiêu đề "Gửi yêu cầu đặt phòng", ghi "Giá bán cho khách" và "Giá chủ nhà". Gửi xong ghi "Đang chờ Chị Hoa chấp nhận" kèm giờ gửi. Lan xem 1509 vẫn thấy 10/10, 11/10 trống.
- **Nguồn:** YC9.1-NT1, YC9.1-NT2, YC9.1-NT3
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US50-KB2 · Nhắn, gọi chủ nhà và hủy yêu cầu `[Chính]`
- **Làm:** ở màn chờ bấm "Nhắn chủ nhà qua Zalo", quay lại, bấm "Gọi chủ nhà", quay lại. Bấm "Hủy yêu cầu", rồi bấm lần nữa để xác nhận. Chị Hoa mở thông báo yêu cầu cũ.
- **Mong đợi:** Zalo mở đúng cuộc trò chuyện với Chị Hoa; ứng dụng gọi mở với số Chị Hoa. Hủy thì nút đổi thành "Xác nhận hủy yêu cầu?", bấm lần nữa thì ghi "Đã hủy yêu cầu". Chị Hoa không có thông báo mới; mở thông báo cũ thì chỉ ghi "Sale đã hủy yêu cầu này."
- **Nguồn:** YC9.1-NT7, YC9.1-NT13
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US50-KB3 · Căn vừa có người đặt, căn thiếu giá, ngày đã qua `[Biên]`
- **Làm:** Chị Hoa ghi đặt phòng 1509 đêm 10/10 trong lúc Hùng đang ở màn gửi, rồi Hùng bấm gửi. Thử gửi một căn chưa có giá đêm 11/10. Thử gửi với ngày nhận là hôm qua (đổi ngày trên máy nếu cần).
- **Mong đợi:** lần đầu ghi "Căn này đã được đặt rồi", lịch căn hiện 10/10, 11/10 Kín, không có yêu cầu mới. Căn thiếu giá báo "Căn chưa có giá cho đêm 11/10. Nhắn chủ nhà để hỏi giá." Ngày đã qua báo "Ngày nhận đã qua".
- **Nguồn:** YC9.1-NT5, YC9.1-NT11, YC9.1-NT12
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US50-KB4 · Gửi hai lần, quyền `[Biên]`
- **Làm:** bấm gửi hai lần thật nhanh. Lan thử mở yêu cầu của Hùng bằng link sửa tay. Một sale chưa kết nối Anh Tuấn thử gửi yêu cầu cho 2208 bằng link sửa tay.
- **Mong đợi:** chỉ có một yêu cầu. Lan không thấy gì về yêu cầu của Hùng. Sale chưa kết nối không gửi được và không biết căn có tồn tại.
- **Nguồn:** YC9.1-NT4, YC9.1-NT8, YC9.1-NT9, YC9.1-NT10
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
