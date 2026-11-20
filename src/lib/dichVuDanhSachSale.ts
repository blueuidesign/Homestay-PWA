// Đọc danh sách đặt phòng và yêu cầu của sale qua fn_danh_sach_sale (YC11.3 bước 1; YC11 "Dữ liệu"; QD4; PQ15.SALE).
// Lệnh chỉ trả dòng của người gọi, không nhận mã sale; không có khách, tiền cọc (PQ9.SALE, QD11).
import type { SupabaseClient } from '@supabase/supabase-js';
import { docDanhSachSale, type DanhSachSale } from './danhSachSale';

export interface DichVuDanhSachSale {
  /** YC11 "Dữ liệu": 50 dòng mới nhất trước, bỏ qua boQua dòng đầu. */
  lay(boQua: number): Promise<DanhSachSale>;
}

export function taoDichVuDanhSachSaleSupabase(sb: SupabaseClient): DichVuDanhSachSale {
  return {
    async lay(boQua) {
      const { data, error } = await sb.rpc('fn_danh_sach_sale', { p_bo_qua: boQua });
      if (error) throw error;
      return docDanhSachSale((data ?? {}) as Record<string, unknown>);
    },
  };
}
