// Test unit App với dịch vụ giả: chọn màn theo phiên và hồ sơ (YC1.2, YC1 Quy tắc của nhóm).
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { dichVuGia } from './man/gia';
import { LoiDangKy, CAU_SO_TRUNG } from './lib/xacThuc';

afterEach(cleanup);
beforeEach(() => { sessionStorage.clear(); window.history.replaceState(null, '', '/'); });

describe('YC1.2 · App chọn màn', () => {
  it('YC1.2-NT1 chưa đăng nhập mở /lich thì thấy A1, không thấy app', async () => {
    window.history.replaceState(null, '', '/lich');
    render(<App dichVu={dichVuGia()} />);
    expect(await screen.findByRole('button', { name: 'Tạo tài khoản' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tôi đã có tài khoản · Đăng nhập' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Lịch' })).toBeNull();
  });

  it('YC1.2-NT1 chưa đăng nhập mở link mời thì xem trước, không về A1 (QD8)', async () => {
    window.history.replaceState(null, '', '/l/Ab3xYz9k');
    render(<App dichVu={dichVuGia()} />);
    expect(await screen.findByRole('button', { name: 'Bắt đầu ngay' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Tạo tài khoản' })).toBeNull();
  });

  it('YC1.2 A1 bấm "Tạo tài khoản" sang A2, bấm "Tôi đã có tài khoản · Đăng nhập" sang A11', async () => {
    render(<App dichVu={dichVuGia()} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Tạo tài khoản' }));
    expect(await screen.findByRole('heading', { name: 'Tạo tài khoản' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Tôi đã có tài khoản · Đăng nhập' }));
    expect(await screen.findByRole('heading', { name: 'Đăng nhập' })).toBeInTheDocument();
  });

  it('YC1.2 đã đăng nhập, đã chọn vai thì vào thẳng tab Lịch', async () => {
    const dv = dichVuGia({
      layPhien: vi.fn(async () => ({ email: 'chu1@vidu.test' })),
      layHoSo: vi.fn(async () => ({ ten: 'Chị Hoa', soDienThoai: '0900000001', vaiChon: 'chu_nha' as const })),
    });
    render(<App dichVu={dv} />);
    expect(await screen.findByRole('heading', { name: 'Lịch' })).toBeInTheDocument();
  });

  it('YC1.2 bước 5 luồng đăng nhập: hồ sơ chưa có số thì chỉ thấy màn nhập lại số, lưu xong mới vào app', async () => {
    let coSo = false;
    const dv = dichVuGia({
      layPhien: vi.fn(async () => ({ email: 'chu1@vidu.test' })),
      layHoSo: vi.fn(async () => ({ ten: 'Chị Hoa', soDienThoai: coSo ? '0900000001' : null, vaiChon: 'chu_nha' as const })),
      dangKy: vi.fn(async () => { coSo = true; }),
    });
    window.history.replaceState(null, '', '/lich');
    render(<App dichVu={dv} />);
    expect(await screen.findByRole('heading', { name: 'Nhập lại số điện thoại' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Họ và tên')).toBeNull();
    fireEvent.change(screen.getByLabelText('Số điện thoại'), { target: { value: '12ab' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    expect(await screen.findByText('Số điện thoại cần từ 9 đến 15 chữ số.')).toBeInTheDocument();
    expect(dv.dangKy).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Số điện thoại'), { target: { value: '0900 000 001' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    expect(await screen.findByRole('heading', { name: 'Lịch' })).toBeInTheDocument();
    expect(dv.dangKy).toHaveBeenCalledWith('Chị Hoa', '0900 000 001');
  });

  it('YC1.2 bước 5 luồng tạo tài khoản: số đã thuộc tài khoản khác thì về A2 với lỗi dưới ô số', async () => {
    let coPhien = false;
    const dv = dichVuGia({
      layPhien: vi.fn(async () => (coPhien ? { email: 'chu1@vidu.test' } : null)),
      layHoSo: vi.fn(async () => ({ ten: null, soDienThoai: null, vaiChon: null })),
      guiMa: vi.fn(async (_e: string, taoMoi: boolean) => (taoMoi ? 'da-gui' as const : 'chua-co-tai-khoan' as const)),
      xacNhanMa: vi.fn(async () => { coPhien = true; return 'dung' as const; }),
      dangKy: vi.fn(async () => { throw new LoiDangKy('so', CAU_SO_TRUNG); }),
    });
    render(<App dichVu={dv} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Tạo tài khoản' }));
    fireEvent.change(screen.getByLabelText('Họ và tên'), { target: { value: 'Chị Hoa' } });
    fireEvent.change(screen.getByLabelText('Số điện thoại'), { target: { value: '0900000003' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'chu1@vidu.test' } });
    fireEvent.click(screen.getByRole('button', { name: 'Gửi mã xác nhận' }));
    fireEvent.change(await screen.findByLabelText('Số thứ 1'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận' }));
    expect(await screen.findByText(CAU_SO_TRUNG)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Tạo tài khoản' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText('Số điện thoại')).toHaveValue('0900000003'));
    expect(screen.getByLabelText('Họ và tên')).toHaveValue('Chị Hoa');
  });
});
