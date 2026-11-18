# US13 · Chi tiết căn, giá bán và mức cộng của sale

- Loại: tính năng
- Trạng thái: chờ code
- Đặc tả: thô (lắp bằng máy từ bản Zalo, chưa viết lại theo khuôn, chưa áp các quyết định ở `docs/tham-khao/Loi_Tung_ban_Zalo.md`; không code theo bản này, xem US41)
- Bản: 1
- Rủi ro: cao
- Làm sau khi xong: US12
- Kiểm tay: `tests/kich-ban/US13.md` (24 kịch bản)

## Mục tiêu
Là sale, tôi muốn xem một căn đủ để tư vấn và cộng phần của mình vào giá chủ nhà, để biết giá bán cho khách mà chủ nhà và khách không thấy phần cộng thêm.

## Hành vi
Bảng bước ghi: người dùng làm gì, app hiện gì (chữ trong ngoặc kép là chữ trên màn), máy chủ phải làm gì, dữ liệu nào đổi. Cột "Máy chủ" mô tả việc phải xảy ra; bản PWA làm bằng RLS, view và hàm `fn_*` của Supabase.

### Chi tiết căn và giá bán
Rủi ro: cao
Mục đích: sale xem một căn đủ thông tin để tư vấn, chỉnh mức cộng giá của mình cho căn này, và quyết định đặt hay gửi khách.
Màn hình: S3
Khi nào xảy ra: sale chạm một căn ở lịch phòng hoặc ở kết quả tìm.

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở chi tiết | Bộ ảnh ("1/6"), tên "ICON40 1509 · 2PN", "2PN · view biển · Bãi Cháy", nhãn "Lịch cập nhật 2 giờ trước". Phần phòng ngủ ghi theo `Tu_dien.md` như thẻ căn (mục "Danh sách căn" (US1) bước 2): có số giường thì "2PN · 3 giường"; không hiện số khách. Số giường của 1509 chưa có trong dữ liệu mẫu | chỉ căn sale có quyền, số phòng ngủ, số giường, mô tả, lúc lịch cập nhật; ảnh là đường dẫn có chữ ký 1 giờ | Không | Không |
| 2 | Xem chủ nhà | Thẻ "Chị Hoa · Chủ nhà · 2 căn" kèm nút "Gọi" | tên và số điện thoại chủ nhà (PQ2.SALE). Số căn chủ nhà chia sẻ cho sale này. | Gọi mở ứng dụng gọi (`openPhone`, `docs/zalo/hanh-vi.md`) | Không |
| 3 | Xem giá | Ngày ở "10/10 → 12/10 (2 đêm)", "Giá chủ nhà 2.200.000đ" | giá chủ và giá bán theo đêm; đêm chưa đặt giá thì không có giá | Không | Không |
| 4 | Chọn mức cộng | Mục "CỘNG THÊM CHO BẠN": chip theo danh sách Mức cộng của sale ở `Tu_dien.md`, cùng bộ với P10 (mục "Mức cộng giá mặc định"). Cập nhật "Giá bán cho khách". Ghi chú "Chỉ bạn thấy giá này. Khách và chủ nhà không thấy phần cộng thêm." | mức cộng riêng căn này | Không | Mức cộng riêng cho căn (bảng `muc_cong`: `sale_id`, `can_id`, `so_tien`) |
| 5 | Xem lịch | "Lịch 2 tuần tới" Trống / Kín; "Ngày khách hỏi" được tô | lịch 2 tuần của căn | Không | Không |
| 6 | Xem giờ nhận, trả phòng | "Nhận phòng 14:00 · Trả phòng 12:00". Không có tiện ích căn (Bếp, Máy giặt...): bản đầu không làm tiện ích căn. | giờ nhận, trả phòng của chủ nhà | Không | Không |
| 7 | Bấm "Gửi yêu cầu đặt phòng" (Tu_dien) | Mở S3-02 (thuộc mục "Sale gửi yêu cầu đặt phòng" (US15)) | Không gọi server ở bước này (yêu cầu đặt phòng: mục "Sale gửi yêu cầu đặt phòng" (US15), | Không | Không |
| 8 | Bấm "Gửi cho khách" | Sang mục "Gửi thông tin cho khách qua Zalo" (US14) với căn này (có bước xin tên và số khi chưa có, mục "Gửi thông tin cho khách qua Zalo" (US14) bước 0) | Không gọi server ở bước này (gửi khách: mục "Gửi thông tin cho khách qua Zalo" (US14)) | Không | Không |

Theo quy tắc: Giá bán gồm phần cộng thêm; Sale chỉ thấy giá khi chủ nhà cho phép (nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale, Quyền sale được xem).

Trạng thái màn:
- rỗng: không áp dụng
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

### Mức cộng giá mặc định
Rủi ro: cao
Mục đích: sale đặt một lần mức cộng thêm vào giá chủ nhà để mọi tin gửi khách đã có giá bán.
Màn hình: P10
Khi nào xảy ra: sale vào Cá nhân > "Mức cộng giá mặc định".

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở màn | "Cộng thêm vào giá chủ nhà mỗi đêm khi soạn tin gửi khách. Khách chỉ thấy giá đã cộng." | có mức cộng, làm tròn | Không | Không |
| 2 | Chọn mức | Chip theo danh sách Mức cộng của sale ở `Tu_dien.md`, cùng bộ với S3 (mục "Chi tiết căn và giá bán") | Không gọi server | Không | Không |
| 3 | Bật "Làm tròn lên 50.000đ" | Công tắc | Không gọi server | Không | Không |
| 4 | Xem ví dụ | "VÍ DỤ: PHÒNG 1509, 2 ĐÊM": Giá chủ nhà 2.200.000đ, Giá gửi khách 3.000.000đ, Bạn được 800.000đ | Không gọi server | Không | Không |
| 5 | Bấm "Lưu thay đổi" | Lưu. Ghi chú "Khi soạn tin (S3) vẫn sửa được mức cộng cho từng căn." | | Không | Mức cộng mặc định của sale |

Theo quy tắc: Giá bán gồm phần cộng thêm.

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

- **US13-NT1** Khi sale chọn chip +200k cho phòng 2 đêm, thì giá bán bằng giá chủ nhà cộng 200.000đ nhân số đêm. `[đã có test database: t_07_can_gia_mo_rong.sql]`
- **US13-NT2** Khi sale xem chi tiết, thì thấy giá chủ nhà và giá bán cho khách; chủ nhà và khách không thấy phần cộng thêm.
- **US13-NT3** Khi sale bấm "Gửi yêu cầu đặt phòng", thì app mở S3-02 với đúng căn và ngày đang xem.
- **US13-NT4** Khi sale mở mục "CỘNG THÊM CHO BẠN" ở S3, thì thấy đúng các chip của danh sách Mức cộng của sale trong `Tu_dien.md`, giống bộ chip ở P10.
- **US13-NT5** Khi chủ nhà đã nhập số giường của căn, thì S3 ghi số phòng ngủ và số giường như thẻ căn (US11-NT1); chưa nhập thì chỉ ghi số phòng ngủ. S3 không có "x khách", "x người lớn" hay "y trẻ em".
- **US13-NT6** Khi sale mở S3 của bất kỳ căn nào, thì không có mục tiện ích căn; dòng giờ "Nhận phòng 14:00 · Trả phòng 12:00" vẫn còn.
- **US13-NT7** Khi sale chọn "+400k", thì ví dụ 2 đêm ghi bạn được 800.000đ.
- **US13-NT8** Khi sale chọn "Không cộng", thì giá gửi khách bằng giá chủ nhà.
- **US13-NT9** Khi sale bật làm tròn lên 50.000đ, thì giá gửi khách làm tròn lên bội số 50.000đ gần nhất. `[đã có test database: t_07_can_gia_mo_rong.sql]`
- **US13-NT10** Khi sale mở P10, thì thấy đúng các chip của danh sách Mức cộng của sale trong `Tu_dien.md`, giống bộ chip ở S3.

## Luật kiểm dữ liệu và lỗi
Mỗi mục là một việc app nhờ database làm. "Đầu vào" là luật kiểm từng ô, "Lỗi riêng" là khi nào phải từ chối. Cột "Mã" là tên gọi trong tài liệu; hàm database báo lỗi bằng một câu tiếng Việt cho người dùng đọc (docs/luat-chung/Nghiep_vu.md mục Lỗi).

### Chi tiết một căn của chủ nhà cho sale
**Đầu vào**
| Trường | Ở đâu (đường dẫn, query, thân) | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|---|
| id | đường dẫn | id | Có | |
| ngay_nhan | query | ngay | Không | Đi cùng `ngay_tra`. Mở từ S1 không có ngày: [MỞ: US13-H1] |
| ngay_tra | query | ngay | Không | Sau `ngay_nhan`, tối đa 30 đêm |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| DU_LIEU_SAI | Chỉ gửi một trong hai ngày; sai định dạng; `ngay_tra` không sau `ngay_nhan`; hơn 30 đêm |
| KHONG_TIM_THAY | Không có vai `nguon_phong` với căn (mục Chung) |
| KHONG_CON_QUYEN | Chủ nhà đã ngừng người gọi (mục Chung) |

### Đặt mức cộng riêng của sale cho một căn
**Đầu vào**
| Trường | Ở đâu (đường dẫn, query, thân) | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|---|
| id | đường dẫn | id | Có | |
| so_tien | thân | tien | Có | Số nguyên không âm, tối đa 10.000.000 (giới hạn kỹ thuật). 0 là "Không cộng". Chip theo `Tu_dien.md` Mức cộng của sale; "Tùy chọn" là số bất kỳ trong giới hạn |
| ngay_nhan, ngay_tra | thân | ngay | Không | Có thì trả lại giá theo mức mới, như |
`so_tien` 0 lưu thành dòng `muc_cong` với 0, không xóa dòng. Cách quay về mức mặc định: [MỞ: US13-H2].

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| DU_LIEU_SAI | Thiếu `so_tien`; số lẻ, số âm, quá giới hạn; ngày sai như |
| KHONG_TIM_THAY | Không có vai được phép với căn |
| KHONG_CON_QUYEN | Chủ nhà đã ngừng người gọi |

## Ai được làm và việc kéo theo
Nguyên liệu chép từ đặc tả máy chủ của bản Zalo, đã đổi tên bảng và mã. Đối chiếu với hàm database ở mục Database khi viết lại story: chỗ nào lệch thì ghi vào "Database đang lệch story". Tên lỗi viết hoa (`KHONG_TIM_THAY`, `DU_LIEU_SAI`) là tên loại lỗi của bản cũ; bản PWA báo bằng câu tiếng Việt.

### Chi tiết một căn của chủ nhà cho sale
**Ai gọi:** sale có vai `nguon_phong` với căn (PQ3.SALE). Vai khác: lỗi quyền chung. Căn `cua_toi` và `tu_nhap`: [MỞ: US13-H5] chạm căn của tôi hay căn tự nhập ở S1 mở S3 (mục "Lịch phòng 7 ngày" (US16) bước 8) hay S6-07, S6-03 (mục "Danh sách căn và nguồn phòng" (US16) bước 9, mục "Chi tiết căn tự nhập" (US16)). Bản này chỉ đặc tả vai `nguon_phong`; tới khi có câu trả lời, căn `cua_toi`, `tu_nhap` dùng (can-anh.md) và API này trả `KHONG_TIM_THAY`.

**Việc kéo theo:** Không.

**Chống bấm hai lần:** không cần (đọc).

### Đặt mức cộng riêng của sale cho một căn
**Ai gọi:** sale có vai `nguon_phong` với căn (PQ11.SALE), hoặc CHU của căn `tu_nhap` (giá bán căn tự nhập dùng mức cộng này, Thiet_ke_DB `muc_cong`, PQ14.SALE). Căn `cua_toi`: [MỞ: US13-H6]; tới khi có câu trả lời, `KHONG_TIM_THAY`. Chủ nhà với căn của mình: `KHONG_TIM_THAY` (PQ11.CHU: chủ nhà không có mức cộng). Vai khác: lỗi quyền chung.

**Việc kéo theo:** Không. Không đổi `booking_rieng` của đặt phòng đã có (mục "Sửa booking" (US10) bước 5, Thiet_ke_DB `booking_rieng`) và `yeu_cau_dat_phong.gia_ban` đã gửi.

**Chống bấm hai lần:** có (`Idempotency-Key`). PUT ghi đè, gửi lại cũng ra cùng kết quả.

## Luật chung dùng
Nguyên văn ở `docs/luat-chung/` (QT.md, HV.md, Nghiep_vu.md, Tu_dien.md), tìm theo mã hoặc tên.

Quy tắc trong nhóm Tìm phòng và gửi khách: Giá bán gồm phần cộng thêm, Độ tươi lịch. Sale chỉ thấy giá khi chủ nhà cho phép (nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale, Quyền sale được xem). Quy tắc trong nhóm Booking: Sale thấy hai giá, chủ nhà thấy một giá. QT2.1. (giả định GD13) làm tròn lên 50.000đ từng đêm rồi mới cộng các đêm. (giả định GD16) ô ngày hiện giá bán. HV1, HV2, HV3, HV5.

## Màn hình
Hình: `python3 docs/thiet-ke/trich-man.py <mã màn>` (docs/thiet-ke/README.md). Chữ và số trên hình lệch story thì story đúng.

S3, P10. Nút "Gửi yêu cầu đặt phòng" mở S3-02 (US15), nút "Gửi cho khách" mở S5 (US14).

**P10 · Mức cộng giá mặc định**
Vào từ: P1 của sale, "Mức cộng giá"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Mức cộng | Chip theo danh sách Mức cộng của sale ở `Tu_dien.md`, mục Danh sách lựa chọn dùng chung, "+400k" đang chọn | Cài đặt sale |
| 2 | Làm tròn | "Làm tròn lên 50.000đ" | Cài đặt |
| 3 | Ví dụ | "Phòng 1509, 2 đêm": "Giá chủ nhà 2.200.000đ", "Giá gửi khách 3.000.000đ", "Bạn được 800.000đ" | DLM.7 |
| 4 | Nút | "Lưu thay đổi" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Một chip | Ví dụ đổi theo | P10 |
| "Lưu thay đổi" | Lưu | P1 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- đang tải: chưa thiết kế (HV1)
- lỗi mạng: chưa thiết kế (HV2)
- quay lại từ nền: chưa thiết kế (HV3)

**S3 · Chi tiết căn**
Vào từ: S2, S4: chạm một căn
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Ảnh | "1/6" | Ảnh căn |
| 2 | Tên căn | "ICON40 1509 · 2PN", "2PN · 4 khách · view biển · Bãi Cháy", "✓ Lịch cập nhật 2 giờ trước" | Căn |
| 3 | Chủ nhà | "Chị Hoa · Chủ nhà · 2 căn", nút "Gọi" | Chủ nhà |
| 4 | Giá | "10/10 → 12/10 (2 đêm)", "Giá chủ nhà 2.200.000đ" | DLM.7 |
| 5 | Cộng thêm cho bạn | Chip theo danh sách Mức cộng của sale ở `Tu_dien.md`, mục Danh sách lựa chọn dùng chung, "+200k" đang chọn; "Giá bán cho khách 2.600.000đ" | Giá chủ nhà cộng mức cộng × 2 đêm |
| 6 | Lịch 2 tuần tới | Ô Trống, Kín | Lịch căn |
| 7 | Tiện ích, giờ | "Nhận phòng 14:00 · Trả phòng 12:00" | Căn |
| 8 | Nút | "Đặt phòng", "Gửi cho khách" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Một chip cộng thêm | Giá bán đổi theo | S3 |
| "Đặt phòng" | Mở đặt phòng | S3-02 |
| "Gửi cho khách" | Mở gửi khách | S5 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- đang tải: chưa thiết kế (HV1)
- lỗi mạng: chưa thiết kế (HV2)
- quay lại từ nền: chưa thiết kế (HV3)

## Quyền
Ô quyền theo `docs/luat-chung/PQ.md`. Mỗi ô phải có test chứng minh người không có quyền thì không đọc, không ghi được; test ở lớp database (`tests/db/`).

Ô PQ chạm tới (ma trận `docs/luat-chung/PQ.md`): PQ2.SALE, PQ3.SALE, PQ4.SALE, PQ5.SALE, PQ6.SALE, PQ11.SALE, PQ11.CHU, PQ14.SALE. Test vi phạm phải có:
- PQ11.SALE: thân có `sale_id` của sale khác thì bị bỏ qua; Sale Lan đặt mức cộng cho 1509 không đổi giá bán của Sale Hùng; Hùng đổi `muc_cong_mac_dinh` qua không đổi giá bán của Lan.
- PQ11.CHU: Chị Hoa gọi cho căn của mình nhận `KHONG_TIM_THAY`; mọi API của chủ nhà không có trường mức cộng hay giá bán; tài khoản chủ nhà gửi `muc_cong_mac_dinh` thì `DU_LIEU_SAI`.
- PQ4.SALE, PQ3.SALE: sale bị ngừng gọi `KHONG_CON_QUYEN`; sale chưa kết nối, căn ngoài phạm vi được chia sẻ, căn đã ẩn: `KHONG_TIM_THAY`; ảnh qua đường dẫn hết hạn hoặc không chữ ký không mở được.
- PQ14.SALE: Sale Lan gọi mức cộng cho Villa Tuần Châu của Sale Hùng nhận `KHONG_TIM_THAY`.
- PQ2.SALE: số điện thoại chủ nhà là `null` khi chủ nhà chưa cho số, và không có khi sale bị ngừng.

## Database
Đã có trong `supabase/migrations/` và đã chạy test. Tham số và cột: `docs/tu-sinh/Bang_va_cot.md`.

- `fn_sale_gia`: test ở t_07_can_gia_mo_rong.sql
- `fn_dat_muc_cong`: test ở t_07_can_gia_mo_rong.sql, t_09_sale_doc.sql, t_10_thong_ke.sql
- `fn_luu_cai_dat`: test ở t_07_can_gia_mo_rong.sql, t_08_thong_bao.sql

## Ngoài phạm vi
- Tìm phòng và danh sách kết quả (mục "Tìm phòng trống theo ngày" (US12), mục "Kết quả tìm phòng" (US12)): US12.
- Nội dung S3-02, gửi và theo dõi yêu cầu đặt phòng (mục "Sale gửi yêu cầu đặt phòng" (US15) đến mục "Yêu cầu trùng ngày" (US15)): US15. US này chỉ làm nút "Gửi yêu cầu đặt phòng" mở S3-02 đúng căn và ngày (US13-NT3).
- Gửi cho khách ở S5, mẫu tin P11 (mục "Gửi thông tin cho khách qua Zalo" (US14), mục "Mẫu tin gửi khách" (US14)): US14. US này chỉ làm nút "Gửi cho khách" mở S5 với căn đang xem.
- Mở S3 từ lịch 7 ngày S1 (mục "Lịch phòng 7 ngày" (US16) bước 8): US6; ngày ở khi không có ngày khách hỏi chưa chốt [MỞ: US13-H3].
- S3 của căn của tôi và căn tự nhập, giá bán có cộng cho căn của chính sale: chưa chốt [MỞ: US13-H4]. US này chỉ làm căn trong nguồn phòng.
- Chủ nhà đặt giá và nhập số giường (nhóm Căn và giá): US4, US11.
- Tiện ích căn: bản đầu không làm (US13-NT6).

## Việc cần làm
- [ ] Đọc story này và các luật chung nó trỏ tới. Chỗ nào gắn thẻ MỞ thì không code, hỏi Tùng (docs/Cau_hoi_mo.md).
- [ ] Viết test cho từng tiêu chí chưa có test, test đỏ trước (lớp test: docs/QUY_TRINH.md mục 6).
- [ ] Database: soát các hàm ở mục Database với tiêu chí; thiếu thì thêm migration mới và một dòng trong `scripts/thu-lam-hong.sh`.
- [ ] Giao diện: các màn ở mục Màn hình, nối với Supabase (docs/Ghi_chu_code.md).
- [ ] E2E cho luồng chính của story.
- [ ] Kiểm tay theo `tests/kich-ban/US13.md` trên điện thoại thật.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md` trong cùng PR.
