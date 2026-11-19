---
id: US32-KB
us: US32
rev: 1
---
# Kịch bản test tay US32 · Xóa đặt phòng khách lẻ

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Chị Hoa có B1 (1509, Sale Hùng, 10/10 → 12/10) và B5 (1509, khách lẻ, 13/10 → 15/10).
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US32-KB1 · Xóa đặt phòng khách lẻ `[Chính]`
- **Mục đích:** khách lẻ hủy thì chủ nhà xóa và bán lại được đêm đó.
- **Chuẩn bị:** đăng nhập Chị Hoa, tab Lịch, Tháng 10/2026.
- **Làm:**
  1. Chạm ô 13/10, chạm dòng 1509, bấm "Xóa đặt phòng".
  2. Bấm "Không".
  3. Bấm lại "Xóa đặt phòng", rồi "Xóa".
  4. Thêm đặt phòng mới 1509, 13/10 → 15/10.
- **Mong đợi:**
  - Bước 1: hỏi "Xác nhận xóa đặt phòng? Ngày 13/10 → 15/10 của 1509 trống lại." với nút "Xóa" và "Không".
  - Bước 2: đặt phòng còn nguyên.
  - Bước 3: về lại chi tiết ngày 13/10, toast "Đã xóa đặt phòng", dòng 1509 hiện trống.
  - Bước 4: lưu được, không báo trùng.
- **Nguồn:** YC5.7-NT1, YC5.7-NT2
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US32-KB2 · Đặt phòng có sale không có nút xóa `[Chính]`
- **Mục đích:** chủ nhà không thể tự bỏ đặt phòng của sale mà sale không biết (QD12).
- **Làm:** mở B1.
- **Mong đợi:** không có nút "Xóa đặt phòng"; có "Sửa" và "Xin hủy".
- **Nguồn:** YC5.7-NT3, YC5.7-NT5
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US32-KB3 · Lệnh xóa gửi thẳng bị từ chối `[Biên]`
- **Mục đích:** thử vi phạm quyền bằng tay (CL6.3).
- **Làm:** Đức dùng công cụ dev gọi lệnh xóa B1 bằng tài khoản Chị Hoa, rồi gọi lệnh xóa B5 bằng tài khoản Sale Hùng.
- **Mong đợi:** cả hai bị từ chối; B1 và B5 còn nguyên, các đêm vẫn kín.
- **Nguồn:** YC5.7-NT4, YC5.7 bước 32
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
