// Test unit nối dây US40 · nút "Gửi lịch cho sale" ở tab Lịch mở CN10; gửi xong về tab Lịch với toast (CN10-02, YC6.6, HV8).
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../chung/Toast';
import type { CanTomTat } from '../lib/can';
import type { DichVuCan } from '../lib/dichVuCan';
import type { DichVuSale } from '../lib/dichVuSale';
import { ManChu } from './ManChu';

const goc = (navigator as { share?: unknown }).share;
afterEach(() => {
  cleanup();
  Object.defineProperty(navigator, 'share', { value: goc, configurable: true, writable: true });
});

const can = (id: string, ma: string): CanTomTat => ({
  id, maCan: ma, soPhongNgu: 2, soGiuong: null, loaiView: null, tenToa: null, soAnh: 0, anhDaiDien: null, moiThem: false, khachDen: null,
});

function dichVu() {
  const guiLich = vi.fn(async () => ({ ma: 'MaGuiLich01' }));
  const sale = { layDanhSach: vi.fn(async () => []) } as unknown as DichVuSale;
  const dv: DichVuCan = {
    layCanCuaToi: vi.fn(async () => [can('c3402', '3402'), can('c1509', '1509')]),
    lich: { layThang: vi.fn(async () => ({ datPhong: [], coDatPhong: true })) },
    linkMoi: { xemTruoc: vi.fn(), themLich: vi.fn(), guiLich },
    sale,
  };
  return { dv, guiLich };
}

describe('YC6.6 · tab Lịch nối CN10', () => {
  it('YC6.6-NT3 về app sau khi gửi thì thấy CN10-02: tab Lịch với toast "Đã gửi lịch" theo HV8', async () => {
    Object.defineProperty(navigator, 'share', { value: vi.fn(async () => {}), configurable: true, writable: true });
    const { dv, guiLich } = dichVu();
    render(<ToastProvider><ManChu duongDan="/" den={vi.fn()} dichVuCan={dv} onDangXuat={vi.fn()} /></ToastProvider>);
    fireEvent.click(await screen.findByRole('button', { name: /Gửi lịch cho sale/ }));
    expect(screen.getByRole('heading', { name: 'Gửi lịch cho sale' })).toBeInTheDocument();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Chia sẻ lịch' })); });
    expect(guiLich).toHaveBeenCalledWith(['c1509', 'c3402']);
    const toast = await screen.findByRole('status');
    expect(toast).toHaveTextContent('✓ Đã gửi lịch');
    expect(toast).toHaveAttribute('data-kieu', 'toast');
    expect(screen.getByRole('heading', { name: 'Lịch' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Gửi lịch cho sale' })).toBeNull();
  });

  it('YC6.6 bước 1 nút Quay lại ở CN10 về tab Lịch, không toast', async () => {
    const { dv } = dichVu();
    render(<ToastProvider><ManChu duongDan="/" den={vi.fn()} dichVuCan={dv} onDangXuat={vi.fn()} /></ToastProvider>);
    fireEvent.click(await screen.findByRole('button', { name: /Gửi lịch cho sale/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    expect(await screen.findByRole('heading', { name: 'Lịch' })).toBeInTheDocument();
    expect(screen.queryByText('Đã gửi lịch')).toBeNull();
  });
});

describe('YC9.2 · tab Lịch nối khối yêu cầu và CN9 (US51)', () => {
  const dong = { id: 'y1', canId: 'c1509', maCan: '1509', tenSale: 'Sale Hùng', ngayNhan: '2026-10-17', ngayTra: '2026-10-19',
    tongGiaChu: 2_200_000, guiLuc: new Date().toISOString(), trungVoi: [] };
  const yc = {
    id: 'y1', canId: 'c1509', maCan: '1509', tenToa: 'ICON40', saleId: 'hung', tenSale: 'Sale Hùng', sdtSale: null, soDatPhong: 0,
    conKetNoi: true, ngayNhan: '2026-10-17', ngayTra: '2026-10-19', tongGiaChu: 2_200_000, loiNhan: null, trangThai: 'cho' as const,
    lyDoTuChoi: null, guiLuc: dong.guiLuc, bookingId: null, trungVoi: [],
  };
  function dvYc(ds = [dong]) {
    const traLoi = {
      layDangCho: vi.fn(async () => ds), doc: vi.fn(async () => yc),
      chapNhan: vi.fn(async () => ({ y: { ...yc, trangThai: 'da_chot' as const, bookingId: 'b1' }, doiTrangThai: false })),
      tuChoi: vi.fn(),
    };
    const { dv } = dichVu();
    return { dv: { ...dv, traLoiYeuCau: traLoi } as DichVuCan, traLoi };
  }

  it('YC9.2-NT1 bấm "Xem và trả lời" ở CN1-03 mở CN9 của đúng yêu cầu đó', async () => {
    const { dv, traLoi } = dvYc();
    render(<ToastProvider><ManChu duongDan="/" den={vi.fn()} dichVuCan={dv} onDangXuat={vi.fn()} /></ToastProvider>);
    fireEvent.click(await screen.findByRole('button', { name: 'Xem và trả lời' }));
    expect(await screen.findByRole('heading', { name: 'Yêu cầu đặt phòng' })).toBeInTheDocument();
    expect(traLoi.doc).toHaveBeenCalledWith('y1');
  });

  it('YC9.2-NT1 mở từ thông báo (moYeuCau) thì vào thẳng CN9 của yêu cầu đó', async () => {
    const { dv, traLoi } = dvYc();
    render(<ToastProvider><ManChu duongDan="/" den={vi.fn()} dichVuCan={dv} onDangXuat={vi.fn()} moYeuCau="y1" /></ToastProvider>);
    expect(await screen.findByRole('heading', { name: 'Yêu cầu đặt phòng' })).toBeInTheDocument();
    expect(traLoi.doc).toHaveBeenCalledWith('y1');
  });

  it('YC9.2 bước 3 chấp nhận rồi "Về lịch": về tab Lịch, khối yêu cầu đọc lại; "Xem đặt phòng" mở CN3-02', async () => {
    const { dv, traLoi } = dvYc();
    render(<ToastProvider><ManChu duongDan="/" den={vi.fn()} dichVuCan={dv} onDangXuat={vi.fn()} /></ToastProvider>);
    fireEvent.click(await screen.findByRole('button', { name: 'Xem và trả lời' }));
    const nutChap = await screen.findByRole('button', { name: 'Chấp nhận đặt phòng' });
    await act(async () => { fireEvent.click(nutChap); });
    traLoi.layDangCho.mockResolvedValue([]);
    fireEvent.click(screen.getByRole('button', { name: 'Về lịch' }));
    expect(await screen.findByRole('heading', { name: 'Lịch' })).toBeInTheDocument();
    await act(async () => {});
    expect(screen.queryByRole('region', { name: /Yêu cầu đặt phòng/ })).toBeNull();
    expect(traLoi.layDangCho.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('YC9.2 bước 3 "Xem đặt phòng" ở CN9-02 mở chi tiết đặt phòng vừa tạo (YC5.5)', async () => {
    const { dv } = dvYc();
    const den = vi.fn();
    render(<ToastProvider><ManChu duongDan="/" den={den} dichVuCan={dv} onDangXuat={vi.fn()} /></ToastProvider>);
    fireEvent.click(await screen.findByRole('button', { name: 'Xem và trả lời' }));
    const nutChap = await screen.findByRole('button', { name: 'Chấp nhận đặt phòng' });
    await act(async () => { fireEvent.click(nutChap); });
    fireEvent.click(screen.getByRole('button', { name: 'Xem đặt phòng' }));
    expect(den).toHaveBeenCalledWith('/dat-phong/b1');
  });
});
