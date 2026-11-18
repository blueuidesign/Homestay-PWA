# Kịch bản kiểm tay US8 · Chủ nhà đặt giá ngày lễ và dịp đặc biệt

Story: `docs/stories/US8-gia-ngay-le.md`. Cách chạy và cách ghi kết quả: `tests/kich-ban/README.md`.

Dữ liệu: bộ mẫu ở `docs/luat-chung/Du_lieu_mau.md`, nạp vào staging bằng `supabase/staging/du_lieu_mau.sql`. Kịch bản ghi "nạp lại" thì chạy lại file đó trước.
Kịch bản viết cho bản Zalo, số liệu theo ngày 07/10/2026 của bộ mẫu. Bước nào nói tới cửa sổ hay quyền của Zalo thì làm theo `docs/luat-chung/PWA.md`. Kịch bản gắn `[Zalo]` chỉ chạy ở bản Zalo.

### US8-KB1 · Mở màn giá ngày lễ từ tab Giá `[Chính]`
- **Mục đích:** chủ nhà thấy đủ lựa chọn chọn nhanh ngày lễ.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa.
- **Làm:**
  1. Tab Căn, chạm thẻ 3402, bấm tab "Giá".
  2. Bấm "Đặt giá ngày lễ, dịp đặc biệt".
- **Mong đợi:**
  - Tiêu đề "Giá ngày lễ, dịp đặc biệt", dòng "Phòng 3402".
  - Hàng "Chọn nhanh ngày lễ" có: Lễ 30/4 – 1/5, Quốc khánh 2/9, Tết Dương lịch, Tết Âm lịch.
  - Có ghi chú "Home247 đặt sẵn dải ngày nghỉ của từng dịp mỗi năm, gồm nghỉ bù và nối cuối tuần. Chọn xong vẫn sửa được ngày."
  - Có ô "Giá mỗi đêm (đ)", công tắc "Là ngày lễ (hiện trong mục Giá ngày lễ)", nút "Lưu giá".
- **Nguồn:** YC3.5 bước 1

### US8-KB2 · Mở màn giá ngày lễ bằng cách chạm lịch giá `[Chính]`
- **Mục đích:** chạm một ngày trên lịch giá cũng mở được màn này.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa.
- **Làm:**
  1. Tab Căn, chạm thẻ 1509, bấm tab "Giá".
  2. Ở "Lịch giá tháng 10", chạm ngày 28.
- **Mong đợi:**
  - Mở màn "Giá ngày lễ, dịp đặc biệt" của Phòng 1509.
- **Nguồn:** YC3.5 Khi nào xảy ra, YC3.4 bước 7

### US8-KB3 · Chọn nhanh Lễ 30/4 – 1/5 `[Chính]`
- **Mục đích:** chạm dịp lễ thì ngày điền sẵn theo dải Home247 đặt.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa, năm đang chọn là 2026.
- **Làm:**
  1. Mở màn "Giá ngày lễ, dịp đặc biệt" của 1509.
  2. Chạm "Lễ 30/4 – 1/5".
- **Mong đợi:**
  - "Từ ngày" là 30/04, "Đến ngày" là 03/05, tên dịp "Lễ 30/4 – 1/5".
  - Dòng "4 ngày · T5 30/4 → CN 3/5".
  - Lưới tuần từ T2 27/4 đến CN 3/5, bốn ngày 30/4 đến 3/5 được tô. T7, CN có màu riêng.
- **Nguồn:** YC3.5-NT1, YC3.5 bước 2, 3, quy tắc Dải ngày lễ do Home247 đặt (YC3)

### US8-KB4 · Nới dải ngày lễ trên lưới tuần `[Chính]`
- **Mục đích:** chủ nhà sửa được dải đã điền sẵn.
- **Chuẩn bị:** như US8-KB3.
- **Làm:**
  1. Mở màn của 1509, chạm "Lễ 30/4 – 1/5".
  2. Trên lưới tuần, chạm ô T4 29/4.
- **Mong đợi:**
  - Dải thành 29/4 → 3/5, dòng ghi "5 ngày · T4 29/4 → CN 3/5".
  - Ô 29/4 được tô.
- **Nguồn:** YC3.5 bước 3, quy tắc Dải ngày lễ do Home247 đặt (YC3)

### US8-KB5 · Dải 13 ngày bị chặn `[Lỗi]`
- **Mục đích:** dải dài hơn 10 ngày có cảnh báo và không lưu được.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa.
- **Làm:**
  1. Mở màn "Giá ngày lễ, dịp đặc biệt" của 3402.
  2. Chọn "Từ ngày" 24/12/2026.
  3. Chọn "Đến ngày" 05/01/2027.
  4. Nhập giá 1.500.000.
  5. Bấm "Lưu giá".
- **Mong đợi:**
  - Dòng "13 ngày · T5 24/12 → T3 5/1".
  - Cảnh báo "Tối đa 10 ngày. Đang chọn 13 ngày, hãy rút ngắn ngày kết thúc."
  - Bấm "Lưu giá" không lưu: tab Giá của 3402 không có dải 24/12 – 05/01.
- **Nguồn:** YC3.5-NT2, YC3.5 bước 6, quy tắc Dải ngày lễ do Home247 đặt (YC3): 13 ngày là quá

### US8-KB6 · Dải đúng 10 ngày lưu được, 11 ngày thì không `[Biên]`
- **Mục đích:** mốc 10 ngày tính đúng.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa.
- **Làm:**
  1. Mở màn của 3402. Chọn từ 24/12/2026 đến 03/01/2027.
  2. Xem dòng đếm ngày.
  3. Đổi "Đến ngày" thành 02/01/2027.
  4. Nhập tên "Noel và Tết", giá 1.500.000, tắt "Là ngày lễ".
  5. Bấm "Lưu giá".
- **Mong đợi:**
  - Bước 2: "11 ngày", có cảnh báo "Tối đa 10 ngày. Đang chọn 11 ngày, hãy rút ngắn ngày kết thúc."
  - Bước 3: "10 ngày", không còn cảnh báo.
  - Bước 5: lưu được. Mục "DỊP ĐẶC BIỆT" của 3402 có "24/12 – 02/01 Noel và Tết 1.500.000đ".
- **Nguồn:** YC3.5-NT2, quy tắc Dải ngày lễ do Home247 đặt (YC3): một dải tối đa 10 ngày

### US8-KB7 · Lưu dịp đặc biệt 24/10 – 25/10 `[Chính]`
- **Mục đích:** dịp đặc biệt vào đúng mục và thay giá tháng trên lịch giá.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa. 1509 chưa có dịp nào.
- **Làm:**
  1. Mở màn "Giá ngày lễ, dịp đặc biệt" của 1509.
  2. Chọn từ 24/10 đến 25/10.
  3. Nhập tên "Lễ hội Carnaval", giá 1.300.000.
  4. Để tắt "Là ngày lễ".
  5. Bấm "Lưu giá".
  6. Ở tab Giá của 1509, xem "Lịch giá tháng 10".
- **Mong đợi:**
  - Mục "DỊP ĐẶC BIỆT" có "24/10 – 25/10 Lễ hội Carnaval 1.300.000đ". Mục "GIÁ NGÀY LỄ" không có dải này.
  - Lịch giá: 24/10 (T7) 1,3tr, 25/10 (CN) 1,3tr (trước đó 900k), 26/10 (T2) vẫn 900k, 22/10 (T5) vẫn 900k.
- **Nguồn:** YC3.5-NT3, quy tắc Giá dịp thay giá tháng (YC3), quy tắc Ngày lễ khác dịp đặc biệt (YC3)

### US8-KB8 · Lưu dải là ngày lễ `[Chính]`
- **Mục đích:** bật "Là ngày lễ" thì dải vào mục "GIÁ NGÀY LỄ".
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa. 1509 chưa có giá ngày lễ.
- **Làm:**
  1. Mở màn "Giá ngày lễ, dịp đặc biệt" của 1509.
  2. Chạm "Quốc khánh 2/9".
  3. Nhập giá 2.500.000.
  4. Bật "Là ngày lễ (hiện trong mục Giá ngày lễ)".
  5. Bấm "Lưu giá".
- **Mong đợi:**
  - Mục "GIÁ NGÀY LỄ" của 1509 có dải Quốc khánh 2/9 với giá 2.500.000đ.
  - Mục "DỊP ĐẶC BIỆT" không có dải này.
- **Nguồn:** YC3.5-NT4, quy tắc Ngày lễ khác dịp đặc biệt (YC3)

### US8-KB9 · Bỏ trống tên dịp `[Biên]`
- **Mục đích:** app tự đặt tên theo ngày khi chủ nhà không gõ tên.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa. 1509 chưa có dịp nào (nạp lại nếu đã chạy US8-KB7).
- **Làm:**
  1. Mở màn "Giá ngày lễ, dịp đặc biệt" của 1509.
  2. Chọn từ 24/10 đến 25/10.
  3. Để trống ô tên. Nhập giá 1.300.000. Để tắt "Là ngày lễ".
  4. Xem ô tên.
  5. Bấm "Lưu giá".
- **Mong đợi:**
  - Ô tên ghi "Tên (không bắt buộc)", gợi ý "Dịp đặc biệt 24/10 – 25/10", dòng "Bỏ trống thì app đặt tên theo ngày: "Dịp đặc biệt 24/10 – 25/10"."
  - Sau khi lưu, mục "DỊP ĐẶC BIỆT" có "Dịp đặc biệt 24/10 – 25/10" giá 1.300.000đ.
- **Nguồn:** YC3.5-NT5, quy tắc Tên dịp tự đặt (YC3), CN6-03-01. Nút lưu theo YC3.5 bước 7 là "Lưu giá"; canvas CN6-03-01 vẽ "Lưu giá dịp"

### US8-KB10 · Dải chồng ngày với dịp đã có bị chặn `[Lỗi]`
- **Mục đích:** hai dải của cùng căn không có ngày chung.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa. 3402 có dịp 24/10 – 25/10 giá 1.300.000đ (DLM.3).
- **Làm:**
  1. Mở màn "Giá ngày lễ, dịp đặc biệt" của 3402.
  2. Chọn từ 25/10 đến 26/10.
  3. Nhập giá 1.500.000. Để tắt "Là ngày lễ".
  4. Bấm "Lưu giá".
  5. Quay về tab Giá của 3402.
- **Mong đợi:**
  - App báo lỗi chồng ngày, có nêu tên và ngày của dải đã có (24/10 – 25/10). Chữ chính xác chưa vẽ.
  - Mục "DỊP ĐẶC BIỆT" vẫn chỉ có dịp 24/10 – 25/10 1.300.000đ.
  - Lịch giá 3402: 25/10 vẫn 1,3tr, 26/10 (T2) vẫn 800k.
- **Nguồn:** YC3.5-NT6, YC3.5 bước 8, quy tắc Giá dịp không chồng ngày (YC3): 24/10 – 25/10 và 25/10 – 26/10 chồng ngày 25/10

### US8-KB11 · Hai dải liền nhau lưu được `[Biên]`
- **Mục đích:** dải bắt đầu ngay sau dải cũ không bị coi là chồng.
- **Chuẩn bị:** như US8-KB10.
- **Làm:**
  1. Mở màn "Giá ngày lễ, dịp đặc biệt" của 3402.
  2. Chọn từ 26/10 đến 27/10.
  3. Nhập giá 1.200.000. Để tắt "Là ngày lễ".
  4. Bấm "Lưu giá".
  5. Ở tab Giá của 3402, xem lịch giá tháng 10.
- **Mong đợi:**
  - Lưu được, không báo lỗi.
  - Mục "DỊP ĐẶC BIỆT" có hai dải: 24/10 – 25/10 1.300.000đ và 26/10 – 27/10 1.200.000đ.
  - Lịch giá: 25/10 1,3tr, 26/10 1,2tr, 27/10 1,2tr, 28/10 (T4) 800k.
- **Nguồn:** YC3.5-NT8, quy tắc Giá dịp không chồng ngày (YC3)

### US8-KB12 · Đặt phòng mới lấy giá dịp làm tiền điền sẵn `[Chính]`
- **Mục đích:** đêm trong dịp dùng giá dịp, không dùng giá tháng.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa. Đã chạy US8-KB7 (1509 có dịp 24/10 – 25/10 giá 1.300.000đ).
- **Làm:**
  1. Tab Lịch, bấm "+ Đặt phòng".
  2. Chọn phòng 1509, ngày nhận 25/10, chọn "1 đêm".
  3. Xem ô "Tiền phòng (đ)".
  4. Bấm quay lại, không lưu.
- **Mong đợi:**
  - Ô tiền phòng điền sẵn 1.300.000, dòng tách theo đêm "25/10: 1.300.000đ" (không phải 900.000đ).
- **Nguồn:** quy tắc Giá dịp thay giá tháng (YC3), QT4.1

### US8-KB13 · Đặt phòng đã có giữ tiền khi thêm dịp `[Chính]`
- **Mục đích:** thêm giá dịp lên đêm đã có khách không đổi tiền đặt phòng và doanh thu.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa. Ở tab Lịch ghi lại: doanh thu tháng 10 là 11.800.000đ; B2 Sale Lan 3402 17/10 → 19/10 là 1.900.000đ.
- **Làm:**
  1. Mở màn "Giá ngày lễ, dịp đặc biệt" của 3402.
  2. Chọn từ 17/10 đến 18/10, tên "Dịp thử", giá 2.000.000, tắt "Là ngày lễ".
  3. Bấm "Lưu giá".
  4. Tab Lịch, chạm dòng "Sale Lan · Phòng 3402 · 17/10 → 19/10".
  5. Quay lại tab Lịch, xem khối doanh thu.
- **Mong đợi:**
  - Lưu được. Mục "DỊP ĐẶC BIỆT" của 3402 có "Dịp thử" 17/10 – 18/10 2.000.000đ.
  - Chi tiết B2 vẫn "Tiền phòng 1.900.000đ".
  - Khối doanh thu vẫn "11.800.000đ".
- **Nguồn:** quy tắc Booking giữ giá riêng (YC3), YC3.4-NT6

### US8-KB14 · Sửa dải lễ không đổi dải chung của Home247 `[Quyền]`
- **Mục đích:** chủ nhà sửa dải chỉ áp cho giá của mình.
- **Chuẩn bị:** hai máy: máy 1 tài khoản Chị Hoa, máy 2 tài khoản Anh Tuấn.
- **Làm:**
  1. Máy 1: mở màn của 1509, chạm "Lễ 30/4 – 1/5", chạm ô T4 29/4.
  2. Máy 1: nhập giá 2.500.000, bật "Là ngày lễ", bấm "Lưu giá".
  3. Máy 2: tab Căn, chạm Sapphire 1103, tab "Giá", bấm "Đặt giá ngày lễ, dịp đặc biệt".
  4. Máy 2: chạm "Lễ 30/4 – 1/5".
- **Mong đợi:**
  - Máy 1: mục "GIÁ NGÀY LỄ" của 1509 có dải 29/04 – 03/05.
  - Máy 2: dải điền sẵn vẫn là 30/4 → 3/5, dòng "4 ngày · T5 30/4 → CN 3/5".
- **Nguồn:** PQ21.CHU, PQ5.CHU

### US8-KB15 · Mất mạng khi lưu giá dịp `[Mạng]`
- **Mục đích:** không tưởng đã lưu khi chưa lưu.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa. 1509 chưa có dịp.
- **Làm:**
  1. Mở màn của 1509, chọn 24/10 đến 25/10, giá 1.300.000.
  2. Bật chế độ máy bay.
  3. Bấm "Lưu giá".
  4. Tắt chế độ máy bay, chờ dải cảnh báo mất.
  5. Mở tab Giá của 1509.
- **Mong đợi:**
  - Bước 3 báo "Chưa lưu được, bấm lại khi có mạng". Ngày và giá vẫn còn trên form.
  - Bước 5 mục "DỊP ĐẶC BIỆT" vẫn trống: app không tự gửi lại.
- **Nguồn:** HV2 bước 3, 4 (YC3.5 trạng thái lỗi mạng)

### US8-KB16 · Rời app khi đang nhập giá dịp `[Mạng]`
- **Mục đích:** quay lại từ nền vẫn còn đủ thứ đang nhập.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa.
- **Làm:**
  1. Mở màn của 1509, chọn 24/10 đến 25/10, gõ tên "Lễ hội Carnaval", giá 1.300.000.
  2. Về màn hình chính của điện thoại, mở ứng dụng khác, chờ 1 phút.
  3. Mở lại Zalo.
- **Mong đợi:**
  - Vẫn ở màn "Giá ngày lễ, dịp đặc biệt" của 1509, còn đủ ngày, tên và giá.
- **Nguồn:** HV3 bước 1, 2 (YC3.5 trạng thái quay lại từ nền)

### US8-KB17 · Dải ngày lễ chồng một dịp đặc biệt đã có cũng bị chặn `[Lỗi]`
- **Mục đích:** chồng ngày bị chặn dù một dải là ngày lễ và dải kia là dịp đặc biệt.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa. 3402 có dịp 24/10 – 25/10 giá 1.300.000đ (DLM.3).
- **Làm:**
  1. Mở màn "Giá ngày lễ, dịp đặc biệt" của 3402.
  2. Chọn từ 25/10 đến 26/10.
  3. Nhập giá 2.000.000. Bật "Là ngày lễ (hiện trong mục Giá ngày lễ)".
  4. Bấm "Lưu giá".
  5. Quay về tab Giá của 3402.
- **Mong đợi:**
  - App báo lỗi chồng ngày, có nêu tên và ngày của dải đã có ("Dịp đặc biệt 24/10 – 25/10"). Chữ chính xác chưa vẽ.
  - Mục "GIÁ NGÀY LỄ" không có dải mới. Mục "DỊP ĐẶC BIỆT" vẫn chỉ có 24/10 – 25/10 1.300.000đ.
- **Nguồn:** YC3.5 bước 8, quy tắc Giá dịp không chồng ngày (YC3): dải ngày lễ hoặc dịp đặc biệt

### US8-KB18 · Bấm "Lưu giá" hai lần liền `[Mạng]`
- **Mục đích:** đang lưu thì nút khóa, chỉ một dải được ghi.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa. 1509 chưa có dịp. Dùng mạng chậm cho dễ thấy.
- **Làm:**
  1. Mở màn "Giá ngày lễ, dịp đặc biệt" của 1509.
  2. Chọn từ 24/10 đến 25/10, tên "Lễ hội Carnaval", giá 1.300.000, tắt "Là ngày lễ".
  3. Bấm "Lưu giá" rồi bấm ngay lần nữa.
  4. Mở tab Giá của 1509.
- **Mong đợi:**
  - Nút đổi chữ thành "Đang lưu…" và không bấm được tới khi xong.
  - Mục "DỊP ĐẶC BIỆT" có đúng một dải "24/10 – 25/10 Lễ hội Carnaval 1.300.000đ", không báo lỗi chồng ngày.
- **Nguồn:** HV1 bước 3 (YC3.5 trạng thái đang tải), YC3.5 bước 7

### US8-KB19 · Chủ nhà khác không thấy dịp của Chị Hoa `[Quyền]`
- **Mục đích:** giá dịp chỉ của người giữ căn.
- **Chuẩn bị:** vào app bằng tài khoản Anh Tuấn.
- **Làm:**
  1. Tab Căn, chạm thẻ Sapphire 1103, bấm tab "Giá".
  2. Xem mục "DỊP ĐẶC BIỆT" và "Lịch giá tháng 10", chạm sang ngày 24/10.
- **Mong đợi:**
  - Không có dịp 24/10 – 25/10 giá 1.300.000đ. Mục "DỊP ĐẶC BIỆT" ghi "Chưa có dịp đặc biệt.".
  - Ngày 24/10 trên lịch giá là giá của Sapphire 1103 (700k), không phải 1,3tr.
- **Nguồn:** PQ5.CHU

### US8-KB20 · Sale không có chỗ đặt giá dịp `[Quyền]`
- **Mục đích:** chỉ người giữ căn đặt giá ngày lễ, dịp đặc biệt.
- **Chuẩn bị:** vào app bằng tài khoản Sale Hùng.
- **Làm:**
  1. Mở chi tiết căn ICON40 1509 từ lịch phòng.
  2. Xem hết màn.
- **Mong đợi:**
  - Không có nút "Đặt giá ngày lễ, dịp đặc biệt", không có "Lưu giá", không có hàng "Chọn nhanh ngày lễ".
- **Nguồn:** PQ5.SALE
