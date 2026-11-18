# US28 · Chủ nhà ghi đặt phòng cho sale

- Loại: tính năng
- Trạng thái: chưa làm
- Bản: 1
- Rủi ro: cao
- Làm sau khi xong: US3, US5, US10
- Kiểm tay: `tests/kich-ban/US28.md` (10 kịch bản)

## Mục tiêu
Là chủ nhà, tôi muốn ghi giúp một đặt phòng cho sale đã kết nối (ví dụ sale gọi điện báo khách), để sale vẫn có đặt phòng đó như của mình: được báo, có giá bán và tiền chênh, có trong thống kê.

## Hành vi
Bảng bước ghi: người dùng làm gì, app hiện gì (chữ trong ngoặc kép là chữ trên màn), máy chủ phải làm gì, dữ liệu nào đổi. Cột "Máy chủ" mô tả việc phải xảy ra; bản PWA làm bằng RLS, view và hàm `fn_*` của Supabase.

### YC4.1.3 · Booking chủ nhà ghi cho sale
Rủi ro: cao
Mục đích: chủ nhà ghi giúp một booking của sale (ví dụ sale gọi điện báo khách), và sale vẫn có booking đó như booking của mình: được báo, có giá bán, có tiền chênh, có trong thống kê. 
Màn hình: CN4 (phía chủ nhà). Phía sale: chưa vẽ
Khi nào xảy ra: chủ nhà lưu booking ở YC4.1 với người đặt là một sale đã kết nối (YC4.1.2 bước 1).

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Chủ nhà bấm "Thêm đặt phòng" với người đặt là Sale Hùng | Như YC4.1 bước 3 | Ghi booking với người bán là Sale Hùng. Tạo giá bán của Sale Hùng bằng giá chủ nhà cộng mức cộng của Sale Hùng cho căn đó nhân số đêm (YC5 quy tắc Giá bán gồm phần cộng thêm). Ghi sự kiện "chủ ghi đặt phòng cho bạn" cho Sale Hùng (YC9.3) | Không (YC9.3) | Booking; giá bán của sale cho booking; thông báo của sale |
| 2 | Sale Hùng mở app | Thông báo "chủ ghi đặt phòng cho bạn" ở P13: căn, ngày ở. Chữ chưa vẽ. Có vào popup thông báo mới (YC1.13, YC9.3) | | | |
| 3 | Sale Hùng mở booking | Thấy như booking của mình: căn, ngày ở, giá chủ nhà, giá bán cho khách, tiền chênh. Màn chưa vẽ | Không gửi tên, số khách chủ nhà nhập (QD-011) | | Không |
| 4 | Sale Hùng sửa giá bán rồi lưu | Giá bán và tiền chênh đổi theo | chỉ sale của đặt phòng; chủ nhà gọi thì `KHONG_TIM_THAY` (PQ11.CHU). Lưu giá bán mới. Chủ nhà không thấy giá bán | | Giá bán của sale cho booking |
| 5 | Sale Hùng mở Thống kê | Booking vào thẻ Đặt phòng, Doanh số, Tiền chênh (YC7.5) và danh sách "Đặt phòng của tôi" (YC7.6) | | | Không |
| 6 | Chủ nhà mở chi tiết booking này | Sửa được (YC4.3, Sale Hùng được báo); không xóa được (YC4.4 bước 3) | | | Không |

Theo quy tắc: Không xóa booking của sale; Giá bán gồm phần cộng thêm (YC5); Sale thấy hai giá, chủ nhà thấy một giá; Tiền chênh (QT3).

Trạng thái màn:
- rỗng: không áp dụng
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: mở từ thông báo ở P13: mở đúng booking đó (màn chưa vẽ)

## Tiêu chí nghiệm thu
Mỗi tiêu chí một test tự động mang đúng mã này trong tên test. Mã không đổi nghĩa; đổi hành vi thì cấp mã mới (docs/QUY_TRINH.md mục 5).

- **YC4.1.3-NT1** Khi Chị Hoa ghi 1509 10/10 → 12/10, tiền phòng 2.200.000đ, người đặt Sale Hùng, và mức cộng của Sale Hùng cho 1509 là +200k (DLM.7), thì Sale Hùng có booking đó với giá bán 2.600.000đ và tiền chênh 400.000đ (QT3.1-VD1).
- **YC4.1.3-NT2** Khi Chị Hoa lưu booking ở NT1, thì Sale Hùng thấy thông báo "chủ ghi đặt phòng cho bạn" kèm căn và ngày ở trong P13. `[đã có test database: t_08_thong_bao.sql]`
- **YC4.1.3-NT3** Khi Sale Hùng sửa giá bán của booking ở NT1, thì tiền chênh bằng giá bán mới trừ 2.200.000đ, và Chị Hoa vẫn chỉ thấy tiền phòng 2.200.000đ.
- **YC4.1.3-NT4** Khi Chị Hoa ghi tên và số khách cho booking ở NT1, thì Sale Hùng không thấy tên và số đó (QD-011).
- **YC4.1.3-NT5** Khi Chị Hoa ghi booking với người đặt là "Khách lẻ", thì không sale nào nhận thông báo và booking không vào thống kê của sale nào.

## Luật kiểm dữ liệu và lỗi
Mỗi mục là một việc app nhờ database làm. "Đầu vào" là luật kiểm từng ô, "Lỗi riêng" là khi nào phải từ chối. Cột "Mã" là tên gọi trong tài liệu; hàm database báo lỗi bằng một câu tiếng Việt cho người dùng đọc (docs/luat-chung/Nghiep_vu.md mục Lỗi).

### Sale của đặt phòng sửa giá bán của mình
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| id | id | có | |
| gia_ban | tien | có | Số nguyên đồng, không âm. Nhỏ hơn `tien_phong` được không: [MỞ: US28-H1] QT3.1 không nói tiền chênh âm |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| DU_LIEU_SAI | `gia_ban` thiếu, lẻ, âm |
| KHONG_TIM_THAY | Người gọi không phải `gia_ban_booking.sale_id` |
| TRANG_THAI_DA_DOI | Đặt phòng `da_huy` [MỞ: US28-H2] QD-012 không nói |

## Luật chung dùng
Nguyên văn ở `docs/luat-chung/` (QT.md, HV.md, Nghiep_vu.md, Tu_dien.md), tìm theo mã hoặc tên.

QT1.1 (chặn trùng), QT3.1 (QT3.1-VD3), QT3.2, QT4.1, QT4.2, QD-011, YC9.3, QD-007 và 4. Quy tắc trong YC4: Không xóa booking của sale, Sale thấy hai giá chủ nhà thấy một giá, Chủ nhà chỉ làm việc với sale. Quy tắc trong YC5: Giá bán gồm phần cộng thêm. HV1, HV2, HV3, HV8.

## Màn hình
Hình: `python3 docs/thiet-ke/trich-man.py <mã màn>` (docs/thiet-ke/README.md). Chữ và số trên hình lệch story thì story đúng.

Phía chủ nhà: CN4 (hàng chip "Khách / Sale", dòng tách tiền), CN4-03 (toast "Đã thêm đặt phòng Sale Hùng · 1509"). Phía sale: P13 (thông báo "chủ ghi đặt phòng cho bạn"), chi tiết đặt phòng của sale có giá bán và tiền chênh, S7-03 (YC7.6). [MỞ: US28-H3] YC4.1.3 màn phía sale chưa vẽ. Task màn phía sale chờ; kịch bản chỉ kiểm số và nội dung, chữ trên màn theo bản build.

## Quyền
Ô quyền theo `docs/luat-chung/PQ.md`. Mỗi ô phải có test chứng minh người không có quyền thì không đọc, không ghi được; test ở lớp database (`tests/db/`).

Ô PQ chạm tới (ma trận `docs/luat-chung/PQ.md`): PQ7.CHU, PQ8.CHU, PQ9.CHU, PQ11.CHU, PQ11.SALE, PQ7.SALE, PQ9.SALE, PQ19.SALE, PQ17.CHU. Test vi phạm phải có:
- PQ7.CHU: chủ nhà A ghi đặt phòng có `sale_id` vào căn của chủ nhà B thì `KHONG_TIM_THAY`.
- PQ17.CHU: `sale_id` là sale chưa kết nối với chủ nhà, hoặc sale chỉ được chia sẻ 3402 mà chủ nhà ghi 1509 cho sale đó, thì `DU_LIEU_SAI`.
- PQ11.CHU: trả lời và cho chủ nhà không có khóa `gia_ban`, `tien_chenh`; Chị Hoa gọi thì `KHONG_TIM_THAY` và `booking_rieng` không đổi; lệnh của căn chủ nhà có trường `gia_ban` thì `DU_LIEU_SAI`.
- PQ11.SALE, PQ7.SALE: Sale Lan gọi và với đặt phòng của Sale Hùng thì `KHONG_TIM_THAY`; Sale Hùng gọi thẳng vào 1509 của Chị Hoa thì `KHONG_TIM_THAY`.
- PQ9.SALE: trả lời cho Sale Hùng không có khách do chủ nhà nhập (QD-011).
- PQ19.SALE: Sale Lan không đọc được thông báo "chủ ghi đặt phòng cho bạn" của Sale Hùng.
- Luật chung 6: hai lệnh song song cùng căn, cùng đêm, một lệnh có `sale_id`, chỉ một lệnh được lưu và không có thông báo hay `booking_rieng` mồ côi.

## Database
Đã có trong `supabase/migrations/` và đã chạy test. Tham số và cột: `docs/tu-sinh/Bang_va_cot.md`.

- `fn_chu_ghi_booking`: test ở t_01_phan_quyen.sql, t_02_gia.sql, t_03_chan_trung.sql, t_04_tien_phong.sql, t_05_yeu_cau_huy_khach.sql, t_07_can_gia_mo_rong.sql, t_08_thong_bao.sql, t_09_sale_doc.sql, t_10_thong_ke.sql

## Ngoài phạm vi
- Chip sale đã kết nối ở CN4 và danh sách đặt phòng của sale ở CN7-04 (YC4.1.2-NT3): US5.
- Ghi đặt phòng khách lẻ, chặn trùng, tiền phòng (YC4.1, YC4.1.1): US3.
- Chủ nhà sửa đặt phòng loại này, sale được báo (YC4.1.3 bước 6, YC4.3): US10. Không có nút "Xóa đặt phòng" (YC4.4-NT6): US10.
- Handler (vai chủ nhà, vai sale) do US10-TA1 làm. US28 chỉ thêm test cho đặt phòng chủ nhà ghi có `sale_id`.
- Công tắc "Chủ nhà ghi đặt phòng cho bạn" ở P12 (YC9.3-NT1, NT4): US21. Công tắc tắt thì server không ghi thông báo nhưng đặt phòng vẫn là của sale.
- Thẻ Đặt phòng, Doanh số, Tiền chênh và danh sách "Đặt phòng của tôi" của sale (YC7.5-NT5, YC7.6-NT7): US19. US28 chỉ bảo đảm dữ liệu đúng ở server.
- Trang Thông báo P13 (YC1.10): US17. Popup thông báo mới (YC1.13): US30. US28-KB3 chạy khi hai US đó xong; trước đó Đức kiểm thông báo bằng API.
- Chưa quyết, không code theo phần này (CLAUDE.md):
  - [MỞ: US28-H4] YC4.1.3-NT4 chủ nhà ghi tên và số khách cho đặt phòng của sale, nhưngvà API chỉ nhận `sale_id` hoặc `ten_khach`, và CN4 chưa có ô số khách. Không có kịch bản cho NT4; phần "sale không thấy tên và số đó" (QD-011) vẫn kiểm bằng test PQ9.SALE khi dòng khách được tạo trực tiếp ở database.
  - [MỞ: US28-H5] YC4.1.3 màn phía sale (thông báo, chi tiết đặt phòng, sửa giá bán) chưa vẽ.
  - [MỞ: US28-H6] YC4.1.3 bước 1 sale bật "Làm tròn lên 50.000đ" thì giá bán tự tính có làm tròn không. Bản này không làm tròn.
  - [MỞ: US28-H7] YC4.1.3 bước 4 giá bán nhỏ hơn tiền phòng (tiền chênh âm) có được không, sale bị ngừng có sửa giá bán không.
  - [MỞ: US28-H8] YC9.3 còn ghi loại thông báo này chờ Tùng, trong khi YC9.3 đã chốt dòng 15.

## Việc cần làm
- [ ] Đọc story này và các luật chung nó trỏ tới. Chỗ nào gắn thẻ MỞ thì không code, hỏi Tùng (docs/Cau_hoi_mo.md).
- [ ] Viết test cho từng tiêu chí chưa có test, test đỏ trước (lớp test: docs/QUY_TRINH.md mục 6).
- [ ] Database: soát các hàm ở mục Database với tiêu chí; thiếu thì thêm migration mới và một dòng trong `scripts/thu-lam-hong.sh`.
- [ ] Giao diện: các màn ở mục Màn hình, nối với Supabase (docs/Ghi_chu_code.md).
- [ ] E2E cho luồng chính của story.
- [ ] Kiểm tay theo `tests/kich-ban/US28.md` trên điện thoại thật.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md` trong cùng PR.
