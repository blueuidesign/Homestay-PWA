// Test e2e US30 · Chi tiết đặt phòng và thu tiền (YC5.5), trên Supabase chạy ở máy với hộp thư giả. Tên, email, số đều giả.
// Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase (docs/dev/chay-va-test.md).
// Ngày đặt theo tháng hiện tại (giờ Việt Nam), vì lịch mở sẵn ở tháng của hôm nay.
import { expect, test } from '@playwright/test';
import { dangNhapBangMa, sql, taoTaiKhoan } from './hoTro';

test('YC5.5-NT1 YC5.5-NT2 YC5.5-NT4 mở chi tiết từ CN3, thu đủ, hoàn tác; sale xóa tài khoản thì không còn số', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ Chi Tiết Đặt Phòng');
  const sale = taoTaiKhoan('sale', 'Sale Hùng');
  const nguoi = sql(`select id from auth.users where email = '${chu.email}'`);
  const saleId = sql(`select id from auth.users where email = '${sale.email}'`);
  const c1509 = sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu) values ('${nguoi}', '1509', 2) returning id`).split('\n')[0]!;
  sql(`insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon) values ('${nguoi}', '${saleId}', 'da_ket_noi', 'link_moi')`);
  const [nam, thang] = sql(`select to_char(public.local_today(), 'YYYY|FMMM')`).split('|').map(Number) as [number, number];
  const ng = (n: number) => `${nam}-${String(thang).padStart(2, '0')}-${String(n).padStart(2, '0')}`;

  // Như B1 (DLM): 1509, 10 → 12, Sale Hùng đứng tên, 2.200.000đ, cọc 1.000.000đ; chủ nhà nhập 4 khách.
  const b1 = sql(`with b as (
         insert into public.booking (can_id, ngay_nhan, ngay_tra, nguon, sale_id, tao_boi, tien_phong, trang_thai_tien, tien_coc)
         values ('${c1509}', '${ng(10)}', '${ng(12)}', 'chu_ghi', '${saleId}', '${nguoi}', 2200000, 'da_coc', 1000000) returning id),
       d as (insert into public.booking_dem (booking_id, dem, tien)
             select b.id, x, 1100000 from b, unnest(array['${ng(10)}'::date, '${ng(11)}'::date]) x)
       select id from b`).split('\n')[0]!;
  sql(`insert into public.booking_rieng (booking_id, nguoi_id, so_khach) values ('${b1}', '${nguoi}', 4)`);
  // QD11: khách do sale nhập không bao giờ hiện cho chủ nhà.
  sql(`insert into public.booking_rieng (booking_id, nguoi_id, ten_khach, sdt_khach) values ('${b1}', '${saleId}', 'Khách Riêng Của Sale', '0900000077')`);

  await dangNhapBangMa(page, chu.email);
  await expect(page.getByRole('heading', { name: `Tháng ${thang}/${nam}` })).toBeVisible();

  // YC2.2 bước 9: chạm dòng 1509 ở chi tiết ngày 10 mở CN3-02.
  await page.locator(`[data-ngay="${ng(10)}"]`).click();
  await page.getByRole('listitem', { name: 'Phòng 1509' }).getByRole('button', { name: 'Phòng 1509' }).click();
  await expect(page.getByRole('heading', { name: 'Đặt phòng · Sale Hùng' })).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`/dat-phong/${b1}$`));
  const nguoiDat = page.getByRole('region', { name: 'Người đặt' });
  await expect(nguoiDat.getByRole('link', { name: 'Gọi sale' })).toHaveAttribute('href', `tel:${sale.so}`);
  await expect(nguoiDat.getByText(/4 khách/)).toBeVisible();
  await expect(page.getByText('Khách Riêng Của Sale')).toHaveCount(0);

  // YC5.5-NT1.
  const tien = page.getByRole('region', { name: 'Tiền' });
  await expect(tien.getByText('1.200.000đ')).toBeVisible();
  await expect(page.getByText('Đã cọc · còn thu')).toBeVisible();

  // YC5.5-NT2: bấm "Đã thu đủ".
  await page.getByRole('button', { name: 'Đã thu đủ 1.200.000đ' }).click();
  await expect(page.getByRole('button', { name: 'Hoàn tác: chưa thu đủ' })).toBeVisible();
  await expect(page.getByText('Đã thanh toán')).toBeVisible();
  await expect(tien.getByText('1.000.000đ')).toBeVisible();
  expect(sql(`select trang_thai_tien || '|' || tien_coc from public.booking where id = '${b1}'`)).toBe('da_thanh_toan|1000000');

  // YC5.5-NT3: hoàn tác.
  await page.getByRole('button', { name: 'Hoàn tác: chưa thu đủ' }).click();
  await expect(page.getByRole('button', { name: 'Đã thu đủ 1.200.000đ' })).toBeVisible();
  await expect(page.getByText('Đã cọc · còn thu')).toBeVisible();
  expect(sql(`select trang_thai_tien from public.booking where id = '${b1}'`)).toBe('da_coc');

  // YC5.5-NT4: Sale Hùng xóa tài khoản (QD13), Chị Hoa mở lại đặt phòng.
  sql(`update public.profiles set so_dien_thoai = null, da_xoa_luc = now() where id = '${saleId}'`);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Đặt phòng · Sale Hùng' })).toBeVisible();
  await expect(nguoiDat.getByText('đã xóa tài khoản', { exact: true })).toBeVisible();
  await expect(nguoiDat.getByRole('link')).toHaveCount(0);
  await expect(page.getByText(sale.so)).toHaveCount(0);
  await expect(nguoiDat.getByText(/app không còn số điện thoại của sale này/)).toBeVisible();

  // Đêm 10, 11 vẫn kín: quay về lịch, ô ngày 10 vẫn có 1509.
  await page.getByRole('button', { name: 'Quay lại' }).click();
  await expect(page.locator(`[data-ngay="${ng(10)}"]`)).toHaveAttribute('aria-label', /đã đặt phòng 1509/);
  await expect(page.locator(`[data-ngay="${ng(11)}"]`)).toHaveAttribute('aria-label', /đã đặt phòng 1509/);
});
