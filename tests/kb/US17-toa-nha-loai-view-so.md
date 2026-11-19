---
id: US17-KB
us: US17
rev: 1
---
# Kịch bản test tay US17 · Tòa nhà, loại view, số giường, mô tả

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Chị Hoa (căn ICON40 1509 và 3402), Anh Tuấn. Danh sách tòa có sẵn có "ICON40", "Green Bay".
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US17-KB1 · Thêm căn đủ thông tin `[Chính]`
- **Mục đích:** chủ nhà ghi được tòa, view, số giường, mô tả cho sale dùng.
- **Chuẩn bị:** đăng nhập Chị Hoa, mở form thêm căn, nhập mã "6601", chọn "2PN".
- **Làm:**
  1. Bấm "Thêm tòa nhà, mô tả gửi khách, view...".
  2. Chọn chip "ICON40", chip "Biển", nhập số giường 3, nhập mô tả "Căn góc, ban công rộng".
  3. Bấm "Thu gọn", rồi mở lại phần thêm.
  4. Bấm "Thêm căn".
- **Mong đợi:**
  - Bước 1: thấy hàng chip "Tòa nhà" (chip cuối "+ Tòa khác"), hàng chip "Loại view" đúng "Biển", "Thành phố", "Núi", không có "Vịnh", ô "Số giường", ô "Mô tả gửi khách" có dòng "Sale dùng đoạn này khi gửi thông tin căn cho khách.".
  - Bước 3: các giá trị đã nhập còn nguyên.
  - Bước 4: thẻ 6601 ghi "2PN · 3 giường · view biển · ICON40".
- **Nguồn:** YC3.4-NT2, YC3.4 bước 29, 34
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US17-KB2 · Tìm và thêm tòa mới `[Chính]`
- **Mục đích:** tòa chưa có trong danh sách thì người dùng tự thêm, người khác thấy ngay.
- **Chuẩn bị:** đăng nhập Chị Hoa, mở form thêm căn, mở phần thêm.
- **Làm:**
  1. Chạm "+ Tòa khác", gõ "green".
  2. Xóa chữ, gõ "Bim Hạ Long", chạm "+ Thêm tòa mới "Bim Hạ Long"", lưu căn.
  3. Đăng xuất, đăng nhập Anh Tuấn, mở form thêm căn, "+ Tòa khác", gõ "bim".
- **Mong đợi:**
  - Bước 1: danh sách chỉ còn "Green Bay", dòng cuối "+ Thêm tòa mới "green"".
  - Bước 2: tòa "Bim Hạ Long" được chọn cho căn.
  - Bước 3: thấy "Bim Hạ Long" trong danh sách.
- **Nguồn:** YC3.4-NT1, NT3
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US17-KB3 · Thêm tòa trùng tên khác hoa thường `[Biên]`
- **Mục đích:** không sinh hai tòa giống nhau.
- **Chuẩn bị:** đăng nhập Anh Tuấn, form thêm căn, "+ Tòa khác".
- **Làm:** gõ "icon40", chạm "+ Thêm tòa mới "icon40"", lưu căn.
- **Mong đợi:** thẻ căn ghi "ICON40"; mở lại "+ Tòa khác" chỉ có một dòng ICON40.
- **Nguồn:** YC3.4-NT4
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-19 | Claude | main | Bản đầu (QD25) | Cả file |
