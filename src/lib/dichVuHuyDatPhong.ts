// Lệnh hủy đặt phòng có sale fn_tinh_trang_huy, fn_xin_huy, fn_tra_loi_huy (YC5.8, QD12, QD4; PQ7, PQ17). Dùng chung cho
// chi tiết đặt phòng của chủ nhà (CN3-02) và của sale (S3-10).
import type { SupabaseClient } from '@supabase/supabase-js';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { docTinhTrangHuy, type TinhTrangHuy } from './huyDatPhong';

export interface DichVuHuyDatPhong {
  tinhTrangHuy(bookingId: string): Promise<TinhTrangHuy>;
  /** YC5.8 bước 33. Database từ chối thì LoiNguoiDung với câu của database. */
  xinHuy(bookingId: string): Promise<void>;
  /** YC5.8 bước 35, 36. */
  traLoiHuy(bookingId: string, dongY: boolean): Promise<void>;
}

function loiRpc(error: { message?: string; code?: string }): Error {
  if (error.code === '42501' || error.code === 'P0001') return new LoiNguoiDung(error.message ?? 'Có lỗi');
  return Object.assign(new Error(error.message ?? 'Lỗi'), { code: error.code });
}

export function taoDichVuHuySupabase(sb: SupabaseClient): DichVuHuyDatPhong {
  return {
    async tinhTrangHuy(bookingId) {
      const { data, error } = await sb.rpc('fn_tinh_trang_huy', { p_booking_id: bookingId });
      if (error) throw loiRpc(error);
      return docTinhTrangHuy((data ?? {}) as Record<string, unknown>);
    },
    async xinHuy(bookingId) {
      const { error } = await sb.rpc('fn_xin_huy', { p_booking_id: bookingId });
      if (error) throw loiRpc(error);
    },
    async traLoiHuy(bookingId, dongY) {
      const { error } = await sb.rpc('fn_tra_loi_huy', { p_booking_id: bookingId, p_dong_y: dongY });
      if (error) throw loiRpc(error);
    },
  };
}
