// Test unit nối dây US20 · giá trên thẻ căn ở tab Căn của chủ nhà (YC4.1 bước 1 đến 3), qua App với dịch vụ giả.
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../App';
import type { CanTomTat } from '../lib/can';
import type { DichVuCan } from '../lib/dichVuCan';
import { dichVuGia } from './gia';

afterEach(cleanup);
beforeEach(() => { sessionStorage.clear(); window.history.replaceState(null, '', '/can'); });

const chuNha = () => dichVuGia({
  layPhien: vi.fn(async () => ({ email: 'chu1@vidu.test' })),
  layHoSo: vi.fn(async () => ({ ten: 'Chị Hoa', soDienThoai: '0900000001', vaiChon: 'chu_nha' as const })),
});
const can = (id: string, ma: string): CanTomTat => ({
  id, maCan: ma, soPhongNgu: 2, soGiuong: null, loaiView: null, tenToa: null, soAnh: 6, anhDaiDien: null, moiThem: false, khachDen: null,
});
const gia = (layGiaTuan: unknown) => ({ layGiaTuan } as unknown as NonNullable<DichVuCan['gia']>);

describe('YC4.1 · tab Căn nối giá tuần', () => {
  it('YC4.1-NT2 YC4.1-NT1 tab Căn đọc giá tuần này: căn có giá ghi khoảng giá, căn chưa có giá ghi "Chưa đặt giá"', async () => {
    const layGiaTuan = vi.fn(async () => ({ c1: { thap: 900000, cao: 1300000 }, c2: { thap: null, cao: null } }));
    const dv: DichVuCan = { layCanCuaToi: vi.fn(async () => [can('c1', '1509'), can('c2', 'Greenbay')]), gia: gia(layGiaTuan) };
    render(<App dichVu={chuNha()} dichVuCan={dv} />);
    expect(await screen.findByText('Giá tuần này 900.000đ – 1.300.000đ')).toBeInTheDocument();
    expect(screen.getByText('Chưa đặt giá')).toBeInTheDocument();
    // Tuần này: thứ Hai của tuần chứa hôm nay theo giờ Việt Nam.
    expect(layGiaTuan).toHaveBeenCalledWith(expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
  });

  it('YC4.1 bước 2 bấm "Đặt giá cho căn này" thì mở tab Giá của căn đó', async () => {
    const dv: DichVuCan = {
      layCanCuaToi: vi.fn(async () => [can('c2', 'Greenbay')]),
      gia: gia(vi.fn(async () => ({ c2: { thap: null, cao: null } }))),
    };
    render(<App dichVu={chuNha()} dichVuCan={dv} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Đặt giá cho căn này' }));
    expect(window.location.pathname).toBe('/can/c2/gia');
  });

  it('YC4.1 bước 3 bấm "Đặt giá nhiều căn" thì toast "Sẽ có ở bản sau"', async () => {
    const dv: DichVuCan = { layCanCuaToi: vi.fn(async () => [can('c1', '1509')]) };
    render(<App dichVu={chuNha()} dichVuCan={dv} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Đặt giá nhiều căn' }));
    expect(await screen.findByText('Sẽ có ở bản sau')).toBeInTheDocument();
  });

  it('YC4.1 đọc giá tuần lỗi thì thẻ vẫn hiện, chỗ giá để trống', async () => {
    const dv: DichVuCan = { layCanCuaToi: vi.fn(async () => [can('c1', '1509')]), gia: gia(vi.fn(async () => { throw new Error('mạng'); })) };
    render(<App dichVu={chuNha()} dichVuCan={dv} />);
    const the = await screen.findByRole('button', { name: /Phòng 1509/ });
    expect(within(the.closest('li') as HTMLElement).queryByText(/Giá tuần này|Chưa đặt giá/)).toBeNull();
  });
});
