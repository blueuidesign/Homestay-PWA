---
id: US15-KB
us: US15
rev: 1
---
# Kịch bản test tay US15 · Thêm căn

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Chị Hoa (2 căn ICON40 1509 và 3402), Anh Tuấn (căn riêng). Một tài khoản chủ nhà mới chưa có căn.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US15-KB1 · Thêm căn đầu tiên chỉ với mã căn và số phòng ngủ `[Chính]`
- **Mục đích:** chủ nhà mới thêm được căn với ít thông tin nhất.
- **Chuẩn bị:** tài khoản chủ nhà mới chưa có căn.
- **Làm:**
  1. Ở màn "Chưa có căn nào", bấm "Thêm căn đầu tiên".
  2. Chưa nhập gì, nhìn thanh dưới.
  3. Nhập mã căn "2105". Nhìn thanh dưới.
  4. Chọn "1PN". Không nhập số giường, không thêm ảnh.
  5. Bấm "Thêm căn".
- **Mong đợi:**
  - Bước 2: nút "Thêm căn" mờ, dòng "Còn thiếu: mã căn, số phòng ngủ".
  - Bước 3: dòng chỉ còn "Còn thiếu: số phòng ngủ".
  - Bước 4: dòng "Đủ thông tin. Ảnh, giá thêm sau cũng được.", nút sáng.
  - Bước 5: về tab Căn, toast "Đã thêm phòng 2105", thẻ 2105 đứng đầu có nhãn "Mới thêm".
- **Nguồn:** YC3.2-NT1, NT2, NT3, NT6
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US15-KB2 · Mã căn trùng `[Chính]`
- **Mục đích:** chủ nhà không tạo nhầm hai căn cùng mã.
- **Chuẩn bị:** đăng nhập Chị Hoa (đã có căn 1509).
- **Làm:**
  1. Tab Căn, bấm thêm căn.
  2. Nhập mã " 1509 " (có khoảng trắng hai đầu), chọn "2PN", bấm "Thêm căn".
  3. Đổi mã thành "1509b", bấm "Thêm căn".
- **Mong đợi:**
  - Bước 2: ở lại form, mọi ô giữ nguyên, dòng đầu "Chưa thêm được căn. Sửa 1 chỗ bên dưới.", dưới ô mã căn có câu "Đã có căn 1509. Kiểm tra lại mã căn.".
  - Bước 3: thêm được, toast "Đã thêm phòng 1509b".
- **Nguồn:** YC3.2-NT4
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US15-KB3 · Hai chủ nhà khác nhau trùng mã `[Biên]`
- **Mục đích:** mã căn chỉ cần không trùng trong căn của cùng một người.
- **Chuẩn bị:** đăng nhập Anh Tuấn.
- **Làm:**
  1. Thêm căn mã "1509", chọn "Studio".
  2. Xem tab Căn.
- **Mong đợi:**
  - Thêm được.
  - Tab Căn chỉ có căn của Anh Tuấn, không thấy căn 3402 của Chị Hoa.
- **Nguồn:** YC3.2-NT5, NT7
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US15-KB4 · Mất mạng khi bấm Thêm căn `[Biên]`
- **Mục đích:** mất mạng không làm mất dữ liệu đã nhập, bấm lại không tạo hai căn.
- **Chuẩn bị:** đăng nhập một chủ nhà, mở form thêm căn, nhập mã "7001", chọn "3PN".
- **Làm:**
  1. Bật chế độ máy bay, bấm "Thêm căn".
  2. Tắt chế độ máy bay, bấm "Thêm căn" lần nữa.
  3. Xem tab Căn.
- **Mong đợi:**
  - Bước 1: ở lại form, mọi ô giữ nguyên, toast "Chưa lưu được vì mất mạng. Kiểm tra mạng rồi bấm lại.".
  - Bước 2: toast "Đã thêm phòng 7001".
  - Bước 3: chỉ có một thẻ 7001.
- **Nguồn:** YC3.2 bước 21, YC3.2-NT9
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US15-KB5 · Đóng app khi đang nhập dở `[Biên]`
- **Mục đích:** người dùng bị gọi điện giữa chừng không phải nhập lại.
- **Chuẩn bị:** mở form thêm căn, nhập mã "8008", chọn "2PN".
- **Làm:**
  1. Đóng hẳn app (vuốt khỏi danh sách app đang chạy).
  2. Mở lại app, vào lại form thêm căn.
- **Mong đợi:** mã "8008" và "2PN" được điền lại, có dòng "Đã khôi phục nội dung bạn đang nhập".
- **Nguồn:** HV3-NT2
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-19 | Claude | main | Bản đầu (QD25) | Cả file |
