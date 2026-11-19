// Test unit A6 · Soạn tin xin link (YC6.4 bước 1 đến 3, pwa.md P3, HV6, HV8).
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../chung/Toast';
import type { DichVuXinLich } from '../lib/dichVuXinLich';
import { A6XinLich } from './A6XinLich';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
  Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
});

const MA = 'kQmZpRtwXyAbCdEf';

function dv(): Pick<DichVuXinLich, 'layLink' | 'ghiLanGui'> {
  return {
    layLink: vi.fn(async () => MA),
    ghiLanGui: vi.fn(async () => ({ soLanGui: 4, guiCuoiLuc: new Date().toISOString() })),
  };
}

function ve(d = dv(), onDaGui = vi.fn()) {
  render(<ToastProvider><A6XinLich ten="Sale Hùng" dv={d} onQuayLai={() => {}} onDaGui={onDaGui} /></ToastProvider>);
  return { d, onDaGui };
}

describe('YC6.4 · A6 Soạn tin xin link', () => {
  it('YC6.4-NT1 A6 có tin soạn sẵn, link xin lịch của sale và ba bước "Sau khi gửi"', async () => {
    ve();
    const tin = await screen.findByLabelText('Tin nhắn sẽ gửi');
    expect(tin.textContent).toContain('Chào anh/chị, em là Sale Hùng, sale phòng ở Hạ Long.');
    expect(tin.textContent).toContain(`${window.location.origin}/x/${MA}`);
    expect(screen.getByText('Một link dùng được cho nhiều chủ nhà.')).toBeInTheDocument();
    expect(screen.getByText('Chủ nhà mở link trong Zalo')).toBeInTheDocument();
    expect(screen.getByText('Chủ nhà bấm "Đồng ý cho xem lịch"')).toBeInTheDocument();
    expect(screen.getByText('Lịch của chủ hiện trong Nguồn phòng')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Quay lại' })).toBeInTheDocument();
  });

  it('YC6.4-NT2 bấm "Chia sẻ" thì bảng chia sẻ mở với tin và link, và ghi thêm một lần gửi', async () => {
    const share = vi.fn(async () => {});
    Object.defineProperty(navigator, 'share', { value: share, configurable: true });
    const { d, onDaGui } = ve();
    await screen.findByLabelText('Tin nhắn sẽ gửi');
    fireEvent.click(screen.getByRole('button', { name: 'Chia sẻ' }));
    await waitFor(() => expect(onDaGui).toHaveBeenCalledOnce());
    expect(share).toHaveBeenCalledOnce();
    const text = (share.mock.calls[0] as unknown as [{ text: string }])[0].text;
    expect(text).toContain('Chào anh/chị, em là Sale Hùng');
    expect(text).toContain(`${window.location.origin}/x/${MA}`);
    expect(d.ghiLanGui).toHaveBeenCalledOnce();
  });

  it('YC6.4 bước 3 bấm "Sao chép tin nhắn": sao chép tin, toast "Đã sao chép", ghi một lần gửi', async () => {
    const writeText = vi.fn(async () => {});
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    const { d, onDaGui } = ve();
    await screen.findByLabelText('Tin nhắn sẽ gửi');
    fireEvent.click(screen.getByRole('button', { name: 'Sao chép tin nhắn' }));
    expect(await screen.findByText(/Đã sao chép/)).toBeInTheDocument();
    expect((writeText.mock.calls[0] as unknown as [string])[0]).toContain(`/x/${MA}`);
    await waitFor(() => expect(onDaGui).toHaveBeenCalledOnce());
    expect(d.ghiLanGui).toHaveBeenCalledOnce();
  });

  it('YC6.4 HV6 máy không chia sẻ, không sao chép được: báo, không ghi lần gửi', async () => {
    const { d, onDaGui } = ve();
    await screen.findByLabelText('Tin nhắn sẽ gửi');
    fireEvent.click(screen.getByRole('button', { name: 'Chia sẻ' }));
    expect(await screen.findByText(/Trình duyệt này chưa làm được việc này/)).toBeInTheDocument();
    expect(d.ghiLanGui).not.toHaveBeenCalled();
    expect(onDaGui).not.toHaveBeenCalled();
  });

  it('YC6.4 HV2 chưa lấy được link thì báo và Thử lại', async () => {
    const d = dv();
    (d.layLink as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('mạng'));
    ve(d);
    fireEvent.click(await screen.findByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByLabelText('Tin nhắn sẽ gửi')).toBeInTheDocument();
  });
});
