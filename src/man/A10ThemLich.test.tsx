// Test unit A10, A10-01, toast A10-02 và màn link mời khi đã đăng nhập (YC6.3 bước 4, 5, 7, YC6-H14, H15, QD8).
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { ToastProvider } from '../chung/Toast';
import type { DichVuLinkMoi, XemTruocHopLe, XemTruocLink } from '../lib/dichVuLinkMoi';
import { A10ThemLich, ManLinkMoi } from './A10ThemLich';

afterEach(cleanup);

const XEM_TRUOC_TUAN: XemTruocHopLe = {
  trangThai: 'hop_le', tenChu: 'Anh Tuấn', soCan: 2, daThem: false, cuaMinh: false, saiVai: false,
  can: [
    { maCan: '1103', soPhongNgu: 3, soGiuong: 2, loaiView: 'view thành phố', tenToa: 'Sapphire', anh: 'https://anh.vidu.test/1103.jpg' },
    { maCan: '2208', soPhongNgu: 1, soGiuong: 1, loaiView: 'view biển', tenToa: 'À La Carte', anh: 'https://anh.vidu.test/2208.jpg' },
  ],
};

const khongGia = () => expect(document.body.textContent).not.toMatch(/\d[\d.,]*\s*(đ|k|tr)\b/);

function dv(lan: XemTruocLink[], them: Partial<DichVuLinkMoi> = {}): DichVuLinkMoi {
  const cuoi = lan[lan.length - 1]!;
  return { xemTruoc: vi.fn(async () => lan.shift() ?? cuoi), themLich: vi.fn(async () => 'da_them' as const), ...them };
}

describe('YC6.3 · A10 Thêm lịch', () => {
  it('YC6.3-NT2 đã đăng nhập xem trước link: tên chủ nhà, "2 căn", ảnh và sơ lược từng căn, không giá', () => {
    render(<A10ThemLich xemTruoc={XEM_TRUOC_TUAN} onThem={async () => {}} onVeLich={() => {}} />);
    expect(screen.getByRole('heading', { name: 'Thêm lịch' })).toBeInTheDocument();
    expect(screen.getByText('Anh Tuấn')).toBeInTheDocument();
    expect(screen.getByText('Chủ nhà · 2 căn')).toBeInTheDocument();
    expect(screen.getByText('Sapphire 1103')).toBeInTheDocument();
    expect(screen.getByText('3PN · 2 giường · view thành phố')).toBeInTheDocument();
    expect(screen.getByText('À La Carte 2208')).toBeInTheDocument();
    expect(screen.getByText('1PN · 1 giường · view biển')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Ảnh Sapphire 1103' })).toHaveAttribute('src', 'https://anh.vidu.test/1103.jpg');
    expect(screen.getByRole('img', { name: 'Ảnh À La Carte 2208' })).toHaveAttribute('src', 'https://anh.vidu.test/2208.jpg');
    expect(screen.getByRole('button', { name: 'Thêm lịch của Anh Tuấn' })).toBeInTheDocument();
    expect(screen.getByText('Chưa bấm thì chưa có gì vào lịch của bạn.')).toBeInTheDocument();
    khongGia();
  });

  it('YC6.3-NT5 đã thêm lịch mở lại link thì thấy A10-01, không có nút thêm', () => {
    const onVeLich = vi.fn();
    render(<A10ThemLich xemTruoc={{ ...XEM_TRUOC_TUAN, daThem: true }} onThem={async () => {}} onVeLich={onVeLich} />);
    expect(screen.getByText('Bạn đã có lịch của Anh Tuấn')).toBeInTheDocument();
    expect(screen.getByText('2 căn của Anh Tuấn đã có trong lịch của bạn. Mở lại link không thêm lần nữa.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Thêm lịch/ })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Xem lịch' }));
    expect(onVeLich).toHaveBeenCalledOnce();
  });

  it('YC6.3-NT10 YC6-H15 Anh Tuấn mở link của chính mình: không có nút "Thêm lịch"', () => {
    render(<A10ThemLich xemTruoc={{ ...XEM_TRUOC_TUAN, cuaMinh: true }} onThem={async () => {}} onVeLich={() => {}} />);
    expect(screen.getByText('Đây là link mời của bạn. Gửi link này cho sale để họ xem lịch.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Thêm lịch/ })).toBeNull();
  });

  it('YC6.3-NT10 YC6-H14 Chị Hoa (vai chủ nhà) mở link: không có nút "Thêm lịch", có "Về lịch của tôi"', () => {
    const onVeLich = vi.fn();
    render(<A10ThemLich xemTruoc={{ ...XEM_TRUOC_TUAN, saiVai: true }} onThem={async () => {}} onVeLich={onVeLich} />);
    expect(screen.getByText('Link này dành cho sale. Tài khoản của bạn đang là chủ nhà.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Thêm lịch/ })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Về lịch của tôi' }));
    expect(onVeLich).toHaveBeenCalledOnce();
  });
});

describe('YC6.3 · màn link mời', () => {
  it('YC6.3-NT2 chưa đăng nhập thì hiện A1-link với dữ liệu xem trước', async () => {
    const d = dv([XEM_TRUOC_TUAN]);
    render(<ToastProvider><ManLinkMoi ma="abc" daDangNhap={false} dv={d} onBatDau={() => {}} onVeLich={() => {}} onDaThem={() => {}} /></ToastProvider>);
    expect(await screen.findByText('Anh Tuấn mời bạn xem lịch 2 căn')).toBeInTheDocument();
    expect(d.xemTruoc).toHaveBeenCalledWith('abc');
  });

  it('YC6.3-NT4 bấm "Thêm lịch của Anh Tuấn" thì gọi thêm lịch và báo đã thêm 2 căn', async () => {
    const d = dv([XEM_TRUOC_TUAN]);
    const onDaThem = vi.fn();
    render(<ToastProvider><ManLinkMoi ma="abc" daDangNhap dv={d} onBatDau={() => {}} onVeLich={() => {}} onDaThem={onDaThem} /></ToastProvider>);
    fireEvent.click(await screen.findByRole('button', { name: 'Thêm lịch của Anh Tuấn' }));
    await waitFor(() => expect(onDaThem).toHaveBeenCalledWith(2, 'Anh Tuấn'));
    expect(d.themLich).toHaveBeenCalledWith('abc');
  });

  it('YC6.3-NT5 thêm lần nữa khi đã có kết nối thì hiện A10-01', async () => {
    const d = dv([XEM_TRUOC_TUAN, { ...XEM_TRUOC_TUAN, daThem: true }], { themLich: vi.fn(async () => 'da_co' as const) });
    const onDaThem = vi.fn();
    render(<ToastProvider><ManLinkMoi ma="abc" daDangNhap dv={d} onBatDau={() => {}} onVeLich={() => {}} onDaThem={onDaThem} /></ToastProvider>);
    fireEvent.click(await screen.findByRole('button', { name: 'Thêm lịch của Anh Tuấn' }));
    expect(await screen.findByText('Bạn đã có lịch của Anh Tuấn')).toBeInTheDocument();
    expect(onDaThem).not.toHaveBeenCalled();
  });

  it('YC6.3-NT9 link bị đổi trong lúc xem: "Thêm lịch" bị từ chối thì báo và hiện màn link hỏng', async () => {
    const d = dv([XEM_TRUOC_TUAN, { trangThai: 'khong_dung_duoc' }],
                 { themLich: vi.fn(async () => { throw new LoiNguoiDung('Link mời không còn dùng được.'); }) });
    const onDaThem = vi.fn();
    render(<ToastProvider><ManLinkMoi ma="abc" daDangNhap dv={d} onBatDau={() => {}} onVeLich={() => {}} onDaThem={onDaThem} /></ToastProvider>);
    fireEvent.click(await screen.findByRole('button', { name: 'Thêm lịch của Anh Tuấn' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Link mời không còn dùng được.');
    expect(await screen.findByText('Nhờ chủ nhà gửi link mới.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Thêm lịch/ })).toBeNull();
    expect(onDaThem).not.toHaveBeenCalled();
  });

  it('YC6.3 HV2 không tải được xem trước thì có "Thử lại"', async () => {
    const d = dv([XEM_TRUOC_TUAN], { xemTruoc: vi.fn().mockRejectedValueOnce(new Error('mạng')).mockResolvedValue(XEM_TRUOC_TUAN) });
    render(<ToastProvider><ManLinkMoi ma="abc" daDangNhap dv={d} onBatDau={() => {}} onVeLich={() => {}} onDaThem={() => {}} /></ToastProvider>);
    fireEvent.click(await screen.findByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByText('Chủ nhà · 2 căn')).toBeInTheDocument();
  });
});
