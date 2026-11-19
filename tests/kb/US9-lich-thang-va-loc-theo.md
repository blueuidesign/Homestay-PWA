---
id: US9-KB
us: US9
rev: 1
---
# Kịch bản test tay US9 · Lịch tháng và lọc theo căn

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Chị Hoa có 1509 và 3402, booking B1 đến B9 (DLM.4). Trước khi có form ghi đặt phòng (YC5), booking nạp bằng dữ liệu mẫu trên staging. Một tài khoản chủ nhà có căn nhưng chưa có booking nào.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US9-KB1 · Lịch tháng tô đúng đêm có khách `[Chính]`
- **Mục đích:** chủ nhà mở app là thấy ngày nào căn nào có khách, không tô nhầm ngày trả phòng.
- **Chuẩn bị:** đăng nhập Chị Hoa.
- **Làm:** mở tab Lịch, chuyển tới Tháng 10/2026 nếu cần.
- **Mong đợi:** lưới bắt đầu từ thứ Hai; có chip "Cả 2 phòng", "1509", "3402"; ô 10/10 và 11/10 tô màu của 1509, ô 12/10 không tô màu của 1509; dưới lưới có chú thích "1509 đã đặt", "3402 đã đặt".
- **Nguồn:** YC2.1-NT1, YC2.1-NT3, QT2.1
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US9-KB2 · Lọc theo căn và đổi tháng `[Chính]`
- **Mục đích:** chủ nhà xem riêng một căn và lật tháng mà không mất lựa chọn.
- **Chuẩn bị:** như KB1, đang ở Tháng 10/2026.
- **Làm:**
  1. Chạm chip "3402".
  2. Bấm "T11".
- **Mong đợi:**
  - Bước 1: chỉ còn tô 05/10, 06/10, 14/10, 17/10, 18/10, 21/10 (màu 3402), không còn ô màu 1509.
  - Bước 2: tiêu đề "Tháng 11/2026", chip "3402" vẫn chọn, ô 30/11 tô màu 3402.
- **Nguồn:** YC2.1-NT4, YC2.1-NT5
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US9-KB3 · Chưa có đặt phòng nào `[Chính]`
- **Mục đích:** chủ nhà mới biết bước tiếp theo là ghi đặt phòng.
- **Chuẩn bị:** tài khoản chủ nhà có căn, chưa có booking.
- **Làm:** mở tab Lịch.
- **Mong đợi:** thấy "Chưa có đặt phòng nào", nút "Đặt phòng", gợi ý mời sale vào tab Sale; không có khối doanh thu, không có danh sách đặt phòng sắp tới.
- **Nguồn:** YC2.1-NT6
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US9-KB4 · Một căn thì không có chip `[Biên]`
- **Mục đích:** không hiện chip thừa khi chỉ có một căn.
- **Chuẩn bị:** tài khoản chủ nhà có đúng một căn.
- **Làm:** mở tab Lịch.
- **Mong đợi:** không có hàng chip lọc.
- **Nguồn:** YC2.1 bước 3
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US9-KB5 · Mất mạng khi đổi tháng `[Biên]`
- **Mục đích:** lịch không biến mất khi mạng yếu.
- **Chuẩn bị:** như KB1, đang xem Tháng 10/2026.
- **Làm:** tắt mạng, bấm "T11".
- **Mong đợi:** báo mất mạng theo HV2, vẫn giữ tháng đang hiện, bật mạng lại thì xem được tháng 11.
- **Nguồn:** HV2-NT3, YC2 Trạng thái màn
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-19 | Claude | main | Bản đầu (QD25) | Cả file |
