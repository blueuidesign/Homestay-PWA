// Test unit chữ và luật của yêu cầu đặt phòng phía sale (YC9.1, US50).
import { describe, expect, it } from 'vitest';
import {
  CAU_DA_DAT, CAU_DA_HUY_CN9, chuChoChu, chuDaGuiLuc, chuDaHuy, chuDemKin, chuDongChu, chuTomTat, docChuXem, docYeuCau,
  duongDanZalo, kiemLoiNhan, loiNhanGui, oQuanhKhoang,
} from './yeuCau';

const JSON_Y1 = {
  id: 'y1', can_id: 'c1509', ma_can: '1509', ten_toa: 'ICON40', so_phong_ngu: 2,
  chu: { ten: 'Chị Hoa', so_dien_thoai: '0900000001', da_xoa: false },
  ngay_nhan: '2026-10-10', ngay_tra: '2026-10-12', so_dem: 2,
  dem: [{ ngay: '2026-10-10', gia_chu: 1300000, gia_ban: 1500000 }, { ngay: '2026-10-11', gia_chu: 900000, gia_ban: 1100000 }],
  tong_gia_chu: 2200000, tong_gia_ban: '2600000', loi_nhan: null, trang_thai: 'cho', ly_do_tu_choi: null,
  gui_luc: '2026-10-06T07:20:00+00:00', han_luc: '2026-10-20T07:20:00+00:00',
};

describe('YC9.1 · chữ yêu cầu đặt phòng', () => {
  it('YC9.1-NT3 đọc cả giá bán cho khách và giá chủ nhà', () => {
    const y = docYeuCau(JSON_Y1);
    expect([y.tongGiaBan, y.tongGiaChu]).toEqual([2_600_000, 2_200_000]);
    expect(y.chu).toEqual({ ten: 'Chị Hoa', soDienThoai: '0900000001', daXoa: false });
    expect(y.trangThai).toBe('cho');
    expect(chuDongChu('Chị Hoa', '2026-10-10', '2026-10-12')).toBe('Chị Hoa · 10/10 → 12/10 (2 đêm)');
    expect(chuTomTat({ tenToa: 'ICON40', maCan: '1509' }, '2026-10-10', '2026-10-12')).toBe('ICON40 1509 · 10/10 → 12/10');
  });

  it('YC9.1-NT1 S3-03 ghi giờ đã gửi theo giờ Việt Nam', () => {
    expect(chuChoChu('Chị Hoa')).toBe('Đang chờ Chị Hoa chấp nhận');
    expect(chuDaGuiLuc('2026-10-06T07:20:00+00:00'))
      .toBe('Đã gửi lúc 14:20 trong app. Nhắn thêm qua Zalo để chủ nhà thấy nhanh hơn. Bạn được báo khi chủ nhà chấp nhận hoặc từ chối.');
  });

  it('YC9.1 bước 3 pwa.md P5 "Nhắn chủ nhà qua Zalo" mở https://zalo.me/<số>', () => {
    expect(duongDanZalo('0900 000 001')).toBe('https://zalo.me/0900000001');
    expect(duongDanZalo(null)).toBeNull();
    expect(duongDanZalo('  ')).toBeNull();
  });

  it('YC9.1-NT5 S3-07 ghi các đêm vừa có người đặt', () => {
    expect(CAU_DA_DAT).toBe('Căn này đã được đặt rồi');
    expect(chuDemKin(['2026-10-10', '2026-10-11'])).toBe('Đêm 10/10 và 11/10 vừa có người đặt. Yêu cầu chưa được gửi.');
    expect(chuDemKin(['2026-10-10'])).toBe('Đêm 10/10 vừa có người đặt. Yêu cầu chưa được gửi.');
    expect(chuDemKin(['2026-10-10', '2026-10-11', '2026-10-12'])).toBe('Đêm 10/10, 11/10 và 12/10 vừa có người đặt. Yêu cầu chưa được gửi.');
    expect(chuDemKin([])).toBe('Yêu cầu chưa được gửi.');
  });

  it('YC9.1-NT5 S3-07 lịch tải lại: ngày trước, các đêm hỏi, ngày trả; đêm kín ghi "Kín", còn lại giá chủ gọn', () => {
    const o = oQuanhKhoang(
      [{ ngay: '2026-10-09', o: 'trong' }, { ngay: '2026-10-10', o: 'kin' }, { ngay: '2026-10-11', o: 'kin' }, { ngay: '2026-10-12', o: 'trong' }],
      [{ ngay: '2026-10-09', giaChu: 1_300_000 }, { ngay: '2026-10-10', giaChu: 1_300_000 }, { ngay: '2026-10-11', giaChu: 900_000 }, { ngay: '2026-10-12', giaChu: 900_000 }],
      '2026-10-10', '2026-10-12',
    );
    expect(o.map((x) => `${x.thu} ${x.so} ${x.chu}`)).toEqual(['T6 09 1,3tr', 'T7 10 Kín', 'CN 11 Kín', 'T2 12 900k']);
    expect(o.map((x) => x.kin)).toEqual([false, true, true, false]);
  });

  it('YC9.1 Luật kiểm lời nhắn: tối đa 500 ký tự; toàn khoảng trắng coi như trống', () => {
    expect(kiemLoiNhan('a'.repeat(500))).toBeNull();
    expect(kiemLoiNhan('a'.repeat(501))).toBe('Lời nhắn tối đa 500 ký tự');
    expect(loiNhanGui('   ')).toBeNull();
    expect(loiNhanGui('  Khách tới muộn ')).toBe('Khách tới muộn');
  });

  it('YC9.1-NT7 S3-08 "Đã hủy yêu cầu"', () => {
    expect(chuDaHuy('Chị Hoa', '2026-10-10', '2026-10-12'))
      .toBe('Bạn đã hủy yêu cầu đặt phòng 10/10 → 12/10. Chị Hoa không còn thấy yêu cầu này.');
    expect(docYeuCau({ ...JSON_Y1, trang_thai: 'da_huy' }).trangThai).toBe('da_huy');
  });

  it('YC9.1-NT13 CN9 mở yêu cầu đã hủy: chỉ "Sale đã hủy yêu cầu này.", không ngày, giá, lời nhắn', () => {
    const x = docChuXem({ id: 'y1', trang_thai: 'da_huy' });
    expect(x).toEqual({ id: 'y1', daHuy: true, chu: CAU_DA_HUY_CN9 });
    expect(CAU_DA_HUY_CN9).toBe('Sale đã hủy yêu cầu này.');
    // Dữ liệu lạ có ngày, giá đi kèm cũng không mang sang màn.
    expect(docChuXem({ id: 'y1', trang_thai: 'da_huy', ngay_nhan: '2026-10-10', tong_gia_chu: 2200000, loi_nhan: 'x' }))
      .toEqual({ id: 'y1', daHuy: true, chu: CAU_DA_HUY_CN9 });
    expect(docChuXem({ id: 'y1', trang_thai: 'cho' })).toEqual({ id: 'y1', daHuy: false, chu: null });
  });
});
