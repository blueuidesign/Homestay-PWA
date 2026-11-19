// Test e2e US9 · Lịch tháng và lọc theo căn (YC2.1), trên Supabase chạy ở máy với hộp thư giả. Tên, email đều giả.
// Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase (docs/dev/chay-va-test.md).
// Ngày đặt theo tháng hiện tại (giờ Việt Nam), vì lịch mở sẵn ở tháng của hôm nay.
import { expect, test } from '@playwright/test';
import { dangNhapBangMa, sql, taoTaiKhoan } from './hoTro';

/** Ghi một booking chủ tự ghi kèm tiền từng đêm (chia đều, lẻ dồn đêm cuối) trong một câu lệnh. */
function taoBooking(nguoi: string, canId: string, nhan: string, tra: string, trangThai: 'hieu_luc' | 'da_huy' = 'hieu_luc') {
  sql(`with b as (
         insert into public.booking (can_id, ngay_nhan, ngay_tra, nguon, tao_boi, tien_phong, trang_thai)
         values ('${canId}', '${nhan}', '${tra}', 'chu_ghi', '${nguoi}', 1000000, '${trangThai}') returning id, ngay_nhan, ngay_tra)
       insert into public.booking_dem (booking_id, dem, tien)
       select b.id, d::date, case when d::date = b.ngay_tra - 1 then 1000000 - (1000000 / (b.ngay_tra - b.ngay_nhan)) * (b.ngay_tra - b.ngay_nhan - 1)
                                  else 1000000 / (b.ngay_tra - b.ngay_nhan) end
       from b, generate_series(b.ngay_nhan, b.ngay_tra - 1, interval '1 day') d`);
}

test('YC2.1-NT1 YC2.1-NT3 YC2.1-NT4 YC2.1-NT5 luồng chính: mở tab Lịch có 2 căn, thấy đêm có khách, lọc chip 3402, sang tháng sau', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ Lịch Tháng');
  const nguoi = sql(`select id from auth.users where email = '${chu.email}'`);
  // 1509 thêm trước 3402 (chip theo thứ tự thêm căn).
  const c1509 = sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu, tao_luc) values ('${nguoi}', '1509', 2, now() - interval '1 day') returning id`).split('\n')[0]!;
  const c3402 = sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu) values ('${nguoi}', '3402', 1) returning id`).split('\n')[0]!;
  const [nam, thang] = sql(`select to_char(public.local_today(), 'YYYY|FMMM')`).split('|').map(Number) as [number, number];
  const ng = (n: number, t = thang, y = nam) => `${y}-${String(t).padStart(2, '0')}-${String(n).padStart(2, '0')}`;
  const [namSau, thangSau] = thang === 12 ? [nam + 1, 1] : [nam, thang + 1];

  taoBooking(nguoi, c1509, ng(10), ng(12)); // như B1: đêm 10, 11; ngày 12 là ngày trả
  taoBooking(nguoi, c3402, ng(5), ng(7)); // như B4: đêm 5, 6
  taoBooking(nguoi, c3402, ng(20), ng(22), 'da_huy'); // đã hủy: không chiếm đêm (QT2.1)
  taoBooking(nguoi, c3402, ng(15, thangSau, namSau), ng(16, thangSau, namSau)); // tháng sau

  await dangNhapBangMa(page, chu.email);

  // YC2.1 bước 1, YC2.1-NT1: tab Lịch, tháng của hôm nay, chip "Cả 2 phòng" và một chip mỗi căn.
  await expect(page.getByRole('heading', { name: 'Lịch' })).toBeVisible();
  await expect(page.getByRole('heading', { name: `Tháng ${thang}/${nam}` })).toBeVisible();
  const chip = page.getByRole('group', { name: 'Lọc theo căn' }).getByRole('button');
  await expect(chip).toHaveText(['Cả 2 phòng', '1509', '3402']);
  await expect(page.getByText('1509 đã đặt')).toBeVisible();

  // YC2.1-NT3: đêm 10, 11 tô màu 1509; ngày trả 12 không tô (QT2).
  const o = (ngay: string) => page.locator(`[data-ngay="${ngay}"]`);
  await expect(o(ng(10))).toHaveAttribute('aria-label', 'Ngày 10, đã đặt phòng 1509');
  await expect(o(ng(11))).toHaveAttribute('aria-label', 'Ngày 11, đã đặt phòng 1509');
  await expect(o(ng(12))).toHaveAttribute('aria-label', 'Ngày 12, trống');
  await expect(o(ng(5))).toHaveAttribute('aria-label', 'Ngày 5, đã đặt phòng 3402');
  await expect(o(ng(20))).toHaveAttribute('aria-label', 'Ngày 20, trống'); // booking đã hủy
  await expect(o(ng(10)).locator('.cn1-vach--co[data-can="1509"]')).toHaveCount(1);

  // YC2.1-NT4: chạm chip 3402 thì chỉ còn đêm của 3402.
  await page.getByRole('button', { name: '3402', exact: true }).click();
  await expect(page.getByRole('button', { name: '3402', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(o(ng(10))).toHaveAttribute('aria-label', 'Ngày 10, trống');
  await expect(o(ng(5))).toHaveAttribute('aria-label', 'Ngày 5, đã đặt phòng 3402');
  await expect(page.locator('.cn1-vach--co[data-can="1509"]')).toHaveCount(0);

  // YC2.1-NT5: sang tháng sau, tiêu đề đổi, chip giữ nguyên, đêm của tháng sau tô màu.
  await page.getByRole('button', { name: `T${String(thangSau).padStart(2, '0')}`, exact: true }).click();
  await expect(page.getByRole('heading', { name: `Tháng ${thangSau}/${namSau}` })).toBeVisible();
  await expect(page.getByRole('button', { name: '3402', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(o(ng(15, thangSau, namSau))).toHaveAttribute('aria-label', 'Ngày 15, đã đặt phòng 3402');
  await expect(o(ng(16, thangSau, namSau))).toHaveAttribute('aria-label', 'Ngày 16, trống');

  // YC2.1 bước 6: chạm một ngày thì ô đó viền đậm.
  await o(ng(15, thangSau, namSau)).click();
  await expect(o(ng(15, thangSau, namSau))).toHaveAttribute('aria-pressed', 'true');
});

test('YC2.1-NT6 chủ nhà có căn nhưng chưa có đặt phòng nào thì thấy CN1-00', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ Lịch Trống');
  const nguoi = sql(`select id from auth.users where email = '${chu.email}'`);
  sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu) values ('${nguoi}', '2501', 2)`);

  await dangNhapBangMa(page, chu.email);
  await expect(page.getByText('Chưa có đặt phòng nào')).toBeVisible();
  await expect(page.getByText('💡 Mời sale xem lịch để sale tự biết ngày trống, không phải gọi hỏi. Vào tab Sale.')).toBeVisible();
  await expect(page.getByRole('group', { name: 'Lọc theo căn' })).toHaveCount(0); // 1 căn: không có hàng chip
  await expect(page.getByText(/Doanh thu/)).toHaveCount(0);
  // YC2.1 bước 5: bấm "Đặt phòng" mở form ghi đặt phòng (YC5.1 bước 1a, có từ US26).
  await page.getByRole('button', { name: 'Đặt phòng' }).last().click();
  await expect(page.getByRole('heading', { name: 'Thêm đặt phòng' })).toBeVisible();
});
