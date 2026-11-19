// Test e2e US1 · Màn đầu và chọn vai (YC1.1, HV4), trên Supabase chạy ở máy với hộp thư giả.
// Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase (docs/dev/chay-va-test.md).
import { expect, test, type Page } from '@playwright/test';
import { emailMoi, layMa, nhapMa, soMoi, sql } from './hoTro';

/** A1 → A2 → nhập mã: người mới tạo tài khoản xong (đã có tên và số). */
async function taoTaiKhoanMoi(page: Page, ten: string): Promise<string> {
  const email = emailMoi('vai');
  await page.goto('/');
  await page.getByRole('button', { name: 'Tạo tài khoản' }).click();
  await page.getByLabel('Họ và tên').fill(ten);
  await page.getByLabel('Số điện thoại').fill(soMoi());
  await page.getByLabel('Email').fill(email);
  await page.getByRole('button', { name: 'Gửi mã xác nhận' }).click();
  await nhapMa(page, await layMa(email));
  await page.getByRole('button', { name: 'Xác nhận' }).click();
  return email;
}

const hoSo = (email: string, cot: string) =>
  sql(`select ${cot} from public.profiles p join auth.users u on u.id = p.id where u.email = '${email}'`);

test('YC1.1-NT2 người dùng mới tạo tài khoản xong (đã có tên và số) thì app sang A3', async ({ page }) => {
  const email = await taoTaiKhoanMoi(page, 'Chị Mới Vai');
  await expect(page.getByRole('heading', { name: 'Bạn dùng app để làm gì?' })).toBeVisible();
  await expect(page.getByRole('radio', { name: /Tôi là chủ nhà/ })).toBeVisible();
  await expect(page.getByRole('radio', { name: /Tôi là sale/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Tiếp tục' })).toBeDisabled();
  await expect(page.getByText('Chọn một mục để tiếp tục')).toBeVisible();
  expect(hoSo(email, `p.ten || '|' || (p.so_dien_thoai is not null)::text || '|' || coalesce(p.vai_chon, 'chua')`))
    .toBe('Chị Mới Vai|true|chua');
});

test('YC1.1-NT5 chọn "Tôi là chủ nhà" và bấm "Tiếp tục" thì hồ sơ có vai chủ nhà và lúc đồng ý điều khoản, app mở tab Lịch', async ({ page }) => {
  const email = await taoTaiKhoanMoi(page, 'Chị Chủ Mới');
  await page.getByRole('radio', { name: /Tôi là sale/ }).click();
  await page.getByRole('radio', { name: /Tôi là chủ nhà/ }).click();
  await page.getByRole('button', { name: 'Tiếp tục' }).click();
  await expect(page.getByRole('heading', { name: 'Lịch' })).toBeVisible();
  await expect(page.getByText('Chủ nhà', { exact: true })).toBeVisible();
  expect(hoSo(email, `p.vai_chon || '|' || (p.dong_y_dieu_khoan_luc is not null)::text`)).toBe('chu_nha|true');
  // YC1.1 bước 6: mở lại app thì vào thẳng tab Lịch, không qua A1, A3.
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Lịch' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Bạn dùng app để làm gì?' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Tạo tài khoản' })).toHaveCount(0);
});

test('HV4-NT5 mở app lần đầu và đi hết luồng vào app thì không có hộp thoại quyền nào của trình duyệt', async ({ page }) => {
  // Ghi lại mọi lời xin quyền: hộp thoại của trang và các API của trình duyệt có hỏi người dùng.
  await page.addInitScript(() => {
    const ghi = (ten: string) => { ((window as unknown as { __xinQuyen: string[] }).__xinQuyen ??= []).push(ten); };
    (window as unknown as { __xinQuyen: string[] }).__xinQuyen = [];
    if ('Notification' in window) {
      Notification.requestPermission = (() => { ghi('notification'); return Promise.resolve('denied'); }) as typeof Notification.requestPermission;
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition = () => ghi('geolocation');
      navigator.geolocation.watchPosition = () => { ghi('geolocation'); return 0; };
    }
    if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia = () => { ghi('media'); return Promise.reject(new Error('chặn')); };
    }
    if (navigator.permissions) {
      const truyVan = navigator.permissions.query.bind(navigator.permissions);
      navigator.permissions.query = (d) => { ghi(`query:${d.name}`); return truyVan(d); };
    }
  });
  const hopThoai: string[] = [];
  page.on('dialog', (d) => { hopThoai.push(`${d.type()}: ${d.message()}`); void d.dismiss(); });

  await taoTaiKhoanMoi(page, 'Anh Sale Mới');
  await page.getByRole('radio', { name: /Tôi là sale/ }).click();
  await page.getByRole('button', { name: 'Tiếp tục' }).click();
  await expect(page.getByRole('heading', { name: 'Lịch' })).toBeVisible();
  await expect(page.getByText('Sale', { exact: true })).toBeVisible();

  expect(hopThoai).toEqual([]);
  expect(await page.evaluate(() => (window as unknown as { __xinQuyen: string[] }).__xinQuyen)).toEqual([]);
});
