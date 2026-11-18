# US29 · Quản trị danh sách tòa nhà

- Loại: tính năng
- Trạng thái: chờ code
- Đặc tả: thô (lắp bằng máy từ bản Zalo, chưa viết lại theo khuôn, chưa áp các quyết định ở `docs/tham-khao/Loi_Tung_ban_Zalo.md`; không code theo bản này, xem US41)
- Bản: sau
- Rủi ro: tb
- Làm sau khi xong: US23, US34, US11
- Kiểm tay: `tests/kich-ban/US29.md` (3 kịch bản)

## Mục tiêu
Là quản trị viên Home247, tôi muốn đặt sẵn và xem danh sách tòa nhà ở Hạ Long, để chủ nhà chọn đúng tòa khi thêm căn mà không phải tự gõ.

Nếu web quản trị chưa có thì danh sách đặt sẵn nạp bằng script, như dải ngày lễ [MỞ: US29-H1]. Web quản trị dùng chung nền đăng nhập ADMIN với US23 (US23 có trong truoc, Tùng giao 04/11).

## Hành vi
Bảng bước ghi: người dùng làm gì, app hiện gì (chữ trong ngoặc kép là chữ trên màn), máy chủ phải làm gì, dữ liệu nào đổi. Cột "Máy chủ" mô tả việc phải xảy ra; bản PWA làm bằng RLS, view và hàm `fn_*` của Supabase.

### Quản trị danh sách tòa nhà
Rủi ro: tb
Mục đích: Home247 đặt sẵn danh sách tòa nhà ở Hạ Long để chủ nhà chọn khi thêm căn (mục "Tòa nhà, loại view, số giường, mô tả" (US11)) và sale lọc đúng tòa (mục "Tìm phòng trống theo ngày" (US12)). Người dùng vẫn thêm tòa mới thoải mái, không cần duyệt (nhóm Căn và giá quy tắc Tòa nhà dùng chung). khi soạn data model: "Danh sách toà nhà có thể seting bởi admin, ngoài ra thêm thoải mái." Tòa người dùng thêm hiện cho mọi người chọn.
Màn hình: chưa thiết kế
Dùng quy tắc: Tòa nhà dùng chung (nhóm Căn và giá, mục Quy tắc nghiệp vụ phát hiện)
Khi nào xảy ra: người quản trị mở web quản trị để đặt sẵn tòa nhà, hoặc xem tòa người dùng đã thêm.
Nguồn dữ liệu: chưa có web quản trị thì danh sách đặt sẵn nạp bằng script, như dải ngày lễ [MỞ: CH-037].

| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Người quản trị mở mục tòa nhà | Danh sách tòa: tên, khu vực, do Home247 đặt sẵn hay do người dùng thêm | Kiểm người này có vai ADMIN, trả mọi tòa | Không áp dụng | Không |
| 2 | Thêm một tòa | Ô tên tòa, khu vực | Lưu tòa, đánh dấu do Home247 đặt sẵn | Không áp dụng | Thêm một tòa vào danh sách chung |
| 3 | Sửa tên hoặc khu vực một tòa | Mở tòa với các ô đã điền | Lưu tòa | Không áp dụng | Tòa đổi tên hoặc khu vực. Có áp cho tòa người dùng thêm không: CH-095 |
| 4 | Xóa hoặc gộp tòa trùng | ? [MỞ: CH-038] | ? | Không áp dụng | ? |
| 5 | (Chủ nhà mở CN5-A1b trên app) | Không thuộc web quản trị | Trả mọi tòa: Home247 đặt sẵn và người dùng thêm (mục "Tòa nhà, loại view, số giường, mô tả" (US11) bước 2) | Không áp dụng | Không |

Trạng thái màn:
- rỗng: chưa có tòa nào: chưa thiết kế
- đang tải: chưa thiết kế. HV1 viết cho app
- lỗi mạng: chưa thiết kế. HV2 viết cho app
- không có quyền: email không có vai ADMIN: không gửi mã, không vào được web quản trị, màn chưa thiết kế
- từ chối quyền: không áp dụng
- quay lại từ nền: không áp dụng
- mở từ link: ?

## Phần của story khác mà story này làm một lát
Bảng bước của các mục dưới đây nằm ở story chủ của mục đó. Story này chỉ làm các tiêu chí được liệt kê ở mục Tiêu chí nghiệm thu.

- mục "Tòa nhà, loại view, số giường, mô tả" (US11) · Tòa nhà, loại view, số giường, mô tả: bảng bước ở US11. Story này làm NT7.

## Tiêu chí nghiệm thu
Mỗi tiêu chí một test tự động mang đúng mã này trong tên test. Mã không đổi nghĩa; đổi hành vi thì cấp mã mới (docs/QUY_TRINH.md mục 5).

- **US29-NT1** Khi người quản trị đã đặt sẵn ICON40, À La Carte, Sapphire (mục "Quản trị danh sách tòa nhà"), thì chủ nhà mới chưa thêm tòa nào vẫn thấy ba tòa đó ở CN5-A1b.
- **US29-NT2** Khi người quản trị thêm tòa Sapphire và lưu, thì chủ nhà mở CN5-A1b thấy Sapphire trong danh sách tòa có sẵn (US29-NT1).
- **US29-NT3** Khi một chủ nhà đã thêm tòa mới ở CN5-A1b, thì người quản trị thấy tòa đó trong danh sách, ghi là do người dùng thêm.
- **US29-NT4** Khi người không có vai ADMIN gọi server để thêm hay sửa tòa ở đường của web quản trị, thì server từ chối và dữ liệu không đổi.

## Luật chung dùng
Nguyên văn ở `docs/luat-chung/` (QT.md, HV.md, Nghiep_vu.md, Tu_dien.md), tìm theo mã hoặc tên.

Quy tắc "Tòa nhà dùng chung" trong nhóm Căn và giá (mục Quy tắc nghiệp vụ phát hiện), chưa có mã QT. Không dùng HV mới: HV1, HV2 viết cho app, trạng thái của web quản trị chờ; CN5-A1b theo HV1, HV2, HV3 do US11 làm.

## Màn hình
Hình: `python3 docs/thiet-ke/trich-man.py <mã màn>` (docs/thiet-ke/README.md). Chữ và số trên hình lệch story thì story đúng.

app: CN5-A1, CN5-A1b (danh sách tòa có sẵn, US29-NT1). Web quản trị: mục tòa nhà, chưa thiết kế.

## Quyền
Ô quyền theo `docs/luat-chung/PQ.md`. Mỗi ô phải có test chứng minh người không có quyền thì không đọc, không ghi được; test ở lớp database (`tests/db/`).

Ô PQ chạm tới (ma trận `docs/luat-chung/PQ.md`): PQ3.ADMIN (xem; mục "Quản trị danh sách tòa nhà" cho thêm và sửa tòa, nhưng PQ3.ADMIN mới ghi "xem", PQ chưa có hàng riêng cho danh sách tòa: [MỞ: US29-H2]), PQ3.CHU, PQ3.SALE (xem mọi tòa, thêm tòa mới ở), PQ3.LINK (không thấy).
Test vi phạm phải có (US29-NT4): Chị Hoa (CHU) gọi đường quản trị để thêm hay sửa tòa: từ chối, `toa_nha` không đổi; sale Hùng gọi như vậy: từ chối; gọi không có phiên: từ chối; Chị Hoa gọi không sửa được tòa có sẵn và không đặt được `tao_boi` trống (tòa người dùng thêm không thành tòa đặt sẵn). Mã lỗi [MỞ: US29-H3].

## Database
Đã có trong `supabase/migrations/` và đã chạy test. Tham số và cột: `docs/tu-sinh/Bang_va_cot.md`.

- `fn_qt_luu_toa_nha`: CHƯA có test, viết test trước khi dùng

## Ngoài phạm vi
- Xóa hoặc gộp tòa trùng, căn đang gắn tòa bị xóa (mục "Quản trị danh sách tòa nhà" bước 4): [MỞ: US29-H4], chưa có NT, chưa US nào nhận.
- Sửa tên hoặc khu vực một tòa (mục "Quản trị danh sách tòa nhà" bước 3) và có áp cho tòa người dùng thêm không: mục "Quản trị danh sách tòa nhà" không có NT cho bước này [MỞ: US29-H5]. Chưa có kịch bản.
- Chủ nhà gõ tìm tòa, thêm tòa mới, gắn tòa vào căn (US11-NT2 đến NT6): US11. và do US11 làm; US này chỉ thêm test với dữ liệu đặt sẵn.
- Sale lọc phòng theo tòa (mục "Tìm phòng trống theo ngày" (US12)): US12.
- Cách người quản trị đăng nhập web, đồng quản trị: US34. Dải ngày lễ trên web quản trị: US23.
- Bản web cho chủ nhà: US24.

## Việc cần làm
- [ ] Đọc story này và các luật chung nó trỏ tới. Chỗ nào gắn thẻ MỞ thì không code, hỏi Tùng (docs/Cau_hoi_mo.md).
- [ ] Viết test cho từng tiêu chí chưa có test, test đỏ trước (lớp test: docs/QUY_TRINH.md mục 6).
- [ ] Database: soát các hàm ở mục Database với tiêu chí; thiếu thì thêm migration mới và một dòng trong `scripts/thu-lam-hong.sh`.
- [ ] Giao diện: các màn ở mục Màn hình, nối với Supabase (docs/Ghi_chu_code.md).
- [ ] E2E cho luồng chính của story.
- [ ] Kiểm tay theo `tests/kich-ban/US29.md` trên điện thoại thật.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md` trong cùng PR.
