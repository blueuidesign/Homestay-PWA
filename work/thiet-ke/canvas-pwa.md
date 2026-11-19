---
item: canvas-pwa   # không có item; Tùng giao trực tiếp trong thread design ngày 19/11/2026
ngay: 2026-11-19
nguoi: Claude (thread design, Tùng giao toàn quyền theo khung hiện có)
canvas: Home247 · Lịch phòng Hạ Long · bản PWA (https://claude.ai/artifact/WSMs9QQjh3rPUmMekeGj8T), bản ngày 2026-11-19
trang_thai: da-kiem
---
# Bản kê thay đổi thiết kế · canvas bản PWA

Canvas PWA chép từ canvas Zalo Mini App (artifact cũ, giữ nguyên), rồi đổi các chỗ dưới. Ảnh từng màn: `docs/design/canvas/man/<mã>.webp`.

Lời Tùng làm căn cứ (19/11/2026, trong thread design):
- "bây giờ phải xin tên và số điện thoại ngay mới hoàn thành đăng ký và vào app được nhé. đăng nhập sẽ dùng code đến email nhé, chả ai nhớ mật khẩu đâu."
- "Gửi qua Zalo thì thành "Chia sẻ" sau này có thể gửi trong app luôn, bên kia nhận được luôn."
- "những phần có thể suy luận bằng logic này thì bạn cứ tự làm nhé, tự nghiên cứu, tự quyết." (đồng ý 5 đề xuất HV6-01, P2, A7-01, CN10-01, xóa tài khoản)

## Thay đổi
| # | Màn | Loại | Đổi gì | Theo | Rev màn | Trong yêu cầu |
|---|---|---|---|---|---|---|
| 1 | Mọi màn | sửa | Bỏ thanh "··· ✕" của Zalo | pwa.md P1 | r2 | Có |
| 2 | A1 Chào mừng | sửa | Nút "Bắt đầu ngay" thành "Tạo tài khoản" và "Tôi đã có tài khoản · Đăng nhập" | QD22 (Tùng 19/11) | r2 | Có |
| 3 | A2 Tạo tài khoản | thêm | Họ và tên, số điện thoại, email; "Gửi mã xác nhận" | QD22 | r1 | Có |
| 4 | A2-01 Tạo tài khoản · nhập chưa đúng | thêm | Thiếu tên; số không đủ 9 đến 15 chữ số; email đã có tài khoản kèm nút "Đăng nhập bằng email này" | QD22, pwa.md P2 | r1 | Có |
| 5 | A2-02 Nhập mã gửi về email | thêm | 6 ô mã, gửi lại sau 60 giây, "Đổi email"; xong sang A3 | QD22 | r1 | Có |
| 6 | A2-03 Nhập mã · mã chưa đúng | thêm | Báo lỗi, giữ nút gửi lại | QD22 | r1 | Có |
| 7 | A2-04 Nhập mã · mã hết hạn | thêm | "Mã này đã hết hạn hoặc đã dùng rồi", nút "Gửi lại mã" | QD22 | r1 | Có |
| 8 | A11 Đăng nhập | thêm | Nhập email, "Gửi mã đăng nhập" | QD22 | r1 | Có |
| 9 | A11-01 Đăng nhập · email chưa có tài khoản | thêm | Báo lỗi, nút "Tạo tài khoản với email này" | QD22 | r1 | Có |
| 10 | A11-02 Đăng nhập · nhập mã | thêm | Như A2-02, xong vào tab Lịch; mã sai, hết hạn dùng A2-03, A2-04 | QD22 | r1 | Có |
| 11 | A6-P1, A6-P2, A8-P1, A8-P2, A10-P1, A10-P2, CN7-P1, CN7-P2, CN9-P1, CN9-P2, CN10-P1, CN10-P2, S3-02-P1, S3-02-P2, S5-P1, S5-P2, S6-P1, S6-P2 | bỏ | Popup xin tên và số và hộp thoại Zalo; tên và số có từ lúc đăng ký. Nút trỏ tới chúng nay đi thẳng màn kế tiếp | QD22 | r2 | Có |
| 12 | HV4-02 Đã từ chối quyền số điện thoại | bỏ | Không còn xin quyền số | QD22 | r2 | Ngoài yêu cầu |
| 13 | S1-07, S2-01, S3-12, S6-04-01 | bỏ | Màn công tắc giá | QD7 | r2 | Có |
| 14 | Mọi nút "Gửi ... qua Zalo" | sửa | Thành "Chia sẻ ...", mở bảng chia sẻ của điện thoại | Tùng 19/11, pwa.md P3 | r2 | Có |
| 15 | HV6-01 Trình duyệt chưa chia sẻ được | sửa | Thay "Zalo cũ": máy không có bảng chia sẻ thì nút "Sao chép" | HV6, pwa.md P13 | r2 | Có |
| 16 | P2 Thông tin cá nhân | sửa | Sửa được số điện thoại (bỏ "Từ Zalo"); khối Đăng nhập hiện email, không đổi ở đây; thêm nút "Xóa tài khoản" | QD22, YC1.4 | r2 | Có |
| 17 | P1, P4 Cá nhân | sửa | Dòng "Đăng nhập bằng Zalo" thành "Email đăng nhập" | QD22 | r2 | Có |
| 18 | A7-01 Chờ chủ nhà · sau khi chia sẻ | sửa | Đổi chữ Zalo thành bảng chia sẻ; vẫn chỉ đếm số lần gửi | pwa.md P3 | r2 | Có |
| 19 | CN10-01 Gửi lịch · đóng bảng chia sẻ mà chưa gửi | sửa | Trình duyệt báo khi người dùng đóng bảng chia sẻ, nên giữ màn | pwa.md P3 | r2 | Có |
| 20 | P14 Xóa tài khoản | thêm | Liệt kê điều gì mất (số điện thoại, đăng xuất), điều gì còn (căn, lịch, đặt phòng, tên kèm "Đã xoá tài khoản") | YC1.8, QD13, QT6.5, YC1-H6 | r1 | Có |
| 21 | P14-01 Xóa tài khoản · bấm lần hai | thêm | Nút đỏ "Xác nhận xóa?", xóa xong về A1 | YC1.8, design system (xóa bấm hai lần) | r1 | Có |
| 22 | A6, A7, A8, CN4-03, CN10, CN10-00, S5, HV4-01 | sửa | Câu nhắc Zalo thành email, bảng chia sẻ, trình duyệt | QD22, pwa.md | r2 | Có |

## Chưa làm
- Gửi thẳng trong app (bên kia nhận luôn): Tùng nói "sau này", chưa vẽ. Nút "Chia sẻ" để chỗ cho hướng đó.
- P7, P7-00 Sao lưu: bản sau, giữ nguyên hình.

## Câu hỏi cho Tùng
Không. Các chỗ phải sửa YC theo hình (thread EN đang sửa YC1, YC6.1, pwa.md nên thread design không đụng):
- YC1.4: số điện thoại nay sửa được ở P2 (trước ghi chỉ xem).
- YC1.8, YC1-H6: chỗ đặt nút là cuối P2, xác nhận ở P14, P14-01. Đăng nhập lại sau khi xóa thì nhập lại số (A2 không dùng được vì email đã có tài khoản; cần một bước nhập số sau A11-02 khi hồ sơ chưa có số: chưa vẽ, giả định dùng lại khối số của A2).
- YC1.2: màn A2, A2-01 đến A2-04, A11, A11-01, A11-02.

## Kết quả kiểm
| # | Kết quả | Ghi chú | Tùng quyết |
|---|---|---|---|
| 1 đến 22 | Khớp | YC đã sửa theo hình ở PR TKE-canvas-pwa-sua-yc: YC1 r3 (YC1.1, YC1.2, YC1.4, YC1.8), YC6 r3, YC8 r3, YC10 r3; YC1-H1, YC1-H6, YC8-H5 đã trả lời | Dòng 12 "Ngoài yêu cầu" (bỏ HV4-02): Claude tự quyết Bỏ theo QD22, QD25 |
| ghi chú | Lệch nhỏ | A1-link vẫn ghi "Bắt đầu ngay": YC1.2 cho nút này mở A2. Màn nhập lại số sau khi xóa tài khoản chưa vẽ: dùng khối số của A2 | |
