// Test unit khung tab của sale (YC7.1, US43): tab Lịch chọn A5, A7 hay S1; thanh tab không có "Tìm phòng".
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../chung/Toast';
import type { DichVuLichSale } from '../lib/dichVuLichSale';
import type { DichVuXinLich, SoDemXinLich } from '../lib/dichVuXinLich';
import type { DongLichSale } from '../lib/lichSale';
import { homNay } from '../lib/ngay';
import { ManSale } from './ManSale';

afterEach(cleanup);

const SO: SoDemXinLich = { ma: null, soLanGui: 0, guiCuoiLuc: null, soChuDongY: 0, coNguon: false };
const dvXin = (so: Partial<SoDemXinLich> = {}): DichVuXinLich => ({
  doc: vi.fn(async () => ({ ...SO, ...so })), layLink: vi.fn(async () => 'kQmZpRtwXyAbCdEf'), ghiLanGui: vi.fn(),
});

function dong(tu: string, n = 7): DongLichSale[] {
  return Array.from({ length: n }, (_, i) => ({
    canId: 'c1', nhom: 'nguon' as const, maCan: '3402', tenToa: null, tenChu: 'Chị Hoa', soPhongNgu: 1, loaiView: null,
    lichDoiLuc: null, soBan: 0, dem: new Date(Date.parse(tu + 'T00:00:00Z') + i * 86_400_000).toISOString().slice(0, 10),
    o: 'trong' as const, giaBan: 1_200_000,
  }));
}
const dvLich = (rong = false): DichVuLichSale & { doc: ReturnType<typeof vi.fn> } => ({
  doc: vi.fn(async (tu: string) => (rong ? [] : dong(tu))),
});

const tab = () => within(screen.getByRole('navigation', { name: 'Tab' })).getAllByRole('button').map((b) => b.textContent);

function ve(p: Partial<Parameters<typeof ManSale>[0]> = {}) {
  const onDangXuat = vi.fn();
  render(<ToastProvider><ManSale ten="Sale Hùng" dv={dvXin()} dvLich={dvLich(true)} onDangXuat={onDangXuat} {...p} /></ToastProvider>);
  return { onDangXuat };
}

describe('YC7.1 · khung tab của sale', () => {
  it('YC7.1-NT1 người dùng chọn "Tôi là sale" và chưa có căn nào: A5 với hai nút, thanh tab không có "Tìm phòng"', async () => {
    ve();
    expect(await screen.findByText('Chưa có nguồn phòng')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Gửi tin nhắn xin lịch đến chủ nhà' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Thêm căn thủ công/ })).toBeInTheDocument();
    expect(tab()).toEqual(['Lịch', 'Căn', 'Thống kê', 'Cá nhân']);
    expect(screen.queryByRole('button', { name: /Tìm phòng/ })).toBeNull();
    expect(screen.getByRole('button', { name: 'Lịch' })).toHaveAttribute('aria-current', 'page');
  });

  it('YC7.1 bước 1 (YC7-H8) chưa có căn mà đã gửi link xin lịch thì A7, vẫn có thanh tab của sale', async () => {
    ve({ dv: dvXin({ ma: 'kQmZpRtwXyAbCdEf', soLanGui: 2, guiCuoiLuc: new Date().toISOString() }) });
    expect(await screen.findByText('Đang chờ chủ nhà đồng ý')).toBeInTheDocument();
    expect(tab()).toEqual(['Lịch', 'Căn', 'Thống kê', 'Cá nhân']);
  });

  it('YC7.1 bước 2 có ít nhất một căn thì S1, đọc lịch 7 ngày từ hôm nay', async () => {
    const l = dvLich();
    ve({ dvLich: l });
    expect(await screen.findByText('Nguồn phòng · 1')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Lịch phòng' })).toBeInTheDocument();
    const nay = homNay();
    expect(l.doc).toHaveBeenCalledWith(nay, expect.any(String));
    expect(screen.queryByText('Chưa có nguồn phòng')).toBeNull();
  });

  it('YC7.1 bước 6 bấm › thì đọc khoảng 7 ngày sau', async () => {
    const l = dvLich();
    ve({ dvLich: l });
    fireEvent.click(await screen.findByRole('button', { name: '7 ngày sau' }));
    await waitFor(() => expect(l.doc).toHaveBeenCalledTimes(2));
    const [tu, den] = l.doc.mock.calls[1]!;
    expect(Date.parse(den) - Date.parse(tu)).toBe(7 * 86_400_000);
    expect(Date.parse(tu) - Date.parse(homNay())).toBe(7 * 86_400_000);
    expect(await screen.findByText(/^\d\d\/\d\d → \d\d\/\d\d$/)).toBeInTheDocument();
  });

  it('YC7.1 bước 8 xoay ngang thì ẩn thanh tab, xoay dọc thì hiện lại', async () => {
    ve({ dvLich: dvLich() });
    fireEvent.click(await screen.findByRole('button', { name: 'Xoay ngang' }));
    expect(screen.queryByRole('navigation', { name: 'Tab' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Xoay dọc' }));
    expect(screen.getByRole('navigation', { name: 'Tab' })).toBeInTheDocument();
  });

  it('YC7.1 HV3 quay lại từ nền thì đọc lại lịch', async () => {
    const l = dvLich();
    ve({ dvLich: l });
    await screen.findByText('Nguồn phòng · 1');
    document.dispatchEvent(new Event('visibilitychange'));
    await waitFor(() => expect(l.doc).toHaveBeenCalledTimes(2));
  });

  it('YC7.1 HV2 lần đầu không đọc được lịch thì "Thử lại"', async () => {
    const l: DichVuLichSale = { doc: vi.fn(async () => { throw new TypeError('mất mạng'); }) };
    ve({ dvLich: l });
    expect(await screen.findByRole('button', { name: 'Thử lại' })).toBeInTheDocument();
  });

  it('YC7.1 tab Cá nhân (khung tạm) có "Đăng xuất"; về tab Lịch thì đọc lại', async () => {
    const { onDangXuat } = ve();
    await screen.findByText('Chưa có nguồn phòng');
    fireEvent.click(screen.getByRole('button', { name: 'Cá nhân' }));
    expect(screen.getByRole('heading', { name: 'Cá nhân' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Đăng xuất' }));
    expect(onDangXuat).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'Lịch' }));
    expect(await screen.findByText('Chưa có nguồn phòng')).toBeInTheDocument();
  });
});
