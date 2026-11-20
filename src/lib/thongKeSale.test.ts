// Test unit chữ của S7 · Thống kê của sale (YC11.2, US59). Số theo DLM.6.
import { describe, expect, it } from 'vitest';
import {
  dongChinhChoChu, dongDatPhongThangTruoc, dongDoanhSoThangTruoc, dongPhuChoChu, dongSoSanhChenh, dongTienTheoChu,
  laThangTrong, thanhTheoChu, tieuDeTienChenh, type DongTheoChu, type YeuCauChoChu,
} from './thongKeSale';

const THEO_CHU: DongTheoChu[] = [
  { chuId: 'hoa', tuNhap: false, ten: 'Chị Hoa', doanhSo: 4_800_000, tienChenh: 800_000 },
  { chuId: 'tuan', tuNhap: false, ten: 'Anh Tuấn', doanhSo: 4_200_000, tienChenh: 600_000 },
  { chuId: null, tuNhap: true, ten: 'Chú Bình', doanhSo: 1_600_000, tienChenh: 200_000 },
];
const Y1: YeuCauChoChu = {
  yeuCauId: 'y1', canId: 'c2208', maCan: '2208', tenToa: 'À La Carte', ngayNhan: '2026-10-10', ngayTra: '2026-10-12',
  guiLuc: '2026-10-07T07:20:00+00:00', tenChu: 'Anh Tuấn',
};

describe('YC11.2 · chữ thống kê của sale', () => {
  it('YC11.2-NT1 "Tiền chênh tháng 10", "Tháng 9: 4", "Tháng 9: 9.800.000đ"', () => {
    expect(tieuDeTienChenh(10)).toBe('Tiền chênh tháng 10');
    expect(dongDatPhongThangTruoc(4, 10)).toBe('Tháng 9: 4');
    expect(dongDoanhSoThangTruoc(9_800_000, 10)).toBe('Tháng 9: 9.800.000đ');
    expect(dongDatPhongThangTruoc(2, 1)).toBe('Tháng 12: 2');
  });
  it('YC11.2-NT2 tháng 9 tiền chênh 1.200.000đ, tháng 10 1.600.000đ: "+33.3% so với tháng 9"', () => {
    expect(dongSoSanhChenh({ tienChenh: 1_600_000, tienChenhThangTruoc: 1_200_000 }, 10)).toBe('+33.3% so với tháng 9');
  });
  it('YC11.2-NT2 YC11 "So với tháng trước": giảm có dấu −; tháng trước 0đ thì không có dòng', () => {
    expect(dongSoSanhChenh({ tienChenh: 900_000, tienChenhThangTruoc: 1_200_000 }, 10)).toBe('−25.0% so với tháng 9');
    expect(dongSoSanhChenh({ tienChenh: 1_600_000, tienChenhThangTruoc: 0 }, 10)).toBeNull();
  });
  it('YC11.2-NT3 dòng theo chủ nhà "4.800.000đ · chênh 800.000đ"', () => {
    expect(THEO_CHU.map((d) => `${d.ten} ${dongTienTheoChu(d)}`)).toEqual([
      'Chị Hoa 4.800.000đ · chênh 800.000đ', 'Anh Tuấn 4.200.000đ · chênh 600.000đ', 'Chú Bình 1.600.000đ · chênh 200.000đ',
    ]);
  });
  it('YC11.2-NT3 canvas S7: thanh Chị Hoa 83.3% giá chủ + 16.7% chênh; Anh Tuấn 75% + 12.5%', () => {
    const h = thanhTheoChu(THEO_CHU, THEO_CHU[0]!);
    expect(h.giaChu).toBeCloseTo(83.333, 2);
    expect(h.chenh).toBeCloseTo(16.667, 2);
    expect(thanhTheoChu(THEO_CHU, THEO_CHU[1]!)).toEqual({ giaChu: 75, chenh: 12.5 });
  });
  it('YC11.2 bước 5: "À La Carte 2208 · 10/10 → 12/10", "Gửi 14:20 · Anh Tuấn chưa trả lời"', () => {
    expect(dongChinhChoChu(Y1)).toBe('À La Carte 2208 · 10/10 → 12/10');
    expect(dongPhuChoChu(Y1, '2026-10-07')).toBe('Gửi 14:20 · Anh Tuấn chưa trả lời');
    expect(dongPhuChoChu(Y1, '2026-10-08')).toBe('Gửi 14:20 ngày 07/10 · Anh Tuấn chưa trả lời');
  });
  it('YC11.2-NT8 tháng không có đặt phòng nào là S7-00', () => {
    expect(laThangTrong({ soDatPhong: 0, doanhSo: 0 })).toBe(true);
    expect(laThangTrong({ soDatPhong: 6, doanhSo: 10_600_000 })).toBe(false);
    expect(laThangTrong({ soDatPhong: 0, doanhSo: 1_250_000 })).toBe(false); // YC11.2-NT10: đêm vắt từ tháng trước
  });
});
