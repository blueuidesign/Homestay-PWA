---
id: US24-KB
us: US24
rev: 1
---
# Kịch bản test tay US24 · Sao chép giá sang căn khác

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Chị Hoa (căn 3402 có giá tháng 10 đến 12/2026 và dịp 24/10 – 25/10, căn 1509), Anh Tuấn, Sale Hùng.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US24-KB1 · Sao chép giá 3402 sang 1509 `[Chính]`
- **Mục đích:** chủ nhà dùng lại bảng giá của một căn cho căn khác.
- **Chuẩn bị:** đăng nhập Chị Hoa, tab Giá của 3402, năm 2026.
- **Làm:**
  1. Bấm "Sao chép giá sang căn khác".
  2. Để bật cả ba phần, chọn Phòng 1509, bấm "Sao chép sang 1 căn".
  3. Mở tab Giá của 1509.
- **Mong đợi:**
  - Bước 1: "Từ căn" Phòng 3402, dòng "Giá 3 tháng · 0 ngày lễ · 1 dịp đặc biệt · năm 2026", nút "Chọn căn để sao chép" không bấm được.
  - Bước 2: về tab Giá của 3402, toast "Đã sao chép giá sang 1 căn" (nếu có chỗ giữ lại thì popup trước, bấm "Tôi đã hiểu").
  - Bước 3: tháng 10 đến 12 của 1509 ghi như 3402, có dịp 24/10 – 25/10.
- **Nguồn:** YC4.5-NT1, NT2, NT7
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US24-KB2 · Tháng nguồn chưa có giá `[Biên]`
- **Mục đích:** giá đích không bị xóa khi nguồn chưa có giá.
- **Chuẩn bị:** đặt giá tháng 1/2026 cho 1509, 3402 chưa có giá tháng 1.
- **Làm:** sao chép "Giá theo tháng" từ 3402 sang 1509.
- **Mong đợi:** popup có dòng "1509 · Tháng 1 (nguồn chưa có giá, giữ giá cũ)"; tháng 1 của 1509 giữ giá cũ.
- **Nguồn:** YC4.5-NT3
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US24-KB3 · Dịp trùng ngày `[Biên]`
- **Mục đích:** dịp của căn đích không bị đè.
- **Chuẩn bị:** đặt dịp 25/10 – 26/10 cho 1509.
- **Làm:** sao chép "Dịp đặc biệt" từ 3402 sang 1509.
- **Mong đợi:** popup có dòng bỏ dịp 24/10 – 25/10; 1509 vẫn chỉ có dịp 25/10 – 26/10.
- **Nguồn:** YC4.5-NT5
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
