// Test unit cho luật kiểm ô của A2, A11 (YC1.2 Luật kiểm, pwa.md P2).
import { describe, expect, it } from 'vitest';
import { CAU_LOI_SO, CAU_LOI_TEN, chuanHoaSo, kiemEmail, kiemFormDangKy, kiemMa, kiemSo, kiemTen } from './kiemDangKy';

describe('YC1.2 · luật kiểm ô', () => {
  it('YC1.2-NT13 ô số có chữ hay ít hơn 9 chữ số thì báo "Số điện thoại cần từ 9 đến 15 chữ số."', () => {
    expect(CAU_LOI_SO).toBe('Số điện thoại cần từ 9 đến 15 chữ số.');
    for (const sai of ['12ab', '09123456', '0912abc678', '', '   ', '0912345678901234', '09+12345678', '++84912345678']) {
      expect(kiemSo(sai), sai).toBe(CAU_LOI_SO);
    }
  });

  it('YC1.2-NT13 số đúng luật (bỏ khoảng trắng, chấm, gạch; cho + ở đầu) thì không báo', () => {
    expect(kiemSo('0912 345 678')).toBeNull();
    expect(kiemSo('0912.345-678')).toBeNull();
    expect(kiemSo('+84 912 345 678')).toBeNull();
    expect(kiemSo('091234567')).toBeNull();
    expect(chuanHoaSo(' 0912.345-678 ')).toBe('0912345678');
    expect(chuanHoaSo('+84 912 345 678')).toBe('+84912345678');
    expect(chuanHoaSo('12ab')).toBeNull();
  });

  it('YC1.2 tên bỏ khoảng trắng đầu cuối, không trống, tối đa 100 ký tự', () => {
    expect(kiemTen('')).toBe(CAU_LOI_TEN);
    expect(kiemTen('   ')).toBe(CAU_LOI_TEN);
    expect(kiemTen('a'.repeat(101))).toBe(CAU_LOI_TEN);
    expect(kiemTen('  ' + 'a'.repeat(100) + '  ')).toBeNull();
    expect(kiemTen('Nguyễn Thị Hoa')).toBeNull();
  });

  it('YC1.2 email có dạng email', () => {
    expect(kiemEmail('chu1@vidu.test')).toBeNull();
    expect(kiemEmail(' chu1@vidu.test ')).toBeNull();
    expect(kiemEmail('chu1')).not.toBeNull();
    expect(kiemEmail('chu1@')).not.toBeNull();
    expect(kiemEmail('a b@vidu.test')).not.toBeNull();
    expect(kiemEmail('')).not.toBeNull();
  });

  it('YC1.2 mã đủ 6 chữ số thì nút xác nhận mới bấm được', () => {
    expect(kiemMa('123456')).toBe(true);
    expect(kiemMa('12345')).toBe(false);
    expect(kiemMa('12345a')).toBe(false);
    expect(kiemMa('1234567')).toBe(false);
  });

  it('YC1.2-NT13 kiểm cả form: báo lỗi dưới từng ô sai', () => {
    expect(kiemFormDangKy({ ten: '', so: '12ab', email: 'chu1@vidu.test' })).toEqual({ ten: CAU_LOI_TEN, so: CAU_LOI_SO });
    expect(kiemFormDangKy({ ten: 'Hoa', so: '0912345678', email: 'chu1@vidu.test' })).toEqual({});
  });
});
