// Test e2e US2 · Đăng ký và đăng nhập bằng mã email (YC1.2, QD22), trên Supabase chạy ở máy với hộp thư giả.
// Chạy: E2E_SUPABASE=1 npm run e2e (docs/dev/chay-va-test.md).
import { expect, test, type Page } from '@playwright/test';
import { emailMoi, layMa, nhapMa, soMoi, sql, taoTaiKhoan, thuToi } from './hoTro';

async function moA2(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Tạo tài khoản' }).click();
  await expect(page.getByRole('heading', { name: 'Tạo tài khoản' })).toBeVisible();
}

async function dienA2(page: Page, ten: string, so: string, email: string) {
  await page.getByLabel('Họ và tên').fill(ten);
  await page.getByLabel('Số điện thoại').fill(so);
  await page.getByLabel('Email').fill(email);
  await page.getByRole('button', { name: 'Gửi mã xác nhận' }).click();
}

async function dangNhapA11(page: Page, email: string) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Tôi đã có tài khoản · Đăng nhập' }).click();
  await page.getByLabel('Email').fill(email);
  await page.getByRole('button', { name: 'Gửi mã đăng nhập' }).click();
  await expect(page.getByRole('heading', { name: 'Nhập mã đăng nhập' })).toBeVisible();
  await nhapMa(page, await layMa(email));
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
}

test('YC1.2-NT2 người mới nhập đủ tên, số, email và bấm "Gửi mã xác nhận" thì sang A2-02 và hộp thư nhận mã 6 số', async ({ page }) => {
  const email = emailMoi('moi');
  await moA2(page);
  await dienA2(page, 'Chị Mới', soMoi(), email);
  await expect(page.getByRole('heading', { name: 'Nhập mã xác nhận' })).toBeVisible();
  await expect(page.getByText(`Mã 6 số đã gửi tới ${email}`)).toBeVisible();
  await expect(page.getByText(/Gửi lại mã sau \d+ giây/)).toBeVisible();
  expect(await layMa(email)).toMatch(/^\d{6}$/);
});

test('YC1.2-NT3 nhập sai mã thì thấy A2-03 và không vào app', async ({ page }) => {
  const email = emailMoi('sai');
  await moA2(page);
  await dienA2(page, 'Chị Sai', soMoi(), email);
  const ma = await layMa(email);
  const sai = ma === '000000' ? '111111' : '000000';
  await nhapMa(page, sai);
  await page.getByRole('button', { name: 'Xác nhận' }).click();
  await expect(page.getByText('Mã chưa đúng. Kiểm tra lại thư mới nhất, hoặc bấm "Gửi lại mã".')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Nhập mã xác nhận' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Bạn dùng app để làm gì?' })).toHaveCount(0);
  expect(await page.evaluate(() => Object.keys(localStorage).filter((k) => k.includes('auth-token')).length)).toBe(0);
});

test('YC1.2-NT4 người mới nhập đúng mã thì hồ sơ có đúng tên và số đã nhập và app mở A3', async ({ page }) => {
  const email = emailMoi('dung');
  const so = soMoi();
  await moA2(page);
  await dienA2(page, '  Chị Đúng  ', `${so.slice(0, 4)} ${so.slice(4, 7)} ${so.slice(7)}`, email);
  await nhapMa(page, await layMa(email));
  await page.getByRole('button', { name: 'Xác nhận' }).click();
  await expect(page.getByRole('heading', { name: 'Bạn dùng app để làm gì?' })).toBeVisible();
  expect(sql(`select p.ten || '|' || p.so_dien_thoai from public.profiles p join auth.users u on u.id = p.id where u.email = '${email}'`))
    .toBe(`Chị Đúng|${so}`);
});

test('YC1.2-NT7 người đã có tài khoản đăng nhập ở A11 và nhập đúng mã thì vào thẳng tab Lịch, không thấy A2', async ({ page }) => {
  const { email } = taoTaiKhoan('chu_nha', 'Chủ Cũ');
  const thayA2: string[] = [];
  await dangNhapA11(page, email);
  await expect(page.getByRole('heading', { name: 'Lịch' })).toBeVisible();
  for (const tieuDe of ['Tạo tài khoản', 'Bạn dùng app để làm gì?', 'Nhập lại số điện thoại']) {
    if (await page.getByRole('heading', { name: tieuDe }).count()) thayA2.push(tieuDe);
  }
  expect(thayA2).toEqual([]);
});

test('YC1.2-NT8 đã đăng nhập, đóng trình duyệt rồi mở lại thì vẫn ở trong app', async ({ page, browser }) => {
  const { email } = taoTaiKhoan('sale', 'Sale Cũ');
  await dangNhapA11(page, email);
  await expect(page.getByRole('heading', { name: 'Lịch' })).toBeVisible();
  // Đóng trình duyệt: giữ lại những gì trình duyệt lưu trên máy, mở một phiên trình duyệt mới với đúng dữ liệu đó.
  const luu = await page.context().storageState();
  await page.context().close();
  const moLai = await browser.newContext({ storageState: luu, viewport: { width: 390, height: 844 } });
  const trang = await moLai.newPage();
  await trang.goto('/');
  await expect(trang.getByRole('heading', { name: 'Lịch' })).toBeVisible();
  await expect(trang.getByRole('button', { name: 'Tạo tài khoản' })).toHaveCount(0);
  await moLai.close();
});

test('YC1.2-NT11 ở A2 nhập email đã có tài khoản thì thấy "Email này đã có tài khoản." và nút "Đăng nhập bằng email này"', async ({ page }) => {
  const { email } = taoTaiKhoan('chu_nha', 'Chủ Có Email');
  await moA2(page);
  await dienA2(page, 'Người Khác', soMoi(), email);
  await expect(page.getByText('Email này đã có tài khoản.')).toBeVisible();
  await page.getByRole('button', { name: 'Đăng nhập bằng email này' }).click();
  await expect(page.getByRole('heading', { name: 'Nhập mã đăng nhập' })).toBeVisible();
  await nhapMa(page, await layMa(email));
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(page.getByRole('heading', { name: 'Lịch' })).toBeVisible();
  expect(sql(`select ten from public.profiles p join auth.users u on u.id = p.id where u.email = '${email}'`)).toBe('Chủ Có Email');
});

test('YC1.2-NT12 ở A11 nhập email chưa có tài khoản thì thấy A11-01 và không có tài khoản mới nào được tạo', async ({ page }) => {
  const email = emailMoi('chuaco');
  const truoc = sql('select count(*) from auth.users');
  await page.goto('/');
  await page.getByRole('button', { name: 'Tôi đã có tài khoản · Đăng nhập' }).click();
  await page.getByLabel('Email').fill(email);
  await page.getByRole('button', { name: 'Gửi mã đăng nhập' }).click();
  await expect(page.getByText('Email này chưa có tài khoản. Kiểm tra lại chính tả, hoặc tạo tài khoản mới.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Tạo tài khoản với email này' })).toBeVisible();
  expect(sql(`select count(*) from auth.users where email = '${email}'`)).toBe('0');
  expect(Number(sql('select count(*) from auth.users'))).toBeGreaterThanOrEqual(Number(truoc));
  expect(await thuToi(email)).toHaveLength(0);
});

test('YC1.2 bước 5: số đã thuộc tài khoản khác thì về A2 với lỗi dưới ô số, sửa số thì vào A3', async ({ page }) => {
  const { so: soCu } = taoTaiKhoan('chu_nha', 'Chủ Giữ Số');
  const email = emailMoi('trung');
  await moA2(page);
  await dienA2(page, 'Chị Trùng', soCu, email);
  await nhapMa(page, await layMa(email));
  await page.getByRole('button', { name: 'Xác nhận' }).click();
  await expect(page.getByText('Số này đã có tài khoản. Đăng nhập bằng email của tài khoản đó.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Tạo tài khoản' })).toBeVisible();
  const soMoiNhap = soMoi();
  await page.getByLabel('Số điện thoại').fill(soMoiNhap);
  await page.getByRole('button', { name: 'Lưu' }).click();
  await expect(page.getByRole('heading', { name: 'Bạn dùng app để làm gì?' })).toBeVisible();
  expect(sql(`select p.so_dien_thoai from public.profiles p join auth.users u on u.id = p.id where u.email = '${email}'`)).toBe(soMoiNhap);
});
