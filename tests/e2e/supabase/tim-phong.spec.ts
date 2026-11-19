// Test e2e US44 · Tìm phòng trống theo ngày (YC7.2), trên Supabase chạy ở máy với hộp thư giả.
// Tên theo DLM (giả), email và số giả. Giá đặt cho tháng này và hai tháng sau để khoảng tìm luôn có giá.
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

/** Căn có lịch của `nguoi`, không tòa, giá 900.000đ mọi đêm tháng này và hai tháng sau. Trả id căn. */
function taoCan(nguoi: string, ma: string, pn: number, view: string | null): string {
  const id = sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu, loai_view)
                  values ('${nguoi}', '${ma}', ${pn}, ${view ? `'${view}'` : 'null'}) returning id`).split('\n')[0]!;
  const nay = homNay();
  sql(`insert into public.gia_thang (can_id, thang, gia_thuong, gia_cuoi_tuan)
       select '${id}', t, 900000, 900000 from unnest(array['${dauThang(nay)}', '${dauThang(nay, 1)}', '${dauThang(nay, 2)}']::date[]) t`);
  return id;
}

test('YC7.2-NT1 YC7.2-NT2 YC7.2-NT3 YC7.2-NT4 YC7.2-NT7 Sale Hùng tìm phòng: nút, ngày trả, gợi ý, tìm gần đây, loại view', async ({ page }) => {
  const hung = taoTaiKhoan('sale', 'Sale Hùng');
  const hungId = idCua(hung.email);
  const hoaId = idCua(taoTaiKhoan('chu_nha', 'Chị Hoa').email);
  taoCan(hungId, '0812', 2, 'bien');
  taoCan(hoaId, '1509', 2, 'bien');
  sql(`insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon, pham_vi)
       values ('${hoaId}', '${hungId}', 'da_ket_noi', 'link_moi', 'tat_ca')`);
  const nhan = cong(homNay(), 3);

  await dangNhapBangMa(page, hung.email);
  await expect(page.getByRole('heading', { name: 'Lịch phòng' })).toBeVisible();
  await page.getByRole('button', { name: 'Tìm phòng trống theo ngày' }).click();

  // YC7.2-NT1: chưa chọn ngày nhận thì nút mờ, ghi "Chọn ngày nhận để tìm phòng".
  await expect(page.getByRole('heading', { name: 'Tìm phòng' })).toBeVisible();
  await expect(page.getByText('Chọn ngày nhận để tìm phòng')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Tìm phòng trống' })).toBeDisabled();
  await expect(page.getByRole('navigation', { name: 'Tab' })).toHaveCount(0);

  // YC7.2-NT7: lọc "Loại view" đúng "Biển", "Thành phố", "Núi".
  await expect(page.getByRole('group', { name: 'Loại view' }).getByRole('button')).toHaveText(['Biển', 'Thành phố', 'Núi']);
  await expect(page.getByText('Vịnh')).toHaveCount(0);

  // YC7.2-NT2: chọn ngày nhận và "2 đêm" thì ngày trả là 2 ngày sau, nút sáng.
  await page.getByLabel('Ngày nhận').fill(nhan);
  await page.getByRole('button', { name: '2 đêm' }).click();
  await expect(page.getByLabel('Ngày trả')).toHaveValue(cong(nhan, 2));
  await expect(page.getByRole('button', { name: 'Tìm phòng trống' })).toBeEnabled();

  // YC7.2-NT3: lọc 3PN thì không có căn trống; S2-00 có gợi ý kèm số căn trống.
  await page.getByRole('button', { name: '3PN' }).click();
  await page.getByRole('button', { name: 'Tìm phòng trống' }).click();
  await expect(page.getByText('Không có căn trống')).toBeVisible();
  await expect(page.getByRole('heading', { name: `${dm(nhan)} → ${dm(cong(nhan, 2))} · 3PN · 2 đêm` })).toBeVisible();
  const goiY = page.getByRole('region', { name: 'Gợi ý' }).getByRole('button');
  await expect(goiY).toHaveText([/^Bỏ lọc số phòng ngủ2 căn trống$/, /^Thêm 2PN2 căn trống$/]);
  await expect(page.getByText('Căn tự nhập không có lịch tự động. Gọi chủ nhà để hỏi.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sửa tìm kiếm' })).toBeVisible();
  // Làm theo gợi ý thì đúng số căn trống đã báo.
  await goiY.filter({ hasText: 'Thêm 2PN' }).click();
  await expect(page.getByRole('heading', { name: 'Kết quả tìm phòng' })).toBeVisible();
  await expect(page.getByText('2 căn trống', { exact: true })).toBeVisible();

  // YC7.2-NT4: mở lại màn tìm, chạm dòng "Tìm gần đây" mới nhất thì điều kiện được điền sẵn.
  await page.getByRole('button', { name: 'Sửa tìm kiếm' }).click();
  await page.getByRole('button', { name: 'Quay lại' }).click();
  await expect(page.getByRole('heading', { name: 'Lịch phòng' })).toBeVisible();
  await page.getByRole('button', { name: 'Tìm phòng trống theo ngày' }).click();
  const ganDay = page.getByRole('region', { name: 'Tìm gần đây' }).getByRole('button');
  await expect(ganDay).toHaveText([`${dm(nhan)} → ${dm(cong(nhan, 2))} · 2PN, 3PN`, `${dm(nhan)} → ${dm(cong(nhan, 2))} · 3PN`]);
  await ganDay.first().click();
  await expect(page.getByLabel('Ngày nhận')).toHaveValue(nhan);
  await expect(page.getByLabel('Ngày trả')).toHaveValue(cong(nhan, 2));
  await expect(page.getByRole('button', { name: '2PN' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: '3PN' })).toHaveAttribute('aria-pressed', 'true');
});
