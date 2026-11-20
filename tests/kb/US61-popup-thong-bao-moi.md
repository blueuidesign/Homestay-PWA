---
id: US61-KB
us: US61
rev: 1
---
# Kịch bản test tay US61 · Popup thông báo mới

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Chị Hoa (chủ nhà), Sale Hùng (đã kết nối với Chị Hoa, có đặt phòng B1 ở căn 1509).
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Luật viết kịch bản: CL14.5a.

### US61-KB1 · Có thông báo mới thì popup nổi lên `[Chính]`
- **Mục đích:** mở app là thấy ngay việc mới, không phủ kín màn.
- **Chuẩn bị:** Sale Hùng mở app một lần rồi thoát hẳn. Chị Hoa sửa B1 (đổi ngày hay tiền phòng).
- **Làm:** Hùng mở lại app.
- **Mong đợi:** popup "1 thông báo mới" nổi trên màn đang mở, phía sau tối lại, thấy phần màn phía trên và dưới popup. Có dòng "Chị Hoa đã sửa đặt phòng của bạn", dòng phụ ghi ngày cũ đổi thành ngày mới, giờ ở cuối dòng.
- **Nguồn:** YC12.1-NT1
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US61-KB2 · Không có gì mới thì không popup `[Chính]`
- **Mục đích:** không làm phiền khi không có việc.
- **Chuẩn bị:** như KB1, Hùng đã thấy popup và đóng.
- **Làm:** Hùng đóng hẳn app rồi mở lại.
- **Mong đợi:** không có popup.
- **Nguồn:** YC12.1-NT3, YC12.1-NT5
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US61-KB3 · Quay lại từ nền thì popup hiện lại `[Chính]`
- **Mục đích:** đang để app ở nền mà có việc mới thì quay lại vẫn thấy.
- **Chuẩn bị:** Hùng đang mở app, chuyển sang app khác (app ở nền).
- **Làm:** Chị Hoa sửa B1. Hùng quay lại app.
- **Mong đợi:** popup hiện với dòng sửa B1.
- **Nguồn:** YC12.1-NT4
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US61-KB4 · Đóng popup, thông báo vẫn còn `[Biên]`
- **Mục đích:** đóng popup không làm mất thông báo.
- **Chuẩn bị:** như KB1.
- **Làm:** Hùng bấm ✕ (hoặc chạm vùng tối), rồi vào Cá nhân.
- **Mong đợi:** popup đóng, về đúng màn đang mở; dòng "Thông báo" ở Cá nhân vẫn ghi số chưa đọc đúng.
- **Nguồn:** YC12.1-NT5
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US61-KB5 · Mất mạng lúc mở app `[Biên]`
- **Mục đích:** mất mạng không hiện popup lỗi.
- **Chuẩn bị:** bật chế độ máy bay, mở app.
- **Làm:** mở app rồi tắt chế độ máy bay.
- **Mong đợi:** lúc mất mạng không có popup; có báo mất kết nối như mọi màn; khi có mạng lại và quay lại app thì popup hiện nếu có thông báo mới.
- **Nguồn:** HV2, HV3
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
