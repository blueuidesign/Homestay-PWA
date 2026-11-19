// Test unit phần tính của form Thêm đặt phòng CN4 (YC5.1, YC5.2). Số theo DLM.4: B1 1509 10/10 → 12/10 của Sale Hùng.
import { afterEach, describe, expect, it } from 'vitest';
import type { DatPhongLich } from './lich';
import {
  cauChonSale, chipCuaSoDem, chipNguoiDat, demTrongDauTien, docBanNhapDatPhong, dongGiaDem, ghiBanNhapDatPhong, kiemNgay,
  loiTienCoc, loiTienPhong, ngayTraTheoSoDem, tenNguoiDatToast, tomTatChiTiet, tongGiaDem, xoaBanNhapDatPhong,
  cauKhachCuaSale, cauSaleDaXoa, dongGioNhanTra, nhanTrangThaiTien, tienConLai, tieuDeChiTiet,
} from './datPhong';

afterEach(() => { try { localStorage.clear(); } catch { /* bỏ qua */ } });

const B1: DatPhongLich = { id: 'B1', canId: 'c1509', ngayNhan: '2026-10-10', ngayTra: '2026-10-12', nguoiDat: { loai: 'sale', ten: 'Sale Hùng', sdt: null } };
const B5: DatPhongLich = { id: 'B5', canId: 'c1509', ngayNhan: '2026-10-13', ngayTra: '2026-10-15', nguoiDat: { loai: 'khach', ten: 'Chị Mai' } };
const B4: DatPhongLich = { id: 'B4', canId: 'c3402', ngayNhan: '2026-10-05', ngayTra: '2026-10-07', nguoiDat: { loai: 'le' } };

describe('YC5.1 · ngày và số đêm', () => {
  it('YC5.1-NT3 chọn "2 đêm" thì ngày trả bằng ngày nhận cộng 2', () => {
    expect(ngayTraTheoSoDem('2026-10-31', 2)).toBe('2026-11-02');
    expect(ngayTraTheoSoDem('2026-10-09', 1)).toBe('2026-10-10');
    expect(ngayTraTheoSoDem('2026-12-31', 3)).toBe('2027-01-03');
  });

  it('YC5.1 bước 3 đổi ngày trả bằng tay thì chip số đêm tương ứng (1, 2, 3) hoặc "Tùy chọn"', () => {
    expect(chipCuaSoDem(1)).toBe(1);
    expect(chipCuaSoDem(2)).toBe(2);
    expect(chipCuaSoDem(3)).toBe(3);
    expect(chipCuaSoDem(4)).toBe('tuy-chon');
    expect(chipCuaSoDem(null)).toBe('tuy-chon');
  });

  it('YC5.1-NT4 đêm trống đầu tiên của 1509 tính từ hôm nay 07/10: chỉ có B1 thì 07/10; thêm 07/10 → 10/10 thì 12/10', () => {
    expect(demTrongDauTien([B1], 'c1509', '2026-10-07')).toBe('2026-10-07');
    const them: DatPhongLich = { id: 'X', canId: 'c1509', ngayNhan: '2026-10-07', ngayTra: '2026-10-10' };
    expect(demTrongDauTien([B1, them], 'c1509', '2026-10-07')).toBe('2026-10-12');
    // Đặt phòng của căn khác không tính.
    expect(demTrongDauTien([B4], 'c1509', '2026-10-05')).toBe('2026-10-05');
  });
});

describe('YC5.1 bước 4 · dòng kiểm trùng', () => {
  it('YC5.1-NT1 các đêm chưa có khách trong căn thì dòng "không trùng lịch"', () => {
    expect(kiemNgay([B1, B5, B4], 'c1509', '2026-10-31', '2026-11-02')).toEqual({ loai: 'khong-trung', chu: '✓ 31/10 → 02/11 (2 đêm) · không trùng lịch' });
    // QT1.1-VD2: nhận đúng ngày trả của B1 không trùng.
    expect(kiemNgay([B1], 'c1509', '2026-10-12', '2026-10-13').loai).toBe('khong-trung');
    // QT1.1-VD3: khác căn không trùng.
    expect(kiemNgay([B1], 'c3402', '2026-10-10', '2026-10-12').loai).toBe('khong-trung');
  });

  it('YC5.1-NT2 trùng đêm với một đặt phòng chưa hủy của cùng căn thì dòng đỏ nêu đêm, người đặt, ngày của đặt phòng đó', () => {
    expect(kiemNgay([B1], 'c1509', '2026-10-11', '2026-10-13')).toEqual({ loai: 'trung', chu: 'Trùng đêm 11/10 với đặt phòng của Sale Hùng (10/10 → 12/10)' });
  });

  it('YC5.1 bước 4 trùng nhiều đặt phòng: nêu đặt phòng có đêm trùng sớm nhất và "và N đặt phòng khác"; người đặt là khách chủ nhà nhập hoặc "Khách lẻ"', () => {
    expect(kiemNgay([B5, B1], 'c1509', '2026-10-11', '2026-10-15').chu).toBe('Trùng đêm 11/10 với đặt phòng của Sale Hùng (10/10 → 12/10) và 1 đặt phòng khác');
    expect(kiemNgay([B5], 'c1509', '2026-10-14', '2026-10-16').chu).toBe('Trùng đêm 14/10 với đặt phòng của Chị Mai (13/10 → 15/10)');
    expect(kiemNgay([B4], 'c3402', '2026-10-06', '2026-10-07').chu).toBe('Trùng đêm 06/10 với đặt phòng của Khách lẻ (05/10 → 07/10)');
  });

  it('YC5.1-NT6 app chặn trước: ngày trả không sau ngày nhận, hay dài hơn 365 đêm, thì dòng đỏ đúng câu của database', () => {
    expect(kiemNgay([], 'c1509', '2026-10-10', '2026-10-10')).toEqual({ loai: 'loi', chu: 'Ngày trả phải sau ngày nhận' });
    expect(kiemNgay([], 'c1509', '2026-10-10', '2026-10-09')).toEqual({ loai: 'loi', chu: 'Ngày trả phải sau ngày nhận' });
    expect(kiemNgay([], 'c1509', '2027-01-01', '2028-01-02')).toEqual({ loai: 'loi', chu: 'Một đặt phòng dài tối đa 365 đêm' });
    expect(kiemNgay([], 'c1509', '2027-01-01', '2028-01-01').loai).toBe('khong-trung'); // đúng 365 đêm
    expect(kiemNgay([], 'c1509', '', '2026-10-10').loai).toBe('chua-du');
  });
});

describe('HV3 · nháp form đặt phòng', () => {
  it('HV3 bước 1, 3 nháp lưu căn, ngày, mã lần gửi; quá 7 ngày thì bỏ (HV3-H1)', () => {
    const b = { canId: 'c1509', ngayNhan: '2026-10-09', ngayTra: '2026-10-11', tuyChon: false, clientId: 'm1' };
    ghiBanNhapDatPhong(b, 1000);
    expect(docBanNhapDatPhong(1000 + 6 * 24 * 3600 * 1000)).toEqual(b);
    expect(docBanNhapDatPhong(1000 + 8 * 24 * 3600 * 1000)).toBeNull();
  });

  it('HV3-NT4 lưu xong (xoaBanNhapDatPhong, CN4 gọi khi lưu thành công) thì mở lại không còn nháp cũ', () => {
    ghiBanNhapDatPhong({ canId: 'c1509', ngayNhan: '2026-10-09', ngayTra: '2026-10-11', tuyChon: false, clientId: 'm1' });
    xoaBanNhapDatPhong();
    expect(docBanNhapDatPhong()).toBeNull();
  });
});

describe('YC5.2 · người đặt, tiền phòng, trạng thái tiền (phần tính)', () => {
  it('YC5.2-NT9 thứ tự chip: "+ Sale mới", "Khách lẻ", sale đang kết nối, rồi tên khách (mỗi tên một lần, tối đa 10)', () => {
    const ten = ['Dung Đỗ', 'Bà Lan', 'Dung Đỗ', ...Array.from({ length: 12 }, (_, i) => `Khách ${i + 1}`)];
    const chips = chipNguoiDat([{ id: 'hung', ten: 'Sale Hùng' }], ten);
    expect(chips.slice(0, 4).map((c) => c.chu)).toEqual(['+ Sale mới', 'Khách lẻ', 'Sale Hùng', 'Dung Đỗ']);
    expect(chips.filter((c) => c.loai === 'khach')).toHaveLength(10);
    expect(chips.filter((c) => c.chu === 'Dung Đỗ')).toHaveLength(1);
  });

  it('YC5.2-NT1 dòng từng đêm "31/10: 1.300.000đ", "01/11: 900.000đ"; tổng 2.200.000đ', () => {
    const g = [{ dem: '2026-10-31', gia: 1300000 }, { dem: '2026-11-01', gia: 900000 }];
    expect(g.map(dongGiaDem)).toEqual(['31/10: 1.300.000đ', '01/11: 900.000đ']);
    expect(tongGiaDem(g)).toBe(2200000);
  });

  it('YC5.2-NT5 đêm chưa có giá thì dòng ghi "chưa đặt giá" và không có tổng (ô tiền phòng để trống)', () => {
    const g = [{ dem: '2026-12-31', gia: 900000 }, { dem: '2027-01-01', gia: null }];
    expect(dongGiaDem(g[1]!)).toBe('01/01: chưa đặt giá');
    expect(tongGiaDem(g)).toBeNull();
    expect(tongGiaDem([])).toBeNull();
  });

  it('YC5.2-NT3 tiền phòng trống hay 0 thì "Nhập tiền phòng trước khi lưu"', () => {
    expect(loiTienPhong(null)).toBe('Nhập tiền phòng trước khi lưu');
    expect(loiTienPhong(0)).toBe('Nhập tiền phòng trước khi lưu');
    expect(loiTienPhong(2200000)).toBeNull();
  });

  it('YC5.2-NT7 cọc lớn hơn tiền phòng thì "Tiền cọc không được lớn hơn tiền phòng" (GD20); cọc bằng tiền phòng, để trống, hay không phải "Đã cọc" thì được', () => {
    expect(loiTienCoc('da_coc_con_thu', 3000000, 2200000)).toBe('Tiền cọc không được lớn hơn tiền phòng');
    expect(loiTienCoc('da_coc_con_thu', 2200000, 2200000)).toBeNull();
    expect(loiTienCoc('da_coc_con_thu', null, 2200000)).toBeNull();
    expect(loiTienCoc('da_thanh_toan', 3000000, 2200000)).toBeNull();
  });

  it('YC5.2-NT10 dòng tóm tắt chi tiết "4 khách · 14:00 → 12:00 · Ghi chú"', () => {
    expect(tomTatChiTiet(4, '14:00', '12:00', 'Có trẻ nhỏ')).toBe('4 khách · 14:00 → 12:00 · Ghi chú');
    expect(tomTatChiTiet(1, '14:00', '12:00', '  ')).toBe('1 khách · 14:00 → 12:00');
  });

  it('YC5.2 bước 6c, YC5.3 bước 10: câu chọn sale và tên người đặt trong toast', () => {
    expect(cauChonSale('Sale Hùng')).toBe('Đặt phòng của Sale Hùng: Hùng được báo và thấy đặt phòng này như của mình.');
    expect(tenNguoiDatToast({ sale: 'Sale Hùng' })).toBe('Sale Hùng');
    expect(tenNguoiDatToast({ tenKhach: ' Bà Lan ' })).toBe('Bà Lan');
    expect(tenNguoiDatToast({ tenKhach: '' })).toBe('Khách lẻ');
  });
});

describe('YC5.5 · chi tiết đặt phòng và thu tiền', () => {
  it('YC5.5-NT1 YC5 Quy tắc "Tiền còn lại": 2.200.000đ trừ cọc 1.000.000đ còn 1.200.000đ', () => {
    expect(tienConLai(2200000, 1000000, 'da_coc')).toBe(1200000);
    expect(tienConLai(1800000, null, 'chua_coc')).toBe(1800000);
    expect(tienConLai(2200000, 1000000, 'da_thanh_toan')).toBe(0);
  });

  it('YC5.5 QT6.1 nhãn trạng thái tiền', () => {
    expect(nhanTrangThaiTien('chua_coc')).toBe('Chưa cọc');
    expect(nhanTrangThaiTien('da_coc')).toBe('Đã cọc · còn thu');
    expect(nhanTrangThaiTien('da_thanh_toan')).toBe('Đã thanh toán');
    expect(nhanTrangThaiTien(null)).toBeNull();
  });

  it('YC5.5 bước 16 "Nhận 14:00 thứ 7 · trả 12:00 thứ 2"; không có giờ thì 14:00, 12:00', () => {
    expect(dongGioNhanTra('2026-10-10', '2026-10-12', '14:00', '12:00')).toBe('Nhận 14:00 thứ 7 · trả 12:00 thứ 2');
    expect(dongGioNhanTra('2026-10-11', '2026-10-12', null, null)).toBe('Nhận 14:00 chủ nhật · trả 12:00 thứ 2');
    expect(dongGioNhanTra('2026-10-10', '2026-10-12', '15:30:00', '11:00:00')).toBe('Nhận 15:30 thứ 7 · trả 11:00 thứ 2');
  });

  it('YC5.5 bước 16, 17, 22 tiêu đề và câu về người đặt', () => {
    expect(tieuDeChiTiet({ saleId: 'h', tenSale: 'Sale Hùng', tenKhach: null })).toBe('Đặt phòng · Sale Hùng');
    expect(tieuDeChiTiet({ saleId: null, tenSale: null, tenKhach: 'Bà Lan' })).toBe('Đặt phòng · Bà Lan');
    expect(tieuDeChiTiet({ saleId: null, tenSale: null, tenKhach: null })).toBe('Đặt phòng · Khách lẻ');
    expect(cauKhachCuaSale('Sale Hùng')).toBe('Khách do sale Hùng bán. Tên và số điện thoại khách chỉ sale giữ; cần gì về khách thì gọi sale.');
    expect(cauSaleDaXoa('Sale Hùng')).toBe('Sale Hùng đã xóa tài khoản. Đặt phòng vẫn giữ trong lịch của bạn; app không còn số điện thoại của sale này.');
  });
});
