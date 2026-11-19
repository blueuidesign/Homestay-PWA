// Test e2e US21 · Giá theo tháng của một căn (YC4.2), trên Supabase chạy ở máy với hộp thư giả. Tên, email đều giả.
// Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase (docs/dev/chay-va-test.md).
import { expect, test } from '@playwright/test';
import { dangNhapBangMa, sql, taoTaiKhoan } from './hoTro';

test('YC4.2-NT1 YC4.2 luồng chính: mở tab Giá của 3402, chọn Tháng 11 – 12, nhập giá, áp dụng thì toast và ô tháng đổi', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ Giá Tháng');
  const nguoi = sql(`select id from auth.users where email = '${chu.email}'`);
  const canId = sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu) values ('${nguoi}', '3402', 1) returning id`)
    .split('\n')[0]!;
  const nam = Number(sql(`select extract(year from public.local_today())::int`));

  await dangNhapBangMa(page, chu.email);
  await page.getByRole('button', { name: 'Căn', exact: true }).click();
  await page.getByRole('button', { name: 'Phòng 3402' }).click();
  await expect(page.getByRole('heading', { name: 'Phòng 3402' })).toBeVisible();
  await page.getByRole('button', { name: 'Giá', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/can/${canId}/gia$`));

  // YC4.2-NT3: căn chưa có giá thì CN6-00, 12 ô "Chưa đặt".
  await expect(page.getByText(/Căn này chưa có giá\./)).toBeVisible();
  await expect(page.getByRole('button', { name: `Năm ${nam}` })).toBeVisible();
  for (let t = 1; t <= 12; t++) {
    await expect(page.getByRole('button', { name: new RegExp(`^Tháng ${t} Chưa đặt$`) })).toBeVisible();
  }

  // YC4.2-NT2: chưa chọn tháng thì nút không bấm được.
  await expect(page.getByText('Chưa chọn tháng nào. Chọn một tháng bên trên sau đó nhập giá.')).toBeVisible();
  await expect(page.getByRole('button', { name: /^Áp dụng cho/ })).toBeDisabled();

  await page.getByRole('button', { name: /^Tháng 11 / }).click();
  await page.getByRole('button', { name: /^Tháng 12 / }).click();
  await expect(page.getByText('Đang chọn: Tháng 11 – 12 (2 tháng)')).toBeVisible();
  await page.getByLabel('Ngày thường (CN–T5)').fill('800000');
  await page.getByLabel('Cuối tuần (T6, T7)').fill('1100000');
  await page.getByRole('button', { name: 'Áp dụng cho Tháng 11 – 12' }).click();

  // YC4.2 bước 4, CN6-04: toast, ô tháng đổi, ở lại tab Giá.
  await expect(page.getByRole('status').filter({ hasText: 'Đã áp dụng giá cho Tháng 11 – 12' })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Tháng 11 / })).toContainText('800k–1,1tr');
  await expect(page.getByRole('button', { name: /^Tháng 12 / })).toContainText('800k–1,1tr');
  await expect(page).toHaveURL(new RegExp(`/can/${canId}/gia$`));
  expect(sql(`select string_agg(to_char(thang, 'MM') || ':' || gia_thuong || '/' || gia_cuoi_tuan, ',' order by thang)
              from public.gia_thang where can_id = '${canId}'`)).toBe('11:800000/1100000,12:800000/1100000');

  // YC4.2 bước 6: lịch giá tháng 11 hiện giá đêm rút gọn; đêm T2 là 800k.
  const dauT2 = sql(`select to_char(d, 'YYYY-MM-DD') from generate_series(date '${nam}-11-01', date '${nam}-11-07', interval '1 day') d
                     where extract(isodow from d) = 1`);
  const dauT6 = sql(`select to_char(d, 'YYYY-MM-DD') from generate_series(date '${nam}-11-01', date '${nam}-11-07', interval '1 day') d
                     where extract(isodow from d) = 5`);
  const lich = page.getByRole('region', { name: /^Lịch giá tháng/ });
  await expect(lich).toBeVisible();
  const ten = await lich.getByRole('heading').textContent();
  if (ten !== 'Lịch giá tháng 11') {
    // Đi tới tháng 11 của năm nay bằng nút chuyển tháng.
    const hien = Number(/(\d+)$/.exec(ten ?? '')![1]);
    const buoc = 11 - hien;
    for (let i = 0; i < Math.abs(buoc); i++) await lich.getByRole('button').filter({ hasText: /^T\d\d$/ }).nth(buoc > 0 ? 1 : 0).click();
  }
  await expect(lich.getByRole('heading')).toHaveText('Lịch giá tháng 11');
  await expect(lich.locator(`[data-ngay="${dauT2}"]`)).toContainText('800k');
  await expect(lich.locator(`[data-ngay="${dauT6}"]`)).toContainText('1,1tr');

  // YC4.2-NT5: đổi sang năm sau thì 12 ô của năm sau, chưa có giá.
  await page.getByRole('button', { name: `Năm ${nam}` }).click();
  await page.getByRole('dialog', { name: 'Đặt giá cho năm' }).getByRole('button', { name: new RegExp(`Năm ${nam + 1}`) }).click();
  await expect(page.getByRole('button', { name: `Năm ${nam + 1}` })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Tháng 11 / })).toContainText('Chưa đặt');
});
