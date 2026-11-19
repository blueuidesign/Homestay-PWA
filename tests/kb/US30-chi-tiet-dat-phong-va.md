---
id: US30-KB
us: US30
rev: 1
---
# Kịch bản test tay US30 · Chi tiết đặt phòng và thu tiền

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Chị Hoa có B1 (1509, Sale Hùng, 10/10 → 12/10, 2.200.000đ, cọc 1.000.000đ). Một đặt phòng khách lẻ Chị Hoa tự ghi có tên và số điện thoại. Một tài khoản sale thử để xóa tài khoản ở KB4.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US30-KB1 · Xem chi tiết và thu đủ tiền `[Chính]`
- **Mục đích:** chủ nhà biết còn phải thu bao nhiêu và ghi đã thu bằng một chạm.
- **Chuẩn bị:** đăng nhập Chị Hoa, tab Lịch, Tháng 10/2026.
- **Làm:**
  1. Chạm ô 10/10, chạm dòng 1509.
  2. Bấm "Đã thu đủ 1.200.000đ".
  3. Bấm "Hoàn tác: chưa thu đủ".
- **Mong đợi:**
  - Bước 1: "Đặt phòng · Sale Hùng", "Phòng 1509", "Đã cọc · còn thu", "10/10 → 12/10 (2 đêm)", "Tiền phòng 2.200.000đ", "Đã cọc 1.000.000đ", "Còn lại 1.200.000đ", nút "Gọi sale", có "Sửa" và "Xin hủy", không có "Xóa đặt phòng".
  - Bước 2: nhãn "Đã thanh toán", vẫn "Đã cọc 1.000.000đ".
  - Bước 3: nhãn về "Đã cọc · còn thu".
- **Nguồn:** YC5.5-NT1, YC5.5-NT2, YC5.5-NT3
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US30-KB2 · Gọi sale `[Chính]`
- **Mục đích:** chủ nhà gọi sale ngay từ đặt phòng.
- **Chuẩn bị:** như KB1 bước 1, trên điện thoại thật.
- **Làm:** bấm "Gọi sale".
- **Mong đợi:** điện thoại mở màn gọi với số của Sale Hùng.
- **Nguồn:** YC5.5 bước 18
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US30-KB3 · Khách lẻ có số điện thoại `[Biên]`
- **Mục đích:** chủ nhà gọi được khách tự nhận.
- **Chuẩn bị:** đặt phòng khách lẻ có tên và số do Chị Hoa nhập.
- **Làm:** mở chi tiết đặt phòng đó.
- **Mong đợi:** thấy tên, số và nút "Gọi khách"; có "Sửa" và "Xóa đặt phòng", không có "Xin hủy".
- **Nguồn:** YC5.5-NT6, YC5.5 bước 23
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US30-KB4 · Sale đã xóa tài khoản `[Biên]`
- **Mục đích:** đặt phòng cũ vẫn giữ khi sale rời app.
- **Chuẩn bị:** sale thử có đặt phòng với Chị Hoa, rồi xóa tài khoản (khi YC1.8 có; trước đó nhờ Claude đánh dấu trên staging).
- **Làm:** Chị Hoa mở đặt phòng đó.
- **Mong đợi:** tên sale kèm "đã xóa tài khoản" màu đỏ, không có số, không có nút "Gọi sale"; các đêm vẫn kín trên lịch.
- **Nguồn:** YC5.5-NT4
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-19 | Claude | main | Bản đầu (QD25) | Cả file |
