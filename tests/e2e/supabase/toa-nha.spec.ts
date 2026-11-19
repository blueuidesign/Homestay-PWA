// Test e2e US17 · Tòa nhà, loại view, số giường, mô tả (YC3.4), trên Supabase chạy ở máy với hộp thư giả. Tên, email đều giả.
// Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase (docs/dev/chay-va-test.md).
import { randomBytes } from 'node:crypto';
import { expect, test, type Page } from '@playwright/test';
import { dangNhapBangMa, sql, taoTaiKhoan } from './hoTro';

const idCua = (email: string) => sql(`select id from auth.users where email = '${email}'`);
const duoi = () => randomBytes(3).toString('hex');

async function moPhanThem(page: Page, maCan: string, phong: string) {
  await page.getByRole('button', { name: 'Căn', exact: true }).click();
  await page.getByRole('button', { name: /^Thêm căn( đầu tiên| khác)?$/ }).first().click();
  await expect(page.getByRole('heading', { name: 'Thêm căn' })).toBeVisible();
  await page.getByLabel(/Mã căn \(tên căn hộ\)/).fill(maCan);
  await page.getByRole('button', { name: phong, exact: true }).click();
  await page.getByRole('button', { name: /Thêm tòa nhà, mô tả gửi khách, view\.\.\./ }).click();
  await expect(page.getByRole('button', { name: '+ Tòa khác' })).toBeVisible();
}

test('YC3.4-NT2 YC3.4 luồng chính: chọn tòa có sẵn ở CN5-A1b, view Biển, 3 giường, mô tả, lưu thì thẻ căn ghi đúng', async ({ page }) => {
  // Tòa Home247 đặt sẵn có khu vực (YC3-H5). Tên riêng mỗi lượt chạy để không vướng dữ liệu lượt trước.
  const tenToa = `Green Bay ${duoi()}`;
  sql(`insert into public.toa_nha (ten, home247_dat_san, khu_vuc) values ('${tenToa}', true, 'Bãi Cháy')`);
  const chu = taoTaiKhoan('chu_nha', 'Chủ Tòa Nhà');
  await dangNhapBangMa(page, chu.email);
  await moPhanThem(page, '0808', '2PN');

  // YC3.4-NT2: đúng ba chip view, không có "Vịnh".
  const nhomView = page.getByRole('group', { name: 'Loại view' });
  await expect(nhomView.getByRole('button')).toHaveText(['Biển', 'Thành phố', 'Núi']);
  await expect(page.getByRole('button', { name: 'Vịnh' })).toHaveCount(0);

  // YC3.4 bước 30 đến 32: "+ Tòa khác", gõ tên, chọn tòa trong danh sách.
  await page.getByRole('button', { name: '+ Tòa khác' }).click();
  await expect(page.getByText('Chọn tòa có sẵn để sale lọc đúng tòa. Không thấy thì thêm tòa mới.')).toBeVisible();
  await page.getByLabel('Tên tòa nhà').fill(tenToa.toLowerCase());
  const ds = page.getByRole('list', { name: 'Danh sách tòa' });
  await expect(ds.getByRole('button')).toHaveCount(2);
  await expect(ds.getByRole('button').first()).toContainText(tenToa);
  await expect(ds.getByRole('button').first()).toContainText('Bãi Cháy');
  await expect(ds.getByRole('button').nth(1)).toHaveText(`+ Thêm tòa mới "${tenToa.toLowerCase()}"`);
  await ds.getByRole('button', { name: new RegExp(tenToa) }).click();
  await expect(page.getByRole('button', { name: tenToa, exact: true })).toHaveAttribute('aria-pressed', 'true');

  await nhomView.getByRole('button', { name: 'Biển' }).click();
  await page.getByLabel('Số giường').fill('3');
  await page.getByLabel(/Mô tả gửi khách/).fill('Căn góc, ban công rộng.');
  // YC3.4 bước 34: thu gọn vẫn giữ giá trị.
  await page.getByRole('button', { name: 'Thu gọn' }).click();
  await expect(page.getByLabel('Số giường')).toHaveCount(0);
  await page.getByRole('button', { name: 'Thêm căn', exact: true }).click();

  await expect(page.getByRole('status').filter({ hasText: 'Đã thêm phòng 0808' })).toBeVisible();
  const the = page.getByRole('button', { name: 'Phòng 0808' });
  await expect(the).toContainText(`2PN · 3 giường · view biển · ${tenToa}`);
  expect(sql(`select c.loai_view || '|' || c.so_giuong || '|' || t.ten || '|' || c.mo_ta from public.can c
              join public.toa_nha t on t.id = c.toa_nha_id
              where c.nguoi_giu = '${idCua(chu.email)}' and c.ma_can = '0808'`))
    .toBe(`bien|3|${tenToa}|Căn góc, ban công rộng.`);
});

test('YC3.4-NT3 YC3.4 bước 33 thêm tòa mới ở CN5-A1b thì tòa được chọn cho căn, chủ nhà khác thấy tòa đó', async ({ page, browser }) => {
  const tenToa = `Bim Hạ Long ${duoi()}`;
  const hoa = taoTaiKhoan('chu_nha', 'Chủ Thêm Tòa');
  await dangNhapBangMa(page, hoa.email);
  await moPhanThem(page, '1203', '1PN');
  await page.getByRole('button', { name: '+ Tòa khác' }).click();
  await page.getByLabel('Tên tòa nhà').fill(tenToa);
  await page.getByRole('button', { name: `+ Thêm tòa mới "${tenToa}"` }).click();
  await expect(page.getByRole('button', { name: tenToa, exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Thêm căn', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Phòng 1203' })).toContainText(`1PN · ${tenToa}`);
  expect(sql(`select count(*) from public.toa_nha where lower(ten) = lower('${tenToa}') and tao_boi = '${idCua(hoa.email)}'`)).toBe('1');

  // Chủ nhà khác mở CN5-A1b thấy tòa vừa thêm (QT6.3).
  const tuan = taoTaiKhoan('chu_nha', 'Chủ Thấy Tòa');
  const trang = await (await browser.newContext()).newPage();
  await dangNhapBangMa(trang, tuan.email);
  await moPhanThem(trang, '2201', '2PN');
  await trang.getByRole('button', { name: '+ Tòa khác' }).click();
  await trang.getByLabel('Tên tòa nhà').fill(tenToa.toUpperCase());
  await expect(trang.getByRole('list', { name: 'Danh sách tòa' }).getByRole('button', { name: tenToa, exact: true })).toBeVisible();
});
