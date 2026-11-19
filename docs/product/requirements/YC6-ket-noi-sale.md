---
id: YC6
tieu_de: Kết nối chủ nhà và sale
trang_thai: de-xuat
nguoi_chu: tung
rev: 9
ban: 2
---
# YC6 · Kết nối chủ nhà và sale

## Mục tiêu

Là chủ nhà, tôi muốn mời sale xem lịch bằng một link, chọn sale được xem những căn nào, thấy ai đã kết nối và ngừng cho xem khi cần. Là sale, tôi muốn xin chủ nhà cho xem lịch bằng một tin nhắn và biết ngay khi họ đồng ý. Để sale tự tra ngày trống và giá mà không phải gọi chủ nhà.

Vì sao quan trọng: kết nối là cổng của mọi quyền sale có với dữ liệu chủ nhà (QD7). Kết nối sai thì sale thấy lịch của chủ nhà không mời mình, hoặc chủ nhà ngừng rồi mà sale vẫn thấy. Kết nối đi qua tin nhắn Zalo và link, không có hộp thư trong app, vì cả hai bên đã quen nhắn Zalo cho nhau. Số điện thoại chỉ được xin lúc bắt đầu kết nối, vì đó là lúc người dùng hiểu vì sao cần (bên kia nhận ra mình).

## Luồng chính
`[r3 · sửa]`

Hôm nay là 07/10/2026. Anh Tuấn mở tab Sale, bấm "Chia sẻ link mời". Bảng chia sẻ của điện thoại mở với tin mời kèm link; anh chọn Zalo, gửi cho Sale Hùng.

Sale Hùng bấm link trong Zalo. Hùng đã có tài khoản nên app mở màn "Thêm lịch": "Anh Tuấn", "2 căn", ảnh và thông tin sơ lược của Sapphire 1103 và À La Carte 2208, không có giá. Hùng bấm "Thêm lịch của Anh Tuấn". App về lịch của sale, toast "Đã thêm lịch 2 căn của Anh Tuấn"; hai căn hiện trong lịch kèm giá từng đêm. Ở tab Sale của Anh Tuấn, Sale Hùng vào nhóm "Đã kết nối".

Chiều hôm đó Sale Lan xin Chị Hoa: Lan bấm "Gửi tin nhắn xin lịch đến chủ nhà", gửi tin kèm link qua Zalo. Chị Hoa bấm link, thấy "Sale Lan xin xem lịch phòng" với tên, số của Lan và công tắc "Tình trạng cọc", bấm "Đồng ý cho xem lịch". Trong vòng 60 giây, Lan thấy toast "Chị Hoa đã đồng ý cho bạn xem lịch".

## Phạm vi
`[r2 · sửa]`

YC này gồm: danh sách sale của chủ nhà (thêm tay, xem, ngừng cho xem), link mời của chủ nhà và sale thêm lịch, sale xin lịch và chủ nhà duyệt, chủ nhà gửi lịch theo căn đã chọn, phạm vi căn của kết nối, toast báo kết nối cho sale.

Không thuộc YC này (dễ tưởng là có):
- Cách đăng nhập và cách lấy tên, số điện thoại của tài khoản: YC1.2 (QD22).
- Lịch 7 ngày, tìm phòng, chi tiết căn của sale sau khi kết nối: YC7.
- Danh sách thông báo (P13), popup thông báo mới, công tắc từng loại: YC12.
- Chip sale đã kết nối trên form đặt phòng: YC5 (dùng danh sách ở đây).
- Sale thêm căn tự nhập và mời chủ căn tự nhập dùng app: YC10.
- Khi một bên xóa tài khoản: YC1 (việc xóa), PQ23 (bên kia còn thấy gì).

## Quy tắc của nhóm
`[r2 · sửa]`

| Tên | Quy tắc | Ví dụ |
|---|---|---|
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
- Link hết hạn, đã thu hồi, người tạo đã xóa tài khoản: màn báo theo HV5 [r6 · sửa] ("Link mời không còn dùng được." hoặc "Link mời đã hết hạn.", kèm "Nhờ chủ nhà gửi link mới.", YC6-H10 Claude tự chốt, chi tiết ở YC6.3).

## YC6.1 · Xin tên và số điện thoại khi bắt đầu kết nối
`[r2 · bỏ]` Theo QD22, tên và số xin ngay lúc đăng ký (YC1.2), nên mọi người đã vào app đều có số. Không còn popup xin số, không còn "Để sau".

## YC6.2 · Danh sách sale của chủ nhà
`[r3 · sửa]`

Bản 1 · rủi ro: cao · Màn: CN7, CN7-00, CN7-04, CN7-05

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Mở tab Sale | CN7: nút "Chia sẻ link mời", nút "Sao chép link", nhóm "Đã kết nối · 3" và "Chưa kết nối · 1". Mỗi dòng: tên, trạng thái, tổng tiền phòng các đặt phòng của sale với chủ nhà này | Đọc kết nối của chủ nhà, tên sale, tổng tiền phòng theo sale |
| 2 | Chưa có sale nào | CN7-00: "Chưa có sale nào xem lịch", hai nút gửi link, khung "Sale sẽ thấy: Phòng trống hay đã đặt; Giá từng đêm; Không thấy tên, số điện thoại khách và doanh thu" | Không |
| 3 | Muốn nhắc một sale chưa kết nối | [r5 · sửa] Không có nút "Nhắc lại" (YC6-H13, Claude tự chốt): chủ nhà bấm lại "Chia sẻ link mời" hoặc "Sao chép link" | Không |
| 4 | Bấm "Thêm sale" | CN7-05: ô "Tên sale *", "Số điện thoại *", nút "Lưu sale". Lưu xong: dòng mới ở nhóm "Chưa kết nối" | Ghi sale thêm tay của chủ nhà. [r5 · sửa] Không tự ghép với tài khoản có cùng số, không chặn số trùng; chỉ ghép khi sale nhận link mời (YC6-H11, Claude tự chốt) |
| 5 | Chạm một sale đã kết nối | CN7-04: tên, số điện thoại (nếu sale đã cho), ngày kết nối, nút "Gọi" (`tel:`), danh sách đặt phòng của sale với chủ nhà này (trạng thái, tiền phòng), công tắc "Tình trạng cọc", nút "Ngừng cho xem lịch" | Đọc kết nối, đặt phòng của sale với chủ nhà |
| 6 | Bấm "Ngừng cho xem lịch" | Hỏi "Xác nhận ngừng cho Sale Hùng xem? Đặt phòng cũ vẫn giữ. Sale không thấy lịch của bạn nữa." Đồng ý thì dòng rời nhóm "Đã kết nối" | Đổi trạng thái kết nối thành chủ ngừng; sale mất quyền xem; thông báo cho sale. Bấm lần hai không ghi lần hai |
| 7 | Một sale đã kết nối xóa tài khoản | Dòng giữ tên cũ kèm chữ đỏ nhỏ "Đã xoá tài khoản", không số, không nút "Gọi", không mở được; chủ nhà bỏ dòng này được. Đặt phòng đã nhận từ sale đó vẫn ở lịch, vẫn chặn trùng (QD13) | Không trả số của người đã xóa tài khoản |

[r5 · sửa] Các câu sau Claude tự chốt (QD25). Dòng đã ngừng nằm ở nhóm "Đã ngừng" cuối CN7; bản 1 không có nút "Cho xem lại", muốn cho xem lại thì gửi link mời, sale nhận link thì kết nối trở lại (YC6-H16). Sale đã xóa tài khoản không cần ngừng, dòng chỉ có "Bỏ dòng" (YC6-H1). Mở dòng chưa kết nối (thêm tay): tên, số chủ nhà đã nhập, nút "Gọi", nút "Xóa sale này" (hỏi lại một lần, xóa thì dòng biến mất); mở dòng đã ngừng: tên, số nếu sale đã cho, ngày ngừng, đặt phòng cũ, không xóa được; cả hai không có công tắc "Tình trạng cọc" và nút "Ngừng cho xem lịch" (YC6-H4, YC6-H16).

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
- **YC6.2-NT8** [r5 · thêm] Khi Chị Hoa mở dòng "Sale Phương" (thêm tay, chưa kết nối) và xác nhận "Xóa sale này", thì dòng biến mất; Anh Tuấn gửi lệnh xóa dòng đó thì database từ chối. · unit, database
- **YC6.2-NT9** [r5 · thêm] Khi Chị Hoa đã ngừng Sale Hùng, thì Hùng ở nhóm "Đã ngừng"; mở dòng thấy B1, B3, không có công tắc "Tình trạng cọc", không có nút "Ngừng cho xem lịch" và không xóa được. · unit, database

## YC6.3 · Link mời của chủ nhà và sale thêm lịch
`[r3 · sửa]`

Bản 2 · rủi ro: cao · Màn: CN7, A1-link, A1-link-01, A10, A10-01, A10-02

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Chủ nhà bấm "Chia sẻ link mời" hay "Sao chép link" | Mở bảng chia sẻ của điện thoại với tin mời kèm link (hoặc sao chép link), theo pwa.md mục P3 | Trả link mời đang dùng nếu còn hạn, không thì tạo mới; tăng số lần gửi |
| 2 | Người chưa đăng nhập bấm link | A1-link: như màn chào mừng (YC1), thêm thẻ "Anh Tuấn mời bạn xem lịch 2 căn", dòng "Bấm Bắt đầu ngay để xem lịch và giá mới nhất". Không có chữ "Đăng nhập" | Xem trước link không cần đăng nhập: tên chủ nhà, số căn, không giá |
| 3 | Bấm "Bắt đầu ngay" ở A1-link | Đăng ký hoặc đăng nhập (YC1.2), chọn vai sale, rồi sang thẳng A10, không qua màn chọn vai (QD8) | Hồ sơ mới vai sale |
| 4 | Người đã đăng nhập, chưa thêm lịch của chủ nhà này, bấm link | A10 "Thêm lịch": tên chủ nhà, số căn, ảnh và thông tin sơ lược từng căn, không giá. Nút dính đáy "Thêm lịch của Anh Tuấn" | Xem trước như bước 2 |
| 5 | Bấm "Thêm lịch của Anh Tuấn" | Sang lịch của sale, toast "Đã thêm lịch 2 căn của Anh Tuấn" (A10-02) | Kiểm lại link; tạo kết nối đã kết nối, phạm vi theo link (mời: tất cả căn; gửi lịch: các căn đã chọn), quyền mặc định |
| 6 | Rời A10 không bấm | Về màn trước | Không đổi gì |
| 7 | Đã thêm lịch của chủ nhà này, bấm link lần nữa | A10-01: "Bạn đã có lịch của Anh Tuấn", nút "Xem lịch" | Xem trước trả "đã thêm" |

[r6 · sửa] Các câu sau Claude tự chốt (QD25). Tài khoản vai chủ nhà mở link mời: A10 hiện xem trước, thay nút bằng "Link này dành cho sale. Tài khoản của bạn đang là chủ nhà." và nút "Về lịch của tôi"; database từ chối kết nối khi vai không đúng (YC6-H14). Người tạo link mở link của mình: xem trước kèm "Đây là link mời của bạn. Gửi link này cho sale để họ xem lịch.", không có nút thêm; database từ chối kết nối với chính mình (YC6-H15). Người tạo link đã xóa tài khoản: như link đã thu hồi (YC6-H5). Thu hồi: nút chữ "Đổi link mời" ở CN7 dưới hai nút gửi link, hỏi lại "Đổi link mời? Link cũ sẽ không dùng được nữa. Sale đã thêm lịch vẫn giữ." với "Đổi link" và "Không"; lần gửi sau tạo link mới (YC6-H10). Link hỏng mở ra A1-link-01: thu hồi hoặc người tạo đã xóa tài khoản "Link mời không còn dùng được.", quá 21 ngày "Link mời đã hết hạn.", cả hai kèm "Nhờ chủ nhà gửi link mới." (YC6-H10). Kết nối tạo trước khi thu hồi vẫn giữ (QD8, YC6-H3). Không có thông báo khi sale tự bấm "Thêm lịch" (YC6-H6).

Tiêu chí:
- **YC6.3-NT1** Khi người chưa đăng nhập mở link mời của Anh Tuấn rồi bấm "Bắt đầu ngay" và đăng nhập, thì app sang A10, không hiện màn chọn vai. · E2E
- **YC6.3-NT2** Khi xem trước link mời của chủ nhà có 2 căn (đã đăng nhập hay chưa), thì có tên chủ nhà, "2 căn" và ảnh từng căn, không có giá nào trong dữ liệu trả về. · database, unit
- **YC6.3-NT3** Khi sale rời A10 mà không bấm "Thêm lịch", thì sale không có kết nối với chủ nhà đó. · database
- **YC6.3-NT4** Khi Sale Hùng bấm "Thêm lịch của Anh Tuấn", thì Sapphire 1103 và À La Carte 2208 có trong lịch của Hùng và Hùng ở nhóm "Đã kết nối" của Anh Tuấn. · database, E2E
- **YC6.3-NT5** Khi Hùng đã thêm lịch mở lại link, thì thấy A10-01 và vẫn chỉ có một kết nối với Anh Tuấn. · database, unit
- **YC6.3-NT6** Khi link mời đã quá 21 ngày hay đã thu hồi, thì xem trước và "Thêm lịch" đều bị từ chối, không có kết nối mới. · database
- **YC6.3-NT7** Khi chủ nhà bấm "Chia sẻ link mời" hai lần trong hạn link, thì cả hai lần dùng cùng một link và số lần gửi là 2. · database
- **YC6.3-NT8** Khi một địa chỉ xem trước link quá 30 lần trong một phút, thì các lần sau bị từ chối. · database
- **YC6.3-NT9** [r6 · thêm] Khi Anh Tuấn bấm "Đổi link mời" và đồng ý, thì link cũ bị từ chối khi xem trước và khi thêm, Sale Hùng (đã thêm trước đó) vẫn ở nhóm "Đã kết nối", lần "Chia sẻ link mời" sau trả link khác. · database, unit
- **YC6.3-NT10** [r6 · thêm] Khi Anh Tuấn mở link mời của chính mình, hoặc Chị Hoa (vai chủ nhà) mở link đó, thì không có nút "Thêm lịch" và database từ chối tạo kết nối. · database, unit

## YC6.4 · Sale xin chủ nhà cho xem lịch
`[r3 · sửa]`

Bản 2 · rủi ro: tb · Màn: A5, A6, A7, A7-00, A7-01

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Sale bấm "Gửi tin nhắn xin lịch đến chủ nhà" (A5 hay A7) | A6: tin soạn sẵn ("Chào anh/chị, em là Hùng, sale phòng ở Hạ Long…"), link xin lịch của sale, ba bước "Sau khi gửi" | Trả link xin lịch của sale; tạo nếu chưa có (mỗi sale một link) |
| 2 | Bấm "Chia sẻ" | Mở bảng chia sẻ với tin và link | Tăng số lần gửi, ghi lần gửi cuối |
| 3 | Bấm "Sao chép tin nhắn" | Sao chép tin, toast "Đã sao chép" | Như bước 2 |
| 4 | Quay về app | A7: "Đang chờ chủ nhà đồng ý", lần gửi gần nhất, hai số "3 lần đã chia sẻ" và "0 chủ nhà đã đồng ý". Chưa gửi lần nào: A7-00 | Đọc số đếm của chính sale |
| 5 | Bấm "Gửi link cho chủ nhà khác" ở A7 | [r5 · sửa] Mở lại A6 (YC6-H13, Claude tự chốt) | Không |

[r7 · sửa] Sale thu hồi link xin lịch của mình: bản 1 không có (YC6-H2, Claude tự chốt). Link chỉ cho chủ nhà đồng ý chia sẻ lịch của chính họ; sale không muốn xem lịch của ai thì bỏ nguồn ở Nguồn phòng (YC10.2).

Tiêu chí:
- **YC6.4-NT1** Khi sale bấm "Gửi tin nhắn xin lịch đến chủ nhà", thì app mở A6 có tin soạn sẵn và link. · unit
- **YC6.4-NT2** Khi sale bấm "Chia sẻ" ở A6, thì bảng chia sẻ mở với tin và link, và số lần đã gửi tăng 1. · unit, database
- **YC6.4-NT3** Khi sale ở A7, thì chỉ thấy hai con số và không có danh sách tên chủ nhà. · unit
- **YC6.4-NT4** Khi một chủ nhà đồng ý lời xin, thì số "chủ nhà đã đồng ý" ở A7 tăng 1. · database
- **YC6.4-NT5** Khi Sale Lan đọc link hay số đếm của Sale Hùng, thì không được; link xin lịch không chứa chữ số nào của số điện thoại sale. · database

## YC6.5 · Chủ nhà duyệt lời xin xem lịch
`[r2 · sửa]`

Bản 2 · rủi ro: cao · Màn: A8, A8-01

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Chủ nhà bấm link xin lịch trong tin của sale | Chưa đăng nhập: đăng nhập (YC1) trước. Rồi A8: tên và số điện thoại sale (nếu sale đã cho), công tắc "Tình trạng cọc" (đã cọc hay chưa, không có số tiền, mặc định bật), dòng "Luôn thấy ngày đã có người đặt và giá từng đêm" không có công tắc (QD7), dòng "Không bao giờ thấy tên, số điện thoại khách và doanh thu", nút "Đồng ý cho xem lịch", "Từ chối" | Xem trước link xin lịch, cần đăng nhập |
| 2 | Bấm "Đồng ý cho xem lịch" | Về tab Sale, toast "Đã cho Sale Lan xem lịch". Chưa có căn thì về A4-01 (YC3) | Tạo kết nối đã kết nối, nguồn sale xin, phạm vi tất cả căn, quyền cọc theo công tắc; thông báo "chủ đồng ý kết nối" cho sale |
| 3 | Bấm "Từ chối" | Về tab Sale | [r8 · sửa] Không ghi gì, sale không được báo (YC6-H12, Claude tự chốt): số "chủ nhà đã đồng ý" ở A7 không tăng là đủ |
| 4 | Link không dùng được (sai, sale đã xóa tài khoản, chủ nhà đã ngừng sale này) | A8-01 theo HV5 | Từ chối, không trả tên, số nào |

[r8 · thêm] Các ca khác khi bấm "Đồng ý cho xem lịch" (YC6-H17, YC6-H18, Claude tự chốt):
- Đã kết nối với sale này rồi: không tạo kết nối mới, giữ phạm vi và quyền cọc cũ, vẫn về tab Sale với toast như bước 2.
- Sale đã bỏ nguồn của chủ nhà này (YC10.2) hay kết nối đang "chưa kết nối" (chủ nhà thêm tay ở CN7-05): chuyển thành đã kết nối với quyền cọc theo công tắc, phạm vi tất cả căn. Sale chủ động xin lại nên coi như đồng ý mới.
- Chủ nhà đã ngừng sale này: A8-01 (bước 4, NT4). Muốn cho xem lại thì dùng CN7-04.
- Mở link xin lịch của chính mình: A8-01, không tạo gì.
- Người mở chưa chọn vai: chọn sẵn vai chủ nhà rồi mới hiện A8. Đang ở vai sale: vẫn hiện A8; đồng ý xong thì chuyển sang vai chủ nhà.

Tiêu chí:
- **YC6.5-NT1** Khi Chị Hoa mở link xin lịch của Sale Lan, thì A8 có tên và số của Lan. · database, unit
- **YC6.5-NT2** Khi Chị Hoa tắt "Tình trạng cọc" rồi đồng ý, thì Lan không biết đặt phòng của mình đã cọc hay chưa, vẫn thấy lịch và giá từng đêm. · database
- **YC6.5-NT3** Khi Chị Hoa đồng ý, thì Lan ở nhóm "Đã kết nối" của Chị Hoa và có thông báo đồng ý. · database
- **YC6.5-NT4** Khi Chị Hoa đã ngừng Sale Lan mà mở lại link xin lịch của Lan, thì thấy A8-01 và không có kết nối mới. · database
- **YC6.5-NT5** Khi người chưa đăng nhập xem trước link xin lịch, thì bị từ chối, không có tên, số nào. · database
- **YC6.5-NT6** `[r8 · thêm]` Khi Chị Hoa đã kết nối với Sale Lan mà đồng ý lại qua link xin lịch, thì vẫn chỉ có một kết nối, phạm vi và quyền cọc giữ như cũ; khi Lan đã bỏ nguồn Chị Hoa rồi Chị Hoa đồng ý, thì kết nối trở lại đã kết nối. · database
- **YC6.5-NT7** `[r8 · thêm]` Khi Sale Lan mở link xin lịch của chính mình, thì thấy A8-01 và không có kết nối nào được tạo. · database

## YC6.6 · Chủ nhà gửi lịch theo căn đã chọn
`[r3 · sửa]`

Bản 2 · rủi ro: cao · Màn: CN10, CN10-00, CN10-01, CN10-02

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Bấm "Gửi lịch cho sale" ở tab Lịch | CN10: "Sale nhận link xem lịch trống/kín và giá của các căn đã chọn. Không thấy tên khách và tiền cọc" | Không |
| 2 | "Bước 1: Chọn căn" | Danh sách căn chưa xóa của mình, nút "Chọn tất cả". [r9 · sửa] Chưa chọn căn nào thì nút "Chia sẻ lịch" mờ, không bấm được, kèm dòng "Chọn ít nhất một căn" (YC6-H8, Claude tự chốt) | Đọc căn của mình |
| 3 | "Bước 2: Chọn sale để chia sẻ lịch" | Chọn sale chỉ để nhắc mình gửi cho ai; bảng chia sẻ không mở tin riêng cho từng sale, link dùng được cho bất kỳ sale nào mở (YC8-H5) | Không |
| 4 | Bấm "Chia sẻ lịch" | Mở bảng chia sẻ với tin và link | Tạo link gửi lịch với các căn đã chọn; tăng số lần gửi |
| 5 | Quay về app | CN10-02: tab Lịch, toast "Đã gửi lịch". Đóng bảng chia sẻ mà không gửi: CN10-01, không toast | Không |

Chưa có sale nào thì CN10-00.

[r9 · sửa] Các câu sau Claude tự chốt (QD25). Sale mở link gửi lịch thấy A10 như link mời (YC6.3), chỉ với các căn trong link còn chưa xóa. Link gửi lịch không bao giờ thu hẹp quyền đã có (YC6-H7): sale đã kết nối "tất cả căn" thì giữ nguyên, thấy A10-01; sale đã kết nối theo danh sách căn thì các căn trong link được thêm vào danh sách, không bớt căn cũ; sale đã bỏ nguồn hay chưa kết nối thì thành đã kết nối, phạm vi đúng các căn trong link, nguồn "gửi lịch"; chủ nhà đã ngừng sale đó thì từ chối như link mời. Mỗi lần "Chia sẻ lịch" tạo một link mới với các căn đã chọn, hết hạn sau 21 ngày; bản 1 không có nút thu hồi link gửi lịch, chủ nhà muốn bỏ một sale thì dùng "Ngừng cho xem lịch" ở CN7-04 (YC6-H9). Các luật link mời khác (vai sai, link của chính mình, người tạo đã xóa tài khoản, 30 lần một phút) áp như YC6.3.

Tiêu chí:
- **YC6.6-NT1** Khi Chị Hoa chọn 1509 rồi gửi, và một sale chưa kết nối (Sale Phương) bấm "Thêm lịch" từ link đó, thì Phương chỉ thấy 1509, không thấy 3402. · database
- **YC6.6-NT2** Khi kết nối của Sale Phương chỉ gồm 1509 và Chị Hoa thêm căn mới 2105, thì Phương vẫn chỉ thấy 1509 (QD8). · database
- **YC6.6-NT3** Khi về app sau khi gửi, thì thấy CN10-02 với toast "Đã gửi lịch" theo HV8. · unit
- **YC6.6-NT4** Khi Chị Hoa gửi lệnh tạo link gửi lịch có căn Sapphire 1103 của Anh Tuấn, hay căn đã xóa, hay khi Sale Hùng gửi lệnh tạo link gửi lịch, thì database từ chối và không có link mới. · database
- **YC6.6-NT5** `[r9 · thêm]` Khi Sale Phương đã kết nối chỉ với 1509 thêm lịch từ link gửi lịch có 3402, thì Phương thấy 1509 và 3402; khi Sale Hùng đã kết nối "tất cả căn" mở link đó, thì vẫn là "tất cả căn". · database
- **YC6.6-NT6** `[r9 · thêm]` Khi Chị Hoa chưa chọn căn nào ở CN10, thì nút "Chia sẻ lịch" không bấm được. · unit
- **YC6.6-NT7** `[r9 · thêm]` Khi người chưa đăng nhập xem trước link gửi lịch có 1509, thì chỉ thấy 1509, không thấy 3402 và không có giá. · database

## YC6.7 · Phạm vi "tất cả căn" và căn mới

Bản 1 · rủi ro: cao · Màn: lịch của sale (YC7)

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Chủ nhà thêm căn mới (YC3) | | Căn mới tự vào phạm vi của mọi sale có kết nối "tất cả căn" với chủ nhà đó, không ghi thêm gì |
| 2 | Sale mở lịch | Căn mới hiện trong lịch của sale | Đọc theo quyền sale được xem |

`[r4 · sửa]` Có báo cho sale khi có căn mới: có, theo YC12 (trả lời YC3-H1).

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
`[r3 · sửa]`

Xem hình: `python3 scripts/trich-man.py <mã>`. Chữ và số trên hình lệch YC thì YC đúng.

- **A6-P1, A8-P1, CN10-P1, A6-P2, A8-P2, CN10-P2 · Popup xin số và hộp thoại của Zalo.** Không dùng ở bản PWA: số đã có từ lúc đăng ký (QD22).
- **A6, A7, A7-00, A7-01.** Link trên hình dạng `zalo.me/s/…`: bản PWA là link https của app (pwa.md mục P4). Chữ số đếm theo canvas PWA: "3 lần đã chia sẻ".
- **CN7-03 · Tin Zalo có thẻ "Mở và trả lời".** Bản PWA là tin chữ kèm link.
- **A8, A8-01.** Đúng bố cục.
- **CN7, CN7-00, CN7-04, CN7-05.** Đúng bố cục. Nút "Nhắc lại" không làm (YC6-H13).
- **A1-link, A1-link-01, A10, A10-01, A10-02.** Hình A1-link còn chữ "Đăng nhập" và nút "Bắt đầu với Zalo": theo YC6.3 bước 2.
- **CN10, CN10-00, CN10-01, CN10-02.** Đúng bố cục (canvas bản PWA).
- **A9, A9-02.** Đúng bố cục.

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Tạo từ các story US5, US17, US26 và phần link mời của US6 (QD20, QD21), đổi cách gửi và link sang bản PWA | Cả file |
| r2 | 2026-11-19 | Claude | QD22-chot-dang-nhap | Theo QD22: bỏ YC6.1 và quy tắc xin số đúng lúc; bỏ bước "YC6.1 nếu chưa có số" ở YC6.3 đến YC6.6 | Phạm vi, Quy tắc của nhóm, YC6.1, YC6.3, YC6.4, YC6.5, YC6.6, Màn hình |
| r3 | 2026-11-19 | Claude | TKE-canvas-pwa-sua-yc | Khớp canvas bản PWA: nút "Gửi ... qua Zalo" thành "Chia sẻ ..." (YC8-H5); bỏ popup xin số còn sót ở Luồng chính | Luồng chính, YC6.2, YC6.3, YC6.4, YC6.6, Màn hình |
| r4 | 2026-11-19 | Claude | US15-them-can | Trả lời YC3-H1: có báo sale khi chủ nhà thêm căn (Claude tự quyết, QD25) | YC6.7 |
| r5 | 2026-11-19 | Claude | US36 chuẩn bị | Trả lời YC6-H13, H11, H16, H1, H4 (Claude tự chốt, QD25); thêm NT8, NT9 | YC6.2, YC6.4 |
| r6 | 2026-11-19 | Claude | US37 chuẩn bị | Trả lời YC6-H14, H15, H5, H10, H3, H6 (Claude tự chốt, QD25); thêm YC6.3-NT9, NT10 | YC6.3 |
| r7 | 2026-11-19 | Claude | US38 chuẩn bị | Trả lời YC6-H2: sale không thu hồi link xin lịch ở bản 1 (Claude tự chốt, QD25) | YC6.4 |
| r8 | 2026-11-19 | Claude | US39 chuẩn bị | Trả lời YC6-H12, H17, H18 (Claude tự chốt, QD25); thêm YC6.5-NT6, NT7 | YC6.5 |
| r9 | 2026-11-19 | Claude | US40 chuẩn bị | Trả lời YC6-H7, H8, H9 (Claude tự chốt, QD25); thêm YC6.6-NT5 đến NT7 | YC6.6 |
