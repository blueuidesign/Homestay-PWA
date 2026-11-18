# US34 · Quản trị: đăng nhập và thêm, gỡ người đồng quản trị

- Loại: tính năng
- Trạng thái: chưa làm
- Đặc tả: thô (lắp bằng máy từ bản Zalo, chưa viết lại theo khuôn; không code theo bản này, xem US41)
- Bản: sau
- Rủi ro: cao
- Làm sau khi xong: không phụ thuộc story nào
- Kiểm tay: chưa có kịch bản, viết khi làm story

## Mục tiêu
Là Tùng, quản trị viên đầu tiên của Home247, tôi muốn đăng nhập web quản trị bằng mã gửi tới email, và tự thêm, gỡ người cùng quản trị, để không phải nhờ dev sửa cấu hình mỗi lần có người giúp nhập ngày lễ, tòa nhà (mục "Thêm người đồng quản trị" r2).

Đây là nền đăng nhập của web quản trị. US23 (dải ngày lễ) và US29 (tòa nhà) dùng lại phiên quản trị của US này.

## Hành vi
Bảng bước ghi: người dùng làm gì, app hiện gì (chữ trong ngoặc kép là chữ trên màn), máy chủ phải làm gì, dữ liệu nào đổi. Cột "Máy chủ" mô tả việc phải xảy ra; bản PWA làm bằng RLS, view và hàm `fn_*` của Supabase.

### Thêm người đồng quản trị
Rủi ro: cao
Mục đích: quản trị viên đầu tiên thêm người cùng quản trị Home247 trên web, không phải nhờ dev sửa cấu hình (mục "Thêm người đồng quản trị"). Chỉ quản trị viên đầu tiên (<email quản trị viên đầu tiên>) thêm và gỡ được người đồng quản trị; người đồng quản trị không thêm, không gỡ được ai; quản trị viên đầu tiên không bị gỡ (mục "Thêm người đồng quản trị").
Màn hình: chưa thiết kế
Dùng quy tắc: không có
Khi nào xảy ra: quản trị viên muốn có thêm người cùng nhập ngày lễ, tòa nhà.
Nguồn dữ liệu: quản trị viên đầu tiên đặt trong cấu hình server (mục "Thêm người đồng quản trị"). Người đồng quản trị được thêm trên web và lưu ở server.

| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Quản trị viên mở mục quản trị viên | Không áp dụng | Kiểm vai ADMIN, trả danh sách quản trị viên: email, lúc thêm. Nút thêm, gỡ chỉ hiện cho quản trị viên đầu tiên | Không áp dụng | Không |
| 2 | Quản trị viên đầu tiên nhập email của người đồng quản trị, bấm Thêm | Không áp dụng | Kiểm người gọi là quản trị viên đầu tiên, email đúng dạng, chưa có trong danh sách; lưu, ghi lúc thêm | Không áp dụng | Thêm một quản trị viên |
| 3 | Người được thêm đăng nhập bằng mã gửi tới email đó | Không áp dụng | Nhận là ADMIN | Không áp dụng | Không |
| 4 | Quản trị viên đầu tiên gỡ một người đồng quản trị | Không áp dụng | Kiểm người gọi là quản trị viên đầu tiên; xóa người đó khỏi danh sách. Phiên đang mở của người bị gỡ: [MỞ: CH-039] | Không áp dụng | Bỏ một quản trị viên |

Trạng thái màn:
- rỗng: không áp dụng, luôn có quản trị viên đầu tiên
- đang tải, lỗi mạng: chưa thiết kế
- không có quyền: như mục "Quản trị dải ngày lễ hằng năm" (US23)
- đã từ chối quyền Zalo, quay lại từ nền: không áp dụng
- mở từ link: ?

## Tiêu chí nghiệm thu
Mỗi tiêu chí một test tự động mang đúng mã này trong tên test. Mã không đổi nghĩa; đổi hành vi thì cấp mã mới (docs/QUY_TRINH.md mục 5).

- **US34-NT1** Khi quản trị viên đầu tiên nhập <email quản trị viên đầu tiên> và nhập đúng mã nhận qua email, thì vào được web quản trị.
- **US34-NT2** Khi quản trị viên đầu tiên thêm một email làm người đồng quản trị, thì người đó đăng nhập bằng mã gửi tới email ấy, vào được web quản trị và sửa được dải ngày lễ. `[đã có test database: t_11_ket_noi_quan_tri.sql]`
- **US34-NT3** Khi một người nhập email chưa được thêm, thì không nhận được mã, không vào được web quản trị, và server từ chối mọi API quản trị.
- **US34-NT4** Khi người không có vai ADMIN gọi server để thêm quản trị viên, thì server từ chối và danh sách không đổi.
- **US34-NT5** Khi người đồng quản trị gọi server để thêm hoặc gỡ một quản trị viên, thì server từ chối và danh sách không đổi.
- **US34-NT6** Khi quản trị viên đầu tiên gỡ một người đồng quản trị, thì lần đăng nhập sau người đó không nhận được mã. `[đã có test database: t_11_ket_noi_quan_tri.sql]`

## Luật chung dùng
Nguyên văn ở `docs/luat-chung/` (QT.md, HV.md, Nghiep_vu.md, Tu_dien.md), tìm theo mã hoặc tên.

Không có QT. Không dùng HV của app. Trạng thái đang tải, lỗi mạng của web quản trị chờ.

## Màn hình
Hình: `python3 docs/thiet-ke/trich-man.py <mã màn>` (docs/thiet-ke/README.md). Chữ và số trên hình lệch story thì story đúng.

Chưa thiết kế: màn nhập email, màn nhập mã, mục quản trị viên (danh sách email, lúc thêm, nút Thêm và Gỡ chỉ cho quản trị viên đầu tiên).

## Quyền
Ô quyền theo `docs/luat-chung/PQ.md`. Mỗi ô phải có test chứng minh người không có quyền thì không đọc, không ghi được; test ở lớp database (`tests/db/`).

Ô PQ chạm tới (ma trận `docs/luat-chung/PQ.md`): vai ADMIN (dòng mô tả vai, mục "Thêm người đồng quản trị"). PQ chưa có hàng riêng cho danh sách quản trị viên [MỞ: US34-H1] hỏi thêm hàng PQ, xem  dưới.
Test vi phạm phải có:
- Chị Hoa (CHU) và Sale Hùng gọi API thêm, gỡ quản trị viên bằng phiên app: từ chối, danh sách không đổi (US34-NT4).
- Người đồng quản trị gọi API thêm hoặc gỡ: từ chối, danh sách không đổi (US34-NT5).
- Quản trị viên đầu tiên gỡ chính mình: từ chối (mục "Thêm người đồng quản trị": quản trị viên đầu tiên không bị gỡ).
- Email chưa được thêm xin mã: không gửi mã, không mở phiên; gọi API quản trị không có phiên: từ chối (US34-NT3).
Mã lỗi chưa có trong[MỞ: US34-H2] dưới.

## Database
Đã có trong `supabase/migrations/` và đã chạy test. Tham số và cột: `docs/tu-sinh/Bang_va_cot.md`.

- `fn_qt_them_admin`: test ở t_11_ket_noi_quan_tri.sql
- `fn_qt_go_admin`: test ở t_11_ket_noi_quan_tri.sql

## Ngoài phạm vi
- Dải ngày lễ trên web: US23. Danh sách tòa nhà: US29.
- Chọn và đăng ký dịch vụ gửi thư: việc tài khoản, Tùng làm. US này chỉ gọi dịch vụ qua cấu hình.
- Đăng nhập Google: mục "Thêm người đồng quản trị" tạm bỏ.
- Người bị gỡ đang đăng nhập có mất quyền ngay không: [MỞ: CH-039]. Đề xuất trong câu hỏi: mất ngay. Chưa trả lời thì chỉ kiểm NT6 (lần đăng nhập sau).
- Mã mấy chữ số, hạn bao lâu, sai mấy lần thì khóa, phiên giữ bao lâu: [MỞ: CH-040].
- Gốc đường dẫn API quản trị: [MỞ: CH-041].

## Việc cần làm
- [ ] Đọc story này và các luật chung nó trỏ tới. Chỗ nào gắn thẻ MỞ thì không code, hỏi Tùng (docs/Cau_hoi_mo.md).
- [ ] Viết test cho từng tiêu chí chưa có test, test đỏ trước (lớp test: docs/QUY_TRINH.md mục 6).
- [ ] Database: soát các hàm ở mục Database với tiêu chí; thiếu thì thêm migration mới và một dòng trong `scripts/thu-lam-hong.sh`.
- [ ] Giao diện: các màn ở mục Màn hình, nối với Supabase (docs/Ghi_chu_code.md).
- [ ] E2E cho luồng chính của story.
- [ ] Viết kịch bản kiểm tay (tests/kich-ban/US34.md), rồi kiểm trên điện thoại thật.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md` trong cùng PR.
