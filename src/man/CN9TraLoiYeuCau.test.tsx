// Test unit màn CN9, CN9-02, CN9-03 · Chủ nhà trả lời yêu cầu đặt phòng (YC9.2, US51).
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { ToastProvider } from '../chung/Toast';
import type { DichVuTraLoiYeuCau } from '../lib/dichVuTraLoiYeuCau';
import type { YeuCauChoChu } from '../lib/traLoiYeuCau';
import { CN9TraLoiYeuCau } from './CN9TraLoiYeuCau';

afterEach(cleanup);

const Y1: YeuCauChoChu = {
  id: 'y1', canId: 'c1509', maCan: '1509', tenToa: 'ICON40', saleId: 'hung', tenSale: 'Sale Hùng', sdtSale: '0912345678',
  soDatPhong: 12, conKetNoi: true, ngayNhan: '2026-10-10', ngayTra: '2026-10-12', tongGiaChu: 2_200_000,
  loiNhan: 'Khách gia đình 4 người, xin nhận phòng sớm 12:00 được không ạ?', trangThai: 'cho', lyDoTuChoi: null,
  guiLuc: '2026-10-06T07:20:00Z', bookingId: null, trungVoi: [],
};

function dichVu(y: YeuCauChoChu = Y1) {
  const d = {
    layDangCho: vi.fn(async () => []),
    doc: vi.fn(async () => y),
    chapNhan: vi.fn(async () => ({ y: { ...y, trangThai: 'da_chot' as const, bookingId: 'b1' }, doiTrangThai: false })),
    tuChoi: vi.fn(async (_id: string, lyDo: string | null) => ({ y: { ...y, trangThai: 'bi_tu_choi' as const, lyDoTuChoi: lyDo }, doiTrangThai: false })),
  };
  return d as DichVuTraLoiYeuCau & typeof d;
}

function ve(dv = dichVu(), id = 'y1') {
  const onVeLich = vi.fn();
  const onXemDatPhong = vi.fn();
  const onQuayLai = vi.fn();
  render(<ToastProvider><CN9TraLoiYeuCau id={id} dv={dv} onVeLich={onVeLich} onXemDatPhong={onXemDatPhong} onQuayLai={onQuayLai} /></ToastProvider>);
  return { dv, onVeLich, onXemDatPhong, onQuayLai };
}

describe('YC9.2 · CN9 Yêu cầu đặt phòng', () => {
  it('YC9.2-NT1 mở đúng yêu cầu được chọn', async () => {
    const { dv } = ve(dichVu(), 'y7');
    await screen.findByText('Sale Hùng');
    expect(dv.doc).toHaveBeenCalledWith('y7');
  });

  it('YC9.2-NT2 CN9 có tên sale, Gọi, Phòng, Ngày ở, "Giá của bạn 2.200.000đ", Sale nhắn; không có giá bán', async () => {
    ve();
    const man = await screen.findByTestId('cn9');
    expect(man).toHaveAttribute('data-man', 'CN9');
    expect(screen.getByText('Sale Hùng')).toBeInTheDocument();
    expect(screen.getByText('0912 345 678 · đã bán 12 đặt phòng của bạn')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Gọi/ })).toHaveAttribute('href', 'tel:0912345678');
    expect(within(screen.getByTestId('cn9-phong')).getByText('1509')).toBeInTheDocument();
    expect(within(screen.getByTestId('cn9-ngay')).getByText('10/10 → 12/10 (2 đêm)')).toBeInTheDocument();
    expect(within(screen.getByTestId('cn9-gia')).getByText('Giá của bạn')).toBeInTheDocument();
    expect(within(screen.getByTestId('cn9-gia')).getByText('2.200.000đ')).toBeInTheDocument();
    expect(screen.getByText('Sale nhắn')).toBeInTheDocument();
    expect(screen.getByText(Y1.loiNhan!)).toBeInTheDocument();
    expect(man.textContent).not.toMatch(/Giá bán|2\.600\.000|Mức cộng|Tiền chênh/);
    expect(screen.getByRole('button', { name: 'Chấp nhận đặt phòng' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Từ chối' })).toBeInTheDocument();
  });

  it('YC9.2 bước 3 chấp nhận: CN9-02 "Đã nhận đặt phòng 1509", "Xem đặt phòng" mở đặt phòng vừa tạo, "Về lịch"', async () => {
    const { dv, onXemDatPhong, onVeLich } = ve();
    const nutChap = await screen.findByRole('button', { name: 'Chấp nhận đặt phòng' });
    await act(async () => { fireEvent.click(nutChap); });
    expect(dv.chapNhan).toHaveBeenCalledWith('y1');
    expect(screen.getByTestId('cn9')).toHaveAttribute('data-man', 'CN9-02');
    expect(screen.getByText('✓ Đã nhận đặt phòng 1509')).toBeInTheDocument();
    expect(screen.getByText('Đặt phòng đã vào lịch. Sale Hùng được báo.')).toBeInTheDocument();
    expect(within(screen.getByTestId('cn9-sale')).getByText('Sale Hùng')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Xem đặt phòng' }));
    expect(onXemDatPhong).toHaveBeenCalledWith('b1');
    fireEvent.click(screen.getByRole('button', { name: 'Về lịch' }));
    expect(onVeLich).toHaveBeenCalled();
  });

  it('YC9.2-NT4 Từ chối, chọn "Đã có khách đặt", gửi: sang CN9-03 kèm lý do', async () => {
    const { dv } = ve();
    fireEvent.click(await screen.findByRole('button', { name: 'Từ chối' }));
    const chip = ['Đã có khách đặt', 'Đang sửa phòng', 'Lý do khác'].map((t) => screen.getByRole('button', { name: t }));
    expect(chip).toHaveLength(3);
    expect(screen.queryByRole('textbox')).toBeNull(); // "Lý do khác" không có ô nhập chữ
    fireEvent.click(chip[0]!);
    expect(chip[0]).toHaveAttribute('aria-pressed', 'true');
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Gửi từ chối cho sale' })); });
    expect(dv.tuChoi).toHaveBeenCalledWith('y1', 'Đã có khách đặt');
    expect(screen.getByTestId('cn9')).toHaveAttribute('data-man', 'CN9-03');
    expect(screen.getByText('Đã từ chối yêu cầu của Sale Hùng')).toBeInTheDocument();
    expect(screen.getByText('Sale Hùng được báo kèm lý do "Đã có khách đặt". Ngày 10/10 → 12/10 vẫn trống trong lịch.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Về lịch' })).toBeInTheDocument();
  });

  it('YC9.2-NT11 gửi từ chối không chọn lý do: vẫn từ chối, lý do null', async () => {
    const { dv } = ve();
    fireEvent.click(await screen.findByRole('button', { name: 'Từ chối' }));
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Gửi từ chối cho sale' })); });
    expect(dv.tuChoi).toHaveBeenCalledWith('y1', null);
    expect(screen.getByTestId('cn9')).toHaveAttribute('data-man', 'CN9-03');
    expect(screen.getByText('Sale Hùng được báo. Ngày 10/10 → 12/10 vẫn trống trong lịch.')).toBeInTheDocument();
  });

  it('YC9.2 bước 4 "Quay lại" ở bước chọn lý do về CN9, bỏ chip đã chọn', async () => {
    ve();
    fireEvent.click(await screen.findByRole('button', { name: 'Từ chối' }));
    fireEvent.click(screen.getByRole('button', { name: 'Đang sửa phòng' }));
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    expect(screen.getByRole('button', { name: 'Chấp nhận đặt phòng' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Đang sửa phòng' })).toBeNull();
  });

  it('YC9.2-NT5 HV3 chấp nhận yêu cầu sale vừa hủy: báo "Yêu cầu đã đổi trạng thái", hiện trạng thái mới', async () => {
    const dv = dichVu();
    dv.chapNhan.mockResolvedValueOnce({ y: { ...Y1, trangThai: 'da_huy' as const }, doiTrangThai: true } as never);
    ve(dv);
    const nutChap = await screen.findByRole('button', { name: 'Chấp nhận đặt phòng' });
    await act(async () => { fireEvent.click(nutChap); });
    expect((await screen.findAllByText('Yêu cầu đã đổi trạng thái')).length).toBeGreaterThan(0);
    expect(screen.getByText('Sale đã hủy yêu cầu này.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Chấp nhận đặt phòng' })).toBeNull();
  });

  it('YC9.2-NT9 sale không còn kết nối: báo câu của database, vẫn từ chối được', async () => {
    const dv = dichVu();
    dv.chapNhan.mockRejectedValueOnce(new LoiNguoiDung('Sale này không còn kết nối với bạn, không nhận được đặt phòng.'));
    ve(dv);
    const nutChap = await screen.findByRole('button', { name: 'Chấp nhận đặt phòng' });
    await act(async () => { fireEvent.click(nutChap); });
    expect(screen.getAllByText('Sale này không còn kết nối với bạn, không nhận được đặt phòng.').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Từ chối' })).toBeInTheDocument();
  });

  it('YC9.2-NT10 yêu cầu hết hạn: không có nút chấp nhận', async () => {
    ve(dichVu({ ...Y1, trangThai: 'het_han' }));
    expect(await screen.findByText('Yêu cầu đã hết hạn, không nhận đặt phòng được nữa.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Chấp nhận đặt phòng' })).toBeNull();
  });

  it('YC9.1-NT13 YC9-H6 yêu cầu sale đã hủy: chỉ câu "Sale đã hủy yêu cầu này."', async () => {
    ve(dichVu({ ...Y1, trangThai: 'da_huy', tongGiaChu: null, loiNhan: null }));
    expect(await screen.findByText('Sale đã hủy yêu cầu này.')).toBeInTheDocument();
    expect(screen.queryByText('Giá của bạn')).toBeNull();
  });

  it('HV2 chưa tải được thì có nút Thử lại', async () => {
    const dv = dichVu();
    dv.doc.mockRejectedValueOnce(new TypeError('mất mạng'));
    ve(dv);
    fireEvent.click(await screen.findByRole('button', { name: /Thử lại/ }));
    expect(await screen.findByText('Sale Hùng')).toBeInTheDocument();
    expect(dv.doc).toHaveBeenCalledTimes(2);
  });
});

describe('YC9.3 · CN9 yêu cầu trùng đêm (US52)', () => {
  const TRUNG = [{ yeuCauId: 'y2', tenSale: 'Sale Lan', ngayNhan: '2026-10-18', ngayTra: '2026-10-19', demTrung: ['2026-10-18'] }];
  const CAU = 'Trùng 18/10 với yêu cầu của Sale Lan. Chấp nhận yêu cầu này thì yêu cầu của Sale Lan bị từ chối và Sale Lan được báo.';

  it('YC9.3-NT1 CN9 của yêu cầu chồng đêm có cảnh báo trùng', async () => {
    ve(dichVu({ ...Y1, ngayNhan: '2026-10-17', ngayTra: '2026-10-19', trungVoi: ['Sale Lan'], trung: TRUNG }));
    const canh = await screen.findByTestId('cn9-trung');
    expect(canh).toHaveTextContent(CAU);
    expect(screen.getByRole('button', { name: 'Chấp nhận đặt phòng' })).toBeInTheDocument();
  });

  it('YC9.3-NT1 CN9 không trùng thì không có cảnh báo', async () => {
    ve();
    await screen.findByText('Sale Hùng');
    expect(screen.queryByTestId('cn9-trung')).toBeNull();
    expect(screen.queryByText(/Trùng /)).toBeNull();
  });

  it('YC9.3-NT2 chấp nhận xong CN9-02 thêm dòng yêu cầu của Sale Lan đã bị từ chối', async () => {
    const y = { ...Y1, ngayNhan: '2026-10-17', ngayTra: '2026-10-19', trungVoi: ['Sale Lan'], trung: TRUNG };
    const dv = dichVu(y);
    dv.chapNhan.mockResolvedValueOnce({ y: { ...y, trangThai: 'da_chot', bookingId: 'b1', trungVoi: [], trung: [],
      daTuChoiTheo: [{ yeuCauId: 'y2', tenSale: 'Sale Lan', ngayNhan: '2026-10-18', ngayTra: '2026-10-19' }] }, doiTrangThai: false });
    ve(dv);
    const nut = await screen.findByRole('button', { name: 'Chấp nhận đặt phòng' });
    await act(async () => { fireEvent.click(nut); });
    expect(await screen.findByTestId('cn9')).toHaveAttribute('data-man', 'CN9-02');
    expect(screen.getByText('Đặt phòng đã vào lịch. Sale Hùng được báo.')).toBeInTheDocument();
    expect(screen.getByText('Yêu cầu của Sale Lan (18/10 → 19/10) đã bị từ chối. Sale Lan được báo.')).toBeInTheDocument();
  });
});
