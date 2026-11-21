// Test unit màn P14, P14-01 Xóa tài khoản (YC1.8), mở từ P2. Dịch vụ giả, không gọi mạng.
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../chung/Toast';
import type { DichVuHoSo, HoSoForm } from '../lib/dichVuHoSo';
import { P2HoSo } from './P2HoSo';
import { CAU_XAC_NHAN_XOA, SE_XOA, VAN_GIU } from './P14XoaTaiKhoan';

afterEach(cleanup);
beforeEach(() => { localStorage.clear(); });

const HOA: HoSoForm = { ten: 'Nguyễn Thị Hoa', tenHienThi: 'Chị Hoa', soDienThoai: '0904118772', email: 'hoa@vidu.test', anhUrl: null };
const dichVu = (g: Partial<DichVuHoSo> = {}): DichVuHoSo => ({
  doc: vi.fn(async () => HOA), luu: vi.fn(async () => undefined), taiAnh: vi.fn(async () => 'uid/a.jpg'), xoaTaiKhoan: vi.fn(async () => undefined), ...g,
});
async function moP14(dv: DichVuHoSo, daXoa = vi.fn()) {
  render(<ToastProvider><P2HoSo dv={dv} onQuayLai={() => undefined} onDaXoa={daXoa} /></ToastProvider>);
  await screen.findByLabelText('Họ và tên');
  fireEvent.click(screen.getByRole('button', { name: 'Xóa tài khoản' }));
  await screen.findByRole('heading', { name: 'Xóa tài khoản' });
  return { daXoa };
}

describe('YC1.8 · P14 Xóa tài khoản', () => {
  it('YC1.8 bước 1 bấm "Xóa tài khoản" ở P2 thì thấy P14 với email, khối "Sẽ xóa", "Vẫn giữ"', async () => {
    await moP14(dichVu());
    expect(document.querySelector('[data-man="P14"]')).not.toBeNull();
    expect(screen.getByText('Xóa tài khoản hoa@vidu.test. Đọc kỹ điều gì mất, điều gì còn.')).toBeInTheDocument();
    for (const c of [...SE_XOA, ...VAN_GIU]) expect(screen.getByText(c)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Giữ tài khoản' })).toBeInTheDocument();
  });

  it('YC1.8-NT2 bấm "Xóa tài khoản" một lần thì chỉ hiện P14-01, chưa xóa', async () => {
    const dv = dichVu();
    const { daXoa } = await moP14(dv);
    fireEvent.click(screen.getByRole('button', { name: 'Xóa tài khoản' }));
    expect(await screen.findByRole('button', { name: CAU_XAC_NHAN_XOA })).toBeInTheDocument();
    expect(document.querySelector('[data-man="P14-01"]')).not.toBeNull();
    expect(dv.xoaTaiKhoan).not.toHaveBeenCalled();
    expect(daXoa).not.toHaveBeenCalled();
  });

  it('YC1.8-NT2 bấm "Giữ tài khoản" ở P14 hay P14-01 thì về P2, không gì đổi', async () => {
    const dv = dichVu();
    await moP14(dv);
    fireEvent.click(screen.getByRole('button', { name: 'Giữ tài khoản' }));
    expect(await screen.findByRole('heading', { name: 'Thông tin cá nhân' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Tên hiển thị'), { target: { value: 'Chị Hoa Đang Gõ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Xóa tài khoản' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Xóa tài khoản' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Giữ tài khoản' }));
    expect((await screen.findByLabelText('Tên hiển thị') as HTMLInputElement).value).toBe('Chị Hoa Đang Gõ');
    expect(dv.xoaTaiKhoan).not.toHaveBeenCalled();
    expect(dv.luu).not.toHaveBeenCalled();
  });

  it('YC1.8 bước 3 bấm lần hai thì gọi lệnh xóa rồi về A1', async () => {
    const dv = dichVu();
    const { daXoa } = await moP14(dv);
    fireEvent.click(screen.getByRole('button', { name: 'Xóa tài khoản' }));
    fireEvent.click(await screen.findByRole('button', { name: CAU_XAC_NHAN_XOA }));
    await waitFor(() => expect(daXoa).toHaveBeenCalledTimes(1));
    expect(dv.xoaTaiKhoan).toHaveBeenCalledTimes(1);
  });

  it('YC1.8-NT3 HV2 lệnh xóa lỗi thì báo, ở lại P14-01, không về A1', async () => {
    const dv = dichVu({ xoaTaiKhoan: vi.fn(async () => { throw new Error('mạng'); }) });
    const { daXoa } = await moP14(dv);
    fireEvent.click(screen.getByRole('button', { name: 'Xóa tài khoản' }));
    fireEvent.click(await screen.findByRole('button', { name: CAU_XAC_NHAN_XOA }));
    expect(await screen.findByRole('status')).toBeInTheDocument();
    expect(daXoa).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: CAU_XAC_NHAN_XOA })).toBeInTheDocument();
  });
});
