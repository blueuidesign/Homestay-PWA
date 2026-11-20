// Test e2e US8 · Xóa tài khoản (YC1.8, P2, P14, P14-01), trên Supabase chạy ở máy với hộp thư giả. Tên, số, email đều giả.
import { expect, test } from '@playwright/test';
import { idCua, layMa, nhapMa, soMoi, sql, taoCanCoAnh, taoTaiKhoan, dangNhapBangMa } from './hoTro';

test('YC1.8-NT1 YC1.8-NT8 luồng chính: xóa tài khoản về A1, database bỏ số giữ căn; đăng nhập lại nhập lại số thì thấy lại căn', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chị Hoa Thử');
  const id = idCua(chu.email);
  taoCanCoAnh(id, '1509', 'ICON40', 2, 3, 'Biển');

  await dangNhapBangMa(page, chu.email);
  await page.getByRole('button', { name: 'Cá nhân', exact: true }).click();
  await page.getByRole('button', { name: 'Thông tin cá nhân' }).click();
  await page.locator('[data-man="P2"]').getByRole('button', { name: 'Xóa tài khoản' }).click();

  const p14 = page.locator('[data-man="P14"]');
  await expect(p14.getByText(`Xóa tài khoản ${chu.email}. Đọc kỹ điều gì mất, điều gì còn.`)).toBeVisible();
  await p14.getByRole('button', { name: 'Xóa tài khoản' }).click();
  const p1401 = page.locator('[data-man="P14-01"]');
  await expect(p1401.getByRole('button', { name: 'Xác nhận xóa? Bấm lần nữa để xóa. Xóa xong app về màn đầu.' })).toBeVisible();
  expect(sql(`select coalesce(so_dien_thoai, 'null') from public.profiles where id = '${id}'`)).toBe(chu.so);
  await p1401.getByRole('button', { name: 'Xác nhận xóa? Bấm lần nữa để xóa. Xóa xong app về màn đầu.' }).click();

  await expect(page.getByRole('button', { name: 'Tôi đã có tài khoản · Đăng nhập' })).toBeVisible();
  expect(sql(`select coalesce(so_dien_thoai, 'null') || '|' || (da_xoa_luc is not null) from public.profiles where id = '${id}'`)).toBe('null|true');
  expect(sql(`select count(*) from public.can where nguoi_giu = '${id}'`)).toBe('1');

  // NT8: đăng nhập lại cùng email thì vào màn nhập lại số; nhập số thì thấy lại căn.
  await page.getByRole('button', { name: 'Tôi đã có tài khoản · Đăng nhập' }).click();
  await page.getByLabel('Email').fill(chu.email);
  await page.getByRole('button', { name: 'Gửi mã đăng nhập' }).click();
  await nhapMa(page, await layMa(chu.email, 2));
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  const so = soMoi();
  await page.getByLabel('Số điện thoại').fill(so);
  await page.getByRole('button', { name: 'Lưu' }).click();
  await page.getByRole('button', { name: 'Căn', exact: true }).click();
  await expect(page.getByText('1509').first()).toBeVisible();
  expect(sql(`select so_dien_thoai || '|' || (da_xoa_luc is null) from public.profiles where id = '${id}'`)).toBe(`${so}|true`);
});
