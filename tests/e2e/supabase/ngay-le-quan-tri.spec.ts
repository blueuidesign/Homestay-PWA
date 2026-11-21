// Test e2e Q3 Ngày lễ (YC13.2) và phần "sửa được dải ngày lễ" của YC13.1-NT2. Email giả, đuôi vidu.test.
import { expect, test } from '@playwright/test';
import { datQuanTriGoc, emailMoi, sql, vaoQuanTri } from './hoTro';

test.describe.configure({ mode: 'serial' });

test('YC13.1-NT2 người đồng quản trị vừa được thêm đăng nhập bằng mã và thêm được dải ngày lễ', async ({ page }) => {
  datQuanTriGoc();
  const dong = emailMoi('dongqt');
  sql(`insert into public.admins (email, la_goc) values ('${dong}', false); delete from public.ngay_le where nam = 2031`);
  await vaoQuanTri(page, dong);
  await page.getByRole('tab', { name: 'Ngày lễ' }).click();
  const q3 = page.locator('[data-man="Q3"]');
  while (!(await q3.getByText('Năm 2031', { exact: true }).isVisible())) await q3.getByRole('button', { name: 'Năm sau' }).click();
  await q3.getByRole('button', { name: 'Thêm dải ngày lễ' }).click();
  await page.getByLabel('Tên dịp').fill('Tết Nguyên đán');
  await page.getByLabel('Ngày đầu').fill('2031-01-22');
  await page.getByLabel('Ngày cuối').fill('2031-01-27');
  await page.getByRole('button', { name: 'Lưu' }).click();
  await expect(page.locator('[data-man="Q3"]').getByText('22/01/2031 → 27/01/2031 · 6 ngày')).toBeVisible();
  expect(sql(`select count(*) from public.ngay_le where nam = 2031 and ten = 'Tết Nguyên đán'`)).toBe('1');
});
