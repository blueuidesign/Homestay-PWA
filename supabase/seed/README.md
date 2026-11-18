# Seed

Dữ liệu mặc định để **một môi trường trống** chạy được. `scripts/test-db.sh` chạy mọi `*.sql` ở đây theo thứ tự tên, sau toàn bộ migration.

- Chạy lại nhiều lần không sinh trùng (`on conflict do nothing`).
- Không chứa dữ liệu riêng của production, không chứa email hay số điện thoại thật.
- Đặt tên: `NN_<noi-dung>.sql`.
- `01_danh_muc.sql`: danh sách tòa nhà ở Hạ Long, email quản trị mẫu.

Dữ liệu mẫu để bấm thử và chạy E2E **không nằm ở đây** vì nó cần tài khoản đăng nhập có sẵn: xem `supabase/staging/README.md`.
