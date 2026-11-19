// Test unit màn CN6 tab Giá (YC4.2): CN6, CN6-00, CN6-04, CN6-09. Dịch vụ giá là bản giả, không gọi mạng.
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { ToastProvider } from '../chung/Toast';
import type { BangGiaNam, DichVuGia } from '../lib/dichVuGia';
import { cacDemCuaThang, giaDem, type DemGia, type DipGia, type GiaThang } from '../lib/gia';
import { laDemCuoiTuan } from '../lib/ngay';
import { CAU_SE_CO, CN6GiaCan } from './CN6GiaCan';

afterEach(cleanup);

const DIP: DipGia[] = [{ id: 'd1', tuNgay: '2026-10-24', denNgay: '2026-10-25', ten: 'Lễ hội Carnaval', gia: 1_300_000, laNgayLe: false }];

/** Dịch vụ giả giữ giá theo từng tháng 'YYYY-MM-01', tính lịch giá theo QT5.3 như database. */
function dichVu(giaBanDau: Record<string, GiaThang>, dip: DipGia[] = DIP, ghiDe: Partial<DichVuGia> = {}) {
  const gia = { ...giaBanDau };
  const dv: DichVuGia = {
    layBangGia: vi.fn(async (_canId: string, nam: number): Promise<BangGiaNam> => ({
      nam,
      thang: Array.from({ length: 12 }, (_, i) => gia[`${nam}-${String(i + 1).padStart(2, '0')}-01`] ?? null),
      dip: dip.filter((d) => d.tuNgay.startsWith(String(nam))),
      demCuoiTuan: [5, 6],
    })),
    datGiaThang: vi.fn(async (_canId: string, thang: string[], thuong: number, cuoiTuan: number) => {
      for (const t of thang) gia[t] = { thuong, cuoiTuan };
    }),
    layLichGia: vi.fn(async (_canId: string, thang: string): Promise<DemGia[]> => {
      const nam = Number(thang.slice(0, 4));
      const th = Number(thang.slice(5, 7));
      return cacDemCuaThang(nam, th).map((d) => {
        const dp = dip.find((x) => x.tuNgay <= d && d <= x.denNgay);
        const g = gia[thang.slice(0, 8) + '01'];
        return {
          dem: d, gia: giaDem(d, g, dip, [5, 6]),
          loai: dp ? (dp.laNgayLe ? 'ngay_le' : 'dip') : laDemCuoiTuan(d) ? 'cuoi_tuan' : 'thuong',
          coKhach: d === '2026-10-14',
        };
      });
    }),
    ...ghiDe,
  };
  return dv;
}

// 3402 của Chị Hoa (DLM): giá tháng 6 đến 12/2026 800.000đ / 1.100.000đ, dịp 24/10 – 25/10.
const GIA_3402: Record<string, GiaThang> = Object.fromEntries(
  [6, 7, 8, 9, 10, 11, 12].map((t) => [`2026-${String(t).padStart(2, '0')}-01`, { thuong: 800_000, cuoiTuan: 1_100_000 }]),
);

async function ve(dv: DichVuGia, maCan = '3402') {
  const r = render(
    <ToastProvider>
      <CN6GiaCan canId="c3402" maCan={maCan} dv={dv} onQuayLai={vi.fn()} onThongTin={vi.fn()} homNay="2026-10-07" />
    </ToastProvider>,
  );
  await screen.findByText('Giá theo tháng');
  return r;
}

const oThang = (t: number) => screen.getByRole('button', { name: new RegExp(`^Tháng ${t} `) });
const nutApDung = () => screen.getByRole('button', { name: /^Áp dụng cho/ });

describe('YC4.2 · CN6 tab Giá', () => {
  it('YC4.2 bước 1 tiêu đề "Phòng 3402", tab "Thông tin" / "Giá", "Năm 2026" và 12 ô tháng', async () => {
    await ve(dichVu(GIA_3402));
    expect(screen.getByRole('heading', { name: 'Phòng 3402' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Thông tin' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Giá' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: /Năm 2026/ })).toBeInTheDocument();
    for (let t = 1; t <= 12; t++) expect(oThang(t)).toBeInTheDocument();
    expect(oThang(1)).toHaveTextContent('Chưa đặt');
    expect(oThang(10)).toHaveTextContent('800k–1,3tr');
    expect(screen.getByText('Giá ngày lễ')).toBeInTheDocument();
    expect(screen.getByText('Lễ hội Carnaval')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sao chép giá sang căn khác/ })).toBeInTheDocument();
  });

  it('YC4.2-NT1 chọn Tháng 11, 12, nhập 800.000đ / 1.100.000đ, áp dụng thì toast và hai ô ghi "800k–1,1tr" (CN6-04)', async () => {
    const dv = dichVu({});
    await ve(dv);
    fireEvent.click(oThang(11));
    fireEvent.click(oThang(12));
    expect(screen.getByText('Đang chọn: Tháng 11 – 12 (2 tháng)')).toBeInTheDocument();
    expect(oThang(11)).toHaveAttribute('aria-pressed', 'true');
    fireEvent.change(screen.getByLabelText('Ngày thường (CN–T5)'), { target: { value: '800000' } });
    fireEvent.change(screen.getByLabelText('Cuối tuần (T6, T7)'), { target: { value: '1100000' } });
    expect(screen.getByLabelText('Ngày thường (CN–T5)')).toHaveValue('800.000');
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Áp dụng cho Tháng 11 – 12' })); });
    expect(dv.datGiaThang).toHaveBeenCalledTimes(1);
    expect(dv.datGiaThang).toHaveBeenCalledWith('c3402', ['2026-11-01', '2026-12-01'], 800_000, 1_100_000);
    expect(await screen.findByText('Đã áp dụng giá cho Tháng 11 – 12')).toBeInTheDocument();
    await waitFor(() => expect(oThang(11)).toHaveTextContent('800k–1,1tr'));
    expect(oThang(12)).toHaveTextContent('800k–1,1tr');
    // YC4-H5: ở lại tab Giá, giữ tháng đang chọn và giá vừa nhập như CN6-04.
    expect(screen.getByText('Đang chọn: Tháng 11 – 12 (2 tháng)')).toBeInTheDocument();
    expect(screen.getByLabelText('Cuối tuần (T6, T7)')).toHaveValue('1.100.000');
  });

  it('YC4.2-NT2 chưa chọn tháng nào thì có câu nhắc và nút áp dụng không bấm được', async () => {
    const dv = dichVu(GIA_3402);
    await ve(dv);
    expect(screen.getByText('Chưa chọn tháng nào. Chọn một tháng bên trên sau đó nhập giá.')).toBeInTheDocument();
    expect(nutApDung()).toBeDisabled();
    fireEvent.click(oThang(3));
    expect(nutApDung()).toBeEnabled();
    fireEvent.click(oThang(3)); // bỏ chọn
    expect(nutApDung()).toBeDisabled();
    expect(screen.getByText('Chưa chọn tháng nào. Chọn một tháng bên trên sau đó nhập giá.')).toBeInTheDocument();
  });

  it('YC4.2-NT3 căn chưa có giá nào thì CN6-00: câu gợi ý, 12 ô "Chưa đặt", mục lễ và dịp trống', async () => {
    await ve(dichVu({}, []), '2105');
    expect(screen.getByRole('heading', { name: 'Phòng 2105' })).toBeInTheDocument();
    expect(screen.getByText(/Căn này chưa có giá\. Chọn tháng, nhập giá ngày thường và cuối tuần rồi bấm Áp dụng\. Sale chỉ thấy giá sau khi bạn đặt\./)).toBeInTheDocument();
    for (let t = 1; t <= 12; t++) expect(oThang(t)).toHaveTextContent('Chưa đặt');
    expect(screen.getByText('Chưa có giá ngày lễ. Bấm "Đặt giá ngày lễ, dịp đặc biệt" để thêm, VD: Lễ 30/4 – 1/5.')).toBeInTheDocument();
    expect(screen.getByText('Chưa có dịp đặc biệt.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Áp dụng cho tháng đã chọn' })).toBeDisabled();
    expect(screen.queryByText(/Lịch giá tháng/)).toBeNull();
  });

  it('YC4.2-NT4 lịch giá tháng 10 của 3402: 09/10 (T6) "1,1tr", 08/10 (T5) "800k", 24/10 "1,3tr" (dịp)', async () => {
    await ve(dichVu(GIA_3402));
    const lich = await screen.findByRole('region', { name: 'Lịch giá tháng 10' });
    await waitFor(() => expect(within(lich).getAllByRole('gridcell').length).toBe(31));
    const o = (n: string) => lich.querySelector(`[data-ngay="2026-10-${n}"]`)!;
    expect(o('09')).toHaveTextContent('1,1tr');
    expect(o('08')).toHaveTextContent('800k');
    expect(o('24')).toHaveTextContent('1,3tr');
    expect(o('24').className).toContain('cn6-ngay--dip');
    expect(o('14').className).toContain('cn6-ngay--khach');
    // Tuần bắt đầu thứ Hai: 01/10/2026 là T5, có 3 ô trống đầu.
    expect(lich.querySelectorAll('.cn6-ngay--trong')).toHaveLength(3);
    expect(within(lich).getByText('Dịp đặc biệt')).toBeInTheDocument();
    expect(within(lich).getByText('Ngày lễ')).toBeInTheDocument();
    expect(within(lich).getByText('Có khách')).toBeInTheDocument();
  });

  it('YC4.2 bước 6 chuyển tháng bằng "T09", "T11"', async () => {
    const dv = dichVu(GIA_3402);
    await ve(dv);
    await screen.findByRole('region', { name: 'Lịch giá tháng 10' });
    fireEvent.click(screen.getByRole('button', { name: 'T11' }));
    expect(await screen.findByRole('region', { name: 'Lịch giá tháng 11' })).toBeInTheDocument();
    expect(dv.layLichGia).toHaveBeenLastCalledWith('c3402', '2026-11-01');
    fireEvent.click(screen.getByRole('button', { name: 'T10' }));
    fireEvent.click(screen.getByRole('button', { name: 'T09' }));
    expect(await screen.findByRole('region', { name: 'Lịch giá tháng 9' })).toBeInTheDocument();
  });

  it('YC4.2-NT5 đổi sang "Năm 2027" (CN6-09) thì 12 ô tháng hiện giá của năm 2027', async () => {
    const dv = dichVu({ ...GIA_3402, '2027-01-01': { thuong: 900_000, cuoiTuan: 1_200_000 }, '2027-03-01': { thuong: 1_500_000, cuoiTuan: 1_500_000 } });
    await ve(dv);
    fireEvent.click(screen.getByRole('button', { name: /Năm 2026/ }));
    const tam = screen.getByRole('dialog', { name: 'Đặt giá cho năm' });
    expect(within(tam).getByText('Năm nay')).toBeInTheDocument();
    expect(within(tam).getByText('Năm sau')).toBeInTheDocument();
    expect(within(tam).getByRole('button', { name: /Năm 2026/ })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(within(tam).getByRole('button', { name: /Năm 2027/ }));
    await waitFor(() => expect(oThang(1)).toHaveTextContent('900k–1,2tr'));
    expect(dv.layBangGia).toHaveBeenLastCalledWith('c3402', 2027);
    expect(screen.getByRole('button', { name: /Năm 2027/ })).toBeInTheDocument();
    expect(oThang(3)).toHaveTextContent('1,5tr');
    expect(oThang(10)).toHaveTextContent('Chưa đặt');
    expect(screen.queryByRole('dialog')).toBeNull();
    // Áp dụng ở năm 2027 gửi tháng của năm 2027.
    fireEvent.click(oThang(2));
    fireEvent.change(screen.getByLabelText('Ngày thường (CN–T5)'), { target: { value: '1000000' } });
    fireEvent.change(screen.getByLabelText('Cuối tuần (T6, T7)'), { target: { value: '1000000' } });
    await act(async () => { fireEvent.click(nutApDung()); });
    expect(dv.datGiaThang).toHaveBeenCalledWith('c3402', ['2027-02-01'], 1_000_000, 1_000_000);
  });

  it('YC4.2 Luật kiểm: giá trống, bằng 0, quá 100.000.000đ thì báo câu đúng bảng, không gửi lệnh', async () => {
    const dv = dichVu(GIA_3402);
    await ve(dv);
    fireEvent.click(oThang(11));
    await act(async () => { fireEvent.click(nutApDung()); });
    expect(screen.getByRole('alert')).toHaveTextContent('Cần nhập giá ngày thường và giá cuối tuần');
    fireEvent.change(screen.getByLabelText('Ngày thường (CN–T5)'), { target: { value: '800000' } });
    fireEvent.change(screen.getByLabelText('Cuối tuần (T6, T7)'), { target: { value: '0' } });
    await act(async () => { fireEvent.click(nutApDung()); });
    expect(screen.getByRole('alert')).toHaveTextContent('Giá phải lớn hơn 0');
    fireEvent.change(screen.getByLabelText('Cuối tuần (T6, T7)'), { target: { value: '100000001' } });
    await act(async () => { fireEvent.click(nutApDung()); });
    expect(screen.getByRole('alert')).toHaveTextContent('Giá mỗi đêm tối đa 100.000.000đ');
    expect(dv.datGiaThang).not.toHaveBeenCalled();
  });

  it('YC4 Trạng thái màn HV5, QT5.5: database từ chối thì toast câu của database, giữ giá đang nhập', async () => {
    const dv = dichVu(GIA_3402, DIP, { datGiaThang: vi.fn(async () => { throw new LoiNguoiDung('Không tìm thấy căn'); }) });
    await ve(dv);
    fireEvent.click(oThang(11));
    fireEvent.change(screen.getByLabelText('Ngày thường (CN–T5)'), { target: { value: '800000' } });
    fireEvent.change(screen.getByLabelText('Cuối tuần (T6, T7)'), { target: { value: '1100000' } });
    await act(async () => { fireEvent.click(nutApDung()); });
    expect(await screen.findByText('Không tìm thấy căn')).toBeInTheDocument();
    expect(screen.getByLabelText('Ngày thường (CN–T5)')).toHaveValue('800.000');
  });

  it('YC4 Trạng thái màn HV2: chưa tải được giá thì nút Thử lại', async () => {
    const dv = dichVu(GIA_3402, DIP, { layBangGia: vi.fn(async () => { throw new TypeError('mất mạng'); }) });
    render(<ToastProvider><CN6GiaCan canId="c3402" maCan="3402" dv={dv} onQuayLai={vi.fn()} onThongTin={vi.fn()} homNay="2026-10-07" /></ToastProvider>);
    expect(await screen.findByRole('button', { name: 'Thử lại' })).toBeInTheDocument();
  });

  it('YC4.3, YC4.5 chưa làm: bấm "Đặt giá ngày lễ, dịp đặc biệt" hay "Sao chép giá sang căn khác" thì toast "Sẽ có ở bản sau"', async () => {
    await ve(dichVu(GIA_3402));
    fireEvent.click(screen.getByRole('button', { name: /Đặt giá ngày lễ, dịp đặc biệt/ }));
    expect(await screen.findByText(CAU_SE_CO)).toBeInTheDocument();
  });
});
