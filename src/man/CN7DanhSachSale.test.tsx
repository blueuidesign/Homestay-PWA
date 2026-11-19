// Test unit màn CN7, CN7-00 Danh sách sale của chủ nhà (YC6.2) và đường đi sang CN7-04, CN7-05. Số theo DLM.2, DLM.4:
// Chị Hoa kết nối Sale Hùng (B1 2.200.000đ + B3 1.800.000đ), Lan, Nga, Minh. Tên, số đều giả.
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../chung/Toast';
import type { DichVuSale, DongSale } from '../lib/dichVuSale';
import { CN7DanhSachSale } from './CN7DanhSachSale';

afterEach(cleanup);

function dong(them: Partial<DongSale>): DongSale {
  return {
    id: 'k-' + (them.ten ?? 'x'), loai: 'ket_noi', saleId: 's-' + (them.ten ?? 'x'), ten: 'Sale', soDienThoai: '0900000003',
    nhom: 'da_ket_noi', daXoaTaiKhoan: false, xemCoc: true, soDatPhong: 0, tongTienPhong: 0, ketNoiLuc: '2026-08-02T03:00:00Z',
    ngungLuc: null, ...them,
  };
}

const HUNG = dong({ ten: 'Sale Hùng', soDatPhong: 2, tongTienPhong: 4000000 });
const BON = [HUNG, dong({ ten: 'Sale Lan', soDatPhong: 1, tongTienPhong: 1900000 }), dong({ ten: 'Sale Nga' }),
  dong({ ten: 'Sale Minh', soDatPhong: 1, tongTienPhong: 900000 })];
const PHUONG = dong({ id: 'tay-1', loai: 'them_tay', saleId: null, ten: 'Sale Phương', soDienThoai: '0901234567', nhom: 'chua_ket_noi',
  xemCoc: null, ketNoiLuc: null });

function dichVu(lan: DongSale[][], them: Partial<DichVuSale> = {}): DichVuSale {
  const cuoi = lan[lan.length - 1]!;
  return {
    layDanhSach: vi.fn(async () => lan.shift() ?? cuoi),
    layDatPhong: vi.fn(async () => [
      { id: 'B3', maCan: '1509', ngayNhan: '2026-10-04', ngayTra: '2026-10-06', tienPhong: 1800000, trangThai: 'hieu_luc' as const, trangThaiTien: 'da_thanh_toan' as const },
      { id: 'B1', maCan: '1509', ngayNhan: '2026-10-10', ngayTra: '2026-10-12', tienPhong: 2200000, trangThai: 'hieu_luc' as const, trangThaiTien: 'da_coc' as const },
    ]),
    themSaleTay: vi.fn(async () => 'tay-1'),
    xoaSaleTay: vi.fn(async () => undefined),
    ngungChoXem: vi.fn(async () => undefined),
    datXemCoc: vi.fn(async (_id: string, bat: boolean) => bat),
    boDong: vi.fn(async () => undefined),
    ...them,
  };
}

function ve(dv: DichVuSale) {
  render(<ToastProvider><CN7DanhSachSale dv={dv} thanhTab={<nav aria-label="Tab" />} /></ToastProvider>);
}

const nhom = (ten: RegExp) => within(screen.getByRole('region', { name: ten }));

describe('YC6.2 · CN7 Danh sách sale', () => {
  it('YC6.2-NT1 Chị Hoa mở tab Sale thì Sale Hùng, Lan, Nga, Minh ở nhóm "Đã kết nối · 4"', async () => {
    ve(dichVu([BON]));
    expect(await screen.findByRole('heading', { name: 'Đã kết nối · 4' })).toBeInTheDocument();
    const g = nhom(/^Đã kết nối/);
    for (const ten of ['Sale Hùng', 'Sale Lan', 'Sale Nga', 'Sale Minh']) expect(g.getByText(ten)).toBeInTheDocument();
    // YC6.2 bước 1: mỗi dòng có tổng tiền phòng các đặt phòng của sale với chủ nhà này.
    expect(g.getByRole('button', { name: /Sale Hùng/ })).toHaveTextContent('4.000.000đ');
    expect(g.getByRole('button', { name: /Sale Nga/ })).toHaveTextContent('0đ');
    expect(screen.getByRole('button', { name: 'Chia sẻ link mời' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sao chép link' })).toBeInTheDocument();
    // YC6-H13: không có nút "Nhắc lại".
    expect(screen.queryByRole('button', { name: 'Nhắc lại' })).toBeNull();
    expect(screen.queryByText('Chưa có sale nào xem lịch')).toBeNull();
    expect(screen.getByRole('navigation', { name: 'Tab' })).toBeInTheDocument();
  });

  it('YC6.2-NT2 chủ nhà chưa có sale nào thì thấy CN7-00', async () => {
    ve(dichVu([[]]));
    expect(await screen.findByRole('heading', { name: 'Chưa có sale nào xem lịch' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Chia sẻ link mời' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sao chép link' })).toBeInTheDocument();
    const thay = within(screen.getByRole('region', { name: 'Sale sẽ thấy' }));
    expect(thay.getByText('Phòng trống hay đã đặt')).toBeInTheDocument();
    expect(thay.getByText('Giá từng đêm')).toBeInTheDocument();
    expect(thay.getByText('Không thấy tên, số điện thoại khách và doanh thu')).toBeInTheDocument();
    // QD7: không có công tắc tắt giá, nên không có chữ "bạn tắt được" ở giá.
    expect(screen.queryByText(/Giá từng đêm \(bạn tắt được\)/)).toBeNull();
    expect(screen.queryByRole('heading', { name: /Đã kết nối/ })).toBeNull();
    expect(screen.getByRole('button', { name: 'Thêm sale' })).toBeInTheDocument();
  });

  it('YC6.2 bước 3 US37: "Chia sẻ link mời", "Sao chép link" chưa có link thì báo tạm', async () => {
    ve(dichVu([BON]));
    fireEvent.click(await screen.findByRole('button', { name: 'Chia sẻ link mời' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Link mời sẽ có ở bản sau');
  });

  it('YC6.2-NT3 thêm "Sale Phương" 0901234567 ở CN7-05 thì dòng ở nhóm "Chưa kết nối"; "090 123" bị từ chối', async () => {
    const dv = dichVu([BON, [...BON, PHUONG]]);
    ve(dv);
    fireEvent.click(await screen.findByRole('button', { name: 'Thêm sale' }));
    expect(await screen.findByRole('heading', { name: 'Thêm sale' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Tên sale *'), { target: { value: 'Sale Phương' } });
    fireEvent.change(screen.getByLabelText('Số điện thoại *'), { target: { value: '090 123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu sale' }));
    expect(await screen.findByText('Số điện thoại chưa đúng (10 chữ số, bắt đầu bằng 0)')).toBeInTheDocument();
    expect(dv.themSaleTay).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Số điện thoại *'), { target: { value: '0901234567' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu sale' }));
    expect(await screen.findByRole('heading', { name: 'Chưa kết nối · 1' })).toBeInTheDocument();
    expect(dv.themSaleTay).toHaveBeenCalledWith('Sale Phương', '0901234567');
    expect(nhom(/^Chưa kết nối/).getByText('Sale Phương')).toBeInTheDocument();
    expect(nhom(/^Chưa kết nối/).getByText('0901 234 567 · chưa mở link mời')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Đã kết nối · 4' })).toBeInTheDocument();
  });

  it('YC6.2-NT7 Sale Hùng đã xóa tài khoản: dòng ghi "Đã xoá tài khoản", không số, không "Gọi", không mở được, bỏ được', async () => {
    const hungXoa = { ...HUNG, soDienThoai: null, daXoaTaiKhoan: true };
    const dv = dichVu([[hungXoa, ...BON.slice(1)], BON.slice(1)]);
    ve(dv);
    const g = await screen.findByRole('heading', { name: 'Đã kết nối · 4' }).then(() => nhom(/^Đã kết nối/));
    const dongHung = g.getByText('Sale Hùng').closest('li')!;
    expect(within(dongHung).getByText('Đã xoá tài khoản')).toBeInTheDocument();
    expect(within(dongHung).queryByText(/0900/)).toBeNull();
    expect(within(dongHung).queryByRole('link')).toBeNull();
    expect(g.queryByRole('button', { name: /Sale Hùng/ })).toBeNull();
    fireEvent.click(within(dongHung).getByText('Sale Hùng'));
    expect(screen.queryByRole('heading', { name: 'Sale Hùng' })).toBeNull();
    fireEvent.click(within(dongHung).getByRole('button', { name: 'Bỏ dòng' }));
    await waitFor(() => expect(dv.boDong).toHaveBeenCalledWith(HUNG.id));
    expect(await screen.findByRole('heading', { name: 'Đã kết nối · 3' })).toBeInTheDocument();
  });

  it('YC6.2-NT8 mở dòng "Sale Phương" (thêm tay) và xác nhận "Xóa sale này" thì dòng biến mất', async () => {
    const dv = dichVu([[...BON, PHUONG], BON]);
    ve(dv);
    fireEvent.click(await screen.findByRole('button', { name: /Sale Phương/ }));
    expect(await screen.findByRole('heading', { name: 'Sale Phương' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Gọi' })).toHaveAttribute('href', 'tel:0901234567');
    expect(screen.queryByRole('switch', { name: 'Tình trạng cọc' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Ngừng cho xem lịch' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Xóa sale này' }));
    const hoi = await screen.findByRole('alertdialog');
    fireEvent.click(within(hoi).getByRole('button', { name: 'Xóa' }));
    await waitFor(() => expect(dv.xoaSaleTay).toHaveBeenCalledWith('tay-1'));
    expect(await screen.findByRole('heading', { name: 'Đã kết nối · 4' })).toBeInTheDocument();
    expect(screen.queryByText('Sale Phương')).toBeNull();
  });

  it('YC6.2 bước 6 ngừng cho Sale Hùng xem: hỏi lại, đồng ý thì dòng rời nhóm "Đã kết nối"', async () => {
    const hungNgung = { ...HUNG, nhom: 'da_ngung' as const, xemCoc: null, ngungLuc: '2026-11-19T02:00:00Z' };
    const dv = dichVu([BON, [hungNgung, ...BON.slice(1)]]);
    ve(dv);
    fireEvent.click(await screen.findByRole('button', { name: /Sale Hùng/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Ngừng cho xem lịch' }));
    const hoi = await screen.findByRole('alertdialog');
    expect(hoi).toHaveTextContent('Xác nhận ngừng cho Sale Hùng xem? Đặt phòng cũ vẫn giữ. Sale không thấy lịch của bạn nữa.');
    fireEvent.click(within(hoi).getByRole('button', { name: 'Ngừng cho xem' }));
    await waitFor(() => expect(dv.ngungChoXem).toHaveBeenCalledWith(HUNG.id));
    expect(await screen.findByRole('heading', { name: 'Đã kết nối · 3' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Đã ngừng · 1' })).toBeInTheDocument();
    expect(nhom(/^Đã ngừng/).getByText('Sale Hùng')).toBeInTheDocument();
  });

  it('YC6.2-NT9 Hùng đã ngừng ở nhóm "Đã ngừng"; mở dòng thấy B1, B3, không có "Tình trạng cọc", "Ngừng cho xem lịch", không xóa được', async () => {
    const hungNgung = { ...HUNG, nhom: 'da_ngung' as const, xemCoc: null, ngungLuc: '2026-11-19T02:00:00Z' };
    ve(dichVu([[hungNgung, ...BON.slice(1)]]));
    expect(await screen.findByRole('heading', { name: 'Đã ngừng · 1' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Đã kết nối · 3' })).toBeInTheDocument();
    fireEvent.click(nhom(/^Đã ngừng/).getByRole('button', { name: /Sale Hùng/ }));
    expect(await screen.findByText('1509 · 10/10 → 12/10')).toBeInTheDocument();
    expect(screen.getByText('1509 · 04/10 → 06/10')).toBeInTheDocument();
    expect(screen.queryByRole('switch', { name: 'Tình trạng cọc' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Ngừng cho xem lịch' })).toBeNull();
    expect(screen.queryByRole('button', { name: /Xóa/ })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Bỏ dòng' })).toBeNull();
  });

  it('HV1 HV2 chưa đọc được thì khung xám rồi Thử lại', async () => {
    const dv = dichVu([BON], { layDanhSach: vi.fn().mockRejectedValueOnce(new TypeError('mất mạng')).mockResolvedValueOnce(BON) });
    ve(dv);
    fireEvent.click(await screen.findByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByRole('heading', { name: 'Đã kết nối · 4' })).toBeInTheDocument();
  });
});
