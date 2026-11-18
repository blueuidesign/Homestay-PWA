# US16 · Căn tự nhập và booking sale tự ghi

- Loại: tính năng
- Trạng thái: chờ code
- Đặc tả: thô (lắp bằng máy từ bản Zalo, chưa viết lại theo khuôn, chưa áp các quyết định ở `docs/tham-khao/Loi_Tung_ban_Zalo.md`; không code theo bản này, xem US41)
- Bản: 1
- Rủi ro: cao
- Làm sau khi xong: US5, US6, US12
- Kiểm tay: `tests/kich-ban/US16.md` (44 kịch bản)

## Mục tiêu
Là sale, tôi muốn lưu căn của chủ chưa dùng app, xem nguồn phòng của mình ở một chỗ và ghi đặt phòng đã chốt, để không phải nhớ lịch và giá trong đầu.

## Hành vi
Bảng bước ghi: người dùng làm gì, app hiện gì (chữ trong ngoặc kép là chữ trên màn), máy chủ phải làm gì, dữ liệu nào đổi. Cột "Máy chủ" mô tả việc phải xảy ra; bản PWA làm bằng RLS, view và hàm `fn_*` của Supabase.

### Lịch phòng 7 ngày
Rủi ro: cao
Mục đích: sale thấy ngay căn nào trống, căn nào kín trong 7 ngày tới, kèm giá, để trả lời khách nhanh.
Màn hình: S1, S1-04, S1-05
Khi nào xảy ra: sale mở tab Lịch.

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở tab Lịch | Tiêu đề "Lịch phòng", ô tìm "Tìm phòng trống theo ngày", thanh "7 ngày tới · 07/10 → 13/10" kèm nút ‹ ›, nút sắp xếp ("Theo tên") | 7 ngày từ `tu`, chỉ căn của sale và căn trong phạm vi `ket_noi` `da_ket_noi` | Không | Không |
| 2 | Xem bảng | Cột CĂN và 7 cột ngày (Nay, T5, T6...). Hai nhóm: "CĂN CỦA TÔI · 2" ở đầu, rồi "NGUỒN PHÒNG · 5". Mỗi hàng: tên căn, chủ nhà, số phòng ngủ, rồi mỗi ngày là giá hoặc "Kín" | nhóm căn của tôi ở trên, rồi nhóm nguồn phòng; mỗi căn có tên chủ nhà, số phòng ngủ; mỗi ô `kin` hoặc giá bán một đêm (giả định GD16) | Không | Không |
| 3 | Xem căn tự nhập | Hàng "Villa Tuần Châu · Chú Bình · tự nhập": ô ngày hiện "?", ô có booking mình ghi hiện "Bạn" | căn tự nhập mọi ô `chua_biet`, đêm sale đã ghi đặt phòng là `cua_ban`, không bao giờ trống | Không | Không |
| 4 | Xem chú thích | "Hôm nay", "Kín", "?" (Căn tự nhập: gọi chủ hỏi), "Đặt phòng bạn đã ghi", "Số là giá đêm của bạn · chạm căn để xem" | Không gọi server | Không | Không |
| 5 | Bấm ‹ hoặc › | Chuyển 7 ngày | với `tu` lùi hoặc tiến 7 ngày | Không | Không |
| 6 | Bấm nút sắp xếp | S1-04: chọn "Theo tên", "Giá tăng dần" hoặc "Bán nhiều nhất". Ghi chú "Căn của tôi luôn hiện đầu danh sách." | `ten`, `gia_tang` (theo giá hôm nay, căn không giá xếp cuối), `ban_nhieu` (số đặt phòng của chính sale với căn đó trong 90 ngày qua); nhóm căn của tôi luôn ở trên | Không | Không |
| 7 | Chạm nút nhỏ "Xoay ngang" ở hàng ngay dưới hàng "7 ngày tới", cùng hàng với nút "Theo tên" (không nổi, không che bảng hay chú thích; câu 1, câu 1) | S1-05: app quay cả bảng 90 độ (xoay giả, vì Zalo không xoay thật được), người dùng tự nghiêng máy theo. Cột tên căn rộng hơn, ẩn thanh menu. Nút đổi thành "Xoay dọc" để trở lại. App không tự xoay khi người dùng nghiêng điện thoại | Không gọi server | Không | Không |
| 8 | Chạm một căn | Mở chi tiết căn (S3, xem mục "Chi tiết căn và giá bán" (US13)) | Không gọi server ở bước này (chi tiết căn: mục "Chi tiết căn và giá bán" (US13)) | Không | Không |
| 9 | Chạm ô tìm | Mở tìm phòng (S1-02, xem mục "Tìm phòng trống theo ngày" (US12)) | Không gọi server ở bước này (tìm phòng: mục "Tìm phòng trống theo ngày" (US12)) | Không | Không |
| 10 | Một chủ nhà trong nguồn phòng đã xóa tài khoản (mục "Khi người dùng xóa tài khoản" (US22)) | Các căn của chủ nhà đó biến khỏi bảng và khỏi kết quả tìm phòng (mục "Kết quả tìm phòng" (US12)), dù căn, lịch, giá vẫn còn ở server (QD-013). Số đếm "NGUỒN PHÒNG" giảm theo. Sale thấy dòng chủ nhà kèm ghi chú nhỏ đỏ "Đã xoá tài khoản" ở Nguồn phòng (mục "Danh sách căn và nguồn phòng" bước 10); sale có thông báo "chủ nhà đã xóa tài khoản" (mục "Cài đặt thông báo" (US21), QD-013) | Không gửi căn, lịch, giá của chủ nhà đã xóa tài khoản | | Không |

Theo quy tắc: Căn của tôi đứng đầu; Căn tự nhập không có lịch; Sale chỉ thấy căn chủ nhà đã đồng ý (nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale).

Trạng thái màn:
- rỗng: sale chưa có nguồn phòng thì thấy A5 (thuộc mục "Màn đầu tiên khi chưa có dữ liệu" (US1))
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5 (sale bị ngừng, chủ nhà xóa tài khoản)
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: toast "đã đồng ý cho bạn xem lịch" (A9, thuộc mục "Thông báo kết quả kết nối cho sale" (US17))

### Danh sách căn và nguồn phòng
Rủi ro: tb
Căn của mình là căn sale sở hữu hoặc thuê lại để kinh doanh (QD-005). Sale bán cả căn của mình và căn của chủ nhà đã kết nối. Chia lịch các căn này cho sale khác chỉ qua Đội nhóm (nhóm Đội nhóm, cộng tác viên), bản đầu chưa có (nhóm Đội nhóm, cộng tác viên).
Mục đích: sale thấy một chỗ gồm căn của mình, chủ nhà đã kết nối và căn tự nhập.
Màn hình: S6, S6-00, S6-07, S6-08
Khi nào xảy ra: sale mở tab Căn.

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở tab Căn | Hai tab "Nguồn phòng" và "Căn". Nhóm "CĂN CỦA TÔI · 2" kèm nút "+ Thêm căn". Mỗi căn: tên, "2PN · view biển", tình trạng ("Trống hôm nay ✓", "Có khách 12/10") | căn người gọi giữ, chưa ẩn, có tình trạng hôm nay (`co_khach`, `khach_den`, `trong`) | Không | Không |
| 2 | Xem nguồn phòng | Nhóm "CHỦ NHÀ ĐÃ KẾT NỐI · 2". Mỗi chủ nhà: chữ cái đầu, tên, "✓ Cập nhật 2 giờ trước", danh sách căn ("ICON40 1509 · 2PN", "view biển"). Phần phòng ngủ lấy từ số phòng ngủ và ô "Số giường" của căn (mục "Tòa nhà, loại view, số giường, mô tả" (US11)), ghi theo `Tu_dien.md` như thẻ căn ở mục "Danh sách căn" (US1) bước 2: có số giường thì "2PN · 3 giường"; không hiện số khách. Số giường của 1509 chưa có trong dữ liệu mẫu | với sale: danh sách nguồn phòng; căn trong phạm vi `ket_noi` `da_ket_noi` | Không | Không |
| 3 | Xem căn tự nhập | Nhóm "CĂN TỰ NHẬP · 1": "Villa Tuần Châu", "Chú Bình · chưa dùng app · gọi hỏi lịch" | căn người gọi giữ, gồm căn tự nhập; chỉ sale tạo đọc được | Không | Không |
| 4 | Xem gợi ý mời | "Mời chú Bình dùng app để lịch tự cập nhật, không cần gọi hỏi." và nút "Gửi lời mời qua Zalo". Bấm nút: chạy mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5) nếu hồ sơ sale chưa có số (mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5)), rồi mở cửa sổ chia sẻ | Có chạy mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5). Mời chủ căn tự nhập: app mở cửa sổ gửi của Zalo với tin mời chung, chủ căn mở thì vào app như người mới. Ghép căn tự nhập với căn thật của chủ đó: [MỞ: CH-027] | Hộp thoại xin thông tin và số điện thoại khi chạy mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5); mở cửa sổ chia sẻ | Có chạy mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5): `profiles`: `sdt`, `ten`, `anh_dai_dien`. Không thì Không |
| 5 | Bấm "+ Thêm căn" | Luồng thêm căn của chủ nhà (mục "Thêm căn" (US1)) | Không gọi server. Lưu căn theo mục "Thêm căn" (US1) (| Không | Không |
| 6 | Bấm "Thêm căn tự nhập" | Sang mục "Thêm căn tự nhập" | Không gọi server | Không | Không |
| 7 | Chạm tên một chủ nhà đã kết nối (ví dụ Chị Hoa) | Mở chi tiết chủ nhà S6-04 (mục "Chi tiết chủ nhà và bỏ nguồn phòng"). Chạm một căn bên dưới tên thì theo bước 7a | Không gọi server | Không | Không |
| 7a | Chạm một căn của chủ nhà đã kết nối (ví dụ ICON40 1509 dưới Chị Hoa) | Mở chi tiết căn S3 (mục "Chi tiết căn và giá bán" (US13)) của căn đó, như chạm căn ở lịch phòng. Không mở S6-07: sale không ghi booking hay sửa giá trên căn của chủ nhà | Gửi căn theo quyền sale được xem (nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale) | Không | Không |
| 8 | Chạm căn tự nhập | Sang mục "Chi tiết căn tự nhập" | Không gọi server | Không | Không |
| 9 | Chạm một căn của tôi | Mở S6-07 "Chi tiết căn của tôi": thẻ căn có nhãn "Căn của tôi", lịch 7 ngày với giá của sale, ba việc "Đặt phòng" (CN4; trước là "Ghi booking", Tu_dien), "Sửa căn và giá" (CN5-02), "Gửi cho khách" (S5) | chi tiết căn của mình, mọi trường và ảnh theo thứ tự (S6-07) | Không | Không |
| 10 | Xem chủ nhà đã xóa tài khoản (mục "Khi người dùng xóa tài khoản" (US22)) | Trong nhóm "CHỦ NHÀ ĐÃ KẾT NỐI": dòng tên cũ của chủ nhà kèm ghi chú nhỏ đỏ "Đã xoá tài khoản", không có số điện thoại, không có danh sách căn, không có "Cập nhật... trước". Chạm vào dòng không mở gì. Có nút "Bỏ khỏi danh sách" (S6-08). Số đếm của nhóm không tính dòng chủ nhà đã xóa tài khoản. Chủ nhà cho lại tên và số điện thoại thì dòng trở lại như trước, kết nối tự nối lại, sale không phải xin lại lịch (QD-013) | Không gửi căn, lịch, giá, số điện thoại của chủ nhà đã xóa tài khoản, chỉ gửi tên kèm cờ đã xóa tài khoản (QD-013) | | Không |
| 11 | Bấm "Bỏ khỏi danh sách" ở dòng chủ nhà đã xóa tài khoản | Bỏ ngay, không hỏi lại. Dòng biến khỏi danh sách. Booking đã chốt với chủ nhà đó vẫn còn ở danh sách booking của sale (mục "Trạng thái booking của sale" (US19)). Đã bỏ dòng thì khi chủ nhà cho lại tên và số, kết nối có nối lại không: [MỞ: CH-028] | Bỏ dòng khỏi danh sách của sale này | | Danh sách chủ nhà của sale |

Theo quy tắc: Ba loại căn của sale; Căn tự nhập không có lịch (nhóm Tìm phòng và gửi khách); Độ tươi lịch (nhóm Tìm phòng và gửi khách); Xóa và giữ khi người dùng xóa tài khoản (QD-013, mục "Khi người dùng xóa tài khoản" (US22)).

Trạng thái màn:
- rỗng: tab Căn chưa có căn nào: S6-00 (màn đầu khi chưa có nguồn phòng là A5, thuộc mục "Màn đầu tiên khi chưa có dữ liệu" (US1))
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

### Chi tiết chủ nhà và bỏ nguồn phòng
Rủi ro: cao
Mục đích: sale xem một chủ nhà đã kết nối cho mình xem gì, mình đã bán được bao nhiêu, và bỏ nguồn nếu cần.
Màn hình: S6-04
Khi nào xảy ra: sale chạm tên một chủ nhà trong "Nguồn phòng" (mục "Danh sách căn và nguồn phòng" bước 7).

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở chi tiết | Tên chủ nhà, số điện thoại, "kết nối từ 02/08/2026", nút "Gọi", dòng "✓ Lịch tự cập nhật · lần cuối 2 giờ trước" | với sale: tên, số điện thoại, ngày kết nối, căn được chia sẻ, số đặt phòng đã bán, tiền chênh | Nút "Gọi" mở màn gọi điện (`openPhone`, | Không |
| 2 | Xem quyền | "CHỊ HOA CHO BẠN XEM": Phòng trống hay đã đặt, Giá từng đêm, Tình trạng cọc (dòng này chỉ hiện khi chủ bật) | với sale: tên, số điện thoại, ngày kết nối, căn được chia sẻ, số đặt phòng đã bán, tiền chênh | Không | Không |
| 3 | Xem căn | "CĂN · 2": tên căn, "view biển · 1.800.000đ/đêm" | với sale: tên, số điện thoại, ngày kết nối, căn được chia sẻ, số đặt phòng đã bán, tiền chênh. Đêm chưa đặt giá thì không có giá | Không | Không |
| 4 | Xem kết quả bán | Ô "BẠN ĐÃ BÁN: 12 đặt phòng", "TIỀN CHÊNH: 6.4tr" | với sale: số đặt phòng đã bán và tiền chênh của sale với chủ nhà đó (QT3) | Không | Không |
| 5 | Bấm "Bỏ nguồn phòng này" | Nút đổi thành "Xác nhận bỏ Chị Hoa?" kèm lời nhắc "Bạn không thấy lịch của Chị Hoa nữa. Muốn xem lại phải xin link mới." | Không gọi server | Không | Không |
| 6 | Bấm xác nhận | Bỏ nguồn phòng (màn sau đó: chưa thiết kế) | sale bỏ nguồn | Không | Quan hệ sale và chủ nhà: `ket_noi.trang_thai` sang `sale_bo` |

Theo quy tắc: Bỏ nguồn phải bấm hai lần; Sale chỉ thấy giá khi chủ nhà cho phép (nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale).

Trạng thái màn:
- rỗng: không áp dụng
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: chưa thiết kế (xem CH-074). Chủ nhà đã xóa tài khoản thì không mở được màn này (mục "Danh sách căn và nguồn phòng" bước 10); mở từ chỗ khác thì theo HV5
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

### Thêm căn tự nhập
Rủi ro: tb
Mục đích: sale lưu thông tin một căn của chủ chưa dùng app, để gửi khách và ghi booking.
Màn hình: S6-02
Khi nào xảy ra: sale bấm "Thêm căn tự nhập".

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở màn | Lời giải thích: căn này không có lịch trống, mỗi lần khách hỏi sale gọi chủ; app lưu ảnh, giá và booking đã chốt | Không gọi server | Không | Không |
| 2 | Nhập chủ nhà | "Tên chủ nhà *", "Số điện thoại *". Tên và số chỉ sale này thấy, không chia cho sale khác, chủ nhà hay đội nhóm, không xuất ra file (QD-011) | Không gọi server (lưu ở bước 7) | Không | Không |
| 3 | Nhập căn | "Mã căn *"; "Tòa nhà" (ICON40, À La Carte, Sapphire, + Tòa khác); "Số phòng ngủ *" (Studio, 1PN, 2PN, 3PN, 4PN+); "Loại view" (theo danh sách Loại view ở `Tu_dien.md`); một ô số "Số giường" (theo `Tu_dien.md`), không bắt buộc, không vào dòng "Còn thiếu" | tìm tòa; khi chọn "+ Tòa khác" | Không | Số giường của căn tự nhập |
| 4 | Nhập giá chủ | "Ngày thường", "Cuối tuần". Ghi chú: "Giá chủ báo qua điện thoại. Không bắt buộc. Dùng để điền sẵn khi đặt phòng." | Không gọi server (lưu ở bước 7) | Không | Không |
| 5 | Thêm ảnh | "ẢNH (0)", "Tối đa 12 ảnh", nút "Thêm ảnh" | mỗi lần một ảnh, ngay khi chọn, trả `anh_id` tạm; JPEG, PNG, HEIC tới 15 MB. ở bước 7 nhận `anh_ids` để gắn ảnh vào căn; hơn 12 `anh_ids` thì `DU_LIEU_SAI` | Mở chọn ảnh của Zalo (`chooseImage`, | Ảnh tạm chưa gắn căn, mục 3); gắn vào `anh_can` khi |
| 6 | Thiếu ô bắt buộc | Dòng "Còn thiếu: tên chủ nhà, số điện thoại, mã căn, số phòng ngủ"; nút "Thêm căn" chưa dùng được (?) | Không gọi server. Gọi thiếu ô thì trả `DU_LIEU_SAI` kèm `o` | Không | Không |
| 7 | Bấm "Thêm căn" | Căn xuất hiện trong "CĂN TỰ NHẬP" | chỉ sale tạo, chỉ sale đó đọc (PQ14.SALE); kiểm mã căn, số phòng ngủ; mã trùng thì `MA_CAN_TRUNG` | Không | Căn tự nhập của sale |

Theo quy tắc: Căn tự nhập không có lịch (nhóm Tìm phòng và gửi khách); Căn tự nhập chỉ sale đó thấy; Thông tin chủ căn tự nhập theo QD-011.

Trạng thái màn:
- rỗng: S6-02 lúc mới mở
- đang tải: theo HV1 (lúc tải ảnh)
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: theo HV4, dòng "Chọn ảnh"
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

### Chi tiết căn tự nhập
Rủi ro: tb
Mục đích: sale xem một căn tự nhập, gọi chủ hỏi lịch, và dùng các việc liên quan đến căn này.
Màn hình: S6-03, S6-03-00
Khi nào xảy ra: sale chạm căn tự nhập trong danh sách.

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở chi tiết | Tên căn, tên chủ, số điện thoại che giữa, "chưa dùng app", nút "Gọi hỏi lịch", lời nhắc "Căn này không có lịch trống. Khách hỏi ngày nào, bạn gọi chú Bình hỏi ngày đó." | căn tự nhập có thêm tên, số chủ căn, giá chủ báo. Chỉ sale tạo đọc được | Nút "Gọi" mở màn gọi điện (`openPhone`, | Không |
| 2 | Xem booking đã ghi | "ĐẶT PHÒNG BẠN ĐÃ GHI · 1", "Chỉ bạn thấy", ngày, "Trả chủ 2.800.000đ · Thu khách 3.400.000đ", "+600.000đ". Ghi chú: "Đây là đặt phòng của bạn, không phải lịch của căn. Ngày không có đặt phòng chưa chắc còn trống." | danh sách đặt phòng sale đã ghi của căn tự nhập | Không | Không |
| 3 | Bấm "Gửi cho khách" | Sang gửi khách (mục "Gửi thông tin cho khách qua Zalo" (US14)) với căn này | Không gọi server. Gửi theo mục "Gửi thông tin cho khách qua Zalo" (US14) (| Không | Không |
| 4 | Bấm "Sửa thông tin căn" | Sửa ảnh, giá chủ, số phòng ngủ, tên và số điện thoại chủ căn; xóa được số điện thoại (QD-011) (màn sửa: chưa thiết kế) | ảnh mới qua rồi gửi `anh_ids` theo thứ tự | Không | `can`: cột đã sửa, `sdt_chu_can` trống khi xóa số; `anh_can` |
| 5 | Bấm "Mời chú Bình dùng app" | Chạy mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5) nếu hồ sơ sale chưa có số (mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5)), rồi mời chủ dùng app để thấy lịch thật | Có chạy mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5). Mời chủ căn tự nhập: app mở cửa sổ gửi của Zalo với tin mời chung, chủ căn mở thì vào app như người mới. Ghép căn tự nhập với căn thật của chủ đó: [MỞ: CH-027] | Cửa sổ chia sẻ của Zalo; hộp thoại xin thông tin và số điện thoại khi chạy mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5) | Có chạy mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5): `profiles`: `sdt`, `ten`, `anh_dai_dien`. Không thì Không |
| 6 | Bấm "Xóa căn tự nhập" | Nút đổi thành "Xác nhận xóa Villa Tuần Châu?" kèm "Chỉ xóa khỏi Nguồn phòng của bạn." | Không gọi server | Không | Không |
| 7 | Bấm xác nhận xóa | Xóa căn (màn sau đó: chưa thiết kế) | căn tự nhập thì xóa thật căn và mọi đặt phòng `sale_tu_ghi` của căn | Không | Căn tự nhập và booking đã ghi của nó: xóa dòng `can`, `anh_can`, `booking` `sale_tu_ghi` của căn |
| 8 | Bấm "Đặt phòng" (trước là "Ghi booking đã chốt", Tu_dien) | Sang mục "Ghi booking đã chốt cho căn tự nhập" | Không gọi server | Không | Không |

Theo quy tắc: Căn tự nhập không có lịch (nhóm Tìm phòng và gửi khách); Booking sale tự ghi chỉ sale đó thấy; Xóa phải bấm hai lần (nhóm Booking).

Trạng thái màn:
- rỗng: chưa có booking đã ghi: S6-03-00
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: không áp dụng
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

### Ghi booking đã chốt cho căn tự nhập
Booking của căn tự nhập không theo dõi trạng thái tiền (chưa cọc, đã cọc, đã thanh toán), vì căn này không có chủ nhà trong app.
Rủi ro: cao
Mục đích: sale ghi nhanh một booking đã chốt với chủ nhà qua điện thoại, trong một màn, để tính vào thống kê.
Màn hình: S6-05, S6-06
Khi nào xảy ra: sale bấm "Đặt phòng" ở chi tiết căn tự nhập (S6-03, S6-03-00; Tu_dien).

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở màn | S6-05: tiêu đề "Đặt phòng" (Tu_dien), "Villa Tuần Châu · đã chốt với chú Bình", ngày nhận, số đêm, hai ô tiền | Không gọi server | Không | Không |
| 2 | Chọn ngày nhận | Chip "Hôm nay 07/10", "Mai 08/10", "Ngày khác" | Không gọi server | Không | Không |
| 3 | Chọn số đêm | Nút − và +, dòng khoảng ngày ("08/10 → 09/10 (1 đêm)") | Không gọi server | Không | Không |
| 4 | Xem tiền điền sẵn | "Trả chủ (đ)", "Thu khách (đ)", dòng "Bạn lời 200.000đ". Ghi chú: "Giá điền sẵn từ giá chủ đã lưu và giá bán của bạn. Sửa nếu chú Bình báo giá khác." | Giá theo: căn tự nhập lấy `gia_chu_thuong`, `gia_chu_cuoi_tuan` theo đêm cuối tuần của sale; giá bán cộng `muc_cong`. Giá điền sẵn: trả tổng giá chủ và giá từng đêm | Không | Không |
| 5a | Bấm "Đặt phòng" (Tu_dien) khi có đêm trùng booking đã ghi của chính căn này | Báo trùng, không lưu (QT1.3). Không so với căn tự nhập của sale khác | Kiểm trùng | | |
| 5 | Bấm "Đặt phòng" (trước là "Lưu booking", Tu_dien) | Sang S6-06, danh sách booking có thêm dòng mới, thông báo "Đã lưu đặt phòng 08/10 → 09/10. Tính vào thống kê tháng 10." | với căn tự nhập: `nguon` `sale_tu_ghi`, không trạng thái tiền, chặn trùng trong chính căn đó (QT1.3), trùng thì `TRUNG_LICH` bước 4). Tiền trả chủ ghi ở `tien_phong`, tiền thu khách ghi ở `booking_rieng` | Không | Booking của sale cho căn tự nhập |
| 6 | Muốn thêm cọc, số khách, ghi chú | Ghi chú dưới nút: "thêm sau trong đặt phòng nếu cần" (màn sửa: chưa thiết kế) | Không gọi server (màn sửa chưa thiết kế) | Không | Không |

Theo quy tắc: Chặn trùng trong chính căn tự nhập (QT1.3); Booking sale tự ghi chỉ sale đó thấy; Tiền chênh (QT3); Tiền là số nguyên đồng (CLAUDE.md); Đêm tính từ ngày nhận tới trước ngày trả (CLAUDE.md).

Trạng thái màn:
- rỗng: S6-05 lúc mới mở
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: không áp dụng
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

## Tiêu chí nghiệm thu
Mỗi tiêu chí một test tự động mang đúng mã này trong tên test. Mã không đổi nghĩa; đổi hành vi thì cấp mã mới (docs/QUY_TRINH.md mục 5).

- **US16-NT1** Khi sale có 2 căn của mình và 5 căn trong nguồn phòng, thì nhóm "CĂN CỦA TÔI · 2" nằm trên nhóm "NGUỒN PHÒNG · 5".
- **US16-NT2** Khi căn là căn tự nhập, thì mọi ô ngày ghi "?" ngoại trừ ngày sale đã ghi booking của mình ghi "Bạn". Không ô nào ghi "trống".
- **US16-NT3** Khi sale chọn "Giá tăng dần", thì thứ tự các căn đổi theo giá và nhóm "CĂN CỦA TÔI" vẫn ở trên cùng.
- **US16-NT4** Khi sale có 2 căn của mình, 2 chủ nhà đã kết nối và 1 căn tự nhập, thì thấy ba nhóm với số đếm 2, 2 và 1.
- **US16-NT5** Khi căn là căn tự nhập, thì thẻ ghi "chưa dùng app" và không hiện "Trống hôm nay".
- **US16-NT6** Khi sale bấm "Gửi lời mời qua Zalo", thì mở cửa sổ gửi của Zalo; app không tự gửi tin.
- **US16-NT7** Khi căn của chủ nhà đã kết nối có số giường, thì danh sách căn ở nguồn phòng ghi số phòng ngủ và số giường như thẻ căn (US11-NT1), không có "x khách", "x người lớn" hay "y trẻ em".
- **US16-NT8** Khi Sale Hùng bấm "Bỏ khỏi danh sách" ở dòng Chị Hoa đã xóa tài khoản, thì dòng biến ngay, app không hỏi lại. Chị Hoa mở lại app bằng cùng tài khoản Zalo vẫn thấy dữ liệu cũ của mình (QD-013).
- **US16-NT9** Khi Chị Hoa đã xóa tài khoản và dòng của Chị Hoa còn trong danh sách, thì nhóm "CHỦ NHÀ ĐÃ KẾT NỐI" đếm 1 (chỉ Anh Tuấn), không đếm dòng Chị Hoa.
- **US16-NT10** Khi Sale Hùng chạm ICON40 1509 dưới Chị Hoa ở Nguồn phòng, thì app mở S3 của 1509, không mở S6-07, và màn không có nút "Đặt phòng" (ghi booking thẳng vào lịch) hay "Sửa căn và giá".
- **US16-NT11** Khi Sale Hùng chạm tên Chị Hoa trong nhóm "CHỦ NHÀ ĐÃ KẾT NỐI" ở Nguồn phòng, thì app mở S6-04 của Chị Hoa (chi tiết chủ nhà), không mở S3.
- **US16-NT12** Khi sale chạm Green Bay 0812 trong nhóm "Căn của tôi", thì app mở S6-07 của căn đó với ba việc Đặt phòng, Sửa căn và giá, Gửi cho khách. (Tu_dien) Chỉ đổi mã: dòng này trước mang mã NT4, trùng với dòng số giường.
- **US16-NT13** Khi Chị Hoa đã đặt giá tháng 10 cho 1509 và 3402, thì S6-04 của Sale Hùng hiện giá mỗi đêm của cả hai căn; căn nào chưa đặt giá thì không có giá (QD-007).
- **US16-NT14** Khi sale bấm "Bỏ nguồn phòng này" một lần, thì chưa bỏ gì cả, chỉ hiện nút xác nhận.
- **US16-NT15** Khi sale bấm xác nhận, thì chủ nhà đó biến khỏi "Nguồn phòng" và sale không còn thấy lịch của họ.
- **US16-NT16** Khi còn thiếu một trong bốn ô bắt buộc, thì dòng "Còn thiếu" liệt kê đúng ô thiếu.
- **US16-NT17** Khi sale không nhập giá chủ, thì vẫn thêm được căn.
- **US16-NT18** Khi sale thêm căn xong, thì căn nằm trong nhóm "CĂN TỰ NHẬP" và không có lịch trống.
- **US16-NT19** Khi sale chọn 12 ảnh, thì không chọn thêm được ảnh thứ 13.
- **US16-NT20** Khi Sale Lan mở căn tự nhập của mình, thì không thấy tên và số chủ căn do Sale Hùng nhập cho căn tự nhập của Hùng (QD-011).
- **US16-NT21** Khi sale mở hàng chip "Loại view" ở S6-02, thì thấy đúng các lựa chọn của danh sách Loại view trong `Tu_dien.md`, giống form thêm căn của chủ nhà (mục "Tòa nhà, loại view, số giường, mô tả" (US11)).
- **US16-NT22** Khi sale nhập số giường rồi thêm căn tự nhập, thì thẻ căn tự nhập ghi số phòng ngủ và số giường theo `Tu_dien.md`, mục Phòng ngủ và số giường của căn (ví dụ "2PN · 3 giường").
- **US16-NT23** Khi sale bỏ trống ô số giường, thì vẫn thêm được căn tự nhập và dòng "Còn thiếu" không nhắc số giường.
- **US16-NT24** Khi căn có 1 booking sale đã ghi, thì mục "ĐẶT PHÒNG BẠN ĐÃ GHI · 1" hiện đúng ngày, tiền trả chủ, tiền thu khách và phần chênh.
- **US16-NT25** Khi ngày nào không có booking, thì màn không ghi "trống" cho ngày đó.
- **US16-NT26** Khi sale bấm "Xóa căn tự nhập" một lần, thì chưa xóa, chỉ hiện nút xác nhận.
- **US16-NT27** Khi sale xóa số điện thoại chủ căn rồi lưu, thì server không còn giữ số đó và nút "Gọi hỏi lịch" không dùng được (QD-011).
- **US16-NT28** Khi phần chênh hiện ra, thì bằng tiền thu khách trừ tiền trả chủ (2.800.000đ và 3.400.000đ cho +600.000đ).
- **US16-NT29** Khi sale chọn ngày nhận 08/10 và 1 đêm, thì khoảng ngày ghi "08/10 → 09/10 (1 đêm)".
- **US16-NT30** Khi trả chủ 1.400.000đ và thu khách 1.600.000đ, thì dòng ghi "Bạn lời 200.000đ".
- **US16-NT31** Khi sale bấm "Đặt phòng" ở S6-05, thì S6-06 hiện booking mới trong danh sách và thông báo ghi tháng 10.
- **US16-NT32** Khi sale ghi xong, thì ngày đó vẫn không được coi là "kín" hay "trống" trên lưới lịch (S1); chỉ ô "Bạn" xuất hiện (mục "Lịch phòng 7 ngày").
- **US16-NT33** Khi Sale Hùng đã ghi Villa Tuần Châu 08/10 → 09/10 và ghi tiếp 08/10 → 10/10 cho cùng căn, thì app báo trùng và không lưu (QT1.3-VD1).
- **US16-NT34** Khi Sale Lan ghi căn tự nhập Villa Tuần Châu của Lan cùng ngày với booking của Sale Hùng, thì lưu được (QT1.3-VD2).

## Luật kiểm dữ liệu và lỗi
Mỗi mục là một việc app nhờ database làm. "Đầu vào" là luật kiểm từng ô, "Lỗi riêng" là khi nào phải từ chối. Cột "Mã" là tên gọi trong tài liệu; hàm database báo lỗi bằng một câu tiếng Việt cho người dùng đọc (docs/luat-chung/Nghiep_vu.md mục Lỗi).

### Sale bỏ một nguồn phòng; sale hoặc chủ nhà xóa dòng của người kia đã xóa tài khoản
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| `id` | id | có | |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| `KHONG_TIM_THAY` | Không có dòng; người gọi không thuộc dòng; chủ nhà gọi với dòng có sale chưa xóa tài khoản |
| `KHONG_CON_QUYEN` | Sale gọi với dòng `chu_ngung` |

### Lịch theo ngày của mọi căn sale được xem, chia nhóm, kèm giá
**Đầu vào**
| Trường | Ở đâu (đường dẫn, query, thân) | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|---|
| tu | query | ngay | Không | Mặc định hôm nay theo giờ Việt Nam. Lùi, tiến tự do (mục "Lịch phòng 7 ngày" bước 5) |
| so_ngay | query | số nguyên | Không | Chỉ 7 hoặc 14. Mặc định 7 |
| sap_xep | query | chuỗi | Không | `ten` (mặc định), `gia_tang`, `ban_nhieu` |
| can_id | query | id | Không | Chỉ lấy một căn, cho "Lịch 2 tuần tới" ở S3 (mục "Chi tiết căn và giá bán" (US13) bước 5) |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| DU_LIEU_SAI | `tu` sai định dạng; `so_ngay` khác 7 và 14; `sap_xep` không thuộc ba giá trị (`o` là tên trường) |
| KHONG_TIM_THAY | Có `can_id` mà người gọi không có vai với căn đó |
| KHONG_CON_QUYEN | Có `can_id` của căn mà chủ nhà đã ngừng người gọi (mục Chung) |

## Ai được làm và việc kéo theo
Nguyên liệu chép từ đặc tả máy chủ của bản Zalo, đã đổi tên bảng và mã. Đối chiếu với hàm database ở mục Database khi viết lại story: chỗ nào lệch thì ghi vào "Database đang lệch story". Tên lỗi viết hoa (`KHONG_TIM_THAY`, `DU_LIEU_SAI`) là tên loại lỗi của bản cũ; bản PWA báo bằng câu tiếng Việt.

### Sale bỏ một nguồn phòng; sale hoặc chủ nhà xóa dòng của người kia đã xóa tài khoản
**Ai gọi:**
- Sale của dòng `da_ket_noi`: bỏ nguồn (PQ17.SALE).
- Sale của dòng có chủ nhà đã xóa tài khoản: xóa dòng (PQ23.SALE).
- Chủ nhà của dòng có sale đã xóa tài khoản: xóa dòng (PQ23.CHU,.
- Chủ nhà xóa dòng thêm tay `chua_ket_noi`, hay dòng `chu_ngung`: [MỞ: CH-096]; tới khi có quyết định, `KHONG_TIM_THAY`.
- Sale bỏ dòng `chu_ngung`: [MỞ: US16-H3] PQ17.SALE; tới khi có quyết định, `KHONG_CON_QUYEN`.
- Người khác: `KHONG_TIM_THAY`.

**Việc kéo theo:** Không có thông báo cho chủ nhà khi sale bỏ nguồn (mục "Cài đặt thông báo" (US21) không có loại này). Sau khi bỏ, API lịch của sale không còn căn của chủ nhà đó (US16-NT15). Sale đã bỏ nguồn còn xem lại đặt phòng cũ với chủ nhà đó không: [MỞ: US16-H4] CH-098 (QD-007 chỉ nói sale bị ngừng). Yêu cầu đặt phòng đang chờ của sale với chủ nhà đó: [MỞ: US16-H5] CH-098.

**Chống bấm hai lần:** có.

### Lịch theo ngày của mọi căn sale được xem, chia nhóm, kèm giá
**Ai gọi:** người dùng có tài khoản. Kết quả chỉ gồm căn người gọi có vai `cua_toi`, `tu_nhap`, `nguon_phong` (mục Chung). Không có căn nào thì trả danh sách rỗng, không lỗi (app hiện A5, mục "Lịch phòng 7 ngày" (US16) trạng thái rỗng). Có `can_id` mà không có vai với căn đó: lỗi quyền chung.

**Việc kéo theo:** Không.

**Chống bấm hai lần:** không cần (đọc).

## Màn hình
Hình: `python3 docs/thiet-ke/trich-man.py <mã màn>` (docs/thiet-ke/README.md). Chữ và số trên hình lệch story thì story đúng.

S6, S6-00, S6-02, S6-03, S6-03-00, S6-04, S6-05, S6-06, S6-07, S6-08, S6-P1, S6-P2 (popup xin tên và số dùng phần chung của US5). S1, S1-04 (lưới lịch của sale). A5 (nút "Thêm căn thủ công").

**S1-04 · Sắp xếp**
Vào từ: S1, "Theo tên"

**S1-05 · Lịch phòng, xoay ngang**
Vào từ: S1, bấm nút nổi "Xoay ngang" (không vào bằng cách nghiêng máy)
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Khung ngang 844 × 390 | Nội dung xoay giả 90 độ, không có thanh tab | |
| 2 | Thanh tiêu đề | "Lịch phòng", ô tìm, "‹ 7 ngày tới ›", "Theo tên", nút "Xoay dọc" (cao 44 px) | |
| 3 | Bảng | Như S1, cột tên rộng hơn | Như S1 |
| 4 | Toast khi xoay ngang | Màn xoay giả dùng toast tự vẽ của app, đặt theo vị trí chung tính trên khung ngang: dưới thanh tiêu đề của màn xoay, cách mép 12 px, chữ đọc theo chiều ngang. Không dùng `showToast` của Zalo ở màn này, vì toast Zalo vẫn hiện chiều dọc (zalo-hanh-vi mục 7.1) | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Xoay dọc" | Về chiều dọc | S1 |
| Một căn | Chi tiết căn | S3 |
Trạng thái riêng:
- đang tải: HV1-02
- lỗi mạng: HV2-01
- quay lại từ nền: HV3

**S6-00 · Căn · chưa có căn nào**
Vào từ: Tab Căn của sale
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 0 | Màn gốc | Chép đúng màn S6 trên canvas, chỉ đổi phần trạng thái. | S6 |
| 1 | Giữa màn | "Chưa có căn nào", "Thêm căn của bạn, xin lịch chủ nhà, hoặc tự nhập căn của chủ chưa dùng app." | |
| 2 | Ba nút | "+ Thêm căn của tôi", "Gửi tin nhắn xin lịch cho chủ nhà", "Thêm căn tự nhập" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "+ Thêm căn của tôi" | Thêm căn | CN5-A1 |
| "Gửi tin nhắn xin lịch cho chủ nhà" | Soạn tin | A6 |
| "Thêm căn tự nhập" | Thêm căn tự nhập | S6-02 |
Trạng thái riêng:
- rỗng: chính là màn này

**S6-02 · Thêm căn tự nhập**
Vào từ: S6, "Thêm căn tự nhập"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Chủ nhà | "Tên chủ nhà *", "Số điện thoại *" | Sale nhập |
| 2 | Căn | "Mã căn *", tòa nhà, số phòng ngủ * | Sale nhập |
| 3 | Loại view | Chip theo `Tu_dien.md`, mục Danh sách lựa chọn dùng chung | |
| 4 | Số giường | Ô số "Số giường", không bắt buộc | Căn |
| 5 | Thanh dưới | "Còn thiếu: tên chủ nhà, số điện thoại, mã căn, số phòng ngủ", nút "Thêm căn" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Thêm căn" | Lưu căn tự nhập | S6-03 |

**S6-03-00 · Căn tự nhập · chưa ghi booking**
Vào từ: S6, chạm căn tự nhập
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 0 | Màn gốc | Chép đúng màn S6-03 trên canvas, chỉ đổi phần trạng thái. "Đặt phòng bạn đã ghi · 0", thẻ "Chưa có đặt phòng nào cho căn này" thay cho dòng booking | S6-03 |
| 1 | Thẻ chủ | "Chú Bình · chưa dùng app", câu không có lịch trống | |
| 2 | Mục | "Đặt phòng bạn đã ghi · 0", "Chưa có đặt phòng nào cho căn này", câu hướng dẫn | |
| 3 | Nút | "Đặt phòng" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Nút | Ghi booking nhanh | S6-05 |
Trạng thái riêng:
- rỗng: chính là màn này

**S6-04 · Chi tiết chủ nhà**
Vào từ: S6, chạm chủ nhà

**S6-05 · Ghi booking nhanh · một màn**
Vào từ: S6-03; S6-03-00; S6-06
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Tiêu đề | "Villa Tuần Châu" | Canvas |
| 2 | Khối nội dung | "Đặt phòng Villa Tuần Châu · đã chốt với chú Bình" | Canvas |
| 3 | Khối nội dung | "Ngày nhận Hôm nay 07/10 Mai 08/10 Ngày khác" | Canvas |
| 4 | Khối nội dung | "Số đêm 08/10 → 09/10 (1 đêm) − 1 +" | Canvas |
| 5 | Khối nội dung | "Trả chủ (đ) Thu khách (đ) Bạn lời 200.000đ · Giá điền sẵn từ giá chủ đã lưu và giá bán của bạn. Sửa nếu chú Bình báo giá khác." | Canvas |
| 6 | Khối nội dung | "Đặt phòng" | Canvas |
| 7 | Khối nội dung | "Cọc, số khách, ghi chú: thêm sau trong đặt phòng nếu cần." | Canvas |
| 8 | Cỡ chữ, vùng bấm | Chữ tối thiểu 14 px, vùng bấm tối thiểu 44 px | CLAUDE.md |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Nút quay lại" | Quay lại màn trước | |
| "Đặt phòng" | Mở màn S6-06 | S6-06 |
| "Hôm nay 07/10" | Theo YC, canvas chưa nối mũi tên | |
| "Mai 08/10" | Theo YC, canvas chưa nối mũi tên | |
| "Ngày khác" | Theo YC, canvas chưa nối mũi tên | |
| "−" | Theo YC, canvas chưa nối mũi tên | |
| "+" | Theo YC, canvas chưa nối mũi tên | |
Trạng thái riêng:
- rỗng: chưa thiết kế
- không có quyền: chưa thiết kế

**S6-06 · Đã ghi, tính vào thống kê**
Vào từ: S6-05, bấm lưu
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Toast | Dấu ✓, "Đã lưu đặt phòng 08/10 → 09/10. Tính vào thống kê tháng 10." | Đặt phòng V2 (DLM.6) |
| 2 | Vị trí toast | Toast chung: nổi trên nội dung, cách mép trái, phải 12 px, đỉnh cách đỉnh màn 108 px (ngay dưới thanh tiêu đề và cụm ··· ✕ của Zalo), nền tối, chữ trắng 14 px đậm, bo góc vừa. Mọi màn có toast dùng đúng chỗ này | |
| 3 | Toast | Một kiểu: dấu ✓, chữ đậm, không có nút ✕, tự tắt sau 3 giây | |

**S6-07 · Chi tiết căn của tôi**
Vào từ: S6, chạm một căn trong nhóm "Căn của tôi".
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Thanh tiêu đề | Nút quay lại, "Green Bay 0812" | |
| 2 | Ảnh căn | Ảnh đầu tiên | Ảnh căn |
| 3 | Thẻ căn | "Green Bay 0812", nhãn "Căn của tôi", "2PN · view biển", "Bạn tự ghi lịch và giá cho căn này, như chủ nhà." | Căn của sale |
| 4 | Lịch 7 ngày | "7 ngày tới · giá đêm của bạn", 7 ô: ngày, thứ, giá hoặc "Kín" (750k, Kín, Kín, 900k, 750k, 750k, 750k) | Lịch và giá của căn, số lấy từ S1 |
| 5 | Danh sách việc | "Đặt phòng / Khách đã chốt cho căn này", "Sửa căn và giá / Ảnh, thông tin, giá theo tháng", "Gửi cho khách / Ảnh, thông tin và giá bán" | Cố định |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Quay lại | Về S6 | S6 |
| "Đặt phòng" | Ghi đặt phòng như chủ nhà | CN4 |
| "Sửa căn và giá" | Sửa căn và giá như chủ nhà | CN5-02 |
| "Gửi cho khách" | Soạn gửi khách | S5 |
Trạng thái riêng:
- đang tải: chưa thiết kế
- lỗi mạng: chưa thiết kế
- không có quyền: chưa thiết kế
- quay lại từ nền: chưa thiết kế

**S6-08 · Nguồn phòng · chủ nhà đã xóa tài khoản**
Vào từ: Tab Căn của sale, sau khi chủ nhà xóa tài khoản; P13-01, chạm dòng "Chị Hoa đã xóa tài khoản"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Màn gốc | Chép đúng S6 | S6 |
| 2 | Nhóm "Chủ nhà đã kết nối · 1" | Số đếm không tính chủ nhà đã xóa | Kết nối còn dùng được |
| 3 | Dòng chủ nhà đã xóa | Chữ cái đầu xám, "Chị Hoa" kèm nhãn "đã xóa tài khoản", "Căn và lịch không còn trên app". Không có danh sách căn, không có "Cập nhật … trước", không có nút gọi, không có mũi tên mở | Sự kiện xóa tài khoản (QD-013) |
| 4 | Nút | "Bỏ khỏi danh sách" (cao 44 px), không hỏi lại | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Bỏ khỏi danh sách" | Dòng biến mất khỏi Nguồn phòng | S6 |
| Dòng chủ nhà đã xóa | Không mở gì | |
Trạng thái riêng:
- không có quyền: theo HV5

**S6-P1 · Mời chủ căn · giải thích xin tên và số**
Vào từ: S6, bấm việc cần tên và số khi hồ sơ chưa có số
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Màn gốc | Chép đúng S6, phủ lớp tối | S6 |
| 2 | Popup dưới đáy | Biểu tượng điện thoại, tiêu đề "Chia sẻ tên và số điện thoại với chủ nhà", lý do, bước "Zalo sẽ hiện hộp thoại. Bật Tên và ảnh đại diện, Số điện thoại rồi bấm Cho phép." | mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5) Sửa r4 |
| 3 | Nút | "Đồng ý, tiếp tục", "Để sau", dòng "Để sau vẫn … được" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Đồng ý, tiếp tục" | Mở hộp thoại Zalo | S6-P2 |
| "Để sau" | Làm tiếp việc gốc không có số | S6 |

**S6-P2 · Mời chủ căn · hộp thoại Zalo**
Vào từ: S6-P1, bấm "Đồng ý, tiếp tục"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Màn gốc | Chép đúng S6, phủ lớp tối | S6 |
| 2 | Hộp thoại minh họa | "Tên và ảnh đại diện · Sale Hùng", "Số điện thoại · 0912 345 678", nút "Cho phép" | Zalo |
| 3 | Ghi chú | Ghi chú trên màn: Zalo hiện một hộp thoại có hai dòng hay hai hộp thoại nối nhau, thứ tự nào: chờ | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Cho phép" | Lưu tên, ảnh, số vào hồ sơ, làm tiếp việc gốc | S6 |

## Quyền
Ô quyền theo `docs/luat-chung/PQ.md`. Mỗi ô phải có test chứng minh người không có quyền thì không đọc, không ghi được; test ở lớp database (`tests/db/`).

Ô PQ chạm tới (ma trận `docs/luat-chung/PQ.md`): PQ14.SALE, PQ14.CHU, PQ13.SALE, PQ13.CHU, PQ3.SALE, PQ7.SALE, PQ4.SALE, PQ5.SALE, PQ11.SALE, PQ1.SALE, PQ2.SALE, PQ17.SALE, PQ23.SALE. Test vi phạm phải có (viết ở US16-TA10):
- PQ14.SALE: sale B đọc, sửa, xóa căn tự nhập của sale A, hoặc ghi đặt phòng vào đó, thì bị từ chối và dữ liệu không đổi; của sale B không liệt kê căn đó; sale B không thấy đặt phòng `sale_tu_ghi` của sale A.
- PQ14.CHU: chủ nhà gọi hay với căn tự nhập của sale thì bị từ chối; chủ nhà gọi với `loai: "tu_nhap"` thì bị từ chối (mã lỗi: [MỞ: US16-H1]).
- PQ13.SALE, PQ13.CHU: sale khác đọc căn của tôi của sale A thì bị từ chối.
- PQ3.SALE, PQ7.SALE: sale gọi vào căn của chủ nhà đã kết nối thì bị từ chối (chỉ gửi yêu cầu); sale sửa hay xóa căn của chủ nhà thì bị từ chối.
- PQ17.SALE, PQ1.SALE, PQ2.SALE: sale A gọi hay với dòng của sale B thì bị từ chối; số điện thoại chủ nhà chỉ trả cho sale đã kết nối.
- PQ23.SALE: dòng chủ nhà đã xóa tài khoản không trả căn, lịch, giá; của dòng đó bị từ chối; xóa dòng được.
- Không có phiên: mọi API trên bị từ chối.

## Database
Đã có trong `supabase/migrations/` và đã chạy test. Tham số và cột: `docs/tu-sinh/Bang_va_cot.md`.

- `fn_tao_can`: test ở t_01_phan_quyen.sql, t_03_chan_trung.sql, t_07_can_gia_mo_rong.sql, t_08_thong_bao.sql, t_11_ket_noi_quan_tri.sql
- `fn_sua_can`: test ở t_07_can_gia_mo_rong.sql
- `fn_sale_ghi_tu_nhap`: test ở t_03_chan_trung.sql, t_09_sale_doc.sql, t_10_thong_ke.sql
- `fn_sale_sua_tu_nhap`: CHƯA có test, viết test trước khi dùng
- `fn_sale_xoa_tu_nhap`: CHƯA có test, viết test trước khi dùng
- `fn_sale_bo_nguon`: test ở t_11_ket_noi_quan_tri.sql

## Ngoài phạm vi
- Chủ nhà đã xóa tài khoản (US22-NT10, NT6): US22. US16 chỉ làm phần bỏ dòng và số đếm (US16-NT8, NT8).
- Lịch 7 ngày của căn chủ nhà chia sẻ, nút xoay ngang (US6-NT12, NT5): US6.
- Chi tiết căn S3 và gửi khách (mục "Chi tiết căn và giá bán" (US13), mục "Gửi thông tin cho khách qua Zalo" (US14)): US13, US14. Nút "Gửi cho khách" chỉ mở màn đó.
- Link xin lịch, A6, A7 (mục "Sale xin chủ nhà cho xem lịch" (US17)): US17.
- Ghép căn tự nhập với căn thật khi chủ căn vào app: [MỞ: US16-H2] chưa có, mục "Danh sách căn và nguồn phòng" bước 4, mục "Chi tiết căn tự nhập" bước 5. US này chỉ mở cửa sổ chia sẻ của Zalo (US16-NT6).
- Sửa, xóa đặt phòng sale đã ghi: chưa có màn (CH-076), chưa US nào.
- Danh sách đặt phòng và thống kê của sale (nhóm Thống kê): US19.

## Việc cần làm
- [ ] Đọc story này và các luật chung nó trỏ tới. Chỗ nào gắn thẻ MỞ thì không code, hỏi Tùng (docs/Cau_hoi_mo.md).
- [ ] Viết test cho từng tiêu chí chưa có test, test đỏ trước (lớp test: docs/QUY_TRINH.md mục 6).
- [ ] Database: soát các hàm ở mục Database với tiêu chí; thiếu thì thêm migration mới và một dòng trong `scripts/thu-lam-hong.sh`.
- [ ] Giao diện: các màn ở mục Màn hình, nối với Supabase (docs/Ghi_chu_code.md).
- [ ] E2E cho luồng chính của story.
- [ ] Kiểm tay theo `tests/kich-ban/US16.md` trên điện thoại thật.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md` trong cùng PR.
