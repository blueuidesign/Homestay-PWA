---
id: QD22
tieu_de: Người dùng đăng nhập bản PWA bằng gì
trang_thai: da-chot
loai: ky-thuat
nguoi_chot: tung
ngay_chot: 2026-11-19
han_chot: trước khi có người dùng thật
thay_cho: []
nguon: câu hỏi QD22 của bản PWA, hỏi ngày 18/11/2026
anh_huong: [YC1.1, YC1.2, YC1.3, YC1.4, YC1.8, YC6.1, YC6.3, YC6.4, YC6.6, YC6.7, YC8.1, YC9.1, YC9.2, YC10.1, PWA P1, P2, goal.md, YC15, US2, US3, US35, EN3]
rev: 2
---
# QD22 · Người dùng đăng nhập bản PWA bằng gì

## Câu hỏi
Người dùng đăng nhập bản PWA bằng gì: (a) mã OTP qua SMS (cần nhà cung cấp SMS, có phí, có thể vướng quy định tin nhắn thương hiệu), (b) đăng nhập Zalo trên web (cần đăng ký ứng dụng Zalo, kiểm Zalo có cho lấy số điện thoại trên web không), (c) tạm dùng email magic link cho vài người dùng đầu? Nguyên tắc của Home247 là không bắt đăng ký bằng email (`docs/product/goal.md`).

## Phương án
Ghi trong câu hỏi ở trên.

## Đề xuất
Chặn: Màn đăng nhập, test E2E chạy bằng tài khoản thật. Đang tạm làm: Database không phụ thuộc cách đăng nhập. E2E tạm đăng nhập bằng tài khoản thử trên staging.

## Quyết định
`[r2 · thêm]`

Mã gửi về email, không có mật khẩu (gần phương án c, nhưng là mã chứ không phải link). Đăng ký phải nhập tên và số điện thoại ngay, xong mới vào được app. Người chốt: Tùng, ngày 19/11/2026.

Câu nguyên văn của Tùng, 19/11/2026: "Đăng ký bằng email, có nhập tên và số điện thoại. Đăng nhập thì dùng mã gửi về email."

Câu nguyên văn của Tùng, 19/11/2026: "cách cũ là cách của zalo, còn bây giờ phải xin tên và số điện thoại ngay mới hoàn thành đăng ký và vào app được nhé. đăng nhập sẽ dùng code đến email nhé, chả ai nhớ mật khẩu đâu."

Tùng chọn ngày 19/11/2026 (hỏi chọn trong phiên, câu hỏi "Giữ đăng nhập bằng mật khẩu chỉ cho test tự động trên staging?"): "Bỏ hẳn mật khẩu". Không có đăng nhập bằng mật khẩu ở bất kỳ môi trường nào, kể cả staging. EN3 bỏ.

Hệ quả:
- Đăng ký và đăng nhập theo YC1.2 bản 2. Nguyên tắc "không bắt đăng ký bằng email" của `docs/product/goal.md` và cách "xin số đúng lúc" của bản Zalo không còn dùng ở bản PWA.
- Mọi hồ sơ đã đăng ký xong đều có tên và số, nên popup xin số YC6.1 bỏ; các bước "YC6.1 nếu chưa có số" ở YC6, YC8, YC9, YC10 bỏ theo.
- Số điện thoại do người dùng tự nhập, không xác minh bằng mã. Database kiểm định dạng (pwa.md P2).

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Chuyển từ câu hỏi QD22 thành QD chờ chốt | Cả file |
| r2 | 2026-11-19 | Claude | QD22-chot-dang-nhap | Tùng chốt QD22 | Quyết định, đầu file |
