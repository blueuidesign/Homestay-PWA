// Test unit màn tìm phòng S1-02, S1-03 và S2-00 (YC7.2, US44).
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../chung/Toast';
import type { DichVuTimPhong } from '../lib/dichVuTimPhong';
import type { DieuKienTim, KetQuaTim } from '../lib/timPhong';
import { ManTimPhong } from './S102TimPhong';

afterEach(cleanup);

const HOM_NAY = '2026-10-06';
const TOA = [
  { id: 'icon40', ten: 'ICON40', home247: true }, { id: 'alc', ten: 'À La Carte', home247: true },
  { id: 'sapphire', ten: 'Sapphire', home247: true },
];
const GAN_DAY: DieuKienTim[] = [
  { nhan: '2026-10-10', tra: '2026-10-12', soPhongNgu: [2], toaNha: ['icon40'], view: [] },
  { nhan: '2026-10-17', tra: '2026-10-18', soPhongNgu: [1], toaNha: [], view: ['bien'] },
];
const KHONG: KetQuaTim = {
  soCanTrong: 0, can: [],
  goiY: [
    { loai: 'doi_ngay', soCan: 3, tenToa: [], dieuKien: { nhan: '2026-10-11', tra: '2026-10-13', soPhongNgu: [3], toaNha: ['icon40'], view: [] } },
    { loai: 'bo_loc_toa', soCan: 2, tenToa: ['Sapphire', 'À La Carte'], dieuKien: { nhan: '2026-10-10', tra: '2026-10-12', soPhongNgu: [3], toaNha: [], view: [] } },
  ],
};
const CO: KetQuaTim = { soCanTrong: 5, can: [], goiY: [] };

function dv(kq: KetQuaTim[] = [KHONG]): DichVuTimPhong & { tim: ReturnType<typeof vi.fn> } {
  const ds = [...kq];
  return {
    tim: vi.fn(async () => ds.shift() ?? CO),
    docGanDay: vi.fn(async () => GAN_DAY),
    docToa: vi.fn(async () => TOA),
  };
}

function ve(d = dv()) {
  const onQuayLai = vi.fn();
  render(<ToastProvider><ManTimPhong dv={d} homNay={HOM_NAY} onQuayLai={onQuayLai} /></ToastProvider>);
  return { d, onQuayLai };
}

const nutTim = () => screen.getByRole('button', { name: /Tìm phòng trống/ });
const oNhan = () => screen.getByLabelText('Ngày nhận') as HTMLInputElement;
const oTra = () => screen.getByLabelText('Ngày trả') as HTMLInputElement;

describe('YC7.2 · S1-02, S1-03 tìm phòng', () => {
  it('YC7.2-NT1 chưa chọn ngày nhận: nút "Tìm phòng trống" mờ và ghi "Chọn ngày nhận để tìm phòng"', async () => {
    ve();
    expect(nutTim()).toBeDisabled();
    expect(screen.getByText('Chọn ngày nhận để tìm phòng')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Tìm phòng' })).toBeInTheDocument();
    expect(oNhan()).toHaveAttribute('min', HOM_NAY);
  });

  it('YC7.2-NT2 chọn 10/10 và "2 đêm" thì ngày trả là 12/10, nút sáng (S1-03)', async () => {
    ve();
    fireEvent.change(oNhan(), { target: { value: '2026-10-10' } });
    fireEvent.click(screen.getByRole('button', { name: '2 đêm' }));
    expect(oTra().value).toBe('2026-10-12');
    expect(oTra()).toBeDisabled();
    expect(nutTim()).toBeEnabled();
    expect(screen.queryByText('Chọn ngày nhận để tìm phòng')).toBeNull();
    // Chọn chip trước rồi đổi ngày nhận vẫn giữ 2 đêm.
    fireEvent.change(oNhan(), { target: { value: '2026-10-20' } });
    expect(oTra().value).toBe('2026-10-22');
  });

  it('YC7.2 bước 1 "Tùy chọn" mở ô ngày trả', () => {
    ve();
    fireEvent.change(oNhan(), { target: { value: '2026-10-10' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tùy chọn' }));
    expect(oTra()).toBeEnabled();
    fireEvent.change(oTra(), { target: { value: '2026-10-16' } });
    expect(oTra().value).toBe('2026-10-16');
  });

  it('YC7.2-NT4 chạm một dòng "Tìm gần đây" thì điều kiện của lần đó được điền sẵn', async () => {
    ve();
    const muc = await screen.findByRole('region', { name: 'Tìm gần đây' });
    const dong = within(muc).getAllByRole('button').map((b) => b.textContent);
    expect(dong).toEqual(['10/10 → 12/10 · 2PN · ICON40', '17/10 → 18/10 · 1PN · view biển']);
    fireEvent.click(within(muc).getByRole('button', { name: /10\/10 → 12\/10/ }));
    expect(oNhan().value).toBe('2026-10-10');
    expect(oTra().value).toBe('2026-10-12');
    expect(screen.getByRole('button', { name: '2 đêm' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /2PN/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /ICON40/ })).toHaveAttribute('aria-pressed', 'true');
    expect(nutTim()).toBeEnabled();
  });

  it('YC7.2-NT7 mở lọc "Loại view" thấy đúng "Biển", "Thành phố", "Núi", không có "Vịnh"', () => {
    ve();
    const nhom = screen.getByRole('group', { name: 'Loại view' });
    expect(within(nhom).getAllByRole('button').map((b) => b.textContent)).toEqual(['Biển', 'Thành phố', 'Núi']);
    expect(screen.queryByText('Vịnh')).toBeNull();
  });

  it('YC7.2 bước 3 lọc "Số phòng ngủ", "Tòa nhà" (không có chip "Khác", YC7-H2), không có "Giá mỗi đêm" (YC7-H3)', async () => {
    ve();
    expect(within(screen.getByRole('group', { name: 'Số phòng ngủ' })).getAllByRole('button').map((b) => b.textContent))
      .toEqual(['1PN', '2PN', '3PN', '4PN+']);
    const toa = await screen.findByRole('group', { name: 'Tòa nhà' });
    expect(within(toa).getAllByRole('button').map((b) => b.textContent)).toEqual(['ICON40', 'À La Carte', 'Sapphire']);
    expect(screen.queryByText('Khác')).toBeNull();
    expect(screen.queryByText(/Giá mỗi đêm/)).toBeNull();
  });

  it('YC7.2 bước 5 bấm "Tìm phòng trống" gửi điều kiện đã chọn', async () => {
    const { d } = ve(dv([CO]));
    fireEvent.change(oNhan(), { target: { value: '2026-10-10' } });
    fireEvent.click(screen.getByRole('button', { name: '2 đêm' }));
    fireEvent.click(screen.getByRole('button', { name: '3PN' }));
    fireEvent.click(screen.getByRole('button', { name: 'Biển' }));
    fireEvent.click(nutTim());
    await waitFor(() => expect(d.tim).toHaveBeenCalledWith({ nhan: '2026-10-10', tra: '2026-10-12', soPhongNgu: [3], toaNha: [], view: ['bien'] }));
    expect(await screen.findByText('5 căn trống')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Sửa tìm kiếm' }));
    expect(oNhan().value).toBe('2026-10-10');
  });
});

describe('YC7.2 · S2-00 không có căn trống', () => {
  async function denS200() {
    const r = ve();
    fireEvent.change(oNhan(), { target: { value: '2026-10-10' } });
    fireEvent.click(screen.getByRole('button', { name: '2 đêm' }));
    fireEvent.click(screen.getByRole('button', { name: '3PN' }));
    fireEvent.click(await screen.findByRole('button', { name: 'ICON40' }));
    fireEvent.click(nutTim());
    await screen.findByText('Không có căn trống');
    return r;
  }

  it('YC7.2-NT3 không có căn trống: S2-00 với gợi ý kèm số căn trống, nút "Sửa tìm kiếm", ghi chú căn tự nhập', async () => {
    await denS200();
    expect(screen.getByRole('heading', { name: '10/10 → 12/10 · 3PN · 2 đêm' })).toBeInTheDocument();
    expect(screen.getByText('Các căn 3PN ở ICON40 đã kín 10/10 → 12/10. Thử một trong các cách sau:')).toBeInTheDocument();
    const goiY = within(screen.getByRole('region', { name: 'Gợi ý' })).getAllByRole('button').map((b) => b.textContent);
    expect(goiY).toEqual(['Đổi sang 11/10 → 13/10' + '3 căn trống', 'Bỏ lọc tòa nhà' + '2 căn trống ở Sapphire, À La Carte']);
    expect(screen.getByRole('button', { name: 'Sửa tìm kiếm' })).toBeInTheDocument();
    expect(screen.getByText('Căn tự nhập không có lịch tự động. Gọi chủ nhà để hỏi.')).toBeInTheDocument();
  });

  it('YC7.2-NT3 chạm gợi ý thì tìm lại theo điều kiện của gợi ý', async () => {
    const { d } = await denS200();
    fireEvent.click(screen.getByRole('button', { name: /Đổi sang 11\/10 → 13\/10/ }));
    await waitFor(() => expect(d.tim).toHaveBeenLastCalledWith(KHONG.goiY[0]!.dieuKien));
    expect(await screen.findByText('5 căn trống')).toBeInTheDocument();
  });

  it('YC7.2 bước 6 "Sửa" về S1-03 với điều kiện cũ', async () => {
    await denS200();
    fireEvent.click(screen.getByRole('button', { name: 'Sửa' }));
    expect(oNhan().value).toBe('2026-10-10');
    expect(screen.getByRole('button', { name: '3PN' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('YC7.2 HV2 tìm lỗi (mất mạng) thì báo, vẫn ở màn tìm', async () => {
    const d = dv();
    d.tim.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    ve(d);
    fireEvent.change(oNhan(), { target: { value: '2026-10-10' } });
    fireEvent.click(nutTim());
    await waitFor(() => expect(d.tim).toHaveBeenCalled());
    expect(await screen.findByRole('heading', { name: 'Tìm phòng' })).toBeInTheDocument();
    expect(nutTim()).toBeEnabled();
  });
});
