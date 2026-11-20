// Test e2e US64 · Cài đặt thông báo (YC12.4, P3, P12), trên Supabase chạy ở máy với hộp thư giả. Tên, email đều giả.
import { expect, test } from '@playwright/test';
import { dangNhapBangMa, idCua, sql, taoTaiKhoan } from './hoTro';

test('YC12.4-NT1 YC12.4-NT2 luồng chính: sale mở P12 thấy 4 công tắc, tắt một loại, lưu; Cá nhân ghi 3 loại đang bật', async ({ page }) => {
  const hung = taoTaiKhoan('sale', 'Sale Hùng');
  const id = idCua(hung.email);

  await dangNhapBangMa(page, hung.email);
  await page.getByRole('button', { name: 'Cá nhân', exact: true }).click();
  await expect(page.getByRole('button', { name: /Cài đặt thông báo/ })).toContainText('4 loại đang bật');
  await page.getByRole('button', { name: /Cài đặt thông báo/ }).click();

  const p12 = page.locator('[data-man="P12"]');
  await expect(p12.getByRole('switch')).toHaveCount(4);
  await expect(p12.getByRole('switch', { name: /Căn bạn đã gửi khách/ })).toHaveAttribute('aria-checked', 'true');
  await p12.getByRole('switch', { name: /Căn bạn đã gửi khách/ }).click();
  await p12.getByRole('button', { name: 'Lưu thay đổi' }).click();

  await expect(page.getByRole('heading', { name: 'Cá nhân' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Cài đặt thông báo/ })).toContainText('3 loại đang bật');
  await expect.poll(() => sql(`select array_to_string(thong_bao_tat, ',') from public.cai_dat_rieng where nguoi_id = '${id}'`)).toBe('can_da_gui_co_nguoi_dat');

  // Mở lại thấy công tắc đã tắt.
  await page.getByRole('button', { name: /Cài đặt thông báo/ }).click();
  await expect(p12.getByRole('switch', { name: /Căn bạn đã gửi khách/ })).toHaveAttribute('aria-checked', 'false');
});
