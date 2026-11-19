---
id: US2-KB
us: US2
rev: 1
---
# Kịch bản test tay US2 · Đăng ký và đăng nhập bằng mã email

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md. Cần hai email thật của người test (email A chưa có tài khoản, email B đã có tài khoản và đã chọn vai). Không ghi email, số thật vào file này.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US2-KB1 · Tạo tài khoản mới `[Chính]`
- **Mục đích:** người mới nhập tên, số, email, nhận mã và vào app.
- **Chuẩn bị:** điện thoại chưa đăng nhập, email A.
- **Làm:**
  1. Mở app, bấm "Tạo tài khoản".
  2. Nhập họ tên, số điện thoại, email A, bấm "Gửi mã xác nhận".
  3. Mở hộp thư A, lấy mã 6 số, nhập vào app, bấm "Xác nhận".
- **Mong đợi:**
  - Bước 2 sang màn "Nhập mã xác nhận", có email A trên màn, đếm ngược gửi lại 60 giây.
  - Thư tới trong vòng 1 phút, có mã 6 số.
  - Bước 3 sang màn chọn vai. Tab Cá nhân sau đó có đúng tên và số đã nhập.
- **Nguồn:** YC1.2-NT2, YC1.2-NT4
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US2-KB2 · Đăng nhập bằng email đã có `[Chính]`
- **Mục đích:** người cũ đăng nhập lại không cần mật khẩu.
- **Chuẩn bị:** email B đã có tài khoản, đã chọn vai. Đăng xuất trước.
- **Làm:**
  1. Bấm "Tôi đã có tài khoản · Đăng nhập", nhập email B, bấm "Gửi mã đăng nhập".
  2. Nhập mã trong thư, bấm "Đăng nhập".
  3. Đóng hẳn app (vuốt tắt), mở lại.
- **Mong đợi:**
  - Bước 2 vào thẳng tab Lịch, không thấy màn tạo tài khoản hay chọn vai.
  - Bước 3 vẫn ở trong app, không phải đăng nhập lại.
- **Nguồn:** YC1.2-NT7, YC1.2-NT8
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US2-KB3 · Ô nhập sai và email đã có `[Biên]`
- **Mục đích:** lỗi báo đúng chỗ, không gửi mã khi ô sai.
- **Chuẩn bị:** chưa đăng nhập.
- **Làm:**
  1. Ở màn Tạo tài khoản, để trống tên, nhập số "12ab", bấm "Gửi mã xác nhận".
  2. Sửa tên và số cho đúng, nhập email B, bấm lại.
  3. Bấm "Đăng nhập bằng email này".
- **Mong đợi:**
  - Bước 1: dưới ô tên "Nhập họ và tên để sale và chủ nhà biết bạn là ai.", dưới ô số "Số điện thoại cần từ 9 đến 15 chữ số.", không có thư nào được gửi.
  - Bước 2: "Email này đã có tài khoản." kèm nút "Đăng nhập bằng email này".
  - Bước 3: sang màn nhập mã đăng nhập của email B, thư mã được gửi.
- **Nguồn:** YC1.2-NT11, YC1.2-NT13
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US2-KB4 · Mã sai, mã hết hạn `[Biên]`
- **Mục đích:** mã sai không cho vào, mã cũ báo hết hạn.
- **Chuẩn bị:** email A hoặc B.
- **Làm:**
  1. Xin mã, nhập 6 số sai, bấm xác nhận.
  2. Chờ hết 60 giây, bấm "Gửi lại mã". Nhập mã của thư đầu tiên.
  3. Nhập mã của thư mới nhất.
- **Mong đợi:**
  - Bước 1: "Mã chưa đúng. Kiểm tra lại thư mới nhất, hoặc bấm "Gửi lại mã"." và vẫn ở màn nhập mã.
  - Bước 2: báo mã đã hết hạn hoặc đã dùng (hoặc mã chưa đúng), không vào app.
  - Bước 3: vào app.
- **Nguồn:** YC1.2-NT3
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US2-KB5 · Email chưa có tài khoản ở màn Đăng nhập `[Biên]`
- **Mục đích:** đăng nhập không lặng lẽ tạo tài khoản mới.
- **Chuẩn bị:** một email chưa từng dùng.
- **Làm:**
  1. Ở màn Đăng nhập nhập email đó, bấm "Gửi mã đăng nhập".
  2. Bấm "Tạo tài khoản với email này".
- **Mong đợi:**
  - Bước 1: "Email này chưa có tài khoản. Kiểm tra lại chính tả, hoặc tạo tài khoản mới." Không có thư nào gửi tới.
  - Bước 2: sang màn Tạo tài khoản, ô email đã điền sẵn.
- **Nguồn:** YC1.2-NT12
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US2-KB6 · Số đã thuộc tài khoản khác `[Biên]`
- **Mục đích:** một số điện thoại chỉ một tài khoản.
- **Chuẩn bị:** số điện thoại của tài khoản B, một email mới.
- **Làm:**
  1. Tạo tài khoản với email mới và số của tài khoản B, nhập đúng mã.
- **Mong đợi:**
  - Về màn Tạo tài khoản, dưới ô số "Số này đã có tài khoản. Đăng nhập bằng email của tài khoản đó." Không vào app.
- **Nguồn:** YC1.2-NT10
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-19 | Claude | US2-dang-ky-dang-nhap | Bản đầu (QD25) | Cả file |
