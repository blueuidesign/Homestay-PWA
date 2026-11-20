// Test unit màn CN6-02, CN6-03, CN6-03-01 · Giá ngày lễ, dịp đặc biệt (YC4.3). Dịch vụ giá là bản giả, không gọi mạng.
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { ToastProvider } from '../chung/Toast';
import type { BangGiaNam, DaiMoi, DichVuGia } from '../lib/dichVuGia';
import { cacDemCuaThang, cauTrungDip, dongDaiNgay, giaDem, kiemDip, luoiTuanDai, noiDai, tenTuDat, type DemGia, type DipGia, type GiaThang } from '../lib/gia';
import { laDemCuoiTuan } from '../lib/ngay';
import { CN6GiaCan } from './CN6GiaCan';

afterEach(cleanup);

const GIA: Record<string, GiaThang> = Object.fromEntries(
  [10, 11, 12].map((t) => [`2026-${t}-01`, { thuong: 800_000, cuoiTuan: 1_100_000 }]),
);

/** Dịch vụ giả giữ dải dịp như database: kiểm trùng ngày, đặt tên tự động. */
function dichVu(dipBanDau: DipGia[] = []) {
  const dip = [...dipBanDau];
  const dv: DichVuGia & { luuGiaDip: ReturnType<typeof vi.fn> } = {
    layBangGia: vi.fn(async (_c: string, nam: number): Promise<BangGiaNam> => ({
      nam, thang: Array.from({ length: 12 }, (_, i) => GIA[`${nam}-${String(i + 1).padStart(2, '0')}-01`] ?? null),
      dip: dip.filter((d) => d.tuNgay.startsWith(String(nam))), demCuoiTuan: [5, 6],
    })),
    datGiaThang: vi.fn(async () => {}),
    layLichGia: vi.fn(async (_c: string, thang: string): Promise<DemGia[]> =>
      cacDemCuaThang(Number(thang.slice(0, 4)), Number(thang.slice(5, 7))).map((d) => {
        const dp = dip.find((x) => x.tuNgay <= d && d <= x.denNgay);
        return { dem: d, gia: giaDem(d, GIA[thang], dip, [5, 6]),
                 loai: dp ? (dp.laNgayLe ? 'ngay_le' : 'dip') : laDemCuoiTuan(d) ? 'cuoi_tuan' : 'thuong', coKhach: false };
      })),
    layNgayLe: vi.fn(async (nam: number) => nam === 2027
      ? [{ ten: 'Lễ 30/4 – 1/5', tuNgay: '2027-04-30', denNgay: '2027-05-02' }]
      : [{ ten: 'Lễ 30/4 – 1/5', tuNgay: '2026-04-30', denNgay: '2026-05-03' }]),
    luuGiaDip: vi.fn(async (_c: string, d: DaiMoi) => {
      const trung = cauTrungDip(dip, d.tuNgay, d.denNgay);
      if (trung) throw new LoiNguoiDung(trung);
      dip.push({ id: 'n' + dip.length, tuNgay: d.tuNgay, denNgay: d.denNgay, ten: d.ten || tenTuDat(d.tuNgay, d.denNgay, d.laNgayLe), gia: d.gia, laNgayLe: d.laNgayLe });
    }),
  };
  return dv;
}

async function moCN602(dv: DichVuGia) {
  render(
    <ToastProvider>
      <CN6GiaCan canId="c3402" maCan="3402" dv={dv} onQuayLai={vi.fn()} onThongTin={vi.fn()} homNay="2026-10-07" />
    </ToastProvider>,
  );
  await screen.findByText('Giá theo tháng');
  fireEvent.click(screen.getByRole('button', { name: /Đặt giá ngày lễ, dịp đặc biệt/ }));
  await screen.findByRole('heading', { name: 'Giá ngày lễ, dịp đặc biệt' });
}

const oTu = () => screen.getByLabelText('Từ ngày') as HTMLInputElement;
const oDen = () => screen.getByLabelText('Đến ngày') as HTMLInputElement;
const nhap = (nhan: string, v: string) => fireEvent.change(screen.getByLabelText(nhan), { target: { value: v } });

describe('CN6-02 Giá ngày lễ, dịp đặc biệt (YC4.3)', () => {
  it('YC4.3 bước 1: tiêu đề, "Phòng 3402", bốn dịp chọn nhanh và ghi chú', async () => {
    await moCN602(dichVu());
    expect(screen.getByText('Phòng 3402')).toBeInTheDocument();
    for (const c of ['Lễ 30/4 – 1/5', 'Quốc khánh 2/9', 'Tết Dương lịch', 'Tết Âm lịch']) {
      expect(screen.getByRole('button', { name: c })).toBeInTheDocument();
    }
    expect(screen.getByText(/Home247 đặt sẵn dải ngày nghỉ của từng dịp mỗi năm/)).toBeInTheDocument();
  });

  it('YC4.3-NT1 chạm "Lễ 30/4 – 1/5" thì ô ngày điền dải Home247 đặt cho năm đang chọn và "Là ngày lễ" bật', async () => {
    const dv = dichVu();
    await moCN602(dv);
    await waitFor(() => expect(dv.layNgayLe).toHaveBeenCalledWith(2026));
    fireEvent.click(screen.getByRole('button', { name: 'Lễ 30/4 – 1/5' }));
    expect(oTu().value).toBe('2026-04-30');
    expect(oDen().value).toBe('2026-05-03');
    expect((screen.getByLabelText('Tên dịp') as HTMLInputElement).value).toBe('Lễ 30/4 – 1/5');
    expect(screen.getByRole('checkbox', { name: /Là ngày lễ/ })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText('4 ngày · T5 30/4 → CN 3/5')).toBeInTheDocument();
  });

  it('YC4.3-NT2 dải 13 ngày thì cảnh báo "Tối đa 10 ngày…" và nút Lưu giá không bấm được', async () => {
    const dv = dichVu();
    await moCN602(dv);
    nhap('Từ ngày', '2026-12-24');
    nhap('Đến ngày', '2027-01-05');
    expect(screen.getByRole('alert')).toHaveTextContent('Tối đa 10 ngày. Đang chọn 13 ngày, hãy rút ngắn ngày kết thúc.');
    expect(screen.getByRole('button', { name: 'Lưu giá' })).toBeDisabled();
    expect(dv.luuGiaDip).not.toHaveBeenCalled();
  });

  it('YC4.3-NT3 lưu 24/10 – 25/10 giá 1.300.000đ, tắt "Là ngày lễ": ở mục "Dịp đặc biệt", lịch giá ghi "1,3tr" hai ngày đó', async () => {
    const dv = dichVu();
    await moCN602(dv);
    nhap('Từ ngày', '2026-10-24');
    nhap('Đến ngày', '2026-10-25');
    nhap('Giá mỗi đêm (đ)', '1300000');
    expect(screen.getByText(/Bỏ trống thì app đặt tên theo ngày: "Dịp đặc biệt 24\/10 – 25\/10"/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Lưu giá' }));
    expect(await screen.findByText('Đã lưu giá Dịp đặc biệt 24/10 – 25/10')).toBeInTheDocument();
    expect(dv.luuGiaDip).toHaveBeenCalledWith('c3402', { tuNgay: '2026-10-24', denNgay: '2026-10-25', ten: '', gia: 1_300_000, laNgayLe: false });
    const muc = await screen.findByRole('region', { name: 'Dịp đặc biệt' });
    await waitFor(() => expect(within(muc).getByText('Dịp đặc biệt 24/10 – 25/10')).toBeInTheDocument());
    expect(within(screen.getByRole('region', { name: 'Giá ngày lễ' })).queryByText(/24\/10/)).toBeNull();
    await waitFor(() => expect(screen.getByRole('gridcell', { name: /Ngày 24: 1,3tr/ })).toBeInTheDocument());
    expect(screen.getByRole('gridcell', { name: /Ngày 25: 1,3tr/ })).toBeInTheDocument();
  });

  it('YC4.3-NT4 lưu một dải với "Là ngày lễ" bật thì dải ở mục "Giá ngày lễ"', async () => {
    const dv = dichVu();
    await moCN602(dv);
    nhap('Từ ngày', '2026-12-31');
    nhap('Đến ngày', '2027-01-01');
    nhap('Tên dịp', 'Tết Dương lịch');
    nhap('Giá mỗi đêm (đ)', '2000000');
    fireEvent.click(screen.getByRole('checkbox', { name: /Là ngày lễ/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Lưu giá' }));
    expect(await screen.findByText('Đã lưu giá Tết Dương lịch')).toBeInTheDocument();
    expect(dv.luuGiaDip).toHaveBeenCalledWith('c3402', expect.objectContaining({ laNgayLe: true, ten: 'Tết Dương lịch' }));
    await waitFor(() => expect(within(screen.getByRole('region', { name: 'Giá ngày lễ' })).getByText('Tết Dương lịch')).toBeInTheDocument());
    expect(within(screen.getByRole('region', { name: 'Dịp đặc biệt' })).queryByText('Tết Dương lịch')).toBeNull();
  });

  it('YC4.3-NT6 3402 có dịp 24/10 – 25/10, lưu thêm 25/10 – 26/10 thì báo trùng ngày, ở lại màn, không lưu', async () => {
    const dv = dichVu([{ id: 'd1', tuNgay: '2026-10-24', denNgay: '2026-10-25', ten: 'Lễ hội Carnaval', gia: 1_300_000, laNgayLe: false }]);
    await moCN602(dv);
    nhap('Từ ngày', '2026-10-25');
    nhap('Đến ngày', '2026-10-26');
    nhap('Giá mỗi đêm (đ)', '1500000');
    fireEvent.click(screen.getByRole('button', { name: 'Lưu giá' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Trùng ngày với Lễ hội Carnaval (24/10 – 25/10). Đổi ngày rồi lưu lại.');
    expect(dv.luuGiaDip).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Giá ngày lễ, dịp đặc biệt' })).toBeInTheDocument();
  });

  it('YC4.3-NT6 database báo trùng (dải vừa được lưu ở máy khác) thì dòng đỏ, ở lại màn', async () => {
    const dv = dichVu();
    dv.luuGiaDip.mockRejectedValueOnce(new LoiNguoiDung('Trùng ngày với A (20/12 – 22/12). Đổi ngày rồi lưu lại.'));
    await moCN602(dv);
    nhap('Từ ngày', '2026-12-21');
    nhap('Đến ngày', '2026-12-23');
    nhap('Giá mỗi đêm (đ)', '1000000');
    fireEvent.click(screen.getByRole('button', { name: 'Lưu giá' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Trùng ngày với A (20/12 – 22/12)');
    expect(screen.getByRole('heading', { name: 'Giá ngày lễ, dịp đặc biệt' })).toBeInTheDocument();
  });

  it('YC4.3 bước 1: chạm một ngày trên lịch giá thì mở màn với ngày đó điền sẵn', async () => {
    render(<ToastProvider><CN6GiaCan canId="c3402" maCan="3402" dv={dichVu()} onQuayLai={vi.fn()} onThongTin={vi.fn()} homNay="2026-10-07" /></ToastProvider>);
    fireEvent.click(await screen.findByRole('gridcell', { name: /Ngày 20:/ }));
    expect(oTu().value).toBe('2026-10-20');
    expect(oDen().value).toBe('2026-10-20');
  });

  it('YC4.3 Luật kiểm: giá trống, giá 0, tên quá 60 ký tự', () => {
    expect(kiemDip('2026-10-24', '2026-10-25', '', '')).toBe('Cần nhập giá mỗi đêm');
    expect(kiemDip('2026-10-24', '2026-10-25', '', '0')).toBe('Giá phải lớn hơn 0');
    expect(kiemDip('2026-10-24', '2026-10-25', 'a'.repeat(61), '1.000.000')).toBe('Tên dịp dài tối đa 60 ký tự');
    expect(kiemDip('2026-10-24', '2026-11-02', '', '1.000.000')).toBeNull();
  });

  it('YC4.3 bước 3: lưới tuần tròn T2 tới CN, chạm ô để nới dải', () => {
    const o = luoiTuanDai('2026-04-30', '2026-05-03');
    expect(o.map((x) => `${x.thu} ${x.nhan}`)).toEqual(['T2 27/4', 'T3 28/4', 'T4 29/4', 'T5 30/4', 'T6 1/5', 'T7 2/5', 'CN 3/5']);
    expect(noiDai('2026-04-30', '2026-05-03', '2026-04-28')).toEqual(['2026-04-28', '2026-05-03']);
    expect(dongDaiNgay('2026-12-24', '2027-01-05')).toBe('13 ngày · T5 24/12 → T3 5/1');
    expect(tenTuDat('2026-10-24', '2026-10-25', false)).toBe('Dịp đặc biệt 24/10 – 25/10');
  });
});
