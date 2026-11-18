# US7 · Chủ nhà đặt giá nhiều căn và sao chép giá

- Loại: tính năng
- Trạng thái: chưa làm
- Bản: 1
- Rủi ro: cao
- Làm sau khi xong: US4
- Kiểm tay: `tests/kich-ban/US7.md` (20 kịch bản)

## Mục tiêu
Là chủ nhà nhiều căn, tôi muốn đặt cùng một giá cho nhiều căn và chép giá từ căn này sang căn khác, để không phải đặt giá từng căn một.

## Hành vi
Bảng bước ghi: người dùng làm gì, app hiện gì (chữ trong ngoặc kép là chữ trên màn), máy chủ phải làm gì, dữ liệu nào đổi. Cột "Máy chủ" mô tả việc phải xảy ra; bản PWA làm bằng RLS, view và hàm `fn_*` của Supabase.

### YC3.6 · Đặt giá nhiều căn
Rủi ro: cao
Mục đích: chủ nhà đặt cùng một giá cho nhiều căn một lần, thay vì đặt từng căn.
Màn hình: CN6-05, CN6-06, CN6-05-00
Khi nào xảy ra: chủ nhà bấm "Đặt giá nhiều căn" ở CN5.

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở màn chọn căn | CN6-05: "CHỌN CĂN · ĐÃ CHỌN 2/4", nút "Chọn tất cả", danh sách căn | | Không | Không |
| 2 | Chọn các căn | Nút dưới đáy "Đặt giá cho 2 căn" | Không gọi server | Không | Không |
| 3 | Bấm "Đặt giá cho 2 căn" | CN6-06: tiêu đề "Đặt giá · 2 căn", khối "CĂN ÁP DỤNG" kèm nút "Đổi căn", rồi đặt giá như YC3.4 (12 tháng, ngày thường, cuối tuần, Áp dụng) | Bấm Áp dụng:: như `gia-thang` cho từng căn, trong một giao dịch | Không | Giá của mọi căn đã chọn |
| 4 | Bấm "Đặt giá ngày lễ, dịp đặc biệt" | Chưa vẽ cách đặt cho nhiều căn (?) | với `gia_dip`: như `gia-dip` cho từng căn, trong một giao dịch; một căn chồng dải dịp thì không ghi căn nào, trả `DIP_CHONG_NGAY` kèm mã căn | Không | Giá dịp (`gia_dip`) của mọi căn đã chọn |

Theo quy tắc: Giá hai loại đêm; Giá theo tháng và năm.

Trạng thái màn:
- rỗng: chưa chọn căn nào: CN6-05-00
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

### YC3.7 · Sao chép giá sang căn khác
Rủi ro: cao
Mục đích: chủ nhà có nhiều căn giống nhau dùng lại giá đã đặt của một căn.
Màn hình: CN6-07, CN6-08
Khi nào xảy ra: chủ nhà bấm "Sao chép giá sang căn khác" ở cuối tab Giá.

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở màn | CN6-07: "TỪ CĂN" Phòng 3402, tóm tắt "Giá 7 tháng · 2 ngày lễ · 2 dịp đặc biệt" | | Không | Không |
| 2 | Chọn "SAO CHÉP GÌ" | Ba lựa chọn: Giá theo tháng, Giá ngày lễ, Dịp đặc biệt | Không gọi server | Không | Không |
| 3 | Chọn "SANG CĂN" | Danh sách căn khác, nút "Chọn tất cả", đếm "ĐÃ CHỌN 0" | | Không | Không |
| 4 | Chưa chọn căn | Cảnh báo "Giá đang có của căn được chọn sẽ được thay bằng giá của Phòng 3402."; nút ghi "Chọn căn để sao chép" và chưa dùng được | Không gọi server | Không | Không |
| 5 | Chọn căn và bấm sao chép | Về tab Giá, toast "Đã sao chép giá sang 2 căn" (CN6-08) | thay giá có sẵn của căn đích theo từng phần đã chọn, ngày lễ và dịp đặc biệt tách theo `la_ngay_le` | Không | Giá đã chọn của căn đích bị thay bằng giá căn nguồn |

Theo quy tắc: Sao chép giá thay giá có sẵn.

Trạng thái màn:
- rỗng: chưa chọn căn đích, nút chưa dùng được
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

## Phần của story khác mà story này làm một lát
Bảng bước của các mục dưới đây nằm ở story chủ của mục đó. Story này chỉ làm các tiêu chí được liệt kê ở mục Tiêu chí nghiệm thu.

- YC3.4 · Đặt giá theo tháng: bảng bước ở US4. Story này làm NT6.

## Tiêu chí nghiệm thu
Mỗi tiêu chí một test tự động mang đúng mã này trong tên test. Mã không đổi nghĩa; đổi hành vi thì cấp mã mới (docs/QUY_TRINH.md mục 5).

- **YC3.4-NT6** Khi 1509 đã có B1 10/10 → 12/10 tiền phòng 2.200.000đ và chủ nhà đổi giá tháng 10 của 1509, thì B1 vẫn 2.200.000đ, doanh thu tháng 10 (YC7.1) không đổi vì B1. Theo quy tắc: Booking giữ giá riêng.
- **YC3.6-NT1** Khi chủ nhà chọn 2 trong 4 căn, thì nút dưới đáy ghi "Đặt giá cho 2 căn" và dòng đếm ghi "2/4".
- **YC3.6-NT2** Khi chủ nhà bấm "Chọn tất cả", thì cả 4 căn được chọn.
- **YC3.6-NT3** Khi chủ nhà áp dụng giá ở CN6-06, thì mọi căn đã chọn đều nhận giá đó cho các tháng đã chọn.
- **YC3.7-NT1** Khi chưa chọn căn đích, thì nút sao chép không dùng được và ghi "Chọn căn để sao chép".
- **YC3.7-NT2** Khi chủ nhà chỉ chọn "Giá theo tháng", thì giá ngày lễ và dịp đặc biệt của căn đích không đổi.
- **YC3.7-NT3** Khi sao chép xong sang 2 căn, thì thấy toast "Đã sao chép giá sang 2 căn".

## Luật chung dùng
Nguyên văn ở `docs/luat-chung/` (QT.md, HV.md, Nghiep_vu.md, Tu_dien.md), tìm theo mã hoặc tên.

Quy tắc trong YC3: Giá hai loại đêm, Giá theo tháng và năm, Giá dịp thay giá tháng, Sao chép giá thay giá có sẵn, Booking giữ giá riêng. QT4.1 (bảng giá chỉ điền sẵn tiền phòng, không đổi đặt phòng đã có). HV1 đến HV3, HV5, HV8.

## Màn hình
Hình: `python3 docs/thiet-ke/trich-man.py <mã màn>` (docs/thiet-ke/README.md). Chữ và số trên hình lệch story thì story đúng.

CN5 (nút "Đặt giá nhiều căn"), CN6-05, CN6-05-00, CN6-06, CN6 (tab Giá: lịch giá, nút "Sao chép giá sang căn khác"), CN6-07, CN6-08, CN6-09 (chọn năm).

**CN6-05-00 · Đặt giá nhiều căn · chưa chọn căn**
Vào từ: CN6-05
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 0 | Màn gốc | Chép đúng màn CN6-05 trên canvas, chỉ đổi phần trạng thái. Bỏ dấu chọn mọi căn, "Đã chọn 0/4", nút đáy mờ "Chọn ít nhất một căn" | CN6-05 |
| 1 | Danh sách căn | "☐ 1509", "☐ 3402" | |
| 2 | Nút | "Áp dụng" mờ, dòng "Chọn ít nhất một căn" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Một căn | Chọn căn, nút sáng | CN6-05 |
Trạng thái riêng:
- rỗng: chính là màn này

**CN6-05 · "Đặt giá nhiều căn: chọn căn"**
Vào từ: CN5; CN6-06
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Tiêu đề | "Đặt giá nhiều căn CHỌN CĂN · ĐÃ CHỌN 2/4 Chọn tất cả Phòng 1509 Phòng 3402 Greenbay Phòng 2208 Đặt giá cho 2 căn" | Canvas |
| 2 | Cỡ chữ, vùng bấm | Chữ tối thiểu 14 px, vùng bấm tối thiểu 44 px | CLAUDE.md |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Nút quay lại" | Quay lại màn trước | |
| "Đặt giá cho 2 căn" | Mở màn CN6-06 | CN6-06 |
| "Chọn tất cả" | Theo YC, canvas chưa nối mũi tên | |
| "Phòng 1509" | Theo YC, canvas chưa nối mũi tên | |
| "Phòng 3402" | Theo YC, canvas chưa nối mũi tên | |
| "Greenbay" | Theo YC, canvas chưa nối mũi tên | |
| "Phòng 2208" | Theo YC, canvas chưa nối mũi tên | |
Trạng thái riêng:
- rỗng: chưa thiết kế
- không có quyền: chưa thiết kế

**CN6-06 · Đặt giá nhiều căn**
Vào từ: CN6-05; CN6-05-00
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Tiêu đề | "Đặt giá · 2 căn" | Canvas |
| 2 | Khối nội dung | "CĂN ÁP DỤNG Đổi căn Phòng 1509 Phòng 3402" | Canvas |
| 3 | Khối nội dung | "GIÁ THEO THÁNG Năm 2026" | Canvas |
| 4 | Khối nội dung | "Tháng 1 Chưa đặt" | Canvas |
| 5 | Khối nội dung | "Tháng 2 Chưa đặt" | Canvas |
| 6 | Khối nội dung | "Tháng 3 Chưa đặt" | Canvas |
| 7 | Khối nội dung | "Tháng 4 Chưa đặt" | Canvas |
| 8 | Khối nội dung | "Tháng 5 Chưa đặt" | Canvas |
| 9 | Khối nội dung | "Tháng 6 Chưa đặt" | Canvas |
| 10 | Khối nội dung | "Tháng 7 Chưa đặt" | Canvas |
| 11 | Khối nội dung | "Tháng 8 Chưa đặt" | Canvas |
| 12 | Khối nội dung | "Tháng 9 Chưa đặt" | Canvas |
| 13 | Khối nội dung | "Tháng 10 Chưa đặt" | Canvas |
| 14 | Khối nội dung | "Tháng 11 Chưa đặt" | Canvas |
| 15 | Khối nội dung | "Tháng 12 Chưa đặt" | Canvas |
| 16 | Khối nội dung | "Ngày thường (CN–T5) Cuối tuần (T6, T7)" | Canvas |
| 17 | Khối nội dung | "Áp dụng cho tháng đã chọn" | Canvas |
| 18 | Khối nội dung | "Đặt giá ngày lễ, dịp đặc biệt" | Canvas |
| 19 | Cỡ chữ, vùng bấm | Chữ tối thiểu 14 px, vùng bấm tối thiểu 44 px | CLAUDE.md |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Nút quay lại" | Quay lại màn trước | |
| "Đổi căn" | Mở màn CN6-05 | CN6-05 |
| "Năm 2026" | Mở màn CN6-09 | CN6-09 |
| "Áp dụng cho tháng đã chọn" | Theo YC, canvas chưa nối mũi tên | |
| "Đặt giá ngày lễ, dịp đặc biệt" | Theo YC, canvas chưa nối mũi tên | |
Trạng thái riêng:
- rỗng: chưa thiết kế
- không có quyền: chưa thiết kế

**CN6-07 · Sao chép giá sang căn khác**
Vào từ: CN6; CN6-04; CN6-08; CN6-09
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Tiêu đề | "Sao chép giá" | Canvas |
| 2 | Khối nội dung | "TỪ CĂN Phòng 3402 Giá 7 tháng · 2 ngày lễ · 2 dịp đặc biệt" | Canvas |
| 3 | Khối nội dung | "SAO CHÉP GÌ Giá theo tháng Giá ngày lễ Dịp đặc biệt" | Canvas |
| 4 | Khối nội dung | "SANG CĂN · ĐÃ CHỌN 0 Chọn tất cả Phòng 1509 Greenbay Phòng 2208 Giá đang có của căn được chọn sẽ được thay bằng giá của Phòng 3402." | Canvas |
| 5 | Khối nội dung | "Chọn căn để sao chép" | Canvas |
| 6 | Cỡ chữ, vùng bấm | Chữ tối thiểu 14 px, vùng bấm tối thiểu 44 px | CLAUDE.md |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Nút quay lại" | Quay lại màn trước | |
| "Giá theo tháng" | Theo YC, canvas chưa nối mũi tên | |
| "Giá ngày lễ" | Theo YC, canvas chưa nối mũi tên | |
| "Dịp đặc biệt" | Theo YC, canvas chưa nối mũi tên | |
| "Chọn tất cả" | Theo YC, canvas chưa nối mũi tên | |
| "Phòng 1509" | Theo YC, canvas chưa nối mũi tên | |
| "Greenbay" | Theo YC, canvas chưa nối mũi tên | |
| "Phòng 2208" | Theo YC, canvas chưa nối mũi tên | |
| "Chọn căn để sao chép" | Theo YC, canvas chưa nối mũi tên | |
Trạng thái riêng:
- rỗng: chưa thiết kế
- không có quyền: chưa thiết kế

**CN6-08 · Sao chép giá xong**
Vào từ: CN6-06, bấm sao chép
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Đầu màn | "Phòng 3402", tab "Thông tin · Giá" | Căn |
| 2 | Giá theo tháng | Tháng 10 "800k–1,3tr", Tháng 11 "800k–1,1tr", Tháng 12 "800k–1,1tr" | DLM.3 |
| 3 | Ô nhập giá | "Ngày thường (CN–T5)", "Cuối tuần (T6, T7)", "Áp dụng cho Tháng 11 – 12" | Tháng đang chọn |
| 4 | Giá ngày lễ, dịp đặc biệt | Lễ 30/4, Quốc khánh 2/9, Carnaval 24/10 – 25/10 1.300.000đ | Căn |
| 5 | Lịch giá tháng 10 | Giá từng đêm | Giá căn |
| 6 | Toast | "✓ Đã sao chép giá sang 2 căn" | Kết quả |
| 7 | Vị trí toast | Toast chung: nổi trên nội dung, cách mép trái, phải 12 px, đỉnh cách đỉnh màn 108 px (ngay dưới thanh tiêu đề và cụm ··· ✕ của Zalo), nền tối, chữ trắng 14 px đậm, bo góc vừa. Mọi màn có toast dùng đúng chỗ này | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Một tháng | Chọn tháng | CN6-08 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- đang tải: chưa thiết kế (HV1)
- lỗi mạng: chưa thiết kế (HV2)
- quay lại từ nền: chưa thiết kế (HV3)

## Quyền
Ô quyền theo `docs/luat-chung/PQ.md`. Mỗi ô phải có test chứng minh người không có quyền thì không đọc, không ghi được; test ở lớp database (`tests/db/`).

Ô PQ chạm tới (ma trận `docs/luat-chung/PQ.md`): PQ5.CHU, PQ5.SALE, PQ3.CHU (danh sách chọn căn không có căn đã ẩn). Test vi phạm phải có:
- PQ5.CHU: Chị Hoa đặt giá nhiều căn với danh sách gồm 1509 và Sapphire 1103 của Anh Tuấn: `KHONG_TIM_THAY`, cả hai căn không đổi giá. Chị Hoa sao chép giá từ 3402 sang 1103, và từ 1103 sang 3402: `KHONG_TIM_THAY`, 1103 không đổi, không đọc được giá 1103.
- PQ5.SALE: Sale Hùng đặt giá nhiều căn gồm 1509, hoặc sao chép giá từ 1509: `KHONG_TIM_THAY`.
- PQ3.CHU: danh sách căn có căn đã ẩn của chính người đọc: `KHONG_TIM_THAY`.
- Không có phiên: `CHUA_DANG_NHAP`.

## Database
Đã có trong `supabase/migrations/` và đã chạy test. Tham số và cột: `docs/tu-sinh/Bang_va_cot.md`.

- `fn_dat_gia_nhieu_can`: test ở t_07_can_gia_mo_rong.sql
- `fn_sao_chep_gia`: test ở t_07_can_gia_mo_rong.sql

## Ngoài phạm vi
- Giá theo tháng của một căn (YC3.4-NT1 đến NT5): US4.
- Giá ngày lễ, dịp đặc biệt của một căn (YC3.5): US8.
- Đặt giá ngày lễ, dịp đặc biệt cho nhiều căn (YC3.6 bước 4): chưa có màn (?), chưa US nào nhận. [MỞ: YC3-H13] (YC3.6 bước 4 chưa vẽ)
- Cách "thay" giá có sẵn khi sao chép (phạm vi năm, tháng nguồn chưa đặt, dải chồng ngày của căn đích): [MỞ: US7-H1]. Các kịch bản dưới đây chỉ chạm ca không phụ thuộc phần này.
- Ngày tính giá cuối tuần (YC3.8): US11.
- Sale thấy giá (YC5.1-NT2): US6.
- Căn đã xóa không còn trong danh sách chọn căn (YC3.9): US27.

## Việc cần làm
- [ ] Đọc story này và các luật chung nó trỏ tới. Chỗ nào gắn thẻ MỞ thì không code, hỏi Tùng (docs/Cau_hoi_mo.md).
- [ ] Viết test cho từng tiêu chí chưa có test, test đỏ trước (lớp test: docs/QUY_TRINH.md mục 6).
- [ ] Database: soát các hàm ở mục Database với tiêu chí; thiếu thì thêm migration mới và một dòng trong `scripts/thu-lam-hong.sh`.
- [ ] Giao diện: các màn ở mục Màn hình, nối với Supabase (docs/Ghi_chu_code.md).
- [ ] E2E cho luồng chính của story.
- [ ] Kiểm tay theo `tests/kich-ban/US7.md` trên điện thoại thật.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md` trong cùng PR.
