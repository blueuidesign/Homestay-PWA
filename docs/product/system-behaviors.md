---
id: HV
tieu_de: Hành vi chung của mọi màn
trang_thai: de-xuat
nguoi_chu: tung
rev: 2
---
# HV · Hành vi chung của mọi màn

Những trạng thái màn nào cũng gặp: đang tải, mất mạng, quay lại từ nền, xin quyền của trình duyệt, không còn quyền xem, trình duyệt thiếu tính năng, phiên hết hạn, toast. Mục "Trạng thái màn" của YC trỏ mã HV ở đây thay cho việc mỗi màn tự làm một kiểu. Màn nào cần khác thì YC của màn đó ghi rõ phần khác.

Toàn bộ HV đang ở trạng thái đề xuất, chưa có hình riêng; Tùng chưa duyệt từng câu. Cách làm của bản Zalo cho cùng hành vi: `pwa.md`.

## HV1 · Đang tải
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

## HV2 · Mất mạng, lỗi kết nối
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

## HV3 · Quay lại từ nền
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

## HV4 · Xin quyền của trình duyệt
`[r2 · sửa]`
Rủi ro: tb. Không xin quyền gì khi vừa mở app. Bản 1 không cần quyền nào: chọn ảnh dùng ô chọn file (pwa.md P6), số điện thoại nhập ở bước đăng ký (YC1.2), thông báo chỉ trong app. Khi sau này cần quyền (thông báo đẩy, vị trí), làm theo bảng dưới.

| Bước | Người dùng | App |
|---|---|---|
| 1 | Bấm việc cần quyền lần đầu | Thẻ giải thích của app trước ("Bật thông báo để biết khi có yêu cầu đặt phòng"), rồi mới gọi hộp thoại của trình duyệt |
| 2 | Từ chối | Không lỗi. Về màn cũ, việc không cần quyền vẫn làm tiếp |
| 3 | Bấm lại việc cần quyền đã từ chối | Thẻ nói vì sao cần quyền và chỉ cách bật lại trong cài đặt trình duyệt; không gọi lại hộp thoại |

Tiêu chí:
- **HV4-NT5** Khi người dùng mở app lần đầu và đi hết luồng vào app (YC1.1), thì không có hộp thoại quyền nào của trình duyệt. · e2e
- **HV4-NT6** Khi người dùng bấm "Thêm ảnh", thì mở ô chọn file, không có hộp thoại xin quyền. · unit

## HV5 · Không còn quyền xem
Rủi ro: tb. Người dùng mở thứ không còn được xem thì biết vì sao, và không thấy dữ liệu đó dù chỉ thoáng qua. Xảy ra khi chủ nhà đã ngừng cho sale xem, căn hay đặt phòng đã bị xóa, link đã hết hạn, người dùng mở màn không thuộc vai mình, hay chủ nhà đã xóa tài khoản.

| Bước | Người dùng | App |
|---|---|---|
| 1 | Mở màn, link hay thông báo trỏ tới thứ không còn quyền | "Bạn không còn xem được mục này", một dòng lý do nếu database cho biết ("Chủ nhà đã ngừng chia sẻ lịch", "Chủ nhà đã xóa tài khoản"), nút "Về Lịch". Database không trả dữ liệu của mục đó, chỉ trả lý do |
| 2 | Đang xem thì bị thu hồi quyền | Lần tải lại kế tiếp (HV1, HV3) đổi sang màn ở bước 1 |

Tiêu chí:
- **HV5-NT1** Khi Chị Hoa đã ngừng cho Sale Hùng xem và Hùng mở 1509 từ thông báo cũ, thì thấy "Bạn không còn xem được mục này" với lý do, và dữ liệu trả về không có giá, lịch, ảnh. · database, unit
- **HV5-NT2** Khi Chị Hoa đã xóa tài khoản và Hùng mở 1509 từ thông báo cũ, thì lý do là "Chủ nhà đã xóa tài khoản". · database, unit

## HV6 · Trình duyệt thiếu tính năng
Rủi ro: thấp. Người dùng trên trình duyệt cũ hay trình duyệt trong Zalo vẫn làm được việc, chỉ bằng cách khác.

| Bước | Người dùng | App |
|---|---|---|
| 1 | Bấm việc cần tính năng trình duyệt không có (bảng chia sẻ, chia sẻ file, sao chép) | Làm bằng cách khác: không có bảng chia sẻ thì sao chép chữ rồi báo "Đã sao chép, dán vào Zalo để gửi"; không chia sẻ được file thì tải ảnh về máy (YC8.1) |
| 2 | Không có cách khác | Báo "Trình duyệt này chưa làm được việc này. Mở app bằng Chrome hay Safari." Không đứng im |

Tiêu chí:
- **HV6-NT2** Khi trình duyệt không có bảng chia sẻ và người dùng bấm "Gửi chữ", thì chữ được sao chép và có toast "Đã sao chép, dán vào Zalo để gửi". · unit

## HV7 · Phiên đăng nhập hết hạn
Rủi ro: tb. Người dùng không phải đăng nhập lại giữa chừng.

| Bước | Người dùng | App |
|---|---|---|
| 1 | Đang dùng app khi phiên sắp hết | App tự làm mới phiên; việc vừa bị từ chối vì hết phiên được gửi lại một lần |
| 2 | Làm mới không được | Giữ nội dung đang nhập (HV3), đưa về đăng nhập (YC1.2); đăng nhập xong quay lại đúng màn cũ |

Tiêu chí:
- **HV7-NT1** Khi phiên hết hạn lúc chủ nhà bấm "Thêm đặt phòng" ở CN4, thì đặt phòng vẫn được lưu và chủ nhà không thấy màn đăng nhập. · unit
- **HV7-NT2** Khi làm mới phiên không được, thì sau khi đăng nhập lại, form CN4 còn nội dung đã nhập. · e2e

## HV8 · Toast
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

## Câu hỏi còn mở
Ở `work/cau-hoi.md`: HV1-H1 (chờ bao lâu thì coi là lỗi), HV3-H1 (nháp giữ bao lâu).

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r2 | 2026-11-19 | Claude | QD22-chot-dang-nhap | Theo QD22: số điện thoại lấy lúc đăng ký | HV4 |
