// Test unit S6, S6-00, S6-08 tab Căn của sale (YC10.1, US54), và nối ở ManSale: chạm căn chủ nhà mở S3, căn của tôi mở S6-07.
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../chung/Toast';
import type { DichVuLichSale } from '../lib/dichVuLichSale';
import type { DichVuTabCanSale } from '../lib/dichVuTabCanSale';
import type { DichVuXinLich } from '../lib/dichVuXinLich';
import { homNay } from '../lib/ngay';
import { chiaTabCan, type DongTabCan, type TabCan } from '../lib/tabCanSale';
import { ManSale } from './ManSale';
import { S6TabCan } from './S6TabCan';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

const RONG: DongTabCan = {
  nhom: 'cua_toi', canId: null, maCan: null, tenToa: null, soPhongNgu: null, soGiuong: null, loaiView: null, khachDen: null,
  ketNoiId: null, chuId: null, tenChu: null, chuDaXoa: false, capNhatLuc: null, chuCanTen: null,
};
const can = (p: Partial<DongTabCan>): DongTabCan => ({ ...RONG, ...p });
const HAI_GIO_TRUOC = new Date(Date.now() - 2 * 3_600_000 - 60_000).toISOString();
const DONG: DongTabCan[] = [
  can({ canId: 'g0812', maCan: '0812', tenToa: 'Green Bay', soPhongNgu: 2, loaiView: 'bien' }),
  can({ canId: 'm1605', maCan: '1605', tenToa: 'Mường Thanh', soPhongNgu: 1, loaiView: 'bien', khachDen: '2026-10-12' }),
  can({ nhom: 'nguon', canId: 'c1509', maCan: '1509', tenToa: 'ICON40', soPhongNgu: 2, soGiuong: 3, loaiView: 'bien',
        ketNoiId: 'kHoa', chuId: 'hoa', tenChu: 'Chị Hoa', capNhatLuc: HAI_GIO_TRUOC }),
  can({ nhom: 'nguon', canId: 'c3402', maCan: '3402', soPhongNgu: 1, loaiView: 'bien', ketNoiId: 'kHoa', chuId: 'hoa', tenChu: 'Chị Hoa', capNhatLuc: HAI_GIO_TRUOC }),
  can({ nhom: 'nguon', canId: 'c1103', maCan: '1103', tenToa: 'Sapphire', soPhongNgu: 3, soGiuong: 2, loaiView: 'thanh_pho',
        ketNoiId: 'kTuan', chuId: 'tuan', tenChu: 'Anh Tuấn', capNhatLuc: '2026-01-01T00:00:00Z' }),
  can({ nhom: 'tu_nhap', canId: 'villa', maCan: 'Villa Tuần Châu', chuCanTen: 'Chú Bình' }),
];
const DONG_XOA: DongTabCan[] = [
  ...DONG.filter((d) => d.chuId !== 'hoa'),
  can({ nhom: 'nguon', ketNoiId: 'kHoa', chuId: 'hoa', tenChu: 'Chị Hoa', chuDaXoa: true }),
];

function dvTab(dong: DongTabCan[] = DONG): DichVuTabCanSale & { [k in keyof DichVuTabCanSale]: ReturnType<typeof vi.fn> } {
  const tab: TabCan = chiaTabCan(dong);
  for (const n of tab.chuNha) n.soDienThoai = n.daXoa ? null : '0900000001';
  return {
    doc: vi.fn(async () => structuredClone(tab)),
    docCanCuaToi: vi.fn(async () => ({
      canId: 'g0812', maCan: '0812', tenToa: 'Green Bay', soPhongNgu: 2, soGiuong: null, loaiView: 'bien', anh: [],
      dem: [750_000, null, null, 900_000, 750_000, 750_000, 750_000].map((g, i) => ({
        ngay: new Date(Date.parse(homNay() + 'T00:00:00Z') + i * 86_400_000).toISOString().slice(0, 10),
        o: g == null ? ('kin' as const) : ('trong' as const), gia: g ?? 750_000,
      })),
    })),
    boDongChu: vi.fn(async () => undefined),
  };
}

function ve(dv: DichVuTabCanSale) {
  const cb = { onCham: vi.fn(), onMoChuNha: vi.fn(), onThemCan: vi.fn(), onXinLich: vi.fn(), onThemTuNhap: vi.fn() };
  render(<ToastProvider><S6TabCan dv={dv} {...cb} /></ToastProvider>);
  return cb;
}

describe('YC10.1 · S6 tab Căn', () => {
  it('YC10.1-NT1 Sale Hùng mở tab Căn thấy ba nhóm với số đếm 2, 2 và 1', async () => {
    ve(dvTab());
    expect(await screen.findByRole('heading', { name: 'Căn của tôi · 2' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Chủ nhà đã kết nối · 2' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Căn tự nhập · 1' })).toBeInTheDocument();
    const cuaToi = screen.getByRole('region', { name: 'Căn của tôi · 2' });
    expect(within(cuaToi).getByText('Trống hôm nay ✓')).toBeInTheDocument();
    expect(within(cuaToi).getByText('Có khách 12/10')).toBeInTheDocument();
    expect(within(cuaToi).getByRole('button', { name: '+ Thêm căn' })).toBeInTheDocument();
    const hoa = screen.getByRole('region', { name: 'Chị Hoa' });
    expect(within(hoa).getByText('H')).toBeInTheDocument();
    expect(within(hoa).getByText('✓ Cập nhật 2 giờ trước')).toBeInTheDocument();
  });

  it('YC10.1-NT2 dòng căn chủ nhà ghi "2PN · 3 giường", không có số khách', async () => {
    ve(dvTab());
    const the = await screen.findByRole('button', { name: 'ICON40 1509' });
    expect(within(the).getByText('2PN · 3 giường · view biển')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Chủ nhà đã kết nối · 2' }).textContent).not.toMatch(/khách/);
  });

  it('YC10.1-NT3 căn tự nhập ghi "chưa dùng app", không có "Trống hôm nay"', async () => {
    ve(dvTab());
    const the = await screen.findByRole('button', { name: 'Villa Tuần Châu' });
    expect(within(the).getByText('Chú Bình · chưa dùng app · gọi hỏi lịch')).toBeInTheDocument();
    expect(within(the).queryByText(/Trống hôm nay/)).toBeNull();
    expect(screen.getByText('💡 Mời chú Bình dùng app để lịch tự cập nhật, không cần gọi hỏi.')).toBeInTheDocument();
  });

  it('YC10.1-NT4 bước 5, 6, 7, 8 chạm căn chủ nhà, căn của tôi, căn tự nhập, tên chủ nhà', async () => {
    const cb = ve(dvTab());
    fireEvent.click(await screen.findByRole('button', { name: 'ICON40 1509' }));
    expect(cb.onCham).toHaveBeenLastCalledWith({ canId: 'c1509', nhom: 'nguon', ten: 'ICON40 1509' });
    fireEvent.click(screen.getByRole('button', { name: 'Green Bay 0812' }));
    expect(cb.onCham).toHaveBeenLastCalledWith({ canId: 'g0812', nhom: 'cua_toi', ten: 'Green Bay 0812' });
    fireEvent.click(screen.getByRole('button', { name: 'Villa Tuần Châu' }));
    expect(cb.onCham).toHaveBeenLastCalledWith({ canId: 'villa', nhom: 'tu_nhap', ten: 'Villa Tuần Châu' });
    fireEvent.click(screen.getByRole('button', { name: /^Chị Hoa/ }));
    expect(cb.onMoChuNha).toHaveBeenCalledWith(expect.objectContaining({ chuId: 'hoa' }));
  });

  it('YC10.1-NT7 Chị Hoa đã xóa tài khoản: nhóm đếm 1, dòng Chị Hoa không có căn, giá, số, "Cập nhật"; chạm không mở gì', async () => {
    const cb = ve(dvTab(DONG_XOA));
    expect(await screen.findByRole('heading', { name: 'Chủ nhà đã kết nối · 1' })).toBeInTheDocument();
    const hoa = screen.getByRole('region', { name: 'Chị Hoa' });
    expect(within(hoa).getByText('đã xóa tài khoản')).toBeInTheDocument();
    expect(within(hoa).getByText('Căn và lịch không còn trên app')).toBeInTheDocument();
    expect(within(hoa).queryByText(/Cập nhật/)).toBeNull();
    expect(within(hoa).queryByRole('link', { name: 'Gọi chủ nhà' })).toBeNull();
    expect(within(hoa).queryByText(/1509|3402|đ$|PN/)).toBeNull();
    expect(within(hoa).getAllByRole('button').map((b) => b.textContent)).toEqual(['Bỏ khỏi danh sách']);
    fireEvent.click(within(hoa).getByText('Chị Hoa'));
    expect(cb.onMoChuNha).not.toHaveBeenCalled();
    expect(cb.onCham).not.toHaveBeenCalled();
  });

  it('YC10.1-NT8 bấm "Bỏ khỏi danh sách": dòng biến ngay, không hỏi lại', async () => {
    const dv = dvTab(DONG_XOA);
    let xong: () => void = () => {};
    dv.boDongChu.mockImplementation(() => new Promise<void>((r) => { xong = r; }));
    ve(dv);
    fireEvent.click(await screen.findByRole('button', { name: 'Bỏ khỏi danh sách' }));
    // Biến ngay khi chưa có trả lời của database, không có hộp hỏi lại.
    expect(screen.queryByRole('region', { name: 'Chị Hoa' })).toBeNull();
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(dv.boDongChu).toHaveBeenCalledWith('kHoa');
    xong();
    expect(screen.getByRole('heading', { name: 'Chủ nhà đã kết nối · 1' })).toBeInTheDocument();
  });

  it('YC10.1-NT8 database không bỏ được thì báo và đọc lại', async () => {
    const dv = dvTab(DONG_XOA);
    dv.boDongChu.mockRejectedValue(new Error('mạng'));
    ve(dv);
    fireEvent.click(await screen.findByRole('button', { name: 'Bỏ khỏi danh sách' }));
    await waitFor(() => expect(dv.doc).toHaveBeenCalledTimes(2));
    expect(await screen.findByRole('region', { name: 'Chị Hoa' })).toBeInTheDocument();
  });

  it('YC10.1-NT9 bấm "Chia sẻ lời mời" mở bảng chia sẻ với tin có link; app không tự gửi', async () => {
    const share = vi.fn(async () => undefined);
    vi.stubGlobal('navigator', { ...navigator, share });
    const dv = dvTab();
    ve(dv);
    fireEvent.click(await screen.findByRole('button', { name: 'Chia sẻ lời mời' }));
    await waitFor(() => expect(share).toHaveBeenCalledTimes(1));
    expect((share.mock.calls[0] as unknown as [{ text: string }])[0].text).toMatch(new RegExp(`${window.location.origin}/$`));
    // Không có lệnh gửi nào tới database.
    expect(dv.boDongChu).not.toHaveBeenCalled();
  });

  it('YC10.1-NT10 sale chưa có căn nào thì S6-00 với ba nút', async () => {
    const cb = ve(dvTab([]));
    expect(await screen.findByRole('heading', { name: 'Chưa có căn nào' })).toBeInTheDocument();
    expect(screen.getByText('Thêm căn của bạn, xin lịch chủ nhà, hoặc tự nhập căn của chủ chưa dùng app.')).toBeInTheDocument();
    const trong = screen.getByRole('region', { name: 'Chưa có căn nào' });
    expect(within(trong).getAllByRole('button').map((b) => b.textContent))
      .toEqual(['+ Thêm căn của tôi', 'Gửi tin nhắn xin lịch cho chủ nhà', 'Thêm căn tự nhập']);
    fireEvent.click(screen.getByRole('button', { name: 'Gửi tin nhắn xin lịch cho chủ nhà' }));
    expect(cb.onXinLich).toHaveBeenCalled();
    expect(screen.queryByRole('heading', { name: /Căn của tôi/ })).toBeNull();
  });

  it('YC10.1 HV1 HV2 đang đọc thì khung xám; không đọc được thì "Thử lại"', async () => {
    const dv = dvTab();
    dv.doc.mockRejectedValueOnce(new Error('mạng'));
    ve(dv);
    expect(screen.getByLabelText('Đang tải')).toBeInTheDocument();
    fireEvent.click(await screen.findByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByRole('heading', { name: 'Căn của tôi · 2' })).toBeInTheDocument();
  });
});

// ===== Nối ở ManSale =====
const dvXin: DichVuXinLich = { doc: vi.fn(async () => ({ ma: null, soLanGui: 0, guiCuoiLuc: null, soChuDongY: 0, coNguon: true })), layLink: vi.fn(async () => 'kQmZpRtwXyAbCdEf'), ghiLanGui: vi.fn() };
const dvLich: DichVuLichSale = { doc: vi.fn(async () => []) };

function veSale(tabCan: DichVuTabCanSale, them: Record<string, unknown> = {}) {
  const chiTietCan = { doc: vi.fn(async () => ({ khongConQuyen: true as const, lyDo: null })), datMuc: vi.fn(async () => undefined) };
  render(<ToastProvider><ManSale ten="Sale Hùng" dv={dvXin} dvLich={{ ...dvLich, chiTietCan, tabCan, ...them }} onDangXuat={vi.fn()} /></ToastProvider>);
  fireEvent.click(within(screen.getByRole('navigation', { name: 'Tab' })).getByRole('button', { name: 'Căn' }));
  return { chiTietCan };
}

describe('YC10.1 · tab Căn trong khung của sale', () => {
  it('YC10.1-NT4 chạm ICON40 1509 dưới Chị Hoa mở S3 của 1509 (hôm nay, 1 đêm), không mở S6-07', async () => {
    const { chiTietCan } = veSale(dvTab());
    fireEvent.click(await screen.findByRole('button', { name: 'ICON40 1509' }));
    const nay = homNay();
    const mai = new Date(Date.parse(nay + 'T00:00:00Z') + 86_400_000).toISOString().slice(0, 10);
    expect(chiTietCan.doc).toHaveBeenCalledWith('c1509', nay, mai);
    expect(document.querySelector('[data-man="S3"]')).not.toBeNull();
    expect(document.querySelector('[data-man="S6-07"]')).toBeNull();
  });

  it('YC10.1-NT5 chạm Green Bay 0812 mở S6-07 với ba việc Đặt phòng, Sửa căn và giá, Gửi cho khách', async () => {
    const tab = dvTab();
    veSale(tab);
    fireEvent.click(await screen.findByRole('button', { name: 'Green Bay 0812' }));
    const man = document.querySelector('[data-man="S6-07"]') as HTMLElement;
    expect(man).not.toBeNull();
    expect(within(man).getByRole('heading', { name: 'Green Bay 0812' })).toBeInTheDocument();
    expect(await within(man).findByText('Căn của tôi')).toBeInTheDocument();
    expect(within(man).getByText('2PN · view biển')).toBeInTheDocument();
    expect(within(man).getByText('Bạn tự ghi lịch và giá cho căn này, như chủ nhà.')).toBeInTheDocument();
    expect(within(man).getAllByTestId('o-ngay').map((o) => o.lastChild?.textContent))
      .toEqual(['750k', 'Kín', 'Kín', '900k', '750k', '750k', '750k']);
    expect(within(man).getAllByTestId('o-ngay')[0]!.firstChild?.textContent).toBe('Nay');
    const viec = within(within(man).getByRole('list', { name: 'Việc với căn này' })).getAllByRole('button');
    expect(viec.map((b) => b.querySelector('.s607-viec-ten')?.textContent)).toEqual(['Đặt phòng', 'Sửa căn và giá', 'Gửi cho khách']);
    expect(tab.docCanCuaToi).toHaveBeenCalledWith('g0812', homNay());
    fireEvent.click(within(man).getByRole('button', { name: 'Quay lại' }));
    expect(await screen.findByRole('heading', { name: 'Căn của tôi · 2' })).toBeInTheDocument();
  });

  it('YC10.1-NT5 "Gửi cho khách" ở S6-07 mở S5 cho căn này, hôm nay 1 đêm', async () => {
    const guiKhach = { soan: vi.fn(async () => { throw new Error('mạng'); }), ghiLanGui: vi.fn() };
    veSale(dvTab(), { guiKhach });
    fireEvent.click(await screen.findByRole('button', { name: 'Green Bay 0812' }));
    fireEvent.click(await screen.findByRole('button', { name: /Gửi cho khách/ }));
    const nay = homNay();
    const mai = new Date(Date.parse(nay + 'T00:00:00Z') + 86_400_000).toISOString().slice(0, 10);
    await waitFor(() => expect(guiKhach.soan).toHaveBeenCalledWith(['g0812'], nay, mai));
  });

  it('YC10.1 bước 5 chạm tên chủ nhà mở S6-04; bước 11 "Gửi tin nhắn xin lịch" mở A6', async () => {
    // US55 thay màn tạm S6-04 bằng màn thật: kiểm mở đúng kết nối của Chị Hoa.
    const tab = dvTab();
    const chiTietChuNha = { doc: vi.fn(async () => ({ trangThai: 'khong_con_quyen' as const, lyDo: 'chu_ngung' as const, ketNoiId: 'kHoa', chuId: 'hoa', tenChu: 'Chị Hoa' })), boNguon: vi.fn() };
    veSale({ ...tab, chiTietChuNha });
    fireEvent.click(await screen.findByRole('button', { name: /^Chị Hoa/ }));
    expect(document.querySelector('[data-man="S6-04"]')).not.toBeNull();
    expect(chiTietChuNha.doc).toHaveBeenCalledWith('kHoa');
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    expect(await screen.findByRole('heading', { name: 'Căn của tôi · 2' })).toBeInTheDocument();
    cleanup();
    veSale(dvTab([]));
    fireEvent.click(await screen.findByRole('button', { name: 'Gửi tin nhắn xin lịch cho chủ nhà' }));
    expect(await screen.findByText(/Gửi tin này cho chủ nhà qua Zalo/)).toBeInTheDocument();
  });
});
