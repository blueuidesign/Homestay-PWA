// Test unit màn CN4 Thêm đặt phòng (YC5.1, YC5.2, HV1, HV3). Dịch vụ giả theo DLM.4, không gọi mạng. Hôm nay cố định 07/10/2026 (DLM.1).
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CAU_KHOI_PHUC } from '../chung/nhap';
import { ToastProvider } from '../chung/Toast';
import { LoiNguoiDung } from '../chung/matKetNoi';
import type { DatPhongMoi, DichVuDatPhong } from '../lib/dichVuDatPhong';
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

// ===== US27 · YC5.2 người đặt, tiền phòng, trạng thái tiền. Giá theo DLM.3: 1509 ngày thường 900.000đ, cuối tuần (đêm T6, T7)
// 1.300.000đ, tháng 10 tới 12/2026; tháng 1/2027 chưa đặt giá. =====
function giaDLM3(canId: string, nhan: string, tra: string) {
  const ds: { dem: string; gia: number | null }[] = [];
  for (let t = Date.parse(nhan + 'T00:00:00Z'); t < Date.parse(tra + 'T00:00:00Z'); t += 86400000) {
    const d = new Date(t);
    const dem = d.toISOString().slice(0, 10);
    const cuoiTuan = d.getUTCDay() === 5 || d.getUTCDay() === 6;
    const coGia = dem >= '2026-10-01' && dem < '2027-01-01';
    const [thuong, ct] = canId === 'c1509' ? [900000, 1300000] : [800000, 1100000];
    ds.push({ dem, gia: coGia ? (cuoiTuan ? ct : thuong) : null });
  }
  return ds;
}

function dichVuDu(them: Partial<DichVuDatPhong> = {}) {
  return {
    layDatPhong: vi.fn(async (canIds: string[]) => [B1, B2].filter((b) => canIds.includes(b.canId))),
    layGiaDem: vi.fn(async (canId: string, nhan: string, tra: string) => giaDLM3(canId, nhan, tra)),
    layNguoiDat: vi.fn(async () => ({ sale: [{ id: 'hung', ten: 'Sale Hùng' }, { id: 'lan', ten: 'Sale Lan' }], tenKhach: ['Dung Đỗ', 'Bà Lan'] })),
    layGioMacDinh: vi.fn(async () => ({ gioNhan: '14:00', gioTra: '12:00' })),
    taoDatPhong: vi.fn(async (_d: DatPhongMoi) => 'moi'),
    ...them,
  };
}

const oTien = () => screen.getByLabelText('Tiền phòng (đ)') as HTMLInputElement;
const chipNguoi = (chu: string) => within(screen.getByRole('group', { name: 'Khách / Sale' })).getByRole('button', { name: chu });
const chipTien = (chu: string) => within(screen.getByRole('group', { name: 'Trạng thái tiền' })).getByRole('button', { name: chu });
const choGia = async () => { await screen.findByRole('group', { name: 'Khách / Sale' }); await screen.findByLabelText('Giá từng đêm'); };
async function chon3110Hai(dv = dichVuDu(), onDaLuu = vi.fn()) {
  render(<CN4ThemDatPhong ds={HAI_CAN} dv={dv} homNay="2026-10-07" onDong={vi.fn()} onDaLuu={onDaLuu} />);
  await choKiem();
  await choGia();
  fireEvent.change(oNhan(), { target: { value: '2026-10-31' } });
  fireEvent.click(chipDem('2 đêm'));
  await screen.findByText('31/10: 1.300.000đ');
  return { dv, onDaLuu };
}

describe('YC5.2 · CN4 người đặt, tiền phòng, trạng thái tiền', () => {
  it('YC5.2-NT1 chọn 1509, nhận 31/10 trả 02/11 thì ô tiền phòng điền sẵn 2.200.000, dưới ô có "31/10: 1.300.000đ" và "01/11: 900.000đ"', async () => {
    const { dv } = await chon3110Hai();
    expect(oTien().value).toBe('2.200.000');
    expect(screen.getByText('31/10: 1.300.000đ')).toBeInTheDocument();
    expect(screen.getByText('01/11: 900.000đ')).toBeInTheDocument();
    expect(dv.layGiaDem).toHaveBeenLastCalledWith('c1509', '2026-10-31', '2026-11-02');
  });

  it('YC5.2 bước 7b, 7c gõ số khác thì giữ số gõ, dòng từng đêm vẫn là giá bảng giá; đổi ngày thì điền lại theo bảng giá', async () => {
    await chon3110Hai();
    fireEvent.change(oTien(), { target: { value: '2000000' } });
    expect(oTien().value).toBe('2.000.000');
    expect(screen.getByText('31/10: 1.300.000đ')).toBeInTheDocument();
    fireEvent.change(oTien(), { target: { value: '-5' } });
    fireEvent.change(oTien(), { target: { value: '2.000.000,5' } });
    expect(oTien().value).toBe('2.000.000'); // không nhận số âm, số lẻ
    fireEvent.click(chipDem('1 đêm'));
    await waitFor(() => expect(oTien().value).toBe('1.300.000'));
  });

  it('YC5.2-NT3 ô "Tiền phòng (đ)" trống thì nút "Thêm đặt phòng" không bấm được, ô viền đỏ với dòng "Nhập tiền phòng trước khi lưu", không lưu', async () => {
    const { dv } = await chon3110Hai();
    fireEvent.click(chipNguoi('Khách lẻ'));
    expect(nutLuu()).not.toBeDisabled();
    fireEvent.change(oTien(), { target: { value: '' } });
    expect(screen.getByText('Nhập tiền phòng trước khi lưu')).toBeInTheDocument();
    expect(oTien()).toHaveClass('hh-input--loi');
    expect(oTien()).toHaveAttribute('aria-invalid', 'true');
    expect(nutLuu()).toBeDisabled();
    fireEvent.click(nutLuu());
    expect(dv.taoDatPhong).not.toHaveBeenCalled();
  });

  it('YC5.2-NT5 1509 nhận 30/12/2026 trả 02/01/2027 (tháng 1 chưa đặt giá) thì dòng đêm 01/01 ghi "chưa đặt giá", ô tiền phòng để trống', async () => {
    render(<CN4ThemDatPhong ds={HAI_CAN} dv={dichVuDu()} homNay="2026-10-07" onDong={vi.fn()} />);
    await choKiem();
    await choGia();
    fireEvent.change(oNhan(), { target: { value: '2026-12-30' } });
    fireEvent.click(chipDem('3 đêm'));
    expect(await screen.findByText('01/01: chưa đặt giá')).toBeInTheDocument();
    expect(screen.getByText('30/12: 900.000đ')).toBeInTheDocument();
    expect(oTien().value).toBe('');
    expect(screen.getByText('Nhập tiền phòng trước khi lưu')).toBeInTheDocument();
  });

  it('YC5.2-NT6 chọn "Đã cọc · còn thu" thì hiện ô "Số tiền cọc (đ)"; chọn "Chưa cọc" hay "Đã thanh toán" thì ô ẩn (mở form "Chưa cọc" chọn sẵn, GD19)', async () => {
    await chon3110Hai();
    expect(chipTien('Chưa cọc')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByLabelText('Số tiền cọc (đ)')).toBeNull();
    fireEvent.click(chipTien('Đã cọc · còn thu'));
    expect(screen.getByLabelText('Số tiền cọc (đ)')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Số tiền cọc (đ)'), { target: { value: '500000' } });
    fireEvent.click(chipTien('Đã thanh toán'));
    expect(screen.queryByLabelText('Số tiền cọc (đ)')).toBeNull();
    fireEvent.click(chipTien('Đã cọc · còn thu'));
    expect((screen.getByLabelText('Số tiền cọc (đ)') as HTMLInputElement).value).toBe(''); // bước 8b: giá trị đã gõ bị bỏ
    fireEvent.click(chipTien('Chưa cọc'));
    expect(screen.queryByLabelText('Số tiền cọc (đ)')).toBeNull();
  });

  it('YC5.2-NT7 cọc 3.000.000đ, tiền phòng 2.200.000đ thì app không cho lưu, ô cọc báo "Tiền cọc không được lớn hơn tiền phòng" (GD20)', async () => {
    const { dv } = await chon3110Hai();
    fireEvent.click(chipNguoi('Khách lẻ'));
    fireEvent.click(chipTien('Đã cọc · còn thu'));
    const oCoc = screen.getByLabelText('Số tiền cọc (đ)');
    fireEvent.change(oCoc, { target: { value: '3000000' } });
    expect(screen.getByText('Tiền cọc không được lớn hơn tiền phòng')).toBeInTheDocument();
    expect(oCoc).toHaveClass('hh-input--loi');
    expect(nutLuu()).toBeDisabled();
    fireEvent.change(oCoc, { target: { value: '' } });
    expect(nutLuu()).not.toBeDisabled(); // YC5-H19: cọc để trống vẫn lưu được
    fireEvent.change(oCoc, { target: { value: '1000000' } });
    expect(nutLuu()).not.toBeDisabled();
    expect(dv.taoDatPhong).not.toHaveBeenCalled();
  });

  it('YC5.2-NT8 chưa chọn chip nào ở hàng "Khách / Sale" thì nút "Thêm đặt phòng" không bấm được', async () => {
    await chon3110Hai();
    expect(nutLuu()).toBeDisabled();
    fireEvent.click(chipNguoi('Sale Hùng'));
    expect(nutLuu()).not.toBeDisabled();
  });

  it('YC5.2-NT9 hàng chip: "+ Sale mới", "Khách lẻ", các sale đang kết nối, rồi tên khách đã ghi ("Dung Đỗ" sau các chip sale); chưa chip nào được chọn', async () => {
    await chon3110Hai();
    const chips = within(screen.getByRole('group', { name: 'Khách / Sale' })).getAllByRole('button');
    expect(chips.map((c) => c.textContent)).toEqual(['+ Sale mới', 'Khách lẻ', 'Sale Hùng', 'Sale Lan', 'Dung Đỗ', 'Bà Lan']);
    for (const c of chips) expect(c).toHaveAttribute('aria-pressed', 'false');
  });

  it('YC5.2-NT10 mở "Thêm chi tiết" thì thấy số khách, giờ nhận 14:00, giờ trả 12:00 theo cài đặt và ô ghi chú', async () => {
    await chon3110Hai();
    expect(screen.getByText('1 khách · 14:00 → 12:00')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Thêm chi tiết' }));
    expect(screen.getByRole('group', { name: 'Số khách' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Thêm một khách' }));
    expect(screen.getByLabelText('Số khách', { selector: 'output' })).toHaveTextContent('2');
    expect((screen.getByLabelText('Giờ nhận') as HTMLInputElement).value).toBe('14:00');
    expect((screen.getByLabelText('Giờ trả') as HTMLInputElement).value).toBe('12:00');
    fireEvent.change(screen.getByLabelText('Ghi chú'), { target: { value: 'Có trẻ nhỏ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Thêm chi tiết' }));
    expect(screen.getByText('2 khách · 14:00 → 12:00 · Ghi chú')).toBeInTheDocument();
  });

  it('YC5.2-NT12 chọn "Khách lẻ" thì có ô tên, số điện thoại; gõ "Bà Lan" rồi lưu thì gửi tên đó và toast mang tên', async () => {
    const { dv, onDaLuu } = await chon3110Hai();
    fireEvent.click(chipNguoi('Khách lẻ'));
    fireEvent.change(screen.getByLabelText('Tên khách (không bắt buộc)'), { target: { value: 'Bà Lan' } });
    fireEvent.change(screen.getByLabelText('Số điện thoại khách (không bắt buộc)'), { target: { value: '0912.345.678' } });
    await act(async () => { fireEvent.click(nutLuu()); });
    expect(dv.taoDatPhong).toHaveBeenCalledTimes(1);
    expect(vi.mocked(dv.taoDatPhong).mock.calls[0]![0]).toMatchObject({
      canId: 'c1509', ngayNhan: '2026-10-31', ngayTra: '2026-11-02', tienPhong: 2200000, saleId: null, tenKhach: 'Bà Lan',
      sdtKhach: '0912.345.678', trangThaiTien: 'chua_coc', tienCoc: null, soKhach: null, gioNhan: null, gioTra: null,
    });
    expect(onDaLuu).toHaveBeenCalledWith({ nguoiDat: 'Bà Lan', maCan: '1509', canId: 'c1509', ngayNhan: '2026-10-31' });
  });

  it('YC5.2-NT12 chọn sale thì không có ô tên khách; dòng nhỏ báo sale được báo; lưu gửi sale làm người đặt', async () => {
    const { dv, onDaLuu } = await chon3110Hai();
    fireEvent.click(chipNguoi('Sale Hùng'));
    expect(screen.queryByLabelText('Tên khách (không bắt buộc)')).toBeNull();
    expect(screen.queryByLabelText('Số điện thoại khách (không bắt buộc)')).toBeNull();
    expect(screen.getByText('Đặt phòng của Sale Hùng: Hùng được báo và thấy đặt phòng này như của mình.')).toBeInTheDocument();
    await act(async () => { fireEvent.click(nutLuu()); });
    expect(vi.mocked(dv.taoDatPhong).mock.calls[0]![0]).toMatchObject({ saleId: 'hung', tenKhach: null, sdtKhach: null });
    expect(onDaLuu).toHaveBeenCalledWith(expect.objectContaining({ nguoiDat: 'Sale Hùng' }));
  });

  it('YC5.2 bước 6b chạm tên đã dùng "Dung Đỗ" thì chọn khách lẻ có tên đó, ô tên điền sẵn', async () => {
    await chon3110Hai();
    fireEvent.click(chipNguoi('Dung Đỗ'));
    expect(chipNguoi('Dung Đỗ')).toHaveAttribute('aria-pressed', 'true');
    expect((screen.getByLabelText('Tên khách (không bắt buộc)') as HTMLInputElement).value).toBe('Dung Đỗ');
  });

  it('YC5.3 bước 12 database từ chối thì ở lại form, không về tab Lịch, toast là câu database trả về', async () => {
    const tao = vi.fn(async () => { throw new LoiNguoiDung('Số điện thoại khách không hợp lệ'); });
    const { onDaLuu } = await chon3110Hai(dichVuDu({ taoDatPhong: tao }));
    fireEvent.click(chipNguoi('Khách lẻ'));
    await act(async () => { fireEvent.click(nutLuu()); });
    expect(tao).toHaveBeenCalledTimes(1);
    expect(onDaLuu).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Thêm đặt phòng' })).toBeInTheDocument();
  });
});

// US28 · YC5.3 bước 9 tới 13: lưu, trùng đêm, lỗi dữ liệu, mất mạng, gửi lại cùng mã lần gửi (QT5.6), HV5.
async function chon3110HaiToast(dv = dichVuDu(), onDaLuu = vi.fn()) {
  render(<ToastProvider><CN4ThemDatPhong ds={HAI_CAN} dv={dv} homNay="2026-10-07" onDong={vi.fn()} onDaLuu={onDaLuu} /></ToastProvider>);
  await choKiem();
  await choGia();
  fireEvent.change(oNhan(), { target: { value: '2026-10-31' } });
  fireEvent.click(chipDem('2 đêm'));
  await screen.findByText('31/10: 1.300.000đ');
  fireEvent.click(chipNguoi('Khách lẻ'));
  return { dv, onDaLuu };
}

describe('YC5.3 · CN4 lưu và chặn trùng', () => {
  it('YC5.3 bước 9 bấm "Thêm đặt phòng" thì nút chuyển "Đang lưu…", không bấm lại được; chỉ một lệnh ghi', async () => {
    let xong: (v: string) => void = () => {};
    const tao = vi.fn(() => new Promise<string>((r) => { xong = r; }));
    const { onDaLuu } = await chon3110HaiToast(dichVuDu({ taoDatPhong: tao }));
    fireEvent.click(nutLuu());
    const dang = await screen.findByRole('button', { name: 'Đang lưu…' });
    expect(dang).toBeDisabled();
    fireEvent.click(dang);
    expect(tao).toHaveBeenCalledTimes(1);
    await act(async () => { xong('moi'); });
    expect(onDaLuu).toHaveBeenCalledWith(expect.objectContaining({ nguoiDat: 'Khách lẻ', maCan: '1509', canId: 'c1509', ngayNhan: '2026-10-31' }));
  });

  it('YC5.3 bước 11 database từ chối vì trùng thì ở lại form, giữ ô đã nhập, dòng kiểm đỏ "Căn đã có đặt phòng trong những đêm này", đọc lại đặt phòng', async () => {
    const tao = vi.fn(async () => { throw new LoiNguoiDung('Căn đã có đặt phòng trong những đêm này'); });
    const dv = dichVuDu({ taoDatPhong: tao });
    const { onDaLuu } = await chon3110HaiToast(dv);
    const lanDoc = vi.mocked(dv.layDatPhong).mock.calls.length;
    await act(async () => { fireEvent.click(nutLuu()); });
    expect(onDaLuu).not.toHaveBeenCalled();
    const dong = screen.getByText('Căn đã có đặt phòng trong những đêm này');
    expect(dong).toHaveAttribute('role', 'alert');
    expect(dong.className).toContain('cn4-kiem--do');
    expect(vi.mocked(dv.layDatPhong).mock.calls.length).toBeGreaterThan(lanDoc);
    expect(oNhan().value).toBe('2026-10-31');
    expect(oTra().value).toBe('2026-11-02');
    expect(oTien().value).toBe('2.200.000');
    expect(chipNguoi('Khách lẻ')).toHaveAttribute('aria-pressed', 'true');
    expect(nutLuu()).toBeDisabled();
    // Đổi ngày thì dòng kiểm chạy lại theo dữ liệu mới.
    fireEvent.change(oNhan(), { target: { value: '2026-11-05' } });
    expect(screen.queryByText('Căn đã có đặt phòng trong những đêm này')).not.toBeInTheDocument();
  });

  it('YC5.3 bước 12 lỗi dữ liệu thì ở lại form, toast đỏ là nguyên câu database trả về', async () => {
    const tao = vi.fn(async () => { throw new LoiNguoiDung('Ngày trả phải sau ngày nhận'); });
    const { onDaLuu } = await chon3110HaiToast(dichVuDu({ taoDatPhong: tao }));
    await act(async () => { fireEvent.click(nutLuu()); });
    expect(onDaLuu).not.toHaveBeenCalled();
    const toast = await screen.findByText('Ngày trả phải sau ngày nhận');
    expect(toast.closest('[data-kieu="toast"]')).not.toBeNull();
  });

  it('YC5.3 bước 13 QT5.6 mất mạng thì ở lại form, toast mất mạng; bấm lại thì gửi cùng mã lần gửi và lưu được', async () => {
    let lan = 0;
    const tao = vi.fn(async (_d: DatPhongMoi) => { lan += 1; if (lan === 1) throw new TypeError('Failed to fetch'); return 'moi'; });
    const { onDaLuu } = await chon3110HaiToast(dichVuDu({ taoDatPhong: tao }));
    await act(async () => { fireEvent.click(nutLuu()); });
    expect(await screen.findByText('Chưa lưu được vì mất mạng. Kiểm tra mạng rồi bấm lại.')).toBeInTheDocument();
    expect(onDaLuu).not.toHaveBeenCalled();
    expect(oTien().value).toBe('2.200.000');
    await act(async () => { fireEvent.click(nutLuu()); });
    expect(tao).toHaveBeenCalledTimes(2);
    expect(tao.mock.calls[1]![0].clientId).toBe(tao.mock.calls[0]![0].clientId);
    expect(onDaLuu).toHaveBeenCalledTimes(1);
  });

  it('YC5.3 bước 13 quá 15 giây không có trả lời thì toast mất mạng, giữ dữ liệu', async () => {
    const tao = vi.fn(() => new Promise<string>(() => {}));
    const { onDaLuu } = await chon3110HaiToast(dichVuDu({ taoDatPhong: tao }));
    vi.useFakeTimers();
    try {
      fireEvent.click(nutLuu());
      await act(async () => { await vi.advanceTimersByTimeAsync(15000); });
      expect(screen.getByText('Chưa lưu được vì mất mạng. Kiểm tra mạng rồi bấm lại.')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
    expect(onDaLuu).not.toHaveBeenCalled();
    expect(nutLuu()).toBeEnabled();
  });

  it('YC5 Trạng thái màn HV5 căn bị ẩn hay mất quyền trong lúc nhập thì toast "Có lỗi xảy ra. Bạn thử lại sau ít phút."', async () => {
    const tao = vi.fn(async () => { throw Object.assign(new Error('Không tìm thấy căn'), { code: '42501' }); });
    const { onDaLuu } = await chon3110HaiToast(dichVuDu({ taoDatPhong: tao }));
    await act(async () => { fireEvent.click(nutLuu()); });
    expect(await screen.findByText('Có lỗi xảy ra. Bạn thử lại sau ít phút.')).toBeInTheDocument();
    expect(screen.queryByText('Không tìm thấy căn')).not.toBeInTheDocument();
    expect(onDaLuu).not.toHaveBeenCalled();
  });
});
