---
id: US45-KB
us: US45
rev: 1
---
# Kịch bản test tay US45 · Kết quả tìm phòng

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Sale Hùng có mức cộng mặc định +400.000đ, có Green Bay 0812 (căn của mình), nguồn phòng của Chị Hoa, Anh Tuấn, căn tự nhập Villa Tuần Châu của Chú Bình.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US45-KB1 · Danh sách kết quả `[Chính]`
- **Mục đích:** sale thấy ngay căn nào trống, giá chủ và giá mình bán.
- **Làm:** đăng nhập Hùng, tìm 2 đêm trong tuần tới.
- **Mong đợi:** dòng điều kiện có "Sửa", số căn trống, nhóm "CỦA TÔI", "NGUỒN PHÒNG", rồi "TỰ NHẬP · chưa biết lịch" (không tính vào số căn trống). Thẻ căn của chủ nhà ghi tổng giá chủ và "bạn bán" (giá chủ cộng 400.000đ mỗi đêm). Căn của tôi ghi "Lịch của bạn, luôn đúng"; căn tự nhập ghi không có lịch và gợi ý gọi chủ căn.
- **Nguồn:** YC7.3-NT1, YC7.3-NT2, YC7.3-NT5
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US45-KB2 · Chọn căn và chuyển Lịch tuần `[Chính]`
- **Làm:** tích 3 căn. Chuyển sang "Lịch tuần", rồi về "Danh sách".
- **Mong đợi:** thanh đáy "Đã chọn 3 căn", nút "Gửi cho khách" bấm được. Lịch tuần bắt đầu từ ngày nhận, các đêm khách hỏi được tô, cùng tập căn trống; về Danh sách vẫn đúng điều kiện và các căn đã tích.
- **Nguồn:** YC7.3-NT3, YC7.3-NT4
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US45-KB3 · Chạm căn `[Biên]`
- **Làm:** chạm Green Bay 0812, quay lại, chạm Villa Tuần Châu.
- **Mong đợi:** mở màn chi tiết căn của tôi và màn căn tự nhập tương ứng (bản này có thể là màn tạm), không mở màn chi tiết căn của chủ nhà.
- **Nguồn:** YC7.3-NT6
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
