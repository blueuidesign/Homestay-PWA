// Chế độ thử: app chạy bằng dữ liệu mẫu trong máy, không cần Supabase. Kiểm vỏ app và điều hướng còn sống sau mỗi lần đổi code.
// Bỏ qua khi app được cấu hình Supabase mà chưa đăng nhập (bản xem thử trên Vercel sau khi US37 xong sẽ vào màn đăng nhập).
import { test, expect } from '@playwright/test';
import { moTrang } from './dang-nhap';

test('US1 chế độ thử: mở app, bắt đầu, chọn vai chủ nhà, vào được app', async ({ page }) => {
  const loi: string[] = [];
  page.on('pageerror', (e) => loi.push(e.message));
  await moTrang(page);
  await expect(page.getByRole('button', { name: 'Bắt đầu ngay' })).toBeVisible();
  await page.getByRole('button', { name: 'Bắt đầu ngay' }).click();
  await expect(page.getByText('Bạn dùng app để làm gì?')).toBeVisible();
  // YC1.1: chưa chọn vai thì chưa đi tiếp được
  await expect(page.getByText('Chọn một mục để tiếp tục')).toBeVisible();
  await page.getByRole('button', { name: /Tôi là chủ nhà/ }).click();
  await page.getByRole('button', { name: 'Tiếp tục' }).click();
  await expect(page).not.toHaveURL(/chon-vai/);
  await page.screenshot({ path: test.info().outputPath('sau-chon-vai.png') });
  expect(loi, loi.join('\n')).toEqual([]);
});

test('US6 chế độ thử: chọn vai sale thì vào được app', async ({ page }) => {
  await moTrang(page);
  await page.getByRole('button', { name: 'Bắt đầu ngay' }).click();
  await page.getByRole('button', { name: /Tôi là sale/ }).click();
  await page.getByRole('button', { name: 'Tiếp tục' }).click();
  await expect(page).not.toHaveURL(/chon-vai/);
});

test('mở thẳng một địa chỉ bên trong app không bị lỗi 404 (SPA)', async ({ page }) => {
  await moTrang(page, '/chon-vai');
  await expect(page.getByText('Bạn dùng app để làm gì?')).toBeVisible();
});
