---
id: US56-KB
us: US56
rev: 1
---
# Kịch bản test tay US56 · Căn tự nhập

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Sale Hùng (2 căn của mình: Green Bay 0812, Mường Thanh 1605; nguồn: Chị Hoa, Anh Tuấn; căn tự nhập Villa Tuần Châu của chú Bình), Sale Lan.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US56-KB1 · Thêm căn tự nhập `[Chính]`
- **Mục đích:** sale lưu căn của chủ chưa dùng app để gửi khách nhanh.
- **Làm:** Hùng bấm "Thêm căn tự nhập". Bỏ trống hết, xem dòng "Còn thiếu". Điền tên chủ, số điện thoại, mã căn, số phòng ngủ; bỏ trống giá và số giường; chọn Loại view; thêm 12 ảnh, thử chọn ảnh thứ 13. Bấm "Thêm căn".
- **Mong đợi:** "Còn thiếu" liệt kê đúng ô thiếu, nút "Thêm căn" mờ cho tới khi đủ, không nhắc giá và số giường. Chip Loại view đúng danh sách. Không chọn được ảnh thứ 13. Thêm xong căn ở nhóm "CĂN TỰ NHẬP", lịch 7 ngày mọi ô ghi "?".
- **Nguồn:** YC10.3-NT1, YC10.3-NT2, YC10.3-NT3, YC10.3-NT4, YC10.3-NT5
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US56-KB2 · Xem, sửa, xóa căn tự nhập `[Chính]`
- **Làm:** chạm Villa Tuần Châu. Bấm "Sửa thông tin căn", xóa số điện thoại chủ căn, lưu. Bấm "Xóa căn tự nhập" một lần, rồi bấm xác nhận.
- **Mong đợi:** màn ghi đặt phòng đã ghi "20/09 → 22/09", "Trả chủ 2.800.000đ · Thu khách 3.400.000đ", "+600.000đ", không ghi "trống" cho ngày nào. Xóa số thì nút "Gọi hỏi lịch" không dùng được. Bấm xóa lần đầu chưa xóa; xác nhận thì căn, ảnh và đặt phòng của căn không còn.
- **Nguồn:** YC10.3-NT6, YC10.3-NT8, YC10.3-NT9
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US56-KB3 · Mã căn trùng, quyền `[Biên]`
- **Làm:** Hùng thêm căn tự nhập "1509" ở ICON40 hai lần (lần hai gõ " 1509 "). Thêm "1509" ở tòa khác. Lan thêm "1509" ở ICON40. Lan thử mở Villa Tuần Châu của Hùng bằng link sửa tay. Chị Hoa thử thêm căn tự nhập.
- **Mong đợi:** lần hai của Hùng bị từ chối; tòa khác và của Lan thì được. Lan không thấy căn của Hùng. Chị Hoa không tạo được căn tự nhập.
- **Nguồn:** YC10.3-NT7, YC10.3-NT10
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
