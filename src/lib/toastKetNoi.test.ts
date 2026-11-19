// US42 · YC6.8: chữ toast A9, A9-02 và nhớ dòng đã hiện.
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  chonToastMoi, chuToast, daHienToast, docThongBaoKetNoi, khoaToast, nhoDaHien, type ThongBaoKetNoi,
} from './toastKetNoi';

const HOA = { ten: 'Chị Hoa', soCan: 2, cacCan: [{ toa: 'ICON40', ma: '1509' }, { toa: null, ma: '3402' }] };
const TUAN = { ten: 'Anh Tuấn', soCan: 1, cacCan: [{ toa: 'Sapphire', ma: '1103' }] };
const BINH = { ten: 'Chú Bình', soCan: 4, cacCan: [{ toa: 'Sapphire', ma: '1201' }, { toa: 'Sapphire', ma: '1202' }, { toa: null, ma: '1203' }] };
const mot = (id: string, chu = HOA): ThongBaoKetNoi => ({ id, soChu: 1, soCan: chu.soCan, cacChu: [chu] });

describe('YC6.8 · chữ toast', () => {
  it('YC6.8-NT1 một chủ nhà: tên Chị Hoa và các căn mới (A9)', () => {
    expect(chuToast(mot('a'))).toEqual({
      dong1: 'Chị Hoa đã đồng ý cho bạn xem lịch',
      dong2: 'ICON40 1509 và 3402 đã vào Nguồn phòng',
    });
  });

  it('YC6.8 r11 nhiều hơn 3 căn thì "và N căn khác"; ba căn thì liệt kê đủ', () => {
    expect(chuToast(mot('a', BINH)).dong2).toBe('Sapphire 1201, Sapphire 1202 và 2 căn khác đã vào Nguồn phòng');
    const ba = { ten: 'Chú Bình', soCan: 3, cacCan: BINH.cacCan };
    expect(chuToast(mot('a', ba)).dong2).toBe('Sapphire 1201, Sapphire 1202 và 1203 đã vào Nguồn phòng');
  });

  it('YC6.8 r11 chủ nhà chưa có căn nào', () => {
    expect(chuToast(mot('a', { ten: 'Anh Tuấn', soCan: 0, cacCan: [] })).dong2).toBe('Chưa có căn nào, căn mới sẽ tự hiện');
  });

  it('YC6.8-NT2 ba chủ nhà gom một toast (A9-02)', () => {
    const tb: ThongBaoKetNoi = { id: 'g', soChu: 3, soCan: 7, cacChu: [HOA, TUAN, BINH] };
    expect(chuToast(tb)).toEqual({
      dong1: '3 chủ nhà đã đồng ý cho bạn xem lịch',
      dong2: 'Chị Hoa, Anh Tuấn và Chú Bình · 7 căn mới trong Nguồn phòng',
    });
  });

  it('YC6.8 r11 nhiều hơn 3 chủ nhà thì "và N người khác"', () => {
    const nam = [HOA, TUAN, BINH, { ...TUAN, ten: 'Cô Mai' }, { ...TUAN, ten: 'Bác Sơn' }];
    const tb: ThongBaoKetNoi = { id: 'g', soChu: 5, soCan: 9, cacChu: nam };
    expect(chuToast(tb).dong2).toBe('Chị Hoa, Anh Tuấn và 3 người khác · 9 căn mới trong Nguồn phòng');
  });

  it('YC6.8 đọc dòng thông báo từ database; dòng cũ (trước US42) chỉ có ten_chu, so_can', () => {
    expect(docThongBaoKetNoi({
      id: 'x', noi_dung: { ten_chu: 'Chị Hoa', so_can: 2, so_chu: 1, cac_chu: [{ ten: 'Chị Hoa', so_can: 2, cac_can: [{ toa: 'ICON40', ma: '1509' }, { toa: null, ma: '3402' }] }] },
    })).toEqual(mot('x'));
    expect(docThongBaoKetNoi({ id: 'y', noi_dung: { ten_chu: 'Chị Hoa', so_can: 0 } }))
      .toEqual({ id: 'y', soChu: 1, soCan: 0, cacChu: [{ ten: 'Chị Hoa', soCan: 0, cacCan: [] }] });
  });
});

describe('YC6.8 · nhớ dòng đã hiện', () => {
  afterEach(() => { vi.restoreAllMocks(); try { localStorage.clear(); } catch { /* */ } });

  it('YC6.8-NT4 dòng đã hiện thì không chọn lại; dòng được gom thêm thì chọn lại', () => {
    const a = mot('a');
    nhoDaHien([khoaToast(a)]);
    expect(daHienToast().has('a:1')).toBe(true);
    expect(chonToastMoi([a], daHienToast())).toBeNull();
    const gom: ThongBaoKetNoi = { id: 'a', soChu: 2, soCan: 3, cacChu: [HOA, TUAN] };
    expect(chonToastMoi([gom], daHienToast())).toBe(gom);
  });

  it('YC6.8 r11 máy không cho lưu thì vẫn chạy (pwa.md P10)', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('chặn'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('chặn'); });
    expect(() => nhoDaHien(['a:1'])).not.toThrow();
    expect(daHienToast().size).toBe(0);
  });
});
