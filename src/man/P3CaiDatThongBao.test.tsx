// Test unit màn P3 (chủ nhà) và P12 (sale) Cài đặt thông báo (YC12.4). Dịch vụ giả, không gọi mạng.
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { ToastProvider } from '../chung/Toast';
import { doiCongTac } from '../lib/caiDatThongBao';
import type { DichVuCaiDatThongBao } from '../lib/dichVuCaiDatThongBao';
import { CAU_DA_LUU_CAI_DAT_TB, P3CaiDatThongBao } from './P3CaiDatThongBao';

afterEach(cleanup);

const dv = (tat: string[] = [], g: Partial<DichVuCaiDatThongBao> = {}): DichVuCaiDatThongBao => ({ doc: vi.fn(async () => tat), luu: vi.fn(async () => undefined), ...g });
async function ve(vai: 'chu_nha' | 'sale', d: DichVuCaiDatThongBao, quayLai = vi.fn(), daLuu = vi.fn()) {
  render(<ToastProvider><P3CaiDatThongBao vai={vai} dv={d} onQuayLai={quayLai} onDaLuu={daLuu} /></ToastProvider>);
  await screen.findByText('Báo cho tôi khi');
  return { quayLai, daLuu };
}
const cts = () => screen.getAllByRole('switch');

describe('YC12.4 · P3, P12 Cài đặt thông báo', () => {
  it('YC12.4-NT1 chủ nhà mở P3 thì thấy ba công tắc, mặc định bật, không có chữ "gửi qua Zalo"', async () => {
    await ve('chu_nha', dv());
    expect(cts().map((c) => c.getAttribute('aria-checked'))).toEqual(['true', 'true', 'true']);
    expect(cts().map((c) => c.querySelector('.p3-ten')?.textContent)).toEqual(['Sale đặt phòng mới', 'Sale xin xem lịch', 'Đặt phòng chưa cọc']);
    expect(screen.getByText('Thông báo hiện ngay trong app, ở mục Thông báo trên trang Cá nhân.')).toBeInTheDocument();
    expect(screen.getByText('Tên sale, căn và ngày ở')).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/gửi qua zalo/i);
    expect(document.querySelector('[data-man="P3"]')).not.toBeNull();
  });

  it('YC12.4-NT1 sale mở P12 thì thấy bốn công tắc, mặc định bật', async () => {
    await ve('sale', dv());
    expect(cts()).toHaveLength(4);
    expect(cts().every((c) => c.getAttribute('aria-checked') === 'true')).toBe(true);
    expect(screen.getByText('Căn bạn đã gửi khách vừa có người đặt')).toBeInTheDocument();
    expect(document.querySelector('[data-man="P12"]')).not.toBeNull();
  });

  it('YC12.4 loại đã tắt trong cài đặt thì công tắc tắt', async () => {
    await ve('sale', dv(['can_da_gui_co_nguoi_dat']));
    expect(screen.getByRole('switch', { name: /Căn bạn đã gửi khách/ })).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('switch', { name: /Chủ nhà đồng ý cho xem lịch/ })).toHaveAttribute('aria-checked', 'true');
  });

  it('YC12.4-NT2 Hùng tắt "Căn bạn đã gửi khách vừa có người đặt" rồi lưu thì gửi đúng loại đã tắt, toast, về Cá nhân', async () => {
    const d = dv();
    const { daLuu } = await ve('sale', d);
    fireEvent.click(screen.getByRole('switch', { name: /Căn bạn đã gửi khách/ }));
    expect(screen.getByRole('switch', { name: /Căn bạn đã gửi khách/ })).toHaveAttribute('aria-checked', 'false');
    expect(d.luu).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
    await waitFor(() => expect(d.luu).toHaveBeenCalledWith(['can_da_gui_co_nguoi_dat']));
    expect(await screen.findByText(CAU_DA_LUU_CAI_DAT_TB)).toBeInTheDocument();
    expect(daLuu).toHaveBeenCalled();
  });

  it('YC12.4 bật lại công tắc đã tắt thì gửi danh sách rỗng; chạm hai lần thì không đổi', async () => {
    const d = dv(['yeu_cau_moi']);
    await ve('chu_nha', d);
    fireEvent.click(screen.getByRole('switch', { name: /Sale đặt phòng mới/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
    await waitFor(() => expect(d.luu).toHaveBeenCalledWith([]));
    expect(doiCongTac(doiCongTac([], 'a'), 'a')).toEqual([]);
    expect(doiCongTac(['b'], 'a')).toEqual(['a', 'b']);
  });

  it('YC12.4-NT3 database từ chối thì báo câu của database, giữ công tắc, không về Cá nhân', async () => {
    const d = dv([], { luu: vi.fn(async () => { throw new LoiNguoiDung('Loại thông báo này không dành cho bạn'); }) });
    const { daLuu } = await ve('chu_nha', d);
    fireEvent.click(screen.getByRole('switch', { name: /Đặt phòng chưa cọc/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
    expect(await screen.findByText('Loại thông báo này không dành cho bạn')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: /Đặt phòng chưa cọc/ })).toHaveAttribute('aria-checked', 'false');
    expect(daLuu).not.toHaveBeenCalled();
  });

  it('YC12.4 HV2 không đọc được thì Thử lại', async () => {
    const doc = vi.fn().mockRejectedValueOnce(new Error('mạng')).mockResolvedValue([]);
    render(<ToastProvider><P3CaiDatThongBao vai="chu_nha" dv={{ ...dv(), doc }} onQuayLai={vi.fn()} onDaLuu={vi.fn()} /></ToastProvider>);
    fireEvent.click(await screen.findByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByText('Báo cho tôi khi')).toBeInTheDocument();
  });
});
