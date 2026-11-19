---
id: US18-KB
us: US18
rev: 1
---
# Kịch bản test tay US18 · Sửa căn

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Chị Hoa giữ căn 1509 (2PN, 3 giường, có vài ảnh) và 3402; Sale Hùng được chia sẻ 1509.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US18-KB1 · Mở sửa căn thấy đủ thông tin `[Chính]`
- **Mục đích:** chủ nhà sửa căn mà không phải nhập lại từ đầu.
- **Chuẩn bị:** đăng nhập Chị Hoa, tab Căn.
- **Làm:** chạm thẻ 1509.
- **Mong đợi:** "Sửa phòng 1509", tab "Thông tin" điền sẵn mã căn, 2PN, ảnh đúng thứ tự, tòa, loại view, số giường 3, mô tả.
- **Nguồn:** YC3.5-NT1
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US18-KB2 · Đổi ảnh đại diện `[Chính]`
- **Làm:** bấm "Đổi thứ tự", đưa ảnh thứ 2 lên đầu, bấm "Lưu thay đổi".
- **Mong đợi:** về tab Căn, toast "Đã lưu phòng 1509", thẻ 1509 hiện ảnh vừa đưa lên.
- **Nguồn:** YC3.5-NT2
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US18-KB3 · Sửa số giường `[Chính]`
- **Làm:** sửa số giường 1509 thành 2, lưu; mở lại, xóa trống ô số giường, lưu.
- **Mong đợi:** thẻ ghi "2PN · 2 giường", rồi "2PN".
- **Nguồn:** YC3.5-NT4
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US18-KB4 · Đổi mã trùng `[Biên]`
- **Làm:** mở sửa 3402, đổi mã thành "1509", lưu.
- **Mong đợi:** ở lại form, dưới ô mã căn có câu "Đã có căn 1509. Kiểm tra lại mã căn."; 3402 không đổi.
- **Nguồn:** YC3.5-NT3
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US18-KB5 · Bỏ thay đổi chưa lưu `[Biên]`
- **Làm:** mở sửa 1509, bỏ một ảnh và đổi mô tả, bấm quay lại.
- **Mong đợi:** hỏi "Bỏ thay đổi chưa lưu?" với "Bỏ thay đổi" và "Ở lại". Chọn "Bỏ thay đổi" rồi mở lại 1509 thì ảnh và mô tả còn như cũ.
- **Nguồn:** YC3.5 bước 41, YC3-H4
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
