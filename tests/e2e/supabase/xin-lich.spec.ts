// Test e2e US38 · Sale xin chủ nhà cho xem lịch (YC6.4), trên Supabase chạy ở máy với hộp thư giả.
// Tên theo DLM (giả), email và số giả. Bảng chia sẻ của máy thay bằng hàm ghi lại tin (trình duyệt test không có).
// Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase (docs/dev/chay-va-test.md).
import { expect, test, type Page } from '@playwright/test';
import { dangNhapBangMa, idCua, sql, taoTaiKhoan } from './hoTro';

async function giaBangChiaSe(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const w = window as unknown as { __daChiaSe: string[] };
    w.__daChiaSe = [];
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async (d: { text?: string }) => { w.__daChiaSe.push(d.text ?? ''); },
    });
  });
}

const daChiaSe = (page: Page) => page.evaluate(() => (window as unknown as { __daChiaSe: string[] }).__daChiaSe);

test('YC6.4-NT1 YC6.4-NT2 YC6.4-NT3 Sale Hùng mới xin lịch: A5, A6 có tin và link, chia sẻ tăng số, A7 chỉ hai con số', async ({ page }) => {
  await giaBangChiaSe(page);
  const hung = taoTaiKhoan('sale', 'Sale Hùng');
  const hungId = idCua(hung.email);
  await dangNhapBangMa(page, hung.email);

  // A5: sale mới chưa có nguồn phòng.
  await expect(page.getByRole('heading', { name: 'Lịch phòng' })).toBeVisible();
  await expect(page.getByText('Chưa có nguồn phòng')).toBeVisible();

  // YC6.4-NT1: A6 có tin soạn sẵn và link.
  await page.getByRole('button', { name: 'Gửi tin nhắn xin lịch đến chủ nhà' }).click();
  await expect(page.getByRole('heading', { name: 'Xin chủ nhà cho xem lịch' })).toBeVisible();
  const ma = sql(`select ma from public.link_xin_lich where sale_id = '${hungId}'`);
  expect(ma).toMatch(/^[A-Za-z]{32}$/);
  const tin = page.getByRole('region', { name: 'Tin nhắn sẽ gửi' });
  await expect(tin).toContainText('Chào anh/chị, em là Sale Hùng, sale phòng ở Hạ Long.');
  await expect(tin).toContainText(`/x/${ma}`);
  // YC6.4-NT5 (KB3): link không chứa chữ số nào của số điện thoại sale.
  for (const c of new Set(hung.so)) expect(ma).not.toContain(c);
  expect(sql(`select so_lan_gui from public.link_xin_lich where sale_id = '${hungId}'`)).toBe('0');

  // YC6.4-NT2: "Chia sẻ" mở bảng chia sẻ với tin và link, số lần đã gửi tăng 1.
  await page.getByRole('button', { name: 'Chia sẻ' }).click();
  await expect(page.getByText('✓ Đã chia sẻ. Đang chờ chủ nhà đồng ý.')).toBeVisible();
  const ds = await daChiaSe(page);
  expect(ds).toHaveLength(1);
  expect(ds[0]).toContain('Chào anh/chị, em là Sale Hùng');
  expect(ds[0]).toContain(`/x/${ma}`);
  expect(sql(`select so_lan_gui from public.link_xin_lich where sale_id = '${hungId}'`)).toBe('1');

  // YC6.4-NT3: A7 chỉ hai con số, không có danh sách tên chủ nhà.
  await expect(page.getByText('Đang chờ chủ nhà đồng ý', { exact: true })).toBeVisible();
  await expect(page.getByText('Lần gửi gần nhất lúc vừa xong.', { exact: false })).toBeVisible();
  await expect(page.getByRole('group', { name: '1 lần đã chia sẻ' })).toBeVisible();
  await expect(page.getByRole('group', { name: '0 chủ nhà đã đồng ý' })).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(0);

  // YC6.4 bước 5: "Gửi link cho chủ nhà khác" mở lại A6 với cùng link; chia sẻ lần nữa thì 2 lần.
  await page.getByRole('button', { name: 'Gửi link cho chủ nhà khác' }).click();
  await expect(page.getByRole('region', { name: 'Tin nhắn sẽ gửi' })).toContainText(`/x/${ma}`);
  await page.getByRole('button', { name: 'Chia sẻ' }).click();
  await expect(page.getByRole('group', { name: '2 lần đã chia sẻ' })).toBeVisible();

  // HV3: tải lại vẫn thấy số đã ghi ở database.
  await page.reload();
  await expect(page.getByRole('group', { name: '2 lần đã chia sẻ' })).toBeVisible();
});

test('YC6.4 bước 4 Sale Lan mở A6 rồi quay lại chưa gửi: A7-00 "0 lần đã chia sẻ"', async ({ page }) => {
  const lan = taoTaiKhoan('sale', 'Sale Lan');
  await dangNhapBangMa(page, lan.email);
  await page.getByRole('button', { name: 'Gửi tin nhắn xin lịch đến chủ nhà' }).click();
  await expect(page.getByRole('region', { name: 'Tin nhắn sẽ gửi' })).toContainText('/x/');
  await page.getByRole('button', { name: 'Quay lại' }).click();
  await expect(page.getByText('Chưa gửi link xin lịch')).toBeVisible();
  await expect(page.getByRole('group', { name: '0 lần đã chia sẻ' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Gửi tin nhắn xin lịch cho chủ nhà' })).toBeVisible();
});
