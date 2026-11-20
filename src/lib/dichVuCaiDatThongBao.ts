// Cài đặt thông báo của chính người gọi (YC12.4, QD4, PQ11, PQ19): đọc các loại đã tắt qua RLS cai_dat_rieng_doc,
// ghi qua fn_dat_cai_dat_thong_bao.
import type { SupabaseClient } from '@supabase/supabase-js';
import { LoiNguoiDung } from '../chung/matKetNoi';

export interface DichVuCaiDatThongBao {
  /** YC12.4 bước 1: các loại đã tắt (loại không có trong danh sách là đang bật). */
  doc(): Promise<string[]>;
  /** YC12.4 bước 4: ghi các loại đã tắt (thay cả danh sách). */
  luu(tat: string[]): Promise<void>;
}

export function taoDichVuCaiDatThongBaoSupabase(sb: SupabaseClient): DichVuCaiDatThongBao {
  return {
    async doc() {
      const { data: u } = await sb.auth.getUser();
      const id = u.user?.id;
      if (!id) throw new Error('Chưa đăng nhập');
      const { data, error } = await sb.from('cai_dat_rieng').select('thong_bao_tat').eq('nguoi_id', id).maybeSingle();
      if (error) throw error;
      return (data?.thong_bao_tat as string[] | undefined) ?? [];
    },
    async luu(tat) {
      const { error } = await sb.rpc('fn_dat_cai_dat_thong_bao', { p_tat: tat });
      if (!error) return;
      if (error.code === '22023' || error.code === '42501') throw new LoiNguoiDung(error.message);
      throw error;
    },
  };
}
