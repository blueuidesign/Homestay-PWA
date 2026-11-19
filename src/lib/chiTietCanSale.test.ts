// Test unit chữ và giá của S3 (YC7.4, US46). Số theo DLM: 1509 giá chủ 1.300.000đ (10/10, đêm thứ Bảy) và 900.000đ (11/10).
import { describe, expect, it } from 'vitest';
import {
  chonHienTai, chuChipMacDinh, chuChuNha, chuGio, chuKhoang, chuMuc, dongThongTinCan, duongDanGoi, giaBanDem, giaBanTheoChon,
  hangChip, khoangTuLich, oHaiTuan, tieuDeCan, type ChiTietCanSale,
} from './chiTietCanSale';

const CT: Pick<ChiTietCanSale, 'dem' | 'mucCongMacDinh' | 'lamTron50k'> = {
  dem: [{ ngay: '2026-10-10', giaChu: 1_300_000, giaBan: 1_500_000 }, { ngay: '2026-10-11', giaChu: 900_000, giaBan: 1_100_000 }],
  mucCongMacDinh: 400_000, lamTron50k: false,
};

describe('YC7.4 · giá bán theo mức cộng', () => {
  it('YC7.4-NT1 Hùng xem 1509 cho 10/10 → 12/10 và chọn "+200k": giá bán 2.600.000đ', () => {
    expect(giaBanTheoChon(CT, { loai: 'rieng', muc: 200_000 })).toBe(2_600_000);
  });
  it('YC7.4-NT7 chọn chip "Mặc định" (mặc định +400k): giá bán 3.000.000đ', () => {
    expect(giaBanTheoChon(CT, { loai: 'mac-dinh' })).toBe(3_000_000);
  });
  it('YC7.4-NT1 "Không cộng" là giá chủ nhà 2.200.000đ', () => {
    expect(giaBanTheoChon(CT, { loai: 'rieng', muc: 0 })).toBe(2_200_000);
  });
  it('YC7.4-NT1 QT5.4 GD13 làm tròn lên 50.000đ từng đêm rồi mới cộng', () => {
    expect(giaBanDem(1_330_000, 0, true)).toBe(1_350_000);
    expect(giaBanDem(1_300_000, 0, true)).toBe(1_300_000);
    expect(giaBanTheoChon({ ...CT, mucCongMacDinh: 430_000, lamTron50k: true }, { loai: 'mac-dinh' })).toBe(3_100_000);
  });
  it('YC7.4 bước 3 có đêm chưa có giá thì không có giá bán (không bao giờ 0)', () => {
    expect(giaBanTheoChon({ ...CT, dem: [{ ngay: '2026-12-01', giaChu: null, giaBan: null }] }, { loai: 'mac-dinh' })).toBeNull();
  });
});

describe('YC7.4 · chip mức cộng', () => {
  it('YC7.4 bước 4 YC7-H7 chip "Mặc định +400k" đứng đầu, rồi bộ của glossary; đang dùng mặc định thì chip đó được chọn sẵn', () => {
    const h = hangChip({ mucCongRieng: null, mucCongMacDinh: 400_000 });
    expect(h.map((c) => c.chu)).toEqual(['Mặc định +400k', 'Không cộng', '+100k', '+200k', '+300k', '+400k', '+500k', 'Tùy chọn']);
    expect(h.filter((c) => c.dangChon).map((c) => c.chu)).toEqual(['Mặc định +400k']);
  });
  it('YC7.4 bước 4 mức riêng +200k thì chip "+200k" sáng; mức riêng lạ thì "Tùy chọn" ghi kèm mức', () => {
    expect(hangChip({ mucCongRieng: 200_000, mucCongMacDinh: 400_000 }).filter((c) => c.dangChon).map((c) => c.chu)).toEqual(['+200k']);
    expect(hangChip({ mucCongRieng: 250_000, mucCongMacDinh: 400_000 }).filter((c) => c.dangChon).map((c) => c.chu)).toEqual(['Tùy chọn +250k']);
    expect(hangChip({ mucCongRieng: 0, mucCongMacDinh: 400_000 }).filter((c) => c.dangChon).map((c) => c.chu)).toEqual(['Không cộng']);
  });
  it('YC7.4 bước 4 chữ mức cộng', () => {
    expect(chuMuc(0)).toBe('Không cộng');
    expect(chuMuc(500_000)).toBe('+500k');
    expect(chuMuc(1_200_000)).toBe('+1.200.000đ');
    expect(chuChipMacDinh(0)).toBe('Mặc định (không cộng)');
    expect(chonHienTai({ mucCongRieng: null })).toEqual({ loai: 'mac-dinh' });
    expect(chonHienTai({ mucCongRieng: 0 })).toEqual({ loai: 'rieng', muc: 0 });
  });
});

describe('YC7.4 · chữ trên S3', () => {
  it('YC7.4-NT4 chủ nhà đã nhập số giường: "2PN · 3 giường"; không có số khách', () => {
    const d = dongThongTinCan({ soPhongNgu: 2, soGiuong: 3, loaiView: 'bien', khuVuc: 'Bãi Cháy' });
    expect(d).toBe('2PN · 3 giường · view biển · Bãi Cháy');
    expect(d).not.toMatch(/khách/);
  });
  it('YC7.4-NT4 chưa nhập số giường thì chỉ "2PN"', () => {
    expect(dongThongTinCan({ soPhongNgu: 2, soGiuong: null, loaiView: null, khuVuc: null })).toBe('2PN');
  });
  it('YC7.4 bước 1 tên căn "ICON40 1509 · 2PN"', () => {
    expect(tieuDeCan({ maCan: '1509', tenToa: 'ICON40', soPhongNgu: 2 })).toBe('ICON40 1509 · 2PN');
    expect(tieuDeCan({ maCan: '3402', tenToa: null, soPhongNgu: null })).toBe('3402');
  });
  it('YC7.4 bước 2, 3, 6 chủ nhà, khoảng ngày, giờ', () => {
    expect(chuChuNha(2)).toBe('Chủ nhà · 2 căn');
    expect(chuKhoang('2026-10-10', '2026-10-12')).toBe('10/10 → 12/10 (2 đêm)');
    expect(chuGio('14:00', '12:00')).toBe('Nhận phòng 14:00 · Trả phòng 12:00');
  });
  it('YC7.4 bước 2 nút "Gọi" chỉ khi chủ nhà đã cho số', () => {
    expect(duongDanGoi('0900 000 001')).toBe('tel:0900000001');
    expect(duongDanGoi(null)).toBeNull();
    expect(duongDanGoi('')).toBeNull();
  });
  it('YC7.4 bước 5 YC7-H6 lịch 2 tuần: Kín, Trống, ngày đã qua để trống chữ; đêm khách hỏi được tô', () => {
    const lich = [
      { ngay: '2026-10-05', o: 'kin' as const }, { ngay: '2026-10-06', o: 'trong' as const },
      { ngay: '2026-10-10', o: 'trong' as const }, { ngay: '2026-10-12', o: 'trong' as const },
    ];
    const o = oHaiTuan(lich, '2026-10-07', { tu: '2026-10-10', den: '2026-10-12' });
    expect(o.map((x) => `${x.so}:${x.chu}:${x.khachHoi}`)).toEqual(['5:Kín:false', '6::false', '10:Trống:true', '12:Trống:false']);
    expect(oHaiTuan(lich, '2026-10-07', null).some((x) => x.khachHoi)).toBe(false);
  });
  it('YC7-H6 mở từ lịch 7 ngày: ngày đầu đang xem, 1 đêm, không tô ngày khách hỏi', () => {
    expect(khoangTuLich('2026-10-06')).toEqual({ tu: '2026-10-06', den: '2026-10-07', khachHoi: false });
  });
});
