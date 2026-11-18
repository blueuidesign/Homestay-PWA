# US2 · Chủ nhà xem lịch tháng và chi tiết ngày

- Loại: tính năng
- Trạng thái: chưa làm
- Bản: 1
- Rủi ro: tb
- Làm sau khi xong: US1
- Kiểm tay: `tests/kich-ban/US2.md` (12 kịch bản)

## Mục tiêu
Là chủ nhà, tôi muốn thấy tháng này trên một lịch có chip lọc theo căn và chạm một ngày để xem chi tiết, để trả lời sale ngay.

## Hành vi
Bảng bước ghi: người dùng làm gì, app hiện gì (chữ trong ngoặc kép là chữ trên màn), máy chủ phải làm gì, dữ liệu nào đổi. Cột "Máy chủ" mô tả việc phải xảy ra; bản PWA làm bằng RLS, view và hàm `fn_*` của Supabase.

### Lịch tháng và lọc theo căn
Rủi ro: tb
Mục đích: chủ nhà xem một tháng các căn của mình trên một lịch để biết ngày nào có khách.
Màn hình: CN1, CN1-02, CN1-00
Khi nào xảy ra: chủ nhà mở tab Lịch.

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở tab Lịch | Tiêu đề "Lịch", nút "Đặt phòng", thanh tháng (T09, "Tháng 10/2026", T11), hàng chip lọc, lưới T2 đến CN | kiểm quyền CHU (PQ4.CHU, trả các căn có khách từng đêm (QT2.1). cho hàng chip căn | Không | Không |
| 2 | Xem lưới | Ngày có khách tô màu theo căn. Chú thích bên dưới ghi "1509 đã đặt", "3402 đã đặt" | Không gọi server (dùng kết quả của bước 1) | Không | Không |
| 3 | Chạm một chip | Lọc lịch theo căn. Chip đầu là "Cả 2 phòng" (CN1) hoặc "Tất cả" (CN1-02) | chỉ căn đã chọn; chip "Tất cả" thì không gửi `can_id` | Không | Không |
| 4 | Bấm T09 hoặc T11 | Chuyển tháng. Kết quả chưa vẽ (?) | với tháng mới | Không | Không |
| 5 | Bấm "Đặt phòng" | Mở form thêm booking (CN4, thuộc nhóm Booking) | Không gọi server (lưu đặt phòng thuộc nhóm Booking:, | Không | Không |
| 6 | Bấm "Gửi lịch cho sale" (nút có dòng "Lịch chung các căn") | Mở CN10 (thuộc mục "Chủ nhà chủ động gửi lịch cho sale" (US26)) | Không gọi server (CN10 thuộc mục "Chủ nhà chủ động gửi lịch cho sale" (US26)) | Không | Không |
| 7 | Chạm một ngày | Hiện chi tiết ngày, xem mục "Chi tiết một ngày" | xem mục "Chi tiết một ngày" | Không | Không |

Theo quy tắc: Đêm có khách (QT2); Màu theo căn; Tuần bắt đầu thứ hai.

Trạng thái màn:
- rỗng: CN1-00 "Chưa có đặt phòng nào / Bấm "Đặt phòng" để thêm khách đầu tiên. Ngày có khách sẽ tô màu theo phòng", nút "Đặt phòng" và gợi ý "Mời sale xem lịch để sale tự biết ngày trống, không phải gọi hỏi. Vào tab Sale."
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

## Phần của story khác mà story này làm một lát
Bảng bước của các mục dưới đây nằm ở story chủ của mục đó. Story này chỉ làm các tiêu chí được liệt kê ở mục Tiêu chí nghiệm thu.

- mục "Chi tiết một ngày" · Chi tiết một ngày: bảng bước ở US3. Story này làm NT1.

## Tiêu chí nghiệm thu
Mỗi tiêu chí một test tự động mang đúng mã này trong tên test. Mã không đổi nghĩa; đổi hành vi thì cấp mã mới (docs/QUY_TRINH.md mục 5).

- **US2-NT1** Khi chủ nhà có 2 căn và mở tab Lịch, thì thấy chip "Cả 2 phòng" cùng một chip cho mỗi căn.
- **US2-NT2** Khi chủ nhà có 3 căn và mở tab Lịch, thì thấy chip "Tất cả" cùng một chip cho mỗi căn.
- **US2-NT3** Khi chủ nhà chưa có booking nào, thì thấy CN1-00 thay cho lịch có booking.
- **US2-NT4** Khi chủ nhà chạm một ngày, thì phần chi tiết hiện ngay dưới lịch và ghi đúng ngày đã chạm.
- **US2-NT5** Khi chủ nhà chạm chip của một căn, thì lịch chỉ còn hiện các ngày có khách của căn đó.
- **US2-NT6** Khi một booking nhận 09/10 và trả 12/10, thì các ngày 09/10, 10/10 và 11/10 được tô, ngày 12/10 không được tô. Theo quy tắc: Đêm có khách (QT2).
- **US2-NT7** Khi một căn có khách trong ngày đó, thì hiện tên người đặt, ngày nhận, ngày trả, số đêm và số tiền.

## Luật kiểm dữ liệu và lỗi
Mỗi mục là một việc app nhờ database làm. "Đầu vào" là luật kiểm từng ô, "Lỗi riêng" là khi nào phải từ chối. Cột "Mã" là tên gọi trong tài liệu; hàm database báo lỗi bằng một câu tiếng Việt cho người dùng đọc (docs/luat-chung/Nghiep_vu.md mục Lỗi).

### Trả các căn có khách từng đêm của một tháng, cho lưới tháng
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| thang | thang | có | `YYYY-MM` hợp lệ |
| can_id | id | không | Căn của người gọi. Không có là mọi căn (chip "Tất cả", "Cả 2 phòng") |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| DU_LIEU_SAI | `thang` sai định dạng (`o: "thang"`) |
| KHONG_TIM_THAY | `can_id` không phải căn của người gọi, hoặc căn đã ẩn |

## Luật chung dùng
Nguyên văn ở `docs/luat-chung/` (QT.md, HV.md, Nghiep_vu.md, Tu_dien.md), tìm theo mã hoặc tên.

QT2.1. Quy tắc trong nhóm Lịch chủ nhà: Màu theo căn, Tuần bắt đầu thứ hai. HV1 đến HV3, HV8.

## Màn hình
Hình: `python3 docs/thiet-ke/trich-man.py <mã màn>` (docs/thiet-ke/README.md). Chữ và số trên hình lệch story thì story đúng.

CN1, CN1-00, CN1-02, CN3 (khi chưa có booking).

**CN1-00 · Lịch · chưa có booking**
Vào từ: Xem YC (canvas chưa có mũi tên tới màn này)
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Tiêu đề | "Lịch Đặt phòng" | Canvas |
| 2 | Chọn tháng | "‹ T09", "Tháng 10/2026", "T11 ›" như CN1 | Tháng đang xem |
| 2a | Chip lọc căn | "Cả 2 phòng" (đang chọn), "1509", "3402" như CN1 | Căn của chủ nhà |
| 2b | Lưới tháng | Tháng 10/2026, chưa có vạch nào; hôm nay 07/10 viền xanh | Lịch |
| 3 | Khối nội dung | "Chưa có đặt phòng nào Bấm "Đặt phòng" để thêm khách đầu tiên. Ngày có khách sẽ tô màu theo phòng. Đặt phòng 💡 Mời sale xem lịch để sale tự biết ngày trống, không phải gọi hỏi. Vào tab Sale." | Canvas |
| 4 | Thanh tab | Lịch · Căn · Sale · Thống kê · Cá nhân | Cố định |
| 5 | Cỡ chữ, vùng bấm | Chữ tối thiểu 14 px, vùng bấm tối thiểu 44 px | CLAUDE.md |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Đặt phòng" | Mở màn CN4 | CN4 |
| "‹ T09", "T11 ›" | Chuyển tháng | CN1-00 |
| Chip căn | Lọc lịch theo căn | CN1-00 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- không có quyền: chưa thiết kế

**CN1-02 · Lịch tháng, 3 căn**
Vào từ: Như CN1
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Chip lọc căn | "Tất cả", "1509", "3402", "2501" | Căn |
| 2 | Lưới tháng | Vạch màu 3 căn | Đặt phòng |
| 3 | Thẻ doanh thu | "15.900.000đ", "20 đêm có khách · 3 căn" | Tính từ booking |
| 4 | Đặt phòng sắp tới | 5 dòng đầu, gồm 2501 Kim Chi 08/10 → 10/10, B1, B5, B6, 2501 Phương Anh | Đặt phòng |
| 5 | Thanh tab | Lịch · Căn · Sale · Thống kê · Cá nhân | Cố định |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Một dòng booking | Mở chi tiết booking | CN3-02 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- đang tải: chưa thiết kế (HV1)
- lỗi mạng: chưa thiết kế (HV2)
- quay lại từ nền: chưa thiết kế (HV3)

**CN1 · Lịch tháng, 2 căn**
Vào từ: Mở app, vai chủ nhà; Tab Lịch
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Đầu màn | "Lịch", nút "+ Đặt phòng" | Cố định |
| 2 | Chọn tháng | "T09 · Tháng 10/2026 · T11" | Tháng đang xem |
| 3 | Chip lọc căn | "Cả 2 phòng", "1509", "3402" | Căn của chủ nhà |
| 4 | Lưới tháng | Vạch màu mỗi căn ở đêm có booking; hôm nay 07/10 viền xanh | Đặt phòng B1 đến B8 (DLM.4) |
| 5 | Thẻ doanh thu | "11.800.000đ", "13 đêm có khách · tháng 9: 9.600.000đ" | DLM.5 |
| 6 | Thẻ gửi lịch | "Gửi lịch cho sale · Lịch chung các căn" | Cố định |
| 7 | Đặt phòng sắp tới | 4 dòng: Sale Hùng 1509 10/10 → 12/10 2.200.000đ Cọc 1.000.000đ; Khách lẻ 1509 13/10 → 15/10 1.800.000đ Chưa cọc; Khách lẻ 3402 14/10 → 15/10 800.000đ Đã thanh toán; Sale Lan 3402 17/10 → 19/10 1.900.000đ Chưa cọc | B1, B5, B6, B2 |
| 8 | Thanh tab | Lịch · Căn · Sale · Thống kê · Cá nhân | Cố định |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Một ngày trên lưới | Mở chi tiết ngày | CN3 |
| Một dòng booking sắp tới | Mở chi tiết booking | CN3-02 |
| "+ Đặt phòng" | Mở form | CN4 |
| "Gửi lịch cho sale" | Mở gửi lịch | CN10 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- đang tải: chưa thiết kế (HV1)
- lỗi mạng: chưa thiết kế (HV2)
- quay lại từ nền: chưa thiết kế (HV3)

## Quyền
Ô quyền theo `docs/luat-chung/PQ.md`. Mỗi ô phải có test chứng minh người không có quyền thì không đọc, không ghi được; test ở lớp database (`tests/db/`).

Ô PQ chạm tới (ma trận `docs/luat-chung/PQ.md`): PQ4.CHU. Test vi phạm phải có: chủ nhà A gọi API lịch của chủ nhà B.

## Database
Đã có trong `supabase/migrations/` và đã chạy test. Tham số và cột: `docs/tu-sinh/Bang_va_cot.md`.

Đọc `booking`, `booking_dem`, `booking_rieng`, `can` qua RLS (chủ nhà chỉ thấy căn mình giữ).

## Ngoài phạm vi
- Ngày được tô, lọc chip theo căn có booking, thẻ "Trống" và "Đặt phòng" ở CN3 (US2-NT5, NT4, US3-NT10, NT3): US3, vì cần có booking.
- Tóm tắt tháng, booking sắp tới, lịch tuần (mục "Tóm tắt tháng" (US9), mục "Booking sắp tới" (US9), mục "Lịch tuần khi có nhiều căn" (US9)): US9.

## Việc cần làm
- [ ] Đọc story này và các luật chung nó trỏ tới. Chỗ nào gắn thẻ MỞ thì không code, hỏi Tùng (docs/Cau_hoi_mo.md).
- [ ] Viết test cho từng tiêu chí chưa có test, test đỏ trước (lớp test: docs/QUY_TRINH.md mục 6).
- [ ] Database: thêm migration nếu story cần bảng hay hàm mới, kèm test và một dòng trong `scripts/thu-lam-hong.sh`.
- [ ] Giao diện: các màn ở mục Màn hình, nối với Supabase (docs/Ghi_chu_code.md).
- [ ] E2E cho luồng chính của story.
- [ ] Kiểm tay theo `tests/kich-ban/US2.md` trên điện thoại thật.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md` trong cùng PR.
