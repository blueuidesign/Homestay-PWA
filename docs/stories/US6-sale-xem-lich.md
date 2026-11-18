# US6 · Sale mở link, thêm lịch, xem 7 ngày và giá

- Loại: tính năng
- Trạng thái: chờ code
- Đặc tả: thô (lắp bằng máy từ bản Zalo, chưa viết lại theo khuôn, chưa áp các quyết định ở `docs/tham-khao/Loi_Tung_ban_Zalo.md`; không code theo bản này, xem US41)
- Bản: 1
- Rủi ro: cao
- Làm sau khi xong: US4, US5, US1
- Kiểm tay: `tests/kich-ban/US6.md` (19 kịch bản)

## Mục tiêu
Là sale, tôi muốn mở link của chủ nhà, thêm lịch của họ và thấy 7 ngày tới căn nào trống, giá bao nhiêu, để trả lời khách không cần gọi.

## Hành vi
Bảng bước ghi: người dùng làm gì, app hiện gì (chữ trong ngoặc kép là chữ trên màn), máy chủ phải làm gì, dữ liệu nào đổi. Cột "Máy chủ" mô tả việc phải xảy ra; bản PWA làm bằng RLS, view và hàm `fn_*` của Supabase.

### Mở app từ link mời của chủ nhà
Rủi ro: cao
Mục đích: sale nhận link từ chủ nhà tự quyết có thêm lịch của chủ nhà đó vào dữ liệu của mình hay không. Chủ nhà không đẩy lịch vào dữ liệu của sale khi sale chưa đồng ý (QD-008).
Màn hình: A1-link, A1-link-01, A10, A10-01, A10-02
Khi nào xảy ra: người dùng bấm link mời trong tin nhắn Zalo của chủ nhà.

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Chưa có tài khoản, bấm link | Hiện A1-link: như A1, thêm thẻ "Anh Tuấn mời bạn xem lịch 2 căn", dòng "Bấm Bắt đầu ngay để xem lịch và giá mới nhất". Không có chữ "Đăng nhập" (mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5)) | công khai): kiểm link còn hạn, chưa thu hồi, người tạo còn tài khoản; trả tên chủ nhà, số căn, không giá. Link không dùng được thì `LINK_KHONG_DUNG_DUOC` | Mở app từ link | Không |
| 2 | Bấm "Bắt đầu ngay" ở A1-link | Bỏ qua A3, sang A10 (QD-008) | bước 2): Tạo tài khoản vai sale | App lấy access token (`getAccessToken`), không hiện hộp thoại xin quyền | Tài khoản mới |
| 3 | Đã có tài khoản, chưa thêm lịch của chủ nhà này, bấm link | Hiện A10 "Thêm lịch": tên chủ nhà, số căn, ảnh và thông tin sơ lược từng căn, không có giá (QD-008). Nút dính đáy "Thêm lịch của Anh Tuấn" | Gửi thông tin xem trước, không gửi giá | Mở app từ link | Không đổi |
| 4 | Bấm "Thêm lịch của Anh Tuấn" | Chạy mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5) nếu hồ sơ chưa có số (mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5): chấp thuận lời mời là kết nối). Rồi sang lịch của sale, toast "Đã thêm lịch 2 căn của Anh Tuấn" (A10-02) | bước 4): Tạo kết nối sale với chủ nhà | Không, trừ hộp thoại quyền khi chạy mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5) (mục "Hộp thoại cấp quyền của Zalo" (US5)) | Kết nối mới; các căn được chia sẻ vào lịch của sale |
| 5 | Rời A10 mà không bấm Thêm | Về màn trước hoặc đóng app | Không gọi server, không đổi gì bước 5) | Không | Không đổi |
| 6 | Đã thêm lịch của chủ nhà này, bấm link lần nữa | Hiện A10-01 cảnh báo "Bạn đã có lịch của Anh Tuấn", nút "Xem lịch" | bước 3): trả `da_them: true` khi đã có `ket_noi` `da_ket_noi` với chủ nhà đó | Mở app từ link | Không đổi |

Người mở link là tài khoản đã chọn vai chủ nhà: chưa quyết [MỞ: CH-012].
Theo quy tắc: Sale tự thêm lịch; Nhóm kết nối.

Trạng thái màn:
- rỗng: không áp dụng
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: theo HV4
- quay lại từ nền: theo HV3
- mở từ link: đây chính là trạng thái này; link sai hoặc chủ nhà đã xóa tài khoản (mục "Khi người dùng xóa tài khoản" (US22), QD-013): A1-link-01 (theo HV5). Server không gửi tên căn, ảnh căn, giá của chủ nhà đã xóa tài khoản

### Căn mới của chủ nhà tự hiện cho sale
Rủi ro: cao
Mục đích: chủ nhà thêm căn thì sale đang có lịch của chủ nhà thấy luôn, không phải mời lại hay thêm lại (QD-008).
Màn hình: lịch của sale (S1)
Khi nào xảy ra: chủ nhà thêm căn mới (nhóm Căn và giá) khi đã có sale kết nối.

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Chủ nhà thêm căn mới | Theo nhóm Căn và giá | Thêm căn vào phạm vi của mọi sale được chia sẻ "tất cả căn" (QD-008) | Không | Căn mới vào phạm vi các sale đó |
| 2 | Sale mở lịch | Căn mới hiện trong lịch | Gửi căn mới theo quyền sale được xem | Không | Không đổi |

Sale có được báo khi có căn mới không: chưa thiết kế.

## Phần của story khác mà story này làm một lát
Bảng bước của các mục dưới đây nằm ở story chủ của mục đó. Story này chỉ làm các tiêu chí được liệt kê ở mục Tiêu chí nghiệm thu.

- mục "Chọn vai trò" (US1) · Chọn vai trò: bảng bước ở US1. Story này làm NT2.
- mục "Màn đầu tiên khi chưa có dữ liệu" (US1) · Màn đầu tiên khi chưa có dữ liệu: bảng bước ở US1. Story này làm NT2.
- mục "Chủ nhà ghi booking mới" (US3) · Chủ nhà ghi booking mới: bảng bước ở US3. Story này làm NT2.
- mục "Lịch phòng 7 ngày" (US16) · Lịch phòng 7 ngày: bảng bước ở US16. Story này làm NT2, NT5.

## Tiêu chí nghiệm thu
Mỗi tiêu chí một test tự động mang đúng mã này trong tên test. Mã không đổi nghĩa; đổi hành vi thì cấp mã mới (docs/QUY_TRINH.md mục 5).

- **US6-NT1** Khi người dùng chọn "Tôi là sale" rồi bấm "Tiếp tục", thì app mở A5.
- **US6-NT2** Khi người chưa có tài khoản mở link và bấm "Bắt đầu ngay" ở A1-link, thì app sang A10 và không hiện A3. (QD-008)
- **US6-NT3** Khi sale đã có tài khoản mở link của chủ nhà có 2 căn, thì A10 hiện tên chủ nhà, "2 căn" và ảnh từng căn, không có giá nào. (QD-008)
- **US6-NT4** Khi sale rời A10 mà không bấm "Thêm lịch", thì lịch của sale không có căn nào của chủ nhà đó và chủ nhà không thấy sale ở nhóm "Đã kết nối".
- **US6-NT5** Khi sale bấm "Thêm lịch", thì 2 căn hiện trong lịch của sale và sale vào nhóm "Đã kết nối" ở CN7 của chủ nhà.
- **US6-NT6** Khi sale đã thêm lịch mở lại link, thì thấy A10-01 và lịch vẫn chỉ có 2 căn của chủ nhà đó, không nhân đôi.
- **US6-NT7** Khi hồ sơ sale chưa có số điện thoại và sale bấm "Thêm lịch của Anh Tuấn", thì popup giải thích xin tên và số hiện trước hộp thoại Zalo; bấm "Để sau" thì lịch vẫn được thêm. (mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5))
- **US6-NT8** Khi người chưa có tài khoản mở link mời của Anh Tuấn, thì thẻ lời mời ở A1-link ghi "Bấm Bắt đầu ngay để xem lịch và giá mới nhất" và không có chữ "Đăng nhập". (mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5))
- **US6-NT9** Khi sale chưa có nguồn phòng và vào tab Lịch, thì thấy A5 với hai nút "Gửi tin nhắn xin lịch đến chủ nhà" và "Thêm căn thủ công". Thanh tab của sale không có tab "Tìm phòng"
- **US6-NT10** Khi chủ nhà có 6 căn, sale được chia sẻ tất cả căn, và chủ nhà thêm căn thứ 7, thì sale thấy 7 căn trong lịch mà không mở lại link. (QD-008)
- **US6-NT11** Khi booking vừa lưu, thì các sale khác thấy các đêm đó là "Kín" (S3-04 ghi "hiện Kín với các sale khác").
- **US6-NT12** Khi một căn kín trong một ngày, thì ô ngày đó ghi "Kín"; khi trống thì ghi giá.
- **US6-NT13** Khi sale nghiêng điện thoại sang ngang ở tab Lịch, thì app vẫn hiện chiều dọc; khi sale chạm nút "Xoay ngang", thì bảng hiện S1-05.

## Luật kiểm dữ liệu và lỗi
Mỗi mục là một việc app nhờ database làm. "Đầu vào" là luật kiểm từng ô, "Lỗi riêng" là khi nào phải từ chối. Cột "Mã" là tên gọi trong tài liệu; hàm database báo lỗi bằng một câu tiếng Việt cho người dùng đọc (docs/luat-chung/Nghiep_vu.md mục Lỗi).

### Xem trước nội dung một link trước khi người mở quyết định
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| `ma` | text 22 ký tự | có | Sai định dạng thì `LINK_KHONG_DUNG_DUOC` |
| `Authorization` | `Bearer <phiên>` | với `xin_lich` | Phiên còn hạn |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| `LINK_KHONG_DUNG_DUOC` | Mã không có hoặc sai định dạng; link đã thu hồi; link quá hạn. Người tạo đã xóa tài khoản (US22-NT1, US22-NT2): [MỞ: US6-H1]. Thêm với `xin_lich`: người gọi đã ngừng sale đó (`ket_noi` `chu_ngung` giữa người gọi và sale,. Không có tên, ảnh, số nào trong trả lời |
| `CHUA_DANG_NHAP` | Link `xin_lich` mà không có phiên. Server kiểm loại link trước, rồi mới đòi phiên. Lỗi này lộ là mã có thật và là link xin lịch; chấp nhận vì giới hạn 30 lần một phút làm khó dò mã |

### Sale bấm "Thêm lịch của <chủ nhà>" ở A10, kết nối với chủ nhà tạo link
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| `ma` | text 22 ký tự | có | Link dùng được, loại `moi_sale` hoặc `gui_lich` |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| `LINK_KHONG_DUNG_DUOC` | Link sai, thu hồi, quá hạn bước 4 kiểm lại link), hoặc link loại `xin_lich`. Người tạo đã xóa tài khoản: [MỞ: US6-H2] |

## Ai được làm và việc kéo theo
Nguyên liệu chép từ đặc tả máy chủ của bản Zalo, đã đổi tên bảng và mã. Đối chiếu với hàm database ở mục Database khi viết lại story: chỗ nào lệch thì ghi vào "Database đang lệch story". Tên lỗi viết hoa (`KHONG_TIM_THAY`, `DU_LIEU_SAI`) là tên loại lỗi của bản cũ; bản PWA báo bằng câu tiếng Việt.

### Xem trước nội dung một link trước khi người mở quyết định
**Ai gọi:**
- Link `moi_sale`, `gui_lich`: ai cũng gọi được, không cần phiên bước 1, PQ Luật chung 4, PQ3.LINK, PQ18.LINK). Có phiên thì server tính thêm `da_them` (PQ17.LINK).
- Link `xin_lich`: cần phiên, kể cả phiên tạm của người chưa có tài khoản. Không có phiên: `CHUA_DANG_NHAP`. Người mở là chủ nhà (PQ18.CHU), thấy tên và số sale theo PQ1.CHU, PQ2.CHU.
- Giới hạn 30 lần một phút mỗi địa chỉ IP.
- Người tạo link tự mở link của mình: [MỞ: CH-057].
- Tài khoản vai chủ nhà mở link mời: server vẫn trả nội dung và trả `vai_nguoi_mo`; app làm gì: [MỞ: US6-H3] QD-005 trong mục "Mở app từ link mời của chủ nhà" (US6).

**Việc kéo theo:** Không. Rời A10 mà không bấm thì không đổi gì (US6-NT4).

**Chống bấm hai lần:** không cần (đọc).

### Sale bấm "Thêm lịch của <chủ nhà>" ở A10, kết nối với chủ nhà tạo link
**Ai gọi:** người có tài khoản (không phải phiên tạm; người mới gọi trước,bước 2). Đây là chỗ LINK thành SALE (PQ17.LINK). Phiên tạm hoặc không phiên: `CHUA_DANG_NHAP`. Tài khoản vai chọn `chu_nha`: [MỞ: CH-012] (QD-005 đã chốt một tài khoản nhiều vai); tới khi có quyết định, server không chặn theo vai chọn. Người tạo link tự bấm: [MỞ: CH-057].

**Việc kéo theo:** Căn mới chủ nhà thêm sau này tự vào phạm vi `tat_ca_can` lúc đọc, không ghi gì thêm (mục "Căn mới của chủ nhà tự hiện cho sale" (US6),. Thông báo:bước 4 ghi `chu_dong_y_ket_noi` cho sale "nếu loại đó áp cho trường hợp này", còn mục "Mở app từ link mời của chủ nhà" (US6) bước 4 không có thông báo và người bấm chính là sale. [MỞ: US6-H4] mục "Cài đặt thông báo" (US21) có áp khi sale tự bấm Thêm lịch không. Tới khi có quyết định: không ghi thông báo. Chủ nhà có được báo khi sale thêm lịch không: mục "Cài đặt thông báo" (US21) không có loại này, nên Không.

**Chống bấm hai lần:** có. Thêm ràng buộc duy nhất ở database.

## Luật chung dùng
Nguyên văn ở `docs/luat-chung/` (QT.md, HV.md, Nghiep_vu.md, Tu_dien.md), tìm theo mã hoặc tên.

Quy tắc trong nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale: Sale tự thêm lịch, Nhóm kết nối, Căn mới tự hiện, Quyền sale được xem (quyền mặc định), Điều khoản khi tiếp tục. Quy tắc trong nhóm Tìm phòng và gửi khách: Sale chỉ thấy căn chủ nhà đã đồng ý. QT2.1 (ô "Kín"). HV1 đến HV5, HV8.

## Màn hình
Hình: `python3 docs/thiet-ke/trich-man.py <mã màn>` (docs/thiet-ke/README.md). Chữ và số trên hình lệch story thì story đúng.

A1-link, A3 (sale), A5, A10, A10-01, A10-02, S1, S1-05, A6-P1 và A6-P2 (popup và hộp thoại Zalo dùng chung cho sale).

**A1-link-01 · Link sai hoặc chủ nhà đã xóa tài khoản**
Vào từ: Bấm link mời sai, hoặc của chủ nhà đã xóa tài khoản
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 0 | Màn gốc | Chép đúng màn A1-link trên canvas, chỉ đổi phần trạng thái. Giữ toàn bộ A1-link; thẻ lời mời đổi màu cảnh báo, biểu tượng liên kết, chữ "Link này không mở được" và "Chủ nhà đã xóa tài khoản hoặc link không đúng. Xin chủ nhà gửi lại link mới."; nút "Bắt đầu với Zalo" giữ nguyên | A1-link |
| 1 | Giữa màn | "Link này không mở được", "Chủ nhà đã xóa tài khoản hoặc link không đúng. Xin chủ nhà gửi lại link mới." | |
| 2 | Nút | "Vào app" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Vào app" | Người mới sang A3, người cũ sang lịch | A3 hoặc S1 |
Trạng thái riêng:
- mở từ link: chính là màn này

**A1-link · Mở từ link mời**
Vào từ: Bấm link mời của chủ nhà trong tin nhắn Zalo, khi chưa có tài khoản Home247.
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Tên app và câu giới thiệu | "🏠 Lịch phòng Hạ Long", "Lịch phòng và giá homestay, chia sẻ cho sale trong một chạm." | Cố định |
| 2 | Thẻ lời mời | Chữ cái đầu "T", "Anh Tuấn mời bạn xem lịch 2 căn", "Đăng nhập để xem lịch và giá mới nhất" | Link mời: tên chủ nhà, số căn |
| 3 | Ba dòng lợi ích | "Ghi lịch các phòng nhanh hơn sổ tay", "Sale tự xem phòng trống, không cần gọi hỏi", "Gửi ảnh và giá phòng cho khách trong vài giây" | Cố định |
| 4 | Nút chính | "Bắt đầu với Zalo" | |
| 5 | Dòng điều khoản | "Bằng việc tiếp tục, bạn đồng ý với Điều khoản và Chính sách quyền riêng tư." | Cố định |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Bắt đầu với Zalo" | Tạo tài khoản vai sale, bỏ qua A3 | A10 |
Trạng thái riêng:
- đang tải: chưa thiết kế
- lỗi mạng: chưa thiết kế
- không có quyền: chưa thiết kế
- quay lại từ nền: chưa thiết kế
- mở từ link: chính là màn này. Link sai hoặc chủ nhà đã xóa tài khoản: chưa thiết kế

**A10-01 · Đã có lịch của chủ nhà này**
Vào từ: Bấm link mời của chủ nhà khi đã thêm lịch của chủ nhà đó.
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Thanh tiêu đề | "Thêm lịch" | Cố định |
| 2 | Thẻ chủ nhà | Chữ cái đầu "T", "Anh Tuấn", "Chủ nhà · 2 căn" | Chủ nhà trong link mời |
| 3 | Thẻ cảnh báo | Dấu ✓, "Bạn đã có lịch của Anh Tuấn", "2 căn của Anh Tuấn đã có trong lịch của bạn. Mở lại link không thêm lần nữa." | Kết nối đã có |
| 4 | Vùng dính đáy | Nút "Xem lịch" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Xem lịch" | Mở lịch của sale | S1 |
Trạng thái riêng:
- đang tải: chưa thiết kế
- lỗi mạng: chưa thiết kế
- không có quyền: chưa thiết kế
- quay lại từ nền: chưa thiết kế
- mở từ link: chính là màn này

**A10-02 · Lịch sau khi thêm**
Vào từ: A10, bấm "Thêm lịch của Anh Tuấn".
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Thanh tiêu đề | "Lịch phòng" | Cố định |
| 2 | Ô tìm | "Tìm phòng trống theo ngày" | Cố định |
| 3 | Hàng 7 ngày và sắp xếp | "7 ngày tới · 07/10 → 13/10", "Theo tên" | Hôm nay |
| 4 | Lưới lịch | Nhóm "Căn của tôi" và "Nguồn phòng", mỗi ô giá hoặc "Kín" | Như S1 |
| 5 | Toast | "✓ Đã thêm lịch 2 căn của Anh Tuấn" | Số căn vừa thêm, tên chủ nhà |
| 6 | Thanh tab | Tab Lịch đang chọn | |
| 7 | Vị trí toast | Toast chung: nổi trên nội dung, cách mép trái, phải 12 px, đỉnh cách đỉnh màn 108 px (ngay dưới thanh tiêu đề và cụm ··· ✕ của Zalo), nền tối, chữ trắng 14 px đậm, bo góc vừa. Mọi màn có toast dùng đúng chỗ này | |
| 8 | Toast | Một kiểu: dấu ✓, chữ đậm, không có nút ✕, tự tắt sau 3 giây | |
| 9 | Căn tự nhập | Hàng "Villa Tuần Châu · Chú Bình · tự nhập": mọi ô ngày "?", ô T7 10/10 và CN 11/10 ghi "Bạn" (booking sale tự ghi). Không có giá, không có "Kín" | mục "Lịch phòng 7 ngày" (US16) bước 3, NT3 |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Như S1 | Như S1 | Như S1 |
Trạng thái riêng:
- đang tải: chưa thiết kế
- lỗi mạng: chưa thiết kế
- quay lại từ nền: chưa thiết kế

**A10-P1 · Thêm lịch · giải thích xin tên và số**
Vào từ: A10, bấm việc cần tên và số khi hồ sơ chưa có số
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Màn gốc | Chép đúng A10, phủ lớp tối | A10 |
| 2 | Popup dưới đáy | Biểu tượng điện thoại, tiêu đề "Chia sẻ tên và số điện thoại với chủ nhà", lý do, bước "Zalo sẽ hiện hộp thoại. Bật Tên và ảnh đại diện, Số điện thoại rồi bấm Cho phép." | mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5) Sửa r4 |
| 3 | Nút | "Đồng ý, tiếp tục", "Để sau", dòng "Để sau vẫn … được" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Đồng ý, tiếp tục" | Mở hộp thoại Zalo | A10-P2 |
| "Để sau" | Làm tiếp việc gốc không có số | A10-02 |

**A10-P2 · Thêm lịch · hộp thoại Zalo**
Vào từ: A10-P1, bấm "Đồng ý, tiếp tục"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Màn gốc | Chép đúng A10, phủ lớp tối | A10 |
| 2 | Hộp thoại minh họa | "Tên và ảnh đại diện · Sale Hùng", "Số điện thoại · 0912 345 678", nút "Cho phép" | Zalo |
| 3 | Ghi chú | Ghi chú trên màn: Zalo hiện một hộp thoại có hai dòng hay hai hộp thoại nối nhau, thứ tự nào: chờ | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Cho phép" | Lưu tên, ảnh, số vào hồ sơ, làm tiếp việc gốc | A10-02 |

**A10 · Thêm lịch**
Vào từ: A1-link, bấm "Bắt đầu với Zalo" (người chưa có tài khoản).; Bấm link mời của chủ nhà khi đã có tài khoản và chưa thêm lịch của chủ nhà này.
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Thanh tiêu đề | "Thêm lịch" | Cố định |
| 2 | Thẻ chủ nhà | Chữ cái đầu "T", "Anh Tuấn", "Chủ nhà · 2 căn" | Chủ nhà trong link mời |
| 3 | Câu giải thích | "Anh Tuấn mời bạn thêm lịch các căn dưới đây. Bấm "Thêm lịch" thì các căn mới vào lịch của bạn." | Tên chủ nhà |
| 4 | Nhãn nhóm | "2 căn" | Số căn được chia sẻ |
| 5 | Thẻ căn, mỗi căn một thẻ | Ảnh 72 px, tên căn, thông tin sơ lược. Hai thẻ: "Sapphire 1103 / 3PN · 6 khách · view thành phố", "À La Carte 2208 / 1PN · 2 khách · view biển". Không có giá | Các căn chủ nhà chia sẻ, ảnh đầu tiên của căn |
| 6 | Vùng dính đáy | Nút "Thêm lịch của Anh Tuấn", dòng "Chưa bấm thì chưa có gì vào lịch của bạn." | Tên chủ nhà |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Thêm lịch của Anh Tuấn" | Tạo kết nối, các căn vào lịch của sale | A10-02 |
| Nút ✕ của Zalo | Đóng app, không thêm gì | |
Trạng thái riêng:
- đang tải: chưa thiết kế (HV1)
- lỗi mạng: chưa thiết kế (HV2)
- không có quyền: chưa thiết kế (HV5)
- quay lại từ nền: chưa thiết kế
- mở từ link: chính là màn này. Đã thêm lịch rồi thì sang A10-01

**S1 · Lịch phòng**
Vào từ: Tab Lịch của sale
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Thanh tiêu đề | "Lịch phòng" | |
| 2 | Ô tìm | "Tìm phòng trống theo ngày" | |
| 3 | Hàng 7 ngày | "‹ 7 ngày tới · 07/10 → 13/10 ›", "Theo tên" | |
| 4 | Bảng | Nhóm "Căn của tôi" rồi "Nguồn phòng"; mỗi ô giá, "Kín", "?" (căn tự nhập) hoặc "Bạn" | Lịch, giá của sale |
| 5 | Chú thích | Hôm nay, Kín, "?", Đặt phòng bạn đã ghi, "Số là giá đêm của bạn · chạm căn để xem" | |
| 6 | Nút nổi | "Xoay ngang" có biểu tượng, góc phải dưới, ngay trên thanh tab, cao 48 px. Vùng cuộn chừa 140 px ở đáy để nút không che ô ngày | Cố định |
| 7 | Thanh tab | Lịch, Căn, Thống kê, Cá nhân | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Ô tìm | Tìm phòng | S1-02 |
| Một căn | Chi tiết căn | S3 |
| "Theo tên" | Sắp xếp | S1-04 |
| "Xoay ngang" | Bảng xoay giả sang ngang | S1-05 |
Trạng thái riêng:
- rỗng: A5 (sale chưa có nguồn phòng)
- đang tải: HV1-02
- lỗi mạng: HV2-01
- quay lại từ nền: HV3

## Quyền
Ô quyền theo `docs/luat-chung/PQ.md`. Mỗi ô phải có test chứng minh người không có quyền thì không đọc, không ghi được; test ở lớp database (`tests/db/`).

Ô PQ chạm tới (ma trận `docs/luat-chung/PQ.md`): PQ3.LINK, PQ3.SALE, PQ4.SALE, PQ5.LINK, PQ5.SALE, PQ18.LINK. Test vi phạm phải có: API xem trước của A10 không gửi giá; API lịch 7 ngày chỉ gửi căn đã chia sẻ cho sale này; chủ nhà tắt "hiện giá" thì server không gửi giá; sale đã bị ngừng gọi API lịch; link sai.

## Database
Đã có trong `supabase/migrations/` và đã chạy test. Tham số và cột: `docs/tu-sinh/Bang_va_cot.md`.

Sale không đọc bảng `booking`: lịch đi qua hàm `fn_sale_lich` và view `v_lich_sale`.

- `fn_xem_link_moi`: test ở t_06_link_moi.sql, t_11_ket_noi_quan_tri.sql
- `fn_them_lich_tu_link`: test ở t_06_link_moi.sql, t_11_ket_noi_quan_tri.sql
- `fn_sale_lich`: test ở t_09_sale_doc.sql

## Ngoài phạm vi
- Căn của sale, căn tự nhập, sắp xếp (US16-NT1, US16-NT3, US16-NT4): US16.
- Chủ nhà đã xóa tài khoản (US22-NT1, US22-NT9): US22.
- Sale chỉ được chia sẻ một phần căn (US26-NT4): US26.
- Sale xin lịch từ A5 (US17-NT1, mục "Sale xin chủ nhà cho xem lịch" (US17)): US17.
- Tìm phòng (mục "Tìm phòng trống theo ngày" (US12)), chi tiết căn (mục "Chi tiết căn và giá bán" (US13)): US12, US13.
- Nút "Thêm căn thủ công" ở A5: US16.

## Việc cần làm
- [ ] Đọc story này và các luật chung nó trỏ tới. Chỗ nào gắn thẻ MỞ thì không code, hỏi Tùng (docs/Cau_hoi_mo.md).
- [ ] Viết test cho từng tiêu chí chưa có test, test đỏ trước (lớp test: docs/QUY_TRINH.md mục 6).
- [ ] Database: soát các hàm ở mục Database với tiêu chí; thiếu thì thêm migration mới và một dòng trong `scripts/thu-lam-hong.sh`.
- [ ] Giao diện: các màn ở mục Màn hình, nối với Supabase (docs/Ghi_chu_code.md).
- [ ] E2E cho luồng chính của story.
- [ ] Kiểm tay theo `tests/kich-ban/US6.md` trên điện thoại thật.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md` trong cùng PR.
