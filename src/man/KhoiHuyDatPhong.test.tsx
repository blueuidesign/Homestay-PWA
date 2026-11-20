// Test unit hủy đặt phòng có sale (YC5.8, US33) ở CN3-02 của chủ nhà và S3-10 của sale. Số theo DLM: B1 1509 10/10 → 12/10
// của Sale Hùng; B5 khách lẻ của Chị Hoa.
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { ToastProvider } from '../chung/Toast';
import type { ChiTietDatPhong } from '../lib/datPhong';
import type { DatPhongSale } from '../lib/datPhongSale';
import type { DichVuDatPhong } from '../lib/dichVuDatPhong';
import { cauHoiXinHuy, docTinhTrangHuy, nhanHuy, type TinhTrangHuy } from '../lib/huyDatPhong';
import { CN302ChiTietDatPhong } from './CN302ChiTietDatPhong';
import { S310DatPhongSale } from './S310DatPhongSale';

afterEach(cleanup);

const B1: ChiTietDatPhong = {
  id: 'B1', canId: 'c1509', maCan: '1509', ngayNhan: '2026-10-10', ngayTra: '2026-10-12', gioNhan: '14:00', gioTra: '12:00',
  tienPhong: 2200000, tienCoc: 1000000, trangThaiTien: 'da_coc', coHoanTac: false, daHuy: false, ghiChu: null, saleId: 'hung',
  tenSale: 'Sale Hùng', sdtSale: '0912345678', saleDaXoa: false, tenKhach: null, sdtKhach: null, soKhach: null,
};
const B5: ChiTietDatPhong = { ...B1, id: 'B5', ngayNhan: '2026-10-13', ngayTra: '2026-10-15', saleId: null, tenSale: null, sdtSale: null };
const SB1: DatPhongSale = {
  id: 'B1', canId: 'c1509', maCan: '1509', tenToa: 'ICON40', soPhongNgu: 2, tenChu: 'Chị Hoa', sdtChu: '0900000001',
  ngayNhan: '2026-10-10', ngayTra: '2026-10-12', trangThai: 'hieu_luc', tienPhong: 2_200_000, giaBan: 2_600_000, tienChenh: 400_000,
  daCoc: null, ghiGiup: false, suaGanNhat: null,
};
const TT = (p: Partial<TinhTrangHuy>): TinhTrangHuy =>
  ({ tinhTrang: 'hieu_luc', xinHuyDuoc: true, toiXin: false, traLoiDuoc: false, tenNguoiXin: null, ...p });

/** Dịch vụ giả giữ tình trạng hủy như database: xin thì chờ, đồng ý thì hủy, không đồng ý thì bị từ chối. */
function huyGia(dau: TinhTrangHuy, nguoiGoi: string) {
  let tt = dau;
  return {
    tinhTrangHuy: vi.fn(async () => tt),
    xinHuy: vi.fn(async () => { tt = TT({ tinhTrang: 'cho_dong_y', xinHuyDuoc: false, toiXin: true, tenNguoiXin: nguoiGoi }); }),
    traLoiHuy: vi.fn(async (_id: string, dongY: boolean) => {
      tt = TT({ tinhTrang: dongY ? 'da_huy' : 'bi_tu_choi', xinHuyDuoc: false, tenNguoiXin: tt.tenNguoiXin });
    }),
  };
}
const dvChu = (ct: ChiTietDatPhong, huy: ReturnType<typeof huyGia>): DichVuDatPhong =>
  ({ layDatPhong: vi.fn(async () => []), layChiTiet: vi.fn(async () => ct), ...huy });
const veChu = (dv: DichVuDatPhong, id = 'B1') =>
  render(<ToastProvider><CN302ChiTietDatPhong id={id} dv={dv} onQuayLai={vi.fn()} onKhongCon={vi.fn()} /></ToastProvider>);
const veSale = (huy: ReturnType<typeof huyGia>) =>
  render(<ToastProvider><S310DatPhongSale id="B1" homNay="2026-10-07" onQuayLai={vi.fn()}
                                          dv={{ xem: vi.fn(async () => SB1), suaGiaBan: vi.fn(), ...huy }} /></ToastProvider>);

describe('YC5.8 · hủy đặt phòng có sale', () => {
  it('YC5.8-NT1 Hùng bấm "Xin hủy", hỏi lại đúng câu, xác nhận thì nhãn "Chờ đồng ý hủy", không còn nút', async () => {
    const huy = huyGia(TT({}), 'Sale Hùng');
    veSale(huy);
    fireEvent.click(await screen.findByRole('button', { name: 'Xin hủy' }));
    const hoi = screen.getByRole('alertdialog', { name: 'Xác nhận xin hủy' });
    expect(within(hoi).getByText('Xin hủy đặt phòng 1509 · 10/10 → 12/10? Chị Hoa phải đồng ý thì mới hủy.')).toBeInTheDocument();
    fireEvent.click(within(hoi).getByRole('button', { name: 'Xin hủy' }));
    await waitFor(() => expect(huy.xinHuy).toHaveBeenCalledWith('B1'));
    expect(await screen.findByText('Chờ đồng ý hủy')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Xin hủy' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Đồng ý hủy' })).not.toBeInTheDocument();
  });

  it('YC5.8-NT1 Chị Hoa xin hủy B1: câu hỏi lại nói Sale Hùng phải đồng ý; bấm "Không" thì không gửi', async () => {
    const huy = huyGia(TT({}), 'Chị Hoa');
    veChu(dvChu(B1, huy));
    fireEvent.click(await screen.findByRole('button', { name: 'Xin hủy' }));
    expect(screen.getByText('Xin hủy đặt phòng 1509 · 10/10 → 12/10? Sale Hùng phải đồng ý thì mới hủy.')).toBeInTheDocument();
    fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Không' }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(huy.xinHuy).not.toHaveBeenCalled();
  });

  it('YC5.8-NT2 bên kia thấy "Sale Hùng xin hủy đặt phòng này", bấm "Đồng ý hủy" thì nhãn "Đã hủy"', async () => {
    const huy = huyGia(TT({ tinhTrang: 'cho_dong_y', xinHuyDuoc: false, traLoiDuoc: true, tenNguoiXin: 'Sale Hùng' }), 'Chị Hoa');
    veChu(dvChu(B1, huy));
    expect(await screen.findByText('Sale Hùng xin hủy đặt phòng này')).toBeInTheDocument();
    expect(screen.getByText('Chờ đồng ý hủy')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Đồng ý hủy' }));
    await waitFor(() => expect(huy.traLoiHuy).toHaveBeenCalledWith('B1', true));
    expect(await screen.findByText('Đã hủy')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Đồng ý hủy' })).not.toBeInTheDocument();
  });

  it('YC5.8-NT3 bấm "Không đồng ý" thì dòng "Bị từ chối hủy", không còn nút "Xin hủy"', async () => {
    const huy = huyGia(TT({ tinhTrang: 'cho_dong_y', xinHuyDuoc: false, traLoiDuoc: true, tenNguoiXin: 'Chị Hoa' }), 'Sale Hùng');
    veSale(huy);
    fireEvent.click(await screen.findByRole('button', { name: 'Không đồng ý' }));
    await waitFor(() => expect(huy.traLoiHuy).toHaveBeenCalledWith('B1', false));
    expect(await screen.findByText('Bị từ chối hủy')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Xin hủy' })).not.toBeInTheDocument();
  });

  it('YC5.8-NT4 database từ chối thì toast đỏ câu của database', async () => {
    const huy = huyGia(TT({ tinhTrang: 'cho_dong_y', xinHuyDuoc: false, traLoiDuoc: true, tenNguoiXin: 'Chị Hoa' }), 'Sale Hùng');
    huy.traLoiHuy.mockRejectedValueOnce(new LoiNguoiDung('Người xin hủy không tự đồng ý được. Bên kia phải trả lời.'));
    veSale(huy);
    fireEvent.click(await screen.findByRole('button', { name: 'Đồng ý hủy' }));
    expect(await screen.findByText('Người xin hủy không tự đồng ý được. Bên kia phải trả lời.')).toBeInTheDocument();
  });

  it('YC5.8-NT6 Chị Hoa mở B5 khách lẻ: không có nút "Xin hủy", có "Xóa đặt phòng"', async () => {
    const huy = huyGia(TT({ xinHuyDuoc: false }), 'Chị Hoa');
    veChu(dvChu(B5, huy), 'B5');
    expect(await screen.findByRole('button', { name: 'Xóa đặt phòng' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Xin hủy' })).not.toBeInTheDocument();
    expect(huy.tinhTrangHuy).not.toHaveBeenCalled();
  });

  it('đọc dữ liệu của lệnh và chữ', () => {
    expect(docTinhTrangHuy({ tinh_trang: 'cho_dong_y', xin_huy_duoc: false, toi_xin: true, tra_loi_duoc: false, ten_nguoi_xin: 'Sale Hùng' }))
      .toEqual(TT({ tinhTrang: 'cho_dong_y', xinHuyDuoc: false, toiXin: true, tenNguoiXin: 'Sale Hùng' }));
    expect(docTinhTrangHuy({}).tinhTrang).toBe('hieu_luc');
    expect(nhanHuy(TT({}))).toBeNull();
    expect(nhanHuy(TT({ tinhTrang: 'da_huy' }))).toBe('Đã hủy');
    expect(cauHoiXinHuy('1509 ', '2026-10-10', '2026-10-12', 'Sale Hùng')).toBe('Xin hủy đặt phòng 1509 · 10/10 → 12/10? Sale Hùng phải đồng ý thì mới hủy.');
  });
});
