// Test unit màn CN10, CN10-00, CN10-01 Gửi lịch cho sale (YC6.6). Viết trước màn (US40-TA3). Số theo DLM: Chị Hoa có 1509, 3402;
// sale đã lưu Sale Hùng, Sale Lan. Tên, số đều giả.
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../chung/Toast';
import type { DongSale } from '../lib/dichVuSale';
import { CN10GuiLich } from './CN10GuiLich';

const goc = { share: (navigator as { share?: unknown }).share, clipboard: navigator.clipboard };
afterEach(() => {
  cleanup();
  Object.defineProperty(navigator, 'share', { value: goc.share, configurable: true, writable: true });
  Object.defineProperty(navigator, 'clipboard', { value: goc.clipboard, configurable: true, writable: true });
});

function dong(them: Partial<DongSale>): DongSale {
  return {
    id: 'k-' + (them.ten ?? 'x'), loai: 'ket_noi', saleId: 's-x', ten: 'Sale', soDienThoai: '0900000003', nhom: 'da_ket_noi',
    daXoaTaiKhoan: false, xemCoc: true, soDatPhong: 0, tongTienPhong: 0, ketNoiLuc: null, ngungLuc: null, ...them,
  };
}
const SALE = [dong({ ten: 'Sale Lan', soDienThoai: '0900000004' }), dong({ ten: 'Sale Hùng', soDienThoai: '0900000003' }),
  dong({ ten: 'Sale Nga', nhom: 'da_ngung' })];
const CAN = [{ id: 'c1509', maCan: '1509', soPhongNgu: 2 }, { id: 'c3402', maCan: '3402', soPhongNgu: 2 }];

function ve(them: { sale?: DongSale[]; guiLich?: (ids: string[]) => Promise<{ ma: string }>; onDaGui?: () => void } = {}) {
  const guiLich = vi.fn(them.guiLich ?? (async () => ({ ma: 'MaGuiLich01' })));
  const onDaGui = vi.fn(them.onDaGui ?? (() => {}));
  render(
    <ToastProvider>
      <CN10GuiLich ds={CAN} layDanhSachSale={async () => them.sale ?? SALE} guiLich={guiLich} onQuayLai={vi.fn()} onDaGui={onDaGui} />
    </ToastProvider>,
  );
  return { guiLich, onDaGui };
}
const chiaSe = (fn: unknown) => Object.defineProperty(navigator, 'share', { value: fn, configurable: true, writable: true });
const nut = () => screen.getByRole('button', { name: 'Chia sẻ lịch' });
const oCan = (ma: string) => screen.getByRole('checkbox', { name: new RegExp(`Phòng ${ma}`) });

describe('YC6.6 · CN10 Gửi lịch cho sale', () => {
  it('YC6.6 bước 1, 2 CN10: câu giới thiệu, danh sách căn đã chọn sẵn, sale đã lưu có số che giữa', async () => {
    ve();
    expect(screen.getByRole('heading', { name: 'Gửi lịch cho sale' })).toBeInTheDocument();
    expect(screen.getByText(/không thấy tên khách và số tiền cọc/)).toBeInTheDocument();
    expect(screen.getByText('Bước 1: Chọn căn')).toBeInTheDocument();
    expect(screen.getByText('Căn · đã chọn 2/2')).toBeInTheDocument();
    expect(oCan('1509')).toHaveAttribute('aria-checked', 'true');
    expect(oCan('1509')).toHaveTextContent('Phòng 1509 · 2PN');
    expect(await screen.findByRole('checkbox', { name: 'Sale Hùng · 0900 *** 003' })).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('checkbox', { name: 'Sale Lan · 0900 *** 004' })).toBeInTheDocument();
    // Sale đã ngừng không có trong danh sách nhắc.
    expect(screen.queryByText(/Sale Nga/)).toBeNull();
    expect(screen.getByText('Bước 2: Chọn sale để chia sẻ lịch')).toBeInTheDocument();
    expect(nut()).toBeEnabled();
  });

  it('YC6.6-NT6 Chị Hoa chưa chọn căn nào ở CN10 thì nút "Chia sẻ lịch" không bấm được', async () => {
    const { guiLich } = ve();
    fireEvent.click(screen.getByRole('button', { name: 'Bỏ chọn' }));
    expect(screen.getByText('Căn · đã chọn 0/2')).toBeInTheDocument();
    expect(nut()).toBeDisabled();
    expect(screen.getByText('Chọn ít nhất một căn')).toBeInTheDocument();
    fireEvent.click(nut());
    expect(guiLich).not.toHaveBeenCalled();
    // Chọn lại một căn thì bấm được.
    fireEvent.click(oCan('1509'));
    expect(nut()).toBeEnabled();
    expect(screen.queryByText('Chọn ít nhất một căn')).toBeNull();
  });

  it('YC6.6 bước 4 bấm "Chia sẻ lịch" với 1509 thì tạo link gửi lịch chỉ có 1509, mở bảng chia sẻ kèm link', async () => {
    const share = vi.fn(async () => {});
    chiaSe(share);
    const { guiLich, onDaGui } = ve();
    fireEvent.click(oCan('3402'));
    await act(async () => { fireEvent.click(nut()); });
    expect(guiLich).toHaveBeenCalledWith(['c1509']);
    expect(share).toHaveBeenCalledWith({ text: expect.stringContaining(`${window.location.origin}/l/MaGuiLich01`) });
    await waitFor(() => expect(onDaGui).toHaveBeenCalled());
  });

  it('YC6.6 bước 5 CN10-01 đóng bảng chia sẻ mà không gửi thì ở lại CN10 với dải báo, không toast', async () => {
    chiaSe(vi.fn(async () => { throw new DOMException('đóng', 'AbortError'); }));
    const { onDaGui } = ve();
    await act(async () => { fireEvent.click(nut()); });
    expect(await screen.findByText(/Bạn chưa gửi\. Bảng chia sẻ đã đóng mà chưa gửi cho ai/)).toBeInTheDocument();
    expect(onDaGui).not.toHaveBeenCalled();
    expect(screen.queryByText('Đã gửi lịch')).toBeNull();
  });

  it('YC6.6 CN10-00 chưa có sale nào đã lưu thì báo, vẫn bấm "Chia sẻ lịch" được', async () => {
    ve({ sale: [] });
    expect(await screen.findByText(/Chưa có sale nào đã lưu/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Chọn tất cả' })).toBeNull();
    expect(nut()).toBeEnabled();
  });

  it('YC6.6 HV6 máy không có bảng chia sẻ thì sao chép link, báo đã sao chép', async () => {
    chiaSe(undefined);
    const writeText = vi.fn(async () => {});
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true, writable: true });
    const { onDaGui } = ve();
    await act(async () => { fireEvent.click(nut()); });
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('/l/MaGuiLich01'));
    expect(await screen.findByText('Đã sao chép, dán vào Zalo để gửi')).toBeInTheDocument();
    expect(onDaGui).not.toHaveBeenCalled();
  });

  it('YC6.6-NT4 database từ chối tạo link thì báo, không mở bảng chia sẻ', async () => {
    const share = vi.fn(async () => {});
    chiaSe(share);
    const { LoiNguoiDung } = await import('../chung/matKetNoi');
    ve({ guiLich: async () => { throw new LoiNguoiDung('Căn không phải của bạn hoặc đã xóa'); } });
    await act(async () => { fireEvent.click(nut()); });
    expect(await screen.findByText('Căn không phải của bạn hoặc đã xóa')).toBeInTheDocument();
    expect(share).not.toHaveBeenCalled();
  });
});
