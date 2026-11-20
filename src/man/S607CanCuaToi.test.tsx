// Test unit S6-07 · Chi tiết căn của tôi (YC10.1 bước 7, US54).
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LoiNguoiDung } from '../chung/matKetNoi';
import type { ChiTietCanCuaToi } from '../lib/tabCanSale';
import { S607CanCuaToi } from './S607CanCuaToi';

afterEach(cleanup);

const GIA = [750_000, null, null, 900_000, 750_000, 750_000, 750_000];
const CT: ChiTietCanCuaToi = {
  canId: 'g0812', maCan: '0812', tenToa: 'Green Bay', soPhongNgu: 2, soGiuong: null, loaiView: 'bien', anh: ['https://kho/a.jpg'],
  dem: GIA.map((g, i) => ({ ngay: `2026-10-${String(7 + i).padStart(2, '0')}`, o: g == null ? 'kin' as const : 'trong' as const, gia: g ?? 750_000 })),
};

function ve(doc = vi.fn(async () => CT)) {
  const cb = { onQuayLai: vi.fn(), onDatPhong: vi.fn(), onSuaCan: vi.fn(), onGuiKhach: vi.fn() };
  render(<S607CanCuaToi canId="g0812" tenTam="Green Bay 0812" dv={{ docCanCuaToi: doc }} homNay="2026-10-07" {...cb} />);
  return { ...cb, doc };
}

describe('YC10.1 · S6-07 chi tiết căn của tôi', () => {
  it('YC10.1-NT5 S6-07 có nhãn "Căn của tôi", 7 ngày giá đêm của bạn và ba việc Đặt phòng, Sửa căn và giá, Gửi cho khách', async () => {
    const cb = ve();
    expect(screen.getByRole('heading', { name: 'Green Bay 0812' })).toBeInTheDocument();
    expect(await screen.findByText('Căn của tôi')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Ảnh Green Bay 0812' })).toHaveAttribute('src', 'https://kho/a.jpg');
    expect(screen.getAllByTestId('o-ngay').map((o) => o.textContent))
      .toEqual(['Nay07750k', 'T508Kín', 'T609Kín', 'T710900k', 'CN11750k', 'T212750k', 'T313750k']);
    fireEvent.click(screen.getByRole('button', { name: /^Đặt phòng/ }));
    fireEvent.click(screen.getByRole('button', { name: /^Sửa căn và giá/ }));
    fireEvent.click(screen.getByRole('button', { name: /^Gửi cho khách/ }));
    expect([cb.onDatPhong, cb.onSuaCan, cb.onGuiKhach].map((f) => f.mock.calls[0]?.[0]?.canId)).toEqual(['g0812', 'g0812', 'g0812']);
    expect(cb.doc).toHaveBeenCalledWith('g0812', '2026-10-07');
  });

  it('YC10.1-NT6 HV5 căn không còn của mình: báo câu của database, không có lịch, giá', async () => {
    ve(vi.fn(async () => { throw new LoiNguoiDung('Không tìm thấy căn'); }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Không tìm thấy căn');
    expect(screen.queryByTestId('o-ngay')).toBeNull();
  });

  it('YC10.1 HV2 mất mạng thì "Thử lại"; Quay lại gọi onQuayLai', async () => {
    const doc = vi.fn().mockRejectedValueOnce(new Error('mạng')).mockResolvedValue(CT);
    const cb = ve(doc);
    fireEvent.click(await screen.findByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByText('Căn của tôi')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    expect(cb.onQuayLai).toHaveBeenCalled();
  });
});
