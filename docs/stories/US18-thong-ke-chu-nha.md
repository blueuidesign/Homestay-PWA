# US18 · Thống kê tháng của chủ nhà

- Loại: tính năng
- Trạng thái: chờ code
- Đặc tả: thô (lắp bằng máy từ bản Zalo, chưa viết lại theo khuôn, chưa áp các quyết định ở `docs/tham-khao/Loi_Tung_ban_Zalo.md`; không code theo bản này, xem US41)
- Bản: 1
- Rủi ro: cao
- Làm sau khi xong: US3, US3
- Kiểm tay: `tests/kich-ban/US18.md` (23 kịch bản)

## Mục tiêu
Là chủ nhà, tôi muốn xem tháng này thu bao nhiêu, căn nào kín, ai bán được bao nhiêu và khoản nào chưa thu, để biết tình hình mà không phải cộng tay.

## Hành vi
Bảng bước ghi: người dùng làm gì, app hiện gì (chữ trong ngoặc kép là chữ trên màn), máy chủ phải làm gì, dữ liệu nào đổi. Cột "Máy chủ" mô tả việc phải xảy ra; bản PWA làm bằng RLS, view và hàm `fn_*` của Supabase.

### Thống kê tháng của chủ nhà
Rủi ro: cao
Mục đích: chủ nhà thấy tháng này kiếm được bao nhiêu, phòng nào kiếm nhiều, phòng kín bao nhiêu đêm.
Màn hình: CN8, CN8-00
Khi nào xảy ra: chủ nhà mở tab Thống kê.

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở tab Thống kê | Tiêu đề "Thống kê", hàng chọn tháng: nút ‹ ›, "T09 · Tháng 10/2026 · T11" | số liệu tháng của chủ nhà gọi, chỉ của mình, PQ16.CHU) | Không | Không |
| 2 | Xem doanh thu tháng | Thẻ "DOANH THU THÁNG 10": 11.800.000đ, "+22.9% so với tháng 9" | doanh thu cộng tiền các đêm thuộc tháng từ `booking_dem`, bỏ đặt phòng đã hủy, QT2.2, QT4.2, QD-012). Kèm doanh thu tháng trước để app tính phần so với tháng trước | Không | Không |
| 3 | Xem từng phòng | Thẻ "PHÒNG 1509: 6.700.000đ", "PHÒNG 3402: 5.100.000đ" | tiền từng căn, tính từ `booking_dem` theo tháng của đêm, QT2.2) | Không | Không |
| 4 | Xem độ kín phòng | Thẻ "ĐÊM CÓ KHÁCH: 13/62", thẻ "CÔNG SUẤT: 21.0%" | đêm có khách đếm từ `booking_dem` theo tháng của đêm, QT2.2). Mẫu số công suất: [MỞ: CH-029] | Không | Không |
| 5 | Chạm T09 hoặc T11, hoặc bấm ‹ › | Đổi sang tháng đó, mọi số trên màn đổi theo | với tháng mới chọn | Không | Không |
| 6 | Xem tháng chưa có booking | CN8-00: doanh thu 0đ ghi "Chưa có đặt phòng"; hai phòng 0đ; đêm có khách 0; công suất 0% | tháng không có đêm nào thì các số tính ra 0 | Không | Không |

Theo quy tắc: Doanh thu tính theo tháng; Công suất; Chủ nhà thấy một giá (nhóm Booking).

Trạng thái màn:
- rỗng: CN8-00 (tháng chưa có booking)
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: không áp dụng (chỉ chủ nhà có tab này)
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

### Doanh thu 6 tháng
Rủi ro: cao
Mục đích: chủ nhà thấy tháng này cao hay thấp hơn các tháng trước.
Màn hình: CN8, CN8-00
Khi nào xảy ra: chủ nhà xem tiếp xuống dưới trên màn Thống kê.

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Xem biểu đồ | "DOANH THU 6 THÁNG": 6 cột, mỗi cột ghi số rút gọn trên đầu ("7.2tr", "13.4tr") và nhãn tháng ("T5" đến "T10") | thêm doanh thu các tháng trước cho biểu đồ | Không | Không |
| 2 | Xem tháng đang chọn | Cột tháng đang xem tô màu đậm, các tháng khác nhạt | Không gọi server | Không | Không |
| 3 | Đổi tháng ở mục "Thống kê tháng của chủ nhà" | Biểu đồ dời cửa sổ 6 tháng theo tháng đang xem (CN8-00 cho tháng 12 hiện T7 đến T12, cột T12 trống) | Như bước 1, với tháng mới chọn | Không | Không |

Theo quy tắc: Giá rút gọn (nhóm Lịch chủ nhà); Doanh thu tính theo tháng.

Trạng thái màn:
- rỗng: cột của tháng chưa có booking không có thanh, không có số
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: không áp dụng
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

### Doanh thu theo người bán
Rủi ro: cao
Mục đích: chủ nhà thấy ai bán được bao nhiêu trong tháng, gồm cả khách lẻ chủ nhà tự ghi.
Màn hình: CN8, CN8-00
Khi nào xảy ra: chủ nhà xem tiếp xuống dưới trên màn Thống kê.

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Xem danh sách | "DOANH THU THEO NGƯỜI BÁN": mỗi dòng tên và số tiền ("Sale Hùng 4.000.000đ", "Khách lẻ 2.600.000đ") | doanh thu theo người bán, đặt phòng không gắn sale vào "Khách lẻ", QT2.2). Không có giá bán bước 4, PQ11.CHU) | Không | Không |
| 2 | Xem thứ tự | Xếp theo số tiền giảm dần (Hùng, Lan, Khách lẻ, Minh) | Không gọi thêm, dùng dữ liệu bước 1 | Không | Không |
| 3 | Tháng chưa có booking | Dòng "Chưa có đặt phòng trong tháng." | tháng không có đặt phòng nào | Không | Không |

Theo quy tắc: Doanh thu tính theo tháng; Chủ nhà thấy một giá (nhóm Booking); Khách lẻ là booking không qua sale.

Trạng thái màn:
- rỗng: "Chưa có đặt phòng trong tháng."
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: không áp dụng
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

### Chưa thu tiền
Rủi ro: cao
Mục đích: chủ nhà thấy booking nào chưa cọc để đòi hoặc nhắc.
Màn hình: CN8, CN8-00
Khi nào xảy ra: chủ nhà xem cuối màn Thống kê.

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Xem tổng | "CHƯA THU TIỀN": 3.700.000đ | PQ16.CHU). Khoản nào là "chưa thu": [MỞ: CH-031] | Không | Không |
| 2 | Xem từng khoản | Mỗi dòng: người bán và ngày ("Sale Lan · 17/10 → 19/10"), tình trạng ("Chưa cọc · nhận phòng sau 10 ngày"), số tiền | Như bước 1; tiền còn lại tính lúc đọc, số ngày tới ngày nhận tính theo hôm nay giờ Việt Nam | Không | Không |
| 3 | Không có khoản nào | CN8-00: tổng 0đ, dòng "Không có khoản nào chưa thu." | không có khoản nào | Không | Không |

Theo quy tắc: Tiền còn lại (nhóm Booking); Booking chưa cọc.

Trạng thái màn:
- rỗng: "Không có khoản nào chưa thu."
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: không áp dụng
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

## Tiêu chí nghiệm thu
Mỗi tiêu chí một test tự động mang đúng mã này trong tên test. Mã không đổi nghĩa; đổi hành vi thì cấp mã mới (docs/QUY_TRINH.md mục 5).

- **US18-NT1** Khi tháng 10 có hai phòng 6.700.000đ và 5.100.000đ, thì doanh thu tháng ghi 11.800.000đ.
- **US18-NT2** Khi tháng 10 có 13 đêm có khách trên 2 phòng × 31 đêm, thì công suất ghi 21.0% (13 chia 62).
- **US18-NT3** Khi doanh thu tháng 9 là 9.600.000đ và tháng 10 là 11.800.000đ, thì dòng so sánh ghi +22.9%.
- **US18-NT4** Khi chủ nhà chạm T11, thì tiêu đề thành "Tháng 11/2026" và các thẻ đổi theo tháng 11.
- **US18-NT5** Khi tháng chưa có booking, thì mọi số ghi 0 và không có dòng phần trăm so sánh.
- **US18-NT6** Khi doanh thu một tháng là 13.400.000đ, thì cột ghi "13.4tr".
- **US18-NT7** Khi chủ nhà xem tháng 10, thì cột T10 là cột đậm duy nhất.
- **US18-NT8** Khi chủ nhà xem tháng 12, thì biểu đồ gồm T7 đến T12.
- **US18-NT9** Khi tháng có 4 người bán với 4.000.000đ, 3.500.000đ, 2.600.000đ, 1.700.000đ, thì tổng các dòng bằng doanh thu tháng 11.800.000đ.
- **US18-NT10** Khi chủ nhà tự ghi booking không qua sale, thì số tiền vào dòng "Khách lẻ".
- **US18-NT11** Khi chủ nhà xem màn này, thì không dòng nào hiện giá bán của sale hay phần chênh.
- **US18-NT12** Khi có hai booking chưa cọc 1.900.000đ và 1.800.000đ, thì tổng ghi 3.700.000đ.
- **US18-NT13** Khi booking nhận phòng trong 3 ngày nữa mà chưa cọc, thì dòng ghi "nhận phòng sau 3 ngày".
- **US18-NT14** Khi chủ nhà đánh dấu đã thu đủ ở mục "Chi tiết booking và đánh dấu đã thu đủ" (US3), thì khoản đó biến khỏi danh sách.

## Luật kiểm dữ liệu và lỗi
Mỗi mục là một việc app nhờ database làm. "Đầu vào" là luật kiểm từng ô, "Lỗi riêng" là khi nào phải từ chối. Cột "Mã" là tên gọi trong tài liệu; hàm database báo lỗi bằng một câu tiếng Việt cho người dùng đọc (docs/luat-chung/Nghiep_vu.md mục Lỗi).

### Số liệu một tháng của chủ nhà
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| `thang` | thang | Có | `YYYY-MM`, năm 2020 đến 2100 |
| `so_thang` | số nguyên | Không | 1 đến 12, mặc định 1. Độ dài `chuoi_thang` (mục "Doanh thu 6 tháng" dùng 6) |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| DU_LIEU_SAI | `thang` thiếu hay sai dạng; `so_thang` ngoài 1 đến 12 |

## Ai được làm và việc kéo theo
Nguyên liệu chép từ đặc tả máy chủ của bản Zalo, đã đổi tên bảng và mã. Đối chiếu với hàm database ở mục Database khi viết lại story: chỗ nào lệch thì ghi vào "Database đang lệch story". Tên lỗi viết hoa (`KHONG_TIM_THAY`, `DU_LIEU_SAI`) là tên loại lỗi của bản cũ; bản PWA báo bằng câu tiếng Việt.

### Số liệu một tháng của chủ nhà
**Ai gọi:** người đã đăng nhập. Số liệu chỉ gồm đặt phòng mà người gọi là chủ nhà lúc ghi (`booking.chu_nha_id`) ở căn `co_lich` của mình, kể cả căn đã ẩn (PQ16.CHU, Thiet_ke_DB `can.an_luc`). Không có đặt phòng của chủ nhà khác. Không có giá bán, tiền chênh (PQ11.CHU, PQ15.CHU). Sale gọi chỉ thấy căn mình giữ, không bao giờ thấy số của chủ nhà đã kết nối (PQ16.SALE). Tài khoản `vai_chon` sale có căn riêng (QD-005) có dùng màn này không: [MỞ: US18-H3] nhóm Thống kê không nói.

Luật tính:
- Chỉ đặt phòng chưa hủy: `booking.trang_thai <> 'da_huy'` (QD-012; cột đề xuất ởđiểm 2, chưa có trong Thiet_ke_DB).
- Theo tháng của đêm: cộng `booking_dem.gia_chu` của các đêm có `ngay` trong tháng (QD-010, QT2.2, QT4.2).
- Đêm có khách: số dòng `booking_dem` trong tháng (QT2.1, QT2.2).

**Việc kéo theo:** Không.

**Chống bấm hai lần:** không cần (đọc).

## Luật chung dùng
Nguyên văn ở `docs/luat-chung/` (QT.md, HV.md, Nghiep_vu.md, Tu_dien.md), tìm theo mã hoặc tên.

Quy tắc trong nhóm Thống kê: Doanh thu tính theo tháng, Công suất, So với tháng trước, Khách lẻ là booking không qua sale, Chưa thu tiền. QT2.1, QT2.2, QT4.1, QT4.2 (đêm và tiền từng đêm). Quy tắc trong nhóm Booking: Tiền còn lại, Chủ nhà thấy một giá. QD-010 (chia theo đêm), QD-012 (đặt phòng đã hủy không tính). HV1, HV2, HV3.

## Màn hình
Hình: `python3 docs/thiet-ke/trich-man.py <mã màn>` (docs/thiet-ke/README.md). Chữ và số trên hình lệch story thì story đúng.

CN8, CN8-00.

**CN8-00 · Thống kê · tháng chưa có booking**
Vào từ: Xem YC (canvas chưa có mũi tên tới màn này)
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Tiêu đề | "Thống kê" | Canvas |
| 2 | Khối nội dung | "T11 Tháng 12/2026 T01" | Canvas |
| 3 | Khối nội dung | "DOANH THU THÁNG 12 0đ Chưa có đặt phòng PHÒNG 1509 0đ PHÒNG 3402 0đ ĐÊM CÓ KHÁCH 0 CÔNG SUẤT 0%" | Canvas |
| 4 | Khối nội dung | "DOANH THU 6 THÁNG 13.4tr T7 14.1tr T8 9.6tr T9 11.8tr T10 6.1tr T11 T12" | Canvas |
| 5 | Khối nội dung | "DOANH THU THEO NGƯỜI BÁN Chưa có đặt phòng trong tháng." | Canvas |
| 6 | Khối nội dung | "CHƯA THU TIỀN 0đ Không có khoản nào chưa thu." | Canvas |
| 7 | Thanh tab | Lịch · Căn · Sale · Thống kê · Cá nhân | Cố định |
| 8 | Cỡ chữ, vùng bấm | Chữ tối thiểu 14 px, vùng bấm tối thiểu 44 px | CLAUDE.md |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Tháng trước" | Theo YC, canvas chưa nối mũi tên | |
| "Tháng sau" | Theo YC, canvas chưa nối mũi tên | |
Trạng thái riêng:
- rỗng: chưa thiết kế
- không có quyền: chưa thiết kế

**CN8 · Thống kê tháng**
Vào từ: Tab Thống kê
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Chọn tháng | "T09 · Tháng 10/2026 · T11" | Tháng |
| 2 | Doanh thu tháng | "11.800.000đ", "+22.9% so với tháng 9" | DLM.5 |
| 3 | Theo căn | "Phòng 1509 6.700.000đ", "Phòng 3402 5.100.000đ" | DLM.5 |
| 4 | Đêm có khách, công suất | "13/62", "21.0%" | DLM.5 |
| 5 | Doanh thu 6 tháng | Cột T5 7.2tr … T9 9.6tr, T10 11.8tr | DLM.5 |
| 6 | Theo người bán | Sale Hùng 4.000.000đ, Sale Lan 3.500.000đ, Khách lẻ 2.600.000đ, Sale Minh 1.700.000đ | DLM.5 |
| 7 | Chưa thu tiền | "3.700.000đ"; Sale Lan · 17/10 → 19/10 "Chưa cọc · nhận phòng sau 10 ngày" 1.900.000đ; Khách lẻ · 13/10 → 15/10 "Chưa cọc · nhận phòng sau 6 ngày" 1.800.000đ | DLM.5 |
| 8 | Thanh tab | Lịch · Căn · Sale · Thống kê · Cá nhân | Cố định |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| T09, T11 | Xem tháng khác | CN8 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- đang tải: chưa thiết kế (HV1)
- lỗi mạng: chưa thiết kế (HV2)
- quay lại từ nền: chưa thiết kế (HV3)

## Quyền
Ô quyền theo `docs/luat-chung/PQ.md`. Mỗi ô phải có test chứng minh người không có quyền thì không đọc, không ghi được; test ở lớp database (`tests/db/`).

Ô PQ chạm tới (ma trận `docs/luat-chung/PQ.md`): PQ16.CHU, PQ16.SALE, PQ11.CHU, PQ15.CHU. Test vi phạm phải có:
- PQ16.CHU: Anh Tuấn gọi, không có số nào của 1509, 3402.
- PQ16.SALE: Sale Hùng gọi, không có số nào của căn Chị Hoa, Anh Tuấn.
- PQ11.CHU, PQ15.CHU: dữ liệu trả về của Chị Hoa không có khóa giá bán, tiền chênh ở bất kỳ mức nào, kể cả dòng Sale Hùng.
- Luật chung 4: gọi khi không có phiên trả `CHUA_DANG_NHAP`.

## Database
Đã có trong `supabase/migrations/` và đã chạy test. Tham số và cột: `docs/tu-sinh/Bang_va_cot.md`.

- `fn_thong_ke_chu`: test ở t_10_thong_ke.sql

## Ngoài phạm vi
- Doanh thu tháng, ba số tóm tắt ở tab Lịch (mục "Tóm tắt tháng" (US2)): US2.
- Xóa đặt phòng, đánh dấu đã thu đủ (mục "Chi tiết booking và đánh dấu đã thu đủ" (US3), mục "Xóa booking" (US3)): US3. Ở đây chỉ kiểm hiệu ứng của chúng lên thống kê (KB14, KB17).
- Thống kê của sale (mục "Thống kê của sale" (US19)), danh sách đặt phòng của sale (mục "Trạng thái booking của sale" (US19)): US19.
- Tên người bán hay sale đã xóa tài khoản trong doanh thu theo người bán (mục "Doanh thu theo người bán" kèm QD-013): US22 (US22-KB31).
- Thêm hoặc ẩn căn giữa tháng ảnh hưởng công suất: chờ [MỞ: US18-H1] ở trên.
- Tài khoản chọn vai sale mà có căn riêng (QD-005) có dùng màn này không: [MỞ: US18-H2] US18-Q3.

## Việc cần làm
- [ ] Đọc story này và các luật chung nó trỏ tới. Chỗ nào gắn thẻ MỞ thì không code, hỏi Tùng (docs/Cau_hoi_mo.md).
- [ ] Viết test cho từng tiêu chí chưa có test, test đỏ trước (lớp test: docs/QUY_TRINH.md mục 6).
- [ ] Database: soát các hàm ở mục Database với tiêu chí; thiếu thì thêm migration mới và một dòng trong `scripts/thu-lam-hong.sh`.
- [ ] Giao diện: các màn ở mục Màn hình, nối với Supabase (docs/Ghi_chu_code.md).
- [ ] E2E cho luồng chính của story.
- [ ] Kiểm tay theo `tests/kich-ban/US18.md` trên điện thoại thật.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md` trong cùng PR.
