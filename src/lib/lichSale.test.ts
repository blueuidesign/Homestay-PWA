// Test unit phần tính lịch 7 ngày của sale (YC7.1, US43). Số theo DLM: Sale Hùng, 07/10 → 13/10/2026.
import { describe, expect, it } from 'vitest';
import {
  bayNgay, chiaNhom, chuO, cotNgay, dungHang, phuHang, sapXep, tenHang, tenKhoang, type DongLichSale,
} from './lichSale';

// Hàng: mã, tòa, nhóm, chủ, số PN, view, số bán, 7 ô ('k' kín kèm giá, số là giá trống, '?' chưa biết, 'b' bạn).
type MauHang = [string, string | null, DongLichSale['nhom'], string | null, number | null, string | null, number, (string | number)[]];
const MAU_HUNG: MauHang[] = [
  ['0812', 'Green Bay', 'cua_toi', null, 2, 'bien', 1, [750000, 'k750000', 'k900000', 900000, 750000, 750000, 750000]],
  ['1605', 'Mường Thanh', 'cua_toi', null, 1, 'bien', 0, [600000, 600000, 700000, 700000, 600000, 'k600000', 'k600000']],
  ['3402', null, 'nguon', 'Chị Hoa', 1, null, 1, [1200000, 1200000, 1500000, 1500000, 1200000, 1200000, 1200000]],
  ['2208', 'À La Carte', 'nguon', 'Anh Tuấn', 1, null, 0, ['k700000', 700000, 800000, 800000, 700000, 'k700000', 700000]],
  ['1509', 'ICON40', 'nguon', 'Chị Hoa', 2, null, 2, [1100000, 'k1100000', 'k1500000', 1300000, 1100000, 1100000, 1100000]],
  ['1103', 'Sapphire', 'nguon', 'Anh Tuấn', 3, null, 3, [1500000, 1500000, 1800000, 'k1800000', 'k1500000', 'k1500000', 1500000]],
  ['Villa Tuần Châu', null, 'tu_nhap', 'Chú Bình', null, null, 0, ['?', 'b', '?', '?', '?', '?', '?']],
];

function mauLichHung(tu = '2026-10-07', mau: MauHang[] = MAU_HUNG): DongLichSale[] {
  return mau.flatMap(([ma, toa, nhom, chu, pn, view, ban, o]) => o.map((x, i): DongLichSale => {
    const d = new Date(Date.parse(tu + 'T00:00:00Z') + i * 86_400_000).toISOString().slice(0, 10);
    const s = String(x);
    const loai = s === '?' ? 'chua_biet' : s === 'b' ? 'ban' : s.startsWith('k') ? 'kin' : 'trong';
    const gia = loai === 'kin' ? Number(s.slice(1)) : loai === 'trong' ? Number(s) : null;
    return { canId: 'can-' + ma, nhom, maCan: ma, tenToa: toa, tenChu: chu, soPhongNgu: pn, loaiView: view,
             lichDoiLuc: nhom === 'nguon' ? '2026-10-07T03:00:00Z' : null, soBan: ban, dem: d, o: loai, giaBan: gia };
  }));
}

describe('YC7.1 · lịch 7 ngày của sale', () => {
  it('YC7.1-NT2 nhóm "Căn của tôi · 2" ở trên "Nguồn phòng · 5" (căn tự nhập đếm vào nguồn phòng)', () => {
    const nhom = chiaNhom(dungHang(mauLichHung()), 'ten');
    expect(nhom.map((g) => g.tieuDe)).toEqual(['Căn của tôi · 2', 'Nguồn phòng · 5']);
    expect(nhom[0]!.hang.map((h) => h.ten)).toEqual(['Green Bay 0812', 'Mường Thanh 1605']);
  });

  it('YC7.1-NT3 ô kín ghi "Kín"; ô trống ghi giá bán: 3402 đêm 08/10 "1,2tr"', () => {
    const h = dungHang(mauLichHung()).find((x) => x.ten === '3402')!;
    expect(h.o.find((o) => o.dem === '2026-10-08')!.chu).toBe('1,2tr');
    const icon = dungHang(mauLichHung()).find((x) => x.ten === 'ICON40 1509')!;
    expect(icon.o.map((o) => o.chu)).toEqual(['1,1tr', 'Kín', 'Kín', '1,3tr', '1,1tr', '1,1tr', '1,1tr']);
    expect(chuO('trong', null)).toBe('–');
    expect(chuO('kin', 1_200_000)).toBe('Kín');
  });

  it('YC7.1-NT5 căn tự nhập: mọi ô "?" trừ đêm sale đã ghi ("Bạn"); không ô nào ghi giá hay trống', () => {
    const h = dungHang(mauLichHung()).find((x) => x.nhom === 'tu_nhap')!;
    expect(h.o.map((o) => o.chu)).toEqual(['?', 'Bạn', '?', '?', '?', '?', '?']);
    expect(h.o.every((o) => o.gia === null)).toBe(true);
    expect(h.phu).toBe('Chú Bình · tự nhập');
    // Dòng lạ có giá cho căn tự nhập cũng không thành giá trên màn.
    expect(chuO('chua_biet', 1_400_000)).toBe('?');
  });

  it('YC7.1-NT7 "Giá tăng dần": mỗi nhóm xếp theo giá đêm đầu, căn không có giá xếp cuối, "Căn của tôi" vẫn trên cùng', () => {
    const nhom = chiaNhom(dungHang(mauLichHung()), 'gia');
    expect(nhom[0]!.tieuDe).toBe('Căn của tôi · 2');
    expect(nhom[0]!.hang.map((h) => h.ten)).toEqual(['Mường Thanh 1605', 'Green Bay 0812']);
    expect(nhom[1]!.hang.map((h) => h.ten)).toEqual(['À La Carte 2208', 'ICON40 1509', '3402', 'Sapphire 1103', 'Villa Tuần Châu']);
  });

  it('YC7.1 Sắp xếp "Bán nhiều nhất" (YC7-H9): nhiều trước, bằng nhau theo tên; "Theo tên" theo tên', () => {
    const hang = dungHang(mauLichHung());
    const nguon = hang.filter((h) => h.nhom !== 'cua_toi');
    expect(sapXep(nguon, 'ban').map((h) => h.ten)).toEqual(['Sapphire 1103', 'ICON40 1509', '3402', 'À La Carte 2208', 'Villa Tuần Châu']);
    expect(sapXep(nguon, 'ten').map((h) => h.ten)).toEqual(['3402', 'À La Carte 2208', 'ICON40 1509', 'Sapphire 1103', 'Villa Tuần Châu']);
  });

  it('YC7.1 bước 3 tên hàng và dòng phụ', () => {
    expect(tenHang({ maCan: '1509', tenToa: 'ICON40' })).toBe('ICON40 1509');
    expect(tenHang({ maCan: '3402', tenToa: null })).toBe('3402');
    const d: Pick<DongLichSale, 'nhom' | 'tenChu' | 'soPhongNgu' | 'loaiView'> = { nhom: 'nguon', tenChu: 'Chị Hoa', soPhongNgu: 1, loaiView: null };
    expect(phuHang(d)).toBe('Chị Hoa · 1PN');
    expect(phuHang({ nhom: 'cua_toi', tenChu: null, soPhongNgu: 2, loaiView: 'bien' })).toBe('2PN · view biển');
  });

  it('YC7.1 bước 2, 3, 6 cột ngày "Nay", "T5"; thanh "7 ngày tới · 07/10 → 13/10"; lùi tiến không còn "7 ngày tới"', () => {
    const ngay = bayNgay('2026-10-07');
    expect(ngay).toHaveLength(7);
    expect(ngay.map((n) => cotNgay(n, '2026-10-07').thu)).toEqual(['Nay', 'T5', 'T6', 'T7', 'CN', 'T2', 'T3']);
    expect(tenKhoang('2026-10-07', '2026-10-07')).toBe('7 ngày tới · 07/10 → 13/10');
    expect(tenKhoang('2026-10-14', '2026-10-07')).toBe('14/10 → 20/10');
    expect(tenKhoang('2026-12-28', '2026-10-07')).toBe('28/12 → 03/01');
  });
});
