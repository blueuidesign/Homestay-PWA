// Luồng nhỏ nhất: app mở được trên điện thoại, không có lỗi trong console, có manifest PWA.
import { test, expect } from '@playwright/test';
import { moTrang } from './dang-nhap';

test('app mở được, không lỗi console', async ({ page }) => {
  const loi: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') loi.push(m.text()); });
  await moTrang(page);
  await expect(page.locator('body')).toBeVisible();
  await page.screenshot({ path: test.info().outputPath('mo-app.png') });
  expect(loi, loi.join('\n')).toEqual([]);
});

test('có manifest PWA', async ({ page }) => {
  await moTrang(page);
  await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);
});
