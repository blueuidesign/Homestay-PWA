// Test e2e US5 · Giờ nhận, trả phòng mặc định (YC1.5, P5), trên Supabase chạy ở máy với hộp thư giả. Tên, email đều giả.
import { expect, test } from '@playwright/test';
import { dangNhapBangMa, idCua, sql, taoTaiKhoan } from './hoTro';

test('YC1.5-NT1 luồng chính: Cá nhân mở P5, chọn 15:00 và 11:00, lưu, dòng menu ghi giờ mới, database ghi', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chị Hoa Thử');
  const id = idCua(chu.email);

  await dangNhapBangMa(page, chu.email);
  await page.getByRole('button', { name: 'Cá nhân', exact: true }).click();
  await expect(page.getByRole('button', { name: /Giờ nhận, trả phòng mặc định/ })).toContainText('14:00 · 12:00');
  await page.getByRole('button', { name: /Giờ nhận, trả phòng mặc định/ }).click();

  const p5 = page.locator('[data-man="P5"]');
  await expect(p5.getByRole('heading', { name: 'Giờ nhận, trả phòng' })).toBeVisible();
  await expect(p5.getByText('Khách nhận phòng từ 14:00, trả phòng trước 12:00 hôm sau.')).toBeVisible();
  await p5.getByLabel('Giờ nhận phòng').selectOption('15:00');
  await p5.getByLabel('Giờ trả phòng').selectOption('11:00');
  await expect(p5.getByText('Khách nhận phòng từ 15:00, trả phòng trước 11:00 hôm sau.')).toBeVisible();
  await p5.getByRole('button', { name: 'Lưu thay đổi' }).click();

  await expect(page.getByRole('heading', { name: 'Cá nhân' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Giờ nhận, trả phòng mặc định/ })).toContainText('15:00 · 11:00');
  await expect.poll(() => sql(`select to_char(gio_nhan, 'HH24:MI') || '|' || to_char(gio_tra, 'HH24:MI') from public.profiles where id = '${id}'`)).toBe('15:00|11:00');
});
