# Câu hỏi mở về sản phẩm

Hàng đợi chờ Tùng trả lời. Một câu một khối. Mã `YC<n>-H<m>` (hay `QT<n>-H<m>`, `HV<n>-H<m>`, `PQ<n>-H<m>` cho luật chung) không đổi, không dùng lại (CL3). Dựng lại ngày 18/11/2026 theo QD21: câu `CH-xxx` của bản PWA cũ đổi sang mã của YC đang chờ câu trả lời, ba câu lớn chuyển thành QD22, QD23, QD24; bảng đổi mã ở cuối file.

Cách ghi:
- Câu mới: thêm khối ở cuối nhóm, số lớn nhất của nhóm đó cộng 1 (skill ghi-viec-moi). Ghi chỗ gắn, việc bị chặn. Gắn `[MỞ: <mã>]` vào đúng câu trong YC nếu câu hỏi chặn việc.
- Tùng trả lời trong phiên "Tôi là Tùng": đưa câu trả lời vào thân YC (đổi nghĩa thì tăng bản theo CL6), bỏ thẻ `[MỞ]`, đổi trạng thái sang `da-tra-loi`, ghi ngày và câu nguyên văn dưới khối (skill chot-quyet-dinh).
- Câu có nhiều phương án thật và chạm nhiều YC thì chuyển thành QD cho-chot, khối này ghi "chuyển sang QDn".
- Trạng thái: `mo`, `mot-phan`, `da-tra-loi`.

## YC1

### YC1-H1 · da-tra-loi
Ô "Họ và tên" sửa được không?
Gắn ở: YC1.4. Tới khi có câu trả lời: chỉ xem.
Trả lời: Claude tự chốt, 19/11/2026 (QD25, Tùng: "những phần có thể suy luận bằng logic này thì bạn cứ tự làm nhé, tự nghiên cứu, tự quyết."): sửa được, luật kiểm như ở A2. Canvas PWA vẽ ô sửa được ở P2.

### YC1-H2 · mo
Xuất CSV: đặt phòng thuộc khoảng thời gian đã chọn theo ngày nhận, hay theo có đêm nằm trong khoảng?
Gắn ở: YC1.6. Tới khi có câu trả lời: theo ngày nhận (khớp DLM.

### YC1-H3 · mo
Xuất CSV: file có gồm đặt phòng đã hủy không (QD12)?
Gắn ở: YC1.6.

### YC1-H4 · mo
Xuất CSV: chọn "Tất cả" có gồm căn đã xóa không (hàng chip chỉ có căn chưa xóa)?
Gắn ở: YC1.6.

### YC1-H5 · mo
Xuất CSV: sale có căn của tôi (QD5) xuất được file cho căn đó không?
Gắn ở: YC1.6.

### YC1-H6 · da-tra-loi
Người dùng xóa tài khoản trên PWA ở đâu, xác nhận thế nào? Bản Zalo nhận sự kiện người dùng gỡ quyền của app từ Zalo, PWA không có.
Chặn: Màn Cá nhân. Đang tạm làm: `fn_xoa_tai_khoan` đã có, chưa có màn. Hỏi ngày 18/11/2026.
Trả lời: Claude tự chốt, 19/11/2026 (QD25, Tùng: "những phần có thể suy luận bằng logic này thì bạn cứ tự làm nhé, tự nghiên cứu, tự quyết."): nút "Xóa tài khoản" ở cuối P2, mở P14 liệt kê điều gì mất và điều gì còn, bấm lần hai ở P14-01 mới xóa (canvas PWA, PR #10).

### YC1-H7 · mo
Chính sách quyền riêng tư phải nói giữ dữ liệu gì sau khi người dùng xóa tài khoản, giữ bao lâu, để làm gì?
Gắn ở: YC1.8.

### YC1-H8 · mo
Ảnh đại diện, tên và số chủ căn tự nhập, tên và số khách do người xóa nhập có bị xóa không?
Gắn ở: YC1.8.

### YC1-H9 · mo
File xuất CSV có cột "Khách", "SĐT" (chỉ khách chủ nhà tự nhập, QD11): giữ hai cột này hay bỏ?
Gắn ở: YC1.6.

### YC1-H10 · mo
P4 có "Hướng dẫn sử dụng" nhưng P9 chỉ có phần "CHỦ NHÀ". Sale chưa có hướng dẫn.
Gắn ở: YC1.7.

### YC1-H11 · mo
Đổi giờ nhận, trả mặc định có đổi booking đã ghi không, và sale đã gửi khách thì thế nào. Ngoài ra căn có giờ riêng không (P5 nói áp dụng cho tất cả căn).
Gắn ở: YC1.

### YC1-H12 · da-tra-loi
Mã đăng nhập gửi về email: mấy chữ số, còn hạn bao lâu, bao lâu mới được bấm "Gửi lại mã", nhập sai mấy lần thì phải xin mã mới? Đề xuất theo mặc định của Supabase: 6 chữ số, hạn 1 giờ, gửi lại sau 60 giây.
Gắn ở: YC1.2 bước 2, 3. Chặn: màn nhập mã (US2). Hỏi ngày 19/11/2026.
Trả lời (Claude tự chốt, 19/11/2026, theo lời Tùng giao tự quyết: "Theo tôi những phần có thể suy luận bằng logic này thì bạn cứ tự làm nhé, tự nghiên cứu, tự quyết. Tôi muốn app lên nhanh nhất có thể, tôi sẽ test và điều chỉnh lại sau. Miễn là bạn update tài liệu đầy đủ là được."): Mã 6 chữ số, còn hạn 1 giờ, gửi lại sau 60 giây (mặc định của Supabase). Nhập sai thì nhập lại được tới khi mã hết hạn, theo giới hạn sẵn có của Supabase.

### YC1-H13 · da-tra-loi
Số điện thoại nhập lúc đăng ký trùng với số của một tài khoản khác thì sao: cho đăng ký (hai tài khoản cùng số), hay báo "Số này đã có tài khoản" và không cho? Số không xác minh bằng mã (QD22).
Gắn ở: YC1.2 bước 4. Chặn: lệnh đăng ký (US2). Hỏi ngày 19/11/2026.
Trả lời (Claude tự chốt, 19/11/2026, theo lời Tùng giao tự quyết: "Theo tôi những phần có thể suy luận bằng logic này thì bạn cứ tự làm nhé, tự nghiên cứu, tự quyết. Tôi muốn app lên nhanh nhất có thể, tôi sẽ test và điều chỉnh lại sau. Miễn là bạn update tài liệu đầy đủ là được."): Một số điện thoại chỉ đăng ký một tài khoản. Số đã có tài khoản khác thì database từ chối và màn đăng ký báo số đã có tài khoản.

## YC2

### YC2-H1 · mo
Đổi chip lọc căn thì số tiền và số đêm có đổi theo căn không?
Gắn ở: YC2.3. Tới khi có câu trả lời: khối luôn là tổng mọi căn.

### YC2-H2 · mo
Lịch tuần nhiều căn: ô trống của đêm chủ nhà chưa đặt giá hiện gì?
Gắn ở: YC2.5. Tới khi có câu trả lời: ô để trống.

### YC2-H3 · mo
Danh sách đặt phòng sắp tới: đặt phòng đã hủy có hiện với nhãn "Đã hủy" không?
Gắn ở: YC2.4. Tới khi có câu trả lời: không hiện.

### YC2-H4 · mo
Chuyển giữa lịch tháng (CN1) và lịch tuần (CN2) bằng gì? (a) nút đổi; (b) tự đổi theo số căn.
Gắn ở: YC2.5.

### YC2-H5 · mo
Ô "Có khách hôm nay", "Trống tối T7" ở CN2 tính cho hôm nay hay cho tuần đang xem?
Gắn ở: YC2.5. Tới khi có câu trả lời: "Có khách hôm nay" tính theo hôm nay, "Trống tối T7" theo thứ Bảy của tuần đang xem, "Chưa cọc" theo các đặt phòng có đêm trong tuần đang xem.

### YC2-H6 · mo
Chạm một ngày đã qua ở lịch tháng thì mở gì?
Gắn ở: YC2.2. Tới khi có câu trả lời: mở chi tiết ngày như ngày khác, nút "Đặt phòng" vẫn có (ghi bù được, YC5).

## YC3

### YC3-H1 · mo
Chủ nhà thêm căn mới khi đã chia sẻ "tất cả căn" cho sale: có báo cho sale không?
Gắn ở: YC12, YC3, YC6.7.

### YC3-H3 · mo
Nút xóa căn đặt ở đâu, xóa xong về màn nào?
Gắn ở: YC3.6.

### YC3-H4 · mo
Bỏ một ảnh ở CN5-02 có hỏi lại không?
Gắn ở: YC3.5. Tới khi có câu trả lời: không hỏi (ảnh chỉ thật sự bị bỏ khi bấm "Lưu thay đổi").

### YC3-H5 · mo
Tòa nhà người dùng tự thêm thì khu vực của tòa ghi gì?
Gắn ở: YC3.4. Tới khi có câu trả lời: tòa mới không có khu vực.

### YC3-H6 · mo
Tạo căn có dùng mã lần gửi để chống gửi trùng không (hiện chỉ dựa vào luật mã căn không trùng)?
Gắn ở: YC3.2.

### YC3-H7 · mo
Chọn được nhiều loại view cho một căn không?
Gắn ở: YC3.4.

### YC3-H8 · mo
Xóa căn có hỏi lại một lần không? Gợi ý: có, như xóa đặt phòng.
Gắn ở: YC3.6.

## YC4

### YC4-H1 · mo
Sao chép giá sang căn khác: chép giá của năm đang xem, hay mọi năm có giá?
Gắn ở: YC4.5. Tới khi có câu trả lời: chép năm đang xem ở tab Giá.

### YC4-H2 · mo
Giá ngày lễ, dịp đặc biệt: sửa, xóa một dải đã lưu thế nào?
Gắn ở: YC4.3.

### YC4-H3 · mo
Đặt giá ngày lễ, dịp đặc biệt cho nhiều căn: chưa có màn?
Gắn ở: YC4.4.

### YC4-H4 · mo
Lưu ngày tính giá cuối tuần xong thì về Cá nhân với toast "Đã lưu ngày tính giá cuối tuần" phải không (chưa có hình)?
Gắn ở: YC4.6.

### YC4-H5 · mo
Sau khi lưu giá ở tab Giá của căn, ở lại tab Giá hay quay về màn trước?
Gắn ở: YC4.2. Tới khi có câu trả lời: ở lại tab Giá.

### YC4-H6 · mo
Bỏ trống tên khi bật "Là ngày lễ" thì tên tự đặt là gì?
Gắn ở: YC4.3.

## YC5

### YC5-H1 · mo
Form đặt phòng: nhập tên một khách mới chưa có trên hàng chip "Khách / Sale" bằng cách nào?
Gắn ở: YC5.2.

### YC5-H2 · mo
Form đặt phòng chưa có ô số điện thoại khách: có thêm ô không?
Gắn ở: YC5.3.

### YC5-H3 · mo
Tiền phòng 0 đồng (chủ nhà cho người quen ở miễn phí) có được ghi không?
Gắn ở: YC5.6. Tới khi có câu trả lời: database chặn.

### YC5-H4 · mo
Đổi căn của đặt phòng có sale: căn mới có phải nằm trong các căn sale được xem không?
Gắn ở: YC5.6.

### YC5-H5 · mo
Đổi người đặt (giữa khách lẻ và sale, hay sang sale khác)?
Gắn ở: YC5.6. Tới khi có câu trả lời: ô người đặt khóa ở form sửa.

### YC5-H6 · mo
Đổi trạng thái tiền bằng tay thì bỏ trạng thái nhớ để hoàn tác, hay giữ nút "Hoàn tác"?
Gắn ở: YC5, YC5.6.

### YC5-H7 · mo
Sửa, ghi đã thu đủ khi đặt phòng đang chờ hủy hay đã hủy?
Gắn ở: YC5.8.

### YC5-H8 · mo
Chỉ đổi tiền phòng mà giữ ngày thì tiền từng đêm chia lại theo bảng giá lúc nào?
Gắn ở: YC5.6.

### YC5-H9 · mo
Chỉ sửa ghi chú hay khách thì sale có được báo không?
Gắn ở: YC5.6.

### YC5-H10 · mo
Giá bán nhỏ hơn tiền phòng (tiền chênh âm) được không, và sale đã bị ngừng có sửa giá bán không?
Gắn ở: YC5.9.

### YC5-H11 · mo
Màn phía sale (thông báo, chi tiết đặt phòng, sửa giá bán) chưa có hình?
Gắn ở: YC5.9.

### YC5-H12 · mo
Chủ nhà ghi tên, số khách cho đặt phòng có sale ở đâu?
Gắn ở: YC5.2. Tới khi có câu trả lời: chọn sale thì không nhập được tên khách.

### YC5-H13 · mo
Giá bán điền sẵn khi chủ nhà ghi giúp sale có làm tròn lên 50.000đ khi sale bật làm tròn không?
Gắn ở: YC5, YC5.4.

### YC5-H14 · mo
Có xin hủy được đặt phòng đã qua ngày trả không?
Gắn ở: YC5.8.

### YC5-H15 · mo
Sale đã bị ngừng cho xem xin hủy được không?
Gắn ở: YC5.8.

### YC5-H16 · mo
Bên kia của đặt phòng đã xóa tài khoản thì xin hủy thế nào (không ai đồng ý được)?
Gắn ở: YC5.8.

### YC5-H17 · mo
Vị trí nút "Xin hủy" và khối trả lời ở chi tiết đặt phòng của chủ nhà (CN3-02) và của sale: chưa có hình?
Gắn ở: YC5.8.

### YC5-H18 · mo
Xin hủy hết hạn sau bao lâu, và hết hạn thì đặt phòng thành gì?
Chặn: Việc nền tự hết hạn xin hủy. Đang tạm làm: Xin hủy không hết hạn. Hỏi ngày 18/11/2026.

### YC5-H19 · mo
Chọn "Đã cọc · còn thu" thì số tiền cọc có bắt buộc không?
Gắn ở: YC5.2. Tới khi có câu trả lời: ô để trống vẫn lưu được.

## YC6

### YC6-H1 · mo
Chủ nhà ngừng được sale đã xóa tài khoản không?
Gắn ở: YC6.2.

### YC6-H2 · mo
Sale có thu hồi được link xin lịch của mình không, ở đâu?
Gắn ở: YC6.4.

### YC6-H3 · mo
Kết nối đã tạo từ link đã thu hồi còn dùng không?
Gắn ở: YC6.3.

### YC6-H4 · mo
Chủ nhà mở dòng chưa kết nối, đã ngừng thì thấy gì?
Gắn ở: YC6.2. Tới khi có câu trả lời: mở được với những gì có.

### YC6-H5 · mo
Người tạo link mời đã xóa tài khoản thì người mở link thấy gì?
Gắn ở: YC6.3. Tới khi có câu trả lời: coi như link không dùng được.

### YC6-H6 · mo
Có thông báo khi sale tự bấm "Thêm lịch" không (cho sale, cho chủ nhà)?
Gắn ở: YC6.3. Tới khi có câu trả lời: không.

### YC6-H7 · mo
Sale đã kết nối nhận thêm link gửi lịch thì phạm vi có đổi không?
Gắn ở: YC6.6. Tới khi có câu trả lời: giữ phạm vi cũ.

### YC6-H8 · mo
Gửi lịch theo căn: chưa chọn căn nào thì nút gửi có bấm được không?
Gắn ở: YC6.6.

### YC6-H9 · mo
Chủ nhà có thu hồi được link gửi lịch theo căn không?
Gắn ở: YC6.6.

### YC6-H10 · mo
Chủ nhà thu hồi link mời ở màn nào; người mở link đã hết hạn hay đã thu hồi thấy gì?
Chặn: Màn Thêm lịch khi link hỏng. Đang tạm làm: Hiện "Link mời không còn dùng được" hoặc "Link mời đã hết hạn". Hỏi ngày 18/11/2026.

### YC6-H11 · mo
Sale chủ nhà thêm tay bằng tên và số (CN7-05) ghép với tài khoản thật của sale thế nào? (a) ghép khi số điện thoại trùng; (b) chỉ ghép qua link; (c) chủ gộp tay.
Gắn ở: YC6.2. Tới khi có câu trả lời: không ghép, không chặn số trùng.

### YC6-H12 · mo
Chủ nhà từ chối lời xin xem lịch ở A8 thì sale có được báo không?
Gắn ở: YC6.5.

### YC6-H13 · mo
Nút "Nhắc lại" ở CN7 và "Gửi link cho chủ nhà khác" ở A7 làm gì?
Gắn ở: YC6.2, YC6.4. Tới khi có câu trả lời: mở lại A6.

### YC6-H14 · mo
Tài khoản chọn vai chủ nhà mở link xin lịch của sale, hay vai sale bấm đồng ý ở A8: xử lý thế nào?
Gắn ở: YC6.3.

### YC6-H15 · mo
Người tạo link tự bấm link của mình (chủ nhà mở link mời sale của chính họ, sale mở link xin kết nối của chính họ): chặn, bỏ qua, hay coi như thường? Nguồn chưa nói. Thêm ngày 2026-11-04.
Gắn ở: YC6.3.

### YC6-H16 · mo
Chủ nhà có xem lại và xóa được dòng kết nối đã dừng (sale thêm tay chưa kết nối, sale đã bị ngừng) không?
Gắn ở: YC6.2.

## YC7

### YC7-H1 · mo
Tìm phòng: có cho chọn ngày nhận trước hôm nay không?
Gắn ở: YC7.2. Tới khi có câu trả lời: không chọn được ngày trước hôm nay.

### YC7-H2 · mo
Chip tòa "Khác" ở màn tìm phòng làm gì?
Gắn ở: YC7.2.

### YC7-H3 · mo
Lọc "Giá mỗi đêm" ở màn tìm phòng làm gì?
Gắn ở: YC7.2.

### YC7-H4 · mo
Kết quả tìm phòng: lịch tuần S4 bắt đầu từ ngày nào?
Gắn ở: YC7.3. Tới khi có câu trả lời: từ ngày nhận.

### YC7-H5 · mo
"Tìm gần đây": tìm hai lần cùng điều kiện thì ghi hai dòng hay một?
Gắn ở: YC7.2. Tới khi có câu trả lời: lần tìm trùng đưa lên đầu, không thêm dòng.

### YC7-H6 · mo
Mở S3 từ lịch 7 ngày (không có ngày khách hỏi) thì ngày ở là gì?
Gắn ở: YC7.4. Tới khi có câu trả lời: hôm nay, 1 đêm.

### YC7-H7 · mo
Sale đã đặt mức cộng riêng cho một căn: quay về dùng mức cộng mặc định bằng cách nào?
Gắn ở: YC7.4. Tới khi có câu trả lời: chip "Mặc định" đầu hàng.

### YC7-H8 · mo
Tab Lịch của sale chưa có nguồn phòng nhưng đã gửi link xin lịch: hiện A5 hay A7? YC7.1-NT1 nói A5 khi chưa có nguồn phòng; A7 và A7-00 ghi "Vào từ: tab Lịch của sale chưa có nguồn", A7-00 ghi "gần giống A5, có thể gộp". Thêm: hai nút "Gửi link cho chủ nhà khác", "Thêm căn tự nhập" ở A7 chưa nối màn nào trong A7, còn A7-01 vẽ nút "Gửi link cho chủ nhà khác" mở A6 (YC6.4 bước 5 ghi chưa vẽ). Phương án: a) chưa gửi lần nào thì A5, đã gửi thì A7 (bả
Gắn ở: YC7.1. Tới khi có câu trả lời: A5.

### YC7-H9 · mo
"Bán nhiều nhất" (sắp xếp) đếm theo gì: booking đã chấp nhận, doanh số hay số lần gửi khách.
Gắn ở: YC7.

## YC8

### YC8-H1 · mo
Gửi khách: mỗi lần gửi tối đa bao nhiêu căn?
Gắn ở: YC8.1. Tới khi có câu trả lời: 10 căn.

### YC8-H2 · mo
Chủ nhà đổi ngày một đặt phòng (YC5.6) sang đêm của lần gửi có tính là "vừa có người đặt" để báo sale không?
Gắn ở: YC8.

### YC8-H3 · mo
Sao chép chữ (không qua bảng chia sẻ) có ghi lần gửi để báo khi căn có người đặt không?
Gắn ở: YC8.1.

### YC8-H4 · mo
Căn chưa có giá cho một đêm trong khoảng thì chữ ghi gì?
Gắn ở: YC8.1. Tới khi có câu trả lời: ghi "Giá: hỏi lại".

### YC8-H5 · da-tra-loi
Sale gửi căn cho khách thế nào trên PWA? Bản Zalo dùng cửa sổ chia sẻ của Zalo (YC8.1). Đề xuất: nút "Gửi cho khách" mở bảng chia sẻ của điện thoại (Web Share API) với chữ và ảnh; sale chọn Zalo trong bảng đó. Điện thoại không hỗ trợ chia sẻ ảnh thì chép chữ và tải ảnh về.
Chặn: Màn gửi khách. Đang tạm làm: Chưa làm. Hỏi ngày 18/11/2026.
Trả lời: Tùng, 19/11/2026 (thread design): "Gửi qua Zalo thì thành "Chia sẻ" sau này có thể gửi trong app luôn, bên kia nhận được luôn." Nút gửi đều mở bảng chia sẻ của điện thoại, chữ nút bắt đầu bằng "Chia sẻ". Bước chọn sale ở CN10 chỉ để nhắc người nhận, link dùng được cho sale nào mở (Claude tự chốt, QD25).

### YC8-H6 · mo
Số ảnh gửi mỗi lần. Căn có thể có tới 12 ảnh (YC3, YC4), còn S5 ghi "Gửi 6 ảnh qua Zalo". Cửa sổ chia sẻ của Zalo nhận tối đa 10 ảnh một lần. Căn có 12 ảnh thì sale gửi sao: chọn ảnh, chia hai lần, hay chỉ gửi 10 ảnh đầu. Thiết kế chưa vẽ chọn ảnh.
Gắn ở: YC8.1. Tới khi có câu trả lời: gửi 10 ảnh đầu.

### YC8-H7 · mo
Có hiện nhãn "Đã gửi" trên căn đã gửi khách, và có đếm lần gửi cho thống kê không?
Gắn ở: YC8.

## YC9

### YC9-H1 · mo
Sale gửi yêu cầu với ngày nhận trước hôm nay thì sao?
Gắn ở: YC9.1.

### YC9-H2 · mo
Có đêm chủ nhà chưa đặt giá thì sale gửi yêu cầu được không, giá ghi gì?
Gắn ở: YC9.1.

### YC9-H3 · mo
Sale bị ngừng còn đọc được yêu cầu cũ của mình với chủ nhà đó không?
Gắn ở: YC9.4.

### YC9-H4 · mo
Chấp nhận khi sale đã bị ngừng hay đã bỏ nguồn sau lúc gửi?
Gắn ở: YC9.2.

### YC9-H5 · mo
Chủ nhà chấp nhận yêu cầu khi ngày nhận đã qua thì sao?
Gắn ở: YC9.2.

### YC9-H6 · mo
Thông báo cho chủ nhà khi sale hủy yêu cầu, và thông báo yêu cầu cũ chủ nhà đã nhận còn giữ không?
Gắn ở: YC12, YC9.4.

### YC9-H7 · mo
Tiêu đề màn S3-02 ("Đặt phòng" trùng chữ nút của chủ nhà)?
Gắn ở: YC9.1, YC9.4.

### YC9-H8 · mo
Chủ nhà chưa cho số thì hai nút "Nhắn chủ nhà qua Zalo", "Gọi chủ nhà" làm gì?
Gắn ở: YC9.1.

### YC9-H9 · mo
"Đã bán 12 đặt phòng của bạn" ở CN9 đếm những đặt phòng nào?
Gắn ở: YC9, YC9.4.

### YC9-H10 · mo
CN9 có ba chip lý do "Đã có khách đặt", "Đang sửa phòng", "Lý do khác" (Tùng duyệt 02/11/2026, bản Zalo). Còn mở: chọn "Lý do khác" có ô nhập chữ không, và có bắt buộc chọn lý do không?
Gắn ở: YC9.2. Tới khi có câu trả lời: chỉ có ba chip, lý do không bắt buộc.

## YC10

### YC10-H1 · mo
Sale bỏ dòng của chủ nhà đã ngừng mình được không?
Gắn ở: YC10.2.

### YC10-H2 · mo
Dòng chủ nhà ở Nguồn phòng ghi "Cập nhật … trước" tính theo mốc nào (lần đổi lịch hay giá gần nhất của bất kỳ căn nào của chủ nhà đó)?
Gắn ở: YC10.1, YC10.4.

### YC10-H3 · mo
Mã căn tự nhập trùng thì trùng với căn nào (căn tự nhập khác của chính sale, hay mọi căn của sale)?
Gắn ở: YC10.3.

### YC10-H4 · mo
Chủ căn tự nhập sau này dùng app thì căn tự nhập và đặt phòng cũ làm gì: ghép, giữ riêng hay xóa?
Gắn ở: YC10.

### YC10-H5 · mo
Sale đã bấm "Bỏ khỏi danh sách" dòng chủ nhà đã xóa tài khoản; sau đó chủ nhà nhập lại số thì kết nối có nối lại không?
Gắn ở: YC10.1.

### YC10-H6 · mo
Màn chi tiết chủ nhà (S6-04) khi sale không còn quyền xem chủ nhà đó trông thế nào?
Gắn ở: YC10.2.

### YC10-H7 · mo
Sửa thông tin căn tự nhập và sửa booking đã ghi chưa có màn. Xóa booking sale đã ghi cũng chưa có màn.
Gắn ở: YC10, YC10.3.

### YC10-H8 · mo
Sale đã bỏ nguồn của một chủ nhà: có còn xem lại đặt phòng cũ với chủ nhà đó không, và yêu cầu đặt phòng đang chờ giữa hai bên xử lý thế nào?
Gắn ở: YC10.2.

## YC11

### YC11-H1 · mo
Sale có căn của tôi (QD5) xem thống kê căn đó ở đâu, và đặt phòng ở căn đó có tính vào thống kê sale không?
Gắn ở: YC11.1, YC11.2.

### YC11-H2 · mo
Đặt phòng vắt qua hai tháng chia giá bán cho các đêm thế nào?
Gắn ở: YC11.2.

### YC11-H3 · mo
Đặt phòng sale tự ghi cho căn tự nhập có trong danh sách không?
Gắn ở: YC11.3. Tới khi có câu trả lời: không có.

### YC11-H5 · mo
S7 mở danh sách S7-03 bằng cách nào; chạm dòng chờ chủ ở S7 mở S7-03 (hình) hay S3-03 (story cũ); chạm dòng yêu cầu ở S7-03 mở đâu?
Gắn ở: YC11.2, YC11.3.

### YC11-H6 · mo
Số booking trong thống kê tháng đếm theo tháng của ngày nhận, hay đếm ở mọi tháng có đêm của booking?
Chặn: Màn thống kê. Đang tạm làm: Chưa làm thống kê. Hỏi ngày 18/11/2026.

### YC11-H7 · mo
Giữa tháng thêm hay xóa căn thì mẫu số công suất tính thế nào?
Gắn ở: YC11, YC3.6.

### YC11-H8 · mo
Thống kê của sale có chọn tháng khác không?
Gắn ở: YC11.2. Tới khi có câu trả lời: chỉ tháng hiện tại.

### YC11-H9 · mo
"Chưa thu tiền" gồm chỉ đặt phòng chưa cọc, hay cả phần còn thu của đặt phòng đã cọc?
Gắn ở: YC11.

## YC12

### YC12-H2 · mo
Báo chủ nhà khi sale gửi link xin xem lịch thế nào, khi link đi ngoài app và database chưa biết gì cho tới khi chủ nhà mở link? Công tắc "Sale xin xem lịch" ở P3 làm gì?
Gắn ở: YC12, YC12.4.

### YC12-H3 · mo
Đặt phòng tạo khi đã còn dưới 3 ngày tới ngày nhận thì có nhắc không?
Gắn ở: YC12.3.

### YC12-H4 · mo
Tắt một loại thì thông báo loại đó đã ghi trước còn ở P13 không?
Gắn ở: YC12.4. Tới khi có câu trả lời: còn (giả định GD29).

## YC13

### YC13-H1 · mo
Trang quản trị hiện gì khi đang tải, mất mạng, không có quyền?
Gắn ở: YC13.

### YC13-H2 · mo
Hai dải ngày lễ cùng năm chồng ngày được không?
Gắn ở: YC13.2.

### YC13-H3 · mo
Sửa hoặc xóa một dải sau khi chủ nhà đã đặt giá theo dải đó: giá chủ nhà đã lưu giữ theo dải cũ hay đổi theo dải mới, có báo chủ nhà không.
Gắn ở: YC13.2. Tới khi có câu trả lời: giá dịp của chủ nhà không đổi.

### YC13-H4 · mo
Giới hạn "một dải tối đa 10 ngày" (quy tắc Dải ngày lễ do Home247 đặt) có áp cho dải người quản trị nhập không, hay chỉ cho dải chủ nhà sửa.
Gắn ở: YC13.2.

### YC13-H5 · mo
Hai người thêm cùng một tòa với tên khác nhau ("ICON 40", "Icon40"): người quản trị gộp hay xóa thế nào, căn đang gắn tòa bị xóa thì sao. Người dùng thêm thoải mái nên chuyện này sẽ xảy ra.
Gắn ở: YC13.3.

### YC13-H6 · mo
Người đồng quản trị bị gỡ khi đang đăng nhập thì phiên đó còn dùng được không?
Gắn ở: YC13.1.

### YC13-H7 · mo
Người quản trị có sửa được tên, khu vực của tòa do người dùng thêm không (ví dụ sửa lỗi chính tả).
Gắn ở: YC13.3.

## YC14

### YC14-H1 · mo
Mâu thuẫn chặn cả YC: PQ15.SALE (tiền chênh, doanh số chỉ của mình) và PQ10.SALE (không thấy yêu cầu của sale khác) trái với quy tắc Trưởng nhóm thấy đặt phòng và tiền chênh, Thấy ai đang chờ chủ?
Gắn ở: YC14, YC14.1.

### YC14-H2 · mo
Chia sẻ nguồn phòng cho nhóm có bỏ qua việc chủ nhà đồng ý từng sale (QD8) không?
Gắn ở: YC14.

### YC14-H3 · mo
Căn tự nhập có chia cho nhóm được không (S8-01 liệt kê "Chú Bình · tự nhập"), khi quy tắc là căn tự nhập chỉ sale đó thấy?
Gắn ở: YC14.

### YC14-H4 · mo
Một sale ở nhiều nhóm được không. Chưa thiết kế. Phương án: một nhóm một sale để đơn giản; hoặc nhiều nhóm nhưng nguồn chung nào cũng cộng vào Nguồn phòng.
Gắn ở: YC14.

### YC14-H5 · mo
Chưa có màn: giải tán nhóm, đổi trưởng nhóm, trưởng nhóm rời nhóm, đổi tên nhóm, thêm hoặc bớt nguồn chung sau khi tạo, link hết hạn hoặc nhóm đầy, số thành viên tối đa.
Gắn ở: YC14.

### YC14-H6 · mo
Cộng tác viên: canvas không có vai trò này. Phương án: coi cộng tác viên là thành viên nhóm; hoặc là vai trò riêng (không có quyền xem giá, chỉ gửi khách) cần đặc tả thêm; hoặc bỏ khỏi tên nhóm YC14.
Gắn ở: YC14.

### YC14-H7 · mo
Tạo nhóm khi sale chưa có nguồn phòng nào. S8-01 không nói. Phương án: cho tạo nhóm trống; hoặc báo cần có ít nhất một nguồn.
Gắn ở: YC14.1.

### YC14-H8 · mo
Xóa khỏi nhóm (S8-04) và Rời nhóm (S8-05) chưa vẽ bước xác nhận lần hai, trong khi quy tắc chung là bấm hai lần.
Gắn ở: YC14.2.

## YC15

### YC15-H1 · mo
Điều khoản và Chính sách quyền riêng tư: có link ở A1 nhưng chưa có màn nội dung.
Gắn ở: YC15.

## QT2

### QT2-H1 · mo
Đặt phòng đã hủy (xóa) có còn chiếm đêm không, hay QT2.1 chỉ tính đặt phòng chưa hủy?
Gắn ở: QT.

## QT5

### QT5-H1 · mo
Viết số tiền rút gọn ("900k", "1,1tr", "1,15tr") làm tròn thế nào khi số không chẵn? Ví dụ 950.500đ ghi "950k" hay "951k"; 1.125.000đ ghi "1,12tr", "1,13tr" hay "1,125tr"; 999.999đ ghi "999k" hay "1tr"; 1.000.000đ ghi "1tr" hay "1,0tr".
Gắn ở: glossary.md mục Viết số tiền (QT5.2). Chặn: hàm viết rút gọn dùng chung, cần cho YC2.5, YC4.1, YC4.2, YC7.1. EN1 chỉ làm cách viết đầy đủ. Hỏi ngày 18/11/2026.

## HV1

### HV1-H1 · mo
Chờ database bao lâu thì coi là lỗi và chuyển sang HV2 bước 5?
Gắn ở: HV1.

## HV3

### HV3-H1 · mo
Nháp đặt phòng được chứa tên, số khách (QD11), xóa khi lưu xong hay hủy. Nháp giữ bao lâu?
Gắn ở: HV3.

## PQ1

### PQ1-H1 · mo
Quản trị viên có sửa hồ sơ người dùng được không?
Gắn ở: PQ1.

## PQ2

### PQ2-H1 · mo
Sale bị ngừng còn thấy số điện thoại của chủ nhà không?
Gắn ở: PQ2.

## PQ6

### PQ6-H1 · mo
Sale có thấy ngày tính giá cuối tuần của chủ nhà không?
Gắn ở: PQ6.

## PQ7

### PQ7-H1 · mo
Sale bị ngừng còn xin hủy đặt phòng cũ với chủ nhà đó được không?
Gắn ở: PQ7.

## PQ8

### PQ8-H1 · mo
Sale thấy nhãn "Đã thanh toán", "còn thu" của đặt phòng của mình không, hay chỉ đã cọc hay chưa?
Gắn ở: PQ8.

## PQ10

### PQ10-H1 · mo
Sale bị ngừng thì yêu cầu đang chờ của sale với chủ nhà đó xử lý thế nào?
Gắn ở: PQ10.

## PQ17

### PQ17-H1 · mo
Sale bị ngừng: chủ nhà đó còn hiện ở Nguồn phòng của sale không?
Gắn ở: PQ17.

## PQ18

### PQ18-H1 · mo
Link xin lịch của sale có hạn không?
Gắn ở: PQ18.

## PQ20

### PQ20-H1 · mo
Quản trị viên có xuất được dữ liệu của người dùng không?
Gắn ở: PQ20.

## PQ21

### PQ21-H1 · mo
Sale có quyền gì ở trang quản trị (dải ngày lễ, tòa nhà) không?
Gắn ở: PQ21.

## PQ23

### PQ23-H1 · mo
Quản trị viên còn xem được số điện thoại của người đã xóa tài khoản ở đâu không (ngoài bản sao lưu tự động)?
Gắn ở: PQ23.

## Bảng đổi mã (18/11/2026, QD21)

| Mã cũ | Mã mới |
|---|---|
| CH-001 | QD22 |
| CH-002 | QD23 |
| CH-003 | YC8-H5 |
| CH-004 | YC5-H18 |
| CH-005 | YC6-H10 |
| CH-006 | YC11-H6 |
| CH-007 | YC1-H6 |
| CH-008 | QD24 |
| CH-009 | YC6-H11 |
| CH-010 | YC6-H12 |
| CH-011 | YC6-H13 |
| CH-012 | YC6-H14 |
| CH-014 | PQ18-H1 |
| CH-015 | YC2-H4 |
| CH-016 | YC2-H5 |
| CH-017 | YC2-H6 |
| CH-018 | YC3-H7 |
| CH-019 | YC4-H5 |
| CH-020 | YC4-H6 |
| CH-021 | YC3-H8 |
| CH-022 | YC9-H9 |
| CH-025 | YC5-H19 |
| CH-027 | YC10-H4 |
| CH-028 | YC10-H5 |
| CH-029 | YC11-H7 |
| CH-030 | YC11-H8 |
| CH-031 | YC11-H9 |
| CH-032 | YC1-H7 |
| CH-033 | YC1-H8 |
| CH-034 | PQ23-H1 |
| CH-035 | YC13-H3 |
| CH-036 | YC13-H4 |
| CH-038 | YC13-H5 |
| CH-039 | YC13-H6 |
| CH-042 | PQ2-H1 |
| CH-043 | PQ1-H1 |
| CH-044 | PQ6-H1 |
| CH-045 | PQ20-H1 |
| CH-046 | PQ21-H1 |
| CH-047 | PQ17-H1 |
| CH-048 | PQ7-H1 |
| CH-049 | PQ8-H1 |
| CH-050 | PQ10-H1 |
| CH-056 | YC15-H1 |
| CH-057 | YC6-H15 |
| CH-059 | YC7-H8 |
| CH-067 | YC9-H10 |
| CH-070 | YC8-H6 |
| CH-071 | YC7-H9 |
| CH-072 | YC8-H7 |
| CH-074 | YC10-H6 |
| CH-076 | YC10-H7 |
| CH-081 | YC14-H2 |
| CH-082 | YC14-H3 |
| CH-083 | YC14-H4 |
| CH-084 | YC14-H5 |
| CH-085 | YC14-H6 |
| CH-086 | YC14-H7 |
| CH-087 | YC14-H8 |
| CH-088 | YC1-H9 |
| CH-090 | YC1-H10 |
| CH-091 | YC1-H11 |
| CH-095 | YC13-H7 |
| CH-096 | YC6-H16 |
| CH-098 | YC10-H8 |
| HV-H1 | HV1-H1 |
| HV-H3 | HV3-H1 |
| LC-H1 | QT2-H1 |

## Đã trả lời trước khi dựng lại (bản PWA cũ)

- CH-023 · 04/11/2026 (bản Zalo) · Tùng chốt điểm 2 trong 13 điểm ngày 04/11/2026: lưu sửa hoặc xóa đặt phòng xong thì quay về màn đã mở chức năng đó. Đã áp dụng ở: YC5 (bước 26, 31, YC5.6-NT7).
- CH-066 · trước 18/11/2026 (bản Zalo) · Tùng 03/11: "tạo ra một thư mục lưu ảnh trên production. Sau này production sẽ chạy ở server Việt nam." Ở PR #88 bản Zalo Tùng trả lời bốn câu về ảnh: "Đồng ý hết, ko cần Đức xem" (giữ HEIC, ngưỡng 40 triệu điểm ảnh, ảnh tạm không gắn quá 24 giờ thì xóa). Bản PWA: ảnh ở Storage của Supabase (nơi đặt: QD23); nhận JPEG, PNG, HEIC tới 15 MB, thu về JPEG cạnh dài 1600 px. Đã áp dụng ở: YC3.
- CH-062 · trước 18/11/2026 (bản Zalo) · Đã trả lời bởi du-lieu-mau.md (DLM.3): sau khi áp dụng, Tháng 11 và Tháng 12 ghi "800k–1,1tr"; "Giá 7 tháng" là T6 đến T12. Sửa canvas CN6-04, CN6-08. `[r4 · sửa]` Câu hỏi cũ: Toast "Đã áp dụng giá cho Tháng 11 – 12" (CN6-04, CN6-08) nhưng cùng màn Tháng 11 và Tháng 12 còn ghi "Chưa đặt", và CN6-07 ghi "Giá 7 tháng". Phương án: sửa dữ liệu minh họa của CN6-04 và CN6-08; hoặc toast ghi sai. Đã áp dụng ở: docs/luat-chung/Nghiep_vu.md.
- CH-063 · trước 18/11/2026 (bản Zalo) · Đã trả lời: hai dải ngày lễ hoặc dịp đặc biệt của cùng căn không được chồng ngày, lưu thì báo lỗi (YC4.3 bước 8, quy tắc Giá dịp không chồng ngày). Dịp và giá tháng: dịp thay giá tháng (quy tắc Giá dịp thay giá tháng). Tùng 03/11: "Giá chồng ngày không thể được, lúc setting giá đã chặn rồi." `[r13 · sửa]` Câu hỏi cũ: Thứ tự ưu tiên khi ngày lễ, dịp đặc biệt và giá tháng chồng nhau, hoặc hai dịp trùng ngày. Phương án: dịp ghi sau cùng thắng; ngày Đã áp dụng ở: src/services/api.ts.
- CH-064 · trước 18/11/2026 (bản Zalo) · Đã trả lời: xóa căn là ẩn căn (YC3.6). Tùng 03/11: "thêm chức năng xoá căn, thực chất là chỉ ẩn căn đó đi khỏi màn hình. Các data khác về thống kê vẫn còn." Còn đặt phòng sắp tới hoặc yêu cầu chờ thì không xóa được, sale không còn thấy căn, mã dùng lại được, bản đầu không hiện lại: Tùng chọn theo đề xuất ("Theo đề xuất"). Màn:. `[r13 · sửa]` Câu hỏi cũ: Xóa hoặc ẩn một căn chưa có màn. Căn đang có booking thì xử lý ra sao. Đã áp dụng ở: YC3.
- CH-065 · trước 18/11/2026 (bản Zalo) · Đã trả lời: một danh sách chung, người quản trị đặt sẵn (YC13.3), người dùng thêm tòa mới không cần duyệt và tòa đó hiện cho mọi người (quy tắc Tòa nhà dùng chung). Tùng 03/11: "Danh sách toà nhà có thể seting bởi admin, ngoài ra thêm thoải mái." và chọn theo đề xuất cho phần tòa người dùng thêm. Còn mở: khu vực của tòa người dùng thêm nhập thế nào. `[r13 · sửa]` Câu hỏi cũ: Danh sách tòa nhà chung cho mọi chủ nhà hay riêng từng chủ nhà, ai duyệt Đã áp dụng ở: YC3, `work/cau-hoi.md`.
- CH-073 · trước 18/11/2026 (bản Zalo) · Đã trả lời: tạm thời không lọc, không ghi số khách; S4 bỏ "· 4 khách" (YC7.3 bước 5). Tùng 03/11: "Tạm thời chưa lọc theo số khách". `[r11 · thêm]` `[r13 · sửa]` Đã áp dụng ở: YC7, src/pages/s1-tim-man.tsx.
- CH-080 · trước 18/11/2026 (bản Zalo) · Đã trả lời (Tùng, 28/10): booking đã xóa không tính vào doanh thu, đêm có khách và chưa thu. Đã áp dụng ở: tests/kich-ban/YC11.md.
- CH-093 · trước 18/11/2026 (bản Zalo) · Đã trả lời bởi YC13.1: đăng nhập bằng mã gửi tới email. `[r6 · sửa]` Đã áp dụng ở: `docs/_lich-su/zalo/bao-mat.md`.
- CH-094 · trước 18/11/2026 (bản Zalo) · Đã trả lời bởi YC13.1: quản trị viên đầu tiên là email ghi trong `bootstrap_admins` (không ghi vào repo), thêm người đồng quản trị trên web (YC13.1). Phần cấp và gỡ còn lại ở câu 12, 13. Đã áp dụng ở: `docs/_lich-su/zalo/bao-mat.md`.
- CH-037 · 18/11/2026 · Bản 1 nạp dải ngày lễ và tòa nhà bằng seed; trang quản trị làm sau (pwa.md P11, YC13). Đã áp dụng ở: YC13, YC15.
