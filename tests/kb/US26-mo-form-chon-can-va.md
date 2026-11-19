---
id: US26-KB
us: US26
rev: 1
---
# Kịch bản test tay US26 · Mở form, chọn căn và ngày, kiểm trùng sớm

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Chị Hoa có 1509 và 3402, booking B1 đến B9 (DLM.4). Trước khi lưu được đặt phòng (US28), booking nạp bằng dữ liệu mẫu trên staging.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US26-KB1 · Mở form từ tab Lịch `[Chính]`
- **Mục đích:** chủ nhà mở form là có sẵn căn và đêm trống gần nhất.
- **Chuẩn bị:** đăng nhập Chị Hoa.
- **Làm:** tab Lịch, bấm "Đặt phòng".
- **Mong đợi:** form "Thêm đặt phòng" mở, căn chọn sẵn là căn đầu tiên trong danh sách căn, ngày nhận là đêm trống đầu tiên của căn đó từ hôm nay, chip "1 đêm" sáng, dòng kiểm ghi "✓ … (1 đêm) · không trùng lịch".
- **Nguồn:** YC5.1-NT1, YC5.1-NT4
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US26-KB2 · Chọn trùng đêm đã có khách `[Chính]`
- **Mục đích:** chủ nhà biết ngay đêm đã có khách trước khi điền tiếp.
- **Chuẩn bị:** như KB1.
- **Làm:** chọn căn 1509, ngày nhận 11/10/2026, chip "2 đêm".
- **Mong đợi:** ngày trả 13/10; dòng đỏ "Trùng đêm 11/10 với đặt phòng của Sale Hùng (10/10 → 12/10)"; nút "Thêm đặt phòng" không bấm được. Đổi ngày nhận sang 12/10 thì hết dòng đỏ.
- **Nguồn:** YC5.1-NT2, YC5.1-NT3, QT1.1
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US26-KB3 · Mở form từ chi tiết ngày `[Chính]`
- **Mục đích:** chủ nhà thấy căn trống là ghi ngay cho đúng ngày đó.
- **Chuẩn bị:** như KB1, tab Lịch Tháng 10/2026.
- **Làm:** chạm ô 10/10, bấm "Đặt phòng" trên dòng "Phòng 3402 · Trống ✓".
- **Mong đợi:** form mở với căn 3402, ngày nhận 10/10/2026, 1 đêm.
- **Nguồn:** YC5.1-NT5
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US26-KB4 · Tùy chọn ngày trả `[Biên]`
- **Mục đích:** chủ nhà ghi được kỳ ở dài hơn 3 đêm.
- **Chuẩn bị:** như KB1.
- **Làm:** chạm "Tùy chọn", chọn ngày trả cách ngày nhận 5 ngày; sau đó chọn lại ngày trả cách 2 ngày.
- **Mong đợi:** lần đầu chip "Tùy chọn" sáng, dòng kiểm ghi 5 đêm; lần sau chip "2 đêm" tự sáng.
- **Nguồn:** YC5.1 bước 3
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-19 | Claude | main | Bản đầu (QD25) | Cả file |
