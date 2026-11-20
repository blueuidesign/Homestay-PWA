// Test unit hàm thuần của tab Cá nhân (YC1.3).
import { describe, expect, it } from 'vitest';
import { chuCaiDau, chuDemCuoiTuan, chuGioMenu, chuMucCongMenu, nhomMenu, soLoaiDangBat, tenHienCaNhan, type TongQuanCaNhan } from './caNhan';

const TQ: TongQuanCaNhan = {
  ten: 'Nguyễn Thị Hoa', tenHienThi: 'Chị Hoa', soDienThoai: '0904118772', email: 'hoa@vidu.test', soChuaDoc: 2,
  gioNhan: '14:00', gioTra: '12:00', demCuoiTuan: [5, 6], mucCong: 400_000, thongBaoTat: [],
};
const tieuDe = (vai: 'chu_nha' | 'sale', tq = TQ) => nhomMenu(vai, tq).map((n) => n.tieuDe);
const dong = (vai: 'chu_nha' | 'sale', khoa: string, tq = TQ) =>
  nhomMenu(vai, tq).flatMap((n) => n.dong).find((d) => d.khoa === khoa);

describe('YC1.3 · tab Cá nhân (hàm thuần)', () => {
  it('YC1.3-NT1 chủ nhà thấy TÀI KHOẢN, CÀI ĐẶT, DỮ LIỆU, HỖ TRỢ, không thấy BÁN PHÒNG', () => {
    expect(tieuDe('chu_nha')).toEqual(['Tài khoản', 'Cài đặt', 'Dữ liệu', 'Hỗ trợ']);
  });

  it('YC1.3-NT1 sale thấy TÀI KHOẢN, BÁN PHÒNG, CÀI ĐẶT, HỖ TRỢ, không thấy DỮ LIỆU và không có "Đội nhóm"', () => {
    expect(tieuDe('sale')).toEqual(['Tài khoản', 'Bán phòng', 'Cài đặt', 'Hỗ trợ']);
    expect(dong('sale', 'xuat-csv')).toBeUndefined();
    expect(nhomMenu('sale', TQ).flatMap((n) => n.dong).some((d) => /đội nhóm/i.test(d.nhan))).toBe(false);
  });

  it('YC1.3-NT2 có 2 thông báo chưa đọc thì dòng "Thông báo" ghi 2', () => {
    expect(dong('chu_nha', 'thong-bao')?.so).toBe(2);
  });

  it('YC1.3-NT2 chủ nhà bật 3 loại thì "Cài đặt thông báo" ghi "3 loại đang bật"; tắt một loại thì còn 2', () => {
    expect(dong('chu_nha', 'cai-dat-thong-bao')?.phu).toBe('3 loại đang bật');
    expect(dong('chu_nha', 'cai-dat-thong-bao', { ...TQ, thongBaoTat: ['yeu_cau_moi'] })?.phu).toBe('2 loại đang bật');
    expect(dong('sale', 'cai-dat-thong-bao')?.phu).toBe('4 loại đang bật');
    expect(dong('sale', 'cai-dat-thong-bao', { ...TQ, thongBaoTat: ['can_da_gui_co_nguoi_dat'] })?.phu).toBe('3 loại đang bật');
    expect(soLoaiDangBat('sale', ['can_da_gui_co_nguoi_dat'])).toBe(3);
    expect(soLoaiDangBat('chu_nha', ['chu_dong_y_ket_noi'])).toBe(3); // loại của vai khác không tính
  });

  it('YC1.3 bước 3, 4 giá trị phụ: "14:00 · 12:00", "T6, T7", "+400k"; chưa cộng thì "Không cộng"', () => {
    expect(chuGioMenu('14:00:00', '12:00:00')).toBe('14:00 · 12:00');
    expect(dong('chu_nha', 'gio')?.phu).toBe('14:00 · 12:00');
    expect(chuDemCuoiTuan([6, 5])).toBe('T6, T7');
    expect(dong('chu_nha', 'dem-cuoi-tuan')?.phu).toBe('T6, T7');
    expect(dong('sale', 'muc-cong')?.phu).toBe('+400k');
    expect(chuMucCongMenu(0)).toBe('Không cộng');
    expect(dong('sale', 'link-xin-lich')?.phu).toBe('Gửi chủ nhà');
  });

  it('YC1.3 bước 2 "Email đăng nhập" kèm địa chỉ email đang dùng, chỉ để xem', () => {
    const d = dong('chu_nha', 'email');
    expect(d).toMatchObject({ nhan: 'Email đăng nhập', phu: 'hoa@vidu.test', tinh: true });
  });

  it('YC1.3 bước 1 tên hiển thị nếu có, không thì họ tên; chữ cái đầu của tên cuối', () => {
    expect(tenHienCaNhan(TQ)).toBe('Chị Hoa');
    expect(tenHienCaNhan({ ten: 'Lê Văn Hùng', tenHienThi: null })).toBe('Lê Văn Hùng');
    expect(chuCaiDau('Lê Văn Hùng')).toBe('H');
    expect(chuCaiDau(null)).toBe('?');
  });
});
