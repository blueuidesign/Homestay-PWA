// Test unit cho tiền số nguyên đồng và cách viết đầy đủ (QT5.2, glossary.md mục Viết số tiền).
import { describe, expect, it } from 'vitest';
import { laTienNguyen, vietTien } from './tien';

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
