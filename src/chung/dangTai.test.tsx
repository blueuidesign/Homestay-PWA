// Test unit HV1 · Đang tải.
import { act, fireEvent, render, screen, cleanup } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { ManTai, NutGhi } from './dangTai';

afterEach(cleanup);

describe('HV1 · Đang tải', () => {
  it('HV1-NT1: bấm hai lần trong lúc đang lưu thì chỉ ghi một lần', async () => {
    let xong!: () => void;
    const ghi = vi.fn(() => new Promise<void>((r) => { xong = r; }));
    render(<NutGhi chu="Đặt phòng" onGhi={ghi} />);
    const nut = screen.getByRole('button');
    fireEvent.click(nut);
    fireEvent.click(nut);
    expect(ghi).toHaveBeenCalledTimes(1);
    expect(nut).toHaveTextContent('Đang lưu…');
    expect(nut).toBeDisabled();
    await act(async () => { xong(); });
    expect(nut).toHaveTextContent('Đặt phòng');
  });

  it('HV1-NT2: mở lại màn đã xem thì dữ liệu cũ hiện ngay, kèm "Đang cập nhật…"', () => {
    render(<ManTai duLieu="Lịch cũ" dangTai hien={(d) => <p>{d}</p>} />);
    expect(screen.getByText('Lịch cũ')).toBeInTheDocument();
    expect(screen.getByText('Đang cập nhật…')).toBeInTheDocument();
  });

  it('HV1: lần đầu chưa có dữ liệu thì hiện khung xám', () => {
    render(<ManTai<string> duLieu={undefined} dangTai hien={(d) => <p>{d}</p>} />);
    expect(screen.getByLabelText('Đang tải')).toBeInTheDocument();
  });
});
