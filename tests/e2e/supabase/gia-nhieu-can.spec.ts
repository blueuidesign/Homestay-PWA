// Test e2e US23 · Đặt giá nhiều căn (YC4.4), trên Supabase chạy ở máy với hộp thư giả. Tên, email đều giả.
// Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase (docs/dev/chay-va-test.md).
import { expect, test } from '@playwright/test';
import { dangNhapBangMa, sql, taoTaiKhoan } from './hoTro';

test('YC4.4-NT1 YC4.4-NT2 YC4.4-NT4 chọn tất cả hai căn, đặt giá tháng 12 thì cả hai căn có giá đó', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ Giá Nhiều');
  const nguoi = sql(`select id from auth.users where email = '${chu.email}'`);
  const idCan = (ma: string) =>
    sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu) values ('${nguoi}', '${ma}', 2) returning id`).split('\n')[0]!;
  const a = idCan('1509');
  const b = idCan('3402');

  await dangNhapBangMa(page, chu.email);
  await page.getByRole('button', { name: 'Căn', exact: true }).click();
  await page.getByRole('button', { name: 'Đặt giá nhiều căn' }).click();
  await expect(page.getByRole('button', { name: 'Chọn ít nhất một căn' })).toBeDisabled();
  await page.getByRole('checkbox', { name: 'Phòng 1509' }).click();
  await expect(page.getByText('Chọn căn · đã chọn 1/2')).toBeVisible();
  await page.getByRole('button', { name: 'Chọn tất cả' }).click();
  await page.getByRole('button', { name: 'Đặt giá cho 2 căn' }).click();
  await expect(page.getByRole('heading', { name: 'Đặt giá · 2 căn' })).toBeVisible();
  await page.getByRole('button', { name: 'Tháng 12' }).click();
  await page.getByLabel(/Ngày thường/).fill('800000');
  await page.getByLabel(/Cuối tuần/).fill('1100000');
  await page.getByRole('button', { name: 'Áp dụng cho Tháng 12' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Đã áp dụng giá cho 2 căn' })).toBeVisible();

  const nam = sql(`select extract(year from public.local_today())::int`);
  for (const c of [a, b]) {
    expect(sql(`select gia_thuong || '/' || gia_cuoi_tuan from public.gia_thang where can_id = '${c}' and thang = '${nam}-12-01'`))
      .toBe('800000/1100000');
  }
});
