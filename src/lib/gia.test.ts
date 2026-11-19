// Test unit cho giá theo tháng (YC4.2, QT5.3): chữ ô tháng, tháng đã chọn, tên ô giá, luật kiểm giá, lưới lịch.
import { describe, expect, it } from 'vitest';
import {
  CAU_CAN_NHAP_GIA, CAU_CHUA_CHON_THANG, CAU_GIA_LON_HON_0, CAU_GIA_TOI_DA, chuDai, chuOThang, chuThang, congThang,
  dinhDangOGia, docSoTien, doiDemCuoiTuan, dongDangChon, giaDem, kiemGia, mauMotTuan, soOTrongDau, tenDemIso, tenDip, tenOGia, tenThangNgan, type DipGia,
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

describe('YC4.6 · đêm cuối tuần của chủ nhà', () => {
  it('YC4.6-NT1 chọn T6 và T7 thì ô giá ghi "Cuối tuần (T6, T7)" và "Ngày thường (CN–T5)"', () => {
    expect(tenOGia([5, 6])).toEqual({ thuong: 'Ngày thường (CN–T5)', cuoiTuan: 'Cuối tuần (T6, T7)' });
  });
  it('YC4.6-NT2 chọn T7 và CN thì ô giá ghi "Cuối tuần (T7, CN)" và "Ngày thường (T2–T6)"', () => {
    expect(tenOGia([6, 7])).toEqual({ thuong: 'Ngày thường (T2–T6)', cuoiTuan: 'Cuối tuần (T7, CN)' });
  });
  it('YC4.6-NT2 đêm 11/10 (CN) của 1509 có giá 1.300.000đ khi cuối tuần là T7, CN; đêm 09/10 (T6) về 900.000đ', () => {
    const g = { thuong: 900_000, cuoiTuan: 1_300_000 };
    expect(giaDem('2026-10-11', g, [], [6, 7])).toBe(1_300_000);
    expect(giaDem('2026-10-09', g, [], [6, 7])).toBe(900_000);
  });
  it('YC4.6-NT4 chỉ còn một đêm cuối tuần thì chip đó không tắt được', () => {
    expect(doiDemCuoiTuan([6], 6)).toEqual([6]);
    expect(doiDemCuoiTuan([7], 7)).toEqual([7]);
  });
  it('YC4.6 bước 2 chạm chip thì bật, tắt đêm đó; kết quả sắp xếp theo tuần', () => {
    expect(doiDemCuoiTuan([5, 6], 7)).toEqual([5, 6, 7]);
    expect(doiDemCuoiTuan([6, 7], 5)).toEqual([5, 6, 7]);
    expect(doiDemCuoiTuan([5, 6], 5)).toEqual([6]);
  });
  it('YC4.6 bước 2 tên chip T2 đến CN', () => {
    expect([1, 2, 3, 4, 5, 6, 7].map((d) => tenDemIso(d as 1))).toEqual(['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']);
  });
  it('YC4.6 bước 3 mẫu một tuần của tuần chứa 07/10/2026 (T4): T2 05/10 tới CN 11/10, T6 và T7 là 1,3tr, các đêm khác 900k', () => {
    const mau = mauMotTuan('2026-10-07', { '2026-10-01': { thuong: 900_000, cuoiTuan: 1_300_000 } }, [5, 6]);
    expect(mau.map((o) => o.dem)).toEqual(['2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09', '2026-10-10', '2026-10-11']);
    expect(mau.map((o) => o.gia)).toEqual([900_000, 900_000, 900_000, 900_000, 1_300_000, 1_300_000, 900_000]);
    expect(mau.filter((o) => o.laCuoiTuan).map((o) => o.ten)).toEqual(['T6', 'T7']);
  });
  it('YC4.6 bước 3 đổi lựa chọn sang T7, CN thì mẫu tính lại ngay: CN thành giá cuối tuần, T6 thành ngày thường', () => {
    const mau = mauMotTuan('2026-10-07', { '2026-10-01': { thuong: 900_000, cuoiTuan: 1_300_000 } }, [6, 7]);
    expect(mau.map((o) => o.gia)).toEqual([900_000, 900_000, 900_000, 900_000, 900_000, 1_300_000, 1_300_000]);
  });
  it('YC4.6 bước 3 hôm nay là Chủ nhật thì tuần vẫn bắt đầu từ T2 trước đó', () => {
    const mau = mauMotTuan('2026-10-11', { '2026-10-01': { thuong: 900_000, cuoiTuan: 1_300_000 } }, [5, 6]);
    expect(mau[0]!.dem).toBe('2026-10-05');
    expect(mau[6]!.dem).toBe('2026-10-11');
  });
  it('YC4.6 bước 3 tuần vắt qua hai tháng thì mỗi đêm lấy giá của tháng của nó; tháng chưa có giá thì null, không phải 0', () => {
    const mau = mauMotTuan('2026-10-28', { '2026-10-01': { thuong: 900_000, cuoiTuan: 1_300_000 } }, [5, 6]);
    expect(mau.map((o) => o.dem)).toEqual(['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01']);
    expect(mau.map((o) => o.gia)).toEqual([900_000, 900_000, 900_000, 900_000, 1_300_000, 1_300_000, null]);
  });
});
