// Test unit màn CN4 Thêm đặt phòng (YC5.1, HV1, HV3). Dịch vụ giả theo DLM.4, không gọi mạng. Hôm nay cố định 07/10/2026 (DLM.1).
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CAU_KHOI_PHUC } from '../chung/nhap';
import type { DichVuDatPhong } from '../lib/dichVuDatPhong';
import type { CanLich, DatPhongLich } from '../lib/lich';
import { CN4ThemDatPhong } from './CN4ThemDatPhong';

afterEach(() => {
  cleanup();
  try { localStorage.clear(); } catch { /* bỏ qua */ }
});

const HAI_CAN: CanLich[] = [{ id: 'c1509', maCan: '1509' }, { id: 'c3402', maCan: '3402' }];
const B1: DatPhongLich = { id: 'B1', canId: 'c1509', ngayNhan: '2026-10-10', ngayTra: '2026-10-12', nguoiDat: { loai: 'sale', ten: 'Sale Hùng', sdt: null } };
const B2: DatPhongLich = { id: 'B2', canId: 'c3402', ngayNhan: '2026-10-17', ngayTra: '2026-10-19', nguoiDat: { loai: 'le' } };

function dichVu(ds: DatPhongLich[] = [B1, B2]): DichVuDatPhong & { layDatPhong: ReturnType<typeof vi.fn> } {
  return { layDatPhong: vi.fn(async (canIds: string[]) => ds.filter((b) => canIds.includes(b.canId))) };
}

function ve(them: { dv?: DichVuDatPhong; ds?: CanLich[]; canId?: string; ngay?: string; onDong?: () => void } = {}) {
  return render(
    <CN4ThemDatPhong ds={them.ds ?? HAI_CAN} dv={them.dv ?? dichVu()} canIdBanDau={them.canId} ngayBanDau={them.ngay}
                     homNay="2026-10-07" onDong={them.onDong ?? vi.fn()} />,
  );
}

const oNhan = () => screen.getByLabelText('Ngày nhận phòng') as HTMLInputElement;
const oTra = () => screen.getByLabelText('Ngày trả phòng') as HTMLInputElement;
const chipCan = (ma: string) => screen.getByRole('button', { name: ma });
const chipDem = (chu: string) => screen.getByRole('checkbox', { name: chu });
const nutLuu = () => screen.getByRole('button', { name: 'Thêm đặt phòng' });
const choKiem = () => screen.findByText(/không trùng lịch|Trùng đêm|Ngày trả phải|tối đa 365/);

describe('YC5.1 · CN4 Thêm đặt phòng', () => {
  it('YC5.1-NT4 bấm "Đặt phòng" ở tab Lịch: căn đầu là 1509, 1509 chỉ có B1 thì form mở với 1509, nhận 07/10, trả 08/10', async () => {
    ve();
    expect(screen.getByRole('heading', { name: 'Thêm đặt phòng' })).toBeInTheDocument();
    await choKiem();
    expect(chipCan('1509')).toHaveAttribute('aria-pressed', 'true');
    expect(chipCan('3402')).toHaveAttribute('aria-pressed', 'false');
    expect(oNhan().value).toBe('2026-10-07');
    expect(oTra().value).toBe('2026-10-08');
    expect(chipDem('1 đêm')).toHaveAttribute('aria-checked', 'true');
  });

  it('YC5.1-NT4 1509 có thêm đặt phòng 07/10 → 10/10 thì ngày nhận điền sẵn là 12/10 (đêm trống đầu tiên sau B1)', async () => {
    const X: DatPhongLich = { id: 'X', canId: 'c1509', ngayNhan: '2026-10-07', ngayTra: '2026-10-10' };
    ve({ dv: dichVu([B1, X]) });
    await choKiem();
    expect(oNhan().value).toBe('2026-10-12');
    expect(oTra().value).toBe('2026-10-13');
  });

  it('YC5.1-NT1 các đêm đã chọn chưa có khách trong căn thì thấy dòng "không trùng lịch"', async () => {
    ve();
    expect(await screen.findByText('✓ 07/10 → 08/10 (1 đêm) · không trùng lịch')).toBeInTheDocument();
    fireEvent.change(oNhan(), { target: { value: '2026-10-31' } });
    fireEvent.click(chipDem('2 đêm'));
    expect(screen.getByText('✓ 31/10 → 02/11 (2 đêm) · không trùng lịch')).toBeInTheDocument();
  });

  it('YC5.1-NT2 các đêm trùng một đặt phòng chưa hủy của cùng căn thì thấy dòng báo trùng và nút lưu không bấm được', async () => {
    ve();
    await choKiem();
    fireEvent.change(oNhan(), { target: { value: '2026-10-11' } });
    fireEvent.click(chipDem('2 đêm'));
    const dong = screen.getByText('Trùng đêm 11/10 với đặt phòng của Sale Hùng (10/10 → 12/10)');
    expect(dong).toHaveAttribute('role', 'alert');
    expect(nutLuu()).toBeDisabled();
  });

  it('YC5.1-NT3 chọn "2 đêm" thì ngày trả bằng ngày nhận cộng 2', async () => {
    ve();
    await choKiem();
    fireEvent.click(chipDem('2 đêm'));
    expect(oTra().value).toBe('2026-10-09');
    expect(chipDem('2 đêm')).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(chipDem('3 đêm'));
    expect(oTra().value).toBe('2026-10-10');
  });

  it('YC5.1 bước 2 đổi căn thì giữ ngày, chạy lại dòng kiểm', async () => {
    ve();
    await choKiem();
    fireEvent.change(oNhan(), { target: { value: '2026-10-17' } });
    expect(screen.getByText(/không trùng lịch/)).toBeInTheDocument();
    fireEvent.click(chipCan('3402'));
    expect(chipCan('3402')).toHaveAttribute('aria-pressed', 'true');
    expect(oNhan().value).toBe('2026-10-17');
    expect(oTra().value).toBe('2026-10-18');
    expect(screen.getByText('Trùng đêm 17/10 với đặt phòng của Khách lẻ (17/10 → 19/10)')).toBeInTheDocument();
  });

  it('YC5.1 bước 3 "Tùy chọn" mở ô ngày trả; đổi ngày trả bằng tay thì chip số đêm tương ứng tự sáng', async () => {
    ve();
    await choKiem();
    expect(oTra()).toBeDisabled();
    fireEvent.click(chipDem('Tùy chọn'));
    expect(chipDem('Tùy chọn')).toHaveAttribute('aria-checked', 'true');
    expect(oTra()).not.toBeDisabled();
    fireEvent.change(oTra(), { target: { value: '2026-10-10' } });
    expect(chipDem('3 đêm')).toHaveAttribute('aria-checked', 'true');
    fireEvent.change(oTra(), { target: { value: '2026-10-12' } });
    expect(chipDem('Tùy chọn')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText(/Trùng đêm 10\/10/)).toBeInTheDocument();
  });

  it('YC5.1 bước 3b đổi ngày nhận thì giữ số đêm đang chọn, dời ngày trả theo', async () => {
    ve();
    await choKiem();
    fireEvent.click(chipDem('2 đêm'));
    fireEvent.change(oNhan(), { target: { value: '2026-10-20' } });
    expect(oTra().value).toBe('2026-10-22');
  });

  it('YC5.1-NT6 app chặn trước: ngày trả không sau ngày nhận thì dòng đỏ "Ngày trả phải sau ngày nhận"', async () => {
    ve();
    await choKiem();
    fireEvent.click(chipDem('Tùy chọn'));
    fireEvent.change(oTra(), { target: { value: '2026-10-07' } });
    expect(screen.getByText('Ngày trả phải sau ngày nhận')).toBeInTheDocument();
    expect(nutLuu()).toBeDisabled();
  });

  it('YC5.1 bước 1b mở từ chi tiết ngày với căn 3402 và ngày 10/10 thì chọn sẵn 3402, nhận 10/10, 1 đêm', async () => {
    ve({ canId: 'c3402', ngay: '2026-10-10' });
    await choKiem();
    expect(chipCan('3402')).toHaveAttribute('aria-pressed', 'true');
    expect(oNhan().value).toBe('2026-10-10');
    expect(oTra().value).toBe('2026-10-11');
  });

  it('YC5.1, US26: nút "Thêm đặt phòng" luôn hiện nhưng chưa bấm được (chưa có người đặt, US27)', async () => {
    ve();
    await choKiem();
    expect(nutLuu()).toBeDisabled();
  });

  it('YC5 Trạng thái màn, HV1 đang đọc đặt phòng thì khung xám tại chỗ dòng kiểm; HV2 đọc lỗi thì báo và có Thử lại', async () => {
    let xong: (v: DatPhongLich[]) => void = () => {};
    const dv = { layDatPhong: vi.fn(() => new Promise<DatPhongLich[]>((r) => { xong = r; })) };
    ve({ dv });
    expect(screen.getByLabelText('Đang tải')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Thêm đặt phòng' })).toBeInTheDocument();
    await act(async () => { xong([B1]); });
    expect(screen.getByText(/không trùng lịch/)).toBeInTheDocument();
    cleanup();
    const loi = { layDatPhong: vi.fn().mockRejectedValueOnce(new TypeError('mất mạng')).mockResolvedValue([B1]) };
    ve({ dv: loi });
    fireEvent.click(await screen.findByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByText(/không trùng lịch/)).toBeInTheDocument();
  });

  it('YC5.1 bấm Đóng thì bỏ form và xóa nháp (HV3 bước 5)', async () => {
    const onDong = vi.fn();
    ve({ onDong });
    await choKiem();
    fireEvent.click(chipDem('2 đêm'));
    fireEvent.click(screen.getByRole('button', { name: 'Đóng' }));
    expect(onDong).toHaveBeenCalledTimes(1);
    cleanup();
    ve();
    await choKiem();
    expect(screen.queryByText(CAU_KHOI_PHUC)).toBeNull();
    expect(oTra().value).toBe('2026-10-08');
  });
});

describe('HV3 · CN4 quay lại từ nền', () => {
  it('HV3-NT1 đang nhập đặt phòng ở CN4, rời app 5 phút rồi quay lại thì form còn đủ căn, ngày đã nhập', async () => {
    const dv = dichVu();
    ve({ dv });
    await choKiem();
    fireEvent.click(chipCan('3402'));
    fireEvent.change(oNhan(), { target: { value: '2026-10-20' } });
    fireEvent.click(chipDem('3 đêm'));
    const soLanDoc = dv.layDatPhong.mock.calls.length;
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    await act(async () => { document.dispatchEvent(new Event('visibilitychange')); });
    expect(dv.layDatPhong.mock.calls.length).toBeGreaterThan(soLanDoc); // HV3 bước 2: đọc lại đặt phòng
    expect(chipCan('3402')).toHaveAttribute('aria-pressed', 'true');
    expect(oNhan().value).toBe('2026-10-20');
    expect(oTra().value).toBe('2026-10-23');
    expect(chipDem('3 đêm')).toHaveAttribute('aria-checked', 'true');
  });

  it('HV3 bước 3 trang bị đóng rồi mở lại CN4 thì điền lại nháp và báo "Đã khôi phục nội dung bạn đang nhập"', async () => {
    ve();
    await choKiem();
    fireEvent.click(chipCan('3402'));
    fireEvent.change(oNhan(), { target: { value: '2026-10-20' } });
    cleanup();
    ve();
    expect(await screen.findByText(CAU_KHOI_PHUC)).toBeInTheDocument();
    expect(chipCan('3402')).toHaveAttribute('aria-pressed', 'true');
    expect(oNhan().value).toBe('2026-10-20');
    expect(oTra().value).toBe('2026-10-21');
  });

  it('HV3-NT4 lưu đặt phòng thành công thì mở lại CN4 không còn nháp cũ (CN4 xóa nháp khi lưu xong)', async () => {
    const { xoaBanNhapDatPhong } = await import('../lib/datPhong');
    ve();
    await choKiem();
    fireEvent.change(oNhan(), { target: { value: '2026-10-20' } });
    cleanup();
    xoaBanNhapDatPhong(); // việc CN4 làm khi lưu xong; nút lưu bấm được từ US27
    ve();
    await choKiem();
    expect(screen.queryByText(CAU_KHOI_PHUC)).toBeNull();
    expect(oNhan().value).toBe('2026-10-07');
  });
});
