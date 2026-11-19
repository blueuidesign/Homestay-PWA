---
item: US1
task: [US1-TA1, US1-TA2]
model: opus               # theo CL14.6a, mức cao nhất mà các task cần
soan_luc: c8cf70b
soan_bang: scripts/goi.py
---
# Gói việc US1

Soạn bằng scripts/goi.py (CL10.6, skill soan-viec-cho-subagent). Agent phụ chỉ đọc gói này và code, không đọc CLAUDE.md. Gặp chỗ gói không nói thì dừng, ghi câu hỏi vào work/cau-hoi.md, không tự đoán. Xóa khi item sang xong.

## Việc
"Màn đầu và chọn vai" (work/backlog/US1-man-dau-va-chon-vai.md).

- [ ] US1-TA1 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy và test database cho YC1.1-NT5, YC1.1-NT7
- [ ] US1-TA2 Code · Claude Code (sonnet, CL14.6a): màn A1, A3, A3-00 theo canvas, test unit, e2e cho YC1.1-NT1 đến NT6

## Bất biến của Home247
- Hai lớp giá: giá chủ nhà và giá sale bán. Khách không bao giờ thấy giá chủ nhà. Chủ nhà không thấy mức cộng, giá bán, tiền chênh của sale.
- Căn đã chia sẻ cho sale nào thì sale đó luôn thấy giá chủ nhà. Không có công tắc tắt giá (QD7).
- Giá tính theo đêm. Booking chiếm các đêm từ ngày nhận tới trước ngày trả.
- Tiền là số nguyên đồng. Ngày theo giờ Việt Nam.
- Được lưu tên, số điện thoại khách trong booking; người nhập tự xin phép khách. Mỗi người chỉ thấy khách do mình nhập (QD11).
- Căn sale tự nhập không có lịch trống. Ô ngày hiện "?", không bao giờ hiện "trống".
- Chặn trùng booking ở database, không chỉ ở giao diện (QD6). Đọc qua RLS, ghi qua hàm `fn_*` tự kiểm quyền. Sale không đọc bảng booking.
- Booking có sale đứng tên: một bên xin hủy, bên kia đồng ý (QD12). Xóa tài khoản chỉ xóa số điện thoại, dữ liệu giữ nguyên (QD13).
- Chữ trên màn gọi "đặt phòng". Tài liệu và code gọi "booking".
- Người dùng nhiều người lớn tuổi, dùng một tay: vùng bấm 44 px. Chữ 14 px ở màn đọc, 12–13 px ở màn dày thông tin, không dưới 12 px.

- Không bắt đăng nhập, không xin quyền khi vừa mở app. Màn đầu xem được khi chưa đăng nhập. Đăng nhập bằng mã gửi về email, không có mật khẩu ở môi trường nào; đăng ký phải có tên và số điện thoại mới vào app (QD22).
- Chia sẻ dùng bảng chia sẻ của điện thoại, máy không có thì sao chép. Link là https trên tên miền của Home247.
- Thông báo chỉ trong app ở bản 1. Không có thông báo đẩy.
- Lưu trên máy (IndexedDB, localStorage) bọc try/catch, chỉ lưu thứ mất cũng được.
- Không có App Secret hay khóa service_role trong app. Khóa anon của Supabase là công khai.
- App nhẹ, người dùng mạng yếu. Nơi đặt dữ liệu chờ QD23.

## NT phải đạt
### YC1.1 · docs/product/requirements/YC1-tai-khoan.md
##### YC1.1 · Màn đầu và chọn vai


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

### YC1-tai-khoan.md#Quy tắc của nhóm · docs/product/requirements/YC1-tai-khoan.md
##### Quy tắc của nhóm


| Tên | Quy tắc | Ví dụ |
|---|---|---|
| Không hỏi khi vừa mở | A1 không hỏi gì, không xin quyền gì (HV4). Tên và số chỉ hỏi ở A2, sau khi người dùng tự bấm "Tạo tài khoản" (QD22) | A1 chỉ có hai nút "Tạo tài khoản", "Tôi đã có tài khoản · Đăng nhập" |
| Chưa đăng ký xong thì chưa vào app | Hồ sơ chưa có tên hoặc số thì mọi màn của app đều về màn nhập số (YC1.2), trừ màn xem trước của link mời, link xin lịch (QD8) (QD22) | Người đã xóa tài khoản đăng nhập lại phải nhập lại số |
| Vai chỉ chọn màn mở đầu | Vai quyết định tab và màn đầu; quyền với căn tính theo quan hệ người với căn (QD5). Bản đầu không có màn đổi vai | Sale có căn của tôi vẫn ghi lịch căn đó |
| Menu theo vai | Chủ nhà thấy nhóm TÀI KHOẢN, CÀI ĐẶT, DỮ LIỆU, HỖ TRỢ; sale thấy TÀI KHOẢN, BÁN PHÒNG, CÀI ĐẶT, HỖ TRỢ | |
| Số điện thoại do người dùng nhập | Nhập lúc tạo tài khoản (YC1.2), sửa được ở P2 (YC1.4). Database kiểm định dạng (pwa.md P2) và không cho trùng số của tài khoản khác chưa xóa (YC1-H13) rồi mới ghi | Sửa số ở P2 thì sale đã kết nối thấy số mới |
| Giờ nhận trả mặc định | Một giờ nhận và một giờ trả cho mọi căn của chủ nhà, mặc định 14:00 và 12:00. Đổi giờ không đổi đặt phòng đã có ([MỞ: YC1-H11] với sale đã gửi khách) | "Khách nhận phòng từ 14:00, trả phòng trước 12:00 hôm sau." |
| File của chủ nhà | File xuất chỉ có đặt phòng ở căn của chủ nhà, tiền là số nguyên đồng không dấu chấm, khách chỉ do chính chủ nhà nhập (QD11), không có giá bán, tiền chênh; UTF-8 có BOM để Excel đọc đúng tiếng Việt | 2200000 |

Quy tắc dùng chung: QT6.5 Người đã xóa tài khoản; HV4, HV5; pwa.md P1, P2, P5, P8.

### YC1-tai-khoan.md#Ai được làm gì · docs/product/requirements/YC1-tai-khoan.md
##### Ai được làm gì

Theo `docs/security/PQ-ma-tran-quyen.md`: PQ1, PQ2, PQ6, PQ9.CHU, PQ11.CHU, PQ20, PQ23. Test vi phạm phải có, ở lớp database:
- Không ai sửa được hồ sơ, giờ nhận trả của người khác; gửi số điện thoại, vai, mã người khác lên thì từ chối và dữ liệu không đổi (YC1.4-NT4).
- Sale không xuất được file, kể cả với căn được chia sẻ; Anh Tuấn không xuất được căn của Chị Hoa (YC1.6-NT5).
- File không có khách do sale nhập, không có giá bán (YC1.6-NT4).
- Sau khi xóa tài khoản: không ai đọc được số điện thoại của người đó (YC1.8-NT1).

### YC1-tai-khoan.md#Dữ liệu · docs/product/requirements/YC1-tai-khoan.md
##### Dữ liệu


Mô hình chung: `docs/architecture/thiet-ke-db.md`. YC này cần database bảo đảm:
- Mỗi người đăng nhập có một hồ sơ, tạo ở lần đầu: tên, tên hiển thị, ảnh, số điện thoại (ghi bằng lệnh đăng ký YC1.2 hay lệnh sửa hồ sơ YC1.4, luôn qua kiểm), vai đã chọn, lúc đồng ý điều khoản, giờ nhận trả mặc định, lúc xóa tài khoản.
- Lệnh xóa tài khoản: trong một giao dịch bỏ số điện thoại, ghi lúc xóa, ghi thông báo "chủ nhà đã xóa tài khoản" cho mỗi sale đang kết nối (YC12). Không xóa căn, ảnh căn, lịch, giá, tiền, đặt phòng, yêu cầu.
- Lệnh đăng ký: ghi tên và số vào hồ sơ của chính người gọi sau khi kiểm (YC1.2). Hồ sơ đã có số thì từ chối, không ghi đè.
- Kiểm email đã có tài khoản (A2-01, A11-01): không thêm hàm cho người chưa đăng nhập, vì bất biến KT-DB.3.1 chỉ cho họ gọi hàm xem link mời. App xin mã đăng nhập với lựa chọn "không tạo tài khoản mới" của Supabase Auth: email chưa có tài khoản thì Supabase từ chối (A11-01, ở A2 thì gửi mã đăng ký); đã có thì mã đăng nhập được gửi luôn (A2-01 nút "Đăng nhập bằng email này" sang A11-02 với mã đó) (Claude tự quyết, QD25).
- Người đã xóa tài khoản đăng nhập lại và nhập lại số ở bước đăng ký (YC1.2) thì bỏ dấu đã xóa; kết nối cũ dùng lại, không phải mời lại.
- Lệnh đếm và lệnh xuất file dùng cùng một bộ lọc, nên ra cùng số dòng.

### YC1-tai-khoan.md#Trạng thái màn (mọi mục) · docs/product/requirements/YC1-tai-khoan.md
##### Trạng thái màn (mọi mục)

- Đang tải: HV1. Mất mạng: HV2. Quay lại từ nền: HV3. Không có quyền: HV5.

----- Kèm theo: các mục đoạn trên trỏ tới (một bậc) -----

### YC1-H11 · work/cau-hoi.md
###### YC1-H11 · mo
Đổi giờ nhận, trả mặc định có đổi booking đã ghi không, và sale đã gửi khách thì thế nào. Ngoài ra căn có giờ riêng không (P5 nói áp dụng cho tất cả căn).
Gắn ở: YC1.

## Ví dụ số
### QT6.5 · docs/product/rules/QT6-quy-tac-dung-chung.md
##### QT6.5 · Người đã xóa tài khoản
bản 1 · dùng ở: YC1, YC5, YC6, YC7, YC9, YC10, YC11, YC12
Xóa tài khoản chỉ bỏ số điện thoại và đánh dấu đã xóa; căn, ảnh, lịch, giá, tiền, đặt phòng, yêu cầu giữ nguyên (QD13). Ở mọi chỗ người khác còn thấy tên người đó: tên cũ kèm ghi chú nhỏ màu đỏ "Đã xoá tài khoản", không số điện thoại, không nút gọi, nhắn. Sale không còn thấy căn, lịch, giá của chủ nhà đã xóa tài khoản và không đặt, không gửi yêu cầu vào căn đó; mở từ màn cũ thì HV5 lý do "Chủ nhà đã xóa tài khoản". Đặt phòng đã có vẫn chiếm đêm, vẫn tính thống kê cả hai bên. Yêu cầu đang chờ giữ nguyên, vẫn hết hạn sau 14 ngày. Chủ nhà không đổi phạm vi, quyền xem cho sale đã xóa tài khoản. Người đó nhập lại số thì dùng lại như trước, kết nối cũ nối lại, không phải mời lại

## Quyết định liên quan
### QD13 · docs/decisions/QD13-xoa-tai-khoan-giu-du-lieu.md
id: QD13
tieu_de: Xóa tài khoản giữ dữ liệu, chỉ xóa số điện thoại
trang_thai: da-chot
rev: 1

##### Quyết định
B. Người chốt: Tùng (04/11/2026). Chi tiết: story US22, mục YC9.8. Cách người dùng bấm xóa trên PWA: YC1-H6.

### QD22 · docs/decisions/QD22-dang-nhap-ban-pwa.md
id: QD22
tieu_de: Người dùng đăng nhập bản PWA bằng gì
trang_thai: da-chot
rev: 2

##### Quyết định


Mã gửi về email, không có mật khẩu (gần phương án c, nhưng là mã chứ không phải link). Đăng ký phải nhập tên và số điện thoại ngay, xong mới vào được app. Người chốt: Tùng, ngày 19/11/2026.

Câu nguyên văn của Tùng, 19/11/2026: "Đăng ký bằng email, có nhập tên và số điện thoại. Đăng nhập thì dùng mã gửi về email."

Câu nguyên văn của Tùng, 19/11/2026: "cách cũ là cách của zalo, còn bây giờ phải xin tên và số điện thoại ngay mới hoàn thành đăng ký và vào app được nhé. đăng nhập sẽ dùng code đến email nhé, chả ai nhớ mật khẩu đâu."

Tùng chọn ngày 19/11/2026 (hỏi chọn trong phiên, câu hỏi "Giữ đăng nhập bằng mật khẩu chỉ cho test tự động trên staging?"): "Bỏ hẳn mật khẩu". Không có đăng nhập bằng mật khẩu ở bất kỳ môi trường nào, kể cả staging. EN3 bỏ.

Hệ quả:
- Đăng ký và đăng nhập theo YC1.2 bản 2. Nguyên tắc "không bắt đăng ký bằng email" của `docs/product/goal.md` và cách "xin số đúng lúc" của bản Zalo không còn dùng ở bản PWA.
- Mọi hồ sơ đã đăng ký xong đều có tên và số, nên popup xin số YC6.1 bỏ; các bước "YC6.1 nếu chưa có số" ở YC6, YC8, YC9, YC10 bỏ theo.
- Số điện thoại do người dùng tự nhập, không xác minh bằng mã. Database kiểm định dạng (pwa.md P2).

### QD8 · docs/decisions/QD8-link-moi-cua-chu-nha.md
id: QD8
tieu_de: Link mời của chủ nhà
trang_thai: da-chot
rev: 1

##### Quyết định
ai có link cũng mở được, kể cả chưa đăng nhập. Màn Thêm lịch hiện tên chủ, các căn (mã, phòng ngủ, giường, view), không có giá. Sale phải tự bấm "Thêm lịch". Đã thêm rồi thì báo. Link hết hạn sau 21 ngày, chủ thu hồi được; sale đã thêm trước đó vẫn giữ kết nối. Chủ thêm căn mới thì sale được chia sẻ "tất cả căn" tự thấy. Người chốt: Tùng (28/10 và 03/11/2026). Chi tiết: story YC1.3.

### QD5 · docs/decisions/QD5-vai-tinh-theo-quan-he-nguoi.md
id: QD5
tieu_de: Vai tính theo quan hệ người với căn, không theo tài khoản
trang_thai: da-chot
rev: 1

##### Quyết định
không có bảng vai. Một người là chủ của căn mình giữ, là sale của căn người khác chia sẻ cho mình. Sale có căn riêng thì có mọi quyền của chủ với căn đó. Chủ nhà không bán căn của chủ khác. `profiles.vai_chon` chỉ để chọn màn mở đầu.

### QD11 · docs/decisions/QD11-moi-nguoi-chi-thay-khach-va.md
id: QD11
tieu_de: Mỗi người chỉ thấy khách và tiền thu khách do mình nhập
trang_thai: da-chot
rev: 1

##### Quyết định
chủ nhà và sale được lưu tên, số điện thoại khách của mình; người nhập tự xin phép khách. Sale không bao giờ thấy khách của chủ; chủ không thấy khách của sale, không thấy sale thu khách bao nhiêu. Người chốt: Tùng (02/11/2026).

### QD25 · docs/decisions/QD25-chay-tu-dong-7-ngay.md
id: QD25
tieu_de: Chạy tự động 7 ngày, Claude tự quyết phần suy được bằng logic
trang_thai: da-chot
rev: 2

##### Quyết định
Chạy tự động từ 19/11/2026 tới 26/11/2026. Người chốt: Tùng, 19/11/2026: "Theo tôi những phần có thể suy luận bằng logic này thì bạn cứ tự làm nhé, tự nghiên cứu, tự quyết. Tôi muốn app lên nhanh nhất có thể, tôi sẽ test và điều chỉnh lại sau. Miễn là bạn update tài liệu đầy đủ là được. Tôi muốn mọi màn hình, mọi chức năng cần xong, TÔi cho bạn toàn quyền quyết định dựa theo khung hiện tại. Tôi cần bạn chạy tự động và không bao giờ có task nào dừng."

Cách làm trong thời gian này:
- Câu hỏi mở về sản phẩm: Claude tự chốt cách hợp lý nhất, ghi vào work/cau-hoi.md với chữ "Claude tự chốt" và ngày, rồi sửa YC. Tùng xem lại sau.
- PR có CI xanh thì Claude tự gộp (phạm vi Tùng giao theo CL4.6: toàn bộ THU-TU.md), rồi làm item kế.
- Được làm lại database staging (xóa schema cũ, chạy migration mới).
- Không đụng production, không tiêu tiền. Việc chỉ Tùng làm được (SMTP, tài khoản trả phí) ghi vào work/cho-tung.md rồi làm việc khác.
- Test tự động không cần tài khoản thật: Supabase chạy trên máy với hộp thư giả.
- Bỏ trần chờ người (CL1.2) trong thời gian này. Tùng, 19/11/2026: "Bỏ giới hạn 6 việc chờ test."
- Test e2e chạy trọn luồng trên trình duyệt thật (Playwright, không giao diện) với Supabase chạy trên máy và hộp thư giả để lấy mã đăng nhập.
- Test sinh ra từ YC. Trước khi làm một US, kiểm YC của nó đủ chưa; thiếu thì bổ sung YC trước. Chỗ phân vân thì tự quyết, ghi vào QD với chữ "(Claude tự quyết)". Tùng, 19/11/2026: "Nhớ là các loại test sính ra từ file YC, YC phải luôn đầy đủ, test cũng đầy đủ, nghĩ về quy trình để mọi thứ luôn đảm bảo nhé, mọi phân vân gì thì tự quyết rồi tự ghi vào file QD và đánh dấu là bạn quyết định. hãy tự làm hết"

(Không kèm HV5, HV4, HV1, HV2, HV3 vì đoạn trích không có màn. Cần thì gọi riêng.)

## Hành vi chung
### HV4 · docs/product/system-behaviors.md
##### HV4 · Xin quyền của trình duyệt

Rủi ro: tb. Không xin quyền gì khi vừa mở app. Bản 1 không cần quyền nào: chọn ảnh dùng ô chọn file (pwa.md P6), số điện thoại nhập ở bước đăng ký (YC1.2), thông báo chỉ trong app. Khi sau này cần quyền (thông báo đẩy, vị trí), làm theo bảng dưới.

| Bước | Người dùng | App |
|---|---|---|
| 1 | Bấm việc cần quyền lần đầu | Thẻ giải thích của app trước ("Bật thông báo để biết khi có yêu cầu đặt phòng"), rồi mới gọi hộp thoại của trình duyệt |
| 2 | Từ chối | Không lỗi. Về màn cũ, việc không cần quyền vẫn làm tiếp |
| 3 | Bấm lại việc cần quyền đã từ chối | Thẻ nói vì sao cần quyền và chỉ cách bật lại trong cài đặt trình duyệt; không gọi lại hộp thoại |

Tiêu chí:
- **HV4-NT5** Khi người dùng mở app lần đầu và đi hết luồng vào app (YC1.1), thì không có hộp thoại quyền nào của trình duyệt. · e2e
- **HV4-NT6** Khi người dùng bấm "Thêm ảnh", thì mở ô chọn file, không có hộp thoại xin quyền. · unit

### HV5 · docs/product/system-behaviors.md
##### HV5 · Không còn quyền xem
Rủi ro: tb. Người dùng mở thứ không còn được xem thì biết vì sao, và không thấy dữ liệu đó dù chỉ thoáng qua. Xảy ra khi chủ nhà đã ngừng cho sale xem, căn hay đặt phòng đã bị xóa, link đã hết hạn, người dùng mở màn không thuộc vai mình, hay chủ nhà đã xóa tài khoản.

| Bước | Người dùng | App |
|---|---|---|
| 1 | Mở màn, link hay thông báo trỏ tới thứ không còn quyền | "Bạn không còn xem được mục này", một dòng lý do nếu database cho biết ("Chủ nhà đã ngừng chia sẻ lịch", "Chủ nhà đã xóa tài khoản"), nút "Về Lịch". Database không trả dữ liệu của mục đó, chỉ trả lý do |
| 2 | Đang xem thì bị thu hồi quyền | Lần tải lại kế tiếp (HV1, HV3) đổi sang màn ở bước 1 |

Tiêu chí:
- **HV5-NT1** Khi Chị Hoa đã ngừng cho Sale Hùng xem và Hùng mở 1509 từ thông báo cũ, thì thấy "Bạn không còn xem được mục này" với lý do, và dữ liệu trả về không có giá, lịch, ảnh. · database, unit
- **HV5-NT2** Khi Chị Hoa đã xóa tài khoản và Hùng mở 1509 từ thông báo cũ, thì lý do là "Chủ nhà đã xóa tài khoản". · database, unit

## Database và quyền
### PQ1 · docs/security/PQ-ma-tran-quyen.md
##### PQ1 · Hồ sơ người dùng
Họ tên, tên hiển thị, ảnh đại diện, cài đặt thông báo.
- PQ1.CHU: xem, sửa hồ sơ của mình. Thấy tên hiển thị của sale đã kết nối và của sale đang xin xem lịch ở A8 (YC6, YC1.4).
- PQ1.SALE: xem, sửa hồ sơ của mình. Thấy tên hiển thị của chủ nhà đã kết nối ở Nguồn phòng (YC1.4). Bị ngừng: vẫn thấy tên chủ nhà trên đặt phòng cũ của mình (QD7).
- PQ1.LINK: thấy tên chủ nhà ở A1-link và A10 (QD8). Chưa có hồ sơ cho tới khi vào app (YC1).
- PQ1.CTV: không áp dụng ở bản đầu (YC14).
- PQ1.KHACH: không.
- PQ1.ADMIN: xem (QD7). Sửa: [MỞ: PQ1-H1].

### PQ2 · docs/security/PQ-ma-tran-quyen.md
##### PQ2 · Số điện thoại người dùng
Ai cũng chỉ ghi được số của chính mình. Bản Zalo: số lấy từ Zalo, không sửa trong app (YC1.4); app chỉ gửi token số điện thoại lên máy chủ, máy chủ đổi token một lần trong 2 phút, app không chứa App Secret (`docs/_lich-su/zalo/rang-buoc.md`). Bản PWA: số lấy theo cách đăng nhập ở QD22.
- PQ2.CHU: xem số của mình. Thấy số sale đã kết nối và sale đang xin ở A8, CN7-04, nếu sale đã cho số (YC6).
- PQ2.SALE: xem số của mình. Thấy số của chủ nhà đã kết nối (QD7). Bị ngừng: [MỞ: PQ2-H1].
- PQ2.LINK: không thấy số chủ nhà (QD8, YC6).
- PQ2.CTV: không áp dụng ở bản đầu (YC14).
- PQ2.KHACH: không bao giờ (YC6).
- PQ2.ADMIN: xem (QD7).

### PQ6 · docs/security/PQ-ma-tran-quyen.md
##### PQ6 · Cài đặt chung của chủ nhà
Ngày tính giá cuối tuần, giờ nhận và trả phòng.
- PQ6.CHU: xem, sửa của mình (YC4.6, YC1.5).
- PQ6.SALE: thấy giờ nhận, trả khi gửi khách (YC1). Ngày tính giá cuối tuần: [MỞ: PQ6-H1].
- PQ6.LINK: không.
- PQ6.CTV: không áp dụng ở bản đầu (YC14).
- PQ6.KHACH: giờ nhận, trả trong tin sale gửi (YC1).
- PQ6.ADMIN: xem (QD7).

### PQ9 · docs/security/PQ-ma-tran-quyen.md
##### PQ9 · Tên, số điện thoại khách trong đặt phòng
- PQ9.CHU: xem, sửa khách do mình nhập, kể cả khách lẻ. Không thấy khách của sale (QD11).
- PQ9.SALE: xem, sửa khách do mình nhập. Không bao giờ thấy khách của chủ nhà (QD11, CLAUDE.md).
- PQ9.LINK: không.
- PQ9.CTV: không áp dụng ở bản đầu (YC14).
- PQ9.KHACH: không dùng app.
- PQ9.ADMIN: xem (QD7).

### PQ11 · docs/security/PQ-ma-tran-quyen.md
##### PQ11 · Giá bán, mức cộng thêm, mẫu tin
- PQ11.CHU: không bao giờ thấy (YC5, YC9, YC7, YC8).
- PQ11.SALE: chỉ của mình; xem, sửa (YC7, YC8). Đêm chưa đặt giá thì không có giá bán.
- PQ11.LINK: không.
- PQ11.CTV: không áp dụng ở bản đầu (YC14).
- PQ11.KHACH: thấy giá bán trong tin sale gửi, không thấy phần cộng thêm (YC7, YC8).
- PQ11.ADMIN: xem (QD7).

### PQ20 · docs/security/PQ-ma-tran-quyen.md
##### PQ20 · Xuất file
Xuất file Excel (CSV) ở P8. Sao lưu và khôi phục On Hold (bản sau, docs/product/requirements/README.md).
- PQ20.CHU: chỉ dữ liệu của mình. Có cột tên, số khách do chủ nhà nhập (QD11). Không có khách của sale.
- PQ20.SALE: không (YC1).
- PQ20.LINK: không.
- PQ20.CTV: không áp dụng ở bản đầu (YC14).
- PQ20.KHACH: không.
- PQ20.ADMIN: [MỞ: PQ20-H1].

### PQ23 · docs/security/PQ-ma-tran-quyen.md
##### PQ23 · Dữ liệu còn lại khi một bên xóa tài khoản

Người dùng xóa tài khoản, server xóa số điện thoại và đánh dấu đã xóa tài khoản. Tên và mọi dữ liệu khác giữ (YC1.8, QD13).
- PQ23.CHU: chủ nhà còn lại thấy đặt phòng đã thành với sale đã xóa tài khoản, tên cũ kèm ghi chú nhỏ đỏ "Đã xoá tài khoản", không có số điện thoại; dòng sale đó ở CN7 không mở được, bỏ được (QD13).
- PQ23.SALE: sale còn lại thấy đặt phòng đã thành với chủ nhà đã xóa tài khoản, tên cũ kèm ghi chú đỏ. Server không gửi căn, lịch, giá của chủ nhà đó, và từ chối đặt phòng, yêu cầu đặt phòng vào căn của chủ nhà đó bằng `KHONG_CON_QUYEN`, app báo ngay "Không gửi được yêu cầu. Chủ nhà đã xóa tài khoản trên Home247." (QD13). Yêu cầu đặt phòng đang chờ giữ nguyên trạng thái chờ. Sale có thông báo khi chủ nhà xóa tài khoản (YC12.4). Bỏ được dòng chủ nhà khỏi danh sách (QD13).
- PQ23.LINK: người đã xóa tài khoản đăng nhập lại cùng tài khoản thì thấy lại dữ liệu cũ của mình (QD13). Khi họ cho lại tên, số điện thoại (luồng xin quyền HV4) thì dùng lại như trước: server bỏ dấu đã xóa tài khoản và ghi chú "Đã xoá tài khoản", sale lại thấy căn, lịch theo kết nối cũ nếu dòng kết nối chưa bị người kia xóa (QD13).
- PQ23.CTV: không áp dụng ở bản đầu (YC14).
- PQ23.KHACH: không.
- PQ23.ADMIN: số điện thoại đã xóa không còn để xem, trừ bản sao lưu tự động: [MỞ: PQ23-H1]. Căn, lịch, giá còn ở máy chủ; quản trị viên xem được hay không: [MỞ: PQ23-H1].

## Màn
### A1 · docs/design/canvas/home247-canvas.html
<!-- màn A1 · tìm theo id="A1" · 6,709 ký tự · màn phải làm gì: YC có "Màn: A1" (grep -l "A1" docs/product/requirements) -->
A1 Chào mừng và đăng nhập
9:41
🏠 Lịch phòng Hạ Long Lịch phòng và giá homestay, chia sẻ cho sale trong một chạm.
Ghi lịch các phòng nhanh hơn sổ tay
Sale tự xem phòng trống, không cần gọi hỏi
Gửi ảnh và giá phòng cho khách trong vài giây
Tạo tài khoản Tôi đã có tài khoản · Đăng nhập Bằng việc tiếp tục, bạn đồng ý với Điều khoản và Chính sách quyền riêng tư .

### A3 · docs/design/canvas/home247-canvas.html
<!-- màn A3 · tìm theo id="A3" · 7,335 ký tự · màn phải làm gì: YC có "Màn: A3" (grep -l "A3" docs/product/requirements) -->
A3 Chọn vai trò
9:41
Bạn dùng app để làm gì?
✓
Tôi là chủ nhà Ghi lịch phòng, đặt giá, mời sale xem lịch.
✓
Tôi là sale Tìm phòng trống, gửi ảnh và giá cho khách.
Tiếp tục

### A3-00 · docs/design/canvas/home247-canvas.html
<!-- màn A3-00 · tìm theo id="A3-00" · 8,184 ký tự · màn phải làm gì: YC có "Màn: A3-00" (grep -l "A3-00" docs/product/requirements) -->
A3-00 Chọn vai trò · chưa chọn
9:41
Bạn dùng app để làm gì?
✓
Tôi là chủ nhà Ghi lịch phòng, đặt giá, mời sale xem lịch.
✓
Tôi là sale Tìm phòng trống, gửi ảnh và giá cho khách.
Tiếp tục Chọn một mục để tiếp tục

Chữ và nhãn chính xác: `python3 scripts/trich-man.py <mã màn> --chu`.

## Tài liệu khác
Không có.

## Mã được nhắc nhưng không chép
Đọc thêm bằng `python3 scripts/trich.py <mã>` nếu task cần: HV1, HV2, HV3, HV6, HV7, HV8, PQ10, PQ12, PQ13, PQ14, PQ15, PQ16, PQ17, PQ18, PQ19, PQ21, PQ22, PQ3, PQ4, PQ5, PQ7, PQ8, QD7, QT6.1, QT6.2, QT6.3, QT6.4.

## Quy ước code
# Quy ước khi viết code

- Chỉ code theo mục YC có trong `thuc_hien` của item. Câu có `[MỞ: ...]` thì không code phần đó. Câu có "(giả định GDn)" thì code được và ghi rõ trong PR.
- Code luôn trên nhánh <mã>-<tên-ngắn> và PR (CL4.7). Hook trước khi đẩy chặn commit code lên main.
- Đọc gói việc (work/goi/<mã item>.md, soạn bằng scripts/goi.py) nếu có, không thì đọc item. Tài liệu đọc bằng scripts/trich.py, không mở cả file. Canvas đọc bằng scripts/trich-man.py.
- Chỉ sửa file trong mục Phạm vi của item hoặc ô "Được sửa" của gói việc. File ngoài phạm vi thì dừng và tạo item mới.
- Mỗi tiêu chí một test mang mã đó trong tên, ví dụ `YC5.3-NT2`. Viết test trước code. Tiêu chí chưa có test thì item chưa xong. Không tắt, xóa, sửa test để cho qua. kiem.py luật `nt-test` báo đỏ khi NT của item đã mở PR thiếu test hay thiếu lớp (EN8).
- Test ở đúng lớp ghi sau dấu · của tiêu chí (CL14.5): quyền, tiền, chặn trùng ở lớp database trên Postgres thật; màn ở unit; luồng chính ở e2e.
- Task được giao sau một task viết test trước thì không sửa file test của task đó.
- Chú thích code trỏ về mã tài liệu: mỗi hàm database, policy, màn, hàm tính tiền có một dòng chú thích ghi mã YC, QT, PQ, HV nó làm (ví dụ `-- YC5.3, QT1.1, PQ7.CHU`). Không chép nội dung đặc tả vào chú thích.
- App gọi thẳng Supabase (QD4). Đọc qua RLS; ghi qua hàm `fn_*` chạy security definer và tự kiểm người gọi. Không bảng nào cho app ghi thẳng. Dữ liệu người không được thấy thì database không trả, không gửi rồi ẩn trên màn.
- Migration chỉ thêm, không sửa migration đã gộp. Đổi hàm, policy, view: thêm test database và một phép thử làm hỏng (bất biến ở docs/architecture/thiet-ke-db.md mục 3).
- Tiền là số nguyên đồng. Ngày theo giờ Việt Nam. Đặt phòng chiếm các đêm từ ngày nhận tới trước ngày trả. Chặn trùng bằng ràng buộc ở database (QD6).
- Tên, số điện thoại khách: mỗi người chỉ thấy cái mình nhập (QD11). Không ghi log chứa số điện thoại, tên khách.
- Không đọc .env. Khóa bí mật, khóa production không bao giờ có trong code, test, log hay phiên cloud. Test chạy trên dữ liệu mẫu DLM, không dữ liệu thật.
- Giao diện: vùng bấm 44 px; chữ màn đọc 14 px, màn dày thông tin 12–13 px, không dưới 12 px; cỡ cụ thể theo canvas. Mọi màn có trạng thái theo HV1 đến HV8. Lưu trên máy chỉ thứ mất cũng được, bọc try/catch (pwa.md P10).
- Đổi cấu trúc module hay thêm thư viện cần Đức duyệt (CL4.2).
- Trước khi báo xong: chạy test của phần bị đổi, `npm run typecheck`, `npm run build`, `python3 scripts/kiem.py --diff origin/main` (lệnh đầy đủ ở docs/dev/chay-va-test.md), dán lệnh và kết quả.

## Làm theo mẫu
- Database: supabase/migrations/20261119100000_us2_dang_ky.sql (fn_dang_ky: kiểm, mã lỗi, revoke/grant), tests/db/30_*.sql (test của US2). Phép thử làm hỏng: scripts/thu-lam-hong.txt.
- Giao diện: src/man/A1Chao.tsx, src/man/LuongDangNhap.tsx, src/man/ManTam.tsx (US2 đã làm bản tối thiểu A1, A3, tab Lịch: US1 làm đầy đủ theo canvas, thay bản tạm), src/lib/xacThuc.ts (đọc vai_chon). e2e: tests/e2e/ của US2 và helper đọc mã từ Mailpit.

## Quyết định đã có cho item này (Claude tự quyết, QD25)
- Thêm `fn_chon_vai(p_vai text)` security definer cho authenticated: chỉ nhận 'chu_nha' hoặc 'sale', sai thì raise 'Vai không hợp lệ' (YC1.1-NT7); ghi vai_chon và dong_y_dieu_khoan_luc = coalesce(cũ, now()) của chính người gọi. Hồ sơ chưa có tên hoặc số thì từ chối (quy tắc "Chưa đăng ký xong thì chưa vào app").
- Tab Lịch của chủ nhà (A4) và sale (A5) chưa làm ở US1: giữ khung tab Lịch tạm, có tiêu đề "Lịch" và vai đang dùng.
- Thêm vào scripts/thu-lam-hong.txt một dòng cho fn_chon_vai (nhận vai lạ) và một dòng cho fn_dang_ky của US2 (bỏ kiểm số trùng), để test database tương ứng phải đỏ.
- HV4-NT5 (e2e): đi hết luồng tạo tài khoản, chọn vai, vào tab Lịch mà không có hộp thoại quyền nào (Playwright bắt sự kiện dialog và kiểm không có yêu cầu quyền).

## Câu còn mở
- [MỞ: PQ1-H1]: không làm phần này.
- [MỞ: PQ2-H1]: không làm phần này.
- [MỞ: PQ20-H1]: không làm phần này.
- [MỞ: PQ23-H1]: không làm phần này.
- [MỞ: PQ6-H1]: không làm phần này.
- [MỞ: YC1-H11]: không làm phần này.

## Được sửa
- supabase/migrations/ (chỉ file mới 20261119110000_us1_*.sql), tests/db/ (file mới 31_us1_*.sql), scripts/thu-lam-hong.txt (thêm dòng), supabase/bang-va-cot.md (sinh lại nếu CI đòi).
- src/** (màn ở src/man/, hàm thuần ở src/lib/), tests/e2e/**.
- docs/dev/chay-va-test.md chỉ khi đổi lệnh chạy (tăng rev, dòng lịch sử, giữ 5 dòng mới nhất, dòng cũ chuyển docs/_lich-su/docs/dev/chay-va-test.md).
- File item US1 (Kế hoạch, Bằng chứng, tick TA1, TA2).

## Test ở lớp nào
Theo lớp ghi sau dấu · ở cuối mỗi NT (database, unit, e2e; CL14.5). Viết test trước code. e2e chạy với Supabase trên máy và Mailpit như US2 (job e2e-supabase).

## Lệnh kiểm
Theo docs/dev/chay-va-test.md: test của gói bị đổi, `python3 scripts/kiem.py --diff origin/main`. Ghi vào mục Bằng chứng của item: lệnh đã chạy, lần đầu đỏ mấy test, sửa mấy vòng, kết quả cuối.

## Xong khi
- Test mang mã NT xanh ở đúng lớp.
- `npm run typecheck` và `npm run build` qua.
- `python3 scripts/kiem.py --diff origin/main` không có lỗi mới.
- Không sửa file ngoài "Được sửa".
- Báo lại tối đa 10 dòng: PR, lệnh đã chạy, kết quả, việc còn lại.
