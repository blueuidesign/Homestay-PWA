// US3 · Chủ nhà ghi đặt phòng, trên Supabase staging. Bật khi US37 (đăng nhập) và phần nối Supabase của US3 đã xong (bỏ .fixme).
// Dữ liệu: bộ mẫu ở supabase/staging/du_lieu_mau.sql, tài khoản hoa@home247.test có căn 1509 đã đặt giá. Mỗi lần chạy dùng ngày xa trong tương lai để không đụng lần trước.
import { test, expect } from '@playwright/test';
import { dangNhap, moTrang } from './dang-nhap';

test.fixme('US3 chủ ghi đặt phòng, tiền điền sẵn, trùng đêm thì báo', async ({ page }) => {
  await dangNhap(page, 'chu');
  await moTrang(page);
  // 1. Lịch tháng (CN1) → bấm "Đặt phòng"
  // 2. CN4: chọn căn 1509, ngày nhận, ngày trả → ô Tiền phòng đã điền sẵn
  // 3. Lưu → lịch hiện các đêm đã kín, ngày trả không kín
  // 4. Ghi lại một đặt phòng trùng một đêm → thấy câu báo trùng đêm (YC4.1.1)
  await expect(page).toHaveScreenshot();
});
