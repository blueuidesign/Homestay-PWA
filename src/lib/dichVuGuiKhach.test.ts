// Test unit dịch vụ gửi khách (YC8.1, US48): đọc jsonb lệnh soạn tin, ảnh có hạn 1 giờ, lệnh ghi lần gửi, lỗi tiếng Việt.
import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { docTin, taoDichVuGuiKhachSupabase } from './dichVuGuiKhach';

const JSON_TIN = {
  tu: '2026-10-10', den: '2026-10-12', so_dem: 2, mau_tin: 'Mẫu [Danh sách căn]', ten_sale: 'Sale Hùng',
  can: [{
    can_id: 'c1509', ma_can: '1509', ten_toa: 'ICON40', so_phong_ngu: 2, so_giuong: 3, so_anh: 12,
    anh: ['hoa/1509-00.jpg', 'hoa/1509-01.jpg'], tong_gia_ban: '2600000',
    chu: 'ICON40 1509 · 2PN · 3 giường, view biển Bãi Cháy\n10/10 → 12/10 (2 đêm): 2.600.000đ',
  }],
};

function sbGia(data: unknown, error: unknown = null) {
  const rpc = vi.fn(async () => ({ data, error }));
  const createSignedUrls = vi.fn(async (ds: string[]) => ({ data: ds.map((p) => ({ path: p, signedUrl: `https://kho/${p}?t=x` })) }));
  const from = vi.fn(() => ({ createSignedUrls }));
  return { sb: { rpc, storage: { from } } as unknown as SupabaseClient, rpc, from, createSignedUrls };
}

describe('YC8.1 · dịch vụ gửi khách', () => {
  it('YC8.1-NT4: đọc chữ và giá bán; tiền dạng chuỗi đổi ra số', () => {
    const t = docTin(JSON_TIN);
    expect(t.can[0]!).toMatchObject({ canId: 'c1509', maCan: '1509', soAnh: 12, tongGiaBan: 2_600_000 });
    expect(t.can[0]!.chu).toContain('2.600.000đ');
    expect([t.tenSale, t.mauTin, t.soDem]).toEqual(['Sale Hùng', 'Mẫu [Danh sách căn]', 2]);
  });

  it('YC8 Dữ liệu: soạn tin gọi fn_soan_tin_gui_khach, ảnh xin đường dẫn có hạn 1 giờ', async () => {
    const g = sbGia(JSON_TIN);
    const t = await taoDichVuGuiKhachSupabase(g.sb).soan(['c1509'], '2026-10-10', '2026-10-12');
    expect(g.rpc).toHaveBeenCalledWith('fn_soan_tin_gui_khach', { p_can_ids: ['c1509'], p_tu: '2026-10-10', p_den: '2026-10-12' });
    expect(g.from).toHaveBeenCalledWith('anh-can');
    expect(g.createSignedUrls).toHaveBeenCalledWith(['hoa/1509-00.jpg', 'hoa/1509-01.jpg'], 3600);
    expect(t.can[0]!.anh).toEqual(['https://kho/hoa/1509-00.jpg?t=x', 'https://kho/hoa/1509-01.jpg?t=x']);
  });

  it('YC8.1-NT2 YC8.1-NT13: ghi lần gửi gọi fn_ghi_lan_gui với các căn và khoảng ngày', async () => {
    const g = sbGia(1);
    await taoDichVuGuiKhachSupabase(g.sb).ghiLanGui(['c1509'], '2026-10-10', '2026-10-12');
    expect(g.rpc).toHaveBeenCalledWith('fn_ghi_lan_gui', { p_can_ids: ['c1509'], p_tu: '2026-10-10', p_den: '2026-10-12' });
  });

  it('YC8.1-NT12 YC8.1-NT6: database từ chối thì lỗi mang câu tiếng Việt', async () => {
    const g = sbGia(null, { code: '22023', message: 'Mỗi lần gửi tối đa 10 căn. Quay lại bỏ bớt căn.' });
    const loi = await taoDichVuGuiKhachSupabase(g.sb).soan(['a'], '2026-10-10', '2026-10-12').catch((e) => e);
    expect(loi).toBeInstanceOf(LoiNguoiDung);
    expect(loi.message).toBe('Mỗi lần gửi tối đa 10 căn. Quay lại bỏ bớt căn.');
  });
});
