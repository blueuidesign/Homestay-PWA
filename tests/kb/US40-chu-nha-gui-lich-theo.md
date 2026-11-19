---
id: US40-KB
us: US40
rev: 1
---
# Kịch bản test tay US40 · Chủ nhà gửi lịch theo căn đã chọn

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Chị Hoa (chủ nhà, có căn 1509 và 3402), Sale Phương (sale chưa kết nối Chị Hoa), Sale Hùng (đã kết nối Chị Hoa, "tất cả căn"). Cần hai điện thoại hoặc hai trình duyệt.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US40-KB1 · Gửi lịch một căn `[Chính]`
- **Mục đích:** chủ nhà chỉ cho sale thấy căn mình chọn.
- **Chuẩn bị:** đăng nhập Chị Hoa.
- **Làm:** tab Lịch, bấm "Gửi lịch cho sale". Chưa chọn căn nào thì xem nút "Chia sẻ lịch". Chọn 1509, bấm "Chia sẻ lịch", gửi cho Phương. Quay về app.
- **Mong đợi:** chưa chọn căn thì nút mờ, có dòng "Chọn ít nhất một căn". Sau khi gửi: bảng chia sẻ có tin và link https của Home247; về app thấy tab Lịch và toast "Đã gửi lịch". Đóng bảng chia sẻ mà không gửi thì không có toast.
- **Nguồn:** YC6.6-NT3, YC6.6-NT6
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US40-KB2 · Sale chỉ thấy căn được gửi `[Chính]`
- **Làm:** trên máy Phương mở link vừa nhận (chưa đăng nhập trước), xem trước, rồi đăng nhập và bấm "Thêm lịch".
- **Mong đợi:** xem trước chỉ có 1509, không có 3402, không có giá. Sau khi thêm, lịch của Phương chỉ có 1509. Chị Hoa thêm căn mới thì Phương vẫn chỉ thấy 1509.
- **Nguồn:** YC6.6-NT1, YC6.6-NT2, YC6.6-NT7
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US40-KB3 · Gửi thêm căn cho sale đã kết nối `[Biên]`
- **Làm:** Chị Hoa gửi link lịch có 3402. Phương mở và thêm. Hùng cũng mở link đó.
- **Mong đợi:** Phương thấy cả 1509 và 3402. Hùng thấy "Bạn đã có lịch của Chị Hoa" và vẫn thấy mọi căn như trước.
- **Nguồn:** YC6.6-NT5
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US40-KB4 · Chưa có sale nào `[Biên]`
- **Làm:** dùng một tài khoản chủ nhà chưa có sale nào, bấm "Gửi lịch cho sale".
- **Mong đợi:** màn báo chưa có sale nào theo thiết kế, vẫn gửi được link.
- **Nguồn:** YC6.6 (CN10-00)
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
