// Test unit S6-02 Thêm căn tự nhập và form sửa (YC10.3 bước 1 đến 7, 12, US56).
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { ToastProvider } from '../chung/Toast';
import type { ChiTietCanTuNhap, DichVuCanTuNhap } from '../lib/dichVuCanTuNhap';
import { S602ThemCanTuNhap } from './S602ThemCanTuNhap';

beforeEach(() => localStorage.clear());
afterEach(cleanup);

const TOA = { ds: [{ id: 't1', ten: 'ICON40', khuVuc: null, home247: true }, { id: 't2', ten: 'Sapphire', khuVuc: null, home247: true }], daDung: [] };

function ve(over: Partial<DichVuCanTuNhap> = {}, dau?: ChiTietCanTuNhap) {
  const dv = {
    tao: vi.fn(async () => 'id-moi'), sua: vi.fn(async () => {}), layToa: vi.fn(async () => TOA), themToa: vi.fn(async () => 't9'),
    taiAnh: vi.fn(async () => `anh-${Math.random()}`), ...over,
  };
  const cb = { onXong: vi.fn(), onQuayLai: vi.fn() };
  render(<ToastProvider><S602ThemCanTuNhap dv={dv} dau={dau} {...cb} /></ToastProvider>);
  return { dv, ...cb };
}
const go = (nhan: RegExp, v: string) => fireEvent.change(screen.getByLabelText(nhan), { target: { value: v } });
const nut = (ten: string) => screen.getByRole('button', { name: ten });
const dienDu = () => {
  go(/^Tên chủ nhà/, 'Chú Bình');
  go(/^Số điện thoại/, '0904123330');
  go(/^Mã căn/, 'Villa Tuần Châu');
  fireEvent.click(nut('4PN+'));
};
const anh = (ten: string) => new File([new Uint8Array(8)], ten, { type: 'image/jpeg' });

describe('YC10.3 · S6-02 thêm căn tự nhập', () => {
  it('YC10.3 bước 1 đến 5: lời giải thích, nhãn các ô, ghi chú giá chủ, nút Thêm ảnh', async () => {
    ve();
    expect(screen.getByRole('heading', { name: 'Thêm căn tự nhập' })).toBeInTheDocument();
    expect(screen.getByText(/Căn này không có lịch trống: mỗi lần khách hỏi, bạn gọi chủ/)).toBeInTheDocument();
    for (const n of [/^Tên chủ nhà/, /^Số điện thoại/, /^Mã căn/, /^Số giường/, /^Ngày thường/, /^Cuối tuần/]) {
      expect(screen.getByLabelText(n)).toBeInTheDocument();
    }
    expect(screen.getByText('Giá chủ báo qua điện thoại. Không bắt buộc. Dùng để điền sẵn khi đặt phòng.')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'ICON40' })).toBeInTheDocument();
    expect(nut('+ Tòa khác')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Thêm ảnh/ })).toBeInTheDocument();
  });

  it('YC10.3-NT1 thiếu ô bắt buộc: "Còn thiếu" đúng ô thiếu, nút "Thêm căn" chưa dùng được', () => {
    const { dv } = ve();
    expect(screen.getByRole('status')).toHaveTextContent('Còn thiếu: tên chủ nhà, số điện thoại, mã căn, số phòng ngủ');
    expect(nut('Thêm căn')).toBeDisabled();
    go(/^Tên chủ nhà/, 'Chú Bình');
    go(/^Mã căn/, '1509');
    expect(screen.getByRole('status')).toHaveTextContent('Còn thiếu: số điện thoại, số phòng ngủ');
    fireEvent.click(nut('Thêm căn'));
    expect(dv.tao).not.toHaveBeenCalled();
  });

  it('YC10.3-NT2 không giá chủ, không số giường vẫn thêm được; "Còn thiếu" không nhắc hai ô đó', async () => {
    const { dv, onXong } = ve();
    dienDu();
    expect(screen.queryByText(/Còn thiếu/)).toBeNull();
    expect(nut('Thêm căn')).toBeEnabled();
    fireEvent.click(nut('Thêm căn'));
    await waitFor(() => expect(onXong).toHaveBeenCalledWith('id-moi'));
    expect(dv.tao).toHaveBeenCalledWith(expect.objectContaining({
      tenChu: 'Chú Bình', soDienThoai: '0904123330', maCan: 'Villa Tuần Châu', soPhongNgu: 4,
      giaThuong: null, giaCuoiTuan: null, soGiuong: null, anh: [],
    }));
  });

  it('YC10.3-NT5 hàng chip Loại view đúng glossary: Biển, Thành phố, Núi; ghi chú số giường "2PN · 3 giường"', () => {
    ve();
    const hang = screen.getByRole('group', { name: 'Loại view' });
    expect(within(hang).getAllByRole('button').map((b) => b.textContent)).toEqual(['Biển', 'Thành phố', 'Núi']);
    expect(screen.getByText('Không bắt buộc. Thẻ căn ghi "2PN · 3 giường".')).toBeInTheDocument();
  });

  it('YC10.3 bước 3, 4: giá chủ có dấu chấm, gửi số nguyên đồng cùng tòa, view, số giường', async () => {
    const { dv } = ve();
    dienDu();
    fireEvent.click(await screen.findByRole('button', { name: 'ICON40' }));
    fireEvent.click(nut('Biển'));
    go(/^Số giường/, '3');
    go(/^Ngày thường/, '1400000');
    expect(screen.getByLabelText(/^Ngày thường/)).toHaveValue('1.400.000');
    fireEvent.click(nut('Thêm căn'));
    await waitFor(() => expect(dv.tao).toHaveBeenCalledWith(expect.objectContaining({
      toaNhaId: 't1', loaiView: 'bien', soGiuong: 3, giaThuong: 1_400_000, giaCuoiTuan: null,
    })));
  });

  it('YC10.3-NT10 database từ chối mã trùng: báo câu đó, giữ mọi ô', async () => {
    const { onXong } = ve({ tao: vi.fn(async () => { throw new LoiNguoiDung('Đã có căn tự nhập 1509 ở tòa này. Kiểm tra lại mã căn.'); }) });
    dienDu();
    fireEvent.click(nut('Thêm căn'));
    expect(await screen.findByRole('alert')).toHaveTextContent('Đã có căn tự nhập 1509 ở tòa này');
    expect(screen.getByLabelText(/^Mã căn/)).toHaveValue('Villa Tuần Châu');
    expect(onXong).not.toHaveBeenCalled();
  });

  it('YC10.3-NT4 đã chọn 12 ảnh thì không chọn thêm được ảnh thứ 13', async () => {
    const { dv } = ve();
    fireEvent.change(screen.getByTestId('o-chon-anh'), { target: { files: Array.from({ length: 13 }, (_, i) => anh(`a${i}.jpg`)) } });
    await waitFor(() => expect(within(screen.getByRole('list', { name: 'Ảnh căn' })).getAllByRole('listitem')
      .filter((li) => li.hasAttribute('data-tt'))).toHaveLength(12));
    expect(screen.getByRole('button', { name: /Thêm ảnh/ })).toBeDisabled();
    await waitFor(() => expect(dv.taiAnh).toHaveBeenCalledTimes(12));
  });
});

const DAU: ChiTietCanTuNhap = {
  canId: 'villa', maCan: 'Villa Tuần Châu', toaNhaId: null, tenToa: null, soPhongNgu: 4, soGiuong: null, loaiView: null,
  tenChu: 'Chú Bình', soDienThoai: '0904123330', giaThuong: 1_400_000, giaCuoiTuan: null, anh: [], datPhong: [],
};

describe('YC10.3 bước 12 · sửa căn tự nhập (S6-02 điền sẵn, GD23)', () => {
  it('YC10.3-NT8 xóa số chủ căn rồi lưu: gửi soDienThoai null, không nhắc thiếu số', async () => {
    const { dv, onXong } = ve({}, DAU);
    expect(screen.getByRole('heading', { name: 'Sửa thông tin căn' })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Ngày thường/)).toHaveValue('1.400.000');
    go(/^Số điện thoại/, '');
    expect(screen.queryByText(/Còn thiếu/)).toBeNull();
    fireEvent.click(nut('Lưu thay đổi'));
    await waitFor(() => expect(onXong).toHaveBeenCalledWith('villa'));
    expect(dv.sua).toHaveBeenCalledWith('villa', { soDienThoai: null });
  });

  it('YC10.3 bước 12 sửa giá chủ, số phòng ngủ: chỉ gửi ô đã đổi', async () => {
    const { dv } = ve({}, DAU);
    go(/^Ngày thường/, '1500000');
    fireEvent.click(nut('3PN'));
    fireEvent.click(nut('Lưu thay đổi'));
    await waitFor(() => expect(dv.sua).toHaveBeenCalledWith('villa', { giaThuong: 1_500_000, soPhongNgu: 3 }));
  });
});
