// Test unit A1 · Chào mừng (YC1.1, HV4).
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { A1Chao } from './A1Chao';

afterEach(cleanup);

describe('YC1.1 · A1 Chào mừng', () => {
  it('YC1.1-NT1 người chưa đăng nhập thấy A1 với hai nút, hai link, không có ô hay hộp thoại hỏi tên, số', () => {
    render(<A1Chao onTaoTaiKhoan={() => {}} onDangNhap={() => {}} />);
    expect(screen.getByText('Lịch phòng Hạ Long')).toBeInTheDocument();
    expect(screen.getByText('Lịch phòng và giá homestay, chia sẻ cho sale trong một chạm.')).toBeInTheDocument();
    for (const dong of ['Ghi lịch các phòng nhanh hơn sổ tay', 'Sale tự xem phòng trống, không cần gọi hỏi',
      'Gửi ảnh và giá phòng cho khách trong vài giây']) {
      expect(screen.getByText(dong)).toBeInTheDocument();
    }
    expect(screen.getByRole('button', { name: 'Tạo tài khoản' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tôi đã có tài khoản · Đăng nhập' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Điều khoản' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Chính sách quyền riêng tư' })).toBeInTheDocument();
    expect(screen.getByText(/Bằng việc tiếp tục, bạn đồng ý với/)).toBeInTheDocument();
    expect(screen.queryAllByRole('textbox')).toHaveLength(0);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByLabelText(/tên/i)).toBeNull();
    expect(screen.queryByLabelText(/điện thoại/i)).toBeNull();
    expect(document.querySelectorAll('input, select, textarea')).toHaveLength(0);
  });

  it('YC1.1 bước 2 bấm hai nút gọi đúng luồng', () => {
    const tao = vi.fn();
    const vao = vi.fn();
    render(<A1Chao onTaoTaiKhoan={tao} onDangNhap={vao} />);
    fireEvent.click(screen.getByRole('button', { name: 'Tạo tài khoản' }));
    fireEvent.click(screen.getByRole('button', { name: 'Tôi đã có tài khoản · Đăng nhập' }));
    expect(tao).toHaveBeenCalledTimes(1);
    expect(vao).toHaveBeenCalledTimes(1);
  });
});
