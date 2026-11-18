# US22 · Xuất file đặt phòng, xóa tài khoản, hướng dẫn sử dụng

- Loại: tính năng
- Trạng thái: chưa làm
- Bản: 1
- Rủi ro: cao
- Làm sau khi xong: US21, US6, US10, US15, US16, US17, US19, US30
- Kiểm tay: `tests/kich-ban/US22.md` (43 kịch bản)

## Mục tiêu
Là chủ nhà, tôi muốn lấy danh sách đặt phòng ra Excel, để xem và tính trên máy tính. Là chủ nhà hoặc sale, tôi muốn có hướng dẫn sử dụng và nhắn Zalo cho Home247, để tự tra cách làm. Là chủ nhà hoặc sale, khi người cùng giao dịch đã xóa tài khoản Home247 trong Zalo, tôi muốn vẫn thấy đặt phòng đã chốt với họ kèm ghi chú và biết vì sao họ biến khỏi danh sách, để đối chiếu và báo khách.

Theo QD-013 (Tùng chốt 02/11/2026, đổi ở r5, r6, r7) không có màn "Xóa tài khoản" trong app. Người dùng xóa tài khoản của Home247 trong Zalo; server nhận qua webhook và chỉ xóa số điện thoại. Căn, lịch, giá, tiền, booking còn ở server. Sale không còn thấy căn, lịch của chủ nhà đã xóa tài khoản và không đặt được. Tên cũ vẫn hiện kèm ghi chú nhỏ màu đỏ "Đã xoá tài khoản". Người đó mở lại app bằng cùng tài khoản Zalo thì thấy lại dữ liệu cũ; cho lại tên và số điện thoại thì dùng lại như trước, hết ghi chú (QD-013). Sale gửi yêu cầu đặt phòng vào căn của chủ nhà đã xóa tài khoản thì app báo ngay "Không gửi được yêu cầu. Chủ nhà đã xóa tài khoản trên Home247." Sale có thông báo khi chủ nhà xóa tài khoản. Yêu cầu đang chờ giữ nguyên. US này làm phía app của YC9.8 bản 3: không có nút xóa ở P2, và các chỗ YC9.8 bước 8 đến 10 trỏ tới. Màn theo.

**YC9.8 bản 3 đã gộp (PR #117, 04/11).** QD-013, r7, r8 đã trả lời các câu trước đây còn mở (sale có thấy căn, lịch không: không; tên hiện ra sao: tên cũ kèm ghi chú đỏ; mở lại app: thấy lại dữ liệu cũ; r8: yêu cầu đang chờ giữ nguyên, có thông báo cho sale, cho lại tên và số điện thoại thì dùng lại như trước, báo ngay khi gửi yêu cầu vào căn đã xóa tài khoản). Còn mở ở YC9.8 bản 3 [MỞ: US22-H1]: có xóa ảnh Zalo, tên và số điện thoại chủ căn tự nhập, tên và số khách do người đó nhập không (bước 4); link mời và link xin xem lịch (A1-link-01, A8-01); chính sách quyền riêng tư; soát lại các màn phía người còn lại theo bản 3. Các NT cũ ở YC6.1, YC5.1, YC4.2, YC4.7, YC7.6, YC1.3, YC1.7, YC1.9, HV5 còn viết "đã xóa tài khoản" chữ thường; chưa sửa hết, KB ở đây theo YC9.8 bản 3. Phần xuất CSV và hướng dẫn (YC9.6, YC9.7) không bị ảnh hưởng, làm được ngay.

## Hành vi
Bảng bước ghi: người dùng làm gì, app hiện gì (chữ trong ngoặc kép là chữ trên màn), máy chủ phải làm gì, dữ liệu nào đổi. Cột "Máy chủ" mô tả việc phải xảy ra; bản PWA làm bằng RLS, view và hàm `fn_*` của Supabase.

### YC9.6 · Xuất file Excel (CSV)
Rủi ro: cao
Mục đích: chủ nhà lấy danh sách booking để xem hoặc tính trên Excel, Google Sheets.
Màn hình: P8, P8-00
Khi nào xảy ra: chủ nhà chạm "Xuất file Excel (CSV)".

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở màn | "Danh sách đặt phòng để xem hoặc tính toán trên Excel, Google Sheets." | Không gọi server | Không | Không |
| 2 | Chọn thời gian | Chip "Tháng này", "3 tháng gần nhất", "Năm 2026", "Tùy chọn" | Không gọi server | Không | Không |
| 3 | Chọn căn | Chip "Tất cả", "1509", "3402" | căn của người gọi, chưa ẩn | Không | Không |
| 4 | Xem cột | "FILE GỒM CÁC CỘT": Căn · Ngày nhận · Ngày trả · Số đêm · Khách · SĐT · Sale · Tổng tiền · Đã cọc · Còn lại · Ghi chú | Không gọi server | Không | Không |
| 5 | Xem số dòng | "23 đặt phòng" | số đặt phòng sẽ xuất | Không | Không |
| 6 | Bấm "Xuất file Excel (CSV)" | Tạo file CSV và lưu hoặc gửi (cách lưu: chưa thiết kế) | chỉ chủ nhà, lọc theo căn, dữ liệu của mình, khách do chủ nhà nhập, UTF-8 có BOM | Không | Không |

Theo quy tắc: Tiền là số nguyên đồng (CLAUDE.md); Ngày theo giờ Việt Nam (CLAUDE.md); Không lưu thông tin khách (CLAUDE.md).

Trạng thái màn:
- rỗng: khoảng chọn không có booking: P8-00
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

### YC9.7 · Hướng dẫn sử dụng và nhắn Zalo cho Home247
> **Bản PWA:** "Nhắn Zalo cho Home247" là link `https://zalo.me/<OA Home247>` mở Zalo. Xem `PWA.md` mục P5.
Rủi ro: thap
Mục đích: người dùng tự tra cách làm một việc, hoặc nhắn người hỗ trợ khi vẫn chưa rõ.
Màn hình: P9
Khi nào xảy ra: người dùng chạm "Hướng dẫn sử dụng" hoặc "Nhắn Zalo cho Home247".

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở hướng dẫn | Nhóm "CHỦ NHÀ" với các mục thu gọn: Thêm căn và ảnh, Đặt giá theo tháng, Đặt giá ngày lễ, Đặt phòng (trước là "Ghi booking", Tu_dien), Mời sale xem lịch, Sale được xem gì | Không gọi server | Không | Không |
| 2 | Chạm một mục | Mở nội dung. Ví dụ "Đặt giá theo tháng" có 3 bước: mở căn chọn tab Giá; chạm tháng bắt đầu rồi tháng kết thúc; nhập giá ngày thường, cuối tuần rồi bấm Áp dụng | Không gọi server | Không | Không |
| 3 | Đọc "Vẫn chưa rõ?" | "Home247 trả lời qua Zalo trong giờ hành chính." | Không gọi server | Không | Không |
| 4 | Bấm "Nhắn Zalo cho Home247" | Mở khung chat Zalo với Home247 | Không gọi server | Mở chat với OA Home247 (`openChat` loại oa, | Không |

Theo quy tắc: Không link ra ngoài Zalo (CLAUDE.md).

Trạng thái màn:
- rỗng: không áp dụng
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: không áp dụng
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

### YC9.8 · Khi người dùng xóa tài khoản
> **Bản PWA:** người dùng bấm xóa tài khoản ngay trong app (màn: CH-007), không qua webhook của Zalo. Bước 1 đến 3 và YC9.8-NT1 đến NT4 thay bằng YC9.8-NT19 đến NT21 ở cuối mục. Bước 4 đến 10 và các NT còn lại giữ nguyên; "mở lại bằng cùng tài khoản Zalo" đọc là "đăng nhập lại cùng tài khoản", "cho lại số điện thoại" đọc là "nhập lại số". Xem `PWA.md` mục P8.

Rủi ro: cao
Mục đích: khi chủ nhà hoặc sale không dùng Home247 nữa, họ xóa tài khoản của Home247 ngay trong Zalo. Server khi đó xóa số điện thoại của người đó. Căn, lịch, giá, tiền và booking vẫn giữ ở server, nhưng người khác không còn thấy căn, lịch, giá của người đó. Đặt phòng đã có thì vẫn hiện tên cũ, kèm ghi chú nhỏ màu đỏ "Đã xoá tài khoản" (QD-013. Đây là quyền của người dùng theo Chính sách quyền riêng tư mục 9. Bản Zalo còn phải khai webhook xóa dữ liệu trước khi gửi duyệt (`docs/zalo/rang-buoc.md` mục 3.3). Chính sách phải nói rõ dữ liệu nào còn giữ, giữ bao lâu và để làm gì [MỞ: YC9-H15].
Màn hình: bản Zalo không có màn xóa trong app; bản PWA có (CH-007). Các màn phía người còn lại: S6-08 (YC6.1), S3-11 (YC4.7), S7-03-01 (YC7.6), P13-01 (YC1.13), CN3-02-01 (YC4.2), HV5-02 (HV5), A1-link-01 (YC1.3), A8-01 (YC1.7). Canvas của các màn này có thể còn hiện số điện thoại hay thiếu ghi chú đỏ; làm theo đặc tả này: ghi chú nhỏ đỏ "Đã xoá tài khoản", không số điện thoại.
Dùng quy tắc: chưa có QT. Booking của người đã xóa tài khoản vẫn chặn trùng theo QT1.
Khi nào xảy ra: người dùng xóa tài khoản của Home247 trong Zalo và chọn xóa dữ liệu. Zalo khi đó gọi webhook của Home247.

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Rút quyền của Home247 trong Zalo và chọn xóa dữ liệu. Cách bấm cụ thể trong Zalo: chưa kiểm | Không có màn nào của Home247 | nhận sự kiện | Zalo gọi Webhook URL đã khai trong console Zalo, gửi sự kiện "người dùng rút lại sự đồng ý và xóa dữ liệu" kèm ID Zalo của người đó. Nội dung sự kiện, cách ký: chưa đọc được tài liệu Zalo | Không |
| 2 | | | Kiểm chữ ký của sự kiện theo cách Zalo quy định. Sai chữ ký thì không xóa gì, ghi log | | Không |
| 3 | | | Tìm tài khoản theo ID Zalo. Chưa có tài khoản, hoặc đã xóa từ lần gửi trước, thì trả thành công và không làm gì | | Không |
| 4 | | | Xóa số điện thoại của người đó, đánh dấu tài khoản đã xóa tài khoản (QD-013). Giữ tên cũ chỉ để hiện kèm ghi chú. Làm hết hoặc không làm gì trong một lần; lỗi thì không trả thành công và ghi log (QD-013, phần còn đúng). Không xóa căn, ảnh căn, lịch, giá, tiền, booking. Ảnh Zalo, tên và số điện thoại chủ căn tự nhập do sale đó nhập, tên và số khách do người đó nhập: có xóa không [MỞ: YC9-H16] | | Hồ sơ của người đó: không còn số điện thoại, có dấu đã xóa tài khoản. Mọi dữ liệu khác giữ |
| 5 | | | Booking giữ nguyên, kể cả tiền và giá. Chỗ hiện tên người đã xóa tài khoản: tên cũ kèm ghi chú nhỏ màu đỏ "Đã xoá tài khoản" (QD-013). Không gửi số điện thoại, nên không có nút gọi, nhắn | | Không |
| 6 | | | Yêu cầu đặt phòng đang chờ (YC4.5) giữa người đã xóa tài khoản và người khác: giữ nguyên trạng thái chờ, không tự hủy. Yêu cầu vẫn hết hạn như thường theo YC4.5 bước 6 (QD-013; điểm (b) cũ không còn đúng). Chủ nhà đã xóa tài khoản thì không còn gì để sale gửi thêm (bước 8) | | Không |
| 7 | | | Chủ nhà xóa tài khoản thì ghi một thông báo cho mỗi sale đang kết nối với chủ nhà đó (YC9.3, QD-013). Sale thấy ở P13 và popup hôm nay (YC1.13); chạm vào mở danh sách chủ nhà (YC6.1), không mở lịch hay căn | | Thông báo mới cho mỗi sale |
| 8 | Sale có chủ nhà đã xóa tài khoản | Danh sách chủ nhà: dòng chủ nhà kèm ghi chú đỏ, không chạm vào xem được (YC6.1 bước 10, 11). Lịch, tìm phòng: căn của chủ nhà đó không còn hiện, sale không đặt hay gửi yêu cầu đặt phòng được (QD-013). Nếu sale vẫn bấm gửi (màn mở từ trước): app báo ngay "Không gửi được yêu cầu. Chủ nhà đã xóa tài khoản trên Home247." (QD-013). Đặt phòng đã chốt: còn, tên chủ nhà kèm ghi chú đỏ (YC4.7, YC7.6). Mở căn, lịch từ thông báo hay màn cũ: HV5, lý do "Chủ nhà đã xóa tài khoản" | Không gửi căn, lịch, giá, số điện thoại của chủ nhà đã xóa tài khoản; từ chối lệnh đặt phòng, yêu cầu đặt phòng vào căn của chủ nhà đó bằng `KHONG_CON_QUYEN`, lý do "Chủ nhà đã xóa tài khoản trên Home247" (QD-013) | | Không |
| 9 | Chủ nhà có sale đã xóa tài khoản | Đặt phòng đã nhận từ sale đó còn trong lịch, vẫn chặn trùng, tên sale kèm ghi chú đỏ, không có số điện thoại. Danh sách sale CN7: dòng sale đó kèm ghi chú, không chạm vào xem được (QD-013). Chủ nhà không chia lịch, không đổi quyền xem cho sale đó (QD-013) | sale đã xóa tài khoản gửi tên kèm cờ đã xóa tài khoản, không số điện thoại | | Không |
| 10 | Người đã xóa tài khoản mở lại app bằng cùng tài khoản Zalo | Thấy lại dữ liệu cũ của mình: căn, lịch, giá, đặt phòng (QD-013). Chưa có số điện thoại thì xin lại khi người đó bấm việc cần số (HV4) | tìm tài khoản theo ID Zalo, trả tài khoản cũ | | Không. Khi người đó cho lại tên và số điện thoại (luồng xin quyền HV4): dùng lại như trước. Server bỏ dấu đã xóa tài khoản (`profiles.da_xoa_luc` về trống) và ghi chú "Đã xoá tài khoản"; sale lại thấy căn, lịch theo kết nối cũ, nếu dòng kết nối chưa bị người kia xóa (QD-013). Kết nối tự nối lại, không phải mời lại (QD-013) |

Trạng thái màn:
- rỗng: không áp dụng. Không có màn xóa trong app
- đang tải: không áp dụng cho người xóa tài khoản. Phía người còn lại theo YC của màn đó
- lỗi mạng: không áp dụng cho người xóa tài khoản. Server lỗi giữa chừng: bước 4
- không có quyền: sale mở căn, lịch của chủ nhà đã xóa tài khoản thì theo HV5, lý do "Chủ nhà đã xóa tài khoản" (bước 8)
- từ chối quyền: người dùng chỉ tắt quyền tên, ảnh, số điện thoại mà không chọn xóa dữ liệu thì không thuộc yêu cầu này, theo HV4. Zalo có tách hai việc đó không: chưa kiểm
- quay lại từ nền: không áp dụng
- mở từ link: link mời của chủ nhà đã xóa tài khoản (A1-link-01, YC1.3), link xin xem lịch của sale đã xóa tài khoản (A8-01, YC1.7). Chữ cụ thể của A1-link-01 khi chủ nhà đã xóa tài khoản: CH-005

## Phần của story khác mà story này làm một lát
Bảng bước của các mục dưới đây nằm ở story chủ của mục đó. Story này chỉ làm các tiêu chí được liệt kê ở mục Tiêu chí nghiệm thu.

- YC1.3 · Mở app từ link mời của chủ nhà: bảng bước ở US6. Story này làm NT6.
- YC1.7 · Chủ nhà duyệt lời mời xem lịch: bảng bước ở US17. Story này làm NT4.
- YC1.9 · Chủ nhà quản lý danh sách sale: bảng bước ở US5. Story này làm NT4.
- YC1.13 · Popup thông báo mới: bảng bước ở US30. Story này làm NT4, NT7.
- YC4.2 · Chi tiết booking và đánh dấu đã thu đủ: bảng bước ở US10. Story này làm NT4.
- YC4.5 · Sale gửi yêu cầu đặt phòng: bảng bước ở US15. Story này làm NT8.
- YC4.7 · Sale nhận kết quả yêu cầu: bảng bước ở US15. Story này làm NT5.
- YC5.1 · Lịch phòng 7 ngày: bảng bước ở US16. Story này làm NT6.
- YC6.1 · Danh sách căn và nguồn phòng: bảng bước ở US16. Story này làm NT5, NT6.
- YC7.3 · Doanh thu theo người bán: bảng bước ở US18. Story này làm NT4.
- YC7.5 · Thống kê của sale: bảng bước ở US19. Story này làm NT7.
- YC7.6 · Trạng thái booking của sale: bảng bước ở US19. Story này làm NT6.

## Tiêu chí nghiệm thu
Mỗi tiêu chí một test tự động mang đúng mã này trong tên test. Mã không đổi nghĩa; đổi hành vi thì cấp mã mới (docs/QUY_TRINH.md mục 5).

- **YC1.3-NT6** Khi Anh Tuấn đã xóa tài khoản (YC9.8) và một người mở link mời cũ của Anh Tuấn, thì app hiện A1-link-01, không hiện A10, không có tên căn, ảnh căn hay giá nào, và không tạo kết nối (QD-013).
- **YC1.7-NT4** Khi Sale Lan đã xóa tài khoản (YC9.8) và chủ nhà bấm thẻ xin xem lịch cũ của Sale Lan, thì app hiện A8-01, không có số điện thoại của Sale Lan, và không tạo kết nối. Nếu A8-01 hiện tên Sale Lan thì kèm ghi chú nhỏ đỏ "Đã xoá tài khoản" (QD-013). A8-01 có hiện tên không: [MỞ: YC1-H31]. `[đã có test database: t_11_ket_noi_quan_tri.sql]`
- **YC1.9-NT4** Khi Sale Hùng đã xóa tài khoản, thì CN7 của Chị Hoa còn dòng "Sale Hùng" kèm ghi chú nhỏ đỏ "Đã xoá tài khoản", không có số điện thoại và nút "Gọi", chạm vào dòng không mở gì, và các booking cũ của Sale Hùng vẫn ở trong lịch.
- **YC1.13-NT4** Khi Chị Hoa xóa tài khoản trong ngày, thì P13 của Sale Hùng có một dòng báo Chị Hoa đã xóa tài khoản, tên Chị Hoa kèm ghi chú nhỏ đỏ; chạm vào dòng đó mở danh sách chủ nhà (YC6.1), không mở lịch hay căn của Chị Hoa (YC9.3, QD-013).
- **YC1.13-NT7** Khi Chị Hoa xóa tài khoản (YC9.8) sau lần mở app trước của Sale Hùng, thì chỗ nào popup có tên Chị Hoa đều kèm ghi chú nhỏ màu đỏ "Đã xoá tài khoản" và không có số điện thoại (QD-013). Popup có dòng báo riêng "Chị Hoa đã xóa tài khoản" (NT4, QD-013).
- **YC4.2-NT4** Khi Sale Hùng đã xóa tài khoản và Chị Hoa mở booking 10/10 → 12/10 của Sale Hùng, thì booking vẫn hiện đủ ngày và tiền, tên người bán là "Sale Hùng" kèm ghi chú nhỏ đỏ "Đã xoá tài khoản", không có số điện thoại hay nút gọi.
- **YC4.5-NT8** Khi Chị Hoa đã xóa tài khoản và Sale Hùng bấm "Gửi yêu cầu đặt phòng" vào căn 1509 từ màn mở trước đó, thì app báo ngay "Không gửi được yêu cầu. Chủ nhà đã xóa tài khoản trên Home247." và không có yêu cầu mới (QD-013).
- **YC4.7-NT5** Khi Chị Hoa đã xóa tài khoản và Sale Hùng mở booking Chị Hoa đã chấp nhận, thì thấy ngày ở, giá và tiền của booking như cũ, tên "Chị Hoa" kèm ghi chú nhỏ đỏ "Đã xoá tài khoản", không thấy số điện thoại của Chị Hoa, và không mở được lịch của căn đó.
- **YC5.1-NT6** Khi Chị Hoa đã xóa tài khoản, thì lịch của Sale Hùng không còn hai căn của Chị Hoa và nhóm "NGUỒN PHÒNG" ghi 3 thay vì 5. Hai căn đó vẫn còn ở server, nên khi Chị Hoa mở lại app bằng cùng tài khoản Zalo thì Chị Hoa thấy lại (QD-013).
- **YC6.1-NT5** Khi Chị Hoa đã xóa tài khoản (YC9.8), thì Nguồn phòng của Sale Hùng còn dòng "Chị Hoa" kèm ghi chú nhỏ đỏ "Đã xoá tài khoản", không có số điện thoại, không còn căn nào bên dưới, và chạm vào dòng không mở S6-04.
- **YC6.1-NT6** Khi Sale Hùng bấm nút xóa dòng Chị Hoa đã xóa tài khoản, thì dòng đó biến khỏi Nguồn phòng và booking đã chốt với Chị Hoa vẫn còn trong danh sách booking của Sale Hùng.
- **YC7.3-NT4** Khi Sale Hùng đã xóa tài khoản (YC9.8), thì booking của Sale Hùng vẫn tính vào doanh thu tháng của Chị Hoa và dòng "Sale Hùng" vẫn có, tên kèm ghi chú nhỏ đỏ "Đã xoá tài khoản" (QD-013).
- **YC7.5-NT7** Khi Chị Hoa đã xóa tài khoản (YC9.8), thì booking đã chốt của Sale Hùng với Chị Hoa vẫn tính vào thống kê của Sale Hùng, ở dòng "Chị Hoa" kèm ghi chú nhỏ đỏ "Đã xoá tài khoản" (QD-013).
- **YC7.6-NT6** Khi Chị Hoa đã xóa tài khoản, thì booking "Đã chốt" của Sale Hùng với Chị Hoa vẫn ở S7-03 với tiền chênh như cũ và tên "Chị Hoa" kèm ghi chú nhỏ đỏ "Đã xoá tài khoản".
- **YC9.6-NT1** Khi chủ nhà chọn "Tháng này" và căn "1509", thì số dòng ghi đúng số booking của 1509 trong tháng.
- **YC9.6-NT2** Khi xuất, thì mỗi dòng có đủ các cột ở mục "FILE GỒM CÁC CỘT" (xem YC9-H1 về cột Khách, SĐT).
- **YC9.6-NT3** Khi số tiền được xuất, thì là số nguyên đồng, không có dấu chấm ngăn nghìn để Excel đọc được là số.
- **YC9.7-NT1** Khi người dùng chạm "Đặt giá theo tháng", thì thấy 3 bước theo đúng thứ tự trong thiết kế.
- **YC9.7-NT2** Khi người dùng bấm "Nhắn Zalo cho Home247", thì khung chat Zalo mở trong Zalo, không mở trình duyệt ngoài.
- **YC9.7-NT3** Khi người dùng là sale, thì "Hướng dẫn sử dụng" có phần dành cho sale (chưa thiết kế, xem YC9-H8).
- **YC9.8-NT1** Khi người dùng mở P2 hay bất kỳ màn nào của app, thì không có nút hay màn "Xóa tài khoản" (QD-013).
- **YC9.8-NT2** Khi Zalo gửi sự kiện rút đồng ý có chữ ký đúng cho Chị Hoa (DLM.2), thì server không còn số điện thoại của Chị Hoa, còn căn 1509, 3402, ảnh căn, lịch, giá và mọi booking vẫn còn như trước.
- **YC9.8-NT3** Khi server nhận sự kiện có chữ ký sai, thì không có dữ liệu nào bị xóa và log ghi lần nhận đó.
- **YC9.8-NT4** Khi Zalo gửi lại sự kiện của người đã xóa tài khoản, hoặc gửi cho ID Zalo chưa có tài khoản, thì server trả thành công và không đổi dữ liệu nào.
- **YC9.8-NT5** Khi Chị Hoa đã xóa tài khoản và Sale Hùng có booking B1 với Chị Hoa, thì Sale Hùng vẫn thấy B1 với ngày, giá và tiền như cũ, tên "Chị Hoa" kèm ghi chú nhỏ màu đỏ "Đã xoá tài khoản", không có số điện thoại hay nút gọi.
- **YC9.8-NT6** Khi Chị Hoa đã xóa tài khoản, thì Sale Hùng, Lan, Nga, Minh mỗi người có một thông báo "chủ nhà đã xóa tài khoản" ở P13 và popup hôm nay (YC9.3, QD-013). `[đã có test database: t_08_thong_bao.sql]`
- **YC9.8-NT7** Khi Chị Hoa đã xóa tài khoản, thì lịch và tìm phòng của Sale Hùng không còn 1509, 3402, Sale Hùng không đặt được phòng vào hai căn đó, và danh sách chủ nhà còn dòng Chị Hoa kèm ghi chú đỏ, chạm vào không mở gì.
- **YC9.8-NT8** Khi Sale Hùng đã xóa tài khoản, thì B1 vẫn chiếm đêm 10/10, 11/10 của 1509 trong lịch Chị Hoa và vẫn chặn trùng theo QT1; B1 hiện tên Sale Hùng kèm ghi chú đỏ "Đã xoá tài khoản", không có số điện thoại.
- **YC9.8-NT9** Khi Chị Hoa đã xóa tài khoản và Sale Hùng mở lại căn 1509 từ thông báo cũ, thì thấy màn HV5 với lý do "Chủ nhà đã xóa tài khoản", không thấy ảnh, lịch hay giá.
- **YC9.8-NT10** Khi một người vừa có căn vừa bán căn người khác (QD-005) xóa tài khoản, thì cả phía chủ nhà và phía sale của người đó theo bước 4 đến 9.
- **YC9.8-NT13** Khi Chị Hoa đã xóa tài khoản, thì mọi chỗ Sale Hùng, Lan, Nga, Minh còn thấy tên Chị Hoa đều có ghi chú nhỏ màu đỏ "Đã xoá tài khoản", không chỗ nào có số điện thoại hay nút gọi, nhắn cho Chị Hoa.
- **YC9.8-NT14** Khi Chị Hoa đã xóa tài khoản rồi mở lại Home247 bằng cùng tài khoản Zalo, thì Chị Hoa thấy lại 1509, 3402, lịch và các đặt phòng B1 đến B8 như trước khi xóa tài khoản (QD-013).
- **YC9.8-NT15** Khi Chị Hoa đã xóa tài khoản rồi cho lại tên và số điện thoại ở luồng xin quyền (HV4), thì tài khoản dùng lại như trước: tên Chị Hoa không còn ghi chú "Đã xoá tài khoản", Sale Hùng thấy lại 1509, 3402 và lịch theo kết nối cũ ngay, không ai phải mời lại hay gửi link mới (QD-013).
- **YC9.8-NT16** Khi Chị Hoa đã xóa tài khoản và Sale Hùng bấm "Gửi yêu cầu đặt phòng" vào căn 1509 từ màn mở trước đó, thì yêu cầu không được gửi và app báo ngay "Không gửi được yêu cầu. Chủ nhà đã xóa tài khoản trên Home247."; server trả `KHONG_CON_QUYEN`, không tạo yêu cầu hay booking nào (QD-013).
- **YC9.8-NT17** Khi Sale Hùng có yêu cầu đang chờ với Chị Hoa rồi Chị Hoa (hoặc Hùng) xóa tài khoản, thì yêu cầu vẫn ở trạng thái "Chờ chủ", không tự hủy; quá 14 ngày vẫn thành "Hết hạn" như thường (YC4.5 bước 6, QD-013).
- **YC9.8-NT18** Khi Sale Hùng đã xóa tài khoản, thì Chị Hoa không chia được lịch hay đổi quyền xem cho Sale Hùng; Sale Hùng cho lại tên và số điện thoại thì Chị Hoa thấy Sale Hùng như trước và kết nối dùng lại ngay, không phải mời lại (QD-013).
- **YC9.8-NT19** (bản PWA) Khi Chị Hoa bấm xóa tài khoản và xác nhận, thì máy chủ không còn số điện thoại của Chị Hoa, còn căn 1509, 3402, ảnh căn, lịch, giá và mọi booking như trước; Chị Hoa về màn A1.
- **YC9.8-NT20** (bản PWA) Khi Chị Hoa bấm xóa tài khoản rồi bấm hủy ở bước xác nhận, thì không có gì thay đổi.
- **YC9.8-NT21** (bản PWA) Khi lệnh xóa tài khoản lỗi giữa chừng, thì không có thay đổi nào được ghi (làm hết hoặc không làm gì) và app báo theo HV2.

## Luật kiểm dữ liệu và lỗi
Mỗi mục là một việc app nhờ database làm. "Đầu vào" là luật kiểm từng ô, "Lỗi riêng" là khi nào phải từ chối. Cột "Mã" là tên gọi trong tài liệu; hàm database báo lỗi bằng một câu tiếng Việt cho người dùng đọc (docs/luat-chung/Nghiep_vu.md mục Lỗi).

### Số đặt phòng sẽ có trong file, cho dòng "23 đặt phòng" ở P8
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| `tu` | ngay | Có | |
| `den` | ngay | Có | Không trước `tu`. Khoảng tối đa 366 ngày (bao-mat BM15, đề xuất) |
| `can_ids` | danh sách id cách nhau dấu phẩy | Không | Tối đa 50. Mọi id phải là căn của người gọi |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| DU_LIEU_SAI | Thiếu `tu`, `den`; `den` trước `tu`; quá 366 ngày; `can_ids` sai dạng hay quá 50 |
| KHONG_TIM_THAY | Có id trong `can_ids` không phải căn của người gọi |

## Luật chung dùng
Nguyên văn ở `docs/luat-chung/` (QT.md, HV.md, Nghiep_vu.md, Tu_dien.md), tìm theo mã hoặc tên.

Quy tắc trong YC9: Menu theo vai trò, Tiền là số nguyên đồng. QT1.1 (đặt phòng giữ lại vẫn chặn trùng). QD-011 (khách do ai nhập, người đó mới thấy), YC9.3 (thông báo chủ nhà đã xóa, đã chốt có, QD-013), QD-013 (r5, r6, r7 và các điểm còn đúng ở a đến j), QD-007. Chữ tối thiểu 14 px (CLAUDE.md) áp dụng cả ghi chú đỏ. HV1, HV2, HV3, HV4 (không áp dụng ở P8), HV5.

## Màn hình
Hình: `python3 docs/thiet-ke/trich-man.py <mã màn>` (docs/thiet-ke/README.md). Chữ và số trên hình lệch story thì story đúng.

P8, P8-00 (xuất file). P9 (hướng dẫn). P2 (không có nút xóa tài khoản). S6-08 (YC6.1), S3-11 (YC4.7), S7-03-01 (YC7.6), P13-01, S1-06-01 (YC1.13), CN3-02-01 (YC4.2), CN7-01 (YC1.9), HV5-02 (HV5), A1-link-01 (YC1.3), A8-01 (YC1.7).

**HV5-02 · Không còn quyền · chủ nhà đã xóa tài khoản**
Vào từ: Thông báo cũ trỏ tới căn của Chị Hoa
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Màn gốc | Chép đúng S6-04, như HV5-01 | S6-04 |
| 2 | Giữa màn | Khóa, "Bạn không còn xem được mục này", "Chủ nhà đã xóa tài khoản.", nút "Về Lịch" | HV5-NT2 |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Về Lịch" | Về lịch | S1 |
Trạng thái riêng:
- không có quyền: theo HV5

**P8-00 · Xuất Excel · khoảng chọn không có booking**
Vào từ: P8, chọn khoảng không có booking
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 0 | Màn gốc | Chép đúng màn P8 trên canvas, chỉ đổi phần trạng thái. "0 đặt phòng" và dòng "Khoảng thời gian này chưa có đặt phòng. Chọn khoảng khác." ở vùng đáy; nút xuất mờ | P8 |
| 1 | Thời gian | "Tùy chọn: 01/12/2026 – 31/12/2026" | |
| 2 | Thẻ | "0 đặt phòng", "Khoảng thời gian này chưa có đặt phòng. Chọn khoảng khác." | |
| 3 | Nút | "📊 Xuất file Excel (CSV)" mờ | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Chọn khoảng khác | Đếm lại | P8 |
Trạng thái riêng:
- rỗng: chính là màn này

**P8 · Xuất file Excel**
Vào từ: P1, "Xuất file Excel"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Thời gian | Chip "Tháng này" đang chọn, "3 tháng gần nhất", "Năm 2026", "Tùy chọn" | Lựa chọn |
| 2 | Căn | Chip "Tất cả" đang chọn, "1509", "3402" | Căn |
| 3 | Các cột | "Căn · Ngày nhận · Ngày trả · Số đêm · Khách · SĐT · Sale · Tổng tiền · Đã cọc · Còn lại · Ghi chú" | Cố định |
| 4 | Số booking | "8 đặt phòng" | DLM.8 |
| 5 | Nút | "Xuất file Excel (CSV)" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Một chip | Đổi số booking | P8 |
| "Xuất file Excel (CSV)" | Tải file | P8 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- đang tải: chưa thiết kế (HV1)
- lỗi mạng: chưa thiết kế (HV2)
- quay lại từ nền: chưa thiết kế (HV3)

**P9 · Hướng dẫn sử dụng**
Vào từ: Xem YC (canvas chưa có mũi tên tới màn này)
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Tiêu đề | "Hướng dẫn sử dụng" | Canvas |
| 2 | Khối nội dung | "CHỦ NHÀ" | Canvas |
| 3 | Khối nội dung | "Thêm căn và ảnh +" | Canvas |
| 4 | Khối nội dung | "Đặt giá theo tháng − 1 Mở căn, chọn tab Giá. 2 Chạm tháng bắt đầu rồi tháng kết thúc. 3 Nhập giá ngày thường, cuối tuần, bấm Áp dụng." | Canvas |
| 5 | Khối nội dung | "Đặt giá ngày lễ +" | Canvas |
| 6 | Khối nội dung | "Đặt phòng +" | Canvas |
| 7 | Khối nội dung | "Mời sale xem lịch +" | Canvas |
| 8 | Khối nội dung | "Sale được xem gì +" | Canvas |
| 9 | Khối nội dung | "Vẫn chưa rõ? Home247 trả lời qua Zalo trong giờ hành chính. Nhắn Zalo cho Home247" | Canvas |
| 10 | Cỡ chữ, vùng bấm | Chữ tối thiểu 14 px, vùng bấm tối thiểu 44 px | CLAUDE.md |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Nút quay lại" | Quay lại màn trước | |
| "Nhắn Zalo cho Home247" | Theo YC, canvas chưa nối mũi tên | |
Trạng thái riêng:
- rỗng: chưa thiết kế
- không có quyền: chưa thiết kế

## Quyền
Ô quyền theo `docs/luat-chung/PQ.md`. Mỗi ô phải có test chứng minh người không có quyền thì không đọc, không ghi được; test ở lớp database (`tests/db/`).

Ô PQ chạm tới (ma trận `docs/luat-chung/PQ.md`): PQ20.CHU, PQ20.SALE, PQ9.CHU, PQ11.CHU, PQ23.CHU, PQ23.SALE, PQ23.LINK, PQ19.SALE, PQ17.SALE, PQ17.CHU, PQ18.LINK, PQ3.SALE, PQ4.SALE. Test vi phạm phải có:
- PQ20.CHU: Anh Tuấn gửi `can_ids` có 1509 vào và: `KHONG_TIM_THAY`; file của Anh Tuấn không có dòng của Chị Hoa.
- PQ20.SALE: Sale Hùng gọi hai API xuất với căn 1509 (căn được chia sẻ): `KHONG_TIM_THAY`.
- PQ9.CHU: B1 có khách do Sale Hùng nhập; ô Khách, SĐT của B1 trong file trống (QD-011).
- PQ11.CHU: không cột nào trong file chứa giá bán 2.600.000 của B1.
- Ô bắt đầu bằng `=`, `+`, `-`, `@` được thêm dấu `'` phía trước.
- Luật chung 4: không phiên, trả `CHUA_DANG_NHAP`.
- PQ23.SALE: sau khi chủ nhà đã xóa tài khoản, Sale Hùng gọi,: có tên cũ của chủ nhà kèm cờ đã xóa tài khoản, không có số điện thoại; gọi API lịch, tìm phòng, chi tiết căn của chủ nhà đó: không có căn, lịch, giá, ảnh (server không gửi, không phải ẩn ở giao diện), trả `KHONG_CON_QUYEN` kèm lý do "Chủ nhà đã xóa tài khoản" (HV5-NT2, QD-013); gửi lệnh đặt phòng hay yêu cầu đặt phòng vào căn đó: bị từ chối, không tạo bản ghi (YC9.8 bước 8).
- PQ23.CHU: sau khi sale đã xóa tài khoản, Chị Hoa gọi của B1: có tên sale kèm cờ đã xóa tài khoản, không có số điện thoại sale; của sale đã xóa không mở được; chỉ xóa được dòng `da_xoa_tai_khoan`, dòng sale chưa xóa trả `KHONG_TIM_THAY`.
- PQ17.SALE, PQ17.CHU: sale hay chủ nhà khác gọi của dòng không thuộc mình: `KHONG_TIM_THAY`.
- PQ23.LINK, PQ18.LINK: link mời cũ của chủ nhà đã xóa tài khoản không trả tên căn, ảnh; link xin lịch của sale đã xóa tài khoản không trả số điện thoại; cả hai không tạo kết nối. Có trả tên cũ hay không: [MỞ: US22-H2].
- Không API nào của US này trả số điện thoại của người đã xóa tài khoản: kiểm toàn bộ phản hồi của,,, (YC9.8-NT13).
- PQ19.SALE: mỗi sale chỉ đọc thông báo của mình; không sale nào đọc thông báo của sale khác.
- PQ3.SALE, PQ4.SALE: lịch 7 ngày của sale không chứa căn của chủ nhà đã xóa tài khoản (YC9.8-NT7).

## Database
Đã có trong `supabase/migrations/` và đã chạy test. Tham số và cột: `docs/tu-sinh/Bang_va_cot.md`.

Xóa tài khoản chỉ xóa số điện thoại, đặt `profiles.da_xoa_luc` (QD-013).

- `fn_xuat_booking`: test ở t_10_thong_ke.sql
- `fn_xoa_tai_khoan`: test ở t_02_gia.sql, t_08_thong_bao.sql, t_11_ket_noi_quan_tri.sql

## Ngoài phạm vi
- Webhook của Zalo, kiểm chữ ký, ghi sự kiện, xóa số điện thoại và đánh dấu đã xóa tài khoản, ghi thông báo "chủ nhà đã xóa tài khoản" cho sale (QD-013), lỗi giữa chừng và gửi lại (YC9.8-NT2, NT3, NT4, NT8, NT10, NT14 phần server):. Phía server của cờ đã xóa tài khoản, không gửi căn, lịch, giá cho sale, từ chối đặt phòng, yêu cầu đặt phòng vào căn của chủ nhà đã xóa tài khoản bằng `KHONG_CON_QUYEN`, bỏ cờ khi cho lại tên và số, trả tài khoản cũ:. US này chỉ hiện kết quả phía app.
- Sao lưu và khôi phục (YC9.5): On Hold, không giao.
- Hồ sơ, cài đặt, giờ nhận trả, đăng xuất (YC9.1 đến YC9.4): US21.
- Các màn gốc của những chỗ bị ảnh hưởng: S6 và Nguồn phòng (US16), lịch 7 ngày (US6, US16), chi tiết đặt phòng của chủ nhà (US10), chi tiết đặt phòng của sale (US15), S7-03 (US19), P13 và popup (US30), A1-link (US6), A8 và CN7 (US17, US5). US22 chỉ làm biến thể "người kia đã xóa tài khoản".
- YC6.1-NT7 (bỏ dòng ngay, không hỏi lại) và YC6.1-NT8 (số đếm không tính dòng đã xóa): US16 làm; KB19, KB20 ở đây chỉ kiểm hiệu ứng.
- Người đã xóa tài khoản mở lại app bằng cùng tài khoản Zalo (YC9.8 bước 10, NT14): KB40, KB41 chạy cùng nhóm A, KB42 cùng nhóm B. Cho lại tên và số điện thoại thì dùng lại như trước, hết ghi chú đỏ (YC9.8-NT15, QD-013): KB43.

## Việc cần làm
- [ ] Đọc story này và các luật chung nó trỏ tới. Chỗ nào gắn thẻ MỞ thì không code, hỏi Tùng (docs/Cau_hoi_mo.md).
- [ ] Viết test cho từng tiêu chí chưa có test, test đỏ trước (lớp test: docs/QUY_TRINH.md mục 6).
- [ ] Database: soát các hàm ở mục Database với tiêu chí; thiếu thì thêm migration mới và một dòng trong `scripts/thu-lam-hong.sh`.
- [ ] Giao diện: các màn ở mục Màn hình, nối với Supabase (docs/Ghi_chu_code.md).
- [ ] E2E cho luồng chính của story.
- [ ] Kiểm tay theo `tests/kich-ban/US22.md` trên điện thoại thật.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md` trong cùng PR.
