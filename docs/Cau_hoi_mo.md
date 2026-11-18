# Câu hỏi mở

<!-- Tài liệu sống. Chỗ nào trong story hay luật chung gắn thẻ MỞ kèm một mã thì chưa được code theo. Hỏi Tùng, ghi câu trả lời nguyên văn xuống mục "Đã trả lời", sửa chỗ gắn thẻ, xóa dòng ở đây. scripts/kiem-tai-lieu.py báo đỏ nếu một thẻ MỞ trỏ tới mã không có ở file này. -->

## Đang chờ, chặn việc

| Mã | Ngày hỏi | Hỏi ai | Câu hỏi | Chặn việc gì | Đang tạm làm thế nào |
| --- | --- | --- | --- | --- | --- |
| CH-001 | 18/11/2026 | Tùng | Người dùng đăng nhập bản PWA bằng gì: (a) mã OTP qua SMS (cần nhà cung cấp SMS, có phí, có thể vướng quy định tin nhắn thương hiệu), (b) đăng nhập Zalo trên web (cần đăng ký ứng dụng Zalo, kiểm Zalo có cho lấy số điện thoại trên web không), (c) tạm dùng email magic link cho vài người dùng đầu? Nguyên tắc của Home247 là không bắt đăng ký bằng email (`docs/Mo_ta_du_an.md`). | Màn đăng nhập, test E2E chạy bằng tài khoản thật | Database không phụ thuộc cách đăng nhập. E2E tạm đăng nhập bằng tài khoản thử trên staging |
| CH-002 | 18/11/2026 | Tùng | Dữ liệu người dùng đặt ở đâu? Supabase không có vùng Việt Nam, gần nhất là Singapore. Thỏa thuận nhà phát triển của Zalo (§5.3.3(b)) bắt dữ liệu ở Việt Nam khi lên Zalo. Luật Bảo vệ dữ liệu cá nhân 2025 và Nghị định 356/2025 (hiệu lực 01/01/2026) có thủ tục khi chuyển dữ liệu ra nước ngoài. (a) Singapore cho giai đoạn PWA, dời trước khi lên Zalo; (b) PostgreSQL ở nhà cung cấp tại Việt Nam ngay từ đầu. Nên hỏi người có chuyên môn luật trước khi có người dùng thật. | Tạo project production, người dùng thật | Staging tạo ở Singapore, chỉ dữ liệu giả |
| CH-003 | 18/11/2026 | Tùng | Sale gửi căn cho khách thế nào trên PWA? Bản Zalo dùng cửa sổ chia sẻ của Zalo (YC5.5). Đề xuất: nút "Gửi cho khách" mở bảng chia sẻ của điện thoại (Web Share API) với chữ và ảnh; sale chọn Zalo trong bảng đó. Điện thoại không hỗ trợ chia sẻ ảnh thì chép chữ và tải ảnh về. | Màn gửi khách | Chưa làm |
| CH-004 | 18/11/2026 | Tùng | Xin hủy hết hạn sau bao lâu, và hết hạn thì đặt phòng thành gì? | Việc nền tự hết hạn xin hủy | Xin hủy không hết hạn |
| CH-005 | 18/11/2026 | Tùng | Chủ nhà thu hồi link mời ở màn nào; người mở link đã hết hạn hay đã thu hồi thấy gì? | Màn Thêm lịch khi link hỏng | Hiện "Link mời không còn dùng được" hoặc "Link mời đã hết hạn" |
| CH-006 | 18/11/2026 | Tùng | Số booking trong thống kê tháng đếm theo tháng của ngày nhận, hay đếm ở mọi tháng có đêm của booking? | Màn thống kê | Chưa làm thống kê |
| CH-007 | 18/11/2026 | Tùng | Người dùng xóa tài khoản trên PWA ở đâu, xác nhận thế nào? Bản Zalo nhận sự kiện người dùng gỡ quyền của app từ Zalo, PWA không có. | Màn Cá nhân | `fn_xoa_tai_khoan` đã có, chưa có màn |
| CH-008 | 18/11/2026 | Tùng | Vercel gói Hobby theo điều khoản chỉ dành cho dùng cá nhân, không thương mại (cần kiểm lại điều khoản hiện tại). Home247 có thu phí sale sau này thì cần gói Pro. Bản thử với vài người dùng có ổn với Hobby không? | Phát hành production | Dùng Hobby cho staging và bản thử |

## Chưa rõ, hỏi khi làm tới

Mã `YC<n>-H<số>`, `PQ-H<số>`, `HV-H<số>` giữ từ bản Zalo. Mã `US<n>-H<số>` là chỗ chưa rõ nằm ngay trong story hoặc kịch bản kiểm tay của story đó, mã `LC-H<số>` nằm trong `docs/luat-chung/`: câu hỏi là câu đứng cạnh thẻ. Cột "Gắn ở" cho biết thẻ nằm ở file nào.

| Mã | Câu hỏi | Gắn ở |
|---|---|---|
| YC1-H1 | Sale chủ nhà thêm tay bằng tên và số (CN7-05) ghép với tài khoản thật của sale thế nào? (a) ghép khi số điện thoại trùng; (b) chỉ ghép qua link; (c) chủ gộp tay. | US17, US5 |
| YC1-H11 | Chủ nhà từ chối lời xin xem lịch ở A8 thì sale có được báo không? | US17 |
| YC1-H14 | Nút "Nhắc lại" ở CN7 và "Gửi link cho chủ nhà khác" ở A7 làm gì? | US5 |
| YC1-H26 | Tài khoản chọn vai chủ nhà mở link xin lịch của sale, hay vai sale bấm đồng ý ở A8: xử lý thế nào? | US6 |
| YC1-H31 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US22 |
| YC1-H32 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | luat-chung/PQ.md |
| YC2-H4 | Chuyển giữa lịch tháng (CN1) và lịch tuần (CN2) bằng gì? (a) nút đổi; (b) tự đổi theo số căn. | US9 |
| YC2-H5 | Ô "Có khách hôm nay", "Trống tối T7" ở CN2 tính cho hôm nay hay cho tuần đang xem? | US9 |
| YC2-H6 | Chạm một ngày đã qua ở lịch tháng thì mở gì? | US9 |
| YC3-H12 | Chọn được nhiều loại view cho một căn không? | US11 |
| YC3-H13 | Chạm thẻ căn ở CN5 mở gì; "Lưu thay đổi" ở CN5-02, "Lưu giá" ở CN6-02 về màn nào? | US7, US8 |
| YC3-H15 | Bỏ trống tên khi bật "Là ngày lễ" thì tên tự đặt là gì? | US8 |
| YC3-H16 | Xóa căn có hỏi lại một lần không? Gợi ý: có, như xóa đặt phòng. | US27 |
| YC4-H6 | "Đã bán 12 đặt phòng của bạn" ở CN9 đếm những đặt phòng nào? | US15 |
| YC4-H8 | Xóa đặt phòng xong về màn nào? | US10 |
| YC4-H9 | Tiền cọc lớn hơn tiền phòng thì báo gì? | US10, US3 |
| YC4-H13 | Chọn "Đã cọc · còn thu" thì số tiền cọc có bắt buộc không? | US3 |
| YC5-H15 | Lần gửi khách tính khi bấm gửi chữ, gửi ảnh, hay cả khi bấm sao chép? | US14 |
| YC6-H2 | Chủ căn tự nhập sau này dùng app thì căn tự nhập và đặt phòng cũ làm gì: ghép, giữ riêng hay xóa? | US16 |
| YC6-H14 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US16 |
| YC7-H7 | Giữa tháng thêm hay xóa căn thì mẫu số công suất tính thế nào? | US18, US27 |
| YC7-H8 | Thống kê của sale có chọn tháng khác không? | US19 |
| YC7-H14 | "Chưa thu tiền" gồm chỉ đặt phòng chưa cọc, hay cả phần còn thu của đặt phòng đã cọc? | US18 |
| YC9-H15 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US22 |
| YC9-H16 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US22 |
| YC9-H17 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | luat-chung/PQ.md |
| YC10-H4 | Sửa hoặc xóa một dải sau khi chủ nhà đã đặt giá theo dải đó: giá chủ nhà đã lưu giữ theo dải cũ hay đổi theo dải mới, có báo chủ nhà không. | US23 |
| YC10-H5 | Giới hạn "một dải tối đa 10 ngày" (quy tắc Dải ngày lễ do Home247 đặt) có áp cho dải người quản trị nhập không, hay chỉ cho dải chủ nhà sửa. | US23 |
| YC10-H9 | Bản đầu chưa có web quản trị: danh sách tòa đặt sẵn nạp bằng script như, hay để trống cho người dùng tự thêm. | US29 |
| YC10-H11 | Hai người thêm cùng một tòa với tên khác nhau ("ICON 40", "Icon40"): người quản trị gộp hay xóa thế nào, căn đang gắn tòa bị xóa thì sao. Người dùng thêm thoải mái nên chuyện này sẽ xảy ra. | US29 |
| YC10-H13 | Ai gỡ: đã trả lời bởi YC10.3 (chỉ quản trị viên đầu tiên, người này không bị gỡ). Còn mở: người bị gỡ đang đăng nhập thì mất quyền ngay không. Đề xuất: mất ngay, server kiểm danh sách ở mỗi lần gọi. | US34 |
| YC10-H14 | Mã đăng nhập: mấy chữ số, có hạn bao lâu, nhập sai mấy lần thì khóa, phiên quản trị giữ bao lâu. Gửi email cần dịch vụ gửi thư (việc tài khoản). | US34 |
| YC10-H15 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US34 |
| PQ-H1 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | luat-chung/PQ.md |
| PQ-H2 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | luat-chung/PQ.md |
| PQ-H3 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | luat-chung/PQ.md |
| PQ-H4 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | luat-chung/PQ.md |
| PQ-H5 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | luat-chung/PQ.md |
| PQ-H6 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | luat-chung/PQ.md |
| LC-H1 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | luat-chung/PQ.md |
| LC-H2 | QD-007 chỉ nói đã cọc hay chưa | luat-chung/PQ.md |
| LC-H3 | PQ10.SALE: gửi yêu cầu cho căn được chia sẻ, đêm còn trống (YC4.5); xem, hủy yêu cầu của mình; thấy lý do từ chối (YC4.7). Không thấy yêu cầu của sale khác (YC4 Ai thấy gì). Bị ngừng: không gửi yêu cầ | luat-chung/PQ.md |
| LC-H4 | Nhóm này cho người quản trị của Home247 (vai ADMIN) làm việc vận hành trên trang quản trị riêng, không nằm trong các tab của chủ nhà và sale. Mục đầu tiên là dải ngày lễ hằng năm mà chủ nhà chọn nhanh | luat-chung/Nghiep_vu.md |
| US1-H1 | bước 2 và 2.3 có gửi `ma_link` nhưng không nói server kiểm hay ghi gì với nó | US1 |
| US3-H1 | YC4.1.3-NT4 cho chủ nhà ghi tên khách trên đặt phòng của sale;ghi `sale_id \/ ten_khach_le`, tức một trong hai | US3 |
| US3-H2 | YC4.1.2 không có ô, YC4.1.3-NT4 nhắc "tên và số khách | US3 |
| US5-H1 | `TRANG_THAI_DA_DOI` / Dòng không phải `da_ket_noi` và không phải `chu_ngung` (ví dụ sale vừa bỏ nguồn, hoặc dòng thêm tay). Ngừng sale đã xóa tài khoản: . Dòng đã `chu_ngung`: trả kết quả như lần đầu, | US5 |
| US6-H1 | `LINK_KHONG_DUNG_DUOC` / Mã không có hoặc sai định dạng; link đã thu hồi; link quá hạn. Người tạo đã xóa tài khoản (YC1.3-NT6, YC1.7-NT4): . Thêm với `xin_lich`: người gọi đã ngừng sale đó (`ket_noi` | US6 |
| US6-H2 | `LINK_KHONG_DUNG_DUOC` / Link sai, thu hồi, quá hạn bước 4 kiểm lại link), hoặc link loại `xin_lich`. Người tạo đã xóa tài khoản: | US6 |
| US7-H1 | Cách "thay" giá có sẵn khi sao chép (phạm vi năm, tháng nguồn chưa đặt, dải chồng ngày của căn đích): . Các kịch bản dưới đây chỉ chạm ca không phụ thuộc phần này. | US7 |
| US8-H1 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US8 |
| US9-H1 | YC2.2 bước 2 đổi chip lọc hoặc đổi tháng thì số tiền và số đêm có đổi theo không, chưa vẽ | US9 |
| US9-H2 | YC2.5 ô trống chưa đặt giá (`gia_dem` là `null`) hiện gì trên bảng tuần | US9 |
| US9-H3 | YC2.3 danh sách sắp tới có hiện đặt phòng "Đã hủy" không và có giới hạn trong tháng đang xem không | US9 |
| US9-H4 | YC2.2 doanh thu có tính đặt phòng của căn đã ẩn không | US9 |
| US10-H1 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US10 |
| US10-H2 | YC4.3 nói "sửa người đặt", không nói hệ quả | US10 |
| US10-H3 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US10 |
| US10-H4 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US10 |
| US10-H5 | YC4.3 "sửa người đặt": đổi sang sale khác hay khách lẻ thì giá bán và thông báo ra sao | US10 |
| US10-H6 | YC4.2, YC4.3 sửa và thu đủ đặt phòng đang `cho_huy` hoặc đã `da_huy` (QD-012) | US10 |
| US10-H7 | YC4.3 chỉ đổi tiền phòng mà giữ ngày thì chia lại tiền các đêm theo bảng giá lúc ghi hay bảng giá hiện tại, QT4.2 | US10 |
| US10-H8 | YC4.3 bước 4 chỉ sửa ghi chú hay khách chủ nhà nhập, sale có được báo không | US10 |
| US10-H9 | S3-10 thẻ vàng ghi "Giá bán tính lại theo mức cộng", trái YC4.3 bước 5 và NT5 (giá bán giữ như đã báo khách) | US10 |
| US11-H1 | `khu_vuc` / chuỗi 1 đến 100 ký tự hoặc null / không / Người dùng nhập khu vực thế nào: . Server nhận nếu app gửi | US11 |
| US11-H2 | Khu vực của tòa người dùng thêm:  (YC3-H8 đã trả lời). Loại view chọn nhiều loại: , kịch bản chỉ chọn một loại. | US11 |
| US11-H3 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US11 |
| US11-H4 | Bước 3 danh sách có "Green Hạ Long Test" cùng ICON40, À La Carte, Sapphire.  (can-anh.md câu hỏi mở 4: khi chưa gõ chữ nào; danh sách có cả tòa người dùng khác thêm không) | kich-ban/US11 |
| US12-H1 | ngay_nhan / query / ngay / Có / Ngày trong quá khứ: | US12 |
| US12-H2 | toa_nha_id / query / danh sách id / Không / Chip "Khác": | US12 |
| US12-H3 | sap_xep / query / chuỗi / Không / Chỉ `ten` (S2 "Theo tên"). Các cách khác ở S2: | US12 |
| US12-H4 | Lọc "Giá mỗi đêm" (YC5.2 bước 3) chưa quyết: . | US12 |
| US12-H5 | tu / query / ngay / Không / Ngày đầu của 7 ngày. Mặc định `ngay_nhan`. | US12 |
| US12-H6 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US12 |
| US13-H1 | ngay_nhan / query / ngay / Không / Đi cùng `ngay_tra`. Mở từ S1 không có ngày: | US13 |
| US13-H2 | `so_tien` 0 lưu thành dòng `muc_cong` với 0, không xóa dòng. Cách quay về mức mặc định: . | US13 |
| US13-H3 | Mở S3 từ lịch 7 ngày S1 (YC5.1 bước 8): US6; ngày ở khi không có ngày khách hỏi chưa chốt . | US13 |
| US13-H4 | S3 của căn của tôi và căn tự nhập, giá bán có cộng cho căn của chính sale: chưa chốt . US này chỉ làm căn trong nguồn phòng. | US13 |
| US14-H1 | can_ids / thân / id[] / Có / 1 đến 20 căn, không trùng (giới hạn kỹ thuật; số tối đa theo nghiệp vụ: ). Thứ tự giữ như app gửi | US14 |
| US14-H2 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US14 |
| US15-H1 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US15 |
| US15-H2 | nguồn không nói, `gia_chu` của Thiet_ke_DB không có giá trị trống | US15 |
| US15-H3 | PQ10.SALE "yêu cầu đang chờ | US15 |
| US15-H4 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US15 |
| US15-H5 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US15 |
| US15-H6 | Chấp nhận khi sale đã bị ngừng hoặc đã bỏ nguồn sau lúc gửi: . Chấp nhận khi ngày nhận đã qua: . | US15 |
| US15-H7 | ly_do / `da_co_khach`, `dang_sua_phong`, `ly_do_khac` /  / Ba chip của CN9 (YC4.6 bước 5). Giá trị khác, kể cả `chu_nhan_dat_khac`, thì `DU_LIEU_SAI`: lý do đó chỉ server đặt | US15 |
| US15-H8 | "Lý do khác" có ô nhập chữ không: . Chưa có trường chữ cho lý do khác. | US15 |
| US15-H9 | Chọn "Lý do khác" có ô nhập chữ, bắt buộc chọn lý do:  (YC4-H3). Chỉ làm ba chip. | US15 |
| US16-H1 | PQ14.CHU: chủ nhà gọi hay với căn tự nhập của sale thì bị từ chối; chủ nhà gọi với `loai: "tu_nhap"` thì bị từ chối (mã lỗi: ). | US16 |
| US16-H2 | chưa có, YC6.1 bước 4, YC6.4 bước 5 | US16 |
| US17-H1 | nguồn không nói có đếm lần gửi link đã hết hạn không | US17 |
| US17-H2 | `LINK_KHONG_DUNG_DUOC` / Link sai, quá hạn (khi đặt hạn), link không phải loại `xin_lich` (sale đã xóa tài khoản: ), hoặc người gọi đã ngừng sale đó, YC1.7-NT4) | US17 |
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
| US21-H2 | YC3.8 không nói chủ nhà được bỏ chọn hết các thứ không | US21 |
| US21-H3 | `chu_nha` (P3) / Đặt phòng chưa cọc / `dat_phong_chua_coc` / Mã đặt mới Thiet_ke_DB). Không có trong YC9.3: | US21 |
| US21-H4 | PQ11.CHU chỉ nói chủ nhà không thấy, không nói gửi lên thì báo lỗi hay bỏ qua | US21 |
| US21-H5 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US21 |
| US21-H6 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | kich-ban/US21 |
| US22-H1 | **YC9.8 bản 3 đã gộp (PR #117, 04/11).** QD-013, r7, r8 đã trả lời các câu trước đây còn mở (sale có thấy căn, lịch không: không; tên hiện ra sao: tên cũ kèm ghi chú đỏ; mở lại app: thấy lại dữ liệu c | US22 |
| US22-H2 | PQ23.LINK, PQ18.LINK: link mời cũ của chủ nhà đã xóa tài khoản không trả tên căn, ảnh; link xin lịch của sale đã xóa tài khoản không trả số điện thoại; cả hai không tạo kết nối. Có trả tên cũ hay khôn | US22 |
| US22-H3 | Thẻ báo "Chị Hoa đã xóa tài khoản ngày 07/10" và câu "Đặt phòng này vẫn giữ để bạn đối chiếu với khách. …" (chữ theo canvas cũ, soát theo bản 3 ). | kich-ban/US22 |
| US22-H4 | Câu "Sale Hùng đã xóa tài khoản. Đặt phòng vẫn giữ trong lịch của bạn; app không còn số điện thoại của sale này." (chữ theo canvas cũ, soát theo bản 3 ). | kich-ban/US22 |
| US22-H5 | Bước 1: nhóm "ĐÃ KẾT NỐI" giảm 1 so với trước (4 thành 3). Dòng "Sale Hùng" kèm ghi chú đỏ "Đã xoá tài khoản", "Đặt phòng đã nhận từ sale này vẫn giữ trong lịch" (màn CN7 chưa vẽ,  (US22-Q4)). Không c | kich-ban/US22 |
| US22-H6 | **Mục đích:** link xin lịch của sale đã xóa không mở được, không lộ số của sale, không tạo kết nối. Chưa chạy tới khi trả lời: A8-01 ở YC9.8 bản 3 ghi , tên cũ có hiện không chưa chốt. Mong đợi dưới l | kich-ban/US22 |
| US22-H7 | **Mục đích:** link mời của chủ nhà đã xóa không hiện căn, ảnh, không tạo kết nối. Chưa chạy tới khi trả lời: A1-link-01 ở YC9.8 bản 3 ghi . Mong đợi dưới là của bản cũ. | kich-ban/US22 |
| US23-H1 | nguồn không nói; Thiet_ke_DB `ngay_le` không có ràng buộc | US23 |
| US24-H1 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US24 |
| US26-H1 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US26 |
| US26-H2 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US26 |
| US26-H3 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US26 |
| US27-H1 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US27 |
| US28-H1 | QT3.1 không nói tiền chênh âm | US28 |
| US28-H2 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US28 |
| US28-H3 | YC4.1.3 màn phía sale chưa vẽ | US28 |
| US28-H4 | YC4.1.3-NT4 chủ nhà ghi tên và số khách cho đặt phòng của sale, nhưngvà API chỉ nhận `sale_id` hoặc `ten_khach`, và CN4 chưa có ô số khách | US28 |
| US28-H5 | YC4.1.3 màn phía sale (thông báo, chi tiết đặt phòng, sửa giá bán) chưa vẽ | US28 |
| US28-H6 | YC4.1.3 bước 1 sale bật "Làm tròn lên 50.000đ" thì giá bán tự tính có làm tròn không | US28 |
| US28-H7 | YC4.1.3 bước 4 giá bán nhỏ hơn tiền phòng (tiền chênh âm) có được không, sale bị ngừng có sửa giá bán không | US28 |
| US28-H8 | YC9.3 còn ghi loại thông báo này chờ Tùng, trong khi YC9.3 đã chốt dòng 15 | US28 |
| US30-H1 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US30 |
| US30-H2 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US30 |
| US30-H3 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US30 |
| US34-H1 | hỏi thêm hàng PQ, xem  dưới | US34 |
| US34-H2 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US34 |
| US35-H1 | Câu hỏi là câu đứng cạnh thẻ ở file bên phải. | US35 |
| US35-H2 | Xin hủy đặt phòng đã qua ngày trả được không: . Xin hủy hết hạn sau bao lâu và hết hạn thì thành gì: . | US35 |
| US35-H3 | TRANG_THAI_DA_DOI / Đặt phòng không còn `cho_huy` (đã trả lời, hoặc hết hạn ) | US35 |

## Giả định đang dùng

Chỗ ghi "(giả định GD<số>)" là lựa chọn tạm để làm tiếp được. Code theo được, nhưng phải ghi trong PR. Tùng chốt khác thì sửa và ghi QD.

| Mã | Giả định |
|---|---|
| GD2 | Bản đầu chỉ cần báo trong app, chưa cần OA (YC9.3) |
| GD11 | Chủ nhà tự ghi booking trùng đêm với yêu cầu đang chờ thì yêu cầu đó cũng thành Bị từ chối, như khi chủ chấp nhận yêu cầu khác |
| GD12 | Booking chỉ có tổng tiền (căn tự nhập) thì tiền chênh chia đều cho các đêm khi chia theo tháng (QT3.2) |
| GD13 | Làm tròn giá bán lên 50.000đ từng đêm, rồi cộng các đêm (YC5.6, |
| GD14 | Nhãn "Mới thêm" ở thẻ căn hiện trong 24 giờ sau khi thêm (YC3.2-NT4) |
| GD15 | "Gần nhau" của quy tắc Gom thông báo là trong 10 phút (YC1-H16) |
| GD16 | Ô ngày ở lịch của sale hiện giá bán đã cộng mức cộng (YC5.1, |
| GD17 | "Tìm gần đây" lưu ở server, mỗi sale 5 lần (YC5.2, |
| GD18 | [chưa có nội dung, hỏi Tùng] |

## Đã trả lời

| Mã | Ngày trả lời | Câu trả lời (nguyên văn) | Đã áp dụng ở |
| --- | --- | --- | --- |
