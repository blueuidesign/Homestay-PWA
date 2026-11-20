// Test unit màn S3-02, S3-03, S3-07, S3-08 · Sale gửi và hủy yêu cầu đặt phòng (YC9.1, US50).
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { ToastProvider } from '../chung/Toast';
import type { ChiTietCanSale, KetQuaChiTiet } from '../lib/chiTietCanSale';
import type { DichVuChiTietCanSale } from '../lib/dichVuChiTietCanSale';
import { LoiDaDat, type DichVuYeuCau } from '../lib/dichVuYeuCau';
import type { YeuCauCuaToi } from '../lib/yeuCau';
import { S3GuiYeuCau } from './S3GuiYeuCau';

afterEach(cleanup);

const CT: ChiTietCanSale = {
  canId: 'c1509', maCan: '1509', tenToa: 'ICON40', khuVuc: 'Bãi Cháy', soPhongNgu: 2, soGiuong: 3, loaiView: 'bien',
  lichDoiLuc: null, anh: [], chu: { ten: 'Chị Hoa', soDienThoai: '0900000001', soCan: 2 }, gioNhan: '14:00', gioTra: '12:00',
  tu: '2026-10-10', den: '2026-10-12',
  dem: [{ ngay: '2026-10-10', giaChu: 1_300_000, giaBan: 1_500_000 }, { ngay: '2026-10-11', giaChu: 900_000, giaBan: 1_100_000 }],
  tongGiaChu: 2_200_000, tongGiaBan: 2_600_000, mucCong: 200_000, mucCongRieng: 200_000, mucCongMacDinh: 400_000, lamTron50k: false,
  lich: [],
};

const Y1: YeuCauCuaToi = {
  id: 'y1', canId: 'c1509', maCan: '1509', tenToa: 'ICON40', soPhongNgu: 2,
  chu: { ten: 'Chị Hoa', soDienThoai: '0900000001', daXoa: false }, ngayNhan: '2026-10-10', ngayTra: '2026-10-12',
  tongGiaChu: 2_200_000, tongGiaBan: 2_600_000, loiNhan: 'Khách tới muộn', trangThai: 'cho', guiLuc: '2026-10-06T07:20:00+00:00',
};

// Lịch tải lại sau khi bị chặn: 14 ngày từ thứ Hai 05/10, đêm 10/10, 11/10 kín; giá chủ các đêm 09/10 tới 12/10.
const LICH_MOI: KetQuaChiTiet = {
  khongConQuyen: false, ...CT, tu: '2026-10-09', den: '2026-10-13',
  dem: [
    { ngay: '2026-10-09', giaChu: 1_300_000, giaBan: 1_500_000 }, { ngay: '2026-10-10', giaChu: 1_300_000, giaBan: 1_500_000 },
    { ngay: '2026-10-11', giaChu: 900_000, giaBan: 1_100_000 }, { ngay: '2026-10-12', giaChu: 900_000, giaBan: 1_100_000 },
  ],
  lich: Array.from({ length: 14 }, (_, i) => {
    const ngay = new Date(Date.parse('2026-10-05T00:00:00Z') + i * 86_400_000).toISOString().slice(0, 10);
    return { ngay, o: ['2026-10-10', '2026-10-11'].includes(ngay) ? 'kin' as const : 'trong' as const };
  }),
};

function dvYc(y: YeuCauCuaToi = Y1) {
  const d = {
    gui: vi.fn(async () => y),
    doc: vi.fn(async () => y),
    huy: vi.fn(async () => ({ ...y, trangThai: 'da_huy' as const })),
  };
  return d as DichVuYeuCau & typeof d;
}

function ve(d = dvYc(), p: { ct?: ChiTietCanSale } = {}) {
  const dvCt = { doc: vi.fn(async () => LICH_MOI), datMuc: vi.fn(async () => undefined) };
  const onQuayLai = vi.fn();
  const onVeLich = vi.fn();
  const onTimCanKhac = vi.fn();
  render(
    <ToastProvider>
      <S3GuiYeuCau ct={p.ct ?? CT} dv={d} dvCt={dvCt as DichVuChiTietCanSale} onQuayLai={onQuayLai} onVeLich={onVeLich}
                   onTimCanKhac={onTimCanKhac} />
    </ToastProvider>,
  );
  return { d, dvCt, onQuayLai, onVeLich, onTimCanKhac };
}
const man = () => document.querySelector('[data-man]')?.getAttribute('data-man');
const nutGui = () => screen.getByRole('button', { name: 'Gửi yêu cầu đặt phòng' });

describe('YC9.1 · S3-02 gửi yêu cầu', () => {
  it('YC9.1-NT3 S3-02 thấy cả giá bán cho khách và giá chủ nhà', () => {
    ve();
    expect(man()).toBe('S3-02');
    expect(screen.getByRole('heading', { name: 'Gửi yêu cầu đặt phòng' })).toBeInTheDocument();
    expect(screen.getByTestId('s302-can')).toHaveTextContent('ICON40 1509 · 2PN');
    expect(screen.getByTestId('dong-chu')).toHaveTextContent('Chị Hoa · 10/10 → 12/10 (2 đêm)');
    expect(screen.getByTestId('s302-khoang')).toHaveTextContent('10/10 → 12/10 (2 đêm)');
    expect(screen.getByTestId('gia-ban-yc')).toHaveTextContent('Giá bán cho khách2.600.000đ');
    expect(screen.getByTestId('gia-chu-yc')).toHaveTextContent('Giá chủ nhà2.200.000đ');
    expect(screen.getByText('ICON40 1509 · 10/10 → 12/10')).toBeInTheDocument();
    expect(screen.getByText('Chủ nhà: Chị Hoa · 2.200.000đ')).toBeInTheDocument();
    expect(screen.getByLabelText('Nhắn chủ nhà (không bắt buộc)')).toBeInTheDocument();
    expect(screen.getByText('Chủ nhà nhận yêu cầu trong app. Thành đặt phòng khi chủ nhà chấp nhận.')).toBeInTheDocument();
  });

  it('YC9.1-NT1 bấm gửi thì sang S3-03 và ghi giờ đã gửi; gửi lại dùng cùng mã lần gửi (QT5.6)', async () => {
    const { d } = ve();
    fireEvent.change(screen.getByLabelText('Nhắn chủ nhà (không bắt buộc)'), { target: { value: 'Khách tới muộn' } });
    await act(async () => { fireEvent.click(nutGui()); });
    expect(d.gui).toHaveBeenCalledWith(expect.objectContaining({ canId: 'c1509', tu: '2026-10-10', den: '2026-10-12', loiNhan: 'Khách tới muộn' }));
    expect(man()).toBe('S3-03');
    expect(screen.getByText('Đang chờ Chị Hoa chấp nhận')).toBeInTheDocument();
    expect(screen.getByText(/^Đã gửi lúc 14:20 trong app\. Nhắn thêm qua Zalo/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Nhắn chủ nhà qua Zalo' })).toHaveAttribute('href', 'https://zalo.me/0900000001');
    expect(screen.getByRole('link', { name: 'Gọi chủ nhà' })).toHaveAttribute('href', 'tel:0900000001');
    expect(screen.getByTestId('gia-ban-yc')).toHaveTextContent('2.600.000đ');
  });

  it('YC9.1-NT1 QT5.6 lỗi mạng rồi bấm lại: cùng mã lần gửi', async () => {
    const d = dvYc();
    d.gui.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    ve(d);
    await act(async () => { fireEvent.click(nutGui()); });
    expect(man()).toBe('S3-02');
    await act(async () => { fireEvent.click(nutGui()); });
    const [a, b] = d.gui.mock.calls.map((c) => (c as unknown as [{ clientId: string }])[0].clientId);
    expect(a).toBeTruthy();
    expect(a).toBe(b);
    expect(man()).toBe('S3-03');
  });

  it('YC9-H8 chủ nhà đã xóa tài khoản: ẩn nút Zalo và Gọi', async () => {
    ve(dvYc({ ...Y1, chu: { ten: 'Chị Hoa', soDienThoai: null, daXoa: true } }));
    await act(async () => { fireEvent.click(nutGui()); });
    expect(screen.queryByRole('link', { name: 'Nhắn chủ nhà qua Zalo' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Gọi chủ nhà' })).toBeNull();
  });

  it('YC9.1-NT5 đêm vừa có người đặt: S3-07 "Căn này đã được đặt rồi", lịch tải lại với đêm Kín', async () => {
    const d = dvYc();
    d.gui.mockRejectedValueOnce(new LoiDaDat(['2026-10-10', '2026-10-11']));
    const { dvCt, onTimCanKhac } = ve(d);
    await act(async () => { fireEvent.click(nutGui()); });
    expect(man()).toBe('S3-07');
    expect(screen.getByText('Căn này đã được đặt rồi')).toBeInTheDocument();
    expect(screen.getByText(/Đêm 10\/10 và 11\/10 vừa có người đặt\. Yêu cầu chưa được gửi\./)).toBeInTheDocument();
    expect(dvCt.doc).toHaveBeenCalledWith('c1509', '2026-10-09', '2026-10-13');
    await waitFor(() => expect(screen.getAllByTestId('o-moi')).toHaveLength(4));
    expect(screen.getAllByTestId('o-moi').map((o) => o.textContent)).toEqual(['T6091,3tr', 'T710Kín', 'CN11Kín', 'T212900k']);
    expect(screen.queryByText('Đang chờ Chị Hoa chấp nhận')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Tìm căn khác cùng ngày' }));
    expect(onTimCanKhac).toHaveBeenCalledWith('2026-10-10', '2026-10-12');
  });

  it('YC9.1-NT12 căn chưa có giá một đêm: báo câu của database, không sang S3-03', async () => {
    const cau = 'Căn chưa có giá cho đêm 11/10. Nhắn chủ nhà để hỏi giá.';
    const d = dvYc();
    d.gui.mockRejectedValueOnce(new LoiNguoiDung(cau));
    ve(d);
    await act(async () => { fireEvent.click(nutGui()); });
    expect(man()).toBe('S3-02');
    expect(screen.getByRole('alert')).toHaveTextContent(cau);
  });

  it('YC9.1 Luật kiểm lời nhắn quá 500 ký tự: báo, không gửi', async () => {
    const { d } = ve();
    fireEvent.change(screen.getByLabelText('Nhắn chủ nhà (không bắt buộc)'), { target: { value: 'a'.repeat(501) } });
    await act(async () => { fireEvent.click(nutGui()); });
    expect(d.gui).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Lời nhắn tối đa 500 ký tự');
  });

  it('YC9.1-NT7 bấm "Hủy yêu cầu" hai lần thì sang S3-08 "Đã hủy yêu cầu"', async () => {
    const { d, onVeLich } = ve();
    await act(async () => { fireEvent.click(nutGui()); });
    fireEvent.click(screen.getByRole('button', { name: 'Hủy yêu cầu' }));
    expect(d.huy).not.toHaveBeenCalled();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Xác nhận hủy yêu cầu?' })); });
    expect(d.huy).toHaveBeenCalledWith('y1');
    expect(man()).toBe('S3-08');
    expect(screen.getByText('Đã hủy yêu cầu')).toBeInTheDocument();
    expect(screen.getByText('Bạn đã hủy yêu cầu đặt phòng 10/10 → 12/10. Chị Hoa không còn thấy yêu cầu này.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Về lịch phòng' }));
    expect(onVeLich).toHaveBeenCalled();
  });

  it('YC9 Trạng thái màn: hủy khi yêu cầu vừa đổi ở máy khác thì báo và đọc lại', async () => {
    const d = dvYc();
    d.huy.mockRejectedValueOnce(new LoiNguoiDung('Yêu cầu đã đổi trạng thái'));
    d.doc.mockResolvedValueOnce({ ...Y1, trangThai: 'het_han' });
    ve(d);
    await act(async () => { fireEvent.click(nutGui()); });
    fireEvent.click(screen.getByRole('button', { name: 'Hủy yêu cầu' }));
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Xác nhận hủy yêu cầu?' })); });
    expect(screen.getByText('Yêu cầu đã đổi trạng thái')).toBeInTheDocument();
    expect(d.doc).toHaveBeenCalledWith('y1');
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Hủy yêu cầu' })).toBeNull());
  });

  it('YC7.4-NT3 "Quay lại" ở S3-02 về S3', () => {
    const { onQuayLai } = ve();
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    expect(onQuayLai).toHaveBeenCalled();
  });
});
