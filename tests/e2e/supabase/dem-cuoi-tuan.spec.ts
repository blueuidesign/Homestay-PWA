// Test e2e US25 · Những đêm tính giá cuối tuần (YC4.6), trên Supabase chạy ở máy với hộp thư giả. Tên, email đều giả.
// Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase (docs/dev/chay-va-test.md).
import { expect, test } from '@playwright/test';
import { dangNhapBangMa, sql, taoTaiKhoan } from './hoTro';

test('YC4.6-NT2 YC4.6-NT4 YC4.6-NT1 luồng chính: Cá nhân mở P6, chọn T7 và CN, lưu thì toast, về Cá nhân, ô giá của căn đổi tên', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ Đêm Cuối Tuần');
  const nguoi = sql(`select id from auth.users where email = '${chu.email}'`);
  const canId = sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu) values ('${nguoi}', '1509', 2) returning id`).split('\n')[0]!;
  // Giá tháng này và tháng sau (tuần mẫu có thể vắt qua hai tháng): 900.000đ ngày thường, 1.300.000đ cuối tuần.
  sql(`insert into public.gia_thang (can_id, thang, gia_thuong, gia_cuoi_tuan)
       select '${canId}', date_trunc('month', public.local_today() + (n || ' month')::interval)::date, 900000, 1300000
       from generate_series(0, 1) n`);

  await dangNhapBangMa(page, chu.email);
  await page.getByRole('button', { name: 'Cá nhân', exact: true }).click();
  await expect(page).toHaveURL(/\/ca-nhan$/);
  await page.getByRole('button', { name: 'Ngày tính giá cuối tuần' }).click();
  await expect(page).toHaveURL(/\/ca-nhan\/dem-cuoi-tuan$/);

  // YC4.6 bước 1: P6, mặc định T6 và T7 sáng.
  await expect(page.getByRole('heading', { name: 'Ngày tính giá cuối tuần' })).toBeVisible();
  await expect(page.getByText('Chọn những đêm tính giá cuối tuần. Các đêm còn lại tính giá ngày thường.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'T6', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'T7', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'CN', exact: true })).toHaveAttribute('aria-pressed', 'false');

  // YC4.6 bước 3: mẫu một tuần của phòng 1509; T6 (5) và T7 (6) là 1,3tr, CN (7) là 900k.
  await expect(page.getByRole('heading', { name: 'Một tuần của phòng 1509' })).toBeVisible();
  await expect(page.locator('[data-thu="5"]')).toContainText('1,3tr');
  await expect(page.locator('[data-thu="7"]')).toContainText('900k');

  // YC4.6 bước 2, 3: chọn T7 và CN thì mẫu tính lại ngay, chưa lưu.
  await page.getByRole('button', { name: 'CN', exact: true }).click();
  await page.getByRole('button', { name: 'T6', exact: true }).click();
  await expect(page.locator('[data-thu="7"]')).toContainText('1,3tr');
  await expect(page.locator('[data-thu="5"]')).toContainText('900k');
  expect(sql(`select array_to_string(dem_cuoi_tuan, ',') from public.profiles where id = '${nguoi}'`)).toBe('5,6');

  // YC4.6-NT4: chỉ còn một đêm thì chip đó không tắt được.
  await page.getByRole('button', { name: 'T7', exact: true }).click(); // còn CN
  await expect(page.getByRole('button', { name: 'T7', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'CN', exact: true }).click(); // không tắt được
  await expect(page.getByRole('button', { name: 'CN', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'T7', exact: true }).click(); // lại T7 và CN

  // YC4.6 bước 4: lưu thì toast, về Cá nhân, database ghi {6, 7}.
  await page.getByRole('button', { name: 'Lưu thay đổi' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Đã lưu ngày tính giá cuối tuần' })).toBeVisible();
  await expect(page).toHaveURL(/\/ca-nhan$/);
  await expect(page.getByRole('heading', { name: 'Cá nhân' })).toBeVisible();
  expect(sql(`select array_to_string(dem_cuoi_tuan, ',') from public.profiles where id = '${nguoi}'`)).toBe('6,7');

  // YC4.6-NT2: mở lại P6 thì T7 và CN sáng (đọc lại từ database).
  await page.getByRole('button', { name: 'Ngày tính giá cuối tuần' }).click();
  await expect(page.getByRole('button', { name: 'T7', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'CN', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'T6', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'Quay lại' }).click();
  await expect(page).toHaveURL(/\/ca-nhan$/);

  // YC4.6-NT1, NT2: tab Giá của căn ghi tên ô giá theo lựa chọn.
  await page.getByRole('button', { name: 'Căn', exact: true }).click();
  await page.getByRole('button', { name: 'Phòng 1509' }).click();
  await page.getByRole('button', { name: 'Giá', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/can/${canId}/gia$`));
  await expect(page.getByLabel('Cuối tuần (T7, CN)')).toBeVisible();
  await expect(page.getByLabel('Ngày thường (T2–T6)')).toBeVisible();
});
