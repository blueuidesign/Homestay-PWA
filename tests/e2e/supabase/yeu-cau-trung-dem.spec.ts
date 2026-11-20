// Test e2e US52 · Yêu cầu trùng đêm (YC9.3), trên Supabase chạy ở máy với hộp thư giả.
// Tên theo DLM (giả), email và số giả. Yêu cầu dựng thẳng bằng SQL (lệnh gửi của sale đã có e2e ở gui-yeu-cau.spec.ts).
// Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase (docs/dev/chay-va-test.md).
import { expect, test } from '@playwright/test';
import { dangNhapBangMa, idCua, sql, taoCanCoAnh, taoTaiKhoan } from './hoTro';

const homNay = () => new Date(Date.now() + 7 * 3_600_000).toISOString().slice(0, 10);
const cong = (n: string, d: number) => new Date(Date.parse(n + 'T00:00:00Z') + d * 86_400_000).toISOString().slice(0, 10);
const dm = (n: string) => `${n.slice(8, 10)}/${n.slice(5, 7)}`;

function yeuCau(can: string, sale: string, nhan: string, tra: string, gia: string, phut: number): string {
  return sql(`insert into public.yeu_cau_dat_phong (can_id, sale_id, ngay_nhan, ngay_tra, gia_chu_dem, trang_thai, gui_luc, han_luc)
              values ('${can}', '${sale}', '${nhan}', '${tra}', '${gia}', 'cho', now() - interval '${phut} minutes',
                      now() + interval '14 days') returning id`).split('\n')[0]!.trim();
}

test('YC9.3-NT1 YC9.3-NT2 Chị Hoa chấp nhận yêu cầu của Sale Hùng thì yêu cầu trùng đêm của Sale Lan bị từ chối', async ({ page }) => {
  const hoa = taoTaiKhoan('chu_nha', 'Chị Hoa');
  const hoaId = idCua(hoa.email);
  const hungId = idCua(taoTaiKhoan('sale', 'Sale Hùng').email);
  const lanId = idCua(taoTaiKhoan('sale', 'Sale Lan').email);
  const c1509 = taoCanCoAnh(hoaId, '1509', 'ICON40', 2, 3, 'bien');
  sql(`insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon, pham_vi)
       values ('${hoaId}', '${hungId}', 'da_ket_noi', 'link_moi', 'tat_ca'), ('${hoaId}', '${lanId}', 'da_ket_noi', 'link_moi', 'tat_ca')`);
  // Sale Hùng 17/10 → 19/10, Sale Lan 18/10 → 19/10 (YC9.3): chồng đêm nhan + 1.
  const nhan = cong(homNay(), 3);
  const yHung = yeuCau(c1509, hungId, nhan, cong(nhan, 2), '{1300000,900000}', 10);
  const yLan = yeuCau(c1509, lanId, cong(nhan, 1), cong(nhan, 2), '{900000}', 5);
  sql(`insert into public.yeu_cau_rieng (yeu_cau_id, sale_id, gia_ban_dem, ten_khach) values ('${yHung}', '${hungId}', '{1500000,1100000}', 'Khách thử E2E')`);

  await dangNhapBangMa(page, hoa.email);

  // Bước 1, YC9.3-NT1: CN1-03 mỗi dòng có nhãn trùng ngày.
  const khoi = page.getByRole('region', { name: 'Yêu cầu đặt phòng · 2' });
  await expect(khoi.getByText(`${dm(cong(nhan, 1))} → ${dm(cong(nhan, 2))} · trùng ngày với Sale Hùng`)).toBeVisible();
  await expect(khoi.getByText(`${dm(nhan)} → ${dm(cong(nhan, 2))} · trùng ngày với Sale Lan`)).toBeVisible();
  await khoi.locator(`[data-yeu-cau="${yHung}"]`).getByRole('button', { name: 'Xem và trả lời' }).click();

  // Bước 2, YC9.3-NT1: CN9 có cảnh báo.
  const cn9 = page.locator('[data-man="CN9"]');
  await expect(cn9).toHaveAttribute('data-yeu-cau', yHung);
  await expect(page.getByTestId('cn9-trung')).toHaveText(
    `Trùng ${dm(cong(nhan, 1))} với yêu cầu của Sale Lan. Chấp nhận yêu cầu này thì yêu cầu của Sale Lan bị từ chối và Sale Lan được báo.`);
  await cn9.getByRole('button', { name: 'Chấp nhận đặt phòng' }).click();

  // Bước 3, YC9.3-NT2: CN9-02 thêm dòng; database: yêu cầu của Lan Bị từ chối, Lan được báo, không tên Hùng, giá, khách.
  const cn902 = page.locator('[data-man="CN9-02"]');
  await expect(cn902.getByText('Đặt phòng đã vào lịch. Sale Hùng được báo.')).toBeVisible();
  await expect(cn902.getByText(`Yêu cầu của Sale Lan (${dm(cong(nhan, 1))} → ${dm(cong(nhan, 2))}) đã bị từ chối. Sale Lan được báo.`)).toBeVisible();
  expect(sql(`select trang_thai || '|' || ly_do_tu_choi from public.yeu_cau_dat_phong where id = '${yLan}'`))
    .toBe('bi_tu_choi|Đã nhận đặt phòng khác');
  const bao = sql(`select noi_dung::text from public.thong_bao where nguoi_nhan = '${lanId}' and loai = 'yeu_cau_bi_tu_choi' and doi_tuong_id = '${yLan}'`);
  expect(bao).toContain('Đã nhận đặt phòng khác');
  expect(bao).not.toMatch(/Sale Hùng|Khách thử E2E|1500000|2600000/);
  expect(sql(`select count(*) from public.booking where can_id = '${c1509}' and trang_thai <> 'da_huy'`)).toBe('1');

  await cn902.getByRole('button', { name: 'Về lịch' }).click();
  await expect(page.getByRole('heading', { name: 'Lịch' })).toBeVisible();
  await expect(page.getByRole('region', { name: /Yêu cầu đặt phòng/ })).toHaveCount(0);
});
