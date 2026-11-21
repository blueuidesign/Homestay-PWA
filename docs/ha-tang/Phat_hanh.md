---
id: HT-PH
tieu_de: Phát hành môi trường thật
trang_thai: de-xuat
nguoi_chu: tung
rev: 1
---
# Phát hành môi trường thật · Home247

<!-- Sổ tay cho YC15.1. Chỉ ghi tên và nơi cất, không ghi giá trị bí mật, email hay địa chỉ project thật. -->

Làm khi QD23 đã chốt nơi đặt dữ liệu. Mỗi bước có cách kiểm; kết quả ghi vào mục Bằng chứng của EN5. Chạy migration lên môi trường thật cần Tùng duyệt từng lần (YC15 "Migration chỉ thêm").

## 1. Tạo project (Tùng)
Tạo project Supabase ở vùng đã chọn theo QD23, tên `home247-production`. Mật khẩu database cất trong trình quản lý mật khẩu (Bi_mat_va_cau_hinh.md). Bật Point-in-Time không bắt buộc: sao lưu đêm EN6 đã có.

## 2. Chạy toàn bộ migration (YC15.1-NT1)
1. `npx supabase link --project-ref <ref production>` rồi `npx supabase db push`. Lệnh chạy mọi file trong `supabase/migrations/` theo thứ tự tên.
2. Kiểm: lệnh không báo lỗi; `select count(*) from supabase_migrations.schema_migrations` bằng số file migration.
3. Supabase → Advisors → Security: không còn mục mức ERROR. Mục WARN ghi vào bảng ở cuối file kèm lý do để lại.
4. Không nạp dữ liệu mẫu DLM hay tài khoản thử: môi trường thật không có dữ liệu mẫu (YC15 "Hai môi trường").

## 3. Cấu hình Auth (Tùng)
- SMTP riêng (Authentication → SMTP Settings), mẫu thư mã 6 số giống staging (QD22).
- Site URL và Redirect URLs chỉ có tên miền chính của Home247 (https).

## 4. Nối giao diện (YC15.1-NT2, NT4)
1. Vercel → Project → Settings → Environment Variables, môi trường **Production**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` của production. Môi trường **Preview** giữ của staging.
2. Từ QD28, Vercel chỉ tự deploy nhánh main, không còn bản xem trước tự động. Bản thử của nhánh deploy tay bằng skill deploy-ban-thu, luôn với biến của staging. Nếu sau này bật lại Preview (QD24), kiểm lại: mở bản Preview, DevTools → Network, mọi gọi Supabase phải tới địa chỉ staging (YC15.1-NT4).
3. Domains: thêm tên miền chính, chờ chứng chỉ https.
4. Kiểm: `E2E_BASE_URL=https://<tên miền chính> npx playwright test tests/e2e/phat-hanh.spec.ts tests/e2e/vo-app.spec.ts` đạt. Trên điện thoại thật: mở tên miền, "Thêm vào màn hình chính", mở từ icon (Đức).

## 5. Quản trị viên đầu tiên (YC15.1-NT3)
Email quản trị viên đầu tiên không ở repo. Tùng chạy một lần trong SQL Editor của production:
`insert into public.admins (email, la_goc) values ('<email của Tùng>', true);`
Bảng `admins` chỉ có một dòng `la_goc` (chỉ mục `admins_mot_goc`). Phần đăng nhập vào trang quản trị thuộc YC13; khi chưa có US của YC13 thì NT3 chưa kiểm được.

## 6. Sau khi mở
- Thêm secret sao lưu và chạy diễn tập khôi phục (Sao_luu_khoi_phuc.md mục 1, 3).
- Kiểm lịch tự động do migration tạo (`select jobname, schedule from cron.job`): us16-don-anh-tam, us53-het-han-yeu-cau, us63-nhac-chua-coc, en7-bao-loi-hang-ngay (khi EN7 đã gộp). Thêm secret cho workflow dọn ảnh (EN10) bằng khóa của production.

## Cảnh báo bảo mật để lại
| Ngày | Mục | Mức | Vì sao để lại |
|---|---|---|---|

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-21 | Claude | EN5 | Tạo sổ tay phát hành theo YC15.1 | Cả file |
