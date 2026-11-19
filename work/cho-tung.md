# Việc chờ Tùng làm tay

Trong thời gian chạy tự động (QD25), việc chỉ Tùng làm được ghi ở đây, Claude làm tiếp việc khác. Không dán mật khẩu, khóa bí mật vào chat hay repo. Việc cũ hơn: VIEC_TAY_CUA_TUNG.md.

| Ngày ghi | Việc | Vì sao cần | Chặn gì |
|---|---|---|---|
| 2026-11-19 | Tạo tài khoản gửi mail (SMTP) cho Supabase Auth, điền ở Authentication → SMTP Settings | Mail sẵn có của Supabase chỉ gửi vài thư mỗi giờ, không đủ cho người dùng thật đăng nhập bằng mã (QD22) | Cho người dùng thật vào (bản thử trên staging vẫn chạy được với vài tài khoản) |
| 2026-11-19 | Ở staging: Authentication → Email Templates → "Magic Link", để mẫu thư hiện mã `{{ .Token }}` thay cho link | Đăng nhập bằng mã 6 số (YC1.2). Claude sẽ thử làm bằng công cụ Supabase; làm được thì dòng này bỏ | Đăng nhập bằng mã trên staging |
| 2026-11-19 | Vercel gói miễn phí: chọn nâng gói, hoặc để Claude tắt bản Preview cho nhánh (chỉ deploy main) | Hôm nay đã quá 100 lần deploy miễn phí mỗi ngày; Vercel từ chối deploy tới khoảng 15:15 UTC ngày 20/11. Mỗi lần đẩy nhánh là một lần deploy | Bản Preview và bản trên homestay-pwa.vercel.app không cập nhật tới khi hết hạn. CI và gộp PR vẫn chạy |
| 2026-11-19 | GitHub → repo → Settings → Secrets and variables → Actions → New repository secret: thêm `RESEND_API_KEY` (khóa API của Resend) và `BAO_CAO_EMAIL` (email nhận báo cáo). Tên miền gửi homestaymail.vxlab.vn phải đã xác minh trong Resend | Gửi email báo cáo mỗi lần gộp chức năng mới (EN9) | Chỉ chặn email báo cáo, CI vẫn xanh |
