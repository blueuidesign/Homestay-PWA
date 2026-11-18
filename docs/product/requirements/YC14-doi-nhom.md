---
id: YC14
tieu_de: Đội nhóm sale
rev: 1
ban: sau
---
# YC14 · Đội nhóm sale

## Mục tiêu

Là trưởng nhóm sale, tôi muốn cả nhóm dùng chung nguồn phòng và thấy ai đang chờ chủ nhà cho căn nào, để không gửi trùng khách. Là thành viên, tôi muốn biết mình đóng góp bao nhiêu và vẫn giữ nguồn phòng riêng.

Vì sao quan trọng: các nhóm sale ở Hạ Long thường bán chung nguồn của vài chủ nhà; hai người cùng hứa một căn cho hai khách là mất uy tín cả nhóm. Nhưng nhóm chạm vào ba điều đã chốt: chủ nhà đồng ý chia cho từng sale (QD8), sale không thấy yêu cầu và tiền chênh của sale khác (PQ10, PQ15), căn tự nhập chỉ sale đó thấy (YC10). Vì vậy YC này chưa code được tới khi các mâu thuẫn ở dưới được quyết.

Bản 1 không làm YC này. Màn S8 trên hình ghi "Đội nhóm · On Hold".

## Luồng chính

Sale Hùng vào Cá nhân > "Đội nhóm", bấm "Tạo nhóm", đặt tên nhóm, chọn nguồn "Chị Hoa · 2 căn", "Anh Tuấn · 4 căn" và tạo nhóm. Hùng gửi link mời qua Zalo cho Sale Lan. Lan mở link, đọc "Bạn tìm được 7 căn chung của nhóm", "Trưởng nhóm thấy đặt phòng và tiền chênh của bạn", "Nguồn phòng riêng của bạn vẫn là của bạn", bấm "Vào nhóm". Từ đó Lan tìm được các căn chung, và thấy Hùng đang chờ Chị Hoa cho 1509 · 17/10 → 19/10 nên không gửi trùng.

Số trên hình (21 đặt phòng, 12,6tr) chưa có trong DLM; khi mở lại YC này phải thêm bộ số của nhóm vào DLM.

## Phạm vi

YC này gồm: vào Đội nhóm, tạo nhóm, mời thành viên, mở link mời, màn nhóm của trưởng nhóm, chi tiết thành viên và xóa khỏi nhóm, màn nhóm của thành viên và rời nhóm.

Không thuộc YC này: giải tán nhóm, đổi trưởng nhóm, trưởng nhóm rời nhóm, đổi tên, thêm bớt nguồn chung sau khi tạo, link hết hạn, nhóm đầy ([MỞ: YC14-H5]); cộng tác viên ([MỞ: YC14-H6]); báo chủ nhà khi nguồn của họ được chia cho nhóm và cho chủ nhà tắt (hình thức chưa thiết kế).

## Quy tắc của nhóm

| Tên | Quy tắc | Ví dụ |
|---|---|---|
| Chia sẻ nguồn phòng cho nhóm | Trưởng nhóm chọn nguồn phòng chia cho cả nhóm; thành viên tìm được các căn đó. Có cần chủ nhà đồng ý không: [MỞ: YC14-H2]. Căn tự nhập có chia được không: [MỞ: YC14-H3] | 3 chủ nhà · 7 căn |
| Trưởng nhóm thấy đặt phòng và tiền chênh | Trưởng nhóm thấy số đặt phòng và tiền chênh của từng thành viên; thành viên chỉ thấy của mình | "6 đặt phòng · chênh 3.1tr" |
| Thấy ai đang chờ chủ | Mọi người trong nhóm thấy yêu cầu chờ chủ của nhau cho căn chung | "Sale Hùng · chờ chủ trả lời" |
| Nguồn phòng riêng vẫn của riêng | Vào hay rời nhóm không đổi nguồn phòng riêng; rời nhóm thì mất nguồn chung | |
| Link mời của nhóm | Trưởng nhóm gửi link qua bảng chia sẻ; app không tự gửi tin | |
| Một sale mấy nhóm | [MỞ: YC14-H4] | |

## Ai được làm gì

PQ22 trong `docs/security/PQ-ma-tran-quyen.md` đang ghi "không áp dụng ở bản đầu"; phải điền trước khi code. Mâu thuẫn chặn cả YC: PQ15.SALE (tiền chênh, doanh số chỉ của mình) và PQ10.SALE (không thấy yêu cầu của sale khác) trái với quy tắc Trưởng nhóm thấy đặt phòng và tiền chênh, Thấy ai đang chờ chủ: [MỞ: YC14-H1].

Test vi phạm dự kiến, ở lớp database: thành viên thường không thấy đặt phòng, tiền chênh của người khác; sale ngoài nhóm không thấy nhóm, thành viên, yêu cầu chờ của nhóm; chủ nhà không thấy nhóm và phần chênh; không có link hợp lệ thì không vào được; thành viên bị xóa không còn thấy nguồn chung.

## Dữ liệu

Mô hình chung: `docs/architecture/thiet-ke-db.md` chưa có nhóm. Khi mở lại: nhóm (tên, trưởng nhóm), thành viên (lúc vào), nguồn chung, link mời, người đã mời chưa vào.

## Trạng thái màn (mọi mục)

Chưa thiết kế: đang tải, mất mạng, không có quyền, link hỏng.

## YC14.1 · Tạo nhóm và mời

Bản sau · rủi ro: cao · Màn: S8-00, S8-01, S8-02, S8-03

| Bước | Người dùng | App |
|---|---|---|
| 1 | Sale chưa có nhóm mở "Đội nhóm" | S8-00: "Bán theo nhóm", "Cả nhóm dùng chung nguồn phòng và thấy ai đang đặt căn nào, không gửi trùng khách.", nút "Tạo nhóm", "Được mời vào nhóm? Mở link trưởng nhóm gửi trong Zalo, nhóm sẽ hiện ở đây." |
| 2 | Bấm "Tạo nhóm" | S8-01: ô "Tên nhóm *" ("Thành viên thấy tên này khi nhận link mời."), danh sách nguồn "Chị Hoa · 2 căn", "Anh Tuấn · 4 căn", "Chú Bình · tự nhập", ghi chú "Thành viên tìm được các căn này. Chủ nhà được báo và có thể tắt chia sẻ." |
| 3 | Bấm "Tạo nhóm" | Người tạo là trưởng nhóm, sang S8 |
| 4 | Bấm "+ Mời" | S8-02: "Gửi link này cho sale qua Zalo. Sale mở link và đồng ý là vào nhóm.", nút "Gửi qua Zalo" (bảng chia sẻ), "Sao chép link"; "THÀNH VIÊN SẼ": "Tìm được căn trong nguồn phòng chung", "Thấy ai đang giữ căn nào", "Thấy tiền chênh của người khác"; "ĐÃ MỜI · CHƯA VÀO" với "Nhắc lại" |
| 5 | Sale khác mở link | S8-03: tên nhóm, "Sale Hùng mời bạn vào nhóm", "4 thành viên · 3 chủ nhà · 7 căn", "KHI VÀO NHÓM" ba dòng, nút "Vào nhóm", "Từ chối" |

Tạo nhóm khi chưa có nguồn: [MỞ: YC14-H7]. S8-02 ghi "Thấy tiền chênh của người khác" trái S8-03 và quy tắc Trưởng nhóm thấy: [MỞ: YC14-H1].

Tiêu chí:
- **YC14.1-NT1** Khi sale chưa thuộc nhóm, thì "Đội nhóm" mở S8-00; đã thuộc nhóm thì mở màn nhóm. · unit
- **YC14.1-NT2** Khi chưa nhập tên nhóm, thì "Tạo nhóm" chưa dùng được. · unit
- **YC14.1-NT3** Khi sale tạo nhóm xong, thì sale là "Trưởng nhóm" và nhóm có đúng các nguồn đã chọn. · database
- **YC14.1-NT4** Khi trưởng nhóm bấm "Gửi qua Zalo", thì bảng chia sẻ mở với link của đúng nhóm; "Sao chép link" thì bộ nhớ tạm có link. · unit
- **YC14.1-NT5** Khi sale mở link, thì thấy tên nhóm, người mời, số thành viên, chủ nhà, căn trước khi đồng ý; "Vào nhóm" thì thấy 7 căn chung và nguồn riêng vẫn nguyên; "Từ chối" thì không thấy gì của nhóm. · database, unit

## YC14.2 · Màn nhóm

Bản sau · rủi ro: cao · Màn: S8, S8-04, S8-05

| Bước | Người dùng | App |
|---|---|---|
| 1 | Trưởng nhóm mở "Đội nhóm" | S8: "ĐẶT PHÒNG NHÓM THÁNG 10", "TIỀN CHÊNH NHÓM", "CHỜ CHỦ CHẤP NHẬN · 2" (căn, ngày, tên sale, "Chờ chủ"), "THÀNH VIÊN · 4" (tên, "Trưởng nhóm" hay số đặt phòng và tiền chênh), "NGUỒN PHÒNG CHUNG: 3 chủ nhà · 7 căn" |
| 2 | Chạm một thành viên | S8-04: tên, số che giữa, "vào nhóm 12/09/2026", "Gọi", "ĐẶT PHÒNG THÁNG 10", "TIỀN CHÊNH", "ĐANG LÀM", nút "Xóa khỏi nhóm" |
| 3 | Bấm "Xóa khỏi nhóm" | Hỏi xác nhận lần hai ([MỞ: YC14-H8]); xác nhận thì thành viên rời nhóm |
| 4 | Thành viên mở "Đội nhóm" | S8-05: tên nhóm, "Trưởng nhóm: Sale Hùng", "Gọi", "ĐẶT PHÒNG CỦA BẠN", "TIỀN CHÊNH CỦA BẠN", "CHỜ CHỦ CHẤP NHẬN" gồm của mình và người khác, "THÀNH VIÊN" không có số của người khác, nút "Rời nhóm" |
| 5 | Bấm "Rời nhóm" | Xác nhận lần hai ([MỞ: YC14-H8]); rời nhóm |

Tiêu chí:
- **YC14.2-NT1** Khi nhóm có 4 thành viên với 8, 6, 5, 2 đặt phòng tháng 10, thì "ĐẶT PHÒNG NHÓM" ghi 21. · database, unit
- **YC14.2-NT2** Khi có 2 yêu cầu chờ chủ trong nhóm, thì "CHỜ CHỦ CHẤP NHẬN · 2" có đúng 2 dòng kèm tên sale gửi; thành viên thường cũng thấy hai dòng đó. · database
- **YC14.2-NT3** Khi trưởng nhóm bấm "Xóa khỏi nhóm" một lần, thì chưa xóa; xác nhận thì thành viên không còn thấy nguồn chung và đặt phòng họ đã làm vẫn ở thống kê của họ. · database, unit
- **YC14.2-NT4** Khi thành viên thường mở màn nhóm, thì chỉ thấy số đặt phòng và tiền chênh của mình; dữ liệu trả về không có của người khác. · database
- **YC14.2-NT5** Khi thành viên bấm "Rời nhóm" và xác nhận, thì mất nguồn chung, giữ nguồn riêng. · database

## Màn hình

S8-00, S8-01, S8-02, S8-03, S8, S8-04, S8-05: nhãn "Đội nhóm · On Hold" trên hình. Vào từ Cá nhân của sale (P4) > "Đội nhóm", không từ tab "Sale" (QD5).

## Lịch sử bản

| Bản | Ngày | Mục đổi | Đổi gì |
|---|---|---|---|
| 1 | 18/11/2026 | Tất cả | Tạo từ story US20 (QD21) |
