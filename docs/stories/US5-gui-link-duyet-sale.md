# US5 · Chủ nhà mời sale bằng link, quản lý sale và cho số điện thoại

- Loại: tính năng
- Trạng thái: chưa làm
- Bản: 1
- Rủi ro: cao
- Làm sau khi xong: US1, US3
- Kiểm tay: `tests/kich-ban/US5.md` (17 kịch bản)

## Mục tiêu
Là chủ nhà, tôi muốn gửi link mời cho sale qua Zalo, thấy ai đã kết nối và ngừng cho xem khi cần, để sale tự tra ngày trống mà không gọi tôi.

## Hành vi
Bảng bước ghi: người dùng làm gì, app hiện gì (chữ trong ngoặc kép là chữ trên màn), máy chủ phải làm gì, dữ liệu nào đổi. Cột "Máy chủ" mô tả việc phải xảy ra; bản PWA làm bằng RLS, view và hàm `fn_*` của Supabase.

### Xin tên và số điện thoại khi bắt đầu kết nối
> **Bản PWA:** popup giải thích và nút "Để sau" (mục "Xin tên và số điện thoại khi bắt đầu kết nối") giữ nguyên. Hộp thoại cấp quyền của Zalo (mục "Hộp thoại cấp quyền của Zalo") và "số từ Zalo" (mục "Số điện thoại hiện trong hồ sơ") đổi theo cách đăng nhập ở CH-001. Xem `PWA.md` mục P2.
Rủi ro: cao
Mục đích: app lấy tên và số điện thoại từ Zalo để chủ nhà và sale nhận ra nhau, mà không ép người dùng cấp quyền ngay lúc vào app.
Màn hình: A6-P1, A6-P2, A8-P1, A8-P2, CN10-P1, CN10-P2, P2; popup và hộp thoại cho A10, CN7, CN9, S6, S6-03, S3-02 và nút "Gửi cho khách" chưa vẽ
Khi nào xảy ra: mọi việc bắt đầu chia sẻ, chấp thuận hoặc kết nối, khi hồ sơ chưa có số (mục "Xin tên và số điện thoại khi bắt đầu kết nối").
- Bắt đầu chia sẻ: sale bấm "Gửi qua Zalo" hoặc "Sao chép tin nhắn" ở A6 (vào A6 từ A5, A7 hay P4); chủ nhà bấm "Gửi lịch qua Zalo" ở CN10; chủ nhà bấm "Gửi link mời qua Zalo", "Sao chép link" hoặc "Nhắc lại" ở CN7, CN7-00; sale mời chủ căn tự nhập dùng app ("Gửi lời mời qua Zalo" ở S6, "Mời chú Bình dùng app" ở S6-03, mục "Danh sách căn và nguồn phòng" (US16), mục "Chi tiết căn tự nhập" (US16)).
- Chấp thuận: chủ nhà bấm "Đồng ý cho xem lịch" ở A8; sale bấm "Thêm lịch" ở A10; chủ nhà bấm "Chấp nhận đặt phòng" ở CN9 (mục "Chủ nhà nhận và trả lời yêu cầu" (US15)).
- Gửi cho người khác: sale bấm "Gửi yêu cầu đặt phòng" ở S3-02 (mục "Sale gửi yêu cầu đặt phòng" (US15) bước 3); sale bấm "Gửi cho khách" ở S3, S2, S6-03 hoặc S6-07, trước khi mở S5 (mục "Gửi thông tin cho khách qua Zalo" (US14) bước 0). mục "Xin tên và số điện thoại khi bắt đầu kết nối"), A8-P1 (chủ nhà), CN10-P1 (chủ nhà)

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Bấm nút ở màn gốc | Hiện popup dưới đáy: biểu tượng điện thoại, tiêu đề "Chia sẻ số điện thoại với chủ nhà" (sale) hoặc "với sale" (chủ nhà), 1 đoạn lý do, khung "Zalo sẽ hiện hộp thoại. Bật Số điện thoại rồi bấm Cho phép." | Không gọi server | Không | Không |
| 2 | Bấm "Đồng ý, tiếp tục" | Sang hộp thoại Zalo (mục "Hộp thoại cấp quyền của Zalo") | Không gọi server | Hiện hộp thoại xin quyền (mục "Hộp thoại cấp quyền của Zalo") | Không |
| 3 | Bấm "Để sau" | Làm tiếp việc gốc mà không có số: A6 sang A7, A8 về CN7 của chủ nhà kèm toast theo HV8, CN10 sang CN10-02. Dòng ghi chú: bên kia chỉ thấy tên Zalo | Không gọi; việc gốc gọi API của nó như khi có số | Không | `profiles.sdt` vẫn trống; dữ liệu của việc gốc theo mục của việc đó |

Trạng thái màn:
- rỗng: không áp dụng
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: không áp dụng
- từ chối quyền: xem mục "Hộp thoại cấp quyền của Zalo"
- quay lại từ nền: theo HV3
- mở từ link: A8-P1 mở từ link xin lịch của sale; các màn khác không áp dụng

### Hộp thoại cấp quyền của Zalo
Rủi ro: cao
Màn hình: A6-P2, A8-P2, CN10-P2 (cả ba đều là hình minh họa, có nhãn "Hộp thoại do Zalo hiển thị, app không tự vẽ")

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Bấm "Đồng ý, tiếp tục" ở popup | Xin cả tên và ảnh Zalo và số điện thoại trong lần bấm này, không xin tên ở bước riêng (mục "Xin tên và số điện thoại khi bắt đầu kết nối" lần bốn) | Không gọi server | Hiện hộp thoại: "Lịch phòng Hạ Long muốn sử dụng thông tin của bạn", dòng Số điện thoại kèm công tắc, nút "Cho phép". Tên và số ra một hộp thoại hay hai, thứ tự nào: chờ | Không |
| 2 | Bật công tắc, bấm "Cho phép" | Nhận tên và số, làm tiếp việc gốc: A6-P2 sang A7, A8-P2 về CN7 của chủ nhà kèm toast theo HV8, CN10-P2 sang CN10-02 | đổi token số điện thoại với Zalo bằng access token và App Secret, trong 2 phút, mỗi token một lần; token đã dùng hoặc quá hạn thì `TOKEN_SDT_HET_HAN`, không ghi gì | Trả tên, ảnh và token số điện thoại cho app; server đổi token ra số | Tên và số điện thoại lưu vào hồ sơ |

Trạng thái màn:
- rỗng: không áp dụng
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: không áp dụng
- từ chối quyền: theo HV4
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

### Số điện thoại hiện trong hồ sơ
Rủi ro: cao
Màn hình: P2

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở Cá nhân > Thông tin cá nhân | Ô Số điện thoại chỉ xem, có nhãn "Từ Zalo ✓" | hồ sơ của người gọi | Không | Không |
| 2 | Chưa có số | Ô ghi "Chưa có · Zalo sẽ hỏi khi bạn kết nối lần đầu" | `sdt` trống | Không | Không |

Trạng thái màn:
- rỗng: ô ghi "Chưa có · Zalo sẽ hỏi khi bạn kết nối lần đầu"
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: dùng chung dòng "Chưa có"; chưa có nút xin lại
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

### Chủ nhà quản lý danh sách sale
Rủi ro: cao
Mục đích: chủ nhà thấy ai đã kết nối, nhắc người chưa mở link, thêm sale chưa dùng app, và ngừng cho một sale xem lịch.
Màn hình: CN7, CN7-00, CN7-01, CN7-04, CN7-05 (S9 đã bỏ, QD-005;, F16)
Khi nào xảy ra: chủ nhà mở tab Sale.

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở tab Sale | CN7: nút "Gửi link mời qua Zalo", nút "Sao chép link", nhóm "Đã kết nối · 3" (tên, trạng thái, số tiền), nhóm "Chưa kết nối · 1" | hai nhóm Đã kết nối, Chưa kết nối, mỗi dòng tên hiển thị, trạng thái, tổng tiền đặt phòng của sale | Không | Không |
| 1a | Bấm "Gửi link mời qua Zalo" hoặc "Sao chép link" (CN7, CN7-00) | Chạy mục "Xin tên và số điện thoại khi bắt đầu kết nối" nếu hồ sơ chưa có số (mục "Xin tên và số điện thoại khi bắt đầu kết nối"), rồi mở cửa sổ gửi của Zalo hoặc sao chép link | trả link mời đang dùng nếu còn hạn, không thì tạo mới; tăng `so_lan_gui`, ghi `gui_cuoi_luc` khi mở cửa sổ gửi hoặc sao chép | Cửa sổ gửi tin của Zalo | `link_moi` loại `moi_sale` mới khi chưa có hoặc hết hạn; `so_lan_gui`, `gui_cuoi_luc` |
| 2 | Chưa có sale nào | CN7-00: "Chưa có sale nào xem lịch", cùng hai nút gửi link, khung "Sale sẽ thấy: Phòng trống hay đã đặt; Giá từng đêm; Không thấy tên, số điện thoại khách và doanh thu" | cả hai nhóm rỗng | Không | Không |
| 3 | Bấm "Nhắc lại" ở sale chưa kết nối | Chạy mục "Xin tên và số điện thoại khi bắt đầu kết nối" nếu hồ sơ chưa có số (mục "Xin tên và số điện thoại khi bắt đầu kết nối"). Kết quả sau đó chưa vẽ (?) | [MỞ: CH-011] | Hộp thoại quyền khi chạy mục "Xin tên và số điện thoại khi bắt đầu kết nối"; phần sau chưa vẽ | [MỞ: CH-011] |
| 4 | Bấm nút "Thêm sale" | CN7-05: ô Tên sale *, Số điện thoại *, nút "Lưu sale" | thêm tay, `chua_ket_noi`, `chu_them_tay` | Không | Thêm sale vào nhóm Chưa kết nối |
| 5 | Bấm một sale đã kết nối | CN7-04: tên, số điện thoại, ngày kết nối, nút "Gọi", danh sách booking của sale (trạng thái, số tiền) | tên, số điện thoại nếu sale đã cho, ngày kết nối, đặt phòng của sale với chủ nhà này | Nút "Gọi" mở màn gọi điện (`openPhone`, | Không |
| 6 | Bấm "Ngừng cho xem lịch" | Hỏi xác nhận "Xác nhận ngừng cho Sale Hùng xem? Đặt phòng cũ vẫn giữ. Sale không thấy lịch của bạn nữa." | Không gửi lịch, căn, giá của chủ nhà này cho sale nữa; vẫn gửi đặt phòng cũ của sale | Thông báo cho sale (mục "Cài đặt thông báo" (US21)) | Sale mất quyền xem lịch, vẫn xem lại đặt phòng cũ của mình (QD-007) |
| 7 | Một sale đã kết nối xóa tài khoản (mục "Khi người dùng xóa tài khoản" (US22)) | Booking đã nhận từ sale đó vẫn ở trong lịch, vẫn chặn trùng (QD-013). Sale đó còn một dòng ở CN7: tên cũ kèm ghi chú nhỏ đỏ "Đã xoá tài khoản", không số điện thoại, không nút "Gọi", không chạm vào xem được; chủ nhà bỏ được dòng đó. Chủ nhà không nhận thông báo riêng (QD-013). Trong lúc sale đó đã xóa tài khoản, chủ nhà không chia lịch, không đổi quyền xem cho sale đó (QD-013). Sale đó cho lại tên và số điện thoại thì dòng trở lại như trước, hết ghi chú, kết nối tự nối lại, không phải mời lại (QD-013). | Gửi tên kèm cờ đã xóa tài khoản, không gửi số điện thoại của sale đã xóa tài khoản | | Không đổi dữ liệu mới. Cột `ket_noi` ghi theo Thiet_ke_DB (CN7-01, US22-NT3) |

Theo quy tắc: Nhóm kết nối; Ngừng cho xem; Quyền sale được xem.

Trạng thái màn:
- rỗng: CN7-00
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

## Phần của story khác mà story này làm một lát
Bảng bước của các mục dưới đây nằm ở story chủ của mục đó. Story này chỉ làm các tiêu chí được liệt kê ở mục Tiêu chí nghiệm thu.

- mục "Người đặt, tiền phòng và tiền cọc" (US3) · Người đặt, tiền phòng và tiền cọc: bảng bước ở US3. Story này làm NT3.

## Tiêu chí nghiệm thu
Mỗi tiêu chí một test tự động mang đúng mã này trong tên test. Mã không đổi nghĩa; đổi hành vi thì cấp mã mới (docs/QUY_TRINH.md mục 5).

- **US5-NT1** Khi hồ sơ chưa có số điện thoại và người dùng bấm một nút ở danh sách "Khi nào xảy ra" của mục "Xin tên và số điện thoại khi bắt đầu kết nối" (A6, A8, A10, CN7, CN7-00, CN9, CN10, S6, S6-03, S3-02, "Gửi cho khách"), thì popup giải thích hiện trước hộp thoại của Zalo.
- **US5-NT2** Khi hồ sơ đã có số điện thoại, thì popup không hiện và việc gốc chạy tiếp.
- **US5-NT3** Khi người dùng bấm "Để sau", thì việc gốc vẫn hoàn tất và hồ sơ vẫn chưa có số.
- **US5-NT4** Khi chủ nhà bấm "Để sau" ở A8-P1, thì app về CN7 của chủ nhà, có toast, và không mở A9 (màn của sale).
- **US5-NT5** Khi người dùng cho phép cả tên và số điện thoại, thì app làm tiếp việc gốc, tên Zalo và số xuất hiện ở P2, và người dùng chỉ bấm "Đồng ý, tiếp tục" một lần. (mục "Xin tên và số điện thoại khi bắt đầu kết nối")
- **US5-NT6** Khi người dùng đã cho phép một lần, thì các lần sau không hiện lại popup (A6-P2 ghi "Lần sau không hỏi lại").
- **US5-NT7** Khi hồ sơ có số lấy từ Zalo, thì P2 hiện số đó ở dạng chỉ xem. Theo quy tắc: Số điện thoại từ Zalo, chỉ xem.
- **US5-NT8** Khi hồ sơ chưa có số, thì P2 hiện dòng "Chưa có · Zalo sẽ hỏi khi bạn kết nối lần đầu".
- **US5-NT9** Khi chủ nhà thêm sale ở CN7-05 với tên và số điện thoại, thì sale đó hiện trong nhóm "Chưa kết nối" của CN7.
- **US5-NT10** Khi chủ nhà xác nhận "Ngừng cho xem lịch", thì sale đó không còn thấy lịch và các booking cũ của sale vẫn còn.
- **US5-NT11** Khi chủ nhà chưa có sale nào, thì tab Sale hiện CN7-00.
- **US5-NT12** Khi hồ sơ chủ nhà chưa có số điện thoại và chủ nhà bấm "Gửi link mời qua Zalo" ở CN7, thì popup giải thích xin tên và số hiện trước; bấm "Để sau" thì Zalo vẫn mở cửa sổ gửi link. (mục "Xin tên và số điện thoại khi bắt đầu kết nối")
- **US5-NT13** Khi chủ nhà chọn một sale đã kết nối làm người đặt, thì booking hiện tên sale đó trong lịch và trong danh sách booking của sale (CN7-04). Booking này coi như booking của sale đó (mục "Booking chủ nhà ghi cho sale" (US28)).

## Luật kiểm dữ liệu và lỗi
Mỗi mục là một việc app nhờ database làm. "Đầu vào" là luật kiểm từng ô, "Lỗi riêng" là khi nào phải từ chối. Cột "Mã" là tên gọi trong tài liệu; hàm database báo lỗi bằng một câu tiếng Việt cho người dùng đọc (docs/luat-chung/Nghiep_vu.md mục Lỗi).

### Chủ nhà thu hồi link mời hoặc link gửi lịch của mình
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| `ma` | text 22 ký tự | có | Link của người gọi, loại `moi_sale` hoặc `gui_lich` |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| `KHONG_TIM_THAY` | Mã không có, link không phải của người gọi, hoặc link loại `xin_lich` |

### Chủ nhà thêm tay một sale chưa dùng app
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| `ten` | text 1 đến 100 ký tự sau khi bỏ khoảng trắng hai đầu | có | Ô "Tên sale *". Lưu vào `ten_sale_nhap` |
| `sdt` | text | có | Ô "Số điện thoại *". 10 chữ số, bắt đầu bằng 0, sau khi bỏ khoảng trắng, dấu chấm, gạch. Lưu vào `sdt_sale_nhap` |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| `DU_LIEU_SAI` | Thiếu tên hoặc số; tên quá 100 ký tự; số sai định dạng. `o` là tên trường |
Cùng chủ nhà đã có dòng với cùng số điện thoại (thêm tay hoặc sale đã kết nối có số đó): [MỞ: CH-009]. Tới khi có quyết định, server không chặn.

### Chi tiết một kết nối
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| `id` | id | có | |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| `KHONG_TIM_THAY` | Không có dòng, hoặc người gọi không phải chủ nhà hay sale của dòng |
| `KHONG_CON_QUYEN` | Các trường hợp ở mục Ai gọi, kèm `ly_do` |

### Chủ nhà ngừng cho một sale xem lịch
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| `id` | id | có | Dòng của người gọi, `trang_thai` `da_ket_noi` |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| `KHONG_TIM_THAY` | Không có dòng, hoặc người gọi không phải chủ nhà của dòng |
| `TRANG_THAI_DA_DOI` | Dòng không phải `da_ket_noi` và không phải `chu_ngung` (ví dụ sale vừa bỏ nguồn, hoặc dòng thêm tay). Ngừng sale đã xóa tài khoản: [MỞ: US5-H1]. Dòng đã `chu_ngung`: trả kết quả như lần đầu, không ghi lần hai |

## Luật chung dùng
Nguyên văn ở `docs/luat-chung/` (QT.md, HV.md, Nghiep_vu.md, Tu_dien.md), tìm theo mã hoặc tên.

Quy tắc trong nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale: Xin số điện thoại đúng lúc, Số điện thoại từ Zalo chỉ xem, Nhận ra nhau bằng số điện thoại, Nhóm kết nối, Ngừng cho xem, Quyền sale được xem (bản này mọi sale dùng quyền mặc định: giá bật, cọc bật, đặt phòng của sale khác tắt). HV1 đến HV5, HV8.

## Màn hình
Hình: `python3 docs/thiet-ke/trich-man.py <mã màn>` (docs/thiet-ke/README.md). Chữ và số trên hình lệch story thì story đúng.

CN7, CN7-00, CN7-04, CN7-05, A8-P1 và A8-P2 (popup và hộp thoại Zalo dùng chung cho chủ nhà), P2 (ô số điện thoại), CN4 (chip sale đã kết nối).

**A6-P1 · Popup giải thích · sale**
Vào từ: A6; HV4-02
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Tiêu đề | "Xin chủ nhà cho xem lịch" | Canvas |
| 2 | Khối nội dung | "Chia sẻ tên và số điện thoại với chủ nhà" | Canvas |
| 3 | Khối nội dung | "Chủ nhà nhận ra bạn qua tên và số điện thoại khi mở link xin lịch. Home247 lấy tên, ảnh và số từ Zalo trong một lần, lưu vào hồ sơ của bạn. Khách không bao giờ thấy số này." | Canvas |
| 4 | Khối nội dung | "2 Zalo sẽ hiện hộp thoại. Bật Tên và ảnh đại diện, Số điện thoại rồi bấm Cho phép." | Canvas |
| 5 | Khối nội dung | "Đồng ý, tiếp tục" | Canvas |
| 6 | Khối nội dung | "Để sau" | Canvas |
| 7 | Khối nội dung | "Để sau vẫn gửi được tin. Chủ nhà chưa thấy tên và số của bạn." | Canvas |
| 8 | Cỡ chữ, vùng bấm | Chữ tối thiểu 14 px, vùng bấm tối thiểu 44 px | CLAUDE.md |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Nút quay lại" | Quay lại màn trước | |
| "Đồng ý, tiếp tục" | Mở màn A6-P2 | A6-P2 |
| "Để sau" | Mở màn A7 | A7 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- không có quyền: chưa thiết kế

**A6-P2 · Hộp thoại của Zalo (minh họa)**
Vào từ: A6-P1
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Tiêu đề | "Xin chủ nhà cho xem lịch" | Canvas |
| 2 | Ghi chú thiết kế | "MINH HỌA · Hộp thoại do Zalo hiển thị, app không tự vẽ" | Canvas |
| 3 | Khối nội dung | "🏠 Lịch phòng Hạ Long muốn sử dụng thông tin của bạn" | Canvas |
| 4 | Khối nội dung | "Tên và ảnh đại diện Sale Hùng" | Canvas |
| 5 | Khối nội dung | "Số điện thoại 0912 345 678" | Canvas |
| 6 | Khối nội dung | "Bạn có thể thay đổi quyền này trong phần cài đặt quyền của app." | Canvas |
| 7 | Ghi chú thiết kế | "Ghi chú thiết kế: Zalo hiện một hộp thoại có hai dòng như hình, hay hai hộp thoại nối nhau, thứ tự nào: chờ." | Canvas |
| 8 | Khối nội dung | "Cho phép" | Canvas |
| 9 | Cỡ chữ, vùng bấm | Chữ tối thiểu 14 px, vùng bấm tối thiểu 44 px | CLAUDE.md |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Nút quay lại" | Quay lại màn trước | |
| "Cho phép" | Mở màn A7 | A7 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- không có quyền: chưa thiết kế

**A8-P1 · Popup giải thích · chủ nhà**
Vào từ: A8
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Tiêu đề | "Lời mời xem lịch" | Canvas |
| 2 | Khối nội dung | "Chia sẻ tên và số điện thoại với sale" | Canvas |
| 3 | Khối nội dung | "Sale nhận ra bạn qua tên và số điện thoại trong Nguồn phòng của họ. Home247 lấy tên, ảnh và số từ Zalo trong một lần, lưu vào hồ sơ của bạn. Khách không bao giờ thấy số này." | Canvas |
| 4 | Khối nội dung | "2 Zalo sẽ hiện hộp thoại. Bật Tên và ảnh đại diện, Số điện thoại rồi bấm Cho phép." | Canvas |
| 5 | Khối nội dung | "Đồng ý, tiếp tục" | Canvas |
| 6 | Khối nội dung | "Để sau" | Canvas |
| 7 | Khối nội dung | "Để sau vẫn cho sale xem lịch được. Sale chưa thấy tên và số của bạn." | Canvas |
| 8 | Cỡ chữ, vùng bấm | Chữ tối thiểu 14 px, vùng bấm tối thiểu 44 px | CLAUDE.md |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Đồng ý, tiếp tục" | Mở màn A8-P2 | A8-P2 |
| "Để sau" | Mở màn CN7-06 | CN7-06 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- không có quyền: chưa thiết kế

**A8-P2 · Hộp thoại của Zalo (minh họa)**
Vào từ: A8-P1
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Tiêu đề | "Lời mời xem lịch" | Canvas |
| 2 | Ghi chú thiết kế | "MINH HỌA · Hộp thoại do Zalo hiển thị, app không tự vẽ" | Canvas |
| 3 | Khối nội dung | "🏠 Lịch phòng Hạ Long muốn sử dụng thông tin của bạn" | Canvas |
| 4 | Khối nội dung | "Tên và ảnh đại diện Nguyễn Hoa" | Canvas |
| 5 | Khối nội dung | "Số điện thoại 0904 118 772" | Canvas |
| 6 | Khối nội dung | "Bạn có thể thay đổi quyền này trong phần cài đặt quyền của app." | Canvas |
| 7 | Ghi chú thiết kế | "Ghi chú thiết kế: Zalo hiện một hộp thoại có hai dòng như hình, hay hai hộp thoại nối nhau, thứ tự nào: chờ." | Canvas |
| 8 | Khối nội dung | "Cho phép" | Canvas |
| 9 | Cỡ chữ, vùng bấm | Chữ tối thiểu 14 px, vùng bấm tối thiểu 44 px | CLAUDE.md |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Cho phép" | Mở màn CN7-06 | CN7-06 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- không có quyền: chưa thiết kế

**CN10-P1 · Popup giải thích · lần đầu chia sẻ lịch**
Vào từ: CN10; CN10-00; CN10-01
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Tiêu đề | "Gửi lịch cho sale" | Canvas |
| 2 | Khối nội dung | "Chia sẻ tên và số điện thoại với sale" | Canvas |
| 3 | Khối nội dung | "Sale nhận ra bạn qua tên và số điện thoại trong Nguồn phòng của họ. Home247 lấy tên, ảnh và số từ Zalo trong một lần, lưu vào hồ sơ của bạn. Khách không bao giờ thấy số này." | Canvas |
| 4 | Khối nội dung | "2 Zalo sẽ hiện hộp thoại. Bật Tên và ảnh đại diện, Số điện thoại rồi bấm Cho phép." | Canvas |
| 5 | Khối nội dung | "Đồng ý, tiếp tục" | Canvas |
| 6 | Khối nội dung | "Để sau" | Canvas |
| 7 | Khối nội dung | "Để sau vẫn gửi lịch được. Sale chưa thấy tên và số của bạn." | Canvas |
| 8 | Cỡ chữ, vùng bấm | Chữ tối thiểu 14 px, vùng bấm tối thiểu 44 px | CLAUDE.md |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Nút quay lại" | Quay lại màn trước | |
| "Đồng ý, tiếp tục" | Mở màn CN10-P2 | CN10-P2 |
| "Để sau" | Mở màn CN10-02 | CN10-02 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- không có quyền: chưa thiết kế

**CN10-P2 · Hộp thoại của Zalo (minh họa)**
Vào từ: CN10-P1
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Tiêu đề | "Gửi lịch cho sale" | Canvas |
| 2 | Ghi chú thiết kế | "MINH HỌA · Hộp thoại do Zalo hiển thị, app không tự vẽ" | Canvas |
| 3 | Khối nội dung | "🏠 Lịch phòng Hạ Long muốn sử dụng thông tin của bạn" | Canvas |
| 4 | Khối nội dung | "Tên và ảnh đại diện Nguyễn Hoa" | Canvas |
| 5 | Khối nội dung | "Số điện thoại 0904 118 772" | Canvas |
| 6 | Khối nội dung | "Bạn có thể thay đổi quyền này trong phần cài đặt quyền của app." | Canvas |
| 7 | Ghi chú thiết kế | "Ghi chú thiết kế: Zalo hiện một hộp thoại có hai dòng như hình, hay hai hộp thoại nối nhau, thứ tự nào: chờ." | Canvas |
| 8 | Khối nội dung | "Cho phép" | Canvas |
| 9 | Cỡ chữ, vùng bấm | Chữ tối thiểu 14 px, vùng bấm tối thiểu 44 px | CLAUDE.md |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Nút quay lại" | Quay lại màn trước | |
| "Cho phép" | Mở màn CN10-02 | CN10-02 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- không có quyền: chưa thiết kế

**CN7-00 · Sale · chưa có sale nào**
Vào từ: Xem YC (canvas chưa có mũi tên tới màn này)
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Tiêu đề | "Sale" | Canvas |
| 2 | Khối nội dung | "Chưa có sale nào xem lịch Gửi link cho sale qua Zalo. Sale mở link là thấy ngày trống, không cần gọi hỏi bạn. Gửi link mời qua Zalo Sao chép link" | Canvas |
| 3 | Khối nội dung | "SALE SẼ THẤY Phòng trống hay đã đặt, không thấy tên người đặt · Giá từng đêm · Đã cọc hay chưa, không có số tiền (bạn tắt được) · Không thấy: tên, số điện thoại khách và doanh thu" | Canvas. Canvas còn ghi "(bạn tắt được)" sau "Giá từng đêm": bỏ, vì không có công tắc giá (QD-007) |
| 4 | Thanh tab | Lịch · Căn · Sale · Thống kê · Cá nhân | Cố định |
| 5 | Cỡ chữ, vùng bấm | Chữ tối thiểu 14 px, vùng bấm tối thiểu 44 px | CLAUDE.md |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Gửi link mời qua Zalo" | Theo YC, canvas chưa nối mũi tên | |
| "Sao chép link" | Theo YC, canvas chưa nối mũi tên | |
Trạng thái riêng:
- rỗng: chưa thiết kế
- không có quyền: chưa thiết kế

**CN7-01 · Sale của tôi · sale đã xóa tài khoản**
Vào từ: Tab Sale của chủ nhà, sau khi sale xóa tài khoản
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Màn gốc | Chép đúng CN7 | CN7 |
| 2 | Nhóm "Đã kết nối · 2" | Không đếm sale đã xóa | |
| 3 | Dòng sale đã xóa | Chữ cái đầu xám, "Sale Hùng" kèm nhãn "đã xóa tài khoản", "Đặt phòng đã nhận từ sale này vẫn giữ trong lịch". Không có số tiền, không chạm mở được | QD-013 |
| 4 | Nút | "Bỏ khỏi danh sách" 44 px, không hỏi lại | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Bỏ khỏi danh sách" | Dòng biến mất | CN7 |
| Dòng sale đã xóa | Không mở gì | |
Trạng thái riêng:
- không có quyền: theo HV5

**CN7-04 · Chi tiết một sale**
Vào từ: CN7, chạm một sale
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Đầu thẻ | "Sale Hùng", "0912 345 678 · kết nối từ 02/08/2026", nút "Gọi" | Sale |
| 2 | Số tháng | "Đặt phòng tháng 10 8", "Doanh thu tháng 10 14.2tr" | Đặt phòng của sale |
| 3 | Đặt phòng của sale này | "1509 · 10/10 → 12/10 · 4 khách · đã chốt · 2.200.000đ"; "1509 · 17/10 → 19/10 · Chờ bạn"; "3402 · 30/10 → 01/11 · 2.200.000đ" | Đặt phòng |
| 4 | Nút | "Ngừng cho xem lịch" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Ngừng cho xem lịch" | Hỏi xác nhận | CN7-05 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- đang tải: chưa thiết kế (HV1)
- lỗi mạng: chưa thiết kế (HV2)
- quay lại từ nền: chưa thiết kế (HV3)

**CN7-05 · Thêm sale thủ công**
Vào từ: CN7; CN7-01; CN7-06; CN7-P1; CN7-P2
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Tiêu đề | "Thêm sale Tên sale * Số điện thoại * Sale nằm ở nhóm Chưa kết nối cho tới khi mở link mời. Bạn vẫn gửi lịch cho sale qua số điện thoại này được. Lưu sale" | Canvas |
| 2 | Cỡ chữ, vùng bấm | Chữ tối thiểu 14 px, vùng bấm tối thiểu 44 px | CLAUDE.md |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Nút quay lại" | Quay lại màn trước | |
| "Lưu sale" | Mở màn CN7 | CN7 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- không có quyền: chưa thiết kế

**CN7-06 · Sale của tôi · vừa cho sale xem lịch**
Vào từ: A8-P1, bấm "Để sau"; A8-P2, bấm "Cho phép"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Màn gốc | Chép CN7 | CN7 |
| 2 | Toast | "✓ Đã cho Sale Hùng xem lịch. Sale Hùng nằm trong nhóm Đã kết nối", tự ẩn theo HV8 | HV8 |
| 3 | Nhóm Đã kết nối | "Đã kết nối · 4", có Sale Hùng | Kết nối của chủ nhà |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Một sale | Chi tiết sale | CN7-04 |

**CN7-P1 · Mời sale · giải thích xin tên và số**
Vào từ: CN7, bấm việc cần tên và số khi hồ sơ chưa có số
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Màn gốc | Chép đúng CN7, phủ lớp tối | CN7 |
| 2 | Popup dưới đáy | Biểu tượng điện thoại, tiêu đề "Chia sẻ tên và số điện thoại với sale", lý do, bước "Zalo sẽ hiện hộp thoại. Bật Tên và ảnh đại diện, Số điện thoại rồi bấm Cho phép." | mục "Xin tên và số điện thoại khi bắt đầu kết nối" Sửa r4 |
| 3 | Nút | "Đồng ý, tiếp tục", "Để sau", dòng "Để sau vẫn … được" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Đồng ý, tiếp tục" | Mở hộp thoại Zalo | CN7-P2 |
| "Để sau" | Làm tiếp việc gốc không có số | CN7 |

**CN7-P2 · Mời sale · hộp thoại Zalo**
Vào từ: CN7-P1, bấm "Đồng ý, tiếp tục"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Màn gốc | Chép đúng CN7, phủ lớp tối | CN7 |
| 2 | Hộp thoại minh họa | "Tên và ảnh đại diện · Nguyễn Hoa", "Số điện thoại · 0904 118 772", nút "Cho phép" | Zalo |
| 3 | Ghi chú | Ghi chú trên màn: Zalo hiện một hộp thoại có hai dòng hay hai hộp thoại nối nhau, thứ tự nào: chờ | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Cho phép" | Lưu tên, ảnh, số vào hồ sơ, làm tiếp việc gốc | CN7 |

**CN7 · Sale của tôi**
Vào từ: A8; CN7-05; CN7-P1; CN7-P2
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Tiêu đề | "Sale" | Canvas |
| 2 | Khối nội dung | "Mời sale xem lịch Sale mở link là thấy phòng trống và giá của bạn, không cần gọi hỏi. Gửi link mời qua Zalo Sao chép link" | Canvas |
| 3 | Khối nội dung | "ĐÃ KẾT NỐI · 4" | Canvas |
| 4 | Khối nội dung | "H Sale Hùng 2 đặt phòng tháng này · 4 đêm 4.000.000đ L Sale Lan 2 đặt phòng · 1 chưa cọc 3.500.000đ M Sale Minh 2 đặt phòng · đã thanh toán 1.700.000đ N Sale Nga Chưa có đặt phòng tháng này 0đ" | Canvas |
| 5 | Khối nội dung | "CHƯA KẾT NỐI · 1 Q Sale Quân 0912 345 488 · Đã mời hôm qua, chưa mở link Nhắc lại Thêm sale Thêm tên và số điện thoại của sale chưa dùng app. Sale vào nhóm Chưa kết nối cho tới khi mở link." | Canvas |
| 6 | Thanh tab | Lịch · Căn · Sale · Thống kê · Cá nhân | Cố định |
| 7 | Cỡ chữ, vùng bấm | Chữ tối thiểu 14 px, vùng bấm tối thiểu 44 px | CLAUDE.md |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "H Sale Hùng 2 đặt phòng tháng này · 4 đêm 4.000.000đ" | Mở màn CN7-04 | CN7-04 |
| "L Sale Lan 2 đặt phòng · 1 chưa cọc 3.500.000đ" | Mở màn CN7-04 | CN7-04 |
| "M Sale Minh 2 đặt phòng · đã thanh toán 1.700.000đ" | Mở màn CN7-04 | CN7-04 |
| "N Sale Nga Chưa có đặt phòng tháng này 0đ" | Mở màn CN7-04 | CN7-04 |
| "Thêm sale" | Mở màn CN7-05 | CN7-05 |
| "Gửi link mời qua Zalo" | Theo YC, canvas chưa nối mũi tên | |
| "Sao chép link" | Theo YC, canvas chưa nối mũi tên | |
| "Nhắc lại" | Theo YC, canvas chưa nối mũi tên | |
Trạng thái riêng:
- rỗng: chưa thiết kế
- không có quyền: chưa thiết kế

**CN9 · Yêu cầu đặt phòng · chờ trả lời**
Vào từ: CN9-00 "Xem và chấp nhận"; CN1-03 "Xem và trả lời"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Thẻ sale | "Sale Hùng", "đã bán 12 đặt phòng của bạn", nút "Gọi" | Sale |
| 2 | Chi tiết | Phòng 1509, Ngày ở 17/10 → 19/10 (2 đêm), Giá của bạn 2.200.000đ, "SALE NHẮN" | Yêu cầu |
| 3 | Cảnh báo trùng | "⚠️ Trùng 18/10 với yêu cầu của Sale Lan. Chấp nhận yêu cầu này thì yêu cầu của Sale Lan bị từ chối và Sale Lan được báo." | Yêu cầu trùng đêm |
| 4 | Nút | "Chấp nhận đặt phòng", "Từ chối"; bấm "Từ chối" hiện chip lý do (Đã có khách đặt, Đang sửa phòng, Lý do khác) và nút "Gửi từ chối cho sale", "Quay lại" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Chấp nhận đặt phòng" | Thành booking | CN9-02 |
| "Gửi từ chối cho sale" | Yêu cầu thành Bị từ chối | CN9-03 |
Trạng thái riêng:
- đang tải: chưa thiết kế (HV1)
- lỗi mạng: chưa thiết kế (HV2)
- không có quyền: chưa thiết kế (HV5)
- quay lại từ nền: chưa thiết kế (HV3)
- mở từ link: mở đúng yêu cầu từ thông báo

**P2 · Thông tin cá nhân**
Vào từ: P1, P4: "Thông tin cá nhân"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Ảnh đại diện | Chữ cái đầu, "Đổi ảnh đại diện" | Hồ sơ |
| 2 | Họ và tên, Tên hiển thị | Hai ô nhập, "Sale thấy tên này trong Nguồn phòng." | Hồ sơ |
| 3 | Số điện thoại | "0904 118 772", nhãn "Từ Zalo ✓", câu giải thích | Zalo |
| 4 | Đăng nhập | "Zalo · Nguyễn Hoa", "Đã liên kết ✓" | Zalo |
| 5 | Nút | "Lưu thay đổi" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Đổi ảnh đại diện" | Chọn ảnh (HV4 nếu bị từ chối quyền) | P2 |
| "Lưu thay đổi" | Lưu | P1 |
Trạng thái riêng:
- không có quyền: theo HV5

**S3-02 · Đặt phòng**
Vào từ: S3, bấm "Đặt phòng"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Thẻ căn | "ICON40 1509 · 2PN", "Chị Hoa · 10/10 → 12/10 (2 đêm)" | Yêu cầu |
| 2 | Hai giá | "Giá bán cho khách 2.600.000đ", "Giá chủ nhà 2.200.000đ" | Yêu cầu, giá sale |
| 3 | Bảng đặt phòng | "Đặt phòng", "ICON40 1509 · 10/10 → 12/10", "Chủ nhà: Chị Hoa · 2.200.000đ" | Yêu cầu |
| 4 | Ô nhập | "Nhắn chủ nhà (không bắt buộc)" | |
| 5 | Nút | "Gửi yêu cầu đặt phòng" | |
| 6 | Ghi chú | "Chủ nhà nhận yêu cầu trong app. Thành đặt phòng khi chủ nhà chấp nhận." | Cố định |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Gửi yêu cầu đặt phòng" | Còn trống thì tạo yêu cầu | S3-03 |
| "Gửi yêu cầu đặt phòng" khi đêm đã có booking | Báo lỗi, không tạo yêu cầu | S3-07 |
Trạng thái riêng:
- đang tải: chưa thiết kế (HV1)
- lỗi mạng: chưa thiết kế (HV2)
- không có quyền: chưa thiết kế (HV5)
- quay lại từ nền: chưa thiết kế (HV3)

**S6-03 · Chi tiết căn tự nhập**
Vào từ: Xem YC (canvas chưa có mũi tên tới màn này)
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Tiêu đề | "Villa Tuần Châu" | Canvas |
| 2 | Khối nội dung | "B Chú Bình 0904 *** 330 · chưa dùng app Gọi hỏi lịch Căn này không có lịch trống. Khách hỏi ngày nào, bạn gọi chú Bình hỏi ngày đó." | Canvas |
| 3 | Khối nội dung | "ĐẶT PHÒNG BẠN ĐÃ GHI · 1 Chỉ bạn thấy" | Canvas |
| 4 | Khối nội dung | "01/11 → 03/11 (2 đêm) Trả chủ 2.800.000đ · Thu khách 3.400.000đ +600.000đ" | Canvas |
| 5 | Khối nội dung | "Đây là đặt phòng của bạn, không phải lịch của căn. Ngày không có đặt phòng chưa chắc còn trống." | Canvas |
| 6 | Khối nội dung | "CĂN NÀY Gửi cho khách Ảnh và thông tin, giá bán của bạn Sửa thông tin căn Ảnh, giá chủ, số phòng ngủ Mời chú Bình dùng app Khi đó bạn thấy lịch trống thật, không cần gọi" | Canvas |
| 7 | Khối nội dung | "Xóa căn tự nhập" | Canvas |
| 8 | Khối nội dung | "Đặt phòng" | Canvas |
| 9 | Cỡ chữ, vùng bấm | Chữ tối thiểu 14 px, vùng bấm tối thiểu 44 px | CLAUDE.md |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Nút quay lại" | Quay lại màn trước | |
| "Đặt phòng" | Mở màn S6-05 | S6-05 |
| "Gọi hỏi lịch" | Theo YC, canvas chưa nối mũi tên | |
| "Xóa căn tự nhập" | Theo YC, canvas chưa nối mũi tên | |
Trạng thái riêng:
- rỗng: chưa thiết kế
- không có quyền: chưa thiết kế

**S6 · Nguồn phòng và căn của tôi**
Vào từ: Tab "Căn" trên thanh tab của sale.
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Thanh tiêu đề | "Nguồn phòng", tab "Căn" | Cố định |
| 2 | Nhóm Căn của tôi | "Căn của tôi · 2", nút "+ Thêm căn", hàng "Green Bay 0812 / 2PN · view biển / Trống hôm nay ✓", "Mường Thanh 1605 / 1PN · view biển / Có khách 12/10" | Căn của sale |
| 3 | Nhóm Chủ nhà đã kết nối | "Chủ nhà đã kết nối · 2", mỗi chủ nhà kèm các căn | Kết nối của sale |
| 4 | Nhóm Căn tự nhập | "Căn tự nhập · 1", "Villa Tuần Châu" | Căn tự nhập |
| 5 | Gợi ý mời | "Mời chú Bình dùng app...", nút "Gửi lời mời qua Zalo" | Cố định |
| 6 | Nút | "Thêm căn tự nhập" | |
| 7 | Thanh tab | Lịch, Căn, Thống kê, Cá nhân. Không còn tab "Sale" (QD-005) | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "+ Thêm căn" | Thêm căn của mình theo luồng chủ nhà | CN5-A1 |
| Một căn của tôi | Mở chi tiết căn của tôi | S6-07 |
| Tên chủ nhà (hàng đầu thẻ) | Chi tiết chủ nhà | S6-04 |
| Một căn dưới chủ nhà đã kết nối | Chi tiết căn của sale | S3 |
| Căn tự nhập | Chi tiết căn tự nhập | S6-03 |
| "Thêm căn tự nhập" | Thêm căn tự nhập | S6-02 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- đang tải: chưa thiết kế
- lỗi mạng: chưa thiết kế
- không có quyền: chưa thiết kế
- quay lại từ nền: chưa thiết kế

## Quyền
Ô quyền theo `docs/luat-chung/PQ.md`. Mỗi ô phải có test chứng minh người không có quyền thì không đọc, không ghi được; test ở lớp database (`tests/db/`).

Ô PQ chạm tới (ma trận `docs/luat-chung/PQ.md`): PQ2.CHU, PQ2.SALE, PQ4.SALE, PQ4.LINK, PQ17.CHU. Test vi phạm phải có: sale đã bị ngừng gọi API lịch; sale chưa kết nối gọi API lịch; chủ nhà A ngừng sale của chủ nhà B; gửi token số điện thoại đã dùng hoặc quá 2 phút tới server.

## Database
Đã có trong `supabase/migrations/` và đã chạy test. Tham số và cột: `docs/tu-sinh/Bang_va_cot.md`.

- `fn_tao_link_moi`: test ở t_06_link_moi.sql
- `fn_lay_link_moi`: CHƯA có test, viết test trước khi dùng
- `fn_dem_gui_link`: CHƯA có test, viết test trước khi dùng
- `fn_thu_hoi_link_moi`: test ở t_06_link_moi.sql
- `fn_chu_ngung_sale`: test ở t_02_gia.sql, t_08_thong_bao.sql, t_09_sale_doc.sql
- `fn_chu_doi_quyen_sale`: test ở t_11_ket_noi_quan_tri.sql
- `fn_chu_them_sale_tay`: test ở t_11_ket_noi_quan_tri.sql
- `fn_chu_xoa_sale_tay`: test ở t_11_ket_noi_quan_tri.sql
- `fn_cap_nhat_ho_so`: test ở t_02_gia.sql, t_11_ket_noi_quan_tri.sql

## Ngoài phạm vi
- Sale mở link và bấm "Thêm lịch" (mục "Mở app từ link mời của chủ nhà" (US6)): US6.
- Sale xin lịch, chủ nhà duyệt ở A8 và chọn quyền (mục "Sale xin chủ nhà cho xem lịch" (US17), mục "Chủ nhà duyệt lời mời xem lịch" (US17)), thông báo kết nối (mục "Thông báo kết quả kết nối cho sale" (US17)): US17.
- Chủ nhà chọn căn và sale để gửi lịch ở CN10 (mục "Chủ nhà chủ động gửi lịch cho sale" (US26)): US26.
- Sale đã xóa tài khoản (US22-NT3): US22.
- "Nhắc lại" ở CN7: chưa thiết kế (mục "Chủ nhà quản lý danh sách sale" bước 3), không làm.

## Việc cần làm
- [ ] Đọc story này và các luật chung nó trỏ tới. Chỗ nào gắn thẻ MỞ thì không code, hỏi Tùng (docs/Cau_hoi_mo.md).
- [ ] Viết test cho từng tiêu chí chưa có test, test đỏ trước (lớp test: docs/QUY_TRINH.md mục 6).
- [ ] Database: soát các hàm ở mục Database với tiêu chí; thiếu thì thêm migration mới và một dòng trong `scripts/thu-lam-hong.sh`.
- [ ] Giao diện: các màn ở mục Màn hình, nối với Supabase (docs/Ghi_chu_code.md).
- [ ] E2E cho luồng chính của story.
- [ ] Kiểm tay theo `tests/kich-ban/US5.md` trên điện thoại thật.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md` trong cùng PR.
