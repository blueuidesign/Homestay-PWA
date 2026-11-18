# Kịch bản kiểm tay US2 · Chủ nhà xem lịch tháng và chi tiết ngày

Story: `docs/stories/US2-lich-thang-chu-nha.md`. Cách chạy và cách ghi kết quả: `tests/kich-ban/README.md`.

Dữ liệu: bộ mẫu ở `docs/luat-chung/Du_lieu_mau.md`, nạp vào staging bằng `supabase/staging/du_lieu_mau.sql`. Kịch bản ghi "nạp lại" thì chạy lại file đó trước.
Kịch bản viết cho bản Zalo, số liệu theo ngày 07/10/2026 của bộ mẫu. Bước nào nói tới cửa sổ hay quyền của Zalo thì làm theo `docs/luat-chung/PWA.md`. Kịch bản gắn `[Zalo]` chỉ chạy ở bản Zalo.

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
- **Nguồn:** YC2.1-NT1, YC2.1 bước 1

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
- **Nguồn:** YC2.1-NT5, YC2.1 trạng thái rỗng (CN1-00)

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
- **Nguồn:** YC2 quy tắc Tuần bắt đầu thứ hai, DLM.1

### US2-KB4 · Chạm một ngày để xem chi tiết `[Chính]`
- **Mục đích:** chủ nhà chạm một ngày là thấy ngay ngày đó của từng căn.
- **Chuẩn bị:** Chị Hoa ở tab Lịch, Tháng 10/2026.
- **Làm:**
  1. Chạm ngày 10.
- **Mong đợi:**
  - Ngày 10 được chọn trên lưới.
  - Ngay dưới lưới hiện "Ngày 10/10/2026".
  - Có một khối cho 1509 và một khối cho 3402.
- **Nguồn:** YC2.4-NT1, YC2.4 bước 1

### US2-KB5 · Chạm ngày đầu và ngày cuối tháng `[Biên]`
- **Mục đích:** ngày ở hai mép lưới cũng mở đúng chi tiết.
- **Chuẩn bị:** Chị Hoa ở tab Lịch, Tháng 10/2026.
- **Làm:**
  1. Chạm ngày 1.
  2. Chạm ngày 31.
- **Mong đợi:**
  - Sau bước 1: dưới lưới ghi "Ngày 01/10/2026".
  - Sau bước 2: dưới lưới ghi "Ngày 31/10/2026".
- **Nguồn:** YC2.4-NT1

### US2-KB6 · Chạm ngày khác thì chi tiết đổi theo `[Chính]`
- **Mục đích:** chi tiết luôn là ngày vừa chạm, không giữ ngày cũ.
- **Chuẩn bị:** Chị Hoa ở tab Lịch, đang xem chi tiết ngày 10 (sau KB4).
- **Làm:**
  1. Chạm ngày 11.
- **Mong đợi:**
  - Dưới lưới ghi "Ngày 11/10/2026", không còn "Ngày 10/10/2026".
  - Ngày 11 được chọn trên lưới, ngày 10 bỏ chọn.
- **Nguồn:** YC2.4-NT1

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
- **Nguồn:** YC2.1-NT2, YC2.1 bước 3, YC2.4 bước 1

### US2-KB8 · Chủ nhà khác không thấy lịch của Chị Hoa `[Quyền]`
- **Mục đích:** mỗi chủ nhà chỉ thấy lịch căn của mình.
- **Chuẩn bị:** Chị Hoa có căn 1509, 3402. Máy thứ hai đăng nhập Zalo Anh Tuấn.
- **Làm:**
  1. Anh Tuấn mở app, mở tab Lịch.
  2. Chạm ngày 10.
- **Mong đợi:**
  - Sau bước 1: hàng chip là "Cả 2 phòng", "Sapphire 1103", "À La Carte 2208". Không có chip 1509 hay 3402.
  - Sau bước 2: dưới "Ngày 10/10/2026" chỉ có khối Sapphire 1103 và À La Carte 2208.
- **Nguồn:** PQ4.CHU, YC2.1-NT1, YC2.4-NT1

### US2-KB9 · Mở lại tab Lịch đã xem `[Mạng]`
- **Mục đích:** lịch đã xem hiện ngay, không có màn trống.
- **Chuẩn bị:** Chị Hoa vừa mở tab Lịch và thấy lưới tháng.
- **Làm:**
  1. Mở tab Căn.
  2. Mở lại tab Lịch.
- **Mong đợi:**
  - Lịch cũ hiện ngay, không có màn trống hay khung xám.
  - Nếu đang lấy dữ liệu mới thì có dòng nhỏ "Đang cập nhật…" ở đầu màn.
- **Nguồn:** HV1-NT2, HV1 bước 2, YC2.1 đang tải

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
- **Nguồn:** HV2-NT3, HV2 bước 1, 4, YC2.1 lỗi mạng

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
- **Nguồn:** HV2 bước 2, YC2.1 lỗi mạng

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
- **Nguồn:** HV3 bước 2, YC2.1 quay lại từ nền, YC2.4 quay lại từ nền
