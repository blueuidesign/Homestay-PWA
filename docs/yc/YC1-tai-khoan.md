---
id: YC1
tieu_de: Tài khoản
rev: 1
ban: 1
---
# YC1 · Tài khoản

## Mục tiêu

Là người dùng, tôi muốn vào app mà không phải đăng ký rườm rà, chọn mình là chủ nhà hay sale, sửa cách người khác thấy mình, lấy dữ liệu của mình ra file, và xóa tài khoản khi thôi dùng, để dùng app như một cuốn sổ của riêng mình mà người khác không xem được.

Vì sao quan trọng: người dùng lớn tuổi bỏ app ngay nếu màn đầu hỏi nhiều. Nhưng mọi quyền trong app dựa vào việc biết đúng ai đang dùng, nên đăng nhập phải chắc mà vẫn ít bước. Xóa tài khoản chạm tới dữ liệu của người khác (đặt phòng đã chốt với họ), nên phải giữ những gì người kia cần và chỉ bỏ số điện thoại (QD-013).

## Luồng chính

Chị Hoa mở app lần đầu, thấy A1 "Lịch phòng Hạ Long", bấm "Bắt đầu ngay", đăng nhập (YC1.2), chọn "Tôi là chủ nhà", bấm "Tiếp tục" và vào tab Lịch (A4 vì chưa có căn, YC3.1). Không có hộp thoại nào hỏi tên hay số điện thoại; số chỉ được xin khi Chị Hoa bắt đầu chia lịch cho sale (YC6.1).

Ngày 07/10/2026, Chị Hoa vào Cá nhân (P1): "Chị Hoa · Chủ nhà", "Thông báo 2", "Cài đặt thông báo · 3 loại đang bật", "Giờ nhận, trả phòng mặc định · 14:00 · 12:00", "Ngày tính giá cuối tuần · T6, T7". Chị mở "Xuất file Excel (CSV)", giữ "Tháng này" và "Tất cả": "8 đặt phòng" (B1 đến B8, DLM.8), bấm xuất và nhận file.

## Phạm vi

YC này gồm: màn đầu, đăng nhập, chọn vai, tab Cá nhân, đăng xuất, hồ sơ, giờ nhận trả mặc định, xuất file CSV, hướng dẫn và nhắn Home247, xóa tài khoản.

Không thuộc YC này (dễ tưởng là có):
- Xin số điện thoại khi bắt đầu kết nối: YC6.1. Ngày tính giá cuối tuần (P6): YC4.6. Mức cộng mặc định: YC7.5. Mẫu tin gửi khách: YC8.2. Thông báo, cài đặt thông báo: YC12. Link xin xem lịch: YC6.4.
- Hiện "Đã xoá tài khoản" ở từng màn của người còn lại: YC của màn đó theo quy tắc dùng chung "Người đã xóa tài khoản". YC này nói lệnh xóa và các tiêu chí chung.
- Sao lưu và khôi phục bằng file, đội nhóm: bản sau (`docs/yc/README.md`).
- Đăng nhập trang quản trị: YC13.

## Quy tắc của nhóm

| Tên | Quy tắc | Ví dụ |
|---|---|---|
| Không hỏi khi vừa mở | Màn đầu và đăng nhập không hỏi tên, số điện thoại, không xin quyền gì (HV4) | A1 chỉ có "Bắt đầu ngay" |
| Vai chỉ chọn màn mở đầu | Vai quyết định tab và màn đầu; quyền với căn tính theo quan hệ người với căn (QD-005). Bản đầu không có màn đổi vai | Sale có căn của tôi vẫn ghi lịch căn đó |
| Menu theo vai | Chủ nhà thấy nhóm TÀI KHOẢN, CÀI ĐẶT, DỮ LIỆU, HỖ TRỢ; sale thấy TÀI KHOẢN, BÁN PHÒNG, CÀI ĐẶT, HỖ TRỢ | |
| Số điện thoại chỉ database ghi | Số trên hồ sơ chỉ có qua bước xin số (YC6.1); app không gửi số lên để sửa | "Từ Zalo ✓" |
| Giờ nhận trả mặc định | Một giờ nhận và một giờ trả cho mọi căn của chủ nhà, mặc định 14:00 và 12:00. Đổi giờ không đổi đặt phòng đã có ([MỞ: CH-091] với sale đã gửi khách) | "Khách nhận phòng từ 14:00, trả phòng trước 12:00 hôm sau." |
| File của chủ nhà | File xuất chỉ có đặt phòng ở căn của chủ nhà, tiền là số nguyên đồng không dấu chấm, khách chỉ do chính chủ nhà nhập (QD-011), không có giá bán, tiền chênh; UTF-8 có BOM để Excel đọc đúng tiếng Việt | 2200000 |

Quy tắc dùng chung: Người đã xóa tài khoản (`docs/luat-chung/Nghiep_vu.md`), Xin số điện thoại đúng lúc (YC6); HV4, HV5; PWA.md P1, P2, P5, P8.

## Ai được làm gì

Theo `docs/luat-chung/PQ.md`: PQ1, PQ2, PQ6, PQ9.CHU, PQ11.CHU, PQ20, PQ23. Test vi phạm phải có, ở lớp database:
- Không ai sửa được hồ sơ, giờ nhận trả của người khác; gửi số điện thoại, vai, mã người khác lên thì từ chối và dữ liệu không đổi (YC1.4-NT4).
- Sale không xuất được file, kể cả với căn được chia sẻ; Anh Tuấn không xuất được căn của Chị Hoa (YC1.6-NT5).
- File không có khách do sale nhập, không có giá bán (YC1.6-NT4).
- Sau khi xóa tài khoản: không ai đọc được số điện thoại của người đó (YC1.8-NT1).

## Dữ liệu

Mô hình chung: `docs/Thiet_ke_DB.md`. YC này cần database bảo đảm:
- Mỗi người đăng nhập có một hồ sơ, tạo ở lần đầu: tên, tên hiển thị, ảnh, số điện thoại (chỉ database ghi), vai đã chọn, lúc đồng ý điều khoản, giờ nhận trả mặc định, lúc xóa tài khoản.
- Lệnh xóa tài khoản: trong một giao dịch bỏ số điện thoại, ghi lúc xóa, ghi thông báo "chủ nhà đã xóa tài khoản" cho mỗi sale đang kết nối (YC12). Không xóa căn, ảnh căn, lịch, giá, tiền, đặt phòng, yêu cầu.
- Người đã xóa tài khoản nhập lại số (YC6.1) thì bỏ dấu đã xóa; kết nối cũ dùng lại, không phải mời lại.
- Lệnh đếm và lệnh xuất file dùng cùng một bộ lọc, nên ra cùng số dòng.

## Trạng thái màn (mọi mục)

- Đang tải: HV1. Mất mạng: HV2. Quay lại từ nền: HV3. Không có quyền: HV5.

## YC1.1 · Màn đầu và chọn vai

Bản 1 · rủi ro: tb · Màn: A1, A3, A3-00

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Mở app lần đầu, chưa đăng nhập | A1: "Lịch phòng Hạ Long", "Lịch phòng và giá homestay, chia sẻ cho sale trong một chạm.", ba dòng "Ghi lịch các phòng nhanh hơn sổ tay", "Sale tự xem phòng trống, không cần gọi hỏi", "Gửi ảnh và giá phòng cho khách trong vài giây", nút "Bắt đầu ngay", dòng "Bằng việc tiếp tục, bạn đồng ý với Điều khoản và Chính sách quyền riêng tư" (hai link, nội dung ở YC15) | Không |
| 2 | Bấm "Bắt đầu ngay" | Đăng nhập (YC1.2), xong sang A3. Không có popup hỏi tên, số | Tạo hồ sơ ở lần đầu |
| 3 | Ở A3 | "Bạn dùng app để làm gì?", thẻ "Tôi là chủ nhà" ("Ghi lịch phòng, đặt giá, mời sale xem lịch.") và "Tôi là sale" ("Tìm phòng trống, gửi ảnh và giá cho khách."). Chưa chọn: nút "Tiếp tục" mờ, "Chọn một mục để tiếp tục" (A3-00) | Không |
| 4 | Chạm một thẻ | Thẻ đó đổi nền, viền, có ✓; thẻ kia bỏ chọn; "Tiếp tục" sáng | Không |
| 5 | Bấm "Tiếp tục" | Chủ nhà: tab Lịch (A4 khi chưa có căn, YC3.1). Sale: tab Lịch (A5 khi chưa có nguồn phòng, YC7.1) | Ghi vai và lúc đồng ý điều khoản |
| 6 | Người đã chọn vai mở lại app | Vào thẳng tab Lịch của vai, không qua A1, A3 | Đọc vai |

Mở app từ link mời hay link xin lịch khi chưa đăng nhập: YC6.3, YC6.5.

Luật kiểm:

| Ô | Luật | Sai thì |
|---|---|---|
| Vai | Bắt buộc khi chọn vai; "chủ nhà" hoặc "sale" | "Vai không hợp lệ" |

Tiêu chí:
- **YC1.1-NT1** Khi người chưa đăng nhập mở app, thì thấy A1 với nút "Bắt đầu ngay" và hai link "Điều khoản", "Chính sách quyền riêng tư"; không có ô hay hộp thoại hỏi tên, số điện thoại. · unit
- **YC1.1-NT2** Khi người dùng đăng nhập xong sau "Bắt đầu ngay", thì app sang A3, không có popup hỏi tên, số. · e2e
- **YC1.1-NT3** Khi người dùng chạm "Tôi là sale" rồi "Tôi là chủ nhà", thì chỉ thẻ chủ nhà ở trạng thái chọn. · unit
- **YC1.1-NT4** Khi chưa chạm thẻ nào, thì "Tiếp tục" không bấm được và có dòng "Chọn một mục để tiếp tục". · unit
- **YC1.1-NT5** Khi người dùng chọn "Tôi là chủ nhà" và bấm "Tiếp tục", thì hồ sơ có vai chủ nhà và lúc đồng ý điều khoản, app mở tab Lịch. · database, e2e
- **YC1.1-NT6** Khi Chị Hoa đã chọn vai mở lại app, thì vào thẳng tab Lịch, không thấy A1, A3. · unit
- **YC1.1-NT7** Khi lệnh chọn vai có giá trị khác "chủ nhà", "sale", thì database từ chối với câu "Vai không hợp lệ". · database

## YC1.2 · Đăng nhập

Bản 1 · rủi ro: cao · Màn: chưa có

Cách đăng nhập thật (mã qua SMS, mã qua email, Zalo trên web): [MỞ: CH-001]. Giữ các điều sau dù chọn cách nào: không form đăng ký dài; không xin quyền khi vừa mở; số điện thoại chỉ xin khi người dùng bấm việc cần số (YC6.1).

Tới khi có câu trả lời, bản thử (staging) có đăng nhập tạm bằng email và mật khẩu, chỉ bật ở project thử, không bao giờ bật ở production:

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Mở app khi chưa đăng nhập | Màn "Đăng nhập thử": ô Email, ô Mật khẩu, nút "Đăng nhập", dòng "Chỉ dùng cho bản thử." | Không |
| 2 | Nhập đúng, bấm "Đăng nhập" | Chưa chọn vai thì A3, đã chọn thì tab Lịch. Đến từ link mời thì về đúng màn của link (YC6.3) | Cấp phiên; tạo hồ sơ ở lần đầu |
| 3 | Nhập sai | "Email hoặc mật khẩu chưa đúng." Ở lại màn | Không |
| 4 | Đóng rồi mở lại app | Vào thẳng app | Phiên giữ trên máy, tự làm mới |

Tiêu chí:
- **YC1.2-NT1** Khi người dùng chưa đăng nhập mở địa chỉ nào của app, thì về màn đăng nhập, trừ địa chỉ link mời và link xin lịch (xem trước không cần đăng nhập, QD-008). · unit
- **YC1.2-NT2** Khi tài khoản thử của Chị Hoa đăng nhập đúng ở staging, thì vào app và thấy 1509, 3402. · e2e
- **YC1.2-NT3** Khi nhập sai mật khẩu, thì thấy "Email hoặc mật khẩu chưa đúng." và không vào app. · e2e
- **YC1.2-NT4** Khi đã đăng nhập, đóng trình duyệt rồi mở lại, thì vẫn ở trong app. · e2e
- **YC1.2-NT5** Khi một người mở link mời lúc chưa đăng nhập rồi đăng nhập, thì quay lại đúng màn "Thêm lịch" của link đó. · e2e

## YC1.3 · Tab Cá nhân và đăng xuất

Bản 1 · rủi ro: thấp · Màn: P1, P4

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Mở tab Cá nhân | Đầu trang: ảnh hay chữ cái đầu, tên, số điện thoại (nếu có), vai ("Chủ nhà", "Sale") | Hồ sơ, số thông báo chưa đọc |
| 2 | Nhóm "TÀI KHOẢN" | "Thông báo" kèm số chưa đọc (YC12.2), "Thông tin cá nhân" (YC1.4), dòng cách đăng nhập đang dùng ([MỞ: CH-001]) | |
| 3 | Chủ nhà (P1) | "CÀI ĐẶT": "Cài đặt thông báo · 3 loại đang bật" (YC12.4), "Giờ nhận, trả phòng mặc định · 14:00 · 12:00" (YC1.5), "Ngày tính giá cuối tuần · T6, T7" (YC4.6). "DỮ LIỆU": "Xuất file Excel (CSV)" (YC1.6) | Cài đặt |
| 4 | Sale (P4) | "BÁN PHÒNG": "Link xin xem lịch · Gửi chủ nhà" (YC6.4), "Mức cộng giá mặc định · +400k" (YC7.5), "Mẫu tin gửi khách" (YC8.2). "CÀI ĐẶT": "Cài đặt thông báo" | Cài đặt |
| 5 | Nhóm "HỖ TRỢ" | "Hướng dẫn sử dụng", "Nhắn Zalo cho Home247" (YC1.7) | Không |
| 6 | Cuối trang | Nút "Đăng xuất", "Home247 · phiên bản 1.0" | Không |
| 7 | Bấm "Đăng xuất" | Hỏi "Xác nhận đăng xuất? Dữ liệu vẫn giữ nguyên." Bấm lần hai mới đăng xuất, về A1; dữ liệu trong bộ nhớ app bị xóa, nút quay lại của trình duyệt không thấy lại dữ liệu | Hủy phiên |

Dòng "Đội nhóm" ở P4: bản sau, không hiện ở bản 1.

Tiêu chí:
- **YC1.3-NT1** Khi người dùng là chủ nhà, thì thấy TÀI KHOẢN, CÀI ĐẶT, DỮ LIỆU, HỖ TRỢ, không thấy "BÁN PHÒNG"; là sale thì thấy TÀI KHOẢN, BÁN PHÒNG, CÀI ĐẶT, HỖ TRỢ, không thấy "DỮ LIỆU". · unit
- **YC1.3-NT2** Khi có 2 thông báo chưa đọc, thì dòng "Thông báo" ghi 2; chủ nhà bật 3 loại thì "Cài đặt thông báo" ghi "3 loại đang bật". · unit
- **YC1.3-NT3** Khi người dùng chạm một dòng, thì mở đúng màn của dòng đó. · unit
- **YC1.3-NT4** Khi bấm "Đăng xuất" lần đầu, thì chỉ hỏi xác nhận; xác nhận thì về A1, phiên cũ gọi database bị từ chối, và nút quay lại không thấy dữ liệu cũ. · unit, e2e
- **YC1.3-NT5** Khi đăng nhập lại sau khi đăng xuất, thì dữ liệu của tài khoản còn nguyên. · e2e

## YC1.4 · Hồ sơ

Bản 1 · rủi ro: tb · Màn: P2

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Mở "Thông tin cá nhân" | Ảnh hay chữ cái đầu, nút "Đổi ảnh đại diện", ô "Họ và tên", ô "Tên hiển thị" ("Sale thấy tên này trong Nguồn phòng."), số điện thoại chỉ xem; chưa có số thì "Chưa có · app sẽ hỏi khi bạn kết nối lần đầu" | Hồ sơ, ảnh qua đường dẫn có hạn |
| 2 | Bấm "Đổi ảnh đại diện" | Chọn ảnh (PWA.md P6) | Ảnh tải lên ngay |
| 3 | Sửa tên hiển thị, bấm "Lưu thay đổi" | Lưu, ở lại màn | Ghi tên hiển thị, ảnh |

Ô "Họ và tên" sửa được không: [MỞ: YC1-H1]; tới khi có câu trả lời, chỉ xem.

Luật kiểm:

| Ô | Luật | Sai thì |
|---|---|---|
| Tên hiển thị | Bỏ khoảng trắng đầu cuối, 1 đến 100 ký tự | "Tên hiển thị từ 1 đến 100 ký tự" |

Tiêu chí:
- **YC1.4-NT1** Khi Chị Hoa sửa tên hiển thị và lưu, thì Sale Hùng thấy tên mới ở Nguồn phòng. · database, unit
- **YC1.4-NT2** Khi hồ sơ có số điện thoại, thì ô số không sửa được. · unit
- **YC1.4-NT3** Khi hồ sơ chưa có số, thì ô ghi "Chưa có · app sẽ hỏi khi bạn kết nối lần đầu". · unit
- **YC1.4-NT4** Khi Sale Lan gửi lệnh sửa hồ sơ của Chị Hoa, hay gửi số điện thoại, vai, mã người khác trong lệnh sửa của mình, thì database từ chối và không gì đổi. · database

## YC1.5 · Giờ nhận, trả phòng mặc định

Bản 1 · rủi ro: tb · Màn: P5

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Mở màn | "Áp dụng cho tất cả căn. Sale gửi giờ này cho khách cùng thông tin căn.", "Giờ nhận phòng", "Giờ trả phòng" | Giờ của người gọi |
| 2 | Chọn giờ | Tóm tắt "Khách nhận phòng từ 14:00, trả phòng trước 12:00 hôm sau." đổi theo | Không |
| 3 | Bấm "Lưu thay đổi" | Về Cá nhân | Ghi giờ; không đổi đặt phòng đã có |

Tiêu chí:
- **YC1.5-NT1** Khi chủ nhà lưu 14:00 và 12:00, thì dòng menu ghi "14:00 · 12:00" và S3 của sale ghi "Nhận phòng 14:00 · Trả phòng 12:00". · database, unit
- **YC1.5-NT2** Khi chủ nhà đổi giờ, thì đặt phòng đã có giữ giờ đã ghi. · database
- **YC1.5-NT3** Khi Chị Hoa đổi giờ, thì giờ của Anh Tuấn không đổi; sale ghi giờ thì không đổi giờ của chủ nhà nào. · database

## YC1.6 · Xuất file CSV

Bản 1 · rủi ro: cao · Màn: P8, P8-00

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Mở "Xuất file Excel (CSV)" | "Danh sách đặt phòng để xem hoặc tính toán trên Excel, Google Sheets." | Không |
| 2 | Chọn thời gian | Chip "Tháng này" (chọn sẵn), "3 tháng gần nhất", "Năm 2026", "Tùy chọn" (chọn từ ngày, đến ngày) | Không |
| 3 | Chọn căn | Chip "Tất cả" (chọn sẵn), "1509", "3402" | Căn của người gọi |
| 4 | Xem cột | "FILE GỒM CÁC CỘT: Căn · Ngày nhận · Ngày trả · Số đêm · Khách · SĐT · Sale · Tổng tiền · Đã cọc · Còn lại · Ghi chú" | Không |
| 5 | Xem số dòng | "8 đặt phòng"; đổi chip thì số đổi theo. Không có đặt phòng thì P8-00 | Lệnh đếm |
| 6 | Bấm "Xuất file Excel (CSV)" | Tải file về máy, hay mở bảng chia sẻ nếu trình duyệt cho gửi file (PWA.md P3); tên file "home247-dat-phong-<từ ngày>-<đến ngày>.csv" (giả định GD30) | Lệnh xuất |

Đặt phòng thuộc khoảng theo ngày nhận hay theo đêm: [MỞ: YC1-H2]; tới khi có câu trả lời, theo ngày nhận (khớp DLM.8). Có đặt phòng đã hủy không: [MỞ: YC1-H3]. Căn đã xóa có trong "Tất cả" không: [MỞ: YC1-H4]. Sale có căn của tôi xuất được không: [MỞ: YC1-H5]. Cột Khách, SĐT: [MỞ: CH-088].

Luật kiểm:

| Ô | Luật | Sai thì |
|---|---|---|
| Từ ngày, đến ngày | Đến ngày không trước từ ngày; tối đa 366 ngày | "Chọn tối đa 1 năm" |
| Căn | Tối đa 50 căn, đều là căn của người gọi | Không tìm thấy |

Tiêu chí:
- **YC1.6-NT1** Khi Chị Hoa chọn "Tháng này" tháng 10 và "Tất cả", thì ghi "8 đặt phòng"; chọn "1509" thì "4 đặt phòng"; file có đúng số dòng đó. · database, unit
- **YC1.6-NT2** Khi xuất, thì mỗi dòng có đủ 11 cột theo thứ tự ở bước 4. · unit
- **YC1.6-NT3** Khi file có tiền, thì là số nguyên đồng không dấu ngăn nghìn (2200000), và file mở bằng Excel không lỗi tiếng Việt. · unit
- **YC1.6-NT4** Khi B1 có khách do Sale Hùng nhập, thì ô Khách, SĐT của B1 trống, và không ô nào có 2.600.000. · database
- **YC1.6-NT5** Khi Anh Tuấn xuất với căn 1509, hay Sale Hùng xuất với căn được chia sẻ, thì database từ chối. · database
- **YC1.6-NT6** Khi khoảng chọn không có đặt phòng, thì thấy P8-00. · unit

## YC1.7 · Hướng dẫn và nhắn Home247

Bản 1 · rủi ro: thấp · Màn: P9

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Mở "Hướng dẫn sử dụng" | Nhóm "CHỦ NHÀ", các mục thu gọn: "Thêm căn và ảnh", "Đặt giá theo tháng", "Đặt giá ngày lễ", "Đặt phòng", "Mời sale xem lịch", "Sale được xem gì" | Không |
| 2 | Chạm một mục | Mở nội dung. "Đặt giá theo tháng": 1 "Mở căn, chọn tab Giá." 2 "Chạm tháng bắt đầu rồi tháng kết thúc." 3 "Nhập giá ngày thường, cuối tuần, bấm Áp dụng." | Không |
| 3 | Cuối màn | "Vẫn chưa rõ? Home247 trả lời qua Zalo trong giờ hành chính.", nút "Nhắn Zalo cho Home247" | Không |
| 4 | Bấm "Nhắn Zalo cho Home247" | Mở chat Zalo với Home247 (PWA.md P5) | Không |

Nội dung các mục khác và phần cho sale: [MỞ: CH-090].

Tiêu chí:
- **YC1.7-NT1** Khi người dùng chạm "Đặt giá theo tháng", thì thấy 3 bước theo thứ tự ở bước 2. · unit
- **YC1.7-NT2** Khi người dùng bấm "Nhắn Zalo cho Home247", thì app mở đường dẫn chat Zalo của Home247. · unit

## YC1.8 · Xóa tài khoản

Bản 1 · rủi ro: cao · Màn: chưa có ([MỞ: CH-007])

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Bấm xóa tài khoản, xác nhận (chỗ đặt nút, chữ xác nhận: [MỞ: CH-007]) | Về A1 | Lệnh xóa tài khoản (mục Dữ liệu) |
| 2 | Bấm hủy ở bước xác nhận | Không gì đổi | Không |
| 3 | Đăng nhập lại cùng tài khoản | Thấy lại căn, lịch, giá, đặt phòng của mình. Chưa có số thì xin lại khi bấm việc cần số (YC6.1) | Hồ sơ cũ |
| 4 | Nhập lại số (YC6.1) | Dùng như trước; người khác không còn thấy "Đã xoá tài khoản" | Bỏ dấu đã xóa |

Phía người còn lại theo quy tắc Người đã xóa tài khoản; tiêu chí ở từng YC: YC5.5-NT4, YC6.2-NT7, YC7.1-NT6, YC9.1-NT8, YC9.4-NT6, YC10.1-NT7, YC10.1-NT8, YC11.2-NT7. Ảnh đại diện, tên và số chủ căn tự nhập, tên và số khách do người xóa nhập có bị xóa không: [MỞ: CH-033]. Chính sách quyền riêng tư nói giữ gì, bao lâu: [MỞ: CH-032].

Tiêu chí:
- **YC1.8-NT1** Khi Chị Hoa xóa tài khoản, thì database không còn số của Chị Hoa, còn 1509, 3402, ảnh, lịch, giá và B1 đến B8 như trước; Chị Hoa về A1. · database, e2e
- **YC1.8-NT2** Khi Chị Hoa bấm hủy ở bước xác nhận, thì không gì đổi. · unit
- **YC1.8-NT3** Khi lệnh xóa lỗi giữa chừng, thì không thay đổi nào được ghi và app báo theo HV2. · database
- **YC1.8-NT4** Khi Chị Hoa xóa tài khoản, thì Sale Hùng, Lan, Nga, Minh mỗi người có đúng một thông báo "Chị Hoa đã xóa tài khoản". · database
- **YC1.8-NT5** Khi Sale Hùng đã xóa tài khoản, thì B1 vẫn chiếm 10/10, 11/10 của 1509 và vẫn chặn trùng. · database
- **YC1.8-NT6** Khi Chị Hoa đã xóa tài khoản và Hùng mở 1509 từ thông báo cũ, thì thấy màn HV5 lý do "Chủ nhà đã xóa tài khoản", không có ảnh, lịch, giá. · database, unit
- **YC1.8-NT7** Khi một người vừa có căn vừa bán căn người khác (QD-005) xóa tài khoản, thì cả phía chủ nhà và phía sale của người đó theo quy tắc Người đã xóa tài khoản. · database
- **YC1.8-NT8** Khi Chị Hoa xóa tài khoản rồi đăng nhập lại, thì thấy lại 1509, 3402, B1 đến B8; nhập lại số thì Hùng thấy lại 1509, 3402 theo kết nối cũ, không ai phải mời lại. · database, e2e
- **YC1.8-NT9** Khi Sale Hùng đã xóa tài khoản, thì Chị Hoa không đổi được phạm vi hay quyền xem cho Hùng; Hùng nhập lại số thì kết nối dùng lại ngay. · database

## Màn hình

Xem hình: `python3 docs/thiet-ke/trich-man.py <mã>`. Chữ và số trên hình lệch YC thì YC đúng.

- **A1, A3, A3-00.** Đúng bố cục.
- **P1, P4 · Cá nhân.** Dòng "Đăng nhập bằng Zalo · Đã liên kết" đổi theo CH-001. Bỏ dòng "Đội nhóm" ở bản 1.
- **P2 · Hồ sơ.** Nhãn "Từ Zalo ✓" và mục "ĐĂNG NHẬP · Zalo" đổi theo CH-001.
- **P5, P8, P8-00, P9.** Đúng bố cục.
- Không làm: P7, P7-00 (sao lưu, bản sau).

## Lịch sử bản

| Bản | Ngày | Mục đổi | Đổi gì |
|---|---|---|---|
| 1 | 18/11/2026 | Tất cả | Tạo từ US1 (vào app, chọn vai), US37, US21 (trừ cài đặt thông báo), US22 (QD-021) |
