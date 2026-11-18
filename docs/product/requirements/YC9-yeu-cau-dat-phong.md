---
id: YC9
tieu_de: Yêu cầu đặt phòng
trang_thai: de-xuat
nguoi_chu: tung
rev: 1
ban: 1
---
# YC9 · Yêu cầu đặt phòng

## Mục tiêu

Là sale, tôi muốn gửi yêu cầu đặt phòng cho chủ nhà ngay trong app và biết kết quả, để chốt đêm cho khách mà không phải gọi điện. Là chủ nhà, tôi muốn thấy yêu cầu, chấp nhận hay từ chối bằng một chạm, để đặt phòng vào lịch mà không phải ghi lại tay.

Vì sao quan trọng: đây là chỗ hai bên chốt tiền với nhau. Hai yêu cầu cùng đêm mà cùng được nhận thì một khách mất phòng, nên database phải bảo đảm mỗi đêm chỉ một đặt phòng. Yêu cầu không trả lời mà treo mãi thì sale không dám hứa với khách, nên yêu cầu phải có hạn.

## Luồng chính

Ngày 06/10/2026, Sale Hùng xem ICON40 1509 cho 10/10 → 12/10 (YC7.4) và bấm "Gửi yêu cầu đặt phòng". S3-02 ghi "Giá bán cho khách 2.600.000đ", "Giá chủ nhà 2.200.000đ". Hùng nhắn "Khách gia đình 2 người lớn 1 bé", bấm gửi lúc 14:20. S3-03 ghi "Đang chờ Chị Hoa chấp nhận".

Chị Hoa mở tab Lịch, thấy khối "YÊU CẦU ĐẶT PHÒNG · 1", bấm "Xem và trả lời". CN9 ghi "Giá của bạn 2.200.000đ", không có 2.600.000đ. Lúc 15:05 Chị Hoa bấm "Chấp nhận đặt phòng". Đặt phòng B1 vào lịch, 1509 kín 10/10 và 11/10 với mọi sale. Hùng có thông báo "Chị Hoa đã chấp nhận đặt phòng" và mở S3-04.

Ngày 07/10, Hùng còn yêu cầu Y1 À La Carte 2208 · 10/10 → 12/10 chờ Anh Tuấn. Yêu cầu Y2 ICON40 1509 · 27/09 → 28/09 đã hết hạn vì Chị Hoa không trả lời trong 2 tuần (DLM.6).

## Phạm vi

YC này gồm: sale gửi, xem, hủy yêu cầu; chủ nhà xem, chấp nhận, từ chối; yêu cầu trùng đêm; hết hạn; màn kết quả của sale kèm căn tương tự.

Không thuộc YC này (dễ tưởng là có):
- Chi tiết căn và nút mở S3-02: YC7.4. Danh sách yêu cầu của sale ở thống kê (S7-03): YC11.
- Đặt phòng sau khi đã nhận (xem, sửa, xin hủy): YC5. Chủ nhà ghi đặt phòng trùng đêm với yêu cầu chờ: YC5.3 gọi quy tắc của YC này.
- Danh sách thông báo, popup, công tắc từng loại: YC12. Tin Zalo cho chủ nhà (CN9-00): bản sau.
- Xin số điện thoại khi gửi hay chấp nhận: YC6.1.
- Đặt phòng với chủ nhà đã xóa tài khoản (S3-11): YC1.
- Số "đã bán 12 đặt phòng của bạn" ở CN9: chưa làm ([MỞ: YC9-H9]).

## Quy tắc của nhóm

| Tên | Quy tắc | Ví dụ |
|---|---|---|
| Yêu cầu chưa phải đặt phòng | Yêu cầu chưa chiếm đêm nào. Chỉ khi chủ nhà chấp nhận mới thành đặt phòng. Không có bước giữ phòng hay báo cọc | Y1 chờ, 2208 vẫn trống 10/10 với các sale khác |
| Trạng thái yêu cầu | Chờ chủ → Đã chốt (chủ nhà chấp nhận), Bị từ chối (chủ nhà từ chối, hay đêm bị đặt phòng khác lấy), Hết hạn (quá 14 ngày từ lúc gửi), Đã hủy (sale hủy). Chỉ yêu cầu Chờ chủ mới đổi được. Bốn trạng thái kia là cuối | Y2 Hết hạn |
| Giá chốt lúc gửi | Giá chủ nhà và giá bán của yêu cầu do database tính lúc gửi, không nhận giá từ app. Chấp nhận thì đặt phòng mang đúng giá đó | 2.200.000đ, 2.600.000đ |
| Một đêm, một bên thắng | Chủ nhà chấp nhận một yêu cầu, hay ghi một đặt phòng (YC5.3), thì mọi yêu cầu chờ của căn đó có đêm chồng chuyển Bị từ chối, lý do "đã nhận đặt phòng khác". Gửi yêu cầu cho đêm đã có đặt phòng thì bị chặn ngay (giả định GD11) | Nhận Sale Hùng 17/10 → 19/10 thì Sale Lan 18/10 → 19/10 bị từ chối |
| Người xóa tài khoản | Yêu cầu chờ không đổi khi một bên xóa tài khoản; vẫn hết hạn sau 14 ngày. Gửi yêu cầu mới tới căn của chủ nhà đã xóa tài khoản thì bị từ chối (QD13) | "Không gửi được yêu cầu. Chủ nhà đã xóa tài khoản trên Home247." |

Quy tắc dùng chung: Chặn trùng lịch QT1.4, Đêm và tiền QT1.1, QT2.1, QT5.6 Chống gửi trùng, QT6.2 Chủ nhà chỉ làm việc với sale.

## Ai được làm gì

Theo `docs/security/PQ-ma-tran-quyen.md`: PQ2, PQ5.SALE, PQ7.CHU, PQ10.CHU, PQ10.SALE, PQ11.CHU, PQ11.SALE, PQ19. Test vi phạm phải có, ở lớp database:
- Sale chưa kết nối, căn ngoài phạm vi, căn đã ẩn, căn của chính mình, căn tự nhập: không gửi được; sale bị ngừng: bị từ chối kèm lý do (YC9.1-NT8).
- Sale Lan không đọc, không hủy được yêu cầu của Sale Hùng và không biết nó có tồn tại; sale không tự chấp nhận, từ chối yêu cầu của mình (YC9.1-NT9).
- Anh Tuấn không đọc, chấp nhận, từ chối được yêu cầu tới căn của Chị Hoa; chủ nhà không hủy thay sale (YC9.2-NT8).
- Dữ liệu chủ nhà đọc không có giá bán, tiền chênh, mức cộng (YC9.2-NT2).
- App gửi kèm giá thì database bỏ qua, giá vẫn do database tính (YC9.1-NT4).
- Thông báo cho sale bị từ chối vì trùng đêm không có tên sale được nhận, giá bán của sale đó, tên khách (YC9.3-NT3).
- Hai lệnh chấp nhận hai yêu cầu trùng đêm cùng lúc: chỉ một lệnh qua (YC9.3-NT4).

## Dữ liệu

Mô hình chung: `docs/architecture/thiet-ke-db.md`. YC này cần database bảo đảm:
- Yêu cầu đặt phòng: căn, sale, ngày nhận, ngày trả, lời nhắn (tối đa 500 ký tự), giá chủ nhà và giá bán từng đêm tính lúc gửi, trạng thái, lý do từ chối, lúc gửi, hạn (lúc gửi + 14 ngày).
- Chấp nhận là một giao dịch: tạo đặt phòng nguồn "từ yêu cầu" mang giá của yêu cầu, ghi phần riêng của sale (QD11), yêu cầu sang Đã chốt, các yêu cầu chờ chồng đêm sang Bị từ chối, ghi thông báo. Chặn trùng của đặt phòng là chỗ chặn cuối (QD6).
- Hết hạn: việc chạy định kỳ (mỗi 10 phút) đổi yêu cầu quá hạn sang Hết hạn và ghi một thông báo cho sale; khi đọc, yêu cầu quá hạn cũng coi là Hết hạn. Chạy hai lần không ghi hai thông báo.
- Cờ trùng: khi chủ nhà đọc yêu cầu chờ, mỗi dòng biết có chồng đêm với yêu cầu chờ khác của cùng căn không, và của sale nào.

## Trạng thái màn (mọi mục)

- Đang tải: HV1. Mất mạng: HV2. Quay lại từ nền: HV3; ở S3-03 thì đọc lại trạng thái yêu cầu. Không có quyền: HV5.
- Bấm khi yêu cầu vừa đổi ở máy khác: báo "Yêu cầu đã đổi trạng thái" và hiện trạng thái mới (HV3).

## YC9.1 · Sale gửi và hủy yêu cầu

Bản 1 · rủi ro: cao · Màn: S3-02, S3-03, S3-07, S3-08

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Bấm "Gửi yêu cầu đặt phòng" ở S3 (YC7.4) | S3-02: thẻ căn, "Chị Hoa · 10/10 → 12/10 (2 đêm)", "Giá bán cho khách 2.600.000đ", "Giá chủ nhà 2.200.000đ", ô "Nhắn chủ nhà (không bắt buộc)" | Giá chủ nhà, giá bán từng đêm |
| 2 | Bấm "Gửi yêu cầu đặt phòng" | YC6.1 nếu hồ sơ chưa có số ("Để sau" vẫn gửi). Gửi xong sang S3-03 | Kiểm quyền, kiểm đêm còn trống, tính giá, tạo yêu cầu Chờ chủ, ghi thông báo cho chủ nhà |
| 3 | Xem S3-03 | "Đang chờ Chị Hoa chấp nhận", "Đã gửi lúc 14:20 trong app. Nhắn thêm qua Zalo để chủ nhà thấy nhanh hơn. Bạn được báo khi chủ nhà chấp nhận hoặc từ chối." Nút "Nhắn chủ nhà qua Zalo", "Gọi chủ nhà" (pwa.md P5), "Hủy yêu cầu" | Không |
| 3a | Gửi khi có đêm đã có đặt phòng | S3-07: "Căn này đã được đặt rồi", "Đêm 10/10 và 11/10 vừa có người đặt. Yêu cầu chưa được gửi.", lịch căn tải lại với đêm Kín, nút "Tìm căn khác cùng ngày" (YC7.3) | Từ chối, không tạo yêu cầu |
| 3b | Gửi tới căn của chủ nhà đã xóa tài khoản | Báo "Không gửi được yêu cầu. Chủ nhà đã xóa tài khoản trên Home247." | Từ chối, không tạo yêu cầu |
| 4 | Bấm "Hủy yêu cầu" | Nút đổi thành "Xác nhận hủy yêu cầu?"; bấm lần nữa sang S3-08 "Đã hủy yêu cầu", "Chị Hoa không còn thấy yêu cầu này." | Yêu cầu sang Đã hủy |

Chủ nhà chưa cho số thì hai nút "Nhắn chủ nhà qua Zalo", "Gọi chủ nhà" làm gì: [MỞ: YC9-H8]. Tiêu đề màn S3-02 ("Đặt phòng" trùng chữ nút của chủ nhà): [MỞ: YC9-H7].

Luật kiểm:

| Ô | Luật | Sai thì |
|---|---|---|
| Căn | Căn có lịch, sale được xem (PQ10.SALE) | Không tìm thấy |
| Ngày nhận | Ngày nhận trước hôm nay: [MỞ: YC9-H1] | |
| Ngày trả | Sau ngày nhận, tối đa 366 đêm | "Ngày trả phải sau ngày nhận" |
| Lời nhắn | Tối đa 500 ký tự; toàn khoảng trắng coi như trống | "Lời nhắn tối đa 500 ký tự" |
| Giá | Mọi đêm đã có giá chủ nhà. Có đêm "Chưa đặt": [MỞ: YC9-H2] | |

Tiêu chí:
- **YC9.1-NT1** Khi sale gửi yêu cầu, thì app sang S3-03 và ghi giờ đã gửi. · unit, database
- **YC9.1-NT2** Khi yêu cầu Y1 đang chờ, thì 2208 chưa có đặt phòng 10/10, 11/10 và các sale khác vẫn thấy hai đêm đó trống. · database
- **YC9.1-NT3** Khi sale xem S3-02, thì thấy cả giá bán cho khách và giá chủ nhà. · unit
- **YC9.1-NT4** Khi app gửi kèm giá chủ nhà 1đ và giá bán 1đ, thì yêu cầu vẫn ghi 2.200.000đ và 2.600.000đ. · database
- **YC9.1-NT5** Khi sale gửi 10/10 → 12/10 cho 1509 sau khi B1 đã có, thì app báo "Căn này đã được đặt rồi", không có yêu cầu mới, và lịch căn hiện 10/10, 11/10 Kín. · database, unit
- **YC9.1-NT6** Khi hồ sơ sale chưa có số và sale bấm gửi, thì thẻ xin số hiện trước; bấm "Để sau" thì yêu cầu vẫn được gửi. · unit
- **YC9.1-NT7** Khi sale hủy yêu cầu đang chờ, thì yêu cầu có nhãn "Đã hủy" và không còn ở khối yêu cầu của chủ nhà. · database, unit
- **YC9.1-NT8** Khi sale chưa kết nối, căn ngoài phạm vi, căn đã ẩn, căn của chính mình hay căn tự nhập, thì không gửi được và không biết căn có tồn tại; khi sale bị ngừng hay chủ nhà đã xóa tài khoản, thì bị từ chối kèm lý do. · database
- **YC9.1-NT9** Khi Sale Lan đọc hay hủy yêu cầu của Sale Hùng, hay Hùng tự chấp nhận yêu cầu của mình, thì không được và không lộ yêu cầu có tồn tại. · database
- **YC9.1-NT10** Khi sale bấm gửi hai lần liền (cùng khóa chống gửi trùng), thì chỉ có một yêu cầu. · database

## YC9.2 · Chủ nhà trả lời yêu cầu

Bản 1 · rủi ro: cao · Màn: CN1-03, CN9, CN9-02, CN9-03

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Mở tab Lịch khi có yêu cầu chờ | CN1-03: khối "YÊU CẦU ĐẶT PHÒNG · 2", mỗi dòng tên sale, căn, ngày, "gửi 10 phút trước", nhãn "Chờ bạn", nút "Xem và trả lời". Không có yêu cầu chờ thì không có khối | Yêu cầu chờ tới căn của chủ nhà, có giá chủ nhà, không có giá bán |
| 2 | Bấm "Xem và trả lời", hay chạm thông báo (YC12) | CN9: tên sale, nút "Gọi", Phòng, Ngày ở, "Giá của bạn 2.200.000đ", mục "SALE NHẮN" | Như bước 1 |
| 3 | Bấm "Chấp nhận đặt phòng" | YC6.1 nếu hồ sơ chủ nhà chưa có số ("Để sau" vẫn chấp nhận). Rồi CN9-02: "Đã nhận đặt phòng 1509", "Đặt phòng đã vào lịch. Sale Hùng được báo.", nút "Xem đặt phòng" (YC5.5), "Về lịch" | Giao dịch chấp nhận (mục Dữ liệu); yêu cầu không còn Chờ chủ thì từ chối |
| 4 | Bấm "Từ chối" | Ba chip "Đã có khách đặt", "Đang sửa phòng", "Lý do khác", nút "Gửi từ chối cho sale", "Quay lại" | Không |
| 5 | Chọn lý do, bấm "Gửi từ chối cho sale" | CN9-03: "Đã từ chối yêu cầu của Sale Hùng", "Sale Hùng được báo kèm lý do "Đã có khách đặt". Ngày 17/10 → 19/10 vẫn trống trong lịch.", nút "Về lịch" | Yêu cầu sang Bị từ chối kèm lý do, ghi thông báo cho sale |

Bắt buộc chọn lý do không, "Lý do khác" có ô nhập chữ không: [MỞ: YC9-H10]; tới khi có câu trả lời, chỉ có ba chip và lý do không bắt buộc. Chấp nhận khi sale đã bị ngừng hay đã bỏ nguồn sau lúc gửi: [MỞ: YC9-H4]. Chấp nhận khi ngày nhận đã qua: [MỞ: YC9-H5].

Tiêu chí:
- **YC9.2-NT1** Khi chủ nhà bấm thông báo yêu cầu hay "Xem và trả lời", thì app mở đúng yêu cầu đó ở CN9. · unit
- **YC9.2-NT2** Khi chủ nhà ở CN1-03 hay CN9, thì chỉ thấy "Giá của bạn"; dữ liệu trả về không có giá bán, tiền chênh, mức cộng. · database, unit
- **YC9.2-NT3** Khi Chị Hoa chấp nhận yêu cầu của Hùng, thì B1 vào lịch với đêm 10/10, 11/10, giá chủ nhà 2.200.000đ, Hùng là người đặt, và Hùng được báo. · database
- **YC9.2-NT4** Khi chủ nhà bấm "Từ chối", chọn "Đã có khách đặt" rồi gửi, thì app sang CN9-03, yêu cầu có nhãn "Bị từ chối" và sale thấy lý do "Đã có khách đặt". · database, unit
- **YC9.2-NT5** Khi chủ nhà chấp nhận một yêu cầu sale vừa hủy ở máy khác, thì không có đặt phòng và app báo yêu cầu đã đổi trạng thái. · database
- **YC9.2-NT6** Khi hồ sơ chủ nhà chưa có số và chủ nhà bấm chấp nhận, thì thẻ xin số hiện trước; bấm "Để sau" thì vẫn chấp nhận. · unit
- **YC9.2-NT7** Khi không có yêu cầu chờ, thì CN1 không có khối "YÊU CẦU ĐẶT PHÒNG". · unit
- **YC9.2-NT8** Khi Anh Tuấn đọc, chấp nhận hay từ chối yêu cầu tới 1509, hay Chị Hoa hủy yêu cầu thay sale, thì không được. · database

## YC9.3 · Yêu cầu trùng đêm

Bản 1 · rủi ro: cao · Màn: CN1-03, CN9, CN9-02, S3-05

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Chủ nhà mở tab Lịch khi hai yêu cầu chờ chồng đêm | Dòng "Sale Lan đặt phòng 1509 · 18/10 → 19/10 · trùng ngày với Sale Hùng" | Cờ trùng |
| 2 | Mở CN9 | "Trùng 18/10 với yêu cầu của Sale Lan. Chấp nhận yêu cầu này thì yêu cầu của Sale Lan bị từ chối và Sale Lan được báo." | Như bước 1 |
| 3 | Chấp nhận | CN9-02 thêm "Yêu cầu của Sale Lan (18/10 → 19/10) đã bị từ chối. Sale Lan được báo." | Yêu cầu chồng đêm sang Bị từ chối, lý do đã nhận đặt phòng khác; ghi thông báo cho từng sale |
| 4 | Chủ nhà ghi đặt phòng chồng đêm với yêu cầu chờ (YC5.3) | Sale nhận S3-05 (YC9.4) | Như bước 3 (giả định GD11) |

Tiêu chí:
- **YC9.3-NT1** Khi hai yêu cầu chờ chồng đêm, thì mỗi yêu cầu có nhãn trùng ngày ở CN1-03 và cảnh báo ở CN9. · database, unit
- **YC9.3-NT2** Khi chủ nhà chấp nhận một yêu cầu, thì mọi yêu cầu chờ chồng đêm với nó có nhãn "Bị từ chối" và sale của chúng được báo. · database
- **YC9.3-NT3** Khi Sale Lan nhận thông báo bị từ chối vì trùng đêm, thì thông báo không có tên Sale Hùng, giá bán của Hùng, tên khách. · database
- **YC9.3-NT4** Khi hai lệnh chấp nhận hai yêu cầu chồng đêm chạy cùng lúc, thì chỉ một lệnh qua và không có hai đặt phòng chồng đêm. · database
- **YC9.3-NT5** Khi chủ nhà ghi đặt phòng chồng đêm với một yêu cầu chờ, thì yêu cầu đó có nhãn "Bị từ chối". (giả định GD11) · database

## YC9.4 · Sale nhận kết quả

Bản 1 · rủi ro: tb · Màn: S3-04, S3-04-01, S3-05, S3-09

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Chủ nhà chấp nhận | S3-04: "Chị Hoa đã chấp nhận đặt phòng", "Đặt phòng đã vào lịch của chủ nhà. Ngày 10/10 → 12/10 hiện Kín với các sale khác.", nút "Về lịch phòng". Mở từ thông báo thì S3-04-01, quay lại về Thông báo | Thông báo cho sale |
| 2 | Chủ nhà từ chối | S3-05: "Yêu cầu bị từ chối", "Lý do: Chị Hoa không nhận đặt phòng · Đã có khách đặt." Mục "CĂN TƯƠNG TỰ TRỐNG CÙNG NGÀY", nút "Xem tất cả căn trống" (YC7.3 cùng ngày) | Căn tương tự |
| 3 | Bị từ chối vì trùng đêm | S3-05 với lý do "Chị Hoa đã nhận đặt phòng khác cho 10/10 → 12/10." | Như bước 2 |
| 4 | Hết 14 ngày | S3-09: "Yêu cầu đã hết hạn vì Chị Hoa chưa trả lời trong 2 tuần. Gửi lúc 14:20 ngày 22/09.", cùng mục căn tương tự | Việc hết hạn; một thông báo cho sale |

Căn tương tự: căn sale được xem, trống mọi đêm của yêu cầu, bỏ căn của yêu cầu này; mỗi căn ghi giá bán của sale cho các đêm đó (YC7.4), không ghi giá chủ nhà. Chạm một căn mở S3 của căn đó.

Thông báo cho chủ nhà khi sale hủy yêu cầu, và thông báo yêu cầu cũ chủ nhà đã nhận còn giữ không: [MỞ: YC9-H6]. Sale bị ngừng còn đọc được yêu cầu cũ của mình với chủ nhà đó không: [MỞ: YC9-H3].

Tiêu chí:
- **YC9.4-NT1** Khi chủ nhà chấp nhận, thì sale thấy S3-04 và 10/10, 11/10 Kín với các sale khác. · database, unit
- **YC9.4-NT2** Khi chủ nhà từ chối, thì sale thấy S3-05 kèm lý do và danh sách căn tương tự trống cùng ngày. · unit
- **YC9.4-NT3** Khi bị từ chối vì chủ nhà nhận đặt phòng khác, thì S3-05 ghi "Chị Hoa đã nhận đặt phòng khác cho 10/10 → 12/10." · unit
- **YC9.4-NT4** Khi yêu cầu gửi 14:20 ngày 22/09 mà tới 14:20 ngày 06/10 chủ nhà chưa trả lời, thì yêu cầu là "Hết hạn", sale có đúng một thông báo và thấy S3-09. · database, unit
- **YC9.4-NT5** Khi sale xem căn tương tự ở S3-05 hay S3-09, thì mỗi căn ghi giá bán của sale, dữ liệu trả về không có giá chủ nhà của căn đó, và không có căn của yêu cầu. · database, unit
- **YC9.4-NT6** Khi chủ nhà xóa tài khoản lúc yêu cầu đang chờ, thì yêu cầu vẫn Chờ chủ và hết hạn sau 14 ngày như thường. · database

## Màn hình

Xem hình: `python3 scripts/trich-man.py <mã>`. Chữ và số trên hình lệch YC thì YC đúng.

- **S3-02 · Gửi yêu cầu.** Tiêu đề trên hình "Đặt phòng" ([MỞ: YC9-H7]).
- **S3-03 · Chờ chủ nhà.** Đúng bố cục.
- **S3-04, S3-04-01 · Đã chấp nhận.** Đúng bố cục.
- **S3-05, S3-09 · Bị từ chối, hết hạn.** Giá căn tương tự trên hình chưa theo DLM.
- **S3-07 · Căn đã được đặt.** Đúng bố cục.
- **S3-08 · Đã hủy.** Đúng bố cục.
- **CN1-03 · Lịch có yêu cầu.** Ví dụ trùng 17/10 → 19/10 và 18/10 → 19/10 giữ theo hình.
- **CN9, CN9-02, CN9-03 · Trả lời yêu cầu.** Bỏ dòng "đã bán 12 đặt phòng của bạn" ([MỞ: YC9-H9]).
- Không làm: CN9-00 (tin Zalo), S3-02-P1/P2, CN9-P1/P2 (hộp thoại của Zalo; bản PWA xin số theo YC6.1).

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Tạo từ story US15 (QD21) | Cả file |
