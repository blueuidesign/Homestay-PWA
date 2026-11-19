// Test e2e cho vỏ app PWA (EN1): mở được trên khung điện thoại, cài được (manifest, icon, service worker).
import { expect, test } from '@playwright/test';

test('EN1: mở app trên khung 390×844 thấy tên Home247, không hỏi đăng nhập hay xin quyền', async ({ page }) => {
  const hopThoai: string[] = [];
  page.on('dialog', (d) => {
    hopThoai.push(d.message());
    void d.dismiss();
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Home247' })).toBeVisible();
  expect(hopThoai).toEqual([]);
  const rongTrang = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(rongTrang).toBeLessThanOrEqual(390);
});

test('EN1: manifest đủ để cài lên màn hình chính', async ({ page, request }) => {
  await page.goto('/');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(href).toBeTruthy();
  const res = await request.get(href!);
  expect(res.ok()).toBe(true);
  const m = await res.json();
  expect(m.short_name).toBe('Home247');
  expect(m.display).toBe('standalone');
  expect(m.start_url).toBe('/');
  const co = (size: string) => m.icons.some((i: { sizes: string }) => i.sizes === size);
  expect(co('192x192') && co('512x512')).toBe(true);
  for (const icon of m.icons as { src: string }[]) {
    expect((await request.get(icon.src)).ok(), icon.src).toBe(true);
  }
});

test('EN1: bản build đăng ký service worker và mở lại được khi mất mạng', async ({ page, context }) => {
  test.skip(!!process.env.E2E_BASE_URL, 'Chỉ kiểm trên bản build ở máy');
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Home247' })).toBeVisible();
  await context.setOffline(false);
});
