// US42 · YC6.8: toast A9 gắn vào tab Lịch của sale trong App; chủ nhà không có toast này.
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import type { DichVuCan } from './lib/dichVuCan';
import type { HoSo } from './lib/dieuHuong';
import type { DichVuXacThuc } from './lib/xacThuc';

function dichVu(hoSo: HoSo): DichVuXacThuc {
  return {
    layPhien: vi.fn(async () => ({ email: 'lan@vidu.test' })),
    guiMa: vi.fn(async () => 'da-gui' as const),
    xacNhanMa: vi.fn(async () => 'dung' as const),
    layHoSo: vi.fn(async () => hoSo),
    dangKy: vi.fn(async () => undefined),
    chonVai: vi.fn(async () => undefined),
    dangXuat: vi.fn(async () => undefined),
    theoDoiPhien: () => () => {},
  };
}

function dvCan(): DichVuCan & { thongBao: { layKetNoiChuaDoc: ReturnType<typeof vi.fn> } } {
  return {
    layCanCuaToi: vi.fn(async () => []),
    thongBao: {
      layKetNoiChuaDoc: vi.fn(async () => [
        { id: 'a', soChu: 1, soCan: 2, cacChu: [{ ten: 'Chị Hoa', soCan: 2, cacCan: [{ toa: 'ICON40', ma: '1509' }, { toa: null, ma: '3402' }] }] },
      ]),
    },
  };
}

describe('YC6.8 · toast trong App', () => {
  beforeEach(() => { try { localStorage.clear(); } catch { /* */ } });
  afterEach(() => { cleanup(); window.history.pushState(null, '', '/'); });

  it('YC6.8-NT1 Sale Lan đang ở tab Lịch thấy toast Chị Hoa đồng ý, bấm "Xem" thì toast tắt, vẫn ở lịch', async () => {
    const dc = dvCan();
    render(<App dichVu={dichVu({ ten: 'Sale Lan', soDienThoai: '0900000004', vaiChon: 'sale' })} dichVuCan={dc} />);
    expect(await screen.findByText('Chị Hoa đã đồng ý cho bạn xem lịch')).toBeInTheDocument();
    expect(screen.getByText('ICON40 1509 và 3402 đã vào Nguồn phòng')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Xem' }));
    await waitFor(() => expect(screen.queryByText('Chị Hoa đã đồng ý cho bạn xem lịch')).toBeNull());
    expect(window.location.pathname).toBe('/');
    expect(screen.getByRole('heading', { name: 'Lịch' })).toBeInTheDocument();
  });

  it('YC6.8 chủ nhà không lấy thông báo kết nối của sale', async () => {
    const dc = dvCan();
    render(<App dichVu={dichVu({ ten: 'Chị Hoa', soDienThoai: '0900000001', vaiChon: 'chu_nha' })} dichVuCan={dc} />);
    await screen.findByRole('heading', { name: /Lịch/ });
    expect(dc.thongBao.layKetNoiChuaDoc).not.toHaveBeenCalled();
  });
});
