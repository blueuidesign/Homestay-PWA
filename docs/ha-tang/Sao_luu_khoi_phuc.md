---
id: HT-SL
tieu_de: Sao lưu và khôi phục
trang_thai: de-xuat
nguoi_chu: tung
rev: 1
---
# Sao lưu và khôi phục · Home247

Phiên bản 1.0 · 18/11/2026

## 1. Sao lưu tự động

`.github/workflows/backup.yml` chạy lúc **02:00 giờ Việt Nam** mỗi đêm trên máy ảo của GitHub (không cần máy ai bật):
`pg_dump` xuất database → kiểm kích thước và số bảng → `rclone` đẩy lên Google Drive → xóa bản cũ hơn 60 ngày.

### Cài một lần (chủ dự án tự làm, không dán bí mật vào chat)

1. **Mật khẩu database:** Supabase → Project Settings → Database → Reset database password → **Generate** (chỉ chữ và số; ký tự `@ # / : ?` làm hỏng chuỗi kết nối).
2. **Chuỗi kết nối:** nút **Connect** → chọn **Session pooler** (địa chỉ có `pooler.supabase.com`, cổng `5432`). Thay `[YOUR-PASSWORD]`. Máy GitHub chỉ đi IPv4, Session pooler nhận IPv4.
3. **Chìa khóa Drive:** trên máy mình chạy `rclone config create gdrive drive scope=drive.file`. Bản sao lưu có số điện thoại khách, nên thêm một mục mã hóa: `rclone config create gdrive-mahoa crypt remote=gdrive:home247-backup password=<mật khẩu tự sinh> --obscure` (cất mật khẩu trong trình quản lý mật khẩu, mất là không mở được bản sao lưu). Rồi `rclone config show`, chép cả hai mục.
   Trong `.github/workflows/backup.yml`, đổi `REMOTE` thành `gdrive-mahoa:`.
4. **GitHub → Settings → Secrets and variables → Actions:**
   - Secret `SUPABASE_DB_URL` = chuỗi ở bước 2
   - Secret `RCLONE_CONF` = kết quả ở bước 3
   - Variable `BACKUP_FOLDER` = tên thư mục trên Drive
5. Tab **Actions → Backup database → Run workflow** để chạy thử. Lỗi thì xóa lần chạy đó nếu log có lộ dữ liệu.

## 2. Thứ KHÔNG nằm trong file sao lưu

| Thứ | Nằm ở đâu | Cách lấy lại |
| --- | --- | --- |
| Code giao diện, migration, Edge Function | GitHub | Có sẵn trong repo |
| Khóa gửi thông báo đẩy | <kho bí mật SB> | <tạo lại; người dùng bật lại thông báo> |
| Khóa gửi email, cấu hình Auth | <Supabase Auth / Resend> | <ghi các bước> |
| Lịch tự động | file `*_cron.csv` đi kèm bản sao lưu | Tạo lại bằng `cron.schedule` |
| Biến môi trường giao diện | <Vercel> | <…> |

## 3. Khôi phục

<!-- Ghi lại sau mỗi lần diễn tập. Mục tiêu: người khác làm theo được khi người chính vắng. -->

1. Tạo project Supabase mới (cùng vùng).
2. Tải file `backup_<ngày>.dump` mới nhất từ Drive.
3. `pg_restore --no-owner --no-privileges -d "<chuỗi kết nối project mới>" backup_<ngày>.dump`
4. <Các bước tay ở mục 2>
5. Đổi biến môi trường giao diện sang project mới, deploy lại.
6. Kiểm tra: đăng nhập, xem số liệu ngày gần nhất khớp với trước sự cố.

## 4. Nhật ký diễn tập

| Ngày | Người làm | Bản sao lưu | Thời gian khôi phục | Vướng gì | Đã sửa tài liệu |
| --- | --- | --- | --- | --- | --- |
