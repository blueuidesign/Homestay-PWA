// Test unit màn P8, P8-00 Xuất file Excel (CSV) (YC1.6). Dịch vụ giả, không gọi mạng.
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../chung/Toast';
import type { DichVuXuatCsv } from '../lib/dichVuXuatCsv';
import type { DongXuat } from '../lib/xuatCsv';
import { CAU_GIOI_THIEU_CSV, CAU_KHONG_CO_DAT_PHONG, P8XuatCsv } from './P8XuatCsv';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const C1509 = { id: 'c1', maCan: '1509' };
const C3402 = { id: 'c2', maCan: '3402' };
const dong = (n: number): DongXuat[] => Array.from({ length: n }, (_, i) => ({ maCan: '1509', ngayNhan: `2026-10-${10 + i}`, ngayTra: `2026-10-${11 + i}`,
  soDem: 1, tenKhach: null, sdtKhach: null, tenSale: null, saleDaXoa: false, tongTien: 900000, daCoc: 0, conLai: 900000, ghiChu: null }));
// DLM.8: tháng 10 "Tất cả" 8, "1509" 4; tháng 9 không có.
const dv = (g: Partial<DichVuXuatCsv> = {}): DichVuXuatCsv => ({
  dsCan: vi.fn(async () => [C1509, C3402]),
  dem: vi.fn(async (tu: string, _den: string, canId: string | null) => (tu.startsWith('2026-10') ? (canId === 'c1' ? 4 : 8) : 0)),
  xuat: vi.fn(async (_tu: string, _den: string, canId: string | null) => dong(canId === 'c1' ? 4 : 8)),
  ...g,
});
async function ve(d: DichVuXuatCsv, homNay = '2026-10-14') {
  render(<ToastProvider><P8XuatCsv dv={d} onQuayLai={() => undefined} homNay={homNay} /></ToastProvider>);
  await screen.findByRole('button', { name: 'Tất cả' });
}
const nut = () => screen.getByRole('button', { name: /Xuất file Excel \(CSV\)/ });

describe('YC1.6 · P8 Xuất file Excel (CSV)', () => {
  it('YC1.6 bước 1 đến 4 mở màn thì có câu giới thiệu, chip chọn sẵn "Tháng này" và "Tất cả", danh sách cột', async () => {
    await ve(dv());
    expect(screen.getByText(CAU_GIOI_THIEU_CSV)).toBeInTheDocument();
    for (const c of ['Tháng này', '3 tháng gần nhất', 'Năm 2026', 'Tùy chọn', '1509', '3402']) expect(screen.getByRole('button', { name: c })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tháng này' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Tất cả' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('FILE GỒM CÁC CỘT: Căn · Ngày nhận · Ngày trả · Số đêm · Khách · SĐT · Sale · Tổng tiền · Đã cọc · Còn lại · Ghi chú')).toBeInTheDocument();
  });

  it('YC1.6-NT1 tháng 10 "Tất cả" ghi 8 đặt phòng, chọn "1509" thì 4; file có đúng số dòng đó', async () => {
    const d = dv();
    await ve(d);
    expect(await screen.findByText('8 đặt phòng')).toBeInTheDocument();
    expect(d.dem).toHaveBeenLastCalledWith('2026-10-01', '2026-10-31', null);
    fireEvent.click(screen.getByRole('button', { name: '1509' }));
    expect(await screen.findByText('4 đặt phòng')).toBeInTheDocument();
    expect(d.dem).toHaveBeenLastCalledWith('2026-10-01', '2026-10-31', 'c1');

    let file: File | undefined;
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });
    Object.defineProperty(navigator, 'share', { configurable: true, value: vi.fn(async (x: { files: File[] }) => { file = x.files[0]; }) });
    fireEvent.click(nut());
    await waitFor(() => expect(file).toBeDefined());
    expect(d.xuat).toHaveBeenCalledWith('2026-10-01', '2026-10-31', 'c1');
    expect(file!.name).toBe('home247-dat-phong-2026-10-01-2026-10-31.csv');
    const chu = await file!.text();
    expect(chu.trim().split('\r\n')).toHaveLength(1 + 4);
    delete (navigator as { canShare?: unknown }).canShare;
    delete (navigator as { share?: unknown }).share;
  });

  it('YC1.6 bước 6 trình duyệt không gửi được file thì tải về máy và báo', async () => {
    const tao = vi.fn(() => 'blob:x');
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: tao });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: () => undefined });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    await ve(dv());
    await screen.findByText('8 đặt phòng');
    fireEvent.click(nut());
    expect(await screen.findByText('Đã tải file về máy')).toBeInTheDocument();
    expect(tao).toHaveBeenCalled();
  });

  it('YC1.6-NT6 khoảng chọn không có đặt phòng thì thấy P8-00 và không xuất được', async () => {
    await ve(dv(), '2026-09-14');
    expect(await screen.findByText('0 đặt phòng')).toBeInTheDocument();
    expect(screen.getByText(CAU_KHONG_CO_DAT_PHONG)).toBeInTheDocument();
    expect(document.querySelector('[data-man="P8-00"]')).not.toBeNull();
    expect(nut()).toBeDisabled();
  });

  it('YC1.6 luật kiểm "Tùy chọn" quá 1 năm thì báo "Chọn tối đa 1 năm", không đếm, không xuất', async () => {
    const d = dv();
    await ve(d);
    await screen.findByText('8 đặt phòng');
    fireEvent.click(screen.getByRole('button', { name: 'Tùy chọn' }));
    fireEvent.change(screen.getByLabelText('Từ ngày'), { target: { value: '2025-01-01' } });
    fireEvent.change(screen.getByLabelText('Đến ngày'), { target: { value: '2026-10-31' } });
    expect(await screen.findByText('Chọn tối đa 1 năm')).toBeInTheDocument();
    expect(nut()).toBeDisabled();
    expect(d.dem).not.toHaveBeenLastCalledWith('2025-01-01', '2026-10-31', null);
  });

  it('HV2 đọc căn lỗi thì có Thử lại', async () => {
    const d = dv({ dsCan: vi.fn().mockRejectedValueOnce(new Error('x')).mockResolvedValue([C1509]) });
    render(<ToastProvider><P8XuatCsv dv={d} onQuayLai={() => undefined} homNay="2026-10-14" /></ToastProvider>);
    fireEvent.click(await screen.findByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByRole('button', { name: '1509' })).toBeInTheDocument();
  });
});
