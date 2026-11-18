# US1 · Chủ nhà vào app và tạo căn đầu tiên

- Loại: tính năng
- Trạng thái: chờ code
- Đặc tả: thô (lắp bằng máy từ bản Zalo, chưa viết lại theo khuôn; không code theo bản này, xem US41)
- Bản: 1
- Rủi ro: cao
- Làm sau khi xong: không phụ thuộc story nào
- Kiểm tay: `tests/kich-ban/US1.md` (26 kịch bản)

## Mục tiêu
Là chủ nhà mới, tôi muốn vào app bằng Zalo và thêm căn chỉ với mã căn và số phòng ngủ, để bắt đầu ghi lịch ngay.

## Hành vi
Bảng bước ghi: người dùng làm gì, app hiện gì (chữ trong ngoặc kép là chữ trên màn), máy chủ phải làm gì, dữ liệu nào đổi. Cột "Máy chủ" mô tả việc phải xảy ra; bản PWA làm bằng RLS, view và hàm `fn_*` của Supabase.

### Đăng nhập
> **Bản PWA:** cách đăng nhập theo CH-001; bảng dưới là cách của bản Zalo. Điều giữ cho mọi nền tảng: không bắt đăng ký email, không hỏi tên, số khi vừa vào, A1 hiện được khi chưa đăng nhập, dòng điều khoản ở A1. Xem `PWA.md` mục P1.
Rủi ro: tb
Mục đích: người dùng mới vào app mà không phải tạo tài khoản bằng email.
Màn hình: A1
Khi nào xảy ra: người dùng mở app lần đầu, đang ở màn chào mừng.

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở app | Hiện A1: tên app, 3 dòng giá trị, nút "Bắt đầu ngay" (mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5)), dòng "Bằng việc tiếp tục, bạn đồng ý với Điều khoản và Chính sách quyền riêng tư" | Không gọi server: A1 hiện được không cần phiên | Không | Không |
| 2 | Bấm "Bắt đầu ngay" | Chuyển sang A3, không hỏi tên hay số điện thoại (mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5)) | gọi Zalo lấy ID người dùng, chưa có tài khoản thì tạo phiên tạm, trả `tai_khoan: null` | App lấy access token (`getAccessToken`), không hiện hộp thoại xin quyền; server gọi Zalo lấy ID người dùng | phiên đăng nhập mới (phiên tạm) |

Trạng thái màn:
- rỗng: không áp dụng
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: theo HV4
- quay lại từ nền: theo HV3
- mở từ link: xem mục "Mở app từ link mời của chủ nhà" (US6)

### Chọn vai trò
Rủi ro: thap
Vai chọn ở A3 quyết định giao diện. Sale vẫn có căn của mình (sở hữu hoặc thuê lại) ngay trong vai sale. Bản đầu không có màn đổi vai (QD-005).
Mục đích: người dùng chọn mình là chủ nhà hay sale để app đưa đúng màn đầu tiên.
Màn hình: A3, A3-00
Khi nào xảy ra: ngay sau A1, trước khi có dữ liệu nào.

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Xem hai thẻ | "Tôi là chủ nhà: Ghi lịch phòng, đặt giá, mời sale xem lịch." và "Tôi là sale: Tìm phòng trống, gửi ảnh và giá cho khách." | Không gọi server | Không | Không |
| 2 | Chạm một thẻ | Thẻ được chọn đổi màu nền, viền và hiện dấu tích | Không gọi server | Không | Không |
| 3 | Bấm "Tiếp tục" | Chủ nhà sang A4, sale sang A5 | tạo tài khoản; đã có tài khoản với ID Zalo đó thì trả tài khoản cũ | Không | Vai trò của tài khoản: `profiles` mới (`zalo_id`, `vai_chon`, `dong_y_dieu_khoan_luc`) |

Trạng thái màn:
- rỗng: nút "Tiếp tục" khi chưa chọn thẻ nào: A3-00
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: không áp dụng
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: bỏ qua màn này, xem mục "Mở app từ link mời của chủ nhà" (US6)

### Màn đầu tiên khi chưa có dữ liệu
Rủi ro: thap
Mục đích: chủ nhà mới và sale mới biết bước tiếp theo để có dữ liệu.
Màn hình: A4, A5, A4-01, A5-01
Khi nào xảy ra: ngay sau mục "Chọn vai trò", khi tài khoản chưa có căn hoặc chưa có nguồn phòng.

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Chủ nhà vào A4 | "Chưa có căn nào", nút "Thêm căn đầu tiên", danh sách 3 bước (Thêm căn và ảnh, Đặt giá, Mời sale xem lịch) và mẹo sổ lịch cũ | căn chưa ẩn của người gọi, ở đây rỗng | Không | Không |
| 2 | Chủ nhà bấm "Thêm căn đầu tiên" hoặc dòng "Thêm căn và ảnh" | Mở CN5-A1 | Không gọi server | Không | Không |
| 3 | Sale vào A5 | "Chưa có nguồn phòng", nút "Gửi tin nhắn xin lịch đến chủ nhà", nút "Thêm căn thủ công", ghi chú "Căn của chủ nhà chưa dùng app, hoặc căn của chính bạn", dòng "Chủ nhà đã gửi link? Mở link trong tin nhắn Zalo của chủ nhà, lịch sẽ hiện ở đây" | hai nhóm căn của tôi và nguồn phòng, ở đây rỗng | Không | Không |
| 4 | Sale bấm "Gửi tin nhắn xin lịch đến chủ nhà" | Mở A6, xem mục "Sale xin chủ nhà cho xem lịch" (US17) | Không gọi server (A6 xem mục "Sale xin chủ nhà cho xem lịch" (US17)) | Không | Không |
| 5 | Sale bấm "Thêm căn thủ công" | Mở S6-02 (thuộc nhóm Nguồn phòng và căn tự nhập) | Không gọi server | Không | Không |

Trạng thái màn:
- rỗng: đây là trạng thái rỗng của hai tab
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: không áp dụng
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: chủ nhà mới vừa đồng ý ở A8: A4-01; sale mới mở link đã hết hạn hoặc hỏng: A5-01

### Danh sách căn
Rủi ro: thap
Mục đích: chủ nhà thấy mọi căn của mình, căn nào thiếu ảnh hoặc chưa có giá, và vào sửa hoặc đặt giá nhanh.
Màn hình: CN5, CN5-A4, CN5-A4b
Khi nào xảy ra: chủ nhà mở tab Căn.

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở tab Căn | Tiêu đề "Căn của tôi", số căn ("4 căn"), nút "Đặt giá nhiều căn", nút "Thêm căn" | căn của người gọi, chưa ẩn | Không | Không |
| 2 | Xem một thẻ căn | Số ảnh, "Phòng 1509", dòng "2PN · view biển · ICON40", "Giá tuần này 900.000đ – 1.300.000đ", trạng thái ("Có khách đến 12/10" hoặc "Trống hôm nay ✓"). Phần phòng ngủ lấy từ số phòng ngủ và ô "Số giường" của căn (mục "Tòa nhà, loại view, số giường, mô tả" (US11)), ghi theo `Tu_dien.md`: có số giường thì "2PN · 3 giường", chưa nhập thì chỉ "2PN"; không hiện số khách. Số giường của 1509 chưa có trong dữ liệu mẫu | tòa, số phòng ngủ, số giường, khoảng giá tuần này theo `gia_dem` 7 ngày từ hôm nay, tình trạng hôm nay (`co_khach`, `khach_den`, `trong`) | Không | Không |
| 3 | Xem căn thiếu ảnh | Thẻ ghi "Chưa có ảnh", có gợi ý "Nên thêm ảnh: sale cần ít nhất 6 ảnh" | số ảnh, ảnh đại diện có chữ ký | Không | Không |
| 4 | Xem căn chưa có giá | Thẻ ghi "Chưa đặt giá" và nút "Đặt giá cho căn này"; căn vừa thêm có nhãn "Mới thêm" | cờ "Chưa đặt giá", cờ "Mới thêm" (tạo trong 24 giờ (giả định GD14)) | Không | Không |
| 5 | Chạm ảnh hoặc thẻ căn | Mở sửa căn (CN5-02, xem mục "Sửa thông tin căn" (US11)), như mũi tên trên canvas ở CN5, CN5-A4, CN5-A4b | Không gọi server | Không | Không |
| 6 | Bấm "Đặt giá nhiều căn" | Mở CN6-05, xem mục "Đặt giá nhiều căn" (US7) | Không gọi server | Không | Không |
| 7 | Bấm "Thêm căn" | Mở CN5-A1, xem mục "Thêm căn" | Không gọi server | Không | Không |

Theo quy tắc: Giá tuần này; Ảnh căn.

Trạng thái màn:
- rỗng: chủ nhà chưa có căn thì thấy A4 (thuộc mục "Màn đầu tiên khi chưa có dữ liệu")
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

### Thêm căn
> **Bản PWA:** chọn ảnh bằng ô chọn file của trình duyệt, không xin quyền. Xem `PWA.md` mục P6.
Rủi ro: tb
Mục đích: chủ nhà thêm một căn mới chỉ với mã căn và số phòng ngủ, phần còn lại thêm sau cũng được.
Màn hình: CN5-A1, CN5-A1b, CN5-A2, CN5-A3, CN5-A4, CN5-A4b
Khi nào xảy ra: chủ nhà bấm "Thêm căn" ở CN5, hoặc bấm "Thêm căn đầu tiên" ở A4 (mục "Màn đầu tiên khi chưa có dữ liệu").

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở form | CN5-A1: ô "Mã căn (tên căn hộ) *", hàng chip "Số phòng ngủ *" (Studio, 1PN, 2PN, 3PN, 4PN+), mục Ảnh ("Bạn có thể thêm sau"), dòng "Thêm tòa nhà, mô tả gửi khách, view..." đang thu gọn | Không gọi server | Không | Không |
| 2 | Chưa điền đủ | Nút "Thêm căn" ở trạng thái chưa dùng được, kèm dòng "Còn thiếu: mã căn, số phòng ngủ" | Không gọi server | Không | Không |
| 3 | Điền mã căn và chọn số phòng ngủ | Hiện "Đủ thông tin. Ảnh, giá thêm sau cũng được." | Không gọi server | Không | Không |
| 4 | Bấm "Thêm căn" | Lưu căn, về CN5-A4 (một căn) hoặc CN5-A4b (nhiều căn): toast "Đã thêm phòng 2105", nút "Thêm căn khác", thẻ căn mới có nhãn "Mới thêm" và nút đặt giá | kiểm có mã căn và số phòng ngủ, mã trùng căn chưa ẩn của cùng chủ thì `MA_CAN_TRUNG`; nhận `anh_ids` theo thứ tự để gắn ảnh vào căn | Không | Thêm một căn vào tài khoản chủ nhà |
| 5 | Lưu lỗi | CN5-A3: dòng đầu "Chưa thêm được căn. Sửa 3 chỗ bên dưới." và lỗi ngay dưới từng ô: "Đã có căn 1509. Kiểm tra lại mã căn.", "Chọn số phòng ngủ", "1 ảnh chưa tải được. Bấm Thử lại hoặc xóa ảnh đó rồi thêm căn." | trả `MA_CAN_TRUNG` hoặc `DU_LIEU_SAI` kèm ô sai. Còn ảnh tải lỗi thì app chưa gọi | Không | Không thêm căn |

Theo quy tắc: Căn tối thiểu; Mã căn không trùng.

Trạng thái màn:
- rỗng: CN5-A1 là form trống
- đang tải: CN5-A2, xem mục "Ảnh khi thêm căn" (US25)
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: theo HV4, dòng "Chọn ảnh"
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

## Tiêu chí nghiệm thu
Mỗi tiêu chí một test tự động mang đúng mã này trong tên test. Mã không đổi nghĩa; đổi hành vi thì cấp mã mới (docs/QUY_TRINH.md mục 5).

- **US1-NT1** Khi người dùng bấm "Bắt đầu ngay" ở A1, thì app chuyển sang A3 và không hiện popup hay hộp thoại xin tên, số điện thoại.
- **US1-NT2** Khi A1 hiện ra, thì thấy dòng điều khoản có hai link "Điều khoản" và "Chính sách quyền riêng tư". Theo quy tắc: Điều khoản khi tiếp tục.
- **US1-NT3** Khi người dùng chọn "Tôi là chủ nhà" rồi bấm "Tiếp tục", thì app mở A4.
- **US1-NT4** Khi người dùng chạm một thẻ, thì thẻ đó hiện trạng thái đã chọn và thẻ còn lại không được chọn.
- **US1-NT5** Khi chủ nhà chưa có căn và vào tab Lịch, thì thấy A4 với nút "Thêm căn đầu tiên".
- **US1-NT6** Khi chủ nhà có 4 căn, thì tiêu đề ghi "4 căn" và có đúng 4 thẻ.
- **US1-NT7** Khi chủ nhà chưa nhập số giường, thì thẻ căn chỉ ghi số phòng ngủ ("2PN"), không có chữ "giường".
- **US1-NT8** Khi chủ nhà xem bất kỳ thẻ căn nào, thì thẻ không có "x khách", "x người lớn" hay "y trẻ em".
- **US1-NT9** Khi chưa có mã căn hoặc chưa chọn số phòng ngủ, thì nút "Thêm căn" không dùng được và có dòng liệt kê phần còn thiếu.
- **US1-NT10** Khi đã có mã căn và số phòng ngủ nhưng chưa có ảnh, giá, tòa nhà, thì vẫn thêm căn được.
- **US1-NT11** Khi mã căn trùng với một căn đã có của chủ nhà, thì hiện lỗi "Đã có căn <mã>" dưới ô mã căn và không thêm căn. Theo quy tắc: Mã căn không trùng. `[đã có test database: t_07_can_gia_mo_rong.sql]`
- **US1-NT12** Khi thêm căn xong, thì thấy toast "Đã thêm phòng <mã>" và căn mới nằm trong danh sách với nhãn "Mới thêm".

## Luật kiểm dữ liệu và lỗi
Mỗi mục là một việc app nhờ database làm. "Đầu vào" là luật kiểm từng ô, "Lỗi riêng" là khi nào phải từ chối. Cột "Mã" là tên gọi trong tài liệu; hàm database báo lỗi bằng một câu tiếng Việt cho người dùng đọc (docs/luat-chung/Nghiep_vu.md mục Lỗi).

### Tạo tài khoản với vai đã chọn và gắn tài khoản vào phiên tạm
**Đầu vào**
| Trường | Ở đâu (đường dẫn, query, thân) | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|---|
| Authorization | header | chuỗi `Bearer <phien>` | Có | Phiên tạm hoặc phiên thường |
| vai_chon | thân | chuỗi: `chu_nha`, `sale` | Có | Một trong hai giá trị (Thiet_ke_DB `tai_khoan.vai_chon`) |
| dong_y_dieu_khoan_luc | thân | luc | Có | Lúc bấm "Bắt đầu ngay" bước 2, nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale quy tắc Điều khoản khi tiếp tục). Không được sau giờ server quá 5 phút, không được trước `tao_luc` của phiên tạm quá 24 giờ |
| ma_link | thân | chuỗi 22 ký tự | Không | Gửi khi mở từ link mời, link gửi lịch (`vai_chon` `sale`, mục "Mở app từ link mời của chủ nhà" (US6) bước 2) hoặc link xin lịch (`vai_chon` `chu_nha`, mục "Chủ nhà duyệt lời mời xem lịch" (US17) bước 3). Chỉ kiểm định dạng. Server dùng mã này làm gì: [MỞ: US1-H1] bước 2 và 2.3 có gửi `ma_link` nhưng không nói server kiểm hay ghi gì với nó |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| DU_LIEU_SAI | `vai_chon` không phải `chu_nha` hay `sale`; `dong_y_dieu_khoan_luc` thiếu, sai định dạng hay ngoài khoảng; `ma_link` sai định dạng. Kèm `o` |

### Mở một ảnh bằng đường dẫn có chữ ký mà API khác đã trả
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| `id` | id | có | Ảnh còn tồn tại |
| `het` | số nguyên, giây Unix | có | Chưa qua giờ server. Không xa hơn 1 giờ kể từ lúc ký |
| `ky` | chuỗi base64url | có | Bằng HMAC-SHA256 của `id` và `het` với khóa ký của server, so sánh thời gian không đổi |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| KHONG_TIM_THAY | Thiếu `het` hoặc `ky`, chữ ký sai, đã hết hạn, hoặc ảnh đã bị xóa. Cùng một trả lời cho mọi trường hợp để không lộ ảnh có tồn tại bước 3) |
| QUA_NHIEU | Quá 300 lần một phút từ một địa chỉ IP (giới hạn kỹ thuật, như ở |

### Danh sách căn người gọi giữ, chưa ẩn, kèm thông tin cho thẻ căn
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| `loai` | `co_lich` hoặc `tu_nhap` | không | Không có thì trả cả hai loại. Dùng cho các màn chỉ cần căn có lịch (CN1, CN4, P8) |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| DU_LIEU_SAI | `loai` không phải `co_lich` hay `tu_nhap`. `o`: `loai` |

### Thêm một căn có lịch (chủ nhà, hoặc sale với căn của mình) hoặc một căn tự nhập (sale)
**Đầu vào** (thân dữ liệu trả về)
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| `loai` | `co_lich` hoặc `tu_nhap` | không, mặc định `co_lich` | |
| `ma_can` | chuỗi | có | Bỏ khoảng trắng đầu cuối, 1 đến 50 ký tự. Không trùng căn chưa ẩn của cùng người gọi (nhóm Căn và giá quy tắc Mã căn không trùng) |
| `so_phong_ngu` | số nguyên 0 đến 4 | có | nhóm Căn và giá quy tắc Căn tối thiểu |
| `so_giuong` | số nguyên 1 đến 50 hoặc null | không | |
| `loai_view` | `bien`, `thanh_pho`, `nui` hoặc null | không | |
| `toa_nha_id` | id hoặc null | không | Tòa phải có trong `toa_nha` |
| `mo_ta_gui_khach` | chuỗi hoặc null | không | Tối đa 2.000 ký tự |
| `anh_ids` | mảng id | không, mặc định rỗng | Tối đa 12 phần tử (US25-NT4,. Không trùng nhau. Mỗi id là ảnh tạm của chính người gọi, chưa gắn căn nào, chưa bị xóa. Thứ tự mảng là `thu_tu`, phần tử đầu là ảnh đại diện |
| `ten_chu_can` | chuỗi 1 đến 100 ký tự | có khi `tu_nhap`; cấm khi `co_lich` | Thiet_ke_DB ràng buộc `can` |
| `sdt_chu_can` | chuỗi 9 đến 15 chữ số, cho phép dấu `+` đầu | có khi `tu_nhap` (mục "Thêm căn tự nhập" (US16) bước 2, NT1); cấm khi `co_lich` | |
| `gia_chu_thuong` | tien hoặc null | không (US16-NT17); cấm khi `co_lich` | |
| `gia_chu_cuoi_tuan` | tien hoặc null | không; cấm khi `co_lich` | |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| DU_LIEU_SAI | Thiếu `ma_can` hoặc `so_phong_ngu`; thiếu `ten_chu_can` hay `sdt_chu_can` với `tu_nhap`; có trường của căn tự nhập trong căn có lịch; `toa_nha_id` không có; quá 12 `anh_ids`; `anh_id` không phải ảnh tạm của người gọi hoặc đã gắn căn; tài khoản `chu_nha` tạo `tu_nhap`. Kèm `o` |
| MA_CAN_TRUNG | Đã có căn chưa ẩn cùng `ma_can` của người gọi. `ly_do`: "Đã có căn 1509. Kiểm tra lại mã căn." (mục "Thêm căn" bước 5, US1-NT11) |

## Ai được làm và việc kéo theo
Nguyên liệu chép từ đặc tả máy chủ của bản Zalo, đã đổi tên bảng và mã. Đối chiếu với hàm database ở mục Database khi viết lại story: chỗ nào lệch thì ghi vào "Database đang lệch story". Tên lỗi viết hoa (`KHONG_TIM_THAY`, `DU_LIEU_SAI`) là tên loại lỗi của bản cũ; bản PWA báo bằng câu tiếng Việt.

### Tạo tài khoản với vai đã chọn và gắn tài khoản vào phiên tạm
**Ai gọi:** người có phiên tạm từ (PQ1.LINK: chưa có hồ sơ cho tới khi vào app). Người đã có tài khoản gọi thì nhận lại tài khoản cũ, không lỗi bước 2). Không có phiên thì `CHUA_DANG_NHAP`.

**Việc kéo theo:** Không. Kết nối khi mở từ link do hay làm (file ket-noi-link.md).

**Chống bấm hai lần:** không cần `Idempotency-Key`. API tự trả tài khoản cũ khi gọi lại bước 2). `client_id` cần `tai_khoan_id`, mà phiên tạm chưa có.

### Mở một ảnh bằng đường dẫn có chữ ký mà API khác đã trả
**Ai gọi:** không cần phiên bước 1). Ai có đường dẫn còn hạn và đúng chữ ký thì mở được. Server chỉ ký đường dẫn cho người có quyền xem căn lúc ký: CHU (PQ3.CHU, PQ13.CHU), sale tạo căn tự nhập (PQ14.SALE), SALE được chia sẻ căn (PQ3.SALE, ký ở API của sale.md), người mở link mời hợp lệ (PQ3.LINK, ký ở), người tải ảnh tạm. Không có chữ ký, chữ ký sai hoặc hết hạn: `KHONG_TIM_THAY`.

**Việc kéo theo:** Không. Đường dẫn đã ký vẫn mở được tới khi hết hạn, kể cả khi sale vừa bị ngừng hay căn vừa ẩn; tối đa 1 giờ.

**Chống bấm hai lần:** không cần (đọc).

### Danh sách căn người gọi giữ, chưa ẩn, kèm thông tin cho thẻ căn
**Ai gọi:** mọi người có tài khoản. Chỉ trả căn mà người gọi là CHU (PQ3.CHU; sale với căn của mình theo PQ13.CHU) và căn tự nhập người gọi tạo (PQ14.SALE). Không bao giờ trả căn của người khác, kể cả căn sale được chia sẻ (sale đọc qua API của sale.md). Chưa đăng nhập: `CHUA_DANG_NHAP`.

**Việc kéo theo:** Không.

**Chống bấm hai lần:** không cần (đọc).

### Thêm một căn có lịch (chủ nhà, hoặc sale với căn của mình) hoặc một căn tự nhập (sale)
**Ai gọi:**
- `loai` `co_lich`: mọi người có tài khoản. Người gọi thành CHU của căn mới (PQ3.CHU, PQ13.CHU, QD-005).
- `loai` `tu_nhap`: chỉ sale, PQ14.SALE). Chủ nhà không có căn tự nhập (PQ14.CHU). Server biết "sale" bằng `tai_khoan.vai_chon` = `sale` [MỞ: US1-H2] Thiet_ke_DB ghi `vai_chon` chỉ để chọn giao diện, mâu thuẫn với việc dùng nó để kiểm quyền ở đây. Tài khoản `chu_nha` gửi `tu_nhap`: `DU_LIEU_SAI`, `o`: `loai` [MỞ: US1-H3] không có mã cho tạo sai vai.
- Chưa đăng nhập, phiên tạm: `CHUA_DANG_NHAP` (Luật chung 4, PQ3.LINK).

**Việc kéo theo:** Không ghi thông báo. Căn có lịch mới tự vào phạm vi mọi `ket_noi` `tat_ca_can` của người gọi, vì phạm vi tính lúc đọc, mục "Căn mới của chủ nhà tự hiện cho sale" (US6) bước 1); không ghi `ket_noi_can`. Báo sale khi có căn mới: [MỞ: US1-H4] mục "Căn mới của chủ nhà tự hiện cho sale" (US6) ghi "chưa thiết kế".

**Chống bấm hai lần:** có. Gửi lại cùng khóa trả đúng căn đã tạo, không tạo căn thứ hai.

## Luật chung dùng
Nguyên văn ở `docs/luat-chung/` (QT.md, HV.md, Nghiep_vu.md, Tu_dien.md), tìm theo mã hoặc tên.

Quy tắc trong nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale: Điều khoản khi tiếp tục, Xin số điện thoại đúng lúc (không xin lúc vào app). Quy tắc trong nhóm Căn và giá: Căn tối thiểu, Mã căn không trùng. HV1 đến HV3, HV5, HV7, HV8.

## Màn hình
Hình: `python3 docs/thiet-ke/trich-man.py <mã màn>` (docs/thiet-ke/README.md). Chữ và số trên hình lệch story thì story đúng.

A1, A3, A3-00, A4, CN5 (danh sách thẻ căn bản gọn), CN5-A1 (chỉ mã căn và số phòng ngủ), CN5-A4, CN5-A4b.

**A1 · Chào mừng và đăng nhập**
Vào từ: Xem YC (canvas chưa có mũi tên tới màn này)
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Tiêu đề | "🏠 Lịch phòng Hạ Long Lịch phòng và giá homestay, chia sẻ cho sale trong một chạm." | Canvas |
| 2 | Khối nội dung | "Ghi lịch các phòng nhanh hơn sổ tay Sale tự xem phòng trống, không cần gọi hỏi Gửi ảnh và giá phòng cho khách trong vài giây" | Canvas |
| 3 | Khối nội dung | "Bắt đầu ngay Bằng việc tiếp tục, bạn đồng ý với Điều khoản và Chính sách quyền riêng tư." | Canvas |
| 4 | Cỡ chữ, vùng bấm | Chữ tối thiểu 14 px, vùng bấm tối thiểu 44 px | CLAUDE.md |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Bắt đầu ngay" | Mở màn A3 | A3 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- không có quyền: chưa thiết kế

**A3-00 · Chọn vai trò · chưa chọn**
Vào từ: Mở app lần đầu
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 0 | Màn gốc | Chép đúng màn A3 trên canvas, chỉ đổi phần trạng thái. Hai thẻ "Tôi là chủ nhà", "Tôi là sale" giữ nguyên biểu tượng và cỡ của A3; nút "Tiếp tục" mờ; dòng "Chọn một mục để tiếp tục" | A3 |
| 1 | Tiêu đề | "Bạn dùng app để làm gì?" | |
| 2 | Hai thẻ | "Tôi có căn cho thuê", "Tôi là sale", chưa chọn | |
| 3 | Nút | "Tiếp tục" mờ, dòng "Chọn một mục để tiếp tục" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Một thẻ | Chọn, nút sáng lên | A3 |
Trạng thái riêng:
- rỗng: chính là màn này

**A3 · Chọn vai trò**
Vào từ: A1, bấm "Bắt đầu"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Đầu màn | Thanh Zalo, nút ✕ | Cố định |
| 2 | Câu hỏi | "Bạn dùng app để làm gì?" | Cố định |
| 3 | Thẻ chủ nhà | "Tôi là chủ nhà", "Ghi lịch phòng, đặt giá, mời sale xem lịch." | mục "Chọn vai trò" bước 1 |
| 4 | Thẻ sale | "Tôi là sale", "Tìm phòng trống, gửi ảnh và giá cho khách." | mục "Chọn vai trò" bước 1 |
| 5 | Nút | "Tiếp tục", cao 44 px | Cố định |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Một thẻ | Thẻ đổi nền, viền, hiện dấu ✓; thẻ kia bỏ chọn | A3 |
| "Tiếp tục" khi chọn chủ nhà | Sang màn chủ nhà mới | A4 |
| "Tiếp tục" khi chọn sale | Sang màn sale mới | A5 |
Trạng thái riêng:
- rỗng: chưa chọn thẻ nào: A3-00
- mở từ link: bỏ qua màn này, xem mục "Mở app từ link mời của chủ nhà" (US6)

**A4-01 · Chủ nhà mới · mở từ link xin lịch**
Vào từ: A8, chủ nhà chưa có tài khoản bấm "Đồng ý cho xem lịch"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 0 | Màn gốc | Chép đúng màn A4 trên canvas, chỉ đổi phần trạng thái. | A4 |
| 1 | Dải xanh | "✓ Bạn đã cho Sale Hùng xem lịch. Thêm căn để Sale Hùng thấy phòng trống." | |
| 2 | Giữa màn | "Chưa có căn nào", nút "Thêm căn đầu tiên" | Như A4 |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Thêm căn đầu tiên" | Thêm căn | CN5-A1 |
Trạng thái riêng:
- mở từ link: chính là màn này

**A4 · Chủ nhà mới, chưa có căn**
Vào từ: Xem YC (canvas chưa có mũi tên tới màn này)
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Tiêu đề | "Lịch" | Canvas |
| 2 | Khối nội dung | "Chưa có căn nào Thêm căn đầu tiên để bắt đầu ghi lịch và mời sale xem phòng trống. Thêm căn đầu tiên" | Canvas |
| 3 | Khối nội dung | "3 BƯỚC ĐỂ BẮT ĐẦU 1 Thêm căn và ảnh Tòa nhà, số phòng ngủ, ảnh để sale gửi khách 2 Đặt giá Ngày thường, cuối tuần, ngày lễ 3 Mời sale xem lịch Gửi link qua Zalo" | Canvas |
| 4 | Khối nội dung | "💡 Có sổ lịch cũ? Thêm căn trước, sau đó nhập các đặt phòng sắp tới." | Canvas |
| 5 | Thanh tab | Lịch · Căn · Sale · Thống kê · Cá nhân | Cố định |
| 6 | Cỡ chữ, vùng bấm | Chữ tối thiểu 14 px, vùng bấm tối thiểu 44 px | CLAUDE.md |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Thêm căn đầu tiên" | Theo YC, canvas chưa nối mũi tên | |
Trạng thái riêng:
- rỗng: chưa thiết kế
- không có quyền: chưa thiết kế

**A5-01 · Sale mới · mở từ link không dùng được**
Vào từ: Sale chưa có nguồn phòng mở link đã hết hạn hoặc hỏng
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 0 | Màn gốc | Chép đúng màn A5 trên canvas, chỉ đổi phần trạng thái. | A5 |
| 1 | Dải vàng | "Link vừa mở không dùng được nữa. Xin chủ nhà gửi lại link mới." | |
| 2 | Giữa màn | Như A5: "Chưa có nguồn phòng", hai nút | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Gửi tin nhắn xin lịch cho chủ nhà" | Soạn tin | A6 |
| "Thêm căn tự nhập" | Thêm căn tự nhập | S6-02 |
Trạng thái riêng:
- mở từ link: chính là màn này

**A5 · Sale mới, chưa có nguồn phòng**
Vào từ: Xem YC (canvas chưa có mũi tên tới màn này)
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Tiêu đề | "Lịch phòng" | Canvas |
| 2 | Khối nội dung | "Chưa có nguồn phòng" | Canvas |
| 3 | Khối nội dung | "Xin chủ nhà gửi link mời để thấy lịch phòng trống. Chủ chưa dùng app thì tự nhập căn." | Canvas |
| 4 | Khối nội dung | "Gửi tin nhắn xin lịch đến chủ nhà Thêm căn thủ công Căn của chủ nhà chưa dùng app, hoặc căn của chính bạn. Căn tự nhập không có lịch trống: hỏi chủ nhà mỗi lần khách hỏi." | Canvas |
| 5 | Khối nội dung | "Chủ nhà đã gửi link? Mở link trong tin nhắn Zalo của chủ nhà, lịch sẽ hiện ở đây." | Canvas |
| 6 | Thanh tab | Lịch · Căn · Thống kê · Cá nhân | Cố định |
| 7 | Cỡ chữ, vùng bấm | Chữ tối thiểu 14 px, vùng bấm tối thiểu 44 px | CLAUDE.md |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Gửi tin nhắn xin lịch đến chủ nhà" | Theo YC, canvas chưa nối mũi tên | |
| "Thêm căn thủ công" | Theo YC, canvas chưa nối mũi tên | |
Trạng thái riêng:
- rỗng: chưa thiết kế
- không có quyền: chưa thiết kế

**CN5-A1 · Thêm căn · trống**
Vào từ: CN5, "Thêm căn"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Mã căn, số phòng ngủ | Ô "Mã căn (tên căn hộ) *", chip số phòng ngủ | Căn |
| 2 | Ảnh | Thêm ảnh, tối đa 12 | Căn |
| 3 | Phần mở rộng (bấm "Thêm tòa nhà, mô tả gửi khách, view...") | Tòa nhà, mô tả gửi khách, chip Loại view theo `Tu_dien.md`, mục Danh sách lựa chọn dùng chung, một ô "Số giường" (không bắt buộc, không vào dòng "Còn thiếu"), theo `Tu_dien.md`, mục Danh sách lựa chọn dùng chung | Căn |
| 4 | Thanh dưới | Dòng "Còn thiếu…", nút "Thêm căn" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Thêm căn" | Lưu căn | CN5-A4 |

**CN5-A1b · Thêm căn · mở rộng**
Vào từ: CN5, "Thêm căn"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Mã căn, số phòng ngủ | Ô "Mã căn (tên căn hộ) *", chip số phòng ngủ | Căn |
| 2 | Ảnh | Thêm ảnh, tối đa 12 | Căn |
| 3 | Phần mở rộng (bấm "Thêm tòa nhà, mô tả gửi khách, view...") | Tòa nhà, mô tả gửi khách, chip Loại view theo `Tu_dien.md`, mục Danh sách lựa chọn dùng chung, một ô "Số giường" (không bắt buộc, không vào dòng "Còn thiếu"), theo `Tu_dien.md`, mục Danh sách lựa chọn dùng chung | Căn |
| 4 | Thanh dưới | Dòng "Còn thiếu…", nút "Thêm căn" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Thêm căn" | Lưu căn | CN5-A4 |

**CN5-A2 · Thêm căn · đang nhập**
Vào từ: CN5, "Thêm căn"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Mã căn, số phòng ngủ | Ô "Mã căn (tên căn hộ) *", chip số phòng ngủ | Căn |
| 2 | Ảnh | Thêm ảnh, tối đa 12 | Căn |
| 3 | Phần mở rộng (bấm "Thêm tòa nhà, mô tả gửi khách, view...") | Tòa nhà, mô tả gửi khách, chip Loại view theo `Tu_dien.md`, mục Danh sách lựa chọn dùng chung, một ô "Số giường" (không bắt buộc, không vào dòng "Còn thiếu"), theo `Tu_dien.md`, mục Danh sách lựa chọn dùng chung | Căn |
| 4 | Thanh dưới | Dòng "Còn thiếu…", nút "Thêm căn" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Thêm căn" | Lưu căn | CN5-A4 |

**CN5-A3 · Thêm căn · lỗi khi lưu**
Vào từ: CN5, "Thêm căn"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Mã căn, số phòng ngủ | Ô "Mã căn (tên căn hộ) *", chip số phòng ngủ | Căn |
| 2 | Ảnh | Thêm ảnh, tối đa 12 | Căn |
| 3 | Phần mở rộng (bấm "Thêm tòa nhà, mô tả gửi khách, view...") | Tòa nhà, mô tả gửi khách, chip Loại view theo `Tu_dien.md`, mục Danh sách lựa chọn dùng chung, một ô "Số giường" (không bắt buộc, không vào dòng "Còn thiếu"), theo `Tu_dien.md`, mục Danh sách lựa chọn dùng chung | Căn |
| 4 | Thanh dưới | Dòng "Còn thiếu…", nút "Thêm căn" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Thêm căn" | Lưu căn | CN5-A4 |

**CN5-A4 · Đã thêm căn đầu tiên**
Vào từ: CN5-A1, bấm "Thêm căn"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Thẻ căn mới | "Phòng 2105", nhãn "Mới thêm" | Căn vừa thêm |
| 2 | Toast | "✓ Đã thêm phòng 2105", nút ✕ | Kết quả lưu |
| 3 | Vị trí toast | Toast chung: nổi trên nội dung, cách mép trái, phải 12 px, đỉnh cách đỉnh màn 108 px (ngay dưới thanh tiêu đề và cụm ··· ✕ của Zalo), nền tối, chữ trắng 14 px đậm, bo góc vừa. Mọi màn có toast dùng đúng chỗ này | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| ✕ trên toast | Đóng toast | CN5-A4 |

**CN5-A4b · Đã thêm căn · có nhiều căn**
Vào từ: CN5-A1, lưu căn mới
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Thẻ căn mới | "Phòng 2105", "Chưa đặt giá", "Mới thêm" | Căn vừa thêm |
| 2 | Thẻ 1509 | "Giá tuần này 900.000đ – 1.300.000đ" | DLM.3 |
| 3 | Toast | "✓ Đã thêm phòng 2105" | Kết quả lưu |
| 4 | Thanh tab | Lịch · Căn · Sale · Thống kê · Cá nhân | Cố định |
| 5 | Vị trí toast | Toast chung: nổi trên nội dung, cách mép trái, phải 12 px, đỉnh cách đỉnh màn 108 px (ngay dưới thanh tiêu đề và cụm ··· ✕ của Zalo), nền tối, chữ trắng 14 px đậm, bo góc vừa. Mọi màn có toast dùng đúng chỗ này | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Đặt giá cho căn này" | Mở tab Giá | CN6-00 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- đang tải: chưa thiết kế (HV1)
- lỗi mạng: chưa thiết kế (HV2)
- quay lại từ nền: chưa thiết kế (HV3)

**CN5 · Danh sách căn**
Vào từ: Tab Căn
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Đầu màn | "Căn của tôi · 4 căn", "Đặt giá nhiều căn" | Căn |
| 2 | Thẻ 1509 | "12 ảnh", "2PN · 4 khách · view biển · ICON40", "Giá tuần này 900.000đ – 1.300.000đ", "Có khách đến 12/10" | DLM.3 |
| 3 | Thẻ 3402 | "Giá tuần này 800.000đ – 1.100.000đ", "Trống hôm nay ✓", gợi ý thêm ảnh | DLM.3 |
| 4 | Thẻ Greenbay | "Chưa đặt giá", "Đặt giá cho căn này" | Căn |
| 5 | Thẻ 2208 | "Giá tuần này 1.000.000đ – 1.300.000đ" | Căn |
| 6 | Nút | "Thêm căn" | |
| 7 | Thanh tab | Lịch · Căn · Sale · Thống kê · Cá nhân | Cố định |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Một thẻ căn | Mở căn | CN6 |
| "Đặt giá cho căn này" | Mở tab Giá | CN6-00 |
| "Thêm căn" | Thêm căn | CN5-A1 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- đang tải: chưa thiết kế (HV1)
- lỗi mạng: chưa thiết kế (HV2)
- quay lại từ nền: chưa thiết kế (HV3)

## Quyền
Ô quyền theo `docs/luat-chung/PQ.md`. Mỗi ô phải có test chứng minh người không có quyền thì không đọc, không ghi được; test ở lớp database (`tests/db/`).

Ô PQ chạm tới (ma trận `docs/luat-chung/PQ.md`): PQ3.CHU, PQ3.LINK. Test vi phạm phải có: chủ nhà A tạo, đọc hay sửa căn của chủ nhà B qua API; gọi API tạo căn khi chưa đăng nhập.

## Database
Đã có trong `supabase/migrations/` và đã chạy test. Tham số và cột: `docs/tu-sinh/Bang_va_cot.md`.

- `fn_cap_nhat_ho_so`: test ở t_02_gia.sql, t_11_ket_noi_quan_tri.sql
- `fn_tao_can`: test ở t_01_phan_quyen.sql, t_03_chan_trung.sql, t_07_can_gia_mo_rong.sql, t_08_thong_bao.sql, t_11_ket_noi_quan_tri.sql
- `fn_them_toa_nha`: CHƯA có test, viết test trước khi dùng

## Ngoài phạm vi
- US6-NT1 và US6-NT9 (sale chọn vai, màn A5): US6.
- US17-NT1 (mở A6): US17.
- Ảnh căn (mục "Ảnh khi thêm căn" (US25)) và US25-NT1: US25.
- Tòa nhà, loại view, số giường (mục "Tòa nhà, loại view, số giường, mô tả" (US11)), US11-NT1, sửa căn (mục "Sửa thông tin căn" (US11)): US11.
- US4-NT1, NT4 (giá trên thẻ căn): US4.
- Đăng xuất, Cá nhân (mục "Tài khoản đăng nhập và đăng xuất" (US21)): US21.

## Việc cần làm
- [ ] Đọc story này và các luật chung nó trỏ tới. Chỗ nào gắn thẻ MỞ thì không code, hỏi Tùng (docs/Cau_hoi_mo.md).
- [ ] Viết test cho từng tiêu chí chưa có test, test đỏ trước (lớp test: docs/QUY_TRINH.md mục 6).
- [ ] Database: soát các hàm ở mục Database với tiêu chí; thiếu thì thêm migration mới và một dòng trong `scripts/thu-lam-hong.sh`.
- [ ] Giao diện: các màn ở mục Màn hình, nối với Supabase (docs/Ghi_chu_code.md).
- [ ] E2E cho luồng chính của story.
- [ ] Kiểm tay theo `tests/kich-ban/US1.md` trên điện thoại thật.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md` trong cùng PR.
