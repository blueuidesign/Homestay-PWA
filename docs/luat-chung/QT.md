<!-- Luật chung, sống. Quy tắc tính toán dùng ở nhiều story. Mỗi ví dụ (QTx.y-VDn) có test mang mã đó trong tests/db. Story trỏ tới đây bằng mã, không chép lại. -->

# QT1 · Chặn trùng booking

Một đêm của một căn chỉ được thuộc một booking. Luật này kiểm ở database, không chỉ ở giao diện, vì mọi đường ghi booking đều phải đi qua database. Đêm tính từ ngày nhận tới trước ngày trả.

## QT1.1 · Chặn trùng theo căn
Rủi ro: cao
Booking chiếm đêm gồm booking chủ nhà tự ghi và booking thành từ yêu cầu đặt phòng đã chốt. Ghi một booking mà có ít nhất một đêm đã thuộc booking khác của cùng căn thì bị từ chối, không lưu. Yêu cầu đang chờ chủ không chiếm đêm.

| Mã | Đã có | Ghi mới | Phải ra |
|---|---|---|---|
| QT1.1-VD1 | B1: 1509, 10/10 → 12/10 | 1509, 11/10 → 13/10 | Từ chối: trùng đêm 11/10 |
| QT1.1-VD2 | B1: 1509, 10/10 → 12/10 | 1509, 12/10 → 13/10 | Lưu được: 12/10 là ngày trả của B1, không phải đêm của B1 |
| QT1.1-VD3 | B1: 1509, 10/10 → 12/10 | 3402, 10/10 → 12/10 | Lưu được: khác căn |

## QT1.2 · Sửa booking
Rủi ro: cao
Khi sửa một booking, phép kiểm trùng bỏ chính booking đang sửa ra. Chỉ so với các booking khác của cùng căn.

| Mã | Đã có | Sửa | Phải ra |
|---|---|---|---|
| QT1.2-VD1 | B1: 1509, 10/10 → 12/10 | B1 giữ ngày, đổi tiền | Lưu được |
| QT1.2-VD2 | B1: 1509, 10/10 → 12/10; B5: 1509, 13/10 → 15/10 | B1 thành 10/10 → 14/10 | Từ chối: trùng đêm 13/10 của B5 |

## QT1.3 · Căn tự nhập
Rủi ro: tb
Booking sale tự ghi cho căn tự nhập chỉ chặn trùng trong chính căn tự nhập đó. Không so với căn tự nhập của sale khác, kể cả khi hai sale nhập cùng một căn ngoài đời, và không so với căn trong nguồn phòng.

| Mã | Đã có | Ghi mới | Phải ra |
|---|---|---|---|
| QT1.3-VD1 | V2: Villa Tuần Châu của Sale Hùng, 08/10 → 09/10 | Sale Hùng ghi Villa Tuần Châu, 08/10 → 10/10 | Từ chối: trùng đêm 08/10 |
| QT1.3-VD2 | V2: Villa Tuần Châu của Sale Hùng, 08/10 → 09/10 | Sale Lan ghi căn tự nhập Villa Tuần Châu của Lan, 08/10 → 09/10 | Lưu được: hai căn tự nhập khác nhau |

## QT1.4 · Yêu cầu đặt phòng gặp đêm đã kín
Rủi ro: cao
Sale gửi yêu cầu cho đêm đã thuộc một booking của căn đó thì server không tạo yêu cầu, báo "Căn này đã được đặt rồi" (YC9.1 bước 3a). Chủ nhà chấp nhận một yêu cầu, hoặc tự ghi booking, thì mọi yêu cầu đang chờ có đêm trùng thành Bị từ chối (YC9.3, (giả định GD11) cho trường hợp chủ tự ghi).

| Mã | Đang có | Việc xảy ra | Phải ra |
|---|---|---|---|
| QT1.4-VD1 | B1: 1509, 10/10 → 12/10 | Sale Lan gửi yêu cầu 1509, 11/10 → 12/10 | Không tạo yêu cầu, báo "Căn này đã được đặt rồi" |
| QT1.4-VD2 | Hai yêu cầu chờ: Sale Hùng và Sale Lan, 1509, 17/10 → 19/10 | Chủ chấp nhận yêu cầu của Sale Hùng | Yêu cầu của Sale Lan thành Bị từ chối |

Các ví dụ dùng số trong `Du_lieu_mau.md`.

# QT2 · Đêm có khách

Một luật chung cho lịch của chủ nhà (CN1), thống kê (CN8) và lịch phòng của sale (S1, ô "Kín"), để ba màn luôn ra cùng một con số.

## QT2.1 · Booking chiếm những đêm nào
Rủi ro: cao
Booking chiếm các đêm từ ngày nhận tới trước ngày trả. Ngày trả không phải đêm có khách. Booking đã xóa không chiếm đêm [MỞ: LC-H1].

| Mã | Nhận → trả | Phải ra |
|---|---|---|
| QT2.1-VD1 | B1: 10/10 → 12/10 | 2 đêm: 10/10, 11/10 |
| QT2.1-VD2 | B6: 14/10 → 15/10 | 1 đêm: 14/10 |

## QT2.2 · Đêm thuộc tháng nào
Rủi ro: tb
Mỗi đêm thuộc tháng của chính đêm đó. Booking qua hai tháng thì chia đêm cho hai tháng.

| Mã | Nhận → trả | Phải ra |
|---|---|---|
| QT2.2-VD1 | B9: 30/11 → 02/12 | Tháng 11: 1 đêm (30/11). Tháng 12: 1 đêm (01/12) |
| QT2.2-VD2 | Mọi booking tháng 10 của Chị Hoa (DLM.4) | 13 đêm có khách (DLM.5) |

Các ví dụ dùng số trong `Du_lieu_mau.md`.

# QT3 · Tiền chênh của sale

Chỉ sale đó thấy (PQ15.SALE).

## QT3.1 · Tính tiền chênh
Rủi ro: cao
Tiền chênh của một booking bằng tiền sale thu khách trừ tiền trả chủ nhà (giá chủ nhà). Chỉ tính booking đã chốt: booking thành từ yêu cầu đã chốt, booking chủ nhà ghi chọn sale làm người đặt (YC5.4, coi như booking của sale), và booking sale tự ghi cho căn tự nhập. Yêu cầu đang chờ, bị từ chối, hết hạn, đã hủy không tính.

| Mã | Booking | Thu khách | Trả chủ | Phải ra |
|---|---|---|---|---|
| QT3.1-VD1 | B1 (1509, 2 đêm) | 2.600.000đ | 2.200.000đ | 400.000đ |
| QT3.1-VD2 | V2 (Villa Tuần Châu, căn tự nhập, 1 đêm) | 1.600.000đ | 1.400.000đ | 200.000đ |
| QT3.1-VD3 | Chị Hoa ghi 1509 10/10 → 12/10 cho Sale Hùng, mức cộng +200k mỗi đêm (YC5.4-NT1) | 2.600.000đ | 2.200.000đ | 400.000đ |

## QT3.2 · Tiền chênh thuộc tháng nào
Rủi ro: tb
Tiền chênh chia theo đêm, như doanh thu (QD-010, QT2.2). Mỗi đêm mang phần chênh của đêm đó: giá bán đêm đó trừ giá chủ đêm đó. Booking chỉ có tổng tiền, không có giá từng đêm (căn tự nhập), thì chia đều tiền chênh cho các đêm (giả định GD12).

| Mã | Booking | Phải ra |
|---|---|---|
| QT3.2-VD1 | B1: 10/10 → 12/10, mức cộng 200.000đ mỗi đêm | Tháng 10: 400.000đ |

Chưa có ví dụ booking của sale qua hai tháng trong dữ liệu mẫu.

Các ví dụ dùng số trong `Du_lieu_mau.md`.

# QT4 · Tiền phòng của booking và cách chia theo đêm

Một luật cho ô "Tiền phòng" khi chủ nhà ghi booking (YC5.2) và cho số tiền của từng đêm mà doanh thu theo tháng (QD-010, QT2.2, YC11) và tiền chênh theo tháng (QT3.2) dùng. Bảng giá chỉ để điền sẵn, booking giữ số của riêng nó (YC3, YC4 quy tắc Booking giữ giá riêng).

## QT4.1 · Tiền phòng điền sẵn và số chủ nhà gõ
Rủi ro: cao
Tiền phòng điền sẵn bằng tổng giá chủ nhà của các đêm theo bảng giá lúc ghi (giá dịp thay giá tháng, đêm cuối tuần theo YC4.6). Chủ nhà sửa được; số chủ nhà gõ là tiền phòng của booking. Tiền phòng bắt buộc: còn trống thì chưa lưu được.

| Mã | Booking | Bảng giá các đêm | Chủ nhà gõ | Phải ra |
|---|---|---|---|---|
| QT4.1-VD1 | 1509, nhận 31/10 trả 02/11 (2 đêm) | 31/10 (T7, cuối tuần) 1.300.000đ; 01/11 (CN, ngày thường) 900.000đ (DLM.3) | Không sửa | Ô điền sẵn 2.200.000đ; tiền phòng 2.200.000đ |
| QT4.1-VD2 | Như VD1 | Như VD1 | 2.000.000đ | Tiền phòng 2.000.000đ |
| QT4.1-VD3 | Như VD1 | Như VD1 | Xóa trống ô | Chưa lưu được |

## QT4.2 · Chia tiền phòng cho các đêm
Rủi ro: cao
Chủ nhà không sửa ô tiền phòng thì mỗi đêm giữ giá của đêm đó theo bảng giá lúc ghi. Chủ nhà gõ tổng khác tổng bảng giá thì chia đều tổng đó cho các đêm, tính bằng đồng, phần lẻ không chia hết dồn vào đêm cuối. Mỗi đêm thuộc tháng của chính đêm đó (QT2.2).

| Mã | Booking | Tiền phòng | Phải ra |
|---|---|---|---|
| QT4.2-VD1 | 1509, nhận 31/10 trả 02/11 (2 đêm), chủ nhà gõ khác bảng giá (QT4.1-VD2) | 2.000.000đ | Đêm 31/10: 1.000.000đ, đêm 01/11: 1.000.000đ. Doanh thu tháng 10: 1.000.000đ, tháng 11: 1.000.000đ |
| QT4.2-VD2 | 3 đêm, chủ nhà gõ khác bảng giá | 1.000.000đ | 333.333đ, 333.333đ, 333.334đ (đêm cuối nhận phần lẻ) |
| QT4.2-VD3 | 1509, nhận 31/10 trả 02/11, chủ nhà không sửa (QT4.1-VD1) | 2.200.000đ | Đêm 31/10: 1.300.000đ, đêm 01/11: 900.000đ. Doanh thu tháng 10: 1.300.000đ, tháng 11: 900.000đ |

VD1, VD2, VD3 dùng bộ số DLM.3.
