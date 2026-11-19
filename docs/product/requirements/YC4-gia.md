---
id: YC4
tieu_de: Giá
trang_thai: de-xuat
nguoi_chu: tung
rev: 2
ban: 1
---
# YC4 · Giá

## Mục tiêu

Là chủ nhà, tôi muốn đặt giá đêm cho căn theo tháng (ngày thường và cuối tuần), đặt giá riêng cho ngày lễ và dịp đặc biệt, đặt một lần cho nhiều căn và chép giá từ căn này sang căn khác, để sale thấy giá mà không phải gọi hỏi, và tiền phòng của đặt phòng mới tự điền đúng.

Vì sao quan trọng: giá là thứ sale hỏi nhiều nhất sau "còn trống không". Bảng giá có hai việc: cho sale xem (YC7) và điền sẵn tiền phòng khi ghi đặt phòng (YC5). Bảng giá không bao giờ đổi tiền của đặt phòng đã ghi (quy tắc Đặt phòng giữ giá riêng), nếu không doanh thu tháng cũ và tiền sale đã báo khách sẽ tự đổi khi chủ nhà sửa giá. Hai dải giá dịp của một căn không được chồng ngày, vì khi chồng thì không ai biết đêm đó giá nào.

## Luồng chính

Hôm nay là 07/10/2026. Chị Hoa mở căn 3402, chọn tab "Giá". Mục "Giá theo tháng" của năm 2026 có 12 ô; ô "Tháng 10" ghi "800k–1,3tr", ô "Tháng 11" và "Tháng 12" ghi "Chưa đặt". Chị chạm "Tháng 11" và "Tháng 12": dòng "Đang chọn: Tháng 11 – 12 (2 tháng)". Chị gõ 800.000 ở ô "Ngày thường (CN–T5)", 1.100.000 ở ô "Cuối tuần (T6, T7)", bấm "Áp dụng cho Tháng 11 – 12". Toast "Đã áp dụng giá cho Tháng 11 – 12", hai ô tháng đổi thành "800k–1,1tr".

Chị bấm "Đặt giá ngày lễ, dịp đặc biệt", chạm "Lễ 30/4 – 1/5": ô ngày tự điền dải nghỉ lễ năm 2027 do Home247 đặt sẵn. Chị gõ giá 2.500.000, bật "Là ngày lễ", bấm "Lưu giá". Dải hiện ở mục "Giá ngày lễ".

Sau đó chị bấm "Sao chép giá sang căn khác", chọn "Giá theo tháng", chọn căn 1509, bấm sao chép. Tháng 11, 12 của 1509 thành 800k/1,1tr như 3402. Đặt phòng B1 của 1509 vẫn 2.200.000đ.

## Phạm vi

YC này gồm: giá trên thẻ căn, giá theo tháng của một căn (tab Giá), lịch giá tháng, giá ngày lễ và dịp đặc biệt, đặt giá nhiều căn, sao chép giá, những đêm tính giá cuối tuần.

Không thuộc YC này (dễ tưởng là có):
- Tiền phòng điền sẵn khi ghi đặt phòng: YC5 (dùng giá ở đây theo QT4.1).
- Sale xem giá chủ nhà và giá bán: YC7. Mức cộng của sale: YC7.
- Giá căn tự nhập do sale ghi: YC10.
- Người quản trị nạp và sửa dải ngày lễ chung: YC13. Bản đầu nạp sẵn dải năm 2026, 2027 bằng dữ liệu khởi tạo.
- Tab "Thông tin" của màn sửa căn: YC3.

## Quy tắc của nhóm

| Tên | Quy tắc | Ví dụ |
|---|---|---|
| Giá hai loại đêm | Mỗi tháng có hai giá: ngày thường và cuối tuần, cả hai bắt buộc. Đêm nào là cuối tuần theo lựa chọn ở YC4.6 (mặc định đêm T6, T7), áp cho mọi căn của chủ nhà. Tính theo đêm ở: nhận T6, trả CN là 2 đêm cuối tuần | Nhận T6 trả CN: 2 đêm cuối tuần |
| Giá theo tháng và năm | Giá đặt theo tháng, chọn nhiều tháng một lần, cho năm nay hoặc năm sau | Tháng 11 – 12 cùng 800k / 1,1tr |
| Giá dịp thay giá tháng | Đêm nằm trong một dải ngày lễ hay dịp đặc biệt của căn thì lấy giá của dải đó | 24/10 – 25/10 giá 1.300.000đ, lịch giá hiện 1,3tr |
| Giá dịp không chồng ngày | Hai dải của cùng một căn không có ngày chung. Hai dải liền nhau thì được. Chặn ở database | 24/10 – 25/10 và 25/10 – 26/10 chồng ngày 25/10 |
| Dải tối đa 10 ngày | Một dải ngày lễ hay dịp đặc biệt dài tối đa 10 ngày | 30/4 → 3/5 là 4 ngày; 13 ngày là quá |
| Dải ngày lễ do Home247 đặt | Home247 đặt sẵn dải nghỉ của từng dịp lễ mỗi năm (gồm nghỉ bù, nối cuối tuần). Chủ nhà chọn nhanh rồi sửa ngày được; sửa ở căn mình không đổi dải chung | Lễ 30/4 – 1/5 |
| Ngày lễ khác dịp đặc biệt | Công tắc "Là ngày lễ" quyết định dải nằm ở mục "Giá ngày lễ" hay "Dịp đặc biệt" | Lễ 30/4 là ngày lễ; Lễ hội Carnaval là dịp đặc biệt |
| Tên dịp tự đặt | Bỏ trống tên (khi tắt "Là ngày lễ") thì tên là "Dịp đặc biệt <ngày đầu> – <ngày cuối>" | "Dịp đặc biệt 24/10 – 25/10" |
| Sao chép thay giá có sẵn | Sao chép thay giá đang có của căn đích bằng giá căn nguồn, theo từng phần đã chọn. Tháng nguồn chưa có giá mà đích có: giữ giá đích. Dịp: đích có mà nguồn không thì giữ dịp đích; dịp nguồn chồng ngày lên dịp khác của đích thì giữ dịp đích, bỏ dịp nguồn ở căn đó. Mọi chỗ giữ lại được liệt kê trong popup có nút "Tôi đã hiểu" (Tùng, bản Zalo, 04/11/2026, điểm 6, 12, 13) | Không |
| Sale chỉ thấy giá sau khi đặt | Đêm chưa có giá thì sale thấy "Chưa có giá", không bao giờ thấy 0 | Không |
| Đặt phòng giữ giá riêng | Bảng giá chỉ dùng để điền sẵn tiền phòng khi tạo đặt phòng (QT4.1). Đổi bảng giá không đổi đặt phòng đã có | B1 giữ 2.200.000đ khi đổi giá tháng 10 |
| Luôn có giá cuối tuần | Phải chọn ít nhất một đêm cuối tuần (Tùng, bản Zalo, 04/11/2026, điểm 5: "Không bao giờ có chuyện không có giá cuối tuần. Người dùng nếu muốn setup giá chung thì cứ gõ lại giá giống ngày thường, nhưng nhất định có giá cuối tuần.") | Không |

Quy tắc dùng chung: Giá chủ nhà của một đêm (QT5.3), Viết số tiền rút gọn (`docs/product/glossary.md`), QT4.1.

## Ai được làm gì

Theo `docs/security/PQ-ma-tran-quyen.md`: PQ5 (giá chủ nhà theo đêm), PQ6 (cài đặt chung của chủ nhà), PQ21 (dải ngày lễ). Test vi phạm phải có, ở lớp database:
- Chủ nhà khác và sale đặt giá, đặt giá dịp, sao chép giá cho căn không phải của mình: YC4.2-NT6, YC4.4-NT7, YC4.5-NT6.
- Đặt giá nhiều căn có lẫn một căn không phải của mình hay căn đã xóa: không căn nào đổi (YC4.4-NT6).
- Chủ nhà sửa dải ngày lễ ở căn mình không đổi dải chung của Home247 (YC4.3-NT9).
- Đêm cuối tuần của chủ nhà chỉ chính chủ nhà đổi được (YC4.6-NT4).

## Dữ liệu

Mô hình chung: `docs/architecture/thiet-ke-db.md`. YC này cần database bảo đảm:
- Giá tháng: mỗi căn, mỗi tháng của một năm, một giá ngày thường và một giá cuối tuần, cả hai là số nguyên đồng lớn hơn 0. Áp dụng nhiều tháng là một giao dịch.
- Giá dịp: mỗi dải thuộc một căn, có ngày đầu, ngày cuối (tối đa 10 ngày), tên, giá mỗi đêm, cờ ngày lễ. Hai dải của một căn không chồng ngày: ràng buộc ở database, hai lệnh lưu cùng lúc chỉ một lệnh qua.
- Dải ngày lễ chung của Home247 theo năm: mọi người đã đăng nhập đọc được, chỉ quản trị sửa (YC13).
- Đêm cuối tuần là cài đặt của từng chủ nhà, ít nhất một đêm, mặc định T6 và T7.
- Một lệnh trả lịch giá một tháng của căn: mỗi đêm có giá, loại đêm (ngày thường, cuối tuần, ngày lễ, dịp), có khách hay không. Chỉ người giữ căn gọi được.
- Đặt giá nhiều căn và sao chép giá: một giao dịch cho mọi căn đích; có một căn không hợp lệ thì không ghi căn nào. Sao chép trả về danh sách tháng và dịp đã giữ của từng căn đích, cho popup.
- Mọi lệnh đổi giá cập nhật lúc lịch đổi của căn (độ tươi ở YC7). Không lệnh nào đổi đặt phòng đã có.
- Lỗi theo QT5.5.

## Trạng thái màn (mọi mục)

- Đang tải: theo HV1. Mất mạng: theo HV2, giữ giá đang nhập. Quay lại từ nền: theo HV3, đọc lại giá. Phiên hết hạn: HV7. Toast: HV8.
- Căn bị xóa hay mất quyền trong lúc đang đặt giá: lưu bị từ chối, theo HV5.

## YC4.1 · Giá trên thẻ căn

Bản 1 · rủi ro: thấp · Màn: CN5

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Xem thẻ một căn ở tab Căn (YC3.1) | Căn có giá: dòng "Giá tuần này 900.000đ – 1.300.000đ" (giá đêm thấp nhất và cao nhất từ thứ Hai tới Chủ nhật của tuần này). Căn chưa có giá đêm nào trong tuần: "Chưa đặt giá" và nút "Đặt giá cho căn này" | Lệnh giá từng đêm của chủ nhà (YC2) cho 7 đêm của tuần |
| 2 | Bấm "Đặt giá cho căn này" | Mở tab Giá của căn đó (YC4.2) | Không |
| 3 | Bấm "Đặt giá nhiều căn" ở đầu tab Căn | Mở YC4.4 | Không |

Tiêu chí:
- **YC4.1-NT1** Khi căn chưa có giá đêm nào trong tuần này, thì thẻ ghi "Chưa đặt giá" và có nút "Đặt giá cho căn này". · unit
- **YC4.1-NT2** Khi xem tuần 05/10 – 11/10/2026, thì thẻ 1509 ghi "900.000đ – 1.300.000đ" và thẻ 3402 ghi "800.000đ – 1.100.000đ". · unit

## YC4.2 · Giá theo tháng của một căn

Bản 1 · rủi ro: cao · Màn: CN6, CN6-00, CN6-04, CN6-09

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Mở tab "Giá" của căn (từ CN5-02 hay nút ở YC4.1) | Tiêu đề "Phòng 3402", tab "Thông tin" / "Giá". Mục "Giá theo tháng" với "Năm 2026" và 12 ô tháng; mỗi ô ghi khoảng giá ("800k–1,3tr", viết rút gọn theo Tu_dien) hoặc "Chưa đặt". Dưới là mục "Giá ngày lễ", "Dịp đặc biệt", "Lịch giá tháng 10", nút "Sao chép giá sang căn khác" | Đọc giá tháng của năm và các dải giá dịp của căn |
| 2 | Chạm một hay nhiều ô tháng | Ô được chọn đổi màu. Dòng "Đang chọn: Tháng 11 – 12 (2 tháng)". Chưa chọn ô nào: "Chưa chọn tháng nào. Chọn một tháng bên trên sau đó nhập giá." | Không |
| 3 | Nhập giá | Hai ô "Ngày thường (CN–T5)" và "Cuối tuần (T6, T7)". Tên trong ngoặc theo các đêm cuối tuần đã chọn ở YC4.6 | Không |
| 4 | Bấm "Áp dụng cho Tháng 11 – 12" | Nút đang lưu. Lưu được: toast "Đã áp dụng giá cho Tháng 11 – 12", ô tháng đổi theo (CN6-04) | Ghi đè giá các tháng đã chọn trong một giao dịch; cập nhật lúc lịch đổi của căn |
| 5 | Bấm "Năm 2026" | CN6-09: chọn "Năm 2026 · Năm nay" hoặc "Năm 2027 · Năm sau" | Đọc giá của năm đã chọn |
| 6 | Xem "Lịch giá tháng 10" | Lưới tháng (Tuần bắt đầu thứ hai), mỗi ô ghi giá đêm rút gọn, ô ngày lễ, dịp, có khách có màu riêng. Chú thích: Dịp đặc biệt, Ngày lễ, Có khách. Chuyển tháng bằng "T09", "T11" | Lệnh lịch giá một tháng |
| 7 | Chạm một ngày trên lịch giá | Mở YC4.3 với ngày đó điền sẵn | Không |

Căn chưa có giá nào: CN6-00, 12 ô ghi "Chưa đặt", dòng "Căn này chưa có giá. Chọn tháng, nhập giá ngày thường và cuối tuần rồi bấm Áp dụng. Sale chỉ thấy giá sau khi bạn đặt."; mục giá ngày lễ ghi "Chưa có giá ngày lễ. Bấm "Đặt giá ngày lễ, dịp đặc biệt" để thêm, VD: Lễ 30/4 – 1/5."; mục dịp ghi "Chưa có dịp đặc biệt.".

`[r2 · sửa]` Lưu giá xong thì ở lại tab Giá (Claude tự quyết, QD25, trả lời YC4-H5).

Luật kiểm:

| Ô | Bắt buộc | Luật | Câu lỗi khi sai |
|---|---|---|---|
| Tháng | có | Ít nhất một tháng, thuộc năm nay hoặc năm sau | "Chưa chọn tháng nào" |
| Giá ngày thường, giá cuối tuần | có | Số nguyên đồng, lớn hơn 0, tối đa 100.000.000 | "Cần nhập giá ngày thường và giá cuối tuần" · "Giá phải lớn hơn 0" · "Giá mỗi đêm tối đa 100.000.000đ" |

Tiêu chí:
- **YC4.2-NT1** Khi Chị Hoa chọn Tháng 11 và Tháng 12 của 3402, nhập 800.000đ và 1.100.000đ rồi bấm áp dụng, thì đêm 06/11 (T6) có giá 1.100.000đ, đêm 09/11 (T2) có giá 800.000đ, và hai ô tháng ghi "800k–1,1tr". · database, unit
- **YC4.2-NT2** Khi chưa chọn tháng nào, thì có dòng "Chưa chọn tháng nào. Chọn một tháng bên trên sau đó nhập giá." và nút áp dụng không bấm được. · unit
- **YC4.2-NT3** Khi căn chưa có giá nào, thì thấy CN6-00 và 12 ô đều ghi "Chưa đặt". · unit
- **YC4.2-NT4** Khi chủ nhà xem lịch giá tháng 10 của 3402, thì đêm 09/10 (T6) ghi "1,1tr", đêm 08/10 (T5) ghi "800k", đêm 24/10 ghi "1,3tr" (dịp). · unit, database
- **YC4.2-NT5** Khi chủ nhà đổi sang "Năm 2027", thì 12 ô tháng hiện giá của năm 2027. · unit
- **YC4.2-NT6** Khi Anh Tuấn hay Sale Hùng gửi lệnh đặt giá tháng cho 3402, thì database từ chối và giá 3402 không đổi. · database
- **YC4.2-NT7** Khi 1509 đã có B1 (2.200.000đ) và Chị Hoa đổi giá tháng 10 của 1509, thì B1 vẫn 2.200.000đ và doanh thu tháng 10 không đổi vì B1. · database
- **YC4.2-NT8** Khi lệnh đặt giá có giá cuối tuần trống hoặc bằng 0, thì database từ chối với câu "Cần nhập giá ngày thường và giá cuối tuần" hay "Giá phải lớn hơn 0". · database

## YC4.3 · Giá ngày lễ và dịp đặc biệt

Bản 1 · rủi ro: cao · Màn: CN6-02, CN6-03, CN6-03-01

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Bấm "Đặt giá ngày lễ, dịp đặc biệt" ở tab Giá, hay chạm một ngày trên lịch giá | Tiêu đề "Giá ngày lễ, dịp đặc biệt", "Phòng 3402", hàng "Chọn nhanh ngày lễ" ("Lễ 30/4 – 1/5", "Quốc khánh 2/9", "Tết Dương lịch", "Tết Âm lịch"), ghi chú "Home247 đặt sẵn dải ngày nghỉ của từng dịp mỗi năm, gồm nghỉ bù và nối cuối tuần. Chọn xong vẫn sửa được ngày." | Đọc dải ngày lễ chung của năm đang chọn |
| 2 | Chạm một dịp chọn nhanh | Điền "Từ ngày", "Đến ngày", tên dịp, bật "Là ngày lễ", dòng "4 ngày · T5 30/4 → CN 3/5" | Không |
| 3 | Sửa dải ngày | Lưới tuần tròn từ T2 tới CN hiện các ngày đã chọn, cuối tuần có màu riêng. Chạm một ô để nới dải | Không |
| 4 | Nhập "Tên dịp" và "Giá mỗi đêm (đ)" | Bỏ trống tên khi tắt "Là ngày lễ": ô tên hiện sẵn "Dịp đặc biệt 24/10 – 25/10" (CN6-03-01) | Không |
| 5 | Bật, tắt "Là ngày lễ (hiện trong mục Giá ngày lễ)" | Bật: dải nằm ở mục "Giá ngày lễ". Tắt: nằm ở "Dịp đặc biệt" | Không |
| 6 | Chọn quá 10 ngày | CN6-03: "Tối đa 10 ngày. Đang chọn 13 ngày, hãy rút ngắn ngày kết thúc.", nút lưu không bấm được | Không |
| 7 | Bấm "Lưu giá" | Lưu được: về tab Giá, toast "Đã lưu giá Lễ 30/4 – 1/5", dải hiện ở mục tương ứng và trên lịch giá | Thêm dải cho căn; kiểm luật; tên trống thì đặt tên theo quy tắc Tên dịp tự đặt; cập nhật lúc lịch đổi |
| 8 | (dải chồng ngày với dải đã có của cùng căn) | Ở lại, dòng đỏ "Trùng ngày với Lễ hội Carnaval (24/10 – 25/10). Đổi ngày rồi lưu lại.", không lưu | Từ chối, dữ liệu không đổi |

Tên tự đặt khi bật "Là ngày lễ" mà bỏ trống tên: [MỞ: YC4-H6]. Sửa, xóa một dải đã lưu: [MỞ: YC4-H2]; bản đầu chưa làm.

Luật kiểm:

| Ô | Bắt buộc | Luật | Câu lỗi khi sai |
|---|---|---|---|
| Từ ngày, đến ngày | có | Đến ngày không trước từ ngày; tối đa 10 ngày; không chồng dải khác của căn | "Tối đa 10 ngày" · "Trùng ngày với <tên> (<từ> – <đến>). Đổi ngày rồi lưu lại." |
| Tên dịp | không | Tối đa 60 ký tự | "Tên dịp dài tối đa 60 ký tự" |
| Giá mỗi đêm | có | Số nguyên đồng lớn hơn 0, tối đa 100.000.000 | "Cần nhập giá mỗi đêm" · "Giá phải lớn hơn 0" |

Tiêu chí:
- **YC4.3-NT1** Khi chủ nhà chạm "Lễ 30/4 – 1/5", thì các ô ngày điền sẵn dải Home247 đặt cho năm đang chọn và "Là ngày lễ" bật. · unit
- **YC4.3-NT2** Khi dải dài 13 ngày, thì có cảnh báo "Tối đa 10 ngày…" và không lưu được; lệnh lưu dải 11 ngày gửi thẳng tới database bị từ chối. · unit, database
- **YC4.3-NT3** Khi chủ nhà lưu dải 24/10 – 25/10 giá 1.300.000đ, tắt "Là ngày lễ", thì dải ở mục "Dịp đặc biệt" và lịch giá ghi "1,3tr" ở hai ngày đó. · unit, database
- **YC4.3-NT4** Khi chủ nhà lưu một dải với "Là ngày lễ" bật, thì dải ở mục "Giá ngày lễ". · unit
- **YC4.3-NT5** Khi chủ nhà bỏ trống tên và lưu dải 24/10 – 25/10 với "Là ngày lễ" tắt, thì dải có tên "Dịp đặc biệt 24/10 – 25/10". · database
- **YC4.3-NT6** Khi 3402 đã có dịp 24/10 – 25/10 và chủ nhà lưu thêm dải 25/10 – 26/10 cho 3402, thì app báo trùng ngày, dải mới không được lưu, dịp cũ giữ nguyên. · unit, database
- **YC4.3-NT7** Khi hai lệnh lưu hai dải chồng ngày của cùng căn chạy cùng lúc, thì đúng một lệnh qua. · database
- **YC4.3-NT8** Khi 3402 có dịp 24/10 – 25/10 và chủ nhà lưu dải 26/10 – 27/10, thì lưu được. · database
- **YC4.3-NT9** Khi Chị Hoa lưu dải "Lễ 30/4 – 1/5" cho 3402 với ngày khác dải chung, thì dải chung của Home247 không đổi; khi Anh Tuấn hay Sale Hùng gửi lệnh thêm dải cho 3402, thì database từ chối. · database

## YC4.4 · Đặt giá nhiều căn

Bản 1 · rủi ro: cao · Màn: CN6-05, CN6-05-00, CN6-06

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Bấm "Đặt giá nhiều căn" ở tab Căn | CN6-05: "Chọn căn · đã chọn 0/2", nút "Chọn tất cả", danh sách căn chưa xóa của mình. Chưa chọn căn nào: CN6-05-00, nút dưới đáy không bấm được | Đọc căn của mình |
| 2 | Chọn căn | Nút dưới đáy "Đặt giá cho 1 căn", dòng đếm "1/2" | Không |
| 3 | Bấm "Đặt giá cho 1 căn" | CN6-06: tiêu đề "Đặt giá · 1 căn", khối "Căn áp dụng" kèm nút "Đổi căn", rồi chọn tháng, nhập giá như YC4.2 bước 2 đến 4 | Không |
| 4 | Bấm "Áp dụng" | Toast "Đã áp dụng giá cho 2 căn" | Ghi giá tháng cho mọi căn đã chọn trong một giao dịch; có một căn không hợp lệ thì không ghi căn nào |

Đặt giá ngày lễ, dịp đặc biệt cho nhiều căn: chưa có màn ([MỞ: YC4-H3]); bản đầu chưa làm.

Tiêu chí:
- **YC4.4-NT1** Khi Chị Hoa chọn 1509 trong 2 căn, thì nút dưới đáy ghi "Đặt giá cho 1 căn" và dòng đếm ghi "1/2". · unit
- **YC4.4-NT2** Khi chủ nhà bấm "Chọn tất cả", thì mọi căn chưa xóa của mình được chọn. · unit
- **YC4.4-NT3** Khi chưa chọn căn nào, thì nút dưới đáy không bấm được. · unit
- **YC4.4-NT4** Khi Chị Hoa áp dụng 800.000đ / 1.100.000đ cho tháng 12 của 1509 và 3402, thì cả hai căn có giá đó ở tháng 12. · database
- **YC4.4-NT5** Khi danh sách căn của lệnh đặt giá nhiều căn có một căn Chị Hoa đã xóa, thì database từ chối và không căn nào đổi giá. · database
- **YC4.4-NT6** Khi Chị Hoa gửi lệnh đặt giá nhiều căn gồm 1509 và Sapphire 1103 của Anh Tuấn, thì database từ chối và cả hai căn không đổi giá. · database
- **YC4.4-NT7** Khi Sale Hùng gửi lệnh đặt giá nhiều căn gồm 1509, thì database từ chối. · database

## YC4.5 · Sao chép giá sang căn khác

Bản 1 · rủi ro: cao · Màn: CN6-07, CN6-08

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Bấm "Sao chép giá sang căn khác" ở cuối tab Giá | CN6-07: "Từ căn" Phòng 3402 với tóm tắt "Giá 7 tháng · 0 ngày lễ · 1 dịp đặc biệt" | Đọc giá của căn nguồn |
| 2 | Chọn "Sao chép gì" | Ba lựa chọn bật tắt: "Giá theo tháng", "Giá ngày lễ", "Dịp đặc biệt" | Không |
| 3 | Chọn "Sang căn" | Danh sách căn khác chưa xóa của mình, nút "Chọn tất cả", đếm "Sang căn · đã chọn 0" | Không |
| 4 | Chưa chọn căn nào | Dòng cảnh báo "Giá đang có của căn được chọn sẽ được thay bằng giá của Phòng 3402."; nút ghi "Chọn căn để sao chép", không bấm được | Không |
| 5 | Chọn căn và bấm sao chép | Có chỗ giữ lại: popup liệt kê từng căn, tháng và dịp đã giữ giá cũ, nút "Tôi đã hiểu". Sau đó về tab Giá, toast "Đã sao chép giá sang 1 căn" (CN6-08) | Thay giá có sẵn của căn đích theo từng phần đã chọn, theo quy tắc Sao chép thay giá có sẵn, trong một giao dịch; trả danh sách chỗ đã giữ |

Sao chép chép năm nào (năm đang xem hay mọi năm có giá): [MỞ: YC4-H1]. Tới khi có câu trả lời, chép năm đang xem ở tab Giá.

Tiêu chí:
- **YC4.5-NT1** Khi chưa chọn căn đích, thì nút ghi "Chọn căn để sao chép" và không bấm được. · unit
- **YC4.5-NT2** Khi chủ nhà chỉ chọn "Giá theo tháng" và sao chép 3402 sang 1509, thì giá tháng của 1509 bằng 3402 ở các tháng 3402 có giá, còn dịp và ngày lễ của 1509 không đổi. · database
- **YC4.5-NT3** Khi tháng 6 của 3402 có giá, tháng 1 của 3402 chưa có giá mà tháng 1 của 1509 có giá, và chủ nhà sao chép giá tháng 3402 sang 1509, thì tháng 1 của 1509 giữ giá cũ và popup liệt kê "1509 · Tháng 1". · database, unit
- **YC4.5-NT4** Khi 1509 có dịp 01/12 – 02/12 mà 3402 không có dịp nào trùng ngày đó, và chủ nhà sao chép "Dịp đặc biệt" từ 3402 sang 1509, thì dịp 01/12 – 02/12 của 1509 giữ nguyên. · database
- **YC4.5-NT5** Khi 1509 có dịp 25/10 – 26/10 và chủ nhà sao chép dịp 24/10 – 25/10 của 3402 sang 1509, thì 1509 giữ dịp 25/10 – 26/10, không có dịp 24/10 – 25/10, và popup liệt kê dịp bị bỏ. · database, unit
- **YC4.5-NT6** Khi Chị Hoa gửi lệnh sao chép giá từ 3402 sang Sapphire 1103 hay từ 1103 sang 3402, hoặc Sale Hùng gửi lệnh sao chép từ 1509, thì database từ chối, không căn nào đổi và không đọc được giá 1103. · database
- **YC4.5-NT7** Khi sao chép xong sang 1 căn, thì thấy toast "Đã sao chép giá sang 1 căn". · unit

## YC4.6 · Những đêm tính giá cuối tuần

Bản 1 · rủi ro: cao · Màn: P6

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Vào Cá nhân, chạm "Ngày tính giá cuối tuần" (YC1) | P6: "Chọn những đêm tính giá cuối tuần. Các đêm còn lại tính giá ngày thường.", hàng chip "Đêm cuối tuần" T2 đến CN, đêm đang chọn sáng | Đọc cài đặt đêm cuối tuần của chủ nhà |
| 2 | Chạm chip | Bật, tắt đêm đó. Ghi chú "Tính theo đêm ở. VD: nhận phòng T6, trả phòng CN là 2 đêm cuối tuần." Chỉ còn một đêm thì chip đó không tắt được | Không |
| 3 | Xem mẫu | "Một tuần của phòng 1509" ghi giá từng đêm; ô xanh là đêm cuối tuần. Ghi chú "Tên ô giá ở mục Giá của căn đổi theo lựa chọn này." | Không |
| 4 | Bấm "Lưu thay đổi" | Về Cá nhân, toast "Đã lưu ngày tính giá cuối tuần" ([MỞ: YC4-H4]) | Ghi đêm cuối tuần của chủ nhà; từ chối khi không còn đêm nào |

Tiêu chí:
- **YC4.6-NT1** Khi chủ nhà chọn T6 và T7 rồi lưu, thì ô giá ở tab Giá ghi "Cuối tuần (T6, T7)" và "Ngày thường (CN–T5)". · unit
- **YC4.6-NT2** Khi chủ nhà chọn T7 và CN rồi lưu, thì ô giá ghi "Cuối tuần (T7, CN)" và "Ngày thường (T2–T6)", và đêm 11/10 (CN) của 1509 có giá 1.300.000đ. · unit, database
- **YC4.6-NT3** Khi đêm cuối tuần là T6, T7 và khách nhận 1509 ngày 09/10 (T6), trả 11/10 (CN), thì cả hai đêm tính 1.300.000đ. · database
- **YC4.6-NT4** Khi chỉ còn một đêm cuối tuần, thì chip đó không tắt được; lệnh lưu không có đêm nào gửi thẳng tới database bị từ chối; Sale Hùng gửi lệnh đổi đêm cuối tuần của Chị Hoa bị từ chối. · unit, database

## Màn hình

Xem hình: `python3 scripts/trich-man.py <mã>`. Chữ và số trên hình lệch YC thì YC đúng.

- **CN6, CN6-00, CN6-04, CN6-09 · Tab Giá.** Đúng bố cục. Hình của 3402 có "Giá ngày lễ" 30/04 – 01/05 và 01/09 – 02/09 giá 2.500.000đ: là ví dụ, bộ mẫu chỉ có dịp 24/10 – 25/10.
- **CN6-02, CN6-03, CN6-03-01 · Giá ngày lễ, dịp.** Đúng bố cục. Dòng báo trùng ngày (YC4.3 bước 8) chưa có hình: dùng kiểu cảnh báo của CN6-03.
- **CN6-05, CN6-05-00, CN6-06 · Đặt giá nhiều căn.** Hình có 4 căn; bộ mẫu Chị Hoa có 2.
- **CN6-07, CN6-08 · Sao chép giá.** Hình chưa có popup "Tôi đã hiểu". Danh sách căn trên hình (Greenbay, 2208) là ví dụ.
- **P6 · Ngày tính giá cuối tuần.** Đúng bố cục. Kết quả sau khi lưu chưa có hình (YC4-H4).
- **CN5 · thẻ căn.** Dòng giá và nút "Đặt giá cho căn này" theo YC4.1.

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Tạo từ các story US4, US7, US8 và màn P6 của US11 (QD20, QD21); áp quyết định 5, 6, 12, 13 của Tùng ngày 04/11/2026 ở bản Zalo | Cả file |
| r2 | 2026-11-19 | Claude | US21-gia-thang | Trả lời YC4-H5: ở lại tab Giá (Claude tự quyết, QD25) | YC4.2 |
