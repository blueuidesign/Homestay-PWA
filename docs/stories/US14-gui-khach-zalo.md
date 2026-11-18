# US14 · Gửi thông tin và ảnh cho khách, mẫu tin

- Loại: tính năng
- Trạng thái: chưa làm
- Đặc tả: thô (lắp bằng máy từ bản Zalo, chưa viết lại theo khuôn; không code theo bản này, xem US41)
- Bản: 1
- Rủi ro: cao
- Làm sau khi xong: US13, US17
- Kiểm tay: `tests/kich-ban/US14.md` (25 kịch bản)

## Mục tiêu
Là sale, tôi muốn gửi mô tả, giá bán và ảnh của vài căn cho khách qua Zalo trong vài chạm, để khách thấy giá của tôi mà không bao giờ thấy giá chủ nhà, và tôi biết khi căn đã gửi có người đặt.

## Hành vi
Bảng bước ghi: người dùng làm gì, app hiện gì (chữ trong ngoặc kép là chữ trên màn), máy chủ phải làm gì, dữ liệu nào đổi. Cột "Máy chủ" mô tả việc phải xảy ra; bản PWA làm bằng RLS, view và hàm `fn_*` của Supabase.

### Gửi thông tin cho khách qua Zalo
> **Bản PWA:** gửi bằng bảng chia sẻ của điện thoại, thiếu thì sao chép. Xem `PWA.md` mục P3 và CH-003.
Rủi ro: cao
Mục đích: sale gửi cho khách mô tả, giá và ảnh của các căn đã chọn qua Zalo, trong vài chạm.
Màn hình: S5
Khi nào xảy ra: sale đã chọn căn và bấm "Gửi cho khách" (S2, S3, S6-03, S6-07).

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 0 | Bấm "Gửi cho khách" | Chạy mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5) nếu hồ sơ sale chưa có số (mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5)), rồi mở S5. Bấm "Để sau" vẫn mở S5 | đổi token số điện thoại một lần trong 2 phút, ghi `sdt`, `ten`, `anh_dai_dien`; từ chối hay "Để sau" thì không gọi | Hộp thoại xin quyền của Zalo (mục "Hộp thoại cấp quyền của Zalo" (US5)) | Số điện thoại vào hồ sơ nếu sale cho phép |
| 1 | Mở màn | Tiêu đề "Gửi cho khách". Dòng "3 căn · 10/10 → 12/10. Zalo không gửi chữ và ảnh chung một tin: mỗi căn gửi chữ một lần, ảnh một lần." | mỗi căn chữ theo mẫu tin của sale, giá bán không giá chủ, đường dẫn ảnh có chữ ký. Không ghi gì | Không | Không |
| 2 | Xem một căn | Số thứ tự, tên căn, số ảnh ("6 ảnh"), nội dung chữ ("ICON40 1509 · 2PN, view biển Bãi Cháy / 10/10 → 12/10 (2 đêm): 2.600.000đ"), không có tiện ích căn. Phần phòng ngủ ghi theo `Tu_dien.md`: có số giường thì "2PN · 3 giường"; không ghi số khách. Số giường của 1509 chưa có trong dữ liệu mẫu | Không gọi server, dùng chữ bước 1 trả về (| Không | Không |
| 3 | Bấm "Gửi chữ qua Zalo" | Mở cửa sổ gửi của Zalo với chữ có sẵn; sale chọn người nhận và bấm gửi | xem bước 7; server không gửi gì ra ngoài | Cửa sổ chia sẻ của Zalo | Không (lần gửi: bước 7) |
| 4 | Bấm "Gửi 6 ảnh qua Zalo" | Mở cửa sổ gửi của Zalo với ảnh | xem bước 7; ảnh mở bằng đường dẫn có chữ ký bước 1 trả về | Cửa sổ chia sẻ của Zalo | Không (lần gửi: bước 7) |
| 5 | Bấm "Sao chép chữ" | Sao chép chữ của căn đó | Không gọi server | Không | Không |
| 6 | Bấm "Sao chép chữ cả 3 căn" | Sao chép chữ cả 3 căn để dán vào tin nhắn bất kỳ ("Hoặc sao chép chữ rồi dán vào tin nhắn bất kỳ") | Không gọi server | Không | Không |
| 7 | Đã gửi một căn (bước 3 hoặc 4) | Không đổi gì trên màn | Ghi lần gửi: căn, các đêm, lúc gửi. Chỉ ghi căn và ngày, không ghi khách (QD-011) | | Lần gửi khách của sale |
| 8 | (sau đó) Có booking mới chiếm ít nhất một đêm của lần gửi | Thông báo "<tòa> <căn> · <ngày nhận> → <ngày trả> vừa có người đặt" ở P13 (mục "Cài đặt thông báo" (US21)) | Tìm lần gửi còn hiệu lực có đêm trùng, gửi thông báo theo quy tắc Báo căn đã gửi có người đặt | | Thông báo của sale |

Theo quy tắc: Chữ và ảnh gửi riêng; Giá bán gồm phần cộng thêm; Mẫu tin gửi khách; Báo căn đã gửi có người đặt.

Trạng thái màn:
- rỗng: không áp dụng
- đang tải: theo HV1 (lúc chuẩn bị ảnh)
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: theo HV4
- quay lại từ nền: theo HV3; sale gửi xong quay lại app; chưa vẽ nhãn "Đã gửi"
- mở từ link: không áp dụng

### Mẫu tin gửi khách
Rủi ro: tb
Mục đích: sale tùy chỉnh câu chữ tin gửi khách bằng các ô điền sẵn, để mỗi lần gửi không phải gõ lại.
Màn hình: P11
Khi nào xảy ra: sale vào Cá nhân > "Mẫu tin gửi khách".

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở màn | Ô soạn "Mẫu tin" và hàng "Chạm để chèn": [Ngày], [Số đêm], [Số căn], [Danh sách căn], [Tên sale] | có mẫu tin | Không | Không |
| 2 | Chạm một ô | Chèn ô đó vào mẫu | Không gọi server | Không | Không |
| 3 | Xem "KHÁCH SẼ NHẬN ĐƯỢC" | Bản xem trước với 3 căn trống 10/10 → 12/10 ("Em gửi anh chị 3 căn còn trống 10/10 → 12/10 (2 đêm):...") | Không gọi server: app dựng bản xem trước từ mẫu và một căn mẫu | Không | Không |
| 4 | Bấm "Dùng lại mẫu mặc định" | Về mẫu mặc định | Không gọi server | Không | Không |
| 5 | Bấm "Lưu thay đổi" | Lưu mẫu | | Không | Mẫu tin của sale |

Theo quy tắc: Mẫu tin gửi khách.

Trạng thái màn:
- rỗng: không áp dụng
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

## Tiêu chí nghiệm thu
Mỗi tiêu chí một test tự động mang đúng mã này trong tên test. Mã không đổi nghĩa; đổi hành vi thì cấp mã mới (docs/QUY_TRINH.md mục 5).

- **US14-NT1** Khi sale chọn 3 căn, thì S5 có 3 khối, mỗi khối một nút gửi chữ và một nút gửi ảnh.
- **US14-NT2** Khi sale bấm "Gửi chữ qua Zalo", thì cửa sổ Zalo mở với chữ của đúng căn đó.
- **US14-NT3** Khi sale bấm "Sao chép chữ cả 3 căn", thì bộ nhớ tạm có chữ của cả 3 căn theo thứ tự trên màn.
- **US14-NT4** Khi chữ gửi khách hiện giá, thì đó là giá bán cho khách và không có giá chủ nhà.
- **US14-NT5** Khi căn gửi khách có số giường, thì chữ gửi khách ghi số phòng ngủ và số giường theo `Tu_dien.md`, mục Phòng ngủ và số giường của căn; chữ không có "x khách".
- **US14-NT6** Khi sale đã gửi một căn cho khách và sau đó có booking mới của người khác chiếm ít nhất một đêm của lần gửi, thì sale nhận thông báo "<tòa> <căn> · <ngày nhận> → <ngày trả> vừa có người đặt" ở P13.
- **US14-NT7** Khi sale nhận thông báo này, thì thông báo không có tên người đặt và không có giá (QD-011).
- **US14-NT8** Khi chính sale đã gửi là người đặt căn đó, thì sale không nhận thông báo này.
- **US14-NT9** Khi booking mới được tạo sau ngày nhận phòng của lần gửi, thì sale không nhận thông báo cho lần gửi đó.
- **US14-NT10** Khi có hai booking mới cùng chiếm đêm của một lần gửi, thì sale chỉ nhận một thông báo cho căn đó của lần gửi đó.
- **US14-NT11** Khi hồ sơ sale chưa có số điện thoại và sale bấm "Gửi cho khách", thì popup giải thích xin tên và số hiện trước hộp thoại Zalo; bấm "Để sau" thì S5 vẫn mở. Khi hồ sơ đã có số, thì S5 mở ngay, không có popup. (mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5))
- **US14-NT12** Khi sale xem chữ gửi khách của một căn ở S5, thì chữ không có tiện ích căn (bếp, máy giặt, bể bơi...).
- **US14-NT13** Khi sale chạm "[Ngày]", thì mẫu có thêm ô [Ngày] và bản xem trước hiện ngày thật.
- **US14-NT14** Khi sale bấm "Dùng lại mẫu mặc định", thì mẫu về nội dung mặc định.
- **US14-NT15** Khi sale gửi khách ở S5, thì chữ gửi theo mẫu đã lưu.

## Luật kiểm dữ liệu và lỗi
Mỗi mục là một việc app nhờ database làm. "Đầu vào" là luật kiểm từng ô, "Lỗi riêng" là khi nào phải từ chối. Cột "Mã" là tên gọi trong tài liệu; hàm database báo lỗi bằng một câu tiếng Việt cho người dùng đọc (docs/luat-chung/Nghiep_vu.md mục Lỗi).

### Dựng chữ theo mẫu tin của sale và đường dẫn ảnh cho từng căn đã chọn, để hiện S5
**Đầu vào**
| Trường | Ở đâu (đường dẫn, query, thân) | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|---|
| can_ids | thân | id[] | Có | 1 đến 20 căn, không trùng (giới hạn kỹ thuật; số tối đa theo nghiệp vụ: [MỞ: US14-H1]). Thứ tự giữ như app gửi |
| ngay_nhan | thân | ngay | Có | |
| ngay_tra | thân | ngay | Có | Sau `ngay_nhan`, tối đa 30 đêm |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| DU_LIEU_SAI | Thiếu trường; `can_ids` rỗng, trùng, quá 20; ngày sai |
| KHONG_TIM_THAY | Một căn không có vai được phép (`o`: `can_ids`) |
| KHONG_CON_QUYEN | Một căn của chủ nhà đã ngừng người gọi |

### Ghi một lần sale gửi chữ hoặc ảnh của một căn cho khách, để sau này báo khi căn có người đặt
**Đầu vào**
| Trường | Ở đâu (đường dẫn, query, thân) | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|---|
| can_id | thân | id | Có | |
| ngay_nhan | thân | ngay | Có | |
| ngay_tra | thân | ngay | Có | Sau `ngay_nhan`, tối đa 30 đêm |
App gọi khi sale bấm "Gửi chữ qua Zalo" hoặc "Gửi ảnh qua Zalo", không gọi khi "Sao chép chữ" (mục "Gửi thông tin cho khách qua Zalo" bước 5, 6). [MỞ: CH-026] [MỞ: US14-H3].

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| DU_LIEU_SAI | Thiếu trường, ngày sai |
| KHONG_TIM_THAY | Không có vai với căn |
| KHONG_CON_QUYEN | Chủ nhà đã ngừng người gọi |

## Ai được làm và việc kéo theo
Nguyên liệu chép từ đặc tả máy chủ của bản Zalo, đã đổi tên bảng và mã. Đối chiếu với hàm database ở mục Database khi viết lại story: chỗ nào lệch thì ghi vào "Database đang lệch story". Tên lỗi viết hoa (`KHONG_TIM_THAY`, `DU_LIEU_SAI`) là tên loại lỗi của bản cũ; bản PWA báo bằng câu tiếng Việt.

### Dựng chữ theo mẫu tin của sale và đường dẫn ảnh cho từng căn đã chọn, để hiện S5
**Ai gọi:** người dùng có tài khoản, có vai `nguon_phong` hoặc `tu_nhap` với mọi căn trong `can_ids`. Căn `cua_toi`: [MỞ: US14-H4] giá trong chữ là giá nào; tới khi có câu trả lời, chữ dùng giá chủ của căn. Một căn không có vai thì cả lệnh lỗi (mục Chung), không trả phần nào.

**Việc kéo theo:** Không. Server không gửi gì ra ngoài; app mở cửa sổ Zalo.

**Chống bấm hai lần:** không cần (không ghi). Không nhận `Idempotency-Key`.

### Ghi một lần sale gửi chữ hoặc ảnh của một căn cho khách, để sau này báo khi căn có người đặt
**Ai gọi:** người dùng có vai `nguon_phong`, `tu_nhap` hoặc `cua_toi` với căn (PQ12.SALE: chỉ của mình). Vai khác: lỗi quyền chung.

**Việc kéo theo:** Không ở lệnh này. Lúc có đặt phòng mới (đổi ngày), các API đó tìm `lan_gui_khach` theo: cùng căn, chồng ít nhất một đêm, `gui_luc` trước lúc tạo đặt phòng, ngày nhận của lần gửi chưa qua, `da_bao_luc` trống, sale khác sale của đặt phòng. Mỗi dòng ghi một `thong_bao` loại `can_da_gui_co_nguoi_dat` cho sale, không tên người đặt, không giá, rồi đặt `da_bao_luc` (US14-NT6 đến NT10, mục "Cài đặt thông báo" (US21), PQ19.SALE). Căn tự nhập chỉ sale đó ghi đặt phòng, nên không bao giờ báo.

**Chống bấm hai lần:** có (`Idempotency-Key`), thêm chỉ mục duy nhất theo ngày ở trên.

## Màn hình
Hình: `python3 docs/thiet-ke/trich-man.py <mã màn>` (docs/thiet-ke/README.md). Chữ và số trên hình lệch story thì story đúng.

S5, S5-P1, S5-P2 (giải thích và hộp thoại xin tên, số, phần dùng chung làm ở US5), P11, P13 (dòng thông báo "vừa có người đặt", màn P13 làm ở US17).

**P11 · Mẫu tin gửi khách**
Vào từ: P1 của sale, "Mẫu tin gửi khách"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Mẫu tin | Ô sửa mẫu, chip chèn "[Ngày]", "[Số đêm]", "[Số căn]", "[Danh sách căn]", "[Tên sale]" | Cài đặt sale |
| 2 | Khách sẽ nhận được | "1. Căn view biển Bãi Cháy, 2PN: 2.600.000đ / 2 đêm", "2. Sapphire 1103, 3PN, view thành phố: 1.600.000đ / 2 đêm", "3. À La Carte 2208, 1PN, view biển: 3.600.000đ / 2 đêm" | DLM.7 |
| 3 | Nút | "Dùng lại mẫu mặc định", "Lưu thay đổi" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Một chip | Chèn vào mẫu | P11 |
| "Lưu thay đổi" | Lưu | P1 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- đang tải: chưa thiết kế (HV1)
- lỗi mạng: chưa thiết kế (HV2)
- quay lại từ nền: chưa thiết kế (HV3)

**S5-P1 · Gửi cho khách · giải thích xin tên và số**
Vào từ: S3, bấm việc cần tên và số khi hồ sơ chưa có số
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Màn gốc | Chép đúng S3, phủ lớp tối | S3 |
| 2 | Popup dưới đáy | Biểu tượng điện thoại, tiêu đề "Thêm tên và số điện thoại vào tin gửi khách", lý do, bước "Zalo sẽ hiện hộp thoại. Bật Tên và ảnh đại diện, Số điện thoại rồi bấm Cho phép." | mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5) Sửa r4 |
| 3 | Nút | "Đồng ý, tiếp tục", "Để sau", dòng "Để sau vẫn … được" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Đồng ý, tiếp tục" | Mở hộp thoại Zalo | S5-P2 |
| "Để sau" | Làm tiếp việc gốc không có số | S5 |

**S5-P2 · Gửi cho khách · hộp thoại Zalo**
Vào từ: S5-P1, bấm "Đồng ý, tiếp tục"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Màn gốc | Chép đúng S3, phủ lớp tối | S3 |
| 2 | Hộp thoại minh họa | "Tên và ảnh đại diện · Sale Hùng", "Số điện thoại · 0912 345 678", nút "Cho phép" | Zalo |
| 3 | Ghi chú | Ghi chú trên màn: Zalo hiện một hộp thoại có hai dòng hay hai hộp thoại nối nhau, thứ tự nào: chờ | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Cho phép" | Lưu tên, ảnh, số vào hồ sơ, làm tiếp việc gốc | S5 |

**S5 · Gửi cho khách**
Vào từ: S2, S3, S4: "Gửi cho khách"

## Quyền
Ô quyền theo `docs/luat-chung/PQ.md`. Mỗi ô phải có test chứng minh người không có quyền thì không đọc, không ghi được; test ở lớp database (`tests/db/`).

Ô PQ chạm tới (ma trận `docs/luat-chung/PQ.md`): PQ3.SALE, PQ5.SALE, PQ5.KHACH, PQ11.SALE, PQ11.KHACH, PQ12.SALE, PQ12.CHU, PQ14.SALE, PQ19.SALE. Test vi phạm phải có:
- PQ11.SALE: mẫu tin của Sale Lan không có chữ của Sale Hùng; không nhận `sale_id`.
- PQ3.SALE, PQ14.SALE: `can_ids` có căn ngoài phạm vi, căn đã ẩn hay Villa Tuần Châu của Hùng khi Lan đọc: `KHONG_TIM_THAY`, không trả căn nào; ảnh qua đường dẫn hết hạn không mở được.
- PQ12.SALE: có `sale_id` khác bị bỏ qua; không API nào trả lần gửi của sale khác; sale bị ngừng gọi `KHONG_CON_QUYEN`.
- PQ12.CHU: Chị Hoa không đọc được lần gửi của Hùng qua, (không có trường lần gửi).
- PQ19.SALE: thông báo "vừa có người đặt" không có tên người đặt, không có giá; Chị Hoa (chủ nhà) không nhận thông báo này.

## Database
Đã có trong `supabase/migrations/` và đã chạy test. Tham số và cột: `docs/tu-sinh/Bang_va_cot.md`.

Bảng `lan_gui_khach` (chỉ sale đó đọc).

- `fn_ghi_lan_gui`: test ở t_08_thong_bao.sql
- `fn_luu_cai_dat`: test ở t_07_can_gia_mo_rong.sql, t_08_thong_bao.sql

## Ngoài phạm vi
- Chọn căn, tích chọn, thanh đáy "Gửi cho khách" (mục "Kết quả tìm phòng" (US12)): US12.
- Chi tiết căn S3, giá bán và mức cộng (mục "Chi tiết căn và giá bán" (US13), mục "Mức cộng giá mặc định" (US13)): US13.
- Hộp thoại xin tên và số điện thoại (mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5)): phần dùng chung làm ở US5. US này chỉ gọi nó khi hồ sơ chưa có số (mục "Gửi thông tin cho khách qua Zalo" bước 0).
- Màn P13 danh sách thông báo (mục "Thông báo kết quả kết nối cho sale" (US17)): US17. Popup thông báo mới (mục "Popup thông báo mới" (US30)): US30. Công tắc bật tắt từng loại thông báo (mục "Cài đặt thông báo" (US21)): US21.
- Gửi yêu cầu đặt phòng, chủ nhà chấp nhận (mục "Sale gửi yêu cầu đặt phòng" (US15), mục "Chủ nhà nhận và trả lời yêu cầu" (US15)): US15. Hàm báo "căn đã gửi có người đặt" làm ở đây, (US3) gọi nó; chỗ gọi từ làm ở US15, từ đổi ngày làm ở US10 [MỞ: US14-H2] bảng phủ không nêu.
- Nhãn "Đã gửi" trên màn và đếm lần gửi cho thống kê (CH-072): chưa làm.
- Chọn ảnh khi căn có hơn 10 ảnh, giới hạn số căn mỗi lần gửi (CH-070, 8): chưa chốt.

## Việc cần làm
- [ ] Đọc story này và các luật chung nó trỏ tới. Chỗ nào gắn thẻ MỞ thì không code, hỏi Tùng (docs/Cau_hoi_mo.md).
- [ ] Viết test cho từng tiêu chí chưa có test, test đỏ trước (lớp test: docs/QUY_TRINH.md mục 6).
- [ ] Database: soát các hàm ở mục Database với tiêu chí; thiếu thì thêm migration mới và một dòng trong `scripts/thu-lam-hong.sh`.
- [ ] Giao diện: các màn ở mục Màn hình, nối với Supabase (docs/Ghi_chu_code.md).
- [ ] E2E cho luồng chính của story.
- [ ] Kiểm tay theo `tests/kich-ban/US14.md` trên điện thoại thật.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md` trong cùng PR.
