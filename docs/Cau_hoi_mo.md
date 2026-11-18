# Câu hỏi mở

<!-- Tài liệu sống. Chỗ nào trong YC hay luật chung gắn thẻ [MỞ: mã] thì chưa được code theo. Hỏi Tùng, ghi câu trả lời nguyên văn xuống mục "Đã trả lời", sửa chỗ gắn thẻ, xóa dòng ở mục trên. -->

Mã `CH-<số>` là câu hỏi chung, `YC<n>-H<số>` là câu hỏi riêng của một YC, `HV-H`, `LC-H` thuộc `docs/luat-chung/`. Cột "Gắn ở" là mục đang chờ câu trả lời. Dựng lại theo QD-021 ngày 18/11/2026: câu hỏi cũ mã `US<n>-H` đã đổi sang `YC<n>-H` hay gộp vào `CH`; câu chỉ có chữ "câu đứng cạnh thẻ" đã viết lại từ chỗ gắn thẻ.

## Đang chờ, chặn việc

| Mã | Ngày hỏi | Hỏi ai | Câu hỏi | Chặn việc gì | Đang tạm làm thế nào |
| --- | --- | --- | --- | --- | --- |
| CH-001 | 18/11/2026 | Tùng | Người dùng đăng nhập bản PWA bằng gì: (a) mã OTP qua SMS (cần nhà cung cấp SMS, có phí, có thể vướng quy định tin nhắn thương hiệu), (b) đăng nhập Zalo trên web (cần đăng ký ứng dụng Zalo, kiểm Zalo có cho lấy số điện thoại trên web không), (c) tạm dùng email magic link cho vài người dùng đầu? Nguyên tắc của Home247 là không bắt đăng ký bằng email (`docs/Mo_ta_du_an.md`). | Màn đăng nhập, test E2E chạy bằng tài khoản thật | Database không phụ thuộc cách đăng nhập. E2E tạm đăng nhập bằng tài khoản thử trên staging |
| CH-002 | 18/11/2026 | Tùng | Dữ liệu người dùng đặt ở đâu? Supabase không có vùng Việt Nam, gần nhất là Singapore. Thỏa thuận nhà phát triển của Zalo (§5.3.3(b)) bắt dữ liệu ở Việt Nam khi lên Zalo. Luật Bảo vệ dữ liệu cá nhân 2025 và Nghị định 356/2025 (hiệu lực 01/01/2026) có thủ tục khi chuyển dữ liệu ra nước ngoài. (a) Singapore cho giai đoạn PWA, dời trước khi lên Zalo; (b) PostgreSQL ở nhà cung cấp tại Việt Nam ngay từ đầu. Nên hỏi người có chuyên môn luật trước khi có người dùng thật. | Tạo project production, người dùng thật | Staging tạo ở Singapore, chỉ dữ liệu giả |
| CH-003 | 18/11/2026 | Tùng | Sale gửi căn cho khách thế nào trên PWA? Bản Zalo dùng cửa sổ chia sẻ của Zalo (YC8.1). Đề xuất: nút "Gửi cho khách" mở bảng chia sẻ của điện thoại (Web Share API) với chữ và ảnh; sale chọn Zalo trong bảng đó. Điện thoại không hỗ trợ chia sẻ ảnh thì chép chữ và tải ảnh về. | Màn gửi khách | Chưa làm |
| CH-004 | 18/11/2026 | Tùng | Xin hủy hết hạn sau bao lâu, và hết hạn thì đặt phòng thành gì? | Việc nền tự hết hạn xin hủy | Xin hủy không hết hạn |
| CH-005 | 18/11/2026 | Tùng | Chủ nhà thu hồi link mời ở màn nào; người mở link đã hết hạn hay đã thu hồi thấy gì? | Màn Thêm lịch khi link hỏng | Hiện "Link mời không còn dùng được" hoặc "Link mời đã hết hạn" |
| CH-006 | 18/11/2026 | Tùng | Số booking trong thống kê tháng đếm theo tháng của ngày nhận, hay đếm ở mọi tháng có đêm của booking? | Màn thống kê | Chưa làm thống kê |
| CH-007 | 18/11/2026 | Tùng | Người dùng xóa tài khoản trên PWA ở đâu, xác nhận thế nào? Bản Zalo nhận sự kiện người dùng gỡ quyền của app từ Zalo, PWA không có. | Màn Cá nhân | `fn_xoa_tai_khoan` đã có, chưa có màn |
| CH-008 | 18/11/2026 | Tùng | Vercel gói Hobby theo điều khoản chỉ dành cho dùng cá nhân, không thương mại (cần kiểm lại điều khoản hiện tại). Home247 có thu phí sale sau này thì cần gói Pro. Bản thử với vài người dùng có ổn với Hobby không? | Phát hành production | Dùng Hobby cho staging và bản thử |

## Chưa rõ, hỏi khi làm tới

| Mã | Câu hỏi | Gắn ở | Tạm làm |
|---|---|---|---|
| CH-009 | Sale chủ nhà thêm tay bằng tên và số (CN7-05) ghép với tài khoản thật của sale thế nào? (a) ghép khi số điện thoại trùng; (b) chỉ ghép qua link; (c) chủ gộp tay. | YC6.2 | không ghép, không chặn số trùng |
| CH-010 | Chủ nhà từ chối lời xin xem lịch ở A8 thì sale có được báo không? | YC6.5 |  |
| CH-011 | Nút "Nhắc lại" ở CN7 và "Gửi link cho chủ nhà khác" ở A7 làm gì? | YC6.2, YC6.4 | mở lại A6 |
| CH-012 | Tài khoản chọn vai chủ nhà mở link xin lịch của sale, hay vai sale bấm đồng ý ở A8: xử lý thế nào? | YC6.3 |  |
| CH-014 | Link xin lịch của sale có hạn không? | PQ18 |  |
| CH-015 | Chuyển giữa lịch tháng (CN1) và lịch tuần (CN2) bằng gì? (a) nút đổi; (b) tự đổi theo số căn. | YC2.5 |  |
| CH-016 | Ô "Có khách hôm nay", "Trống tối T7" ở CN2 tính cho hôm nay hay cho tuần đang xem? | YC2.5 | "Có khách hôm nay" tính theo hôm nay, "Trống tối T7" theo thứ Bảy của tuần đang xem, "Chưa cọc" theo các đặt phòng có đêm trong tuần đang xem |
| CH-017 | Chạm một ngày đã qua ở lịch tháng thì mở gì? | YC2.2 | mở chi tiết ngày như ngày khác, nút "Đặt phòng" vẫn có (ghi bù được, YC5) |
| CH-018 | Chọn được nhiều loại view cho một căn không? | YC3.4 |  |
| CH-019 | Sau khi lưu giá ở tab Giá của căn, ở lại tab Giá hay quay về màn trước? | YC4.2 | ở lại tab Giá |
| CH-020 | Bỏ trống tên khi bật "Là ngày lễ" thì tên tự đặt là gì? | YC4.3 |  |
| CH-021 | Xóa căn có hỏi lại một lần không? Gợi ý: có, như xóa đặt phòng. | YC3.6 |  |
| CH-022 | "Đã bán 12 đặt phòng của bạn" ở CN9 đếm những đặt phòng nào? | YC9, YC9.4 |  |
| CH-025 | Chọn "Đã cọc · còn thu" thì số tiền cọc có bắt buộc không? | YC5.2 | ô để trống vẫn lưu được |
| CH-027 | Chủ căn tự nhập sau này dùng app thì căn tự nhập và đặt phòng cũ làm gì: ghép, giữ riêng hay xóa? | YC10 |  |
| CH-028 | Đã bỏ dòng ở bước 10 rồi thì có nối lại không? | YC10.1 |  |
| CH-029 | Giữa tháng thêm hay xóa căn thì mẫu số công suất tính thế nào? | YC11, YC3.6 |  |
| CH-030 | Thống kê của sale có chọn tháng khác không? | YC11.2 | chỉ tháng hiện tại |
| CH-031 | "Chưa thu tiền" gồm chỉ đặt phòng chưa cọc, hay cả phần còn thu của đặt phòng đã cọc? | YC11 |  |
| CH-032 | Chính sách quyền riêng tư nói giữ gì, bao lâu? | YC1.8 |  |
| CH-033 | Ảnh đại diện, tên và số chủ căn tự nhập, tên và số khách do người xóa nhập có bị xóa không? | YC1.8 |  |
| CH-034 | Quản trị viên còn xem được số điện thoại của người đã xóa tài khoản ở đâu không (ngoài bản sao lưu tự động)? | PQ23 |  |
| CH-035 | Sửa hoặc xóa một dải sau khi chủ nhà đã đặt giá theo dải đó: giá chủ nhà đã lưu giữ theo dải cũ hay đổi theo dải mới, có báo chủ nhà không. | YC13.2 | giá dịp của chủ nhà không đổi |
| CH-036 | Giới hạn "một dải tối đa 10 ngày" (quy tắc Dải ngày lễ do Home247 đặt) có áp cho dải người quản trị nhập không, hay chỉ cho dải chủ nhà sửa. | YC13.2 |  |
| CH-038 | Hai người thêm cùng một tòa với tên khác nhau ("ICON 40", "Icon40"): người quản trị gộp hay xóa thế nào, căn đang gắn tòa bị xóa thì sao. Người dùng thêm thoải mái nên chuyện này sẽ xảy ra. | YC13.3 |  |
| CH-039 | Người đồng quản trị bị gỡ khi đang đăng nhập thì phiên đó còn dùng được không? | YC13.1 |  |
| CH-042 | Sale bị ngừng còn thấy số điện thoại của chủ nhà không? | PQ2 |  |
| CH-043 | Quản trị viên có sửa hồ sơ người dùng được không? | PQ1 |  |
| CH-044 | Sale có thấy ngày tính giá cuối tuần của chủ nhà không? | PQ6 |  |
| CH-045 | Quản trị viên có xuất được dữ liệu của người dùng không? | PQ20 |  |
| CH-046 | Sale có quyền gì ở trang quản trị (dải ngày lễ, tòa nhà) không? | PQ21 |  |
| CH-047 | Sale bị ngừng: chủ nhà đó còn hiện ở Nguồn phòng của sale không? | PQ17 |  |
| CH-048 | Sale bị ngừng còn xin hủy đặt phòng cũ với chủ nhà đó được không? | PQ7 |  |
| CH-049 | Sale thấy nhãn "Đã thanh toán", "còn thu" của đặt phòng của mình không, hay chỉ đã cọc hay chưa? | PQ8 |  |
| CH-050 | Sale bị ngừng thì yêu cầu đang chờ của sale với chủ nhà đó xử lý thế nào? | PQ10 |  |
| CH-056 | Điều khoản và Chính sách quyền riêng tư: có link ở A1 nhưng chưa có màn nội dung. | YC15 |  |
| CH-057 | Người tạo link tự bấm link của mình (chủ nhà mở link mời sale của chính họ, sale mở link xin kết nối của chính họ): chặn, bỏ qua, hay coi như thường? Nguồn chưa nói. Thêm ngày 2026-11-04. | YC6.3 |  |
| CH-059 | Tab Lịch của sale chưa có nguồn phòng nhưng đã gửi link xin lịch: hiện A5 hay A7? YC7.1-NT1 nói A5 khi chưa có nguồn phòng; A7 và A7-00 ghi "Vào từ: tab Lịch của sale chưa có nguồn", A7-00 ghi "gần giống A5, có thể gộp". Thêm: hai nút "Gửi link cho chủ nhà khác", "Thêm căn tự nhập" ở A7 chưa nối màn nào trong A7, còn A7-01 vẽ nút "Gửi link cho chủ nhà khác" mở A6 (YC6.4 bước 5 ghi chưa vẽ). Phương án: a) chưa gửi lần nào thì A5, đã gửi thì A7 (bả | YC7.1 | A5 |
| CH-070 | Số ảnh gửi mỗi lần. Căn có thể có tới 12 ảnh (YC3, YC4), còn S5 ghi "Gửi 6 ảnh qua Zalo". Cửa sổ chia sẻ của Zalo nhận tối đa 10 ảnh một lần. Căn có 12 ảnh thì sale gửi sao: chọn ảnh, chia hai lần, hay chỉ gửi 10 ảnh đầu. Thiết kế chưa vẽ chọn ảnh. | YC8.1 | gửi 10 ảnh đầu |
| CH-071 | "Bán nhiều nhất" (sắp xếp) đếm theo gì: booking đã chấp nhận, doanh số hay số lần gửi khách. | YC7 |  |
| CH-072 | Có hiện nhãn "Đã gửi" trên căn đã gửi khách, và có đếm lần gửi cho thống kê không? | YC8 |  |
| CH-074 | Màn chi tiết chủ nhà (S6-04) khi sale không còn quyền xem chủ nhà đó trông thế nào? | YC10.2 |  |
| CH-076 | Sửa thông tin căn tự nhập và sửa booking đã ghi chưa có màn. Xóa booking sale đã ghi cũng chưa có màn. | YC10, YC10.3 |  |
| CH-081 | Chia sẻ nguồn phòng cho nhóm có bỏ qua việc chủ nhà đồng ý từng sale (QD-008) không? | YC14 |  |
| CH-082 | Căn tự nhập có chia cho nhóm được không (S8-01 liệt kê "Chú Bình · tự nhập"), khi quy tắc là căn tự nhập chỉ sale đó thấy? | YC14 |  |
| CH-083 | Một sale ở nhiều nhóm được không. Chưa thiết kế. Phương án: một nhóm một sale để đơn giản; hoặc nhiều nhóm nhưng nguồn chung nào cũng cộng vào Nguồn phòng. | YC14 |  |
| CH-084 | Chưa có màn: giải tán nhóm, đổi trưởng nhóm, trưởng nhóm rời nhóm, đổi tên nhóm, thêm hoặc bớt nguồn chung sau khi tạo, link hết hạn hoặc nhóm đầy, số thành viên tối đa. | YC14 |  |
| CH-085 | Cộng tác viên: canvas không có vai trò này. Phương án: coi cộng tác viên là thành viên nhóm; hoặc là vai trò riêng (không có quyền xem giá, chỉ gửi khách) cần đặc tả thêm; hoặc bỏ khỏi tên nhóm YC14. | YC14 |  |
| CH-086 | Tạo nhóm khi sale chưa có nguồn phòng nào. S8-01 không nói. Phương án: cho tạo nhóm trống; hoặc báo cần có ít nhất một nguồn. | YC14.1 |  |
| CH-087 | Xóa khỏi nhóm (S8-04) và Rời nhóm (S8-05) chưa vẽ bước xác nhận lần hai, trong khi quy tắc chung là bấm hai lần. | YC14.2 |  |
| CH-088 | File xuất CSV có cột "Khách", "SĐT" (chỉ khách chủ nhà tự nhập, QD-011): giữ hai cột này hay bỏ? | YC1.6 |  |
| CH-090 | P4 có "Hướng dẫn sử dụng" nhưng P9 chỉ có phần "CHỦ NHÀ". Sale chưa có hướng dẫn. | YC1.7 |  |
| CH-091 | Đổi giờ nhận, trả mặc định có đổi booking đã ghi không, và sale đã gửi khách thì thế nào. Ngoài ra căn có giờ riêng không (P5 nói áp dụng cho tất cả căn). | YC1 |  |
| CH-095 | Người quản trị có sửa được tên, khu vực của tòa do người dùng thêm không (ví dụ sửa lỗi chính tả). | YC13.3 |  |
| CH-096 | Chủ nhà có xem lại và xóa được dòng kết nối đã dừng (sale thêm tay chưa kết nối, sale đã bị ngừng) không? | YC6.2 |  |
| CH-098 | Sale đã bỏ nguồn của một chủ nhà: có còn xem lại đặt phòng cũ với chủ nhà đó không, và yêu cầu đặt phòng đang chờ giữa hai bên xử lý thế nào? | YC10.2 |  |
| HV-H1 | Sang HV2 bước 5. Bao lâu là quá lâu? | HV1 |  |
| HV-H3 | Nháp đặt phòng được chứa tên, số khách (QD-011), xóa khi lưu xong hay hủy. Nháp giữ bao lâu? | HV3 |  |
| LC-H1 | Đặt phòng đã hủy (xóa) có còn chiếm đêm không, hay QT2.1 chỉ tính đặt phòng chưa hủy? | QT |  |
| YC1-H1 | Ô "Họ và tên" sửa được không? | YC1.4 | chỉ xem |
| YC1-H2 | Đặt phòng thuộc khoảng theo ngày nhận hay theo đêm? | YC1.6 | theo ngày nhận (khớp DLM |
| YC1-H3 | Có đặt phòng đã hủy không? | YC1.6 |  |
| YC1-H4 | Căn đã xóa có trong "Tất cả" không? | YC1.6 |  |
| YC1-H5 | Sale có căn của tôi xuất được không? | YC1.6 |  |
| YC10-H1 | Sale bỏ dòng của chủ nhà đã ngừng mình được không? | YC10.2 |  |
| YC10-H2 | Dòng chủ nhà ở Nguồn phòng ghi "Cập nhật … trước" tính theo mốc nào (lần đổi lịch hay giá gần nhất của bất kỳ căn nào của chủ nhà đó)? | YC10.1, YC10.4 |  |
| YC10-H3 | Mã căn tự nhập trùng thì trùng với căn nào (căn tự nhập khác của chính sale, hay mọi căn của sale)? | YC10.3 |  |
| YC11-H1 | Sale có căn của tôi (QD-005) xem thống kê căn đó ở đâu, và đặt phòng ở căn đó có tính vào thống kê sale không? | YC11.1, YC11.2 |  |
| YC11-H2 | Đặt phòng vắt qua hai tháng chia giá bán cho các đêm thế nào? | YC11.2 |  |
| YC11-H3 | Đặt phòng sale tự ghi cho căn tự nhập có trong danh sách không? | YC11.3 | không có |
| YC11-H5 | S7 mở danh sách S7-03 bằng cách nào; chạm dòng chờ chủ ở S7 mở S7-03 (hình) hay S3-03 (story cũ); chạm dòng yêu cầu ở S7-03 mở đâu? | YC11.2, YC11.3 |  |
| YC12-H2 | Báo chủ nhà khi sale gửi link xin xem lịch thế nào, khi link đi ngoài app và database chưa biết gì cho tới khi chủ nhà mở link? Công tắc "Sale xin xem lịch" ở P3 làm gì? | YC12, YC12.4 |  |
| YC12-H3 | Đặt phòng tạo khi đã còn dưới 3 ngày tới ngày nhận thì có nhắc không? | YC12.3 |  |
| YC12-H4 | Tắt một loại thì thông báo loại đó đã ghi trước còn ở P13 không? | YC12.4 | còn (giả định GD29) |
| YC13-H1 | Trang quản trị hiện gì khi đang tải, mất mạng, không có quyền? | YC13 |  |
| YC13-H2 | Hai dải ngày lễ cùng năm chồng ngày được không? | YC13.2 |  |
| YC14-H1 | Mâu thuẫn chặn cả YC: PQ15.SALE (tiền chênh, doanh số chỉ của mình) và PQ10.SALE (không thấy yêu cầu của sale khác) trái với quy tắc Trưởng nhóm thấy đặt phòng và tiền chênh, Thấy ai đang chờ chủ? | YC14, YC14.1 |  |
| YC2-H1 | Đổi chip lọc căn thì số tiền và số đêm có đổi theo căn không? | YC2.3 | khối luôn là tổng mọi căn |
| YC2-H2 | Ô trống của đêm chưa đặt giá hiện gì? | YC2.5 | ô để trống |
| YC2-H3 | Đặt phòng đã hủy có hiện với nhãn "Đã hủy" không? | YC2.4 | không hiện |
| YC3-H1 | Có báo cho sale khi có căn mới không? | YC12, YC3, YC6.7 |  |
| YC3-H3 | Nút xóa căn đặt ở đâu, xóa xong về màn nào? | YC3.6 |  |
| YC3-H4 | Bỏ một ảnh ở CN5-02 có hỏi lại không? | YC3.5 | không hỏi (ảnh chỉ thật sự bị bỏ khi bấm "Lưu thay đổi") |
| YC3-H5 | Khu vực của tòa người dùng thêm? | YC3.4 | tòa mới không có khu vực |
| YC3-H6 | Tạo căn có dùng mã lần gửi để chống gửi trùng không (hiện chỉ dựa vào luật mã căn không trùng)? | YC3.2 |  |
| YC4-H1 | Sao chép chép năm nào (năm đang xem hay mọi năm có giá)? | YC4.5 | chép năm đang xem ở tab Giá |
| YC4-H2 | Sửa, xóa một dải đã lưu? | YC4.3 |  |
| YC4-H3 | Đặt giá ngày lễ, dịp đặc biệt cho nhiều căn: chưa có màn? | YC4.4 |  |
| YC4-H4 | Lưu ngày tính giá cuối tuần xong thì về Cá nhân với toast "Đã lưu ngày tính giá cuối tuần" phải không (chưa có hình)? | YC4.6 |  |
| YC5-H1 | Cách nhập một tên khách mới chưa có trên hàng chip? | YC5.2 |  |
| YC5-H2 | Form đặt phòng chưa có ô số điện thoại khách: có thêm ô không? | YC5.3 |  |
| YC5-H3 | Tiền phòng 0 đồng (chủ nhà cho người quen ở miễn phí) có được ghi không? | YC5.6 | database chặn |
| YC5-H4 | Đổi căn của đặt phòng có sale: căn mới có phải nằm trong các căn sale được xem không? | YC5.6 |  |
| YC5-H5 | Đổi người đặt (giữa khách lẻ và sale, hay sang sale khác)? | YC5.6 | ô người đặt khóa ở form sửa |
| YC5-H6 | Đổi trạng thái tiền bằng tay thì bỏ trạng thái nhớ để hoàn tác, hay giữ nút "Hoàn tác"? | YC5, YC5.6 |  |
| YC5-H7 | Sửa, ghi đã thu đủ khi đặt phòng đang chờ hủy hay đã hủy? | YC5.8 |  |
| YC5-H8 | Chỉ đổi tiền phòng mà giữ ngày thì tiền từng đêm chia lại theo bảng giá lúc nào? | YC5.6 |  |
| YC5-H9 | Chỉ sửa ghi chú hay khách thì sale có được báo không? | YC5.6 |  |
| YC5-H10 | Giá bán nhỏ hơn tiền phòng (tiền chênh âm) được không, và sale đã bị ngừng có sửa giá bán không? | YC5.9 |  |
| YC5-H11 | Màn phía sale (thông báo, chi tiết đặt phòng, sửa giá bán) chưa có hình? | YC5.9 |  |
| YC5-H12 | Chủ nhà ghi tên, số khách cho đặt phòng có sale ở đâu? | YC5.2 | chọn sale thì không nhập được tên khách |
| YC5-H13 | Giá bán điền sẵn khi chủ nhà ghi giúp sale có làm tròn lên 50.000đ khi sale bật làm tròn không? | YC5, YC5.4 |  |
| YC5-H14 | Xin hủy đặt phòng đã qua ngày trả? | YC5.8 |  |
| YC5-H15 | Sale đã bị ngừng cho xem xin hủy được không? | YC5.8 |  |
| YC5-H16 | Bên kia đã xóa tài khoản thì xin hủy thế nào? | YC5.8 |  |
| YC5-H17 | Vị trí nút "Xin hủy" và khối trả lời ở chi tiết đặt phòng của chủ nhà (CN3-02) và của sale: chưa có hình? | YC5.8 |  |
| YC6-H1 | Chủ nhà ngừng được sale đã xóa tài khoản không? | YC6.2 |  |
| YC6-H2 | Sale thu hồi link xin lịch của mình? | YC6.4 |  |
| YC6-H3 | Kết nối đã tạo từ link đã thu hồi còn dùng không? | YC6.3 |  |
| YC6-H4 | Chủ nhà mở dòng chưa kết nối, đã ngừng thì thấy gì? | YC6.2 | mở được với những gì có |
| YC6-H5 | Người tạo link đã xóa tài khoản? | YC6.3 | coi như link không dùng được |
| YC6-H6 | Có thông báo khi sale tự bấm "Thêm lịch" không (cho sale, cho chủ nhà)? | YC6.3 | không |
| YC6-H7 | Sale đã kết nối nhận thêm link gửi lịch thì phạm vi có đổi không? | YC6.6 | giữ phạm vi cũ |
| YC6-H8 | Chưa chọn căn nào thì nút gửi không bấm được? | YC6.6 |  |
| YC6-H9 | Thu hồi link gửi lịch? | YC6.6 |  |
| YC7-H1 | Tìm với ngày nhận trước hôm nay? | YC7.2 | không chọn được ngày trước hôm nay |
| YC7-H2 | Chip tòa "Khác" ở màn tìm phòng làm gì? | YC7.2 |  |
| YC7-H3 | Lọc "Giá mỗi đêm" ở màn tìm phòng làm gì? | YC7.2 |  |
| YC7-H4 | Lịch tuần S4 bắt đầu từ ngày nào? | YC7.3 | từ ngày nhận |
| YC7-H5 | Tìm hai lần cùng điều kiện? | YC7.2 | lần tìm trùng đưa lên đầu, không thêm dòng |
| YC7-H6 | Mở S3 từ lịch 7 ngày (không có ngày khách hỏi) thì ngày ở là gì? | YC7.4 | hôm nay, 1 đêm |
| YC7-H7 | Quay về mức cộng mặc định cho một căn? | YC7.4 | chip "Mặc định" đầu hàng |
| YC8-H1 | Mỗi lần gửi tối đa bao nhiêu căn? | YC8.1 | 10 căn |
| YC8-H2 | Chủ nhà đổi ngày một đặt phòng (YC5.6) sang đêm của lần gửi có tính là "vừa có người đặt" để báo sale không? | YC8 |  |
| YC8-H3 | Sao chép chữ (không qua bảng chia sẻ) có ghi lần gửi để báo khi căn có người đặt không? | YC8.1 |  |
| YC8-H4 | Căn chưa có giá cho một đêm trong khoảng thì chữ ghi gì? | YC8.1 | ghi "Giá: hỏi lại" |
| YC9-H1 | Sale gửi yêu cầu với ngày nhận trước hôm nay thì sao? | YC9.1 |  |
| YC9-H2 | Có đêm chủ nhà chưa đặt giá thì sale gửi yêu cầu được không, giá ghi gì? | YC9.1 |  |
| YC9-H3 | Sale bị ngừng còn đọc được yêu cầu cũ của mình với chủ nhà đó không? | YC9.4 |  |
| YC9-H4 | Chấp nhận khi sale đã bị ngừng hay đã bỏ nguồn sau lúc gửi? | YC9.2 |  |
| YC9-H5 | Chấp nhận khi ngày nhận đã qua? | YC9.2 |  |
| YC9-H6 | Thông báo cho chủ nhà khi sale hủy yêu cầu, và thông báo yêu cầu cũ chủ nhà đã nhận còn giữ không? | YC12, YC9.4 |  |
| YC9-H7 | Tiêu đề màn S3-02 ("Đặt phòng" trùng chữ nút của chủ nhà)? | YC9.1, YC9.4 |  |
| YC9-H8 | Chủ nhà chưa cho số thì hai nút "Nhắn chủ nhà qua Zalo", "Gọi chủ nhà" làm gì? | YC9.1 |  |

## Giả định đang dùng

Chỗ ghi "(giả định GD<số>)" là lựa chọn tạm để làm tiếp được. Code theo được, nhưng phải ghi trong PR. Tùng chốt khác thì sửa và ghi QD.

| Mã | Giả định |
|---|---|
| GD2 | Bản đầu chỉ cần báo trong app, chưa cần OA (YC12.4) |
| GD11 | Chủ nhà tự ghi booking trùng đêm với yêu cầu đang chờ thì yêu cầu đó cũng thành Bị từ chối, như khi chủ chấp nhận yêu cầu khác |
| GD12 | Booking chỉ có tổng tiền (căn tự nhập) thì tiền chênh chia đều cho các đêm khi chia theo tháng (QT3.2) |
| GD13 | Làm tròn giá bán lên 50.000đ từng đêm, rồi cộng các đêm (YC7.5) |
| GD14 | Nhãn "Mới thêm" ở thẻ căn hiện trong 24 giờ sau khi thêm (YC3.2-NT6) |
| GD15 | "Gần nhau" của quy tắc Gom thông báo là trong 10 phút (CH-055) |
| GD16 | Ô ngày ở lịch của sale hiện giá bán đã cộng mức cộng (YC7.1) |
| GD17 | "Tìm gần đây" lưu ở server, mỗi sale 5 lần (YC7.2) |
| GD18 | (không dùng) |
| GD19 | Mở form ghi đặt phòng thì chip "Chưa cọc" chọn sẵn (YC5) |
| GD20 | Tiền cọc không được lớn hơn tiền phòng; vượt thì không lưu, báo "Tiền cọc không được lớn hơn tiền phòng" (YC5, CH-024) |
| GD21 | Thêm tòa có tên trùng một tòa đã có (không phân biệt hoa thường) thì dùng tòa đã có, không tạo tòa thứ hai. Tùng 04/11 (bản Zalo): "Gõ một toà đã có thì gợi ý toà đã có sẵn để chọn, người dùng vẫn tự ý thêm mới được": hiểu là tên khác cách viết vẫn thêm được, tên giống hệt thì dùng tòa đã có (YC3) |
| GD22 | Điểm 11 của Tùng (04/11/2026, bản Zalo) ghi "S6-02" nhưng S6-02 là màn Thêm căn tự nhập; hiểu ý là chi tiết căn của sale: S6-07 cho căn của tôi, S6-03 cho căn tự nhập (YC7.3) |
| GD23 | Màn chưa thiết kế ở YC10: sau bỏ nguồn và sau xóa căn tự nhập thì về S6; sửa căn tự nhập dùng lại S6-02 điền sẵn, nút "Lưu thay đổi" |
| GD24 | (không dùng) |
| GD25 | Câu trạng thái của đặt phòng chủ nhà ghi giúp ở S7-03: "Chị Hoa đã ghi giúp bạn" (YC11.3) |
| GD26 | Mục "CHỜ CHỦ NHÀ CHẤP NHẬN" ở thống kê sale gồm mọi yêu cầu đang chờ, không theo tháng (YC11.2) |
| GD27 | Chữ của các loại thông báo chưa có trên hình theo bảng ở YC12 |
| GD28 | Nhắc đặt phòng chưa cọc ghi lúc 08:00 giờ Việt Nam (YC12.3) |
| GD29 | Tắt một loại thông báo không xóa thông báo cũ loại đó (YC12.4) |
| GD30 | Tên file CSV "home247-dat-phong-<từ ngày>-<đến ngày>.csv" (YC1.6) |

## Đã trả lời

| Mã | Ngày trả lời | Câu trả lời (nguyên văn) | Đã áp dụng ở |
| --- | --- | --- | --- |
| CH-023 | 04/11/2026 (bản Zalo) | Tùng chốt điểm 2 trong 13 điểm ngày 04/11/2026: lưu sửa hoặc xóa đặt phòng xong thì quay về màn đã mở chức năng đó. | YC5 (bước 26, 31, YC5.6-NT7) |
| CH-066 | trước 18/11/2026 (bản Zalo) | Tùng 03/11: "tạo ra một thư mục lưu ảnh trên production. Sau này production sẽ chạy ở server Việt nam." Ở PR #88 bản Zalo Tùng trả lời bốn câu về ảnh: "Đồng ý hết, ko cần Đức xem" (giữ HEIC, ngưỡng 40 triệu điểm ảnh, ảnh tạm không gắn quá 24 giờ thì xóa). Bản PWA: ảnh ở Storage của Supabase (nơi đặt: CH-002); nhận JPEG, PNG, HEIC tới 15 MB, thu về JPEG cạnh dài 1600 px. | YC3 |
| CH-062 | trước 18/11/2026 (bản Zalo) | Đã trả lời bởi du-lieu-mau.md (DLM.3): sau khi áp dụng, Tháng 11 và Tháng 12 ghi "800k–1,1tr"; "Giá 7 tháng" là T6 đến T12. Sửa canvas CN6-04, CN6-08. `[r4 · sửa]` Câu hỏi cũ: Toast "Đã áp dụng giá cho Tháng 11 – 12" (CN6-04, CN6-08) nhưng cùng màn Tháng 11 và Tháng 12 còn ghi "Chưa đặt", và CN6-07 ghi "Giá 7 tháng". Phương án: sửa dữ liệu minh họa của CN6-04 và CN6-08; hoặc toast ghi sai. | docs/luat-chung/Nghiep_vu.md |
| CH-063 | trước 18/11/2026 (bản Zalo) | Đã trả lời: hai dải ngày lễ hoặc dịp đặc biệt của cùng căn không được chồng ngày, lưu thì báo lỗi (YC4.3 bước 8, quy tắc Giá dịp không chồng ngày). Dịp và giá tháng: dịp thay giá tháng (quy tắc Giá dịp thay giá tháng). Tùng 03/11: "Giá chồng ngày không thể được, lúc setting giá đã chặn rồi." `[r13 · sửa]` Câu hỏi cũ: Thứ tự ưu tiên khi ngày lễ, dịp đặc biệt và giá tháng chồng nhau, hoặc hai dịp trùng ngày. Phương án: dịp ghi sau cùng thắng; ngày  | src/services/api.ts |
| CH-064 | trước 18/11/2026 (bản Zalo) | Đã trả lời: xóa căn là ẩn căn (YC3.6). Tùng 03/11: "thêm chức năng xoá căn, thực chất là chỉ ẩn căn đó đi khỏi màn hình. Các data khác về thống kê vẫn còn." Còn đặt phòng sắp tới hoặc yêu cầu chờ thì không xóa được, sale không còn thấy căn, mã dùng lại được, bản đầu không hiện lại: Tùng chọn theo đề xuất ("Theo đề xuất"). Màn:. `[r13 · sửa]` Câu hỏi cũ: Xóa hoặc ẩn một căn chưa có màn. Căn đang có booking thì xử lý ra sao. | YC3 |
| CH-065 | trước 18/11/2026 (bản Zalo) | Đã trả lời: một danh sách chung, người quản trị đặt sẵn (YC13.3), người dùng thêm tòa mới không cần duyệt và tòa đó hiện cho mọi người (quy tắc Tòa nhà dùng chung). Tùng 03/11: "Danh sách toà nhà có thể seting bởi admin, ngoài ra thêm thoải mái." và chọn theo đề xuất cho phần tòa người dùng thêm. Còn mở: khu vực của tòa người dùng thêm nhập thế nào. `[r13 · sửa]` Câu hỏi cũ: Danh sách tòa nhà chung cho mọi chủ nhà hay riêng từng chủ nhà, ai duyệt | YC3, docs/Cau_hoi_mo.md |
| CH-073 | trước 18/11/2026 (bản Zalo) | Đã trả lời: tạm thời không lọc, không ghi số khách; S4 bỏ "· 4 khách" (YC7.3 bước 5). Tùng 03/11: "Tạm thời chưa lọc theo số khách". `[r11 · thêm]` `[r13 · sửa]` | YC7, src/pages/s1-tim-man.tsx |
| CH-080 | trước 18/11/2026 (bản Zalo) | Đã trả lời (Tùng, 28/10): booking đã xóa không tính vào doanh thu, đêm có khách và chưa thu. | tests/kich-ban/YC11.md |
| CH-093 | trước 18/11/2026 (bản Zalo) | Đã trả lời bởi YC13.1: đăng nhập bằng mã gửi tới email. `[r6 · sửa]` | docs/bao-mat.md |
| CH-094 | trước 18/11/2026 (bản Zalo) | Đã trả lời bởi YC13.1: quản trị viên đầu tiên là email ghi trong `bootstrap_admins` (không ghi vào repo), thêm người đồng quản trị trên web (YC13.1). Phần cấp và gỡ còn lại ở câu 12, 13. | docs/bao-mat.md |
| CH-037 | 18/11/2026 | Bản 1 nạp dải ngày lễ và tòa nhà bằng seed; trang quản trị làm sau (PWA.md P11, YC13). | YC13, YC15 |
