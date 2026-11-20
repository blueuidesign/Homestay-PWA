// Test e2e US61 · Popup thông báo mới (YC12.1, S1-06), trên Supabase chạy ở máy với hộp thư giả. Tên, email đều giả.
import { expect, test } from '@playwright/test';
import { dangNhapBangMa, idCua, sql, taoTaiKhoan } from './hoTro';

function themTb(nguoi: string, chu: string): void {
  sql(`insert into public.thong_bao (nguoi_nhan, loai, noi_dung, doi_tuong_loai, tao_luc)
       values ('${nguoi}', 'chu_sua_dat_phong', jsonb_build_object('ten_chu', '${chu}', 'ma_can', '1509', 'ten_toa', 'ICON40',
               'ngay_nhan_cu', '2026-10-10', 'ngay_tra_cu', '2026-10-12', 'ngay_nhan', '2026-10-11', 'ngay_tra', '2026-10-13',
               'tien_phong_cu', 2200000, 'tien_phong', 1800000), 'booking', clock_timestamp() + interval '2 seconds')`);
}

test('YC12.1-NT3 YC12.1-NT1 YC12.1-NT4 YC12.1-NT5 luồng chính: mở app không có gì mới thì không popup; có thông báo mới thì popup; đóng thì còn ở P13', async ({ page }) => {
  const hung = taoTaiKhoan('sale', 'Sale Hùng');
  const id = idCua(hung.email);

  // NT3: lần mở đầu chưa có thông báo nào.
  await dangNhapBangMa(page, hung.email);
  await expect(page.getByRole('button', { name: 'Cá nhân', exact: true })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);

  // NT1: Chị Hoa sửa B1, Hùng mở lại app thì popup có dòng đó.
  themTb(id, 'Chị Hoa');
  await page.waitForTimeout(2500); // dòng tạo sau lần mở trước
  await page.reload();
  const popup = page.getByRole('dialog', { name: '1 thông báo mới' });
  await expect(popup).toBeVisible();
  await expect(popup).toContainText('Chị Hoa đã sửa đặt phòng của bạn');
  await expect(popup).toContainText('Giá chủ nhà 2.200.000đ đổi thành 1.800.000đ');

  // NT5: đóng popup thì thông báo vẫn chưa đọc; mở lại app không có gì mới thì không popup.
  await popup.getByRole('button', { name: 'Đóng' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect.poll(() => sql(`select count(*) from public.thong_bao where nguoi_nhan = '${id}' and doc_luc is null`)).toBe('1');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Cá nhân', exact: true })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);

  // NT4: rời app, có việc mới, quay lại từ nền thì popup hiện lại.
  themTb(id, 'Anh Tuấn');
  await page.waitForTimeout(2500);
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await expect(page.getByRole('dialog', { name: '1 thông báo mới' })).toContainText('Anh Tuấn đã sửa đặt phòng của bạn');
});
