// Test e2e US20 · Giá trên thẻ căn (YC4.1), trên Supabase chạy ở máy với hộp thư giả. Tên, email đều giả.
// Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase (docs/dev/chay-va-test.md).
import { expect, test } from '@playwright/test';
import { dangNhapBangMa, sql, taoTaiKhoan } from './hoTro';

test('YC4.1-NT1 YC4.1-NT2 tab Căn: căn có giá ghi khoảng giá tuần này, căn chưa có giá ghi "Chưa đặt giá" và nút mở tab Giá', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ Giá Thẻ');
  const khac = taoTaiKhoan('chu_nha', 'Chủ Khác Giá');
  const nguoi = sql(`select id from auth.users where email = '${chu.email}'`);
  const idCan = (ma: string, giu: string) =>
    sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu) values ('${giu}', '${ma}', 2) returning id`).split('\n')[0]!;
  const c1509 = idCan('1509', nguoi);
  const greenbay = idCan('Greenbay', nguoi);
  const c1103 = idCan('1103', sql(`select id from auth.users where email = '${khac.email}'`));
  // Giá tháng này và tháng sau (tuần này có thể nằm giữa hai tháng): 900.000đ ngày thường, 1.300.000đ cuối tuần.
  for (const c of [c1509, c1103]) {
    sql(`insert into public.gia_thang (can_id, thang, gia_thuong, gia_cuoi_tuan)
         select '${c}', m, ${c === c1509 ? '900000, 1300000' : '700000, 700000'}
         from (select date_trunc('month', public.local_today())::date as m
               union select (date_trunc('month', public.local_today()) + interval '1 month')::date) x`);
  }

  await dangNhapBangMa(page, chu.email);
  await page.getByRole('button', { name: 'Căn', exact: true }).click();
  await expect(page.getByText('2 căn')).toBeVisible();

  const the1509 = page.getByRole('listitem').filter({ has: page.getByRole('button', { name: 'Phòng 1509' }) });
  await expect(the1509.getByText('Giá tuần này 900.000đ – 1.300.000đ')).toBeVisible();
  // PQ5.CHU: giá căn của chủ nhà khác không lộ.
  await expect(page.getByText(/700\.000đ/)).toHaveCount(0);

  const theGb = page.getByRole('listitem').filter({ has: page.getByRole('button', { name: 'Greenbay', exact: true }) });
  await expect(theGb.getByText('Chưa đặt giá')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Đặt giá cho căn này' })).toHaveCount(1);

  // YC4.1 bước 3: nút "Đặt giá nhiều căn" báo "Sẽ có ở bản sau".
  await page.getByRole('button', { name: 'Đặt giá nhiều căn' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Sẽ có ở bản sau' })).toBeVisible();

  // YC4.1 bước 2: bấm "Đặt giá cho căn này" mở tab Giá của căn đó.
  await theGb.getByRole('button', { name: 'Đặt giá cho căn này' }).click();
  await expect(page).toHaveURL(new RegExp(`/can/${greenbay}/gia$`));
  await expect(page.getByRole('heading', { name: 'Greenbay' })).toBeVisible();
});
