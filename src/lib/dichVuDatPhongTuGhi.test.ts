// Test unit dịch vụ đặt phòng tự ghi (YC10.4, US57): tham số lệnh, đọc giá điền sẵn, lỗi của database.
import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { taoDichVuDatPhongTuGhiSupabase } from './dichVuDatPhongTuGhi';

function sbGia(kq: Record<string, { data?: unknown; error?: unknown }>) {
  const rpc = vi.fn(async (ten: string, _p?: unknown) => ({ data: kq[ten]?.data ?? null, error: kq[ten]?.error ?? null }));
  return { sb: { rpc } as unknown as SupabaseClient, rpc };
}

describe('YC10.4 · dịch vụ đặt phòng tự ghi', () => {
  it('YC10.4-NT2 điền sẵn đọc tra_chu, thu_khach; null là ô trống', async () => {
    const g = sbGia({ fn_gia_dien_san_tu_ghi: { data: { tra_chu: 1400000, thu_khach: 1600000, dem: [] } } });
    expect(await taoDichVuDatPhongTuGhiSupabase(g.sb).dienSan('villa', '2026-10-08', '2026-10-09'))
      .toEqual({ traChu: 1_400_000, thuKhach: 1_600_000 });
    expect(g.rpc).toHaveBeenCalledWith('fn_gia_dien_san_tu_ghi', { p_can_id: 'villa', p_ngay_nhan: '2026-10-08', p_ngay_tra: '2026-10-09' });
    const g2 = sbGia({ fn_gia_dien_san_tu_ghi: { data: { tra_chu: null, thu_khach: null, dem: [] } } });
    expect(await taoDichVuDatPhongTuGhiSupabase(g2.sb).dienSan('villa', '2026-10-08', '2026-10-09')).toEqual({ traChu: null, thuKhach: null });
  });

  it('YC10.4-NT3 HV1-NT1 ghi gửi đúng trả chủ, thu khách và mã lần gửi', async () => {
    const g = sbGia({ fn_ghi_dat_phong_tu_ghi: { data: 'V2' } });
    expect(await taoDichVuDatPhongTuGhiSupabase(g.sb).ghi({
      canId: 'villa', ngayNhan: '2026-10-08', ngayTra: '2026-10-09', traChu: 1_400_000, thuKhach: 1_700_000, clientId: 'c1',
    })).toBe('V2');
    expect(g.rpc).toHaveBeenCalledWith('fn_ghi_dat_phong_tu_ghi', {
      p_can_id: 'villa', p_ngay_nhan: '2026-10-08', p_ngay_tra: '2026-10-09', p_tra_chu: 1400000, p_thu_khach: 1700000, p_client_id: 'c1',
    });
  });

  it('YC10.4-NT5 database từ chối vì trùng đêm (P0001) thì LoiNguoiDung giữ câu đó', async () => {
    const g = sbGia({ fn_ghi_dat_phong_tu_ghi: { error: { code: 'P0001', message: 'Bạn đã ghi đặt phòng cho căn này đêm 08/10' } } });
    await expect(taoDichVuDatPhongTuGhiSupabase(g.sb).ghi({
      canId: 'villa', ngayNhan: '2026-10-08', ngayTra: '2026-10-10', traChu: 1, thuKhach: 1, clientId: 'c',
    })).rejects.toEqual(new LoiNguoiDung('Bạn đã ghi đặt phòng cho căn này đêm 08/10'));
  });

  it('YC10.4-NT8 YC10.4-NT9 sửa, xóa gửi mã đặt phòng', async () => {
    const g = sbGia({});
    const dv = taoDichVuDatPhongTuGhiSupabase(g.sb);
    await dv.sua('V2', { ngayNhan: '2026-10-08', ngayTra: '2026-10-09', traChu: 1_400_000, thuKhach: 1_800_000 });
    expect(g.rpc).toHaveBeenCalledWith('fn_sua_dat_phong_tu_ghi', {
      p_booking_id: 'V2', p_ngay_nhan: '2026-10-08', p_ngay_tra: '2026-10-09', p_tra_chu: 1400000, p_thu_khach: 1800000,
    });
    await dv.xoa('V2');
    expect(g.rpc).toHaveBeenCalledWith('fn_xoa_dat_phong_tu_ghi', { p_booking_id: 'V2' });
  });

  it('YC10.4-NT9 PQ14.SALE không còn quyền (42501) thì LoiNguoiDung', async () => {
    const g = sbGia({ fn_xoa_dat_phong_tu_ghi: { error: { code: '42501', message: 'Không tìm thấy đặt phòng' } } });
    await expect(taoDichVuDatPhongTuGhiSupabase(g.sb).xoa('V2')).rejects.toEqual(new LoiNguoiDung('Không tìm thấy đặt phòng'));
  });
});
