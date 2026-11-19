// Test unit dịch vụ link xin lịch (YC6.4): link, tin soạn sẵn, chọn màn A5, A7-00, A7, giờ gửi gần nhất.
import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { chonManXinLich, duongDanLinkXinLich, lucGuiGanNhat, taoDichVuXinLichSupabase, tinXinLich } from './dichVuXinLich';

const SO = { ma: 'abcDEF', soLanGui: 0, guiCuoiLuc: null, soChuDongY: 0, coNguon: false };

describe('YC6.4 · dịch vụ link xin lịch', () => {
  it('YC6.4-NT1 tin soạn sẵn có tên sale và link https /x/<mã> trên tên miền đang chạy app', () => {
    const link = duongDanLinkXinLich('https://home247.vidu.test/', 'kQmZpRtw');
    expect(link).toBe('https://home247.vidu.test/x/kQmZpRtw');
    const tin = tinXinLich('Sale Hùng', link);
    expect(tin).toContain('Chào anh/chị, em là Sale Hùng, sale phòng ở Hạ Long.');
    expect(tin).toContain('Anh/chị bấm link dưới đây để cho em xem lịch phòng trống.');
    expect(tin.endsWith(link)).toBe(true);
  });

  it('YC6.4 bước 4 chọn màn: chưa mở A6 thì A5, có link chưa gửi thì A7-00, đã gửi thì A7, có nguồn thì không', () => {
    expect(chonManXinLich({ ...SO, ma: null })).toBe('A5');
    expect(chonManXinLich(SO)).toBe('A7-00');
    expect(chonManXinLich({ ...SO, soLanGui: 3 })).toBe('A7');
    expect(chonManXinLich({ ...SO, soLanGui: 3, coNguon: true })).toBe('co-nguon');
  });

  it('YC6.4 A7 lần gửi gần nhất theo giờ Việt Nam', () => {
    const bay = new Date('2026-11-19T10:00:00Z'); // 17:00 giờ Việt Nam
    expect(lucGuiGanNhat('2026-11-19T09:59:30Z', bay)).toBe('vừa xong');
    expect(lucGuiGanNhat('2026-11-19T07:20:00Z', bay)).toBe('14:20 hôm nay');
    expect(lucGuiGanNhat('2026-11-18T07:20:00Z', bay)).toBe('14:20 hôm qua');
    expect(lucGuiGanNhat('2026-11-12T07:20:00Z', bay)).toBe('14:20 ngày 12/11');
    expect(lucGuiGanNhat('2026-11-18T17:30:00Z', bay)).toBe('00:30 hôm nay');
  });

  it('YC6.4-NT2 dịch vụ gọi đúng hàm database và đổi dữ liệu', async () => {
    const rpc = vi.fn(async (ten: string) => {
      if (ten === 'xin_lich_cua_toi') {
        return { data: [{ ma: 'abc', so_lan_gui: 3, gui_cuoi_luc: '2026-11-19T07:20:00Z', so_chu_dong_y: 0, co_nguon: false }], error: null };
      }
      if (ten === 'fn_lay_link_xin_lich') return { data: 'abc', error: null };
      return { data: [{ ma: 'abc', so_lan_gui: 4, gui_cuoi_luc: '2026-11-19T08:00:00Z' }], error: null };
    });
    const dv = taoDichVuXinLichSupabase({ rpc } as unknown as SupabaseClient);
    expect(await dv.doc()).toEqual({ ma: 'abc', soLanGui: 3, guiCuoiLuc: '2026-11-19T07:20:00Z', soChuDongY: 0, coNguon: false });
    expect(await dv.layLink()).toBe('abc');
    expect(await dv.ghiLanGui()).toEqual({ soLanGui: 4, guiCuoiLuc: '2026-11-19T08:00:00Z' });
    expect(rpc.mock.calls.map((c) => c[0])).toEqual(['xin_lich_cua_toi', 'fn_lay_link_xin_lich', 'fn_gui_link_xin_lich']);
  });
});
