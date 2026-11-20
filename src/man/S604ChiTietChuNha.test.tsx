// Test unit S6-04 · Chi tiết chủ nhà (YC10.2, US55), dòng chủ nhà đã ngừng ở tab Căn, và nối ở ManSale.
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../chung/Toast';
import type { ChiTietChuNha, CoChuNgung } from '../lib/chiTietChuNha';
import type { DichVuChiTietChuNha } from '../lib/dichVuChiTietChuNha';
import type { DichVuLichSale } from '../lib/dichVuLichSale';
import type { DichVuTabCanSale } from '../lib/dichVuTabCanSale';
import type { DichVuXinLich } from '../lib/dichVuXinLich';
import { chiaTabCan, type DongTabCan, type NhomChuNha } from '../lib/tabCanSale';
import { ManSale } from './ManSale';
import { CAU_KHONG_CON_XEM, S604ChiTietChuNha } from './S604ChiTietChuNha';
import { S6TabCan } from './S6TabCan';

afterEach(() => { cleanup(); });

const HAI_GIO_TRUOC = new Date(Date.now() - 2 * 3_600_000 - 60_000).toISOString();
const HOA: ChiTietChuNha = {
  trangThai: 'da_ket_noi', ketNoiId: 'kHoa', chuId: 'hoa', tenChu: 'Chị Hoa', soDienThoai: '0904118772',
  ketNoiTu: '2026-08-02', capNhatLuc: HAI_GIO_TRUOC, xemCoc: true,
  can: [
    { canId: 'c1509', maCan: '1509', tenToa: 'ICON40', soPhongNgu: 2, soGiuong: 3, loaiView: 'bien', giaDem: 1_800_000 },
    { canId: 'c3402', maCan: '3402', tenToa: null, soPhongNgu: 1, soGiuong: null, loaiView: 'bien', giaDem: 1_100_000 },
  ],
  soDatPhong: 12, tienChenh: 6_400_000,
};
const NGUNG: ChiTietChuNha = { trangThai: 'khong_con_quyen', lyDo: 'chu_ngung', ketNoiId: 'kHoa', chuId: 'hoa', tenChu: 'Chị Hoa' };

function dvCt(ct: ChiTietChuNha = HOA) {
  return { doc: vi.fn(async () => structuredClone(ct)), boNguon: vi.fn(async () => undefined) } satisfies DichVuChiTietChuNha;
}

function ve(dv: DichVuChiTietChuNha) {
  const cb = { onQuayLai: vi.fn(), onDaBo: vi.fn(), onChamCan: vi.fn() };
  render(<ToastProvider><S604ChiTietChuNha ketNoiId="kHoa" tenTam="Chị Hoa" dv={dv} {...cb} /></ToastProvider>);
  return cb;
}

describe('YC10.2 · S6-04 Chi tiết chủ nhà', () => {
  it('YC10.2 bước 1, 2, 4 tên, số, ngày kết nối, "Gọi", lần cập nhật, quyền, kết quả bán', async () => {
    ve(dvCt());
    const chu = await screen.findByRole('region', { name: 'Chủ nhà' });
    expect(within(chu).getByText('0904 118 772 · kết nối từ 02/08/2026')).toBeInTheDocument();
    expect(within(chu).getByRole('link', { name: 'Gọi' })).toHaveAttribute('href', 'tel:0904118772');
    expect(within(chu).getByText('✓ Lịch tự cập nhật · lần cuối 2 giờ trước')).toBeInTheDocument();
    const quyen = screen.getByRole('region', { name: 'Chị Hoa cho bạn xem' });
    expect(within(quyen).getAllByRole('listitem').map((l) => l.textContent))
      .toEqual(['Phòng trống hay đã đặt', 'Giá từng đêm', 'Đã cọc hay chưa']);
    expect(screen.getByText('12 đặt phòng')).toBeInTheDocument();
    expect(screen.getByText('6,4tr')).toBeInTheDocument();
  });

  it('YC10.2-NT1 S6-04 ghi giá đêm của cả hai căn; căn chưa đặt giá thì không có giá', async () => {
    ve(dvCt());
    const ds = await screen.findByRole('region', { name: 'Căn · 2' });
    expect(within(ds).getByText('2PN · 3 giường · view biển · 1.800.000đ/đêm')).toBeInTheDocument();
    expect(within(ds).getByText('1PN · view biển · 1.100.000đ/đêm')).toBeInTheDocument();
    cleanup();
    ve(dvCt({ ...HOA, can: [HOA.can[0]!, { ...HOA.can[1]!, giaDem: null }] } as ChiTietChuNha));
    const ds2 = await screen.findByRole('region', { name: 'Căn · 2' });
    expect(within(ds2).getByText('1PN · view biển')).toBeInTheDocument();
    expect(within(within(ds2).getByRole('button', { name: /^3402/ })).queryByText(/đ\/đêm/)).toBeNull();
  });

  it('YC10.2 bước 3 chạm một căn mở căn đó', async () => {
    const cb = ve(dvCt());
    fireEvent.click(await screen.findByRole('button', { name: /^ICON40 1509/ }));
    expect(cb.onChamCan).toHaveBeenCalledWith(expect.objectContaining({ canId: 'c1509' }));
  });

  it('YC10.2-NT2 chủ nhà tắt "Tình trạng cọc" thì S6-04 không có dòng đó', async () => {
    ve(dvCt({ ...HOA, xemCoc: false } as ChiTietChuNha));
    const quyen = await screen.findByRole('region', { name: 'Chị Hoa cho bạn xem' });
    expect(within(quyen).getAllByRole('listitem').map((l) => l.textContent)).toEqual(['Phòng trống hay đã đặt', 'Giá từng đêm']);
    expect(screen.queryByText('Đã cọc hay chưa')).toBeNull();
  });

  it('YC10.2-NT3 bấm "Bỏ nguồn phòng này" một lần: chưa bỏ gì, chỉ hiện nút xác nhận', async () => {
    const dv = dvCt();
    const cb = ve(dv);
    fireEvent.click(await screen.findByRole('button', { name: 'Bỏ nguồn phòng này' }));
    expect(dv.boNguon).not.toHaveBeenCalled();
    expect(cb.onDaBo).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Xác nhận bỏ Chị Hoa?' })).toBeInTheDocument();
    expect(screen.getByText('Bạn không thấy lịch của Chị Hoa nữa. Muốn xem lại phải xin link mới.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Bỏ nguồn phòng này' })).toBeNull();
  });

  it('YC10.2-NT4 bấm xác nhận thì gọi bỏ nguồn rồi về S6', async () => {
    const dv = dvCt();
    const cb = ve(dv);
    fireEvent.click(await screen.findByRole('button', { name: 'Bỏ nguồn phòng này' }));
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận bỏ Chị Hoa?' }));
    await waitFor(() => expect(cb.onDaBo).toHaveBeenCalledTimes(1));
    expect(dv.boNguon).toHaveBeenCalledWith('kHoa');
  });

  it('YC10.2-NT4 database không bỏ được thì báo, đọc lại, vẫn ở S6-04', async () => {
    const dv = dvCt();
    dv.boNguon.mockRejectedValue(new Error('mạng'));
    const cb = ve(dv);
    fireEvent.click(await screen.findByRole('button', { name: 'Bỏ nguồn phòng này' }));
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận bỏ Chị Hoa?' }));
    await waitFor(() => expect(dv.doc).toHaveBeenCalledTimes(2));
    expect(cb.onDaBo).not.toHaveBeenCalled();
    expect(await screen.findByRole('button', { name: 'Bỏ nguồn phòng này' })).toBeInTheDocument();
  });

  it('YC10.2-NT7 chủ đã ngừng cho xem: "Bạn không còn xem được mục này" kèm lý do, không căn, giá, số; nút về tab Căn', async () => {
    const cb = ve(dvCt(NGUNG));
    const mat = await screen.findByRole('alert');
    expect(within(mat).getByText(CAU_KHONG_CON_XEM)).toBeInTheDocument();
    expect(within(mat).getByText('Chủ nhà đã ngừng chia sẻ lịch')).toBeInTheDocument();
    const man = document.querySelector('[data-man="S6-04"]') as HTMLElement;
    expect(man.textContent).not.toMatch(/1509|3402|đ\/đêm|0904|Gọi|Bỏ nguồn/);
    fireEvent.click(within(mat).getByRole('button', { name: 'Về tab Căn' }));
    expect(cb.onQuayLai).toHaveBeenCalled();
  });

  it('YC10.2 HV5 chủ đã xóa tài khoản: lý do "Chủ nhà đã xóa tài khoản"', async () => {
    ve(dvCt({ ...NGUNG, lyDo: 'chu_xoa_tai_khoan' } as ChiTietChuNha));
    expect(await screen.findByText('Chủ nhà đã xóa tài khoản')).toBeInTheDocument();
  });

  it('YC10.2 HV1 HV2 đang đọc thì khung xám; không đọc được thì "Thử lại"', async () => {
    const dv = dvCt();
    dv.doc.mockRejectedValueOnce(new Error('mạng'));
    ve(dv);
    expect(screen.getByLabelText('Đang tải')).toBeInTheDocument();
    fireEvent.click(await screen.findByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByRole('region', { name: 'Chủ nhà' })).toBeInTheDocument();
  });

  it('YC10.2 chủ chưa cho số thì không có nút "Gọi"', async () => {
    ve(dvCt({ ...HOA, soDienThoai: null } as ChiTietChuNha));
    const chu = await screen.findByRole('region', { name: 'Chủ nhà' });
    expect(within(chu).getByText('kết nối từ 02/08/2026')).toBeInTheDocument();
    expect(within(chu).queryByRole('link', { name: 'Gọi' })).toBeNull();
  });
});

// ===== Tab Căn: dòng chủ nhà đã ngừng (YC10.2-NT6) =====
const RONG: DongTabCan = {
  nhom: 'nguon', canId: null, maCan: null, tenToa: null, soPhongNgu: null, soGiuong: null, loaiView: null, khachDen: null,
  ketNoiId: null, chuId: null, tenChu: null, chuDaXoa: false, capNhatLuc: null, chuCanTen: null,
};
const DONG: DongTabCan[] = [
  { ...RONG, canId: 'c1509', maCan: '1509', tenToa: 'ICON40', soPhongNgu: 2, soGiuong: 3, loaiView: 'bien', ketNoiId: 'kHoa', chuId: 'hoa', tenChu: 'Chị Hoa', capNhatLuc: HAI_GIO_TRUOC },
  { ...RONG, canId: 'c3402', maCan: '3402', soPhongNgu: 1, loaiView: 'bien', ketNoiId: 'kHoa', chuId: 'hoa', tenChu: 'Chị Hoa', capNhatLuc: HAI_GIO_TRUOC },
  { ...RONG, canId: 'c1103', maCan: '1103', tenToa: 'Sapphire', soPhongNgu: 3, ketNoiId: 'kTuan', chuId: 'tuan', tenChu: 'Anh Tuấn', capNhatLuc: HAI_GIO_TRUOC },
];
const DONG_NGUNG: DongTabCan[] = [...DONG.filter((d) => d.chuId !== 'hoa'), { ...RONG, ketNoiId: 'kHoa', chuId: 'hoa', tenChu: 'Chị Hoa' }];

function dvTab(dong: DongTabCan[], ngung: string[] = []) {
  const tab = chiaTabCan(dong);
  for (const n of tab.chuNha) {
    n.soDienThoai = ngung.includes(n.ketNoiId) ? null : '0904118772';
    if (ngung.includes(n.ketNoiId)) (n as NhomChuNha & CoChuNgung).chuNgung = true;
  }
  return {
    doc: vi.fn(async () => structuredClone(tab)),
    docCanCuaToi: vi.fn(),
    boDongChu: vi.fn(async () => undefined),
  };
}

describe('YC10.2 · dòng chủ nhà đã ngừng ở tab Căn', () => {
  it('YC10.2-NT6 Chị Hoa đã ngừng: dòng ghi "đã ngừng cho bạn xem lịch", không căn, không giá; "Bỏ khỏi danh sách" bỏ ngay', async () => {
    const dv = dvTab(DONG_NGUNG, ['kHoa']);
    const cb = { onCham: vi.fn(), onMoChuNha: vi.fn(), onThemCan: vi.fn(), onXinLich: vi.fn(), onThemTuNhap: vi.fn() };
    render(<ToastProvider><S6TabCan dv={dv as unknown as DichVuTabCanSale} {...cb} /></ToastProvider>);
    const hoa = await screen.findByRole('region', { name: 'Chị Hoa' });
    expect(within(hoa).getByText('đã ngừng cho bạn xem lịch')).toBeInTheDocument();
    expect(within(hoa).queryByText(/1509|3402|\dđ|PN|Cập nhật/)).toBeNull();
    expect(within(hoa).queryByRole('link')).toBeNull();
    expect(within(hoa).getAllByRole('button').map((b) => b.textContent)).toEqual(['Bỏ khỏi danh sách']);
    expect(screen.getByRole('heading', { name: 'Chủ nhà đã kết nối · 1' })).toBeInTheDocument();
    fireEvent.click(within(hoa).getByRole('button', { name: 'Bỏ khỏi danh sách' }));
    expect(screen.queryByRole('region', { name: 'Chị Hoa' })).toBeNull();
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(dv.boDongChu).toHaveBeenCalledWith('kHoa');
    expect(cb.onMoChuNha).not.toHaveBeenCalled();
  });
});

// ===== Nối ở ManSale (YC10.2-NT4) =====
const dvXin: DichVuXinLich = { doc: vi.fn(async () => ({ ma: null, soLanGui: 0, guiCuoiLuc: null, soChuDongY: 0, coNguon: true })), layLink: vi.fn(async () => 'kQmZpRtwXyAbCdEf'), ghiLanGui: vi.fn() };
const dvLich: DichVuLichSale = { doc: vi.fn(async () => []) };

describe('YC10.2 · S6-04 trong khung của sale', () => {
  it('YC10.2-NT4 xác nhận bỏ nguồn Chị Hoa: về S6, Chị Hoa không còn ở nguồn phòng', async () => {
    const tab = dvTab(DONG);
    const sau = chiaTabCan(DONG.filter((d) => d.chuId !== 'hoa'));
    tab.doc.mockResolvedValueOnce(structuredClone(chiaTabCan(DONG))).mockResolvedValue(structuredClone(sau));
    const chiTietChuNha = dvCt();
    const chiTietCan = { doc: vi.fn(async () => ({ khongConQuyen: true as const, lyDo: null })), datMuc: vi.fn(async () => undefined) };
    render(<ToastProvider><ManSale ten="Sale Hùng" dv={dvXin} onDangXuat={vi.fn()}
                                   dvLich={{ ...dvLich, chiTietCan, tabCan: { ...(tab as unknown as DichVuTabCanSale), chiTietChuNha } }} /></ToastProvider>);
    fireEvent.click(within(screen.getByRole('navigation', { name: 'Tab' })).getByRole('button', { name: 'Căn' }));
    fireEvent.click(await screen.findByRole('button', { name: /^Chị Hoa/ }));
    expect(await screen.findByRole('region', { name: 'Chủ nhà' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Bỏ nguồn phòng này' }));
    expect(chiTietChuNha.boNguon).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận bỏ Chị Hoa?' }));
    expect(await screen.findByRole('heading', { name: 'Chủ nhà đã kết nối · 1' })).toBeInTheDocument();
    expect(chiTietChuNha.boNguon).toHaveBeenCalledWith('kHoa');
    expect(screen.queryByRole('region', { name: 'Chị Hoa' })).toBeNull();
    expect(screen.getByRole('region', { name: 'Anh Tuấn' })).toBeInTheDocument();
  });

  it('YC10.2 bước 3 chạm căn ở S6-04 mở S3 của căn đó; quay lại về S6-04', async () => {
    const tab = dvTab(DONG);
    const chiTietChuNha = dvCt();
    const chiTietCan = { doc: vi.fn(async () => ({ khongConQuyen: true as const, lyDo: null })), datMuc: vi.fn(async () => undefined) };
    render(<ToastProvider><ManSale ten="Sale Hùng" dv={dvXin} onDangXuat={vi.fn()}
                                   dvLich={{ ...dvLich, chiTietCan, tabCan: { ...(tab as unknown as DichVuTabCanSale), chiTietChuNha } }} /></ToastProvider>);
    fireEvent.click(within(screen.getByRole('navigation', { name: 'Tab' })).getByRole('button', { name: 'Căn' }));
    fireEvent.click(await screen.findByRole('button', { name: /^Chị Hoa/ }));
    fireEvent.click(await screen.findByRole('button', { name: /^ICON40 1509/ }));
    expect(document.querySelector('[data-man="S3"]')).not.toBeNull();
    expect(chiTietCan.doc).toHaveBeenCalledWith('c1509', expect.any(String), expect.any(String));
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    expect(await screen.findByRole('region', { name: 'Chủ nhà' })).toBeInTheDocument();
  });
});
