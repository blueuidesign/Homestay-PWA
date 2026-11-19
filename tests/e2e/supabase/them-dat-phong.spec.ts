// Test e2e US26 · Mở form, chọn căn và ngày, kiểm trùng sớm (YC5.1), trên Supabase chạy ở máy với hộp thư giả.
// Tên, email, số đều giả. Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase (docs/dev/chay-va-test.md).
// Ngày đặt theo tháng hiện tại (giờ Việt Nam), vì lịch mở sẵn ở tháng của hôm nay.
import { expect, test } from '@playwright/test';
import { dangNhapBangMa, sql, taoTaiKhoan } from './hoTro';

test('YC5.1-NT5 chi tiết ngày 10: dòng 3402 "Trống" có nút "Đặt phòng"; bấm thì CN4 mở với căn 3402 và ngày nhận 10', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ Thêm Đặt Phòng');
  const nguoi = sql(`select id from auth.users where email = '${chu.email}'`);
  const c1509 = sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu, tao_luc) values ('${nguoi}', '1509', 2, now() - interval '1 day') returning id`).split('\n')[0]!;
  sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu) values ('${nguoi}', '3402', 1)`);
  const [nam, thang] = sql(`select to_char(public.local_today(), 'YYYY|FMMM')`).split('|').map(Number) as [number, number];
  const ng = (n: number) => `${nam}-${String(thang).padStart(2, '0')}-${String(n).padStart(2, '0')}`;
  const t2 = String(thang).padStart(2, '0');

  // Như B1 (DLM.4): 1509, 10 → 12, khách lẻ chủ tự ghi, 2.200.000đ.
  sql(`with b as (
         insert into public.booking (can_id, ngay_nhan, ngay_tra, nguon, tao_boi, tien_phong, trang_thai_tien)
         values ('${c1509}', '${ng(10)}', '${ng(12)}', 'chu_ghi', '${nguoi}', 2200000, 'chua_coc') returning id)
       insert into public.booking_dem (booking_id, dem, tien)
       select b.id, d, 1100000 from b, unnest(array['${ng(10)}'::date, '${ng(11)}'::date]) d`);

  await dangNhapBangMa(page, chu.email);
  await expect(page.getByRole('heading', { name: `Tháng ${thang}/${nam}` })).toBeVisible();

  // YC5.1 bước 1b: chi tiết ngày 10, dòng 3402 trống có nút "Đặt phòng".
  await page.locator(`[data-ngay="${ng(10)}"]`).click();
  const chiTiet = page.getByRole('region', { name: `Ngày 10/${t2}/${nam}` });
  const d3402 = chiTiet.getByRole('listitem', { name: 'Phòng 3402' });
  await expect(d3402.getByText(/Trống/)).toBeVisible();
  await d3402.getByRole('button', { name: 'Đặt phòng' }).click();

  // CN4 mở với căn 3402, ngày nhận 10, số đêm 1.
  await expect(page.getByRole('heading', { name: 'Thêm đặt phòng' })).toBeVisible();
  await expect(page.getByRole('button', { name: '3402' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByLabel('Ngày nhận phòng')).toHaveValue(ng(10));
  await expect(page.getByLabel('Ngày trả phòng')).toHaveValue(ng(11));
  await expect(page.getByText(`✓ 10/${t2} → 11/${t2} (1 đêm) · không trùng lịch`)).toBeVisible();

  // YC5.1 bước 2, 4: đổi sang 1509 thì trùng với đặt phòng 10 → 12 đã đọc từ database; nút lưu không bấm được.
  await page.getByRole('button', { name: '1509' }).click();
  await expect(page.getByText(`Trùng đêm 10/${t2} với đặt phòng của Khách lẻ (10/${t2} → 12/${t2})`)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Thêm đặt phòng' })).toBeDisabled();

  // Đóng thì về tab Lịch.
  await page.getByRole('button', { name: 'Đóng' }).click();
  await expect(page.getByRole('heading', { name: `Tháng ${thang}/${nam}` })).toBeVisible();
});
