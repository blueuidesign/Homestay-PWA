// Test e2e trang quản trị (YC13), trên Supabase chạy ở máy với hộp thư giả. Email đều giả, đuôi vidu.test.
// Quản trị viên đầu tiên ghi bằng SQL như Tùng làm ở mỗi môi trường (docs/ha-tang/Phat_hanh.md mục 5).
import { expect, test } from '@playwright/test';
import { datQuanTriGoc, emailMoi, sql, vaoQuanTri } from './hoTro';

test.describe.configure({ mode: 'serial' });

test('YC13.1-NT1 YC13.1-NT2 quản trị viên đầu tiên đăng nhập bằng mã, thêm người; người đó đăng nhập vào được trang', async ({ page, browser }) => {
  const goc = datQuanTriGoc();
  await vaoQuanTri(page, goc);
  await expect(page.getByRole('heading', { name: 'Quản trị Home247' })).toBeVisible();
  await expect(page.getByText(`${goc} · quản trị viên đầu tiên`)).toBeVisible();

  await page.getByRole('tab', { name: 'Quản trị viên' }).click();
  const dong = emailMoi('dongqt');
  await page.getByLabel('Email người đồng quản trị').fill(dong);
  await page.getByRole('button', { name: 'Thêm' }).click();
  await expect(page.locator('[data-man="Q2"]').getByText(dong)).toBeVisible();
  expect(sql(`select count(*) from public.admins where email = '${dong}' and not la_goc`)).toBe('1');

  const ctx = await browser.newContext();
  const p2 = await ctx.newPage();
  await vaoQuanTri(p2, dong);
  await expect(p2.getByRole('heading', { name: 'Quản trị Home247' })).toBeVisible();
  await p2.getByRole('tab', { name: 'Quản trị viên' }).click();
  await expect(p2.getByLabel('Email người đồng quản trị')).toHaveCount(0);
  await ctx.close();
});

test('YC13.1-NT3 email chưa được thêm thì không nhận mã', async ({ page }) => {
  datQuanTriGoc();
  const ngoai = emailMoi('ngoai');
  await page.goto('/quan-tri');
  await page.getByLabel('Email').fill(ngoai);
  await page.getByRole('button', { name: 'Gửi mã' }).click();
  await expect(page.getByText('Email này không có quyền quản trị')).toBeVisible();
  await expect(page.locator('[data-man="Q1-01"]')).toHaveCount(0);
});
