// Test e2e US62 · Màn Thông báo (YC12.2, P13), trên Supabase chạy ở máy với hộp thư giả. Tên, email đều giả.
import { expect, test } from '@playwright/test';
import { dangNhapBangMa, idCua, sql, taoTaiKhoan } from './hoTro';

test('YC12.2-NT6 YC12.2-NT1 YC12.2-NT3 YC12.2-NT4 luồng chính: P13-00 khi chưa có gì, rồi 2 chưa đọc, chạm mở S7-03, đánh dấu đã đọc', async ({ page }) => {
  const hung = taoTaiKhoan('sale', 'Sale Hùng');
  const id = idCua(hung.email);

  await dangNhapBangMa(page, hung.email);
  await page.getByRole('button', { name: 'Cá nhân', exact: true }).click();
  // NT6: chưa có thông báo.
  await page.getByRole('button', { name: /^Thông báo/ }).click();
  await expect(page.getByText('Chưa có thông báo nào')).toBeVisible();
  await page.getByRole('button', { name: 'Quay lại' }).click();

  // NT1: hai thông báo chưa đọc, một đã đọc.
  sql(`insert into public.thong_bao (nguoi_nhan, loai, noi_dung, doi_tuong_loai, tao_luc, doc_luc) values
       ('${id}', 'chu_ngung_cho_xem', jsonb_build_object('ten_chu', 'Anh Tuấn'), 'ket_noi', now() - interval '2 minutes', null),
       ('${id}', 'chu_them_can', jsonb_build_object('ten_chu', 'Chị Hoa', 'ma_can', '2105'), 'can', now() - interval '1 minutes', null),
       ('${id}', 'chu_dong_y_ket_noi', jsonb_build_object('ten_chu', 'Chị Hoa'), 'ket_noi', now() - interval '3 days', now() - interval '2 days')`);
  await page.getByRole('button', { name: /^Thông báo/ }).click();
  await expect(page.getByText('2 chưa đọc')).toBeVisible();
  await expect(page.locator('[data-chua-doc="co"]')).toHaveCount(2);
  await expect(page.getByRole('region', { name: 'Trước đó' }).getByRole('button')).toHaveCount(1);

  // NT3: đánh dấu đã đọc tất cả; bấm lại không đổi lúc đọc cũ.
  await page.getByRole('button', { name: 'Đánh dấu đã đọc' }).click();
  await expect(page.getByText('0 chưa đọc')).toBeVisible();
  await expect.poll(() => sql(`select count(*) from public.thong_bao where nguoi_nhan = '${id}' and doc_luc is null`)).toBe('0');
  const luc = sql(`select string_agg(doc_luc::text, ',' order by id) from public.thong_bao where nguoi_nhan = '${id}'`);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Cá nhân', exact: true })).toBeVisible();
  expect(sql(`select string_agg(doc_luc::text, ',' order by id) from public.thong_bao where nguoi_nhan = '${id}'`)).toBe(luc);

  // NT4: chạm "Anh Tuấn đã ngừng cho bạn xem lịch" mở S7-03 (danh sách đặt phòng và yêu cầu), không mở lịch của Anh Tuấn.
  await page.getByRole('button', { name: 'Cá nhân', exact: true }).click();
  await page.getByRole('button', { name: /^Thông báo/ }).click();
  await page.getByRole('button', { name: /Anh Tuấn đã ngừng cho bạn xem lịch/ }).click();
  await expect(page.locator('[data-man^="S7-03"]')).toBeVisible();
});
