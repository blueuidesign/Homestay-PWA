// Test unit HV8 · Toast.
import { act, render, screen, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider, useToast } from './Toast';

function ManA() { const t = useToast(); return <button onClick={() => t('Đã thêm đặt phòng')}>a</button>; }
function ManB() { const t = useToast(); return <button onClick={() => t('Đã lưu giá')}>b</button>; }
function ManLoi() { const t = useToast(); return <button onClick={() => t('Chưa lưu được vì mất mạng. Kiểm tra mạng rồi bấm lại.', 'loi')}>c</button>; }

afterEach(cleanup);

describe('HV8 · Toast', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('HV8-NT1: hai màn khác nhau hiện toast cùng kiểu, cùng chỗ', () => {
    const { unmount } = render(<ToastProvider><ManA /></ToastProvider>);
    act(() => screen.getByText('a').click());
    const a = screen.getByRole('status');
    const lopA = a.className, kieuA = a.getAttribute('data-kieu');
    unmount();
    render(<ToastProvider><ManB /></ToastProvider>);
    act(() => screen.getByText('b').click());
    const b = screen.getByRole('status');
    expect(b.className).toBe(lopA);
    expect(b.getAttribute('data-kieu')).toBe(kieuA);
    expect(b.textContent).toContain('✓');
  });

  it('HV8-NT2: không chạm gì thì tự tắt sau 3 giây', () => {
    render(<ToastProvider><ManA /></ToastProvider>);
    act(() => screen.getByText('a').click());
    act(() => { vi.advanceTimersByTime(2999); });
    expect(screen.queryByRole('status')).not.toBeNull();
    act(() => { vi.advanceTimersByTime(1); });
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('HV8-NT4: toast báo việc chưa làm được thì không có dấu ✓, vẫn cùng chỗ cùng kiểu', () => {
    const { unmount } = render(<ToastProvider><ManA /></ToastProvider>);
    act(() => screen.getByText('a').click());
    const lopThuong = screen.getByRole('status').className;
    unmount();
    render(<ToastProvider><ManLoi /></ToastProvider>);
    act(() => screen.getByText('c').click());
    const t = screen.getByRole('status');
    expect(t.textContent).toBe('Chưa lưu được vì mất mạng. Kiểm tra mạng rồi bấm lại.');
    expect(t.textContent).not.toContain('✓');
    expect(t.className).toBe(lopThuong);
  });
});
