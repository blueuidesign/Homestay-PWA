---
id: US11-KB
us: US11
rev: 1
---
# Kịch bản test tay US11 · Doanh thu tháng

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Chị Hoa có các đặt phòng tháng 10/2026 (tổng 11.800.000đ, 13 đêm có khách). Tháng 9 thêm một đặt phòng riêng cho KB2.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US11-KB1 · Xem doanh thu tháng `[Chính]`
- **Mục đích:** chủ nhà biết tháng này thu bao nhiêu mà không phải tự cộng.
- **Chuẩn bị:** đăng nhập Chị Hoa, tab Lịch, Tháng 10/2026.
- **Làm:** kéo xuống dưới lưới lịch.
- **Mong đợi:** khối "Doanh thu tháng 10", số lớn "11.800.000đ", dòng nhỏ "13 đêm có khách".
- **Nguồn:** YC2.3-NT1
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US11-KB2 · So với tháng trước, đổi tháng `[Biên]`
- **Chuẩn bị:** có một đặt phòng tháng 9.
- **Làm:** xem tháng 10, rồi bấm sang tháng 9, rồi sang tháng 12 (không có đặt phòng).
- **Mong đợi:** tháng 10 có thêm "tháng 9: …đ"; tháng 9 khối đổi theo; tháng 12 không có khối.
- **Nguồn:** YC2.3 bước 11 đến 13, YC2.3-NT2
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US11-KB3 · Lọc căn không đổi số `[Biên]`
- **Làm:** ở tháng 10, chạm chip lọc 1509.
- **Mong đợi:** lưới chỉ còn 1509, khối doanh thu vẫn "11.800.000đ", "13 đêm có khách".
- **Nguồn:** YC2.3 (YC2-H1)
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US11-KB4 · Đặt phòng đã hủy không tính `[Biên]`
- **Làm:** hủy một đặt phòng tháng 10 (khi đã có chức năng hủy), xem lại khối.
- **Mong đợi:** số tiền và số đêm giảm đúng phần đặt phòng đó.
- **Nguồn:** YC2.3 bước 11, QD12
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
