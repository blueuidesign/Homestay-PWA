// Test unit dịch vụ thống kê của sale (YC11.2 bước 1, YC11-H8): gọi fn_thong_ke_sale tháng đang xem, không gửi mã sale.
import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { taoDichVuThongKeSaleSupabase } from './dichVuThongKeSale';

function sbGia(kq: { data: unknown; error: unknown }) {
  const rpc = vi.fn(async () => kq);
  return { sb: { rpc } as unknown as SupabaseClient, rpc };
}

describe('YC11.2 · dịch vụ thống kê của sale', () => {
  it('YC11.2-NT1 đọc tháng 10/2026: p_thang = 2026-10-01, đổi sang kiểu của màn', async () => {
    const { sb, rpc } = sbGia({ data: {
      thang: '2026-10-01', so_dat_phong: 6, doanh_so: 10600000, tien_chenh: 1600000, so_dat_phong_thang_truoc: 4,
      doanh_so_thang_truoc: 9800000, tien_chenh_thang_truoc: 1200000,
      theo_chu: [{ chu_id: null, tu_nhap: true, ten: 'Chú Bình', doanh_so: 1600000, tien_chenh: 200000 }],
      cho_chu: [{ yeu_cau_id: 'y1', can_id: 'c', ma_can: '2208', ten_toa: 'À La Carte', ngay_nhan: '2026-10-10',
                  ngay_tra: '2026-10-12', gui_luc: '2026-10-07T07:20:00+00:00', ten_chu: 'Anh Tuấn' }],
      so_cho_chu: 1 }, error: null });
    const tk = await taoDichVuThongKeSaleSupabase(sb).layThang(2026, 10);
    expect(rpc).toHaveBeenCalledWith('fn_thong_ke_sale', { p_thang: '2026-10-01' });
    expect([tk.soDatPhong, tk.doanhSo, tk.tienChenh, tk.tienChenhThangTruoc]).toEqual([6, 10_600_000, 1_600_000, 1_200_000]);
    expect(tk.theoChu[0]).toEqual({ chuId: null, tuNhap: true, ten: 'Chú Bình', doanhSo: 1_600_000, tienChenh: 200_000 });
    expect(tk.choChu[0]?.tenToa).toBe('À La Carte');
  });
  it('HV2: lệnh lỗi thì ném ra để màn báo chưa tải được', async () => {
    const { sb } = sbGia({ data: null, error: new Error('mạng') });
    await expect(taoDichVuThongKeSaleSupabase(sb).layThang(2026, 10)).rejects.toThrow('mạng');
  });
});
