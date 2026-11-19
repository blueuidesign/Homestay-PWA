---
id: US13-KB
us: US13
rev: 1
---
# Kịch bản test tay US13 · Lịch tuần nhiều căn

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md (DLM.5): Chị Hoa có căn 1509 (2PN, ICON40) và 3402, đặt phòng B1 đến B9. Hôm nay giả định 07/10/2026; thử trên máy thật thì dùng ngày thật và đặt phòng tạo quanh ngày đó.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US13-KB1 · Mở lịch tuần từ lịch tháng `[Chính]`
- **Mục đích:** chủ nhà nhiều căn xem cả tuần của mọi căn trên một màn.
- **Chuẩn bị:** đăng nhập Chị Hoa, tab Lịch, Tháng 10/2026, chạm ngày 14.
- **Làm:** bấm nút "Tuần" dưới tiêu đề.
- **Mong đợi:** màn "Lịch tuần", thanh tuần "12 – 18/10/2026"; mỗi căn một hàng ("1509", "2PN · ICON40"), bảy cột "T2 12" tới "CN 18". Bấm "Tháng" thì về lịch Tháng 10/2026.
- **Nguồn:** YC2.5-NT1, YC2.5-NT6
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US13-KB2 · Giá đêm và thanh đặt phòng `[Chính]`
- **Làm:** bấm "Trước" để về tuần 05 – 11/10/2026, xem bảng.
- **Mong đợi:** ô trống hiện giá rút gọn: 1509 ngày 08/10 "900k", 3402 ngày 09/10 "1,1tr". Đêm có khách nối thành một thanh, ghi người đặt và nhãn tiền. Đêm chưa đặt giá hiện "–".
- **Nguồn:** YC2.5-NT2, YC2.5-NT7, YC2.5 bước 18
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US13-KB3 · Ba ô tóm tắt `[Chính]`
- **Làm:** xem tuần 12 – 18/10/2026.
- **Mong đợi:** ô "Chưa cọc 2 đặt phòng"; "Có khách hôm nay" đếm theo hôm nay; "Trống tối T7" đếm theo thứ Bảy 17/10.
- **Nguồn:** YC2.5-NT4, YC2.5 bước 20
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US13-KB4 · Chip lọc `[Biên]`
- **Làm:** chạm chip "ICON40", rồi chip "Tất cả".
- **Mong đợi:** bảng chỉ còn 1509, rồi hiện lại mọi căn. Mọi căn cùng 2PN thì không có chip số phòng ngủ; thêm một căn 3PN thì có chip "3 phòng ngủ".
- **Nguồn:** YC2.5-NT3, YC2.5-NT5
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US13-KB5 · Chạm ô và thanh `[Biên]`
- **Làm:** chạm một ô trống, quay lại, chạm một thanh đặt phòng.
- **Mong đợi:** ô trống mở form ghi đặt phòng có sẵn căn và ngày đó; thanh mở chi tiết đặt phòng.
- **Nguồn:** YC2.5 bước 23
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US13-KB6 · Tuần chưa có đặt phòng `[Biên]`
- **Làm:** bấm "Sau" tới một tuần không có đặt phòng nào.
- **Mong đợi:** bảng vẫn đủ giá, có dòng "Tuần này chưa có đặt phòng nào. Mọi căn đều trống.".
- **Nguồn:** YC2.5 (CN2-00)
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
