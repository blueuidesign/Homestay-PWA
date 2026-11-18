# Câu hỏi mở

<!-- Tài liệu sống. Chỗ nào trong story hay luật chung gắn thẻ MỞ kèm một mã thì chưa được code theo. Hỏi Tùng, ghi câu trả lời nguyên văn xuống mục "Đã trả lời", sửa chỗ gắn thẻ, xóa dòng ở đây. scripts/kiem-tai-lieu.py báo đỏ nếu một thẻ MỞ trỏ tới mã không có ở file này. -->

## Đang chờ, chặn việc

| Mã | Ngày hỏi | Hỏi ai | Câu hỏi | Chặn việc gì | Đang tạm làm thế nào |
| --- | --- | --- | --- | --- | --- |
| CH-001 | 18/11/2026 | Tùng | Người dùng đăng nhập bản PWA bằng gì: (a) mã OTP qua SMS (cần nhà cung cấp SMS, có phí, có thể vướng quy định tin nhắn thương hiệu), (b) đăng nhập Zalo trên web (cần đăng ký ứng dụng Zalo, kiểm Zalo có cho lấy số điện thoại trên web không), (c) tạm dùng email magic link cho vài người dùng đầu? Nguyên tắc của Home247 là không bắt đăng ký bằng email (`docs/Mo_ta_du_an.md`). | Màn đăng nhập, test E2E chạy bằng tài khoản thật | Database không phụ thuộc cách đăng nhập. E2E tạm đăng nhập bằng tài khoản thử trên staging |
| CH-002 | 18/11/2026 | Tùng | Dữ liệu người dùng đặt ở đâu? Supabase không có vùng Việt Nam, gần nhất là Singapore. Thỏa thuận nhà phát triển của Zalo (§5.3.3(b)) bắt dữ liệu ở Việt Nam khi lên Zalo. Luật Bảo vệ dữ liệu cá nhân 2025 và Nghị định 356/2025 (hiệu lực 01/01/2026) có thủ tục khi chuyển dữ liệu ra nước ngoài. (a) Singapore cho giai đoạn PWA, dời trước khi lên Zalo; (b) PostgreSQL ở nhà cung cấp tại Việt Nam ngay từ đầu. Nên hỏi người có chuyên môn luật trước khi có người dùng thật. | Tạo project production, người dùng thật | Staging tạo ở Singapore, chỉ dữ liệu giả |
| CH-003 | 18/11/2026 | Tùng | Sale gửi căn cho khách thế nào trên PWA? Bản Zalo dùng cửa sổ chia sẻ của Zalo (mục "Gửi thông tin cho khách qua Zalo" (US14)). Đề xuất: nút "Gửi cho khách" mở bảng chia sẻ của điện thoại (Web Share API) với chữ và ảnh; sale chọn Zalo trong bảng đó. Điện thoại không hỗ trợ chia sẻ ảnh thì chép chữ và tải ảnh về. | Màn gửi khách | Chưa làm |
| CH-004 | 18/11/2026 | Tùng | Xin hủy hết hạn sau bao lâu, và hết hạn thì đặt phòng thành gì? | Việc nền tự hết hạn xin hủy | Xin hủy không hết hạn |
| CH-005 | 18/11/2026 | Tùng | Chủ nhà thu hồi link mời ở màn nào; người mở link đã hết hạn hay đã thu hồi thấy gì? | Màn Thêm lịch khi link hỏng | Hiện "Link mời không còn dùng được" hoặc "Link mời đã hết hạn" |
| CH-006 | 18/11/2026 | Tùng | Số booking trong thống kê tháng đếm theo tháng của ngày nhận, hay đếm ở mọi tháng có đêm của booking? | Màn thống kê | Chưa làm thống kê |
| CH-007 | 18/11/2026 | Tùng | Người dùng xóa tài khoản trên PWA ở đâu, xác nhận thế nào? Bản Zalo nhận sự kiện người dùng gỡ quyền của app từ Zalo, PWA không có. | Màn Cá nhân | `fn_xoa_tai_khoan` đã có, chưa có màn |
| CH-008 | 18/11/2026 | Tùng | Vercel gói Hobby theo điều khoản chỉ dành cho dùng cá nhân, không thương mại (cần kiểm lại điều khoản hiện tại). Home247 có thu phí sale sau này thì cần gói Pro. Bản thử với vài người dùng có ổn với Hobby không? | Phát hành production | Dùng Hobby cho staging và bản thử |

## Chưa rõ, hỏi khi làm tới

Mã `YC<n>-H<số>`, `PQ-H<số>`, `HV-H<số>` giữ từ bản Zalo. Mã `US<n>-H<số>` là chỗ chưa rõ nằm ngay trong story hoặc kịch bản kiểm tay của story đó, mã `LC-H<số>` nằm trong `docs/luat-chung/`: câu hỏi là câu đứng cạnh thẻ. Cột "Gắn ở" cho biết thẻ nằm ở file nào.

| Mã | Câu hỏi | Gắn ở |
|---|---|---|
| CH-009 | Sale chủ nhà thêm tay bằng tên và số (CN7-05) ghép với tài khoản thật của sale thế nào? (a) ghép khi số điện thoại trùng; (b) chỉ ghép qua link; (c) chủ gộp tay. | US17, US5 |
| CH-010 | Chủ nhà từ chối lời xin xem lịch ở A8 thì sale có được báo không? | US17 |
| CH-011 | Nút "Nhắc lại" ở CN7 và "Gửi link cho chủ nhà khác" ở A7 làm gì? | US5 |
| CH-012 | Tài khoản chọn vai chủ nhà mở link xin lịch của sale, hay vai sale bấm đồng ý ở A8: xử lý thế nào? | US6 |
| CH-013 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US22 |
| CH-014 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | luat-chung/PQ.md |
| CH-015 | Chuyển giữa lịch tháng (CN1) và lịch tuần (CN2) bằng gì? (a) nút đổi; (b) tự đổi theo số căn. | US9 |
| CH-016 | Ô "Có khách hôm nay", "Trống tối T7" ở CN2 tính cho hôm nay hay cho tuần đang xem? | US9 |
| CH-017 | Chạm một ngày đã qua ở lịch tháng thì mở gì? | US9 |
| CH-018 | Chọn được nhiều loại view cho một căn không? | US11 |
| CH-019 | Chạm thẻ căn ở CN5 mở gì; "Lưu thay đổi" ở CN5-02, "Lưu giá" ở CN6-02 về màn nào? | US7, US8 |
| CH-020 | Bỏ trống tên khi bật "Là ngày lễ" thì tên tự đặt là gì? | US8 |
| CH-021 | Xóa căn có hỏi lại một lần không? Gợi ý: có, như xóa đặt phòng. | US27 |
| CH-022 | "Đã bán 12 đặt phòng của bạn" ở CN9 đếm những đặt phòng nào? | US15 |
| CH-023 | Xóa đặt phòng xong về màn nào? | US10 |
| CH-024 | Tiền cọc lớn hơn tiền phòng thì báo gì? Đang tạm làm theo GD20. | US10, US3 |
| CH-025 | Chọn "Đã cọc · còn thu" thì số tiền cọc có bắt buộc không? | US3 |
| CH-026 | Lần gửi khách tính khi bấm gửi chữ, gửi ảnh, hay cả khi bấm sao chép? | US14 |
| CH-027 | Chủ căn tự nhập sau này dùng app thì căn tự nhập và đặt phòng cũ làm gì: ghép, giữ riêng hay xóa? | US16 |
| CH-028 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US16 |
| CH-029 | Giữa tháng thêm hay xóa căn thì mẫu số công suất tính thế nào? | US18, US27 |
| CH-030 | Thống kê của sale có chọn tháng khác không? | US19 |
| CH-031 | "Chưa thu tiền" gồm chỉ đặt phòng chưa cọc, hay cả phần còn thu của đặt phòng đã cọc? | US18 |
| CH-032 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US22 |
| CH-033 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US22 |
| CH-034 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | luat-chung/PQ.md |
| CH-035 | Sửa hoặc xóa một dải sau khi chủ nhà đã đặt giá theo dải đó: giá chủ nhà đã lưu giữ theo dải cũ hay đổi theo dải mới, có báo chủ nhà không. | US23 |
| CH-036 | Giới hạn "một dải tối đa 10 ngày" (quy tắc Dải ngày lễ do Home247 đặt) có áp cho dải người quản trị nhập không, hay chỉ cho dải chủ nhà sửa. | US23 |
| CH-037 | Bản đầu chưa có web quản trị: danh sách tòa đặt sẵn nạp bằng script như, hay để trống cho người dùng tự thêm. | US29 |
| CH-038 | Hai người thêm cùng một tòa với tên khác nhau ("ICON 40", "Icon40"): người quản trị gộp hay xóa thế nào, căn đang gắn tòa bị xóa thì sao. Người dùng thêm thoải mái nên chuyện này sẽ xảy ra. | US29 |
| CH-039 | Ai gỡ: đã trả lời bởi mục "Thêm người đồng quản trị" (US34) (chỉ quản trị viên đầu tiên, người này không bị gỡ). Còn mở: người bị gỡ đang đăng nhập thì mất quyền ngay không. Đề xuất: mất ngay, server kiểm danh sách ở mỗi lần gọi. | US34 |
| CH-040 | Mã đăng nhập: mấy chữ số, có hạn bao lâu, nhập sai mấy lần thì khóa, phiên quản trị giữ bao lâu. Gửi email cần dịch vụ gửi thư (việc tài khoản). | US34 |
| CH-041 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US34 |
| CH-042 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | luat-chung/PQ.md |
| CH-043 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | luat-chung/PQ.md |
| CH-044 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | luat-chung/PQ.md |
| CH-045 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | luat-chung/PQ.md |
| CH-046 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | luat-chung/PQ.md |
| CH-047 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | luat-chung/PQ.md |
| CH-048 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | luat-chung/PQ.md |
| CH-049 | QD-007 chỉ nói đã cọc hay chưa | luat-chung/PQ.md |
| CH-050 | PQ10.SALE: gửi yêu cầu cho căn được chia sẻ, đêm còn trống (mục "Sale gửi yêu cầu đặt phòng" (US15)); xem, hủy yêu cầu của mình; thấy lý do từ chối (mục "Sale nhận kết quả yêu cầu" (US15)). Không thấy yêu cầu của sale khác (nhóm Booking Ai thấy gì). Bị ngừng: không gửi yêu cầ | luat-chung/PQ.md |
| CH-051 | Nhóm này cho người quản trị của Home247 (vai ADMIN) làm việc vận hành trên trang quản trị riêng, không nằm trong các tab của chủ nhà và sale. Mục đầu tiên là dải ngày lễ hằng năm mà chủ nhà chọn nhanh | luat-chung/Nghiep_vu.md |
| US1-H1 | bước 2 và 2.3 có gửi `ma_link` nhưng không nói server kiểm hay ghi gì với nó | US1 |
| US3-H1 | Chủ nhà nhập tên một khách mới (chưa có trên hàng chip "Khách / Sale") ở đâu? Gợi ý: chạm "Khách lẻ" thì hiện ô "Tên khách (không bắt buộc)". | US3 |
| US3-H2 | Form đặt phòng có ô số điện thoại khách không? Database đã có chỗ lưu, canvas CN4 chưa có ô. | US3 |
| US3-H3 | Tiền phòng 0 đồng (cho người quen ở miễn phí) có được ghi không? Tạm thời database chặn. | US3 |
| US5-H1 | `TRANG_THAI_DA_DOI` / Dòng không phải `da_ket_noi` và không phải `chu_ngung` (ví dụ sale vừa bỏ nguồn, hoặc dòng thêm tay). Ngừng sale đã xóa tài khoản: . Dòng đã `chu_ngung`: trả kết quả như lần đầu, | US5 |
| US6-H1 | `LINK_KHONG_DUNG_DUOC` / Mã không có hoặc sai định dạng; link đã thu hồi; link quá hạn. Người tạo đã xóa tài khoản (US22-NT1, US22-NT2): . Thêm với `xin_lich`: người gọi đã ngừng sale đó (`ket_noi` | US6 |
| US6-H2 | `LINK_KHONG_DUNG_DUOC` / Link sai, thu hồi, quá hạn bước 4 kiểm lại link), hoặc link loại `xin_lich`. Người tạo đã xóa tài khoản: | US6 |
| US7-H1 | Cách "thay" giá có sẵn khi sao chép (phạm vi năm, tháng nguồn chưa đặt, dải chồng ngày của căn đích): . Các kịch bản dưới đây chỉ chạm ca không phụ thuộc phần này. | US7 |
| US8-H1 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US8 |
| US9-H1 | mục "Tóm tắt tháng" (US9) bước 2 đổi chip lọc hoặc đổi tháng thì số tiền và số đêm có đổi theo không, chưa vẽ | US9 |
| US9-H2 | mục "Lịch tuần khi có nhiều căn" (US9) ô trống chưa đặt giá (`gia_dem` là `null`) hiện gì trên bảng tuần | US9 |
| US9-H3 | mục "Booking sắp tới" (US9) danh sách sắp tới có hiện đặt phòng "Đã hủy" không và có giới hạn trong tháng đang xem không | US9 |
| US9-H4 | mục "Tóm tắt tháng" (US9) doanh thu có tính đặt phòng của căn đã ẩn không | US9 |
| US10-H1 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US10 |
| US10-H2 | mục "Sửa booking" (US10) nói "sửa người đặt", không nói hệ quả | US10 |
| US10-H3 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US10 |
| US10-H4 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US10 |
| US10-H5 | mục "Sửa booking" (US10) "sửa người đặt": đổi sang sale khác hay khách lẻ thì giá bán và thông báo ra sao | US10 |
| US10-H6 | mục "Chi tiết booking và đánh dấu đã thu đủ" (US10), mục "Sửa booking" (US10) sửa và thu đủ đặt phòng đang `cho_huy` hoặc đã `da_huy` (QD-012) | US10 |
| US10-H7 | mục "Sửa booking" (US10) chỉ đổi tiền phòng mà giữ ngày thì chia lại tiền các đêm theo bảng giá lúc ghi hay bảng giá hiện tại, QT4.2 | US10 |
| US10-H8 | mục "Sửa booking" (US10) bước 4 chỉ sửa ghi chú hay khách chủ nhà nhập, sale có được báo không | US10 |
| US10-H9 | S3-10 thẻ vàng ghi "Giá bán tính lại theo mức cộng", trái mục "Sửa booking" (US10) bước 5 và NT5 (giá bán giữ như đã báo khách) | US10 |
| US11-H1 | `khu_vuc` / chuỗi 1 đến 100 ký tự hoặc null / không / Người dùng nhập khu vực thế nào: . Server nhận nếu app gửi | US11 |
| US11-H2 | Khu vực của tòa người dùng thêm:  (CH-065 đã trả lời). Loại view chọn nhiều loại: , kịch bản chỉ chọn một loại. | US11 |
| US11-H3 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US11 |
| US11-H4 | Bước 3 danh sách có "Green Hạ Long Test" cùng ICON40, À La Carte, Sapphire. | kich-ban/US11 |
| US12-H1 | ngay_nhan / query / ngay / Có / Ngày trong quá khứ: | US12 |
| US12-H2 | toa_nha_id / query / danh sách id / Không / Chip "Khác": | US12 |
| US12-H3 | sap_xep / query / chuỗi / Không / Chỉ `ten` (S2 "Theo tên"). Các cách khác ở S2: | US12 |
| US12-H4 | Lọc "Giá mỗi đêm" (mục "Tìm phòng trống theo ngày" (US12) bước 3) chưa quyết: . | US12 |
| US12-H5 | tu / query / ngay / Không / Ngày đầu của 7 ngày. Mặc định `ngay_nhan`. | US12 |
| US12-H6 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US12 |
| US13-H1 | ngay_nhan / query / ngay / Không / Đi cùng `ngay_tra`. Mở từ S1 không có ngày: | US13 |
| US13-H2 | `so_tien` 0 lưu thành dòng `muc_cong` với 0, không xóa dòng. Cách quay về mức mặc định: . | US13 |
| US13-H3 | Mở S3 từ lịch 7 ngày S1 (mục "Lịch phòng 7 ngày" (US16) bước 8): US6; ngày ở khi không có ngày khách hỏi chưa chốt . | US13 |
| US13-H4 | S3 của căn của tôi và căn tự nhập, giá bán có cộng cho căn của chính sale: chưa chốt . US này chỉ làm căn trong nguồn phòng. | US13 |
| US14-H1 | can_ids / thân / id[] / Có / 1 đến 20 căn, không trùng (giới hạn kỹ thuật; số tối đa theo nghiệp vụ: ). Thứ tự giữ như app gửi | US14 |
| US14-H2 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US14 |
| US15-H1 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US15 |
| US15-H2 | nguồn không nói, `gia_chu` của Thiet_ke_DB không có giá trị trống | US15 |
| US15-H3 | PQ10.SALE "yêu cầu đang chờ | US15 |
| US15-H4 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US15 |
| US15-H5 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US15 |
| US15-H6 | Chấp nhận khi sale đã bị ngừng hoặc đã bỏ nguồn sau lúc gửi: . Chấp nhận khi ngày nhận đã qua: . | US15 |
| US15-H7 | ly_do / `da_co_khach`, `dang_sua_phong`, `ly_do_khac` /  / Ba chip của CN9 (mục "Chủ nhà nhận và trả lời yêu cầu" (US15) bước 5). Giá trị khác, kể cả `chu_nhan_dat_khac`, thì `DU_LIEU_SAI`: lý do đó chỉ server đặt | US15 |
| US15-H8 | "Lý do khác" có ô nhập chữ không: . Chưa có trường chữ cho lý do khác. | US15 |
| US15-H9 | Chọn "Lý do khác" có ô nhập chữ, bắt buộc chọn lý do:  (CH-067). Chỉ làm ba chip. | US15 |
| US16-H1 | PQ14.CHU: chủ nhà gọi hay với căn tự nhập của sale thì bị từ chối; chủ nhà gọi với `loai: "tu_nhap"` thì bị từ chối (mã lỗi: ). | US16 |
| US16-H2 | chưa có, mục "Danh sách căn và nguồn phòng" (US16) bước 4, mục "Chi tiết căn tự nhập" (US16) bước 5 | US16 |
| US17-H1 | nguồn không nói có đếm lần gửi link đã hết hạn không | US17 |
| US17-H2 | `LINK_KHONG_DUNG_DUOC` / Link sai, quá hạn (khi đặt hạn), link không phải loại `xin_lich` (sale đã xóa tài khoản: ), hoặc người gọi đã ngừng sale đó, US22-NT2) | US17 |
| US17-H3 | `TRANG_THAI_DA_DOI` / Dòng không còn `da_ket_noi` (sale đã bỏ nguồn, đã bị ngừng). Sale đã xóa tài khoản thì đổi quyền được không: . Đổi quyền của dòng thêm tay `chua_ket_noi`: ; tới khi có quyết định | US17 |
| US18-H1 | Thêm hoặc ẩn căn giữa tháng ảnh hưởng công suất: chờ  ở trên. | US18 |
| US18-H2 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US18 |
| US19-H1 | Có gồm booking `sale_tu_ghi` của căn tự nhập và booking căn của tôi không: . Tới khi có câu trả lời, chỉ gồm `nguon` `tu_yeu_cau` và `chu_tu_ghi`. | US19 |
| US19-H2 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US19 |
| US19-H3 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US19 |
| US19-H4 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | kich-ban/US19 |
| US19-H5 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | kich-ban/US19 |
| US19-H6 | **Mục đích:** đặt phòng đã chốt có nhãn "Đã chốt" và đúng tiền chênh từng dòng. Chỉ kiểm 5 dòng của yêu cầu; V2 (căn tự nhập) có trong danh sách hay không:  (US19-Q1). | kich-ban/US19 |
| US20-H1 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US20 |
| US21-H1 | `ten` có sửa được trong app không | US21 |
| US21-H2 | mục "Ngày tính giá cuối tuần" (US11) không nói chủ nhà được bỏ chọn hết các thứ không | US21 |
| US21-H3 | `chu_nha` (P3) / Đặt phòng chưa cọc / `dat_phong_chua_coc` / Mã đặt mới Thiet_ke_DB). Không có trong mục "Cài đặt thông báo" (US21): | US21 |
| US21-H4 | PQ11.CHU chỉ nói chủ nhà không thấy, không nói gửi lên thì báo lỗi hay bỏ qua | US21 |
| US21-H5 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US21 |
| US21-H6 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | kich-ban/US21 |
| US22-H1 | **mục "Khi người dùng xóa tài khoản" (US22) bản 3 đã gộp (PR #117, 04/11).** QD-013, r7, r8 đã trả lời các câu trước đây còn mở (sale có thấy căn, lịch không: không; tên hiện ra sao: tên cũ kèm ghi chú đỏ; mở lại app: thấy lại dữ liệu c | US22 |
| US22-H2 | PQ23.LINK, PQ18.LINK: link mời cũ của chủ nhà đã xóa tài khoản không trả tên căn, ảnh; link xin lịch của sale đã xóa tài khoản không trả số điện thoại; cả hai không tạo kết nối. Có trả tên cũ hay khôn | US22 |
| US22-H3 | Thẻ báo "Chị Hoa đã xóa tài khoản ngày 07/10" và câu "Đặt phòng này vẫn giữ để bạn đối chiếu với khách. …" (chữ theo canvas cũ, soát theo bản 3 ). | kich-ban/US22 |
| US22-H4 | Câu "Sale Hùng đã xóa tài khoản. Đặt phòng vẫn giữ trong lịch của bạn; app không còn số điện thoại của sale này." (chữ theo canvas cũ, soát theo bản 3 ). | kich-ban/US22 |
| US22-H5 | Bước 1: nhóm "ĐÃ KẾT NỐI" giảm 1 so với trước (4 thành 3). Dòng "Sale Hùng" kèm ghi chú đỏ "Đã xoá tài khoản", "Đặt phòng đã nhận từ sale này vẫn giữ trong lịch" (màn CN7 chưa vẽ,  (US22-Q4)). Không c | kich-ban/US22 |
| US22-H6 | **Mục đích:** link xin lịch của sale đã xóa không mở được, không lộ số của sale, không tạo kết nối. Chưa chạy tới khi trả lời: A8-01 ở mục "Khi người dùng xóa tài khoản" (US22) bản 3 ghi , tên cũ có hiện không chưa chốt. Mong đợi dưới l | kich-ban/US22 |
| US22-H7 | **Mục đích:** link mời của chủ nhà đã xóa không hiện căn, ảnh, không tạo kết nối. Chưa chạy tới khi trả lời: A1-link-01 ở mục "Khi người dùng xóa tài khoản" (US22) bản 3 ghi . Mong đợi dưới là của bản cũ. | kich-ban/US22 |
| US23-H1 | nguồn không nói; Thiet_ke_DB `ngay_le` không có ràng buộc | US23 |
| US24-H1 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US24 |
| US26-H1 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US26 |
| US26-H2 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US26 |
| US26-H3 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US26 |
| US27-H1 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US27 |
| US28-H1 | QT3.1 không nói tiền chênh âm | US28 |
| US28-H2 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US28 |
| US28-H3 | mục "Booking chủ nhà ghi cho sale" (US28) màn phía sale chưa vẽ | US28 |
| US28-H4 | US28-NT4 chủ nhà ghi tên và số khách cho đặt phòng của sale, nhưngvà API chỉ nhận `sale_id` hoặc `ten_khach`, và CN4 chưa có ô số khách | US28 |
| US28-H5 | mục "Booking chủ nhà ghi cho sale" (US28) màn phía sale (thông báo, chi tiết đặt phòng, sửa giá bán) chưa vẽ | US28 |
| US28-H6 | mục "Booking chủ nhà ghi cho sale" (US28) bước 1 sale bật "Làm tròn lên 50.000đ" thì giá bán tự tính có làm tròn không | US28 |
| US28-H7 | mục "Booking chủ nhà ghi cho sale" (US28) bước 4 giá bán nhỏ hơn tiền phòng (tiền chênh âm) có được không, sale bị ngừng có sửa giá bán không | US28 |
| US28-H8 | mục "Cài đặt thông báo" (US21) còn ghi loại thông báo này chờ Tùng, trong khi mục "Cài đặt thông báo" (US21) đã chốt dòng 15 | US28 |
| US30-H1 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US30 |
| US30-H2 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US30 |
| US30-H3 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US30 |
| US34-H1 | hỏi thêm hàng PQ, xem  dưới | US34 |
| US34-H2 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US34 |
| US35-H1 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US35 |
| US35-H2 | Xin hủy đặt phòng đã qua ngày trả được không: . Xin hủy hết hạn sau bao lâu và hết hạn thì thành gì: . | US35 |
| US35-H3 | TRANG_THAI_DA_DOI / Đặt phòng không còn `cho_huy` (đã trả lời, hoặc hết hạn ) | US35 |
| CH-052 | CN10-02 hiện "Đã gửi lịch thành công", nhưng A7 nói app không biết đã gửi. Hai câu mâu thuẫn. Phương án: đổi chữ thành "Đã mở Zalo để gửi"; bỏ toast; hoặc dựa vào sự kiện quay lại app và nói rõ giới hạn. | US26, src/components/sale-hien-thi.ts |
| CH-053 | Chủ nhà đổi quyền cho sale ở đâu? A8 ghi "Đổi được trong mục Sale", nhưng CN7-04 không có công tắc quyền. Phương án: thêm khối quyền vào CN7-04; hoặc sửa chữ ở A8. | src/pages/a8-man.tsx, src/pages/cn7-chi-tiet-sale.tsx, src/pages/cn7-man-chi-tiet.tsx, src/pages/us17-man.test.tsx |
| CH-054 | Gửi cho nhiều sale ở CN10: Zalo mở sẵn tin cho từng sale (CN10 ghi vậy) nhưng chưa nói chủ nhà gửi lần lượt hay một lần. Chưa có thiết kế chọn sale từ danh sách bạn bè Zalo khi sale chưa lưu. | src/pages/cn10-man.tsx, src/services/gui-lich.ts |
| CH-055 | "Gần nhau" của quy tắc Gom thông báo chưa có ngưỡng thời gian. Phương án: theo phút; theo mỗi lần mở app; theo ngày. | docs/Cau_hoi_mo.md |
| CH-056 | Điều khoản và Chính sách quyền riêng tư: có link ở A1 nhưng chưa có màn nội dung. | US39, docs/phap-ly/chinh-sach-quyen-rieng-tu.md, docs/phap-ly/dieu-khoan-su-dung.md |
| CH-057 | Người tạo link tự bấm link của mình (chủ nhà mở link mời sale của chính họ, sale mở link xin kết nối của chính họ): chặn, bỏ qua, hay coi như thường? Nguồn chưa nói. Thêm ngày 2026-11-04. | src/services/mo-link.ts |
| CH-058 | Chủ nhà chưa có tài khoản bấm "Đồng ý cho xem lịch" ở A8: có tính là đồng ý Điều khoản và Chính sách quyền riêng tư không? A1 và A1-link có dòng "Bằng việc tiếp tục, bạn đồng ý với…", A8 không có dòng nào, mà server cần `dong_y_dieu_khoan_luc` để tạo tài khoản chủ nhà. Sau khi đồng ý, chủ nhà mới đi A4-01 (mục "Màn đầu tiên khi chưa có dữ liệu" (US1)), chủ nhà đã có tài khoản đi CN7-06 (đã trả lời ở bản Zalo). Phương án: a) thêm dòng chữ nhỏ "Bằng việc tiếp tục…" dưới nút ở A8 cho người chưa có tài  | src/services/mo-link.ts |
| CH-059 | Tab Lịch của sale chưa có nguồn phòng nhưng đã gửi link xin lịch: hiện A5 hay A7? US6-NT9 nói A5 khi chưa có nguồn phòng; A7 và A7-00 ghi "Vào từ: tab Lịch của sale chưa có nguồn", A7-00 ghi "gần giống A5, có thể gộp". Thêm: hai nút "Gửi link cho chủ nhà khác", "Thêm căn tự nhập" ở A7 chưa nối màn nào trong A7, còn A7-01 vẽ nút "Gửi link cho chủ nhà khác" mở A6 (mục "Sale xin chủ nhà cho xem lịch" (US17) bước 5 ghi chưa vẽ). Phương án: a) chưa gửi lần nào thì A5, đã gửi thì A7 (bả | src/pages/s1-lich-sale.tsx |
| CH-060 | P13 (Thông báo) mới vẽ dòng cho các loại của sale: đồng ý, sửa đặt phòng, chấp nhận, từ chối, hết hạn, căn đã gửi có người đặt, chủ nhà xóa tài khoản, chủ nhà ngừng. Chưa vẽ chữ và màn đích cho loại: `chu_them_can`, `chu_ghi_booking_cho_sale`, `sale_gui_yeu_cau`, `sale_xin_xem_lich`, `xin_huy_booking`, `tra_loi_huy_booking`, cũng như cả P13 phía chủ nhà (P13 ghi "chủ nhà thấy loại của mình"). Dòng đồng ý ở P13 ghi "Anh Tuấn đồng ý cho bạn xem lịc | src/components/thong-bao-hien-thi.ts |
| CH-061 | Toast A9 khi chủ nhà đồng ý mà chưa có căn nào (chủ nhà mới đồng ý trước khi thêm căn): dòng phụ "ICON40 1509 và 3402 đã vào Nguồn phòng" không dùng được. Bản tạm: "Căn của chủ nhà sẽ vào Nguồn phòng khi chủ nhà thêm căn". Thêm: toast có nút "Xem" tự tắt sau 3 giây (HV8) quá ngắn cho người lớn tuổi dùng một tay bấm nút; đề xuất toast có nút ở lại 6 giây hoặc tới khi bấm. Câu bị ảnh hưởng: A9, A9-02, HV8, mục "Thông báo kết quả kết nối cho sale" (US17). Thêm ngày 2026-11-04 (US17). | src/components/thong-bao-hien-thi.ts |
| CH-066 | Đã trả lời một phần: ảnh lưu ở một thư mục trên máy production, production chạy ở máy Việt Nam (mục "Ảnh khi thêm căn" (US25) bước 2). Tùng 03/11: "tạo ra một thư mục lưu ảnh trên production. Sau này production sẽ chạy ở server Việt nam." Còn mở: định dạng, kích thước tối đa, nén, nguồn chọn (thư viện máy hay ảnh Zalo), quyền truy cập ảnh có hiện hộp thoại Zalo không. `[r13 · sửa]` | US25 |
| CH-068 | Đã trả lời một phần bởi QD-007: tắt giá thì server không gửi giá chủ nhà, sale không có giá bán cho các đêm đó, chỉ còn thấy tiền của đặt phòng đã thành. Còn mở: S1, S2, S3 vẽ thế nào khi không có giá. `[r17 · sửa]` | docs/luat-chung/HV.md, src/pages/s1-man.tsx, tests/kich-ban/US12.md, tests/kich-ban/US13.md, tests/kich-ban/US14.md, tests/kich-ban/US17.md |
| CH-069 | Mẫu tin mặc định (P11) ghi "Anh chị ưng căn nào báo em giữ phòng nhé", trong khi luồng đặt phòng đã bỏ bước giữ phòng (nhóm Booking). Phương án: sửa câu chữ mẫu; hoặc giữ nếu sale vẫn hứa giữ ngoài app. | src/services/kieu.ts |
| CH-070 | Số ảnh gửi mỗi lần. Căn có thể có tới 12 ảnh (nhóm Căn và giá), còn S5 ghi "Gửi 6 ảnh qua Zalo". Cửa sổ chia sẻ của Zalo nhận tối đa 10 ảnh một lần. Căn có 12 ảnh thì sale gửi sao: chọn ảnh, chia hai lần, hay chỉ gửi 10 ảnh đầu. Thiết kế chưa vẽ chọn ảnh. | US14, src/services/gui-khach.ts |
| CH-071 | "Bán nhiều nhất" (sắp xếp) đếm theo gì: booking đã chấp nhận, doanh số hay số lần gửi khách. | US12 |
| CH-072 | Đã trả lời một phần bởi mục "Cài đặt thông báo" (US21): app ghi lần gửi khi sale gửi chữ hoặc ảnh của một căn (mục "Gửi thông tin cho khách qua Zalo" (US14) bước 7), dùng để báo căn đã gửi có người đặt. Còn mở: nhãn "Đã gửi" trên màn và đếm cho thống kê (nhóm Thống kê). `[r12 · sửa]` Câu hỏi cũ: Sau khi sale gửi khách xong thì app có ghi nhận không (ví dụ nhãn "Đã gửi") và có đếm cho thống kê (nhóm Thống kê) không. app không biết sale đã gửi thật hay chưa. | US14 |
| CH-074 | Đã trả lời một phần bởi QD-007: tắt giá thì không có giá chủ nhà, không có giá bán. Còn mở: S6-04 vẽ thế nào. `[r18 · sửa]` | US16, src/pages/s6-chu-nha.tsx, src/services/api.ts, src/services/kieu.ts |
| CH-075 | "BẠN ĐÃ BÁN: 12 đặt phòng" và "TIỀN CHÊNH" tính từ đâu: booking đã chấp nhận (nhóm Booking), booking sale tự ghi, hay cả hai. Và tính theo tháng nào. Cần thống nhất với nhóm Thống kê. `[r17 · sửa]` | src/pages/s6-chu-nha.tsx, src/services/kieu.ts |
| CH-076 | Sửa thông tin căn tự nhập và sửa booking đã ghi chưa có màn. Xóa booking sale đã ghi cũng chưa có màn. | US16, src/components/can-sale-hien-thi.ts, src/pages/s6-can-tu-nhap.tsx |
| CH-077 | "Gửi lời mời qua Zalo": nội dung tin mời và link mời lấy theo quy tắc nào (mục "Mở app từ link mời của chủ nhà" (US6)). Hiện chỉ vẽ nút. | src/components/can-sale-hien-thi.ts |
| CH-078 | "Gửi cho khách" ở S6-03 (căn tự nhập) và S6-07 (căn của tôi) cần ngày khách hỏi. mục "Chi tiết căn tự nhập" (US16) bước 3 chỉ nói "Sang gửi khách (mục "Gửi thông tin cho khách qua Zalo" (US14)) với căn này", mà màn gửi khách S5 luôn cần ngày nhận và ngày trả (tin nhắn ghi "Villa Tuần Châu, 10/10 → 12/10, 2 đêm, 1.800.000đ"). Server giả của US13, US14 còn trả "không còn xem được" cho căn của tôi và căn tự nhập), server thật đã nhận. Bản này: bấm nút thì hiện thông báo "Chọn ngày khách hỏi ở Tìm phòng trố | src/components/can-sale-hien-thi.ts, src/pages/s6-can-cua-toi.tsx, src/pages/s6-can-tu-nhap.tsx |
| CH-079 | Phần trăm so với tháng trước khi tháng trước bằng 0 (chia cho 0). Chưa thiết kế. Phương án: ẩn dòng phần trăm; hoặc ghi "Tháng đầu tiên". | src/pages/cn8-man.tsx, src/services/thong-ke.ts, src/services/us18.test.ts |
| CH-081 | Chia sẻ nguồn phòng cho nhóm có bỏ qua quyền xem của chủ nhà không. nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale quy định chủ nhà đồng ý từng sale mới cho xem lịch và giá. S8-01 cho trưởng nhóm chia sẻ, thành viên "tìm được các căn này". Một sale chưa được chủ nhà đồng ý thì xem lịch và giá của chủ đó qua nhóm sao? Phương án: chủ nhà phải bật chia sẻ cho nhóm trước khi thành viên thấy (thay vì chỉ "được báo"); hoặc thành viên chỉ thấy khi chính chủ nhà đã đồng ý cho họ; hoặc nhóm chỉ ch | US20, docs/luat-chung/Nghiep_vu.md |
| CH-082 | Căn tự nhập (S8-01 liệt kê "Chú Bình · tự nhập") đang chia sẻ cho nhóm, trái quy tắc "Căn tự nhập chỉ sale đó thấy" ở nhóm Nguồn phòng và căn tự nhập. Chủ căn cũng chưa biết mình bị chia sẻ cho người lạ. Phương án: không cho chia sẻ căn tự nhập; hoặc cho nhưng gỡ thông tin chủ căn. | docs/luat-chung/Nghiep_vu.md |
| CH-083 | Một sale ở nhiều nhóm được không. Chưa thiết kế. Phương án: một nhóm một sale để đơn giản; hoặc nhiều nhóm nhưng nguồn chung nào cũng cộng vào Nguồn phòng. | US20 |
| CH-084 | Chưa có màn: giải tán nhóm, đổi trưởng nhóm, trưởng nhóm rời nhóm, đổi tên nhóm, thêm hoặc bớt nguồn chung sau khi tạo, link hết hạn hoặc nhóm đầy, số thành viên tối đa. | US20 |
| CH-085 | Cộng tác viên: canvas không có vai trò này. Phương án: coi cộng tác viên là thành viên nhóm; hoặc là vai trò riêng (không có quyền xem giá, chỉ gửi khách) cần đặc tả thêm; hoặc bỏ khỏi tên nhóm nhóm Đội nhóm, cộng tác viên. | US20, docs/luat-chung/Nghiep_vu.md |
| CH-086 | Tạo nhóm khi sale chưa có nguồn phòng nào. S8-01 không nói. Phương án: cho tạo nhóm trống; hoặc báo cần có ít nhất một nguồn. | US20 |
| CH-087 | Xóa khỏi nhóm (S8-04) và Rời nhóm (S8-05) chưa vẽ bước xác nhận lần hai, trong khi quy tắc chung là bấm hai lần. | tests/kich-ban/US20.md |
| CH-088 | File xuất CSV (P8) có cột "Khách" và "SĐT", và file sao lưu (P7) lưu "48 đặt phòng" `[r17 · sửa]`. CLAUDE.md cấm lưu thông tin khách. Nếu app không lưu tên và số khách thì cột đó rỗng hoặc phải bỏ. Phương án: bỏ hai cột khỏi CSV và sao lưu; hoặc giữ nhưng chỉ khi chủ nhà tự nhập tên khách vào booking của mình và báo cáo rõ với Tùng đây là ngoại lệ cần một QD. | US22 |
| CH-089 | "Khôi phục từ file sao lưu" thay toàn bộ dữ liệu. Nguy cơ cao: ghi đè dữ liệu thật, qua mặt chặn trùng booking ở database, và người có file cũ làm mất booking mới. Phương án: bỏ chức năng, chỉ khôi phục qua hỗ trợ; hoặc chỉ cho xem trước và yêu cầu bấm hai lần; hoặc khôi phục kiểu thêm vào, không thay. | US40 |
| CH-090 | P4 có "Hướng dẫn sử dụng" nhưng P9 chỉ có phần "CHỦ NHÀ". Sale chưa có hướng dẫn. | US22, tests/kich-ban/US22.md |
| CH-091 | Đổi giờ nhận, trả mặc định có đổi booking đã ghi không, và sale đã gửi khách thì thế nào. Ngoài ra căn có giờ riêng không (P5 nói áp dụng cho tất cả căn). | US21 |
| CH-092 | Có sinh thông báo "sale xin xem lịch" cho chủ nhà không? App không biết sale đã gửi link xin lịch cho ai, nên chỉ báo được khi chủ nhà mở link. Database hiện chưa sinh loại này. | supabase/migrations/20261118000300_thong_bao_gui_khach.sql |
| CH-095 | Người quản trị có sửa được tên, khu vực của tòa do người dùng thêm không (ví dụ sửa lỗi chính tả). `[r2 · thêm]` | US29 |
| CH-096 | Chủ nhà có xem lại và xóa được dòng kết nối đã dừng (sale thêm tay chưa kết nối, sale đã bị ngừng) không? | US5, US16 |
| CH-097 | Xuất file đặt phòng: bản PWA lưu file vào máy bằng tải xuống của trình duyệt, hay chia sẻ qua bảng chia sẻ của điện thoại? | US22 |
| US10-H10 | PQ14.SALE cho sale sửa;chỉ cho chủ nhà; mục "Ghi booking đã chốt cho căn tự nhập" (US16) bước 6 màn sửa chưa thiết kế | US10 |
| US10-H11 | mục "Sửa booking" (US10) bước 4 nói mọi lần lưu | US10 |
| US10-H12 | PQ14.SALE cho xóa;chỉ cho `chu_tu_ghi` | US10 |
| US10-H13 | Ghi đặt phòng mới (mục "Chủ nhà ghi booking mới" (US3), mục "Căn, ngày và kiểm tra trùng lịch" (US3), US3-NT17, NT2): US3. US3-NT14, NT5, NT7 chưa có US, đề xuất vào US3. | US10 |
| US10-H14 | mục "Sửa booking" "sửa người đặt": đổi sang sale khác hay khách lẻ thì giá bán và thông báo ra sao. Server từ chối đổi `sale_id` của đặt phòng đã có sale). | US10 |
| US10-H15 |. | US10 |
| US5-H2 | PQ18.SALE không có quyền thu hồi | US5 |
| US5-H3 | QD-008 chỉ nói link hết hạn | US5 |
| US5-H4 | mục "Chủ nhà quản lý danh sách sale" (US5) bước 5 chỉ nói sale đã kết nối | US5 |
| US19-H7 | mục "Thống kê của sale" (US19) không nói | US19 |
| US19-H8 | QT3.2; GD12 chỉ nói căn tự nhập | US19 |
| US19-H9 | Mục chờ chủ theo tháng đang xem hay mọi yêu cầu đang chờ: tạm mọi yêu cầu đang chờ.  US19-Q5 | US19 |
| US21-H7 | bước 4 nói mất phiên thì app tự gọi lại mà không hỏi; mục "Tài khoản đăng nhập và đăng xuất" (US21) nói "Lần sau đăng nhập lại bằng Zalo". Hai câu cho hai kết quả khác nhau sau đăng xuất | US21 |
| US21-H8 | cập nhật cột này khi đổi giá tháng, không nói khi đổi đêm cuối tuần | US21 |
| US21-H9 | mục "Cài đặt thông báo" (US21) không nói | US21 |
| US13-H5 | chạm căn của tôi hay căn tự nhập ở S1 mở S3 (mục "Lịch phòng 7 ngày" (US16) bước 8) hay S6-07, S6-03 (mục "Danh sách căn và nguồn phòng" (US16) bước 9, mục "Chi tiết căn tự nhập" (US16)) | US13 |
| US13-H6 | **Ai gọi:** sale có vai `nguon_phong` với căn (PQ11.SALE), hoặc CHU của căn `tu_nhap` (giá bán căn tự nhập dùng mức cộng này, Thiet_ke_DB `muc_cong`, PQ14.SALE). Căn `cua_toi`: ; tới khi có câu trả lời, `KHONG_TIM_THAY`. Chủ nhà với căn của mình: `KHONG_TIM_THAY` (PQ11.CHU: chủ nhà không có mức cộng | US13 |
| US22-H8 | PQ20.SALE và PQ13.CHU | US22 |
| US22-H9 | mục "Xuất file Excel (CSV)" (US22) không nói | US22 |
| US22-H10 | mục "Xuất file Excel (CSV)" (US22), QD-012 | US22 |
| US22-H11 | mục "Xuất file Excel (CSV)" (US22) bước 3 chỉ có chip căn chưa ẩn | US22 |
| US11-H5 | thêm hàng PQ cho danh sách tòa | US11 |
| US11-H6 | PQ chưa có hàng cho tòa | US11 |
| US29-H1 | Nếu web quản trị chưa có thì danh sách đặt sẵn nạp bằng script, như dải ngày lễ . Web quản trị dùng chung nền đăng nhập ADMIN với US23 (US23 có trong truoc, Tùng giao 04/11). | US29 |
| US29-H2 | Ô PQ chạm tới (ma trận `docs/luat-chung/PQ.md`): PQ3.ADMIN (xem; mục "Quản trị danh sách tòa nhà" cho thêm và sửa tòa, nhưng PQ3.ADMIN mới ghi "xem", PQ chưa có hàng riêng cho danh sách tòa: ), PQ3.CHU, PQ3.SALE (xem mọi tòa, thêm tòa mới ở), PQ3.LINK (không thấy). | US29 |
| US29-H3 | Test vi phạm phải có (US29-NT4): Chị Hoa (CHU) gọi đường quản trị để thêm hay sửa tòa: từ chối, `toa_nha` không đổi; sale Hùng gọi như vậy: từ chối; gọi không có phiên: từ chối; Chị Hoa gọi không sửa được tòa có sẵn và không đặt được `tao_boi` trống (tòa người dùng thêm không thành tòa đặt sẵn). Mã  | US29 |
| US29-H4 | Xóa hoặc gộp tòa trùng, căn đang gắn tòa bị xóa (mục "Quản trị danh sách tòa nhà" bước 4): , chưa có NT, chưa US nào nhận. | US29 |
| US29-H5 | Sửa tên hoặc khu vực một tòa (mục "Quản trị danh sách tòa nhà" bước 3) và có áp cho tòa người dùng thêm không: mục "Quản trị danh sách tòa nhà" không có NT cho bước này . Chưa có kịch bản. | US29 |
| US18-H3 | nhóm Thống kê không nói | US18 |
| US23-H2 | **Ai gọi:** ADMIN (PQ21.ADMIN). Vai khác: từ chối . | US23 |
| US23-H3 | **Ai gọi:** ADMIN (PQ21.ADMIN). Vai khác: từ chối . | US23 |
| US23-H4 | **Ai gọi:** ADMIN (PQ21.ADMIN). Vai khác: từ chối . | US23 |
| US23-H5 | **Ai gọi:** ADMIN (PQ21.ADMIN). Vai khác: từ chối . | US23 |
| US23-H6 | Quy tắc "Dải ngày lễ do Home247 đặt" trong nhóm Căn và giá (mục Quy tắc nghiệp vụ phát hiện), chưa có mã QT. Không dùng HV: HV1, HV2 viết cho app, trạng thái đang tải, lỗi mạng, không có quyền của web quản trị chờ ; đã trả lời ở mục "Thêm người đồng quản t | US23 |
| US23-H7 | Quy tắc "Dải ngày lễ do Home247 đặt" trong nhóm Căn và giá (mục Quy tắc nghiệp vụ phát hiện), chưa có mã QT. Không dùng HV: HV1, HV2 viết cho app, trạng thái đang tải, lỗi mạng, không có quyền của web quản trị chờ ; đã trả lời ở mục "Thêm người đồng quản t | US23 |
| US23-H8 | PQ21.SALE ghi "?", nhóm Quản trị Home247 trên web Ai thấy gì | US23 |
| US23-H9 | Test vi phạm phải có (US23-NT4): Chị Hoa (CHU) gọi,,: từ chối, `ngay_le` không đổi; sale Hùng gọi cùng bốn API: từ chối; gọi không có phiên: từ chối. Mã lỗi . | US23 |
| US23-H10 | Duyệt hai bước, ghi ai sửa dải nào, dịp cố định hay thêm được dịp mới, giới hạn 10 ngày cho dải quản trị nhập, sửa hay xóa dải sau khi chủ nhà đã đặt giá theo dải, năm chưa có dải: . | US23 |
| US28-H9 | QD-007 chỉ nói xem lại được | US28 |
| US28-H10 | mục "Ghi booking đã chốt cho căn tự nhập" (US16) bước 6 màn sửa chưa thiết kế | US28 |
| US35-H4 | PQ7.SALE, QD-012 | US35 |
| US35-H5 | QD-012 không nói | US35 |
| US16-H3 | PQ17.SALE | US16 |
| US16-H4 | **Việc kéo theo:** Không có thông báo cho chủ nhà khi sale bỏ nguồn (mục "Cài đặt thông báo" (US21) không có loại này). Sau khi bỏ, API lịch của sale không còn căn của chủ nhà đó (US16-NT15). Sale đã bỏ nguồn còn xem lại đặt phòng cũ với chủ nhà đó không:  (QD-007 chỉ nói sale bị ngừng). Yêu cầu đặt | US16 |
| US16-H5 | **Việc kéo theo:** Không có thông báo cho chủ nhà khi sale bỏ nguồn (mục "Cài đặt thông báo" (US21) không có loại này). Sau khi bỏ, API lịch của sale không còn căn của chủ nhà đó (US16-NT15). Sale đã bỏ nguồn còn xem lại đặt phòng cũ với chủ nhà đó không:  (QD-007 chỉ nói sale bị ngừng). Yêu cầu đặt | US16 |
| US12-H7 | **Chống bấm hai lần:** không cần (đọc). Gọi hai lần cùng điều kiện tạo hai dòng `tim_gan_day` cho tới khi có câu trả lời. | US12 |
| US6-H3 | QD-005 trong mục "Mở app từ link mời của chủ nhà" (US6) | US6 |
| US6-H4 | mục "Cài đặt thông báo" (US21) có áp khi sale tự bấm Thêm lịch không | US6 |
| US1-H2 | Thiet_ke_DB ghi `vai_chon` chỉ để chọn giao diện, mâu thuẫn với việc dùng nó để kiểm quyền ở đây | US1 |
| US1-H3 | không có mã cho tạo sai vai | US1 |
| US1-H4 | mục "Căn mới của chủ nhà tự hiện cho sale" (US6) ghi "chưa thiết kế" | US1 |
| US15-H10 | mục "Cài đặt thông báo" (US21) không có loại "sale hủy yêu cầu"; thông báo `sale_gui_yeu_cau` đã ghi cho chủ nhà giữ hay bỏ. | US15 |
| US14-H3 | App gọi khi sale bấm "Gửi chữ qua Zalo" hoặc "Gửi ảnh qua Zalo", không gọi khi "Sao chép chữ" (mục "Gửi thông tin cho khách qua Zalo" bước 5, 6).. | US14 |
| US14-H4 | giá trong chữ là giá nào | US14 |
| US29-H6 | **Chuẩn bị:** tài khoản chủ nhà mới, chưa có căn, chưa thêm tòa nào (ngoài DLM ). Ba tòa ICON40, À La Carte, Sapphire đã được đặt sẵn. | tests/kich-ban/US29.md |
| US11-H7 | Bước 3 danh sách có "Green Hạ Long Test" cùng ICON40, À La Carte, Sapphire. | tests/kich-ban/US11.md |
| LC-H1 | Booking chiếm các đêm từ ngày nhận tới trước ngày trả. Ngày trả không phải đêm có khách. Booking đã xóa không chiếm đêm. | docs/luat-chung/QT.md |
| CH-098 | Sale đã bỏ nguồn của một chủ nhà: có còn xem lại đặt phòng cũ với chủ nhà đó không, và yêu cầu đặt phòng đang chờ giữa hai bên xử lý thế nào? | US16 |

## Giả định đang dùng

Chỗ ghi "(giả định GD<số>)" là lựa chọn tạm để làm tiếp được. Code theo được, nhưng phải ghi trong PR. Tùng chốt khác thì sửa và ghi QD.

| Mã | Giả định |
|---|---|
| GD2 | Bản đầu chỉ cần báo trong app, chưa cần OA (mục "Cài đặt thông báo" (US21)) |
| GD11 | Chủ nhà tự ghi booking trùng đêm với yêu cầu đang chờ thì yêu cầu đó cũng thành Bị từ chối, như khi chủ chấp nhận yêu cầu khác |
| GD12 | Booking chỉ có tổng tiền (căn tự nhập) thì tiền chênh chia đều cho các đêm khi chia theo tháng (QT3.2) |
| GD13 | Làm tròn giá bán lên 50.000đ từng đêm, rồi cộng các đêm (mục "Mức cộng giá mặc định" (US13), |
| GD14 | Nhãn "Mới thêm" ở thẻ căn hiện trong 24 giờ sau khi thêm (US1-NT12) |
| GD15 | "Gần nhau" của quy tắc Gom thông báo là trong 10 phút (CH-055) |
| GD16 | Ô ngày ở lịch của sale hiện giá bán đã cộng mức cộng (mục "Lịch phòng 7 ngày" (US16), |
| GD17 | "Tìm gần đây" lưu ở server, mỗi sale 5 lần (mục "Tìm phòng trống theo ngày" (US12), |
| GD18 | [chưa có nội dung, hỏi Tùng] |
| GD19 | Mở form ghi đặt phòng thì chip "Chưa cọc" chọn sẵn (US3) |
| GD20 | Tiền cọc không được lớn hơn tiền phòng; vượt thì không lưu, báo "Tiền cọc không được lớn hơn tiền phòng" (US3, CH-024) |

## Đã trả lời

| Mã | Ngày trả lời | Câu trả lời (nguyên văn) | Đã áp dụng ở |
| --- | --- | --- | --- |
| CH-062 | trước 18/11/2026 (bản Zalo) | Đã trả lời bởi du-lieu-mau.md (DLM.3): sau khi áp dụng, Tháng 11 và Tháng 12 ghi "800k–1,1tr"; "Giá 7 tháng" là T6 đến T12. Sửa canvas CN6-04, CN6-08. `[r4 · sửa]` Câu hỏi cũ: Toast "Đã áp dụng giá cho Tháng 11 – 12" (CN6-04, CN6-08) nhưng cùng màn Tháng 11 và Tháng 12 còn ghi "Chưa đặt", và CN6-07 ghi "Giá 7 tháng". Phương án: sửa dữ liệu minh họa của CN6-04 và CN6-08; hoặc toast ghi sai. | docs/luat-chung/Nghiep_vu.md |
| CH-063 | trước 18/11/2026 (bản Zalo) | Đã trả lời: hai dải ngày lễ hoặc dịp đặc biệt của cùng căn không được chồng ngày, lưu thì báo lỗi (mục "Giá ngày lễ và dịp đặc biệt" (US8) bước 8, quy tắc Giá dịp không chồng ngày). Dịp và giá tháng: dịp thay giá tháng (quy tắc Giá dịp thay giá tháng). Tùng 03/11: "Giá chồng ngày không thể được, lúc setting giá đã chặn rồi." `[r13 · sửa]` Câu hỏi cũ: Thứ tự ưu tiên khi ngày lễ, dịp đặc biệt và giá tháng chồng nhau, hoặc hai dịp trùng ngày. Phương án: dịp ghi sau cùng thắng; ngày  | src/services/api.ts |
| CH-064 | trước 18/11/2026 (bản Zalo) | Đã trả lời: xóa căn là ẩn căn (mục "Xóa căn" (US27)). Tùng 03/11: "thêm chức năng xoá căn, thực chất là chỉ ẩn căn đó đi khỏi màn hình. Các data khác về thống kê vẫn còn." Còn đặt phòng sắp tới hoặc yêu cầu chờ thì không xóa được, sale không còn thấy căn, mã dùng lại được, bản đầu không hiện lại: Tùng chọn theo đề xuất ("Theo đề xuất"). Màn:. `[r13 · sửa]` Câu hỏi cũ: Xóa hoặc ẩn một căn chưa có màn. Căn đang có booking thì xử lý ra sao. | US27 |
| CH-065 | trước 18/11/2026 (bản Zalo) | Đã trả lời: một danh sách chung, người quản trị đặt sẵn (mục "Quản trị danh sách tòa nhà" (US29)), người dùng thêm tòa mới không cần duyệt và tòa đó hiện cho mọi người (quy tắc Tòa nhà dùng chung). Tùng 03/11: "Danh sách toà nhà có thể seting bởi admin, ngoài ra thêm thoải mái." và chọn theo đề xuất cho phần tòa người dùng thêm. Còn mở: khu vực của tòa người dùng thêm nhập thế nào. `[r13 · sửa]` Câu hỏi cũ: Danh sách tòa nhà chung cho mọi chủ nhà hay riêng từng chủ nhà, ai duyệt | US11, docs/Cau_hoi_mo.md |
| CH-067 | trước 18/11/2026 (bản Zalo) | Đã trả lời bởi (Tùng duyệt ngày 02/11, giữ chip): CN9 có chip lý do Đã có khách đặt, Đang sửa phòng, Lý do khác (mục "Chủ nhà nhận và trả lời yêu cầu" (US15) bước 5). Chọn "Lý do khác" có ô nhập chữ không, và có bắt buộc chọn lý do không: chưa rõ. `[r8 · sửa]` | US15, docs/Cau_hoi_mo.md, src/components/yeu-cau-hien-thi.ts |
| CH-073 | trước 18/11/2026 (bản Zalo) | Đã trả lời: tạm thời không lọc, không ghi số khách; S4 bỏ "· 4 khách" (mục "Kết quả tìm phòng" (US12) bước 5). Tùng 03/11: "Tạm thời chưa lọc theo số khách". `[r11 · thêm]` `[r13 · sửa]` | US12, src/pages/s1-tim-man.tsx |
| CH-080 | trước 18/11/2026 (bản Zalo) | Đã trả lời (Tùng, 28/10): booking đã xóa không tính vào doanh thu, đêm có khách và chưa thu. | tests/kich-ban/US18.md |
| CH-093 | trước 18/11/2026 (bản Zalo) | Đã trả lời bởi mục "Thêm người đồng quản trị" (US34): đăng nhập bằng mã gửi tới email. `[r6 · sửa]` | docs/bao-mat.md |
| CH-094 | trước 18/11/2026 (bản Zalo) | Đã trả lời bởi mục "Thêm người đồng quản trị" (US34): quản trị viên đầu tiên là email ghi trong `bootstrap_admins` (không ghi vào repo), thêm người đồng quản trị trên web (mục "Thêm người đồng quản trị" (US34)). Phần cấp và gỡ còn lại ở câu 12, 13. | docs/bao-mat.md |
