---
id: US59-KB
us: US59
rev: 1
---
# Kịch bản test tay US59 · Thống kê của sale

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md (DLM.6): Sale Hùng tháng 10 có B1, B3, H3, H4, H5, V2; Y1 đang chờ Anh Tuấn. Sale Lan có B2. Ngày thử coi như 07/10/2026.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US59-KB1 · Xem thống kê tháng `[Chính]`
- **Mục đích:** sale biết tháng này lời bao nhiêu và bán qua chủ nhà nào.
- **Làm:** đăng nhập Sale Hùng, mở tab Thống kê.
- **Mong đợi:** "TIỀN CHÊNH THÁNG 10 1.600.000đ", "+33.3% so với tháng 9". "ĐẶT PHÒNG 6 · Tháng 9: 4", "DOANH SỐ 10.600.000đ · Tháng 9: 9.800.000đ". Theo chủ nhà: Chị Hoa 4.800.000đ · chênh 800.000đ, Anh Tuấn 4.200.000đ · chênh 600.000đ, Chú Bình 1.600.000đ · chênh 200.000đ. "CHỜ CHỦ NHÀ CHẤP NHẬN: 1" với À La Carte 2208. Y1 không cộng vào số nào.
- **Nguồn:** YC11.2-NT1, YC11.2-NT2, YC11.2-NT3, YC11.2-NT4
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US59-KB2 · Đặt phòng chủ nhà ghi giúp `[Chính]`
- **Làm:** đăng nhập Chị Hoa, ghi 1509 cho Sale Hùng với giá bán 2.600.000đ (giá chủ 2.200.000đ). Đăng nhập lại Hùng, mở Thống kê.
- **Mong đợi:** thêm 1 đặt phòng, doanh số thêm 2.600.000đ, dòng Chị Hoa thêm 400.000đ tiền chênh.
- **Nguồn:** YC11.2-NT5
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US59-KB3 · Quyền, vắt tháng, tháng trống `[Biên]`
- **Làm:** đăng nhập Sale Lan, mở Thống kê. Với Hùng: ghi một đặt phòng 31/10 → 02/11 và một đặt phòng ở căn của tôi, rồi xem tháng 10. Dùng một sale mới chưa có đặt phòng, mở Thống kê và bấm "Tìm phòng".
- **Mong đợi:** Lan chỉ thấy số của Lan, không có gì của Hùng. Đặt phòng vắt tháng chỉ cộng phần đêm 31/10 vào tháng 10, và đếm vào số đặt phòng tháng 10. Đặt phòng ở căn của tôi không cộng. Sale mới thấy "Tháng này chưa chốt đặt phòng nào" và "Tìm phòng" mở tìm phòng.
- **Nguồn:** YC11.2-NT6, YC11.2-NT8, YC11.2-NT9, YC11.2-NT10, YC11.2-NT11
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
