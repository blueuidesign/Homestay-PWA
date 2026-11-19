// Test unit A5 · Sale mới, chưa có nguồn phòng (YC6.4 bước 1) và tab Lịch của sale chưa có nguồn (ManLich).
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../chung/Toast';
import type { DichVuXinLich, SoDemXinLich } from '../lib/dichVuXinLich';
import { A5ChuaCoNguon } from './A5ChuaCoNguon';
import { ManLich } from './ManTam';

afterEach(cleanup);

const SO: SoDemXinLich = { ma: null, soLanGui: 0, guiCuoiLuc: null, soChuDongY: 0, coNguon: false };

function dv(so: Partial<SoDemXinLich> = {}): DichVuXinLich {
  return {
    doc: vi.fn(async () => ({ ...SO, ...so })),
    layLink: vi.fn(async () => 'kQmZpRtwXyAbCdEf'),
    ghiLanGui: vi.fn(async () => ({ soLanGui: 1, guiCuoiLuc: new Date().toISOString() })),
  };
}

describe('YC6.4 · A5 Sale mới, chưa có nguồn phòng', () => {
  it('YC6.4 A5 hiện chữ theo canvas và nút "Gửi tin nhắn xin lịch đến chủ nhà"', () => {
    const onXinLich = vi.fn();
    render(<A5ChuaCoNguon onXinLich={onXinLich} onThemCan={() => {}} />);
    expect(screen.getByRole('heading', { name: 'Lịch phòng' })).toBeInTheDocument();
    expect(screen.getByText('Chưa có nguồn phòng')).toBeInTheDocument();
    expect(screen.getByText('Xin chủ nhà gửi link mời để thấy lịch phòng trống. Chủ chưa dùng app thì tự nhập căn.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Thêm căn thủ công/ })).toBeInTheDocument();
    expect(screen.getByText('Mở link trong tin nhắn Zalo của chủ nhà, lịch sẽ hiện ở đây.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Gửi tin nhắn xin lịch đến chủ nhà' }));
    expect(onXinLich).toHaveBeenCalledOnce();
  });

  it('YC6.4-NT1 sale bấm "Gửi tin nhắn xin lịch đến chủ nhà" ở A5 thì app mở A6 có tin soạn sẵn và link', async () => {
    const d = dv();
    render(<ToastProvider><ManLich vai="sale" ten="Sale Hùng" dv={d} onDangXuat={() => {}} /></ToastProvider>);
    fireEvent.click(await screen.findByRole('button', { name: 'Gửi tin nhắn xin lịch đến chủ nhà' }));
    expect(await screen.findByRole('heading', { name: 'Xin chủ nhà cho xem lịch' })).toBeInTheDocument();
    const tin = await screen.findByLabelText('Tin nhắn sẽ gửi');
    expect(tin.textContent).toContain('Chào anh/chị, em là Sale Hùng, sale phòng ở Hạ Long.');
    expect(tin.textContent).toContain(`${window.location.origin}/x/kQmZpRtwXyAbCdEf`);
    expect(d.layLink).toHaveBeenCalledOnce();
    expect(d.ghiLanGui).not.toHaveBeenCalled();
  });

  it('YC6.4 bước 4 sale đã có nguồn phòng thì không hiện A5', async () => {
    render(<ToastProvider><ManLich vai="sale" ten="Sale Hùng" dv={dv({ coNguon: true })} onDangXuat={() => {}} /></ToastProvider>);
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Lịch' })).toBeInTheDocument());
    expect(screen.queryByText('Chưa có nguồn phòng')).toBeNull();
  });

  it('YC6.4 "Thêm căn thủ công" chưa làm (US56): báo tạm, không đứng im', async () => {
    render(<ToastProvider><ManLich vai="sale" ten="Sale Hùng" dv={dv()} onDangXuat={() => {}} /></ToastProvider>);
    fireEvent.click(await screen.findByRole('button', { name: /Thêm căn thủ công/ }));
    expect(await screen.findByText('Thêm căn tự nhập sẽ có ở bản sau')).toBeInTheDocument();
  });
});
