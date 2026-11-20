// Test unit màn P2 Thông tin cá nhân (YC1.4). Dịch vụ giả, không gọi mạng.
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { ToastProvider } from '../chung/Toast';
import type { DichVuHoSo, HoSoForm } from '../lib/dichVuHoSo';
import { CAU_DA_LUU_HO_SO, P2HoSo } from './P2HoSo';

afterEach(cleanup);
beforeEach(() => { localStorage.clear(); });

const HOA: HoSoForm = { ten: 'Nguyễn Thị Hoa', tenHienThi: 'Chị Hoa', soDienThoai: '0904118772', email: 'hoa@vidu.test', anhUrl: null };

function dichVu(ghiDe: Partial<DichVuHoSo> = {}): DichVuHoSo {
  return { doc: vi.fn(async () => HOA), luu: vi.fn(async () => undefined), taiAnh: vi.fn(async () => 'uid/a.jpg'), ...ghiDe };
}
async function ve(dv: DichVuHoSo, quayLai = vi.fn()) {
  render(<ToastProvider><P2HoSo dv={dv} onQuayLai={quayLai} /></ToastProvider>);
  await screen.findByLabelText('Họ và tên');
  return { quayLai };
}
const o = (ten: string) => screen.getByLabelText(ten) as HTMLInputElement;
const luu = () => fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));

describe('YC1.4 · P2 Thông tin cá nhân', () => {
  it('YC1.4 bước 1 mở màn thì thấy ô điền sẵn, câu hướng dẫn, khối "Đăng nhập" với email, nút "Đổi ảnh đại diện" và "Xóa tài khoản"', async () => {
    await ve(dichVu());
    expect(o('Họ và tên').value).toBe('Nguyễn Thị Hoa');
    expect(o('Tên hiển thị').value).toBe('Chị Hoa');
    expect(o('Số điện thoại').value).toBe('0904118772');
    expect(screen.getByText('Sale thấy tên này trong Nguồn phòng.')).toBeInTheDocument();
    expect(screen.getByText('Sale và chủ nhà đã kết nối thấy số này để gọi cho bạn. Cần từ 9 đến 15 chữ số.')).toBeInTheDocument();
    expect(screen.getByText('hoa@vidu.test')).toBeInTheDocument();
    expect(screen.getByText('Mã đăng nhập gửi về email này. Không đổi email ở đây được.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Đổi ảnh đại diện' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Xóa tài khoản' })).toBeInTheDocument();
  });

  it('YC1.4-NT1 Chị Hoa sửa tên hiển thị và lưu thì gửi tên mới (đã bỏ khoảng trắng), toast, ở lại màn', async () => {
    const dv = dichVu();
    const { quayLai } = await ve(dv);
    fireEvent.change(o('Tên hiển thị'), { target: { value: '  Chị Hoa Mới ' } });
    luu();
    await waitFor(() => expect(dv.luu).toHaveBeenCalledWith({ ten: 'Nguyễn Thị Hoa', tenHienThi: 'Chị Hoa Mới', soDienThoai: '0904118772', anh: undefined }));
    expect(await screen.findByText(CAU_DA_LUU_HO_SO)).toBeInTheDocument();
    expect(quayLai).not.toHaveBeenCalled();
  });

  it('YC1.4-NT2 Chị Hoa sửa số đúng luật kiểm và lưu thì gửi số đó', async () => {
    const dv = dichVu();
    await ve(dv);
    fireEvent.change(o('Số điện thoại'), { target: { value: '0912 345 678' } });
    luu();
    await waitFor(() => expect(dv.luu).toHaveBeenCalledWith(expect.objectContaining({ soDienThoai: '0912 345 678' })));
  });

  it('YC1.4-NT5 số sai luật kiểm thì báo dưới ô và không gửi lệnh; họ tên, tên hiển thị trống cũng vậy', async () => {
    const dv = dichVu();
    await ve(dv);
    fireEvent.change(o('Số điện thoại'), { target: { value: '12345' } });
    fireEvent.change(o('Họ và tên'), { target: { value: '  ' } });
    fireEvent.change(o('Tên hiển thị'), { target: { value: '' } });
    luu();
    expect(await screen.findByText('Số điện thoại cần từ 9 đến 15 chữ số.', { selector: 'p[role=alert]' })).toBeInTheDocument();
    expect(screen.getByText('Nhập họ và tên để sale và chủ nhà biết bạn là ai.')).toBeInTheDocument();
    expect(screen.getByText('Tên hiển thị từ 1 đến 100 ký tự', { selector: 'p[role=alert]' })).toBeInTheDocument();
    expect(dv.luu).not.toHaveBeenCalled();
  });

  it('YC1.4-NT5 database báo số đã có tài khoản thì hiện câu dưới ô số, giữ chữ đang gõ', async () => {
    const dv = dichVu({ luu: vi.fn(async () => { throw new LoiNguoiDung('Số này đã có tài khoản.'); }) });
    await ve(dv);
    fireEvent.change(o('Số điện thoại'), { target: { value: '0900000002' } });
    luu();
    expect(await screen.findByText('Số này đã có tài khoản.')).toBeInTheDocument();
    expect(o('Số điện thoại').value).toBe('0900000002');
  });

  it('YC1.4 HV2 lưu lỗi mạng thì báo, giữ chữ đang gõ; HV3 nháp khôi phục khi mở lại', async () => {
    const dv = dichVu({ luu: vi.fn(async () => { throw new Error('mạng'); }) });
    await ve(dv);
    fireEvent.change(o('Tên hiển thị'), { target: { value: 'Hoa Đang Gõ' } });
    luu();
    await waitFor(() => expect(dv.luu).toHaveBeenCalled());
    expect(o('Tên hiển thị').value).toBe('Hoa Đang Gõ');
    cleanup();
    await ve(dichVu());
    expect(o('Tên hiển thị').value).toBe('Hoa Đang Gõ');
  });

  it('YC1.4 bước 2 chọn ảnh thì tải lên ngay, lưu thì gửi kèm đường dẫn ảnh; file không phải ảnh bị chặn', async () => {
    const dv = dichVu();
    await ve(dv);
    const file = new File(['x'], 'a.jpg', { type: 'image/jpeg' });
    fireEvent.change(screen.getByLabelText('Chọn ảnh đại diện'), { target: { files: [file] } });
    await waitFor(() => expect(dv.taiAnh).toHaveBeenCalledWith(file));
    luu();
    await waitFor(() => expect(dv.luu).toHaveBeenCalledWith(expect.objectContaining({ anh: 'uid/a.jpg' })));
    fireEvent.change(screen.getByLabelText('Chọn ảnh đại diện'), { target: { files: [new File(['x'], 'a.pdf', { type: 'application/pdf' })] } });
    expect(await screen.findByText('Ảnh phải là JPEG, PNG hoặc HEIC, tối đa 15 MB')).toBeInTheDocument();
    expect(dv.taiAnh).toHaveBeenCalledTimes(1);
  });

  it('YC1.4 HV2 không đọc được hồ sơ thì Thử lại', async () => {
    const doc = vi.fn().mockRejectedValueOnce(new Error('mạng')).mockResolvedValue(HOA);
    render(<ToastProvider><P2HoSo dv={{ ...dichVu(), doc }} onQuayLai={vi.fn()} /></ToastProvider>);
    fireEvent.click(await screen.findByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByLabelText('Họ và tên')).toBeInTheDocument();
  });

  it('YC1.4 Quay lại gọi onQuayLai', async () => {
    const { quayLai } = await ve(dichVu());
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    expect(quayLai).toHaveBeenCalled();
  });
});
