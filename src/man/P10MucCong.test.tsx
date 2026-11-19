// Test unit màn P10 · Mức cộng giá mặc định (YC7.5, US47). Dịch vụ là bản giả, không gọi mạng.
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { ToastProvider } from '../chung/Toast';
import type { ChiTietCanSale } from '../lib/chiTietCanSale';
import type { DichVuChiTietCanSale } from '../lib/dichVuChiTietCanSale';
import type { DichVuMucCong, MucCongMacDinh } from '../lib/dichVuMucCong';
import { CAU_DA_LUU_MUC_CONG, P10MucCong } from './P10MucCong';
import { S3ChiTietCan } from './S3ChiTietCan';

afterEach(cleanup);

function dichVu(dau: MucCongMacDinh = { muc: 400_000, lamTron: false }, ghiDe: Partial<DichVuMucCong> = {}) {
  const d = { doc: vi.fn(async () => dau), luu: vi.fn(async () => undefined), ...ghiDe };
  return d as DichVuMucCong & typeof d;
}

async function ve(dv: DichVuMucCong = dichVu()) {
  const onQuayLai = vi.fn();
  const onDaLuu = vi.fn();
  render(<ToastProvider><P10MucCong dv={dv} onQuayLai={onQuayLai} onDaLuu={onDaLuu} /></ToastProvider>);
  await screen.findByText('Cộng mỗi đêm');
  return { onQuayLai, onDaLuu };
}

const nhom = () => screen.getByRole('group', { name: 'Cộng mỗi đêm' });
const chip = (ten: string) => within(nhom()).getByRole('button', { name: ten });
const chuChip = (goc: HTMLElement) => within(goc).getAllByRole('button').map((b) => (b.textContent ?? '').replace('✓', ''));
const dong = (ten: string) => screen.getByTestId(ten).textContent;

describe('YC7.5 · P10 Mức cộng giá mặc định', () => {
  it('YC7.5 bước 1, 4 mở màn: câu giới thiệu, mức đang lưu +400k sáng, ví dụ và ghi chú S3', async () => {
    await ve();
    expect(screen.getByRole('heading', { name: 'Mức cộng giá mặc định' })).toBeInTheDocument();
    expect(screen.getByText('Cộng thêm vào giá chủ nhà mỗi đêm khi soạn tin gửi khách. Khách chỉ thấy giá đã cộng.')).toBeInTheDocument();
    expect(chip('+400k')).toHaveAttribute('aria-pressed', 'true');
    expect(chip('+200k')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('Ví dụ: phòng 1.100.000đ/đêm, 2 đêm')).toBeInTheDocument();
    expect(dong('vd-gia-chu')).toBe('2.200.000đ');
    expect(dong('vd-gui-khach')).toBe('3.000.000đ');
    expect(dong('vd-ban-duoc')).toBe('800.000đ');
    expect(screen.getByText('Khi soạn tin (S3) vẫn sửa được mức cộng cho từng căn.')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Làm tròn lên 50.000đ' })).toHaveAttribute('aria-checked', 'false');
  });

  it('YC7.5-NT1 chọn "+400k" thì ví dụ 2 đêm ghi "Bạn được 800.000đ"', async () => {
    await ve(dichVu({ muc: 0, lamTron: false }));
    fireEvent.click(chip('+400k'));
    expect(chip('+400k')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Bạn được')).toBeInTheDocument();
    expect(dong('vd-ban-duoc')).toBe('800.000đ');
  });

  it('YC7.5-NT2 chọn "Không cộng" thì giá gửi khách bằng giá chủ nhà', async () => {
    await ve();
    fireEvent.click(chip('Không cộng'));
    expect(dong('vd-gui-khach')).toBe(dong('vd-gia-chu'));
    expect(dong('vd-gui-khach')).toBe('2.200.000đ');
    expect(dong('vd-ban-duoc')).toBe('0đ');
  });

  it('YC7.5 bước 3 bật làm tròn 50.000đ: ví dụ làm tròn từng đêm (+130k: 1.230.000đ thành 1.250.000đ)', async () => {
    await ve(dichVu({ muc: 0, lamTron: false }));
    fireEvent.click(chip('Tùy chọn'));
    fireEvent.change(screen.getByLabelText('Mức cộng mỗi đêm, nghìn đồng'), { target: { value: '130' } });
    expect(dong('vd-gui-khach')).toBe('2.460.000đ');
    fireEvent.click(screen.getByRole('checkbox', { name: 'Làm tròn lên 50.000đ' }));
    expect(screen.getByRole('checkbox', { name: 'Làm tròn lên 50.000đ' })).toHaveAttribute('aria-checked', 'true');
    expect(dong('vd-gui-khach')).toBe('2.500.000đ');
    expect(dong('vd-ban-duoc')).toBe('300.000đ');
  });

  it('YC7.5 bước 5 bấm "Lưu thay đổi": ghi mức và cờ làm tròn, toast "Đã lưu mức cộng"', async () => {
    const dv = dichVu();
    const { onDaLuu } = await ve(dv);
    fireEvent.click(chip('+200k'));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Làm tròn lên 50.000đ' }));
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
    await waitFor(() => expect(dv.luu).toHaveBeenCalledWith(200_000, true));
    expect(await screen.findByText(CAU_DA_LUU_MUC_CONG)).toBeInTheDocument();
    expect(CAU_DA_LUU_MUC_CONG).toBe('Đã lưu mức cộng');
    expect(onDaLuu).toHaveBeenCalled();
  });

  it('YC7.5 YC7-H10 chip "Tùy chọn": gõ "250" là 250.000đ', async () => {
    const dv = dichVu();
    await ve(dv);
    fireEvent.click(chip('Tùy chọn'));
    expect(chip('Tùy chọn')).toHaveAttribute('aria-pressed', 'true');
    const o = screen.getByLabelText('Mức cộng mỗi đêm, nghìn đồng');
    expect(o).toHaveAttribute('inputmode', 'numeric');
    fireEvent.change(o, { target: { value: '250' } });
    expect(dong('vd-ban-duoc')).toBe('500.000đ');
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
    await waitFor(() => expect(dv.luu).toHaveBeenCalledWith(250_000, false));
  });

  it('YC7.5 YC7-H10 ngoài 0 đến 5.000.000đ thì nút Lưu mờ, ghi "Mức cộng từ 0 đến 5.000.000đ"', async () => {
    const dv = dichVu();
    await ve(dv);
    fireEvent.click(chip('Tùy chọn'));
    fireEvent.change(screen.getByLabelText('Mức cộng mỗi đêm, nghìn đồng'), { target: { value: '5001' } });
    expect(screen.getByText('Mức cộng từ 0 đến 5.000.000đ')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Lưu thay đổi' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Mức cộng mỗi đêm, nghìn đồng'), { target: { value: '5000' } });
    expect(screen.queryByText('Mức cộng từ 0 đến 5.000.000đ')).toBeNull();
    expect(screen.getByRole('button', { name: 'Lưu thay đổi' })).toBeEnabled();
  });

  it('YC7.5 bước 1 mức đang lưu không có chip (+250k) thì "Tùy chọn" sáng, ô ghi 250', async () => {
    await ve(dichVu({ muc: 250_000, lamTron: true }));
    expect(chip('Tùy chọn')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Mức cộng mỗi đêm, nghìn đồng')).toHaveValue('250');
    expect(screen.getByRole('checkbox', { name: 'Làm tròn lên 50.000đ' })).toHaveAttribute('aria-checked', 'true');
  });

  it('YC7.5 HV2 QT5.5 lưu lỗi: toast câu của database, giữ lựa chọn, không rời màn', async () => {
    const dv = dichVu(undefined, { luu: vi.fn(async () => { throw new LoiNguoiDung('Mức cộng từ 0 đến 5.000.000đ'); }) });
    const { onDaLuu } = await ve(dv);
    fireEvent.click(chip('+300k'));
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Mức cộng từ 0 đến 5.000.000đ');
    expect(chip('+300k')).toHaveAttribute('aria-pressed', 'true');
    expect(onDaLuu).not.toHaveBeenCalled();
  });

  it('YC7.5 HV2 không đọc được mức cộng: Thử lại', async () => {
    const doc = vi.fn().mockRejectedValueOnce(new TypeError('mất mạng')).mockResolvedValue({ muc: 100_000, lamTron: false });
    render(<ToastProvider><P10MucCong dv={{ doc, luu: vi.fn() }} onQuayLai={vi.fn()} onDaLuu={vi.fn()} /></ToastProvider>);
    fireEvent.click(await screen.findByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByRole('group', { name: 'Cộng mỗi đêm' })).toBeInTheDocument();
    expect(chip('+100k')).toHaveAttribute('aria-pressed', 'true');
  });

  it('YC7.5 nút Quay lại', async () => {
    const { onQuayLai } = await ve();
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    expect(onQuayLai).toHaveBeenCalled();
  });
});

describe('YC7.5-NT5 · P10 và S3 cùng một bộ chip', () => {
  it('YC7.5-NT5 sale mở P10 và S3: hai bộ chip mức cộng giống nhau, theo glossary (S3 thêm "Mặc định" ở đầu, YC7-H7)', async () => {
    const GLOSSARY = ['Không cộng', '+100k', '+200k', '+300k', '+400k', '+500k', 'Tùy chọn'];
    await ve();
    const p10 = chuChip(nhom());
    expect(p10).toEqual(GLOSSARY);
    cleanup();

    const ct: ChiTietCanSale = {
      canId: 'c1509', maCan: '1509', tenToa: 'ICON40', khuVuc: null, soPhongNgu: 2, soGiuong: 3, loaiView: null, lichDoiLuc: null,
      anh: [], chu: { ten: 'Chị Hoa', soDienThoai: null, soCan: 1 }, gioNhan: '14:00', gioTra: '12:00', tu: '2026-10-10', den: '2026-10-12',
      dem: [{ ngay: '2026-10-10', giaChu: 1_300_000, giaBan: 1_700_000 }, { ngay: '2026-10-11', giaChu: 900_000, giaBan: 1_300_000 }],
      tongGiaChu: 2_200_000, tongGiaBan: 3_000_000, mucCong: 400_000, mucCongRieng: null, mucCongMacDinh: 400_000, lamTron50k: false, lich: [],
    };
    const dvS3: DichVuChiTietCanSale = { doc: vi.fn(async () => ({ khongConQuyen: false as const, ...ct })), datMuc: vi.fn() };
    render(
      <ToastProvider>
        <S3ChiTietCan dv={dvS3} canId="c1509" tenTam="ICON40 1509" tu="2026-10-10" den="2026-10-12" khachHoi={false}
                      homNay="2026-10-07" onQuayLai={vi.fn()} />
      </ToastProvider>,
    );
    const s3 = chuChip(await screen.findByRole('group', { name: 'Cộng thêm cho bạn' }));
    expect(s3[0]).toBe('Mặc định +400k');
    expect(s3.slice(1)).toEqual(p10);
  });
});
