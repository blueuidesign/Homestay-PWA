// Test e2e US14 · Màn đầu tiên và danh sách căn (YC3.1), trên Supabase chạy ở máy với hộp thư giả.
// Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase (docs/dev/chay-va-test.md). Tên, số, email đều giả.
import { expect, test, type Page } from '@playwright/test';
import { layMa, nhapMa, sql, taoTaiKhoan } from './hoTro';

async function dangNhap(page: Page, email: string) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Tôi đã có tài khoản · Đăng nhập' }).click();
  await page.getByLabel('Email').fill(email);
  await page.getByRole('button', { name: 'Gửi mã đăng nhập' }).click();
  await nhapMa(page, await layMa(email));
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
}

const idCua = (email: string) => sql(`select id from auth.users where email = '${email}'`);

/** Thêm căn có lịch cho người giữ, kèm n ảnh (đường dẫn giả trong thư mục của người đó). */
function themCan(nguoi: string, ma: string, phongNgu: number, giuong: number | null, soAnh: number) {
  sql(`with c as (insert into public.can (nguoi_giu, ma_can, so_phong_ngu, so_giuong)
                  values ('${nguoi}', '${ma}', ${phongNgu}, ${giuong ?? 'null'}) returning id)
       insert into public.anh_can (can_id, nguoi_tai, duong_dan, thu_tu)
       select c.id, '${nguoi}', '${nguoi}/' || c.id || '-' || i || '.jpg', i from c, generate_series(1, ${soAnh}) i`);
}

test('YC3.1-NT1 chủ nhà chưa có căn mở tab Lịch thì thấy A4; bấm "Thêm căn đầu tiên" thì mở form Thêm căn', async ({ page }) => {
  const { email } = taoTaiKhoan('chu_nha', 'Chủ Chưa Căn');
  await dangNhap(page, email);
  await expect(page.getByRole('heading', { name: 'Lịch' })).toBeVisible();
  await expect(page.getByText('Chưa có căn nào')).toBeVisible();
  await expect(page.getByText('3 bước để bắt đầu')).toBeVisible();
  await page.getByRole('button', { name: 'Thêm căn đầu tiên' }).click();
  await expect(page.getByRole('heading', { name: 'Thêm căn' })).toBeVisible();
  await expect(page).toHaveURL(/\/can\/moi$/);
});

test('YC3.1-NT2 chủ nhà có 2 căn thì tab Căn ghi "2 căn" và có đúng 2 thẻ; căn của chủ nhà khác không có', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ Hai Căn');
  const khac = taoTaiKhoan('chu_nha', 'Chủ Khác');
  const id = idCua(chu.email);
  themCan(id, '1509', 2, 3, 6);
  themCan(id, '2208', 2, null, 5);
  themCan(idCua(khac.email), '1103', 3, 2, 1);

  await dangNhap(page, chu.email);
  await page.getByRole('button', { name: 'Căn', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Căn của tôi' })).toBeVisible();
  await expect(page.getByText('2 căn')).toBeVisible();
  await expect(page.getByRole('button', { name: /^Phòng / })).toHaveCount(2);
  await expect(page.getByText(/1103/)).toHaveCount(0);

  // YC3.1-NT3: 3 giường thì "2PN · 3 giường"; chưa nhập số giường thì "2PN". YC3.1-NT5: 5 ảnh có gợi ý, 6 ảnh không.
  const the1509 = page.getByRole('button', { name: 'Phòng 1509' });
  const the2208 = page.getByRole('button', { name: 'Phòng 2208' });
  await expect(the1509).toContainText('2PN · 3 giường');
  await expect(the2208.getByText('2PN', { exact: true })).toBeVisible();
  await expect(the2208).not.toContainText('giường');
  await expect(the2208).toContainText('Nên thêm ảnh: sale cần ít nhất 6 ảnh');
  await expect(the1509).not.toContainText('Nên thêm ảnh');
  await expect(the1509).toContainText('Trống hôm nay ✓');
  await expect(the1509).toContainText('Mới thêm');
  await expect(page.locator('.cn5-ds')).not.toContainText(/khách|người lớn|trẻ em/);

  await the1509.click();
  await expect(page.getByRole('heading', { name: 'Phòng 1509' })).toBeVisible();
});
