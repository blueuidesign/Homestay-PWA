# Kịch bản kiểm tay US4 · Chủ nhà đặt giá theo tháng, ngày thường và cuối tuần

Story: `docs/stories/US4-gia-thang-gon.md`. Cách chạy và cách ghi kết quả: `tests/kich-ban/README.md`.

Dữ liệu: bộ mẫu ở `docs/luat-chung/Du_lieu_mau.md`, nạp vào staging bằng `supabase/staging/du_lieu_mau.sql`. Kịch bản ghi "nạp lại" thì chạy lại file đó trước.
Kịch bản viết cho bản Zalo, số liệu theo ngày 07/10/2026 của bộ mẫu. Bước nào nói tới cửa sổ hay quyền của Zalo thì làm theo `docs/luat-chung/PWA.md`. Kịch bản gắn `[Zalo]` chỉ chạy ở bản Zalo.

### US4-KB1 · Đặt giá Tháng 11 – 12 cho 3402 `[Chính]`
- **Mục đích:** chủ nhà đặt giá hai tháng một lần, ô tháng hiện khoảng giá mới.
- **Chuẩn bị:** dữ liệu thử vừa nạp lại.
- **Làm:**
  1. Tab Căn, chạm thẻ 3402.
  2. Chạm tab "Giá".
  3. Chạm ô "Tháng 11".
  4. Chạm ô "Tháng 12".
  5. Ô "Ngày thường (CN–T5)" nhập 800.000.
  6. Ô "Cuối tuần (T6, T7)" nhập 1.100.000.
  7. Bấm "Áp dụng cho Tháng 11 – 12".
- **Mong đợi:**
  - Bước 2: tiêu đề "Phòng 3402", mục "GIÁ THEO THÁNG", "Năm 2026", 12 ô tháng. Tháng 10 "800k–1,3tr"; Tháng 11, 12 "Chưa đặt".
  - Bước 4: dòng "Đang chọn: Tháng 11 – 12 (2 tháng)".
  - Bước 7: toast "✓ Đã áp dụng giá cho Tháng 11 – 12" ở đầu màn, tự tắt sau khoảng 3 giây.
  - Tháng 11 và Tháng 12 ghi "800k–1,1tr". Tháng 10 vẫn "800k–1,3tr".
- **Nguồn:** US4-NT3, HV8-NT2

### US4-KB2 · Lịch giá tháng 10 của 3402 tách hai loại đêm `[Chính]`
- **Mục đích:** đêm T6, T7 hiện giá cuối tuần, các đêm khác hiện giá ngày thường.
- **Chuẩn bị:** dữ liệu thử vừa nạp lại.
- **Làm:**
  1. Tab Căn, chạm thẻ 3402, chạm tab "Giá".
  2. Kéo xuống "Lịch giá tháng 10".
- **Mong đợi:**
  - 08/10 (T5) "800k"; 09/10 (T6) "1,1tr"; 10/10 (T7) "1,1tr"; 11/10 (CN) "800k".
  - 30/10 (T6), 31/10 (T7) "1,1tr"; 01/10 (T5) "800k".
  - 24/10, 25/10 "1,3tr" (dịp đặc biệt thay giá tháng).
  - Đánh dấu "Có khách" ở 05, 06, 14, 17, 18, 21/10. Có chú thích Dịp đặc biệt, Ngày lễ, Có khách.
- **Nguồn:** US4-NT6

### US4-KB3 · Lịch giá tháng 10 của 1509 `[Chính]`
- **Mục đích:** mỗi căn có giá riêng; lịch giá dùng đúng giá của căn.
- **Chuẩn bị:** dữ liệu thử vừa nạp lại.
- **Làm:**
  1. Tab Căn, chạm thẻ 1509, chạm tab "Giá".
  2. Xem ô Tháng 10 và "Lịch giá tháng 10".
- **Mong đợi:**
  - Ô Tháng 10 ghi "900k–1,3tr".
  - 09/10 (T6), 10/10 (T7) "1,3tr"; 08/10 (T5), 11/10 (CN) "900k".
  - "Có khách" ở 04, 05, 10, 11, 13, 14, 19/10.
- **Nguồn:** US4-NT6

### US4-KB4 · Lịch giá tháng 11, 12 sau khi áp dụng `[Biên]`
- **Mục đích:** giá vừa đặt áp đúng từng đêm, cả đầu và cuối tháng.
- **Chuẩn bị:** đã chạy xong KB1 (không nạp lại).
- **Làm:**
  1. Ở "Lịch giá tháng 10", bấm "T11".
  2. Bấm "T12".
- **Mong đợi:**
  - Tháng 11: 01/11 (CN) "800k"; 05/11 (T5) "800k"; 06/11 (T6) "1,1tr"; 07/11 (T7) "1,1tr"; 08/11 (CN) "800k"; 27/11 (T6), 28/11 (T7) "1,1tr"; 30/11 (T2) "800k".
  - Tháng 12: 01/12 (T3) "800k"; 25/12 (T6), 26/12 (T7) "1,1tr"; 31/12 (T5) "800k".
- **Nguồn:** US4-NT3, US4-NT6

### US4-KB5 · Căn chưa có giá `[Chính]`
- **Mục đích:** căn chưa đặt giá thì thẻ báo và tab Giá hiện màn hướng dẫn.
- **Chuẩn bị:** dữ liệu thử vừa nạp lại, đã thêm căn "2105" chưa có giá.
- **Làm:**
  1. Tab Căn, xem thẻ 2105.
  2. Bấm "Đặt giá cho căn này".
- **Mong đợi:**
  - Bước 1: thẻ ghi "Chưa đặt giá" và có nút "Đặt giá cho căn này"; không có dòng "Giá tuần này".
  - Bước 2: tab Giá của "Phòng 2105" có dòng "Căn này chưa có giá. Chọn tháng, nhập giá ngày thường và cuối tuần rồi bấm Áp dụng. Sale chỉ thấy giá sau khi bạn đặt."
  - Cả 12 ô Tháng 1 đến Tháng 12 ghi "Chưa đặt".
  - Mục giá ngày lễ ghi "Chưa có giá ngày lễ. Bấm "Đặt giá ngày lễ, dịp đặc biệt" để thêm, VD: Lễ 30/4 – 1/5."; mục dịp đặc biệt ghi "Chưa có dịp đặc biệt."
- **Nguồn:** US4-NT1, US4-NT5

### US4-KB6 · Bấm Áp dụng khi chưa chọn tháng `[Lỗi]`
- **Mục đích:** chưa chọn tháng thì báo và không lưu gì.
- **Chuẩn bị:** như KB5, đang ở tab Giá của 2105, chưa chạm ô tháng nào.
- **Làm:**
  1. Ô "Ngày thường (CN–T5)" nhập 800.000.
  2. Ô "Cuối tuần (T6, T7)" nhập 1.100.000.
  3. Bấm "Áp dụng cho tháng đã chọn".
- **Mong đợi:**
  - Dòng "Chưa chọn tháng nào. Chọn một tháng bên trên sau đó nhập giá."
  - Không có toast "Đã áp dụng giá". 12 ô tháng vẫn "Chưa đặt".
- **Nguồn:** US4-NT4

### US4-KB7 · Thẻ căn ghi giá tuần này `[Chính]`
- **Mục đích:** thẻ căn đã có giá ghi từ giá đêm thấp nhất tới cao nhất của tuần này.
- **Chuẩn bị:** dữ liệu thử vừa nạp lại.
- **Làm:**
  1. Mở tab Căn.
  2. Xem thẻ 1509 và thẻ 3402.
- **Mong đợi:**
  - 1509: "Giá tuần này 900.000đ – 1.300.000đ".
  - 3402: "Giá tuần này 800.000đ – 1.100.000đ".
  - Hai thẻ không có chữ "Chưa đặt giá".
- **Nguồn:** US4-NT2

### US4-KB8 · Đặt giá cho căn mới, thẻ đổi theo `[Chính]`
- **Mục đích:** căn vừa đặt giá thì thẻ hết "Chưa đặt giá" và ghi khoảng giá tuần này.
- **Chuẩn bị:** như KB5.
- **Làm:**
  1. Tab Căn, ở thẻ 2105 bấm "Đặt giá cho căn này".
  2. Chạm ô "Tháng 10".
  3. Nhập 800.000 vào "Ngày thường (CN–T5)", 1.100.000 vào "Cuối tuần (T6, T7)".
  4. Bấm nút Áp dụng.
  5. Quay lại tab Căn.
- **Mong đợi:**
  - Bước 4: có toast "Đã áp dụng giá cho …" kèm Tháng 10; ô Tháng 10 ghi "800k–1,1tr"; các tháng khác vẫn "Chưa đặt".
  - Bước 5: thẻ 2105 ghi "Giá tuần này 800.000đ – 1.100.000đ", không còn "Chưa đặt giá" và nút "Đặt giá cho căn này".
- **Nguồn:** US4-NT1, US4-NT2, US4-NT3

### US4-KB9 · Đổi sang năm 2027 `[Chính]`
- **Mục đích:** chọn năm sau thì 12 ô tháng là giá của năm sau, không lẫn năm nay.
- **Chuẩn bị:** dữ liệu thử vừa nạp lại.
- **Làm:**
  1. Tab Căn, chạm thẻ 3402, chạm tab "Giá".
  2. Bấm "Năm 2026".
  3. Chọn "Năm 2027 · Năm sau".
  4. Chạm ô "Tháng 1".
  5. Nhập 800.000 vào "Ngày thường (CN–T5)", 1.100.000 vào "Cuối tuần (T6, T7)".
  6. Bấm nút Áp dụng.
  7. Bấm "Năm 2027", chọn "Năm 2026 · Năm nay".
- **Mong đợi:**
  - Bước 2: hiện "Đặt giá cho năm" với "Năm 2026 · Năm nay" (đang chọn) và "Năm 2027 · Năm sau".
  - Bước 3: mục ghi "Năm 2027". 12 ô tháng ghi "Chưa đặt" (dữ liệu thử chưa có giá 2027). Không ô nào ghi "800k–1,3tr".
  - Bước 6: ô Tháng 1 của năm 2027 ghi "800k–1,1tr".
  - Bước 7: Tháng 1 năm 2026 ghi "Chưa đặt"; Tháng 10 năm 2026 ghi "800k–1,3tr".
- **Nguồn:** US4-NT7

### US4-KB10 · Chọn cả 12 tháng, lịch giá qua năm `[Biên]`
- **Mục đích:** áp một lần cho 12 tháng; lịch giá chuyển từ tháng 12 sang tháng 1 năm sau đúng giá.
- **Chuẩn bị:** chạy KB1 ngay trước, không nạp lại sau KB1.
- **Làm:**
  1. Tab Giá của 3402, bấm "Năm 2026", chọn "Năm 2027 · Năm sau".
  2. Chạm ô "Tháng 1", rồi chạm ô "Tháng 12".
  3. Nhập 800.000 vào "Ngày thường (CN–T5)", 1.100.000 vào "Cuối tuần (T6, T7)".
  4. Bấm nút Áp dụng.
  5. Chọn lại "Năm 2026 · Năm nay". Ở lịch giá, bấm "T11", rồi "T12".
  6. Bấm "T01".
- **Mong đợi:**
  - Bước 2: dòng "Đang chọn: Tháng 1 – 12 (12 tháng)".
  - Bước 4: cả 12 ô tháng năm 2027 ghi "800k–1,1tr".
  - Bước 6: lịch giá tháng 01/2027: 01/01 (T6) "1,1tr", 02/01 (T7) "1,1tr", 03/01 (CN) "800k".
- **Nguồn:** US4-NT3, US4-NT6, US4-NT7

### US4-KB11 · Giá quá giới hạn `[Biên]`
- **Mục đích:** giá đêm trên 1.000.000.000đ không được lưu.
- **Chuẩn bị:** dữ liệu thử vừa nạp lại.
- **Làm:**
  1. Tab Giá của 3402, chạm ô "Tháng 11".
  2. Nhập 1.000.000.001 vào "Ngày thường (CN–T5)", 1.100.000 vào "Cuối tuần (T6, T7)".
  3. Bấm nút Áp dụng.
- **Mong đợi:**
  - Không có toast "Đã áp dụng giá". Ô Tháng 11 vẫn "Chưa đặt". Không thấy mã lỗi kỹ thuật.
- **Nguồn:** HV2 bước 5

### US4-KB12 · Đang lưu `[Mạng]`
- **Mục đích:** đang lưu thì nút khóa, không áp dụng hai lần.
- **Chuẩn bị:** dữ liệu thử vừa nạp lại.
- **Làm:**
  1. Làm KB1 bước 1 đến 6.
  2. Bấm "Áp dụng cho Tháng 11 – 12" hai lần thật nhanh.
- **Mong đợi:**
  - Ngay sau lần bấm đầu, nút đổi chữ thành "Đang lưu…".
  - Chỉ một toast "✓ Đã áp dụng giá cho Tháng 11 – 12".
- **Nguồn:** HV1 bước 3

### US4-KB13 · Mất mạng khi bấm Áp dụng `[Mạng]`
- **Mục đích:** mất mạng thì báo chưa lưu, giữ tháng và giá đã nhập, có mạng lại không tự gửi.
- **Chuẩn bị:** dữ liệu thử vừa nạp lại.
- **Làm:**
  1. Làm KB1 bước 1 đến 6.
  2. Bật chế độ máy bay.
  3. Bấm "Áp dụng cho Tháng 11 – 12".
  4. Tắt chế độ máy bay, chờ 10 giây.
- **Mong đợi:**
  - Bước 3: báo "Chưa lưu được, bấm lại khi có mạng". Vẫn chọn Tháng 11 – 12, hai ô giá giữ 800.000 và 1.100.000.
  - Bước 4: không có toast "Đã áp dụng giá". Ô Tháng 11, 12 vẫn "Chưa đặt".
- **Nguồn:** HV2 bước 3, 4

### US4-KB14 · Mở tab Giá lần đầu khi mất mạng `[Mạng]`
- **Mục đích:** màn chưa tải được thì báo rõ và có nút thử lại.
- **Chuẩn bị:** dữ liệu thử vừa nạp lại. Máy này chưa từng mở tab Giá của 1509.
- **Làm:**
  1. Mở tab Căn.
  2. Bật chế độ máy bay.
  3. Chạm thẻ 1509, chạm tab "Giá".
  4. Tắt chế độ máy bay.
  5. Bấm "Thử lại".
- **Mong đợi:**
  - Bước 3: giữa màn "Chưa tải được. Kiểm tra mạng rồi bấm Thử lại", nút "Thử lại". Không có ô tháng trống giả.
  - Bước 5: hiện 12 ô tháng, Tháng 10 "900k–1,3tr".
- **Nguồn:** HV2 bước 2, HV1 bước 1

### US4-KB15 · Rời app khi đang nhập giá `[Mạng]`
- **Mục đích:** quay lại app thì tháng đã chọn và giá đã nhập còn nguyên.
- **Chuẩn bị:** dữ liệu thử vừa nạp lại.
- **Làm:**
  1. Làm KB1 bước 1 đến 6.
  2. Về màn hình chính của điện thoại, mở ứng dụng khác 5 phút.
  3. Quay lại Zalo, vào lại app.
- **Mong đợi:**
  - Vẫn ở tab Giá của "Phòng 3402", "Đang chọn: Tháng 11 – 12 (2 tháng)", hai ô giá 800.000 và 1.100.000.
- **Nguồn:** HV3 bước 1, 2

### US4-KB16 · Chủ nhà khác không đặt được giá căn của Chị Hoa `[Quyền]`
- **Mục đích:** chủ nhà chỉ thấy và đặt giá căn của mình.
- **Chuẩn bị:** vào app bằng tài khoản Anh Tuấn (Sapphire 1103, À La Carte 2208, DLM.3).
- **Làm:**
  1. Mở tab Căn.
  2. Xem danh sách thẻ căn.
- **Mong đợi:**
  - Chỉ có thẻ Sapphire 1103 và À La Carte 2208. Không có 1509, 3402.
  - Không có giá 800.000đ – 1.100.000đ hay 900.000đ – 1.300.000đ của căn Chị Hoa ở đâu trên màn.
- **Nguồn:** PQ5.CHU
