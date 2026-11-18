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
| A1 | Chào mừng và đăng nhập | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A1-link | Mở từ link mời (chưa có mã artboard riêng) | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A1-link-01 | Link sai hoặc chủ nhà đã xóa tài khoản | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A3 | Chọn vai trò | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A3-00 | Chọn vai trò · chưa chọn | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A4 | Chủ nhà mới, chưa có căn | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A4-01 | Chủ nhà mới · mở từ link xin lịch | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A5 | Sale mới, chưa có nguồn phòng | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A5-01 | Sale mới · mở từ link không dùng được | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A6 | Soạn tin xin link | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A6-P1 | Popup giải thích · sale | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A6-P2 | Hộp thoại của Zalo (minh họa) · sale | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A7 | Đã gửi, chờ chủ nhà | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A7-00 | Chờ chủ nhà · chưa gửi lần nào | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A7-01 | Chờ chủ nhà · quay lại từ Zalo | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A8 | Chủ nhà mở link của sale (tiêu đề "Lời mời xem lịch") | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A8-01 | Lời mời xem lịch · link hết hạn hoặc sale bị ngừng | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A8-P1 | Popup giải thích · chủ nhà | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A8-P2 | Hộp thoại của Zalo (minh họa) · chủ nhà | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A9 | Chủ nhà đã đồng ý · toast | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A10 | Thêm lịch của chủ nhà (QD-008) | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A10-01 | Đã có lịch của chủ nhà này · cảnh báo | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A10-02 | Đã thêm lịch · toast trên lịch sale | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| A9-02 | Nhiều chủ nhà cùng đồng ý · gom một toast | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| CN7 | Sale của tôi | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| CN7-00 | Sale · chưa có sale nào | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| CN7-03 | Sale xin xem lịch · tin nhắn Zalo | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| CN7-01 | Sale · có sale đã xóa tài khoản (QD-013) | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| CN7-04 | Chi tiết một sale | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| CN7-05 | Thêm sale thủ công | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| CN10 | Gửi lịch cho sale | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| CN10-P1 | Popup giải thích · gửi lịch | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| CN10-P2 | Hộp thoại của Zalo (minh họa) · gửi lịch | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| CN10-02 | Gửi xong: thông báo trên lịch | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| CN10-00 | Gửi lịch · chưa có sale đã lưu | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| CN10-01 | Gửi lịch · đóng Zalo mà không gửi | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| P2 | Thông tin cá nhân (phần số điện thoại và liên kết Zalo) | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| P13 | Thông báo (phần thông báo kết nối) | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| P13-00 | Thông báo · chưa có | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| P13-01 | Thông báo · chủ nhà đã xóa tài khoản (YC1.13, YC9.8) | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| S1-06 | Popup thông báo mới (YC1.13) | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| S1-06-01 | Popup hôm nay · chủ nhà đã xóa tài khoản (QD-013) | YC1 · Đăng nhập, vai trò, kết nối chủ nhà và sale |
| CN1 | Lịch tháng, 2 căn | YC2 · Lịch chủ nhà |
| CN1-02 | Lịch tháng, 3 căn | YC2 · Lịch chủ nhà |
| CN1-00 | Lịch · chưa có booking | YC2 · Lịch chủ nhà |
| CN1-01 | Lịch · chưa có booking sắp tới | YC2 · Lịch chủ nhà |
| CN2 | Lịch tuần, nhiều căn | YC2 · Lịch chủ nhà |
| CN2-00 | Lịch tuần · chưa có booking | YC2 · Lịch chủ nhà |
| CN3 | Chi tiết một ngày | YC2 · Lịch chủ nhà |
| CN5 | Danh sách căn | YC3 · Căn và giá |
| CN5-02 | Sửa thông tin căn | YC3 · Căn và giá |
| CN5-A1 | Thêm căn · trống | YC3 · Căn và giá |
| CN5-A1b | Thêm căn · chọn tòa khác | YC3 · Căn và giá |
| CN5-A2 | Thêm căn · đang nhập | YC3 · Căn và giá |
| CN5-A3 | Thêm căn · lỗi khi lưu | YC3 · Căn và giá |
| CN5-A4 | Đã thêm căn đầu tiên | YC3 · Căn và giá |
| CN5-A4b | Đã thêm căn · có nhiều căn | YC3 · Căn và giá |
| CN6 | Tab Giá | YC3 · Căn và giá |
| CN6-00 | Chưa đặt giá | YC3 · Căn và giá |
| CN6-02 | Giá ngày lễ, dịp đặc biệt | YC3 · Căn và giá |
| CN6-03 | Chọn quá 10 ngày | YC3 · Căn và giá |
| CN6-03-01 | Giá dịp · bỏ trống tên | YC3 · Căn và giá |
| CN6-04 | Áp dụng giá xong | YC3 · Căn và giá |
| CN6-05 | Đặt giá nhiều căn: chọn căn | YC3 · Căn và giá |
| CN6-05-00 | Đặt giá nhiều căn · chưa chọn căn | YC3 · Căn và giá |
| CN6-06 | Đặt giá nhiều căn | YC3 · Căn và giá |
| CN6-07 | Sao chép giá sang căn khác | YC3 · Căn và giá |
| CN6-08 | Sao chép giá xong | YC3 · Căn và giá |
| CN6-09 | Chọn năm | YC3 · Căn và giá |
| P6 | Ngày tính giá cuối tuần | YC3 · Căn và giá |
| CN3-02 | Chi tiết booking | YC4 · Booking |
| CN3-02-01 | Chi tiết booking · sale đã xóa tài khoản (YC4.2, YC9.8) | YC4 · Booking |
| CN4 | Thêm đặt phòng | YC4 · Booking |
| CN4-01 | Thêm đặt phòng · tiền phòng bỏ trống | YC4 · Booking |
| CN4-02 | Sửa đặt phòng | YC4 · Booking |
| CN4-03 | Đã lưu booking | YC4 · Booking |
| CN1-03 | Lịch · có yêu cầu từ sale | YC4 · Booking |
| CN9-00 | Tin nhắn Zalo gửi chủ nhà (bản sau, YC9.3) | YC4 · Booking |
| CN9 | Yêu cầu đặt phòng · chờ trả lời | YC4 · Booking |
| CN9-02 | Đã chấp nhận đặt phòng | YC4 · Booking |
| CN9-03 | Đã từ chối yêu cầu | YC4 · Booking |
| S3-02 | Đặt phòng (sale gửi yêu cầu) | YC4 · Booking |
| S3-03 | Chờ chủ nhà trả lời | YC4 · Booking |
| S3-04 | Chủ nhà đã chấp nhận | YC4 · Booking |
| S3-04-01 | Kết quả yêu cầu · mở từ thông báo | YC4 · Booking |
| S3-05 | Chủ nhà từ chối | YC4 · Booking |
| S3-07 | Lỗi khi gửi: căn đã được đặt | YC4 · Booking |
| S3-08 | Sale đã hủy yêu cầu | YC4 · Booking |
| S3-09 | Yêu cầu hết hạn | YC4 · Booking |
| S3-10 | Booking chủ nhà đã sửa (YC4.3, YC1.13) | YC4 · Booking |
| S3-11 | Booking với chủ nhà đã xóa tài khoản (YC4.7, YC9.8) | YC4 · Booking |
| S1 | Lịch phòng | YC5 · Tìm phòng và gửi khách |
| S1-02 | Tìm phòng, ban đầu | YC5 · Tìm phòng và gửi khách |
| S1-03 | Tìm phòng, đã chọn | YC5 · Tìm phòng và gửi khách |
| S1-04 | Sắp xếp | YC5 · Tìm phòng và gửi khách |
| S1-05 | Lịch phòng, xoay ngang | YC5 · Tìm phòng và gửi khách |
| S2 | Kết quả, danh sách | YC5 · Tìm phòng và gửi khách |
| S2-00 | Không có căn trống | YC5 · Tìm phòng và gửi khách |
| S3 | Chi tiết căn | YC5 · Tìm phòng và gửi khách |
| S4 | Kết quả, lịch tuần | YC5 · Tìm phòng và gửi khách |
| S5 | Gửi cho khách | YC5 · Tìm phòng và gửi khách |
| P10 | Mức cộng giá mặc định | YC5 · Tìm phòng và gửi khách |
| P11 | Mẫu tin gửi khách | YC5 · Tìm phòng và gửi khách |
| S6 | Nguồn phòng / Căn | YC6 · Nguồn phòng và căn tự nhập |
| S6-00 | Căn · chưa có căn nào | YC6 · Nguồn phòng và căn tự nhập |
| S6-02 | Thêm căn tự nhập | YC6 · Nguồn phòng và căn tự nhập |
| S6-03 | Chi tiết căn tự nhập | YC6 · Nguồn phòng và căn tự nhập |
| S6-03-00 | Căn tự nhập · chưa ghi booking | YC6 · Nguồn phòng và căn tự nhập |
| S6-04 | Chi tiết chủ nhà | YC6 · Nguồn phòng và căn tự nhập |
| S6-05 | Ghi booking nhanh | YC6 · Nguồn phòng và căn tự nhập |
| S6-06 | Đã ghi, tính vào thống kê | YC6 · Nguồn phòng và căn tự nhập |
| S6-07 | Chi tiết căn của tôi | YC6 · Nguồn phòng và căn tự nhập |
| S6-08 | Nguồn phòng · chủ nhà đã xóa tài khoản (YC6.1, YC9.8) | YC6 · Nguồn phòng và căn tự nhập |
| CN8 | Thống kê tháng (chủ nhà) | YC7 · Thống kê |
| CN8-00 | Thống kê, tháng chưa có booking | YC7 · Thống kê |
| S7 | Thống kê của sale | YC7 · Thống kê |
| S7-00 | Thống kê, chưa có booking | YC7 · Thống kê |
| S7-03 | Các trạng thái booking của sale | YC7 · Thống kê |
| S7-03-00 | Trạng thái booking · chưa có yêu cầu | YC7 · Thống kê |
| S7-03-01 | Trạng thái booking · chủ nhà đã xóa tài khoản (YC7.6 bước 4c) | YC7 · Thống kê |
| S8-00 | Đội nhóm, chưa có nhóm | YC8 · Đội nhóm, cộng tác viên |
| S8-01 | Tạo nhóm | YC8 · Đội nhóm, cộng tác viên |
| S8 | Nhóm của tôi, trưởng nhóm | YC8 · Đội nhóm, cộng tác viên |
| S8-02 | Mời thành viên | YC8 · Đội nhóm, cộng tác viên |
| S8-03 | Sale mở link mời vào nhóm | YC8 · Đội nhóm, cộng tác viên |
| S8-04 | Chi tiết thành viên | YC8 · Đội nhóm, cộng tác viên |
| S8-05 | Nhóm, thành viên thường | YC8 · Đội nhóm, cộng tác viên |
| P1 | Cá nhân, chủ nhà | YC9 · Quản trị và dữ liệu |
| P4 | Cá nhân, sale | YC9 · Quản trị và dữ liệu |
| P2 | Thông tin cá nhân | YC9 · Quản trị và dữ liệu |
| P3 | Cài đặt thông báo, chủ nhà | YC9 · Quản trị và dữ liệu |
| P12 | Cài đặt thông báo, sale | YC9 · Quản trị và dữ liệu |
| P5 | Giờ nhận, trả phòng | YC9 · Quản trị và dữ liệu |
| P7 | Sao lưu dữ liệu | YC9 · Quản trị và dữ liệu |
| P7-00 | Sao lưu · chưa từng sao lưu | YC9 · Quản trị và dữ liệu |
| P8 | Xuất file Excel | YC9 · Quản trị và dữ liệu |
| P8-00 | Xuất Excel · khoảng chọn không có booking | YC9 · Quản trị và dữ liệu |
| P9 | Hướng dẫn sử dụng | YC9 · Quản trị và dữ liệu |