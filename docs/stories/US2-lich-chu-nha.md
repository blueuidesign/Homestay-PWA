# US2 · Chủ nhà xem lịch: tháng, chi tiết ngày, doanh thu tháng, đặt phòng sắp tới, lịch tuần

- Loại: tính năng
- Trạng thái: chờ code
- Đặc tả: đã viết lại
- Bản: 1
- Rủi ro: tb (đọc tiền và khách của chủ nhà; không ghi gì)
- Làm sau khi xong: US1 (căn)
- Kiểm tay: `tests/kich-ban/US2.md`

## Mục tiêu

Là chủ nhà, tôi muốn mở app là thấy ngay tháng này ngày nào căn nào có khách, chạm một ngày để biết ai ở, và thấy tháng này thu được bao nhiêu, đặt phòng nào sắp tới còn chưa cọc, để trả lời sale ngay khi họ gọi hỏi mà không phải lật sổ.

Vì sao quan trọng: tab Lịch là màn chủ nhà mở nhiều nhất. Nó thay cho cuốn sổ tay. Nếu lịch tô sai một đêm (ví dụ tô cả ngày trả phòng), chủ nhà sẽ từ chối khách cho một đêm thật ra còn trống, hoặc tệ hơn, nhận khách vào đêm đã có người. Vì vậy lịch tô theo đúng luật đêm (QT2): một lần ở chiếm các đêm từ ngày nhận tới trước ngày trả.

## Luồng chính

Hôm nay là 07/10/2026. Chị Hoa mở app, tab Lịch hiện "Tháng 10/2026". Hàng chip có "Cả 2 phòng" (đang chọn), "1509", "3402". Trên lưới, ô 10/10 và 11/10 tô màu của 1509 (B1 của Sale Hùng), ô 12/10 không tô. Chú thích dưới lưới ghi "1509 đã đặt", "3402 đã đặt".

Dưới lưới, khối "Doanh thu tháng 10" ghi 11.800.000đ và dòng "13 đêm có khách · tháng 9: 9.600.000đ". Dưới nữa là "Đặt phòng sắp tới": dòng đầu "Sale Hùng · Phòng 1509 · 10/10 → 12/10 (2 đêm) · 2.200.000đ · Cọc 1.000.000đ", dòng thứ hai "Khách lẻ · Phòng 1509 · 13/10 → 15/10 (2 đêm) · 1.800.000đ · Chưa cọc".

Sale Lan gọi hỏi 3402 đêm 10/10. Chị chạm ô 10/10. Phần "Ngày 10/10/2026" mở ngay dưới lưới: "Phòng 1509 · Sale Hùng · 0912 345 678 · 10/10 → 12/10 (2 đêm) · 2.200.000đ · Cọc: 1.000.000đ" và "Phòng 3402 · Trống ✓" với nút "Đặt phòng". Chị trả lời Sale Lan là 3402 còn trống.

## Phạm vi

Story này làm:
- Lịch tháng (CN1): thanh tháng, chip lọc theo căn, lưới tô đêm có khách theo màu căn, chú thích, màn trống CN1-00.
- Chi tiết một ngày (CN3) mở dưới lưới: mỗi căn một dòng, có khách hay trống.
- Khối doanh thu tháng và danh sách đặt phòng sắp tới dưới lưới (CN1, CN1-01, CN1-02).
- Lịch tuần nhiều căn (CN2, CN2-00): bảng căn × 7 ngày, ô trống hiện giá đêm, ba ô tóm tắt, chip lọc theo tòa và số phòng ngủ.

Không làm (dễ tưởng thuộc story này):
- Form ghi đặt phòng mở từ nút "Đặt phòng" và từ nút trên dòng căn trống ở chi tiết ngày: US3.
- Chi tiết một đặt phòng (CN3-02), sửa, xóa, ghi đã thu đủ: US3.
- Nút "Gửi lịch cho sale" (CN10): US5.
- Màn trống A4 khi chưa có căn nào: US1.
- Thống kê tháng đầy đủ (theo căn, theo người bán, công suất, 6 tháng): US18.
- Căn tự nhập của sale (không có lịch): US16.

## Hành vi

Cột "Database" ghi việc phải xảy ra ở database. Chữ trong ngoặc kép là chữ trên màn, viết đúng như vậy. Mọi thứ trong story này là đọc; không có lệnh ghi.

### Lịch tháng và lọc theo căn

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Mở tab Lịch (chủ nhà có ít nhất một căn) | CN1: tiêu đề "Lịch", nút "Đặt phòng", thanh tháng ("T09", "Tháng 10/2026", "T11"), hàng chip lọc, lưới tháng bắt đầu từ thứ Hai, chú thích màu ("1509 đã đặt", "3402 đã đặt"). Tháng mở sẵn là tháng của hôm nay | Đọc căn của mình (loại có lịch, chưa ẩn) và đặt phòng chưa hủy của các căn đó có đêm trong tháng, qua RLS |
| 2 | Xem lưới | Mỗi đêm có khách tô màu của căn đó (quy tắc "Màu theo căn"). Ngày trả phòng không tô nếu không có khách khác nhận đêm đó (QT2). Một ngày có khách ở hai căn thì ô có hai màu | Không |
| 3 | Chạm một chip căn | Lưới chỉ còn tô đêm có khách của căn đó. Chip đầu: "Cả 2 phòng" khi có 2 căn, "Tất cả" khi có từ 3 căn. Chủ nhà có 1 căn thì không có hàng chip | Không gọi thêm |
| 4 | Bấm "T09" hoặc "T11" | Chuyển sang tháng trước, tháng sau; tiêu đề thành "Tháng 11/2026", chip đang chọn giữ nguyên | Đọc đặt phòng của tháng mới |
| 5 | Bấm "Đặt phòng" | Mở form ghi đặt phòng (US3) | Không |
| 6 | Chạm một ngày | Mở chi tiết ngày ngay dưới lưới (mục Chi tiết một ngày), ô ngày đó viền đậm | Không |

Chủ nhà có căn nhưng chưa có đặt phòng nào (ở mọi tháng): CN1-00, thay cho chú thích và các khối dưới lưới: "Chưa có đặt phòng nào", "Bấm "Đặt phòng" để thêm khách đầu tiên. Ngày có khách sẽ tô màu theo phòng.", nút "Đặt phòng", gợi ý "💡 Mời sale xem lịch để sale tự biết ngày trống, không phải gọi hỏi. Vào tab Sale.".

### Chi tiết một ngày

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 7 | (sau bước 6) | Tiêu đề "Ngày 10/10/2026". Mỗi căn (theo chip đang chọn) một dòng | Dùng dữ liệu đã đọc ở bước 1 và phần riêng của chủ nhà |
| 8 | Căn có khách đêm đó | "Phòng 1509", người đặt (tên sale, hoặc tên khách chủ nhà đã nhập, hoặc "Khách lẻ"), số điện thoại của sale nếu có, "10/10 → 12/10 (2 đêm)", "2.200.000đ · Cọc: 1.000.000đ" (hoặc "Chưa cọc", "Đã thanh toán"), ghi chú nếu có | Đọc `booking`, `booking_rieng` của chính chủ nhà (tên khách, số khách) qua RLS; số điện thoại sale từ `profiles` của người đã kết nối |
| 9 | Chạm dòng căn có khách | Mở chi tiết đặt phòng CN3-02 (US3) | Không |
| 10 | Căn trống đêm đó | "Phòng 3402 · Trống ✓" và nút "Đặt phòng" (bấm: US3) | Không |

Chạm một ngày đã qua thì mở gì: [MỞ: CH-017]. Tới khi có câu trả lời, mở chi tiết ngày như ngày khác, nút "Đặt phòng" vẫn có (ghi bù được, US3).

### Doanh thu tháng

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 11 | Xem dưới lưới (tháng có đặt phòng) | Khối "Doanh thu tháng 10": số tiền lớn "11.800.000đ", dòng nhỏ "13 đêm có khách · tháng 9: 9.600.000đ". Tháng trước không có doanh thu thì bỏ phần "tháng 9: …" | `fn_thong_ke_chu(tháng)`: tổng tiền từng đêm của đêm thuộc tháng (QD-010), bỏ đặt phòng đã hủy (QD-012), tính cả căn đã xóa; số đêm có khách; doanh thu tháng trước |
| 12 | Đổi tháng | Khối đổi theo tháng mới | Gọi lại với tháng mới |
| 13 | Tháng đang xem không có đặt phòng nào | Không hiện khối | Không |

Đổi chip lọc căn thì số tiền và số đêm có đổi theo căn không: [MỞ: US2-H1]. Tới khi có câu trả lời, khối luôn là tổng mọi căn.

### Đặt phòng sắp tới

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 14 | Kéo xuống | Danh sách "Đặt phòng sắp tới": đặt phòng chưa hủy có ngày trả sau hôm nay và ngày nhận trong tháng đang xem trở về trước, xếp theo ngày nhận. Mỗi dòng: người đặt, "Phòng 1509 · 10/10 → 12/10 (2 đêm)", tiền phòng, trạng thái tiền ("Cọc 1.000.000đ", "Chưa cọc", "Đã thanh toán") | Đọc qua RLS như bước 1. Hôm nay theo giờ Việt Nam |
| 15 | Chạm một dòng | Mở chi tiết đặt phòng CN3-02 (US3) | Không |
| 16 | Không có đặt phòng sắp tới | CN1-01: "Chưa có đặt phòng sắp tới. Bấm "+ Đặt phòng" để ghi khách đầu tiên." | Không |

Với bộ mẫu, tháng 10, hôm nay 07/10, danh sách là B1, B5, B6, B2, B7, B8 (DLM.5). B4 trả phòng hôm nay nên không có; B9 nhận 30/11 nên không có ở tháng 10. Đặt phòng đã hủy có hiện với nhãn "Đã hủy" không: [MỞ: US2-H3]. Tới khi có câu trả lời, không hiện.

### Lịch tuần nhiều căn

Cách vào lịch tuần từ lịch tháng: [MỞ: CH-015]. Phần này code được, chỉ chưa nối lối vào.

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 17 | Mở lịch tuần | CN2: tiêu đề "Lịch tuần", nút "Đặt phòng", thanh tuần ("Trước", "05 – 11/10/2026", "Sau"), hàng chip lọc, ba ô tóm tắt, bảng | Đọc căn, đặt phòng như bước 1; giá chủ nhà từng đêm của mỗi căn trong tuần (hàm giá từng đêm, mục Database) |
| 18 | Xem bảng | Mỗi hàng một căn: "1509", "2PN · ICON40". Mỗi cột một ngày, T2 đến CN ("T4 07"). Ô trống hiện giá đêm rút gọn ("900k", "1,1tr"). Đêm có khách nối thành một thanh qua các ngày, ghi người đặt và nhãn tiền ("Sale Hùng · Đã cọc") | Không |
| 19 | Xem chú thích | "Đã cọc / đã thanh toán", "Chưa cọc", "800k: trống, giá đêm" | Không |
| 20 | Xem ba ô tóm tắt | tuần 05 – 11/10 của bộ mẫu: "Có khách hôm nay 0/2", "Trống tối T7 1 căn", "Chưa cọc 0 đặt phòng" | Không |
| 21 | Chạm chip lọc | Chip "Tất cả", một chip cho mỗi tòa có căn, và một chip cho mỗi số phòng ngủ ("3 phòng ngủ") khi các căn có từ hai số phòng ngủ khác nhau. Chạm chip thì bảng chỉ còn căn khớp | Không |
| 22 | Bấm "Trước", "Sau" | Sang tuần trước, tuần sau | Đọc tuần mới |
| 23 | Chạm một ô hay một thanh | Ô trống: form ghi đặt phòng với căn và ngày đó (US3). Thanh: chi tiết đặt phòng (US3) | Không |

Tuần chưa có đặt phòng nào: CN2-00, bảng vẫn hiện đủ giá, thêm dòng "Tuần này chưa có đặt phòng nào. Mọi căn đều trống.".

Ô trống của đêm chưa đặt giá hiện gì: [MỞ: US2-H2]. Tới khi có câu trả lời, ô để trống. Ba ô tóm tắt tính cho hôm nay hay cho tuần đang xem: [MỞ: CH-016]. Tới khi có câu trả lời, "Có khách hôm nay" tính theo hôm nay, "Trống tối T7" theo thứ Bảy của tuần đang xem, "Chưa cọc" theo các đặt phòng có đêm trong tuần đang xem.

### Trạng thái màn

- Đang tải: theo HV1 (khung xám tại chỗ của lưới, khối doanh thu, danh sách).
- Mất mạng: theo HV2; giữ dữ liệu đã hiện, đổi tháng khi mất mạng thì báo theo HV2.
- Quay lại từ nền: theo HV3, đọc lại tháng đang xem (đặt phòng có thể đã đổi trên máy khác).
- Phiên hết hạn: theo HV7.

## Tiêu chí nghiệm thu

Mỗi tiêu chí một test mang đúng mã trong tên test. Lớp test ghi ở cuối dòng: **database** (`tests/db/`), **unit** (Vitest), **E2E** (Playwright trên staging). Số theo `docs/luat-chung/Du_lieu_mau.md`, hôm nay 07/10/2026.

Lịch tháng:
- **US2-NT1** Khi chủ nhà có 2 căn và mở tab Lịch, thì thấy chip "Cả 2 phòng" và một chip cho mỗi căn. · unit
- **US2-NT2** Khi chủ nhà có 3 căn và mở tab Lịch, thì thấy chip "Tất cả" và một chip cho mỗi căn. · unit
- **US2-NT3** Khi 1509 có B1 (nhận 10/10, trả 12/10), thì ô 10/10 và 11/10 tô màu của 1509, ô 12/10 không tô màu của 1509 (QT2). · unit
- **US2-NT4** Khi chủ nhà chạm chip "3402", thì lưới chỉ tô đêm có khách của 3402 (05/10, 06/10, 14/10, 17/10, 18/10, 21/10), không tô đêm của 1509. · unit
- **US2-NT5** Khi chủ nhà bấm "T11", thì tiêu đề thành "Tháng 11/2026" và ô 30/11 tô màu của 3402 (B9). · unit
- **US2-NT6** Khi chủ nhà có căn nhưng chưa có đặt phòng nào, thì thấy CN1-00 với nút "Đặt phòng", không có khối doanh thu và danh sách sắp tới. · unit
- **US2-NT7** Khi chủ nhà chạm ô 10/10, thì phần chi tiết mở ngay dưới lưới với tiêu đề "Ngày 10/10/2026". · E2E
- **US2-NT8** Khi chủ nhà xem chi tiết ngày 10/10, thì dòng 1509 ghi "Sale Hùng", "10/10 → 12/10 (2 đêm)", "2.200.000đ · Cọc: 1.000.000đ", còn dòng 3402 ghi "Trống ✓". · unit
- **US2-NT9** Khi Anh Tuấn hay Sale Hùng đọc bảng `booking`, `booking_dem`, `booking_rieng`, thì không thấy dòng nào của đặt phòng của Chị Hoa (Sale Hùng chỉ thấy đêm kín qua lịch của sale, US6). · database

Doanh thu và đặt phòng sắp tới:
- **US2-NT10** Khi Chị Hoa xem tháng 10, thì khối ghi "Doanh thu tháng 10", "11.800.000đ", "13 đêm có khách". · database (`fn_thong_ke_chu`), unit (hiển thị)
- **US2-NT11** Khi tháng đang xem không có đặt phòng nào, thì không có khối doanh thu. · unit
- **US2-NT12** Khi chủ nhà xem danh sách đặt phòng sắp tới, thì mỗi dòng có người đặt, mã căn, ngày nhận, ngày trả, số đêm, tiền phòng, trạng thái tiền. · unit
- **US2-NT13** Khi đặt phòng chưa cọc (B5, B2), thì dòng đó ghi "Chưa cọc". · unit
- **US2-NT14** Khi Chị Hoa xem tháng 10 lúc hôm nay là 07/10, thì danh sách sắp tới đúng thứ tự B1, B5, B6, B2, B7, B8; không có B3, B4, B9. · unit

Lịch tuần:
- **US2-NT15** Khi chủ nhà mở lịch tuần 05 – 11/10/2026, thì mỗi căn một hàng và bảy cột từ "T2 05" tới "CN 11". · unit
- **US2-NT16** Khi một ô không có khách, thì ô hiện giá chủ nhà của đêm đó: 1509 ngày 08/10 "900k", 3402 ngày 09/10 "1,1tr". · unit, database (hàm giá từng đêm)
- **US2-NT17** Khi chủ nhà chạm chip "ICON40", thì bảng chỉ còn 1509. · unit
- **US2-NT18** Khi chủ nhà xem tuần 12 – 18/10/2026, thì ô tóm tắt ghi "Chưa cọc 2 đặt phòng" (B5, B2). · unit
- **US2-NT19** Khi mọi căn của chủ nhà cùng là 2PN, thì không có chip theo số phòng ngủ; có một căn 3PN thì có chip "3 phòng ngủ". · unit

## Luật kiểm dữ liệu và lỗi

Story này chỉ đọc. Lỗi có thể gặp:

| Tình huống | App làm gì |
|---|---|
| Mất mạng khi đổi tháng, đổi tuần | Theo HV2, giữ tháng đang hiện |
| Gọi `fn_thong_ke_chu` với tháng sai định dạng | Database báo lỗi; app luôn gửi ngày đầu tháng nên không gặp |
| Căn vừa bị xóa trên máy khác | Lần đọc sau không còn căn đó; chi tiết ngày không có dòng của nó |

## Quyền

Theo `docs/luat-chung/PQ.md`. Mỗi dòng có test vi phạm ở lớp database.

- PQ4.CHU: chủ nhà chỉ đọc lịch căn của mình (US2-NT9).
- PQ7.CHU, PQ8.CHU: chủ nhà thấy đủ người đặt, tiền phòng, tiền cọc của đặt phòng căn mình; người khác không đọc được (US2-NT9).
- PQ9.CHU: tên, số khách chủ nhà thấy là khách chính mình nhập (QD-011); khách sale nhập không hiện (`booking_rieng` chỉ trả phần của người đọc).
- PQ16.CHU: doanh thu tháng chỉ của chính chủ nhà; `fn_thong_ke_chu` chỉ tính căn người gọi giữ.

## Database

Bảng đọc: `can`, `booking`, `booking_dem`, `booking_rieng`, `profiles`. Cột và tham số: `docs/tu-sinh/Bang_va_cot.md`.

Đã có và đã chạy test:
- Policy `booking_read`, `booking_dem_read`, `booking_rieng_read`: test ở `tests/db/t_01_phan_quyen.sql`.
- `fn_thong_ke_chu(p_thang date)`: test ở `tests/db/t_10_thong_ke.sql`.

**Database đang lệch story, phải sửa trong PR của story này** (thêm migration mới, test, và dòng trong `scripts/thu-lam-hong.sh`):
1. Chưa có hàm cho chủ nhà lấy giá từng đêm của căn mình (`gia_dem` là hàm nội bộ). Lịch tuần cần giá mọi căn trong 7 đêm. Dùng chung hàm `fn_chu_gia_cac_dem` mà US3 cần (mục Database của US3); story nào làm trước thì thêm, chỉ cho người giữ căn (US2-NT16).
2. `fn_thong_ke_chu` tính doanh thu và số đêm của tháng nhưng chưa có test cho đúng số tháng 10 của bộ mẫu (11.800.000đ, 13 đêm). Thêm test US2-NT10.

Đọc qua RLS, không cần hàm: căn của mình, đặt phòng và tiền từng đêm của căn mình, phần riêng của mình, tên và số điện thoại của sale đã kết nối.

## Màn hình

Hình: `python3 docs/thiet-ke/trich-man.py <mã>`. Chữ và số trên hình lệch story thì story đúng.

- **CN1 · Lịch tháng.** Đúng bố cục. Danh sách sắp tới trên hình có 4 dòng; đủ 6 dòng khi kéo xuống. Nút "Gửi lịch cho sale" thuộc US5.
- **CN1-00 · Chưa có đặt phòng.** Đúng.
- **CN1-01 · Chưa có đặt phòng sắp tới.** Đúng.
- **CN1-02 · Ba căn.** Dòng nhỏ ghi "20 đêm có khách · 3 căn": theo story (bước 11), không ghi số căn.
- **CN3 · Chi tiết một ngày.** Chữ trên nút dòng căn trống là "Đặt phòng", không phải "Thêm khách" như hình.
- **CN2, CN2-00 · Lịch tuần.** Hình có 6 căn và tòa "Tòa A", "Tòa B" là ví dụ; dữ liệu thật theo căn của chủ nhà. Ô tóm tắt trên hình ghi "1/6", bộ mẫu tuần 05 – 11/10 là "0/2".

## Luật chung dùng

QT2 (đêm có khách) ở `docs/luat-chung/QT.md`. Nhóm Lịch chủ nhà ở `docs/luat-chung/Nghiep_vu.md`: Màu theo căn, Tuần bắt đầu thứ hai. Nhóm Booking: Trạng thái tiền booking. QD-010 (doanh thu chia theo đêm), QD-012 (đặt phòng đã hủy). HV1, HV2, HV3, HV7 ở `docs/luat-chung/HV.md`.

## Câu hỏi mở và giả định

- [MỞ: US2-H1] Đổi chip lọc căn thì khối doanh thu tháng có đổi theo căn không?
- [MỞ: US2-H2] Ở lịch tuần, ô trống của đêm chưa đặt giá hiện gì?
- [MỞ: US2-H3] Danh sách đặt phòng sắp tới có hiện đặt phòng đã hủy (nhãn "Đã hủy") không?
- [MỞ: CH-015] Chuyển giữa lịch tháng và lịch tuần bằng gì?
- [MỞ: CH-016] Ba ô tóm tắt ở lịch tuần tính cho hôm nay hay cho tuần đang xem?
- [MỞ: CH-017] Chạm một ngày đã qua ở lịch tháng thì mở gì?

Tùng đã quyết ở bản Zalo (04/11/2026): chip lọc lịch tuần sinh theo căn thật ("bạn tự quyết nhé, đúng logic là ok"); số tháng 9 của bộ mẫu chưa cần thêm đặt phòng ("chưa cần thêm dữ liệu mẫu, cái đó xem sau"), test dùng dữ liệu riêng cho tháng 9.

## Việc cần làm

- [ ] Hỏi Tùng US2-H1, US2-H2, US2-H3, CH-015, CH-016, CH-017. Phần còn lại làm được ngay theo cách tạm ghi ở từng chỗ.
- [ ] Test database cho US2-NT9, US2-NT10, US2-NT16 (phần hàm giá).
- [ ] Hàm giá từng đêm của chủ nhà (mục Database), nếu US3 chưa thêm. Dòng trong `scripts/thu-lam-hong.sh`: hàm chỉ cho người giữ căn. Chạy `scripts/bang-cot.sh`.
- [ ] Unit test cho các tiêu chí lớp unit, rồi code CN1, CN1-00, CN1-01, CN3, CN2, CN2-00; nối `src/services/api.ts` sang Supabase cho phần đọc lịch (`docs/Ghi_chu_code.md` mục 3).
- [ ] E2E: US2-NT7 trên staging.
- [ ] Sửa `tests/kich-ban/US2.md` theo story này: bỏ bước của Zalo, đổi ngày sang ngày còn trong tương lai.
- [ ] Kiểm tay trên điện thoại thật: lưới tháng, chạm ngày, lịch tuần cầm một tay.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md`.
