// Test unit HV2 · Mất mạng và QT5.5 · Lỗi.
import { act, render, screen, cleanup } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { CAU_CHUA_LUU, CAU_LOI_CHUNG, DaiMatKetNoi, LoiNguoiDung, ManChuaTai, cauBaoLoi } from './matKetNoi';
import { NutGhi } from './dangTai';

afterEach(cleanup);

describe('HV2 · Mất mạng', () => {
  it('HV2-NT3: mất mạng lúc đang xem thì hiện dải "Mất kết nối", dữ liệu vẫn còn', () => {
    render(<><DaiMatKetNoi /><p>Lịch 1509</p></>);
    expect(screen.queryByRole('alert')).toBeNull();
    act(() => { window.dispatchEvent(new Event('offline')); });
    expect(screen.getByRole('alert')).toHaveTextContent('Mất kết nối. Lịch có thể chưa mới nhất.');
    expect(screen.getByText('Lịch 1509')).toBeInTheDocument();
    act(() => { window.dispatchEvent(new Event('online')); });
    expect(screen.queryByRole('alert')).toBeNull(); // HV2 bước 4
  });

  it('HV2-NT1: mất mạng thì báo "Chưa lưu được, bấm lại khi có mạng"', () => {
    expect(cauBaoLoi(new Error('fetch failed'), false)).toBe(CAU_CHUA_LUU);
    expect(CAU_CHUA_LUU).toBe('Chưa lưu được, bấm lại khi có mạng');
  });

  it('HV2-NT2: có mạng lại thì không tự gửi lại việc đã báo chưa lưu', () => {
    const ghi = vi.fn();
    render(<><DaiMatKetNoi /><NutGhi chu="Đặt phòng" onGhi={ghi} /></>);
    act(() => { window.dispatchEvent(new Event('offline')); });
    act(() => { window.dispatchEvent(new Event('online')); });
    expect(ghi).not.toHaveBeenCalled();
  });

  it('HV2: lỗi lạ hiện câu chung; lỗi database có câu cho người dùng thì hiện nguyên câu (QT5.5)', () => {
    expect(cauBaoLoi(new Error('PGRST301 xyz'), true)).toBe(CAU_LOI_CHUNG);
    expect(cauBaoLoi(new LoiNguoiDung('Căn này đã được đặt rồi'), true)).toBe('Căn này đã được đặt rồi');
  });

  it('HV2: màn chưa từng xem có nút Thử lại', () => {
    const thu = vi.fn();
    render(<ManChuaTai onThuLai={thu} />);
    screen.getByRole('button', { name: 'Thử lại' }).click();
    expect(thu).toHaveBeenCalled();
  });
});
