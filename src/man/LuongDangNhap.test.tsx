// Test unit màn A2, A2-01..A2-04, A11, A11-01, A11-02 (YC1.2) với dịch vụ giả.
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../chung/Toast';
import { LuongDangNhap } from './LuongDangNhap';
import { dichVuGia } from './gia';
import type { DichVuXacThuc } from '../lib/xacThuc';

afterEach(cleanup);
beforeEach(() => sessionStorage.clear());

function mo(dv: DichVuXacThuc, batDau: 'A2' | 'A11' = 'A2', xong = vi.fn()) {
  render(<ToastProvider><LuongDangNhap dichVu={dv} batDau={batDau} onVeA1={() => {}} onDaDangNhap={xong} /></ToastProvider>);
  return xong;
}
const go = (nhan: string, v: string) => fireEvent.change(screen.getByLabelText(nhan), { target: { value: v } });

describe('YC1.2 · A2 Tạo tài khoản', () => {
  it('A2 có đủ chữ theo YC1.2 bước 1', () => {
    mo(dichVuGia());
    expect(screen.getByRole('heading', { name: 'Tạo tài khoản' })).toBeInTheDocument();
    expect(screen.getByText('Sale và chủ nhà sẽ thấy tên và số điện thoại này khi kết nối với bạn.')).toBeInTheDocument();
    expect(screen.getByLabelText('Họ và tên')).toBeInTheDocument();
    expect(screen.getByLabelText('Số điện thoại')).toBeInTheDocument();
    expect(screen.getByText('Mỗi lần đăng nhập, app gửi mã về email này. Không cần mật khẩu.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Đã có tài khoản? Đăng nhập' })).toBeInTheDocument();
  });

  it('YC1.2-NT13 ô số có chữ thì A2-01 báo "Số điện thoại cần từ 9 đến 15 chữ số." và không gửi mã', async () => {
    const dv = dichVuGia();
    mo(dv);
    go('Họ và tên', 'Chị Hoa'); go('Số điện thoại', '12ab'); go('Email', 'chu1@vidu.test');
    fireEvent.click(screen.getByRole('button', { name: 'Gửi mã xác nhận' }));
    expect(await screen.findByText('Số điện thoại cần từ 9 đến 15 chữ số.')).toBeInTheDocument();
    expect(dv.guiMa).not.toHaveBeenCalled();
  });

  it('YC1.2-NT13 ô số ít hơn 9 chữ số, tên trống thì báo dưới từng ô và không gửi mã', async () => {
    const dv = dichVuGia();
    mo(dv);
    go('Số điện thoại', '09123456'); go('Email', 'chu1@vidu.test');
    fireEvent.click(screen.getByRole('button', { name: 'Gửi mã xác nhận' }));
    expect(await screen.findByText('Số điện thoại cần từ 9 đến 15 chữ số.')).toBeInTheDocument();
    expect(screen.getByText('Nhập họ và tên để sale và chủ nhà biết bạn là ai.')).toBeInTheDocument();
    expect(dv.guiMa).not.toHaveBeenCalled();
  });

  it('YC1.2 email đã có tài khoản thì A2-01 "Email này đã có tài khoản." và nút sang A11-02 không gửi thêm thư', async () => {
    const dv = dichVuGia({ guiMa: vi.fn(async () => 'da-gui' as const) });
    mo(dv);
    go('Họ và tên', 'Chị Hoa'); go('Số điện thoại', '0912 345 678'); go('Email', 'chu1@vidu.test');
    fireEvent.click(screen.getByRole('button', { name: 'Gửi mã xác nhận' }));
    expect(await screen.findByText('Email này đã có tài khoản.')).toBeInTheDocument();
    expect(dv.guiMa).toHaveBeenCalledWith('chu1@vidu.test', false);
    fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập bằng email này' }));
    expect(await screen.findByRole('heading', { name: 'Nhập mã đăng nhập' })).toBeInTheDocument();
    expect(dv.guiMa).toHaveBeenCalledTimes(1);
  });

  it('YC1.2 bước 3: đủ, đúng thì gửi mã tạo tài khoản và sang A2-02, giữ tên và số trên máy', async () => {
    const dv = dichVuGia({ guiMa: vi.fn(async (_e: string, taoMoi: boolean) => (taoMoi ? 'da-gui' as const : 'chua-co-tai-khoan' as const)) });
    mo(dv);
    go('Họ và tên', ' Chị Hoa '); go('Số điện thoại', '0912 345 678'); go('Email', 'chu1@vidu.test');
    fireEvent.click(screen.getByRole('button', { name: 'Gửi mã xác nhận' }));
    expect(await screen.findByRole('heading', { name: 'Nhập mã xác nhận' })).toBeInTheDocument();
    expect(screen.getByText('Mã 6 số đã gửi tới chu1@vidu.test')).toBeInTheDocument();
    expect(screen.getByText('Không thấy thư? Xem thêm trong mục Thư rác hoặc Quảng cáo.')).toBeInTheDocument();
    expect(screen.getByText(/Gửi lại mã sau \d+ giây/)).toBeInTheDocument();
    expect(dv.guiMa).toHaveBeenLastCalledWith('chu1@vidu.test', true);
    expect(sessionStorage.getItem('h247.dangKy')).toContain('Chị Hoa');
  });

  it('YC1.2 A2-02: chưa đủ 6 số thì nút Xác nhận không bấm được; "Đổi email" về A2 giữ các ô', async () => {
    const dv = dichVuGia({ guiMa: vi.fn(async (_e: string, taoMoi: boolean) => (taoMoi ? 'da-gui' as const : 'chua-co-tai-khoan' as const)) });
    mo(dv);
    go('Họ và tên', 'Chị Hoa'); go('Số điện thoại', '0912345678'); go('Email', 'chu1@vidu.test');
    fireEvent.click(screen.getByRole('button', { name: 'Gửi mã xác nhận' }));
    await screen.findByRole('heading', { name: 'Nhập mã xác nhận' });
    fireEvent.change(screen.getByLabelText('Số thứ 1'), { target: { value: '12345' } });
    expect(screen.getByRole('button', { name: 'Xác nhận' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Số thứ 6'), { target: { value: '6' } });
    expect(screen.getByRole('button', { name: 'Xác nhận' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Đổi email' }));
    expect(await screen.findByRole('heading', { name: 'Tạo tài khoản' })).toBeInTheDocument();
    expect(screen.getByLabelText('Họ và tên')).toHaveValue('Chị Hoa');
    expect(screen.getByLabelText('Số điện thoại')).toHaveValue('0912345678');
  });

  it('YC1.2 A2-03: mã sai thì báo và ở lại màn nhập mã; đúng thì ghi tên, số rồi vào app', async () => {
    const xacNhan = vi.fn(async (_e: string, ma: string) => (ma === '123456' ? 'dung' as const : 'sai' as const));
    const dv = dichVuGia({
      guiMa: vi.fn(async (_e: string, taoMoi: boolean) => (taoMoi ? 'da-gui' as const : 'chua-co-tai-khoan' as const)),
      xacNhanMa: xacNhan,
    });
    const xong = mo(dv);
    go('Họ và tên', 'Chị Hoa'); go('Số điện thoại', '0912.345.678'); go('Email', 'chu1@vidu.test');
    fireEvent.click(screen.getByRole('button', { name: 'Gửi mã xác nhận' }));
    await screen.findByRole('heading', { name: 'Nhập mã xác nhận' });
    fireEvent.change(screen.getByLabelText('Số thứ 1'), { target: { value: '000000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận' }));
    expect(await screen.findByText('Mã chưa đúng. Kiểm tra lại thư mới nhất, hoặc bấm "Gửi lại mã".')).toBeInTheDocument();
    expect(xong).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Số thứ 1'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận' }));
    await waitFor(() => expect(xong).toHaveBeenCalled());
    expect(dv.dangKy).toHaveBeenCalledWith('Chị Hoa', '0912.345.678');
  });

  it('YC1.2 A2-04: mã sai sau quá 1 giờ kể từ lúc gửi thì báo hết hạn, có nút "Gửi lại mã"', async () => {
    const bay = vi.spyOn(Date, 'now');
    bay.mockReturnValue(1_000_000);
    const dv = dichVuGia({
      guiMa: vi.fn(async (_e: string, taoMoi: boolean) => (taoMoi ? 'da-gui' as const : 'chua-co-tai-khoan' as const)),
      xacNhanMa: vi.fn(async () => 'sai' as const),
    });
    mo(dv);
    go('Họ và tên', 'Chị Hoa'); go('Số điện thoại', '0912345678'); go('Email', 'chu1@vidu.test');
    fireEvent.click(screen.getByRole('button', { name: 'Gửi mã xác nhận' }));
    await screen.findByRole('heading', { name: 'Nhập mã xác nhận' });
    bay.mockReturnValue(1_000_000 + 61 * 60 * 1000);
    fireEvent.change(screen.getByLabelText('Số thứ 1'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận' }));
    expect(await screen.findByText('Mã này đã hết hạn hoặc đã dùng rồi. Bấm "Gửi lại mã" để nhận mã mới.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Gửi lại mã' }));
    await waitFor(() => expect(dv.guiMa).toHaveBeenCalledTimes(3));
  });
});

describe('YC1.2 · A11 Đăng nhập', () => {
  it('A11 có đủ chữ theo YC1.2', () => {
    mo(dichVuGia(), 'A11');
    expect(screen.getByRole('heading', { name: 'Đăng nhập' })).toBeInTheDocument();
    expect(screen.getByText('Nhập email bạn đã dùng khi tạo tài khoản. App gửi mã 6 số về email đó.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Chưa có tài khoản? Tạo tài khoản' })).toBeInTheDocument();
  });

  it('YC1.2 A11-01: email chưa có tài khoản thì báo, không tạo tài khoản; nút sang A2 điền sẵn email', async () => {
    const dv = dichVuGia({ guiMa: vi.fn(async () => 'chua-co-tai-khoan' as const) });
    mo(dv, 'A11');
    go('Email', 'moi@vidu.test');
    fireEvent.click(screen.getByRole('button', { name: 'Gửi mã đăng nhập' }));
    expect(await screen.findByText('Email này chưa có tài khoản. Kiểm tra lại chính tả, hoặc tạo tài khoản mới.')).toBeInTheDocument();
    expect(dv.guiMa).toHaveBeenCalledWith('moi@vidu.test', false);
    fireEvent.click(screen.getByRole('button', { name: 'Tạo tài khoản với email này' }));
    expect(await screen.findByRole('heading', { name: 'Tạo tài khoản' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveValue('moi@vidu.test');
  });

  it('YC1.2 A11-02: email đã có thì sang nhập mã đăng nhập, mã đúng thì vào app không ghi lại tên, số', async () => {
    const dv = dichVuGia();
    const xong = mo(dv, 'A11');
    go('Email', 'chu1@vidu.test');
    fireEvent.click(screen.getByRole('button', { name: 'Gửi mã đăng nhập' }));
    expect(await screen.findByRole('heading', { name: 'Nhập mã đăng nhập' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Số thứ 1'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));
    await waitFor(() => expect(xong).toHaveBeenCalled());
    expect(dv.dangKy).not.toHaveBeenCalled();
  });
});
