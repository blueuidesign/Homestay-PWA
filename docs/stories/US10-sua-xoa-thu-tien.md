# US10 · Chủ nhà xem chi tiết, sửa, xóa đặt phòng và ghi đã thu đủ

- Loại: tính năng
- Trạng thái: chờ code
- Đặc tả: thô (lắp bằng máy từ bản Zalo, chưa viết lại theo khuôn, chưa áp các quyết định ở `docs/tham-khao/Loi_Tung_ban_Zalo.md`; không code theo bản này, xem US41)
- Bản: 1
- Rủi ro: cao
- Làm sau khi xong: US3
- Kiểm tay: `tests/kich-ban/US10.md` (27 kịch bản)

## Mục tiêu
Là chủ nhà, tôi muốn xem chi tiết, sửa, xóa đặt phòng của mình và ghi đã thu đủ tiền, để lịch và tiền luôn đúng mà không phải ghi lại từ đầu.

## Hành vi
Bảng bước ghi: người dùng làm gì, app hiện gì (chữ trong ngoặc kép là chữ trên màn), máy chủ phải làm gì, dữ liệu nào đổi. Cột "Máy chủ" mô tả việc phải xảy ra; bản PWA làm bằng RLS, view và hàm `fn_*` của Supabase.

### Chi tiết booking và đánh dấu đã thu đủ
Rủi ro: cao
Mục đích: chủ nhà xem đủ thông tin một booking và ghi nhận đã thu tiền.
Màn hình: CN3-02, CN3-02-01
Khi nào xảy ra: chủ nhà chạm "Sửa" trên thẻ phòng ở chi tiết ngày (CN3).

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở chi tiết | Tiêu đề "Đặt phòng · Sale Hùng", phòng, nhãn trạng thái ("Đã cọc · còn thu"), ngày "10/10 → 12/10 (2 đêm)", giờ "Nhận 14:00 thứ 7 · trả 12:00 thứ 2" | kiểm quyền CHU; trả đủ tiền, cọc, khách chủ nhà nhập, không giá bán (PQ7.CHU, PQ8.CHU, PQ9.CHU) | Không | Không |
| 2 | Xem người đặt | Thẻ sale: tên, số điện thoại, số khách, nút "Gọi sale". Dòng ghi chú "Khách do sale Hùng bán. Tên và số điện thoại khách chỉ sale giữ; cần gì về khách thì gọi sale." | Như bước 1 (. Không gửi khách do sale nhập (QD-011) | Gọi mở ứng dụng gọi; số điện thoại sale lấy từ nếu sale đã cho, PQ2.CHU) | Không |
| 3 | Xem tiền | Mục "TIỀN": Tiền phòng 2.200.000đ, Đã cọc 1.000.000đ, Còn lại 1.200.000đ. Mục "GHI CHÚ" | Như bước 1. Tiền còn lại tính lúc đọc, không lưu | Không | Không |
| 4 | Bấm "Đã thu đủ 1.200.000đ" | Booking chuyển "Đã thanh toán". Nút đổi thành "Hoàn tác: chưa thu đủ" | đổi `trang_thai_tien` sang `da_thanh_toan`, giữ trạng thái trước ở `trang_thai_tien_truoc` (cột mới, | Không | Trạng thái tiền của booking |
| 5 | Bấm "Hoàn tác: chưa thu đủ" | Booking về "Đã cọc · còn thu" | đưa `trang_thai_tien` về `trang_thai_tien_truoc` | Không | Trạng thái tiền của booking |
| 6 | Bấm sửa / xóa | Xem mục "Sửa booking" và mục "Xóa booking" | Như mục "Sửa booking" và mục "Xóa booking" | Không | Như mục "Sửa booking" và mục "Xóa booking" |
| 7 | Mở booking của sale đã xóa tài khoản (mục "Khi người dùng xóa tài khoản" (US22)) | Booking vẫn còn, các đêm vẫn kín. Tên cũ của sale hiện kèm ghi chú nhỏ đỏ "Đã xoá tài khoản" (QD-013). Không còn số điện thoại sale và nút "Gọi sale", vì số điện thoại đã xóa (QD-013) | Gửi booking và tên sale kèm cờ đã xóa tài khoản, không gửi số điện thoại | | Không |

Theo quy tắc: Tiền còn lại; Trạng thái tiền booking (nhóm Lịch chủ nhà).

Trạng thái màn:
- rỗng: không áp dụng
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

### Sửa booking
Rủi ro: cao
Mục đích: chủ nhà sửa căn, ngày, người đặt hoặc tiền của một booking đã ghi.
Màn hình: CN4-02, S3-10
Khi nào xảy ra: chủ nhà bấm sửa ở chi tiết booking (CN3-02).

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở sửa | Tiêu đề "Sửa đặt phòng · Sale Hùng". Cùng form với CN4, điền sẵn giá trị hiện có | kiểm quyền CHU, trả giá trị hiện có | Không | Không |
| 2 | Đổi giá trị | Như mục "Căn, ngày và kiểm tra trùng lịch" (US3) và mục "Người đặt, tiền phòng và tiền cọc" (US3); kiểm tra trùng không tính chính booking đang sửa (QT1.2) | bỏ qua chính booking đang sửa (QT1.2) | Không | Không |
| 3 | Bấm "Lưu thay đổi" | Lưu và quay lại. Kết quả chưa vẽ (?) | kiểm quyền CHU; đổi ngày hay căn thì tính lại `booking_dem`; `exclude` tự bỏ chính dòng đang sửa, trùng booking khác thì `TRUNG_LICH`; sau khi lưu làm nhưbước 7 đến 9 cho các đêm mới | Không | Cập nhật booking |
| 4 | (Booking của sale: thành từ yêu cầu của sale, hoặc chủ nhà ghi cho sale theo mục "Booking chủ nhà ghi cho sale" (US28)) chủ nhà lưu thay đổi | Chủ nhà vẫn sửa được hộ sale | Ghi sự kiện "chủ sửa booking" cho sale đó (mục "Cài đặt thông báo" (US21)): căn, ngày cũ và mới, tiền cũ và mới nếu đổi. Sale thấy ở popup thông báo hôm nay (mục "Popup thông báo mới" (US30)) và ở Thông báo (P13) | | Sự kiện thông báo cho sale |
| 5 | (Booking của sale, như bước 4) chủ nhà đổi giá chủ nhà rồi lưu | Sale mở booking đã sửa (S3-10): giá bán cho khách giữ như sale đã báo khách, không tự tính lại theo mức cộng; có dòng báo giá chủ nhà cũ → mới | Giữ giá bán của sale như cũ. Sự kiện "chủ sửa booking" gửi sale kèm giá chủ nhà mới | | Giá chủ nhà của booking; giá bán không đổi |

Theo quy tắc: Chặn trùng lịch (QT1).

Trạng thái màn:
- rỗng: không áp dụng
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

### Xóa booking
Rủi ro: cao
Mục đích: chủ nhà bỏ khỏi lịch một booking mình tự ghi cho khách lẻ (mục "Chủ nhà ghi booking mới" (US3)) khi khách hủy hoặc ghi nhầm. Booking của sale thì chủ nhà không xóa được, chỉ sửa theo mục "Sửa booking": booking thành từ yêu cầu của sale mà chủ nhà đã chấp nhận (mục "Cài đặt thông báo" (US21)), và booking chủ nhà ghi cho sale (mục "Booking chủ nhà ghi cho sale" (US28).
Màn hình: CN3-02
Khi nào xảy ra: chủ nhà bấm "Xóa đặt phòng" ở chi tiết booking chủ nhà tự ghi cho khách lẻ.

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Bấm "Xóa đặt phòng" lần đầu ở booking mình tự ghi (B5, khách lẻ) | Hỏi lại: "Xác nhận xóa đặt phòng? Ngày 13/10 → 15/10 của 1509 trống lại." | Không gọi server | Không | Không |
| 2 | Bấm xác nhận | Xóa booking. Màn đích chưa vẽ (?) | chỉ booking `chu_tu_ghi` không có sale; xóa thật dòng `booking`, đêm trống lại | Không báo ai (mục "Cài đặt thông báo" (US21)) | Booking bị xóa; các đêm đó trống lại |
| 3 | Mở chi tiết booking của sale: thành từ yêu cầu đã được chấp nhận (B1), hoặc chủ nhà ghi cho sale (mục "Booking chủ nhà ghi cho sale" (US28)) | Không có nút "Xóa đặt phòng". Nút sửa vẫn có (mục "Sửa booking") | Từ chối lệnh xóa booking loại này, không chỉ ẩn nút | | Không |

Booking chủ nhà tự ghi mà chọn người đặt là sale: coi như booking của sale, không xóa được. Bỏ booking của sale: hủy hai bên theo mục "Hủy booking đã nhận" (US35).
Theo quy tắc: Xóa phải bấm hai lần; Không xóa booking của sale.

Trạng thái màn:
- rỗng: không áp dụng
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

## Phần của story khác mà story này làm một lát
Bảng bước của các mục dưới đây nằm ở story chủ của mục đó. Story này chỉ làm các tiêu chí được liệt kê ở mục Tiêu chí nghiệm thu.

- mục "Người đặt, tiền phòng và tiền cọc" (US3) · Người đặt, tiền phòng và tiền cọc: bảng bước ở US3. Story này làm NT6.

## Tiêu chí nghiệm thu
Mỗi tiêu chí một test tự động mang đúng mã này trong tên test. Mã không đổi nghĩa; đổi hành vi thì cấp mã mới (docs/QUY_TRINH.md mục 5).

- **US10-NT1** Khi chủ nhà sửa tiền phòng của booking ở NT5 thành 2.000.000đ rồi lưu, thì booking có tiền phòng 2.000.000đ, và thống kê tính 1.000.000đ vào tháng 10, 1.000.000đ vào tháng 11 (QT4.2-VD1).
- **US10-NT2** Khi tiền phòng 2.200.000đ và đã cọc 1.000.000đ, thì mục Tiền ghi còn lại 1.200.000đ.
- **US10-NT3** Khi chủ nhà bấm "Đã thu đủ", thì nhãn booking đổi thành "Đã thanh toán" và nút đổi thành "Hoàn tác: chưa thu đủ". `[đã có test database: t_10_thong_ke.sql]`
- **US10-NT4** Khi chủ nhà bấm "Hoàn tác: chưa thu đủ", thì booking về trạng thái trước khi thu đủ. `[đã có test database: t_10_thong_ke.sql]`
- **US10-NT5** Khi chủ nhà mở sửa, thì mọi ô hiện đúng giá trị của booking.
- **US10-NT6** Khi chủ nhà đổi sang các đêm trùng với booking khác của cùng căn, thì hiện báo trùng và không lưu được.
- **US10-NT7** Khi chủ nhà sửa booking mà không đổi ngày, thì lưu được, không báo trùng với chính nó (QT1.2-VD1).
- **US10-NT8** Khi chủ nhà sửa ngày của booking thành từ yêu cầu của Sale Hùng, thì Sale Hùng thấy dòng "chủ sửa booking" với ngày cũ và ngày mới trong popup thông báo hôm nay và trong P13. `[đã có test database: t_08_thong_bao.sql]`
- **US10-NT9** Khi Chị Hoa sửa B1 từ 10/10 → 12/10 sang 11/10 → 13/10 và giá chủ nhà từ 2.200.000đ thành 1.800.000đ (DLM.6), thì giá bán của Sale Hùng cho B1 vẫn là 2.600.000đ như đã báo khách, và Sale Hùng nhận thông báo "chủ sửa booking" kèm giá chủ nhà mới 1.800.000đ. `[đã có test database: t_08_thong_bao.sql]`
- **US10-NT10** Khi chủ nhà bấm "Xóa đặt phòng" lần đầu ở booking mình tự ghi, thì app hỏi xác nhận và chưa xóa.
- **US10-NT11** Khi chủ nhà xác nhận, thì các đêm của booking trở thành trống trong lịch.
- **US10-NT12** Khi Chị Hoa mở B1 (thành từ yêu cầu của Sale Hùng, Chị Hoa đã chấp nhận), thì không có nút "Xóa đặt phòng" và vẫn sửa được theo mục "Sửa booking".
- **US10-NT13** Khi có lệnh xóa B1 gửi thẳng tới server, thì server từ chối, B1 vẫn còn và đêm 10/10, 11/10 của 1509 vẫn kín.
- **US10-NT14** Khi Chị Hoa mở booking mình ghi cho Sale Hùng (US28-NT1), thì không có nút "Xóa đặt phòng" và vẫn sửa được theo mục "Sửa booking"; lệnh xóa gửi thẳng tới server bị từ chối.

## Luật kiểm dữ liệu và lỗi
Mỗi mục là một việc app nhờ database làm. "Đầu vào" là luật kiểm từng ô, "Lỗi riêng" là khi nào phải từ chối. Cột "Mã" là tên gọi trong tài liệu; hàm database báo lỗi bằng một câu tiếng Việt cho người dùng đọc (docs/luat-chung/Nghiep_vu.md mục Lỗi).

### Chủ nhà sửa căn, ngày, người đặt, tiền hay chi tiết của một đặt phòng
**Đầu vào:** mọi trường của trừ `gia_ban`, đều không bắt buộc; chỉ trường gửi lên mới đổi. Thêm:
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| id | id | có | |
| cap_nhat_luc | luc | có | Bằng `cap_nhat_luc` app đã đọc. Khác thì `TRANG_THAI_DA_DOI`, để hai máy sửa cùng lúc không ghi đè nhau |
| can_id | id | không | Căn khác của cùng người gọi. Đặt phòng có sale thì căn mới phải trong phạm vi của sale đó: [MỞ: US10-H1] mục "Sửa booking" không nói |
| sale_id | id hoặc null | không | Đổi người đặt. Đổi giữa sale và khách lẻ, hay sang sale khác: `booking_rieng`, thông báo cho sale cũ và mới làm gì [MỞ: US10-H2] mục "Sửa booking" nói "sửa người đặt", không nói hệ quả. Bản này từ chối đổi `sale_id` của đặt phòng đang có sale bằng `DU_LIEU_SAI` cho tới khi có quyết định |
| trang_thai_tien | chuỗi | không | Đổi thì `trang_thai_tien_truoc` làm gì: [MỞ: US10-H3] mục "Chi tiết booking và đánh dấu đã thu đủ" không nói |
Luật kiểm như. Đặt phòng `cho_huy` có sửa được không: [MỞ: US10-H4] QD-012 không nói. Đặt phòng `da_huy`: [MỞ: US10-H4] QD-012 không nói. Bản này chỉ cho sửa khi `trang_thai = 'hieu_luc'`.

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| DU_LIEU_SAI | Như; đổi `sale_id` của đặt phòng có sale |
| KHONG_TIM_THAY | Không phải CHU của căn hiện tại, hoặc `can_id` mới không phải căn của người gọi |
| TRUNG_LICH | `exclude` từ chối: đêm mới trùng đặt phòng chưa hủy khác của cùng căn (QT1.2-VD2). Kèm `dem_trung` |
| TRANG_THAI_DA_DOI | `cap_nhat_luc` khác; hoặc đặt phòng không còn `hieu_luc` |

### Xóa đặt phòng chủ nhà tự ghi cho khách lẻ
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| id | id | có | |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| KHONG_TIM_THAY | Không có đặt phòng, hoặc người gọi không phải CHU của căn |
| KHONG_DUOC_PHEP | Đặt phòng có sale (US10-NT13, US10-NT6). `ly_do`: "Đặt phòng của sale không xóa được, chỉ sửa được" |

### Đánh dấu đặt phòng đã thu đủ tiền
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| id | id | có | Đặt phòng căn `co_lich`, có `trang_thai_tien` |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| KHONG_TIM_THAY | Không phải CHU của căn |
| DU_LIEU_SAI | Đặt phòng căn tự nhập (không có trạng thái tiền, mục "Ghi booking đã chốt cho căn tự nhập" (US16)) |
| TRANG_THAI_DA_DOI | `trang_thai_tien` đã là `da_thanh_toan`. Đặt phòng `da_huy`: [MỞ: US10-H4] QD-012 không nói, bản này cũng trả lỗi này |

### Đưa trạng thái tiền về trạng thái trước khi thu đủ
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| id | id | có | |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| KHONG_TIM_THAY | Không phải CHU của căn |
| TRANG_THAI_DA_DOI | `trang_thai_tien` không phải `da_thanh_toan`, hoặc `trang_thai_tien_truoc` trống |

## Ai được làm và việc kéo theo
Nguyên liệu chép từ đặc tả máy chủ của bản Zalo, đã đổi tên bảng và mã. Đối chiếu với hàm database ở mục Database khi viết lại story: chỗ nào lệch thì ghi vào "Database đang lệch story". Tên lỗi viết hoa (`KHONG_TIM_THAY`, `DU_LIEU_SAI`) là tên loại lỗi của bản cũ; bản PWA báo bằng câu tiếng Việt.

### Chủ nhà sửa căn, ngày, người đặt, tiền hay chi tiết của một đặt phòng
**Ai gọi:** CHU của căn (PQ7.CHU, PQ8.CHU, PQ9.CHU). Sửa được cả đặt phòng của sale (mục "Sửa booking" (US10) bước 4). Sale của đặt phòng: `KHONG_TIM_THAY` (PQ7.SALE: không sửa). Sale với đặt phòng căn tự nhập: [MỞ: US10-H10] PQ14.SALE cho sale sửa;chỉ cho chủ nhà; mục "Ghi booking đã chốt cho căn tự nhập" (US16) bước 6 màn sửa chưa thiết kế. Bản này trả `KHONG_TIM_THAY`.

**Việc kéo theo:** trong cùng giao dịch:
- Đặt phòng có sale (`tu_yeu_cau` hay `chu_tu_ghi` có `sale_id`): ghi `thong_bao` loại `chu_sua_booking` cho sale, `du_lieu` gồm căn, ngày cũ và mới, `tien_phong` cũ và mới nếu đổi (mục "Cài đặt thông báo" (US21), mục "Sửa booking" (US10) bước 4, 5). Không có tên khách, không có ghi chú. Chỉ đổi trường sale không thấy (ví dụ `ghi_chu`, khách chủ nhà nhập) có báo không: [MỞ: US10-H11] mục "Sửa booking" (US10) bước 4 nói mọi lần lưu.
- Đổi ngày hay căn: làm như cho các đêm mới: yêu cầu chờ trùng đêm sang `bi_tu_choi` (giả định GD11), báo lần gửi khách, cập nhật `lich_cap_nhat_luc`.

**Chống bấm hai lần:** có.

### Xóa đặt phòng chủ nhà tự ghi cho khách lẻ
**Ai gọi:** CHU của căn (PQ7.CHU), chỉ với đặt phòng `nguon = 'chu_tu_ghi'` và `sale_id` trống. Đặt phòng có sale (`tu_yeu_cau`, hoặc `chu_tu_ghi` có `sale_id`): `KHONG_DUOC_PHEP` và trigger database cũng chặn (Thiet_ke_DB `booking`). Sale: `KHONG_TIM_THAY`. Sale xóa đặt phòng căn tự nhập: [MỞ: US10-H12] PQ14.SALE cho xóa;chỉ cho `chu_tu_ghi`. Bản này trả `KHONG_TIM_THAY`.

**Việc kéo theo:** cập nhật `can.lich_cap_nhat_luc`. Không báo ai (mục "Cài đặt thông báo" (US21)).

**Chống bấm hai lần:** có. Lệnh lặp cùng khóa trả lại `{ "id": 105, "da_xoa": true }`. Lệnh mới không khóa cho đặt phòng đã xóa: `KHONG_TIM_THAY`.

### Đánh dấu đặt phòng đã thu đủ tiền
**Ai gọi:** CHU của căn (PQ8.CHU). Sale: `KHONG_TIM_THAY` (PQ8.SALE không sửa tiền).

**Việc kéo theo:** Không. Không có loại thông báo cho việc này (mục "Cài đặt thông báo" (US21)).

**Chống bấm hai lần:** có.

### Đưa trạng thái tiền về trạng thái trước khi thu đủ
**Ai gọi:** CHU của căn (PQ8.CHU). Sale: `KHONG_TIM_THAY`.

**Việc kéo theo:** Không.

**Chống bấm hai lần:** có.

## Luật chung dùng
Nguyên văn ở `docs/luat-chung/` (QT.md, HV.md, Nghiep_vu.md, Tu_dien.md), tìm theo mã hoặc tên.

QT1.1, QT1.2 (kiểm trùng bỏ qua chính đặt phòng đang sửa), QT2.1, QT2.2, QT3.1 (giá bán của sale giữ khi chủ nhà sửa), QT4.1, QT4.2 (tiền phòng chia theo đêm), QD-010, QD-012 (đặt phòng đã hủy không tính doanh thu), QD-011. Quy tắc trong nhóm Booking: Tiền còn lại, Giờ nhận trả mặc định, Xóa phải bấm hai lần, Không xóa booking của sale, Sale thấy hai giá chủ nhà thấy một giá, Chủ nhà chỉ làm việc với sale. Quy tắc trong nhóm Lịch chủ nhà: Trạng thái tiền booking. HV1, HV2, HV3, HV5, HV8.

## Màn hình
Hình: `python3 docs/thiet-ke/trich-man.py <mã màn>` (docs/thiet-ke/README.md). Chữ và số trên hình lệch story thì story đúng.

CN3 (nút "Sửa" trên thẻ phòng), CN3-02 (chi tiết, thu đủ, xóa), CN4-02 (sửa đặt phòng), CN4-01 (tiền phòng bỏ trống, dùng lại ở form sửa), S3-10 (sale thấy đặt phòng chủ nhà đã sửa). CN3-02-01 (sale đã xóa tài khoản) thuộc US22.

**CN3-02-01 · Chi tiết booking · sale đã xóa**
Vào từ: CN1, CN3: chạm booking của sale đã xóa
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Màn gốc | Chép đúng CN3-02 | CN3-02 |
| 2 | Thẻ người bán | "Sale Hùng" kèm nhãn "đã xóa tài khoản", "4 khách". Bỏ số điện thoại và nút "Gọi sale" | Đặt phòng |
| 3 | Câu dưới thẻ | "Sale Hùng đã xóa tài khoản. Đặt phòng vẫn giữ trong lịch của bạn; app không còn số điện thoại của sale này." | Sự kiện xóa |
| 4 | Tiền, ghi chú, nút | Như CN3-02: 2.200.000đ, còn lại 1.200.000đ, "Đã thu đủ 1.200.000đ" | B1 |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Đã thu đủ 1.200.000đ" | Như CN3-02 | CN3-02-01 |
Trạng thái riêng:
- không có quyền: theo HV5

**CN3-02-02 · Chi tiết booking chủ nhà tự ghi · xóa**
Vào từ: CN1, CN3: chạm booking B5
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Màn gốc | Chép đúng CN3-02 | CN3-02 |
| 2 | Đầu thẻ | "Đặt phòng · Khách lẻ", "Phòng 1509", nhãn "Chưa cọc", "13/10 → 15/10 (2 đêm)", "Nhận 14:00 thứ 3 · trả 12:00 thứ 5" | B5 (DLM.4) |
| 3 | Người đặt | "Khách lẻ", "Bạn tự ghi, không qua sale"; câu "Đặt phòng bạn tự ghi. Sale không thấy tên khách." | B5, QD-011 |
| 4 | Tiền | Tiền phòng 1.800.000đ, Đã cọc 0đ, Còn lại 1.800.000đ | B5 |
| 5 | Xóa | Đang ở bước hỏi lại: nút đỏ "Xác nhận xóa đặt phòng?", dòng "Ngày 13/10 → 15/10 của 1509 trống lại." Không có câu "Sale được báo" | mục "Xóa booking" bước 1, 2 |
| 6 | Nút dưới | "Đã thu đủ 1.800.000đ" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Xóa đặt phòng" (lần đầu) | Đổi thành nút đỏ hỏi lại như hình | CN3-02-02 |
| "Xác nhận xóa đặt phòng?" | Xóa, 13/10 → 15/10 của 1509 trống lại | CN1 |
Trạng thái riêng:
- không có quyền: theo HV5

**CN3-02-03 · Chi tiết đặt phòng · đã thu đủ**
Vào từ: CN3-02, bấm "Đã thu đủ 1.200.000đ"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Màn gốc | Chép CN3-02 | CN3-02 |
| 2 | Nhãn | "Đã thanh toán" (nền xanh nhạt) | mục "Chi tiết booking và đánh dấu đã thu đủ" bước 4 |
| 3 | Tiền | "Tiền phòng 2.200.000đ", "Đã cọc 1.000.000đ", "Còn lại 0đ" | B1 (DLM.4) |
| 4 | Nút | "Hoàn tác: chưa thu đủ" (nút phụ) | mục "Chi tiết booking và đánh dấu đã thu đủ" bước 5 |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Hoàn tác: chưa thu đủ" | Về lại "Đã cọc · còn thu", còn lại 1.200.000đ | CN3-02 |

**CN3-02 · Chi tiết booking**
Vào từ: CN1, CN3: chạm một booking
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Đầu thẻ | "Đặt phòng · Sale Hùng", "Phòng 1509", nhãn "Đã cọc · còn thu" | B1 |
| 2 | Ngày | "10/10 → 12/10 (2 đêm)", "Nhận 14:00 thứ 7 · trả 12:00 thứ 2" | B1 |
| 3 | Người bán | "Sale Hùng", "0912 345 678 · 4 khách", nút "Gọi sale" | B1 |
| 4 | Tiền | "Tiền phòng 2.200.000đ", "Đã cọc 1.000.000đ", "Còn lại 1.200.000đ" | B1 (DLM.4) |
| 5 | Ghi chú | Lời nhắn của sale | B1 |
| 6 | Nút | "Đã thu đủ 1.200.000đ". Không có "Xóa đặt phòng" vì B1 là booking từ yêu cầu của sale (mục "Xóa booking" bước 3) | B1 |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Đã thu đủ 1.200.000đ" | Nhãn thành "Đã thanh toán", còn lại 0đ, nút thành "Hoàn tác: chưa thu đủ" | CN3-02-03 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- đang tải: chưa thiết kế (HV1)
- lỗi mạng: chưa thiết kế (HV2)
- quay lại từ nền: chưa thiết kế (HV3)

**S3-10 · Đặt phòng chủ nhà đã sửa**
Vào từ: S1-06, chạm dòng "Chị Hoa đã sửa đặt phòng của bạn"; P13, chạm cùng thông báo
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Màn gốc | Chép đúng S3-04 trên canvas, đổi số và thẻ báo | S3-04 |
| 2 | Thẻ căn | "ICON40 1509 · 2PN", "Chị Hoa · 11/10 → 13/10 (2 đêm)" | Đặt phòng sau khi sửa |
| 3 | Hai giá | "Giá bán cho khách 2.600.000đ", "Giá chủ nhà 1.800.000đ" | Giá bán giữ như sale đã báo khách; giá chủ nhà mới (DLM.3) |
| 4 | Thẻ vàng | "Chị Hoa đã sửa đặt phòng này lúc 10:15 hôm nay"; "Ngày: 10/10 → 12/10 (gạch) → 11/10 → 13/10 (2 đêm)"; "Giá chủ nhà: 2.200.000đ (gạch) → 1.800.000đ"; "Giá bán cho khách giữ 2.600.000đ như bạn đã báo. Báo lại khách ngày mới." | Sự kiện chủ sửa booking (mục "Sửa booking" bước 4) |
| 5 | Nút | "Gọi Chị Hoa" (phụ), "Về lịch phòng" (chính) | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Gọi Chị Hoa" | Gọi điện chủ nhà | Zalo |
| "Về lịch phòng" | Về lịch | S1 |
Trạng thái riêng:
- không có quyền: theo HV5

## Quyền
Ô quyền theo `docs/luat-chung/PQ.md`. Mỗi ô phải có test chứng minh người không có quyền thì không đọc, không ghi được; test ở lớp database (`tests/db/`).

Ô PQ chạm tới (ma trận `docs/luat-chung/PQ.md`): PQ7.CHU, PQ8.CHU, PQ9.CHU, PQ2.CHU, PQ11.CHU, PQ7.SALE. Test vi phạm phải có:
- PQ7.CHU: chủ nhà A mở, sửa, xóa đặt phòng của chủ nhà B thì `KHONG_TIM_THAY`; chủ nhà A chuyển đặt phòng của mình sang căn của chủ nhà B thì `KHONG_TIM_THAY`; hai `PATCH` song song kéo B1 và B5 vào cùng đêm 12/10 của 1509 thì đúng một lệnh qua, lệnh kia `TRUNG_LICH` (Luật chung 6).
- PQ8.CHU: chủ nhà A thu đủ, hoàn tác đặt phòng của chủ nhà B thì `KHONG_TIM_THAY`.
- PQ7.SALE: Sale Hùng sửa, xóa, thu đủ B1 thì `KHONG_TIM_THAY` (sale chỉ xem).
- PQ11.CHU: trả lời và `PATCH` cho B1 không có khóa `gia_ban`, `tien_chenh`; `PATCH` có trường `gia_ban` thì `DU_LIEU_SAI` và giá bán của Sale Hùng không đổi.
- PQ9.CHU: trả lời của chủ nhà không có khách do sale nhập (QD-011).
- PQ2.CHU: số điện thoại sale chỉ có khi sale đã cho số.
- Xóa đặt phòng có sale: lệnh `DELETE` cho B1 thì `KHONG_DUOC_PHEP`; `delete from booking where id = 101` chạy thẳng bằng SQL bị trigger database từ chối (US10-NT13, US10-NT6).

## Database
Đã có trong `supabase/migrations/` và đã chạy test. Tham số và cột: `docs/tu-sinh/Bang_va_cot.md`.

- `fn_chu_sua_booking`: test ở t_03_chan_trung.sql, t_04_tien_phong.sql, t_08_thong_bao.sql, t_10_thong_ke.sql
- `fn_chu_xoa_booking`: test ở t_05_yeu_cau_huy_khach.sql
- `fn_chu_thu_du`: test ở t_10_thong_ke.sql
- `fn_chu_hoan_tac_thu_du`: test ở t_10_thong_ke.sql

## Ngoài phạm vi
- Ghi đặt phòng mới (mục "Chủ nhà ghi booking mới" (US3), mục "Căn, ngày và kiểm tra trùng lịch" (US3), US3-NT17, US3-NT2): US3. US3-NT14, US3-NT5, US3-NT7 chưa có US, đề xuất vào US3 [MỞ: US10-H13].
- Chủ nhà ghi đặt phòng chọn sale làm người đặt (mục "Booking chủ nhà ghi cho sale" (US28)): US28. US10 chỉ kiểm hai điều về đặt phòng loại này: không có nút "Xóa đặt phòng" (US10-NT14) và sale được báo khi chủ sửa (mục "Sửa booking" bước 4). US10-KB21 và US10-KB26 chạy khi US28 xong.
- Sale đã xóa tài khoản (US22-NT6, CN3-02-01): US22.
- Xin hủy, đồng ý hủy, từ chối hủy đặt phòng đã chấp nhận (QD-012): chưa có NT trong nhóm Booking, chờ. API `xin-huy`, `tra-loi-huy` không thuộc US này.
- Yêu cầu đặt phòng của sale (mục "Sale gửi yêu cầu đặt phòng" (US15) đến mục "Yêu cầu trùng ngày" (US15)): US15.
- Popup thông báo (mục "Popup thông báo mới" (US30)): US30. Trang Thông báo P13 (mục "Thông báo kết quả kết nối cho sale" (US17)): US17. US10-KB13 bước 2 chạy khi US30 xong, bước 3 chạy khi US17 xong; trước đó Đức kiểm thông báo bằng API.
- Danh sách đặt phòng của sale S7-03 (mục "Trạng thái booking của sale" (US19)): US19. US10-KB22 chạy khi US19 xong.
- Chưa quyết, không code theo phần này (CLAUDE.md):
  - [MỞ: CH-023] (mục "Sửa booking" bước 3; mục "Xóa booking" bước 2 sau khi lưu hoặc xóa về màn nào; "chưa vẽ (?)"). Kịch bản quay về tab Lịch bằng tay.
  - [MỞ: US10-H5] mục "Sửa booking" "sửa người đặt": đổi sang sale khác hay khách lẻ thì giá bán và thông báo ra sao. Server từ chối đổi `sale_id` của đặt phòng đã có sale [MỞ: US10-H14].
  - [MỞ: US10-H6] mục "Chi tiết booking và đánh dấu đã thu đủ", mục "Sửa booking" sửa và thu đủ đặt phòng đang `cho_huy` hoặc đã `da_huy` (QD-012). Bản này chỉ cho sửa khi `hieu_luc`.
  - [MỞ: US10-H7] mục "Sửa booking" chỉ đổi tiền phòng mà giữ ngày thì chia lại tiền các đêm theo bảng giá lúc ghi hay bảng giá hiện tại, QT4.2. Tổng tiền các đêm luôn bằng tiền phòng.
  - [MỞ: US10-H8] mục "Sửa booking" bước 4 chỉ sửa ghi chú hay khách chủ nhà nhập, sale có được báo không.
  - [MỞ: CH-024] (tiền cọc lớn hơn tiền phòng khi sửa; [MỞ: US10-H15].
  - [MỞ: US10-H9] S3-10 thẻ vàng ghi "Giá bán tính lại theo mức cộng", trái mục "Sửa booking" bước 5 và NT5 (giá bán giữ như đã báo khách). Làm theo YC, chờ Tùng chọn.

## Việc cần làm
- [ ] Đọc story này và các luật chung nó trỏ tới. Chỗ nào gắn thẻ MỞ thì không code, hỏi Tùng (docs/Cau_hoi_mo.md).
- [ ] Viết test cho từng tiêu chí chưa có test, test đỏ trước (lớp test: docs/QUY_TRINH.md mục 6).
- [ ] Database: soát các hàm ở mục Database với tiêu chí; thiếu thì thêm migration mới và một dòng trong `scripts/thu-lam-hong.sh`.
- [ ] Giao diện: các màn ở mục Màn hình, nối với Supabase (docs/Ghi_chu_code.md).
- [ ] E2E cho luồng chính của story.
- [ ] Kiểm tay theo `tests/kich-ban/US10.md` trên điện thoại thật.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md` trong cùng PR.
