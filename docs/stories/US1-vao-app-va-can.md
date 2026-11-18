# US1 · Chủ nhà vào app và quản lý căn: thêm, ảnh, sửa, xóa

- Loại: tính năng
- Trạng thái: chờ code
- Đặc tả: đã viết lại
- Bản: 1
- Rủi ro: cao (quyền với căn, ảnh của người dùng, xóa căn còn đặt phòng)
- Làm sau khi xong: US38 (dựng nền), US37 (đăng nhập) cho phần "Vào app"
- Kiểm tay: `tests/kich-ban/US1.md`

## Mục tiêu

Là chủ nhà mới, tôi muốn vào app không phải khai gì, thêm căn chỉ với mã căn và số phòng ngủ, rồi bổ sung ảnh, tòa nhà, mô tả khi rảnh, để bắt đầu ghi lịch ngay và có đủ thông tin cho sale gửi khách.

Vì sao quan trọng: chủ nhà nhiều người lớn tuổi, bỏ cuộc nếu bước đầu dài. Vì vậy một căn chỉ cần hai thứ (quy tắc "Căn tối thiểu"), phần còn lại thêm sau. Ảnh là thứ sale cần nhất khi gửi khách, nên app nhắc khi căn có ít hơn 6 ảnh. Xóa căn chỉ là ẩn căn: đặt phòng và số thống kê cũ phải còn nguyên, và không được xóa căn khi còn khách sắp tới.

## Luồng chính

Hôm nay là 07/10/2026. Chị Hoa mở app lần đầu, thấy màn chào mừng với nút "Bắt đầu ngay" và dòng điều khoản. Chị bấm "Bắt đầu ngay", đăng nhập theo cách của US37, rồi tới màn "Bạn dùng app để làm gì?". Chị chạm thẻ "Tôi là chủ nhà", bấm "Tiếp tục". Tab Lịch hiện "Chưa có căn nào" với nút "Thêm căn đầu tiên".

Chị bấm nút đó. Form "Thêm căn" mở ra. Chị gõ mã căn "1509", chạm chip "2PN": dòng dưới cùng đổi thành "Đủ thông tin. Ảnh, giá thêm sau cũng được." Chị bấm "Thêm ảnh", chọn 6 ảnh trong máy. Ảnh tải lên từng cái, ảnh đầu tiên có nhãn "Ảnh đại diện". Chị mở "Thêm tòa nhà, mô tả gửi khách, view...", chạm chip tòa "ICON40", chip view "Biển", gõ số giường 3. Chị bấm "Thêm căn". App về tab Căn, toast "Đã thêm phòng 1509" hiện đầu màn, thẻ 1509 ghi "2PN · 3 giường · view biển · ICON40" và nhãn "Mới thêm".

Nếu Chị Hoa gõ mã "1509" lần nữa cho căn thứ hai, form báo "Đã có căn 1509. Kiểm tra lại mã căn." ngay dưới ô mã căn và không thêm căn. Anh Tuấn (chủ nhà khác) vẫn thêm được căn mã 1509 của anh.

## Phạm vi

Story này làm:
- Màn chào mừng A1 (trước khi đăng nhập), màn chọn vai A3, màn trống A4 của chủ nhà chưa có căn.
- Danh sách căn (tab Căn, CN5): số căn, thẻ căn với ảnh, phòng ngủ, số giường, view, tòa, tình trạng hôm nay, nhãn "Mới thêm".
- Thêm căn có lịch: mã căn, số phòng ngủ, ảnh, tòa nhà, loại view, số giường, mô tả gửi khách.
- Ảnh căn: chọn, tải lên, ảnh lỗi, thử lại, tối đa 12, ảnh đại diện, đổi thứ tự.
- Danh sách tòa dùng chung: tìm tòa, thêm tòa mới.
- Sửa căn (CN5-02, tab "Thông tin").
- Xóa căn (ẩn căn).

Không làm (dễ tưởng thuộc story này):
- Cách đăng nhập (mã OTP, Zalo, email…), phiên hết hạn, đăng xuất: US37, US21.
- Màn trống A5 của sale chưa có nguồn phòng, và mọi thứ khi mở app từ link mời (A1-link, A10): US6, US5.
- Dòng "Giá tuần này" và nút "Đặt giá cho căn này" trên thẻ căn, tab "Giá" trong CN5-02, nút "Đặt giá nhiều căn": US4.
- Chọn những đêm tính giá cuối tuần (P6): US4.
- Sale thêm căn của chính mình hay căn tự nhập (S6-02): US16.
- Chọn tỉnh lúc vào app, lọc tòa theo tỉnh: US33 (bản sau).
- Người quản trị sửa, gộp danh sách tòa: US23.
- Báo cho sale khi chủ nhà thêm căn mới, căn mới tự hiện ở lịch của sale: US6 (hiển thị), US21 (thông báo).

## Hành vi

Cột "Database" ghi việc phải xảy ra ở database. Chữ trong ngoặc kép là chữ trên màn, viết đúng như vậy.

### Vào app

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Mở app lần đầu, chưa đăng nhập | A1: tên "Lịch phòng Hạ Long", câu "Lịch phòng và giá homestay, chia sẻ cho sale trong một chạm.", ba dòng "Ghi lịch các phòng nhanh hơn sổ tay", "Sale tự xem phòng trống, không cần gọi hỏi", "Gửi ảnh và giá phòng cho khách trong vài giây", nút "Bắt đầu ngay", dòng "Bằng việc tiếp tục, bạn đồng ý với Điều khoản và Chính sách quyền riêng tư" ("Điều khoản" và "Chính sách quyền riêng tư" là hai link) | Không gọi. A1 hiện được khi chưa đăng nhập |
| 2 | Bấm "Bắt đầu ngay" | Đăng nhập theo US37. Xong thì sang A3. Không có popup hay ô hỏi tên, số điện thoại để kết nối (quy tắc "Xin số điện thoại đúng lúc") | Supabase Auth tạo người dùng; trigger tạo dòng `profiles` trống |
| 3 | Người đã chọn vai mở lại app | Vào thẳng tab Lịch của vai đã chọn, không qua A1, A3 | Đọc `profiles.vai_chon` của chính mình qua RLS |

Hai link ở A1 mở trang Điều khoản và Chính sách quyền riêng tư. Nội dung hai trang: US39.

### Chọn vai

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 4 | Ở A3 | Câu "Bạn dùng app để làm gì?", thẻ "Tôi là chủ nhà" ("Ghi lịch phòng, đặt giá, mời sale xem lịch.") và thẻ "Tôi là sale" ("Tìm phòng trống, gửi ảnh và giá cho khách."). Chưa thẻ nào được chọn: nút "Tiếp tục" mờ, dòng "Chọn một mục để tiếp tục" (A3-00) | Không |
| 5 | Chạm một thẻ | Thẻ đó đổi màu nền, viền, hiện dấu ✓; thẻ kia bỏ chọn; nút "Tiếp tục" sáng | Không |
| 6 | Bấm "Tiếp tục" | Chủ nhà: tab Lịch (A4 nếu chưa có căn). Sale: màn của sale (A5 nếu chưa có nguồn phòng, US6) | `fn_cap_nhat_ho_so` ghi `vai_chon` và `dong_y_dieu_khoan` (lúc bấm "Bắt đầu ngay") |

Vai chỉ quyết định màn mở đầu. Quyền với căn tính theo quan hệ người với căn, không theo vai (QD-005). Bản đầu không có màn đổi vai.

### Màn đầu tiên của chủ nhà chưa có căn

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 7 | Chủ nhà chưa có căn mở tab Lịch hay tab Căn | A4: "Chưa có căn nào", câu "Thêm căn đầu tiên để bắt đầu ghi lịch và mời sale xem phòng trống.", nút "Thêm căn đầu tiên", khối "3 BƯỚC ĐỂ BẮT ĐẦU" (1 "Thêm căn và ảnh", 2 "Đặt giá", 3 "Mời sale xem lịch"), mẹo "💡 Có sổ lịch cũ? Thêm căn trước, sau đó nhập các đặt phòng sắp tới." | Đọc căn chưa ẩn của mình qua RLS: không có dòng nào |
| 8 | Bấm "Thêm căn đầu tiên" hay dòng "Thêm căn và ảnh" | Mở form Thêm căn (CN5-A1) | Không |

Chủ nhà vừa đồng ý cho một sale xem lịch ở A8 mà chưa có căn: A4-01, như A4 có thêm dải xanh "✓ Bạn đã cho Sale Hùng xem lịch. Thêm căn để Sale Hùng thấy phòng trống." (đường tới màn này: US5).

### Danh sách căn

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 9 | Mở tab Căn | CN5: tiêu đề "Căn của tôi", số căn ("2 căn"), nút "Thêm căn", mỗi căn một thẻ, căn mới thêm trước | Đọc căn của mình, loại có lịch, chưa ẩn, qua RLS; ảnh đại diện từ `anh_can` (thứ tự 1); tòa từ `toa_nha` |
| 10 | Xem một thẻ | Ảnh đại diện và số ảnh, "Phòng 1509", dòng "2PN · 3 giường · view biển · ICON40" (phần nào chưa nhập thì bỏ), tình trạng hôm nay: "Có khách đến 12/10" hoặc "Trống hôm nay ✓" | Đặt phòng chưa hủy của căn có đêm hôm nay, qua RLS |
| 11 | Căn có ít hơn 6 ảnh | Thẻ có gợi ý "Nên thêm ảnh: sale cần ít nhất 6 ảnh". Không có ảnh thì chỗ ảnh ghi "Chưa có ảnh" | Không |
| 12 | Căn tạo trong 24 giờ qua | Nhãn "Mới thêm" (giả định GD14) | `can.created_at` |
| 13 | Chạm ảnh hay thẻ căn | Mở CN5-02 của căn đó | Không |
| 14 | Bấm "Thêm căn" | Mở CN5-A1 | Không |

Phòng ngủ và số giường ghi theo `docs/luat-chung/Tu_dien.md` (mục Phòng ngủ và số giường): "2PN · 3 giường", chưa nhập số giường thì "2PN", Studio thì "Studio". Không bao giờ ghi "x khách", "x người lớn", "y trẻ em".

### Thêm căn

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 15 | Mở form | CN5-A1, tiêu đề "Thêm căn": ô "Mã căn (tên căn hộ) *", hàng chip "Số phòng ngủ *" ("Studio", "1PN", "2PN", "3PN", "4PN+"), mục "ẢNH" ("Bạn có thể thêm sau"), dòng "Thêm tòa nhà, mô tả gửi khách, view..." đang thu gọn, nút "Thêm căn" ở thanh dưới | Không |
| 16 | Chưa có mã căn hay số phòng ngủ | Nút "Thêm căn" không bấm được, dòng "Còn thiếu: mã căn, số phòng ngủ" (chỉ nêu ô còn thiếu) | Không |
| 17 | Đã có mã căn và số phòng ngủ | Dòng "Đủ thông tin. Ảnh, giá thêm sau cũng được.", nút sáng | Không |
| 18 | Bấm "Thêm căn" | Nút chuyển trạng thái đang lưu, không bấm lại được | `fn_tao_can`: kiểm dữ liệu (mục Luật kiểm), ghi `can` với người giữ là người gọi; có ảnh thì gắn theo thứ tự (`fn_gan_anh_can`); mã trùng căn chưa ẩn của chính người gọi thì từ chối. Trigger ghi thông báo "chủ nhà thêm căn" cho sale được chia sẻ "tất cả căn" (hiển thị: US21) |
| 19 | (lưu được) | Về CN5 (CN5-A4 khi đây là căn đầu tiên, CN5-A4b khi đã có căn khác). Toast "Đã thêm phòng 1509". Thẻ căn mới đứng đầu, có nhãn "Mới thêm" | Không |
| 20 | (database từ chối) | CN5-A3: ở lại form, giữ mọi ô, dòng đầu "Chưa thêm được căn. Sửa <số> chỗ bên dưới.", câu lỗi ngay dưới ô sai (ví dụ "Đã có căn 1509. Kiểm tra lại mã căn.") | Trả lỗi P0001 kèm câu |
| 21 | (mất mạng hay quá 15 giây không có trả lời) | Ở lại form, giữ dữ liệu, toast "Chưa lưu được vì mất mạng. Kiểm tra mạng rồi bấm lại." | Xem dòng dưới bảng |

Bấm lại sau mất mạng có thể tạo căn hai lần nếu lần trước thực ra đã lưu. Lần thứ hai bị chặn bởi luật mã căn không trùng và báo "Đã có căn 1509". Chống gửi trùng bằng `client_id` cho tạo căn: [MỞ: US1-H6].

Còn ảnh đang tải hay tải lỗi thì không bấm được "Thêm căn" (mục Ảnh căn).

### Ảnh căn

Dùng ở form Thêm căn (CN5-A1, CN5-A2, CN5-A3) và Sửa căn (CN5-02). Cách chọn ảnh trên PWA: `docs/luat-chung/PWA.md` mục P6 (ô chọn file, không xin quyền).

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 22 | Bấm "Thêm ảnh · chọn nhiều ảnh cùng lúc" | Mở ô chọn ảnh của điện thoại, chọn được nhiều ảnh | Không |
| 23 | Chọn ảnh | Mỗi ảnh một ô theo thứ tự chọn. App thu ảnh về JPEG cạnh dài 1600 px (bỏ vị trí chụp) rồi tải lên ngay từng ảnh. Ô đang tải ghi "Đang tải 60%". Tiêu đề "ẢNH (5)", dòng "Đang tải 1 ảnh. Chờ tải xong mới thêm được căn." (CN5-A2) | Tải file lên Storage, bucket `anh-can`, thư mục của chính người tải; `fn_dang_ky_anh` trả mã ảnh tạm chưa gắn căn |
| 24 | (ảnh đầu tiên) | Ô đầu có nhãn "Ảnh đại diện". Dòng "Ảnh đầu tiên là ảnh đại diện · Tối đa 12 ảnh" | Không |
| 25 | (tải lỗi) | Ô ghi "Tải lỗi" với nút "Thử lại" và ✕ (CN5-A3). Bấm "Thử lại" tải lại đúng ảnh đó; bấm ✕ bỏ ảnh | Không ghi gì |
| 26 | Chọn quá số ảnh còn trống | Nhận đủ tới 12 ảnh, bỏ phần thừa, toast "Mỗi căn tối đa 12 ảnh. Đã bỏ <n> ảnh." | Gắn hơn 12 ảnh bị từ chối |
| 27 | Đủ 12 ảnh | Nút "Thêm ảnh" không bấm được | Không |
| 28 | Bấm ✕ trên một ảnh đã tải | Bỏ ảnh khỏi danh sách | Không gọi ngay. Lưu căn thì ảnh không còn trong danh sách bị bỏ khỏi căn |

Ảnh nhận: JPEG, PNG, HEIC, mỗi ảnh tới 15 MB và không quá 40 triệu điểm ảnh. File khác hay quá cỡ thì ô đó ghi lỗi "Ảnh phải là JPEG, PNG hoặc HEIC, tối đa 15 MB" và không tải. Ảnh tạm không gắn vào căn nào sau 24 giờ thì bị xóa.

### Tòa nhà, loại view, số giường, mô tả

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 29 | Bấm "Thêm tòa nhà, mô tả gửi khách, view..." | Mở phần thêm (CN5-A1, phần mở rộng): hàng chip "Tòa nhà" (tòa mình đã dùng trước, rồi tòa có sẵn, tối đa 6 chip, chip cuối "+ Tòa khác"), hàng chip "Loại view" ("Biển", "Thành phố", "Núi"), ô số "Số giường" (không bắt buộc), ô "Mô tả gửi khách" (dòng gợi ý "Sale dùng đoạn này khi gửi thông tin căn cho khách."), nút "Thu gọn" | Đọc `toa_nha` qua RLS |
| 30 | Chạm "+ Tòa khác" | CN5-A1b: ô "Tên tòa nhà", danh sách tòa (tên và khu vực), ghi chú "Chọn tòa có sẵn để sale lọc đúng tòa. Không thấy thì thêm tòa mới." | Không |
| 31 | Gõ chữ vào ô tên tòa | Danh sách chỉ còn tòa có tên chứa chữ đã gõ (không phân biệt hoa thường, dấu). Dòng cuối "+ Thêm tòa mới "<chữ đã gõ>"" | Lọc trên danh sách đã đọc |
| 32 | Chọn một tòa | Tòa đó gắn vào căn (lưu cùng căn) | Không |
| 33 | Chạm "+ Thêm tòa mới …" | Tòa mới được chọn cho căn | `fn_them_toa_nha`: thêm tòa vào danh sách chung, không cần duyệt. Tên trùng một tòa đã có (không phân biệt hoa thường) thì trả tòa đã có (giả định GD21) |
| 34 | Bấm "Thu gọn" | Ẩn phần thêm, giữ giá trị đã nhập | Không |

Phần này không bắt buộc. Số giường không vào dòng "Còn thiếu". Chọn được một loại view cho một căn ([MỞ: CH-018]). Khu vực của tòa người dùng thêm: [MỞ: US1-H5]; tới khi có câu trả lời, tòa mới không có khu vực.

### Sửa căn

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 35 | Chạm một thẻ ở CN5 | CN5-02, tiêu đề "Sửa phòng 1509", hai tab "Thông tin" và "Giá" (tab Giá: US4). Tab Thông tin điền sẵn mọi ô của căn: mã căn, số phòng ngủ, ảnh theo thứ tự, tòa, loại view, số giường, mô tả | Đọc căn và ảnh qua RLS |
| 36 | Bấm "Đổi thứ tự" ở mục ảnh | Mỗi ảnh có nút đưa lên trước, ra sau. Ảnh số 1 là ảnh đại diện | Không |
| 37 | Thêm, bỏ ảnh | Như mục Ảnh căn | Như mục Ảnh căn |
| 38 | Sửa các ô khác | Như form thêm. Xóa trống ô số giường là bỏ số giường | Không |
| 39 | Bấm "Lưu thay đổi" | Nút đang lưu. Lưu được thì về CN5, toast "Đã lưu phòng 1509" | `fn_sua_can`: chỉ người giữ căn, căn chưa ẩn; chỉ ghi ô có gửi; `anh_ids` là danh sách ảnh mới đầy đủ theo thứ tự; mã trùng căn chưa ẩn khác của mình thì từ chối |
| 40 | (database từ chối) | Ở lại, giữ dữ liệu, câu lỗi dưới ô sai như bước 20 | Trả lỗi P0001 kèm câu |
| 41 | Bấm quay lại khi đã sửa mà chưa lưu | Hỏi "Bỏ thay đổi chưa lưu?" với hai nút "Bỏ thay đổi" và "Ở lại" | Không |

Bỏ một ảnh ở CN5-02 có hỏi lại không: [MỞ: US1-H4]. Tới khi có câu trả lời, không hỏi (ảnh chỉ thật sự bị bỏ khi bấm "Lưu thay đổi").

### Xóa căn

Xóa căn là ẩn căn (quy tắc "Xóa căn là ẩn căn"). Vị trí nút, màn sau khi xóa: [MỞ: US1-H3]. Có hỏi lại trước khi xóa không: [MỞ: CH-021]. Hai câu này chỉ chặn phần giao diện; phần database làm được ngay.

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 42 | Bấm xóa căn 3402 | (hỏi lại nếu CH-021 trả lời có) | Không |
| 43 | (căn còn đặt phòng chưa hủy có ngày trả sau hôm nay, hoặc còn yêu cầu đặt phòng đang chờ chưa hết hạn) | Toast đỏ "Căn còn đặt phòng sắp tới", căn giữ nguyên | `fn_an_can` từ chối với câu trên. Ngày tính theo giờ Việt Nam |
| 44 | (không còn) | Căn biến khỏi CN5, lịch CN1 và CN2, chip "Phòng" ở form đặt phòng (CN4), danh sách chọn căn khi đặt giá nhiều căn và sao chép giá (CN6-05, CN6-07) | `fn_an_can` ghi `can.an_luc`. Đặt phòng, tiền từng đêm, thống kê giữ nguyên. Từ lúc đó `my_shared_can_ids()` không trả căn này nên sale không còn thấy căn ở lịch, tìm phòng, chi tiết căn |
| 45 | Thêm căn mới cùng mã với căn đã xóa | Thêm được | Mã của căn đã ẩn không tính khi kiểm trùng |

Không báo cho sale khi căn bị xóa. Bản đầu không có cách hiện lại căn đã xóa. Đặt phòng cũ của sale với căn đã xóa vẫn ở danh sách và thống kê của sale (US18). Căn đã xóa có tính vào mẫu số công suất không: [MỞ: CH-029] (US18).

### Trạng thái màn

- Đang tải danh sách căn, chi tiết căn, danh sách tòa: theo HV1 (khung xám tại chỗ).
- Mất mạng: theo HV2. Form vẫn nhập được, chỉ không lưu được; ảnh đang tải chuyển thành "Tải lỗi".
- Rời app khi đang nhập hay đang tải ảnh rồi quay lại: theo HV3, giữ dữ liệu đã nhập; ảnh chưa tải xong thì thành "Tải lỗi", bấm "Thử lại".
- Căn bị ẩn hay mất quyền trong lúc đang sửa: lưu bị từ chối, theo HV5.
- Phiên hết hạn: theo HV7.
- Toast: theo HV8.

## Tiêu chí nghiệm thu

Mỗi tiêu chí một test mang đúng mã trong tên test. Lớp test ghi ở cuối dòng: **database** (`tests/db/`), **unit** (Vitest), **E2E** (Playwright trên staging). Số theo `docs/luat-chung/Du_lieu_mau.md`, hôm nay 07/10/2026 trừ khi tiêu chí ghi ngày khác.

Vào app và chọn vai:
- **US1-NT1** Khi người chưa đăng nhập mở app, thì thấy A1 với nút "Bắt đầu ngay" và dòng điều khoản có hai link "Điều khoản" và "Chính sách quyền riêng tư"; không có ô hay hộp thoại hỏi tên, số điện thoại. · unit
- **US1-NT2** Khi người dùng đăng nhập xong sau khi bấm "Bắt đầu ngay", thì app sang A3 và không hiện popup hỏi tên, số điện thoại. · E2E
- **US1-NT3** Khi người dùng chạm thẻ "Tôi là sale" rồi chạm "Tôi là chủ nhà", thì chỉ thẻ chủ nhà ở trạng thái chọn. · unit
- **US1-NT4** Khi chưa chạm thẻ nào ở A3, thì nút "Tiếp tục" không bấm được và có dòng "Chọn một mục để tiếp tục". · unit
- **US1-NT5** Khi người dùng chọn "Tôi là chủ nhà" và bấm "Tiếp tục", thì `profiles.vai_chon` là `chu_nha`, thời điểm đồng ý điều khoản được ghi, và app mở tab Lịch. · E2E
- **US1-NT6** Khi Chị Hoa đã chọn vai chủ nhà mở lại app, thì vào thẳng tab Lịch, không thấy A1 hay A3. · unit

Màn trống và danh sách căn:
- **US1-NT7** Khi chủ nhà chưa có căn mở tab Lịch, thì thấy A4 với nút "Thêm căn đầu tiên"; bấm nút thì mở form Thêm căn. · unit
- **US1-NT8** Khi Chị Hoa có 2 căn, thì tab Căn ghi "2 căn" và có đúng 2 thẻ; căn của Anh Tuấn không có ở đó. · unit (hiển thị), database (RLS)
- **US1-NT9** Khi 1509 có 3 giường, thì thẻ ghi "2PN · 3 giường"; khi một căn 2PN chưa nhập số giường, thì thẻ ghi "2PN" và không có chữ "giường". · unit
- **US1-NT10** Khi chủ nhà xem bất kỳ thẻ căn nào, thì thẻ không có "x khách", "x người lớn" hay "y trẻ em". · unit
- **US1-NT11** Khi căn có 5 ảnh, thì thẻ có gợi ý "Nên thêm ảnh: sale cần ít nhất 6 ảnh"; có 6 ảnh thì không có gợi ý. · unit

Thêm căn:
- **US1-NT12** Khi chưa có mã căn hoặc chưa chọn số phòng ngủ, thì nút "Thêm căn" không bấm được và có dòng "Còn thiếu: …" nêu đúng ô còn thiếu. · unit
- **US1-NT13** Khi chủ nhà chỉ nhập mã căn "2105" và chọn "1PN", không mở phần thêm, không có ảnh, thì thêm căn được. · unit, database
- **US1-NT14** Khi chủ nhà bỏ trống ô "Số giường", thì dòng "Còn thiếu" không nhắc số giường và vẫn thêm được căn. · unit
- **US1-NT15** Khi Chị Hoa thêm căn mã "1509" (hoặc " 1509 ", hoặc "1509" viết khác hoa thường) trong khi đã có căn 1509 chưa xóa, thì database từ chối với câu "Đã có căn 1509. Kiểm tra lại mã căn.", câu này hiện dưới ô mã căn, và không có căn mới. · database, unit
- **US1-NT16** Khi Anh Tuấn thêm căn mã "1509", thì thêm được dù Chị Hoa đã có căn 1509. · database
- **US1-NT17** Khi thêm căn 2105 xong, thì thấy toast "Đã thêm phòng 2105" và thẻ 2105 đứng đầu tab Căn với nhãn "Mới thêm". · E2E
- **US1-NT18** Khi Anh Tuấn đọc bảng căn, thì không thấy căn nào của Chị Hoa; khi người chưa đăng nhập gọi `fn_tao_can`, thì bị từ chối. · database
- **US1-NT19** Khi lệnh tạo căn có số phòng ngủ 5, số giường 0, loại view "vinh" hay mô tả dài 2.001 ký tự, thì database từ chối với câu tiếng Việt nêu đúng ô sai (mục Luật kiểm), không phải lỗi chung. · database

Ảnh:
- **US1-NT20** Khi còn ảnh đang tải, thì nút "Thêm căn" không bấm được và có dòng "Đang tải 1 ảnh. Chờ tải xong mới thêm được căn.". · unit
- **US1-NT21** Khi một ảnh tải lỗi, thì ô ảnh đó có nút "Thử lại" và ✕, và căn không thêm được cho tới khi ảnh đó tải lại được hoặc bị bỏ. · unit
- **US1-NT22** Khi đã có 12 ảnh, thì nút "Thêm ảnh" không bấm được; chọn 15 ảnh khi chưa có ảnh nào thì chỉ nhận 12; lệnh gắn 13 ảnh gửi thẳng tới database bị từ chối với câu "Mỗi căn tối đa 12 ảnh". · unit, database
- **US1-NT23** Khi chủ nhà chọn 3 ảnh, thì ảnh chọn đầu tiên có nhãn "Ảnh đại diện" và sau khi lưu là ảnh trên thẻ căn. · unit
- **US1-NT24** Khi Anh Tuấn gửi lệnh gắn một ảnh tạm của Chị Hoa vào căn của mình, hoặc tải file vào thư mục của Chị Hoa trong bucket `anh-can`, thì bị từ chối. · database
- **US1-NT25** Khi người dùng chọn một file 20 MB hay một file PDF, thì ô đó báo "Ảnh phải là JPEG, PNG hoặc HEIC, tối đa 15 MB" và không tải lên; lệnh tải file 20 MB thẳng vào bucket cũng bị từ chối. · unit, database

Tòa nhà, view, số giường:
- **US1-NT26** Khi chủ nhà gõ "green" vào ô tên tòa ở CN5-A1b, thì danh sách chỉ còn "Green Bay" và có dòng "+ Thêm tòa mới "green"". · unit
- **US1-NT27** Khi chủ nhà mở hàng chip "Loại view", thì thấy đúng "Biển", "Thành phố", "Núi" và không có "Vịnh". · unit
- **US1-NT28** Khi Chị Hoa thêm tòa mới "Bim Hạ Long", thì Anh Tuấn mở CN5-A1b thấy "Bim Hạ Long" trong danh sách. · database
- **US1-NT29** Khi một người thêm tòa mới tên "icon40" trong khi đã có "ICON40", thì không có tòa thứ hai và căn gắn với "ICON40" (giả định GD21). · database

Sửa căn:
- **US1-NT30** Khi chủ nhà mở sửa căn 1509, thì các ô hiện đúng mã căn, số phòng ngủ, ảnh theo thứ tự, tòa, loại view, số giường, mô tả hiện có. · unit
- **US1-NT31** Khi chủ nhà đưa ảnh thứ 2 lên đầu và lưu, thì ảnh đó thành ảnh đại diện. · database, unit
- **US1-NT32** Khi Chị Hoa đổi mã 3402 thành "1509", thì database từ chối với câu "Đã có căn 1509. Kiểm tra lại mã căn." và 3402 không đổi. · database
- **US1-NT33** Khi chủ nhà sửa số giường 1509 từ 3 thành 2 rồi lưu, thì thẻ ghi "2PN · 2 giường"; xóa trống ô rồi lưu, thì thẻ ghi "2PN". · unit, database
- **US1-NT34** Khi Sale Hùng (được chia sẻ 1509) hoặc Anh Tuấn gửi lệnh sửa căn 1509, thì database từ chối và 1509 không đổi. · database

Xóa căn:
- **US1-NT35** Khi Chị Hoa xóa 3402 lúc 3402 còn B2 (17/10 → 19/10), thì app báo "Căn còn đặt phòng sắp tới" và 3402 vẫn ở tab Căn. · unit
- **US1-NT36** Khi căn 2105 của Chị Hoa không có đặt phòng nhưng có yêu cầu đặt phòng đang chờ của Sale Lan, và Chị Hoa xóa 2105, thì database từ chối với câu "Căn còn đặt phòng sắp tới". · database
- **US1-NT37** Khi lệnh ẩn 3402 gửi thẳng tới database lúc 3402 còn B2, thì database từ chối và 3402 không bị ẩn. · database
- **US1-NT38** Khi hôm nay là 02/12/2026, đặt phòng cuối cùng của 3402 là B9 trả phòng 02/12 và không còn yêu cầu chờ, thì Chị Hoa xóa được 3402. · database
- **US1-NT39** Khi Chị Hoa xóa được 2105, thì tab Căn bớt một thẻ, 2105 không còn ở lịch CN1 và ở chip "Phòng" của form đặt phòng. · E2E
- **US1-NT40** Khi hôm nay là 25/12/2026 và Chị Hoa xóa 3402, thì doanh thu tháng 10 của Chị Hoa vẫn 11.800.000đ, trong đó 3402 vẫn 5.100.000đ. · database
- **US1-NT41** Khi hôm nay là 25/12/2026 và Chị Hoa xóa 3402, thì 3402 không còn ở lịch và kết quả tìm phòng của Sale Lan, còn B2 và B4 vẫn ở danh sách đặt phòng của Sale Lan. · database
- **US1-NT42** Khi Chị Hoa đã xóa căn 2105 rồi thêm căn mới mã "2105", thì thêm được, không báo trùng. · database
- **US1-NT43** Khi chủ nhà đã xóa một căn, thì không có màn hay hàm nào cho hiện lại căn đó. · unit (không có nút), database (không có hàm bỏ `an_luc`)
- **US1-NT44** Khi Anh Tuấn hoặc Sale Hùng gửi lệnh xóa 3402 của Chị Hoa, thì database từ chối và 3402 không bị ẩn. · database
- **US1-NT45** Khi lệnh ẩn 2105 và lệnh ghi đặt phòng vào 2105 chạy cùng lúc, thì không bao giờ có căn đã ẩn mà còn đặt phòng có ngày trả sau hôm nay. · database

## Luật kiểm dữ liệu và lỗi

Database là chỗ chặn thật; app chặn trước cho người dùng thấy sớm. Câu lỗi database trả bằng mã P0001 để app hiện nguyên câu (`docs/luat-chung/Nghiep_vu.md` mục 1.6).

| Ô | Bắt buộc | Luật | Câu lỗi khi sai |
|---|---|---|---|
| Mã căn | có | Bỏ khoảng trắng đầu cuối, 1 đến 50 ký tự. Không trùng căn chưa xóa của cùng người giữ (không phân biệt hoa thường). Khác người giữ thì trùng được | "Mã căn không được trống" · "Mã căn dài quá 50 ký tự" · "Đã có căn <mã>. Kiểm tra lại mã căn." |
| Số phòng ngủ | có | 0 (Studio) đến 4 (4PN+) | "Cần chọn số phòng ngủ" · "Số phòng ngủ không hợp lệ" |
| Số giường | không | Số nguyên 1 đến 50; trống là chưa nhập | "Số giường từ 1 đến 50" |
| Loại view | không | `bien`, `thanh_pho`, `nui` | "Loại view không hợp lệ" |
| Tòa nhà | không | Tòa có trong danh sách | "Không tìm thấy tòa nhà" |
| Mô tả gửi khách | không | Tối đa 2.000 ký tự | "Mô tả dài tối đa 2.000 ký tự" |
| Ảnh | không | Tối đa 12, không trùng; mỗi ảnh là ảnh tạm của chính người gọi hoặc ảnh đang gắn căn này | "Mỗi căn tối đa 12 ảnh" · "Danh sách ảnh bị trùng" · (ảnh của người khác: lỗi quyền, app hiện câu chung) |
| File ảnh | (khi tải) | JPEG, PNG, HEIC; tới 15 MB; không quá 40 triệu điểm ảnh | "Ảnh phải là JPEG, PNG hoặc HEIC, tối đa 15 MB" |
| Tên tòa mới | có (khi thêm tòa) | Bỏ khoảng trắng đầu cuối, 1 đến 100 ký tự | "Tên tòa từ 1 đến 100 ký tự" |
| Vai | có (khi chọn vai) | `chu_nha` hoặc `sale` | "Vai không hợp lệ" |

Xóa căn: "Căn còn đặt phòng sắp tới". Căn không có, đã xóa, hay của người khác: lỗi quyền (mã 42501), app hiện "Có lỗi xảy ra. Bạn thử lại sau ít phút." để không lộ căn có tồn tại hay không.

## Quyền

Theo `docs/luat-chung/PQ.md`. Mỗi dòng có test vi phạm ở lớp database.

- PQ3.CHU: chỉ người giữ căn thêm, đọc, sửa, xóa căn và ảnh của căn đó (US1-NT18, US1-NT24, US1-NT34, US1-NT44).
- PQ3.SALE: sale được chia sẻ căn không sửa, không xóa (US1-NT34, US1-NT44); căn đã xóa thì sale không còn thấy (US1-NT41).
- PQ3.LINK: người chưa đăng nhập không tạo căn (US1-NT18); ảnh không mở được bằng đường dẫn trực tiếp khi không có quyền (policy `anh_can_doc` của Storage).
- PQ1.CHU: chỉ người đó ghi `vai_chon` của mình (`fn_cap_nhat_ho_so` chỉ sửa hồ sơ người gọi).
- Danh sách tòa: mọi người đã đăng nhập đọc được và thêm được tòa mới; không ai sửa, xóa tòa ngoài quản trị (`docs/luat-chung/Nghiep_vu.md`, nhóm Căn và giá, bảng "Ai thấy gì", dòng Danh sách tòa nhà).

## Database

Bảng: `profiles` (`vai_chon`, `dong_y_dieu_khoan_luc`), `can`, `anh_can`, `toa_nha`, Storage bucket `anh-can`. Ý định và bất biến: `docs/Thiet_ke_DB.md` mục 3. Cột và tham số: `docs/tu-sinh/Bang_va_cot.md`.

Đã có và đã chạy test:
- `fn_tao_can(p jsonb)`, `fn_sua_can(p_can uuid, p jsonb)`: test ở `tests/db/t_07_can_gia_mo_rong.sql`, `t_01_phan_quyen.sql`.
- `fn_dang_ky_anh(p_duong_dan text)`, `fn_gan_anh_can(p_can uuid, p_anh_ids uuid[])`: test ở `t_07_can_gia_mo_rong.sql`.
- `fn_an_can(p_can uuid)`, `can_con_dat_phong(p_can uuid)`: test ở `t_07_can_gia_mo_rong.sql`.
- `fn_cap_nhat_ho_so(p jsonb)`: test ở `t_02_gia.sql`, `t_11_ket_noi_quan_tri.sql`.
- Chỉ mục `can_ma_theo_nguoi_giu` (mã không trùng trong căn chưa xóa của một người giữ), trigger `tb_can_moi`, việc định kỳ `don_dep` (xóa dòng ảnh tạm quá 24 giờ).

**Database đang lệch story, phải sửa trong PR của story này** (thêm migration mới, test, và dòng trong `scripts/thu-lam-hong.sh`):
1. `fn_them_toa_nha` chưa có test. Viết test cho US1-NT28, US1-NT29.
2. Lỗi do ràng buộc bảng (số phòng ngủ ngoài 0 đến 4, số giường ngoài 1 đến 50, loại view lạ, mô tả quá 2.000 ký tự, tòa không có) đang ra mã 23514 hay 23503, app chỉ hiện câu chung. Sửa: `fn_tao_can` và `fn_sua_can` kiểm trước, báo P0001 với câu ở mục Luật kiểm (US1-NT19).
3. `fn_an_can` và các hàm ghi đặt phòng, yêu cầu (`fn_chu_ghi_booking`, `fn_sale_gui_yeu_cau`, `fn_chu_tra_loi_yeu_cau`) không khóa dòng căn, nên ẩn căn và ghi đặt phòng cùng lúc có thể cùng qua. Sửa: cả hai phía khóa dòng `can` (`select … for update`) trước khi kiểm (US1-NT45).
4. Bucket `anh-can` chưa giới hạn cỡ file và loại file. Sửa: đặt `file_size_limit` 15 MB và `allowed_mime_types` JPEG, PNG, HEIC (US1-NT25).
5. Ảnh bị bỏ khỏi căn (`fn_gan_anh_can`) và ảnh tạm quá 24 giờ (`don_dep`) chỉ xóa dòng `anh_can`, file vẫn nằm trong Storage. Sửa: xóa cả file, hoặc ghi đường dẫn vào một bảng chờ xóa để việc định kỳ xóa.
6. Chưa giới hạn số ảnh tạm một người đang giữ. Thêm: `fn_dang_ky_anh` từ chối khi người gọi đang giữ quá 50 ảnh tạm chưa gắn, câu "Bạn đang có quá nhiều ảnh chưa gắn vào căn. Thêm căn hoặc bỏ bớt ảnh rồi thử lại."
7. `fn_cap_nhat_ho_so` nhận `vai_chon` bất kỳ và để ràng buộc bảng báo lỗi chung. Sửa: kiểm và báo "Vai không hợp lệ".

Đọc qua RLS, không cần hàm: căn của mình, ảnh của căn mình, danh sách tòa, đặt phòng của căn mình có đêm hôm nay (tình trạng trên thẻ), hồ sơ của mình.

## Màn hình

Hình: `python3 docs/thiet-ke/trich-man.py <mã>`. Chữ và số trên hình lệch story thì story đúng.

- **A1 · Chào mừng.** Đúng bố cục.
- **A3, A3-00 · Chọn vai.** Đúng bố cục. A3-00 ghi thẻ chủ nhà là "Tôi có căn cho thuê": dùng "Tôi là chủ nhà" như A3.
- **A4 · Chủ nhà mới, chưa có căn.** Đúng bố cục. **A4-01** như A4 có dải xanh.
- **CN5 · Danh sách căn.** Thẻ 1509 trên hình ghi "4 khách" và "12 ảnh": bỏ số khách (US1-NT10), số ảnh theo dữ liệu thật. Hình có 4 căn (Greenbay, 2208), bộ mẫu chỉ có 2. Dòng giá và nút "Đặt giá cho căn này" thuộc US4.
- **CN5-A1, CN5-A1b, CN5-A2, CN5-A3 · Thêm căn** (trống, phần mở rộng, đang tải ảnh, lỗi khi lưu). Đúng bố cục.
- **CN5-A4, CN5-A4b · Đã thêm căn.** Vị trí toast trên hình là của bản Zalo; bản PWA theo HV8.
- **CN5-02 · Sửa căn.** Đúng bố cục. Hình chưa có hộp "Bỏ thay đổi chưa lưu?" và chưa có toast "Đã lưu phòng 1509".
- Xóa căn: chưa có hình (US1-H3).

## Luật chung dùng

Nhóm Căn và giá ở `docs/luat-chung/Nghiep_vu.md`: Căn tối thiểu, Mã căn không trùng, Ảnh căn, Tòa nhà dùng chung, Xóa căn là ẩn căn. Nhóm Đăng nhập, vai trò, kết nối: Điều khoản khi tiếp tục, Xin số điện thoại đúng lúc. Ảnh: `Nghiep_vu.md` mục 1.8; `docs/luat-chung/PWA.md` mục P1, P6. Từ ngữ: `docs/luat-chung/Tu_dien.md` (Phòng ngủ và số giường, Loại view). HV1, HV2, HV3, HV5, HV7, HV8 ở `docs/luat-chung/HV.md`.

## Câu hỏi mở và giả định

- [MỞ: US1-H1] Sale được chia sẻ "tất cả căn" có được báo khi chủ nhà thêm căn mới không? Database đang ghi thông báo `chu_them_can` (trigger `tb_can_moi`).
- [MỞ: US1-H2] Kịch bản kiểm tay của phần tòa nhà dùng tòa "Green Hạ Long Test": thêm tòa này vào dữ liệu mẫu hay đổi kịch bản sang "Green Bay"?
- [MỞ: US1-H3] Nút xóa căn đặt ở đâu (CN5-02 hay thẻ căn), và sau khi xóa app hiện gì?
- [MỞ: US1-H4] Bỏ một ảnh ở màn sửa căn có hỏi lại không?
- [MỞ: US1-H5] Người dùng thêm tòa mới thì khu vực của tòa nhập thế nào (ô chữ, chọn từ danh sách, hay để quản trị điền sau)?
- [MỞ: US1-H6] Tạo căn có cần chống gửi trùng bằng mã lần gửi như ghi đặt phòng không, hay luật mã căn không trùng là đủ?
- [MỞ: CH-018] Chọn được nhiều loại view cho một căn không?
- [MỞ: CH-021] Xóa căn có hỏi lại một lần không?
- [MỞ: CH-029] Căn đã xóa có tính vào mẫu số công suất không? (US18)
- GD14: nhãn "Mới thêm" hiện trong 24 giờ sau khi thêm.
- GD21: thêm tòa có tên trùng một tòa đã có (không phân biệt hoa thường) thì dùng tòa đã có, không tạo tòa thứ hai.

## Việc cần làm

- [ ] Hỏi Tùng US1-H1 đến US1-H6, CH-018, CH-021 trước khi làm phần liên quan. Phần còn lại làm được ngay.
- [ ] Test database cho các tiêu chí lớp database (US1-NT8, US1-NT13, US1-NT15, US1-NT16, US1-NT18, US1-NT19, US1-NT22, US1-NT24, US1-NT25, US1-NT28, US1-NT29, US1-NT31 đến NT34, NT36 đến NT38, NT40 đến NT45). Chạy thấy đỏ ở các chỗ database đang lệch.
- [ ] Migration sửa 7 điểm ở mục "Database đang lệch story". Thêm dòng vào `scripts/thu-lam-hong.sh` cho: mã căn không trùng, ảnh của người khác, xóa căn còn đặt phòng, khóa dòng căn khi ẩn. Chạy `scripts/bang-cot.sh`.
- [ ] Unit test cho các tiêu chí lớp unit, rồi code các màn A1, A3, A4, CN5, CN5-A1…A4b, CN5-02 và phần xóa căn; nối `src/services/api.ts` sang Supabase cho các hàm này (`docs/Ghi_chu_code.md` mục 3).
- [ ] E2E: US1-NT2, US1-NT5, US1-NT17, US1-NT39 trên staging.
- [ ] Sửa `tests/kich-ban/US1.md` theo story này: bỏ bước của Zalo, đổi ngày sang ngày còn trong tương lai, gộp kịch bản trùng.
- [ ] Kiểm tay trên điện thoại thật: luồng chính, ảnh lỗi, xóa căn còn đặt phòng.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md`.
