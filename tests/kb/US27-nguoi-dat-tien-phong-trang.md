---
id: US27-KB
us: US27
rev: 1
---
# Kịch bản test tay US27 · Người đặt, tiền phòng, trạng thái tiền

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Chị Hoa có 1509 và 3402 có giá tháng 10 đến 12/2026, kết nối với Sale Hùng, Sale Lan; Anh Tuấn là chủ nhà khác. Giờ nhận, trả mặc định 14:00, 12:00.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US27-KB1 · Tiền phòng điền sẵn theo bảng giá `[Chính]`
- **Mục đích:** chủ nhà không phải tự cộng giá từng đêm.
- **Chuẩn bị:** đăng nhập Chị Hoa, mở form Thêm đặt phòng.
- **Làm:** chọn 1509, nhận 31/10/2026, chip "2 đêm".
- **Mong đợi:** ô "Tiền phòng (đ)" ghi 2.200.000; dưới ô có "31/10: 1.300.000đ" và "01/11: 900.000đ".
- **Nguồn:** YC5.2-NT1
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US27-KB2 · Ghi khách lẻ có tên và số điện thoại `[Chính]`
- **Mục đích:** chủ nhà ghi được khách tự nhận và lần sau chọn lại nhanh.
- **Chuẩn bị:** như KB1, chọn ngày còn trống.
- **Làm:**
  1. Chưa chọn ai ở hàng "Khách / Sale", xem nút "Thêm đặt phòng".
  2. Chạm "Khách lẻ", gõ tên "Bà Lan", số "0912.345.678", chọn "Đã cọc · còn thu", cọc 500.000, bấm "Thêm đặt phòng".
  3. Mở lại form.
- **Mong đợi:**
  - Bước 1: nút không bấm được.
  - Bước 2: lưu được.
  - Bước 3: hàng chip có "Bà Lan" sau các chip sale.
- **Nguồn:** YC5.2-NT8, YC5.2-NT12, YC5.2-NT13, YC5.2-NT6
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US27-KB3 · Không cho lưu khi thiếu hoặc sai tiền `[Chính]`
- **Mục đích:** không có đặt phòng thiếu tiền hay cọc vượt tiền phòng.
- **Chuẩn bị:** như KB1, đã chọn người đặt.
- **Làm:**
  1. Xóa trống ô tiền phòng.
  2. Gõ lại 2.200.000, chọn "Đã cọc · còn thu", gõ cọc 3.000.000.
- **Mong đợi:**
  - Bước 1: ô viền đỏ, dòng "Nhập tiền phòng trước khi lưu", nút không bấm được.
  - Bước 2: dòng "Tiền cọc không được lớn hơn tiền phòng", không lưu được.
- **Nguồn:** YC5.2-NT3, YC5.2-NT7
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US27-KB4 · Chọn sale làm người đặt `[Biên]`
- **Mục đích:** chủ nhà ghi giúp sale mà không lẫn khách của sale.
- **Chuẩn bị:** như KB1.
- **Làm:** chạm chip "Sale Hùng".
- **Mong đợi:** dòng nhỏ "Đặt phòng của Sale Hùng: Hùng được báo và thấy đặt phòng này như của mình."; không có ô tên, số điện thoại khách.
- **Nguồn:** YC5.2 bước 6c, YC5-H12
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US27-KB5 · Đêm chưa có giá và phần chi tiết `[Biên]`
- **Mục đích:** chủ nhà thấy rõ đêm chưa đặt giá, xem được giờ nhận trả mặc định.
- **Chuẩn bị:** như KB1.
- **Làm:**
  1. Chọn 1509, nhận 30/12/2026, trả 02/01/2027.
  2. Bấm "Thêm chi tiết".
- **Mong đợi:**
  - Bước 1: có dòng "chưa đặt giá" cho các đêm tháng 1, ô tiền phòng trống.
  - Bước 2: thấy số khách, giờ 14:00 và 12:00, ô ghi chú.
- **Nguồn:** YC5.2-NT5, YC5.2-NT10
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-19 | Claude | main | Bản đầu (QD25) | Cả file |
