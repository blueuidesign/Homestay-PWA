// Test e2e đăng nhập thử trên staging (EN3, YC1.2 bảng bước bản thử).
// Tài khoản thử đọc từ GitHub Secrets E2E_CHU_EMAIL, E2E_CHU_MAT_KHAU (docs/ha-tang/Bi_mat_va_cau_hinh.md).
// Không ghi email, mật khẩu thật vào repo.
import { expect, test } from '@playwright/test';

const email = process.env.E2E_CHU_EMAIL ?? '';
const matKhau = process.env.E2E_CHU_MAT_KHAU ?? '';

test.beforeEach(() => {
  if (!email || !matKhau) throw new Error('Thiếu E2E_CHU_EMAIL, E2E_CHU_MAT_KHAU: thêm vào GitHub Secrets (VIEC_TAY_CUA_TUNG.md bước 7).');
});

test('EN3 YC1.2 bước 1: chưa đăng nhập mở app thì thấy màn Đăng nhập thử', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Đăng nhập thử' })).toBeVisible();
  await expect(page.getByText('Chỉ dùng cho bản thử.')).toBeVisible();
});

test('EN3 YC1.2 bước 3: sai mật khẩu thì báo "Email hoặc mật khẩu chưa đúng." và ở lại màn', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Mật khẩu').fill(`${matKhau}-sai`);
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(page.getByRole('alert')).toHaveText('Email hoặc mật khẩu chưa đúng.');
  await expect(page.getByRole('heading', { name: 'Đăng nhập thử' })).toBeVisible();
});

test('EN3 YC1.2 bước 2, 4: đăng nhập đúng thì vào app; tải lại trang vẫn ở trong app', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Mật khẩu').fill(matKhau);
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(page.getByRole('heading', { name: 'Home247' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Home247' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Đăng nhập thử' })).toHaveCount(0);
});
