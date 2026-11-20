// Test e2e US3 · Tab Cá nhân và đăng xuất (YC1.3), trên Supabase chạy ở máy với hộp thư giả. Tên, email đều giả.
import { expect, test } from '@playwright/test';
import { dangNhapBangMa, idCua, layMa, nhapMa, sql, taoTaiKhoan } from './hoTro';

test('YC1.3-NT4 YC1.3-NT5 đăng xuất hỏi xác nhận, về A1, nút quay lại không thấy dữ liệu; đăng nhập lại dữ liệu còn nguyên', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chị Hoa Thử');
  const id = idCua(chu.email);
  sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu) values ('${id}', 'E2E-CN1', 1)`);

  await dangNhapBangMa(page, chu.email);
  await page.getByRole('button', { name: 'Cá nhân', exact: true }).click();
  await expect(page.getByText('Chị Hoa Thử')).toBeVisible();
  await expect(page.getByText(chu.email)).toBeVisible();

  // NT4: lần bấm đầu chỉ hỏi.
  await page.getByRole('button', { name: 'Đăng xuất' }).click();
  await expect(page.getByText('Xác nhận đăng xuất? Dữ liệu vẫn giữ nguyên.')).toBeVisible();
  await expect(page.getByText('Chị Hoa Thử')).toBeVisible();
  await page.getByRole('button', { name: 'Xác nhận đăng xuất' }).click();
  await expect(page.getByRole('button', { name: /Đăng nhập/ })).toBeVisible();

  // Nút quay lại không thấy lại dữ liệu.
  await page.goBack().catch(() => undefined);
  await expect(page.getByText('Chị Hoa Thử')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Đăng nhập/ })).toBeVisible();

  // NT5: đăng nhập lại, dữ liệu còn nguyên.
  await page.goto('/');
  await page.getByRole('button', { name: 'Tôi đã có tài khoản · Đăng nhập' }).click();
  await page.getByLabel('Email').fill(chu.email);
  await page.getByRole('button', { name: 'Gửi mã đăng nhập' }).click();
  await nhapMa(page, await layMa(chu.email, 2));
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await page.getByRole('button', { name: 'Căn', exact: true }).click();
  await expect(page.getByText('E2E-CN1').first()).toBeVisible();
});
