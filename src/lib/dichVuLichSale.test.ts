// Test unit dịch vụ lịch của sale (YC7.1, KT-DB.3.5): gọi fn_sale_lich, đổi dòng sang dạng màn dùng.
import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { docDongLichSale, taoDichVuLichSaleSupabase } from './dichVuLichSale';

const DONG = {
  can_id: 'c1', nhom: 'nguon', ma_can: '3402', ten_toa: null, ten_chu: 'Chị Hoa', so_phong_ngu: 1, loai_view: null,
  lich_doi_luc: '2026-10-07T03:00:00Z', so_ban: 2, dem: '2026-10-08', o: 'trong', gia_ban: '1200000',
};

describe('YC7.1 · dịch vụ lịch của sale', () => {
  it('YC7.1-NT3 đọc giá bán bigint dạng chuỗi thành số nguyên đồng', () => {
    const [d] = docDongLichSale([DONG]);
    expect(d).toMatchObject({ canId: 'c1', nhom: 'nguon', maCan: '3402', tenChu: 'Chị Hoa', dem: '2026-10-08', o: 'trong', giaBan: 1_200_000, soBan: 2 });
  });

  it('YC7.1 dòng có nhóm hay ô lạ bị bỏ; rỗng là chưa có căn', () => {
    expect(docDongLichSale([{ ...DONG, o: 'trong_lam' }, { ...DONG, nhom: 'khac' }])).toEqual([]);
    expect(docDongLichSale(null)).toEqual([]);
  });

  it('YC7.1 bước 2 gọi fn_sale_lich với khoảng [tu, den); lỗi thì ném', async () => {
    const rpc = vi.fn(async () => ({ data: [DONG], error: null }));
    const dv = taoDichVuLichSaleSupabase({ rpc } as unknown as SupabaseClient);
    expect(await dv.doc('2026-10-07', '2026-10-14')).toHaveLength(1);
    expect(rpc).toHaveBeenCalledWith('fn_sale_lich', { p_tu: '2026-10-07', p_den: '2026-10-14' });
    rpc.mockResolvedValueOnce({ data: null, error: { message: 'mất mạng', code: '' } } as never);
    await expect(dv.doc('2026-10-07', '2026-10-14')).rejects.toThrow('mất mạng');
  });
});
