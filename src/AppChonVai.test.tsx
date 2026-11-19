// Test unit App với dịch vụ giả: chọn vai và mở lại app (YC1.1).
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import type { Vai } from './lib/dieuHuong';
import { dichVuGia } from './man/gia';

afterEach(cleanup);
beforeEach(() => { sessionStorage.clear(); window.history.replaceState(null, '', '/'); });

const phien = vi.fn(async () => ({ email: 'chu1@vidu.test' }));

describe('YC1.1 · App chọn vai', () => {
  it('YC1.1-NT6 Chị Hoa đã chọn vai mở lại app thì vào thẳng tab Lịch, không thấy A1, A3', async () => {
    const dv = dichVuGia({
      layPhien: phien,
      layHoSo: vi.fn(async () => ({ ten: 'Chị Hoa', soDienThoai: '0900000001', vaiChon: 'chu_nha' as const })),
    });
    render(<App dichVu={dv} />);
    expect(await screen.findByRole('heading', { name: 'Lịch' })).toBeInTheDocument();
    expect(screen.getByText('Chủ nhà')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Tạo tài khoản' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Bạn dùng app để làm gì?' })).toBeNull();
    expect(dv.chonVai).not.toHaveBeenCalled();
  });

  it('YC1.1 bước 5 người mới chọn "Tôi là sale", bấm "Tiếp tục" thì ghi vai và mở tab Lịch của sale', async () => {
    let vai: Vai | null = null;
    const dv = dichVuGia({
      layPhien: phien,
      layHoSo: vi.fn(async () => ({ ten: 'Sale Mới', soDienThoai: '0900000099', vaiChon: vai })),
      chonVai: vi.fn(async (v: Vai) => { vai = v; }),
    });
    render(<App dichVu={dv} />);
    fireEvent.click(await screen.findByRole('radio', { name: /Tôi là sale/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    expect(await screen.findByRole('heading', { name: 'Lịch' })).toBeInTheDocument();
    expect(screen.getByText('Sale')).toBeInTheDocument();
    await waitFor(() => expect(dv.chonVai).toHaveBeenCalledWith('sale'));
  });
});
