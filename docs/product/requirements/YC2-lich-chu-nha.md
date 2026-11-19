---
id: YC2
tieu_de: Lịch chủ nhà
trang_thai: de-xuat
nguoi_chu: tung
rev: 2
ban: 1
---
# YC2 · Lịch chủ nhà

## Mục tiêu

Là chủ nhà, tôi muốn mở app là thấy ngay tháng này ngày nào căn nào có khách, chạm một ngày để biết ai ở, và thấy tháng này thu được bao nhiêu, đặt phòng nào sắp tới còn chưa cọc, để trả lời sale ngay khi họ gọi hỏi mà không phải lật sổ.

Vì sao quan trọng: tab Lịch là màn chủ nhà mở nhiều nhất. Nó thay cho cuốn sổ tay. Nếu lịch tô sai một đêm (ví dụ tô cả ngày trả phòng), chủ nhà sẽ từ chối khách cho một đêm thật ra còn trống, hoặc tệ hơn, nhận khách vào đêm đã có người. Vì vậy lịch tô theo đúng luật đêm (QT2): một lần ở chiếm các đêm từ ngày nhận tới trước ngày trả.

## Luồng chính

Hôm nay là 07/10/2026. Chị Hoa mở app, tab Lịch hiện "Tháng 10/2026". Hàng chip có "Cả 2 phòng" (đang chọn), "1509", "3402". Trên lưới, ô 10/10 và 11/10 tô màu của 1509 (B1 của Sale Hùng), ô 12/10 không tô. Chú thích dưới lưới ghi "1509 đã đặt", "3402 đã đặt".

Dưới lưới, khối "Doanh thu tháng 10" ghi 11.800.000đ và dòng "13 đêm có khách · tháng 9: 9.600.000đ". Dưới nữa là "Đặt phòng sắp tới": dòng đầu "Sale Hùng · Phòng 1509 · 10/10 → 12/10 (2 đêm) · 2.200.000đ · Cọc 1.000.000đ", dòng thứ hai "Khách lẻ · Phòng 1509 · 13/10 → 15/10 (2 đêm) · 1.800.000đ · Chưa cọc".

Sale Lan gọi hỏi 3402 đêm 10/10. Chị chạm ô 10/10. Phần "Ngày 10/10/2026" mở ngay dưới lưới: "Phòng 1509 · Sale Hùng · 0912 345 678 · 10/10 → 12/10 (2 đêm) · 2.200.000đ · Cọc: 1.000.000đ" và "Phòng 3402 · Trống ✓" với nút "Đặt phòng". Chị trả lời Sale Lan là 3402 còn trống.

## Phạm vi

YC này gồm: lịch tháng (CN1) với chip lọc theo căn, chi tiết một ngày (CN3), khối doanh thu tháng và danh sách đặt phòng sắp tới dưới lịch tháng, lịch tuần nhiều căn (CN2). Mọi thứ ở đây là đọc; không có lệnh ghi.

Không thuộc YC này (dễ tưởng là có):
- Form ghi đặt phòng mở từ nút "Đặt phòng", chi tiết một đặt phòng (CN3-02), sửa, xóa, ghi đã thu đủ: YC5.
- Nút "Gửi lịch cho sale" (CN10): YC6.
- Màn trống A4 khi chưa có căn nào: YC3.
- Thống kê tháng đầy đủ (theo căn, theo người bán, công suất, 6 tháng): YC11.
- Căn tự nhập của sale (không có lịch): YC10.

## Quy tắc của nhóm

| Tên | Quy tắc | Ví dụ |
|---|---|---|
| Màu theo căn | Mỗi căn một màu trên lịch, dùng cho ô ngày, chú thích, thanh ở lịch tuần. Từ 4 căn trở lên, tên căn ở danh sách căn (CN5) không tô màu | Không |
| Tuần bắt đầu thứ hai | Lưới tháng và bảng tuần bắt đầu từ T2, kết thúc ở CN | Không |

Quy tắc dùng chung: QT2 (đêm có khách) ở `docs/product/rules/`; Viết số tiền rút gọn ở `docs/product/glossary.md`; QT6.1 Trạng thái tiền đặt phòng; QD10 (doanh thu chia theo đêm), QD12 (đặt phòng đã hủy không tính).

## Ai được làm gì

Theo `docs/security/PQ-ma-tran-quyen.md`: PQ4 (lịch), PQ7 (đặt phòng), PQ8 (tiền), PQ9 (khách), PQ16 (doanh thu). Test vi phạm phải có, ở lớp database: chủ nhà khác và sale không đọc được đặt phòng, tiền, khách của chủ nhà (YC2.2-NT3); doanh thu chỉ tính căn của người hỏi (YC2.3-NT1).

## Dữ liệu

Mô hình chung: `docs/architecture/thiet-ke-db.md`. YC này cần database bảo đảm:
- Chủ nhà đọc được căn của mình, đặt phòng và tiền từng đêm của căn mình, khách chính mình nhập, tên và số điện thoại của sale đang kết nối.
- Một lệnh trả giá chủ nhà từng đêm của các căn của người gọi trong một khoảng ngày (lịch tuần cần 7 đêm × mọi căn). Chỉ người giữ căn gọi được. Dùng chung với YC5 (điền sẵn tiền phòng).
- Một lệnh trả doanh thu tháng, số đêm có khách và doanh thu tháng trước của người gọi: cộng tiền từng đêm thuộc tháng, bỏ đặt phòng đã hủy, tính cả căn đã xóa.

## Trạng thái màn (mọi mục)

- Đang tải: theo HV1 (khung xám tại chỗ của lưới, khối doanh thu, danh sách).
- Mất mạng: theo HV2; giữ dữ liệu đã hiện, đổi tháng khi mất mạng thì báo theo HV2.
- Quay lại từ nền: theo HV3, đọc lại tháng đang xem (đặt phòng có thể đã đổi trên máy khác).
- Phiên hết hạn: theo HV7.

Lỗi có thể gặp: mất mạng khi đổi tháng, đổi tuần thì theo HV2 và giữ tháng đang hiện; căn vừa bị xóa ở máy khác thì lần đọc sau không còn căn đó.

## YC2.1 · Lịch tháng và lọc theo căn

Bản 1 · rủi ro: tb · Màn: CN1, CN1-00, CN1-02

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Mở tab Lịch (chủ nhà có ít nhất một căn) | CN1: tiêu đề "Lịch", nút "Đặt phòng", thanh tháng ("T09", "Tháng 10/2026", "T11"), hàng chip lọc, lưới tháng bắt đầu từ thứ Hai, chú thích màu ("1509 đã đặt", "3402 đã đặt"). Tháng mở sẵn là tháng của hôm nay | Đọc căn của mình (loại có lịch, chưa ẩn) và đặt phòng chưa hủy của các căn đó có đêm trong tháng, |
| 2 | Xem lưới | Mỗi đêm có khách tô màu của căn đó (quy tắc "Màu theo căn"). Ngày trả phòng không tô nếu không có khách khác nhận đêm đó (QT2). Một ngày có khách ở hai căn thì ô có hai màu | Không |
| 3 | Chạm một chip căn | Lưới chỉ còn tô đêm có khách của căn đó. Chip đầu: "Cả 2 phòng" khi có 2 căn, "Tất cả" khi có từ 3 căn. Chủ nhà có 1 căn thì không có hàng chip | Không gọi thêm |
| 4 | Bấm "T09" hoặc "T11" | Chuyển sang tháng trước, tháng sau; tiêu đề thành "Tháng 11/2026", chip đang chọn giữ nguyên | Đọc đặt phòng của tháng mới |
| 5 | Bấm "Đặt phòng" | Mở form ghi đặt phòng (YC5) | Không |
| 6 | Chạm một ngày | Mở chi tiết ngày ngay dưới lưới (mục Chi tiết một ngày), ô ngày đó viền đậm | Không |

Chủ nhà có căn nhưng chưa có đặt phòng nào (ở mọi tháng): CN1-00, thay cho chú thích và các khối dưới lưới: "Chưa có đặt phòng nào", "Bấm "Đặt phòng" để thêm khách đầu tiên. Ngày có khách sẽ tô màu theo phòng.", nút "Đặt phòng", gợi ý "💡 Mời sale xem lịch để sale tự biết ngày trống, không phải gọi hỏi. Vào tab Sale.".

Tiêu chí:
- **YC2.1-NT1** Khi chủ nhà có 2 căn và mở tab Lịch, thì thấy chip "Cả 2 phòng" và một chip cho mỗi căn. · unit
- **YC2.1-NT2** Khi chủ nhà có 3 căn và mở tab Lịch, thì thấy chip "Tất cả" và một chip cho mỗi căn. · unit
- **YC2.1-NT3** Khi 1509 có B1 (nhận 10/10, trả 12/10), thì ô 10/10 và 11/10 tô màu của 1509, ô 12/10 không tô màu của 1509 (QT2). · unit
- **YC2.1-NT4** Khi chủ nhà chạm chip "3402", thì lưới chỉ tô đêm có khách của 3402 (05/10, 06/10, 14/10, 17/10, 18/10, 21/10), không tô đêm của 1509. · unit
- **YC2.1-NT5** Khi chủ nhà bấm "T11", thì tiêu đề thành "Tháng 11/2026" và ô 30/11 tô màu của 3402 (B9). · unit
- **YC2.1-NT6** Khi chủ nhà có căn nhưng chưa có đặt phòng nào, thì thấy CN1-00 với nút "Đặt phòng", không có khối doanh thu và danh sách sắp tới. · unit

## YC2.2 · Chi tiết một ngày

Bản 1 · rủi ro: tb · Màn: CN3

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 7 | (sau bước 6) | Tiêu đề "Ngày 10/10/2026". Mỗi căn (theo chip đang chọn) một dòng | Dùng dữ liệu đã đọc ở bước 1 và phần riêng của chủ nhà |
| 8 | Căn có khách đêm đó | "Phòng 1509", người đặt (tên sale, hoặc tên khách chủ nhà đã nhập, hoặc "Khách lẻ"), số điện thoại của sale nếu có, "10/10 → 12/10 (2 đêm)", "2.200.000đ · Cọc: 1.000.000đ" (hoặc "Chưa cọc", "Đã thanh toán"), ghi chú nếu có | Đọc đặt phòng và khách chính chủ nhà nhập (tên khách, số khách); số điện thoại sale của sale đang kết nối |
| 9 | Chạm dòng căn có khách | Mở chi tiết đặt phòng CN3-02 (YC5) | Không |
| 10 | Căn trống đêm đó | "Phòng 3402 · Trống ✓" và nút "Đặt phòng" (bấm: YC5) | Không |

`[r2 · sửa]` Chạm một ngày đã qua thì mở chi tiết ngày như ngày khác, nút "Đặt phòng" vẫn có để ghi bù (YC5) (Claude tự chốt, QD25, trả lời YC2-H6).

Tiêu chí:
- **YC2.2-NT1** Khi chủ nhà chạm ô 10/10, thì phần chi tiết mở ngay dưới lưới với tiêu đề "Ngày 10/10/2026". · E2E
- **YC2.2-NT2** Khi chủ nhà xem chi tiết ngày 10/10, thì dòng 1509 ghi "Sale Hùng", "10/10 → 12/10 (2 đêm)", "2.200.000đ · Cọc: 1.000.000đ", còn dòng 3402 ghi "Trống ✓". · unit
- **YC2.2-NT3** Khi Anh Tuấn hay Sale Hùng đọc trực tiếp đặt phòng, tiền từng đêm, khách, thì không thấy dòng nào của đặt phòng của Chị Hoa (Sale Hùng chỉ thấy đêm kín qua lịch của sale, YC7). · database

## YC2.3 · Doanh thu tháng

Bản 1 · rủi ro: cao · Màn: CN1, CN1-02

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 11 | Xem dưới lưới (tháng có đặt phòng) | Khối "Doanh thu tháng 10": số tiền lớn "11.800.000đ", dòng nhỏ "13 đêm có khách · tháng 9: 9.600.000đ". Tháng trước không có doanh thu thì bỏ phần "tháng 9: …" | Lệnh doanh thu tháng: tổng tiền từng đêm của đêm thuộc tháng (QD10), bỏ đặt phòng đã hủy (QD12), tính cả căn đã xóa; số đêm có khách; doanh thu tháng trước |
| 12 | Đổi tháng | Khối đổi theo tháng mới | Gọi lại với tháng mới |
| 13 | Tháng đang xem không có đặt phòng nào | Không hiện khối | Không |

Đổi chip lọc căn thì số tiền và số đêm có đổi theo căn không: [MỞ: YC2-H1]. Tới khi có câu trả lời, khối luôn là tổng mọi căn.

Số tháng 9 của bộ mẫu: Tùng (bản Zalo, 04/11/2026) "chưa cần thêm dữ liệu mẫu, cái đó xem sau"; test dùng dữ liệu riêng cho tháng 9.

Tiêu chí:
- **YC2.3-NT1** Khi Chị Hoa xem tháng 10, thì khối ghi "Doanh thu tháng 10", "11.800.000đ", "13 đêm có khách". · database (lệnh doanh thu tháng), unit (hiển thị)
- **YC2.3-NT2** Khi tháng đang xem không có đặt phòng nào, thì không có khối doanh thu. · unit

## YC2.4 · Đặt phòng sắp tới

Bản 1 · rủi ro: tb · Màn: CN1, CN1-01

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 14 | Kéo xuống | Danh sách "Đặt phòng sắp tới": đặt phòng chưa hủy có ngày trả sau hôm nay và ngày nhận trong tháng đang xem trở về trước, xếp theo ngày nhận. Mỗi dòng: người đặt, "Phòng 1509 · 10/10 → 12/10 (2 đêm)", tiền phòng, trạng thái tiền ("Cọc 1.000.000đ", "Chưa cọc", "Đã thanh toán") | Đọc như bước 1. Hôm nay theo giờ Việt Nam |
| 15 | Chạm một dòng | Mở chi tiết đặt phòng CN3-02 (YC5) | Không |
| 16 | Không có đặt phòng sắp tới | CN1-01: "Chưa có đặt phòng sắp tới. Bấm "+ Đặt phòng" để ghi khách đầu tiên." | Không |

Với bộ mẫu, tháng 10, hôm nay 07/10, danh sách là B1, B5, B6, B2, B7, B8 (DLM.5). B4 trả phòng hôm nay nên không có; B9 nhận 30/11 nên không có ở tháng 10. Đặt phòng đã hủy có hiện với nhãn "Đã hủy" không: [MỞ: YC2-H3]. Tới khi có câu trả lời, không hiện.

Tiêu chí:
- **YC2.4-NT1** Khi chủ nhà xem danh sách đặt phòng sắp tới, thì mỗi dòng có người đặt, mã căn, ngày nhận, ngày trả, số đêm, tiền phòng, trạng thái tiền. · unit
- **YC2.4-NT2** Khi đặt phòng chưa cọc (B5, B2), thì dòng đó ghi "Chưa cọc". · unit
- **YC2.4-NT3** Khi Chị Hoa xem tháng 10 lúc hôm nay là 07/10, thì danh sách sắp tới đúng thứ tự B1, B5, B6, B2, B7, B8; không có B3, B4, B9. · unit

## YC2.5 · Lịch tuần nhiều căn

Bản 1 · rủi ro: tb · Màn: CN2, CN2-00

Cách vào lịch tuần từ lịch tháng: [MỞ: YC2-H4]. Phần này code được, chỉ chưa nối lối vào.

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 17 | Mở lịch tuần | CN2: tiêu đề "Lịch tuần", nút "Đặt phòng", thanh tuần ("Trước", "05 – 11/10/2026", "Sau"), hàng chip lọc, ba ô tóm tắt, bảng | Đọc căn, đặt phòng như bước 1; giá chủ nhà từng đêm của mỗi căn trong tuần (hàm giá từng đêm, mục Database) |
| 18 | Xem bảng | Mỗi hàng một căn: "1509", "2PN · ICON40". Mỗi cột một ngày, T2 đến CN ("T4 07"). Ô trống hiện giá đêm rút gọn ("900k", "1,1tr"). Đêm có khách nối thành một thanh qua các ngày, ghi người đặt và nhãn tiền ("Sale Hùng · Đã cọc") | Không |
| 19 | Xem chú thích | "Đã cọc / đã thanh toán", "Chưa cọc", "800k: trống, giá đêm" | Không |
| 20 | Xem ba ô tóm tắt | tuần 05 – 11/10 của bộ mẫu: "Có khách hôm nay 0/2", "Trống tối T7 1 căn", "Chưa cọc 0 đặt phòng" | Không |
| 21 | Chạm chip lọc | Chip "Tất cả", một chip cho mỗi tòa có căn, và một chip cho mỗi số phòng ngủ ("3 phòng ngủ") khi các căn có từ hai số phòng ngủ khác nhau. Chạm chip thì bảng chỉ còn căn khớp | Không |
| 22 | Bấm "Trước", "Sau" | Sang tuần trước, tuần sau | Đọc tuần mới |
| 23 | Chạm một ô hay một thanh | Ô trống: form ghi đặt phòng với căn và ngày đó (YC5). Thanh: chi tiết đặt phòng (YC5) | Không |

Tuần chưa có đặt phòng nào: CN2-00, bảng vẫn hiện đủ giá, thêm dòng "Tuần này chưa có đặt phòng nào. Mọi căn đều trống.".

Ô trống của đêm chưa đặt giá hiện gì: [MỞ: YC2-H2]. Tới khi có câu trả lời, ô để trống. Ba ô tóm tắt tính cho hôm nay hay cho tuần đang xem: [MỞ: YC2-H5]. Tới khi có câu trả lời, "Có khách hôm nay" tính theo hôm nay, "Trống tối T7" theo thứ Bảy của tuần đang xem, "Chưa cọc" theo các đặt phòng có đêm trong tuần đang xem.

Chip lọc sinh theo căn thật: Tùng (bản Zalo, 04/11/2026) "bạn tự quyết nhé, đúng logic là ok".

Tiêu chí:
- **YC2.5-NT1** Khi chủ nhà mở lịch tuần 05 – 11/10/2026, thì mỗi căn một hàng và bảy cột từ "T2 05" tới "CN 11". · unit
- **YC2.5-NT2** Khi một ô không có khách, thì ô hiện giá chủ nhà của đêm đó: 1509 ngày 08/10 "900k", 3402 ngày 09/10 "1,1tr". · unit, database (hàm giá từng đêm)
- **YC2.5-NT3** Khi chủ nhà chạm chip "ICON40", thì bảng chỉ còn 1509. · unit
- **YC2.5-NT4** Khi chủ nhà xem tuần 12 – 18/10/2026, thì ô tóm tắt ghi "Chưa cọc 2 đặt phòng" (B5, B2). · unit
- **YC2.5-NT5** Khi mọi căn của chủ nhà cùng là 2PN, thì không có chip theo số phòng ngủ; có một căn 3PN thì có chip "3 phòng ngủ". · unit

## Màn hình

Hình: `python3 scripts/trich-man.py <mã>`. Chữ và số trên hình lệch YC thì YC đúng.

- **CN1 · Lịch tháng.** Đúng bố cục. Danh sách sắp tới trên hình có 4 dòng; đủ 6 dòng khi kéo xuống. Nút "Gửi lịch cho sale" thuộc YC6.
- **CN1-00 · Chưa có đặt phòng.** Đúng.
- **CN1-01 · Chưa có đặt phòng sắp tới.** Đúng.
- **CN1-02 · Ba căn.** Dòng nhỏ ghi "20 đêm có khách · 3 căn": theo YC2.3, không ghi số căn.
- **CN3 · Chi tiết một ngày.** Chữ trên nút dòng căn trống là "Đặt phòng", không phải "Thêm khách" như hình.
- **CN2, CN2-00 · Lịch tuần.** Hình có 6 căn và tòa "Tòa A", "Tòa B" là ví dụ; dữ liệu thật theo căn của chủ nhà. Ô tóm tắt trên hình ghi "1/6", bộ mẫu tuần 05 – 11/10 là "0/2".

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Tạo từ các story US2, US9 đã gộp (QD20) và tách đặc tả khỏi việc (QD21) | Cả file |
| r2 | 2026-11-19 | Claude | US10-chi-tiet-ngay | Ngày đã qua mở chi tiết như ngày khác, trả lời YC2-H6 (Claude tự chốt, QD25) | YC2.2 |
