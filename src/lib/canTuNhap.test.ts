// Test unit chữ và luật kiểm của căn tự nhập (YC10.3, US56): "Còn thiếu", thẻ căn, đặt phòng đã ghi, che số, gọi hỏi lịch.
import { describe, expect, it } from 'vitest';
import {
  cauGoiChu, cauXacNhanXoa, cheSo, dongConThieu, dongDatPhong, linkGoi, mucDatPhong, nutMoiChu, oThieuTuNhap, phuTheTuNhap,
  tenCanTuNhap,
} from './canTuNhap';
import { CHIP_VIEW } from './kiemCan';
import { chuO } from './lichSale';
import { chiaTabCan } from './tabCanSale';

const DU = { tenChu: 'Chú Bình', soDienThoai: '0904123330', maCan: 'Villa Tuần Châu', soPhongNgu: 4 };

describe('YC10.3 · căn tự nhập', () => {
  it('YC10.3-NT1 "Còn thiếu" liệt kê đúng ô thiếu, theo thứ tự trên màn', () => {
    expect(dongConThieu({ tenChu: '', soDienThoai: '', maCan: '', soPhongNgu: null }))
      .toBe('Còn thiếu: tên chủ nhà, số điện thoại, mã căn, số phòng ngủ');
    expect(dongConThieu({ ...DU, tenChu: '  ' })).toBe('Còn thiếu: tên chủ nhà');
    expect(dongConThieu({ ...DU, soDienThoai: '' })).toBe('Còn thiếu: số điện thoại');
    expect(dongConThieu({ ...DU, maCan: ' ' })).toBe('Còn thiếu: mã căn');
    expect(dongConThieu({ ...DU, soPhongNgu: null })).toBe('Còn thiếu: số phòng ngủ');
    expect(dongConThieu({ ...DU, tenChu: '', maCan: '' })).toBe('Còn thiếu: tên chủ nhà, mã căn');
  });

  it('YC10.3-NT2 không giá chủ, không số giường vẫn đủ; "Còn thiếu" không nhắc hai ô đó', () => {
    expect(dongConThieu(DU)).toBeNull();
    expect(oThieuTuNhap({ tenChu: '', soDienThoai: '', maCan: '', soPhongNgu: null }).join(' ')).not.toMatch(/giá|giường/);
  });

  it('YC10.3-NT8 form sửa xóa được số chủ căn: không nhắc số điện thoại; không có số thì nút gọi không có link', () => {
    expect(dongConThieu({ ...DU, soDienThoai: '' }, false)).toBeNull();
    expect(linkGoi(null)).toBeNull();
    expect(linkGoi('')).toBeNull();
    expect(linkGoi('0904 123 330')).toBe('tel:0904123330');
  });

  it('YC10.3-NT3 căn tự nhập ở nhóm CĂN TỰ NHẬP; ô lịch của căn tự nhập ghi "?"', () => {
    const t = chiaTabCan([{ nhom: 'tu_nhap', canId: 'v', maCan: 'Villa Tuần Châu', tenToa: null, soPhongNgu: 4, soGiuong: null,
      loaiView: null, khachDen: null, ketNoiId: null, chuId: null, tenChu: null, chuDaXoa: false, capNhatLuc: null, chuCanTen: 'Chú Bình' }]);
    expect(t.tuNhap.map((c) => c.ten)).toEqual(['Villa Tuần Châu']);
    expect(t.cuaToi).toEqual([]);
    expect(chuO('chua_biet', null)).toBe('?');
    expect(chuO('chua_biet', 1_400_000)).toBe('?');
  });

  it('YC10.3-NT5 Loại view đúng danh sách glossary; số giường thì thẻ ghi "2PN · 3 giường"', () => {
    expect(CHIP_VIEW.map((v) => [v.ma, v.chu])).toEqual([['bien', 'Biển'], ['thanh_pho', 'Thành phố'], ['nui', 'Núi']]);
    expect(phuTheTuNhap({ soPhongNgu: 2, soGiuong: 3, loaiView: null })).toBe('2PN · 3 giường');
    expect(phuTheTuNhap({ soPhongNgu: 2, soGiuong: null, loaiView: null })).toBe('2PN');
  });

  it('YC10.3-NT6 V1: "20/09 → 22/09", "Trả chủ 2.800.000đ · Thu khách 3.400.000đ", "+600.000đ"', () => {
    const x = dongDatPhong({ id: 'V1', ngayNhan: '2026-09-20', ngayTra: '2026-09-22', traChu: 2_800_000, thuKhach: 3_400_000 });
    expect(x).toEqual({ ngay: '20/09 → 22/09 (2 đêm)', tien: 'Trả chủ 2.800.000đ · Thu khách 3.400.000đ', chenh: '+600.000đ' });
    expect(mucDatPhong(1)).toBe('Đặt phòng bạn đã ghi · 1');
    const khongThu = dongDatPhong({ id: 'V', ngayNhan: '2026-10-08', ngayTra: '2026-10-09', traChu: 1_400_000, thuKhach: null });
    expect(khongThu).toEqual({ ngay: '08/10 → 09/10 (1 đêm)', tien: 'Trả chủ 1.400.000đ', chenh: null });
  });

  it('YC10.3 bước 8, 11, 13: che ba số giữa, câu gọi chủ, nút mời, xác nhận xóa', () => {
    expect(cheSo('0904123330')).toBe('0904 *** 330');
    expect(cheSo(null)).toBeNull();
    expect(cauGoiChu('Chú Bình')).toBe('Căn này không có lịch trống. Khách hỏi ngày nào, bạn gọi chú Bình hỏi ngày đó.');
    expect(nutMoiChu('Chú Bình')).toBe('Mời chú Bình dùng app');
    expect(cauXacNhanXoa('Villa Tuần Châu')).toBe('Xác nhận xóa Villa Tuần Châu?');
    expect(tenCanTuNhap({ maCan: '1509', tenToa: 'ICON40' })).toBe('ICON40 1509');
  });
});
