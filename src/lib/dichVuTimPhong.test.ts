// Test unit dịch vụ tìm phòng (YC7.2, US44): đọc kết quả fn_sale_tim và dòng tim_gan_day.
import { describe, expect, it } from 'vitest';
import { docGanDay, docKetQuaTim } from './dichVuTimPhong';

describe('YC7.2 · dịch vụ tìm phòng', () => {
  it('YC7.2-NT3 đọc gợi ý kèm số căn trống và điều kiện để tìm lại; gợi ý 0 căn bỏ đi', () => {
    const kq = docKetQuaTim({
      so_can_trong: 0, can: [],
      goi_y: [
        { loai: 'doi_ngay', tu: '2026-10-11', den: '2026-10-13', so_phong_ngu: [3], toa_nha: ['t1'], view: null, so_can: 3, ten_toa: ['ICON40'] },
        { loai: 'bo_loc_toa', tu: '2026-10-10', den: '2026-10-12', so_phong_ngu: [3], toa_nha: null, view: null, so_can: 0, ten_toa: [] },
      ],
    });
    expect(kq.soCanTrong).toBe(0);
    expect(kq.goiY).toEqual([{
      loai: 'doi_ngay', soCan: 3, tenToa: ['ICON40'],
      dieuKien: { nhan: '2026-10-11', tra: '2026-10-13', soPhongNgu: [3], toaNha: ['t1'], view: [] },
    }]);
  });

  it('YC7.2 bước 5 đọc căn: giá bigint dạng chuỗi về số, căn tự nhập có cờ không có lịch', () => {
    const kq = docKetQuaTim({
      so_can_trong: 1,
      can: [
        { can_id: 'a', nhom: 'nguon', ma_can: '1509', ten_toa: 'ICON40', ten_chu: 'Chị Hoa', so_phong_ngu: 2, loai_view: 'bien',
          lich_doi_luc: null, tong_gia_chu: '2200000', tong_gia_ban: 2600000, khong_co_lich: false },
        { can_id: 'b', nhom: 'tu_nhap', ma_can: 'Villa', ten_toa: null, ten_chu: 'Chú Bình', so_phong_ngu: null, loai_view: null,
          lich_doi_luc: null, tong_gia_chu: null, tong_gia_ban: null, khong_co_lich: true },
        { can_id: 'c', nhom: 'la', ma_can: 'x' },
      ],
    });
    expect(kq.can.map((c) => [c.maCan, c.tongGiaChu, c.tongGiaBan, c.khongCoLich]))
      .toEqual([['1509', 2_200_000, 2_600_000, false], ['Villa', null, null, true]]);
  });

  it('YC7.2-NT4 dòng tìm gần đây đọc ra điều kiện đầy đủ; khóa thiếu là không lọc', () => {
    expect(docGanDay({ tu_ngay: '2026-10-10', den_ngay: '2026-10-12', bo_loc: { so_phong_ngu: [2], toa_nha: ['t1'] } }))
      .toEqual({ nhan: '2026-10-10', tra: '2026-10-12', soPhongNgu: [2], toaNha: ['t1'], view: [] });
    expect(docGanDay({ tu_ngay: '2026-10-17', den_ngay: '2026-10-18', bo_loc: { view: ['bien', 'vinh'] } }).view).toEqual(['bien']);
  });
});
