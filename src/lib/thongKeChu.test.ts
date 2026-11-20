// Test unit chữ của thống kê chủ nhà CN8, CN8-00 (YC11.1, US58). Số theo DLM.5 và canvas CN8.
import { describe, expect, it } from 'vitest';
import {
  chuaThuGap, chuCongSuat, chuDemCoKhach, cotBieuDo, doDaiThanh, dongChinhChuaThu, dongDuoiDoanhThu, dongPhuChuaThu,
  dongSoSanh, tenNguoiBan, tenThangThongKe, tieuDeDoanhThuThang, type DongChuaThu, type ThongKeThang,
} from './thongKeChu';
import { docThongKe } from './dichVuThongKeChu';

const B2: DongChuaThu = {
  bookingId: 'b2', canId: 'c3402', maCan: '3402', saleId: 'lan', ten: 'Sale Lan', khachLe: false,
  ngayNhan: '2026-10-17', ngayTra: '2026-10-19', trangThaiTien: 'chua_coc', soTien: 1_900_000, conNgay: 10,
};

describe('YC11.1 · chữ trên CN8', () => {
  it('YC11.1-NT1 tiêu đề tháng và thẻ doanh thu', () => {
    expect(tenThangThongKe(2026, 10)).toBe('Tháng 10/2026');
    expect(tieuDeDoanhThuThang(10)).toBe('Doanh thu tháng 10');
  });
  it('YC11.1-NT3 tháng 9 là 9.600.000đ và tháng 10 là 11.800.000đ thì "+22.9% so với tháng 9"', () => {
    expect(dongSoSanh(11_800_000, 9_600_000, 10)).toBe('+22.9% so với tháng 9');
  });
  it('YC11 "So với tháng trước": giảm thì dấu −, tháng 1 so với tháng 12, tháng trước 0 thì không có dòng', () => {
    expect(dongSoSanh(9_600_000, 11_800_000, 11)).toBe('−18.6% so với tháng 10');
    expect(dongSoSanh(1_000_000, 1_000_000, 1)).toBe('+0.0% so với tháng 12');
    expect(dongSoSanh(1_000_000, 0, 5)).toBeNull();
    expect(dongSoSanh(900_000, 4_800_000, 6)).toBe('−81.3% so với tháng 5'); // −81.25: nửa làm tròn xa số 0
  });
  it('YC11.1-NT2 13 đêm có khách trên 2 căn: "13/62" và "21.0%"', () => {
    expect(chuDemCoKhach(13, 62)).toBe('13/62');
    expect(chuCongSuat(13, 21)).toBe('21.0%');
    expect(chuCongSuat(1, 1.7)).toBe('1.7%');
  });
  it('YC11.1-NT11 tháng chưa có đặt phòng: đêm có khách 0, công suất 0%, dòng "Chưa có đặt phòng", không có so sánh', () => {
    expect(chuDemCoKhach(0, 62)).toBe('0');
    expect(chuCongSuat(0, 0)).toBe('0%');
    const tk = { soDem: 0, doanhThu: 0, doanhThuThangTruoc: 800_000 } as ThongKeThang;
    expect(dongDuoiDoanhThu(tk, 12)).toBe('Chưa có đặt phòng');
  });
  it('YC11.1-NT6 cột biểu đồ: số rút gọn, cột tháng đang xem đậm, tháng 0đ không có thanh, không có số', () => {
    const cot = cotBieuDo([
      { thang: '2026-05-01', doanhThu: 0 }, { thang: '2026-06-01', doanhThu: 8_900_000 },
      { thang: '2026-07-01', doanhThu: 13_400_000 }, { thang: '2026-08-01', doanhThu: 14_100_000 },
      { thang: '2026-09-01', doanhThu: 9_600_000 }, { thang: '2026-10-01', doanhThu: 11_800_000 },
    ], '2026-10-01');
    expect(cot.map((c) => c.nhan)).toEqual(['T5', 'T6', 'T7', 'T8', 'T9', 'T10']);
    expect(cot.map((c) => c.so)).toEqual([null, '8.9tr', '13.4tr', '14.1tr', '9.6tr', '11.8tr']);
    expect(cot[0]!.cao).toBe(0);
    expect(cot[3]!.cao).toBe(100);
    expect(cot.map((c) => c.dangXem)).toEqual([false, false, false, false, false, true]);
  });
  it('YC11.1-NT7 tên người bán, khách lẻ ghi "Khách lẻ"; thanh dài nhất là người bán nhiều nhất', () => {
    expect(tenNguoiBan({ ten: 'Sale Hùng', khachLe: false })).toBe('Sale Hùng');
    expect(tenNguoiBan({ ten: null, khachLe: true })).toBe('Khách lẻ');
    const ds = [{ saleId: 'h', ten: 'Sale Hùng', khachLe: false, doanhThu: 4_000_000 },
      { saleId: 'l', ten: 'Sale Lan', khachLe: false, doanhThu: 3_500_000 }];
    expect(doDaiThanh(ds, 4_000_000)).toBe(100);
    expect(doDaiThanh(ds, 3_500_000)).toBe(87.5);
  });
  it('YC11.1-NT9 B2 ghi "Sale Lan · 17/10 → 19/10", "Chưa cọc · nhận phòng sau 10 ngày"', () => {
    expect(dongChinhChuaThu(B2)).toBe('Sale Lan · 17/10 → 19/10');
    expect(dongPhuChuaThu(B2)).toBe('Chưa cọc · nhận phòng sau 10 ngày');
    expect(chuaThuGap(B2)).toBe(false);
    expect(chuaThuGap({ ...B2, conNgay: 6 })).toBe(true);
  });
  it('YC11.1 bước 7: nhận hôm nay, đã qua ngày nhận', () => {
    expect(dongPhuChuaThu({ ...B2, conNgay: 0 })).toBe('Chưa cọc · nhận phòng hôm nay');
    expect(dongPhuChuaThu({ ...B2, conNgay: -2 })).toBe('Chưa cọc · đã nhận phòng');
    expect(dongChinhChuaThu({ ...B2, saleId: null, ten: null, khachLe: true })).toBe('Khách lẻ · 17/10 → 19/10');
  });
});

describe('YC11.1 · đọc dữ liệu fn_thong_ke_chu', () => {
  it('YC11.1-NT1 đổi tên cột, số tiền thành số', () => {
    const tk = docThongKe({
      thang: '2026-10-01', hom_nay: '2026-10-07', doanh_thu: 11800000, doanh_thu_thang_truoc: 9600000, so_dem: 13, mau_so: 62,
      cong_suat: 21.0, can: [{ can_id: 'c1509', ma_can: '1509', doanh_thu: 6700000, so_dem: 7, da_an: false }],
      cac_thang: [{ thang: '2026-10-01', doanh_thu: 11800000 }],
      nguoi_ban: [{ sale_id: null, ten: null, khach_le: true, doanh_thu: 2600000 }],
      chua_thu: [{ booking_id: 'b2', can_id: 'c3402', ma_can: '3402', sale_id: 'lan', ten: 'Sale Lan', khach_le: false,
        ngay_nhan: '2026-10-17', ngay_tra: '2026-10-19', trang_thai_tien: 'chua_coc', so_tien: 1900000, con_ngay: 10 }],
      tong_chua_thu: 1900000,
    });
    expect(tk.doanhThu).toBe(11_800_000);
    expect(tk.can[0]).toEqual({ canId: 'c1509', maCan: '1509', doanhThu: 6_700_000, soDem: 7, daAn: false });
    expect(tk.nguoiBan[0]).toEqual({ saleId: null, ten: null, khachLe: true, doanhThu: 2_600_000 });
    expect(tk.chuaThu[0]).toEqual(B2);
    expect(tk.tongChuaThu).toBe(1_900_000);
  });
});
