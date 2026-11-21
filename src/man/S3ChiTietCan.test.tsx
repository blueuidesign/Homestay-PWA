// Test unit màn S3 · Chi tiết căn của chủ nhà (YC7.4, HV5, US46). YC1.8-NT6 (sale mở căn của chủ nhà đã xóa tài khoản) kiểm ở test HV5-NT2.
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../chung/Toast';
import type { ChiTietCanSale, KetQuaChiTiet } from '../lib/chiTietCanSale';
import type { DichVuChiTietCanSale } from '../lib/dichVuChiTietCanSale';
import { S3ChiTietCan, VeLichSale } from './S3ChiTietCan';

afterEach(cleanup);

const lich = Array.from({ length: 14 }, (_, i) => {
  const ngay = new Date(Date.parse('2026-10-05T00:00:00Z') + i * 86_400_000).toISOString().slice(0, 10);
  return { ngay, o: ['2026-10-05', '2026-10-13', '2026-10-14'].includes(ngay) ? 'kin' as const : 'trong' as const };
});
const CT: ChiTietCanSale = {
  canId: 'c1509', maCan: '1509', tenToa: 'ICON40', khuVuc: 'Bãi Cháy', soPhongNgu: 2, soGiuong: 3, loaiView: 'bien',
  lichDoiLuc: new Date(Date.now() - 2 * 3_600_000).toISOString(), anh: ['https://kho/a.jpg', 'https://kho/b.jpg'],
  chu: { ten: 'Chị Hoa', soDienThoai: '0900000001', soCan: 2 }, gioNhan: '14:00', gioTra: '12:00',
  tu: '2026-10-10', den: '2026-10-12',
  dem: [{ ngay: '2026-10-10', giaChu: 1_300_000, giaBan: 1_500_000 }, { ngay: '2026-10-11', giaChu: 900_000, giaBan: 1_100_000 }],
  tongGiaChu: 2_200_000, tongGiaBan: 3_000_000, mucCong: 400_000, mucCongRieng: null, mucCongMacDinh: 400_000, lamTron50k: false, lich,
};

function dv(kq: KetQuaChiTiet = { khongConQuyen: false, ...CT }) {
  const d = { doc: vi.fn(async () => kq), datMuc: vi.fn(async () => undefined) };
  return d as DichVuChiTietCanSale & typeof d;
}

function ve(d = dv(), p: { khachHoi?: boolean; onVeLich?: () => void } = {}) {
  const onQuayLai = vi.fn();
  render(
    <ToastProvider>
      <S3ChiTietCan dv={d} canId="c1509" tenTam="ICON40 1509" tu="2026-10-10" den="2026-10-12" khachHoi={p.khachHoi ?? true}
                    homNay="2026-10-07" onQuayLai={onQuayLai} onVeLich={p.onVeLich} />
    </ToastProvider>,
  );
  return { d, onQuayLai };
}
const giaBan = () => screen.getByTestId('gia-ban').textContent;
const chip = (ten: string) => within(screen.getByRole('group', { name: 'Cộng thêm cho bạn' })).getByRole('button', { name: new RegExp(`^✓?${ten.replace('+', '\\+')}$`) });

describe('YC7.4 · S3 chi tiết căn', () => {
  it('YC7.4 bước 1 đến 3, 5, 6 ảnh "1/2", tên, chủ nhà, Gọi, giá chủ, lịch 2 tuần, giờ', async () => {
    const { d } = ve();
    expect(await screen.findByRole('heading', { name: 'ICON40 1509 · 2PN' })).toBeInTheDocument();
    expect(d.doc).toHaveBeenCalledWith('c1509', '2026-10-10', '2026-10-12');
    expect(screen.getByTestId('so-anh')).toHaveTextContent('1/2');
    expect(screen.getByText('✓ Lịch cập nhật 2 giờ trước')).toBeInTheDocument();
    expect(screen.getByText('Chị Hoa')).toBeInTheDocument();
    expect(screen.getByText('Chủ nhà · 2 căn')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Gọi' })).toHaveAttribute('href', 'tel:0900000001');
    expect(screen.getByTestId('khoang')).toHaveTextContent('10/10 → 12/10 (2 đêm)');
    expect(screen.getByTestId('gia-chu')).toHaveTextContent('Giá chủ nhà 2.200.000đ');
    expect(screen.getByText('Chỉ bạn thấy giá này. Khách và chủ nhà không thấy phần cộng thêm.')).toBeInTheDocument();
    const o = screen.getAllByRole('gridcell');
    expect(o).toHaveLength(14);
    expect(o.filter((x) => x.hasAttribute('data-khach-hoi')).map((x) => x.getAttribute('data-ngay'))).toEqual(['2026-10-10', '2026-10-11']);
    expect(o[8]).toHaveTextContent('13Kín');
    expect(screen.getByText('Ngày khách hỏi')).toBeInTheDocument();
    expect(screen.getByText('Nhận phòng 14:00 · Trả phòng 12:00')).toBeInTheDocument();
  });

  it('YC7.4-NT2 sale thấy cả giá chủ nhà và giá bán', async () => {
    ve();
    expect(await screen.findByTestId('gia-chu')).toHaveTextContent('2.200.000đ');
    expect(giaBan()).toBe('3.000.000đ');
  });

  it('YC7.4-NT1 chọn "+200k" thì giá bán đổi ngay thành 2.600.000đ và database ghi mức cộng', async () => {
    const { d } = ve();
    await screen.findByTestId('gia-ban');
    expect(chip('Mặc định +400k')).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(chip('+200k'));
    expect(giaBan()).toBe('2.600.000đ');
    expect(d.datMuc).toHaveBeenCalledWith('c1509', { loai: 'rieng', muc: 200_000 });
    await waitFor(() => expect(d.doc).toHaveBeenCalledTimes(2));
  });

  it('YC7.4-NT7 đã đặt "+200k" rồi chọn "Mặc định" thì giá bán 3.000.000đ và gửi lệnh bỏ mức riêng', async () => {
    const { d } = ve(dv({ khongConQuyen: false, ...CT, mucCongRieng: 200_000, mucCong: 200_000, tongGiaBan: 2_600_000 }));
    await screen.findByTestId('gia-ban');
    expect(giaBan()).toBe('2.600.000đ');
    expect(chip('+200k')).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(chip('Mặc định +400k'));
    expect(giaBan()).toBe('3.000.000đ');
    expect(d.datMuc).toHaveBeenCalledWith('c1509', { loai: 'mac-dinh' });
  });

  it('YC7.4 bước 4 "Tùy chọn" gõ mức cộng mỗi đêm', async () => {
    const { d } = ve();
    await screen.findByTestId('gia-ban');
    fireEvent.click(chip('Tùy chọn'));
    fireEvent.change(screen.getByLabelText('Mức cộng mỗi đêm'), { target: { value: '250000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Áp dụng' }));
    expect(giaBan()).toBe('2.700.000đ');
    expect(d.datMuc).toHaveBeenCalledWith('c1509', { loai: 'rieng', muc: 250_000 });
  });

  it('YC7.4 HV8 database từ chối thì về mức cũ và báo toast', async () => {
    const d = dv();
    d.datMuc.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    ve(d);
    await screen.findByTestId('gia-ban');
    await act(async () => { fireEvent.click(chip('+200k')); });
    expect(giaBan()).toBe('3.000.000đ');
    expect(screen.getByText(/Có lỗi|Chưa lưu được/)).toBeInTheDocument();
  });

  it('YC7.4-NT3 bấm "Gửi yêu cầu đặt phòng" mở S3-02 với đúng căn và ngày đang xem', async () => {
    ve();
    fireEvent.click(await screen.findByRole('button', { name: 'Gửi yêu cầu đặt phòng' }));
    const m = document.querySelector('[data-man="S3-02"]')!;
    expect(m).toHaveAttribute('data-can', 'c1509');
    expect(m).toHaveAttribute('data-tu', '2026-10-10');
    expect(m).toHaveAttribute('data-den', '2026-10-12');
    expect(screen.getByTestId('s302-can')).toHaveTextContent('ICON40 1509 · 2PN');
    expect(screen.getByTestId('s302-khoang')).toHaveTextContent('10/10 → 12/10 (2 đêm)');
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    expect(document.querySelector('[data-man="S3"]')).not.toBeNull();
  });

  it('YC7.4 bước 8 "Gửi cho khách" báo sẽ có ở bản sau', async () => {
    ve();
    fireEvent.click(await screen.findByRole('button', { name: 'Gửi cho khách' }));
    expect(screen.getByText('Gửi cho khách sẽ có ở bản sau')).toBeInTheDocument();
  });

  it('YC7.4-NT4 đã nhập số giường: "2PN · 3 giường"; không có "x khách", không có mục tiện ích', async () => {
    ve();
    expect(await screen.findByTestId('thong-tin')).toHaveTextContent(/^2PN · 3 giường · view biển · Bãi Cháy$/);
    expect(document.body.textContent).not.toMatch(/\d+ khách|Tiện ích/);
  });

  it('YC7.4-NT4 chưa nhập số giường thì chỉ "2PN"', async () => {
    ve(dv({ khongConQuyen: false, ...CT, soGiuong: null, loaiView: null, khuVuc: null }));
    expect(await screen.findByTestId('thong-tin')).toHaveTextContent(/^2PN$/);
  });

  it('YC7.4 bước 2 chủ nhà chưa cho số thì không có nút "Gọi"', async () => {
    ve(dv({ khongConQuyen: false, ...CT, chu: { ...CT.chu, soDienThoai: null } }));
    await screen.findByTestId('gia-ban');
    expect(screen.queryByRole('link', { name: 'Gọi' })).toBeNull();
  });

  it('YC7-H6 mở từ lịch 7 ngày: không tô "Ngày khách hỏi"', async () => {
    ve(undefined, { khachHoi: false });
    await screen.findByTestId('gia-ban');
    expect(screen.getAllByRole('gridcell').some((x) => x.hasAttribute('data-khach-hoi'))).toBe(false);
    expect(screen.queryByText('Ngày khách hỏi')).toBeNull();
  });

  it('HV5-NT1 bị ngừng: "Bạn không còn xem được mục này" với lý do, không giá, lịch, ảnh; "Về Lịch"', async () => {
    const onVeLich = vi.fn();
    ve(dv({ khongConQuyen: true, lyDo: 'Chủ nhà đã ngừng chia sẻ lịch' }), { onVeLich });
    expect(await screen.findByText('Bạn không còn xem được mục này')).toBeInTheDocument();
    expect(screen.getByText('Chủ nhà đã ngừng chia sẻ lịch')).toBeInTheDocument();
    expect(screen.queryByTestId('gia-ban')).toBeNull();
    expect(screen.queryAllByRole('gridcell')).toHaveLength(0);
    expect(document.querySelector('img')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Về Lịch' }));
    expect(onVeLich).toHaveBeenCalled();
  });

  it('HV5-NT2 YC1.8-NT6 chủ nhà đã xóa tài khoản: lý do "Chủ nhà đã xóa tài khoản"; "Về Lịch" theo khung tab', async () => {
    const veLich = vi.fn();
    const d = dv({ khongConQuyen: true, lyDo: 'Chủ nhà đã xóa tài khoản' });
    render(
      <ToastProvider><VeLichSale.Provider value={veLich}>
        <S3ChiTietCan dv={d} canId="c1509" tenTam="ICON40 1509" tu="2026-10-10" den="2026-10-12" khachHoi homNay="2026-10-07" onQuayLai={vi.fn()} />
      </VeLichSale.Provider></ToastProvider>,
    );
    expect(await screen.findByText('Chủ nhà đã xóa tài khoản')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Về Lịch' }));
    expect(veLich).toHaveBeenCalled();
  });

  it('HV5 bước 2 đang xem thì bị thu hồi quyền: lần đọc lại khi quay lại từ nền đổi sang màn HV5', async () => {
    const d = dv();
    ve(d);
    await screen.findByTestId('gia-ban');
    d.doc.mockResolvedValue({ khongConQuyen: true, lyDo: 'Chủ nhà đã ngừng chia sẻ lịch' });
    await act(async () => { document.dispatchEvent(new Event('visibilitychange')); });
    expect(await screen.findByText('Bạn không còn xem được mục này')).toBeInTheDocument();
    expect(screen.queryByTestId('gia-ban')).toBeNull();
  });

  it('YC7.4 HV1 HV2 đang tải khung xám; không đọc được thì "Thử lại"', async () => {
    const d = dv();
    d.doc.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    ve(d);
    expect(screen.getByLabelText('Đang tải')).toBeInTheDocument();
    fireEvent.click(await screen.findByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByTestId('gia-ban')).toBeInTheDocument();
  });
});
