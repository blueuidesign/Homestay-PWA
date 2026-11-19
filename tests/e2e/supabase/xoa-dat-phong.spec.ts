// Test e2e US32 · Xóa đặt phòng khách lẻ (YC5.7), trên Supabase chạy ở máy với hộp thư giả. Tên, email, số đều giả.
// Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase (docs/dev/chay-va-test.md).
// Ngày đặt theo tháng hiện tại (giờ Việt Nam), vì lịch mở sẵn ở tháng của hôm nay.
import { expect, test } from '@playwright/test';
import { dangNhapBangMa, sql, taoTaiKhoan } from './hoTro';

test('YC5.7-NT1 YC5.7-NT2 xóa khách lẻ từ chi tiết ngày 13: hỏi lại, xóa thì về chi tiết ngày 13, đêm trống lại và ghi mới được', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ Xóa Đặt Phòng');
  const nguoi = sql(`select id from auth.users where email = '${chu.email}'`);
  const c1509 = sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu) values ('${nguoi}', '1509', 2) returning id`).split('\n')[0]!;
  const [nam, thang] = sql(`select to_char(public.local_today(), 'YYYY|FMMM')`).split('|').map(Number) as [number, number];
  const t2 = String(thang).padStart(2, '0');
  const ng = (n: number) => `${nam}-${t2}-${String(n).padStart(2, '0')}`;

  // Như B5 (DLM): khách lẻ chủ tự ghi, 1509, 13 → 15, 1.800.000đ.
  const b5 = sql(`with b as (
         insert into public.booking (can_id, ngay_nhan, ngay_tra, nguon, tao_boi, tien_phong, trang_thai_tien)
         values ('${c1509}', '${ng(13)}', '${ng(15)}', 'chu_ghi', '${nguoi}', 1800000, 'chua_coc') returning id),
       d as (insert into public.booking_dem (booking_id, dem, tien)
             select b.id, x, 900000 from b, unnest(array['${ng(13)}'::date, '${ng(14)}'::date]) x)
       select id from b`).split('\n')[0]!;

  await dangNhapBangMa(page, chu.email);
  await expect(page.getByRole('heading', { name: `Tháng ${thang}/${nam}` })).toBeVisible();

  // YC5.7 bước 30: chi tiết ngày 13 → dòng 1509 → CN3-02 → "Xóa đặt phòng".
  await page.locator(`[data-ngay="${ng(13)}"]`).click();
  const chiTietNgay = page.getByRole('region', { name: `Ngày 13/${t2}/${nam}` });
  await chiTietNgay.getByRole('listitem', { name: 'Phòng 1509' }).getByRole('button', { name: 'Phòng 1509' }).click();
  await expect(page).toHaveURL(new RegExp(`/dat-phong/${b5}$`));
  await page.getByRole('button', { name: 'Xóa đặt phòng' }).click();

  // YC5.7-NT1: hỏi lại; chưa xóa.
  const hoi = page.getByRole('alertdialog', { name: 'Xác nhận xóa đặt phòng' });
  await expect(hoi.getByText(`Xác nhận xóa đặt phòng? Ngày 13/${t2} → 15/${t2} của 1509 trống lại.`)).toBeVisible();
  expect(sql(`select count(*) from public.booking where id = '${b5}'`)).toBe('1');

  // YC5.7 bước 31: bấm "Xóa" thì về lại chi tiết ngày 13 với toast.
  await hoi.getByRole('button', { name: 'Xóa' }).click();
  await expect(page.getByText('Đã xóa đặt phòng')).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('region', { name: `Ngày 13/${t2}/${nam}` })).toBeVisible();
  await expect(page.locator(`[data-ngay="${ng(13)}"]`)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator(`[data-ngay="${ng(13)}"]`)).toHaveAttribute('aria-label', 'Ngày 13, trống');
  await expect(page.locator(`[data-ngay="${ng(14)}"]`)).toHaveAttribute('aria-label', 'Ngày 14, trống');
  expect(sql(`select count(*) from public.booking where id = '${b5}'`)).toBe('0');
  expect(sql(`select count(*) from public.booking_dem where booking_id = '${b5}'`)).toBe('0');

  // YC5.7-NT2: ghi đặt phòng mới vào đêm 13, 14 từ dòng 1509 "Trống" của chi tiết ngày 13.
  const d1509 = page.getByRole('region', { name: `Ngày 13/${t2}/${nam}` }).getByRole('listitem', { name: 'Phòng 1509' });
  await expect(d1509.getByText(/Trống/)).toBeVisible();
  await d1509.getByRole('button', { name: 'Đặt phòng' }).click();
  await expect(page.getByRole('heading', { name: 'Thêm đặt phòng' })).toBeVisible();
  await expect(page.getByLabel('Ngày nhận phòng')).toHaveValue(ng(13));
  await page.getByRole('checkbox', { name: '2 đêm' }).click();
  await expect(page.getByText(`✓ 13/${t2} → 15/${t2} (2 đêm) · không trùng lịch`)).toBeVisible();
  await page.getByRole('group', { name: 'Khách / Sale' }).getByRole('button', { name: 'Khách lẻ' }).click();
  await page.getByLabel('Tiền phòng (đ)').fill('1800000');
  await page.getByRole('button', { name: 'Thêm đặt phòng' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Đã thêm đặt phòng Khách lẻ · 1509' })).toBeVisible();
  expect(sql(`select count(*) from public.booking where can_id = '${c1509}' and ngay_nhan = '${ng(13)}' and ngay_tra = '${ng(15)}'`)).toBe('1');
});

test('YC5.7-NT3 đặt phòng có sale: CN3-02 không có nút "Xóa đặt phòng", có "Sửa" và "Xin hủy"', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ Không Xóa Của Sale');
  const sale = taoTaiKhoan('sale', 'Sale Hùng');
  const nguoi = sql(`select id from auth.users where email = '${chu.email}'`);
  const saleId = sql(`select id from auth.users where email = '${sale.email}'`);
  const c1509 = sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu) values ('${nguoi}', '1509', 2) returning id`).split('\n')[0]!;
  sql(`insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon) values ('${nguoi}', '${saleId}', 'da_ket_noi', 'link_moi')`);
  const [nam, thang] = sql(`select to_char(public.local_today(), 'YYYY|FMMM')`).split('|').map(Number) as [number, number];
  const ng = (n: number) => `${nam}-${String(thang).padStart(2, '0')}-${String(n).padStart(2, '0')}`;
  const b1 = sql(`with b as (
         insert into public.booking (can_id, ngay_nhan, ngay_tra, nguon, sale_id, tao_boi, tien_phong, trang_thai_tien)
         values ('${c1509}', '${ng(10)}', '${ng(12)}', 'chu_ghi', '${saleId}', '${nguoi}', 2200000, 'chua_coc') returning id),
       d as (insert into public.booking_dem (booking_id, dem, tien)
             select b.id, x, 1100000 from b, unnest(array['${ng(10)}'::date, '${ng(11)}'::date]) x)
       select id from b`).split('\n')[0]!;

  await dangNhapBangMa(page, chu.email);
  await expect(page.getByRole('heading', { name: `Tháng ${thang}/${nam}` })).toBeVisible();
  await page.goto(`/dat-phong/${b1}`);
  await expect(page.getByRole('heading', { name: 'Đặt phòng · Sale Hùng' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sửa đặt phòng' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Xin hủy' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Xóa đặt phòng' })).toHaveCount(0);
});
