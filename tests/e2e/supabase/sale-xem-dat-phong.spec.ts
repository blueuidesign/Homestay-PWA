// Test e2e US34 · Phía sale: đặt phòng chủ nhà ghi giúp (YC5.9), trên Supabase chạy ở máy với hộp thư giả. Tên, email đều giả.
// Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase/sale-xem-dat-phong.spec.ts (docs/dev/chay-va-test.md).
import { expect, test } from '@playwright/test';
import { dangNhapBangMa, idCua, sql, taoDatPhongCuaSale, taoTaiKhoan } from './hoTro';

test('YC5.9-NT1 luồng chính: sale mở đặt phòng chủ ghi giúp từ S7-03, sửa giá bán 2.400.000đ thì chênh 600.000đ', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ Ghi Giúp');
  const sale = taoTaiKhoan('sale', 'Sale Xem Giá');
  const chuId = idCua(chu.email);
  const saleId = idCua(sale.email);
  sql(`insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon) values ('${chuId}', '${saleId}', 'da_ket_noi', 'link_moi')`);
  const c = sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu) values ('${chuId}', '1509', 2) returning id`).split('\n')[0]!;
  const nhan = sql(`select to_char(public.local_today() + 3, 'YYYY-MM-DD')`);
  const tra = sql(`select to_char(public.local_today() + 5, 'YYYY-MM-DD')`);
  const b = taoDatPhongCuaSale(c, chuId, saleId, nhan, tra, 1800000);
  sql(`insert into public.booking_rieng (booking_id, nguoi_id, tien_thu_khach) values ('${b}', '${saleId}', 2200000)
       on conflict (booking_id, nguoi_id) do update set tien_thu_khach = excluded.tien_thu_khach`);

  await dangNhapBangMa(page, sale.email);
  await page.getByRole('navigation', { name: 'Tab' }).getByRole('button', { name: 'Thống kê' }).click();
  await page.getByRole('button', { name: 'Xem tất cả đặt phòng và yêu cầu' }).click();
  await page.getByRole('button', { name: /Chủ Ghi Giúp đã ghi giúp bạn · chênh 400\.000đ/ }).click();

  await expect(page.getByTestId('dp-gia-ban')).toHaveText(/2\.200\.000đ/);
  await expect(page.getByTestId('dp-gia-chu')).toHaveText(/1\.800\.000đ/);
  await page.getByRole('button', { name: 'Sửa giá bán' }).click();
  await page.getByRole('textbox', { name: 'Giá bán cho khách' }).fill('2400000');
  await page.getByRole('button', { name: 'Lưu giá bán' }).click();
  await expect(page.getByText('Đã lưu giá bán')).toBeVisible();
  await expect(page.getByTestId('dp-chenh')).toHaveText(/600\.000đ/);
  // YC5.9-NT1: chủ nhà vẫn chỉ thấy tiền phòng, giá bán nằm ở phần riêng của sale.
  expect(sql(`select tien_thu_khach from public.booking_rieng where booking_id = '${b}' and nguoi_id = '${saleId}'`)).toBe('2400000');
  expect(sql(`select tien_phong from public.booking where id = '${b}'`)).toBe('1800000');
});
