// Test unit S6-03, S6-03-00 Chi tiết căn tự nhập (YC10.3 bước 8 đến 13, US56).
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { ToastProvider } from '../chung/Toast';
import type { ChiTietCanTuNhap, DichVuCanTuNhap } from '../lib/dichVuCanTuNhap';
import { S603CanTuNhap } from './S603CanTuNhap';

afterEach(cleanup);

const VILLA: ChiTietCanTuNhap = {
  canId: 'villa', maCan: 'Villa Tuần Châu', toaNhaId: null, tenToa: null, soPhongNgu: 2, soGiuong: 3, loaiView: null,
  tenChu: 'Chú Bình', soDienThoai: '0904123330', giaThuong: 1_400_000, giaCuoiTuan: null, anh: [],
  datPhong: [{ id: 'V1', ngayNhan: '2026-09-20', ngayTra: '2026-09-22', traChu: 2_800_000, thuKhach: 3_400_000 }],
};

function ve(ct: ChiTietCanTuNhap | (() => Promise<ChiTietCanTuNhap>) = VILLA, xoa = vi.fn(async () => {})) {
  const doc = vi.fn(typeof ct === 'function' ? ct : async () => ct);
  const dv: Pick<DichVuCanTuNhap, 'doc' | 'xoa'> = { doc, xoa };
  const cb = { onQuayLai: vi.fn(), onGuiKhach: vi.fn(), onSua: vi.fn(), onDatPhong: vi.fn(), onDaXoa: vi.fn() };
  render(<ToastProvider><S603CanTuNhap canId="villa" tenTam="Villa Tuần Châu" dv={dv} {...cb} /></ToastProvider>);
  return { ...cb, doc, xoa };
}

describe('YC10.3 · S6-03 chi tiết căn tự nhập', () => {
  it('YC10.3 bước 8: tên căn, tên chủ, số che ba số giữa, "chưa dùng app", Gọi hỏi lịch, câu gọi chủ', async () => {
    ve();
    expect(screen.getByRole('heading', { name: 'Villa Tuần Châu' })).toBeInTheDocument();
    expect(await screen.findByText('Chú Bình')).toBeInTheDocument();
    expect(screen.getByText('0904 *** 330 · chưa dùng app')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Gọi hỏi lịch' })).toHaveAttribute('href', 'tel:0904123330');
    expect(screen.getByText('Căn này không có lịch trống. Khách hỏi ngày nào, bạn gọi chú Bình hỏi ngày đó.')).toBeInTheDocument();
    expect(screen.getByText('2PN · 3 giường')).toBeInTheDocument();
  });

  it('YC10.3-NT6 V1: "20/09 → 22/09", "Trả chủ 2.800.000đ · Thu khách 3.400.000đ", "+600.000đ", không ghi "trống" ngày nào', async () => {
    ve();
    const dp = await screen.findByTestId('dat-phong');
    expect(dp).toHaveTextContent('20/09 → 22/09');
    expect(dp).toHaveTextContent('Trả chủ 2.800.000đ · Thu khách 3.400.000đ');
    expect(dp).toHaveTextContent('+600.000đ');
    expect(screen.getByText('Đặt phòng bạn đã ghi · 1')).toBeInTheDocument();
    expect(screen.getByText('Chỉ bạn thấy')).toBeInTheDocument();
    expect(screen.getByText('Đây là đặt phòng của bạn, không phải lịch của căn. Ngày không có đặt phòng chưa chắc còn trống.')).toBeInTheDocument();
    // QT6.4: chữ "trống" chỉ có trong câu "chưa chắc còn trống" và "không có lịch trống", không gắn cho ngày nào.
    const chu = document.body.textContent ?? '';
    expect(chu.replace('chưa chắc còn trống', '').replace(/không có lịch trống/g, '').replace('lịch trống thật', '')).not.toMatch(/trống/i);
  });

  it('YC10.3 bước 9 S6-03-00: chưa có đặt phòng thì "Chưa có đặt phòng nào cho căn này"', async () => {
    ve({ ...VILLA, datPhong: [] });
    expect(await screen.findByText('Chưa có đặt phòng nào cho căn này')).toBeInTheDocument();
    expect(screen.getByText('Đặt phòng bạn đã ghi · 0')).toBeInTheDocument();
    expect(document.querySelector('[data-man="S6-03-00"]')).not.toBeNull();
    expect(screen.queryByTestId('dat-phong')).toBeNull();
  });

  it('YC10.3-NT8 không còn số chủ căn thì nút "Gọi hỏi lịch" không dùng được', async () => {
    ve({ ...VILLA, soDienThoai: null });
    expect(await screen.findByRole('button', { name: 'Gọi hỏi lịch' })).toBeDisabled();
    expect(screen.queryByRole('link', { name: 'Gọi hỏi lịch' })).toBeNull();
    expect(screen.queryByText(/\*\*\*/)).toBeNull();
  });

  it('YC10.3-NT9 bấm "Xóa căn tự nhập" một lần chưa xóa; bấm xác nhận thì xóa và về S6', async () => {
    const cb = ve();
    fireEvent.click(await screen.findByRole('button', { name: 'Xóa căn tự nhập' }));
    expect(cb.xoa).not.toHaveBeenCalled();
    expect(screen.getByText('Chỉ xóa khỏi Nguồn phòng của bạn.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận xóa Villa Tuần Châu?' }));
    await waitFor(() => expect(cb.onDaXoa).toHaveBeenCalled());
    expect(cb.xoa).toHaveBeenCalledWith('villa');
  });

  it('YC10.3 bước 10, 12: Gửi cho khách, Sửa thông tin căn, Đặt phòng gọi đúng việc', async () => {
    const cb = ve();
    fireEvent.click(await screen.findByRole('button', { name: /^Gửi cho khách/ }));
    fireEvent.click(screen.getByRole('button', { name: /^Sửa thông tin căn/ }));
    fireEvent.click(screen.getByRole('button', { name: /Đặt phòng$/ }));
    expect([cb.onGuiKhach, cb.onSua, cb.onDatPhong].map((f) => f.mock.calls[0]?.[0]?.canId)).toEqual(['villa', 'villa', 'villa']);
    expect(screen.getByRole('button', { name: /^Mời chú Bình dùng app/ })).toBeInTheDocument();
  });

  it('YC10.3 HV5 căn không còn: báo câu của database; HV2 mất mạng thì Thử lại', async () => {
    ve(async () => { throw new LoiNguoiDung('Không tìm thấy căn'); });
    expect(await screen.findByRole('alert')).toHaveTextContent('Không tìm thấy căn');
    cleanup();
    const doc = vi.fn().mockRejectedValueOnce(new Error('mạng')).mockResolvedValue(VILLA);
    ve(doc);
    fireEvent.click(await screen.findByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByText('Chú Bình')).toBeInTheDocument();
  });
});
