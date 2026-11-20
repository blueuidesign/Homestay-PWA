// Test unit màn CN6-07, CN6-08 · Sao chép giá sang căn khác (YC4.5). Dịch vụ giá là bản giả, không gọi mạng.
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../chung/Toast';
import type { BangGiaNam, DichVuGia } from '../lib/dichVuGia';
import { dongGiuLai, type KetQuaSaoChep } from '../lib/gia';
import { CN6GiaCan } from './CN6GiaCan';

afterEach(cleanup);

const THANG = Array.from({ length: 12 }, (_, i) => (i >= 5 ? { thuong: 800_000, cuoiTuan: 1_100_000 } : null));
const DS = [{ id: 'c3402', maCan: '3402' }, { id: 'c1509', maCan: '1509' }];
const KHONG_GIU: KetQuaSaoChep[] = [{ canId: 'c1509', maCan: '1509', thangGiu: [], dipGiu: [], dipBo: [] }];

function dichVu(kq: KetQuaSaoChep[] = KHONG_GIU) {
  return {
    layBangGia: vi.fn(async (_c: string, nam: number): Promise<BangGiaNam> => ({
      nam, thang: THANG, dip: [{ id: 'd1', tuNgay: '2026-10-24', denNgay: '2026-10-25', ten: 'Dịp đặc biệt', gia: 1_300_000, laNgayLe: false }], demCuoiTuan: [5, 6],
    })),
    datGiaThang: vi.fn(), layLichGia: vi.fn(async () => []),
    saoChepGia: vi.fn(async () => kq),
  } as unknown as DichVuGia & { saoChepGia: ReturnType<typeof vi.fn> };
}

async function moCN607(dv: DichVuGia) {
  render(<ToastProvider><CN6GiaCan canId="c3402" maCan="3402" dv={dv} dsCan={DS} onQuayLai={vi.fn()} onThongTin={vi.fn()} homNay="2026-10-07" /></ToastProvider>);
  fireEvent.click(await screen.findByRole('button', { name: /Sao chép giá sang căn khác/ }));
  await screen.findByRole('heading', { name: 'Sao chép giá' });
}

describe('CN6-07 Sao chép giá (YC4.5)', () => {
  it('YC4.5 bước 1 đến 3: "Từ căn" Phòng 3402 và tóm tắt, ba phần sao chép, danh sách căn khác', async () => {
    await moCN607(dichVu());
    expect(screen.getByText(/Giá 7 tháng · 0 ngày lễ · 1 dịp đặc biệt/)).toBeInTheDocument();
    for (const p of ['Giá theo tháng', 'Giá ngày lễ', 'Dịp đặc biệt']) expect(screen.getByRole('checkbox', { name: p })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Phòng 1509' })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Phòng 3402' })).toBeNull();
    expect(screen.getByText('Sang căn · đã chọn 0')).toBeInTheDocument();
  });

  it('YC4.5-NT1 chưa chọn căn đích thì nút ghi "Chọn căn để sao chép" và không bấm được', async () => {
    await moCN607(dichVu());
    expect(screen.getByText(/Giá đang có của căn được chọn sẽ được thay bằng giá của Phòng 3402/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Chọn căn để sao chép' })).toBeDisabled();
  });

  it('YC4.5-NT7 sao chép xong sang 1 căn (không có chỗ giữ lại) thì về tab Giá với toast "Đã sao chép giá sang 1 căn"', async () => {
    const dv = dichVu();
    await moCN607(dv);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Giá ngày lễ' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Phòng 1509' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sao chép sang 1 căn' }));
    expect(await screen.findByText('Đã sao chép giá sang 1 căn')).toBeInTheDocument();
    expect(dv.saoChepGia).toHaveBeenCalledWith('c3402', ['c1509'], { thang: true, ngayLe: false, dip: true }, 2026);
    expect(screen.getByText('Giá theo tháng')).toBeInTheDocument();
  });

  it('YC4.5-NT3 tháng 1 của 1509 giữ giá cũ thì popup liệt kê "1509 · Tháng 1", bấm "Tôi đã hiểu" mới về tab Giá', async () => {
    await moCN607(dichVu([{ canId: 'c1509', maCan: '1509', thangGiu: [1], dipGiu: [], dipBo: [] }]));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Phòng 1509' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sao chép sang 1 căn' }));
    const popup = await screen.findByRole('dialog', { name: 'Chỗ giữ giá cũ' });
    expect(popup).toHaveTextContent('1509 · Tháng 1');
    expect(screen.queryByText('Đã sao chép giá sang 1 căn')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Tôi đã hiểu' }));
    expect(await screen.findByText('Đã sao chép giá sang 1 căn')).toBeInTheDocument();
  });

  it('YC4.5-NT5 dịp 24/10 – 25/10 của 3402 bị bỏ ở 1509 vì trùng ngày thì popup liệt kê dịp bị bỏ', async () => {
    await moCN607(dichVu([{ canId: 'c1509', maCan: '1509', thangGiu: [], dipGiu: [],
      dipBo: [{ ten: 'Dịp đặc biệt', tuNgay: '2026-10-24', denNgay: '2026-10-25', laNgayLe: false }] }]));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Phòng 1509' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sao chép sang 1 căn' }));
    expect(await screen.findByRole('dialog', { name: 'Chỗ giữ giá cũ' })).toHaveTextContent('1509 · bỏ Dịp đặc biệt 24/10 – 25/10 (trùng ngày với dịp đã có)');
  });

  it('YC4.5 bước 5: dòng popup cho dịp giữ lại', () => {
    expect(dongGiuLai([{ canId: 'c', maCan: '1509', thangGiu: [], dipGiu: [{ ten: null, tuNgay: '2026-12-01', denNgay: '2026-12-02', laNgayLe: false }], dipBo: [] }]))
      .toEqual(['1509 · giữ Dịp đặc biệt 01/12 – 02/12']);
  });
});
