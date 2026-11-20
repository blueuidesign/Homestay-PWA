---
id: US8-KB
us: US8
rev: 1
---
# Kịch bản test tay US8 · Xóa tài khoản

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Chị Hoa (chủ nhà, căn 1509 và 3402, kết nối Sale Hùng, Sale Lan), Sale Hùng.
Dùng tài khoản thử trên staging, không dùng tài khoản thật: xóa xong phải đăng nhập lại và nhập lại số.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Luật viết kịch bản: CL14.5a.

### US8-KB1 · Xóa tài khoản rồi đăng nhập lại `[Chính]`
- **Mục đích:** người dùng xóa được tài khoản, dữ liệu không mất.
- **Làm:** Chị Hoa vào Cá nhân > "Thông tin cá nhân" > "Xóa tài khoản". Đọc P14. Bấm "Xóa tài khoản", rồi bấm nút "Xác nhận xóa?…". Đăng nhập lại cùng email, nhập lại số.
- **Mong đợi:** lần bấm đầu chỉ đổi chữ nút, chưa xóa. Bấm lần hai thì về màn đầu A1. Đăng nhập lại vào màn nhập số; nhập xong thấy lại 1509, 3402 và các đặt phòng.
- **Nguồn:** YC1.8-NT1, YC1.8-NT8
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US8-KB2 · Giữ tài khoản `[Chính]`
- **Mục đích:** bấm nhầm thì quay lại được.
- **Làm:** mở P14, bấm "Giữ tài khoản". Mở lại, bấm "Xóa tài khoản" một lần, rồi "Giữ tài khoản".
- **Mong đợi:** cả hai lần về P2, không gì đổi, vẫn đăng nhập.
- **Nguồn:** YC1.8-NT2
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US8-KB3 · Sale thấy chủ nhà đã xóa tài khoản `[Biên]`
- **Mục đích:** phía sale theo QT6.5.
- **Chuẩn bị:** Chị Hoa vừa xóa tài khoản (KB1, trước khi nhập lại số).
- **Làm:** Sale Hùng mở Cá nhân > Thông báo, chạm thông báo. Mở lại 1509 từ màn cũ.
- **Mong đợi:** có đúng một thông báo "Chị Hoa đã xóa tài khoản"; 1509 hiện lý do "Chủ nhà đã xóa tài khoản", không ảnh, lịch, giá.
- **Nguồn:** YC1.8-NT4, YC1.8-NT6
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US8-KB4 · Mất mạng khi xóa `[Biên]`
- **Mục đích:** lỗi không làm hỏng tài khoản.
- **Làm:** ở P14-01, tắt mạng rồi bấm lần hai.
- **Mong đợi:** báo lỗi, ở lại màn; bật mạng thì tài khoản vẫn như cũ, số còn nguyên.
- **Nguồn:** YC1.8-NT3
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
