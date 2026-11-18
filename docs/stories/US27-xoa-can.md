# US27 · Chủ nhà xóa căn

- Loại: tính năng
- Trạng thái: chờ code
- Đặc tả: thô (lắp bằng máy từ bản Zalo, chưa viết lại theo khuôn, chưa áp các quyết định ở `docs/tham-khao/Loi_Tung_ban_Zalo.md`; không code theo bản này, xem US41)
- Bản: 1
- Rủi ro: cao
- Làm sau khi xong: US1, US3, US18, US19
- Kiểm tay: `tests/kich-ban/US27.md` (12 kịch bản)

## Mục tiêu
Là chủ nhà, tôi muốn xóa một căn không còn cho thuê khỏi màn hình mà đặt phòng và số thống kê cũ vẫn còn, để danh sách căn gọn mà không mất số liệu.

## Hành vi
Bảng bước ghi: người dùng làm gì, app hiện gì (chữ trong ngoặc kép là chữ trên màn), máy chủ phải làm gì, dữ liệu nào đổi. Cột "Máy chủ" mô tả việc phải xảy ra; bản PWA làm bằng RLS, view và hàm `fn_*` của Supabase.

### Xóa căn
Rủi ro: cao
Mục đích: chủ nhà bỏ khỏi màn hình một căn không còn cho thuê. Xóa căn thực chất là ẩn căn: đặt phòng và số thống kê của căn vẫn còn.
Màn hình: chưa vẽ
Khi nào xảy ra: chủ nhà chọn xóa một căn của mình. Nút đặt ở đâu: chưa vẽ, hỏi Tùng khi làm.

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Bấm xóa căn | Có hỏi lại trước khi xóa không: CH-021 | Không gọi server | Không | Không |
| 2 | Xóa căn còn đặt phòng có ngày trả sau hôm nay, hoặc còn yêu cầu đặt phòng đang chờ chủ | Báo "Căn còn đặt phòng sắp tới", căn giữ nguyên | Kiểm lại và từ chối ẩn, không chỉ dựa vào màn | Không | Không đổi |
| 3 | Xóa căn không còn đặt phòng sắp tới và không còn yêu cầu chờ | Căn biến khỏi danh sách căn (CN5), lịch (CN1, CN2), chip "Phòng" khi đặt phòng (CN4), chọn căn khi đặt giá nhiều căn và sao chép giá (CN6-05, CN6-07). Màn sau khi xóa chưa vẽ | Đánh dấu căn đã ẩn | Không | Căn chuyển sang đã ẩn. Đặt phòng cũ, tiền đã lưu trong đặt phòng và số thống kê giữ nguyên |
| 4 | (Sale đang được chia sẻ căn mở app) | Căn không còn ở lịch phòng, kết quả tìm, chi tiết căn (nhóm Tìm phòng và gửi khách). Đặt phòng cũ của sale với căn đó vẫn ở danh sách và thống kê của sale (mục "Thống kê của sale" (US19), mục "Trạng thái booking của sale" (US19)) | Không gửi căn đã ẩn cho sale | | Không |
| 5 | Thêm căn mới cùng mã với căn đã ẩn | Thêm được (US27-NT1) | Mã căn đã ẩn không tính khi kiểm trùng | | Thêm một căn |
| 6 | Muốn hiện lại căn đã ẩn | Bản đầu không có cách hiện lại | | | |

Thống kê của chủ nhà vẫn tính đặt phòng cũ của căn đã ẩn (mục "Thống kê tháng của chủ nhà" (US18)). Căn đã ẩn có tính vào mẫu số công suất không: nhóm Thống kê CH-064.
Theo quy tắc: Xóa căn là ẩn căn; Mã căn không trùng.

Trạng thái màn:
- rỗng: không áp dụng
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

## Phần của story khác mà story này làm một lát
Bảng bước của các mục dưới đây nằm ở story chủ của mục đó. Story này chỉ làm các tiêu chí được liệt kê ở mục Tiêu chí nghiệm thu.

- mục "Thêm căn" (US1) · Thêm căn: bảng bước ở US1. Story này làm NT5, NT6.

## Tiêu chí nghiệm thu
Mỗi tiêu chí một test tự động mang đúng mã này trong tên test. Mã không đổi nghĩa; đổi hành vi thì cấp mã mới (docs/QUY_TRINH.md mục 5).

- **US27-NT1** Khi chủ nhà đã xóa căn 1509 (mục "Xóa căn") rồi thêm căn mới mã 1509, thì thêm được, không báo trùng. Theo quy tắc: Mã căn không trùng.
- **US27-NT2** Khi một chủ nhà khác đã có căn mã 1509, thì Chị Hoa vẫn thêm được căn mã 1509. Theo quy tắc: Mã căn không trùng.
- **US27-NT3** Khi căn còn một đặt phòng có ngày trả sau hôm nay (giờ Việt Nam) và chủ nhà xóa căn, thì app báo "Căn còn đặt phòng sắp tới" và căn vẫn ở CN5.
- **US27-NT4** Khi căn còn một yêu cầu đặt phòng đang chờ chủ và chủ nhà xóa căn, thì app báo "Căn còn đặt phòng sắp tới" và căn vẫn ở CN5.
- **US27-NT5** Khi lệnh ẩn một căn còn đặt phòng sắp tới gửi thẳng tới server, thì server từ chối và căn không bị ẩn.
- **US27-NT6** Khi đặt phòng cuối cùng của căn có ngày trả là hôm nay và không còn yêu cầu chờ, thì chủ nhà xóa được căn.
- **US27-NT7** Khi Chị Hoa có 2 căn và xóa được 3402, thì CN5 ghi "1 căn", 3402 không còn ở CN1 và ở chip "Phòng" của CN4.
- **US27-NT8** Khi 3402 có đặt phòng cũ trong tháng 10 và Chị Hoa xóa 3402, thì doanh thu tháng 10 ở CN8 không đổi.
- **US27-NT9** Khi Sale Hùng đang được chia sẻ 3402 và Chị Hoa xóa 3402, thì 3402 không còn ở S1 và kết quả tìm của Sale Hùng; đặt phòng cũ của Sale Hùng với 3402 vẫn ở S7-03 và vẫn tính vào S7.
- **US27-NT10** Khi chủ nhà đã xóa một căn, thì không có màn nào cho hiện lại căn đó.

## Luật kiểm dữ liệu và lỗi
Mỗi mục là một việc app nhờ database làm. "Đầu vào" là luật kiểm từng ô, "Lỗi riêng" là khi nào phải từ chối. Cột "Mã" là tên gọi trong tài liệu; hàm database báo lỗi bằng một câu tiếng Việt cho người dùng đọc (docs/luat-chung/Nghiep_vu.md mục Lỗi).

### Căn có lịch
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| `id` | id | có | |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| KHONG_TIM_THAY | Căn không có, đã ẩn, hoặc người gọi không có quyền |
| CAN_CON_DAT_PHONG (mã mới, 409) | Căn có lịch còn booking có ngày trả sau hôm nay (giờ Việt Nam), hoặc còn yêu cầu `cho_chu` chưa quá `het_han_luc` (mục "Xóa căn" bước 2, Thiet_ke_DB Cần quyết 8). `ly_do`: "Căn còn đặt phòng sắp tới". Booking `da_huy` không tính vì đêm đã trống lại (QD-012 qua. Mã chưa có trong bảng[MỞ: US27-H1] thêm mã vào |

## Ai được làm và việc kéo theo
Nguyên liệu chép từ đặc tả máy chủ của bản Zalo, đã đổi tên bảng và mã. Đối chiếu với hàm database ở mục Database khi viết lại story: chỗ nào lệch thì ghi vào "Database đang lệch story". Tên lỗi viết hoa (`KHONG_TIM_THAY`, `DU_LIEU_SAI`) là tên loại lỗi của bản cũ; bản PWA báo bằng câu tiếng Việt.

### Căn có lịch
**Ai gọi:** CHU của căn có lịch, căn chưa ẩn (PQ3.CHU "xóa căn là ẩn căn", PQ13.CHU). Căn tự nhập: sale tạo (PQ14.SALE "tạo, xem, sửa, xóa"). SALE được chia sẻ: không xóa (PQ3.SALE), trả `KHONG_TIM_THAY`. Người khác: `KHONG_TIM_THAY`.

**Việc kéo theo:** Không ghi thông báo (mục "Xóa căn" (US27) không có thông báo cho sale). Từ lúc ẩn, mọi API của sale không gửi căn này (mục "Xóa căn" (US27) bước 4, PQ3.SALE), không hiện căn này, và mã căn dùng lại được (mục "Xóa căn" (US27) bước 5). Không có API hiện lại căn (mục "Xóa căn" (US27) bước 6).

**Chống bấm hai lần:** có. Gửi lại cùng khóa trả kết quả cũ; không có khóa cũ mà căn đã ẩn thì `KHONG_TIM_THAY`.

## Luật chung dùng
Nguyên văn ở `docs/luat-chung/` (QT.md, HV.md, Nghiep_vu.md, Tu_dien.md), tìm theo mã hoặc tên.

Quy tắc trong nhóm Căn và giá: Xóa căn là ẩn căn, Mã căn không trùng. QD-012 (đặt phòng đã hủy không tính là đặt phòng sắp tới). HV1 đến HV3, HV5. Đặt phòng cũ của căn đã ẩn vẫn tính vào thống kê: mục "Thống kê tháng của chủ nhà" (US18), mục "Thống kê của sale" (US19), mục "Trạng thái booking của sale" (US19).

## Màn hình
Hình: `python3 docs/thiet-ke/trich-man.py <mã màn>` (docs/thiet-ke/README.md). Chữ và số trên hình lệch story thì story đúng.

Màn xóa căn chưa vẽ: chỗ đặt nút, câu báo sau khi xóa, có hỏi lại không (CH-021). Màn kiểm kết quả: CN5, CN1, CN2, CN4 (chip "Phòng"), CN6-05, CN6-07, CN8; phía sale: S1, S7-03.

## Quyền
Ô quyền theo `docs/luat-chung/PQ.md`. Mỗi ô phải có test chứng minh người không có quyền thì không đọc, không ghi được; test ở lớp database (`tests/db/`).

Ô PQ chạm tới (ma trận `docs/luat-chung/PQ.md`): PQ3.CHU (xóa căn là ẩn căn), PQ3.SALE (không xóa, không thấy căn đã ẩn). Test vi phạm phải có:
- PQ3.CHU: Anh Tuấn xóa 1509 hay 3402 của Chị Hoa: `KHONG_TIM_THAY`, căn không bị ẩn. Chị Hoa xóa căn đã ẩn: `KHONG_TIM_THAY`.
- PQ3.SALE: Sale Hùng xóa 1509: `KHONG_TIM_THAY`, căn không bị ẩn.
- Không có phiên: `CHUA_DANG_NHAP`.
- Chặn ở server, không chỉ ở màn: lệnh ẩn căn còn đặt phòng sắp tới gửi thẳng tới server bị từ chối (`CAN_CON_DAT_PHONG`, US27-NT5).
- Hai lệnh cùng lúc, một lệnh ẩn căn và một lệnh ghi đặt phòng vào căn đó: chỉ một lệnh qua, không có căn đã ẩn mà còn đặt phòng sắp tới.
- Căn đã ẩn: sale không nhận căn này từ lịch, tìm phòng, chi tiết căn (PQ3.SALE); đặt phòng mới và yêu cầu mới vào căn đã ẩn bị từ chối.

## Database
Đã có trong `supabase/migrations/` và đã chạy test. Tham số và cột: `docs/tu-sinh/Bang_va_cot.md`.

- `fn_an_can`: test ở t_07_can_gia_mo_rong.sql

## Ngoài phạm vi
- Thêm căn mới, mã căn trùng (US1-NT9 đến NT4): US1.
- Hiện lại căn đã ẩn: bản đầu không có (US27-NT10 chỉ kiểm không có đường nào).
- Căn tự nhập của sale: xóa thật căn và đặt phòng (mục "Chi tiết căn tự nhập" (US16) bước 7): US16.
- Số liệu thống kê chủ nhà và sale (mục "Thống kê tháng của chủ nhà" (US18), mục "Thống kê của sale" (US19), mục "Trạng thái booking của sale" (US19)): US18, US19. US này chỉ kiểm số không đổi sau khi xóa, cần màn Thống kê của hai US đó có trước.
- Căn đã ẩn có tính vào mẫu số công suất không: [MỞ: CH-029].
- Màn xóa căn, chữ báo sau khi xóa, có hỏi lại không: [MỞ: CH-021]. Các kịch bản dưới đây ghi "bước hỏi lại (nếu có)".
- Báo cho sale khi căn bị xóa: mục "Xóa căn" không có thông báo.

## Việc cần làm
- [ ] Đọc story này và các luật chung nó trỏ tới. Chỗ nào gắn thẻ MỞ thì không code, hỏi Tùng (docs/Cau_hoi_mo.md).
- [ ] Viết test cho từng tiêu chí chưa có test, test đỏ trước (lớp test: docs/QUY_TRINH.md mục 6).
- [ ] Database: soát các hàm ở mục Database với tiêu chí; thiếu thì thêm migration mới và một dòng trong `scripts/thu-lam-hong.sh`.
- [ ] Giao diện: các màn ở mục Màn hình, nối với Supabase (docs/Ghi_chu_code.md).
- [ ] E2E cho luồng chính của story.
- [ ] Kiểm tay theo `tests/kich-ban/US27.md` trên điện thoại thật.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md` trong cùng PR.
