// Test e2e US57 · Ghi đặt phòng cho căn tự nhập (YC10.4), trên Supabase chạy ở máy với hộp thư giả.
// Tên theo DLM (giả), email và số giả. Ngày theo hôm nay (giờ Việt Nam): ghi đêm mai để lịch 7 ngày thấy ô "Bạn".
// Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase (docs/dev/chay-va-test.md).
import { expect, test, type Page } from '@playwright/test';
import { dangNhapBangMa, idCua, sql, taoTaiKhoan } from './hoTro';

const homNay = () => new Date(Date.now() + 7 * 3_600_000).toISOString().slice(0, 10);
const cong = (n: string, d: number) => new Date(Date.parse(n + 'T00:00:00Z') + d * 86_400_000).toISOString().slice(0, 10);
const dm = (n: string) => `${n.slice(8, 10)}/${n.slice(5, 7)}`;
const oCua = (page: Page, ten: string) =>
  page.getByRole('row').filter({ has: page.locator('.s1-ten-chinh', { hasText: new RegExp(`^${ten}$`) }) }).getByRole('cell').allTextContents();

test('YC10.4-NT1 YC10.4-NT2 YC10.4-NT3 YC10.4-NT4 YC10.4-NT7 YC10.4-NT8 YC10.4-NT9 Sale Hùng ghi, xem, sửa, xóa đặt phòng cho căn tự nhập', async ({ page }) => {
  const hung = taoTaiKhoan('sale', 'Sale Hùng');
  const hungId = idCua(hung.email);
  const nay = homNay();
  const mai = cong(nay, 1);
  // Villa Tuần Châu (DLM): giá chủ 1.400.000đ; mức cộng riêng +200.000đ nên giá bán 1.600.000đ.
  const villa = sql(`insert into public.can (nguoi_giu, loai, ma_can, so_phong_ngu, chu_can_ten, chu_can_sdt, gia_chu_thuong, gia_chu_cuoi_tuan)
                     values ('${hungId}', 'tu_nhap', 'Villa Tuần Châu', 2, 'Chú Bình', '0900000099', 1400000, 1400000) returning id`).split('\n')[0]!;
  sql(`insert into public.muc_cong (sale_id, can_id, muc) values ('${hungId}', '${villa}', 200000)`);

  await dangNhapBangMa(page, hung.email);
  await page.getByRole('navigation', { name: 'Tab' }).getByRole('button', { name: 'Căn' }).click();
  await page.getByRole('button', { name: 'Villa Tuần Châu' }).click();
  await expect(page.locator('[data-man="S6-03-00"]')).toBeVisible();

  // YC10.4 bước 1: S6-05.
  await page.getByRole('button', { name: 'Đặt phòng' }).click();
  const tam = page.getByRole('dialog', { name: 'Đặt phòng' });
  await expect(tam.getByText('Villa Tuần Châu · đã chốt với chú Bình')).toBeVisible();
  await expect(tam.getByRole('button', { name: `Hôm nay ${dm(nay)}` })).toBeVisible();

  // YC10.4-NT1: chọn mai và 1 đêm.
  await tam.getByRole('button', { name: `Mai ${dm(mai)}` }).click();
  await expect(tam.getByTestId('dong-so-dem')).toHaveText(`${dm(mai)} → ${dm(cong(mai, 1))} (1 đêm)`);

  // YC10.4-NT2: điền sẵn giá chủ và giá bán.
  await expect(tam.getByLabel('Trả chủ (đ)')).toHaveValue('1.400.000');
  await expect(tam.getByLabel('Thu khách (đ)')).toHaveValue('1.600.000');
  await expect(tam.getByTestId('dong-loi')).toHaveText('Bạn lời 200.000đ');

  // YC10.4-NT3: sửa thu khách 1.700.000đ.
  await tam.getByLabel('Thu khách (đ)').fill('1700000');
  await expect(tam.getByTestId('dong-loi')).toHaveText('Bạn lời 300.000đ');

  // YC10.4-NT4: lưu, về S6-03 có đặt phòng mới, toast ghi tháng.
  await tam.getByRole('button', { name: 'Đặt phòng' }).click();
  await expect(page.getByText(new RegExp(`Đã lưu đặt phòng ${dm(mai)} → ${dm(cong(mai, 1))}\\. Tính vào thống kê tháng \\d+\\.`))).toBeVisible();
  await expect(tam).toHaveCount(0);
  const ct = page.locator('[data-man="S6-03"]');
  await expect(ct.getByTestId('dat-phong')).toContainText(`${dm(mai)} → ${dm(cong(mai, 1))} (1 đêm)`);
  await expect(ct.getByTestId('dat-phong')).toContainText('Trả chủ 1.400.000đ · Thu khách 1.700.000đ');
  await expect(ct.getByTestId('dat-phong')).toContainText('+300.000đ');
  expect(sql(`select b.tien_phong || ',' || r.tien_thu_khach || ',' || b.nguon || ',' || coalesce(b.trang_thai_tien, 'null')
              from public.booking b join public.booking_rieng r on r.booking_id = b.id where b.can_id = '${villa}'`))
    .toBe('1400000,1700000,sale_tu_ghi,null');

  // YC10.4-NT7: lịch 7 ngày ghi "Bạn" ở đêm mai, các ô khác "?".
  await ct.getByRole('button', { name: 'Quay lại' }).click();
  await page.getByRole('navigation', { name: 'Tab' }).getByRole('button', { name: 'Lịch' }).click();
  await expect(page.getByRole('heading', { name: 'Lịch phòng' })).toBeVisible();
  await expect.poll(() => oCua(page, 'Villa Tuần Châu')).toEqual(['?', 'Bạn', '?', '?', '?', '?', '?']);

  // YC10.4-NT8: chạm đặt phòng, đổi thu khách 1.800.000đ, "Lưu thay đổi".
  await page.getByRole('navigation', { name: 'Tab' }).getByRole('button', { name: 'Căn' }).click();
  await page.getByRole('button', { name: 'Villa Tuần Châu' }).click();
  await page.getByRole('button', { name: `Sửa đặt phòng ${dm(mai)} → ${dm(cong(mai, 1))} (1 đêm)` }).click();
  const sua = page.getByRole('dialog', { name: 'Sửa đặt phòng' });
  await expect(sua.getByLabel('Thu khách (đ)')).toHaveValue('1.700.000');
  await sua.getByLabel('Thu khách (đ)').fill('1800000');
  await sua.getByRole('button', { name: 'Lưu thay đổi' }).click();
  await expect(sua).toHaveCount(0);
  await expect(page.locator('[data-man="S6-03"]').getByTestId('dat-phong')).toContainText('Thu khách 1.800.000đ');
  expect(sql(`select b.ngay_nhan || ',' || b.ngay_tra || ',' || b.tien_phong || ',' || r.tien_thu_khach
              from public.booking b join public.booking_rieng r on r.booking_id = b.id where b.can_id = '${villa}'`))
    .toBe(`${mai},${cong(mai, 1)},1400000,1800000`);

  // YC10.4-NT9: bấm "Xóa đặt phòng" một lần chưa xóa; bấm xác nhận thì không còn, lịch 7 ngày về "?".
  await page.getByRole('button', { name: `Sửa đặt phòng ${dm(mai)} → ${dm(cong(mai, 1))} (1 đêm)` }).click();
  const xoa = page.getByRole('dialog', { name: 'Sửa đặt phòng' });
  await xoa.getByRole('button', { name: 'Xóa đặt phòng' }).click();
  expect(sql(`select count(*) from public.booking where can_id = '${villa}'`)).toBe('1');
  await xoa.getByRole('button', { name: `Xác nhận xóa đặt phòng ${dm(mai)} → ${dm(cong(mai, 1))}?` }).click();
  await expect(page.locator('[data-man="S6-03-00"]')).toBeVisible();
  expect(sql(`select count(*) from public.booking where can_id = '${villa}'`)).toBe('0');
  await page.getByRole('button', { name: 'Quay lại' }).click();
  await page.getByRole('navigation', { name: 'Tab' }).getByRole('button', { name: 'Lịch' }).click();
  await expect.poll(() => oCua(page, 'Villa Tuần Châu')).toEqual(Array(7).fill('?'));
});
