# US30 · Popup thông báo mới khi mở app

- Loại: tính năng
- Trạng thái: chờ code
- Đặc tả: thô (lắp bằng máy từ bản Zalo, chưa viết lại theo khuôn, chưa áp các quyết định ở `docs/tham-khao/Loi_Tung_ban_Zalo.md`; không code theo bản này, xem US41)
- Bản: 1
- Rủi ro: cao
- Làm sau khi xong: US2, US6, US17
- Kiểm tay: `tests/kich-ban/US30.md` (18 kịch bản)

## Mục tiêu
Là chủ nhà hoặc sale, tôi muốn mở app là thấy ngay những thông báo mới liên quan tới mình kể từ lần mở app trước, để không phải tự vào mục Thông báo.

## Hành vi
Bảng bước ghi: người dùng làm gì, app hiện gì (chữ trong ngoặc kép là chữ trên màn), máy chủ phải làm gì, dữ liệu nào đổi. Cột "Máy chủ" mô tả việc phải xảy ra; bản PWA làm bằng RLS, view và hàm `fn_*` của Supabase.

### Popup thông báo mới
> **Bản PWA:** thông báo chỉ trong app. Xem `PWA.md` mục P7.
Rủi ro: tb
Mục đích: chủ nhà và sale mở app là thấy ngay những gì mới liên quan tới mình kể từ lần mở app trước, kể cả khi chủ nhà sửa đặt phòng hộ, mà không phải tự vào Thông báo.
Màn hình: S1-06 (popup thông báo mới của sale), S1-06-01 (popup có dòng chủ nhà đã xóa tài khoản), P13, P13-01. Popup của chủ nhà: chưa vẽ
Khi nào xảy ra: chủ nhà hoặc sale mở app, hoặc quay lại app từ nền, và có thông báo mới kể từ lần mở app trước (mục "Cài đặt thông báo" (US21)).

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở app, hoặc quay lại app từ nền | Popup hiện trên màn đang mở, không phủ toàn màn. Phần màn phía sau có lớp phủ tối (overlay) | Gửi danh sách thông báo tạo sau lần mở app trước của người gọi, thuộc các loại vào popup | | Mốc lần mở app của người gọi |
| 2 | Xem popup | Danh sách thông báo mới kể từ lần mở app trước. Popup gồm mọi loại thông báo của người gọi theo mục "Cài đặt thông báo" (US21), chỉ những dòng mới; P13 hiện tất cả (mục "Cài đặt thông báo" (US21)). Của sale: kết nối mới (mục "Thông báo kết quả kết nối cho sale" (US17)), chủ nhà đồng ý yêu cầu đặt phòng (mục "Sale nhận kết quả yêu cầu" (US15)), chủ nhà sửa đặt phòng của sale (mục "Sửa booking" (US10) bước 4), yêu cầu bị từ chối (mục "Sale nhận kết quả yêu cầu" (US15), mục "Yêu cầu trùng ngày" (US15)), yêu cầu hết hạn (mục "Sale gửi yêu cầu đặt phòng" (US15) bước 6), chủ nhà thêm căn vào lịch đã chia sẻ (mục "Căn mới của chủ nhà tự hiện cho sale" (US6)), chủ nhà đã xóa tài khoản (mục "Khi người dùng xóa tài khoản" (US22), mục "Cài đặt thông báo" (US21), QD-013), căn đã gửi khách vừa có người đặt (mục "Gửi thông tin cho khách qua Zalo" (US14)), chủ nhà ngừng cho xem lịch (mục "Chủ nhà quản lý danh sách sale" (US5) bước 6), xin hủy hoặc đồng ý hủy (QD-012), chủ nhà ghi đặt phòng cho sale (mục "Booking chủ nhà ghi cho sale" (US28)). Của chủ nhà: các loại do sale tạo ra: có yêu cầu đặt phòng mới (mục "Chủ nhà nhận và trả lời yêu cầu" (US15)), sale gửi link xin xem lịch (mục "Chủ nhà duyệt lời mời xem lịch" (US17)), sale xin hủy hoặc đồng ý hủy (QD-012) | | | |
| 3 | Chạm một dòng | Mở màn của việc đó (ví dụ kết quả yêu cầu, chi tiết booking) | | | Dòng đó thành đã đọc |
| 4 | Đóng popup (chạm lớp phủ hoặc nút đóng) | Về màn đang mở. Mọi thông báo vẫn còn ở Thông báo (P13) | | | |
| 5 | Muốn xem tất cả | Từ popup sang P13 | | | |

Theo quy tắc: Chỉ báo trong app ở bản đầu (mục "Cài đặt thông báo" (US21)); các loại thông báo theo mục "Cài đặt thông báo" (US21).

Trạng thái màn:
- rỗng: không có thông báo mới kể từ lần mở app trước thì không hiện popup
- đang tải: theo HV1
- lỗi mạng: theo HV2, không hiện popup
- không có quyền: không áp dụng
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3; có thông báo mới kể từ lần mở app trước thì hiện popup như bước 1 (mục "Cài đặt thông báo" (US21))
- mở từ link: không áp dụng

## Tiêu chí nghiệm thu
Mỗi tiêu chí một test tự động mang đúng mã này trong tên test. Mã không đổi nghĩa; đổi hành vi thì cấp mã mới (docs/QUY_TRINH.md mục 5).

- **US30-NT1** Khi chủ nhà sửa booking B1 của Sale Hùng trong ngày và Sale Hùng mở app, thì popup hiện dòng "chủ sửa booking" của B1, phía sau có lớp phủ, popup không phủ toàn màn.
- **US30-NT2** Khi sale đóng popup, thì các thông báo đó vẫn có trong P13.
- **US30-NT3** Khi không có thông báo nào tạo sau lần mở app trước, thì mở app không hiện popup.
- **US30-NT4** Khi Sale Hùng mở app lúc 21:00 ngày 06/10, chủ nhà sửa đặt phòng B1 của Sale Hùng lúc 23:00 ngày 06/10, và Sale Hùng mở lại app lúc 08:00 ngày 07/10, thì popup có dòng sửa B1, dù dòng đó tạo hôm trước.
- **US30-NT5** Khi Sale Hùng đã xem popup, rời app, chủ nhà sửa đặt phòng B1 của Sale Hùng, rồi Sale Hùng quay lại app từ nền, thì popup hiện lại với dòng sửa B1.
- **US30-NT6** Khi Chị Hoa ngừng cho Sale Hùng xem lịch, hoặc ghi một đặt phòng chọn Sale Hùng làm người đặt, thì lần mở app kế tiếp popup của Sale Hùng có dòng đó.
- **US30-NT7** Khi Sale Hùng gửi yêu cầu đặt phòng cho căn của Chị Hoa sau lần mở app trước của Chị Hoa, thì lần mở kế tiếp Chị Hoa thấy popup có dòng yêu cầu đó; chủ nhà tự sửa đặt phòng của mình thì không có dòng nào.
- **US30-NT8** Khi yêu cầu đặt phòng của Sale Hùng hết hạn sau 2 tuần, thì lần mở app kế tiếp popup của Sale Hùng có dòng hết hạn; Sale Hùng đóng popup rồi mở lại app mà không có gì mới thì không có popup, dòng đó vẫn ở P13.

## Luật kiểm dữ liệu và lỗi
Mỗi mục là một việc app nhờ database làm. "Đầu vào" là luật kiểm từng ô, "Lỗi riêng" là khi nào phải từ chối. Cột "Mã" là tên gọi trong tài liệu; hàm database báo lỗi bằng một câu tiếng Việt cho người dùng đọc (docs/luat-chung/Nghiep_vu.md mục Lỗi).

### App báo vừa mở app hoặc vừa quay lại từ nền
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|

**Lỗi riêng**
| Mã | Khi nào |
|---|---|

## Ai được làm và việc kéo theo
Nguyên liệu chép từ đặc tả máy chủ của bản Zalo, đã đổi tên bảng và mã. Đối chiếu với hàm database ở mục Database khi viết lại story: chỗ nào lệch thì ghi vào "Database đang lệch story". Tên lỗi viết hoa (`KHONG_TIM_THAY`, `DU_LIEU_SAI`) là tên loại lỗi của bản cũ; bản PWA báo bằng câu tiếng Việt.

### App báo vừa mở app hoặc vừa quay lại từ nền
**Ai gọi:** người đã đăng nhập, mọi vai, chỉ thông báo của mình (PQ19.CHU, PQ19.SALE). Mốc lần mở app là dữ liệu kỹ thuật của chính người gọi, không API nào trả cho người khác. Phiên tạm: `CHUA_DANG_NHAP`.

App gọi đúng một lần mỗi khi mở app và mỗi lần quay lại từ nền (HV3), không gọi định kỳ. Toast A9 khi đang mở app không dùng API này: app gọi mỗi 60 giây và dựng toast từ mục `chu_dong_y_ket_noi` có `id` app chưa thấy ở lần gọi trước. Gọi định kỳ mà dời mốc thì thông báo tới lúc đang mở app sẽ không vào popup lần mở sau, nên hai việc tách nhau.

**Việc kéo theo:** Không.

**Chống bấm hai lần:** `Idempotency-Key` bắt buộc. Thử lại cùng khóa trả đúng danh sách cũ, không dời mốc lần hai. Không có khóa thì lần thử lại sau lỗi mạng sẽ trả mảng rỗng vì mốc đã dời, popup mất.

## Luật chung dùng
Nguyên văn ở `docs/luat-chung/` (QT.md, HV.md, Nghiep_vu.md, Tu_dien.md), tìm theo mã hoặc tên.

Quy tắc trong nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale: Gom thông báo (một dòng gom ở popup như ở P13), Vị trí toast (HV8). mục "Cài đặt thông báo" (US21) (chỉ báo trong app). mục "Cài đặt thông báo" (US21): các loại thông báo và nơi hiện (popup chỉ gồm thông báo mới, P13 hiện tất cả). HV1, HV2, HV3.

## Màn hình
Hình: `python3 docs/thiet-ke/trich-man.py <mã màn>` (docs/thiet-ke/README.md). Chữ và số trên hình lệch story thì story đúng.

S1-06 (popup của sale), P13 (nút "Xem tất cả thông báo"). Popup của chủ nhà trên màn Lịch: chưa vẽ. S1-06-01 và P13-01 (dòng chủ nhà đã xóa tài khoản): thuộc phần [MỞ: US30-H1] QD-013 ở trên. Canvas S1-06 còn vẽ theo bản 2 ("hôm nay"); chữ đầu popup do Design đặt lại ở.

**P13-01 · Thông báo · chủ nhà đã xóa tài khoản**
Vào từ: Như P13
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Màn gốc | Chép đúng P13 | P13 |
| 2 | Dòng mới đầu nhóm Hôm nay | Chưa đọc, biểu tượng khóa xám: "Chị Hoa đã xóa tài khoản", "Các căn của Chị Hoa không còn trong lịch. Đặt phòng đã chốt vẫn giữ.", "11:20" | mục "Cài đặt thông báo" (US21) |
| 3 | Đầu danh sách | "3 chưa đọc" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Dòng "Chị Hoa đã xóa tài khoản" | Mở Nguồn phòng, không mở lịch hay căn của Chị Hoa (US22-NT4) | S6-08 |
Trạng thái riêng:
- không có quyền: theo HV5

**S1-06-01 · Popup hôm nay · chủ nhà đã xóa tài khoản**
Vào từ: Mở app, vai sale, sau khi chủ nhà xóa tài khoản trong ngày
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Màn gốc | Chép đúng S1-06 | S1-06 |
| 2 | Dòng mới | Chấm xám, "Chị Hoa đã xóa tài khoản", "Các căn của Chị Hoa không còn trong lịch. Đặt phòng đã chốt vẫn giữ.", "11:20" | QD-013, mục "Cài đặt thông báo" (US21) |
| 3 | Dòng khác | "Anh Tuấn đồng ý cho bạn xem lịch", 08:30 | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Dòng "Chị Hoa đã xóa tài khoản" | Mở Nguồn phòng, không mở lịch | S6-08 |
Trạng thái riêng:
- không có quyền: theo HV5

**S1-06 · Popup thông báo mới hôm nay**
Vào từ: Mở app, vai sale, khi có thông báo mới hôm nay chưa xem (mục "Popup thông báo mới" bước 1)
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Màn gốc | Chép đúng S1 trên canvas, phủ lớp tối phía sau | S1 |
| 2 | Đầu popup | Chuông, "Thông báo mới hôm nay", "3 thông báo · 07/10", nút ✕ 44 px | Số thông báo mới |
| 3 | Dòng chủ sửa booking | "Chị Hoa đã sửa đặt phòng của bạn", "ICON40 1509 · 10/10 → 12/10 đổi thành 11/10 → 13/10. Giá chủ nhà 2.200.000đ đổi thành 1.800.000đ", "10:15", chấm cam | Sự kiện chủ sửa booking (mục "Sửa booking" (US10) bước 4) |
| 4 | Dòng chủ chấp nhận | "Chị Hoa đã chấp nhận đặt phòng", "ICON40 1509 · 10/10 → 12/10 · giá chủ nhà 2.200.000đ", "09:05" | mục "Sale nhận kết quả yêu cầu" (US15) |
| 5 | Dòng kết nối mới | "Anh Tuấn đồng ý cho bạn xem lịch", "Sapphire 1103 và À La Carte 2208 đã vào Nguồn phòng", "08:30" | mục "Thông báo kết quả kết nối cho sale" (US17) |
| 6 | Nút | "Xem tất cả thông báo" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Dòng chủ sửa booking | Mở chi tiết booking đã sửa, dòng thành đã đọc | S3-10 |
| Dòng chủ chấp nhận | Mở kết quả yêu cầu | S3-04 |
| Dòng kết nối mới | Mở lịch sau khi thêm | A10-02 |
| ✕ hoặc lớp phủ | Đóng popup, thông báo vẫn ở P13 | S1 |
| "Xem tất cả thông báo" | Mở danh sách thông báo | P13 |
Trạng thái riêng:
- rỗng: không hiện popup (US30-NT3)
- đang tải: theo HV1, chưa hiện popup
- lỗi mạng: theo HV2, không hiện popup
- quay lại từ nền: có thông báo mới thì hiện popup (mục "Popup thông báo mới")

## Quyền
Ô quyền theo `docs/luat-chung/PQ.md`. Mỗi ô phải có test chứng minh người không có quyền thì không đọc, không ghi được; test ở lớp database (`tests/db/`).

Test vi phạm phải có:
- Sale Lan gọi API thông báo mới: không có mục nào của Sale Hùng (PQ19.SALE).
- Anh Tuấn gọi API thông báo mới: không có mục nào của Chị Hoa, kể cả yêu cầu đặt phòng Sale Hùng gửi cho Chị Hoa (PQ19.CHU).
- với id thông báo của người khác: `KHONG_TIM_THAY`, dòng người kia vẫn chưa đọc (PQ19.SALE, PQ19.CHU).
- Mục gửi chủ nhà không có giá bán, không tên khách (PQ11.CHU, PQ9.CHU).
- Mốc lần mở app của người này không đổi mốc của người khác.
- Không phiên: `CHUA_DANG_NHAP`.

## Database
Đã có trong `supabase/migrations/` và đã chạy test. Tham số và cột: `docs/tu-sinh/Bang_va_cot.md`.

Bảng `thong_bao`: sinh bằng trigger ở database, app không tự ghi.

- `fn_mo_app`: test ở t_08_thong_bao.sql
- `fn_danh_dau_da_doc`: test ở t_08_thong_bao.sql

## Ngoài phạm vi
- Ghi dòng thông báo khi có sự kiện: mỗi API gây ra việc ghi (kết nối mới US5 và US17, chủ sửa đặt phòng US10, chấp nhận và từ chối yêu cầu, hết hạn US15, chủ ghi đặt phòng cho sale US28, ngừng cho xem US5, căn đã gửi khách vừa có người đặt US14, xin hủy QD-012). US này chỉ đọc và hiện.
- Danh sách Thông báo P13, số chưa đọc, gom dòng, "Đánh dấu đã đọc" (mục "Thông báo kết quả kết nối cho sale" (US17)): US17.
- Cài đặt bật tắt từng loại thông báo (mục "Cài đặt thông báo" (US21)): US21. Loại đã tắt thì server không ghi nên không có trong popup.
- Dòng chủ nhà đã xóa tài khoản (US22-NT4, US22-NT7): NT4 ở US22, NT7 [MỞ: US30-H1] QD-013.
- Sale gửi link xin xem lịch (mục "Cài đặt thông báo" (US21)) vào popup của chủ nhà: server chưa có sự kiện để ghi [MỞ: US30-H2] US30 câu 4. Không viết kịch bản.
- Tên API popup và chỗ lưu mốc lần mở app: đã có ở (cột `tai_khoan.mo_app_cuoi_luc`, GD18). Server phải đổi đang có (US17-TA4) sang API mới, thêm migration cột mốc.
- Tách US theo vai (sale và chủ nhà): [MỞ: US30-H3] US30 câu 1.

## Việc cần làm
- [ ] Đọc story này và các luật chung nó trỏ tới. Chỗ nào gắn thẻ MỞ thì không code, hỏi Tùng (docs/Cau_hoi_mo.md).
- [ ] Viết test cho từng tiêu chí chưa có test, test đỏ trước (lớp test: docs/QUY_TRINH.md mục 6).
- [ ] Database: soát các hàm ở mục Database với tiêu chí; thiếu thì thêm migration mới và một dòng trong `scripts/thu-lam-hong.sh`.
- [ ] Giao diện: các màn ở mục Màn hình, nối với Supabase (docs/Ghi_chu_code.md).
- [ ] E2E cho luồng chính của story.
- [ ] Kiểm tay theo `tests/kich-ban/US30.md` trên điện thoại thật.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md` trong cùng PR.
