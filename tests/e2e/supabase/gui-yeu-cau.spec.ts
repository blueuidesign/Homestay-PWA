// Test e2e US50 · Sale gửi và hủy yêu cầu đặt phòng (YC9.1), trên Supabase chạy ở máy với hộp thư giả.
// Tên theo DLM (giả), email và số giả. Giá 1509 đặt cho tháng này và tháng sau để khoảng gửi (3 ngày tới) luôn có giá.
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

test('YC9.1-NT1 YC9.1-NT3 YC9.1-NT7 Sale Hùng gửi yêu cầu 1509 rồi hủy', async ({ page }) => {
  const hung = taoTaiKhoan('sale', 'Sale Hùng');
  const hungId = idCua(hung.email);
  const hoaId = idCua(taoTaiKhoan('chu_nha', 'Chị Hoa').email);
  const nhan = cong(homNay(), 3);
  const tra = cong(nhan, 2);

  // 1509 của Chị Hoa: 1.100.000đ mỗi đêm; Hùng mặc định +400k: giá bán 3.000.000đ cho 2 đêm.
  const c1509 = taoCanCoAnh(hoaId, '1509', 'ICON40', 2, 3, 'bien');
  sql(`insert into public.gia_thang (can_id, thang, gia_thuong, gia_cuoi_tuan)
       values ('${c1509}', '${dauThang(nhan)}', 1100000, 1100000), ('${c1509}', '${dauThang(nhan, 1)}', 1100000, 1100000)`);
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
  await expect(page.getByTestId('gia-ban')).toHaveText('3.000.000đ');
  await page.locator('[data-man="S3"]').getByRole('button', { name: 'Gửi yêu cầu đặt phòng' }).click();

  // YC9.1-NT3: S3-02 có cả giá bán cho khách và giá chủ nhà.
  const s302 = page.locator('[data-man="S3-02"]');
  await expect(s302.getByRole('heading', { name: 'Gửi yêu cầu đặt phòng' })).toBeVisible();
  await expect(page.getByTestId('dong-chu')).toHaveText(`Chị Hoa · ${dm(nhan)} → ${dm(tra)} (2 đêm)`);
  await expect(page.getByTestId('gia-ban-yc')).toContainText('3.000.000đ');
  await expect(page.getByTestId('gia-chu-yc')).toContainText('2.200.000đ');
  await s302.getByLabel('Nhắn chủ nhà (không bắt buộc)').fill('Khách tới muộn');
  await s302.getByRole('button', { name: 'Gửi yêu cầu đặt phòng' }).click();

  // YC9.1-NT1: sang S3-03, ghi giờ đã gửi; database có yêu cầu chờ với giá do database tính, thông báo cho Chị Hoa.
  const s303 = page.locator('[data-man="S3-03"]');
  await expect(s303.getByText('Đang chờ Chị Hoa chấp nhận')).toBeVisible();
  await expect(s303.getByText(/^Đã gửi lúc \d{2}:\d{2} trong app\./)).toBeVisible();
  await expect(s303.getByRole('link', { name: 'Nhắn chủ nhà qua Zalo' })).toHaveAttribute('href', /^https:\/\/zalo\.me\/09\d{8}$/);
  await expect(s303.getByRole('link', { name: 'Gọi chủ nhà' })).toHaveAttribute('href', /^tel:09\d{8}$/);
  expect(sql(`select trang_thai || '|' || array_to_string(gia_chu_dem, ',') || '|' || loi_nhan from public.yeu_cau_dat_phong
              where sale_id = '${hungId}' and can_id = '${c1509}'`)).toBe('cho|1100000,1100000|Khách tới muộn');
  expect(sql(`select count(*) from public.thong_bao where nguoi_nhan = '${hoaId}' and loai = 'yeu_cau_moi'`)).toBe('1');

  // YC9.1-NT7: "Hủy yêu cầu" bấm hai lần thì sang S3-08; database ghi Đã hủy, Chị Hoa không có thông báo mới.
  await s303.getByRole('button', { name: 'Hủy yêu cầu' }).click();
  await s303.getByRole('button', { name: 'Xác nhận hủy yêu cầu?' }).click();
  const s308 = page.locator('[data-man="S3-08"]');
  await expect(s308.getByText(`Bạn đã hủy yêu cầu đặt phòng ${dm(nhan)} → ${dm(tra)}. Chị Hoa không còn thấy yêu cầu này.`)).toBeVisible();
  await expect.poll(() => sql(`select trang_thai from public.yeu_cau_dat_phong where sale_id = '${hungId}' and can_id = '${c1509}'`)).toBe('da_huy');
  expect(sql(`select count(*) from public.thong_bao where nguoi_nhan = '${hoaId}'`)).toBe('1');
  await s308.getByRole('button', { name: 'Về lịch phòng' }).click();
  await expect(page.getByRole('heading', { name: 'Lịch phòng' })).toBeVisible();
});
