// Test e2e US37 · Link mời của chủ nhà và sale thêm lịch (YC6.3, QD8), trên Supabase chạy ở máy với hộp thư giả.
// Tên theo DLM (giả), email và số giả. Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase (docs/dev/chay-va-test.md).
import { expect, test, type Browser, type Page } from '@playwright/test';
import { dangNhapBangMa, emailMoi, idCua, layMa, nhapMa, soMoi, sql, taoCanCoAnh, taoLinkMoi, taoTaiKhoan } from './hoTro';

/** Anh Tuấn có Sapphire 1103 và À La Carte 2208, kèm link mời đang dùng. */
function chuTuan() {
  const tk = taoTaiKhoan('chu_nha', 'Anh Tuấn');
  const id = idCua(tk.email);
  taoCanCoAnh(id, '1103', 'Sapphire', 3, 2, 'view thành phố');
  taoCanCoAnh(id, '2208', 'À La Carte', 1, 1, 'view biển');
  sql(`insert into public.gia_thang (can_id, thang, gia_thuong, gia_cuoi_tuan)
       select id, date_trunc('month', now())::date, 777000, 888000 from public.can where nguoi_giu = '${id}'`);
  return { ...tk, id, ma: taoLinkMoi(id) };
}

async function trangMoi(browser: Browser): Promise<Page> {
  const ctx = await browser.newContext();
  return ctx.newPage();
}

test('YC6.3-NT2 YC6.3-NT1 chưa đăng nhập mở link mời: A1-link không giá; bấm "Bắt đầu ngay", đăng ký thì sang A10, không qua A3', async ({ page }) => {
  const tuan = chuTuan();
  const xemTruoc = page.waitForResponse((r) => r.url().includes('/rpc/fn_xem_link_moi'));
  await page.goto(`/l/${tuan.ma}`);
  const body = await (await xemTruoc).text();
  expect(body).toContain('Anh Tuấn');
  expect(body).not.toMatch(/gia|777000|888000/i);
  await expect(page.getByText('Anh Tuấn mời bạn xem lịch 2 căn')).toBeVisible();
  await expect(page.getByText('Bấm Bắt đầu ngay để xem lịch và giá mới nhất')).toBeVisible();
  await expect(page.getByText(/Đăng nhập/)).toHaveCount(0);

  await page.getByRole('button', { name: 'Bắt đầu ngay' }).click();
  await expect(page.getByRole('heading', { name: 'Tạo tài khoản' })).toBeVisible();
  const email = emailMoi('hung');
  await page.getByLabel('Họ và tên').fill('Sale Hùng');
  await page.getByLabel('Số điện thoại').fill(soMoi());
  await page.getByLabel('Email').fill(email);
  await page.getByRole('button', { name: 'Gửi mã xác nhận' }).click();
  await nhapMa(page, await layMa(email));
  await page.getByRole('button', { name: 'Xác nhận' }).click();

  await expect(page.getByRole('heading', { name: 'Thêm lịch' })).toBeVisible();
  await expect(page.getByText('Chủ nhà · 2 căn')).toBeVisible();
  await expect(page.getByText('Sapphire 1103')).toBeVisible();
  await expect(page.getByText('3PN · 2 giường · view thành phố')).toBeVisible();
  // YC6.3-NT2: ảnh từng căn là đường dẫn có hạn kho ký cho mã link (policy anh_can_xem_truoc_link).
  await expect(page.getByRole('img', { name: 'Ảnh À La Carte 2208' })).toHaveAttribute('src', /\/storage\/v1\/object\/sign\/anh-can\//);
  await expect(page.getByRole('button', { name: 'Thêm lịch của Anh Tuấn' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Bạn dùng app để làm gì?' })).toHaveCount(0);
  expect(sql(`select p.vai_chon from public.profiles p join auth.users u on u.id = p.id where u.email = '${email}'`)).toBe('sale');
  // YC6.3-NT3: chưa bấm thì chưa có kết nối.
  expect(sql(`select count(*) from public.ket_noi where chu_id = '${tuan.id}'`)).toBe('0');
});

test('YC6.3-NT4 YC6.3-NT5 Sale Hùng bấm "Thêm lịch của Anh Tuấn": hai căn vào lịch, Hùng ở "Đã kết nối"; mở lại link thấy A10-01', async ({ page, browser }) => {
  const tuan = chuTuan();
  const hung = taoTaiKhoan('sale', 'Sale Hùng');
  const hungId = idCua(hung.email);
  await dangNhapBangMa(page, hung.email);
  await expect(page.getByRole('heading', { name: 'Lịch' })).toBeVisible();
  await expect(page.getByText('Sale', { exact: true })).toBeVisible();
  await page.goto(`/l/${tuan.ma}`);
  await page.getByRole('button', { name: 'Thêm lịch của Anh Tuấn' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Đã thêm lịch 2 căn của Anh Tuấn' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Lịch' })).toBeVisible();
  expect(page.url()).not.toContain('/l/');
  expect(sql(`select trang_thai || '|' || nguon || '|' || pham_vi || '|' || xem_coc from public.ket_noi
              where chu_id = '${tuan.id}' and sale_id = '${hungId}'`)).toBe('da_ket_noi|link_moi|tat_ca|true');
  // Căn trong lịch của sale: tính qua my_shared_can_ids (lịch sale YC7.1 làm sau).
  expect(sql(`select string_agg(c.ma_can, ',' order by c.ma_can) from public.can c join public.ket_noi k on k.chu_id = c.nguoi_giu
              where k.sale_id = '${hungId}' and k.trang_thai = 'da_ket_noi' and c.an_luc is null`)).toBe('1103,2208');

  // Anh Tuấn thấy Sale Hùng ở nhóm "Đã kết nối".
  const chu = await trangMoi(browser);
  await dangNhapBangMa(chu, tuan.email);
  await chu.getByRole('navigation', { name: 'Tab' }).getByRole('button', { name: 'Sale' }).click();
  await expect(chu.getByRole('region', { name: 'Đã kết nối · 1' }).getByText('Sale Hùng')).toBeVisible();

  // YC6.3-NT5.
  await page.goto(`/l/${tuan.ma}`);
  await expect(page.getByText('Bạn đã có lịch của Anh Tuấn')).toBeVisible();
  await expect(page.getByRole('button', { name: /Thêm lịch/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'Xem lịch' }).click();
  await expect(page.getByRole('heading', { name: 'Lịch' })).toBeVisible();
  expect(sql(`select count(*) from public.ket_noi where chu_id = '${tuan.id}' and sale_id = '${hungId}'`)).toBe('1');
});

test('YC6.3-NT9 Anh Tuấn bấm "Đổi link mời" và đồng ý: link cũ hỏng, Sale Hùng vẫn "Đã kết nối", lần sau link khác', async ({ browser }) => {
  const tuan = chuTuan();
  sql(`update public.link_moi set thu_hoi_luc = now() where chu_id = '${tuan.id}'`); // để màn tự tạo link đầu
  const hung = taoTaiKhoan('sale', 'Sale Hùng');
  sql(`insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon) values ('${tuan.id}', '${idCua(hung.email)}', 'da_ket_noi', 'link_moi')`);

  const ctx = await browser.newContext();
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write']);
  const page = await ctx.newPage();
  await dangNhapBangMa(page, tuan.email);
  await page.getByRole('navigation', { name: 'Tab' }).getByRole('button', { name: 'Sale' }).click();
  const saoChep = async () => {
    await page.getByRole('button', { name: 'Sao chép link' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Đã sao chép' })).toBeVisible();
    return page.evaluate(() => navigator.clipboard.readText());
  };
  const linkCu = await saoChep();
  expect(linkCu).toMatch(/\/l\/[A-Za-z0-9_-]{20,}$/);
  expect(linkCu.startsWith(new URL(page.url()).origin)).toBe(true);

  await page.getByRole('button', { name: 'Đổi link mời' }).click();
  const hoi = page.getByRole('alertdialog');
  await expect(hoi).toContainText('Đổi link mời? Link cũ sẽ không dùng được nữa. Sale đã thêm lịch vẫn giữ.');
  await hoi.getByRole('button', { name: 'Đổi link' }).click();
  await expect(hoi).toHaveCount(0);
  await expect(page.getByRole('region', { name: 'Đã kết nối · 1' }).getByText('Sale Hùng')).toBeVisible();
  const linkMoi = await saoChep();
  expect(linkMoi).not.toBe(linkCu);

  // Link cũ: xem trước báo không còn dùng được (A1-link-01), không có dữ liệu chủ nhà.
  const khach = await trangMoi(browser);
  await khach.goto(new URL(linkCu).pathname);
  await expect(khach.getByText('Link mời không còn dùng được.')).toBeVisible();
  await expect(khach.getByText('Nhờ chủ nhà gửi link mới.')).toBeVisible();
  await expect(khach.getByText(/Anh Tuấn/)).toHaveCount(0);
  await khach.goto(new URL(linkMoi).pathname);
  await expect(khach.getByText('Anh Tuấn mời bạn xem lịch 2 căn')).toBeVisible();
});

test('YC6.3-NT10 Anh Tuấn mở link của mình, Chị Hoa (vai chủ nhà) mở link đó: không có nút "Thêm lịch"', async ({ page, browser }) => {
  const tuan = chuTuan();
  await dangNhapBangMa(page, tuan.email);
  await expect(page.getByRole('navigation', { name: 'Tab' })).toBeVisible();
  await page.goto(`/l/${tuan.ma}`);
  await expect(page.getByText('Đây là link mời của bạn. Gửi link này cho sale để họ xem lịch.')).toBeVisible();
  await expect(page.getByRole('button', { name: /Thêm lịch/ })).toHaveCount(0);

  const hoa = taoTaiKhoan('chu_nha', 'Chị Hoa');
  const trangHoa = await trangMoi(browser);
  await dangNhapBangMa(trangHoa, hoa.email);
  await expect(trangHoa.getByRole('navigation', { name: 'Tab' })).toBeVisible();
  await trangHoa.goto(`/l/${tuan.ma}`);
  await expect(trangHoa.getByText('Link này dành cho sale. Tài khoản của bạn đang là chủ nhà.')).toBeVisible();
  await expect(trangHoa.getByRole('button', { name: /Thêm lịch/ })).toHaveCount(0);
  await trangHoa.getByRole('button', { name: 'Về lịch của tôi' }).click();
  await expect(trangHoa).toHaveURL(/\/$/);
  expect(sql(`select count(*) from public.ket_noi where chu_id = '${tuan.id}'`)).toBe('0');
});
