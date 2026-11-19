---
id: US28-KB
us: US28
rev: 1
---
# Kịch bản test tay US28 · Lưu và chặn trùng

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Chị Hoa có 1509 (B1 10/10 → 12/10) và 3402, kết nối với Sale Hùng. Cần hai điện thoại đăng nhập cùng tài khoản Chị Hoa cho KB3.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US28-KB1 · Lưu đặt phòng khách lẻ `[Chính]`
- **Mục đích:** chủ nhà ghi xong là thấy ngay trên lịch.
- **Chuẩn bị:** đăng nhập Chị Hoa.
- **Làm:** tab Lịch, "Đặt phòng", chọn 3402, ngày còn trống, "Khách lẻ", giữ tiền phòng điền sẵn, bấm "Thêm đặt phòng".
- **Mong đợi:** về tab Lịch, đúng tháng của ngày nhận, ngày nhận đang chọn và chi tiết ngày mở sẵn; toast "Đã thêm đặt phòng Khách lẻ · 3402"; các đêm tô màu 3402.
- **Nguồn:** YC5.3-NT1, YC5.3 bước 10
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US28-KB2 · Nhận đúng ngày khách trước trả `[Chính]`
- **Mục đích:** ngày trả phòng không bị coi là đã có khách.
- **Chuẩn bị:** như KB1.
- **Làm:** ghi 1509 từ 12/10/2026 tới 13/10/2026, khách lẻ.
- **Mong đợi:** lưu được, không báo trùng.
- **Nguồn:** YC5.3-NT2, QT1.1
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US28-KB3 · Hai máy ghi cùng đêm `[Biên]`
- **Mục đích:** không bao giờ có hai khách cùng một đêm.
- **Chuẩn bị:** hai điện thoại cùng mở form Thêm đặt phòng cho 3402 cùng một đêm còn trống, điền đủ.
- **Làm:** bấm "Thêm đặt phòng" trên hai máy gần như cùng lúc.
- **Mong đợi:** một máy lưu được; máy kia ở lại form, dòng đỏ "Căn đã có đặt phòng trong những đêm này", dữ liệu đã nhập còn nguyên.
- **Nguồn:** YC5.3-NT3, YC5.3 bước 11
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US28-KB4 · Mất mạng lúc lưu `[Biên]`
- **Mục đích:** bấm lại sau khi mất mạng không tạo đặt phòng thứ hai.
- **Chuẩn bị:** như KB1, điền đủ form.
- **Làm:** tắt mạng, bấm "Thêm đặt phòng"; bật mạng, bấm lại.
- **Mong đợi:** lần đầu toast "Chưa lưu được vì mất mạng. Kiểm tra mạng rồi bấm lại.", form giữ dữ liệu; lần sau lưu được và lịch chỉ có một đặt phòng mới.
- **Nguồn:** YC5.3-NT4, YC5.3 bước 13
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US28-KB5 · Sale không thấy khách lẻ của chủ nhà `[Biên]`
- **Mục đích:** sale chỉ biết đêm đã kín, không thấy khách và tiền của chủ.
- **Chuẩn bị:** sau KB1, đăng nhập Sale Hùng trên máy khác.
- **Làm:** xem lịch của Chị Hoa ở phía sale.
- **Mong đợi:** các đêm vừa ghi hiện là kín; không thấy tên khách, số khách, tiền phòng, tiền cọc.
- **Nguồn:** YC5.3-NT7
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-19 | Claude | main | Bản đầu (QD25) | Cả file |
