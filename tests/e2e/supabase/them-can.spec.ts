// Test e2e US15 · Thêm căn (YC3.2), trên Supabase chạy ở máy với hộp thư giả. Tên, số, email đều giả.
// Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase (docs/dev/chay-va-test.md).
import { expect, test, type Page } from '@playwright/test';
import { dangNhapBangMa, sql, taoTaiKhoan } from './hoTro';

const idCua = (email: string) => sql(`select id from auth.users where email = '${email}'`);

async function moFormThemCan(page: Page) {
  await page.getByRole('button', { name: 'Căn', exact: true }).click();
  await page.getByRole('button', { name: /^Thêm căn( đầu tiên| khác)?$/ }).first().click();
  await expect(page.getByRole('heading', { name: 'Thêm căn' })).toBeVisible();
  await expect(page).toHaveURL(/\/can\/moi$/);
}

test('YC3.2-NT6 thêm căn 2105 xong thì thấy toast "Đã thêm phòng 2105" và thẻ 2105 đứng đầu tab Căn với nhãn "Mới thêm"', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ Thêm Căn');
  // Căn có sẵn tạo trước 2 ngày: không còn "Mới thêm", để thấy căn mới đứng đầu (CN5-A4b).
  sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu, tao_luc)
       values ('${idCua(chu.email)}', '1509', 2, now() - interval '2 days')`);
  await dangNhapBangMa(page, chu.email);
  await moFormThemCan(page);

  // YC3.2-NT1: chưa đủ thì nút không bấm được.
  const nut = page.getByRole('button', { name: 'Thêm căn', exact: true });
  await expect(nut).toBeDisabled();
  await expect(page.getByText('Còn thiếu: mã căn, số phòng ngủ')).toBeVisible();

  // YC3.2-NT2: chỉ mã căn và số phòng ngủ.
  await page.getByLabel(/Mã căn \(tên căn hộ\)/).fill('2105');
  await page.getByRole('button', { name: '1PN', exact: true }).click();
  await expect(page.getByText('Đủ thông tin. Ảnh, giá thêm sau cũng được.')).toBeVisible();
  await nut.click();

  await expect(page.getByRole('status').filter({ hasText: 'Đã thêm phòng 2105' })).toBeVisible();
  await expect(page).toHaveURL(/\/can$/);
  await expect(page.getByRole('heading', { name: 'Căn của tôi' })).toBeVisible();
  await expect(page.getByText('2 căn')).toBeVisible();
  const the = page.getByRole('button', { name: /^Phòng / });
  await expect(the).toHaveCount(2);
  await expect(the.first()).toHaveAccessibleName('Phòng 2105');
  await expect(the.first()).toContainText('Mới thêm');
  await expect(the.nth(1)).not.toContainText('Mới thêm');
  await expect(page.getByRole('button', { name: 'Thêm căn khác' })).toBeVisible();

  // Database có đúng một căn 2105 của người này (YC3.2-NT9 ở lớp database).
  expect(sql(`select count(*) from public.can where nguoi_giu = '${idCua(chu.email)}' and ma_can = '2105'`)).toBe('1');
});

test('YC3.2-NT4 thêm căn trùng mã thì ở lại form, câu "Đã có căn 1509. Kiểm tra lại mã căn." dưới ô mã căn', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ Trùng Mã');
  sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu) values ('${idCua(chu.email)}', '1509', 2)`);
  await dangNhapBangMa(page, chu.email);
  await moFormThemCan(page);
  await page.getByLabel(/Mã căn \(tên căn hộ\)/).fill(' 1509 ');
  await page.getByRole('button', { name: '2PN', exact: true }).click();
  await page.getByRole('button', { name: 'Thêm căn', exact: true }).click();
  await expect(page.getByText('Đã có căn 1509. Kiểm tra lại mã căn.')).toBeVisible();
  await expect(page.getByText('Chưa thêm được căn. Sửa 1 chỗ bên dưới.')).toBeVisible();
  await expect(page).toHaveURL(/\/can\/moi$/);
  await expect(page.getByLabel(/Mã căn \(tên căn hộ\)/)).toHaveValue(' 1509 ');
  expect(sql(`select count(*) from public.can where nguoi_giu = '${idCua(chu.email)}'`)).toBe('1');
});

test('HV3-NT2 đang nhập form Thêm căn, đóng trang rồi mở lại thì điền lại nháp và báo "Đã khôi phục nội dung bạn đang nhập"', async ({ page, context }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ Nháp');
  await dangNhapBangMa(page, chu.email);
  await moFormThemCan(page);
  await page.getByLabel(/Mã căn \(tên căn hộ\)/).fill('Greenbay');
  await page.getByRole('button', { name: '3PN', exact: true }).click();
  await page.close();

  const moi = await context.newPage();
  await moi.goto('/can/moi');
  await expect(moi.getByRole('heading', { name: 'Thêm căn' })).toBeVisible();
  await expect(moi.getByText('Đã khôi phục nội dung bạn đang nhập')).toBeVisible();
  await expect(moi.getByLabel(/Mã căn \(tên căn hộ\)/)).toHaveValue('Greenbay');
  await expect(moi.getByRole('button', { name: '3PN', exact: true })).toHaveAttribute('aria-pressed', 'true');
});
