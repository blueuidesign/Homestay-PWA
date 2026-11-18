# Xử lý sự cố · Home247

<!-- Khi app hỏng giữa giờ làm việc: làm theo thứ tự, ưu tiên cho người dùng làm việc lại được trước, tìm nguyên nhân sau. -->

## 1. Cho người dùng làm việc lại

| Triệu chứng | Làm ngay |
| --- | --- |
| Giao diện lỗi sau một lần deploy | Vercel → Deployments → bản trước → **Promote/Rollback** |
| Tính năng mới gây lỗi | Tắt cờ tính năng trong `settings` của đơn vị |
| Database báo lỗi sau migration | Viết migration mới đảo lại (không sửa tay trên production) |
| Không đăng nhập được | Kiểm tra trạng thái Supabase, hạn mức email |

## 2. Ghi lại

| Ngày giờ | Triệu chứng | Ảnh hưởng (ai, bao lâu) | Nguyên nhân | Đã sửa (PR) | Luật rút ra (thêm vào docs/QUY_TRINH.md mục 14) |
| --- | --- | --- | --- | --- | --- |
