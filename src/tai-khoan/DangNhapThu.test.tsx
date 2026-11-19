// Test unit cho màn "Đăng nhập thử" của bản thử (EN3, YC1.2 bảng bước bản thử, QT5.5, HV2 bước 5).
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DangNhapThu } from './DangNhapThu';

describe('EN3 · màn Đăng nhập thử', () => {
  it('YC1.2 bước 1: có ô Email, ô Mật khẩu, nút "Đăng nhập" và dòng "Chỉ dùng cho bản thử."', () => {
    render(<DangNhapThu dangNhap={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Đăng nhập thử' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText('Mật khẩu')).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: 'Đăng nhập' })).toBeInTheDocument();
    expect(screen.getByText('Chỉ dùng cho bản thử.')).toBeInTheDocument();
  });

  it('YC1.2 bước 2: nhập đúng thì gửi email, mật khẩu đúng như đã gõ', async () => {
    const dangNhap = vi.fn().mockResolvedValue('ok');
    render(<DangNhapThu dangNhap={dangNhap} />);
    await userEvent.type(screen.getByLabelText('Email'), 'chu@example.invalid');
    await userEvent.type(screen.getByLabelText('Mật khẩu'), 'mat-khau-thu');
    await userEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));
    expect(dangNhap).toHaveBeenCalledWith('chu@example.invalid', 'mat-khau-thu');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('YC1.2 bước 3: nhập sai thì báo "Email hoặc mật khẩu chưa đúng." và ở lại màn, giữ email đã gõ', async () => {
    render(<DangNhapThu dangNhap={vi.fn().mockResolvedValue('sai')} />);
    await userEvent.type(screen.getByLabelText('Email'), 'chu@example.invalid');
    await userEvent.type(screen.getByLabelText('Mật khẩu'), 'sai');
    await userEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Email hoặc mật khẩu chưa đúng.');
    expect(screen.getByLabelText('Email')).toHaveValue('chu@example.invalid');
    expect(screen.getByRole('button', { name: 'Đăng nhập' })).toBeEnabled();
  });

  it('HV2 bước 5: lỗi khác (mất mạng, lỗi máy chủ) thì báo câu chung, không hiện chữ kỹ thuật', async () => {
    render(<DangNhapThu dangNhap={vi.fn().mockResolvedValue('loi')} />);
    await userEvent.type(screen.getByLabelText('Email'), 'chu@example.invalid');
    await userEvent.type(screen.getByLabelText('Mật khẩu'), 'x');
    await userEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Có lỗi, chưa làm được. Bấm Thử lại');
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeEnabled();
  });

  it('đang gửi thì nút khóa, bấm nhiều lần chỉ gửi một lần', async () => {
    let xong: (v: 'ok') => void = () => {};
    const dangNhap = vi.fn(() => new Promise<'ok'>((r) => { xong = r; }));
    render(<DangNhapThu dangNhap={dangNhap} />);
    await userEvent.type(screen.getByLabelText('Email'), 'chu@example.invalid');
    await userEvent.type(screen.getByLabelText('Mật khẩu'), 'x');
    const nut = screen.getByRole('button', { name: 'Đăng nhập' });
    await userEvent.click(nut);
    await userEvent.click(nut);
    expect(dangNhap).toHaveBeenCalledTimes(1);
    expect(nut).toBeDisabled();
    xong('ok');
  });
});
