// Test e2e US18 · Sửa căn (YC3.5), trên Supabase chạy ở máy có kho file. Tên, email, ảnh đều giả.
// Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase (docs/dev/chay-va-test.md).
import { expect, test, type Page } from '@playwright/test';
import { dangNhapBangMa, sql, taoTaiKhoan } from './hoTro';

const idCua = (email: string) => sql(`select id from auth.users where email = '${email}'`);
// Ảnh PNG 1×1 hợp lệ: trình duyệt vẽ được, app thu về JPEG.
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
const anhPng = (ten: string) => ({ name: ten, mimeType: 'image/png', buffer: PNG });
const thoat = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Thêm căn 1509, 2PN, 3 giường, view biển, mô tả và 3 ảnh qua form Thêm căn (YC3.2 đến YC3.4). */
async function themCan1509(page: Page) {
  await page.getByRole('button', { name: 'Căn', exact: true }).click();
  await page.getByRole('button', { name: /^Thêm căn( đầu tiên| khác)?$/ }).first().click();
  await page.getByLabel(/Mã căn \(tên căn hộ\)/).fill('1509');
  await page.getByRole('button', { name: '2PN', exact: true }).click();
  await page.getByTestId('o-chon-anh').setInputFiles([anhPng('mot.png'), anhPng('hai.png'), anhPng('ba.png')]);
  await expect(page.locator('li[data-tt="xong"]')).toHaveCount(3);
  await page.getByRole('button', { name: /Thêm tòa nhà, mô tả gửi khách, view\.\.\./ }).click();
  await page.getByRole('button', { name: 'Biển', exact: true }).click();
  await page.getByLabel('Số giường').fill('3');
  await page.getByLabel(/Mô tả gửi khách/).fill('Căn góc tầng 15, view biển Bãi Cháy.');
  await page.getByRole('button', { name: 'Thêm căn', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Đã thêm phòng 1509' })).toBeVisible();
}

test('YC3.5-NT1 YC3.5-NT2 chủ nhà mở sửa 1509 thấy đủ các ô; đưa ảnh thứ 2 lên đầu rồi lưu thì ảnh đó là ảnh đại diện', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ Sửa Căn');
  const uid = idCua(chu.email);
  await dangNhapBangMa(page, chu.email);
  await themCan1509(page);
  const canId = sql(`select id from public.can where nguoi_giu = '${uid}' and ma_can = '1509'`);
  const anh = sql(`select string_agg(duong_dan, ',' order by thu_tu) from public.anh_can where can_id = '${canId}'`).split(',');
  expect(anh).toHaveLength(3);

  // YC3.5-NT1: chạm thẻ thì CN5-02 điền sẵn mọi ô.
  await page.getByRole('button', { name: 'Phòng 1509' }).click();
  await expect(page.getByRole('heading', { name: 'Sửa phòng 1509' })).toBeVisible();
  await expect(page.getByLabel(/Mã căn \(tên căn hộ\)/)).toHaveValue('1509');
  await expect(page.getByRole('button', { name: '2PN', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('Ảnh (3)')).toBeVisible();
  const o = page.getByRole('list', { name: 'Ảnh căn' }).locator('li[data-tt]');
  await expect(o).toHaveCount(3);
  for (let i = 0; i < 3; i++) await expect(o.nth(i).locator('img')).toHaveAttribute('src', new RegExp(thoat(anh[i]!)));
  await expect(o.first()).toContainText('Ảnh đại diện');
  await expect(page.getByRole('button', { name: 'Biển', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByLabel('Số giường')).toHaveValue('3');
  await expect(page.getByLabel(/Mô tả gửi khách/)).toHaveValue('Căn góc tầng 15, view biển Bãi Cháy.');

  // YC3.5-NT2: "Đổi thứ tự", đưa ảnh 2 lên trước, lưu.
  await page.getByRole('button', { name: 'Đổi thứ tự' }).click();
  await page.getByRole('button', { name: 'Đưa ảnh 2 lên trước' }).click();
  await expect(o.first().locator('img')).toHaveAttribute('src', new RegExp(thoat(anh[1]!)));
  await page.getByRole('button', { name: 'Lưu thay đổi' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Đã lưu phòng 1509' })).toBeVisible();
  await expect(page).toHaveURL(/\/can$/);
  expect(sql(`select string_agg(duong_dan, ',' order by thu_tu) from public.anh_can where can_id = '${canId}'`))
    .toBe([anh[1], anh[0], anh[2]].join(','));
  const the = page.getByRole('button', { name: 'Phòng 1509' });
  await expect(the.locator('img')).toHaveAttribute('src', new RegExp(thoat(anh[1]!)));
});

test('YC3.5-NT4 sửa số giường 1509 từ 3 thành 2 thì thẻ "2PN · 2 giường"; xóa trống ô rồi lưu thì thẻ "2PN"', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ Sửa Giường');
  const uid = idCua(chu.email);
  await dangNhapBangMa(page, chu.email);
  await themCan1509(page);
  const the = page.getByRole('button', { name: 'Phòng 1509' });
  await expect(the).toContainText('2PN · 3 giường · view biển');

  await the.click();
  await expect(page.getByLabel('Số giường')).toHaveValue('3');
  await page.getByLabel('Số giường').fill('2');
  await page.getByRole('button', { name: 'Lưu thay đổi' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Đã lưu phòng 1509' })).toBeVisible();
  await expect(the).toContainText('2PN · 2 giường · view biển');

  await the.click();
  await expect(page.getByLabel('Số giường')).toHaveValue('2');
  await page.getByLabel('Số giường').fill('');
  await page.getByRole('button', { name: 'Lưu thay đổi' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Đã lưu phòng 1509' })).toBeVisible();
  await expect(the).toContainText('2PN · view biển');
  await expect(the).not.toContainText('giường');
  expect(sql(`select coalesce(so_giuong::text, '-') || '|' || mo_ta from public.can where nguoi_giu = '${uid}' and ma_can = '1509'`))
    .toBe('-|Căn góc tầng 15, view biển Bãi Cháy.');
});

test('YC3.5 bước 40, 41 đổi mã trùng thì ở lại với câu dưới ô mã; quay lại hỏi "Bỏ thay đổi chưa lưu?", bỏ thì căn như cũ', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ Mã Trùng');
  const uid = idCua(chu.email);
  await dangNhapBangMa(page, chu.email);
  await themCan1509(page);
  await page.getByRole('button', { name: /^Thêm căn( khác)?$/ }).first().click();
  await page.getByLabel(/Mã căn \(tên căn hộ\)/).fill('3402');
  await page.getByRole('button', { name: '1PN', exact: true }).click();
  await page.getByRole('button', { name: 'Thêm căn', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Đã thêm phòng 3402' })).toBeVisible();

  await page.getByRole('button', { name: 'Phòng 3402' }).click();
  await page.getByLabel(/Mã căn \(tên căn hộ\)/).fill('1509');
  await page.getByRole('button', { name: 'Lưu thay đổi' }).click();
  await expect(page.getByText('⚠️ Đã có căn 1509. Kiểm tra lại mã căn.')).toBeVisible();
  await expect(page.getByLabel(/Mã căn \(tên căn hộ\)/)).toHaveValue('1509');

  await page.getByRole('button', { name: 'Quay lại' }).click();
  const hoi = page.getByRole('alertdialog');
  await expect(hoi.getByText('Bỏ thay đổi chưa lưu?')).toBeVisible();
  await hoi.getByRole('button', { name: 'Bỏ thay đổi' }).click();
  await expect(page).toHaveURL(/\/can$/);
  expect(sql(`select count(*) from public.can where nguoi_giu = '${uid}' and ma_can = '3402' and an_luc is null`)).toBe('1');
});
