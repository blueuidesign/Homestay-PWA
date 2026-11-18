# US3 · Chủ nhà ghi đặt phòng khách lẻ, chặn trùng ở database

- Loại: tính năng
- Trạng thái: chờ code
- Đặc tả: đã viết lại
- Bản: 1
- Rủi ro: cao (chặn trùng, tiền)
- Làm sau khi xong: US2 (lịch tháng và chi tiết ngày), US4 (bảng giá tháng)
- Kiểm tay: `tests/kich-ban/US3.md`

## Mục tiêu

Là chủ nhà, tôi muốn ghi một đặt phòng vào lịch chỉ trong vài chạm, được báo ngay khi chọn trùng đêm đã có khách, và có sẵn tiền phòng theo bảng giá, để không bao giờ nhận hai khách cho một đêm và không phải tự cộng tiền.

Vì sao quan trọng: chủ nhà hiện ghi lịch bằng sổ tay hoặc nhóm Zalo. Trùng phòng là lỗi đắt nhất của nghề (khách đến không có phòng, mất uy tín với sale). Vì vậy chặn trùng phải nằm ở database, không chỉ ở giao diện: mọi đường ghi (app, lệnh gửi thẳng, hai máy bấm cùng lúc) đều đi qua cùng một ràng buộc.

## Luồng chính

Hôm nay là 07/10/2026. Chị Hoa có khách lẻ gọi đặt căn 1509 từ 31/10 tới 02/11. Chị mở tab Lịch, bấm "Đặt phòng". Form "Thêm đặt phòng" mở ra. Chị chạm chip "1509", chọn ngày nhận 31/10, chạm chip "2 đêm": ngày trả tự thành 02/11 và dòng "✓ 31/10 → 02/11 (2 đêm) · không trùng lịch" hiện ra. Ô "Tiền phòng (đ)" đã điền sẵn 2.200.000, bên dưới tách "31/10: 1.300.000đ" và "01/11: 900.000đ" (đêm 31/10 là thứ Bảy nên tính giá cuối tuần). Chị chạm chip "Khách lẻ", giữ "Chưa cọc", bấm "Thêm đặt phòng". App về tab Lịch, toast "Đã thêm đặt phòng Khách lẻ · 1509" hiện ở đầu màn, ngày 31/10 mở sẵn chi tiết. Từ lúc đó mọi sale được chia sẻ căn 1509 thấy đêm 31/10 và 01/11 là "Kín".

Nếu Chị Hoa chọn 1509 từ 11/10 tới 13/10, dòng kiểm hiện báo trùng vì đêm 11/10 đã thuộc đặt phòng B1 của Sale Hùng. Dù app có lỗi để lọt lệnh lưu, database vẫn từ chối.

## Phạm vi

Story này làm:
- Mở form từ hai chỗ: nút "Đặt phòng" ở tab Lịch (CN1), và nút trên dòng căn trống ở chi tiết ngày (CN3).
- Chọn căn, ngày, số đêm; kiểm trùng sớm trên form; chặn trùng ở database khi lưu.
- Người đặt là **khách lẻ** (có hoặc không có tên).
- Tiền phòng điền sẵn theo bảng giá, chủ nhà sửa được, bắt buộc có.
- Trạng thái tiền, tiền cọc, số khách, giờ nhận trả, ghi chú.
- Lưu, chống bấm hai lần, mất mạng khi lưu.

Không làm (dễ tưởng thuộc story này):
- Chọn một **sale** làm người đặt (chip "Sale Hùng" trên form, US5-NT13): US28. Ở story này các chip sale có thể hiện nhưng chưa bấm được; xem bước 5.
- Chip "+ Sale mới" (thêm sale bằng tay): US5.
- Lịch tháng tô đêm có khách, lọc theo căn, chi tiết ngày của căn có khách: US2.
- Sale thấy "Kín" ở lịch của sale (US6-NT11): US6.
- Xem chi tiết, sửa, xóa, ghi đã thu đủ (form sửa CN4-02 dùng chung bố cục với form này): US10.
- Ghi đặt phòng cho căn tự nhập của sale: US16.
- Thông báo cho sale khi đặt phòng mới làm yêu cầu của họ bị từ chối, hoặc chiếm đêm của căn họ đã gửi khách: việc này database tự làm khi lưu (bước 9), nhưng màn thông báo thuộc US15, US30.

## Hành vi

Cột "Database" ghi việc phải xảy ra ở database. Chữ trong ngoặc kép là chữ trên màn, viết đúng như vậy.

### Mở form

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1a | Ở tab Lịch (CN1), bấm "Đặt phòng" | Mở CN4, tiêu đề "Thêm đặt phòng". Căn chọn sẵn là căn đầu tiên trong danh sách căn của chủ nhà. Ngày nhận điền sẵn là đêm trống đầu tiên của căn đó tính từ hôm nay, số đêm 1 | Đọc căn của chủ nhà (chưa ẩn, loại có lịch) và các đặt phòng chưa hủy của các căn đó qua RLS |
| 1b | Ở chi tiết ngày (CN3), bấm nút trên dòng căn trống ("Phòng 3402 · Trống ✓") | Mở CN4 với căn 3402 và ngày nhận là ngày đang xem, số đêm 1 | Như 1a |

Chữ trên nút ở dòng căn trống: "Đặt phòng" (theo `docs/luat-chung/Tu_dien.md`). Canvas CN3 còn ghi "Thêm khách": làm theo story.

Chủ nhà chưa có căn nào thì không có nút "Đặt phòng" (màn trống của tab Lịch thuộc US1).

### Chọn căn, ngày và kiểm trùng sớm

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 2 | Chạm một chip ở hàng "Phòng" | Chọn căn đó. Hàng chip chỉ có căn của chính chủ nhà, chưa ẩn. Đổi căn thì giữ ngày, chạy lại bước 4 và tiền phòng | Không |
| 3 | Chạm chip "1 đêm", "2 đêm" hoặc "3 đêm" | Ngày trả = ngày nhận cộng số đêm. Chạm "Tùy chọn" thì ô "Ngày trả phòng" mở để chọn tự do; đổi ngày trả bằng tay thì chip số đêm tương ứng tự sáng (1, 2, 3) hoặc "Tùy chọn" | Không |
| 3b | Đổi ô "Ngày nhận phòng" | Giữ số đêm đang chọn, dời ngày trả theo | Không |
| 4 | (tự động sau mỗi lần đổi căn hoặc ngày) | Dòng kiểm dưới ô ngày: không trùng thì "✓ 31/10 → 02/11 (2 đêm) · không trùng lịch"; trùng thì dòng đỏ "Trùng đêm 11/10 với đặt phòng của Sale Hùng (10/10 → 12/10)" và nút "Thêm đặt phòng" không bấm được | Không gọi riêng: app so với các đặt phòng đã đọc ở bước 1. Đây chỉ là báo sớm; chặn thật ở bước 9 |

Luật đêm: một lần ở chiếm các đêm từ ngày nhận tới **trước** ngày trả (QT1.1, QT2). Nhận 12/10 không trùng với đặt phòng trả 12/10.

Trùng với nhiều đặt phòng thì dòng đỏ nêu đặt phòng có đêm trùng sớm nhất và thêm "và N đặt phòng khác". Người đặt trong dòng đỏ là tên sale, hoặc "Khách lẻ", hoặc tên khách chủ nhà đã nhập (chủ nhà thấy được khách của chính mình, QD-011).

### Người đặt

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 5 | Xem hàng chip "Khách / Sale" | Thứ tự chip: "+ Sale mới", "Khách lẻ", các sale đang kết nối, rồi các tên khách lẻ chủ nhà đã nhập trước đây (mới nhất trước, tối đa 10). Chưa chip nào được chọn | Đọc tên khách chủ nhà đã nhập từ `booking_rieng` của chính chủ nhà qua RLS |
| 6 | Chạm "Khách lẻ" | Chọn khách lẻ không tên | Không |
| 6b | Chạm một tên khách đã dùng (ví dụ "Dung Đỗ") | Chọn khách lẻ có tên đó | Không |

Chưa chọn người đặt thì nút "Thêm đặt phòng" không bấm được. Cách nhập một tên khách mới chưa có trên hàng chip: [MỞ: US3-H1].

Các chip sale và "+ Sale mới" hiện theo canvas nhưng ở story này chạm vào thì không làm gì (làm ở US28, US5). Nếu US28 xong trước thì theo US28.

### Tiền phòng

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 7 | (tự động sau khi có căn và ngày) | Ô "Tiền phòng (đ)" điền sẵn tổng giá chủ nhà của các đêm. Dưới ô, mỗi đêm một dòng "31/10: 1.300.000đ". Đêm nào chưa có giá thì dòng ghi "01/12: chưa đặt giá" và ô tiền phòng để trống | Hàm trả giá chủ nhà từng đêm của căn (QT4.1, `docs/luat-chung/Nghiep_vu.md` mục 1.3: giá dịp, rồi giá tháng ngày thường hoặc cuối tuần) |
| 7b | Gõ số khác vào ô | Giữ số chủ nhà gõ. Các dòng từng đêm vẫn hiện giá bảng giá để chủ nhà so | Không |
| 7c | Đổi căn hay ngày sau khi đã gõ số | Điền lại theo bảng giá mới, bỏ số đã gõ | Không |
| 7d | Xóa trống ô | CN4-01: viền đỏ, dòng "Nhập tiền phòng trước khi lưu", nút "Thêm đặt phòng" không bấm được | Không |

Ô nhận số nguyên đồng, hiện có dấu chấm ngăn nghìn khi gõ ("2.200.000"). Không nhận số âm, số lẻ.

### Trạng thái tiền và chi tiết thêm

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 8a | Chạm một trong ba chip "Chưa cọc", "Đã cọc · còn thu", "Đã thanh toán" | Chọn chip đó. Mở form thì "Chưa cọc" chọn sẵn (giả định GD19) | Không |
| 8b | Chọn "Đã cọc · còn thu" | Hiện ô "Số tiền cọc (đ)". Chọn chip khác thì ô này ẩn và giá trị đã gõ bị bỏ | Không |
| 8c | Bấm "Thêm chi tiết" | Mở phần chi tiết: số khách (nút − và +, từ 1), giờ nhận và giờ trả điền sẵn theo cài đặt của chủ nhà ("14:00 → 12:00"), ô "Ghi chú". Dòng tóm tắt khi đóng: "4 khách · 14:00 → 12:00 · Ghi chú" | Đọc `profiles.gio_nhan`, `gio_tra` của chủ nhà |

Tiền cọc có bắt buộc khi đã chọn "Đã cọc · còn thu" không: [MỞ: CH-025]. Tới khi có câu trả lời, ô để trống vẫn lưu được.

Tiền cọc lớn hơn tiền phòng thì không lưu được, ô cọc viền đỏ, dòng "Tiền cọc không được lớn hơn tiền phòng" (giả định GD20).

### Lưu

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 9 | Bấm "Thêm đặt phòng" | Nút chuyển trạng thái đang lưu, không bấm lại được. Gửi kèm một mã lần gửi (`client_id`) app tự sinh khi mở form | `fn_chu_ghi_booking`: kiểm người gọi giữ căn đó; kiểm dữ liệu (mục Luật kiểm); ghi `booking`; ràng buộc `booking_khong_trung` từ chối nếu trùng đêm; ghi tiền từng đêm vào `booking_dem` theo QT4.2; ghi tên, số khách vào `booking_rieng` của chủ nhà; yêu cầu đặt phòng đang chờ có đêm trùng thành bị từ chối (QT1.4, giả định GD11); cập nhật giờ lịch đổi của căn (`can.lich_cap_nhat_luc`). Trigger ghi thông báo cho sale có căn đã gửi khách trùng đêm |
| 10 | (lưu được) | Về tab Lịch (CN4-03), tháng chứa ngày nhận, ngày nhận đang chọn và chi tiết ngày mở sẵn. Toast "Đã thêm đặt phòng Khách lẻ · 1509" (có tên khách thì thay "Khách lẻ" bằng tên) | Không |
| 11 | (database từ chối vì trùng) | Ở lại form, giữ mọi ô đã nhập. Dòng kiểm ngày thành đỏ "Căn đã có đặt phòng trong những đêm này". Đọc lại đặt phòng của căn để dòng kiểm ở bước 4 đúng với dữ liệu mới | Trả lỗi P0001 với câu trên |
| 12 | (lỗi khác do dữ liệu) | Ở lại form, toast đỏ là câu database trả về (ví dụ "Ngày trả phải sau ngày nhận") | Trả lỗi P0001 kèm câu tiếng Việt |
| 13 | (mất mạng hoặc quá 15 giây không có trả lời) | Ở lại form, giữ dữ liệu, toast "Chưa lưu được vì mất mạng. Kiểm tra mạng rồi bấm lại." Bấm lại thì gửi **cùng** `client_id` | Nếu lần trước thực ra đã lưu, lần gửi lại trả về đặt phòng cũ, không tạo cái thứ hai |

Hai máy cùng ghi một đêm của một căn trong cùng một lúc: một lệnh lưu được, lệnh kia nhận lỗi ở bước 11. Không bao giờ cả hai cùng lưu.

### Trạng thái màn

- Đang tải danh sách căn, đặt phòng hay giá khi mở form: theo HV1 (khung xám tại chỗ, không chặn cả màn).
- Mất mạng khi đang mở form: theo HV2; vẫn nhập được, chỉ không lưu được.
- Rời app khi đang nhập rồi quay lại: theo HV3, giữ nguyên dữ liệu đã nhập, chạy lại bước 4.
- Căn bị ẩn hoặc chủ nhà mất quyền với căn trong lúc đang nhập: lưu bị từ chối, toast "Có lỗi xảy ra. Bạn thử lại sau ít phút.", theo HV5.
- Toast: theo HV8 (vị trí, tự tắt).

## Tiêu chí nghiệm thu

Mỗi tiêu chí một test mang đúng mã trong tên test. Lớp test ghi ở cuối dòng: **database** (`tests/db/`), **unit** (Vitest, cạnh file code), **E2E** (Playwright trên staging). Số theo `docs/luat-chung/Du_lieu_mau.md`, hôm nay 07/10/2026.

Ghi và chặn trùng:
- **US3-NT1** Khi chủ nhà bấm "Thêm đặt phòng" với đủ căn, ngày, người đặt và tiền phòng, thì đặt phòng hiện trong lịch của căn đó và toast "Đã thêm đặt phòng <người đặt> · <căn>" hiện đầu màn. · E2E
- **US3-NT2** Khi các đêm đã chọn chưa có khách trong căn, thì thấy dòng "không trùng lịch". · unit
- **US3-NT3** Khi các đêm đã chọn trùng với một đặt phòng chưa hủy của cùng căn, thì thấy dòng báo trùng, nút lưu không bấm được, và lệnh lưu gửi thẳng tới database cũng bị từ chối. · unit (dòng báo), database (từ chối: QT1.1-VD1)
- **US3-NT4** Khi 1509 đã có B1 (10/10 → 12/10) và chủ nhà ghi 1509 từ 12/10 tới 13/10, thì lưu được (QT1.1-VD2). Ghi 3402 từ 10/10 tới 12/10 cũng lưu được (QT1.1-VD3). · database
- **US3-NT5** Khi hai lệnh ghi cùng đêm của cùng căn chạy cùng lúc, thì đúng một lệnh lưu được. · database
- **US3-NT6** Khi app gửi lại lệnh lưu với cùng `client_id` sau khi lần trước đã lưu, thì không có đặt phòng thứ hai và app nhận về đặt phòng đã lưu. · database
- **US3-NT7** Khi Sale Lan đang có yêu cầu chờ cho 1509 từ 17/10 tới 19/10 và Chị Hoa tự ghi 1509 từ 18/10 tới 19/10, thì yêu cầu của Sale Lan thành bị từ chối (giả định GD11). · database

Ngày:
- **US3-NT8** Khi chủ nhà chọn "2 đêm", thì ngày trả bằng ngày nhận cộng 2. · unit
- **US3-NT9** Khi chủ nhà bấm "Đặt phòng" ở tab Lịch, căn đầu tiên là 1509 và 1509 chỉ có B1 (10/10 → 12/10), thì form mở với 1509, nhận 07/10, trả 08/10. Khi 1509 có thêm một đặt phòng 07/10 → 10/10, thì ngày nhận điền sẵn là 12/10 (đêm trống đầu tiên sau B1). · unit
- **US3-NT10** Khi chủ nhà xem chi tiết ngày 10/10 và căn 3402 trống ngày đó, thì dòng 3402 ghi "Trống" và có nút "Đặt phòng"; bấm nút thì CN4 mở với căn 3402 và ngày nhận 10/10. · E2E
- **US3-NT11** Khi lệnh ghi có ngày trả không sau ngày nhận, hoặc dài hơn 365 đêm, thì database từ chối với câu "Ngày trả phải sau ngày nhận" hoặc "Một đặt phòng dài tối đa 365 đêm". · database

Tiền:
- **US3-NT12** Khi chủ nhà chọn 1509, nhận 31/10 trả 02/11, thì ô tiền phòng điền sẵn 2.200.000đ, dưới ô có "31/10: 1.300.000đ" và "01/11: 900.000đ" (QT4.1-VD1). · database (hàm giá từng đêm), unit (hiển thị)
- **US3-NT13** Khi chủ nhà giữ 2.200.000đ và lưu, thì tiền đêm 31/10 là 1.300.000đ, đêm 01/11 là 900.000đ (QT4.2-VD3). Khi gõ 2.000.000đ và lưu, thì mỗi đêm 1.000.000đ (QT4.2-VD1). Khi 3 đêm và gõ 1.000.000đ, thì 333.333đ, 333.333đ, 333.334đ (QT4.2-VD2). · database
- **US3-NT14** Khi ô "Tiền phòng (đ)" trống, thì nút "Thêm đặt phòng" không bấm được, ô viền đỏ với dòng "Nhập tiền phòng trước khi lưu", và đặt phòng không được lưu (CN4-01, QT4.1-VD3). · unit
- **US3-NT15** Khi lệnh tạo đặt phòng không có tiền phòng gửi thẳng tới database, thì database từ chối với câu "Cần nhập tiền phòng" và lịch không đổi. · database
- **US3-NT16** Khi một đêm trong khoảng đã chọn chưa có giá (ví dụ 1509 nhận 30/12/2026 trả 02/01/2027, tháng 1 chưa đặt giá), thì dòng của đêm đó ghi "chưa đặt giá" và ô tiền phòng để trống. · unit
- **US3-NT17** Khi chủ nhà chọn "Đã cọc · còn thu", thì hiện ô "Số tiền cọc (đ)"; chọn "Chưa cọc" hoặc "Đã thanh toán" thì ô này ẩn. · unit
- **US3-NT18** Khi tiền cọc lớn hơn tiền phòng (cọc 3.000.000đ, tiền phòng 2.200.000đ), thì app không cho lưu, và lệnh gửi thẳng tới database bị từ chối với câu "Tiền cọc không được lớn hơn tiền phòng" (giả định GD20). · unit, database

Người đặt và chi tiết:
- **US3-NT19** Khi chưa chọn chip nào ở hàng "Khách / Sale", thì nút "Thêm đặt phòng" không bấm được. · unit
- **US3-NT20** Khi Chị Hoa đã từng ghi khách tên "Dung Đỗ", thì hàng chip có "Dung Đỗ" sau các chip sale; Anh Tuấn mở form của mình thì không thấy "Dung Đỗ". · database (RLS), unit (thứ tự chip)
- **US3-NT21** Khi chủ nhà mở "Thêm chi tiết", thì thấy số khách, giờ nhận và giờ trả (14:00, 12:00 theo cài đặt) và ô ghi chú. · unit
- **US3-NT22** Khi chủ nhà không mở "Thêm chi tiết" và lưu, thì giờ nhận, giờ trả của đặt phòng lấy theo cài đặt của chủ nhà lúc lưu. · database

Quyền:
- **US3-NT23** Khi Anh Tuấn gửi lệnh ghi đặt phòng vào căn 1509 của Chị Hoa, hoặc Sale Hùng gửi lệnh này (dù được chia sẻ căn 1509), thì database từ chối và lịch 1509 không đổi. · database
- **US3-NT24** Khi Sale Hùng đọc đặt phòng khách lẻ Chị Hoa vừa ghi, thì Hùng chỉ thấy đêm kín qua lịch của sale, không thấy tên khách, số khách, tiền phòng, tiền cọc. · database

## Luật kiểm dữ liệu và lỗi

Database là chỗ chặn thật; app chặn trước cho người dùng thấy sớm. Mọi câu lỗi dưới đây database trả bằng mã P0001 để app hiện nguyên câu (`docs/luat-chung/Nghiep_vu.md` mục 1.6).

| Ô | Bắt buộc | Luật | Câu lỗi khi sai |
|---|---|---|---|
| Căn | có | Căn có lịch, của chính người gọi, chưa ẩn | (lỗi quyền, app hiện câu chung) |
| Ngày nhận, ngày trả | có | Ngày trả sau ngày nhận; tối đa 365 đêm. Ngày nhận trong quá khứ được phép (ghi bù) | "Ngày trả phải sau ngày nhận" · "Một đặt phòng dài tối đa 365 đêm" |
| Người đặt | có | Khách lẻ (tên có hoặc không) | (app chặn; database coi thiếu sale là khách lẻ) |
| Tên khách | không | Tối đa 100 ký tự, bỏ khoảng trắng đầu cuối | "Tên khách dài tối đa 100 ký tự" |
| Số điện thoại khách | không | Form chưa có ô (xem [MỞ: US3-H2]) | |
| Tiền phòng | có | Số nguyên đồng, lớn hơn 0 | "Cần nhập tiền phòng" · "Tiền phòng phải lớn hơn 0" |
| Trạng thái tiền | có | "chua_coc", "da_coc_con_thu", "da_thanh_toan" | "Trạng thái tiền không hợp lệ" |
| Tiền cọc | không | Chỉ khi "Đã cọc · còn thu"; số nguyên lớn hơn 0; không lớn hơn tiền phòng (GD20) | "Tiền cọc không được lớn hơn tiền phòng" |
| Số khách | không | Số nguyên 1 đến 99 | "Số khách từ 1 đến 99" |
| Giờ nhận, giờ trả | không | Giờ hợp lệ; không gửi thì lấy cài đặt của chủ nhà | |
| Ghi chú | không | Tối đa 500 ký tự | "Ghi chú dài tối đa 500 ký tự" |
| Mã lần gửi (`client_id`) | không | Trùng với đặt phòng đã có thì trả đặt phòng đó, không ghi mới | |

Trùng đêm: "Căn đã có đặt phòng trong những đêm này".

Tiền phòng 0 đồng (chủ nhà cho người quen ở miễn phí) có được ghi không: [MỞ: US3-H3]. Tới khi có câu trả lời, database chặn.

## Quyền

Theo `docs/luat-chung/PQ.md`. Mỗi dòng dưới đây có test vi phạm ở lớp database.

- PQ7.CHU: chỉ người giữ căn ghi được đặt phòng cho căn đó. Chủ nhà khác, sale được chia sẻ, người chưa đăng nhập đều không ghi được (US3-NT23).
- PQ9: tên, số khách chủ nhà nhập chỉ chủ nhà đó đọc được (QD-011). Sale không thấy (US3-NT24); chủ nhà khác không thấy (US3-NT20).
- PQ8.SALE: sale không thấy tiền phòng, tiền cọc của đặt phòng khách lẻ (US3-NT24).
- PQ4.SALE: sale được chia sẻ căn thấy đêm đó kín (hiển thị ở US6).

## Database

Bảng: `booking` (phần hai bên cùng thấy), `booking_dem` (tiền từng đêm), `booking_rieng` (khách của người nhập). Ý định và bất biến: `docs/Thiet_ke_DB.md` mục 3, điều 2, 6, 10. Cột và tham số: `docs/tu-sinh/Bang_va_cot.md`.

Đã có và đã chạy test:
- `fn_chu_ghi_booking(p jsonb)`: ghi đặt phòng. Test ở `tests/db/t_03_chan_trung.sql`, `t_04_tien_phong.sql`, `t_01_phan_quyen.sql`.
- Ràng buộc `booking_khong_trung`, chống gửi trùng bằng `client_id`, chia tiền theo đêm, từ chối yêu cầu trùng.

**Database đang lệch story, phải sửa trong PR của story này** (thêm migration mới, test, và dòng trong `scripts/thu-lam-hong.sh`):
1. `fn_chu_ghi_booking` tự điền tiền phòng theo bảng giá khi lệnh không gửi `tien_phong`. Story đòi từ chối (US3-NT15). Sửa: bắt buộc `tien_phong`.
2. Chưa có hàm cho app lấy giá từng đêm của căn mình (`gia_dem` là hàm nội bộ). Thêm `fn_chu_gia_cac_dem(p_can uuid, p_nhan date, p_tra date)` trả danh sách {đêm, giá hoặc null}, chỉ cho người giữ căn (US3-NT12, US3-NT16).
3. Tiền cọc lớn hơn tiền phòng đang bị ràng buộc bảng chặn, nhưng lỗi ra mã 23514, app chỉ hiện câu chung. Sửa: hàm kiểm trước và báo P0001 "Tiền cọc không được lớn hơn tiền phòng" (US3-NT18). Tương tự cho ngày dài hơn 365 đêm (chưa kiểm), số khách ngoài 1 đến 99 (bảng chỉ chặn số ≤ 0), tên khách quá 100 ký tự (chưa kiểm).
4. Ghi chú: bảng cho 1.000 ký tự, story nói 500. Sửa ràng buộc về 500.
5. Lỗi khi căn không phải của người gọi đang dùng mã 42501 với câu "Bạn không ghi được đặt phòng cho căn này". Giữ mã 42501 (app hiện câu chung) để không lộ căn có tồn tại hay không.

Đọc qua RLS, không cần hàm: căn của chủ nhà, đặt phòng chưa hủy của căn đó (để kiểm trùng sớm và điền đêm trống đầu tiên), tên khách đã nhập (`booking_rieng` của chính mình), giờ nhận trả (`profiles`).

## Màn hình

Hình: `python3 docs/thiet-ke/trich-man.py <mã>`. Chữ và số trên hình lệch story thì story đúng.

- **CN4 · Thêm đặt phòng.** Hình đúng bố cục. Lệch với story: hàng "Phòng" trên hình có chip "2501" (bộ mẫu chỉ có 1509, 3402); dòng kiểm ngày trên hình là ví dụ 09/10.
- **CN4-01 · Tiền phòng bỏ trống.** Như CN4, ô tiền phòng viền đỏ, dòng "Nhập tiền phòng trước khi lưu".
- **CN4-03 · Đã lưu.** Tab Lịch sau khi lưu, chi tiết ngày mở sẵn, toast. Vị trí toast trên hình là của bản Zalo (dưới cụm "··· ✕"); bản PWA đặt ngay dưới thanh tiêu đề của app (HV8).
- **CN3 · Chi tiết một ngày.** Chỉ phần nút trên dòng căn trống (bước 1b); phần còn lại thuộc US2. Chữ trên nút: "Đặt phòng", không phải "Thêm khách" như hình.
- Màn báo trùng (dòng đỏ ở bước 4, 11) chưa có hình: dùng kiểu dòng lỗi của CN4-01 tại vị trí dòng kiểm ngày.

## Luật chung dùng

QT1.1 (chặn trùng theo căn), QT1.4 (yêu cầu gặp đêm đã kín), QT2 (đêm có khách), QT4.1, QT4.2 (tiền phòng và chia theo đêm) ở `docs/luat-chung/QT.md`. HV1, HV2, HV3, HV5, HV8 ở `docs/luat-chung/HV.md`. Giá một đêm: `docs/luat-chung/Nghiep_vu.md` mục 1.3. Từ ngữ: `docs/luat-chung/Tu_dien.md`.

## Câu hỏi mở và giả định

- [MỞ: US3-H1] Chủ nhà nhập tên một khách mới (chưa có trên hàng chip) ở đâu? Gợi ý: chạm "Khách lẻ" thì hiện ô "Tên khách (không bắt buộc)".
- [MỞ: US3-H2] Có ô số điện thoại khách trên form không? Database đã có chỗ lưu (`booking_rieng.sdt_khach`), canvas chưa có ô.
- [MỞ: US3-H3] Tiền phòng 0 đồng có được ghi không?
- [MỞ: CH-025] Đã chọn "Đã cọc · còn thu" thì tiền cọc có bắt buộc không?
- GD11: chủ nhà tự ghi đặt phòng trùng đêm với yêu cầu đang chờ thì yêu cầu đó thành bị từ chối.
- GD19: mở form thì chip "Chưa cọc" chọn sẵn.
- GD20: tiền cọc không được lớn hơn tiền phòng.

## Việc cần làm

- [ ] Hỏi Tùng US3-H1, US3-H2, US3-H3, CH-025 trước khi làm phần liên quan. Phần còn lại làm được ngay.
- [ ] Test database cho US3-NT3 (phần database), NT4 đến NT7, NT11 đến NT13, NT15, NT18, NT20, NT22 đến NT24. Chạy thấy đỏ ở các chỗ database đang lệch.
- [ ] Migration sửa 5 điểm ở mục "Database đang lệch story". Thêm dòng vào `scripts/thu-lam-hong.sh` cho: bắt buộc tiền phòng, cọc không lớn hơn tiền phòng, hàm giá từng đêm chỉ cho người giữ căn. Chạy `scripts/bang-cot.sh`.
- [ ] Unit test cho các tiêu chí lớp unit, rồi code form CN4: nối `services/api.ts` sang Supabase cho các hàm form dùng (`docs/Ghi_chu_code.md` mục 3).
- [ ] E2E: US3-NT1, US3-NT10 trên staging; bỏ `fixme` ở `tests/e2e/10_chu_ghi_dat_phong.spec.ts`.
- [ ] Sửa `tests/kich-ban/US3.md` theo story này: đổi ngày sang ngày còn trong tương lai, bỏ KB10, KB11 (thuộc US2), bỏ phần nói về Zalo.
- [ ] Kiểm tay trên điện thoại thật, luồng chính và trùng đêm.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md`.
