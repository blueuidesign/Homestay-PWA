---
id: YC10
tieu_de: Nguồn phòng và căn tự nhập
trang_thai: de-xuat
nguoi_chu: tung
rev: 3
ban: 2
---
# YC10 · Nguồn phòng và căn tự nhập

## Mục tiêu

Là sale, tôi muốn thấy ở một chỗ mọi căn mình bán (căn của tôi, căn của chủ nhà đã kết nối, căn của chủ chưa dùng app), lưu căn của chủ chưa dùng app và ghi lại đặt phòng đã chốt qua điện thoại, để không phải nhớ trong đầu và để đặt phòng đó vào thống kê của mình.

Vì sao quan trọng: nhiều chủ nhà ở Hạ Long chưa dùng app, sale vẫn bán căn của họ. Không có chỗ lưu thì sale quên giá chủ báo, quên đã chốt đêm nào. Nhưng app không biết lịch của căn này, nên không bao giờ được hiện "trống" cho nó, nếu không sale sẽ hứa với khách một căn có thể đã kín.

## Luồng chính

Ngày 07/10/2026, Sale Hùng mở tab Căn. Nhóm "CĂN CỦA TÔI · 2": Green Bay 0812, Mường Thanh 1605. Nhóm "CHỦ NHÀ ĐÃ KẾT NỐI · 2": Chị Hoa (1509, 3402), Anh Tuấn (Sapphire 1103, À La Carte 2208). Nhóm "CĂN TỰ NHẬP · 1": Villa Tuần Châu, "Chú Bình · chưa dùng app · gọi hỏi lịch".

Khách hỏi Villa Tuần Châu đêm 08/10. Hùng gọi Chú Bình, chú báo còn phòng, giá 1.400.000đ. Hùng mở Villa Tuần Châu, bấm "Đặt phòng". S6-05 điền sẵn "Trả chủ 1.400.000đ", "Thu khách 1.600.000đ", "Bạn lời 200.000đ". Hùng chọn "Mai 08/10", 1 đêm, bấm "Đặt phòng". Toast "Đã lưu đặt phòng 08/10 → 09/10. Tính vào thống kê tháng 10." Đó là V2 (DLM.6). Ở lịch 7 ngày (YC7.1), ô 08/10 của Villa ghi "Bạn", các ô khác vẫn "?".

## Phạm vi

YC này gồm: tab Căn của sale, chi tiết căn của tôi, chi tiết chủ nhà và bỏ nguồn, dòng chủ nhà đã xóa tài khoản, thêm, xem, sửa, xóa căn tự nhập, ghi đặt phòng cho căn tự nhập.

Không thuộc YC này (dễ tưởng là có):
- Lịch 7 ngày, tìm phòng, chi tiết căn của chủ nhà (S3): YC7. Ô "?" và "Bạn" của căn tự nhập trên lịch: YC7.1.
- Thêm, sửa căn của tôi, giá theo tháng: YC3, YC4 (sale làm như chủ nhà). Ghi đặt phòng cho căn của tôi: YC5.
- Gửi khách: YC8. Xin lịch chủ nhà (A6): YC6.4. Thống kê, danh sách đặt phòng của sale: YC11.
- Ghép căn tự nhập với căn thật khi chủ căn dùng app: chưa làm ([MỞ: YC10-H4]).
- Sửa, xóa đặt phòng sale đã ghi cho căn tự nhập: chưa có màn ([MỞ: YC10-H7]).

## Quy tắc của nhóm

| Tên | Quy tắc | Ví dụ |
|---|---|---|
| Ba loại căn của sale | Căn của tôi (sale sở hữu hay thuê lại để kinh doanh, QD5), nguồn phòng (căn chủ nhà đã chia sẻ), căn tự nhập (căn của chủ chưa dùng app, sale tự lưu) | 2, 2 chủ nhà, 1 |
| Căn tự nhập chỉ sale đó thấy | Căn tự nhập, tên và số chủ căn, đặt phòng sale ghi cho nó chỉ sale tạo đọc và sửa được. Không chia cho chủ nhà, sale khác, đội nhóm, không vào file xuất (QD11) | "Chỉ bạn thấy" |
| Đặt phòng tự ghi không phải lịch | Đặt phòng sale ghi cho căn tự nhập là ghi chép để tính thống kê, không làm ngày khác thành trống hay kín. Không có trạng thái tiền (chưa cọc, đã cọc, đã thanh toán) | "Ngày không có đặt phòng chưa chắc còn trống." |
| Chặn trùng trong căn tự nhập | Đặt phòng tự ghi chồng đêm với đặt phòng tự ghi khác của cùng căn thì bị từ chối. Căn tự nhập của hai sale là hai căn khác nhau, không so với nhau (QT1.3) | QT1.3-VD1, QT1.3-VD2 |
| Giá điền sẵn | Khi ghi đặt phòng, "Trả chủ" điền từ giá chủ sale đã lưu (đêm cuối tuần theo cài đặt của sale, YC4.6), "Thu khách" điền từ giá bán của sale cho căn (YC7.5). Sửa được. Chênh = thu khách trừ trả chủ (QT3) | 1.400.000đ, 1.600.000đ, +200.000đ |
| Bấm hai lần | Bỏ nguồn và xóa căn tự nhập cần bấm xác nhận lần hai; "Bỏ khỏi danh sách" dòng chủ nhà đã xóa tài khoản thì không hỏi lại | "Xác nhận bỏ Chị Hoa?" |

Quy tắc dùng chung: QT6.4 Căn tự nhập không có lịch, QT6.3 Tòa nhà dùng chung, Phòng ngủ và số giường, Loại view (`docs/product/glossary.md`), Đêm và tiền QT1.1, QT3, chia sẻ pwa.md P3, gọi pwa.md P5.

## Ai được làm gì

Theo `docs/security/PQ-ma-tran-quyen.md`: PQ1.SALE, PQ2.SALE, PQ3.SALE, PQ7.SALE, PQ13, PQ14, PQ17.SALE, PQ23.SALE. Test vi phạm phải có, ở lớp database:
- Sale Lan không đọc, sửa, xóa được căn tự nhập của Sale Hùng, không ghi đặt phòng vào đó, không thấy đặt phòng tự ghi của Hùng (YC10.3-NT7).
- Chủ nhà không đọc được căn tự nhập nào và không tạo được căn tự nhập (YC10.3-NT7).
- Sale khác không đọc căn của tôi của Hùng (YC10.1-NT6).
- Sale không ghi đặt phòng thẳng vào căn của chủ nhà, không sửa, xóa căn của chủ nhà (YC10.1-NT4).
- Sale A không bỏ nguồn hay xóa dòng kết nối của sale B; số điện thoại chủ nhà chỉ trả cho sale đã kết nối (YC10.2-NT5).
- Dòng chủ nhà đã xóa tài khoản không trả căn, lịch, giá, số điện thoại (YC10.1-NT7).

## Dữ liệu

Mô hình chung: `docs/architecture/thiet-ke-db.md`. YC này cần database bảo đảm:
- Căn có loại: có lịch (của chủ nhà hay của sale) hay tự nhập. Căn tự nhập thêm tên chủ căn, số chủ căn (xóa được), giá chủ ngày thường, giá chủ cuối tuần (không bắt buộc), tối đa 12 ảnh.
- Đặt phòng tự ghi: nguồn "sale tự ghi", trả chủ ở tiền phòng, thu khách ở phần riêng của sale (QD11), không trạng thái tiền, chặn trùng theo QT1.3.
- Xóa căn tự nhập xóa thật căn, ảnh và mọi đặt phòng tự ghi của nó.
- Bỏ nguồn đổi kết nối sang "sale bỏ"; từ đó mọi lệnh đọc của sale không còn căn của chủ nhà đó.
- Danh sách nguồn phòng của sale gồm dòng chủ nhà đã xóa tài khoản (tên và cờ, không gì khác) tới khi sale bỏ dòng.

## Trạng thái màn (mọi mục)

- Đang tải: HV1. Mất mạng: HV2. Quay lại từ nền: HV3. Không có quyền: HV5 (sale bị ngừng, chủ nhà xóa tài khoản).

## YC10.1 · Tab Căn của sale
`[r3 · sửa]`

Bản 2 · rủi ro: tb · Màn: S6, S6-00, S6-07, S6-08

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Mở tab Căn | Nhóm "CĂN CỦA TÔI · 2" kèm nút "+ Thêm căn" (YC3.2). Mỗi căn: tên, "2PN · view biển", tình trạng hôm nay ("Trống hôm nay ✓", "Có khách 12/10") | Căn của người gọi, tình trạng hôm nay |
| 2 | Xem nguồn phòng | Nhóm "CHỦ NHÀ ĐÃ KẾT NỐI · 2". Mỗi chủ nhà: chữ cái đầu, tên, "✓ Cập nhật 2 giờ trước" ([MỞ: YC10-H2]), các căn ("ICON40 1509 · 2PN · 3 giường", "view biển"), không có số khách | Căn trong phạm vi các kết nối đang dùng |
| 3 | Xem căn tự nhập | Nhóm "CĂN TỰ NHẬP · 1": "Villa Tuần Châu", "Chú Bình · chưa dùng app · gọi hỏi lịch", không có "Trống hôm nay". Dòng gợi ý "Mời chú Bình dùng app để lịch tự cập nhật, không cần gọi hỏi.", nút "Chia sẻ lời mời" | Căn tự nhập của người gọi |
| 4 | Bấm "Chia sẻ lời mời" | Mở bảng chia sẻ với tin mời chung có link mở app (pwa.md P3). App không tự gửi tin | Không |
| 5 | Chạm tên chủ nhà | S6-04 (YC10.2) | Không |
| 6 | Chạm căn của chủ nhà | S3 (YC7.4). Không mở S6-07: sale không ghi đặt phòng hay sửa giá trên căn của chủ nhà | Không |
| 7 | Chạm căn của tôi | S6-07: nhãn "Căn của tôi", "Bạn tự ghi lịch và giá cho căn này, như chủ nhà.", "7 ngày tới · giá đêm của bạn" (Green Bay 0812: 750k, Kín, Kín, 900k, 750k, 750k, 750k), ba việc "Đặt phòng" (YC5), "Sửa căn và giá" (YC3.5, YC4.2), "Gửi cho khách" (YC8) | Chi tiết căn của người gọi |
| 8 | Chạm căn tự nhập | S6-03 (YC10.3) | Không |
| 9 | Một chủ nhà đã xóa tài khoản | S6-08: dòng tên cũ kèm nhãn đỏ "đã xóa tài khoản", "Căn và lịch không còn trên app", không số, không căn, không "Cập nhật … trước", chạm không mở gì; nút "Bỏ khỏi danh sách". Số đếm nhóm không tính dòng này | Tên và cờ, không gì khác (QD13) |
| 10 | Bấm "Bỏ khỏi danh sách" | Dòng biến ngay, không hỏi lại. Đặt phòng đã chốt với chủ nhà đó vẫn ở danh sách đặt phòng của sale (YC11) | Bỏ dòng khỏi danh sách của sale này |
| 11 | Chưa có căn nào | S6-00: "Chưa có căn nào", "Thêm căn của bạn, xin lịch chủ nhà, hoặc tự nhập căn của chủ chưa dùng app.", nút "+ Thêm căn của tôi" (YC3.2), "Gửi tin nhắn xin lịch cho chủ nhà" (YC6.4), "Thêm căn tự nhập" (YC10.3) | Không |

Chủ nhà đã xóa tài khoản cho lại tên và số thì dòng trở lại như trước và kết nối tự nối lại (QD13). Đã bỏ dòng ở bước 10 rồi thì có nối lại không: [MỞ: YC10-H5].

Tiêu chí:
- **YC10.1-NT1** Khi Sale Hùng mở tab Căn, thì thấy ba nhóm với số đếm 2, 2 và 1. · unit, database
- **YC10.1-NT2** Khi căn của chủ nhà đã kết nối có số giường, thì dòng căn ghi "2PN · 3 giường" như thẻ căn (YC3.1), không có số khách. · unit
- **YC10.1-NT3** Khi căn là căn tự nhập, thì thẻ ghi "chưa dùng app" và không có "Trống hôm nay". · unit
- **YC10.1-NT4** Khi Hùng chạm ICON40 1509 dưới Chị Hoa, thì app mở S3 của 1509, không mở S6-07; Hùng ghi đặt phòng, sửa hay xóa 1509 thẳng ở database thì bị từ chối. · unit, database
- **YC10.1-NT5** Khi Hùng chạm Green Bay 0812, thì app mở S6-07 với ba việc Đặt phòng, Sửa căn và giá, Gửi cho khách. · unit
- **YC10.1-NT6** Khi Sale Lan đọc Green Bay 0812 của Hùng, thì không được. · database
- **YC10.1-NT7** Khi Chị Hoa đã xóa tài khoản, thì nhóm "CHỦ NHÀ ĐÃ KẾT NỐI" đếm 1, dòng Chị Hoa không có căn, giá, số điện thoại; dữ liệu trả về cũng không có. · database, unit
- **YC10.1-NT8** Khi Hùng bấm "Bỏ khỏi danh sách" ở dòng Chị Hoa, thì dòng biến ngay, không hỏi lại, và B1 vẫn ở danh sách đặt phòng của Hùng. · database, unit
- **YC10.1-NT9** Khi Hùng bấm "Chia sẻ lời mời", thì bảng chia sẻ mở; app không tự gửi tin. · unit
- **YC10.1-NT10** Khi sale chưa có căn nào, thì tab Căn hiện S6-00 với ba nút. · unit

## YC10.2 · Chi tiết chủ nhà và bỏ nguồn

Bản 1 · rủi ro: cao · Màn: S6-04

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Mở chi tiết | Tên chủ nhà, số điện thoại (nếu chủ nhà đã cho), "kết nối từ 02/08/2026", nút "Gọi" (pwa.md P5), "✓ Lịch tự cập nhật · lần cuối 2 giờ trước" | Chi tiết kết nối |
| 2 | Xem quyền | "CHỊ HOA CHO BẠN XEM": Phòng trống hay đã đặt, Giá từng đêm (QD7), Tình trạng cọc (chỉ khi chủ nhà bật, YC6.5) | Như bước 1 |
| 3 | Xem căn | "CĂN · 2": tên căn, "view biển · 1.800.000đ/đêm" (giá chủ nhà đêm hôm nay); đêm chưa đặt giá thì không có giá | Căn được chia sẻ, giá |
| 4 | Xem kết quả bán | "BẠN ĐÃ BÁN: 12 đặt phòng", "TIỀN CHÊNH: 6,4tr" | Số đặt phòng của sale với chủ nhà đó và tiền chênh (QT3) |
| 5 | Bấm "Bỏ nguồn phòng này" | Nút đổi thành "Xác nhận bỏ Chị Hoa?", "Bạn không thấy lịch của Chị Hoa nữa. Muốn xem lại phải xin link mới." | Không |
| 6 | Bấm xác nhận | Về S6, Chị Hoa không còn ở nguồn phòng (giả định GD23) | Kết nối sang "sale bỏ". Không báo chủ nhà |

Màn S6-04 khi không còn quyền: [MỞ: YC10-H6]. Sale bỏ dòng của chủ nhà đã ngừng mình được không: [MỞ: YC10-H1]. Sau khi bỏ nguồn, đặt phòng cũ và yêu cầu đang chờ giữa hai bên thế nào: [MỞ: YC10-H8].

Tiêu chí:
- **YC10.2-NT1** Khi Chị Hoa đã đặt giá tháng 10 cho 1509 và 3402, thì S6-04 của Hùng ghi giá đêm của cả hai căn; căn nào chưa đặt giá thì không có giá. · database, unit
- **YC10.2-NT2** Khi chủ nhà tắt "Tình trạng cọc", thì S6-04 không có dòng đó. · unit
- **YC10.2-NT3** Khi sale bấm "Bỏ nguồn phòng này" một lần, thì chưa bỏ gì, chỉ hiện nút xác nhận. · unit
- **YC10.2-NT4** Khi sale bấm xác nhận, thì chủ nhà đó biến khỏi nguồn phòng, lịch và tìm phòng của sale không còn căn của chủ nhà đó. · database, unit
- **YC10.2-NT5** Khi Sale Lan bỏ nguồn trên kết nối của Sale Hùng, thì không được; khi sale chưa kết nối đọc chi tiết chủ nhà, thì không có số điện thoại. · database

## YC10.3 · Căn tự nhập

Bản 1 · rủi ro: tb · Màn: S6-02, S6-03, S6-03-00

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Bấm "Thêm căn tự nhập" | S6-02, lời giải thích: căn này không có lịch trống, mỗi lần khách hỏi sale gọi chủ; app lưu ảnh, giá và đặt phòng đã chốt | Không |
| 2 | Nhập chủ căn | "Tên chủ nhà *", "Số điện thoại *", ghi chú chỉ bạn thấy | Không |
| 3 | Nhập căn | "Mã căn *", "Tòa nhà" (chip tòa, "+ Tòa khác" như YC3.4), "Số phòng ngủ *" (Studio, 1PN, 2PN, 3PN, 4PN+), "Loại view", "Số giường" (không bắt buộc) | Danh sách tòa |
| 4 | Nhập giá chủ | "Ngày thường", "Cuối tuần", ghi chú "Giá chủ báo qua điện thoại. Không bắt buộc. Dùng để điền sẵn khi đặt phòng." | Không |
| 5 | Thêm ảnh | "ẢNH (0)", "Tối đa 12 ảnh", nút "Thêm ảnh" (như YC3.3) | Ảnh tải lên ngay khi chọn |
| 6 | Thiếu ô bắt buộc | Dòng "Còn thiếu: tên chủ nhà, số điện thoại, mã căn, số phòng ngủ" (chỉ ô đang thiếu); nút "Thêm căn" mờ | Không |
| 7 | Bấm "Thêm căn" | Về S6, căn ở nhóm "CĂN TỰ NHẬP" | Tạo căn tự nhập; mã căn trùng thì từ chối (trùng với căn nào: [MỞ: YC10-H3]) |
| 8 | Chạm căn tự nhập | S6-03: tên căn, tên chủ, số điện thoại che ba số giữa, "chưa dùng app", nút "Gọi hỏi lịch", "Căn này không có lịch trống. Khách hỏi ngày nào, bạn gọi chú Bình hỏi ngày đó." | Căn tự nhập của người gọi |
| 9 | Xem đặt phòng đã ghi | "ĐẶT PHÒNG BẠN ĐÃ GHI · 1", "Chỉ bạn thấy", "20/09 → 22/09", "Trả chủ 2.800.000đ · Thu khách 3.400.000đ", "+600.000đ" (V1), ghi chú "Đây là đặt phòng của bạn, không phải lịch của căn. Ngày không có đặt phòng chưa chắc còn trống." Chưa có thì S6-03-00 "Chưa có đặt phòng nào cho căn này" | Đặt phòng tự ghi của căn |
| 10 | Bấm "Gửi cho khách" | S5 với căn này (YC8) | Không |
| 11 | Bấm "Mời chú Bình dùng app" | Như YC10.1 bước 4 | Không |
| 12 | Bấm "Sửa thông tin căn" | Sửa ảnh, giá chủ, số phòng ngủ, tên và số chủ căn; xóa được số (QD11) | Ghi thay đổi; xóa số thì không còn giữ số |
| 13 | Bấm "Xóa căn tự nhập" | Nút đổi thành "Xác nhận xóa Villa Tuần Châu?", "Chỉ xóa khỏi Nguồn phòng của bạn."; bấm lần nữa về S6 (giả định GD23) | Xóa căn, ảnh, đặt phòng tự ghi của căn |

Màn sửa căn tự nhập chưa thiết kế ([MỞ: YC10-H7]): tới khi có màn, dùng lại S6-02 điền sẵn dữ liệu, nút "Lưu thay đổi" (giả định GD23).

Tiêu chí:
- **YC10.3-NT1** Khi còn thiếu một trong bốn ô bắt buộc, thì dòng "Còn thiếu" liệt kê đúng ô thiếu và nút "Thêm căn" chưa dùng được; database cũng từ chối khi thiếu. · unit, database
- **YC10.3-NT2** Khi sale không nhập giá chủ và số giường, thì vẫn thêm được căn; "Còn thiếu" không nhắc hai ô đó. · unit, database
- **YC10.3-NT3** Khi sale thêm căn xong, thì căn ở nhóm "CĂN TỰ NHẬP" và ở lịch 7 ngày mọi ô ghi "?". · database, unit
- **YC10.3-NT4** Khi sale đã chọn 12 ảnh, thì không chọn thêm được ảnh thứ 13; database từ chối ảnh thứ 13. · unit, database
- **YC10.3-NT5** Khi sale mở hàng chip "Loại view" ở S6-02, thì thấy đúng danh sách Loại view của `glossary.md`; nhập số giường thì thẻ ghi "2PN · 3 giường". · unit
- **YC10.3-NT6** Khi Villa Tuần Châu có V1, thì S6-03 ghi "20/09 → 22/09", "Trả chủ 2.800.000đ · Thu khách 3.400.000đ", "+600.000đ" và không ghi "trống" cho ngày nào. · unit
- **YC10.3-NT7** Khi Sale Lan đọc, sửa, xóa Villa Tuần Châu của Hùng, hay ghi đặt phòng vào đó, hay đọc V1, V2; hoặc Chị Hoa đọc hay tạo căn tự nhập, thì không được và dữ liệu không đổi. · database
- **YC10.3-NT8** Khi sale xóa số điện thoại chủ căn rồi lưu, thì database không còn số đó và nút "Gọi hỏi lịch" không dùng được. · database, unit
- **YC10.3-NT9** Khi sale bấm "Xóa căn tự nhập" một lần, thì chưa xóa; bấm xác nhận thì căn, ảnh và V1, V2 không còn. · unit, database

## YC10.4 · Ghi đặt phòng cho căn tự nhập

Bản 1 · rủi ro: cao · Màn: S6-05, S6-06

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Bấm "Đặt phòng" ở S6-03 | S6-05: tiêu đề "Đặt phòng", "Villa Tuần Châu · đã chốt với chú Bình" | Không |
| 2 | Chọn ngày nhận | Chip "Hôm nay 07/10", "Mai 08/10", "Ngày khác" (mở chọn ngày) | Không |
| 3 | Chọn số đêm | Nút − và +, dòng "08/10 → 09/10 (1 đêm)" | Không |
| 4 | Xem tiền | "Trả chủ (đ)", "Thu khách (đ)" điền sẵn theo quy tắc Giá điền sẵn, dòng "Bạn lời 200.000đ", ghi chú "Giá điền sẵn từ giá chủ đã lưu và giá bán của bạn. Sửa nếu chú Bình báo giá khác." Chưa lưu giá chủ thì hai ô trống | Giá điền sẵn từng đêm |
| 5 | Bấm "Đặt phòng" | S6-06: về S6-03, đặt phòng mới trong danh sách, toast "Đã lưu đặt phòng 08/10 → 09/10. Tính vào thống kê tháng 10." | Ghi đặt phòng tự ghi; chồng đêm với đặt phòng tự ghi khác của căn thì từ chối |
| 5a | Có đêm trùng | Báo "Bạn đã ghi đặt phòng cho căn này đêm 08/10", không lưu | Từ chối (QT1.3) |
| 6 | Muốn thêm cọc, số khách, ghi chú | Dòng dưới nút "Cọc, số khách, ghi chú: thêm sau trong đặt phòng nếu cần." | Không |

Luật kiểm:

| Ô | Luật | Sai thì |
|---|---|---|
| Ngày nhận, số đêm | Như YC5.3: tối đa 365 đêm, ngày nhận trong quá khứ được (ghi bù) | "Một đặt phòng dài tối đa 365 đêm" |
| Trả chủ, thu khách | Bắt buộc, số nguyên đồng lớn hơn 0 (như tiền phòng ở YC5.3) | "Cần nhập tiền trả chủ" · "Cần nhập tiền thu khách" |

Tiêu chí:
- **YC10.4-NT1** Khi sale chọn ngày nhận 08/10 và 1 đêm, thì dòng ghi "08/10 → 09/10 (1 đêm)". · unit
- **YC10.4-NT2** Khi Villa Tuần Châu có giá chủ 1.400.000đ và giá bán của Hùng 1.600.000đ, thì S6-05 điền sẵn hai số đó và ghi "Bạn lời 200.000đ". · database, unit
- **YC10.4-NT3** Khi sale sửa "Thu khách" thành 1.700.000đ, thì dòng ghi "Bạn lời 300.000đ" và đặt phòng lưu đúng 1.400.000đ và 1.700.000đ. · unit, database
- **YC10.4-NT4** Khi sale bấm "Đặt phòng", thì S6-03 có đặt phòng mới và toast ghi tháng 10; đặt phòng không có trạng thái tiền. · database, unit
- **YC10.4-NT5** Khi Hùng đã có V2 08/10 → 09/10 và ghi tiếp 08/10 → 10/10 cho Villa Tuần Châu, thì bị từ chối, không lưu (QT1.3-VD1). · database
- **YC10.4-NT6** Khi Sale Lan ghi căn tự nhập Villa Tuần Châu của Lan cùng đêm với V2, thì lưu được (QT1.3-VD2). · database
- **YC10.4-NT7** Khi Hùng đã ghi V2, thì lịch 7 ngày ghi "Bạn" ở 08/10, các ô khác vẫn "?". · database, unit

## Màn hình
`[r2 · sửa]`

Xem hình: `python3 scripts/trich-man.py <mã>`. Chữ và số trên hình lệch YC thì YC đúng.

- **S6 · Căn của sale.** Dòng "Cập nhật 2 giờ trước" của chủ nhà: [MỞ: YC10-H2].
- **S6-00, S6-02, S6-03, S6-03-00, S6-05, S6-07, S6-08.** Đúng bố cục.
- **S6-04 · Chi tiết chủ nhà.** Canvas chưa có hình chi tiết; làm theo YC10.2.
- **S6-06 · Đã lưu.** Toast theo HV8.
- Không làm: S6-P1, S6-P2 (popup xin số và hộp thoại của Zalo; bản PWA có số từ lúc đăng ký, QD22).

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Tạo từ story US16 trừ phần "Lịch phòng 7 ngày" (đã vào YC7.1) (QD21) | Cả file |
| r2 | 2026-11-19 | Claude | QD22-chot-dang-nhap | Theo QD22: bỏ bước xin số trước khi mời chủ căn tự nhập | YC10.1, Màn hình |
| r3 | 2026-11-19 | Claude | TKE-canvas-pwa-sua-yc | Nút "Chia sẻ lời mời" theo canvas PWA | YC10.1 |
