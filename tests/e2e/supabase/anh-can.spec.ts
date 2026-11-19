// Test e2e US16 · Ảnh căn (YC3.3), trên Supabase chạy ở máy có kho file (storage-api). Tên, số, email, ảnh đều giả.
// Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase (docs/dev/chay-va-test.md).
import { expect, test, type Page } from '@playwright/test';
import { dangNhapBangMa, sql, taoTaiKhoan } from './hoTro';

const API = process.env.VITE_SUPABASE_URL ?? 'http://127.0.0.1:54321';
const KHOA_ANON = process.env.VITE_SUPABASE_ANON_KEY ?? '';
const idCua = (email: string) => sql(`select id from auth.users where email = '${email}'`);
// Ảnh PNG 1×1 hợp lệ: trình duyệt vẽ được, app thu về JPEG.
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
const anhPng = (ten: string) => ({ name: ten, mimeType: 'image/png', buffer: PNG });

async function moFormThemCan(page: Page) {
  await page.getByRole('button', { name: 'Căn', exact: true }).click();
  await page.getByRole('button', { name: /^Thêm căn( đầu tiên| khác)?$/ }).first().click();
  await expect(page.getByRole('heading', { name: 'Thêm căn' })).toBeVisible();
}

/** Phiên đăng nhập của trang (supabase-js lưu ở localStorage), để gọi thẳng API kho như người đó. */
async function tokenCua(page: Page): Promise<string> {
  return page.evaluate(() => {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)!;
      if (k.endsWith('-auth-token')) return (JSON.parse(localStorage.getItem(k)!) as { access_token: string }).access_token;
    }
    throw new Error('chưa đăng nhập');
  });
}

async function taiThang(token: string, duongDan: string, loai: string, than: Buffer): Promise<number> {
  const r = await fetch(`${API}/storage/v1/object/anh-can/${duongDan}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, apikey: KHOA_ANON, 'Content-Type': loai, 'x-upsert': 'false' },
    body: than.buffer.slice(than.byteOffset, than.byteOffset + than.byteLength) as ArrayBuffer,
  });
  return r.status;
}

test('YC3.3-NT4 chủ nhà chọn 3 ảnh thì ảnh đầu có nhãn "Ảnh đại diện", lưu xong là ảnh trên thẻ căn; ảnh nằm trong thư mục của người tải', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ Ảnh');
  const uid = idCua(chu.email);
  await dangNhapBangMa(page, chu.email);
  await moFormThemCan(page);
  await page.getByLabel(/Mã căn \(tên căn hộ\)/).fill('2105');
  await page.getByRole('button', { name: '1PN', exact: true }).click();

  await page.getByTestId('o-chon-anh').setInputFiles([anhPng('dau.png'), anhPng('hai.png'), anhPng('ba.png')]);
  await expect(page.getByText('Ảnh (3)')).toBeVisible();
  const o = page.getByRole('list', { name: 'Ảnh căn' }).locator('li[data-tt]');
  await expect(o).toHaveCount(3);
  await expect(o.first()).toContainText('Ảnh đại diện');
  await expect(page.getByText('Ảnh đại diện', { exact: true })).toHaveCount(1);
  await expect(page.getByText('Ảnh đầu tiên là ảnh đại diện · Tối đa 12 ảnh')).toBeVisible();
  await expect(page.locator('li[data-tt="xong"]')).toHaveCount(3);
  await expect(page.getByText(/Chờ tải xong/)).toHaveCount(0);

  await page.getByRole('button', { name: 'Thêm căn', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Đã thêm phòng 2105' })).toBeVisible();
  const the = page.getByRole('button', { name: 'Phòng 2105' });
  await expect(the.locator('img')).toHaveAttribute('src', /\/storage\/v1\/object\/sign\/anh-can\/.+token=/);
  await expect.poll(() => the.locator('img').evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth)).toBeGreaterThan(0);

  // Database: 3 ảnh gắn căn theo thứ tự, file JPEG trong thư mục của người tải (YC3.3 bước 23, 24).
  const canId = sql(`select id from public.can where nguoi_giu = '${uid}' and ma_can = '2105'`);
  expect(sql(`select string_agg(thu_tu::text, ',' order by thu_tu) from public.anh_can where can_id = '${canId}'`)).toBe('1,2,3');
  expect(sql(`select count(*) from public.anh_can a join storage.objects o on o.name = a.duong_dan and o.bucket_id = 'anh-can'
              where a.can_id = '${canId}' and split_part(a.duong_dan, '/', 1) = '${uid}'
                and o.metadata->>'mimetype' = 'image/jpeg'`)).toBe('3');
  const daiDien = sql(`select duong_dan from public.anh_can where can_id = '${canId}' and thu_tu = 1`);
  await expect(the.locator('img')).toHaveAttribute('src', new RegExp(daiDien.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('YC3.3-NT6 chọn file 20 MB hay PDF thì ô đó báo lỗi, không tải; tải thẳng file 20 MB, PDF vào kho cũng bị từ chối', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ File Sai');
  const uid = idCua(chu.email);
  const khac = idCua(taoTaiKhoan('chu_nha', 'Chủ Khác').email);
  await dangNhapBangMa(page, chu.email);
  await moFormThemCan(page);

  await page.getByTestId('o-chon-anh').setInputFiles([
    { name: 'to.jpg', mimeType: 'image/jpeg', buffer: Buffer.alloc(20 * 1024 * 1024, 1) },
    { name: 'hop-dong.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 thu') },
  ]);
  await expect(page.getByText('⚠️ Ảnh phải là JPEG, PNG hoặc HEIC, tối đa 15 MB')).toHaveCount(2);
  await expect(page.getByText(/Đang tải/)).toHaveCount(0);
  expect(sql(`select count(*) from storage.objects where bucket_id = 'anh-can' and name like '${uid}/%'`)).toBe('0');

  // Lệnh gửi thẳng tới kho, bỏ qua app.
  const token = await tokenCua(page);
  expect(await taiThang(token, `${uid}/thang-to.jpg`, 'image/jpeg', Buffer.alloc(20 * 1024 * 1024, 1))).toBeGreaterThanOrEqual(400);
  expect(await taiThang(token, `${uid}/thang.pdf`, 'application/pdf', Buffer.from('%PDF-1.4 thu'))).toBeGreaterThanOrEqual(400);
  // YC3.3-NT5: tải vào thư mục người khác bị từ chối; vào thư mục của mình thì được.
  expect(await taiThang(token, `${khac}/chen.jpg`, 'image/jpeg', PNG)).toBeGreaterThanOrEqual(400);
  expect(await taiThang(token, `${uid}/dung.jpg`, 'image/jpeg', PNG)).toBe(200);
  expect(sql(`select string_agg(name, ',' order by name) from storage.objects where bucket_id = 'anh-can'
              and (name like '${uid}/%' or name like '${khac}/%')`)).toBe(`${uid}/dung.jpg`);
});

test('YC3.3-NT2 ảnh tải lỗi thì ô có "Thử lại" và ✕, chưa thêm được căn; Thử lại tải được thì thêm được', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ Tải Lỗi');
  await dangNhapBangMa(page, chu.email);
  await moFormThemCan(page);
  await page.getByLabel(/Mã căn \(tên căn hộ\)/).fill('3402');
  await page.getByRole('button', { name: '2PN', exact: true }).click();

  await page.route('**/storage/v1/object/anh-can/**', (r) => r.abort('internetdisconnected'));
  await page.getByTestId('o-chon-anh').setInputFiles([anhPng('loi.png')]);
  await expect(page.getByText('⚠️ Tải lỗi')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Bỏ ảnh 1' })).toBeVisible();
  await page.getByRole('button', { name: 'Thêm căn', exact: true }).click();
  await expect(page.getByText('Chưa thêm được căn. Sửa 1 chỗ bên dưới.')).toBeVisible();
  await expect(page).toHaveURL(/\/can\/moi$/);

  await page.unroute('**/storage/v1/object/anh-can/**');
  await page.getByRole('button', { name: 'Thử lại' }).click();
  await expect(page.locator('li[data-tt="xong"]')).toHaveCount(1);
  await page.getByRole('button', { name: 'Thêm căn', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Đã thêm phòng 3402' })).toBeVisible();
  expect(sql(`select count(*) from public.anh_can a join public.can c on c.id = a.can_id
              where c.nguoi_giu = '${idCua(chu.email)}' and c.ma_can = '3402'`)).toBe('1');
});

test('YC3.3-NT3 chọn 15 ảnh khi chưa có ảnh nào thì chỉ nhận 12, toast báo bỏ 3, nút "Thêm ảnh" không bấm được', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ Nhiều Ảnh');
  await dangNhapBangMa(page, chu.email);
  await moFormThemCan(page);
  await page.getByTestId('o-chon-anh').setInputFiles(Array.from({ length: 15 }, (_, i) => anhPng(`a${i + 1}.png`)));
  await expect(page.getByText('Mỗi căn tối đa 12 ảnh. Đã bỏ 3 ảnh.')).toBeVisible();
  await expect(page.getByText('Ảnh (12)')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Thêm ảnh', exact: true })).toBeDisabled();
  await expect(page.locator('li[data-tt="xong"]')).toHaveCount(12, { timeout: 20_000 });
  expect(sql(`select count(*) from public.anh_can where nguoi_tai = '${idCua(chu.email)}' and can_id is null`)).toBe('12');
});
