// Test unit màn CN7-05 Thêm sale thủ công (YC6.2 bước 4, Luật kiểm). Tên, số đều giả.
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { ToastProvider } from '../chung/Toast';
import { CN705ThemSale } from './CN705ThemSale';

afterEach(cleanup);

function ve(themSaleTay: (ten: string, so: string) => Promise<string>, onDaLuu = vi.fn()) {
  render(<ToastProvider><CN705ThemSale themSaleTay={themSaleTay} onQuayLai={vi.fn()} onDaLuu={onDaLuu} /></ToastProvider>);
  return onDaLuu;
}

describe('YC6.2 · CN7-05 Thêm sale', () => {
  it('YC6.2 bước 4 ô "Tên sale *", "Số điện thoại *", câu giải thích, nút "Lưu sale"', () => {
    ve(vi.fn());
    expect(screen.getByRole('heading', { name: 'Thêm sale' })).toBeInTheDocument();
    expect(screen.getByLabelText('Tên sale *')).toBeInTheDocument();
    expect(screen.getByLabelText('Số điện thoại *')).toHaveAttribute('inputmode', 'tel');
    expect(screen.getByText('Sale nằm ở nhóm Chưa kết nối cho tới khi mở link mời. Bạn vẫn gửi lịch cho sale qua số điện thoại này được.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Lưu sale' })).toBeInTheDocument();
  });

  it('YC6.2-NT3 "Sale Phương" 0901234567 thì gửi lệnh, lưu xong báo về danh sách', async () => {
    const them = vi.fn(async () => 'tay-1');
    const onDaLuu = ve(them);
    fireEvent.change(screen.getByLabelText('Tên sale *'), { target: { value: '  Sale Phương ' } });
    fireEvent.change(screen.getByLabelText('Số điện thoại *'), { target: { value: '0901 234 567' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu sale' }));
    await waitFor(() => expect(them).toHaveBeenCalledWith('Sale Phương', '0901234567'));
    await waitFor(() => expect(onDaLuu).toHaveBeenCalledWith('Sale Phương'));
  });

  it('YC6.2-NT3 số "090 123" bị từ chối với câu ở bảng Luật kiểm, ô số đỏ, không gửi lệnh', async () => {
    const them = vi.fn(async () => 'x');
    ve(them);
    fireEvent.change(screen.getByLabelText('Tên sale *'), { target: { value: 'Sale Phương' } });
    fireEvent.change(screen.getByLabelText('Số điện thoại *'), { target: { value: '090 123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu sale' }));
    expect(await screen.findByText('Số điện thoại chưa đúng (10 chữ số, bắt đầu bằng 0)')).toBeInTheDocument();
    expect(screen.getByLabelText('Số điện thoại *')).toHaveAttribute('aria-invalid', 'true');
    expect(them).not.toHaveBeenCalled();
  });

  it('YC6.2 Luật kiểm tên trống: "Cần nhập tên sale"', async () => {
    ve(vi.fn());
    fireEvent.change(screen.getByLabelText('Số điện thoại *'), { target: { value: '0901234567' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu sale' }));
    expect(await screen.findByText('Cần nhập tên sale')).toBeInTheDocument();
    expect(screen.getByLabelText('Tên sale *')).toHaveAttribute('aria-invalid', 'true');
  });

  it('QT5.5 database từ chối bằng câu thì câu hiện dưới ô đúng', async () => {
    const them = vi.fn().mockRejectedValue(new LoiNguoiDung('Tên dài tối đa 100 ký tự'));
    ve(them);
    fireEvent.change(screen.getByLabelText('Tên sale *'), { target: { value: 'Sale Phương' } });
    fireEvent.change(screen.getByLabelText('Số điện thoại *'), { target: { value: '0901234567' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu sale' }));
    expect(await screen.findByText('Tên dài tối đa 100 ký tự')).toBeInTheDocument();
  });

  it('HV2 mất mạng khi lưu thì toast, giữ chữ đã gõ', async () => {
    ve(vi.fn().mockRejectedValue(new TypeError('mất mạng')));
    fireEvent.change(screen.getByLabelText('Tên sale *'), { target: { value: 'Sale Phương' } });
    fireEvent.change(screen.getByLabelText('Số điện thoại *'), { target: { value: '0901234567' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu sale' }));
    expect(await screen.findByRole('status')).toBeInTheDocument();
    expect(screen.getByLabelText('Tên sale *')).toHaveValue('Sale Phương');
  });
});
