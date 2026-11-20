// Test unit chữ của S3-04, S3-05, S3-09 · Sale nhận kết quả (YC9.4, US53).
import { describe, expect, it } from 'vitest';
import {
  chuBiTuChoi, chuDaChapNhan, chuHetHan, docKetQua, gioNgayGui, manKetQua, theTuongTu,
} from './ketQuaYeuCau';

describe('YC9.4 · chữ kết quả yêu cầu', () => {
  it('YC9.4-NT1 S3-04: "Chị Hoa đã chấp nhận đặt phòng", 10/10 → 12/10 hiện Kín với các sale khác', () => {
    expect(chuDaChapNhan('Chị Hoa', '2026-10-10', '2026-10-12')).toEqual({
      tieuDe: 'Chị Hoa đã chấp nhận đặt phòng',
      chu: 'Đặt phòng đã vào lịch của chủ nhà. Ngày 10/10 → 12/10 hiện Kín với các sale khác.',
    });
    expect(manKetQua('da_chot')).toBe('S3-04');
    expect(manKetQua('da_chot', true)).toBe('S3-04-01');
  });

  it('YC9.4-NT2 S3-05: "Lý do: Chị Hoa không nhận đặt phòng · Đã có khách đặt."', () => {
    expect(chuBiTuChoi('Chị Hoa', 'Đã có khách đặt', '2026-10-10', '2026-10-12'))
      .toBe('Lý do: Chị Hoa không nhận đặt phòng · Đã có khách đặt.');
    expect(chuBiTuChoi('Chị Hoa', null, '2026-10-10', '2026-10-12')).toBe('Lý do: Chị Hoa không nhận đặt phòng.');
    expect(manKetQua('bi_tu_choi')).toBe('S3-05');
  });

  it('YC9.4-NT3 bị từ chối vì nhận đặt phòng khác: "Chị Hoa đã nhận đặt phòng khác cho 10/10 → 12/10."', () => {
    expect(chuBiTuChoi('Chị Hoa', 'Đã nhận đặt phòng khác', '2026-10-10', '2026-10-12'))
      .toContain('Chị Hoa đã nhận đặt phòng khác cho 10/10 → 12/10.');
  });

  it('YC9.4-NT4 S3-09: "Yêu cầu đã hết hạn vì Chị Hoa chưa trả lời trong 2 tuần. Gửi lúc 14:20 ngày 22/09."', () => {
    expect(chuHetHan('Chị Hoa', 'qua_14_ngay', '2026-10-10', '2026-09-22T07:20:00+00:00'))
      .toBe('Yêu cầu đã hết hạn vì Chị Hoa chưa trả lời trong 2 tuần. Gửi lúc 14:20 ngày 22/09.');
    expect(manKetQua('het_han')).toBe('S3-09');
  });

  it('YC9.4-NT8 qua ngày nhận 10/10: "Yêu cầu đã hết hạn vì đã qua ngày nhận phòng 10/10."', () => {
    expect(chuHetHan('Chị Hoa', 'qua_ngay_nhan', '2026-10-10', '2026-10-06T07:20:00+00:00'))
      .toBe('Yêu cầu đã hết hạn vì đã qua ngày nhận phòng 10/10. Gửi lúc 14:20 ngày 06/10.');
  });

  it('YC9.4-NT5 thẻ căn tương tự: "Sapphire 1103 · 3PN", "Bạn bán 1.600.000đ · Anh Tuấn"', () => {
    expect(theTuongTu({ canId: 'c', maCan: '1103', tenToa: 'Sapphire', soPhongNgu: 3, tenChu: 'Anh Tuấn', tongGiaBan: 1_600_000,
                        tu: '2026-10-10', den: '2026-10-12' }))
      .toEqual({ ten: 'Sapphire 1103 · 3PN', phu: 'Bạn bán 1.600.000đ · Anh Tuấn' });
  });

  it('YC9.4 giờ gửi theo giờ Việt Nam; chờ, đã hủy không phải màn kết quả', () => {
    expect(gioNgayGui('2026-09-21T17:05:00Z')).toBe('00:05 ngày 22/09');
    expect(manKetQua('cho')).toBeNull();
    expect(manKetQua('da_huy')).toBeNull();
    expect(docKetQua({ id: 'y', can_id: 'c', ma_can: '1', chu: { ten: 'A' }, ngay_nhan: '2026-10-10', ngay_tra: '2026-10-12',
                       trang_thai: 'het_han', het_han_vi: 'la' }).hetHanVi).toBeNull();
  });
});
