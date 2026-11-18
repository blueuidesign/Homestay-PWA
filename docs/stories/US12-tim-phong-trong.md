# US12 · Sale tìm phòng trống theo ngày

- Loại: tính năng
- Trạng thái: chờ code
- Đặc tả: thô (lắp bằng máy từ bản Zalo, chưa viết lại theo khuôn; không code theo bản này, xem US41)
- Bản: 1
- Rủi ro: cao
- Làm sau khi xong: US6, US11
- Kiểm tay: `tests/kich-ban/US12.md` (22 kịch bản)

## Mục tiêu
Là sale, tôi muốn nhập ngày khách hỏi và thấy ngay những căn còn trống, căn của tôi ở trên, để trả lời khách trong vài chạm mà không phải gọi hỏi từng chủ nhà.

## Hành vi
Bảng bước ghi: người dùng làm gì, app hiện gì (chữ trong ngoặc kép là chữ trên màn), máy chủ phải làm gì, dữ liệu nào đổi. Cột "Máy chủ" mô tả việc phải xảy ra; bản PWA làm bằng RLS, view và hàm `fn_*` của Supabase.

### Tìm phòng trống theo ngày
Rủi ro: cao
Mục đích: sale nhập ngày khách muốn ở và các điều kiện, để chỉ thấy các căn còn trống.
Màn hình: S1-02, S1-03, S2-00
Khi nào xảy ra: sale chạm ô "Tìm phòng trống theo ngày" ở tab Lịch.

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở tìm phòng | S1-02: "Ngày nhận", "Ngày trả", "Số đêm:" kèm chip 1, 2, 3, 4, "Tùy chọn". Mục "TÌM GẦN ĐÂY" (ví dụ "10/10 → 12/10 · 2PN · ICON40"). Mục "LỌC THÊM · Không bắt buộc" | đọc 5 lần tìm gần nhất của sale (giả định GD17) | Không | Không |
| 2 | Chọn ngày | S1-03 đã chọn. Nút "Tìm phòng trống" luôn dính đáy, mờ khi chưa có ngày ("Chọn ngày nhận để tìm phòng") | Không gọi server | Không | Không |
| 3 | Chọn lọc thêm | "Số phòng ngủ" (1PN, 2PN, 3PN, 4PN+), "Giá mỗi đêm" (khoảng, "Mọi mức giá" khi chưa chọn), "Tòa nhà" (ICON40, À La Carte, Sapphire, Khác), "Loại view" (theo danh sách Loại view ở `Tu_dien.md`, không có Vịnh) | Không gọi server cho số phòng ngủ, giá, loại view. Danh sách tòa: không có `q`: tòa người gọi đã dùng, rồi tòa Home247 đặt sẵn | Không | Không |
| 4 | Chạm một lần tìm gần đây | Điền sẵn điều kiện của lần đó | Không gọi server | Không | Không |
| 5 | Bấm "Tìm phòng trống" | Sang kết quả (mục "Kết quả tìm phòng") | căn trống mọi đêm trong khoảng, tổng giá chủ, tổng giá bán, căn tự nhập có cờ `khong_co_lich`; ghi lần tìm | Không | Lưu lần tìm vào "Tìm gần đây" (bảng mới `tim_gan_day`, giữ 5 lần gần nhất (giả định GD17),và mục 3) |
| 6 | Không có căn trống | S2-00: "Không có căn trống", giải thích điều kiện đã lọc, mục "GỢI Ý": "Đổi sang 11/10 → 13/10" (3 căn trống), "Bỏ lọc tòa nhà" (2 căn trống), "Thêm 2PN" (4 căn trống), nút "Sửa tìm kiếm". Ghi chú "Căn tự nhập không có lịch tự động. Gọi chủ nhà để hỏi." | không có căn trống thì trả gợi ý đổi ngày ±1, bỏ một bộ lọc, đổi số phòng ngủ, kèm số căn trống của từng gợi ý | Không | Không |

Theo quy tắc: Căn tự nhập không có lịch.

Trạng thái màn:
- rỗng: S1-02 chưa chọn ngày, nút mờ
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

### Kết quả tìm phòng
Rủi ro: cao
Mục đích: sale xem các căn trống theo ngày khách hỏi, dạng danh sách hoặc dạng lịch tuần, rồi chọn căn để gửi.
Màn hình: S2, S4
Khi nào xảy ra: sale bấm "Tìm phòng trống".

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Xem danh sách | S2: dòng điều kiện ("10/10 → 12/10 · 2PN, 3PN · 2 đêm") kèm "Sửa", "5 căn trống", hai chế độ "Danh sách" và "Lịch tuần", sắp xếp "Theo tên". Nhóm "CỦA TÔI · 1" ở đầu rồi "NGUỒN PHÒNG · 4". Mỗi thẻ: tên căn, số phòng ngủ, chủ nhà, view, giá tổng các đêm | Dùng kết quả của mục "Tìm phòng trống theo ngày" bước 5: căn trống, nhóm căn của tôi trước, tổng giá bán | Không | Không |
| 2 | Xem giá trên thẻ căn của chủ nhà | Giá chủ nhà và "bạn bán" giá đã cộng, ví dụ "2.200.000đ · bạn bán 2.600.000đ" | trả tổng giá chủ và tổng giá bán; đêm chưa đặt giá thì không có giá | Không | Không |
| 3 | Xem độ tươi lịch | "Lịch cập nhật 2 giờ trước", hoặc "Lịch của bạn, luôn đúng" với căn của tôi; căn tự nhập ghi "Tự nhập · không có lịch, gọi chú Bình hỏi" | mỗi căn có lúc lịch cập nhật (`lich_cap_nhat_luc`); căn tự nhập có cờ `khong_co_lich` và tên chủ căn (chỉ sale đã nhập) | Không | Không |
| 4 | Tích chọn căn | Dấu tích ở mỗi thẻ. Thanh đáy "Đã chọn 3 căn" và nút "Gửi cho khách" | Không gọi server | Không | Không |
| 5 | Chuyển sang "Lịch tuần" | S4: dòng "10/10 → 12/10", "5 căn trống". Không ghi, không lọc theo số khách (tạm thời), bảng căn × 7 ngày giá hoặc "Kín" hoặc "?" ("Đêm khách hỏi" được tô) | cùng điều kiện tìm, trả bảng căn × ngày | Không | Không |
| 6 | Chạm một căn | Mở chi tiết căn (S3) | Không gọi server ở bước này (chi tiết căn: mục "Chi tiết căn và giá bán" (US13)) | Không | Không |
| 7 | Bấm "Gửi cho khách" | Sang mục "Gửi thông tin cho khách qua Zalo" (US14) | Không gọi server ở bước này (gửi khách: mục "Gửi thông tin cho khách qua Zalo" (US14)) | Không | Không |

Theo quy tắc: Căn của tôi đứng đầu; Căn tự nhập không có lịch; Giá bán gồm phần cộng thêm.

Trạng thái màn:
- rỗng: S2-00, xem mục "Tìm phòng trống theo ngày"
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

## Tiêu chí nghiệm thu
Mỗi tiêu chí một test tự động mang đúng mã này trong tên test. Mã không đổi nghĩa; đổi hành vi thì cấp mã mới (docs/QUY_TRINH.md mục 5).

- **US12-NT1** Khi sale chưa chọn ngày nhận, thì nút "Tìm phòng trống" mờ và ghi "Chọn ngày nhận để tìm phòng". `[đã có test database: t_09_sale_doc.sql]`
- **US12-NT2** Khi sale chọn 10/10 và "2 đêm", thì ngày trả là 12/10.
- **US12-NT3** Khi không có căn trống, thì thấy S2-00 với ít nhất một gợi ý kèm số căn trống nếu làm theo gợi ý đó.
- **US12-NT4** Khi sale chạm một dòng "Tìm gần đây", thì các điều kiện của lần tìm đó được điền sẵn.
- **US12-NT5** Khi sale mở lọc "Loại view", thì thấy đúng các lựa chọn của danh sách Loại view trong `Tu_dien.md` và không có "Vịnh".
- **US12-NT6** Khi kết quả có căn của sale và căn trong nguồn phòng, thì nhóm "CỦA TÔI" nằm trên.
- **US12-NT7** Khi sale tích 3 căn, thì thanh đáy ghi "Đã chọn 3 căn" và nút "Gửi cho khách" dùng được.
- **US12-NT8** Khi sale chuyển giữa "Danh sách" và "Lịch tuần", thì tập căn trống và điều kiện tìm không đổi.
- **US12-NT9** Khi căn là căn tự nhập, thì thẻ ghi rõ không có lịch và gợi ý gọi chủ nhà.

## Luật kiểm dữ liệu và lỗi
Mỗi mục là một việc app nhờ database làm. "Đầu vào" là luật kiểm từng ô, "Lỗi riêng" là khi nào phải từ chối. Cột "Mã" là tên gọi trong tài liệu; hàm database báo lỗi bằng một câu tiếng Việt cho người dùng đọc (docs/luat-chung/Nghiep_vu.md mục Lỗi).

### Tìm căn trống mọi đêm trong khoảng ngày, kèm tổng giá chủ và tổng giá bán; ghi lần tìm vào Tìm gần đây
**Đầu vào**
| Trường | Ở đâu (đường dẫn, query, thân) | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|---|
| ngay_nhan | query | ngay | Có | Ngày trong quá khứ: [MỞ: US12-H1] |
| ngay_tra | query | ngay | Có | Sau `ngay_nhan`. Tối đa 30 đêm (giới hạn kỹ thuật) |
| so_phong_ngu | query | danh sách số 0 đến 4, cách nhau dấu phẩy | Không | S2 có thể lọc "2PN, 3PN". 4 là 4PN+ |
| loai_view | query | danh sách `bien`, `thanh_pho`, `nui` | Không | Theo `Tu_dien.md` Loại view, không có Vịnh (US12-NT5) |
| toa_nha_id | query | danh sách id | Không | Chip "Khác": [MỞ: US12-H2] |
| ghi_lich_su | query | boolean | Không | Mặc định `true`. `false` khi tìm căn tương tự (mục "Sale nhận kết quả yêu cầu" (US15)) |
| bo_can_ids | query | danh sách id | Không | Bỏ các căn này khỏi kết quả, cho "bỏ căn đã từ chối", mục "Sale nhận kết quả yêu cầu" (US15) bước 2) |
| sap_xep | query | chuỗi | Không | Chỉ `ten` (S2 "Theo tên"). Các cách khác ở S2: [MỞ: US12-H3] |
Lọc "Giá mỗi đêm" (mục "Tìm phòng trống theo ngày" bước 3) chưa quyết: [MỞ: US12-H4].

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| DU_LIEU_SAI | Thiếu `ngay_nhan` hay `ngay_tra`; sai định dạng; `ngay_tra` không sau `ngay_nhan`; hơn 30 đêm; giá trị lọc không thuộc danh sách (`o` là tên trường) |

### Cùng điều kiện tìm, trả bảng căn × 7 ngày cho chế độ "Lịch tuần"
**Đầu vào**
| Trường | Ở đâu (đường dẫn, query, thân) | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|---|
| ngay_nhan, ngay_tra, so_phong_ngu, loai_view, toa_nha_id, bo_can_ids | query | như | như | như |
| tu | query | ngay | Không | Ngày đầu của 7 ngày. Mặc định `ngay_nhan`. [MỞ: US12-H5] |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| DU_LIEU_SAI | Như; `tu` sai định dạng |

## Ai được làm và việc kéo theo
Nguyên liệu chép từ đặc tả máy chủ của bản Zalo, đã đổi tên bảng và mã. Đối chiếu với hàm database ở mục Database khi viết lại story: chỗ nào lệch thì ghi vào "Database đang lệch story". Tên lỗi viết hoa (`KHONG_TIM_THAY`, `DU_LIEU_SAI`) là tên loại lỗi của bản cũ; bản PWA báo bằng câu tiếng Việt.

### Tìm căn trống mọi đêm trong khoảng ngày, kèm tổng giá chủ và tổng giá bán; ghi lần tìm vào Tìm gần đây
**Ai gọi:** người dùng có tài khoản. Kết quả chỉ gồm căn người gọi có vai (mục Chung). Vai khác: căn không có trong kết quả, không lỗi.

**Việc kéo theo:** ghi Tìm gần đây (bảng trên). Không thông báo.

**Chống bấm hai lần:** không cần (đọc). Gọi hai lần cùng điều kiện tạo hai dòng `tim_gan_day` cho tới khi [MỞ: US12-H7] có câu trả lời.

### Cùng điều kiện tìm, trả bảng căn × 7 ngày cho chế độ "Lịch tuần"
**Ai gọi:** như.

**Việc kéo theo:** Không.

**Chống bấm hai lần:** không cần (đọc).

### Đọc 5 lần tìm gần nhất của sale để hiện "TÌM GẦN ĐÂY"
**Ai gọi:** người dùng có tài khoản. Chỉ đọc dòng của chính người gọi. Không có vai khác.

**Việc kéo theo:** Không.

**Chống bấm hai lần:** không cần (đọc).

## Luật chung dùng
Nguyên văn ở `docs/luat-chung/` (QT.md, HV.md, Nghiep_vu.md, Tu_dien.md), tìm theo mã hoặc tên.

Quy tắc trong nhóm Tìm phòng và gửi khách: Căn của tôi đứng đầu, Căn tự nhập không có lịch, Giá bán gồm phần cộng thêm, Độ tươi lịch. QT2.1 (căn trống khi không có đặt phòng nào chiếm đêm trong khoảng), QT1.3 (căn tự nhập). (giả định GD17) Tìm gần đây giữ 5 lần. HV1, HV2, HV3, HV5.

## Màn hình
Hình: `python3 docs/thiet-ke/trich-man.py <mã màn>` (docs/thiet-ke/README.md). Chữ và số trên hình lệch story thì story đúng.

S1-02, S1-03, S2, S2-00, S4. Chạm thẻ mở S3 (US13), bấm "Gửi cho khách" sang S5 (US14).

**S1-02 · Tìm phòng ban đầu**
Vào từ: S1, "Tìm phòng trống theo ngày"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Bộ lọc | Ngày nhận, số đêm, số khách, số phòng ngủ | Sale chọn |
| 2 | Loại view | Chip theo `Tu_dien.md`, mục Danh sách lựa chọn dùng chung (Biển, Thành phố, Núi). Không còn "Vịnh" | |
| 3 | Nút | "Tìm phòng trống" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Tìm phòng trống" | Tìm | S2 |

**S1-03 · Tìm phòng đã chọn**
Vào từ: S1, "Tìm phòng trống theo ngày"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Bộ lọc | Ngày nhận, số đêm, số khách, số phòng ngủ | Sale chọn |
| 2 | Loại view | Chip theo `Tu_dien.md`, mục Danh sách lựa chọn dùng chung (Biển, Thành phố, Núi). Không còn "Vịnh" | |
| 3 | Nút | "Tìm phòng trống" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Tìm phòng trống" | Tìm | S2 |

**S2-00 · Không có căn trống**
Vào từ: Xem YC (canvas chưa có mũi tên tới màn này)
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Tiêu đề | "10/10 → 12/10 · 3PN · 2 đêm Sửa" | Canvas |
| 2 | Khối nội dung | "Không có căn trống Các căn 3PN ở ICON40 đã kín 10/10 → 12/10. Thử một trong các cách sau:" | Canvas |
| 3 | Khối nội dung | "GỢI Ý Đổi sang 11/10 → 13/10 3 căn trống Bỏ lọc tòa nhà 2 căn trống ở Sapphire, À La Carte Thêm 2PN 4 căn trống" | Canvas |
| 4 | Khối nội dung | "Sửa tìm kiếm" | Canvas |
| 5 | Khối nội dung | "Căn tự nhập không có lịch tự động. Gọi chủ nhà để hỏi." | Canvas |
| 6 | Cỡ chữ, vùng bấm | Chữ tối thiểu 14 px, vùng bấm tối thiểu 44 px | CLAUDE.md |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Nút quay lại" | Quay lại màn trước | |
| "Sửa" | Mở màn S1-03 | S1-03 |
| "Sửa tìm kiếm" | Mở màn S1-03 | S1-03 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- không có quyền: chưa thiết kế

**S2 · Kết quả, danh sách**
Vào từ: S1-03, "Tìm phòng trống"

**S4 · Kết quả, lịch tuần**
Vào từ: S2, tab "Lịch tuần"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Đầu màn | "10/10 → 12/10 · 4 khách", "Sửa" | Lần tìm |
| 2 | Số kết quả | "5 căn trống", "Danh sách · Lịch tuần" | DLM.7 |
| 3 | Lưới tuần | 7 căn × 7 ngày 07/10 → 13/10, ô giá hoặc Kín, căn tự nhập "?" | Lịch các căn |
| 4 | Chú thích | "Đêm khách hỏi", "Kín", "?", "Số là giá đêm của bạn" | Cố định |
| 5 | Thanh dưới | "Đã chọn 3 căn", "Gửi cho khách" | Căn đã chọn |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Một hàng | Chọn, bỏ chọn căn | S4 |
| "Gửi cho khách" | Mở gửi khách | S5 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- đang tải: chưa thiết kế (HV1)
- lỗi mạng: chưa thiết kế (HV2)
- quay lại từ nền: chưa thiết kế (HV3)

## Quyền
Ô quyền theo `docs/luat-chung/PQ.md`. Mỗi ô phải có test chứng minh người không có quyền thì không đọc, không ghi được; test ở lớp database (`tests/db/`).

Ô PQ chạm tới (ma trận `docs/luat-chung/PQ.md`): PQ3.SALE, PQ4.SALE, PQ5.SALE, PQ11.SALE, PQ13.CHU (căn của tôi), PQ14.SALE, PQ23.SALE (căn của chủ nhà đã xóa tài khoản không có trong kết quả). Test vi phạm phải có:
- PQ4.SALE: sale bị ngừng, sale chưa kết nối đọc: kết quả không có căn của chủ đó, kể cả trong số đếm của gợi ý.
- PQ14.SALE, PQ13.CHU: Sale Lan tìm không thấy Villa Tuần Châu, Green Bay 0812 của Sale Hùng.
- PQ3.SALE: căn đã ẩn không có trong kết quả.
- Luật chung 3: `tim_gan_day` ghi theo người gọi, không nhận `sale_id` từ app; sale này không đọc được lần tìm của sale khác.

## Database
Đã có trong `supabase/migrations/` và đã chạy test. Tham số và cột: `docs/tu-sinh/Bang_va_cot.md`.

- `fn_sale_tim`: test ở t_09_sale_doc.sql
- `fn_ghi_tim`: CHƯA có test, viết test trước khi dùng

## Ngoài phạm vi
- Chi tiết căn S3, giá bán và mức cộng (mục "Chi tiết căn và giá bán" (US13), mục "Mức cộng giá mặc định" (US13)): US13.
- Gửi khách ở S5, mẫu tin (mục "Gửi thông tin cho khách qua Zalo" (US14), mục "Mẫu tin gửi khách" (US14)): US14. US này chỉ có nút "Gửi cho khách" ở thanh đáy.
- Lịch 7 ngày S1, sắp xếp S1-04, xoay ngang S1-05 (mục "Lịch phòng 7 ngày" (US16)): US6 (NT2, NT5), US16 (NT1, NT3, NT4), US22 (NT6).
- Nhập và quản lý căn tự nhập (nhóm Nguồn phòng và căn tự nhập): US16. US này chỉ hiện căn tự nhập đã có, ô ngày "?".
- Gửi yêu cầu đặt phòng (mục "Sale gửi yêu cầu đặt phòng" (US15)): US15.
- Lọc theo số khách: tạm thời không làm (CH-073).
- Sắp xếp "Giá tăng dần", "Bán nhiều nhất" ở S2: chưa chốt (CH-071). Chỉ có "Theo tên".
- Lọc "Giá mỗi đêm": [MỞ: US12-H6] chưa có lọc giá. Không code, không có kịch bản.

## Việc cần làm
- [ ] Đọc story này và các luật chung nó trỏ tới. Chỗ nào gắn thẻ MỞ thì không code, hỏi Tùng (docs/Cau_hoi_mo.md).
- [ ] Viết test cho từng tiêu chí chưa có test, test đỏ trước (lớp test: docs/QUY_TRINH.md mục 6).
- [ ] Database: soát các hàm ở mục Database với tiêu chí; thiếu thì thêm migration mới và một dòng trong `scripts/thu-lam-hong.sh`.
- [ ] Giao diện: các màn ở mục Màn hình, nối với Supabase (docs/Ghi_chu_code.md).
- [ ] E2E cho luồng chính của story.
- [ ] Kiểm tay theo `tests/kich-ban/US12.md` trên điện thoại thật.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md` trong cùng PR.
