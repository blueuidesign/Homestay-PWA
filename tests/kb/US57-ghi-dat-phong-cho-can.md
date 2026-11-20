---
id: US57-KB
us: US57
rev: 1
---
# Kịch bản test tay US57 · Ghi đặt phòng cho căn tự nhập

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Sale Hùng (2 căn của mình: Green Bay 0812, Mường Thanh 1605; nguồn: Chị Hoa, Anh Tuấn; căn tự nhập Villa Tuần Châu của chú Bình), Sale Lan. Villa Tuần Châu giá chủ 1.400.000đ, giá bán của Hùng 1.600.000đ.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US57-KB1 · Ghi đặt phòng `[Chính]`
- **Mục đích:** sale ghi lại đặt phòng đã chốt qua điện thoại để tính tiền lời.
- **Làm:** mở Villa Tuần Châu, bấm "Đặt phòng". Chọn "Mai", 1 đêm. Xem tiền. Sửa "Thu khách" thành 1.700.000đ. Bấm "Đặt phòng". Mở lịch 7 ngày.
- **Mong đợi:** dòng ngày ghi "… → … (1 đêm)". Tiền điền sẵn 1.400.000đ và 1.600.000đ, "Bạn lời 200.000đ"; sửa thì "Bạn lời 300.000đ". Lưu xong về màn căn, có đặt phòng mới, toast ghi tháng. Ô đêm đó trên lịch ghi "Bạn", các ô khác "?".
- **Nguồn:** YC10.4-NT1, YC10.4-NT2, YC10.4-NT3, YC10.4-NT4, YC10.4-NT7
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US57-KB2 · Sửa và xóa đặt phòng đã ghi `[Chính]`
- **Làm:** chạm đặt phòng vừa ghi, đổi "Thu khách" thành 1.800.000đ, bấm "Lưu thay đổi". Bấm "Xóa đặt phòng" một lần, rồi xác nhận.
- **Mong đợi:** đặt phòng lưu 1.800.000đ, ngày không đổi. Bấm xóa lần đầu chỉ hỏi lại; xác nhận thì đặt phòng biến mất, ô đêm đó về "?".
- **Nguồn:** YC10.4-NT8, YC10.4-NT9
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US57-KB3 · Đêm trùng, mạng yếu `[Biên]`
- **Làm:** ghi tiếp một đặt phòng chồng đêm đã ghi. Lan ghi căn tự nhập Villa Tuần Châu của Lan cùng đêm. Tắt mạng rồi bấm "Đặt phòng"; mở màn khi mạng chậm.
- **Mong đợi:** chồng đêm thì báo "Bạn đã ghi đặt phòng cho căn này đêm …", không lưu; của Lan thì lưu được. Mạng chậm thấy khung đang tải; mất mạng có báo và nút thử lại, không mất chữ đã nhập.
- **Nguồn:** YC10.4-NT5, YC10.4-NT6, HV1-NT1, HV2-NT1, HV2-NT2
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
