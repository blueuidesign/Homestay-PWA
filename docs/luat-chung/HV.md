<!-- Luật chung, sống. Hành vi mọi màn phải theo. Tiêu chí nghiệm thu của các luật này nằm ở story US36. -->

# HV · Hành vi hệ thống dùng chung

Các trạng thái mọi màn đều gặp: đang tải, mất mạng, quay lại từ nền, đã từ chối quyền Zalo, không còn quyền xem, Zalo cũ, phiên hết hạn, và kiểu toast dùng chung (HV8). Mục "Trạng thái màn" của YC trỏ mã HV ở đây thay cho việc mỗi màn tự vẽ một kiểu. Màn nào cần khác HV thì YC của màn đó ghi rõ phần khác. Tất cả nội dung dưới đây ở trạng thái đề xuất.

## HV1 · Đang tải
Rủi ro: thap
Mục đích: người dùng biết app đang làm việc, không bấm lại hai lần, không tưởng app treo.
Khi nào xảy ra: mở màn cần dữ liệu từ server; bấm nút gửi dữ liệu lên server.

| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở màn lần đầu, máy chưa có dữ liệu | Hiện khung xám đúng bố cục của màn (skeleton), không hiện vòng quay giữa màn trống | Trả dữ liệu | | |
| 2 | Mở màn đã từng xem | Hiện ngay dữ liệu lần trước, kèm dòng nhỏ "Đang cập nhật…" ở đầu màn. Có dữ liệu mới thì thay vào | Trả dữ liệu | | |
| 3 | Bấm nút gửi (Lưu, Gửi yêu cầu, Chấp nhận...) | Nút đổi chữ thành "Đang lưu…" hoặc "Đang gửi…", không bấm lại được tới khi có kết quả | Xử lý | | |
| 4 | Chờ quá lâu | Hết thời gian chờ thì chuyển sang HV2 | | | |

Tiêu chí nghiệm thu: ở story US36, tìm theo mã HV<số>-NT<số>.

## HV2 · Mất mạng, lỗi kết nối
> **Bản PWA:** mất mạng biết qua sự kiện `offline`, `online` của trình duyệt và lỗi khi gọi Supabase.
Rủi ro: tb
Mục đích: người dùng ở đảo, trên tàu, sóng yếu vẫn xem được dữ liệu đã có, và không bao giờ tưởng đã lưu khi chưa lưu.
Khi nào xảy ra: Zalo báo mất mạng (`NetworkChanged`), hoặc gọi server không được, hoặc hết thời gian chờ.

| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Đang xem màn thì mất mạng | Dải màu warning ở đầu màn: "Mất kết nối. Lịch có thể chưa mới nhất." Dữ liệu đã có vẫn hiện, vẫn cuộn, vẫn chạm xem được | | `NetworkChanged` | |
| 2 | Mở màn chưa từng xem khi mất mạng | Giữa màn: "Chưa tải được. Kiểm tra mạng rồi bấm Thử lại", nút "Thử lại" | | | |
| 3 | Bấm nút gửi khi mất mạng | Báo "Chưa lưu được, bấm lại khi có mạng". Nội dung đang nhập giữ nguyên | | | |
| 4 | Có mạng lại | Dải cảnh báo tự mất, màn tải lại dữ liệu. Không tự gửi lại việc đã báo chưa lưu | | `NetworkChanged` | |
| 5 | Server báo lỗi khác | "Có lỗi, chưa làm được. Bấm Thử lại", nút "Thử lại". Không hiện mã lỗi kỹ thuật | | | |

Tiêu chí nghiệm thu: ở story US36, tìm theo mã HV<số>-NT<số>.

## HV3 · Quay lại từ nền
> **Bản PWA:** nháp lưu bằng IndexedDB hoặc localStorage của trình duyệt, bọc try/catch; vẫn chỉ chứa thứ mất cũng được. "Quay lại từ nền" là sự kiện `visibilitychange`.
Rủi ro: cao
Mục đích: người dùng rời app để gọi điện, chat, chia sẻ rồi quay lại, không mất nội dung đang nhập và thấy dữ liệu mới nhất.
Khi nào xảy ra: app ra nền (`AppPaused`) rồi quay lại (`AppResumed`); hoặc hệ điều hành đã giải phóng app và người dùng mở lại; hoặc người dùng bấm một link khác của app khi app đang chạy nền (`OpenApp`).

| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Sửa một ô trong form (booking, căn, giá, yêu cầu đặt phòng) | Lưu nháp của form vào Native Storage mỗi lần sửa | | | Nháp trên máy |
| 2 | Rời app rồi quay lại | Vẫn ở đúng màn cũ, form giữ nguyên. Tải lại dữ liệu có thể đã đổi: lịch, yêu cầu đang chờ, thông báo | Trả dữ liệu | `AppResumed` | |
| 3 | Mở lại app sau khi app bị giải phóng | Mở lại đúng form đó, điền lại nháp, báo "Đã khôi phục nội dung bạn đang nhập" | | | |
| 4 | Bấm lưu sau khi quay lại, mà dữ liệu đã đổi (ví dụ đêm vừa bị đặt) | Server kiểm lại và báo lỗi theo YC của màn đó. Form giữ nguyên để sửa | Kiểm lại | | |
| 5 | Lưu xong, hoặc bấm Hủy, hoặc bỏ form | Xóa nháp | | | Xóa nháp |
| 6 | Bấm link khác của app khi app đang chạy nền | Chuyển tới màn của link mới. Nháp form cũ vẫn giữ | | `OpenApp` | |
| 7 | Chọn ảnh | Tải ảnh lên server ngay khi chọn, không giữ ở máy tới lúc bấm lưu | Lưu ảnh | | Ảnh |

Nháp chỉ chứa thứ mất cũng được (theo `docs/zalo/rang-buoc.md`: Native Storage không phải nơi lưu dữ liệu thật). Nháp booking được chứa tên, số khách (QD-011), xóa khi lưu xong hoặc hủy.

Tiêu chí nghiệm thu: ở story US36, tìm theo mã HV<số>-NT<số>.

## HV4 · Người dùng đã từ chối quyền
> **Bản PWA:** không có hộp thoại quyền của Zalo. Chọn ảnh dùng ô chọn file, không cần quyền. Số điện thoại theo mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5) và CH-001. Thông báo đẩy (khi làm) xin bằng hộp thoại của trình duyệt, có thẻ giải thích trước; từ chối thì chỉ còn thông báo trong app và thẻ chỉ cách bật lại trong cài đặt trình duyệt. Các NT nói "hộp thoại Zalo" đọc là hộp thoại tương ứng của trình duyệt, nếu có.
Rủi ro: tb
Mục đích: người dùng đã bấm từ chối trong hộp thoại của Zalo vẫn biết cách bật lại, và không gặp nút bấm không phản hồi.
Khi nào xảy ra: người dùng bấm việc cần quyền (số điện thoại, chọn ảnh, tên và ảnh Zalo, nhận thông báo) mà `getSetting` báo quyền đã bị từ chối.

| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Bấm việc cần quyền lần đầu | Màn hoặc thẻ giải thích của app trước, rồi mới gọi hộp thoại Zalo (với số điện thoại: mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5)). Tên và số điện thoại xin trong cùng một lần: một thẻ giải thích, người dùng bấm đồng ý một lần thì app xin cả tên và ảnh (`scope.userInfo`) và số (`getPhoneNumber`), không bắt bấm lại việc gốc (mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5)) | | Hộp thoại xin quyền. Tên và số ra một hộp thoại hay hai, thứ tự nào: cần kiểm tra trên máy thật | |
| 2 | Từ chối trong hộp thoại Zalo | Không lỗi. Quay về màn cũ, việc không cần quyền vẫn làm tiếp được | | Trả `-201`. Số điện thoại: không nhớ, gọi lại thì hộp thoại hiện lại. Tên và ảnh (`-1401`), và từ chối một trong hai khi xin cùng lúc: chưa thử. Quyền khác: chưa thử, tài liệu ghi là nhớ | |
| 3a | Bấm lại việc cần tên và số điện thoại | Hiện lại thẻ giải thích (mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5)), người dùng bấm đồng ý thì gọi lại hộp thoại Zalo. Thẻ có thêm nút "Mở cài đặt quyền" | | Hộp thoại xin quyền | |
| 3b | Bấm lại việc cần quyền khác | Không xin lại. Thẻ: câu nói vì sao cần quyền, nút "Mở cài đặt quyền" | | | |
| 4 | Bấm "Mở cài đặt quyền" | | | `openPermissionSetting` | |
| 5 | Bật quyền rồi quay lại | Làm tiếp việc đang dở | | | |

Câu trên thẻ theo từng quyền:
| Quyền | Câu | Khi từ chối thì app làm gì |
|---|---|---|
| Tên và số điện thoại (xin cùng lúc, mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5)) | "Cần tên và số điện thoại để kết nối với chủ nhà" | Theo mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5). Từ chối tên: người dùng tự gõ tên ở P2, ảnh hiện chữ cái đầu (mục "Hồ sơ (Thông tin cá nhân)" (US21)). Từ chối số: bên kia chỉ thấy tên (mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5) bước 3) |
| Chọn ảnh | "Cần quyền chọn ảnh để thêm ảnh căn" | Căn vẫn lưu được khi chưa có ảnh |
| Nhận thông báo | "Bật thông báo để biết khi có yêu cầu đặt phòng" | Thông báo vẫn có trong app (mục "Cài đặt thông báo" (US21)) |

Tiêu chí nghiệm thu: ở story US36, tìm theo mã HV<số>-NT<số>.

## HV5 · Không còn quyền xem
Rủi ro: tb
Mục đích: người dùng mở thứ họ không còn được xem thì biết vì sao, và không thấy dữ liệu đó dù chỉ thoáng qua.
Khi nào xảy ra: chủ nhà đã ngừng chia sẻ lịch với sale, căn hoặc booking đã bị xóa, link đã hết hạn, người dùng mở màn không thuộc vai của mình, hoặc chủ nhà đã xóa tài khoản (mục "Khi người dùng xóa tài khoản" (US22), QD-013) mà sale mở căn, lịch của chủ nhà đó từ thông báo cũ hay màn cũ. Căn, lịch, giá vẫn còn ở server nhưng không gửi cho sale. Lý do khi chủ nhà đã xóa tài khoản: "Chủ nhà đã xóa tài khoản". Đặt phòng đã thành giao dịch với người đã xóa tài khoản thì không dùng HV5: vẫn mở được, tên người đó kèm ghi chú đỏ "Đã xoá tài khoản", không có số điện thoại (mục "Khi người dùng xóa tài khoản" (US22) bước 5). Sale bấm gửi yêu cầu đặt phòng vào căn của chủ nhà đã xóa tài khoản từ màn mở trước đó thì không sang màn HV5 mà app báo ngay "Không gửi được yêu cầu. Chủ nhà đã xóa tài khoản trên Home247." (QD-013).

| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở màn, link hoặc thông báo trỏ tới thứ không còn quyền | Màn: "Bạn không còn xem được mục này", một dòng lý do nếu server cho biết (ví dụ "Chủ nhà đã ngừng chia sẻ lịch"), nút "Về Lịch" | Không gửi dữ liệu của mục đó, chỉ gửi lý do | | |
| 2 | Đang xem thì bị thu hồi quyền | Lần tải lại kế tiếp (HV1, HV3) đổi sang màn ở bước 1 | | | |

Không dùng HV5 cho việc chủ nhà tắt "hiện giá cho sale". Trường hợp đó theo CH-068.

Tiêu chí nghiệm thu: ở story US36, tìm theo mã HV<số>-NT<số>.

## HV6 · Nền tảng thiếu tính năng (Zalo cũ, trình duyệt cũ)
> **Bản PWA:** "Zalo cũ" thành "trình duyệt thiếu tính năng" (ví dụ không có bảng chia sẻ): nút vẫn làm được việc bằng cách khác, như sao chép chữ rồi báo "Đã sao chép, dán vào Zalo để gửi". Không có nút "Cập nhật Zalo".
Rủi ro: thap
Mục đích: người dùng lớn tuổi hay không cập nhật Zalo vẫn biết vì sao nút không chạy.
Khi nào xảy ra: bấm việc cần tính năng mà phiên bản Zalo trên máy chưa có (`getSystemInfo`).

| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Bấm việc cần tính năng mới | "Zalo của bạn cần cập nhật để dùng tính năng này", nút "Cập nhật Zalo" | | | |
| 2 | Bấm "Cập nhật Zalo" | | | `requestUpdateZalo` | |

Tiêu chí nghiệm thu: ở story US36, tìm theo mã HV<số>-NT<số>.

## HV7 · Phiên đăng nhập hết hạn
> **Bản PWA:** Supabase tự làm mới phiên. Làm mới không được thì giữ nội dung theo HV3 rồi mới đưa về đăng nhập; đăng nhập xong quay lại đúng màn cũ.
Rủi ro: tb
Mục đích: người dùng không bao giờ phải đăng nhập lại giữa chừng.
Khi nào xảy ra: server báo phiên của app đã hết hạn.

| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Đang dùng app | Lấy phiên mới ngầm bằng tài khoản Zalo, gửi lại đúng yêu cầu vừa bị từ chối một lần | Cấp phiên mới | Định danh người dùng | |
| 2 | Lấy phiên mới không được | Theo HV2 bước 5. Nội dung đang nhập giữ theo HV3 | | | |

Tiêu chí nghiệm thu: ở story US36, tìm theo mã HV<số>-NT<số>.

## HV8 · Toast
> **Bản PWA:** không có cụm "··· ✕" của Zalo; toast ở đầu màn, ngay dưới thanh tiêu đề của app.

Rủi ro: thap
Mục đích: người dùng lớn tuổi luôn thấy thông báo ngắn ở cùng một chỗ, cùng một kiểu, trên mọi màn.
Khi nào xảy ra: app báo ngắn kết quả một việc vừa xong (ví dụ "Đã thêm đặt phòng Sale Hùng · 1509" ở CN4-03 (mục "Chủ nhà ghi booking mới" (US3)), "Đã gửi lịch thành công" ở CN10-02, chủ nhà đồng ý cho xem lịch ở A9) mà không chuyển màn.

| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Làm xong một việc có toast | Hiện toast theo một kiểu dùng chung cho mọi màn, ở vị trí chung: đầu màn, ngay dưới thanh tiêu đề và cụm ··· ✕ của Zalo, nổi trên nội dung. Kiểu và vị trí cụ thể theo mô tả màn (ví dụ A9) | | | |
| 2 | Không làm gì | Toast tự tắt sau 3 giây | | | |
| 3 | Đang ở màn xoay giả (S1-05) | Dùng toast tự vẽ của app, cùng kiểu và vị trí chung tính trên khung ngang. Không dùng `showToast` của Zalo vì toast Zalo vẫn hiện chiều dọc (`docs/zalo/hanh-vi.md` mục 7.1) | | | |

Tiêu chí nghiệm thu: ở story US36, tìm theo mã HV<số>-NT<số>.

## Câu hỏi còn mở
Ở `docs/Cau_hoi_mo.md`: HV-H1 (chờ bao lâu thì coi là lỗi), HV-H3 (nháp giữ bao lâu). Các câu về hộp thoại quyền và thời gian giữ app ở nền thuộc bản Zalo, ghi ở `docs/zalo/hanh-vi.md`.
