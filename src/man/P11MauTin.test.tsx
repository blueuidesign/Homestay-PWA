// Test unit màn P11 · Mẫu tin gửi khách (YC8.2, US49). Dịch vụ là bản giả, không gọi mạng.
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { ToastProvider } from '../chung/Toast';
import type { DichVuGuiKhach } from '../lib/dichVuGuiKhach';
import type { DichVuMauTin } from '../lib/dichVuMauTin';
import { MAU_TIN_MAC_DINH, type TinGuiKhach } from '../lib/guiKhach';
import { CAU_DA_LUU_MAU_TIN, P11MauTin } from './P11MauTin';
import { S5GuiKhach } from './S5GuiKhach';

afterEach(cleanup);

function dichVu(dau = MAU_TIN_MAC_DINH, ghiDe: Partial<DichVuMauTin> = {}) {
  const d = { doc: vi.fn(async () => dau), luu: vi.fn(async () => undefined), ...ghiDe };
  return d as DichVuMauTin & typeof d;
}

async function ve(dv: DichVuMauTin = dichVu()) {
  const onQuayLai = vi.fn();
  const onDaLuu = vi.fn();
  render(<ToastProvider><P11MauTin dv={dv} tenSale="Sale Hùng" onQuayLai={onQuayLai} onDaLuu={onDaLuu} /></ToastProvider>);
  await screen.findByRole('textbox', { name: 'Mẫu tin' });
  return { onQuayLai, onDaLuu };
}

const o = () => screen.getByRole('textbox', { name: 'Mẫu tin' }) as HTMLTextAreaElement;
const xemTruoc = () => screen.getByTestId('xem-truoc').textContent ?? '';
const nutLuu = () => screen.getByRole('button', { name: 'Lưu thay đổi' });
const go = (v: string) => fireEvent.change(o(), { target: { value: v } });

describe('YC8.2 · P11 Mẫu tin gửi khách', () => {
  it('YC8.2 bước 1, 3: tiêu đề, ô "Mẫu tin" có mẫu đang lưu, năm ô chèn, bản xem trước 3 căn 10/10 → 12/10', async () => {
    await ve();
    expect(screen.getByRole('heading', { name: 'Mẫu tin gửi khách' })).toBeInTheDocument();
    expect(o().value).toBe(MAU_TIN_MAC_DINH);
    expect(screen.getByText('Chạm để chèn')).toBeInTheDocument();
    for (const t of ['[Ngày]', '[Số đêm]', '[Số căn]', '[Danh sách căn]', '[Tên sale]']) {
      expect(screen.getByRole('button', { name: t })).toBeInTheDocument();
    }
    expect(screen.getByText('Khách sẽ nhận được')).toBeInTheDocument();
    const t = xemTruoc();
    expect(t.startsWith('Em gửi anh chị 3 căn còn trống 10/10 → 12/10 (2 đêm):\n1. ')).toBe(true);
    expect(t).toContain('2. Sapphire 1103');
    expect(t).toContain('3. À La Carte 2208');
    expect(t.endsWith('Anh chị ưng căn nào báo em giữ phòng nhé.')).toBe(true);
    expect(screen.getByText('Ví dụ với 3 căn trống 10/10 → 12/10, đã cộng giá.')).toBeInTheDocument();
    expect(nutLuu()).toBeEnabled();
  });

  it('YC8.2 bước 3, YC8-H8: dòng căn trong bản xem trước giống khối ở S5 (dòng tên, dòng ngày và giá bán)', async () => {
    await ve();
    expect(xemTruoc()).toContain('1. ICON40 1509 · 2PN · 3 giường, view biển Bãi Cháy\n10/10 → 12/10 (2 đêm): 2.600.000đ');
  });

  it('YC8.2-NT1 chạm "[Ngày]" thì mẫu có thêm [Ngày] ở chỗ con trỏ và bản xem trước hiện ngày thật', async () => {
    await ve();
    go('Chào [Danh sách căn]');
    o().setSelectionRange(4, 4);
    fireEvent.select(o());
    fireEvent.click(screen.getByRole('button', { name: '[Ngày]' }));
    expect(o().value).toBe('Chào[Ngày] [Danh sách căn]');
    expect(xemTruoc().startsWith('Chào10/10 → 12/10 1. ICON40 1509')).toBe(true);
    expect(xemTruoc()).not.toContain('[Ngày]');
  });

  it('YC8.2-NT1 chưa chạm vào ô mẫu thì chèn vào cuối; [Tên sale], [Số đêm] hiện tên và số đêm thật', async () => {
    await ve(dichVu('[Danh sách căn]'));
    fireEvent.click(screen.getByRole('button', { name: '[Tên sale]' }));
    fireEvent.click(screen.getByRole('button', { name: '[Số đêm]' }));
    expect(o().value).toBe('[Danh sách căn][Tên sale][Số đêm]');
    expect(xemTruoc().endsWith('Sale Hùng2 đêm')).toBe(true);
  });

  it('YC8.2-NT2 bấm "Dùng lại mẫu mặc định" thì mẫu về nội dung mặc định', async () => {
    await ve(dichVu('Mẫu riêng của Hùng [Danh sách căn]'));
    expect(o().value).toBe('Mẫu riêng của Hùng [Danh sách căn]');
    fireEvent.click(screen.getByRole('button', { name: 'Dùng lại mẫu mặc định' }));
    expect(o().value).toBe(MAU_TIN_MAC_DINH);
    expect(xemTruoc().startsWith('Em gửi anh chị 3 căn còn trống 10/10 → 12/10 (2 đêm):')).toBe(true);
  });

  it('YC8.2-NT5 mẫu không có [Danh sách căn]: nút Lưu mờ và ghi "Mẫu cần có [Danh sách căn]"', async () => {
    const dv = dichVu();
    await ve(dv);
    go('Em gửi anh chị [Số căn] căn');
    expect(nutLuu()).toBeDisabled();
    expect(screen.getByText('Mẫu cần có [Danh sách căn]')).toBeInTheDocument();
    fireEvent.click(nutLuu());
    expect(dv.luu).not.toHaveBeenCalled();
    go('');
    expect(nutLuu()).toBeDisabled();
    expect(screen.getByText('Mẫu cần có [Danh sách căn]')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '[Danh sách căn]' }));
    expect(nutLuu()).toBeEnabled();
    expect(screen.queryByText('Mẫu cần có [Danh sách căn]')).toBeNull();
  });

  it('YC8.2-NT5 mẫu dài 2.001 ký tự: nút Lưu mờ và báo quá dài', async () => {
    await ve();
    go('[Danh sách căn]' + 'a'.repeat(1986));
    expect(nutLuu()).toBeDisabled();
    expect(screen.getByText('Mẫu tin tối đa 2.000 ký tự')).toBeInTheDocument();
    go('[Danh sách căn]' + 'a'.repeat(1985));
    expect(nutLuu()).toBeEnabled();
  });

  it('YC8.2 bước 5: "Lưu thay đổi" gửi mẫu, toast "Đã lưu mẫu tin" rồi về Cá nhân', async () => {
    const dv = dichVu();
    const { onDaLuu } = await ve(dv);
    go('Mẫu mới [Danh sách căn]');
    fireEvent.click(nutLuu());
    await waitFor(() => expect(dv.luu).toHaveBeenCalledWith('Mẫu mới [Danh sách căn]'));
    expect(await screen.findByText(CAU_DA_LUU_MAU_TIN)).toBeInTheDocument();
    expect(CAU_DA_LUU_MAU_TIN).toBe('Đã lưu mẫu tin');
    expect(onDaLuu).toHaveBeenCalled();
  });

  it('YC8.2-NT5 HV2: database từ chối thì báo câu của database, giữ mẫu đang sửa, không rời màn', async () => {
    const dv = dichVu(MAU_TIN_MAC_DINH, { luu: vi.fn(async () => { throw new LoiNguoiDung('Mẫu tin tối đa 2.000 ký tự'); }) });
    const { onDaLuu } = await ve(dv);
    go('Mẫu [Danh sách căn]');
    fireEvent.click(nutLuu());
    expect(await screen.findByText('Mẫu tin tối đa 2.000 ký tự')).toBeInTheDocument();
    expect(o().value).toBe('Mẫu [Danh sách căn]');
    expect(onDaLuu).not.toHaveBeenCalled();
  });

  it('HV1, HV2: đang tải là khung xám; đọc lỗi thì "Thử lại", bấm thì đọc lại', async () => {
    let lan = 0;
    const dv = dichVu(MAU_TIN_MAC_DINH, { doc: vi.fn(async () => { lan += 1; if (lan === 1) throw new TypeError('mất mạng'); return MAU_TIN_MAC_DINH; }) });
    render(<ToastProvider><P11MauTin dv={dv} tenSale="Sale Hùng" onQuayLai={vi.fn()} onDaLuu={vi.fn()} /></ToastProvider>);
    fireEvent.click(await screen.findByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByRole('textbox', { name: 'Mẫu tin' })).toBeInTheDocument();
  });

  it('YC8.2 nút Quay lại gọi onQuayLai, không lưu', async () => {
    const dv = dichVu();
    const { onQuayLai } = await ve(dv);
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    expect(onQuayLai).toHaveBeenCalled();
    expect(dv.luu).not.toHaveBeenCalled();
  });
});

describe('YC8.2-NT3 · S5 theo mẫu đã lưu', () => {
  const gocNav = globalThis.navigator;
  const datNav = (v: object) => Object.defineProperty(globalThis, 'navigator', { value: { ...v, onLine: true }, configurable: true });
  beforeEach(() => datNav({}));
  afterEach(() => datNav(gocNav));

  it('YC8.2-NT3 sale lưu mẫu mới ở P11 thì "Sao chép chữ cả N căn" ở S5 theo mẫu đó', async () => {
    // Bản giả database: lệnh lưu ghi mẫu, lệnh soạn tin trả mẫu đã lưu (fn_soan_tin_gui_khach).
    let daLuu = MAU_TIN_MAC_DINH;
    const dvMau = dichVu(MAU_TIN_MAC_DINH, { luu: vi.fn(async (m: string) => { daLuu = m; }) });
    const dvGui = {
      soan: vi.fn(async (): Promise<TinGuiKhach> => ({
        tu: '2026-10-10', den: '2026-10-12', soDem: 2, mauTin: daLuu, tenSale: 'Sale Hùng',
        can: [{ canId: 'c1509', maCan: '1509', tenToa: 'ICON40', soPhongNgu: 2, soGiuong: 3, soAnh: 0, anh: [], tongGiaBan: 2_600_000,
                chu: 'ICON40 1509 · 2PN · 3 giường\n10/10 → 12/10 (2 đêm): 2.600.000đ' }],
      })),
      ghiLanGui: vi.fn(async () => undefined),
      taiAnh: vi.fn(async () => []),
    } as unknown as DichVuGuiKhach;
    await ve(dvMau);
    go('[Tên sale] chào anh chị, [Số căn] căn [Ngày]:\n[Danh sách căn]\nHẹn gặp lại.');
    fireEvent.click(nutLuu());
    await waitFor(() => expect(dvMau.luu).toHaveBeenCalled());
    cleanup();

    const writeText = vi.fn().mockResolvedValue(undefined);
    datNav({ clipboard: { writeText } });
    render(<ToastProvider><S5GuiKhach dv={dvGui} canIds={['c1509']} tu="2026-10-10" den="2026-10-12" onQuayLai={vi.fn()} /></ToastProvider>);
    fireEvent.click(await screen.findByRole('button', { name: 'Sao chép chữ cả 1 căn' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(
      'Sale Hùng chào anh chị, 1 căn 10/10 → 12/10:\n1. ICON40 1509 · 2PN · 3 giường\n10/10 → 12/10 (2 đêm): 2.600.000đ\nHẹn gặp lại.'));
  });
});
