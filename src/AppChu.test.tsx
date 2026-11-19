// Test unit App với dịch vụ giả: tab của chủ nhà (YC3.1).
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import type { CanTomTat } from './lib/can';
import type { DichVuCan } from './lib/dichVuCan';
import { dichVuGia } from './man/gia';

afterEach(cleanup);
beforeEach(() => { sessionStorage.clear(); window.history.replaceState(null, '', '/'); });

const chuNha = () => dichVuGia({
  layPhien: vi.fn(async () => ({ email: 'chu1@vidu.test' })),
  layHoSo: vi.fn(async () => ({ ten: 'Chị Hoa', soDienThoai: '0900000001', vaiChon: 'chu_nha' as const })),
});

const can = (id: string, ma: string): CanTomTat => ({
  id, maCan: ma, soPhongNgu: 2, soGiuong: null, loaiView: null, tenToa: null, soAnh: 0, anhDaiDien: null, moiThem: false, khachDen: null,
});

const dvCan = (ds: CanTomTat[]): DichVuCan => ({ layCanCuaToi: vi.fn(async () => ds) });

describe('YC3.1 · App tab của chủ nhà', () => {
  it('YC3.1-NT1 chủ nhà chưa có căn mở tab Lịch thì thấy A4; bấm "Thêm căn đầu tiên" thì mở form Thêm căn', async () => {
    render(<App dichVu={chuNha()} dichVuCan={dvCan([])} />);
    expect(await screen.findByText('Chưa có căn nào')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Lịch' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Thêm căn đầu tiên' }));
    expect(await screen.findByRole('heading', { name: 'Thêm căn' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/can/moi');
  });

  it('YC3.1 bước 7 chủ nhà chưa có căn mở tab Căn cũng thấy A4', async () => {
    window.history.replaceState(null, '', '/can');
    render(<App dichVu={chuNha()} dichVuCan={dvCan([])} />);
    expect(await screen.findByText('Chưa có căn nào')).toBeInTheDocument();
  });

  it('YC3.1-NT2 Chị Hoa có 2 căn: bấm tab Căn thì thấy "2 căn" và 2 thẻ; chạm thẻ thì mở căn đó', async () => {
    render(<App dichVu={chuNha()} dichVuCan={dvCan([can('c1509', '1509'), can('c3402', '3402')])} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Căn' }));
    expect(await screen.findByText('2 căn')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^Phòng / })).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: /Phòng 1509/ }));
    expect(await screen.findByRole('heading', { name: 'Phòng 1509' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/can/c1509');
  });

  it('YC3.1 HV2 không tải được danh sách căn thì hiện câu chung và nút Thử lại', async () => {
    const dv: DichVuCan = { layCanCuaToi: vi.fn().mockRejectedValueOnce(new Error('mạng')).mockResolvedValue([]) };
    render(<App dichVu={chuNha()} dichVuCan={dv} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByText('Chưa có căn nào')).toBeInTheDocument();
  });
});
