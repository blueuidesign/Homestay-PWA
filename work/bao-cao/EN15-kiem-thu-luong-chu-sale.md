# EN15 · Kết quả kiểm thử các luồng có cả chủ nhà và sale

Ngày 21/11/2026. Người chạy: Claude (chế độ tự chạy QD25), thay một vòng test tay.

**Kết luận: 11 luồng chạy hết trên màn, 10 đạt ngay, 1 lỗi (BG2) đã sửa ở PR #94. Dò quyền qua API không thấy rò dữ liệu.**

## Cách chạy
- Supabase chạy trên máy (Docker, Supabase CLI 2.122.1), toàn bộ migration tới `20261121020000_en7_loi_app`, hộp thư giả Mailpit để lấy mã đăng nhập. App build với URL và khóa anon của Supabase trên máy, chạy bằng `vite preview`.
- Mỗi người một trình duyệt riêng (context riêng của Playwright, khung 390×844), chạy song song như hai, ba điện thoại. Bước nào của bên kia cũng bấm trên màn; chỉ dựng bằng SQL tài khoản, căn, giá tháng, và kết nối ở luồng không thử kết nối.
- Bảng chia sẻ của điện thoại thay bằng bản giả ghi lại tin; "quay lại app" giả bằng sự kiện `visibilitychange` (HV3).
- Spec: `tests/e2e/supabase/luong-chu-sale.spec.ts`. Chạy: `E2E_SUPABASE=1 npx playwright test tests/e2e/supabase/luong-chu-sale.spec.ts`. Chạy 2 lượt liền (`--repeat-each=2`) để soát test chập chờn: đạt cả hai.

## Kết quả từng luồng
| Luồng | Đi qua | Kết quả |
|---|---|---|
| 1 | Chủ sao chép link mời → sale mới mở link, đăng ký bằng mã email, thêm lịch → chủ thấy sale ở "Đã kết nối" → sale đặt mức cộng +200k ở P10 → tìm phòng 2 đêm thấy giá chủ 2.200.000đ, giá bán 2.600.000đ. Mọi phản hồi Supabase tới máy chủ nhà không có giá bán, mức cộng | Đạt |
| 2 | Sale chưa có nguồn phòng chia sẻ tin xin lịch → chủ mở link trong tin, đồng ý → sale đang mở app quay lại thấy toast A9 "Chị Hoa đã đồng ý…", bấm Xem có 1509 | Đạt |
| 3 | Chủ gửi lịch chỉ 1509 (bỏ 3402) → sale mở link, thêm lịch → lịch sale có 1509, không có 3402 | Đạt |
| 4 | Hai sale gửi yêu cầu chồng một đêm trên màn → chủ thấy nhãn trùng ngày, chấp nhận yêu cầu của Hùng → yêu cầu của Lan tự bị từ chối → Hùng thấy S3-04 (giá bán 3.000.000đ, giá chủ 2.200.000đ), Lan thấy S3-05 lý do "đã nhận đặt phòng khác", không có tên Hùng → Lan tìm lại không còn 1509. Máy chủ nhà không nhận giá bán | Đạt |
| 5 | Đặt phòng từ yêu cầu → chủ xin hủy → sale thấy popup, mở S3-10, "Không đồng ý" → hai bên thấy "Bị từ chối hủy", không còn nút Xin hủy | Đạt |
| 5b | Đặt phòng từ yêu cầu → sale xin hủy → chủ mở lại app (popup) rồi "Đồng ý hủy" → "Đã hủy" → sale khác gửi yêu cầu đúng các đêm đó được | Đạt |
| 6 | Đặt phòng từ yêu cầu → sale thống kê tiền chênh 600.000đ → chủ thống kê 2.200.000đ, không có chữ "chênh", phản hồi không có giá bán → chạy việc nhắc chưa cọc hai lần: chủ có đúng một thông báo, sale không có, popup của chủ có dòng chưa cọc | Đạt |
| 7 | Sale xóa tài khoản trên màn → chủ thấy dòng "Đã xoá tài khoản", đặt phòng vẫn hiệu lực, sale khác tìm không ra đêm đó → chủ xóa tài khoản → sale còn kết nối có đúng một thông báo "Chị Hoa đã xóa tài khoản", sale đã xóa không nhận | Đạt |
| 8 | Sale đang chờ yêu cầu → chủ tự ghi khách lẻ chồng đêm trên CN4 → khối yêu cầu biến mất, sale quay lại thấy S3-05 | Đạt |
| 9 | Sale có yêu cầu chờ → chủ "Ngừng cho xem lịch" → chủ bấm chấp nhận yêu cầu cũ: bị chặn, báo "Sale này không còn kết nối với bạn, không nhận được đặt phòng.", không có đặt phòng → chủ từ chối được → sale không còn thấy 1509 | Đạt |
| 10 | Chủ tắt "Tình trạng cọc" của sale → sale mở đặt phòng của mình không thấy chữ cọc nào → chủ bật lại → sale thấy "chưa cọc" | Đạt |
| 11 | Đặt phòng từ yêu cầu (giá bán 3.000.000đ) → chủ mở thẳng địa chỉ đặt phòng, Sửa, đổi tiền phòng 2.200.000đ → 2.400.000đ → sale thấy popup "Chị Hoa đã sửa đặt phòng của bạn", giá chủ 2.400.000đ, giá bán giữ 3.000.000đ, chênh 600.000đ | Lỗi BG2; sau PR #94 đạt |

## Lỗi tìm được
- **BG2** (`work/backlog/BG2-mo-thang-dia-chi-ket-tai.md`, PR #94). Mở thẳng địa chỉ `/dat-phong/<id>/sua` (mở lại app ở màn đó, tải lại trang) thì form Sửa đặt phòng kẹt "Đang tải", không lưu được. Cùng gốc: `/can/gia-nhieu` kẹt khung xám, `/can/<id>/gia` thiếu mã căn, `/dat-phong/<id>` thiếu màu căn. Đã soát 18 địa chỉ của chủ nhà bằng cách mở thẳng từng địa chỉ: chỉ các màn trên bị. Mức độ trung bình, không lộ dữ liệu, không sai tiền.

## Dò quyền qua API (Supabase thật, không phải Postgres giả lập)
Nạp dữ liệu mẫu DLM, thêm căn 9999 của Anh Tuấn không chia sẻ cho ai, cho Chị Hoa ngừng Sale Nga. Ký phiên cho 6 người (và khách chưa đăng nhập), đọc mọi bảng và view qua REST, rồi gọi 40 hàm `fn_*` bằng người không có quyền.
- Khách chưa đăng nhập: mọi bảng và view trả 42501.
- Sale chỉ đọc được bảng `booking` của căn tự nhập của chính mình (đặt phòng tự ghi), không đọc booking của chủ nhà. `v_lich_sale` chỉ có căn và đêm, không có ai đặt.
- Sale Hùng thấy 7 căn (2 của Chị Hoa, 2 Anh Tuấn chia sẻ, 2 căn của mình, 1 căn tự nhập), không thấy 9999. Sale Nga bị ngừng không thấy căn, giá nào.
- Chủ nhà không đọc được `muc_cong`, `cai_dat_rieng`, `yeu_cau_rieng`, `booking_rieng` của sale. Thống kê chủ không có giá bán, tiền chênh.
- 40 lệnh gọi sai người đều bị từ chối hoặc trả rỗng (chủ đặt mức cộng, chủ khác chấp nhận yêu cầu, sale khác xin hủy, sale đọc chi tiết căn ngoài phạm vi, sale bị ngừng gửi yêu cầu hay soạn tin gửi khách, chủ gọi lệnh của sale để đọc giá bán…). `fn_sale_chi_tiet_can` ngoài quyền trả `khong_con_quyen: true` không kèm dữ liệu, đúng HV5.
- Tin gửi khách của Hùng cho 1509 chỉ có giá bán (giá chủ 1.800.000đ + mức cộng 2 đêm × 200.000đ = 2.200.000đ), không có giá chủ.

## Chưa thử được
- Bảng chia sẻ thật của iPhone, Android; cài lên màn hình chính; mạng yếu thật. Cần Đức thử trên máy thật.
- Thư mã đăng nhập thật qua Resend trên staging (chỉ thử hộp thư giả).
- Việc nhắc chưa cọc chạy bằng pg_cron theo giờ: chỉ gọi thẳng hàm, chưa đợi lịch chạy.
