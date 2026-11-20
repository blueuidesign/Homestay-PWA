// Test unit chi tiết đặt phòng phía sale, S3-10 (YC5.9, YC5.6, US34). Số theo YC5.4-NT1, DLM.6 (ví dụ chủ sửa B1).
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../chung/Toast';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { docDatPhongSale, theChuSua, vietChenh, type DatPhongSale } from '../lib/datPhongSale';
import type { DichVuDatPhongSale } from '../lib/dichVuDatPhongSale';
import { S310DatPhongSale } from './S310DatPhongSale';

afterEach(cleanup);

const B1: DatPhongSale = {
  id: 'b1', canId: 'c1509', maCan: '1509', tenToa: 'ICON40', soPhongNgu: 2, tenChu: 'Chị Hoa', sdtChu: '0900000001',
  ngayNhan: '2026-10-20', ngayTra: '2026-10-22', trangThai: 'hieu_luc', tienPhong: 1_800_000, giaBan: 2_200_000, tienChenh: 400_000,
  daCoc: true, ghiGiup: true, suaGanNhat: null,
};
const dv = (dp: DatPhongSale, sua?: DichVuDatPhongSale['suaGiaBan']) => {
  let hienTai = dp;
  return {
    xem: vi.fn(async () => hienTai),
    suaGiaBan: vi.fn(sua ?? (async (_id: string, g: number) => { hienTai = { ...hienTai, giaBan: g, tienChenh: g - hienTai.tienPhong }; })),
  };
};
const ve = (d: DichVuDatPhongSale) =>
  render(<ToastProvider><S310DatPhongSale id="b1" dv={d} homNay="2026-10-07" onQuayLai={() => {}} onVeLich={() => {}} /></ToastProvider>);

describe('YC5.9 · chi tiết đặt phòng phía sale', () => {
  it('YC5.9-NT1 Hùng xem đặt phòng chủ ghi giúp: căn, ngày, giá bán, giá chủ, chênh, cọc; không số tiền cọc', async () => {
    ve(dv(B1));
    expect(await screen.findByRole('heading', { name: 'ICON40 1509 · 2PN' })).toBeInTheDocument();
    expect(screen.getByTestId('dp-chu-ngay')).toHaveTextContent('Chị Hoa · 20/10 → 22/10 (2 đêm)');
    expect(screen.getByTestId('dp-gia-ban')).toHaveTextContent('2.200.000đ');
    expect(screen.getByTestId('dp-gia-chu')).toHaveTextContent('1.800.000đ');
    expect(screen.getByTestId('dp-chenh')).toHaveTextContent('400.000đ');
    expect(screen.getByTestId('dp-coc')).toHaveTextContent('Khách đã cọc');
    expect(screen.getByText('Chị Hoa đã ghi giúp bạn')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Gọi Chị Hoa' })).toHaveAttribute('href', 'tel:0900000001');
  });

  it('YC5.9-NT1 Hùng sửa giá bán thành 2.400.000đ: tiền chênh 600.000đ', async () => {
    const d = dv(B1);
    ve(d);
    fireEvent.click(await screen.findByRole('button', { name: 'Sửa giá bán' }));
    const o = screen.getByRole('textbox', { name: 'Giá bán cho khách' });
    fireEvent.change(o, { target: { value: '2400000' } });
    expect(o).toHaveValue('2.400.000');
    expect(screen.getByTestId('dp-chenh')).toHaveTextContent('600.000đ');
    fireEvent.click(screen.getByRole('button', { name: 'Lưu giá bán' }));
    await waitFor(() => expect(d.suaGiaBan).toHaveBeenCalledWith('b1', 2_400_000));
    expect(await screen.findByText('Đã lưu giá bán')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('dp-gia-ban')).toHaveTextContent('2.400.000đ'));
    expect(screen.getByTestId('dp-chenh')).toHaveTextContent('600.000đ');
  });

  it('YC5.9-NT2 database từ chối thì giữ giá cũ và toast đỏ câu database', async () => {
    const d = dv(B1, async () => { throw new LoiNguoiDung('Không tìm thấy đặt phòng'); });
    ve(d);
    fireEvent.click(await screen.findByRole('button', { name: 'Sửa giá bán' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Giá bán cho khách' }), { target: { value: '3000000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu giá bán' }));
    expect(await screen.findByText('Không tìm thấy đặt phòng')).toBeInTheDocument();
  });

  it('YC5.9-NT1 YC5-H10 giá bán trống bị chặn; dưới giá chủ thì chênh âm', async () => {
    const d = dv(B1);
    ve(d);
    fireEvent.click(await screen.findByRole('button', { name: 'Sửa giá bán' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Giá bán cho khách' }), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu giá bán' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Giá bán phải lớn hơn 0');
    expect(d.suaGiaBan).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole('textbox', { name: 'Giá bán cho khách' }), { target: { value: '1700000' } });
    expect(screen.getByTestId('dp-chenh')).toHaveTextContent('−100.000đ');
    expect(vietChenh(-100_000)).toBe('−100.000đ');
  });

  it('YC5.9-NT1 QD7 chủ tắt xem cọc, ngừng chia sẻ: không dòng cọc, không nút gọi', async () => {
    ve(dv({ ...B1, daCoc: null, sdtChu: null }));
    await screen.findByTestId('dp-gia-ban');
    expect(screen.queryByTestId('dp-coc')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Gọi/ })).not.toBeInTheDocument();
  });

  it('YC5.6 S3-10 chủ vừa sửa: thẻ ngày cũ → mới, giá chủ cũ → mới, giá bán giữ nguyên', async () => {
    const sua: DatPhongSale = {
      ...B1, ngayNhan: '2026-10-11', ngayTra: '2026-10-13', tienPhong: 1_800_000, giaBan: 2_600_000, tienChenh: 800_000,
      suaGanNhat: { luc: '2026-10-07T03:15:00+00:00', ngayNhanCu: '2026-10-10', ngayTraCu: '2026-10-12', tienPhongCu: 2_200_000 },
    };
    ve(dv(sua));
    const the = await screen.findByText('Chị Hoa đã sửa đặt phòng này lúc 10:15 hôm nay');
    const khoi = the.closest('section') as HTMLElement;
    expect(within(khoi).getByText(/Ngày:/)).toHaveTextContent('Ngày: 10/10 → 12/10 → 11/10 → 13/10 (2 đêm)');
    expect(within(khoi).getByText(/Giá chủ nhà:/)).toHaveTextContent('Giá chủ nhà: 2.200.000đ → 1.800.000đ');
    expect(within(khoi).getByText('Giá bán cho khách giữ 2.600.000đ như bạn đã báo. Báo lại khách ngày mới.')).toBeInTheDocument();
    expect(document.querySelector('[data-man="S3-10"]')).not.toBeNull();
    expect(theChuSua({ ...sua, suaGanNhat: null }, '2026-10-07')).toBeNull();
  });

  it('QD12 đặt phòng đã hủy: "Đặt phòng đã hủy", không sửa giá bán', async () => {
    ve(dv({ ...B1, trangThai: 'da_huy' }));
    expect(await screen.findByText('Đặt phòng đã hủy')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sửa giá bán' })).not.toBeInTheDocument();
  });

  it('HV5 không phải đặt phòng của mình: "Không tìm thấy đặt phòng"; HV2 lỗi mạng thì Thử lại', async () => {
    ve({ xem: vi.fn(async () => { throw new LoiNguoiDung('Không tìm thấy đặt phòng'); }), suaGiaBan: vi.fn() });
    expect(await screen.findByText('Không tìm thấy đặt phòng')).toBeInTheDocument();
    cleanup();
    const xem = vi.fn().mockRejectedValueOnce(new Error('mạng')).mockResolvedValue(B1);
    ve({ xem, suaGiaBan: vi.fn() });
    fireEvent.click(await screen.findByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByTestId('dp-gia-ban')).toHaveTextContent('2.200.000đ');
  });

  it('đọc dữ liệu của lệnh', () => {
    const d = docDatPhongSale({ id: 'b1', can_id: 'c', ma_can: '1509', ten_toa: 'ICON40', so_phong_ngu: 2, ten_chu: 'Chị Hoa',
      sdt_chu: null, ngay_nhan: '2026-10-20', ngay_tra: '2026-10-22', trang_thai: 'hieu_luc', tien_phong: 1800000, gia_ban: 2200000,
      tien_chenh: 400000, da_coc: null, ghi_giup: true,
      sua_gan_nhat: { luc: 'x', noi_dung: { ngay_nhan_cu: '2026-10-19', ngay_tra_cu: '2026-10-21', tien_phong_cu: 2000000 } } });
    expect(d).toMatchObject({ giaBan: 2_200_000, tienChenh: 400_000, daCoc: null, ghiGiup: true,
      suaGanNhat: { ngayNhanCu: '2026-10-19', tienPhongCu: 2_000_000 } });
  });
});

describe('YC5.9 · nối chi tiết đặt phòng phía sale ở S7-03', () => {
  it('YC5.9-NT1 chạm đặt phòng chủ ghi giúp ở S7-03 mở chi tiết đặt phòng, Quay lại về danh sách', async () => {
    const { ManSale } = await import('./ManSale');
    const dong = { loai: 'dat_phong' as const, id: 'b1', canId: 'c1509', maCan: '1509', tenToa: 'ICON40', ngayNhan: '2026-10-20',
      ngayTra: '2026-10-22', trangThai: 'da_chot' as const, moc: '', guiLuc: null, tienChenh: 400_000, ghiGiup: 'Chị Hoa', tuChoi: null,
      hetHanVi: null };
    const d = dv(B1);
    const tk = { thang: '2026-10-01', soDatPhong: 1, doanhSo: 2_200_000, tienChenh: 400_000, soDatPhongThangTruoc: 0, doanhSoThangTruoc: 0,
      tienChenhThangTruoc: 0, theoChu: [], choChu: [], soChoChu: 0 };
    render(
      <ToastProvider>
        <ManSale onDangXuat={() => {}} dvThongKe={{ layThang: async () => tk }}
                 dvLich={{ danhSachSale: { lay: async () => ({ dong: [dong], conNua: false }) }, datPhongSale: d } as unknown as
                   Parameters<typeof ManSale>[0]['dvLich']} />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Thống kê' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Xem tất cả đặt phòng và yêu cầu' }));
    fireEvent.click((await screen.findByText('Chị Hoa đã ghi giúp bạn · chênh 400.000đ')).closest('button') as HTMLElement);
    expect(await screen.findByTestId('dp-gia-ban')).toHaveTextContent('2.200.000đ');
    expect(d.xem).toHaveBeenCalledWith('b1');
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    expect(await screen.findByRole('region', { name: 'Đặt phòng của tôi' })).toBeInTheDocument();
  });
});
