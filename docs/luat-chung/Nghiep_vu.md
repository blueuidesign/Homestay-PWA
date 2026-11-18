# Luật chung của nghiệp vụ và database

<!-- Luật chung, sống. Những luật dùng ở nhiều story mà không thuộc QT (tính toán có ví dụ số), PQ (quyền), HV (hành vi màn).
     Phần 1 viết tay. Phần 2 là quy tắc và bảng "ai thấy gì" theo từng nhóm tính năng; story trỏ tới quy tắc bằng tên ngắn.
     Bảng "ai thấy gì" ở phần 2 diễn giải PQ.md theo màn. Hai bên lệch nhau thì PQ.md đúng: dừng, hỏi Tùng, rồi sửa bảng ở đây. -->

## 1. Luật chung

### 1.1 Ngày và đêm
- Ngày nghiệp vụ theo giờ Việt Nam. "Hôm nay" ở database là `local_today()`.
- Một lần ở chiếm các đêm từ ngày nhận tới trước ngày trả. Nhận 10/10, trả 12/10 là hai đêm: đêm 10/10 và đêm 11/10. Khách cũ trả ngày 12/10 và khách mới nhận ngày 12/10 không trùng nhau.
- Đêm cuối tuần mặc định là đêm thứ Sáu và đêm thứ Bảy. Mỗi chủ nhà đổi được (`profiles.dem_cuoi_tuan`, story US11).

### 1.2 Tiền
- Tiền là số nguyên đồng, không có phần lẻ.
- Giá tính theo đêm.

### 1.3 Giá chủ nhà của một đêm
Hàm `gia_dem(căn, đêm)`, theo thứ tự ưu tiên:
1. Có giá dịp (`gia_dip`) phủ đêm đó: lấy giá dịp.
2. Căn tự nhập: giá cuối tuần hoặc giá ngày thường sale đã ghi cho căn.
3. Giá tháng (`gia_thang`) của tháng chứa đêm đó: giá cuối tuần nếu là đêm cuối tuần, không thì giá ngày thường.
4. Không có gì: không có giá. Màn hiện "Chưa có giá", không hiện 0.

Ví dụ và test: `QT.md`, `tests/db/t_02_gia.sql`, `t_07_can_gia_mo_rong.sql`.

### 1.4 Giá bán của sale
Hàm `gia_ban_dem(căn, đêm)`: giá chủ nhà của đêm đó cộng mức cộng của sale cho căn đó; căn chưa có mức cộng riêng thì dùng mức cộng mặc định của sale. Sale bật "làm tròn 50 nghìn" thì làm tròn lên từng đêm rồi mới cộng các đêm (giả định GD13). Chủ nhà và khách không thấy mức cộng.

### 1.5 Tiền phòng của một booking
Điền sẵn bằng tổng giá chủ nhà các đêm. Chủ nhà sửa được. Giữ đúng tổng thì mỗi đêm ghi theo giá đêm đó; sửa tổng thì chia đều, phần lẻ dồn vào đêm cuối (QD-010, `QT.md` mục QT4). Tiền từng đêm nằm ở `booking_dem`, để doanh thu tháng tính đúng khi một booking vắt qua hai tháng.

### 1.6 Lỗi
- Hàm `fn_*` từ chối bằng lỗi có mã `P0001` và một câu tiếng Việt viết cho người dùng, ví dụ "Căn này đã được đặt rồi". App hiện nguyên câu đó.
- Lỗi khác (mất mạng, lỗi không lường trước): app hiện câu chung theo `HV.md` mục HV2, không hiện chữ kỹ thuật.
- Câu báo lỗi luôn nói: chuyện gì, vì sao, làm gì tiếp.
- Người không có quyền với một bản ghi nhận câu "Không tìm thấy…", giống như bản ghi không tồn tại, để không lộ là nó có.

### 1.7 Chống gửi trùng
Mỗi lần người dùng bấm ghi (đặt phòng, yêu cầu, mở app), app sinh một `client_id` và gửi kèm. Mạng rớt, app gửi lại cùng `client_id`: database trả bản ghi đã tạo, không tạo cái thứ hai. Test: `tests/db/t_03_chan_trung.sql`.

### 1.8 Ảnh căn
- Ảnh nằm ở Storage của Supabase, bucket riêng tư `anh-can`, đường dẫn bắt đầu bằng mã người tải.
- App tải ảnh lên, gọi `fn_dang_ky_anh` để lấy mã ảnh, rồi `fn_gan_anh_can` để gắn vào căn theo thứ tự. Mỗi căn tối đa 12 ảnh.
- Chỉ người giữ căn và sale được chia sẻ căn đó đọc được ảnh.

### 1.9 Thông báo
- Sinh bằng trigger khi dữ liệu đổi; app không tự ghi. Danh sách loại: ràng buộc `thong_bao_loai_check` trong `docs/tu-sinh/Bang_va_cot.md`. Ai nhận loại nào: `tests/db/t_08_thong_bao.sql`.
- Thông báo chỉ ghi căn và ngày, không ghi tên khách, không ghi giá bán của sale.
- Người dùng tắt được từng loại (`cai_dat_rieng.thong_bao_tat`).
- `fn_mo_app` trả các thông báo mới kể từ lần mở app trước, cho popup lúc mở app (story US30).
- Bản 1 chỉ báo trong app. Không gửi tin ra ngoài.

### 1.10 Link
- Link mời của chủ nhà hết hạn sau 21 ngày, thu hồi được. Ai có link cũng mở xem được trước khi đăng nhập, và không thấy giá (QD-008).
- Mỗi sale có một link xin lịch, gửi cho nhiều chủ nhà. Mở link xin lịch phải đăng nhập, vì màn đó hiện tên và số điện thoại của sale.

### 1.11 Giới hạn độ dài
Giới hạn từng ô (tên, ghi chú, mẫu tin, số điện thoại) là ràng buộc `check` ở bảng: xem `docs/tu-sinh/Bang_va_cot.md`. Màn nhập chặn ở cùng con số đó.

## 2. Quy tắc và "ai thấy gì" theo nhóm tính năng

### YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale
Nhóm này cho người dùng vào app, chọn vai trò chủ nhà hoặc sale, rồi nối chủ nhà với sale để sale xem được lịch phòng. Kết nối đi qua tin nhắn Zalo và link, không có hộp thư riêng trong app. Số điện thoại chỉ được xin ở lúc bắt đầu kết nối.

Quy tắc của nhóm (story trỏ tới bằng tên ngắn):

| Tên ngắn | Nội dung quy tắc | Yêu cầu dùng | Ví dụ số |
|---|---|---|---|
| Điều khoản khi tiếp tục | Bấm "Bắt đầu ngay" nghĩa là đồng ý Điều khoản và Chính sách quyền riêng tư | YC1.1, YC1.3 | Không |
| Xin số điện thoại đúng lúc | Không xin tên, số lúc mở app hay bấm "Bắt đầu ngay". Xin tên và số ở mọi việc bắt đầu chia sẻ, chấp thuận hoặc kết nối (danh sách ở YC1.5, YC1.5). Có popup giải thích rồi mới tới hộp thoại Zalo. Có nút "Để sau" và việc gốc vẫn làm tiếp. Đã có số thì bỏ qua. Đã từ chối: HV4 | YC1.1, YC1.3, YC1.5, YC1.6, YC1.7, YC1.8, YC1.9, YC4.5, YC4.6, YC5.5, YC6.1, YC6.4 | Không |
| Số điện thoại từ Zalo, chỉ xem | Số lấy từ Zalo, lưu vào hồ sơ, không sửa trong app. Đổi số trong Zalo thì app tự cập nhật lần sau | YC1.5.3 | Không |
| Nhận ra nhau bằng số điện thoại | Chủ nhà và sale nhận ra nhau qua số điện thoại trong Nguồn phòng và trong danh sách sale | YC1.5.1, YC1.7, YC1.9 | Không |
| Xin lịch chỉ qua tin Zalo | Việc xin xem lịch chỉ đi qua tin nhắn Zalo. App không có hộp thư xin lịch riêng. Chủ nhà bấm thẻ trong tin để mở màn cấp quyền | YC1.6, YC1.7 | Không |
| Không biết gửi cho ai | Cửa sổ gửi là của Zalo nên app không biết người nhận. App chỉ đếm số lần gửi và số chủ nhà đã đồng ý | YC1.6, YC1.8 | "3 lần đã gửi qua Zalo", "0 chủ nhà đã đồng ý" |
| Một link xin lịch nhiều chủ nhà | Mỗi sale có một link xin lịch dùng được cho nhiều chủ nhà | YC1.6 | Không |
| Quyền sale được xem | Sale đã được chia sẻ căn nào thì luôn thấy lịch và giá chủ nhà từng đêm của căn đó, không có công tắc tắt giá. Chủ nhà chỉ bật tắt một quyền cho từng sale: Tình trạng cọc (mặc định bật, chỉ cho đặt phòng của chính sale, chỉ đã cọc hay chưa, không có số tiền). Đặt phòng của sale khác luôn hiện là "đã đặt", không tên sale, không bật tắt được. Sale vào qua link mời hay CN10 nhận quyền mặc định. Sale không bao giờ thấy tên, số điện thoại khách của chủ nhà và doanh thu. Theo QD-007, ma trận PQ17 | YC1.7, YC1.8, YC1.9 | Không |
| Sale tự thêm lịch | Mở link mời của chủ nhà chưa làm gì với dữ liệu của sale. Lịch của chủ nhà chỉ vào dữ liệu của sale khi sale bấm "Thêm lịch" ở A10. Ai có link cũng mở được (QD-008) | YC1.3 | Không |
| Căn mới tự hiện | Căn mới của chủ nhà tự vào phạm vi của sale được chia sẻ "tất cả căn" (QD-008) | YC1.12 | 6 căn thành 7 căn |
| Nhóm kết nối | Sale ở nhóm "Đã kết nối" khi đã bấm "Thêm lịch" ở A10 (QD-008), hoặc khi chủ nhà đồng ý ở A8. Sale được chủ nhà thêm tay hoặc mới được mời nằm ở "Chưa kết nối" cho tới khi mở link | YC1.9 | "Chưa kết nối · 1" |
| Ngừng cho xem | Ngừng cho xem thì sale mất quyền xem lịch, căn và giá của chủ nhà đó. Đặt phòng cũ vẫn giữ và sale vẫn xem lại được đặt phòng của mình. Sale nhận thông báo (QD-007, YC9.3) | YC1.9 | Không |
| Gom thông báo | Nhiều chủ nhà đồng ý gần nhau thì gom một toast và một dòng ở Thông báo | YC1.10 | "3 chủ nhà … 7 căn mới" |
| Vị trí toast | Theo HV8 (kiểu, vị trí chung, tự tắt sau 3 giây) | YC1.8, YC1.10 | Không |

Ai thấy gì trong nhóm này:

 Bảng dưới là nguồn gom vào PQ.
| Dữ liệu | Chủ nhà | Sale đã kết nối | Người mở link chưa kết nối | Cộng tác viên | Khách |
|---|---|---|---|---|---|
| Tên Zalo của người kia | Thấy tên Zalo của sale | Thấy tên chủ nhà (A9) | Chủ nhà thấy tên sale ở A8; sale thấy tên chủ nhà ở A1-link | Không áp dụng ở bản đầu (YC8) | Không dùng app |
| Số điện thoại của người dùng | Thấy số sale ở A8 và CN7 nếu sale đã cho phép; số của mình sửa không được | Thấy số của chủ nhà đã kết nối (QD-007) | Không (QD-008) | Không áp dụng ở bản đầu (YC8) | Không bao giờ thấy |
| Lịch trống/kín và giá từng đêm | Xem, sửa lịch của mình | Lịch và giá từng đêm luôn xem được với căn được chia sẻ (QD-007) | Chưa thấy lịch và giá. A10 chỉ hiện tên chủ nhà, số căn, ảnh và thông tin sơ lược căn (QD-008) | Không áp dụng ở bản đầu (YC8) | Không |
| Tình trạng cọc | Thấy tất cả | Chỉ đặt phòng của mình, nếu quyền bật; chỉ đã cọc hay chưa, không có số tiền (QD-007) | Không (QD-008) | Không áp dụng ở bản đầu (YC8) | Không |
| Đặt phòng của sale khác | Thấy | Luôn thấy là "đã đặt", không tên sale; không phải quyền bật tắt (QD-007) | Không (QD-008) | Không áp dụng ở bản đầu (YC8) | Không |
| Tên, số điện thoại khách, doanh thu | Thấy doanh thu và khách mình tự nhập; không thấy khách của sale (QD-011) | Thấy khách mình tự nhập; không bao giờ thấy khách của chủ nhà và doanh thu (QD-011) | Không | Không áp dụng ở bản đầu (YC8) | Không |
| Danh sách sale và booking của từng sale | Xem, thêm tay, ngừng cho xem | Không | Không | Không áp dụng ở bản đầu (YC8) | Không |
| Số lần đã gửi, số chủ nhà đã đồng ý | Không | Sale tự xem ở A7 | Không | Không áp dụng ở bản đầu (YC8) | Không |
| Thông báo kết nối | Thông báo của chủ nhà: chưa thiết kế trong YC1 | Toast và P13 | Không | Không áp dụng ở bản đầu (YC8) | Không |

### YC2 · Lịch chủ nhà
Nhóm này cho chủ nhà xem lịch các căn của mình: theo tháng, theo tuần, và chi tiết từng ngày. Chủ nhà thấy căn nào có khách, căn nào trống, booking nào chưa cọc, và doanh thu tóm tắt trong tháng. Việc thêm, sửa, xóa booking thuộc YC4. Việc gửi lịch cho sale thuộc YC1.8.

Quy tắc của nhóm (story trỏ tới bằng tên ngắn):

| Tên ngắn | Nội dung quy tắc | Yêu cầu dùng | Ví dụ số |
|---|---|---|---|
| Đêm có khách | Đã viết thành QT2 (`QT.md`). Booking chiếm các đêm từ ngày nhận tới trước ngày trả. Ngày trả không tính là đêm có khách | YC2.1, YC2.2, YC2.4, YC2.5 | 09/10 → 12/10 là 3 đêm: 09, 10, 11 |
| Màu theo căn | Mỗi căn một màu trên lịch. Từ 4 căn trở lên, tên căn trong danh sách căn (CN5) không tô màu | YC2.1 | Không |
| Trạng thái tiền booking | Mỗi booking mang một nhãn: "Chưa cọc", "Cọc <số tiền>", "Đã cọc · còn thu" hoặc "Đã thanh toán" | YC2.3, YC2.4, YC2.5 | "Cọc 1.000.000đ" |
| Tuần bắt đầu thứ hai | Lưới tháng và bảng tuần đều bắt đầu từ T2 và kết thúc ở CN | YC2.1, YC2.5 | Không |
| Giá rút gọn | Giá trên bảng tuần hiện rút gọn: dưới một triệu ghi "k", từ một triệu ghi "tr" kèm dấu phẩy | YC2.5 | 900k, 1,1tr, 1,15tr |

Ai thấy gì trong nhóm này:


| Dữ liệu | Chủ nhà | Sale đã kết nối | Người mở link chưa kết nối | Cộng tác viên | Khách |
|---|---|---|---|---|---|
| Lịch có khách / trống của căn | Thấy mọi căn của mình | Thấy trống hoặc đã đặt của căn được chia sẻ, gồm đặt phòng của người khác, không tên người đặt (QD-007) | Không (QD-008) | Không áp dụng ở bản đầu (YC8) | Không |
| Tên người đặt, số điện thoại sale trên booking | Thấy | Chỉ booking của mình | Không (QD-008) | Không áp dụng ở bản đầu (YC8) | Không |
| Số tiền, tiền cọc, trạng thái tiền | Thấy | Tiền phòng của đặt phòng của mình; tình trạng cọc chỉ đã cọc hay chưa, nếu quyền cọc bật, không có số tiền (QD-007) | Không (QD-008) | Không áp dụng ở bản đầu (YC8) | Không |
| Doanh thu tháng, số đêm | Thấy | Không | Không | Không áp dụng ở bản đầu (YC8) | Không |
| Giá từng đêm trên lịch tuần | Thấy | Lịch tuần là màn của chủ nhà; sale xem giá ở lịch của sale (YC5.1) | Không (QD-008) | Không áp dụng ở bản đầu (YC8) | Không |

### YC3 · Căn và giá
Nhóm này cho chủ nhà thêm căn, sửa thông tin và ảnh căn, rồi đặt giá cho từng căn hoặc nhiều căn cùng lúc. Giá đặt theo tháng, có giá riêng cho ngày lễ và dịp đặc biệt, và có thể sao chép từ căn này sang căn khác. Đây là giá chủ nhà. Sale chỉ thấy giá sau khi chủ nhà đặt.

Quy tắc của nhóm (story trỏ tới bằng tên ngắn):

| Tên ngắn | Nội dung quy tắc | Yêu cầu dùng | Ví dụ số |
|---|---|---|---|
| Căn tối thiểu | Một căn chỉ cần mã căn và số phòng ngủ. Ảnh, giá, tòa nhà, loại view, số giường, mô tả thêm sau cũng được. Tên nhà mặt đất đặt tự do | YC3.2, YC3.3 | "Greenbay", "Phòng 1509" |
| Mã căn không trùng | Một chủ nhà không có hai căn cùng mã. Hai chủ nhà khác nhau có cùng mã được. Căn đã xóa (ẩn) không tính, nên mã của nó dùng lại được. | YC3.2, YC3.3, YC3.9 | "Đã có căn 1509" |
| Ảnh căn | Tối đa 12 ảnh. Ảnh đầu tiên là ảnh đại diện. Nên có ít nhất 6 ảnh vì sale cần. Còn ảnh đang tải hoặc tải lỗi thì chưa thêm căn được | YC3.1, YC3.2.1, YC3.3 | 12 ảnh, 6 ảnh |
| Giá tuần này | Thẻ căn ghi khoảng từ giá đêm thấp nhất đến cao nhất trong tuần này | YC3.1 | 900.000đ – 1.300.000đ |
| Giá hai loại đêm | Mỗi tháng có hai giá: ngày thường (CN đến T5) và cuối tuần (T6, T7). Các thứ tính cuối tuần chọn ở Cá nhân và áp dụng cho mọi căn. Tính theo đêm ở: đêm nhận phòng T6 là đêm cuối tuần | YC3.4, YC3.6, YC3.8 | Nhận T6, trả CN là 2 đêm cuối tuần |
| Giá theo tháng và năm | Giá đặt theo tháng, chọn được nhiều tháng một lần, cho năm nay hoặc năm sau | YC3.4, YC3.6 | Tháng 11 – 12 cùng 800k / 1,1tr |
| Giá dịp thay giá tháng | Đêm nằm trong dải ngày lễ hoặc dịp đặc biệt dùng giá của dải đó, không dùng giá tháng | YC3.4, YC3.5 | 24/10 – 25/10 giá 1.300.000đ, lịch giá hiện 1,3tr |
| Dải ngày lễ do Home247 đặt | Home247 đặt sẵn dải nghỉ của từng dịp mỗi năm (gồm nghỉ bù, nối cuối tuần). Bản đầu nạp bằng script, sau người quản trị sửa theo YC10.1. Chủ nhà sửa được dải. Một dải tối đa 10 ngày | YC3.5, YC10.1 | 30/4 → 3/5 là 4 ngày; 13 ngày là quá |
| Tên dịp tự đặt | Chủ nhà bỏ trống tên thì app đặt tên "Dịp đặc biệt <ngày đầu> – <ngày cuối>" (CN6-03-01, YC3-H3) | YC3.5 | Dải 24/10 – 25/10 bỏ trống tên thì tên là "Dịp đặc biệt 24/10 – 25/10" |
| Ngày lễ khác dịp đặc biệt | Công tắc "Là ngày lễ" quyết định dải nằm ở mục "GIÁ NGÀY LỄ" hay "DỊP ĐẶC BIỆT" | YC3.5 | Lễ 30/4 – 1/5 là ngày lễ; Lễ hội Carnaval là dịp đặc biệt |
| Sao chép giá thay giá có sẵn | Sao chép thay phần giá đang có của căn đích bằng giá căn nguồn. Chủ nhà chọn sao chép những phần nào | YC3.7 | Không |
| Sale chỉ thấy giá sau khi đặt | Căn chưa đặt giá thì sale chưa thấy giá. Đã đặt giá thì sale được chia sẻ căn đó luôn thấy (QD-007) | YC3.4 | Không |
| Booking giữ giá riêng | Tiền của một booking lưu riêng cho booking đó, không tham chiếu bảng giá. Bảng giá (giá tháng, giá dịp) chỉ để điền sẵn tiền phòng khi tạo booking (QT4.1). Đổi bảng giá sau đó không đổi booking đã có. | YC3.4, YC3.5, YC3.6, YC3.7, YC4.1.2 | B1 2.200.000đ giữ nguyên khi đổi giá tháng 10 |
| Giá dịp không chồng ngày | Hai dải giá ngày lễ hoặc dịp đặc biệt của cùng một căn không được có ngày chung. Lưu dải chồng ngày thì báo lỗi, không lưu; chặn cả ở database. Hai dải liền nhau thì được. | YC3.5 | 24/10 – 25/10 và 25/10 – 26/10 chồng ngày 25/10 |
| Tòa nhà dùng chung | Một danh sách tòa cho mọi người. Người quản trị Home247 đặt sẵn (YC10.2). Người dùng thêm tòa mới thoải mái, không cần duyệt, và tòa đó hiện cho mọi người chọn. Tòa người dùng thêm hiện cho mọi người. | YC3.2.2, YC5.2, YC10.2 | Không |
| Xóa căn là ẩn căn | Xóa căn chỉ ẩn căn khỏi màn hình; đặt phòng và số thống kê vẫn còn. Không xóa được khi còn đặt phòng có ngày trả sau hôm nay hoặc yêu cầu đang chờ. Sale không còn thấy căn. Mã căn dùng lại được. Bản đầu không hiện lại được | YC3.9 | Không |

Ai thấy gì trong nhóm này:

| Dữ liệu | Chủ nhà | Sale đã kết nối | Người mở link chưa kết nối | Cộng tác viên | Khách |
|---|---|---|---|---|---|
| Danh sách căn, mã căn, số phòng ngủ | Thấy, sửa, xóa (ẩn, YC3.9). Không thấy căn đã xóa | Thấy căn của chủ nhà đã đồng ý, trừ căn đã xóa | Không (QD-008) | Không áp dụng ở bản đầu (YC8) | Thông tin căn sale gửi (YC5) |
| Danh sách tòa nhà | Thấy mọi tòa, thêm tòa mới | Thấy mọi tòa, thêm tòa mới khi nhập căn của mình | Không (QD-008) | Không áp dụng ở bản đầu (YC8) | Tên tòa trong tin sale gửi |
| Ảnh, mô tả gửi khách, tòa nhà, loại view, số giường | Thấy và sửa | Thấy, dùng khi gửi khách | Không (QD-008) | Không áp dụng ở bản đầu (YC8) | Phần sale chọn gửi |
| Giá đêm (tháng, ngày lễ, dịp đặc biệt) | Thấy và sửa | Thấy với căn được chia sẻ, chỉ sau khi chủ nhà đặt giá (QD-007) | Không (QD-008) | Không áp dụng ở bản đầu (YC8) | Không thấy giá chủ nhà |
| Ngày tính giá cuối tuần | Thấy và sửa | ? | Không (QD-008) | Không áp dụng ở bản đầu (YC8) | Không |

### YC4 · Booking
Nhóm này lo việc một đêm ở trở thành booking. Có hai đường: chủ nhà tự ghi booking vào lịch, hoặc sale gửi yêu cầu đặt phòng và chủ nhà chấp nhận. Chủ nhà chỉ làm việc với sale, không liên hệ khách. Booking chỉ vào lịch khi chủ nhà ghi hoặc chấp nhận, không có bước giữ phòng và báo cọc. Việc sale ghi booking của riêng mình cho căn tự nhập thuộc YC6.

Quy tắc của nhóm (story trỏ tới bằng tên ngắn):

Hai quy tắc Đêm có khách và Trạng thái tiền booking đã ghi ở YC2, YC4 dùng lại.

| Tên ngắn | Nội dung quy tắc | Yêu cầu dùng | Ví dụ số |
|---|---|---|---|
| Chặn trùng lịch | Đã viết thành QT1 (`QT.md`). Form báo trùng ngay khi chọn ngày | YC4.1, YC4.1.1, YC4.3, YC4.8 | 18/10 trùng giữa 17/10 → 19/10 và 18/10 → 19/10 |
| Tiền phòng của booking | Đã viết thành QT4. Tiền phòng bắt buộc, điền sẵn theo bảng giá, chủ nhà sửa được; tổng chủ nhà gõ chia đều cho các đêm, phần lẻ dồn đêm cuối | YC4.1.2 | 1.000.000đ cho 3 đêm: 333.333đ, 333.333đ, 333.334đ |
| Tiền còn lại | Còn lại bằng tiền phòng trừ tiền đã cọc. "Đã thu đủ" đưa booking về trạng thái đã thanh toán | YC4.1.2, YC4.2 | 2.200.000đ trừ 1.000.000đ còn 1.200.000đ |
| Giờ nhận trả mặc định | Giờ nhận và trả phòng mặc định là 14:00 và 12:00, áp dụng cho mọi căn (đặt ở Cá nhân) | YC4.1.2, YC4.2 | 14:00, 12:00 |
| Xóa phải bấm hai lần | Xóa booking bấm lần đầu để hỏi, bấm lần hai mới xóa | YC4.4 | Không |
| Hủy cần hai bên | Booking có sale chỉ bỏ được khi một bên xin hủy và bên kia đồng ý. Bị từ chối thì không xin lại. Booking đã hủy vẫn hiện cho cả hai bên với nhãn "Đã hủy", không chiếm đêm, không tính thống kê (QD-012) | YC4.9 | "Chờ đồng ý hủy", "Đã hủy", "Bị từ chối hủy" |
| Không xóa booking của sale | Booking của sale thì chủ nhà không xóa được, chỉ sửa (YC4.3): booking thành từ yêu cầu của sale mà chủ nhà đã chấp nhận, và booking chủ nhà ghi chọn sale làm người đặt (YC4.1.3). Server chặn, không chỉ ẩn nút. Không có thông báo "chủ nhà xóa booking của sale" (YC9.3). Trước r20 tên là "Không xóa booking của sale đã chấp nhận" | YC4.1.3, YC4.4 | Không |
| Yêu cầu chưa phải booking | Yêu cầu của sale chưa chiếm đêm nào. Chỉ khi chủ nhà chấp nhận mới thành booking. Không có bước giữ phòng và báo cọc | YC4.5, YC4.6 | Không |
| Sale thấy hai giá, chủ nhà thấy một giá | Sale thấy giá chủ nhà và giá bán cho khách. Chủ nhà chỉ thấy giá của mình. Phần cộng thêm của sale chỉ sale thấy | YC4.5, YC4.6 | Giá chủ nhà 2.200.000đ, giá bán 2.600.000đ |
| Trạng thái yêu cầu đặt phòng | Chờ chủ, Đã chốt, Bị từ chối, Hết hạn, Đã hủy. Gửi khi đêm đã có booking thì báo lỗi, không tạo yêu cầu. Chủ chấp nhận một yêu cầu hay tự ghi booking trùng thì yêu cầu trùng thành Bị từ chối. Quá 14 ngày chưa trả lời thì Hết hạn. Sale tự hủy thì Đã hủy. Sẽ thành QT ở | YC4.5, YC4.7, YC4.8 | Chấp nhận Sale Hùng thì yêu cầu Sale Lan bị từ chối |
| Chủ nhà chỉ làm việc với sale | Chủ nhà không liên hệ khách. Tên và số điện thoại khách chỉ sale giữ | YC4.2, YC4.5, YC4.6 | Không |

Ai thấy gì trong nhóm này:


| Dữ liệu | Chủ nhà | Sale đã kết nối | Người mở link chưa kết nối | Cộng tác viên | Khách |
|---|---|---|---|---|---|
| Booking của căn | Thấy, thêm, sửa. Xóa booking mình tự ghi cho khách lẻ; không xóa booking của sale (YC9.3, YC4.1.3). Xin hủy, chấp thuận hay từ chối hủy (QD-012) | Thấy ngày đã đặt của mọi người, không tên (QD-007); thấy chi tiết booking của mình, kể cả booking chủ nhà ghi cho mình (YC4.1.3) và kể cả khi đã bị ngừng; xin hủy, chấp thuận hay từ chối hủy (QD-012) | Không (QD-008) | Không áp dụng ở bản đầu (YC8) | Không |
| Tên, số điện thoại khách | Thấy khách mình tự nhập, kể cả khách lẻ (QD-011). Không thấy khách của sale | Thấy khách của mình | Không (QD-008) | Không áp dụng ở bản đầu (YC8) | Không dùng app |
| Số tiền, tiền cọc, trạng thái thu | Thấy | Tiền phòng của đặt phòng mình; cọc chỉ đã cọc hay chưa, nếu quyền bật, không có số tiền (QD-007) | Không (QD-008) | Không áp dụng ở bản đầu (YC8) | Không |
| Giá bán cho khách, phần cộng thêm | Không thấy | Chỉ sale của booking thấy: sale tạo yêu cầu, hoặc sale chủ nhà chọn khi ghi (YC4.1.3) | Không (QD-008) | Không áp dụng ở bản đầu (YC8) | Chỉ thấy giá đã cộng |
| Yêu cầu đặt phòng | Thấy mọi yêu cầu gửi tới mình | Chỉ yêu cầu của mình | Không (QD-008) | Không áp dụng ở bản đầu (YC8) | Không |
| Lý do từ chối | Chọn chip lý do ở CN9 (YC4.6 bước 5) | Thấy ở S3-05 | Không (QD-008) | Không áp dụng ở bản đầu (YC8) | Không |

### YC5 · Tìm phòng và gửi khách
Nhóm này cho sale xem lịch phòng của mọi căn mình bán, tìm căn trống theo ngày, xem giá, cộng giá của mình, rồi gửi thông tin và ảnh cho khách qua Zalo. Căn của chính sale luôn đứng đầu. Căn tự nhập không có lịch tự động nên ô ngày hiện "?". Việc đặt phòng với chủ nhà thuộc YC4, việc quản lý căn tự nhập thuộc YC6.

Quy tắc của nhóm (story trỏ tới bằng tên ngắn):

| Tên ngắn | Nội dung quy tắc | Yêu cầu dùng | Ví dụ số |
|---|---|---|---|
| Căn của tôi đứng đầu | Căn sale tự nhập luôn đứng đầu danh sách và kết quả, dù sắp xếp thế nào | YC5.1, YC5.3 | "CĂN CỦA TÔI · 2" trên "NGUỒN PHÒNG · 5" |
| Căn tự nhập không có lịch | Căn tự nhập không có lịch trống. Ô ngày ghi "?", không bao giờ ghi "trống". Ô có booking sale tự ghi ghi "Bạn". Muốn biết còn trống phải gọi chủ nhà | YC5.1, YC5.2, YC5.3 | "?" và "Bạn" |
| Giá bán gồm phần cộng thêm | Giá bán cho khách bằng giá chủ nhà cộng mức cộng thêm mỗi đêm của sale, có thể làm tròn lên 50.000đ. Mức mặc định đặt ở Cá nhân, sửa riêng từng căn ở S3. Khách và chủ nhà không thấy phần cộng thêm | YC5.3, YC5.4, YC5.5, YC5.6 | 2.200.000đ cộng 200k × 2 đêm = 2.600.000đ |
| Chữ và ảnh gửi riêng | Zalo không gửi chữ và ảnh chung một tin. Mỗi căn gửi chữ một lần, ảnh một lần | YC5.5 | 6 ảnh, 4 ảnh |
| Mẫu tin gửi khách | Tin gửi khách tạo từ mẫu có các ô điền sẵn: Ngày, Số đêm, Số căn, Danh sách căn, Tên sale | YC5.5, YC5.7 | "Em gửi anh chị 3 căn còn trống 10/10 → 12/10 (2 đêm)" |
| Độ tươi lịch | Mỗi căn của chủ nhà ghi lần cập nhật lịch gần nhất | YC5.3, YC5.4 | "Lịch cập nhật 2 giờ trước" |
| Sắp xếp danh sách | Ba cách: Theo tên, Giá tăng dần, Bán nhiều nhất | YC5.1, YC5.3 | Không |
| Báo căn đã gửi có người đặt | Sale gửi căn cho khách thì app ghi căn, các đêm, lúc gửi. Booking mới của bất kỳ ai chiếm ít nhất một đêm đó thì báo sale. Chỉ ghi căn và ngày (QD-011). Ngừng sau ngày nhận phòng của lần gửi. Không báo khi chính sale đó đặt. Mỗi căn, mỗi lần gửi báo một lần. Theo YC9.3 | YC5.5 | Chưa có ví dụ |

Ai thấy gì trong nhóm này:


| Dữ liệu | Chủ nhà | Sale đã kết nối | Người mở link chưa kết nối | Cộng tác viên | Khách |
|---|---|---|---|---|---|
| Lịch trống / kín của căn | Thấy mọi căn của mình | Thấy căn chủ nhà đã đồng ý, trừ căn chủ nhà đã xóa (YC3.9) | Không (QD-008) | Không áp dụng ở bản đầu (YC8) | Không |
| Giá chủ nhà theo đêm | Thấy | Luôn thấy với căn được chia sẻ, khi chủ nhà đã đặt giá (QD-007) | Không (QD-008) | Không áp dụng ở bản đầu (YC8) | Không thấy |
| Giá bán, mức cộng thêm | Không thấy | Chỉ sale đó thấy | Không (QD-008) | Không áp dụng ở bản đầu (YC8) | Thấy giá bán, không thấy phần cộng thêm |
| Ảnh, mô tả gửi khách, tòa nhà, loại view, số giường (không có tiện ích căn) | Thấy, sửa | Thấy, chọn gửi khách | Không (QD-008) | Không áp dụng ở bản đầu (YC8) | Phần sale gửi |
| Booking sale tự ghi cho căn tự nhập | Không | Chỉ sale đó | Không | Không áp dụng ở bản đầu (YC8) | Không |
| Mẫu tin, mức cộng mặc định | Không | Chỉ sale đó | Không | Không áp dụng ở bản đầu (YC8) | Không |
| Lần gửi khách (căn, đêm, lúc gửi) | Không | Chỉ sale đó | Không | Không áp dụng ở bản đầu (YC8) | Không |

### YC6 · Nguồn phòng và căn tự nhập
Nhóm này cho sale quản lý các căn mình bán: căn của chính sale, căn của chủ nhà đã kết nối (nguồn phòng), và căn của chủ chưa dùng app (căn tự nhập). Căn tự nhập không có lịch trống, nên sale phải gọi chủ hỏi. Sale chỉ lưu ảnh, giá và ghi lại booking đã chốt để tính thống kê. Việc tìm phòng và gửi khách thuộc YC5. Việc kết nối với chủ nhà thuộc YC1.

Quy tắc của nhóm (story trỏ tới bằng tên ngắn):

| Tên ngắn | Nội dung quy tắc | Yêu cầu dùng | Ví dụ số |
|---|---|---|---|
| Ba loại căn của sale | Căn của tôi (sale thuê lại để kinh doanh), căn của chủ nhà đã kết nối (nguồn phòng), căn tự nhập (chủ chưa dùng app) | YC6.1 | 2, 2 và 1 căn |
| Căn tự nhập chỉ sale đó thấy | Căn tự nhập và booking sale ghi cho nó chỉ sale đó thấy. Chủ nhà thật không thấy | YC6.3, YC6.4, YC6.5 | "Chỉ bạn thấy" |
| Booking sale tự ghi không phải lịch | Booking sale ghi cho căn tự nhập là ghi chép của sale để tính thống kê. Nó không làm ngày khác thành trống | YC6.4, YC6.5 | Ngày không có booking hiện "chưa chắc còn trống" |
| Phần chênh của sale | Đã viết thành QT3 (`QT.md`). Chênh = thu khách trừ trả chủ | YC6.4, YC6.5 | 3.400.000đ trừ 2.800.000đ bằng 600.000đ |
| Bỏ nguồn phải bấm hai lần | Bỏ nguồn phòng và xóa căn tự nhập đều cần bấm xác nhận lần hai | YC6.2, YC6.4 | "Xác nhận bỏ Chị Hoa?" |
| Giá điền sẵn từ giá chủ đã lưu | Khi ghi booking, tiền điền sẵn từ giá chủ sale đã lưu và giá bán của sale, sửa được | YC6.3, YC6.5 | Trả chủ 1.400.000đ |

Ai thấy gì trong nhóm này:


| Dữ liệu | Chủ nhà | Sale đã kết nối | Người mở link chưa kết nối | Cộng tác viên | Khách |
|---|---|---|---|---|---|
| Căn của tôi (sale thuê lại) | Không | Chỉ sale đó | Không | Không áp dụng ở bản đầu (YC8) | Phần sale gửi |
| Căn tự nhập và thông tin chủ căn | Không (chủ căn chưa dùng app) | Chỉ sale đó | Không | Không áp dụng ở bản đầu (YC8) | Phần sale gửi |
| Booking sale ghi cho căn tự nhập | Không | Chỉ sale đó | Không | Không áp dụng ở bản đầu (YC8) | Không |
| Phần chênh, "Bạn đã bán", "Tiền chênh" | Chủ nhà chỉ thấy một giá | Chỉ sale đó | Không | Không áp dụng ở bản đầu (YC8) | Không |
| Quyền chủ nhà cho sale xem (S6-04) | Chủ nhà đặt | Sale thấy phần được cho | Không (QD-008) | Không áp dụng ở bản đầu (YC8) | Không |

### YC7 · Thống kê
Nhóm này cho hai người xem số liệu theo tháng. Chủ nhà xem doanh thu, công suất phòng, doanh thu theo người bán và khoản chưa thu. Sale xem tiền chênh, số booking, doanh số theo chủ nhà và các booking đang chờ chủ. Số liệu lấy từ booking ở YC4 và booking sale tự ghi ở YC6. Số liệu trong ví dụ là dữ liệu minh họa của canvas.

Quy tắc của nhóm (story trỏ tới bằng tên ngắn):

| Tên ngắn | Nội dung quy tắc | Yêu cầu dùng | Ví dụ số |
|---|---|---|---|
| Doanh thu tính theo tháng | Mỗi số trên màn Thống kê thuộc một tháng lịch. Doanh thu và tiền chênh chia theo đêm, mỗi đêm thuộc tháng của đêm đó (QD-010, QT2.2, QT3.2); tiền của từng đêm theo QT4.2 | YC7.1, YC7.2, YC7.3, YC7.5 | Tháng 10 gồm 31 đêm |
| Công suất | Công suất = số đêm có khách chia cho (số căn × số đêm trong tháng) | YC7.1 | 13 chia (2 × 31) = 21.0% |
| So với tháng trước | Phần trăm = (tháng này trừ tháng trước) chia tháng trước, làm tròn một số lẻ | YC7.1, YC7.5 | (11.800.000 trừ 9.600.000) chia 9.600.000 = +22.9% |
| Khách lẻ là booking không qua sale | Booking chủ nhà tự ghi, không gắn sale, vào dòng "Khách lẻ" | YC7.3 | 2.600.000đ |
| Tiền chênh | Đã viết thành QT3. Tiền chênh = giá sale thu khách trừ giá chủ nhà, cộng theo booking đã chốt và booking chủ nhà ghi cho sale (QT3.1, YC4.1.3), chia theo đêm (QT3.2) | YC7.5, YC7.6 | 3.400.000đ trừ 2.800.000đ = 600.000đ |
| Chưa thu tiền | Booking chưa đủ cọc theo cách tính ở YC4 | YC7.4 | 1.900.000đ + 1.800.000đ = 3.700.000đ |
| Booking chờ chủ chưa tính | Yêu cầu của sale chưa được chấp nhận chưa vào Booking, Doanh số, Tiền chênh | YC7.5, YC7.6 | 1 yêu cầu chờ |

Ai thấy gì trong nhóm này:

| Dữ liệu | Chủ nhà | Sale đã kết nối | Người mở link chưa kết nối | Cộng tác viên | Khách |
|---|---|---|---|---|---|
| Doanh thu, công suất, doanh thu từng phòng | Thấy | Không | Không | Không áp dụng ở bản đầu (YC8) | Không |
| Doanh thu theo người bán | Thấy (chỉ một giá) | Không | Không | Không áp dụng ở bản đầu (YC8) | Không |
| Chưa thu tiền | Thấy | Không | Không | Không áp dụng ở bản đầu (YC8) | Không |
| Tiền chênh, doanh số của sale | Không thấy phần chênh | Chỉ sale đó | Không | Không áp dụng ở bản đầu (YC8) | Không |
| Booking của tôi và trạng thái | Thấy trong YC4 | Chỉ sale đó | Không | Không áp dụng ở bản đầu (YC8) | Không |
| Số liệu của sale khác trong nhóm | Không | ? (xem YC8) | Không | Không áp dụng ở bản đầu (YC8) | Không |

### YC8 · Đội nhóm, cộng tác viên
Chưa làm ở bản phát hành đầu (YC8). Mọi yêu cầu dưới đây giữ nguyên để làm sau; cách chia nguồn sẽ chốt lại khi làm.

Nhóm này cho các sale bán chung theo nhóm. Một sale làm trưởng nhóm, tạo nhóm, chọn nguồn phòng chia sẻ và mời sale khác. Cả nhóm dùng chung nguồn phòng, thấy ai đang gửi yêu cầu căn nào để không gửi trùng khách. Trưởng nhóm thấy booking và tiền chênh của thành viên. Canvas không có màn riêng cho "cộng tác viên": trong nhóm này tôi hiểu cộng tác viên là thành viên nhóm (xem YC8-H9).

Quy tắc của nhóm (story trỏ tới bằng tên ngắn):

| Tên ngắn | Nội dung quy tắc | Yêu cầu dùng | Ví dụ số |
|---|---|---|---|
| Chia sẻ nguồn phòng cho nhóm | Trưởng nhóm chọn nguồn phòng nào cả nhóm tìm được. Chủ nhà được báo và có thể tắt chia sẻ | YC8.2, YC8.4, YC8.5 | 3 chủ nhà, 7 căn |
| Trưởng nhóm thấy booking và tiền chênh | Trưởng nhóm thấy booking và tiền chênh của từng thành viên. Thành viên thường chỉ thấy của mình | YC8.4, YC8.5, YC8.6, YC8.7 | 6 booking · chênh 3.1tr |
| Thấy ai đang chờ chủ | Cả nhóm thấy yêu cầu đặt phòng đang chờ chủ của nhau, để không gửi trùng khách | YC8.5, YC8.7 | 2 yêu cầu chờ |
| Nguồn phòng riêng vẫn của riêng | Vào nhóm không làm mất hay lộ nguồn phòng riêng của sale | YC8.4, YC8.7 | "Nguồn phòng riêng của bạn vẫn là của bạn" |
| Link mời của nhóm | Link mời mở trong Zalo; sale đồng ý thì vào nhóm. app không tự gửi tin | YC8.3, YC8.4 | Một link cho cả nhóm |

Ai thấy gì trong nhóm này:

| Dữ liệu | Chủ nhà | Sale đã kết nối | Người mở link chưa kết nối | Cộng tác viên | Khách |
|---|---|---|---|---|---|
| Nhóm, thành viên | Không (xem YC8-H1) | Thành viên nhóm | Người nhận link thấy lời mời (S8-03) | ? | Không |
| Nguồn phòng chung | Được báo, tắt được | Thành viên nhóm thấy (S8-01 nói "tìm được") | Không | ? | Không |
| Booking và tiền chênh của thành viên | Không thấy phần chênh | Trưởng nhóm thấy của mọi người; thành viên thấy của mình | Không | ? | Không |
| Yêu cầu chờ chủ của người khác | Thấy yêu cầu trong YC4 | Thành viên nhóm thấy | Không | ? | Không |
| Căn tự nhập | Không | Chỉ sale tạo nó (xem YC8-H2) | Không | ? | Không |

### YC9 · Quản trị và dữ liệu
Nhóm này là tab Cá nhân: menu tài khoản, hồ sơ, cài đặt, và phần dữ liệu (sao lưu, xuất file). Có hai menu: P1 cho chủ nhà và P4 cho sale. Các dòng liên quan nhóm khác nằm ở nhóm đó và được trỏ tới ở bảng đầu YC9.1.

Quy tắc của nhóm (story trỏ tới bằng tên ngắn):

| Tên ngắn | Nội dung quy tắc | Yêu cầu dùng | Ví dụ số |
|---|---|---|---|
| Menu theo vai trò | Chủ nhà thấy CÀI ĐẶT, DỮ LIỆU, HỖ TRỢ. Sale thấy BÁN PHÒNG, CÀI ĐẶT, HỖ TRỢ. Cả hai thấy TÀI KHOẢN và Đăng xuất | YC9.1 | P1 và P4 |
| Tên hiển thị | Tên hiển thị là tên sale thấy trong Nguồn phòng. Người dùng sửa được. Họ và tên và tên hiển thị là hai ô | YC9.2 | "Sale thấy tên này trong Nguồn phòng" |
| Thông báo qua Zalo cần đồng ý | Người dùng phải đồng ý nhận thông báo Zalo thì app mới gửi được (docs/zalo/rang-buoc.md, mục 2.7). Bản đầu không dùng cho YC9.3 (YC9.3) | YC9.5 | Hộp thoại Zalo lần đầu |
| Giờ nhận trả áp dụng mọi căn | Giờ nhận, trả đặt một lần cho tất cả căn của chủ nhà | YC9.4 | 14:00 · 12:00 |
| Xóa nhầm phải cảnh báo | Hành động thay thế toàn bộ dữ liệu phải cảnh báo trước | YC9.5 | "Toàn bộ dữ liệu hiện tại sẽ được thay" |

Ai thấy gì trong nhóm này:

| Dữ liệu | Chủ nhà | Sale đã kết nối | Người mở link chưa kết nối | Cộng tác viên | Khách |
|---|---|---|---|---|---|
| Hồ sơ của mình | Thấy, sửa | Thấy, sửa | Không có hồ sơ cho tới khi kết nối (xem YC1) | Không áp dụng ở bản đầu (YC8) | Không |
| Tên hiển thị | Sale thấy tên chủ nhà trong Nguồn phòng | Chủ nhà thấy tên sale | Không | Không áp dụng ở bản đầu (YC8) | Không |
| Sao lưu, xuất Excel | Chỉ chủ nhà, chỉ dữ liệu của mình | Không | Không | Không áp dụng ở bản đầu (YC8) | Không |
| Giờ nhận, trả mặc định | Đặt | Thấy khi gửi khách (S3) | Không | Không áp dụng ở bản đầu (YC8) | Thấy giờ trong tin sale gửi |
| Cài đặt thông báo | Của mình | Của mình | Không | Không áp dụng ở bản đầu (YC8) | Không |

### YC10 · Quản trị Home247 trên web
Nhóm này cho người quản trị của Home247 (vai ADMIN) làm việc vận hành trên trang quản trị riêng, không nằm trong các tab của chủ nhà và sale. Mục đầu tiên là dải ngày lễ hằng năm mà chủ nhà chọn nhanh ở YC3.5. Mục thứ hai là danh sách tòa nhà đặt sẵn mà chủ nhà chọn ở YC3.2.2. Mục thứ ba là thêm người đồng quản trị (YC10.3). Người quản trị đăng nhập bằng mã gửi tới email của mình; quản trị viên đầu tiên là <email quản trị viên đầu tiên> (YC10.3). Các mục quản trị khác (hỗ trợ, tra cứu tài khoản) và bản web cho chủ nhà thuộc và, chưa viết ở đây. Chưa có thiết kế. Câu có thẻ [MỞ: LC-H4] chờ trả lời ở `docs/Cau_hoi_mo.md`.

Cột "app" trong bảng hành vi ghi việc web quản trị hiện, vì nhóm này không chạy trong app.

> **Bản PWA:** trang quản trị nằm trong cùng PWA ở đường dẫn riêng (`/quan-tri`), chỉ tài khoản trong bảng `admins` vào được. Làm sau bản 1. Xem `PWA.md` mục P11.

Ai thấy gì trong nhóm này:

| Dữ liệu | Quản trị viên (ADMIN) | Chủ nhà | Sale | Khách |
|---|---|---|---|---|
| Dải ngày lễ của Home247 | Thấy, thêm, sửa, xóa | Thấy trong "Chọn nhanh ngày lễ" (YC3.5) | ? | Không |
| Danh sách tòa nhà | Thấy mọi tòa, thêm, sửa | Thấy mọi tòa, thêm tòa mới (YC3.2.2) | Thấy mọi tòa, thêm tòa mới khi nhập căn của mình | Tên tòa trong tin sale gửi |
| Danh sách quản trị viên (email) | Thấy. Chỉ quản trị viên đầu tiên thêm, gỡ (YC10.3) | Không | Không | Không |
