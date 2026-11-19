// Test e2e US10 · Chi tiết một ngày (YC2.2), trên Supabase chạy ở máy với hộp thư giả. Tên, email, số đều giả.
// Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase (docs/dev/chay-va-test.md).
// Ngày đặt theo tháng hiện tại (giờ Việt Nam), vì lịch mở sẵn ở tháng của hôm nay.
import { expect, test } from '@playwright/test';
import { dangNhapBangMa, sql, taoTaiKhoan } from './hoTro';

test('YC2.2-NT1 chạm ô ngày 10 thì chi tiết ngày mở ngay dưới lưới, dòng 1509 của sale, dòng 3402 trống', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ Chi Tiết Ngày');
  const sale = taoTaiKhoan('sale', 'Sale Hùng');
  const nguoi = sql(`select id from auth.users where email = '${chu.email}'`);
  const saleId = sql(`select id from auth.users where email = '${sale.email}'`);
  const c1509 = sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu, tao_luc) values ('${nguoi}', '1509', 2, now() - interval '1 day') returning id`).split('\n')[0]!;
  sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu) values ('${nguoi}', '3402', 1)`);
  sql(`insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon) values ('${nguoi}', '${saleId}', 'da_ket_noi', 'link_moi')`);
  const [nam, thang] = sql(`select to_char(public.local_today(), 'YYYY|FMMM')`).split('|').map(Number) as [number, number];
  const ng = (n: number) => `${nam}-${String(thang).padStart(2, '0')}-${String(n).padStart(2, '0')}`;
  const t2 = String(thang).padStart(2, '0');

  // Như B1 (DLM.4): 1509, 10 → 12, Sale đứng tên, 2.200.000đ, cọc 1.000.000đ; tiền từng đêm 1.100.000đ.
  sql(`with b as (
         insert into public.booking (can_id, ngay_nhan, ngay_tra, nguon, sale_id, tao_boi, tien_phong, trang_thai_tien, tien_coc)
         values ('${c1509}', '${ng(10)}', '${ng(12)}', 'chu_ghi', '${saleId}', '${nguoi}', 2200000, 'da_coc', 1000000) returning id)
       insert into public.booking_dem (booking_id, dem, tien)
       select b.id, d, 1100000 from b, unnest(array['${ng(10)}'::date, '${ng(11)}'::date]) d`);

  await dangNhapBangMa(page, chu.email);
  await expect(page.getByRole('heading', { name: `Tháng ${thang}/${nam}` })).toBeVisible();

  // YC2.2 bước 6, 7: chạm ô ngày 10.
  await page.locator(`[data-ngay="${ng(10)}"]`).click();
  const chiTiet = page.getByRole('region', { name: `Ngày 10/${t2}/${nam}` });
  await expect(chiTiet.getByRole('heading', { name: `Ngày 10/${t2}/${nam}` })).toBeVisible();
  // Mở ngay dưới lưới: phần chi tiết nằm sau lưới tháng.
  const luoi = await page.getByRole('grid').boundingBox();
  const hop = await chiTiet.boundingBox();
  expect(hop!.y).toBeGreaterThan(luoi!.y + luoi!.height - 1);

  // YC2.2 bước 8, 10.
  const d1509 = chiTiet.getByRole('listitem', { name: 'Phòng 1509' });
  await expect(d1509.getByText('Sale Hùng')).toBeVisible();
  await expect(d1509.getByText(`10/${t2} → 12/${t2} (2 đêm)`)).toBeVisible();
  await expect(d1509.getByText('2.200.000đ · Cọc: 1.000.000đ')).toBeVisible();
  await expect(d1509.getByRole('link')).toHaveAttribute('href', `tel:${sale.so}`);
  await expect(chiTiet.getByRole('listitem', { name: 'Phòng 3402' }).getByText(/Trống ✓/)).toBeVisible();

  // YC2.2 bước 9: chi tiết đặt phòng (YC5) chưa có thì báo.
  await d1509.getByRole('button', { name: 'Phòng 1509' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Sẽ có ở bản sau' })).toBeVisible();
});
