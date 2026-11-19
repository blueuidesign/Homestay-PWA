---
id: US43-KB
us: US43
rev: 1
---
# Kịch bản test tay US43 · Màn đầu tiên và lịch 7 ngày của sale

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Sale Hùng (có 2 căn của mình, kết nối "tất cả căn" với Chị Hoa và các chủ nhà khác, tổng 5 căn nguồn phòng, có căn tự nhập Villa Tuần Châu của Chú Bình), một tài khoản sale mới chưa có căn. Cần điện thoại thật để thử xoay.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US43-KB1 · Sale mới chưa có căn `[Chính]`
- **Mục đích:** sale mới biết bước đầu phải làm gì.
- **Làm:** đăng ký mới, chọn "Tôi là sale", mở tab Lịch.
- **Mong đợi:** màn "Chưa có nguồn phòng" có hai nút "Gửi tin nhắn xin lịch đến chủ nhà" và "Thêm căn thủ công"; thanh tab dưới không có "Tìm phòng".
- **Nguồn:** YC7.1-NT1
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US43-KB2 · Lịch 7 ngày của sale `[Chính]`
- **Làm:** đăng nhập Sale Hùng, mở tab Lịch.
- **Mong đợi:** tiêu đề "Lịch phòng", thanh "7 ngày tới" có ngày bắt đầu là hôm nay. Nhóm "CĂN CỦA TÔI · 2" ở trên "NGUỒN PHÒNG · 5". Ô trống ghi giá bán rút gọn (ví dụ 3402 ghi "1,2tr" khi giá chủ 800.000đ và mức cộng 400.000đ), ô kín ghi "Kín", không có tên người đặt. Căn tự nhập ghi "?" ở mọi ô trừ đêm Hùng đã ghi đặt phòng (ghi "Bạn"). Bấm › thì sang 7 ngày sau, ‹ thì lùi lại.
- **Nguồn:** YC7.1-NT2, YC7.1-NT3, YC7.1-NT5
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US43-KB3 · Chủ nhà vừa ghi đặt phòng `[Chính]`
- **Làm:** trên máy khác Chị Hoa ghi một đặt phòng 1509 cho khách lẻ trong 7 ngày tới. Hùng kéo lại hoặc mở lại app.
- **Mong đợi:** các đêm đó của 1509 ghi "Kín", không có tên khách.
- **Nguồn:** YC7.1-NT4
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US43-KB4 · Sắp xếp và xoay ngang `[Biên]`
- **Làm:** bấm nút "Theo tên", chọn "Giá tăng dần", rồi "Bán nhiều nhất". Nghiêng máy sang ngang. Bấm "Xoay ngang", rồi "Xoay dọc".
- **Mong đợi:** mỗi lần sắp, nhóm "CĂN CỦA TÔI" vẫn ở trên cùng. Nghiêng máy thì bảng không tự xoay. Bấm "Xoay ngang" thì bảng quay ngang, ẩn thanh tab, nút thành "Xoay dọc".
- **Nguồn:** YC7.1-NT7, YC7.1-NT8
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US43-KB5 · Mất quyền xem `[Biên]`
- **Làm:** Chị Hoa ngừng cho Hùng xem lịch (hoặc xóa căn 3402). Hùng mở lại tab Lịch.
- **Mong đợi:** căn tương ứng biến khỏi bảng, số đếm "NGUỒN PHÒNG" giảm.
- **Nguồn:** YC7.1-NT6
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
