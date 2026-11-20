// Test unit S7-03, S7-03-00 · Đặt phòng và yêu cầu của sale (YC11.3, US60), và nối từ S7 ở ManSale. Số theo DLM.6, canvas S7-03.
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../chung/Toast';
import type { DanhSachSale, DongDanhSach } from '../lib/danhSachSale';
import type { DichVuDanhSachSale } from '../lib/dichVuDanhSachSale';
import type { DichVuThongKeSale } from '../lib/dichVuThongKeSale';
import type { DichVuYeuCau } from '../lib/dichVuYeuCau';
import type { ThongKeSale } from '../lib/thongKeSale';
import { ManSale } from './ManSale';
import { S703DanhSach } from './S703DanhSach';

afterEach(cleanup);

const D = (p: Partial<DongDanhSach>): DongDanhSach => ({
  loai: 'yeu_cau', id: 'x', canId: 'c', maCan: '2208', tenToa: 'À La Carte', ngayNhan: '2026-10-10', ngayTra: '2026-10-12',
  trangThai: 'cho', moc: '', guiLuc: '2026-10-07T07:20:00+00:00', tienChenh: null, ghiGiup: null, tuChoi: null, hetHanVi: null,
  ...p,
});
const Y1 = D({ id: 'y1' });
const B1 = D({ loai: 'dat_phong', id: 'b1', maCan: '1509', tenToa: 'ICON40', trangThai: 'da_chot', tienChenh: 400_000, guiLuc: null });
const H1 = D({ loai: 'dat_phong', id: 'h1', maCan: '1509', tenToa: 'ICON40', trangThai: 'da_chot', tienChenh: 400_000, ghiGiup: 'Chị Hoa', guiLuc: null });
const Y4 = D({ id: 'y4', maCan: '1103', tenToa: 'Sapphire', ngayNhan: '2026-10-05', ngayTra: '2026-10-06', trangThai: 'bi_tu_choi', tuChoi: 'dat_phong_khac' });
const Y2 = D({ id: 'y2', maCan: '1509', tenToa: 'ICON40', ngayNhan: '2026-09-27', ngayTra: '2026-09-28', trangThai: 'het_han', hetHanVi: 'qua_14_ngay' });
const Y3 = D({ id: 'y3', ngayNhan: '2026-10-20', ngayTra: '2026-10-21', trangThai: 'da_huy' });
const TAT_CA: DanhSachSale = { dong: [Y1, H1, B1, Y4, Y2, Y3], conNua: false };

const dv = (...trang: DanhSachSale[]): DichVuDanhSachSale & { lay: ReturnType<typeof vi.fn> } => {
  const lay = vi.fn(async (boQua: number): Promise<DanhSachSale> => trang[Math.min(Math.floor(boQua / 50), trang.length - 1)]!);
  return { lay };
};
const ve = (p: Partial<Parameters<typeof S703DanhSach>[0]>) =>
  render(<ToastProvider><S703DanhSach dv={undefined} homNay="2026-10-07" onQuayLai={() => {}} {...p} /></ToastProvider>);
const dongCua = async (ten: string) => (await screen.findByText(ten)).closest('button') as HTMLElement;

describe('YC11.3 · S7-03 đặt phòng và yêu cầu của sale', () => {
  it('YC11.3-NT1 Y1 chờ: nhãn "Chờ chủ", giờ gửi 14:20, không tiền chênh', async () => {
    ve({ dv: dv(TAT_CA) });
    expect(await screen.findByRole('region', { name: 'Đặt phòng của tôi' })).toBeInTheDocument();
    const d = (await screen.findAllByText('À La Carte 2208 · 10/10 → 12/10'))[0]!.closest('button') as HTMLElement;
    expect(within(d).getByText('Chờ chủ')).toBeInTheDocument();
    expect(within(d).getByText('Đã gửi yêu cầu 14:20, chờ chủ chấp nhận')).toBeInTheDocument();
    expect(d.textContent).not.toMatch(/chênh/);
  });

  it('YC11.3-NT2 B1 đã chấp nhận: "Đã chốt", "Chủ đã chấp nhận · chênh 400.000đ"', async () => {
    ve({ dv: dv(TAT_CA) });
    const d = await dongCua('Chủ đã chấp nhận · chênh 400.000đ');
    expect(within(d).getByText('Đã chốt')).toBeInTheDocument();
    expect(within(d).getByText('ICON40 1509 · 10/10 → 12/10')).toBeInTheDocument();
  });

  it('YC11.3-NT3 Y4 bị từ chối: "Bị từ chối" và lý do', async () => {
    ve({ dv: dv(TAT_CA) });
    const d = await dongCua('Chủ đã nhận đặt phòng khác cùng ngày');
    expect(within(d).getByText('Bị từ chối')).toBeInTheDocument();
  });

  it('YC11.3-NT4 Y2 quá 2 tuần: "Hết hạn"', async () => {
    ve({ dv: dv(TAT_CA) });
    const d = await dongCua('Chủ chưa trả lời trong 2 tuần');
    expect(within(d).getByText('Hết hạn')).toBeInTheDocument();
  });

  it('YC11.3-NT5 Y3 tự hủy: "Đã hủy"; có chú thích thứ tự trạng thái', async () => {
    ve({ dv: dv(TAT_CA) });
    const d = await dongCua('Bạn đã hủy yêu cầu');
    expect(within(d).getByText('Đã hủy')).toBeInTheDocument();
    expect(screen.getByText('Chờ chủ → Đã chốt. Chủ từ chối hoặc nhận đặt phòng khác: Bị từ chối. Quá 2 tuần: Hết hạn. Bạn tự hủy: Đã hủy.'))
      .toBeInTheDocument();
  });

  it('YC11.3-NT6 Chị Hoa ghi giúp: dòng 1509 · 10/10 → 12/10 "Đã chốt", chênh 400.000đ, "Chị Hoa đã ghi giúp bạn"', async () => {
    ve({ dv: dv(TAT_CA) });
    const d = await dongCua('Chị Hoa đã ghi giúp bạn · chênh 400.000đ');
    expect(within(d).getByText('Đã chốt')).toBeInTheDocument();
    expect(within(d).getByText('ICON40 1509 · 10/10 → 12/10')).toBeInTheDocument();
  });

  it('YC11.3-NT9 chạm Y4 bị từ chối gọi mở kết quả của Y4; chạm đặt phòng gọi mở chi tiết đặt phòng', async () => {
    const yc = vi.fn(); const dp = vi.fn();
    ve({ dv: dv(TAT_CA), onChamYeuCau: yc, onChamDatPhong: dp });
    fireEvent.click(await dongCua('Chủ đã nhận đặt phòng khác cùng ngày'));
    expect(yc).toHaveBeenCalledWith(expect.objectContaining({ id: 'y4' }));
    fireEvent.click(await dongCua('Chủ đã chấp nhận · chênh 400.000đ'));
    expect(dp).toHaveBeenCalledWith(expect.objectContaining({ id: 'b1' }));
  });

  it('YC11.3 bước 6 chưa có yêu cầu nào: S7-03-00 và nút "Tìm phòng"', async () => {
    const tim = vi.fn();
    ve({ dv: dv({ dong: [], conNua: false }), onTimPhong: tim });
    expect(await screen.findByText('Chưa có yêu cầu nào')).toBeInTheDocument();
    expect(screen.getByText('Tìm phòng trống, gửi khách và đặt phòng với chủ nhà. Yêu cầu bạn gửi hiện ở đây.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tìm phòng' }));
    expect(tim).toHaveBeenCalled();
  });

  it('YC11.3-NT1 YC11 "Dữ liệu" còn trang sau: "Xem thêm" đọc 50 dòng tiếp', async () => {
    const dau = { dong: Array.from({ length: 50 }, (_, i) => D({ id: `a${i}`, trangThai: 'da_huy' })), conNua: true };
    const sau = { dong: [D({ id: 'cuoi', maCan: '3402', tenToa: null, trangThai: 'da_huy' })], conNua: false };
    const d = dv(dau, sau);
    ve({ dv: d });
    fireEvent.click(await screen.findByRole('button', { name: 'Xem thêm' }));
    expect(await screen.findByText('3402 · 10/10 → 12/10')).toBeInTheDocument();
    expect(d.lay).toHaveBeenLastCalledWith(50);
    expect(screen.queryByRole('button', { name: 'Xem thêm' })).not.toBeInTheDocument();
  });

  it('HV2 chưa tải được thì Thử lại', async () => {
    const lay = vi.fn().mockRejectedValueOnce(new Error('mạng')).mockResolvedValue(TAT_CA);
    ve({ dv: { lay } });
    fireEvent.click(await screen.findByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByText('Bạn đã hủy yêu cầu')).toBeInTheDocument();
  });
});

const TK: ThongKeSale = {
  thang: '2026-10-01', soDatPhong: 1, doanhSo: 2_600_000, tienChenh: 400_000, soDatPhongThangTruoc: 0, doanhSoThangTruoc: 0,
  tienChenhThangTruoc: 0, theoChu: [{ chuId: 'hoa', tuNhap: false, ten: 'Chị Hoa', doanhSo: 2_600_000, tienChenh: 400_000 }],
  choChu: [{ yeuCauId: 'y1', canId: 'c2208', maCan: '2208', tenToa: 'À La Carte', ngayNhan: '2026-10-10', ngayTra: '2026-10-12',
             guiLuc: '2026-10-07T07:20:00+00:00', tenChu: 'Anh Tuấn' }],
  soChoChu: 1,
};

describe('YC11.3 · nối S7-03 ở tab Thống kê của sale', () => {
  const veSale = (ketQua: ReturnType<typeof vi.fn>) => {
    const dvTk: DichVuThongKeSale = { layThang: async () => TK };
    const yeuCau = { ketQua } as unknown as DichVuYeuCau;
    render(
      <ToastProvider>
        <ManSale onDangXuat={() => {}} dvThongKe={dvTk}
                 dvLich={{ danhSachSale: dv(TAT_CA), chiTietCan: { yeuCau } } as unknown as Parameters<typeof ManSale>[0]['dvLich']} />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Thống kê' }));
  };

  it('YC11.3-NT9 chạm Y4 bị từ chối ở danh sách mở màn kết quả của Y4; chạm Y1 chờ ở S7 mở màn kết quả của Y1', async () => {
    const ketQua = vi.fn(async () => { throw new Error('chưa cần'); });
    veSale(ketQua);
    fireEvent.click(await screen.findByRole('button', { name: 'Xem tất cả đặt phòng và yêu cầu' }));
    fireEvent.click(await dongCua('Chủ đã nhận đặt phòng khác cùng ngày'));
    await waitFor(() => expect(ketQua).toHaveBeenCalledWith('y4'));
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    expect(await screen.findByText('Bạn đã hủy yêu cầu')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    fireEvent.click(await screen.findByText('À La Carte 2208 · 10/10 → 12/10'));
    await waitFor(() => expect(ketQua).toHaveBeenCalledWith('y1'));
  });
});
