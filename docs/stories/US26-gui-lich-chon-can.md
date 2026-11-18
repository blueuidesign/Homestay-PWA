# US26 · Chủ nhà gửi lịch cho sale theo căn đã chọn

- Loại: tính năng
- Trạng thái: chưa làm
- Bản: 1
- Rủi ro: cao
- Làm sau khi xong: US5, US6
- Kiểm tay: `tests/kich-ban/US26.md` (16 kịch bản)

## Mục tiêu
Là chủ nhà, tôi muốn chọn căn và chọn sale rồi gửi lịch qua Zalo, để mỗi sale chỉ thấy những căn tôi muốn.

## Hành vi
Bảng bước ghi: người dùng làm gì, app hiện gì (chữ trong ngoặc kép là chữ trên màn), máy chủ phải làm gì, dữ liệu nào đổi. Cột "Máy chủ" mô tả việc phải xảy ra; bản PWA làm bằng RLS, view và hàm `fn_*` của Supabase.

### YC1.8 · Chủ nhà chủ động gửi lịch cho sale
> **Bản PWA:** không mở được tin riêng cho từng sale đã chọn như Zalo; xem `PWA.md` mục P3 và CH-003.
Rủi ro: cao
Mục đích: chủ nhà gửi link xem lịch của các căn đã chọn cho sale, không chờ sale xin.
Màn hình: CN10, CN10-P1, CN10-P2, CN10-02, CN10-00, CN10-01
Khi nào xảy ra: chủ nhà ở màn Lịch, bấm nút "Gửi lịch cho sale".

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Vào CN10 | Mô tả "Sale nhận link xem lịch trống/kín và giá của các căn đã chọn. Không thấy tên khách và tiền cọc" | Không gọi server | Không | Không |
| 2 | Chọn căn | "Bước 1: Chọn căn" với các lựa chọn và nút chọn tất cả | căn của chủ nhà | Không | Không |
| 3 | Chọn sale | "Bước 2: Chọn sale để chia sẻ lịch", chọn từ sale đã lưu trong tab Sale | danh sách sale của chủ nhà | Không | Không |
| 4 | Bấm "Gửi lịch qua Zalo" | Chạy YC1.5 nếu hồ sơ chưa có số; mở Zalo | tạo link gửi lịch các căn đã chọn; tăng `so_lan_gui`, ghi `gui_cuoi_luc` khi mở cửa sổ gửi | Mở sẵn tin kèm link cho từng sale đã chọn; nếu không chọn ai thì mở cửa sổ chia sẻ để chọn người nhận | `link_moi` mới loại `gui_lich`, `link_chia_se_can` các căn đã chọn; `so_lan_gui`, `gui_cuoi_luc` |
| 5 | Về app | Hiện CN10-02: trang Lịch với toast "Đã gửi lịch thành công" | Không gọi server | Không | Không |

Theo quy tắc: Quyền sale được xem; Không biết gửi cho ai.

Trạng thái màn:
- rỗng: chưa có sale đã lưu: CN10-00
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: xem YC1.5.1
- quay lại từ nền: CN10-02 hiện khi về app; người dùng đóng cửa sổ Zalo mà không gửi: CN10-01
- mở từ link: không áp dụng

## Phần của story khác mà story này làm một lát
Bảng bước của các mục dưới đây nằm ở story chủ của mục đó. Story này chỉ làm các tiêu chí được liệt kê ở mục Tiêu chí nghiệm thu.

- YC1.12 · Căn mới của chủ nhà tự hiện cho sale: bảng bước ở US6. Story này làm NT2.

## Tiêu chí nghiệm thu
Mỗi tiêu chí một test tự động mang đúng mã này trong tên test. Mã không đổi nghĩa; đổi hành vi thì cấp mã mới (docs/QUY_TRINH.md mục 5).

- **YC1.8-NT1** Khi chủ nhà chọn 2 sale và bấm "Gửi lịch qua Zalo", thì Zalo mở tin có sẵn link cho từng sale đã chọn.
- **YC1.8-NT2** Khi chủ nhà không chọn sale nào và bấm gửi, thì Zalo mở cửa sổ chia sẻ để chọn người nhận.
- **YC1.8-NT3** Khi chủ nhà về app sau khi gửi, thì thấy CN10-02 với toast theo HV8: đúng kiểu và vị trí toast chung, tự tắt sau 3 giây.
- **YC1.12-NT2** Khi sale chỉ được chia sẻ 2 trong 6 căn và chủ nhà thêm căn thứ 7, thì sale vẫn chỉ thấy 2 căn. (QD-008)

## Luật kiểm dữ liệu và lỗi
Mỗi mục là một việc app nhờ database làm. "Đầu vào" là luật kiểm từng ô, "Lỗi riêng" là khi nào phải từ chối. Cột "Mã" là tên gọi trong tài liệu; hàm database báo lỗi bằng một câu tiếng Việt cho người dùng đọc (docs/luat-chung/Nghiep_vu.md mục Lỗi).

## Luật chung dùng
Nguyên văn ở `docs/luat-chung/` (QT.md, HV.md, Nghiep_vu.md, Tu_dien.md), tìm theo mã hoặc tên.

Quy tắc trong YC1: Quyền sale được xem, Không biết gửi cho ai, Căn mới tự hiện, Xin số điện thoại đúng lúc (nút "Gửi lịch qua Zalo"). QD-008 (link, phạm vi căn). HV1 đến HV5, HV8.

## Màn hình
Hình: `python3 docs/thiet-ke/trich-man.py <mã màn>` (docs/thiet-ke/README.md). Chữ và số trên hình lệch story thì story đúng.

CN10, CN10-00, CN10-01, CN10-02, CN10-P1, CN10-P2.

**CN10-00 · Gửi lịch · chưa có sale đã lưu**
Vào từ: CN10 khi chưa có sale
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 0 | Màn gốc | Chép đúng màn CN10 trên canvas, chỉ đổi phần trạng thái. Bước 2 bỏ ba dòng sale, thêm dòng "Chưa có sale nào đã lưu. Bấm "Gửi lịch qua Zalo" rồi tự chọn sale trong danh bạ Zalo." | CN10 |
| 1 | Giữa màn | "Chưa có sale nào", "Gửi link qua Zalo, bạn tự chọn sale trong danh bạ Zalo..." | |
| 2 | Nút | "Gửi link qua Zalo", "Thêm sale" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Gửi link qua Zalo" | Cửa sổ chia sẻ | Zalo |
| "Thêm sale" | Thêm sale | CN7-05 |
Trạng thái riêng:
- rỗng: chính là màn này

**CN10-01 · Gửi lịch · đóng Zalo mà không gửi**
Vào từ: Đóng cửa sổ chia sẻ Zalo mà không chọn ai
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 0 | Màn gốc | Chép đúng màn CN10 trên canvas, chỉ đổi phần trạng thái. Dải vàng "Bạn chưa gửi. Cửa sổ Zalo đã đóng mà chưa gửi cho ai..." trên CN10 | CN10 |
| 1 | Thẻ | "Bạn chưa gửi", "Cửa sổ Zalo đã đóng mà chưa gửi cho ai. Bấm lại để gửi." | Kết quả openShareSheet |
| 2 | Nút | "Gửi link qua Zalo" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Nút | Mở lại cửa sổ chia sẻ | Zalo |
Trạng thái riêng:
- quay lại từ nền: chính là màn này

**CN10-02 · "Gửi xong: thông báo trên lịch"**
Vào từ: CN10, gửi xong
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Lịch tháng | Như CN1 | Đặt phòng B1 đến B8 |
| 2 | Đặt phòng sắp tới | Như CN1: B1, B5, B6, B2 | B1, B5, B6, B2 |
| 3 | Thông báo | Báo đã gửi lịch | Kết quả gửi |
| 4 | Thanh tab | Lịch · Căn · Sale · Thống kê · Cá nhân | Cố định |
| 5 | Vị trí toast | Toast chung: nổi trên nội dung, cách mép trái, phải 12 px, đỉnh cách đỉnh màn 108 px (ngay dưới thanh tiêu đề và cụm ··· ✕ của Zalo), nền tối, chữ trắng 14 px đậm, bo góc vừa. Mọi màn có toast dùng đúng chỗ này | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Một dòng booking | Mở chi tiết booking | CN3-02 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- đang tải: chưa thiết kế (HV1)
- lỗi mạng: chưa thiết kế (HV2)
- quay lại từ nền: chưa thiết kế (HV3)

**CN10 · Gửi lịch cho sale**
Vào từ: CN1; CN1-01; CN1-02; CN10-02; CN2; CN2-00; CN3; HV1-01; HV1-04; HV2-01
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Tiêu đề | "Gửi lịch cho sale" | Canvas |
| 2 | Khối nội dung | "Sale nhận link xem lịch trống/kín và giá của các căn đã chọn. Sale chỉ thấy đã cọc hay chưa, không thấy tên khách và số tiền cọc." | Canvas |
| 3 | Khối nội dung | "1 Bước 1: Chọn căn Căn · đã chọn 2/2 Bỏ chọn Phòng 1509 · 2PN Phòng 3402 · 2PN" | Canvas |
| 4 | Khối nội dung | "2 Bước 2: Chọn sale để chia sẻ lịch Sale đã lưu · không bắt buộc Chọn tất cả" | Canvas |
| 5 | Khối nội dung | "Sale Hùng · 0912 *** 488" | Canvas |
| 6 | Khối nội dung | "Sale Lan · 0983 *** 120" | Canvas |
| 7 | Khối nội dung | "Sale Minh · 0868 *** 905" | Canvas |
| 8 | Khối nội dung | "Sale bạn đã lưu trong tab Sale. Zalo mở sẵn tin nhắn kèm link lịch cho từng sale đã chọn, bạn bấm gửi. Không chọn ai thì Zalo mở cửa sổ chia sẻ để bạn chọn người nhận." | Canvas |
| 9 | Khối nội dung | "Zalo sẽ mở để bạn chọn người nhận Gửi lịch qua Zalo" | Canvas |
| 10 | Cỡ chữ, vùng bấm | Chữ tối thiểu 14 px, vùng bấm tối thiểu 44 px | CLAUDE.md |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Nút quay lại" | Quay lại màn trước | |
| "Gửi lịch qua Zalo" | Mở màn CN10-P1 | CN10-P1 |
| "Bỏ chọn" | Theo YC, canvas chưa nối mũi tên | |
| "Phòng 1509 · 2PN" | Theo YC, canvas chưa nối mũi tên | |
| "Phòng 3402 · 2PN" | Theo YC, canvas chưa nối mũi tên | |
| "Chọn tất cả" | Theo YC, canvas chưa nối mũi tên | |
| "Sale Hùng · 0912 *** 488" | Theo YC, canvas chưa nối mũi tên | |
| "Sale Lan · 0983 *** 120" | Theo YC, canvas chưa nối mũi tên | |
| "Sale Minh · 0868 *** 905" | Theo YC, canvas chưa nối mũi tên | |
Trạng thái riêng:
- rỗng: chưa thiết kế
- không có quyền: chưa thiết kế

## Quyền
Ô quyền theo `docs/luat-chung/PQ.md`. Mỗi ô phải có test chứng minh người không có quyền thì không đọc, không ghi được; test ở lớp database (`tests/db/`).

Ô PQ chạm tới (ma trận `docs/luat-chung/PQ.md`): PQ3.CHU (chỉ chọn căn của mình), PQ3.SALE, PQ4.SALE (sale chỉ thấy căn được gửi), PQ18.CHU (tạo, gửi link của mình).
Test vi phạm phải có:
- Sale được chia sẻ 2 căn gọi API lịch của căn thứ 3: không thấy lịch căn đó (PQ3.SALE, PQ4.SALE).
- Chủ nhà A gọi loại `gui_lich` với căn của chủ nhà B: `KHONG_TIM_THAY`, không có link mới (PQ18.CHU, PQ3.CHU).
- Tài khoản sale gọi loại `gui_lich`: `KHONG_TIM_THAY` (PQ18.CHU, PQ13.SALE).
- Gọi loại `gui_lich` với căn tự nhập hoặc căn đã ẩn: `KHONG_TIM_THAY`.
- Chủ nhà thêm căn thứ 7 thì sale chỉ được 2 căn vẫn không thấy căn đó (YC1.12-NT2, PQ3.SALE).

## Database
Đã có trong `supabase/migrations/` và đã chạy test. Tham số và cột: `docs/tu-sinh/Bang_va_cot.md`.

- `fn_tao_link_gui_lich`: test ở t_11_ket_noi_quan_tri.sql
- `fn_dem_gui_link`: CHƯA có test, viết test trước khi dùng

## Ngoài phạm vi
- Gửi link mời chung ở CN7 (YC1.9): US5.
- Sale mở link và bấm "Thêm lịch" (YC1.3), lịch 7 ngày của sale (YC5.1): US6. US này dùng và của US6, chỉ thêm xử lý phạm vi "chọn căn" cho link `gui_lich`.
- Sale xin lịch, chủ nhà duyệt ở A8 và chọn quyền (YC1.6, YC1.7), thông báo kết nối (YC1.10): US17.
- Căn mới tự hiện cho sale được chia sẻ "tất cả căn" (YC1.12-NT1): US6.
- Sale đã kết nối nhận link gửi lịch thì phạm vi căn có đổi theo link không: [MỞ: US26-H1] US26 câu 2. Phiên server đang giữ phạm vi cũ, không ghi.
- Toast "Đã gửi lịch thành công" và cách Zalo gửi cho nhiều sale: YC1-H3 và 15 chưa chốt, dừng và hỏi nếu gặp.
- Chưa chọn căn nào mà bấm gửi: YC1.8 không nói [MỞ: US26-H2] US26 câu 1. Không viết kịch bản. Bản code đang chặn nút gửi khi bỏ chọn hết căn.
- Thu hồi link gửi lịch: [MỞ: US26-H3].

## Việc cần làm
- [ ] Đọc story này và các luật chung nó trỏ tới. Chỗ nào gắn thẻ MỞ thì không code, hỏi Tùng (docs/Cau_hoi_mo.md).
- [ ] Viết test cho từng tiêu chí chưa có test, test đỏ trước (lớp test: docs/QUY_TRINH.md mục 6).
- [ ] Database: soát các hàm ở mục Database với tiêu chí; thiếu thì thêm migration mới và một dòng trong `scripts/thu-lam-hong.sh`.
- [ ] Giao diện: các màn ở mục Màn hình, nối với Supabase (docs/Ghi_chu_code.md).
- [ ] E2E cho luồng chính của story.
- [ ] Kiểm tay theo `tests/kich-ban/US26.md` trên điện thoại thật.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md` trong cùng PR.
