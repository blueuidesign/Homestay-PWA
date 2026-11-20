// Test unit chữ và nhóm của tab Căn của sale (YC10.1, US54).
import { describe, expect, it } from 'vitest';
import {
  cauMoiChuCan, chiaTabCan, chuCaiDau, chuCapNhat, chuTinhTrang, oBayNgay, phuCanCuaToi, soChuNha, tabTrong, tinMoiDungApp,
  type DongTabCan,
} from './tabCanSale';

const RONG: DongTabCan = {
  nhom: 'cua_toi', canId: null, maCan: null, tenToa: null, soPhongNgu: null, soGiuong: null, loaiView: null, khachDen: null,
  ketNoiId: null, chuId: null, tenChu: null, chuDaXoa: false, capNhatLuc: null, chuCanTen: null,
};
const can = (p: Partial<DongTabCan>): DongTabCan => ({ ...RONG, ...p });

/** Bộ mẫu S6 (du-lieu-mau.md): Sale Hùng. */
const DONG_HUNG: DongTabCan[] = [
  can({ canId: 'g0812', maCan: '0812', tenToa: 'Green Bay', soPhongNgu: 2, loaiView: 'bien' }),
  can({ canId: 'm1605', maCan: '1605', tenToa: 'Mường Thanh', soPhongNgu: 1, loaiView: 'bien', khachDen: '2026-10-12' }),
  can({ nhom: 'nguon', canId: 'c1509', maCan: '1509', tenToa: 'ICON40', soPhongNgu: 2, soGiuong: 3, loaiView: 'bien',
        ketNoiId: 'kHoa', chuId: 'hoa', tenChu: 'Chị Hoa', capNhatLuc: '2026-10-07T08:00:00+07:00' }),
  can({ nhom: 'nguon', canId: 'c3402', maCan: '3402', soPhongNgu: 1, loaiView: 'bien',
        ketNoiId: 'kHoa', chuId: 'hoa', tenChu: 'Chị Hoa', capNhatLuc: '2026-10-07T08:00:00+07:00' }),
  can({ nhom: 'nguon', canId: 'c1103', maCan: '1103', tenToa: 'Sapphire', soPhongNgu: 3, soGiuong: 2, loaiView: 'thanh_pho',
        ketNoiId: 'kTuan', chuId: 'tuan', tenChu: 'Anh Tuấn', capNhatLuc: '2026-10-06T09:00:00+07:00' }),
  can({ nhom: 'nguon', canId: 'c2208', maCan: '2208', tenToa: 'À La Carte', soPhongNgu: 1, soGiuong: 1, loaiView: 'bien',
        ketNoiId: 'kTuan', chuId: 'tuan', tenChu: 'Anh Tuấn', capNhatLuc: '2026-10-06T09:00:00+07:00' }),
  can({ nhom: 'tu_nhap', canId: 'villa', maCan: 'Villa Tuần Châu', chuCanTen: 'Chú Bình' }),
];
/** S6-08: Chị Hoa đã xóa tài khoản (database chỉ trả tên và cờ). */
const DONG_HOA_XOA: DongTabCan[] = [
  ...DONG_HUNG.filter((d) => d.chuId !== 'hoa'),
  can({ nhom: 'nguon', ketNoiId: 'kHoa', chuId: 'hoa', tenChu: 'Chị Hoa', chuDaXoa: true }),
];

describe('YC10.1 · nhóm tab Căn', () => {
  it('YC10.1-NT1 Sale Hùng có ba nhóm với số đếm 2, 2 và 1', () => {
    const t = chiaTabCan(DONG_HUNG);
    expect([t.cuaToi.length, soChuNha(t), t.tuNhap.length]).toEqual([2, 2, 1]);
    expect(t.cuaToi.map((c) => `${c.ten} ${c.phu} ${c.tinhTrang.chu}`))
      .toEqual(['Green Bay 0812 2PN · view biển Trống hôm nay ✓', 'Mường Thanh 1605 1PN · view biển Có khách 12/10']);
    expect(t.chuNha.map((n) => n.ten)).toEqual(['Chị Hoa', 'Anh Tuấn']);
    expect(tabTrong(t)).toBe(false);
  });

  it('YC10.1-NT2 căn của chủ nhà đã kết nối có số giường ghi "2PN · 3 giường", không có số khách', () => {
    const hoa = chiaTabCan(DONG_HUNG).chuNha[0]!;
    expect(hoa.can.map((c) => `${c.ten}|${c.phu}`)).toEqual(['3402|1PN · view biển', 'ICON40 1509|2PN · 3 giường · view biển']);
    for (const c of chiaTabCan(DONG_HUNG).chuNha.flatMap((n) => n.can)) expect(c.phu).not.toMatch(/khách/);
  });

  it('YC10.1-NT3 căn tự nhập ghi "chưa dùng app", không có "Trống hôm nay"', () => {
    const v = chiaTabCan(DONG_HUNG).tuNhap[0]!;
    expect(v.ten).toBe('Villa Tuần Châu');
    expect(v.phu).toBe('Chú Bình · chưa dùng app · gọi hỏi lịch');
    expect(JSON.stringify(v)).not.toMatch(/Trống hôm nay/);
    expect(cauMoiChuCan(v.tenChuCan)).toBe('Mời chú Bình dùng app để lịch tự cập nhật, không cần gọi hỏi.');
  });

  it('YC10.1-NT7 Chị Hoa đã xóa tài khoản: nhóm đếm 1, dòng Chị Hoa không có căn, giá, số điện thoại, lần cập nhật', () => {
    const t = chiaTabCan(DONG_HOA_XOA);
    expect(soChuNha(t)).toBe(1);
    const hoa = t.chuNha.find((n) => n.chuId === 'hoa')!;
    expect(hoa).toMatchObject({ daXoa: true, can: [], capNhat: null });
    expect(hoa.soDienThoai ?? null).toBeNull();
    // Dòng đã xóa tài khoản lên đầu (S6-08).
    expect(t.chuNha[0]!.chuId).toBe('hoa');
    // Dữ liệu lạ có gửi kèm căn cũng không hiện căn.
    const la = chiaTabCan([...DONG_HOA_XOA, can({ nhom: 'nguon', canId: 'c1509', maCan: '1509', ketNoiId: 'kHoa', chuId: 'hoa', tenChu: 'Chị Hoa', chuDaXoa: true })]);
    expect(la.chuNha.find((n) => n.chuId === 'hoa')!.can).toEqual([]);
  });

  it('YC10.1-NT8 bỏ dòng Chị Hoa thì nhóm chỉ còn Anh Tuấn', () => {
    const t = chiaTabCan(DONG_HOA_XOA.filter((d) => d.chuId !== 'hoa'));
    expect(t.chuNha.map((n) => n.ten)).toEqual(['Anh Tuấn']);
  });

  it('YC10.1-NT10 chưa có căn nào thì tab trống (S6-00)', () => {
    expect(tabTrong(chiaTabCan([]))).toBe(true);
    // Chỉ còn dòng chủ đã xóa tài khoản thì chưa trống (còn nút bỏ dòng).
    expect(tabTrong(chiaTabCan([can({ nhom: 'nguon', ketNoiId: 'k', chuId: 'hoa', tenChu: 'Chị Hoa', chuDaXoa: true })]))).toBe(false);
  });

  it('YC10.1 bước 1, 2 chữ tình trạng, lần cập nhật, chữ cái đầu', () => {
    expect(chuTinhTrang(null)).toEqual({ co: false, chu: 'Trống hôm nay ✓' });
    expect(chuTinhTrang('2026-10-12')).toEqual({ co: true, chu: 'Có khách 12/10' });
    const bayGio = new Date('2026-10-07T10:00:00+07:00');
    expect(chuCapNhat('2026-10-07T08:00:00+07:00', bayGio)).toBe('✓ Cập nhật 2 giờ trước');
    expect(chuCapNhat('2026-10-06T09:00:00+07:00', bayGio)).toBe('✓ Cập nhật hôm qua');
    expect(chuCapNhat(null, bayGio)).toBeNull();
    expect([chuCaiDau('Chị Hoa'), chuCaiDau('Anh Tuấn'), chuCaiDau('Hoa')]).toEqual(['H', 'T', 'H']);
  });

  it('YC10.1-NT9 tin mời có link https mở app', () => {
    expect(tinMoiDungApp('https://home247.vn')).toMatch(/https:\/\/home247\.vn\/$/);
  });

  it('YC10.1-NT5 bước 7 S6-07: ô 7 ngày "Nay 07 750k", "T5 08 Kín"; dòng phụ "2PN · view biển"', () => {
    expect(oBayNgay({ ngay: '2026-10-07', o: 'trong', gia: 750_000 }, '2026-10-07')).toEqual({ thu: 'Nay', ngay: '07', chu: '750k', kin: false });
    expect(oBayNgay({ ngay: '2026-10-08', o: 'kin', gia: 750_000 }, '2026-10-07')).toEqual({ thu: 'T5', ngay: '08', chu: 'Kín', kin: true });
    expect(oBayNgay({ ngay: '2026-10-10', o: 'trong', gia: 900_000 }, '2026-10-07').chu).toBe('900k');
    expect(phuCanCuaToi({ soPhongNgu: 2, soGiuong: null, loaiView: 'bien' })).toBe('2PN · view biển');
  });
});
