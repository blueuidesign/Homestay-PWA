// Test e2e US59 · Thống kê của sale (YC11.2), trên Supabase chạy ở máy với hộp thư giả. Tên, email đều giả.
// Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase/thong-ke-sale.spec.ts (docs/dev/chay-va-test.md).
// Ngày đặt theo tháng hiện tại (giờ Việt Nam), vì sale chỉ xem tháng của hôm nay (YC11-H8).
import { expect, test } from '@playwright/test';
import { dangNhapBangMa, idCua, sql, taoDatPhongCuaSale, taoTaiKhoan } from './hoTro';

test('YC11.2-NT1 YC11.2-NT3 luồng chính: sale mở tab Thống kê thấy tiền chênh, theo chủ nhà và chờ chủ', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ Thống Kê');
  const sale = taoTaiKhoan('sale', 'Sale Thống Kê');
  const chuId = idCua(chu.email);
  const saleId = idCua(sale.email);
  sql(`insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon) values ('${chuId}', '${saleId}', 'da_ket_noi', 'link_moi')`);
  const c1509 = sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu) values ('${chuId}', '1509', 2) returning id`).split('\n')[0]!;
  const villa = sql(`insert into public.can (nguoi_giu, loai, ma_can, chu_can_ten, gia_chu_thuong, gia_chu_cuoi_tuan)
                     values ('${saleId}', 'tu_nhap', 'Villa Tuần Châu', 'Chú Bình', 1400000, 1400000) returning id`).split('\n')[0]!;
  const [nam, thang] = sql(`select to_char(public.local_today(), 'YYYY|FMMM')`).split('|').map(Number) as [number, number];
  const ng = (n: number) => `${nam}-${String(thang).padStart(2, '0')}-${String(n).padStart(2, '0')}`;

  // Chủ ghi 1509 cho sale (YC5.4): giá chủ 2.200.000đ, giá bán của sale 2.600.000đ (phần riêng của sale, QD11).
  const b1 = taoDatPhongCuaSale(c1509, chuId, saleId, ng(1), ng(3), 2200000);
  sql(`insert into public.booking_rieng (booking_id, nguoi_id, tien_thu_khach) values ('${b1}', '${saleId}', 2600000)`);
  // Sale tự ghi Villa (YC10.4): trả chủ 1.400.000đ, thu khách 1.600.000đ.
  sql(`with b as (insert into public.booking (can_id, ngay_nhan, ngay_tra, nguon, tao_boi, tien_phong)
                  values ('${villa}', '${ng(5)}', '${ng(6)}', 'sale_tu_ghi', '${saleId}', 1400000) returning id),
            d as (insert into public.booking_dem (booking_id, dem, tien) select id, '${ng(5)}', 1400000 from b)
       insert into public.booking_rieng (booking_id, nguoi_id, tien_thu_khach) select id, '${saleId}', 1600000 from b`);
  // Một yêu cầu đang chờ chủ nhà, từ ngày mai (YC11.2 bước 5).
  sql(`insert into public.yeu_cau_dat_phong (can_id, sale_id, ngay_nhan, ngay_tra, gia_chu_dem, trang_thai)
       values ('${c1509}', '${saleId}', public.local_today() + 10, public.local_today() + 12, array[900000, 900000], 'cho')`);

  await dangNhapBangMa(page, sale.email);
  await page.getByRole('navigation', { name: 'Tab' }).getByRole('button', { name: 'Thống kê' }).click();

  await expect(page.getByRole('heading', { name: 'Thống kê', level: 1 })).toBeVisible();
  await expect(page.getByText(`Tháng ${thang}/${nam}`)).toBeVisible();
  // YC11.2 bước 2, 3: 2 đặt phòng, doanh số 2.600.000 + 1.600.000 = 4.200.000đ, chênh 400.000 + 200.000 = 600.000đ.
  const chenh = page.getByRole('region', { name: `Tiền chênh tháng ${thang}` });
  await expect(chenh.getByText('600.000đ')).toBeVisible();
  await expect(chenh.getByText(/so với tháng/)).toHaveCount(0); // tháng trước 0đ: không có dòng so sánh
  await expect(page.getByRole('region', { name: 'Đặt phòng' }).locator('.hh-stat__value')).toHaveText('2');
  await expect(page.getByRole('region', { name: 'Doanh số' }).locator('.hh-stat__value')).toHaveText('4.200.000đ');
  // YC11.2 bước 4: theo chủ nhà, có chủ căn tự nhập.
  await expect(page.getByRole('region', { name: 'Doanh số theo chủ nhà' }).getByRole('listitem'))
    .toHaveText(['Chủ Thống Kê2.600.000đ · chênh 400.000đ', 'Chú Bình1.600.000đ · chênh 200.000đ']);
  // YC11.2 bước 5: chờ chủ nhà chấp nhận 1, không cộng vào số trên.
  const cho = page.getByRole('region', { name: 'Chờ chủ nhà chấp nhận' });
  await expect(cho.locator('.s7-cho-so')).toHaveText('1');
  await expect(cho.getByText(/^1509 · /)).toBeVisible();
  await expect(cho.getByText(/Chủ Thống Kê chưa trả lời$/)).toBeVisible();
  await expect(cho.getByRole('button', { name: 'Xem tất cả đặt phòng và yêu cầu' })).toBeVisible();
});

test('YC11.2-NT8 tháng chưa chốt đặt phòng nào: S7-00, "Tìm phòng" mở tìm phòng', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ Không Bán');
  const sale = taoTaiKhoan('sale', 'Sale Mới');
  sql(`insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon) values ('${idCua(chu.email)}', '${idCua(sale.email)}', 'da_ket_noi', 'link_moi')`);
  sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu) values ('${idCua(chu.email)}', '3402', 1)`);
  const thang = Number(sql(`select to_char(public.local_today(), 'FMMM')`));

  await dangNhapBangMa(page, sale.email);
  await page.getByRole('navigation', { name: 'Tab' }).getByRole('button', { name: 'Thống kê' }).click();
  await expect(page.getByRole('region', { name: `Tiền chênh tháng ${thang}` }).getByText('0đ')).toBeVisible();
  await expect(page.getByText('Tháng này chưa chốt đặt phòng nào')).toBeVisible();
  await page.getByRole('button', { name: 'Tìm phòng' }).click();
  await expect(page.getByRole('heading', { name: 'Tìm phòng' })).toBeVisible();
});
