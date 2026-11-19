---
id: US21-KB
us: US21
rev: 1
---
# Kịch bản test tay US21 · Giá theo tháng của một căn

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Chị Hoa (căn 1509 có giá tháng 10 đến 12/2026, căn 3402), Anh Tuấn, Sale Hùng. Một tài khoản chủ nhà mới có một căn chưa có giá.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US21-KB1 · Căn chưa có giá `[Chính]`
- **Mục đích:** chủ nhà mới biết phải làm gì để sale thấy giá.
- **Chuẩn bị:** tài khoản chủ nhà mới, một căn chưa có giá.
- **Làm:** mở tab "Giá" của căn.
- **Mong đợi:** 12 ô tháng ghi "Chưa đặt", dòng "Căn này chưa có giá. Chọn tháng, nhập giá ngày thường và cuối tuần rồi bấm Áp dụng. Sale chỉ thấy giá sau khi bạn đặt.", dòng "Chưa chọn tháng nào. Chọn một tháng bên trên sau đó nhập giá.", nút áp dụng không bấm được.
- **Nguồn:** YC4.2-NT2, NT3
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US21-KB2 · Đặt giá hai tháng `[Chính]`
- **Mục đích:** chủ nhà đặt giá nhiều tháng một lần.
- **Chuẩn bị:** đăng nhập Chị Hoa, mở tab Giá của 3402.
- **Làm:**
  1. Chạm ô Tháng 11 và Tháng 12.
  2. Nhập ngày thường 800.000, cuối tuần 1.100.000, bấm "Áp dụng cho Tháng 11 – 12".
  3. Xem lịch giá tháng 11.
- **Mong đợi:**
  - Bước 1: dòng "Đang chọn: Tháng 11 – 12 (2 tháng)".
  - Bước 2: toast "Đã áp dụng giá cho Tháng 11 – 12", hai ô tháng ghi "800k–1,1tr", vẫn ở tab Giá.
  - Bước 3: đêm 06/11 (T6) ghi "1,1tr", đêm 09/11 (T2) ghi "800k".
- **Nguồn:** YC4.2-NT1
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US21-KB3 · Lịch giá tháng có dịp `[Chính]`
- **Mục đích:** chủ nhà thấy đúng giá từng đêm, kể cả dịp.
- **Chuẩn bị:** đăng nhập Chị Hoa, tab Giá của 3402.
- **Làm:** xem "Lịch giá tháng 10".
- **Mong đợi:** đêm 08/10 (T5) ghi "800k", đêm 09/10 (T6) ghi "1,1tr", đêm 24/10 ghi "1,3tr" có màu dịp; có chú thích Dịp đặc biệt, Ngày lễ, Có khách.
- **Nguồn:** YC4.2-NT4
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US21-KB4 · Chuyển năm và đổi giá không ảnh hưởng đặt phòng cũ `[Biên]`
- **Mục đích:** đặt giá năm sau được; giá mới không làm đổi đặt phòng đã có.
- **Chuẩn bị:** đăng nhập Chị Hoa, căn 1509 đã có đặt phòng B1 (2.200.000đ).
- **Làm:**
  1. Ở tab Giá của 1509, bấm "Năm 2026", chọn "Năm 2027 · Năm sau".
  2. Quay về năm 2026, đổi giá tháng 10 của 1509 thành 700.000 và 900.000.
  3. Mở chi tiết B1.
- **Mong đợi:**
  - Bước 1: 12 ô hiện giá của năm 2027 (chưa đặt thì "Chưa đặt").
  - Bước 3: B1 vẫn 2.200.000đ.
- **Nguồn:** YC4.2-NT5, NT7
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-19 | Claude | main | Bản đầu (QD25) | Cả file |
