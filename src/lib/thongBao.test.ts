// YC12.1, YC12.2: chữ dòng thông báo, giờ và nhóm ngày (US61, US62).
import { describe, expect, it } from 'vitest';
import { chuCuaThongBao, diemMoTuThongBao, gioThongBao, laHomNay, ngayNgan } from './thongBao';

describe('chữ dòng thông báo (YC12 "Các loại thông báo")', () => {
  it('YC12.1-NT1 dòng sửa B1: đổi ngày và giá chủ nhà', () => {
    const c = chuCuaThongBao({ loai: 'chu_sua_dat_phong', noiDung: {
      ten_chu: 'Chị Hoa', ten_toa: 'ICON40', ma_can: '1509', ten_toa_cu: 'ICON40', ma_can_cu: '1509',
      ngay_nhan_cu: '2026-10-10', ngay_tra_cu: '2026-10-12', ngay_nhan: '2026-10-11', ngay_tra: '2026-10-13',
      tien_phong_cu: 2200000, tien_phong: 1800000 } });
    expect(c.chinh).toBe('Chị Hoa đã sửa đặt phòng của bạn');
    expect(c.phu).toBe('ICON40 1509 · 10/10 → 12/10 đổi thành 11/10 → 13/10. Giá chủ nhà 2.200.000đ đổi thành 1.800.000đ');
  });
  it('yêu cầu bị từ chối không có tên sale nào (YC12.1-NT6)', () => {
    const c = chuCuaThongBao({ loai: 'yeu_cau_bi_tu_choi', noiDung: { ten_toa: 'Sapphire', ma_can: '1103', ngay_nhan: '2026-10-05', ngay_tra: '2026-10-06' } });
    expect(c).toEqual({ chinh: 'Yêu cầu đặt phòng bị từ chối', phu: 'Sapphire 1103 · 05/10 → 06/10' });
  });
  it('sale gửi yêu cầu: chỉ giá của chủ nhà', () => {
    const c = chuCuaThongBao({ loai: 'yeu_cau_moi', noiDung: { ten_sale: 'Sale Hùng', ma_can: '1509', ngay_nhan: '2026-10-10', ngay_tra: '2026-10-12', so_dem: 2, tong_gia_chu: 2200000 } });
    expect(c).toEqual({ chinh: 'Sale Hùng đặt phòng 1509', phu: '10/10 → 12/10 (2 đêm) · giá của bạn 2.200.000đ' });
  });
  it('YC12.3 nhắc chưa cọc', () => {
    const c = chuCuaThongBao({ loai: 'dat_phong_chua_coc', noiDung: { ten_sale: 'Sale Lan', ngay_nhan: '2026-10-17', ngay_tra: '2026-10-19', con_ngay: 3 } });
    expect(c).toEqual({ chinh: 'Đặt phòng chưa cọc', phu: 'Sale Lan · 17/10 → 19/10 · nhận phòng sau 3 ngày' });
  });
  it('loại lạ vẫn có chữ chung', () => {
    expect(chuCuaThongBao({ loai: 'loai_moi', noiDung: {} }).chinh).toBe('Thông báo mới');
  });
  it('ngày ngắn', () => { expect(ngayNgan('2026-10-04')).toBe('04/10'); expect(ngayNgan(null)).toBe(''); });
});

describe('giờ và nhóm (YC12.2 bước 1, giờ Việt Nam)', () => {
  const bayGio = new Date('2026-10-07T04:00:00Z'); // 11:00 ngày 07/10 giờ Việt Nam
  it('trong ngày: giờ', () => { expect(gioThongBao('2026-10-07T03:15:00Z', bayGio)).toBe('10:15'); });
  it('hôm qua', () => { expect(gioThongBao('2026-10-06T10:00:00Z', bayGio)).toBe('Hôm qua'); });
  it('cũ hơn: ngày/tháng', () => { expect(gioThongBao('2026-10-04T10:00:00Z', bayGio)).toBe('04/10'); });
  it('nhóm Hôm nay tính theo giờ Việt Nam, không theo UTC', () => {
    expect(laHomNay('2026-10-06T18:00:00Z', bayGio)).toBe(true); // 01:00 ngày 07/10 VN
    expect(laHomNay('2026-10-06T16:00:00Z', bayGio)).toBe(false); // 23:00 ngày 06/10 VN
  });
});

describe('màn mở khi chạm thông báo (YC12 cột "Chạm mở")', () => {
  it('YC12.2-NT2 yêu cầu bị từ chối mở S3-05 của đúng yêu cầu', () => {
    expect(diemMoTuThongBao({ loai: 'yeu_cau_bi_tu_choi', noiDung: {}, doiTuongId: 'Y4' }, 'sale')).toEqual({ kieu: 's3-ket-qua', yeuCauId: 'Y4' });
  });
  it('YC12.2-NT4 chủ ngừng cho xem mở S7-03', () => {
    expect(diemMoTuThongBao({ loai: 'chu_ngung_cho_xem', noiDung: {}, doiTuongId: 'k1' }, 'sale')).toEqual({ kieu: 's7-03' });
  });
  it('xin hủy: chủ mở chi tiết đặt phòng của chủ, sale mở chi tiết phía sale (YC5.9)', () => {
    const t = { loai: 'xin_huy', noiDung: {}, doiTuongId: 'b1' };
    expect(diemMoTuThongBao(t, 'chu_nha')).toEqual({ kieu: 'dat-phong-chu', id: 'b1' });
    expect(diemMoTuThongBao(t, 'sale')).toEqual({ kieu: 's3-dat-phong', id: 'b1' });
  });
  it('căn đã gửi có người đặt mở S3 của căn, kèm ngày', () => {
    expect(diemMoTuThongBao({ loai: 'can_da_gui_co_nguoi_dat', doiTuongId: 'c1', noiDung: { ten_toa: 'Sapphire', ma_can: '1103', ngay_nhan: '2026-10-10', ngay_tra: '2026-10-12' } }, 'sale'))
      .toEqual({ kieu: 's3-can', canId: 'c1', tenTam: 'Sapphire 1103', tu: '2026-10-10', den: '2026-10-12' });
  });
  it('loại lạ hay thiếu đối tượng: không mở màn nào', () => {
    expect(diemMoTuThongBao({ loai: 'loai_moi', noiDung: {}, doiTuongId: 'x' }, 'sale')).toBeNull();
    expect(diemMoTuThongBao({ loai: 'yeu_cau_moi', noiDung: {}, doiTuongId: null }, 'chu_nha')).toBeNull();
  });
});

describe('nhắc đặt phòng chưa cọc (YC12.3)', () => {
  it('chạm "Đặt phòng chưa cọc" mở chi tiết đặt phòng của chủ nhà (YC5.5)', () => {
    expect(diemMoTuThongBao({ loai: 'dat_phong_chua_coc', noiDung: {}, doiTuongId: 'b2' }, 'chu_nha')).toEqual({ kieu: 'dat-phong-chu', id: 'b2' });
  });
  it('đặt phòng khách lẻ (không có sale) ghi "Khách lẻ", không tên khách', () => {
    const c = chuCuaThongBao({ loai: 'dat_phong_chua_coc', noiDung: { ngay_nhan: '2026-10-17', ngay_tra: '2026-10-19', con_ngay: 2 } });
    expect(c.phu).toBe('Khách lẻ · 17/10 → 19/10 · nhận phòng sau 2 ngày');
  });
});
