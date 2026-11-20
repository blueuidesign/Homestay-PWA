// Test unit S6-05 Đặt phòng nhanh và S6-06 Đã ghi (YC10.4 bước 1 đến 6, US57), HV1-NT1, HV2-NT1, HV2-NT2.
// Số theo DLM: Villa Tuần Châu của Sale Hùng, chủ căn Chú Bình, giá chủ 1.400.000đ, giá bán 1.600.000đ; hôm nay 07/10.
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { ToastProvider } from '../chung/Toast';
import type { ChiTietCanTuNhap } from '../lib/dichVuCanTuNhap';
import type { DichVuDatPhongTuGhi } from '../lib/dichVuDatPhongTuGhi';
import type { DongLichSale } from '../lib/lichSale';
import { S1LichSale } from './S1LichSale';
import { S603CanTuNhap } from './S603CanTuNhap';
import { S605GhiDatPhong } from './S605GhiDatPhong';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const VILLA: ChiTietCanTuNhap = {
  canId: 'villa', maCan: 'Villa Tuần Châu', toaNhaId: null, tenToa: null, soPhongNgu: 2, soGiuong: 3, loaiView: null,
  tenChu: 'Chú Bình', soDienThoai: '0904123330', giaThuong: 1_400_000, giaCuoiTuan: null, anh: [], datPhong: [],
};

function dvGia(p: Partial<DichVuDatPhongTuGhi> = {}) {
  return {
    dienSan: vi.fn(async (_c: string, nhan: string, tra: string) => {
      const n = Math.round((Date.parse(tra) - Date.parse(nhan)) / 86_400_000);
      return { traChu: 1_400_000 * n, thuKhach: 1_600_000 * n };
    }),
    ghi: vi.fn(async () => 'V2'),
    sua: vi.fn(async () => {}),
    xoa: vi.fn(async () => {}),
    ...p,
  };
}

function veS605(dv = dvGia()) {
  const onDaLuu = vi.fn();
  const onDong = vi.fn();
  render(<ToastProvider><S605GhiDatPhong canId="villa" tenCan="Villa Tuần Châu" tenChu="Chú Bình" homNay="2026-10-07" dv={dv}
                                         onDong={onDong} onDaLuu={onDaLuu} /></ToastProvider>);
  return { dv, onDaLuu, onDong };
}
const o = (nhan: string) => screen.getByLabelText(nhan) as HTMLInputElement;
const nutDat = () => within(screen.getByRole('dialog')).getByRole('button', { name: 'Đặt phòng' });

describe('YC10.4 · S6-05 Đặt phòng nhanh', () => {
  it('YC10.4 bước 1, 6: tiêu đề "Đặt phòng", "Villa Tuần Châu · đã chốt với chú Bình", chip ngày, dòng thêm sau', async () => {
    veS605();
    const tam = screen.getByRole('dialog', { name: 'Đặt phòng' });
    expect(within(tam).getByText('Villa Tuần Châu · đã chốt với chú Bình')).toBeInTheDocument();
    expect(within(tam).getByRole('button', { name: 'Hôm nay 07/10' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(tam).getByRole('button', { name: 'Mai 08/10' })).toBeInTheDocument();
    expect(within(tam).getByRole('button', { name: 'Ngày khác' })).toBeInTheDocument();
    expect(within(tam).getByText('Cọc, số khách, ghi chú: thêm sau trong đặt phòng nếu cần.')).toBeInTheDocument();
    await waitFor(() => expect(o('Trả chủ (đ)').value).toBe('1.400.000'));
  });

  it('YC10.4-NT1 chọn ngày nhận 08/10 và 1 đêm thì dòng ghi "08/10 → 09/10 (1 đêm)"; + thì 2 đêm', async () => {
    veS605();
    fireEvent.click(screen.getByRole('button', { name: 'Mai 08/10' }));
    expect(screen.getByTestId('dong-so-dem')).toHaveTextContent('08/10 → 09/10 (1 đêm)');
    expect(screen.getByRole('button', { name: 'Bớt một đêm' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Thêm một đêm' }));
    expect(screen.getByTestId('dong-so-dem')).toHaveTextContent('08/10 → 10/10 (2 đêm)');
    fireEvent.click(screen.getByRole('button', { name: 'Ngày khác' }));
    fireEvent.change(screen.getByLabelText('Chọn ngày nhận'), { target: { value: '2026-11-01' } });
    expect(screen.getByTestId('dong-so-dem')).toHaveTextContent('01/11 → 03/11 (2 đêm)');
    await waitFor(() => expect(o('Trả chủ (đ)').value).toBe('2.800.000'));
  });

  it('YC10.4-NT2 điền sẵn 1.400.000đ, 1.600.000đ và "Bạn lời 200.000đ", ghi chú giá điền sẵn', async () => {
    const { dv } = veS605();
    fireEvent.click(screen.getByRole('button', { name: 'Mai 08/10' }));
    await waitFor(() => expect(o('Trả chủ (đ)').value).toBe('1.400.000'));
    expect(o('Thu khách (đ)').value).toBe('1.600.000');
    expect(screen.getByTestId('dong-loi')).toHaveTextContent('Bạn lời 200.000đ');
    expect(screen.getByText(/Giá điền sẵn từ giá chủ đã lưu và giá bán của bạn\. Sửa nếu chú Bình báo giá khác\./)).toBeInTheDocument();
    expect(dv.dienSan).toHaveBeenLastCalledWith('villa', '2026-10-08', '2026-10-09');
  });

  it('YC10.4 bước 4 chưa lưu giá chủ thì "Trả chủ", "Thu khách" trống, không có dòng lời', async () => {
    const dv = dvGia({ dienSan: vi.fn(async () => ({ traChu: null, thuKhach: null })) });
    veS605(dv);
    await waitFor(() => expect(dv.dienSan).toHaveBeenCalled());
    expect(o('Trả chủ (đ)').value).toBe('');
    expect(o('Thu khách (đ)').value).toBe('');
    expect(screen.queryByTestId('dong-loi')).toBeNull();
  });

  it('YC10.4-NT3 sửa "Thu khách" thành 1.700.000đ thì "Bạn lời 300.000đ" và lưu đúng 1.400.000đ, 1.700.000đ', async () => {
    const { dv, onDaLuu } = veS605();
    fireEvent.click(screen.getByRole('button', { name: 'Mai 08/10' }));
    await waitFor(() => expect(o('Thu khách (đ)').value).toBe('1.600.000'));
    fireEvent.change(o('Thu khách (đ)'), { target: { value: '1.700.000' } });
    expect(screen.getByTestId('dong-loi')).toHaveTextContent('Bạn lời 300.000đ');
    fireEvent.click(nutDat());
    await waitFor(() => expect(dv.ghi).toHaveBeenCalledWith(expect.objectContaining({
      canId: 'villa', ngayNhan: '2026-10-08', ngayTra: '2026-10-09', traChu: 1_400_000, thuKhach: 1_700_000,
    })));
    expect(onDaLuu).toHaveBeenCalledWith({ ngayNhan: '2026-10-08', ngayTra: '2026-10-09', traChu: 1_400_000, thuKhach: 1_700_000 });
  });

  it('YC10.4 Luật kiểm: xóa trả chủ, thu khách rồi bấm "Đặt phòng" thì hai câu lỗi, không gọi database', async () => {
    const { dv } = veS605();
    await waitFor(() => expect(o('Trả chủ (đ)').value).toBe('1.400.000'));
    fireEvent.change(o('Trả chủ (đ)'), { target: { value: '' } });
    fireEvent.change(o('Thu khách (đ)'), { target: { value: '0' } });
    fireEvent.click(nutDat());
    expect(await screen.findByText('Cần nhập tiền trả chủ')).toBeInTheDocument();
    expect(screen.getByText('Cần nhập tiền thu khách')).toBeInTheDocument();
    expect(dv.ghi).not.toHaveBeenCalled();
  });

  it('YC10.4 bước 5a database từ chối vì trùng đêm thì báo câu đó, không đóng form', async () => {
    const dv = dvGia({ ghi: vi.fn(async () => { throw new LoiNguoiDung('Bạn đã ghi đặt phòng cho căn này đêm 08/10'); }) });
    const { onDaLuu } = veS605(dv);
    fireEvent.click(screen.getByRole('button', { name: 'Mai 08/10' }));
    await waitFor(() => expect(o('Trả chủ (đ)').value).toBe('1.400.000'));
    fireEvent.click(nutDat());
    expect(await screen.findByText('Bạn đã ghi đặt phòng cho căn này đêm 08/10')).toBeInTheDocument();
    expect(onDaLuu).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('HV1-NT1 bấm "Đặt phòng" thêm lần nữa trong lúc đang lưu thì chỉ một lần gọi; bấm lại sau lỗi dùng cùng mã lần gửi', async () => {
    let xong: (v: string) => void = () => {};
    const ghi = vi.fn(() => new Promise<string>((r) => { xong = r; }));
    veS605(dvGia({ ghi }));
    await waitFor(() => expect(o('Trả chủ (đ)').value).toBe('1.400.000'));
    fireEvent.click(nutDat());
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Đang lưu…' }));
    expect(ghi).toHaveBeenCalledTimes(1);
    xong('V2');
    await waitFor(() => expect(ghi).toHaveBeenCalledTimes(1));
  });

  it('HV2-NT1 mất mạng thì báo "Chưa lưu được, bấm lại khi có mạng", form giữ nguyên, không gọi database', async () => {
    const { dv, onDaLuu } = veS605();
    await waitFor(() => expect(o('Trả chủ (đ)').value).toBe('1.400.000'));
    fireEvent.change(o('Thu khách (đ)'), { target: { value: '1.700.000' } });
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    fireEvent.click(nutDat());
    expect(await screen.findByText('Chưa lưu được, bấm lại khi có mạng')).toBeInTheDocument();
    expect(dv.ghi).not.toHaveBeenCalled();
    expect(onDaLuu).not.toHaveBeenCalled();
    expect(o('Thu khách (đ)').value).toBe('1.700.000');
  });

  it('HV2-NT1 HV2-NT2 lệnh ghi hỏng vì mạng thì báo chưa lưu; có mạng lại không tự gửi; bấm lại gửi cùng mã lần gửi', async () => {
    const ghi = vi.fn().mockRejectedValueOnce(new TypeError('Failed to fetch')).mockResolvedValue('V2');
    const { onDaLuu } = veS605(dvGia({ ghi }));
    await waitFor(() => expect(o('Trả chủ (đ)').value).toBe('1.400.000'));
    fireEvent.click(nutDat());
    expect(await screen.findByText('Chưa lưu được, bấm lại khi có mạng')).toBeInTheDocument();
    window.dispatchEvent(new Event('online'));
    await new Promise((r) => setTimeout(r, 20));
    expect(ghi).toHaveBeenCalledTimes(1);
    fireEvent.click(nutDat());
    await waitFor(() => expect(ghi).toHaveBeenCalledTimes(2));
    expect(ghi.mock.calls[1]![0].clientId).toBe(ghi.mock.calls[0]![0].clientId);
    await waitFor(() => expect(onDaLuu).toHaveBeenCalled());
  });
});

describe('YC10.4 · S6-06 đã ghi, tính vào thống kê', () => {
  it('YC10.4-NT4 bấm "Đặt phòng" thì về S6-03 có đặt phòng mới và toast ghi tháng 10; đặt phòng không có trạng thái tiền', async () => {
    const V2 = { id: 'V2', ngayNhan: '2026-10-08', ngayTra: '2026-10-09', traChu: 1_400_000, thuKhach: 1_600_000 };
    const doc = vi.fn().mockResolvedValueOnce(VILLA).mockResolvedValue({ ...VILLA, datPhong: [V2] });
    const datPhong = dvGia();
    render(<ToastProvider><S603CanTuNhap canId="villa" tenTam="Villa Tuần Châu" homNay="2026-10-07" dv={{ doc, xoa: vi.fn(), datPhong }}
                                         onQuayLai={vi.fn()} onGuiKhach={vi.fn()} onSua={vi.fn()} onDatPhong={vi.fn()} onDaXoa={vi.fn()} /></ToastProvider>);
    expect(await screen.findByText('Chưa có đặt phòng nào cho căn này')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Đặt phòng' }));
    const tam = await screen.findByRole('dialog', { name: 'Đặt phòng' });
    fireEvent.click(within(tam).getByRole('button', { name: 'Mai 08/10' }));
    await waitFor(() => expect(o('Thu khách (đ)').value).toBe('1.600.000'));
    fireEvent.click(within(tam).getByRole('button', { name: 'Đặt phòng' }));
    expect(await screen.findByText('Đã lưu đặt phòng 08/10 → 09/10. Tính vào thống kê tháng 10.')).toBeInTheDocument();
    const dp = await screen.findByTestId('dat-phong');
    expect(dp).toHaveTextContent('08/10 → 09/10 (1 đêm)');
    expect(dp).toHaveTextContent('Trả chủ 1.400.000đ · Thu khách 1.600.000đ');
    expect(dp).toHaveTextContent('+200.000đ');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByText('Đặt phòng bạn đã ghi · 1')).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/cọc|thanh toán/i);
    expect(datPhong.ghi).toHaveBeenCalledTimes(1);
  });

  it('YC10.4-NT7 Hùng đã ghi V2 thì lịch 7 ngày ghi "Bạn" ở 08/10, các ô khác "?"', () => {
    const dong: DongLichSale[] = Array.from({ length: 7 }, (_, i) => {
      const dem = `2026-10-${String(7 + i).padStart(2, '0')}`;
      return { canId: 'villa', nhom: 'tu_nhap', maCan: 'Villa Tuần Châu', tenToa: null, tenChu: 'Chú Bình', soPhongNgu: 2, loaiView: null,
               lichDoiLuc: null, soBan: 1, dem, o: dem === '2026-10-08' ? 'ban' : 'chua_biet', giaBan: null };
    });
    render(<S1LichSale tu="2026-10-07" homNay="2026-10-07" dong={dong} onDoiNgay={vi.fn()} />);
    const hang = screen.getAllByRole('row').find((r) => r.textContent?.includes('Villa Tuần Châu'))!;
    expect(within(hang).getAllByRole('cell').map((c) => c.textContent)).toEqual(['?', 'Bạn', '?', '?', '?', '?', '?']);
  });
});
