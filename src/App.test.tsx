// Test unit cho vỏ app (EN1): app dựng được và hiện tên app.
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('EN1 · vỏ app', () => {
  it('hiện tên Home247', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Home247' })).toBeInTheDocument();
  });
});

// US37 · YC6.3 bước 3, QD8: đến từ link mời thì vai sale được chọn sẵn, sang thẳng A10.
import { cleanup, fireEvent, waitFor } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import type { DichVuCan } from './lib/dichVuCan';
import type { HoSo } from './lib/dieuHuong';
import type { XemTruocHopLe } from './lib/dichVuLinkMoi';
import type { DichVuXacThuc } from './lib/xacThuc';

const XT: XemTruocHopLe = {
  trangThai: 'hop_le', tenChu: 'Anh Tuấn', soCan: 2, daThem: false, cuaMinh: false, saiVai: false,
  can: [{ maCan: '1103', soPhongNgu: 3, soGiuong: 2, loaiView: null, tenToa: 'Sapphire', anh: null },
        { maCan: '2208', soPhongNgu: 1, soGiuong: 1, loaiView: null, tenToa: 'À La Carte', anh: null }],
};

function dichVuDaDangNhap(hoSo: HoSo): DichVuXacThuc {
  let hs = hoSo;
  return {
    layPhien: vi.fn(async () => ({ email: 'sale@vidu.test' })),
    guiMa: vi.fn(async () => 'da-gui' as const),
    xacNhanMa: vi.fn(async () => 'dung' as const),
    layHoSo: vi.fn(async () => hs),
    dangKy: vi.fn(async () => undefined),
    chonVai: vi.fn(async (vai) => { hs = { ...hs, vaiChon: vai }; }),
    dangXuat: vi.fn(async () => undefined),
    theoDoiPhien: () => () => {},
  };
}

function dichVuCanCoLink(): DichVuCan {
  return {
    layCanCuaToi: vi.fn(async () => []),
    linkMoi: { xemTruoc: vi.fn(async () => XT), themLich: vi.fn(async () => 'da_them' as const) },
  };
}

describe('YC6.3 · vào app từ link mời', () => {
  afterEach(() => { cleanup(); window.history.pushState(null, '', '/'); });

  it('YC6.3-NT1 đã đăng nhập từ link mời mà chưa chọn vai thì chọn sẵn vai sale, sang A10, không hiện A3', async () => {
    window.history.pushState(null, '', '/l/MaLinkTuan01');
    const dv = dichVuDaDangNhap({ ten: 'Sale Hùng', soDienThoai: '0900000003', vaiChon: null });
    render(<App dichVu={dv} dichVuCan={dichVuCanCoLink()} />);
    expect(await screen.findByRole('button', { name: 'Thêm lịch của Anh Tuấn' })).toBeInTheDocument();
    expect(dv.chonVai).toHaveBeenCalledWith('sale');
    expect(screen.queryByRole('heading', { name: 'Bạn dùng app để làm gì?' })).toBeNull();
  });

  it('YC6.3-NT4 A10-02 bấm "Thêm lịch của Anh Tuấn" thì về lịch của sale với toast "Đã thêm lịch 2 căn của Anh Tuấn"', async () => {
    window.history.pushState(null, '', '/l/MaLinkTuan01');
    const dvCan = dichVuCanCoLink();
    render(<App dichVu={dichVuDaDangNhap({ ten: 'Sale Hùng', soDienThoai: '0900000003', vaiChon: 'sale' })} dichVuCan={dvCan} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Thêm lịch của Anh Tuấn' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Đã thêm lịch 2 căn của Anh Tuấn');
    await waitFor(() => expect(window.location.pathname).toBe('/'));
    expect(screen.getByRole('heading', { name: 'Lịch' })).toBeInTheDocument();
    expect(dvCan.linkMoi!.themLich).toHaveBeenCalledWith('MaLinkTuan01');
  });

  it('YC6.3-NT2 chưa đăng nhập mở link mời thì thấy A1-link, bấm "Bắt đầu ngay" thì sang tạo tài khoản', async () => {
    window.history.pushState(null, '', '/l/MaLinkTuan01');
    const dv: DichVuXacThuc = { ...dichVuDaDangNhap({ ten: null, soDienThoai: null, vaiChon: null }), layPhien: vi.fn(async () => null) };
    render(<App dichVu={dv} dichVuCan={dichVuCanCoLink()} />);
    expect(await screen.findByText('Anh Tuấn mời bạn xem lịch 2 căn')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Bắt đầu ngay' }));
    expect(await screen.findByRole('heading', { name: 'Tạo tài khoản' })).toBeInTheDocument();
  });
});
