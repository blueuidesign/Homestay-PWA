// Test e2e US60 · Đặt phòng và yêu cầu của sale (YC11.3), trên Supabase chạy ở máy với hộp thư giả. Tên, email đều giả.
// Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase/dat-phong-cua-sale.spec.ts (docs/dev/chay-va-test.md).
import { expect, test } from '@playwright/test';
import { dangNhapBangMa, idCua, sql, taoDatPhongCuaSale, taoTaiKhoan } from './hoTro';

test('YC11.3-NT2 YC11.3-NT6 YC11.3-NT9 luồng chính: sale mở S7-03 từ S7, thấy đặt phòng ghi giúp và yêu cầu bị từ chối', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ Danh Sách');
  const sale = taoTaiKhoan('sale', 'Sale Danh Sách');
  const chuId = idCua(chu.email);
  const saleId = idCua(sale.email);
  sql(`insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon) values ('${chuId}', '${saleId}', 'da_ket_noi', 'link_moi')`);
  const c1509 = sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu) values ('${chuId}', '1509', 2) returning id`).split('\n')[0]!;
  // Chủ ghi 1509 cho sale (YC5.4): giá chủ 2.200.000đ, giá bán của sale 2.600.000đ.
  const nhan = sql(`select to_char(public.local_today() + 3, 'YYYY-MM-DD')`);
  const tra = sql(`select to_char(public.local_today() + 5, 'YYYY-MM-DD')`);
  const b1 = taoDatPhongCuaSale(c1509, chuId, saleId, nhan, tra, 2200000);
  sql(`insert into public.booking_rieng (booking_id, nguoi_id, tien_thu_khach) values ('${b1}', '${saleId}', 2600000)`);
  // Một yêu cầu chủ không nhận (YC9.2).
  sql(`insert into public.yeu_cau_dat_phong (can_id, sale_id, ngay_nhan, ngay_tra, gia_chu_dem, trang_thai, ly_do_tu_choi, tra_loi_luc)
       values ('${c1509}', '${saleId}', public.local_today() + 10, public.local_today() + 11, array[900000], 'bi_tu_choi', 'Đã có khách', now())`);

  await dangNhapBangMa(page, sale.email);
  await page.getByRole('navigation', { name: 'Tab' }).getByRole('button', { name: 'Thống kê' }).click();
  await page.getByRole('button', { name: 'Xem tất cả đặt phòng và yêu cầu' }).click();

  const ds = page.getByRole('region', { name: 'Đặt phòng của tôi' });
  await expect(ds.getByRole('listitem')).toHaveCount(2);
  const ghiGiup = ds.getByRole('button', { name: /Chủ Danh Sách đã ghi giúp bạn · chênh 400\.000đ/ });
  await expect(ghiGiup).toContainText('Đã chốt');
  const tuChoi = ds.getByRole('button', { name: /Chủ không nhận/ });
  await expect(tuChoi).toContainText('Bị từ chối');
  await expect(page.getByText('Chờ chủ → Đã chốt.', { exact: false })).toBeVisible();

  // YC11.3-NT9: chạm yêu cầu bị từ chối mở màn kết quả (S3-05), quay lại về danh sách.
  await tuChoi.click();
  await expect(page.locator('[data-man="S3-05"]')).toBeVisible();
  await page.getByRole('button', { name: 'Quay lại' }).click();
  await expect(page.getByRole('region', { name: 'Đặt phòng của tôi' })).toBeVisible();
});

test('YC11.3 bước 6 sale chưa có yêu cầu nào: S7-03-00, "Tìm phòng" mở tìm phòng', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ Chưa Có');
  const sale = taoTaiKhoan('sale', 'Sale Chưa Có');
  sql(`insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon) values ('${idCua(chu.email)}', '${idCua(sale.email)}', 'da_ket_noi', 'link_moi')`);
  sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu) values ('${idCua(chu.email)}', '3402', 1)`);

  await dangNhapBangMa(page, sale.email);
  await page.getByRole('navigation', { name: 'Tab' }).getByRole('button', { name: 'Thống kê' }).click();
  await page.getByRole('button', { name: 'Xem tất cả đặt phòng và yêu cầu' }).click();
  await expect(page.getByText('Chưa có yêu cầu nào')).toBeVisible();
  await page.locator('section[data-man="S7-03-00"]').getByRole('button', { name: 'Tìm phòng' }).click();
  await expect(page.getByRole('heading', { name: 'Tìm phòng' })).toBeVisible();
});
