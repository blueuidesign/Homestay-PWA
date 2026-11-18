# Kịch bản kiểm tay US2 · Chủ nhà xem lịch: tháng, chi tiết ngày, doanh thu tháng, đặt phòng sắp tới, lịch tuần

Story: `docs/stories/US2-lich-chu-nha.md`. Cách chạy và cách ghi kết quả: `tests/kich-ban/README.md`.

Dữ liệu: bộ mẫu ở `docs/luat-chung/Du_lieu_mau.md`, nạp vào staging bằng `supabase/staging/du_lieu_mau.sql`. Kịch bản ghi "nạp lại" thì chạy lại file đó trước.

Các kịch bản dưới đây gộp từ nhiều story cũ ngày 18/11/2026 (QD-020) và còn viết cho bản Zalo, số liệu theo ngày 07/10/2026 của bộ mẫu. Chưa sửa theo story đã viết lại: việc này nằm trong mục "Việc cần làm" của story. Bước nào nói tới cửa sổ hay quyền của Zalo thì làm theo `docs/luat-chung/PWA.md`. Kịch bản gắn `[Zalo]` chỉ chạy ở bản Zalo.

### US2-KB1 · Lịch tháng với 2 căn `[Chính]`
- **Mục đích:** chủ nhà 2 căn thấy lịch tháng và chip từng căn.
- **Chuẩn bị:** Chị Hoa có 2 căn 1509, 3402.
- **Làm:**
  1. Mở app.
  2. Mở tab Lịch.
- **Mong đợi:**
  - Tiêu đề "Lịch", có nút "Đặt phòng".
  - Thanh tháng ghi "T09", "Tháng 10/2026", "T11".
  - Hàng chip: "Cả 2 phòng", "1509", "3402".
- **Nguồn:** US2-NT1

### US2-KB2 · Lịch khi chưa có đặt phòng `[Chính]`
- **Mục đích:** chủ nhà mới biết bước tiếp theo khi lịch còn trống.
- **Chuẩn bị:** Chị Hoa có 2 căn, chưa có đặt phòng nào.
- **Làm:**
  1. Mở tab Lịch.
- **Mong đợi:**
  - Thấy "Chưa có đặt phòng nào" và câu "Bấm "Đặt phòng" để thêm khách đầu tiên. Ngày có khách sẽ tô màu theo phòng".
  - Có nút "Đặt phòng".
  - Có gợi ý "Mời sale xem lịch để sale tự biết ngày trống, không phải gọi hỏi. Vào tab Sale."
  - Không ngày nào trên lưới được tô màu.
- **Nguồn:** US2-NT6

### US2-KB3 · Tuần bắt đầu thứ hai `[Biên]`
- **Mục đích:** lưới tháng xếp ngày đúng thứ, tuần từ T2 tới CN.
- **Chuẩn bị:** Chị Hoa ở tab Lịch, Tháng 10/2026.
- **Làm:**
  1. Xem hàng tên thứ trên lưới.
  2. Xem hàng đầu và hàng cuối của lưới.
- **Mong đợi:**
  - Hàng tên thứ: T2 T3 T4 T5 T6 T7 CN.
  - Ngày 1 nằm ở cột T5; ba ô T2, T3, T4 trước nó không có số.
  - Ngày 31 nằm ở cột T7.
- **Nguồn:** nhóm Lịch chủ nhà quy tắc Tuần bắt đầu thứ hai, DLM.1

### US2-KB4 · Chạm một ngày để xem chi tiết `[Chính]`
- **Mục đích:** chủ nhà chạm một ngày là thấy ngay ngày đó của từng căn.
- **Chuẩn bị:** Chị Hoa ở tab Lịch, Tháng 10/2026.
- **Làm:**
  1. Chạm ngày 10.
- **Mong đợi:**
  - Ngày 10 được chọn trên lưới.
  - Ngay dưới lưới hiện "Ngày 10/10/2026".
  - Có một khối cho 1509 và một khối cho 3402.
- **Nguồn:** US2-NT7

### US2-KB5 · Chạm ngày đầu và ngày cuối tháng `[Biên]`
- **Mục đích:** ngày ở hai mép lưới cũng mở đúng chi tiết.
- **Chuẩn bị:** Chị Hoa ở tab Lịch, Tháng 10/2026.
- **Làm:**
  1. Chạm ngày 1.
  2. Chạm ngày 31.
- **Mong đợi:**
  - Sau bước 1: dưới lưới ghi "Ngày 01/10/2026".
  - Sau bước 2: dưới lưới ghi "Ngày 31/10/2026".
- **Nguồn:** US2-NT7

### US2-KB6 · Chạm ngày khác thì chi tiết đổi theo `[Chính]`
- **Mục đích:** chi tiết luôn là ngày vừa chạm, không giữ ngày cũ.
- **Chuẩn bị:** Chị Hoa ở tab Lịch, đang xem chi tiết ngày 10 (sau KB4).
- **Làm:**
  1. Chạm ngày 11.
- **Mong đợi:**
  - Dưới lưới ghi "Ngày 11/10/2026", không còn "Ngày 10/10/2026".
  - Ngày 11 được chọn trên lưới, ngày 10 bỏ chọn.
- **Nguồn:** US2-NT7

### US2-KB7 · Lịch tháng với 3 căn `[Chính]`
- **Mục đích:** từ 3 căn, chip đầu đổi thành "Tất cả".
- **Chuẩn bị:** Chị Hoa có 2 căn 1509, 3402.
- **Làm:**
  1. Mở tab Căn, bấm "Thêm căn".
  2. Gõ "2501", chọn chip "1PN".
  3. Bấm "Thêm căn".
  4. Mở tab Lịch.
  5. Chạm ngày 10.
- **Mong đợi:**
  - Sau bước 4: hàng chip là "Tất cả", "1509", "3402", "2501". Không còn chip "Cả 2 phòng".
  - Sau bước 5: dưới "Ngày 10/10/2026" có ba khối: 1509, 3402, 2501.
- **Nguồn:** US2-NT2

### US2-KB8 · Chủ nhà khác không thấy lịch của Chị Hoa `[Quyền]`
- **Mục đích:** mỗi chủ nhà chỉ thấy lịch căn của mình.
- **Chuẩn bị:** Chị Hoa có căn 1509, 3402. Máy thứ hai đăng nhập Zalo Anh Tuấn.
- **Làm:**
  1. Anh Tuấn mở app, mở tab Lịch.
  2. Chạm ngày 10.
- **Mong đợi:**
  - Sau bước 1: hàng chip là "Cả 2 phòng", "Sapphire 1103", "À La Carte 2208". Không có chip 1509 hay 3402.
  - Sau bước 2: dưới "Ngày 10/10/2026" chỉ có khối Sapphire 1103 và À La Carte 2208.
- **Nguồn:** US2-NT1, US2-NT7, PQ4.CHU

### US2-KB9 · Mở lại tab Lịch đã xem `[Mạng]`
- **Mục đích:** lịch đã xem hiện ngay, không có màn trống.
- **Chuẩn bị:** Chị Hoa vừa mở tab Lịch và thấy lưới tháng.
- **Làm:**
  1. Mở tab Căn.
  2. Mở lại tab Lịch.
- **Mong đợi:**
  - Lịch cũ hiện ngay, không có màn trống hay khung xám.
  - Nếu đang lấy dữ liệu mới thì có dòng nhỏ "Đang cập nhật…" ở đầu màn.
- **Nguồn:** HV1-NT2, HV1 bước 2, mục "Lịch tháng và lọc theo căn" đang tải

### US2-KB10 · Mất mạng khi đang xem lịch `[Mạng]`
- **Mục đích:** mất sóng vẫn xem được lịch đã tải, và biết lịch có thể cũ.
- **Chuẩn bị:** Chị Hoa đang ở tab Lịch, lưới đã hiện.
- **Làm:**
  1. Bật chế độ máy bay.
  2. Cuộn lịch lên xuống.
  3. Tắt chế độ máy bay.
- **Mong đợi:**
  - Sau bước 1: dải vàng ở đầu màn "Mất kết nối. Lịch có thể chưa mới nhất." Lưới tháng vẫn hiện.
  - Sau bước 2: lịch vẫn cuộn được.
  - Sau bước 3: dải vàng tự mất.
- **Nguồn:** HV2-NT3, HV2 bước 1, 4, mục "Lịch tháng và lọc theo căn" lỗi mạng

### US2-KB11 · Mở tab Lịch lần đầu khi mất mạng `[Mạng]`
- **Mục đích:** chưa có dữ liệu thì người dùng biết phải làm gì.
- **Chuẩn bị:** Zalo Chị Hoa đăng nhập trên một máy chưa từng mở tab Lịch của Chị Hoa. Mở app, đang ở tab Căn.
- **Làm:**
  1. Bật chế độ máy bay.
  2. Mở tab Lịch.
  3. Tắt chế độ máy bay.
  4. Bấm "Thử lại".
- **Mong đợi:**
  - Sau bước 2: giữa màn "Chưa tải được. Kiểm tra mạng rồi bấm Thử lại", nút "Thử lại".
  - Sau bước 4: lịch Tháng 10/2026 hiện với chip "Cả 2 phòng", "1509", "3402".
- **Nguồn:** HV2 bước 2, mục "Lịch tháng và lọc theo căn" lỗi mạng

### US2-KB12 · Rời app rồi quay lại tab Lịch `[Mạng]`
- **Mục đích:** gọi điện xong quay lại vẫn ở đúng lịch.
- **Chuẩn bị:** Chị Hoa ở tab Lịch, Tháng 10/2026.
- **Làm:**
  1. Chạm ngày 10.
  2. Rời app.
  3. Đợi 1 phút.
  4. Mở lại Zalo.
- **Mong đợi:**
  - Vẫn ở tab Lịch, Tháng 10/2026.
  - Không hiện màn trống hay màn lỗi.
- **Nguồn:** HV3 bước 2, mục "Lịch tháng và lọc theo căn" quay lại từ nền, mục "Chi tiết một ngày" quay lại từ nền

### US2-KB13 · Khối doanh thu tháng 10 `[Chính]`
- **Mục đích:** chủ nhà thấy đúng doanh thu và số đêm có khách của tháng.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa.
- **Làm:**
  1. Mở tab Lịch, tháng 10/2026.
  2. Kéo xuống dưới lưới tháng.
- **Mong đợi:**
  - Khối "DOANH THU THÁNG 10" ghi "11.800.000đ".
  - Dòng nhỏ "13 đêm có khách · tháng 9: 9.600.000đ".
- **Nguồn:** US2-NT10, QT2.2-VD2, DLM.5

### US2-KB14 · Chưa có đặt phòng thì không có khối doanh thu `[Biên]`
- **Mục đích:** chủ nhà mới không thấy khối doanh thu trống.
- **Chuẩn bị:** một tài khoản chủ nhà thử có 1 căn, chưa có đặt phòng nào.
- **Làm:**
  1. Mở tab Lịch.
  2. Kéo xuống dưới lưới tháng.
- **Mong đợi:**
  - Thấy "Chưa có đặt phòng nào" và nút "Đặt phòng" (CN1-00).
  - Không có khối "DOANH THU THÁNG", không có mục "Đặt phòng sắp tới".
- **Nguồn:** US2-NT11

### US2-KB15 · Danh sách đặt phòng sắp tới `[Chính]`
- **Mục đích:** mỗi dòng đủ tên, phòng, ngày, số đêm, tiền và trạng thái tiền, xếp theo ngày nhận.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa.
- **Làm:**
  1. Mở tab Lịch.
  2. Kéo xuống mục "ĐẶT PHÒNG SẮP TỚI".
- **Mong đợi:**
  - Sáu dòng đầu theo thứ tự:
    1. Sale Hùng · Phòng 1509 · 10/10 → 12/10 (2 đêm) · 2.200.000đ · Cọc 1.000.000đ
    2. Khách lẻ · Phòng 1509 · 13/10 → 15/10 (2 đêm) · 1.800.000đ · Chưa cọc
    3. Khách lẻ · Phòng 3402 · 14/10 → 15/10 (1 đêm) · 800.000đ · Đã thanh toán
    4. Sale Lan · Phòng 3402 · 17/10 → 19/10 (2 đêm) · 1.900.000đ · Chưa cọc
    5. Sale Minh · Phòng 1509 · 19/10 → 20/10 (1 đêm) · 900.000đ · Đã thanh toán
    6. Sale Minh · Phòng 3402 · 21/10 → 22/10 (1 đêm) · 800.000đ · Đã thanh toán
- **Nguồn:** US2-NT12, DLM.5

### US2-KB16 · Đặt phòng chưa cọc ghi "Chưa cọc" `[Chính]`
- **Mục đích:** chủ nhà nhận ra ngay đặt phòng chưa thu tiền.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa.
- **Làm:**
  1. Mở tab Lịch, kéo xuống "ĐẶT PHÒNG SẮP TỚI".
  2. Xem dòng Khách lẻ 1509 13/10 → 15/10 và dòng Sale Lan 3402 17/10 → 19/10.
- **Mong đợi:**
  - Hai dòng đó ghi "Chưa cọc".
  - Dòng Sale Hùng 1509 10/10 → 12/10 không ghi "Chưa cọc".
- **Nguồn:** US2-NT13

### US2-KB17 · Đặt phòng trả phòng hôm nay không còn là sắp tới `[Biên]`
- **Mục đích:** chỉ đặt phòng có ngày trả sau hôm nay mới hiện.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa, hôm nay 07/10.
- **Làm:**
  1. Mở tab Lịch, kéo xuống "ĐẶT PHÒNG SẮP TỚI".
- **Mong đợi:**
  - Không có dòng Sale Lan 3402 05/10 → 07/10 (trả hôm nay).
  - Không có dòng Sale Hùng 1509 04/10 → 06/10 (đã trả).
- **Nguồn:** mục "Booking sắp tới" bước 1 (ngày trả sau hôm nay, giờ Việt Nam)

### US2-KB18 · Chạm một dòng mở chi tiết đặt phòng `[Chính]`
- **Mục đích:** từ danh sách đi thẳng tới chi tiết.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa.
- **Làm:**
  1. Mở tab Lịch, kéo xuống "ĐẶT PHÒNG SẮP TỚI".
  2. Chạm dòng Sale Hùng 1509 10/10 → 12/10.
- **Mong đợi:**
  - Mở "Đặt phòng · Sale Hùng", "Phòng 1509", "10/10 → 12/10 (2 đêm)", "Tiền phòng 2.200.000đ", "Đã cọc 1.000.000đ", "Còn lại 1.200.000đ".
  - Không có giá bán của sale (2.600.000đ).
- **Nguồn:** mục "Booking sắp tới" bước 2, PQ8.CHU, PQ11.CHU

### US2-KB19 · Chưa có đặt phòng sắp tới `[Biên]`
- **Mục đích:** có đặt phòng cũ nhưng không có đặt phòng sắp tới thì thấy câu hướng dẫn.
- **Chuẩn bị:** tài khoản chủ nhà thử có 1 căn, chỉ có một đặt phòng Khách lẻ 05/10 → 07/10 (trả hôm nay).
- **Làm:**
  1. Mở tab Lịch, kéo xuống mục "Đặt phòng sắp tới".
- **Mong đợi:**
  - Mục ghi "Chưa có đặt phòng sắp tới" và "Bấm "Thêm đặt phòng" để ghi khách đầu tiên." (CN1-01).
  - Lưới tháng vẫn tô đêm 05/10, 06/10.
- **Nguồn:** mục "Booking sắp tới" trạng thái rỗng (CN1-01)

### US2-KB20 · Lịch tuần: mỗi căn một hàng, tuần bắt đầu T2 `[Chính]`
- **Mục đích:** bảng tuần đúng khung căn × ngày.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa.
- **Làm:**
  1. Mở Lịch tuần.
- **Mong đợi:**
  - Tiêu đề "Lịch tuần", thanh tuần "Trước", "05 – 11/10/2026", "Sau".
  - Hai hàng: 1509 (2PN · ICON40) và 3402.
  - Bảy cột từ trái sang: T2 05, T3 06, T4 07, T5 08, T6 09, T7 10, CN 11.
  - Chú thích "Đã cọc / đã thanh toán", "Chưa cọc", "800k: trống, giá đêm".
- **Nguồn:** US2-NT15

### US2-KB21 · Ô trống hiện giá đêm, ô có khách là thanh `[Chính]`
- **Mục đích:** giá đêm đúng loại đêm, rút gọn đúng; đêm có khách đúng ngày.
- **Chuẩn bị:** như US2-KB20.
- **Làm:**
  1. Mở Lịch tuần, tuần 05 – 11/10/2026.
  2. Xem hàng 1509 rồi hàng 3402.
- **Mong đợi:**
  - Hàng 1509: T2 05 thanh "Sale Hùng" nhãn đã thanh toán; T3 06 900k; T4 07 900k; T5 08 900k; T6 09 1,3tr; T7 10 và CN 11 một thanh nối "Sale Hùng" nhãn "Đã cọc".
  - Hàng 3402: T2 05 và T3 06 một thanh nối "Sale Lan" nhãn đã thanh toán; T4 07 800k (ngày trả của Sale Lan, không phải đêm có khách); T5 08 800k; T6 09 1,1tr; T7 10 1,1tr; CN 11 800k.
- **Nguồn:** US2-NT16, QT2.1-VD1

### US2-KB22 · Ô tóm tắt "Chưa cọc" đếm đúng `[Chính]`
- **Mục đích:** số đặt phòng chưa cọc trong tuần đúng.
- **Chuẩn bị:** như US2-KB20.
- **Làm:**
  1. Mở Lịch tuần, tuần 05 – 11/10/2026. Xem ô "Chưa cọc".
  2. Bấm "Sau" sang tuần 12 – 18/10/2026. Xem ô "Chưa cọc".
- **Mong đợi:**
  - Tuần 05 – 11/10: "Chưa cọc 0 đặt phòng".
  - Tuần 12 – 18/10: "Chưa cọc 2 đặt phòng" (Khách lẻ 1509 13/10 → 15/10, Sale Lan 3402 17/10 → 19/10). Hai thanh đó có nhãn "Chưa cọc".
- **Nguồn:** US2-NT18

### US2-KB23 · Lọc theo tòa `[Chính]`
- **Mục đích:** chip tòa chỉ để lại căn của tòa đó.
- **Chuẩn bị:** như US2-KB20. 1509 thuộc ICON40, 3402 chưa ghi tòa.
- **Làm:**
  1. Mở Lịch tuần.
  2. Chạm chip "ICON40".
  3. Chạm chip "Tất cả".
- **Mong đợi:**
  - Bước 2 bảng chỉ còn hàng 1509.
  - Bước 3 bảng có lại cả 1509 và 3402.
- **Nguồn:** US2-NT17

### US2-KB24 · Tuần chưa có đặt phòng `[Biên]`
- **Mục đích:** tuần trống hiện thẻ báo, không phải bảng rỗng.
- **Chuẩn bị:** như US2-KB20.
- **Làm:**
  1. Mở Lịch tuần.
  2. Bấm "Sau" ba lần, tới tuần 26/10 – 01/11/2026.
- **Mong đợi:**
  - Thẻ "26/10 – 01/11", câu "Tuần này chưa có đặt phòng nào. Mọi căn đều trống."
  - Có nút "Thêm đặt phòng". Bấm thì mở form đặt phòng.
- **Nguồn:** mục "Lịch tuần khi có nhiều căn" trạng thái rỗng (CN2-00)

### US2-KB25 · Gửi lịch cho sale từ lịch tuần `[Chính]`
- **Mục đích:** nút gửi lịch mở đúng màn.
- **Chuẩn bị:** như US2-KB20.
- **Làm:**
  1. Mở Lịch tuần.
  2. Bấm "Gửi lịch cho sale".
- **Mong đợi:**
  - Mở màn gửi lịch cho sale (CN10).
- **Nguồn:** mục "Lịch tuần khi có nhiều căn" bước 6

### US2-KB26 · Sale không thấy doanh thu của chủ nhà `[Quyền]`
- **Mục đích:** doanh thu, số đêm và danh sách đặt phòng của chủ nhà không lộ cho sale.
- **Chuẩn bị:** vào app bằng tài khoản Sale Hùng (đã kết nối Chị Hoa).
- **Làm:**
  1. Mở tab Lịch, xem lịch phòng có 1509 và 3402.
  2. Kéo hết xuống dưới.
- **Mong đợi:**
  - Không có khối "DOANH THU THÁNG", không có số 11.800.000đ.
  - Không có mục "ĐẶT PHÒNG SẮP TỚI" của Chị Hoa, không có tên "Khách lẻ", "Sale Lan", "Sale Minh".
- **Nguồn:** PQ16.SALE, PQ7.SALE, nhóm Lịch chủ nhà Ai thấy gì

### US2-KB27 · Mất mạng khi đang xem lịch `[Mạng]`
- **Mục đích:** lịch và số đã tải vẫn xem được khi mất sóng.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa, đã mở tab Lịch một lần.
- **Làm:**
  1. Mở tab Lịch, chờ tải xong.
  2. Bật chế độ máy bay.
  3. Kéo xuống "ĐẶT PHÒNG SẮP TỚI", rồi mở Lịch tuần.
  4. Tắt chế độ máy bay.
- **Mong đợi:**
  - Bước 2, 3: dải "Mất kết nối. Lịch có thể chưa mới nhất." ở đầu màn; lịch, khối doanh thu và danh sách vẫn hiện, vẫn cuộn được.
  - Lịch tuần chưa từng mở thì giữa màn ghi "Chưa tải được. Kiểm tra mạng rồi bấm Thử lại", nút "Thử lại".
  - Bước 4: dải cảnh báo tự mất, màn tải lại.
- **Nguồn:** HV2-NT3, HV2 bước 1, 2, 4

### US2-KB28 · Mở lại tab Lịch đã xem `[Mạng]`
- **Mục đích:** không có màn trống khi mở lại.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa, đã mở tab Lịch một lần.
- **Làm:**
  1. Chuyển sang tab Căn.
  2. Chuyển lại tab Lịch.
- **Mong đợi:**
  - Lịch, khối doanh thu và danh sách hiện ngay, không có khung xám trống. Có thể có dòng "Đang cập nhật…" ở đầu màn.
- **Nguồn:** HV1-NT2, HV1 bước 2

### US2-KB29 · Quay lại từ nền thấy đặt phòng mới `[Mạng]`
- **Mục đích:** quay lại app thì lịch và số tự cập nhật.
- **Chuẩn bị:** hai máy cùng tài khoản Chị Hoa.
- **Làm:**
  1. Máy 1: mở tab Lịch, ghi lại doanh thu tháng 10 (11.800.000đ).
  2. Máy 1: về màn hình chính của điện thoại.
  3. Máy 2: ghi đặt phòng Khách lẻ, 3402, nhận 08/10, 1 đêm, tiền phòng 800.000.
  4. Máy 1: mở lại Zalo.
- **Mong đợi:**
  - Máy 1 vẫn ở tab Lịch. Không cần kéo làm mới, khối doanh thu thành "12.600.000đ", "14 đêm có khách"; ô 08/10 của 3402 được tô.
- **Nguồn:** HV3 bước 2, mục "Tóm tắt tháng" bước 1 (doanh thu chia theo đêm, QD-010)

### US2-KB30 · Chủ nhà khác không thấy số và lịch của Chị Hoa `[Quyền]`
- **Mục đích:** doanh thu, lịch tuần, danh sách đặt phòng chỉ của chủ nhà đó.
- **Chuẩn bị:** vào app bằng tài khoản Anh Tuấn (Sapphire 1103, À La Carte 2208, DLM.3).
- **Làm:**
  1. Mở tab Lịch, kéo xuống dưới lưới tháng.
  2. Mở Lịch tuần.
- **Mong đợi:**
  - Không có số 11.800.000đ. Danh sách "ĐẶT PHÒNG SẮP TỚI" không có dòng nào của 1509, 3402.
  - Lịch tuần chỉ có hàng Sapphire 1103 và À La Carte 2208; không có hàng 1509, 3402.
- **Nguồn:** PQ16.CHU, PQ4.CHU, PQ7.CHU

### US2-KB31 · Ô trống giá dịp đặc biệt, thanh một đêm giữa tuần `[Biên]`
- **Mục đích:** ô trống hiện giá của đêm đó kể cả giá dịp; đặt phòng một đêm hiện một ô thanh.
- **Chuẩn bị:** như US2-KB20.
- **Làm:**
  1. Mở Lịch tuần.
  2. Bấm "Sau" hai lần, tới tuần 19 – 25/10/2026.
  3. Xem hàng 1509 rồi hàng 3402. Xem ô "Chưa cọc".
- **Mong đợi:**
  - Hàng 1509: T2 19 thanh "Sale Minh" nhãn đã thanh toán; T3 20 900k; T4 21 900k; T5 22 900k; T6 23 1,3tr; T7 24 1,3tr; CN 25 900k.
  - Hàng 3402: T2 19 800k; T3 20 800k; T4 21 thanh "Sale Minh" nhãn đã thanh toán; T5 22 800k (ngày trả của Sale Minh); T6 23 1,1tr; T7 24 và CN 25 đều 1,3tr (dịp đặc biệt).
  - Ô "Chưa cọc 0 đặt phòng".
- **Nguồn:** US2-NT16, DLM.3
