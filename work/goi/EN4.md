---
item: EN4
task: [EN4-TA1]
model: sonnet               # theo CL14.6a, mức cao nhất mà các task cần
soan_luc: e383d69
soan_bang: scripts/goi.py
---
# Gói việc EN4

Soạn bằng scripts/goi.py (CL10.6, skill soan-viec-cho-subagent). Agent phụ chỉ đọc gói này và code, không đọc CLAUDE.md. Gặp chỗ gói không nói thì dừng, ghi câu hỏi vào work/cau-hoi.md, không tự đoán. Xóa khi item sang xong.

## Việc
"Hành vi chung mọi màn: đang tải, mất mạng, quay lại app, quyền, phiên hết hạn, toast" (work/backlog/EN4-hanh-vi-chung-moi-man.md).

- [ ] EN4-TA1 Code · Claude Code (sonnet, CL14.6a): thành phần đang tải, báo lỗi mạng, đọc lại khi quay lại từ nền, thẻ xin quyền, màn không còn quyền, trình duyệt thiếu tính năng, phiên hết hạn, toast; test unit mang mã HV-NT

## Bất biến của Home247
- Hai lớp giá: giá chủ nhà và giá sale bán. Khách không bao giờ thấy giá chủ nhà. Chủ nhà không thấy mức cộng, giá bán, tiền chênh của sale.
- Căn đã chia sẻ cho sale nào thì sale đó luôn thấy giá chủ nhà. Không có công tắc tắt giá (QD7).
- Giá tính theo đêm. Booking chiếm các đêm từ ngày nhận tới trước ngày trả.
- Tiền là số nguyên đồng. Ngày theo giờ Việt Nam.
- Được lưu tên, số điện thoại khách trong booking; người nhập tự xin phép khách. Mỗi người chỉ thấy khách do mình nhập (QD11).
- Căn sale tự nhập không có lịch trống. Ô ngày hiện "?", không bao giờ hiện "trống".
- Chặn trùng booking ở database, không chỉ ở giao diện (QD6). Đọc qua RLS, ghi qua hàm `fn_*` tự kiểm quyền. Sale không đọc bảng booking.
- Booking có sale đứng tên: một bên xin hủy, bên kia đồng ý (QD12). Xóa tài khoản chỉ xóa số điện thoại, dữ liệu giữ nguyên (QD13).
- Chữ trên màn gọi "đặt phòng". Tài liệu và code gọi "booking".
- Người dùng nhiều người lớn tuổi, dùng một tay: vùng bấm 44 px. Chữ 14 px ở màn đọc, 12–13 px ở màn dày thông tin, không dưới 12 px.

- Không bắt đăng nhập, không xin quyền khi vừa mở app. Màn đầu xem được khi chưa đăng nhập. Đăng nhập bằng mã gửi về email, không có mật khẩu ở môi trường nào; đăng ký phải có tên và số điện thoại mới vào app (QD22).
- Chia sẻ dùng bảng chia sẻ của điện thoại, máy không có thì sao chép. Link là https trên tên miền của Home247.
- Thông báo chỉ trong app ở bản 1. Không có thông báo đẩy.
- Lưu trên máy (IndexedDB, localStorage) bọc try/catch, chỉ lưu thứ mất cũng được.
- Không có App Secret hay khóa service_role trong app. Khóa anon của Supabase là công khai.
- App nhẹ, người dùng mạng yếu. Nơi đặt dữ liệu chờ QD23.

## NT phải đạt
- **HV8-NT1** Khi hai màn khác nhau hiện toast, thì hai toast cùng kiểu, cùng chỗ. · unit
- **HV8-NT2** Khi toast hiện và người dùng không chạm gì, thì toast tự tắt sau 3 giây. · unit

Các NT khác của HV1 đến HV8 gắn màn cụ thể, kiểm ở US sau (QD27). EN4 vẫn viết test unit cho chính từng thành phần (tên test ghi mã HV, ví dụ "HV2: dải Mất kết nối").

## Ví dụ số
### QT5.5 · docs/product/rules/QT5-luat-nen.md
##### QT5.5 · Lỗi
- Database từ chối bằng một câu tiếng Việt viết cho người dùng, ví dụ "Căn này đã được đặt rồi". App hiện nguyên câu đó, có thể kèm việc làm tiếp.
- Lỗi khác (mất mạng, lỗi không lường trước): app hiện câu chung theo HV2, không hiện chữ kỹ thuật.
- Câu báo lỗi luôn nói: chuyện gì, vì sao, làm gì tiếp.
- Người không có quyền với một bản ghi nhận câu "Không tìm thấy…", giống như bản ghi không tồn tại, để không lộ là nó có.

Dùng ở: mọi YC.

(Không kèm HV2 vì đoạn trích không có màn. Cần thì gọi riêng.)

## Quyết định liên quan
Không có.

## Hành vi chung
### HV1 · docs/product/system-behaviors.md
##### HV1 · Đang tải
Rủi ro: thấp. Người dùng biết app đang làm việc, không bấm lại hai lần, không tưởng app treo.

| Bước | Người dùng | App |
|---|---|---|
| 1 | Mở màn lần đầu, máy chưa có dữ liệu | Khung xám đúng bố cục của màn (skeleton), không có vòng quay giữa màn trống |
| 2 | Mở màn đã từng xem | Hiện ngay dữ liệu lần trước, dòng nhỏ "Đang cập nhật…" ở đầu màn; có dữ liệu mới thì thay vào |
| 3 | Bấm nút ghi (Lưu, Gửi yêu cầu, Chấp nhận…) | Nút đổi chữ thành "Đang lưu…" hay "Đang gửi…", không bấm lại được tới khi có kết quả |
| 4 | Chờ quá lâu | Sang HV2 bước 5. Bao lâu là quá lâu: [MỞ: HV1-H1] |

Tiêu chí:
- **HV1-NT1** Khi người dùng bấm "Đặt phòng" ở S6-05 rồi bấm thêm lần nữa trong lúc đang lưu, thì database chỉ có một đặt phòng. · unit, database
- **HV1-NT2** Khi mở lại tab Lịch đã xem, thì lịch cũ hiện ngay, không có màn trống. · unit

### HV2 · docs/product/system-behaviors.md
##### HV2 · Mất mạng, lỗi kết nối
Rủi ro: tb. Người dùng ở đảo, trên tàu, sóng yếu vẫn xem được dữ liệu đã có, và không bao giờ tưởng đã lưu khi chưa lưu. App biết mất mạng qua sự kiện `offline`, `online` của trình duyệt và lỗi khi gọi database.

| Bước | Người dùng | App |
|---|---|---|
| 1 | Đang xem thì mất mạng | Dải cảnh báo ở đầu màn "Mất kết nối. Lịch có thể chưa mới nhất."; dữ liệu đã có vẫn hiện, vẫn cuộn, vẫn chạm xem được |
| 2 | Mở màn chưa từng xem khi mất mạng | Giữa màn "Chưa tải được. Kiểm tra mạng rồi bấm Thử lại", nút "Thử lại" |
| 3 | Bấm nút ghi khi mất mạng | "Chưa lưu được, bấm lại khi có mạng". Nội dung đang nhập giữ nguyên |
| 4 | Có mạng lại | Dải cảnh báo tự mất, màn tải lại. Không tự gửi lại việc đã báo chưa lưu |
| 5 | Database báo lỗi không lường trước | "Có lỗi, chưa làm được. Bấm Thử lại", nút "Thử lại". Không hiện mã lỗi kỹ thuật. Lỗi database trả câu cho người dùng thì hiện câu đó (QT5.5) |

Tiêu chí:
- **HV2-NT1** Khi mất mạng và người dùng bấm "Đặt phòng" ở S6-05, thì app báo "Chưa lưu được, bấm lại khi có mạng", form giữ nguyên, database không có đặt phòng mới. · unit
- **HV2-NT2** Khi có mạng lại, thì app không tự gửi đặt phòng đã báo chưa lưu. · unit
- **HV2-NT3** Khi mất mạng lúc đang xem lịch, thì lịch đã tải vẫn hiện, kèm dải "Mất kết nối". · unit

### HV3 · docs/product/system-behaviors.md
##### HV3 · Quay lại từ nền
Rủi ro: cao. Người dùng rời app để gọi điện, chat, chia sẻ rồi quay lại, không mất nội dung đang nhập và thấy dữ liệu mới nhất. "Quay lại từ nền" là sự kiện `visibilitychange`.

| Bước | Người dùng | App |
|---|---|---|
| 1 | Sửa một ô trong form (đặt phòng, căn, giá, yêu cầu) | Lưu nháp của form trên máy (pwa.md P10) mỗi lần sửa |
| 2 | Rời app rồi quay lại | Vẫn ở đúng màn, form giữ nguyên. Tải lại dữ liệu có thể đã đổi: lịch, yêu cầu đang chờ, thông báo (YC12.1) |
| 3 | Mở lại app sau khi trình duyệt đã đóng trang | Mở lại đúng form đó, điền lại nháp, báo "Đã khôi phục nội dung bạn đang nhập" |
| 4 | Bấm lưu sau khi quay lại mà dữ liệu đã đổi (ví dụ đêm vừa bị đặt) | Database kiểm lại và báo lỗi theo YC của màn; form giữ nguyên để sửa |
| 5 | Lưu xong, bấm Hủy hay bỏ form | Xóa nháp |
| 6 | Mở một link khác của app khi app đang mở | Chuyển tới màn của link mới; nháp form cũ vẫn giữ |
| 7 | Chọn ảnh | Tải ảnh lên ngay khi chọn, không giữ ở máy tới lúc bấm lưu |

Nháp chỉ chứa thứ mất cũng được. Nháp đặt phòng được chứa tên, số khách (QD11), xóa khi lưu xong hay hủy. Nháp giữ bao lâu: [MỞ: HV3-H1].

Tiêu chí:
- **HV3-NT1** Khi chủ nhà đang nhập đặt phòng ở CN4, rời app 5 phút rồi quay lại, thì form còn đủ căn, ngày, số tiền đã nhập. · unit
- **HV3-NT2** Khi trang bị đóng hẳn lúc form CN5-A1 đang nhập dở và người dùng mở lại, thì form được điền lại và có dòng "Đã khôi phục nội dung bạn đang nhập". · e2e
- **HV3-NT3** Khi sale quay lại app sau khi chủ nhà vừa chấp nhận yêu cầu, thì yêu cầu hiện trạng thái mới mà sale không phải tải lại. · unit
- **HV3-NT4** Khi lưu đặt phòng thành công, thì mở lại form CN4 không còn nháp cũ. · unit

### HV4 · docs/product/system-behaviors.md
##### HV4 · Xin quyền của trình duyệt

Rủi ro: tb. Không xin quyền gì khi vừa mở app. Bản 1 không cần quyền nào: chọn ảnh dùng ô chọn file (pwa.md P6), số điện thoại nhập ở bước đăng ký (YC1.2), thông báo chỉ trong app. Khi sau này cần quyền (thông báo đẩy, vị trí), làm theo bảng dưới.

| Bước | Người dùng | App |
|---|---|---|
| 1 | Bấm việc cần quyền lần đầu | Thẻ giải thích của app trước ("Bật thông báo để biết khi có yêu cầu đặt phòng"), rồi mới gọi hộp thoại của trình duyệt |
| 2 | Từ chối | Không lỗi. Về màn cũ, việc không cần quyền vẫn làm tiếp |
| 3 | Bấm lại việc cần quyền đã từ chối | Thẻ nói vì sao cần quyền và chỉ cách bật lại trong cài đặt trình duyệt; không gọi lại hộp thoại |

Tiêu chí:
- **HV4-NT5** Khi người dùng mở app lần đầu và đi hết luồng vào app (YC1.1), thì không có hộp thoại quyền nào của trình duyệt. · e2e
- **HV4-NT6** Khi người dùng bấm "Thêm ảnh", thì mở ô chọn file, không có hộp thoại xin quyền. · unit

### HV5 · docs/product/system-behaviors.md
##### HV5 · Không còn quyền xem
Rủi ro: tb. Người dùng mở thứ không còn được xem thì biết vì sao, và không thấy dữ liệu đó dù chỉ thoáng qua. Xảy ra khi chủ nhà đã ngừng cho sale xem, căn hay đặt phòng đã bị xóa, link đã hết hạn, người dùng mở màn không thuộc vai mình, hay chủ nhà đã xóa tài khoản.

| Bước | Người dùng | App |
|---|---|---|
| 1 | Mở màn, link hay thông báo trỏ tới thứ không còn quyền | "Bạn không còn xem được mục này", một dòng lý do nếu database cho biết ("Chủ nhà đã ngừng chia sẻ lịch", "Chủ nhà đã xóa tài khoản"), nút "Về Lịch". Database không trả dữ liệu của mục đó, chỉ trả lý do |
| 2 | Đang xem thì bị thu hồi quyền | Lần tải lại kế tiếp (HV1, HV3) đổi sang màn ở bước 1 |

Tiêu chí:
- **HV5-NT1** Khi Chị Hoa đã ngừng cho Sale Hùng xem và Hùng mở 1509 từ thông báo cũ, thì thấy "Bạn không còn xem được mục này" với lý do, và dữ liệu trả về không có giá, lịch, ảnh. · database, unit
- **HV5-NT2** Khi Chị Hoa đã xóa tài khoản và Hùng mở 1509 từ thông báo cũ, thì lý do là "Chủ nhà đã xóa tài khoản". · database, unit

### HV6 · docs/product/system-behaviors.md
##### HV6 · Trình duyệt thiếu tính năng
Rủi ro: thấp. Người dùng trên trình duyệt cũ hay trình duyệt trong Zalo vẫn làm được việc, chỉ bằng cách khác.

| Bước | Người dùng | App |
|---|---|---|
| 1 | Bấm việc cần tính năng trình duyệt không có (bảng chia sẻ, chia sẻ file, sao chép) | Làm bằng cách khác: không có bảng chia sẻ thì sao chép chữ rồi báo "Đã sao chép, dán vào Zalo để gửi"; không chia sẻ được file thì tải ảnh về máy (YC8.1) |
| 2 | Không có cách khác | Báo "Trình duyệt này chưa làm được việc này. Mở app bằng Chrome hay Safari." Không đứng im |

Tiêu chí:
- **HV6-NT2** Khi trình duyệt không có bảng chia sẻ và người dùng bấm "Gửi chữ", thì chữ được sao chép và có toast "Đã sao chép, dán vào Zalo để gửi". · unit

### HV7 · docs/product/system-behaviors.md
##### HV7 · Phiên đăng nhập hết hạn
Rủi ro: tb. Người dùng không phải đăng nhập lại giữa chừng.

| Bước | Người dùng | App |
|---|---|---|
| 1 | Đang dùng app khi phiên sắp hết | App tự làm mới phiên; việc vừa bị từ chối vì hết phiên được gửi lại một lần |
| 2 | Làm mới không được | Giữ nội dung đang nhập (HV3), đưa về đăng nhập (YC1.2); đăng nhập xong quay lại đúng màn cũ |

Tiêu chí:
- **HV7-NT1** Khi phiên hết hạn lúc chủ nhà bấm "Thêm đặt phòng" ở CN4, thì đặt phòng vẫn được lưu và chủ nhà không thấy màn đăng nhập. · unit
- **HV7-NT2** Khi làm mới phiên không được, thì sau khi đăng nhập lại, form CN4 còn nội dung đã nhập. · e2e

### HV8 · docs/product/system-behaviors.md
##### HV8 · Toast
Rủi ro: thấp. Người dùng lớn tuổi luôn thấy thông báo ngắn ở cùng một chỗ, cùng một kiểu.

| Bước | Người dùng | App |
|---|---|---|
| 1 | Làm xong một việc có toast (ví dụ "Đã thêm đặt phòng Sale Hùng · 1509" ở YC5.3) | Toast ở đầu màn, ngay dưới thanh tiêu đề, cách mép trái phải 12 px, nổi trên nội dung, nền tối, chữ trắng 14 px đậm, dấu ✓, không có nút ✕ |
| 2 | Không làm gì | Toast tự tắt sau 3 giây |
| 3 | Đang ở màn xoay giả (S1-05) | Toast đọc theo chiều ngang cùng bảng, vị trí chung tính trên khung ngang |

Tiêu chí:
- **HV8-NT1** Khi hai màn khác nhau hiện toast, thì hai toast cùng kiểu, cùng chỗ. · unit
- **HV8-NT2** Khi toast hiện và người dùng không chạm gì, thì toast tự tắt sau 3 giây. · unit
- **HV8-NT3** Khi đang xoay giả ở S1-05 và có toast, thì toast đọc theo chiều ngang. · unit

Mã HV4-NT1 đến NT4 và HV6-NT1 là tiêu chí của bản Zalo (hộp thoại quyền, cập nhật Zalo), không dùng ở bản PWA và không cấp lại.

## Database và quyền
Không có.

## Màn
Không có.

## Tài liệu khác
### pwa.md · docs/external/pwa.md
---
id: PWA
tieu_de: Bản PWA làm khác bản Zalo ở đâu
trang_thai: de-xuat
nguoi_chu: tung
rev: 2
---
> Luật chung, sống. Bảng đổi từ cách làm của Zalo sang cách làm của PWA.

#### Bản PWA làm khác bản Zalo ở đâu

YC, HV và PQ viết cho bản PWA. Bản Zalo Mini App làm sau trên cùng database (QD3). File này giữ bảng đối chiếu: mỗi việc của Zalo thì bản PWA làm thế nào, để khi làm bản Zalo chỉ cần đổi cột cách làm, giữ kết quả người dùng thấy. YC trỏ tới đây bằng mã P (ví dụ pwa.md P3).

Chỗ ghi `[MỞ: mã]` là câu hỏi đang chờ Tùng ở `work/cau-hoi.md`. Chưa có trả lời thì không code phần đó.

| Mục | Bản Zalo | Bản PWA | Áp vào |
| --- | --- | --- | --- |
| P1 · Đăng nhập | Bấm "Bắt đầu ngay", app lấy access token của Zalo, máy chủ đổi ra ID Zalo; không hỏi gì | Mã gửi về email qua Supabase Auth (QD22, YC1.2). Không có mật khẩu ở môi trường nào, kể cả staging. Hồ sơ là bảng `profiles`, ID là ID của Supabase Auth. Giữ nguyên: A1 hiện được khi chưa đăng nhập, không xin quyền khi vừa mở, dòng điều khoản ở A1. Dòng "Đăng nhập bằng Zalo · Đã liên kết" ở P1, P2 thay bằng dòng đăng nhập bằng email. "Đăng nhập lại bằng Zalo" đọc là "đăng nhập lại" | YC1.2, YC1.1, YC6.3 bước 3, YC1.3, HV7 |
| P2 · Tên và số điện thoại | Popup giải thích (YC6.1), rồi hộp thoại của Zalo xin tên, ảnh, số một lần (YC6.1); máy chủ đổi token số trong 2 phút; số chỉ xem (YC1.4) | Người dùng tự nhập tên và số ở bước đăng ký, xong mới vào app (QD22, YC1.2). Số không xác minh bằng mã. Không có popup xin số lúc chia sẻ (YC6.1 bỏ). Database kiểm số trước khi ghi: 9 đến 15 chữ số, cho phép dấu + đầu. Sau đăng ký số chỉ xem (YC1.4) | YC1.2, YC1.4, PQ2 |
| P3 · Gửi tin, chia sẻ | Cửa sổ gửi tin hay chia sẻ của Zalo (`openShareSheet`), gửi chữ hoặc ảnh, không cùng lúc; mở tin riêng cho từng người được | Bảng chia sẻ của điện thoại (`navigator.share`), người dùng tự chọn Zalo. Ảnh gửi bằng `navigator.share({ files })` nếu trình duyệt cho; không cho thì gửi chữ, ảnh tải về máy. Không có bảng chia sẻ thì sao chép (HV6). App không biết người nhận và không biết đã gửi thật chưa, như bản Zalo. Không mở tin riêng cho từng sale đã chọn được (US26-NT1): YC8-H5. Chữ nút ("Gửi qua Zalo" hay "Gửi") theo YC8-H5 | YC6.4, YC6.6, YC6.2, YC8.1, YC10.1, YC10.3 |
| P4 · Link | Link Mini App dạng `zalo.me/s/…`, thẻ tin trong chat Zalo có nút "Mở và trả lời" | Link https của app trên tên miền của Home247 (ví dụ `/l/<mã>` cho link mời, `/x/<mã>` cho link xin lịch). Gửi đi là tin chữ kèm link. Bấm link trong Zalo mở trình duyệt bên trong Zalo; app phải chạy đủ ở đó. Mã link là chuỗi ngẫu nhiên, không chứa số điện thoại, ID người dùng hay giá | YC6.3, YC6.4, YC6.5, YC6.6 |
| P5 · Gọi, nhắn | `openPhone` mở ứng dụng gọi; `openChat` mở chat với người hay OA | Gọi: link `tel:<số>`. Nhắn Zalo cho một người: link `https://zalo.me/<số>`. Nhắn Zalo cho Home247: link `https://zalo.me/<OA của Home247>`. Bản PWA được mở link ra ngoài | YC6.2, YC9.2, YC9.4, YC7.4, YC10.2, YC10.3, YC1.7 |
| P6 · Ảnh | `chooseImage`, quyền ảnh do Zalo hỏi | Ô chọn file `accept="image/*"`, không xin quyền. Tải lên ngay khi chọn (HV3), luật ảnh ở QT5.7 | YC3.2, YC3.5, YC10.3, HV4 |
| P7 · Thông báo | Bản đầu chỉ trong app; sau có thể qua OA Zalo | Chỉ trong app. App lấy thông báo khi mở, khi quay lại từ nền, và mỗi 60 giây khi đang mở (hoặc Supabase Realtime). Thông báo đẩy của trình duyệt: làm sau | YC6.8, YC12.1, YC12.4 |
| P8 · Xóa tài khoản | Người dùng xóa trong Zalo, Zalo gọi webhook; không có nút trong app | Nút xóa tài khoản trong app (màn: YC1-H6), hàm `fn_xoa_tai_khoan`. Kết quả cho người còn lại theo quy tắc QT6.5 Người đã xóa tài khoản (QT5, QT6) | YC1.8, PQ23 |
| P9 · "Từ chối quyền" trong Trạng thái màn | Người dùng từ chối hộp thoại quyền Zalo | Đọc theo HV4 bản PWA. Phần lớn màn ghi "không áp dụng" | Mọi YC |
| P10 · Lưu trên máy | Native Storage, tối đa 5 MB | IndexedDB hoặc localStorage, bọc try/catch, chỉ thứ mất cũng được (nháp, bộ lọc đang chọn) | HV3 |
| P11 · Trang quản trị | Web riêng ngoài Mini App | Cùng PWA, đường dẫn `/quan-tri`, chỉ tài khoản trong `admins`. Làm sau bản 1; trước đó ngày lễ và tòa nhà nạp bằng seed | YC13 |
| P12 · Ràng buộc nền tảng | Bản build dưới 10 MB, mỗi file dưới 3 MB, không link ra ngoài Zalo, dữ liệu ở Việt Nam (`docs/_lich-su/zalo/rang-buoc.md`) | Không có giới hạn build của Zalo, nhưng vẫn giữ app nhẹ (người dùng mạng yếu). Nơi đặt dữ liệu: QD23 | Toàn bộ |
| P13 · Phiên bản trình duyệt | "Zalo cũ" (HV6) | Trình duyệt thiếu tính năng (HV6 bản PWA) | HV6 |

## Mã được nhắc nhưng không chép
Đọc thêm bằng `python3 scripts/trich.py <mã>` nếu task cần: PQ2, PQ23, QD11, QD22, QD23, QD3, QT5.1, QT5.10, QT5.2, QT5.3, QT5.4, QT5.6, QT5.7, QT5.8, QT5.9, QT6, QT6.5.

## Quy ước code
# Quy ước khi viết code

- Chỉ code theo mục YC có trong `thuc_hien` của item. Câu có [MỞ: ...] thì không code phần đó. Câu có "(giả định GDn)" thì code được và ghi rõ trong PR.
- Code luôn trên nhánh <mã>-<tên-ngắn> và PR (CL4.7). Hook trước khi đẩy chặn commit code lên main.
- Đọc gói việc (work/goi/<mã item>.md, soạn bằng scripts/goi.py) nếu có, không thì đọc item. Tài liệu đọc bằng scripts/trich.py, không mở cả file. Canvas đọc bằng scripts/trich-man.py.
- Chỉ sửa file trong mục Phạm vi của item hoặc ô "Được sửa" của gói việc. File ngoài phạm vi thì dừng và tạo item mới.
- Mỗi tiêu chí một test mang mã đó trong tên, ví dụ `YC5.3-NT2`. Viết test trước code. Tiêu chí chưa có test thì item chưa xong. Không tắt, xóa, sửa test để cho qua. kiem.py luật `nt-test` báo đỏ khi NT của item đã mở PR thiếu test hay thiếu lớp (EN8).
- Test ở đúng lớp ghi sau dấu · của tiêu chí (CL14.5): quyền, tiền, chặn trùng ở lớp database trên Postgres thật; màn ở unit; luồng chính ở e2e.
- Task được giao sau một task viết test trước thì không sửa file test của task đó.
- Chú thích code trỏ về mã tài liệu: mỗi hàm database, policy, màn, hàm tính tiền có một dòng chú thích ghi mã YC, QT, PQ, HV nó làm (ví dụ `-- YC5.3, QT1.1, PQ7.CHU`). Không chép nội dung đặc tả vào chú thích.
- App gọi thẳng Supabase (QD4). Đọc qua RLS; ghi qua hàm `fn_*` chạy security definer và tự kiểm người gọi. Không bảng nào cho app ghi thẳng. Dữ liệu người không được thấy thì database không trả, không gửi rồi ẩn trên màn.
- Migration chỉ thêm, không sửa migration đã gộp. Đổi hàm, policy, view: thêm test database và một phép thử làm hỏng (bất biến ở docs/architecture/thiet-ke-db.md mục 3).
- Tiền là số nguyên đồng. Ngày theo giờ Việt Nam. Đặt phòng chiếm các đêm từ ngày nhận tới trước ngày trả. Chặn trùng bằng ràng buộc ở database (QD6).
- Tên, số điện thoại khách: mỗi người chỉ thấy cái mình nhập (QD11). Không ghi log chứa số điện thoại, tên khách.
- Không đọc .env. Khóa bí mật, khóa production không bao giờ có trong code, test, log hay phiên cloud. Test chạy trên dữ liệu mẫu DLM, không dữ liệu thật.
- Giao diện: vùng bấm 44 px; chữ màn đọc 14 px, màn dày thông tin 12–13 px, không dưới 12 px; cỡ cụ thể theo canvas. Mọi màn có trạng thái theo HV1 đến HV8. Lưu trên máy chỉ thứ mất cũng được, bọc try/catch (pwa.md P10).
- Đổi cấu trúc module hay thêm thư viện cần Đức duyệt (CL4.2).
- Trước khi báo xong: chạy test của phần bị đổi, `npm run typecheck`, `npm run build`, `python3 scripts/kiem.py --diff origin/main` (lệnh đầy đủ ở docs/dev/chay-va-test.md), dán lệnh và kết quả.

## Làm theo mẫu
`src/lib/tien.ts` với `src/lib/tien.test.ts` (hàm nhỏ, test vitest mang mã); `src/App.tsx` với `src/App.test.tsx` (thành phần React, Testing Library). Thành phần dùng chung đặt ở `src/chung/`, mỗi thành phần một file và một file test cạnh nó. Không thêm thư viện mới.

## Câu còn mở
- [MỞ: HV1-H1]: không làm phần này.
- [MỞ: HV3-H1]: không làm phần này.

## Được sửa
`src/chung/**` (mới), `src/styles.css`, `src/vite-env.d.ts` nếu cần kiểu, `docs/dev/chay-va-test.md` (một dòng ở Cấu trúc thư mục app nói `src/chung/`), `work/backlog/EN4-hanh-vi-chung-moi-man.md` (Kế hoạch, Bằng chứng, task).

## Test ở lớp nào
Theo lớp ghi sau dấu · ở cuối mỗi NT (database, unit, e2e; CL14.5). Rủi ro tb, một agent viết cả test và code. Chỉ unit (vitest, jsdom).

## Lệnh kiểm
Theo docs/dev/chay-va-test.md: test của gói bị đổi, `python3 scripts/kiem.py --diff origin/main`. Ghi vào mục Bằng chứng của item: lệnh đã chạy, lần đầu đỏ mấy test, sửa mấy vòng, kết quả cuối.

## Xong khi
- Test mang mã NT xanh ở đúng lớp.
- `npm run typecheck` và `npm run build` qua.
- `python3 scripts/kiem.py --diff origin/main` không có lỗi mới.
- Không sửa file ngoài "Được sửa".
- Báo lại tối đa 10 dòng: PR, lệnh đã chạy, kết quả, việc còn lại.
