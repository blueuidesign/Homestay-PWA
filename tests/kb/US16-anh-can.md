---
id: US16-KB
us: US16
rev: 1
---
# Kịch bản test tay US16 · Ảnh căn

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Chị Hoa (2 căn ICON40 1509 và 3402), Anh Tuấn (căn riêng). Chuẩn bị trên điện thoại: ít nhất 15 ảnh chụp, một file PDF, một ảnh lớn hơn 15 MB (nếu có).
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US16-KB1 · Thêm căn kèm 3 ảnh `[Chính]`
- **Mục đích:** chủ nhà thêm căn có ảnh, ảnh đầu là ảnh đại diện.
- **Chuẩn bị:** đăng nhập Chị Hoa, mở form thêm căn, nhập mã "5501", chọn "2PN".
- **Làm:**
  1. Bấm "Thêm ảnh · chọn nhiều ảnh cùng lúc".
  2. Chọn 3 ảnh.
  3. Trong lúc ảnh đang tải, nhìn thanh dưới.
  4. Chờ tải xong, bấm "Thêm căn".
- **Mong đợi:**
  - Bước 1: mở ngay ô chọn ảnh của điện thoại, không có hộp thoại xin quyền.
  - Bước 2: 3 ô theo thứ tự chọn, ô đầu có nhãn "Ảnh đại diện", tiêu đề "ẢNH (3)".
  - Bước 3: nút "Thêm căn" mờ, dòng "Đang tải ... ảnh. Chờ tải xong mới thêm được căn.".
  - Bước 4: thẻ 5501 ở tab Căn có ảnh đại diện là ảnh chọn đầu tiên.
- **Nguồn:** YC3.3-NT1, NT4, HV4-NT6
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US16-KB2 · Tối đa 12 ảnh `[Chính]`
- **Mục đích:** không thêm quá 12 ảnh cho một căn.
- **Chuẩn bị:** form thêm căn mới.
- **Làm:**
  1. Chọn 15 ảnh cùng lúc.
  2. Nhìn nút "Thêm ảnh".
- **Mong đợi:**
  - Bước 1: nhận 12 ảnh, toast "Mỗi căn tối đa 12 ảnh. Đã bỏ 3 ảnh.".
  - Bước 2: nút "Thêm ảnh" không bấm được.
- **Nguồn:** YC3.3-NT3
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US16-KB3 · Ảnh tải lỗi `[Biên]`
- **Mục đích:** ảnh lỗi không làm mất căn, sửa được tại chỗ.
- **Chuẩn bị:** form thêm căn, nhập mã và số phòng ngủ.
- **Làm:**
  1. Chọn 2 ảnh, ngay lúc đang tải thì bật chế độ máy bay.
  2. Tắt chế độ máy bay, bấm "Thử lại" trên ô lỗi.
  3. Làm lại bước 1, lần này bấm ✕ trên ô lỗi rồi bấm "Thêm căn".
- **Mong đợi:**
  - Bước 1: ô đang tải thành "Tải lỗi" có nút "Thử lại" và ✕; nút "Thêm căn" mờ.
  - Bước 2: ảnh tải lại được, nút sáng lại.
  - Bước 3: ô lỗi mất, thêm căn được.
- **Nguồn:** YC3.3-NT2
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US16-KB4 · File không phải ảnh hoặc quá lớn `[Biên]`
- **Mục đích:** người dùng biết vì sao file không nhận.
- **Chuẩn bị:** form thêm căn.
- **Làm:** chọn một file PDF (và một ảnh trên 15 MB nếu có).
- **Mong đợi:** ô đó báo "Ảnh phải là JPEG, PNG hoặc HEIC, tối đa 15 MB" và không tải lên.
- **Nguồn:** YC3.3-NT6
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-19 | Claude | main | Bản đầu (QD25) | Cả file |
