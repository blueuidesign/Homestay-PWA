# Kịch bản kiểm tay US6 · Sale mở link, thêm lịch, xem 7 ngày và giá

Story: `docs/stories/US6-sale-xem-lich.md`. Cách chạy và cách ghi kết quả: `tests/kich-ban/README.md`.

Dữ liệu: bộ mẫu ở `docs/luat-chung/Du_lieu_mau.md`, nạp vào staging bằng `supabase/staging/du_lieu_mau.sql`. Kịch bản ghi "nạp lại" thì chạy lại file đó trước.
Kịch bản viết cho bản Zalo, số liệu theo ngày 07/10/2026 của bộ mẫu. Bước nào nói tới cửa sổ hay quyền của Zalo thì làm theo `docs/luat-chung/PWA.md`. Kịch bản gắn `[Zalo]` chỉ chạy ở bản Zalo.

### US6-KB1 · Người chưa có tài khoản mở link mời `[Chính]`
- **Mục đích:** người mới thấy ai mời mình, không thấy chữ "Đăng nhập".
- **Chuẩn bị:** Máy 2 dùng Zalo thử B, đã nhận link mời của Anh Tuấn trong chat Zalo.
- **Làm:**
  1. Bấm link mời trong tin nhắn.
- **Mong đợi:**
  - Màn A1-link có thẻ "Anh Tuấn mời bạn xem lịch 2 căn".
  - Thẻ ghi "Bấm Bắt đầu ngay để xem lịch và giá mới nhất". Không có chữ "Đăng nhập" ở đâu trên màn.
  - Có nút "Bắt đầu ngay" và dòng "Bằng việc tiếp tục, bạn đồng ý với Điều khoản và Chính sách quyền riêng tư".
- **Nguồn:** YC1.3-NT8, quy tắc Điều khoản khi tiếp tục, PQ18.LINK

### US6-KB2 · Bấm "Bắt đầu ngay" từ link thì vào thẳng A10 `[Chính]`
- **Mục đích:** người mở link không phải chọn vai, không bị hỏi số.
- **Chuẩn bị:** Máy 2, Zalo thử B, đang ở A1-link (KB1).
- **Làm:**
  1. Bấm "Bắt đầu ngay".
- **Mong đợi:**
  - App mở màn "Thêm lịch" (A10). Không hiện màn chọn "Tôi là chủ nhà" / "Tôi là sale".
  - Không có popup hay hộp thoại xin tên, số điện thoại.
- **Nguồn:** YC1.3-NT1, quy tắc Xin số điện thoại đúng lúc

### US6-KB3 · Rời A10 mà không thêm lịch `[Chính]`
- **Mục đích:** chỉ mở link thì chưa có gì vào lịch của sale, chủ nhà không thấy sale đã kết nối.
- **Chuẩn bị:** Máy 2, Zalo thử B, đang ở A10 (KB2). Máy 1, Anh Tuấn.
- **Làm:**
  1. Máy 2: bấm nút ✕ của Zalo ở góc trên.
  2. Máy 2: mở lại app từ danh sách app của Zalo, bấm tab "Lịch".
  3. Máy 1: bấm tab "Sale".
- **Mong đợi:**
  - Sau bước 2: Máy 2 thấy màn "Chưa có nguồn phòng". Không có Sapphire 1103, À La Carte 2208.
  - Sau bước 3: nhóm "Đã kết nối" của Anh Tuấn không có Zalo thử B.
- **Nguồn:** YC1.3-NT3, quy tắc Sale tự thêm lịch

### US6-KB4 · Sale đã có tài khoản mở link, A10 không có giá `[Quyền]`
- **Mục đích:** A10 cho xem trước căn nhưng không lộ giá.
- **Chuẩn bị:** Máy 2, Zalo thử B (đã có tài khoản từ KB2, chưa thêm lịch).
- **Làm:**
  1. Bấm lại link mời của Anh Tuấn trong tin nhắn Zalo.
- **Mong đợi:**
  - App mở thẳng A10, không qua A1-link.
  - Thẻ chủ nhà ghi "Anh Tuấn", "Chủ nhà · 2 căn".
  - Hai thẻ căn có ảnh: Sapphire 1103 (3PN, view thành phố), À La Carte 2208 (1PN, view biển).
  - Không có số tiền nào trên màn.
  - Nút dính đáy "Thêm lịch của Anh Tuấn".
- **Nguồn:** YC1.3-NT2, PQ3.LINK, PQ5.LINK

### US6-KB5 · Thêm lịch khi chưa có số, chọn "Để sau" `[Zalo]`
- **Mục đích:** popup xin số hiện trước hộp thoại Zalo; "Để sau" vẫn thêm được lịch.
- **Chuẩn bị:** Máy 2, Zalo thử B, đang ở A10 (KB4).
- **Làm:**
  1. Bấm "Thêm lịch của Anh Tuấn".
  2. Xem popup, chưa bấm gì.
  3. Bấm "Để sau".
  4. Không chạm gì, đếm 3 giây.
- **Mong đợi:**
  - Sau bước 1: popup hiện từ dưới đáy, có nút "Đồng ý, tiếp tục" và "Để sau". Chưa có hộp thoại Zalo.
  - Sau bước 3: app sang "Lịch phòng", toast "✓ Đã thêm lịch 2 căn của Anh Tuấn" ngay dưới thanh tiêu đề.
  - Lịch có Sapphire 1103 và À La Carte 2208.
  - Sau bước 4: toast tự tắt.
- **Nguồn:** YC1.3-NT7, YC1.5.1-NT1, YC1.5.1-NT3, HV8-NT2

### US6-KB6 · Sale vừa thêm lịch vào nhóm "Đã kết nối" `[Chính]`
- **Mục đích:** chủ nhà thấy sale đã thêm lịch của mình.
- **Chuẩn bị:** Máy 1 Anh Tuấn. Máy 2 Zalo thử B vừa xong KB5.
- **Làm:**
  1. Máy 1: bấm tab "Sale".
- **Mong đợi:**
  - Nhóm "Đã kết nối" có Zalo thử B (tên Zalo của tài khoản này).
- **Nguồn:** YC1.3-NT4, quy tắc Nhóm kết nối

### US6-KB7 · Mở link lần hai không nhân đôi `[Biên]`
- **Mục đích:** sale mở lại link đã thêm thì được báo, lịch không có căn lặp.
- **Chuẩn bị:** Máy 2, Zalo thử B vừa xong KB5.
- **Làm:**
  1. Bấm lại link mời của Anh Tuấn trong tin nhắn Zalo.
  2. Bấm "Xem lịch".
- **Mong đợi:**
  - Sau bước 1: thẻ "Bạn đã có lịch của Anh Tuấn", nút "Xem lịch". Không có nút "Thêm lịch của Anh Tuấn".
  - Sau bước 2: lịch có đúng một hàng Sapphire 1103 và một hàng À La Carte 2208, nhóm ghi "NGUỒN PHÒNG · 2".
- **Nguồn:** YC1.3-NT5, PQ17.LINK

### US6-KB8 · Chọn vai sale khi vào app không qua link `[Chính]`
- **Mục đích:** sale mới thấy hai cách để có lịch, thanh tab không có "Tìm phòng".
- **Chuẩn bị:** Máy 2, Zalo thử C chưa từng mở app. Mở app từ danh sách app của Zalo, không qua link.
- **Làm:**
  1. Bấm "Bắt đầu ngay".
  2. Chạm thẻ "Tôi là sale".
  3. Bấm "Tiếp tục".
- **Mong đợi:**
  - Màn "Lịch phòng" ghi "Chưa có nguồn phòng".
  - Có nút "Gửi tin nhắn xin lịch đến chủ nhà" và "Thêm căn thủ công".
  - Thanh tab không có "Tìm phòng".
- **Nguồn:** YC1.2-NT2, YC1.4-NT2

### US6-KB9 · Từ chối hộp thoại Zalo khi thêm lịch `[Zalo]`
- **Mục đích:** từ chối quyền không làm app báo lỗi hay treo.
- **Chuẩn bị:** Máy 2, Zalo thử C (KB8), nhận link mời của Anh Tuấn.
- **Làm:**
  1. Bấm link mời của Anh Tuấn.
  2. Bấm "Thêm lịch của Anh Tuấn".
  3. Bấm "Đồng ý, tiếp tục".
  4. Ở hộp thoại Zalo, bấm từ chối (hoặc đóng hộp thoại, không bấm "Cho phép").
- **Mong đợi:**
  - Không có thông báo lỗi. App quay về màn "Thêm lịch", vẫn bấm được nút.
- **Nguồn:** HV4 bước 2, YC1.5.2 (trạng thái đã từ chối quyền Zalo)

### US6-KB10 · Bấm lại sau khi từ chối, rồi cho phép `[Zalo]`
- **Mục đích:** popup hiện lại có cách mở cài đặt; cho phép thì lịch được thêm, có số trong hồ sơ.
- **Chuẩn bị:** Máy 2, Zalo thử C, đang ở màn "Thêm lịch" (KB9).
- **Làm:**
  1. Bấm "Thêm lịch của Anh Tuấn".
  2. Xem popup, chưa bấm gì.
  3. Bấm "Đồng ý, tiếp tục".
  4. Bật công tắc Số điện thoại, bấm "Cho phép". Nếu Zalo hiện hai hộp thoại nối nhau, cho phép cả hai.
  5. Bấm tab "Cá nhân", bấm "Thông tin cá nhân".
- **Mong đợi:**
  - Sau bước 2: popup có thêm nút "Mở cài đặt quyền". Chưa có hộp thoại Zalo.
  - Sau bước 3: hộp thoại Zalo hiện lại.
  - Sau bước 4: app sang "Lịch phòng", toast "✓ Đã thêm lịch 2 căn của Anh Tuấn".
  - Sau bước 5: ô Số điện thoại hiện số của Zalo thử C, nhãn "Từ Zalo ✓".
- **Nguồn:** HV4-NT2, YC1.5.2-NT1, YC1.3 bước 4

### US6-KB11 · Link sai `[Lỗi]`
- **Mục đích:** link hỏng không lộ tên hay căn của ai, người dùng biết làm gì tiếp.
- **Chuẩn bị:** Máy 2, Zalo thử C. Sao chép link mời của Anh Tuấn, đổi 3 ký tự cuối, gửi vào "Cloud của tôi".
- **Làm:**
  1. Bấm link đã sửa trong "Cloud của tôi".
  2. Bấm "Vào app".
- **Mong đợi:**
  - Sau bước 1: màn ghi "Link này không mở được", "Chủ nhà đã xóa tài khoản hoặc link không đúng. Xin chủ nhà gửi lại link mới." Không có tên chủ nhà, tên căn hay ảnh căn.
  - Sau bước 2: app mở lịch của sale.
- **Nguồn:** YC1.3 trạng thái mở từ link (A1-link-01), PQ18.LINK, PQ3.LINK

### US6-KB12 · Lịch 7 ngày ghi "Kín" đúng đêm `[Chính]`
- **Mục đích:** sale thấy đêm kín và đêm trống theo booking của chủ nhà.
- **Chuẩn bị:** Máy 2, Zalo của Sale Hùng.
- **Làm:**
  1. Bấm tab "Lịch".
  2. Xem hàng ICON40 1509.
- **Mong đợi:**
  - Thanh ghi "7 ngày tới · 07/10 → 13/10".
  - Ô 10/10, 11/10 (B1) và 13/10 (B5) ghi "Kín".
  - Ô 12/10 (ngày trả của B1) có số giá, không ghi "Kín".
  - Ô 07/10, 08/10, 09/10 có số giá.
- **Nguồn:** YC5.1-NT2, QT2.1-VD1, PQ5.SALE

### US6-KB13 · Chủ nhà ghi đặt phòng, sale khác thấy "Kín" `[Chính]`
- **Mục đích:** booking chủ nhà vừa lưu hiện kín với sale, không lộ người đặt.
- **Chuẩn bị:** Máy 1 đăng nhập Zalo của Chị Hoa. Máy 2 Sale Lan, tab Lịch, ô 3402 ngày 08/10 có số giá.
- **Làm:**
  1. Máy 1: tab Lịch, bấm "+ Đặt phòng".
  2. Máy 1: chọn phòng 3402, ngày nhận 08/10, chọn "1 đêm".
  3. Máy 1: chọn chip "Khách lẻ", chọn "Chưa cọc".
  4. Máy 1: bấm "Thêm đặt phòng".
  5. Máy 2: bấm tab "Cá nhân" rồi bấm lại tab "Lịch".
- **Mong đợi:**
  - Máy 2: ô 3402 ngày 08/10 ghi "Kín". Ô 09/10 vẫn có số giá.
  - Không có chữ "Khách lẻ" hay tên người đặt trên ô.
- **Nguồn:** YC4.1-NT2, QT2.1, PQ4.SALE

### US6-KB14 · Sale chỉ thấy căn của chủ nhà đã kết nối `[Quyền]`
- **Mục đích:** lịch sale không có căn của chủ nhà chưa kết nối hay căn của sale khác.
- **Chuẩn bị:** Máy 2, Zalo của Sale Lan (chỉ kết nối Chị Hoa), chưa chạy KB18.
- **Làm:**
  1. Bấm tab "Lịch".
  2. Bấm › để xem tuần 14/10 → 20/10.
- **Mong đợi:**
  - Nhóm nguồn phòng chỉ có ICON40 1509 và 3402.
  - Không có Sapphire 1103, À La Carte 2208, Green Bay 0812, Villa Tuần Châu.
  - Sau bước 2: ô 3402 ngày 17/10, 18/10 ghi "Kín" (B2 của chính Lan); 1509 ngày 19/10 ghi "Kín" (B7 của Sale Minh), không có tên "Minh".
- **Nguồn:** PQ3.SALE, PQ4.SALE, quy tắc Sale chỉ thấy căn chủ nhà đã đồng ý

### US6-KB15 · Căn mới của chủ nhà tự hiện cho sale `[Chính]`
- **Mục đích:** sale được chia sẻ tất cả căn thấy căn mới mà không mở lại link.
- **Chuẩn bị:** Máy 1 Chủ nhà thử (6 căn). Máy 2 Zalo thử B đã thêm lịch qua link mời của Chủ nhà thử (A10, "Thêm lịch"), tab Lịch thấy Căn 1 đến Căn 6.
- **Làm:**
  1. Máy 1: bấm tab "Căn", bấm "Thêm căn".
  2. Máy 1: nhập căn "Căn 7" và lưu theo các bước của màn thêm căn.
  3. Máy 2: bấm tab "Cá nhân" rồi bấm lại tab "Lịch".
- **Mong đợi:**
  - Máy 2 thấy đủ 7 căn của Chủ nhà thử, có Căn 7. Không phải mở lại link.
- **Nguồn:** YC1.12-NT1, quy tắc Căn mới tự hiện, PQ3.SALE

### US6-KB16 · Nghiêng máy và nút "Xoay ngang" `[Biên]`
- **Mục đích:** app không tự xoay; sale chủ động bấm mới xoay giả.
- **Chuẩn bị:** Máy 2, Sale Hùng, tab Lịch. Tắt khóa xoay màn hình của điện thoại.
- **Làm:**
  1. Nghiêng điện thoại sang ngang, giữ 3 giây.
  2. Dựng điện thoại lại, tìm nút "Xoay ngang".
  3. Bấm "Xoay ngang", nghiêng máy theo.
  4. Bấm "Xoay dọc".
- **Mong đợi:**
  - Sau bước 1: app vẫn hiện chiều dọc.
  - Sau bước 2: nút nhỏ "Xoay ngang" nằm cùng hàng với "Theo tên", ngay dưới hàng "7 ngày tới". Nút không che bảng hay chú thích.
  - Sau bước 3: cả bảng quay 90 độ, cột tên căn rộng hơn, không có thanh tab, có nút "Xoay dọc".
  - Sau bước 4: bảng về chiều dọc như trước.
- **Nguồn:** YC5.1-NT5, YC5.1 bước 7

### US6-KB17 · Mất mạng lúc đang xem lịch `[Mạng]`
- **Mục đích:** sale ở chỗ sóng yếu vẫn xem được lịch đã tải.
- **Chuẩn bị:** Máy 2, Sale Hùng, tab Lịch đã tải xong.
- **Làm:**
  1. Bật chế độ máy bay.
  2. Cuộn bảng lên xuống.
  3. Tắt chế độ máy bay, chờ 10 giây.
- **Mong đợi:**
  - Sau bước 1: dải ở đầu màn "Mất kết nối. Lịch có thể chưa mới nhất." Bảng vẫn hiện, cuộn được.
  - Sau bước 3: dải tự mất.
- **Nguồn:** HV2-NT3, HV2 bước 4

### US6-KB18 · Mất mạng khi bấm "Thêm lịch" `[Mạng]`
- **Mục đích:** mất mạng thì app báo chưa thêm, có mạng lại không tự thêm.
- **Chuẩn bị:** Máy 2, Zalo của Sale Lan (chưa kết nối Anh Tuấn), đã nhận link mời của Anh Tuấn.
- **Làm:**
  1. Bấm link mời, chờ màn "Thêm lịch" hiện đủ.
  2. Bật chế độ máy bay.
  3. Bấm "Thêm lịch của Anh Tuấn". Nếu popup xin số hiện, bấm "Để sau".
  4. Tắt chế độ máy bay, chờ 10 giây.
  5. Bấm tab "Lịch".
- **Mong đợi:**
  - Sau bước 3: app báo "Chưa lưu được, bấm lại khi có mạng". Vẫn ở màn "Thêm lịch".
  - Sau bước 5: lịch của Lan không có Sapphire 1103, À La Carte 2208.
- **Nguồn:** HV2 bước 3, HV2 bước 4

### US6-KB19 · Mở lại tab Lịch đã xem `[Mạng]`
- **Mục đích:** lịch cũ hiện ngay, không có màn trống khi đang tải lại.
- **Chuẩn bị:** Máy 2, Sale Hùng, đã mở tab Lịch ít nhất một lần.
- **Làm:**
  1. Bấm tab "Cá nhân".
  2. Bấm lại tab "Lịch".
- **Mong đợi:**
  - Lịch cũ hiện ngay, không có màn trắng hay vòng quay giữa màn.
  - Nếu đang tải dữ liệu mới, đầu màn có dòng nhỏ "Đang cập nhật…".
- **Nguồn:** HV1-NT2, HV1 bước 2
