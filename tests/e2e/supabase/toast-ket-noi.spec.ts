// Test e2e US42 · Toast báo kết nối cho sale (YC6.8), trên Supabase chạy ở máy với hộp thư giả.
// Tên theo DLM (giả), email và số giả. Chủ nhà đồng ý bằng SQL gọi fn_dong_y_xin_lich với phiên của chủ nhà.
// App lấy thông báo mỗi 60 giây và khi quay lại từ nền; test giả lần quay lại từ nền để không phải chờ 60 giây.
// Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase (docs/dev/chay-va-test.md).
import { expect, test, type Page } from '@playwright/test';
import { dangNhapBangMa, idCua, sql, taoCanCoAnh, taoTaiKhoan } from './hoTro';

function taoLinkXinLich(saleId: string): string {
  return sql(`insert into public.link_xin_lich (ma, sale_id) values (public.ma_link_chu_cai(), '${saleId}') returning ma`)
    .split('\n')[0]!;
}

/** Chủ nhà bấm "Đồng ý cho xem lịch" (YC6.5) bằng phiên của chính chủ nhà. */
function dongY(chuId: string, ma: string): void {
  sql(`select set_config('request.jwt.claims', json_build_object('sub', '${chuId}', 'role', 'authenticated')::text, true);
       select public.fn_dong_y_xin_lich('${ma}', true);`);
}

const quayLaiTuNen = (page: Page) => page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));

test('YC6.8-NT1 YC6.8-NT2 YC6.8-NT4 Sale Lan đang mở app: toast Chị Hoa, mở lại không hiện lại, Anh Tuấn đồng ý thì toast gom', async ({ page }) => {
  const lan = taoTaiKhoan('sale', 'Sale Lan');
  const lanId = idCua(lan.email);
  const ma = taoLinkXinLich(lanId);
  const hoaId = idCua(taoTaiKhoan('chu_nha', 'Chị Hoa').email);
  taoCanCoAnh(hoaId, '1509', 'ICON40', 2, 3, 'view biển');
  const tuanId = idCua(taoTaiKhoan('chu_nha', 'Anh Tuấn').email);

  await dangNhapBangMa(page, lan.email);
  await expect(page.getByRole('heading', { name: 'Lịch phòng' })).toBeVisible();
  const toast = page.locator('.a9-toast');
  await expect(toast).toHaveCount(0);

  // YC6.8-NT1: Chị Hoa đồng ý lúc Lan đang mở app.
  dongY(hoaId, ma);
  await quayLaiTuNen(page);
  await expect(toast).toContainText('Chị Hoa đã đồng ý cho bạn xem lịch');
  await expect(toast).toContainText('ICON40 1509 đã vào Nguồn phòng');
  await expect(toast.getByRole('button', { name: 'Xem' })).toBeVisible();

  // YC6.8-NT4: mở lại app thì toast đó không hiện lại.
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Lịch' })).toBeVisible();
  await page.waitForTimeout(1500);
  await expect(toast).toHaveCount(0);

  // YC6.8-NT2: Anh Tuấn đồng ý trong 10 phút: một thông báo gom, toast hiện lại với nội dung mới.
  dongY(tuanId, ma);
  expect(sql(`select count(*) || '|' || max(noi_dung ->> 'so_chu') from public.thong_bao
              where nguoi_nhan = '${lanId}' and loai = 'chu_dong_y_ket_noi'`)).toBe('1|2');
  await quayLaiTuNen(page);
  await expect(toast).toContainText('2 chủ nhà đã đồng ý cho bạn xem lịch');
  await expect(toast).toContainText('Chị Hoa và Anh Tuấn · 1 căn mới trong Nguồn phòng');

  // YC6.8 bước 3: bấm "Xem" thì toast tắt, về lịch của sale.
  await toast.getByRole('button', { name: 'Xem' }).click();
  await expect(toast).toHaveCount(0);
  await expect(page).toHaveURL(/\/$/);
});
