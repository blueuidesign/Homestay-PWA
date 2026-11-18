# US35 · Hủy đặt phòng của sale: một bên xin, bên kia đồng ý

- Loại: tính năng
- Trạng thái: chưa làm
- Bản: 1
- Rủi ro: cao
- Làm sau khi xong: US10, US15, US28
- Kiểm tay: chưa có kịch bản, viết khi làm story

## Mục tiêu
Là chủ nhà hoặc sale, khi một đặt phòng có sale đứng tên phải hủy, tôi muốn xin hủy và bên kia bấm đồng ý, để không bên nào tự xóa đặt phòng mà bên kia không biết.

## Hành vi
Bảng bước ghi: người dùng làm gì, app hiện gì (chữ trong ngoặc kép là chữ trên màn), máy chủ phải làm gì, dữ liệu nào đổi. Cột "Máy chủ" mô tả việc phải xảy ra; bản PWA làm bằng RLS, view và hàm `fn_*` của Supabase.

### YC4.9 · Hủy booking đã nhận
Rủi ro: cao
Mục đích: khách của sale đổi ý thì booking đã nhận cần có đường ra khỏi lịch, mà không bên nào tự bỏ được phần của bên kia (QD-012).
Màn hình: chưa vẽ. Nút "Xin hủy" và khối trả lời đặt ở chi tiết booking của chủ nhà (CN3-02) và của sale (S7-03); chữ và vị trí hỏi Tùng khi làm.
Khi nào xảy ra: chủ nhà hoặc sale của một booking có sale bấm "Xin hủy". Booking khách lẻ thì chủ nhà xóa theo YC4.4, không qua đây.

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Một bên (chủ nhà hoặc sale của booking) bấm "Xin hủy" | Hỏi lại một lần, rồi booking hiện nhãn "Chờ đồng ý hủy" ở cả hai bên | Chỉ chủ của căn hoặc sale của booking xin được; booking phải đang hiệu lực; ghi ai xin, lúc nào; ghi thông báo cho bên kia | Không | `booking.trang_thai` = `cho_huy`, `xin_huy_boi`, `xin_huy_luc` |
| 2 | Bên kia mở booking | Thấy "<tên> xin hủy đặt phòng này", hai nút "Đồng ý hủy", "Không đồng ý" | Người xin hủy không tự đồng ý được | Không | Không |
| 3 | Bấm "Đồng ý hủy" | Booking hiện nhãn "Đã hủy" ở cả hai bên, vẫn nằm trong danh sách | Đổi sang `da_huy`; các đêm của booking thôi chiếm lịch nên trống lại và bán được; booking không tính vào thống kê; ghi thông báo cho bên xin | Không | `booking.trang_thai` = `da_huy` |
| 4 | Bấm "Không đồng ý" | Booking về như cũ, ghi "Bị từ chối hủy" ở cả hai bên; không còn nút "Xin hủy" | Đổi về `hieu_luc`, ghi `tu_choi_huy_luc`; không cho xin hủy lại | Không | `booking.trang_thai` = `hieu_luc`, `tu_choi_huy_luc` |
| 5 | Không ai trả lời | [MỞ: CH-004] | [MỞ: CH-004] | Không | |

Theo quy tắc: Hủy cần hai bên; Không xóa booking của sale.

Trạng thái màn:
- rỗng: không áp dụng
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3; bên kia vừa trả lời thì booking hiện trạng thái mới
- mở từ link: không áp dụng

## Tiêu chí nghiệm thu
Mỗi tiêu chí một test tự động mang đúng mã này trong tên test. Mã không đổi nghĩa; đổi hành vi thì cấp mã mới (docs/QUY_TRINH.md mục 5).

- **YC4.9-NT1** Khi Sale Hùng bấm "Xin hủy" ở B1 và xác nhận, thì B1 có nhãn "Chờ đồng ý hủy" ở cả Chị Hoa và Hùng, đêm 10/10, 11/10 của 1509 vẫn kín, và Chị Hoa có thông báo xin hủy. `[đã có test database: t_08_thong_bao.sql]`
- **YC4.9-NT2** Khi Chị Hoa bấm "Đồng ý hủy" ở B1 đang chờ hủy, thì B1 có nhãn "Đã hủy" ở cả hai bên, đêm 10/10, 11/10 của 1509 trống lại, ghi được booking mới vào đó, và B1 không còn tính vào doanh thu, đêm có khách, tiền chênh. `[đã có test database: t_10_thong_ke.sql]`
- **YC4.9-NT3** Khi Chị Hoa bấm "Không đồng ý" ở B1 đang chờ hủy, thì B1 trở lại như trước, có ghi "Bị từ chối hủy", và không ai bấm "Xin hủy" lại B1 được (lệnh gửi thẳng tới máy chủ cũng bị từ chối).
- **YC4.9-NT4** Khi Sale Hùng đã xin hủy B1, thì chính Sale Hùng không đồng ý hủy được (lệnh gửi thẳng tới máy chủ bị từ chối).
- **YC4.9-NT5** Khi Sale Lan hay Anh Tuấn gửi lệnh xin hủy B1, thì máy chủ từ chối và B1 không đổi.
- **YC4.9-NT6** Khi booking là khách lẻ (B5), thì không có nút "Xin hủy"; chủ nhà xóa theo YC4.4.

## Luật kiểm dữ liệu và lỗi
Mỗi mục là một việc app nhờ database làm. "Đầu vào" là luật kiểm từng ô, "Lỗi riêng" là khi nào phải từ chối. Cột "Mã" là tên gọi trong tài liệu; hàm database báo lỗi bằng một câu tiếng Việt cho người dùng đọc (docs/luat-chung/Nghiep_vu.md mục Lỗi).

### Một bên của đặt phòng có sale xin hủy
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| id | id | có | `trang_thai = 'hieu_luc'` và `tu_choi_huy_luc` trống (QD-012: bị từ chối hủy thì không xin lại) |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| KHONG_TIM_THAY | Người gọi không phải CHU của căn hay sale của đặt phòng |
| DU_LIEU_SAI | Đặt phòng không có sale, căn tự nhập, hoặc bên kia đã xóa tài khoản |
| TRANG_THAI_DA_DOI | Đặt phòng đã `cho_huy` hay `da_huy`; hoặc đã bị từ chối hủy một lần |
Xin hủy đặt phòng đã qua ngày trả được không: [MỞ: US35-H1] QD-012 không nói. Xin hủy hết hạn sau bao lâu và hết hạn thì thành gì: [MỞ: US35-H2].

### Bên kia đồng ý hay từ chối lời xin hủy
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| id | id | có | `trang_thai = 'cho_huy'` |
| dong_y | bool | có | |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| DU_LIEU_SAI | Thiếu `dong_y` |
| KHONG_TIM_THAY | Người gọi là bên đã xin, hoặc không thuộc đặt phòng |
| TRANG_THAI_DA_DOI | Đặt phòng không còn `cho_huy` (đã trả lời, hoặc hết hạn [MỞ: US35-H3]) |

## Màn hình
Hình: `python3 docs/thiet-ke/trich-man.py <mã màn>` (docs/thiet-ke/README.md). Chữ và số trên hình lệch story thì story đúng.

**S7-03 · Các trạng thái booking của sale**
Vào từ: Tab Thống kê của sale
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Danh sách "BOOKING CỦA TÔI" | 9 dòng, mỗi dòng: căn và ngày, lý do, nhãn. Chờ chủ "À La Carte 2208 · 10/10 → 12/10"; Đã chốt ×5: ICON40 1509 10/10 → 12/10 và 04/10 → 06/10 (chênh 400.000đ), Sapphire 1103 18/10 → 20/10 (200.000đ) và 21/10 → 22/10 (100.000đ), À La Carte 2208 13/10 → 14/10 (300.000đ); Bị từ chối "Chủ đã nhận đặt phòng khác cùng ngày", Hết hạn "Chủ chưa trả lời trong 2 tuần", Đã hủy "Bạn đã hủy yêu cầu" | Yêu cầu của sale (DLM.6) |
| 2 | Thẻ "THỨ TỰ TRẠNG THÁI" | "Chờ chủ → Đã chốt. Chủ từ chối hoặc nhận đặt phòng khác: Bị từ chối. Quá 2 tuần: Hết hạn. Bạn tự hủy: Đã hủy." | Cố định |
| 3 | Thanh tab | Lịch, Căn, Thống kê, Cá nhân | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Một dòng | Chưa nối tới màn kết quả (S3-04, S3-05, S3-08, S3-09) | |
Trạng thái riêng:
- rỗng: chưa thiết kế
- đang tải: chưa thiết kế (HV1)
- lỗi mạng: chưa thiết kế (HV2)
- không có quyền: chưa thiết kế (HV5)
- quay lại từ nền: chưa thiết kế (HV3)

## Database
Đã có trong `supabase/migrations/` và đã chạy test. Tham số và cột: `docs/tu-sinh/Bang_va_cot.md`.

- `fn_xin_huy`: test ở t_05_yeu_cau_huy_khach.sql, t_08_thong_bao.sql, t_10_thong_ke.sql
- `fn_tra_loi_huy`: test ở t_05_yeu_cau_huy_khach.sql, t_08_thong_bao.sql, t_10_thong_ke.sql

## Việc cần làm
- [ ] Đọc story này và các luật chung nó trỏ tới. Chỗ nào gắn thẻ MỞ thì không code, hỏi Tùng (docs/Cau_hoi_mo.md).
- [ ] Viết test cho từng tiêu chí chưa có test, test đỏ trước (lớp test: docs/QUY_TRINH.md mục 6).
- [ ] Database: soát các hàm ở mục Database với tiêu chí; thiếu thì thêm migration mới và một dòng trong `scripts/thu-lam-hong.sh`.
- [ ] Giao diện: các màn ở mục Màn hình, nối với Supabase (docs/Ghi_chu_code.md).
- [ ] E2E cho luồng chính của story.
- [ ] Viết kịch bản kiểm tay (tests/kich-ban/US35.md), rồi kiểm trên điện thoại thật.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md` trong cùng PR.
