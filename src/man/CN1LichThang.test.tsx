// Test unit màn CN1 Lịch tháng (YC2.1, YC2.3 khối doanh thu): CN1 (2 căn), CN1-02 (3 căn), CN1-00 (chưa có đặt phòng), HV1, HV2.
// Dịch vụ lịch là bản giả theo DLM.4, không gọi mạng. Hôm nay cố định 07/10/2026 (DLM.1).
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../chung/Toast';
import type { DichVuLich, ThangLich } from '../lib/dichVuLich';
import { khoangThang, type CanLich, type DatPhongLich, type DoanhThuThang } from '../lib/lich';
import { CN1LichThang } from './CN1LichThang';

afterEach(() => {
  cleanup();
  window.dispatchEvent(new Event('online'));
});

const b = (id: string, canId: string, ngayNhan: string, ngayTra: string): DatPhongLich => ({ id, canId, ngayNhan, ngayTra });

const DLM4: DatPhongLich[] = [
  b('B1', 'c1509', '2026-10-10', '2026-10-12'), b('B2', 'c3402', '2026-10-17', '2026-10-19'),
  b('B3', 'c1509', '2026-10-04', '2026-10-06'), b('B4', 'c3402', '2026-10-05', '2026-10-07'),
  b('B5', 'c1509', '2026-10-13', '2026-10-15'), b('B6', 'c3402', '2026-10-14', '2026-10-15'),
  b('B7', 'c1509', '2026-10-19', '2026-10-20'), b('B8', 'c3402', '2026-10-21', '2026-10-22'),
  b('B9', 'c3402', '2026-11-30', '2026-12-02'),
];

const HAI_CAN: CanLich[] = [{ id: 'c1509', maCan: '1509' }, { id: 'c3402', maCan: '3402' }];
const BA_CAN: CanLich[] = [...HAI_CAN, { id: 'c2501', maCan: '2501' }];

/** Dịch vụ giả: trả booking có đêm trong tháng, như database lọc (QT2). */
function dichVu(ds: DatPhongLich[] = DLM4): DichVuLich & { layThang: ReturnType<typeof vi.fn> } {
  return {
    layThang: vi.fn(async (canIds: string[], nam: number, thang: number): Promise<ThangLich> => {
      const { tu, den } = khoangThang(nam, thang);
      const cua = ds.filter((x) => canIds.includes(x.canId));
      return { datPhong: cua.filter((x) => x.ngayNhan < den && x.ngayTra > tu), coDatPhong: cua.length > 0 };
    }),
  };
}

function ve(ds: CanLich[], dv: DichVuLich = dichVu(), them: { boNho?: Map<string, ThangLich>; onDatPhong?: () => void } = {}) {
  return render(
    <ToastProvider>
      <CN1LichThang ds={ds} dv={dv} homNay="2026-10-07" boNho={them.boNho} onDatPhong={them.onDatPhong ?? vi.fn()} />
    </ToastProvider>,
  );
}

const o = (ngay: string) => document.querySelector(`[data-ngay="${ngay}"]`) as HTMLElement;
/** Mã các căn tô màu ở ô ngày. */
const toMau = (ngay: string) => Array.from(o(ngay).querySelectorAll('.cn1-vach--co')).map((e) => (e as HTMLElement).dataset.can);

async function choLuoi() {
  await screen.findByRole('grid', { name: /Tháng/ });
}

describe('YC2.1 · CN1 Lịch tháng', () => {
  it('YC2.1-NT1 chủ nhà có 2 căn mở tab Lịch thì thấy chip "Cả 2 phòng" và một chip cho mỗi căn', async () => {
    ve(HAI_CAN);
    await choLuoi();
    expect(screen.getByRole('heading', { name: 'Lịch' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Đặt phòng' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Tháng 10/2026' })).toBeInTheDocument(); // tháng của hôm nay
    expect(screen.getByRole('button', { name: 'T09' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'T11' })).toBeInTheDocument();
    const chip = within(screen.getByRole('group', { name: 'Lọc theo căn' })).getAllByRole('button');
    expect(chip.map((c) => c.textContent)).toEqual(['Cả 2 phòng', '1509', '3402']);
    expect(chip[0]).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('1509 đã đặt')).toBeInTheDocument();
    expect(screen.getByText('3402 đã đặt')).toBeInTheDocument();
    // Tuần bắt đầu thứ Hai: ô tiêu đề đầu là T2, cuối là CN.
    const thu = screen.getAllByRole('columnheader').map((c) => c.textContent);
    expect(thu).toEqual(['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']);
  });

  it('YC2.1-NT2 chủ nhà có 3 căn mở tab Lịch thì thấy chip "Tất cả" và một chip cho mỗi căn (CN1-02)', async () => {
    ve(BA_CAN, dichVu([...DLM4, b('K1', 'c2501', '2026-10-08', '2026-10-10')]));
    await choLuoi();
    const chip = within(screen.getByRole('group', { name: 'Lọc theo căn' })).getAllByRole('button');
    expect(chip.map((c) => c.textContent)).toEqual(['Tất cả', '1509', '3402', '2501']);
    expect(screen.getByText('2501 đã đặt')).toBeInTheDocument();
    expect(toMau('2026-10-08')).toEqual(['2501']);
  });

  it('YC2.1 bước 3 chủ nhà có 1 căn thì không có hàng chip', async () => {
    ve([HAI_CAN[0]!]);
    await choLuoi();
    expect(screen.queryByRole('group', { name: 'Lọc theo căn' })).toBeNull();
    expect(toMau('2026-10-10')).toEqual(['1509']);
  });

  it('YC2.1-NT3 1509 có B1 (10/10 → 12/10): ô 10/10, 11/10 tô màu 1509, ô 12/10 không (QT2)', async () => {
    ve(HAI_CAN);
    await choLuoi();
    expect(toMau('2026-10-10')).toEqual(['1509']);
    expect(toMau('2026-10-11')).toEqual(['1509']);
    expect(toMau('2026-10-12')).toEqual([]);
    expect(o('2026-10-10')).toHaveAccessibleName('Ngày 10, đã đặt phòng 1509');
    expect(o('2026-10-12')).toHaveAccessibleName('Ngày 12, trống');
    // YC2.1 bước 2: một ngày có khách ở hai căn thì ô có hai màu.
    expect(toMau('2026-10-05')).toEqual(['1509', '3402']);
  });

  it('YC2.1-NT4 chạm chip "3402" thì lưới chỉ tô đêm của 3402, không tô đêm của 1509; không gọi thêm', async () => {
    const dv = dichVu();
    ve(HAI_CAN, dv);
    await choLuoi();
    const goiTruoc = dv.layThang.mock.calls.length;
    fireEvent.click(screen.getByRole('button', { name: '3402' }));
    expect(screen.getByRole('button', { name: '3402' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Cả 2 phòng' })).toHaveAttribute('aria-pressed', 'false');
    const co: string[] = [];
    for (let d = 1; d <= 31; d++) {
      const ngay = `2026-10-${String(d).padStart(2, '0')}`;
      const m = toMau(ngay);
      expect(m).not.toContain('1509');
      if (m.length) co.push(ngay.slice(8));
    }
    expect(co).toEqual(['05', '06', '14', '17', '18', '21']);
    expect(o('2026-10-10')).toHaveAccessibleName('Ngày 10, trống');
    expect(dv.layThang.mock.calls.length).toBe(goiTruoc);
    // Chạm lại chip đầu thì về mọi căn.
    fireEvent.click(screen.getByRole('button', { name: 'Cả 2 phòng' }));
    expect(toMau('2026-10-10')).toEqual(['1509']);
  });

  it('YC2.1-NT5 bấm "T11" thì tiêu đề "Tháng 11/2026", ô 30/11 tô màu 3402 (B9), chip đang chọn giữ nguyên', async () => {
    const dv = dichVu();
    ve(HAI_CAN, dv);
    await choLuoi();
    fireEvent.click(screen.getByRole('button', { name: '3402' }));
    fireEvent.click(screen.getByRole('button', { name: 'T11' }));
    expect(await screen.findByRole('heading', { name: 'Tháng 11/2026' })).toBeInTheDocument();
    expect(toMau('2026-11-30')).toEqual(['3402']);
    expect(screen.getByRole('button', { name: '3402' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'T10' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'T12' })).toBeInTheDocument();
    expect(dv.layThang).toHaveBeenLastCalledWith(['c1509', 'c3402'], 2026, 11); // YC2.1 bước 4: đọc tháng mới
    // Bấm T10 thì về tháng 10.
    fireEvent.click(screen.getByRole('button', { name: 'T10' }));
    expect(await screen.findByRole('heading', { name: 'Tháng 10/2026' })).toBeInTheDocument();
  });

  it('YC2.1-NT6 chủ nhà có căn nhưng chưa có đặt phòng nào thì thấy CN1-00 với nút "Đặt phòng", không có doanh thu và danh sách sắp tới', async () => {
    const dat = vi.fn();
    ve(HAI_CAN, dichVu([]), { onDatPhong: dat });
    expect(await screen.findByText('Chưa có đặt phòng nào')).toBeInTheDocument();
    expect(screen.getByText('Bấm "Đặt phòng" để thêm khách đầu tiên. Ngày có khách sẽ tô màu theo phòng.')).toBeInTheDocument();
    expect(screen.getByText('💡 Mời sale xem lịch để sale tự biết ngày trống, không phải gọi hỏi. Vào tab Sale.')).toBeInTheDocument();
    const nut = screen.getAllByRole('button', { name: 'Đặt phòng' });
    expect(nut).toHaveLength(2); // nút ở đầu màn và nút trong khối CN1-00
    fireEvent.click(nut[1]!);
    expect(dat).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/Doanh thu/)).toBeNull();
    expect(screen.queryByText('Đặt phòng sắp tới')).toBeNull();
    expect(screen.queryByText(/đã đặt$/)).toBeNull(); // CN1-00 thay cho chú thích
    expect(screen.getByRole('grid', { name: /Tháng/ })).toBeInTheDocument(); // lưới vẫn có, chip vẫn có
    expect(screen.getByRole('group', { name: 'Lọc theo căn' })).toBeInTheDocument();
  });

  it('YC2.1 bước 5 bấm "Đặt phòng" ở đầu màn thì mở form ghi đặt phòng', async () => {
    const dat = vi.fn();
    ve(HAI_CAN, dichVu(), { onDatPhong: dat });
    await choLuoi();
    fireEvent.click(screen.getByRole('button', { name: 'Đặt phòng' }));
    expect(dat).toHaveBeenCalledTimes(1);
  });

  it('YC2.1 bước 6 chạm một ngày thì ô đó viền đậm', async () => {
    ve(HAI_CAN);
    await choLuoi();
    fireEvent.click(o('2026-10-10'));
    expect(o('2026-10-10')).toHaveAttribute('aria-pressed', 'true');
    expect(o('2026-10-10')).toHaveClass('cn1-o--chon');
    fireEvent.click(o('2026-10-11'));
    expect(o('2026-10-10')).toHaveAttribute('aria-pressed', 'false');
    expect(o('2026-10-11')).toHaveClass('cn1-o--chon');
  });
});

describe('YC2 Trạng thái màn · HV1, HV2 trên CN1', () => {
  it('HV1 bước 1 lần đầu mở thì khung xám, chưa có lưới', () => {
    ve(HAI_CAN, { layThang: vi.fn(() => new Promise<ThangLich>(() => {})) });
    expect(screen.getByLabelText('Đang tải')).toBeInTheDocument();
    expect(screen.queryByRole('grid')).toBeNull();
  });

  it('HV1-NT2 mở lại tab Lịch đã xem thì lịch cũ hiện ngay, không có màn trống', async () => {
    const boNho = new Map<string, ThangLich>();
    const r = ve(HAI_CAN, dichVu(), { boNho });
    await choLuoi();
    r.unmount();
    ve(HAI_CAN, { layThang: vi.fn(() => new Promise<ThangLich>(() => {})) }, { boNho });
    expect(screen.getByRole('grid', { name: 'Tháng 10/2026' })).toBeInTheDocument();
    expect(toMau('2026-10-10')).toEqual(['1509']);
    expect(screen.getByText('Đang cập nhật…')).toBeInTheDocument();
    expect(screen.queryByLabelText('Đang tải')).toBeNull();
  });

  it('HV2-NT3 mất mạng lúc đang xem lịch thì lịch đã tải vẫn hiện, kèm dải "Mất kết nối"', async () => {
    ve(HAI_CAN);
    await choLuoi();
    act(() => { window.dispatchEvent(new Event('offline')); });
    expect(screen.getByText('Mất kết nối. Lịch có thể chưa mới nhất.')).toBeInTheDocument();
    expect(screen.getByRole('grid', { name: 'Tháng 10/2026' })).toBeInTheDocument();
    expect(toMau('2026-10-10')).toEqual(['1509']);
  });

  it('HV2 đổi tháng khi mất mạng thì báo và giữ tháng đang hiện', async () => {
    const dv = dichVu();
    ve(HAI_CAN, dv);
    await choLuoi();
    dv.layThang.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    fireEvent.click(screen.getByRole('button', { name: 'T11' }));
    expect(await screen.findByText('Chưa tải được. Kiểm tra mạng rồi bấm Thử lại')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Tháng 10/2026' })).toBeInTheDocument();
    expect(toMau('2026-10-10')).toEqual(['1509']);
  });

  it('HV2 bước 2 lần đầu không tải được thì "Thử lại", bấm thì tải lại', async () => {
    const dv = dichVu();
    dv.layThang.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    ve(HAI_CAN, dv);
    fireEvent.click(await screen.findByRole('button', { name: 'Thử lại' }));
    await choLuoi();
    expect(toMau('2026-10-10')).toEqual(['1509']);
  });

  it('HV3 quay lại từ nền thì đọc lại tháng đang xem', async () => {
    const dv = dichVu();
    ve(HAI_CAN, dv);
    await choLuoi();
    const truoc = dv.layThang.mock.calls.length;
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    await act(async () => { document.dispatchEvent(new Event('visibilitychange')); });
    expect(dv.layThang.mock.calls.length).toBe(truoc + 1);
    expect(dv.layThang).toHaveBeenLastCalledWith(['c1509', 'c3402'], 2026, 10);
  });
});

describe('YC2.2 · CN3 chi tiết ngày dưới lưới CN1', () => {
  it('YC2.2 bước 6, 7 chạm ô 10/10 thì chi tiết ngày mở dưới lưới, mỗi căn theo chip một dòng', async () => {
    ve(HAI_CAN);
    await choLuoi();
    expect(screen.queryByRole('heading', { name: /^Ngày / })).toBeNull();
    fireEvent.click(o('2026-10-10'));
    expect(screen.getByRole('heading', { name: 'Ngày 10/10/2026' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').map((e) => e.getAttribute('aria-label'))).toEqual(['Phòng 1509', 'Phòng 3402']);
    fireEvent.click(screen.getByRole('button', { name: '3402' }));
    expect(screen.getAllByRole('listitem').map((e) => e.getAttribute('aria-label'))).toEqual(['Phòng 3402']);
  });

  it('YC2.2 bước 9, 10 chạm dòng có khách và nút "Đặt phòng" của căn trống gọi lên ManChu', async () => {
    const onDatPhong = vi.fn();
    const onMoDatPhong = vi.fn();
    render(
      <ToastProvider>
        <CN1LichThang ds={HAI_CAN} dv={dichVu()} homNay="2026-10-07" onDatPhong={onDatPhong} onMoDatPhong={onMoDatPhong} />
      </ToastProvider>,
    );
    await choLuoi();
    fireEvent.click(o('2026-10-10'));
    fireEvent.click(within(screen.getByRole('listitem', { name: 'Phòng 1509' })).getByRole('button', { name: /Phòng 1509/ }));
    expect(onMoDatPhong).toHaveBeenCalledWith('B1');
    fireEvent.click(within(screen.getByRole('listitem', { name: 'Phòng 3402' })).getByRole('button', { name: 'Đặt phòng' }));
    expect(onDatPhong).toHaveBeenCalledTimes(1);
  });

  it('YC5.1 bước 1a, 1b nút "Đặt phòng" đầu màn mở CN4 không kèm căn; nút ở dòng căn trống của CN3 kèm căn và ngày đang xem', async () => {
    const onDatPhong = vi.fn();
    ve(HAI_CAN, dichVu(), { onDatPhong });
    await choLuoi();
    fireEvent.click(screen.getByRole('button', { name: 'Đặt phòng' }));
    expect(onDatPhong).toHaveBeenLastCalledWith();
    fireEvent.click(o('2026-10-10'));
    fireEvent.click(within(screen.getByRole('listitem', { name: 'Phòng 3402' })).getByRole('button', { name: 'Đặt phòng' }));
    expect(onDatPhong).toHaveBeenLastCalledWith({ canId: 'c3402', ngay: '2026-10-10' });
  });
});

describe('YC5.3 bước 10 · CN4-03 về tab Lịch sau khi lưu đặt phòng', () => {
  it('YC5.3 bước 10 CN4-03 lịch mở ở tháng của ngày nhận (30/11), ngày nhận đang chọn và chi tiết ngày đó mở sẵn', async () => {
    render(
      <ToastProvider>
        <CN1LichThang ds={HAI_CAN} dv={dichVu()} homNay="2026-10-07" ngayMoSan="2026-11-30" onDatPhong={vi.fn()} />
      </ToastProvider>,
    );
    await screen.findByRole('grid', { name: 'Tháng 11/2026' });
    expect(screen.getByRole('heading', { name: 'Tháng 11/2026' })).toBeInTheDocument();
    expect(o('2026-11-30')).toHaveAttribute('aria-pressed', 'true');
    expect(toMau('2026-11-30')).toEqual(['3402']);
    expect(screen.getByRole('region', { name: /Ngày 30\/11\/2026/ })).toBeInTheDocument();
  });
});

describe('YC2.3 · khối doanh thu tháng dưới lưới CN1', () => {
  /** Doanh thu theo tháng như fn_doanh_thu_thang trả (DLM.5; tháng 9 là số riêng của YC2.3). */
  const DT: Record<string, DoanhThuThang> = {
    '2026-9': { doanhThu: 9600000, soDem: 10, thangTruoc: 0 },
    '2026-10': { doanhThu: 11800000, soDem: 13, thangTruoc: 9600000 },
    '2026-11': { doanhThu: 800000, soDem: 1, thangTruoc: 11800000 },
    '2027-1': { doanhThu: 0, soDem: 0, thangTruoc: 800000 },
  };
  function dichVuDt(): DichVuLich & { layThang: ReturnType<typeof vi.fn> } {
    const goc = dichVu();
    return {
      layThang: vi.fn(async (canIds: string[], nam: number, thang: number): Promise<ThangLich> => ({
        ...(await goc.layThang(canIds, nam, thang) as ThangLich),
        doanhThu: DT[`${nam}-${thang}`] ?? { doanhThu: 0, soDem: 0, thangTruoc: 0 },
      })),
    };
  }
  const khoi = () => screen.queryByRole('region', { name: /^Doanh thu tháng/ });

  it('YC2.3-NT1 Chị Hoa xem tháng 10 thì khối ghi "Doanh thu tháng 10", "11.800.000đ", "13 đêm có khách · tháng 9: 9.600.000đ"', async () => {
    ve(HAI_CAN, dichVuDt());
    await choLuoi();
    const k = await screen.findByRole('region', { name: 'Doanh thu tháng 10' });
    expect(within(k).getByText('Doanh thu tháng 10')).toBeInTheDocument();
    expect(within(k).getByText('11.800.000đ')).toBeInTheDocument();
    expect(within(k).getByText('13 đêm có khách · tháng 9: 9.600.000đ')).toBeInTheDocument();
  });

  it('YC2.3-NT1 YC2-H1 đổi chip "3402" thì khối vẫn là tổng mọi căn: 11.800.000đ, 13 đêm', async () => {
    ve(HAI_CAN, dichVuDt());
    await choLuoi();
    fireEvent.click(screen.getByRole('button', { name: '3402' }));
    const k = screen.getByRole('region', { name: 'Doanh thu tháng 10' });
    expect(within(k).getByText('11.800.000đ')).toBeInTheDocument();
    expect(within(k).getByText('13 đêm có khách · tháng 9: 9.600.000đ')).toBeInTheDocument();
  });

  it('YC2.3 bước 12 đổi tháng thì khối đổi theo tháng mới; tháng trước không có doanh thu thì bỏ phần "tháng …"', async () => {
    ve(HAI_CAN, dichVuDt());
    await choLuoi();
    fireEvent.click(screen.getByRole('button', { name: 'T11' }));
    const k = await screen.findByRole('region', { name: 'Doanh thu tháng 11' });
    expect(within(k).getByText('800.000đ')).toBeInTheDocument();
    expect(within(k).getByText('1 đêm có khách · tháng 10: 11.800.000đ')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'T10' }));
    fireEvent.click(await screen.findByRole('button', { name: 'T09' }));
    const k9 = await screen.findByRole('region', { name: 'Doanh thu tháng 9' });
    expect(within(k9).getByText('9.600.000đ')).toBeInTheDocument();
    expect(within(k9).getByText('10 đêm có khách')).toBeInTheDocument();
  });

  it('YC2.3-NT2 tháng đang xem không có đặt phòng nào thì không có khối doanh thu', async () => {
    render(
      <ToastProvider>
        <CN1LichThang ds={HAI_CAN} dv={dichVuDt()} homNay="2027-01-07" onDatPhong={vi.fn()} />
      </ToastProvider>,
    );
    expect(await screen.findByRole('heading', { name: 'Tháng 1/2027' })).toBeInTheDocument();
    await screen.findByRole('grid', { name: /Tháng/ });
    expect(khoi()).toBeNull();
    expect(screen.queryByText(/^Doanh thu tháng/)).toBeNull();
  });
});

describe('YC2.5 · nút Tháng / Tuần trên CN1 (YC2-H4)', () => {
  function veCoTuan(onXemTuan: (t2: string) => void, thangDau?: string) {
    return render(
      <ToastProvider>
        <CN1LichThang ds={HAI_CAN} dv={dichVu()} homNay="2026-10-07" onDatPhong={vi.fn()} onXemTuan={onXemTuan} thangDau={thangDau} />
      </ToastProvider>,
    );
  }

  it('YC2.5-NT6 chủ nhà đang chọn ngày 14/10/2026 ở CN1 rồi bấm "Tuần" thì mở tuần 12 – 18/10/2026', async () => {
    const onXemTuan = vi.fn();
    veCoTuan(onXemTuan);
    await choLuoi();
    expect(screen.getByRole('button', { name: 'Tháng' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Tuần' })).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(o('2026-10-14'));
    fireEvent.click(screen.getByRole('button', { name: 'Tuần' }));
    expect(onXemTuan).toHaveBeenCalledWith('2026-10-12');
  });

  it('YC2.5-NT6 chưa chọn ngày thì bấm "Tuần" mở tuần có hôm nay (05 – 11/10/2026)', async () => {
    const onXemTuan = vi.fn();
    veCoTuan(onXemTuan);
    await choLuoi();
    fireEvent.click(screen.getByRole('button', { name: 'Tuần' }));
    expect(onXemTuan).toHaveBeenCalledWith('2026-10-05');
  });

  it('YC2.5-NT6 từ lịch tuần bấm "Tháng" thì CN1 mở tháng chứa thứ Hai của tuần (thứ Hai 12/10 thì Tháng 10/2026; 28/09 thì Tháng 9/2026)', async () => {
    veCoTuan(vi.fn(), '2026-10-12');
    expect(await screen.findByRole('heading', { name: 'Tháng 10/2026' })).toBeInTheDocument();
    cleanup();
    veCoTuan(vi.fn(), '2026-09-28');
    expect(await screen.findByRole('heading', { name: 'Tháng 9/2026' })).toBeInTheDocument();
  });

  it('YC2.5 không truyền onXemTuan thì CN1 không có cặp nút (màn khác dùng lại CN1)', async () => {
    ve(HAI_CAN);
    await choLuoi();
    expect(screen.queryByRole('button', { name: 'Tuần' })).toBeNull();
  });
});

describe('YC2.4 · Đặt phòng sắp tới dưới lịch CN1', () => {
  const sale = (ten: string) => ({ loai: 'sale' as const, ten, sdt: null });
  const tien = (x: DatPhongLich, tienPhong: number, trangThaiTien: DatPhongLich['trangThaiTien'], nguoiDat: DatPhongLich['nguoiDat'],
                tienCoc: number | null = null): DatPhongLich => ({ ...x, tienPhong, tienCoc, trangThaiTien, nguoiDat });
  const LE = { loai: 'le' as const };
  // DLM.4 đủ tiền và người đặt.
  const DU: DatPhongLich[] = [
    tien(DLM4[0]!, 2200000, 'da_coc', sale('Sale Hùng'), 1000000), tien(DLM4[1]!, 1900000, 'chua_coc', sale('Sale Lan')),
    tien(DLM4[2]!, 1800000, 'da_thanh_toan', sale('Sale Hùng')), tien(DLM4[3]!, 1600000, 'da_thanh_toan', sale('Sale Lan')),
    tien(DLM4[4]!, 1800000, 'chua_coc', LE), tien(DLM4[5]!, 800000, 'da_thanh_toan', LE),
    tien(DLM4[6]!, 900000, 'da_thanh_toan', sale('Sale Minh')), tien(DLM4[7]!, 800000, 'da_thanh_toan', sale('Sale Minh')),
    tien(DLM4[8]!, 1600000, 'da_thanh_toan', sale('Sale Minh')),
  ];
  const khoi = () => screen.findByRole('region', { name: 'Đặt phòng sắp tới' });

  it('YC2.4-NT1 YC2.4-NT2 YC2.4-NT3 tháng 10, hôm nay 07/10: dòng B1, B5, B6, B2, B7, B8 đủ người đặt, căn, ngày, tiền, trạng thái', async () => {
    ve(HAI_CAN, dichVu(DU));
    const k = await khoi();
    const dong = within(k).getAllByRole('button');
    expect(dong.map((d) => d.textContent)).toEqual([
      'Sale HùngPhòng 1509 · 10/10 → 12/10 (2 đêm)2.200.000đCọc 1.000.000đ',
      'Khách lẻPhòng 1509 · 13/10 → 15/10 (2 đêm)1.800.000đChưa cọc',
      'Khách lẻPhòng 3402 · 14/10 → 15/10 (1 đêm)800.000đĐã thanh toán',
      'Sale LanPhòng 3402 · 17/10 → 19/10 (2 đêm)1.900.000đChưa cọc',
      'Sale MinhPhòng 1509 · 19/10 → 20/10 (1 đêm)900.000đĐã thanh toán',
      'Sale MinhPhòng 3402 · 21/10 → 22/10 (1 đêm)800.000đĐã thanh toán',
    ]);
    expect(within(k).getByText('Đặt phòng sắp tới')).toBeInTheDocument();
  });

  it('YC2.4 bước 15 chạm một dòng thì mở chi tiết đặt phòng CN3-02 của dòng đó', async () => {
    const mo = vi.fn();
    render(
      <ToastProvider>
        <CN1LichThang ds={HAI_CAN} dv={dichVu(DU)} homNay="2026-10-07" onDatPhong={vi.fn()} onMoDatPhong={mo} />
      </ToastProvider>,
    );
    const k = await khoi();
    fireEvent.click(within(k).getAllByRole('button')[1]!);
    expect(mo).toHaveBeenCalledWith('B5');
  });

  it('YC2.4 bước 14 dùng danh sách sắp tới dịch vụ trả khi xem tháng sau (B9 nhận 30/11 có ở tháng 11)', async () => {
    const goc = dichVu(DU);
    const dv: DichVuLich = {
      layThang: async (canIds, nam, thang) => ({
        ...(await goc.layThang(canIds, nam, thang) as ThangLich),
        sapToi: DU.filter((x) => x.ngayTra > '2026-10-07' && x.ngayNhan < khoangThang(nam, thang).den),
      }),
    };
    ve(HAI_CAN, dv);
    await khoi();
    fireEvent.click(screen.getByRole('button', { name: 'T11' }));
    await screen.findByRole('heading', { name: 'Tháng 11/2026' });
    const k = await khoi();
    await within(k).findByText('Phòng 3402 · 30/11 → 02/12 (2 đêm)');
    expect(within(k).getAllByRole('button')).toHaveLength(7);
  });

  it('YC2.4 bước 16 CN1-01 có đặt phòng nhưng không có đặt phòng sắp tới thì ghi câu mời', async () => {
    render(
      <ToastProvider>
        <CN1LichThang ds={HAI_CAN} dv={dichVu(DU)} homNay="2026-12-05" onDatPhong={vi.fn()} />
      </ToastProvider>,
    );
    const k = await khoi();
    expect(within(k).getByText('Chưa có đặt phòng sắp tới. Bấm "+ Đặt phòng" để ghi khách đầu tiên.')).toBeInTheDocument();
    expect(within(k).queryAllByRole('button')).toHaveLength(0);
  });

  it('YC2.4 CN1-00 chưa có đặt phòng nào thì không có khối đặt phòng sắp tới', async () => {
    ve(HAI_CAN, dichVu([]));
    await screen.findByText('Chưa có đặt phòng nào');
    expect(screen.queryByRole('region', { name: 'Đặt phòng sắp tới' })).toBeNull();
  });
});
