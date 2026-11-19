// Test unit A3, A3-00 · Chọn vai (YC1.1).
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { ToastProvider } from '../chung/Toast';
import { A3ChonVai } from './A3ChonVai';

afterEach(cleanup);

function ve(onChon = vi.fn(async () => {})) {
  render(<ToastProvider><A3ChonVai onChon={onChon} /></ToastProvider>);
  return onChon;
}
const theChu = () => screen.getByRole('radio', { name: /Tôi là chủ nhà/ });
const theSale = () => screen.getByRole('radio', { name: /Tôi là sale/ });

describe('YC1.1 · A3 Chọn vai', () => {
  it('YC1.1 bước 3 A3 có câu hỏi và hai thẻ với dòng mô tả', () => {
    ve();
    expect(screen.getByRole('heading', { name: 'Bạn dùng app để làm gì?' })).toBeInTheDocument();
    expect(screen.getByText('Ghi lịch phòng, đặt giá, mời sale xem lịch.')).toBeInTheDocument();
    expect(screen.getByText('Tìm phòng trống, gửi ảnh và giá cho khách.')).toBeInTheDocument();
  });

  it('YC1.1-NT4 chưa chạm thẻ nào thì "Tiếp tục" không bấm được và có dòng "Chọn một mục để tiếp tục"', () => {
    const onChon = ve();
    expect(theChu()).not.toBeChecked();
    expect(theSale()).not.toBeChecked();
    const nut = screen.getByRole('button', { name: 'Tiếp tục' });
    expect(nut).toBeDisabled();
    expect(screen.getByText('Chọn một mục để tiếp tục')).toBeInTheDocument();
    fireEvent.click(nut);
    expect(onChon).not.toHaveBeenCalled();
  });

  it('YC1.1-NT3 chạm "Tôi là sale" rồi "Tôi là chủ nhà" thì chỉ thẻ chủ nhà ở trạng thái chọn', () => {
    ve();
    fireEvent.click(theSale());
    expect(theSale()).toBeChecked();
    fireEvent.click(theChu());
    expect(theChu()).toBeChecked();
    expect(theSale()).not.toBeChecked();
    expect(screen.getAllByRole('radio').filter((r) => r.getAttribute('aria-checked') === 'true')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Tiếp tục' })).toBeEnabled();
    expect(screen.queryByText('Chọn một mục để tiếp tục')).toBeNull();
  });

  it('YC1.1 bước 5 chọn thẻ rồi bấm "Tiếp tục" thì gửi đúng vai', async () => {
    const onChon = ve();
    fireEvent.click(theChu());
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    expect(onChon).toHaveBeenCalledWith('chu_nha');
  });

  it('YC1.1 Luật kiểm: database từ chối thì hiện câu lỗi, vẫn ở A3', async () => {
    ve(vi.fn(async () => { throw new LoiNguoiDung('Vai không hợp lệ'); }));
    fireEvent.click(theSale());
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    expect(await screen.findByText('Vai không hợp lệ')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Bạn dùng app để làm gì?' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tiếp tục' })).toBeEnabled();
  });
});
