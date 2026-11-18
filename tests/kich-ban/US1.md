# Kịch bản kiểm tay US1 · Chủ nhà vào app và quản lý căn: thêm, ảnh, sửa, xóa

Story: `docs/stories/US1-vao-app-va-can.md`. Cách chạy và cách ghi kết quả: `tests/kich-ban/README.md`.

Dữ liệu: bộ mẫu ở `docs/luat-chung/Du_lieu_mau.md`, nạp vào staging bằng `supabase/staging/du_lieu_mau.sql`. Kịch bản ghi "nạp lại" thì chạy lại file đó trước.

Các kịch bản dưới đây gộp từ nhiều story cũ ngày 18/11/2026 (QD-020) và còn viết cho bản Zalo, số liệu theo ngày 07/10/2026 của bộ mẫu. Chưa sửa theo story đã viết lại: việc này nằm trong mục "Việc cần làm" của story. Bước nào nói tới cửa sổ hay quyền của Zalo thì làm theo `docs/luat-chung/PWA.md`. Kịch bản gắn `[Zalo]` chỉ chạy ở bản Zalo.

### US1-KB1 · Màn chào mừng khi mở app lần đầu `[Chính]`
- **Mục đích:** người mới thấy A1 và dòng điều khoản, chưa bị hỏi gì.
- **Chuẩn bị:** Zalo của Chị Hoa, chưa từng mở app.
- **Làm:**
  1. Mở app Home247 trong Zalo.
- **Mong đợi:**
  - Thấy tên "Lịch phòng Hạ Long", 3 dòng giới thiệu và nút "Bắt đầu ngay".
  - Có dòng "Bằng việc tiếp tục, bạn đồng ý với Điều khoản và Chính sách quyền riêng tư". "Điều khoản" và "Chính sách quyền riêng tư" là hai link.
  - Không có hộp thoại xin quyền của Zalo. Không có ô tên hay số điện thoại.
- **Nguồn:** US1-NT1

### US1-KB2 · Bấm "Bắt đầu ngay" không bị hỏi tên, số `[Zalo]`
- **Mục đích:** vào app không phải cho tên hay số điện thoại.
- **Chuẩn bị:** Chị Hoa đang ở A1 (sau KB1).
- **Làm:**
  1. Bấm "Bắt đầu ngay".
- **Mong đợi:**
  - Sang màn "Bạn dùng app để làm gì?" (A3).
  - Không có popup của app hay hộp thoại Zalo xin tên, số điện thoại.
- **Nguồn:** US1-NT2

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
- **Nguồn:** US1-NT3

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
- **Nguồn:** US1-NT5, US1-NT7

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
- **Nguồn:** US1-NT12

### US1-KB9 · Có mã căn, chưa chọn số phòng ngủ `[Lỗi]`
- **Mục đích:** thiếu số phòng ngủ thì chưa thêm được.
- **Chuẩn bị:** Chị Hoa ở form thêm căn, chưa điền gì.
- **Làm:**
  1. Gõ "1509" vào ô Mã căn.
  2. Bấm "Thêm căn".
- **Mong đợi:**
  - Nút "Thêm căn" vẫn mờ, bấm không lưu.
  - Dòng "Còn thiếu" chỉ còn số phòng ngủ.
- **Nguồn:** US1-NT12

### US1-KB10 · Có số phòng ngủ, chưa có mã căn `[Lỗi]`
- **Mục đích:** thiếu mã căn thì chưa thêm được.
- **Chuẩn bị:** Chị Hoa ở form thêm căn, chưa điền gì.
- **Làm:**
  1. Chọn chip "2PN".
  2. Bấm "Thêm căn".
- **Mong đợi:**
  - Nút "Thêm căn" vẫn mờ, bấm không lưu.
  - Dòng "Còn thiếu" chỉ còn mã căn.
- **Nguồn:** US1-NT12

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
- **Nguồn:** US1-NT13, US1-NT17, HV8-NT2

### US1-KB12 · Thẻ căn không ghi số giường, số khách `[Chính]`
- **Mục đích:** căn chưa nhập số giường chỉ ghi số phòng ngủ.
- **Chuẩn bị:** Chị Hoa có căn 1509 (sau KB11).
- **Làm:**
  1. Mở tab Căn.
  2. Xem thẻ "Phòng 1509".
- **Mong đợi:**
  - Thẻ ghi "2PN", không có chữ "giường".
  - Thẻ không có "khách", "người lớn" hay "trẻ em".
- **Nguồn:** US1-NT9, US1-NT10

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
- **Nguồn:** US1-NT17

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
- **Nguồn:** US1-NT8

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
- **Nguồn:** US1-NT15

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
- **Nguồn:** US1-NT15

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
- **Nguồn:** US1-NT7, PQ3.CHU

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

### US1-KB27 · Lần đầu bấm "Thêm ảnh" `[Zalo]`
- **Mục đích:** chọn ảnh dùng cửa sổ của Zalo, chọn được nhiều ảnh một lần.
- **Chuẩn bị:** Chị Hoa chưa từng cấp hay từ chối quyền ảnh cho Home247.
- **Làm:**
  1. Mở tab Căn, bấm "Thêm căn".
  2. Bấm "Thêm ảnh".
  3. Nếu Zalo hỏi quyền ảnh, bấm cho phép.
  4. Chạm chọn 3 ảnh.
- **Mong đợi:**
  - Zalo hỏi quyền chỉ ở bước 2, không hỏi lúc mở form.
  - Cửa sổ chọn ảnh của Zalo mở. Chọn được cả 3 ảnh trong một lần.
- **Nguồn:** mục "Ảnh khi thêm căn" bước 1

### US1-KB28 · Thêm căn có 5 ảnh `[Chính]`
- **Mục đích:** chủ nhà thêm căn kèm ảnh, ảnh đầu là ảnh đại diện.
- **Chuẩn bị:** Chị Hoa ở form thêm căn trống.
- **Làm:**
  1. Gõ "2105" vào ô Mã căn.
  2. Chọn chip "2PN".
  3. Bấm "Thêm ảnh".
  4. Chọn 5 ảnh, bấm xong.
  5. Chờ hết chữ "Đang tải".
  6. Bấm "Thêm căn".
- **Mong đợi:**
  - Sau bước 5: mục Ảnh ghi "ẢNH (5)". Ảnh đầu tiên có nhãn "Ảnh đại diện". Có dòng "Ảnh đầu tiên là ảnh đại diện · Tối đa 12 ảnh".
  - Sau bước 6: toast "Đã thêm phòng 2105".
  - Thẻ Phòng 2105 hiện ảnh đầu tiên đã chọn và số ảnh là 5.
- **Nguồn:** mục "Ảnh khi thêm căn" bước 1 đến 3, nhóm Căn và giá quy tắc Ảnh căn, mục "Danh sách căn" (US1) bước 2

### US1-KB29 · Căn có 5 ảnh thì thẻ gợi ý thêm ảnh `[Biên]`
- **Mục đích:** căn dưới 6 ảnh được nhắc thêm ảnh.
- **Chuẩn bị:** Chị Hoa có căn 2105 với 5 ảnh (sau KB2).
- **Làm:**
  1. Mở tab Căn.
  2. Xem thẻ Phòng 2105.
- **Mong đợi:**
  - Thẻ có gợi ý "Nên thêm ảnh: sale cần ít nhất 6 ảnh".
- **Nguồn:** US1-NT11

### US1-KB30 · Căn có 6 ảnh thì thẻ không gợi ý `[Biên]`
- **Mục đích:** đủ 6 ảnh thì không còn nhắc.
- **Chuẩn bị:** Chị Hoa ở form thêm căn trống.
- **Làm:**
  1. Gõ "2501", chọn chip "1PN".
  2. Bấm "Thêm ảnh", chọn 6 ảnh.
  3. Chờ tải xong.
  4. Bấm "Thêm căn".
  5. Xem thẻ Phòng 2501 ở tab Căn.
- **Mong đợi:**
  - Thẻ ghi số ảnh là 6.
  - Thẻ không có gợi ý "Nên thêm ảnh".
- **Nguồn:** US1-NT11

### US1-KB31 · Căn chưa có ảnh `[Biên]`
- **Mục đích:** căn không ảnh được nhắc rõ.
- **Chuẩn bị:** Chị Hoa có căn 1509 chưa có ảnh.
- **Làm:**
  1. Mở tab Căn.
  2. Xem thẻ Phòng 1509.
- **Mong đợi:**
  - Thẻ ghi "Chưa có ảnh".
  - Có gợi ý "Nên thêm ảnh: sale cần ít nhất 6 ảnh".
- **Nguồn:** US1-NT11

### US1-KB32 · Đang tải ảnh thì chưa thêm căn được `[Mạng]`
- **Mục đích:** không lưu căn khi ảnh còn đang lên.
- **Chuẩn bị:** bật mạng chậm. Chị Hoa ở form thêm căn trống.
- **Làm:**
  1. Gõ "Greenbay", chọn chip "2PN".
  2. Bấm "Thêm ảnh", chọn 5 ảnh.
  3. Khi còn ảnh đang tải, bấm "Thêm căn".
  4. Chờ tải xong hết.
  5. Bấm "Thêm căn".
- **Mong đợi:**
  - Sau bước 2: tiêu đề "ẢNH (5)". Có dòng "Đang tải 1 ảnh…" (số theo số ảnh đang tải). Ảnh đang tải ghi "Đang tải" kèm phần trăm.
  - Sau bước 3: nút "Thêm căn" mờ, không lưu. Có dòng "Đang tải 1 ảnh. Chờ tải xong mới thêm được căn."
  - Sau bước 5: toast "Đã thêm phòng Greenbay". Thẻ ghi 5 ảnh.
- **Nguồn:** US1-NT20

### US1-KB33 · Ảnh tải lỗi chặn thêm căn `[Lỗi]`
- **Mục đích:** ảnh lỗi được báo rõ và căn chưa được thêm.
- **Chuẩn bị:** bật mạng chậm. Chị Hoa ở form thêm căn trống.
- **Làm:**
  1. Gõ "2208", chọn chip "1PN".
  2. Bấm "Thêm ảnh", chọn 3 ảnh.
  3. Khi còn ảnh ghi "Đang tải", bật chế độ máy bay.
  4. Tắt chế độ máy bay.
  5. Bấm "Thêm căn".
  6. Mở tab Căn.
- **Mong đợi:**
  - Sau bước 3: ảnh chưa tải xong ghi "Tải lỗi", có nút "Thử lại" và nút ✕.
  - Sau bước 5: vẫn ở form. Dòng đầu bắt đầu bằng "Chưa thêm được căn." Có dòng "1 ảnh chưa tải được. Bấm Thử lại hoặc xóa ảnh đó rồi thêm căn." (số theo số ảnh lỗi).
  - Sau bước 6: không có thẻ 2208.
- **Nguồn:** US1-NT21

### US1-KB34 · Thử lại ảnh lỗi rồi thêm căn `[Lỗi]`
- **Mục đích:** ảnh lỗi tải lại được, sau đó thêm được căn.
- **Chuẩn bị:** form 2208 còn ảnh "Tải lỗi" (sau KB7, quay lại form). Tắt mạng chậm.
- **Làm:**
  1. Bấm "Thử lại" trên ảnh lỗi.
  2. Chờ ảnh tải xong.
  3. Bấm "Thêm căn".
- **Mong đợi:**
  - Sau bước 2: không còn ảnh ghi "Tải lỗi".
  - Sau bước 3: toast "Đã thêm phòng 2208". Thẻ Phòng 2208 ghi 3 ảnh.
- **Nguồn:** US1-NT21

### US1-KB35 · Xóa ảnh lỗi rồi thêm căn `[Lỗi]`
- **Mục đích:** bỏ ảnh lỗi thì thêm được căn với các ảnh còn lại.
- **Chuẩn bị:** bật mạng chậm. Anh Tuấn ở form thêm căn trống.
- **Làm:**
  1. Gõ "Sapphire 1103", chọn chip "3PN".
  2. Bấm "Thêm ảnh", chọn 3 ảnh.
  3. Khi còn ảnh ghi "Đang tải", bật chế độ máy bay.
  4. Tắt chế độ máy bay.
  5. Bấm ✕ trên mỗi ảnh "Tải lỗi".
  6. Bấm "Thêm căn".
- **Mong đợi:**
  - Sau bước 5: không còn ảnh "Tải lỗi". Tiêu đề Ảnh giảm đúng số ảnh đã xóa.
  - Sau bước 6: toast "Đã thêm phòng Sapphire 1103". Thẻ ghi số ảnh bằng số ảnh còn lại.
- **Nguồn:** US1-NT21

### US1-KB36 · 12 ảnh là tối đa `[Biên]`
- **Mục đích:** không thêm được ảnh thứ 13.
- **Chuẩn bị:** Anh Tuấn ở form thêm căn trống.
- **Làm:**
  1. Gõ "À La Carte 2208", chọn chip "1PN".
  2. Bấm "Thêm ảnh", chọn 12 ảnh.
  3. Chờ tải xong.
  4. Thử thêm một ảnh nữa bằng "Thêm ảnh".
  5. Bấm "Thêm căn".
- **Mong đợi:**
  - Sau bước 3: tiêu đề "ẢNH (12)".
  - Sau bước 4: không thêm được ảnh thứ 13. Mục Ảnh vẫn "ẢNH (12)".
  - Sau bước 5: toast "Đã thêm phòng À La Carte 2208". Thẻ ghi 12 ảnh, không có gợi ý thêm ảnh.
- **Nguồn:** US1-NT22, US1-NT11

### US1-KB37 · Chọn quá 12 ảnh qua hai lần chọn `[Biên]`
- **Mục đích:** cộng dồn nhiều lần chọn vẫn không quá 12 ảnh.
- **Chuẩn bị:** Chị Hoa ở form thêm căn trống.
- **Làm:**
  1. Bấm "Thêm ảnh", chọn 10 ảnh.
  2. Chờ tải xong.
  3. Bấm "Thêm ảnh", chọn 3 ảnh nữa.
  4. Bấm quay lại để bỏ form, không thêm căn.
- **Mong đợi:**
  - Sau bước 3: mục Ảnh có nhiều nhất 12 ảnh, tiêu đề không quá "ẢNH (12)".
  - Sau bước 4: tab Căn không có căn mới.
- **Nguồn:** US1-NT22

### US1-KB38 · Đã từ chối quyền chọn ảnh `[Zalo]`
- **Mục đích:** người đã từ chối biết cách bật lại, vẫn thêm được căn không ảnh.
- **Chuẩn bị:** quyền ảnh của Home247 đang bị từ chối trong Zalo. Chị Hoa ở form thêm căn trống.
- **Làm:**
  1. Bấm "Thêm ảnh".
- **Mong đợi:**
  - Không hiện hộp thoại xin quyền của Zalo.
  - Thấy thẻ "Cần quyền chọn ảnh để thêm ảnh căn" và nút "Mở cài đặt quyền".
  - Có dòng "Căn vẫn lưu được khi chưa có ảnh."
- **Nguồn:** HV4-NT1, HV4 bước 3b, mục "Ảnh khi thêm căn" đã từ chối quyền Zalo

### US1-KB39 · Bật lại quyền ảnh rồi làm tiếp `[Zalo]`
- **Mục đích:** bật quyền xong quay lại không mất form.
- **Chuẩn bị:** đang thấy thẻ "Cần quyền chọn ảnh để thêm ảnh căn" (sau KB12). Ô mã căn đã gõ "1509", chip "2PN" đã chọn (chỉ để xem form còn giữ, không bấm "Thêm căn").
- **Làm:**
  1. Bấm "Mở cài đặt quyền".
  2. Bật quyền ảnh cho Home247.
  3. Quay lại app.
  4. Bấm "Thêm ảnh".
- **Mong đợi:**
  - Sau bước 1: mở màn cài đặt quyền của Zalo.
  - Sau bước 3: vẫn ở form thêm căn, nội dung đã nhập còn nguyên.
  - Sau bước 4: cửa sổ chọn ảnh của Zalo mở.
- **Nguồn:** HV4 bước 4, 5

### US1-KB40 · Rời app khi form đã có ảnh `[Mạng]`
- **Mục đích:** ảnh đã tải không mất khi người dùng rời app.
- **Chuẩn bị:** Chị Hoa ở form thêm căn trống.
- **Làm:**
  1. Bấm "Thêm ảnh", chọn 3 ảnh.
  2. Chờ tải xong.
  3. Rời app.
  4. Đợi 1 phút.
  5. Mở lại Zalo.
- **Mong đợi:**
  - Vẫn ở form thêm căn, tiêu đề "ẢNH (3)", đủ 3 ảnh.
  - Ảnh đầu tiên vẫn có nhãn "Ảnh đại diện".
- **Nguồn:** mục "Ảnh khi thêm căn" quay lại từ nền, HV3 bước 2, 7

### US1-KB41 · Thẻ căn ghi số phòng ngủ và số giường `[Chính]`
- **Mục đích:** sale và chủ nhà thấy số giường trên thẻ căn.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa.
- **Làm:**
  1. Mở tab Căn.
  2. Xem thẻ 1509.
- **Mong đợi:**
  - Dòng thông tin có "2PN · 3 giường", "view biển", "ICON40".
  - Không có chữ "khách", "người lớn", "trẻ em".
- **Nguồn:** US1-NT9

### US1-KB42 · Thêm căn không mở phần thêm thông tin `[Chính]`
- **Mục đích:** căn chỉ cần mã căn và số phòng ngủ.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa.
- **Làm:**
  1. Tab Căn, bấm "Thêm căn".
  2. Ô "Mã căn (tên căn hộ) *" gõ 2105.
  3. Chọn chip 2 phòng ngủ.
  4. Không bấm "Thêm tòa nhà, mô tả gửi khách, view...".
  5. Bấm "Thêm căn".
- **Mong đợi:**
  - Thêm được, có toast "Đã thêm phòng 2105".
  - Thẻ 2105 có nhãn "Mới thêm", dòng phòng ngủ ghi "2PN".
- **Nguồn:** US1-NT13

### US1-KB43 · Mở phần tòa nhà, view, số giường, mô tả `[Chính]`
- **Mục đích:** phần mở rộng có đủ ô.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa.
- **Làm:**
  1. Tab Căn, bấm "Thêm căn".
  2. Bấm "Thêm tòa nhà, mô tả gửi khách, view...".
  3. Bấm "Thu gọn".
- **Mong đợi:**
  - Bước 2 có: hàng chip "Tòa nhà" (ICON40, À La Carte, Sapphire, "+ Tòa khác"); hàng chip "Loại view"; ô "Số giường"; ô "Mô tả gửi khách" kèm dòng "Sale dùng đoạn này khi gửi thông tin căn cho khách."; nút "Thu gọn".
  - Bước 3 phần đó thu lại.
- **Nguồn:** mục "Tòa nhà, loại view, số giường, mô tả" bước 1, mục "Tòa nhà, loại view, số giường, mô tả" trạng thái rỗng (thu gọn mặc định)

### US1-KB44 · Danh sách loại view không có Vịnh `[Chính]`
- **Mục đích:** lựa chọn view đúng glossary.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa.
- **Làm:**
  1. Tab Căn, bấm "Thêm căn".
  2. Bấm "Thêm tòa nhà, mô tả gửi khách, view...".
  3. Xem hàng chip "Loại view".
- **Mong đợi:**
  - Có đúng ba chip: Biển, Thành phố, Núi.
  - Không có "Vịnh".
- **Nguồn:** US1-NT27

### US1-KB45 · Tìm tòa theo chữ đã gõ `[Chính]`
- **Mục đích:** gõ một phần tên thì thấy tòa có chữ đó và dòng thêm tòa mới.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa.
- **Làm:**
  1. Tab Căn, bấm "Thêm căn", bấm "Thêm tòa nhà, mô tả gửi khách, view...".
  2. Chạm chip "+ Tòa khác".
  3. Ô "Tên tòa nhà" gõ Green.
- **Mong đợi:**
  - Có ghi chú "Chọn tòa có sẵn để sale lọc đúng tòa. Không thấy thì thêm tòa mới."
  - Danh sách chỉ còn các tòa có chữ "Green" trong tên, mỗi dòng có tên và khu vực.
  - Có dòng "+ Thêm tòa mới Green".
- **Nguồn:** US1-NT26

### US1-KB46 · Thêm tòa mới rồi gắn vào căn `[Chính]`
- **Mục đích:** tòa mới gắn vào căn và hiện trên thẻ căn.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa.
- **Làm:**
  1. Tab Căn, bấm "Thêm căn". Gõ mã 2106, chọn 1 phòng ngủ.
  2. Bấm "Thêm tòa nhà, mô tả gửi khách, view...", chạm "+ Tòa khác".
  3. Gõ Green Hạ Long Test.
  4. Chạm "+ Thêm tòa mới Green Hạ Long Test".
  5. Bấm "Thêm căn".
- **Mong đợi:**
  - Thẻ 2106 ở tab Căn ghi tòa "Green Hạ Long Test".
- **Nguồn:** mục "Tòa nhà, loại view, số giường, mô tả" bước 3, quy tắc Tòa nhà dùng chung (nhóm Căn và giá)

### US1-KB47 · Nhập số giường khi thêm căn `[Chính]`
- **Mục đích:** số giường nhập ở form hiện trên thẻ căn.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa.
- **Làm:**
  1. Tab Căn, bấm "Thêm căn". Gõ mã 2107, chọn 2 phòng ngủ.
  2. Bấm "Thêm tòa nhà, mô tả gửi khách, view...".
  3. Ô "Số giường" nhập 2.
  4. Bấm "Thêm căn".
- **Mong đợi:**
  - Thẻ 2107 ở tab Căn ghi "2PN · 2 giường".
- **Nguồn:** US1-NT9, US1-NT9

### US1-KB48 · Bỏ trống số giường `[Biên]`
- **Mục đích:** số giường không bắt buộc và không bị nhắc thiếu.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa.
- **Làm:**
  1. Tab Căn, bấm "Thêm căn". Gõ mã 2108, chọn 2 phòng ngủ.
  2. Bấm "Thêm tòa nhà, mô tả gửi khách, view...". Để trống ô "Số giường".
  3. Xem dòng "Còn thiếu…" ở thanh dưới.
  4. Bấm "Thêm căn".
- **Mong đợi:**
  - Dòng "Còn thiếu…" không nhắc số giường.
  - Thêm được. Thẻ 2108 chỉ ghi "2PN", không có chữ "giường".
- **Nguồn:** US1-NT14

### US1-KB49 · App bị đóng khi đang thêm căn `[Mạng]`
- **Mục đích:** mở lại app thì form thêm căn được điền lại.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa.
- **Làm:**
  1. Tab Căn, bấm "Thêm căn". Gõ mã 2109, chọn 2 phòng ngủ, mở phần thêm, nhập số giường 3.
  2. Mở danh sách ứng dụng đang chạy của điện thoại, vuốt tắt Zalo.
  3. Mở lại Zalo, mở app Home247.
- **Mong đợi:**
  - Form thêm căn mở lại với mã 2109, 2 phòng ngủ, số giường 3.
  - Có dòng "Đã khôi phục nội dung bạn đang nhập".
- **Nguồn:** HV3-NT2, HV3 bước 3 (mục "Tòa nhà, loại view, số giường, mô tả" trạng thái quay lại từ nền)

### US1-KB50 · Mở sửa căn thấy đúng giá trị `[Chính]`
- **Mục đích:** form sửa điền sẵn mọi thông tin của căn.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa.
- **Làm:**
  1. Tab Căn, chạm thẻ 1509.
- **Mong đợi:**
  - Tiêu đề "Sửa phòng 1509", tab "Thông tin" đang chọn, có tab "Giá".
  - Mã căn 1509, chip 2 phòng ngủ đang chọn, tòa ICON40, view Biển, "Số giường" 3.
  - Ảnh hiện đúng các ảnh đang có của 1509, cùng số ảnh ghi trên thẻ.
- **Nguồn:** US1-NT30

### US1-KB51 · Đổi thứ tự ảnh `[Chính]`
- **Mục đích:** ảnh số 1 sau khi lưu là ảnh đại diện.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa. 1509 có ít nhất 3 ảnh. Chụp màn hình thẻ 1509 trước khi làm.
- **Làm:**
  1. Tab Căn, chạm thẻ 1509.
  2. Ở mục ảnh, bấm "Đổi thứ tự".
  3. Kéo ảnh số 3 lên vị trí số 1.
  4. Bấm "Lưu thay đổi".
- **Mong đợi:**
  - Về tab Căn. Ảnh trên thẻ 1509 là ảnh vừa kéo lên số 1, khác ảnh trong ảnh chụp trước.
  - Mở lại sửa căn: ảnh đó đứng đầu.
- **Nguồn:** US1-NT31

### US1-KB52 · Xóa một ảnh `[Chính]`
- **Mục đích:** ảnh bị xóa không còn gắn với căn sau khi lưu.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa. Ghi lại số ảnh trên thẻ 1509.
- **Làm:**
  1. Tab Căn, chạm thẻ 1509.
  2. Bấm ✕ trên ảnh cuối cùng.
  3. Bấm "Lưu thay đổi".
- **Mong đợi:**
  - Số ảnh trên thẻ 1509 bớt 1.
  - Mở lại sửa căn không còn ảnh đó.
- **Nguồn:** mục "Sửa thông tin căn" bước 3, 5

### US1-KB53 · Đổi mã căn trùng căn khác `[Lỗi]`
- **Mục đích:** một chủ nhà không có hai căn cùng mã.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa.
- **Làm:**
  1. Tab Căn, chạm thẻ 1509.
  2. Sửa mã căn thành 3402.
  3. Bấm "Lưu thay đổi".
  4. Quay về tab Căn.
- **Mong đợi:**
  - Dưới ô mã căn có lỗi "Đã có căn 3402".
  - Không lưu. Tab Căn vẫn có 1509 và 3402.
- **Nguồn:** US1-NT32

### US1-KB54 · Sửa và xóa trống số giường `[Chính]`
- **Mục đích:** thẻ căn đổi theo số giường mới.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa.
- **Làm:**
  1. Tab Căn, chạm thẻ 1509. Ô "Số giường" đổi thành 4. Bấm "Lưu thay đổi".
  2. Chạm thẻ 1509. Xóa trống ô "Số giường". Bấm "Lưu thay đổi".
  3. Chạm thẻ 1509. Nhập lại 3. Bấm "Lưu thay đổi".
- **Mong đợi:**
  - Sau bước 1 thẻ ghi "2PN · 4 giường".
  - Sau bước 2 thẻ chỉ ghi "2PN", không có chữ "giường".
  - Sau bước 3 thẻ ghi "2PN · 3 giường".
- **Nguồn:** US1-NT33, US1-NT9

### US1-KB55 · Đã từ chối quyền chọn ảnh `[Zalo]`
- **Mục đích:** bấm "Thêm ảnh" không đứng im và không hỏi lại quyền.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa. Trước đó đã bấm từ chối khi Zalo hỏi quyền chọn ảnh.
- **Làm:**
  1. Tab Căn, chạm thẻ 1509.
  2. Bấm "Thêm ảnh".
  3. Bấm "Mở cài đặt quyền".
- **Mong đợi:**
  - Bước 2 thấy thẻ "Cần quyền chọn ảnh để thêm ảnh căn" và nút "Mở cài đặt quyền". Không hiện hộp thoại xin quyền của Zalo.
  - Bước 3 mở trang cài đặt quyền của Zalo.
  - Các ô khác vẫn sửa và lưu được.
- **Nguồn:** HV4-NT1, HV4 bước 3b, 4 (mục "Sửa thông tin căn" trạng thái đã từ chối quyền Zalo)

### US1-KB56 · Mất mạng khi lưu sửa căn `[Mạng]`
- **Mục đích:** không tưởng đã lưu khi chưa lưu.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa.
- **Làm:**
  1. Tab Căn, chạm thẻ 1509. Đổi số giường thành 4.
  2. Bật chế độ máy bay.
  3. Bấm "Lưu thay đổi".
  4. Tắt chế độ máy bay, về tab Căn.
- **Mong đợi:**
  - Bước 3 báo "Chưa lưu được, bấm lại khi có mạng". Ô vẫn ghi 4.
  - Bước 4 thẻ 1509 vẫn "2PN · 3 giường".
- **Nguồn:** HV2 bước 3, 4 (mục "Sửa thông tin căn" trạng thái lỗi mạng)

### US1-KB57 · Rời app khi đang sửa căn `[Mạng]`
- **Mục đích:** quay lại từ nền vẫn còn chỗ đang sửa.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa.
- **Làm:**
  1. Tab Căn, chạm thẻ 1509. Gõ thêm vào "Mô tả gửi khách": Gần bãi tắm.
  2. Về màn hình chính, mở ứng dụng khác, chờ 1 phút.
  3. Mở lại Zalo.
- **Mong đợi:**
  - Vẫn ở "Sửa phòng 1509", ô mô tả còn chữ "Gần bãi tắm".
- **Nguồn:** HV3 bước 1, 2 (mục "Sửa thông tin căn" trạng thái quay lại từ nền)

### US1-KB58 · Sale và chủ nhà khác không sửa được căn `[Quyền]`
- **Mục đích:** chỉ người giữ căn sửa được căn.
- **Chuẩn bị:** hai máy: máy 1 tài khoản Sale Hùng, máy 2 tài khoản Anh Tuấn.
- **Làm:**
  1. Máy 1: mở chi tiết căn ICON40 1509 từ lịch phòng.
  2. Máy 2: mở tab Căn.
- **Mong đợi:**
  - Máy 1 thấy ảnh và thông tin 1509, không có nút sửa căn, không có "Lưu thay đổi".
  - Máy 2 chỉ có Sapphire 1103 và À La Carte 2208, không có 1509, 3402.
- **Nguồn:** PQ3.SALE, PQ3.CHU

### US1-KB59 · Tòa do người khác thêm hiện cho mọi chủ nhà `[Chính]`
- **Mục đích:** tòa mới thêm vào danh sách chung, người dùng khác thấy và chọn được.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa. Đã chạy US1-KB46 (tòa "Green Hạ Long Test" đã được thêm). Máy thứ hai (hoặc đăng nhập lại) bằng tài khoản Anh Tuấn.
- **Làm:**
  1. Anh Tuấn: tab Căn, bấm "Thêm căn".
  2. Bấm "Thêm tòa nhà, mô tả gửi khách, view...", chạm "+ Tòa khác".
  3. Xem danh sách tòa có sẵn.
  4. Ô "Tên tòa nhà" gõ Green Hạ.
  5. Chạm dòng "Green Hạ Long Test".
- **Mong đợi:**
  - Bước 3 danh sách có "Green Hạ Long Test" cùng ICON40, À La Carte, Sapphire. [MỞ: US1-H2] (can-anh.md [MỞ: US1-H2]: khi chưa gõ chữ nào; danh sách có cả tòa người dùng khác thêm không)
  - Bước 4 danh sách chỉ còn "Green Hạ Long Test" và có dòng "+ Thêm tòa mới Green Hạ".
  - Bước 5 tòa được chọn gắn vào căn đang thêm.
- **Nguồn:** US1-NT28

### US1-KB60 · Xóa căn còn đặt phòng sắp tới bị chặn `[Lỗi]`
- **Mục đích:** căn còn khách sắp tới thì không xóa được và không mất khỏi màn.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa, dữ liệu thử vừa nạp lại (3402 có B2 17/10 → 19/10).
- **Làm:**
  1. Tab Căn, xóa căn 3402 (vị trí nút xóa chưa vẽ).
  2. Nếu app hỏi lại, xác nhận xóa.
  3. Xem tab Căn, rồi tab Lịch.
- **Mong đợi:**
  - Báo "Căn còn đặt phòng sắp tới".
  - Tab Căn vẫn ghi "2 căn", còn thẻ 3402.
  - Tab Lịch vẫn có chip "3402", ngày 17/10 và 18/10 vẫn có vạch màu của 3402.
- **Nguồn:** US1-NT35

### US1-KB61 · Xóa căn còn yêu cầu đang chờ bị chặn `[Lỗi]`
- **Mục đích:** căn có yêu cầu của sale chưa trả lời thì không xóa được.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa, có thêm căn 2107 (một yêu cầu chờ của Sale Hùng, không có đặt phòng).
- **Làm:**
  1. Tab Căn, xóa căn 2107.
  2. Nếu app hỏi lại, xác nhận xóa.
  3. Xem tab Căn.
- **Mong đợi:**
  - Báo "Căn còn đặt phòng sắp tới".
  - Thẻ 2107 vẫn ở tab Căn.
  - Yêu cầu của Sale Hùng vẫn đang chờ (không bị hủy).
- **Nguồn:** US1-NT36

### US1-KB62 · Đặt phòng cuối có ngày trả là hôm nay thì xóa được `[Biên]`
- **Mục đích:** mốc "sau hôm nay" tính đúng: ngày trả đúng hôm nay không còn là đặt phòng sắp tới.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa, có thêm căn 2106 (một đặt phòng 05/10 → 07/10, hôm nay 07/10, không có yêu cầu chờ).
- **Làm:**
  1. Tab Căn, xóa căn 2106.
  2. Nếu app hỏi lại, xác nhận xóa.
  3. Xem tab Căn.
- **Mong đợi:**
  - Xóa được, không có báo "Căn còn đặt phòng sắp tới".
  - Thẻ 2106 không còn ở tab Căn.
- **Nguồn:** US1-NT38

### US1-KB63 · Xóa 3402, căn biến khỏi mọi màn chọn căn `[Chính]`
- **Mục đích:** căn đã xóa không còn trong danh sách, lịch, đặt phòng, đặt giá.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa, dùng biến thể A (3402 chỉ còn B4). Trước khi xóa, tab Căn ghi "2 căn".
- **Làm:**
  1. Tab Căn, xóa căn 3402.
  2. Nếu app hỏi lại, xác nhận xóa.
  3. Xem tab Căn.
  4. Tab Lịch, xem hàng chip căn và ngày 14/10.
  5. Bấm "Đặt phòng", xem hàng chip "Phòng".
  6. Tab Căn, bấm "Đặt giá nhiều căn", xem danh sách.
  7. Mở tab Giá của 1509, bấm "Sao chép giá sang căn khác", xem mục "SANG CĂN".
- **Mong đợi:**
  - Bước 3 tiêu đề ghi "1 căn", chỉ có thẻ 1509.
  - Bước 4 chỉ còn chip 1509; ngày 14/10 không có vạch màu của 3402.
  - Bước 5 chỉ có chip "1509".
  - Bước 6 dòng đếm ghi "/1", chỉ có Phòng 1509.
  - Bước 7 không có 3402 trong "SANG CĂN".
- **Nguồn:** US1-NT39

### US1-KB64 · Xóa căn xong, doanh thu tháng 10 không đổi `[Chính]`
- **Mục đích:** đặt phòng cũ của căn đã ẩn vẫn nằm trong thống kê.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa, dùng biến thể A. Màn Thống kê của chủ nhà (US18) đã có. Mở tab Thống kê, tháng 10, ghi lại doanh thu và số đêm có khách.
- **Làm:**
  1. Tab Căn, xóa căn 3402. Nếu app hỏi lại, xác nhận xóa.
  2. Tab Thống kê, xem tháng 10.
- **Mong đợi:**
  - Doanh thu tháng 10 và số đêm có khách bằng số đã ghi (vẫn tính B4 của 3402 và các đặt phòng của 1509).
- **Nguồn:** US1-NT40

### US1-KB65 · Sale không còn thấy căn đã xóa, đặt phòng cũ vẫn còn `[Quyền]`
- **Mục đích:** sale không nhận căn đã ẩn, nhưng không mất đặt phòng cũ của mình.
- **Chuẩn bị:** hai máy: máy 1 tài khoản Chị Hoa, máy 2 tài khoản Sale Hùng. Dùng biến thể A (Hùng có đặt phòng cũ với 3402). Màn Thống kê của sale (US19) đã có. Máy 2 mở lịch phòng, thấy 3402 trong nguồn phòng, và ghi lại doanh số ở S7.
- **Làm:**
  1. Máy 1: tab Căn, xóa căn 3402. Nếu app hỏi lại, xác nhận xóa.
  2. Máy 2: kéo làm mới lịch phòng (S1), xem danh sách căn.
  3. Máy 2: tìm phòng trống một khoảng ngày bất kỳ, xem kết quả.
  4. Máy 2: tab Thống kê, mở danh sách đặt phòng (S7-03), xem doanh số ở S7.
- **Mong đợi:**
  - Bước 2 và 3 không còn 3402 ở lịch phòng và kết quả tìm.
  - Bước 4 đặt phòng cũ của Hùng với 3402 vẫn ở S7-03 và doanh số ở S7 bằng số đã ghi.
- **Nguồn:** US1-NT41, PQ3.SALE

### US1-KB66 · Không có chỗ nào để hiện lại căn đã xóa `[Chính]`
- **Mục đích:** bản đầu không hiện lại căn đã xóa.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa, đã xóa căn 2105 (hoặc 3402 ở biến thể A).
- **Làm:**
  1. Xem tab Căn, kéo hết màn.
  2. Xem tab Cá nhân, kéo hết màn.
  3. Bấm "Thêm căn", xem form.
- **Mong đợi:**
  - Không có mục "Căn đã xóa", nút "Hiện lại", "Khôi phục" hay tương tự ở ba màn đó.
  - Căn đã xóa không có trong danh sách nào.
- **Nguồn:** US1-NT43

### US1-KB67 · Thêm lại căn cùng mã với căn đã xóa `[Chính]`
- **Mục đích:** mã căn đã ẩn không tính là trùng.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa, có thêm căn 2105 (không đặt phòng).
- **Làm:**
  1. Tab Căn, xóa căn 2105. Nếu app hỏi lại, xác nhận xóa.
  2. Bấm "Thêm căn". Ô "Mã căn (tên căn hộ) *" gõ 2105.
  3. Chọn chip 2 phòng ngủ.
  4. Bấm "Thêm căn".
- **Mong đợi:**
  - Không có lỗi "Đã có căn 2105".
  - Toast "Đã thêm phòng 2105". Thẻ 2105 có nhãn "Mới thêm", không có đặt phòng cũ nào của căn 2105 trước.
- **Nguồn:** US1-NT42

### US1-KB68 · Chủ nhà khác cùng mã căn vẫn thêm được `[Chính]`
- **Mục đích:** mã căn chỉ không trùng trong căn của cùng một chủ.
- **Chuẩn bị:** hai tài khoản Chị Hoa và Anh Tuấn. Anh Tuấn thêm căn mã 1801 (2PN) trước.
- **Làm:**
  1. Chị Hoa: tab Căn, bấm "Thêm căn". Gõ mã 1801, chọn chip 2 phòng ngủ.
  2. Bấm "Thêm căn".
  3. Chị Hoa: bấm "Thêm căn" lần nữa, gõ lại mã 1801, chọn 2 phòng ngủ, bấm "Thêm căn".
- **Mong đợi:**
  - Bước 2 thêm được, toast "Đã thêm phòng 1801", không báo trùng dù Anh Tuấn đã có căn 1801.
  - Bước 3 hiện lỗi "Đã có căn 1801" dưới ô mã căn, không thêm căn thứ hai.
- **Nguồn:** US1-NT16, US1-NT15

### US1-KB69 · Mất mạng khi xóa căn `[Mạng]`
- **Mục đích:** không tưởng đã xóa khi chưa xóa.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa, có thêm căn 2105 (không đặt phòng).
- **Làm:**
  1. Tab Căn, bấm xóa căn 2105. Nếu app hỏi lại, dừng ở bước hỏi lại.
  2. Bật chế độ máy bay.
  3. Xác nhận xóa (hoặc bấm xóa nếu app không hỏi lại).
  4. Tắt chế độ máy bay, chờ dải cảnh báo mất.
  5. Xem tab Căn.
- **Mong đợi:**
  - Bước 3 báo "Chưa lưu được, bấm lại khi có mạng".
  - Bước 5 thẻ 2105 vẫn ở tab Căn: app không tự gửi lại.
- **Nguồn:** HV2 bước 3, 4 (mục "Xóa căn" trạng thái lỗi mạng)

### US1-KB70 · Chủ nhà khác không có căn của Chị Hoa để xóa `[Quyền]`
- **Mục đích:** chủ nhà chỉ xóa được căn của mình.
- **Chuẩn bị:** vào app bằng tài khoản Anh Tuấn (Sapphire 1103, À La Carte 2208, DLM.3).
- **Làm:**
  1. Tab Căn, xem danh sách.
  2. Tab Lịch, xem hàng chip căn.
- **Mong đợi:**
  - Chỉ có Sapphire 1103 và À La Carte 2208. Không có 1509, 3402, nên không có chỗ nào để xóa căn của Chị Hoa.
- **Nguồn:** PQ3.CHU

### US1-KB71 · Sale không có nút xóa căn `[Quyền]`
- **Mục đích:** sale được chia sẻ căn chỉ xem, không xóa.
- **Chuẩn bị:** vào app bằng tài khoản Sale Hùng.
- **Làm:**
  1. Mở chi tiết căn ICON40 1509 từ lịch phòng.
  2. Xem hết màn.
- **Mong đợi:**
  - Không có nút xóa căn, ẩn căn hay sửa căn.
- **Nguồn:** PQ3.SALE
