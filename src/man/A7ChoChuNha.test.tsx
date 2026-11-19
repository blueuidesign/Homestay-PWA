// Test unit A7, A7-00, A7-01 · Chờ chủ nhà (YC6.4 bước 4, 5).
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../chung/Toast';
import type { DichVuXinLich, SoDemXinLich } from '../lib/dichVuXinLich';
import { A7ChoChuNha } from './A7ChoChuNha';
import { ManLich } from './ManTam';

afterEach(() => {
  cleanup();
  Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
});

const SO: SoDemXinLich = { ma: 'kQmZpRtw', soLanGui: 3, guiCuoiLuc: '2026-11-19T07:20:00Z', soChuDongY: 0, coNguon: false };
const BAY = new Date('2026-11-19T10:00:00Z');

describe('YC6.4 · A7 Chờ chủ nhà', () => {
  it('YC6.4-NT3 sale ở A7 chỉ thấy hai con số, không có danh sách tên chủ nhà', () => {
    render(<A7ChoChuNha so={SO} bayGio={BAY} onGuiLink={() => {}} onThemCan={() => {}} />);
    expect(screen.getByText('Đang chờ chủ nhà đồng ý')).toBeInTheDocument();
    expect(screen.getByText(/Lần gửi gần nhất lúc 14:20 hôm nay\./)).toBeInTheDocument();
    expect(screen.getByText('Link xin lịch của bạn')).toBeInTheDocument();
    const so = screen.getAllByRole('group');
    expect(so.map((g) => g.textContent)).toEqual(['3 lầnđã chia sẻ', '0 chủ nhàđã đồng ý']);
    expect(screen.queryAllByRole('list')).toHaveLength(0);
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    expect(screen.getByText(/App chỉ đếm số lần bạn gửi và số chủ nhà đã đồng ý\./)).toBeInTheDocument();
    expect(screen.getByText('Chủ nhà lâu chưa trả lời? Nhắn hoặc gọi để nhắc chủ mở link.')).toBeInTheDocument();
  });

  it('YC6.4-NT3 có chủ nhà đã đồng ý vẫn chỉ là con số, không có tên', () => {
    render(<A7ChoChuNha so={{ ...SO, soChuDongY: 2 }} bayGio={BAY} onGuiLink={() => {}} onThemCan={() => {}} />);
    expect(screen.getByRole('group', { name: '2 chủ nhà đã đồng ý' })).toBeInTheDocument();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  it('YC6.4 bước 4 A7-00 chưa gửi lần nào: 0 lần, nút "Gửi tin nhắn xin lịch cho chủ nhà"', () => {
    const onGuiLink = vi.fn();
    render(<A7ChoChuNha so={{ ...SO, soLanGui: 0, guiCuoiLuc: null }} bayGio={BAY} onGuiLink={onGuiLink} onThemCan={() => {}} />);
    expect(screen.getByText('Chưa gửi link xin lịch')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: '0 lần đã chia sẻ' })).toBeInTheDocument();
    expect(screen.queryByText(/Chủ nhà lâu chưa trả lời/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Gửi tin nhắn xin lịch cho chủ nhà' }));
    expect(onGuiLink).toHaveBeenCalledOnce();
  });

  it('YC6.4 A7-01 sau khi chia sẻ: dải "✓ Đã chia sẻ. Đang chờ chủ nhà đồng ý.", "vừa xong"', () => {
    render(<A7ChoChuNha so={{ ...SO, soLanGui: 4, guiCuoiLuc: BAY.toISOString() }} vuaGui bayGio={BAY}
                        onGuiLink={() => {}} onThemCan={() => {}} />);
    expect(screen.getByRole('status')).toHaveTextContent('✓ Đã chia sẻ. Đang chờ chủ nhà đồng ý.');
    expect(screen.getByText(/Lần gửi gần nhất lúc vừa xong\./)).toBeInTheDocument();
    expect(screen.getByRole('group', { name: '4 lần đã chia sẻ' })).toBeInTheDocument();
  });

  it('YC6.4 bước 5 bấm "Gửi link cho chủ nhà khác" ở A7 thì mở lại A6 với cùng link; chia sẻ xong về A7-01', async () => {
    const share = vi.fn(async () => {});
    Object.defineProperty(navigator, 'share', { value: share, configurable: true });
    let so = { ...SO };
    const d: DichVuXinLich = {
      doc: vi.fn(async () => so),
      layLink: vi.fn(async () => 'kQmZpRtw'),
      ghiLanGui: vi.fn(async () => { so = { ...so, soLanGui: so.soLanGui + 1, guiCuoiLuc: new Date().toISOString() }; return so; }),
    };
    render(<ToastProvider><ManLich vai="sale" ten="Sale Hùng" dv={d} onDangXuat={() => {}} /></ToastProvider>);
    fireEvent.click(await screen.findByRole('button', { name: 'Gửi link cho chủ nhà khác' }));
    const tin = await screen.findByLabelText('Tin nhắn sẽ gửi');
    expect(tin.textContent).toContain('/x/kQmZpRtw');
    fireEvent.click(screen.getByRole('button', { name: 'Chia sẻ' }));
    expect(await screen.findByRole('group', { name: '4 lần đã chia sẻ' })).toBeInTheDocument();
    expect(screen.getByText('✓ Đã chia sẻ. Đang chờ chủ nhà đồng ý.')).toBeInTheDocument();
  });

  it('YC6.4 bước 4 quay lại từ A6 mà chưa gửi: A7-00', async () => {
    const d: DichVuXinLich = {
      doc: vi.fn(async () => ({ ...SO, ma: null, soLanGui: 0, guiCuoiLuc: null })),
      layLink: vi.fn(async () => 'kQmZpRtw'),
      ghiLanGui: vi.fn(),
    };
    render(<ToastProvider><ManLich vai="sale" ten="Sale Hùng" dv={d} onDangXuat={() => {}} /></ToastProvider>);
    fireEvent.click(await screen.findByRole('button', { name: 'Gửi tin nhắn xin lịch đến chủ nhà' }));
    await screen.findByLabelText('Tin nhắn sẽ gửi');
    (d.doc as ReturnType<typeof vi.fn>).mockResolvedValue({ ...SO, soLanGui: 0, guiCuoiLuc: null });
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    expect(await screen.findByText('Chưa gửi link xin lịch')).toBeInTheDocument();
  });
});
