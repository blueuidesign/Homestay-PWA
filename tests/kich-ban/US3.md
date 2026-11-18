# Kịch bản kiểm tay US3 · Chủ nhà ghi đặt phòng, chặn trùng ở database

Story: `docs/stories/US3-ghi-booking.md`. Cách chạy và cách ghi kết quả: `tests/kich-ban/README.md`.

Dữ liệu: bộ mẫu ở `docs/luat-chung/Du_lieu_mau.md`, nạp vào staging bằng `supabase/staging/du_lieu_mau.sql`. Kịch bản ghi "nạp lại" thì chạy lại file đó trước.
Kịch bản viết cho bản Zalo, số liệu theo ngày 07/10/2026 của bộ mẫu. Bước nào nói tới cửa sổ hay quyền của Zalo thì làm theo `docs/luat-chung/PWA.md`. Kịch bản gắn `[Zalo]` chỉ chạy ở bản Zalo.

### US3-KB1 · Ghi đặt phòng khách lẻ vào đêm còn trống `[Chính]`
- **Mục đích:** chủ nhà ghi được đặt phòng 2 đêm, giá điền sẵn theo hai loại đêm, lịch hiện ngay.
- **Chuẩn bị:** dữ liệu thử vừa nạp lại.
- **Làm:**
  1. Tab Lịch, bấm "Đặt phòng".
  2. Chọn chip phòng "1509".
  3. Chọn ngày nhận phòng 15/10.
  4. Chọn chip "2 đêm".
  5. Ở "Khách / Sale", chọn "Khách lẻ".
  6. Chọn "Chưa cọc".
  7. Bấm "Thêm đặt phòng".
- **Mong đợi:**
  - Sau bước 4: ngày trả phòng là 17/10, dòng "✓ 15/10 → 17/10 (2 đêm) · không trùng lịch".
  - Sau bước 4: ô "Tiền phòng (đ)" điền sẵn 2.200.000, dòng tách "15/10: 900.000đ" (T5) và "16/10: 1.300.000đ" (T6).
  - Sau bước 7: về Lịch, toast "Đã thêm đặt phòng Khách lẻ · 1509" ở đầu màn.
  - Chi tiết ngày 15/10 mở sẵn, có đặt phòng 1509 "15/10 → 17/10 (2 đêm)", "2.200.000đ".
  - Ngày 15/10, 16/10 có vạch màu của 1509; 17/10 không có vạch màu của 1509.
- **Nguồn:** US3-NT1, US3-NT2, US3-NT8, QT2.1, HV8

### US3-KB2 · Chip số đêm đổi ngày trả `[Chính]`
- **Mục đích:** chọn số đêm thì ngày trả tự tính đúng.
- **Chuẩn bị:** như KB1. Không lưu ở kịch bản này.
- **Làm:**
  1. Tab Lịch, bấm "Đặt phòng".
  2. Chọn "1509", ngày nhận phòng 15/10.
  3. Chọn "1 đêm".
  4. Chọn "2 đêm".
  5. Chọn "3 đêm".
  6. Chọn "Tùy chọn", chọn ngày trả phòng 19/10.
- **Mong đợi:**
  - Bước 3: ngày trả 16/10, dòng "(1 đêm)", tiền phòng 900.000.
  - Bước 4: ngày trả 17/10, dòng "(2 đêm)", tiền phòng 2.200.000.
  - Bước 5: ngày trả 18/10, dòng "(3 đêm)", tiền phòng 3.500.000 (900.000 + 1.300.000 + 1.300.000; 17/10 là T7).
  - Bước 6: dòng "15/10 → 19/10 (4 đêm)", tiền phòng 4.400.000 (thêm đêm 18/10 CN 900.000đ). Mọi bước đều "không trùng lịch".
- **Nguồn:** US3-NT8

### US3-KB3 · Ghi trùng một đêm của đặt phòng có sẵn `[Lỗi]`
- **Mục đích:** đêm đã có khách thì báo trùng và không lưu được.
- **Chuẩn bị:** dữ liệu thử vừa nạp lại (B1: 1509, 10/10 → 12/10).
- **Làm:**
  1. Tab Lịch, bấm "Đặt phòng".
  2. Chọn "1509", ngày nhận phòng 11/10, chọn "2 đêm".
  3. Chọn "Khách lẻ", "Chưa cọc".
  4. Bấm "Thêm đặt phòng".
- **Mong đợi:**
  - Sau bước 2: dòng báo trùng lịch, không có dấu ✓ và không có chữ "không trùng lịch".
  - Sau bước 4: không có toast "Đã thêm đặt phòng", vẫn ở form, nội dung đã nhập giữ nguyên.
  - Thoát form, chạm ngày 11/10: 1509 chỉ có B1 Sale Hùng "10/10 → 12/10 (2 đêm)". Ngày 12/10: 1509 ghi "Trống".
- **Nguồn:** US3-NT3, QT1.1-VD1

### US3-KB4 · Trùng ở đêm đầu của đặt phòng có sẵn `[Lỗi]`
- **Mục đích:** đặt phòng mới chỉ chồng một đêm cuối của nó lên đêm đầu đặt phòng cũ cũng bị chặn.
- **Chuẩn bị:** dữ liệu thử vừa nạp lại.
- **Làm:**
  1. Tab Lịch, bấm "Đặt phòng".
  2. Chọn "1509", ngày nhận phòng 08/10, chọn "3 đêm".
  3. Chọn "Khách lẻ", "Chưa cọc".
  4. Bấm "Thêm đặt phòng".
- **Mong đợi:**
  - Ngày trả 11/10. Dòng báo trùng (đêm 10/10 thuộc B1).
  - Không có toast, không có đặt phòng mới ở 08/10, 09/10.
- **Nguồn:** US3-NT3, QT1.1

### US3-KB5 · Nhận phòng đúng ngày trả của khách trước `[Biên]`
- **Mục đích:** ngày trả của đặt phòng cũ không phải đêm có khách, nên ghi được.
- **Chuẩn bị:** dữ liệu thử vừa nạp lại.
- **Làm:**
  1. Tab Lịch, bấm "Đặt phòng".
  2. Chọn "1509", ngày nhận phòng 12/10, chọn "1 đêm".
  3. Chọn "Khách lẻ", "Chưa cọc".
  4. Bấm "Thêm đặt phòng".
- **Mong đợi:**
  - Dòng "✓ 12/10 → 13/10 (1 đêm) · không trùng lịch". Tiền phòng 900.000 (12/10 là T2).
  - Toast "Đã thêm đặt phòng Khách lẻ · 1509".
  - Chạm chip "1509": các ngày 10/10, 11/10, 12/10, 13/10, 14/10 có vạch màu; 15/10 không.
- **Nguồn:** US3-NT1, QT1.1-VD2, QT2.1

### US3-KB6 · Cùng ngày nhưng khác căn `[Biên]`
- **Mục đích:** chặn trùng chỉ tính trong cùng một căn.
- **Chuẩn bị:** dữ liệu thử vừa nạp lại.
- **Làm:**
  1. Tab Lịch, bấm "Đặt phòng".
  2. Chọn "3402", ngày nhận phòng 10/10, chọn "2 đêm".
  3. Chọn "Khách lẻ", "Chưa cọc".
  4. Bấm "Thêm đặt phòng".
- **Mong đợi:**
  - Dòng "✓ 10/10 → 12/10 (2 đêm) · không trùng lịch".
  - Tiền phòng điền sẵn 1.900.000, dòng tách "10/10: 1.100.000đ" (T7), "11/10: 800.000đ" (CN).
  - Toast "Đã thêm đặt phòng Khách lẻ · 3402".
  - Chạm ngày 10/10: 1509 có B1 Sale Hùng, 3402 có đặt phòng Khách lẻ "10/10 → 12/10 (2 đêm)", "1.900.000đ".
- **Nguồn:** US3-NT1, US2-NT8, QT1.1-VD3

### US3-KB7 · Đặt phòng 3 đêm có hai đêm cuối tuần, lịch tô đúng `[Chính]`
- **Mục đích:** lịch tô các đêm từ ngày nhận tới trước ngày trả, giá đúng theo hai loại đêm.
- **Chuẩn bị:** dữ liệu thử vừa nạp lại.
- **Làm:**
  1. Tab Lịch, bấm "Đặt phòng".
  2. Chọn "3402", ngày nhận phòng 09/10.
  3. Chọn "Tùy chọn", ngày trả phòng 12/10.
  4. Chọn "Khách lẻ", "Đã thanh toán".
  5. Bấm "Thêm đặt phòng".
  6. Chạm chip "3402".
- **Mong đợi:**
  - Dòng "✓ 09/10 → 12/10 (3 đêm) · không trùng lịch".
  - Tiền phòng 3.000.000: "09/10: 1.100.000đ" (T6), "10/10: 1.100.000đ" (T7), "11/10: 800.000đ" (CN).
  - Sau bước 6: 09/10, 10/10, 11/10 có vạch màu 3402; 12/10 không.
- **Nguồn:** US2-NT3, QT2.1

### US3-KB8 · Đặt phòng qua hai tháng `[Biên]`
- **Mục đích:** đêm cuối tháng 10 và đêm đầu tháng 11 tô đúng tháng, giá điền đúng.
- **Chuẩn bị:** dữ liệu thử vừa nạp lại.
- **Làm:**
  1. Tab Lịch, bấm "Đặt phòng".
  2. Chọn "1509", ngày nhận phòng 31/10, chọn "2 đêm".
  3. Chọn "Khách lẻ", "Chưa cọc".
  4. Bấm "Thêm đặt phòng".
  5. Chạm chip "1509".
  6. Bấm "T11".
- **Mong đợi:**
  - Ngày trả 02/11. Tiền phòng 2.200.000: "31/10: 1.300.000đ" (T7), "01/11: 900.000đ" (CN).
  - Lịch tháng 10: 31/10 có vạch màu 1509.
  - Lịch tháng 11: 01/11 có vạch màu 1509; 02/11 không.
- **Nguồn:** US2-NT3, QT2.1, QT2.2

### US3-KB9 · Đặt phòng từ căn trống ở chi tiết ngày `[Chính]`
- **Mục đích:** bấm "Đặt phòng" ở căn trống thì form mở với căn và ngày điền sẵn.
- **Chuẩn bị:** dữ liệu thử vừa nạp lại.
- **Làm:**
  1. Tab Lịch, chạm ngày 10/10.
  2. Ở dòng "Phòng 3402 · Trống ✓", bấm "Đặt phòng".
  3. Chọn "1 đêm".
  4. Chọn "Khách lẻ", "Chưa cọc".
  5. Bấm "Thêm đặt phòng".
- **Mong đợi:**
  - Sau bước 1: dưới lưới hiện "Ngày 10/10/2026"; 1509 có B1, 3402 ghi "Trống" kèm nút "Đặt phòng".
  - Sau bước 2: form "Thêm đặt phòng", chip "3402" đã chọn, ngày nhận 10/10.
  - Sau bước 3: tiền phòng 1.100.000 (10/10 là T7).
  - Sau bước 5: toast "Đã thêm đặt phòng Khách lẻ · 3402"; chi tiết ngày 10/10 mở sẵn, 3402 có đặt phòng "10/10 → 11/10 (1 đêm)".
- **Nguồn:** US3-NT10, US3-NT1

### US3-KB10 · Chi tiết ngày của căn có khách và ngày trả `[Chính]`
- **Mục đích:** chi tiết ngày hiện đúng người đặt, ngày, số đêm, số tiền; ngày trả không tính có khách.
- **Chuẩn bị:** dữ liệu thử vừa nạp lại.
- **Làm:**
  1. Tab Lịch, chạm ngày 10/10.
  2. Chạm ngày 14/10.
  3. Chạm ngày 12/10.
- **Mong đợi:**
  - 10/10: 1509 "Sale Hùng", "10/10 → 12/10 (2 đêm)", "2.200.000đ · Cọc: 1.000.000đ"; 3402 "Trống".
  - 14/10: 1509 "Khách lẻ", "13/10 → 15/10 (2 đêm)", "1.800.000đ"; 3402 "Khách lẻ", "14/10 → 15/10 (1 đêm)", "800.000đ".
  - 12/10: 1509 và 3402 đều "Trống", có nút "Đặt phòng".
- **Nguồn:** US2-NT8, US3-NT10, QT2.1-VD1, QT2.1-VD2

### US3-KB11 · Lọc lịch theo căn `[Chính]`
- **Mục đích:** chạm chip một căn thì lịch chỉ còn ngày có khách của căn đó.
- **Chuẩn bị:** dữ liệu thử vừa nạp lại.
- **Làm:**
  1. Tab Lịch, chạm chip "1509".
  2. Chạm chip "3402".
  3. Chạm chip "Cả 2 phòng".
- **Mong đợi:**
  - Bước 1: chỉ 04, 05, 10, 11, 13, 14, 19/10 có vạch màu.
  - Bước 2: chỉ 05, 06, 14, 17, 18, 21/10 có vạch màu.
  - Bước 3: vạch của cả hai căn hiện lại.
- **Nguồn:** US2-NT4, QT2.1

### US3-KB12 · Trạng thái tiền và ô tiền cọc `[Chính]`
- **Mục đích:** ô "Số tiền cọc (đ)" chỉ hiện khi chọn "Đã cọc · còn thu"; cọc lưu đúng.
- **Chuẩn bị:** dữ liệu thử vừa nạp lại.
- **Làm:**
  1. Tab Lịch, bấm "Đặt phòng".
  2. Chọn "1509", ngày nhận phòng 15/10, "2 đêm", "Khách lẻ".
  3. Chọn "Đã cọc · còn thu".
  4. Chọn "Chưa cọc".
  5. Chọn "Đã thanh toán".
  6. Chọn lại "Đã cọc · còn thu", nhập 1.000.000 vào "Số tiền cọc (đ)".
  7. Bấm "Thêm đặt phòng".
- **Mong đợi:**
  - Bước 3: hiện ô "Số tiền cọc (đ)".
  - Bước 4, 5: ô này ẩn.
  - Bước 7: toast "Đã thêm đặt phòng Khách lẻ · 1509"; chi tiết ngày 15/10 ghi "2.200.000đ · Cọc: 1.000.000đ".
- **Nguồn:** US3-NT3

### US3-KB13 · Thêm chi tiết `[Chính]`
- **Mục đích:** mở "Thêm chi tiết" thấy số khách, giờ mặc định và ghi chú.
- **Chuẩn bị:** như KB1. Không lưu ở kịch bản này.
- **Làm:**
  1. Tab Lịch, bấm "Đặt phòng".
  2. Bấm "Thêm chi tiết".
  3. Bấm "+" ở số khách hai lần.
  4. Bấm "−" một lần.
- **Mong đợi:**
  - Bước 2: thấy số khách có nút − và +, giờ "14:00 → 12:00", ô "Ghi chú".
  - Bước 3: số khách tăng 2. Bước 4: giảm 1.
- **Nguồn:** US3-NT14

### US3-KB14 · Hàng chip người đặt `[Chính]`
- **Mục đích:** form có đủ lựa chọn người đặt.
- **Chuẩn bị:** như KB1. Không lưu ở kịch bản này.
- **Làm:**
  1. Tab Lịch, bấm "Đặt phòng".
  2. Xem hàng "Khách / Sale".
- **Mong đợi:**
  - Có chip "+ Sale mới", "Khách lẻ", "Sale Hùng", "Sale Lan", "Sale Nga", "Sale Minh".
  - Form có các phần: Phòng, ngày và số đêm, Khách / Sale, Tiền phòng, trạng thái tiền, Thêm chi tiết. Tiêu đề "Thêm đặt phòng".
- **Nguồn:** mục "Người đặt, tiền phòng và tiền cọc" bước 1, mục "Chủ nhà ghi booking mới" bước 1

### US3-KB15 · Tiền phòng bỏ trống `[Lỗi]`
- **Mục đích:** không có tiền phòng thì không lưu được.
- **Chuẩn bị:** dữ liệu thử vừa nạp lại.
- **Làm:**
  1. Tab Lịch, bấm "Đặt phòng".
  2. Chọn "1509", ngày nhận phòng 15/10, "2 đêm", "Khách lẻ", "Chưa cọc".
  3. Xóa hết số trong ô "Tiền phòng (đ)".
  4. Bấm "Thêm đặt phòng".
- **Mong đợi:**
  - Ô "Tiền phòng (đ)" viền đỏ, dòng "Nhập tiền phòng trước khi lưu".
  - Nút "Thêm đặt phòng" không dùng được: bấm vào không lưu, lỗi vẫn hiện.
  - Không có toast. Thoát form, chạm ngày 15/10: 1509 ghi "Trống".
- **Nguồn:** US3-NT14, QT4.1-VD3

### US3-KB16 · Bấm lưu hai lần liền `[Mạng]`
- **Mục đích:** đang lưu thì nút khóa, chỉ một đặt phòng được ghi.
- **Chuẩn bị:** dữ liệu thử vừa nạp lại.
- **Làm:**
  1. Tab Lịch, bấm "Đặt phòng".
  2. Chọn "1509", ngày nhận phòng 15/10, "2 đêm", "Khách lẻ", "Chưa cọc".
  3. Bấm "Thêm đặt phòng" hai lần thật nhanh.
- **Mong đợi:**
  - Ngay sau lần bấm đầu, nút đổi chữ thành "Đang lưu…".
  - Chỉ một toast. Chạm ngày 15/10: 1509 có đúng một đặt phòng.
- **Nguồn:** HV1 bước 3, HV1-NT1

### US3-KB17 · Mất mạng khi bấm lưu `[Mạng]`
- **Mục đích:** mất mạng thì báo chưa lưu, giữ form, có mạng lại không tự gửi.
- **Chuẩn bị:** dữ liệu thử vừa nạp lại.
- **Làm:**
  1. Tab Lịch, bấm "Đặt phòng".
  2. Chọn "1509", ngày nhận phòng 15/10, "2 đêm", "Khách lẻ", "Chưa cọc".
  3. Bật chế độ máy bay.
  4. Bấm "Thêm đặt phòng".
  5. Tắt chế độ máy bay, chờ 10 giây.
  6. Thoát form, chạm ngày 15/10.
- **Mong đợi:**
  - Bước 4: báo "Chưa lưu được, bấm lại khi có mạng". Form giữ nguyên căn, ngày, tiền.
  - Bước 5: không có toast "Đã thêm đặt phòng".
  - Bước 6: 1509 ghi "Trống".
- **Nguồn:** HV2-NT1, HV2-NT2, HV2 bước 3, 4

### US3-KB18 · Mất mạng khi đang xem lịch `[Mạng]`
- **Mục đích:** lịch đã tải vẫn xem được khi mất mạng.
- **Chuẩn bị:** mở tab Lịch, chờ tải xong.
- **Làm:**
  1. Bật chế độ máy bay.
  2. Chạm ngày 10/10.
  3. Tắt chế độ máy bay.
- **Mong đợi:**
  - Bước 1: dải ở đầu màn "Mất kết nối. Lịch có thể chưa mới nhất."; lịch vẫn hiện vạch màu.
  - Bước 3: dải tự mất.
- **Nguồn:** HV2-NT3, HV2 bước 1, 4

### US3-KB19 · Mở lại lịch đã xem `[Mạng]`
- **Mục đích:** mở lại tab Lịch thì lịch cũ hiện ngay, không màn trống.
- **Chuẩn bị:** đã mở tab Lịch một lần.
- **Làm:**
  1. Sang tab Căn.
  2. Quay lại tab Lịch.
- **Mong đợi:**
  - Lịch hiện ngay, có thể có dòng nhỏ "Đang cập nhật…" ở đầu màn. Không thấy màn trắng hay vòng quay giữa màn.
- **Nguồn:** HV1-NT2, HV1 bước 2

### US3-KB20 · Rời app khi đang nhập rồi quay lại `[Mạng]`
- **Mục đích:** gọi điện xong quay lại, form còn nguyên.
- **Chuẩn bị:** dữ liệu thử vừa nạp lại.
- **Làm:**
  1. Tab Lịch, bấm "Đặt phòng".
  2. Chọn "3402", ngày nhận phòng 10/10, "2 đêm", "Khách lẻ".
  3. Sửa tiền phòng thành 1.800.000.
  4. Về màn hình chính của điện thoại, mở ứng dụng khác 5 phút.
  5. Quay lại Zalo, vào lại app.
- **Mong đợi:**
  - Vẫn ở form "Thêm đặt phòng": chip "3402", 10/10 → 12/10, "Khách lẻ", tiền phòng 1.800.000.
- **Nguồn:** HV3-NT1, HV3 bước 2

### US3-KB21 · App bị đóng hẳn khi đang nhập `[Mạng]`
- **Mục đích:** mở lại app thì form được khôi phục; lưu xong thì nháp mất.
- **Chuẩn bị:** dữ liệu thử vừa nạp lại.
- **Làm:**
  1. Tab Lịch, bấm "Đặt phòng".
  2. Chọn "3402", ngày nhận phòng 10/10, "2 đêm", "Khách lẻ", "Chưa cọc".
  3. Vuốt tắt Zalo khỏi danh sách ứng dụng đang chạy.
  4. Mở Zalo, mở lại app.
  5. Bấm "Thêm đặt phòng".
  6. Bấm "Đặt phòng" ở tab Lịch.
- **Mong đợi:**
  - Bước 4: form mở lại với 3402, 10/10 → 12/10, "Khách lẻ", và dòng "Đã khôi phục nội dung bạn đang nhập".
  - Bước 5: toast "Đã thêm đặt phòng Khách lẻ · 3402".
  - Bước 6: form mới, không còn 3402 10/10 → 12/10 đã nhập trước đó.
- **Nguồn:** HV3 bước 3, 5, HV3-NT4

### US3-KB22 · Toast tự tắt `[Biên]`
- **Mục đích:** toast ở chỗ chung và tự tắt sau 3 giây.
- **Chuẩn bị:** dữ liệu thử vừa nạp lại.
- **Làm:**
  1. Ghi đặt phòng như KB1 bước 1 đến 7.
  2. Không chạm gì, đếm 3 giây.
- **Mong đợi:**
  - Toast nền tối chữ trắng, nổi ngay dưới thanh tiêu đề và cụm ··· ✕ của Zalo.
  - Sau khoảng 3 giây toast tự tắt.
- **Nguồn:** HV8-NT2, HV8 bước 1, CN4-03

### US3-KB23 · Chủ nhà khác không ghi được vào căn của Chị Hoa `[Quyền]`
- **Mục đích:** chủ nhà chỉ chọn được căn của mình khi ghi đặt phòng.
- **Chuẩn bị:** vào app bằng tài khoản Anh Tuấn (Sapphire 1103, À La Carte 2208, DLM.3).
- **Làm:**
  1. Tab Lịch, bấm "Đặt phòng".
  2. Xem hàng chip "Phòng".
- **Mong đợi:**
  - Chỉ có chip hai căn của Anh Tuấn: Sapphire 1103, À La Carte 2208. Không có "1509", "3402".
  - Lịch của Anh Tuấn không có vạch màu của 1509, 3402.
- **Nguồn:** PQ7.CHU, PQ4.CHU

### US3-KB24 · Tiền phòng điền sẵn qua cuối tháng `[Biên]`
- **Mục đích:** ô tiền phòng điền sẵn đúng tổng giá các đêm khi đặt phòng qua hai tháng.
- **Chuẩn bị:** dữ liệu thử vừa nạp lại.
- **Làm:**
  1. Tab Lịch, bấm "Đặt phòng".
  2. Chọn "1509", ngày nhận phòng 31/10, "2 đêm", "Khách lẻ", "Chưa cọc".
  3. Bấm "Thêm đặt phòng".
- **Mong đợi:**
  - Sau bước 2: ngày trả 02/11, ô "Tiền phòng (đ)" điền sẵn 2.200.000, dòng tách "31/10: 1.300.000đ" (T7) và "01/11: 900.000đ" (CN).
  - Sau bước 3: toast "Đã thêm đặt phòng Khách lẻ · 1509"; đặt phòng "31/10 → 02/11 (2 đêm)", "2.200.000đ".
- **Nguồn:** US3-NT12, QT4.1-VD1, QT4.2-VD3

### US3-KB25 · Lệnh tạo đặt phòng không có tiền phòng gửi thẳng tới server `[Quyền]`
- **Mục đích:** server tự từ chối booking không có tiền phòng, không dựa vào nút bị khóa trên app.
- **Chuẩn bị:** dữ liệu thử vừa nạp lại. Phiên của Chị Hoa. Chạy bằng test tự động (TA5), không bấm trên điện thoại.
- **Làm:**
  1. Gửi cho 1509, nhận 15/10 trả 17/10, khách lẻ, không có trường tiền phòng.
  2. Gửi lại lệnh đó với tiền phòng rỗng.
  3. Xem lịch 1509.
- **Mong đợi:**
  - Bước 1 và 2: server trả lỗi `DU_LIEU_SAI`, không tạo booking.
  - Bước 3: đêm 15/10, 16/10 của 1509 vẫn trống.
- **Nguồn:** US3-NT1, QT4.1-VD3
