---
id: YC3
tieu_de: Căn
trang_thai: de-xuat
nguoi_chu: tung
rev: 2
ban: 1
---
# YC3 · Căn

## Mục tiêu

Là chủ nhà, tôi muốn thêm căn chỉ với mã căn và số phòng ngủ, rồi bổ sung ảnh, tòa nhà, mô tả khi rảnh, để bắt đầu ghi lịch ngay và có đủ thông tin cho sale gửi khách.

Vì sao quan trọng: chủ nhà nhiều người lớn tuổi, bỏ cuộc nếu bước đầu dài. Vì vậy một căn chỉ cần hai thứ (quy tắc Căn tối thiểu), phần còn lại thêm sau. Ảnh là thứ sale cần nhất khi gửi khách, nên app nhắc khi căn có ít hơn 6 ảnh. Xóa căn chỉ là ẩn căn: đặt phòng và số thống kê cũ phải còn nguyên, và không được xóa căn khi còn khách sắp tới, nếu không chủ nhà mất dấu khách đã nhận.

## Luồng chính

Hôm nay là 07/10/2026. Chị Hoa vừa chọn vai chủ nhà (YC1). Tab Lịch hiện "Chưa có căn nào" với nút "Thêm căn đầu tiên".

Chị bấm nút đó. Form "Thêm căn" mở ra. Chị gõ mã căn "1509", chạm chip "2PN": dòng dưới cùng đổi thành "Đủ thông tin. Ảnh, giá thêm sau cũng được." Chị bấm "Thêm ảnh", chọn 6 ảnh trong máy. Ảnh tải lên từng cái, ảnh đầu tiên có nhãn "Ảnh đại diện". Chị mở "Thêm tòa nhà, mô tả gửi khách, view...", chạm chip tòa "ICON40", chip view "Biển", gõ số giường 3. Chị bấm "Thêm căn". App về tab Căn, toast "Đã thêm phòng 1509" hiện đầu màn, thẻ 1509 ghi "2PN · 3 giường · view biển · ICON40" và nhãn "Mới thêm".

Nếu Chị Hoa gõ mã "1509" lần nữa cho căn thứ hai, form báo "Đã có căn 1509. Kiểm tra lại mã căn." ngay dưới ô mã căn và không thêm căn. Anh Tuấn (chủ nhà khác) vẫn thêm được căn mã 1509 của anh.

## Phạm vi

YC này gồm: màn trống của chủ nhà chưa có căn, danh sách căn, thêm căn có lịch, ảnh căn, tòa nhà và các thông tin thêm, sửa căn, xóa căn.

Không thuộc YC này (dễ tưởng là có):
- Màn chào mừng, đăng nhập, chọn vai: YC1.
- Dòng "Giá tuần này", nút "Đặt giá cho căn này" trên thẻ căn, tab "Giá" của màn sửa căn, những đêm tính giá cuối tuần: YC4.
- Màn trống của sale chưa có nguồn phòng, mở app từ link mời: YC7, YC6.
- Sale thêm căn của chính mình, căn tự nhập: YC10.
- Chọn tỉnh khi vào app, lọc tòa theo tỉnh: bản sau (`docs/product/requirements/README.md`).
- Người quản trị sửa, gộp danh sách tòa: YC13.
- Căn mới tự hiện ở lịch của sale: YC7. Báo cho sale khi chủ nhà thêm căn: [MỞ: YC3-H1].

## Quy tắc của nhóm

| Tên | Quy tắc | Ví dụ |
|---|---|---|
| Căn tối thiểu | Một căn chỉ cần mã căn và số phòng ngủ. Ảnh, giá, tòa nhà, loại view, số giường, mô tả thêm sau cũng được. Nhà mặt đất đặt mã tự do | "Greenbay", "1509" |
| Mã căn không trùng | Một người giữ không có hai căn chưa xóa cùng mã (bỏ khoảng trắng đầu cuối, không phân biệt hoa thường). Hai người giữ khác nhau trùng mã được. Mã của căn đã xóa dùng lại được | "Đã có căn 1509" |
| Ảnh căn | Tối đa 12 ảnh. Ảnh đầu tiên là ảnh đại diện. Nên có ít nhất 6 ảnh vì sale cần. Còn ảnh đang tải hay tải lỗi thì chưa lưu căn được | 12 ảnh, 6 ảnh |
| Xóa căn là ẩn căn | Xóa chỉ ẩn căn khỏi mọi màn; đặt phòng, tiền, thống kê còn nguyên. Không xóa được khi còn đặt phòng chưa hủy có ngày trả sau hôm nay hoặc còn yêu cầu đang chờ. Sale không còn thấy căn. Bản đầu không hiện lại được | Không |

Quy tắc dùng chung: QT6.3 Tòa nhà dùng chung, QT5.5 Lỗi, QT5.7 Ảnh.

## Ai được làm gì

Theo `docs/security/PQ-ma-tran-quyen.md`: PQ3 (thông tin và ảnh căn), PQ13 (căn của người dùng), PQ1 (hồ sơ). Test vi phạm phải có, ở lớp database:
- Người không giữ căn (chủ nhà khác, sale được chia sẻ) đọc, sửa, xóa căn, ảnh căn: YC3.2-NT7, YC3.3-NT5, YC3.5-NT5, YC3.6-NT10.
- Người chưa đăng nhập tạo căn, mở ảnh bằng đường dẫn trực tiếp: YC3.2-NT7, YC3.3-NT5.
- Căn đã xóa không còn với sale: YC3.6-NT7.
- Danh sách tòa: mọi người đã đăng nhập đọc và thêm được; chỉ quản trị sửa, xóa (YC13).

## Dữ liệu

Mô hình chung: `docs/architecture/thiet-ke-db.md`. YC này cần database bảo đảm:
- Mã căn không trùng theo quy tắc trên, chặn bằng ràng buộc ở database, không chỉ ở app.
- Mọi lệnh ghi căn kiểm dữ liệu theo bảng luật kiểm ở YC3.2 và YC3.3, trả câu tiếng Việt; không để lỗi ràng buộc chung lọt ra màn.
- Ẩn căn và ghi đặt phòng hay yêu cầu vào căn đó cùng lúc thì một bên phải chờ bên kia (khóa căn trước khi kiểm), để không có căn đã ẩn mà còn đặt phòng sắp tới (YC3.6-NT11).
- Ảnh nằm ở kho file riêng tư, mỗi người tải một thư mục; kho chỉ nhận JPEG, PNG, HEIC tới 15 MB. Chỉ người giữ căn và sale được xem căn đọc được ảnh.
- Ảnh tạm không gắn căn nào sau 24 giờ, và ảnh bị bỏ khỏi căn, bị xóa cả file. Một người giữ tối đa 50 ảnh tạm; quá thì từ chối với câu "Bạn đang có quá nhiều ảnh chưa gắn vào căn. Thêm căn hoặc bỏ bớt ảnh rồi thử lại."
- Tên tòa không trùng nhau (không phân biệt hoa thường); thêm tòa trùng tên thì trả tòa đã có (giả định GD21).
- Xóa căn không có lệnh ngược lại ở bản 1.

## Trạng thái màn (mọi mục)

- Đang tải danh sách căn, chi tiết căn, danh sách tòa: theo HV1 (khung xám tại chỗ).
- Mất mạng: theo HV2. Form vẫn nhập được, chỉ không lưu được; ảnh đang tải chuyển thành "Tải lỗi".
- Rời app khi đang nhập hay đang tải ảnh rồi quay lại: theo HV3, giữ dữ liệu đã nhập; ảnh chưa tải xong thì thành "Tải lỗi", bấm "Thử lại".
- Căn bị ẩn hay mất quyền trong lúc đang sửa: lưu bị từ chối, theo HV5.
- Phiên hết hạn: theo HV7.
- Toast: theo HV8.

## YC3.1 · Màn đầu tiên và danh sách căn

Bản 1 · rủi ro: tb · Màn: A4, A4-01, CN5

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 7 | Chủ nhà chưa có căn mở tab Lịch hay tab Căn | A4: "Chưa có căn nào", câu "Thêm căn đầu tiên để bắt đầu ghi lịch và mời sale xem phòng trống.", nút "Thêm căn đầu tiên", khối "3 BƯỚC ĐỂ BẮT ĐẦU" (1 "Thêm căn và ảnh", 2 "Đặt giá", 3 "Mời sale xem lịch"), mẹo "💡 Có sổ lịch cũ? Thêm căn trước, sau đó nhập các đặt phòng sắp tới." | Đọc căn chưa ẩn của mình: không có dòng nào |
| 8 | Bấm "Thêm căn đầu tiên" hay dòng "Thêm căn và ảnh" | Mở form Thêm căn (CN5-A1) | Không |

Chủ nhà vừa đồng ý cho một sale xem lịch ở A8 mà chưa có căn: A4-01, như A4 có thêm dải xanh "✓ Bạn đã cho Sale Hùng xem lịch. Thêm căn để Sale Hùng thấy phòng trống." (đường tới màn này: YC6).

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 9 | Mở tab Căn | CN5: tiêu đề "Căn của tôi", số căn ("2 căn"), nút "Thêm căn", mỗi căn một thẻ, căn mới thêm trước | Đọc căn của mình, loại có lịch, chưa ẩn,; ảnh đại diện là ảnh thứ tự 1; tên tòa |
| 10 | Xem một thẻ | Ảnh đại diện và số ảnh, "Phòng 1509", dòng "2PN · 3 giường · view biển · ICON40" (phần nào chưa nhập thì bỏ), tình trạng hôm nay: "Có khách đến 12/10" hoặc "Trống hôm nay ✓" | Đặt phòng chưa hủy của căn có đêm hôm nay, |
| 11 | Căn có ít hơn 6 ảnh | Thẻ có gợi ý "Nên thêm ảnh: sale cần ít nhất 6 ảnh". Không có ảnh thì chỗ ảnh ghi "Chưa có ảnh" | Không |
| 12 | Căn tạo trong 24 giờ qua | Nhãn "Mới thêm" (giả định GD14) | Lúc tạo căn |
| 13 | Chạm ảnh hay thẻ căn | Mở CN5-02 của căn đó | Không |
| 14 | Bấm "Thêm căn" | Mở CN5-A1 | Không |

Phòng ngủ và số giường ghi theo `docs/product/glossary.md` (mục Phòng ngủ và số giường): "2PN · 3 giường", chưa nhập số giường thì "2PN", Studio thì "Studio". Không bao giờ ghi "x khách", "x người lớn", "y trẻ em".

Tiêu chí:
- **YC3.1-NT1** Khi chủ nhà chưa có căn mở tab Lịch, thì thấy A4 với nút "Thêm căn đầu tiên"; bấm nút thì mở form Thêm căn. · unit
- **YC3.1-NT2** Khi Chị Hoa có 2 căn, thì tab Căn ghi "2 căn" và có đúng 2 thẻ; căn của Anh Tuấn không có ở đó. · unit (hiển thị), database (RLS)
- **YC3.1-NT3** Khi 1509 có 3 giường, thì thẻ ghi "2PN · 3 giường"; khi một căn 2PN chưa nhập số giường, thì thẻ ghi "2PN" và không có chữ "giường". · unit
- **YC3.1-NT4** Khi chủ nhà xem bất kỳ thẻ căn nào, thì thẻ không có "x khách", "x người lớn" hay "y trẻ em". · unit
- **YC3.1-NT5** Khi căn có 5 ảnh, thì thẻ có gợi ý "Nên thêm ảnh: sale cần ít nhất 6 ảnh"; có 6 ảnh thì không có gợi ý. · unit

## YC3.2 · Thêm căn

Bản 1 · rủi ro: cao · Màn: CN5-A1, CN5-A3, CN5-A4, CN5-A4b

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 15 | Mở form | CN5-A1, tiêu đề "Thêm căn": ô "Mã căn (tên căn hộ) *", hàng chip "Số phòng ngủ *" ("Studio", "1PN", "2PN", "3PN", "4PN+"), mục "ẢNH" ("Bạn có thể thêm sau"), dòng "Thêm tòa nhà, mô tả gửi khách, view..." đang thu gọn, nút "Thêm căn" ở thanh dưới | Không |
| 16 | Chưa có mã căn hay số phòng ngủ | Nút "Thêm căn" không bấm được, dòng "Còn thiếu: mã căn, số phòng ngủ" (chỉ nêu ô còn thiếu) | Không |
| 17 | Đã có mã căn và số phòng ngủ | Dòng "Đủ thông tin. Ảnh, giá thêm sau cũng được.", nút sáng | Không |
| 18 | Bấm "Thêm căn" | Nút chuyển trạng thái đang lưu, không bấm lại được | Lệnh tạo căn: kiểm dữ liệu (mục Luật kiểm), ghi căn với người giữ là người gọi; có ảnh thì gắn theo thứ tự ; mã trùng căn chưa ẩn của chính người gọi thì từ chối. Trigger ghi thông báo "chủ nhà thêm căn" cho sale được chia sẻ "tất cả căn" (hiển thị: YC1) |
| 19 | (lưu được) | Về CN5 (CN5-A4 khi đây là căn đầu tiên, CN5-A4b khi đã có căn khác). Toast "Đã thêm phòng 1509". Thẻ căn mới đứng đầu, có nhãn "Mới thêm" | Không |
| 20 | (database từ chối) | CN5-A3: ở lại form, giữ mọi ô, dòng đầu "Chưa thêm được căn. Sửa <số> chỗ bên dưới.", câu lỗi ngay dưới ô sai (ví dụ "Đã có căn 1509. Kiểm tra lại mã căn.") | Trả lỗi P0001 kèm câu |
| 21 | (mất mạng hay quá 15 giây không có trả lời) | Ở lại form, giữ dữ liệu, toast "Chưa lưu được vì mất mạng. Kiểm tra mạng rồi bấm lại." | Xem dòng dưới bảng |

`[r2 · sửa]` Chống gửi trùng theo QT5.6: mỗi lần mở form "Thêm căn" app sinh một mã lần gửi và giữ nguyên mã đó khi bấm lại. Mạng rớt mà lần trước thực ra đã lưu, bấm lại với cùng mã thì database trả căn đã tạo, không tạo căn thứ hai, và app đi tiếp như lưu được (bước 19). Cùng mã lần gửi mà khác mã căn vẫn trả căn đã tạo (Claude tự quyết, QD25, trả lời YC3-H6).

Còn ảnh đang tải hay tải lỗi thì không bấm được "Thêm căn" (mục Ảnh căn).

Luật kiểm (dùng cả ở YC3.4 và YC3.5). Database là chỗ chặn thật; app chặn trước để người dùng thấy sớm. Câu lỗi trả theo QT5.5.

| Ô | Bắt buộc | Luật | Câu lỗi khi sai |
|---|---|---|---|
| Mã căn | có | Bỏ khoảng trắng đầu cuối, 1 đến 50 ký tự. Không trùng căn chưa xóa của cùng người giữ (không phân biệt hoa thường). Khác người giữ thì trùng được | "Mã căn không được trống" · "Mã căn dài quá 50 ký tự" · "Đã có căn <mã>. Kiểm tra lại mã căn." |
| Số phòng ngủ | có | 0 (Studio) đến 4 (4PN+) | "Cần chọn số phòng ngủ" · "Số phòng ngủ không hợp lệ" |
| Số giường | không | Số nguyên 1 đến 50; trống là chưa nhập | "Số giường từ 1 đến 50" |
| Loại view | không | Biển, Thành phố, Núi | "Loại view không hợp lệ" |
| Tòa nhà | không | Tòa có trong danh sách | "Không tìm thấy tòa nhà" |
| Mô tả gửi khách | không | Tối đa 2.000 ký tự | "Mô tả dài tối đa 2.000 ký tự" |
| Tên tòa mới | có (khi thêm tòa) | Bỏ khoảng trắng đầu cuối, 1 đến 100 ký tự | "Tên tòa từ 1 đến 100 ký tự" |

Tiêu chí:
- **YC3.2-NT1** Khi chưa có mã căn hoặc chưa chọn số phòng ngủ, thì nút "Thêm căn" không bấm được và có dòng "Còn thiếu: …" nêu đúng ô còn thiếu. · unit
- **YC3.2-NT2** Khi chủ nhà chỉ nhập mã căn "2105" và chọn "1PN", không mở phần thêm, không có ảnh, thì thêm căn được. · unit, database
- **YC3.2-NT3** Khi chủ nhà bỏ trống ô "Số giường", thì dòng "Còn thiếu" không nhắc số giường và vẫn thêm được căn. · unit
- **YC3.2-NT4** Khi Chị Hoa thêm căn mã "1509" (hoặc " 1509 ", hoặc "1509" viết khác hoa thường) trong khi đã có căn 1509 chưa xóa, thì database từ chối với câu "Đã có căn 1509. Kiểm tra lại mã căn.", câu này hiện dưới ô mã căn, và không có căn mới. · database, unit
- **YC3.2-NT5** Khi Anh Tuấn thêm căn mã "1509", thì thêm được dù Chị Hoa đã có căn 1509. · database
- **YC3.2-NT6** Khi thêm căn 2105 xong, thì thấy toast "Đã thêm phòng 2105" và thẻ 2105 đứng đầu tab Căn với nhãn "Mới thêm". · E2E
- **YC3.2-NT7** Khi Anh Tuấn đọc bảng căn, thì không thấy căn nào của Chị Hoa; khi người chưa đăng nhập gửi lệnh tạo căn, thì bị từ chối. · database
- **YC3.2-NT8** Khi lệnh tạo căn có số phòng ngủ 5, số giường 0, loại view "vinh" hay mô tả dài 2.001 ký tự, thì database từ chối với câu tiếng Việt nêu đúng ô sai (mục Luật kiểm), không phải lỗi chung. · database
- `[r2 · thêm]` **YC3.2-NT9** Khi lệnh tạo căn 2105 được gửi hai lần với cùng mã lần gửi, thì database trả cùng một căn và chỉ có một căn 2105. · database

## YC3.3 · Ảnh căn

Bản 1 · rủi ro: cao · Màn: CN5-A1, CN5-A2, CN5-A3, CN5-02

Dùng ở form Thêm căn (CN5-A1, CN5-A2, CN5-A3) và Sửa căn (CN5-02). Cách chọn ảnh trên PWA: `docs/external/pwa.md` mục P6 (ô chọn file, không xin quyền).

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 22 | Bấm "Thêm ảnh · chọn nhiều ảnh cùng lúc" | Mở ô chọn ảnh của điện thoại, chọn được nhiều ảnh | Không |
| 23 | Chọn ảnh | Mỗi ảnh một ô theo thứ tự chọn. App thu ảnh về JPEG cạnh dài 1600 px (bỏ vị trí chụp) rồi tải lên ngay từng ảnh. Ô đang tải ghi "Đang tải 60%". Tiêu đề "ẢNH (5)", dòng "Đang tải 1 ảnh. Chờ tải xong mới thêm được căn." (CN5-A2) | Tải file lên kho ảnh, thư mục của chính người tải; database ghi ảnh tạm của người tải, chưa gắn căn |
| 24 | (ảnh đầu tiên) | Ô đầu có nhãn "Ảnh đại diện". Dòng "Ảnh đầu tiên là ảnh đại diện · Tối đa 12 ảnh" | Không |
| 25 | (tải lỗi) | Ô ghi "Tải lỗi" với nút "Thử lại" và ✕ (CN5-A3). Bấm "Thử lại" tải lại đúng ảnh đó; bấm ✕ bỏ ảnh | Không ghi gì |
| 26 | Chọn quá số ảnh còn trống | Nhận đủ tới 12 ảnh, bỏ phần thừa, toast "Mỗi căn tối đa 12 ảnh. Đã bỏ <n> ảnh." | Gắn hơn 12 ảnh bị từ chối |
| 27 | Đủ 12 ảnh | Nút "Thêm ảnh" không bấm được | Không |
| 28 | Bấm ✕ trên một ảnh đã tải | Bỏ ảnh khỏi danh sách | Không gọi ngay. Lưu căn thì ảnh không còn trong danh sách bị bỏ khỏi căn |

Ảnh nhận: JPEG, PNG, HEIC, mỗi ảnh tới 15 MB và không quá 40 triệu điểm ảnh. File khác hay quá cỡ thì ô đó ghi lỗi "Ảnh phải là JPEG, PNG hoặc HEIC, tối đa 15 MB" và không tải. Ảnh tạm không gắn vào căn nào sau 24 giờ thì bị xóa.

Luật kiểm:

| Ô | Bắt buộc | Luật | Câu lỗi khi sai |
|---|---|---|---|
| Ảnh | không | Tối đa 12, không trùng; mỗi ảnh là ảnh tạm của chính người gọi hoặc ảnh đang gắn căn này | "Mỗi căn tối đa 12 ảnh" · "Danh sách ảnh bị trùng" · (ảnh của người khác: lỗi quyền, app hiện câu chung) |
| File ảnh | (khi tải) | JPEG, PNG, HEIC; tới 15 MB; không quá 40 triệu điểm ảnh | "Ảnh phải là JPEG, PNG hoặc HEIC, tối đa 15 MB" |

Tiêu chí:
- **YC3.3-NT1** Khi còn ảnh đang tải, thì nút "Thêm căn" không bấm được và có dòng "Đang tải 1 ảnh. Chờ tải xong mới thêm được căn.". · unit
- **YC3.3-NT2** Khi một ảnh tải lỗi, thì ô ảnh đó có nút "Thử lại" và ✕, và căn không thêm được cho tới khi ảnh đó tải lại được hoặc bị bỏ. · unit
- **YC3.3-NT3** Khi đã có 12 ảnh, thì nút "Thêm ảnh" không bấm được; chọn 15 ảnh khi chưa có ảnh nào thì chỉ nhận 12; lệnh gắn 13 ảnh gửi thẳng tới database bị từ chối với câu "Mỗi căn tối đa 12 ảnh". · unit, database
- **YC3.3-NT4** Khi chủ nhà chọn 3 ảnh, thì ảnh chọn đầu tiên có nhãn "Ảnh đại diện" và sau khi lưu là ảnh trên thẻ căn. · unit
- **YC3.3-NT5** Khi Anh Tuấn gửi lệnh gắn một ảnh tạm của Chị Hoa vào căn của mình, hoặc tải file vào thư mục của Chị Hoa trong kho ảnh, thì bị từ chối. · database
- **YC3.3-NT6** Khi người dùng chọn một file 20 MB hay một file PDF, thì ô đó báo "Ảnh phải là JPEG, PNG hoặc HEIC, tối đa 15 MB" và không tải lên; lệnh tải file 20 MB thẳng vào kho ảnh cũng bị từ chối. · unit, database

## YC3.4 · Tòa nhà, loại view, số giường, mô tả

Bản 1 · rủi ro: thấp · Màn: CN5-A1 (phần mở rộng), CN5-A1b

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 29 | Bấm "Thêm tòa nhà, mô tả gửi khách, view..." | Mở phần thêm (CN5-A1, phần mở rộng): hàng chip "Tòa nhà" (tòa mình đã dùng trước, rồi tòa có sẵn, tối đa 6 chip, chip cuối "+ Tòa khác"), hàng chip "Loại view" ("Biển", "Thành phố", "Núi"), ô số "Số giường" (không bắt buộc), ô "Mô tả gửi khách" (dòng gợi ý "Sale dùng đoạn này khi gửi thông tin căn cho khách."), nút "Thu gọn" | Đọc danh sách tòa |
| 30 | Chạm "+ Tòa khác" | CN5-A1b: ô "Tên tòa nhà", danh sách tòa (tên và khu vực), ghi chú "Chọn tòa có sẵn để sale lọc đúng tòa. Không thấy thì thêm tòa mới." | Không |
| 31 | Gõ chữ vào ô tên tòa | Danh sách chỉ còn tòa có tên chứa chữ đã gõ (không phân biệt hoa thường, dấu). Dòng cuối "+ Thêm tòa mới "<chữ đã gõ>"" | Lọc trên danh sách đã đọc |
| 32 | Chọn một tòa | Tòa đó gắn vào căn (lưu cùng căn) | Không |
| 33 | Chạm "+ Thêm tòa mới …" | Tòa mới được chọn cho căn | Lệnh thêm tòa: thêm tòa vào danh sách chung, không cần duyệt. Tên trùng một tòa đã có (không phân biệt hoa thường) thì trả tòa đã có (giả định GD21) |
| 34 | Bấm "Thu gọn" | Ẩn phần thêm, giữ giá trị đã nhập | Không |

Phần này không bắt buộc. Số giường không vào dòng "Còn thiếu". Chọn được một loại view cho một căn ([MỞ: YC3-H7]). Khu vực của tòa người dùng thêm: [MỞ: YC3-H5]; tới khi có câu trả lời, tòa mới không có khu vực.

Tiêu chí:
- **YC3.4-NT1** Khi chủ nhà gõ "green" vào ô tên tòa ở CN5-A1b, thì danh sách chỉ còn "Green Bay" và có dòng "+ Thêm tòa mới "green"". · unit
- **YC3.4-NT2** Khi chủ nhà mở hàng chip "Loại view", thì thấy đúng "Biển", "Thành phố", "Núi" và không có "Vịnh". · unit
- **YC3.4-NT3** Khi Chị Hoa thêm tòa mới "Bim Hạ Long", thì Anh Tuấn mở CN5-A1b thấy "Bim Hạ Long" trong danh sách. · database
- **YC3.4-NT4** Khi một người thêm tòa mới tên "icon40" trong khi đã có "ICON40", thì không có tòa thứ hai và căn gắn với "ICON40" (giả định GD21). · database

## YC3.5 · Sửa căn

Bản 1 · rủi ro: cao · Màn: CN5-02

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 35 | Chạm một thẻ ở CN5 | CN5-02, tiêu đề "Sửa phòng 1509", hai tab "Thông tin" và "Giá" (tab Giá: YC4). Tab Thông tin điền sẵn mọi ô của căn: mã căn, số phòng ngủ, ảnh theo thứ tự, tòa, loại view, số giường, mô tả | Đọc căn và ảnh |
| 36 | Bấm "Đổi thứ tự" ở mục ảnh | Mỗi ảnh có nút đưa lên trước, ra sau. Ảnh số 1 là ảnh đại diện | Không |
| 37 | Thêm, bỏ ảnh | Như mục Ảnh căn | Như mục Ảnh căn |
| 38 | Sửa các ô khác | Như form thêm. Xóa trống ô số giường là bỏ số giường | Không |
| 39 | Bấm "Lưu thay đổi" | Nút đang lưu. Lưu được thì về CN5, toast "Đã lưu phòng 1509" | Lệnh sửa căn: chỉ người giữ căn, căn chưa ẩn; chỉ ghi ô có gửi; danh sách ảnh gửi lên là danh sách ảnh mới đầy đủ theo thứ tự; mã trùng căn chưa ẩn khác của mình thì từ chối |
| 40 | (database từ chối) | Ở lại, giữ dữ liệu, câu lỗi dưới ô sai như bước 20 | Trả lỗi P0001 kèm câu |
| 41 | Bấm quay lại khi đã sửa mà chưa lưu | Hỏi "Bỏ thay đổi chưa lưu?" với hai nút "Bỏ thay đổi" và "Ở lại" | Không |

Bỏ một ảnh ở CN5-02 có hỏi lại không: [MỞ: YC3-H4]. Tới khi có câu trả lời, không hỏi (ảnh chỉ thật sự bị bỏ khi bấm "Lưu thay đổi").

Tiêu chí:
- **YC3.5-NT1** Khi chủ nhà mở sửa căn 1509, thì các ô hiện đúng mã căn, số phòng ngủ, ảnh theo thứ tự, tòa, loại view, số giường, mô tả hiện có. · unit
- **YC3.5-NT2** Khi chủ nhà đưa ảnh thứ 2 lên đầu và lưu, thì ảnh đó thành ảnh đại diện. · database, unit
- **YC3.5-NT3** Khi Chị Hoa đổi mã 3402 thành "1509", thì database từ chối với câu "Đã có căn 1509. Kiểm tra lại mã căn." và 3402 không đổi. · database
- **YC3.5-NT4** Khi chủ nhà sửa số giường 1509 từ 3 thành 2 rồi lưu, thì thẻ ghi "2PN · 2 giường"; xóa trống ô rồi lưu, thì thẻ ghi "2PN". · unit, database
- **YC3.5-NT5** Khi Sale Hùng (được chia sẻ 1509) hoặc Anh Tuấn gửi lệnh sửa căn 1509, thì database từ chối và 1509 không đổi. · database

## YC3.6 · Xóa căn

Bản 1 · rủi ro: cao · Màn: chưa có hình

Xóa căn là ẩn căn (quy tắc "Xóa căn là ẩn căn"). Vị trí nút, màn sau khi xóa: [MỞ: YC3-H3]. Có hỏi lại trước khi xóa không: [MỞ: YC3-H8]. Hai câu này chỉ chặn phần giao diện; phần database làm được ngay.

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 42 | Bấm xóa căn 3402 | (hỏi lại nếu YC3-H8 trả lời có) | Không |
| 43 | (căn còn đặt phòng chưa hủy có ngày trả sau hôm nay, hoặc còn yêu cầu đặt phòng đang chờ chưa hết hạn) | Toast đỏ "Căn còn đặt phòng sắp tới", căn giữ nguyên | Lệnh xóa căn từ chối với câu trên. Ngày tính theo giờ Việt Nam |
| 44 | (không còn) | Căn biến khỏi CN5, lịch CN1 và CN2, chip "Phòng" ở form đặt phòng (CN4), danh sách chọn căn khi đặt giá nhiều căn và sao chép giá (CN6-05, CN6-07) | Lệnh xóa căn ghi lúc ẩn. Đặt phòng, tiền từng đêm, thống kê giữ nguyên. Từ lúc đó căn không còn trong danh sách căn sale được xem (PQ17) nên sale không còn thấy căn ở lịch, tìm phòng, chi tiết căn |
| 45 | Thêm căn mới cùng mã với căn đã xóa | Thêm được | Mã của căn đã ẩn không tính khi kiểm trùng |

Không báo cho sale khi căn bị xóa. Bản đầu không có cách hiện lại căn đã xóa. Đặt phòng cũ của sale với căn đã xóa vẫn ở danh sách và thống kê của sale (YC11). Căn đã xóa có tính vào mẫu số công suất không: [MỞ: YC11-H7] (YC11).

Xóa căn: "Căn còn đặt phòng sắp tới". Căn không có, đã xóa, hay của người khác: lỗi quyền (mã 42501), app hiện "Có lỗi xảy ra. Bạn thử lại sau ít phút." để không lộ căn có tồn tại hay không.

Tiêu chí:
- **YC3.6-NT1** Khi Chị Hoa xóa 3402 lúc 3402 còn B2 (17/10 → 19/10), thì app báo "Căn còn đặt phòng sắp tới" và 3402 vẫn ở tab Căn. · unit
- **YC3.6-NT2** Khi căn 2105 của Chị Hoa không có đặt phòng nhưng có yêu cầu đặt phòng đang chờ của Sale Lan, và Chị Hoa xóa 2105, thì database từ chối với câu "Căn còn đặt phòng sắp tới". · database
- **YC3.6-NT3** Khi lệnh ẩn 3402 gửi thẳng tới database lúc 3402 còn B2, thì database từ chối và 3402 không bị ẩn. · database
- **YC3.6-NT4** Khi hôm nay là 02/12/2026, đặt phòng cuối cùng của 3402 là B9 trả phòng 02/12 và không còn yêu cầu chờ, thì Chị Hoa xóa được 3402. · database
- **YC3.6-NT5** Khi Chị Hoa xóa được 2105, thì tab Căn bớt một thẻ, 2105 không còn ở lịch CN1 và ở chip "Phòng" của form đặt phòng. · E2E
- **YC3.6-NT6** Khi hôm nay là 25/12/2026 và Chị Hoa xóa 3402, thì doanh thu tháng 10 của Chị Hoa vẫn 11.800.000đ, trong đó 3402 vẫn 5.100.000đ. · database
- **YC3.6-NT7** Khi hôm nay là 25/12/2026 và Chị Hoa xóa 3402, thì 3402 không còn ở lịch và kết quả tìm phòng của Sale Lan, còn B2 và B4 vẫn ở danh sách đặt phòng của Sale Lan. · database
- **YC3.6-NT8** Khi Chị Hoa đã xóa căn 2105 rồi thêm căn mới mã "2105", thì thêm được, không báo trùng. · database
- **YC3.6-NT9** Khi chủ nhà đã xóa một căn, thì không có màn hay hàm nào cho hiện lại căn đó. · unit (không có nút), database (không có lệnh bỏ ẩn)
- **YC3.6-NT10** Khi Anh Tuấn hoặc Sale Hùng gửi lệnh xóa 3402 của Chị Hoa, thì database từ chối và 3402 không bị ẩn. · database
- **YC3.6-NT11** Khi lệnh ẩn 2105 và lệnh ghi đặt phòng vào 2105 chạy cùng lúc, thì không bao giờ có căn đã ẩn mà còn đặt phòng có ngày trả sau hôm nay. · database

## Màn hình

Xem hình: `python3 scripts/trich-man.py <mã>`. Chữ và số trên hình lệch YC thì YC đúng.

- **A4 · Chủ nhà mới, chưa có căn.** Đúng bố cục. **A4-01** như A4, có thêm dải xanh.
- **CN5 · Danh sách căn.** Thẻ 1509 trên hình ghi "4 khách" và "12 ảnh": bỏ số khách (YC3.1-NT4), số ảnh theo dữ liệu thật. Hình có 4 căn (Greenbay, 2208), bộ mẫu chỉ có 2. Dòng giá và nút "Đặt giá cho căn này" thuộc YC4.
- **CN5-A1, CN5-A1b, CN5-A2, CN5-A3 · Thêm căn** (trống, phần mở rộng, đang tải ảnh, lỗi khi lưu). Đúng bố cục.
- **CN5-A4, CN5-A4b · Đã thêm căn.** Vị trí toast trên hình là của bản Zalo; bản PWA theo HV8.
- **CN5-02 · Sửa căn.** Đúng bố cục. Hình chưa có hộp "Bỏ thay đổi chưa lưu?" và chưa có toast "Đã lưu phòng 1509".
- Xóa căn: chưa có hình ([MỞ: YC3-H3]).

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r2 | 2026-11-19 | Claude | US15-them-can | Trả lời YC3-H6 theo QT5.6: tạo căn dùng mã lần gửi; thêm YC3.2-NT9 (Claude tự quyết, QD25) | YC3.2 |
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Tạo từ các story US1, US25, US11, US27 đã gộp (QD20) và tách đặc tả khỏi việc (QD21) | Cả file |
