// Test e2e US54 · Tab Căn của sale (YC10.1), trên Supabase chạy ở máy với hộp thư giả.
// Tên theo DLM (giả), email và số giả. Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase (docs/dev/chay-va-test.md).
import { expect, test } from '@playwright/test';
import { dangNhapBangMa, idCua, sql, taoCanCoAnh, taoTaiKhoan } from './hoTro';

const homNay = () => new Date(Date.now() + 7 * 3_600_000).toISOString().slice(0, 10);
const dauThang = (n: string, them = 0) => {
  const d = new Date(Date.parse(n.slice(0, 8) + '01T00:00:00Z'));
  d.setUTCMonth(d.getUTCMonth() + them);
  return d.toISOString().slice(0, 10);
};

test('YC10.1-NT1 YC10.1-NT4 YC10.1-NT5 YC10.1-NT7 YC10.1-NT8 Sale Hùng mở tab Căn thấy ba nhóm, chạm căn của tôi mở S6-07', async ({ page }) => {
  const hung = taoTaiKhoan('sale', 'Sale Hùng');
  const hungId = idCua(hung.email);
  const hoaId = idCua(taoTaiKhoan('chu_nha', 'Chị Hoa').email);
  const tuanId = idCua(taoTaiKhoan('chu_nha', 'Anh Tuấn').email);

  // Căn của Hùng: Green Bay 0812 (2PN, view biển), Mường Thanh 1605; giá đêm của Hùng 750k thường, 900k cuối tuần.
  for (const t of ['Green Bay', 'Mường Thanh']) sql(`insert into public.toa_nha (ten, home247_dat_san) values ('${t}', true) on conflict do nothing`);
  const g0812 = sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu, loai_view, toa_nha_id)
                     select '${hungId}', '0812', 2, 'bien', id from public.toa_nha where lower(ten) = 'green bay' returning id`).split('\n')[0]!;
  sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu, loai_view, toa_nha_id)
       select '${hungId}', '1605', 1, 'bien', id from public.toa_nha where lower(ten) = 'mường thanh'`);
  sql(`insert into public.gia_thang (can_id, thang, gia_thuong, gia_cuoi_tuan)
       values ('${g0812}', '${dauThang(homNay())}', 750000, 900000), ('${g0812}', '${dauThang(homNay(), 1)}', 750000, 900000)`);
  sql(`insert into public.can (nguoi_giu, loai, ma_can, chu_can_ten, chu_can_sdt, gia_chu_thuong)
       values ('${hungId}', 'tu_nhap', 'Villa Tuần Châu', 'Chú Bình', '0900000099', 1400000)`);
  // Nguồn phòng: Chị Hoa (1509 ICON40 2PN 3 giường), Anh Tuấn (Sapphire 1103).
  taoCanCoAnh(hoaId, '1509', 'ICON40', 2, 3, 'bien');
  taoCanCoAnh(tuanId, '1103', 'Sapphire', 3, 2, 'thanh_pho');
  sql(`insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon, pham_vi)
       values ('${hoaId}', '${hungId}', 'da_ket_noi', 'link_moi', 'tat_ca'), ('${tuanId}', '${hungId}', 'da_ket_noi', 'link_moi', 'tat_ca')`);

  await dangNhapBangMa(page, hung.email);
  await expect(page.getByRole('heading', { name: 'Lịch phòng' })).toBeVisible();
  await page.getByRole('navigation', { name: 'Tab' }).getByRole('button', { name: 'Căn' }).click();

  // YC10.1-NT1: ba nhóm với số đếm 2, 2 và 1.
  await expect(page.getByRole('heading', { name: 'Căn của tôi · 2' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Chủ nhà đã kết nối · 2' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Căn tự nhập · 1' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'ICON40 1509' })).toContainText('2PN · 3 giường · view biển');
  await expect(page.getByRole('button', { name: 'Villa Tuần Châu' })).toContainText('Chú Bình · chưa dùng app · gọi hỏi lịch');
  await expect(page.getByRole('region', { name: 'Chị Hoa' })).toContainText('✓ Cập nhật');

  // YC10.1-NT4: chạm 1509 mở S3, không mở S6-07.
  await page.getByRole('button', { name: 'ICON40 1509' }).click();
  await expect(page.locator('[data-man="S3"]')).toBeVisible();
  await expect(page.locator('[data-man="S6-07"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Quay lại' }).click();

  // YC10.1-NT5: chạm Green Bay 0812 mở S6-07 với ba việc.
  await page.getByRole('button', { name: 'Green Bay 0812' }).click();
  const s607 = page.locator('[data-man="S6-07"]');
  await expect(s607.getByText('Căn của tôi', { exact: true })).toBeVisible();
  await expect(s607.getByText('Bạn tự ghi lịch và giá cho căn này, như chủ nhà.')).toBeVisible();
  await expect(s607.getByTestId('o-ngay')).toHaveCount(7);
  await expect(s607.getByTestId('o-ngay').first()).toContainText('Nay');
  for (const v of ['Đặt phòng', 'Sửa căn và giá', 'Gửi cho khách']) await expect(s607.getByRole('button', { name: new RegExp(`^${v}`) })).toBeVisible();
  await s607.getByRole('button', { name: 'Quay lại' }).click();

  // YC10.1-NT7, NT8: Chị Hoa xóa tài khoản; dòng S6-08 không có căn; bỏ khỏi danh sách thì biến, đọc lại vẫn không còn.
  sql(`update public.profiles set so_dien_thoai = null, da_xoa_luc = now() where id = '${hoaId}'`);
  await page.getByRole('navigation', { name: 'Tab' }).getByRole('button', { name: 'Lịch' }).click();
  await page.getByRole('navigation', { name: 'Tab' }).getByRole('button', { name: 'Căn' }).click();
  await expect(page.getByRole('heading', { name: 'Chủ nhà đã kết nối · 1' })).toBeVisible();
  const hoa = page.getByRole('region', { name: 'Chị Hoa' });
  await expect(hoa).toContainText('đã xóa tài khoản');
  await expect(hoa).not.toContainText('1509');
  await hoa.getByRole('button', { name: 'Bỏ khỏi danh sách' }).click();
  await expect(page.getByRole('region', { name: 'Chị Hoa' })).toHaveCount(0);
  await expect.poll(() => sql(`select trang_thai from public.ket_noi where chu_id = '${hoaId}' and sale_id = '${hungId}'`)).toBe('sale_bo');
  await page.reload();
  await page.getByRole('navigation', { name: 'Tab' }).getByRole('button', { name: 'Căn' }).click();
  await expect(page.getByRole('heading', { name: 'Chủ nhà đã kết nối · 1' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Chị Hoa' })).toHaveCount(0);
});
