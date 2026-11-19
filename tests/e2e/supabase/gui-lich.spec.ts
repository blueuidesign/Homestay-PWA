// Test e2e US40 · Chủ nhà gửi lịch theo căn đã chọn (YC6.6), trên Supabase chạy ở máy với hộp thư giả.
// Tên theo DLM (giả), email và số giả. Bảng chia sẻ của máy được thay bằng bản giả (addInitScript), vì trình duyệt không giao diện
// không có bảng chia sẻ thật. Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase (docs/dev/chay-va-test.md).
import { expect, test, type Browser, type Page } from '@playwright/test';
import { dangNhapBangMa, idCua, sql, taoCanCoAnh, taoTaiKhoan } from './hoTro';

/** Chị Hoa có ICON40 1509 và ICON40 3402. */
function chuHoa() {
  const tk = taoTaiKhoan('chu_nha', 'Chị Hoa');
  const id = idCua(tk.email);
  taoCanCoAnh(id, '1509', 'ICON40', 2, 3, 'view biển');
  taoCanCoAnh(id, '3402', 'ICON40', 2, 2, 'view biển');
  return { ...tk, id };
}

/** Trang có bảng chia sẻ giả: 'gui' thì chia sẻ xong, 'dong' thì người dùng đóng bảng (AbortError). Tin đã chia sẻ ghi ở window. */
async function trangChiaSe(browser: Browser, kieu: 'gui' | 'dong'): Promise<Page> {
  const ctx = await browser.newContext();
  await ctx.addInitScript((k) => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async (d: { text?: string }) => {
        (window as unknown as { tinDaChiaSe: string[] }).tinDaChiaSe ??= [];
        (window as unknown as { tinDaChiaSe: string[] }).tinDaChiaSe.push(d.text ?? '');
        if (k === 'dong') throw new DOMException('đóng', 'AbortError');
      },
    });
  }, kieu);
  return ctx.newPage();
}

async function moCN10(page: Page, email: string) {
  await dangNhapBangMa(page, email);
  await expect(page.getByRole('heading', { name: 'Lịch' })).toBeVisible();
  await page.getByRole('button', { name: /Gửi lịch cho sale/ }).click();
  await expect(page.getByRole('heading', { name: 'Gửi lịch cho sale' })).toBeVisible();
}

test('YC6.6-NT6 YC6.6-NT3 Chị Hoa bỏ chọn hết thì "Chia sẻ lịch" mờ; chọn 1509 rồi gửi thì về tab Lịch với toast "Đã gửi lịch"', async ({ browser }) => {
  const hoa = chuHoa();
  const page = await trangChiaSe(browser, 'gui');
  await moCN10(page, hoa.email);
  await expect(page.getByText('Căn · đã chọn 2/2')).toBeVisible();
  // CN10-00: Chị Hoa chưa lưu sale nào.
  await expect(page.getByText(/Chưa có sale nào đã lưu/)).toBeVisible();

  // YC6.6-NT6.
  await page.getByRole('button', { name: 'Bỏ chọn' }).click();
  await expect(page.getByRole('button', { name: 'Chia sẻ lịch' })).toBeDisabled();
  await expect(page.getByText('Chọn ít nhất một căn')).toBeVisible();
  expect(sql(`select count(*) from public.link_moi where chu_id = '${hoa.id}' and loai = 'gui_lich'`)).toBe('0');

  // YC6.6-NT3.
  await page.getByRole('checkbox', { name: /Phòng 1509/ }).click();
  await page.getByRole('button', { name: 'Chia sẻ lịch' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Đã gửi lịch' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Lịch' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Gửi lịch cho sale' })).toHaveCount(0);

  // YC6.6 bước 4: link gửi lịch mới chỉ có 1509, tin chia sẻ kèm link https trên tên miền đang chạy app.
  const ma = sql(`select ma from public.link_moi where chu_id = '${hoa.id}' and loai = 'gui_lich'`);
  expect(sql(`select string_agg(c.ma_can, ',') from public.link_moi_can lc join public.link_moi l on l.id = lc.link_id
              join public.can c on c.id = lc.can_id where l.ma = '${ma}'`)).toBe('1509');
  const tin = await page.evaluate(() => (window as unknown as { tinDaChiaSe: string[] }).tinDaChiaSe);
  expect(tin[0]).toContain(`${new URL(page.url()).origin}/l/${ma}`);
});

test('YC6.6 CN10-01 đóng bảng chia sẻ mà chưa gửi thì ở lại CN10 với dải báo, không toast', async ({ browser }) => {
  const hoa = chuHoa();
  const page = await trangChiaSe(browser, 'dong');
  await moCN10(page, hoa.email);
  await page.getByRole('button', { name: 'Chia sẻ lịch' }).click();
  await expect(page.getByText(/Bạn chưa gửi\. Bảng chia sẻ đã đóng mà chưa gửi cho ai/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Gửi lịch cho sale' })).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: 'Đã gửi lịch' })).toHaveCount(0);
});

test('YC6.6-NT1 YC6.6-NT7 sale chưa kết nối mở link gửi lịch 1509: xem trước chỉ 1509, không giá; thêm lịch thì chỉ thấy 1509', async ({ page, browser }) => {
  const hoa = chuHoa();
  sql(`insert into public.gia_thang (can_id, thang, gia_thuong, gia_cuoi_tuan)
       select id, date_trunc('month', now())::date, 777000, 888000 from public.can where nguoi_giu = '${hoa.id}'`);
  const chu = await trangChiaSe(browser, 'gui');
  await moCN10(chu, hoa.email);
  await chu.getByRole('checkbox', { name: /Phòng 3402/ }).click();
  await chu.getByRole('button', { name: 'Chia sẻ lịch' }).click();
  await expect(chu.getByRole('status').filter({ hasText: 'Đã gửi lịch' })).toBeVisible();
  const ma = sql(`select ma from public.link_moi where chu_id = '${hoa.id}' and loai = 'gui_lich'`);

  // YC6.6-NT7: người chưa đăng nhập xem trước.
  const khach = await (await browser.newContext()).newPage();
  const xemTruoc = khach.waitForResponse((r) => r.url().includes('/rpc/fn_xem_link_moi'));
  await khach.goto(`/l/${ma}`);
  const body = await (await xemTruoc).text();
  expect(body).toContain('1509');
  expect(body).not.toContain('3402');
  expect(body).not.toMatch(/gia|777000|888000/i);

  // YC6.6-NT1: Sale Phương (chưa kết nối) bấm "Thêm lịch".
  const phuong = taoTaiKhoan('sale', 'Sale Phương');
  const phuongId = idCua(phuong.email);
  await dangNhapBangMa(page, phuong.email);
  await expect(page.getByRole('heading', { name: 'Lịch' })).toBeVisible();
  await page.goto(`/l/${ma}`);
  await expect(page.getByText('Chủ nhà · 1 căn')).toBeVisible();
  await page.getByRole('button', { name: 'Thêm lịch của Chị Hoa' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Đã thêm lịch 1 căn của Chị Hoa' })).toBeVisible();
  expect(sql(`select trang_thai || '|' || nguon || '|' || pham_vi from public.ket_noi
              where chu_id = '${hoa.id}' and sale_id = '${phuongId}'`)).toBe('da_ket_noi|gui_lich|chon_can');
  expect(sql(`select string_agg(c.ma_can, ',') from public.ket_noi_can kc join public.ket_noi k on k.id = kc.ket_noi_id
              join public.can c on c.id = kc.can_id where k.chu_id = '${hoa.id}' and k.sale_id = '${phuongId}'`)).toBe('1509');
});
