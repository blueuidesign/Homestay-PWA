// Test unit cho tiền số nguyên đồng và cách viết đầy đủ (QT5.2, glossary.md mục Viết số tiền).
import { describe, expect, it } from 'vitest';
import { docSoTienGo, laTienNguyen, vietKhoangGia, vietSo, vietTien, vietTienGon } from './tien';

describe('QT5.2 · tiền là số nguyên đồng', () => {
  it('QT5.2: số nguyên là tiền hợp lệ', () => {
    expect(laTienNguyen(0)).toBe(true);
    expect(laTienNguyen(1_300_000)).toBe(true);
  });
  it('QT5.2: có phần lẻ, NaN, vô cực, quá giới hạn số nguyên an toàn thì không hợp lệ', () => {
    expect(laTienNguyen(1_300_000.5)).toBe(false);
    expect(laTienNguyen(Number.NaN)).toBe(false);
    expect(laTienNguyen(Number.POSITIVE_INFINITY)).toBe(false);
    expect(laTienNguyen(Number.MAX_SAFE_INTEGER + 1)).toBe(false);
  });
});

describe('QT5.2 · viết số tiền đầy đủ', () => {
  it('glossary Viết số tiền: 1300000 viết "1.300.000đ"', () => {
    expect(vietTien(1_300_000)).toBe('1.300.000đ');
  });
  it('số nhỏ không có dấu chấm thừa', () => {
    expect(vietTien(0)).toBe('0đ');
    expect(vietTien(900)).toBe('900đ');
    expect(vietTien(50_000)).toBe('50.000đ');
  });
  it('QT5.2: không viết số có phần lẻ, báo lỗi thay vì làm tròn ngầm', () => {
    expect(() => vietTien(1_300_000.5)).toThrow(RangeError);
  });
});

describe('QT5-H1 · viết số tiền rút gọn', () => {
  it.each([
    [900_000, '900k'], [950_500, '951k'], [999_999, '1tr'], [1_000_000, '1tr'], [1_100_000, '1,1tr'],
    [1_150_000, '1,15tr'], [1_125_000, '1,13tr'], [1_300_000, '1,3tr'], [800_000, '800k'], [2_500_000, '2,5tr'],
    [100_000_000, '100tr'], [499, '0k'], [950_499, '950k'], [1_994_999, '1,99tr'], [1_995_000, '2tr'],
  ])('glossary Viết số tiền: %i viết "%s"', (dong, chu) => {
    expect(vietTienGon(dong)).toBe(chu);
  });
  it('QT5-H1: số âm, có phần lẻ thì báo lỗi', () => {
    expect(() => vietTienGon(-1)).toThrow(RangeError);
    expect(() => vietTienGon(1.5)).toThrow(RangeError);
  });
  it('YC4.2-NT1 khoảng giá 800.000đ và 1.100.000đ viết "800k–1,1tr"', () => {
    expect(vietKhoangGia(800_000, 1_100_000)).toBe('800k–1,1tr');
    expect(vietKhoangGia(1_100_000, 800_000)).toBe('800k–1,1tr');
  });
  it('QT5-H1: hai giá bằng nhau thì ghi một số', () => {
    expect(vietKhoangGia(700_000, 700_000)).toBe('700k');
  });
});

describe('YC5.2 bước 7 · ô tiền nhận số nguyên đồng, có dấu chấm ngăn nghìn', () => {
  it('YC5.2 bước 7 viết "2.200.000" khi gõ, không có "đ"', () => {
    expect(vietSo(2200000)).toBe('2.200.000');
    expect(vietSo(0)).toBe('0');
  });
  it('YC5.2 bước 7 đọc chữ gõ: bỏ dấu chấm; trống là null; số âm, số lẻ thì không nhận', () => {
    expect(docSoTienGo('2.200.000')).toBe(2200000);
    expect(docSoTienGo('2200000')).toBe(2200000);
    expect(docSoTienGo('')).toBeNull();
    expect(docSoTienGo('-500')).toBeUndefined();
    expect(docSoTienGo('2,5')).toBeUndefined();
    expect(docSoTienGo('9'.repeat(20))).toBeUndefined();
  });
});
