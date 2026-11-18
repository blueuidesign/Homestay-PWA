---
id: YC6
tieu_de: Kết nối chủ nhà và sale
rev: 1
ban: 1
---
# YC6 · Kết nối chủ nhà và sale

## Mục tiêu

Là chủ nhà, tôi muốn mời sale xem lịch bằng một link, chọn sale được xem những căn nào, thấy ai đã kết nối và ngừng cho xem khi cần. Là sale, tôi muốn xin chủ nhà cho xem lịch bằng một tin nhắn và biết ngay khi họ đồng ý. Để sale tự tra ngày trống và giá mà không phải gọi chủ nhà.

Vì sao quan trọng: kết nối là cổng của mọi quyền sale có với dữ liệu chủ nhà (QD7). Kết nối sai thì sale thấy lịch của chủ nhà không mời mình, hoặc chủ nhà ngừng rồi mà sale vẫn thấy. Kết nối đi qua tin nhắn Zalo và link, không có hộp thư trong app, vì cả hai bên đã quen nhắn Zalo cho nhau. Số điện thoại chỉ được xin lúc bắt đầu kết nối, vì đó là lúc người dùng hiểu vì sao cần (bên kia nhận ra mình).

## Luồng chính

Hôm nay là 07/10/2026. Anh Tuấn mở tab Sale, bấm "Gửi link mời qua Zalo". Hồ sơ của anh chưa có số điện thoại nên popup "Chia sẻ số điện thoại với sale" hiện ra; anh bấm "Đồng ý, tiếp tục" và cho số. Bảng chia sẻ của điện thoại mở với tin mời kèm link; anh chọn Zalo, gửi cho Sale Hùng.

Sale Hùng bấm link trong Zalo. Hùng đã có tài khoản nên app mở màn "Thêm lịch": "Anh Tuấn", "2 căn", ảnh và thông tin sơ lược của Sapphire 1103 và À La Carte 2208, không có giá. Hùng bấm "Thêm lịch của Anh Tuấn". App về lịch của sale, toast "Đã thêm lịch 2 căn của Anh Tuấn"; hai căn hiện trong lịch kèm giá từng đêm. Ở tab Sale của Anh Tuấn, Sale Hùng vào nhóm "Đã kết nối".

Chiều hôm đó Sale Lan xin Chị Hoa: Lan bấm "Gửi tin nhắn xin lịch đến chủ nhà", gửi tin kèm link qua Zalo. Chị Hoa bấm link, thấy "Sale Lan xin xem lịch phòng" với tên, số của Lan và công tắc "Tình trạng cọc", bấm "Đồng ý cho xem lịch". Trong vòng 60 giây, Lan thấy toast "Chị Hoa đã đồng ý cho bạn xem lịch".

## Phạm vi

YC này gồm: xin tên và số điện thoại khi bắt đầu kết nối, danh sách sale của chủ nhà (thêm tay, xem, ngừng cho xem), link mời của chủ nhà và sale thêm lịch, sale xin lịch và chủ nhà duyệt, chủ nhà gửi lịch theo căn đã chọn, phạm vi căn của kết nối, toast báo kết nối cho sale.

Không thuộc YC này (dễ tưởng là có):
- Cách đăng nhập và cách lấy số điện thoại của tài khoản: YC1 ([MỞ: QD22]).
- Lịch 7 ngày, tìm phòng, chi tiết căn của sale sau khi kết nối: YC7.
- Danh sách thông báo (P13), popup thông báo mới, công tắc từng loại: YC12.
- Chip sale đã kết nối trên form đặt phòng: YC5 (dùng danh sách ở đây).
- Sale thêm căn tự nhập và mời chủ căn tự nhập dùng app: YC10.
- Khi một bên xóa tài khoản: YC1 (việc xóa), PQ23 (bên kia còn thấy gì).

## Quy tắc của nhóm

| Tên | Quy tắc | Ví dụ |
|---|---|---|
| Xin số điện thoại đúng lúc | Không xin tên, số lúc mở app hay lúc đăng nhập. Xin ở mọi việc bắt đầu chia sẻ, chấp thuận hay kết nối (danh sách ở YC6.1), khi hồ sơ chưa có số. Có popup giải thích trước, có nút "Để sau" và việc gốc vẫn làm tiếp | Không |
| Nhận ra nhau bằng số điện thoại | Chủ nhà và sale nhận ra nhau bằng tên và số điện thoại ở danh sách sale và nguồn phòng | Không |
| Xin lịch chỉ qua tin nhắn | Việc xin lịch đi qua tin nhắn (Zalo) kèm link; app không có hộp thư xin lịch | Không |
| Không biết gửi cho ai | App chỉ mở bảng chia sẻ của điện thoại nên không biết người nhận, không biết đã gửi thật chưa. App chỉ đếm số lần mở bảng chia sẻ hay sao chép, và số chủ nhà đã đồng ý | "3 lần đã gửi", "0 chủ nhà đã đồng ý" |
| Một link xin lịch nhiều chủ nhà | Mỗi sale có một link xin lịch dùng cho nhiều chủ nhà | Không |
| Sale tự thêm lịch | Mở link mời chưa làm gì với dữ liệu của sale. Lịch của chủ nhà chỉ vào dữ liệu của sale khi sale bấm "Thêm lịch" (QD8) | Không |
| Link mời | Link mời hết hạn sau 21 ngày, thu hồi được. Ai có link cũng xem trước được trước khi đăng nhập, không thấy giá (QD8). Mã link ngẫu nhiên, không chứa số điện thoại, mã người dùng hay giá | Không |
| Phạm vi căn | Kết nối "tất cả căn" thì căn mới của chủ nhà tự vào phạm vi. Kết nối "chỉ vài căn" (từ link gửi lịch) chỉ gồm các căn đã chọn | 6 căn thành 7 căn; 2 căn vẫn 2 căn |
| Nhóm kết nối | Sale ở nhóm "Đã kết nối" khi đã bấm "Thêm lịch" hay khi chủ nhà đồng ý lời xin. Sale chủ nhà thêm tay ở nhóm "Chưa kết nối" | "Chưa kết nối · 1" |
| Ngừng cho xem | Ngừng thì sale mất quyền xem lịch, căn, giá của chủ nhà đó; đặt phòng cũ vẫn giữ, sale vẫn xem lại được đặt phòng của mình; sale được báo (QD7) | Không |
| Gom thông báo kết nối | Nhiều chủ nhà đồng ý trong 10 phút thì gom một toast và một dòng thông báo (giả định GD15) | "3 chủ nhà … 7 căn mới" |

Quy tắc dùng chung: Quyền sale được xem (QD7, PQ17); cách chia sẻ, link, gọi, nhắn trên PWA ở `docs/external/pwa.md` mục P3, P4, P5.

## Ai được làm gì

Theo `docs/security/PQ-ma-tran-quyen.md`: PQ1, PQ2 (hồ sơ, số điện thoại), PQ4.LINK, PQ17 (kết nối và quyền xem), PQ18 (link), PQ23. Test vi phạm phải có, ở lớp database:
- Sale đã bị ngừng, sale chưa kết nối đọc lịch, căn, giá của chủ nhà: không thấy; sale bị ngừng vẫn đọc được đặt phòng cũ của mình (YC6.2-NT4).
- Chủ nhà A ngừng, đổi quyền sale của chủ nhà B; sale B đọc link, số đếm của sale A (YC6.2-NT6, YC6.4-NT5).
- Người xem trước link mời chưa đăng nhập không nhận được giá (YC6.3-NT2). Link xin lịch không xem được khi chưa đăng nhập (YC6.5-NT5).
- Số điện thoại sale chỉ trả cho chủ nhà khi sale đã cho (YC6.5-NT1).
- Link gửi lịch chỉ tạo được với căn chưa xóa của chính người gọi (YC6.6-NT4).

## Dữ liệu

Mô hình chung: `docs/architecture/thiet-ke-db.md`. YC này cần database bảo đảm:
- Kết nối giữa một chủ nhà và một sale: trạng thái (chưa kết nối, đã kết nối, chủ ngừng, sale bỏ), nguồn (link mời, sale xin, gửi lịch, thêm tay), phạm vi (tất cả căn hay danh sách căn), quyền xem tình trạng cọc. Mỗi cặp chủ nhà và sale tối đa một kết nối (ràng buộc duy nhất), nên bấm hai lần không tạo hai dòng.
- Quyền của sale với dữ liệu chủ nhà chỉ tính qua kết nối "đã kết nối" và phạm vi của nó (một hàm dùng chung, mọi policy và lệnh đọc của sale gọi nó).
- Link: loại (mời sale, gửi lịch, xin lịch), người tạo, hạn (21 ngày với link mời và gửi lịch), lúc thu hồi, danh sách căn (link gửi lịch), số lần gửi, lần gửi cuối. Mã link là chuỗi ngẫu nhiên đủ dài để không đoán được.
- Xem trước link: không cần đăng nhập với link mời và gửi lịch, trả tên chủ nhà, số căn, ảnh và thông tin sơ lược căn, không giá; giới hạn 30 lần một phút mỗi địa chỉ. Link xin lịch cần đăng nhập.
- Ngừng cho xem, đồng ý kết nối: database ghi thông báo cho sale (YC12).
- Sale chủ nhà thêm tay: tên, số điện thoại do chủ nhà gõ, chỉ chủ nhà đó đọc.

## Trạng thái màn (mọi mục)

- Đang tải: HV1. Mất mạng: HV2. Quay lại từ bảng chia sẻ hay từ nền: HV3, đọc lại số đếm và danh sách. Mất quyền giữa chừng: HV5. Toast: HV8.
- Link hết hạn, đã thu hồi, người tạo đã xóa tài khoản: màn báo theo HV5 ("Link mời không còn dùng được" hoặc "Link mời đã hết hạn", [MỞ: YC6-H10]).

## YC6.1 · Xin tên và số điện thoại khi bắt đầu kết nối

Bản 1 · rủi ro: cao · Màn: A6-P1, A8-P1, CN10-P1 (các màn khác dùng cùng popup, chưa vẽ)

Khi nào: hồ sơ chưa có số điện thoại và người dùng bấm một trong các nút:
- Bắt đầu chia sẻ: "Gửi qua Zalo" hay "Sao chép tin nhắn" ở A6; "Gửi link mời qua Zalo", "Sao chép link" ở CN7, CN7-00; "Gửi lịch qua Zalo" ở CN10; mời chủ căn tự nhập dùng app (YC10).
- Chấp thuận: "Đồng ý cho xem lịch" ở A8; "Thêm lịch" ở A10; "Chấp nhận đặt phòng" (YC9).
- Gửi cho người khác: "Gửi yêu cầu đặt phòng" (YC9); "Gửi cho khách" (YC8).

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Bấm một nút ở trên | Popup dưới đáy: biểu tượng điện thoại, tiêu đề "Chia sẻ số điện thoại với chủ nhà" (sale) hoặc "Chia sẻ số điện thoại với sale" (chủ nhà), một đoạn lý do, hai nút "Đồng ý, tiếp tục" và "Để sau" | Không |
| 2 | Bấm "Đồng ý, tiếp tục" | Lấy tên và số theo cách của YC1 ([MỞ: QD22]), rồi làm tiếp việc gốc. Lần sau không hỏi lại | Ghi tên, số vào hồ sơ của người gọi sau khi kiểm (YC1) |
| 3 | Bấm "Để sau" | Làm tiếp việc gốc mà không có số; dòng ghi chú "Bên kia chỉ thấy tên của bạn" | Hồ sơ vẫn chưa có số |

Đăng nhập bằng số điện thoại (nếu QD22 chọn vậy) thì hồ sơ luôn có số và popup không bao giờ hiện.

Tiêu chí:
- **YC6.1-NT1** Khi hồ sơ chưa có số và người dùng bấm một nút ở danh sách trên, thì popup giải thích hiện trước khi xin số. · unit
- **YC6.1-NT2** Khi hồ sơ đã có số, thì popup không hiện và việc gốc chạy tiếp. · unit
- **YC6.1-NT3** Khi người dùng bấm "Để sau", thì việc gốc vẫn hoàn tất và hồ sơ vẫn chưa có số. · unit, E2E
- **YC6.1-NT4** Khi chủ nhà bấm "Để sau" ở A8-P1, thì kết nối vẫn được tạo và app về tab Sale của chủ nhà kèm toast, không mở màn của sale. · unit
- **YC6.1-NT5** Khi người dùng đã cho số một lần, thì các lần sau popup không hiện. · unit

## YC6.2 · Danh sách sale của chủ nhà

Bản 1 · rủi ro: cao · Màn: CN7, CN7-00, CN7-04, CN7-05

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Mở tab Sale | CN7: nút "Gửi link mời qua Zalo", nút "Sao chép link", nhóm "Đã kết nối · 3" và "Chưa kết nối · 1". Mỗi dòng: tên, trạng thái, tổng tiền phòng các đặt phòng của sale với chủ nhà này | Đọc kết nối của chủ nhà, tên sale, tổng tiền phòng theo sale |
| 2 | Chưa có sale nào | CN7-00: "Chưa có sale nào xem lịch", hai nút gửi link, khung "Sale sẽ thấy: Phòng trống hay đã đặt; Giá từng đêm; Không thấy tên, số điện thoại khách và doanh thu" | Không |
| 3 | Bấm "Nhắc lại" ở một sale chưa kết nối | [MỞ: YC6-H13]. Bản đầu không có nút này | Không |
| 4 | Bấm "Thêm sale" | CN7-05: ô "Tên sale *", "Số điện thoại *", nút "Lưu sale". Lưu xong: dòng mới ở nhóm "Chưa kết nối" | Ghi sale thêm tay của chủ nhà. Ghép với tài khoản thật của sale: [MỞ: YC6-H11]; tới khi có câu trả lời, không ghép, không chặn số trùng |
| 5 | Chạm một sale đã kết nối | CN7-04: tên, số điện thoại (nếu sale đã cho), ngày kết nối, nút "Gọi" (`tel:`), danh sách đặt phòng của sale với chủ nhà này (trạng thái, tiền phòng), công tắc "Tình trạng cọc", nút "Ngừng cho xem lịch" | Đọc kết nối, đặt phòng của sale với chủ nhà |
| 6 | Bấm "Ngừng cho xem lịch" | Hỏi "Xác nhận ngừng cho Sale Hùng xem? Đặt phòng cũ vẫn giữ. Sale không thấy lịch của bạn nữa." Đồng ý thì dòng rời nhóm "Đã kết nối" | Đổi trạng thái kết nối thành chủ ngừng; sale mất quyền xem; thông báo cho sale. Bấm lần hai không ghi lần hai |
| 7 | Một sale đã kết nối xóa tài khoản | Dòng giữ tên cũ kèm chữ đỏ nhỏ "Đã xoá tài khoản", không số, không nút "Gọi", không mở được; chủ nhà bỏ dòng này được. Đặt phòng đã nhận từ sale đó vẫn ở lịch, vẫn chặn trùng (QD13) | Không trả số của người đã xóa tài khoản |

Chủ nhà cho xem lại sale đã ngừng được không: [MỞ: YC6-H16]. Ngừng sale đã xóa tài khoản: [MỞ: YC6-H1]. Chủ nhà mở dòng chưa kết nối, đã ngừng thì thấy gì: [MỞ: YC6-H4]; tới khi có câu trả lời, mở được với những gì có.

Luật kiểm (thêm sale tay):

| Ô | Bắt buộc | Luật | Câu lỗi khi sai |
|---|---|---|---|
| Tên sale | có | 1 đến 100 ký tự sau khi bỏ khoảng trắng đầu cuối | "Cần nhập tên sale" · "Tên dài tối đa 100 ký tự" |
| Số điện thoại | có | 10 chữ số, bắt đầu bằng 0, sau khi bỏ khoảng trắng, dấu chấm, gạch | "Số điện thoại chưa đúng (10 chữ số, bắt đầu bằng 0)" |

Tiêu chí:
- **YC6.2-NT1** Khi Chị Hoa mở tab Sale, thì Sale Hùng, Lan, Nga, Minh ở nhóm "Đã kết nối · 4". · unit, database
- **YC6.2-NT2** Khi chủ nhà chưa có sale nào, thì thấy CN7-00. · unit
- **YC6.2-NT3** Khi chủ nhà thêm sale "Sale Phương" số 0901234567 ở CN7-05, thì dòng đó ở nhóm "Chưa kết nối"; số "090 123" bị từ chối với câu ở bảng trên. · unit, database
- **YC6.2-NT4** Khi Chị Hoa xác nhận ngừng cho Sale Hùng xem, thì Hùng không còn đọc được lịch, căn, giá của Chị Hoa, vẫn đọc được B1 và B3, và có thông báo bị ngừng. · database
- **YC6.2-NT5** Khi Chị Hoa tắt "Tình trạng cọc" của Sale Hùng, thì Hùng đọc B1 không còn biết đã cọc hay chưa, vẫn thấy lịch và giá từng đêm (QD7). · database
- **YC6.2-NT6** Khi Anh Tuấn gửi lệnh ngừng hay đổi quyền kết nối giữa Chị Hoa và Sale Hùng, thì database từ chối và kết nối không đổi. · database
- **YC6.2-NT7** Khi Sale Hùng đã xóa tài khoản, thì dòng của Hùng ở CN7 ghi "Đã xoá tài khoản", không có số và nút "Gọi"; B1 vẫn ở lịch của Chị Hoa. · unit, database

## YC6.3 · Link mời của chủ nhà và sale thêm lịch

Bản 1 · rủi ro: cao · Màn: CN7, A1-link, A1-link-01, A10, A10-01, A10-02

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Chủ nhà bấm "Gửi link mời qua Zalo" hay "Sao chép link" | YC6.1 nếu chưa có số; rồi mở bảng chia sẻ của điện thoại với tin mời kèm link (hoặc sao chép link), theo pwa.md mục P3 | Trả link mời đang dùng nếu còn hạn, không thì tạo mới; tăng số lần gửi |
| 2 | Người chưa đăng nhập bấm link | A1-link: như màn chào mừng (YC1), thêm thẻ "Anh Tuấn mời bạn xem lịch 2 căn", dòng "Bấm Bắt đầu ngay để xem lịch và giá mới nhất". Không có chữ "Đăng nhập" | Xem trước link không cần đăng nhập: tên chủ nhà, số căn, không giá |
| 3 | Bấm "Bắt đầu ngay" ở A1-link | Đăng nhập (YC1), chọn vai sale, rồi sang thẳng A10, không qua màn chọn vai (QD8) | Hồ sơ mới vai sale |
| 4 | Người đã đăng nhập, chưa thêm lịch của chủ nhà này, bấm link | A10 "Thêm lịch": tên chủ nhà, số căn, ảnh và thông tin sơ lược từng căn, không giá. Nút dính đáy "Thêm lịch của Anh Tuấn" | Xem trước như bước 2 |
| 5 | Bấm "Thêm lịch của Anh Tuấn" | YC6.1 nếu chưa có số; rồi sang lịch của sale, toast "Đã thêm lịch 2 căn của Anh Tuấn" (A10-02) | Kiểm lại link; tạo kết nối đã kết nối, phạm vi theo link (mời: tất cả căn; gửi lịch: các căn đã chọn), quyền mặc định |
| 6 | Rời A10 không bấm | Về màn trước | Không đổi gì |
| 7 | Đã thêm lịch của chủ nhà này, bấm link lần nữa | A10-01: "Bạn đã có lịch của Anh Tuấn", nút "Xem lịch" | Xem trước trả "đã thêm" |

Tài khoản đã chọn vai chủ nhà mở link mời: [MỞ: YC6-H14]. Người tạo link tự mở link của mình: [MỞ: YC6-H15]. Người tạo link đã xóa tài khoản: [MỞ: YC6-H5]; tới khi có câu trả lời, coi như link không dùng được. Chủ nhà thu hồi link ở đâu, kết nối đã tạo từ link đã thu hồi còn không: [MỞ: YC6-H10], [MỞ: YC6-H3]. Có thông báo khi sale tự bấm "Thêm lịch" không (cho sale, cho chủ nhà): [MỞ: YC6-H6]; tới khi có câu trả lời, không.

Tiêu chí:
- **YC6.3-NT1** Khi người chưa đăng nhập mở link mời của Anh Tuấn rồi bấm "Bắt đầu ngay" và đăng nhập, thì app sang A10, không hiện màn chọn vai. · E2E
- **YC6.3-NT2** Khi xem trước link mời của chủ nhà có 2 căn (đã đăng nhập hay chưa), thì có tên chủ nhà, "2 căn" và ảnh từng căn, không có giá nào trong dữ liệu trả về. · database, unit
- **YC6.3-NT3** Khi sale rời A10 mà không bấm "Thêm lịch", thì sale không có kết nối với chủ nhà đó. · database
- **YC6.3-NT4** Khi Sale Hùng bấm "Thêm lịch của Anh Tuấn", thì Sapphire 1103 và À La Carte 2208 có trong lịch của Hùng và Hùng ở nhóm "Đã kết nối" của Anh Tuấn. · database, E2E
- **YC6.3-NT5** Khi Hùng đã thêm lịch mở lại link, thì thấy A10-01 và vẫn chỉ có một kết nối với Anh Tuấn. · database, unit
- **YC6.3-NT6** Khi link mời đã quá 21 ngày hay đã thu hồi, thì xem trước và "Thêm lịch" đều bị từ chối, không có kết nối mới. · database
- **YC6.3-NT7** Khi chủ nhà bấm "Gửi link mời qua Zalo" hai lần trong hạn link, thì cả hai lần dùng cùng một link và số lần gửi là 2. · database
- **YC6.3-NT8** Khi một địa chỉ xem trước link quá 30 lần trong một phút, thì các lần sau bị từ chối. · database

## YC6.4 · Sale xin chủ nhà cho xem lịch

Bản 1 · rủi ro: tb · Màn: A5, A6, A7, A7-00, A7-01

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Sale bấm "Gửi tin nhắn xin lịch đến chủ nhà" (A5 hay A7) | A6: tin soạn sẵn ("Chào anh/chị, em là Hùng, sale phòng ở Hạ Long…"), link xin lịch của sale, ba bước "Sau khi gửi" | Trả link xin lịch của sale; tạo nếu chưa có (mỗi sale một link) |
| 2 | Bấm "Gửi qua Zalo" | YC6.1 nếu chưa có số; rồi mở bảng chia sẻ với tin và link | Tăng số lần gửi, ghi lần gửi cuối |
| 3 | Bấm "Sao chép tin nhắn" | YC6.1 nếu chưa có số; sao chép tin, toast "Đã sao chép" | Như bước 2 |
| 4 | Quay về app | A7: "Đang chờ chủ nhà đồng ý", lần gửi gần nhất, hai số "3 lần đã gửi" và "0 chủ nhà đã đồng ý". Chưa gửi lần nào: A7-00 | Đọc số đếm của chính sale |
| 5 | Bấm "Gửi link cho chủ nhà khác" ở A7 | [MỞ: YC6-H13]. Tới khi có câu trả lời, mở lại A6 | Không |

Chữ trên nút ("Gửi qua Zalo" hay "Gửi"): [MỞ: YC8-H5]. Sale thu hồi link xin lịch của mình: [MỞ: YC6-H2]; bản đầu không có.

Tiêu chí:
- **YC6.4-NT1** Khi sale bấm "Gửi tin nhắn xin lịch đến chủ nhà", thì app mở A6 có tin soạn sẵn và link. · unit
- **YC6.4-NT2** Khi sale bấm "Gửi qua Zalo" ở A6, thì bảng chia sẻ mở với tin và link, và số lần đã gửi tăng 1. · unit, database
- **YC6.4-NT3** Khi sale ở A7, thì chỉ thấy hai con số và không có danh sách tên chủ nhà. · unit
- **YC6.4-NT4** Khi một chủ nhà đồng ý lời xin, thì số "chủ nhà đã đồng ý" ở A7 tăng 1. · database
- **YC6.4-NT5** Khi Sale Lan đọc link hay số đếm của Sale Hùng, thì không được; link xin lịch không chứa chữ số nào của số điện thoại sale. · database

## YC6.5 · Chủ nhà duyệt lời xin xem lịch

Bản 1 · rủi ro: cao · Màn: A8, A8-P1, A8-01

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Chủ nhà bấm link xin lịch trong tin của sale | Chưa đăng nhập: đăng nhập (YC1) trước. Rồi A8: tên và số điện thoại sale (nếu sale đã cho), công tắc "Tình trạng cọc" (đã cọc hay chưa, không có số tiền, mặc định bật), dòng "Luôn thấy ngày đã có người đặt và giá từng đêm" không có công tắc (QD7), dòng "Không bao giờ thấy tên, số điện thoại khách và doanh thu", nút "Đồng ý cho xem lịch", "Từ chối" | Xem trước link xin lịch, cần đăng nhập |
| 2 | Bấm "Đồng ý cho xem lịch" | YC6.1 nếu chưa có số; về tab Sale, toast "Đã cho Sale Lan xem lịch". Chưa có căn thì về A4-01 (YC3) | Tạo kết nối đã kết nối, nguồn sale xin, phạm vi tất cả căn, quyền cọc theo công tắc; thông báo "chủ đồng ý kết nối" cho sale |
| 3 | Bấm "Từ chối" | Về tab Sale | Không ghi gì. Sale có được báo không: [MỞ: YC6-H12] |
| 4 | Link không dùng được (sai, sale đã xóa tài khoản, chủ nhà đã ngừng sale này) | A8-01 theo HV5 | Từ chối, không trả tên, số nào |

Tiêu chí:
- **YC6.5-NT1** Khi Chị Hoa mở link xin lịch của Sale Lan, thì A8 có tên và số của Lan nếu Lan đã cho số; Lan đã bấm "Để sau" thì không có số. · database, unit
- **YC6.5-NT2** Khi Chị Hoa tắt "Tình trạng cọc" rồi đồng ý, thì Lan không biết đặt phòng của mình đã cọc hay chưa, vẫn thấy lịch và giá từng đêm. · database
- **YC6.5-NT3** Khi Chị Hoa đồng ý, thì Lan ở nhóm "Đã kết nối" của Chị Hoa và có thông báo đồng ý. · database
- **YC6.5-NT4** Khi Chị Hoa đã ngừng Sale Lan mà mở lại link xin lịch của Lan, thì thấy A8-01 và không có kết nối mới. · database
- **YC6.5-NT5** Khi người chưa đăng nhập xem trước link xin lịch, thì bị từ chối, không có tên, số nào. · database

## YC6.6 · Chủ nhà gửi lịch theo căn đã chọn

Bản 1 · rủi ro: cao · Màn: CN10, CN10-P1, CN10-00, CN10-01, CN10-02

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Bấm "Gửi lịch cho sale" ở tab Lịch | CN10: "Sale nhận link xem lịch trống/kín và giá của các căn đã chọn. Không thấy tên khách và tiền cọc" | Không |
| 2 | "Bước 1: Chọn căn" | Danh sách căn chưa xóa của mình, nút "Chọn tất cả". Chưa chọn căn nào thì nút gửi không bấm được ([MỞ: YC6-H8]) | Đọc căn của mình |
| 3 | "Bước 2: Chọn sale để chia sẻ lịch" | Bản PWA không mở được tin riêng cho từng sale ([MỞ: YC8-H5]). Tới khi có câu trả lời, bước này không có; link dùng cho bất kỳ sale nào mở | Không |
| 4 | Bấm "Gửi lịch qua Zalo" | YC6.1 nếu chưa có số; mở bảng chia sẻ với tin và link | Tạo link gửi lịch với các căn đã chọn; tăng số lần gửi |
| 5 | Quay về app | CN10-02: tab Lịch, toast "Đã gửi lịch". Đóng bảng chia sẻ mà không gửi: CN10-01, không toast | Không |

Chưa có sale nào thì CN10-00. Sale đã kết nối nhận thêm link gửi lịch thì phạm vi có đổi không: [MỞ: YC6-H7]; tới khi có câu trả lời, giữ phạm vi cũ. Thu hồi link gửi lịch: [MỞ: YC6-H9].

Tiêu chí:
- **YC6.6-NT1** Khi Chị Hoa chọn 1509 rồi gửi, và một sale chưa kết nối (Sale Phương) bấm "Thêm lịch" từ link đó, thì Phương chỉ thấy 1509, không thấy 3402. · database
- **YC6.6-NT2** Khi kết nối của Sale Phương chỉ gồm 1509 và Chị Hoa thêm căn mới 2105, thì Phương vẫn chỉ thấy 1509 (QD8). · database
- **YC6.6-NT3** Khi về app sau khi gửi, thì thấy CN10-02 với toast "Đã gửi lịch" theo HV8. · unit
- **YC6.6-NT4** Khi Chị Hoa gửi lệnh tạo link gửi lịch có căn Sapphire 1103 của Anh Tuấn, hay căn đã xóa, hay khi Sale Hùng gửi lệnh tạo link gửi lịch, thì database từ chối và không có link mới. · database

## YC6.7 · Phạm vi "tất cả căn" và căn mới

Bản 1 · rủi ro: cao · Màn: lịch của sale (YC7)

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Chủ nhà thêm căn mới (YC3) | | Căn mới tự vào phạm vi của mọi sale có kết nối "tất cả căn" với chủ nhà đó, không ghi thêm gì |
| 2 | Sale mở lịch | Căn mới hiện trong lịch của sale | Đọc theo quyền sale được xem |

Có báo cho sale khi có căn mới không: [MỞ: YC3-H1].

Tiêu chí:
- **YC6.7-NT1** Khi Sale Hùng có kết nối "tất cả căn" với Chị Hoa và Chị Hoa thêm căn 2105, thì Hùng thấy 2105 trong lịch mà không mở lại link. · database

## YC6.8 · Toast báo kết nối cho sale

Bản 1 · rủi ro: thấp · Màn: A9, A9-02

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Sale đang mở app khi một chủ nhà đồng ý | Toast đầu màn: "Chị Hoa đã đồng ý cho bạn xem lịch / ICON40 1509 và 3402 đã vào Nguồn phòng", nút "Xem" (A9). Hiện chậm nhất 60 giây sau khi chủ nhà đồng ý (pwa.md mục P7) | Thông báo "chủ đồng ý kết nối" |
| 2 | Nhiều chủ nhà đồng ý gần nhau | Một toast: "3 chủ nhà đã đồng ý cho bạn xem lịch / Chị Hoa, Anh Tuấn và Chú Bình · 7 căn mới trong Nguồn phòng" (A9-02) | Gom các lần đồng ý trong 10 phút thành một thông báo (GD15) |
| 3 | Bấm "Xem" | Mở danh sách nguồn phòng (YC10) | Không |

Sale không mở app lúc chủ nhà đồng ý: thấy ở popup thông báo mới khi mở app (YC12).

Tiêu chí:
- **YC6.8-NT1** Khi Chị Hoa đồng ý lúc Sale Lan đang mở app, thì trong 60 giây Lan thấy toast có tên Chị Hoa và các căn mới. · unit
- **YC6.8-NT2** Khi ba chủ nhà đồng ý trong 10 phút, thì Lan thấy một toast và có một thông báo gom. · database, unit

## Màn hình

Xem hình: `python3 scripts/trich-man.py <mã>`. Chữ và số trên hình lệch YC thì YC đúng.

- **A6-P2, A8-P2, CN10-P2 · Hộp thoại quyền của Zalo.** Không dùng ở bản PWA (cách lấy số theo QD22).
- **A6, A7, A7-00, A7-01.** Link trên hình dạng `zalo.me/s/…`: bản PWA là link https của app (pwa.md mục P4). Chữ "3 lần đã gửi qua Zalo": bản PWA ghi "3 lần đã gửi".
- **CN7-03 · Tin Zalo có thẻ "Mở và trả lời".** Bản PWA là tin chữ kèm link.
- **A8, A8-P1, A8-01.** Đúng bố cục.
- **CN7, CN7-00, CN7-04, CN7-05.** Đúng bố cục. Nút "Nhắc lại" không làm (YC6-H13).
- **A1-link, A1-link-01, A10, A10-01, A10-02.** Hình A1-link còn chữ "Đăng nhập" và nút "Bắt đầu với Zalo": theo YC6.3 bước 2.
- **CN10, CN10-00, CN10-01, CN10-02.** Bước chọn sale theo YC8-H5.
- **A9, A9-02.** Đúng bố cục.

## Lịch sử bản

| Bản | Ngày | Mục đổi | Đổi gì |
|---|---|---|---|
| 1 | 18/11/2026 | Tất cả | Tạo từ các story US5, US17, US26 và phần link mời của US6 (QD20, QD21), đổi cách gửi và link sang bản PWA |
