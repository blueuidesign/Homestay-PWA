// Test e2e US46 · Chi tiết căn của chủ nhà và giá bán (YC7.4), trên Supabase chạy ở máy với hộp thư giả.
// Tên theo DLM (giả), email và số giả. Giá 1509 đặt cho tháng này và tháng sau để khoảng tìm (3 ngày tới) luôn có giá.
// Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase (docs/dev/chay-va-test.md).
import { expect, test } from '@playwright/test';
import { dangNhapBangMa, idCua, sql, taoCanCoAnh, taoTaiKhoan } from './hoTro';

const homNay = () => new Date(Date.now() + 7 * 3_600_000).toISOString().slice(0, 10);
const cong = (n: string, d: number) => new Date(Date.parse(n + 'T00:00:00Z') + d * 86_400_000).toISOString().slice(0, 10);
const dauThang = (n: string, them = 0) => {
  const d = new Date(Date.parse(n.slice(0, 8) + '01T00:00:00Z'));
  d.setUTCMonth(d.getUTCMonth() + them);
  return d.toISOString().slice(0, 10);
};
const dm = (n: string) => `${n.slice(8, 10)}/${n.slice(5, 7)}`;

test('YC7.4-NT1 YC7.4-NT2 YC7.4-NT3 YC7.4-NT4 Sale Hùng mở 1509 từ kết quả tìm, chọn mức cộng, gửi yêu cầu', async ({ page }) => {
  const hung = taoTaiKhoan('sale', 'Sale Hùng');
  const hungId = idCua(hung.email);
  const hoaId = idCua(taoTaiKhoan('chu_nha', 'Chị Hoa').email);
  const nhan = cong(homNay(), 3);
  const tra = cong(nhan, 2);

  // 1509 của Chị Hoa: ICON40, 2PN, 3 giường, view biển, một ảnh; 1.100.000đ mỗi đêm. 3402 chưa nhập số giường.
  const c1509 = taoCanCoAnh(hoaId, '1509', 'ICON40', 2, 3, 'bien');
  const c3402 = sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu) values ('${hoaId}', '3402', 2) returning id`).split('\n')[0]!;
  for (const id of [c1509, c3402]) {
    sql(`insert into public.gia_thang (can_id, thang, gia_thuong, gia_cuoi_tuan)
         values ('${id}', '${dauThang(nhan)}', 1100000, 1100000), ('${id}', '${dauThang(nhan, 1)}', 1100000, 1100000)`);
  }
  sql(`insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon, pham_vi) values ('${hoaId}', '${hungId}', 'da_ket_noi', 'link_moi', 'tat_ca')`);
  sql(`insert into public.cai_dat_rieng (nguoi_id, muc_cong_mac_dinh) values ('${hungId}', 400000)
       on conflict (nguoi_id) do update set muc_cong_mac_dinh = 400000`);

  await dangNhapBangMa(page, hung.email);
  await expect(page.getByRole('heading', { name: 'Lịch phòng' })).toBeVisible();
  await page.getByRole('button', { name: 'Tìm phòng trống theo ngày' }).click();
  await page.getByLabel('Ngày nhận').fill(nhan);
  await page.getByRole('button', { name: '2 đêm' }).click();
  await page.getByRole('button', { name: 'Tìm phòng trống' }).click();
  await page.getByRole('button', { name: 'ICON40 1509 · 2PN' }).click();

  // YC7.4-NT4: "2PN · 3 giường", không số khách, không tiện ích. Ảnh "1/1", chủ nhà, Gọi.
  const s3 = page.locator('[data-man="S3"]');
  await expect(s3.getByRole('heading', { name: 'ICON40 1509 · 2PN' })).toBeVisible();
  await expect(page.getByTestId('thong-tin')).toHaveText('2PN · 3 giường · view biển');
  await expect(s3).not.toContainText('Tiện ích');
  await expect(s3).not.toContainText(/\d+ khách/);
  await expect(page.getByTestId('so-anh')).toHaveText('1/1');
  await expect(s3.getByText('Chủ nhà · 2 căn')).toBeVisible();
  await expect(s3.getByRole('link', { name: 'Gọi' })).toHaveAttribute('href', /^tel:09\d{8}$/);
  await expect(s3.getByText('Nhận phòng 14:00 · Trả phòng 12:00')).toBeVisible();
  await expect(s3.locator('[data-khach-hoi]')).toHaveCount(2);

  // YC7.4-NT2: thấy cả giá chủ nhà và giá bán (mặc định +400k mỗi đêm).
  await expect(page.getByTestId('khoang')).toHaveText(`${dm(nhan)} → ${dm(tra)} (2 đêm)`);
  await expect(page.getByTestId('gia-chu')).toHaveText('Giá chủ nhà 2.200.000đ');
  await expect(page.getByTestId('gia-ban')).toHaveText('3.000.000đ');
  const chip = (ten: string) => s3.getByRole('group', { name: 'Cộng thêm cho bạn' }).getByRole('button', { name: ten, exact: false });

  // YC7.4-NT1: chọn "+200k": 2.200.000đ + 200.000đ × 2 = 2.600.000đ; database đã ghi.
  await chip('+200k').click();
  await expect(page.getByTestId('gia-ban')).toHaveText('2.600.000đ');
  await expect.poll(() => sql(`select muc from public.muc_cong where sale_id = '${hungId}' and can_id = '${c1509}'`)).toBe('200000');
  await expect(chip('+200k')).toHaveAttribute('aria-pressed', 'true');

  // YC7.4-NT7 (luồng): chọn "Mặc định" thì về 3.000.000đ, mức riêng bị xóa.
  await chip('Mặc định +400k').click();
  await expect(page.getByTestId('gia-ban')).toHaveText('3.000.000đ');
  await expect.poll(() => sql(`select count(*) from public.muc_cong where sale_id = '${hungId}' and can_id = '${c1509}'`)).toBe('0');

  // YC7.4-NT3: "Gửi yêu cầu đặt phòng" mở S3-02 với đúng căn và ngày.
  await page.getByRole('button', { name: 'Gửi yêu cầu đặt phòng' }).click();
  const s302 = page.locator('[data-man="S3-02"]');
  await expect(s302).toHaveAttribute('data-can', c1509);
  await expect(s302).toHaveAttribute('data-tu', nhan);
  await expect(s302).toHaveAttribute('data-den', tra);
  await expect(page.getByTestId('s302-khoang')).toHaveText(`${dm(nhan)} → ${dm(tra)} (2 đêm)`);
  await page.getByRole('button', { name: 'Quay lại' }).click();
  await page.getByRole('button', { name: 'Quay lại' }).first().click();

  // YC7.4-NT4: 3402 chưa nhập số giường thì chỉ "2PN".
  await page.getByRole('button', { name: '3402 · 2PN' }).click();
  await expect(page.getByTestId('thong-tin')).toHaveText('2PN');
});
