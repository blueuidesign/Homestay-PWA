// Test e2e US47 · Mức cộng giá mặc định (YC7.5, P10), trên Supabase chạy ở máy với hộp thư giả. Tên, email đều giả.
// Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase (docs/dev/chay-va-test.md).
import { expect, test } from '@playwright/test';
import { dangNhapBangMa, idCua, sql, taoTaiKhoan } from './hoTro';

test('YC7.5-NT1 YC7.5-NT2 YC7.5-NT5 luồng chính: Cá nhân mở P10, chọn mức, bật làm tròn, lưu, mở lại thấy mức đã lưu', async ({ page }) => {
  const hung = taoTaiKhoan('sale', 'Sale Hùng');
  const hungId = idCua(hung.email);

  await dangNhapBangMa(page, hung.email);
  await page.getByRole('button', { name: 'Cá nhân', exact: true }).click();
  await page.getByRole('button', { name: 'Mức cộng giá mặc định' }).click();

  // YC7.5 bước 1, 2: chưa đặt thì "Không cộng" sáng; bộ chip theo glossary (YC7.5-NT5).
  const p10 = page.locator('[data-man="P10"]');
  await expect(p10.getByRole('heading', { name: 'Mức cộng giá mặc định' })).toBeVisible();
  await expect(p10.getByText('Cộng thêm vào giá chủ nhà mỗi đêm khi soạn tin gửi khách. Khách chỉ thấy giá đã cộng.')).toBeVisible();
  const nhom = p10.getByRole('group', { name: 'Cộng mỗi đêm' });
  await expect(nhom.getByRole('button')).toHaveText(['Không cộng', '+100k', '+200k', '+300k', '+400k', '+500k', 'Tùy chọn']);
  const chip = (ten: string) => nhom.getByRole('button', { name: ten, exact: true });
  await expect(chip('Không cộng')).toHaveAttribute('aria-pressed', 'true');

  // YC7.5-NT2: "Không cộng" thì giá gửi khách bằng giá chủ nhà.
  await expect(page.getByTestId('vd-gia-chu')).toHaveText('2.200.000đ');
  await expect(page.getByTestId('vd-gui-khach')).toHaveText('2.200.000đ');

  // YC7.5-NT1: "+400k" thì ví dụ 2 đêm "Bạn được 800.000đ".
  await chip('+400k').click();
  await expect(page.getByTestId('vd-gui-khach')).toHaveText('3.000.000đ');
  await expect(page.getByTestId('vd-ban-duoc')).toHaveText('800.000đ');

  // YC7.5 bước 3, 5: bật làm tròn, Lưu: toast, về Cá nhân, database ghi.
  await p10.getByRole('checkbox', { name: 'Làm tròn lên 50.000đ' }).click();
  await p10.getByRole('button', { name: 'Lưu thay đổi' }).click();
  await expect(page.getByRole('status')).toContainText('Đã lưu mức cộng');
  await expect(page.getByRole('heading', { name: 'Cá nhân' })).toBeVisible();
  await expect.poll(() => sql(`select muc_cong_mac_dinh || '|' || lam_tron_50k from public.cai_dat_rieng where nguoi_id = '${hungId}'`))
    .toBe('400000|true');

  // Mở lại thấy mức đã lưu.
  await page.getByRole('button', { name: 'Mức cộng giá mặc định' }).click();
  await expect(chip('+400k')).toHaveAttribute('aria-pressed', 'true');
  await expect(p10.getByRole('checkbox', { name: 'Làm tròn lên 50.000đ' })).toHaveAttribute('aria-checked', 'true');

  // YC7-H10: "Tùy chọn" gõ theo nghìn đồng; ngoài khoảng thì Lưu mờ. Rời màn chưa lưu thì mất thay đổi.
  await chip('Tùy chọn').click();
  const o = p10.getByLabel('Mức cộng mỗi đêm, nghìn đồng');
  await o.fill('5001');
  await expect(p10.getByText('Mức cộng từ 0 đến 5.000.000đ')).toBeVisible();
  await expect(p10.getByRole('button', { name: 'Lưu thay đổi' })).toBeDisabled();
  await o.fill('250');
  await expect(page.getByTestId('vd-ban-duoc')).toHaveText('500.000đ');
  await p10.getByRole('button', { name: 'Quay lại' }).click();
  await expect(page.getByRole('heading', { name: 'Cá nhân' })).toBeVisible();
  expect(sql(`select muc_cong_mac_dinh from public.cai_dat_rieng where nguoi_id = '${hungId}'`)).toBe('400000');
});
