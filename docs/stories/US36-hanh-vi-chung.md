# US36 · Hành vi chung mọi màn: đang tải, lỗi mạng, quay lại từ nền, xin quyền, mất quyền

- Loại: tính năng
- Trạng thái: chưa làm
- Đặc tả: thô (lắp bằng máy từ bản Zalo, chưa viết lại theo khuôn; không code theo bản này, xem US41)
- Bản: 1
- Rủi ro: tb
- Làm sau khi xong: US38
- Kiểm tay: chưa có kịch bản, viết khi làm story

## Mục tiêu
Là người dùng, ở màn nào tôi cũng thấy app phản ứng giống nhau khi đang tải, mất mạng, bị thu quyền, để không phải đoán app đang làm gì.

## Hành vi
Bảng bước ghi: người dùng làm gì, app hiện gì (chữ trong ngoặc kép là chữ trên màn), máy chủ phải làm gì, dữ liệu nào đổi. Cột "Máy chủ" mô tả việc phải xảy ra; bản PWA làm bằng RLS, view và hàm `fn_*` của Supabase.

### HV1
Nội dung luật ở `docs/luat-chung/HV.md`, mục HV1. Story này làm phần dùng chung cho mọi màn và các tiêu chí dưới đây.

### HV2
Nội dung luật ở `docs/luat-chung/HV.md`, mục HV2. Story này làm phần dùng chung cho mọi màn và các tiêu chí dưới đây.

### HV3
Nội dung luật ở `docs/luat-chung/HV.md`, mục HV3. Story này làm phần dùng chung cho mọi màn và các tiêu chí dưới đây.

### HV4
Nội dung luật ở `docs/luat-chung/HV.md`, mục HV4. Story này làm phần dùng chung cho mọi màn và các tiêu chí dưới đây.

### HV5
Nội dung luật ở `docs/luat-chung/HV.md`, mục HV5. Story này làm phần dùng chung cho mọi màn và các tiêu chí dưới đây.

### HV6
Nội dung luật ở `docs/luat-chung/HV.md`, mục HV6. Story này làm phần dùng chung cho mọi màn và các tiêu chí dưới đây.

### HV7
Nội dung luật ở `docs/luat-chung/HV.md`, mục HV7. Story này làm phần dùng chung cho mọi màn và các tiêu chí dưới đây.

### HV8
Nội dung luật ở `docs/luat-chung/HV.md`, mục HV8. Story này làm phần dùng chung cho mọi màn và các tiêu chí dưới đây.

## Tiêu chí nghiệm thu
Mỗi tiêu chí một test tự động mang đúng mã này trong tên test. Mã không đổi nghĩa; đổi hành vi thì cấp mã mới (docs/QUY_TRINH.md mục 5).

- **HV1-NT1** Khi người dùng bấm "Đặt phòng" ở S6-05 rồi bấm thêm lần nữa trong lúc đang lưu, thì server chỉ nhận một lần lưu.
- **HV1-NT2** Khi mở lại tab Lịch đã xem trước đó, thì lịch cũ hiện ngay, không có màn trống.
- **HV2-NT1** Khi mất mạng và người dùng bấm "Đặt phòng" ở S6-05, thì app báo "Chưa lưu được, bấm lại khi có mạng", form giữ nguyên, không có booking mới ở server.
- **HV2-NT2** Khi có mạng lại, thì app không tự gửi booking đã báo chưa lưu.
- **HV2-NT3** Khi mất mạng lúc đang xem lịch, thì lịch đã tải vẫn hiện, kèm dải "Mất kết nối".
- **HV3-NT1** Khi chủ nhà đang nhập booking CN4, rời app gọi điện 5 phút rồi quay lại, thì form còn đủ ngày, căn, số tiền đã nhập.
- **HV3-NT2** Khi app bị đóng hẳn lúc form CN5-A1 đang nhập dở và người dùng mở lại, thì form được điền lại và có dòng "Đã khôi phục nội dung bạn đang nhập".
- **HV3-NT3** Khi sale quay lại app sau khi chủ nhà vừa chấp nhận yêu cầu, thì yêu cầu đó hiện trạng thái mới mà sale không phải kéo tải lại.
- **HV3-NT4** Khi lưu booking thành công, thì mở lại form CN4 không còn nháp cũ.
- **HV4-NT1** Khi người dùng đã từ chối quyền chọn ảnh và bấm "Thêm ảnh", thì thấy thẻ "Cần quyền chọn ảnh để thêm ảnh căn" và nút "Mở cài đặt quyền", không thấy hộp thoại Zalo.
- **HV4-NT2** Khi người dùng đã từ chối quyền số điện thoại và bấm lại việc cần số, thì app hiện thẻ giải thích trước, và chỉ gọi hộp thoại Zalo khi người dùng bấm đồng ý trên thẻ.
- **HV4-NT3** Khi người dùng đã từ chối quyền khác số điện thoại, thì không màn nào hiện lại nút "Cho phép" như lần đầu.
- **HV4-NT4** Khi hồ sơ chưa có tên Zalo và số điện thoại, và người dùng bấm "Đồng ý, tiếp tục" ở thẻ giải thích, thì app xin cả tên và số trong lần bấm đó; người dùng không phải bấm thêm việc nào để được hỏi tên. (mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5))
- **HV5-NT1** Khi chủ nhà ngừng chia sẻ với sale và sale mở lại chi tiết căn từ thông báo cũ, thì sale thấy "Bạn không còn xem được mục này", không thấy giá hay lịch của căn.
- **HV5-NT2** Khi Chị Hoa đã xóa tài khoản và Sale Hùng mở chi tiết căn ICON40 1509 từ thông báo cũ, thì thấy "Bạn không còn xem được mục này" với lý do "Chủ nhà đã xóa tài khoản", không thấy ảnh, giá hay lịch của căn.
- **HV6-NT1** Khi Zalo trên máy cũ hơn bản cần cho một nút, thì bấm nút đó hiện câu mời cập nhật, không đứng im.
- **HV7-NT1** Khi phiên hết hạn lúc chủ nhà bấm "Thêm đặt phòng" ở CN4, thì booking vẫn được lưu và chủ nhà không thấy màn đăng nhập.
- **HV8-NT1** Khi hai màn khác nhau cùng hiện toast (ví dụ CN4-03 và A9), thì hai toast cùng một kiểu và nằm cùng một chỗ ngay dưới thanh tiêu đề.
- **HV8-NT2** Khi toast hiện và người dùng không chạm gì, thì toast tự tắt sau 3 giây.
- **HV8-NT3** Khi app đang xoay giả ở S1-05 và có toast, thì toast đọc theo chiều ngang cùng bảng, không hiện chiều dọc.

## Màn hình
Hình: `python3 docs/thiet-ke/trich-man.py <mã màn>` (docs/thiet-ke/README.md). Chữ và số trên hình lệch story thì story đúng.

**HV1-01 · Mẫu đang tải · Lịch chủ nhà**
Vào từ: Mở tab Lịch lần đầu, máy chưa có dữ liệu
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 0 | Màn gốc | Chép đúng màn CN1 trên canvas, chỉ đổi phần trạng thái. Mọi chữ, ảnh, nút trong vùng cuộn của CN1 thành khối xám đúng vị trí; tiêu đề, nút "+ Đặt phòng" và thanh tab giữ nguyên | CN1 |
| 1 | Khung xám | Khung lịch tháng 7 cột và hai dòng danh sách, cùng bố cục CN1, không có vòng quay | Bố cục CN1 |
| 2 | Thanh tab | Tab Lịch đang chọn | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Không có | Dữ liệu về thì thay bằng CN1 | CN1 |
Trạng thái riêng:
- đang tải: chính là màn này

**HV1-02 · Mẫu đang tải · Lịch phòng sale**
Vào từ: Mở tab Lịch của sale lần đầu
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 0 | Màn gốc | Chép đúng màn S1 trên canvas, chỉ đổi phần trạng thái. Mọi chữ và ô lịch trong vùng cuộn của S1 thành khối xám; ô tìm và thanh tab giữ nguyên | S1 |
| 1 | Ô tìm xám | Thay cho "Tìm phòng trống theo ngày" | |
| 2 | Khung xám | 6 hàng căn × 7 ngày | Bố cục S1 |
| 3 | Thanh tab | 4 tab của sale | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Không có | Dữ liệu về thì thay bằng S1 | S1 |
Trạng thái riêng:
- đang tải: chính là màn này

**HV1-03 · Mẫu đang lưu · nút gửi**
Vào từ: CN4, bấm "Thêm đặt phòng"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 0 | Màn gốc | Chép đúng màn CN4 trên canvas, chỉ đổi phần trạng thái. | CN4 |
| 1 | Form | Như CN4 | |
| 2 | Nút | "Đang lưu…" màu xám, không bấm được | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Không có | Lưu xong thì về CN1; lỗi thì theo HV2 | |
Trạng thái riêng:
- đang tải: chính là màn này

**HV1-04 · Mẫu đang cập nhật · có dữ liệu cũ**
Vào từ: Mở lại tab Lịch đã xem trước đó
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 0 | Màn gốc | Chép đúng màn CN1 trên canvas, chỉ đổi phần trạng thái. | CN1 |
| 1 | Dải xanh | "Đang cập nhật…" kèm vòng nhỏ | Đang gọi server |
| 2 | Lịch tháng | Dữ liệu lần trước | Bộ nhớ máy |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Không có | Có dữ liệu mới thì thay vào, dải mất | |
Trạng thái riêng:
- đang tải: chính là màn này

**HV2-01 · Mẫu mất mạng · đang xem**
Vào từ: Đang xem màn thì mất mạng
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 0 | Màn gốc | Chép đúng màn CN1 trên canvas, chỉ đổi phần trạng thái. | CN1 |
| 1 | Dải vàng | "⚠️ Mất kết nối. Lịch có thể chưa mới nhất." | NetworkChanged |
| 2 | Lịch | Dữ liệu đã có, vẫn cuộn và chạm được | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Không có | Có mạng lại thì dải tự mất | |
Trạng thái riêng:
- lỗi mạng: chính là màn này

**HV2-02 · Mẫu chưa tải được**
Vào từ: Mở màn chưa từng xem khi mất mạng
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 0 | Màn gốc | Chép đúng màn CN8 trên canvas, chỉ đổi phần trạng thái. | CN8 |
| 1 | Giữa màn | Biểu tượng tải lại, "Chưa tải được", "Kiểm tra mạng rồi bấm Thử lại." | |
| 2 | Nút | "Thử lại" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Thử lại" | Gọi lại server | Màn gốc |
Trạng thái riêng:
- lỗi mạng: chính là màn này

**HV2-03 · Mẫu chưa lưu được khi mất mạng**
Vào từ: CN4, bấm lưu khi mất mạng
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 0 | Màn gốc | Chép đúng màn CN4 trên canvas, chỉ đổi phần trạng thái. | CN4 |
| 1 | Dải vàng | "⚠️ Mất kết nối." | |
| 2 | Form | Giữ nguyên nội dung đã nhập | |
| 3 | Hộp lỗi | "Chưa lưu được, bấm lại khi có mạng. Nội dung bạn nhập vẫn giữ nguyên." | |
| 4 | Nút | "Thêm đặt phòng" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Thêm đặt phòng" | Thử lưu lại; không tự gửi khi có mạng | |
Trạng thái riêng:
- lỗi mạng: chính là màn này

**HV3-01 · Mẫu khôi phục nháp**
Vào từ: Mở lại app sau khi hệ điều hành giải phóng app lúc đang nhập CN4
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 0 | Màn gốc | Chép đúng màn CN4 trên canvas, chỉ đổi phần trạng thái. | CN4 |
| 1 | Dải xanh | "✓ Đã khôi phục nội dung bạn đang nhập" | Nháp trên máy |
| 2 | Form | Điền lại từ nháp | |
| 3 | Nút | "Thêm đặt phòng" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Thêm đặt phòng" | Lưu, xóa nháp | CN1 |
Trạng thái riêng:
- quay lại từ nền: chính là màn này

**HV4-01 · Mẫu đã từ chối quyền chọn ảnh**
Vào từ: CN5-A2 (thêm căn), bấm thêm ảnh khi quyền đã bị từ chối
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 0 | Màn gốc | Chép đúng màn CN5-A2 trên canvas, chỉ đổi phần trạng thái. Lưới ảnh của CN5-A2 thay bằng thẻ quyền; "Ảnh (0)"; dòng gợi ý thành "Căn vẫn lưu được khi chưa có ảnh."; bỏ dòng "Đang tải 1 ảnh" | CN5-A2 |
| 1 | Ô mã căn | "1509" | |
| 2 | Thẻ quyền | "Cần quyền chọn ảnh để thêm ảnh căn", "Bạn đã tắt quyền này trong Zalo. Mở cài đặt quyền để bật lại.", nút "Mở cài đặt quyền" | getSetting |
| 3 | Dòng | "Căn vẫn lưu được khi chưa có ảnh." | |
| 4 | Nút | "Lưu căn" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Mở cài đặt quyền" | Mở cài đặt quyền của Zalo | openPermissionSetting |

**HV4-02 · Mẫu đã từ chối quyền số điện thoại**
Vào từ: A6, bấm gửi khi quyền số điện thoại đã bị từ chối
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 0 | Màn gốc | Chép đúng màn A6 trên canvas, chỉ đổi phần trạng thái. Thẻ quyền và dòng "Bạn vẫn gửi được link..." chèn ngay dưới thẻ tin nhắn của A6 | A6 |
| 1 | Thẻ tin nhắn | Tin xin lịch như A6 | |
| 2 | Thẻ quyền | "Cần số điện thoại để kết nối với chủ nhà", "Lần trước bạn chưa cho phép. Bấm "Chia sẻ số điện thoại" để Zalo hỏi lại.", nút chính "Chia sẻ số điện thoại", nút phụ "Mở cài đặt quyền" | HV4 bước 3a |
| 3 | Dòng | "Bạn vẫn gửi được link. Chủ nhà chỉ thấy tên Zalo của bạn." | mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5) |
| 4 | Nút | "Gửi qua Zalo" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Chia sẻ số điện thoại" | Gọi lại hộp thoại số điện thoại của Zalo (mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5)) | Hộp thoại Zalo |
| "Mở cài đặt quyền" | Mở cài đặt quyền | openPermissionSetting |
| "Gửi qua Zalo" | Gửi link không có số | Zalo |

**HV5-01 · Mẫu không còn quyền xem**
Vào từ: Mở chi tiết căn từ thông báo cũ sau khi chủ nhà ngừng chia sẻ
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 0 | Màn gốc | Chép đúng màn S6-04 trên canvas, chỉ đổi phần trạng thái. Tiêu đề "Chi tiết căn" có nút quay lại (lấy từ S6-04); vùng nội dung là thẻ trống "Bạn không còn xem được mục này" | S6-04 |
| 1 | Giữa màn | Biểu tượng cảnh báo, "Bạn không còn xem được mục này", lý do "Chủ nhà đã ngừng chia sẻ lịch." | Server chỉ gửi lý do |
| 2 | Nút | "Về Lịch" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Về Lịch" | Về lịch | S1 |
Trạng thái riêng:
- không có quyền: chính là màn này

**HV6-01 · Mẫu Zalo cũ**
Vào từ: Bấm việc cần tính năng mới (ví dụ Gửi cho khách)
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 0 | Màn gốc | Chép đúng màn S5 trên canvas, chỉ đổi phần trạng thái. | S5 |
| 1 | Giữa màn | "Zalo của bạn cần cập nhật", "Zalo của bạn cần cập nhật để dùng tính năng này." | |
| 2 | Nút | "Cập nhật Zalo", "Để sau" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Cập nhật Zalo" | Mở cập nhật | requestUpdateZalo |
| "Để sau" | Về màn trước | |

## Việc cần làm
- [ ] Đọc story này và các luật chung nó trỏ tới. Chỗ nào gắn thẻ MỞ thì không code, hỏi Tùng (docs/Cau_hoi_mo.md).
- [ ] Viết test cho từng tiêu chí chưa có test, test đỏ trước (lớp test: docs/QUY_TRINH.md mục 6).
- [ ] Database: thêm migration nếu story cần bảng hay hàm mới, kèm test và một dòng trong `scripts/thu-lam-hong.sh`.
- [ ] Giao diện: các màn ở mục Màn hình, nối với Supabase (docs/Ghi_chu_code.md).
- [ ] E2E cho luồng chính của story.
- [ ] Viết kịch bản kiểm tay (tests/kich-ban/US36.md), rồi kiểm trên điện thoại thật.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md` trong cùng PR.
