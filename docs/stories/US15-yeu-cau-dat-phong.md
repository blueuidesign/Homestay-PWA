# US15 · Sale gửi yêu cầu đặt phòng, chủ nhà trả lời, tự hủy khi trùng

- Loại: tính năng
- Trạng thái: chưa làm
- Bản: 1
- Rủi ro: cao
- Làm sau khi xong: US13, US10, US17
- Kiểm tay: `tests/kich-ban/US15.md` (24 kịch bản)

## Mục tiêu
Là sale, tôi muốn gửi yêu cầu đặt phòng cho chủ nhà và biết kết quả (kèm chủ nhà chấp nhận hoặc từ chối trong app), để chốt đêm mà không phải gọi điện, và không bao giờ có hai yêu cầu cùng được nhận cho một đêm.

## Hành vi
Bảng bước ghi: người dùng làm gì, app hiện gì (chữ trong ngoặc kép là chữ trên màn), máy chủ phải làm gì, dữ liệu nào đổi. Cột "Máy chủ" mô tả việc phải xảy ra; bản PWA làm bằng RLS, view và hàm `fn_*` của Supabase.

### Sale gửi yêu cầu đặt phòng
Rủi ro: cao
Mục đích: sale xin chủ nhà nhận một booking cho khách của mình, mà không cần gọi điện.
Màn hình: S3-02, S3-03, S3-07, S3-08, S3-09
Khi nào xảy ra: sale ở chi tiết căn (S3) bấm "Gửi yêu cầu đặt phòng" (Tu_dien). Nút "Đặt phòng" chỉ dành cho chủ nhà (CN1).

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Bấm "Gửi yêu cầu đặt phòng" ở S3 | Mở S3-02 "Đặt phòng": thẻ căn, "Chị Hoa · 10/10 → 12/10 (2 đêm)", "Giá bán cho khách", "Giá chủ nhà", dòng "Chủ nhà: Chị Hoa · 2.200.000đ" | kiểm vai SALE, trả giá chủ và giá bán theo đêm | Không | Không |
| 2 | Nhập tin nhắn | Ô "Nhắn chủ nhà (không bắt buộc)" | Không gọi server | Không | Không |
| 3 | Bấm "Gửi yêu cầu đặt phòng" | Chạy mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5) nếu hồ sơ sale chưa có số (mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5); bấm "Để sau" vẫn gửi). Rồi server kiểm lại các đêm. Còn trống thì sang S3-03. Ghi chú: "Chủ nhà nhận yêu cầu trong app. Thành đặt phòng khi chủ nhà chấp nhận." | nếu người dùng đồng ý ở mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5). Rồi: kiểm vai SALE, tự tính `gia_chu`, `gia_ban`, không nhận giá từ app; đêm đã có booking thì `TRUNG_LICH`; ghi thông báo `sale_gui_yeu_cau` cho chủ nhà. | Ghi sự kiện "cần báo" cho chủ nhà (mục "Cài đặt thông báo" (US21), (giả định GD2)) | Tạo một yêu cầu đặt phòng ở trạng thái chờ |
| 4 | Xem S3-03 | "Đang chờ Chị Hoa chấp nhận", "Đã gửi lúc 14:20 trong app. Nhắn thêm qua Zalo để chủ nhà thấy nhanh hơn. Bạn được báo khi chủ nhà chấp nhận hoặc từ chối." Ba nút: "Nhắn chủ nhà qua Zalo", "Gọi chủ nhà", "Hủy yêu cầu" | Không gọi server | Nhắn qua cửa sổ Zalo; Gọi mở ứng dụng gọi | Không |
| 3b | Bấm "Gửi yêu cầu đặt phòng" vào căn của chủ nhà đã xóa tài khoản (mục "Khi người dùng xóa tài khoản" (US22)), từ màn mở trước đó | Báo ngay "Không gửi được yêu cầu. Chủ nhà đã xóa tài khoản trên Home247.", không tạo yêu cầu (QD-013) | trả `KHONG_CON_QUYEN`, `ly_do` "Chủ nhà đã xóa tài khoản trên Home247" | Không | Không đổi |
| 3a | Bấm "Gửi yêu cầu đặt phòng" khi đêm đã có booking được chấp nhận hoặc chủ nhà tự ghi | Báo lỗi "Căn này đã được đặt rồi", không tạo yêu cầu. Tải lại lịch của căn để thấy đêm đã kín (S3-07) | Kiểm trùng ở database, từ chối tạo yêu cầu | Không | Không đổi |
| 5 | Bấm "Hủy yêu cầu" | Yêu cầu thành "Đã hủy". Màn kết quả S3-08 | sale hủy yêu cầu `cho_chu` của mình, sang `da_huy` | Không | Yêu cầu chuyển sang Đã hủy |
| 6 | Chủ nhà không trả lời sau 2 tuần | Yêu cầu thành "Hết hạn", sale được báo rõ (S3-09), kèm mục căn tương tự; mỗi căn tương tự ghi giá bán của sale (mục "Sale nhận kết quả yêu cầu" bước 2) | Tự đổi trạng thái khi hết 14 ngày kể từ lúc gửi | Ghi sự kiện "cần báo" cho sale (mục "Cài đặt thông báo" (US21), (giả định GD2)) | Yêu cầu chuyển sang Hết hạn |

Theo quy tắc: Yêu cầu chưa phải booking; Sale thấy hai giá, chủ nhà thấy một giá; Trạng thái yêu cầu đặt phòng.

Trạng thái màn:
- rỗng: không áp dụng
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: theo HV4
- quay lại từ nền: S3-03 là màn chờ khi quay lại
- mở từ link: không áp dụng

### Chủ nhà nhận và trả lời yêu cầu
Rủi ro: cao
Mục đích: chủ nhà thấy yêu cầu từ sale, chấp nhận hoặc từ chối.
Màn hình: CN9-00, CN1-03, CN9, CN9-02, CN9-03
Khi nào xảy ra: chủ nhà mở app thấy thông báo yêu cầu, hoặc mở tab Lịch thấy khối yêu cầu. Bản đầu không có tin Zalo (mục "Cài đặt thông báo" (US21), (giả định GD2)).

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Nhận tin | CN9-00 (để dành cho bước thêm OA sau, mục "Cài đặt thông báo" (US21)): tin từ "Home247" ghi "Sale Hùng đặt phòng 1509", ngày ở, "Giá của bạn", lời nhắn của sale, nút "Xem và chấp nhận" | Thông báo `sale_gui_yeu_cau` ghi ở; app đọc bằng | Ghi sự kiện "cần báo" cho chủ nhà (mục "Cài đặt thông báo" (US21), (giả định GD2)) | Không |
| 2 | Mở tab Lịch | CN1-03: khối "YÊU CẦU ĐẶT PHÒNG · 2", mỗi dòng: tên sale, phòng, ngày, "gửi 10 phút trước", nhãn "Chờ bạn", nút "Xem và trả lời". Dòng trùng ngày ghi "trùng ngày với Sale Hùng" | yêu cầu tới căn của chủ nhà, có `gia_chu`, không có `gia_ban`, có cờ trùng đêm với yêu cầu chờ khác | Không | Không |
| 3 | Bấm "Xem và chấp nhận" hoặc "Xem và trả lời" | Cùng mở CN9: tên sale, "đã bán 12 đặt phòng của bạn", nút "Gọi", Phòng, Ngày ở, "Giá của bạn", mục "SALE NHẮN" | Như bước 2 (. Số "đã bán N đặt phòng": [MỞ: CH-022] chưa có; nhóm Booking CH-022) | Không | Không |
| 4 | Bấm "Chấp nhận đặt phòng" | Chạy mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5) nếu hồ sơ chủ nhà chưa có số (mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5): chấp thuận là kết nối; bấm "Để sau" vẫn chấp nhận). Rồi CN9-02: "Đã nhận đặt phòng 1509", "Đặt phòng đã vào lịch. Sale Hùng được báo." Nút "Xem đặt phòng" và "Về lịch" | nếu người dùng đồng ý ở mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5). Rồi: trong một giao dịch tạo booking `tu_yeu_cau`, `exclude` chặn trùng, ghi `booking_rieng`, yêu cầu sang `da_chot`, yêu cầu chờ trùng đêm sang `bi_tu_choi`, ghi thông báo cho mọi sale liên quan. Yêu cầu không còn `cho_chu` thì `TRANG_THAI_DA_DOI` | Ghi sự kiện "cần báo" cho sale (mục "Cài đặt thông báo" (US21), (giả định GD2)) | Yêu cầu thành booking; các đêm vào lịch |
| 5 | Bấm "Từ chối", chọn lý do, bấm "Gửi từ chối cho sale" | Bấm "Từ chối" hiện chip lý do "Đã có khách đặt", "Đang sửa phòng", "Lý do khác", nút "Gửi từ chối cho sale" và "Quay lại" (CN9). Gửi thì yêu cầu thành "Bị từ chối", sang CN9-03 | yêu cầu sang `bi_tu_choi`, ghi thông báo cho sale kèm lý do | Ghi sự kiện "cần báo" cho sale (mục "Cài đặt thông báo" (US21), (giả định GD2)) | Yêu cầu chuyển sang từ chối, kèm lý do đã chọn |

Theo quy tắc: Yêu cầu chưa phải booking; Sale thấy hai giá, chủ nhà thấy một giá.

Trạng thái màn:
- rỗng: CN1-03 chỉ hiện khối khi có yêu cầu chờ
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: CN9-00 mở đúng yêu cầu đó trong app "giống khi mở từ thông báo"

### Sale nhận kết quả yêu cầu
Rủi ro: tb
Mục đích: sale biết yêu cầu đã được nhận, bị từ chối hay hết hạn, và có việc tiếp theo.
Màn hình: S3-04, S3-05, S3-09, S3-04-01, S3-11
Khi nào xảy ra: chủ nhà chấp nhận, từ chối, chấp nhận yêu cầu khác trùng đêm, yêu cầu hết hạn, hoặc chủ nhà xóa tài khoản (mục "Khi người dùng xóa tài khoản" (US22); yêu cầu còn chờ khi đó giữ nguyên trạng thái chờ, bước 6).

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Chủ nhà chấp nhận | S3-04: "Chị Hoa đã chấp nhận đặt phòng", "Đặt phòng đã vào lịch của chủ nhà. Ngày 10/10 → 12/10 hiện Kín với các sale khác." Nút "Về lịch phòng" | Thông báo ghi ở; app đọc bằng và | Không | Đổi ở mục "Chủ nhà nhận và trả lời yêu cầu" bước 4: `yeu_cau_dat_phong.trang_thai` sang `da_chot`; thêm `booking`, `booking_dem`, `booking_rieng`, `thong_bao` |
| 2 | Chủ nhà từ chối | S3-05: "Chị Hoa không nhận đặt phòng", lý do nếu có, và mục "CĂN TƯƠNG TỰ TRỐNG CÙNG NGÀY" với nút "Xem tất cả căn trống". Mỗi căn tương tự ghi giá bán của sale (giá chủ nhà cộng mức cộng của sale, mục "Chi tiết căn và giá bán" (US13)), không ghi giá chủ nhà | Thông báo ghi ở. Căn tương tự: với `ghi_lich_su=false` cùng ngày, bỏ căn đã từ chối, giá là giá bán của sale | Không | Đổi ở mục "Chủ nhà nhận và trả lời yêu cầu" bước 5: `yeu_cau_dat_phong.trang_thai` sang `bi_tu_choi`, `ly_do`; thêm `thong_bao` |
| 3 | Chủ nhà chấp nhận yêu cầu khác trùng đêm, hoặc tự ghi booking trùng đêm | Cũng là "Bị từ chối": S3-05 với lý do "Chị Hoa đã nhận đặt phòng khác cho 10/10 → 12/10", cùng mục căn tương tự | hoặc bước 7, (giả định GD11)): yêu cầu chờ trùng đêm sang `bi_tu_choi` lý do `chu_nhan_dat_khac`, ghi thông báo cho sale. Căn tương tự như bước 2 | Không | `yeu_cau_dat_phong.trang_thai` sang `bi_tu_choi`, `ly_do` `chu_nhan_dat_khac`; thêm `thong_bao` |
| 4 | Hết 2 tuần chủ nhà không trả lời | S3-09: "Yêu cầu đã hết hạn vì Chị Hoa chưa trả lời trong 2 tuần", cùng mục căn tương tự | Việc chạy định kỳ mỗi 10 phút: `cho_chu` quá `het_han_luc` sang `het_han`, ghi thông báo `yeu_cau_het_han`; lúc đọc cũng coi yêu cầu quá hạn là hết hạn. Căn tương tự như bước 2 | Không | `yeu_cau_dat_phong.trang_thai` sang `het_han`; thêm `thong_bao` |
| 5 | Mở booking đã được chấp nhận của chủ nhà đã xóa tài khoản (mục "Khi người dùng xóa tài khoản" (US22)) | Booking vẫn còn, ngày, giá và tiền như lúc chấp nhận (mục "Khi người dùng xóa tài khoản" (US22) bước 5). Tên cũ của chủ nhà hiện kèm ghi chú nhỏ đỏ "Đã xoá tài khoản" (QD-013). Không có số điện thoại chủ nhà và nút gọi, nhắn (QD-013). Không mở được lịch hay chi tiết của căn đó, vì sale không thấy căn của chủ nhà đã xóa tài khoản. Sale đặt hay gửi yêu cầu đặt phòng vào căn của chủ nhà đó thì bị từ chối (QD-013); chữ báo cho sale: "Không gửi được yêu cầu. Chủ nhà đã xóa tài khoản trên Home247." (mục "Sale gửi yêu cầu đặt phòng" bước 3b, QD-013). Màn: S3-11 | Gửi booking và tên chủ nhà kèm cờ đã xóa tài khoản, không gửi căn, lịch, giá hiện tại, số điện thoại | | Không |
| 6 | Yêu cầu còn chờ thì một bên xóa tài khoản (mục "Khi người dùng xóa tài khoản" (US22) bước 6) | Yêu cầu giữ nguyên trạng thái "Chờ chủ", không tự hủy; sale vẫn thấy S3-03, tên chủ nhà (nếu chủ nhà xóa tài khoản) kèm ghi chú nhỏ đỏ "Đã xoá tài khoản". Quá 14 ngày vẫn thành "Hết hạn" như thường (bước 4, mục "Sale gửi yêu cầu đặt phòng" bước 6). QD-013 cũ (tự hủy, lý do "Chủ nhà đã xóa tài khoản") không còn đúng (QD-013) | Không đổi trạng thái khi xóa tài khoản; việc hết hạn chạy như thường | | Không |

Theo quy tắc: Trạng thái yêu cầu đặt phòng.

Trạng thái màn:
- rỗng: không áp dụng
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: mở từ thông báo (P13): S3-04-01

### Yêu cầu trùng ngày
Rủi ro: cao
Mục đích: tránh hai yêu cầu cho cùng căn, cùng đêm cùng được nhận.
Màn hình: CN1-03, CN9, CN9-02, S3-05
Khi nào xảy ra: hai sale gửi yêu cầu có đêm trùng nhau cho cùng một căn, hoặc chủ nhà ghi booking trùng với yêu cầu đang chờ.

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Chủ nhà mở tab Lịch | CN1-03 đánh dấu yêu cầu trùng ngày ("18/10 → 19/10 · trùng ngày với Sale Hùng") | có cờ trùng đêm với yêu cầu chờ khác (US15-NT17) | Không | Không |
| 2 | Mở CN9 | Cảnh báo: "Trùng 18/10 với yêu cầu của Sale Lan. Chấp nhận yêu cầu này thì yêu cầu của Sale Lan bị từ chối và Sale Lan được báo." | Như bước 1 (| Không | Không |
| 3 | Chấp nhận | CN9-02: "Yêu cầu của Sale Lan (18/10 → 19/10) đã bị từ chối. Sale Lan được báo." | Đổi các yêu cầu trùng đêm sang Bị từ chối | Ghi sự kiện "cần báo" cho Sale Lan (mục "Cài đặt thông báo" (US21), (giả định GD2)) | Yêu cầu trùng chuyển sang Bị từ chối |
| 4 | Chủ nhà tự ghi booking (mục "Chủ nhà ghi booking mới" (US3)) trùng ngày với yêu cầu đang chờ | Yêu cầu trùng thành "Bị từ chối", sale nhận S3-05 (giả định GD11) | Như bước 3 | Ghi sự kiện "cần báo" cho sale (mục "Cài đặt thông báo" (US21), (giả định GD2)) | Yêu cầu chuyển sang Bị từ chối |

Sau khi đêm đã có booking, yêu cầu mới cho đêm đó bị chặn ngay lúc gửi (mục "Sale gửi yêu cầu đặt phòng" bước 3a).
Theo quy tắc: Trạng thái yêu cầu đặt phòng; Chặn trùng lịch (QT1.4).

Trạng thái màn:
- rỗng: không áp dụng
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

## Tiêu chí nghiệm thu
Mỗi tiêu chí một test tự động mang đúng mã này trong tên test. Mã không đổi nghĩa; đổi hành vi thì cấp mã mới (docs/QUY_TRINH.md mục 5).

- **US15-NT1** Khi sale bấm "Gửi yêu cầu đặt phòng", thì app chuyển sang S3-03 và ghi giờ đã gửi.
- **US15-NT2** Khi yêu cầu đang chờ, thì booking chưa vào lịch của chủ nhà và các sale khác vẫn thấy ngày đó là trống.
- **US15-NT3** Khi sale xem S3-02, thì thấy cả giá bán cho khách và giá chủ nhà. Theo quy tắc: Sale thấy hai giá, chủ nhà thấy một giá.
- **US15-NT4** Khi sale gửi yêu cầu 18/10 → 19/10 mà đêm 18/10 đã có booking, thì app báo "Căn này đã được đặt rồi", không tạo yêu cầu, và lịch của căn hiện 18/10 là kín.
- **US15-NT5** Khi sale bấm "Hủy yêu cầu", thì yêu cầu có nhãn "Đã hủy" và biến khỏi khối yêu cầu của chủ nhà. `[đã có test database: t_11_ket_noi_quan_tri.sql]`
- **US15-NT6** Khi yêu cầu gửi lúc 14:20 ngày 01/10 mà chủ nhà chưa trả lời tới 14:20 ngày 15/10, thì yêu cầu có nhãn "Hết hạn" và sale được báo. `[đã có test database: t_11_ket_noi_quan_tri.sql]`
- **US15-NT7** Khi hồ sơ sale chưa có số điện thoại và sale bấm "Gửi yêu cầu đặt phòng" ở S3-02, thì popup giải thích xin tên và số hiện trước hộp thoại Zalo; bấm "Để sau" thì yêu cầu vẫn được gửi và app sang S3-03. (mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5))
- **US15-NT8** Khi chủ nhà bấm thông báo trong app hoặc "Xem và trả lời" ở lịch, thì app mở đúng yêu cầu đó ở CN9.
- **US15-NT9** Khi chủ nhà ở CN9, thì chỉ thấy "Giá của bạn" và không thấy giá bán cho khách. Theo quy tắc: Sale thấy hai giá, chủ nhà thấy một giá.
- **US15-NT10** Khi chủ nhà bấm "Chấp nhận đặt phòng", thì booking vào lịch với các đêm của yêu cầu và sale được báo. `[đã có test database: t_08_thong_bao.sql]`
- **US15-NT11** Khi chủ nhà bấm "Từ chối" ở CN9, thì hiện ba chip lý do "Đã có khách đặt", "Đang sửa phòng", "Lý do khác"; chọn "Đã có khách đặt" rồi bấm "Gửi từ chối cho sale" thì app sang CN9-03, yêu cầu có nhãn "Bị từ chối" và sale thấy lý do "Đã có khách đặt" ở S3-05.
- **US15-NT12** Khi chủ nhà chấp nhận, thì sale thấy S3-04 và ngày đó Kín với các sale khác.
- **US15-NT13** Khi chủ nhà từ chối, thì sale thấy S3-05 kèm danh sách căn tương tự còn trống cùng ngày.
- **US15-NT14** Khi chủ nhà chấp nhận yêu cầu của sale khác trùng đêm, thì yêu cầu của sale này có nhãn "Bị từ chối" và S3-05 ghi lý do chủ nhà đã nhận đặt phòng khác.
- **US15-NT15** Khi yêu cầu hết hạn, thì sale thấy S3-09 ghi rõ lý do và danh sách căn tương tự.
- **US15-NT16** Khi sale xem mục căn tương tự ở S3-05 hoặc S3-09, thì mỗi căn ghi giá bán của sale cho các đêm đó, không ghi giá chủ nhà.
- **US15-NT17** Khi hai yêu cầu có đêm trùng nhau, thì mỗi yêu cầu hiện nhãn trùng ngày ở CN1-03 và cảnh báo ở CN9.
- **US15-NT18** Khi chủ nhà chấp nhận một yêu cầu, thì mọi yêu cầu trùng đêm với nó có nhãn "Bị từ chối" và sale của chúng được báo. `[đã có test database: t_08_thong_bao.sql]`
- **US15-NT19** Khi chủ nhà tự ghi booking trùng đêm với một yêu cầu đang chờ, thì yêu cầu đó có nhãn "Bị từ chối". (giả định GD11)

## Luật kiểm dữ liệu và lỗi
Mỗi mục là một việc app nhờ database làm. "Đầu vào" là luật kiểm từng ô, "Lỗi riêng" là khi nào phải từ chối. Cột "Mã" là tên gọi trong tài liệu; hàm database báo lỗi bằng một câu tiếng Việt cho người dùng đọc (docs/luat-chung/Nghiep_vu.md mục Lỗi).

### Sale gửi yêu cầu đặt phòng cho một căn được chia sẻ
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| can_id | id | có | Căn có `loai` `co_lich` |
| ngay_nhan | ngay | có | Ngày nhận trước hôm nay: [MỞ: US15-H1] nguồn không nói |
| ngay_tra | ngay | có | Sau `ngay_nhan`. Tối đa 366 đêm (giới hạn kỹ thuật) |
| loi_nhan | chuỗi hoặc null | không | Tối đa 500 ký tự. Chuỗi toàn khoảng trắng coi là `null` |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| DU_LIEU_SAI | Thiếu ô, sai kiểu, `ngay_tra` không sau `ngay_nhan`, quá 366 đêm, `loi_nhan` quá 500 ký tự. Kèm `o` |
| TRUNG_LICH | Có ít nhất một đêm thuộc một đặt phòng chưa hủy của căn đó. `ly_do`: "Căn này đã được đặt rồi" (QT1.4, QT1.4-VD1, US15-NT4) |
| KHONG_CON_QUYEN | Sale bị ngừng, sale đã bỏ nguồn, chủ nhà đã xóa tài khoản (: `ly_do` "Chủ nhà đã xóa tài khoản trên Home247"; app báo ngay "Không gửi được yêu cầu. " kèm lý do này, QD-013; API đọc: "Chủ nhà đã xóa tài khoản") |
| KHONG_TIM_THAY | Căn đã bị xóa. Chủ nhà đã xóa tài khoản không còn ở dòng này: căn không bị xóa (QD-013) |
Có đêm chủ nhà chưa đặt giá ("Chưa đặt"): [MỞ: US15-H2] nguồn không nói, `gia_chu` của Thiet_ke_DB không có giá trị trống. Trường hợp này chưa code.

### Danh sách yêu cầu theo phía của người gọi
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| phia | `nhan` hoặc `gui` | có | |
| trang_thai | danh sách cách nhau dấu phẩy | không | Mỗi giá trị là một trong năm trạng thái. Không có thì trả mọi trạng thái. Lọc theo trạng thái sau khi tính hết hạn lúc đọc: `cho_chu` không gồm yêu cầu đã quá hạn, `het_han` gồm cả chúng |
| can_id | id | không | Chỉ với `phia=nhan`. Căn không phải của người gọi thì danh sách rỗng |
| truoc | chuỗi | không | Con trỏ (README) |
| gioi_han | số nguyên 1 đến 100 | không | Mặc định 50 |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| DU_LIEU_SAI | Thiếu `phia`, `trang_thai` lạ, `can_id` đi với `phia=gui`. Kèm `o` |
Sale bị ngừng đọc yêu cầu cũ của mình với chủ nhà đó: [MỞ: US15-H3] PQ10.SALE "yêu cầu đang chờ";nói mọi API lịch của sale trả `KHONG_CON_QUYEN` trừ đọc đặt phòng cũ. ].

### Chi tiết một yêu cầu
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| id | id | có | |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| KHONG_TIM_THAY | Không có yêu cầu, hoặc người gọi không phải CHU hay SALE của nó. Từ QD-013 webhook không xóa yêu cầu nào |
Sale bị ngừng: [MỞ: US15-H4].

### Chủ nhà chấp nhận yêu cầu; yêu cầu thành đặt phòng `tu_yeu_cau`
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| id | id | có | |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| TRANG_THAI_DA_DOI | Yêu cầu không còn `cho_chu`: đã hết hạn (kể cả quá hạn chưa qua việc định kỳ), sale đã hủy, đã bị từ chối vì chủ nhà vừa ghi đặt phòng trùng đêm (giả định GD11), đã chấp nhận ở máy khác. App làm theo HV3 bước 4 |
| TRUNG_LICH | Ràng buộc `exclude` báo trùng khi ghi `booking`. Không ghi gì (QT1.1). Bình thường không xảy ra vì mọi lệnh ghi đặt phòng đã đổi yêu cầu chờ trùng đêm; mã này là chỗ chặn cuối |
Chấp nhận khi sale đã bị ngừng hoặc đã bỏ nguồn sau lúc gửi: [MỞ: US15-H5] PQ10.SALE. Chấp nhận khi ngày nhận đã qua: [MỞ: US15-H6].

### Chủ nhà từ chối yêu cầu kèm lý do
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| id | id | có | |
| ly_do | `da_co_khach`, `dang_sua_phong`, `ly_do_khac` | [MỞ: US15-H7] | Ba chip của CN9 (mục "Chủ nhà nhận và trả lời yêu cầu" bước 5). Giá trị khác, kể cả `chu_nhan_dat_khac`, thì `DU_LIEU_SAI`: lý do đó chỉ server đặt |
"Lý do khác" có ô nhập chữ không: [MỞ: US15-H8]. Chưa có trường chữ cho lý do khác.

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| DU_LIEU_SAI | `ly_do` không phải ba giá trị trên. Kèm `o: "ly_do"` |
| TRANG_THAI_DA_DOI | Yêu cầu không còn `cho_chu` (đã hết hạn, đã hủy, đã chấp nhận, đã bị từ chối) |

### Sale hủy yêu cầu đang chờ của mình
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| id | id | có | |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| TRANG_THAI_DA_DOI | Yêu cầu không còn `cho_chu`: chủ nhà vừa chấp nhận hay từ chối, đã hết hạn, đã hủy |
Sale bị ngừng hủy yêu cầu đang chờ: [MỞ: US15-H5] PQ10.SALE.

## Luật chung dùng
Nguyên văn ở `docs/luat-chung/` (QT.md, HV.md, Nghiep_vu.md, Tu_dien.md), tìm theo mã hoặc tên.

Quy tắc trong nhóm Booking: Yêu cầu chưa phải booking, Sale thấy hai giá, chủ nhà thấy một giá, Trạng thái yêu cầu đặt phòng, Chủ nhà chỉ làm việc với sale. QT1.1, QT1.4 (QT1.4-VD1, QT1.4-VD2), QT2.1. mục "Cài đặt thông báo" (US21) (bản đầu chỉ báo trong app), Tu_dien, mục "Cài đặt thông báo" (US21), mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5). (giả định GD2) báo trong app, (giả định GD11) chủ nhà tự ghi booking trùng thì yêu cầu bị từ chối. HV1 đến HV5.

## Màn hình
Hình: `python3 docs/thiet-ke/trich-man.py <mã màn>` (docs/thiet-ke/README.md). Chữ và số trên hình lệch story thì story đúng.

S3-02, S3-03, S3-07, S3-08, S3-09, S3-04, S3-05, S3-04-01 (mở từ thông báo), CN1-03, CN9, CN9-02, CN9-03; CN9-00 để dành cho tin Zalo sau (mục "Cài đặt thông báo" (US21)). Popup xin số: S3-02-P1, S3-02-P2, CN9-P1, CN9-P2 (phần dùng chung làm ở US5).

**CN1-03 · Lịch · có yêu cầu từ sale**
Vào từ: Xem YC (canvas chưa có mũi tên tới màn này)
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Tiêu đề | "Lịch Đặt phòng" | Canvas |
| 2 | Khối nội dung | "YÊU CẦU ĐẶT PHÒNG · 2 Sale Hùng đặt phòng 1509 17/10 → 19/10 · gửi 10 phút trước Chờ bạn Xem và trả lời Sale Lan đặt phòng 1509 18/10 → 19/10 · trùng ngày với Sale Hùng Chờ bạn Xem và trả lời" | Canvas |
| 3 | Khối nội dung | "Tháng 10/2026 T2 T3 T4 T5 T6 T7 CN 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31" | Canvas |
| 4 | Thanh tab | Lịch · Căn · Sale · Thống kê · Cá nhân | Cố định |
| 5 | Cỡ chữ, vùng bấm | Chữ tối thiểu 14 px, vùng bấm tối thiểu 44 px | CLAUDE.md |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Đặt phòng" | Mở màn CN4 | CN4 |
| "Xem và trả lời" | Mở màn CN9 | CN9 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- không có quyền: chưa thiết kế

**CN9-00 · Tin nhắn Zalo gửi chủ nhà**
Vào từ: Zalo, khi sale gửi yêu cầu
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Đầu tin | "Home247 · Tin nhắn Zalo · Hôm nay 14:21" | Cố định |
| 2 | Nội dung | "Sale Hùng đặt phòng 1509", "Ngày ở 17/10 → 19/10 (2 đêm)", "Giá của bạn 2.200.000đ", lời nhắn | Yêu cầu |
| 3 | Nút | "Xem và chấp nhận" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Xem và chấp nhận" | Mở đúng yêu cầu trong app | CN9 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- đang tải: chưa thiết kế (HV1)
- lỗi mạng: chưa thiết kế (HV2)
- quay lại từ nền: chưa thiết kế (HV3)

**CN9-02 · Đã chấp nhận đặt phòng**
Vào từ: CN9, bấm "Chấp nhận đặt phòng"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Thẻ xanh | "✓ Đã nhận đặt phòng 1509", "Đặt phòng đã vào lịch. Sale Hùng được báo." | Đặt phòng |
| 2 | Chi tiết | Phòng, Ngày ở, Giá của bạn, Sale | |
| 3 | Dòng trùng | "Yêu cầu của Sale Lan (18/10 → 19/10) đã bị từ chối. Sale Lan được báo." | Yêu cầu trùng |
| 4 | Nút | "Xem đặt phòng", "Về lịch" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Xem đặt phòng" | Chi tiết booking | CN3-02 |
| "Về lịch" | Về lịch | CN1 |
Trạng thái riêng:
- đang tải: chưa thiết kế (HV1)
- lỗi mạng: chưa thiết kế (HV2)
- không có quyền: chưa thiết kế (HV5)
- quay lại từ nền: chưa thiết kế (HV3)

**CN9-03 · Đã từ chối yêu cầu**
Vào từ: CN9, bấm "Gửi từ chối cho sale"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Thẻ | "Đã từ chối yêu cầu của Sale Hùng", "Sale Hùng được báo kèm lý do "Đã có khách đặt". Ngày 17/10 → 19/10 vẫn trống trong lịch." | Yêu cầu, lý do |
| 2 | Chi tiết | Phòng 1509, Ngày ở 17/10 → 19/10 (2 đêm), Giá của bạn 2.200.000đ, Sale Hùng | Yêu cầu |
| 3 | Nút | "Về lịch" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Về lịch" | Về lịch | CN1 |
Trạng thái riêng:
- đang tải: chưa thiết kế (HV1)
- lỗi mạng: chưa thiết kế (HV2)
- không có quyền: chưa thiết kế (HV5)
- quay lại từ nền: chưa thiết kế (HV3)

**CN9-P1 · Chấp nhận · giải thích xin tên và số**
Vào từ: CN9, bấm việc cần tên và số khi hồ sơ chưa có số
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Màn gốc | Chép đúng CN9, phủ lớp tối | CN9 |
| 2 | Popup dưới đáy | Biểu tượng điện thoại, tiêu đề "Chia sẻ tên và số điện thoại với sale", lý do, bước "Zalo sẽ hiện hộp thoại. Bật Tên và ảnh đại diện, Số điện thoại rồi bấm Cho phép." | mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5) Sửa r4 |
| 3 | Nút | "Đồng ý, tiếp tục", "Để sau", dòng "Để sau vẫn … được" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Đồng ý, tiếp tục" | Mở hộp thoại Zalo | CN9-P2 |
| "Để sau" | Làm tiếp việc gốc không có số | CN9-02 |

**CN9-P2 · Chấp nhận · hộp thoại Zalo**
Vào từ: CN9-P1, bấm "Đồng ý, tiếp tục"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Màn gốc | Chép đúng CN9, phủ lớp tối | CN9 |
| 2 | Hộp thoại minh họa | "Tên và ảnh đại diện · Nguyễn Hoa", "Số điện thoại · 0904 118 772", nút "Cho phép" | Zalo |
| 3 | Ghi chú | Ghi chú trên màn: Zalo hiện một hộp thoại có hai dòng hay hai hộp thoại nối nhau, thứ tự nào: chờ | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Cho phép" | Lưu tên, ảnh, số vào hồ sơ, làm tiếp việc gốc | CN9-02 |

**S3-02-P1 · Gửi yêu cầu · giải thích xin tên và số**
Vào từ: S3-02, bấm việc cần tên và số khi hồ sơ chưa có số
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Màn gốc | Chép đúng S3-02, phủ lớp tối | S3-02 |
| 2 | Popup dưới đáy | Biểu tượng điện thoại, tiêu đề "Chia sẻ tên và số điện thoại với chủ nhà", lý do, bước "Zalo sẽ hiện hộp thoại. Bật Tên và ảnh đại diện, Số điện thoại rồi bấm Cho phép." | mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5) Sửa r4 |
| 3 | Nút | "Đồng ý, tiếp tục", "Để sau", dòng "Để sau vẫn … được" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Đồng ý, tiếp tục" | Mở hộp thoại Zalo | S3-02-P2 |
| "Để sau" | Làm tiếp việc gốc không có số | S3-03 |

**S3-02-P2 · Gửi yêu cầu · hộp thoại Zalo**
Vào từ: S3-02-P1, bấm "Đồng ý, tiếp tục"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Màn gốc | Chép đúng S3-02, phủ lớp tối | S3-02 |
| 2 | Hộp thoại minh họa | "Tên và ảnh đại diện · Sale Hùng", "Số điện thoại · 0912 345 678", nút "Cho phép" | Zalo |
| 3 | Ghi chú | Ghi chú trên màn: Zalo hiện một hộp thoại có hai dòng hay hai hộp thoại nối nhau, thứ tự nào: chờ | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Cho phép" | Lưu tên, ảnh, số vào hồ sơ, làm tiếp việc gốc | S3-03 |

**S3-03 · Chờ chủ nhà trả lời**
Vào từ: S3-02, gửi thành công
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Thẻ căn | "ICON40 1509 · 2PN", "Chị Hoa · 10/10 → 12/10 (2 đêm)" | Yêu cầu |
| 2 | Hai giá | "Giá bán cho khách 2.600.000đ", "Giá chủ nhà 2.200.000đ" | Yêu cầu, giá sale |
| 3 | Thẻ chờ | "Đang chờ Chị Hoa chấp nhận", "Đã gửi lúc 14:20 trong app..." | Yêu cầu |
| 4 | Ba nút | "Nhắn chủ nhà qua Zalo", "Gọi chủ nhà", "Hủy yêu cầu"; bấm "Hủy yêu cầu" đổi thành "Xác nhận hủy yêu cầu?" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Nhắn chủ nhà qua Zalo" | Mở chat Zalo | Zalo |
| "Gọi chủ nhà" | Mở ứng dụng gọi | |
| "Hủy yêu cầu" rồi "Xác nhận hủy yêu cầu?" | Yêu cầu thành Đã hủy | S3-08 |
Trạng thái riêng:
- đang tải: chưa thiết kế (HV1)
- lỗi mạng: chưa thiết kế (HV2)
- không có quyền: chưa thiết kế (HV5)
- quay lại từ nền: S3-03 là màn chờ khi quay lại

**S3-04-01 · Kết quả yêu cầu · mở từ thông báo**
Vào từ: P13, chạm thông báo "Chị Hoa đã chấp nhận đặt phòng"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 0 | Màn gốc | Chép đúng màn S3-04 trên canvas, chỉ đổi phần trạng thái. | S3-04 |
| 1 | Dải xanh | "Mở từ thông báo · bấm quay lại về Thông báo" | |
| 2 | Thẻ căn | "ICON40 1509 · 2PN", "Chị Hoa · 10/10 → 12/10 (2 đêm)" | |
| 3 | Thẻ xanh | "✓ Chị Hoa đã chấp nhận đặt phòng" | |
| 4 | Nút | "Về lịch phòng" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Quay lại | Về Thông báo | P13 |
| "Về lịch phòng" | Về lịch | S1 |
Trạng thái riêng:
- mở từ link: chính là màn này

**S3-04 · Chủ nhà đã chấp nhận**
Vào từ: Thông báo khi chủ nhà chấp nhận
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Thẻ căn | "ICON40 1509 · 2PN", "Chị Hoa · 10/10 → 12/10 (2 đêm)" | Yêu cầu |
| 2 | Hai giá | "Giá bán cho khách 2.600.000đ", "Giá chủ nhà 2.200.000đ" | Yêu cầu, giá sale |
| 3 | Báo | "✓ Chị Hoa đã chấp nhận đặt phòng", "Đặt phòng đã vào lịch của chủ nhà…" | Kết quả |
| 4 | Nút | "Về lịch phòng" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Về lịch phòng" | Về lịch | S1 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- đang tải: chưa thiết kế (HV1)
- lỗi mạng: chưa thiết kế (HV2)
- quay lại từ nền: chưa thiết kế (HV3)

**S3-05 · Yêu cầu bị từ chối**
Vào từ: Chủ nhà bấm "Gửi từ chối cho sale" ở CN9; Chủ nhà chấp nhận yêu cầu khác hoặc tự ghi booking trùng đêm; Thông báo ở P13
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Thẻ căn | "ICON40 1509 · 2PN", "Chị Hoa · 10/10 → 12/10 (2 đêm)" | Yêu cầu |
| 2 | Hai giá | "Giá bán cho khách 2.600.000đ", "Giá chủ nhà 2.200.000đ" | Yêu cầu, giá sale |
| 3 | Thẻ đỏ | "Yêu cầu bị từ chối", "Lý do: Chị Hoa không nhận đặt phòng · Đã có khách đặt." Khi trùng đêm, dòng lý do là "Chị Hoa đã nhận đặt phòng khác cho 10/10 → 12/10." | Yêu cầu, lý do chủ chọn |
| 4 | Mục căn tương tự | "CĂN TƯƠNG TỰ TRỐNG CÙNG NGÀY": "Sapphire 1103 · 3PN / 2.400.000đ · Anh Tuấn", "À La Carte 2208 · 1PN / 2.500.000đ · Chị Hoa" | Tìm căn trống cùng ngày |
| 5 | Nút dính đáy | "Xem tất cả căn trống" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Một căn tương tự | Mở chi tiết căn | S3 |
| "Xem tất cả căn trống" | Kết quả tìm cùng ngày | S2 |
Trạng thái riêng:
- đang tải: chưa thiết kế (HV1)
- lỗi mạng: chưa thiết kế (HV2)
- không có quyền: chưa thiết kế (HV5)
- quay lại từ nền: chưa thiết kế (HV3)
- mở từ link: chưa thiết kế

**S3-07 · "Lỗi khi gửi: căn đã được đặt"**
Vào từ: S3-02, bấm "Gửi yêu cầu đặt phòng" khi đêm đã có booking
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Thẻ căn | "ICON40 1509 · 2PN", "Chị Hoa · 10/10 → 12/10 (2 đêm)" | Yêu cầu |
| 2 | Hai giá | "Giá bán cho khách 2.600.000đ", "Giá chủ nhà 2.200.000đ" | Yêu cầu, giá sale |
| 3 | Bảng đặt phòng | Như S3-02 | |
| 4 | Hộp lỗi | "⚠️ Căn này đã được đặt rồi", "Đêm 10/10 và 11/10 vừa có người đặt. Yêu cầu chưa được gửi. Lịch của căn đã tải lại:", 4 ô ngày: T6 09 1,3tr; T7 10 Kín; CN 11 Kín; T2 12 900k | Lịch căn tải lại |
| 5 | Nút | "Tìm căn khác cùng ngày" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Tìm căn khác cùng ngày" | Kết quả tìm cùng ngày | S2 |
Trạng thái riêng:
- đang tải: chưa thiết kế (HV1)
- lỗi mạng: chưa thiết kế (HV2)
- không có quyền: chưa thiết kế (HV5)
- quay lại từ nền: chưa thiết kế (HV3)

**S3-08 · Sale đã hủy yêu cầu**
Vào từ: S3-03, bấm "Xác nhận hủy yêu cầu?"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Thẻ căn | "ICON40 1509 · 2PN", "Chị Hoa · 10/10 → 12/10 (2 đêm)" | Yêu cầu |
| 2 | Hai giá | "Giá bán cho khách 2.600.000đ", "Giá chủ nhà 2.200.000đ" | Yêu cầu, giá sale |
| 3 | Thẻ | "Đã hủy yêu cầu", "Bạn đã hủy yêu cầu đặt phòng 10/10 → 12/10. Chị Hoa không còn thấy yêu cầu này." | Yêu cầu |
| 4 | Nút | "Về lịch phòng" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Về lịch phòng" | Về lịch | S1 |
Trạng thái riêng:
- đang tải: chưa thiết kế (HV1)
- lỗi mạng: chưa thiết kế (HV2)
- không có quyền: chưa thiết kế (HV5)
- quay lại từ nền: chưa thiết kế (HV3)

**S3-09 · Yêu cầu hết hạn**
Vào từ: Thông báo hết hạn (P13); S7-03, dòng "Hết hạn"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Thẻ căn | "ICON40 1509 · 2PN", "Chị Hoa · 10/10 → 12/10 (2 đêm)" | Yêu cầu |
| 2 | Hai giá | "Giá bán cho khách 2.600.000đ", "Giá chủ nhà 2.200.000đ" | Yêu cầu, giá sale |
| 3 | Thẻ vàng | "Yêu cầu đã hết hạn", "Yêu cầu đã hết hạn vì Chị Hoa chưa trả lời trong 2 tuần. Gửi lúc 14:20 ngày 22/09." | Yêu cầu |
| 4 | Mục căn tương tự | "CĂN TƯƠNG TỰ TRỐNG CÙNG NGÀY": "Sapphire 1103 · 3PN / 2.400.000đ · Anh Tuấn", "À La Carte 2208 · 1PN / 2.500.000đ · Chị Hoa" | Tìm căn trống cùng ngày |
| 5 | Nút dính đáy | "Xem tất cả căn trống" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Một căn tương tự | Mở chi tiết căn | S3 |
| "Xem tất cả căn trống" | Kết quả tìm cùng ngày | S2 |
Trạng thái riêng:
- đang tải: chưa thiết kế (HV1)
- lỗi mạng: chưa thiết kế (HV2)
- không có quyền: chưa thiết kế (HV5)
- quay lại từ nền: chưa thiết kế (HV3)
- mở từ link: chưa thiết kế

**S3-11 · Đặt phòng với chủ nhà đã xóa**
Vào từ: S7-03-01, chạm dòng booking; P13 cũ trỏ tới booking
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Màn gốc | Chép đúng S3-04, tiêu đề "Đặt phòng của bạn" | S3-04 |
| 2 | Thẻ căn | "ICON40 1509 · 2PN", "Chị Hoa" kèm nhãn "đã xóa tài khoản", "10/10 → 12/10 (2 đêm)" | Đặt phòng |
| 3 | Hai giá | "Giá bán cho khách 2.600.000đ", "Giá chủ nhà 2.200.000đ" | Đặt phòng lúc chấp nhận (QD-013, chờ duyệt) |
| 4 | Thẻ báo | "Chị Hoa đã xóa tài khoản ngày 07/10", "Đặt phòng này vẫn giữ để bạn đối chiếu với khách. App không còn số điện thoại, căn và lịch của chủ nhà này. Tên căn và giá giữ theo lúc chủ nhà chấp nhận." | Sự kiện xóa |
| 5 | Nút | "Về lịch phòng". Không có gọi, nhắn, mở lịch căn | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Về lịch phòng" | Về lịch | S1 |
Trạng thái riêng:
- không có quyền: theo HV5

## Quyền
Ô quyền theo `docs/luat-chung/PQ.md`. Mỗi ô phải có test chứng minh người không có quyền thì không đọc, không ghi được; test ở lớp database (`tests/db/`).

Ô PQ chạm tới (ma trận `docs/luat-chung/PQ.md`): PQ10.SALE, PQ10.CHU, PQ11.SALE, PQ11.CHU, PQ5.SALE, PQ7.CHU (yêu cầu thành đặt phòng), PQ2.CHU, PQ2.SALE, PQ19.CHU, PQ19.SALE. Test vi phạm phải có:
- PQ10.SALE: sale chưa kết nối, căn ngoài phạm vi chia sẻ, căn đã ẩn gửi yêu cầu: `KHONG_TIM_THAY`; sale bị ngừng: `KHONG_CON_QUYEN`; Sale Lan đọc, hủy yêu cầu của Sale Hùng: `KHONG_TIM_THAY`, không lộ yêu cầu có tồn tại; Sale Hùng tự gọi `chap-nhan` hay `tu-choi` cho yêu cầu của mình: `KHONG_TIM_THAY`.
- PQ10.CHU: chủ nhà gửi yêu cầu cho căn của chính mình: `KHONG_TIM_THAY`; Anh Tuấn đọc, chấp nhận, từ chối yêu cầu tới căn 1509 của Chị Hoa: `KHONG_TIM_THAY`; Chị Hoa gọi `huy`: `KHONG_TIM_THAY`; không phiên: `CHUA_DANG_NHAP`.
- PQ11.CHU:,, của chủ nhà không có `gia_ban`, `tien_chenh`, mức cộng trong dữ liệu trả về thô.
- PQ11.SALE: thân có `gia_chu: 1`, `gia_ban: 1` thì dòng ghi vẫn là giá server tính.
- PQ19.CHU, PQ19.SALE: thông báo `sale_gui_yeu_cau` không có `gia_ban`; thông báo cho Sale Lan không có tên Sale Hùng, không có giá bán của Hùng, không có tên khách.
- PQ2.CHU, PQ2.SALE: `sale.so_dien_thoai` là `null` khi sale chưa cho số.
- Luật chung 6: hai lệnh chấp nhận hai yêu cầu trùng đêm cùng lúc chỉ một lệnh thành công, không có hai đặt phòng chồng đêm; chấp nhận cùng lúc với trùng đêm chỉ một bên qua.

## Database
Đã có trong `supabase/migrations/` và đã chạy test. Tham số và cột: `docs/tu-sinh/Bang_va_cot.md`.

- `fn_sale_gui_yeu_cau`: test ở t_02_gia.sql, t_05_yeu_cau_huy_khach.sql, t_08_thong_bao.sql, t_10_thong_ke.sql, t_11_ket_noi_quan_tri.sql
- `fn_sale_huy_yeu_cau`: test ở t_11_ket_noi_quan_tri.sql
- `fn_chu_tra_loi_yeu_cau`: test ở t_05_yeu_cau_huy_khach.sql, t_08_thong_bao.sql, t_11_ket_noi_quan_tri.sql

## Ngoài phạm vi
- Chủ nhà xóa tài khoản: booking đã chấp nhận hiện "đã xóa tài khoản" (US22-NT8, S3-11) và yêu cầu còn chờ khi xóa (mục "Sale nhận kết quả yêu cầu" bước 6): US22.
- Màn P13 danh sách thông báo (mục "Thông báo kết quả kết nối cho sale" (US17)): US17. Popup thông báo mới (mục "Popup thông báo mới" (US30)): US30. Công tắc bật tắt loại thông báo (mục "Cài đặt thông báo" (US21)): US21.
- Hủy hoặc đổi đặt phòng đã chấp nhận (QD-012, mục "Xóa booking" (US10)): US10.
- Chủ nhà ghi đặt phòng chọn sale làm người đặt (mục "Booking chủ nhà ghi cho sale" (US28)): US28.
- Yêu cầu trong Thống kê sale, S7-03 (mục "Trạng thái booking của sale" (US19)): US19.
- Chủ nhà ghi đặt phòng tự do (mục "Chủ nhà ghi booking mới" (US3)): US3; US này sửa để yêu cầu chờ trùng đêm thành "Bị từ chối" (US15-NT19).
- Tin Zalo hay tin OA cho chủ nhà (CN9-00): chưa làm (mục "Cài đặt thông báo" (US21)).
- Số "đã bán N đặt phòng của bạn" ở CN9: [MỞ: CH-022] (mục "Chủ nhà nhận và trả lời yêu cầu" bước 3). Không code, không có kịch bản.
- Chọn "Lý do khác" có ô nhập chữ, bắt buộc chọn lý do: [MỞ: US15-H9] (CH-067). Chỉ làm ba chip.

## Việc cần làm
- [ ] Đọc story này và các luật chung nó trỏ tới. Chỗ nào gắn thẻ MỞ thì không code, hỏi Tùng (docs/Cau_hoi_mo.md).
- [ ] Viết test cho từng tiêu chí chưa có test, test đỏ trước (lớp test: docs/QUY_TRINH.md mục 6).
- [ ] Database: soát các hàm ở mục Database với tiêu chí; thiếu thì thêm migration mới và một dòng trong `scripts/thu-lam-hong.sh`.
- [ ] Giao diện: các màn ở mục Màn hình, nối với Supabase (docs/Ghi_chu_code.md).
- [ ] E2E cho luồng chính của story.
- [ ] Kiểm tay theo `tests/kich-ban/US15.md` trên điện thoại thật.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md` trong cùng PR.
