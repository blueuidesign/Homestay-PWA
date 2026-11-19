// US42 · YC6.8: toast A9, A9-02 cho sale khi chủ nhà đồng ý kết nối.
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DichVuThongBao } from '../lib/dichVuThongBao';
import type { ThongBaoKetNoi } from '../lib/toastKetNoi';
import { A9ToastKetNoi, THOI_GIAN_TOAST_KET_NOI_MS } from './A9ToastKetNoi';

const HOA = { ten: 'Chị Hoa', soCan: 2, cacCan: [{ toa: 'ICON40', ma: '1509' }, { toa: null, ma: '3402' }] };
const TUAN = { ten: 'Anh Tuấn', soCan: 1, cacCan: [{ toa: 'Sapphire', ma: '1103' }] };
const BINH = { ten: 'Chú Bình', soCan: 4, cacCan: [{ toa: 'Sapphire', ma: '1201' }] };

function dv(dau: ThongBaoKetNoi[] = []): DichVuThongBao & { dat: (d: ThongBaoKetNoi[]) => void } {
  let ds = dau;
  return { layKetNoiChuaDoc: vi.fn(async () => ds), dat: (d) => { ds = d; } };
}

/** Chờ các promise của lần lấy thông báo chạy xong (giờ giả). */
const xong = () => act(async () => { await Promise.resolve(); await Promise.resolve(); });

describe('YC6.8 · A9 toast báo kết nối', () => {
  beforeEach(() => { vi.useFakeTimers(); try { localStorage.clear(); } catch { /* */ } });
  afterEach(() => { cleanup(); vi.useRealTimers(); });

  it('YC6.8-NT1 Chị Hoa đồng ý lúc Lan đang mở app: trong 60 giây Lan thấy toast có tên Chị Hoa và các căn mới', async () => {
    const d = dv();
    render(<A9ToastKetNoi dv={d} onXem={() => {}} />);
    await xong();
    expect(screen.queryByRole('status')).toBeNull();
    d.dat([{ id: 'a', soChu: 1, soCan: 2, cacChu: [HOA] }]);
    await act(async () => { vi.advanceTimersByTime(60_000); });
    await xong();
    const t = screen.getByRole('status');
    expect(t).toHaveTextContent('Chị Hoa đã đồng ý cho bạn xem lịch');
    expect(t).toHaveTextContent('ICON40 1509 và 3402 đã vào Nguồn phòng');
    expect(screen.getByRole('button', { name: 'Xem' })).toBeInTheDocument();
  });

  it('YC6.8-NT2 ba chủ nhà đồng ý trong 10 phút: Lan thấy một toast gom', async () => {
    render(<A9ToastKetNoi dv={dv([{ id: 'g', soChu: 3, soCan: 7, cacChu: [HOA, TUAN, BINH] }])} onXem={() => {}} />);
    await xong();
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent('3 chủ nhà đã đồng ý cho bạn xem lịch');
    expect(screen.getByRole('status')).toHaveTextContent('Chị Hoa, Anh Tuấn và Chú Bình · 7 căn mới trong Nguồn phòng');
  });

  it('YC6.8-NT4 Lan đã thấy toast rồi mở lại app thì toast đó không hiện lại', async () => {
    const tb = { id: 'a', soChu: 1, soCan: 2, cacChu: [HOA] };
    const { unmount } = render(<A9ToastKetNoi dv={dv([tb])} onXem={() => {}} />);
    await xong();
    expect(screen.getByRole('status')).toBeInTheDocument();
    unmount();
    render(<A9ToastKetNoi dv={dv([tb])} onXem={() => {}} />);
    await xong();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('YC6.8 r11 dòng được gom thêm sau khi đã hiện thì hiện lại với nội dung mới', async () => {
    const d = dv([{ id: 'a', soChu: 1, soCan: 2, cacChu: [HOA] }]);
    render(<A9ToastKetNoi dv={d} onXem={() => {}} />);
    await xong();
    await act(async () => { vi.advanceTimersByTime(THOI_GIAN_TOAST_KET_NOI_MS); });
    expect(screen.queryByRole('status')).toBeNull();
    d.dat([{ id: 'a', soChu: 2, soCan: 3, cacChu: [HOA, TUAN] }]);
    await act(async () => { vi.advanceTimersByTime(60_000); });
    await xong();
    expect(screen.getByRole('status')).toHaveTextContent('2 chủ nhà đã đồng ý cho bạn xem lịch');
  });

  it('YC6.8 r11 tự tắt sau 6 giây', async () => {
    render(<A9ToastKetNoi dv={dv([{ id: 'a', soChu: 1, soCan: 2, cacChu: [HOA] }])} onXem={() => {}} />);
    await xong();
    await act(async () => { vi.advanceTimersByTime(5_999); });
    expect(screen.getByRole('status')).toBeInTheDocument();
    await act(async () => { vi.advanceTimersByTime(1); });
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('YC6.8 bước 3 bấm "Xem" thì tắt toast và về lịch', async () => {
    const onXem = vi.fn();
    render(<A9ToastKetNoi dv={dv([{ id: 'a', soChu: 1, soCan: 2, cacChu: [HOA] }])} onXem={onXem} />);
    await xong();
    fireEvent.click(screen.getByRole('button', { name: 'Xem' }));
    expect(onXem).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('YC6.8, pwa.md P7 quay lại từ nền thì lấy lại thông báo', async () => {
    const d = dv();
    render(<A9ToastKetNoi dv={d} onXem={() => {}} />);
    await xong();
    d.dat([{ id: 'a', soChu: 1, soCan: 2, cacChu: [HOA] }]);
    await act(async () => { document.dispatchEvent(new Event('visibilitychange')); });
    await xong();
    expect(screen.getByRole('status')).toHaveTextContent('Chị Hoa');
  });

  it('YC6.8 HV2 mất mạng khi lấy thông báo thì không hiện gì, lần sau lấy lại', async () => {
    const d: DichVuThongBao = { layKetNoiChuaDoc: vi.fn().mockRejectedValueOnce(new TypeError('mất mạng')).mockResolvedValue([]) };
    render(<A9ToastKetNoi dv={d} onXem={() => {}} />);
    await xong();
    expect(screen.queryByRole('status')).toBeNull();
    await act(async () => { vi.advanceTimersByTime(60_000); });
    expect(d.layKetNoiChuaDoc).toHaveBeenCalledTimes(2);
  });
});
