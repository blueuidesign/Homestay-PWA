---
id: YC8
tieu_de: Gửi khách
rev: 1
ban: 1
---
# YC8 · Gửi khách

## Mục tiêu

Là sale, tôi muốn gửi mô tả, giá bán và ảnh của vài căn cho khách qua Zalo trong vài chạm, để khách thấy giá của tôi mà không bao giờ thấy giá chủ nhà, và tôi được báo khi căn đã gửi có người khác đặt.

Vì sao quan trọng: gửi khách là việc sale làm nhiều lần mỗi ngày. Mỗi tin lộ giá chủ nhà là một lần sale mất tiền chênh và mất lòng tin của chủ nhà, nên chữ gửi khách chỉ bao giờ có giá bán. Báo khi căn đã gửi có người đặt giúp sale không hứa với khách một căn vừa hết.

## Luồng chính

Ngày 06/10/2026, Sale Hùng đã tích 3 căn ở kết quả tìm 10/10 → 12/10 (YC7.3) và bấm "Gửi cho khách". Màn "Gửi cho khách" ghi "3 căn · 10/10 → 12/10". Khối 1: "ICON40 1509 · 2PN · 3 giường, view biển Bãi Cháy / 10/10 → 12/10 (2 đêm): 2.600.000đ", nút "Gửi chữ" và "Gửi 6 ảnh". Hùng bấm "Gửi chữ": bảng chia sẻ của điện thoại mở với đoạn chữ; Hùng chọn Zalo, chọn khách, gửi. Rồi bấm "Gửi 6 ảnh". Làm tiếp với Sapphire 1103 (1.600.000đ) và À La Carte 2208 (3.600.000đ).

Lúc 14:20 Hùng gửi yêu cầu đặt 1509 (YC9), Chị Hoa chấp nhận lúc 15:05. Hùng không có thông báo "vừa có người đặt" cho 1509, vì chính Hùng đặt. Nếu Anh Tuấn ghi một đặt phòng cho Sapphire 1103 đêm 11/10, Hùng có thông báo "Sapphire 1103 · 10/10 → 12/10 vừa có người đặt", không có tên người đặt và giá.

## Phạm vi

YC này gồm: màn gửi cho khách (chữ, ảnh, sao chép), ghi lần gửi, báo căn đã gửi có người đặt, mẫu tin gửi khách.

Không thuộc YC này (dễ tưởng là có):
- Chọn căn, thanh đáy "Gửi cho khách": YC7.3, YC7.4, YC10.
- Mức cộng, giá bán: YC7.4, YC7.5.
- Danh sách thông báo, công tắc từng loại: YC12.
- Nhãn "Đã gửi" trên màn, đếm lần gửi cho thống kê: chưa làm ([MỞ: CH-072]).

## Quy tắc của nhóm

| Tên | Quy tắc | Ví dụ |
|---|---|---|
| Chỉ giá bán trong tin | Chữ gửi khách chỉ có giá bán của sale (giá chủ nhà + mức cộng), không bao giờ có giá chủ nhà | 2.600.000đ |
| Chữ và ảnh gửi riêng | Mỗi căn gửi chữ một lần, ảnh một lần (bảng chia sẻ không chắc gửi được chữ và ảnh cùng tin) | 6 ảnh, 4 ảnh |
| Mẫu tin gửi khách | Tin tạo từ mẫu của sale với các ô điền sẵn: [Ngày], [Số đêm], [Số căn], [Danh sách căn], [Tên sale] | "Em gửi anh chị 3 căn còn trống 10/10 → 12/10 (2 đêm)" |
| Báo căn đã gửi có người đặt | Gửi chữ hay ảnh của một căn thì database ghi lần gửi (căn, các đêm, lúc gửi). Đặt phòng mới của người khác chiếm ít nhất một đêm đó thì báo sale một lần cho mỗi căn của mỗi lần gửi. Không báo khi chính sale đặt. Ngừng báo sau ngày nhận phòng của lần gửi. Chỉ ghi căn và ngày (QD-011) | "Sapphire 1103 · 10/10 → 12/10 vừa có người đặt" |

Quy tắc dùng chung: Phòng ngủ và số giường (`docs/luat-chung/Tu_dien.md`), chia sẻ trên PWA (`docs/luat-chung/PWA.md` mục P3).

## Ai được làm gì

Theo `docs/luat-chung/PQ.md`: PQ3.SALE, PQ5.KHACH, PQ11, PQ12, PQ14.SALE, PQ19.SALE. Test vi phạm phải có, ở lớp database:
- Lệnh soạn tin với căn ngoài phạm vi, căn đã xóa, căn tự nhập của sale khác: từ chối cả lệnh (YC8.1-NT6).
- Lần gửi chỉ sale đó đọc; chủ nhà không đọc được (YC8.1-NT7).
- Mẫu tin của sale này sale khác không đọc, không sửa (YC8.2-NT4).

## Dữ liệu

Mô hình chung: `docs/Thiet_ke_DB.md`. YC này cần database bảo đảm:
- Một lệnh soạn tin cho danh sách căn và khoảng ngày: mỗi căn trả chữ theo mẫu của người gọi, giá bán (không có giá chủ nhà trong dữ liệu trả về), đường dẫn ảnh có hạn 1 giờ. Không ghi gì.
- Lần gửi khách của sale: căn, đêm, lúc gửi; chỉ sale đó đọc.
- Khi có đặt phòng mới (chủ nhà ghi, chủ nhà chấp nhận yêu cầu, hay chủ nhà đổi ngày đặt phòng) chiếm đêm của lần gửi còn hiệu lực: ghi thông báo theo quy tắc Báo căn đã gửi có người đặt ([MỞ: YC8-H2]).
- Mẫu tin là cài đặt của sale, có mẫu mặc định.

## Trạng thái màn (mọi mục)

- Đang tải: HV1. Mất mạng: HV2. Quay lại từ bảng chia sẻ: HV3, màn giữ nguyên. Không có bảng chia sẻ: sao chép (HV6). Toast: HV8.

## YC8.1 · Gửi thông tin cho khách

Bản 1 · rủi ro: cao · Màn: S5

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Bấm "Gửi cho khách" (S2, S3, S6-03, S6-07) | YC6.1 nếu hồ sơ chưa có số; "Để sau" vẫn mở S5 | Không |
| 2 | Mở màn | Tiêu đề "Gửi cho khách", dòng "3 căn · 10/10 → 12/10. Mỗi căn gửi chữ một lần, ảnh một lần." | Lệnh soạn tin |
| 3 | Xem một căn | Số thứ tự, tên căn, số ảnh ("6 ảnh"), chữ theo mẫu, không tiện ích căn, không số khách | Không |
| 4 | Bấm "Gửi chữ" | Bảng chia sẻ của điện thoại với chữ của căn đó | Ghi lần gửi |
| 5 | Bấm "Gửi 6 ảnh" | Bảng chia sẻ với ảnh nếu trình duyệt cho gửi file; không cho thì tải ảnh về máy, toast "Đã lưu 6 ảnh vào máy. Mở Zalo để gửi ảnh." | Ghi lần gửi |
| 6 | Bấm "Sao chép chữ" | Sao chép chữ căn đó, toast "Đã sao chép" | Không ghi lần gửi ([MỞ: YC8-H3]) |
| 7 | Bấm "Sao chép chữ cả 3 căn" | Sao chép chữ cả 3 căn theo thứ tự trên màn | Như bước 6 |
| 8 | (sau đó) Có đặt phòng mới của người khác chiếm ít nhất một đêm của lần gửi | Thông báo "<tòa> <căn> · <ngày nhận> → <ngày trả> vừa có người đặt" (YC12) | Theo quy tắc Báo căn đã gửi có người đặt |

Chữ trên nút ("Gửi chữ qua Zalo" hay "Gửi chữ"): [MỞ: CH-003]. Căn có hơn 10 ảnh: [MỞ: CH-070]; tới khi có câu trả lời, gửi 10 ảnh đầu. Mỗi lần gửi tối đa bao nhiêu căn: [MỞ: YC8-H1]; tới khi có câu trả lời, 10 căn. Căn chưa có giá cho một đêm trong khoảng thì chữ ghi gì: [MỞ: YC8-H4]; tới khi có câu trả lời, ghi "Giá: hỏi lại".

Tiêu chí:
- **YC8.1-NT1** Khi sale chọn 3 căn, thì S5 có 3 khối, mỗi khối một nút gửi chữ và một nút gửi ảnh. · unit
- **YC8.1-NT2** Khi sale bấm "Gửi chữ" ở khối 1509, thì bảng chia sẻ mở với chữ của 1509 và database có một lần gửi 1509 cho đêm 10/10, 11/10. · unit, database
- **YC8.1-NT3** Khi sale bấm "Sao chép chữ cả 3 căn", thì bộ nhớ tạm có chữ của 3 căn theo thứ tự trên màn. · unit
- **YC8.1-NT4** Khi Hùng soạn tin 1509 cho 10/10 → 12/10 với mức cộng +200k, thì chữ có "2.600.000đ" và dữ liệu trả về không có 2.200.000đ. · database, unit
- **YC8.1-NT5** Khi căn có số giường, thì chữ ghi "2PN · 3 giường"; chữ không có "x khách" và không có tiện ích. · unit
- **YC8.1-NT6** Khi Sale Lan gửi lệnh soạn tin có Villa Tuần Châu của Hùng hay một căn đã xóa, thì database từ chối cả lệnh. · database
- **YC8.1-NT7** Khi Chị Hoa đọc lần gửi khách của Hùng, thì không được. · database
- **YC8.1-NT8** Khi Hùng đã gửi Sapphire 1103 cho 10/10 → 12/10 và Anh Tuấn ghi một đặt phòng cho 1103 đêm 11/10, thì Hùng có đúng một thông báo "Sapphire 1103 · 10/10 → 12/10 vừa có người đặt", không có tên người đặt, không có giá; Anh Tuấn không có thông báo này. · database
- **YC8.1-NT9** Khi chính Hùng là người có đặt phòng mới đó, thì Hùng không có thông báo. · database
- **YC8.1-NT10** Khi đặt phòng mới được tạo sau ngày nhận của lần gửi, thì không có thông báo cho lần gửi đó. · database
- **YC8.1-NT11** Khi hai đặt phòng mới cùng chiếm đêm của một lần gửi, thì chỉ có một thông báo cho căn đó của lần gửi đó. · database

## YC8.2 · Mẫu tin gửi khách

Bản 1 · rủi ro: tb · Màn: P11

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Vào Cá nhân, "Mẫu tin gửi khách" (YC1) | P11: ô "Mẫu tin", hàng "Chạm để chèn": [Ngày], [Số đêm], [Số căn], [Danh sách căn], [Tên sale] | Đọc mẫu của người gọi, chưa có thì mẫu mặc định |
| 2 | Chạm một ô | Chèn ô vào chỗ con trỏ | Không |
| 3 | Xem "KHÁCH SẼ NHẬN ĐƯỢC" | Bản xem trước với 3 căn trống 10/10 → 12/10 | Không |
| 4 | Bấm "Dùng lại mẫu mặc định" | Ô mẫu về mẫu mặc định | Không |
| 5 | Bấm "Lưu thay đổi" | Toast "Đã lưu mẫu tin" | Ghi mẫu của người gọi; tối đa 2.000 ký tự |

Tiêu chí:
- **YC8.2-NT1** Khi sale chạm "[Ngày]", thì mẫu có thêm [Ngày] và bản xem trước hiện ngày thật. · unit
- **YC8.2-NT2** Khi sale bấm "Dùng lại mẫu mặc định", thì mẫu về nội dung mặc định. · unit
- **YC8.2-NT3** Khi sale đã lưu mẫu mới, thì chữ ở S5 theo mẫu đó. · database, unit
- **YC8.2-NT4** Khi Sale Lan đọc hay ghi mẫu tin, thì chỉ chạm tới mẫu của chính Lan; mẫu của Hùng không đổi. · database

## Màn hình

Xem hình: `python3 docs/thiet-ke/trich-man.py <mã>`. Chữ và số trên hình lệch YC thì YC đúng.

- **S5 · Gửi cho khách.** Chữ "Zalo không gửi chữ và ảnh chung một tin" đổi theo bước 2. Bỏ tiện ích căn trên hình.
- **P11 · Mẫu tin.** Đúng bố cục.

## Lịch sử bản

| Bản | Ngày | Mục đổi | Đổi gì |
|---|---|---|---|
| 1 | 18/11/2026 | Tất cả | Tạo từ story US14 (QD-021), đổi cách gửi sang bảng chia sẻ của PWA |
