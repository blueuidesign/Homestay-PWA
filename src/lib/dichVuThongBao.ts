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

/**
 * Màn mở khi chạm một thông báo. YC12 "Sale gửi yêu cầu đặt phòng", YC9.2-NT1: mở đúng yêu cầu đó ở CN9.
 * YC9.4 bước 1 đến 4: thông báo kết quả cho sale mở màn kết quả (S3-04-01, S3-05, S3-09), quay lại về Thông báo.
 */
export type ManTuThongBao = { man: 'CN9' | 'S3-KQ'; yeuCauId: string };

const LOAI_KET_QUA = ['yeu_cau_da_chot', 'yeu_cau_bi_tu_choi', 'yeu_cau_het_han'];

/** YC12 cột "Chạm mở": loại chưa có màn thì null. */
export function manTuThongBao(tb: { loai: string; doi_tuong_loai?: string | null; doi_tuong_id?: string | null }): ManTuThongBao | null {
  if (tb.loai === 'yeu_cau_moi' && tb.doi_tuong_id) return { man: 'CN9', yeuCauId: tb.doi_tuong_id };
  if (LOAI_KET_QUA.includes(tb.loai) && tb.doi_tuong_id) return { man: 'S3-KQ', yeuCauId: tb.doi_tuong_id };
  return null;
}
