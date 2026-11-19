// Test unit luật kiểm phía app của form Thêm sale CN7-05 (YC6.2 Luật kiểm, bước 4).
import { describe, expect, it } from 'vitest';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { CAU_CAN_TEN, CAU_SO_SAI, CAU_TEN_DAI, chuanSo, kiemFormSale, loiTuSale, oCuaCauSale } from './kiemSale';

describe('YC6.2 · luật kiểm form Thêm sale', () => {
  it('YC6.2-NT3 "Sale Phương" số 0901234567 thì không có lỗi', () => {
    expect(kiemFormSale({ ten: 'Sale Phương', so: '0901234567' })).toEqual({});
  });

  it('YC6.2-NT3 số "090 123" bị từ chối với câu ở bảng Luật kiểm', () => {
    expect(kiemFormSale({ ten: 'Sale Phương', so: '090 123' })).toEqual({ so: 'Số điện thoại chưa đúng (10 chữ số, bắt đầu bằng 0)' });
    expect(CAU_SO_SAI).toBe('Số điện thoại chưa đúng (10 chữ số, bắt đầu bằng 0)');
  });

  it('YC6.2 Luật kiểm tên trống, chỉ khoảng trắng: "Cần nhập tên sale"; quá 100 ký tự: "Tên dài tối đa 100 ký tự"', () => {
    expect(kiemFormSale({ ten: '   ', so: '0901234567' }).ten).toBe(CAU_CAN_TEN);
    expect(CAU_CAN_TEN).toBe('Cần nhập tên sale');
    expect(kiemFormSale({ ten: 'a'.repeat(101), so: '0901234567' }).ten).toBe(CAU_TEN_DAI);
    expect(CAU_TEN_DAI).toBe('Tên dài tối đa 100 ký tự');
    expect(kiemFormSale({ ten: '  ' + 'ă'.repeat(100) + '  ', so: '0901234567' })).toEqual({});
  });

  it('YC6.2 Luật kiểm số bỏ khoảng trắng, dấu chấm, gạch rồi mới kiểm: 10 chữ số, bắt đầu bằng 0', () => {
    expect(chuanSo(' 090.123-45 67 ')).toBe('0901234567');
    expect(kiemFormSale({ ten: 'Sale Phương', so: '090.123-4567' })).toEqual({});
    expect(kiemFormSale({ ten: 'Sale Phương', so: '1901234567' }).so).toBe(CAU_SO_SAI);
    expect(kiemFormSale({ ten: 'Sale Phương', so: '09012345678' }).so).toBe(CAU_SO_SAI);
    expect(kiemFormSale({ ten: 'Sale Phương', so: '' }).so).toBe(CAU_SO_SAI);
  });

  it('QT5.5 câu database trả về thuộc ô nào; P0001 thì giữ câu', () => {
    expect(oCuaCauSale(CAU_CAN_TEN)).toBe('ten');
    expect(oCuaCauSale(CAU_TEN_DAI)).toBe('ten');
    expect(oCuaCauSale(CAU_SO_SAI)).toBe('so');
    expect(oCuaCauSale('Có lỗi khác')).toBeNull();
    const l = loiTuSale({ code: 'P0001', message: CAU_SO_SAI });
    expect(l).toBeInstanceOf(LoiNguoiDung);
    expect(l.message).toBe(CAU_SO_SAI);
    expect((loiTuSale({ code: '42501', message: 'Không tìm thấy sale' }) as Error & { code?: string }).code).toBe('42501');
  });
});
