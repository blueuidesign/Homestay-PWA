// Test unit A1-link, A1-link-01 (YC6.3 bước 2, YC6-H10, QD8). Tên, căn theo DLM; không có dữ liệu thật.
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { XemTruocHopLe } from '../lib/dichVuLinkMoi';
import { A1Link } from './A1Link';

afterEach(cleanup);

const XEM_TRUOC_TUAN: XemTruocHopLe = {
  trangThai: 'hop_le', tenChu: 'Anh Tuấn', soCan: 2, daThem: false, cuaMinh: false, saiVai: false,
  can: [
    { maCan: '1103', soPhongNgu: 3, soGiuong: 2, loaiView: 'view thành phố', tenToa: 'Sapphire', anh: 'https://anh.vidu.test/1103.jpg' },
    { maCan: '2208', soPhongNgu: 1, soGiuong: 1, loaiView: 'view biển', tenToa: 'À La Carte', anh: 'https://anh.vidu.test/2208.jpg' },
  ],
};

describe('YC6.3 · A1-link', () => {
  it('YC6.3-NT2 chưa đăng nhập mở link mời của chủ nhà có 2 căn: tên chủ nhà, "2 căn", không giá, không chữ "Đăng nhập"', () => {
    const onBatDau = vi.fn();
    render(<A1Link xemTruoc={XEM_TRUOC_TUAN} onBatDau={onBatDau} />);
    expect(screen.getByText('Anh Tuấn mời bạn xem lịch 2 căn')).toBeInTheDocument();
    expect(screen.getByText('Bấm Bắt đầu ngay để xem lịch và giá mới nhất')).toBeInTheDocument();
    expect(screen.getByText('Lịch phòng Hạ Long')).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/Đăng nhập/);
    expect(document.body.textContent).not.toMatch(/\d[\d.,]*\s*(đ|k|tr)\b/);
    fireEvent.click(screen.getByRole('button', { name: 'Bắt đầu ngay' }));
    expect(onBatDau).toHaveBeenCalledOnce();
  });

  it('YC6.3 A1-link-01 YC6-H10 link đã thu hồi hay người tạo đã xóa tài khoản: "Link mời không còn dùng được."', () => {
    render(<A1Link xemTruoc={{ trangThai: 'khong_dung_duoc' }} onBatDau={() => {}} />);
    expect(screen.getByText('Link mời không còn dùng được.')).toBeInTheDocument();
    expect(screen.getByText('Nhờ chủ nhà gửi link mới.')).toBeInTheDocument();
    expect(screen.queryByText(/mời bạn xem lịch/)).toBeNull();
    expect(screen.getByRole('button', { name: 'Bắt đầu ngay' })).toBeInTheDocument();
  });

  it('YC6.3 A1-link-01 YC6-H10 link quá 21 ngày: "Link mời đã hết hạn."', () => {
    render(<A1Link xemTruoc={{ trangThai: 'het_han' }} onBatDau={() => {}} />);
    expect(screen.getByText('Link mời đã hết hạn.')).toBeInTheDocument();
    expect(screen.getByText('Nhờ chủ nhà gửi link mới.')).toBeInTheDocument();
  });
});
