// Test e2e US58 · Thống kê của chủ nhà (YC11.1), trên Supabase chạy ở máy với hộp thư giả. Tên, email đều giả.
// Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase/thong-ke-chu.spec.ts (docs/dev/chay-va-test.md).
// Ngày đặt theo tháng hiện tại (giờ Việt Nam), vì tab Thống kê mở ở tháng của hôm nay.
import { expect, test } from '@playwright/test';
import { dangNhapBangMa, sql, taoTaiKhoan } from './hoTro';

/** Một booking chủ ghi, tiền từng đêm chia đều (lẻ dồn đêm cuối, QT4.2), kèm người bán và trạng thái tiền. */
function taoBooking(chu: string, canId: string, nhan: string, tra: string, tien: number,
                    them: { saleId?: string; trangThaiTien?: string; tienCoc?: number } = {}) {
  sql(`with b as (
         insert into public.booking (can_id, ngay_nhan, ngay_tra, nguon, sale_id, tao_boi, tien_phong, trang_thai_tien, tien_coc)
         values ('${canId}', '${nhan}', '${tra}', 'chu_ghi', ${them.saleId ? `'${them.saleId}'` : 'null'}, '${chu}', ${tien},
                 '${them.trangThaiTien ?? 'da_thanh_toan'}', ${them.tienCoc ?? 'null'}) returning id, ngay_nhan, ngay_tra)
       insert into public.booking_dem (booking_id, dem, tien)
       select b.id, d::date, case when d::date = b.ngay_tra - 1 then ${tien} - (${tien} / (b.ngay_tra - b.ngay_nhan)) * (b.ngay_tra - b.ngay_nhan - 1)
                                  else ${tien} / (b.ngay_tra - b.ngay_nhan) end
       from b, generate_series(b.ngay_nhan, b.ngay_tra - 1, interval '1 day') d`);
}

test('YC11.1-NT1 YC11.1-NT2 YC11.1-NT5 YC11.1-NT7 YC11.1-NT9 luồng chính: chủ nhà mở tab Thống kê thấy doanh thu và đổi tháng', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ Thống Kê');
  const sale = taoTaiKhoan('sale', 'Sale Hùng');
  const chuId = sql(`select id from auth.users where email = '${chu.email}'`);
  const saleId = sql(`select id from auth.users where email = '${sale.email}'`);
  sql(`insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon) values ('${chuId}', '${saleId}', 'da_ket_noi', 'link_moi')`);
  // Hai căn có từ trước tháng này: mẫu số công suất là 2 × số đêm của tháng (YC11-H7).
  const c1509 = sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu, tao_luc) values ('${chuId}', '1509', 2, now() - interval '70 days') returning id`).split('\n')[0]!;
  const c3402 = sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu, tao_luc) values ('${chuId}', '3402', 1, now() - interval '69 days') returning id`).split('\n')[0]!;
  const [nam, thang] = sql(`select to_char(public.local_today(), 'YYYY|FMMM')`).split('|').map(Number) as [number, number];
  const [namSau, thangSau] = thang === 12 ? [nam + 1, 1] : [nam, thang + 1];
  const ng = (n: number, t = thang, y = nam) => `${y}-${String(t).padStart(2, '0')}-${String(n).padStart(2, '0')}`;
  const soDemThang = new Date(Date.UTC(nam, thang, 0)).getUTCDate();

  taoBooking(chuId, c1509, ng(2), ng(4), 2200000, { saleId }); // Sale Hùng, 2 đêm, đã thanh toán
  taoBooking(chuId, c3402, ng(10), ng(11), 800000, { trangThaiTien: 'chua_coc' }); // khách lẻ, chưa cọc
  taoBooking(chuId, c1509, ng(20), ng(22), 1800000, { trangThaiTien: 'da_coc', tienCoc: 500000 }); // khách lẻ, đã cọc: không có dòng chưa thu (YC11.1-NT13)
  taoBooking(chuId, c3402, ng(5, thangSau, namSau), ng(6, thangSau, namSau), 1200000, { saleId }); // tháng sau

  await dangNhapBangMa(page, chu.email);
  await page.getByRole('button', { name: 'Thống kê' }).click();

  // YC11.1 bước 1 đến 4: 2.200.000 + 800.000 + 1.800.000 = 4.800.000đ; 1509 4.000.000đ, 3402 800.000đ; 5 đêm.
  await expect(page.getByRole('heading', { name: 'Thống kê', level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: `Tháng ${thang}/${nam}` })).toBeVisible();
  const dt = page.getByRole('region', { name: `Doanh thu tháng ${thang}` });
  await expect(dt.getByText('4.800.000đ')).toBeVisible();
  await expect(dt.getByText(/so với tháng/)).toHaveCount(0); // tháng trước 0đ: không có dòng so sánh
  await expect(page.getByRole('region', { name: 'Phòng 1509' }).getByText('4.000.000đ')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Phòng 3402' }).getByText('800.000đ')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Đêm có khách' }).getByText(`5/${2 * soDemThang}`)).toBeVisible();
  const cs = (Math.round((5 * 1000) / (2 * soDemThang)) / 10).toFixed(1);
  await expect(page.getByRole('region', { name: 'Công suất' }).getByText(`${cs}%`)).toBeVisible();

  // YC11.1 bước 6: theo người bán, tiền giảm dần, có Khách lẻ.
  const ban = page.getByRole('region', { name: 'Doanh thu theo người bán' }).getByRole('listitem');
  await expect(ban).toHaveText(['Khách lẻ2.600.000đ', 'Sale Hùng2.200.000đ']);

  // YC11.1 bước 7, YC11-H9 (r3): chỉ dòng chưa cọc 800.000đ; đặt phòng đã cọc không có dòng.
  const ct = page.getByRole('region', { name: 'Chưa thu tiền' });
  await expect(ct.getByText(`Khách lẻ · ${ng(10).slice(8)}/${ng(10).slice(5, 7)} → ${ng(11).slice(8)}/${ng(11).slice(5, 7)}`)).toBeVisible();
  await expect(ct.getByText(/^Chưa cọc · /)).toBeVisible();
  await expect(ct.getByText(/^Đã cọc/)).toHaveCount(0);
  await expect(ct.getByText('800.000đ')).toHaveCount(2); // tổng và một dòng
  await expect(ct.getByText(/ · \d\d\/\d\d → /)).toHaveCount(1);

  // YC11.1 bước 5: cột tháng đang xem đậm.
  const bd = page.getByRole('region', { name: 'Doanh thu 6 tháng' });
  await expect(bd.locator(`[data-cot="T${thang}"] .hh-bars__bar--current`)).toHaveCount(1);
  await expect(bd.locator(`[data-cot="T${thang}"] .hh-bars__val`)).toHaveText('4.8tr');

  // YC11.1 bước 8, YC11.1-NT5: sang tháng sau, mọi số đổi theo tháng đó, biểu đồ dời tới tháng sau.
  await page.getByRole('button', { name: `Tháng sau T${String(thangSau).padStart(2, '0')}` }).click();
  await expect(page.getByRole('heading', { name: `Tháng ${thangSau}/${namSau}` })).toBeVisible();
  const dtSau = page.getByRole('region', { name: `Doanh thu tháng ${thangSau}` });
  await expect(dtSau.getByText('1.200.000đ')).toBeVisible();
  await expect(dtSau.getByText(`−75.0% so với tháng ${thang}`)).toBeVisible();
  await expect(page.getByRole('region', { name: 'Đêm có khách' }).getByText(/^1\//)).toBeVisible();
  await expect(page.getByRole('region', { name: 'Doanh thu theo người bán' }).getByRole('listitem')).toHaveText(['Sale Hùng1.200.000đ']);
  await expect(page.getByText('Không có khoản nào chưa thu.')).toBeVisible();
  await expect(bd.locator('[data-cot]').last()).toHaveAttribute('data-cot', `T${thangSau}`);
  await expect(bd.locator(`[data-cot="T${thangSau}"] .hh-bars__bar--current`)).toHaveCount(1);
});
