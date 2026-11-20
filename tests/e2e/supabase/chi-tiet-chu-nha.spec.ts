// Test e2e US55 · Chi tiết chủ nhà và bỏ nguồn (YC10.2), trên Supabase chạy ở máy với hộp thư giả.
// Tên theo DLM (giả), email và số giả. Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase (docs/dev/chay-va-test.md).
import { expect, test } from '@playwright/test';
import { dangNhapBangMa, idCua, sql, taoCanCoAnh, taoTaiKhoan } from './hoTro';

const homNay = () => new Date(Date.now() + 7 * 3_600_000).toISOString().slice(0, 10);
const dauThang = (n: string) => n.slice(0, 8) + '01';

test('YC10.2-NT1 YC10.2-NT2 YC10.2-NT3 YC10.2-NT4 YC10.2-NT6 YC10.2-NT7 sale mở S6-04, bỏ nguồn bằng hai lần bấm, chủ nhà biến khỏi tab Căn', async ({ page }) => {
  const hung = taoTaiKhoan('sale', 'Sale Hùng');
  const hungId = idCua(hung.email);
  const hoaId = idCua(taoTaiKhoan('chu_nha', 'Chị Hoa').email);
  const tuanId = idCua(taoTaiKhoan('chu_nha', 'Anh Tuấn').email);

  // Chị Hoa: 1509 (ICON40, 2PN, 3 giường) có giá tháng này 1.800.000đ mỗi đêm; 3402 chưa đặt giá.
  const c1509 = taoCanCoAnh(hoaId, '1509', 'ICON40', 2, 3, 'bien');
  sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu, loai_view) values ('${hoaId}', '3402', 1, 'bien')`);
  sql(`insert into public.gia_thang (can_id, thang, gia_thuong, gia_cuoi_tuan) values ('${c1509}', '${dauThang(homNay())}', 1800000, 1800000)
       on conflict (can_id, thang) do update set gia_thuong = 1800000, gia_cuoi_tuan = 1800000`);
  taoCanCoAnh(tuanId, '1103', 'Sapphire', 3, 2, 'thanh_pho');
  sql(`insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon, pham_vi, xem_coc)
       values ('${hoaId}', '${hungId}', 'da_ket_noi', 'link_moi', 'tat_ca', false), ('${tuanId}', '${hungId}', 'da_ket_noi', 'link_moi', 'tat_ca', true)`);

  await dangNhapBangMa(page, hung.email);
  await expect(page.getByRole('heading', { name: 'Lịch phòng' })).toBeVisible();
  const tab = page.getByRole('navigation', { name: 'Tab' });
  await tab.getByRole('button', { name: 'Căn' }).click();
  await expect(page.getByRole('heading', { name: 'Chủ nhà đã kết nối · 2' })).toBeVisible();

  // YC10.2-NT1, NT2: S6-04 của Chị Hoa: giá đêm hôm nay của 1509, 3402 không có giá; chủ tắt cọc thì không có dòng đó.
  await page.getByRole('region', { name: 'Chị Hoa' }).getByRole('button', { name: /^Chị Hoa/ }).click();
  const s604 = page.locator('[data-man="S6-04"]');
  await expect(s604.getByRole('button', { name: /^ICON40 1509/ })).toContainText('2PN · 3 giường · view biển · 1.800.000đ/đêm');
  await expect(s604.getByRole('button', { name: /^3402/ })).toContainText('1PN · view biển');
  await expect(s604.getByRole('button', { name: /^3402/ })).not.toContainText('đ/đêm');
  await expect(s604.getByRole('link', { name: 'Gọi' })).toBeVisible();
  await expect(s604.getByText('Giá từng đêm')).toBeVisible();
  await expect(s604.getByText('Đã cọc hay chưa')).toHaveCount(0);
  await expect(s604.getByText('0 đặt phòng')).toBeVisible();

  // YC10.2-NT3: bấm một lần chưa bỏ gì.
  await s604.getByRole('button', { name: 'Bỏ nguồn phòng này' }).click();
  await expect(s604.getByRole('button', { name: 'Xác nhận bỏ Chị Hoa?' })).toBeVisible();
  await expect(s604.getByText('Bạn không thấy lịch của Chị Hoa nữa. Muốn xem lại phải xin link mới.')).toBeVisible();
  expect(sql(`select trang_thai from public.ket_noi where chu_id = '${hoaId}' and sale_id = '${hungId}'`)).toBe('da_ket_noi');

  // YC10.2-NT4: bấm xác nhận thì về S6, Chị Hoa không còn ở nguồn phòng.
  await s604.getByRole('button', { name: 'Xác nhận bỏ Chị Hoa?' }).click();
  await expect(page.getByRole('heading', { name: 'Chủ nhà đã kết nối · 1' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Chị Hoa' })).toHaveCount(0);
  await expect(page.getByRole('region', { name: 'Anh Tuấn' })).toBeVisible();
  expect(sql(`select trang_thai from public.ket_noi where chu_id = '${hoaId}' and sale_id = '${hungId}'`)).toBe('sale_bo');
  await page.reload();
  await page.getByRole('navigation', { name: 'Tab' }).getByRole('button', { name: 'Căn' }).click();
  await expect(page.getByRole('heading', { name: 'Chủ nhà đã kết nối · 1' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Chị Hoa' })).toHaveCount(0);

  // YC10.2-NT7: Hùng đang mở S6-04 của Anh Tuấn thì Anh Tuấn ngừng cho xem; đọc lại thì "Bạn không còn xem được mục này".
  await page.getByRole('region', { name: 'Anh Tuấn' }).getByRole('button', { name: /^Anh Tuấn/ }).click();
  await expect(s604.getByRole('button', { name: /^Sapphire 1103/ })).toBeVisible();
  sql(`update public.ket_noi set trang_thai = 'chu_ngung', ngung_luc = now() where chu_id = '${tuanId}' and sale_id = '${hungId}'`);
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); // HV3 quay lại từ nền
  await expect(s604.getByText('Bạn không còn xem được mục này')).toBeVisible();
  await expect(s604.getByText('Chủ nhà đã ngừng chia sẻ lịch')).toBeVisible();
  await expect(s604).not.toContainText('1103');
  await expect(s604.getByRole('link', { name: 'Gọi' })).toHaveCount(0);
  await s604.getByRole('button', { name: 'Về tab Căn' }).click();
  // YC10.2-NT6: dòng Anh Tuấn ghi "đã ngừng cho bạn xem lịch", không căn; bỏ khỏi danh sách thì biến ngay.
  const tuan = page.getByRole('region', { name: 'Anh Tuấn' });
  await expect(tuan).toContainText('đã ngừng cho bạn xem lịch');
  await expect(tuan).not.toContainText('1103');
  await tuan.getByRole('button', { name: 'Bỏ khỏi danh sách' }).click();
  await expect(page.getByRole('region', { name: 'Anh Tuấn' })).toHaveCount(0);
  await expect.poll(() => sql(`select trang_thai from public.ket_noi where chu_id = '${tuanId}' and sale_id = '${hungId}'`)).toBe('sale_bo');
});
