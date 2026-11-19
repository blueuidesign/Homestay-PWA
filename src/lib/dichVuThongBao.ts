// YC6.8, PQ19, QD4: sale đọc thông báo "chủ đồng ý kết nối" chưa đọc của chính mình qua RLS (thong_bao_doc).
// Không đánh dấu đã đọc (việc của YC12).
import type { SupabaseClient } from '@supabase/supabase-js';
import { docThongBaoKetNoi, type DongThongBao, type ThongBaoKetNoi } from './toastKetNoi';

export interface DichVuThongBao {
  /** YC6.8: dòng "chủ đồng ý kết nối" chưa đọc, mới trước. */
  layKetNoiChuaDoc(): Promise<ThongBaoKetNoi[]>;
}

export function taoDichVuThongBaoSupabase(sb: SupabaseClient): DichVuThongBao {
  return {
    async layKetNoiChuaDoc() {
      const { data, error } = await sb.from('thong_bao').select('id, noi_dung')
        .eq('loai', 'chu_dong_y_ket_noi').is('doc_luc', null)
        .order('tao_luc', { ascending: false }).limit(20);
      if (error) throw Object.assign(new Error((error as { message?: string }).message ?? 'Lỗi'), error);
      return ((data ?? []) as DongThongBao[]).map(docThongBaoKetNoi);
    },
  };
}
