// Test unit chữ và luật kiểm đặt phòng tự ghi (YC10.4, US57). Số theo DLM: Villa Tuần Châu, giá chủ 1.400.000đ, giá bán 1.600.000đ.
import { describe, expect, it } from 'vitest';
import {
  CAU_CAN_THU_KHACH, CAU_CAN_TRA_CHU, CAU_QUA_365_DEM, cacThang, cauDaLuu, cauGiaDienSan, chipNgayNhan, dongLoi, dongSoDem,
  kiemDatPhongTuGhi, phuDeDatPhong,
} from './datPhongTuGhi';

describe('YC10.4 · chữ và luật kiểm đặt phòng tự ghi', () => {
  it('YC10.4-NT1 ngày nhận 08/10 và 1 đêm thì dòng ghi "08/10 → 09/10 (1 đêm)"', () => {
    expect(dongSoDem('2026-10-08', 1)).toBe('08/10 → 09/10 (1 đêm)');
    expect(dongSoDem('2026-10-31', 2)).toBe('31/10 → 02/11 (2 đêm)');
  });

  it('YC10.4 bước 1, 2: phụ đề "Villa Tuần Châu · đã chốt với chú Bình", chip "Hôm nay 07/10", "Mai 08/10"', () => {
    expect(phuDeDatPhong('Villa Tuần Châu', 'Chú Bình')).toBe('Villa Tuần Châu · đã chốt với chú Bình');
    expect(chipNgayNhan('2026-10-07').map((c) => c.chu)).toEqual(['Hôm nay 07/10', 'Mai 08/10']);
    expect(chipNgayNhan('2026-10-31').map((c) => c.ngay)).toEqual(['2026-10-31', '2026-11-01']);
  });

  it('YC10.4-NT2 giá chủ 1.400.000đ, giá bán 1.600.000đ thì "Bạn lời 200.000đ"; ghi chú giá điền sẵn', () => {
    expect(dongLoi(1_400_000, 1_600_000)).toBe('Bạn lời 200.000đ');
    expect(cauGiaDienSan('Chú Bình')).toBe('Giá điền sẵn từ giá chủ đã lưu và giá bán của bạn. Sửa nếu chú Bình báo giá khác.');
    expect(dongLoi(null, 1_600_000)).toBeNull();
  });

  it('YC10.4-NT3 sửa "Thu khách" thành 1.700.000đ thì "Bạn lời 300.000đ"', () => {
    expect(dongLoi(1_400_000, 1_700_000)).toBe('Bạn lời 300.000đ');
  });

  it('YC10.4-NT4 toast "Đã lưu đặt phòng 08/10 → 09/10. Tính vào thống kê tháng 10."; qua hai tháng thì ghi cả hai (QT2.2)', () => {
    expect(cauDaLuu('2026-10-08', '2026-10-09')).toBe('Đã lưu đặt phòng 08/10 → 09/10. Tính vào thống kê tháng 10.');
    expect(cacThang('2026-11-30', '2026-12-02')).toBe('11 và 12');
    expect(cacThang('2026-10-31', '2026-11-01')).toBe('10');
  });

  it('YC10.4 Luật kiểm: tối đa 365 đêm, trả chủ và thu khách bắt buộc lớn hơn 0', () => {
    expect(kiemDatPhongTuGhi({ soDem: 1, traChu: 1_400_000, thuKhach: 1_600_000 })).toEqual({});
    expect(kiemDatPhongTuGhi({ soDem: 366, traChu: null, thuKhach: 0 }))
      .toEqual({ soDem: CAU_QUA_365_DEM, traChu: CAU_CAN_TRA_CHU, thuKhach: CAU_CAN_THU_KHACH });
    expect(CAU_QUA_365_DEM).toBe('Một đặt phòng dài tối đa 365 đêm');
    expect(CAU_CAN_TRA_CHU).toBe('Cần nhập tiền trả chủ');
    expect(CAU_CAN_THU_KHACH).toBe('Cần nhập tiền thu khách');
  });
});
