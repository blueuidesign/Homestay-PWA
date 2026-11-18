# Luật chung của nghiệp vụ

Luật dùng ở hai YC trở lên mà không thuộc QT (tính toán có ví dụ số), PQ (quyền), HV (hành vi mọi màn), Tu_dien (từ ngữ, danh sách lựa chọn). Luật chỉ một YC dùng nằm trong YC đó, mục "Quy tắc của nhóm" (QD-021). YC trỏ tới đây bằng số mục hay tên in đậm.

Mỗi luật ghi YC nào dùng. Sửa một luật ở đây thì soát các YC đó.

## 1. Luật nền

### 1.1 Ngày và đêm
- Ngày nghiệp vụ theo giờ Việt Nam, kể cả "hôm nay" ở database.
- Một lần ở chiếm các đêm từ ngày nhận tới trước ngày trả. Nhận 10/10, trả 12/10 là hai đêm: 10/10 và 11/10. Khách trả ngày 12/10 và khách nhận ngày 12/10 không trùng nhau (QT2.1).
- Đêm cuối tuần mặc định là đêm thứ Sáu và thứ Bảy; mỗi chủ nhà đổi được, phải chọn ít nhất một đêm (YC4.6).

Dùng ở: mọi YC.

### 1.2 Tiền
- Tiền là số nguyên đồng, không có phần lẻ. Giá tính theo đêm.
- Cách viết số tiền trên màn: `Tu_dien.md`, mục Viết số tiền.

Dùng ở: mọi YC.

### 1.3 Giá chủ nhà của một đêm
Theo thứ tự ưu tiên:
1. Có giá dịp (ngày lễ hay dịp đặc biệt) phủ đêm đó: lấy giá dịp.
2. Căn tự nhập: giá cuối tuần hay giá ngày thường sale đã ghi cho căn.
3. Giá tháng của tháng chứa đêm đó: giá cuối tuần nếu là đêm cuối tuần, không thì giá ngày thường.
4. Không có gì: không có giá. Màn hiện "Chưa có giá" hay "Chưa đặt", không hiện 0.

Ví dụ số: QT4.1. Dùng ở: YC2, YC4, YC5, YC7, YC9, YC10.

### 1.4 Giá bán của sale
Giá bán một đêm = giá chủ nhà của đêm đó + mức cộng của sale cho căn đó; căn chưa có mức cộng riêng thì dùng mức cộng mặc định của sale (YC7.5). Sale bật "làm tròn 50 nghìn" thì làm tròn lên từng đêm rồi mới cộng các đêm (giả định GD13). Chủ nhà và khách không thấy mức cộng.

Đặt phòng đã có giữ giá bán của riêng nó: chủ nhà đổi tiền phòng thì giá bán không tính lại (YC5.6).

Dùng ở: YC5, YC7, YC8, YC9, YC10, YC11.

### 1.5 Lỗi
- Database từ chối bằng một câu tiếng Việt viết cho người dùng, ví dụ "Căn này đã được đặt rồi". App hiện nguyên câu đó, có thể kèm việc làm tiếp.
- Lỗi khác (mất mạng, lỗi không lường trước): app hiện câu chung theo HV2, không hiện chữ kỹ thuật.
- Câu báo lỗi luôn nói: chuyện gì, vì sao, làm gì tiếp.
- Người không có quyền với một bản ghi nhận câu "Không tìm thấy…", giống như bản ghi không tồn tại, để không lộ là nó có.

Dùng ở: mọi YC.

### 1.6 Chống gửi trùng
Mỗi lần người dùng bấm một việc ghi (thêm căn, đặt phòng, yêu cầu, mở app), app sinh một mã lần gửi và gửi kèm. Mạng rớt, app gửi lại cùng mã: database trả kết quả đã có, không ghi lần thứ hai.

Dùng ở: YC3, YC5, YC9, YC10, YC12.

### 1.7 Ảnh
- Ảnh nằm ở kho file riêng tư; chỉ mở được bằng đường dẫn có hạn do database cấp (1 giờ).
- App tải ảnh lên ngay khi chọn, rồi gắn vào căn theo thứ tự khi lưu. Mỗi căn tối đa 12 ảnh, ảnh đầu là ảnh đại diện.
- Chỉ người giữ căn và sale được chia sẻ căn đó mở được ảnh căn. Ảnh căn tự nhập chỉ sale tạo căn mở được.

Dùng ở: YC1, YC3, YC7, YC8, YC10.

### 1.8 Thông báo
- Database ghi thông báo khi dữ liệu đổi; app không tự ghi. Loại, người nhận, chữ: YC12.
- Thông báo chỉ chép những gì người nhận được thấy (PQ19).

Dùng ở: YC5, YC6, YC8, YC9, YC11, YC12.

### 1.9 Link
- Link mời của chủ nhà hết hạn sau 21 ngày, thu hồi được. Ai có link cũng mở xem trước được khi chưa đăng nhập, và không thấy giá (QD-008).
- Mỗi sale có một link xin lịch, gửi cho nhiều chủ nhà. Mở link xin lịch phải đăng nhập, vì màn đó có tên và số điện thoại của sale.
- Link trên PWA là đường dẫn https của app (PWA.md P4).

Dùng ở: YC1, YC6.

### 1.10 Giới hạn độ dài
Giới hạn từng ô ghi ở mục Luật kiểm của YC có ô đó. Database chặn bằng ràng buộc; màn nhập chặn ở cùng con số.

## 2. Quy tắc dùng chung

| Tên | Quy tắc | Dùng ở |
|---|---|---|
| **Trạng thái tiền đặt phòng** | Mỗi đặt phòng có một trong ba trạng thái: "Chưa cọc", "Đã cọc · còn thu" (nhãn kèm số tiền cọc, ví dụ "Cọc 1.000.000đ"), "Đã thanh toán". Tiền còn lại = tiền phòng − tiền cọc, tính lúc hiện, không lưu. Đặt phòng sale tự ghi cho căn tự nhập không có trạng thái tiền | YC2, YC5, YC11, YC12 |
| **Chủ nhà chỉ làm việc với sale** | Với đặt phòng có sale đứng tên, chủ nhà làm việc với sale, không với khách. Tên, số khách do ai nhập chỉ người đó thấy (QD-011) | YC5, YC9 |
| **Tòa nhà dùng chung** | Một danh sách tòa cho mọi người. Home247 đặt sẵn (YC13; bản 1 nạp bằng seed). Người dùng thêm tòa mới không cần duyệt, tòa đó hiện cho mọi người. Gõ tên trùng thì app gợi ý tòa đã có, người dùng vẫn thêm mới được, trừ tên giống hệt (không phân biệt hoa thường) thì dùng tòa đã có (giả định GD21); quản trị viên gộp tòa trùng sau (Tùng, bản Zalo, 04/11/2026, điểm 4) | YC3, YC10, YC13 |
| **Căn tự nhập không có lịch** | App không biết lịch của căn tự nhập. Ô ngày ghi "?", không bao giờ ghi "trống" hay giá; ô có đặt phòng sale tự ghi ghi "Bạn". Kết quả tìm phòng để căn tự nhập ở nhóm riêng "TỰ NHẬP · chưa biết lịch". Muốn biết còn trống thì gọi chủ căn | YC7, YC10 |
| **Người đã xóa tài khoản** | Xóa tài khoản chỉ bỏ số điện thoại và đánh dấu đã xóa; căn, ảnh, lịch, giá, tiền, đặt phòng, yêu cầu giữ nguyên (QD-013). Ở mọi chỗ người khác còn thấy tên người đó: tên cũ kèm ghi chú nhỏ màu đỏ "Đã xoá tài khoản", không số điện thoại, không nút gọi, nhắn. Sale không còn thấy căn, lịch, giá của chủ nhà đã xóa tài khoản và không đặt, không gửi yêu cầu vào căn đó; mở từ màn cũ thì HV5 lý do "Chủ nhà đã xóa tài khoản". Đặt phòng đã có vẫn chiếm đêm, vẫn tính thống kê cả hai bên. Yêu cầu đang chờ giữ nguyên, vẫn hết hạn sau 14 ngày. Chủ nhà không đổi phạm vi, quyền xem cho sale đã xóa tài khoản. Người đó nhập lại số thì dùng lại như trước, kết nối cũ nối lại, không phải mời lại | YC1, YC5, YC6, YC7, YC9, YC10, YC11, YC12 |
