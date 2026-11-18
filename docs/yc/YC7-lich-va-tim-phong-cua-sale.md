---
id: YC7
tieu_de: Lịch, tìm phòng và chi tiết căn của sale
rev: 1
ban: 1
---
# YC7 · Lịch, tìm phòng và chi tiết căn của sale

## Mục tiêu

Là sale, tôi muốn mở app là thấy 7 ngày tới căn nào trống, căn nào kín, giá bao nhiêu; nhập ngày khách hỏi để lọc ra căn trống; mở một căn đủ để tư vấn và cộng phần của mình vào giá chủ nhà. Để trả lời khách trong vài chạm mà không phải gọi hỏi từng chủ nhà.

Vì sao quan trọng: đây là lý do sale dùng app. Mỗi ô "trống" sai là một lần sale hứa với khách rồi phải xin lỗi, nên ô trống chỉ hiện khi database biết chắc đêm đó không có đặt phòng; căn tự nhập (không có lịch) luôn hiện "?". Giá bán là tiền của sale: chủ nhà và khách không bao giờ thấy phần cộng thêm, nếu không sale mất khách hoặc mất chủ nhà.

## Luồng chính

Ngày 06/10/2026, Sale Hùng mở app. Tab Lịch hiện "7 ngày tới · 06/10 → 12/10". Nhóm "CĂN CỦA TÔI · 2" (Green Bay 0812, Mường Thanh 1605) ở trên, rồi "NGUỒN PHÒNG · 5". Ô ngày ghi giá bán của Hùng hoặc "Kín"; hàng Villa Tuần Châu (tự nhập) ghi "?" ở mọi ngày trừ đêm Hùng đã ghi đặt phòng (ghi "Bạn").

Khách hỏi 10/10 → 12/10. Hùng chạm ô "Tìm phòng trống theo ngày", chọn ngày nhận 10/10, chip "2 đêm", bấm "Tìm phòng trống". Kết quả "5 căn trống": nhóm "CỦA TÔI · 1", "NGUỒN PHÒNG · 4" (1509, 3402, Sapphire 1103, À La Carte 2208) và nhóm "TỰ NHẬP · chưa biết lịch" có Villa Tuần Châu. Thẻ 1509 ghi "2.200.000đ · bạn bán 3.000.000đ" (mức cộng mặc định +400k).

Hùng chạm 1509: chi tiết căn hiện 6 ảnh, "ICON40 1509 · 2PN", "Giá chủ nhà 2.200.000đ". Ở mục "CỘNG THÊM CHO BẠN" Hùng chọn "+200k": "Giá bán cho khách" thành 2.600.000đ. Hùng bấm "Gửi cho khách" (YC8).

## Phạm vi

YC này gồm: màn đầu tiên của sale chưa có nguồn phòng, lịch 7 ngày của sale, tìm phòng trống theo ngày, kết quả tìm (danh sách và lịch tuần), chi tiết căn của chủ nhà và giá bán, mức cộng giá mặc định.

Không thuộc YC này (dễ tưởng là có):
- Kết nối với chủ nhà (link, xin lịch), toast khi chủ nhà đồng ý: YC6.
- Căn của tôi và căn tự nhập: thêm, chi tiết (S6-07, S6-03), ghi đặt phòng cho căn tự nhập, danh sách nguồn phòng, bỏ nguồn: YC10.
- Gửi cho khách, mẫu tin: YC8. Gửi yêu cầu đặt phòng (S3-02): YC9.
- Lọc theo số khách: tạm không làm (Tùng, bản Zalo, 03/11/2026: "Tạm thời chưa lọc theo số khách").
- Tiện ích căn (bếp, máy giặt): bản đầu không làm.

## Quy tắc của nhóm

| Tên | Quy tắc | Ví dụ |
|---|---|---|
| Căn của tôi đứng đầu | Căn của chính sale luôn ở nhóm đầu, dù sắp xếp thế nào | "CĂN CỦA TÔI · 2" trên "NGUỒN PHÒNG · 5" |
| Nhóm tự nhập riêng ở kết quả tìm | Kết quả tìm tách căn tự nhập thành nhóm riêng "TỰ NHẬP · chưa biết lịch", không chung với "CỦA TÔI", không tính vào số căn trống (Tùng, bản Zalo, 04/11/2026, điểm 7: "Phương án tách") | Không |
| Ô ngày ghi giá bán | Ô ngày trống ở lịch của sale ghi giá bán một đêm (giá chủ nhà + mức cộng, giả định GD16), viết rút gọn theo `docs/luat-chung/Tu_dien.md` | "1,5tr" |
| Độ tươi lịch | Mỗi căn của chủ nhà ghi lần lịch hay giá đổi gần nhất; căn của chính sale ghi "Lịch của bạn, luôn đúng" | "Lịch cập nhật 2 giờ trước" |
| Sắp xếp | "Theo tên", "Giá tăng dần" (theo giá đêm đầu, căn không có giá xếp cuối), "Bán nhiều nhất" ([MỞ: CH-071]). Căn của tôi vẫn ở trên | Không |
| Chạm căn mở đâu | Chạm căn của chủ nhà mở S3; chạm căn của tôi mở S6-07, căn tự nhập mở S6-03 (YC10) (Tùng, bản Zalo, 04/11/2026, điểm 11; giả định GD22) | Không |

Quy tắc dùng chung: QT2.1 (căn trống khi không đặt phòng nào chiếm đêm trong khoảng), QT1.3 (căn tự nhập), QT3.1 (giá bán), Giá bán của sale (`docs/luat-chung/Nghiep_vu.md` mục 1.4, làm tròn GD13), Căn tự nhập không có lịch (`Nghiep_vu.md`), Quyền sale được xem (QD-007).

## Ai được làm gì

Theo `docs/luat-chung/PQ.md`: PQ2.SALE, PQ3.SALE, PQ4.SALE, PQ5.SALE, PQ6.SALE, PQ11, PQ13, PQ14.SALE, PQ23.SALE. Test vi phạm phải có, ở lớp database:
- Sale bị ngừng, sale chưa kết nối, căn ngoài phạm vi, căn đã xóa, căn của chủ nhà đã xóa tài khoản: không có trong lịch, kết quả tìm, số đếm gợi ý, chi tiết (YC7.1-NT6, YC7.2-NT6, YC7.4-NT6).
- Căn của tôi, căn tự nhập của Sale Hùng không có trong lịch, kết quả của Sale Lan (YC7.2-NT6).
- Mức cộng, giá bán của sale này sale khác không đổi được, chủ nhà không đọc được (YC7.4-NT5, YC7.5-NT4).
- Ảnh căn chỉ mở được bằng đường dẫn có hạn do database cấp (YC7.4-NT6).
- "Tìm gần đây" ghi theo người gọi; sale này không đọc lần tìm của sale khác (YC7.2-NT5).

## Dữ liệu

Mô hình chung: `docs/Thiet_ke_DB.md`. YC này cần database bảo đảm:
- Một lệnh trả lịch của sale cho một khoảng ngày: mọi căn sale được xem (căn của tôi, căn trong phạm vi kết nối đã kết nối, căn tự nhập của sale), chia nhóm, mỗi ô là "kín", giá bán một đêm, "?" (căn tự nhập) hay "Bạn" (đặt phòng sale tự ghi cho căn tự nhập). Không bao giờ trả tên người đặt, tiền phòng của người khác.
- Một lệnh tìm phòng: căn trống mọi đêm trong khoảng, tổng giá chủ và tổng giá bán, cờ không có lịch cho căn tự nhập, lúc lịch đổi; không có căn trống thì trả gợi ý (đổi ngày ±1, bỏ một bộ lọc, đổi số phòng ngủ) kèm số căn trống của từng gợi ý, chỉ đếm căn sale được xem.
- Lần tìm gần đây: lưu ở database, mỗi sale 5 lần mới nhất (giả định GD17), theo người gọi.
- Mức cộng: mặc định của sale (cài đặt), riêng từng căn của chủ nhà, và cờ làm tròn 50.000đ. Chỉ sale đó đọc, ghi.
- Lúc lịch đổi của căn cập nhật mỗi khi đặt phòng hay giá của căn đổi (YC4, YC5).
- Đường dẫn ảnh cho sale có hạn 1 giờ.

## Trạng thái màn (mọi mục)

- Đang tải: HV1. Mất mạng: HV2. Quay lại từ nền: HV3, đọc lại lịch. Sale bị ngừng, chủ nhà xóa tài khoản giữa chừng: HV5. Toast: HV8.

## YC7.1 · Màn đầu tiên và lịch 7 ngày của sale

Bản 1 · rủi ro: cao · Màn: A5, S1, S1-04, S1-05

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Sale chưa có nguồn phòng và chưa có căn mở tab Lịch | A5: hai nút "Gửi tin nhắn xin lịch đến chủ nhà" (YC6.4) và "Thêm căn thủ công" (YC10). Thanh tab của sale không có tab "Tìm phòng" | Lịch của sale trả rỗng |
| 2 | Sale có căn mở tab Lịch | S1: tiêu đề "Lịch phòng", ô "Tìm phòng trống theo ngày", thanh "7 ngày tới · 07/10 → 13/10" kèm nút ‹ ›, nút sắp xếp ("Theo tên"), nút nhỏ "Xoay ngang" cùng hàng | Lệnh lịch của sale, 7 ngày từ hôm nay |
| 3 | Xem bảng | Cột "CĂN" và 7 cột ngày ("Nay", "T5", "T6"…). Nhóm "CĂN CỦA TÔI · 2" rồi "NGUỒN PHÒNG · 5". Mỗi hàng: tên căn, chủ nhà, số phòng ngủ; mỗi ô là giá bán hay "Kín" | Như trên |
| 4 | Xem căn tự nhập | Hàng "Villa Tuần Châu · Chú Bình · tự nhập": ô ghi "?", ô có đặt phòng sale đã ghi ghi "Bạn" | Như trên |
| 5 | Xem chú thích | "Hôm nay", "Kín", "?" ("Căn tự nhập: gọi chủ hỏi"), "Đặt phòng bạn đã ghi", "Số là giá đêm của bạn · chạm căn để xem" | Không |
| 6 | Bấm ‹ hay › | Lùi, tiến 7 ngày | Đọc khoảng mới |
| 7 | Bấm nút sắp xếp | S1-04: "Theo tên", "Giá tăng dần", "Bán nhiều nhất"; ghi chú "Căn của tôi luôn hiện đầu danh sách." | Sắp theo quy tắc Sắp xếp |
| 8 | Bấm "Xoay ngang" | S1-05: app quay cả bảng 90 độ, cột tên căn rộng hơn, ẩn thanh tab; nút đổi thành "Xoay dọc". App không tự xoay khi nghiêng máy | Không |
| 9 | Chạm một căn | Theo quy tắc Chạm căn mở đâu | Không |
| 10 | Chạm ô tìm | Mở YC7.2 | Không |
| 11 | Một chủ nhà trong nguồn phòng đã xóa tài khoản | Căn của chủ nhà đó biến khỏi bảng và kết quả tìm; số đếm giảm theo (QD-013) | Không trả căn, lịch, giá của chủ nhà đã xóa tài khoản |

Sale chưa có nguồn phòng nhưng đã gửi link xin lịch thì thấy A5 hay A7: [MỞ: CH-059]; tới khi có câu trả lời, A5.

Tiêu chí:
- **YC7.1-NT1** Khi người dùng chọn "Tôi là sale" và chưa có căn nào, thì tab Lịch hiện A5 với hai nút "Gửi tin nhắn xin lịch đến chủ nhà" và "Thêm căn thủ công", và thanh tab không có "Tìm phòng". · unit
- **YC7.1-NT2** Khi Sale Hùng mở tab Lịch, thì nhóm "CĂN CỦA TÔI · 2" ở trên nhóm "NGUỒN PHÒNG · 5". · unit, database
- **YC7.1-NT3** Khi một căn kín một đêm, thì ô đó ghi "Kín"; khi trống, ô ghi giá bán một đêm: 3402 đêm 08/10 ghi "1,2tr" (800.000đ + 400.000đ). · database, unit
- **YC7.1-NT4** Khi Chị Hoa vừa lưu một đặt phòng 1509 cho khách lẻ, thì lần đọc lịch sau của Sale Hùng và Sale Lan ghi "Kín" ở các đêm đó, không có tên người đặt. · database
- **YC7.1-NT5** Khi căn là căn tự nhập, thì mọi ô ghi "?" trừ đêm sale đã ghi đặt phòng (ghi "Bạn"); không ô nào ghi giá hay trống. · database, unit
- **YC7.1-NT6** Khi Chị Hoa đã ngừng Sale Hùng, hay đã xóa tài khoản, hay đã xóa căn 3402, thì lịch của Hùng không có căn tương ứng và số đếm "NGUỒN PHÒNG" giảm theo. · database
- **YC7.1-NT7** Khi sale chọn "Giá tăng dần", thì các căn trong mỗi nhóm xếp theo giá và nhóm "CĂN CỦA TÔI" vẫn ở trên cùng. · unit
- **YC7.1-NT8** Khi sale nghiêng máy sang ngang, thì bảng vẫn dọc; khi sale chạm "Xoay ngang", thì bảng hiện S1-05 và nút thành "Xoay dọc". · unit

## YC7.2 · Tìm phòng trống theo ngày

Bản 1 · rủi ro: cao · Màn: S1-02, S1-03, S2-00

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Mở tìm phòng | S1-02: "Ngày nhận", "Ngày trả", "Số đêm:" kèm chip 1, 2, 3, 4, "Tùy chọn". Mục "TÌM GẦN ĐÂY" (ví dụ "10/10 → 12/10 · 2PN · ICON40"). Mục "LỌC THÊM · Không bắt buộc". Nút "Tìm phòng trống" dính đáy, mờ khi chưa có ngày, ghi "Chọn ngày nhận để tìm phòng" | Đọc 5 lần tìm gần nhất của người gọi |
| 2 | Chọn ngày, số đêm | S1-03: ngày trả = ngày nhận + số đêm. Nút sáng | Không |
| 3 | Chọn lọc thêm | "Số phòng ngủ" (1PN, 2PN, 3PN, 4PN+), "Tòa nhà" (tòa người gọi đã dùng, rồi tòa có sẵn), "Loại view" ("Biển", "Thành phố", "Núi") | Đọc danh sách tòa |
| 4 | Chạm một lần tìm gần đây | Điền sẵn điều kiện của lần đó | Không |
| 5 | Bấm "Tìm phòng trống" | Sang YC7.3 | Lệnh tìm phòng; ghi lần tìm |
| 6 | Không có căn trống | S2-00: "Không có căn trống", điều kiện đã lọc, mục "GỢI Ý" mỗi dòng kèm số căn trống ("Đổi sang 11/10 → 13/10 · 3 căn trống", "Bỏ lọc tòa nhà · 2 căn trống"), nút "Sửa tìm kiếm", ghi chú "Căn tự nhập không có lịch tự động. Gọi chủ nhà để hỏi." | Gợi ý tính trên căn sale được xem |

Tìm với ngày nhận trước hôm nay: [MỞ: YC7-H1]; tới khi có câu trả lời, không chọn được ngày trước hôm nay. Chip tòa "Khác": [MỞ: YC7-H2]; bản đầu không có. Lọc "Giá mỗi đêm": [MỞ: YC7-H3]; bản đầu không có. Tìm hai lần cùng điều kiện: [MỞ: YC7-H5]; tới khi có câu trả lời, lần tìm trùng đưa lên đầu, không thêm dòng.

Tiêu chí:
- **YC7.2-NT1** Khi sale chưa chọn ngày nhận, thì nút "Tìm phòng trống" mờ và ghi "Chọn ngày nhận để tìm phòng". · unit
- **YC7.2-NT2** Khi sale chọn 10/10 và "2 đêm", thì ngày trả là 12/10. · unit
- **YC7.2-NT3** Khi không có căn trống, thì thấy S2-00 với ít nhất một gợi ý kèm số căn trống nếu làm theo gợi ý đó. · database, unit
- **YC7.2-NT4** Khi sale chạm một dòng "Tìm gần đây", thì điều kiện của lần đó được điền sẵn. · unit
- **YC7.2-NT5** Khi Sale Hùng tìm 6 lần, thì Hùng có đúng 5 lần gần nhất; Sale Lan không đọc được lần tìm nào của Hùng. · database
- **YC7.2-NT6** Khi Sale Lan tìm 10/10 → 12/10, thì kết quả không có Green Bay 0812, Mường Thanh 1605, Villa Tuần Châu của Sale Hùng, không có căn đã xóa, căn của chủ nhà đã ngừng Lan; số đếm của gợi ý cũng không tính các căn đó. · database
- **YC7.2-NT7** Khi sale mở lọc "Loại view", thì thấy đúng "Biển", "Thành phố", "Núi", không có "Vịnh". · unit

## YC7.3 · Kết quả tìm phòng

Bản 1 · rủi ro: cao · Màn: S2, S4

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Xem danh sách | S2: dòng điều kiện ("10/10 → 12/10 · 2PN, 3PN · 2 đêm") kèm "Sửa", "5 căn trống", hai chế độ "Danh sách" và "Lịch tuần", sắp xếp "Theo tên". Nhóm "CỦA TÔI · 1", "NGUỒN PHÒNG · 4", rồi "TỰ NHẬP · chưa biết lịch". Mỗi thẻ: tên căn, số phòng ngủ, chủ nhà, view, giá các đêm | Kết quả lệnh tìm phòng |
| 2 | Xem giá thẻ căn của chủ nhà | "2.200.000đ · bạn bán 3.000.000đ". Đêm chưa có giá: "Chưa có giá" | Tổng giá chủ, tổng giá bán |
| 3 | Xem độ tươi | "Lịch cập nhật 2 giờ trước"; căn của tôi: "Lịch của bạn, luôn đúng"; căn tự nhập: "Tự nhập · không có lịch, gọi chú Bình hỏi" | Lúc lịch đổi của căn |
| 4 | Tích chọn căn | Dấu tích ở mỗi thẻ. Thanh đáy "Đã chọn 3 căn" và nút "Gửi cho khách" (YC8) | Không |
| 5 | Chuyển "Lịch tuần" | S4: "10/10 → 12/10", "5 căn trống", bảng căn × 7 ngày (giá, "Kín", "?"), đêm khách hỏi được tô. Không ghi số khách | Cùng điều kiện, trả bảng căn × ngày |
| 6 | Chạm một căn | Theo quy tắc Chạm căn mở đâu | Không |

Lịch tuần S4 bắt đầu từ ngày nào: [MỞ: YC7-H4]; tới khi có câu trả lời, từ ngày nhận.

Tiêu chí:
- **YC7.3-NT1** Khi Sale Hùng tìm 10/10 → 12/10 ngày 06/10, thì có "5 căn trống": 1 căn ở "CỦA TÔI", 4 căn ở "NGUỒN PHÒNG", và Villa Tuần Châu ở nhóm "TỰ NHẬP · chưa biết lịch", không tính vào 5. · database, unit
- **YC7.3-NT2** Khi Hùng có mức cộng mặc định +400k, thì thẻ 1509 ghi "2.200.000đ · bạn bán 3.000.000đ". · database, unit
- **YC7.3-NT3** Khi sale tích 3 căn, thì thanh đáy ghi "Đã chọn 3 căn" và nút "Gửi cho khách" bấm được. · unit
- **YC7.3-NT4** Khi sale chuyển giữa "Danh sách" và "Lịch tuần", thì tập căn trống và điều kiện tìm không đổi. · unit
- **YC7.3-NT5** Khi căn là căn tự nhập, thì thẻ ghi rõ không có lịch và gợi ý gọi chủ căn. · unit
- **YC7.3-NT6** Khi Hùng chạm Green Bay 0812 hay Villa Tuần Châu ở kết quả, thì app mở S6-07 với Green Bay 0812, S6-03 với Villa Tuần Châu, không mở S3. (giả định GD22) · unit

## YC7.4 · Chi tiết căn của chủ nhà và giá bán

Bản 1 · rủi ro: cao · Màn: S3

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Mở chi tiết | Bộ ảnh ("1/6"), "ICON40 1509 · 2PN", "2PN · 3 giường · view biển · Bãi Cháy" (như thẻ căn ở YC3.1, không có số khách), nhãn "Lịch cập nhật 2 giờ trước" | Chi tiết căn sale được xem, ảnh qua đường dẫn có hạn |
| 2 | Xem chủ nhà | "Chị Hoa · Chủ nhà · 2 căn", nút "Gọi" (`tel:`, chỉ khi chủ nhà đã cho số) | Tên, số chủ nhà (PQ2.SALE), số căn chủ nhà chia sẻ cho sale này |
| 3 | Xem giá | "10/10 → 12/10 (2 đêm)", "Giá chủ nhà 2.200.000đ" | Giá chủ và giá bán từng đêm |
| 4 | Chọn mức cộng | Mục "CỘNG THÊM CHO BẠN": chip theo Mức cộng của sale (`docs/luat-chung/Tu_dien.md`), cùng bộ với P10. "Giá bán cho khách" đổi ngay. Ghi chú "Chỉ bạn thấy giá này. Khách và chủ nhà không thấy phần cộng thêm." | Ghi mức cộng riêng của sale cho căn |
| 5 | Xem lịch | "Lịch 2 tuần tới": Trống, Kín; "Ngày khách hỏi" được tô | Lịch 14 ngày của căn |
| 6 | Xem giờ | "Nhận phòng 14:00 · Trả phòng 12:00" | Giờ nhận trả của chủ nhà |
| 7 | Bấm "Gửi yêu cầu đặt phòng" | Mở S3-02 đúng căn và ngày (YC9) | Không |
| 8 | Bấm "Gửi cho khách" | YC8 với căn này | Không |

Mở S3 từ lịch 7 ngày (không có ngày khách hỏi) thì ngày ở là gì: [MỞ: YC7-H6]; tới khi có câu trả lời, hôm nay, 1 đêm. Quay về mức cộng mặc định cho một căn: [MỞ: YC7-H7]; tới khi có câu trả lời, chip "Mặc định" đầu hàng.

Tiêu chí:
- **YC7.4-NT1** Khi Hùng xem 1509 cho 10/10 → 12/10 và chọn "+200k", thì giá bán là 2.600.000đ (2.200.000đ + 200.000đ × 2). · database, unit
- **YC7.4-NT2** Khi sale xem S3, thì thấy cả giá chủ nhà và giá bán; dữ liệu chủ nhà đọc về căn đó không có mức cộng hay giá bán. · database, unit
- **YC7.4-NT3** Khi sale bấm "Gửi yêu cầu đặt phòng", thì app mở S3-02 với đúng căn và ngày đang xem. · unit
- **YC7.4-NT4** Khi chủ nhà đã nhập số giường, thì S3 ghi "2PN · 3 giường"; chưa nhập thì chỉ "2PN"; không có "x khách" và không có mục tiện ích. · unit
- **YC7.4-NT5** Khi Sale Lan đặt mức cộng cho 1509, thì giá bán của Hùng cho 1509 không đổi; khi Chị Hoa gửi lệnh đặt mức cộng cho 1509, thì database từ chối. · database
- **YC7.4-NT6** Khi Sale Hùng bị ngừng, hay mở căn ngoài phạm vi, căn đã xóa, thì không đọc được chi tiết; số điện thoại chủ nhà trống khi chủ nhà chưa cho số; đường dẫn ảnh quá 1 giờ không mở được. · database

## YC7.5 · Mức cộng giá mặc định

Bản 1 · rủi ro: cao · Màn: P10

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Vào Cá nhân, "Mức cộng giá mặc định" (YC1) | P10: "Cộng thêm vào giá chủ nhà mỗi đêm khi soạn tin gửi khách. Khách chỉ thấy giá đã cộng." | Đọc mức cộng mặc định, cờ làm tròn |
| 2 | Chọn mức | Chip theo Mức cộng của sale, cùng bộ với S3 | Không |
| 3 | Bật "Làm tròn lên 50.000đ" | Công tắc | Không |
| 4 | Xem ví dụ | "VÍ DỤ: PHÒNG 1509, 2 ĐÊM": "Giá chủ nhà 2.200.000đ", "Giá gửi khách 3.000.000đ", "Bạn được 800.000đ" | Không |
| 5 | Bấm "Lưu thay đổi" | Toast "Đã lưu mức cộng". Ghi chú "Khi soạn tin (S3) vẫn sửa được mức cộng cho từng căn." | Ghi cài đặt của sale |

Tiêu chí:
- **YC7.5-NT1** Khi sale chọn "+400k", thì ví dụ 2 đêm ghi "Bạn được 800.000đ". · unit
- **YC7.5-NT2** Khi sale chọn "Không cộng", thì giá gửi khách bằng giá chủ nhà. · unit
- **YC7.5-NT3** Khi sale bật làm tròn và giá một đêm cộng mức cộng là 1.230.000đ, thì giá bán đêm đó là 1.250.000đ; làm tròn từng đêm rồi mới cộng các đêm (GD13). · database
- **YC7.5-NT4** Khi Sale Hùng đổi mức cộng mặc định, thì giá bán của Sale Lan không đổi; tài khoản chỉ là chủ nhà gửi mức cộng thì bị từ chối. · database
- **YC7.5-NT5** Khi sale mở P10 và S3, thì hai bộ chip mức cộng giống nhau, theo `docs/luat-chung/Tu_dien.md`. · unit

## Màn hình

Xem hình: `python3 docs/thiet-ke/trich-man.py <mã>`. Chữ và số trên hình lệch YC thì YC đúng.

- **A5.** Đúng bố cục.
- **S1, S1-04, S1-05.** Nút "Xoay ngang" nhỏ, cùng hàng nút "Theo tên", không nổi, không che bảng.
- **S1-02, S1-03, S2-00.** Bỏ lọc "Giá mỗi đêm" và chip tòa "Khác" (YC7-H2, YC7-H3).
- **S2, S4.** Hình chưa có nhóm "TỰ NHẬP · chưa biết lịch". S4 bỏ "· 4 khách".
- **S3.** Nút là "Gửi yêu cầu đặt phòng" (Tùng, bản Zalo, 04/11/2026, điểm 9). Hình có 12 ảnh; bộ mẫu 1509 có 6 ảnh (điểm 10). Hình có mục tiện ích: bỏ.
- **P10.** Đúng bố cục.

## Lịch sử bản

| Bản | Ngày | Mục đổi | Đổi gì |
|---|---|---|---|
| 1 | 18/11/2026 | Tất cả | Tạo từ các story US6, US12, US13 và phần "Lịch phòng 7 ngày" của US16 (QD-020, QD-021); áp quyết định 7, 9, 10, 11 của Tùng ngày 04/11/2026 ở bản Zalo |
