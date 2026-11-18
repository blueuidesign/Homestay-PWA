# US40 · Người dùng tự tải file sao lưu và khôi phục

- Loại: tính năng
- Trạng thái: chưa làm
- Đặc tả: thô (lắp bằng máy từ bản Zalo, chưa viết lại theo khuôn; không code theo bản này, xem US41)
- Bản: sau
- Rủi ro: cao
- Làm sau khi xong: US22
- Kiểm tay: chưa có kịch bản, viết khi làm story

## Mục tiêu
Là chủ nhà, tôi muốn tải một file chứa dữ liệu của mình để tự giữ. Bản 1 không làm: dữ liệu được giữ bằng sao lưu tự động (docs/van-hanh/Sao_luu_khoi_phuc.md).

## Hành vi
Bảng bước ghi: người dùng làm gì, app hiện gì (chữ trong ngoặc kép là chữ trên màn), máy chủ phải làm gì, dữ liệu nào đổi. Cột "Máy chủ" mô tả việc phải xảy ra; bản PWA làm bằng RLS, view và hàm `fn_*` của Supabase.

### Sao lưu và khôi phục dữ liệu
**Không làm ở bản 1.** Dữ liệu được giữ bằng sao lưu tự động ở máy chủ (`docs/van-hanh/Sao_luu_khoi_phuc.md`). Không có tải file sao lưu, khôi phục, nhắc sao lưu. Nội dung dưới đây để dành nếu sau này làm.
Rủi ro: cao
Mục đích: chủ nhà giữ một bản dữ liệu của mình phòng khi mất hoặc xóa nhầm.
Màn hình: P7, P7-00
Khi nào xảy ra: chủ nhà chạm "Tải file sao lưu".

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở màn | "FILE SAO LƯU": "Lần cuối: 02/10/2026 21:14", "2 căn · 48 đặt phòng · 4 sale · giá cả năm" | ? | ? | ? |
| 2 | Bấm "Tải file sao lưu" | Tạo file và lưu vào máy. Ghi chú "Gửi file này qua Zalo cho chính mình để giữ an toàn." | ? | ? | Thời điểm sao lưu cuối (?) |
| 3 | Bật "Nhắc tôi sao lưu mỗi tháng" | Công tắc, ghi chú "Nhắc qua Zalo vào ngày 1 hằng tháng." | ? | ? | Cài đặt nhắc |
| 4 | Bấm "Khôi phục từ file sao lưu" | Lời cảnh báo "Toàn bộ dữ liệu hiện tại sẽ được thay bằng dữ liệu trong file." Bước chọn file và xác nhận: chưa thiết kế | ? | ? | Toàn bộ dữ liệu (?) |

Theo quy tắc: Dữ liệu lưu và xử lý ở Việt Nam (CLAUDE.md); Chặn trùng booking ở database (CLAUDE.md).

Trạng thái màn:
- rỗng: chưa từng sao lưu (dòng "Lần cuối"): P7-00
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: theo HV4
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

## Tiêu chí nghiệm thu
Mỗi tiêu chí một test tự động mang đúng mã này trong tên test. Mã không đổi nghĩa; đổi hành vi thì cấp mã mới (docs/QUY_TRINH.md mục 5).

- **US40-NT1** Khi chủ nhà bấm "Tải file sao lưu", thì "Lần cuối" đổi thành thời điểm vừa tải.
- **US40-NT2** Khi chủ nhà bấm "Khôi phục từ file sao lưu", thì app cảnh báo dữ liệu hiện tại sẽ bị thay và chưa thay gì cho tới khi xác nhận.
- **US40-NT3** Khi khôi phục xong, thì hai booking trùng đêm trong file bị từ chối, không ghi vào (xem CH-089).

## Màn hình
Hình: `python3 docs/thiet-ke/trich-man.py <mã màn>` (docs/thiet-ke/README.md). Chữ và số trên hình lệch story thì story đúng.

**P7-00 · Sao lưu · On Hold · chưa từng sao lưu**
Vào từ: Cá nhân chủ nhà, "Tải file sao lưu"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 0 | Màn gốc | Chép đúng màn P7 trên canvas, chỉ đổi phần trạng thái. | P7 |
| 1 | Thẻ | "File sao lưu", "Chưa sao lưu lần nào", "2 căn · 48 đặt phòng · 4 sale · giá cả năm" | |
| 2 | Nút | "💾 Tải file sao lưu" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Nút | Tạo file | |
Trạng thái riêng:
- rỗng: chính là màn này

**P7 · Sao lưu · On Hold**
Vào từ: P1, "Sao lưu dữ liệu"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | File sao lưu | "Lần cuối: 02/10/2026 21:14", "2 căn · 48 đặt phòng · 4 sale · giá cả năm", nút "Tải file sao lưu" | DLM.8 |
| 2 | Nhắc sao lưu | "Nhắc tôi sao lưu mỗi tháng" | Cài đặt |
| 3 | Khôi phục | Nút "Khôi phục từ file sao lưu" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Tải file sao lưu" | Tải file | P7 |
| "Khôi phục từ file sao lưu" | Chọn file | P7 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- đang tải: chưa thiết kế (HV1)
- lỗi mạng: chưa thiết kế (HV2)
- quay lại từ nền: chưa thiết kế (HV3)

## Việc cần làm
- [ ] Đọc story này và các luật chung nó trỏ tới. Chỗ nào gắn thẻ MỞ thì không code, hỏi Tùng (docs/Cau_hoi_mo.md).
- [ ] Viết test cho từng tiêu chí chưa có test, test đỏ trước (lớp test: docs/QUY_TRINH.md mục 6).
- [ ] Database: thêm migration nếu story cần bảng hay hàm mới, kèm test và một dòng trong `scripts/thu-lam-hong.sh`.
- [ ] Giao diện: các màn ở mục Màn hình, nối với Supabase (docs/Ghi_chu_code.md).
- [ ] E2E cho luồng chính của story.
- [ ] Viết kịch bản kiểm tay (tests/kich-ban/US40.md), rồi kiểm trên điện thoại thật.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md` trong cùng PR.
