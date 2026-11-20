// Test e2e US56 · Căn tự nhập (YC10.3), trên Supabase chạy ở máy với hộp thư giả.
// Tên theo DLM (giả), email và số giả. Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase (docs/dev/chay-va-test.md).
import { expect, test } from '@playwright/test';
import { dangNhapBangMa, idCua, sql, taoTaiKhoan } from './hoTro';

test('YC10.3-NT2 YC10.3-NT3 YC10.3-NT6 YC10.3-NT9 Sale Hùng thêm căn tự nhập, thấy ở nhóm Căn tự nhập, mở S6-03, xóa', async ({ page }) => {
  const hung = taoTaiKhoan('sale', 'Sale Hùng');
  const hungId = idCua(hung.email);

  await dangNhapBangMa(page, hung.email);
  await page.getByRole('navigation', { name: 'Tab' }).getByRole('button', { name: 'Căn' }).click();

  // YC10.3 bước 1: S6-00 "Thêm căn tự nhập" mở S6-02.
  await page.getByRole('button', { name: 'Thêm căn tự nhập' }).click();
  await expect(page.getByRole('heading', { name: 'Thêm căn tự nhập' })).toBeVisible();
  await expect(page.getByRole('status')).toHaveText('Còn thiếu: tên chủ nhà, số điện thoại, mã căn, số phòng ngủ');
  await expect(page.getByRole('button', { name: 'Thêm căn' })).toBeDisabled();

  // YC10.3-NT2: không nhập giá chủ, số giường vẫn thêm được.
  await page.getByLabel(/^Tên chủ nhà/).fill('Chú Bình');
  await page.getByLabel(/^Số điện thoại/).fill('0900000099');
  await page.getByLabel(/^Mã căn/).fill('Villa Tuần Châu');
  await page.getByRole('button', { name: '4PN+' }).click();
  await expect(page.getByText(/Còn thiếu/)).toHaveCount(0);
  await page.getByRole('button', { name: 'Thêm căn' }).click();

  // YC10.3-NT3: về S6, căn ở nhóm Căn tự nhập.
  await expect(page.getByRole('heading', { name: 'Căn tự nhập · 1' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Villa Tuần Châu' })).toContainText('Chú Bình · chưa dùng app · gọi hỏi lịch');
  const canId = sql(`select id from public.can where nguoi_giu = '${hungId}' and loai = 'tu_nhap'`).split('\n')[0]!;
  expect(sql(`select coalesce(gia_chu_thuong::text, 'null') || ',' || coalesce(so_giuong::text, 'null') from public.can where id = '${canId}'`))
    .toBe('null,null');

  // S6-03-00: chưa có đặt phòng.
  await page.getByRole('button', { name: 'Villa Tuần Châu' }).click();
  const s603 = page.locator('[data-man="S6-03-00"]');
  await expect(s603.getByText('Chú Bình', { exact: true })).toBeVisible();
  await expect(s603.getByText('0900 *** 099 · chưa dùng app')).toBeVisible();
  await expect(s603.getByRole('link', { name: 'Gọi hỏi lịch' })).toHaveAttribute('href', 'tel:0900000099');
  await expect(s603.getByText('Chưa có đặt phòng nào cho căn này')).toBeVisible();
  await s603.getByRole('button', { name: 'Quay lại' }).click();

  // YC10.3-NT6: V1 (đặt phòng tự ghi do US57 tạo; ở đây chèn sẵn) hiện ở S6-03.
  sql(`with b as (insert into public.booking (can_id, ngay_nhan, ngay_tra, nguon, tao_boi, tien_phong)
                  values ('${canId}', '2026-09-20', '2026-09-22', 'sale_tu_ghi', '${hungId}', 2800000) returning id),
            d as (insert into public.booking_dem (booking_id, dem, tien)
                  select b.id, x.dem, 1400000 from b, (values ('2026-09-20'::date), ('2026-09-21'::date)) x (dem) returning booking_id)
       insert into public.booking_rieng (booking_id, nguoi_id, tien_thu_khach) select distinct booking_id, '${hungId}'::uuid, 3400000 from d`);
  await page.getByRole('button', { name: 'Villa Tuần Châu' }).click();
  const ct = page.locator('[data-man="S6-03"]');
  await expect(ct.getByTestId('dat-phong')).toContainText('20/09 → 22/09');
  await expect(ct.getByTestId('dat-phong')).toContainText('Trả chủ 2.800.000đ · Thu khách 3.400.000đ');
  await expect(ct.getByTestId('dat-phong')).toContainText('+600.000đ');

  // YC10.3-NT9: bấm một lần chưa xóa; bấm xác nhận thì về S6 và căn, đặt phòng không còn.
  await ct.getByRole('button', { name: 'Xóa căn tự nhập' }).click();
  await expect(ct.getByText('Chỉ xóa khỏi Nguồn phòng của bạn.')).toBeVisible();
  expect(sql(`select count(*) from public.can where id = '${canId}'`)).toBe('1');
  await ct.getByRole('button', { name: 'Xác nhận xóa Villa Tuần Châu?' }).click();
  await expect(page.getByRole('heading', { name: 'Chưa có căn nào' })).toBeVisible();
  expect(sql(`select count(*) from public.can where id = '${canId}'`)).toBe('0');
  expect(sql(`select count(*) from public.booking where can_id = '${canId}'`)).toBe('0');
});
