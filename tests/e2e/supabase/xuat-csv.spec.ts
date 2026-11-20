// Test e2e US6 · Xuất file CSV (YC1.6, P8), trên Supabase chạy ở máy với hộp thư giả. Tên, email đều giả.
import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { dangNhapBangMa, idCua, sql, taoCanCoAnh, taoTaiKhoan } from './hoTro';

test('YC1.6-NT1 YC1.6-NT2 luồng chính: Cá nhân mở P8, "Tháng này" và "Tất cả" ghi đúng số, xuất ra file đủ 11 cột', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Chị Hoa Thử');
  const id = idCua(chu.email);
  const can = taoCanCoAnh(id, '1509', 'ICON40', 2, 3, 'Biển');
  // Hai đặt phòng trong tháng này (giờ Việt Nam): ngày 5 → 7 và 10 → 11, tiền chia đều theo đêm.
  for (const [a, b, tien] of [[4, 6, 1800000], [9, 10, 900000]] as const) {
    sql(`with m as (select date_trunc('month', now() at time zone 'Asia/Ho_Chi_Minh')::date as d),
         b as (insert into public.booking (can_id, ngay_nhan, ngay_tra, nguon, tao_boi, tien_phong, trang_thai_tien)
               select '${can}', m.d + ${a}, m.d + ${b}, 'chu_ghi', '${id}', ${tien}, 'chua_coc' from m returning id, ngay_nhan, ngay_tra)
         insert into public.booking_dem (booking_id, dem, tien)
         select b.id, g::date, ${tien} / (b.ngay_tra - b.ngay_nhan) from b, generate_series(b.ngay_nhan, b.ngay_tra - 1, interval '1 day') g`);
  }

  await dangNhapBangMa(page, chu.email);
  await page.getByRole('button', { name: 'Cá nhân', exact: true }).click();
  await page.getByRole('button', { name: 'Xuất file Excel (CSV)' }).click();

  const p8 = page.locator('[data-man="P8"]');
  await expect(p8.getByRole('heading', { name: 'Xuất file Excel (CSV)' })).toBeVisible();
  await expect(p8.getByRole('button', { name: 'Tháng này' })).toHaveAttribute('aria-pressed', 'true');
  await expect(p8.getByText('2 đặt phòng')).toBeVisible();
  await p8.getByRole('button', { name: '1509' }).click();
  await expect(p8.getByText('2 đặt phòng')).toBeVisible();

  const tai = page.waitForEvent('download');
  await p8.getByRole('button', { name: /Xuất file Excel \(CSV\)/ }).click();
  const file = await tai;
  expect(file.suggestedFilename()).toMatch(/^home247-dat-phong-\d{4}-\d{2}-01-\d{4}-\d{2}-\d{2}\.csv$/);
  const chu_ = (await readFile((await file.path())!, 'utf8')).replace(/^﻿/, '');
  const dong = chu_.trim().split('\r\n');
  expect(dong).toHaveLength(3);
  expect(dong[0]).toBe('Căn,Ngày nhận,Ngày trả,Số đêm,Khách,SĐT,Sale,Tổng tiền,Đã cọc,Còn lại,Ghi chú');
  expect(dong[1]!.split(',')).toHaveLength(11);
  expect(dong[1]).toContain(',2,,,,1800000,0,1800000,');
});

test('YC1.6-NT6 tháng không có đặt phòng thì thấy P8-00', async ({ page }) => {
  const chu = taoTaiKhoan('chu_nha', 'Anh Tuấn Thử');
  taoCanCoAnh(idCua(chu.email), '1103', 'Sapphire', 3, 2, 'Phố');
  await dangNhapBangMa(page, chu.email);
  await page.getByRole('button', { name: 'Cá nhân', exact: true }).click();
  await page.getByRole('button', { name: 'Xuất file Excel (CSV)' }).click();
  const p800 = page.locator('[data-man="P8-00"]');
  await expect(p800.getByText('0 đặt phòng')).toBeVisible();
  await expect(p800.getByText('Khoảng thời gian này chưa có đặt phòng. Chọn khoảng khác.')).toBeVisible();
  await expect(p800.getByRole('button', { name: /Xuất file Excel \(CSV\)/ })).toBeDisabled();
});
