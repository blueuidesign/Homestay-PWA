# Kịch bản kiểm tay US5 · Chủ nhà mời sale bằng link, quản lý sale và cho số điện thoại

Story: `docs/stories/US5-gui-link-duyet-sale.md`. Cách chạy và cách ghi kết quả: `tests/kich-ban/README.md`.

Dữ liệu: bộ mẫu ở `docs/luat-chung/Du_lieu_mau.md`, nạp vào staging bằng `supabase/staging/du_lieu_mau.sql`. Kịch bản ghi "nạp lại" thì chạy lại file đó trước.
Kịch bản viết cho bản Zalo, số liệu theo ngày 07/10/2026 của bộ mẫu. Bước nào nói tới cửa sổ hay quyền của Zalo thì làm theo `docs/luat-chung/PWA.md`. Kịch bản gắn `[Zalo]` chỉ chạy ở bản Zalo.

### US5-KB1 · Tab Sale khi chưa có sale nào `[Biên]`
- **Mục đích:** chủ nhà chưa có sale thấy màn hướng dẫn gửi link, không phải danh sách trống.
- **Chuẩn bị:** vào app bằng Zalo thử A (Chủ nhà mới).
- **Làm:**
  1. Bấm tab "Sale".
- **Mong đợi:**
  - Thấy dòng "Chưa có sale nào xem lịch".
  - Có hai nút "Gửi link mời qua Zalo" và "Sao chép link".
  - Có khung "SALE SẼ THẤY" ghi phòng trống hay đã đặt và "Giá từng đêm".
- **Nguồn:** YC1.9-NT3

### US5-KB2 · Chủ nhà chưa có số bấm gửi link, chọn "Để sau" `[Zalo]`
- **Mục đích:** popup của app hiện trước hộp thoại Zalo; "Để sau" vẫn gửi được link.
- **Chuẩn bị:** Zalo thử A, đang ở tab Sale (CN7-00).
- **Làm:**
  1. Bấm "Gửi link mời qua Zalo".
  2. Xem popup, chưa bấm gì.
  3. Bấm "Để sau".
- **Mong đợi:**
  - Sau bước 1: popup hiện từ dưới đáy, có biểu tượng điện thoại, nút "Đồng ý, tiếp tục" và "Để sau". Chưa có hộp thoại nào của Zalo.
  - Sau bước 3: không có hộp thoại xin quyền. Zalo mở cửa sổ gửi tin, trong tin có link mời.
- **Nguồn:** YC1.9-NT5, YC1.5.1-NT1, YC1.5.1-NT3, quy tắc Xin số điện thoại đúng lúc

### US5-KB3 · Hồ sơ chưa có số sau khi chọn "Để sau" `[Chính]`
- **Mục đích:** "Để sau" không ghi số vào hồ sơ, P2 báo chưa có.
- **Chuẩn bị:** Zalo thử A, vừa xong KB2. Đóng cửa sổ gửi của Zalo, quay lại app.
- **Làm:**
  1. Bấm tab "Cá nhân".
  2. Bấm "Thông tin cá nhân".
- **Mong đợi:**
  - Ô Số điện thoại ghi "Chưa có · Zalo sẽ hỏi khi bạn kết nối lần đầu".
- **Nguồn:** YC1.5.3-NT2, YC1.5.1-NT3

### US5-KB4 · "Sao chép link" khi chưa có số `[Zalo]`
- **Mục đích:** nút "Sao chép link" cũng hỏi số trước, "Để sau" vẫn sao chép được.
- **Chuẩn bị:** Zalo thử A, tab Sale.
- **Làm:**
  1. Bấm "Sao chép link".
  2. Bấm "Để sau" trên popup.
  3. Mở Zalo, vào "Cloud của tôi".
  4. Giữ ngón tay ở ô nhập tin, chọn "Dán".
- **Mong đợi:**
  - Sau bước 1: popup giải thích hiện, chưa có hộp thoại Zalo.
  - Sau bước 4: ô nhập tin có link mời của app.
- **Nguồn:** YC1.5.1-NT1, YC1.9 bước 1a

### US5-KB5 · Từ chối trong hộp thoại của Zalo `[Zalo]`
- **Mục đích:** từ chối quyền không làm app báo lỗi hay treo.
- **Chuẩn bị:** Zalo thử A, tab Sale.
- **Làm:**
  1. Bấm "Gửi link mời qua Zalo".
  2. Bấm "Đồng ý, tiếp tục".
  3. Ở hộp thoại "Lịch phòng Hạ Long muốn sử dụng thông tin của bạn", bấm từ chối (hoặc đóng hộp thoại, không bấm "Cho phép").
- **Mong đợi:**
  - Không có thông báo lỗi. App quay về tab Sale, bấm được các nút khác.
  - Cá nhân > Thông tin cá nhân vẫn ghi "Chưa có · Zalo sẽ hỏi khi bạn kết nối lần đầu".
- **Nguồn:** HV4 bước 2, YC1.5.2 (trạng thái đã từ chối quyền Zalo)

### US5-KB6 · Bấm lại sau khi đã từ chối `[Zalo]`
- **Mục đích:** lần sau app hiện lại popup giải thích, chỉ gọi hộp thoại Zalo khi người dùng đồng ý.
- **Chuẩn bị:** Zalo thử A, vừa xong KB5.
- **Làm:**
  1. Bấm "Gửi link mời qua Zalo".
  2. Xem popup, chưa bấm gì.
  3. Bấm "Đồng ý, tiếp tục".
  4. Đóng hộp thoại Zalo, không bấm "Cho phép".
- **Mong đợi:**
  - Sau bước 1: popup giải thích hiện lại, có thêm nút "Mở cài đặt quyền". Chưa có hộp thoại Zalo.
  - Sau bước 3: hộp thoại xin quyền của Zalo hiện lại.
- **Nguồn:** HV4-NT2, HV4 bước 3a

### US5-KB7 · Nút "Mở cài đặt quyền" `[Zalo]`
- **Mục đích:** người đã từ chối biết chỗ bật lại quyền.
- **Chuẩn bị:** Zalo thử A, vừa xong KB6.
- **Làm:**
  1. Bấm "Gửi link mời qua Zalo".
  2. Bấm "Mở cài đặt quyền".
  3. Không đổi gì, quay lại app.
- **Mong đợi:**
  - Sau bước 2: Zalo mở trang cài đặt quyền của app.
  - Sau bước 3: app vẫn ở tab Sale, không báo lỗi.
- **Nguồn:** HV4 bước 4

### US5-KB8 · Cho phép tên và số điện thoại `[Zalo]`
- **Mục đích:** bấm "Đồng ý, tiếp tục" một lần là có cả tên và số, rồi link được gửi.
- **Chuẩn bị:** Zalo thử A, tab Sale.
- **Làm:**
  1. Bấm "Gửi link mời qua Zalo".
  2. Bấm "Đồng ý, tiếp tục".
  3. Ở hộp thoại Zalo, bật công tắc Số điện thoại, bấm "Cho phép". Nếu Zalo hiện hai hộp thoại nối nhau, cho phép cả hai.
  4. Đóng cửa sổ gửi của Zalo, quay lại app.
  5. Bấm tab "Cá nhân", bấm "Thông tin cá nhân".
- **Mong đợi:**
  - Sau bước 3: Zalo mở cửa sổ gửi tin có link mời. Không phải bấm "Đồng ý, tiếp tục" lần nữa.
  - Sau bước 5: ô Số điện thoại hiện số của Zalo thử A, nhãn "Từ Zalo ✓". Tên hiện đúng tên Zalo.
- **Nguồn:** YC1.5.2-NT1, HV4-NT4, YC1.5.3-NT1

### US5-KB9 · Đã có số thì không hỏi lại `[Zalo]`
- **Mục đích:** hồ sơ đã có số thì bấm gửi link là mở Zalo ngay.
- **Chuẩn bị:** Zalo thử A, vừa xong KB8.
- **Làm:**
  1. Bấm tab "Sale".
  2. Bấm "Gửi link mời qua Zalo".
- **Mong đợi:**
  - Không có popup giải thích, không có hộp thoại xin quyền.
  - Zalo mở cửa sổ gửi tin có link mời.
- **Nguồn:** YC1.5.2-NT2, YC1.5.1-NT2

### US5-KB10 · Số điện thoại ở P2 chỉ xem `[Chính]`
- **Mục đích:** số lấy từ Zalo không sửa được trong app.
- **Chuẩn bị:** Máy 1, Zalo của Chị Hoa.
- **Làm:**
  1. Bấm tab "Cá nhân", bấm "Thông tin cá nhân".
  2. Chạm vào ô Số điện thoại.
- **Mong đợi:**
  - Ô ghi "0904 118 772", nhãn "Từ Zalo ✓".
  - Chạm vào ô không hiện bàn phím, số không đổi được.
- **Nguồn:** YC1.5.3-NT1, quy tắc Số điện thoại từ Zalo, chỉ xem, PQ2.CHU

### US5-KB11 · Sale không có tab Sale `[Quyền]`
- **Mục đích:** sale không xem được danh sách sale của chủ nhà.
- **Chuẩn bị:** Máy 2, Zalo của Sale Hùng.
- **Làm:**
  1. Mở app, xem thanh tab dưới đáy.
- **Mong đợi:**
  - Thanh tab có Lịch, Căn, Thống kê, Cá nhân. Không có tab "Sale".
- **Nguồn:** PQ17.SALE

### US5-KB12 · Thêm sale thiếu số điện thoại `[Lỗi]`
- **Mục đích:** không lưu được sale khi thiếu ô bắt buộc.
- **Chuẩn bị:** Máy 1, Chị Hoa, tab Sale.
- **Làm:**
  1. Bấm "Thêm sale".
  2. Gõ "Sale Quân" vào ô Tên sale.
  3. Để trống ô Số điện thoại.
  4. Bấm "Lưu sale".
- **Mong đợi:**
  - Sale không được lưu. Về tab Sale thì nhóm "Chưa kết nối" không có Sale Quân.
- **Nguồn:** YC1.9 bước 4 (ô "Số điện thoại *" bắt buộc)

### US5-KB13 · Lưu sale khi mất mạng `[Mạng]`
- **Mục đích:** mất mạng thì app báo chưa lưu, không làm mất chữ đã gõ.
- **Chuẩn bị:** Máy 1, Chị Hoa, tab Sale.
- **Làm:**
  1. Bấm "Thêm sale".
  2. Gõ "Sale Quân" vào ô Tên sale.
  3. Gõ "0987 000 222" vào ô Số điện thoại.
  4. Bật chế độ máy bay.
  5. Bấm "Lưu sale".
  6. Tắt chế độ máy bay, chờ 10 giây.
- **Mong đợi:**
  - Sau bước 5: app báo "Chưa lưu được, bấm lại khi có mạng". Hai ô vẫn giữ chữ đã gõ.
  - Sau bước 6: app không tự lưu. Hai ô vẫn còn chữ, chưa về tab Sale.
- **Nguồn:** HV2 bước 3, HV2 bước 4

### US5-KB14 · Thêm sale bằng tên và số `[Chính]`
- **Mục đích:** sale thêm tay nằm ở nhóm "Chưa kết nối".
- **Chuẩn bị:** Máy 1, Chị Hoa, vừa xong KB13, đã có mạng, hai ô còn "Sale Quân" và "0987 000 222".
- **Làm:**
  1. Bấm "Lưu sale".
- **Mong đợi:**
  - App về tab Sale.
  - Nhóm "Chưa kết nối · 1" có dòng Sale Quân.
  - Nhóm "Đã kết nối · 4" vẫn là Sale Hùng, Sale Lan, Sale Minh, Sale Nga.
- **Nguồn:** YC1.9-NT1, quy tắc Nhóm kết nối, PQ17.CHU

### US5-KB15 · Đặt phòng chủ nhà ghi cho sale hiện ở chi tiết sale `[Chính]`
- **Mục đích:** chủ nhà chọn chip sale đã kết nối thì đặt phòng tính cho sale đó.
- **Chuẩn bị:** Máy 1, Chị Hoa, tab Lịch. Căn 3402 đêm 08/10 còn trống.
- **Làm:**
  1. Bấm "+ Đặt phòng".
  2. Xem hàng chip ở phần "Khách / Sale".
  3. Chọn phòng 3402, ngày nhận 08/10, chọn "1 đêm".
  4. Chọn chip "Sale Hùng".
  5. Chọn "Chưa cọc".
  6. Bấm "Thêm đặt phòng".
  7. Bấm tab "Sale", chạm dòng Sale Hùng.
- **Mong đợi:**
  - Sau bước 2: có chip Sale Hùng, Sale Lan, Sale Nga, Sale Minh. Không có chip Sale Quân (chưa kết nối).
  - Sau bước 6: toast "Đã thêm đặt phòng Sale Hùng · 3402" ở đầu màn, tự tắt sau 3 giây.
  - Sau bước 7: danh sách đặt phòng của Sale Hùng có dòng 3402 · 08/10 → 09/10.
- **Nguồn:** YC4.1.2-NT3, YC4.1-NT1, HV8-NT2

### US5-KB16 · Ngừng cho Sale Hùng xem lịch `[Chính]`
- **Mục đích:** sale bị ngừng mất lịch của chủ nhà, đặt phòng cũ vẫn còn.
- **Chuẩn bị:** Máy 1 Chị Hoa. Máy 2 Sale Hùng, tab Lịch đang thấy ICON40 1509 và 3402 của Chị Hoa, nhóm "NGUỒN PHÒNG · 5".
- **Làm:**
  1. Máy 1: bấm tab "Sale", chạm dòng Sale Hùng.
  2. Máy 1: bấm "Ngừng cho xem lịch".
  3. Máy 1: đọc hộp xác nhận, bấm nút xác nhận.
  4. Máy 2: bấm tab "Cá nhân" rồi bấm lại tab "Lịch".
  5. Máy 1: bấm tab "Lịch", chạm ngày 10/10.
- **Mong đợi:**
  - Sau bước 2: hộp xác nhận ghi "Xác nhận ngừng cho Sale Hùng xem? Đặt phòng cũ vẫn giữ. Sale không thấy lịch của bạn nữa."
  - Sau bước 4: lịch của Hùng không còn 1509 và 3402, nhóm ghi "NGUỒN PHÒNG · 3".
  - Sau bước 5: ngày 10/10 căn 1509 vẫn có đặt phòng của Sale Hùng (B1).
- **Nguồn:** YC1.9-NT2, quy tắc Ngừng cho xem, PQ4.SALE, PQ17.CHU

### US5-KB17 · Sale bị ngừng lúc đang xem căn `[Quyền]`
- **Mục đích:** sale bị ngừng không còn thấy giá, lịch của căn đang mở, kể cả thoáng qua.
- **Chuẩn bị:** Máy 1 Chị Hoa. Máy 2 đăng nhập Zalo của Sale Lan, tab Lịch, chạm căn 3402 để mở chi tiết căn.
- **Làm:**
  1. Máy 1: bấm tab "Sale", chạm dòng Sale Lan.
  2. Máy 1: bấm "Ngừng cho xem lịch", bấm nút xác nhận.
  3. Máy 2: bấm nút Home của điện thoại, chờ 5 giây, mở lại Zalo và app.
- **Mong đợi:**
  - Máy 2 thấy "Bạn không còn xem được mục này", dòng "Chủ nhà đã ngừng chia sẻ lịch", nút "Về Lịch".
  - Không còn giá, ô ngày hay ảnh của 3402.
  - Bấm "Về Lịch": lịch của Lan không còn 1509 và 3402.
- **Nguồn:** HV5 bước 2, HV5-NT1, HV3 bước 2, PQ4.SALE, PQ5.SALE
