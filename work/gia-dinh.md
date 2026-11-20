# Giả định đang dùng

Chỗ ghi "(giả định GD<số>)" trong YC hay luật chung là lựa chọn tạm để làm tiếp được khi đặc tả chưa nói. Code theo được, nhưng phải ghi trong PR. Tùng chốt khác thì sửa chỗ đó, ghi QD hay đánh dấu câu hỏi đã trả lời, và gạch dòng ở đây. Mã GD không dùng lại (CL3).

| Mã | Giả định | Trạng thái |
|---|---|---|
| GD2 | Bản đầu chỉ cần báo trong app, chưa cần OA (YC12.4) | dang-dung |
| GD11 | Chủ nhà tự ghi booking trùng đêm với yêu cầu đang chờ thì yêu cầu đó cũng thành Bị từ chối, như khi chủ chấp nhận yêu cầu khác | dang-dung |
| GD12 | Booking chỉ có tổng tiền (căn tự nhập) thì tiền chênh chia đều cho các đêm khi chia theo tháng (QT3.2) | dang-dung |
| GD13 | Làm tròn giá bán lên 50.000đ từng đêm, rồi cộng các đêm (YC7.5) | dang-dung |
| GD14 | Nhãn "Mới thêm" ở thẻ căn hiện trong 24 giờ sau khi thêm (YC3.2-NT6) | dang-dung |
| GD15 | "Gần nhau" của quy tắc Gom thông báo là trong 10 phút (CH-055) | dang-dung |
| GD16 | Ô ngày ở lịch của sale hiện giá bán đã cộng mức cộng (YC7.1) | dang-dung |
| GD17 | "Tìm gần đây" lưu ở server, mỗi sale 5 lần (YC7.2) | dang-dung |
| GD18 | (không dùng) | bo |
| GD19 | Mở form ghi đặt phòng thì chip "Chưa cọc" chọn sẵn (YC5) | dang-dung |
| GD20 | Tiền cọc không được lớn hơn tiền phòng; vượt thì không lưu, báo "Tiền cọc không được lớn hơn tiền phòng" (YC5, CH-024) | dang-dung |
| GD21 | Thêm tòa có tên trùng một tòa đã có (không phân biệt hoa thường) thì dùng tòa đã có, không tạo tòa thứ hai. Tùng 04/11 (bản Zalo): "Gõ một toà đã có thì gợi ý toà đã có sẵn để chọn, người dùng vẫn tự ý thêm mới được": hiểu là tên khác cách viết vẫn thêm được, tên giống hệt thì dùng tòa đã có (YC3) | dang-dung |
| GD22 | Điểm 11 của Tùng (04/11/2026, bản Zalo) ghi "S6-02" nhưng S6-02 là màn Thêm căn tự nhập; hiểu ý là chi tiết căn của sale: S6-07 cho căn của tôi, S6-03 cho căn tự nhập (YC7.3) | dang-dung |
| GD23 | Màn chưa thiết kế ở YC10: sau bỏ nguồn và sau xóa căn tự nhập thì về S6; sửa căn tự nhập dùng lại S6-02 điền sẵn, nút "Lưu thay đổi" | dang-dung |
| GD24 | (không dùng) | bo |
| GD25 | Câu trạng thái của đặt phòng chủ nhà ghi giúp ở S7-03: "Chị Hoa đã ghi giúp bạn" (YC11.3) | dang-dung |
| GD26 | Mục "CHỜ CHỦ NHÀ CHẤP NHẬN" ở thống kê sale gồm mọi yêu cầu đang chờ, không theo tháng (YC11.2) | dang-dung |
| GD27 | Chữ của các loại thông báo chưa có trên hình theo bảng ở YC12 | dang-dung |
| GD28 | Nhắc đặt phòng chưa cọc ghi lúc 08:00 giờ Việt Nam (YC12.3) | dang-dung |
| GD29 | Tắt một loại thông báo không xóa thông báo cũ loại đó (YC12.4) | dang-dung |
| GD30 | Tên file CSV "home247-dat-phong-<từ ngày>-<đến ngày>.csv" (YC1.6) | dang-dung |
| GD31 | Địa chỉ Zalo OA của Home247 tạm là https://zalo.me/home247, đổi bằng biến VITE_ZALO_HOME247 (YC1.7); Tùng cần cho địa chỉ thật, xem work/cho-tung.md | dang-dung |
| GD32 | Công tắc "Sale xin xem lịch" ở P3 vẫn hiện và lưu được dù bản 1 chưa có nguồn sinh thông báo loại đó (YC12.4, YC12-H2) | dang-dung |
| GD33 | Lần mở app đầu tiên của một người (chưa có mốc lần mở) thì popup gồm mọi thông báo chưa đọc, rồi mới ghi mốc (YC12.1) | dang-dung |
