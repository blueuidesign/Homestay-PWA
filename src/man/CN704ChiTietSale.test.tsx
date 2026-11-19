// Test unit màn CN7-04 Chi tiết một sale (YC6.2 bước 5, 6, YC6-H4, YC6-H16). Số theo DLM.4: B1, B3 của Sale Hùng. Số giả.
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../chung/Toast';
import type { DichVuSale, DongSale } from '../lib/dichVuSale';
import { CN704ChiTietSale } from './CN704ChiTietSale';

afterEach(cleanup);

const HUNG: DongSale = {
  id: 'k-hung', loai: 'ket_noi', saleId: 's-hung', ten: 'Sale Hùng', soDienThoai: '0912345678', nhom: 'da_ket_noi',
  daXoaTaiKhoan: false, xemCoc: true, soDatPhong: 2, tongTienPhong: 4000000, ketNoiLuc: '2026-08-02T03:00:00Z', ngungLuc: null,
};

function dichVu(them: Partial<DichVuSale> = {}): DichVuSale {
  return {
    layDanhSach: vi.fn(async () => []),
    layDatPhong: vi.fn(async () => [
      { id: 'B3', maCan: '1509', ngayNhan: '2026-10-04', ngayTra: '2026-10-06', tienPhong: 1800000, trangThai: 'hieu_luc' as const, trangThaiTien: 'da_thanh_toan' as const },
      { id: 'B1', maCan: '1509', ngayNhan: '2026-10-10', ngayTra: '2026-10-12', tienPhong: 2200000, trangThai: 'hieu_luc' as const, trangThaiTien: 'da_coc' as const },
      { id: 'HUY', maCan: '3402', ngayNhan: '2026-10-25', ngayTra: '2026-10-26', tienPhong: 1300000, trangThai: 'da_huy' as const, trangThaiTien: null },
    ]),
    themSaleTay: vi.fn(async () => 'x'),
    xoaSaleTay: vi.fn(async () => undefined),
    ngungChoXem: vi.fn(async () => undefined),
    datXemCoc: vi.fn(async (_id: string, bat: boolean) => bat),
    boDong: vi.fn(async () => undefined),
    ...them,
  };
}

function ve(d: DongSale, dv: DichVuSale, onDaDoi = vi.fn()) {
  render(<ToastProvider><CN704ChiTietSale dong={d} dv={dv} onQuayLai={vi.fn()} onDaDoi={onDaDoi} /></ToastProvider>);
  return onDaDoi;
}

describe('YC6.2 · CN7-04 Chi tiết một sale', () => {
  it('YC6.2 bước 5 tên, số, ngày kết nối, nút "Gọi", đặt phòng (trạng thái, tiền phòng), công tắc cọc, nút ngừng', async () => {
    const dv = dichVu();
    ve(HUNG, dv);
    expect(screen.getByRole('heading', { name: 'Sale Hùng' })).toBeInTheDocument();
    expect(screen.getByText('0912 345 678 · kết nối từ 02/08/2026')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Gọi' })).toHaveAttribute('href', 'tel:0912345678');
    const ds = within(await screen.findByRole('region', { name: 'Đặt phòng của sale này' }));
    expect(await ds.findByText('1509 · 10/10 → 12/10')).toBeInTheDocument();
    expect(dv.layDatPhong).toHaveBeenCalledWith('s-hung');
    const b1 = ds.getByText('1509 · 10/10 → 12/10').closest('li')!;
    expect(b1).toHaveTextContent('Đã cọc · còn thu');
    expect(b1).toHaveTextContent('2.200.000đ');
    expect(ds.getByText('1509 · 04/10 → 06/10').closest('li')!).toHaveTextContent('Đã thanh toán');
    expect(ds.getByText('3402 · 25/10 → 26/10').closest('li')!).toHaveTextContent('Đã hủy');
    expect(screen.getByRole('switch', { name: 'Tình trạng cọc' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('button', { name: 'Ngừng cho xem lịch' })).toBeInTheDocument();
    // YC6-H4: dòng đã kết nối không có nút xóa.
    expect(screen.queryByRole('button', { name: 'Xóa sale này' })).toBeNull();
  });

  it('YC6.2-NT5 tắt "Tình trạng cọc" gửi lệnh tắt, công tắc tắt; lỗi thì về như cũ', async () => {
    const dv = dichVu();
    ve(HUNG, dv);
    const cong = screen.getByRole('switch', { name: 'Tình trạng cọc' });
    fireEvent.click(cong);
    await waitFor(() => expect(dv.datXemCoc).toHaveBeenCalledWith('k-hung', false));
    await waitFor(() => expect(cong).toHaveAttribute('aria-checked', 'false'));
    cleanup();
    const dv2 = dichVu({ datXemCoc: vi.fn().mockRejectedValue(new TypeError('mất mạng')) });
    ve(HUNG, dv2);
    const cong2 = screen.getByRole('switch', { name: 'Tình trạng cọc' });
    fireEvent.click(cong2);
    await waitFor(() => expect(dv2.datXemCoc).toHaveBeenCalled());
    await waitFor(() => expect(cong2).toHaveAttribute('aria-checked', 'true'));
  });

  it('YC6.2 bước 6 bấm "Không" ở hộp hỏi lại thì không ngừng', async () => {
    const dv = dichVu();
    ve(HUNG, dv);
    fireEvent.click(screen.getByRole('button', { name: 'Ngừng cho xem lịch' }));
    fireEvent.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Không' }));
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(dv.ngungChoXem).not.toHaveBeenCalled();
  });

  it('YC6.2-NT9 dòng đã ngừng: số, ngày ngừng, đặt phòng cũ; không công tắc cọc, không nút ngừng, không xóa', async () => {
    ve({ ...HUNG, nhom: 'da_ngung', xemCoc: null, ngungLuc: '2026-11-19T02:00:00Z' }, dichVu());
    expect(screen.getByText('0912 345 678 · ngừng từ 19/11/2026')).toBeInTheDocument();
    expect(await screen.findByText('1509 · 10/10 → 12/10')).toBeInTheDocument();
    expect(screen.getByText('1509 · 04/10 → 06/10')).toBeInTheDocument();
    expect(screen.queryByRole('switch')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Ngừng cho xem lịch' })).toBeNull();
    expect(screen.queryByRole('button', { name: /Xóa/ })).toBeNull();
  });

  it('YC6.2-NT8 dòng thêm tay: tên, số chủ nhập, "Gọi", "Xóa sale này" hỏi lại một lần; không có đặt phòng, cọc, ngừng', async () => {
    const dv = dichVu();
    const onDaDoi = ve({ ...HUNG, id: 'tay-1', loai: 'them_tay', saleId: null, ten: 'Sale Phương', soDienThoai: '0901234567',
                         nhom: 'chua_ket_noi', xemCoc: null, ketNoiLuc: null }, dv);
    expect(screen.getByRole('heading', { name: 'Sale Phương' })).toBeInTheDocument();
    expect(screen.getByText('0901 234 567 · chưa mở link mời')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Gọi' })).toHaveAttribute('href', 'tel:0901234567');
    expect(screen.queryByRole('switch')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Ngừng cho xem lịch' })).toBeNull();
    expect(dv.layDatPhong).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Xóa sale này' }));
    const hoi = await screen.findByRole('alertdialog');
    expect(hoi).toHaveTextContent('Xóa Sale Phương khỏi danh sách sale?');
    fireEvent.click(within(hoi).getByRole('button', { name: 'Xóa' }));
    await waitFor(() => expect(dv.xoaSaleTay).toHaveBeenCalledWith('tay-1'));
    await waitFor(() => expect(onDaDoi).toHaveBeenCalled());
  });

  it('HV5 mất quyền giữa chừng (42501) thì về danh sách đọc lại', async () => {
    const loi = Object.assign(new Error('Không tìm thấy sale'), { code: '42501' });
    const dv = dichVu({ ngungChoXem: vi.fn().mockRejectedValue(loi) });
    const onDaDoi = ve(HUNG, dv);
    fireEvent.click(screen.getByRole('button', { name: 'Ngừng cho xem lịch' }));
    fireEvent.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Ngừng cho xem' }));
    await waitFor(() => expect(onDaDoi).toHaveBeenCalled());
  });
});
