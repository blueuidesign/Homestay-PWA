// Test e2e US33 · Hủy đặt phòng có sale (YC5.8, QD12), trên Supabase chạy ở máy với hộp thư giả. Tên, email đều giả.
// Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase/huy-dat-phong-co-sale.spec.ts (docs/dev/chay-va-test.md).
import { expect, test, type Page } from '@playwright/test';
import { dangNhapBangMa, idCua, sql, taoDatPhongCuaSale, taoTaiKhoan } from './hoTro';

// Chờ lịch tháng hiện ra (đăng nhập xong, phiên đã lưu) rồi mới mở thẳng đường dẫn chi tiết đặt phòng, như xoa-dat-phong.spec.ts.
async function moChiTiet(p: Page, email: string, id: string) {
  const [nam, thang] = sql(`select to_char(public.local_today(), 'YYYY|FMMM')`).split('|');
  await dangNhapBangMa(p, email);
  await expect(p.getByRole('heading', { name: `Tháng ${thang}/${nam}` })).toBeVisible();
  await p.goto(`/dat-phong/${id}`);
}

test('YC5.8-NT1 YC5.8-NT2 luồng chính: sale xin hủy ở S3-10, chủ nhà đồng ý ở CN3-02, hai bên thấy "Đã hủy"', async ({ page, browser }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ Đồng Ý Hủy');
  const sale = taoTaiKhoan('sale', 'Sale Xin Hủy');
  const chuId = idCua(chu.email);
  const saleId = idCua(sale.email);
  sql(`insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon) values ('${chuId}', '${saleId}', 'da_ket_noi', 'link_moi')`);
  const c = sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu) values ('${chuId}', '1509', 2) returning id`).split('\n')[0]!;
  const nhan = sql(`select to_char(public.local_today() + 3, 'YYYY-MM-DD')`);
  const tra = sql(`select to_char(public.local_today() + 5, 'YYYY-MM-DD')`);
  const b = taoDatPhongCuaSale(c, chuId, saleId, nhan, tra, 2200000);

  // Sale xin hủy (bước 33).
  await dangNhapBangMa(page, sale.email);
  await page.getByRole('navigation', { name: 'Tab' }).getByRole('button', { name: 'Thống kê' }).click();
  await page.getByRole('button', { name: 'Xem tất cả đặt phòng và yêu cầu' }).click();
  await page.getByRole('button', { name: /Chủ Đồng Ý Hủy đã ghi giúp bạn/ }).click();
  await page.getByRole('button', { name: 'Xin hủy' }).click();
  const hoi = page.getByRole('alertdialog', { name: 'Xác nhận xin hủy' });
  await expect(hoi).toContainText('Chủ Đồng Ý Hủy phải đồng ý thì mới hủy.');
  await hoi.getByRole('button', { name: 'Xin hủy' }).click();
  await expect(page.getByText('Chờ đồng ý hủy')).toBeVisible();
  expect(sql(`select trang_thai from public.booking where id = '${b}'`)).toBe('hieu_luc');

  // Chủ nhà đồng ý (bước 34, 35).
  const chuPage = await browser.newPage();
  await moChiTiet(chuPage, chu.email, b);
  await expect(chuPage.getByRole('heading', { name: 'Đặt phòng · Sale Xin Hủy' })).toBeVisible({ timeout: 15000 });
  await expect(chuPage.getByText('Sale Xin Hủy xin hủy đặt phòng này')).toBeVisible({ timeout: 15000 });
  await chuPage.getByRole('button', { name: 'Đồng ý hủy' }).click();
  await expect(chuPage.getByText('Đã hủy', { exact: true })).toBeVisible();
  expect(sql(`select trang_thai from public.booking where id = '${b}'`)).toBe('da_huy');

  // Sale mở lại thấy "Đã hủy" (YC11.3: dòng đặt phòng đã hủy ghi "Đặt phòng đã hủy").
  await page.reload();
  await page.getByRole('dialog').getByRole('button', { name: 'Đóng' }).click(); // YC12.1: popup "đã đồng ý hủy" của lần mở lại, đóng để bấm tab
  await page.getByRole('navigation', { name: 'Tab' }).getByRole('button', { name: 'Thống kê' }).click();
  await page.getByRole('button', { name: 'Xem tất cả đặt phòng và yêu cầu' }).click();
  await page.getByRole('button', { name: /Đặt phòng đã hủy/ }).click();
  await expect(page.getByText('Đã hủy', { exact: true }).first()).toBeVisible();
  await chuPage.close();
});

test('YC5.8-NT6 chủ nhà mở đặt phòng khách lẻ: không có nút "Xin hủy"', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ Khách Lẻ Hủy');
  const chuId = idCua(chu.email);
  const c = sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu) values ('${chuId}', '1509', 2) returning id`).split('\n')[0]!;
  const b5 = sql(`with b as (
         insert into public.booking (can_id, ngay_nhan, ngay_tra, nguon, tao_boi, tien_phong, trang_thai_tien)
         values ('${c}', public.local_today() + 6, public.local_today() + 7, 'chu_ghi', '${chuId}', 900000, 'chua_coc') returning id),
       d as (insert into public.booking_dem (booking_id, dem, tien) select b.id, public.local_today() + 6, 900000 from b)
       select id from b`).split('\n')[0]!;
  await moChiTiet(page, chu.email, b5);
  await expect(page.getByRole('button', { name: 'Xóa đặt phòng' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Xin hủy' })).toHaveCount(0);
});
