// Test e2e US26 · Mở form, chọn căn và ngày, kiểm trùng sớm (YC5.1), trên Supabase chạy ở máy với hộp thư giả.
// Tên, email, số đều giả. Chạy: E2E_SUPABASE=1 npx playwright test tests/e2e/supabase (docs/dev/chay-va-test.md).
// Ngày đặt theo tháng hiện tại (giờ Việt Nam), vì lịch mở sẵn ở tháng của hôm nay.
import { expect, test } from '@playwright/test';
import { dangNhapBangMa, layMa, nhapMa, sql, taoTaiKhoan } from './hoTro';

test('YC5.1-NT5 chi tiết ngày 10: dòng 3402 "Trống" có nút "Đặt phòng"; bấm thì CN4 mở với căn 3402 và ngày nhận 10', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ Thêm Đặt Phòng');
  const nguoi = sql(`select id from auth.users where email = '${chu.email}'`);
  const c1509 = sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu, tao_luc) values ('${nguoi}', '1509', 2, now() - interval '1 day') returning id`).split('\n')[0]!;
  sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu) values ('${nguoi}', '3402', 1)`);
  const [nam, thang] = sql(`select to_char(public.local_today(), 'YYYY|FMMM')`).split('|').map(Number) as [number, number];
  const ng = (n: number) => `${nam}-${String(thang).padStart(2, '0')}-${String(n).padStart(2, '0')}`;
  const t2 = String(thang).padStart(2, '0');

  // Như B1 (DLM.4): 1509, 10 → 12, khách lẻ chủ tự ghi, 2.200.000đ.
  sql(`with b as (
         insert into public.booking (can_id, ngay_nhan, ngay_tra, nguon, tao_boi, tien_phong, trang_thai_tien)
         values ('${c1509}', '${ng(10)}', '${ng(12)}', 'chu_ghi', '${nguoi}', 2200000, 'chua_coc') returning id)
       insert into public.booking_dem (booking_id, dem, tien)
       select b.id, d, 1100000 from b, unnest(array['${ng(10)}'::date, '${ng(11)}'::date]) d`);

  await dangNhapBangMa(page, chu.email);
  await expect(page.getByRole('heading', { name: `Tháng ${thang}/${nam}` })).toBeVisible();

  // YC5.1 bước 1b: chi tiết ngày 10, dòng 3402 trống có nút "Đặt phòng".
  await page.locator(`[data-ngay="${ng(10)}"]`).click();
  const chiTiet = page.getByRole('region', { name: `Ngày 10/${t2}/${nam}` });
  const d3402 = chiTiet.getByRole('listitem', { name: 'Phòng 3402' });
  await expect(d3402.getByText(/Trống/)).toBeVisible();
  await d3402.getByRole('button', { name: 'Đặt phòng' }).click();

  // CN4 mở với căn 3402, ngày nhận 10, số đêm 1.
  await expect(page.getByRole('heading', { name: 'Thêm đặt phòng' })).toBeVisible();
  await expect(page.getByRole('button', { name: '3402' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByLabel('Ngày nhận phòng')).toHaveValue(ng(10));
  await expect(page.getByLabel('Ngày trả phòng')).toHaveValue(ng(11));
  await expect(page.getByText(`✓ 10/${t2} → 11/${t2} (1 đêm) · không trùng lịch`)).toBeVisible();

  // YC5.1 bước 2, 4: đổi sang 1509 thì trùng với đặt phòng 10 → 12 đã đọc từ database; nút lưu không bấm được.
  await page.getByRole('button', { name: '1509' }).click();
  await expect(page.getByText(`Trùng đêm 10/${t2} với đặt phòng của Khách lẻ (10/${t2} → 12/${t2})`)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Thêm đặt phòng' })).toBeDisabled();

  // Đóng thì về tab Lịch.
  await page.getByRole('button', { name: 'Đóng' }).click();
  await expect(page.getByRole('heading', { name: `Tháng ${thang}/${nam}` })).toBeVisible();
});

// US27 · YC5.2 người đặt, tiền phòng, trạng thái tiền; YC5.3 bước 9, 10: lưu một khách lẻ có tên, về tab Lịch với toast.
test('YC5.2-NT1 YC5.2-NT12 YC5.3-NT1 lưu khách lẻ có tên: tiền phòng điền sẵn theo bảng giá, về tab Lịch thấy toast và ô ngày tô màu', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ Lưu Đặt Phòng');
  const nguoi = sql(`select id from auth.users where email = '${chu.email}'`);
  const c1509 = sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu) values ('${nguoi}', '1509', 2) returning id`).split('\n')[0]!;
  sql(`insert into public.gia_thang (can_id, thang, gia_thuong, gia_cuoi_tuan)
       values ('${c1509}', date_trunc('month', public.local_today())::date, 900000, 1300000)`);
  const [nam, thang] = sql(`select to_char(public.local_today(), 'YYYY|FMMM')`).split('|').map(Number) as [number, number];
  const ng = (n: number) => `${nam}-${String(thang).padStart(2, '0')}-${String(n).padStart(2, '0')}`;
  const t2 = String(thang).padStart(2, '0');
  // DLM.3: hai đêm 20, 21 theo giá tháng (đêm T6, T7 là cuối tuần).
  const tong = Number(sql(`select sum(case when extract(isodow from d) in (5, 6) then 1300000 else 900000 end)
                           from unnest(array['${ng(20)}'::date, '${ng(21)}'::date]) d`));

  await dangNhapBangMa(page, chu.email);
  await expect(page.getByRole('heading', { name: `Tháng ${thang}/${nam}` })).toBeVisible();
  await page.getByRole('banner').getByRole('button', { name: 'Đặt phòng' }).click();
  await expect(page.getByRole('heading', { name: 'Thêm đặt phòng' })).toBeVisible();

  await page.getByLabel('Ngày nhận phòng').fill(ng(20));
  await page.getByRole('checkbox', { name: '2 đêm' }).click();
  await expect(page.getByText(`✓ 20/${t2} → 22/${t2} (2 đêm) · không trùng lịch`)).toBeVisible();
  // YC5.2-NT1: ô tiền phòng điền sẵn tổng giá chủ nhà; mỗi đêm một dòng.
  await expect(page.getByLabel('Tiền phòng (đ)')).toHaveValue(tong.toLocaleString('de-DE'));
  await expect(page.getByLabel('Giá từng đêm').getByRole('listitem')).toHaveCount(2);
  // YC5.2-NT8: chưa chọn người đặt thì nút không bấm được.
  await expect(page.getByRole('button', { name: 'Thêm đặt phòng' })).toBeDisabled();

  // YC5.2-NT12: chọn "Khách lẻ", gõ tên rồi lưu.
  await page.getByRole('group', { name: 'Khách / Sale' }).getByRole('button', { name: 'Khách lẻ' }).click();
  await page.getByLabel('Tên khách (không bắt buộc)').fill('Khách Thử E2E');
  await expect(page.getByRole('button', { name: 'Thêm đặt phòng' })).toBeEnabled();
  await page.getByRole('button', { name: 'Thêm đặt phòng' }).click();

  // YC5.3 bước 10: về tab Lịch, toast mang tên khách và căn; ô ngày 20, 21 tô màu của 1509.
  await expect(page.getByText('Đã thêm đặt phòng Khách Thử E2E · 1509')).toBeVisible();
  await expect(page.getByRole('heading', { name: `Tháng ${thang}/${nam}` })).toBeVisible();
  await expect(page.locator(`[data-ngay="${ng(20)}"]`)).toHaveAttribute('aria-label', 'Ngày 20, đã đặt phòng 1509');
  await expect(page.locator(`[data-ngay="${ng(21)}"]`)).toHaveAttribute('aria-label', 'Ngày 21, đã đặt phòng 1509');
  await expect(page.locator(`[data-ngay="${ng(22)}"]`)).toHaveAttribute('aria-label', 'Ngày 22, trống');

  // Database: tiền phòng bằng tổng tiền các đêm, tên khách ở phần riêng của chủ nhà (QD11), giờ theo cài đặt (YC5.2-NT11).
  expect(sql(`select b.tien_phong || '|' || (select sum(tien) from public.booking_dem where booking_id = b.id) || '|' || r.ten_khach
                || '|' || to_char(b.gio_nhan, 'HH24:MI') || '|' || b.trang_thai_tien
              from public.booking b join public.booking_rieng r on r.booking_id = b.id and r.nguoi_id = '${nguoi}'
              where b.can_id = '${c1509}'`)).toBe(`${tong}|${tong}|Khách Thử E2E|14:00|chua_coc`);
});

// US28 · YC5.3 bước 10 (CN4-03) và bước 11: lưu xong về tháng của ngày nhận, chi tiết ngày mở sẵn; database từ chối trùng
// (đặt phòng trùng ghi ở máy khác sau khi form đã đọc lịch) thì ở lại form với dòng kiểm đỏ.
test('YC5.3-NT1 CN4-03 lưu khách lẻ tháng sau: về tab Lịch đúng tháng ngày nhận, ngày nhận đang chọn, chi tiết mở sẵn; bước 11 trùng ở database thì dòng đỏ', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ Chặn Trùng');
  const nguoi = sql(`select id from auth.users where email = '${chu.email}'`);
  const c1509 = sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu) values ('${nguoi}', '1509', 2) returning id`).split('\n')[0]!;
  const [nam, thang] = sql(`select to_char(date_trunc('month', public.local_today()) + interval '1 month', 'YYYY|FMMM')`)
    .split('|').map(Number) as [number, number];
  const ng = (n: number) => `${nam}-${String(thang).padStart(2, '0')}-${String(n).padStart(2, '0')}`;
  const t2 = String(thang).padStart(2, '0');

  await dangNhapBangMa(page, chu.email);
  await page.getByRole('banner').getByRole('button', { name: 'Đặt phòng' }).click();
  await expect(page.getByRole('heading', { name: 'Thêm đặt phòng' })).toBeVisible();
  await page.getByLabel('Ngày nhận phòng').fill(ng(5));
  await expect(page.getByText(`✓ 05/${t2} → 06/${t2} (1 đêm) · không trùng lịch`)).toBeVisible();
  await page.getByRole('group', { name: 'Khách / Sale' }).getByRole('button', { name: 'Khách lẻ' }).click();
  await page.getByLabel('Tiền phòng (đ)').fill('900000');
  await page.getByRole('button', { name: 'Thêm đặt phòng' }).click();

  // YC5.3-NT1, bước 10: toast; lịch ở tháng của ngày nhận, ô ngày nhận tô màu và đang chọn, chi tiết ngày đó mở sẵn.
  await expect(page.getByText('Đã thêm đặt phòng Khách lẻ · 1509')).toBeVisible();
  await expect(page.getByRole('heading', { name: `Tháng ${thang}/${nam}` })).toBeVisible();
  const o5 = page.locator(`[data-ngay="${ng(5)}"]`);
  await expect(o5).toHaveAttribute('aria-label', 'Ngày 5, đã đặt phòng 1509');
  await expect(o5).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('region', { name: `Ngày 05/${t2}/${nam}` })).toBeVisible();

  // Bước 11: mở form, chọn 10 → 12; trong lúc đó máy khác ghi 1509 đêm 11. Database từ chối, form giữ dữ liệu, dòng đỏ.
  await page.getByRole('banner').getByRole('button', { name: 'Đặt phòng' }).click();
  await page.getByLabel('Ngày nhận phòng').fill(ng(10));
  await page.getByRole('checkbox', { name: '2 đêm' }).click();
  await expect(page.getByText(`✓ 10/${t2} → 12/${t2} (2 đêm) · không trùng lịch`)).toBeVisible();
  await page.getByRole('group', { name: 'Khách / Sale' }).getByRole('button', { name: 'Khách lẻ' }).click();
  await page.getByLabel('Tiền phòng (đ)').fill('1800000');
  sql(`with b as (
         insert into public.booking (can_id, ngay_nhan, ngay_tra, nguon, tao_boi, tien_phong, trang_thai_tien)
         values ('${c1509}', '${ng(11)}', '${ng(12)}', 'chu_ghi', '${nguoi}', 900000, 'chua_coc') returning id)
       insert into public.booking_dem (booking_id, dem, tien) select b.id, '${ng(11)}', 900000 from b`);
  await page.getByRole('button', { name: 'Thêm đặt phòng' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Căn đã có đặt phòng trong những đêm này' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Thêm đặt phòng' })).toBeVisible();
  await expect(page.getByLabel('Ngày nhận phòng')).toHaveValue(ng(10));
  await expect(page.getByLabel('Tiền phòng (đ)')).toHaveValue('1.800.000');
  await expect(page.getByRole('button', { name: 'Thêm đặt phòng' })).toBeDisabled();
  expect(sql(`select count(*) from public.booking where can_id = '${c1509}'`)).toBe('2');
});

// US28 · HV7 bước 2: hết phiên lúc bấm "Thêm đặt phòng" mà làm mới không được (phiên đã bị thu hồi) thì về màn đăng nhập;
// đăng nhập lại xong quay về đúng form CN4 với căn, ngày đã nhập, rồi lưu được với cùng mã lần gửi.
test('HV7-NT2 làm mới phiên không được: đăng nhập lại thì form CN4 còn căn và ngày đã nhập', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chủ Hết Phiên');
  const nguoi = sql(`select id from auth.users where email = '${chu.email}'`);
  const c1509 = sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu) values ('${nguoi}', '1509', 2) returning id`).split('\n')[0]!;
  const [nam, thang] = sql(`select to_char(date_trunc('month', public.local_today()) + interval '1 month', 'YYYY|FMMM')`)
    .split('|').map(Number) as [number, number];
  const ng = (n: number) => `${nam}-${String(thang).padStart(2, '0')}-${String(n).padStart(2, '0')}`;
  const t2 = String(thang).padStart(2, '0');

  await dangNhapBangMa(page, chu.email);
  await page.getByRole('banner').getByRole('button', { name: 'Đặt phòng' }).click();
  await expect(page.getByRole('heading', { name: 'Thêm đặt phòng' })).toBeVisible();
  await page.getByLabel('Ngày nhận phòng').fill(ng(10));
  await page.getByRole('checkbox', { name: '3 đêm' }).click();
  await expect(page.getByText(`✓ 10/${t2} → 13/${t2} (3 đêm) · không trùng lịch`)).toBeVisible();
  await page.getByRole('group', { name: 'Khách / Sale' }).getByRole('button', { name: 'Khách lẻ' }).click();
  await page.getByLabel('Tiền phòng (đ)').fill('2700000');

  // Phiên hết: PostgREST từ chối vì JWT hết hạn; phiên trên máy chủ đã bị thu hồi nên làm mới không được.
  await page.route('**/rest/v1/rpc/fn_tao_booking', (r) => r.fulfill({
    status: 401, contentType: 'application/json', body: JSON.stringify({ code: 'PGRST301', message: 'JWT expired' }),
  }));
  sql(`delete from auth.refresh_tokens where user_id = '${nguoi}'; delete from auth.sessions where user_id = '${nguoi}'`);
  await page.getByRole('button', { name: 'Thêm đặt phòng' }).click();

  // HV7 bước 2: về màn đăng nhập (YC1.2); chưa có đặt phòng nào được ghi.
  await expect(page.getByLabel('Email')).toBeVisible();
  await page.unroute('**/rest/v1/rpc/fn_tao_booking');
  expect(sql(`select count(*) from public.booking where can_id = '${c1509}'`)).toBe('0');
  // Cho phép xin mã lần hai ngay (giới hạn 60 giây giữa hai lần gửi là của YC1.2, không phải của test này).
  sql(`update auth.users set recovery_sent_at = now() - interval '2 minutes', confirmation_sent_at = now() - interval '2 minutes'
       where id = '${nguoi}'`);
  await page.getByLabel('Email').fill(chu.email);
  await page.getByRole('button', { name: 'Gửi mã đăng nhập' }).click();
  await nhapMa(page, await layMa(chu.email, 2));
  await page.getByRole('button', { name: 'Đăng nhập' }).click();

  // HV7-NT2: quay lại đúng form CN4, căn và ngày đã nhập còn nguyên.
  await expect(page.getByRole('heading', { name: 'Thêm đặt phòng' })).toBeVisible();
  await expect(page.getByRole('button', { name: '1509' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByLabel('Ngày nhận phòng')).toHaveValue(ng(10));
  await expect(page.getByText(`✓ 10/${t2} → 13/${t2} (3 đêm) · không trùng lịch`)).toBeVisible();

  // Lưu tiếp được, đúng một đặt phòng.
  await page.getByRole('group', { name: 'Khách / Sale' }).getByRole('button', { name: 'Khách lẻ' }).click();
  await page.getByLabel('Tiền phòng (đ)').fill('2700000');
  await page.getByRole('button', { name: 'Thêm đặt phòng' }).click();
  await expect(page.getByText('Đã thêm đặt phòng Khách lẻ · 1509')).toBeVisible();
  expect(sql(`select count(*) from public.booking where can_id = '${c1509}'`)).toBe('1');
});
