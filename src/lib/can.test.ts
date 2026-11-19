// Test unit cho chữ trên thẻ căn (YC3.1 bước 10 đến 12, glossary "Phòng ngủ và số giường").
import { describe, expect, it } from 'vitest';
import { canGoiYAnh, CAU_GOI_Y_ANH, dongThongTin, tenCan, tinhTrangHomNay, type CanTomTat } from './can';

const can = (ghiDe: Partial<CanTomTat> = {}): CanTomTat => ({
  id: 'c1', maCan: '1509', soPhongNgu: 2, soGiuong: 3, loaiView: 'bien', tenToa: 'ICON40',
  soAnh: 12, anhDaiDien: null, moiThem: false, khachDen: null, ...ghiDe,
});

describe('YC3.1 · chữ trên thẻ căn', () => {
  it('YC3.1-NT3 1509 có 3 giường thì dòng thẻ có "2PN · 3 giường"', () => {
    expect(dongThongTin(can())).toBe('2PN · 3 giường · view biển · ICON40');
  });

  it('YC3.1-NT3 căn 2PN chưa nhập số giường thì ghi "2PN", không có chữ "giường"', () => {
    const d = dongThongTin(can({ soGiuong: null, loaiView: null, tenToa: null }));
    expect(d).toBe('2PN');
    expect(d).not.toContain('giường');
  });

  it('YC3.1 bước 10 phần chưa nhập thì bỏ, Studio thì ghi "Studio"', () => {
    expect(dongThongTin(can({ soPhongNgu: 1, soGiuong: null, tenToa: 'Sapphire' }))).toBe('1PN · view biển · Sapphire');
    expect(dongThongTin(can({ soPhongNgu: 0, soGiuong: 1, loaiView: 'nui', tenToa: null }))).toBe('Studio · 1 giường · view núi');
    expect(dongThongTin(can({ soPhongNgu: null, soGiuong: null, loaiView: 'thanh_pho', tenToa: null }))).toBe('view thành phố');
  });

  it('YC3.1-NT4 dòng thẻ không bao giờ có "khách", "người lớn", "trẻ em"', () => {
    for (const c of [can(), can({ soGiuong: null }), can({ soPhongNgu: 0 }), can({ soPhongNgu: 4, soGiuong: 6 })]) {
      expect(dongThongTin(c)).not.toMatch(/khách|người lớn|trẻ em/);
    }
  });

  it('YC3.1-NT5 5 ảnh thì có gợi ý thêm ảnh, 6 ảnh thì không', () => {
    expect(canGoiYAnh(5)).toBe(true);
    expect(canGoiYAnh(6)).toBe(false);
    expect(canGoiYAnh(0)).toBe(true);
    expect(CAU_GOI_Y_ANH).toBe('Nên thêm ảnh: sale cần ít nhất 6 ảnh');
  });

  it('YC3.1 bước 10 tình trạng hôm nay: có khách thì "Có khách đến <ngày trả>", không thì "Trống hôm nay ✓"', () => {
    expect(tinhTrangHomNay(can({ khachDen: '2026-10-12' }))).toEqual({ co: true, chu: 'Có khách đến 12/10' });
    expect(tinhTrangHomNay(can({ khachDen: null }))).toEqual({ co: false, chu: 'Trống hôm nay ✓' });
  });

  it('YC3.1 bước 10 mã căn là số phòng thì "Phòng 1509", mã tự do thì giữ nguyên', () => {
    expect(tenCan('1509')).toBe('Phòng 1509');
    expect(tenCan('Greenbay')).toBe('Greenbay');
  });
});
