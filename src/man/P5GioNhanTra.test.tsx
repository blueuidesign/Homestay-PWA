// Test unit màn P5 Giờ nhận, trả phòng mặc định (YC1.5). Dịch vụ giả, không gọi mạng.
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '../App';
import { ToastProvider } from '../chung/Toast';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { chuGioMenu } from '../lib/caNhan';
import type { DichVuGio } from '../lib/dichVuGio';
import { tomTatGio } from '../lib/dichVuGio';
import { dichVuGia } from './gia';
import { CAU_DA_LUU_GIO, P5GioNhanTra } from './P5GioNhanTra';

afterEach(cleanup);

const dv = (g: Partial<DichVuGio> = {}): DichVuGio => ({ doc: vi.fn(async () => ({ gioNhan: '14:00', gioTra: '12:00' })), luu: vi.fn(async () => undefined), ...g });
async function ve(d: DichVuGio, quayLai = vi.fn(), daLuu = vi.fn()) {
  render(<ToastProvider><P5GioNhanTra dv={d} onQuayLai={quayLai} onDaLuu={daLuu} /></ToastProvider>);
  await screen.findByLabelText('Giờ nhận phòng');
  return { quayLai, daLuu };
}
const sel = (t: string) => screen.getByLabelText(t) as HTMLSelectElement;

describe('YC1.5 · P5 Giờ nhận, trả phòng mặc định', () => {
  it('YC1.5 bước 1 mở màn thì có câu giải thích, hai ô giờ điền sẵn 14:00 và 12:00 và tóm tắt', async () => {
    await ve(dv());
    expect(screen.getByText('Áp dụng cho tất cả căn. Sale gửi giờ này cho khách cùng thông tin căn.')).toBeInTheDocument();
    expect(sel('Giờ nhận phòng').value).toBe('14:00');
    expect(sel('Giờ trả phòng').value).toBe('12:00');
    expect(screen.getByTestId('tom-tat-gio')).toHaveTextContent('Khách nhận phòng từ 14:00, trả phòng trước 12:00 hôm sau.');
  });

  it('YC1.5 bước 2 chọn giờ thì tóm tắt đổi theo ngay, chưa lưu', async () => {
    const d = dv();
    const { daLuu } = await ve(d);
    fireEvent.change(sel('Giờ nhận phòng'), { target: { value: '15:00' } });
    fireEvent.change(sel('Giờ trả phòng'), { target: { value: '11:30' } });
    expect(screen.getByTestId('tom-tat-gio')).toHaveTextContent('Khách nhận phòng từ 15:00, trả phòng trước 11:30 hôm sau.');
    expect(d.luu).not.toHaveBeenCalled();
    expect(daLuu).not.toHaveBeenCalled();
  });

  it('YC1.5-NT1 chủ nhà lưu 14:00 và 12:00 thì gửi đúng giờ, toast, về Cá nhân; dòng menu ghi "14:00 · 12:00"', async () => {
    const d = dv();
    const { daLuu } = await ve(d);
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
    await waitFor(() => expect(d.luu).toHaveBeenCalledWith('14:00', '12:00'));
    expect(await screen.findByText(CAU_DA_LUU_GIO)).toBeInTheDocument();
    expect(daLuu).toHaveBeenCalled();
    expect(chuGioMenu('14:00', '12:00')).toBe('14:00 · 12:00');
    expect(tomTatGio('14:00', '12:00')).toContain('14:00');
  });

  it('YC1.5 HV2 lưu lỗi thì báo, giữ giờ đã chọn, không về Cá nhân', async () => {
    const d = dv({ luu: vi.fn(async () => { throw new LoiNguoiDung('Chọn giờ nhận và giờ trả phòng'); }) });
    const { daLuu } = await ve(d);
    fireEvent.change(sel('Giờ nhận phòng'), { target: { value: '16:00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
    expect(await screen.findByText('Chọn giờ nhận và giờ trả phòng')).toBeInTheDocument();
    expect(sel('Giờ nhận phòng').value).toBe('16:00');
    expect(daLuu).not.toHaveBeenCalled();
  });

  it('YC1.5 HV2 không đọc được thì Thử lại', async () => {
    const doc = vi.fn().mockRejectedValueOnce(new Error('mạng')).mockResolvedValue({ gioNhan: '14:00', gioTra: '12:00' });
    render(<ToastProvider><P5GioNhanTra dv={{ ...dv(), doc }} onQuayLai={vi.fn()} onDaLuu={vi.fn()} /></ToastProvider>);
    fireEvent.click(await screen.findByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByLabelText('Giờ nhận phòng')).toBeInTheDocument();
  });

  it('YC1.5 bước 1 nối vào app: Cá nhân chạm "Giờ nhận, trả phòng mặc định" mở P5; lưu xong về Cá nhân', async () => {
    sessionStorage.clear();
    window.history.replaceState(null, '', '/ca-nhan');
    const d = dv();
    const hoSo = dichVuGia({
      layPhien: vi.fn(async () => ({ email: 'chu1@vidu.test' })),
      layHoSo: vi.fn(async () => ({ ten: 'Chị Hoa', soDienThoai: '0900000001', vaiChon: 'chu_nha' as const })),
    });
    const caNhan = { doc: vi.fn(async () => ({ ten: 'Chị Hoa', tenHienThi: null, soDienThoai: '0900000001', email: 'chu1@vidu.test', soChuaDoc: 0, gioNhan: '14:00', gioTra: '12:00', demCuoiTuan: [5, 6], mucCong: 0, thongBaoTat: [] })) };
    render(<App dichVu={hoSo} dichVuCan={{ layCanCuaToi: vi.fn(async () => []), caNhan, gio: d }} />);
    fireEvent.click(await screen.findByRole('button', { name: /Giờ nhận, trả phòng mặc định/ }));
    expect(await screen.findByLabelText('Giờ nhận phòng')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/ca-nhan/gio');
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
    expect(await screen.findByRole('heading', { name: 'Cá nhân' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/ca-nhan');
  });
});
