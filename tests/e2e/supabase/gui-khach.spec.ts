// Test e2e US48 · Gửi thông tin cho khách (YC8.1), trên Supabase chạy ở máy với hộp thư giả.
// Tên theo DLM (giả), email và số giả. Bảng chia sẻ và bộ nhớ tạm của trình duyệt thay bằng bản ghi lại (addInitScript),
// vì Chromium không giao diện không có bảng chia sẻ. Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase.
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

test('YC8.1-NT1 YC8.1-NT2 YC8.1-NT3 YC8.1-NT13 Sale Hùng chọn 2 căn ở S2, chia sẻ chữ 1509, sao chép chữ cả 2 căn', async ({ page }) => {
  const hung = taoTaiKhoan('sale', 'Sale Hùng');
  const hungId = idCua(hung.email);
  const hoaId = idCua(taoTaiKhoan('chu_nha', 'Chị Hoa').email);
  const nhan = cong(homNay(), 3);
  const tra = cong(nhan, 2);

  // 1509 (ICON40, 2PN, 3 giường, view biển, một ảnh) và 3402 của Chị Hoa: 1.100.000đ mỗi đêm; Hùng cộng mặc định +400k.
  const c1509 = taoCanCoAnh(hoaId, '1509', 'ICON40', 2, 3, 'bien');
  const c3402 = sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu) values ('${hoaId}', '3402', 1) returning id`).split('\n')[0]!;
  for (const id of [c1509, c3402]) {
    sql(`insert into public.gia_thang (can_id, thang, gia_thuong, gia_cuoi_tuan)
         values ('${id}', '${dauThang(nhan)}', 1100000, 1100000), ('${id}', '${dauThang(nhan, 1)}', 1100000, 1100000)`);
  }
  sql(`insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon, pham_vi) values ('${hoaId}', '${hungId}', 'da_ket_noi', 'link_moi', 'tat_ca')`);
  sql(`insert into public.cai_dat_rieng (nguoi_id, muc_cong_mac_dinh) values ('${hungId}', 400000)
       on conflict (nguoi_id) do update set muc_cong_mac_dinh = 400000`);

  await page.addInitScript(() => {
    const w = window as unknown as { daChiaSe: unknown[]; daSaoChep: string[] };
    w.daChiaSe = [];
    w.daSaoChep = [];
    Object.defineProperty(navigator, 'share', { configurable: true, value: async (d: unknown) => { w.daChiaSe.push(d); } });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true, value: { writeText: async (s: string) => { w.daSaoChep.push(s); } },
    });
  });

  await dangNhapBangMa(page, hung.email);
  await expect(page.getByRole('heading', { name: 'Lịch phòng' })).toBeVisible();
  await page.getByRole('button', { name: 'Tìm phòng trống theo ngày' }).click();
  await page.getByLabel('Ngày nhận').fill(nhan);
  await page.getByRole('button', { name: '2 đêm' }).click();
  await page.getByRole('button', { name: 'Tìm phòng trống' }).click();
  await page.getByRole('checkbox', { name: 'Chọn 3402 · 1PN' }).click();
  await page.getByRole('checkbox', { name: 'Chọn ICON40 1509 · 2PN' }).click();
  await page.getByRole('button', { name: 'Gửi cho khách' }).click();

  // YC8.1 bước 2, 3, YC8.1-NT1: hai khối theo thứ tự trên màn (sắp theo tên: 3402 rồi ICON40 1509).
  const s5 = page.locator('[data-man="S5"]');
  await expect(s5.getByRole('heading', { name: 'Gửi cho khách' })).toBeVisible();
  await expect(s5.getByText(`2 căn · ${dm(nhan)} → ${dm(tra)}. Nhiều điện thoại`, { exact: false })).toBeVisible();
  const khoi = s5.getByRole('region');
  await expect(khoi).toHaveCount(2);
  const k1509 = s5.getByRole('region', { name: 'ICON40 1509 · 2PN' });
  await expect(k1509.getByText('1 ảnh', { exact: true })).toBeVisible();
  const chu1509 = `ICON40 1509 · 2PN · 3 giường, view biển\n${dm(nhan)} → ${dm(tra)} (2 đêm): 3.000.000đ`;
  await expect(k1509.getByTestId('chu-can')).toHaveText(chu1509);
  await expect(s5).not.toContainText('2.200.000đ');

  // YC8.1-NT2: "Chia sẻ chữ" ở khối 1509 mở bảng chia sẻ với chữ 1509; database có một lần gửi 1509 cho hai đêm.
  await k1509.getByRole('button', { name: 'Chia sẻ chữ' }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { daChiaSe: unknown[] }).daChiaSe)).toEqual([{ text: chu1509 }]);
  await expect.poll(() => sql(`select count(*) from public.lan_gui_khach where sale_id = '${hungId}' and can_id = '${c1509}'
                               and dem = daterange('${nhan}', '${tra}')`)).toBe('1');

  // YC8.1-NT3, NT13: "Sao chép chữ cả 2 căn" theo mẫu mặc định, thứ tự trên màn; ghi lần gửi cho cả 2 căn.
  await s5.getByRole('button', { name: 'Sao chép chữ cả 2 căn' }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { daSaoChep: string[] }).daSaoChep.length)).toBe(1);
  const tin = await page.evaluate(() => (window as unknown as { daSaoChep: string[] }).daSaoChep[0]!);
  expect(tin.startsWith(`Em gửi anh chị 2 căn còn trống ${dm(nhan)} → ${dm(tra)} (2 đêm):\n1. 3402 · 1PN`)).toBe(true);
  expect(tin).toContain(`2. ${chu1509}`);
  expect(tin.endsWith('Anh chị ưng căn nào báo em giữ phòng nhé.')).toBe(true);
  await expect.poll(() => sql(`select count(*) from public.lan_gui_khach where sale_id = '${hungId}'`)).toBe('2');

  // Quay lại thì về S2, vẫn giữ 2 căn đã chọn.
  await s5.getByRole('button', { name: 'Quay lại' }).click();
  await expect(page.getByText('Đã chọn 2 căn')).toBeVisible();
});
