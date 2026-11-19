// Test e2e US36 · Danh sách sale của chủ nhà (YC6.2), trên Supabase chạy ở máy với hộp thư giả. Tên, email, số đều giả.
// Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase (docs/dev/chay-va-test.md).
import { expect, test, type Page } from '@playwright/test';
import { dangNhapBangMa, idCua, sql, taoDatPhongCuaSale, taoTaiKhoan } from './hoTro';

async function moTabSale(page: Page) {
  await page.getByRole('navigation', { name: 'Tab' }).getByRole('button', { name: 'Sale' }).click();
  await expect(page.getByRole('heading', { name: 'Sale', exact: true })).toBeVisible();
}

test('YC6.2-NT2 chủ nhà chưa có sale nào thì thấy CN7-00', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ Chưa Có Sale');
  await dangNhapBangMa(page, chu.email);
  await moTabSale(page);
  await expect(page.getByRole('heading', { name: 'Chưa có sale nào xem lịch' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Chia sẻ link mời' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sao chép link' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Sale sẽ thấy' })).toContainText('Giá từng đêm');
});

test('YC6.2-NT1 NT3 NT8 NT9 NT7 danh sách, thêm, xóa sale tay, ngừng cho xem, sale xóa tài khoản', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ Danh Sách Sale');
  const chuId = idCua(chu.email);
  const ten = ['Sale Hùng', 'Sale Lan', 'Sale Nga', 'Sale Minh'];
  const sale = ten.map((t) => ({ ten: t, ...taoTaiKhoan('sale', t) })).map((s) => ({ ...s, id: idCua(s.email) }));
  for (const s of sale) {
    sql(`insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon) values ('${chuId}', '${s.id}', 'da_ket_noi', 'link_moi')`);
  }
  const [hung, , , minh] = sale as [typeof sale[0], typeof sale[0], typeof sale[0], typeof sale[0]];
  const can = sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu) values ('${chuId}', '1509', 2) returning id`).split('\n')[0]!;
  // Như B1, B3 (DLM.4) của Sale Hùng; một đặt phòng đã hủy (hai bên đồng ý, QD12) không tính vào tổng.
  taoDatPhongCuaSale(can, chuId, hung.id, '2026-10-10', '2026-10-12', 2200000);
  taoDatPhongCuaSale(can, chuId, hung.id, '2026-10-04', '2026-10-06', 1800000);
  const huy = taoDatPhongCuaSale(can, chuId, hung.id, '2026-10-25', '2026-10-26', 1300000);
  sql(`update public.booking set huy_xin_boi = '${chuId}', huy_xin_luc = now() where id = '${huy}'`);
  sql(`update public.booking set huy_tra_loi = 'dong_y', huy_tra_loi_boi = '${hung.id}', huy_tra_loi_luc = now(), trang_thai = 'da_huy' where id = '${huy}'`);

  await dangNhapBangMa(page, chu.email);
  await moTabSale(page);

  // YC6.2-NT1.
  const daKetNoi = page.getByRole('region', { name: 'Đã kết nối · 4' });
  await expect(daKetNoi).toBeVisible();
  for (const t of ten) await expect(daKetNoi.getByText(t, { exact: true })).toBeVisible();
  await expect(daKetNoi.getByRole('button', { name: /Sale Hùng/ })).toContainText('4.000.000đ');

  // YC6.2-NT3: thêm "Sale Phương"; "090 123" bị từ chối.
  await page.getByRole('button', { name: 'Thêm sale' }).click();
  await page.getByLabel('Tên sale *').fill('Sale Phương');
  await page.getByLabel('Số điện thoại *').fill('090 123');
  await page.getByRole('button', { name: 'Lưu sale' }).click();
  await expect(page.getByText('Số điện thoại chưa đúng (10 chữ số, bắt đầu bằng 0)')).toBeVisible();
  await page.getByLabel('Số điện thoại *').fill('0901234567');
  await page.getByRole('button', { name: 'Lưu sale' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Đã thêm Sale Phương' })).toBeVisible();
  const chuaKetNoi = page.getByRole('region', { name: 'Chưa kết nối · 1' });
  await expect(chuaKetNoi.getByText('Sale Phương')).toBeVisible();
  expect(sql(`select so_dien_thoai from public.sale_them_tay where chu_id = '${chuId}'`)).toBe('0901234567');

  // YC6.2-NT8: mở "Sale Phương", xác nhận "Xóa sale này".
  await chuaKetNoi.getByRole('button', { name: /Sale Phương/ }).click();
  await expect(page.getByRole('link', { name: 'Gọi' })).toHaveAttribute('href', 'tel:0901234567');
  await page.getByRole('button', { name: 'Xóa sale này' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Xóa' }).click();
  await expect(page.getByRole('region', { name: 'Đã kết nối · 4' })).toBeVisible();
  await expect(page.getByText('Sale Phương')).toHaveCount(0);
  expect(sql(`select count(*) from public.sale_them_tay where chu_id = '${chuId}'`)).toBe('0');

  // YC6.2 bước 6, YC6.2-NT9: ngừng cho Sale Hùng xem.
  await daKetNoi.getByRole('button', { name: /Sale Hùng/ }).click();
  await expect(page.getByRole('heading', { name: 'Sale Hùng' })).toBeVisible();
  await expect(page.getByText('1509 · 10/10 → 12/10')).toBeVisible();
  await page.getByRole('button', { name: 'Ngừng cho xem lịch' }).click();
  const hoi = page.getByRole('alertdialog');
  await expect(hoi).toContainText('Xác nhận ngừng cho Sale Hùng xem? Đặt phòng cũ vẫn giữ. Sale không thấy lịch của bạn nữa.');
  await hoi.getByRole('button', { name: 'Ngừng cho xem' }).click();
  await expect(page.getByRole('region', { name: 'Đã kết nối · 3' })).toBeVisible();
  const daNgung = page.getByRole('region', { name: 'Đã ngừng · 1' });
  await expect(daNgung.getByText('Sale Hùng')).toBeVisible();
  expect(sql(`select trang_thai from public.ket_noi where chu_id = '${chuId}' and sale_id = '${hung.id}'`)).toBe('chu_ngung');
  expect(sql(`select count(*) from public.thong_bao where nguoi_nhan = '${hung.id}' and loai = 'chu_ngung_cho_xem'`)).toBe('1');
  await daNgung.getByRole('button', { name: /Sale Hùng/ }).click();
  await expect(page.getByText('1509 · 10/10 → 12/10')).toBeVisible();
  await expect(page.getByText('1509 · 04/10 → 06/10')).toBeVisible();
  await expect(page.getByRole('switch', { name: 'Tình trạng cọc' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Ngừng cho xem lịch' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Xóa/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'Quay lại' }).click();

  // YC6.2-NT7: Sale Minh xóa tài khoản (QD13).
  sql(`update public.profiles set so_dien_thoai = null, da_xoa_luc = now() where id = '${minh.id}'`);
  await page.reload();
  await moTabSale(page);
  const dongMinh = page.getByRole('region', { name: 'Đã kết nối · 3' }).getByRole('listitem').filter({ hasText: 'Sale Minh' });
  await expect(dongMinh.getByText('Đã xoá tài khoản')).toBeVisible();
  await expect(dongMinh.getByRole('link')).toHaveCount(0);
  await expect(dongMinh.getByRole('button', { name: /Sale Minh/ })).toHaveCount(0);
  await expect(page.getByText(minh.so)).toHaveCount(0);
});
