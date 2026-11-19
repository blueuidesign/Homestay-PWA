// US42 · YC6.8: đọc thông báo "chủ đồng ý kết nối" chưa đọc của chính sale qua RLS.
import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import { taoDichVuThongBaoSupabase } from './dichVuThongBao';

function sbGia(ket: { data: unknown; error: unknown }) {
  const goi: Record<string, unknown[]> = {};
  const q: Record<string, unknown> = {};
  for (const ten of ['select', 'eq', 'is', 'order', 'limit']) {
    q[ten] = vi.fn((...a: unknown[]) => { goi[ten] = a; return ten === 'limit' ? Promise.resolve(ket) : q; });
  }
  const from = vi.fn(() => q);
  return { sb: { from } as unknown as SupabaseClient, from, goi };
}

describe('YC6.8 · dịch vụ thông báo', () => {
  it('YC6.8 đọc dòng chưa đọc loại chu_dong_y_ket_noi, mới trước, đổi sang dạng toast', async () => {
    const { sb, from, goi } = sbGia({
      data: [{ id: 'a', noi_dung: { ten_chu: 'Chị Hoa', so_can: 1, so_chu: 1, cac_chu: [{ ten: 'Chị Hoa', so_can: 1, cac_can: [{ toa: 'ICON40', ma: '1509' }] }] } }],
      error: null,
    });
    const ds = await taoDichVuThongBaoSupabase(sb).layKetNoiChuaDoc();
    expect(from).toHaveBeenCalledWith('thong_bao');
    expect(goi.eq).toEqual(['loai', 'chu_dong_y_ket_noi']);
    expect(goi.is).toEqual(['doc_luc', null]);
    expect(goi.order).toEqual(['tao_luc', { ascending: false }]);
    expect(ds).toEqual([{ id: 'a', soChu: 1, soCan: 1, cacChu: [{ ten: 'Chị Hoa', soCan: 1, cacCan: [{ toa: 'ICON40', ma: '1509' }] }] }]);
  });

  it('YC6.8 HV2 lỗi đọc thì ném lỗi', async () => {
    const { sb } = sbGia({ data: null, error: { message: 'mất mạng' } });
    await expect(taoDichVuThongBaoSupabase(sb).layKetNoiChuaDoc()).rejects.toBeTruthy();
  });
});
