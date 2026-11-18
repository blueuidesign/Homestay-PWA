# Thiết kế

<!-- Tài liệu sống. Luật sửa thiết kế: docs/QUY_TRINH.md mục 7. -->

Thiết kế là một file canvas HTML. Không có file mô tả màn bằng chữ: điều hình vẽ không nói được (vào từ đâu, bấm gì sang đâu, trạng thái rỗng và lỗi) nằm trong story của màn đó.

- `canvas/home247-canvas.html`: canvas đầy đủ, khoảng 2,6 MB, ảnh căn ở `canvas/anh/`. Là hình dựng sẵn, không chạy tương tác. **Không mở cả file**, dùng `trich-man.py`.
- Bản gốc là một Design artifact trên claude.ai của Tùng. Sửa thiết kế ở đó rồi xuất HTML đè lên file này trong một PR.

```bash
python3 docs/thiet-ke/trich-man.py CN4                  # HTML của một màn
python3 docs/thiet-ke/trich-man.py CN4 --chu            # chỉ chữ trên màn, mỗi đoạn một dòng
python3 docs/thiet-ke/trich-man.py CN4 --anh /tmp/CN4.png   # chụp màn bằng Playwright
grep -rln "CN4" docs/stories/                           # story nào nói về màn này
```

## Mã màn

A = vào app và kết nối · CN = chủ nhà · S = sale · P = tab Cá nhân. Hậu tố `-00` là trạng thái trống; `-01`, `-02`… là biến thể hay bước tiếp. Mỗi mã có đúng một hình trên canvas. Màn mới phải có mã mới và một dòng trong bảng dưới.

## Canvas vẽ cho Zalo Mini App, bản PWA khác ở đâu

Bản PWA dùng lại bố cục, chữ, màu. Các chỗ sau làm khác (bảng đầy đủ: `docs/luat-chung/PWA.md`):
- Không có thanh tiêu đề và cụm "··· ✕" của Zalo.
- Nút "Bắt đầu với Zalo" và các hộp thoại xin quyền của Zalo: thay theo cách đăng nhập của PWA (CH-001, story US37).
- "Gửi qua Zalo", "cửa sổ Zalo": dùng bảng chia sẻ của điện thoại; máy không có thì sao chép (CH-003).
- Màn sao lưu P7, P7-00: không làm ở bản 1 (story US40).

Chữ hay số trên hình lệch story thì story đúng. Ghi chỗ lệch vào PR.

## Danh sách màn

| Mã | Tên màn | Nhóm |
|---|---|---|
| A1 | Chào mừng và đăng nhập | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A1-link | Mở từ link mời (chưa có mã artboard riêng) | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A1-link-01 | Link sai hoặc chủ nhà đã xóa tài khoản | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A3 | Chọn vai trò | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A3-00 | Chọn vai trò · chưa chọn | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A4 | Chủ nhà mới, chưa có căn | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A4-01 | Chủ nhà mới · mở từ link xin lịch | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A5 | Sale mới, chưa có nguồn phòng | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A5-01 | Sale mới · mở từ link không dùng được | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A6 | Soạn tin xin link | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A6-P1 | Popup giải thích · sale | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A6-P2 | Hộp thoại của Zalo (minh họa) · sale | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A7 | Đã gửi, chờ chủ nhà | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A7-00 | Chờ chủ nhà · chưa gửi lần nào | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A7-01 | Chờ chủ nhà · quay lại từ Zalo | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A8 | Chủ nhà mở link của sale (tiêu đề "Lời mời xem lịch") | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A8-01 | Lời mời xem lịch · link hết hạn hoặc sale bị ngừng | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A8-P1 | Popup giải thích · chủ nhà | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A8-P2 | Hộp thoại của Zalo (minh họa) · chủ nhà | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A9 | Chủ nhà đã đồng ý · toast | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A10 | Thêm lịch của chủ nhà (QD-008) | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A10-01 | Đã có lịch của chủ nhà này · cảnh báo | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A10-02 | Đã thêm lịch · toast trên lịch sale | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A9-02 | Nhiều chủ nhà cùng đồng ý · gom một toast | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| CN7 | Sale của tôi | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| CN7-00 | Sale · chưa có sale nào | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| CN7-03 | Sale xin xem lịch · tin nhắn Zalo | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| CN7-01 | Sale · có sale đã xóa tài khoản (QD-013) | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| CN7-04 | Chi tiết một sale | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| CN7-05 | Thêm sale thủ công | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| CN10 | Gửi lịch cho sale | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| CN10-P1 | Popup giải thích · gửi lịch | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| CN10-P2 | Hộp thoại của Zalo (minh họa) · gửi lịch | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| CN10-02 | Gửi xong: thông báo trên lịch | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| CN10-00 | Gửi lịch · chưa có sale đã lưu | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| CN10-01 | Gửi lịch · đóng Zalo mà không gửi | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| P2 | Thông tin cá nhân (phần số điện thoại và liên kết Zalo) | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| P13 | Thông báo (phần thông báo kết nối) | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| P13-00 | Thông báo · chưa có | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| P13-01 | Thông báo · chủ nhà đã xóa tài khoản (mục "Popup thông báo mới" (US30), mục "Khi người dùng xóa tài khoản" (US22)) | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| S1-06 | Popup thông báo mới (mục "Popup thông báo mới" (US30)) | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| S1-06-01 | Popup hôm nay · chủ nhà đã xóa tài khoản (QD-013) | nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| CN1 | Lịch tháng, 2 căn | nhóm Lịch chủ nhà · Lịch chủ nhà |
| CN1-02 | Lịch tháng, 3 căn | nhóm Lịch chủ nhà · Lịch chủ nhà |
| CN1-00 | Lịch · chưa có booking | nhóm Lịch chủ nhà · Lịch chủ nhà |
| CN1-01 | Lịch · chưa có booking sắp tới | nhóm Lịch chủ nhà · Lịch chủ nhà |
| CN2 | Lịch tuần, nhiều căn | nhóm Lịch chủ nhà · Lịch chủ nhà |
| CN2-00 | Lịch tuần · chưa có booking | nhóm Lịch chủ nhà · Lịch chủ nhà |
| CN3 | Chi tiết một ngày | nhóm Lịch chủ nhà · Lịch chủ nhà |
| CN5 | Danh sách căn | nhóm Căn và giá · Căn và giá |
| CN5-02 | Sửa thông tin căn | nhóm Căn và giá · Căn và giá |
| CN5-A1 | Thêm căn · trống | nhóm Căn và giá · Căn và giá |
| CN5-A1b | Thêm căn · chọn tòa khác | nhóm Căn và giá · Căn và giá |
| CN5-A2 | Thêm căn · đang nhập | nhóm Căn và giá · Căn và giá |
| CN5-A3 | Thêm căn · lỗi khi lưu | nhóm Căn và giá · Căn và giá |
| CN5-A4 | Đã thêm căn đầu tiên | nhóm Căn và giá · Căn và giá |
| CN5-A4b | Đã thêm căn · có nhiều căn | nhóm Căn và giá · Căn và giá |
| CN6 | Tab Giá | nhóm Căn và giá · Căn và giá |
| CN6-00 | Chưa đặt giá | nhóm Căn và giá · Căn và giá |
| CN6-02 | Giá ngày lễ, dịp đặc biệt | nhóm Căn và giá · Căn và giá |
| CN6-03 | Chọn quá 10 ngày | nhóm Căn và giá · Căn và giá |
| CN6-03-01 | Giá dịp · bỏ trống tên | nhóm Căn và giá · Căn và giá |
| CN6-04 | Áp dụng giá xong | nhóm Căn và giá · Căn và giá |
| CN6-05 | Đặt giá nhiều căn: chọn căn | nhóm Căn và giá · Căn và giá |
| CN6-05-00 | Đặt giá nhiều căn · chưa chọn căn | nhóm Căn và giá · Căn và giá |
| CN6-06 | Đặt giá nhiều căn | nhóm Căn và giá · Căn và giá |
| CN6-07 | Sao chép giá sang căn khác | nhóm Căn và giá · Căn và giá |
| CN6-08 | Sao chép giá xong | nhóm Căn và giá · Căn và giá |
| CN6-09 | Chọn năm | nhóm Căn và giá · Căn và giá |
| P6 | Ngày tính giá cuối tuần | nhóm Căn và giá · Căn và giá |
| CN3-02 | Chi tiết booking | nhóm Booking · Booking |
| CN3-02-01 | Chi tiết booking · sale đã xóa tài khoản (mục "Chi tiết booking và đánh dấu đã thu đủ" (US10), mục "Khi người dùng xóa tài khoản" (US22)) | nhóm Booking · Booking |
| CN4 | Thêm đặt phòng | nhóm Booking · Booking |
| CN4-01 | Thêm đặt phòng · tiền phòng bỏ trống | nhóm Booking · Booking |
| CN4-02 | Sửa đặt phòng | nhóm Booking · Booking |
| CN4-03 | Đã lưu booking | nhóm Booking · Booking |
| CN1-03 | Lịch · có yêu cầu từ sale | nhóm Booking · Booking |
| CN9-00 | Tin nhắn Zalo gửi chủ nhà (bản sau, mục "Cài đặt thông báo" (US21)) | nhóm Booking · Booking |
| CN9 | Yêu cầu đặt phòng · chờ trả lời | nhóm Booking · Booking |
| CN9-02 | Đã chấp nhận đặt phòng | nhóm Booking · Booking |
| CN9-03 | Đã từ chối yêu cầu | nhóm Booking · Booking |
| S3-02 | Đặt phòng (sale gửi yêu cầu) | nhóm Booking · Booking |
| S3-03 | Chờ chủ nhà trả lời | nhóm Booking · Booking |
| S3-04 | Chủ nhà đã chấp nhận | nhóm Booking · Booking |
| S3-04-01 | Kết quả yêu cầu · mở từ thông báo | nhóm Booking · Booking |
| S3-05 | Chủ nhà từ chối | nhóm Booking · Booking |
| S3-07 | Lỗi khi gửi: căn đã được đặt | nhóm Booking · Booking |
| S3-08 | Sale đã hủy yêu cầu | nhóm Booking · Booking |
| S3-09 | Yêu cầu hết hạn | nhóm Booking · Booking |
| S3-10 | Booking chủ nhà đã sửa (mục "Sửa booking" (US10), mục "Popup thông báo mới" (US30)) | nhóm Booking · Booking |
| S3-11 | Booking với chủ nhà đã xóa tài khoản (mục "Sale nhận kết quả yêu cầu" (US15), mục "Khi người dùng xóa tài khoản" (US22)) | nhóm Booking · Booking |
| S1 | Lịch phòng | nhóm Tìm phòng và gửi khách · Tìm phòng và gửi khách |
| S1-02 | Tìm phòng, ban đầu | nhóm Tìm phòng và gửi khách · Tìm phòng và gửi khách |
| S1-03 | Tìm phòng, đã chọn | nhóm Tìm phòng và gửi khách · Tìm phòng và gửi khách |
| S1-04 | Sắp xếp | nhóm Tìm phòng và gửi khách · Tìm phòng và gửi khách |
| S1-05 | Lịch phòng, xoay ngang | nhóm Tìm phòng và gửi khách · Tìm phòng và gửi khách |
| S2 | Kết quả, danh sách | nhóm Tìm phòng và gửi khách · Tìm phòng và gửi khách |
| S2-00 | Không có căn trống | nhóm Tìm phòng và gửi khách · Tìm phòng và gửi khách |
| S3 | Chi tiết căn | nhóm Tìm phòng và gửi khách · Tìm phòng và gửi khách |
| S4 | Kết quả, lịch tuần | nhóm Tìm phòng và gửi khách · Tìm phòng và gửi khách |
| S5 | Gửi cho khách | nhóm Tìm phòng và gửi khách · Tìm phòng và gửi khách |
| P10 | Mức cộng giá mặc định | nhóm Tìm phòng và gửi khách · Tìm phòng và gửi khách |
| P11 | Mẫu tin gửi khách | nhóm Tìm phòng và gửi khách · Tìm phòng và gửi khách |
| S6 | Nguồn phòng / Căn | nhóm Nguồn phòng và căn tự nhập · Nguồn phòng và căn tự nhập |
| S6-00 | Căn · chưa có căn nào | nhóm Nguồn phòng và căn tự nhập · Nguồn phòng và căn tự nhập |
| S6-02 | Thêm căn tự nhập | nhóm Nguồn phòng và căn tự nhập · Nguồn phòng và căn tự nhập |
| S6-03 | Chi tiết căn tự nhập | nhóm Nguồn phòng và căn tự nhập · Nguồn phòng và căn tự nhập |
| S6-03-00 | Căn tự nhập · chưa ghi booking | nhóm Nguồn phòng và căn tự nhập · Nguồn phòng và căn tự nhập |
| S6-04 | Chi tiết chủ nhà | nhóm Nguồn phòng và căn tự nhập · Nguồn phòng và căn tự nhập |
| S6-05 | Ghi booking nhanh | nhóm Nguồn phòng và căn tự nhập · Nguồn phòng và căn tự nhập |
| S6-06 | Đã ghi, tính vào thống kê | nhóm Nguồn phòng và căn tự nhập · Nguồn phòng và căn tự nhập |
| S6-07 | Chi tiết căn của tôi | nhóm Nguồn phòng và căn tự nhập · Nguồn phòng và căn tự nhập |
| S6-08 | Nguồn phòng · chủ nhà đã xóa tài khoản (mục "Danh sách căn và nguồn phòng" (US16), mục "Khi người dùng xóa tài khoản" (US22)) | nhóm Nguồn phòng và căn tự nhập · Nguồn phòng và căn tự nhập |
| CN8 | Thống kê tháng (chủ nhà) | nhóm Thống kê · Thống kê |
| CN8-00 | Thống kê, tháng chưa có booking | nhóm Thống kê · Thống kê |
| S7 | Thống kê của sale | nhóm Thống kê · Thống kê |
| S7-00 | Thống kê, chưa có booking | nhóm Thống kê · Thống kê |
| S7-03 | Các trạng thái booking của sale | nhóm Thống kê · Thống kê |
| S7-03-00 | Trạng thái booking · chưa có yêu cầu | nhóm Thống kê · Thống kê |
| S7-03-01 | Trạng thái booking · chủ nhà đã xóa tài khoản (mục "Trạng thái booking của sale" (US19) bước 4c) | nhóm Thống kê · Thống kê |
| S8-00 | Đội nhóm, chưa có nhóm | nhóm Đội nhóm, cộng tác viên · Đội nhóm, cộng tác viên |
| S8-01 | Tạo nhóm | nhóm Đội nhóm, cộng tác viên · Đội nhóm, cộng tác viên |
| S8 | Nhóm của tôi, trưởng nhóm | nhóm Đội nhóm, cộng tác viên · Đội nhóm, cộng tác viên |
| S8-02 | Mời thành viên | nhóm Đội nhóm, cộng tác viên · Đội nhóm, cộng tác viên |
| S8-03 | Sale mở link mời vào nhóm | nhóm Đội nhóm, cộng tác viên · Đội nhóm, cộng tác viên |
| S8-04 | Chi tiết thành viên | nhóm Đội nhóm, cộng tác viên · Đội nhóm, cộng tác viên |
| S8-05 | Nhóm, thành viên thường | nhóm Đội nhóm, cộng tác viên · Đội nhóm, cộng tác viên |
| P1 | Cá nhân, chủ nhà | nhóm Quản trị và dữ liệu · Quản trị và dữ liệu |
| P4 | Cá nhân, sale | nhóm Quản trị và dữ liệu · Quản trị và dữ liệu |
| P2 | Thông tin cá nhân | nhóm Quản trị và dữ liệu · Quản trị và dữ liệu |
| P3 | Cài đặt thông báo, chủ nhà | nhóm Quản trị và dữ liệu · Quản trị và dữ liệu |
| P12 | Cài đặt thông báo, sale | nhóm Quản trị và dữ liệu · Quản trị và dữ liệu |
| P5 | Giờ nhận, trả phòng | nhóm Quản trị và dữ liệu · Quản trị và dữ liệu |
| P7 | Sao lưu dữ liệu | nhóm Quản trị và dữ liệu · Quản trị và dữ liệu |
| P7-00 | Sao lưu · chưa từng sao lưu | nhóm Quản trị và dữ liệu · Quản trị và dữ liệu |
| P8 | Xuất file Excel | nhóm Quản trị và dữ liệu · Quản trị và dữ liệu |
| P8-00 | Xuất Excel · khoảng chọn không có booking | nhóm Quản trị và dữ liệu · Quản trị và dữ liệu |
| P9 | Hướng dẫn sử dụng | nhóm Quản trị và dữ liệu · Quản trị và dữ liệu |
| A10-P1 | Thêm lịch · giải thích xin tên và số | Vào app và kết nối |
| A10-P2 | Thêm lịch · hộp thoại Zalo | Chỉ bản Zalo (hộp thoại của Zalo). Bản PWA theo `docs/luat-chung/PWA.md` |
| CN3-02-02 | Chi tiết booking chủ nhà tự ghi · xóa | Chủ nhà |
| CN3-02-03 | Chi tiết đặt phòng · đã thu đủ | Chủ nhà |
| CN7-06 | Sale của tôi · vừa cho sale xem lịch | Chủ nhà |
| CN7-P1 | Mời sale · giải thích xin tên và số | Chủ nhà |
| CN7-P2 | Mời sale · hộp thoại Zalo | Chỉ bản Zalo (hộp thoại của Zalo). Bản PWA theo `docs/luat-chung/PWA.md` |
| CN9-P1 | Chấp nhận · giải thích xin tên và số | Chủ nhà |
| CN9-P2 | Chấp nhận · hộp thoại Zalo | Chỉ bản Zalo (hộp thoại của Zalo). Bản PWA theo `docs/luat-chung/PWA.md` |
| P13-02 | Thông báo · chủ nhà ngừng cho xem lịch | Cá nhân |
| S1-07 | Lịch · chủ nhà chưa cho xem giá | **Bỏ, không làm** (công tắc giá đã bỏ, QD-007). Xóa hình khỏi canvas khi sửa canvas lần tới |
| S2-01 | Danh sách · chủ nhà chưa cho xem giá | **Bỏ, không làm** (công tắc giá đã bỏ, QD-007). Xóa hình khỏi canvas khi sửa canvas lần tới |
| S3-02-P1 | Gửi yêu cầu · giải thích xin tên và số | Sale |
| S3-02-P2 | Gửi yêu cầu · hộp thoại Zalo | Chỉ bản Zalo (hộp thoại của Zalo). Bản PWA theo `docs/luat-chung/PWA.md` |
| S3-12 | Chi tiết căn · chủ nhà chưa cho xem giá | **Bỏ, không làm** (công tắc giá đã bỏ, QD-007). Xóa hình khỏi canvas khi sửa canvas lần tới |
| S5-P1 | Gửi cho khách · giải thích xin tên và số | Sale |
| S5-P2 | Gửi cho khách · hộp thoại Zalo | Chỉ bản Zalo (hộp thoại của Zalo). Bản PWA theo `docs/luat-chung/PWA.md` |
| S6-04-01 | Chi tiết chủ nhà · đã tắt giá | **Bỏ, không làm** (công tắc giá đã bỏ, QD-007). Xóa hình khỏi canvas khi sửa canvas lần tới |
| S6-P1 | Mời chủ căn · giải thích xin tên và số | Sale |
| S6-P2 | Mời chủ căn · hộp thoại Zalo | Chỉ bản Zalo (hộp thoại của Zalo). Bản PWA theo `docs/luat-chung/PWA.md` |
