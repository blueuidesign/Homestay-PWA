---
id: HT-BM
tieu_de: Bí mật và cấu hình
trang_thai: de-xuat
nguoi_chu: tung
rev: 2
---
# Bí mật và cấu hình · Home247

<!-- CHỈ ghi tên và nơi cất. KHÔNG BAO GIỜ ghi giá trị vào file này, repo, chat hay log. -->

## Luật
1. Bí mật chỉ nằm ở: GitHub Secrets, biến môi trường Vercel, kho bí mật Supabase, trình quản lý mật khẩu của chủ dự án.
2. Lỡ lộ (dán vào chat, đẩy lên repo, hiện trong log) thì **thu hồi và tạo mới ngay**, ghi vào bảng "Lần thay" bên dưới.
3. Claude không giữ, không nhập, không dùng bí mật của người dùng.

## Danh sách
`[r2 · sửa]`

| Tên | Dùng để | Cất ở | Ai tạo lại được | Lần thay gần nhất |
| --- | --- | --- | --- | --- |
| `SUPABASE_DB_URL` | Sao lưu đêm production (chuỗi Session pooler) | GitHub Secrets | Tùng | <ngày> |
| `RCLONE_CONF` | Đẩy bản sao lưu lên Drive, có mục `crypt` để mã hóa (Sao_luu_khoi_phuc.md) | GitHub Secrets | Tùng | <ngày> |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Giao diện gọi Supabase (khóa công khai). Preview dùng của staging, Production dùng của production | Vercel → Environment Variables, tách theo môi trường | Tùng | <ngày> |
| `E2E_CHU_EMAIL`, `E2E_CHU_MAT_KHAU`, `E2E_SALE_EMAIL`, `E2E_SALE_MAT_KHAU` | Tài khoản thử cho Playwright, **chỉ có trên staging** | GitHub Secrets | Tùng | <ngày> |
| `E2E_SUPABASE_URL`, `E2E_SUPABASE_ANON_KEY` | E2E đăng nhập vào staging | GitHub Secrets | Tùng | <ngày> |
| Mật khẩu database staging, production | Chạy migration bằng Supabase CLI | Trình quản lý mật khẩu của Tùng | Tùng | <ngày> |
| `service_role` của staging, production | Không dùng ở app. Chỉ Edge Function đọc từ kho bí mật Supabase | Supabase | Tùng | |
| <tài khoản SMTP gửi mail> | Gửi mã đăng nhập qua email (QD22). Mail sẵn có của Supabase chỉ đủ để thử, bản thật cần SMTP riêng | Cài đặt Auth của Supabase | Tùng | |

## Lần thay do lộ
| Ngày | Bí mật | Lộ ở đâu | Đã thu hồi | Đã tạo mới |
| --- | --- | --- | --- | --- |

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r2 | 2026-11-19 | Claude | QD22-chot-dang-nhap | Theo QD22: bí mật đăng nhập là SMTP gửi mail | Danh sách |
