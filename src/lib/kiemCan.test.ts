// Test unit luật kiểm phía app của form căn (YC3.2 Luật kiểm, bước 16, 17, 20).
import { describe, expect, it } from 'vitest';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { CAU_DU, CHIP_VIEW, cauDauLoi, docSoGiuong, dongTrangThai, kiemFormCan, loiTuTaoCan, oConThieu, oCuaCau } from './kiemCan';

describe('YC3.2 · luật kiểm form Thêm căn', () => {
  it('YC3.2-NT1 chưa có mã căn và số phòng ngủ thì "Còn thiếu: mã căn, số phòng ngủ"', () => {
    expect(dongTrangThai({ maCan: '', soPhongNgu: null })).toEqual({ du: false, chu: 'Còn thiếu: mã căn, số phòng ngủ' });
  });

  it('YC3.2-NT1 chỉ nêu ô còn thiếu', () => {
    expect(dongTrangThai({ maCan: '1509', soPhongNgu: null }).chu).toBe('Còn thiếu: số phòng ngủ');
    expect(dongTrangThai({ maCan: '   ', soPhongNgu: 2 }).chu).toBe('Còn thiếu: mã căn');
    expect(dongTrangThai({ maCan: '', soPhongNgu: 0 }).chu).toBe('Còn thiếu: mã căn');
  });

  it('YC3.2 bước 17 đủ mã căn và số phòng ngủ (kể cả Studio) thì "Đủ thông tin. Ảnh, giá thêm sau cũng được."', () => {
    expect(dongTrangThai({ maCan: '2105', soPhongNgu: 1 })).toEqual({ du: true, chu: CAU_DU });
    expect(dongTrangThai({ maCan: 'Greenbay', soPhongNgu: 0 }).du).toBe(true);
    expect(CAU_DU).toBe('Đủ thông tin. Ảnh, giá thêm sau cũng được.');
  });

  it('YC3.2-NT3 bỏ trống số giường thì không bị nhắc và vẫn đủ', () => {
    expect(oConThieu({ maCan: '2105', soPhongNgu: 1 })).toEqual([]);
    expect(kiemFormCan({ maCan: '2105', soPhongNgu: 1, soGiuong: null })).toEqual({});
    expect(dongTrangThai({ maCan: '2105', soPhongNgu: 1 }).chu).not.toContain('giường');
  });

  it('YC3.2-NT2 chỉ mã căn "2105" và 1PN thì không có lỗi', () => {
    expect(kiemFormCan({ maCan: '2105', soPhongNgu: 1 })).toEqual({});
  });

  it('YC3.2-NT8 luật kiểm phía app dùng đúng câu của bảng Luật kiểm', () => {
    expect(kiemFormCan({ maCan: '  ', soPhongNgu: null })).toEqual({ maCan: 'Mã căn không được trống', soPhongNgu: 'Cần chọn số phòng ngủ' });
    expect(kiemFormCan({ maCan: 'Ă'.repeat(51), soPhongNgu: 5 })).toEqual({ maCan: 'Mã căn dài quá 50 ký tự', soPhongNgu: 'Số phòng ngủ không hợp lệ' });
    expect(kiemFormCan({ maCan: 'Ă'.repeat(50), soPhongNgu: 4 })).toEqual({});
    expect(kiemFormCan({ maCan: '1', soPhongNgu: 2, soGiuong: 0 }).soGiuong).toBe('Số giường từ 1 đến 50');
    expect(kiemFormCan({ maCan: '1', soPhongNgu: 2, soGiuong: 50 }).soGiuong).toBeUndefined();
    expect(kiemFormCan({ maCan: '1', soPhongNgu: 2, loaiView: 'vinh' }).loaiView).toBe('Loại view không hợp lệ');
    expect(kiemFormCan({ maCan: '1', soPhongNgu: 2, moTa: 'a'.repeat(2001) }).moTa).toBe('Mô tả dài tối đa 2.000 ký tự');
    expect(kiemFormCan({ maCan: '1', soPhongNgu: 2, moTa: 'a'.repeat(2000) }).moTa).toBeUndefined();
  });

  it('YC3.2-NT4 câu "Đã có căn 1509. Kiểm tra lại mã căn." thuộc ô mã căn', () => {
    expect(oCuaCau('Đã có căn 1509. Kiểm tra lại mã căn.')).toBe('maCan');
    expect(oCuaCau('Mã căn dài quá 50 ký tự')).toBe('maCan');
    expect(oCuaCau('Cần chọn số phòng ngủ')).toBe('soPhongNgu');
    expect(oCuaCau('Số phòng ngủ không hợp lệ')).toBe('soPhongNgu');
    expect(oCuaCau('Số giường từ 1 đến 50')).toBe('soGiuong');
    expect(oCuaCau('Không tìm thấy tòa nhà')).toBe('toaNha');
    expect(oCuaCau('Bạn cần đăng nhập để làm việc này.')).toBeNull();
  });

  it('YC3.2 bước 20 dòng đầu "Chưa thêm được căn. Sửa <số> chỗ bên dưới."', () => {
    expect(cauDauLoi(3)).toBe('Chưa thêm được căn. Sửa 3 chỗ bên dưới.');
  });

  it('QT5.5 lỗi P0001 của database giữ nguyên câu; lỗi khác không thành câu cho người dùng', () => {
    const l = loiTuTaoCan({ code: 'P0001', message: 'Đã có căn 1509. Kiểm tra lại mã căn.' });
    expect(l).toBeInstanceOf(LoiNguoiDung);
    expect(l.message).toBe('Đã có căn 1509. Kiểm tra lại mã căn.');
    expect(loiTuTaoCan({ code: '42501', message: 'permission denied' })).not.toBeInstanceOf(LoiNguoiDung);
  });
});

describe('YC3.4 · phần thêm của form căn', () => {
  it('YC3.4-NT2 hàng chip "Loại view" đúng "Biển", "Thành phố", "Núi", không có "Vịnh"; mã lưu bien, thanh_pho, nui', () => {
    expect(CHIP_VIEW.map((c) => c.chu)).toEqual(['Biển', 'Thành phố', 'Núi']);
    expect(CHIP_VIEW.map((c) => c.chu)).not.toContain('Vịnh');
    expect(CHIP_VIEW.map((c) => c.ma)).toEqual(['bien', 'thanh_pho', 'nui']);
  });

  it('YC3.4 bước 29 số giường: trống là không nhập; 0, 51, chữ thì "Số giường từ 1 đến 50"', () => {
    expect(docSoGiuong('')).toBeNull();
    expect(docSoGiuong('  ')).toBeNull();
    expect(docSoGiuong(' 3 ')).toBe(3);
    for (const sai of ['0', '51', 'ba', '2.5', '-1']) {
      expect(kiemFormCan({ maCan: '2105', soPhongNgu: 2, soGiuong: docSoGiuong(sai) }).soGiuong).toBe('Số giường từ 1 đến 50');
    }
    for (const dung of ['1', '50', '']) {
      expect(kiemFormCan({ maCan: '2105', soPhongNgu: 2, soGiuong: docSoGiuong(dung) }).soGiuong).toBeUndefined();
    }
  });

  it('YC3.4 số giường không vào dòng "Còn thiếu"', () => {
    expect(dongTrangThai({ maCan: '2105', soPhongNgu: 2 })).toEqual({ du: true, chu: CAU_DU });
  });

  it('YC3.4 mô tả tối đa 2.000 ký tự', () => {
    expect(kiemFormCan({ maCan: '2105', soPhongNgu: 2, moTa: 'a'.repeat(2000) }).moTa).toBeUndefined();
    expect(kiemFormCan({ maCan: '2105', soPhongNgu: 2, moTa: 'a'.repeat(2001) }).moTa).toBe('Mô tả dài tối đa 2.000 ký tự');
  });

  it('YC3.4 câu "Không tìm thấy tòa nhà" của database thuộc ô tòa nhà', () => {
    expect(oCuaCau('Không tìm thấy tòa nhà')).toBe('toaNha');
  });
});
