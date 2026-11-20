// Test unit CN8, CN8-00 · Thống kê của chủ nhà (YC11.1, US58), và nối ở tab Thống kê của ManChu. Số theo DLM.5, canvas CN8.
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../chung/Toast';
import type { CanTomTat } from '../lib/can';
import type { DichVuCan } from '../lib/dichVuCan';
import type { DichVuThongKeChu } from '../lib/dichVuThongKeChu';
import type { ThangBieuDo, ThongKeThang } from '../lib/thongKeChu';
import { CN8ThongKe } from './CN8ThongKe';
import { ManChu } from './ManChu';

afterEach(() => { cleanup(); });

const DT: Record<string, number> = {
  '2026-05': 7_200_000, '2026-06': 8_900_000, '2026-07': 13_400_000, '2026-08': 14_100_000, '2026-09': 9_600_000,
  '2026-10': 11_800_000, '2026-11': 6_100_000, '2026-12': 0,
};
function sauThang(nam: number, thang: number): ThangBieuDo[] {
  return Array.from({ length: 6 }, (_, i) => {
    const n = nam * 12 + (thang - 1) - 5 + i;
    const k = `${Math.floor(n / 12)}-${String((n % 12) + 1).padStart(2, '0')}`;
    return { thang: `${k}-01`, doanhThu: DT[k] ?? 0 };
  });
}

const THANG10: ThongKeThang = {
  thang: '2026-10-01', homNay: '2026-10-07', doanhThu: 11_800_000, doanhThuThangTruoc: 9_600_000, soDem: 13, mauSo: 62, congSuat: 21,
  can: [{ canId: 'c1509', maCan: '1509', doanhThu: 6_700_000, soDem: 7, daAn: false },
    { canId: 'c3402', maCan: '3402', doanhThu: 5_100_000, soDem: 6, daAn: false }],
  cacThang: sauThang(2026, 10),
  nguoiBan: [
    { saleId: 'hung', ten: 'Sale Hùng', khachLe: false, doanhThu: 4_000_000 },
    { saleId: 'lan', ten: 'Sale Lan', khachLe: false, doanhThu: 3_500_000 },
    { saleId: null, ten: null, khachLe: true, doanhThu: 2_600_000 },
    { saleId: 'minh', ten: 'Sale Minh', khachLe: false, doanhThu: 1_700_000 },
  ],
  chuaThu: [
    { bookingId: 'b5', canId: 'c1509', maCan: '1509', saleId: null, ten: null, khachLe: true, ngayNhan: '2026-10-13',
      ngayTra: '2026-10-15', trangThaiTien: 'chua_coc', soTien: 1_800_000, conNgay: 6 },
    { bookingId: 'b2', canId: 'c3402', maCan: '3402', saleId: 'lan', ten: 'Sale Lan', khachLe: false, ngayNhan: '2026-10-17',
      ngayTra: '2026-10-19', trangThaiTien: 'chua_coc', soTien: 1_900_000, conNgay: 10 },
  ],
  tongChuaThu: 3_700_000,
};
const THANG11: ThongKeThang = {
  ...THANG10, thang: '2026-11-01', doanhThu: 6_100_000, doanhThuThangTruoc: 11_800_000, soDem: 7, mauSo: 60, congSuat: 11.7,
  can: [{ canId: 'c1509', maCan: '1509', doanhThu: 3_300_000, soDem: 4, daAn: false },
    { canId: 'c3402', maCan: '3402', doanhThu: 2_800_000, soDem: 3, daAn: false }],
  cacThang: sauThang(2026, 11),
  nguoiBan: [{ saleId: 'hung', ten: 'Sale Hùng', khachLe: false, doanhThu: 6_100_000 }],
  chuaThu: [], tongChuaThu: 0,
};
// CN8-00: tháng 12/2026 chưa có đặt phòng.
const THANG12: ThongKeThang = {
  thang: '2026-12-01', homNay: '2026-10-07', doanhThu: 0, doanhThuThangTruoc: 6_100_000, soDem: 0, mauSo: 62, congSuat: 0,
  can: [{ canId: 'c1509', maCan: '1509', doanhThu: 0, soDem: 0, daAn: false },
    { canId: 'c3402', maCan: '3402', doanhThu: 0, soDem: 0, daAn: false }],
  cacThang: sauThang(2026, 12), nguoiBan: [], chuaThu: [], tongChuaThu: 0,
};

function dvGia(): DichVuThongKeChu & { layThang: ReturnType<typeof vi.fn> } {
  const theo: Record<string, ThongKeThang> = { '2026-10': THANG10, '2026-11': THANG11, '2026-12': THANG12 };
  return {
    layThang: vi.fn(async (nam: number, thang: number) => {
      const k = `${nam}-${String(thang).padStart(2, '0')}`;
      const tk = theo[k];
      if (!tk) throw new Error('chưa có');
      return structuredClone(tk);
    }),
  };
}

const the = (ten: string) => screen.getByRole('region', { name: ten });

describe('YC11.1 · CN8 Thống kê tháng', () => {
  it('YC11.1-NT1 Chị Hoa xem tháng 10: 11.800.000đ, Phòng 1509 6.700.000đ, Phòng 3402 5.100.000đ', async () => {
    render(<CN8ThongKe dv={dvGia()} thangDau={[2026, 10]} />);
    expect(await screen.findByText('11.800.000đ')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Thống kê' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Tháng 10/2026' })).toBeInTheDocument();
    expect(screen.getByText('Doanh thu tháng 10')).toBeInTheDocument();
    expect(within(the('Phòng 1509')).getByText('6.700.000đ')).toBeInTheDocument();
    expect(within(the('Phòng 3402')).getByText('5.100.000đ')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tháng trước T09' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tháng sau T11' })).toBeInTheDocument();
  });
  it('YC11.1-NT2 tháng 10: "13/62" và "21.0%"', async () => {
    render(<CN8ThongKe dv={dvGia()} thangDau={[2026, 10]} />);
    await screen.findByText('11.800.000đ');
    expect(within(the('Đêm có khách')).getByText('13/62')).toBeInTheDocument();
    expect(within(the('Công suất')).getByText('21.0%')).toBeInTheDocument();
  });
  it('YC11.1-NT3 tháng 9 9.600.000đ, tháng 10 11.800.000đ: "+22.9% so với tháng 9"', async () => {
    render(<CN8ThongKe dv={dvGia()} thangDau={[2026, 10]} />);
    expect(await screen.findByText('+22.9% so với tháng 9')).toBeInTheDocument();
  });
  it('YC11.1-NT6 biểu đồ 6 tháng T5 đến T10: cột T7 ghi "13.4tr", T10 đậm', async () => {
    render(<CN8ThongKe dv={dvGia()} thangDau={[2026, 10]} />);
    await screen.findByText('11.800.000đ');
    const bd = the('Doanh thu 6 tháng');
    const cot = [...bd.querySelectorAll('[data-cot]')];
    expect(cot.map((c) => c.getAttribute('data-cot'))).toEqual(['T5', 'T6', 'T7', 'T8', 'T9', 'T10']);
    expect(within(bd).getByText('13.4tr')).toBeInTheDocument();
    expect(within(bd).getByText('9.6tr')).toBeInTheDocument();
    expect(within(bd).getByText('11.8tr')).toBeInTheDocument();
    expect(cot[5]!.querySelector('.hh-bars__bar--current')).not.toBeNull();
    expect(bd.querySelectorAll('.hh-bars__bar--current')).toHaveLength(1);
  });
  it('YC11.1-NT7 dòng theo người bán: Sale Hùng, Sale Lan, Khách lẻ, Sale Minh, không có giá bán', async () => {
    render(<CN8ThongKe dv={dvGia()} thangDau={[2026, 10]} />);
    await screen.findByText('11.800.000đ');
    const dong = within(the('Doanh thu theo người bán')).getAllByRole('listitem').map((li) => li.textContent);
    expect(dong).toEqual(['Sale Hùng4.000.000đ', 'Sale Lan3.500.000đ', 'Khách lẻ2.600.000đ', 'Sale Minh1.700.000đ']);
    expect(screen.queryByText(/giá bán|tiền chênh|mức cộng/i)).toBeNull();
  });
  it('YC11.1-NT9 B2 và B5 chưa cọc: "Chưa thu tiền" 3.700.000đ, B2 "nhận phòng sau 10 ngày"', async () => {
    render(<CN8ThongKe dv={dvGia()} thangDau={[2026, 10]} />);
    await screen.findByText('11.800.000đ');
    const ct = the('Chưa thu tiền');
    expect(within(ct).getByText('3.700.000đ')).toBeInTheDocument();
    expect(within(ct).getByText('Sale Lan · 17/10 → 19/10')).toBeInTheDocument();
    expect(within(ct).getByText('Chưa cọc · nhận phòng sau 10 ngày')).toBeInTheDocument();
    expect(within(ct).getByText('1.900.000đ')).toBeInTheDocument();
    expect(within(ct).getByText('Khách lẻ · 13/10 → 15/10')).toBeInTheDocument();
    expect(within(ct).getByText('Chưa cọc · nhận phòng sau 6 ngày')).toHaveAttribute('data-gap', 'co');
  });
  it('YC11.1-NT5 chạm T11: tiêu đề "Tháng 11/2026", mọi số theo tháng 11; xem tháng 12 thì biểu đồ T7 đến T12, T12 đậm', async () => {
    const dv = dvGia();
    render(<CN8ThongKe dv={dv} thangDau={[2026, 10]} />);
    await screen.findByText('11.800.000đ');
    fireEvent.click(screen.getByRole('button', { name: 'Tháng sau T11' }));
    expect(screen.getByRole('heading', { name: 'Tháng 11/2026' })).toBeInTheDocument();
    expect(await screen.findByText('Doanh thu tháng 11')).toBeInTheDocument();
    expect(within(the('Doanh thu tháng 11')).getByText('6.100.000đ')).toBeInTheDocument();
    expect(within(the('Phòng 1509')).getByText('3.300.000đ')).toBeInTheDocument();
    expect(within(the('Đêm có khách')).getByText('7/60')).toBeInTheDocument();
    expect(screen.getByText('−48.3% so với tháng 10')).toBeInTheDocument();
    expect(dv.layThang).toHaveBeenLastCalledWith(2026, 11);

    fireEvent.click(screen.getByRole('button', { name: 'Tháng sau T12' }));
    expect(await screen.findByText('Doanh thu tháng 12')).toBeInTheDocument();
    const bd = the('Doanh thu 6 tháng');
    const cot = [...bd.querySelectorAll('[data-cot]')];
    expect(cot.map((c) => c.getAttribute('data-cot'))).toEqual(['T7', 'T8', 'T9', 'T10', 'T11', 'T12']);
    expect(cot[5]!.getAttribute('data-dang-xem')).toBe('co');

    // ‹ về tháng đã xem: số hiện ngay từ bộ nhớ (HV1-NT2).
    fireEvent.click(screen.getByRole('button', { name: 'Tháng trước T11' }));
    expect(within(the('Doanh thu tháng 11')).getByText('6.100.000đ')).toBeInTheDocument();
  });
  it('YC11.1-NT11 CN8-00 tháng chưa có đặt phòng: mọi số 0, không có so sánh, hai dòng trống', async () => {
    render(<CN8ThongKe dv={dvGia()} thangDau={[2026, 12]} />);
    expect(await screen.findByText('Chưa có đặt phòng')).toBeInTheDocument();
    expect(within(the('Doanh thu tháng 12')).getByText('0đ')).toBeInTheDocument();
    expect(within(the('Phòng 1509')).getByText('0đ')).toBeInTheDocument();
    expect(within(the('Phòng 3402')).getByText('0đ')).toBeInTheDocument();
    expect(within(the('Đêm có khách')).getByText('0')).toBeInTheDocument();
    expect(within(the('Công suất')).getByText('0%')).toBeInTheDocument();
    expect(screen.queryByText(/so với tháng/)).toBeNull();
    expect(screen.getByText('Chưa có đặt phòng trong tháng.')).toBeInTheDocument();
    expect(screen.getByText('Không có khoản nào chưa thu.')).toBeInTheDocument();
    expect(within(the('Chưa thu tiền')).getByText('0đ')).toBeInTheDocument();
    // Biểu đồ: tháng 12 không có thanh, không có số.
    const t12 = the('Doanh thu 6 tháng').querySelector('[data-cot="T12"]')!;
    expect(t12.querySelector('.hh-bars__bar')).toBeNull();
    expect(t12.querySelector('.hh-bars__val')!.textContent).toBe('');
  });
  it('HV2: chưa tải được thì "Thử lại", bấm thì đọc lại', async () => {
    const dv = { layThang: vi.fn().mockRejectedValueOnce(new Error('mạng')).mockResolvedValue(structuredClone(THANG10)) };
    render(<CN8ThongKe dv={dv} thangDau={[2026, 10]} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByText('11.800.000đ')).toBeInTheDocument();
  });
  it('HV3: quay lại từ nền thì đọc lại số liệu', async () => {
    const dv = dvGia();
    render(<CN8ThongKe dv={dv} thangDau={[2026, 10]} />);
    await screen.findByText('11.800.000đ');
    const n = dv.layThang.mock.calls.length;
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    await waitFor(() => expect(dv.layThang.mock.calls.length).toBe(n + 1));
  });
});

describe('YC11.1 · tab Thống kê của ManChu', () => {
  const can = (id: string, ma: string): CanTomTat => ({
    id, maCan: ma, soPhongNgu: 2, soGiuong: null, loaiView: null, tenToa: null, soAnh: 0, anhDaiDien: null, moiThem: false, khachDen: null,
  });
  it('YC11.1 bước 1: mở tab Thống kê thấy CN8 (không còn khung tạm), tab Thống kê đang mở', async () => {
    const dv: DichVuCan = { layCanCuaToi: vi.fn(async () => [can('c3402', '3402'), can('c1509', '1509')]), thongKe: dvGia() };
    render(<ToastProvider><ManChu duongDan="/thong-ke" den={vi.fn()} dichVuCan={dv} onDangXuat={vi.fn()} /></ToastProvider>);
    expect(await screen.findByRole('region', { name: /Doanh thu tháng/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Thống kê' })).toHaveAttribute('aria-current', 'page');
    expect(dv.thongKe!.layThang).toHaveBeenCalled();
  });
});
