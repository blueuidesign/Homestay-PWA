// Test unit màn CN3 Chi tiết một ngày (YC2.2). Số theo DLM.4: B1 1509 10/10 → 12/10 của Sale Hùng, 2.200.000đ, cọc 1.000.000đ.
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CanLich, DatPhongLich } from '../lib/lich';
import { CN3ChiTietNgay } from './CN3ChiTietNgay';

afterEach(cleanup);

const HAI_CAN: CanLich[] = [{ id: 'c1509', maCan: '1509' }, { id: 'c3402', maCan: '3402' }];

const B1: DatPhongLich = {
  id: 'B1', canId: 'c1509', ngayNhan: '2026-10-10', ngayTra: '2026-10-12', tienPhong: 2200000, tienCoc: 1000000,
  trangThaiTien: 'da_coc', nguoiDat: { loai: 'sale', ten: 'Sale Hùng', sdt: '0912345678' }, ghiChu: 'Khách có trẻ nhỏ, cần thêm đệm.',
};
const B5: DatPhongLich = {
  id: 'B5', canId: 'c1509', ngayNhan: '2026-10-13', ngayTra: '2026-10-15', tienPhong: 1800000, tienCoc: null,
  trangThaiTien: 'chua_coc', nguoiDat: { loai: 'khach', ten: 'Chị Mai' },
};
const B4: DatPhongLich = {
  id: 'B4', canId: 'c3402', ngayNhan: '2026-10-05', ngayTra: '2026-10-07', tienPhong: 1600000, tienCoc: null,
  trangThaiTien: 'da_thanh_toan', nguoiDat: { loai: 'le' },
};

function ve(ngay: string, ds: CanLich[] = HAI_CAN, them: { onMoDatPhong?: (id: string) => void; onDatPhong?: () => void } = {}) {
  return render(
    <CN3ChiTietNgay ngay={ngay} ds={ds} datPhong={[B1, B5, B4]} mau={new Map([['c1509', '#0ea5e9'], ['c3402', '#f97316']])}
                    onMoDatPhong={them.onMoDatPhong ?? vi.fn()} onDatPhong={them.onDatPhong ?? vi.fn()} />,
  );
}

const dong = (ma: string) => screen.getByRole('listitem', { name: `Phòng ${ma}` });

describe('YC2.2 · CN3 Chi tiết một ngày', () => {
  it('YC2.2-NT2 xem 10/10: dòng 1509 ghi "Sale Hùng", "10/10 → 12/10 (2 đêm)", "2.200.000đ · Cọc: 1.000.000đ"; dòng 3402 ghi "Trống ✓"', () => {
    ve('2026-10-10');
    expect(screen.getByRole('heading', { name: 'Ngày 10/10/2026' })).toBeInTheDocument();
    const d1509 = within(dong('1509'));
    expect(d1509.getByText('Sale Hùng')).toBeInTheDocument();
    expect(d1509.getByText('10/10 → 12/10 (2 đêm)')).toBeInTheDocument();
    expect(d1509.getByText('2.200.000đ · Cọc: 1.000.000đ')).toBeInTheDocument();
    expect(within(dong('3402')).getByText(/Trống ✓/)).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('YC2.2 bước 8 số của sale gọi được, ghi chú hiện khi có', () => {
    ve('2026-10-10');
    const d1509 = within(dong('1509'));
    expect(d1509.getByRole('link', { name: '0912 345 678' })).toHaveAttribute('href', 'tel:0912345678');
    expect(d1509.getByText('Khách có trẻ nhỏ, cần thêm đệm.')).toBeInTheDocument();
  });

  it('YC2.2 bước 8 khách chủ nhà nhập thì ghi tên khách, không có số sale; QT6.1 "Chưa cọc"', () => {
    ve('2026-10-13');
    const d1509 = within(dong('1509'));
    expect(d1509.getByText('Chị Mai')).toBeInTheDocument();
    expect(d1509.getByText('1.800.000đ · Chưa cọc')).toBeInTheDocument();
    expect(d1509.queryByRole('link')).toBeNull();
  });

  it('YC2.2 bước 8 khách lẻ không tên thì "Khách lẻ"; QT6.1 "Đã thanh toán"; lọc chip 3402 chỉ một dòng', () => {
    ve('2026-10-05', [HAI_CAN[1]!]);
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    const d3402 = within(dong('3402'));
    expect(d3402.getByText('Khách lẻ')).toBeInTheDocument();
    expect(d3402.getByText('1.600.000đ · Đã thanh toán')).toBeInTheDocument();
  });

  it('YC2.2 bước 9 chạm dòng căn có khách thì mở chi tiết đặt phòng', () => {
    const onMoDatPhong = vi.fn();
    ve('2026-10-10', HAI_CAN, { onMoDatPhong });
    fireEvent.click(within(dong('1509')).getByRole('button', { name: /Phòng 1509/ }));
    expect(onMoDatPhong).toHaveBeenCalledWith('B1');
  });

  it('YC2.2 bước 10 căn trống có nút "Đặt phòng"; ngày đã qua vẫn có (QD25, YC2-H6)', () => {
    const onDatPhong = vi.fn();
    ve('2026-10-10', HAI_CAN, { onDatPhong });
    fireEvent.click(within(dong('3402')).getByRole('button', { name: 'Đặt phòng' }));
    expect(onDatPhong).toHaveBeenCalledTimes(1);
    cleanup();
    ve('2020-01-01');
    expect(screen.getAllByRole('button', { name: 'Đặt phòng' })).toHaveLength(2);
  });

  it('YC5.1 bước 1b dòng 3402 trống ngày 10/10 bấm "Đặt phòng" thì mở CN4 với căn 3402 và ngày 10/10', () => {
    const onDatPhong = vi.fn();
    ve('2026-10-10', HAI_CAN, { onDatPhong });
    fireEvent.click(within(dong('3402')).getByRole('button', { name: 'Đặt phòng' }));
    expect(onDatPhong).toHaveBeenCalledWith('c3402', '2026-10-10');
  });
});
