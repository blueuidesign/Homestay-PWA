---
id: YC1
tieu_de: Tài khoản
trang_thai: de-xuat
nguoi_chu: tung
rev: 6
ban: 3
---
# YC1 · Tài khoản

## Mục tiêu

Là người dùng, tôi muốn vào app chỉ bằng email, tên và số điện thoại, không phải nhớ mật khẩu, chọn mình là chủ nhà hay sale, sửa cách người khác thấy mình, lấy dữ liệu của mình ra file, và xóa tài khoản khi thôi dùng, để dùng app như một cuốn sổ của riêng mình mà người khác không xem được.

Vì sao quan trọng: người dùng lớn tuổi bỏ app ngay nếu màn đầu hỏi nhiều. Nhưng mọi quyền trong app dựa vào việc biết đúng ai đang dùng, nên đăng nhập phải chắc mà vẫn ít bước. Xóa tài khoản chạm tới dữ liệu của người khác (đặt phòng đã chốt với họ), nên phải giữ những gì người kia cần và chỉ bỏ số điện thoại (QD13).

## Luồng chính
`[r3 · sửa]`

Chị Hoa mở app lần đầu, thấy A1 "Lịch phòng Hạ Long", bấm "Tạo tài khoản", nhập họ tên, số điện thoại và email, rồi nhập mã 6 số gửi về email (YC1.2). Chị chọn "Tôi là chủ nhà", bấm "Tiếp tục" và vào tab Lịch (A4 vì chưa có căn, YC3.1). Từ đó tới khi đăng xuất, Chị Hoa mở app là vào thẳng, không phải nhập lại gì.

Ngày 07/10/2026, Chị Hoa vào Cá nhân (P1): "Chị Hoa · Chủ nhà", "Thông báo 2", "Cài đặt thông báo · 3 loại đang bật", "Giờ nhận, trả phòng mặc định · 14:00 · 12:00", "Ngày tính giá cuối tuần · T6, T7". Chị mở "Xuất file Excel (CSV)", giữ "Tháng này" và "Tất cả": "8 đặt phòng" (B1 đến B8, DLM.8), bấm xuất và nhận file.

## Phạm vi
`[r2 · sửa]`

YC này gồm: màn đầu, đăng ký và đăng nhập, chọn vai, tab Cá nhân, đăng xuất, hồ sơ, giờ nhận trả mặc định, xuất file CSV, hướng dẫn và nhắn Home247, xóa tài khoản.

Không thuộc YC này (dễ tưởng là có):
- Ngày tính giá cuối tuần (P6): YC4.6. Mức cộng mặc định: YC7.5. Mẫu tin gửi khách: YC8.2. Thông báo, cài đặt thông báo: YC12. Link xin xem lịch: YC6.4.
- Hiện "Đã xoá tài khoản" ở từng màn của người còn lại: YC của màn đó theo quy tắc dùng chung "QT6.5 Người đã xóa tài khoản". YC này nói lệnh xóa và các tiêu chí chung.
- Sao lưu và khôi phục bằng file, đội nhóm: bản sau (`docs/product/requirements/README.md`).
- Đăng nhập trang quản trị: YC13.

## Quy tắc của nhóm
`[r3 · sửa]`

| Tên | Quy tắc | Ví dụ |
|---|---|---|
| Không hỏi khi vừa mở | A1 không hỏi gì, không xin quyền gì (HV4). Tên và số chỉ hỏi ở A2, sau khi người dùng tự bấm "Tạo tài khoản" (QD22) | A1 chỉ có hai nút "Tạo tài khoản", "Tôi đã có tài khoản · Đăng nhập" |
| Chưa đăng ký xong thì chưa vào app | Hồ sơ chưa có tên hoặc số thì mọi màn của app đều về màn nhập số (YC1.2), trừ màn xem trước của link mời, link xin lịch (QD8) (QD22) | Người đã xóa tài khoản đăng nhập lại phải nhập lại số |
| Vai chỉ chọn màn mở đầu | Vai quyết định tab và màn đầu; quyền với căn tính theo quan hệ người với căn (QD5). Bản đầu không có màn đổi vai | Sale có căn của tôi vẫn ghi lịch căn đó |
| Menu theo vai | Chủ nhà thấy nhóm TÀI KHOẢN, CÀI ĐẶT, DỮ LIỆU, HỖ TRỢ; sale thấy TÀI KHOẢN, BÁN PHÒNG, CÀI ĐẶT, HỖ TRỢ | |
| Số điện thoại do người dùng nhập | Nhập lúc tạo tài khoản (YC1.2), sửa được ở P2 (YC1.4). Database kiểm định dạng (pwa.md P2) và không cho trùng số của tài khoản khác chưa xóa (YC1-H13) rồi mới ghi | Sửa số ở P2 thì sale đã kết nối thấy số mới |
| Giờ nhận trả mặc định | Một giờ nhận và một giờ trả cho mọi căn của chủ nhà, mặc định 14:00 và 12:00. Đổi giờ không đổi đặt phòng đã có (sale đã gửi khách thì tin đã gửi giữ nguyên, lần soạn sau lấy giờ mới; Claude tự chốt, QD25, trả lời YC1-H11) `[r6 · sửa]` | "Khách nhận phòng từ 14:00, trả phòng trước 12:00 hôm sau." |
| File của chủ nhà | File xuất chỉ có đặt phòng ở căn của chủ nhà, tiền là số nguyên đồng không dấu chấm, khách chỉ do chính chủ nhà nhập (QD11), không có giá bán, tiền chênh; UTF-8 có BOM để Excel đọc đúng tiếng Việt | 2200000 |

Quy tắc dùng chung: QT6.5 Người đã xóa tài khoản; HV4, HV5; pwa.md P1, P2, P5, P8.

## Ai được làm gì

Theo `docs/security/PQ-ma-tran-quyen.md`: PQ1, PQ2, PQ6, PQ9.CHU, PQ11.CHU, PQ20, PQ23. Test vi phạm phải có, ở lớp database:
- Không ai sửa được hồ sơ, giờ nhận trả của người khác; gửi số điện thoại, vai, mã người khác lên thì từ chối và dữ liệu không đổi (YC1.4-NT4).
- Sale không xuất được file, kể cả với căn được chia sẻ; Anh Tuấn không xuất được căn của Chị Hoa (YC1.6-NT5).
- File không có khách do sale nhập, không có giá bán (YC1.6-NT4).
- Sau khi xóa tài khoản: không ai đọc được số điện thoại của người đó (YC1.8-NT1).

## Dữ liệu
`[r3 · sửa]`

Mô hình chung: `docs/architecture/thiet-ke-db.md`. YC này cần database bảo đảm:
- Mỗi người đăng nhập có một hồ sơ, tạo ở lần đầu: tên, tên hiển thị, ảnh, số điện thoại (ghi bằng lệnh đăng ký YC1.2 hay lệnh sửa hồ sơ YC1.4, luôn qua kiểm), vai đã chọn, lúc đồng ý điều khoản, giờ nhận trả mặc định, lúc xóa tài khoản.
- Lệnh xóa tài khoản: trong một giao dịch bỏ số điện thoại, ghi lúc xóa, ghi thông báo "chủ nhà đã xóa tài khoản" cho mỗi sale đang kết nối (YC12). Không xóa căn, ảnh căn, lịch, giá, tiền, đặt phòng, yêu cầu.
- Lệnh đăng ký: ghi tên và số vào hồ sơ của chính người gọi sau khi kiểm (YC1.2). Hồ sơ đã có số thì từ chối, không ghi đè.
- `[r5 · sửa]` Kiểm email đã có tài khoản (A2-01, A11-01): không thêm hàm cho người chưa đăng nhập, vì bất biến KT-DB.3.1 chỉ cho họ gọi hàm xem link mời. App xin mã đăng nhập với lựa chọn "không tạo tài khoản mới" của Supabase Auth: email chưa có tài khoản thì Supabase từ chối (A11-01, ở A2 thì gửi mã đăng ký); đã có thì mã đăng nhập được gửi luôn (A2-01 nút "Đăng nhập bằng email này" sang A11-02 với mã đó) (Claude tự quyết, QD25).
- Người đã xóa tài khoản đăng nhập lại và nhập lại số ở bước đăng ký (YC1.2) thì bỏ dấu đã xóa; kết nối cũ dùng lại, không phải mời lại.
- Lệnh đếm và lệnh xuất file dùng cùng một bộ lọc, nên ra cùng số dòng.

## Trạng thái màn (mọi mục)

- Đang tải: HV1. Mất mạng: HV2. Quay lại từ nền: HV3. Không có quyền: HV5.

## YC1.1 · Màn đầu và chọn vai
`[r3 · sửa]`

Bản 3 · rủi ro: tb · Màn: A1, A3, A3-00

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Mở app lần đầu, chưa đăng nhập | A1: "Lịch phòng Hạ Long", "Lịch phòng và giá homestay, chia sẻ cho sale trong một chạm.", ba dòng "Ghi lịch các phòng nhanh hơn sổ tay", "Sale tự xem phòng trống, không cần gọi hỏi", "Gửi ảnh và giá phòng cho khách trong vài giây", nút "Tạo tài khoản", nút "Tôi đã có tài khoản · Đăng nhập", dòng "Bằng việc tiếp tục, bạn đồng ý với Điều khoản và Chính sách quyền riêng tư" (hai link, nội dung ở YC15) | Không |
| 2 | Bấm "Tạo tài khoản" hay "Tôi đã có tài khoản · Đăng nhập" | Theo YC1.2. Người mới xong thì sang A3 | Tạo hồ sơ ở lần đầu |
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
- **YC1.1-NT1** Khi người chưa đăng nhập mở app, thì thấy A1 với hai nút "Tạo tài khoản", "Tôi đã có tài khoản · Đăng nhập" và hai link "Điều khoản", "Chính sách quyền riêng tư"; không có ô hay hộp thoại hỏi tên, số điện thoại. · unit
- **YC1.1-NT2** Khi người dùng mới tạo tài khoản xong (đã có tên và số), thì app sang A3. · e2e
- **YC1.1-NT3** Khi người dùng chạm "Tôi là sale" rồi "Tôi là chủ nhà", thì chỉ thẻ chủ nhà ở trạng thái chọn. · unit
- **YC1.1-NT4** Khi chưa chạm thẻ nào, thì "Tiếp tục" không bấm được và có dòng "Chọn một mục để tiếp tục". · unit
- **YC1.1-NT5** Khi người dùng chọn "Tôi là chủ nhà" và bấm "Tiếp tục", thì hồ sơ có vai chủ nhà và lúc đồng ý điều khoản, app mở tab Lịch. · database, e2e
- **YC1.1-NT6** Khi Chị Hoa đã chọn vai mở lại app, thì vào thẳng tab Lịch, không thấy A1, A3. · unit
- **YC1.1-NT7** Khi lệnh chọn vai có giá trị khác "chủ nhà", "sale", thì database từ chối với câu "Vai không hợp lệ". · database

## YC1.2 · Đăng ký và đăng nhập
`[r3 · sửa]`

Bản 3 · rủi ro: cao · Màn: A2, A2-01, A2-02, A2-03, A2-04, A11, A11-01, A11-02

Đăng nhập bằng mã 6 số gửi về email, không có mật khẩu ở bất kỳ môi trường nào, kể cả staging. Người mới nhập tên, số điện thoại và email ở cùng một màn, nhập đúng mã xong mới vào được app (QD22). Mã còn hạn 1 giờ; nút gửi lại bấm được sau 60 giây (YC1-H12).

Tạo tài khoản:

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Bấm "Tạo tài khoản" ở A1, hay "Bắt đầu ngay" ở A1-link | A2: "Tạo tài khoản", dòng "Sale và chủ nhà sẽ thấy tên và số điện thoại này khi kết nối với bạn.", ô "Họ và tên", "Số điện thoại", "Email" (gợi ý "Mỗi lần đăng nhập, app gửi mã về email này. Không cần mật khẩu."), nút "Gửi mã xác nhận", dòng điều khoản, link "Đã có tài khoản? Đăng nhập" | Không |
| 2 | Bấm "Gửi mã xác nhận" khi có ô sai | A2-01: lỗi dưới từng ô theo luật kiểm. Email đã có tài khoản: "Email này đã có tài khoản." kèm nút "Đăng nhập bằng email này" (sang A11-02 với email đó, gửi mã luôn) | Kiểm email đã có tài khoản chưa (mục Dữ liệu) |
| 3 | Bấm "Gửi mã xác nhận" khi đủ, đúng | A2-02: "Nhập mã xác nhận", "Mã 6 số đã gửi tới <email>", "Không thấy thư? Xem thêm trong mục Thư rác hoặc Quảng cáo.", 6 ô mã, nút "Xác nhận", "Gửi lại mã sau <n> giây", "Đổi email" (về A2, giữ các ô đã nhập). Tên và số giữ trên máy tới khi xác nhận xong | Supabase Auth gửi mã |
| 4 | Nhập đúng mã | Ghi tên và số, rồi sang A3 (YC1.1). Đến từ link mời hay link xin lịch thì về đúng màn của link (YC6.3, YC6.5) | Cấp phiên; tạo hồ sơ; lệnh đăng ký ghi tên, số |
| 5 | Số đã thuộc tài khoản khác (database từ chối ở bước 4) | Về A2, lỗi dưới ô số "Số này đã có tài khoản. Đăng nhập bằng email của tài khoản đó." (YC1-H13) | Không ghi |
| 6 | Nhập sai mã | A2-03: "Mã chưa đúng. Kiểm tra lại thư mới nhất, hoặc bấm "Gửi lại mã"." | Không |
| 7 | Mã hết hạn hay đã dùng | A2-04: "Mã này đã hết hạn hoặc đã dùng rồi. Bấm "Gửi lại mã" để nhận mã mới.", nút "Gửi lại mã", "Đổi email" | Không |

Đăng nhập:

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Bấm "Tôi đã có tài khoản · Đăng nhập" ở A1, hay "Đăng nhập" ở A2 | A11: "Đăng nhập", "Nhập email bạn đã dùng khi tạo tài khoản. App gửi mã 6 số về email đó.", ô "Email", nút "Gửi mã đăng nhập", link "Chưa có tài khoản? Tạo tài khoản" | Không |
| 2 | Email chưa có tài khoản | A11-01: "Email này chưa có tài khoản. Kiểm tra lại chính tả, hoặc tạo tài khoản mới.", nút "Tạo tài khoản với email này" (sang A2, điền sẵn email) | Supabase Auth không tạo tài khoản mới ở luồng này |
| 3 | Email đã có tài khoản | A11-02: "Nhập mã đăng nhập", như A2-02, nút "Đăng nhập". Mã sai, hết hạn: như A2-03, A2-04 | Supabase Auth gửi mã |
| 4 | Nhập đúng mã | Chưa chọn vai thì A3, đã chọn thì tab Lịch, đến từ link thì về màn của link | Cấp phiên |
| 5 | Hồ sơ chưa có số (đã xóa tài khoản trước đó, YC1.8) | Màn nhập lại số: khối "Số điện thoại" của A2 kèm nút lưu, chưa lưu thì không vào màn nào khác (Claude tự quyết, QD25; chưa vẽ) | Lệnh đăng ký ghi số |
| 6 | Đóng rồi mở lại app | Vào thẳng app | Phiên giữ trên máy, tự làm mới |

Luật kiểm:

| Ô | Luật | Sai thì |
|---|---|---|
| Họ và tên | Bỏ khoảng trắng đầu cuối, không trống, tối đa 100 ký tự | "Nhập họ và tên để sale và chủ nhà biết bạn là ai." |
| Số điện thoại | Bỏ khoảng trắng, dấu chấm, gạch; còn 9 đến 15 chữ số, cho phép dấu + ở đầu (pwa.md P2). App kiểm để báo sớm, database kiểm lại | "Số điện thoại cần từ 9 đến 15 chữ số." |
| Email | Có dạng email | Báo dưới ô email |
| Mã | Đủ 6 chữ số thì nút xác nhận mới bấm được | Không |

Tiêu chí:
- **YC1.2-NT1** Khi người dùng chưa đăng nhập mở địa chỉ nào của app, thì về A1, trừ địa chỉ link mời và link xin lịch (xem trước không cần đăng nhập, QD8). · unit
- **YC1.2-NT2** Khi người mới nhập đủ tên, số, email và bấm "Gửi mã xác nhận", thì app sang A2-02 và hộp thư của email đó nhận được mã 6 số. · e2e
- **YC1.2-NT3** Khi nhập sai mã, thì thấy A2-03 và không vào app. · e2e
- **YC1.2-NT4** Khi người mới nhập đúng mã, thì hồ sơ có đúng tên và số đã nhập và app mở A3. · e2e
- **YC1.2-NT5** Khi lệnh đăng ký có tên trống hoặc số sai luật kiểm, thì database từ chối và hồ sơ không đổi. · database
- **YC1.2-NT6** Khi lệnh đăng ký gửi lên cho hồ sơ đã có số, hay nhắm vào hồ sơ của người khác, thì database từ chối và không gì đổi. · database
- **YC1.2-NT7** Khi người đã có tài khoản đăng nhập ở A11 và nhập đúng mã, thì vào thẳng tab Lịch (đã chọn vai) và không thấy A2. · e2e
- **YC1.2-NT8** Khi đã đăng nhập, đóng trình duyệt rồi mở lại, thì vẫn ở trong app. · e2e
- **YC1.2-NT9** `[r4 · bỏ]` Trùng YC6.3-NT1 (mở link mời lúc chưa đăng nhập, tạo tài khoản xong về A10). Kiểm ở US của link mời, vì màn A10 làm ở đó (Claude tự quyết, QD25).
- **YC1.2-NT10** Khi số điện thoại gửi lên đã thuộc một tài khoản khác chưa xóa, thì database từ chối và hồ sơ của người gọi không đổi. · database
- **YC1.2-NT11** Khi ở A2 nhập email đã có tài khoản, thì thấy "Email này đã có tài khoản." và nút "Đăng nhập bằng email này". · e2e
- **YC1.2-NT12** Khi ở A11 nhập email chưa có tài khoản, thì thấy A11-01 và không có tài khoản mới nào được tạo. · e2e
- **YC1.2-NT13** Khi ô số có chữ hay ít hơn 9 chữ số, thì A2-01 báo "Số điện thoại cần từ 9 đến 15 chữ số." và không gửi mã. · unit

## YC1.3 · Tab Cá nhân và đăng xuất
`[r3 · sửa]`

Bản 2 · rủi ro: thấp · Màn: P1, P4

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Mở tab Cá nhân | Đầu trang: ảnh hay chữ cái đầu, tên, số điện thoại (nếu có), vai ("Chủ nhà", "Sale") | Hồ sơ, số thông báo chưa đọc |
| 2 | Nhóm "TÀI KHOẢN" | "Thông báo" kèm số chưa đọc (YC12.2), "Thông tin cá nhân" (YC1.4), "Email đăng nhập" kèm địa chỉ email đang dùng (QD22) | |
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
`[r3 · sửa]`

Bản 3 · rủi ro: tb · Màn: P2

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Mở "Thông tin cá nhân" | Ảnh hay chữ cái đầu, nút "Đổi ảnh đại diện", ô "Họ và tên", ô "Tên hiển thị" ("Sale thấy tên này trong Nguồn phòng."), ô "Số điện thoại" ("Sale và chủ nhà đã kết nối thấy số này để gọi cho bạn. Cần từ 9 đến 15 chữ số."), khối "Đăng nhập" với email ("Mã đăng nhập gửi về email này. Không đổi email ở đây được."), nút "Xóa tài khoản" (YC1.8), nút "Lưu thay đổi" | Hồ sơ, ảnh qua đường dẫn có hạn |
| 2 | Bấm "Đổi ảnh đại diện" | Chọn ảnh (pwa.md P6) | Ảnh tải lên ngay |
| 3 | Sửa họ tên, tên hiển thị hay số, bấm "Lưu thay đổi" | Lưu, ở lại màn. Sai luật kiểm thì báo dưới ô | Ghi họ tên, tên hiển thị, số (kiểm như YC1.2), ảnh |

Ô "Họ và tên" sửa được, luật kiểm như ở A2 (YC1-H1, Claude tự chốt). Đổi email: không làm ở bản 1.

Luật kiểm:

| Ô | Luật | Sai thì |
|---|---|---|
| Tên hiển thị | Bỏ khoảng trắng đầu cuối, 1 đến 100 ký tự | "Tên hiển thị từ 1 đến 100 ký tự" |
| Họ và tên | Như A2 (YC1.2) | "Nhập họ và tên để sale và chủ nhà biết bạn là ai." |
| Số điện thoại | Như A2 (YC1.2), không trùng tài khoản khác chưa xóa | "Số điện thoại cần từ 9 đến 15 chữ số." hay "Số này đã có tài khoản." |

Tiêu chí:
- **YC1.4-NT1** Khi Chị Hoa sửa tên hiển thị và lưu, thì Sale Hùng thấy tên mới ở Nguồn phòng. · database, unit
- **YC1.4-NT2** Khi Chị Hoa sửa số đúng luật kiểm và lưu, thì Sale Hùng thấy số mới của Chị Hoa ở Nguồn phòng. · database, unit
- **YC1.4-NT3** `[r2 · bỏ]` Hồ sơ đã đăng ký xong luôn có số (QD22).
- **YC1.4-NT4** Khi Sale Lan gửi lệnh sửa hồ sơ của Chị Hoa, hay gửi vai, mã người khác trong lệnh sửa của mình, thì database từ chối và không gì đổi. · database
- **YC1.4-NT5** Khi lệnh sửa hồ sơ có số sai luật kiểm hay số của tài khoản khác chưa xóa, thì database từ chối và hồ sơ không đổi. · database

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
| 6 | Bấm "Xuất file Excel (CSV)" | Tải file về máy, hay mở bảng chia sẻ nếu trình duyệt cho gửi file (pwa.md P3); tên file "home247-dat-phong-<từ ngày>-<đến ngày>.csv" (giả định GD30) | Lệnh xuất |

Đặt phòng thuộc khoảng theo ngày nhận hay theo đêm: [MỞ: YC1-H2]; tới khi có câu trả lời, theo ngày nhận (khớp DLM.8). Có đặt phòng đã hủy không: [MỞ: YC1-H3]. Căn đã xóa có trong "Tất cả" không: [MỞ: YC1-H4]. Sale có căn của tôi xuất được không: [MỞ: YC1-H5]. Cột Khách, SĐT: [MỞ: YC1-H9].

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
| 4 | Bấm "Nhắn Zalo cho Home247" | Mở chat Zalo với Home247 (pwa.md P5) | Không |

Nội dung các mục khác viết theo màn hiện có; sale thấy nhóm "SALE" riêng, chủ nhà chỉ thấy nhóm "CHỦ NHÀ" (Claude tự chốt, QD25, trả lời YC1-H10). `[r6 · sửa]`

Tiêu chí:
- **YC1.7-NT1** Khi người dùng chạm "Đặt giá theo tháng", thì thấy 3 bước theo thứ tự ở bước 2. · unit
- **YC1.7-NT2** Khi người dùng bấm "Nhắn Zalo cho Home247", thì app mở đường dẫn chat Zalo của Home247. · unit

## YC1.8 · Xóa tài khoản
`[r3 · sửa]`

Bản 3 · rủi ro: cao · Màn: P2, P14, P14-01

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Bấm "Xóa tài khoản" ở cuối P2 | P14: "Xóa tài khoản <email>. Đọc kỹ điều gì mất, điều gì còn.", khối "Sẽ xóa" (số điện thoại; bị đăng xuất khỏi máy này; sale và chủ nhà đã kết nối không gọi, nhắn từ app được nữa), khối "Vẫn giữ" (căn, ảnh, lịch, giá, đặt phòng, thống kê; đặt phòng đã có vẫn chiếm đêm; người khác thấy tên kèm "Đã xoá tài khoản"; đăng nhập lại bằng email này và nhập lại số là dùng tiếp), nút đỏ "Xóa tài khoản", nút "Giữ tài khoản" | Không |
| 2 | Bấm "Xóa tài khoản" ở P14 | P14-01: nút thành "Xác nhận xóa? Bấm lần nữa để xóa. Xóa xong app về màn đầu." | Không |
| 3 | Bấm lần hai | Về A1 | Lệnh xóa tài khoản (mục Dữ liệu) |
| 4 | Bấm "Giữ tài khoản" | Về P2, không gì đổi | Không |
| 5 | Đăng nhập lại cùng email | Hồ sơ không còn số nên vào màn nhập lại số (YC1.2, đăng nhập bước 5) | Hồ sơ cũ |
| 6 | Nhập lại số | Thấy lại căn, lịch, giá, đặt phòng của mình. Dùng như trước; người khác không còn thấy "Đã xoá tài khoản" | Bỏ dấu đã xóa |

Phía người còn lại theo quy tắc QT6.5 Người đã xóa tài khoản; tiêu chí ở từng YC: YC5.5-NT4, YC6.2-NT7, YC7.1-NT6, YC9.1-NT8, YC9.4-NT6, YC10.1-NT7, YC10.1-NT8, YC11.2-NT7. Ảnh đại diện, tên và số chủ căn tự nhập, tên và số khách do người xóa nhập có bị xóa không: [MỞ: YC1-H8]. Chính sách quyền riêng tư nói giữ gì, bao lâu: [MỞ: YC1-H7].

Tiêu chí:
- **YC1.8-NT1** Khi Chị Hoa xóa tài khoản, thì database không còn số của Chị Hoa, còn 1509, 3402, ảnh, lịch, giá và B1 đến B8 như trước; Chị Hoa về A1. · database, e2e
- **YC1.8-NT2** Khi Chị Hoa bấm "Giữ tài khoản" ở P14 hay P14-01, thì về P2 và không gì đổi; bấm "Xóa tài khoản" một lần thì chỉ hiện P14-01, chưa xóa. · unit
- **YC1.8-NT3** Khi lệnh xóa lỗi giữa chừng, thì không thay đổi nào được ghi và app báo theo HV2. · database
- **YC1.8-NT4** Khi Chị Hoa xóa tài khoản, thì Sale Hùng, Lan, Nga, Minh mỗi người có đúng một thông báo "Chị Hoa đã xóa tài khoản". · database
- **YC1.8-NT5** Khi Sale Hùng đã xóa tài khoản, thì B1 vẫn chiếm 10/10, 11/10 của 1509 và vẫn chặn trùng. · database
- **YC1.8-NT6** Khi Chị Hoa đã xóa tài khoản và Hùng mở 1509 từ thông báo cũ, thì thấy màn HV5 lý do "Chủ nhà đã xóa tài khoản", không có ảnh, lịch, giá. · database, unit
- **YC1.8-NT7** Khi một người vừa có căn vừa bán căn người khác (QD5) xóa tài khoản, thì cả phía chủ nhà và phía sale của người đó theo quy tắc QT6.5 Người đã xóa tài khoản. · database
- **YC1.8-NT8** Khi Chị Hoa xóa tài khoản rồi đăng nhập lại, thì thấy lại 1509, 3402, B1 đến B8; nhập lại số thì Hùng thấy lại 1509, 3402 theo kết nối cũ, không ai phải mời lại. · database, e2e
- **YC1.8-NT9** Khi Sale Hùng đã xóa tài khoản, thì Chị Hoa không đổi được phạm vi hay quyền xem cho Hùng; Hùng nhập lại số thì kết nối dùng lại ngay. · database

## Màn hình
`[r3 · sửa]`

Xem hình: `python3 scripts/trich-man.py <mã>`. Chữ và số trên hình lệch YC thì YC đúng.

- **A1, A3, A3-00.** Đúng bố cục.
- **A2, A2-01 đến A2-04, A11, A11-01, A11-02.** Đúng bố cục (canvas bản PWA). Ảnh ghi một email mẫu, YC dùng `<email>`. Màn nhập lại số sau khi xóa tài khoản chưa vẽ: dùng khối số của A2.
- **P1, P4 · Cá nhân.** Đúng bố cục. Bỏ dòng "Đội nhóm" ở bản 1.
- **P2 · Hồ sơ, P14, P14-01.** Đúng bố cục.
- **P5, P8, P8-00, P9.** Đúng bố cục.
- Không làm: P7, P7-00 (sao lưu, bản sau).

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Tạo từ US1 (vào app, chọn vai), US37, US21 (trừ cài đặt thông báo), US22 (QD21) | Cả file |
| r2 | 2026-11-19 | Claude | QD22-chot-dang-nhap | Theo QD22: đăng nhập bằng mã email, đăng ký xin tên và số ngay. YC1.1, YC1.2, YC1.3, YC1.4, YC1.8 lên bản 2. Thêm và tự chốt YC1-H12, YC1-H13 | Mục tiêu, Luồng chính, Phạm vi, Quy tắc của nhóm, Dữ liệu, YC1.1, YC1.2, YC1.3, YC1.4, YC1.8, Màn hình |
| r3 | 2026-11-19 | Claude | TKE-canvas-pwa-sua-yc | Khớp canvas bản PWA: YC1.2 hai luồng tạo tài khoản (A2) và đăng nhập (A11), YC1.4 sửa được số và họ tên, YC1.8 nút xóa ở P2 và P14. YC1.1, YC1.2, YC1.3, YC1.4, YC1.8 lên bản 3. Trả lời YC1-H1, YC1-H6 | Luồng chính, Quy tắc của nhóm, Dữ liệu, YC1.1, YC1.2, YC1.3, YC1.4, YC1.8, Màn hình |
| r4 | 2026-11-19 | Claude | US2-dang-ky-dang-nhap | Bỏ YC1.2-NT9 vì trùng YC6.3-NT1 (QD25) | YC1.2 |
| r5 | 2026-11-19 | Claude | US2-dang-ky-dang-nhap | Kiểm email đã có tài khoản bằng Supabase Auth, bỏ hàm cho người chưa đăng nhập (KT-DB.3.1) | Dữ liệu |
| r6 | 2026-11-20 | Claude (QD25) | US5-gio-nhan-tra | Trả lời YC1-H10, YC1-H11 (Claude tự chốt, chờ Tùng duyệt lại): nhóm hướng dẫn riêng cho sale; đổi giờ mặc định không đổi đặt phòng đã ghi | YC1.5, YC1.7 |
