---
id: US20-KB
us: US20
rev: 1
---
# Kịch bản test tay US20 · Giá trên thẻ căn

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Chị Hoa (1509 và 3402 có giá tháng 10 đến 12/2026). Một tài khoản chủ nhà mới có một căn chưa có giá.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US20-KB1 · Thẻ căn có giá tuần này `[Chính]`
- **Mục đích:** chủ nhà nhìn thẻ là biết giá tuần này.
- **Chuẩn bị:** đăng nhập Chị Hoa, ngày thử nằm trong tháng 10 đến 12/2026.
- **Làm:** mở tab Căn, xem thẻ 1509 và 3402.
- **Mong đợi:** mỗi thẻ có dòng "Giá tuần này <thấp nhất> – <cao nhất>" viết đầy đủ ("900.000đ – 1.300.000đ"), đúng giá đêm thấp và cao nhất từ thứ Hai tới Chủ nhật tuần này (đối chiếu tab Giá của căn).
- **Nguồn:** YC4.1-NT2
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US20-KB2 · Thẻ căn chưa có giá `[Chính]`
- **Mục đích:** chủ nhà mới đi thẳng tới chỗ đặt giá.
- **Chuẩn bị:** tài khoản chủ nhà mới có một căn chưa có giá.
- **Làm:**
  1. Mở tab Căn.
  2. Bấm "Đặt giá cho căn này".
- **Mong đợi:**
  - Bước 1: thẻ ghi "Chưa đặt giá" và có nút "Đặt giá cho căn này".
  - Bước 2: mở tab Giá của đúng căn đó.
- **Nguồn:** YC4.1-NT1, YC4.1 bước 2
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-19 | Claude | main | Bản đầu (QD25) | Cả file |
