// Test unit sửa, xóa đặt phòng tự ghi (YC10.4-NT8, NT9, US57). Số theo DLM: V1 20/09 → 22/09, V2 08/10 → 09/10 của Villa Tuần Châu.
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { ToastProvider } from '../chung/Toast';
import type { ChiTietCanTuNhap } from '../lib/dichVuCanTuNhap';
import type { DongLichSale } from '../lib/lichSale';
import { S1LichSale } from './S1LichSale';
import { S603CanTuNhap } from './S603CanTuNhap';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const V1 = { id: 'V1', ngayNhan: '2026-09-20', ngayTra: '2026-09-22', traChu: 2_800_000, thuKhach: 3_400_000 };
const V2 = { id: 'V2', ngayNhan: '2026-10-08', ngayTra: '2026-10-09', traChu: 1_400_000, thuKhach: 1_600_000 };
const VILLA: ChiTietCanTuNhap = {
  canId: 'villa', maCan: 'Villa Tuần Châu', toaNhaId: null, tenToa: null, soPhongNgu: 2, soGiuong: 3, loaiView: null,
  tenChu: 'Chú Bình', soDienThoai: '0904123330', giaThuong: 1_400_000, giaCuoiTuan: null, anh: [], datPhong: [V1, V2],
};

function ve(p: { sua?: () => Promise<void>; xoa?: () => Promise<void>; sau?: ChiTietCanTuNhap } = {}) {
  const doc = vi.fn().mockResolvedValueOnce(VILLA).mockResolvedValue(p.sau ?? VILLA);
  const datPhong = {
    dienSan: vi.fn(async () => ({ traChu: 1_400_000, thuKhach: 1_600_000 })),
    ghi: vi.fn(async () => 'x'),
    sua: vi.fn(p.sua ?? (async () => {})),
    xoa: vi.fn(p.xoa ?? (async () => {})),
  };
  render(<ToastProvider><S603CanTuNhap canId="villa" tenTam="Villa Tuần Châu" homNay="2026-10-07" dv={{ doc, xoa: vi.fn(), datPhong }}
                                       onQuayLai={vi.fn()} onGuiKhach={vi.fn()} onSua={vi.fn()} onDatPhong={vi.fn()} onDaXoa={vi.fn()} /></ToastProvider>);
  return { doc, datPhong };
}
const o = (nhan: string) => screen.getByLabelText(nhan) as HTMLInputElement;
async function moV2() {
  fireEvent.click(await screen.findByRole('button', { name: 'Sửa đặt phòng 08/10 → 09/10 (1 đêm)' }));
  return screen.getByRole('dialog', { name: 'Sửa đặt phòng' });
}

describe('YC10.4 · sửa, xóa đặt phòng tự ghi', () => {
  it('YC10.4-NT8 chạm V2, đổi "Thu khách" thành 1.800.000đ, "Lưu thay đổi" thì lưu 1.800.000đ, các đêm không đổi', async () => {
    const { datPhong, doc } = ve({ sau: { ...VILLA, datPhong: [V1, { ...V2, thuKhach: 1_800_000 }] } });
    const tam = await moV2();
    expect(within(tam).getByTestId('dong-so-dem')).toHaveTextContent('08/10 → 09/10 (1 đêm)');
    expect(o('Trả chủ (đ)').value).toBe('1.400.000');
    expect(o('Thu khách (đ)').value).toBe('1.600.000');
    expect(datPhong.dienSan).not.toHaveBeenCalled();
    fireEvent.change(o('Thu khách (đ)'), { target: { value: '1800000' } });
    expect(within(tam).getByTestId('dong-loi')).toHaveTextContent('Bạn lời 400.000đ');
    fireEvent.click(within(tam).getByRole('button', { name: 'Lưu thay đổi' }));
    await waitFor(() => expect(datPhong.sua).toHaveBeenCalledWith('V2', {
      ngayNhan: '2026-10-08', ngayTra: '2026-10-09', traChu: 1_400_000, thuKhach: 1_800_000,
    }));
    await waitFor(() => expect(doc).toHaveBeenCalledTimes(2));
    expect(screen.queryByRole('dialog')).toBeNull();
    const dong = await screen.findAllByTestId('dat-phong');
    await waitFor(() => expect(dong[1]).toHaveTextContent('Thu khách 1.800.000đ'));
  });

  it('YC10.4-NT8 đổi sang đêm trùng V1 thì database từ chối, báo câu đó, form còn mở (QT1.3)', async () => {
    const { datPhong } = ve({ sua: async () => { throw new LoiNguoiDung('Bạn đã ghi đặt phòng cho căn này đêm 21/09'); } });
    const tam = await moV2();
    fireEvent.click(within(tam).getByRole('button', { name: 'Ngày khác' }));
    fireEvent.change(within(tam).getByLabelText('Chọn ngày nhận'), { target: { value: '2026-09-21' } });
    fireEvent.click(within(tam).getByRole('button', { name: 'Lưu thay đổi' }));
    expect(await within(tam).findByText('Bạn đã ghi đặt phòng cho căn này đêm 21/09')).toBeInTheDocument();
    expect(datPhong.sua).toHaveBeenCalledWith('V2', expect.objectContaining({ ngayNhan: '2026-09-21', ngayTra: '2026-09-22' }));
    expect(screen.getByRole('dialog', { name: 'Sửa đặt phòng' })).toBeInTheDocument();
  });

  it('YC10.4-NT9 bấm "Xóa đặt phòng" một lần thì chưa xóa; bấm xác nhận thì V2 không còn', async () => {
    const { datPhong } = ve({ sau: { ...VILLA, datPhong: [V1] } });
    const tam = await moV2();
    fireEvent.click(within(tam).getByRole('button', { name: 'Xóa đặt phòng' }));
    expect(datPhong.xoa).not.toHaveBeenCalled();
    fireEvent.click(within(tam).getByRole('button', { name: 'Xác nhận xóa đặt phòng 08/10 → 09/10?' }));
    await waitFor(() => expect(datPhong.xoa).toHaveBeenCalledWith('V2'));
    expect(await screen.findByText('Đã xóa đặt phòng 08/10 → 09/10')).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByTestId('dat-phong')).toHaveLength(1));
    expect(screen.queryByText(/08\/10 → 09\/10 \(1 đêm\)/)).toBeNull();
  });

  it('YC10.4-NT9 xóa bị từ chối (không còn quyền) thì báo, V2 còn', async () => {
    ve({ xoa: async () => { throw new LoiNguoiDung('Không tìm thấy đặt phòng'); } });
    const tam = await moV2();
    fireEvent.click(within(tam).getByRole('button', { name: 'Xóa đặt phòng' }));
    fireEvent.click(within(tam).getByRole('button', { name: 'Xác nhận xóa đặt phòng 08/10 → 09/10?' }));
    expect(await screen.findByText('Không tìm thấy đặt phòng')).toBeInTheDocument();
    expect(screen.getAllByTestId('dat-phong')).toHaveLength(2);
  });

  it('YC10.4-NT9 sau khi xóa V2, ô 08/10 trên lịch 7 ngày về "?"', () => {
    const dong: DongLichSale[] = Array.from({ length: 7 }, (_, i) => ({
      canId: 'villa', nhom: 'tu_nhap', maCan: 'Villa Tuần Châu', tenToa: null, tenChu: 'Chú Bình', soPhongNgu: 2, loaiView: null,
      lichDoiLuc: null, soBan: 0, dem: `2026-10-${String(7 + i).padStart(2, '0')}`, o: 'chua_biet', giaBan: null,
    }));
    render(<S1LichSale tu="2026-10-07" homNay="2026-10-07" dong={dong} onDoiNgay={vi.fn()} />);
    const hang = screen.getAllByRole('row').find((r) => r.textContent?.includes('Villa Tuần Châu'))!;
    expect(within(hang).getAllByRole('cell').map((c) => c.textContent)).toEqual(['?', '?', '?', '?', '?', '?', '?']);
  });
});
