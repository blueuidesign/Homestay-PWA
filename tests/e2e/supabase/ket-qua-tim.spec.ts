// Test e2e US45 · Kết quả tìm phòng (YC7.3), trên Supabase chạy ở máy với hộp thư giả.
// Tên theo DLM (giả), email và số giả. Giá đặt cho tháng này và tháng sau để khoảng tìm (3 ngày tới) luôn có giá.
// Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase (docs/dev/chay-va-test.md).
import { expect, test } from '@playwright/test';
import { dangNhapBangMa, idCua, sql, taoTaiKhoan } from './hoTro';

const homNay = () => new Date(Date.now() + 7 * 3_600_000).toISOString().slice(0, 10);
const cong = (n: string, d: number) => new Date(Date.parse(n + 'T00:00:00Z') + d * 86_400_000).toISOString().slice(0, 10);
const dauThang = (n: string, them = 0) => {
  const d = new Date(Date.parse(n.slice(0, 8) + '01T00:00:00Z'));
  d.setUTCMonth(d.getUTCMonth() + them);
  return d.toISOString().slice(0, 10);
};
const dm = (n: string) => `${n.slice(8, 10)}/${n.slice(5, 7)}`;

/** Căn có lịch của `nguoi` (tòa tạo nếu chưa có), cùng một giá mọi đêm tháng này và tháng sau. Trả id căn. */
function taoCan(nguoi: string, ma: string, toa: string | null, pn: number, view: string | null, gia: number): string {
  if (toa) sql(`insert into public.toa_nha (ten, home247_dat_san) select '${toa}', true
                where not exists (select 1 from public.toa_nha where lower(btrim(ten)) = lower('${toa}'))`);
  const id = sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu, loai_view, toa_nha_id)
                  values ('${nguoi}', '${ma}', ${pn}, ${view ? `'${view}'` : 'null'},
                          ${toa ? `(select id from public.toa_nha where lower(btrim(ten)) = lower('${toa}') limit 1)` : 'null'})
                  returning id`).split('\n')[0]!;
  const nay = homNay();
  sql(`insert into public.gia_thang (can_id, thang, gia_thuong, gia_cuoi_tuan)
       values ('${id}', '${dauThang(nay)}', ${gia}, ${gia}), ('${id}', '${dauThang(nay, 1)}', ${gia}, ${gia})`);
  return id;
}

test('YC7.3-NT1 YC7.3-NT2 YC7.3-NT3 YC7.3-NT4 YC7.3-NT5 YC7.3-NT6 Sale Hùng xem kết quả tìm: nhóm, giá, chọn căn, lịch tuần, chạm căn', async ({ page }) => {
  const hung = taoTaiKhoan('sale', 'Sale Hùng');
  const hungId = idCua(hung.email);
  const hoaId = idCua(taoTaiKhoan('chu_nha', 'Chị Hoa').email);
  const tuanId = idCua(taoTaiKhoan('chu_nha', 'Anh Tuấn').email);
  const nhan = cong(homNay(), 3);

  // Căn của tôi: Green Bay 0812 trống, Mường Thanh 1605 kín đêm nhận. Nguồn: 3402, 1509 (Chị Hoa), 1103, 2208 (Anh Tuấn).
  taoCan(hungId, '0812', 'Green Bay', 2, 'bien', 750000);
  const c1605 = taoCan(hungId, '1605', 'Mường Thanh', 1, 'bien', 600000);
  taoCan(hoaId, '3402', null, 1, 'bien', 950000);
  taoCan(hoaId, '1509', 'ICON40', 2, 'bien', 1100000);
  taoCan(tuanId, '1103', 'Sapphire', 3, 'thanh_pho', 700000);
  taoCan(tuanId, '2208', 'À La Carte', 1, 'bien', 1500000);
  sql(`insert into public.can (nguoi_giu, loai, ma_can, chu_can_ten, gia_chu_thuong, gia_chu_cuoi_tuan)
       values ('${hungId}', 'tu_nhap', 'Villa Tuần Châu', 'Chú Bình', 1400000, 1400000)`);
  sql(`insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon, pham_vi)
       values ('${hoaId}', '${hungId}', 'da_ket_noi', 'link_moi', 'tat_ca'), ('${tuanId}', '${hungId}', 'da_ket_noi', 'link_moi', 'tat_ca')`);
  // Mức cộng mặc định +400k, không có mức cộng riêng căn (YC7.3-NT2).
  sql(`insert into public.cai_dat_rieng (nguoi_id, muc_cong_mac_dinh) values ('${hungId}', 400000)
       on conflict (nguoi_id) do update set muc_cong_mac_dinh = 400000`);
  sql(`with b as (insert into public.booking (can_id, ngay_nhan, ngay_tra, nguon, tao_boi, tien_phong)
                  values ('${c1605}', '${nhan}', '${cong(nhan, 1)}', 'chu_ghi', '${hungId}', 600000) returning id)
       insert into public.booking_dem (booking_id, dem, tien) select id, '${nhan}', 600000 from b`);

  await dangNhapBangMa(page, hung.email);
  await expect(page.getByRole('heading', { name: 'Lịch phòng' })).toBeVisible();
  await page.getByRole('button', { name: 'Tìm phòng trống theo ngày' }).click();
  await page.getByLabel('Ngày nhận').fill(nhan);
  await page.getByRole('button', { name: '2 đêm' }).click();
  await page.getByRole('button', { name: 'Tìm phòng trống' }).click();

  // YC7.3-NT1: "5 căn trống", 1 ở "Của tôi", 4 ở "Nguồn phòng", Villa Tuần Châu riêng.
  await expect(page.getByText('5 căn trống', { exact: true })).toBeVisible();
  await expect(page.getByTestId('dieu-kien')).toHaveText(`${dm(nhan)} → ${dm(cong(nhan, 2))} · 2 đêm`);
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(['Của tôi · 1', 'Nguồn phòng · 4', 'Tự nhập · chưa biết lịch']);
  const the = (nhom: string) => page.getByRole('region', { name: nhom }).locator('.kq-the-ten');
  await expect(the('Của tôi · 1')).toHaveText(['Green Bay 0812']);
  await expect(the('Nguồn phòng · 4')).toHaveText(['3402 · 1PN', 'À La Carte 2208 · 1PN', 'ICON40 1509 · 2PN', 'Sapphire 1103 · 3PN']);
  await expect(the('Tự nhập · chưa biết lịch')).toHaveText(['Villa Tuần Châu']);

  // YC7.3-NT2: 1509 2 đêm × 1.100.000đ, mức cộng mặc định +400k mỗi đêm.
  await expect(page.getByRole('button', { name: 'ICON40 1509 · 2PN' }).getByTestId('gia')).toHaveText('2.200.000đ · bạn bán 3.000.000đ');
  await expect(page.getByRole('button', { name: 'ICON40 1509 · 2PN' })).toContainText('✓ Lịch cập nhật');
  await expect(page.getByRole('button', { name: 'Green Bay 0812' })).toContainText('✓ Lịch của bạn, luôn đúng');

  // YC7.3-NT5: căn tự nhập ghi rõ không có lịch, gợi ý gọi chủ căn.
  await expect(page.getByRole('button', { name: 'Villa Tuần Châu' })).toContainText('Tự nhập · không có lịch, gọi chú Bình hỏi');

  // YC7.3-NT3: tích 3 căn.
  for (const ten of ['Green Bay 0812', '3402 · 1PN', 'ICON40 1509 · 2PN']) await page.getByRole('checkbox', { name: `Chọn ${ten}` }).click();
  await expect(page.getByText('Đã chọn 3 căn')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Gửi cho khách' })).toBeEnabled();
  // Từ US48 nút này mở S5 (YC8.1); Quay lại thì về S2, vẫn giữ 3 căn đã chọn.
  await page.getByRole('button', { name: 'Gửi cho khách' }).click();
  await expect(page.getByRole('heading', { name: 'Gửi cho khách' })).toBeVisible();
  await page.getByRole('button', { name: 'Quay lại' }).click();

  // YC7.3-NT4: "Lịch tuần" cùng điều kiện, cùng tập căn; bảy ngày từ ngày nhận; căn tự nhập "?".
  await page.getByRole('button', { name: 'Lịch tuần' }).click();
  await expect(page.getByTestId('dieu-kien')).toHaveText(`${dm(nhan)} → ${dm(cong(nhan, 2))}`);
  await expect(page.getByText('5 căn trống', { exact: true })).toBeVisible();
  const bang = page.getByRole('table', { name: 'Lịch tuần kết quả tìm' });
  await expect(bang.locator('[role="row"][data-can] .s1-ten-chinh'))
    .toHaveText(['Green Bay 0812', '3402', 'À La Carte 2208', 'ICON40 1509', 'Sapphire 1103', 'Villa Tuần Châu']);
  await expect(bang.getByRole('columnheader').nth(1)).toHaveAttribute('aria-label', new RegExp(`${nhan.slice(8, 10)}$`));
  await expect(bang.locator('[role="row"][data-can]').last().getByRole('cell')).toHaveText(Array(7).fill('?'));
  await expect(bang.locator('[role="row"][data-can]').nth(3).getByRole('cell').first()).toHaveText('1,5tr');
  await expect(page.getByText('Đã chọn 3 căn')).toBeVisible();
  await page.getByRole('button', { name: 'Danh sách' }).click();
  await expect(the('Nguồn phòng · 4')).toHaveText(['3402 · 1PN', 'À La Carte 2208 · 1PN', 'ICON40 1509 · 2PN', 'Sapphire 1103 · 3PN']);
  await expect(page.getByText('Đã chọn 3 căn')).toBeVisible();

  // YC7.3-NT6: chạm Green Bay 0812 mở S6-07, Villa Tuần Châu mở S6-03.
  await page.getByRole('button', { name: 'Green Bay 0812' }).click();
  await expect(page.locator('[data-man="S6-07"]')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Green Bay 0812' })).toBeVisible();
  await page.getByRole('button', { name: 'Quay lại' }).click();
  await page.getByRole('button', { name: 'Villa Tuần Châu' }).click();
  await expect(page.locator('[data-man="S6-03"]')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Villa Tuần Châu' })).toBeVisible();
  await expect(page.locator('[data-man="S3"]')).toHaveCount(0);
});
