---
id: YC12
tieu_de: Thông báo
rev: 1
ban: 1
---
# YC12 · Thông báo

## Mục tiêu

Là chủ nhà hay sale, tôi muốn mở app là thấy ngay những gì mới liên quan tới mình (yêu cầu mới, đặt phòng bị sửa, yêu cầu bị từ chối), xem lại mọi thông báo ở một chỗ và tắt loại mình không cần, để không bỏ lỡ việc mà không phải tự đi kiểm từng màn.

Vì sao quan trọng: bản đầu không gửi tin Zalo hay thông báo đẩy, nên người dùng chỉ biết có việc mới khi mở app. Nếu mở app mà không thấy gì nổi lên, sale sẽ báo khách sai (ví dụ chủ nhà đã đổi ngày B1) và chủ nhà để yêu cầu hết hạn. Thông báo cũng là chỗ dễ lộ dữ liệu, vì nó chép thông tin của người khác vào hộp của mình.

## Luồng chính

Tối 06/10/2026 Sale Hùng mở app lúc 21:00 rồi tắt. Sáng 07/10, lúc 10:15 Chị Hoa sửa B1 từ 10/10 → 12/10 sang 11/10 → 13/10, tiền phòng 2.200.000đ thành 1.800.000đ (YC5.6). Hùng mở app lúc 10:30: popup "3 thông báo mới" nổi trên lịch, phía sau tối lại. Dòng đầu "Chị Hoa đã sửa đặt phòng của bạn", "ICON40 1509 · 10/10 → 12/10 đổi thành 11/10 → 13/10. Giá chủ nhà 2.200.000đ đổi thành 1.800.000đ", "10:15". Hùng chạm dòng đó, app mở chi tiết B1 phía sale (YC5.9), dòng thành đã đọc. Hùng vào Cá nhân > Thông báo: "1 chưa đọc", nhóm "Hôm nay" và "Trước đó" (DLM.6).

## Phạm vi

YC này gồm: danh sách loại thông báo (ai nhận, khi nào, chữ gì, chạm mở đâu), popup thông báo mới, màn Thông báo (P13), đánh dấu đã đọc, cài đặt thông báo (P3, P12), nhắc đặt phòng chưa cọc.

Không thuộc YC này (dễ tưởng là có):
- Việc làm sinh ra thông báo: ở YC của việc đó (cột "Sinh ở" bên dưới). YC đó đòi database ghi thông báo; YC này nói thông báo hiện ra sao.
- Toast kết nối khi sale đang mở app (A9): YC6.8.
- Tin Zalo, tin OA, thông báo đẩy của trình duyệt: bản sau (PWA.md P7).

## Quy tắc của nhóm

| Tên | Quy tắc | Ví dụ |
|---|---|---|
| Chỉ trong app | Thông báo chỉ hiện trong app. App lấy thông báo khi mở, khi quay lại từ nền, và mỗi 60 giây khi đang mở (PWA.md P7) | |
| Thông báo mới | Thông báo tạo sau lần mở app trước của người nhận. Mỗi lần mở app hay quay lại từ nền, database ghi mốc lần mở mới | Mở 21:00 ngày 06/10, sửa 23:00, mở 08:00 ngày 07/10: dòng sửa là mới |
| Không báo cho chính mình | Người làm việc không nhận thông báo về việc của chính mình | Chị Hoa tự sửa đặt phòng khách lẻ: không ai có thông báo |
| Công tắc chặn ghi | Loại đã tắt thì từ lúc tắt database không ghi thông báo loại đó cho người đó. Loại không có công tắc thì luôn ghi | |
| Chép lúc ghi, theo quyền người nhận | Thông báo chép căn, ngày, tiền lúc xảy ra. Chỉ chép những gì người nhận được thấy (PQ19): sale không có tên, giá bán của sale khác, tên khách; chủ nhà không có giá bán, tiền chênh | "Yêu cầu đặt phòng bị từ chối", không có tên sale được nhận |

## Các loại thông báo

| Loại | Người nhận | Sinh ở | Dòng chính · dòng phụ | Chạm mở | Công tắc |
|---|---|---|---|---|---|
| Chủ nhà đồng ý cho xem lịch | Sale | YC6.5, YC6.6 (gom 10 phút, GD15) | "Anh Tuấn đồng ý cho bạn xem lịch" · "Sapphire 1103 và À La Carte 2208 đã vào Nguồn phòng" | Như nút "Xem" ở YC6.8 | "Chủ nhà đồng ý cho xem lịch" |
| Chủ nhà ngừng cho xem lịch | Sale | YC6.2 | "Anh Tuấn đã ngừng cho bạn xem lịch" · "Sapphire 1103 và À La Carte 2208 không còn trong Nguồn phòng. Đặt phòng cũ của bạn với Anh Tuấn vẫn xem được trong Thống kê." | S7-03 (YC11.3) | Không |
| Chủ nhà chấp nhận yêu cầu | Sale | YC9.2 | "Chị Hoa đã chấp nhận đặt phòng" · "ICON40 1509 · 10/10 → 12/10 · giá chủ nhà 2.200.000đ" | S3-04-01 (YC9.4) | "Chủ nhà xác nhận đặt phòng của bạn" |
| Yêu cầu bị từ chối | Sale | YC9.2, YC9.3, YC5.3 | "Yêu cầu đặt phòng bị từ chối" · "Sapphire 1103 · 05/10 → 06/10" | S3-05 | Không |
| Yêu cầu hết hạn | Sale | YC9.4 | "Yêu cầu đặt phòng đã hết hạn" · "ICON40 1509 · 27/09 → 28/09" | S3-09 | Không |
| Chủ nhà ghi đặt phòng cho sale | Sale | YC5.4 | "Chị Hoa ghi đặt phòng cho bạn" · căn, ngày ở | Chi tiết đặt phòng phía sale (YC5.9) | "Chủ nhà ghi đặt phòng cho bạn" |
| Chủ nhà sửa đặt phòng của sale | Sale | YC5.6 | "Chị Hoa đã sửa đặt phòng của bạn" · ngày cũ đổi thành ngày mới, tiền phòng cũ đổi thành mới | Chi tiết đặt phòng phía sale (YC5.9) | Không |
| Căn đã gửi khách có người đặt | Sale | YC8.1 | "Sapphire 1103 · 10/10 → 12/10 vừa có người đặt" | S3 của căn đó (YC7.4) | "Căn bạn đã gửi khách vừa có người đặt" |
| Chủ nhà đã xóa tài khoản | Sale | YC1 | "Chị Hoa đã xóa tài khoản" · "Các căn của Chị Hoa không còn trong lịch. Đặt phòng đã chốt vẫn giữ." | S6-08 (YC10.1) | Không |
| Sale gửi yêu cầu đặt phòng | Chủ nhà | YC9.1 | "Sale Hùng đặt phòng 1509" · "10/10 → 12/10 (2 đêm) · giá của bạn 2.200.000đ" | CN9 (YC9.2) | "Sale đặt phòng mới" |
| Đặt phòng chưa cọc | Chủ nhà | YC12.3 | "Đặt phòng chưa cọc" · "Sale Lan · 17/10 → 19/10 · nhận phòng sau 3 ngày" | Chi tiết đặt phòng (YC5.5) | "Đặt phòng chưa cọc" |
| Xin hủy đặt phòng | Bên kia | YC5.8 | "Sale Hùng xin hủy đặt phòng" · "ICON40 1509 · 10/10 → 12/10" | Chi tiết đặt phòng | Không |
| Trả lời xin hủy | Bên xin | YC5.8 | "Chị Hoa đã đồng ý hủy" hay "Chị Hoa không đồng ý hủy" · căn, ngày ở | Chi tiết đặt phòng | Không |

Chữ ở cột "Dòng chính · dòng phụ" chưa có trên hình (xin hủy, trả lời xin hủy, ghi đặt phòng cho sale, đặt phòng chưa cọc, sale gửi yêu cầu ở P13): giả định GD27, Design đặt lại được. Báo sale khi chủ nhà thêm căn mới: [MỞ: YC3-H1]. Báo chủ nhà khi sale gửi link xin xem lịch: [MỞ: YC12-H2] (sale gửi link ngoài app, database chưa biết gì cho tới khi chủ nhà mở link). Báo chủ nhà khi sale hủy yêu cầu: [MỞ: YC9-H6].

## Ai được làm gì

Theo `docs/luat-chung/PQ.md`: PQ19. Test vi phạm phải có, ở lớp database:
- Sale Lan đọc hay đánh dấu đã đọc thông báo của Sale Hùng: không được; đánh dấu một lô có một mã không phải của mình thì không dòng nào đổi (YC12.2-NT5).
- Anh Tuấn không có thông báo nào về yêu cầu Hùng gửi cho Chị Hoa (YC12.2-NT5).
- Nội dung thông báo theo quy tắc Chép lúc ghi, theo quyền người nhận (YC12.1-NT6).
- Cài đặt thông báo: chỉ đọc, sửa của chính mình; loại không thuộc vai mình thì từ chối (YC12.4-NT3).

## Dữ liệu

Mô hình chung: `docs/Thiet_ke_DB.md`. YC này cần database bảo đảm:
- Thông báo: người nhận, loại, nội dung chép lúc ghi, đối tượng để mở (yêu cầu, đặt phòng, kết nối, căn), lúc tạo, lúc đọc. Không xóa thông báo.
- Mốc lần mở app của mỗi người; lệnh "mở app" trả thông báo mới và ghi mốc mới trong một lần.
- Danh sách thông báo của người gọi, mới trước, mỗi lần 50 dòng, kèm số chưa đọc.
- Đánh dấu đã đọc theo danh sách mã (1 đến 100) hay tất cả; gọi lại không đổi lúc đọc cũ.
- Cài đặt thông báo theo người, mặc định mọi loại bật.
- Việc nhắc chưa cọc chạy định kỳ, mỗi đặt phòng nhắc một lần.

## Trạng thái màn (mọi mục)

- Đang tải: HV1, chưa hiện popup. Mất mạng: HV2, không hiện popup. Quay lại từ nền: HV3, kiểm thông báo mới.

## YC12.1 · Popup thông báo mới

Bản 1 · rủi ro: tb · Màn: S1-06, S1-06-01

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Mở app hay quay lại app từ nền | Có thông báo mới thì popup nổi trên màn đang mở, không phủ toàn màn, phía sau có lớp tối. Không có thì không có popup | Lệnh mở app: trả thông báo mới, ghi mốc mới |
| 2 | Xem popup | Chuông, "3 thông báo mới", nút ✕ 44 px; mỗi dòng chấm màu, dòng chính, dòng phụ, giờ; mới trước | Như bước 1 |
| 3 | Chạm một dòng | Mở màn ở cột "Chạm mở"; dòng thành đã đọc | Đánh dấu đã đọc |
| 4 | Chạm ✕ hay lớp tối | Đóng popup, về màn đang mở. Thông báo vẫn ở P13 | Không |
| 5 | Bấm "Xem tất cả thông báo" | P13 | Không |

Popup của chủ nhà dùng cùng khuôn với S1-06 trên tab Lịch (chưa vẽ riêng). Chữ đầu popup trên hình là "Thông báo mới hôm nay": đổi thành "<n> thông báo mới".

Tiêu chí:
- **YC12.1-NT1** Khi Chị Hoa sửa B1 lúc 10:15 ngày 07/10 và Hùng mở app lúc 10:30, thì popup có dòng sửa B1, phía sau có lớp tối, popup không phủ toàn màn. · database, unit
- **YC12.1-NT2** Khi Hùng mở app lúc 21:00 ngày 06/10, Chị Hoa sửa B1 lúc 23:00, Hùng mở lại lúc 08:00 ngày 07/10, thì popup có dòng sửa B1 dù tạo hôm trước. · database
- **YC12.1-NT3** Khi không có thông báo nào tạo sau lần mở trước, thì mở app không có popup. · database, unit
- **YC12.1-NT4** Khi Hùng đã xem popup, rời app, Chị Hoa sửa B1, rồi Hùng quay lại từ nền, thì popup hiện lại với dòng sửa B1. · unit, database
- **YC12.1-NT5** Khi Hùng đóng popup, thì các thông báo đó vẫn ở P13; mở lại app mà không có gì mới thì không có popup. · unit, database
- **YC12.1-NT6** Khi Sale Lan bị từ chối vì Chị Hoa nhận yêu cầu của Hùng trùng đêm, thì thông báo của Lan không có tên Hùng, giá bán của Hùng, tên khách; thông báo "Sale đặt phòng mới" của Chị Hoa không có giá bán. · database
- **YC12.1-NT7** Khi Chị Hoa tự sửa đặt phòng khách lẻ của mình, thì không ai có thông báo. · database

## YC12.2 · Màn Thông báo

Bản 1 · rủi ro: thấp · Màn: P13, P13-00, P13-01, P13-02

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Vào Cá nhân > "Thông báo" (YC1), hay "Xem tất cả thông báo" ở popup | P13: "2 chưa đọc", nút "Đánh dấu đã đọc", nhóm "Hôm nay" và "Trước đó". Dòng chưa đọc nền xanh nhạt, chấm xanh, chữ đậm; dòng đã đọc nền trắng. Giờ: "10:15" trong ngày, "Hôm qua", "04/10" | Danh sách, số chưa đọc |
| 2 | Kéo xuống cuối | Tải thêm 50 dòng | Trang sau |
| 3 | Chạm một dòng | Mở màn ở cột "Chạm mở"; dòng thành đã đọc | Đánh dấu đã đọc |
| 4 | Bấm "Đánh dấu đã đọc" | Mọi dòng thành đã đọc, "0 chưa đọc" | Đánh dấu tất cả |
| 5 | Chưa có thông báo | P13-00: "Chưa có thông báo nào", "Khi chủ nhà đồng ý cho xem lịch hay có yêu cầu đặt phòng, thông báo hiện ở đây." | Không |

Đối tượng của thông báo không còn mở được (căn đã xóa, kết nối đã ngừng): mở màn theo HV5.

Tiêu chí:
- **YC12.2-NT1** Khi Hùng có 2 thông báo chưa đọc, thì nhãn ghi "2 chưa đọc" và đúng 2 dòng có nền chưa đọc. · database, unit
- **YC12.2-NT2** Khi Hùng chạm dòng "Yêu cầu đặt phòng bị từ chối" của Y4, thì app mở S3-05 của Y4 và dòng thành đã đọc. · unit, database
- **YC12.2-NT3** Khi Hùng bấm "Đánh dấu đã đọc", thì mọi dòng đã đọc; bấm lại thì lúc đọc cũ không đổi. · database
- **YC12.2-NT4** Khi Hùng chạm dòng "Anh Tuấn đã ngừng cho bạn xem lịch", thì app mở S7-03, không mở lịch của Anh Tuấn. · unit
- **YC12.2-NT5** Khi Sale Lan đọc thông báo, hay đánh dấu đã đọc một lô có một mã của Hùng, thì không thấy dòng nào của Hùng và không dòng nào đổi; Anh Tuấn không có thông báo về yêu cầu Hùng gửi Chị Hoa. · database
- **YC12.2-NT6** Khi chưa có thông báo, thì thấy P13-00. · unit

## YC12.3 · Nhắc đặt phòng chưa cọc

Bản 1 · rủi ro: tb · Màn: P13

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | (tự động) Đặt phòng chưa hủy, "Chưa cọc", còn 3 ngày tới ngày nhận (giờ Việt Nam) | Chủ nhà có thông báo "Đặt phòng chưa cọc" | Việc định kỳ ghi một thông báo cho chủ nhà; mỗi đặt phòng một lần |
| 2 | Chủ nhà đánh dấu đã cọc trước hạn đó | Không có thông báo | Không ghi |

Ghi lúc mấy giờ trong ngày: giả định GD28 (08:00 giờ Việt Nam). Đặt phòng tạo khi đã còn dưới 3 ngày tới ngày nhận thì có nhắc không: [MỞ: YC12-H3].

Tiêu chí:
- **YC12.3-NT1** Khi B2 (Sale Lan, 17/10 → 19/10) còn "Chưa cọc" ngày 14/10, thì Chị Hoa có đúng một thông báo "Đặt phòng chưa cọc" cho B2; việc chạy lại không ghi thêm. · database
- **YC12.3-NT2** Khi B2 đã cọc trước 14/10, hay Chị Hoa đã tắt loại này, thì không có thông báo. · database
- **YC12.3-NT3** Khi Sale Lan đọc thông báo, thì không có thông báo nhắc chưa cọc của B2. · database

## YC12.4 · Cài đặt thông báo

Bản 1 · rủi ro: thấp · Màn: P3, P12

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Cá nhân > "Cài đặt thông báo" (YC1) | "Thông báo hiện ngay trong app, ở mục Thông báo trên trang Cá nhân." Nhóm "BÁO CHO TÔI KHI", mỗi loại có công tắc của vai người dùng (cột "Công tắc"), kèm dòng giải thích | Cài đặt của người gọi |
| 2 | Chủ nhà (P3) | "Sale đặt phòng mới" ("Tên sale, căn và ngày ở"), "Sale xin xem lịch" ("Để bạn đồng ý hoặc từ chối", [MỞ: YC12-H2]), "Đặt phòng chưa cọc" ("Khi còn 3 ngày đến ngày nhận phòng") | Như bước 1 |
| 3 | Sale (P12) | "Chủ nhà đồng ý cho xem lịch" ("Căn mới vào Nguồn phòng"), "Căn bạn đã gửi khách vừa có người đặt" ("Để báo khách chọn căn khác"), "Chủ nhà xác nhận đặt phòng của bạn" ("Kèm ngày ở và tiền cọc"), "Chủ nhà ghi đặt phòng cho bạn" ("Khi chủ nhà ghi đặt phòng có bạn là người bán") | Như bước 1 |
| 4 | Bật, tắt rồi bấm "Lưu thay đổi" | Về Cá nhân | Ghi cài đặt |

Tắt một loại thì thông báo loại đó đã ghi trước còn ở P13 không: [MỞ: YC12-H4]; tới khi có câu trả lời, còn (giả định GD29). Một tài khoản dùng cả hai vai thấy cả hai nhóm công tắc (QD-005).

Tiêu chí:
- **YC12.4-NT1** Khi chủ nhà mở P3, thì thấy ba công tắc, mặc định bật, không có chữ "gửi qua Zalo"; sale mở P12 thì thấy bốn công tắc. · unit
- **YC12.4-NT2** Khi Hùng tắt "Căn bạn đã gửi khách vừa có người đặt" rồi có đặt phòng chiếm đêm căn Hùng đã gửi, thì Hùng không có thông báo đó; loại khác vẫn có. · database
- **YC12.4-NT3** Khi Sale Lan sửa cài đặt của Hùng, hay chủ nhà ghi công tắc của loại chỉ sale có, thì database từ chối. · database

## Màn hình

Xem hình: `python3 docs/thiet-ke/trich-man.py <mã>`. Chữ và số trên hình lệch YC thì YC đúng.

- **S1-06, S1-06-01 · Popup.** Chữ đầu "Thông báo mới hôm nay" đổi thành "<n> thông báo mới". Giờ trên hình "09:05" của dòng chấp nhận lệch DLM (15:05 ngày 06/10).
- **P13 · Thông báo.** Bỏ ghi chú dưới màn ("Chủ nhà thấy loại của mình: sale vừa được xem lịch, … yêu cầu bị từ chối vì trùng đêm"): loại của chủ nhà theo bảng Các loại thông báo.
- **P13-00, P13-01, P13-02.** Đúng bố cục.
- **P3, P12 · Cài đặt thông báo.** Đúng bố cục.

## Lịch sử bản

| Bản | Ngày | Mục đổi | Đổi gì |
|---|---|---|---|
| 1 | 18/11/2026 | Tất cả | Tạo từ story US30, phần thông báo của US17, US21 (QD-021) |
