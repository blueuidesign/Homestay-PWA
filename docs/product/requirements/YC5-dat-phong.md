---
id: YC5
tieu_de: Đặt phòng
trang_thai: de-xuat
nguoi_chu: tung
rev: 4
ban: 1
---
# YC5 · Đặt phòng

## Mục tiêu

Là chủ nhà, tôi muốn ghi một đặt phòng vào lịch chỉ trong vài chạm, được báo ngay khi chọn trùng đêm đã có khách, và có sẵn tiền phòng theo bảng giá, để không bao giờ nhận hai khách cho một đêm và không phải tự cộng tiền. Sau đó tôi muốn xem lại, sửa, ghi đã thu tiền, và bỏ đặt phòng khi khách hủy, mà sale của đặt phòng đó luôn được biết.

Vì sao quan trọng: chủ nhà hiện ghi lịch bằng sổ tay hoặc nhóm Zalo. Trùng phòng là lỗi đắt nhất của nghề (khách đến không có phòng, mất uy tín với sale). Vì vậy chặn trùng phải nằm ở database, không chỉ ở giao diện: mọi đường ghi (app, lệnh gửi thẳng, hai máy bấm cùng lúc) đều đi qua cùng một ràng buộc.

Đặt phòng có sale đứng tên là của chung hai người: sale đã báo giá cho khách, có tiền chênh, có thống kê. Vì vậy chủ nhà không tự xóa được đặt phòng đó; muốn bỏ thì xin hủy và sale đồng ý (QD12). Chủ nhà sửa được, nhưng mỗi lần đổi ngày hay tiền thì sale được báo, và giá sale đã bán cho khách giữ nguyên.

## Luồng chính

Hôm nay là 07/10/2026. Chị Hoa có khách lẻ gọi đặt căn 1509 từ 31/10 tới 02/11. Chị mở tab Lịch, bấm "Đặt phòng". Form "Thêm đặt phòng" mở ra. Chị chạm chip "1509", chọn ngày nhận 31/10, chạm chip "2 đêm": ngày trả tự thành 02/11 và dòng "✓ 31/10 → 02/11 (2 đêm) · không trùng lịch" hiện ra. Ô "Tiền phòng (đ)" đã điền sẵn 2.200.000, bên dưới tách "31/10: 1.300.000đ" và "01/11: 900.000đ" (đêm 31/10 là thứ Bảy nên tính giá cuối tuần). Chị chạm chip "Khách lẻ", giữ "Chưa cọc", bấm "Thêm đặt phòng". App về tab Lịch, toast "Đã thêm đặt phòng Khách lẻ · 1509" hiện ở đầu màn, ngày 31/10 mở sẵn chi tiết. Từ lúc đó mọi sale được chia sẻ căn 1509 thấy đêm 31/10 và 01/11 là "Kín".

Nếu Chị Hoa chọn 1509 từ 11/10 tới 13/10, dòng kiểm hiện báo trùng vì đêm 11/10 đã thuộc đặt phòng B1 của Sale Hùng. Dù app có lỗi để lọt lệnh lưu, database vẫn từ chối.

Sale Hùng gọi báo khách của B1 hủy. Chị Hoa chạm ô 10/10, chạm dòng 1509 để mở chi tiết B1, bấm "Xin hủy" và xác nhận. B1 hiện nhãn "Chờ đồng ý hủy" ở cả hai bên. Sale Hùng mở thông báo, bấm "Đồng ý hủy": B1 thành "Đã hủy", đêm 10/10 và 11/10 của 1509 trống lại và bán được cho khách khác.

## Phạm vi

YC này gồm: chủ nhà ghi đặt phòng cho khách lẻ hay ghi giúp sale (mở form, căn, ngày, người đặt, tiền, lưu, chặn trùng), xem chi tiết và ghi đã thu tiền, sửa, xóa đặt phòng khách lẻ, hủy đặt phòng có sale khi hai bên đồng ý, và phía sale của đặt phòng chủ nhà ghi giúp.

Không thuộc YC này (dễ tưởng là có):
- Hàng chip sale đã kết nối trên form (thứ tự, sale nào hiện) và chip "+ Sale mới": YC6.
- Lịch tháng, chi tiết ngày của căn có khách: YC2.
- Sale thấy "Kín" ở lịch của sale: YC7.
- Sale gửi yêu cầu đặt phòng, chủ nhà chấp nhận thành đặt phòng: YC9. Đặt phòng thành từ yêu cầu được xem, sửa, thu tiền, hủy theo YC này.
- Ghi, sửa, xóa đặt phòng cho căn tự nhập của sale: YC10.
- Màn thông báo và công tắc từng loại: YC12. YC này chỉ đòi database ghi thông báo đúng lúc.
- Danh sách "Đặt phòng của tôi" và thống kê của sale: YC11.

## Quy tắc của nhóm

| Tên | Quy tắc | Ví dụ |
|---|---|---|
| Tiền còn lại | Còn lại bằng tiền phòng trừ tiền cọc, tính lúc hiện, không lưu. "Đã thu đủ" đưa đặt phòng về đã thanh toán, tiền cọc giữ nguyên | 2.200.000đ trừ 1.000.000đ còn 1.200.000đ |
| Giờ nhận trả mặc định | Không nhập giờ thì đặt phòng lấy giờ nhận, giờ trả trong cài đặt của chủ nhà (YC1), mặc định 14:00 và 12:00 | 14:00, 12:00 |
| Xóa phải bấm hai lần | Bấm xóa lần đầu thì hỏi lại, xác nhận mới xóa | Không |
| Không xóa đặt phòng của sale | Đặt phòng có sale đứng tên (thành từ yêu cầu, hay chủ nhà ghi giúp sale) thì chủ nhà không xóa được, chỉ sửa hay xin hủy. Database chặn, không chỉ ẩn nút | Không |
| Hủy cần hai bên | Đặt phòng có sale chỉ bỏ được khi một bên xin hủy và bên kia đồng ý. Bị từ chối thì không xin lại. Đặt phòng đã hủy vẫn hiện cho hai bên với nhãn "Đã hủy", không chiếm đêm, không tính thống kê (QD12) | "Chờ đồng ý hủy", "Đã hủy", "Bị từ chối hủy" |
| Giá bán giữ khi chủ nhà sửa | Chủ nhà sửa tiền phòng của đặt phòng có sale thì giá bán sale đã báo khách giữ nguyên (Tùng, bản Zalo, 04/11/2026, điểm 1) | 2.600.000đ giữ nguyên |
| Về màn đã mở | Lưu sửa hay xóa xong thì quay về đúng màn đã mở chức năng đó (Tùng, bản Zalo, 04/11/2026, điểm 2) | Không |

Quy tắc dùng chung: QT1 (chặn trùng), QT2 (đêm có khách), QT3.1 (giá bán, tiền chênh), QT4 (tiền phòng theo đêm) ở `docs/product/rules/`; QT6.1 Trạng thái tiền đặt phòng, QT5.6 Chống gửi trùng, QT6.2 Chủ nhà chỉ làm việc với sale; QD6, QD7, QD10, QD11, QD12, QD13.

## Ai được làm gì

- PQ7.CHU: chỉ người giữ căn ghi được đặt phòng cho căn đó. Chủ nhà khác, sale được chia sẻ, người chưa đăng nhập đều không ghi được (YC5.3-NT6).
- PQ9: tên, số khách chủ nhà nhập chỉ chủ nhà đó đọc được (QD11). Sale không thấy (YC5.3-NT7); chủ nhà khác không thấy (YC5.2-NT9).
- PQ8.SALE: sale không thấy tiền phòng, tiền cọc của đặt phòng khách lẻ (YC5.3-NT7).
- PQ4.SALE: sale được chia sẻ căn thấy đêm đó kín (hiển thị ở YC7).
- PQ7.CHU: chỉ chủ nhà giữ căn sửa, xóa, xin hủy đặt phòng của căn đó (YC5.6-NT8). Không xóa đặt phòng có sale (YC5.7-NT4, YC5.7-NT5).
- PQ7.SALE: sale của đặt phòng chỉ xin hủy, trả lời xin hủy; không sửa, không xóa (YC5.6-NT8, YC5.8-NT5). Sale khác không đụng tới được (YC5.8-NT5).
- PQ8.SALE: sale không ghi được đã thu đủ (YC5.5-NT5).
- PQ9.SALE: sale không thấy khách chủ nhà nhập trên đặt phòng của mình (YC5.4-NT3).
- PQ11.CHU, PQ11.SALE: giá bán chỉ sale của đặt phòng thấy và sửa; chủ nhà không thấy, không sửa được (YC5.9-NT1, YC5.9-NT2).
- PQ17.CHU: chủ nhà chỉ ghi đặt phòng cho sale đang kết nối và được xem căn đó (YC5.4-NT5).

Theo `docs/security/PQ-ma-tran-quyen.md`; mỗi dòng có test vi phạm ở lớp database.

## Dữ liệu

Mô hình chung: `docs/architecture/thiet-ke-db.md`. YC này cần database bảo đảm:
- Chặn trùng đêm của cùng căn bằng ràng buộc ở database (QD6), tính trên đặt phòng chưa hủy. Hai lệnh ghi cùng lúc thì đúng một lệnh qua.
- Mỗi lệnh ghi nhận mã lần gửi; gửi lại cùng mã thì trả đặt phòng đã có, không ghi mới.
- Tiền phòng bắt buộc, lệnh không có tiền phòng bị từ chối (database không tự điền). Tiền từng đêm lưu riêng theo QT4, để doanh thu tháng tính đúng khi đặt phòng vắt qua hai tháng.
- Một lệnh trả giá chủ nhà từng đêm của căn cho một khoảng ngày (đêm chưa có giá trả "chưa có giá"), chỉ người giữ căn gọi được. Dùng chung với YC2.
- Phần mọi bên cùng thấy (căn, ngày, người đặt, tiền phòng, trạng thái tiền) tách khỏi phần riêng của từng người (khách người đó nhập; với sale còn có giá bán). Mỗi người chỉ đọc được phần riêng của mình (QD11).
- Kiểm dữ liệu một chỗ dùng chung cho ghi và sửa, trả câu ở bảng luật kiểm. Căn không phải của người gọi thì trả lỗi quyền chung, không lộ căn có tồn tại hay không.
- Ghi giúp sale: kiểm sale đang kết nối và được xem căn đó (kết nối "chỉ vài căn"); phần riêng của sale có giá bán điền sẵn = tiền phòng + mức cộng của sale cho căn × số đêm (QT3.1; làm tròn: [MỞ: YC5-H13]).
- Sửa: từ chối khi đặt phòng đã bị sửa ở máy khác kể từ lúc app đọc. `[r4 · sửa]` Đổi trạng thái tiền bằng tay thì bỏ trạng thái nhớ để hoàn tác (YC5-H6, Claude tự chốt).
- Mọi lệnh sửa, xóa ghi nhật ký thay đổi (QD2): ai, lúc nào, giá trị cũ và mới.
- Ghi, sửa, xóa đặt phòng thì cập nhật lúc lịch đổi của căn (YC7 dùng); yêu cầu đang chờ trùng đêm thành bị từ chối (QT1.4, giả định GD11).
- Thông báo do database sinh khi dữ liệu đổi (YC12): chủ nhà ghi giúp sale, chủ nhà sửa đặt phòng có sale (khi đổi ngày hay tiền phòng), xin hủy, trả lời xin hủy, đặt phòng mới chiếm đêm của căn sale đã gửi khách.

## Trạng thái màn (mọi mục)

- Đang tải danh sách căn, đặt phòng hay giá khi mở form: theo HV1 (khung xám tại chỗ, không chặn cả màn).
- Mất mạng khi đang mở form: theo HV2; vẫn nhập được, chỉ không lưu được.
- Rời app khi đang nhập rồi quay lại: theo HV3, giữ nguyên dữ liệu đã nhập, chạy lại bước 4.
- Căn bị ẩn hoặc chủ nhà mất quyền với căn trong lúc đang nhập: lưu bị từ chối, toast "Có lỗi xảy ra. Bạn thử lại sau ít phút.", theo HV5.
- Toast: theo HV8 (vị trí, tự tắt).
- Mở chi tiết đặt phòng vừa bị xóa hay vừa hủy ở máy khác: theo HV5, về màn trước, toast "Đặt phòng này không còn".

## YC5.1 · Mở form, chọn căn và ngày, kiểm trùng sớm

Bản 1 · rủi ro: cao · Màn: CN4, CN3

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1a | Ở tab Lịch (CN1), bấm "Đặt phòng" | Mở CN4, tiêu đề "Thêm đặt phòng". Căn chọn sẵn là căn đầu tiên trong danh sách căn của chủ nhà. Ngày nhận điền sẵn là đêm trống đầu tiên của căn đó tính từ hôm nay, số đêm 1 | Đọc căn của chủ nhà (chưa ẩn, loại có lịch) và các đặt phòng chưa hủy của các căn đó |
| 1b | Ở chi tiết ngày (CN3), bấm nút trên dòng căn trống ("Phòng 3402 · Trống ✓") | Mở CN4 với căn 3402 và ngày nhận là ngày đang xem, số đêm 1 | Như 1a |

Chữ trên nút ở dòng căn trống: "Đặt phòng" (theo `docs/product/glossary.md`). Canvas CN3 còn ghi "Thêm khách": làm theo story.

Chủ nhà chưa có căn nào thì không có nút "Đặt phòng" (màn trống của tab Lịch thuộc YC3).

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 2 | Chạm một chip ở hàng "Phòng" | Chọn căn đó. Hàng chip chỉ có căn của chính chủ nhà, chưa ẩn. Đổi căn thì giữ ngày, chạy lại bước 4 và tiền phòng | Không |
| 3 | Chạm chip "1 đêm", "2 đêm" hoặc "3 đêm" | Ngày trả = ngày nhận cộng số đêm. Chạm "Tùy chọn" thì ô "Ngày trả phòng" mở để chọn tự do; đổi ngày trả bằng tay thì chip số đêm tương ứng tự sáng (1, 2, 3) hoặc "Tùy chọn" | Không |
| 3b | Đổi ô "Ngày nhận phòng" | Giữ số đêm đang chọn, dời ngày trả theo | Không |
| 4 | (tự động sau mỗi lần đổi căn hoặc ngày) | Dòng kiểm dưới ô ngày: không trùng thì "✓ 31/10 → 02/11 (2 đêm) · không trùng lịch"; trùng thì dòng đỏ "Trùng đêm 11/10 với đặt phòng của Sale Hùng (10/10 → 12/10)" và nút "Thêm đặt phòng" không bấm được | Không gọi riêng: app so với các đặt phòng đã đọc ở bước 1. Đây chỉ là báo sớm; chặn thật ở bước 9 |

Luật đêm: một lần ở chiếm các đêm từ ngày nhận tới **trước** ngày trả (QT1.1, QT2). Nhận 12/10 không trùng với đặt phòng trả 12/10.

Trùng với nhiều đặt phòng thì dòng đỏ nêu đặt phòng có đêm trùng sớm nhất và thêm "và N đặt phòng khác". Người đặt trong dòng đỏ là tên sale, hoặc "Khách lẻ", hoặc tên khách chủ nhà đã nhập (chủ nhà thấy được khách của chính mình, QD11).

Tiêu chí:
- **YC5.1-NT1** Khi các đêm đã chọn chưa có khách trong căn, thì thấy dòng "không trùng lịch". · unit
- **YC5.1-NT2** Khi các đêm đã chọn trùng với một đặt phòng chưa hủy của cùng căn, thì thấy dòng báo trùng, nút lưu không bấm được, và lệnh lưu gửi thẳng tới database cũng bị từ chối. · unit (dòng báo), database (từ chối: QT1.1-VD1)
- **YC5.1-NT3** Khi chủ nhà chọn "2 đêm", thì ngày trả bằng ngày nhận cộng 2. · unit
- **YC5.1-NT4** Khi chủ nhà bấm "Đặt phòng" ở tab Lịch, căn đầu tiên là 1509 và 1509 chỉ có B1 (10/10 → 12/10), thì form mở với 1509, nhận 07/10, trả 08/10. Khi 1509 có thêm một đặt phòng 07/10 → 10/10, thì ngày nhận điền sẵn là 12/10 (đêm trống đầu tiên sau B1). · unit
- **YC5.1-NT5** Khi chủ nhà xem chi tiết ngày 10/10 và căn 3402 trống ngày đó, thì dòng 3402 ghi "Trống" và có nút "Đặt phòng"; bấm nút thì CN4 mở với căn 3402 và ngày nhận 10/10. · E2E
- **YC5.1-NT6** Khi lệnh ghi có ngày trả không sau ngày nhận, hoặc dài hơn 365 đêm, thì database từ chối với câu "Ngày trả phải sau ngày nhận" hoặc "Một đặt phòng dài tối đa 365 đêm". · database

## YC5.2 · Người đặt, tiền phòng, trạng thái tiền

Bản 2 · rủi ro: cao · Màn: CN4, CN4-01

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 5 | Xem hàng chip "Khách / Sale" | Thứ tự chip: "+ Sale mới", "Khách lẻ", các sale đang kết nối (YC6), rồi các tên khách lẻ chủ nhà đã nhập trước đây (mới nhất trước, tối đa 10). Chưa chip nào được chọn | Đọc tên khách chủ nhà đã nhập trong phần riêng của chính chủ nhà |
| 6 | Chạm "Khách lẻ" | Chọn khách lẻ không tên | Không |
| 6b | Chạm một tên khách đã dùng (ví dụ "Dung Đỗ") | Chọn khách lẻ có tên đó | Không |
| 6c | Chạm một chip sale (ví dụ "Sale Hùng") | Chọn sale đó làm người đặt. Dòng nhỏ dưới hàng chip: "Đặt phòng của Sale Hùng: Hùng được báo và thấy đặt phòng này như của mình." | Không |

Chưa chọn người đặt thì nút "Thêm đặt phòng" không bấm được. `[r2 · sửa]` Chọn "Khách lẻ" thì dưới hàng chip hiện ô "Tên khách (không bắt buộc)" và ô "Số điện thoại khách (không bắt buộc)". Chạm chip tên đã dùng thì ô tên điền sẵn tên đó; gõ tên mới rồi lưu thì lần sau tên đó thành chip. Tên và số điện thoại ghi vào phần riêng của chủ nhà, chỉ chủ nhà thấy (QD11) (Claude tự chốt, QD25, trả lời YC5-H1, YC5-H2).

`[r2 · sửa]` Chọn sale thì không có ô tên, số điện thoại khách: khách của đặt phòng có sale do sale giữ (QD11); chủ nhà cần ghi gì thì dùng ô "Ghi chú" (Claude tự chốt, QD25, trả lời YC5-H12). Chip "+ Sale mới": YC6.

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 7 | (tự động sau khi có căn và ngày) | Ô "Tiền phòng (đ)" điền sẵn tổng giá chủ nhà của các đêm. Dưới ô, mỗi đêm một dòng "31/10: 1.300.000đ". Đêm nào chưa có giá thì dòng ghi "01/12: chưa đặt giá" và ô tiền phòng để trống | Hàm trả giá chủ nhà từng đêm của căn (QT4.1, QT5.3: giá dịp, rồi giá tháng ngày thường hoặc cuối tuần) |
| 7b | Gõ số khác vào ô | Giữ số chủ nhà gõ. Các dòng từng đêm vẫn hiện giá bảng giá để chủ nhà so | Không |
| 7c | Đổi căn hay ngày sau khi đã gõ số | Điền lại theo bảng giá mới, bỏ số đã gõ | Không |
| 7d | Xóa trống ô | CN4-01: viền đỏ, dòng "Nhập tiền phòng trước khi lưu", nút "Thêm đặt phòng" không bấm được | Không |

Ô nhận số nguyên đồng, hiện có dấu chấm ngăn nghìn khi gõ ("2.200.000"). Không nhận số âm, số lẻ.

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 8a | Chạm một trong ba chip "Chưa cọc", "Đã cọc · còn thu", "Đã thanh toán" | Chọn chip đó. Mở form thì "Chưa cọc" chọn sẵn (giả định GD19) | Không |
| 8b | Chọn "Đã cọc · còn thu" | Hiện ô "Số tiền cọc (đ)". Chọn chip khác thì ô này ẩn và giá trị đã gõ bị bỏ | Không |
| 8c | Bấm "Thêm chi tiết" | Mở phần chi tiết: số khách (nút − và +, từ 1), giờ nhận và giờ trả điền sẵn theo cài đặt của chủ nhà ("14:00 → 12:00"), ô "Ghi chú". Dòng tóm tắt khi đóng: "4 khách · 14:00 → 12:00 · Ghi chú" | Đọc giờ nhận, giờ trả trong cài đặt của chủ nhà |

`[r2 · sửa]` Tiền cọc không bắt buộc khi đã chọn "Đã cọc · còn thu": ô để trống vẫn lưu được (Claude tự chốt, QD25, trả lời YC5-H19).

Tiền cọc lớn hơn tiền phòng thì không lưu được, ô cọc viền đỏ, dòng "Tiền cọc không được lớn hơn tiền phòng" (giả định GD20).

Tiêu chí:
- **YC5.2-NT1** Khi chủ nhà chọn 1509, nhận 31/10 trả 02/11, thì ô tiền phòng điền sẵn 2.200.000đ, dưới ô có "31/10: 1.300.000đ" và "01/11: 900.000đ" (QT4.1-VD1). · database (hàm giá từng đêm), unit (hiển thị)
- **YC5.2-NT2** Khi chủ nhà giữ 2.200.000đ và lưu, thì tiền đêm 31/10 là 1.300.000đ, đêm 01/11 là 900.000đ (QT4.2-VD3). Khi gõ 2.000.000đ và lưu, thì mỗi đêm 1.000.000đ (QT4.2-VD1). Khi 3 đêm và gõ 1.000.000đ, thì 333.333đ, 333.333đ, 333.334đ (QT4.2-VD2). · database
- **YC5.2-NT3** Khi ô "Tiền phòng (đ)" trống, thì nút "Thêm đặt phòng" không bấm được, ô viền đỏ với dòng "Nhập tiền phòng trước khi lưu", và đặt phòng không được lưu (CN4-01, QT4.1-VD3). · unit
- **YC5.2-NT4** Khi lệnh tạo đặt phòng không có tiền phòng gửi thẳng tới database, thì database từ chối với câu "Cần nhập tiền phòng" và lịch không đổi. · database
- **YC5.2-NT5** Khi một đêm trong khoảng đã chọn chưa có giá (ví dụ 1509 nhận 30/12/2026 trả 02/01/2027, tháng 1 chưa đặt giá), thì dòng của đêm đó ghi "chưa đặt giá" và ô tiền phòng để trống. · unit
- **YC5.2-NT6** Khi chủ nhà chọn "Đã cọc · còn thu", thì hiện ô "Số tiền cọc (đ)"; chọn "Chưa cọc" hoặc "Đã thanh toán" thì ô này ẩn. · unit
- **YC5.2-NT7** Khi tiền cọc lớn hơn tiền phòng (cọc 3.000.000đ, tiền phòng 2.200.000đ), thì app không cho lưu, và lệnh gửi thẳng tới database bị từ chối với câu "Tiền cọc không được lớn hơn tiền phòng" (giả định GD20). · unit, database
- **YC5.2-NT8** Khi chưa chọn chip nào ở hàng "Khách / Sale", thì nút "Thêm đặt phòng" không bấm được. · unit
- **YC5.2-NT9** Khi Chị Hoa đã từng ghi khách tên "Dung Đỗ", thì hàng chip có "Dung Đỗ" sau các chip sale; Anh Tuấn mở form của mình thì không thấy "Dung Đỗ". · database (RLS), unit (thứ tự chip)
- **YC5.2-NT10** Khi chủ nhà mở "Thêm chi tiết", thì thấy số khách, giờ nhận và giờ trả (14:00, 12:00 theo cài đặt) và ô ghi chú. · unit
- **YC5.2-NT11** Khi chủ nhà không mở "Thêm chi tiết" và lưu, thì giờ nhận, giờ trả của đặt phòng lấy theo cài đặt của chủ nhà lúc lưu. · database
- `[r2 · thêm]` **YC5.2-NT12** Khi chủ nhà chọn "Khách lẻ", gõ tên "Bà Lan" rồi lưu, thì lần mở form sau hàng chip có "Bà Lan"; chọn sale thì không có ô tên khách. · unit, database
- `[r2 · thêm]` **YC5.2-NT13** Khi lệnh ghi có số điện thoại khách "0912 345" (7 chữ số), thì database từ chối với câu "Số điện thoại khách không hợp lệ"; số "0912.345.678" thì lưu được và chỉ chủ nhà đọc được. · database

## YC5.3 · Lưu và chặn trùng

Bản 2 · rủi ro: cao · Màn: CN4, CN4-03

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 9 | Bấm "Thêm đặt phòng" | Nút chuyển trạng thái đang lưu, không bấm lại được. Gửi kèm một mã lần gửi app tự sinh khi mở form | Lệnh ghi đặt phòng: kiểm người gọi giữ căn đó; kiểm dữ liệu (mục Luật kiểm); ghi đặt phòng; ràng buộc chặn trùng từ chối nếu trùng đêm; ghi tiền từng đêm theo QT4.2; ghi tên, số khách vào phần riêng của chủ nhà; yêu cầu đặt phòng đang chờ có đêm trùng thành bị từ chối (QT1.4, giả định GD11); cập nhật giờ lịch đổi của căn. Trigger ghi thông báo cho sale có căn đã gửi khách trùng đêm. Người đặt là sale: kiểm sale đang kết nối và được chia sẻ căn này; ghi giá bán điền sẵn của sale vào phần riêng của sale (mục Ghi đặt phòng cho sale); trigger ghi thông báo "chủ ghi đặt phòng cho bạn" cho sale đó |
| 10 | (lưu được) | Về tab Lịch (CN4-03), tháng chứa ngày nhận, ngày nhận đang chọn và chi tiết ngày mở sẵn. Toast "Đã thêm đặt phòng Khách lẻ · 1509" (có tên khách hay sale thì thay "Khách lẻ" bằng tên đó) | Không |
| 11 | (database từ chối vì trùng) | Ở lại form, giữ mọi ô đã nhập. Dòng kiểm ngày thành đỏ "Căn đã có đặt phòng trong những đêm này". Đọc lại đặt phòng của căn để dòng kiểm ở bước 4 đúng với dữ liệu mới | Trả lỗi P0001 với câu trên |
| 12 | (lỗi khác do dữ liệu) | Ở lại form, toast đỏ là câu database trả về (ví dụ "Ngày trả phải sau ngày nhận") | Trả lỗi P0001 kèm câu tiếng Việt |
| 13 | (mất mạng hoặc quá 15 giây không có trả lời) | Ở lại form, giữ dữ liệu, toast "Chưa lưu được vì mất mạng. Kiểm tra mạng rồi bấm lại." Bấm lại thì gửi **cùng** mã lần gửi | Nếu lần trước thực ra đã lưu, lần gửi lại trả về đặt phòng cũ, không tạo cái thứ hai |

Hai máy cùng ghi một đêm của một căn trong cùng một lúc: một lệnh lưu được, lệnh kia nhận lỗi ở bước 11. Không bao giờ cả hai cùng lưu.

Luật kiểm khi ghi (dùng cả ở YC5.4, YC5.6):

Database là chỗ chặn thật; app chặn trước cho người dùng thấy sớm. Mọi câu lỗi dưới đây database trả bằng mã P0001 để app hiện nguyên câu (QT5.5).

| Ô | Bắt buộc | Luật | Câu lỗi khi sai |
|---|---|---|---|
| Căn | có | Căn có lịch, của chính người gọi, chưa ẩn | (lỗi quyền, app hiện câu chung) |
| Ngày nhận, ngày trả | có | Ngày trả sau ngày nhận; tối đa 365 đêm. Ngày nhận trong quá khứ được phép (ghi bù) | "Ngày trả phải sau ngày nhận" · "Một đặt phòng dài tối đa 365 đêm" |
| Người đặt | có | Khách lẻ (tên có hoặc không), hoặc sale đang kết nối và được chia sẻ căn này | (app chặn; database coi thiếu sale là khách lẻ) · "Sale này không đang kết nối với bạn" · "Sale này không được xem căn này" |
| Tên khách | không | Tối đa 100 ký tự, bỏ khoảng trắng đầu cuối | "Tên khách dài tối đa 100 ký tự" |
| Số điện thoại khách | không | `[r2 · sửa]` Chỉ khi người đặt là khách lẻ. Bỏ khoảng trắng, dấu chấm, gạch ngang rồi còn 9 đến 11 chữ số (YC5-H2) | "Số điện thoại khách không hợp lệ" |
| Tiền phòng | có | Số nguyên đồng, lớn hơn 0 | "Cần nhập tiền phòng" · "Tiền phòng phải lớn hơn 0" |
| Trạng thái tiền | có | "chua_coc", "da_coc_con_thu", "da_thanh_toan" | "Trạng thái tiền không hợp lệ" |
| Tiền cọc | không | Chỉ khi "Đã cọc · còn thu"; số nguyên lớn hơn 0; không lớn hơn tiền phòng (GD20) | "Tiền cọc không được lớn hơn tiền phòng" |
| Số khách | không | Số nguyên 1 đến 99 | "Số khách từ 1 đến 99" |
| Giờ nhận, giờ trả | không | Giờ hợp lệ; không gửi thì lấy cài đặt của chủ nhà | |
| Ghi chú | không | Tối đa 500 ký tự | "Ghi chú dài tối đa 500 ký tự" |
| Mã lần gửi | không | Trùng với đặt phòng đã có thì trả đặt phòng đó, không ghi mới | |

Trùng đêm: "Căn đã có đặt phòng trong những đêm này".

Tiêu chí:
- **YC5.3-NT1** Khi chủ nhà bấm "Thêm đặt phòng" với đủ căn, ngày, người đặt và tiền phòng, thì đặt phòng hiện trong lịch của căn đó và toast "Đã thêm đặt phòng <người đặt> · <căn>" hiện đầu màn. · E2E
- **YC5.3-NT2** Khi 1509 đã có B1 (10/10 → 12/10) và chủ nhà ghi 1509 từ 12/10 tới 13/10, thì lưu được (QT1.1-VD2). Ghi 3402 từ 10/10 tới 12/10 cũng lưu được (QT1.1-VD3). · database
- **YC5.3-NT3** Khi hai lệnh ghi cùng đêm của cùng căn chạy cùng lúc, thì đúng một lệnh lưu được. · database
- **YC5.3-NT4** Khi app gửi lại lệnh lưu với cùng mã lần gửi sau khi lần trước đã lưu, thì không có đặt phòng thứ hai và app nhận về đặt phòng đã lưu. · database
- **YC5.3-NT5** Khi Sale Lan đang có yêu cầu chờ cho 1509 từ 17/10 tới 19/10 và Chị Hoa tự ghi 1509 từ 18/10 tới 19/10, thì yêu cầu của Sale Lan thành bị từ chối (giả định GD11). · database
- **YC5.3-NT6** Khi Anh Tuấn gửi lệnh ghi đặt phòng vào căn 1509 của Chị Hoa, hoặc Sale Hùng gửi lệnh này (dù được chia sẻ căn 1509), thì database từ chối và lịch 1509 không đổi. · database
- **YC5.3-NT7** Khi Sale Hùng đọc đặt phòng khách lẻ Chị Hoa vừa ghi, thì Hùng chỉ thấy đêm kín qua lịch của sale, không thấy tên khách, số khách, tiền phòng, tiền cọc. · database

## YC5.4 · Ghi đặt phòng cho sale

Bản 1 · rủi ro: cao · Màn: CN4

Chủ nhà ghi giúp một đặt phòng cho sale đã kết nối, ví dụ khi sale gọi điện báo khách. Đặt phòng này là đặt phòng của sale (Tùng, bản Zalo: "Coi như booking của Hùng"): sale được báo, có giá bán và tiền chênh, có trong thống kê của sale; chủ nhà không xóa được (mục Xóa đặt phòng).

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 14 | Chọn chip "Sale Hùng" (bước 6c) và bấm "Thêm đặt phòng" | Như bước 9 đến 13. Toast "Đã thêm đặt phòng Sale Hùng · 1509" | Như bước 9, thêm: kiểm Sale Hùng đang kết nối với chủ nhà và được chia sẻ căn này; phần riêng của Sale Hùng có giá bán điền sẵn = tiền phòng + mức cộng của Hùng cho căn đó × số đêm (QT5.4, QT3.1); trigger ghi thông báo "chủ ghi đặt phòng cho bạn" cho Hùng |
| 15 | (Sale không còn kết nối, hay không được chia sẻ căn này) | Ở lại form, toast đỏ là câu database trả về | Từ chối với câu "Sale này không đang kết nối với bạn" hoặc "Sale này không được xem căn này" |

Giá bán điền sẵn có làm tròn lên 50.000đ khi sale bật làm tròn không: [MỞ: YC5-H13]. Database đang làm tròn.

Tiêu chí:
- **YC5.4-NT1** Khi Chị Hoa ghi 1509 từ 20/10 tới 22/10, tiền phòng 1.800.000đ, người đặt Sale Hùng, và mức cộng của Hùng cho 1509 là +200k (DLM.3), thì Hùng có đặt phòng đó với giá bán 2.200.000đ và tiền chênh 400.000đ (QT3.1). · database
- **YC5.4-NT2** Khi Chị Hoa lưu đặt phòng ở YC5.4-NT1, thì Sale Hùng có thông báo "chủ ghi đặt phòng cho bạn" kèm căn và ngày ở. · database
- **YC5.4-NT3** Khi Chị Hoa đã ghi tên và số khách cho đặt phòng ở YC5.4-NT1, thì Sale Hùng đọc đặt phòng đó không thấy tên và số này (QD11). · database
- **YC5.4-NT4** Khi Chị Hoa ghi đặt phòng với người đặt "Khách lẻ", thì không sale nào có thông báo và đặt phòng không vào thống kê của sale nào. · database
- **YC5.4-NT5** Khi Chị Hoa ghi đặt phòng cho một sale không kết nối với chị, thì database từ chối "Sale này không đang kết nối với bạn"; khi sale chỉ được chia sẻ 3402 mà chị ghi 1509 cho sale đó, thì từ chối "Sale này không được xem căn này". · database

## YC5.5 · Chi tiết đặt phòng và thu tiền

Bản 2 · rủi ro: cao · Màn: CN3-02, CN3-02-01

Mở từ dòng căn có khách ở chi tiết ngày, từ danh sách đặt phòng sắp tới (YC2), từ thanh ở lịch tuần (YC2).

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 16 | Mở chi tiết B1 | CN3-02: tiêu đề "Đặt phòng · Sale Hùng", "Phòng 1509", nhãn trạng thái tiền ("Đã cọc · còn thu"), "10/10 → 12/10 (2 đêm)", "Nhận 14:00 thứ 7 · trả 12:00 thứ 2" | Đọc đặt phòng, tiền từng đêm, phần riêng của chính chủ nhà |
| 17 | Xem người đặt (đặt phòng có sale) | Tên sale, số điện thoại, số khách (nếu chủ nhà đã nhập), nút "Gọi sale", dòng "Khách do sale Hùng bán. Tên và số điện thoại khách chỉ sale giữ; cần gì về khách thì gọi sale." | Số điện thoại sale của sale đang kết nối. Khách do sale nhập không bao giờ trả về cho chủ nhà (QD11) |
| 17b | Xem người đặt (khách lẻ) | Tên khách chủ nhà đã nhập, hoặc "Khách lẻ". `[r3 · thêm]` Có số điện thoại khách chủ nhà đã nhập (YC5-H2) thì hiện số và nút "Gọi khách" (`tel:`) (Claude tự quyết, QD25) | Như bước 16 |
| 18 | Bấm "Gọi sale" | Mở cuộc gọi tới số của sale (`tel:`) | Không |
| 19 | Xem mục "Tiền" | "Tiền phòng 2.200.000đ", "Đã cọc 1.000.000đ", "Còn lại 1.200.000đ" (tiền phòng trừ cọc, tính lúc hiện, không lưu). Mục "Ghi chú" nếu có | Không |
| 20 | Bấm "Đã thu đủ 1.200.000đ" (chỉ có khi chưa "Đã thanh toán") | Nhãn thành "Đã thanh toán", nút thành "Hoàn tác: chưa thu đủ" | Lệnh ghi đã thu đủ: trạng thái tiền thành đã thanh toán, nhớ trạng thái trước. Tiền cọc giữ nguyên |
| 21 | Bấm "Hoàn tác: chưa thu đủ" | Nhãn về trạng thái trước ("Đã cọc · còn thu") | Lệnh hoàn tác thu đủ |
| 22 | Mở đặt phòng của sale đã xóa tài khoản | CN3-02-01: tên cũ của sale kèm chữ đỏ nhỏ "đã xóa tài khoản", dòng "Sale Hùng đã xóa tài khoản. Đặt phòng vẫn giữ trong lịch của bạn; app không còn số điện thoại của sale này." Không có số, không có nút "Gọi sale". Đặt phòng và các đêm vẫn kín | Hồ sơ của sale ghi đã xóa tài khoản, số điện thoại đã xóa (QD13) |
| 23 | Bấm "Sửa", "Xóa đặt phòng", "Xin hủy" | Theo các mục dưới | |

Nút trên màn theo loại đặt phòng: khách lẻ có "Sửa" và "Xóa đặt phòng"; có sale có "Sửa" và "Xin hủy", không có "Xóa đặt phòng". Đặt phòng đang chờ hủy hay đã hủy: mục Hủy đặt phòng có sale.

Tiêu chí:
- **YC5.5-NT1** Khi B1 có tiền phòng 2.200.000đ và đã cọc 1.000.000đ, thì mục Tiền ghi "Còn lại 1.200.000đ" và nút "Đã thu đủ 1.200.000đ". · unit
- **YC5.5-NT2** Khi Chị Hoa bấm "Đã thu đủ" ở B1, thì nhãn thành "Đã thanh toán", tiền cọc vẫn 1.000.000đ và nút thành "Hoàn tác: chưa thu đủ". · database, unit
- **YC5.5-NT3** Khi Chị Hoa bấm "Hoàn tác: chưa thu đủ" ngay sau đó, thì B1 về "Đã cọc · còn thu". · database
- **YC5.5-NT4** Khi Sale Hùng đã xóa tài khoản và Chị Hoa mở B1, thì thấy tên "Sale Hùng" kèm "đã xóa tài khoản", không có số điện thoại và nút "Gọi sale", còn đêm 10/10, 11/10 vẫn kín. · unit, database (không còn số)
- **YC5.5-NT5** Khi Sale Hùng gửi lệnh ghi đã thu đủ cho B1, thì database từ chối và trạng thái tiền không đổi. · database
- `[r3 · thêm]` **YC5.5-NT6** Khi Chị Hoa mở đặt phòng khách lẻ có tên "Bà Lan" và số "0912345678" do chị nhập, thì thấy tên, số và nút "Gọi khách"; khách lẻ không có số thì không có nút. · unit

## YC5.6 · Sửa đặt phòng

Bản 2 · rủi ro: cao · Màn: CN4-02, S3-10

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 24 | Bấm "Sửa" | CN4-02: tiêu đề "Sửa đặt phòng · Sale Hùng", cùng bố cục với form thêm, điền sẵn mọi ô của đặt phòng; nút "Lưu thay đổi" | Như bước 16 |
| 25 | Đổi căn, ngày, tiền, trạng thái tiền, chi tiết | Như bước 2 đến 8c. Dòng kiểm trùng không tính chính đặt phòng đang sửa (QT1.2). Đổi căn hay ngày thì tiền phòng điền lại theo bảng giá (bước 7c) | Không |
| 26 | Bấm "Lưu thay đổi" | Nút đang lưu. Lưu được thì quay về đúng màn đã mở chức năng sửa (chi tiết ngày, danh sách sắp tới, lịch tuần), toast "Đã lưu đặt phòng" (Tùng, bản Zalo 04/11/2026 điểm 2) | Lệnh sửa đặt phòng: chỉ chủ nhà giữ căn; kiểm dữ liệu như khi ghi; ràng buộc chặn trùng tự bỏ chính dòng đang sửa; tính lại tiền từng đêm (QT4.2); yêu cầu đang chờ trùng đêm mới thành bị từ chối; ghi nhật ký thay đổi; trigger ghi thông báo "chủ sửa đặt phòng" cho sale khi đổi ngày hay tiền phòng |
| 27 | (đặt phòng có sale, chủ nhà đổi tiền phòng) | Giá bán của sale giữ như sale đã báo khách, không tính lại theo mức cộng | Không đổi phần riêng của sale. Thông báo cho sale có tiền phòng cũ và mới |
| 28 | (database từ chối, mất mạng) | Như bước 11 đến 13 | Như bước 11 đến 13 |
| 29 | (đặt phòng vừa bị sửa ở máy khác sau khi mở form) | Ở lại form, toast "Đặt phòng vừa được sửa ở máy khác. Mở lại để xem bản mới." | Từ chối khi thời điểm sửa cuối khác lúc app đọc |

Tên khách, số khách chủ nhà nhập lưu vào phần riêng của chủ nhà, cùng lúc với lưu đặt phòng.

`[r4 · sửa]` Khi sửa (Claude tự chốt, QD25, trả lời YC5-H4, H5, H6, H8, H9):
- Đặt phòng có sale chỉ đổi sang căn mà sale đó đang được xem; không thì database từ chối "Sale này không được xem căn này" (YC5-H4).
- Ô người đặt khóa ở form sửa, hiện người đặt hiện tại. Muốn đổi người đặt thì xóa hay xin hủy rồi ghi đặt phòng mới (YC5-H5).
- Đổi trạng thái tiền ở form sửa thì bỏ trạng thái nhớ để hoàn tác: nút "Hoàn tác: chưa thu đủ" không còn. Giữ nguyên trạng thái tiền thì trạng thái nhớ còn (YC5-H6).
- Tiền từng đêm tính lại lúc lưu (QT4.2): không đổi căn, ngày, tiền phòng thì giữ nguyên tiền từng đêm cũ; có đổi thì tổng bằng tổng bảng giá các đêm mới thì mỗi đêm theo bảng giá, khác thì chia đều, phần lẻ dồn vào đêm cuối (YC5-H8).
- Sale chỉ được báo "chủ sửa đặt phòng" khi đổi căn, ngày hay tiền phòng. Sửa ghi chú, khách, số khách, giờ, trạng thái tiền thì không báo (YC5-H9).

Luật kiểm khi sửa, xóa, thu tiền, hủy (dùng cả ở YC5.5, YC5.7, YC5.8, YC5.9):

| Việc | Luật | Câu lỗi khi sai |
|---|---|---|
| Sửa | Chỉ chủ nhà giữ căn; đặt phòng chưa hủy; đặt phòng chưa bị sửa ở máy khác kể từ lúc mở form | "Đặt phòng đã hủy, không sửa được" · "Đặt phòng vừa được sửa ở máy khác. Mở lại để xem bản mới." |
| Xóa | Chỉ đặt phòng khách lẻ của căn mình | "Đặt phòng của sale không xóa được, hãy xin hủy" |
| Đã thu đủ | Đặt phòng chưa hủy, chưa "Đã thanh toán" | "Không đánh dấu được đặt phòng này" |
| Hoàn tác thu đủ | Đặt phòng đang "Đã thanh toán" do bấm "Đã thu đủ" | "Đặt phòng này chưa ghi đã thu đủ" |
| Xin hủy | Đặt phòng có sale, đang hiệu lực, chưa từng bị từ chối hủy | "Đặt phòng này không cần xin hủy" · "Đặt phòng đang chờ hủy hoặc đã hủy" · "Đã bị từ chối hủy, không xin hủy lại được" |
| Trả lời xin hủy | Bên không phải bên xin; đặt phòng đang chờ hủy | "Không có lời xin hủy nào chờ bạn" · "Người kia phải trả lời lời xin hủy của bạn" |
| Giá bán của sale | Số nguyên đồng lớn hơn 0 | "Giá bán phải lớn hơn 0" |

`[r4 · sửa]` Tiền phòng phải lớn hơn 0 cả khi ghi lẫn khi sửa, câu lỗi "Tiền phòng phải lớn hơn 0" (Claude tự chốt, QD25, trả lời YC5-H3).

Tiêu chí:
- **YC5.6-NT1** Khi Chị Hoa mở sửa B1, thì mọi ô hiện đúng giá trị của B1 (1509, 10/10 → 12/10, Sale Hùng, 2.200.000đ, đã cọc 1.000.000đ). · unit
- **YC5.6-NT2** Khi Chị Hoa đổi B5 (1509, 13/10 → 15/10) thành 11/10 → 15/10, thì thấy dòng báo trùng với B1 và database từ chối lệnh lưu. · unit, database
- **YC5.6-NT3** Khi Chị Hoa sửa ghi chú của B1 mà không đổi ngày, thì lưu được, không báo trùng với chính B1 (QT1.2). · database
- **YC5.6-NT4** Khi Chị Hoa sửa tiền phòng của đặt phòng 1509 từ 31/10 tới 02/11 từ 2.200.000đ thành 2.000.000đ, thì đêm 31/10 và 01/11 mỗi đêm 1.000.000đ, doanh thu tháng 10 và tháng 11 mỗi tháng nhận 1.000.000đ từ đặt phòng này (QT4.2). · database
- **YC5.6-NT5** Khi Chị Hoa đổi ngày của B1 từ 10/10 → 12/10 sang 11/10 → 13/10, thì Sale Hùng có thông báo "chủ sửa đặt phòng" ghi ngày cũ và ngày mới. · database
- **YC5.6-NT6** Khi Chị Hoa đổi tiền phòng của B1 từ 2.200.000đ thành 1.800.000đ, thì giá bán của Sale Hùng cho B1 vẫn 2.600.000đ như đã báo khách, và thông báo cho Hùng ghi tiền phòng mới 1.800.000đ. · database
- **YC5.6-NT7** Khi Chị Hoa mở sửa (hay xóa) đặt phòng từ chi tiết ngày 13/10 rồi lưu (hay xóa) xong, thì app về lại chi tiết ngày 13/10, không về đầu tab Lịch. · unit
- **YC5.6-NT8** Khi Sale Hùng hay Anh Tuấn gửi lệnh sửa B1, thì database từ chối và B1 không đổi. · database
- `[r4 · thêm]` **YC5.6-NT9** Khi Chị Hoa đổi căn của B1 (Sale Hùng chỉ được xem 1509) sang 3402, thì database từ chối với câu "Sale này không được xem căn này" và B1 không đổi. · database
- `[r4 · thêm]` **YC5.6-NT10** Khi Chị Hoa chỉ sửa ghi chú của B1, thì Sale Hùng không có thông báo mới, tiền từng đêm của B1 giữ nguyên. · database
- `[r4 · thêm]` **YC5.6-NT11** Khi Chị Hoa mở sửa B1, thì ô người đặt "Sale Hùng" khóa, không đổi được. · unit

## YC5.7 · Xóa đặt phòng khách lẻ

Bản 1 · rủi ro: cao · Màn: CN3-02

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 30 | Bấm "Xóa đặt phòng" ở B5 (khách lẻ) | Hỏi "Xác nhận xóa đặt phòng? Ngày 13/10 → 15/10 của 1509 trống lại." với hai nút "Xóa" và "Không" (quy tắc "Xóa phải bấm hai lần") | Không |
| 31 | Bấm "Xóa" | Quay về đúng màn đã mở chi tiết đặt phòng, toast "Đã xóa đặt phòng" | Lệnh xóa đặt phòng: chỉ chủ nhà giữ căn, chỉ đặt phòng không có sale; ghi nhật ký thay đổi; xóa dòng, các đêm trống lại. Không báo ai |
| 32 | Lệnh xóa đặt phòng có sale gửi thẳng tới database | (app không có nút) | Từ chối "Đặt phòng của sale không xóa được, hãy xin hủy" |

Tiêu chí:
- **YC5.7-NT1** Khi Chị Hoa bấm "Xóa đặt phòng" lần đầu ở B5, thì app hỏi xác nhận và B5 chưa bị xóa. · unit
- **YC5.7-NT2** Khi Chị Hoa xác nhận xóa B5, thì đêm 13/10 và 14/10 của 1509 trống lại và ghi được đặt phòng mới vào đó. · database, E2E
- **YC5.7-NT3** Khi Chị Hoa mở B1 (thành từ yêu cầu của Sale Hùng), thì không có nút "Xóa đặt phòng", vẫn có "Sửa" và "Xin hủy". · unit
- **YC5.7-NT4** Khi lệnh xóa B1 gửi thẳng tới database, thì bị từ chối, B1 còn nguyên và đêm 10/10, 11/10 của 1509 vẫn kín. · database
- **YC5.7-NT5** Khi Chị Hoa mở đặt phòng chị ghi giúp Sale Hùng (YC5.4-NT1), thì không có nút "Xóa đặt phòng"; lệnh xóa gửi thẳng tới database bị từ chối. · unit, database

## YC5.8 · Hủy đặt phòng có sale

Bản 1 · rủi ro: cao · Màn: chưa có hình

Đặt phòng có sale đứng tên (thành từ yêu cầu của sale, hay chủ nhà ghi giúp sale) không ai tự bỏ được: một bên xin hủy, bên kia đồng ý (QD12). Vị trí nút "Xin hủy" và khối trả lời ở chi tiết đặt phòng của chủ nhà (CN3-02) và của sale: chưa có hình ([MỞ: YC5-H17]).

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 33 | Một bên bấm "Xin hủy" | Hỏi lại "Xin hủy đặt phòng 1509 · 10/10 → 12/10? Sale Hùng phải đồng ý thì mới hủy." rồi nhãn "Chờ đồng ý hủy" ở cả hai bên. Đêm vẫn kín | Lệnh xin hủy: chỉ chủ nhà giữ căn hoặc sale của đặt phòng; đặt phòng đang hiệu lực, chưa từng bị từ chối hủy; ghi ai xin, lúc nào; trigger ghi thông báo "xin hủy" cho bên kia |
| 34 | Bên kia mở đặt phòng | Dòng "<tên người xin> xin hủy đặt phòng này", hai nút "Đồng ý hủy", "Không đồng ý". Bên xin chỉ thấy nhãn "Chờ đồng ý hủy" | Không |
| 35 | Bấm "Đồng ý hủy" | Nhãn "Đã hủy" ở cả hai bên; đặt phòng vẫn nằm trong danh sách | Lệnh trả lời xin hủy (đồng ý): trạng thái đã hủy; các đêm thôi chiếm lịch nên bán được cho khách khác; không còn tính vào doanh thu, đêm có khách, tiền chênh; trigger ghi thông báo "trả lời xin hủy" cho bên xin |
| 36 | Bấm "Không đồng ý" | Đặt phòng như cũ, dòng "Bị từ chối hủy" ở cả hai bên; không còn nút "Xin hủy" | Lệnh trả lời xin hủy (không đồng ý): về hiệu lực, ghi lúc từ chối; không cho xin hủy lại. Ngoài app hai bên tự làm việc với nhau (Tùng, bản Zalo 03/11/2026) |
| 37 | Không ai trả lời | Nhãn "Chờ đồng ý hủy" giữ nguyên | [MỞ: YC5-H18] Xin hủy có hết hạn không. Tới khi có câu trả lời, không hết hạn |

Đặt phòng khách lẻ không có nút "Xin hủy"; chủ nhà xóa theo mục trên. Xin hủy đặt phòng đã qua ngày trả: [MỞ: YC5-H14], database đang cho. Sale đã bị ngừng cho xem xin hủy được không: [MỞ: YC5-H15], database đang cho (QD7 giữ đặt phòng cũ của sale). Bên kia đã xóa tài khoản thì xin hủy thế nào: [MỞ: YC5-H16]. Sửa, ghi đã thu đủ khi đặt phòng đang chờ hủy hay đã hủy: [MỞ: YC5-H7]; database đang cho sửa khi chờ hủy, chặn khi đã hủy.

Tiêu chí:
- **YC5.8-NT1** Khi Sale Hùng xin hủy B1 và xác nhận, thì B1 có nhãn "Chờ đồng ý hủy" ở cả Chị Hoa và Hùng, đêm 10/10, 11/10 của 1509 vẫn kín, và Chị Hoa có thông báo xin hủy. · database, unit
- **YC5.8-NT2** Khi Chị Hoa bấm "Đồng ý hủy" ở B1 đang chờ hủy, thì B1 có nhãn "Đã hủy" ở cả hai bên, đêm 10/10, 11/10 trống lại, ghi được đặt phòng mới vào đó, và B1 không còn tính vào doanh thu, đêm có khách, tiền chênh. · database
- **YC5.8-NT3** Khi Chị Hoa bấm "Không đồng ý" ở B1 đang chờ hủy, thì B1 như trước, có dòng "Bị từ chối hủy", và lệnh xin hủy B1 lần nữa (của bất kỳ bên nào) bị database từ chối. · database
- **YC5.8-NT4** Khi Sale Hùng đã xin hủy B1, thì chính Hùng gửi lệnh đồng ý hủy bị database từ chối. · database
- **YC5.8-NT5** Khi Sale Lan hay Anh Tuấn gửi lệnh xin hủy B1, thì database từ chối và B1 không đổi. · database
- **YC5.8-NT6** Khi Chị Hoa mở B5 (khách lẻ), thì không có nút "Xin hủy"; lệnh xin hủy B5 gửi thẳng tới database bị từ chối "Đặt phòng này không cần xin hủy". · unit, database

## YC5.9 · Phía sale: đặt phòng chủ nhà ghi giúp

Bản 1 · rủi ro: cao · Màn: chưa có hình

Màn phía sale (thông báo, chi tiết đặt phòng, sửa giá bán) chưa có hình: [MỞ: YC5-H11]. Phần database làm được ngay.

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 38 | Sale Hùng mở thông báo "Chị Hoa ghi đặt phòng cho bạn" | Mở chi tiết đặt phòng phía sale: căn, ngày ở, giá chủ nhà, giá bán cho khách, tiền chênh, tình trạng cọc (nếu chủ nhà bật) | Sale đọc phần đặt phòng dành cho sale, không có tiền cọc, không có khách chủ nhà nhập |
| 39 | Sale Hùng sửa giá bán rồi lưu | Giá bán và tiền chênh đổi theo | Lệnh ghi giá bán: chỉ sale của đặt phòng ghi được giá bán của mình. Chủ nhà không thấy giá bán |

Giá bán nhỏ hơn tiền phòng (tiền chênh âm) được không, và sale đã bị ngừng có sửa giá bán không: [MỞ: YC5-H10].

Tiêu chí:
- **YC5.9-NT1** Khi Sale Hùng sửa giá bán của đặt phòng ở YC5.4-NT1 thành 2.400.000đ, thì tiền chênh là 600.000đ, và Chị Hoa vẫn chỉ thấy tiền phòng 1.800.000đ, không thấy giá bán. · database
- **YC5.9-NT2** Khi Sale Lan gửi lệnh sửa giá bán của đặt phòng của Sale Hùng, hoặc Chị Hoa gửi lệnh ghi giá bán, thì giá bán của Hùng không đổi. · database

## Màn hình

Hình: `python3 scripts/trich-man.py <mã>`. Chữ và số trên hình lệch YC thì YC đúng.

- **CN4 · Thêm đặt phòng.** Hình đúng bố cục. Lệch với story: hàng "Phòng" trên hình có chip "2501" (bộ mẫu chỉ có 1509, 3402); dòng kiểm ngày trên hình là ví dụ 09/10.
- **CN4-01 · Tiền phòng bỏ trống.** Như CN4, ô tiền phòng viền đỏ, dòng "Nhập tiền phòng trước khi lưu".
- **CN4-03 · Đã lưu.** Tab Lịch sau khi lưu, chi tiết ngày mở sẵn, toast. Vị trí toast trên hình là của bản Zalo (dưới cụm "··· ✕"); bản PWA đặt ngay dưới thanh tiêu đề của app (HV8).
- **CN3 · Chi tiết một ngày.** Chỉ phần nút trên dòng căn trống (bước 1b); phần còn lại thuộc YC2. Chữ trên nút: "Đặt phòng", không phải "Thêm khách" như hình.
- Màn báo trùng (dòng đỏ ở bước 4, 11) chưa có hình: dùng kiểu dòng lỗi của CN4-01 tại vị trí dòng kiểm ngày.
- **CN3-02 · Chi tiết đặt phòng.** Đúng bố cục. Hình chưa có nút "Sửa", "Xóa đặt phòng", "Xin hủy" (chỗ đặt theo bố cục chung, YC5-H17).
- **CN3-02-01 · Đặt phòng của sale đã xóa tài khoản.** Đúng.
- **CN4-02 · Sửa đặt phòng.** Hình dùng ví dụ 09/10 → 10/10 và chip "2501": dữ liệu thật theo đặt phòng đang sửa.
- **S3-10 · Sale xem đặt phòng chủ nhà vừa sửa.** Thẻ vàng trên hình ghi "Giá bán tính lại theo mức cộng": sai, giá bán giữ nguyên (Tùng, bản Zalo 04/11/2026 điểm 1). Màn phía sale khác: chưa có hình (YC5-H11).

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Tạo từ các story US3, US10, US28, US35 đã gộp (QD20) và tách đặc tả khỏi việc (QD21) | Cả file |
| r2 | 2026-11-19 | Claude | US27-nguoi-dat | YC5.2 bản 2: ô tên, số điện thoại khách lẻ, không ô khách khi chọn sale, cọc không bắt buộc (trả lời YC5-H1, H2, H12, H19, Claude tự chốt, QD25) | YC5.2, YC5.3 Luật kiểm |
| r3 | 2026-11-19 | Claude | US30-chi-tiet-dat-phong | YC5.5 bản 2: khách lẻ có số thì hiện số và nút Gọi khách (Claude tự quyết, QD25, theo YC5-H2) | YC5.5 |
| r4 | 2026-11-19 | Claude | US31 chuẩn bị | YC5.6 bản 2: trả lời YC5-H3, H4, H5, H6, H8, H9 (Claude tự chốt, QD25); thêm NT9, NT10, NT11 | YC5.6 |
