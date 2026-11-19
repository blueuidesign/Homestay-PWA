// Test unit HV3 · Quay lại từ nền.
import { act, render, cleanup } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { docNhap, luuNhap, useQuayLaiTuNen, xoaNhap } from './nhap';

function ManLich({ tai }: { tai: () => void }) { useQuayLaiTuNen(tai); return null; }

afterEach(cleanup);

describe('HV3 · Quay lại từ nền', () => {
  beforeEach(() => localStorage.clear());

  it('HV3-NT1: rời app 5 phút rồi quay lại thì nháp còn đủ căn, ngày, số tiền', () => {
    const form = { can: '1509', ngay: '2026-12-01', tien: 1300000 };
    luuNhap('cn4', form, 1000);
    expect(docNhap('cn4', 1000 + 5 * 60 * 1000)).toEqual(form);
  });

  it('HV3-NT3: quay lại từ nền thì app tải lại dữ liệu', () => {
    const tai = vi.fn();
    render(<ManLich tai={tai} />);
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    act(() => { document.dispatchEvent(new Event('visibilitychange')); });
    expect(tai).toHaveBeenCalledTimes(1);
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    act(() => { document.dispatchEvent(new Event('visibilitychange')); });
    expect(tai).toHaveBeenCalledTimes(1);
  });

  it('HV3-NT4: lưu thành công thì xóa nháp, mở lại không còn nháp cũ', () => {
    luuNhap('cn4', { a: 1 });
    xoaNhap('cn4');
    expect(docNhap('cn4')).toBeNull();
  });

  it('HV3-H1 (giả định): nháp quá hạn bị bỏ', () => {
    luuNhap('cn4', { a: 1 }, 0);
    expect(docNhap('cn4', 25 * 60 * 60 * 1000)).toBeNull();
  });

  it('HV3: kho trên máy hỏng thì không ném lỗi', () => {
    const gốc = Storage.prototype.setItem;
    Storage.prototype.setItem = () => { throw new Error('đầy'); };
    expect(() => luuNhap('x', 1)).not.toThrow();
    Storage.prototype.setItem = gốc;
  });
});
