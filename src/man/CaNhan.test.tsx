// Test unit tab Cá nhân P1, P4 (YC1.3). Dịch vụ giả, không gọi mạng.
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../App';
import type { TongQuanCaNhan } from '../lib/caNhan';
import type { DichVuCaNhan } from '../lib/dichVuCaNhan';
import type { DichVuCan } from '../lib/dichVuCan';
import { CAU_XAC_NHAN_DANG_XUAT, CaNhan, CHU_PHIEN_BAN } from './CaNhan';
import { dichVuGia } from './gia';

afterEach(cleanup);
beforeEach(() => { localStorage.clear(); sessionStorage.clear(); window.history.replaceState(null, '', '/'); });

const TQ: TongQuanCaNhan = {
  ten: 'Nguyễn Thị Hoa', tenHienThi: 'Chị Hoa', soDienThoai: '0904118772', email: 'hoa@vidu.test', soChuaDoc: 2,
  gioNhan: '14:00', gioTra: '12:00', demCuoiTuan: [5, 6], mucCong: 400_000, thongBaoTat: [],
};
const dvCn = (tq: Partial<TongQuanCaNhan> = {}): DichVuCaNhan => ({ doc: vi.fn(async () => ({ ...TQ, ...tq })) });

async function ve(vai: 'chu_nha' | 'sale', dv: DichVuCaNhan | undefined = dvCn()) {
  const onMo = vi.fn();
  const onDangXuat = vi.fn();
  render(<CaNhan vai={vai} dv={dv} onMo={onMo} onDangXuat={onDangXuat} />);
  if (dv) await screen.findByText('Chị Hoa');
  return { onMo, onDangXuat };
}
const nhom = (ten: string) => screen.getByRole('region', { name: ten });

describe('YC1.3 · tab Cá nhân', () => {
  it('YC1.3 bước 1 đầu trang: chữ cái đầu, tên hiển thị, số điện thoại, vai "Chủ nhà"', async () => {
    await ve('chu_nha');
    expect(screen.getByText('Chị Hoa')).toBeInTheDocument();
    expect(screen.getByText('0904118772 · Chủ nhà')).toBeInTheDocument();
    expect(screen.getByText('H')).toBeInTheDocument();
  });

  it('YC1.3-NT1 chủ nhà thấy TÀI KHOẢN, CÀI ĐẶT, DỮ LIỆU, HỖ TRỢ, không thấy BÁN PHÒNG', async () => {
    await ve('chu_nha');
    for (const t of ['Tài khoản', 'Cài đặt', 'Dữ liệu', 'Hỗ trợ']) expect(nhom(t)).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Bán phòng' })).toBeNull();
    expect(within(nhom('Dữ liệu')).getByRole('button', { name: 'Xuất file Excel (CSV)' })).toBeInTheDocument();
  });

  it('YC1.3-NT1 sale thấy TÀI KHOẢN, BÁN PHÒNG, CÀI ĐẶT, HỖ TRỢ, không thấy DỮ LIỆU; vai ghi "Sale"', async () => {
    await ve('sale');
    for (const t of ['Tài khoản', 'Bán phòng', 'Cài đặt', 'Hỗ trợ']) expect(nhom(t)).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Dữ liệu' })).toBeNull();
    expect(screen.getByText('0904118772 · Sale')).toBeInTheDocument();
    expect(within(nhom('Bán phòng')).getByRole('button', { name: /Mức cộng giá mặc định/ })).toHaveTextContent('+400k');
  });

  it('YC1.3-NT2 có 2 thông báo chưa đọc thì dòng "Thông báo" ghi 2; chủ nhà bật 3 loại thì ghi "3 loại đang bật"', async () => {
    await ve('chu_nha');
    expect(within(screen.getByRole('button', { name: /^Thông báo/ })).getByLabelText('2 chưa đọc')).toHaveTextContent('2');
    expect(screen.getByRole('button', { name: /Cài đặt thông báo/ })).toHaveTextContent('3 loại đang bật');
    expect(screen.getByRole('button', { name: /Giờ nhận, trả phòng mặc định/ })).toHaveTextContent('14:00 · 12:00');
    expect(screen.getByRole('button', { name: /Ngày tính giá cuối tuần/ })).toHaveTextContent('T6, T7');
  });

  it('YC1.3-NT2 không có thông báo chưa đọc thì không hiện số', async () => {
    await ve('chu_nha', dvCn({ soChuaDoc: 0 }));
    expect(screen.queryByLabelText(/chưa đọc/)).toBeNull();
  });

  it('YC1.3-NT3 chạm một dòng thì màn cha mở đúng màn của dòng (đúng khóa dòng)', async () => {
    const { onMo } = await ve('chu_nha');
    const thu: [string | RegExp, string][] = [
      [/^Thông báo/, 'thong-bao'], ['Thông tin cá nhân', 'ho-so'], [/Cài đặt thông báo/, 'cai-dat-thong-bao'],
      [/Giờ nhận, trả phòng/, 'gio'], [/Ngày tính giá cuối tuần/, 'dem-cuoi-tuan'], ['Xuất file Excel (CSV)', 'xuat-csv'],
      ['Hướng dẫn sử dụng', 'huong-dan'], ['Nhắn Zalo cho Home247', 'zalo'],
    ];
    for (const [ten, khoa] of thu) {
      fireEvent.click(screen.getByRole('button', { name: ten }));
      expect(onMo).toHaveBeenLastCalledWith(khoa);
    }
  });

  it('YC1.3-NT3 sale: "Link xin xem lịch", "Mức cộng giá mặc định", "Mẫu tin gửi khách" mở đúng màn; "Email đăng nhập" chỉ để xem', async () => {
    const { onMo } = await ve('sale');
    fireEvent.click(screen.getByRole('button', { name: /Link xin xem lịch/ }));
    expect(onMo).toHaveBeenLastCalledWith('link-xin-lich');
    fireEvent.click(screen.getByRole('button', { name: /Mức cộng giá mặc định/ }));
    expect(onMo).toHaveBeenLastCalledWith('muc-cong');
    fireEvent.click(screen.getByRole('button', { name: 'Mẫu tin gửi khách' }));
    expect(onMo).toHaveBeenLastCalledWith('mau-tin');
    expect(screen.getByText('Email đăng nhập')).toBeInTheDocument();
    expect(screen.getByText('hoa@vidu.test')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Email đăng nhập/ })).toBeNull();
  });

  it('YC1.3 bước 6 cuối trang có nút "Đăng xuất" và "Home247 · phiên bản 1.0"', async () => {
    await ve('chu_nha');
    expect(screen.getByRole('button', { name: 'Đăng xuất' })).toBeInTheDocument();
    expect(screen.getByText(CHU_PHIEN_BAN)).toBeInTheDocument();
  });

  it('YC1.3-NT4 bấm "Đăng xuất" lần đầu chỉ hỏi xác nhận, chưa đăng xuất; "Hủy" thì về như cũ; xác nhận mới đăng xuất', async () => {
    const { onDangXuat } = await ve('chu_nha');
    fireEvent.click(screen.getByRole('button', { name: 'Đăng xuất' }));
    expect(screen.getByText(CAU_XAC_NHAN_DANG_XUAT)).toBeInTheDocument();
    expect(onDangXuat).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Hủy' }));
    expect(screen.queryByText(CAU_XAC_NHAN_DANG_XUAT)).toBeNull();
    expect(onDangXuat).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Đăng xuất' }));
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận đăng xuất' }));
    expect(onDangXuat).toHaveBeenCalledTimes(1);
  });

  it('YC1.3 HV2 không đọc được thì hiện Thử lại và vẫn có nút Đăng xuất; Thử lại xong thì có menu', async () => {
    const doc = vi.fn().mockRejectedValueOnce(new Error('mạng')).mockResolvedValue(TQ);
    render(<CaNhan vai="chu_nha" dv={{ doc }} onMo={vi.fn()} onDangXuat={vi.fn()} />);
    expect(await screen.findByRole('button', { name: 'Thử lại' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Đăng xuất' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByText('Chị Hoa')).toBeInTheDocument();
  });
});

describe('YC1.3-NT4 · App: đăng xuất', () => {
  it('YC1.3-NT4 xác nhận đăng xuất thì hủy phiên, về A1, xóa nháp trên máy; không còn thấy dữ liệu cũ', async () => {
    window.history.replaceState(null, '', '/ca-nhan');
    localStorage.setItem('h247.nhap.can-moi', '{"luc":1,"giaTri":{"maCan":"1509"}}');
    localStorage.setItem('khoa.cua.nguoi.khac', 'giu');
    let phien: { email: string } | null = { email: 'chu1@vidu.test' };
    const dichVu = dichVuGia({
      layPhien: vi.fn(async () => phien),
      layHoSo: vi.fn(async () => ({ ten: 'Chị Hoa', soDienThoai: '0904118772', vaiChon: 'chu_nha' as const })),
      dangXuat: vi.fn(async () => { phien = null; }),
    });
    const dichVuCan: DichVuCan = { layCanCuaToi: vi.fn(async () => []), caNhan: dvCn() };
    render(<App dichVu={dichVu} dichVuCan={dichVuCan} />);
    expect(await screen.findByText('Chị Hoa')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Đăng xuất' }));
    expect(dichVu.dangXuat).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận đăng xuất' }));
    expect(await screen.findByRole('button', { name: /Đăng nhập/ })).toBeInTheDocument(); // A1
    await waitFor(() => expect(screen.queryByText('Chị Hoa')).toBeNull());
    expect(dichVu.dangXuat).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('h247.nhap.can-moi')).toBeNull();
    expect(localStorage.getItem('khoa.cua.nguoi.khac')).toBe('giu');
    expect(window.location.pathname).toBe('/');
  });

  it('YC1.3 bước 1 App: chủ nhà mở tab Cá nhân từ thanh tab thì thấy P1 với số thông báo chưa đọc', async () => {
    const dichVu = dichVuGia({
      layPhien: vi.fn(async () => ({ email: 'chu1@vidu.test' })),
      layHoSo: vi.fn(async () => ({ ten: 'Chị Hoa', soDienThoai: '0904118772', vaiChon: 'chu_nha' as const })),
    });
    render(<App dichVu={dichVu} dichVuCan={{ layCanCuaToi: vi.fn(async () => []), caNhan: dvCn() }} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Cá nhân' }));
    expect(await screen.findByText('0904118772 · Chủ nhà')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/ca-nhan');
  });
});
