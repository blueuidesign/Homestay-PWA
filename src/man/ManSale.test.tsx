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

describe('YC7.2 · mở tìm phòng từ S1', () => {
  it('YC7.2 bước 1 chạm "Tìm phòng trống theo ngày" mở S1-02 toàn màn (không thanh tab); Quay lại về S1', async () => {
    const tim = { tim: vi.fn(), docGanDay: vi.fn(async () => []), docToa: vi.fn(async () => []) };
    ve({ dvLich: { ...dvLich(), timPhong: tim } });
    fireEvent.click(await screen.findByRole('button', { name: 'Tìm phòng trống theo ngày' }));
    expect(screen.getByRole('heading', { name: 'Tìm phòng' })).toBeInTheDocument();
    expect(screen.getByText('Chọn ngày nhận để tìm phòng')).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Tab' })).toBeNull();
    await waitFor(() => expect(tim.docGanDay).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    expect(await screen.findByText('Nguồn phòng · 1')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Tab' })).toBeInTheDocument();
  });

  it('YC7.2 chưa có dịch vụ tìm thì chạm ô tìm không làm gì', async () => {
    ve({ dvLich: dvLich() });
    fireEvent.click(await screen.findByRole('button', { name: 'Tìm phòng trống theo ngày' }));
    expect(screen.queryByRole('heading', { name: 'Tìm phòng' })).toBeNull();
  });
});

describe('YC7.4 · chạm căn ở S1 (US46)', () => {
  it('YC7.4 YC7-H6 chạm căn của chủ nhà mở S3 với ngày đầu đang xem, 1 đêm, không thanh tab; HV5 "Về Lịch" về S1', async () => {
    const chiTietCan = {
      doc: vi.fn(async () => ({ khongConQuyen: true as const, lyDo: 'Chủ nhà đã ngừng chia sẻ lịch' })),
      datMuc: vi.fn(async () => undefined),
    };
    ve({ dvLich: { ...dvLich(), chiTietCan } });
    fireEvent.click(await screen.findByRole('button', { name: /^3402/ }));
    const nay = homNay();
    const mai = new Date(Date.parse(nay + 'T00:00:00Z') + 86_400_000).toISOString().slice(0, 10);
    expect(chiTietCan.doc).toHaveBeenCalledWith('c1', nay, mai);
    expect(document.querySelector('[data-man="S3"]')).not.toBeNull();
    expect(screen.queryByRole('navigation', { name: 'Tab' })).toBeNull();
    fireEvent.click(await screen.findByRole('button', { name: 'Về Lịch' }));
    expect(await screen.findByText('Nguồn phòng · 1')).toBeInTheDocument();
  });

  it('YC7 Quy tắc "Chạm căn mở đâu" chưa có dịch vụ chi tiết căn thì chạm căn chủ nhà không mở S3', async () => {
    ve({ dvLich: dvLich() });
    fireEvent.click(await screen.findByRole('button', { name: /^3402/ }));
    expect(document.querySelector('[data-man="S3"]')).toBeNull();
  });
});

describe('YC7.5 · dòng "Mức cộng giá mặc định" ở tab Cá nhân (US47)', () => {
  it('YC7.5 bước 1 tab Cá nhân có "Mức cộng giá mặc định" (vẫn có Đăng xuất), chạm mở P10 toàn màn; lưu xong về Cá nhân', async () => {
    const mucCong = { doc: vi.fn(async () => ({ muc: 400_000, lamTron: false })), luu: vi.fn(async () => undefined) };
    ve({ dvMucCong: mucCong });
    await screen.findByText('Chưa có nguồn phòng');
    fireEvent.click(screen.getByRole('button', { name: 'Cá nhân' }));
    expect(screen.getByRole('button', { name: 'Đăng xuất' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Mức cộng giá mặc định' }));
    expect(await screen.findByRole('heading', { name: 'Mức cộng giá mặc định' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Tab' })).toBeNull();
    fireEvent.click(await screen.findByRole('button', { name: '+200k' }));
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
    await waitFor(() => expect(mucCong.luu).toHaveBeenCalledWith(200_000, false));
    expect(await screen.findByRole('heading', { name: 'Cá nhân' })).toBeInTheDocument();
    expect(screen.getByText('Đã lưu mức cộng')).toBeInTheDocument();
  });

  it('YC7.5 P10 Quay lại về tab Cá nhân', async () => {
    ve({ dvMucCong: { doc: vi.fn(async () => ({ muc: 0, lamTron: false })), luu: vi.fn() } });
    await screen.findByText('Chưa có nguồn phòng');
    fireEvent.click(screen.getByRole('button', { name: 'Cá nhân' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mức cộng giá mặc định' }));
    await screen.findByRole('heading', { name: 'Mức cộng giá mặc định' });
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    expect(screen.getByRole('heading', { name: 'Cá nhân' })).toBeInTheDocument();
  });
});

describe('YC8.2 · dòng "Mẫu tin gửi khách" ở tab Cá nhân (US49)', () => {
  it('YC8.2 bước 1 tab Cá nhân có "Mẫu tin gửi khách", chạm mở P11 toàn màn; lưu xong về Cá nhân', async () => {
    const mauTin = { doc: vi.fn(async () => 'Mẫu cũ [Danh sách căn]'), luu: vi.fn(async () => undefined) };
    ve({ dvMauTin: mauTin });
    await screen.findByText('Chưa có nguồn phòng');
    fireEvent.click(screen.getByRole('button', { name: 'Cá nhân' }));
    expect(screen.getByRole('button', { name: 'Mức cộng giá mặc định' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Mẫu tin gửi khách' }));
    expect(await screen.findByRole('heading', { name: 'Mẫu tin gửi khách' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Tab' })).toBeNull();
    // Bản xem trước dùng tên trong hồ sơ.
    fireEvent.click(screen.getByRole('button', { name: '[Tên sale]' }));
    expect(screen.getByTestId('xem-truoc').textContent).toContain('Sale Hùng');
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
    await waitFor(() => expect(mauTin.luu).toHaveBeenCalledWith('Mẫu cũ [Danh sách căn][Tên sale]'));
    expect(await screen.findByRole('heading', { name: 'Cá nhân' })).toBeInTheDocument();
    expect(screen.getByText('Đã lưu mẫu tin')).toBeInTheDocument();
  });

  it('YC8.2 P11 Quay lại về tab Cá nhân; thiếu dịch vụ riêng thì dùng dvLich.mauTin', async () => {
    const mauTin = { doc: vi.fn(async () => 'Mẫu [Danh sách căn]'), luu: vi.fn() };
    ve({ dvLich: { ...dvLich(true), mauTin } });
    await screen.findByText('Chưa có nguồn phòng');
    fireEvent.click(screen.getByRole('button', { name: 'Cá nhân' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mẫu tin gửi khách' }));
    await screen.findByRole('heading', { name: 'Mẫu tin gửi khách' });
    expect(mauTin.doc).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    expect(screen.getByRole('heading', { name: 'Cá nhân' })).toBeInTheDocument();
  });
});
