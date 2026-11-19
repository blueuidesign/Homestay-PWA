# Việc chờ Tùng làm tay

Trong thời gian chạy tự động (QD25), việc chỉ Tùng làm được ghi ở đây, Claude làm tiếp việc khác. Không dán mật khẩu, khóa bí mật vào chat hay repo. Việc cũ hơn: VIEC_TAY_CUA_TUNG.md.

| Ngày ghi | Việc | Vì sao cần | Chặn gì |
|---|---|---|---|
| 2026-11-19 | Tạo tài khoản gửi mail (SMTP) cho Supabase Auth, điền ở Authentication → SMTP Settings | Mail sẵn có của Supabase chỉ gửi vài thư mỗi giờ, không đủ cho người dùng thật đăng nhập bằng mã (QD22) | Cho người dùng thật vào (bản thử trên staging vẫn chạy được với vài tài khoản) |
| 2026-11-19 | Ở staging: Authentication → Email Templates → "Magic Link", để mẫu thư hiện mã `{{ .Token }}` thay cho link | Đăng nhập bằng mã 6 số (YC1.2). Claude sẽ thử làm bằng công cụ Supabase; làm được thì dòng này bỏ | Đăng nhập bằng mã trên staging |
| 2026-11-19 | Vercel gói miễn phí: Claude đã tắt deploy tự động cho nhánh PR, chỉ main còn deploy (QD28, EN11). Tùng chỉ cần làm gì nếu muốn có lại bản Preview mỗi nhánh (nâng gói, QD24) | Hôm nay đã quá 100 lần deploy miễn phí mỗi ngày; Vercel từ chối deploy tới khoảng 15:15 UTC ngày 20/11 | Bản trên homestay-pwa.vercel.app cập nhật lại sau khi hết hạn chặn; không còn bản Preview cho từng nhánh |
| 2026-11-19 | GitHub → repo → Settings → Secrets and variables → Actions → New repository secret: thêm `RESEND_API_KEY` (khóa API của Resend) và `BAO_CAO_EMAIL` (email nhận báo cáo). Tên miền gửi homestaymail.vxlab.vn phải đã xác minh trong Resend | Gửi email báo cáo mỗi lần gộp chức năng mới (EN9) | Chỉ chặn email báo cáo, CI vẫn xanh |
| 2026-11-19 | Xem lại quyền mới ở US37 (PR link mời): policy `anh_can_xem_truoc_link` cho người chưa đăng nhập đọc ảnh căn khi gửi kèm mã link mời còn hiệu lực, chỉ ảnh của căn có lịch, chưa xóa của chủ nhà tạo link | Đổi quyền thuộc CL4.3; trong QD25 Claude đã tự gộp khi CI xanh. Cần để A1-link, A10 hiện ảnh căn khi chưa đăng nhập (QD8) | Không chặn gì; Tùng không đồng ý thì bỏ policy, xem trước sẽ không có ảnh |
| 2026-11-19 | Xem lại câu tự chốt PQ18-H1 (PQ r2): link xin lịch của sale không hết hạn ở bản 1 | Đổi một ô quyền cần Tùng duyệt (PQ đầu file); trong QD25 Claude tự chốt để làm US38 | Không chặn gì; Tùng muốn có hạn thì thêm cột hạn và kiểm ở hàm mở link (US39) |
