---
id: QD22
tieu_de: Người dùng đăng nhập bản PWA bằng gì
trang_thai: cho-chot
loai: ky-thuat
nguoi_chot: tung
ngay_chot:
han_chot: trước khi có người dùng thật
thay_cho: []
nguon: câu hỏi QD22 của bản PWA, hỏi ngày 18/11/2026
anh_huong: [YC1.2, YC6.1, PWA P1, P2, YC15]
rev: 1
---
# QD22 · Người dùng đăng nhập bản PWA bằng gì

## Câu hỏi
Người dùng đăng nhập bản PWA bằng gì: (a) mã OTP qua SMS (cần nhà cung cấp SMS, có phí, có thể vướng quy định tin nhắn thương hiệu), (b) đăng nhập Zalo trên web (cần đăng ký ứng dụng Zalo, kiểm Zalo có cho lấy số điện thoại trên web không), (c) tạm dùng email magic link cho vài người dùng đầu? Nguyên tắc của Home247 là không bắt đăng ký bằng email (`docs/product/goal.md`).

## Phương án
Ghi trong câu hỏi ở trên.

## Đề xuất
Chặn: Màn đăng nhập, test E2E chạy bằng tài khoản thật. Đang tạm làm: Database không phụ thuộc cách đăng nhập. E2E tạm đăng nhập bằng tài khoản thử trên staging.

## Quyết định
<!-- Tùng ghi khi chốt -->

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Chuyển từ câu hỏi QD22 thành QD chờ chốt | Cả file |
