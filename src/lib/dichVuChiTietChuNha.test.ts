// Test unit dịch vụ S6-04 (YC10.2, US55): đọc jsonb của fn_chi_tiet_chu_nha, gọi đúng hàm, giữ mã lỗi.
import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { docChiTietChuNha, taoDichVuChiTietChuNhaSupabase } from './dichVuChiTietChuNha';

describe('YC10.2 · dịch vụ S6-04', () => {
  it('YC10.2-NT1 đọc căn và giá đêm; căn chưa có giá là null', () => {
    const ct = docChiTietChuNha({
      trang_thai: 'da_ket_noi', ket_noi_id: 'k', chu_id: 'hoa', ten_chu: 'Chị Hoa', so_dien_thoai: '0904118772',
      ket_noi_tu: '2026-08-02', cap_nhat_luc: '2026-11-20T08:00:00+00:00', xem_coc: true, so_dat_phong: 12, tien_chenh: 6400000,
      can: [{ can_id: 'c1', ma_can: '1509', ten_toa: 'ICON40', so_phong_ngu: 2, so_giuong: 3, loai_view: 'bien', gia_dem: 1800000 },
            { can_id: 'c2', ma_can: '3402', ten_toa: null, so_phong_ngu: 1, so_giuong: null, loai_view: 'bien', gia_dem: null }],
    });
    expect(ct.trangThai).toBe('da_ket_noi');
    if (ct.trangThai !== 'da_ket_noi') return;
    expect(ct.can.map((c) => [c.maCan, c.giaDem])).toEqual([['1509', 1_800_000], ['3402', null]]);
    expect([ct.soDatPhong, ct.tienChenh, ct.xemCoc, ct.ketNoiTu]).toEqual([12, 6_400_000, true, '2026-08-02']);
  });

  it('YC10.2-NT7 không còn quyền: chỉ lý do và tên, không căn, không số', () => {
    const ct = docChiTietChuNha({ trang_thai: 'khong_con_quyen', ly_do: 'chu_ngung', ket_noi_id: 'k', chu_id: 'hoa', ten_chu: 'Chị Hoa' });
    expect(ct).toEqual({ trangThai: 'khong_con_quyen', lyDo: 'chu_ngung', ketNoiId: 'k', chuId: 'hoa', tenChu: 'Chị Hoa' });
  });

  it('YC10.2-NT4 bỏ nguồn gọi fn_sale_bo_nguon; lỗi quyền giữ mã 42501', async () => {
    const rpc = vi.fn(async () => ({ data: null, error: { code: '42501', message: 'Không tìm thấy chủ nhà' } }));
    const dv = taoDichVuChiTietChuNhaSupabase({ rpc } as unknown as SupabaseClient);
    const loi = await dv.boNguon('k').catch((e: unknown) => e);
    expect(rpc).toHaveBeenCalledWith('fn_sale_bo_nguon', { p_ket_noi_id: 'k' });
    expect(loi).toBeInstanceOf(LoiNguoiDung);
    expect((loi as { code?: string }).code).toBe('42501');
  });

  it('YC10.2 đọc gọi fn_chi_tiet_chu_nha với kết nối', async () => {
    const rpc = vi.fn(async () => ({ data: { trang_thai: 'khong_con_quyen', ly_do: 'chu_xoa_tai_khoan', ket_noi_id: 'k', chu_id: 'h', ten_chu: 'X' }, error: null }));
    const dv = taoDichVuChiTietChuNhaSupabase({ rpc } as unknown as SupabaseClient);
    expect((await dv.doc('k')).trangThai).toBe('khong_con_quyen');
    expect(rpc).toHaveBeenCalledWith('fn_chi_tiet_chu_nha', { p_ket_noi_id: 'k' });
  });
});
