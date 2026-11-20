// Test unit màn P6 Ngày tính giá cuối tuần (YC4.6). Dịch vụ giá là bản giả, không gọi mạng.
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '../App';
import { dichVuGia } from './gia';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { ToastProvider } from '../chung/Toast';
import type { DichVuGia, MauTuan } from '../lib/dichVuGia';
import { CAU_DA_LUU_DEM_CUOI_TUAN, P6DemCuoiTuan } from './P6DemCuoiTuan';

afterEach(cleanup);

// 1509 của Chị Hoa (DLM): tháng 10/2026 giá 900.000đ / 1.300.000đ. Hôm nay là T4 07/10/2026.
const MAU_1509: MauTuan = { maCan: '1509', giaThang: { '2026-10-01': { thuong: 900_000, cuoiTuan: 1_300_000 } } };

function dichVu(dem: number[] = [5, 6], mau: MauTuan | null = MAU_1509, ghiDe: Partial<DichVuGia> = {}): DichVuGia {
  return {
    layBangGia: vi.fn(), datGiaThang: vi.fn(), layLichGia: vi.fn(),
    layDemCuoiTuan: vi.fn(async () => dem),
    layMauTuan: vi.fn(async () => mau),
    datDemCuoiTuan: vi.fn(async () => {}),
    ...ghiDe,
  };
}

async function ve(dv: DichVuGia, quayLai = vi.fn(), daLuu = vi.fn()) {
  render(
    <ToastProvider>
      <P6DemCuoiTuan dv={dv} homNay="2026-10-07" onQuayLai={quayLai} onDaLuu={daLuu} />
    </ToastProvider>,
  );
  await screen.findByText('Đêm cuối tuần');
  return { quayLai, daLuu };
}

const chip = (ten: string) => screen.getByRole('button', { name: ten });
const o = (thu: number) => document.querySelector(`[data-thu="${thu}"]`) as HTMLElement;

describe('YC4.6 · P6 Ngày tính giá cuối tuần', () => {
  it('YC4.6 bước 1 mở màn thì có câu hướng dẫn, bảy chip T2 đến CN, đêm đang chọn (T6, T7) sáng', async () => {
    await ve(dichVu());
    expect(screen.getByRole('heading', { name: 'Ngày tính giá cuối tuần' })).toBeInTheDocument();
    expect(screen.getByText('Chọn những đêm tính giá cuối tuần. Các đêm còn lại tính giá ngày thường.')).toBeInTheDocument();
    expect(screen.getByText('Tính theo đêm ở. VD: nhận phòng T6, trả phòng CN là 2 đêm cuối tuần.')).toBeInTheDocument();
    for (const t of ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']) expect(chip(t)).toBeInTheDocument();
    expect(chip('T6')).toHaveAttribute('aria-pressed', 'true');
    expect(chip('T7')).toHaveAttribute('aria-pressed', 'true');
    for (const t of ['T2', 'T3', 'T4', 'T5', 'CN']) expect(chip(t)).toHaveAttribute('aria-pressed', 'false');
  });

  it('YC4.6 bước 3 mẫu "Một tuần của phòng 1509" ghi giá từng đêm viết rút gọn; T6, T7 là ô cuối tuần', async () => {
    await ve(dichVu());
    expect(screen.getByRole('heading', { name: 'Một tuần của phòng 1509' })).toBeInTheDocument();
    expect(within(o(1)).getByText('900k')).toBeInTheDocument();
    expect(within(o(5)).getByText('1,3tr')).toBeInTheDocument();
    expect(within(o(7)).getByText('900k')).toBeInTheDocument();
    expect(o(5).className).toContain('p6-o--cuoi');
    expect(o(6).className).toContain('p6-o--cuoi');
    expect(o(7).className).not.toContain('p6-o--cuoi');
    expect(screen.getByText('Ô xanh tính giá cuối tuần. Tên ô giá ở mục Giá của căn đổi theo lựa chọn này.')).toBeInTheDocument();
  });

  it('YC4.6 bước 2, 3 chạm chip thì bật, tắt đêm đó và mẫu tính lại ngay (chưa lưu): chọn T7, CN thì CN là 1,3tr, T6 là 900k', async () => {
    const { daLuu } = await ve(dichVu());
    fireEvent.click(chip('CN'));
    fireEvent.click(chip('T6'));
    expect(chip('CN')).toHaveAttribute('aria-pressed', 'true');
    expect(chip('T6')).toHaveAttribute('aria-pressed', 'false');
    expect(within(o(7)).getByText('1,3tr')).toBeInTheDocument();
    expect(within(o(5)).getByText('900k')).toBeInTheDocument();
    expect(o(7).className).toContain('p6-o--cuoi');
    expect(daLuu).not.toHaveBeenCalled();
  });

  it('YC4.6-NT4 chỉ còn một đêm cuối tuần thì chip đó không tắt được', async () => {
    await ve(dichVu([6]));
    expect(chip('T7')).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(chip('T7'));
    expect(chip('T7')).toHaveAttribute('aria-pressed', 'true');
    expect(chip('T7')).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(chip('CN'));
    fireEvent.click(chip('T7')); // còn hai đêm thì tắt được
    expect(chip('T7')).toHaveAttribute('aria-pressed', 'false');
    expect(chip('CN')).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(chip('CN')); // lại chỉ còn một đêm
    expect(chip('CN')).toHaveAttribute('aria-pressed', 'true');
  });

  it('YC4.6-NT2 chọn T7 và CN rồi bấm "Lưu thay đổi" thì gửi {6, 7}, toast "Đã lưu ngày tính giá cuối tuần", về Cá nhân', async () => {
    const dv = dichVu();
    const { daLuu } = await ve(dv);
    fireEvent.click(chip('CN'));
    fireEvent.click(chip('T6'));
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
    await waitFor(() => expect(daLuu).toHaveBeenCalledTimes(1));
    expect(dv.datDemCuoiTuan).toHaveBeenCalledWith([6, 7]);
    expect(await screen.findByRole('status')).toHaveTextContent(CAU_DA_LUU_DEM_CUOI_TUAN);
    expect(CAU_DA_LUU_DEM_CUOI_TUAN).toBe('Đã lưu ngày tính giá cuối tuần');
  });

  it('YC4.6-NT1 chọn T6 và T7 rồi lưu thì gửi {5, 6}', async () => {
    const dv = dichVu([6, 7]);
    const { daLuu } = await ve(dv);
    fireEvent.click(chip('T6'));
    fireEvent.click(chip('CN'));
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
    await waitFor(() => expect(daLuu).toHaveBeenCalled());
    expect(dv.datDemCuoiTuan).toHaveBeenCalledWith([5, 6]);
  });

  it('YC4.6 bước 4 database từ chối thì hiện nguyên câu của database, không về Cá nhân, giữ lựa chọn đang chọn (HV2, QT5.5)', async () => {
    const dv = dichVu([5, 6], MAU_1509, { datDemCuoiTuan: vi.fn(async () => { throw new LoiNguoiDung('Chọn ít nhất một đêm cuối tuần'); }) });
    const { daLuu } = await ve(dv);
    fireEvent.click(chip('CN'));
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Chọn ít nhất một đêm cuối tuần');
    expect(daLuu).not.toHaveBeenCalled();
    expect(chip('CN')).toHaveAttribute('aria-pressed', 'true');
  });

  it('YC4.6 HV1 bấm "Lưu thay đổi" hai lần liền thì chỉ gửi một lần', async () => {
    let xong: () => void = () => {};
    const dv = dichVu([5, 6], MAU_1509, { datDemCuoiTuan: vi.fn(() => new Promise<void>((r) => { xong = r; })) });
    await ve(dv);
    const nut = screen.getByRole('button', { name: 'Lưu thay đổi' });
    fireEvent.click(nut);
    fireEvent.click(nut);
    expect(dv.datDemCuoiTuan).toHaveBeenCalledTimes(1);
    xong();
  });

  it('YC4.6 bước 3 chủ nhà chưa có căn thì ẩn khối mẫu; chip và nút lưu vẫn dùng được', async () => {
    await ve(dichVu([5, 6], null));
    expect(screen.queryByText(/Một tuần của phòng/)).toBeNull();
    expect(screen.getByRole('button', { name: 'Lưu thay đổi' })).toBeEnabled();
  });

  it('YC4.6 bước 3 căn chưa có giá thì ẩn khối mẫu (không hiện 0)', async () => {
    await ve(dichVu([5, 6], { maCan: '1509', giaThang: {} }));
    expect(screen.queryByText(/Một tuần của phòng/)).toBeNull();
    expect(screen.queryByText('0')).toBeNull();
  });

  it('YC4.6 HV2 không đọc được cài đặt thì hiện câu chung và nút Thử lại; Thử lại xong thì hiện màn', async () => {
    const dv = dichVu();
    (dv.layDemCuoiTuan as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('mạng'));
    render(<ToastProvider><P6DemCuoiTuan dv={dv} homNay="2026-10-07" onQuayLai={vi.fn()} onDaLuu={vi.fn()} /></ToastProvider>);
    expect(await screen.findByText('Chưa tải được. Kiểm tra mạng rồi bấm Thử lại')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByText('Đêm cuối tuần')).toBeInTheDocument();
  });

  it('YC4.6 HV1 lúc đang đọc thì hiện khung xám', () => {
    const dv = dichVu([5, 6], MAU_1509, { layDemCuoiTuan: vi.fn(() => new Promise<number[]>(() => {})) });
    render(<ToastProvider><P6DemCuoiTuan dv={dv} homNay="2026-10-07" onQuayLai={vi.fn()} onDaLuu={vi.fn()} /></ToastProvider>);
    expect(screen.getByLabelText('Đang tải')).toBeInTheDocument();
  });

  it('YC4.6 bấm "Quay lại" thì gọi onQuayLai', async () => {
    const { quayLai } = await ve(dichVu());
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    expect(quayLai).toHaveBeenCalled();
  });
});

describe('YC4.6 bước 1, 4 · nối vào app', () => {
  it('YC4.6 bước 1, 4 Cá nhân có dòng "Ngày tính giá cuối tuần", chạm thì mở P6, lưu xong về Cá nhân với toast', async () => {
    sessionStorage.clear();
    window.history.replaceState(null, '', '/ca-nhan');
    const dv = dichVu();
    const hoSo = dichVuGia({
      layPhien: vi.fn(async () => ({ email: 'chu1@vidu.test' })),
      layHoSo: vi.fn(async () => ({ ten: 'Chị Hoa', soDienThoai: '0900000001', vaiChon: 'chu_nha' as const })),
    });
    render(<App dichVu={hoSo} dichVuCan={{ layCanCuaToi: vi.fn(async () => []), gia: dv, caNhan: { doc: vi.fn(async () => ({ ten: 'Chị Hoa', tenHienThi: null, soDienThoai: '0900000001', email: 'chu1@vidu.test', soChuaDoc: 0, gioNhan: '14:00', gioTra: '12:00', demCuoiTuan: [5, 6], mucCong: 0, thongBaoTat: [] })) } }} />);
    fireEvent.click(await screen.findByRole('button', { name: /Ngày tính giá cuối tuần/ }));
    expect(await screen.findByText('Đêm cuối tuần')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/ca-nhan/dem-cuoi-tuan');
    fireEvent.click(chip('CN'));
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
    expect(await screen.findByRole('heading', { name: 'Cá nhân' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/ca-nhan');
    expect(screen.getByRole('status')).toHaveTextContent('Đã lưu ngày tính giá cuối tuần');
    expect(dv.datDemCuoiTuan).toHaveBeenCalledWith([5, 6, 7]);
  });
});
