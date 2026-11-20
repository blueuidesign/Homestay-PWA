// Test unit chữ của S6-04 (YC10.2, US55).
import { describe, expect, it } from 'vitest';
import {
  cauGiaiThichBo, chuDaBan, chuLyDo, chuTienChenh, chuTuCapNhat, chuXacNhanBo, dongPhuChuNha, dongQuyen, phuCanChuNha,
  tenCanChuNha, tieuDeQuyen,
} from './chiTietChuNha';

const C1509 = { canId: 'c1509', maCan: '1509', tenToa: 'ICON40', soPhongNgu: 2, soGiuong: 3, loaiView: 'bien', giaDem: 1_800_000 };

describe('YC10.2 · chữ S6-04', () => {
  it('YC10.2 bước 1 dòng phụ: số và ngày kết nối; chưa có số thì chỉ ngày', () => {
    expect(dongPhuChuNha({ soDienThoai: '0904118772', ketNoiTu: '2026-08-02' })).toBe('0904 118 772 · kết nối từ 02/08/2026');
    expect(dongPhuChuNha({ soDienThoai: null, ketNoiTu: '2026-08-02' })).toBe('kết nối từ 02/08/2026');
  });

  it('YC10.2 bước 1 "✓ Lịch tự cập nhật · lần cuối 2 giờ trước"', () => {
    const bayGio = new Date('2026-11-20T10:00:00Z');
    expect(chuTuCapNhat('2026-11-20T08:00:00Z', bayGio)).toBe('✓ Lịch tự cập nhật · lần cuối 2 giờ trước');
    expect(chuTuCapNhat(null, bayGio)).toBeNull();
  });

  it('YC10.2-NT2 quyền: "Đã cọc hay chưa" chỉ khi chủ bật', () => {
    expect(tieuDeQuyen('Chị Hoa')).toBe('Chị Hoa cho bạn xem');
    expect(dongQuyen(true)).toEqual(['Phòng trống hay đã đặt', 'Giá từng đêm', 'Đã cọc hay chưa']);
    expect(dongQuyen(false)).toEqual(['Phòng trống hay đã đặt', 'Giá từng đêm']);
  });

  it('YC10.2-NT1 dòng căn có giá đêm; chưa đặt giá thì không có giá', () => {
    expect(tenCanChuNha(C1509)).toBe('ICON40 1509');
    expect(phuCanChuNha(C1509)).toBe('2PN · 3 giường · view biển · 1.800.000đ/đêm');
    expect(phuCanChuNha({ ...C1509, maCan: '3402', tenToa: null, soPhongNgu: 1, soGiuong: null, giaDem: 1_100_000 }))
      .toBe('1PN · view biển · 1.100.000đ/đêm');
    expect(phuCanChuNha({ ...C1509, giaDem: null })).toBe('2PN · 3 giường · view biển');
  });

  it('YC10.2 bước 4 kết quả bán và tiền chênh', () => {
    expect(chuDaBan(12)).toBe('12 đặt phòng');
    expect(chuTienChenh(6_400_000)).toBe('6,4tr');
    expect(chuTienChenh(400_000)).toBe('400k');
    expect(chuTienChenh(0)).toBe('0k');
    expect(chuTienChenh(-200_000)).toBe('-200k');
  });

  it('YC10.2-NT3 chữ xác nhận bỏ nguồn', () => {
    expect(chuXacNhanBo('Chị Hoa')).toBe('Xác nhận bỏ Chị Hoa?');
    expect(cauGiaiThichBo('Chị Hoa')).toBe('Bạn không thấy lịch của Chị Hoa nữa. Muốn xem lại phải xin link mới.');
  });

  it('YC10.2-NT7 lý do không còn xem được', () => {
    expect(chuLyDo('chu_ngung')).toBe('Chủ nhà đã ngừng chia sẻ lịch');
    expect(chuLyDo('chu_xoa_tai_khoan')).toBe('Chủ nhà đã xóa tài khoản');
  });
});
