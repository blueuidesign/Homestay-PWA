// Test unit phần tính của lịch tháng (YC2.1, QT2). Số theo DLM.4 (booking của Chị Hoa).
import { describe, expect, it } from 'vitest';
import {
  canCoKhach, chuChipTatCa, chuNguoiDat, chuTien, demTheoCan, dongCuaNgay, khoangNgay, khoangThang, mauCan, nhanO,
  tenThang, tieuDeNgay, vietSoDienThoai, type DatPhongLich,
} from './lich';

const b = (id: string, canId: string, ngayNhan: string, ngayTra: string): DatPhongLich => ({ id, canId, ngayNhan, ngayTra });

// DLM.4: c1509, c3402.
const DLM4: DatPhongLich[] = [
  b('B1', 'c1509', '2026-10-10', '2026-10-12'),
  b('B2', 'c3402', '2026-10-17', '2026-10-19'),
  b('B3', 'c1509', '2026-10-04', '2026-10-06'),
  b('B4', 'c3402', '2026-10-05', '2026-10-07'),
  b('B5', 'c1509', '2026-10-13', '2026-10-15'),
  b('B6', 'c3402', '2026-10-14', '2026-10-15'),
  b('B7', 'c1509', '2026-10-19', '2026-10-20'),
  b('B8', 'c3402', '2026-10-21', '2026-10-22'),
  b('B9', 'c3402', '2026-11-30', '2026-12-02'),
];

describe('YC2.1 · chip lọc theo căn', () => {
  it('YC2.1-NT1 có 2 căn thì chip đầu là "Cả 2 phòng"', () => {
    expect(chuChipTatCa(2)).toBe('Cả 2 phòng');
  });
  it('YC2.1-NT2 có 3 căn thì chip đầu là "Tất cả"; từ 3 căn trở lên vẫn "Tất cả"', () => {
    expect(chuChipTatCa(3)).toBe('Tất cả');
    expect(chuChipTatCa(5)).toBe('Tất cả');
  });
  it('YC2.1 bước 3 có 1 căn thì không có hàng chip', () => {
    expect(chuChipTatCa(1)).toBeNull();
    expect(chuChipTatCa(0)).toBeNull();
  });
});

describe('QT2 · đêm có khách trên lưới tháng', () => {
  it('YC2.1-NT3 QT2.1-VD1 B1 10/10 → 12/10: đêm 10/10, 11/10 của 1509; 12/10 không', () => {
    const m = demTheoCan([DLM4[0]!], 2026, 10);
    expect(canCoKhach(m, '2026-10-10', null)).toEqual(['c1509']);
    expect(canCoKhach(m, '2026-10-11', null)).toEqual(['c1509']);
    expect(canCoKhach(m, '2026-10-12', null)).toEqual([]);
  });

  it('QT2.1-VD2 B6 14/10 → 15/10 chỉ có đêm 14/10', () => {
    const m = demTheoCan([DLM4[5]!], 2026, 10);
    expect(canCoKhach(m, '2026-10-14', null)).toEqual(['c3402']);
    expect(canCoKhach(m, '2026-10-15', null)).toEqual([]);
  });

  it('YC2.1 bước 2 ngày có khách ở hai căn thì ô có cả hai căn (05/10)', () => {
    const m = demTheoCan(DLM4, 2026, 10);
    expect(canCoKhach(m, '2026-10-05', null).sort()).toEqual(['c1509', 'c3402']);
  });

  it('YC2.1-NT4 lọc 3402 thì chỉ còn đêm 05, 06, 14, 17, 18, 21/10; không có đêm của 1509', () => {
    const m = demTheoCan(DLM4, 2026, 10);
    const dem: string[] = [];
    for (let d = 1; d <= 31; d++) {
      const ngay = `2026-10-${String(d).padStart(2, '0')}`;
      if (canCoKhach(m, ngay, 'c3402').length) dem.push(ngay.slice(8));
      expect(canCoKhach(m, ngay, 'c3402')).not.toContain('c1509');
    }
    expect(dem).toEqual(['05', '06', '14', '17', '18', '21']);
  });

  it('YC2.1-NT5 QT2.2-VD1 B9 30/11 → 02/12: tháng 11 có đêm 30/11, tháng 12 có đêm 01/12', () => {
    const t11 = demTheoCan(DLM4, 2026, 11);
    expect(canCoKhach(t11, '2026-11-30', null)).toEqual(['c3402']);
    const t12 = demTheoCan(DLM4, 2026, 12);
    expect(canCoKhach(t12, '2026-12-01', null)).toEqual(['c3402']);
    expect(canCoKhach(t12, '2026-12-02', null)).toEqual([]);
  });

  it('QT2.2-VD2 tháng 10 của Chị Hoa có 13 đêm có khách', () => {
    const m = demTheoCan(DLM4, 2026, 10);
    let n = 0;
    for (const s of m.values()) n += s.size;
    expect(n).toBe(13);
  });
});

describe('YC2.1 · tháng và nhãn', () => {
  it('YC2.1 bước 1 tiêu đề "Tháng 10/2026"', () => {
    expect(tenThang(2026, 10)).toBe('Tháng 10/2026');
    expect(tenThang(2027, 1)).toBe('Tháng 1/2027');
  });
  it('YC2.1 bước 1 khoảng đọc của tháng: từ ngày 1 tới trước ngày 1 tháng sau', () => {
    expect(khoangThang(2026, 10)).toEqual({ tu: '2026-10-01', den: '2026-11-01' });
    expect(khoangThang(2026, 12)).toEqual({ tu: '2026-12-01', den: '2027-01-01' });
  });
  it('Màu theo căn: mỗi căn một màu, 1509 xanh, 3402 cam, 2501 tím như canvas', () => {
    expect(mauCan(0)).toBe('#0ea5e9');
    expect(mauCan(1)).toBe('#f97316');
    expect(mauCan(2)).toBe('#8b5cf6');
    const tam = Array.from({ length: 8 }, (_, i) => mauCan(i));
    expect(new Set(tam).size).toBe(8);
  });
  it('Nhãn ô ngày đọc được bằng trình đọc màn hình', () => {
    expect(nhanO(5, ['1509', '3402'])).toBe('Ngày 5, đã đặt phòng 1509, 3402');
    expect(nhanO(1, [])).toBe('Ngày 1, trống');
  });
});

describe('YC2.2 · chi tiết một ngày', () => {
  it('YC2.2 bước 7 tiêu đề "Ngày 10/10/2026"', () => {
    expect(tieuDeNgay('2026-10-10')).toBe('Ngày 10/10/2026');
    expect(tieuDeNgay('2026-11-01')).toBe('Ngày 01/11/2026');
  });
  it('YC2.2 bước 8 QT2.1-VD1 khoảng ngày "10/10 → 12/10 (2 đêm)"; QT2.2-VD1 qua tháng', () => {
    expect(khoangNgay('2026-10-10', '2026-10-12')).toBe('10/10 → 12/10 (2 đêm)');
    expect(khoangNgay('2026-10-14', '2026-10-15')).toBe('14/10 → 15/10 (1 đêm)');
    expect(khoangNgay('2026-11-30', '2026-12-02')).toBe('30/11 → 02/12 (2 đêm)');
  });
  it('YC2.2 bước 8 QT6.1 tiền: cọc, chưa cọc, đã thanh toán; không có trạng thái tiền thì chỉ tiền phòng', () => {
    expect(chuTien(2200000, 'da_coc', 1000000)).toBe('2.200.000đ · Cọc: 1.000.000đ');
    expect(chuTien(1800000, 'chua_coc', null)).toBe('1.800.000đ · Chưa cọc');
    expect(chuTien(1600000, 'da_thanh_toan', null)).toBe('1.600.000đ · Đã thanh toán');
    expect(chuTien(800000, null, null)).toBe('800.000đ');
  });
  it('YC2.2 bước 8 người đặt: tên sale, tên khách chủ nhà nhập, hoặc "Khách lẻ"', () => {
    expect(chuNguoiDat({ loai: 'sale', ten: 'Sale Hùng', sdt: '0912345678' })).toBe('Sale Hùng');
    expect(chuNguoiDat({ loai: 'khach', ten: 'Chị Mai' })).toBe('Chị Mai');
    expect(chuNguoiDat({ loai: 'le' })).toBe('Khách lẻ');
    expect(chuNguoiDat(undefined)).toBe('Khách lẻ');
    expect(chuNguoiDat({ loai: 'sale', ten: null, sdt: null })).toBe('Sale');
  });
  it('YC2.2 bước 8 số điện thoại sale viết "0912 345 678"', () => {
    expect(vietSoDienThoai('0912345678')).toBe('0912 345 678');
    expect(vietSoDienThoai('+84912')).toBe('+84912');
  });
  it('YC2.2 bước 7, 8, 10 mỗi căn (theo chip) một dòng: 10/10 có B1 ở 1509, 3402 trống; ngày trả không tính', () => {
    const can = [{ id: 'c1509', maCan: '1509' }, { id: 'c3402', maCan: '3402' }];
    const d = dongCuaNgay(DLM4, can, '2026-10-10');
    expect(d.map((x) => [x.can.maCan, x.datPhong?.id ?? null])).toEqual([['1509', 'B1'], ['3402', null]]);
    expect(dongCuaNgay(DLM4, can, '2026-10-12').map((x) => x.datPhong?.id ?? null)).toEqual([null, null]);
    expect(dongCuaNgay(DLM4, [can[1]!], '2026-10-05').map((x) => [x.can.maCan, x.datPhong?.id])).toEqual([['3402', 'B4']]);
  });
});
