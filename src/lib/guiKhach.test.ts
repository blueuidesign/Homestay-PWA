// Test unit chữ của S5 · Gửi cho khách (YC8.1, YC8 "Mẫu tin gửi khách", YC8-H1, H6, US48).
import { describe, expect, it } from 'vitest';
import {
  CAU_QUA_10_CAN, SO_ANH_TOI_DA, anhSeGui, chuDauMan, chuNutAnh, chuNutSaoChepTatCa, chuSoAnh, MAU_TIN_MAC_DINH, tinCaNCan,
  type TinGuiKhach,
} from './guiKhach';

const TIN: TinGuiKhach = {
  tu: '2026-10-10', den: '2026-10-12', soDem: 2, mauTin: MAU_TIN_MAC_DINH, tenSale: 'Sale Hùng',
  can: [
    { canId: 'a', maCan: '1509', tenToa: 'ICON40', soPhongNgu: 2, soGiuong: 3, soAnh: 6, anh: [], tongGiaBan: 2_600_000,
      chu: 'ICON40 1509 · 2PN · 3 giường, view biển Bãi Cháy\n10/10 → 12/10 (2 đêm): 2.600.000đ' },
    { canId: 'b', maCan: '1103', tenToa: 'Sapphire', soPhongNgu: 3, soGiuong: 2, soAnh: 5, anh: [], tongGiaBan: 1_600_000,
      chu: 'Sapphire 1103 · 3PN · 2 giường, view thành phố\n10/10 → 12/10 (2 đêm): 1.600.000đ' },
    { canId: 'c', maCan: '2208', tenToa: 'À La Carte', soPhongNgu: 1, soGiuong: 1, soAnh: 4, anh: [], tongGiaBan: 3_600_000,
      chu: 'À La Carte 2208 · 1PN · 1 giường, view biển\n10/10 → 12/10 (2 đêm): 3.600.000đ' },
  ],
};

describe('S5 · chữ trên màn (YC8.1 bước 2, 3, 5, 7)', () => {
  it('YC8.1 bước 2: dòng đầu màn', () => {
    expect(chuDauMan(3, '2026-10-10', '2026-10-12')).toBe(
      '3 căn · 10/10 → 12/10. Nhiều điện thoại không chia sẻ chữ và ảnh chung một lần: mỗi căn chia sẻ chữ một lần, ảnh một lần.');
  });

  it('YC8.1-NT15 YC8-H6: 6 ảnh gửi đủ; 12 ảnh gửi 10 ảnh đầu', () => {
    expect(chuSoAnh(6)).toBe('6 ảnh');
    expect(chuNutAnh(6)).toBe('Gửi 6 ảnh');
    expect(chuSoAnh(12)).toBe('12 ảnh, gửi 10 ảnh đầu');
    expect(chuNutAnh(12)).toBe('Gửi 10 ảnh');
    expect(SO_ANH_TOI_DA).toBe(10);
    expect(anhSeGui(Array.from({ length: 12 }, (_, i) => `u${i}`))).toEqual(Array.from({ length: 10 }, (_, i) => `u${i}`));
  });

  it('YC8.1 bước 7: nút "Sao chép chữ cả 3 căn"', () => {
    expect(chuNutSaoChepTatCa(3)).toBe('Sao chép chữ cả 3 căn');
  });

  it('YC8.1-NT12 YC8-H1: câu khi quá 10 căn', () => {
    expect(CAU_QUA_10_CAN).toBe('Mỗi lần gửi tối đa 10 căn. Quay lại bỏ bớt căn.');
  });
});

describe('YC8 Mẫu tin gửi khách', () => {
  it('YC8.1-NT3: mẫu mặc định, chữ cả 3 căn theo thứ tự trên màn, đánh số', () => {
    const tin = tinCaNCan(TIN);
    expect(tin.startsWith('Em gửi anh chị 3 căn còn trống 10/10 → 12/10 (2 đêm):\n')).toBe(true);
    expect(tin.endsWith('\nAnh chị ưng căn nào báo em giữ phòng nhé.')).toBe(true);
    const i1 = tin.indexOf('1. ICON40 1509'), i2 = tin.indexOf('2. Sapphire 1103'), i3 = tin.indexOf('3. À La Carte 2208');
    expect(i1).toBeGreaterThan(0);
    expect(i2).toBeGreaterThan(i1);
    expect(i3).toBeGreaterThan(i2);
    for (const c of TIN.can) expect(tin).toContain(c.chu);
  });

  it('YC8 Mẫu tin gửi khách: điền [Tên sale], [Số căn], [Ngày], [Số đêm] ở mẫu riêng', () => {
    const tin = tinCaNCan({ ...TIN, mauTin: '[Tên sale] gửi [Số căn] căn [Ngày], [Số đêm]\n[Danh sách căn]' });
    expect(tin.split('\n')[0]).toBe('Sale Hùng gửi 3 căn 10/10 → 12/10, 2 đêm');
    expect(tin).not.toContain('[');
  });

  it('YC8.1-NT4: chữ cả N căn chỉ có giá bán', () => {
    const tin = tinCaNCan(TIN);
    expect(tin).toContain('2.600.000đ');
    expect(tin).not.toContain('2.200.000đ');
  });
});
