// Test e2e US7 · Hướng dẫn và nhắn Home247 (YC1.7, P9), trên Supabase chạy ở máy với hộp thư giả. Tên, email đều giả.
import { expect, test } from '@playwright/test';
import { dangNhapBangMa, taoTaiKhoan } from './hoTro';

test('YC1.7-NT1 YC1.7-NT2 luồng chính: Cá nhân mở P9, mở "Đặt giá theo tháng" thấy 3 bước, bấm Nhắn Zalo thì mở tab chat Zalo', async ({ page, context }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chị Hoa Thử');
  await dangNhapBangMa(page, chu.email);
  await page.getByRole('button', { name: 'Cá nhân', exact: true }).click();
  await page.getByRole('button', { name: 'Hướng dẫn sử dụng' }).click();

  const p9 = page.locator('[data-man="P9"]');
  await expect(p9.getByRole('heading', { name: 'Chủ nhà' })).toBeVisible();
  await p9.getByRole('button', { name: 'Đặt giá theo tháng' }).click();
  await expect(p9.locator('ol.p9-buoc > li')).toHaveText([
    'Mở căn, chọn tab Giá.', 'Chạm tháng bắt đầu rồi tháng kết thúc.', 'Nhập giá ngày thường, cuối tuần, bấm Áp dụng.',
  ]);

  // NT2: chặn tab ngoài để không phụ thuộc mạng, chỉ kiểm địa chỉ.
  const dichDen: string[] = [];
  await context.route('https://zalo.me/**', (r) => { dichDen.push(r.request().url()); void r.fulfill({ status: 200, body: 'ok' }); });
  const [tab] = await Promise.all([context.waitForEvent('page'), p9.getByRole('button', { name: 'Nhắn Zalo cho Home247' }).click()]);
  await tab.waitForLoadState('commit').catch(() => undefined);
  expect(tab.url()).toMatch(/^https:\/\/zalo\.me\//);
});
