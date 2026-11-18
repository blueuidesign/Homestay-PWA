# Kịch bản kiểm tay US3 · Đặt phòng của chủ nhà: ghi, xem, sửa, xóa, thu tiền, hủy với sale

Story: `docs/stories/US3-dat-phong.md`. Cách chạy và cách ghi kết quả: `tests/kich-ban/README.md`.

Dữ liệu: bộ mẫu ở `docs/luat-chung/Du_lieu_mau.md`, nạp vào staging bằng `supabase/staging/du_lieu_mau.sql`. Kịch bản ghi "nạp lại" thì chạy lại file đó trước.

Các kịch bản dưới đây gộp từ nhiều story cũ ngày 18/11/2026 (QD-020) và còn viết cho bản Zalo, số liệu theo ngày 07/10/2026 của bộ mẫu. Chưa sửa theo story đã viết lại: việc này nằm trong mục "Việc cần làm" của story. Bước nào nói tới cửa sổ hay quyền của Zalo thì làm theo `docs/luat-chung/PWA.md`. Kịch bản gắn `[Zalo]` chỉ chạy ở bản Zalo.

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

### US3-KB26 · Xem chi tiết đặt phòng của sale `[Chính]`
- **Mục đích:** chủ nhà thấy đủ ngày, giờ, người bán của một đặt phòng.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa.
- **Làm:**
  1. Tab Lịch, chạm ngày 10/10.
  2. Bấm "Sửa" trên thẻ phòng 1509.
- **Mong đợi:**
  - Tiêu đề "Đặt phòng · Sale Hùng", "Phòng 1509", nhãn "Đã cọc · còn thu".
  - "10/10 → 12/10 (2 đêm)", "Nhận 14:00 thứ 7 · trả 12:00 thứ 2".
  - Thẻ sale: "Sale Hùng", số điện thoại sale, số khách, nút "Gọi sale".
  - Dòng "Khách do sale Hùng bán. Tên và số điện thoại khách chỉ sale giữ; cần gì về khách thì gọi sale."
- **Nguồn:** mục "Chi tiết booking và đánh dấu đã thu đủ" bước 1, 2

### US3-KB27 · Chủ nhà không thấy giá bán và khách của sale `[Quyền]`
- **Mục đích:** hai lớp giá: chủ nhà chỉ thấy giá của mình.
- **Chuẩn bị:** như US3-KB26.
- **Làm:**
  1. Mở chi tiết B1.
  2. Kéo hết từ trên xuống dưới.
  3. Bấm nút sửa đặt phòng, kéo hết form.
- **Mong đợi:**
  - Không chỗ nào có 2.600.000đ, "giá bán" hay mức cộng của sale.
  - Không có tên hay số điện thoại khách của Sale Hùng.
- **Nguồn:** PQ11.CHU, PQ9.CHU, quy tắc Sale thấy hai giá, chủ nhà thấy một giá (nhóm Booking)

### US3-KB28 · Tiền còn lại `[Chính]`
- **Mục đích:** còn lại bằng tiền phòng trừ tiền cọc.
- **Chuẩn bị:** như US3-KB26.
- **Làm:**
  1. Mở chi tiết B1.
  2. Xem mục "TIỀN".
- **Mong đợi:**
  - "Tiền phòng 2.200.000đ", "Đã cọc 1.000.000đ", "Còn lại 1.200.000đ".
  - Nút "Đã thu đủ 1.200.000đ".
- **Nguồn:** US3-NT30

### US3-KB29 · Đánh dấu đã thu đủ `[Chính]`
- **Mục đích:** một chạm ghi nhận đã thu hết tiền.
- **Chuẩn bị:** như US3-KB26.
- **Làm:**
  1. Mở chi tiết B1.
  2. Bấm "Đã thu đủ 1.200.000đ".
  3. Quay lại tab Lịch, xem dòng B1 ở "Đặt phòng sắp tới".
- **Mong đợi:**
  - Nhãn đổi thành "Đã thanh toán".
  - Nút đổi thành "Hoàn tác: chưa thu đủ".
  - Dòng B1 ở tab Lịch ghi "Đã thanh toán".
- **Nguồn:** US3-NT31

### US3-KB30 · Hoàn tác thu đủ về "Đã cọc · còn thu" `[Chính]`
- **Mục đích:** bấm nhầm thì về đúng trạng thái trước.
- **Chuẩn bị:** như US3-KB26.
- **Làm:**
  1. Mở chi tiết B1, bấm "Đã thu đủ 1.200.000đ".
  2. Bấm "Hoàn tác: chưa thu đủ".
- **Mong đợi:**
  - Nhãn về "Đã cọc · còn thu".
  - Mục Tiền vẫn "Đã cọc 1.000.000đ", "Còn lại 1.200.000đ".
  - Nút về "Đã thu đủ 1.200.000đ".
- **Nguồn:** US3-NT32

### US3-KB31 · Thu đủ rồi hoàn tác ở đặt phòng chưa cọc `[Biên]`
- **Mục đích:** hoàn tác về đúng trạng thái trước, kể cả khi trước đó là "Chưa cọc".
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa.
- **Làm:**
  1. Mở chi tiết B5 (Khách lẻ, 1509, 13/10 → 15/10).
  2. Xem mục Tiền.
  3. Bấm nút "Đã thu đủ".
  4. Bấm "Hoàn tác: chưa thu đủ".
- **Mong đợi:**
  - Bước 2: "Tiền phòng 1.800.000đ", "Còn lại 1.800.000đ".
  - Bước 3: nhãn "Đã thanh toán".
  - Bước 4: nhãn về "Chưa cọc", không phải "Đã cọc · còn thu".
- **Nguồn:** US3-NT32

### US3-KB32 · Mất mạng khi bấm thu đủ `[Mạng]`
- **Mục đích:** không tưởng đã ghi thu tiền khi chưa lưu.
- **Chuẩn bị:** như US3-KB26.
- **Làm:**
  1. Mở chi tiết B1.
  2. Bật chế độ máy bay.
  3. Bấm "Đã thu đủ 1.200.000đ".
  4. Tắt chế độ máy bay, chờ dải cảnh báo mất.
- **Mong đợi:**
  - Bước 3 báo "Chưa lưu được, bấm lại khi có mạng". Nhãn vẫn "Đã cọc · còn thu".
  - Bước 4 nhãn vẫn "Đã cọc · còn thu": app không tự gửi lại.
- **Nguồn:** HV2 bước 3, 4 (mục "Chi tiết booking và đánh dấu đã thu đủ" trạng thái lỗi mạng)

### US3-KB33 · Mở sửa đặt phòng thấy đúng giá trị `[Chính]`
- **Mục đích:** form sửa điền sẵn mọi giá trị đang có.
- **Chuẩn bị:** như US3-KB26.
- **Làm:**
  1. Mở chi tiết B1.
  2. Bấm nút sửa đặt phòng.
- **Mong đợi:**
  - Tiêu đề "Sửa đặt phòng · Sale Hùng".
  - Chip phòng 1509 đang chọn, ngày nhận 10/10, ngày trả 12/10, chip "2 đêm".
  - Người đặt là Sale Hùng.
  - "Tiền phòng (đ)" 2.200.000, nút "Đã cọc · còn thu" đang chọn, số tiền cọc 1.000.000.
  - Dòng chi tiết có "14:00 → 12:00". Nút "Lưu thay đổi".
- **Nguồn:** US3-NT35

### US3-KB34 · Sửa sang đêm đã có khách bị chặn `[Lỗi]`
- **Mục đích:** sửa không tạo trùng lịch.
- **Chuẩn bị:** như US3-KB26.
- **Làm:**
  1. Mở sửa B1.
  2. Đổi ngày trả thành 14/10 (B1 thành 10/10 → 14/10).
  3. Bấm "Lưu thay đổi".
  4. Quay lại tab Lịch.
- **Mong đợi:**
  - Bước 2 có dòng báo trùng với đêm 13/10 (đêm của Khách lẻ 13/10 → 15/10).
  - Bước 3 không lưu được.
  - Bước 4 B1 vẫn 10/10 → 12/10; ô 12/10 của 1509 không tô.
- **Nguồn:** US3-NT36, QT1.2-VD2

### US3-KB35 · Sửa tiền, giữ ngày: không báo trùng với chính nó `[Chính]`
- **Mục đích:** đặt phòng không bị coi là trùng với chính mình; tiền và doanh thu đổi đúng.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa.
- **Làm:**
  1. Mở chi tiết B5, bấm nút sửa đặt phòng.
  2. Không đổi ngày. Đổi "Tiền phòng (đ)" từ 1.800.000 thành 1.700.000.
  3. Bấm "Lưu thay đổi".
  4. Mở lại chi tiết B5.
  5. Về tab Lịch, xem khối doanh thu tháng 10.
- **Mong đợi:**
  - Bước 2 có dòng "không trùng lịch", không báo trùng.
  - Bước 3 lưu được.
  - Bước 4: "Tiền phòng 1.700.000đ", "Còn lại 1.700.000đ".
  - Bước 5: "11.700.000đ" (11.800.000đ − 100.000đ), vẫn "13 đêm có khách".
- **Nguồn:** US3-NT37, QT1.2-VD1, QT4.2

### US3-KB36 · Sửa sát ngày trả của đặt phòng khác `[Biên]`
- **Mục đích:** ngày trả của đặt phòng khác không phải đêm có khách.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa.
- **Làm:**
  1. Mở chi tiết B5, bấm nút sửa đặt phòng.
  2. Đổi ngày nhận thành 12/10, ngày trả giữ 15/10.
  3. Xem dòng kiểm trùng.
  4. Bấm quay lại, không lưu.
- **Mong đợi:**
  - Dòng kiểm trùng ghi "không trùng lịch": 12/10 là ngày trả của B1, không phải đêm của B1.
- **Nguồn:** QT1.1-VD2, mục "Sửa booking" bước 2

### US3-KB37 · Chủ nhà sửa ngày và giá của đặt phòng của sale `[Chính]`
- **Mục đích:** sửa B1 theo ví dụ DLM.6, lịch, tiền và doanh thu đổi đúng.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa.
- **Làm:**
  1. Mở chi tiết B1, bấm nút sửa đặt phòng.
  2. Đổi ngày nhận thành 11/10, chọn "2 đêm".
  3. Đổi "Tiền phòng (đ)" thành 1.800.000.
  4. Bấm "Lưu thay đổi".
  5. Tab Lịch, xem tháng 10 và khối doanh thu.
  6. Mở lại chi tiết B1.
- **Mong đợi:**
  - Bước 2 ngày trả thành 13/10, dòng "không trùng lịch".
  - Bước 5: 1509 tô 11/10 và 12/10; 10/10 không tô. Doanh thu "11.400.000đ" (11.800.000đ − 2.200.000đ + 1.800.000đ), vẫn "13 đêm có khách".
  - Bước 6: "11/10 → 13/10 (2 đêm)", "Tiền phòng 1.800.000đ", "Đã cọc 1.000.000đ", "Còn lại 800.000đ".
- **Nguồn:** US3-NT40, DLM.6

### US3-KB38 · Sale nhận thông báo chủ sửa đặt phòng `[Chính]`
- **Mục đích:** Sale Hùng biết ngày cũ, ngày mới, giá chủ nhà mới.
- **Chuẩn bị:** hai máy: máy 1 tài khoản Chị Hoa, máy 2 tài khoản Sale Hùng. Máy 2 đóng app.
- **Làm:**
  1. Máy 1: làm US3-KB37 bước 1 đến 4.
  2. Máy 2: mở app.
  3. Máy 2: bấm "Xem tất cả thông báo".
- **Mong đợi:**
  - Bước 2: popup "Thông báo mới hôm nay", dòng "Chị Hoa đã sửa đặt phòng của bạn", "ICON40 1509 · 10/10 → 12/10 đổi thành 11/10 → 13/10. Giá chủ nhà 2.200.000đ đổi thành 1.800.000đ", có chấm chưa đọc.
  - Bước 3: P13 có cùng dòng "Chị Hoa đã sửa đặt phòng của bạn".
  - Không có hộp thoại hay tin nhắn Zalo nào.
- **Nguồn:** US3-NT39, US3-NT40

### US3-KB39 · Giá bán của sale giữ nguyên sau khi chủ sửa `[Chính]`
- **Mục đích:** giá đã báo khách không tự đổi khi chủ nhà đổi giá chủ nhà.
- **Chuẩn bị:** như US3-KB38, đã làm xong US3-KB38.
- **Làm:**
  1. Máy 2 (Sale Hùng): chạm dòng "Chị Hoa đã sửa đặt phòng của bạn".
- **Mong đợi:**
  - Thẻ căn "ICON40 1509", "Chị Hoa · 11/10 → 13/10 (2 đêm)".
  - "Giá bán cho khách 2.600.000đ", "Giá chủ nhà 1.800.000đ". Canvas S3-10 còn ghi 2.200.000đ; theo US3-NT40 là 2.600.000đ.
  - Thẻ vàng: ngày 10/10 → 12/10 gạch, thành 11/10 → 13/10; giá chủ nhà 2.200.000đ gạch, thành 1.800.000đ.
  - Dòng thông báo thành đã đọc.
- **Nguồn:** US3-NT40, DLM.6

### US3-KB40 · Mất mạng khi lưu sửa đặt phòng `[Mạng]`
- **Mục đích:** không tưởng đã sửa khi chưa lưu.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa.
- **Làm:**
  1. Mở sửa B5, đổi tiền phòng thành 1.700.000.
  2. Bật chế độ máy bay.
  3. Bấm "Lưu thay đổi".
  4. Tắt chế độ máy bay, mở lại chi tiết B5.
- **Mong đợi:**
  - Bước 3 báo "Chưa lưu được, bấm lại khi có mạng". Form vẫn ghi 1.700.000.
  - Bước 4 B5 vẫn "Tiền phòng 1.800.000đ".
- **Nguồn:** HV2 bước 3, 4 (mục "Sửa booking" trạng thái lỗi mạng)

### US3-KB41 · Rời app khi đang sửa đặt phòng `[Mạng]`
- **Mục đích:** gọi sale xong quay lại vẫn còn chỗ đang sửa.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa.
- **Làm:**
  1. Mở sửa B1, đổi ngày nhận thành 11/10, tiền phòng thành 1.800.000.
  2. Về màn hình chính, mở ứng dụng Điện thoại, chờ 5 phút.
  3. Mở lại Zalo.
- **Mong đợi:**
  - Vẫn ở form "Sửa đặt phòng · Sale Hùng", còn ngày 11/10 và 1.800.000.
- **Nguồn:** HV3 bước 1, 2, HV3-NT1 (mục "Sửa booking" trạng thái quay lại từ nền)

### US3-KB42 · Xóa đặt phòng lần đầu chỉ hỏi lại `[Chính]`
- **Mục đích:** bấm nhầm một lần không mất đặt phòng.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa.
- **Làm:**
  1. Mở chi tiết B5.
  2. Bấm "Xóa đặt phòng".
  3. Đóng hộp hỏi bằng nút hủy.
- **Mong đợi:**
  - Bước 2 hỏi "Xác nhận xóa đặt phòng? Ngày 13/10 → 15/10 của 1509 trống lại."
  - Bước 3 B5 vẫn còn; tab Lịch 13/10, 14/10 của 1509 vẫn tô.
- **Nguồn:** US3-NT43

### US3-KB43 · Xác nhận xóa đặt phòng khách lẻ `[Chính]`
- **Mục đích:** xóa xong các đêm trống lại, doanh thu bớt đúng.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa.
- **Làm:**
  1. Mở chi tiết B5, bấm "Xóa đặt phòng".
  2. Bấm xác nhận.
  3. Mở tab Lịch, tháng 10.
- **Mong đợi:**
  - 13/10 và 14/10 của 1509 không còn tô.
  - "Đặt phòng sắp tới" không còn dòng Khách lẻ 1509 13/10 → 15/10.
  - Khối doanh thu "10.000.000đ" (11.800.000đ − 1.800.000đ), "11 đêm có khách".
- **Nguồn:** US3-NT44, QT2.1

### US3-KB44 · Đêm đã xóa ghi lại được `[Biên]`
- **Mục đích:** sau khi xóa, đêm trống thật, không còn bị chặn trùng.
- **Chuẩn bị:** đã làm US3-KB43.
- **Làm:**
  1. Tab Lịch, bấm "+ Đặt phòng".
  2. Chọn phòng 1509, ngày nhận 13/10, chọn "2 đêm".
- **Mong đợi:**
  - Dòng "✓ 13/10 → 15/10 (2 đêm) · không trùng lịch".
  - Ô tiền phòng điền sẵn 1.800.000 (900.000đ × 2 đêm T3, T4).
- **Nguồn:** US3-NT44, US3-NT2, QT4.1

### US3-KB45 · Đặt phòng từ yêu cầu của sale không có nút xóa `[Quyền]`
- **Mục đích:** chủ nhà không xóa được đặt phòng của sale đã chấp nhận, vẫn sửa được.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa.
- **Làm:**
  1. Mở chi tiết B1.
  2. Kéo hết xuống dưới.
  3. Bấm nút sửa đặt phòng.
- **Mong đợi:**
  - Không có nút "Xóa đặt phòng" ở đâu trên màn.
  - Bước 3 mở được form "Sửa đặt phòng · Sale Hùng".
- **Nguồn:** US3-NT45, PQ7.CHU

### US3-KB46 · Đặt phòng chủ nhà ghi cho sale không có nút xóa `[Quyền]`
- **Mục đích:** đặt phòng chủ nhà chọn sale làm người đặt được coi như đặt phòng của sale.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa. Ghi trước một đặt phòng: 1509, nhận 22/10, 1 đêm, người đặt Sale Hùng, tiền phòng 900.000 (US3-NT25).
- **Làm:**
  1. Tab Lịch, chạm dòng Sale Hùng 1509 22/10 → 23/10 ở "Đặt phòng sắp tới".
  2. Kéo hết xuống dưới.
  3. Bấm nút sửa đặt phòng.
- **Mong đợi:**
  - Không có nút "Xóa đặt phòng".
  - Bước 3 mở được form sửa.
- **Nguồn:** US3-NT47, PQ7.CHU

### US3-KB47 · Sale không sửa, không xóa được đặt phòng của mình `[Quyền]`
- **Mục đích:** chỉ chủ nhà sửa đặt phòng; sale chỉ xem.
- **Chuẩn bị:** vào app bằng tài khoản Sale Hùng.
- **Làm:**
  1. Tab Thống kê, mở danh sách đặt phòng của Hùng (S7-03), chạm ICON40 1509 · 10/10 → 12/10.
  2. Kéo hết xuống dưới.
- **Mong đợi:**
  - Không có nút sửa đặt phòng, không có nút "Xóa đặt phòng".
- **Nguồn:** PQ7.SALE

### US3-KB48 · Mất mạng khi xác nhận xóa `[Mạng]`
- **Mục đích:** không tưởng đã xóa khi chưa xóa.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa.
- **Làm:**
  1. Mở chi tiết B5, bấm "Xóa đặt phòng".
  2. Bật chế độ máy bay.
  3. Bấm xác nhận.
  4. Tắt chế độ máy bay, mở tab Lịch.
- **Mong đợi:**
  - Bước 3 báo "Chưa lưu được, bấm lại khi có mạng".
  - Bước 4 B5 vẫn còn, 13/10 và 14/10 của 1509 vẫn tô.
- **Nguồn:** HV2 bước 3, 4 (mục "Xóa booking" trạng thái lỗi mạng)

### US3-KB49 · Sửa tiền phòng lúc ghi, doanh thu chia theo đêm `[Chính]`
- **Mục đích:** số chủ nhà gõ là tiền phòng của đặt phòng; đêm cuối tháng 10 tính vào doanh thu tháng 10.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa. Tab Lịch tháng 10, khối doanh thu "11.800.000đ", "13 đêm có khách".
- **Làm:**
  1. Tab Lịch, bấm "Đặt phòng".
  2. Chọn "1509", ngày nhận phòng 31/10, chọn "2 đêm", "Khách lẻ", "Chưa cọc".
  3. Xem ô "Tiền phòng (đ)".
  4. Sửa ô này thành 2.000.000.
  5. Bấm "Thêm đặt phòng".
  6. Ở chi tiết ngày 31/10, bấm "Sửa" trên thẻ phòng 1509.
  7. Về tab Lịch, xem khối doanh thu tháng 10.
- **Mong đợi:**
  - Bước 3: ô điền sẵn 2.200.000, dòng tách "31/10: 1.300.000đ" (T7), "01/11: 900.000đ" (CN).
  - Bước 6: "Tiền phòng 2.000.000đ", "Còn lại 2.000.000đ".
  - Bước 7: "12.800.000đ" (11.800.000đ + 1.000.000đ của đêm 31/10), "14 đêm có khách".
  - Phần tháng 11 (1.000.000đ cho đêm 01/11) do test tự động kiểm, vì nhóm Lịch chủ nhà chưa nói khối doanh thu đổi theo tháng.
- **Nguồn:** US3-NT38, QT4.1-VD2, QT4.2-VD1

### US3-KB50 · Bấm "Đã thu đủ" hai lần liền `[Mạng]`
- **Mục đích:** bấm hai lần chỉ ghi một lần, hoàn tác vẫn về đúng trạng thái trước.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa.
- **Làm:**
  1. Mở chi tiết B1.
  2. Bấm "Đã thu đủ 1.200.000đ" hai lần thật nhanh.
  3. Bấm "Hoàn tác: chưa thu đủ".
- **Mong đợi:**
  - Bước 2: nhãn "Đã thanh toán", nút "Hoàn tác: chưa thu đủ", không có báo lỗi.
  - Bước 3: nhãn về "Đã cọc · còn thu", "Còn lại 1.200.000đ", không về "Đã thanh toán".
- **Nguồn:** US3-NT31, US3-NT32, HV1-NT1

### US3-KB51 · Sale nhận thông báo khi chủ sửa đặt phòng chủ ghi cho sale `[Chính]`
- **Mục đích:** đặt phòng chủ nhà ghi cho sale coi như của sale: sửa thì sale được báo, giá bán giữ nguyên.
- **Chuẩn bị:** hai máy: máy 1 tài khoản Chị Hoa, máy 2 tài khoản Sale Hùng (đóng app). Máy 1 ghi trước một đặt phòng: 1509, nhận 17/10, "2 đêm", người đặt Sale Hùng, tiền phòng 2.200.000 (US3-NT25). Giá bán của Hùng là 2.600.000đ (mức cộng +200k mỗi đêm, DLM.3).
- **Làm:**
  1. Máy 1: mở chi tiết đặt phòng 17/10 → 19/10 của Sale Hùng, bấm nút sửa đặt phòng.
  2. Máy 1: đổi "Tiền phòng (đ)" thành 2.000.000, bấm "Lưu thay đổi".
  3. Máy 2: mở app.
  4. Máy 2: chạm dòng thông báo "Chị Hoa đã sửa đặt phòng của bạn".
- **Mong đợi:**
  - Bước 3: có thông báo "Chị Hoa đã sửa đặt phòng của bạn" kèm 1509 và giá chủ nhà 2.200.000đ đổi thành 2.000.000đ.
  - Bước 4: "Giá bán cho khách 2.600.000đ" (giữ như đã báo khách), "Giá chủ nhà 2.000.000đ".
- **Nguồn:** mục "Sửa booking" bước 4, 5, mục "Booking chủ nhà ghi cho sale" (US3) bước 6, QT3.1

### US3-KB52 · Chủ nhà khác không thấy đặt phòng của Chị Hoa `[Quyền]`
- **Mục đích:** chi tiết, sửa, xóa đặt phòng chỉ có với căn của mình.
- **Chuẩn bị:** vào app bằng tài khoản Anh Tuấn (Sapphire 1103, À La Carte 2208, DLM.3).
- **Làm:**
  1. Tab Lịch, chạm ngày 10/10.
  2. Kéo xuống "Đặt phòng sắp tới".
- **Mong đợi:**
  - Chi tiết ngày chỉ có Sapphire 1103, À La Carte 2208. Không có 1509, 3402, không có B1.
  - "Đặt phòng sắp tới" không có dòng nào của 1509, 3402.
- **Nguồn:** PQ7.CHU, PQ9.CHU

### US3-KB53 · Chị Hoa ghi đặt phòng cho Sale Hùng `[Chính]`
- **Mục đích:** chủ nhà chọn sale làm người đặt, ghi được đặt phòng, lịch hiện ngay, chủ nhà không thấy giá bán.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa.
- **Làm:**
  1. Tab Lịch, bấm "Đặt phòng".
  2. Chọn "1509", ngày nhận phòng 17/10, chọn "2 đêm".
  3. Ở "Khách / Sale", chọn "Sale Hùng".
  4. Xem ô "Tiền phòng (đ)".
  5. Chọn "Chưa cọc".
  6. Bấm "Thêm đặt phòng".
  7. Mở chi tiết đặt phòng vừa ghi, kéo hết xuống dưới.
- **Mong đợi:**
  - Bước 4: ô điền sẵn 2.200.000, dòng tách "17/10: 1.300.000đ" (T7), "18/10: 900.000đ" (CN).
  - Bước 6: toast "Đã thêm đặt phòng Sale Hùng · 1509" ở đầu màn. Chi tiết ngày 17/10 mở sẵn, 1509 ghi "Sale Hùng", "17/10 → 19/10 (2 đêm)", "2.200.000đ".
  - Bước 7: "Tiền phòng 2.200.000đ". Không chỗ nào có 2.600.000đ, chữ "giá bán" hay mức cộng.
- **Nguồn:** US3-NT25, US3-NT1, QT4.1-VD1, PQ11.CHU

### US3-KB54 · Sale Hùng thấy đặt phòng với giá bán và tiền chênh `[Chính]`
- **Mục đích:** đặt phòng chủ nhà ghi coi như của sale: giá bán tự tính theo mức cộng.
- **Chuẩn bị:** hai máy: máy 1 tài khoản Chị Hoa, máy 2 tài khoản Sale Hùng. Máy 1 làm US3-KB53 bước 1 đến 6.
- **Làm:**
  1. Máy 2: mở app bằng tài khoản Sale Hùng.
  2. Máy 2: mở đặt phòng ICON40 1509, 17/10 → 19/10 (từ thông báo hoặc từ danh sách đặt phòng của Hùng).
- **Mong đợi:**
  - Thấy căn 1509, chủ nhà Chị Hoa, "17/10 → 19/10 (2 đêm)".
  - Giá chủ nhà 2.200.000đ, giá bán cho khách 2.600.000đ (2.200.000đ + 200.000đ × 2 đêm), tiền chênh 400.000đ.
- **Nguồn:** US3-NT25, QT3.1-VD3, DLM.3

### US3-KB55 · Sale Hùng nhận thông báo `[Chính]`
- **Mục đích:** sale biết chủ nhà vừa ghi đặt phòng cho mình mà không nhận tin Zalo.
- **Chuẩn bị:** hai máy: máy 1 tài khoản Chị Hoa, máy 2 tài khoản Sale Hùng. Máy 2 đóng app.
- **Làm:**
  1. Máy 1: làm US3-KB53 bước 1 đến 6.
  2. Máy 2: mở app.
  3. Máy 2: vào Thông báo (P13).
- **Mong đợi:**
  - Bước 2: popup thông báo mới có thông báo này, chưa đọc.
  - Bước 3: P13 có thông báo "chủ ghi đặt phòng cho bạn" kèm căn 1509 và ngày ở 17/10 → 19/10.
  - Không có hộp thoại hay tin nhắn Zalo nào.
  - Thông báo không có tên hay số khách của chủ nhà.
- **Nguồn:** US3-NT26

### US3-KB56 · Sale Hùng sửa giá bán, chủ nhà không thấy `[Quyền]`
- **Mục đích:** giá bán là của sale; tiền chênh đổi theo; chủ nhà vẫn chỉ thấy tiền phòng.
- **Chuẩn bị:** hai máy: máy 1 tài khoản Chị Hoa, máy 2 tài khoản Sale Hùng. Đã làm US3-KB53.
- **Làm:**
  1. Máy 2: mở đặt phòng 1509, 17/10 → 19/10.
  2. Máy 2: sửa giá bán cho khách thành 2.700.000, lưu.
  3. Máy 1: mở lại chi tiết đặt phòng 17/10 → 19/10, kéo hết xuống dưới.
- **Mong đợi:**
  - Bước 2: giá bán 2.700.000đ, tiền chênh 500.000đ (2.700.000đ − 2.200.000đ), giá chủ nhà vẫn 2.200.000đ.
  - Bước 3: "Tiền phòng 2.200.000đ". Không có 2.700.000đ, chữ "giá bán" hay tiền chênh.
  - Chị Hoa không nhận thông báo về việc sale đổi giá.
- **Nguồn:** US3-NT54, PQ11.CHU, PQ11.SALE

### US3-KB57 · Ghi cho khách lẻ thì không sale nào được báo `[Chính]`
- **Mục đích:** đặt phòng khách lẻ không dính tới sale nào.
- **Chuẩn bị:** ba máy: máy 1 tài khoản Chị Hoa, máy 2 tài khoản Sale Hùng, máy 3 tài khoản Sale Lan. Máy 2 và máy 3 đóng app.
- **Làm:**
  1. Máy 1: tab Lịch, bấm "Đặt phòng". Chọn "1509", ngày nhận phòng 17/10, "2 đêm", "Khách lẻ", "Chưa cọc". Bấm "Thêm đặt phòng".
  2. Máy 2 và máy 3: mở app.
  3. Máy 2: mở Thống kê, tháng 10.
- **Mong đợi:**
  - Bước 2: cả hai máy không có thông báo mới về đặt phòng 1509, 17/10 → 19/10.
  - Bước 3: Hùng vẫn 6 đặt phòng, doanh số 10.600.000đ, tiền chênh 1.600.000đ.
- **Nguồn:** US3-NT28, DLM.6

### US3-KB58 · Đặt phòng vào thống kê của Sale Hùng `[Chính]`
- **Mục đích:** đặt phòng chủ nhà ghi tính vào số của sale.
- **Chuẩn bị:** hai máy: máy 1 tài khoản Chị Hoa, máy 2 tài khoản Sale Hùng. Máy 1 làm US3-KB53 bước 1 đến 6. Cần US19 xong.
- **Làm:**
  1. Máy 2: mở app bằng tài khoản Sale Hùng.
  2. Máy 2: mở Thống kê, tháng 10.
  3. Máy 2: mở danh sách đặt phòng của Hùng (S7-03).
- **Mong đợi:**
  - Đặt phòng 7, doanh số 13.200.000đ (10.600.000đ + 2.600.000đ), tiền chênh 2.000.000đ (1.600.000đ + 400.000đ).
  - Danh sách có dòng ICON40 1509 · 17/10 → 19/10.
- **Nguồn:** mục "Booking chủ nhà ghi cho sale" bước 5, QT3.1-VD3, DLM.6

### US3-KB59 · Ghi cho sale vào đêm đã có khách `[Lỗi]`
- **Mục đích:** trùng đêm thì không lưu, sale không bị báo nhầm.
- **Chuẩn bị:** hai máy: máy 1 tài khoản Chị Hoa, máy 2 tài khoản Sale Hùng (đóng app). B1 giữ 1509 đêm 10/10, 11/10.
- **Làm:**
  1. Máy 1: tab Lịch, bấm "Đặt phòng".
  2. Chọn "1509", ngày nhận phòng 11/10, chọn "2 đêm".
  3. Chọn "Sale Hùng", "Chưa cọc".
  4. Bấm "Thêm đặt phòng".
  5. Máy 2: mở app.
- **Mong đợi:**
  - Sau bước 2: dòng báo trùng lịch (đêm 11/10 thuộc B1), không có chữ "không trùng lịch".
  - Sau bước 4: không có toast, vẫn ở form, nội dung giữ nguyên.
  - Bước 5: không có thông báo mới về đặt phòng này. Ngày 11/10 của 1509 vẫn chỉ có B1.
- **Nguồn:** QT1.1-VD1, mục "Booking chủ nhà ghi cho sale" bước 1

### US3-KB60 · Bấm lưu hai lần liền, sale chỉ nhận một thông báo `[Mạng]`
- **Mục đích:** bấm hai lần chỉ ghi một đặt phòng và một thông báo.
- **Chuẩn bị:** hai máy: máy 1 tài khoản Chị Hoa, máy 2 tài khoản Sale Hùng (đóng app).
- **Làm:**
  1. Máy 1: tab Lịch, bấm "Đặt phòng". Chọn "1509", ngày nhận phòng 17/10, "2 đêm", "Sale Hùng", "Chưa cọc".
  2. Máy 1: bấm "Thêm đặt phòng" hai lần thật nhanh.
  3. Máy 2: mở app, vào Thông báo (P13).
- **Mong đợi:**
  - Bước 2: nút đổi chữ thành "Đang lưu…", chỉ một toast. Chi tiết ngày 17/10 của 1509 có đúng một đặt phòng.
  - Bước 3: đúng một thông báo "chủ ghi đặt phòng cho bạn".
- **Nguồn:** HV1-NT1, mục "Booking chủ nhà ghi cho sale" bước 1

### US3-KB61 · Sale khác chỉ thấy "Kín" `[Quyền]`
- **Mục đích:** sale khác không thấy tên sale, giá hay thông báo của đặt phòng này.
- **Chuẩn bị:** hai máy: máy 1 tài khoản Chị Hoa, máy 2 tài khoản Sale Lan. Máy 1 làm US3-KB53 bước 1 đến 6.
- **Làm:**
  1. Máy 2: mở app bằng tài khoản Sale Lan.
  2. Máy 2: xem lịch trống của 1509 ở ngày 17/10 và 18/10.
  3. Máy 2: vào Thông báo (P13).
- **Mong đợi:**
  - Bước 2: 17/10 và 18/10 của 1509 ghi "Kín", không có tên Sale Hùng, không có giá.
  - Bước 3: không có thông báo nào về đặt phòng này.
- **Nguồn:** US6-NT11, PQ4.SALE, PQ7.SALE, PQ19.SALE

### US3-KB62 · Mức cộng theo từng căn `[Biên]`
- **Mục đích:** giá bán dùng mức cộng của sale cho đúng căn đó, không dùng chung một số.
- **Chuẩn bị:** hai máy: máy 1 tài khoản Chị Hoa, máy 2 tài khoản Sale Hùng. Mức cộng của Hùng: 1509 +200k, 3402 +400k mặc định (DLM.3).
- **Làm:**
  1. Máy 1: tab Lịch, bấm "Đặt phòng".
  2. Chọn "3402", ngày nhận phòng 22/10, chọn "1 đêm".
  3. Chọn "Sale Hùng", "Chưa cọc". Xem ô "Tiền phòng (đ)".
  4. Bấm "Thêm đặt phòng".
  5. Máy 2: mở đặt phòng 3402, 22/10 → 23/10.
- **Mong đợi:**
  - Bước 3: tiền phòng điền sẵn 800.000 (22/10 là T5).
  - Bước 5: giá chủ nhà 800.000đ, giá bán cho khách 1.200.000đ (800.000đ + 400.000đ × 1 đêm), tiền chênh 400.000đ.
- **Nguồn:** mục "Booking chủ nhà ghi cho sale" bước 1, DLM.3
