---
id: YC11
tieu_de: Thống kê
rev: 1
ban: 1
---
# YC11 · Thống kê

## Mục tiêu

Là chủ nhà, tôi muốn xem tháng này thu bao nhiêu, căn nào kín bao nhiêu đêm, ai bán được bao nhiêu và khoản nào chưa thu, để biết tình hình mà không phải cộng tay. Là sale, tôi muốn biết tháng này mình lời bao nhiêu, bán qua chủ nhà nào, và từng yêu cầu đã gửi đang ở bước nào, để báo khách đúng mà không phải hỏi lại chủ nhà.

Vì sao quan trọng: đây là chỗ người dùng tin hay không tin app. Một con số sai một lần (tính trùng đặt phòng vắt qua hai tháng, cộng đặt phòng đã hủy, lộ giá bán cho chủ nhà) thì người dùng quay lại sổ tay. Mọi số ở đây phải tính lại được bằng tay từ DLM.

## Luồng chính

Ngày 07/10/2026, Chị Hoa mở tab Thống kê. "DOANH THU THÁNG 10: 11.800.000đ", "+22.9% so với tháng 9". Phòng 1509 6.700.000đ, phòng 3402 5.100.000đ. "ĐÊM CÓ KHÁCH 13/62", "CÔNG SUẤT 21.0%". Theo người bán: Sale Hùng 4.000.000đ, Sale Lan 3.500.000đ, Khách lẻ 2.600.000đ, Sale Minh 1.700.000đ. "CHƯA THU TIỀN 3.700.000đ": B2 Sale Lan 17/10 → 19/10 1.900.000đ "Chưa cọc · nhận phòng sau 10 ngày", B5 Khách lẻ 13/10 → 15/10 1.800.000đ "nhận phòng sau 6 ngày" (DLM.5).

Cùng ngày, Sale Hùng mở tab Thống kê. "TIỀN CHÊNH THÁNG 10: 1.600.000đ", "+33.3% so với tháng 9". "ĐẶT PHÒNG 6 · Tháng 9: 4", "DOANH SỐ 10.600.000đ · Tháng 9: 9.800.000đ". Theo chủ nhà: Chị Hoa 4.800.000đ · chênh 800.000đ, Anh Tuấn 4.200.000đ · chênh 600.000đ, Chú Bình 1.600.000đ · chênh 200.000đ. "CHỜ CHỦ NHÀ CHẤP NHẬN: 1", Y1 À La Carte 2208 · 10/10 → 12/10, "Gửi 14:20 · Anh Tuấn chưa trả lời" (DLM.6).

## Phạm vi

YC này gồm: thống kê tháng của chủ nhà (CN8), thống kê tháng của sale (S7), danh sách đặt phòng và yêu cầu của sale (S7-03).

Không thuộc YC này (dễ tưởng là có):
- Doanh thu tháng trên lịch chủ nhà: YC2.3. Đánh dấu đã thu đủ: YC5.5.
- Màn kết quả từng yêu cầu (S3-03 đến S3-09): YC9.
- Đặt phòng với chủ nhà đã xóa tài khoản (S3-11, S7-03-01): YC1.
- Thống kê đội nhóm: YC14 (bản sau). Xuất file: YC1.

## Quy tắc của nhóm

| Tên | Quy tắc | Ví dụ |
|---|---|---|
| Tính theo đêm | Mỗi số thuộc một tháng lịch. Doanh thu, doanh số, tiền chênh, đêm có khách cộng theo đêm, mỗi đêm thuộc tháng của đêm đó (QD10, QT2.2, QT3.2, QT4.2). Đặt phòng đã hủy không tính (QD12) | Tháng 10 gồm 31 đêm |
| Công suất | Số đêm có khách chia (số căn × số đêm của tháng), làm tròn một số lẻ. Mẫu số khi thêm hay xóa căn giữa tháng: [MỞ: YC11-H7] | 13 / (2 × 31) = 21.0% |
| So với tháng trước | (tháng này − tháng trước) / tháng trước, làm tròn một số lẻ, có dấu + hay −. Tháng trước bằng 0 thì không có dòng so sánh | (11.800.000 − 9.600.000) / 9.600.000 = +22.9% |
| Khách lẻ | Đặt phòng chủ nhà ghi không gắn sale vào dòng "Khách lẻ" | B5, B6: 2.600.000đ |
| Chưa thu tiền | Đặt phòng chưa hủy, trạng thái tiền "Chưa cọc". Số tiền là tiền phòng ([MỞ: YC11-H9] có gồm phần còn lại của đặt phòng đã cọc không) | 1.900.000đ + 1.800.000đ = 3.700.000đ |
| Đặt phòng của sale | Đặt phòng có sale đứng tên: thành từ yêu cầu, chủ nhà ghi cho sale (YC5.2), sale tự ghi cho căn tự nhập (YC10.4). Yêu cầu chưa được chấp nhận không tính (QT3.1) | 6 đặt phòng |

Quy tắc dùng chung: QT2.1, QT2.2, QT3.1, QT3.2, QT4.2; QT6.1 Trạng thái tiền đặt phòng; Viết số tiền rút gọn (`docs/product/glossary.md`).

## Ai được làm gì

Theo `docs/security/PQ-ma-tran-quyen.md`: PQ7.SALE, PQ9.SALE, PQ10.SALE, PQ11, PQ14.SALE, PQ15, PQ16. Test vi phạm phải có, ở lớp database:
- Chị Hoa đọc thống kê: chỉ đặt phòng ở căn của mình; không có giá bán, tiền chênh, mức cộng của sale nào (YC11.1-NT8).
- Sale Lan đọc thống kê: không có đặt phòng, yêu cầu, căn tự nhập của Sale Hùng; lệnh không nhận mã sale khác (YC11.2-NT6).
- Sale Hùng không đọc được doanh thu của Chị Hoa, B2 của Lan, B5 khách lẻ, tên và số khách (YC11.2-NT6).

## Dữ liệu

Mô hình chung: `docs/architecture/thiet-ke-db.md`. YC này cần database bảo đảm:
- Một lệnh đọc số liệu của người gọi cho một tháng và các tháng trước nó (tới 12 tháng), theo vai người gọi: chủ nhà (căn có lịch của mình, kể cả căn đã ẩn) hay sale (đặt phòng sale đứng tên, kể cả với chủ nhà đã ngừng chia sẻ, đã xóa tài khoản, căn đã xóa).
- Một lệnh đọc danh sách đặt phòng và yêu cầu của sale, mới nhất trước, mỗi lần 50 dòng. Yêu cầu quá hạn đọc ra là Hết hạn.
- Số liệu tính lúc đọc từ tiền từng đêm, không lưu số tổng.

## Trạng thái màn (mọi mục)

- Đang tải: HV1. Mất mạng: HV2. Quay lại từ nền: HV3, đọc lại số liệu.

## YC11.1 · Thống kê của chủ nhà

Bản 1 · rủi ro: cao · Màn: CN8, CN8-00

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Mở tab Thống kê | "Thống kê", hàng chọn tháng "T09 · Tháng 10/2026 · T11" kèm nút ‹ › | Số liệu tháng đang xem và 5 tháng trước |
| 2 | Xem doanh thu | Thẻ "DOANH THU THÁNG 10 11.800.000đ", "+22.9% so với tháng 9" | Theo quy tắc Tính theo đêm |
| 3 | Xem từng phòng | "PHÒNG 1509 6.700.000đ", "PHÒNG 3402 5.100.000đ" | Doanh thu từng căn |
| 4 | Xem độ kín | "ĐÊM CÓ KHÁCH 13/62", "CÔNG SUẤT 21.0%" | Đêm có khách, số căn |
| 5 | Xem biểu đồ | "DOANH THU 6 THÁNG": 6 cột, số rút gọn trên đầu ("9.6tr", "11.8tr"), nhãn "T5" đến "T10"; cột tháng đang xem đậm, cột khác nhạt; tháng không có đặt phòng không có thanh, không có số | Doanh thu 6 tháng |
| 6 | Xem theo người bán | "DOANH THU THEO NGƯỜI BÁN", xếp theo tiền giảm dần, có dòng "Khách lẻ"; không có giá bán | Doanh thu theo người bán |
| 7 | Xem chưa thu | "CHƯA THU TIỀN 3.700.000đ", mỗi dòng người bán và ngày, "Chưa cọc · nhận phòng sau 10 ngày", số tiền | Theo quy tắc Chưa thu tiền; số ngày tính theo hôm nay giờ Việt Nam |
| 8 | Chạm T09, T11 hay ‹ › | Mọi số đổi theo tháng đó; biểu đồ dời cửa sổ 6 tháng tới tháng đang xem | Như bước 1 |
| 9 | Tháng chưa có đặt phòng | CN8-00: "0đ", "Chưa có đặt phòng", hai phòng 0đ, đêm có khách 0, công suất 0%, không có dòng so sánh; "Chưa có đặt phòng trong tháng."; "Không có khoản nào chưa thu." | Như bước 1 |

Sale có căn của tôi có tab này cho căn của mình không: [MỞ: YC11-H1].

Tiêu chí:
- **YC11.1-NT1** Khi Chị Hoa xem tháng 10, thì doanh thu ghi 11.800.000đ, 1509 ghi 6.700.000đ, 3402 ghi 5.100.000đ. · database, unit
- **YC11.1-NT2** Khi tháng 10 có 13 đêm có khách trên 2 căn, thì ghi "13/62" và "21.0%". · database, unit
- **YC11.1-NT3** Khi tháng 9 là 9.600.000đ và tháng 10 là 11.800.000đ, thì ghi "+22.9% so với tháng 9". · unit
- **YC11.1-NT4** Khi một đặt phòng 31/10 → 02/11 có 1.300.000đ đêm 31/10 và 900.000đ đêm 01/11, thì tháng 10 cộng 1.300.000đ, tháng 11 cộng 900.000đ; đặt phòng đã hủy không cộng vào tháng nào. · database
- **YC11.1-NT5** Khi chủ nhà chạm T11, thì tiêu đề thành "Tháng 11/2026" và mọi số đổi theo tháng 11; xem tháng 12 thì biểu đồ gồm T7 đến T12 và cột T12 đậm. · unit
- **YC11.1-NT6** Khi doanh thu một tháng là 13.400.000đ, thì cột ghi "13.4tr". · unit
- **YC11.1-NT7** Khi tháng 10 có 4 người bán, thì dòng xếp Sale Hùng 4.000.000đ, Sale Lan 3.500.000đ, Khách lẻ 2.600.000đ, Sale Minh 1.700.000đ, cộng bằng 11.800.000đ. · database, unit
- **YC11.1-NT8** Khi Chị Hoa đọc thống kê, thì dữ liệu trả về không có giá bán, tiền chênh, mức cộng, và không có đặt phòng của chủ nhà khác. · database
- **YC11.1-NT9** Khi có B2 và B5 chưa cọc, thì "CHƯA THU TIỀN" ghi 3.700.000đ và B2 ghi "nhận phòng sau 10 ngày" ngày 07/10. · database, unit
- **YC11.1-NT10** Khi chủ nhà đánh dấu đã thu đủ B2 (YC5.5), thì B2 không còn ở "CHƯA THU TIỀN". · database
- **YC11.1-NT11** Khi tháng chưa có đặt phòng, thì mọi số ghi 0, không có dòng so sánh, và có hai dòng "Chưa có đặt phòng trong tháng.", "Không có khoản nào chưa thu." · unit

## YC11.2 · Thống kê của sale

Bản 1 · rủi ro: cao · Màn: S7, S7-00

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Mở tab Thống kê | "Thống kê", nhãn "Tháng 10/2026" | Số liệu tháng này và tháng trước của sale |
| 2 | Xem tiền chênh | "TIỀN CHÊNH THÁNG 10 1.600.000đ", "+33.3% so với tháng 9" | Theo quy tắc Tính theo đêm, QT3 |
| 3 | Xem đặt phòng và doanh số | "ĐẶT PHÒNG 6 · Tháng 9: 4", "DOANH SỐ 10.600.000đ · Tháng 9: 9.800.000đ" | Số đặt phòng ([MỞ: YC11-H6] đếm theo tháng nào), doanh số = tổng giá bán các đêm của tháng |
| 4 | Xem theo chủ nhà | "DOANH SỐ THEO CHỦ NHÀ", ghi chú "Tiền chênh là giá bán trừ giá chủ nhà". Mỗi dòng tên chủ, doanh số, tiền chênh; có cả chủ căn tự nhập | Theo chủ nhà |
| 5 | Xem chờ chủ | "CHỜ CHỦ NHÀ CHẤP NHẬN: 1", "À La Carte 2208 · 10/10 → 12/10", "Gửi 14:20 · Anh Tuấn chưa trả lời" | Mọi yêu cầu đang chờ, không theo tháng (giả định GD26) |
| 6 | Chạm dòng chờ chủ | Mở S7-03 hay S3-03: [MỞ: YC11-H5] | Không |
| 7 | Tháng chưa chốt đặt phòng nào | S7-00: "TIỀN CHÊNH THÁNG 10 0đ", "Tháng này chưa chốt đặt phòng nào", "Tìm phòng trống, gửi khách và đặt phòng với chủ nhà. Đặt phòng đã chốt tính ở đây.", nút "Tìm phòng" (YC7.2) | Như bước 1 |

Sale chọn tháng khác được không: [MỞ: YC11-H8]; tới khi có câu trả lời, chỉ tháng hiện tại. Đặt phòng vắt qua hai tháng chia giá bán cho các đêm thế nào: [MỞ: YC11-H2]; đặt phòng trong một tháng không phụ thuộc câu này. Đặt phòng ở căn của tôi có tính vào thống kê sale không: [MỞ: YC11-H1].

Tiêu chí:
- **YC11.2-NT1** Khi Hùng có B1, B3, H3, H4, H5, V2 trong tháng 10, thì ghi 6 đặt phòng, doanh số 10.600.000đ, tiền chênh 1.600.000đ. · database, unit
- **YC11.2-NT2** Khi tháng 9 tiền chênh 1.200.000đ, thì ghi "+33.3% so với tháng 9". · unit
- **YC11.2-NT3** Khi Hùng xem theo chủ nhà, thì có ba dòng Chị Hoa 4.800.000đ · chênh 800.000đ, Anh Tuấn 4.200.000đ · chênh 600.000đ, Chú Bình 1.600.000đ · chênh 200.000đ. · database, unit
- **YC11.2-NT4** Khi Y1 đang chờ, thì Y1 không cộng vào đặt phòng, doanh số, tiền chênh, và "CHỜ CHỦ NHÀ CHẤP NHẬN" ghi 1. · database
- **YC11.2-NT5** Khi Chị Hoa ghi 1509 cho Sale Hùng (YC5.2) với giá bán 2.600.000đ, giá chủ nhà 2.200.000đ, thì thống kê của Hùng cộng 1 đặt phòng, 2.600.000đ doanh số, 400.000đ tiền chênh ở dòng Chị Hoa. · database
- **YC11.2-NT6** Khi Sale Lan đọc thống kê hay gửi kèm mã của Hùng, thì không có số nào của Hùng; Hùng không đọc được B2, B5, tên và số khách. · database
- **YC11.2-NT7** Khi Chị Hoa đã xóa căn 1509 hay đã xóa tài khoản, thì B1, B3 vẫn tính vào thống kê của Hùng. · database
- **YC11.2-NT8** Khi tháng chưa chốt đặt phòng nào, thì thấy S7-00 và nút "Tìm phòng" mở tìm phòng. · unit

## YC11.3 · Đặt phòng và yêu cầu của sale

Bản 1 · rủi ro: tb · Màn: S7-03, S7-03-00

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Mở danh sách từ S7 ([MỞ: YC11-H5]) | "ĐẶT PHÒNG CỦA TÔI": mỗi dòng căn và ngày ở, câu trạng thái, nhãn | Danh sách của sale |
| 2 | Xem nhãn | "Chờ chủ": "Đã gửi yêu cầu, chờ chủ chấp nhận" kèm giờ gửi. "Đã chốt": "Chủ đã chấp nhận · chênh 400.000đ". "Bị từ chối": "Chủ không nhận" hay "Chủ đã nhận đặt phòng khác cùng ngày". "Hết hạn": "Chủ chưa trả lời trong 2 tuần". "Đã hủy": "Bạn đã hủy yêu cầu" | Trạng thái theo YC9 |
| 3 | Xem đặt phòng chủ nhà ghi cho mình | Nhãn "Đã chốt", tiền chênh, câu "Chị Hoa đã ghi giúp bạn" | Đặt phòng có sale này đứng tên |
| 4 | Chạm một dòng | Đặt phòng: chi tiết đặt phòng phía sale (YC5.9). Yêu cầu: [MỞ: YC11-H5] | Không |
| 5 | Xem chú thích | "Chờ chủ → Đã chốt. Chủ từ chối hoặc nhận đặt phòng khác: Bị từ chối. Quá 2 tuần: Hết hạn. Bạn tự hủy: Đã hủy." | Không |
| 6 | Chưa có yêu cầu nào | S7-03-00: "Chưa có yêu cầu nào", "Tìm phòng trống, gửi khách và đặt phòng với chủ nhà. Yêu cầu bạn gửi hiện ở đây.", nút "Tìm phòng" | Không |

Đặt phòng sale tự ghi cho căn tự nhập có trong danh sách không: [MỞ: YC11-H3]; tới khi có câu trả lời, không có. Câu trạng thái của đặt phòng chủ nhà ghi giúp chưa có trên hình (giả định GD25: "Chị Hoa đã ghi giúp bạn").

Tiêu chí:
- **YC11.3-NT1** Khi Y1 chờ, thì nhãn "Chờ chủ", có giờ gửi, không có tiền chênh. · unit
- **YC11.3-NT2** Khi B1 đã chấp nhận, thì nhãn "Đã chốt" và dòng ghi "chênh 400.000đ". · database, unit
- **YC11.3-NT3** Khi Y4 bị từ chối, thì nhãn "Bị từ chối" và dòng ghi lý do. · unit
- **YC11.3-NT4** Khi Y2 quá 2 tuần chưa được trả lời (kể cả việc hết hạn chưa chạy), thì nhãn "Hết hạn". · database, unit
- **YC11.3-NT5** Khi Y3 do Hùng tự hủy, thì nhãn "Đã hủy". · unit
- **YC11.3-NT6** Khi Chị Hoa ghi 1509 10/10 → 12/10 cho Hùng (YC5.2), thì danh sách của Hùng có dòng 1509 · 10/10 → 12/10 nhãn "Đã chốt" với chênh 400.000đ. · database, unit
- **YC11.3-NT7** Khi Sale Lan đọc danh sách, thì không có dòng nào của Hùng. · database

## Màn hình

Xem hình: `python3 scripts/trich-man.py <mã>`. Chữ và số trên hình lệch YC thì YC đúng.

- **CN8, CN8-00 · Thống kê chủ nhà.** Số theo DLM.5; cột T5 đến T8 giữ số trên hình.
- **S7, S7-00 · Thống kê sale.** Số theo DLM.6.
- **S7-03, S7-03-00 · Đặt phòng của tôi.** Chưa có câu cho đặt phòng chủ nhà ghi giúp (GD25).

## Lịch sử bản

| Bản | Ngày | Mục đổi | Đổi gì |
|---|---|---|---|
| 1 | 18/11/2026 | Tất cả | Tạo từ story US18 và US19 (QD21) |
