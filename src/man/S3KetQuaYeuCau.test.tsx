// Test unit màn S3-04, S3-04-01, S3-05, S3-09 · Sale nhận kết quả yêu cầu (YC9.4, US53), HV3-NT3.
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { ToastProvider } from '../chung/Toast';
import type { ChiTietCanSale } from '../lib/chiTietCanSale';
import type { DichVuChiTietCanSale } from '../lib/dichVuChiTietCanSale';
import type { DichVuYeuCau } from '../lib/dichVuYeuCau';
import type { CanTuongTu, KetQuaYeuCau } from '../lib/ketQuaYeuCau';
import type { YeuCauCuaToi } from '../lib/yeuCau';
import { S3GuiYeuCau } from './S3GuiYeuCau';
import { MoCanTuongTu, S3KetQuaYeuCau } from './S3KetQuaYeuCau';

afterEach(cleanup);

const Y1: YeuCauCuaToi = {
  id: 'y1', canId: 'c1509', maCan: '1509', tenToa: 'ICON40', soPhongNgu: 2,
  chu: { ten: 'Chị Hoa', soDienThoai: null, daXoa: false }, ngayNhan: '2026-10-10', ngayTra: '2026-10-12',
  tongGiaChu: 2_200_000, tongGiaBan: 2_600_000, loiNhan: null, trangThai: 'cho', guiLuc: '2026-09-22T07:20:00+00:00',
};
const KQ = (p: Partial<KetQuaYeuCau>): KetQuaYeuCau => ({ ...Y1, lyDoTuChoi: null, hetHanVi: null, conXemCan: true, ...p });

const TUONG_TU: CanTuongTu[] = [
  { canId: 'c1103', maCan: '1103', tenToa: 'Sapphire', soPhongNgu: 3, tenChu: 'Anh Tuấn', tongGiaBan: 1_600_000, tu: '2026-10-10', den: '2026-10-12' },
  { canId: 'c2208', maCan: '2208', tenToa: 'À La Carte', soPhongNgu: 1, tenChu: 'Anh Tuấn', tongGiaBan: 3_600_000, tu: '2026-10-10', den: '2026-10-12' },
];

function dvYc(kq: KetQuaYeuCau) {
  const d = {
    gui: vi.fn(async () => Y1),
    doc: vi.fn(async () => kq as YeuCauCuaToi),
    huy: vi.fn(async () => ({ ...Y1, trangThai: 'da_huy' as const })),
    ketQua: vi.fn(async () => kq),
    canTuongTu: vi.fn(async () => TUONG_TU),
  };
  return d as DichVuYeuCau & typeof d;
}

function ve(d: DichVuYeuCau, p: { tuThongBao?: boolean; moCan?: (c: CanTuongTu) => void } = {}) {
  const onQuayLai = vi.fn();
  const onVeLich = vi.fn();
  const onXemTatCa = vi.fn();
  render(
    <MoCanTuongTu.Provider value={p.moCan}>
      <S3KetQuaYeuCau id="y1" dv={d} tuThongBao={p.tuThongBao} onQuayLai={onQuayLai} onVeLich={onVeLich} onXemTatCa={onXemTatCa} />
    </MoCanTuongTu.Provider>,
  );
  return { onQuayLai, onVeLich, onXemTatCa };
}
const man = () => document.querySelector('[data-man]')?.getAttribute('data-man');

describe('YC9.4 · S3-04 chủ nhà đã chấp nhận', () => {
  it('YC9.4-NT1 S3-04: "Chị Hoa đã chấp nhận đặt phòng", 10/10 → 12/10 hiện Kín với các sale khác, "Về lịch phòng"', async () => {
    const d = dvYc(KQ({ trangThai: 'da_chot' }));
    const { onVeLich } = ve(d);
    await waitFor(() => expect(man()).toBe('S3-04'));
    expect(screen.getByRole('heading', { name: 'ICON40 1509 · 2PN' })).toBeInTheDocument();
    expect(screen.getByText('Chị Hoa đã chấp nhận đặt phòng')).toBeInTheDocument();
    expect(screen.getByText('Đặt phòng đã vào lịch của chủ nhà. Ngày 10/10 → 12/10 hiện Kín với các sale khác.')).toBeInTheDocument();
    expect(screen.getByTestId('kq-khoang')).toHaveTextContent('10/10 → 12/10 (2 đêm)');
    expect(screen.getByTestId('kq-gia-ban')).toHaveTextContent('Giá bán cho khách2.600.000đ');
    expect(screen.getByTestId('kq-gia-chu')).toHaveTextContent('Giá chủ nhà2.200.000đ');
    expect(d.canTuongTu).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Về lịch phòng' }));
    expect(onVeLich).toHaveBeenCalled();
  });

  it('YC9.4-NT1 S3-04-01 mở từ thông báo: quay lại về Thông báo', async () => {
    const { onQuayLai } = ve(dvYc(KQ({ trangThai: 'da_chot' })), { tuThongBao: true });
    await waitFor(() => expect(man()).toBe('S3-04-01'));
    fireEvent.click(screen.getByRole('button', { name: 'Về Thông báo' }));
    expect(onQuayLai).toHaveBeenCalled();
  });
});

describe('YC9.4 · S3-05 bị từ chối, S3-09 hết hạn', () => {
  it('YC9.4-NT2 S3-05: lý do và danh sách căn tương tự trống cùng ngày', async () => {
    const d = dvYc(KQ({ trangThai: 'bi_tu_choi', lyDoTuChoi: 'Đã có khách đặt' }));
    const { onXemTatCa } = ve(d);
    await waitFor(() => expect(man()).toBe('S3-05'));
    expect(screen.getByText('Yêu cầu bị từ chối')).toBeInTheDocument();
    expect(screen.getByTestId('kq-ly-do')).toHaveTextContent('Lý do: Chị Hoa không nhận đặt phòng · Đã có khách đặt.');
    expect(screen.getByRole('heading', { name: 'Căn tương tự trống cùng ngày' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByTestId('can-tuong-tu')).toHaveLength(2));
    expect(d.canTuongTu).toHaveBeenCalledWith('y1');
    fireEvent.click(screen.getByRole('button', { name: 'Xem tất cả căn trống' }));
    expect(onXemTatCa).toHaveBeenCalledWith('2026-10-10', '2026-10-12');
  });

  it('YC9.4-NT3 bị từ chối vì nhận đặt phòng khác: "Chị Hoa đã nhận đặt phòng khác cho 10/10 → 12/10."', async () => {
    ve(dvYc(KQ({ trangThai: 'bi_tu_choi', lyDoTuChoi: 'Đã nhận đặt phòng khác' })));
    await waitFor(() => expect(man()).toBe('S3-05'));
    expect(screen.getByTestId('kq-ly-do')).toHaveTextContent('Chị Hoa đã nhận đặt phòng khác cho 10/10 → 12/10.');
  });

  it('YC9.4-NT4 S3-09: "Yêu cầu đã hết hạn vì Chị Hoa chưa trả lời trong 2 tuần. Gửi lúc 14:20 ngày 22/09."', async () => {
    ve(dvYc(KQ({ trangThai: 'het_han', hetHanVi: 'qua_14_ngay' })));
    await waitFor(() => expect(man()).toBe('S3-09'));
    expect(screen.getByText('Yêu cầu đã hết hạn')).toBeInTheDocument();
    expect(screen.getByTestId('kq-ly-do'))
      .toHaveTextContent('Yêu cầu đã hết hạn vì Chị Hoa chưa trả lời trong 2 tuần. Gửi lúc 14:20 ngày 22/09.');
    await waitFor(() => expect(screen.getAllByTestId('can-tuong-tu')).toHaveLength(2));
  });

  it('YC9.4-NT8 hết hạn vì qua ngày nhận 10/10: S3-09 "Yêu cầu đã hết hạn vì đã qua ngày nhận phòng 10/10."', async () => {
    ve(dvYc(KQ({ trangThai: 'het_han', hetHanVi: 'qua_ngay_nhan', guiLuc: '2026-10-06T07:20:00+00:00' })));
    await waitFor(() => expect(man()).toBe('S3-09'));
    expect(screen.getByTestId('kq-ly-do'))
      .toHaveTextContent('Yêu cầu đã hết hạn vì đã qua ngày nhận phòng 10/10. Gửi lúc 14:20 ngày 06/10.');
  });

  it('YC9.4-NT5 mỗi căn tương tự ghi giá bán của sale, không giá chủ nhà; chạm một căn mở S3 của căn đó', async () => {
    const moCan = vi.fn();
    ve(dvYc(KQ({ trangThai: 'bi_tu_choi', lyDoTuChoi: 'Đã có khách đặt' })), { moCan });
    await waitFor(() => expect(screen.getAllByTestId('can-tuong-tu')).toHaveLength(2));
    const [a, b] = screen.getAllByTestId('can-tuong-tu');
    expect(a).toHaveTextContent('Sapphire 1103 · 3PN');
    expect(a).toHaveTextContent('Bạn bán 1.600.000đ · Anh Tuấn');
    expect(b).toHaveTextContent('À La Carte 2208 · 1PN');
    expect(b).toHaveTextContent('Bạn bán 3.600.000đ · Anh Tuấn');
    expect(a).not.toHaveTextContent('Giá chủ');
    fireEvent.click(screen.getByRole('button', { name: /Sapphire 1103/ }));
    expect(moCan).toHaveBeenCalledWith(TUONG_TU[0]);
  });
});

describe('YC9.4 · trạng thái màn', () => {
  it('YC9.4 HV1 đang tải thì có khung xám; HV2 lỗi mạng thì "Thử lại" đọc lại', async () => {
    const d = dvYc(KQ({ trangThai: 'da_chot' }));
    d.ketQua.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    ve(d);
    expect(screen.getByLabelText('Đang tải')).toBeInTheDocument();
    const thuLai = await screen.findByRole('button', { name: 'Thử lại' });
    await act(async () => { fireEvent.click(thuLai); });
    await waitFor(() => expect(man()).toBe('S3-04'));
  });

  it('YC9.4 HV5 yêu cầu không còn đọc được: "Không tìm thấy yêu cầu"', async () => {
    const d = dvYc(KQ({}));
    d.ketQua.mockRejectedValue(new LoiNguoiDung('Không tìm thấy yêu cầu'));
    ve(d);
    expect(await screen.findByText('Không tìm thấy yêu cầu')).toBeInTheDocument();
  });

  it('HV3-NT3 sale quay lại app sau khi chủ nhà vừa chấp nhận: S3-03 sang S3-04 mà không phải tải lại', async () => {
    const d = dvYc(KQ({ trangThai: 'da_chot' }));
    const ct = {
      canId: 'c1509', maCan: '1509', tenToa: 'ICON40', khuVuc: null, soPhongNgu: 2, soGiuong: 3, loaiView: null, lichDoiLuc: null,
      anh: [], chu: { ten: 'Chị Hoa', soDienThoai: null, soCan: 1 }, gioNhan: '14:00', gioTra: '12:00', tu: '2026-10-10', den: '2026-10-12',
      dem: [], tongGiaChu: 2_200_000, tongGiaBan: 2_600_000, mucCong: 200_000, mucCongRieng: 200_000, mucCongMacDinh: 400_000,
      lamTron50k: false, lich: [],
    } as ChiTietCanSale;
    render(
      <ToastProvider>
        <S3GuiYeuCau ct={ct} dv={d} dvCt={{ doc: vi.fn(), datMuc: vi.fn() } as unknown as DichVuChiTietCanSale}
                     onQuayLai={vi.fn()} onVeLich={vi.fn()} onTimCanKhac={vi.fn()} />
      </ToastProvider>,
    );
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Gửi yêu cầu đặt phòng' })); });
    expect(man()).toBe('S3-03');
    d.doc.mockResolvedValueOnce({ ...Y1, trangThai: 'da_chot' });
    await act(async () => { document.dispatchEvent(new Event('visibilitychange')); });
    await waitFor(() => expect(man()).toBe('S3-04'));
    expect(screen.getByText('Chị Hoa đã chấp nhận đặt phòng')).toBeInTheDocument();
  });
});
