---
id: YC13
tieu_de: Quản trị Home247
rev: 1
ban: sau
---
# YC13 · Quản trị Home247

## Mục tiêu

Là quản trị viên Home247, tôi muốn đăng nhập trang quản trị, nhập dải ngày lễ từng năm và danh sách tòa nhà ở Hạ Long, và thêm người cùng quản trị, để chủ nhà chọn nhanh đúng ngày lễ, đúng tòa mà không phải nhờ dev chạy script.

Vì sao quan trọng: Tết Âm lịch đổi ngày mỗi năm, lịch nghỉ bù có thể đổi giữa năm; tòa nhà trùng tên làm sale lọc sai. Trang quản trị cũng là cửa vào có quyền rộng nhất, nên chỉ đúng người trong danh sách mới vào được.

Bản 1 không làm YC này: dải ngày lễ và tòa nhà nạp bằng seed (pwa.md P11). Làm sau khi các chức năng app xong và Tùng đã duyệt thiết kế (Tùng, 02/11/2026, bản Zalo).

## Luồng chính

Tùng mở `/quan-tri`, nhập email của mình, nhận mã qua email, nhập mã và vào trang quản trị. Tùng chọn năm 2027, thêm dải "Tết Nguyên đán" từ ngày đầu tới ngày cuối của kỳ nghỉ chính thức. Chị Hoa mở "Giá ngày lễ" (YC4.3) cho năm 2027 và chạm "Tết Nguyên đán": dải mới hiện ra.

## Phạm vi

YC này gồm: đăng nhập trang quản trị, danh sách quản trị viên, dải ngày lễ, tòa nhà.

Không thuộc YC này: tra cứu tài khoản người dùng khi họ nhờ hỗ trợ (chưa có yêu cầu); chọn tỉnh, lọc tòa theo tỉnh (bản sau, `docs/product/requirements/README.md`).

## Quy tắc của nhóm

| Tên | Quy tắc | Ví dụ |
|---|---|---|
| Quản trị viên đầu tiên | Một email đặt trong cấu hình máy chủ, không bị gỡ. Chỉ người này thêm, gỡ được người đồng quản trị | |
| Đăng nhập bằng mã email | Chỉ email trong danh sách quản trị viên nhận được mã. Email khác không nhận mã, không vào được | |
| Dải ngày lễ do Home247 đặt | Mỗi năm có các dải ngày lễ (tên dịp, ngày đầu, ngày cuối) gồm nghỉ bù, nối cuối tuần. Đây là nguồn của "Chọn nhanh ngày lễ" ở YC4.3 | |
| Tòa đặt sẵn và tòa người dùng thêm | Quản trị viên đặt sẵn tòa; người dùng vẫn thêm tòa mới không cần duyệt, và tòa đó hiện cho mọi người (YC3.4). Gõ tên trùng thì app gợi ý tòa đã có; quản trị viên gộp tòa trùng sau (Tùng, bản Zalo, 04/11/2026, điểm 4) | ICON40, À La Carte, Sapphire |

Quy tắc dùng chung: QT6.3 Tòa nhà dùng chung; pwa.md P11.

## Ai được làm gì

Theo `docs/security/PQ-ma-tran-quyen.md`: PQ21. Test vi phạm phải có, ở lớp database:
- Người không trong danh sách quản trị viên đọc, thêm, sửa, xóa dải ngày lễ, tòa nhà, quản trị viên: bị từ chối, dữ liệu không đổi (YC13.1-NT3, YC13.2-NT4, YC13.3-NT4).
- Người đồng quản trị thêm hay gỡ quản trị viên: bị từ chối (YC13.1-NT4).

## Dữ liệu

Mô hình chung: `docs/architecture/thiet-ke-db.md`. YC này cần database bảo đảm: danh sách quản trị viên (email, lúc thêm); dải ngày lễ theo năm; tòa nhà có cờ "Home247 đặt sẵn" hay "người dùng thêm". Chủ nhà và sale đọc được dải ngày lễ và tòa nhà, không ghi được dải ngày lễ.

## Trạng thái màn (mọi mục)

Trang quản trị chưa có thiết kế; đang tải, mất mạng, không có quyền: [MỞ: YC13-H1].

## YC13.1 · Đăng nhập và quản trị viên

Bản sau · rủi ro: cao · Màn: chưa thiết kế

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Mở `/quan-tri`, nhập email | Ô nhập mã | Email trong danh sách thì gửi mã |
| 2 | Nhập đúng mã còn hạn | Vào trang quản trị | Mở phiên quản trị |
| 3 | Mở mục quản trị viên | Danh sách email, lúc thêm. Nút thêm, gỡ chỉ có với quản trị viên đầu tiên | Danh sách |
| 4 | Quản trị viên đầu tiên nhập email, bấm "Thêm" | Email vào danh sách | Kiểm người gọi, email đúng dạng, chưa có; ghi |
| 5 | Quản trị viên đầu tiên gỡ một người | Người đó rời danh sách | Xóa khỏi danh sách |

Phiên đang mở của người vừa bị gỡ: [MỞ: YC13-H6].

Tiêu chí:
- **YC13.1-NT1** Khi quản trị viên đầu tiên nhập email của mình và đúng mã, thì vào được trang quản trị. · e2e
- **YC13.1-NT2** Khi quản trị viên đầu tiên thêm một email, thì người đó đăng nhập bằng mã gửi tới email ấy và sửa được dải ngày lễ. · database, e2e
- **YC13.1-NT3** Khi một email chưa được thêm, thì không nhận mã và mọi lệnh quản trị bị từ chối. · database
- **YC13.1-NT4** Khi người đồng quản trị thêm hay gỡ quản trị viên, thì bị từ chối và danh sách không đổi. · database
- **YC13.1-NT5** Khi quản trị viên đầu tiên gỡ một người, thì lần đăng nhập sau người đó không nhận được mã; quản trị viên đầu tiên không gỡ được chính mình. · database

## YC13.2 · Dải ngày lễ

Bản sau · rủi ro: tb · Màn: chưa thiết kế

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Chọn năm | Danh sách dải của năm: tên dịp, ngày đầu, ngày cuối, số ngày | Dải của năm |
| 2 | Thêm hay sửa một dải | Ô tên dịp, ngày đầu, ngày cuối | Ghi dải |
| 3 | Xóa một dải | Dải rời danh sách (bước xác nhận: chưa thiết kế) | Xóa dải |

Luật kiểm:

| Ô | Luật | Sai thì |
|---|---|---|
| Năm | 2000 đến 2100; ngày đầu hay ngày cuối nằm trong năm đó | "Ngày phải thuộc năm đã chọn" |
| Tên dịp | 1 đến 80 ký tự | "Nhập tên dịp" |
| Ngày đầu, ngày cuối | Ngày cuối không trước ngày đầu. Giới hạn số ngày: [MỞ: YC13-H4] | "Ngày cuối phải từ ngày đầu trở đi" |

Hai dải cùng năm chồng ngày: [MỞ: YC13-H2]. Sửa hay xóa dải mà chủ nhà đã dùng để đặt giá dịp thì giá dịp đó giữ ngày cũ hay đổi theo, có báo chủ nhà không: [MỞ: YC13-H3]; tới khi có câu trả lời, giá dịp của chủ nhà không đổi.

Tiêu chí:
- **YC13.2-NT1** Khi quản trị viên chọn một năm, thì thấy mọi dải của năm đó với tên, ngày đầu, ngày cuối. · database, unit
- **YC13.2-NT2** Khi quản trị viên thêm hay sửa một dải năm 2027, thì chủ nhà mở "Giá ngày lễ" năm 2027 thấy dải mới. · database
- **YC13.2-NT3** Khi quản trị viên xóa một dải, thì dịp đó không còn ở "Chọn nhanh ngày lễ" của năm đó; giá dịp chủ nhà đã lưu không đổi. · database
- **YC13.2-NT4** Khi chủ nhà hay sale thêm, sửa, xóa dải ngày lễ, thì bị từ chối. · database

## YC13.3 · Tòa nhà

Bản sau · rủi ro: tb · Màn: chưa thiết kế

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Mở mục tòa nhà | Danh sách tòa: tên, khu vực, "Home247 đặt sẵn" hay "người dùng thêm" | Mọi tòa |
| 2 | Thêm tòa | Ô tên, khu vực | Ghi tòa, cờ đặt sẵn |
| 3 | Sửa tên, khu vực | Mở tòa với ô đã điền | Ghi |
| 4 | Gộp tòa trùng | Chọn tòa giữ lại và tòa gộp vào | Cách gộp (căn của tòa bị gộp chuyển sang tòa giữ lại?): [MỞ: YC13-H5] |

Sửa tòa do người dùng thêm được không: [MỞ: YC13-H7].

Tiêu chí:
- **YC13.3-NT1** Khi quản trị viên đã đặt sẵn ICON40, À La Carte, Sapphire, thì chủ nhà mới chưa thêm tòa nào thấy ba tòa đó ở CN5-A1b. · database
- **YC13.3-NT2** Khi quản trị viên thêm tòa và lưu, thì chủ nhà mở CN5-A1b thấy tòa đó. · database
- **YC13.3-NT3** Khi một chủ nhà đã thêm tòa mới, thì quản trị viên thấy tòa đó ghi "người dùng thêm". · database, unit
- **YC13.3-NT4** Khi người không phải quản trị viên ghi tòa ở lệnh của trang quản trị, thì bị từ chối. · database

## Màn hình

Chưa thiết kế.

## Lịch sử bản

| Bản | Ngày | Mục đổi | Đổi gì |
|---|---|---|---|
| 1 | 18/11/2026 | Tất cả | Tạo từ story US23, US29, US34 (QD21) |
