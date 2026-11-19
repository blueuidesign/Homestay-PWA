// Test unit phần tính của lịch tuần nhiều căn (YC2.5, QT2, QT6.1, YC2 Quy tắc "Tuần bắt đầu thứ hai"). Số theo DLM.3, DLM.4.
import { describe, expect, it } from 'vitest';
import type { DatPhongLich } from './lich';
import {
  cacNgayTuan, chipLoc, chuOGia, dongCan, hangTuan, locCan, nhanTien, tenTuan, thuHaiTuan, tieuDeCot, tomTatTuan,
  type CanTuan, type GiaTuanTungDem,
} from './lichTuan';

const b = (id: string, canId: string, ngayNhan: string, ngayTra: string, trangThaiTien: DatPhongLich['trangThaiTien'] = 'da_thanh_toan',
  nguoiDat: DatPhongLich['nguoiDat'] = { loai: 'le' }): DatPhongLich => ({ id, canId, ngayNhan, ngayTra, trangThaiTien, nguoiDat });

// DLM.4 (người bán, trạng thái tiền theo bảng).
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

/** Giá chủ nhà DLM.3: 1509 900k / 1,3tr, 3402 800k / 1,1tr; đêm T6, T7 là cuối tuần. */
function giaDlm(t2: string): GiaTuanTungDem {
  const g: GiaTuanTungDem = { c1509: {}, c3402: {} };
  for (const d of cacNgayTuan(t2)) {
    const cuoiTuan = [5, 6].includes(new Date(d + 'T00:00:00Z').getUTCDay());
    g.c1509![d] = cuoiTuan ? 1300000 : 900000;
    g.c3402![d] = cuoiTuan ? 1100000 : 800000;
  }
  return g;
}

describe('YC2.5 · khung tuần', () => {
  it('YC2.5-NT1 tuần 05 – 11/10/2026 có bảy cột từ "T2 05" tới "CN 11"', () => {
    const ngay = cacNgayTuan('2026-10-05');
    expect(ngay).toEqual(['2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09', '2026-10-10', '2026-10-11']);
    expect(ngay.map(tieuDeCot)).toEqual(['T2 05', 'T3 06', 'T4 07', 'T5 08', 'T6 09', 'T7 10', 'CN 11']);
    expect(tenTuan('2026-10-05')).toBe('05 – 11/10/2026');
  });

  it('YC2.5-NT1 thứ Hai của tuần chứa một ngày (tuần bắt đầu thứ Hai); tuần vắt qua tháng, qua năm', () => {
    expect(thuHaiTuan('2026-10-14')).toBe('2026-10-12');
    expect(thuHaiTuan('2026-10-18')).toBe('2026-10-12'); // Chủ nhật thuộc tuần của thứ Hai trước
    expect(thuHaiTuan('2026-10-12')).toBe('2026-10-12');
    expect(tenTuan('2026-09-28')).toBe('28/09 – 04/10/2026');
    expect(tenTuan('2026-12-28')).toBe('28/12/2026 – 03/01/2027');
  });

  it('YC2.5 bước 18 dòng phụ của hàng căn: "2PN · ICON40"; phần chưa nhập thì bỏ', () => {
    expect(dongCan(C1509)).toBe('2PN · ICON40');
    expect(dongCan(C3402)).toBe('');
    expect(dongCan({ ...C3402, soPhongNgu: 1 })).toBe('1PN');
  });
});

describe('YC2.5 · ô và thanh', () => {
  it('YC2.5-NT2 ô không có khách hiện giá chủ nhà của đêm đó: 1509 ngày 08/10 "900k", 3402 ngày 09/10 "1,1tr"', () => {
    const g = giaDlm('2026-10-05');
    const o1509 = hangTuan(C1509, '2026-10-05', DLM4, g);
    const o3402 = hangTuan(C3402, '2026-10-05', DLM4, g);
    const oNgay = (h: ReturnType<typeof hangTuan>, ngay: string) => h.find((o) => o.loai === 'trong' && o.ngay === ngay);
    expect(oNgay(o1509, '2026-10-08')).toMatchObject({ loai: 'trong', chu: '900k' });
    expect(oNgay(o3402, '2026-10-09')).toMatchObject({ loai: 'trong', chu: '1,1tr' });
  });

  it('YC2.5 bước 18 đêm có khách nối thành một thanh qua các ngày, ghi người đặt và nhãn tiền (QT2.1: ngày trả không chiếm)', () => {
    const h = hangTuan(C1509, '2026-10-05', DLM4, giaDlm('2026-10-05'));
    // 1509 tuần 05 – 11/10: B3 đêm 05/10 (vắt từ 04/10), trống 06 – 09, B1 đêm 10, 11.
    expect(h.map((o) => (o.loai === 'thanh' ? `${o.datPhong.id}:${o.cot}+${o.soCot}` : o.ngay.slice(8)))).toEqual(
      ['B3:0+1', '06', '07', '08', '09', 'B1:5+2'],
    );
    const b1 = h.find((o) => o.loai === 'thanh' && o.datPhong.id === 'B1');
    expect(b1).toMatchObject({ nguoi: 'Sale Hùng', nhan: 'Đã cọc', daTra: true });
    const h3402 = hangTuan(C3402, '2026-10-12', DLM4, giaDlm('2026-10-12'));
    const b2 = h3402.find((o) => o.loai === 'thanh' && o.datPhong.id === 'B2');
    expect(b2).toMatchObject({ cot: 5, soCot: 2, nguoi: 'Sale Lan', nhan: 'Chưa cọc', daTra: false });
    const b6 = h3402.find((o) => o.loai === 'thanh' && o.datPhong.id === 'B6');
    expect(b6).toMatchObject({ cot: 2, soCot: 1, nguoi: 'Khách lẻ', nhan: 'Đã thanh toán', daTra: true });
  });

  it('YC2.5 bước 18 QT6.1 nhãn tiền: "Đã cọc", "Chưa cọc", "Đã thanh toán"; không có trạng thái thì không nhãn', () => {
    expect(nhanTien('da_coc')).toBe('Đã cọc');
    expect(nhanTien('chua_coc')).toBe('Chưa cọc');
    expect(nhanTien('da_thanh_toan')).toBe('Đã thanh toán');
    expect(nhanTien(null)).toBeNull();
  });

  it('YC2.5-NT7 đêm không có khách và chưa đặt giá thì ô hiện "–"', () => {
    expect(chuOGia(null)).toBe('–');
    expect(chuOGia(undefined)).toBe('–');
    expect(chuOGia(900000)).toBe('900k');
    const h = hangTuan(C3402, '2026-10-05', [], { c3402: { '2026-10-08': null } });
    expect(h).toHaveLength(7);
    expect(h.every((o) => o.loai === 'trong' && o.chu === '–')).toBe(true);
  });
});

describe('YC2.5 · chip lọc', () => {
  it('YC2.5-NT3 chạm chip "ICON40" thì bảng chỉ còn 1509', () => {
    const chip = chipLoc(HAI_CAN);
    expect(chip.map((c) => c.chu)).toEqual(['Tất cả', 'ICON40']);
    const icon = chip.find((c) => c.chu === 'ICON40')!;
    expect(locCan(HAI_CAN, icon.khoa).map((c) => c.maCan)).toEqual(['1509']);
    expect(locCan(HAI_CAN, 'tat-ca').map((c) => c.maCan)).toEqual(['1509', '3402']);
  });

  it('YC2.5-NT5 mọi căn cùng 2PN thì không có chip theo số phòng ngủ; có một căn 3PN thì có chip "3 phòng ngủ"', () => {
    const haiPn = [C1509, { ...C3402, soPhongNgu: 2 }, { id: 'c9', maCan: 'A1203', soPhongNgu: 2, tenToa: 'ICON40' }];
    expect(chipLoc(haiPn).map((c) => c.chu)).toEqual(['Tất cả', 'ICON40']);
    const coBaPn = [...haiPn, { id: 'c10', maCan: 'B1602', soPhongNgu: 3, tenToa: 'Tòa B' }];
    const chip = chipLoc(coBaPn);
    expect(chip.map((c) => c.chu)).toEqual(['Tất cả', 'ICON40', 'Tòa B', '2 phòng ngủ', '3 phòng ngủ']);
    expect(locCan(coBaPn, chip.find((c) => c.chu === '3 phòng ngủ')!.khoa).map((c) => c.maCan)).toEqual(['B1602']);
  });

  it('YC2.5 bước 21 căn chưa ghi số phòng ngủ không sinh chip; Studio là "Studio"', () => {
    expect(chipLoc(HAI_CAN).some((c) => c.chu.includes('phòng ngủ'))).toBe(false);
    const chip = chipLoc([{ ...C1509, soPhongNgu: 0 }, C1509]);
    expect(chip.map((c) => c.chu)).toEqual(['Tất cả', 'ICON40', 'Studio', '2 phòng ngủ']);
  });
});

describe('YC2.5 · ba ô tóm tắt', () => {
  it('YC2.5 bước 20 tuần 05 – 11/10, hôm nay 07/10: "Có khách hôm nay 0/2", "Trống tối T7 1 căn", "Chưa cọc 0 đặt phòng"', () => {
    expect(tomTatTuan(HAI_CAN, '2026-10-05', DLM4, [])).toEqual({ coKhach: '0/2', trongT7: '1 căn', chuaCoc: '0 đặt phòng' });
  });

  it('YC2.5-NT4 tuần 12 – 18/10/2026 thì ô tóm tắt ghi "Chưa cọc 2 đặt phòng" (B5, B2)', () => {
    const t = tomTatTuan(HAI_CAN, '2026-10-12', DLM4, []);
    expect(t.chuaCoc).toBe('2 đặt phòng');
    expect(t.trongT7).toBe('1 căn'); // T7 17/10: 3402 có B2, 1509 trống
  });

  it('YC2.5 bước 20 "Có khách hôm nay" theo danh sách căn có khách hôm nay; ô theo căn đang lọc', () => {
    expect(tomTatTuan(HAI_CAN, '2026-10-05', DLM4, ['c1509']).coKhach).toBe('1/2');
    expect(tomTatTuan([C1509], '2026-10-12', DLM4, ['c1509', 'c3402'])).toEqual({ coKhach: '1/1', trongT7: '1 căn', chuaCoc: '1 đặt phòng' });
  });
});
