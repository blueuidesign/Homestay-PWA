---
id: US23-KB
us: US23
rev: 1
---
# Kịch bản test tay US23 · Đặt giá nhiều căn

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Chị Hoa (căn 1509, 3402), Anh Tuấn, Sale Hùng.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US23-KB1 · Đặt giá tháng 12 cho hai căn `[Chính]`
- **Mục đích:** chủ nhà đặt cùng một giá cho nhiều căn một lần.
- **Chuẩn bị:** đăng nhập Chị Hoa, tab Căn.
- **Làm:**
  1. Bấm "Đặt giá nhiều căn".
  2. Chọn Phòng 1509.
  3. Bấm "Chọn tất cả", rồi "Đặt giá cho 2 căn".
  4. Chọn Tháng 12, nhập 800.000 và 1.100.000, bấm "Áp dụng cho Tháng 12".
  5. Mở tab Giá của 1509 và 3402.
- **Mong đợi:**
  - Bước 1: "Chọn căn · đã chọn 0/2", nút dưới đáy "Chọn ít nhất một căn" không bấm được.
  - Bước 2: "1/2", nút "Đặt giá cho 1 căn".
  - Bước 3: tiêu đề "Đặt giá · 2 căn", khối "Căn áp dụng" có hai căn và nút "Đổi căn".
  - Bước 4: về tab Căn, toast "Đã áp dụng giá cho 2 căn".
  - Bước 5: tháng 12 của cả hai căn ghi "800k–1,1tr".
- **Nguồn:** YC4.4-NT1 đến NT4
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US23-KB2 · Căn bị xóa giữa chừng `[Biên]`
- **Mục đích:** có một căn không hợp lệ thì không căn nào đổi giá.
- **Chuẩn bị:** hai máy cùng đăng nhập Chị Hoa.
- **Làm:** máy A chọn hai căn, vào bước đặt giá. Máy B xóa 3402. Máy A bấm Áp dụng.
- **Mong đợi:** máy A thấy toast "Không tìm thấy căn", ở lại màn; giá 1509 không đổi.
- **Nguồn:** YC4.4-NT5
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
