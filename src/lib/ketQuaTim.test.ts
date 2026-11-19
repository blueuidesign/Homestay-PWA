// Test unit phần tính của kết quả tìm phòng S2, S4 (YC7.3, US45).
import { describe, expect, it } from 'vitest';
import {
  chiaNhomKetQua, chuDaChon, chuDoTuoi, chuGiaThe, chuSoCanTrong, chuTuNhap, hangTuan, laDemKhachHoi, manKhiCham, theCan,
  thongTinXep, xepCan,
} from './ketQuaTim';
import type { DongLichSale } from './lichSale';
import { bayNgay } from './lichSale';
import type { CanTim, DieuKienTim, KetQuaTim } from './timPhong';

const DK: DieuKienTim = { nhan: '2026-10-10', tra: '2026-10-12', soPhongNgu: [2, 3], toaNha: [], view: [] };
const can = (x: Partial<CanTim> & Pick<CanTim, 'canId' | 'nhom' | 'maCan'>): CanTim => ({
  tenToa: null, tenChu: null, soPhongNgu: null, loaiView: null, lichDoiLuc: null, tongGiaChu: null, tongGiaBan: null,
  khongCoLich: x.nhom === 'tu_nhap', ...x,
});
const KQ_HUNG: KetQuaTim = {
  soCanTrong: 5, goiY: [],
  can: [
    can({ canId: 'gb', nhom: 'cua_toi', maCan: '0812', tenToa: 'Green Bay', soPhongNgu: 2, loaiView: 'bien', tongGiaChu: 1500000, tongGiaBan: 1500000 }),
    can({ canId: '3402', nhom: 'nguon', maCan: '3402', tenChu: 'Chị Hoa', soPhongNgu: 1, loaiView: 'bien', tongGiaChu: 1900000, tongGiaBan: 2700000, lichDoiLuc: '2026-10-06T03:00:00Z' }),
    can({ canId: '2208', nhom: 'nguon', maCan: '2208', tenToa: 'À La Carte', tenChu: 'Anh Tuấn', soPhongNgu: 1, loaiView: 'bien', tongGiaChu: 3000000, tongGiaBan: 3600000, lichDoiLuc: '2026-10-05T01:00:00Z' }),
    can({ canId: '1509', nhom: 'nguon', maCan: '1509', tenToa: 'ICON40', tenChu: 'Chị Hoa', soPhongNgu: 2, loaiView: 'bien', tongGiaChu: 2200000, tongGiaBan: 3000000, lichDoiLuc: '2026-10-06T03:00:00Z' }),
    can({ canId: '1103', nhom: 'nguon', maCan: '1103', tenToa: 'Sapphire', tenChu: 'Anh Tuấn', soPhongNgu: 3, loaiView: 'thanh_pho', tongGiaChu: 1400000, tongGiaBan: 1600000, lichDoiLuc: '2026-10-05T01:00:00Z' }),
    can({ canId: 'villa', nhom: 'tu_nhap', maCan: 'Villa Tuần Châu', tenChu: 'Chú Bình' }),
  ],
};
const BAY_GIO = new Date('2026-10-06T05:00:00Z'); // 12:00 ngày 06/10 giờ Việt Nam

describe('YC7.3 · kết quả tìm phòng', () => {
  it('YC7.3-NT1 "5 căn trống": nhóm "Của tôi · 1", "Nguồn phòng · 4", rồi "Tự nhập · chưa biết lịch" không tính vào 5', () => {
    expect(chuSoCanTrong(KQ_HUNG)).toBe('5 căn trống');
    const nhom = chiaNhomKetQua(KQ_HUNG, 'ten');
    expect(nhom.map((g) => g.tieuDe)).toEqual(['Của tôi · 1', 'Nguồn phòng · 4', 'Tự nhập · chưa biết lịch']);
    expect(nhom[2]!.can.map((c) => c.maCan)).toEqual(['Villa Tuần Châu']);
    expect(nhom[1]!.can.map((c) => theCan(c, DK).ten)).toEqual(['3402 · 1PN', 'À La Carte 2208 · 1PN', 'ICON40 1509 · 2PN', 'Sapphire 1103 · 3PN']);
  });

  it('YC7.3-NT2 thẻ 1509 "2.200.000đ · bạn bán 3.000.000đ"; đêm chưa có giá "Chưa có giá"', () => {
    const t = theCan(KQ_HUNG.can[3]!, DK, BAY_GIO);
    expect(chuGiaThe(t)).toBe('2.200.000đ · bạn bán 3.000.000đ');
    expect(t.phu).toBe('Chị Hoa · view biển');
    expect(chuGiaThe(theCan(can({ canId: 'x', nhom: 'nguon', maCan: 'X' }), DK))).toBe('Chưa có giá');
    expect(chuGiaThe(theCan(KQ_HUNG.can[0]!, DK))).toBe('1.500.000đ / 2 đêm');
    expect(theCan(KQ_HUNG.can[0]!, DK).phu).toBe('Căn của tôi · view biển');
  });

  it('YC7.3 bước 3 độ tươi: "Lịch cập nhật 2 giờ trước", "hôm qua"; căn của tôi "Lịch của bạn, luôn đúng"', () => {
    expect(theCan(KQ_HUNG.can[3]!, DK, BAY_GIO).doTuoi).toBe('✓ Lịch cập nhật 2 giờ trước');
    expect(theCan(KQ_HUNG.can[2]!, DK, BAY_GIO).doTuoi).toBe('✓ Lịch cập nhật hôm qua');
    expect(theCan(KQ_HUNG.can[0]!, DK, BAY_GIO).doTuoi).toBe('✓ Lịch của bạn, luôn đúng');
    expect(chuDoTuoi('2026-10-06T04:30:00Z', BAY_GIO)).toBe('✓ Lịch cập nhật 30 phút trước');
    expect(chuDoTuoi('2026-10-06T04:59:30Z', BAY_GIO)).toBe('✓ Lịch cập nhật vừa xong');
    expect(chuDoTuoi('2026-10-01T05:00:00Z', BAY_GIO)).toBe('✓ Lịch cập nhật 5 ngày trước');
    expect(chuDoTuoi(null, BAY_GIO)).toBeNull();
  });

  it('YC7.3-NT5 căn tự nhập: thẻ ghi không có lịch và gợi ý gọi chủ căn, không giá', () => {
    const t = theCan(KQ_HUNG.can[5]!, DK);
    expect(t.doTuoi).toBe('Tự nhập · không có lịch, gọi chú Bình hỏi');
    expect(t.gia).toBeNull();
    expect(chuTuNhap(null)).toBe('Tự nhập · không có lịch, gọi chủ căn hỏi');
    expect(chuTuNhap('Bình')).toBe('Tự nhập · không có lịch, gọi Bình hỏi');
  });

  it('YC7.3-NT3 thanh đáy "Đã chọn 3 căn"', () => {
    expect(chuDaChon(3)).toBe('Đã chọn 3 căn');
    expect(chuDaChon(0)).toBe('Chưa chọn căn');
  });

  it('YC7.3-NT6 chạm căn: căn của tôi mở S6-07, căn tự nhập mở S6-03, căn chủ nhà S3', () => {
    expect(manKhiCham(KQ_HUNG.can[0]!)).toBe('S6-07');
    expect(manKhiCham(KQ_HUNG.can[5]!)).toBe('S6-03');
    expect(manKhiCham(KQ_HUNG.can[3]!)).toBe('S3');
  });

  it('YC7 Quy tắc "Sắp xếp": giá đêm đầu tăng dần (không có giá xếp cuối), bán nhiều nhất; căn của tôi vẫn ở trên', () => {
    const dong: DongLichSale[] = KQ_HUNG.can.filter((c) => c.nhom !== 'tu_nhap').map((c, i) => ({
      canId: c.canId, nhom: c.nhom, maCan: c.maCan, tenToa: c.tenToa, tenChu: c.tenChu, soPhongNgu: c.soPhongNgu,
      loaiView: c.loaiView, lichDoiLuc: null, soBan: [0, 1, 4, 1, 2][i]!, dem: '2026-10-10', o: 'trong',
      giaBan: [750000, 1350000, 1800000, null, 800000][i]!,
    }));
    const tt = thongTinXep(dong, '2026-10-10');
    const nguon = KQ_HUNG.can.filter((c) => c.nhom === 'nguon');
    expect(xepCan(nguon, 'gia', tt).map((c) => c.maCan)).toEqual(['1103', '3402', '2208', '1509']);
    expect(xepCan(nguon, 'ban', tt).map((c) => c.maCan)).toEqual(['2208', '1103', '3402', '1509']);
    expect(chiaNhomKetQua(KQ_HUNG, 'gia', tt)[0]!.tieuDe).toBe('Của tôi · 1');
  });

  it('YC7.3-NT4 S4: bảng chỉ có các căn của kết quả, cùng thứ tự nhóm; căn tự nhập "?"; đêm khách hỏi được tô', () => {
    const ngay = bayNgay('2026-10-10');
    const dong: DongLichSale[] = [
      ...ngay.map((n): DongLichSale => ({ canId: '1509', nhom: 'nguon', maCan: '1509', tenToa: 'ICON40', tenChu: 'Chị Hoa', soPhongNgu: 2,
        loaiView: null, lichDoiLuc: null, soBan: 0, dem: n, o: n === '2026-10-13' ? 'kin' : 'trong', giaBan: 1500000 })),
      ...ngay.map((n): DongLichSale => ({ canId: 'khac', nhom: 'nguon', maCan: 'I3', tenToa: null, tenChu: 'Chị Hoa', soPhongNgu: 3,
        loaiView: null, lichDoiLuc: null, soBan: 0, dem: n, o: 'kin', giaBan: null })),
      ...ngay.map((n): DongLichSale => ({ canId: 'villa', nhom: 'tu_nhap', maCan: 'Villa Tuần Châu', tenToa: null, tenChu: 'Chú Bình',
        soPhongNgu: null, loaiView: null, lichDoiLuc: null, soBan: 0, dem: n, o: 'chua_biet', giaBan: null })),
    ];
    const h = hangTuan(chiaNhomKetQua(KQ_HUNG, 'ten'), dong, ngay);
    expect(h.map((x) => x.canId)).toEqual(['gb', '3402', '2208', '1509', '1103', 'villa']);
    expect(h.find((x) => x.canId === '1509')!.o.map((o) => o.chu)).toEqual(['1,5tr', '1,5tr', '1,5tr', 'Kín', '1,5tr', '1,5tr', '1,5tr']);
    expect(h.find((x) => x.canId === 'villa')!.o.map((o) => o.chu)).toEqual(Array(7).fill('?'));
    expect(h.find((x) => x.canId === 'villa')!.phu).toBe('Chú Bình · tự nhập');
    expect(ngay.filter((n) => laDemKhachHoi(n, DK))).toEqual(['2026-10-10', '2026-10-11']);
  });
});
