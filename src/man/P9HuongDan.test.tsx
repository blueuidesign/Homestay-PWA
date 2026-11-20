// Test unit màn P9 Hướng dẫn sử dụng (YC1.7). Không gọi mạng.
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '../App';
import { CAU_CON_THAC_MAC, HUONG_DAN_CHU, HUONG_DAN_SALE } from '../lib/huongDan';
import { LINK_ZALO_HOME247 } from '../lib/home247';
import { dichVuGia } from './gia';
import { P9HuongDan } from './P9HuongDan';

afterEach(cleanup);

describe('YC1.7 · P9 Hướng dẫn sử dụng', () => {
  it('YC1.7 bước 1 chủ nhà mở màn thì thấy nhóm "Chủ nhà" với sáu mục thu gọn, chưa mở mục nào', () => {
    render(<P9HuongDan vai="chu_nha" onQuayLai={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Chủ nhà' })).toBeInTheDocument();
    for (const t of ['Thêm căn và ảnh', 'Đặt giá theo tháng', 'Đặt giá ngày lễ', 'Đặt phòng', 'Mời sale xem lịch', 'Sale được xem gì']) {
      expect(screen.getByRole('button', { name: t })).toHaveAttribute('aria-expanded', 'false');
    }
    expect(HUONG_DAN_CHU.muc).toHaveLength(6);
  });

  it('YC1.7-NT1 chạm "Đặt giá theo tháng" thì thấy 3 bước theo thứ tự; chạm lại thì thu gọn', () => {
    render(<P9HuongDan vai="chu_nha" onQuayLai={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Đặt giá theo tháng' }));
    const ds = document.querySelectorAll('ol.p9-buoc > li');
    expect([...ds].map((l) => l.textContent)).toEqual([
      'Mở căn, chọn tab Giá.', 'Chạm tháng bắt đầu rồi tháng kết thúc.', 'Nhập giá ngày thường, cuối tuần, bấm Áp dụng.',
    ]);
    fireEvent.click(screen.getByRole('button', { name: 'Đặt giá theo tháng' }));
    expect(document.querySelectorAll('ol.p9-buoc')).toHaveLength(0);
  });

  it('YC1.7 bước 1 chỉ mở một mục một lúc', () => {
    render(<P9HuongDan vai="chu_nha" onQuayLai={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Đặt phòng' }));
    fireEvent.click(screen.getByRole('button', { name: 'Đặt giá theo tháng' }));
    expect(document.querySelectorAll('ol.p9-buoc')).toHaveLength(1);
  });

  it('YC1.7-NT2 bấm "Nhắn Zalo cho Home247" thì app mở đường dẫn chat Zalo của Home247', () => {
    const moZalo = vi.fn();
    render(<P9HuongDan vai="chu_nha" onQuayLai={vi.fn()} moZalo={moZalo} />);
    expect(screen.getByText(CAU_CON_THAC_MAC)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Nhắn Zalo cho Home247' }));
    expect(moZalo).toHaveBeenCalledWith(LINK_ZALO_HOME247);
    expect(LINK_ZALO_HOME247).toMatch(/^https:\/\/zalo\.me\//);
  });

  it('YC1.7-NT2 mặc định (không truyền moZalo) mở link bằng window.open ở tab mới', () => {
    const mo = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<P9HuongDan vai="sale" onQuayLai={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Nhắn Zalo cho Home247' }));
    expect(mo).toHaveBeenCalledWith(LINK_ZALO_HOME247, '_blank', 'noopener,noreferrer');
    mo.mockRestore();
  });

  it('YC1-H10 sale thấy nhóm "Sale" với hướng dẫn riêng, không thấy mục của chủ nhà', () => {
    render(<P9HuongDan vai="sale" onQuayLai={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Sale' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Gửi ảnh và giá cho khách' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Đặt giá theo tháng' })).toBeNull();
    expect(HUONG_DAN_SALE.muc.length).toBeGreaterThan(0);
  });

  it('YC1.7 bước 1 nối vào app: Cá nhân chạm "Hướng dẫn sử dụng" mở P9; Quay lại về Cá nhân', async () => {
    sessionStorage.clear();
    window.history.replaceState(null, '', '/ca-nhan');
    const hoSo = dichVuGia({
      layPhien: vi.fn(async () => ({ email: 'chu1@vidu.test' })),
      layHoSo: vi.fn(async () => ({ ten: 'Chị Hoa', soDienThoai: '0900000001', vaiChon: 'chu_nha' as const })),
    });
    const caNhan = { doc: vi.fn(async () => ({ ten: 'Chị Hoa', tenHienThi: null, soDienThoai: '0900000001', email: 'chu1@vidu.test', soChuaDoc: 0, gioNhan: '14:00', gioTra: '12:00', demCuoiTuan: [5, 6], mucCong: 0, thongBaoTat: [] })) };
    render(<App dichVu={hoSo} dichVuCan={{ layCanCuaToi: vi.fn(async () => []), caNhan }} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Hướng dẫn sử dụng' }));
    expect(await screen.findByRole('heading', { name: 'Hướng dẫn sử dụng' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/ca-nhan/huong-dan');
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    expect(await screen.findByRole('heading', { name: 'Cá nhân' })).toBeInTheDocument();
  });
});
