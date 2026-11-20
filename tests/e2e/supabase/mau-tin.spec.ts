// Test e2e US49 · Mẫu tin gửi khách (YC8.2, P11), trên Supabase chạy ở máy với hộp thư giả. Tên theo DLM (giả), email giả.
// Bộ nhớ tạm của trình duyệt thay bằng bản ghi lại (addInitScript). Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase.
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

test('YC8.2-NT1 YC8.2-NT2 YC8.2-NT3 YC8.2-NT5 luồng chính: P11 sửa mẫu, chèn ô, lưu; S5 sao chép cả N căn theo mẫu đã lưu', async ({ page }) => {
  const hung = taoTaiKhoan('sale', 'Sale Hùng');
  const hungId = idCua(hung.email);
  const hoaId = idCua(taoTaiKhoan('chu_nha', 'Chị Hoa').email);
  const nhan = cong(homNay(), 3);
  const tra = cong(nhan, 2);

  // 1509 (ICON40, 2PN, 3 giường, view biển) của Chị Hoa: 1.100.000đ mỗi đêm, chia sẻ cho Hùng; Hùng không cộng.
  const c1509 = taoCanCoAnh(hoaId, '1509', 'ICON40', 2, 3, 'bien');
  sql(`insert into public.gia_thang (can_id, thang, gia_thuong, gia_cuoi_tuan)
       values ('${c1509}', '${dauThang(nhan)}', 1100000, 1100000), ('${c1509}', '${dauThang(nhan, 1)}', 1100000, 1100000)`);
  sql(`insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon, pham_vi) values ('${hoaId}', '${hungId}', 'da_ket_noi', 'link_moi', 'tat_ca')`);

  await page.addInitScript(() => {
    const w = window as unknown as { daSaoChep: string[] };
    w.daSaoChep = [];
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true, value: { writeText: async (s: string) => { w.daSaoChep.push(s); } },
    });
  });

  await dangNhapBangMa(page, hung.email);
  await page.getByRole('button', { name: 'Cá nhân', exact: true }).click();
  await page.getByRole('button', { name: 'Mẫu tin gửi khách' }).click();

  // YC8.2 bước 1, 3: chưa có mẫu riêng thì mẫu mặc định; bản xem trước 3 căn 10/10 → 12/10.
  const p11 = page.locator('[data-man="P11"]');
  await expect(p11.getByRole('heading', { name: 'Mẫu tin gửi khách' })).toBeVisible();
  const o = p11.getByRole('textbox', { name: 'Mẫu tin' });
  await expect(o).toHaveValue('Em gửi anh chị [Số căn] căn còn trống [Ngày] ([Số đêm]):\n[Danh sách căn]\nAnh chị ưng căn nào báo em giữ phòng nhé.');
  const xem = p11.getByTestId('xem-truoc');
  await expect(xem).toContainText('Em gửi anh chị 3 căn còn trống 10/10 → 12/10 (2 đêm):');
  await expect(p11.getByRole('group', { name: 'Chạm để chèn' }).getByRole('button'))
    .toHaveText(['[Ngày]', '[Số đêm]', '[Số căn]', '[Danh sách căn]', '[Tên sale]']);

  // YC8.2-NT5: bỏ [Danh sách căn] thì nút Lưu mờ và ghi "Mẫu cần có [Danh sách căn]".
  await o.fill('[Tên sale] gửi anh chị căn trống ');
  await expect(p11.getByText('Mẫu cần có [Danh sách căn]')).toBeVisible();
  await expect(p11.getByRole('button', { name: 'Lưu thay đổi' })).toBeDisabled();

  // YC8.2-NT1: chạm [Ngày] chèn vào chỗ con trỏ (cuối ô), bản xem trước hiện ngày thật.
  await p11.getByRole('button', { name: '[Ngày]', exact: true }).click();
  await expect(o).toHaveValue('[Tên sale] gửi anh chị căn trống [Ngày]');
  await expect(xem).toContainText('Sale Hùng gửi anh chị căn trống 10/10 → 12/10');
  await o.press('End');
  await o.pressSequentially(':\n');
  await p11.getByRole('button', { name: '[Danh sách căn]', exact: true }).click();
  await expect(o).toHaveValue('[Tên sale] gửi anh chị căn trống [Ngày]:\n[Danh sách căn]');
  await expect(p11.getByText('Mẫu cần có [Danh sách căn]')).toHaveCount(0);

  // YC8.2-NT2: "Dùng lại mẫu mặc định" rồi bỏ: Quay lại không lưu.
  const mauMoi = await o.inputValue();
  await p11.getByRole('button', { name: 'Dùng lại mẫu mặc định' }).click();
  await expect(o).toHaveValue(/^Em gửi anh chị \[Số căn\] căn còn trống/);
  await o.fill(mauMoi);

  // YC8.2 bước 5: Lưu, toast, về Cá nhân, database ghi.
  await p11.getByRole('button', { name: 'Lưu thay đổi' }).click();
  await expect(page.getByRole('status')).toContainText('Đã lưu mẫu tin');
  await expect(page.getByRole('heading', { name: 'Cá nhân' })).toBeVisible();
  await expect.poll(() => sql(`select mau_tin from public.cai_dat_rieng where nguoi_id = '${hungId}'`)).toBe(mauMoi);

  // Mở lại thấy mẫu đã lưu.
  await page.getByRole('button', { name: 'Mẫu tin gửi khách' }).click();
  await expect(o).toHaveValue(mauMoi);
  await p11.getByRole('button', { name: 'Quay lại' }).click();

  // YC8.2-NT3: S5 "Sao chép chữ cả 1 căn" theo mẫu đã lưu.
  await page.getByRole('button', { name: 'Lịch', exact: true }).click();
  await page.getByRole('button', { name: 'Tìm phòng trống theo ngày' }).click();
  await page.getByLabel('Ngày nhận').fill(nhan);
  await page.getByRole('button', { name: '2 đêm' }).click();
  await page.getByRole('button', { name: 'Tìm phòng trống' }).click();
  await page.getByRole('checkbox', { name: 'Chọn ICON40 1509 · 2PN' }).click();
  await page.getByRole('button', { name: 'Gửi cho khách' }).click();
  const s5 = page.locator('[data-man="S5"]');
  await s5.getByRole('button', { name: 'Sao chép chữ cả 1 căn' }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { daSaoChep: string[] }).daSaoChep.length)).toBe(1);
  const tin = await page.evaluate(() => (window as unknown as { daSaoChep: string[] }).daSaoChep[0]!);
  expect(tin).toBe(`Sale Hùng gửi anh chị căn trống ${dm(nhan)} → ${dm(tra)}:\n`
    + `1. ICON40 1509 · 2PN · 3 giường, view biển\n${dm(nhan)} → ${dm(tra)} (2 đêm): 2.200.000đ`);
});
