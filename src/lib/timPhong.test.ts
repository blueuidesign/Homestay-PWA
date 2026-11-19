// Test unit tìm phòng (YC7.2, US44): ngày trả, nút đáy, dòng tìm gần đây, chữ S2-00 và gợi ý.
import { describe, expect, it } from 'vitest';
import {
  CAU_CHUA_CHON_NGAY, CHIP_PHONG_NGU_TIM, CHIP_VIEW_TIM, cauKhongCoCan, chipToaTim, chuGoiY, DIEU_KIEN_TRONG,
  dieuKienTuGanDay, dongGanDay, ngayTra, tieuDeKetQua, trangThaiNutTim, type DieuKienTim, type GoiY,
} from './timPhong';

const HOM_NAY = '2026-10-06';
const TOA = new Map([['icon40', 'ICON40'], ['sapphire', 'Sapphire'], ['alc', 'À La Carte']]);
const dk = (p: Partial<DieuKienTim>): DieuKienTim => ({ ...DIEU_KIEN_TRONG, ...p });

describe('YC7.2 · điều kiện tìm', () => {
  it('YC7.2-NT1 chưa chọn ngày nhận: nút mờ, ghi "Chọn ngày nhận để tìm phòng"', () => {
    expect(trangThaiNutTim(DIEU_KIEN_TRONG, HOM_NAY)).toEqual({ sang: false, ghiChu: CAU_CHUA_CHON_NGAY });
    expect(CAU_CHUA_CHON_NGAY).toBe('Chọn ngày nhận để tìm phòng');
  });

  it('YC7.2-NT1 có ngày nhận và ngày trả thì nút sáng; ngày nhận trước hôm nay (YC7-H1) thì vẫn mờ', () => {
    expect(trangThaiNutTim(dk({ nhan: '2026-10-10', tra: '2026-10-12' }), HOM_NAY)).toEqual({ sang: true, ghiChu: null });
    expect(trangThaiNutTim(dk({ nhan: '2026-10-05', tra: '2026-10-07' }), HOM_NAY).sang).toBe(false);
  });

  it('YC7.2-NT2 chọn 10/10 và "2 đêm" thì ngày trả là 12/10', () => {
    expect(ngayTra('2026-10-10', 2)).toBe('2026-10-12');
    expect(ngayTra('2026-10-31', 2)).toBe('2026-11-02');
  });

  it('YC7.2-NT7 lọc "Loại view" có đúng "Biển", "Thành phố", "Núi", không có "Vịnh"', () => {
    expect(CHIP_VIEW_TIM.map((c) => c.chu)).toEqual(['Biển', 'Thành phố', 'Núi']);
  });

  it('YC7.2 bước 3 chip "Số phòng ngủ" là 1PN, 2PN, 3PN, 4PN+', () => {
    expect(CHIP_PHONG_NGU_TIM.map((c) => c.chu)).toEqual(['1PN', '2PN', '3PN', '4PN+']);
  });

  it('YC7.2 bước 3 chip tòa: tòa đã dùng ở lần tìm trước đứng đầu, rồi tòa Home247 đặt sẵn; không có "Khác" (YC7-H2)', () => {
    const ds = [
      { id: 'alc', ten: 'À La Carte', home247: true }, { id: 'icon40', ten: 'ICON40', home247: true },
      { id: 'rieng', ten: 'Tòa riêng', home247: false }, { id: 'sapphire', ten: 'Sapphire', home247: true },
    ];
    expect(chipToaTim(ds, [dk({ toaNha: ['sapphire'] }), dk({ toaNha: ['rieng'] })]).map((t) => t.ten))
      .toEqual(['Sapphire', 'Tòa riêng', 'À La Carte', 'ICON40']);
  });
});

describe('YC7.2 · tìm gần đây', () => {
  it('YC7.2 bước 1 dòng tìm gần đây "10/10 → 12/10 · 2PN · ICON40", "17/10 → 18/10 · 1PN · view biển"', () => {
    expect(dongGanDay(dk({ nhan: '2026-10-10', tra: '2026-10-12', soPhongNgu: [2], toaNha: ['icon40'] }), TOA))
      .toBe('10/10 → 12/10 · 2PN · ICON40');
    expect(dongGanDay(dk({ nhan: '2026-10-17', tra: '2026-10-18', soPhongNgu: [1], view: ['bien'] }), TOA))
      .toBe('17/10 → 18/10 · 1PN · view biển');
  });

  it('YC7.2-NT4 chạm một dòng tìm gần đây thì điều kiện của lần đó được điền sẵn (bản sao)', () => {
    const g = dk({ nhan: '2026-10-10', tra: '2026-10-12', soPhongNgu: [2], toaNha: ['icon40'], view: ['bien'] });
    const moi = dieuKienTuGanDay(g);
    expect(moi).toEqual(g);
    expect(moi.soPhongNgu).not.toBe(g.soPhongNgu);
  });
});

describe('YC7.2 · S2-00 không có căn trống', () => {
  const dang = dk({ nhan: '2026-10-10', tra: '2026-10-12', soPhongNgu: [3], toaNha: ['icon40'] });
  it('YC7.2 bước 6 dòng điều kiện "10/10 → 12/10 · 3PN · 2 đêm" và câu đã kín', () => {
    expect(tieuDeKetQua(dang)).toBe('10/10 → 12/10 · 3PN · 2 đêm');
    expect(cauKhongCoCan(dang, TOA, true)).toBe('Các căn 3PN ở ICON40 đã kín 10/10 → 12/10. Thử một trong các cách sau:');
  });

  it('YC7.2-NT3 mỗi gợi ý ghi số căn trống nếu làm theo gợi ý đó', () => {
    const g = (p: Partial<GoiY>): GoiY => ({ loai: 'doi_ngay', dieuKien: dang, soCan: 1, tenToa: [], ...p });
    expect(chuGoiY(g({ dieuKien: { ...dang, nhan: '2026-10-11', tra: '2026-10-13' }, soCan: 3 }), dang))
      .toEqual({ chinh: 'Đổi sang 11/10 → 13/10', phu: '3 căn trống' });
    expect(chuGoiY(g({ loai: 'bo_loc_toa', soCan: 2, tenToa: ['Sapphire', 'À La Carte'] }), dang))
      .toEqual({ chinh: 'Bỏ lọc tòa nhà', phu: '2 căn trống ở Sapphire, À La Carte' });
    expect(chuGoiY(g({ loai: 'them_phong_ngu', dieuKien: { ...dang, soPhongNgu: [2, 3] }, soCan: 4 }), dang))
      .toEqual({ chinh: 'Thêm 2PN', phu: '4 căn trống' });
  });
});
