# US19 · Thống kê của sale và trạng thái booking

- Loại: tính năng
- Trạng thái: chờ code
- Đặc tả: thô (lắp bằng máy từ bản Zalo, chưa viết lại theo khuôn, chưa áp các quyết định ở `docs/tham-khao/Loi_Tung_ban_Zalo.md`; không code theo bản này, xem US41)
- Bản: 1
- Rủi ro: cao
- Làm sau khi xong: US15, US16, US28
- Kiểm tay: `tests/kich-ban/US19.md` (23 kịch bản)

## Mục tiêu
Là sale, tôi muốn biết tháng này mình lời bao nhiêu, đặt phòng nào đã chốt và yêu cầu nào đang chờ chủ nhà, để báo khách đúng mà không phải hỏi lại chủ nhà.

## Hành vi
Bảng bước ghi: người dùng làm gì, app hiện gì (chữ trong ngoặc kép là chữ trên màn), máy chủ phải làm gì, dữ liệu nào đổi. Cột "Máy chủ" mô tả việc phải xảy ra; bản PWA làm bằng RLS, view và hàm `fn_*` của Supabase.

### Thống kê của sale
Rủi ro: cao
Mục đích: sale thấy tháng này mình lời bao nhiêu, bán qua chủ nhà nào, và còn gì đang chờ. Booking của sale gồm booking thành từ yêu cầu đã chốt, booking chủ nhà ghi cho sale (mục "Booking chủ nhà ghi cho sale" (US28)) và booking sale tự ghi cho căn tự nhập (nhóm Nguồn phòng và căn tự nhập).
Màn hình: S7, S7-00
Khi nào xảy ra: sale mở tab Thống kê.

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở tab Thống kê | Tiêu đề "Thống kê", nhãn "Tháng 10/2026" | số liệu tháng của sale gọi, chỉ của mình, PQ15.SALE) | Không | Không |
| 2 | Xem tiền chênh | Thẻ "TIỀN CHÊNH THÁNG 10: 1.600.000đ", "+33.3% so với tháng 9" | tiền chênh cộng theo đêm thuộc tháng, bỏ đặt phòng đã hủy, QT3.1, QT3.2, QD-012). Kèm tiền chênh tháng trước để app tính phần so với tháng trước | Không | Không |
| 3 | Xem booking và doanh số | Thẻ "ĐẶT PHÒNG: 6 · Tháng 9: 4"; thẻ "DOANH SỐ: 10.600.000đ · Tháng 9: 9.800.000đ" | doanh số theo đêm thuộc tháng, QT2.2). Kèm số tháng trước. Cách đếm số đặt phòng: [MỞ: CH-006] | Không | Không |
| 4 | Xem theo chủ nhà | "DOANH SỐ THEO CHỦ NHÀ", ghi chú "Tiền chênh là giá bán trừ giá chủ nhà". Mỗi dòng: tên chủ, doanh số, tiền chênh; có cả chủ căn tự nhập | doanh số và tiền chênh theo chủ nhà, tính từ `booking` của sale gồm cả căn tự nhập, QT3.1, QT3.2) | Không | Không |
| 5 | Xem chờ chủ | "CHỜ CHỦ NHÀ CHẤP NHẬN: 1", dòng "À La Carte 2208 · 10/10 → 12/10", "Gửi 14:20 · Anh Tuấn chưa trả lời" | số yêu cầu đang chờ chủ | Không | Không |
| 6 | Chạm mục chờ chủ | Mở S3-03 (màn chờ chủ nhà của yêu cầu đó, mục "Sale gửi yêu cầu đặt phòng" (US15)), theo mũi tên trên canvas | Theo mục "Sale gửi yêu cầu đặt phòng" (US15) | Không | Không |
| 7 | Tháng chưa chốt booking nào | S7-00: tiền chênh 0đ, dòng "Tháng này chưa chốt đặt phòng nào", gợi ý "Tìm phòng trống, gửi khách và đặt phòng với chủ nhà. Đặt phòng đã chốt tính ở đây." và nút "Tìm phòng" | tháng không có đặt phòng nào | Không | Không |
| 8 | Bấm "Tìm phòng" | Sang tìm phòng (mục "Tìm phòng trống theo ngày" (US12)) | Không gọi server | Không | Không |

Theo quy tắc: Tiền chênh (QT3); Doanh thu tính theo tháng; Booking chờ chủ chưa tính vào số liệu.

Trạng thái màn:
- rỗng: S7-00
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: không áp dụng
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

### Trạng thái booking của sale
Rủi ro: tb
Mục đích: sale biết từng yêu cầu mình đã gửi đang ở bước nào: Chờ chủ, Đã chốt, Bị từ chối, Hết hạn, Đã hủy; và thấy cả booking chủ nhà ghi cho mình (mục "Booking chủ nhà ghi cho sale" (US28)).
Màn hình: S7-03, S7-03-00, S7-03-01
Khi nào xảy ra: sale mở danh sách booking của mình từ màn Thống kê.

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở danh sách | "ĐẶT PHÒNG CỦA TÔI": mỗi dòng gồm căn và ngày ở, câu trạng thái, nhãn trạng thái | yêu cầu của sale gọi.: đặt phòng của sale, gồm cả đặt phòng chủ nhà ghi cho sale (bước 3a), có tiền chênh | Không | Không |
| 2 | Xem "Chờ chủ" | "Đã gửi yêu cầu, chờ chủ chấp nhận" (có giờ gửi nếu có) | yêu cầu `cho_chu` | Không | Không |
| 3 | Xem "Đã chốt" | "Chủ đã chấp nhận · chênh 300.000đ" | yêu cầu `da_chot`, có `gia_chu` và `gia_ban`, QT3.1) | Không | Không |
| 3a | Xem booking chủ nhà ghi cho mình (mục "Booking chủ nhà ghi cho sale" (US28)) | Nhãn "Đã chốt", có số tiền chênh. Câu trạng thái nói chủ nhà đã ghi giúp; chữ chưa vẽ. Chạm vào mở booking theo mục "Booking chủ nhà ghi cho sale" (US28) bước 3 | Gửi booking có sale_id là sale này | | Không |
| 4 | Xem "Bị từ chối" | "Chủ không nhận" hoặc "Chủ đã nhận đặt phòng khác cùng ngày" | yêu cầu `bi_tu_choi` kèm lý do | Không | Không |
| 4a | Xem "Hết hạn" | "Chủ chưa trả lời trong 2 tuần" | yêu cầu `het_han`; quá hạn coi là hết hạn ngay lúc đọc | Không | Không |
| 4b | Xem "Đã hủy" | "Bạn đã hủy yêu cầu" | yêu cầu `da_huy` | Không | Không |
| 4c | Xem booking "Đã chốt" với chủ nhà đã xóa tài khoản (mục "Khi người dùng xóa tài khoản" (US22)) | Dòng vẫn còn, nhãn "Đã chốt", số tiền chênh như cũ. Tên cũ của chủ nhà kèm ghi chú nhỏ đỏ "Đã xoá tài khoản" (QD-013). Chạm vào mở booking theo mục "Sale nhận kết quả yêu cầu" (US15) bước 5 | Gửi booking, không gửi căn, lịch, số điện thoại của chủ nhà đã xóa tài khoản | | Không |
| 4d | Xem yêu cầu còn chờ, bị từ chối, hết hạn hay đã hủy với chủ nhà đã xóa tài khoản | Yêu cầu đang chờ giữ nguyên nhãn "Chờ chủ", không tự hủy; quá 14 ngày vẫn thành "Hết hạn" như thường (mục "Sale gửi yêu cầu đặt phòng" (US15) bước 6). Yêu cầu bị từ chối, hết hạn, đã hủy cũng giữ nguyên, tên chủ nhà kèm ghi chú nhỏ đỏ "Đã xoá tài khoản" (QD-013; điểm (b) cũ xóa hoặc hủy không còn đúng) | Như bước 4c | | Không |
| 5 | Xem thứ tự trạng thái | Ghi chú "Chờ chủ → Đã chốt. Chủ từ chối hoặc nhận đặt phòng khác: Bị từ chối. Quá 2 tuần: Hết hạn. Bạn tự hủy: Đã hủy." | Không gọi server | Không | Không |

Theo quy tắc: Yêu cầu chưa phải booking (nhóm Booking); Trạng thái yêu cầu đặt phòng (nhóm Booking); Tiền chênh (QT3).

Trạng thái màn:
- rỗng: chưa có yêu cầu nào: S7-03-00
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: không áp dụng
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng (thông báo P13 mở đúng dòng liên quan, thuộc mục "Thông báo kết quả kết nối cho sale" (US17))

## Tiêu chí nghiệm thu
Mỗi tiêu chí một test tự động mang đúng mã này trong tên test. Mã không đổi nghĩa; đổi hành vi thì cấp mã mới (docs/QUY_TRINH.md mục 5).

- **US19-NT1** Khi doanh số theo ba chủ nhà là 4.800.000đ, 4.200.000đ, 1.600.000đ, thì doanh số tháng ghi 10.600.000đ.
- **US19-NT2** Khi tiền chênh theo ba chủ nhà là 800.000đ, 600.000đ, 200.000đ, thì tiền chênh tháng ghi 1.600.000đ.
- **US19-NT3** Khi booking còn chờ chủ, thì không cộng vào thẻ "Đặt phòng", Doanh số hay Tiền chênh.
- **US19-NT4** Khi tháng chưa chốt booking nào, thì thấy S7-00 và nút "Tìm phòng" mở tìm phòng.
- **US19-NT5** Khi Chị Hoa ghi 1509 10/10 → 12/10 cho Sale Hùng (US28-NT1), thì thống kê tháng 10 của Sale Hùng cộng thêm 1 vào thẻ "Đặt phòng", 2.600.000đ vào Doanh số và 400.000đ vào Tiền chênh, ở dòng chủ nhà Chị Hoa.
- **US19-NT6** Khi Chị Hoa đã xóa căn 1509 (mục "Xóa căn" (US27)), thì booking cũ của Sale Hùng ở 1509 vẫn tính vào thống kê của Sale Hùng.
- **US19-NT7** Khi yêu cầu còn chờ chủ, thì nhãn là "Chờ chủ" và không có số tiền chênh.
- **US19-NT8** Khi chủ chấp nhận, thì nhãn là "Đã chốt" và dòng ghi số tiền chênh.
- **US19-NT9** Khi chủ từ chối hoặc nhận đặt phòng khác cùng ngày, thì nhãn là "Bị từ chối" và dòng ghi lý do.
- **US19-NT10** Khi yêu cầu quá 2 tuần chưa được trả lời, thì nhãn là "Hết hạn".
- **US19-NT11** Khi sale tự hủy yêu cầu, thì nhãn là "Đã hủy".
- **US19-NT12** Khi Chị Hoa ghi 1509 10/10 → 12/10 cho Sale Hùng (US28-NT1), thì S7-03 của Sale Hùng có dòng 1509 · 10/10 → 12/10 nhãn "Đã chốt" với tiền chênh 400.000đ.

## Luật kiểm dữ liệu và lỗi
Mỗi mục là một việc app nhờ database làm. "Đầu vào" là luật kiểm từng ô, "Lỗi riêng" là khi nào phải từ chối. Cột "Mã" là tên gọi trong tài liệu; hàm database báo lỗi bằng một câu tiếng Việt cho người dùng đọc (docs/luat-chung/Nghiep_vu.md mục Lỗi).

### Danh sách đặt phòng của sale
**Đầu vào**
| Trường | Ở đâu (đường dẫn, query, thân) | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|---|
| truoc | query | chuỗi | Không | Con trỏ (README) |
| gioi_han | query | số nguyên | Không | Mặc định 50, tối đa 100 |
Có gồm booking `sale_tu_ghi` của căn tự nhập và booking căn của tôi không: [MỞ: US19-H1]. Tới khi có câu trả lời, chỉ gồm `nguon` `tu_yeu_cau` và `chu_tu_ghi`.

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| DU_LIEU_SAI | `truoc` sai; `gioi_han` ngoài 1 đến 100 |

### Số liệu một tháng của sale
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| `thang` | thang | Có | `YYYY-MM`, năm 2020 đến 2100. S7 có đổi tháng không: [MỞ: CH-030]; API vẫn nhận mọi tháng |
| `so_thang` | số nguyên | Không | 1 đến 12, mặc định 1 |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| DU_LIEU_SAI | `thang` thiếu hay sai dạng; `so_thang` ngoài 1 đến 12 |

## Ai được làm và việc kéo theo
Nguyên liệu chép từ đặc tả máy chủ của bản Zalo, đã đổi tên bảng và mã. Đối chiếu với hàm database ở mục Database khi viết lại story: chỗ nào lệch thì ghi vào "Database đang lệch story". Tên lỗi viết hoa (`KHONG_TIM_THAY`, `DU_LIEU_SAI`) là tên loại lỗi của bản cũ; bản PWA báo bằng câu tiếng Việt.

### Danh sách đặt phòng của sale
**Ai gọi:** người dùng có tài khoản. Chỉ booking có `sale_id` là người gọi (PQ7.SALE). Không có vai khác.

**Việc kéo theo:** Không.

**Chống bấm hai lần:** không cần (đọc).

### Số liệu một tháng của sale
**Ai gọi:** người đã đăng nhập. Số liệu chỉ gồm đặt phòng có `booking.sale_id` là người gọi: đặt phòng thành từ yêu cầu (`tu_yeu_cau`), đặt phòng chủ nhà ghi chọn sale này (`chu_tu_ghi`, mục "Booking chủ nhà ghi cho sale" (US28)), đặt phòng sale tự ghi cho căn tự nhập (`sale_tu_ghi`) (mục "Thống kê của sale" (US19) Mục đích, QT3.1). Gồm cả đặt phòng với chủ nhà đã ngừng chia sẻ (QD-007), chủ nhà đã xóa tài khoản (QD-013), căn đã ẩn (US19-NT6). Chỉ của mình (PQ15.SALE). Đặt phòng ở căn riêng của sale (QD-005) có tính không: [MỞ: US19-H7] mục "Thống kê của sale" (US19) không nói.

Luật tính:
- Chỉ đặt phòng chưa hủy (QD-012). Yêu cầu chưa thành đặt phòng không tính (US19-NT3).
- Theo tháng của đêm (QD-010, QT2.2, QT3.2).
- Tiền chênh của một đêm = giá bán đêm đó trừ giá chủ đêm đó (QT3.2). Data-model chỉ lưu tổng `gia_ban_booking.gia_ban`, không lưu giá bán từng đêm. Chia giá bán cho các đêm thế nào khi đặt phòng qua hai tháng: [MỞ: US19-H8] QT3.2; GD12 chỉ nói căn tự nhập. Đặt phòng nằm trọn trong một tháng thì không phụ thuộc câu này.
- Doanh số = tổng giá bán các đêm thuộc tháng (mục "Thống kê của sale" (US19) bước 3).

**Việc kéo theo:** Không.

**Chống bấm hai lần:** không cần (đọc).

## Luật chung dùng
Nguyên văn ở `docs/luat-chung/` (QT.md, HV.md, Nghiep_vu.md, Tu_dien.md), tìm theo mã hoặc tên.

QT3.1 (bản 2: tính cả đặt phòng chủ nhà ghi cho sale), QT3.2, QT2.2, QT4.2. Quy tắc trong nhóm Thống kê: Doanh thu tính theo tháng, So với tháng trước, Tiền chênh, Booking chờ chủ chưa tính. Quy tắc trong nhóm Booking: Trạng thái yêu cầu đặt phòng, Yêu cầu chưa phải booking. QD-010, QD-012. HV1, HV2, HV3.

## Màn hình
Hình: `python3 docs/thiet-ke/trich-man.py <mã màn>` (docs/thiet-ke/README.md). Chữ và số trên hình lệch story thì story đúng.

S7, S7-00, S7-03, S7-03-00. S3-03 là đích khi chạm mục chờ chủ (mục "Thống kê của sale" bước 6, làm ở US15). S7-03-01 thuộc US22.

**S7-00 · Thống kê · chưa có booking**
Vào từ: Xem YC (canvas chưa có mũi tên tới màn này)
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Tiêu đề | "Thống kê TIỀN CHÊNH THÁNG 10 0đ Tháng này chưa chốt đặt phòng nào Tìm phòng trống, gửi khách và đặt phòng với chủ nhà. Đặt phòng đã chốt tính ở đây. Tìm phòng Lịch Căn Thống kê Cá nhân" | Canvas |
| 2 | Cỡ chữ, vùng bấm | Chữ tối thiểu 14 px, vùng bấm tối thiểu 44 px | CLAUDE.md |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Tìm phòng" | Mở màn S1-02 | S1-02 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- không có quyền: chưa thiết kế

**S7-03-00 · Trạng thái booking · chưa có yêu cầu**
Vào từ: Tab Thống kê của sale
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 0 | Màn gốc | Chép đúng màn S7-03 trên canvas, chỉ đổi phần trạng thái. | S7-03 |
| 1 | Giữa màn | "Chưa có yêu cầu nào", "Tìm phòng trống, gửi khách và đặt phòng với chủ nhà. Yêu cầu bạn gửi hiện ở đây." | |
| 2 | Nút | "Tìm phòng" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Tìm phòng" | Tìm phòng | S1-02 |
Trạng thái riêng:
- rỗng: chính là màn này

**S7-03-01 · Trạng thái booking · chủ nhà đã xóa**
Vào từ: Tab Thống kê của sale
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Màn gốc | Chép đúng S7-03 | S7-03 |
| 2 | Dòng Đã chốt của Chị Hoa | "ICON40 1509 · 10/10 → 12/10" và "04/10 → 06/10": dòng phụ "Chị Hoa" kèm nhãn "đã xóa tài khoản" · "chênh 400.000đ". Tiền chênh giữ nguyên | Đặt phòng (DLM.6) |
| 3 | Các dòng khác | Như S7-03 | S7-03 |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Dòng của Chị Hoa | Mở booking | S3-11 |
Trạng thái riêng:
- không có quyền: theo HV5

**S7 · Thống kê của sale**
Vào từ: Tab Thống kê của sale
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Tiền chênh tháng 10 | "1.600.000đ", "+33.3% so với tháng 9" | DLM.6 |
| 2 | Đặt phòng, doanh số | "6 · Tháng 9: 4", "10.600.000đ · Tháng 9: 9.800.000đ" | DLM.6 |
| 3 | Doanh số theo chủ nhà | Chị Hoa 4.800.000đ · chênh 800.000đ; Anh Tuấn 4.200.000đ · chênh 600.000đ; Chú Bình 1.600.000đ · chênh 200.000đ | DLM.6 |
| 4 | Chờ chủ nhà chấp nhận | "1", "À La Carte 2208 · 10/10 → 12/10", "Gửi 14:20 · Anh Tuấn chưa trả lời" | Y1 |
| 5 | Thanh tab | Lịch · Căn · Thống kê · Cá nhân | Cố định |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Dòng chờ chủ | Mở danh sách booking | S7-03 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- đang tải: chưa thiết kế (HV1)
- lỗi mạng: chưa thiết kế (HV2)
- quay lại từ nền: chưa thiết kế (HV3)

## Quyền
Ô quyền theo `docs/luat-chung/PQ.md`. Mỗi ô phải có test chứng minh người không có quyền thì không đọc, không ghi được; test ở lớp database (`tests/db/`).

Ô PQ chạm tới (ma trận `docs/luat-chung/PQ.md`): PQ15.SALE, PQ15.CHU, PQ14.SALE, PQ7.SALE, PQ8.SALE, PQ9.SALE, PQ10.SALE, PQ11.SALE. Test vi phạm phải có:
- PQ15.SALE: Sale Lan gọi, không có đặt phòng nào của Sale Hùng; API không nhận `sale_id`.
- PQ15.CHU: Chị Hoa gọi, không thấy tiền chênh của sale nào (chỉ đặt phòng có `sale_id` là Chị Hoa).
- PQ14.SALE: Sale Lan không thấy dòng "Chú Bình" của Sale Hùng.
- PQ7.SALE: Sale Hùng gọi, không thấy B2 của Sale Lan, B5 khách lẻ, dù cùng căn.
- PQ9.SALE: không có khóa tên, số khách, kể cả khi Chị Hoa đã nhập khách cho đặt phòng.
- PQ10.SALE: Sale Lan gọi, không thấy yêu cầu của Sale Hùng.
- PQ11.SALE: giá bán chỉ của chính sale gọi (qua cả hai API).
- Luật chung 4: gọi khi không có phiên trả `CHUA_DANG_NHAP`.

## Database
Đã có trong `supabase/migrations/` và đã chạy test. Tham số và cột: `docs/tu-sinh/Bang_va_cot.md`.

Sale đọc đặt phòng của mình qua view `v_booking_cua_sale` (không có tiền cọc).

- `fn_thong_ke_sale`: test ở t_10_thong_ke.sql

## Ngoài phạm vi
- Chủ nhà ghi đặt phòng chọn sale làm người đặt, thông báo "chủ ghi đặt phòng cho bạn", sale sửa giá bán (mục "Booking chủ nhà ghi cho sale" (US28)): US28. Ở đây chỉ kiểm hiệu ứng lên thống kê và danh sách (KB7, KB9).
- Gửi yêu cầu, chủ chấp nhận, từ chối, sale hủy (mục "Sale gửi yêu cầu đặt phòng" (US15) đến mục "Yêu cầu trùng ngày" (US15)): US15. KB15, KB16, KB18 dùng các luồng đó để tạo dữ liệu.
- Căn tự nhập và đặt phòng sale tự ghi (nhóm Nguồn phòng và căn tự nhập): US16. Ở đây chỉ kiểm dòng "Chú Bình" trong thống kê.
- Dòng chủ nhà đã xóa tài khoản, S7-03-01, yêu cầu tự hủy khi chủ nhà xóa (mục "Trạng thái booking của sale" bước 4c, 4d, NT6): US22.
- Thống kê của chủ nhà (mục "Thống kê tháng của chủ nhà" (US18) đến mục "Chưa thu tiền" (US18)): US18.
- Chọn tháng khác ở S7 (CH-030): chưa quyết, S7 chỉ có nhãn "Tháng 10/2026".
- Đặt phòng ở căn riêng của sale (QD-005) có vào thống kê của sale không: chưa quyết. [MỞ: US19-H2] US19-Q4
- Mục chờ chủ theo tháng đang xem hay mọi yêu cầu đang chờ [MỞ: US19-H9]: tạm mọi yêu cầu đang chờ. [MỞ: US19-H3] US19-Q5

## Việc cần làm
- [ ] Đọc story này và các luật chung nó trỏ tới. Chỗ nào gắn thẻ MỞ thì không code, hỏi Tùng (docs/Cau_hoi_mo.md).
- [ ] Viết test cho từng tiêu chí chưa có test, test đỏ trước (lớp test: docs/QUY_TRINH.md mục 6).
- [ ] Database: soát các hàm ở mục Database với tiêu chí; thiếu thì thêm migration mới và một dòng trong `scripts/thu-lam-hong.sh`.
- [ ] Giao diện: các màn ở mục Màn hình, nối với Supabase (docs/Ghi_chu_code.md).
- [ ] E2E cho luồng chính của story.
- [ ] Kiểm tay theo `tests/kich-ban/US19.md` trên điện thoại thật.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md` trong cùng PR.
