// Test e2e phát hành (EN5, YC15.1-NT2). Chạy trên bản build ở máy; đặt E2E_BASE_URL=<tên miền chính> để chạy trên bản thật.
// Không đăng nhập, không ghi gì: chỉ mở app, kiểm cài được và không có lối đăng nhập thử (QD22).
import { expect, test } from '@playwright/test';

test('YC15.1-NT2 mở tên miền chính thì app mở, cài được, không có màn đăng nhập thử', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Home247' })).toBeVisible();

  // Cài được: manifest standalone có icon 192, 512; trang chạy https khi là bản thật.
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  const m = await (await request.get(href!)).json();
  expect(m.display).toBe('standalone');
  expect(m.icons.map((i: { sizes: string }) => i.sizes)).toEqual(expect.arrayContaining(['192x192', '512x512']));
  if (process.env.E2E_BASE_URL) expect(new URL(page.url()).protocol).toBe('https:');

  // Không có đăng nhập thử: màn đầu chỉ có "Tạo tài khoản" và "Đăng nhập" bằng mã email (QD22), không ô mật khẩu, không nút tài khoản thử.
  await expect(page.getByRole('button')).toHaveText(['Tạo tài khoản', 'Tôi đã có tài khoản · Đăng nhập']);
  expect(await page.locator('input[type="password"]').count()).toBe(0);
  await expect(page.getByText(/đăng nhập thử|tài khoản thử|mật khẩu/i)).toHaveCount(0);
});

test('YC15.1 bản build không chứa khóa service_role hay mật khẩu thử', async ({ page }) => {
  const js: string[] = [];
  page.on('response', async (r) => { if (r.url().endsWith('.js')) js.push(await r.text().catch(() => '')); });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Home247' })).toBeVisible();
  const tatCa = js.join('\n');
  expect(tatCa.length).toBeGreaterThan(1000);
  expect(tatCa).not.toMatch(/service_role|E2E_[A-Z_]*MAT_KHAU|SUPABASE_SERVICE/);
});
