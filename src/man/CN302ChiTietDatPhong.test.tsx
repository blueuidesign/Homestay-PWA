// Test unit màn CN3-02, CN3-02-01 Chi tiết đặt phòng và thu tiền (YC5.5). Số theo DLM: B1 1509 10/10 → 12/10 của Sale Hùng,
// tiền phòng 2.200.000đ, đã cọc 1.000.000đ.
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../chung/Toast';
import type { ChiTietDatPhong } from '../lib/datPhong';
import type { DichVuDatPhong } from '../lib/dichVuDatPhong';
import { CAU_KHONG_CON, CN302ChiTietDatPhong } from './CN302ChiTietDatPhong';

afterEach(cleanup);

const B1: ChiTietDatPhong = {
  id: 'B1', canId: 'c1509', maCan: '1509', ngayNhan: '2026-10-10', ngayTra: '2026-10-12', gioNhan: '14:00', gioTra: '12:00',
  tienPhong: 2200000, tienCoc: 1000000, trangThaiTien: 'da_coc', coHoanTac: false, daHuy: false,
  ghiChu: 'Sale Hùng: khách xin nhận phòng sớm 12:00.', saleId: 'hung', tenSale: 'Sale Hùng', sdtSale: '0912345678',
  saleDaXoa: false, tenKhach: null, sdtKhach: null, soKhach: 4,
};
const LE: ChiTietDatPhong = {
  ...B1, id: 'LE', canId: 'c3402', maCan: '3402', ngayNhan: '2026-11-03', ngayTra: '2026-11-04', tienPhong: 800000, tienCoc: null,
  trangThaiTien: 'chua_coc', ghiChu: null, saleId: null, tenSale: null, sdtSale: null, tenKhach: 'Bà Lan', sdtKhach: '0912345678', soKhach: 2,
};

function dichVu(ct: ChiTietDatPhong | null, them: Partial<DichVuDatPhong> = {}): DichVuDatPhong {
  return {
    layDatPhong: vi.fn(async () => []),
    layChiTiet: vi.fn(async () => ct),
    daThuDu: vi.fn(async () => 'da_thanh_toan' as const),
    hoanTacThuDu: vi.fn(async () => 'da_coc' as const),
    ...them,
  };
}

function ve(dv: DichVuDatPhong, onKhongCon = vi.fn()) {
  render(
    <ToastProvider>
      <CN302ChiTietDatPhong id="B1" dv={dv} onQuayLai={vi.fn()} onKhongCon={onKhongCon} />
    </ToastProvider>,
  );
  return onKhongCon;
}

const tien = () => within(screen.getByRole('region', { name: 'Tiền' }));
const nguoiDat = () => within(screen.getByRole('region', { name: 'Người đặt' }));

describe('YC5.5 · CN3-02 Chi tiết đặt phòng', () => {
  it('YC5.5 bước 16, 17 tiêu đề, căn, nhãn tiền, ngày, giờ; sale có số, nút "Gọi sale" và câu khách do sale bán', async () => {
    ve(dichVu(B1));
    expect(await screen.findByRole('heading', { name: 'Đặt phòng · Sale Hùng' })).toBeInTheDocument();
    expect(screen.getByText('Phòng 1509')).toBeInTheDocument();
    expect(screen.getByText('Đã cọc · còn thu')).toBeInTheDocument();
    expect(screen.getByText('10/10 → 12/10 (2 đêm)')).toBeInTheDocument();
    expect(screen.getByText('Nhận 14:00 thứ 7 · trả 12:00 thứ 2')).toBeInTheDocument();
    expect(nguoiDat().getByText('Sale Hùng')).toBeInTheDocument();
    expect(nguoiDat().getByText('0912 345 678 · 4 khách')).toBeInTheDocument();
    expect(nguoiDat().getByRole('link', { name: 'Gọi sale' })).toHaveAttribute('href', 'tel:0912345678');
    expect(nguoiDat().getByText('Khách do sale Hùng bán. Tên và số điện thoại khách chỉ sale giữ; cần gì về khách thì gọi sale.')).toBeInTheDocument();
    expect(screen.getByText('Sale Hùng: khách xin nhận phòng sớm 12:00.')).toBeInTheDocument();
  });

  it('YC5.5-NT1 tiền phòng 2.200.000đ, đã cọc 1.000.000đ thì "Còn lại 1.200.000đ" và nút "Đã thu đủ 1.200.000đ"', async () => {
    ve(dichVu(B1));
    await screen.findByRole('region', { name: 'Tiền' });
    expect(tien().getByText('Tiền phòng').nextSibling).toHaveTextContent('2.200.000đ');
    expect(tien().getByText('Đã cọc').nextSibling).toHaveTextContent('1.000.000đ');
    expect(tien().getByText('Còn lại').nextSibling).toHaveTextContent('1.200.000đ');
    expect(screen.getByRole('button', { name: 'Đã thu đủ 1.200.000đ' })).toBeInTheDocument();
  });

  it('YC5.5-NT2 bấm "Đã thu đủ" thì nhãn "Đã thanh toán", cọc vẫn 1.000.000đ, nút thành "Hoàn tác: chưa thu đủ"', async () => {
    const dv = dichVu(B1);
    ve(dv);
    fireEvent.click(await screen.findByRole('button', { name: 'Đã thu đủ 1.200.000đ' }));
    expect(await screen.findByRole('button', { name: 'Hoàn tác: chưa thu đủ' })).toBeInTheDocument();
    expect(dv.daThuDu).toHaveBeenCalledWith('B1');
    expect(screen.getByText('Đã thanh toán')).toBeInTheDocument();
    expect(screen.queryByText('Đã cọc · còn thu')).toBeNull();
    expect(tien().getByText('Đã cọc').nextSibling).toHaveTextContent('1.000.000đ');
    expect(screen.queryByRole('button', { name: /^Đã thu đủ/ })).toBeNull();
  });

  it('YC5.5-NT3 bấm "Hoàn tác: chưa thu đủ" ngay sau đó thì về "Đã cọc · còn thu"', async () => {
    const dv = dichVu(B1);
    ve(dv);
    fireEvent.click(await screen.findByRole('button', { name: 'Đã thu đủ 1.200.000đ' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Hoàn tác: chưa thu đủ' }));
    expect(await screen.findByRole('button', { name: 'Đã thu đủ 1.200.000đ' })).toBeInTheDocument();
    expect(dv.hoanTacThuDu).toHaveBeenCalledWith('B1');
    expect(screen.getByText('Đã cọc · còn thu')).toBeInTheDocument();
  });

  it('YC5.5 bước 20 đã thanh toán mà không có hoàn tác thì không có nút thu đủ hay hoàn tác', async () => {
    ve(dichVu({ ...B1, trangThaiTien: 'da_thanh_toan', coHoanTac: false }));
    expect(await screen.findByText('Đã thanh toán')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Đã thu đủ|Hoàn tác/ })).toBeNull();
  });

  it('YC5.5 HV8 lệnh thu đủ bị database từ chối thì toast, nhãn giữ nguyên', async () => {
    ve(dichVu(B1, { daThuDu: vi.fn(async () => { throw new Error('mạng'); }) }));
    fireEvent.click(await screen.findByRole('button', { name: 'Đã thu đủ 1.200.000đ' }));
    expect(await screen.findByRole('status')).toHaveTextContent(/Có lỗi|Chưa lưu được/);
    expect(screen.getByText('Đã cọc · còn thu')).toBeInTheDocument();
  });

  it('YC5.5-NT4 CN3-02-01 Sale Hùng đã xóa tài khoản: tên kèm "đã xóa tài khoản", không có số và nút "Gọi sale"', async () => {
    ve(dichVu({ ...B1, sdtSale: null, saleDaXoa: true }));
    await screen.findByRole('region', { name: 'Người đặt' });
    expect(nguoiDat().getByText('Sale Hùng')).toBeInTheDocument();
    expect(nguoiDat().getByText('đã xóa tài khoản')).toBeInTheDocument();
    expect(nguoiDat().getByText('4 khách')).toBeInTheDocument();
    expect(nguoiDat().queryByRole('link')).toBeNull();
    expect(screen.queryByText('Gọi sale')).toBeNull();
    expect(screen.queryByText(/0912/)).toBeNull();
    expect(nguoiDat().getByText('Sale Hùng đã xóa tài khoản. Đặt phòng vẫn giữ trong lịch của bạn; app không còn số điện thoại của sale này.')).toBeInTheDocument();
  });

  it('YC5.5-NT6 khách lẻ "Bà Lan" có số "0912345678" thì thấy tên, số và nút "Gọi khách"', async () => {
    ve(dichVu(LE));
    expect(await screen.findByRole('heading', { name: 'Đặt phòng · Bà Lan' })).toBeInTheDocument();
    expect(nguoiDat().getByText('Bà Lan')).toBeInTheDocument();
    expect(nguoiDat().getByText('0912 345 678 · 2 khách')).toBeInTheDocument();
    expect(nguoiDat().getByRole('link', { name: 'Gọi khách' })).toHaveAttribute('href', 'tel:0912345678');
    expect(screen.queryByText(/Khách do sale/)).toBeNull();
    expect(screen.getByText('Chưa cọc')).toBeInTheDocument();
  });

  it('YC5.5-NT6 khách lẻ không có số thì không có nút "Gọi khách"; không tên thì "Khách lẻ"', async () => {
    ve(dichVu({ ...LE, tenKhach: null, sdtKhach: null, soKhach: null }));
    expect(await screen.findByRole('heading', { name: 'Đặt phòng · Khách lẻ' })).toBeInTheDocument();
    expect(nguoiDat().getByText('Khách lẻ')).toBeInTheDocument();
    expect(nguoiDat().queryByRole('link')).toBeNull();
  });

  it('YC5.5 HV5 đặt phòng không còn thì toast "Đặt phòng này không còn" và về màn trước', async () => {
    const onKhongCon = ve(dichVu(null));
    await waitFor(() => expect(onKhongCon).toHaveBeenCalled());
    expect(screen.getByRole('status')).toHaveTextContent(CAU_KHONG_CON);
  });

  it('YC5.5 HV1, HV2 đang tải thì khung xám; không tải được thì "Thử lại" đọc lại', async () => {
    const layChiTiet = vi.fn().mockRejectedValueOnce(new Error('mạng')).mockResolvedValueOnce(B1);
    ve(dichVu(B1, { layChiTiet }));
    expect(screen.getByLabelText('Đang tải')).toBeInTheDocument();
    fireEvent.click(await screen.findByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByRole('heading', { name: 'Đặt phòng · Sale Hùng' })).toBeInTheDocument();
  });
});

describe('YC5.6 · nút Sửa ở CN3-02', () => {
  it('YC5.6 bước 24 bấm "Sửa đặt phòng" thì mở form sửa; đặt phòng đã hủy thì không có nút', async () => {
    const onSua = vi.fn();
    render(
      <ToastProvider>
        <CN302ChiTietDatPhong id="B1" dv={dichVu(B1)} onQuayLai={vi.fn()} onKhongCon={vi.fn()} onSua={onSua} />
      </ToastProvider>,
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Sửa đặt phòng' }));
    expect(onSua).toHaveBeenCalledTimes(1);
    cleanup();
    render(
      <ToastProvider>
        <CN302ChiTietDatPhong id="B1" dv={dichVu({ ...B1, daHuy: true })} onQuayLai={vi.fn()} onKhongCon={vi.fn()} onSua={onSua} />
      </ToastProvider>,
    );
    await screen.findByRole('heading', { name: 'Đặt phòng · Sale Hùng' });
    expect(screen.queryByRole('button', { name: 'Sửa đặt phòng' })).toBeNull();
  });
});
