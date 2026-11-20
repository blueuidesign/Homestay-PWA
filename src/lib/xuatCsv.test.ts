// Test unit xuất file CSV (YC1.6). Hàm thuần, không gọi mạng. Số theo DLM.4.
import { describe, expect, it } from 'vitest';
import { COT_CSV, khoangChip, taoCsv, tenFileCsv, kiemKhoang, CAU_QUA_NAM, type DongXuat } from './xuatCsv';

const b1: DongXuat = { maCan: '1509', ngayNhan: '2026-10-10', ngayTra: '2026-10-12', soDem: 2, tenKhach: null, sdtKhach: null,
  tenSale: 'Sale Hùng', saleDaXoa: false, tongTien: 2200000, daCoc: 1000000, conLai: 1200000, ghiChu: null };
const b5: DongXuat = { maCan: '1509', ngayNhan: '2026-10-13', ngayTra: '2026-10-15', soDem: 2, tenKhach: 'Khách Mai, "VIP"', sdtKhach: '0900000077',
  tenSale: null, saleDaXoa: false, tongTien: 1800000, daCoc: 0, conLai: 1800000, ghiChu: 'Nhận sớm\nmang xe máy' };

/** Đọc CSV đơn giản (dấu phẩy, ngoặc kép), đủ để kiểm số dòng và ô. */
function docCsv(s: string): string[][] {
  const dong: string[][] = []; let o = ''; let hang: string[] = []; let trongNgoac = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i]!;
    if (trongNgoac) {
      if (c === '"' && s[i + 1] === '"') { o += '"'; i++; } else if (c === '"') trongNgoac = false; else o += c;
    } else if (c === '"') trongNgoac = true;
    else if (c === ',') { hang.push(o); o = ''; }
    else if (c === '\r') { /* bỏ */ }
    else if (c === '\n') { hang.push(o); dong.push(hang); hang = []; o = ''; }
    else o += c;
  }
  if (o || hang.length) { hang.push(o); dong.push(hang); }
  return dong;
}

describe('YC1.6 · Xuất file CSV', () => {
  it('YC1.6-NT1 file có đúng số dòng đặt phòng (một dòng tiêu đề và mỗi đặt phòng một dòng)', () => {
    const tam = Array.from({ length: 8 }, (_, i) => ({ ...b1, ngayNhan: `2026-10-${String(i + 10)}` }));
    expect(docCsv(taoCsv(tam).replace(/^﻿/, '')).length).toBe(1 + 8);
    expect(docCsv(taoCsv(tam.slice(0, 4)).replace(/^﻿/, '')).length).toBe(1 + 4);
  });

  it('YC1.6-NT2 mỗi dòng có đủ 11 cột theo thứ tự ở bước 4', () => {
    expect(COT_CSV).toEqual(['Căn', 'Ngày nhận', 'Ngày trả', 'Số đêm', 'Khách', 'SĐT', 'Sale', 'Tổng tiền', 'Đã cọc', 'Còn lại', 'Ghi chú']);
    const d = docCsv(taoCsv([b1, b5]).replace(/^﻿/, ''));
    expect(d[0]).toEqual(COT_CSV);
    for (const h of d) expect(h).toHaveLength(11);
    expect(d[1]).toEqual(['1509', '2026-10-10', '2026-10-12', '2', '', '', 'Sale Hùng', '2200000', '1000000', '1200000', '']);
    expect(d[2]![4]).toBe('Khách Mai, "VIP"');
    expect(d[2]![10]).toBe('Nhận sớm\nmang xe máy');
  });

  it('YC1.6-NT3 tiền là số nguyên đồng không dấu ngăn nghìn, file có BOM UTF-8 để Excel đọc đúng tiếng Việt', () => {
    const s = taoCsv([b1]);
    expect(s.startsWith('﻿')).toBe(true);
    expect(s).toContain(',2200000,1000000,1200000,');
    expect(s).not.toMatch(/2[.,]200[.,]000/);
    expect(s).toContain('\r\n');
    expect(s).toContain('Căn,Ngày nhận');
  });

  it('YC1.6-NT3 số điện thoại giữ số 0 đầu khi mở bằng Excel', () => {
    const d = docCsv(taoCsv([b5]).replace(/^﻿/, ''));
    expect(d[1]![5]).toBe('="0900000077"');
  });

  it('YC1.6 chữ người nhập bắt đầu bằng dấu công thức thì thêm dấu nháy, Excel không chạy như công thức', () => {
    const d = docCsv(taoCsv([{ ...b5, ghiChu: '=HYPERLINK("x")', tenKhach: '+84 Lan' }]).replace(/^﻿/, ''));
    expect(d[1]![10]).toBe('\'=HYPERLINK("x")');
    expect(d[1]![4]).toBe('\'+84 Lan');
  });

  it('QT6.5 sale đã xóa tài khoản: cột Sale ghi tên cũ kèm "Đã xoá tài khoản"', () => {
    const d = docCsv(taoCsv([{ ...b1, saleDaXoa: true }]).replace(/^﻿/, ''));
    expect(d[1]![6]).toBe('Sale Hùng (Đã xoá tài khoản)');
  });

  it('YC1.6 bước 6, GD30 tên file "home247-dat-phong-<từ ngày>-<đến ngày>.csv"', () => {
    expect(tenFileCsv('2026-10-01', '2026-10-31')).toBe('home247-dat-phong-2026-10-01-2026-10-31.csv');
  });

  it('YC1.6 bước 2 chip thời gian theo ngày hôm nay', () => {
    expect(khoangChip('thang-nay', '2026-10-14')).toEqual({ tu: '2026-10-01', den: '2026-10-31' });
    expect(khoangChip('thang-nay', '2026-02-03')).toEqual({ tu: '2026-02-01', den: '2026-02-28' });
    expect(khoangChip('ba-thang', '2026-10-14')).toEqual({ tu: '2026-08-01', den: '2026-10-31' });
    expect(khoangChip('ba-thang', '2026-01-20')).toEqual({ tu: '2025-11-01', den: '2026-01-31' });
    expect(khoangChip('ca-nam', '2026-10-14')).toEqual({ tu: '2026-01-01', den: '2026-12-31' });
  });

  it('YC1.6 luật kiểm: đến ngày không trước từ ngày, tối đa 366 ngày', () => {
    expect(kiemKhoang('2026-10-01', '2026-10-31')).toBeNull();
    expect(kiemKhoang('2026-01-01', '2027-01-01')).toBeNull();
    expect(kiemKhoang('2026-01-01', '2027-01-02')).toBe(CAU_QUA_NAM);
    expect(kiemKhoang('2026-10-31', '2026-10-01')).toBe(CAU_QUA_NAM);
    expect(CAU_QUA_NAM).toBe('Chọn tối đa 1 năm');
  });
});
