// US39 · YC6.5: chủ nhà mở link xin lịch /x/<mã> của sale (đăng nhập trước, chọn sẵn vai chủ nhà, đồng ý, từ chối).
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import type { DichVuCan } from './lib/dichVuCan';
import type { HoSo } from './lib/dieuHuong';
import type { DichVuXinLich, KetQuaDongY } from './lib/dichVuXinLich';
import type { DichVuXacThuc } from './lib/xacThuc';

function dichVuDaDangNhap(hoSo: HoSo, dangNhap = true): DichVuXacThuc {
  let hs = hoSo;
  return {
    layPhien: vi.fn(async () => (dangNhap ? { email: 'chu@vidu.test' } : null)),
    guiMa: vi.fn(async () => 'da-gui' as const),
    xacNhanMa: vi.fn(async () => 'dung' as const),
    layHoSo: vi.fn(async () => hs),
    dangKy: vi.fn(async () => undefined),
    chonVai: vi.fn(async (vai) => { hs = { ...hs, vaiChon: vai }; }),
    dangXuat: vi.fn(async () => undefined),
    theoDoiPhien: () => () => {},
  };
}

function dvCan(kq: KetQuaDongY = { ketQua: 'da_ket_noi', tenSale: 'Sale Lan', coCan: true }): DichVuCan & { xinLich: DichVuXinLich } {
  return {
    layCanCuaToi: vi.fn(async () => []),
    xinLich: {
      doc: vi.fn(), layLink: vi.fn(), ghiLanGui: vi.fn(),
      xemLoiXin: vi.fn(async () => ({ trangThai: 'hop_le' as const, tenSale: 'Sale Lan', soDienThoai: '0900000004', daKetNoi: false })),
      dongY: vi.fn(async () => kq),
    },
  };
}

const HOA: HoSo = { ten: 'Chị Hoa', soDienThoai: '0900000001', vaiChon: 'chu_nha' };

describe('YC6.5 · vào app từ link xin lịch', () => {
  afterEach(() => { cleanup(); window.history.pushState(null, '', '/'); });

  it('YC6.5-NT1 Chị Hoa mở link xin lịch của Sale Lan thì A8 có tên và số của Lan', async () => {
    window.history.pushState(null, '', '/x/xinLanAbc');
    const dc = dvCan();
    render(<App dichVu={dichVuDaDangNhap(HOA)} dichVuCan={dc} />);
    expect(await screen.findByText('Sale Lan')).toBeInTheDocument();
    expect(screen.getByText('0900 000 004')).toBeInTheDocument();
    expect(dc.xinLich.xemLoiXin).toHaveBeenCalledWith('xinLanAbc');
  });

  it('YC6.5-NT5 chưa đăng nhập mở link xin lịch thì đăng nhập trước (A1), không gọi xem trước', async () => {
    window.history.pushState(null, '', '/x/xinLanAbc');
    const dc = dvCan();
    render(<App dichVu={dichVuDaDangNhap({ ten: null, soDienThoai: null, vaiChon: null }, false)} dichVuCan={dc} />);
    expect(await screen.findByRole('button', { name: 'Tôi đã có tài khoản · Đăng nhập' })).toBeInTheDocument();
    expect(screen.queryByText('Sale Lan')).toBeNull();
    expect(dc.xinLich.xemLoiXin).not.toHaveBeenCalled();
  });

  it('YC6.5 r8 chưa chọn vai thì chọn sẵn vai chủ nhà rồi hiện A8, không hiện A3', async () => {
    window.history.pushState(null, '', '/x/xinLanAbc');
    const dv = dichVuDaDangNhap({ ...HOA, vaiChon: null });
    render(<App dichVu={dv} dichVuCan={dvCan()} />);
    expect(await screen.findByRole('button', { name: 'Đồng ý cho xem lịch' })).toBeInTheDocument();
    expect(dv.chonVai).toHaveBeenCalledWith('chu_nha');
  });

  it('YC6.5 bước 2 đồng ý thì về tab Sale với toast "Đã cho Sale Lan xem lịch"', async () => {
    window.history.pushState(null, '', '/x/xinLanAbc');
    const dc = dvCan();
    render(<App dichVu={dichVuDaDangNhap(HOA)} dichVuCan={dc} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Đồng ý cho xem lịch' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Đã cho Sale Lan xem lịch');
    await waitFor(() => expect(window.location.pathname).toBe('/sale'));
    expect(dc.xinLich.dongY).toHaveBeenCalledWith('xinLanAbc', true);
  });

  it('YC6.5 bước 2 chưa có căn thì về A4-01', async () => {
    window.history.pushState(null, '', '/x/xinLanAbc');
    render(<App dichVu={dichVuDaDangNhap(HOA)} dichVuCan={dvCan({ ketQua: 'da_ket_noi', tenSale: 'Sale Lan', coCan: false })} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Đồng ý cho xem lịch' }));
    expect(await screen.findByText('✓ Bạn đã cho Sale Lan xem lịch. Thêm căn để Sale Lan thấy phòng trống.')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/');
  });

  it('YC6.5 bước 3 "Từ chối" về tab Sale, không gọi đồng ý', async () => {
    window.history.pushState(null, '', '/x/xinLanAbc');
    const dc = dvCan();
    render(<App dichVu={dichVuDaDangNhap(HOA)} dichVuCan={dc} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Từ chối' }));
    await waitFor(() => expect(window.location.pathname).toBe('/sale'));
    expect(dc.xinLich.dongY).not.toHaveBeenCalled();
  });
});
