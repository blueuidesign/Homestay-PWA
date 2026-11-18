# Kịch bản kiểm tay US7 · Chủ nhà đặt giá nhiều căn và sao chép giá

Story: `docs/stories/US7-gia-day-du.md`. Cách chạy và cách ghi kết quả: `tests/kich-ban/README.md`.

Dữ liệu: bộ mẫu ở `docs/luat-chung/Du_lieu_mau.md`, nạp vào staging bằng `supabase/staging/du_lieu_mau.sql`. Kịch bản ghi "nạp lại" thì chạy lại file đó trước.
Kịch bản viết cho bản Zalo, số liệu theo ngày 07/10/2026 của bộ mẫu. Bước nào nói tới cửa sổ hay quyền của Zalo thì làm theo `docs/luat-chung/PWA.md`. Kịch bản gắn `[Zalo]` chỉ chạy ở bản Zalo.

### US7-KB1 · Chọn 2 trong 4 căn `[Chính]`
- **Mục đích:** dòng đếm và nút dưới đáy đổi theo số căn đã chọn.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa, có 4 căn.
- **Làm:**
  1. Tab Căn, bấm "Đặt giá nhiều căn".
  2. Chạm "Phòng 1509".
  3. Chạm "Phòng 3402".
- **Mong đợi:**
  - Dòng đếm ghi "CHỌN CĂN · ĐÃ CHỌN 2/4".
  - Nút dưới đáy ghi "Đặt giá cho 2 căn".
- **Nguồn:** YC3.6-NT1

### US7-KB2 · Chọn tất cả căn `[Chính]`
- **Mục đích:** "Chọn tất cả" chọn cả 4 căn.
- **Chuẩn bị:** như US7-KB1.
- **Làm:**
  1. Tab Căn, bấm "Đặt giá nhiều căn".
  2. Bấm "Chọn tất cả".
- **Mong đợi:**
  - Cả 4 căn 1509, 3402, Greenbay, 2208 có dấu chọn.
  - Dòng đếm ghi "ĐÃ CHỌN 4/4", nút ghi "Đặt giá cho 4 căn".
- **Nguồn:** YC3.6-NT2

### US7-KB3 · Chưa chọn căn nào `[Biên]`
- **Mục đích:** không đi tiếp được khi chưa chọn căn.
- **Chuẩn bị:** như US7-KB1.
- **Làm:**
  1. Tab Căn, bấm "Đặt giá nhiều căn".
  2. Bỏ chọn mọi căn đang có dấu chọn.
  3. Bấm nút dưới đáy.
- **Mong đợi:**
  - Dòng đếm ghi "Đã chọn 0/4".
  - Nút dưới đáy mờ, có dòng "Chọn ít nhất một căn" (CN6-05-00).
  - Bấm nút không mở màn nào.
- **Nguồn:** YC3.6 trạng thái rỗng (CN6-05-00)

### US7-KB4 · Đặt giá Tháng 11 – 12 cho 2 căn chưa có giá `[Chính]`
- **Mục đích:** mọi căn đã chọn nhận đúng giá, đêm T6, T7 tính giá cuối tuần.
- **Chuẩn bị:** như US7-KB1. Greenbay và 2208 ghi "Chưa đặt giá".
- **Làm:**
  1. Tab Căn, bấm "Đặt giá nhiều căn".
  2. Chọn "Greenbay" và "Phòng 2208", bấm "Đặt giá cho 2 căn".
  3. Chạm Tháng 11, rồi chạm Tháng 12.
  4. Ô "Ngày thường (CN–T5)" nhập 800.000.
  5. Ô "Cuối tuần (T6, T7)" nhập 1.100.000.
  6. Bấm "Áp dụng cho tháng đã chọn".
  7. Về tab Căn, chạm thẻ Greenbay, bấm tab "Giá".
  8. Ở lịch giá, bấm "T11" để sang tháng 11.
  9. Làm lại bước 7, 8 với 2208.
- **Mong đợi:**
  - Màn đặt giá ghi "Đặt giá · 2 căn", khối "CĂN ÁP DỤNG" có Greenbay và 2208.
  - Tab Giá của Greenbay và của 2208: Tháng 11 ghi "800k–1,1tr", Tháng 12 ghi "800k–1,1tr", Tháng 10 vẫn "Chưa đặt".
  - Lịch giá tháng 11 của cả hai căn: 05/11 (T5) 800k, 06/11 (T6) 1,1tr, 07/11 (T7) 1,1tr, 08/11 (CN) 800k.
  - Tab Giá của 1509 và 3402 không đổi: 1509 Tháng 11 vẫn "900k–1,3tr", 3402 Tháng 11 vẫn "800k–1,1tr".
- **Nguồn:** YC3.6-NT3, quy tắc Giá hai loại đêm (YC3), quy tắc Giá theo tháng và năm (YC3)

### US7-KB5 · Đổi giá tháng 10 của hai căn đã có đặt phòng `[Chính]`
- **Mục đích:** giá mới ghi đè giá tháng, đặt phòng đã có và doanh thu giữ nguyên, dịp vẫn thay giá tháng.
- **Chuẩn bị:** như US7-KB1. Ghi lại số ở CN1: doanh thu tháng 10 là 11.800.000đ.
- **Làm:**
  1. Tab Căn, bấm "Đặt giá nhiều căn".
  2. Chọn "Phòng 1509" và "Phòng 3402", bấm "Đặt giá cho 2 căn".
  3. Chạm Tháng 10.
  4. Nhập 1.000.000 ngày thường, 1.500.000 cuối tuần.
  5. Bấm "Áp dụng cho tháng đã chọn".
  6. Mở tab Giá của 1509, xem lịch giá tháng 10.
  7. Mở tab Giá của 3402, xem lịch giá tháng 10.
  8. Tab Lịch, chạm dòng "Sale Hùng · Phòng 1509 · 10/10 → 12/10" ở "Đặt phòng sắp tới".
  9. Quay lại tab Lịch, xem khối doanh thu.
- **Mong đợi:**
  - Lịch giá 1509: 08/10 (T5) 1tr, 09/10 (T6) 1,5tr, 16/10 (T6) 1,5tr, 22/10 (T5) 1tr.
  - Lịch giá 3402: 22/10 (T5) 1tr, 23/10 (T6) 1,5tr; 24/10 và 25/10 vẫn 1,3tr (giá dịp).
  - Chi tiết B1 vẫn ghi "Tiền phòng 2.200.000đ", "Còn lại 1.200.000đ".
  - Khối doanh thu vẫn "11.800.000đ", "13 đêm có khách".
- **Nguồn:** YC3.6-NT3, YC3.4-NT6, quy tắc Booking giữ giá riêng (YC3), quy tắc Giá dịp thay giá tháng (YC3)

### US7-KB6 · Chưa chọn tháng thì không áp dụng được `[Lỗi]`
- **Mục đích:** không lưu giá khi chưa chọn tháng nào.
- **Chuẩn bị:** như US7-KB1.
- **Làm:**
  1. Tab Căn, bấm "Đặt giá nhiều căn".
  2. Chọn Greenbay và 2208, bấm "Đặt giá cho 2 căn".
  3. Không chạm tháng nào. Nhập 800.000 và 1.100.000.
  4. Bấm nút áp dụng.
- **Mong đợi:**
  - Dòng ghi "Chưa chọn tháng nào. Chọn một tháng bên trên sau đó nhập giá."
  - Nút áp dụng không dùng được. Greenbay và 2208 vẫn ghi "Chưa đặt giá" ở tab Căn.
- **Nguồn:** YC3.6 bước 3 (đặt giá như YC3.4), YC3.4-NT2

### US7-KB7 · Đổi căn từ màn đặt giá `[Chính]`
- **Mục đích:** "Đổi căn" quay về danh sách căn, giữ các căn đã chọn.
- **Chuẩn bị:** như US7-KB1.
- **Làm:**
  1. Tab Căn, bấm "Đặt giá nhiều căn".
  2. Chọn 1509 và 3402, bấm "Đặt giá cho 2 căn".
  3. Bấm "Đổi căn".
  4. Chạm thêm "Greenbay".
  5. Bấm "Đặt giá cho 3 căn".
- **Mong đợi:**
  - Bước 3 mở màn chọn căn, 1509 và 3402 vẫn có dấu chọn, dòng đếm "2/4".
  - Bước 5 tiêu đề ghi "Đặt giá · 3 căn", khối "CĂN ÁP DỤNG" có 1509, 3402, Greenbay.
- **Nguồn:** YC3.6 bước 3 (CN6-06 nút "Đổi căn")

### US7-KB8 · Đặt giá năm sau cho nhiều căn `[Biên]`
- **Mục đích:** giá đặt cho năm 2027 không đè lên năm 2026.
- **Chuẩn bị:** như US7-KB1.
- **Làm:**
  1. Tab Căn, bấm "Đặt giá nhiều căn".
  2. Chọn Greenbay và 2208, bấm "Đặt giá cho 2 căn".
  3. Bấm "Năm 2026", chọn "Năm 2027 · Năm sau".
  4. Chạm Tháng 1. Nhập 700.000 ngày thường, 1.000.000 cuối tuần.
  5. Bấm "Áp dụng cho tháng đã chọn".
  6. Mở tab Giá của Greenbay, chuyển sang "Năm 2027", rồi về "Năm 2026".
- **Mong đợi:**
  - Năm 2027: Tháng 1 ghi "700k–1tr", các tháng khác "Chưa đặt".
  - Năm 2026: Tháng 1 vẫn "Chưa đặt".
  - 2208 giống Greenbay.
- **Nguồn:** YC3.6 bước 3, quy tắc Giá theo tháng và năm (YC3), YC3.4-NT5

### US7-KB9 · Mất mạng khi bấm áp dụng `[Mạng]`
- **Mục đích:** không bao giờ tưởng đã lưu giá khi chưa lưu.
- **Chuẩn bị:** như US7-KB1.
- **Làm:**
  1. Mở màn đặt giá cho Greenbay và 2208, chọn Tháng 11, nhập 800.000 và 1.100.000.
  2. Bật chế độ máy bay.
  3. Bấm "Áp dụng cho tháng đã chọn".
  4. Tắt chế độ máy bay, chờ dải cảnh báo mất.
  5. Mở tab Giá của Greenbay.
- **Mong đợi:**
  - Bước 3 báo "Chưa lưu được, bấm lại khi có mạng". Tháng đã chọn và hai số giá vẫn còn trên form.
  - Bước 5 Tháng 11 vẫn "Chưa đặt": app không tự gửi lại.
- **Nguồn:** HV2 bước 3, 4 (YC3.6 trạng thái lỗi mạng)

### US7-KB10 · Đang lưu không bấm lại được `[Mạng]`
- **Mục đích:** bấm áp dụng hai lần không ghi hai lần.
- **Chuẩn bị:** như US7-KB1. Dùng mạng chậm (ví dụ 3G) cho dễ thấy.
- **Làm:**
  1. Mở màn đặt giá cho Greenbay và 2208, chọn Tháng 11, nhập 800.000 và 1.100.000.
  2. Bấm "Áp dụng cho tháng đã chọn" rồi bấm ngay lần nữa.
- **Mong đợi:**
  - Nút đổi chữ thành "Đang lưu…" và không bấm được tới khi xong.
  - Sau khi xong, Tháng 11 của hai căn ghi "800k–1,1tr".
- **Nguồn:** HV1 bước 3 (YC3.6 trạng thái đang tải)

### US7-KB11 · Rời app khi đang nhập giá nhiều căn `[Mạng]`
- **Mục đích:** gọi điện xong quay lại vẫn còn đủ thứ đang nhập.
- **Chuẩn bị:** như US7-KB1.
- **Làm:**
  1. Mở màn đặt giá cho Greenbay và 2208, chọn Tháng 11 và Tháng 12, nhập 800.000 và 1.100.000.
  2. Về màn hình chính của điện thoại, mở ứng dụng Điện thoại, chờ 1 phút.
  3. Mở lại Zalo.
- **Mong đợi:**
  - Vẫn ở màn "Đặt giá · 2 căn", còn đủ 2 căn, 2 tháng đã chọn và 2 số giá.
- **Nguồn:** HV3 bước 1, 2 (YC3.6 trạng thái quay lại từ nền)

### US7-KB12 · Chủ nhà khác không thấy căn của Chị Hoa `[Quyền]`
- **Mục đích:** chủ nhà chỉ đặt giá và chép giá cho căn của mình.
- **Chuẩn bị:** vào app bằng tài khoản Anh Tuấn (Sapphire 1103, À La Carte 2208).
- **Làm:**
  1. Tab Căn, bấm "Đặt giá nhiều căn".
  2. Quay lại, chạm thẻ Sapphire 1103, bấm tab "Giá".
  3. Bấm "Sao chép giá sang căn khác".
- **Mong đợi:**
  - Bước 1 danh sách chỉ có Sapphire 1103 và À La Carte 2208, dòng đếm ghi "/2". Không có 1509, 3402.
  - Bước 3 mục "SANG CĂN" chỉ có À La Carte 2208.
- **Nguồn:** PQ5.CHU, PQ3.CHU

### US7-KB13 · Mở sao chép giá, chưa chọn căn đích `[Biên]`
- **Mục đích:** chưa chọn căn đích thì không sao chép được.
- **Chuẩn bị:** như US7-KB1.
- **Làm:**
  1. Tab Căn, chạm thẻ 3402, bấm tab "Giá".
  2. Kéo xuống cuối, bấm "Sao chép giá sang căn khác".
  3. Không chọn căn nào. Bấm nút dưới đáy.
- **Mong đợi:**
  - Mục "TỪ CĂN" ghi "Phòng 3402" và "Giá 7 tháng".
  - Mục "SAO CHÉP GÌ" có "Giá theo tháng", "Giá ngày lễ", "Dịp đặc biệt".
  - Mục "SANG CĂN" ghi "ĐÃ CHỌN 0", có 1509, Greenbay, 2208, không có 3402.
  - Có dòng "Giá đang có của căn được chọn sẽ được thay bằng giá của Phòng 3402."
  - Nút ghi "Chọn căn để sao chép", mờ, bấm không có gì xảy ra.
- **Nguồn:** YC3.7-NT1, YC3.7 bước 1 đến 4

### US7-KB14 · Chỉ chép giá theo tháng `[Chính]`
- **Mục đích:** chép giá tháng không đụng giá ngày lễ và dịp đặc biệt của căn đích.
- **Chuẩn bị:** như US7-KB1. Trước khi chạy, Chị Hoa đặt cho 1509 một dịp đặc biệt 28/10 – 29/10, giá 1.500.000đ, tên "Dịp thử", tắt "Là ngày lễ". 1509 chưa có giá ngày lễ.
- **Làm:**
  1. Mở tab Giá của 3402, bấm "Sao chép giá sang căn khác".
  2. Ở "SAO CHÉP GÌ", chỉ để chọn "Giá theo tháng"; bỏ "Giá ngày lễ" và "Dịp đặc biệt".
  3. Ở "SANG CĂN", chọn "Phòng 1509".
  4. Bấm nút sao chép.
  5. Mở tab Giá của 1509, xem lịch giá tháng 10.
  6. Tab Lịch, mở chi tiết B1 ở "Đặt phòng sắp tới".
- **Mong đợi:**
  - Lịch giá 1509: 22/10 (T5) 800k, 23/10 (T6) 1,1tr, 24/10 (T7) 1,1tr (không lấy dịp 24/10 – 25/10 của 3402), 28/10 và 29/10 vẫn 1,5tr.
  - Mục "DỊP ĐẶC BIỆT" của 1509 vẫn chỉ có "Dịp thử" 28/10 – 29/10 1.500.000đ.
  - Mục giá ngày lễ của 1509 vẫn trống.
  - B1 vẫn "Tiền phòng 2.200.000đ".
- **Nguồn:** YC3.7-NT2, quy tắc Sao chép giá thay giá có sẵn (YC3), quy tắc Booking giữ giá riêng (YC3)

### US7-KB15 · Chép giá sang 2 căn `[Chính]`
- **Mục đích:** chép xong có toast đúng số căn, hai căn đích nhận giá.
- **Chuẩn bị:** như US7-KB1.
- **Làm:**
  1. Mở tab Giá của 3402, bấm "Sao chép giá sang căn khác".
  2. Để chọn cả ba: "Giá theo tháng", "Giá ngày lễ", "Dịp đặc biệt".
  3. Chọn "Greenbay" và "Phòng 2208".
  4. Bấm nút sao chép.
  5. Không chạm gì, đếm 3 giây.
  6. Mở tab Giá của Greenbay.
- **Mong đợi:**
  - Về tab Giá của 3402, toast "Đã sao chép giá sang 2 căn" ở đầu màn, ngay dưới thanh tiêu đề.
  - Toast tự tắt sau khoảng 3 giây.
  - Greenbay: Tháng 10 "800k–1,3tr", Tháng 11 và Tháng 12 "800k–1,1tr". Mục "DỊP ĐẶC BIỆT" có 24/10 – 25/10 1.300.000đ. Lịch giá 24/10 là 1,3tr.
  - 2208 giống Greenbay.
- **Nguồn:** YC3.7-NT3, YC3.7 bước 5, HV8-NT2

### US7-KB16 · Chọn tất cả căn đích `[Chính]`
- **Mục đích:** "Chọn tất cả" ở mục "SANG CĂN" chọn mọi căn trừ căn nguồn.
- **Chuẩn bị:** như US7-KB1.
- **Làm:**
  1. Mở tab Giá của 3402, bấm "Sao chép giá sang căn khác".
  2. Ở "SANG CĂN", bấm "Chọn tất cả".
- **Mong đợi:**
  - 1509, Greenbay, 2208 có dấu chọn. Dòng ghi "ĐÃ CHỌN 3".
  - Nút sao chép sáng, bấm được.
- **Nguồn:** YC3.7 bước 3

### US7-KB17 · Đổi giá tháng 10 của riêng 1509, đặt phòng đã có giữ tiền `[Chính]`
- **Mục đích:** đổi giá tháng của một căn không đổi tiền đặt phòng đã có và doanh thu.
- **Chuẩn bị:** như US7-KB1. Ghi lại số ở CN1: doanh thu tháng 10 là 11.800.000đ.
- **Làm:**
  1. Tab Căn, chạm thẻ 1509, bấm tab "Giá".
  2. Chạm ô "Tháng 10".
  3. Nhập 1.000.000 ngày thường, 1.500.000 cuối tuần.
  4. Bấm "Áp dụng cho Tháng 10".
  5. Xem "Lịch giá tháng 10".
  6. Tab Lịch, chạm dòng "Sale Hùng · Phòng 1509 · 10/10 → 12/10" ở "Đặt phòng sắp tới".
  7. Quay lại tab Lịch, xem khối doanh thu.
- **Mong đợi:**
  - Lịch giá 1509: 08/10 (T5) 1tr, 09/10 (T6) 1,5tr, 10/10 (T7) 1,5tr, 11/10 (CN) 1tr.
  - Chi tiết B1 vẫn ghi "Tiền phòng 2.200.000đ", "Còn lại 1.200.000đ".
  - Khối doanh thu vẫn "11.800.000đ".
- **Nguồn:** YC3.4-NT6, quy tắc Booking giữ giá riêng (YC3)

### US7-KB18 · Sale không có chỗ đặt giá hay sao chép giá `[Quyền]`
- **Mục đích:** chỉ người giữ căn đặt được giá.
- **Chuẩn bị:** vào app bằng tài khoản Sale Hùng.
- **Làm:**
  1. Mở chi tiết căn ICON40 1509 từ lịch phòng.
  2. Xem hết màn, kể cả phần cuối.
- **Mong đợi:**
  - Không có nút "Đặt giá nhiều căn", "Sao chép giá sang căn khác", "Áp dụng cho tháng đã chọn".
  - Không có ô nhập giá ngày thường, giá cuối tuần.
- **Nguồn:** PQ5.SALE, PQ3.SALE

### US7-KB19 · Mất mạng khi bấm sao chép giá `[Mạng]`
- **Mục đích:** không bao giờ tưởng đã sao chép khi chưa sao chép.
- **Chuẩn bị:** như US7-KB1.
- **Làm:**
  1. Mở tab Giá của 3402, bấm "Sao chép giá sang căn khác".
  2. Ở "SANG CĂN", chọn "Greenbay" và "Phòng 2208".
  3. Bật chế độ máy bay.
  4. Bấm nút sao chép.
  5. Tắt chế độ máy bay, chờ dải cảnh báo mất.
  6. Mở tab Giá của Greenbay.
- **Mong đợi:**
  - Bước 4 báo "Chưa lưu được, bấm lại khi có mạng". Vẫn ở màn sao chép, hai căn đích còn dấu chọn. Không có toast "Đã sao chép giá sang 2 căn".
  - Bước 6 Tháng 11 vẫn "Chưa đặt": app không tự gửi lại.
- **Nguồn:** HV2 bước 3, 4 (YC3.7 trạng thái lỗi mạng)

### US7-KB20 · Rời app khi đang chọn sao chép giá `[Mạng]`
- **Mục đích:** gọi điện xong quay lại vẫn còn lựa chọn đang làm.
- **Chuẩn bị:** như US7-KB1.
- **Làm:**
  1. Mở tab Giá của 3402, bấm "Sao chép giá sang căn khác".
  2. Chỉ để chọn "Giá theo tháng". Ở "SANG CĂN", chọn "Greenbay".
  3. Về màn hình chính của điện thoại, mở ứng dụng khác, chờ 1 phút.
  4. Mở lại Zalo.
- **Mong đợi:**
  - Vẫn ở màn sao chép, "TỪ CĂN" ghi "Phòng 3402".
  - Chỉ "Giá theo tháng" được chọn. "SANG CĂN" ghi "ĐÃ CHỌN 1", Greenbay có dấu chọn.
- **Nguồn:** HV3 bước 1, 2 (YC3.7 trạng thái quay lại từ nền)
