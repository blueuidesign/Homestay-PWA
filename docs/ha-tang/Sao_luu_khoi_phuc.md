---
id: HT-SL
tieu_de: Sao lưu và khôi phục
trang_thai: de-xuat
nguoi_chu: tung
rev: 2
---
# Sao lưu và khôi phục · Home247

Phiên bản 1.0 · 18/11/2026

## 1. Sao lưu tự động

`.github/workflows/backup.yml` chạy lúc **02:00 giờ Việt Nam** mỗi đêm trên máy ảo của GitHub (không cần máy ai bật):
`[r2 · sửa]` `scripts/sao-luu.sh`: `pg_dump` xuất ba schema public, auth, storage → kiểm kích thước (tối thiểu 50 KB) và đủ mọi bảng public mà migration tạo → ghi danh sách lịch tự động (`cron.job`) ra file `_cron.csv` → `rclone` đẩy lên Google Drive qua mục `crypt` (mã hóa) → xóa bản cũ hơn 60 ngày. Kiểm hỏng thì dừng trước khi đẩy, các bản cũ giữ nguyên (YC15.2-NT2). Thiếu secret thì workflow bỏ qua, không đỏ.

Thử trên máy hay CI, không đụng nơi cất: `scripts/thu-sao-luu.sh` (chạy trong job database của CI).

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
| Lịch tự động | Có lại khi chạy migration; file `backup_<ngày>_cron.csv` đi kèm bản sao lưu để so | Thiếu thì tạo lại bằng `cron.schedule` |
| Biến môi trường giao diện | <Vercel> | <…> |

## 3. Khôi phục
`[r2 · sửa]`

Mục tiêu: người khác làm theo được khi người chính vắng. Không bao giờ khôi phục đè lên production đang chạy; luôn khôi phục vào project mới rồi đổi biến môi trường.

1. Tạo project Supabase mới (cùng vùng ap-southeast-1). Bật pg_cron, btree_gist như production.
2. Chạy toàn bộ migration trong `supabase/migrations/` lên project mới (cách chạy ở docs/dev/chay-va-test.md). Bảng, hàm, policy, lịch tự động có lại từ migration.
3. Tải file `backup_<ngày>.dump` mới nhất và `backup_<ngày>_cron.csv` từ Drive bằng `rclone copy gdrive-mahoa:<thư mục>/backup_<ngày>.dump .` (rclone tự giải mã).
4. `scripts/khoi-phuc-thu.sh backup_<ngày>.dump "<chuỗi Session pooler của project mới>"`: xóa dữ liệu có sẵn ở public, auth, storage của project mới rồi nạp dữ liệu từ bản sao lưu, tắt trigger trong lúc nạp. Chạy được với vai `postgres` của Supabase (session_replication_role).
5. So `cron.job` của project mới với file `_cron.csv`; thiếu lịch nào thì tạo lại bằng `select cron.schedule(<jobname>, <schedule>, <command>)`.
6. Ảnh căn, ảnh đại diện nằm ở kho file Supabase, không nằm trong bản xuất database (chỉ có danh mục `storage.objects`). Chép kho sang project mới bằng `rclone` (S3 của Supabase) hoặc chấp nhận mất ảnh; ghi lại cách đã làm vào nhật ký diễn tập.
7. Các bước tay ở mục 2 (SMTP, mẫu thư, URL đăng nhập của Auth).
8. Đổi `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` của Production trên Vercel sang project mới, deploy lại.
9. Kiểm: đăng nhập bằng một tài khoản thật, xem lịch và đặt phòng ngày gần nhất khớp với trước sự cố.

## 4. Nhật ký diễn tập

| Ngày | Người làm | Bản sao lưu | Thời gian khôi phục | Vướng gì | Đã sửa tài liệu |
| --- | --- | --- | --- | --- | --- |
| 2026-11-21 | Claude (EN6) | Database thử trên Postgres 16 của máy, dựng từ migration và dữ liệu mẫu DLM (không phải production) | Dưới 10 giây | Không. Số dòng mọi bảng ở public, auth, storage khớp gốc. Chưa diễn tập trên Supabase thật: chờ production (QD23) | r2 |

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r2 | 2026-11-21 | Claude (QD25) | EN6-sao-luu | Viết scripts/sao-luu.sh, khoi-phuc-thu.sh, thu-sao-luu.sh, workflow backup.yml; các bước khôi phục; diễn tập trên máy | 1, 2, 3, 4 |
