// Test e2e US19 · Xóa căn (YC3.6), trên Supabase chạy ở máy với hộp thư giả. Tên, email, số đều giả.
// Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase (docs/dev/chay-va-test.md).
// Ngày theo hôm nay (giờ Việt Nam), vì lịch mở sẵn ở tháng của hôm nay.
import { expect, test } from '@playwright/test';
import { dangNhapBangMa, sql, taoTaiKhoan } from './hoTro';

const idCua = (email: string) => sql(`select id from auth.users where email = '${email}'`);
const themCan = (nguoi: string, ma: string, pn: number) =>
  sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu) values ('${nguoi}', '${ma}', ${pn}) returning id`).split('\n')[0]!;

test('YC3.6-NT12 YC3.6-NT5 YC3.6-NT9 xóa 2105: hỏi lại, "Không" giữ nguyên; "Xóa" thì về tab Căn, 2105 biến khỏi tab Căn, lịch và form đặt phòng', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ Xóa Căn');
  const nguoi = idCua(chu.email);
  themCan(nguoi, '1509', 2);
  const c2105 = themCan(nguoi, '2105', 1);
  const homNay = sql(`select public.local_today()::text`);

  await dangNhapBangMa(page, chu.email);
  await page.getByRole('button', { name: 'Căn', exact: true }).click();
  const the = page.getByRole('button', { name: /^Phòng \d+/ });
  await expect(the).toHaveCount(2);

  // YC3.6-NT12: "Xóa phòng" ở cuối tab Thông tin, hộp hỏi lại; "Không" thì không đổi gì.
  await page.getByRole('button', { name: 'Phòng 2105' }).click();
  await expect(page.getByRole('heading', { name: 'Sửa phòng 2105' })).toBeVisible();
  await page.getByRole('button', { name: 'Xóa phòng' }).click();
  const hoi = page.getByRole('alertdialog', { name: 'Xóa phòng 2105?' });
  await expect(hoi.getByText('Căn sẽ không còn ở lịch và với sale. Đặt phòng cũ và doanh thu vẫn giữ.')).toBeVisible();
  await hoi.getByRole('button', { name: 'Không' }).click();
  await expect(hoi).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Sửa phòng 2105' })).toBeVisible();
  expect(sql(`select an_luc is null from public.can where id = '${c2105}'`)).toBe('t');

  // YC3.6-NT12: "Xóa" thì về tab Căn với toast.
  await page.getByRole('button', { name: 'Xóa phòng' }).click();
  await page.getByRole('alertdialog', { name: 'Xóa phòng 2105?' }).getByRole('button', { name: 'Xóa' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Đã xóa phòng 2105' })).toBeVisible();
  await expect(page).toHaveURL(/\/can$/);
  expect(sql(`select an_luc is not null from public.can where id = '${c2105}'`)).toBe('t');

  // YC3.6-NT5: tab Căn bớt một thẻ. YC3.6-NT9: không có nút hiện lại căn đã xóa.
  await expect(the).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Phòng 2105' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /hiện lại|khôi phục|bỏ xóa|phục hồi/i })).toHaveCount(0);

  // YC3.6-NT5: lịch CN1 (chi tiết ngày hôm nay) không còn 2105.
  await page.getByRole('button', { name: 'Lịch', exact: true }).click();
  await page.locator(`[data-ngay="${homNay}"]`).click();
  const chiTiet = page.locator('section.cn3');
  await expect(chiTiet.getByRole('listitem', { name: 'Phòng 1509' })).toBeVisible();
  await expect(chiTiet.getByRole('listitem', { name: 'Phòng 2105' })).toHaveCount(0);

  // YC3.6-NT5: chip "Phòng" của form đặt phòng không còn 2105.
  await chiTiet.getByRole('listitem', { name: 'Phòng 1509' }).getByRole('button', { name: 'Đặt phòng' }).click();
  await expect(page.getByRole('heading', { name: 'Thêm đặt phòng' })).toBeVisible();
  await expect(page.getByRole('button', { name: '1509', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '2105', exact: true })).toHaveCount(0);
});

test('YC3.6-NT1 xóa 3402 lúc còn đặt phòng sắp tới thì báo "Căn còn đặt phòng sắp tới", ở lại CN5-02, 3402 vẫn ở tab Căn', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ Xóa Căn Còn Khách');
  const nguoi = idCua(chu.email);
  const c3402 = themCan(nguoi, '3402', 1);
  // Như B2 (DLM): 2 đêm, nhận sau hôm nay 10 ngày; ghi là khách lẻ (bộ e2e không có Sale Lan).
  sql(`with b as (
         insert into public.booking (can_id, ngay_nhan, ngay_tra, nguon, tao_boi, tien_phong, trang_thai_tien)
         values ('${c3402}', public.local_today() + 10, public.local_today() + 12, 'chu_ghi', '${nguoi}', 1900000, 'chua_coc')
         returning id, ngay_nhan)
       insert into public.booking_dem (booking_id, dem, tien)
       select b.id, b.ngay_nhan + i, case when i = 0 then 1100000 else 800000 end from b, generate_series(0, 1) i`);

  await dangNhapBangMa(page, chu.email);
  await page.getByRole('button', { name: 'Căn', exact: true }).click();
  await page.getByRole('button', { name: 'Phòng 3402' }).click();
  await page.getByRole('button', { name: 'Xóa phòng' }).click();
  await page.getByRole('alertdialog', { name: 'Xóa phòng 3402?' }).getByRole('button', { name: 'Xóa' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Căn còn đặt phòng sắp tới' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sửa phòng 3402' })).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`/can/${c3402}$`));
  expect(sql(`select an_luc is null from public.can where id = '${c3402}'`)).toBe('t');

  await page.getByRole('button', { name: 'Quay lại' }).click();
  await expect(page.getByRole('button', { name: 'Phòng 3402' })).toBeVisible();
});
