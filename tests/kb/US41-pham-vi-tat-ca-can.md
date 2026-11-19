---
id: US41-KB
us: US41
rev: 1
---
# Kịch bản test tay US41 · Phạm vi "tất cả căn" và căn mới

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Chị Hoa (chủ nhà) và Sale Hùng đã kết nối "tất cả căn". Chạy được khi đã có lịch của sale (US43); trước đó chỉ kiểm được thông báo.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US41-KB1 · Căn mới tự hiện cho sale `[Chính]`
- **Mục đích:** chủ nhà thêm căn thì sale đã kết nối "tất cả căn" thấy ngay, không phải gửi lại link.
- **Chuẩn bị:** đăng nhập Chị Hoa trên một máy, Sale Hùng trên máy khác.
- **Làm:** Chị Hoa thêm căn 2105. Hùng mở lại lịch.
- **Mong đợi:** Hùng thấy 2105 trong lịch và có thông báo căn mới, không phải mở link nào.
- **Nguồn:** YC6.7-NT1
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US41-KB2 · Sale theo danh sách căn không thấy căn mới `[Biên]`
- **Làm:** Sale Phương chỉ được gửi 1509. Chị Hoa thêm căn 2105.
- **Mong đợi:** Phương vẫn chỉ thấy 1509.
- **Nguồn:** YC6.6-NT2
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
