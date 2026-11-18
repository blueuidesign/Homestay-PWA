# US3 · Chủ nhà ghi đặt phòng, chặn trùng ở database

- Loại: tính năng
- Trạng thái: chưa làm
- Bản: 1
- Rủi ro: cao
- Làm sau khi xong: US2
- Kiểm tay: `tests/kich-ban/US3.md` (25 kịch bản)

## Mục tiêu
Là chủ nhà, tôi muốn ghi một đặt phòng và được báo khi trùng ngày, để không nhận hai khách một đêm.

## Hành vi
Bảng bước ghi: người dùng làm gì, app hiện gì (chữ trong ngoặc kép là chữ trên màn), máy chủ phải làm gì, dữ liệu nào đổi. Cột "Máy chủ" mô tả việc phải xảy ra; bản PWA làm bằng RLS, view và hàm `fn_*` của Supabase.

### YC2.4 · Chi tiết một ngày
Rủi ro: tb
Mục đích: chủ nhà chạm một ngày để biết từng căn hôm đó có khách hay trống.
Màn hình: CN3
Khi nào xảy ra: chủ nhà chạm một ngày trên lưới tháng.

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Chạm ngày 10/10 | Dưới lưới hiện "Ngày 10/10/2026". Mỗi căn một khối | kiểm quyền CHU (PQ4.CHU), trả từng căn của chủ nhà trong ngày đó | Không | Không |
| 2 | Xem căn có khách | Tên phòng, tên sale, số điện thoại sale, "10/10 → 12/10 (2 đêm)", "2.200.000đ · Cọc: 1.000.000đ", ghi chú nếu có | Không gọi server (dùng kết quả: tên người đặt, số điện thoại sale nếu sale đã cho, ngày nhận, ngày trả, số đêm, tiền phòng, trạng thái tiền, tiền cọc, ghi chú) | Không | Không |
| 3 | Xem căn trống | "Phòng 3402 · Trống ✓" và nút "Đặt phòng" (Tu_dien) | Không gọi server (dùng kết quả: căn trống) | Không | Không |
| 4 | Bấm "Đặt phòng" | Mở CN4 (YC4.1) với căn 3402 và ngày 10/10 điền sẵn, theo mô tả màn CN3 | Không gọi server (lưu đặt phòng thuộc YC4.1:, | Không | Không |

Theo quy tắc: Đêm có khách (QT2); Trạng thái tiền booking.

Trạng thái màn:
- rỗng: không áp dụng (ngày không có khách thì mọi căn ghi "Trống")
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

### YC4.1 · Chủ nhà ghi booking mới
Rủi ro: cao
Mục đích: chủ nhà ghi một booking vào lịch (khách của sale hoặc khách lẻ), để các sale khác thấy ngày đó kín.
Màn hình: CN4, CN4-03
Khi nào xảy ra: chủ nhà bấm "Đặt phòng" ở tab Lịch (CN1), hoặc bấm "Đặt phòng" ở chi tiết ngày (CN3, trước là "Thêm khách", Tu_dien).

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở form | Tiêu đề "Thêm đặt phòng". Các phần: Phòng, ngày và số đêm, Khách / Sale, Tiền phòng, trạng thái tiền, Thêm chi tiết |: căn của chủ nhà và sale đã kết nối cho form.: đêm trống đầu tiên của căn từ hôm nay để điền sẵn | Không | Không |
| 2 | Điền căn, ngày, người đặt, tiền | Xem YC4.1.1 và YC4.1.2 | Như YC4.1.1 và YC4.1.2 | Không | Không |
| 3 | Bấm "Thêm đặt phòng" | Lưu, về lịch (CN4-03): toast "Đã thêm đặt phòng Sale Hùng · 1509", ngày vừa ghi mở sẵn trong chi tiết ngày | kiểm quyền CHU (PQ7.CHU), kiểm dữ liệu, tính `booking_dem`, `exclude` chặn trùng (`TRUNG_LICH`), yêu cầu chờ trùng đêm sang `bi_tu_choi` (giả định GD11), báo lần gửi khách, cập nhật `lich_cap_nhat_luc` | Không (YC9.3) | Thêm một booking vào lịch của căn; các sale khác thấy các đêm đó là Kín |

Theo quy tắc: Chặn trùng lịch (QT1.1); Đêm có khách (QT2).

Trạng thái màn:
- rỗng: form mở ra điền sẵn một đêm đầu tiên còn trống (CN4 hiện "09/10 → 10/10 (1 đêm)")
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

### YC4.1.1 · Căn, ngày và kiểm tra trùng lịch
Rủi ro: cao
Màn hình: CN4, CN4-02

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Chọn căn | Hàng chip "Phòng" (1509, 3402, 2501) | Không gọi server | Không | Không |
| 2 | Chọn số đêm | Chip "1 đêm", "2 đêm", "3 đêm", "Tùy chọn" | Không gọi server | Không | Không |
| 3 | Chọn ngày | Ô "Ngày nhận phòng" và "Ngày trả phòng" | Không gọi server | Không | Không |
| 4 | Xem kết quả kiểm tra | Dòng "✓ 09/10 → 10/10 (1 đêm) · không trùng lịch", hoặc dòng báo trùng khi chọn ngày đã có khách (chủ nhà thử bằng 2 đêm ở 3402) | chỉ để hiện sớm; lúc lưu `exclude` của database vẫn chặn trùng (`TRUNG_LICH`) | Không | Không |

Theo quy tắc: Chặn trùng lịch (QT1).

Trạng thái màn:
- rỗng: ngày nhận điền sẵn, ngày trả theo số đêm
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

### YC4.1.2 · Người đặt, tiền phòng và tiền cọc
Rủi ro: cao
Màn hình: CN4, CN4-02, CN4-01

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Chọn "Khách / Sale" | Hàng chip: "+ Sale mới", "Khách lẻ", các sale đã kết nối (Sale Hùng, Sale Lan, Sale Nga, Sale Minh), và các tên khách lẻ đã dùng trước đó. Có dòng ghi chú theo lựa chọn | sale đã kết nối.: tên khách lẻ chủ nhà đã nhập, mới trước, tối đa 10 | Không | Không |
| 2 | Xem và sửa "Tiền phòng (đ)" | Ô số tiền điền sẵn tổng giá các đêm theo bảng giá, có dòng tách theo đêm ("09/10: 1.300.000đ"). Chủ nhà sửa được ô này; số chủ nhà gõ là tiền phòng của booking (QT4.1). Ô trống thì nút "Thêm đặt phòng" chưa dùng được (CN4-01) | Lưu tiền phòng chủ nhà gõ và chia cho các đêm theo QT4.2. Từ chối booking không có tiền phòng | Không | Tiền phòng và tiền từng đêm của booking, lưu riêng, không theo bảng giá về sau (YC3 quy tắc Booking giữ giá riêng) |
| 3 | Chọn trạng thái tiền | Chip "Chưa cọc", "Đã cọc · còn thu", "Đã thanh toán" (QT trạng thái tiền) | Không gọi server | Không | Không (lưu `booking.trang_thai_tien` ở YC4.1 bước 3) |
| 4 | Chọn "Đã cọc · còn thu" | Hiện ô "Số tiền cọc (đ)" | Không gọi server. Lúc lưu, chỉ nhận `tien_coc` khi `da_coc_con_thu` và không lớn hơn tiền phòng | Không | Không (lưu `booking.tien_coc` ở YC4.1 bước 3) |
| 5 | Bấm "Thêm chi tiết" | Mở: số khách (nút − và +), giờ "14:00 → 12:00", ô "Ghi chú" | Không gọi server. Lúc lưu, giờ app không gửi thì chép từ cài đặt bước 4) | Không | Không (lưu `so_khach`, `gio_nhan`, `gio_tra`, `ghi_chu` ở YC4.1 bước 3) |

Theo quy tắc: Tiền còn lại; Giờ nhận trả mặc định; Trạng thái tiền booking (YC2); Tiền phòng của booking (QT4); Booking giữ giá riêng (YC3).

Trạng thái màn:
- rỗng: ô tiền phòng bỏ trống: CN4-01, trạng thái chưa lưu được, nút "Thêm đặt phòng" chưa dùng được. Canvas sửa theo
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

## Phần của story khác mà story này làm một lát
Bảng bước của các mục dưới đây nằm ở story chủ của mục đó. Story này chỉ làm các tiêu chí được liệt kê ở mục Tiêu chí nghiệm thu.

- YC2.1 · Lịch tháng và lọc theo căn: bảng bước ở US2. Story này làm NT3, NT4.

## Tiêu chí nghiệm thu
Mỗi tiêu chí một test tự động mang đúng mã này trong tên test. Mã không đổi nghĩa; đổi hành vi thì cấp mã mới (docs/QUY_TRINH.md mục 5).

- **YC2.1-NT3** Khi chủ nhà chạm chip của một căn, thì lịch chỉ còn hiện các ngày có khách của căn đó.
- **YC2.1-NT4** Khi một booking nhận 09/10 và trả 12/10, thì các ngày 09/10, 10/10 và 11/10 được tô, ngày 12/10 không được tô. Theo quy tắc: Đêm có khách (QT2).
- **YC2.4-NT2** Khi một căn không có khách trong ngày đó, thì căn đó ghi "Trống" và có nút "Đặt phòng"; bấm nút thì CN4 mở với căn và ngày đó điền sẵn. (Tu_dien)
- **YC2.4-NT3** Khi một căn có khách trong ngày đó, thì hiện tên người đặt, ngày nhận, ngày trả, số đêm và số tiền.
- **YC4.1-NT1** Khi chủ nhà bấm "Thêm đặt phòng" với đủ căn, ngày và người đặt, thì booking hiện trong lịch của căn đó và toast "Đã thêm đặt phòng <người đặt> · <căn>" hiện đầu màn. (Tu_dien)
- **YC4.1.1-NT1** Khi các đêm đã chọn chưa có khách trong căn, thì thấy dòng "không trùng lịch".
- **YC4.1.1-NT2** Khi các đêm đã chọn trùng với một booking của cùng căn, thì thấy dòng báo trùng và không lưu được.
- **YC4.1.1-NT3** Khi chủ nhà chọn "2 đêm", thì ngày trả bằng ngày nhận cộng 2.
- **YC4.1.2-NT1** Khi chủ nhà chọn "Đã cọc · còn thu", thì hiện ô "Số tiền cọc (đ)"; chọn "Chưa cọc" hoặc "Đã thanh toán" thì ô này ẩn.
- **YC4.1.2-NT2** Khi chủ nhà mở "Thêm chi tiết", thì thấy số khách, giờ nhận và trả (14:00, 12:00) và ô ghi chú.
- **YC4.1.2-NT4** Khi ô "Tiền phòng (đ)" trống, thì nút "Thêm đặt phòng" không dùng được và booking không được lưu (CN4-01). Theo quy tắc: QT4.1-VD3.
- **YC4.1.2-NT5** Khi chủ nhà chọn 1509, nhận 31/10 trả 02/11, thì ô tiền phòng điền sẵn 2.200.000đ (QT4.1-VD1).
- **YC4.1.2-NT7** Khi lệnh tạo booking không có tiền phòng gửi thẳng tới server, thì server từ chối và lịch không đổi.

## Luật kiểm dữ liệu và lỗi
Mỗi mục là một việc app nhờ database làm. "Đầu vào" là luật kiểm từng ô, "Lỗi riêng" là khi nào phải từ chối. Cột "Mã" là tên gọi trong tài liệu; hàm database báo lỗi bằng một câu tiếng Việt cho người dùng đọc (docs/luat-chung/Nghiep_vu.md mục Lỗi).

### Trả từng căn của chủ nhà trong một ngày
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| ngay | ngay | có | Ngày hợp lệ |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| DU_LIEU_SAI | `ngay` sai định dạng (`o: "ngay"`) |

### Ghi một đặt phòng mới
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| can_id | id | có | Căn người gọi giữ, chưa ẩn |
| ngay_nhan | ngay | có | |
| ngay_tra | ngay | có | Sau `ngay_nhan`; tối đa 365 đêm |
| sale_id | id hoặc null | không | Chỉ căn `co_lich`. Có thì phải có `ket_noi` `da_ket_noi` giữa người gọi (chủ nhà) và sale đó, và căn nằm trong phạm vi (`tat_ca_can` hoặc có `ket_noi_can`). `null` là khách lẻ |
| ten_khach | chuỗi tối đa 100 hoặc null | không | Ghi `booking_rieng` với `nguoi_nhap_id` là người gọi (QD-011). Đi cùng `sale_id` được không: [MỞ: US3-H1] YC4.1.3-NT4 cho chủ nhà ghi tên khách trên đặt phòng của sale;ghi `sale_id \| ten_khach_le`, tức một trong hai |
| sdt_khach | chuỗi 9 đến 15 chữ số hoặc null | không | Như trên. CN4 chưa có ô số khách: [MỞ: US3-H2] YC4.1.2 không có ô, YC4.1.3-NT4 nhắc "tên và số khách |
| tien_phong | tien | có | Số nguyên đồng, không âm (QT4.1, Thiet_ke_DB Cần quyết 10). Căn tự nhập: tiền trả chủ |
| trang_thai_tien | chuỗi | có với `co_lich` | `chua_coc`, `da_coc_con_thu`, `da_thanh_toan`. Căn tự nhập: phải trống (YC6.5). Chip nào chọn sẵn: [MỞ: YC4-H13] (YC4.1.2 không nói) |
| tien_coc | tien hoặc null | khi `da_coc_con_thu` | Chỉ nhận khi `da_coc_con_thu`. Không lớn hơn `tien_phong`: [MỞ: YC4-H9] bước 2 có luật này; YC4-H9 ghi "tiền cọc lớn hơn tiền phòng chưa có kiểm tra"). Có bắt buộc khi `da_coc_con_thu` không: [MỞ: YC4-H13] (YC4.1.2 không nói) |
| gia_ban | tien | có với `tu_nhap` | Chỉ căn tự nhập: tiền thu khách, ghi `booking_rieng`, YC6.5 bước 5). Căn `co_lich` gửi trường này thì `DU_LIEU_SAI`: giá bán của đặt phòng chủ nhà ghi cho sale do server tính |
| so_khach | số nguyên 1 đến 99 hoặc null | không | |
| gio_nhan, gio_tra | chuỗi `HH:MM` hoặc null | không | Không gửi thì chép `tai_khoan.gio_nhan, gio_tra` của người giữ căn (YC4.1.2 bước 5, YC9.4-NT2) |
| ghi_chu | chuỗi tối đa 500 hoặc null | không | |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| DU_LIEU_SAI | Thiếu `tien_phong` (YC4.1.2-NT7); `ngay_tra` không sau `ngay_nhan`; số tiền lẻ, âm; `tien_coc` gửi khi không phải `da_coc_con_thu`; `trang_thai_tien` hay `tien_coc` gửi cho căn tự nhập; thiếu `gia_ban` với căn tự nhập; `gia_ban` gửi cho căn `co_lich`; `sale_id` không `da_ket_noi` hoặc căn ngoài phạm vi của sale đó (`o: "sale_id"`) |
| KHONG_TIM_THAY | Căn không phải của người gọi, căn đã ẩn, hoặc người gọi chỉ là SALE của căn |
| TRUNG_LICH | Ràng buộc `exclude` từ chối: có đêm đã thuộc đặt phòng chưa hủy khác của cùng căn (QT1.1, QT1.3). Trả thêm `dem_trung`: các đêm trùng |

### Báo sớm các đêm đã chọn có trùng không, kèm giá điền sẵn
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| can_id | id | có | Căn người gọi giữ |
| ngay_nhan | ngay | có | |
| ngay_tra | ngay | có | Sau `ngay_nhan`, tối đa 365 đêm |
| bo_qua_id | id | không | Đặt phòng đang sửa, bỏ ra khi so (QT1.2). Phải là đặt phòng của căn người gọi giữ |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| DU_LIEU_SAI | Ngày sai định dạng, `ngay_tra` không sau `ngay_nhan` |
| KHONG_TIM_THAY | `can_id` hay `bo_qua_id` không thuộc căn người gọi giữ |

### Trả đêm trống đầu tiên của căn từ hôm nay, để form mở ra điền sẵn
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| can_id | id | có | Căn `co_lich` người gọi giữ |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| KHONG_TIM_THAY | Căn không phải của người gọi |
| DU_LIEU_SAI | Căn tự nhập |

### Trả các tên khách lẻ chủ nhà đã nhập, mới trước, tối đa 10, cho hàng chip "Khách / Sale"
**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| (không có) | |

## Luật chung dùng
Nguyên văn ở `docs/luat-chung/` (QT.md, HV.md, Nghiep_vu.md, Tu_dien.md), tìm theo mã hoặc tên.

QT1.1, QT2.1. Quy tắc trong YC4: Tiền còn lại, Giờ nhận trả mặc định. Quy tắc trong YC2: Trạng thái tiền booking. HV1 đến HV3, HV5, HV8.

## Màn hình
Hình: `python3 docs/thiet-ke/trich-man.py <mã màn>` (docs/thiet-ke/README.md). Chữ và số trên hình lệch story thì story đúng.

CN4, CN4-01, CN4-02, CN4-03, CN1 (ngày được tô), CN3 (thẻ "Trống" với nút "Đặt phòng", thẻ có khách).

**CN3 · Chi tiết một ngày**
Vào từ: CN1, chạm một ngày
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Lưới tháng | Ngày 10 được chọn | Ngày chạm |
| 2 | Tiêu đề ngày | "Ngày 10/10/2026" | Ngày chạm |
| 3 | Thẻ booking 1509 | "Sale Hùng", "0912 345 678", "10/10 → 12/10 (2 đêm)", "2.200.000đ · Cọc: 1.000.000đ", ghi chú | B1 (DLM.4) |
| 4 | Dòng căn trống | "Phòng 3402 · Trống ✓", nút "Thêm khách" | DLM.5 |
| 5 | Thẻ gửi lịch | "Gửi lịch cho sale" | Cố định |
| 6 | Thanh tab | Lịch · Căn · Sale · Thống kê · Cá nhân | Cố định |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Thẻ booking | Mở chi tiết booking | CN3-02 |
| "Thêm khách" | Mở form với căn 3402, ngày 10/10 | CN4 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- đang tải: chưa thiết kế (HV1)
- lỗi mạng: chưa thiết kế (HV2)
- quay lại từ nền: chưa thiết kế (HV3)

**CN4-01 · Thêm đặt phòng · tiền phòng bỏ trống**
Vào từ: CN4, xóa ô tiền phòng rồi bấm lưu
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 0 | Màn gốc | Chép đúng màn CN4 trên canvas, chỉ đổi phần trạng thái. Ô "Tiền phòng (đ)" trống, viền đỏ, dòng "Nhập tiền phòng trước khi lưu" | CN4 |
| 1 | Ô tiền phòng | Viền đỏ, gợi ý "Nhập tiền phòng", dòng "Nhập tiền phòng trước khi lưu" | |
| 2 | Chip tiền | Như CN4 | |
| 3 | Nút | "Thêm đặt phòng" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Thêm đặt phòng" | Không lưu, giữ lỗi | |
Trạng thái riêng:
- rỗng: chính là màn này

**CN4-02 · Sửa đặt phòng**
Vào từ: CN3-02, "Sửa"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Phòng, số đêm, ngày | Chip phòng 1509, 3402, 2501; chip 1, 2, 3 đêm, Tùy chọn; Ngày nhận, Ngày trả; dòng kiểm trùng | Căn, lịch |
| 2 | Khách / Sale | Chip sale và khách lẻ | Sale đã kết nối |
| 3 | Tiền phòng | Ô "Tiền phòng (đ)" một hàng riêng, bên dưới là ba nút chia đều "Chưa cọc", "Đã cọc · còn thu", "Đã thanh toán" (chữ 14 px); dòng tách theo đêm, ví dụ căn 1509 "09/10: 1.300.000đ" | Booking, giá đêm (DLM.3) |
| 4 | Số tiền cọc | Hiện khi chọn "Đã cọc · còn thu" | |
| 5 | Thêm chi tiết | "4 khách · 14:00 → 12:00 · Ghi chú" | |
| 6 | Nút | "Lưu thay đổi" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Nút lưu | Lưu booking | CN1 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- đang tải: chưa thiết kế (HV1)
- lỗi mạng: chưa thiết kế (HV2)
- không có quyền: chưa thiết kế (HV5)
- quay lại từ nền: chưa thiết kế (HV3)

**CN4-03 · Đã lưu booking**
Vào từ: CN4, bấm "Thêm đặt phòng"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Lưới tháng | Ngày 10 được chọn | Ngày |
| 2 | Thẻ booking | "Sale Hùng", "10/10 → 12/10 (2 đêm)", "2.200.000đ · Cọc: 1.000.000đ" | B1 |
| 3 | Toast | "✓ Đã thêm đặt phòng Sale Hùng · 1509" | Kết quả lưu |
| 4 | Thanh tab | Lịch · Căn · Sale · Thống kê · Cá nhân | Cố định |
| 5 | Vị trí toast | Toast chung: nổi trên nội dung, cách mép trái, phải 12 px, đỉnh cách đỉnh màn 108 px (ngay dưới thanh tiêu đề và cụm ··· ✕ của Zalo), nền tối, chữ trắng 14 px đậm, bo góc vừa. Mọi màn có toast dùng đúng chỗ này | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| ✕ trên toast | Đóng toast | CN4-03 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- đang tải: chưa thiết kế (HV1)
- lỗi mạng: chưa thiết kế (HV2)
- quay lại từ nền: chưa thiết kế (HV3)

**CN4 · Thêm đặt phòng**
Vào từ: CN1, nút thêm đặt phòng
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Phòng, số đêm, ngày | Chip phòng 1509, 3402, 2501; chip 1, 2, 3 đêm, Tùy chọn; Ngày nhận, Ngày trả; dòng kiểm trùng | Căn, lịch |
| 2 | Khách / Sale | Chip sale và khách lẻ | Sale đã kết nối |
| 3 | Tiền phòng | Ô "Tiền phòng (đ)" một hàng riêng, bên dưới là ba nút chia đều "Chưa cọc", "Đã cọc · còn thu", "Đã thanh toán" (chữ 14 px); dòng tách theo đêm, ví dụ căn 1509 "09/10: 1.300.000đ" | Booking, giá đêm (DLM.3) |
| 4 | Số tiền cọc | Hiện khi chọn "Đã cọc · còn thu" | |
| 5 | Thêm chi tiết | "4 khách · 14:00 → 12:00 · Ghi chú" | |
| 6 | Nút | "Thêm đặt phòng" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Nút lưu | Lưu booking | CN1 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- đang tải: chưa thiết kế (HV1)
- lỗi mạng: chưa thiết kế (HV2)
- không có quyền: chưa thiết kế (HV5)
- quay lại từ nền: chưa thiết kế (HV3)

## Quyền
Ô quyền theo `docs/luat-chung/PQ.md`. Mỗi ô phải có test chứng minh người không có quyền thì không đọc, không ghi được; test ở lớp database (`tests/db/`).

Ô PQ chạm tới (ma trận `docs/luat-chung/PQ.md`): PQ7.CHU. Test vi phạm phải có: chủ nhà A ghi đặt phòng vào căn của chủ nhà B; hai lệnh ghi cùng lúc vào cùng đêm chỉ một lệnh được lưu.

## Database
Đã có trong `supabase/migrations/` và đã chạy test. Tham số và cột: `docs/tu-sinh/Bang_va_cot.md`.

- `fn_chu_ghi_booking`: test ở t_01_phan_quyen.sql, t_02_gia.sql, t_03_chan_trung.sql, t_04_tien_phong.sql, t_05_yeu_cau_huy_khach.sql, t_07_can_gia_mo_rong.sql, t_08_thong_bao.sql, t_09_sale_doc.sql, t_10_thong_ke.sql
- `fn_ghi_khach`: CHƯA có test, viết test trước khi dùng

## Ngoài phạm vi
- Người đặt là sale đã kết nối (YC4.1.2-NT3): US5. Trong US này người đặt là "Khách lẻ" và tên khách lẻ. Không lưu thông tin khách.
- Sale thấy "Kín" (YC4.1-NT2): US6.
- Chi tiết, sửa, xóa, thu đủ (YC4.2 đến YC4.4): US10.
- Yêu cầu đặt phòng của sale (YC4.5 đến YC4.8): US15.

## Việc cần làm
- [ ] Đọc story này và các luật chung nó trỏ tới. Chỗ nào gắn thẻ MỞ thì không code, hỏi Tùng (docs/Cau_hoi_mo.md).
- [ ] Viết test cho từng tiêu chí chưa có test, test đỏ trước (lớp test: docs/QUY_TRINH.md mục 6).
- [ ] Database: soát các hàm ở mục Database với tiêu chí; thiếu thì thêm migration mới và một dòng trong `scripts/thu-lam-hong.sh`.
- [ ] Giao diện: các màn ở mục Màn hình, nối với Supabase (docs/Ghi_chu_code.md).
- [ ] E2E cho luồng chính của story.
- [ ] Kiểm tay theo `tests/kich-ban/US3.md` trên điện thoại thật.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md` trong cùng PR.
