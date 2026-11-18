---
id: DLM
tieu_de: Bộ dữ liệu mẫu
trang_thai: de-xuat
nguoi_chu: tung
rev: 1
---
# Bộ dữ liệu mẫu chung (DLM)

Một bộ số cho tiêu chí nghiệm thu, ví dụ trong YC, test và dữ liệu thử trên staging. Tên người là tên giả. Số đã tính theo các quy tắc: giá theo đêm, đặt phòng chiếm các đêm từ ngày nhận tới trước ngày trả, đêm cuối tuần là T6 và T7, giá dịp thay giá tháng, doanh thu chia theo đêm (QT2, QT4).

## DLM.1 · Mốc thời gian
- Hôm nay là T4 07/10/2026 (S1 "7 ngày tới · 07/10 → 13/10", S6-05 "Hôm nay 07/10").
- Dữ liệu thử là trạng thái cuối ngày 07/10/2026.
- Màn trong một luồng vẽ trạng thái trước đó của cùng bộ số. Luồng sale Hùng đặt 1509: Hùng tìm phòng và gửi khách (S1-02 đến S5) và gửi yêu cầu (S3-02, S3-03) lúc 14:20 ngày 06/10; Chị Hoa chấp nhận cùng ngày (CN9, CN9-02, S3-04). Từ đó 1509 kín 10/10 và 11/10.
- Thứ trong tháng 10/2026: T6 là 02, 09, 16, 23, 30; T7 là 03, 10, 17, 24, 31; CN là 04, 11, 18, 25.

## DLM.2 · Người
| Mã | Tên giả | Vai trò | Ghi chú |
|---|---|---|---|
| CN-HOA | Chị Hoa | Chủ nhà | 2 căn. Đã kết nối 4 sale: Hùng, Lan, Nga, Minh. Bật cả 3 loại thông báo. Giờ nhận, trả 14:00 · 12:00. Đêm cuối tuần T6, T7 |
| CN-TUAN | Anh Tuấn | Chủ nhà | Chia sẻ 2 căn cho sale Hùng |
| CN-BINH | Chú Bình | Chủ căn tự nhập, không dùng app | Villa Tuần Châu |
| SALE-HUNG | Sale Hùng | Sale chính của các màn S và P của sale | Mức cộng mặc định +400k. 2 căn của mình: Green Bay 0812, Mường Thanh 1605 (DLM.3). Nguồn phòng 5 căn: 2 của Chị Hoa, 2 của Anh Tuấn, 1 tự nhập |
| SALE-LAN | Sale Lan | Sale | Kết nối Chị Hoa |
| SALE-NGA | Sale Nga | Sale | Kết nối Chị Hoa, tháng 10 chưa có booking |
| SALE-MINH | Sale Minh | Sale | Kết nối Chị Hoa |
| KHACH-LE | Khách lẻ | Booking chủ nhà tự ghi, không qua sale | Được lưu tên, số khách; bộ mẫu dùng "Khách lẻ", không có tên |

## DLM.3 · Căn và giá chủ nhà
| Căn | Chủ | Thông tin | Giá ngày thường (đêm CN đến T5) | Giá cuối tuần (đêm T6, T7) | Giá dịp |
|---|---|---|---|---|---|
| ICON40 1509 | Chị Hoa | 2PN · 3 giường (giường lớn) · view biển · Bãi Cháy | 900.000đ | 1.300.000đ | Không |
| 3402 | Chị Hoa | Canvas chưa ghi tòa | 800.000đ | 1.100.000đ | Dịp đặc biệt 24/10 – 25/10: 1.300.000đ |
| Sapphire 1103 | Anh Tuấn | 3PN · 2 giường (giường lớn) · view thành phố (A10) | 700.000đ | 700.000đ | Không |
| À La Carte 2208 | Anh Tuấn | 1PN · 1 giường · view biển (A10) | 1.500.000đ | 1.500.000đ | Không |
| Villa Tuần Châu | Chú Bình (tự nhập) | Không có lịch trống | Giá chủ sale lưu: 1.400.000đ mỗi đêm | | |

- Thẻ căn ghi số giường theo `glossary.md` (mục Phòng ngủ và số giường): 1509 "2PN · 3 giường", Sapphire 1103 "3PN · 2 giường", À La Carte 2208 "1PN · 1 giường".
- Giá của Chị Hoa áp cho tháng 10, 11, 12/2026. Căn 3402 có giá 7 tháng (T6 đến T12/2026). Tháng 11 và 12 được đặt bằng thao tác "Áp dụng cho Tháng 11 – 12" lúc 800.000đ / 1.100.000đ (YC4.2-NT1); trước thao tác đó hai tháng này ghi "Chưa đặt" (CN6), sau đó ghi "800k–1,1tr" (CN6-04, CN6-07, CN6-08).
- Thẻ căn tuần 05/10 – 11/10: 1509 "900.000đ – 1.300.000đ", 3402 "800.000đ – 1.100.000đ".
- Ô tháng 10 của 3402: "800k–1,3tr".
- Căn của sale Hùng (S6, S6-07): Green Bay 0812 "2PN · view biển", lịch 7 ngày 07/10 → 13/10 theo giá đêm của Hùng: 750k, Kín, Kín, 900k, 750k, 750k, 750k (S6-07, cùng số với hàng Green Bay 0812 trên S1). Mường Thanh 1605 "1PN · view biển", "Có khách 12/10" (S6). Phần còn thiếu ghi ở mục "Còn thiếu trong bộ này".
- Mức cộng của sale Hùng mỗi đêm: 1509 +200k (sửa riêng ở S3), Sapphire 1103 +100k, À La Carte 2208 +300k, 3402 theo mặc định +400k. Villa: giá bán Hùng lưu 1.600.000đ mỗi đêm.

## DLM.4 · Booking của Chị Hoa
| Mã | Căn | Người bán | Nhận → trả | Đêm | Tiền phòng (giá chủ nhà) | Trạng thái tiền |
|---|---|---|---|---|---|---|
| B1 | 1509 | Sale Hùng | 10/10 → 12/10 | 2 (T7, CN) | 1.300.000 + 900.000 = 2.200.000đ | Đã cọc · còn thu: cọc 1.000.000đ, còn 1.200.000đ |
| B2 | 3402 | Sale Lan | 17/10 → 19/10 | 2 (T7, CN) | 1.100.000 + 800.000 = 1.900.000đ | Chưa cọc |
| B3 | 1509 | Sale Hùng | 04/10 → 06/10 | 2 (CN, T2) | 1.800.000đ | Đã thanh toán |
| B4 | 3402 | Sale Lan | 05/10 → 07/10 | 2 (T2, T3) | 1.600.000đ | Đã thanh toán |
| B5 | 1509 | Khách lẻ | 13/10 → 15/10 | 2 (T3, T4) | 1.800.000đ | Chưa cọc |
| B6 | 3402 | Khách lẻ | 14/10 → 15/10 | 1 (T4) | 800.000đ | Đã thanh toán |
| B7 | 1509 | Sale Minh | 19/10 → 20/10 | 1 (T2) | 900.000đ | Đã thanh toán |
| B8 | 3402 | Sale Minh | 21/10 → 22/10 | 1 (T4) | 800.000đ | Đã thanh toán |
| B9 | 3402 | Sale Minh | 30/11 → 02/12 | 2 (T2, T3): 1 đêm tháng 11, 1 đêm tháng 12 | 1.600.000đ (tháng 11: 800.000đ, tháng 12: 800.000đ theo QT4.2) | Đã thanh toán |

B9 là booking nằm giữa hai tháng. Đặt ở tháng 11 – 12 để không đổi số tháng 10 trên canvas. Giờ của B1: "Nhận 14:00 thứ 7 · trả 12:00 thứ 2".

## DLM.5 · Số tháng 10 của Chị Hoa (tính từ DLM.4)
- Doanh thu tháng 10: 11.800.000đ, 13 đêm có khách. Tháng 9: 9.600.000đ (chỉ có tổng). So với tháng 9: +22.9%.
- Theo căn: 1509 6.700.000đ (7 đêm: B1, B3, B5, B7). 3402 5.100.000đ (6 đêm: B2, B4, B6, B8).
- Công suất: 13 / (2 × 31) = 13/62 = 21.0%.
- Theo người bán, giảm dần: Sale Hùng 4.000.000đ (B1, B3), Sale Lan 3.500.000đ (B2, B4), Khách lẻ 2.600.000đ (B5, B6), Sale Minh 1.700.000đ (B7, B8). Cộng 11.800.000đ.
- Chưa thu tiền (Chưa cọc): B2 Sale Lan 17/10 → 19/10, 1.900.000đ, "nhận phòng sau 10 ngày"; B5 Khách lẻ 13/10 → 15/10, 1.800.000đ, "nhận phòng sau 6 ngày". Tổng 3.700.000đ.
- Mục "Đặt phòng sắp tới" (nhận từ 07/10): B1, B5, B6, B2, B7, B8. Danh sách này là một phần của tháng, nên tổng của nó không bằng doanh thu tháng.
- Biểu đồ 6 tháng: cột T9 9.6tr, T10 11.8tr. Các cột T5 đến T8 giữ số canvas (có "7.2tr", "13.4tr").
- Chi tiết ngày 10/10 (CN3): 1509 có B1; 3402 trống.

## DLM.6 · Số tháng 10 của sale Hùng
Booking đã chốt:
| Mã | Căn | Chủ | Nhận → trả | Giá chủ nhà | Giá bán | Chênh |
|---|---|---|---|---|---|---|
| B1 | 1509 | Chị Hoa | 10/10 → 12/10 | 2.200.000đ | 2.600.000đ | 400.000đ |
| B3 | 1509 | Chị Hoa | 04/10 → 06/10 | 1.800.000đ | 2.200.000đ | 400.000đ |
| H3 | Sapphire 1103 | Anh Tuấn | 18/10 → 20/10 | 1.400.000đ | 1.600.000đ | 200.000đ |
| H4 | Sapphire 1103 | Anh Tuấn | 21/10 → 22/10 | 700.000đ | 800.000đ | 100.000đ |
| H5 | À La Carte 2208 | Anh Tuấn | 13/10 → 14/10 | 1.500.000đ | 1.800.000đ | 300.000đ |
| V2 | Villa Tuần Châu | Chú Bình (sale tự ghi, S6-05) | 08/10 → 09/10 | 1.400.000đ | 1.600.000đ | 200.000đ |

- Đặt phòng: 6. Tháng 9: 4.
- Doanh số: 10.600.000đ. Tháng 9: 9.800.000đ.
- Tiền chênh: 1.600.000đ. Tháng 9: 1.200.000đ. So với tháng 9: +33.3%.
- Theo chủ nhà: Chị Hoa 4.800.000đ, chênh 800.000đ; Anh Tuấn 4.200.000đ, chênh 600.000đ; Chú Bình 1.600.000đ, chênh 200.000đ.
- Chờ chủ nhà chấp nhận: 1. Y1 À La Carte 2208 · 10/10 → 12/10, giá chủ nhà 3.000.000đ, giá bán 3.600.000đ, gửi 14:20 ngày 07/10, Anh Tuấn chưa trả lời. Chưa tính vào các số trên.
- Yêu cầu không thành booking (S7-03). Không tính vào các số trên:
  - Y2 · Hết hạn: ICON40 1509 · 27/09 → 28/09, Chị Hoa chưa trả lời trong 2 tuần. Ngày gửi, giá chủ nhà, giá bán: S7-03 không ghi, chưa có trong bộ này.
  - Y3 · Đã hủy: À La Carte 2208 · 20/10 → 21/10, Hùng tự hủy. Ngày gửi, ngày hủy, giá chủ nhà, giá bán: S7-03 không ghi, chưa có trong bộ này.
  - Y4 · Bị từ chối: Sapphire 1103 · 05/10 → 06/10 (1 đêm T2), giá chủ nhà 700.000đ, Hùng gửi lúc 09:00 ngày 03/10, Anh Tuấn từ chối ngày 04/10 (P13).
- Ví dụ hết hạn ở S3-09: yêu cầu ICON40 1509 · 10/10 → 12/10, gửi lúc 14:20 ngày 22/09, Chị Hoa chưa trả lời, tới 07/10 đã quá 2 tuần nên Hết hạn. Số tiền trên S3-09 chưa theo bộ này.
- Booking sale tự ghi cho Villa Tuần Châu trước V2: V1 20/09 → 22/09, trả chủ 2.800.000đ, thu khách 3.400.000đ, chênh 600.000đ (S6-04, tháng 9).
- Ví dụ chủ nhà sửa booking (S3-10, S1-06, P13): Chị Hoa sửa B1 lúc 10:15 ngày 07/10, từ 10/10 → 12/10 sang 11/10 → 13/10 (2 đêm: CN, T2), giá chủ nhà 2.200.000đ → 1.800.000đ (900.000đ + 900.000đ). Giá bán của Hùng giữ 2.600.000đ như đã báo khách (YC5.6). Đây là ví dụ cho luồng sửa booking: các số B1 ở DLM.4, DLM.5, DLM.6 vẫn là trạng thái trước khi sửa.
- Thông báo của Hùng trên P13 (cùng ví dụ với popup S1-06). Giờ khớp DLM.1 và DLM.7. Hôm nay 07/10: "Chị Hoa đã sửa đặt phòng của bạn" (B1, như ví dụ trên) 10:15, chưa đọc. Trước đó: "Chị Hoa đã chấp nhận đặt phòng" (ICON40 1509 · 10/10 → 12/10, giá chủ nhà 2.200.000đ) hôm qua 06/10 lúc 15:05, chưa đọc; "Căn bạn đã gửi khách vừa có người đặt" hôm qua 06/10; "Yêu cầu đặt phòng đã hết hạn" (Y2, ICON40 1509 · 27/09 → 28/09) hôm qua 06/10; "Yêu cầu đặt phòng bị từ chối" (Y4, Sapphire 1103 · 05/10 → 06/10) ngày 04/10; "Anh Tuấn đồng ý cho bạn xem lịch" (Sapphire 1103 và À La Carte 2208) ngày 01/10, đã đọc.

## DLM.7 · Tìm phòng và gửi khách
Hùng tìm 10/10 → 12/10, 2 đêm (trạng thái 06/10, trước khi gửi yêu cầu 1509):
- Kết quả: 5 căn trống: 1 căn của Hùng, 4 nguồn phòng (1509, 3402, Sapphire 1103, À La Carte 2208). Villa Tuần Châu hiện "?". S2 và S4 cùng ghi 5.
- Chi tiết 1509 (S3): giá chủ nhà 2.200.000đ; chọn +200k thì giá bán 2.600.000đ.
- Gửi khách 3 căn (S5, P11): 1) ICON40 1509 2.600.000đ (6 ảnh); 2) Sapphire 1103 1.600.000đ; 3) À La Carte 2208 3.600.000đ. Giá chủ nhà tương ứng 2.200.000đ, 1.400.000đ, 3.000.000đ.
- Ví dụ mức cộng mặc định (P10, +400k, phòng 1509, 2 đêm): giá chủ nhà 2.200.000đ, giá gửi khách 3.000.000đ, bạn được 800.000đ.

## DLM.8 · Cá nhân và dữ liệu của Chị Hoa
- P1: "3 loại đang bật"; P3: 3 công tắc, cả 3 bật (Sale đặt phòng mới, Sale xin xem lịch, Đặt phòng chưa cọc).
- P7: "2 căn · 48 đặt phòng · 4 sale · giá cả năm".
- P8, chọn "Tháng này" và "Tất cả": "8 đặt phòng" (B1 đến B8). Chọn căn "1509": "4 đặt phòng".

## Còn thiếu trong bộ này
- Căn của Sale Hùng: Mường Thanh 1605 chưa có giá đêm; đặt phòng làm kín 08/10, 09/10 của Green Bay 0812 và đặt phòng 12/10 của Mường Thanh 1605 chưa có ngày nhận, ngày trả, số tiền. Chưa dùng trong ví dụ có số.
- Chưa có ví dụ đặt phòng của sale nằm giữa hai tháng.
- Các biến thể nhiều căn (CN1-02 3 căn, CN2 6 căn, CN5 và CN6-05 4 căn) và luồng yêu cầu trùng 18/10 → 19/10 giữ số như trên canvas.

## Bộ rút gọn cho test database
`tests/db/01_helpers.sql` hàm `t.fixture()` dựng một phần của bộ này, có chỉnh để thử quyền:
- Người: Chị Hoa, Anh Tuấn, Sale Hùng, Sale Lan, Sale Nga, một quản trị viên.
- Căn và giá tháng 10 đến 12/2026: 1509, 3402 của Chị Hoa; 1103 của Anh Tuấn; Villa Tuần Châu là căn tự nhập của Sale Hùng (chủ căn Chú Bình, giá chủ 1.400.000đ).
- Kết nối: Chị Hoa chia sẻ **tất cả căn** cho Sale Hùng; chia sẻ **chỉ 1509** cho Sale Lan (khác bộ đầy đủ, để thử phạm vi chọn căn); Sale Nga **chưa kết nối** (để thử người ngoài); Hùng chưa kết nối Anh Tuấn.
- Đặt phòng: mỗi test tự tạo đặt phòng nó cần, theo mã ví dụ QT.
