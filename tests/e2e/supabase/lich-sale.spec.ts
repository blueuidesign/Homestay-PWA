// Test e2e US43 · Màn đầu tiên và lịch 7 ngày của sale (YC7.1), trên Supabase chạy ở máy với hộp thư giả.
// Tên theo DLM (giả), email và số giả. Giá đặt cho tháng này và tháng sau để bảy ngày từ hôm nay luôn có giá.
// Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase (docs/dev/chay-va-test.md).
import { expect, test, type Page } from '@playwright/test';
import { dangNhapBangMa, idCua, sql, taoTaiKhoan } from './hoTro';

const homNay = () => new Date(Date.now() + 7 * 3_600_000).toISOString().slice(0, 10);
const cong = (n: string, d: number) => new Date(Date.parse(n + 'T00:00:00Z') + d * 86_400_000).toISOString().slice(0, 10);
const dauThang = (n: string, them = 0) => {
  const d = new Date(Date.parse(n.slice(0, 8) + '01T00:00:00Z'));
  d.setUTCMonth(d.getUTCMonth() + them);
  return d.toISOString().slice(0, 10);
};

/** Căn có lịch của `nguoi` (tòa tạo nếu chưa có) với giá tháng này và tháng sau. Trả id căn. */
function taoCan(nguoi: string, ma: string, toa: string | null, pn: number, view: string | null, thuong: number, cuoiTuan: number): string {
  if (toa) sql(`insert into public.toa_nha (ten, home247_dat_san) select '${toa}', true
                where not exists (select 1 from public.toa_nha where lower(btrim(ten)) = lower('${toa}'))`);
  const id = sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu, loai_view, toa_nha_id)
                  values ('${nguoi}', '${ma}', ${pn}, ${view ? `'${view}'` : 'null'},
                          ${toa ? `(select id from public.toa_nha where lower(btrim(ten)) = lower('${toa}') limit 1)` : 'null'})
                  returning id`).split('\n')[0]!;
  const nay = homNay();
  sql(`insert into public.gia_thang (can_id, thang, gia_thuong, gia_cuoi_tuan)
       values ('${id}', '${dauThang(nay)}', ${thuong}, ${cuoiTuan}), ('${id}', '${dauThang(nay, 1)}', ${thuong}, ${cuoiTuan})`);
  return id;
}

/** Đặt phòng một đêm `dem` ở căn `canId` (tiền từng đêm khớp tiền phòng). */
function datMotDem(canId: string, taoBoi: string, dem: string, nguon: 'chu_ghi' | 'sale_tu_ghi'): void {
  sql(`with b as (insert into public.booking (can_id, ngay_nhan, ngay_tra, nguon, tao_boi, tien_phong)
                  values ('${canId}', '${dem}', '${cong(dem, 1)}', '${nguon}', '${taoBoi}', 1000000) returning id)
       insert into public.booking_dem (booking_id, dem, tien) select id, '${dem}', 1000000 from b`);
}

const tenTrongNhom = (page: Page, nhom: string) =>
  page.getByRole('rowgroup', { name: nhom }).locator('.s1-ten-chinh').allTextContents();
const oCua = (page: Page, ten: string) =>
  page.getByRole('row').filter({ has: page.locator('.s1-ten-chinh', { hasText: new RegExp(`^${ten}$`) }) }).getByRole('cell').allTextContents();

test('YC7.1-NT1 sale mới chưa có căn: A5 với hai nút, thanh tab không có "Tìm phòng"', async ({ page }) => {
  const nga = taoTaiKhoan('sale', 'Sale Nga');
  await dangNhapBangMa(page, nga.email);
  await expect(page.getByRole('heading', { name: 'Lịch phòng' })).toBeVisible();
  await expect(page.getByText('Chưa có nguồn phòng')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Gửi tin nhắn xin lịch đến chủ nhà' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Thêm căn thủ công/ })).toBeVisible();
  const tab = page.getByRole('navigation', { name: 'Tab' }).getByRole('button');
  await expect(tab).toHaveText(['Lịch', 'Căn', 'Thống kê', 'Cá nhân']);
  await expect(page.getByText('Tìm phòng', { exact: true })).toHaveCount(0);
});

test('YC7.1-NT2 YC7.1-NT3 YC7.1-NT5 YC7.1-NT7 YC7.1-NT8 Sale Hùng: hai nhóm, giá bán, "Kín", "?", "Bạn", sắp xếp, xoay ngang', async ({ page }) => {
  const hung = taoTaiKhoan('sale', 'Sale Hùng');
  const hungId = idCua(hung.email);
  const hoaId = idCua(taoTaiKhoan('chu_nha', 'Chị Hoa').email);
  const tuanId = idCua(taoTaiKhoan('chu_nha', 'Anh Tuấn').email);
  const nay = homNay();

  // Căn của tôi (DLM.3): Green Bay 0812, Mường Thanh 1605.
  taoCan(hungId, '0812', 'Green Bay', 2, 'bien', 750000, 750000);
  taoCan(hungId, '1605', 'Mường Thanh', 1, 'bien', 600000, 600000);
  // Nguồn phòng: 3402, ICON40 1509 của Chị Hoa; Sapphire 1103, À La Carte 2208 của Anh Tuấn; Villa Tuần Châu tự nhập.
  const c3402 = taoCan(hoaId, '3402', null, 1, null, 800000, 1100000);
  const c1509 = taoCan(hoaId, '1509', 'ICON40', 2, 'bien', 900000, 900000);
  taoCan(tuanId, '1103', 'Sapphire', 3, null, 1500000, 1500000);
  taoCan(tuanId, '2208', 'À La Carte', 1, 'bien', 500000, 500000);
  const villa = sql(`insert into public.can (nguoi_giu, loai, ma_can, chu_can_ten, gia_chu_thuong, gia_chu_cuoi_tuan)
                     values ('${hungId}', 'tu_nhap', 'Villa Tuần Châu', 'Chú Bình', 1400000, 1400000) returning id`).split('\n')[0]!;
  sql(`insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon, pham_vi)
       values ('${hoaId}', '${hungId}', 'da_ket_noi', 'link_moi', 'tat_ca'), ('${tuanId}', '${hungId}', 'da_ket_noi', 'link_moi', 'tat_ca')`);
  // Mức cộng của Hùng: mặc định +400k, 1509 +200k (DLM.3).
  sql(`insert into public.cai_dat_rieng (nguoi_id, muc_cong_mac_dinh) values ('${hungId}', 400000) on conflict (nguoi_id) do update set muc_cong_mac_dinh = 400000`);
  sql(`insert into public.muc_cong (sale_id, can_id, muc) values ('${hungId}', '${c1509}', 200000)`);
  // Kín: 3402 đêm mai (Chị Hoa ghi). Bạn: Villa Tuần Châu đêm mai (Hùng tự ghi).
  datMotDem(c3402, hoaId, cong(nay, 1), 'chu_ghi');
  datMotDem(villa, hungId, cong(nay, 1), 'sale_tu_ghi');

  await dangNhapBangMa(page, hung.email);
  await expect(page.getByRole('heading', { name: 'Lịch phòng' })).toBeVisible();
  const dm = (n: string) => `${n.slice(8, 10)}/${n.slice(5, 7)}`;
  await expect(page.getByText(`7 ngày tới · ${dm(nay)} → ${dm(cong(nay, 6))}`)).toBeVisible();

  // YC7.1-NT2: "Căn của tôi · 2" trên "Nguồn phòng · 5".
  await expect(page.getByRole('rowgroup')).toHaveCount(2);
  expect(await page.getByRole('rowgroup').evaluateAll((ds) => ds.map((d) => d.getAttribute('aria-label'))))
    .toEqual(['Căn của tôi · 2', 'Nguồn phòng · 5']);
  await expect(page.getByText('Căn của tôi · 2')).toHaveCSS('text-transform', 'uppercase');
  expect(await tenTrongNhom(page, 'Căn của tôi · 2')).toEqual(['Green Bay 0812', 'Mường Thanh 1605']);
  expect(await tenTrongNhom(page, 'Nguồn phòng · 5')).toEqual(['3402', 'À La Carte 2208', 'ICON40 1509', 'Sapphire 1103', 'Villa Tuần Châu']);

  // YC7.1-NT3: đêm mai của 3402 "Kín"; đêm thường trống ghi giá bán 800.000đ + 400.000đ = "1,2tr", cuối tuần 1,5tr.
  const o3402 = await oCua(page, '3402');
  expect(o3402[1]).toBe('Kín');
  for (let i = 0; i < 7; i++) {
    if (i === 1) continue;
    const thu = new Date(Date.parse(cong(nay, i) + 'T00:00:00Z')).getUTCDay();
    expect(o3402[i]).toBe(thu === 5 || thu === 6 ? '1,5tr' : '1,2tr');
  }
  expect(await oCua(page, 'ICON40 1509')).toEqual(Array(7).fill('1,1tr'));
  expect(await oCua(page, 'Green Bay 0812')).toEqual(Array(7).fill('750k'));

  // YC7.1-NT5: căn tự nhập: "?" trừ đêm Hùng đã ghi ("Bạn"); không ô nào ghi giá.
  expect(await oCua(page, 'Villa Tuần Châu')).toEqual(['?', 'Bạn', '?', '?', '?', '?', '?']);
  await expect(page.getByText('Chú Bình · tự nhập')).toBeVisible();

  // YC7.1-NT7: "Giá tăng dần": mỗi nhóm theo giá đêm đầu, "Căn của tôi" vẫn trên cùng, căn không có giá cuối.
  await page.getByRole('button', { name: 'Theo tên' }).click();
  const tam = page.getByRole('dialog', { name: 'Sắp xếp' });
  await expect(tam.getByText('Căn của tôi luôn hiện đầu danh sách.')).toBeVisible();
  await tam.getByRole('button', { name: 'Giá tăng dần' }).click();
  await expect(page.getByRole('button', { name: 'Giá tăng dần' })).toBeVisible();
  expect(await page.getByRole('rowgroup').evaluateAll((ds) => ds.map((d) => d.getAttribute('aria-label'))))
    .toEqual(['Căn của tôi · 2', 'Nguồn phòng · 5']);
  expect(await tenTrongNhom(page, 'Căn của tôi · 2')).toEqual(['Mường Thanh 1605', 'Green Bay 0812']);
  expect(await tenTrongNhom(page, 'Nguồn phòng · 5')).toEqual(['À La Carte 2208', 'ICON40 1509', '3402', 'Sapphire 1103', 'Villa Tuần Châu']);

  // YC7.1-NT8: nghiêng máy (khung ngang) thì bảng vẫn dọc; chạm "Xoay ngang" thì S1-05, nút "Xoay dọc", không có thanh tab.
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator('[data-man="S1"]')).toBeVisible();
  await expect(page.locator('[data-man="S1-05"]')).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Xoay ngang' }).click();
  const ngang = page.locator('[data-man="S1-05"]');
  await expect(ngang).toBeVisible();
  await expect(page.getByRole('button', { name: 'Xoay dọc' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Tab' })).toHaveCount(0);
  // Khung quay 90 độ: chiều rộng hiện trên màn bằng chiều cao khung.
  const hop = await ngang.boundingBox();
  expect(Math.round(hop!.width)).toBe(390);
  expect(Math.round(hop!.height)).toBe(844);
  await page.getByRole('button', { name: 'Xoay dọc' }).click();
  await expect(page.locator('[data-man="S1"]')).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Tab' })).toBeVisible();

  // YC7.1 bước 6: › tiến 7 ngày, ‹ lùi về.
  await page.getByRole('button', { name: '7 ngày sau' }).click();
  await expect(page.getByText(`${dm(cong(nay, 7))} → ${dm(cong(nay, 13))}`, { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '7 ngày trước' }).click();
  await expect(page.getByText(`7 ngày tới · ${dm(nay)} → ${dm(cong(nay, 6))}`)).toBeVisible();
});
