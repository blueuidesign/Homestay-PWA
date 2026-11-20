// Test unit chữ của S7-03 · Đặt phòng và yêu cầu của sale (YC11.3, US60). Số theo DLM.6, canvas S7-03.
import { describe, expect, it } from 'vitest';
import {
  CAU_CHU_THICH, dongChinh, dongPhu, docDanhSachSale, manKhiCham, nhanTrangThai, type DongDanhSach,
} from './danhSachSale';

const D = (p: Partial<DongDanhSach>): DongDanhSach => ({
  loai: 'yeu_cau', id: 'x', canId: 'c', maCan: '2208', tenToa: 'À La Carte', ngayNhan: '2026-10-10', ngayTra: '2026-10-12',
  trangThai: 'cho', moc: '2026-10-07T07:20:00+00:00', guiLuc: '2026-10-07T07:20:00+00:00', tienChenh: null, ghiGiup: null,
  tuChoi: null, hetHanVi: null, ...p,
});
const NAY = '2026-10-07';

describe('YC11.3 · chữ danh sách đặt phòng và yêu cầu của sale', () => {
  it('YC11.3-NT1 Y1 chờ: nhãn "Chờ chủ", có giờ gửi, không có tiền chênh', () => {
    const y1 = D({});
    expect(nhanTrangThai(y1).chu).toBe('Chờ chủ');
    expect(dongPhu(y1, NAY)).toBe('Đã gửi yêu cầu 14:20, chờ chủ chấp nhận');
    expect(dongPhu(y1, NAY)).not.toMatch(/chênh|đ$/);
    expect(dongChinh(y1)).toBe('À La Carte 2208 · 10/10 → 12/10');
    // Gửi trước hôm nay thì kèm ngày.
    expect(dongPhu(D({ guiLuc: '2026-10-06T07:20:00+00:00' }), NAY)).toBe('Đã gửi yêu cầu 14:20 ngày 06/10, chờ chủ chấp nhận');
  });

  it('YC11.3-NT2 B1 đã chấp nhận: nhãn "Đã chốt", dòng ghi "chênh 400.000đ"', () => {
    const b1 = D({ loai: 'dat_phong', maCan: '1509', tenToa: 'ICON40', trangThai: 'da_chot', tienChenh: 400_000 });
    expect(nhanTrangThai(b1).chu).toBe('Đã chốt');
    expect(dongPhu(b1, NAY)).toBe('Chủ đã chấp nhận · chênh 400.000đ');
  });

  it('YC11.3-NT3 Y4 bị từ chối: nhãn "Bị từ chối" và dòng ghi lý do', () => {
    const y4 = D({ trangThai: 'bi_tu_choi', tuChoi: 'khong_nhan' });
    expect(nhanTrangThai(y4).chu).toBe('Bị từ chối');
    expect(dongPhu(y4, NAY)).toBe('Chủ không nhận');
    expect(dongPhu(D({ trangThai: 'bi_tu_choi', tuChoi: 'dat_phong_khac' }), NAY)).toBe('Chủ đã nhận đặt phòng khác cùng ngày');
  });

  it('YC11.3-NT4 Y2 quá 2 tuần: nhãn "Hết hạn"; qua ngày nhận thì câu nói qua ngày nhận', () => {
    const y2 = D({ trangThai: 'het_han', hetHanVi: 'qua_14_ngay' });
    expect(nhanTrangThai(y2).chu).toBe('Hết hạn');
    expect(dongPhu(y2, NAY)).toBe('Chủ chưa trả lời trong 2 tuần');
    expect(dongPhu(D({ trangThai: 'het_han', hetHanVi: 'qua_ngay_nhan' }), NAY)).toBe('Đã qua ngày nhận phòng, chủ chưa trả lời');
  });

  it('YC11.3-NT5 Y3 Hùng tự hủy: nhãn "Đã hủy"', () => {
    const y3 = D({ trangThai: 'da_huy' });
    expect(nhanTrangThai(y3).chu).toBe('Đã hủy');
    expect(dongPhu(y3, NAY)).toBe('Bạn đã hủy yêu cầu');
    // QD12: đặt phòng đã hủy (Claude tự chốt US60).
    expect(dongPhu(D({ loai: 'dat_phong', trangThai: 'da_huy', tienChenh: 200_000 }), NAY)).toBe('Đặt phòng đã hủy');
  });

  it('YC11.3-NT6 Chị Hoa ghi 1509 10/10 → 12/10 cho Hùng: "Đã chốt", chênh 400.000đ, "Chị Hoa đã ghi giúp bạn"', () => {
    const h = D({ loai: 'dat_phong', maCan: '1509', tenToa: 'ICON40', trangThai: 'da_chot', tienChenh: 400_000, ghiGiup: 'Chị Hoa' });
    expect(dongChinh(h)).toBe('ICON40 1509 · 10/10 → 12/10');
    expect(nhanTrangThai(h).chu).toBe('Đã chốt');
    expect(dongPhu(h, NAY)).toBe('Chị Hoa đã ghi giúp bạn · chênh 400.000đ');
  });

  it('YC11.3-NT9 chạm yêu cầu mở màn kết quả, chạm đặt phòng mở chi tiết đặt phòng', () => {
    expect(manKhiCham(D({ trangThai: 'bi_tu_choi' }))).toBe('ket-qua');
    expect(manKhiCham(D({ trangThai: 'cho' }))).toBe('ket-qua');
    expect(manKhiCham(D({ loai: 'dat_phong', trangThai: 'da_chot' }))).toBe('dat-phong');
  });

  it('YC11.3 bước 5 chú thích và đọc dữ liệu của lệnh', () => {
    expect(CAU_CHU_THICH).toBe('Chờ chủ → Đã chốt. Chủ từ chối hoặc nhận đặt phòng khác: Bị từ chối. Quá 2 tuần: Hết hạn. Bạn tự hủy: Đã hủy.');
    const kq = docDanhSachSale({
      dong: [{ loai: 'dat_phong', id: 'b1', can_id: 'c', ma_can: '1509', ten_toa: 'ICON40', ngay_nhan: '2026-10-10',
               ngay_tra: '2026-10-12', trang_thai: 'da_chot', moc: 'm', gui_luc: null, tien_chenh: 400000, ghi_giup: null,
               tu_choi: null, het_han_vi: null }],
      con_nua: true,
    });
    expect(kq.conNua).toBe(true);
    expect(kq.dong[0]).toMatchObject({ loai: 'dat_phong', id: 'b1', maCan: '1509', tenToa: 'ICON40', tienChenh: 400_000, guiLuc: null });
  });
});
