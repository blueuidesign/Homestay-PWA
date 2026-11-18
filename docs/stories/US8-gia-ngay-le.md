# US8 · Chủ nhà đặt giá ngày lễ và dịp đặc biệt

- Loại: tính năng
- Trạng thái: chưa làm
- Bản: 1
- Rủi ro: cao
- Làm sau khi xong: US7
- Kiểm tay: `tests/kich-ban/US8.md` (20 kịch bản)

## Mục tiêu
Là chủ nhà, tôi muốn đặt giá riêng cho Lễ 30/4 và các dịp đặc biệt mà không bị hai dải chồng ngày, để những đêm cao điểm tính đúng giá của dịp thay vì giá tháng.

## Hành vi
Bảng bước ghi: người dùng làm gì, app hiện gì (chữ trong ngoặc kép là chữ trên màn), máy chủ phải làm gì, dữ liệu nào đổi. Cột "Máy chủ" mô tả việc phải xảy ra; bản PWA làm bằng RLS, view và hàm `fn_*` của Supabase.

### Giá ngày lễ và dịp đặc biệt
Rủi ro: cao
Mục đích: chủ nhà đặt giá riêng cho một dải ngày, như Lễ 30/4 – 1/5 hay một lễ hội địa phương.
Nguồn dải ngày lễ: Home247 đặt sẵn, chủ nhà không phải tự nhập. Bản đầu nạp bằng script. Về sau người quản trị Home247 nhập và sửa trên web quản trị theo mục "Quản trị dải ngày lễ hằng năm" (US23).
Màn hình: CN6-02, CN6-03, CN6-03-01
Khi nào xảy ra: chủ nhà bấm "Đặt giá ngày lễ, dịp đặc biệt" ở tab Giá, hoặc chạm một ngày trên lịch giá.

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở màn | Tiêu đề "Giá ngày lễ, dịp đặc biệt", tên phòng, hàng "Chọn nhanh ngày lễ" (Lễ 30/4 – 1/5, Quốc khánh 2/9, Tết Dương lịch, Tết Âm lịch). Ghi chú "Home247 đặt sẵn dải ngày nghỉ của từng dịp mỗi năm, gồm nghỉ bù và nối cuối tuần. Chọn xong vẫn sửa được ngày." | Trả các dải ngày lễ Home247 đặt sẵn cho năm đang chọn (nguồn:, sau là mục "Quản trị dải ngày lễ hằng năm" (US23)) | Không | Không |
| 2 | Chạm một dịp lễ chọn nhanh | Điền sẵn "Từ ngày", "Đến ngày", tên dịp, dòng "4 ngày · T5 30/4 → CN 3/5" | Không gọi server | Không | Không |
| 3 | Sửa dải ngày | Lưới tuần tròn từ T2 đến CN hiện các ngày đã chọn; chạm một ô để nới dải ngày. Cuối tuần có màu riêng | Không gọi server | Không | Không |
| 4 | Nhập tên dịp và "Giá mỗi đêm (đ)" | Hai ô nhập. Bỏ trống tên thì app tự đặt tên theo ngày (CN6-03-01) | Không gọi server. App hiện sẵn tên "Dịp đặc biệt dd/mm – dd/mm"; server đặt đúng tên đó nếu nhận tên trống | Không | Không |
| 5 | Bật hoặc tắt "Là ngày lễ (hiện trong mục Giá ngày lễ)" | Bật thì dải này nằm trong mục "GIÁ NGÀY LỄ"; tắt thì nằm trong "DỊP ĐẶC BIỆT" | Không gọi server | Không | Không |
| 6 | Chọn quá 10 ngày | CN6-03: cảnh báo "Tối đa 10 ngày. Đang chọn 13 ngày, hãy rút ngắn ngày kết thúc." | Không gọi server. Lệnh lưu dải quá 10 ngày thì trả `DU_LIEU_SAI` | Không | Không |
| 7 | Bấm "Lưu giá" | Lưu dải ngày và giá. Kết quả chưa vẽ (?) | dải quá 10 ngày thì `DU_LIEU_SAI`, chồng dải khác thì `DIP_CHONG_NGAY`, tên trống thì server đặt tên | Không | Thêm một mục giá ngày lễ hoặc dịp đặc biệt |
| 8 | Bấm "Lưu giá" khi dải có ngày trùng với một dải ngày lễ hoặc dịp đặc biệt đã lưu của cùng căn | Báo lỗi chồng ngày, nêu tên và ngày của dải đã có, không lưu. Chữ và màn chưa vẽ | Từ chối lưu, chặn ở database (Thiet_ke_DB, bảng gia_dip) | Không | Không đổi |

Theo quy tắc: Giá dịp thay giá tháng; Dải ngày lễ do Home247 đặt; Tên dịp tự đặt; Giá dịp không chồng ngày.

Trạng thái màn:
- rỗng: ô tên bỏ trống: CN6-03-01; CN6-03 ghi "Tên (không bắt buộc)"
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

## Tiêu chí nghiệm thu
Mỗi tiêu chí một test tự động mang đúng mã này trong tên test. Mã không đổi nghĩa; đổi hành vi thì cấp mã mới (docs/QUY_TRINH.md mục 5).

- **US8-NT1** Khi chủ nhà chạm "Lễ 30/4 – 1/5", thì các ô ngày điền sẵn dải do Home247 đặt cho năm đang chọn.
- **US8-NT2** Khi dải ngày dài hơn 10 ngày, thì hiện cảnh báo và không lưu được.
- **US8-NT3** Khi chủ nhà lưu một dải 24/10 – 25/10 giá 1.300.000đ với tắt "Là ngày lễ", thì dải đó hiện trong mục "DỊP ĐẶC BIỆT" và lịch giá hiện 1,3tr ở hai ngày đó.
- **US8-NT4** Khi chủ nhà lưu một dải với bật "Là ngày lễ", thì dải đó hiện trong mục "GIÁ NGÀY LỄ".
- **US8-NT5** Khi chủ nhà bỏ trống ô tên và lưu dải 24/10 – 25/10 với tắt "Là ngày lễ", thì dải đó có tên "Dịp đặc biệt 24/10 – 25/10". Theo quy tắc: Tên dịp tự đặt.
- **US8-NT6** Khi 3402 đã có dịp đặc biệt 24/10 – 25/10 (DLM.3) và chủ nhà lưu thêm một dải 25/10 – 26/10 cho 3402, thì app báo lỗi chồng ngày, dải mới không được lưu và dịp 24/10 – 25/10 giữ nguyên. Theo quy tắc: Giá dịp không chồng ngày.
- **US8-NT7** Khi lệnh lưu một dải chồng ngày với dải đã có của cùng căn gửi thẳng tới server, thì server từ chối và dữ liệu không đổi.
- **US8-NT8** Khi 3402 có dịp 24/10 – 25/10 và chủ nhà lưu dải 26/10 – 27/10, thì lưu được: hai dải liền nhau nhưng không chồng ngày.

## Luật chung dùng
Nguyên văn ở `docs/luat-chung/` (QT.md, HV.md, Nghiep_vu.md, Tu_dien.md), tìm theo mã hoặc tên.

Quy tắc trong nhóm Căn và giá: Giá dịp thay giá tháng, Dải ngày lễ do Home247 đặt, Tên dịp tự đặt, Ngày lễ khác dịp đặc biệt, Giá dịp không chồng ngày, Booking giữ giá riêng, Giá hai loại đêm. QT4.1 (giá dịp chỉ điền sẵn tiền phòng). HV1 đến HV3, HV5.

## Màn hình
Hình: `python3 docs/thiet-ke/trich-man.py <mã màn>` (docs/thiet-ke/README.md). Chữ và số trên hình lệch story thì story đúng.

CN6-02, CN6-03, CN6-03-01, CN6 (mục "GIÁ NGÀY LỄ", "DỊP ĐẶC BIỆT", lịch giá). Màn báo lỗi chồng ngày chưa vẽ.

**CN6-02 · Giá ngày lễ, dịp đặc biệt**
Vào từ: CN6; CN6-04; CN6-08; CN6-09
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Tiêu đề | "Giá ngày lễ, dịp đặc biệt" | Canvas |
| 2 | Khối nội dung | "Phòng 3402" | Canvas |
| 3 | Khối nội dung | "Chọn nhanh ngày lễ Lễ 30/4 – 1/5 Quốc khánh 2/9 Tết Dương lịch Tết Âm lịch Home247 đặt sẵn dải ngày nghỉ của từng dịp mỗi năm, gồm nghỉ bù và nối cuối tuần. Chọn xong vẫn sửa được ngày." | Canvas |
| 4 | Khối nội dung | "Từ ngày Đến ngày" | Canvas |
| 5 | Khối nội dung | "4 ngày · T5 30/4 → CN 3/5" | Canvas |
| 6 | Khối nội dung | "T2 27/4 T3 28/4 T4 29/4 T5 30/4 T6 1/5 T7 2/5 CN 3/5" | Canvas |
| 7 | Khối nội dung | "Ngày đã chọn Thứ 7, Chủ nhật" | Canvas |
| 8 | Khối nội dung | "Hiện tròn tuần, từ thứ 2 đến chủ nhật, để thấy dịp lễ có nối với cuối tuần không. Chạm một ô để nới dải ngày." | Canvas |
| 9 | Khối nội dung | "Tên dịp Giá mỗi đêm (đ) Là ngày lễ (hiện trong mục Giá ngày lễ)" | Canvas |
| 10 | Khối nội dung | "Lưu giá" | Canvas |
| 11 | Cỡ chữ, vùng bấm | Chữ tối thiểu 14 px, vùng bấm tối thiểu 44 px | CLAUDE.md |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Nút quay lại" | Quay lại màn trước | |
| "Lễ 30/4 – 1/5" | Theo YC, canvas chưa nối mũi tên | |
| "Quốc khánh 2/9" | Theo YC, canvas chưa nối mũi tên | |
| "Tết Dương lịch" | Theo YC, canvas chưa nối mũi tên | |
| "Tết Âm lịch" | Theo YC, canvas chưa nối mũi tên | |
| "Là ngày lễ (hiện trong mục Giá ngày lễ)" | Theo YC, canvas chưa nối mũi tên | |
| "Lưu giá" | Theo YC, canvas chưa nối mũi tên | |
Trạng thái riêng:
- rỗng: chưa thiết kế
- không có quyền: chưa thiết kế

**CN6-03-01 · Giá dịp · bỏ trống tên**
Vào từ: CN6-02, thêm giá dịp
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 0 | Màn gốc | Chép đúng màn CN6-02 trên canvas, chỉ đổi phần trạng thái. Dựng từ CN6-02 (CN6-03 là trạng thái lỗi quá 10 ngày): ô "Tên dịp" trống, gợi ý "Dịp đặc biệt 30/4 – 3/5", dòng giải thích bên dưới | CN6-02 |
| 1 | Ô tên | "Tên (không bắt buộc)", gợi ý "Dịp đặc biệt 30/4 – 3/5" | |
| 2 | Dòng | "Bỏ trống thì app đặt tên theo ngày: "Dịp đặc biệt 30/4 – 3/5"." | |
| 3 | Ô giá | "1.300.000" | |
| 4 | Nút | "Lưu giá" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Lưu giá" | Lưu với tên tự đặt | CN6 |
Trạng thái riêng:
- rỗng: chính là màn này

**CN6-03 · Chọn quá 10 ngày**
Vào từ: Xem YC (canvas chưa có mũi tên tới màn này)
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Tiêu đề | "Giá ngày lễ, dịp đặc biệt" | Canvas |
| 2 | Khối nội dung | "Phòng 3402" | Canvas |
| 3 | Khối nội dung | "Chọn nhanh ngày lễ Lễ 30/4 – 1/5 Quốc khánh 2/9 Tết Dương lịch Tết Âm lịch Ngày nghỉ của từng dịp lễ do Home247 cập nhật mỗi năm." | Canvas |
| 4 | Khối nội dung | "Từ ngày Đến ngày" | Canvas |
| 5 | Khối nội dung | "13 ngày · T5 24/12 → T3 5/1" | Canvas |
| 6 | Khối nội dung | "⚠️ Tối đa 10 ngày. Đang chọn 13 ngày, hãy rút ngắn ngày kết thúc." | Canvas |
| 7 | Khối nội dung | "T2 21/12 T3 22/12 T4 23/12 T5 24/12 T6 25/12 T7 26/12 CN 27/12 T2 28/12 T3 29/12 T4 30/12 T5 31/12 T6 1/1 T7 2/1 CN 3/1 T2 4/1 T3 5/1 T4 6/1 T5 7/1 T6 8/1 T7 9/1 CN 10/1" | Canvas |
| 8 | Khối nội dung | "Ngày đã chọn Thứ 7, Chủ nhật" | Canvas |
| 9 | Khối nội dung | "Hiện tròn tuần, từ thứ 2 đến chủ nhật, để thấy dịp lễ có nối với cuối tuần không. Chạm một ô để nới dải ngày." | Canvas |
| 10 | Khối nội dung | "Tên (không bắt buộc) Giá mỗi đêm (đ) Là ngày lễ (hiện trong mục Giá ngày lễ)" | Canvas |
| 11 | Khối nội dung | "Lưu giá" | Canvas |
| 12 | Cỡ chữ, vùng bấm | Chữ tối thiểu 14 px, vùng bấm tối thiểu 44 px | CLAUDE.md |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Nút quay lại" | Quay lại màn trước | |
| "Lễ 30/4 – 1/5" | Theo YC, canvas chưa nối mũi tên | |
| "Quốc khánh 2/9" | Theo YC, canvas chưa nối mũi tên | |
| "Tết Dương lịch" | Theo YC, canvas chưa nối mũi tên | |
| "Tết Âm lịch" | Theo YC, canvas chưa nối mũi tên | |
| "Là ngày lễ (hiện trong mục Giá ngày lễ)" | Theo YC, canvas chưa nối mũi tên | |
| "Lưu giá" | Theo YC, canvas chưa nối mũi tên | |
Trạng thái riêng:
- rỗng: chưa thiết kế
- không có quyền: chưa thiết kế

## Quyền
Ô quyền theo `docs/luat-chung/PQ.md`. Mỗi ô phải có test chứng minh người không có quyền thì không đọc, không ghi được; test ở lớp database (`tests/db/`).

Ô PQ chạm tới (ma trận `docs/luat-chung/PQ.md`): PQ5.CHU, PQ21.CHU, PQ5.SALE. Test vi phạm phải có:
- PQ5.CHU: Anh Tuấn thêm dải giá cho 3402 của Chị Hoa: `KHONG_TIM_THAY`, `gia_dip` của 3402 không đổi.
- PQ21.CHU: chủ nhà lưu dải từ "Lễ 30/4 – 1/5" với ngày khác thì dải chung của Home247 (`ngay_le`) không đổi.
- PQ5.SALE: Sale Hùng thêm dải giá cho 1509: `KHONG_TIM_THAY`.
- Không có phiên: `CHUA_DANG_NHAP`.
- Chặn ở database: hai lệnh lưu dải chồng ngày cùng lúc chỉ một lệnh qua; lưu dải chồng ngày gửi thẳng tới server thì từ chối và dữ liệu không đổi (US8-NT7).

## Database
Đã có trong `supabase/migrations/` và đã chạy test. Tham số và cột: `docs/tu-sinh/Bang_va_cot.md`.

- `fn_luu_gia_dip`: test ở t_07_can_gia_mo_rong.sql
- `fn_xoa_gia_dip`: CHƯA có test, viết test trước khi dùng

## Ngoài phạm vi
- Giá theo tháng của một căn: US4. Sao chép dịp sang căn khác (mục "Sao chép giá sang căn khác" (US7)): US7.
- Đặt giá dịp cho nhiều căn (mục "Đặt giá nhiều căn" (US7) bước 4): chưa có màn (?). [MỞ: CH-019] (mục "Đặt giá nhiều căn" (US7) bước 4 chưa vẽ)
- Nạp dải ngày lễ vào database và sửa dải chung của Home247 trên web quản trị (mục "Quản trị dải ngày lễ hằng năm" (US23)):, US23.
- Sửa và xóa một dải đã lưu: mục "Giá ngày lễ và dịp đặc biệt" chưa có bước nào. [MỞ: US8-H1] gia.md
- Tên tự đặt khi bật "Là ngày lễ": [MỞ: CH-020]. Kịch bản chỉ chạm tên tự đặt với "Là ngày lễ" tắt.

## Việc cần làm
- [ ] Đọc story này và các luật chung nó trỏ tới. Chỗ nào gắn thẻ MỞ thì không code, hỏi Tùng (docs/Cau_hoi_mo.md).
- [ ] Viết test cho từng tiêu chí chưa có test, test đỏ trước (lớp test: docs/QUY_TRINH.md mục 6).
- [ ] Database: soát các hàm ở mục Database với tiêu chí; thiếu thì thêm migration mới và một dòng trong `scripts/thu-lam-hong.sh`.
- [ ] Giao diện: các màn ở mục Màn hình, nối với Supabase (docs/Ghi_chu_code.md).
- [ ] E2E cho luồng chính của story.
- [ ] Kiểm tay theo `tests/kich-ban/US8.md` trên điện thoại thật.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md` trong cùng PR.
