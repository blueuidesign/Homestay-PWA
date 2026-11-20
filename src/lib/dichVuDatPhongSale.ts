// Đặt phòng phía sale qua fn_sale_xem_dat_phong, fn_sale_sua_gia_ban (YC5.9; QD4; PQ8.SALE, PQ11.SALE).
// Lệnh chỉ trả đặt phòng người gọi đứng tên; không có tiền cọc, khách chủ nhập (QD7, QD11).
import type { SupabaseClient } from '@supabase/supabase-js';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { docDatPhongSale, type DatPhongSale } from './datPhongSale';

export interface DichVuDatPhongSale {
  /** YC5.9 bước 38. */
  xem(bookingId: string): Promise<DatPhongSale>;
  /** YC5.9 bước 39: lưu giá bán của mình. */
  suaGiaBan(bookingId: string, giaBan: number): Promise<void>;
}

function loiRpc(error: { message?: string; code?: string }): Error {
  // 42501: không phải đặt phòng của người gọi (HV5); P0001: câu tiếng Việt của database (luật kiểm).
  if (error.code === '42501' || error.code === 'P0001') return new LoiNguoiDung(error.message ?? 'Có lỗi');
  return Object.assign(new Error(error.message ?? 'Lỗi'), { code: error.code });
}

export function taoDichVuDatPhongSaleSupabase(sb: SupabaseClient): DichVuDatPhongSale {
  return {
    async xem(bookingId) {
      const { data, error } = await sb.rpc('fn_sale_xem_dat_phong', { p_booking_id: bookingId });
      if (error) throw loiRpc(error);
      return docDatPhongSale((data ?? {}) as Record<string, unknown>);
    },
    async suaGiaBan(bookingId, giaBan) {
      const { error } = await sb.rpc('fn_sale_sua_gia_ban', { p_booking_id: bookingId, p_gia_ban: giaBan });
      if (error) throw loiRpc(error);
    },
  };
}
