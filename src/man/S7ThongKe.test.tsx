// Test unit S7, S7-00 · Thống kê của sale (YC11.2, US59), và nối ở tab Thống kê của ManSale. Số theo DLM.6, canvas S7.
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../chung/Toast';
import type { DichVuThongKeSale } from '../lib/dichVuThongKeSale';
import type { ThongKeSale } from '../lib/thongKeSale';
import { ManSale } from './ManSale';
import { S7ThongKe } from './S7ThongKe';

afterEach(cleanup);

const THANG10: ThongKeSale = {
  thang: '2026-10-01', soDatPhong: 6, doanhSo: 10_600_000, tienChenh: 1_600_000,
  soDatPhongThangTruoc: 4, doanhSoThangTruoc: 9_800_000, tienChenhThangTruoc: 1_200_000,
  theoChu: [
    { chuId: 'hoa', tuNhap: false, ten: 'Chị Hoa', doanhSo: 4_800_000, tienChenh: 800_000 },
    { chuId: 'tuan', tuNhap: false, ten: 'Anh Tuấn', doanhSo: 4_200_000, tienChenh: 600_000 },
    { chuId: null, tuNhap: true, ten: 'Chú Bình', doanhSo: 1_600_000, tienChenh: 200_000 },
  ],
  choChu: [{ yeuCauId: 'y1', canId: 'c2208', maCan: '2208', tenToa: 'À La Carte', ngayNhan: '2026-10-10', ngayTra: '2026-10-12',
             guiLuc: '2026-10-07T07:20:00+00:00', tenChu: 'Anh Tuấn' }],
  soChoChu: 1,
};
const TRONG: ThongKeSale = {
  thang: '2026-10-01', soDatPhong: 0, doanhSo: 0, tienChenh: 0, soDatPhongThangTruoc: 0, doanhSoThangTruoc: 0,
  tienChenhThangTruoc: 0, theoChu: [], choChu: [], soChoChu: 0,
};
const dv = (tk: ThongKeSale): DichVuThongKeSale & { layThang: ReturnType<typeof vi.fn> } => ({ layThang: vi.fn(async () => tk) });
const ve = (p: Partial<Parameters<typeof S7ThongKe>[0]>) =>
  render(<ToastProvider><S7ThongKe dv={undefined} homNay="2026-10-07" {...p} /></ToastProvider>);

describe('YC11.2 · S7 thống kê của sale', () => {
  it('YC11.2-NT1 Hùng tháng 10: "Tháng 10/2026", tiền chênh 1.600.000đ, 6 đặt phòng, doanh số 10.600.000đ', async () => {
    const d = dv(THANG10);
    ve({ dv: d });
    expect(screen.getByRole('heading', { name: 'Thống kê', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Tháng 10/2026')).toBeInTheDocument();
    const chenh = await screen.findByRole('region', { name: 'Tiền chênh tháng 10' });
    expect(within(chenh).getByText('1.600.000đ')).toBeInTheDocument();
    expect(within(chenh).getByText('+33.3% so với tháng 9')).toBeInTheDocument();
    const dp = screen.getByRole('region', { name: 'Đặt phòng' });
    expect(within(dp).getByText('6')).toBeInTheDocument();
    expect(within(dp).getByText('Tháng 9: 4')).toBeInTheDocument();
    const ds = screen.getByRole('region', { name: 'Doanh số' });
    expect(within(ds).getByText('10.600.000đ')).toBeInTheDocument();
    expect(within(ds).getByText('Tháng 9: 9.800.000đ')).toBeInTheDocument();
    expect(d.layThang).toHaveBeenCalledWith(2026, 10);
  });
  it('YC11.2-NT2 tháng 9 tiền chênh 1.200.000đ thì ghi "+33.3% so với tháng 9"; tháng 9 0đ thì không có dòng', async () => {
    ve({ dv: dv({ ...THANG10, tienChenhThangTruoc: 0 }) });
    await screen.findByRole('region', { name: 'Tiền chênh tháng 10' });
    expect(screen.queryByText(/so với tháng 9/)).toBeNull();
  });
  it('YC11.2-NT3 theo chủ nhà: ba dòng, ghi chú "Tiền chênh là giá bán trừ giá chủ nhà"', async () => {
    ve({ dv: dv(THANG10) });
    const the = await screen.findByRole('region', { name: 'Doanh số theo chủ nhà' });
    expect(within(the).getByText('Tiền chênh là giá bán trừ giá chủ nhà')).toBeInTheDocument();
    const dong = within(the).getAllByRole('listitem').map((li) => li.textContent);
    expect(dong).toEqual(['Chị Hoa4.800.000đ · chênh 800.000đ', 'Anh Tuấn4.200.000đ · chênh 600.000đ',
      'Chú Bình1.600.000đ · chênh 200.000đ']);
  });
  it('YC11.2 bước 5, 6: "CHỜ CHỦ NHÀ CHẤP NHẬN" 1, dòng Y1; chạm dòng và "Xem tất cả" gọi lại màn ngoài', async () => {
    const onChoChu = vi.fn();
    const onXemTatCa = vi.fn();
    ve({ dv: dv(THANG10), onChoChu, onXemTatCa });
    const the = await screen.findByRole('region', { name: 'Chờ chủ nhà chấp nhận' });
    expect(within(the).getByText('1')).toBeInTheDocument();
    fireEvent.click(within(the).getByRole('button', { name: /À La Carte 2208 · 10\/10 → 12\/10.*Gửi 14:20 · Anh Tuấn chưa trả lời/ }));
    expect(onChoChu).toHaveBeenCalledWith(THANG10.choChu[0]);
    fireEvent.click(within(the).getByRole('button', { name: 'Xem tất cả đặt phòng và yêu cầu' }));
    expect(onXemTatCa).toHaveBeenCalled();
  });
  it('YC11-H5 không có yêu cầu chờ vẫn có dòng "Xem tất cả đặt phòng và yêu cầu"', async () => {
    ve({ dv: dv({ ...THANG10, choChu: [], soChoChu: 0 }) });
    const the = await screen.findByRole('region', { name: 'Chờ chủ nhà chấp nhận' });
    expect(within(the).getByText('0')).toBeInTheDocument();
    expect(within(the).getByRole('button', { name: 'Xem tất cả đặt phòng và yêu cầu' })).toBeInTheDocument();
  });
  it('YC11.2-NT8 tháng chưa chốt đặt phòng nào: S7-00 và nút "Tìm phòng"', async () => {
    const onTimPhong = vi.fn();
    ve({ dv: dv(TRONG), onTimPhong });
    const o = await screen.findByRole('region', { name: 'Tiền chênh tháng 10' });
    expect(within(o).getByText('0đ')).toBeInTheDocument();
    expect(screen.getByText('Tháng này chưa chốt đặt phòng nào')).toBeInTheDocument();
    expect(screen.getByText('Tìm phòng trống, gửi khách và đặt phòng với chủ nhà. Đặt phòng đã chốt tính ở đây.')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Doanh số theo chủ nhà' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Tìm phòng' }));
    expect(onTimPhong).toHaveBeenCalled();
  });
  it('HV2 chưa tải được thì có Thử lại; thử lại được thì hiện số', async () => {
    const d = { layThang: vi.fn().mockRejectedValueOnce(new Error('mạng')).mockResolvedValue(THANG10) };
    ve({ dv: d });
    fireEvent.click(await screen.findByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByRole('region', { name: 'Tiền chênh tháng 10' })).toBeInTheDocument();
  });
});

describe('YC11.2 · tab Thống kê của ManSale', () => {
  const dvLich = () => ({ doc: vi.fn(async () => []) });
  it('YC11.2-NT8 tab Thống kê là S7-00, "Tìm phòng" mở S1-02 như ô tìm ở S1', async () => {
    const tim = { tim: vi.fn(), docGanDay: vi.fn(async () => []), docToa: vi.fn(async () => []) };
    render(<ToastProvider><ManSale ten="Sale Hùng" dvLich={{ ...dvLich(), timPhong: tim, thongKeSale: dv(TRONG) }} onDangXuat={vi.fn()} /></ToastProvider>);
    fireEvent.click(within(screen.getByRole('navigation', { name: 'Tab' })).getByRole('button', { name: 'Thống kê' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Tìm phòng' }));
    expect(screen.getByRole('heading', { name: 'Tìm phòng' })).toBeInTheDocument();
    await waitFor(() => expect(tim.docGanDay).toHaveBeenCalled());
  });
  it('YC11.2-NT1 tab Thống kê đọc số của sale; chạm yêu cầu chờ mở màn kết quả của yêu cầu (S3-03, US60)', async () => {
    render(<ToastProvider><ManSale ten="Sale Hùng" dvLich={{ ...dvLich(), thongKeSale: dv(THANG10) }} onDangXuat={vi.fn()} /></ToastProvider>);
    fireEvent.click(within(screen.getByRole('navigation', { name: 'Tab' })).getByRole('button', { name: 'Thống kê' }));
    const the = await screen.findByRole('region', { name: 'Chờ chủ nhà chấp nhận' });
    fireEvent.click(within(the).getAllByRole('button')[0]!);
    expect(await screen.findByRole('button', { name: 'Quay lại' })).toBeInTheDocument();
    expect(screen.queryByText('Sẽ có ở bản sau')).not.toBeInTheDocument();
  });
});
