# US17 · Kết nối đầy đủ, sale xin lịch, xin số điện thoại đúng lúc, thông báo kết nối

- Loại: tính năng
- Trạng thái: chưa làm
- Đặc tả: thô (lắp bằng máy từ bản Zalo, chưa viết lại theo khuôn; không code theo bản này, xem US41)
- Bản: 1
- Rủi ro: cao
- Làm sau khi xong: US5, US6
- Kiểm tay: `tests/kich-ban/US17.md` (20 kịch bản)

## Mục tiêu
Là sale, tôi muốn gửi link xin lịch cho chủ nhà và biết ngay khi họ đồng ý, để thấy lịch của họ mà không phải gọi hỏi. Việc này chỉ có nghĩa khi chủ nhà cũng duyệt được lời xin (A8), nên US làm cả hai phía.

## Hành vi
Bảng bước ghi: người dùng làm gì, app hiện gì (chữ trong ngoặc kép là chữ trên màn), máy chủ phải làm gì, dữ liệu nào đổi. Cột "Máy chủ" mô tả việc phải xảy ra; bản PWA làm bằng RLS, view và hàm `fn_*` của Supabase.

### Sale xin chủ nhà cho xem lịch
> **Bản PWA:** "Gửi qua Zalo" mở bảng chia sẻ của điện thoại, link là link https của app. Xem `PWA.md` mục P3, P4.
Rủi ro: tb
Mục đích: sale gửi tin Zalo cho chủ nhà kèm link, để chủ nhà cho xem lịch phòng.
Màn hình: A6, A7, A7-00, A7-01
Khi nào xảy ra: sale ở A5 bấm "Gửi tin nhắn xin lịch đến chủ nhà", hoặc bấm "Gửi link cho chủ nhà khác" ở A7.

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Vào A6 | Hiện nội dung tin sẵn ("Chào anh/chị, em là Hùng, sale phòng ở Hạ Long…"), link xin lịch của sale, 3 bước "Sau khi gửi". Link là link app dạng `zalo.me/s/…` (`docs/zalo/rang-buoc.md` mục 5.4), không chứa số điện thoại, không mở trang ngoài Zalo | trả link xin lịch của sale, mỗi sale một link | Không | `link_moi` loại `xin_lich` mới khi sale chưa có |
| 2 | Bấm "Gửi qua Zalo" | Chạy mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5) nếu hồ sơ chưa có số, rồi mở cửa sổ gửi của Zalo | tăng `so_lan_gui`, ghi `gui_cuoi_luc` khi app mở cửa sổ gửi của Zalo | Cửa sổ gửi tin của Zalo mở ra | Số lần gửi tăng: `link_chia_se.so_lan_gui`, `gui_cuoi_luc` |
| 3 | Gửi xong, về app | Hiện A7: "Đang chờ chủ nhà đồng ý", lần gửi gần nhất, hai số "3 lần đã gửi qua Zalo" và "0 chủ nhà đã đồng ý" | số lần đã gửi, lần gửi gần nhất, số chủ nhà đã đồng ý | Không | Không |
| 4 | Bấm "Sao chép tin nhắn" | Chạy mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5) nếu hồ sơ chưa có số (mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5)), rồi sao chép và sang A7 | sao chép cũng tính một lần gửi; A7 đọc | Không | `link_chia_se.so_lan_gui`, `gui_cuoi_luc` |
| 5 | Ở A7, bấm "Gửi link cho chủ nhà khác" hoặc "Thêm căn tự nhập" | Chưa vẽ màn đích | Không gọi server ở bước này (màn đích chưa vẽ) | Không | Không |

Theo quy tắc: Xin lịch chỉ qua tin Zalo; Không biết gửi cho ai; Một link xin lịch nhiều chủ nhà.

Trạng thái màn:
- rỗng: A7 chưa có lần gửi nào: A7-00
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: sang A7 không có số, xem mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5)
- quay lại từ nền: A7 là màn hiện khi quay lại từ cửa sổ Zalo; số đếm cập nhật khi quay lại: A7-01
- mở từ link: không áp dụng

### Chủ nhà duyệt lời mời xem lịch
> **Bản PWA:** "thẻ trong tin Zalo" là tin nhắn chữ kèm link; chủ nhà bấm link. Xem `PWA.md` mục P4.
Rủi ro: cao
Mục đích: chủ nhà quyết định cho một sale xem lịch, và chọn sale được thấy những gì.
Màn hình: CN7-03, A8, A8-P1, A8-P2, A8-01
Khi nào xảy ra: chủ nhà nhận tin Zalo xin xem lịch từ sale và bấm vào thẻ trong tin.

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở tin Zalo của sale | (chưa vào app) | Không gọi server | Khung chat Zalo hiện tin và thẻ "Sale Lan xin xem lịch phòng" với nút "Mở và trả lời" (CN7-03) | Không |
| 2 | Bấm thẻ | Hiện A8: tên và số điện thoại sale, một quyền có công tắc: Tình trạng cọc (đã cọc hay chưa, không có số tiền, mặc định bật); dòng "Luôn thấy ngày đã có người đặt và giá từng đêm" không có công tắc (QD-007), dòng "Không bao giờ thấy tên, số điện thoại khách và doanh thu", ghi chú "Chưa có tài khoản? Bấm Đồng ý để đăng nhập, sau đó thêm căn" | (phiên tạm nếu chưa có tài khoản), rồi: link xin lịch cần phiên; trả tên, số điện thoại sale nếu sale đã cho (PQ2.CHU). Link không dùng được, sale đã xóa tài khoản hoặc đã bị chủ nhà này ngừng: `LINK_KHONG_DUNG_DUOC`, không tên, không số (A8-01) | Mở app từ thẻ | phiên đăng nhập mới khi chưa có phiên |
| 3 | Bấm "Đồng ý cho xem lịch" | Chạy mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5) nếu hồ sơ chưa có số; kết nối hoàn tất | tạo kết nối, ghi thông báo `chu_dong_y_ket_noi` cho sale (mục "Thông báo kết quả kết nối cho sale"). Chủ nhà chưa có tài khoản: gọi trước | Không, trừ hộp thoại quyền khi chạy mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5) (mục "Hộp thoại cấp quyền của Zalo" (US5)) | Sale được xem lịch theo quyền đã chọn: `profiles` mới vai `chu_nha` khi chưa có; `ket_noi` mới (`da_ket_noi`, `nguon` `sale_xin`, `pham_vi` `tat_ca_can`, `quyen_tinh_trang_coc`; không có quyền giá, QD-007); `thong_bao` `chu_dong_y_ket_noi` cho sale |
| 4 | Bấm "Từ chối" | Sang CN7. Sale có được báo không: CH-010 | Không gọi server, không ghi gì [MỞ: CH-010] | Không | Không |
| 5 | Sau khi đồng ý | Sale nhận thông báo (mục "Thông báo kết quả kết nối cho sale"); chủ nhà thấy sale mới trong CN7 | chủ nhà thấy sale ở nhóm Đã kết nối; sale đọc thông báo qua | Không | Sale chuyển sang nhóm Đã kết nối: `ket_noi.trang_thai` `da_ket_noi` ghi ở bước 3 |

Theo quy tắc: Quyền sale được xem; Xin lịch chỉ qua tin Zalo; Nhận ra nhau bằng số điện thoại.

Trạng thái màn:
- rỗng: không áp dụng
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: xem mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5)
- quay lại từ nền: theo HV3
- mở từ link: A8 chính là trạng thái mở từ link; link hết hạn, sale đã bị ngừng, hoặc sale đã xóa tài khoản (mục "Khi người dùng xóa tài khoản" (US22)): A8-01 (theo HV5)

### Thông báo kết quả kết nối cho sale
Rủi ro: thap
Mục đích: sale biết ngay khi chủ nhà đồng ý, mà không có hộp thư xin lịch riêng.
Màn hình: A9, A9-02, P13, P13-00
Khi nào xảy ra: chủ nhà bấm "Đồng ý cho xem lịch" khi sale đang mở app, hoặc sale mở lại thông báo sau đó.

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Sale đang dùng app | Hiện toast đầu màn: "Chị Hoa đã đồng ý cho bạn xem lịch / ICON40 1509 và 3402 đã vào Nguồn phòng", nút "Xem" (A9) | App gọi mỗi 60 giây khi đang mở; toast hiện chậm nhất 60 giây sau khi chủ nhà đồng ý | Không | Lịch của chủ nhà vào Nguồn phòng |
| 2 | Nhiều chủ nhà đồng ý gần nhau | Gom một toast: "3 chủ nhà đã đồng ý cho bạn xem lịch / Chị Hoa, Anh Tuấn và Chú Bình · 7 căn mới trong Nguồn phòng", nút "Xem" (A9-02) | gom các lần đồng ý trong 10 phút thành một dòng theo `khoa_gom` (giả định GD15) | Không | Không |
| 3 | Sale mở Cá nhân > Thông báo | P13 (bản của sale vẽ ở, có thêm loại "chủ sửa booking", mục "Sửa booking" (US10)): "2 chưa đọc", nút "Đánh dấu đã đọc", nhóm Hôm nay và Trước đó, mỗi sự kiện một dòng (dòng đồng ý nằm trong nhóm này) | mới trước, kèm số chưa đọc; "Đánh dấu đã đọc": | Không | Trạng thái đã đọc |

Theo quy tắc: Gom thông báo.

Trạng thái màn:
- rỗng: P13 chưa có thông báo nào: P13-00
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: không áp dụng
- quay lại từ nền: sale không mở app lúc chủ nhà đồng ý thì thông báo ra sao chưa thiết kế
- mở từ link: không áp dụng

## Phần của story khác mà story này làm một lát
Bảng bước của các mục dưới đây nằm ở story chủ của mục đó. Story này chỉ làm các tiêu chí được liệt kê ở mục Tiêu chí nghiệm thu.

- mục "Màn đầu tiên khi chưa có dữ liệu" (US1) · Màn đầu tiên khi chưa có dữ liệu: bảng bước ở US1. Story này làm NT3.
- mục "Chủ nhà quản lý danh sách sale" (US5) · Chủ nhà quản lý danh sách sale: bảng bước ở US5. Story này làm NT6.

## Tiêu chí nghiệm thu
Mỗi tiêu chí một test tự động mang đúng mã này trong tên test. Mã không đổi nghĩa; đổi hành vi thì cấp mã mới (docs/QUY_TRINH.md mục 5).

- **US17-NT1** Khi sale bấm "Gửi tin nhắn xin lịch đến chủ nhà", thì app mở A6.
- **US17-NT2** Khi sale bấm "Gửi qua Zalo" ở A6, thì Zalo mở cửa sổ gửi tin có sẵn nội dung và link.
- **US17-NT3** Khi sale ở A7, thì chỉ thấy hai con số (lần đã gửi, chủ nhà đã đồng ý) và không có danh sách tên chủ nhà.
- **US17-NT4** Khi một chủ nhà đồng ý, thì số "chủ nhà đã đồng ý" ở A7 tăng thêm 1.
- **US17-NT5** Khi A6 hiện link xin lịch, thì link có dạng `zalo.me/s/…`, không có "home247.vn" và không có chữ số nào của số điện thoại sale.
- **US17-NT6** Khi chủ nhà bấm thẻ trong tin Zalo của sale, thì app mở A8 với đúng tên và số điện thoại của sale đó. `[đã có test database: t_11_ket_noi_quan_tri.sql]`
- **US17-NT7** Khi chủ nhà tắt "Tình trạng cọc" ở A8 rồi bấm "Đồng ý cho xem lịch", thì sale không thấy đặt phòng của mình đã cọc hay chưa; sale vẫn thấy lịch và giá từng đêm của các căn được chia sẻ (QD-007). `[đã có test database: t_11_ket_noi_quan_tri.sql]`
- **US17-NT8** Khi chủ nhà bấm "Đồng ý cho xem lịch", thì sale xuất hiện ở CN7.
- **US17-NT9** Khi Chị Hoa ngừng cho Sale Hùng xem lịch, thì Hùng nhận một thông báo, lịch 7 ngày của Hùng không còn căn của Chị Hoa, và Hùng vẫn mở được đặt phòng cũ của mình với Chị Hoa. (QD-007)
- **US17-NT10** Khi một chủ nhà đồng ý lúc sale đang mở app, thì toast hiện đầu màn với tên chủ nhà và số căn mới.
- **US17-NT11** Khi nhiều chủ nhà đồng ý gần nhau, thì chỉ hiện một toast và P13 có một dòng gom.
- **US17-NT12** Khi sale mở P13, thì số chưa đọc ở nhãn "2 chưa đọc" khớp với số dòng chưa đọc.

## Luật kiểm dữ liệu và lỗi
Mỗi mục là một việc app nhờ database làm. "Đầu vào" là luật kiểm từng ô, "Lỗi riêng" là khi nào phải từ chối. Cột "Mã" là tên gọi trong tài liệu; hàm database báo lỗi bằng một câu tiếng Việt cho người dùng đọc (docs/luat-chung/Nghiep_vu.md mục Lỗi).

### Lấy link đang dùng hoặc tạo link mới để gửi qua Zalo
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| `loai` | text: `moi_sale`, `gui_lich`, `xin_lich` | có | Khác ba giá trị thì `DU_LIEU_SAI`, `o: "loai"` |
| `can_ids` | mảng id | với `gui_lich` | 1 đến 100 id, không trùng. Có với loại khác thì `DU_LIEU_SAI`. Căn không phải của người gọi, đã ẩn, hoặc căn tự nhập thì `KHONG_TIM_THAY` |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| `DU_LIEU_SAI` | `loai` sai; thiếu `can_ids` với `gui_lich`; `can_ids` rỗng, trùng, quá 100; có `can_ids` với loại khác |
| `KHONG_TIM_THAY` | Vai chọn không khớp loại link; một căn trong `can_ids` không phải CHU của người gọi, đã ẩn, hoặc là căn tự nhập |

### Đếm một lần gửi link qua Zalo, hoặc một lần sao chép
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| `ma` | text 22 ký tự | có | Link của người gọi |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| `KHONG_TIM_THAY` | Mã không có, hoặc link không phải của người gọi |
| `LINK_KHONG_DUNG_DUOC` | Link đã thu hồi hoặc quá hạn. App gọi để lấy link mới. Đây là đề xuất của file này: [MỞ: US17-H1] nguồn không nói có đếm lần gửi link đã hết hạn không |

### Chủ nhà bấm "Đồng ý cho xem lịch" ở A8, kết nối với sale đã gửi link xin lịch
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| `ma` | text 22 ký tự | có | Link dùng được, loại `xin_lich` |
| `quyen_tinh_trang_coc` | boolean | có | Công tắc "Tình trạng cọc" ở A8, mặc định bật trên màn (QD-007) |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| `LINK_KHONG_DUNG_DUOC` | Link sai, quá hạn (khi đặt hạn), link không phải loại `xin_lich` (sale đã xóa tài khoản: [MỞ: US17-H2]), hoặc người gọi đã ngừng sale đó, US22-NT2) |
| `DU_LIEU_SAI` | Thiếu một trong hai quyền, hoặc không phải boolean |

### Chủ nhà bật tắt quyền Tình trạng cọc, đổi phạm vi chia sẻ cho một sale
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| `id` | id | có | Dòng của người gọi |
| `quyen_tinh_trang_coc` | boolean | không | |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| `KHONG_TIM_THAY` | Không có dòng, hoặc người gọi không phải chủ nhà của dòng |
| `DU_LIEU_SAI` | Thân rỗng, sai kiểu, hoặc có trường không đổi được |
| `TRANG_THAI_DA_DOI` | Dòng không còn `da_ket_noi` (sale đã bỏ nguồn, đã bị ngừng). Sale đã xóa tài khoản thì đổi quyền được không: [MỞ: US17-H3]. Đổi quyền của dòng thêm tay `chua_ket_noi`: [MỞ: CH-009]; tới khi có quyết định, cũng trả mã này. Dùng mã này cho kết nối là mở rộng(bảng ghi cho yêu cầu, đặt phòng) |

### Số lần sale đã gửi link xin lịch, lần gửi gần nhất, số chủ nhà đã đồng ý
**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| `KHONG_TIM_THAY` | Người gọi vai chọn `chu_nha` |

### Danh sách thông báo của người gọi, mới trước, kèm số chưa đọc
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| `truoc` | chữ (con trỏ) | Không | Con trỏ do server trả ở `truoc_tiep`. Sai dạng: `DU_LIEU_SAI` |
| `gioi_han` | số nguyên | Không | 1 đến 100, mặc định 50 |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| DU_LIEU_SAI | `truoc` sai dạng, `gioi_han` ngoài 1 đến 100 |

### Đánh dấu đã đọc
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| `ids` | mảng id | Một trong hai | 1 đến 100 phần tử, không trùng. Mọi id phải là thông báo của người gọi |
| `tat_ca` | true | Một trong hai | Chỉ nhận `true`. Có cả `ids` và `tat_ca`, hoặc không có cái nào: `DU_LIEU_SAI` |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| DU_LIEU_SAI | Thiếu cả hai, có cả hai, `ids` rỗng, quá 100, sai kiểu (`o`: `ids` hoặc `tat_ca`) |
| KHONG_TIM_THAY | Có id không phải thông báo của người gọi, hoặc không có. Không ghi dòng nào |

## Ai được làm và việc kéo theo
Nguyên liệu chép từ đặc tả máy chủ của bản Zalo, đã đổi tên bảng và mã. Đối chiếu với hàm database ở mục Database khi viết lại story: chỗ nào lệch thì ghi vào "Database đang lệch story". Tên lỗi viết hoa (`KHONG_TIM_THAY`, `DU_LIEU_SAI`) là tên loại lỗi của bản cũ; bản PWA báo bằng câu tiếng Việt.

### Lấy link đang dùng hoặc tạo link mới để gửi qua Zalo
**Ai gọi:**
- `loai: "moi_sale"`, `"gui_lich"`: tài khoản vai chọn `chu_nha` (PQ18.CHU). Với `gui_lich`, người gọi phải là CHU của mọi căn trong `can_ids` bước 2). Tài khoản vai chọn `sale` gọi thì `KHONG_TIM_THAY`: bản đầu không có cách chia căn của sale cho sale khác (PQ13.SALE, QD-005).
- `loai: "xin_lich"`: tài khoản vai chọn `sale` (PQ18.SALE). Vai chọn `chu_nha` gọi thì `KHONG_TIM_THAY`.
- Phiên tạm (chưa có tài khoản): `CHUA_DANG_NHAP`.

**Việc kéo theo:** Không. App mở cửa sổ gửi của Zalo, server không gửi gì ra ngoài.

**Chống bấm hai lần:** có. `gui_lich` bấm hai lần với cùng `Idempotency-Key` trả cùng một link.

### Đếm một lần gửi link qua Zalo, hoặc một lần sao chép
**Ai gọi:** người tạo link (PQ18.CHU với `moi_sale`, `gui_lich`; PQ18.SALE với `xin_lich`). Người khác: `KHONG_TIM_THAY`. Phiên tạm: `CHUA_DANG_NHAP`.

**Việc kéo theo:** Không. mục "Cài đặt thông báo" (US21) (chủ nhà được báo khi sale gửi link xin lịch) chưa chốt, server không ghi thông báo.

**Chống bấm hai lần:** có. Cùng `Idempotency-Key` không đếm lần hai.

### Chủ nhà bấm "Đồng ý cho xem lịch" ở A8, kết nối với sale đã gửi link xin lịch
**Ai gọi:** người có tài khoản mở link xin lịch (PQ18.CHU, PQ17.CHU). Chủ nhà chưa có tài khoản gọi trước; phiên tạm gọi thẳng API này thì `CHUA_DANG_NHAP`. Tài khoản vai chọn `sale` bấm đồng ý: [MỞ: CH-012] (QD-005 đã chốt một tài khoản nhiều vai). Sale tự mở link của mình: [MỞ: CH-057].

**Việc kéo theo:** Thông báo `chu_dong_y_ket_noi` cho sale (mục "Cài đặt thông báo" (US21), mục "Thông báo kết quả kết nối cho sale" (US17)). Sale thấy toast chậm nhất 60 giây qua. Số "chủ nhà đã đồng ý" ở A7 tăng 1 vì đếm từ `ket_noi` `sale_xin` (US17-NT4). "Từ chối" ở A8 không gọi API nào [MỞ: CH-010].

**Chống bấm hai lần:** có.

### Chủ nhà bật tắt quyền Tình trạng cọc, đổi phạm vi chia sẻ cho một sale
**Ai gọi:** chủ nhà của dòng (PQ17.CHU). Sale của dòng không tự đổi quyền (PQ17.SALE): `KHONG_TIM_THAY`. Người khác: `KHONG_TIM_THAY`.

**Việc kéo theo:** Không có thông báo (mục "Cài đặt thông báo" (US21) không có loại đổi quyền). Có tác dụng ngay ở lần đọc sau của sale, vì server lọc theo quyền lúc đọc bước 4).

**Chống bấm hai lần:** có.

### Số lần sale đã gửi link xin lịch, lần gửi gần nhất, số chủ nhà đã đồng ý
**Ai gọi:** tài khoản vai chọn `sale` (PQ18.SALE). Chỉ số của chính mình. Vai chọn `chu_nha`: `KHONG_TIM_THAY` (nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale Ai thấy gì: chủ nhà không thấy số này).

**Việc kéo theo:** Không.

**Chống bấm hai lần:** không cần (đọc).

### Danh sách thông báo của người gọi, mới trước, kèm số chưa đọc
**Ai gọi:** người đã đăng nhập, mọi vai. Chỉ nhận thông báo có `nguoi_nhan_id` là mình (PQ19.CHU, PQ19.SALE). Phiên tạm: `CHUA_DANG_NHAP`.

**Việc kéo theo:** Không.

**Chống bấm hai lần:** không cần (đọc).

### Đánh dấu đã đọc
**Ai gọi:** người đã đăng nhập, chỉ thông báo của mình (PQ19.CHU, PQ19.SALE). Phiên tạm: `CHUA_DANG_NHAP`.

**Việc kéo theo:** Không.

**Chống bấm hai lần:** không cần `Idempotency-Key`: gọi lại cho cùng kết quả, dòng đã đọc giữ `da_doc_luc` cũ.

## Luật chung dùng
Nguyên văn ở `docs/luat-chung/` (QT.md, HV.md, Nghiep_vu.md, Tu_dien.md), tìm theo mã hoặc tên.

Quy tắc trong nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale: Xin lịch chỉ qua tin Zalo, Không biết gửi cho ai, Một link xin lịch nhiều chủ nhà, Quyền sale được xem, Nhận ra nhau bằng số điện thoại, Gom thông báo, Ngừng cho xem. HV1 đến HV3, HV5, HV8. mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5) (xin số khi bấm việc cần số), mục "Cài đặt thông báo" (US21) (thông báo, dòng 1 và 13), QD-007 (điểm 1 đến 4).

## Màn hình
Hình: `python3 docs/thiet-ke/trich-man.py <mã màn>` (docs/thiet-ke/README.md). Chữ và số trên hình lệch story thì story đúng.

A5, A6, A6-P1, A6-P2 (popup xin tên và số, phần chung của US5), A7, A7-01, CN7-03 (thẻ trong tin Zalo), A8, A8-P1, A8-P2, A8-01, A9, A9-02, P13, P13-00.

**A6 · Soạn tin xin link**
Vào từ: Xem YC (canvas chưa có mũi tên tới màn này)
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Tiêu đề | "Xin chủ nhà cho xem lịch" | Canvas |
| 2 | Khối nội dung | "Gửi tin này cho chủ nhà qua Zalo. Chủ nhà bấm link và đồng ý là bạn thấy lịch phòng trống." | Canvas |
| 3 | Khối nội dung | "TIN NHẮN SẼ GỬI" | Canvas |
| 4 | Khối nội dung | "Chào anh/chị, em là Hùng, sale phòng ở Hạ Long. Anh/chị bấm link dưới đây để cho em xem lịch phòng trống. Em gửi khách nhanh hơn, không phải gọi hỏi từng lần. zalo.me/s/home247/?xin=K7Q2" | Canvas |
| 5 | Khối nội dung | "Một link dùng được cho nhiều chủ nhà." | Canvas |
| 6 | Khối nội dung | "SAU KHI GỬI" | Canvas |
| 7 | Khối nội dung | "1 Chủ nhà mở link trong Zalo Chủ chưa dùng app sẽ đăng nhập bằng Zalo trước 2 Chủ nhà bấm "Đồng ý cho xem lịch" Bạn nhận thông báo ngay 3 Lịch của chủ hiện trong Nguồn phòng Tìm phòng trống được ngay" | Canvas |
| 8 | Khối nội dung | "Gửi qua Zalo Sao chép tin nhắn" | Canvas |
| 9 | Cỡ chữ, vùng bấm | Chữ tối thiểu 14 px, vùng bấm tối thiểu 44 px | CLAUDE.md |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Nút quay lại" | Quay lại màn trước | |
| "Gửi qua Zalo" | Mở màn A6-P1 | A6-P1 |
| "Sao chép tin nhắn" | Mở màn A7 | A7 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- không có quyền: chưa thiết kế

**A7-00 · Chờ chủ nhà · chưa gửi lần nào**
Vào từ: Tab Lịch của sale chưa có nguồn, chưa gửi
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 0 | Màn gốc | Chép đúng màn A7 trên canvas, chỉ đổi phần trạng thái. Thẻ đầu "Chưa gửi link xin lịch"; "0 lần đã gửi qua Zalo"; nút chính "Gửi tin nhắn xin lịch cho chủ nhà"; tiêu đề "Tìm phòng" như A7 | A7 |
| 1 | Giữa màn | "Chưa gửi link xin lịch", "Gửi tin xin lịch cho chủ nhà qua Zalo. Chủ nhà đồng ý là lịch hiện ở đây." | |
| 2 | Nút | "Gửi tin nhắn xin lịch cho chủ nhà" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Nút | Soạn tin | A6 |
Trạng thái riêng:
- rỗng: chính là màn này

**A7-01 · Chờ chủ nhà · quay lại từ Zalo**
Vào từ: Quay lại từ cửa sổ chia sẻ Zalo sau khi gửi
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 0 | Màn gốc | Chép đúng màn A7 trên canvas, chỉ đổi phần trạng thái. Dải "✓ Đã gửi qua Zalo..."; "4 lần đã gửi qua Zalo"; "Lần gửi gần nhất lúc vừa xong" | A7 |
| 1 | Dải xanh | "✓ Đã gửi qua Zalo. Đang chờ chủ nhà đồng ý." | Kết quả openShareSheet |
| 2 | Thẻ | "Đang chờ chủ nhà đồng ý", "3 lần đã gửi qua Zalo · 0 chủ nhà đã đồng ý" | Số lần gửi |
| 3 | Nút | "Gửi link cho chủ nhà khác" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Nút | Soạn tin | A6 |
Trạng thái riêng:
- quay lại từ nền: chính là màn này

**A7 · Đã gửi, chờ chủ nhà**
Vào từ: A6; A6-P1; A6-P2; HV4-02
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Tiêu đề | "Lịch phòng" | Canvas |
| 2 | Khối nội dung | "Đang chờ chủ nhà đồng ý Lần gửi gần nhất lúc 14:20 hôm nay. Chủ nhà nào đồng ý, lịch của họ hiện ở đây và bạn nhận thông báo." | Canvas |
| 3 | Khối nội dung | "LINK XIN LỊCH CỦA BẠN 3 lần đã gửi qua Zalo 0 chủ nhà đã đồng ý Tin được gửi từ cửa sổ của Zalo nên app không biết bạn đã gửi cho ai. App chỉ đếm số lần bạn gửi và số chủ nhà đã đồng ý." | Canvas |
| 4 | Khối nội dung | "Chủ nhà lâu chưa trả lời? Nhắn hoặc gọi để nhắc chủ mở link." | Canvas |
| 5 | Khối nội dung | "Gửi link cho chủ nhà khác" | Canvas |
| 6 | Khối nội dung | "Thêm căn tự nhập" | Canvas |
| 7 | Thanh tab | Lịch · Căn · Thống kê · Cá nhân | Cố định |
| 8 | Cỡ chữ, vùng bấm | Chữ tối thiểu 14 px, vùng bấm tối thiểu 44 px | CLAUDE.md |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Gửi link cho chủ nhà khác" | Theo YC, canvas chưa nối mũi tên | |
| "Thêm căn tự nhập" | Theo YC, canvas chưa nối mũi tên | |
Trạng thái riêng:
- rỗng: chưa thiết kế
- không có quyền: chưa thiết kế

**A8-01 · Lời mời xem lịch · link hết hạn hoặc sale bị ngừng**
Vào từ: Chủ nhà bấm link xin lịch
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 0 | Màn gốc | Chép đúng màn A8 trên canvas, chỉ đổi phần trạng thái. | A8 |
| 1 | Giữa màn | "Bạn không còn xem được mục này", "Link xin lịch đã hết hạn, sale đã xóa tài khoản, hoặc bạn đã ngừng cho sale này xem lịch." | |
| 2 | Nút | "Về Lịch" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Về Lịch" | Về lịch | CN1 |
Trạng thái riêng:
- mở từ link: chính là màn này

**A8 · Chủ nhà mở link của sale**
Vào từ: Xem YC (canvas chưa có mũi tên tới màn này)
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Tiêu đề | "Lời mời xem lịch" | Canvas |
| 2 | Khối nội dung | "H Sale Hùng 0912 345 678 xin xem lịch phòng trống của bạn để gửi khách." | Canvas |
| 3 | Khối nội dung | "NẾU ĐỒNG Ý, SALE HÙNG SẼ THẤY Phòng trống hay đã có người đặt, không thấy tên người đặt · Giá từng đêm · Đã cọc hay chưa (không thấy số tiền) Không bao giờ thấy tên, số điện thoại khách và doanh thu. Đổi được trong mục Sale." | Canvas |
| 4 | Khối nội dung | "💡 Chưa có tài khoản? Bấm Đồng ý để đăng nhập bằng Zalo, sau đó thêm căn." | Canvas |
| 5 | Khối nội dung | "Đồng ý cho xem lịch Từ chối" | Canvas |
| 6 | Cỡ chữ, vùng bấm | Chữ tối thiểu 14 px, vùng bấm tối thiểu 44 px | CLAUDE.md |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Đồng ý cho xem lịch" | Mở màn A8-P1 | A8-P1 |
| "Từ chối" | Mở màn CN7 | CN7 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- không có quyền: chưa thiết kế

**A9-02 · Nhiều chủ nhà cùng đồng ý · gom một toast**
Vào từ: S1 khi nhiều chủ nhà đồng ý gần nhau
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 2 | Vị trí toast | Toast chung: nổi trên nội dung, cách mép trái, phải 12 px, đỉnh cách đỉnh màn 108 px (ngay dưới thanh tiêu đề và cụm ··· ✕ của Zalo), nền tối, chữ trắng 14 px đậm, bo góc vừa. Mọi màn có toast dùng đúng chỗ này | |
| 3 | Toast | Một kiểu: dấu ✓, chữ đậm, không có nút ✕, tự tắt sau 3 giây | |
| 4 | Căn tự nhập | Hàng "Villa Tuần Châu · Chú Bình · tự nhập": mọi ô ngày "?", ô T7 10/10 và CN 11/10 ghi "Bạn" (booking sale tự ghi). Không có giá, không có "Kín" | mục "Lịch phòng 7 ngày" (US16) bước 3, NT3 |

**A9 · Chủ nhà đã đồng ý · toast**
Vào từ: Sale đang ở S1 khi chủ nhà đồng ý
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Lịch phòng | Lưới 7 ngày như S1 | Lịch các căn |
| 2 | Toast | "Chị Hoa đã đồng ý cho bạn xem lịch", "ICON40 1509 và 3402 đã vào Nguồn phòng", "Xem" | Kết nối |
| 3 | Vị trí toast | Toast chung: nổi trên nội dung, cách mép trái, phải 12 px, đỉnh cách đỉnh màn 108 px (ngay dưới thanh tiêu đề và cụm ··· ✕ của Zalo), nền tối, chữ trắng 14 px đậm, bo góc vừa. Mọi màn có toast dùng đúng chỗ này | |
| 4 | Toast | Một kiểu: dấu ✓, chữ đậm, không có nút ✕, tự tắt sau 3 giây | |
| 5 | Căn tự nhập | Hàng "Villa Tuần Châu · Chú Bình · tự nhập": mọi ô ngày "?", ô T7 10/10 và CN 11/10 ghi "Bạn" (booking sale tự ghi). Không có giá, không có "Kín" | mục "Lịch phòng 7 ngày" (US16) bước 3, NT3 |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Xem" | Mở nguồn phòng | S6 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- đang tải: chưa thiết kế (HV1)
- lỗi mạng: chưa thiết kế (HV2)
- quay lại từ nền: chưa thiết kế (HV3)

**CN7-03 · Sale xin xem lịch · tin nhắn Zalo**
Vào từ: Xem YC (canvas chưa có mũi tên tới màn này)
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Tiêu đề | "L Sale Lan Khung chat Zalo" | Canvas |
| 2 | Khối nội dung | "Hôm nay 09:12" | Canvas |
| 3 | Khối nội dung | "Chào anh/chị, em là Lan, sale phòng ở Hạ Long. Anh/chị bấm link dưới đây để cho em xem lịch phòng trống. Em gửi khách nhanh hơn, không phải gọi hỏi từng lần." | Canvas |
| 4 | Khối nội dung | "🏠 Sale Lan xin xem lịch phòng Lịch phòng Hạ Long · app Mở và trả lời" | Canvas |
| 5 | Khối nội dung | "Xin xem lịch chỉ đi qua tin nhắn Zalo này, app không có hộp thư xin lịch riêng. Chủ nhà bấm thẻ thì mở màn cấp quyền xem lịch (A8): chọn quyền, Đồng ý hoặc Từ chối." | Canvas |
| 6 | Cỡ chữ, vùng bấm | Chữ tối thiểu 14 px, vùng bấm tối thiểu 44 px | CLAUDE.md |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Mở và trả lời" | Theo YC, canvas chưa nối mũi tên | |
Trạng thái riêng:
- rỗng: chưa thiết kế
- không có quyền: chưa thiết kế

**P13-00 · Thông báo · chưa có**
Vào từ: Cá nhân, "Thông báo"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 0 | Màn gốc | Chép đúng màn P13 trên canvas, chỉ đổi phần trạng thái. | P13 |
| 1 | Giữa màn | "Chưa có thông báo nào", "Khi chủ nhà đồng ý cho xem lịch hay có yêu cầu đặt phòng, thông báo hiện ở đây." | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Quay lại | Về Cá nhân | P1 hoặc P4 |
Trạng thái riêng:
- rỗng: chính là màn này

**P13 · Thông báo**
Vào từ: Popup S1-06, nút "Xem tất cả thông báo"; Cá nhân, dòng "Thông báo"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Đầu danh sách | "2 chưa đọc", "Đánh dấu đã đọc" | Thông báo chưa đọc |
| 2 | Nhóm "Hôm nay" | Chưa đọc (nền xanh nhạt, chấm xanh, chữ đậm): "Chị Hoa đã sửa đặt phòng của bạn" (ICON40 1509 · 10/10 → 12/10 đổi thành 11/10 → 13/10, giá chủ nhà 2.200.000đ → 1.800.000đ, 10:15); "Chị Hoa đã chấp nhận đặt phòng" (09:05). Đã đọc (nền trắng, chữ thường): "Anh Tuấn đồng ý cho bạn xem lịch" (08:30) | mục "Cài đặt thông báo" (US21) đến 3, cùng ví dụ S1-06 |
| 3 | Nhóm "Trước đó" | "Yêu cầu đặt phòng bị từ chối" (Sapphire 1103 · 05/10 → 06/10, 04/10); "Yêu cầu đặt phòng đã hết hạn" (ICON40 1509 · 27/09 → 28/09, Hôm qua); "Căn bạn đã gửi khách vừa có người đặt" (Hôm qua) | mục "Cài đặt thông báo" (US21) |
| 4 | Ghi chú dưới | "Sale vào màn này từ Cá nhân > Thông báo, hoặc nút "Xem tất cả thông báo" ở popup hôm nay (S1-06)..."; "... Chủ nhà thấy loại của mình: sale vừa được xem lịch, yêu cầu đặt phòng mới, yêu cầu bị từ chối vì trùng đêm, booking chưa cọc." | Cố định |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Dòng chủ sửa booking | Mở booking đã sửa | S3-10 |
| Dòng chủ chấp nhận | Mở kết quả yêu cầu | S3-04 |
| Dòng kết nối mới | Mở lịch sau khi thêm | A10-02 |
| Dòng bị từ chối | Mở yêu cầu bị từ chối | S3-05 |
| Dòng hết hạn | Mở yêu cầu hết hạn | S3-09 |
| "Đánh dấu đã đọc" | Mọi dòng thành đã đọc | P13 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- đang tải: chưa thiết kế (HV1)
- lỗi mạng: chưa thiết kế (HV2)
- không có quyền: chưa thiết kế (HV5)
- quay lại từ nền: chưa thiết kế (HV3)

## Quyền
Ô quyền theo `docs/luat-chung/PQ.md`. Mỗi ô phải có test chứng minh người không có quyền thì không đọc, không ghi được; test ở lớp database (`tests/db/`).

Ô PQ chạm tới (ma trận `docs/luat-chung/PQ.md`): PQ18.SALE, PQ18.CHU, PQ18.LINK, PQ17.CHU, PQ17.SALE, PQ2.CHU, PQ1.CHU, PQ4.SALE, PQ5.SALE, PQ7.SALE, PQ19.SALE. Test vi phạm phải có (viết ở US17-TA8):
- PQ18.SALE: sale B đọc hay gọi với link của sale A thì bị từ chối; thống kê chỉ có hai con số, không có tên chủ nhà.
- PQ18.CHU, PQ18.LINK: link xin lịch của sale đã ngừng, đã xóa tài khoản hay không dùng được: và trả `LINK_KHONG_DUNG_DUOC`, không tên, không số, không tạo kết nối.
- PQ17.CHU, PQ1.CHU, PQ2.CHU: chủ nhà A không đổi quyền hay ngừng sale của chủ nhà B; số điện thoại sale chỉ trả khi sale đã cho (US17-KB14: sale bấm "Để sau" thì không có số).
- PQ17.SALE, PQ7.SALE (QD-007): sale bị ngừng gọi API lịch của chủ nhà đó thì `KHONG_CON_QUYEN`, nhưng đọc được đặt phòng cũ của mình.
- Không có phiên: mọi API trên bị từ chối (trừ xem trước link theo phiên tạm).

## Database
Đã có trong `supabase/migrations/` và đã chạy test. Tham số và cột: `docs/tu-sinh/Bang_va_cot.md`.

- `fn_lay_link_xin_lich`: test ở t_11_ket_noi_quan_tri.sql
- `fn_dem_gui_xin_lich`: test ở t_11_ket_noi_quan_tri.sql
- `fn_xem_link_xin_lich`: test ở t_11_ket_noi_quan_tri.sql
- `fn_chu_dong_y_xin_lich`: test ở t_11_ket_noi_quan_tri.sql

## Ngoài phạm vi
- Xin tên và số điện thoại, popup dùng chung (mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5)), quản lý danh sách sale, ngừng cho xem lịch (US5-NT9 đến NT3, NT5; API và CN7-04): US5. Ở đây chỉ kiểm popup hiện đúng chỗ và phần sale nhận thông báo (US17-NT9).
- Sale đã xóa tài khoản (US22-NT2), chủ nhà đã xóa tài khoản (US22-NT3): US22.
- Chủ nhà gửi lịch theo căn (mục "Chủ nhà chủ động gửi lịch cho sale" (US26)): US26.
- Popup thông báo mới hôm nay (mục "Popup thông báo mới" (US30)): US30.
- Nhóm "Nguồn phòng" mà nút "Xem" ở toast mở tới (S6): US16.
- "Gửi link cho chủ nhà khác" và "Thêm căn tự nhập" ở A7: chưa vẽ màn đích (mục "Sale xin chủ nhà cho xem lịch" bước 5).

## Việc cần làm
- [ ] Đọc story này và các luật chung nó trỏ tới. Chỗ nào gắn thẻ MỞ thì không code, hỏi Tùng (docs/Cau_hoi_mo.md).
- [ ] Viết test cho từng tiêu chí chưa có test, test đỏ trước (lớp test: docs/QUY_TRINH.md mục 6).
- [ ] Database: soát các hàm ở mục Database với tiêu chí; thiếu thì thêm migration mới và một dòng trong `scripts/thu-lam-hong.sh`.
- [ ] Giao diện: các màn ở mục Màn hình, nối với Supabase (docs/Ghi_chu_code.md).
- [ ] E2E cho luồng chính của story.
- [ ] Kiểm tay theo `tests/kich-ban/US17.md` trên điện thoại thật.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md` trong cùng PR.
