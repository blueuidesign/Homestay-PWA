// Test e2e US51 · Chủ nhà trả lời yêu cầu đặt phòng (YC9.2), trên Supabase chạy ở máy với hộp thư giả.
// Tên theo DLM (giả), email và số giả. Yêu cầu dựng thẳng bằng SQL (lệnh gửi của sale đã có e2e ở gui-yeu-cau.spec.ts).
// Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase (docs/dev/chay-va-test.md).
import { expect, test } from '@playwright/test';
import { dangNhapBangMa, idCua, sql, taoCanCoAnh, taoTaiKhoan } from './hoTro';

const homNay = () => new Date(Date.now() + 7 * 3_600_000).toISOString().slice(0, 10);
const cong = (n: string, d: number) => new Date(Date.parse(n + 'T00:00:00Z') + d * 86_400_000).toISOString().slice(0, 10);
const dm = (n: string) => `${n.slice(8, 10)}/${n.slice(5, 7)}`;

/** Chị Hoa có 1509, Sale Hùng đã kết nối và gửi một yêu cầu chờ 2 đêm (giá chủ 1.300.000đ + 900.000đ, giá bán +200k mỗi đêm). */
function dung() {
  const hoa = taoTaiKhoan('chu_nha', 'Chị Hoa');
  const hoaId = idCua(hoa.email);
  const hungId = idCua(taoTaiKhoan('sale', 'Sale Hùng').email);
  const nhan = cong(homNay(), 3);
  const tra = cong(nhan, 2);
  const c1509 = taoCanCoAnh(hoaId, '1509', 'ICON40', 2, 3, 'bien');
  sql(`insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon, pham_vi) values ('${hoaId}', '${hungId}', 'da_ket_noi', 'link_moi', 'tat_ca')`);
  const yId = sql(`insert into public.yeu_cau_dat_phong (can_id, sale_id, ngay_nhan, ngay_tra, loi_nhan, gia_chu_dem, trang_thai, gui_luc, han_luc)
                   values ('${c1509}', '${hungId}', '${nhan}', '${tra}', 'Khách gia đình 4 người', '{1300000,900000}', 'cho',
                           now() - interval '10 minutes', now() + interval '14 days') returning id`).split('\n')[0]!.trim();
  sql(`insert into public.yeu_cau_rieng (yeu_cau_id, sale_id, gia_ban_dem) values ('${yId}', '${hungId}', '{1500000,1100000}')`);
  return { hoa, hungId, nhan, tra, yId };
}

test('YC9.2-NT1 YC9.2-NT2 YC9.2-NT3 Chị Hoa chấp nhận yêu cầu của Sale Hùng', async ({ page }) => {
  const { hoa, hungId, nhan, tra, yId } = dung();
  await dangNhapBangMa(page, hoa.email);

  // CN1-03: khối yêu cầu, chỉ giá chủ nhà.
  const khoi = page.getByRole('region', { name: 'Yêu cầu đặt phòng · 1' });
  await expect(khoi.getByText('Sale Hùng đặt phòng 1509')).toBeVisible();
  await expect(khoi.getByText(`${dm(nhan)} → ${dm(tra)} · gửi 10 phút trước`)).toBeVisible();
  await expect(khoi.getByText('Chờ bạn')).toBeVisible();
  await khoi.getByRole('button', { name: 'Xem và trả lời' }).click();

  // CN9: đúng yêu cầu, "Giá của bạn 2.200.000đ", không có giá bán.
  const cn9 = page.locator('[data-man="CN9"]');
  await expect(cn9).toHaveAttribute('data-yeu-cau', yId);
  await expect(page.getByTestId('cn9-gia')).toContainText('2.200.000đ');
  await expect(cn9.getByText('Khách gia đình 4 người')).toBeVisible();
  await expect(cn9).not.toContainText('2.600.000');
  await cn9.getByRole('button', { name: 'Chấp nhận đặt phòng' }).click();

  // CN9-02; database có đặt phòng từ yêu cầu mang giá đã chốt, Hùng là người đặt, Hùng được báo.
  const cn902 = page.locator('[data-man="CN9-02"]');
  await expect(cn902.getByText('✓ Đã nhận đặt phòng 1509')).toBeVisible();
  await expect(cn902.getByText('Đặt phòng đã vào lịch. Sale Hùng được báo.')).toBeVisible();
  expect(sql(`select nguon || '|' || sale_id || '|' || tien_phong from public.booking where yeu_cau_id = '${yId}'`))
    .toBe(`tu_yeu_cau|${hungId}|2200000`);
  expect(sql(`select trang_thai from public.yeu_cau_dat_phong where id = '${yId}'`)).toBe('da_chot');
  expect(sql(`select count(*) from public.thong_bao where nguoi_nhan = '${hungId}' and loai = 'yeu_cau_da_chot'`)).toBe('1');

  // Về lịch: khối yêu cầu không còn.
  await cn902.getByRole('button', { name: 'Về lịch' }).click();
  await expect(page.getByRole('heading', { name: 'Lịch' })).toBeVisible();
  await expect(page.getByRole('region', { name: /Yêu cầu đặt phòng/ })).toHaveCount(0);
});

test('YC9.2-NT4 YC9.2-NT7 Chị Hoa từ chối yêu cầu với lý do "Đã có khách đặt"', async ({ page }) => {
  const { hoa, hungId, nhan, tra, yId } = dung();
  await dangNhapBangMa(page, hoa.email);
  await page.getByRole('region', { name: 'Yêu cầu đặt phòng · 1' }).getByRole('button', { name: 'Xem và trả lời' }).click();

  const cn9 = page.locator('[data-man="CN9"]');
  await cn9.getByRole('button', { name: 'Từ chối' }).click();
  await cn9.getByRole('button', { name: 'Đã có khách đặt' }).click();
  await cn9.getByRole('button', { name: 'Gửi từ chối cho sale' }).click();

  const cn903 = page.locator('[data-man="CN9-03"]');
  await expect(cn903.getByText('Đã từ chối yêu cầu của Sale Hùng')).toBeVisible();
  await expect(cn903.getByText(`Sale Hùng được báo kèm lý do "Đã có khách đặt". Ngày ${dm(nhan)} → ${dm(tra)} vẫn trống trong lịch.`)).toBeVisible();
  expect(sql(`select trang_thai || '|' || ly_do_tu_choi from public.yeu_cau_dat_phong where id = '${yId}'`)).toBe('bi_tu_choi|Đã có khách đặt');
  expect(sql(`select noi_dung ->> 'ly_do' from public.thong_bao where nguoi_nhan = '${hungId}' and loai = 'yeu_cau_bi_tu_choi'`)).toBe('Đã có khách đặt');
  expect(sql(`select count(*) from public.booking where yeu_cau_id = '${yId}'`)).toBe('0');

  // YC9.2-NT7: hết yêu cầu chờ thì CN1 không có khối.
  await cn903.getByRole('button', { name: 'Về lịch' }).click();
  await expect(page.getByRole('heading', { name: 'Lịch' })).toBeVisible();
  await expect(page.getByRole('region', { name: /Yêu cầu đặt phòng/ })).toHaveCount(0);
});
