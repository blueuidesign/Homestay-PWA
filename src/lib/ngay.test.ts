// Test unit cho hàm ngày theo giờ Việt Nam và đêm có khách (QT5.1, QT2.1).
import { describe, expect, it } from 'vitest';
import { cacDem, congNgay, homNay, laDemCuoiTuan, laNgay, soDem, thuTrongTuan } from './ngay';

describe('QT5.1 · ngày nghiệp vụ theo giờ Việt Nam', () => {
  it('QT5.1: 23:30 giờ UTC ngày 09/10 đã là ngày 10/10 ở Việt Nam', () => {
    expect(homNay(new Date('2026-10-09T23:30:00Z'))).toBe('2026-10-10');
  });
  it('QT5.1: 16:59 UTC vẫn là cùng ngày ở Việt Nam, 17:00 UTC sang ngày mới', () => {
    expect(homNay(new Date('2026-10-09T16:59:59Z'))).toBe('2026-10-09');
    expect(homNay(new Date('2026-10-09T17:00:00Z'))).toBe('2026-10-10');
  });
  it('QT5.1: qua năm mới theo giờ Việt Nam', () => {
    expect(homNay(new Date('2026-12-31T17:00:00Z'))).toBe('2027-01-01');
  });
});

describe('QT2.1 · booking chiếm những đêm nào', () => {
  it('QT2.1-VD1: nhận 10/10, trả 12/10 là 2 đêm 10/10 và 11/10', () => {
    expect(cacDem('2026-10-10', '2026-10-12')).toEqual(['2026-10-10', '2026-10-11']);
    expect(soDem('2026-10-10', '2026-10-12')).toBe(2);
  });
  it('QT2.1-VD2: nhận 14/10, trả 15/10 là 1 đêm 14/10', () => {
    expect(cacDem('2026-10-14', '2026-10-15')).toEqual(['2026-10-14']);
    expect(soDem('2026-10-14', '2026-10-15')).toBe(1);
  });
  it('QT5.1: ngày trả không phải đêm có khách, kể cả khi qua tháng', () => {
    expect(cacDem('2026-10-31', '2026-11-02')).toEqual(['2026-10-31', '2026-11-01']);
  });
  it('QT5.1: ngày trả không sau ngày nhận thì báo lỗi, không trả về danh sách rỗng', () => {
    expect(() => cacDem('2026-10-12', '2026-10-12')).toThrow(RangeError);
    expect(() => soDem('2026-10-12', '2026-10-10')).toThrow(RangeError);
  });
});

describe('QT5.1 · ngày hợp lệ và cộng ngày', () => {
  it('nhận đúng dạng YYYY-MM-DD có thật trên lịch', () => {
    expect(laNgay('2028-02-29')).toBe(true);
    expect(laNgay('2026-02-29')).toBe(false);
    expect(laNgay('2026-13-01')).toBe(false);
    expect(laNgay('10/10/2026')).toBe(false);
  });
  it('cộng và trừ ngày qua tháng, qua năm', () => {
    expect(congNgay('2026-12-31', 1)).toBe('2027-01-01');
    expect(congNgay('2026-03-01', -1)).toBe('2026-02-28');
  });
  it('ngày sai dạng thì báo lỗi', () => {
    expect(() => congNgay('2026-02-30', 1)).toThrow(RangeError);
  });
});

describe('QT5.1 · đêm cuối tuần', () => {
  it('16/10/2026 là thứ Sáu, 18/10/2026 là Chủ nhật', () => {
    expect(thuTrongTuan('2026-10-16')).toBe(5);
    expect(thuTrongTuan('2026-10-18')).toBe(0);
  });
  it('QT5.1: mặc định đêm thứ Sáu và thứ Bảy là đêm cuối tuần', () => {
    expect(laDemCuoiTuan('2026-10-16')).toBe(true);
    expect(laDemCuoiTuan('2026-10-17')).toBe(true);
    expect(laDemCuoiTuan('2026-10-18')).toBe(false);
    expect(laDemCuoiTuan('2026-10-15')).toBe(false);
  });
  it('QT5.1: chủ nhà đổi đêm cuối tuần thì dùng danh sách của chủ nhà', () => {
    expect(laDemCuoiTuan('2026-10-18', [0])).toBe(true);
    expect(laDemCuoiTuan('2026-10-16', [0])).toBe(false);
  });
  it('QT5.1: danh sách đêm cuối tuần rỗng là sai, phải có ít nhất một đêm', () => {
    expect(() => laDemCuoiTuan('2026-10-16', [])).toThrow(RangeError);
  });
});
