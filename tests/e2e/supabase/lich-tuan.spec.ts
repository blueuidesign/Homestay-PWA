// Test e2e US13 · Lịch tuần nhiều căn (YC2.5), trên Supabase chạy ở máy với hộp thư giả. Tên, email đều giả.
// Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase (docs/dev/chay-va-test.md).
// Ngày đặt theo tháng hiện tại (giờ Việt Nam), vì lịch tháng mở sẵn ở tháng của hôm nay.
import { expect, test } from '@playwright/test';
import { dangNhapBangMa, sql, taoTaiKhoan } from './hoTro';

const p2 = (n: number) => String(n).padStart(2, '0');
/** Cộng ngày trên chuỗi 'YYYY-MM-DD' (UTC, không lệch múi giờ). */
const cong = (ngay: string, n: number) => new Date(Date.parse(ngay + 'T00:00:00Z') + n * 864e5).toISOString().slice(0, 10);
const thuHai = (ngay: string) => { const t = new Date(ngay + 'T00:00:00Z').getUTCDay(); return cong(ngay, t === 0 ? -6 : 1 - t); };
/** "12 – 18/10/2026"; vắt qua tháng "28/09 – 04/10/2026" (tuần chứa ngày 14 luôn trong một năm). */
function tenTuan(t2: string): string {
  const cn = cong(t2, 6);
  return t2.slice(5, 7) === cn.slice(5, 7)
    ? `${t2.slice(8)} – ${cn.slice(8)}/${cn.slice(5, 7)}/${cn.slice(0, 4)}`
    : `${t2.slice(8)}/${t2.slice(5, 7)} – ${cn.slice(8)}/${cn.slice(5, 7)}/${cn.slice(0, 4)}`;
}

test('YC2.5-NT6 YC2.5-NT2 YC2.5-NT1 luồng chính: chọn ngày 14 ở lịch tháng, bấm "Tuần", thấy giá và thanh, chạm ô và thanh, bấm "Tháng"', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ Lịch Tuần');
  const nguoi = sql(`select id from auth.users where email = '${chu.email}'`);
  const c1509 = sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu, tao_luc) values ('${nguoi}', '1509', 2, now() - interval '1 day') returning id`).split('\n')[0]!;
  const c3402 = sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu) values ('${nguoi}', '3402', 1) returning id`).split('\n')[0]!;
  const [nam, thang] = sql(`select to_char(public.local_today(), 'YYYY|FMMM')`).split('|').map(Number) as [number, number];
  const ng14 = `${nam}-${p2(thang)}-14`;
  const t2 = thuHai(ng14);
  // Giá DLM.3 tháng này (tuần chứa ngày 14 nằm trong tháng này): 1509 900k / 1,3tr; 3402 chưa đặt giá.
  sql(`insert into public.gia_thang (can_id, thang, gia_thuong, gia_cuoi_tuan) values ('${c1509}', '${nam}-${p2(thang)}-01', 900000, 1300000)`);
  // 3402 có khách hai đêm từ thứ Ba của tuần, Chưa cọc (như B2).
  const nhan = cong(t2, 1);
  const bk = sql(`with b as (
      insert into public.booking (can_id, ngay_nhan, ngay_tra, nguon, tao_boi, tien_phong, trang_thai_tien)
      values ('${c3402}', '${nhan}', '${cong(nhan, 2)}', 'chu_ghi', '${nguoi}', 1600000, 'chua_coc') returning id, ngay_nhan)
    , d as (insert into public.booking_dem (booking_id, dem, tien)
      select b.id, b.ngay_nhan + i, 800000 from b, generate_series(0, 1) i)
    select id from b`).split('\n')[0]!;

  await dangNhapBangMa(page, chu.email);
  await expect(page.getByRole('heading', { name: `Tháng ${thang}/${nam}` })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Tháng', exact: true })).toHaveAttribute('aria-pressed', 'true');

  // YC2.5-NT6: chọn ngày 14 rồi bấm "Tuần" thì mở tuần chứa ngày 14.
  await page.locator(`[data-ngay="${ng14}"]`).click();
  await page.getByRole('button', { name: 'Tuần', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Lịch tuần' })).toBeVisible();
  await expect(page.getByText(tenTuan(t2), { exact: true })).toBeVisible();

  // YC2.5-NT1: mỗi căn một hàng, bảy cột T2 đến CN.
  await expect(page.getByRole('columnheader')).toHaveCount(8);
  await expect(page.getByRole('columnheader').nth(1)).toHaveText(`T2 ${t2.slice(8)}`);
  await expect(page.locator('.cn2-hang-ma')).toHaveText(['1509', '3402']);

  // YC2.5-NT2: ô trống thứ Hai của 1509 là giá chủ nhà "900k"; YC2.5-NT7: 3402 chưa đặt giá thì "–".
  await expect(page.locator(`[data-o="${c1509}|${t2}"]`)).toHaveText('900k');
  await expect(page.locator(`[data-o="${c3402}|${t2}"]`)).toHaveText('–');
  // Thanh của đặt phòng 3402 nối hai cột, nhãn "Chưa cọc"; ô tóm tắt "Chưa cọc 1 đặt phòng".
  await expect(page.locator(`[data-o="${bk}"]`)).toContainText('Chưa cọc');
  await expect(page.getByRole('group', { name: 'Tóm tắt tuần' })).toContainText('1 đặt phòng');

  // YC2.5 bước 23, YC2.5-NT7: chạm ô "–" mở form ghi đặt phòng với căn và ngày đó; quay lại thì về đúng tuần.
  await page.locator(`[data-o="${c3402}|${t2}"]`).click();
  await expect(page).toHaveURL(new RegExp(`/dat-phong/moi/${c3402}/${t2}$`));
  await page.goBack();
  await expect(page.getByText(tenTuan(t2), { exact: true })).toBeVisible();
  // Chạm thanh mở chi tiết đặt phòng.
  await page.locator(`[data-o="${bk}"]`).click();
  await expect(page).toHaveURL(new RegExp(`/dat-phong/${bk}$`));
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Lịch tuần' })).toBeVisible();

  // YC2.5 bước 22: "Sau" sang tuần sau.
  await page.getByRole('button', { name: 'Sau', exact: true }).click();
  await expect(page.getByText(tenTuan(cong(t2, 7)), { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Trước', exact: true }).click();
  await expect(page.getByText(tenTuan(t2), { exact: true })).toBeVisible();

  // YC2.5-NT6: bấm "Tháng" thì về CN1 tháng chứa thứ Hai của tuần.
  await page.getByRole('button', { name: 'Tháng', exact: true }).click();
  await expect(page.getByRole('heading', { name: `Tháng ${Number(t2.slice(5, 7))}/${t2.slice(0, 4)}` })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Tháng', exact: true })).toHaveAttribute('aria-pressed', 'true');
});
