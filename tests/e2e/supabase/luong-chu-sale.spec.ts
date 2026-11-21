// Test e2e các luồng có cả chủ nhà và sale cùng tham gia, chạy song song hai tài khoản trên hai trình duyệt riêng
// (hai context), như một người test tay cầm hai điện thoại. Khác các spec theo US: bước nào của bên kia cũng làm trên màn,
// chỉ dựng bằng SQL những gì không thuộc luồng (tài khoản, căn, giá tháng).
// Supabase chạy ở máy với hộp thư giả. Tên theo DLM (giả), email và số giả.
// Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase/luong-chu-sale.spec.ts (docs/dev/chay-va-test.md).
import { expect, test, type Browser, type Page } from '@playwright/test';
import { dangNhapBangMa, emailMoi, idCua, layMa, nhapMa, soMoi, sql, taoCanCoAnh, taoTaiKhoan } from './hoTro';

const homNay = () => new Date(Date.now() + 7 * 3_600_000).toISOString().slice(0, 10);
const cong = (n: string, d: number) => new Date(Date.parse(n + 'T00:00:00Z') + d * 86_400_000).toISOString().slice(0, 10);
const dauThang = (n: string, them = 0) => {
  const d = new Date(Date.parse(n.slice(0, 8) + '01T00:00:00Z'));
  d.setUTCMonth(d.getUTCMonth() + them);
  return d.toISOString().slice(0, 10);
};
// Mỗi luồng là nhiều màn của hai, ba người nối nhau, dài hơn một spec theo US.
test.describe.configure({ timeout: 90_000 });

const dm = (n: string) => `${n.slice(8, 10)}/${n.slice(5, 7)}`;

/** Một "điện thoại": context riêng, bảng chia sẻ giả ghi lại tin vào window.tinDaChiaSe, cho đọc và ghi bộ nhớ tạm. */
async function dienThoai(browser: Browser): Promise<Page> {
  const ctx = await browser.newContext();
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write']);
  await ctx.addInitScript(() => {
    const w = window as unknown as { tinDaChiaSe: string[] };
    w.tinDaChiaSe = [];
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async (d: { text?: string; url?: string }) => { w.tinDaChiaSe.push(`${d.text ?? ''} ${d.url ?? ''}`); },
    });
  });
  return ctx.newPage();
}
const tinDaChiaSe = (p: Page) => p.evaluate(() => (window as unknown as { tinDaChiaSe: string[] }).tinDaChiaSe);

/** Ghi lại mọi phản hồi từ Supabase mà một điện thoại nhận, để kiểm dữ liệu không được gửi xuống máy. */
function ghiPhanHoi(p: Page): string[] {
  const ds: string[] = [];
  p.on('response', async (r) => {
    if (!r.url().includes(':54321/')) return;
    try { ds.push(await r.text()); } catch { /* phản hồi không đọc được (chuyển hướng) */ }
  });
  return ds;
}

/** Chủ nhà có căn 1509 (ICON40, 2PN) giá 1.100.000đ mọi đêm tháng này và tháng sau. */
function chuCo1509(ten = 'Chị Hoa') {
  const tk = taoTaiKhoan('chu_nha', ten);
  const id = idCua(tk.email);
  const c1509 = taoCanCoAnh(id, '1509', 'ICON40', 2, 3, 'bien');
  const nay = homNay();
  sql(`insert into public.gia_thang (can_id, thang, gia_thuong, gia_cuoi_tuan)
       values ('${c1509}', '${dauThang(nay)}', 1100000, 1100000), ('${c1509}', '${dauThang(nay, 1)}', 1100000, 1100000),
              ('${c1509}', '${dauThang(nay, 2)}', 1100000, 1100000)`);
  return { ...tk, id, c1509 };
}

function ketNoi(chuId: string, saleId: string) {
  sql(`insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon, pham_vi) values ('${chuId}', '${saleId}', 'da_ket_noi', 'link_moi', 'tat_ca')`);
}

function mucCong(saleId: string, muc: number) {
  sql(`insert into public.cai_dat_rieng (nguoi_id, muc_cong_mac_dinh) values ('${saleId}', ${muc})
       on conflict (nguoi_id) do update set muc_cong_mac_dinh = ${muc}`);
}

/** Sale tìm phòng trống từ ngày `nhan`, `dem` đêm, rồi mở 1509. */
async function timVaMo1509(p: Page, nhan: string, dem: number) {
  await p.getByRole('navigation', { name: 'Tab' }).getByRole('button', { name: 'Lịch' }).click();
  await expect(p.getByRole('heading', { name: 'Lịch phòng' })).toBeVisible();
  await p.getByRole('button', { name: 'Tìm phòng trống theo ngày' }).click();
  await p.getByLabel('Ngày nhận').fill(nhan);
  await p.getByRole('button', { name: `${dem} đêm` }).click();
  await p.getByRole('button', { name: 'Tìm phòng trống' }).click();
  await p.getByRole('button', { name: 'ICON40 1509 · 2PN' }).click();
}

/** Sale gửi yêu cầu 1509 từ tìm phòng, tới S3-03. */
async function guiYeuCau(p: Page, nhan: string, dem: number, tenChu = 'Chị Hoa') {
  await timVaMo1509(p, nhan, dem);
  await p.locator('[data-man="S3"]').getByRole('button', { name: 'Gửi yêu cầu đặt phòng' }).click();
  await p.locator('[data-man="S3-02"]').getByRole('button', { name: 'Gửi yêu cầu đặt phòng' }).click();
  await expect(p.locator('[data-man="S3-03"]').getByText(`Đang chờ ${tenChu} chấp nhận`)).toBeVisible();
}

/** HV3: rời app rồi quay lại; có thông báo mới thì popup nổi lên (YC12.1-NT4), đóng để bấm màn bên dưới. */
async function quayLaiTuNen(p: Page, coPopup = true) {
  await p.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  if (coPopup) {
    const popup = p.getByRole('dialog');
    await expect(popup).toBeVisible();
    await popup.getByRole('button', { name: 'Đóng' }).click();
  }
}

test('Luồng 1 · YC6.3-NT1 YC6.3-NT4 YC7.5-NT1 YC7.4-NT1 YC7.4-NT2 chủ gửi link mời, sale mới đăng ký qua link, đặt mức cộng, tìm phòng thấy giá chủ và giá bán; chủ không nhận giá bán', async ({ browser }) => {
  const hoa = chuCo1509();
  const chu = await dienThoai(browser);
  const phanHoiChu = ghiPhanHoi(chu);

  // Chủ nhà: tab Sale chưa có ai, sao chép link mời.
  await dangNhapBangMa(chu, hoa.email);
  await chu.getByRole('navigation', { name: 'Tab' }).getByRole('button', { name: 'Sale' }).click();
  await expect(chu.getByRole('heading', { name: 'Chưa có sale nào xem lịch' })).toBeVisible();
  await chu.getByRole('button', { name: 'Sao chép link' }).click();
  await expect(chu.getByRole('status').filter({ hasText: 'Đã sao chép' })).toBeVisible();
  const link = await chu.evaluate(() => navigator.clipboard.readText());
  expect(link).toMatch(/\/l\/[A-Za-z0-9_-]{20,}$/);

  // Sale mới (chưa có tài khoản) mở link, đăng ký, thêm lịch.
  const sale = await dienThoai(browser);
  await sale.goto(new URL(link).pathname);
  await expect(sale.getByText('Chị Hoa mời bạn xem lịch 1 căn')).toBeVisible();
  await sale.getByRole('button', { name: 'Bắt đầu ngay' }).click();
  const email = emailMoi('hung');
  await sale.getByLabel('Họ và tên').fill('Sale Hùng');
  await sale.getByLabel('Số điện thoại').fill(soMoi());
  await sale.getByLabel('Email').fill(email);
  await sale.getByRole('button', { name: 'Gửi mã xác nhận' }).click();
  await nhapMa(sale, await layMa(email));
  await sale.getByRole('button', { name: 'Xác nhận' }).click();
  await sale.getByRole('button', { name: 'Thêm lịch của Chị Hoa' }).click();
  await expect(sale.getByRole('status').filter({ hasText: 'Đã thêm lịch 1 căn của Chị Hoa' })).toBeVisible();
  await expect(sale.getByRole('heading', { name: 'Lịch phòng' })).toBeVisible();

  // Chủ nhà mở lại tab Sale: Hùng ở "Đã kết nối".
  await chu.reload();
  await chu.getByRole('navigation', { name: 'Tab' }).getByRole('button', { name: 'Sale' }).click();
  await expect(chu.getByRole('region', { name: 'Đã kết nối · 1' }).getByText('Sale Hùng')).toBeVisible();

  // Sale đặt mức cộng +200k ở P10.
  await sale.getByRole('button', { name: 'Cá nhân', exact: true }).click();
  await sale.getByRole('button', { name: 'Mức cộng giá mặc định' }).click();
  await sale.locator('[data-man="P10"]').getByRole('group', { name: 'Cộng mỗi đêm' }).getByRole('button', { name: '+200k', exact: true }).click();
  await sale.locator('[data-man="P10"]').getByRole('button', { name: 'Lưu thay đổi' }).click();
  await expect(sale.getByRole('status')).toContainText('Đã lưu mức cộng');

  // Sale tìm phòng 2 đêm: giá chủ 2.200.000đ, giá bán 2.600.000đ.
  const nhan = cong(homNay(), 4);
  await timVaMo1509(sale, nhan, 2);
  await expect(sale.getByTestId('gia-chu')).toContainText('2.200.000đ');
  await expect(sale.getByTestId('gia-ban')).toHaveText('2.600.000đ');

  // Chủ nhà mở lịch và tab Sale lần nữa: không phản hồi nào có giá bán hay mức cộng của sale.
  await chu.getByRole('navigation', { name: 'Tab' }).getByRole('button', { name: 'Lịch' }).click();
  await chu.getByRole('navigation', { name: 'Tab' }).getByRole('button', { name: 'Sale' }).click();
  await chu.getByRole('region', { name: 'Đã kết nối · 1' }).getByRole('button', { name: /Sale Hùng/ }).click();
  await expect(chu.getByRole('heading', { name: 'Sale Hùng' })).toBeVisible();
  const tatCa = phanHoiChu.join('\n');
  expect(tatCa).not.toMatch(/2600000|muc_cong|gia_ban/);
});

test('Luồng 2 · YC6.4-NT2 YC6.5-NT2 YC6.5-NT3 YC7.1-NT2 sale xin lịch bằng tin chia sẻ, chủ mở link và đồng ý, sale quay lại thấy căn của chủ', async ({ browser }) => {
  const hoa = chuCo1509();
  const lan = taoTaiKhoan('sale', 'Sale Lan');
  const sale = await dienThoai(browser);
  await dangNhapBangMa(sale, lan.email);
  await expect(sale.getByText('Chưa có nguồn phòng')).toBeVisible();
  await sale.getByRole('button', { name: 'Gửi tin nhắn xin lịch đến chủ nhà' }).click();
  await sale.getByRole('button', { name: 'Chia sẻ' }).click();
  await expect(sale.getByText('✓ Đã chia sẻ. Đang chờ chủ nhà đồng ý.')).toBeVisible();
  const tin = (await tinDaChiaSe(sale))[0]!;
  const link = /https?:\/\/\S+\/x\/[A-Za-z]+/.exec(tin)?.[0];
  expect(link, `tin chia sẻ phải có link xin lịch: ${tin}`).toBeTruthy();

  // Chủ nhà nhận tin, mở link, đồng ý.
  const chu = await dienThoai(browser);
  await dangNhapBangMa(chu, hoa.email);
  await expect(chu.getByRole('heading', { name: 'Lịch' })).toBeVisible();
  await chu.goto(new URL(link!).pathname);
  await expect(chu.getByText('Sale Lan', { exact: true })).toBeVisible();
  await chu.getByRole('button', { name: 'Đồng ý cho xem lịch' }).click();
  await expect(chu.getByRole('status').filter({ hasText: 'Đã cho Sale Lan xem lịch' })).toBeVisible();
  await expect(chu.getByRole('region', { name: 'Đã kết nối · 1' })).toContainText('Sale Lan');

  // Sale đang mở app (A7) quay lại: toast A9 báo chủ đồng ý (YC6.8), "Xem" về lịch có 1509.
  await quayLaiTuNen(sale, false);
  const toast = sale.locator('.a9-toast');
  await expect(toast).toContainText('Chị Hoa đã đồng ý cho bạn xem lịch');
  await toast.getByRole('button', { name: 'Xem' }).click();
  await expect(sale.getByRole('heading', { name: 'Lịch phòng' })).toBeVisible();
  await expect(sale.getByText('1509').first()).toBeVisible();
  await expect(sale.getByText('Chưa có nguồn phòng')).toHaveCount(0);
});

test('Luồng 3 · YC6.6-NT1 YC6.6-NT3 chủ gửi lịch chỉ một căn, sale mở link thì chỉ thấy căn đó', async ({ browser }) => {
  const hoa = chuCo1509();
  taoCanCoAnh(hoa.id, '3402', 'ICON40', 1, 1, 'bien');
  const chu = await dienThoai(browser);
  await dangNhapBangMa(chu, hoa.email);
  await expect(chu.getByRole('heading', { name: 'Lịch' })).toBeVisible();
  await chu.getByRole('button', { name: /Gửi lịch cho sale/ }).click();
  await chu.getByRole('checkbox', { name: /Phòng 3402/ }).click(); // bỏ 3402, còn 1509
  await chu.getByRole('button', { name: 'Chia sẻ lịch' }).click();
  await expect(chu.getByRole('status').filter({ hasText: 'Đã gửi lịch' })).toBeVisible();
  const tin = (await tinDaChiaSe(chu))[0]!;
  const link = /https?:\/\/\S+\/l\/[A-Za-z0-9_-]+/.exec(tin)?.[0];
  expect(link, `tin chia sẻ phải có link gửi lịch: ${tin}`).toBeTruthy();

  const nga = taoTaiKhoan('sale', 'Sale Nga');
  const sale = await dienThoai(browser);
  await dangNhapBangMa(sale, nga.email);
  await expect(sale.getByText('Chưa có nguồn phòng')).toBeVisible();
  await sale.goto(new URL(link!).pathname);
  await expect(sale.getByText('Chủ nhà · 1 căn')).toBeVisible();
  await sale.getByRole('button', { name: 'Thêm lịch của Chị Hoa' }).click();
  await expect(sale.getByRole('status').filter({ hasText: 'Đã thêm lịch 1 căn của Chị Hoa' })).toBeVisible();
  await expect(sale.getByRole('heading', { name: 'Lịch phòng' })).toBeVisible();
  await expect(sale.getByText('1509').first()).toBeVisible();
  await expect(sale.getByText('3402')).toHaveCount(0);
});

test('Luồng 4 · YC9.1-NT1 YC9.2-NT1 YC9.3-NT2 YC9.4-NT1 YC9.4-NT2 hai sale gửi yêu cầu trùng đêm, chủ chấp nhận một, yêu cầu kia tự bị từ chối, hai sale nhận kết quả', async ({ browser }) => {
  const hoa = chuCo1509();
  const hung = taoTaiKhoan('sale', 'Sale Hùng');
  const lan = taoTaiKhoan('sale', 'Sale Lan');
  const hungId = idCua(hung.email);
  const lanId = idCua(lan.email);
  ketNoi(hoa.id, hungId);
  ketNoi(hoa.id, lanId);
  mucCong(hungId, 400000);
  const nhan = cong(homNay(), 3);

  const sHung = await dienThoai(browser);
  const sLan = await dienThoai(browser);
  await dangNhapBangMa(sHung, hung.email);
  await dangNhapBangMa(sLan, lan.email);
  await guiYeuCau(sHung, nhan, 2);                // 2 đêm: nhan, nhan+1
  await guiYeuCau(sLan, cong(nhan, 1), 1);        // 1 đêm: nhan+1, trùng với Hùng

  const chu = await dienThoai(browser);
  const phanHoiChu = ghiPhanHoi(chu);
  await dangNhapBangMa(chu, hoa.email);
  const khoi = chu.getByRole('region', { name: 'Yêu cầu đặt phòng · 2' });
  await expect(khoi.getByText(`${dm(nhan)} → ${dm(cong(nhan, 2))} · trùng ngày với Sale Lan`)).toBeVisible();
  await khoi.locator('[data-yeu-cau]').filter({ hasText: 'Sale Hùng đặt phòng' }).getByRole('button', { name: 'Xem và trả lời' }).click();
  const cn9 = chu.locator('[data-man="CN9"]');
  await expect(chu.getByTestId('cn9-gia')).toContainText('2.200.000đ');
  await cn9.getByRole('button', { name: 'Chấp nhận đặt phòng' }).click();
  const cn902 = chu.locator('[data-man="CN9-02"]');
  await expect(cn902.getByText('Đặt phòng đã vào lịch. Sale Hùng được báo.')).toBeVisible();
  await expect(cn902.getByText(/Yêu cầu của Sale Lan .* đã bị từ chối\. Sale Lan được báo\./)).toBeVisible();
  // Giá bán của Hùng (+400k mỗi đêm: 3.000.000đ) không bao giờ xuống máy chủ nhà.
  expect(phanHoiChu.join('\n')).not.toMatch(/3000000|gia_ban/);

  // Hùng quay lại app: S3-04 có giá bán và giá chủ.
  await quayLaiTuNen(sHung);
  await expect(sHung.locator('[data-man="S3-04"]').getByText('Chị Hoa đã chấp nhận đặt phòng')).toBeVisible();
  await expect(sHung.getByTestId('kq-gia-ban')).toContainText('3.000.000đ');
  await expect(sHung.getByTestId('kq-gia-chu')).toContainText('2.200.000đ');

  // Lan quay lại app: S3-05 lý do đã nhận đặt phòng khác, không lộ tên Hùng.
  await quayLaiTuNen(sLan);
  const s305 = sLan.locator('[data-man="S3-05"]');
  await expect(s305.getByText('Yêu cầu bị từ chối')).toBeVisible();
  await expect(sLan.getByTestId('kq-ly-do')).toContainText(/đã nhận đặt phòng khác/i);
  await expect(s305).not.toContainText('Hùng');

  // Lan tìm lại cùng đêm: 1509 không còn trống.
  await sLan.goto('/');
  await sLan.getByRole('button', { name: 'Tìm phòng trống theo ngày' }).click();
  await sLan.getByLabel('Ngày nhận').fill(cong(nhan, 1));
  await sLan.getByRole('button', { name: '1 đêm' }).click();
  await sLan.getByRole('button', { name: 'Tìm phòng trống' }).click();
  await expect(sLan.getByRole('button', { name: 'ICON40 1509 · 2PN' })).toHaveCount(0);
  expect(sql(`select count(*) from public.booking where can_id = '${hoa.c1509}' and trang_thai <> 'da_huy'`)).toBe('1');
});

/** Dựng đặt phòng có sale đứng tên qua màn: sale gửi yêu cầu, chủ chấp nhận. Trả id đặt phòng. */
async function datPhongQuaYeuCau(chu: Page, sale: Page, hoaEmail: string, saleEmail: string, c1509: string, nhan: string) {
  await dangNhapBangMa(sale, saleEmail);
  await guiYeuCau(sale, nhan, 2);
  await dangNhapBangMa(chu, hoaEmail);
  await chu.getByRole('region', { name: 'Yêu cầu đặt phòng · 1' }).getByRole('button', { name: 'Xem và trả lời' }).click();
  await chu.locator('[data-man="CN9"]').getByRole('button', { name: 'Chấp nhận đặt phòng' }).click();
  await expect(chu.locator('[data-man="CN9-02"]').getByText(/Đặt phòng đã vào lịch/)).toBeVisible();
  await chu.locator('[data-man="CN9-02"]').getByRole('button', { name: 'Về lịch' }).click();
  return sql(`select id from public.booking where can_id = '${c1509}' and trang_thai <> 'da_huy'`);
}

test('Luồng 5 · YC5.8-NT1 YC5.8-NT2 YC5.8-NT3 đặt phòng có sale: chủ xin hủy, sale không đồng ý; sale xin hủy, chủ đồng ý; đêm trống lại', async ({ browser }) => {
  const hoa = chuCo1509();
  const hung = taoTaiKhoan('sale', 'Sale Hùng');
  ketNoi(hoa.id, idCua(hung.email));
  const nhan = cong(homNay(), 5);
  const chu = await dienThoai(browser);
  const sale = await dienThoai(browser);
  const b = await datPhongQuaYeuCau(chu, sale, hoa.email, hung.email, hoa.c1509, nhan);

  // Chủ nhà xin hủy ở CN3-02.
  await chu.goto(`/dat-phong/${b}`);
  await chu.getByRole('button', { name: 'Xin hủy' }).click();
  await chu.getByRole('alertdialog', { name: 'Xác nhận xin hủy' }).getByRole('button', { name: 'Xin hủy' }).click();
  await expect(chu.getByText('Chờ đồng ý hủy')).toBeVisible();

  // Sale quay lại app: popup có dòng xin hủy; mở đặt phòng ở S3-10 và không đồng ý.
  await quayLaiTuNen(sale);
  await sale.goto('/');
  await sale.getByRole('navigation', { name: 'Tab' }).getByRole('button', { name: 'Thống kê' }).click();
  await sale.getByRole('button', { name: 'Xem tất cả đặt phòng và yêu cầu' }).click();
  await sale.getByRole('button', { name: /1509/ }).first().click();
  await expect(sale.getByText('Chị Hoa xin hủy đặt phòng này')).toBeVisible();
  await sale.getByRole('button', { name: 'Không đồng ý' }).click();
  await expect(sale.getByText('Bị từ chối hủy')).toBeVisible();
  expect(sql(`select trang_thai from public.booking where id = '${b}'`)).toBe('hieu_luc');

  // NT3: đã bị từ chối hủy thì không xin hủy lần nữa được (nút không còn).
  await expect(sale.getByRole('button', { name: 'Xin hủy' })).toHaveCount(0);
  await chu.reload();
  await expect(chu.getByText('Bị từ chối hủy')).toBeVisible();
  await expect(chu.getByRole('button', { name: 'Xin hủy' })).toHaveCount(0);
});

test('Luồng 5b · YC5.8-NT1 YC5.8-NT2 sale xin hủy đặt phòng chủ đã chấp nhận, chủ đồng ý, sale khác đặt lại được đêm đó', async ({ browser }) => {
  const hoa = chuCo1509();
  const hung = taoTaiKhoan('sale', 'Sale Hùng');
  const lan = taoTaiKhoan('sale', 'Sale Lan');
  ketNoi(hoa.id, idCua(hung.email));
  ketNoi(hoa.id, idCua(lan.email));
  const nhan = cong(homNay(), 6);
  const chu = await dienThoai(browser);
  const sale = await dienThoai(browser);
  const b = await datPhongQuaYeuCau(chu, sale, hoa.email, hung.email, hoa.c1509, nhan);

  await sale.goto('/');
  await quayLaiTuNen(sale);
  await sale.getByRole('navigation', { name: 'Tab' }).getByRole('button', { name: 'Thống kê' }).click();
  await sale.getByRole('button', { name: 'Xem tất cả đặt phòng và yêu cầu' }).click();
  await sale.getByRole('button', { name: /1509/ }).first().click();
  await sale.getByRole('button', { name: 'Xin hủy' }).click();
  await sale.getByRole('alertdialog', { name: 'Xác nhận xin hủy' }).getByRole('button', { name: 'Xin hủy' }).click();
  await expect(sale.getByText('Chờ đồng ý hủy')).toBeVisible();

  await chu.goto(`/dat-phong/${b}`);
  // YC12.1: mở lại app có thông báo xin hủy thì popup nổi lên trước; đóng rồi trả lời.
  await chu.getByRole('dialog').getByRole('button', { name: 'Đóng' }).click();
  await expect(chu.getByText('Sale Hùng xin hủy đặt phòng này')).toBeVisible();
  await chu.getByRole('button', { name: 'Đồng ý hủy' }).click();
  await expect(chu.getByText('Đã hủy', { exact: true })).toBeVisible();

  // Lan gửi yêu cầu đúng các đêm đó: được.
  const sLan = await dienThoai(browser);
  await dangNhapBangMa(sLan, lan.email);
  await guiYeuCau(sLan, nhan, 2);
});

test('Luồng 6 · YC11.1-NT8 YC11.2-NT1 YC12.3-NT1 YC12.3-NT3 thống kê hai bên sau một đặt phòng qua yêu cầu; nhắc chưa cọc chỉ tới chủ', async ({ browser }) => {
  const hoa = chuCo1509();
  const hung = taoTaiKhoan('sale', 'Sale Hùng');
  const hungId = idCua(hung.email);
  ketNoi(hoa.id, hungId);
  mucCong(hungId, 300000);
  // Đặt phòng trong tháng này để cả hai bên thấy trong thống kê tháng hiện tại; nhận phòng sau 3 ngày để nhắc chưa cọc chạy.
  const nay = homNay();
  let nhan = cong(nay, 3);
  if (nhan.slice(0, 7) !== nay.slice(0, 7) || cong(nhan, 2).slice(0, 7) !== nay.slice(0, 7)) nhan = cong(nay, 1);
  const chu = await dienThoai(browser);
  const sale = await dienThoai(browser);
  await datPhongQuaYeuCau(chu, sale, hoa.email, hung.email, hoa.c1509, nhan);
  const thang = Number(nay.slice(5, 7));

  // Sale: tiền chênh 2 đêm × 300k = 600.000đ.
  await sale.goto('/');
  await quayLaiTuNen(sale);
  await sale.getByRole('navigation', { name: 'Tab' }).getByRole('button', { name: 'Thống kê' }).click();
  await expect(sale.getByRole('region', { name: `Tiền chênh tháng ${thang}` }).getByText('600.000đ')).toBeVisible();

  // Chủ: thống kê có 2.200.000đ, không phản hồi nào có giá bán, tiền chênh.
  const phanHoiChu = ghiPhanHoi(chu);
  await chu.getByRole('navigation', { name: 'Tab' }).getByRole('button', { name: 'Thống kê' }).click();
  await expect(chu.getByText('2.200.000đ').first()).toBeVisible();
  await expect(chu.getByText(/chênh/i)).toHaveCount(0);
  expect(phanHoiChu.join('\n')).not.toMatch(/2800000|600000|tien_chenh|gia_ban/);

  // Nhắc chưa cọc (việc chạy hằng ngày): chạy hai lần, chủ có đúng một thông báo, sale không có.
  sql(`select public.fn_nhac_chua_coc()`);
  sql(`select public.fn_nhac_chua_coc()`);
  const loai = sql(`select string_agg(distinct loai, ',') from public.thong_bao where nguoi_nhan = '${hoa.id}' and loai like '%coc%'`);
  expect(loai, 'chủ nhà phải có thông báo nhắc chưa cọc').not.toBe('');
  expect(sql(`select count(*) from public.thong_bao where nguoi_nhan = '${hoa.id}' and loai = '${loai}'`)).toBe('1');
  expect(sql(`select count(*) from public.thong_bao where nguoi_nhan = '${hungId}' and loai = '${loai}'`)).toBe('0');
  // Chủ quay lại app thấy popup có dòng chưa cọc.
  await quayLaiTuNen(chu, false);
  await expect(chu.getByRole('dialog')).toContainText(/chưa cọc/i);
});

test('Luồng 7 · YC6.2-NT7 YC1.8-NT4 YC1.8-NT5 sale xóa tài khoản: chủ thấy "Đã xoá tài khoản", đặt phòng vẫn chiếm đêm; chủ xóa tài khoản: sale được báo', async ({ browser }) => {
  const hoa = chuCo1509();
  const hung = taoTaiKhoan('sale', 'Sale Hùng');
  const lan = taoTaiKhoan('sale', 'Sale Lan');
  const lanId = idCua(lan.email);
  ketNoi(hoa.id, idCua(hung.email));
  ketNoi(hoa.id, lanId);
  const nhan = cong(homNay(), 7);
  const chu = await dienThoai(browser);
  const sale = await dienThoai(browser);
  const b = await datPhongQuaYeuCau(chu, sale, hoa.email, hung.email, hoa.c1509, nhan);

  // Hùng xóa tài khoản trên màn.
  await sale.goto('/');
  await quayLaiTuNen(sale);
  await sale.getByRole('button', { name: 'Cá nhân', exact: true }).click();
  await sale.getByRole('button', { name: 'Thông tin cá nhân' }).click();
  await sale.locator('[data-man="P2"]').getByRole('button', { name: 'Xóa tài khoản' }).click();
  await sale.locator('[data-man="P14"]').getByRole('button', { name: 'Xóa tài khoản' }).click();
  await sale.locator('[data-man="P14-01"]').getByRole('button', { name: /Xác nhận xóa/ }).click();
  await expect(sale.getByRole('button', { name: 'Tôi đã có tài khoản · Đăng nhập' })).toBeVisible();

  // Chủ: dòng Hùng ghi "Đã xoá tài khoản", đặt phòng vẫn còn, Lan không gửi được yêu cầu trùng.
  await chu.goto('/sale');
  await expect(chu.getByRole('listitem').filter({ hasText: 'Sale Hùng' }).getByText('Đã xoá tài khoản')).toBeVisible();
  expect(sql(`select trang_thai from public.booking where id = '${b}'`)).toBe('hieu_luc');
  const sLan = await dienThoai(browser);
  await dangNhapBangMa(sLan, lan.email);
  await sLan.getByRole('button', { name: 'Tìm phòng trống theo ngày' }).click();
  await sLan.getByLabel('Ngày nhận').fill(nhan);
  await sLan.getByRole('button', { name: '2 đêm' }).click();
  await sLan.getByRole('button', { name: 'Tìm phòng trống' }).click();
  await expect(sLan.getByRole('button', { name: 'ICON40 1509 · 2PN' })).toHaveCount(0);

  // Chủ xóa tài khoản: Lan (còn kết nối) có đúng một thông báo, Hùng (đã xóa) không có.
  await chu.getByRole('button', { name: 'Cá nhân', exact: true }).click();
  await chu.getByRole('button', { name: 'Thông tin cá nhân' }).click();
  await chu.locator('[data-man="P2"]').getByRole('button', { name: 'Xóa tài khoản' }).click();
  await chu.locator('[data-man="P14"]').getByRole('button', { name: 'Xóa tài khoản' }).click();
  await chu.locator('[data-man="P14-01"]').getByRole('button', { name: /Xác nhận xóa/ }).click();
  await expect(chu.getByRole('button', { name: 'Tôi đã có tài khoản · Đăng nhập' })).toBeVisible();
  expect(sql(`select count(*) from public.thong_bao t where t.nguoi_nhan = '${lanId}' and t.loai like '%xoa%'`)).toBe('1');
  expect(sql(`select count(*) from public.thong_bao t where t.nguoi_nhan = '${idCua(hung.email)}' and t.loai like '%xoa%'`)).toBe('0');
  await quayLaiTuNen(sLan, false);
  await expect(sLan.getByRole('dialog')).toContainText('Chị Hoa đã xóa tài khoản');
});

test('Luồng 8 · YC9.3-NT5 sale đang chờ yêu cầu, chủ tự ghi khách lẻ chồng đêm trên CN4: yêu cầu bị từ chối, sale được báo', async ({ browser }) => {
  const hoa = chuCo1509();
  const hung = taoTaiKhoan('sale', 'Sale Hùng');
  const hungId = idCua(hung.email);
  ketNoi(hoa.id, hungId);
  const nhan = cong(homNay(), 3);
  const sale = await dienThoai(browser);
  await dangNhapBangMa(sale, hung.email);
  await guiYeuCau(sale, nhan, 2);

  // Chủ nhà ghi khách lẻ đêm nhan+1 → nhan+2 trên màn Thêm đặt phòng.
  const chu = await dienThoai(browser);
  await dangNhapBangMa(chu, hoa.email);
  await expect(chu.getByRole('region', { name: 'Yêu cầu đặt phòng · 1' })).toBeVisible();
  await chu.getByRole('banner').getByRole('button', { name: 'Đặt phòng' }).click();
  await expect(chu.getByRole('heading', { name: 'Thêm đặt phòng' })).toBeVisible();
  await chu.getByLabel('Ngày nhận phòng').fill(cong(nhan, 1));
  await chu.getByRole('group', { name: 'Khách / Sale' }).getByRole('button', { name: 'Khách lẻ' }).click();
  await chu.getByRole('button', { name: 'Thêm đặt phòng' }).click();
  await expect(chu.getByText(/Đã thêm đặt phòng/)).toBeVisible();
  await expect(chu.getByRole('region', { name: /Yêu cầu đặt phòng/ })).toHaveCount(0);

  // Sale quay lại app: S3-05.
  await quayLaiTuNen(sale);
  await expect(sale.locator('[data-man="S3-05"]').getByText('Yêu cầu bị từ chối')).toBeVisible();
  expect(sql(`select trang_thai from public.yeu_cau_dat_phong where sale_id = '${hungId}'`)).toBe('bi_tu_choi');
});

test('Luồng 9 · YC6.2-NT4 YC9.2-NT9 YC9.4-NT7 chủ ngừng cho sale xem khi sale còn yêu cầu chờ: chấp nhận bị chặn có báo, từ chối được; sale mất lịch của chủ', async ({ browser }) => {
  const hoa = chuCo1509();
  const lan = taoTaiKhoan('sale', 'Sale Lan');
  const lanId = idCua(lan.email);
  ketNoi(hoa.id, lanId);
  const nhan = cong(homNay(), 4);
  const sale = await dienThoai(browser);
  await dangNhapBangMa(sale, lan.email);
  await guiYeuCau(sale, nhan, 2);

  const chu = await dienThoai(browser);
  await dangNhapBangMa(chu, hoa.email);
  await expect(chu.getByRole('region', { name: 'Yêu cầu đặt phòng · 1' })).toBeVisible();
  // Ngừng cho Lan xem ở tab Sale.
  await chu.getByRole('navigation', { name: 'Tab' }).getByRole('button', { name: 'Sale' }).click();
  await chu.getByRole('region', { name: 'Đã kết nối · 1' }).getByRole('button', { name: /Sale Lan/ }).click();
  await chu.getByRole('button', { name: 'Ngừng cho xem lịch' }).click();
  await chu.getByRole('alertdialog').getByRole('button', { name: 'Ngừng cho xem' }).click();
  await expect(chu.getByRole('region', { name: 'Đã ngừng · 1' }).getByText('Sale Lan')).toBeVisible();

  // Chủ mở yêu cầu cũ của Lan và bấm chấp nhận: bị chặn, có câu báo; không có đặt phòng.
  await chu.getByRole('navigation', { name: 'Tab' }).getByRole('button', { name: 'Lịch' }).click();
  const khoi = chu.getByRole('region', { name: 'Yêu cầu đặt phòng · 1' });
  await expect(khoi).toBeVisible();
  await khoi.getByRole('button', { name: 'Xem và trả lời' }).click();
  await chu.locator('[data-man="CN9"]').getByRole('button', { name: 'Chấp nhận đặt phòng' }).click();
  await expect(chu.getByText('Sale này không còn kết nối với bạn, không nhận được đặt phòng.').first()).toBeVisible();
  expect(sql(`select count(*) from public.booking where can_id = '${hoa.c1509}'`)).toBe('0');
  await chu.locator('[data-man="CN9"]').getByRole('button', { name: 'Từ chối' }).click();
  await chu.locator('[data-man="CN9"]').getByRole('button', { name: 'Gửi từ chối cho sale' }).click();
  await expect(chu.locator('[data-man="CN9-03"]').getByText('Đã từ chối yêu cầu của Sale Lan')).toBeVisible();

  // Lan quay lại: không còn lịch của Chị Hoa.
  await sale.goto('/');
  await sale.getByRole('dialog').getByRole('button', { name: 'Đóng' }).click();
  await expect(sale.getByRole('heading', { name: 'Lịch phòng' })).toBeVisible();
  await expect(sale.getByText('1509')).toHaveCount(0);
});

test('Luồng 10 · YC6.2-NT5 YC6.5-NT2 chủ tắt "Tình trạng cọc" của sale: sale mở đặt phòng của mình không thấy đã cọc hay chưa; bật lại thì thấy', async ({ browser }) => {
  const hoa = chuCo1509();
  const hung = taoTaiKhoan('sale', 'Sale Hùng');
  ketNoi(hoa.id, idCua(hung.email));
  const chu = await dienThoai(browser);
  const sale = await dienThoai(browser);
  await datPhongQuaYeuCau(chu, sale, hoa.email, hung.email, hoa.c1509, cong(homNay(), 8));

  const moDatPhong = async () => {
    await sale.goto('/');
    await expect(sale.getByRole('navigation', { name: 'Tab' })).toBeVisible();
    // Popup chỉ có khi có thông báo mới (đặt phòng vừa chốt); đổi cọc không tạo thông báo.
    await sale.getByRole('dialog').getByRole('button', { name: 'Đóng' }).click({ timeout: 3000 }).catch(() => undefined);
    await sale.getByRole('navigation', { name: 'Tab' }).getByRole('button', { name: 'Thống kê' }).click();
    await sale.getByRole('button', { name: 'Xem tất cả đặt phòng và yêu cầu' }).click();
    await sale.getByRole('button', { name: /1509/ }).first().click();
    await expect(sale.getByTestId('dp-chu-ngay')).toBeVisible();
  };
  await moDatPhong();
  await expect(sale.getByTestId('dp-coc')).toContainText(/chưa cọc/i);

  const coc = async (bat: boolean) => {
    await chu.goto('/sale');
    await chu.getByRole('region', { name: 'Đã kết nối · 1' }).getByRole('button', { name: /Sale Hùng/ }).click();
    const sw = chu.getByRole('switch', { name: 'Tình trạng cọc' });
    await expect(sw).toHaveAttribute('aria-checked', String(!bat));
    await sw.click();
    await expect(sw).toHaveAttribute('aria-checked', String(bat));
  };
  await coc(false);
  await moDatPhong();
  await expect(sale.getByTestId('dp-coc')).toHaveCount(0);
  await expect(sale.getByText(/cọc/i)).toHaveCount(0);
  await coc(true);
  await moDatPhong();
  await expect(sale.getByTestId('dp-coc')).toContainText(/chưa cọc/i);
});

test('Luồng 11 · YC5.6-NT5 YC12.1-NT1 YC5.9-NT1 chủ sửa tiền phòng của đặt phòng từ yêu cầu: sale được báo, giá bán giữ nguyên, tiền chênh tính lại', async ({ browser }) => {
  const hoa = chuCo1509();
  const hung = taoTaiKhoan('sale', 'Sale Hùng');
  const hungId = idCua(hung.email);
  ketNoi(hoa.id, hungId);
  mucCong(hungId, 400000);
  const chu = await dienThoai(browser);
  const sale = await dienThoai(browser);
  const b = await datPhongQuaYeuCau(chu, sale, hoa.email, hung.email, hoa.c1509, cong(homNay(), 9));
  // Sale thấy kết quả trước (đọc thông báo chấp nhận) để popup sau chỉ còn dòng sửa.
  await quayLaiTuNen(sale);

  // Chủ sửa tiền phòng 2.200.000đ → 2.400.000đ.
  await chu.goto(`/dat-phong/${b}`);
  await expect(chu.getByRole('heading', { name: 'Đặt phòng · Sale Hùng' })).toBeVisible();
  await chu.getByRole('button', { name: 'Sửa đặt phòng' }).click();
  await expect(chu.getByLabel('Tiền phòng (đ)')).toHaveValue('2.200.000');
  await chu.getByLabel('Tiền phòng (đ)').fill('2400000');
  await chu.getByRole('button', { name: 'Lưu thay đổi' }).click();
  await expect(chu.getByText('Đã lưu đặt phòng')).toBeVisible();

  // Sale quay lại: popup có dòng sửa; mở đặt phòng: giá chủ 2.400.000đ, giá bán 3.000.000đ, chênh 600.000đ.
  await sale.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  const popup = sale.getByRole('dialog');
  await expect(popup).toContainText('Chị Hoa đã sửa đặt phòng của bạn');
  await popup.getByRole('button', { name: 'Đóng' }).click();
  await sale.goto('/');
  await sale.getByRole('navigation', { name: 'Tab' }).getByRole('button', { name: 'Thống kê' }).click();
  await sale.getByRole('button', { name: 'Xem tất cả đặt phòng và yêu cầu' }).click();
  await sale.getByRole('button', { name: /1509/ }).first().click();
  await expect(sale.getByTestId('dp-gia-chu')).toContainText('2.400.000đ');
  await expect(sale.getByTestId('dp-gia-ban')).toContainText('3.000.000đ');
  await expect(sale.getByTestId('dp-chenh')).toContainText('600.000đ');
});
