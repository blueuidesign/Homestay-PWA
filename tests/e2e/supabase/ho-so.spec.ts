// Test e2e US4 · Hồ sơ (YC1.4, P2), trên Supabase chạy ở máy với hộp thư giả. Tên, số, email đều giả.
import { expect, test } from '@playwright/test';
import { dangNhapBangMa, idCua, soMoi, sql, taoTaiKhoan } from './hoTro';

test('YC1.4-NT1 YC1.4-NT2 YC1.4-NT5 luồng chính: Cá nhân mở P2, sửa tên hiển thị và số, lưu; số sai hay trùng thì báo dưới ô', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chị Hoa Thử');
  const khac = taoTaiKhoan('sale', 'Sale Khác');
  const id = idCua(chu.email);

  await dangNhapBangMa(page, chu.email);
  await page.getByRole('button', { name: 'Cá nhân', exact: true }).click();
  await page.getByRole('button', { name: 'Thông tin cá nhân' }).click();
  const p2 = page.locator('[data-man="P2"]');
  await expect(p2.getByRole('heading', { name: 'Thông tin cá nhân' })).toBeVisible();
  await expect(p2.getByText(chu.email)).toBeVisible();

  // NT1, NT2: sửa tên hiển thị và số, lưu, ở lại màn.
  const soMoiGia = soMoi();
  await p2.getByLabel('Tên hiển thị').fill('Chị Hoa Mới');
  await p2.getByLabel('Số điện thoại').fill(soMoiGia);
  await p2.getByRole('button', { name: 'Lưu thay đổi' }).click();
  await expect(page.getByRole('status')).toContainText('Đã lưu thông tin cá nhân');
  await expect(p2.getByRole('heading', { name: 'Thông tin cá nhân' })).toBeVisible();
  await expect.poll(() => sql(`select ten_hien_thi || '|' || so_dien_thoai from public.profiles where id = '${id}'`)).toBe(`Chị Hoa Mới|${soMoiGia}`);

  // NT5: số ngắn thì báo dưới ô, không ghi.
  await p2.getByLabel('Số điện thoại').fill('12345');
  await p2.getByRole('button', { name: 'Lưu thay đổi' }).click();
  await expect(p2.getByText('Số điện thoại cần từ 9 đến 15 chữ số.', { exact: true }).last()).toBeVisible();
  // NT5: số của tài khoản khác thì database từ chối, câu hiện dưới ô.
  const soKhac = sql(`select so_dien_thoai from public.profiles where id = '${idCua(khac.email)}'`);
  await p2.getByLabel('Số điện thoại').fill(soKhac);
  await p2.getByRole('button', { name: 'Lưu thay đổi' }).click();
  await expect(p2.getByText('Số này đã có tài khoản.')).toBeVisible();
  expect(sql(`select so_dien_thoai from public.profiles where id = '${id}'`)).toBe(soMoiGia);

  // Quay lại về Cá nhân, đầu trang ghi tên mới.
  await p2.getByRole('button', { name: 'Quay lại' }).click();
  await expect(page.getByText('Chị Hoa Mới')).toBeVisible();
});
