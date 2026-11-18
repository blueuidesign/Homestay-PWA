<!-- Tài liệu đóng băng, chép từ bản Zalo ngày 18/11/2026. Đọc khi cần, không sửa theo code. Tên file, mã việc cũ trong này (server.md, api/…) là lịch sử: không tìm các file đó. Mâu thuẫn với `docs/decisions/` hay docs/luat-chung/ thì các file kia đúng. -->
<!-- Phân tích mối nguy viết cho bản Zalo có server Node. Các mối nguy về quyền và dữ liệu vẫn đúng; cách chặn ở bản PWA là RLS và hàm fn_* (`docs/architecture/thiet-ke-db.md`). Phần nói về server Node, phiên đăng nhập Zalo: chỉ để tham khảo. -->
# Bảo mật

PQ-ma-tran-quyen.md trả lời câu "ai được làm gì" khi mọi người làm đúng. File này trả lời câu khác: kẻ xấu, người tò mò hay lỗi của chính mình có thể làm gì sai, và server chặn ra sao. Mỗi biện pháp trỏ về chỗ làm (mục, file trong docs/architecture/api/, ràng buộc database) và test bắt buộc. File này không tả lại quyền, chỉ trỏ ô PQ.

Câu có [MỞ:...] thì không code theo phần đó. Số kỹ thuật ghi "đề xuất" (độ dài khóa, thời hạn, giới hạn) là đề xuất của file này, code được, ghi rõ trong PR.

## Dữ liệu cần bảo vệ
Mức: **Cao** là lộ ra gây hại cho người thật hay mất lòng tin ngay. **Vừa** là lộ ra gây thiệt hại kinh doanh. **Thấp** là lộ ra ít hại.

| Dữ liệu | Mức | Ở đâu | Ai được xem |
|---|---|---|---|
| Tên, số điện thoại khách | Cao | `booking_rieng`, file CSV xuất | PQ9 |
| Tên, số chủ căn tự nhập | Cao | `can.ten_chu_can`, `can.sdt_chu_can` | PQ14 |
| Số điện thoại người dùng | Cao | `profiles.sdt`, `ket_noi.sdt_sale_nhap` | PQ2 |
| Phiên đăng nhập | Cao | Bản băm ở phiên đăng nhập, chuỗi gốc ở Native Storage của máy | Chỉ người đó |
| App Secret, khóa ký ảnh, chuỗi kết nối database | Cao | Biến môi trường máy production (mục Bí mật) | Không ai qua API |
| Giá chủ nhà | Vừa | `gia_thang`, `gia_dip`, `booking_dem`, `booking.tien_phong`, `yeu_cau_dat_phong.gia_chu` | PQ5, PQ8 |
| Giá bán, mức cộng | Vừa | `booking_rieng`, `yeu_cau_dat_phong.gia_ban`, `muc_cong`, `tai_khoan.muc_cong_mac_dinh` | PQ11 |
| Tiền cọc, doanh thu, tiền chênh | Vừa | `booking.tien_coc`, tính từ `booking_dem` | PQ8, PQ15, PQ16 |
| Lịch, đặt phòng | Vừa | `booking`, `yeu_cau_dat_phong` | PQ4, PQ7, PQ10 |
| Ảnh căn, ảnh đại diện | Vừa | Thư mục ảnh trên máy production, đường dẫn ở `anh_can`, `tai_khoan.anh_dai_dien` | PQ3, PQ1 |
| Mã link mời, link xin lịch | Vừa | `link_chia_se.ma` | PQ18 |
| Zalo ID | Vừa | `tai_khoan.zalo_id`, phiên đăng nhập, `su_kien_zalo` | Chỉ server |
| Kết quả lưu của lệnh ghi | Vừa | `khoa_lap.ket_qua`, giữ 24 giờ | Chỉ người gọi |
| Nội dung thông báo | Vừa | `thong_bao.du_lieu` | PQ19 |
| Lần gửi khách | Thấp | `lan_gui_khach` | PQ12 |
| Log | Vừa | Log của server production | Người vận hành (mục Log) |
| Bản sao lưu | Cao | Mục Sao lưu và khôi phục | Người vận hành |

ADMIN xem được mọi dữ liệu người dùng không mã hóa (QD7, PQ cột ADMIN). Vì vậy file này không đề xuất mã hóa từng cột để giấu khỏi ADMIN. Lạm quyền của ADMIN chặn bằng nhật ký (BM20).

## Mô hình đe dọa
Mã BM chỉ là số thứ tự trong file này. Test ghi ở cột cuối là bắt buộc, viết ở tầng API trừ khi ghi khác.

| Mã | Tình huống | Hậu quả | Biện pháp | Chỗ làm | Test bắt buộc |
|---|---|---|---|---|---|
| BM1 | Chủ nhà A đổi số trong, thành id căn, đặt phòng của chủ nhà B. Id là số tự tăng nên dễ đoán | Lộ căn, giá, khách của B; sửa được lịch của B | Mọi API qua lớp quyền; vai tính theo căn chạm tới. Không quan hệ thì `KHONG_TIM_THAY`, giống hệt id không có, để không lộ là dữ liệu tồn tại |; mọi file api/ | Với mỗi API có `:id`: A gọi bằng id của B, nhận 404, thân trả lời giống id không tồn tại. Theo các ca PQ3.CHU, PQ4.CHU, PQ7.CHU đã ghi trong PQ |
| BM2 | Sale gọi API lịch, chi tiết căn với căn ngoài phạm vi, hoặc sau khi bị ngừng, với căn đã ẩn, hoặc với căn của chủ nhà đã xóa tài khoản | Lộ lịch, giá ngoài phần được chia sẻ | Phạm vi tính lúc đọc từ `ket_noi`, `ket_noi_can`, `can.an_luc`, `profiles.da_xoa_luc` của chủ nhà. Bị ngừng hay chủ nhà đã xóa tài khoản thì `KHONG_CON_QUYEN` (QD13) |bước 2, 2.3, 2.9; | Sale được 2 căn gọi căn thứ 3; sale bị ngừng gọi lịch; sale gọi căn đã ẩn (PQ3.SALE, PQ4.SALE) |
| BM3 | Kẻ xấu thử lần lượt mã trong để tìm link mời còn hạn | Thấy tên chủ nhà, căn, ảnh; bấm Thêm lịch thành sale | Mã 22 ký tự từ bộ sinh số ngẫu nhiên an toàn (khoảng 130 bit). Giới hạn 30 lần một phút mỗi IP. Mọi trạng thái hỏng trả cùng `LINK_KHONG_DUNG_DUOC` |;; `link_chia_se.ma` duy nhất | Mã sai, hết hạn, thu hồi: cùng mã lỗi, không có tên hay ảnh. Người tạo đã xóa tài khoản: [MỞ: ]. Lần gọi thứ 31 trong một phút từ một IP nhận `QUA_NHIEU` |
| BM4 | Link mời bị chuyển tiếp cho người lạ (RR9, QD8 đã chấp nhận) | Người lạ thêm lịch, thấy lịch và giá | Chấp nhận rủi ro. Giảm thiệt hại: link hết hạn sau 21 ngày, thu hồi được (QD8); chủ nhà thấy mọi sale ở CN7 và ngừng được (YC1.9); A10 không có giá (PQ5.LINK) |; | Link quá 21 ngày và link đã thu hồi: `them-lich` trả `LINK_KHONG_DUNG_DUOC`. Sau khi ngừng, sale đó gọi lịch nhận `KHONG_CON_QUYEN` |
| BM5 | Kẻ xấu gửi lại token số điện thoại đã dùng, hoặc lấy được token và access token của người khác để gắn số người đó vào tài khoản mình | Gắn sai số; giả làm người khác khi kết nối | Server đổi token một lần, trong 2 phút (zalo-rang-buoc). Server kiểm ID người dùng của access token đi kèm trùng `zalo_id` của phiên, khác thì từ chối. App không gửi số dạng chữ (PQ2) |; | Token đã dùng, quá 2 phút: `TOKEN_SDT_HET_HAN`, không ghi gì (PQ2.CHU, PQ2.SALE). Access token của người khác với phiên của mình: từ chối, không ghi |
| BM6 | Kẻ xấu gửi access token giả, hết hạn, hoặc tự gửi `zalo_id` để vào tài khoản người khác | Chiếm tài khoản | Server không bao giờ nhận `zalo_id` từ app. Luôn hỏi Zalo bằng access token kèm `appsecret_proof` (HMAC-SHA256, khóa App Secret, zalo-rang-buoc mục 2.2). Zalo từ chối thì `ZALO_TU_CHOI` |bước 2; | Token giả, token hết hạn: `ZALO_TU_CHOI`, không tạo phiên. Thân yêu cầu có thêm `zalo_id`: server bỏ qua |
| BM7 | Kẻ xấu lấy được chuỗi phiên trên máy người dùng (máy mất, máy dùng chung, app giả đọc trộm) | Dùng tài khoản đó tới khi phiên hết hạn | Phiên 32 byte ngẫu nhiên, server chỉ lưu SHA-256. Hết hạn sau 30 ngày không dùng. Đề xuất thêm hạn tuyệt đối 180 ngày. Đăng xuất làm phiên chết ngay. Phiên tạm chỉ dùng cho và xin lịch, đề xuất hết hạn sau 1 giờ. Native Storage không giữ giá, khách |;; phiên đăng nhập | Phiên sau, phiên quá 30 ngày không dùng: `PHIEN_HET_HAN`. Phiên tạm gọi API khác: từ chối. Database không có chuỗi phiên gốc |
| BM8 | Kẻ xấu gọi thẳng với sự kiện xóa tài khoản giả cho `zalo_id` của người khác | Mất số điện thoại của người đó, sale không còn thấy căn, lịch, giá của người đó (QD13, r6) | Kiểm chữ ký Zalo bằng App Secret, so sánh thời gian hằng định. Sai thì từ chối, không ghi `su_kien_zalo`. Cách ký: [MỞ: ] |; | Chữ ký sai, thiếu chữ ký, thân bị sửa một ký tự: từ chối, không đổi gì |
| BM9 | Một sự kiện webhook thật bị gửi lại (Zalo gửi lại, hoặc kẻ xấu chép lại) | Người đã cho lại số điện thoại sau khi vào lại bị xóa số lần nữa (QD13) | `su_kien_zalo` có mã sự kiện duy nhất; đã có thì trả thành công, không làm gì (QD13). Đề xuất từ chối sự kiện có giờ ký cũ quá 5 phút, nếu Zalo gửi giờ ký: [MỞ: ] |; `su_kien_zalo` chỉ mục duy nhất | Gửi cùng sự kiện hai lần: lần hai không đổi dữ liệu. Người xóa tài khoản rồi vào lại, sự kiện cũ gửi lại: tài khoản không đổi, không có thông báo `chu_xoa_tai_khoan` lần hai, cờ `da_xoa_luc` đã về trống (cho lại tên, số, QD13) không bị đặt lại |
| BM10 | Sale đọc giá khi chủ nhà tắt "Giá từng đêm": qua lịch, tìm phòng, chi tiết căn, kiểm trùng, gửi khách, thông báo, yêu cầu | Lộ giá chủ nhà muốn giấu | Bộ lọc theo vai bỏ trường giá khỏi JSON, không gửi rồi ẩn (PQ Luật chung 2). Không tính cả giá bán (QD7). Thông báo không chứa giá (PQ19). Gửi yêu cầu khi quyền tắt: [MỞ: PQ10.SALE] |bước 4, 1.8, 1.11, 2.6 (`kiem-trung`), 2.9, 2.10;, | Quyền tắt: mọi API sale chạm căn đó không có khóa giá nào trong JSON, kể cả `kiem-trung` và `gui-khach/xem` (PQ5.SALE). Trả lời không chứa con số giá ở bất cứ trường nào |
| BM11 | Khách thấy giá chủ nhà | Sale mất phần chênh, khách mặc cả | Khách không gọi API (PQ5.KHACH). Chữ gửi khách do server dựng chỉ có giá bán (YC5.5-NT4). Ảnh gửi khách không chứa giá |; | chữ trả về không chứa số giá chủ của bất kỳ đêm nào |
| BM12 | Chủ nhà thấy giá bán, mức cộng của sale | Lộ phần chênh của sale | Giá bán ở bảng riêng `booking_rieng`. API của chủ nhà không đọc bảng này. với chủ nhà trả `KHONG_TIM_THAY` |; Thiet_ke_DB `booking_rieng`;, | Mọi API chủ nhà gọi được: JSON không có `gia_ban`, `muc_cong` (PQ11.CHU). Chủ nhà gọi API sửa giá bán: 404 |
| BM13 | Người không có quyền mở ảnh căn bằng đường dẫn trực tiếp, đoán tên file, hoặc dùng lại đường dẫn có chữ ký cũ | Lộ ảnh căn của chủ nhà | Ảnh chỉ mở bằng đường dẫn có chữ ký HMAC-SHA256, hết hạn sau 1 giờ. Tên file ngẫu nhiên. Server chỉ ký cho người có quyền xem căn. Thư mục ảnh không phục vụ tĩnh |; | Không chữ ký, chữ ký sai, quá 1 giờ, đổi tên file trong đường dẫn: không mở được (PQ3.LINK). Sale bị ngừng không nhận đường dẫn mới |
| BM14 | Tải lên file độc hại đội lốt ảnh, ảnh nén bom (nhỏ khi nén, cực lớn khi mở), file quá lớn, quá nhiều ảnh | Chạy mã trên server, hết bộ nhớ, đầy đĩa | Nhận JPEG, PNG, HEIC tới 15 MB, kiểm theo nội dung file, không theo đuôi. Chặn ảnh quá 40 triệu điểm ảnh trước khi giải nén (như. Luôn mã hóa lại sang JPEG, bỏ thông tin vị trí. Trả ảnh với `Content-Type: image/jpeg` và `X-Content-Type-Options: nosniff`. Ảnh tạm xóa sau 24 giờ; tối đa 12 ảnh một căn |; | File chữ đổi đuôi.jpg; file 16 MB; ảnh nén bom; ảnh có vị trí GPS: ảnh lưu không còn vị trí. Căn thứ 13 ảnh: `DU_LIEU_SAI` |
| BM15 | Gọi API dồn dập, gửi thân yêu cầu rất lớn, hỏi khoảng ngày rất dài | Server chậm hay sập cho mọi người | 120 lần một phút mỗi tài khoản. Đề xuất thêm: 20 lần một phút mỗi IP; 30 lần một phút mỗi tài khoản; thân JSON tối đa 100 KB; mỗi lệnh tối đa 10 giây; trang tối đa 100 dòng; khoảng ngày xuất tối đa 366 ngày. Đếm IP theo header của Caddy, không theo header app tự gửi |; api/README.md (phân trang) | Lần gọi thứ 121 trong một phút: `QUA_NHIEU`. Thân 200 KB: từ chối. Header IP giả không qua được giới hạn |
| BM16 | Chèn SQL qua ô tìm tòa (`q`), mã căn, ghi chú, tham số sắp xếp | Đọc, sửa, xóa cả database | Chỉ dùng câu lệnh có tham số. Tham số chọn cột hay thứ tự (`sap_xep`) so với danh sách cho phép. Tài khoản database của server không có quyền tạo, xóa bảng | Mọi file api/; chọn thư viện database | Gửi `' or 1=1 --` vào `q`, `ma_can`, `ghi_chu`, `sap_xep`: không lỗi 500, không trả thêm dòng |
| BM17 | Chèn mã qua chữ người dùng gõ (mã căn, mô tả, tên, mẫu tin, lời nhắn, ghi chú): mã chạy trong app của người khác, hoặc công thức chạy khi chủ nhà mở file CSV bằng Excel | Đọc trộm phiên, sửa dữ liệu, chạy lệnh trên máy chủ nhà | App hiện mọi chữ dạng văn bản thường, không chèn HTML. CSV: ô bắt đầu bằng `=`, `+`, `-`, `@`, tab thì thêm dấu `'` phía trước | (`/xuat/booking.csv`); src/miniapp | Ghi chú `=HYPERLINK(...)`: CSV có `'=HYPERLINK(...)`. Mã căn `<img onerror=...>` hiện đúng chữ, không chạy (test giao diện) |
| BM18 | Hai lệnh ghi cùng lúc vào cùng đêm của một căn: hai lần chấp nhận, chấp nhận cùng lúc chủ nhà tự ghi, sửa ngày chồng | Trùng phòng, khách tới không có chỗ | Ràng buộc `exclude` trên `booking.dem` (QT1.1), database là chỗ chặn cuối. Đổi trạng thái yêu cầu bằng lệnh có điều kiện `trang_thai = 'cho_chu'`, không đọc rồi ghi. Hai dải giá dịp chồng bị `exclude` của `gia_dip` chặn |bước 4, 2.7, 2.8; Thiet_ke_DB `booking`, `gia_dip`, `yeu_cau_dat_phong` | Hai lệnh cùng đêm chạy song song: đúng một lệnh được lưu, lệnh kia `TRUNG_LICH` (Luật chung 6, US3). Chấp nhận và hủy yêu cầu cùng lúc: một lệnh nhận `TRANG_THAI_DA_DOI` |
| BM19 | Số điện thoại, tên khách, phiên, token, mã link lọt vào log, thông báo lỗi, hay kết quả lưu của lệnh ghi | Người đọc log biết dữ liệu cá nhân; lộ khi log bị gửi ra ngoài | Theo mục Log và dữ liệu cá nhân. Đường dẫn `/link/:ma` ghi mã đã che. Không ghi thân yêu cầu, thân trả lời. `client_id` tìm theo cặp (tai_khoan_id, khóa) || Chạy bộ test API rồi quét log: không có số điện thoại mẫu DLM, chuỗi phiên, mã link, token. Người B gửi `Idempotency-Key` của người A: không nhận kết quả của A |
| BM20 | Quản trị viên (ADMIN) xem dữ liệu không vì việc, sửa dữ liệu, xuất hàng loạt; hoặc tài khoản ADMIN bị chiếm | Lộ toàn bộ dữ liệu người dùng | API quản trị tách dưới `/quan-tri`, đăng nhập riêng. Mọi lần ADMIN xem hay sửa dữ liệu người dùng ghi nhật ký (mục Nhật ký thao tác của quản trị). Đề xuất bắt xác thực hai bước. Ai làm ADMIN, cách đăng nhập: [MỞ: ] (CH-093, CH-094 đã trả lời) |; PQ cột ADMIN | Phiên app gọi `/quan-tri`: từ chối. Mỗi lệnh `/quan-tri` để lại đúng một dòng nhật ký |
| BM21 | Mất dữ liệu: hỏng đĩa, xóa nhầm, lỗi migration, webhook làm sai, nhà cung cấp mất máy | Chủ nhà mất lịch, trùng phòng thật | Theo mục Sao lưu và khôi phục. Webhook chỉ đổi `profiles` của người đó, không xóa căn, lịch, đặt phòng (QD13), trong một giao dịch, lỗi thì không đổi gì (QD13). Migration chạy thử trên bản sao trước |; | Diễn tập khôi phục đúng lịch (mục Sao lưu), có biên bản. Webhook lỗi giữa chừng: dữ liệu còn nguyên |
| BM22 | Gửi thêm trường không được ghi: `sdt`, `vai_chon` trong; `gia_chu`, `gia_ban` trong; `sale_id` của sale chưa kết nối trong; `chu_nha_id` | Tự gắn số, tự đặt giá, gắn đặt phòng cho người lạ | Mỗi API chỉ nhận đúng danh sách trường của api/, trường lạ bỏ qua hoặc `DU_LIEU_SAI`. Giá yêu cầu do server tính. `sale_id` phải `da_ket_noi` bước 1) |; mọi file api/ | có `sdt`: số không đổi. có `gia_chu`: giá lưu theo server tính. với `sale_id` lạ: từ chối |
| BM23 | Dữ liệu thật hay App Secret lọt vào Develop (Oracle, Singapore), Supabase, GitHub | Vi phạm Thỏa thuận Zalo §5.3.3(b), lộ dữ liệu ra ngoài Việt Nam | Develop chỉ dữ liệu giả, không App Secret, không đổi token số điện thoại. Không chép bản sao lưu production về máy dev. Repo không ghi bí mật (ha-tang/INDEX.md) | Mục Nơi lưu dữ liệu; docs/ha-tang/ | Kiểm khi review PR: không có tệp `.env`, khóa, số điện thoại thật trong diff |
| BM24 | Website lạ gọi API Home247 bằng trình duyệt của người dùng | Gọi API thay người dùng | CORS chỉ cho `https://h5.zdn.vn` (zalo-rang-buoc mục 5.3). Phiên ở header, không ở cookie, nên trình duyệt không tự gửi kèm |; api/README.md | Yêu cầu từ origin khác: không có header cho phép. OPTIONS từ `h5.zdn.vn`: có đủ header khai báo |
| BM25 | Server vẫn trả số điện thoại, căn, lịch, giá của người đã xóa tài khoản ở một API nào đó, rồi để app ẩn | Lộ số điện thoại người đã rút đồng ý; sale đặt vào căn chủ nhà không còn dùng | Bộ lọc theo vai không bao giờ trả số điện thoại của tài khoản có `da_xoa_luc`; vai SALE cần chủ nhà chưa xóa tài khoản; không gửi rồi ẩn (QD13, CLAUDE.md) |; mọi file api/;, TA6 | Sau khi Chị Hoa xóa tài khoản: mọi API Hùng gọi có tên Chị Hoa không có khóa số điện thoại nào; lịch, tìm phòng không có 1509, 3402; vào 1509 bị `KHONG_CON_QUYEN`, "Chủ nhà đã xóa tài khoản trên Home247", không có dòng yêu cầu mới (YC9.8-NT7, NT13, NT16, QD13) |

## Xác thực và phiên
- app không có mật khẩu. Người dùng là ai do Zalo xác nhận qua access token, zalo-rang-buoc mục 2.2). Server hỏi Zalo mỗi lần tạo phiên, không tin `zalo_id` app gửi (BM6).
- Hỏi Zalo cần `appsecret_proof`, tức cần App Secret. Develop không có App Secret. Develop xác nhận người dùng cách nào: [MỞ:, cấm App Secret trên Develop mà Zalo bắt `appsecret_proof` từ 01/01/2024].
- Phiên: 32 byte từ bộ sinh số ngẫu nhiên an toàn của hệ điều hành, gửi ở header `Authorization: Bearer`. Server lưu SHA-256 của phiên, không lưu chuỗi gốc. Băm một lần là đủ vì chuỗi đã ngẫu nhiên 256 bit.
- Hạn phiên: 30 ngày không dùng. Đề xuất thêm hạn tuyệt đối 180 ngày, hết thì app tự gọi lại, người dùng không thấy gì. Phiên tạm: đề xuất 1 giờ.
- Đăng xuất: ghi `dang_xuat_luc`, phiên chết ngay. Đăng xuất mọi máy khi mất điện thoại: [MỞ: chưa YC nào nói].
- Mỗi lần dùng phiên, server kiểm tài khoản còn tồn tại. Người đã xóa tài khoản vẫn còn tài khoản và mở lại app thì nhận tài khoản cũ (QD13); phiên cũ có hủy khi xóa tài khoản không: [MỞ: ].
- Token số điện thoại: chỉ đổi ở server production, một lần, trong 2 phút. Kiểm access token đi kèm thuộc đúng người của phiên (BM5).

## Bí mật
| Bí mật | Dùng làm gì | Lưu ở đâu | Ai biết |
|---|---|---|---|
| App Secret Zalo | `appsecret_proof`, đổi token số điện thoại, kiểm chữ ký webhook | Biến môi trường của server production; `.env` trên máy cá nhân khi chạy thử. Không vào repo, không lên Develop Oracle, không vào app (CLAUDE.md) | [MỞ:, ai giữ quyền console Zalo và máy production] |
| Khóa ký ảnh | Ký đường dẫn ảnh | Biến môi trường production. Develop có khóa riêng | Như trên |
| Chuỗi kết nối database | Server nối PostgreSQL | Biến môi trường production. Develop có mật khẩu riêng trên máy Oracle (ha-tang/oracle.md) | Như trên |

Đề xuất kỹ thuật:
- Khóa ký ảnh dài 32 byte ngẫu nhiên, ký bằng HMAC-SHA256.
- Mật khẩu database dài ít nhất 32 ký tự ngẫu nhiên. Database chỉ nghe trên máy production, không mở cổng ra ngoài, như Develop.
- Tệp biến môi trường chỉ người chạy server đọc được (quyền 600). Log khi khởi động không in giá trị bí mật.
- Server cần hai khóa ký ảnh cùng lúc: khóa mới để ký, khóa cũ chỉ để kiểm trong 1 giờ. Nhờ vậy đổi khóa không làm hỏng đường dẫn đang mở.

Đổi định kỳ (đề xuất):
- Khóa ký ảnh: mỗi 90 ngày.
- Mật khẩu database: mỗi 180 ngày.
- App Secret: đổi khi có dấu hiệu lộ, hoặc khi người biết khóa thôi làm. Đổi trên console Zalo, cần Tùng (tài khoản).

Đổi khi lộ:
1. Đổi bí mật đó ngay, khởi động lại server với giá trị mới.
2. Khóa ký ảnh lộ: bỏ luôn khóa cũ, không giữ 1 giờ. Đường dẫn ảnh cũ chết, app tự xin đường dẫn mới.
3. App Secret lộ: đổi trên console Zalo, rồi xem log webhook để tìm sự kiện giả từ lúc nghi lộ.
4. Chuỗi kết nối database lộ: đổi mật khẩu, xem nhật ký kết nối của PostgreSQL.
5. Ghi sự cố theo mục Khi có sự cố.

## Mã hóa
- **Đường truyền.** Mọi gọi API qua HTTPS, chứng chỉ còn hạn (zalo-rang-buoc mục 5.3). Đề xuất TLS 1.2 trở lên và header HSTS. Server gọi Zalo cũng qua HTTPS. Server nối database trong cùng máy, không đi qua mạng ngoài.
- **Lưu trữ.** Đề xuất mã hóa toàn ổ đĩa của máy production, gồm database và thư mục ảnh. Có làm được hay không tùy nhà cung cấp: [MỞ: ]. Không mã hóa từng cột, vì ADMIN được xem dữ liệu không mã hóa (QD7). Phiên lưu dạng băm (mục Xác thực và phiên).
- **Sao lưu.** Bản sao lưu mã hóa trước khi rời máy production. Đề xuất AES-256. Khóa giải mã không để cùng chỗ với bản sao lưu.

## Log và dữ liệu cá nhân
- Log chỉ ghi: id tài khoản, phương thức, đường dẫn, mã lỗi, mã HTTP, thời gian xử lý, lúc gọi.
- Không ghi: số điện thoại, tên người dùng, tên khách, phiên, access token, token số điện thoại, App Secret, thân yêu cầu, thân trả lời.
- Đường dẫn có mã link (`/link/:ma`) ghi mã đã che, ví dụ chỉ giữ 4 ký tự đầu. Query `q` của tìm tòa không ghi.
- Lỗi từ Zalo trả về có thể chép lại token: server bỏ phần đó trước khi ghi.
- Lỗi 500 ghi dấu vết lỗi nhưng không ghi tham số của câu lệnh SQL.
- `khoa_lap.ket_qua` có thể chứa số điện thoại trong trả lời. Giữ 24 giờ rồi xóa. Chỉ trả cho đúng người đã gọi (BM19).
- Log production nằm ở Việt Nam, như dữ liệu. Không gửi log cho dịch vụ bên ngoài.
- Giữ log bao lâu: [MỞ: chưa nguồn nào nói].

## Nơi lưu dữ liệu
- Production: dữ liệu người dùng lưu và xử lý ở Việt Nam (Thỏa thuận Zalo §5.3.3(b), CLAUDE.md). Database, thư mục ảnh, log và bản sao lưu đều ở Việt Nam. Nhà cung cấp, máy: [MỞ: ].
- Develop (Oracle, Singapore) và Testing: chỉ dữ liệu giả, như bộ DLM (ha-tang/moi-truong.md). Không App Secret, không đổi token số điện thoại.
- Supabase (Singapore), GitHub (Mỹ), Vercel: không được có dữ liệu người dùng thật (ha-tang/INDEX.md).
- Máy của Tùng, Đức: không chép dữ liệu production hay bản sao lưu về. Cần xem dữ liệu thật để sửa lỗi thì xem trên máy production, và đó là việc đụng dữ liệu thật, cần Tùng duyệt.
- Trên điện thoại: Native Storage chỉ giữ thứ mất cũng được (CLAUDE.md). Không giữ giá, khách, số điện thoại.

## Sao lưu và khôi phục
Đề xuất kỹ thuật:
- Sao lưu database tự động mỗi ngày, kèm ghi nhật ký giao dịch liên tục để khôi phục được tới một thời điểm.
- Sao lưu thư mục ảnh mỗi ngày.
- Bản sao lưu để ở một máy hay kho khác máy production, vẫn ở Việt Nam, đã mã hóa (mục Mã hóa).
- Diễn tập khôi phục mỗi tháng lên một máy tạm ở Việt Nam, kiểm số dòng và mở thử vài căn. Ghi biên bản vào work/.
- Khôi phục bản cũ làm sống lại số điện thoại của người đã xóa tài khoản. Sau khi khôi phục, chạy lại các sự kiện xóa tài khoản trong `su_kien_zalo` từ lúc sao lưu tới nay; `su_kien_zalo` có `zalo_id` nên làm được.

Còn mở:
- Bản sao lưu giữ bao lâu: [MỞ: QD13, chờ và Tùng chọn số ngày].
- Mất tối đa bao nhiêu giờ dữ liệu, cần chạy lại trong bao lâu: [MỞ: chưa nguồn nào nói].
- Nơi để bản sao lưu: [MỞ: ].

## Thư viện bên thứ ba
- Chọn thư viện web, database, xử lý ảnh ở, Đức duyệt. Thêm thư viện mới ở server cũng cần Đức duyệt.
- Cài bằng `npm ci` theo lockfile. Lockfile luôn commit.
- Chạy `npm audit` mỗi PR. Lỗi mức cao trở lên thì không gộp, trừ khi Đức ghi lý do trong PR.
- Đề xuất bật cảnh báo thư viện có lỗ hổng của GitHub cho repo.
- Thư viện xử lý ảnh (đọc HEIC) là chỗ nguy hiểm nhất vì đọc file người lạ gửi (BM14). Cập nhật bản vá trong 7 ngày kể từ khi có cảnh báo.
- app không tải script từ ngoài lúc chạy. Mọi mã nằm trong bản build (giới hạn 10 MB của Zalo).
- Không dùng công cụ phân tích, quảng cáo bên thứ ba (chính sách quyền riêng tư mục 6).

## Nhật ký thao tác của quản trị
- Mỗi lệnh dưới `/quan-tri` ghi một dòng: ai, lúc nào, API nào, đọc hay ghi, dữ liệu của tài khoản nào, id dòng bị đổi, giá trị trước và sau khi sửa.
- Nhật ký chỉ được thêm. Tài khoản database của server không có quyền sửa, xóa dòng nhật ký.
- Nhật ký không chép số điện thoại, tên khách. Chỉ ghi id.
- Cần bảng mới, ví dụ `nhat_ky_quan_tri`. Chưa có trong Thiet_ke_DB.
- Ai đọc nhật ký, giữ bao lâu, ai làm ADMIN: [MỞ: ] (CH-093, CH-094 đã trả lời).
- Thao tác tay trên database production (không qua `/quan-tri`) cũng cần Tùng duyệt và ghi lại trong item.

## Khi có sự cố
Quy trình sự cố: docs/ha-tang/Xu_ly_su_co.md. Tới lúc có:
1. Ai thấy trước thì báo Tùng ngay.
2. Chặn chỗ lộ trước: đổi bí mật (mục Bí mật), tắt API bị lỗi, hoặc tắt server.
3. Giữ log và bằng chứng. Không xóa log để sửa cho nhanh.
4. Ghi lại: lúc nào, lộ gì, của ai, bao nhiêu người, đã làm gì.
5. Báo người dùng và cơ quan có thẩm quyền theo quy định pháp luật (chính sách quyền riêng tư mục 11). Thời hạn và nơi báo: [MỞ:, cần người có chuyên môn pháp lý đọc Luật 91/2025/QH15].

## Câu hỏi còn mở
1. Develop xác nhận người dùng cách nào khi không có App Secret mà Zalo bắt `appsecret_proof`. [MỞ:, ]
2. Cách Zalo ký webhook, có gửi giờ ký không, có gửi lại khi lỗi không. [MỞ: ]
3. Ai giữ App Secret, khóa ký ảnh, chuỗi kết nối database production; ai vào được máy production. [MỞ: ]
4. Nhà cung cấp, máy production ở Việt Nam; có mã hóa ổ đĩa không; nơi để bản sao lưu. [MỞ: ]
5. Bản sao lưu giữ bao lâu. [MỞ: QD13]
6. Mất tối đa bao nhiêu giờ dữ liệu, chạy lại trong bao lâu. [MỞ: chưa nguồn nào nói]
7. Giữ log bao lâu. [MỞ: chưa nguồn nào nói]
8. Ai làm ADMIN, đăng nhập web quản trị thế nào, ai đọc nhật ký quản trị, giữ nhật ký bao lâu. [MỞ: ] (CH-093, CH-094 đã trả lời)
9. Đăng xuất mọi máy khi mất điện thoại. [MỞ: chưa YC nào nói]
10. Sale gửi yêu cầu khi quyền giá tắt. [MỞ: PQ10.SALE]
11. Thời hạn và nơi báo cơ quan khi lộ dữ liệu. [MỞ: ]
