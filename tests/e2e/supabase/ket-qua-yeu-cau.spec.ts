// Test e2e US53 · Sale nhận kết quả yêu cầu (YC9.4), trên Supabase chạy ở máy với hộp thư giả.
// Tên theo DLM (giả), email và số giả. Sale gửi yêu cầu trên màn; chủ nhà trả lời bằng lệnh fn_* chạy dưới tên chủ nhà
// (màn trả lời đã có e2e ở tra-loi-yeu-cau.spec.ts); sale quay lại app (HV3) thì thấy kết quả.
// Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase (docs/dev/chay-va-test.md).
import { expect, test, type Page } from '@playwright/test';
import { dangNhapBangMa, idCua, sql, taoCanCoAnh, taoTaiKhoan } from './hoTro';

const homNay = () => new Date(Date.now() + 7 * 3_600_000).toISOString().slice(0, 10);
const cong = (n: string, d: number) => new Date(Date.parse(n + 'T00:00:00Z') + d * 86_400_000).toISOString().slice(0, 10);
const dauThang = (n: string, them = 0) => {
  const d = new Date(Date.parse(n.slice(0, 8) + '01T00:00:00Z'));
  d.setUTCMonth(d.getUTCMonth() + them);
  return d.toISOString().slice(0, 10);
};
const dm = (n: string) => `${n.slice(8, 10)}/${n.slice(5, 7)}`;

function giaThang(canId: string, nhan: string, gia: number) {
  sql(`insert into public.gia_thang (can_id, thang, gia_thuong, gia_cuoi_tuan)
       values ('${canId}', '${dauThang(nhan)}', ${gia}, ${gia}), ('${canId}', '${dauThang(nhan, 1)}', ${gia}, ${gia})`);
}

/** Chị Hoa có 1509 (1.100.000đ mỗi đêm), Anh Tuấn có 1103 (700.000đ); cả hai cho Sale Hùng xem; Hùng cộng mặc định 400k. */
function dung() {
  const hung = taoTaiKhoan('sale', 'Sale Hùng');
  const hungId = idCua(hung.email);
  const hoaId = idCua(taoTaiKhoan('chu_nha', 'Chị Hoa').email);
  const tuanId = idCua(taoTaiKhoan('chu_nha', 'Anh Tuấn').email);
  const nhan = cong(homNay(), 3);
  const tra = cong(nhan, 2);
  const c1509 = taoCanCoAnh(hoaId, '1509', 'ICON40', 2, 3, 'bien');
  const c1103 = taoCanCoAnh(tuanId, '1103', 'Sapphire', 3, 2, 'bien');
  giaThang(c1509, nhan, 1100000);
  giaThang(c1103, nhan, 700000);
  for (const chu of [hoaId, tuanId]) {
    sql(`insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon, pham_vi) values ('${chu}', '${hungId}', 'da_ket_noi', 'link_moi', 'tat_ca')`);
  }
  sql(`insert into public.cai_dat_rieng (nguoi_id, muc_cong_mac_dinh) values ('${hungId}', 400000)
       on conflict (nguoi_id) do update set muc_cong_mac_dinh = 400000`);
  return { hung, hungId, hoaId, nhan, tra, c1509 };
}

/** Sale gửi yêu cầu 1509 từ tìm phòng, tới S3-03; trả id yêu cầu. */
async function guiYeuCau(page: Page, d: ReturnType<typeof dung>): Promise<string> {
  await dangNhapBangMa(page, d.hung.email);
  await expect(page.getByRole('heading', { name: 'Lịch phòng' })).toBeVisible();
  await page.getByRole('button', { name: 'Tìm phòng trống theo ngày' }).click();
  await page.getByLabel('Ngày nhận').fill(d.nhan);
  await page.getByRole('button', { name: '2 đêm' }).click();
  await page.getByRole('button', { name: 'Tìm phòng trống' }).click();
  await page.getByRole('button', { name: 'ICON40 1509 · 2PN' }).click();
  await page.locator('[data-man="S3"]').getByRole('button', { name: 'Gửi yêu cầu đặt phòng' }).click();
  await page.locator('[data-man="S3-02"]').getByRole('button', { name: 'Gửi yêu cầu đặt phòng' }).click();
  await expect(page.locator('[data-man="S3-03"]').getByText('Đang chờ Chị Hoa chấp nhận')).toBeVisible();
  return sql(`select id from public.yeu_cau_dat_phong where sale_id = '${d.hungId}' and can_id = '${d.c1509}'`);
}

/** Chạy lệnh của chủ nhà dưới tên chủ nhà (auth.uid() đọc request.jwt.claims). */
function laChu(chuId: string, cau: string) {
  sql(`select set_config('request.jwt.claims', '{"sub":"${chuId}","role":"authenticated"}', true); ${cau}`);
}

/** HV3: rời app rồi quay lại. */
async function quayLaiTuNen(page: Page) {
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  // YC12.1-NT4: quay lại từ nền có thông báo mới thì popup nổi lên; đóng để bấm tiếp màn bên dưới.
  await page.getByRole('dialog').getByRole('button', { name: 'Đóng' }).click();
}

test('YC9.4-NT1 HV3-NT3 Chị Hoa chấp nhận: Sale Hùng quay lại app thấy S3-04', async ({ page }) => {
  const d = dung();
  const yId = await guiYeuCau(page, d);
  laChu(d.hoaId, `select public.fn_chap_nhan_yeu_cau('${yId}')`);
  await quayLaiTuNen(page);

  const s304 = page.locator('[data-man="S3-04"]');
  await expect(s304.getByText('Chị Hoa đã chấp nhận đặt phòng')).toBeVisible();
  await expect(s304.getByText(`Đặt phòng đã vào lịch của chủ nhà. Ngày ${dm(d.nhan)} → ${dm(d.tra)} hiện Kín với các sale khác.`)).toBeVisible();
  await expect(page.getByTestId('kq-gia-ban')).toContainText('3.000.000đ');
  await expect(page.getByTestId('kq-gia-chu')).toContainText('2.200.000đ');
  expect(sql(`select count(*) from public.thong_bao where nguoi_nhan = '${d.hungId}' and loai = 'yeu_cau_da_chot'`)).toBe('1');
  await s304.getByRole('button', { name: 'Về lịch phòng' }).click();
  await expect(page.getByRole('heading', { name: 'Lịch phòng' })).toBeVisible();
});

test('YC9.4-NT2 YC9.4-NT5 Chị Hoa từ chối: S3-05 có lý do và căn tương tự với giá bán, chạm mở S3', async ({ page }) => {
  const d = dung();
  const yId = await guiYeuCau(page, d);
  laChu(d.hoaId, `select public.fn_tu_choi_yeu_cau('${yId}', 'Đã có khách đặt')`);
  await quayLaiTuNen(page);

  const s305 = page.locator('[data-man="S3-05"]');
  await expect(s305.getByText('Yêu cầu bị từ chối')).toBeVisible();
  await expect(page.getByTestId('kq-ly-do')).toHaveText('Lý do: Chị Hoa không nhận đặt phòng · Đã có khách đặt.');
  await expect(s305.getByRole('heading', { name: 'Căn tương tự trống cùng ngày' })).toBeVisible();
  const the = page.getByTestId('can-tuong-tu');
  await expect(the).toHaveCount(1);
  await expect(the).toContainText('Sapphire 1103 · 3PN');
  await expect(the).toContainText('Bạn bán 2.200.000đ · Anh Tuấn');
  await expect(s305).not.toContainText('1.400.000');
  await expect(s305.getByRole('button', { name: 'Xem tất cả căn trống' })).toBeVisible();

  await the.getByRole('button').click();
  const s3 = page.locator('[data-man="S3"]');
  await expect(s3).toBeVisible();
  await expect(s3).toContainText('1103');
});
