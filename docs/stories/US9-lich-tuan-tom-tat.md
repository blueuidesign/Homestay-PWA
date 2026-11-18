# US9 · Chủ nhà xem tóm tắt tháng, đặt phòng sắp tới và lịch tuần nhiều căn

- Loại: tính năng
- Trạng thái: chưa làm
- Đặc tả: thô (lắp bằng máy từ bản Zalo, chưa viết lại theo khuôn; không code theo bản này, xem US41)
- Bản: 1
- Rủi ro: cao
- Làm sau khi xong: US2
- Kiểm tay: `tests/kich-ban/US9.md` (19 kịch bản)

## Mục tiêu
Là chủ nhà, tôi muốn xem doanh thu tháng, các đặt phòng sắp tới và cả tuần của mọi căn trên một bảng, để biết tiền thu được và đặt phòng nào chưa cọc mà không phải chạm từng ngày.

## Hành vi
Bảng bước ghi: người dùng làm gì, app hiện gì (chữ trong ngoặc kép là chữ trên màn), máy chủ phải làm gì, dữ liệu nào đổi. Cột "Máy chủ" mô tả việc phải xảy ra; bản PWA làm bằng RLS, view và hàm `fn_*` của Supabase.

### Tóm tắt tháng
Rủi ro: cao
Mục đích: chủ nhà thấy nhanh tháng này thu được bao nhiêu và có bao nhiêu đêm có khách.
Màn hình: CN1, CN1-02
Khi nào xảy ra: chủ nhà ở tab Lịch, dưới lưới tháng.

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Xem dưới lưới | Khối "DOANH THU THÁNG 10": số tiền lớn, dòng nhỏ "13 đêm có khách · tháng 9: 9.600.000đ" (CN1, 2 căn). CN1-02 (3 căn) ghi "20 đêm có khách · 3 căn" và không có số tháng trước | kiểm quyền CHU (PQ16.CHU), tính doanh thu và số đêm từ `booking_dem` theo tháng của đêm (QD-010, QT2.2), bỏ đặt phòng đã hủy (QD-012); trả doanh thu tháng, doanh thu tháng trước, số đêm có khách, số căn | Không | Không |
| 2 | Đổi chip lọc hoặc đổi tháng | Số tiền và số đêm đổi theo hay không: chưa vẽ (?) | Đổi tháng: với tháng mới. Đổi chip lọc: | Không | Không |

Theo quy tắc: Đêm có khách (QT2).

Trạng thái màn:
- rỗng: CN1-00 không hiện khối này
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

### Booking sắp tới
Rủi ro: tb
Mục đích: chủ nhà thấy các booking gần nhất và cái nào chưa cọc mà không phải chạm từng ngày.
Màn hình: CN1, CN1-02, CN1-01
Khi nào xảy ra: chủ nhà ở tab Lịch, dưới khối tóm tắt.

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Kéo xuống | Danh sách "ĐẶT PHÒNG SẮP TỚI", mỗi dòng: tên khách hoặc sale, "Phòng <mã> · <nhận> → <trả> (<n> đêm)", số tiền, trạng thái tiền | kiểm quyền CHU, đặt phòng có ngày trả sau hôm nay (giờ Việt Nam, xếp theo ngày nhận | Không | Không |
| 2 | Chạm một dòng | Mở chi tiết booking (CN3-02, thuộc nhóm Booking), như mũi tên trên canvas | chủ nhà thấy đủ tiền, cọc, khách mình nhập (PQ7.CHU, PQ8.CHU, PQ9.CHU), không giá bán | Không | Không |

Theo quy tắc: Trạng thái tiền booking.

Trạng thái màn:
- rỗng: chưa có booking sắp tới: CN1-01 (CN1-00 không hiện danh sách)
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

### Lịch tuần khi có nhiều căn
Rủi ro: thap
Mục đích: chủ nhà nhiều căn xem cả tuần của mọi căn trên một bảng, kèm giá từng đêm.
Màn hình: CN2, CN2-00
Khi nào xảy ra: chủ nhà ở chế độ bảng tuần. Cách vào chế độ này chưa vẽ (?).

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở lịch tuần | Tiêu đề "Lịch tuần", thanh tuần ("Trước", "05 – 11/10/2026", "Sau"), chip lọc (Tất cả, Tòa A, Tòa B, 3 phòng ngủ) | kiểm quyền CHU (PQ4.CHU, PQ5.CHU), trả bảng căn × 7 ngày | Không | Không |
| 2 | Xem ba ô tóm tắt | "Có khách hôm nay 1/6", "Trống tối T7 3 căn", "Chưa cọc 1 đặt phòng" | Không gọi server (dùng kết quả,: ba số tóm tắt của tuần, gồm đêm đang có khách, đặt phòng chưa cọc, đêm trống) | Không | Không |
| 3 | Xem bảng | Mỗi hàng một căn: mã, số phòng ngủ, tòa. Mỗi cột một ngày T2 đến CN. Ô trống hiện giá đêm rút gọn (900k, 1,1tr). Ô có khách là thanh nối nhiều ngày, ghi tên người đặt và nhãn tiền | Không gọi server (dùng kết quả: ô trống có `gia_dem` theo, ô có khách có đặt phòng; mỗi căn có mã căn, số phòng ngủ, tòa) | Không | Không |
| 4 | Xem chú thích | "Đã cọc / đã thanh toán", "Chưa cọc", "800k: trống, giá đêm" | Không gọi server | Không | Không |
| 5 | Chạm chip lọc | Lọc theo tòa hoặc số phòng ngủ | | Không | Không |
| 6 | Bấm "Gửi lịch cho sale" | Mở CN10 (thuộc mục "Chủ nhà chủ động gửi lịch cho sale" (US26)) | Không gọi server (CN10 thuộc mục "Chủ nhà chủ động gửi lịch cho sale" (US26)) | Không | Không |

Theo quy tắc: Đêm có khách (QT2); Trạng thái tiền booking; Tuần bắt đầu thứ hai.

Trạng thái màn:
- rỗng: tuần chưa có booking: CN2-00
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

## Tiêu chí nghiệm thu
Mỗi tiêu chí một test tự động mang đúng mã này trong tên test. Mã không đổi nghĩa; đổi hành vi thì cấp mã mới (docs/QUY_TRINH.md mục 5).

- **US9-NT1** Khi chủ nhà có booking trong tháng, thì khối "DOANH THU THÁNG" hiện số tiền và số đêm có khách.
- **US9-NT2** Khi chủ nhà chưa có booking nào, thì khối này không hiện.
- **US9-NT3** Khi chủ nhà có booking, thì mỗi dòng hiện đủ: tên, phòng, ngày nhận, ngày trả, số đêm, số tiền, trạng thái tiền.
- **US9-NT4** Khi booking chưa cọc, thì dòng đó ghi "Chưa cọc".
- **US9-NT5** Khi chủ nhà mở lịch tuần, thì mỗi căn có một hàng và mỗi ngày trong tuần có một cột, bắt đầu từ T2.
- **US9-NT6** Khi một ô không có khách, thì ô đó hiện giá đêm của căn trong ngày đó.
- **US9-NT7** Khi chủ nhà chạm chip "Tòa A", thì bảng chỉ còn các căn của Tòa A.
- **US9-NT8** Khi có booking chưa cọc, thì ô tóm tắt "Chưa cọc" ghi đúng số booking chưa cọc.

## Luật kiểm dữ liệu và lỗi
Mỗi mục là một việc app nhờ database làm. "Đầu vào" là luật kiểm từng ô, "Lỗi riêng" là khi nào phải từ chối. Cột "Mã" là tên gọi trong tài liệu; hàm database báo lỗi bằng một câu tiếng Việt cho người dùng đọc (docs/luat-chung/Nghiep_vu.md mục Lỗi).

### Trả bảng căn × 7 ngày từ thứ hai, giá đêm của ô trống, đặt phòng của ô có khách, và ba số tóm tắt
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| tu | ngay | có | Phải là thứ hai (nhóm Lịch chủ nhà quy tắc Tuần bắt đầu thứ hai) |
| toa_nha_id | id | không | Lọc theo tòa (chip "Tòa A") |
| so_phong_ngu | số nguyên 0 đến 4 | không | Lọc theo số phòng ngủ (chip "3 phòng ngủ") |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| DU_LIEU_SAI | `tu` sai định dạng hay không phải thứ hai (`o: "tu"`); `so_phong_ngu` ngoài 0 đến 4 |

### Trả doanh thu tháng, doanh thu tháng trước, số đêm có khách, số căn
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| thang | thang | có | `YYYY-MM` |
| can_id | id | không | Căn của người gọi |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| DU_LIEU_SAI | `thang` sai định dạng |
| KHONG_TIM_THAY | `can_id` không phải căn của người gọi |

### Trả các đặt phòng có ngày trả sau hôm nay, xếp theo ngày nhận
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| truoc | chuỗi | không | Con trỏ trang trước (README) |
| gioi_han | số nguyên | không | Mặc định 50, tối đa 100 |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| DU_LIEU_SAI | `gioi_han` ngoài 1 đến 100; con trỏ hỏng |

### Trả chi tiết một đặt phòng, lọc trường theo vai
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| id | id | có | |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| KHONG_TIM_THAY | Không có đặt phòng, hoặc người gọi không thuộc ba vai trên |

## Ai được làm và việc kéo theo
Nguyên liệu chép từ đặc tả máy chủ của bản Zalo, đã đổi tên bảng và mã. Đối chiếu với hàm database ở mục Database khi viết lại story: chỗ nào lệch thì ghi vào "Database đang lệch story". Tên lỗi viết hoa (`KHONG_TIM_THAY`, `DU_LIEU_SAI`) là tên loại lỗi của bản cũ; bản PWA báo bằng câu tiếng Việt.

### Trả bảng căn × 7 ngày từ thứ hai, giá đêm của ô trống, đặt phòng của ô có khách, và ba số tóm tắt
**Ai gọi:** CHU (PQ4.CHU, PQ5.CHU, PQ8.CHU). Căn `co_lich` chưa ẩn của người gọi.

**Việc kéo theo:** Không.

**Chống bấm hai lần:** không cần (đọc).

### Trả doanh thu tháng, doanh thu tháng trước, số đêm có khách, số căn
**Ai gọi:** CHU (PQ16.CHU). Sale không bao giờ có số này của chủ nhà (PQ16.SALE): mọi căn tính là căn người gọi giữ.

**Việc kéo theo:** Không.

**Chống bấm hai lần:** không cần (đọc).

### Trả các đặt phòng có ngày trả sau hôm nay, xếp theo ngày nhận
**Ai gọi:** CHU (PQ7.CHU, PQ8.CHU, PQ9.CHU). Đặt phòng của căn `co_lich` người gọi giữ.

**Việc kéo theo:** Không.

**Chống bấm hai lần:** không cần (đọc).

### Trả chi tiết một đặt phòng, lọc trường theo vai
**Ai gọi:**
- CHU của căn (PQ7.CHU, PQ8.CHU, PQ9.CHU, PQ2.CHU).
- Sale của đặt phòng: `booking.sale_id` là người gọi, nguồn `tu_yeu_cau` hay `chu_tu_ghi` (PQ7.SALE, PQ8.SALE, PQ9.SALE, PQ11.SALE, PQ2.SALE). Kể cả khi đã bị ngừng (QD-007) và khi chủ nhà đã xóa tài khoản (PQ23.SALE, US22-NT25).
- Sale giữ căn tự nhập, với đặt phòng `sale_tu_ghi` (PQ14.SALE).
- Vai khác: sale khác, chủ nhà khác, SALE của căn mà không phải sale của đặt phòng: `KHONG_TIM_THAY` (PQ7.SALE: đặt phòng của người khác chỉ thấy là "đã đặt" ở lịch).

**Việc kéo theo:** Không.

**Chống bấm hai lần:** không cần (đọc).

## Luật chung dùng
Nguyên văn ở `docs/luat-chung/` (QT.md, HV.md, Nghiep_vu.md, Tu_dien.md), tìm theo mã hoặc tên.

QT2.1, QT2.2 (doanh thu và số đêm chia theo đêm, QD-010), QD-012 (đặt phòng đã hủy không tính). Quy tắc trong nhóm Lịch chủ nhà: Trạng thái tiền booking, Giá rút gọn, Tuần bắt đầu thứ hai. Giá một đêm theo(nhóm Căn và giá: Giá hai loại đêm, Giá dịp thay giá tháng). HV1, HV2, HV3, HV5.

## Màn hình
Hình: `python3 docs/thiet-ke/trich-man.py <mã màn>` (docs/thiet-ke/README.md). Chữ và số trên hình lệch story thì story đúng.

CN1, CN1-02 (khối "DOANH THU THÁNG", mục "ĐẶT PHÒNG SẮP TỚI"), CN1-00 (không có khối doanh thu), CN1-01 (chưa có đặt phòng sắp tới), CN2, CN2-00.

**CN1-01 · Lịch · chưa có booking sắp tới**
Vào từ: Tab Lịch chủ nhà
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 0 | Màn gốc | Chép đúng màn CN1 trên canvas, chỉ đổi phần trạng thái. | CN1 |
| 1 | Lịch tháng | Như CN1 | |
| 2 | Mục "Đặt phòng sắp tới" | "Chưa có đặt phòng sắp tới", "Bấm "Thêm đặt phòng" để ghi khách đầu tiên." | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Như CN1 | | |
Trạng thái riêng:
- rỗng: chính là màn này

**CN2-00 · Lịch tuần · chưa có booking**
Vào từ: CN1, chuyển sang lịch tuần
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 0 | Màn gốc | Chép đúng màn CN2 trên canvas, chỉ đổi phần trạng thái. Bỏ hai khối booking trên lưới tuần, ô trả lại giá; "0/6", "0 đặt phòng"; dải "Tuần này chưa có đặt phòng nào. Mọi căn đều trống." | CN2 |
| 1 | Thẻ | "05/10 – 11/10", "Tuần này chưa có đặt phòng nào. Mọi căn đều trống." | |
| 2 | Nút | "Thêm đặt phòng" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Thêm đặt phòng" | Ghi booking | CN4 |
Trạng thái riêng:
- rỗng: chính là màn này

**CN2 · Lịch tuần, nhiều căn**
Vào từ: Xem YC (canvas chưa có mũi tên tới màn này)
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Tiêu đề | "Lịch tuần Đặt phòng" | Canvas |
| 2 | Khối nội dung | "Trước 05 – 11/10/2026 Sau" | Canvas |
| 3 | Khối nội dung | "Tất cả Tòa A Tòa B 3 phòng ngủ" | Canvas |
| 4 | Khối nội dung | "Có khách hôm nay 1/6 Trống tối T7 3 căn Chưa cọc 1 đặt phòng" | Canvas |
| 5 | Khối nội dung | "CĂN T2 05 T3 06 T4 07 T5 08 T6 09 T7 10 CN 11" | Canvas |
| 6 | Khối nội dung | "1509 2PN · Tòa A 900k 900k 900k 900k Sale Hùng Đã cọc" | Canvas |
| 7 | Khối nội dung | "3402 1PN · Tòa A 800k 800k 800k 800k 1,1tr Sale Lan Chưa cọc" | Canvas |
| 8 | Khối nội dung | "A1203 2PN · Tòa A 850k Khách lẻ Đã thanh toán 850k 1,15tr 1,15tr 850k" | Canvas |
| 9 | Khối nội dung | "A0807 1PN · Tòa A 700k 700k 700k 700k 950k 950k 700k" | Canvas |
| 10 | Khối nội dung | "B1602 3PN · Tòa B 1,5tr 1,5tr 1,5tr Sale Minh Đã cọc 1,5tr" | Canvas |
| 11 | Khối nội dung | "B2105 2PN · Tòa B 950k 950k 950k 950k 1,25tr 1,25tr Sale Nga Đã cọc" | Canvas |
| 12 | Khối nội dung | "Đã cọc / đã thanh toán Chưa cọc 800k: trống, giá đêm" | Canvas |
| 13 | Khối nội dung | "Gửi lịch cho sale" | Canvas |
| 14 | Thanh tab | Lịch · Căn · Sale · Thống kê · Cá nhân | Cố định |
| 15 | Cỡ chữ, vùng bấm | Chữ tối thiểu 14 px, vùng bấm tối thiểu 44 px | CLAUDE.md |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Đặt phòng" | Mở màn CN4 | CN4 |
| "Gửi lịch cho sale" | Mở màn CN10 | CN10 |
| "Trước" | Theo YC, canvas chưa nối mũi tên | |
| "Sau" | Theo YC, canvas chưa nối mũi tên | |
| "Tất cả" | Theo YC, canvas chưa nối mũi tên | |
| "Tòa A" | Theo YC, canvas chưa nối mũi tên | |
| "Tòa B" | Theo YC, canvas chưa nối mũi tên | |
| "3 phòng ngủ" | Theo YC, canvas chưa nối mũi tên | |
Trạng thái riêng:
- rỗng: chưa thiết kế
- không có quyền: chưa thiết kế

## Quyền
Ô quyền theo `docs/luat-chung/PQ.md`. Mỗi ô phải có test chứng minh người không có quyền thì không đọc, không ghi được; test ở lớp database (`tests/db/`).

Ô PQ chạm tới (ma trận `docs/luat-chung/PQ.md`): PQ16.CHU, PQ16.SALE, PQ4.CHU, PQ5.CHU, PQ7.CHU, PQ8.CHU, PQ9.CHU, PQ11.CHU. Test vi phạm phải có:
- PQ16.CHU: chủ nhà A gọi với `can_id` của chủ nhà B thì `KHONG_TIM_THAY`.
- PQ16.SALE: sale đã kết nối Chị Hoa gọi thì không có số nào của căn Chị Hoa.
- PQ4.CHU, PQ5.CHU: của chủ nhà A không có hàng, không có giá của căn chủ nhà B; `tu` là thứ ba thì `DU_LIEU_SAI`.
- PQ7.CHU, PQ8.CHU: của chủ nhà A không có đặt phòng của chủ nhà B.
- PQ9.CHU: trả lời và không có tên, số điện thoại khách do sale nhập.
- PQ11.CHU: trả lời của ba API không có khóa `gia_ban`, `tien_chenh`.

## Database
Đã có trong `supabase/migrations/` và đã chạy test. Tham số và cột: `docs/tu-sinh/Bang_va_cot.md`.

Đọc `booking`, `booking_dem`, `can` qua RLS.

- `fn_thong_ke_chu`: test ở t_10_thong_ke.sql

## Ngoài phạm vi
- Lưới tháng, chip lọc căn, chi tiết ngày (mục "Lịch tháng và lọc theo căn" (US2), mục "Chi tiết một ngày" (US2)): US2 (NT1, NT2, NT5 của mục "Lịch tháng và lọc theo căn" (US2), NT1 của mục "Chi tiết một ngày" (US2)) và US3 (NT3, NT4 của mục "Lịch tháng và lọc theo căn" (US2), NT2, NT3 của mục "Chi tiết một ngày" (US2)). US9 chỉ thêm khối doanh thu và danh sách dưới lưới tháng.
- Màn chi tiết đặt phòng CN3-02 mở khi chạm một dòng sắp tới (mục "Booking sắp tới" bước 2): US10. US9 chỉ nối dòng tới màn đó.
- Màn gửi lịch cho sale CN10 mở bởi nút "Gửi lịch cho sale" ở lịch tuần (mục "Lịch tuần khi có nhiều căn" bước 6): US26. US9 chỉ nối nút.
- Ghi đặt phòng mới (mục "Chủ nhà ghi booking mới" (US3)): US3. Doanh thu 6 tháng, công suất, chưa thu (nhóm Thống kê): US18.
- Hủy đặt phòng (QD-012): API chỉ cần bỏ đặt phòng `da_huy` khỏi doanh thu; luồng xin hủy chưa có NT.
- Chưa quyết, không code theo phần này (CLAUDE.md):
  - [MỞ: CH-015] (mục "Lịch tuần khi có nhiều căn" cách vào chế độ lịch tuần chưa vẽ). Task màn CN2 làm lối vào tạm cho bản thử, không phải lối vào chính thức.
  - [MỞ: CH-016] (mục "Lịch tuần khi có nhiều căn" bước 2 ba ô tóm tắt (có khách; trống tối T7; chưa cọc) tính theo tuần đang xem hay theo hôm nay). API đang tính theo tuần đang xem.
  - [MỞ: US9-H1] mục "Tóm tắt tháng" bước 2 đổi chip lọc hoặc đổi tháng thì số tiền và số đêm có đổi theo không, chưa vẽ. Không có kịch bản cho phần này; API đã nhận `thang` và `can_id`.
  - [MỞ: US9-H2] mục "Lịch tuần khi có nhiều căn" ô trống chưa đặt giá (`gia_dem` là `null`) hiện gì trên bảng tuần.
  - [MỞ: US9-H3] mục "Booking sắp tới" danh sách sắp tới có hiện đặt phòng "Đã hủy" không và có giới hạn trong tháng đang xem không. Bản này bỏ `da_huy`, không giới hạn tháng.
  - [MỞ: US9-H4] mục "Tóm tắt tháng" doanh thu có tính đặt phòng của căn đã ẩn không.
  - [MỞ: CH-017] (mục "Lịch tuần khi có nhiều căn" chạm một thanh đặt phòng ở lịch tuần mở gì).

## Việc cần làm
- [ ] Đọc story này và các luật chung nó trỏ tới. Chỗ nào gắn thẻ MỞ thì không code, hỏi Tùng (docs/Cau_hoi_mo.md).
- [ ] Viết test cho từng tiêu chí chưa có test, test đỏ trước (lớp test: docs/QUY_TRINH.md mục 6).
- [ ] Database: soát các hàm ở mục Database với tiêu chí; thiếu thì thêm migration mới và một dòng trong `scripts/thu-lam-hong.sh`.
- [ ] Giao diện: các màn ở mục Màn hình, nối với Supabase (docs/Ghi_chu_code.md).
- [ ] E2E cho luồng chính của story.
- [ ] Kiểm tay theo `tests/kich-ban/US9.md` trên điện thoại thật.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md` trong cùng PR.
