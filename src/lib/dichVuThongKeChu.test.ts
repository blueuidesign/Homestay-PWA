// Test unit dịch vụ thống kê chủ nhà (YC11.1 bước 1, 8): gọi fn_thong_ke_chu đúng tháng, lỗi thì ném ra (HV2).
import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { taoDichVuThongKeChuSupabase } from './dichVuThongKeChu';

function sbGia(kq: { data: unknown; error: unknown }) {
  const rpc = vi.fn(async () => kq);
  return { sb: { rpc } as unknown as SupabaseClient, rpc };
}

describe('YC11.1 · dịch vụ thống kê chủ nhà', () => {
  it('YC11.1-NT5 chạm T11 thì đọc tháng 11/2026: p_thang = 2026-11-01, không gửi mã chủ nhà', async () => {
    const { sb, rpc } = sbGia({ data: { thang: '2026-11-01', doanh_thu: 800000, can: [], cac_thang: [], nguoi_ban: [], chua_thu: [] }, error: null });
    const tk = await taoDichVuThongKeChuSupabase(sb).layThang(2026, 11);
    expect(rpc).toHaveBeenCalledWith('fn_thong_ke_chu', { p_thang: '2026-11-01' });
    expect(tk.doanhThu).toBe(800_000);
  });
  it('HV2: lệnh lỗi thì ném ra để màn báo chưa tải được', async () => {
    const { sb } = sbGia({ data: null, error: new Error('mạng') });
    await expect(taoDichVuThongKeChuSupabase(sb).layThang(2026, 10)).rejects.toThrow('mạng');
  });
});
