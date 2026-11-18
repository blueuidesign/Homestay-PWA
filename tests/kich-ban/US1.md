# Kịch bản kiểm tay US1 · Chủ nhà vào app và tạo căn đầu tiên

Story: `docs/stories/US1-vao-app-tao-can.md`. Cách chạy và cách ghi kết quả: `tests/kich-ban/README.md`.

Dữ liệu: bộ mẫu ở `docs/luat-chung/Du_lieu_mau.md`, nạp vào staging bằng `supabase/staging/du_lieu_mau.sql`. Kịch bản ghi "nạp lại" thì chạy lại file đó trước.
Kịch bản viết cho bản Zalo, số liệu theo ngày 07/10/2026 của bộ mẫu. Bước nào nói tới cửa sổ hay quyền của Zalo thì làm theo `docs/luat-chung/PWA.md`. Kịch bản gắn `[Zalo]` chỉ chạy ở bản Zalo.

### US1-KB1 · Màn chào mừng khi mở app lần đầu `[Chính]`
- **Mục đích:** người mới thấy A1 và dòng điều khoản, chưa bị hỏi gì.
- **Chuẩn bị:** Zalo của Chị Hoa, chưa từng mở app.
- **Làm:**
  1. Mở app Home247 trong Zalo.
- **Mong đợi:**
  - Thấy tên "Lịch phòng Hạ Long", 3 dòng giới thiệu và nút "Bắt đầu ngay".
  - Có dòng "Bằng việc tiếp tục, bạn đồng ý với Điều khoản và Chính sách quyền riêng tư". "Điều khoản" và "Chính sách quyền riêng tư" là hai link.
  - Không có hộp thoại xin quyền của Zalo. Không có ô tên hay số điện thoại.
- **Nguồn:** US1-NT2

### US1-KB2 · Bấm "Bắt đầu ngay" không bị hỏi tên, số `[Zalo]`
- **Mục đích:** vào app không phải cho tên hay số điện thoại.
- **Chuẩn bị:** Chị Hoa đang ở A1 (sau KB1).
- **Làm:**
  1. Bấm "Bắt đầu ngay".
- **Mong đợi:**
  - Sang màn "Bạn dùng app để làm gì?" (A3).
  - Không có popup của app hay hộp thoại Zalo xin tên, số điện thoại.
- **Nguồn:** US1-NT1

### US1-KB3 · Chưa chọn vai thì chưa đi tiếp được `[Biên]`
- **Mục đích:** không vào app khi chưa chọn chủ nhà hay sale.
- **Chuẩn bị:** Chị Hoa ở A3, chưa chạm thẻ nào.
- **Làm:**
  1. Bấm "Tiếp tục".
- **Mong đợi:**
  - Nút "Tiếp tục" mờ. Có dòng "Chọn một mục để tiếp tục".
  - Bấm nút không chuyển màn.
- **Nguồn:** mục "Chọn vai trò" trạng thái rỗng (A3-00)

### US1-KB4 · Chạm thẻ vai thì chỉ một thẻ được chọn `[Chính]`
- **Mục đích:** người dùng thấy rõ mình đang chọn vai nào.
- **Chuẩn bị:** Chị Hoa ở A3, chưa chạm thẻ nào.
- **Làm:**
  1. Chạm thẻ "Tôi là chủ nhà".
  2. Chạm thẻ "Tôi là sale".
  3. Chạm lại thẻ "Tôi là chủ nhà".
- **Mong đợi:**
  - Sau bước 1: thẻ chủ nhà đổi nền, viền, có dấu ✓. Nút "Tiếp tục" sáng.
  - Sau bước 2: thẻ sale được chọn, thẻ chủ nhà bỏ chọn.
  - Sau bước 3: thẻ chủ nhà được chọn, thẻ sale bỏ chọn.
- **Nguồn:** US1-NT4

### US1-KB5 · Chọn chủ nhà thì vào màn chưa có căn `[Chính]`
- **Mục đích:** chủ nhà mới biết việc đầu tiên là thêm căn.
- **Chuẩn bị:** Chị Hoa ở A3, thẻ "Tôi là chủ nhà" đang chọn (sau KB4).
- **Làm:**
  1. Bấm "Tiếp tục".
- **Mong đợi:**
  - Sang tab Lịch, thấy "Chưa có căn nào" và nút "Thêm căn đầu tiên".
  - Có khối "3 BƯỚC ĐỂ BẮT ĐẦU": Thêm căn và ảnh, Đặt giá, Mời sale xem lịch.
  - Có mẹo "Có sổ lịch cũ?".
  - Thanh tab: Lịch · Căn · Sale · Thống kê · Cá nhân.
- **Nguồn:** US1-NT3, US1-NT5

### US1-KB6 · "Thêm căn đầu tiên" mở form thêm căn `[Chính]`
- **Mục đích:** từ màn trống vào được form thêm căn.
- **Chuẩn bị:** Chị Hoa ở A4 (sau KB5).
- **Làm:**
  1. Bấm "Thêm căn đầu tiên".
- **Mong đợi:**
  - Mở form thêm căn: ô "Mã căn (tên căn hộ) *".
  - Hàng chip "Số phòng ngủ *": Studio, 1PN, 2PN, 3PN, 4PN+.
  - Mục Ảnh ghi "Bạn có thể thêm sau".
  - Dòng "Thêm tòa nhà, mô tả gửi khách, view..." đang thu gọn.
- **Nguồn:** mục "Màn đầu tiên khi chưa có dữ liệu" bước 2, mục "Thêm căn" bước 1

### US1-KB7 · Dòng "Thêm căn và ảnh" cũng mở form `[Chính]`
- **Mục đích:** lối vào thứ hai ở A4 dẫn đúng chỗ.
- **Chuẩn bị:** Chị Hoa ở A4, chưa có căn.
- **Làm:**
  1. Bấm dòng "Thêm căn và ảnh" trong khối 3 bước.
- **Mong đợi:**
  - Mở cùng form thêm căn như KB6.
- **Nguồn:** mục "Màn đầu tiên khi chưa có dữ liệu" bước 2

### US1-KB8 · Form trống không thêm được `[Lỗi]`
- **Mục đích:** chủ nhà biết còn thiếu gì trước khi lưu.
- **Chuẩn bị:** Chị Hoa ở form thêm căn, chưa điền gì.
- **Làm:**
  1. Bấm "Thêm căn".
- **Mong đợi:**
  - Nút "Thêm căn" mờ, bấm không lưu.
  - Có dòng "Còn thiếu: mã căn, số phòng ngủ".
- **Nguồn:** US1-NT9

### US1-KB9 · Có mã căn, chưa chọn số phòng ngủ `[Lỗi]`
- **Mục đích:** thiếu số phòng ngủ thì chưa thêm được.
- **Chuẩn bị:** Chị Hoa ở form thêm căn, chưa điền gì.
- **Làm:**
  1. Gõ "1509" vào ô Mã căn.
  2. Bấm "Thêm căn".
- **Mong đợi:**
  - Nút "Thêm căn" vẫn mờ, bấm không lưu.
  - Dòng "Còn thiếu" chỉ còn số phòng ngủ.
- **Nguồn:** US1-NT9

### US1-KB10 · Có số phòng ngủ, chưa có mã căn `[Lỗi]`
- **Mục đích:** thiếu mã căn thì chưa thêm được.
- **Chuẩn bị:** Chị Hoa ở form thêm căn, chưa điền gì.
- **Làm:**
  1. Chọn chip "2PN".
  2. Bấm "Thêm căn".
- **Mong đợi:**
  - Nút "Thêm căn" vẫn mờ, bấm không lưu.
  - Dòng "Còn thiếu" chỉ còn mã căn.
- **Nguồn:** US1-NT9

### US1-KB11 · Thêm căn đầu tiên chỉ với mã và số phòng ngủ `[Chính]`
- **Mục đích:** căn chỉ cần mã căn và số phòng ngủ, có ngay trong danh sách.
- **Chuẩn bị:** Chị Hoa chưa có căn, ở form thêm căn trống.
- **Làm:**
  1. Gõ "1509" vào ô Mã căn.
  2. Chọn chip "2PN".
  3. Bấm "Thêm căn".
- **Mong đợi:**
  - Sau bước 2: có dòng "Đủ thông tin. Ảnh, giá thêm sau cũng được." Nút "Thêm căn" sáng.
  - Sau bước 3: về danh sách căn. Toast "Đã thêm phòng 1509" ở đầu màn, ngay dưới thanh tiêu đề, tự tắt sau khoảng 3 giây.
  - Có nút "Thêm căn khác".
  - Thẻ "Phòng 1509" có nhãn "Mới thêm".
- **Nguồn:** US1-NT10, US1-NT12, HV8-NT2

### US1-KB12 · Thẻ căn không ghi số giường, số khách `[Chính]`
- **Mục đích:** căn chưa nhập số giường chỉ ghi số phòng ngủ.
- **Chuẩn bị:** Chị Hoa có căn 1509 (sau KB11).
- **Làm:**
  1. Mở tab Căn.
  2. Xem thẻ "Phòng 1509".
- **Mong đợi:**
  - Thẻ ghi "2PN", không có chữ "giường".
  - Thẻ không có "khách", "người lớn" hay "trẻ em".
- **Nguồn:** US1-NT7, US1-NT8

### US1-KB13 · Thêm căn thứ hai `[Chính]`
- **Mục đích:** có nhiều căn thì danh sách và số căn đổi đúng.
- **Chuẩn bị:** Chị Hoa có căn 1509, đang thấy nút "Thêm căn khác" (sau KB11).
- **Làm:**
  1. Bấm "Thêm căn khác".
  2. Gõ "3402" vào ô Mã căn.
  3. Chọn chip "2PN".
  4. Bấm "Thêm căn".
- **Mong đợi:**
  - Toast "Đã thêm phòng 3402".
  - Tiêu đề "Căn của tôi" ghi "2 căn".
  - Có thẻ "Phòng 1509" và thẻ "Phòng 3402". Thẻ 3402 có nhãn "Mới thêm".
- **Nguồn:** US1-NT12

### US1-KB14 · Danh sách 4 căn `[Chính]`
- **Mục đích:** tiêu đề đếm đúng số căn, mỗi căn một thẻ.
- **Chuẩn bị:** Chị Hoa có 1509 và 3402 (sau KB13).
- **Làm:**
  1. Ở tab Căn, bấm "Thêm căn".
  2. Gõ "Greenbay", chọn chip "2PN".
  3. Bấm "Thêm căn".
  4. Bấm "Thêm căn khác".
  5. Gõ "2208", chọn chip "1PN".
  6. Bấm "Thêm căn".
- **Mong đợi:**
  - Tiêu đề ghi "4 căn".
  - Có đúng 4 thẻ, mang mã 1509, 3402, Greenbay, 2208.
- **Nguồn:** US1-NT6

### US1-KB15 · Mã căn trùng `[Lỗi]`
- **Mục đích:** một chủ nhà không có hai căn cùng mã.
- **Chuẩn bị:** Chị Hoa có 4 căn (sau KB14).
- **Làm:**
  1. Ở tab Căn, bấm "Thêm căn".
  2. Gõ "1509", chọn chip "2PN".
  3. Bấm "Thêm căn".
  4. Mở tab Căn.
- **Mong đợi:**
  - Sau bước 3: vẫn ở form. Dòng đầu bắt đầu bằng "Chưa thêm được căn."
  - Ngay dưới ô mã căn: "Đã có căn 1509. Kiểm tra lại mã căn."
  - Sau bước 4: vẫn "4 căn", chỉ một thẻ Phòng 1509.
- **Nguồn:** US1-NT11

### US1-KB16 · Mã căn trùng có khoảng trắng hai đầu `[Biên]`
- **Mục đích:** gõ thừa dấu cách không lách được luật mã không trùng.
- **Chuẩn bị:** Chị Hoa có 4 căn (sau KB14).
- **Làm:**
  1. Ở tab Căn, bấm "Thêm căn".
  2. Gõ " 1509 " (một dấu cách trước và sau).
  3. Chọn chip "2PN".
  4. Bấm "Thêm căn".
- **Mong đợi:**
  - Báo "Đã có căn 1509. Kiểm tra lại mã căn." như KB15.
  - Tab Căn vẫn "4 căn".
- **Nguồn:** US1-NT11

### US1-KB17 · Chủ nhà khác không thấy căn của Chị Hoa `[Quyền]`
- **Mục đích:** mỗi chủ nhà chỉ thấy căn của mình.
- **Chuẩn bị:** Chị Hoa có 4 căn (sau KB14). Máy thứ hai đăng nhập Zalo Anh Tuấn, chưa mở app.
- **Làm:**
  1. Anh Tuấn mở app, bấm "Bắt đầu ngay".
  2. Chạm "Tôi là chủ nhà", bấm "Tiếp tục".
  3. Mở tab Căn.
  4. Thêm căn "Sapphire 1103", chọn chip "3PN", bấm "Thêm căn".
- **Mong đợi:**
  - Sau bước 2 và 3: thấy "Chưa có căn nào". Không có căn nào của Chị Hoa.
  - Sau bước 4: tiêu đề "1 căn", chỉ một thẻ Sapphire 1103. Không có 1509, 3402, Greenbay, 2208.
- **Nguồn:** US1-NT5, PQ3.CHU

### US1-KB18 · Bấm "Bắt đầu ngay" khi mất mạng `[Mạng]`
- **Mục đích:** mất mạng thì không vào nửa vời, có mạng lại thì vào tiếp được.
- **Chuẩn bị:** tài khoản Zalo test chưa mở app.
- **Làm:**
  1. Mở app, chờ thấy A1.
  2. Bật chế độ máy bay.
  3. Bấm "Bắt đầu ngay".
  4. Tắt chế độ máy bay.
  5. Bấm "Bắt đầu ngay".
- **Mong đợi:**
  - Sau bước 2: A1 vẫn hiện đủ, không báo lỗi.
  - Sau bước 3: vẫn ở A1, có báo "Chưa lưu được, bấm lại khi có mạng".
  - Sau bước 4: app không tự chuyển màn.
  - Sau bước 5: sang A3.
- **Nguồn:** mục "Đăng nhập" bước 1, mục "Đăng nhập" lỗi mạng, HV2 bước 3, 4

### US1-KB19 · Bấm "Tiếp tục" ở A3 khi mất mạng `[Mạng]`
- **Mục đích:** chưa tạo được tài khoản thì giữ lựa chọn, không vào A4.
- **Chuẩn bị:** tài khoản Zalo test chưa mở app, đang ở A3.
- **Làm:**
  1. Chạm "Tôi là chủ nhà".
  2. Bật chế độ máy bay.
  3. Bấm "Tiếp tục".
  4. Tắt chế độ máy bay.
  5. Bấm "Tiếp tục".
- **Mong đợi:**
  - Sau bước 3: vẫn ở A3, thẻ chủ nhà vẫn chọn, có báo "Chưa lưu được, bấm lại khi có mạng".
  - Sau bước 4: app không tự chuyển màn.
  - Sau bước 5: sang A4 "Chưa có căn nào".
- **Nguồn:** mục "Chọn vai trò" lỗi mạng, HV2 bước 3, 4

### US1-KB20 · Rời app ở màn chọn vai `[Mạng]`
- **Mục đích:** quay lại app thì vẫn ở đúng chỗ.
- **Chuẩn bị:** tài khoản Zalo test chưa mở app, đang ở A3.
- **Làm:**
  1. Chạm "Tôi là chủ nhà".
  2. Rời app.
  3. Đợi 1 phút.
  4. Mở lại Zalo.
- **Mong đợi:**
  - Vẫn ở A3 "Bạn dùng app để làm gì?", không quay về A1.
- **Nguồn:** mục "Chọn vai trò" quay lại từ nền, HV3 bước 2

### US1-KB21 · Bấm "Thêm căn" hai lần thật nhanh `[Mạng]`
- **Mục đích:** bấm hai lần không tạo hai căn.
- **Chuẩn bị:** Chị Hoa có 4 căn (sau KB14), ở form thêm căn trống.
- **Làm:**
  1. Gõ "2501", chọn chip "1PN".
  2. Bấm "Thêm căn" hai lần liền tay.
- **Mong đợi:**
  - Sau lần bấm đầu, nút đổi thành "Đang lưu…" và không bấm được.
  - Chỉ một toast "Đã thêm phòng 2501".
  - Tab Căn ghi "5 căn", chỉ một thẻ Phòng 2501.
- **Nguồn:** HV1 bước 3, mục "Thêm căn" đang tải

### US1-KB22 · Rời app khi đang nhập form `[Mạng]`
- **Mục đích:** đi gọi điện rồi quay lại không mất chữ đã nhập.
- **Chuẩn bị:** Chị Hoa ở form thêm căn trống.
- **Làm:**
  1. Gõ "2105".
  2. Chọn chip "2PN".
  3. Rời app.
  4. Đợi 1 phút.
  5. Mở lại Zalo.
- **Mong đợi:**
  - Vẫn ở form thêm căn. Ô mã căn ghi "2105", chip "2PN" vẫn chọn.
- **Nguồn:** mục "Thêm căn" quay lại từ nền, HV3 bước 2

### US1-KB23 · App bị tắt hẳn khi đang nhập form `[Mạng]`
- **Mục đích:** máy tắt app giữa chừng thì mở lại vẫn còn nội dung.
- **Chuẩn bị:** Chị Hoa ở form thêm căn, đã gõ "2105" và chọn "2PN" (sau KB22).
- **Làm:**
  1. Mở màn đa nhiệm của máy.
  2. Vuốt tắt hẳn Zalo.
  3. Mở Zalo, mở lại Home247.
- **Mong đợi:**
  - Form thêm căn mở lại, ô mã căn "2105", chip "2PN" đã chọn.
  - Có dòng "Đã khôi phục nội dung bạn đang nhập".
- **Nguồn:** HV3-NT2, HV3 bước 3

### US1-KB24 · Bấm "Thêm căn" khi mất mạng `[Mạng]`
- **Mục đích:** không bao giờ tưởng đã lưu khi chưa lưu.
- **Chuẩn bị:** Chị Hoa ở form, đã có "2105" và "2PN" (sau KB23).
- **Làm:**
  1. Bật chế độ máy bay.
  2. Bấm "Thêm căn".
  3. Tắt chế độ máy bay.
  4. Đợi 10 giây.
  5. Bấm "Thêm căn".
- **Mong đợi:**
  - Sau bước 2: báo "Chưa lưu được, bấm lại khi có mạng". Form giữ "2105", "2PN".
  - Sau bước 4: không có toast, vẫn ở form (app không tự gửi lại).
  - Sau bước 5: toast "Đã thêm phòng 2105". Tab Căn có đúng một thẻ Phòng 2105.
- **Nguồn:** mục "Thêm căn" lỗi mạng, HV2 bước 3, 4

### US1-KB25 · Mở tab Căn lần đầu khi mất mạng `[Mạng]`
- **Mục đích:** chưa có dữ liệu thì người dùng biết phải làm gì.
- **Chuẩn bị:** Zalo Chị Hoa đăng nhập trên một máy chưa từng mở tab Căn. Mở app, đang ở tab Lịch.
- **Làm:**
  1. Bật chế độ máy bay.
  2. Mở tab Căn.
  3. Tắt chế độ máy bay.
  4. Bấm "Thử lại".
- **Mong đợi:**
  - Sau bước 2: giữa màn "Chưa tải được. Kiểm tra mạng rồi bấm Thử lại", nút "Thử lại".
  - Sau bước 4: hiện danh sách căn của Chị Hoa.
- **Nguồn:** mục "Danh sách căn" lỗi mạng, HV2 bước 2

### US1-KB26 · Mở lại tab Căn đã xem `[Mạng]`
- **Mục đích:** màn đã xem hiện ngay, không trống.
- **Chuẩn bị:** Chị Hoa có căn, vừa mở tab Căn và thấy danh sách.
- **Làm:**
  1. Mở tab Lịch.
  2. Mở lại tab Căn.
- **Mong đợi:**
  - Danh sách căn hiện ngay, không có màn trống hay khung xám.
  - Nếu đang lấy dữ liệu mới thì có dòng nhỏ "Đang cập nhật…" ở đầu màn.
- **Nguồn:** mục "Danh sách căn" đang tải, HV1 bước 2
