// Test unit màn CN5-A1 Thêm căn, CN5-A3 lỗi khi lưu (YC3.2 bước 15 đến 21, QT5.6, HV3).
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { CAU_KHOI_PHUC } from '../chung/nhap';
import { ToastProvider } from '../chung/Toast';
import type { CanMoi } from '../lib/dichVuCan';
import { docBanNhapThemCan, ghiBanNhapThemCan, GIU_NHAP_THEM_CAN_MS } from './banNhap';
import { CN5A1ThemCan } from './CN5A1ThemCan';

beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); vi.useRealTimers(); });

function ve(taoCan?: (c: CanMoi) => Promise<string>) {
  const onXong = vi.fn();
  const onQuayLai = vi.fn();
  render(<ToastProvider><CN5A1ThemCan taoCan={taoCan} onXong={onXong} onQuayLai={onQuayLai} /></ToastProvider>);
  return { onXong, onQuayLai };
}

const oMa = () => screen.getByLabelText(/Mã căn \(tên căn hộ\)/);
const nut = () => screen.getByRole('button', { name: /^(Thêm căn|Đang lưu…)$/ });
const chip = (chu: string) => screen.getByRole('button', { name: chu });

describe('YC3.2 · CN5-A1 Thêm căn', () => {
  it('YC3.2 bước 15 form có tiêu đề "Thêm căn", ô mã căn, hàng chip số phòng ngủ, mục Ảnh, dòng thu gọn', () => {
    ve(vi.fn());
    expect(screen.getByRole('heading', { name: 'Thêm căn' })).toBeInTheDocument();
    expect(oMa()).toHaveAttribute('placeholder', 'VD: 1509 hoặc Greenbay');
    for (const c of ['Studio', '1PN', '2PN', '3PN', '4PN+']) expect(chip(c)).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('Ảnh')).toBeInTheDocument();
    expect(screen.getByText('Bạn có thể thêm sau')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Thêm tòa nhà, mô tả gửi khách, view\.\.\./ })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Không bắt buộc. Chỉ cần mã căn và số phòng ngủ là dùng được lịch.')).toBeInTheDocument();
  });

  it('YC3.2-NT1 chưa có mã căn hay số phòng ngủ thì nút "Thêm căn" không bấm được, dòng "Còn thiếu" nêu đúng ô thiếu', () => {
    const tao = vi.fn();
    ve(tao);
    expect(nut()).toBeDisabled();
    expect(screen.getByText('Còn thiếu: mã căn, số phòng ngủ')).toBeInTheDocument();
    fireEvent.change(oMa(), { target: { value: '1509' } });
    expect(screen.getByText('Còn thiếu: số phòng ngủ')).toBeInTheDocument();
    expect(nut()).toBeDisabled();
    fireEvent.change(oMa(), { target: { value: '' } });
    fireEvent.click(chip('2PN'));
    expect(screen.getByText('Còn thiếu: mã căn')).toBeInTheDocument();
    expect(nut()).toBeDisabled();
    fireEvent.click(nut());
    expect(tao).not.toHaveBeenCalled();
  });

  it('YC3.2-NT2 chỉ nhập "2105" và chọn "1PN", không mở phần thêm, không ảnh, thì thêm được', async () => {
    const tao = vi.fn(async (_c: CanMoi) => 'id-2105');
    const { onXong } = ve(tao);
    fireEvent.change(oMa(), { target: { value: ' 2105 ' } });
    fireEvent.click(chip('1PN'));
    expect(chip('1PN')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Đủ thông tin. Ảnh, giá thêm sau cũng được.')).toBeInTheDocument();
    expect(nut()).toBeEnabled();
    fireEvent.click(nut());
    await waitFor(() => expect(onXong).toHaveBeenCalledWith('2105', 'id-2105'));
    expect(tao).toHaveBeenCalledTimes(1);
    expect(tao.mock.calls[0]![0]).toMatchObject({ maCan: '2105', soPhongNgu: 1 });
    expect(tao.mock.calls[0]![0].clientId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('YC3.2-NT3 bỏ trống số giường thì dòng "Còn thiếu" không nhắc số giường và vẫn thêm được', async () => {
    const tao = vi.fn(async (_c: CanMoi) => 'id');
    const { onXong } = ve(tao);
    fireEvent.change(oMa(), { target: { value: 'Greenbay' } });
    fireEvent.click(chip('Studio'));
    expect(screen.queryByText(/giường/)).toBeNull();
    fireEvent.click(nut());
    await waitFor(() => expect(onXong).toHaveBeenCalled());
    expect(tao.mock.calls[0]![0]).toMatchObject({ maCan: 'Greenbay', soPhongNgu: 0 });
    expect(tao.mock.calls[0]![0].soGiuong ?? null).toBeNull();
  });

  it('YC3.2 bước 18 đang lưu thì nút đổi chữ, không bấm lại được', async () => {
    let xong!: (v: string) => void;
    const tao = vi.fn(() => new Promise<string>((r) => { xong = r; }));
    ve(tao);
    fireEvent.change(oMa(), { target: { value: '2105' } });
    fireEvent.click(chip('1PN'));
    fireEvent.click(nut());
    expect(await screen.findByRole('button', { name: 'Đang lưu…' })).toBeDisabled();
    fireEvent.click(nut());
    expect(tao).toHaveBeenCalledTimes(1);
    await act(async () => { xong('id'); });
  });

  it('YC3.2-NT4 database từ chối mã trùng thì câu "Đã có căn 1509. Kiểm tra lại mã căn." hiện dưới ô mã căn, giữ mọi ô (CN5-A3)', async () => {
    const tao = vi.fn(async () => { throw new LoiNguoiDung('Đã có căn 1509. Kiểm tra lại mã căn.'); });
    const { onXong } = ve(tao);
    fireEvent.change(oMa(), { target: { value: '1509' } });
    fireEvent.click(chip('2PN'));
    fireEvent.click(nut());
    const loi = await screen.findByText(/Đã có căn 1509\. Kiểm tra lại mã căn\./);
    expect(oMa()).toHaveAttribute('aria-describedby', loi.id);
    expect(oMa()).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Chưa thêm được căn. Sửa 1 chỗ bên dưới.')).toBeInTheDocument();
    expect(oMa()).toHaveValue('1509');
    expect(chip('2PN')).toHaveAttribute('aria-pressed', 'true');
    expect(onXong).not.toHaveBeenCalled();
    // Sửa mã thì câu dưới ô mất.
    fireEvent.change(oMa(), { target: { value: '1510' } });
    expect(screen.queryByText(/Đã có căn 1509/)).toBeNull();
  });

  it('YC3.2 bước 21 mất mạng thì ở lại form, giữ dữ liệu, toast "Chưa lưu được vì mất mạng. Kiểm tra mạng rồi bấm lại."', async () => {
    const tao = vi.fn(async () => { throw new TypeError('Failed to fetch'); });
    const { onXong } = ve(tao);
    fireEvent.change(oMa(), { target: { value: '2105' } });
    fireEvent.click(chip('1PN'));
    fireEvent.click(nut());
    expect(await screen.findByText('Chưa lưu được vì mất mạng. Kiểm tra mạng rồi bấm lại.')).toBeInTheDocument();
    expect(oMa()).toHaveValue('2105');
    expect(onXong).not.toHaveBeenCalled();
  });

  it('YC3.2 bước 21 quá 15 giây không có trả lời thì toast mất mạng; YC3.2-NT9 bấm lại gửi cùng mã lần gửi', async () => {
    vi.useFakeTimers();
    const tao = vi.fn<(c: CanMoi) => Promise<string>>(() => new Promise<string>(() => {}));
    const { onXong } = ve(tao);
    fireEvent.change(oMa(), { target: { value: '2105' } });
    fireEvent.click(chip('1PN'));
    fireEvent.click(nut());
    await act(async () => { await vi.advanceTimersByTimeAsync(15_000); });
    expect(screen.getByText('Chưa lưu được vì mất mạng. Kiểm tra mạng rồi bấm lại.')).toBeInTheDocument();
    tao.mockImplementation(async () => 'id-2105');
    fireEvent.click(nut());
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    expect(onXong).toHaveBeenCalledWith('2105', 'id-2105');
    expect(tao).toHaveBeenCalledTimes(2);
    expect(tao.mock.calls[1]![0].clientId).toBe(tao.mock.calls[0]![0].clientId);
  });

  it('HV3-NT2 nháp lưu mỗi lần sửa; mở lại form thì điền lại và báo "Đã khôi phục nội dung bạn đang nhập"', () => {
    ve(vi.fn());
    expect(screen.queryByText(CAU_KHOI_PHUC)).toBeNull();
    fireEvent.change(oMa(), { target: { value: '2105' } });
    fireEvent.click(chip('3PN'));
    const nhap = docBanNhapThemCan();
    expect(nhap).toMatchObject({ maCan: '2105', soPhongNgu: 3 });
    cleanup();
    ve(vi.fn());
    expect(screen.getByText('Đã khôi phục nội dung bạn đang nhập')).toBeInTheDocument();
    expect(oMa()).toHaveValue('2105');
    expect(chip('3PN')).toHaveAttribute('aria-pressed', 'true');
  });

  it('HV3-NT2 HV3-H1 nháp giữ 7 ngày kể từ lần sửa cuối, quá thì bỏ', () => {
    const bay = Date.now();
    ghiBanNhapThemCan({ maCan: '2105', soPhongNgu: 1, clientId: 'x' }, bay - GIU_NHAP_THEM_CAN_MS + 60_000);
    expect(docBanNhapThemCan(bay)).not.toBeNull();
    ghiBanNhapThemCan({ maCan: '2105', soPhongNgu: 1, clientId: 'x' }, bay - GIU_NHAP_THEM_CAN_MS - 60_000);
    expect(docBanNhapThemCan(bay)).toBeNull();
    expect(GIU_NHAP_THEM_CAN_MS).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('HV3 bước 5 lưu xong thì xóa nháp; bấm quay lại (bỏ form) cũng xóa nháp', async () => {
    const tao = vi.fn(async (_c: CanMoi) => 'id');
    const { onXong } = ve(tao);
    fireEvent.change(oMa(), { target: { value: '2105' } });
    fireEvent.click(chip('1PN'));
    fireEvent.click(nut());
    await waitFor(() => expect(onXong).toHaveBeenCalled());
    expect(docBanNhapThemCan()).toBeNull();
    cleanup();
    const { onQuayLai } = ve(tao);
    fireEvent.change(oMa(), { target: { value: '9' } });
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    expect(onQuayLai).toHaveBeenCalled();
    expect(docBanNhapThemCan()).toBeNull();
  });

  it('QT5.6 mở lại form có nháp thì dùng lại mã lần gửi của nháp', async () => {
    ghiBanNhapThemCan({ maCan: '2105', soPhongNgu: 1, clientId: '11111111-1111-4111-8111-111111111111' });
    const tao = vi.fn(async (_c: CanMoi) => 'id');
    ve(tao);
    fireEvent.click(nut());
    await waitFor(() => expect(tao).toHaveBeenCalled());
    expect(tao.mock.calls[0]![0].clientId).toBe('11111111-1111-4111-8111-111111111111');
  });
});
