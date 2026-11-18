-- Seed: dữ liệu mặc định để một môi trường trống chạy được. Chạy sau toàn bộ migration, chạy lại không sinh trùng.
-- KHÔNG đặt dữ liệu riêng của production ở đây (dùng data-fixes/). Không có email, số điện thoại thật.

-- Danh sách tòa nhà đặt sẵn ở Hạ Long (US1). Người dùng thêm tòa mới thì tao_boi là người đó.
insert into public.toa_nha (ten, khu_vuc) values
  ('ICON40', 'Bãi Cháy'),
  ('À La Carte', 'Bãi Cháy'),
  ('Sapphire', 'Bãi Cháy'),
  ('Green Bay', 'Bãi Cháy'),
  ('Mường Thanh', 'Bãi Cháy')
on conflict (ten) do nothing;

-- Email được tự gán quản trị khi đăng nhập lần đầu. la_goc = quản trị viên đầu tiên, người duy nhất thêm và gỡ được
-- người đồng quản trị (US33). Email dưới đây là mẫu. Email thật thêm bằng SQL trên từng project (VIEC_TAY_CUA_TUNG.md
-- bước 5), không ghi vào repo vì repo công khai.
insert into public.bootstrap_admins (email, la_goc) values ('admin@example.com', true) on conflict do nothing;

-- Ngày lễ: không đặt sẵn. Lịch nghỉ mỗi năm do Chính phủ công bố, quản trị viên nhập ở màn Quản trị (US33).
