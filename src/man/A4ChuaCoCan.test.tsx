// Test unit màn A4, A4-01 Chủ nhà chưa có căn (YC3.1 bước 7, 8).
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { A4ChuaCoCan } from './A4ChuaCoCan';

afterEach(cleanup);

describe('YC3.1 · A4 chủ nhà chưa có căn', () => {
  it('YC3.1-NT1 A4 có nút "Thêm căn đầu tiên"; bấm thì mở form Thêm căn', () => {
    const them = vi.fn();
    render(<A4ChuaCoCan onThemCan={them} />);
    expect(screen.getByRole('heading', { name: 'Lịch' })).toBeInTheDocument();
    expect(screen.getByText('Chưa có căn nào')).toBeInTheDocument();
    expect(screen.getByText('Thêm căn đầu tiên để bắt đầu ghi lịch và mời sale xem phòng trống.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Thêm căn đầu tiên' }));
    expect(them).toHaveBeenCalledTimes(1);
  });

  it('YC3.1 bước 7 khối "3 bước để bắt đầu" và mẹo sổ lịch cũ', () => {
    render(<A4ChuaCoCan onThemCan={vi.fn()} />);
    expect(screen.getByText('3 bước để bắt đầu')).toBeInTheDocument();
    for (const b of ['Thêm căn và ảnh', 'Đặt giá', 'Mời sale xem lịch']) expect(screen.getByText(b)).toBeInTheDocument();
    expect(screen.getByText('💡 Có sổ lịch cũ? Thêm căn trước, sau đó nhập các đặt phòng sắp tới.')).toBeInTheDocument();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('YC3.1 bước 8 bấm dòng "Thêm căn và ảnh" cũng mở form Thêm căn', () => {
    const them = vi.fn();
    render(<A4ChuaCoCan onThemCan={them} />);
    fireEvent.click(screen.getByRole('button', { name: /Thêm căn và ảnh/ }));
    expect(them).toHaveBeenCalledTimes(1);
  });

  it('YC3.1 A4-01 vừa cho Sale Hùng xem lịch thì có dải xanh nêu tên sale', () => {
    render(<A4ChuaCoCan onThemCan={vi.fn()} tenSaleVuaChoXem="Sale Hùng" />);
    expect(screen.getByRole('status')).toHaveTextContent('✓ Bạn đã cho Sale Hùng xem lịch. Thêm căn để Sale Hùng thấy phòng trống.');
    expect(screen.getByRole('button', { name: 'Thêm căn đầu tiên' })).toBeInTheDocument();
  });
});
