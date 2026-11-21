// Test e2e US31 · Sửa đặt phòng (YC5.6), trên Supabase chạy ở máy với hộp thư giả. Tên, email, số đều giả.
// Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase (docs/dev/chay-va-test.md).
// Ngày đặt theo tháng hiện tại (giờ Việt Nam), vì lịch mở sẵn ở tháng của hôm nay.
import { expect, test } from '@playwright/test';
import { dangNhapBangMa, sql, taoTaiKhoan } from './hoTro';

test('YC5.6-NT1 YC5.6-NT7 YC5.6-NT11 mở sửa từ chi tiết ngày 13, đổi ngày, lưu thì về lại chi tiết ngày 13; sale được báo', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ Sửa Đặt Phòng');
  const sale = taoTaiKhoan('sale', 'Sale Hùng');
  const nguoi = sql(`select id from auth.users where email = '${chu.email}'`);
  const saleId = sql(`select id from auth.users where email = '${sale.email}'`);
  const c1509 = sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu) values ('${nguoi}', '1509', 2) returning id`).split('\n')[0]!;
  sql(`insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon) values ('${nguoi}', '${saleId}', 'da_ket_noi', 'link_moi')`);
  const [nam, thang] = sql(`select to_char(public.local_today(), 'YYYY|FMMM')`).split('|').map(Number) as [number, number];
  const t2 = String(thang).padStart(2, '0');
  const ng = (n: number) => `${nam}-${t2}-${String(n).padStart(2, '0')}`;

  // Như B1 (DLM): Sale Hùng đứng tên, 2.200.000đ, cọc 1.000.000đ; ở đây 13 → 15 để mở từ chi tiết ngày 13.
  const b1 = sql(`with b as (
         insert into public.booking (can_id, ngay_nhan, ngay_tra, nguon, sale_id, tao_boi, tien_phong, trang_thai_tien, tien_coc)
         values ('${c1509}', '${ng(13)}', '${ng(15)}', 'chu_ghi', '${saleId}', '${nguoi}', 2200000, 'da_coc', 1000000) returning id),
       d as (insert into public.booking_dem (booking_id, dem, tien)
             select b.id, x, 1100000 from b, unnest(array['${ng(13)}'::date, '${ng(14)}'::date]) x)
       select id from b`).split('\n')[0]!;

  await dangNhapBangMa(page, chu.email);
  await expect(page.getByRole('heading', { name: `Tháng ${thang}/${nam}` })).toBeVisible();

  // YC5.6 bước 24: chi tiết ngày 13 → dòng 1509 → CN3-02 → Sửa.
  await page.locator(`[data-ngay="${ng(13)}"]`).click();
  const chiTietNgay = page.getByRole('region', { name: `Ngày 13/${t2}/${nam}` });
  await chiTietNgay.getByRole('listitem', { name: 'Phòng 1509' }).getByRole('button', { name: 'Phòng 1509' }).click();
  await expect(page.getByRole('heading', { name: 'Đặt phòng · Sale Hùng' })).toBeVisible();
  await page.getByRole('button', { name: 'Sửa đặt phòng' }).click();
  await expect(page).toHaveURL(new RegExp(`/dat-phong/${b1}/sua$`));

  // YC5.6-NT1, NT11: mọi ô điền sẵn; người đặt khóa.
  await expect(page.getByRole('heading', { name: 'Sửa đặt phòng · Sale Hùng' })).toBeVisible();
  await expect(page.getByLabel('Ngày nhận phòng')).toHaveValue(ng(13));
  await expect(page.getByLabel('Ngày trả phòng')).toHaveValue(ng(15));
  await expect(page.getByLabel('Tiền phòng (đ)')).toHaveValue('2.200.000');
  await expect(page.getByLabel('Số tiền cọc (đ)')).toHaveValue('1.000.000');
  await expect(page.getByRole('group', { name: 'Khách / Sale' }).getByRole('button', { name: 'Sale Hùng' })).toBeDisabled();
  await expect(page.getByText(`✓ 13/${t2} → 15/${t2} (2 đêm) · không trùng lịch`)).toBeVisible();

  // YC5.6 bước 25, 26: đổi ngày nhận sang 16 (giữ 2 đêm), lưu.
  await page.getByLabel('Ngày nhận phòng').fill(ng(16));
  await expect(page.getByText(`✓ 16/${t2} → 18/${t2} (2 đêm) · không trùng lịch`)).toBeVisible();
  // Bước 7c: đổi ngày thì tiền điền lại theo bảng giá; căn này chưa đặt giá nên ô trống, gõ lại tiền phòng.
  await expect(page.getByLabel('Tiền phòng (đ)')).toHaveValue('');
  await page.getByLabel('Tiền phòng (đ)').fill('2200000');
  await page.getByRole('button', { name: 'Lưu thay đổi' }).click();

  // YC5.6-NT7: về lại chi tiết ngày 13, toast "Đã lưu đặt phòng".
  await expect(page.getByText('Đã lưu đặt phòng')).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('region', { name: `Ngày 13/${t2}/${nam}` })).toBeVisible();
  await expect(page.locator(`[data-ngay="${ng(13)}"]`)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator(`[data-ngay="${ng(16)}"]`)).toHaveAttribute('aria-label', /đã đặt phòng 1509/);

  expect(sql(`select ngay_nhan || '|' || ngay_tra from public.booking where id = '${b1}'`)).toBe(`${ng(16)}|${ng(18)}`);
  // YC5.6-NT5: Sale Hùng có thông báo "chủ sửa đặt phòng" ghi ngày cũ và mới.
  expect(sql(`select (noi_dung->>'ngay_nhan_cu') || '|' || (noi_dung->>'ngay_nhan') from public.thong_bao
              where nguoi_nhan = '${saleId}' and loai = 'chu_sua_dat_phong'`)).toBe(`${ng(13)}|${ng(16)}`);
});

// BG2: mở thẳng địa chỉ (mở lại app ở màn đó, tải lại trang) thì form sửa vẫn tải xong và lưu được.
test('YC5.6-NT1 BG2 mở thẳng địa chỉ chi tiết đặt phòng rồi Sửa: mọi ô điền sẵn, lưu được', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ Mở Thẳng');
  const sale = taoTaiKhoan('sale', 'Sale Hùng');
  const nguoi = sql(`select id from auth.users where email = '${chu.email}'`);
  const saleId = sql(`select id from auth.users where email = '${sale.email}'`);
  const c1509 = sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu) values ('${nguoi}', '1509', 2) returning id`).split('\n')[0]!;
  sql(`insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon) values ('${nguoi}', '${saleId}', 'da_ket_noi', 'link_moi')`);
  const b = sql(`with b as (
         insert into public.booking (can_id, ngay_nhan, ngay_tra, nguon, sale_id, tao_boi, tien_phong, trang_thai_tien)
         values ('${c1509}', public.local_today() + 40, public.local_today() + 42, 'chu_ghi', '${saleId}', '${nguoi}', 2200000, 'chua_coc') returning id),
       d as (insert into public.booking_dem (booking_id, dem, tien)
             select b.id, public.local_today() + x, 1100000 from b, unnest(array[40, 41]) x)
       select id from b`).split('\n')[0]!;

  await dangNhapBangMa(page, chu.email);
  await expect(page.getByRole('navigation', { name: 'Tab' })).toBeVisible();
  await page.goto(`/dat-phong/${b}`);
  await expect(page.getByRole('heading', { name: 'Đặt phòng · Sale Hùng' })).toBeVisible();
  await page.getByRole('button', { name: 'Sửa đặt phòng' }).click();
  await expect(page.getByRole('button', { name: '1509' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByLabel('Tiền phòng (đ)')).toHaveValue('2.200.000');
  await page.getByLabel('Tiền phòng (đ)').fill('2400000');
  await page.getByRole('button', { name: 'Lưu thay đổi' }).click();
  await expect(page.getByText('Đã lưu đặt phòng')).toBeVisible();
  expect(sql(`select tien_phong from public.booking where id = '${b}'`)).toBe('2400000');

  // Tải lại ngay ở màn sửa cũng vậy.
  await page.goto(`/dat-phong/${b}/sua`);
  await expect(page.getByLabel('Tiền phòng (đ)')).toHaveValue('2.400.000');
  await expect(page.getByRole('button', { name: '1509' })).toHaveAttribute('aria-pressed', 'true');
});
