// Test e2e US39 · Chủ nhà duyệt lời xin xem lịch (YC6.5), trên Supabase chạy ở máy với hộp thư giả.
// Tên theo DLM (giả), email và số giả. Link xin lịch của sale tạo sẵn bằng SQL như fn_lay_link_xin_lich.
// Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase (docs/dev/chay-va-test.md).
import { expect, test } from '@playwright/test';
import { dangNhapBangMa, idCua, sql, taoCanCoAnh, taoTaiKhoan } from './hoTro';

function taoLinkXinLich(saleId: string): string {
  return sql(`insert into public.link_xin_lich (ma, sale_id) values (public.ma_link_chu_cai(), '${saleId}') returning ma`)
    .split('\n')[0]!;
}

const vietSo = (so: string) => so.replace(/^(\d{4})(\d{3})(\d{3})$/, '$1 $2 $3');

test('YC6.5-NT1 YC6.5-NT2 YC6.5-NT3 Chị Hoa mở link xin lịch của Sale Lan: A8 có tên và số; tắt cọc, đồng ý thì Lan ở "Đã kết nối"', async ({ page }) => {
  const lan = taoTaiKhoan('sale', 'Sale Lan');
  const lanId = idCua(lan.email);
  const ma = taoLinkXinLich(lanId);
  const hoa = taoTaiKhoan('chu_nha', 'Chị Hoa');
  const hoaId = idCua(hoa.email);
  taoCanCoAnh(hoaId, '1509', 'ICON40', 2, 3, 'view biển');

  // YC6.5-NT5: chưa đăng nhập thì đăng nhập trước, không thấy tên, số nào của sale.
  await page.goto(`/x/${ma}`);
  await expect(page.getByRole('button', { name: 'Tôi đã có tài khoản · Đăng nhập' })).toBeVisible();
  await expect(page.getByText('Sale Lan')).toHaveCount(0);

  await dangNhapBangMa(page, hoa.email);
  await expect(page.getByRole('heading', { name: 'Lịch' })).toBeVisible();
  await page.goto(`/x/${ma}`);

  // YC6.5-NT1: A8 có tên và số của Lan.
  await expect(page.getByRole('heading', { name: 'Lời mời xem lịch' })).toBeVisible();
  await expect(page.getByText('Sale Lan', { exact: true })).toBeVisible();
  await expect(page.getByText(vietSo(lan.so))).toBeVisible();
  const coc = page.getByRole('switch', { name: 'Tình trạng cọc' });
  await expect(coc).toHaveAttribute('aria-checked', 'true');
  expect(sql(`select count(*) from public.ket_noi where chu_id = '${hoaId}'`)).toBe('0');

  // YC6.5-NT2: tắt cọc rồi đồng ý.
  await coc.click();
  await expect(coc).toHaveAttribute('aria-checked', 'false');
  await page.getByRole('button', { name: 'Đồng ý cho xem lịch' }).click();

  // YC6.5 bước 2, YC6.5-NT3: về tab Sale, toast, Lan ở nhóm "Đã kết nối".
  await expect(page.getByRole('status').filter({ hasText: 'Đã cho Sale Lan xem lịch' })).toBeVisible();
  await expect(page).toHaveURL(/\/sale$/);
  await expect(page.getByRole('region', { name: 'Đã kết nối · 1' })).toContainText('Sale Lan');
  expect(sql(`select trang_thai || '|' || nguon || '|' || pham_vi || '|' || xem_coc from public.ket_noi
              where chu_id = '${hoaId}' and sale_id = '${lanId}'`)).toBe('da_ket_noi|sale_xin|tat_ca|false');
  expect(sql(`select count(*) from public.thong_bao where nguoi_nhan = '${lanId}' and loai = 'chu_dong_y_ket_noi'`)).toBe('1');

  // YC6.5-NT6: mở lại link và đồng ý lần nữa: vẫn một kết nối, cọc giữ tắt.
  await page.goto(`/x/${ma}`);
  await page.getByRole('button', { name: 'Đồng ý cho xem lịch' }).click();
  await expect(page).toHaveURL(/\/sale$/);
  expect(sql(`select count(*) || '|' || bool_and(not xem_coc) from public.ket_noi where chu_id = '${hoaId}' and sale_id = '${lanId}'`))
    .toBe('1|true');
});

test('YC6.5-NT7 Sale Lan mở link xin lịch của chính mình thì thấy A8-01, không tạo kết nối', async ({ page }) => {
  const lan = taoTaiKhoan('sale', 'Sale Lan');
  const lanId = idCua(lan.email);
  const ma = taoLinkXinLich(lanId);
  await dangNhapBangMa(page, lan.email);
  await expect(page.getByRole('heading', { name: 'Lịch phòng' })).toBeVisible();
  await page.goto(`/x/${ma}`);
  await expect(page.getByText('Bạn không còn xem được mục này')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Đồng ý cho xem lịch' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Về Lịch' }).click();
  await expect(page).toHaveURL(/\/$/);
  expect(sql(`select count(*) from public.ket_noi where chu_id = '${lanId}' or sale_id = '${lanId}'`)).toBe('0');
});
