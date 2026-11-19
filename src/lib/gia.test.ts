// Test unit cho giá theo tháng (YC4.2, QT5.3): chữ ô tháng, tháng đã chọn, tên ô giá, luật kiểm giá, lưới lịch.
import { describe, expect, it } from 'vitest';
import {
  CAU_CAN_NHAP_GIA, CAU_CHUA_CHON_THANG, CAU_GIA_LON_HON_0, CAU_GIA_TOI_DA, chuDai, chuOThang, chuThang, congThang,
  dinhDangOGia, docSoTien, dongDangChon, giaDem, kiemGia, soOTrongDau, tenDip, tenOGia, tenThangNgan, type DipGia,
} from './gia';

const DIP_3402: DipGia[] = [{ id: 'd1', tuNgay: '2026-10-24', denNgay: '2026-10-25', ten: 'Dịp đặc biệt', gia: 1_300_000, laNgayLe: false }];
const GIA_3402 = { thuong: 800_000, cuoiTuan: 1_100_000 };

describe('YC4.2 · ô tháng và khoảng giá', () => {
  it('YC4.2-NT1 tháng 11, 12 của 3402 giá 800.000đ / 1.100.000đ thì ô tháng ghi "800k–1,1tr"', () => {
    expect(chuOThang(2026, 11, GIA_3402, DIP_3402, [5, 6])).toBe('800k–1,1tr');
    expect(chuOThang(2026, 12, GIA_3402, DIP_3402, [5, 6])).toBe('800k–1,1tr');
  });
  it('YC4.2-NT1 QT5.3 đêm 06/11 (T6) 1.100.000đ, đêm 09/11 (T2) 800.000đ', () => {
    expect(giaDem('2026-11-06', GIA_3402, DIP_3402, [5, 6])).toBe(1_100_000);
    expect(giaDem('2026-11-09', GIA_3402, DIP_3402, [5, 6])).toBe(800_000);
  });
  it('YC4.2 bước 1 tháng 10 có dịp 1,3tr thì ô tháng ghi "800k–1,3tr" như canvas CN6', () => {
    expect(chuOThang(2026, 10, GIA_3402, DIP_3402, [5, 6])).toBe('800k–1,3tr');
  });
  it('YC4.2-NT3 tháng chưa có giá thì "Chưa đặt"', () => {
    expect(chuOThang(2026, 1, null, DIP_3402, [5, 6])).toBe('Chưa đặt');
  });
  it('YC4.2 giá ngày thường bằng cuối tuần thì ô tháng ghi một số', () => {
    expect(chuOThang(2026, 11, { thuong: 700_000, cuoiTuan: 700_000 }, [], [5, 6])).toBe('700k');
  });
  it('QT5.3 đêm không có giá thì null, không phải 0', () => {
    expect(giaDem('2026-01-02', null, [], [5, 6])).toBeNull();
    expect(giaDem('2026-10-24', null, DIP_3402, [5, 6])).toBe(1_300_000);
  });
});

describe('YC4.2 bước 2 · tháng đang chọn', () => {
  it('YC4.2 bước 2 hai tháng liền nhau: "Đang chọn: Tháng 11 – 12 (2 tháng)"', () => {
    expect(dongDangChon([12, 11])).toBe('Đang chọn: Tháng 11 – 12 (2 tháng)');
    expect(chuThang([11, 12])).toBe('Tháng 11 – 12');
  });
  it('YC4.2 bước 2 một tháng, tháng rời nhau', () => {
    expect(chuThang([11])).toBe('Tháng 11');
    expect(dongDangChon([1, 3, 4, 5])).toBe('Đang chọn: Tháng 1, 3 – 5 (4 tháng)');
  });
  it('YC4.2-NT2 chưa chọn tháng nào thì câu nhắc', () => {
    expect(dongDangChon([])).toBe(CAU_CHUA_CHON_THANG);
    expect(CAU_CHUA_CHON_THANG).toBe('Chưa chọn tháng nào. Chọn một tháng bên trên sau đó nhập giá.');
  });
});

describe('YC4.2 bước 3 · tên hai ô giá theo đêm cuối tuần', () => {
  it('YC4.2 bước 3 mặc định "Ngày thường (CN–T5)", "Cuối tuần (T6, T7)"', () => {
    expect(tenOGia([5, 6])).toEqual({ thuong: 'Ngày thường (CN–T5)', cuoiTuan: 'Cuối tuần (T6, T7)' });
  });
  it('YC4.2 bước 3 cuối tuần chỉ đêm T7', () => {
    expect(tenOGia([6])).toEqual({ thuong: 'Ngày thường (CN–T6)', cuoiTuan: 'Cuối tuần (T7)' });
  });
  it('YC4.2 bước 3 cuối tuần T6, T7, CN', () => {
    expect(tenOGia([5, 6, 7])).toEqual({ thuong: 'Ngày thường (T2–T5)', cuoiTuan: 'Cuối tuần (T6–CN)' });
  });
  it('YC4.2 Quy tắc giá hai loại đêm: đêm cuối tuần theo cài đặt chủ nhà', () => {
    expect(giaDem('2026-11-06', GIA_3402, [], [6])).toBe(800_000);
    expect(giaDem('2026-11-07', GIA_3402, [], [6])).toBe(1_100_000);
  });
});

describe('YC4.2 Luật kiểm · hai ô giá', () => {
  it('YC4.2-NT8 ô trống thì "Cần nhập giá ngày thường và giá cuối tuần"', () => {
    expect(kiemGia('800.000', '')).toBe(CAU_CAN_NHAP_GIA);
    expect(kiemGia('', '1.100.000')).toBe(CAU_CAN_NHAP_GIA);
  });
  it('YC4.2-NT8 bằng 0 thì "Giá phải lớn hơn 0"', () => {
    expect(kiemGia('800.000', '0')).toBe(CAU_GIA_LON_HON_0);
  });
  it('YC4.2 Luật kiểm quá 100.000.000đ thì báo; đúng 100.000.000đ thì qua', () => {
    expect(kiemGia('100.000.001', '1')).toBe(CAU_GIA_TOI_DA);
    expect(kiemGia('100.000.000', '100.000.000')).toBeNull();
  });
  it('YC4.2 Luật kiểm số nguyên đồng: gõ "800.000" đọc ra 800000; ô viết lại có dấu chấm', () => {
    expect(docSoTien('800.000')).toBe(800_000);
    expect(docSoTien('')).toBeNull();
    expect(dinhDangOGia('1100000')).toBe('1.100.000');
    expect(dinhDangOGia('0800k')).toBe('800');
  });
});

describe('YC4.2 bước 6 · lưới lịch giá', () => {
  it('YC4.2 bước 6 tuần bắt đầu thứ Hai: 01/10/2026 (T5) có 3 ô trống đầu', () => {
    expect(soOTrongDau(2026, 10)).toBe(3);
    expect(soOTrongDau(2026, 6)).toBe(0); // 01/06/2026 là T2
  });
  it('YC4.2 bước 6 nút chuyển tháng "T09", "T11"; qua năm', () => {
    expect(tenThangNgan(9)).toBe('T09');
    expect(congThang(2026, 12, 1)).toEqual([2027, 1]);
    expect(congThang(2026, 1, -1)).toEqual([2025, 12]);
  });
  it('YC4 Quy tắc tên dịp tự đặt và chữ dải', () => {
    expect(chuDai('2026-04-30', '2026-05-01')).toBe('30/04 – 01/05');
    expect(tenDip({ ...DIP_3402[0]!, ten: null })).toBe('Dịp đặc biệt 24/10 – 25/10');
  });
});
