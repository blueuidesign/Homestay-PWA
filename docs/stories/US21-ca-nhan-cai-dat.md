# US21 · Cá nhân, hồ sơ, cài đặt, giờ nhận trả, đăng xuất

- Loại: tính năng
- Trạng thái: chờ code
- Đặc tả: thô (lắp bằng máy từ bản Zalo, chưa viết lại theo khuôn, chưa áp các quyết định ở `docs/tham-khao/Loi_Tung_ban_Zalo.md`; không code theo bản này, xem US41)
- Bản: 1
- Rủi ro: cao
- Làm sau khi xong: US1, US17
- Kiểm tay: `tests/kich-ban/US21.md` (30 kịch bản)

## Mục tiêu
Là chủ nhà hoặc sale, tôi muốn sửa tên hiển thị, chỉnh các cài đặt của mình và đăng xuất ở một chỗ, để người khác thấy đúng tên tôi, app báo đúng việc tôi cần và giờ nhận, trả phòng đúng ý tôi.

## Hành vi
Bảng bước ghi: người dùng làm gì, app hiện gì (chữ trong ngoặc kép là chữ trên màn), máy chủ phải làm gì, dữ liệu nào đổi. Cột "Máy chủ" mô tả việc phải xảy ra; bản PWA làm bằng RLS, view và hàm `fn_*` của Supabase.

### Tài khoản đăng nhập và đăng xuất
> **Bản PWA:** dòng "Đăng nhập bằng Zalo · Đã liên kết" thay bằng cách đăng nhập đang dùng (CH-001). Đăng xuất phải xác nhận, dữ liệu giữ nguyên. Xem `PWA.md` mục P1.
Rủi ro: tb
Mục đích: người dùng thấy tài khoản Zalo đang liên kết và thoát khỏi app khi cần.
Màn hình: P1, P2, P4 (chỉ các dòng liên quan)
Khi nào xảy ra: người dùng mở tab Cá nhân.

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở Cá nhân | Dòng "Đăng nhập bằng Zalo · Đã liên kết" trong mục Tài khoản | Không gọi server riêng cho dòng này; có phiên là đã liên kết | Không | Không |
| 2 | Mở Thông tin cá nhân | P2: dòng "Đăng nhập Zalo · Nguyễn Hoa / Dùng để đăng nhập trên máy khác / Đã liên kết ✓" | hồ sơ của người gọi | Không | Không |
| 3 | Bấm "Đăng xuất" | Hỏi lại "Xác nhận đăng xuất? Dữ liệu vẫn giữ nguyên. Lần sau đăng nhập lại bằng Zalo." Bấm lần hai mới đăng xuất | ghi lúc đăng xuất, phiên không dùng được nữa | Không | Phiên đăng nhập kết thúc: `phien_dang_nhap.dang_xuat_luc` |

Trạng thái màn:
- rỗng: không áp dụng
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: không áp dụng
- từ chối quyền: theo HV4
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

### Menu tài khoản (tab Cá nhân)
Rủi ro: thap
Mục đích: người dùng thấy mình đang đăng nhập là ai, với vai trò gì, và đi tới mọi cài đặt từ một chỗ.
Màn hình: P1, P4
Khi nào xảy ra: người dùng mở tab Cá nhân.

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở tab Cá nhân | Đầu trang: chữ cái đầu hoặc ảnh, tên, số điện thoại và vai trò ("Chủ nhà" hoặc "Sale") | hồ sơ của người gọi | Không | Không |
| 2 | Xem nhóm "TÀI KHOẢN" | Dòng "Thông báo" kèm số chưa đọc; dòng "Thông tin cá nhân"; dòng "Đăng nhập bằng Zalo · Đã liên kết" | số chưa đọc | Không | Không |
| 3 | Xem nhóm cài đặt của chủ nhà (P1) | "CÀI ĐẶT": Cài đặt thông báo ("3 loại đang bật"), Giờ nhận, trả phòng mặc định ("14:00 · 12:00"), Ngày tính giá cuối tuần ("T6, T7") | cài đặt thông báo, giờ nhận trả, đêm cuối tuần | Không | Không |
| 4 | Xem nhóm dữ liệu của chủ nhà (P1) | "DỮ LIỆU": Xuất file Excel (CSV). Không có dòng "Tải file sao lưu" vì mục "Sao lưu và khôi phục dữ liệu" (US40) On Hold | Không gọi server | Không | Không |
| 5 | Xem nhóm bán phòng của sale (P4) | "BÁN PHÒNG": Đội nhóm, Link xin xem lịch ("Gửi chủ nhà"), Mức cộng giá mặc định ("+400k"), Mẫu tin gửi khách | mức cộng mặc định, mẫu tin gửi khách | Không | Không |
| 6 | Xem nhóm cài đặt của sale (P4) | "CÀI ĐẶT": Cài đặt thông báo | cài đặt thông báo | Không | Không |
| 7 | Xem nhóm hỗ trợ | "HỖ TRỢ": Hướng dẫn sử dụng, Nhắn Zalo cho Home247 | Không gọi server | Không | Không |
| 8 | Xem cuối trang | Nút "Đăng xuất", dòng "Home247 · phiên bản 1.0" | Không gọi server | Không | Không |
| 9 | Chạm một dòng | Mở màn tương ứng (bảng dưới) | Không gọi server. Màn được mở gọi API của nó | Không | Không |

Dòng và nơi mô tả:
| Dòng trên menu | Thuộc yêu cầu |
|---|---|
| Thông báo | mục "Thông báo kết quả kết nối cho sale" (US17) |
| Thông tin cá nhân | mục "Hồ sơ (Thông tin cá nhân)" |
| Đăng nhập bằng Zalo, Đăng xuất | mục "Tài khoản đăng nhập và đăng xuất" |
| Cài đặt thông báo | mục "Cài đặt thông báo" |
| Giờ nhận, trả phòng mặc định | mục "Giờ nhận, trả phòng mặc định" |
| Ngày tính giá cuối tuần | mục "Ngày tính giá cuối tuần" (US4) |
| Xuất file Excel (CSV) | mục "Xuất file Excel (CSV)" (US22) |
| Đội nhóm | mục "Vào mục Đội nhóm khi chưa có nhóm" (US20) |
| Link xin xem lịch, Gửi chủ nhà | mục "Sale xin chủ nhà cho xem lịch" (US17) |
| Mức cộng giá mặc định | mục "Mức cộng giá mặc định" (US13) |
| Mẫu tin gửi khách | mục "Mẫu tin gửi khách" (US14) |
| Hướng dẫn sử dụng, Nhắn Zalo cho Home247 | mục "Hướng dẫn sử dụng và nhắn Zalo cho Home247" (US22) |

Theo quy tắc: Menu theo vai trò.

Trạng thái màn:
- rỗng: không áp dụng
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: không áp dụng (mỗi vai trò chỉ thấy menu của mình)
- từ chối quyền: theo HV4, dòng "Tên và ảnh Zalo"; xem mục "Hồ sơ (Thông tin cá nhân)"
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

### Hồ sơ (Thông tin cá nhân)
Rủi ro: tb
Mục đích: người dùng xem và sửa cách người khác thấy mình, và biết số điện thoại, tài khoản Zalo đang gắn.
Màn hình: P2
Khi nào xảy ra: người dùng chạm "Thông tin cá nhân" trên menu.

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở hồ sơ | Ảnh hoặc chữ cái đầu, nút "Đổi ảnh đại diện" | hồ sơ của người gọi. Ảnh trả đường dẫn có chữ ký | Không | Không |
| 2 | Xem tên | Ô "Họ và tên" và ô "Tên hiển thị" kèm ghi chú "Sale thấy tên này trong Nguồn phòng." | Không gọi server (dùng kết quả ở bước 1) | Không | Không |
| 3 | Sửa tên hiển thị | Nhập tên mới | Không gọi server (chưa lưu) | Không | Không |
| 4 | Xem số điện thoại | Số lấy từ Zalo, nhãn "Từ Zalo ✓", chỉ xem (theo mục "Số điện thoại hiện trong hồ sơ" (US5)) | Không gọi server (dùng kết quả ở bước 1). Số chỉ server ghi, không nhận từ app | Không | Không |
| 5 | Xem tài khoản Zalo | "ĐĂNG NHẬP": "Zalo · Nguyễn Hoa", "Dùng để đăng nhập trên máy khác", "Đã liên kết ✓" (theo mục "Tài khoản đăng nhập và đăng xuất") | Không gọi server (dùng kết quả ở bước 1) | Không | Không |
| 6 | Bấm "Đổi ảnh đại diện" | Chọn ảnh mới (màn chọn: chưa thiết kế) | tải một ảnh, trả `anh_id` tạm | Mở chọn ảnh của Zalo (`chooseImage`); quyền ảnh do Zalo hỏi | Ảnh đại diện |
| 7 | Bấm "Lưu thay đổi" | Lưu tên hiển thị và ảnh | tên hiển thị;: gắn `anh_id` tạm làm ảnh đại diện | Không | Hồ sơ |

Theo quy tắc: Số điện thoại từ Zalo, chỉ xem (nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale); Tên hiển thị.

Trạng thái màn:
- rỗng: chưa có số điện thoại thì ô ghi "Chưa có · Zalo sẽ hỏi khi bạn kết nối lần đầu" (mục "Số điện thoại hiện trong hồ sơ" (US5))
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: người dùng từ chối quyền tên, ảnh thì tự gõ tên ở đây; ảnh hiện chữ cái đầu (theo docs/zalo/rang-buoc.md, mục 2.3). Màn riêng: chưa thiết kế
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

### Cài đặt thông báo
Rủi ro: thap
Mục đích: người dùng chọn loại việc nào được báo trong app. Bản đầu chỉ báo trong app, không gửi thông báo qua Zalo (mục "Cài đặt thông báo").
Màn hình: P3 (chủ nhà), P12 (sale)
Khi nào xảy ra: người dùng chạm "Cài đặt thông báo".

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở màn | Dòng nói thông báo hiện trong app (chữ theo màn P3), không có chữ "gửi qua Zalo", và nhóm "BÁO CHO TÔI KHI" | cài đặt thông báo (`cai_dat_thong_bao`) | Không | Không |
| 2 | Xem loại của chủ nhà (P3) | Sale đặt phòng mới ("Tên sale, căn và ngày ở"); Sale xin xem lịch ("Để bạn đồng ý hoặc từ chối"); Đặt phòng chưa cọc ("Khi còn 3 ngày đến ngày nhận phòng"). Không có loại "Khách nhận phòng ngày mai" (mục "Cài đặt thông báo") | Không gọi server (dùng kết quả ở bước 1) | Không | Không |
| 3 | Xem loại của sale (P12) | Chủ nhà đồng ý cho xem lịch ("Căn mới vào Nguồn phòng"); Căn bạn đã gửi khách vừa có người đặt ("Để báo khách chọn căn khác", cách báo theo mục "Cài đặt thông báo", mục "Gửi thông tin cho khách qua Zalo" (US14)); Chủ nhà xác nhận đặt phòng của bạn ("Kèm ngày ở và tiền cọc"); Chủ nhà ghi đặt phòng cho bạn (mục "Cài đặt thông báo", mục "Booking chủ nhà ghi cho sale" (US3); dòng mô tả chưa vẽ). Không có loại "Khách của bạn nhận phòng ngày mai" (mục "Cài đặt thông báo") | Không gọi server (dùng kết quả ở bước 1) | Không | Không |
| 4 | Bật hoặc tắt một loại | Công tắc đổi trạng thái. Không xin quyền Zalo nào (mục "Cài đặt thông báo") | Không gọi server (lưu ở bước 5) | Không | Cài đặt thông báo |
| 5 | Bấm "Lưu thay đổi" | Lưu | cài đặt thông báo. Loại đã tắt thì server không ghi `thong_bao` loại đó | Không | Cài đặt thông báo |

Theo quy tắc: Thông báo trong app (mục "Thông báo kết quả kết nối cho sale" (US17), mục "Cài đặt thông báo").

Trạng thái màn:
- rỗng: không áp dụng
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: không áp dụng (bản đầu không xin quyền gửi thông báo Zalo, mục "Cài đặt thông báo")
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

### Giờ nhận, trả phòng mặc định
Rủi ro: tb
Mục đích: chủ nhà đặt một lần giờ nhận và trả phòng cho mọi căn, để sale gửi đúng giờ cho khách.
Màn hình: P5
Khi nào xảy ra: chủ nhà chạm "Giờ nhận, trả phòng mặc định".

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở màn | "Áp dụng cho tất cả căn. Sale gửi giờ này cho khách cùng thông tin căn." | giờ nhận trả mặc định | Không | Không |
| 2 | Chọn giờ | "Giờ nhận phòng", "Giờ trả phòng" | Không gọi server | Không | Không |
| 3 | Xem tóm tắt | "Khách nhận phòng từ 14:00, trả phòng trước 12:00 hôm sau." | Không gọi server | Không | Không |
| 4 | Bấm "Lưu thay đổi" | Lưu | giờ nhận trả mặc định; không đổi đặt phòng đã có | Không | Giờ nhận, trả mặc định |

Theo quy tắc: Giờ nhận trả mặc định (nhóm Booking).

Trạng thái màn:
- rỗng: không áp dụng
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: không áp dụng
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

## Tiêu chí nghiệm thu
Mỗi tiêu chí một test tự động mang đúng mã này trong tên test. Mã không đổi nghĩa; đổi hành vi thì cấp mã mới (docs/QUY_TRINH.md mục 5).

- **US21-NT1** Khi người dùng bấm "Đăng xuất" lần đầu, thì app hỏi xác nhận và chưa đăng xuất.
- **US21-NT2** Khi người dùng xác nhận đăng xuất, thì app thoát phiên và dữ liệu của tài khoản vẫn còn khi đăng nhập lại bằng Zalo.
- **US21-NT3** Khi người dùng là chủ nhà, thì thấy các nhóm TÀI KHOẢN, CÀI ĐẶT, DỮ LIỆU, HỖ TRỢ và không thấy "BÁN PHÒNG".
- **US21-NT4** Khi người dùng là sale, thì thấy TÀI KHOẢN, BÁN PHÒNG, CÀI ĐẶT, HỖ TRỢ và không thấy "DỮ LIỆU".
- **US21-NT5** Khi có 2 thông báo chưa đọc, thì dòng "Thông báo" ghi số 2.
- **US21-NT6** Khi chủ nhà có 3 loại thông báo đang bật, thì dòng "Cài đặt thông báo" ghi "3 loại đang bật".
- **US21-NT7** Khi người dùng chạm một dòng, thì mở đúng màn của dòng đó, không bắt đăng nhập lại.
- **US21-NT8** Khi chủ nhà mở Cá nhân (P1), thì nhóm "DỮ LIỆU" chỉ có dòng "Xuất file Excel (CSV)", không có dòng sao lưu.
- **US21-NT9** Khi người dùng sửa "Tên hiển thị" và bấm "Lưu thay đổi", thì sale thấy tên mới trong Nguồn phòng.
- **US21-NT10** Khi số điện thoại lấy từ Zalo, thì ô số điện thoại không sửa được.
- **US21-NT11** Khi người dùng đã từ chối quyền tên và ảnh, thì vẫn dùng được hồ sơ và gõ tên hiển thị.
- **US21-NT12** Khi người dùng là chủ nhà, thì thấy đúng 3 loại ở P3; khi là sale thì thấy đúng 4 loại ở P12, có loại "Chủ nhà ghi đặt phòng cho bạn". Không màn nào có loại nhắc khách nhận phòng ngày mai (mục "Cài đặt thông báo").
- **US21-NT13** Khi sale tắt "Chủ nhà ghi đặt phòng cho bạn" và lưu, thì chủ nhà ghi đặt phòng chọn sale đó (mục "Booking chủ nhà ghi cho sale" (US3)) không còn tạo thông báo ở P13 cho sale đó; booking vẫn là của sale.
- **US21-NT14** Khi người dùng tắt "Đặt phòng chưa cọc" và lưu, thì không còn nhắc loại đó.
- **US21-NT15** Khi người dùng bật hoặc tắt một loại ở P3 hay P12, thì không có hộp thoại nào của Zalo hiện ra, và thông báo của loại đang bật chỉ hiện trong app (P13, popup S1-06). (mục "Cài đặt thông báo")
- **US21-NT16** Khi chủ nhà lưu 14:00 và 12:00, thì dòng trên menu ghi "14:00 · 12:00" và S3 của sale ghi "Nhận phòng 14:00 · Trả phòng 12:00".
- **US21-NT17** Khi chủ nhà đổi giờ, thì booking đã có không đổi giờ đã ghi (xem CH-091).

## Luật kiểm dữ liệu và lỗi
Mỗi mục là một việc app nhờ database làm. "Đầu vào" là luật kiểm từng ô, "Lỗi riêng" là khi nào phải từ chối. Cột "Mã" là tên gọi trong tài liệu; hàm database báo lỗi bằng một câu tiếng Việt cho người dùng đọc (docs/luat-chung/Nghiep_vu.md mục Lỗi).

### Đăng xuất
**Đầu vào**
| Trường | Ở đâu (đường dẫn, query, thân) | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|---|
| Authorization | header | chuỗi `Bearer <phien>` | Có | Phiên có trong phiên đăng nhập |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| Không có | Phiên đã đăng xuất hay đã hết hạn mà gọi lại thì vẫn trả `da_dang_xuat: true`, không báo lỗi |

### Đọc hồ sơ và cài đặt của chính người gọi
**Đầu vào**
| Trường | Ở đâu (đường dẫn, query, thân) | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|---|
| Authorization | header | chuỗi `Bearer <phien>` | Có | Phiên thường |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| Không có | Chỉ có lỗi chung |

### Sửa hồ sơ và cài đặt của chính người gọi
**Đầu vào**
| Trường | Ở đâu (đường dẫn, query, thân) | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|---|
| Authorization | header | chuỗi `Bearer <phien>` | Có | Phiên thường |
| ten_hien_thi | thân | chuỗi | Không | Bỏ khoảng trắng đầu cuối, 1 đến 50 ký tự (mục "Hồ sơ (Thông tin cá nhân)" bước 3) |
| ho_ten | thân | chuỗi | Không | Bỏ khoảng trắng đầu cuối, 1 đến 100 ký tự. Có trong, nhưng mục "Hồ sơ (Thông tin cá nhân)" chỉ cho sửa tên hiển thị: [MỞ: US21-H1] `ten` có sửa được trong app không |
| gio_nhan, gio_tra | thân | chuỗi `HH:MM` | Không | 00:00 đến 23:59 (mục "Giờ nhận, trả phòng mặc định" bước 2) |
| dem_cuoi_tuan | thân | mảng số | Không | Mỗi số từ 1 đến 7, không trùng; server xếp tăng dần. Mảng rỗng: [MỞ: US21-H2] mục "Ngày tính giá cuối tuần" (US4) không nói chủ nhà được bỏ chọn hết các thứ không |
| muc_cong_mac_dinh | thân | tien | Không | 0 đến 10.000.000. Chip theo `Tu_dien.md` Mức cộng của sale; "Tùy chọn" là số khác (mục "Mức cộng giá mặc định" (US13) bước 2). Chỉ `vai_chon` `sale` |
| lam_tron_50k | thân | boolean | Không | Chỉ `vai_chon` `sale` (mục "Mức cộng giá mặc định" (US13) bước 3) |
| mau_tin_gui_khach | thân | chuỗi hoặc `null` | Không | Tới 2.000 ký tự. `null` là về mẫu mặc định (mục "Mẫu tin gửi khách" (US14) bước 4, NT2). Các ô chèn `[Ngày]`, `[Số đêm]`, `[Số căn]`, `[Danh sách căn]`, `[Tên sale]` giữ nguyên dạng chữ (mục "Mẫu tin gửi khách" (US14) bước 1). Chỉ `vai_chon` `sale` |
| cai_dat_thong_bao | thân | mảng `{ loai, bat }` | Không | `loai` phải thuộc danh sách của vai người gọi (bảng dưới), không trùng; `bat` là boolean. Chỉ gửi loại cần đổi cũng được |
| Vai | Dòng trên màn | `loai` | Nguồn mã |
|---|---|---|---|
| `chu_nha` (P3) | Sale đặt phòng mới | `sale_gui_yeu_cau` | Thiet_ke_DB `thong_bao.loai`, mục "Cài đặt thông báo" |
| `chu_nha` (P3) | Sale xin xem lịch | `sale_xin_xem_lich` | Mã đặt mới Thiet_ke_DB), mục "Cài đặt thông báo" |
| `chu_nha` (P3) | Đặt phòng chưa cọc | `dat_phong_chua_coc` | Mã đặt mới Thiet_ke_DB). Không có trong mục "Cài đặt thông báo": [MỞ: US21-H3] |
| `sale` (P12) | Chủ nhà đồng ý cho xem lịch | `chu_dong_y_ket_noi` | Thiet_ke_DB, mục "Cài đặt thông báo" |
| `sale` (P12) | Căn bạn đã gửi khách vừa có người đặt | `can_da_gui_co_nguoi_dat` | Thiet_ke_DB, mục "Cài đặt thông báo" |
| `sale` (P12) | Chủ nhà xác nhận đặt phòng của bạn | `chu_chap_nhan_yeu_cau` | Thiet_ke_DB, mục "Cài đặt thông báo" |
| `sale` (P12) | Chủ nhà ghi đặt phòng cho bạn | `chu_ghi_booking_cho_sale` | Thiet_ke_DB, mục "Cài đặt thông báo" |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| DU_LIEU_SAI | Thân rỗng; trường sai kiểu hay ngoài khoảng; `loai` không thuộc vai người gọi hay bị trùng; tài khoản `chu_nha` gửi `muc_cong_mac_dinh`, `lam_tron_50k` hay `mau_tin_gui_khach` (cách báo này: [MỞ: US21-H4] PQ11.CHU chỉ nói chủ nhà không thấy, không nói gửi lên thì báo lỗi hay bỏ qua); có trường lạ như `sdt`, `vai_chon`, `zalo_id` (số chỉ server ghi, PQ2, mục "Số điện thoại hiện trong hồ sơ" (US5); vai không đổi được, QD-005). Kèm `o` |

### Gắn một ảnh tạm đã tải bằng làm ảnh đại diện của người gọi
**Đầu vào**
| Trường | Ở đâu (đường dẫn, query, thân) | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|---|
| Authorization | header | chuỗi `Bearer <phien>` | Có | Phiên thường |
| anh_id | thân | id | Có | `anh_id` tạm do trả, của người gọi, chưa gắn vào đâu, chưa quá 24 giờ |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| KHONG_TIM_THAY | `anh_id` không có, đã quá 24 giờ và bị xóa, đã gắn vào căn, hoặc do người khác tải |
| DU_LIEU_SAI | Thiếu `anh_id` hoặc sai kiểu. Kèm `o` |

## Ai được làm và việc kéo theo
Nguyên liệu chép từ đặc tả máy chủ của bản Zalo, đã đổi tên bảng và mã. Đối chiếu với hàm database ở mục Database khi viết lại story: chỗ nào lệch thì ghi vào "Database đang lệch story". Tên lỗi viết hoa (`KHONG_TIM_THAY`, `DU_LIEU_SAI`) là tên loại lỗi của bản cũ; bản PWA báo bằng câu tiếng Việt.

### Đăng xuất
**Ai gọi:** người có phiên, kể cả phiên tạm. Chỉ đăng xuất đúng phiên gửi kèm; không có cách đăng xuất phiên của máy khác hay của người khác (Luật chung 3). Không có phiên thì `CHUA_DANG_NHAP`.

**Việc kéo theo:** Không. Sau khi đăng xuất, mọi API gọi bằng phiên này trả `CHUA_DANG_NHAP`, không trả `PHIEN_HET_HAN`, để app không tự lấy phiên mới theo HV7. App về A1 hay tự gọi lại: [MỞ: US21-H7] bước 4 nói mất phiên thì app tự gọi lại mà không hỏi; mục "Tài khoản đăng nhập và đăng xuất" (US21) nói "Lần sau đăng nhập lại bằng Zalo". Hai câu cho hai kết quả khác nhau sau đăng xuất.

**Chống bấm hai lần:** không cần `Idempotency-Key`. Gọi lại cho cùng kết quả.

### Đọc hồ sơ và cài đặt của chính người gọi
**Ai gọi:** người có phiên thường, chỉ đọc hồ sơ của mình (PQ1.CHU, PQ1.SALE, PQ2.CHU, PQ2.SALE). Không có tham số chọn người khác. Phiên tạm thì `CHUA_DANG_NHAP`.

**Việc kéo theo:** Không.

**Chống bấm hai lần:** không cần (đọc).

### Sửa hồ sơ và cài đặt của chính người gọi
**Ai gọi:** người có phiên thường, chỉ sửa hồ sơ của mình (PQ1.CHU, PQ1.SALE, PQ6.CHU, PQ11.SALE). Ba trường bán phòng chỉ tài khoản `vai_chon` `sale` gửi được (PQ11.CHU). Phiên tạm thì `CHUA_DANG_NHAP`.

**Việc kéo theo:**
- `ten_hien_thi`: người kia thấy tên mới ở lần đọc sau (US21-NT9). Không ghi thông báo.
- `dem_cuoi_tuan`: `gia_dem` của mọi căn người gọi giữ đổi theo từ lần đọc sau bước 2), kể cả lịch và giá sale thấy. Có cập nhật `can.lich_cap_nhat_luc` của các căn đó không: [MỞ: US21-H8] cập nhật cột này khi đổi giá tháng, không nói khi đổi đêm cuối tuần.
- `muc_cong_mac_dinh`, `lam_tron_50k`: giá bán tính lúc đọc đổi theo cho căn không có mức cộng riêng. Không đổi `booking_rieng` hay giá bán của yêu cầu đã gửi.
- `cai_dat_thong_bao`: loại đã tắt thì từ lúc này server không ghi `thong_bao` loại đó, mục "Cài đặt thông báo" (US21) bước 5, US21-NT13). Thông báo đã ghi trước đó còn hiện ở P13 không: [MỞ: US21-H9] mục "Cài đặt thông báo" (US21) không nói.

**Chống bấm hai lần:** có.

### Gắn một ảnh tạm đã tải bằng làm ảnh đại diện của người gọi
**Ai gọi:** người có phiên thường, chỉ với ảnh tạm chính mình đã tải (PQ1.CHU, PQ1.SALE). Ảnh tạm của người khác thì `KHONG_TIM_THAY` bước 3). Phiên tạm thì `CHUA_DANG_NHAP`.

**Việc kéo theo:** Không ghi thông báo. Ảnh mới hiện cho người có quyền xem ở lần đọc sau.

**Chống bấm hai lần:** có. Lần hai cùng khóa trả lại đúng kết quả, không báo `KHONG_TIM_THAY` vì ảnh tạm đã dùng.

## Luật chung dùng
Nguyên văn ở `docs/luat-chung/` (QT.md, HV.md, Nghiep_vu.md, Tu_dien.md), tìm theo mã hoặc tên.

Quy tắc trong nhóm Quản trị và dữ liệu: Menu theo vai trò, Tên hiển thị, Giờ nhận trả áp dụng mọi căn. Quy tắc trong nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale: Số điện thoại từ Zalo, chỉ xem (mục "Số điện thoại hiện trong hồ sơ" (US5)). Quy tắc trong nhóm Booking: Giờ nhận trả mặc định. mục "Cài đặt thông báo" (thông báo chỉ trong app), mục "Cài đặt thông báo" (đã bỏ loại nhắc khách nhận phòng ngày mai), QD-013. HV1 đến HV5, HV8.

## Màn hình
Hình: `python3 docs/thiet-ke/trich-man.py <mã màn>` (docs/thiet-ke/README.md). Chữ và số trên hình lệch story thì story đúng.

P1 (Cá nhân, chủ nhà), P4 (Cá nhân, sale), P2, P3, P12, P5. Hộp xác nhận đăng xuất (mục "Tài khoản đăng nhập và đăng xuất" bước 3).

**P1 · Cá nhân · chủ nhà**
Vào từ: Tab Cá nhân, vai chủ nhà
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Thẻ người dùng | "Chị Hoa", "0904 118 772 · Chủ nhà", nút sửa | Hồ sơ |
| 2 | Tài khoản | "Thông báo" (số chưa đọc 2), "Thông tin cá nhân", "Đăng nhập bằng Zalo · Đã liên kết" | Hồ sơ, thông báo |
| 3 | Cài đặt | "Cài đặt thông báo · 3 loại đang bật", "Giờ nhận, trả phòng mặc định · 14:00 · 12:00", "Ngày tính giá cuối tuần · T6, T7" | DLM.8 |
| 4 | Dữ liệu | Chỉ còn "📊 Xuất file Excel (CSV)" | Cố định |
| 5 | Hỗ trợ | "Hướng dẫn sử dụng", "Nhắn Zalo cho Home247", "Đăng xuất", "Home247 · phiên bản 1.0" | Cố định |
| 6 | Thanh tab | Lịch · Căn · Sale · Thống kê · Cá nhân | Cố định |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Thông báo" | Mở thông báo | P13 |
| "Thông tin cá nhân" | Mở thông tin | P2 |
| "Cài đặt thông báo" | Mở cài đặt | P3 |
| "Giờ nhận, trả phòng mặc định" | Mở giờ | P5 |
| "Ngày tính giá cuối tuần" | Mở | P6 |
| "Xuất file Excel (CSV)" | Mở | P8 |
| "Hướng dẫn sử dụng" | Mở | P9 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- đang tải: chưa thiết kế (HV1)
- lỗi mạng: chưa thiết kế (HV2)
- quay lại từ nền: chưa thiết kế (HV3)

**P12 · Thông báo · sale**
Vào từ: Xem YC (canvas chưa có mũi tên tới màn này)
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Tiêu đề | "Cài đặt thông báo" | Canvas |
| 2 | Khối nội dung | "Thông báo hiện ngay trong app, ở mục Thông báo trên trang Cá nhân." | Canvas |
| 3 | Khối nội dung | "BÁO CHO TÔI KHI Chủ nhà đồng ý cho xem lịch Căn mới vào Nguồn phòng Căn bạn đã gửi khách vừa có người đặt Để báo khách chọn căn khác Chủ nhà xác nhận đặt phòng của bạn Kèm ngày ở và tiền cọc Chủ nhà ghi đặt phòng cho bạn Khi chủ nhà ghi đặt phòng có bạn là người bán" | Canvas |
| 4 | Khối nội dung | "Lưu thay đổi" | Canvas |
| 5 | Cỡ chữ, vùng bấm | Chữ tối thiểu 14 px, vùng bấm tối thiểu 44 px | CLAUDE.md |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Nút quay lại" | Quay lại màn trước | |
| "Lưu thay đổi" | Quay lại màn trước | |
| "Chủ nhà đồng ý cho xem lịch" | Theo YC, canvas chưa nối mũi tên | |
| "Căn bạn đã gửi khách vừa có người đặt" | Theo YC, canvas chưa nối mũi tên | |
| "Chủ nhà xác nhận đặt phòng của bạn" | Bật hoặc tắt loại này | P12 |
| "Chủ nhà ghi đặt phòng cho bạn" | Bật hoặc tắt loại này (bật sẵn) | P12 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- không có quyền: chưa thiết kế

**P13-02 · Thông báo · chủ nhà ngừng cho xem lịch**
Vào từ: P4 (Cá nhân), chạm "Thông báo"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Màn gốc | Chép P13 | P13 |
| 2 | Dòng mới, đầu nhóm Hôm nay | "Anh Tuấn đã ngừng cho bạn xem lịch", "Sapphire 1103 và À La Carte 2208 không còn trong Nguồn phòng. Đặt phòng cũ của bạn với Anh Tuấn vẫn xem được trong Thống kê.", "09:30" | mục "Cài đặt thông báo", QD-007 |
| 3 | Số chưa đọc | "3 chưa đọc" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Dòng "Anh Tuấn đã ngừng cho bạn xem lịch" | Mở danh sách đặt phòng của sale, không mở lịch của chủ nhà đó | S7-03 |

**P3 · Cài đặt thông báo**
Vào từ: P1, "Thông báo"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Báo cho tôi khi | Ba công tắc, cả ba bật: "Sale đặt phòng mới", "Sale xin xem lịch", "Đặt phòng chưa cọc" | DLM.8 |
| 2 | Nút | "Lưu thay đổi" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Một ô | Bật, tắt | P3 |
| "Lưu thay đổi" | Lưu | P1 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- đang tải: chưa thiết kế (HV1)
- lỗi mạng: chưa thiết kế (HV2)
- quay lại từ nền: chưa thiết kế (HV3)

**P4 · Cá nhân · sale**
Vào từ: Xem YC (canvas chưa có mũi tên tới màn này)
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Tiêu đề | "Cá nhân" | Canvas |
| 2 | Khối nội dung | "H Sale Hùng 0912 345 678 · Sale" | Canvas |
| 3 | Khối nội dung | "TÀI KHOẢN Thông báo 2 Thông tin cá nhân Đăng nhập bằng Zalo Đã liên kết" | Canvas |
| 4 | Khối nội dung | "BÁN PHÒNG Đội nhóm Link xin xem lịch Gửi chủ nhà Mức cộng giá mặc định +400k Mẫu tin gửi khách" | Canvas |
| 5 | Khối nội dung | "CÀI ĐẶT Cài đặt thông báo" | Canvas |
| 6 | Khối nội dung | "HỖ TRỢ Hướng dẫn sử dụng Nhắn Zalo cho Home247" | Canvas |
| 7 | Khối nội dung | "Đăng xuất" | Canvas |
| 8 | Khối nội dung | "Home247 · phiên bản 1.0" | Canvas |
| 9 | Thanh tab | Lịch · Căn · Thống kê · Cá nhân | Cố định |
| 10 | Cỡ chữ, vùng bấm | Chữ tối thiểu 14 px, vùng bấm tối thiểu 44 px | CLAUDE.md |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Thông báo 2" | Mở màn P13 | P13 |
| "Sửa thông tin" | Theo YC, canvas chưa nối mũi tên | |
| "Đăng xuất" | Theo YC, canvas chưa nối mũi tên | |
Trạng thái riêng:
- rỗng: chưa thiết kế
- không có quyền: chưa thiết kế

**P5 · Giờ nhận, trả phòng**
Vào từ: P3 (Cá nhân · chủ nhà), chạm "Giờ nhận, trả phòng mặc định"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Đầu màn | "Giờ nhận, trả phòng", nút quay lại 44 × 44 px | Cố định |
| 2 | Lời dẫn | "Áp dụng cho tất cả căn. Sale gửi giờ này cho khách cùng thông tin căn." | mục "Giờ nhận, trả phòng mặc định" bước 1 |
| 3 | Chọn giờ | Giờ nhận phòng 14:00, giờ trả phòng 12:00 | Giờ mặc định của chủ nhà |
| 4 | Tóm tắt | "Khách nhận phòng từ 14:00, trả phòng trước 12:00 hôm sau." | mục "Giờ nhận, trả phòng mặc định" bước 3 |
| 5 | Nút | "Lưu thay đổi" | Cố định |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Chọn giờ | Tóm tắt đổi theo giờ chọn | P5 |
| "Lưu thay đổi" | Lưu giờ mặc định, quay về Cá nhân | P3 |

## Quyền
Ô quyền theo `docs/luat-chung/PQ.md`. Mỗi ô phải có test chứng minh người không có quyền thì không đọc, không ghi được; test ở lớp database (`tests/db/`).

Ô PQ chạm tới (ma trận `docs/luat-chung/PQ.md`): PQ1.CHU, PQ1.SALE, PQ2.CHU, PQ2.SALE, PQ6.CHU, PQ6.SALE (S3 thấy giờ nhận, trả), PQ19.CHU, PQ19.SALE (cài đặt thông báo của chính mình), PQ20.SALE (sale không có nhóm DỮ LIỆU).
Test vi phạm phải có (theo):
- Chủ nhà A và sale không sửa được hồ sơ người khác qua API; gửi id người khác bị `DU_LIEU_SAI`, hồ sơ người kia không đổi (PQ1.CHU, PQ1.SALE).
- Gửi `sdt`, `vai_chon` hay `zalo_id` lên bị `DU_LIEU_SAI`, số không đổi (PQ2.CHU, PQ2.SALE).
- Chị Hoa đổi giờ nhận, trả không đổi giờ của Anh Tuấn; tài khoản sale gửi `gio_nhan` không đổi giờ của chủ nhà nào (PQ6.CHU, PQ6.SALE).
- Chị Hoa gửi loại thông báo của sale (`chu_dong_y_ket_noi`) bị `DU_LIEU_SAI`; sale gửi loại của chủ nhà cũng vậy; tắt một loại không đổi cài đặt của người khác (PQ19.CHU, PQ19.SALE).
- Sale gọi không nhận trường nào của nhóm DỮ LIỆU chủ nhà; xuất CSV của sale bị từ chối (PQ20.SALE, chặn ở API của US22).
- Sau, phiên cũ gọi mọi API trả `CHUA_DANG_NHAP` (US21-NT2).

## Database
Đã có trong `supabase/migrations/` và đã chạy test. Tham số và cột: `docs/tu-sinh/Bang_va_cot.md`.

- `fn_cap_nhat_ho_so`: test ở t_02_gia.sql, t_11_ket_noi_quan_tri.sql
- `fn_luu_cai_dat`: test ở t_07_can_gia_mo_rong.sql, t_08_thong_bao.sql

## Ngoài phạm vi
- Dòng "Thông báo", màn P13 và API ở trên menu (mục "Thông báo kết quả kết nối cho sale" (US17)): US17. US này chỉ hiện số chưa đọc từ API đó (US21-NT5) (US17 có trong truoc, Tùng giao 04/11).
- Dòng "Ngày tính giá cuối tuần" và màn P6 (mục "Ngày tính giá cuối tuần" (US4)): US1. Dòng "Xuất file Excel (CSV)" và màn P8, "Hướng dẫn sử dụng" và P9, "Nhắn Zalo cho Home247" (mục "Xuất file Excel (CSV)" (US22), mục "Hướng dẫn sử dụng và nhắn Zalo cho Home247" (US22)): US22.
- Nhóm BÁN PHÒNG của sale: "Đội nhóm" (nhóm Đội nhóm, cộng tác viên, US20 on-hold), "Link xin xem lịch" (mục "Sale xin chủ nhà cho xem lịch" (US17), US17), "Mức cộng giá mặc định" (mục "Mức cộng giá mặc định" (US13), US13), "Mẫu tin gửi khách" (mục "Mẫu tin gửi khách" (US14), US14). US này chỉ hiện các dòng và mở màn của chúng.
- Sao lưu và khôi phục dữ liệu (mục "Sao lưu và khôi phục dữ liệu" (US40)): On Hold, không làm ở bản đầu.
- Xóa dữ liệu khi người dùng xóa tài khoản (mục "Khi người dùng xóa tài khoản" (US22), QD-013): US22 và. Không có nút "Xóa tài khoản" ở P2.
- Việc tạo thông báo từ các sự kiện (sale đặt phòng, chủ ghi đặt phòng cho sale, nhắc đặt phòng chưa cọc): US15, US3, US30 và các US sinh sự kiện. US này lưu công tắc và bảo đảm loại đã tắt thì server không ghi (US21-NT14, US21-NT4).
- Ô "Họ và tên" có sửa được trong app không: mục "Hồ sơ (Thông tin cá nhân)" chỉ cho sửa tên hiển thị [MỞ: US21-H5] US21 câu 3.

## Việc cần làm
- [ ] Đọc story này và các luật chung nó trỏ tới. Chỗ nào gắn thẻ MỞ thì không code, hỏi Tùng (docs/Cau_hoi_mo.md).
- [ ] Viết test cho từng tiêu chí chưa có test, test đỏ trước (lớp test: docs/QUY_TRINH.md mục 6).
- [ ] Database: soát các hàm ở mục Database với tiêu chí; thiếu thì thêm migration mới và một dòng trong `scripts/thu-lam-hong.sh`.
- [ ] Giao diện: các màn ở mục Màn hình, nối với Supabase (docs/Ghi_chu_code.md).
- [ ] E2E cho luồng chính của story.
- [ ] Kiểm tay theo `tests/kich-ban/US21.md` trên điện thoại thật.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md` trong cùng PR.
