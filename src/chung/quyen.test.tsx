// Test unit HV4 · Xin quyền và HV5 · Không còn quyền.
import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { KhongConQuyen, TheXinQuyen, xinQuyen } from './quyen';

afterEach(cleanup);

describe('HV4 · Xin quyền', () => {
  it('HV4: thẻ giải thích của app hiện trước, chưa gọi hộp thoại', () => {
    const dongY = vi.fn();
    render(<TheXinQuyen giaiThich="Bật thông báo để biết khi có yêu cầu đặt phòng" onDongY={dongY} onDong={() => {}} />);
    expect(dongY).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    expect(dongY).toHaveBeenCalled();
  });

  it('HV4: đã từ chối thì chỉ cách bật lại, không có nút gọi lại hộp thoại', () => {
    render(<TheXinQuyen giaiThich="Cần quyền." daTuChoi onDongY={() => {}} onDong={() => {}} />);
    expect(screen.queryByRole('button', { name: 'Tiếp tục' })).toBeNull();
    expect(screen.getByText(/cài đặt của trình duyệt/)).toBeInTheDocument();
  });

  it('HV4: từ chối hay lỗi không ném lỗi', async () => {
    expect(await xinQuyen(async () => { throw new Error('denied'); })).toBe(false);
    expect(await xinQuyen(async () => true)).toBe(true);
  });
});

describe('HV5 · Không còn quyền xem', () => {
  it('HV5-NT1: hiện "Bạn không còn xem được mục này", lý do và nút Về Lịch', () => {
    const ve = vi.fn();
    render(<KhongConQuyen lyDo="Chủ nhà đã ngừng chia sẻ lịch" onVe={ve} />);
    expect(screen.getByText('Bạn không còn xem được mục này')).toBeInTheDocument();
    expect(screen.getByText('Chủ nhà đã ngừng chia sẻ lịch')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Về Lịch' }));
    expect(ve).toHaveBeenCalled();
  });

  it('HV5-NT2: lý do "Chủ nhà đã xóa tài khoản"', () => {
    render(<KhongConQuyen lyDo="Chủ nhà đã xóa tài khoản" onVe={() => {}} />);
    expect(screen.getByText('Chủ nhà đã xóa tài khoản')).toBeInTheDocument();
  });
});
