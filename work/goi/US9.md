---
item: US9
task: [US9-TA1]
model: sonnet               # theo CL14.6a, mức cao nhất mà các task cần
soan_luc: 936972f
soan_bang: scripts/goi.py
---
# Gói việc US9

Soạn bằng scripts/goi.py (CL10.6, skill soan-viec-cho-subagent). Agent phụ chỉ đọc gói này và code, không đọc CLAUDE.md. Gặp chỗ gói không nói thì dừng, ghi câu hỏi vào work/cau-hoi.md, không tự đoán. Xóa khi item sang xong.

## Việc
"Lịch tháng và lọc theo căn" (work/backlog/US9-lich-thang-va-loc-theo.md).

- [ ] US9-TA1 Code · Claude Code (sonnet, CL14.6a): màn CN1, CN1-00, CN1-02 theo canvas, test unit, e2e cho YC2.1-NT1 đến NT6

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
### YC2.1 · docs/product/requirements/YC2-lich-chu-nha.md
##### YC2.1 · Lịch tháng và lọc theo căn

Bản 1 · rủi ro: tb · Màn: CN1, CN1-00, CN1-02

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Mở tab Lịch (chủ nhà có ít nhất một căn) | CN1: tiêu đề "Lịch", nút "Đặt phòng", thanh tháng ("T09", "Tháng 10/2026", "T11"), hàng chip lọc, lưới tháng bắt đầu từ thứ Hai, chú thích màu ("1509 đã đặt", "3402 đã đặt"). Tháng mở sẵn là tháng của hôm nay | Đọc căn của mình (loại có lịch, chưa ẩn) và đặt phòng chưa hủy của các căn đó có đêm trong tháng, |
| 2 | Xem lưới | Mỗi đêm có khách tô màu của căn đó (quy tắc "Màu theo căn"). Ngày trả phòng không tô nếu không có khách khác nhận đêm đó (QT2). Một ngày có khách ở hai căn thì ô có hai màu | Không |
| 3 | Chạm một chip căn | Lưới chỉ còn tô đêm có khách của căn đó. Chip đầu: "Cả 2 phòng" khi có 2 căn, "Tất cả" khi có từ 3 căn. Chủ nhà có 1 căn thì không có hàng chip | Không gọi thêm |
| 4 | Bấm "T09" hoặc "T11" | Chuyển sang tháng trước, tháng sau; tiêu đề thành "Tháng 11/2026", chip đang chọn giữ nguyên | Đọc đặt phòng của tháng mới |
| 5 | Bấm "Đặt phòng" | Mở form ghi đặt phòng (YC5) | Không |
| 6 | Chạm một ngày | Mở chi tiết ngày ngay dưới lưới (mục Chi tiết một ngày), ô ngày đó viền đậm | Không |

Chủ nhà có căn nhưng chưa có đặt phòng nào (ở mọi tháng): CN1-00, thay cho chú thích và các khối dưới lưới: "Chưa có đặt phòng nào", "Bấm "Đặt phòng" để thêm khách đầu tiên. Ngày có khách sẽ tô màu theo phòng.", nút "Đặt phòng", gợi ý "💡 Mời sale xem lịch để sale tự biết ngày trống, không phải gọi hỏi. Vào tab Sale.".

Tiêu chí:
- **YC2.1-NT1** Khi chủ nhà có 2 căn và mở tab Lịch, thì thấy chip "Cả 2 phòng" và một chip cho mỗi căn. · unit
- **YC2.1-NT2** Khi chủ nhà có 3 căn và mở tab Lịch, thì thấy chip "Tất cả" và một chip cho mỗi căn. · unit
- **YC2.1-NT3** Khi 1509 có B1 (nhận 10/10, trả 12/10), thì ô 10/10 và 11/10 tô màu của 1509, ô 12/10 không tô màu của 1509 (QT2). · unit
- **YC2.1-NT4** Khi chủ nhà chạm chip "3402", thì lưới chỉ tô đêm có khách của 3402 (05/10, 06/10, 14/10, 17/10, 18/10, 21/10), không tô đêm của 1509. · unit
- **YC2.1-NT5** Khi chủ nhà bấm "T11", thì tiêu đề thành "Tháng 11/2026" và ô 30/11 tô màu của 3402 (B9). · unit
- **YC2.1-NT6** Khi chủ nhà có căn nhưng chưa có đặt phòng nào, thì thấy CN1-00 với nút "Đặt phòng", không có khối doanh thu và danh sách sắp tới. · unit

### YC2-lich-chu-nha.md#Quy tắc của nhóm · docs/product/requirements/YC2-lich-chu-nha.md
##### Quy tắc của nhóm

| Tên | Quy tắc | Ví dụ |
|---|---|---|
| Màu theo căn | Mỗi căn một màu trên lịch, dùng cho ô ngày, chú thích, thanh ở lịch tuần. Từ 4 căn trở lên, tên căn ở danh sách căn (CN5) không tô màu | Không |
| Tuần bắt đầu thứ hai | Lưới tháng và bảng tuần bắt đầu từ T2, kết thúc ở CN | Không |

Quy tắc dùng chung: QT2 (đêm có khách) ở `docs/product/rules/`; Viết số tiền rút gọn ở `docs/product/glossary.md`; QT6.1 Trạng thái tiền đặt phòng; QD10 (doanh thu chia theo đêm), QD12 (đặt phòng đã hủy không tính).

### YC2-lich-chu-nha.md#Ai được làm gì · docs/product/requirements/YC2-lich-chu-nha.md
##### Ai được làm gì

Theo `docs/security/PQ-ma-tran-quyen.md`: PQ4 (lịch), PQ7 (đặt phòng), PQ8 (tiền), PQ9 (khách), PQ16 (doanh thu). Test vi phạm phải có, ở lớp database: chủ nhà khác và sale không đọc được đặt phòng, tiền, khách của chủ nhà (YC2.2-NT3); doanh thu chỉ tính căn của người hỏi (YC2.3-NT1).

### YC2-lich-chu-nha.md#Dữ liệu · docs/product/requirements/YC2-lich-chu-nha.md
##### Dữ liệu

Mô hình chung: `docs/architecture/thiet-ke-db.md`. YC này cần database bảo đảm:
- Chủ nhà đọc được căn của mình, đặt phòng và tiền từng đêm của căn mình, khách chính mình nhập, tên và số điện thoại của sale đang kết nối.
- Một lệnh trả giá chủ nhà từng đêm của các căn của người gọi trong một khoảng ngày (lịch tuần cần 7 đêm × mọi căn). Chỉ người giữ căn gọi được. Dùng chung với YC5 (điền sẵn tiền phòng).
- Một lệnh trả doanh thu tháng, số đêm có khách và doanh thu tháng trước của người gọi: cộng tiền từng đêm thuộc tháng, bỏ đặt phòng đã hủy, tính cả căn đã xóa.

### YC2-lich-chu-nha.md#Trạng thái màn (mọi mục) · docs/product/requirements/YC2-lich-chu-nha.md
##### Trạng thái màn (mọi mục)

- Đang tải: theo HV1 (khung xám tại chỗ của lưới, khối doanh thu, danh sách).
- Mất mạng: theo HV2; giữ dữ liệu đã hiện, đổi tháng khi mất mạng thì báo theo HV2.
- Quay lại từ nền: theo HV3, đọc lại tháng đang xem (đặt phòng có thể đã đổi trên máy khác).
- Phiên hết hạn: theo HV7.

Lỗi có thể gặp: mất mạng khi đổi tháng, đổi tuần thì theo HV2 và giữ tháng đang hiện; căn vừa bị xóa ở máy khác thì lần đọc sau không còn căn đó.

----- Kèm theo: các mục đoạn trên trỏ tới (một bậc) -----

## Ví dụ số
### QT2 · docs/product/rules/QT2-dem-co-khach.md
#### QT2 · Đêm có khách

Một luật chung cho lịch của chủ nhà (CN1), thống kê (CN8) và lịch phòng của sale (S1, ô "Kín"), để ba màn luôn ra cùng một con số.

##### QT2.1 · Booking chiếm những đêm nào
Rủi ro: cao
Booking chiếm các đêm từ ngày nhận tới trước ngày trả. Ngày trả không phải đêm có khách. Booking đã hủy (xóa) không chiếm đêm: chỉ booking chưa hủy chiếm đêm (Claude tự chốt, QD25, trả lời QT2-H1).

| Mã | Nhận → trả | Phải ra |
|---|---|---|
| QT2.1-VD1 | B1: 10/10 → 12/10 | 2 đêm: 10/10, 11/10 |
| QT2.1-VD2 | B6: 14/10 → 15/10 | 1 đêm: 14/10 |

##### QT2.2 · Đêm thuộc tháng nào
Rủi ro: tb
Mỗi đêm thuộc tháng của chính đêm đó. Booking qua hai tháng thì chia đêm cho hai tháng.

| Mã | Nhận → trả | Phải ra |
|---|---|---|
| QT2.2-VD1 | B9: 30/11 → 02/12 | Tháng 11: 1 đêm (30/11). Tháng 12: 1 đêm (01/12) |
| QT2.2-VD2 | Mọi booking tháng 10 của Chị Hoa (DLM.4) | 13 đêm có khách (DLM.5) |

Các ví dụ dùng số trong `docs/product/du-lieu-mau.md`.

### QT6.1 · docs/product/rules/QT6-quy-tac-dung-chung.md
##### QT6.1 · Trạng thái tiền đặt phòng
bản 1 · dùng ở: YC2, YC5, YC11, YC12
Mỗi đặt phòng có một trong ba trạng thái: "Chưa cọc", "Đã cọc · còn thu" (nhãn kèm số tiền cọc, ví dụ "Cọc 1.000.000đ"), "Đã thanh toán". Tiền còn lại = tiền phòng − tiền cọc, tính lúc hiện, không lưu. Đặt phòng sale tự ghi cho căn tự nhập không có trạng thái tiền

## Quyết định liên quan
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

### QD21 · docs/decisions/QD21-tach-dac-ta-yc-va-viec.md
id: QD21
tieu_de: Tách đặc tả (YC) và việc (US); xóa code, dựng lại từ tài liệu
trang_thai: da-chot
rev: 1

##### Quyết định
B, xóa code. Người chốt: Tùng, 18/11/2026: "tôi đồng ý với bạn, nhớ là US giữ ít thông tin nhất có thể và tham chiếu đến YC, tham chiếu đến version nào. Trong YC thì có lịch sử version nào sửa mục nào. … Những điểm bạn không khuyên sửa thì tôi đề xuất giữ lại bản cũ, bao gồm cả rule, CL, hook... Sau đó bạn hãy tạo ra toàn bộ dữ liệu nhưng chỉ không có code. … Nhớ là không có phần nào lặp lại mô tả nhé." và "chọn cách xóa hết đi làm lại nhé, repo tổ chức lại YC, mô tả cho đẹp, nhớ đầy đủ như cách viết US3 mới và những thứ khác của YC cũ để đảm bảo YC toàn vẹn, không lặp lại và đủ cho nhóm tính năng."
  - YC là đặc tả, mỗi nhóm tính năng một file, sống suốt dự án. Mục có mã `YC<n>.<m>`, tiêu chí `YC<n>.<m>-NT<k>`. YC có số bản và lịch sử: bản nào sửa mục nào.
  - US là việc: chỉ ghi làm mục YC nào ở bản nào, tiêu chí nào, việc phải xong trước, người, trạng thái, task, nhật ký. Không chép đặc tả. Ba loại việc: US (tính năng hay đổi yêu cầu), BG (lỗi), EN (nền).
  - Không thông tin nào viết hai nơi: câu hỏi mở chỉ ghi mã trong YC; luật dùng ở từ hai nhóm trở lên nằm ở `docs/luat-chung/`, luật chỉ một nhóm dùng nằm trong YC của nhóm đó.
  - Quy trình lấy lại của bản Zalo (CL, rule, hook, skill, script kiểm), sửa cho bản PWA, trừ những điểm đã đổi ở đây.
  - Xóa toàn bộ code (app, migration, test tự động, dữ liệu mẫu dạng SQL, cấu hình build). Code viết lại từ đầu theo tài liệu, mỗi chỗ code có chú thích trỏ về mã YC, QT, PQ. Code cũ còn trong lịch sử git (nhánh `QD20-gop-story`).

- Tùng chọn ngày 18/11/2026 (hỏi chọn trong phiên): "Xếp lại theo cách cũ". Tài liệu xếp như bản Zalo để script, skill, hook chép gần nguyên văn: mỗi QD một file ở `docs/decisions/`, YC ở `docs/product/requirements/`, QT ở `docs/product/rules/`, HV ở `docs/product/system-behaviors.md`, PQ ở `docs/security/`, câu hỏi ở `work/cau-hoi.md`. Mã QD bỏ gạch nối và số 0 đứng đầu (ví dụ mã cũ "QD" gạch "007" nay là QD7, CL3).

### QD10 · docs/decisions/QD10-tien-phong-dien-san-theo-bang.md
id: QD10
tieu_de: Tiền phòng điền sẵn theo bảng giá, chia theo đêm, đêm thuộc tháng của chính nó
trang_thai: da-chot
rev: 1

##### Quyết định
tiền phòng điền sẵn bằng tổng giá chủ nhà các đêm; chủ sửa được; bắt buộc có. Giữ đúng tổng bảng giá thì mỗi đêm giữ giá của nó; khác thì chia đều, lẻ dồn đêm cuối. Doanh thu, đêm có khách, tiền chênh chia theo tháng của từng đêm. Đêm cuối tuần mặc định là đêm T6, T7, chủ đổi được. Người chốt: Tùng (02/11 và 03/11/2026). Chi tiết: story QT2, QT4.

### QD12 · docs/decisions/QD12-huy-dat-phong-da-chap-nhan.md
id: QD12
tieu_de: Hủy đặt phòng đã chấp nhận cần bên kia đồng ý
trang_thai: da-chot
rev: 1

##### Quyết định
chủ nhà hoặc sale của booking xin hủy. Bên kia đồng ý thì "Đã hủy", vẫn hiện cho cả hai, các đêm trống lại và bán được. Bên kia từ chối thì giữ nguyên, ghi "Bị từ chối hủy", không xin lại được. Booking khách lẻ chủ tự ghi thì chủ xóa thẳng. Booking có sale thì chủ không xóa được. Người chốt: Tùng (03/11/2026). Chi tiết: story YC4.4, YC4.9.

(Không kèm HV1, HV2, HV3, HV7 vì đoạn trích không có màn. Cần thì gọi riêng.)

## Hành vi chung
Không kèm (item không có màn, hoặc YC không nhắc HV).

## Database và quyền
### PQ4 · docs/security/PQ-ma-tran-quyen.md
##### PQ4 · Lịch trống, đã đặt
- PQ4.CHU: xem lịch mọi căn của mình (YC2). Lịch đổi qua đặt phòng (PQ7).
- PQ4.SALE: xem trống hay đã đặt của căn được chia sẻ, gồm cả đêm có đặt phòng của sale khác hay chủ nhà tự ghi. Đêm đó hiện "đã đặt", không có tên người đặt. Đây không phải quyền bật tắt (QD7). Bị ngừng: không xem (QD7, YC6.2).
- PQ4.LINK: không (QD8).
- PQ4.CTV: không áp dụng ở bản đầu (YC14).
- PQ4.KHACH: không.
- PQ4.ADMIN: xem (QD7).

### PQ7 · docs/security/PQ-ma-tran-quyen.md
##### PQ7 · Đặt phòng
Căn, ngày nhận, ngày trả, người đặt.
- PQ7.CHU: xem mọi đặt phòng của căn mình; tạo (chặn trùng theo QT1), sửa (YC5.6). Xóa đặt phòng mình tự ghi. Không xóa đặt phòng thành từ yêu cầu của sale đã chấp nhận, server chặn (YC5.7, YC12.4). Xin hủy và chấp thuận hay từ chối hủy đặt phòng đã chấp nhận (QD12). Từ chối thì đặt phòng giữ nguyên, trạng thái "Bị từ chối hủy". Hủy xong thì các đêm tương lai trống lại (QD12). Đặt phòng chủ nhà tự ghi chọn người đặt là một sale thì tính là đặt phòng của sale đó (YC5.4).
- PQ7.SALE: xem chi tiết đặt phòng của mình, gồm đặt phòng chủ nhà ghi chọn sale này. Đặt phòng của người khác chỉ thấy là "đã đặt" (PQ4.SALE). Không tạo thẳng vào lịch chủ nhà, chỉ gửi yêu cầu (PQ10). Không sửa, không xóa. Xin hủy và chấp thuận hay từ chối hủy đặt phòng của mình (QD12). Bị ngừng: vẫn xem lại đặt phòng cũ của mình với chủ nhà đó (QD7); xin hủy được không: [MỞ: PQ7-H1] QD12.
- PQ7.LINK: không.
- PQ7.CTV: không áp dụng ở bản đầu (YC14).
- PQ7.KHACH: không.
- PQ7.ADMIN: xem (QD7).

### PQ8 · docs/security/PQ-ma-tran-quyen.md
##### PQ8 · Tiền của đặt phòng
Tiền phòng, tiền cọc, trạng thái thu.
- PQ8.CHU: xem, sửa của đặt phòng căn mình (YC2, YC5, YC9).
- PQ8.SALE: tiền phòng của đặt phòng của mình: thấy (QD7). Tình trạng cọc của đặt phòng của mình: chỉ thấy đã cọc hay chưa, khi quyền "Tình trạng cọc" bật; không bao giờ thấy số tiền cọc (QD7). Nhãn "Đã thanh toán", "còn thu": [MỞ: PQ8-H1] QD7 chỉ nói đã cọc hay chưa. Đặt phòng của người khác: không.
- PQ8.LINK: không.
- PQ8.CTV: không áp dụng ở bản đầu (YC14).
- PQ8.KHACH: không.
- PQ8.ADMIN: xem (QD7).

### PQ9 · docs/security/PQ-ma-tran-quyen.md
##### PQ9 · Tên, số điện thoại khách trong đặt phòng
- PQ9.CHU: xem, sửa khách do mình nhập, kể cả khách lẻ. Không thấy khách của sale (QD11).
- PQ9.SALE: xem, sửa khách do mình nhập. Không bao giờ thấy khách của chủ nhà (QD11, CLAUDE.md).
- PQ9.LINK: không.
- PQ9.CTV: không áp dụng ở bản đầu (YC14).
- PQ9.KHACH: không dùng app.
- PQ9.ADMIN: xem (QD7).

### PQ16 · docs/security/PQ-ma-tran-quyen.md
##### PQ16 · Doanh thu, công suất, chưa thu của chủ nhà
- PQ16.CHU: của mình (YC2, YC11).
- PQ16.SALE: không bao giờ (YC6 quy tắc Quyền sale được xem).
- PQ16.LINK: không.
- PQ16.CTV: không áp dụng ở bản đầu (YC14).
- PQ16.KHACH: không.
- PQ16.ADMIN: xem (QD7).

## Màn
### CN1 · docs/design/canvas/home247-canvas.html
<!-- màn CN1 · tìm theo id="CN1" · 28,285 ký tự · màn phải làm gì: YC có "Màn: CN1" (grep -l "CN1" docs/product/requirements) -->
CN1 Lịch tháng, 2 căn
9:41
Lịch
Đặt phòng
T09 Tháng 10/2026
T11
Cả 2 phòng
1509
3402
1509 đã đặt 3402 đã đặt
T2
T3
T4
T5
T6
T7
CN
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
Doanh thu tháng 10
11.800.000đ
13 đêm có khách · tháng 9: 9.600.000đ
Gửi lịch cho sale Lịch chung các căn
Đặt phòng sắp tới
Sale Hùng
Phòng 1509 · 10/10 → 12/10 (2 đêm)
2.200.000đ Cọc 1.000.000đ
Khách lẻ
Phòng 1509 · 13/10 → 15/10 (2 đêm)
1.800.000đ Chưa cọc
Khách lẻ
Phòng 3402 · 14/10 → 15/10 (1 đêm)
800.000đ Đã thanh toán
Sale Lan
Phòng 3402 · 17/10 → 19/10 (2 đêm)
1.900.000đ Chưa cọc
Lịch
Căn
Sale
Thống kê
Cá nhân

### CN1-00 · docs/design/canvas/home247-canvas.html
<!-- màn CN1-00 · tìm theo id="CN1-00" · 21,200 ký tự · màn phải làm gì: YC có "Màn: CN1-00" (grep -l "CN1-00" docs/product/requirements) -->
CN1-00 Lịch · chưa có booking
9:41
Lịch
Đặt phòng
T09 Tháng 10/2026
T11
Cả 2 phòng
1509
3402
T2
T3
T4
T5
T6
T7
CN
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
Chưa có đặt phòng nào Bấm "Đặt phòng" để thêm khách đầu tiên. Ngày có khách sẽ tô màu theo phòng.
Đặt phòng
💡 Mời sale xem lịch để sale tự biết ngày trống, không phải gọi hỏi. Vào tab Sale.
Lịch
Căn
Sale
Thống kê
Cá nhân

### CN1-02 · docs/design/canvas/home247-canvas.html
<!-- màn CN1-02 · tìm theo id="CN1-02" · 31,825 ký tự · màn phải làm gì: YC có "Màn: CN1-02" (grep -l "CN1-02" docs/product/requirements) -->
CN1-02 Lịch tháng, 3 căn
9:41
Lịch
Đặt phòng
T09 Tháng 10/2026
T11
Tất cả
1509
3402
2501
1509 đã đặt 3402 đã đặt 2501 đã đặt
T2
T3
T4
T5
T6
T7
CN
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
Doanh thu tháng 10
15.900.000đ
20 đêm có khách · 3 căn
Gửi lịch cho sale Lịch chung các căn
Đặt phòng sắp tới
Kim Chi
Phòng 2501 · 08/10 → 10/10 (2 đêm)
2.000.000đ Đã thanh toán
Sale Hùng
Phòng 1509 · 10/10 → 12/10 (2 đêm)
2.200.000đ Cọc 1.000.000đ
Khách lẻ
Phòng 1509 · 13/10 → 15/10 (2 đêm)
1.800.000đ Chưa cọc
Khách lẻ
Phòng 3402 · 14/10 → 15/10 (1 đêm)
800.000đ Đã thanh toán
Phương Anh
Phòng 2501 · 16/10 → 19/10 (3 đêm)
3.300.000đ Cọc 1.000.000đ
Lịch
Căn
Sale
Thống kê
Cá nhân

Chữ và nhãn chính xác: `python3 scripts/trich-man.py <mã màn> --chu`.

## Tài liệu khác
Không có.

## Mã được nhắc nhưng không chép
Đọc thêm bằng `python3 scripts/trich.py <mã>` nếu task cần: HV1, HV2, HV3, HV7, PQ1, PQ10, PQ11, PQ12, PQ13, PQ14, PQ15, PQ17, PQ18, PQ19, PQ2, PQ20, PQ21, PQ22, PQ23, PQ3, PQ5, PQ6, QD11, QD20, QD7, QD8, QT1, QT4, QT6.2, QT6.3, QT6.4, QT6.5.

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
src/man/CN6GiaCan.tsx (lưới tháng bắt đầu thứ Hai, nút tháng trước/sau, đọc lại khi đổi tháng, HV1/HV2) và src/man/CN5DanhSachCan.tsx với useDanhSachCan trong src/man/ManChu.tsx (đọc danh sách căn, khung xám, Thử lại). Dịch vụ đọc dữ liệu theo mẫu src/lib/dichVuGia.ts (interface + taoDichVu...Supabase, nối ở src/lib/supabase.ts).

## Câu còn mở
- `[MỞ: PQ7-H1]`: sale xin hủy, không thuộc US9 (chỉ đọc lịch). Không làm.
- `[MỞ: PQ8-H1]`: sale thấy nhãn tiền, không thuộc US9. Không làm.

## Được sửa
- Mới: src/man/CN1LichThang.tsx, src/man/CN1LichThang.test.tsx, src/man/CN1LichThang.css, src/lib/lich.ts, src/lib/lich.test.ts, src/lib/dichVuLich.ts.
- Sửa: src/man/ManChu.tsx (tab Lịch khi đã có căn hiện CN1 thay khung tạm; nút "Đặt phòng" tới YC5 chưa có thì toast "Sẽ có ở bản sau"; chạm ngày chỉ viền ô, chi tiết ngày là US10), src/lib/supabase.ts, src/lib/dichVuCan.ts (nếu cần thêm dịch vụ lịch), src/lib/dieuHuong.ts và test của nó, src/styles.css.
- Database (chỉ khi đọc thẳng bảng booking qua RLS không đủ): supabase/migrations/20261119190000_us9_lich_thang.sql, supabase/bang-va-cot.md (chạy scripts/bang-cot.sh), scripts/thu-lam-hong.txt.
- Test: tests/db/39_us9_lich_thang.sql (test vi phạm PQ4, PQ7: chủ nhà khác và sale không đọc được booking của Chị Hoa; booking đã hủy không chiếm đêm, QT2-H1 đã trả lời), tests/e2e/supabase/lich-thang.spec.ts.
- work/backlog/US9-lich-thang-va-loc-theo.md (Kế hoạch, Nhật ký, Bằng chứng).

## Test ở lớp nào
Theo lớp ghi sau dấu · ở cuối mỗi NT (database, unit, e2e; CL14.5). YC2.1-NT1 đến NT6 ở unit (CN1LichThang.test.tsx, lich.test.ts, tên test mang mã NT). HV1-NT2, HV2-NT3 ở unit trên màn CN1. Quyền đọc booking ở database (tests/db/39). Luồng chính (mở tab Lịch có booking mẫu, lọc chip, đổi tháng) ở e2e Supabase. Không sửa file test có sẵn.

## Lệnh kiểm
Theo docs/dev/chay-va-test.md: test của gói bị đổi, `python3 scripts/kiem.py --diff origin/main`. Ghi vào mục Bằng chứng của item: lệnh đã chạy, lần đầu đỏ mấy test, sửa mấy vòng, kết quả cuối.

## Xong khi
- Test mang mã NT xanh ở đúng lớp.
- `npm run typecheck` và `npm run build` qua.
- `python3 scripts/kiem.py --diff origin/main` không có lỗi mới.
- Không sửa file ngoài "Được sửa".
- Báo lại tối đa 10 dòng: PR, lệnh đã chạy, kết quả, việc còn lại.
