// Test unit màn S5 · Gửi cho khách (YC8.1, HV6, US48).
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CAU_DA_SAO_CHEP } from '../chung/chiaSe';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { ToastProvider } from '../chung/Toast';
import type { ChiTietCanSale } from '../lib/chiTietCanSale';
import type { DichVuChiTietCanSale } from '../lib/dichVuChiTietCanSale';
import type { DichVuGuiKhach } from '../lib/dichVuGuiKhach';
import type { DichVuTimPhong } from '../lib/dichVuTimPhong';
import type { CanTim, KetQuaTim } from '../lib/timPhong';
import { MAU_TIN_MAC_DINH, tinCaNCan, type CanGuiKhach, type TinGuiKhach } from '../lib/guiKhach';
import { ManTimPhong } from './S102TimPhong';
import { S3ChiTietCan } from './S3ChiTietCan';
import { KhungGuiKhach, S5GuiKhach } from './S5GuiKhach';

afterEach(cleanup);

const anh = (n: number, ten: string) => Array.from({ length: Math.min(n, 10) }, (_, i) => `https://kho/${ten}-${i}.jpg`);
const CAN: CanGuiKhach[] = [
  { canId: 'c1509', maCan: '1509', tenToa: 'ICON40', soPhongNgu: 2, soGiuong: 3, soAnh: 6, anh: anh(6, '1509'), tongGiaBan: 2_600_000,
    chu: 'ICON40 1509 · 2PN · 3 giường, view biển Bãi Cháy\n10/10 → 12/10 (2 đêm): 2.600.000đ' },
  { canId: 'c1103', maCan: '1103', tenToa: 'Sapphire', soPhongNgu: 3, soGiuong: 2, soAnh: 12, anh: anh(12, '1103'), tongGiaBan: null,
    chu: 'Sapphire 1103 · 3PN · 2 giường, view thành phố\n10/10 → 12/10 (2 đêm). Giá: hỏi lại' },
  { canId: 'c2208', maCan: '2208', tenToa: 'À La Carte', soPhongNgu: 1, soGiuong: 1, soAnh: 4, anh: anh(4, '2208'), tongGiaBan: 3_600_000,
    chu: 'À La Carte 2208 · 1PN · 1 giường, view biển\n10/10 → 12/10 (2 đêm): 3.600.000đ' },
];
const TIN: TinGuiKhach = { tu: '2026-10-10', den: '2026-10-12', soDem: 2, mauTin: MAU_TIN_MAC_DINH, tenSale: 'Sale Hùng', can: CAN };

function taoDv(soan: DichVuGuiKhach['soan'] = async () => TIN) {
  const d = {
    soan: vi.fn(soan),
    ghiLanGui: vi.fn(async () => undefined),
    taiAnh: vi.fn(async (urls: string[]) => urls.map((u) => new File(['x'], u.split('/').pop() ?? 'a.jpg', { type: 'image/jpeg' }))),
  };
  return d as DichVuGuiKhach & typeof d;
}

function datNav(v: object) {
  Object.defineProperty(globalThis, 'navigator', { value: { ...v, onLine: true }, configurable: true });
}
const gocNav = globalThis.navigator;
beforeEach(() => datNav({}));
afterEach(() => datNav(gocNav));

async function ve(d = taoDv()) {
  const onQuayLai = vi.fn();
  render(
    <ToastProvider>
      <S5GuiKhach dv={d} canIds={['c1509', 'c1103', 'c2208']} tu="2026-10-10" den="2026-10-12" onQuayLai={onQuayLai} />
    </ToastProvider>,
  );
  await screen.findByRole('heading', { name: 'Gửi cho khách' });
  await screen.findAllByRole('region');
  return { d, onQuayLai };
}
const khoi = (ten: string) => screen.getByRole('region', { name: ten });

describe('S5 · Gửi cho khách', () => {
  it('YC8.1 bước 2: tiêu đề, dòng đầu màn; gọi lệnh soạn tin với căn theo thứ tự và khoảng ngày', async () => {
    const { d } = await ve();
    expect(d.soan).toHaveBeenCalledWith(['c1509', 'c1103', 'c2208'], '2026-10-10', '2026-10-12');
    expect(screen.getByText(/^3 căn · 10\/10 → 12\/10\. Nhiều điện thoại không chia sẻ chữ và ảnh chung một lần/)).toBeTruthy();
  });

  it('YC8.1-NT1: 3 căn thì 3 khối, mỗi khối một nút gửi chữ và một nút gửi ảnh', async () => {
    await ve();
    const ds = screen.getAllByRole('region');
    expect(ds).toHaveLength(3);
    for (const k of ds) {
      expect(within(k).getAllByRole('button', { name: 'Chia sẻ chữ' })).toHaveLength(1);
      expect(within(k).getAllByRole('button', { name: /^Gửi \d+ ảnh$/ })).toHaveLength(1);
    }
    expect(within(ds[0]!).getByText('1')).toBeTruthy();
    expect(within(ds[0]!).getByText('ICON40 1509 · 2PN')).toBeTruthy();
    expect(within(ds[0]!).getByText('6 ảnh')).toBeTruthy();
  });

  it('YC8.1-NT4 YC8.1-NT5: chữ khối 1509 có giá bán, "2PN · 3 giường", không số khách, không tiện ích', async () => {
    await ve();
    const chu = within(khoi('ICON40 1509 · 2PN')).getByTestId('chu-can').textContent ?? '';
    expect(chu).toBe(CAN[0]!.chu);
    expect(chu).toContain('2.600.000đ');
    expect(chu).toContain('2PN · 3 giường');
    expect(chu).not.toMatch(/khách|bếp|máy giặt/);
    expect(document.body.textContent).not.toContain('2.200.000đ');
  });

  it('YC8.1-NT14: căn chưa có giá đủ đêm ghi "Giá: hỏi lại", không số tiền', async () => {
    await ve();
    const chu = within(khoi('Sapphire 1103 · 3PN')).getByTestId('chu-can').textContent ?? '';
    expect(chu).toContain('Giá: hỏi lại');
    expect(chu).not.toMatch(/\d{1,3}(\.\d{3})+đ/);
  });

  it('YC8.1-NT2: bấm "Chia sẻ chữ" ở khối 1509 mở bảng chia sẻ với chữ 1509 và ghi lần gửi 1509', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    datNav({ share });
    const { d } = await ve();
    fireEvent.click(within(khoi('ICON40 1509 · 2PN')).getByRole('button', { name: 'Chia sẻ chữ' }));
    await waitFor(() => expect(share).toHaveBeenCalledWith({ text: CAN[0]!.chu }));
    expect(d.ghiLanGui).toHaveBeenCalledWith(['c1509'], '2026-10-10', '2026-10-12');
  });

  it('HV6-NT2: không có bảng chia sẻ thì bấm "Chia sẻ chữ" sao chép chữ và báo toast', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    datNav({ clipboard: { writeText } });
    await ve();
    fireEvent.click(within(khoi('ICON40 1509 · 2PN')).getByRole('button', { name: 'Chia sẻ chữ' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(CAN[0]!.chu));
    expect(await screen.findByText(CAU_DA_SAO_CHEP)).toBeTruthy();
  });

  it('YC8.1-NT13 bước 6: bấm "Sao chép chữ" ở khối 1509 sao chép chữ 1509, toast "Đã sao chép", ghi lần gửi 1509', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const share = vi.fn();
    datNav({ clipboard: { writeText }, share });
    const { d } = await ve();
    fireEvent.click(within(khoi('ICON40 1509 · 2PN')).getByRole('button', { name: 'Sao chép chữ' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(CAN[0]!.chu));
    expect(share).not.toHaveBeenCalled();
    expect(await screen.findByText('Đã sao chép')).toBeTruthy();
    expect(d.ghiLanGui).toHaveBeenCalledWith(['c1509'], '2026-10-10', '2026-10-12');
  });

  it('YC8.1-NT3 YC8.1-NT13: "Sao chép chữ cả 3 căn" sao chép chữ 3 căn theo thứ tự trên màn và ghi lần gửi cả 3 căn', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    datNav({ clipboard: { writeText } });
    const { d } = await ve();
    expect(screen.getByText('Hoặc sao chép chữ rồi dán vào tin nhắn bất kỳ')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Sao chép chữ cả 3 căn' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(tinCaNCan(TIN)));
    const tin = writeText.mock.calls[0]![0] as string;
    expect(tin.indexOf('ICON40 1509')).toBeLessThan(tin.indexOf('Sapphire 1103'));
    expect(tin.indexOf('Sapphire 1103')).toBeLessThan(tin.indexOf('À La Carte 2208'));
    expect(d.ghiLanGui).toHaveBeenCalledWith(['c1509', 'c1103', 'c2208'], '2026-10-10', '2026-10-12');
  });

  it('YC8.1-NT15: căn 12 ảnh ghi "12 ảnh, gửi 10 ảnh đầu", nút "Gửi 10 ảnh", bảng chia sẻ nhận đúng 10 ảnh đầu', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    datNav({ share, canShare: () => true });
    const { d } = await ve();
    const k = khoi('Sapphire 1103 · 3PN');
    expect(within(k).getByText('12 ảnh, gửi 10 ảnh đầu')).toBeTruthy();
    fireEvent.click(within(k).getByRole('button', { name: 'Gửi 10 ảnh' }));
    await waitFor(() => expect(share).toHaveBeenCalled());
    expect(d.taiAnh).toHaveBeenCalledWith(anh(12, '1103'));
    const files = (share.mock.calls[0]![0] as { files: File[] }).files;
    expect(files.map((f) => f.name)).toEqual(Array.from({ length: 10 }, (_, i) => `1103-${i}.jpg`));
    expect(d.ghiLanGui).toHaveBeenCalledWith(['c1103'], '2026-10-10', '2026-10-12');
  });

  it('YC8.1 bước 5: trình duyệt không cho gửi file thì tải ảnh về máy và báo toast', async () => {
    datNav({ share: vi.fn(), canShare: () => false });
    const goc = { tao: URL.createObjectURL, bo: URL.revokeObjectURL };
    URL.createObjectURL = vi.fn(() => 'blob:x');
    URL.revokeObjectURL = vi.fn();
    const bam = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    try {
      const { d } = await ve();
      fireEvent.click(within(khoi('ICON40 1509 · 2PN')).getByRole('button', { name: 'Gửi 6 ảnh' }));
      expect(await screen.findByText('Đã lưu 6 ảnh vào máy. Mở Zalo để gửi ảnh.')).toBeTruthy();
      expect(bam).toHaveBeenCalledTimes(6);
      expect(d.ghiLanGui).toHaveBeenCalledWith(['c1509'], '2026-10-10', '2026-10-12');
    } finally {
      bam.mockRestore();
      URL.createObjectURL = goc.tao;
      URL.revokeObjectURL = goc.bo;
    }
  });

  it('YC8.1-NT12 YC8-H1: database từ chối 11 căn thì S5 ghi "Mỗi lần gửi tối đa 10 căn. Quay lại bỏ bớt căn."', async () => {
    const d = taoDv(async () => { throw new LoiNguoiDung('Mỗi lần gửi tối đa 10 căn. Quay lại bỏ bớt căn.'); });
    const onQuayLai = vi.fn();
    render(
      <ToastProvider>
        <S5GuiKhach dv={d} canIds={Array.from({ length: 11 }, (_, i) => `c${i}`)} tu="2026-10-10" den="2026-10-12" onQuayLai={onQuayLai} />
      </ToastProvider>,
    );
    expect(await screen.findByText('Mỗi lần gửi tối đa 10 căn. Quay lại bỏ bớt căn.')).toBeTruthy();
    expect(screen.queryAllByRole('region')).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    expect(onQuayLai).toHaveBeenCalled();
  });

  it('HV2: lỗi mạng khi soạn tin thì có Thử lại', async () => {
    let lan = 0;
    const d = taoDv(async () => { lan += 1; if (lan === 1) throw new Error('mạng'); return TIN; });
    render(
      <ToastProvider>
        <S5GuiKhach dv={d} canIds={['c1509']} tu="2026-10-10" den="2026-10-12" onQuayLai={vi.fn()} />
      </ToastProvider>,
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Thử lại' }));
    expect(await screen.findAllByRole('region')).toHaveLength(3);
  });
});

describe('YC8.1 bước 1 · nút "Gửi cho khách" ở S2, S3 mở S5', () => {
  const canTim = (x: Partial<CanTim> & Pick<CanTim, 'canId' | 'nhom' | 'maCan'>): CanTim => ({
    tenToa: null, tenChu: null, soPhongNgu: null, loaiView: null, lichDoiLuc: null, tongGiaChu: null, tongGiaBan: null,
    khongCoLich: x.nhom === 'tu_nhap', ...x,
  });
  const KQ: KetQuaTim = {
    soCanTrong: 2, goiY: [],
    can: [
      canTim({ canId: 'gb', nhom: 'cua_toi', maCan: '0812', tenToa: 'Green Bay', soPhongNgu: 2, tongGiaChu: 1500000, tongGiaBan: 1500000 }),
      canTim({ canId: 'c1509', nhom: 'nguon', maCan: '1509', tenToa: 'ICON40', tenChu: 'Chị Hoa', soPhongNgu: 2, tongGiaChu: 2200000, tongGiaBan: 3000000 }),
    ],
  };
  const dvTim = (): DichVuTimPhong => ({
    tim: vi.fn(async () => KQ), docGanDay: vi.fn(async () => []), docToa: vi.fn(async () => []), docLich: vi.fn(async () => []),
  });

  it('YC8.1-NT3 S2: S5 nhận căn đã chọn theo thứ tự trên màn và ngày đang tìm; quay lại thì S2 giữ căn đã chọn', async () => {
    const d = taoDv();
    render(<ToastProvider><KhungGuiKhach dv={d}><ManTimPhong dv={dvTim()} homNay="2026-10-06" onQuayLai={() => undefined} /></KhungGuiKhach></ToastProvider>);
    fireEvent.change(screen.getByLabelText('Ngày nhận'), { target: { value: '2026-10-10' } });
    fireEvent.click(screen.getByRole('button', { name: '2 đêm' }));
    fireEvent.click(screen.getByRole('button', { name: /Tìm phòng trống/ }));
    await screen.findByText('2 căn trống');
    fireEvent.click(screen.getByRole('checkbox', { name: 'Chọn ICON40 1509 · 2PN' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Chọn Green Bay 0812' }));
    fireEvent.click(screen.getByRole('button', { name: 'Gửi cho khách' }));
    await screen.findByRole('heading', { name: 'Gửi cho khách' });
    expect(d.soan).toHaveBeenCalledWith(['gb', 'c1509'], '2026-10-10', '2026-10-12');
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    expect(screen.getByText('Đã chọn 2 căn')).toBeTruthy();
  });

  it('YC8.1 bước 1 S3: "Gửi cho khách" mở S5 cho căn đang xem và khoảng ngày của S3', async () => {
    const d = taoDv();
    const ct: ChiTietCanSale = {
      canId: 'c1509', maCan: '1509', tenToa: 'ICON40', khuVuc: null, soPhongNgu: 2, soGiuong: 3, loaiView: null, lichDoiLuc: null,
      anh: [], chu: { ten: 'Chị Hoa', soDienThoai: null, soCan: 2 }, gioNhan: '14:00', gioTra: '12:00', tu: '2026-10-10', den: '2026-10-12',
      dem: [], tongGiaChu: null, tongGiaBan: null, mucCong: 0, mucCongRieng: null, mucCongMacDinh: 0, lamTron50k: false, lich: [],
    };
    const dvCt = { doc: vi.fn(async () => ({ khongConQuyen: false as const, ...ct })), datMuc: vi.fn(async () => undefined) } as DichVuChiTietCanSale;
    render(
      <ToastProvider>
        <KhungGuiKhach dv={d}>
          <S3ChiTietCan dv={dvCt} canId="c1509" tenTam="ICON40 1509" tu="2026-10-10" den="2026-10-12" khachHoi homNay="2026-10-07" onQuayLai={vi.fn()} />
        </KhungGuiKhach>
      </ToastProvider>,
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Gửi cho khách' }));
    await screen.findByRole('heading', { name: 'Gửi cho khách' });
    expect(d.soan).toHaveBeenCalledWith(['c1509'], '2026-10-10', '2026-10-12');
  });
});
