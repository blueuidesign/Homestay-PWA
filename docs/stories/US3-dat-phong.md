# US3 · Đặt phòng của chủ nhà: ghi, xem, sửa, xóa, thu tiền, hủy với sale

- Loại: tính năng
- Trạng thái: chờ code
- Đặc tả: đã viết lại
- Bản: 1
- Rủi ro: cao (chặn trùng, tiền, quyền giữa chủ nhà và sale)
- Làm sau khi xong: US2 (lịch tháng và chi tiết ngày), US4 (bảng giá tháng); phần có sale đứng tên cần US5 (kết nối sale)
- Kiểm tay: `tests/kich-ban/US3.md`

## Mục tiêu

Là chủ nhà, tôi muốn ghi một đặt phòng vào lịch chỉ trong vài chạm, được báo ngay khi chọn trùng đêm đã có khách, và có sẵn tiền phòng theo bảng giá, để không bao giờ nhận hai khách cho một đêm và không phải tự cộng tiền. Sau đó tôi muốn xem lại, sửa, ghi đã thu tiền, và bỏ đặt phòng khi khách hủy, mà sale của đặt phòng đó luôn được biết.

Vì sao quan trọng: chủ nhà hiện ghi lịch bằng sổ tay hoặc nhóm Zalo. Trùng phòng là lỗi đắt nhất của nghề (khách đến không có phòng, mất uy tín với sale). Vì vậy chặn trùng phải nằm ở database, không chỉ ở giao diện: mọi đường ghi (app, lệnh gửi thẳng, hai máy bấm cùng lúc) đều đi qua cùng một ràng buộc.

Đặt phòng có sale đứng tên là của chung hai người: sale đã báo giá cho khách, có tiền chênh, có thống kê. Vì vậy chủ nhà không tự xóa được đặt phòng đó; muốn bỏ thì xin hủy và sale đồng ý (QD-012). Chủ nhà sửa được, nhưng mỗi lần đổi ngày hay tiền thì sale được báo, và giá sale đã bán cho khách giữ nguyên.

## Luồng chính

Hôm nay là 07/10/2026. Chị Hoa có khách lẻ gọi đặt căn 1509 từ 31/10 tới 02/11. Chị mở tab Lịch, bấm "Đặt phòng". Form "Thêm đặt phòng" mở ra. Chị chạm chip "1509", chọn ngày nhận 31/10, chạm chip "2 đêm": ngày trả tự thành 02/11 và dòng "✓ 31/10 → 02/11 (2 đêm) · không trùng lịch" hiện ra. Ô "Tiền phòng (đ)" đã điền sẵn 2.200.000, bên dưới tách "31/10: 1.300.000đ" và "01/11: 900.000đ" (đêm 31/10 là thứ Bảy nên tính giá cuối tuần). Chị chạm chip "Khách lẻ", giữ "Chưa cọc", bấm "Thêm đặt phòng". App về tab Lịch, toast "Đã thêm đặt phòng Khách lẻ · 1509" hiện ở đầu màn, ngày 31/10 mở sẵn chi tiết. Từ lúc đó mọi sale được chia sẻ căn 1509 thấy đêm 31/10 và 01/11 là "Kín".

Nếu Chị Hoa chọn 1509 từ 11/10 tới 13/10, dòng kiểm hiện báo trùng vì đêm 11/10 đã thuộc đặt phòng B1 của Sale Hùng. Dù app có lỗi để lọt lệnh lưu, database vẫn từ chối.

Sale Hùng gọi báo khách của B1 hủy. Chị Hoa chạm ô 10/10, chạm dòng 1509 để mở chi tiết B1, bấm "Xin hủy" và xác nhận. B1 hiện nhãn "Chờ đồng ý hủy" ở cả hai bên. Sale Hùng mở thông báo, bấm "Đồng ý hủy": B1 thành "Đã hủy", đêm 10/10 và 11/10 của 1509 trống lại và bán được cho khách khác.

## Phạm vi

Story này làm:
- Mở form từ hai chỗ: nút "Đặt phòng" ở tab Lịch (CN1), và nút trên dòng căn trống ở chi tiết ngày (CN3).
- Chọn căn, ngày, số đêm; kiểm trùng sớm trên form; chặn trùng ở database khi lưu.
- Người đặt là **khách lẻ** (có hoặc không có tên) hoặc một **sale đã kết nối** (chủ nhà ghi giúp sale).
- Tiền phòng điền sẵn theo bảng giá, chủ nhà sửa được, bắt buộc có.
- Trạng thái tiền, tiền cọc, số khách, giờ nhận trả, ghi chú.
- Lưu, chống bấm hai lần, mất mạng khi lưu.
- Chi tiết đặt phòng (CN3-02), ghi đã thu đủ và hoàn tác.
- Sửa đặt phòng (CN4-02), báo sale khi chủ nhà sửa đặt phòng có sale.
- Xóa đặt phòng khách lẻ. Hủy đặt phòng có sale đứng tên: một bên xin, bên kia đồng ý (QD-012).
- Phía sale của đặt phòng chủ nhà ghi giúp: sale xem và sửa giá bán của mình.

Không làm (dễ tưởng thuộc story này):
- Hàng chip sale đã kết nối trên form (thứ tự, sale nào hiện, US5-NT13) và chip "+ Sale mới" (thêm sale bằng tay): US5.
- Lịch tháng tô đêm có khách, lọc theo căn, chi tiết ngày của căn có khách: US2.
- Sale thấy "Kín" ở lịch của sale (US6-NT11): US6.
- Sale gửi yêu cầu đặt phòng, chủ nhà chấp nhận thành đặt phòng: US15. Đặt phòng thành từ yêu cầu được xem, sửa, thu tiền, hủy theo story này.
- Ghi, sửa, xóa đặt phòng cho căn tự nhập của sale: US16.
- Màn thông báo (P13, popup khi mở app), công tắc từng loại thông báo: US21. Story này chỉ bảo đảm database ghi thông báo đúng lúc.
- Danh sách "Đặt phòng của tôi" và thống kê của sale: US18.
- Thông báo cho sale khi đặt phòng mới làm yêu cầu của họ bị từ chối, hoặc chiếm đêm của căn họ đã gửi khách: database tự làm khi lưu (bước 9); màn thông báo thuộc US21, phần yêu cầu thuộc US15.

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
| 5 | Xem hàng chip "Khách / Sale" | Thứ tự chip: "+ Sale mới", "Khách lẻ", các sale đang kết nối (US5), rồi các tên khách lẻ chủ nhà đã nhập trước đây (mới nhất trước, tối đa 10). Chưa chip nào được chọn | Đọc tên khách chủ nhà đã nhập từ `booking_rieng` của chính chủ nhà qua RLS |
| 6 | Chạm "Khách lẻ" | Chọn khách lẻ không tên | Không |
| 6b | Chạm một tên khách đã dùng (ví dụ "Dung Đỗ") | Chọn khách lẻ có tên đó | Không |
| 6c | Chạm một chip sale (ví dụ "Sale Hùng") | Chọn sale đó làm người đặt. Dòng nhỏ dưới hàng chip: "Đặt phòng của Sale Hùng: Hùng được báo và thấy đặt phòng này như của mình." | Không |

Chưa chọn người đặt thì nút "Thêm đặt phòng" không bấm được. Cách nhập một tên khách mới chưa có trên hàng chip: [MỞ: US3-H1].

Chủ nhà ghi tên, số khách cho đặt phòng có sale ở đâu: [MỞ: US3-H12]. Tới khi có câu trả lời, chọn sale thì không nhập được tên khách. Chip "+ Sale mới": US5.

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
| 9 | Bấm "Thêm đặt phòng" | Nút chuyển trạng thái đang lưu, không bấm lại được. Gửi kèm một mã lần gửi (`client_id`) app tự sinh khi mở form | `fn_chu_ghi_booking`: kiểm người gọi giữ căn đó; kiểm dữ liệu (mục Luật kiểm); ghi `booking`; ràng buộc `booking_khong_trung` từ chối nếu trùng đêm; ghi tiền từng đêm vào `booking_dem` theo QT4.2; ghi tên, số khách vào `booking_rieng` của chủ nhà; yêu cầu đặt phòng đang chờ có đêm trùng thành bị từ chối (QT1.4, giả định GD11); cập nhật giờ lịch đổi của căn (`can.lich_cap_nhat_luc`). Trigger ghi thông báo cho sale có căn đã gửi khách trùng đêm. Người đặt là sale: kiểm sale đang kết nối và được chia sẻ căn này; ghi giá bán điền sẵn của sale vào phần riêng của sale (mục Ghi đặt phòng cho sale); trigger ghi thông báo "chủ ghi đặt phòng cho bạn" cho sale đó |
| 10 | (lưu được) | Về tab Lịch (CN4-03), tháng chứa ngày nhận, ngày nhận đang chọn và chi tiết ngày mở sẵn. Toast "Đã thêm đặt phòng Khách lẻ · 1509" (có tên khách hay sale thì thay "Khách lẻ" bằng tên đó) | Không |
| 11 | (database từ chối vì trùng) | Ở lại form, giữ mọi ô đã nhập. Dòng kiểm ngày thành đỏ "Căn đã có đặt phòng trong những đêm này". Đọc lại đặt phòng của căn để dòng kiểm ở bước 4 đúng với dữ liệu mới | Trả lỗi P0001 với câu trên |
| 12 | (lỗi khác do dữ liệu) | Ở lại form, toast đỏ là câu database trả về (ví dụ "Ngày trả phải sau ngày nhận") | Trả lỗi P0001 kèm câu tiếng Việt |
| 13 | (mất mạng hoặc quá 15 giây không có trả lời) | Ở lại form, giữ dữ liệu, toast "Chưa lưu được vì mất mạng. Kiểm tra mạng rồi bấm lại." Bấm lại thì gửi **cùng** `client_id` | Nếu lần trước thực ra đã lưu, lần gửi lại trả về đặt phòng cũ, không tạo cái thứ hai |

Hai máy cùng ghi một đêm của một căn trong cùng một lúc: một lệnh lưu được, lệnh kia nhận lỗi ở bước 11. Không bao giờ cả hai cùng lưu.

### Ghi đặt phòng cho sale

Chủ nhà ghi giúp một đặt phòng cho sale đã kết nối, ví dụ khi sale gọi điện báo khách. Đặt phòng này là đặt phòng của sale (Tùng, bản Zalo: "Coi như booking của Hùng"): sale được báo, có giá bán và tiền chênh, có trong thống kê của sale; chủ nhà không xóa được (mục Xóa đặt phòng).

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 14 | Chọn chip "Sale Hùng" (bước 6c) và bấm "Thêm đặt phòng" | Như bước 9 đến 13. Toast "Đã thêm đặt phòng Sale Hùng · 1509" | Như bước 9, thêm: kiểm Sale Hùng đang kết nối với chủ nhà và được chia sẻ căn này; phần riêng của Sale Hùng có giá bán điền sẵn = tiền phòng + mức cộng của Hùng cho căn đó × số đêm (`docs/luat-chung/Nghiep_vu.md` mục 1.4, QT3.1); trigger ghi thông báo `chu_ghi_booking_cho_sale` cho Hùng |
| 15 | (Sale không còn kết nối, hay không được chia sẻ căn này) | Ở lại form, toast đỏ là câu database trả về | Từ chối với câu "Sale này không đang kết nối với bạn" hoặc "Sale này không được xem căn này" |

Giá bán điền sẵn có làm tròn lên 50.000đ khi sale bật làm tròn không: [MỞ: US3-H13]. Database đang làm tròn.

### Chi tiết đặt phòng

Mở từ dòng căn có khách ở chi tiết ngày, từ danh sách đặt phòng sắp tới (US2), từ thanh ở lịch tuần (US2).

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 16 | Mở chi tiết B1 | CN3-02: tiêu đề "Đặt phòng · Sale Hùng", "Phòng 1509", nhãn trạng thái tiền ("Đã cọc · còn thu"), "10/10 → 12/10 (2 đêm)", "Nhận 14:00 thứ 7 · trả 12:00 thứ 2" | Đọc `booking`, tiền từng đêm, phần riêng của chính chủ nhà qua RLS |
| 17 | Xem người đặt (đặt phòng có sale) | Tên sale, số điện thoại, số khách (nếu chủ nhà đã nhập), nút "Gọi sale", dòng "Khách do sale Hùng bán. Tên và số điện thoại khách chỉ sale giữ; cần gì về khách thì gọi sale." | Số điện thoại sale từ `profiles` của người đã kết nối. Khách do sale nhập không bao giờ trả về cho chủ nhà (QD-011) |
| 17b | Xem người đặt (khách lẻ) | Tên khách chủ nhà đã nhập, hoặc "Khách lẻ" | Như bước 16 |
| 18 | Bấm "Gọi sale" | Mở cuộc gọi tới số của sale (`tel:`) | Không |
| 19 | Xem mục "Tiền" | "Tiền phòng 2.200.000đ", "Đã cọc 1.000.000đ", "Còn lại 1.200.000đ" (tiền phòng trừ cọc, tính lúc hiện, không lưu). Mục "Ghi chú" nếu có | Không |
| 20 | Bấm "Đã thu đủ 1.200.000đ" (chỉ có khi chưa "Đã thanh toán") | Nhãn thành "Đã thanh toán", nút thành "Hoàn tác: chưa thu đủ" | `fn_chu_thu_du`: trạng thái tiền thành đã thanh toán, nhớ trạng thái trước. Tiền cọc giữ nguyên |
| 21 | Bấm "Hoàn tác: chưa thu đủ" | Nhãn về trạng thái trước ("Đã cọc · còn thu") | `fn_chu_hoan_tac_thu_du` |
| 22 | Mở đặt phòng của sale đã xóa tài khoản | CN3-02-01: tên cũ của sale kèm chữ đỏ nhỏ "đã xóa tài khoản", dòng "Sale Hùng đã xóa tài khoản. Đặt phòng vẫn giữ trong lịch của bạn; app không còn số điện thoại của sale này." Không có số, không có nút "Gọi sale". Đặt phòng và các đêm vẫn kín | `profiles.da_xoa_luc` có giá trị, số điện thoại đã xóa (QD-013) |
| 23 | Bấm "Sửa", "Xóa đặt phòng", "Xin hủy" | Theo các mục dưới | |

Nút trên màn theo loại đặt phòng: khách lẻ có "Sửa" và "Xóa đặt phòng"; có sale có "Sửa" và "Xin hủy", không có "Xóa đặt phòng". Đặt phòng đang chờ hủy hay đã hủy: mục Hủy đặt phòng có sale.

### Sửa đặt phòng

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 24 | Bấm "Sửa" | CN4-02: tiêu đề "Sửa đặt phòng · Sale Hùng", cùng bố cục với form thêm, điền sẵn mọi ô của đặt phòng; nút "Lưu thay đổi" | Như bước 16 |
| 25 | Đổi căn, ngày, tiền, trạng thái tiền, chi tiết | Như bước 2 đến 8c. Dòng kiểm trùng không tính chính đặt phòng đang sửa (QT1.2). Đổi căn hay ngày thì tiền phòng điền lại theo bảng giá (bước 7c) | Không |
| 26 | Bấm "Lưu thay đổi" | Nút đang lưu. Lưu được thì quay về đúng màn đã mở chức năng sửa (chi tiết ngày, danh sách sắp tới, lịch tuần), toast "Đã lưu đặt phòng" (Tùng, bản Zalo 04/11/2026 điểm 2) | `fn_chu_sua_booking`: chỉ chủ nhà giữ căn; kiểm dữ liệu như khi ghi; ràng buộc chặn trùng tự bỏ chính dòng đang sửa; tính lại tiền từng đêm (QT4.2); yêu cầu đang chờ trùng đêm mới thành bị từ chối; ghi `audit_log`; trigger ghi thông báo `chu_sua_booking` cho sale khi đổi ngày hay tiền phòng |
| 27 | (đặt phòng có sale, chủ nhà đổi tiền phòng) | Giá bán của sale giữ như sale đã báo khách, không tính lại theo mức cộng | Không đổi phần riêng của sale. Thông báo cho sale có tiền phòng cũ và mới |
| 28 | (database từ chối, mất mạng) | Như bước 11 đến 13 | Như bước 11 đến 13 |
| 29 | (đặt phòng vừa bị sửa ở máy khác sau khi mở form) | Ở lại form, toast "Đặt phòng vừa được sửa ở máy khác. Mở lại để xem bản mới." | Từ chối khi thời điểm sửa cuối (`updated_at`) khác lúc app đọc |

Tên khách, số khách chủ nhà nhập lưu bằng `fn_ghi_khach` (phần riêng của chủ nhà), cùng lúc với lưu đặt phòng.

Đổi căn của đặt phòng có sale: căn mới có phải nằm trong các căn sale được xem không: [MỞ: US3-H4]. Đổi người đặt (giữa khách lẻ và sale, hay sang sale khác): [MỞ: US3-H5]; tới khi có câu trả lời, ô người đặt khóa ở form sửa. Đổi trạng thái tiền ở form sửa thì nút "Hoàn tác" còn không: [MỞ: US3-H6]. Chỉ đổi tiền phòng mà giữ ngày thì tiền từng đêm chia lại theo bảng giá lúc nào: [MỞ: US3-H8]. Chỉ sửa ghi chú hay khách thì sale có được báo không: [MỞ: US3-H9]; database đang không báo.

### Xóa đặt phòng khách lẻ

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 30 | Bấm "Xóa đặt phòng" ở B5 (khách lẻ) | Hỏi "Xác nhận xóa đặt phòng? Ngày 13/10 → 15/10 của 1509 trống lại." với hai nút "Xóa" và "Không" (quy tắc "Xóa phải bấm hai lần") | Không |
| 31 | Bấm "Xóa" | Quay về đúng màn đã mở chi tiết đặt phòng, toast "Đã xóa đặt phòng" | `fn_chu_xoa_booking`: chỉ chủ nhà giữ căn, chỉ đặt phòng không có sale; ghi `audit_log`; xóa dòng, các đêm trống lại. Không báo ai |
| 32 | Lệnh xóa đặt phòng có sale gửi thẳng tới database | (app không có nút) | Từ chối "Đặt phòng của sale không xóa được, hãy xin hủy" |

### Hủy đặt phòng có sale

Đặt phòng có sale đứng tên (thành từ yêu cầu của sale, hay chủ nhà ghi giúp sale) không ai tự bỏ được: một bên xin hủy, bên kia đồng ý (QD-012). Vị trí nút "Xin hủy" và khối trả lời ở chi tiết đặt phòng của chủ nhà (CN3-02) và của sale: chưa có hình ([MỞ: US3-H17]).

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 33 | Một bên bấm "Xin hủy" | Hỏi lại "Xin hủy đặt phòng 1509 · 10/10 → 12/10? Sale Hùng phải đồng ý thì mới hủy." rồi nhãn "Chờ đồng ý hủy" ở cả hai bên. Đêm vẫn kín | `fn_xin_huy`: chỉ chủ nhà giữ căn hoặc sale của đặt phòng; đặt phòng đang hiệu lực, chưa từng bị từ chối hủy; ghi ai xin, lúc nào; trigger ghi thông báo `xin_huy_booking` cho bên kia |
| 34 | Bên kia mở đặt phòng | Dòng "<tên người xin> xin hủy đặt phòng này", hai nút "Đồng ý hủy", "Không đồng ý". Bên xin chỉ thấy nhãn "Chờ đồng ý hủy" | Không |
| 35 | Bấm "Đồng ý hủy" | Nhãn "Đã hủy" ở cả hai bên; đặt phòng vẫn nằm trong danh sách | `fn_tra_loi_huy(đồng ý)`: trạng thái đã hủy; các đêm thôi chiếm lịch nên bán được cho khách khác; không còn tính vào doanh thu, đêm có khách, tiền chênh; trigger ghi thông báo `tra_loi_huy_booking` cho bên xin |
| 36 | Bấm "Không đồng ý" | Đặt phòng như cũ, dòng "Bị từ chối hủy" ở cả hai bên; không còn nút "Xin hủy" | `fn_tra_loi_huy(không)`: về hiệu lực, ghi lúc từ chối; không cho xin hủy lại. Ngoài app hai bên tự làm việc với nhau (Tùng, bản Zalo 03/11/2026) |
| 37 | Không ai trả lời | Nhãn "Chờ đồng ý hủy" giữ nguyên | [MỞ: CH-004] Xin hủy có hết hạn không. Tới khi có câu trả lời, không hết hạn |

Đặt phòng khách lẻ không có nút "Xin hủy"; chủ nhà xóa theo mục trên. Xin hủy đặt phòng đã qua ngày trả: [MỞ: US3-H14], database đang cho. Sale đã bị ngừng cho xem xin hủy được không: [MỞ: US3-H15], database đang cho (QD-007 giữ đặt phòng cũ của sale). Bên kia đã xóa tài khoản thì xin hủy thế nào: [MỞ: US3-H16]. Sửa, ghi đã thu đủ khi đặt phòng đang chờ hủy hay đã hủy: [MỞ: US3-H7]; database đang cho sửa khi chờ hủy, chặn khi đã hủy.

### Phía sale: đặt phòng chủ nhà ghi giúp

Màn phía sale (thông báo, chi tiết đặt phòng, sửa giá bán) chưa có hình: [MỞ: US3-H11]. Phần database làm được ngay.

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 38 | Sale Hùng mở thông báo "Chị Hoa ghi đặt phòng cho bạn" | Mở chi tiết đặt phòng phía sale: căn, ngày ở, giá chủ nhà, giá bán cho khách, tiền chênh, tình trạng cọc (nếu chủ nhà bật) | Sale đọc qua view `v_booking_cua_sale`, không có tiền cọc, không có khách chủ nhà nhập |
| 39 | Sale Hùng sửa giá bán rồi lưu | Giá bán và tiền chênh đổi theo | `fn_ghi_khach` với giá bán: chỉ sale của đặt phòng ghi được giá bán của mình. Chủ nhà không thấy giá bán |

Giá bán nhỏ hơn tiền phòng (tiền chênh âm) được không, và sale đã bị ngừng có sửa giá bán không: [MỞ: US3-H10].

### Trạng thái màn

- Đang tải danh sách căn, đặt phòng hay giá khi mở form: theo HV1 (khung xám tại chỗ, không chặn cả màn).
- Mất mạng khi đang mở form: theo HV2; vẫn nhập được, chỉ không lưu được.
- Rời app khi đang nhập rồi quay lại: theo HV3, giữ nguyên dữ liệu đã nhập, chạy lại bước 4.
- Căn bị ẩn hoặc chủ nhà mất quyền với căn trong lúc đang nhập: lưu bị từ chối, toast "Có lỗi xảy ra. Bạn thử lại sau ít phút.", theo HV5.
- Toast: theo HV8 (vị trí, tự tắt).
- Mở chi tiết đặt phòng vừa bị xóa hay vừa hủy ở máy khác: theo HV5, về màn trước, toast "Đặt phòng này không còn".

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

Ghi đặt phòng cho sale:
- **US3-NT25** Khi Chị Hoa ghi 1509 từ 20/10 tới 22/10, tiền phòng 1.800.000đ, người đặt Sale Hùng, và mức cộng của Hùng cho 1509 là +200k (DLM.3), thì Hùng có đặt phòng đó với giá bán 2.200.000đ và tiền chênh 400.000đ (QT3.1). · database
- **US3-NT26** Khi Chị Hoa lưu đặt phòng ở US3-NT25, thì Sale Hùng có thông báo "chủ ghi đặt phòng cho bạn" kèm căn và ngày ở. · database
- **US3-NT27** Khi Chị Hoa đã ghi tên và số khách cho đặt phòng ở US3-NT25, thì Sale Hùng đọc đặt phòng đó không thấy tên và số này (QD-011). · database
- **US3-NT28** Khi Chị Hoa ghi đặt phòng với người đặt "Khách lẻ", thì không sale nào có thông báo và đặt phòng không vào thống kê của sale nào. · database
- **US3-NT29** Khi Chị Hoa ghi đặt phòng cho một sale không kết nối với chị, thì database từ chối "Sale này không đang kết nối với bạn"; khi sale chỉ được chia sẻ 3402 mà chị ghi 1509 cho sale đó, thì từ chối "Sale này không được xem căn này". · database

Chi tiết đặt phòng và thu tiền:
- **US3-NT30** Khi B1 có tiền phòng 2.200.000đ và đã cọc 1.000.000đ, thì mục Tiền ghi "Còn lại 1.200.000đ" và nút "Đã thu đủ 1.200.000đ". · unit
- **US3-NT31** Khi Chị Hoa bấm "Đã thu đủ" ở B1, thì nhãn thành "Đã thanh toán", tiền cọc vẫn 1.000.000đ và nút thành "Hoàn tác: chưa thu đủ". · database, unit
- **US3-NT32** Khi Chị Hoa bấm "Hoàn tác: chưa thu đủ" ngay sau đó, thì B1 về "Đã cọc · còn thu". · database
- **US3-NT33** Khi Sale Hùng đã xóa tài khoản và Chị Hoa mở B1, thì thấy tên "Sale Hùng" kèm "đã xóa tài khoản", không có số điện thoại và nút "Gọi sale", còn đêm 10/10, 11/10 vẫn kín. · unit, database (không còn số)
- **US3-NT34** Khi Sale Hùng gửi lệnh ghi đã thu đủ cho B1, thì database từ chối và trạng thái tiền không đổi. · database

Sửa đặt phòng:
- **US3-NT35** Khi Chị Hoa mở sửa B1, thì mọi ô hiện đúng giá trị của B1 (1509, 10/10 → 12/10, Sale Hùng, 2.200.000đ, đã cọc 1.000.000đ). · unit
- **US3-NT36** Khi Chị Hoa đổi B5 (1509, 13/10 → 15/10) thành 11/10 → 15/10, thì thấy dòng báo trùng với B1 và database từ chối lệnh lưu. · unit, database
- **US3-NT37** Khi Chị Hoa sửa ghi chú của B1 mà không đổi ngày, thì lưu được, không báo trùng với chính B1 (QT1.2). · database
- **US3-NT38** Khi Chị Hoa sửa tiền phòng của đặt phòng 1509 từ 31/10 tới 02/11 từ 2.200.000đ thành 2.000.000đ, thì đêm 31/10 và 01/11 mỗi đêm 1.000.000đ, doanh thu tháng 10 và tháng 11 mỗi tháng nhận 1.000.000đ từ đặt phòng này (QT4.2). · database
- **US3-NT39** Khi Chị Hoa đổi ngày của B1 từ 10/10 → 12/10 sang 11/10 → 13/10, thì Sale Hùng có thông báo "chủ sửa đặt phòng" ghi ngày cũ và ngày mới. · database
- **US3-NT40** Khi Chị Hoa đổi tiền phòng của B1 từ 2.200.000đ thành 1.800.000đ, thì giá bán của Sale Hùng cho B1 vẫn 2.600.000đ như đã báo khách, và thông báo cho Hùng ghi tiền phòng mới 1.800.000đ. · database
- **US3-NT41** Khi Chị Hoa mở sửa (hay xóa) đặt phòng từ chi tiết ngày 13/10 rồi lưu (hay xóa) xong, thì app về lại chi tiết ngày 13/10, không về đầu tab Lịch. · unit
- **US3-NT42** Khi Sale Hùng hay Anh Tuấn gửi lệnh sửa B1, thì database từ chối và B1 không đổi. · database

Xóa đặt phòng khách lẻ:
- **US3-NT43** Khi Chị Hoa bấm "Xóa đặt phòng" lần đầu ở B5, thì app hỏi xác nhận và B5 chưa bị xóa. · unit
- **US3-NT44** Khi Chị Hoa xác nhận xóa B5, thì đêm 13/10 và 14/10 của 1509 trống lại và ghi được đặt phòng mới vào đó. · database, E2E
- **US3-NT45** Khi Chị Hoa mở B1 (thành từ yêu cầu của Sale Hùng), thì không có nút "Xóa đặt phòng", vẫn có "Sửa" và "Xin hủy". · unit
- **US3-NT46** Khi lệnh xóa B1 gửi thẳng tới database, thì bị từ chối, B1 còn nguyên và đêm 10/10, 11/10 của 1509 vẫn kín. · database
- **US3-NT47** Khi Chị Hoa mở đặt phòng chị ghi giúp Sale Hùng (US3-NT25), thì không có nút "Xóa đặt phòng"; lệnh xóa gửi thẳng tới database bị từ chối. · unit, database

Hủy đặt phòng có sale:
- **US3-NT48** Khi Sale Hùng xin hủy B1 và xác nhận, thì B1 có nhãn "Chờ đồng ý hủy" ở cả Chị Hoa và Hùng, đêm 10/10, 11/10 của 1509 vẫn kín, và Chị Hoa có thông báo xin hủy. · database, unit
- **US3-NT49** Khi Chị Hoa bấm "Đồng ý hủy" ở B1 đang chờ hủy, thì B1 có nhãn "Đã hủy" ở cả hai bên, đêm 10/10, 11/10 trống lại, ghi được đặt phòng mới vào đó, và B1 không còn tính vào doanh thu, đêm có khách, tiền chênh. · database
- **US3-NT50** Khi Chị Hoa bấm "Không đồng ý" ở B1 đang chờ hủy, thì B1 như trước, có dòng "Bị từ chối hủy", và lệnh xin hủy B1 lần nữa (của bất kỳ bên nào) bị database từ chối. · database
- **US3-NT51** Khi Sale Hùng đã xin hủy B1, thì chính Hùng gửi lệnh đồng ý hủy bị database từ chối. · database
- **US3-NT52** Khi Sale Lan hay Anh Tuấn gửi lệnh xin hủy B1, thì database từ chối và B1 không đổi. · database
- **US3-NT53** Khi Chị Hoa mở B5 (khách lẻ), thì không có nút "Xin hủy"; lệnh xin hủy B5 gửi thẳng tới database bị từ chối "Đặt phòng này không cần xin hủy". · unit, database

Phía sale:
- **US3-NT54** Khi Sale Hùng sửa giá bán của đặt phòng ở US3-NT25 thành 2.400.000đ, thì tiền chênh là 600.000đ, và Chị Hoa vẫn chỉ thấy tiền phòng 1.800.000đ, không thấy giá bán. · database
- **US3-NT55** Khi Sale Lan gửi lệnh sửa giá bán của đặt phòng của Sale Hùng, hoặc Chị Hoa gửi lệnh ghi giá bán, thì giá bán của Hùng không đổi. · database

## Luật kiểm dữ liệu và lỗi

Database là chỗ chặn thật; app chặn trước cho người dùng thấy sớm. Mọi câu lỗi dưới đây database trả bằng mã P0001 để app hiện nguyên câu (`docs/luat-chung/Nghiep_vu.md` mục 1.6).

| Ô | Bắt buộc | Luật | Câu lỗi khi sai |
|---|---|---|---|
| Căn | có | Căn có lịch, của chính người gọi, chưa ẩn | (lỗi quyền, app hiện câu chung) |
| Ngày nhận, ngày trả | có | Ngày trả sau ngày nhận; tối đa 365 đêm. Ngày nhận trong quá khứ được phép (ghi bù) | "Ngày trả phải sau ngày nhận" · "Một đặt phòng dài tối đa 365 đêm" |
| Người đặt | có | Khách lẻ (tên có hoặc không), hoặc sale đang kết nối và được chia sẻ căn này | (app chặn; database coi thiếu sale là khách lẻ) · "Sale này không đang kết nối với bạn" · "Sale này không được xem căn này" |
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

Sửa, xóa, thu tiền, hủy:

| Việc | Luật | Câu lỗi khi sai |
|---|---|---|
| Sửa | Chỉ chủ nhà giữ căn; đặt phòng chưa hủy; đặt phòng chưa bị sửa ở máy khác kể từ lúc mở form | "Đặt phòng đã hủy, không sửa được" · "Đặt phòng vừa được sửa ở máy khác. Mở lại để xem bản mới." |
| Xóa | Chỉ đặt phòng khách lẻ của căn mình | "Đặt phòng của sale không xóa được, hãy xin hủy" |
| Đã thu đủ | Đặt phòng chưa hủy, chưa "Đã thanh toán" | "Không đánh dấu được đặt phòng này" |
| Hoàn tác thu đủ | Đặt phòng đang "Đã thanh toán" do bấm "Đã thu đủ" | "Đặt phòng này chưa ghi đã thu đủ" |
| Xin hủy | Đặt phòng có sale, đang hiệu lực, chưa từng bị từ chối hủy | "Đặt phòng này không cần xin hủy" · "Đặt phòng đang chờ hủy hoặc đã hủy" · "Đã bị từ chối hủy, không xin hủy lại được" |
| Trả lời xin hủy | Bên không phải bên xin; đặt phòng đang chờ hủy | "Không có lời xin hủy nào chờ bạn" · "Người kia phải trả lời lời xin hủy của bạn" |
| Giá bán của sale | Số nguyên đồng lớn hơn 0 | "Giá bán phải lớn hơn 0" |

Tiền phòng 0 đồng (chủ nhà cho người quen ở miễn phí) có được ghi không: [MỞ: US3-H3]. Tới khi có câu trả lời, database chặn.

## Quyền

Theo `docs/luat-chung/PQ.md`. Mỗi dòng dưới đây có test vi phạm ở lớp database.

- PQ7.CHU: chỉ người giữ căn ghi được đặt phòng cho căn đó. Chủ nhà khác, sale được chia sẻ, người chưa đăng nhập đều không ghi được (US3-NT23).
- PQ9: tên, số khách chủ nhà nhập chỉ chủ nhà đó đọc được (QD-011). Sale không thấy (US3-NT24); chủ nhà khác không thấy (US3-NT20).
- PQ8.SALE: sale không thấy tiền phòng, tiền cọc của đặt phòng khách lẻ (US3-NT24).
- PQ4.SALE: sale được chia sẻ căn thấy đêm đó kín (hiển thị ở US6).
- PQ7.CHU: chỉ chủ nhà giữ căn sửa, xóa, xin hủy đặt phòng của căn đó (US3-NT42). Không xóa đặt phòng có sale (US3-NT46, US3-NT47).
- PQ7.SALE: sale của đặt phòng chỉ xin hủy, trả lời xin hủy; không sửa, không xóa (US3-NT42, US3-NT52). Sale khác không đụng tới được (US3-NT52).
- PQ8.SALE: sale không ghi được đã thu đủ (US3-NT34).
- PQ9.SALE: sale không thấy khách chủ nhà nhập trên đặt phòng của mình (US3-NT27).
- PQ11.CHU, PQ11.SALE: giá bán chỉ sale của đặt phòng thấy và sửa; chủ nhà không thấy, không sửa được (US3-NT54, US3-NT55).
- PQ17.CHU: chủ nhà chỉ ghi đặt phòng cho sale đang kết nối và được xem căn đó (US3-NT29).

## Database

Bảng: `booking` (phần hai bên cùng thấy), `booking_dem` (tiền từng đêm), `booking_rieng` (khách của người nhập). Ý định và bất biến: `docs/Thiet_ke_DB.md` mục 3, điều 2, 6, 10. Cột và tham số: `docs/tu-sinh/Bang_va_cot.md`.

Đã có và đã chạy test:
- `fn_chu_ghi_booking(p jsonb)`: ghi đặt phòng. Test ở `tests/db/t_03_chan_trung.sql`, `t_04_tien_phong.sql`, `t_01_phan_quyen.sql`.
- Ràng buộc `booking_khong_trung`, chống gửi trùng bằng `client_id`, chia tiền theo đêm, từ chối yêu cầu trùng.
- `fn_chu_sua_booking(p_id uuid, p jsonb)`, `fn_chu_xoa_booking(p_id uuid)`, `fn_chu_thu_du(p_id uuid)`, `fn_chu_hoan_tac_thu_du(p_id uuid)`: test ở `t_10_thong_ke.sql`, `t_08_thong_bao.sql`, `t_03_chan_trung.sql`.
- `fn_xin_huy(p_id uuid)`, `fn_tra_loi_huy(p_id uuid, p_dong_y boolean)`: test ở `t_05_yeu_cau_huy_khach.sql`, `t_08_thong_bao.sql`, `t_10_thong_ke.sql`.
- `fn_ghi_khach(p_booking uuid, p jsonb)`: phần riêng của người gọi trên một đặt phòng (khách; với sale là giá bán). Chưa có test.
- `gia_ban_goi_y`: giá bán điền sẵn khi chủ nhà ghi cho sale. Trigger `tb_booking`: thông báo `chu_ghi_booking_cho_sale`, `chu_sua_booking`, `xin_huy_booking`, `tra_loi_huy_booking`.
- View `v_booking_cua_sale`: đặt phòng sale đọc được.

**Database đang lệch story, phải sửa trong PR của story này** (thêm migration mới, test, và dòng trong `scripts/thu-lam-hong.sh`):
1. `fn_chu_ghi_booking` tự điền tiền phòng theo bảng giá khi lệnh không gửi `tien_phong`. Story đòi từ chối (US3-NT15). Sửa: bắt buộc `tien_phong`.
2. Chưa có hàm cho app lấy giá từng đêm của căn mình (`gia_dem` là hàm nội bộ). Thêm `fn_chu_gia_cac_dem(p_can uuid, p_nhan date, p_tra date)` trả danh sách {đêm, giá hoặc null}, chỉ cho người giữ căn (US3-NT12, US3-NT16).
3. Tiền cọc lớn hơn tiền phòng đang bị ràng buộc bảng chặn, nhưng lỗi ra mã 23514, app chỉ hiện câu chung. Sửa: hàm kiểm trước và báo P0001 "Tiền cọc không được lớn hơn tiền phòng" (US3-NT18). Tương tự cho ngày dài hơn 365 đêm (chưa kiểm), số khách ngoài 1 đến 99 (bảng chỉ chặn số ≤ 0), tên khách quá 100 ký tự (chưa kiểm).
4. Ghi chú: bảng cho 1.000 ký tự, story nói 500. Sửa ràng buộc về 500.
5. Lỗi khi căn không phải của người gọi đang dùng mã 42501 với câu "Bạn không ghi được đặt phòng cho căn này". Giữ mã 42501 (app hiện câu chung) để không lộ căn có tồn tại hay không.
6. Ghi cho sale: `fn_chu_ghi_booking` chỉ kiểm sale đang kết nối, chưa kiểm sale được chia sẻ căn đó (kết nối "chỉ vài căn"). Sửa: kiểm như `my_shared_can_ids()` của sale đó; câu "Sale này không được xem căn này" (US3-NT29).
7. `fn_chu_sua_booking` chưa kiểm đặt phòng bị sửa ở máy khác. Sửa: nhận `updated_at` app đã đọc, khác thì từ chối với câu ở mục Luật kiểm. Hàm cũng chưa nhận đổi căn: thêm `can_id` (căn khác của chính chủ nhà; đặt phòng có sale thì chờ US3-H4).
8. `fn_chu_sua_booking` kiểm dữ liệu chưa như khi ghi (ngày trả sau ngày nhận, tối đa 365 đêm, cọc không lớn hơn tiền phòng, số khách): dùng chung một chỗ kiểm với `fn_chu_ghi_booking`, báo P0001.
9. `fn_ghi_khach` chưa có test. Thêm test US3-NT27, US3-NT54, US3-NT55. Hàm nhận giá bán nhưng chưa kiểm lớn hơn 0 bằng câu tiếng Việt (bảng chỉ có ràng buộc).
10. `fn_chu_sua_booking` đổi trạng thái tiền bằng tay mà không xóa trạng thái nhớ để hoàn tác; bấm "Hoàn tác" sau đó có thể về trạng thái cũ sai. Sửa theo câu trả lời US3-H6; tới đó, đổi trạng thái tiền ở form sửa thì xóa trạng thái nhớ.

Đọc qua RLS, không cần hàm: căn của chủ nhà, đặt phòng chưa hủy của căn đó (để kiểm trùng sớm và điền đêm trống đầu tiên), tên khách đã nhập (`booking_rieng` của chính mình), giờ nhận trả (`profiles`).

## Màn hình

Hình: `python3 docs/thiet-ke/trich-man.py <mã>`. Chữ và số trên hình lệch story thì story đúng.

- **CN4 · Thêm đặt phòng.** Hình đúng bố cục. Lệch với story: hàng "Phòng" trên hình có chip "2501" (bộ mẫu chỉ có 1509, 3402); dòng kiểm ngày trên hình là ví dụ 09/10.
- **CN4-01 · Tiền phòng bỏ trống.** Như CN4, ô tiền phòng viền đỏ, dòng "Nhập tiền phòng trước khi lưu".
- **CN4-03 · Đã lưu.** Tab Lịch sau khi lưu, chi tiết ngày mở sẵn, toast. Vị trí toast trên hình là của bản Zalo (dưới cụm "··· ✕"); bản PWA đặt ngay dưới thanh tiêu đề của app (HV8).
- **CN3 · Chi tiết một ngày.** Chỉ phần nút trên dòng căn trống (bước 1b); phần còn lại thuộc US2. Chữ trên nút: "Đặt phòng", không phải "Thêm khách" như hình.
- Màn báo trùng (dòng đỏ ở bước 4, 11) chưa có hình: dùng kiểu dòng lỗi của CN4-01 tại vị trí dòng kiểm ngày.
- **CN3-02 · Chi tiết đặt phòng.** Đúng bố cục. Hình chưa có nút "Sửa", "Xóa đặt phòng", "Xin hủy" (chỗ đặt theo bố cục chung, US3-H17).
- **CN3-02-01 · Đặt phòng của sale đã xóa tài khoản.** Đúng.
- **CN4-02 · Sửa đặt phòng.** Hình dùng ví dụ 09/10 → 10/10 và chip "2501": dữ liệu thật theo đặt phòng đang sửa.
- **S3-10 · Sale xem đặt phòng chủ nhà vừa sửa.** Thẻ vàng trên hình ghi "Giá bán tính lại theo mức cộng": sai, giá bán giữ nguyên (Tùng, bản Zalo 04/11/2026 điểm 1). Màn phía sale khác: chưa có hình (US3-H11).

## Luật chung dùng

QT1.1 (chặn trùng theo căn), QT1.2 (sửa không trùng với chính nó), QT1.4 (yêu cầu gặp đêm đã kín), QT2 (đêm có khách), QT3.1 (giá bán, tiền chênh), QT4.1, QT4.2 (tiền phòng và chia theo đêm) ở `docs/luat-chung/QT.md`. Nhóm Booking ở `docs/luat-chung/Nghiep_vu.md`: Tiền còn lại, Xóa phải bấm hai lần, Không xóa booking của sale, Hủy cần hai bên. QD-007, QD-011, QD-012, QD-013. HV1, HV2, HV3, HV5, HV8 ở `docs/luat-chung/HV.md`. Giá một đêm: `docs/luat-chung/Nghiep_vu.md` mục 1.3. Từ ngữ: `docs/luat-chung/Tu_dien.md`.

## Câu hỏi mở và giả định

- [MỞ: US3-H1] Chủ nhà nhập tên một khách mới (chưa có trên hàng chip) ở đâu? Gợi ý: chạm "Khách lẻ" thì hiện ô "Tên khách (không bắt buộc)".
- [MỞ: US3-H2] Có ô số điện thoại khách trên form không? Database đã có chỗ lưu (`booking_rieng.sdt_khach`), canvas chưa có ô.
- [MỞ: US3-H3] Tiền phòng 0 đồng có được ghi không?
- [MỞ: CH-025] Đã chọn "Đã cọc · còn thu" thì tiền cọc có bắt buộc không?
- [MỞ: US3-H4] Đổi căn của đặt phòng có sale: căn mới có phải nằm trong các căn sale được xem không?
- [MỞ: US3-H5] Ở form sửa, đổi người đặt (giữa khách lẻ và sale, hay sang sale khác) được không, và giá bán, thông báo của sale cũ, sale mới ra sao?
- [MỞ: US3-H6] Đổi trạng thái tiền ở form sửa thì nút "Hoàn tác: chưa thu đủ" còn không?
- [MỞ: US3-H7] Sửa, ghi đã thu đủ, sửa giá bán khi đặt phòng đang chờ hủy hay đã hủy có được không?
- [MỞ: US3-H8] Chỉ đổi tiền phòng mà giữ ngày thì tiền từng đêm chia theo bảng giá lúc ghi hay bảng giá hiện tại?
- [MỞ: US3-H9] Chủ nhà chỉ sửa ghi chú hay khách của đặt phòng có sale thì sale có được báo không?
- [MỞ: US3-H10] Sale sửa giá bán nhỏ hơn tiền phòng (tiền chênh âm) được không? Sale đã bị ngừng cho xem có sửa giá bán đặt phòng cũ không?
- [MỞ: US3-H11] Màn phía sale của đặt phòng chủ nhà ghi giúp (thông báo, chi tiết, sửa giá bán) trông thế nào?
- [MỞ: US3-H12] Chủ nhà ghi tên, số khách cho đặt phòng có sale ở đâu trên form?
- [MỞ: US3-H13] Giá bán điền sẵn khi chủ nhà ghi giúp sale có làm tròn lên 50.000đ khi sale bật làm tròn không?
- [MỞ: US3-H14] Xin hủy đặt phòng đã qua ngày trả được không?
- [MỞ: US3-H15] Sale đã bị ngừng cho xem có xin hủy đặt phòng cũ được không?
- [MỞ: US3-H16] Bên kia đã xóa tài khoản thì xin hủy đặt phòng thế nào?
- [MỞ: US3-H17] Nút "Xin hủy" và khối trả lời xin hủy đặt ở đâu, chữ thế nào, ở cả chủ nhà và sale?
- [MỞ: CH-004] Xin hủy hết hạn sau bao lâu, và hết hạn thì đặt phòng thành gì?
- GD11: chủ nhà tự ghi đặt phòng trùng đêm với yêu cầu đang chờ thì yêu cầu đó thành bị từ chối.
- GD19: mở form thì chip "Chưa cọc" chọn sẵn.
- GD20: tiền cọc không được lớn hơn tiền phòng.

## Việc cần làm

- [ ] Hỏi Tùng US3-H1 đến US3-H17, CH-025, CH-004 trước khi làm phần liên quan. Phần còn lại làm được ngay theo cách tạm ghi ở từng chỗ.
- [ ] Code theo từng phần, mỗi PR một phần: (1) ghi đặt phòng khách lẻ; (2) ghi cho sale; (3) chi tiết và thu tiền; (4) sửa; (5) xóa và hủy với sale; (6) phía sale.
- [ ] Test database cho US3-NT3 (phần database), NT4 đến NT7, NT11 đến NT13, NT15, NT18, NT20, NT22 đến NT24. Chạy thấy đỏ ở các chỗ database đang lệch.
- [ ] Test database cho các tiêu chí lớp database từ US3-NT25 tới US3-NT55.
- [ ] Migration sửa 10 điểm ở mục "Database đang lệch story". Thêm dòng vào `scripts/thu-lam-hong.sh` cho: bắt buộc tiền phòng, cọc không lớn hơn tiền phòng, hàm giá từng đêm chỉ cho người giữ căn. Chạy `scripts/bang-cot.sh`.
- [ ] Unit test cho các tiêu chí lớp unit, rồi code form CN4: nối `services/api.ts` sang Supabase cho các hàm form dùng (`docs/Ghi_chu_code.md` mục 3).
- [ ] E2E: US3-NT1, US3-NT10, US3-NT44 trên staging; bỏ `fixme` ở `tests/e2e/10_chu_ghi_dat_phong.spec.ts`.
- [ ] Sửa `tests/kich-ban/US3.md` theo story này: đổi ngày sang ngày còn trong tương lai, bỏ KB10, KB11 (thuộc US2), bỏ phần nói về Zalo.
- [ ] Kịch bản kiểm tay cho phần hủy đặt phòng có sale (chưa có).
- [ ] Kiểm tay trên điện thoại thật: luồng chính, trùng đêm, sửa, xóa, xin hủy và đồng ý trên hai máy.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md`.
