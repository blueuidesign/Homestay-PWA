# Dữ liệu mẫu cho staging

Chỉ dùng cho project **staging**. Không bao giờ chạy trên production.

`du_lieu_mau.sql` nạp bộ dữ liệu mẫu ở `docs/luat-chung/Du_lieu_mau.md`: Chị Hoa (căn 1509, 3402), Anh Tuấn (căn 1103), Sale Hùng (thấy mọi căn của Chị Hoa, có căn tự nhập Villa Tuần Châu), Sale Lan (chỉ thấy 1509), Sale Nga (chưa kết nối). Giá đặt cho tháng hiện tại và 5 tháng sau.

## Cách nạp

1. Trong Supabase staging, mục Authentication, tạo 5 tài khoản bằng email và mật khẩu, bật "Auto Confirm User":
   `hoa@home247.test`, `tuan@home247.test`, `hung@home247.test`, `lan@home247.test`, `nga@home247.test`.
   Mật khẩu tự đặt, cất theo `docs/van-hanh/Bi_mat_va_cau_hinh.md`. Không ghi mật khẩu vào repo.
2. Mở SQL Editor của staging, dán nội dung `du_lieu_mau.sql`, chạy.
3. Chạy lại được nhiều lần: script xóa căn, kết nối, đặt phòng của 5 tài khoản này rồi nạp lại. Tài khoản khác không bị đụng.

E2E dùng `hoa@home247.test` làm chủ nhà và `hung@home247.test` làm sale (biến `E2E_CHU_EMAIL`, `E2E_SALE_EMAIL` ở GitHub Secrets).
