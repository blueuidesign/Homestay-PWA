# US4 · Chủ nhà đặt giá theo tháng, ngày thường và cuối tuần

- Loại: tính năng
- Trạng thái: chưa làm
- Bản: 1
- Rủi ro: cao
- Làm sau khi xong: US1
- Kiểm tay: `tests/kich-ban/US4.md` (16 kịch bản)

## Mục tiêu
Là chủ nhà, tôi muốn đặt giá đêm cho một căn theo tháng, tách ngày thường và cuối tuần, để sale thấy giá mà không hỏi.

## Hành vi
Bảng bước ghi: người dùng làm gì, app hiện gì (chữ trong ngoặc kép là chữ trên màn), máy chủ phải làm gì, dữ liệu nào đổi. Cột "Máy chủ" mô tả việc phải xảy ra; bản PWA làm bằng RLS, view và hàm `fn_*` của Supabase.

### Đặt giá theo tháng
Rủi ro: cao
Mục đích: chủ nhà đặt giá đêm cho một căn theo từng tháng, tách giá ngày thường và giá cuối tuần.
Màn hình: CN6, CN6-00, CN6-04, CN6-09
Khi nào xảy ra: chủ nhà mở tab Giá của một căn, hoặc bấm "Đặt giá cho căn này" ở thẻ căn.

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở tab Giá | Tiêu đề "Phòng 3402", tab "Thông tin" / "Giá". Mục "GIÁ THEO THÁNG" với "Năm 2026", 12 ô tháng; mỗi ô ghi khoảng giá (vd "800k–1,3tr") hoặc "Chưa đặt" | 12 tháng với giá ngày thường, cuối tuần hoặc "Chưa đặt", các dải giá dịp | Không | Không |
| 2 | Chạm một hoặc nhiều tháng | Dòng "Đang chọn: Tháng 11 – 12 (2 tháng)" | Không gọi server | Không | Không |
| 3 | Nhập giá | Hai ô: "Ngày thường (CN–T5)" và "Cuối tuần (T6, T7)" | Không gọi server | Không | Không |
| 4 | Bấm nút "Áp dụng cho Tháng 11 – 12" | Lưu giá cho các tháng đã chọn, toast "Đã áp dụng giá cho Tháng 11 – 12" (CN6-04) | ghi đè các tháng đã chọn, không chọn tháng nào thì `DU_LIEU_SAI`, cập nhật `lich_cap_nhat_luc`, không đổi tiền của đặt phòng đã có | Không | Giá ngày thường và cuối tuần của các tháng đã chọn |
| 5 | Bấm "Năm 2026" | CN6-09: chọn "Đặt giá cho năm" gồm "Năm 2026 · Năm nay" và "Năm 2027 · Năm sau" | Chọn năm thì gọi lại | Không | Không |
| 6 | Xem "Lịch giá tháng 10" | Lưới tháng, mỗi ngày ghi giá đêm (800k, 1,1tr, 1,3tr). Chú thích: Dịp đặc biệt, Ngày lễ, Có khách. Chuyển tháng bằng T09 / T11 | từng đêm của tháng đang xem: giá theo `gia_dem`, loại đêm (thường, cuối tuần, dịp), cờ có khách | Không | Không |
| 7 | Chạm một ngày trên lịch giá | Gợi ý "Chạm một ngày để đặt giá ngày lễ, dịp đặc biệt" mở mục "Giá ngày lễ và dịp đặc biệt" (US8) | Không gọi server | Không | Không |
| 8 | Bấm "Sao chép giá sang căn khác" | Mở CN6-07, xem mục "Sao chép giá sang căn khác" (US7) | Không gọi server | Không | Không |

Theo quy tắc: Giá hai loại đêm; Giá theo tháng và năm; Giá dịp thay giá tháng; Sale chỉ thấy giá sau khi đặt; Booking giữ giá riêng.

Trạng thái màn:
- rỗng: CN6-00 (căn chưa có giá): "Căn này chưa có giá. Chọn tháng, nhập giá ngày thường và cuối tuần rồi bấm Áp dụng. Sale chỉ thấy giá sau khi bạn đặt." Cả 12 tháng ghi "Chưa đặt"; mục giá ngày lễ ghi "Chưa có giá ngày lễ. Bấm "Đặt giá ngày lễ, dịp đặc biệt" để thêm, VD: Lễ 30/4 – 1/5."; mục dịp đặc biệt ghi "Chưa có dịp đặc biệt."
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

## Phần của story khác mà story này làm một lát
Bảng bước của các mục dưới đây nằm ở story chủ của mục đó. Story này chỉ làm các tiêu chí được liệt kê ở mục Tiêu chí nghiệm thu.

- mục "Danh sách căn" (US1) · Danh sách căn: bảng bước ở US1. Story này làm NT3, NT4.

## Tiêu chí nghiệm thu
Mỗi tiêu chí một test tự động mang đúng mã này trong tên test. Mã không đổi nghĩa; đổi hành vi thì cấp mã mới (docs/QUY_TRINH.md mục 5).

- **US4-NT1** Khi căn chưa đặt giá, thì thẻ ghi "Chưa đặt giá" và có nút "Đặt giá cho căn này".
- **US4-NT2** Khi căn đã đặt giá, thì thẻ ghi khoảng giá thấp nhất đến cao nhất của tuần này. Theo quy tắc: Giá tuần này.
- **US4-NT3** Khi chủ nhà chọn Tháng 11 và Tháng 12, nhập 800.000đ ngày thường và 1.100.000đ cuối tuần rồi bấm Áp dụng, thì cả hai tháng có giá đó cho các đêm tương ứng.
- **US4-NT4** Khi chưa chọn tháng nào, thì dòng ghi "Chưa chọn tháng nào. Chọn một tháng bên trên sau đó nhập giá." và không áp dụng được.
- **US4-NT5** Khi căn chưa đặt giá nào, thì thấy CN6-00 và 12 tháng đều ghi "Chưa đặt".
- **US4-NT6** Khi một đêm thuộc thứ 6 hoặc thứ 7, thì lịch giá hiện giá cuối tuần; các đêm còn lại hiện giá ngày thường. Theo quy tắc: Giá hai loại đêm.
- **US4-NT7** Khi chủ nhà đổi sang "Năm 2027", thì 12 ô tháng hiện giá của năm 2027.

## Luật chung dùng
Nguyên văn ở `docs/luat-chung/` (QT.md, HV.md, Nghiep_vu.md, Tu_dien.md), tìm theo mã hoặc tên.

Quy tắc trong nhóm Căn và giá: Giá hai loại đêm, Giá theo tháng và năm, Giá tuần này, Sale chỉ thấy giá sau khi đặt. Cuối tuần là T6 và T7 mặc định; đổi ngày tính cuối tuần (mục "Ngày tính giá cuối tuần" (US11)) ở US11. HV1 đến HV3, HV8.

## Màn hình
Hình: `python3 docs/thiet-ke/trich-man.py <mã màn>` (docs/thiet-ke/README.md). Chữ và số trên hình lệch story thì story đúng.

CN6, CN6-00, CN6-04, CN6-09, thẻ căn ở CN5 (khoảng giá, "Chưa đặt giá").

**CN6-00 · Chưa đặt giá**
Vào từ: CN5; CN5-A4; CN5-A4b
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Tiêu đề | "Phòng 2105" | Canvas |
| 2 | Khối nội dung | "Thông tin Giá" | Canvas |
| 3 | Khối nội dung | "💡 Căn này chưa có giá. Chọn tháng, nhập giá ngày thường và cuối tuần rồi bấm Áp dụng. Sale chỉ thấy giá sau khi bạn đặt." | Canvas |
| 4 | Khối nội dung | "GIÁ THEO THÁNG Năm 2026" | Canvas |
| 5 | Khối nội dung | "Tháng 1 Chưa đặt" | Canvas |
| 6 | Khối nội dung | "Tháng 2 Chưa đặt" | Canvas |
| 7 | Khối nội dung | "Tháng 3 Chưa đặt" | Canvas |
| 8 | Khối nội dung | "Tháng 4 Chưa đặt" | Canvas |
| 9 | Khối nội dung | "Tháng 5 Chưa đặt" | Canvas |
| 10 | Khối nội dung | "Tháng 6 Chưa đặt" | Canvas |
| 11 | Khối nội dung | "Tháng 7 Chưa đặt" | Canvas |
| 12 | Khối nội dung | "Tháng 8 Chưa đặt" | Canvas |
| 13 | Khối nội dung | "Tháng 9 Chưa đặt" | Canvas |
| 14 | Khối nội dung | "Tháng 10 Chưa đặt" | Canvas |
| 15 | Khối nội dung | "Tháng 11 Chưa đặt" | Canvas |
| 16 | Khối nội dung | "Tháng 12 Chưa đặt" | Canvas |
| 17 | Khối nội dung | "Ngày thường (CN–T5) Cuối tuần (T6, T7)" | Canvas |
| 18 | Khối nội dung | "Áp dụng cho tháng đã chọn" | Canvas |
| 19 | Khối nội dung | "Đặt giá ngày lễ, dịp đặc biệt" | Canvas |
| 20 | Khối nội dung | "GIÁ NGÀY LỄ Chưa có giá ngày lễ. Bấm "Đặt giá ngày lễ, dịp đặc biệt" để thêm, VD: Lễ 30/4 – 1/5." | Canvas |
| 21 | Khối nội dung | "DỊP ĐẶC BIỆT Chưa có dịp đặc biệt." | Canvas |
| 22 | Cỡ chữ, vùng bấm | Chữ tối thiểu 14 px, vùng bấm tối thiểu 44 px | CLAUDE.md |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Nút quay lại" | Quay lại màn trước | |
| "Năm 2026" | Mở màn CN6-09 | CN6-09 |
| "Áp dụng cho tháng đã chọn" | Theo YC, canvas chưa nối mũi tên | |
| "Đặt giá ngày lễ, dịp đặc biệt" | Theo YC, canvas chưa nối mũi tên | |
Trạng thái riêng:
- rỗng: chưa thiết kế
- không có quyền: chưa thiết kế

**CN6-04 · Áp dụng giá xong**
Vào từ: CN6, bấm "Áp dụng cho Tháng 11 – 12"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Đầu màn | "Phòng 3402", tab "Thông tin · Giá" | Căn |
| 2 | Giá theo tháng | Tháng 10 "800k–1,3tr", Tháng 11 "800k–1,1tr", Tháng 12 "800k–1,1tr" | DLM.3 |
| 3 | Ô nhập giá | "Ngày thường (CN–T5)", "Cuối tuần (T6, T7)", "Áp dụng cho Tháng 11 – 12" | Tháng đang chọn |
| 4 | Giá ngày lễ, dịp đặc biệt | Lễ 30/4, Quốc khánh 2/9, Carnaval 24/10 – 25/10 1.300.000đ | Căn |
| 5 | Lịch giá tháng 10 | Giá từng đêm | Giá căn |
| 6 | Toast | "✓ Đã áp dụng giá cho Tháng 11 – 12" | Kết quả |
| 7 | Vị trí toast | Toast chung: nổi trên nội dung, cách mép trái, phải 12 px, đỉnh cách đỉnh màn 108 px (ngay dưới thanh tiêu đề và cụm ··· ✕ của Zalo), nền tối, chữ trắng 14 px đậm, bo góc vừa. Mọi màn có toast dùng đúng chỗ này | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Một tháng | Chọn tháng | CN6-04 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- đang tải: chưa thiết kế (HV1)
- lỗi mạng: chưa thiết kế (HV2)
- quay lại từ nền: chưa thiết kế (HV3)

**CN6-09 · Chọn năm**
Vào từ: CN6; CN6-00; CN6-04; CN6-06; CN6-08
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Tiêu đề | "Phòng 3402" | Canvas |
| 2 | Khối nội dung | "Thông tin Giá" | Canvas |
| 3 | Khối nội dung | "GIÁ THEO THÁNG Năm 2026" | Canvas |
| 4 | Khối nội dung | "Tháng 1 Chưa đặt" | Canvas |
| 5 | Khối nội dung | "Tháng 2 Chưa đặt" | Canvas |
| 6 | Khối nội dung | "Tháng 3 Chưa đặt" | Canvas |
| 7 | Khối nội dung | "Tháng 4 800k–2,5tr" | Canvas |
| 8 | Khối nội dung | "Tháng 5 1tr–2,5tr" | Canvas |
| 9 | Khối nội dung | "Tháng 6 1tr–1,4tr" | Canvas |
| 10 | Khối nội dung | "Tháng 7 1tr–1,4tr" | Canvas |
| 11 | Khối nội dung | "Tháng 8 1tr–1,4tr" | Canvas |
| 12 | Khối nội dung | "Tháng 9 800k–2,5tr" | Canvas |
| 13 | Khối nội dung | "Tháng 10 800k–1,3tr" | Canvas |
| 14 | Khối nội dung | "Tháng 11 Chưa đặt" | Canvas |
| 15 | Khối nội dung | "Tháng 12 Chưa đặt" | Canvas |
| 16 | Khối nội dung | "Đang chọn: Tháng 11 – 12 (2 tháng)" | Canvas |
| 17 | Khối nội dung | "Ngày thường (CN–T5) Cuối tuần (T6, T7)" | Canvas |
| 18 | Khối nội dung | "Áp dụng cho Tháng 11 – 12" | Canvas |
| 19 | Khối nội dung | "Đặt giá ngày lễ, dịp đặc biệt" | Canvas |
| 20 | Khối nội dung | "GIÁ NGÀY LỄ 30/04 – 01/05 Lễ 30/4 – 1/5 2.500.000đ 01/09 – 02/09 Quốc khánh 2/9 2.500.000đ" | Canvas |
| 21 | Khối nội dung | "DỊP ĐẶC BIỆT 24/10 – 25/10 Lễ hội Carnaval 1.300.000đ" | Canvas |
| 22 | Khối nội dung | "T09 Lịch giá tháng 10 T11" | Canvas |
| 23 | Khối nội dung | "T2" | Canvas |
| 24 | Khối nội dung | "T3" | Canvas |
| 25 | Khối nội dung | "T4" | Canvas |
| 26 | Khối nội dung | "T5" | Canvas |
| 27 | Khối nội dung | "T6" | Canvas |
| 28 | Khối nội dung | "T7" | Canvas |
| 29 | Khối nội dung | "CN" | Canvas |
| 30 | Khối nội dung | "1 800k" | Canvas |
| 31 | Khối nội dung | "2 1,1tr" | Canvas |
| 32 | Khối nội dung | "3 1,1tr" | Canvas |
| 33 | Khối nội dung | "4 800k" | Canvas |
| 34 | Khối nội dung | "5 800k" | Canvas |
| 35 | Khối nội dung | "6 800k" | Canvas |
| 36 | Khối nội dung | "7 800k" | Canvas |
| 37 | Khối nội dung | "8 800k" | Canvas |
| 38 | Khối nội dung | "9 1,1tr" | Canvas |
| 39 | Khối nội dung | "10 1,1tr" | Canvas |
| 40 | Khối nội dung | "11 800k" | Canvas |
| 41 | Khối nội dung | "12 800k" | Canvas |
| 42 | Khối nội dung | "13 800k" | Canvas |
| 43 | Khối nội dung | "14 800k" | Canvas |
| 44 | Khối nội dung | "15 800k" | Canvas |
| 45 | Khối nội dung | "16 1,1tr" | Canvas |
| 46 | Khối nội dung | "17 1,1tr" | Canvas |
| 47 | Khối nội dung | "18 800k" | Canvas |
| 48 | Khối nội dung | "19 800k" | Canvas |
| 49 | Khối nội dung | "20 800k" | Canvas |
| 50 | Khối nội dung | "21 800k" | Canvas |
| 51 | Khối nội dung | "22 800k" | Canvas |
| 52 | Khối nội dung | "23 1,1tr" | Canvas |
| 53 | Khối nội dung | "24 1,3tr" | Canvas |
| 54 | Khối nội dung | "25 1,3tr" | Canvas |
| 55 | Khối nội dung | "26 800k" | Canvas |
| 56 | Khối nội dung | "27 800k" | Canvas |
| 57 | Khối nội dung | "28 800k" | Canvas |
| 58 | Khối nội dung | "29 800k" | Canvas |
| 59 | Khối nội dung | "30 1,1tr" | Canvas |
| 60 | Khối nội dung | "31 1,1tr" | Canvas |
| 61 | Khối nội dung | "Dịp đặc biệt Ngày lễ Có khách" | Canvas |
| 62 | Khối nội dung | "💡 Chạm một ngày để đặt giá ngày lễ, dịp đặc biệt." | Canvas |
| 63 | Khối nội dung | "Sao chép giá sang căn khác" | Canvas |
| 64 | Khối nội dung | "Đặt giá cho năm Năm 2026 Năm nay ✓ Năm 2027 Năm sau" | Canvas |
| 65 | Cỡ chữ, vùng bấm | Chữ tối thiểu 14 px, vùng bấm tối thiểu 44 px | CLAUDE.md |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Nút quay lại" | Quay lại màn trước | |
| "Năm 2026" | Mở màn CN6-09 | CN6-09 |
| "30/04 – 01/05 Lễ 30/4 – 1/5 2.500.000đ" | Mở màn CN6-02 | CN6-02 |
| "01/09 – 02/09 Quốc khánh 2/9 2.500.000đ" | Mở màn CN6-02 | CN6-02 |
| "24/10 – 25/10 Lễ hội Carnaval 1.300.000đ" | Mở màn CN6-02 | CN6-02 |
| "Sao chép giá sang căn khác" | Mở màn CN6-07 | CN6-07 |
| "Chạm vùng" | Mở màn CN6 | CN6 |
| "Áp dụng cho Tháng 11 – 12" | Theo YC, canvas chưa nối mũi tên | |
| "Đặt giá ngày lễ, dịp đặc biệt" | Theo YC, canvas chưa nối mũi tên | |
Trạng thái riêng:
- rỗng: chưa thiết kế
- không có quyền: chưa thiết kế

**CN6 · Tab Giá**
Vào từ: CN5, chạm căn, tab "Giá"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Đầu màn | "Phòng 3402", tab "Thông tin · Giá" | Căn |
| 2 | Giá theo tháng | 12 ô tháng năm 2026: tháng 1–3 "Chưa đặt", tháng 10 "800k–1,3tr", tháng 11, 12 "Chưa đặt" (đang chọn) | DLM.3 |
| 3 | Ô nhập giá | "Đang chọn: Tháng 11 – 12 (2 tháng)", "Ngày thường (CN–T5)", "Cuối tuần (T6, T7)", nút "Áp dụng cho Tháng 11 – 12" | Tháng đang chọn |
| 4 | Giá ngày lễ | 30/04 – 01/05 Lễ 30/4 – 1/5 2.500.000đ; 01/09 – 02/09 Quốc khánh 2/9 2.500.000đ; "+ Đặt giá ngày lễ, dịp đặc biệt" | Căn |
| 5 | Dịp đặc biệt | 24/10 – 25/10 Lễ hội Carnaval 1.300.000đ | DLM.3 |
| 6 | Lịch giá tháng 10 | Giá từng đêm: 800k ngày thường, 1,1tr T6, T7, 1,3tr 24, 25/10; ô "Có khách" 5, 6, 14, 17, 18, 21/10 | DLM.3, DLM.4 |
| 7 | Nút | "Sao chép giá sang căn khác" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Một ô tháng | Chọn tháng, chọn tiếp ô khác để chọn khoảng | CN6 |
| "Áp dụng cho Tháng 11 – 12" | Lưu giá, toast | CN6-04 |
| Một ngày trên lịch giá | Chọn ngày đặt giá ngày lễ | CN6-02 |
| "Sao chép giá sang căn khác" | Chọn căn đích | CN6-06 |
Trạng thái riêng:
- không có quyền: theo HV5

## Quyền
Ô quyền theo `docs/luat-chung/PQ.md`. Mỗi ô phải có test chứng minh người không có quyền thì không đọc, không ghi được; test ở lớp database (`tests/db/`).

Ô PQ chạm tới (ma trận `docs/luat-chung/PQ.md`): PQ5.CHU. Test vi phạm phải có: chủ nhà A đặt giá cho căn của chủ nhà B.

## Database
Đã có trong `supabase/migrations/` và đã chạy test. Tham số và cột: `docs/tu-sinh/Bang_va_cot.md`.

- `fn_dat_gia_thang`: test ở t_01_phan_quyen.sql

## Ngoài phạm vi
- Giá nhiều căn, sao chép giá (mục "Đặt giá nhiều căn" (US7), mục "Sao chép giá sang căn khác" (US7)): US7.
- Giá ngày lễ, dịp đặc biệt (mục "Giá ngày lễ và dịp đặc biệt" (US8)): US8.
- Ngày tính giá cuối tuần (mục "Ngày tính giá cuối tuần" (US11)): US11.
- Sale thấy giá (US6-NT12): US6.

## Việc cần làm
- [ ] Đọc story này và các luật chung nó trỏ tới. Chỗ nào gắn thẻ MỞ thì không code, hỏi Tùng (docs/Cau_hoi_mo.md).
- [ ] Viết test cho từng tiêu chí chưa có test, test đỏ trước (lớp test: docs/QUY_TRINH.md mục 6).
- [ ] Database: soát các hàm ở mục Database với tiêu chí; thiếu thì thêm migration mới và một dòng trong `scripts/thu-lam-hong.sh`.
- [ ] Giao diện: các màn ở mục Màn hình, nối với Supabase (docs/Ghi_chu_code.md).
- [ ] E2E cho luồng chính của story.
- [ ] Kiểm tay theo `tests/kich-ban/US4.md` trên điện thoại thật.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md` trong cùng PR.
