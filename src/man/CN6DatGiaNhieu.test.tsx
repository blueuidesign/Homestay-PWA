// Test unit màn CN6-05, CN6-05-00, CN6-06 · Đặt giá nhiều căn (YC4.4). Dịch vụ giá là bản giả, không gọi mạng.
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { ToastProvider } from '../chung/Toast';
import type { DichVuGia } from '../lib/dichVuGia';
import { CN6DatGiaNhieu } from './CN6DatGiaNhieu';

afterEach(cleanup);

const DS = [{ id: 'c1509', maCan: '1509' }, { id: 'c3402', maCan: '3402' }];

function dichVu(ghiDe: Partial<DichVuGia> = {}) {
  return {
    layBangGia: vi.fn(), datGiaThang: vi.fn(), layLichGia: vi.fn(),
    layDemCuoiTuan: vi.fn(async () => [5, 6]),
    datGiaThangNhieu: vi.fn(async () => {}),
    ...ghiDe,
  } as unknown as DichVuGia & { datGiaThangNhieu: ReturnType<typeof vi.fn> };
}

function ve(dv: DichVuGia, onDaApDung = vi.fn()) {
  render(<ToastProvider><CN6DatGiaNhieu ds={DS} dv={dv} onQuayLai={vi.fn()} onDaApDung={onDaApDung} homNay="2026-10-07" /></ToastProvider>);
  return onDaApDung;
}

describe('CN6-05 Đặt giá nhiều căn (YC4.4)', () => {
  it('YC4.4-NT3 chưa chọn căn nào thì nút dưới đáy "Chọn ít nhất một căn" không bấm được (CN6-05-00)', () => {
    ve(dichVu());
    expect(screen.getByText('Chọn căn · đã chọn 0/2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Chọn ít nhất một căn' })).toBeDisabled();
  });

  it('YC4.4-NT1 chọn 1509 trong 2 căn thì nút ghi "Đặt giá cho 1 căn" và dòng đếm ghi "1/2"', () => {
    ve(dichVu());
    fireEvent.click(screen.getByRole('checkbox', { name: 'Phòng 1509' }));
    expect(screen.getByText('Chọn căn · đã chọn 1/2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Đặt giá cho 1 căn' })).toBeEnabled();
  });

  it('YC4.4-NT2 bấm "Chọn tất cả" thì mọi căn chưa xóa được chọn', () => {
    ve(dichVu());
    fireEvent.click(screen.getByRole('button', { name: 'Chọn tất cả' }));
    expect(screen.getByRole('checkbox', { name: 'Phòng 1509' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('checkbox', { name: 'Phòng 3402' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText('Chọn căn · đã chọn 2/2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Đặt giá cho 2 căn' })).toBeEnabled();
  });

  it('YC4.4 bước 3, 4: CN6-06 "Đặt giá · 2 căn", chọn tháng 12, nhập giá, Áp dụng thì gửi một lệnh cho cả hai căn', async () => {
    const dv = dichVu();
    const xong = ve(dv);
    fireEvent.click(screen.getByRole('button', { name: 'Chọn tất cả' }));
    fireEvent.click(screen.getByRole('button', { name: 'Đặt giá cho 2 căn' }));
    expect(screen.getByRole('heading', { name: 'Đặt giá · 2 căn' })).toBeInTheDocument();
    expect(screen.getByText('Phòng 1509, Phòng 3402')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Đổi căn' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tháng 12' }));
    fireEvent.change(screen.getByLabelText(/Ngày thường/), { target: { value: '800000' } });
    fireEvent.change(screen.getByLabelText(/Cuối tuần/), { target: { value: '1100000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Áp dụng cho Tháng 12' }));
    await vi.waitFor(() => expect(xong).toHaveBeenCalledWith(2));
    expect(dv.datGiaThangNhieu).toHaveBeenCalledWith(['c1509', 'c3402'], ['2026-12-01'], 800_000, 1_100_000);
  });

  it('YC4 Trạng thái màn HV5: database từ chối (căn đã xóa) thì toast câu lỗi, ở lại màn, giữ giá', async () => {
    const dv = dichVu({ datGiaThangNhieu: vi.fn(async () => { throw new LoiNguoiDung('Không tìm thấy căn'); }) });
    const xong = ve(dv);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Phòng 1509' }));
    fireEvent.click(screen.getByRole('button', { name: 'Đặt giá cho 1 căn' }));
    fireEvent.click(screen.getByRole('button', { name: 'Tháng 12' }));
    fireEvent.change(screen.getByLabelText(/Ngày thường/), { target: { value: '800000' } });
    fireEvent.change(screen.getByLabelText(/Cuối tuần/), { target: { value: '1100000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Áp dụng cho Tháng 12' }));
    expect(await screen.findByText('Không tìm thấy căn')).toBeInTheDocument();
    expect(xong).not.toHaveBeenCalled();
    expect((screen.getByLabelText(/Ngày thường/) as HTMLInputElement).value).toBe('800.000');
  });
});
