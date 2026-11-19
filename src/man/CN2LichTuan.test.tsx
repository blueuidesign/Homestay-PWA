// Test unit màn CN2 Lịch tuần nhiều căn (YC2.5), CN2-00 tuần chưa có đặt phòng, HV1, HV2, HV3.
// Dịch vụ lịch là bản giả theo DLM.3, DLM.4, không gọi mạng. Hôm nay cố định 07/10/2026 (DLM.1).
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../chung/Toast';
import type { DichVuLich, TuanLich } from '../lib/dichVuLich';
import type { DatPhongLich } from '../lib/lich';
import { congNgay } from '../lib/ngay';
import { cacNgayTuan, type CanTuan, type GiaTuanTungDem } from '../lib/lichTuan';
import { CN2LichTuan } from './CN2LichTuan';

afterEach(() => {
  cleanup();
  window.dispatchEvent(new Event('online'));
});

const b = (id: string, canId: string, ngayNhan: string, ngayTra: string, trangThaiTien: DatPhongLich['trangThaiTien'],
  nguoiDat: DatPhongLich['nguoiDat'] = { loai: 'le' }): DatPhongLich => ({ id, canId, ngayNhan, ngayTra, trangThaiTien, nguoiDat });

const DLM4: DatPhongLich[] = [
  b('B1', 'c1509', '2026-10-10', '2026-10-12', 'da_coc', { loai: 'sale', ten: 'Sale Hùng', sdt: null }),
  b('B2', 'c3402', '2026-10-17', '2026-10-19', 'chua_coc', { loai: 'sale', ten: 'Sale Lan', sdt: null }),
  b('B3', 'c1509', '2026-10-04', '2026-10-06', 'da_thanh_toan', { loai: 'sale', ten: 'Sale Hùng', sdt: null }),
  b('B4', 'c3402', '2026-10-05', '2026-10-07', 'da_thanh_toan', { loai: 'sale', ten: 'Sale Lan', sdt: null }),
  b('B5', 'c1509', '2026-10-13', '2026-10-15', 'chua_coc'),
  b('B6', 'c3402', '2026-10-14', '2026-10-15', 'da_thanh_toan'),
  b('B7', 'c1509', '2026-10-19', '2026-10-20', 'da_thanh_toan', { loai: 'sale', ten: 'Sale Minh', sdt: null }),
  b('B8', 'c3402', '2026-10-21', '2026-10-22', 'da_thanh_toan', { loai: 'sale', ten: 'Sale Minh', sdt: null }),
];

const C1509: CanTuan = { id: 'c1509', maCan: '1509', soPhongNgu: 2, tenToa: 'ICON40' };
const C3402: CanTuan = { id: 'c3402', maCan: '3402', soPhongNgu: null, tenToa: null };
const HAI_CAN = [C1509, C3402];

/** Giá DLM.3 cho tháng 10 – 12/2026; ngoài khoảng đó (hay căn không có trong `coGia`) là chưa đặt giá. */
function giaDlm(t2: string, canIds: string[], coGia = ['c1509', 'c3402']): GiaTuanTungDem {
  const g: GiaTuanTungDem = {};
  for (const id of canIds) {
    g[id] = {};
    for (const d of cacNgayTuan(t2)) {
      const cuoiTuan = [5, 6].includes(new Date(d + 'T00:00:00Z').getUTCDay());
      const coThang = d >= '2026-10-01' && d < '2027-01-01' && coGia.includes(id);
      g[id]![d] = !coThang ? null : id === 'c1509' ? (cuoiTuan ? 1300000 : 900000) : (cuoiTuan ? 1100000 : 800000);
    }
  }
  return g;
}

function dichVu(ds: DatPhongLich[] = DLM4, coGia?: string[]): DichVuLich & { layTuan: ReturnType<typeof vi.fn> } {
  return {
    layThang: vi.fn(),
    layTuan: vi.fn(async (canIds: string[], t2: string, homNay: string): Promise<TuanLich> => {
      const den = congNgay(t2, 7);
      const cua = ds.filter((x) => canIds.includes(x.canId));
      return {
        datPhong: cua.filter((x) => x.ngayNhan < den && x.ngayTra > t2),
        gia: giaDlm(t2, canIds, coGia),
        coKhachHomNay: cua.filter((x) => x.ngayNhan <= homNay && homNay < x.ngayTra).map((x) => x.canId),
      };
    }),
  };
}

function ve(ds: CanTuan[] = HAI_CAN, dv: DichVuLich = dichVu(), them: {
  t2?: string; onDatPhong?: (c?: { canId: string; ngay: string }) => void; onMoDatPhong?: (id: string) => void; onXemThang?: (t2: string) => void;
} = {}) {
  return render(
    <ToastProvider>
      <CN2LichTuan ds={ds} dv={dv} homNay="2026-10-07" ngayDau={them.t2 ?? '2026-10-07'}
                   onDatPhong={them.onDatPhong ?? vi.fn()} onMoDatPhong={them.onMoDatPhong ?? vi.fn()} onXemThang={them.onXemThang ?? vi.fn()} />
    </ToastProvider>,
  );
}

const bang = () => screen.findByRole('table', { name: /Lịch tuần/ });
/** Chữ các ô của một hàng căn, theo thứ tự (ô trống là giá, thanh là "người · nhãn"). */
function oHang(ma: string): string[] {
  const hang = screen.getByRole('row', { name: new RegExp(`^${ma}`) });
  return Array.from(hang.querySelectorAll('[data-o]')).map((e) => (e.textContent ?? '').trim());
}
const ten = (sel: string) => Array.from(document.querySelectorAll(sel)).map((e) => e.textContent?.trim());

describe('YC2.5 · CN2 Lịch tuần', () => {
  it('YC2.5-NT1 chủ nhà mở lịch tuần 05 – 11/10/2026 thì mỗi căn một hàng và bảy cột từ "T2 05" tới "CN 11"', async () => {
    ve();
    await bang();
    expect(screen.getByRole('heading', { name: 'Lịch tuần' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Đặt phòng' })).toBeInTheDocument();
    expect(screen.getByText('05 – 11/10/2026')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Trước' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sau' })).toBeInTheDocument();
    const cot = screen.getAllByRole('columnheader').map((c) => c.textContent?.replace(/\s+/g, ' ').trim());
    expect(cot).toEqual(['Căn', 'T2 05', 'T3 06', 'T4 07', 'T5 08', 'T6 09', 'T7 10', 'CN 11']);
    expect(ten('.cn2-hang-ma')).toEqual(['1509', '3402']);
    expect(ten('.cn2-hang-phu')).toEqual(['2PN · ICON40', '']);
    // Cặp nút Tháng / Tuần (YC2-H4): "Tuần" đang xem.
    expect(screen.getByRole('button', { name: 'Tuần' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Tháng' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('YC2.5-NT2 ô không có khách hiện giá chủ nhà: 1509 ngày 08/10 "900k", 3402 ngày 09/10 "1,1tr"; đêm có khách nối thành thanh', async () => {
    ve();
    await bang();
    expect(document.querySelector('[data-o="c1509|2026-10-08"]')).toHaveTextContent('900k');
    expect(document.querySelector('[data-o="c3402|2026-10-09"]')).toHaveTextContent('1,1tr');
    expect(oHang('1509')).toEqual(['Sale Hùng Đã thanh toán', '900k', '900k', '900k', '1,3tr', 'Sale Hùng Đã cọc']);
    expect(oHang('3402')).toEqual(['Sale Lan Đã thanh toán', '800k', '800k', '1,1tr', '1,1tr', '800k']);
    // Thanh B1 nối hai cột T7, CN.
    const b1 = document.querySelector('[data-o="B1"]') as HTMLElement;
    expect(b1.style.gridColumn).toBe('7 / span 2');
  });

  it('YC2.5 bước 19 chú thích "Đã cọc / đã thanh toán", "Chưa cọc", "800k: trống, giá đêm"', async () => {
    ve();
    await bang();
    expect(screen.getByText('Đã cọc / đã thanh toán')).toBeInTheDocument();
    expect(screen.getByText('Chưa cọc', { selector: '.cn2-chu-thich *' })).toBeInTheDocument();
    expect(screen.getByText('800k: trống, giá đêm')).toBeInTheDocument();
  });

  it('YC2.5 bước 20 tuần 05 – 11/10 của bộ mẫu: "Có khách hôm nay 0/2", "Trống tối T7 1 căn", "Chưa cọc 0 đặt phòng"', async () => {
    ve();
    await bang();
    const o = within(screen.getByRole('group', { name: 'Tóm tắt tuần' }));
    expect(o.getByText('Có khách hôm nay').nextSibling).toHaveTextContent('0/2');
    expect(o.getByText('Trống tối T7').nextSibling).toHaveTextContent('1 căn');
    expect(o.getByText('Chưa cọc').nextSibling).toHaveTextContent('0 đặt phòng');
  });

  it('YC2.5-NT4 chủ nhà xem tuần 12 – 18/10/2026 thì ô tóm tắt ghi "Chưa cọc 2 đặt phòng" (B5, B2)', async () => {
    ve(HAI_CAN, dichVu(), { t2: '2026-10-14' });
    await bang();
    expect(screen.getByText('12 – 18/10/2026')).toBeInTheDocument();
    const o = within(screen.getByRole('group', { name: 'Tóm tắt tuần' }));
    expect(o.getByText('Chưa cọc').nextSibling).toHaveTextContent('2 đặt phòng');
    // Thanh B2 chưa cọc là thanh nhạt có viền (canvas CN2).
    expect(document.querySelector('[data-o="B2"] .cn2-thanh')).toHaveClass('cn2-thanh--chua-coc');
  });

  it('YC2.5-NT3 chủ nhà chạm chip "ICON40" thì bảng chỉ còn 1509; không đọc lại', async () => {
    const dv = dichVu();
    ve(HAI_CAN, dv);
    await bang();
    const chip = within(screen.getByRole('group', { name: 'Lọc căn' })).getAllByRole('button');
    expect(chip.map((c) => c.textContent)).toEqual(['Tất cả', 'ICON40']);
    const goi = dv.layTuan.mock.calls.length;
    fireEvent.click(screen.getByRole('button', { name: 'ICON40' }));
    expect(screen.getByRole('button', { name: 'ICON40' })).toHaveAttribute('aria-pressed', 'true');
    expect(ten('.cn2-hang-ma')).toEqual(['1509']);
    expect(within(screen.getByRole('group', { name: 'Tóm tắt tuần' })).getByText('0/1')).toBeInTheDocument();
    expect(dv.layTuan.mock.calls.length).toBe(goi);
    fireEvent.click(screen.getByRole('button', { name: 'Tất cả' }));
    expect(ten('.cn2-hang-ma')).toEqual(['1509', '3402']);
  });

  it('YC2.5-NT5 mọi căn cùng 2PN thì không có chip số phòng ngủ; thêm một căn 3PN thì có chip "3 phòng ngủ"', async () => {
    const hai = [C1509, { ...C3402, soPhongNgu: 2 }];
    ve(hai);
    await bang();
    let chip = within(screen.getByRole('group', { name: 'Lọc căn' })).getAllByRole('button').map((c) => c.textContent);
    expect(chip.some((c) => c?.includes('phòng ngủ'))).toBe(false);
    cleanup();
    ve([...hai, { id: 'c1602', maCan: 'B1602', soPhongNgu: 3, tenToa: 'Tòa B' }]);
    await bang();
    chip = within(screen.getByRole('group', { name: 'Lọc căn' })).getAllByRole('button').map((c) => c.textContent);
    expect(chip).toContain('3 phòng ngủ');
    fireEvent.click(screen.getByRole('button', { name: '3 phòng ngủ' }));
    expect(ten('.cn2-hang-ma')).toEqual(['B1602']);
  });

  it('YC2.5 bước 22 bấm "Sau" sang tuần 12 – 18/10 và đọc tuần mới; "Trước" về 05 – 11/10', async () => {
    const dv = dichVu();
    ve(HAI_CAN, dv);
    await bang();
    fireEvent.click(screen.getByRole('button', { name: 'Sau' }));
    expect(await screen.findByText('12 – 18/10/2026')).toBeInTheDocument();
    expect(dv.layTuan).toHaveBeenLastCalledWith(['c1509', 'c3402'], '2026-10-12', '2026-10-07');
    fireEvent.click(screen.getByRole('button', { name: 'Trước' }));
    fireEvent.click(screen.getByRole('button', { name: 'Trước' }));
    expect(await screen.findByText('28/09 – 04/10/2026')).toBeInTheDocument();
  });

  it('YC2.5 bước 23 chạm ô trống mở form ghi đặt phòng với căn và ngày đó; chạm thanh mở chi tiết đặt phòng', async () => {
    const onDatPhong = vi.fn();
    const onMoDatPhong = vi.fn();
    ve(HAI_CAN, dichVu(), { onDatPhong, onMoDatPhong });
    await bang();
    fireEvent.click(document.querySelector('[data-o="c1509|2026-10-08"]')!);
    expect(onDatPhong).toHaveBeenCalledWith({ canId: 'c1509', ngay: '2026-10-08' });
    fireEvent.click(document.querySelector('[data-o="B1"]')!);
    expect(onMoDatPhong).toHaveBeenCalledWith('B1');
    fireEvent.click(screen.getByRole('button', { name: 'Đặt phòng' }));
    expect(onDatPhong).toHaveBeenLastCalledWith();
  });

  it('YC2.5-NT7 đêm không có khách và chưa đặt giá thì ô hiện "–", chạm ô mở form ghi đặt phòng với căn và ngày đó', async () => {
    const onDatPhong = vi.fn();
    ve(HAI_CAN, dichVu(DLM4, ['c1509']), { onDatPhong });
    await bang();
    const o = document.querySelector('[data-o="c3402|2026-10-08"]') as HTMLElement;
    expect(o).toHaveTextContent('–');
    expect(o).toHaveClass('cn2-o--chua-gia');
    expect(screen.getByText('–: trống, chưa đặt giá')).toBeInTheDocument();
    fireEvent.click(o);
    expect(onDatPhong).toHaveBeenCalledWith({ canId: 'c3402', ngay: '2026-10-08' });
  });

  it('YC2.5 CN2-00 tuần chưa có đặt phòng nào: dòng báo, bảng vẫn đủ giá', async () => {
    ve(HAI_CAN, dichVu(DLM4), { t2: '2026-11-09' });
    await bang();
    expect(screen.getByText('Tuần này chưa có đặt phòng nào. Mọi căn đều trống.')).toBeInTheDocument();
    expect(oHang('1509')).toEqual(['900k', '900k', '900k', '900k', '1,3tr', '1,3tr', '900k']);
    expect(within(screen.getByRole('group', { name: 'Tóm tắt tuần' })).getByText('Trống tối T7').nextSibling).toHaveTextContent('2 căn');
  });

  it('YC2.5-NT6 bấm "Tháng" thì về lịch tháng chứa thứ Hai của tuần đang xem', async () => {
    const onXemThang = vi.fn();
    ve(HAI_CAN, dichVu(), { t2: '2026-10-14', onXemThang });
    await bang();
    expect(screen.getByText('12 – 18/10/2026')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tháng' }));
    expect(onXemThang).toHaveBeenCalledWith('2026-10-12');
  });
});

describe('YC2 Trạng thái màn · HV1, HV2, HV3 trên CN2', () => {
  it('HV1 bước 1 lần đầu mở thì khung xám, chưa có bảng', () => {
    ve(HAI_CAN, { layThang: vi.fn(), layTuan: vi.fn(() => new Promise<TuanLich>(() => {})) });
    expect(screen.queryByRole('table')).toBeNull();
    expect(screen.getByLabelText('Đang tải')).toBeInTheDocument();
  });

  it('HV2 đổi tuần khi mất mạng thì báo và giữ tuần đang hiện', async () => {
    const dv = dichVu();
    const goc = dv.layTuan.getMockImplementation()!;
    ve(HAI_CAN, dv);
    await bang();
    dv.layTuan.mockImplementation(async () => { throw new TypeError('Failed to fetch'); });
    fireEvent.click(screen.getByRole('button', { name: 'Sau' }));
    expect(await screen.findByText('Chưa tải được. Kiểm tra mạng rồi bấm Thử lại')).toBeInTheDocument();
    expect(screen.getByText('05 – 11/10/2026')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    dv.layTuan.mockImplementation(goc);
  });

  it('HV2 bước 2 lần đầu không tải được thì "Thử lại", bấm thì tải lại', async () => {
    const dv = dichVu();
    const goc = dv.layTuan.getMockImplementation()!;
    dv.layTuan.mockImplementationOnce(async () => { throw new TypeError('Failed to fetch'); });
    ve(HAI_CAN, dv);
    fireEvent.click(await screen.findByRole('button', { name: 'Thử lại' }));
    await bang();
    dv.layTuan.mockImplementation(goc);
  });

  it('HV3 quay lại từ nền thì đọc lại tuần đang xem', async () => {
    const dv = dichVu();
    ve(HAI_CAN, dv);
    await bang();
    const goi = dv.layTuan.mock.calls.length;
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    await act(async () => { document.dispatchEvent(new Event('visibilitychange')); });
    expect(dv.layTuan.mock.calls.length).toBe(goi + 1);
  });
});
