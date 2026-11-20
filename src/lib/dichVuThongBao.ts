// YC6.8, PQ19, QD4: sale đọc thông báo "chủ đồng ý kết nối" chưa đọc của chính mình qua RLS (thong_bao_doc).
// Không đánh dấu đã đọc (việc của YC12).
import type { SupabaseClient } from '@supabase/supabase-js';
import { docThongBaoKetNoi, type DongThongBao, type ThongBaoKetNoi } from './toastKetNoi';
import { docDongThongBao, type DongThongBaoDb, type ThongBao, type TrangThongBao } from './thongBao';

export interface DichVuThongBao {
  /** YC6.8: dòng "chủ đồng ý kết nối" chưa đọc, mới trước. */
  layKetNoiChuaDoc(): Promise<ThongBaoKetNoi[]>;
  /** YC12.1 bước 1: lệnh mở app, trả thông báo mới (mới trước) và ghi mốc lần mở mới trong một lần. */
  moApp?(): Promise<ThongBao[]>;
  /** YC12.2 bước 1, 2: 50 dòng mỗi lần, mới trước; trang sau truyền dòng cuối trang trước. Kèm số chưa đọc của cả hộp. */
  layDs?(sau?: { taoLuc: string; id: string }): Promise<TrangThongBao>;
  /** YC12.2 bước 3, 4: đánh dấu đã đọc theo mã (1 đến 100), hay tất cả khi không truyền mã. Trả số dòng vừa đổi. */
  danhDauDaDoc?(ids?: string[]): Promise<number>;
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
    async moApp() {
      const { data, error } = await sb.rpc('fn_mo_app');
      if (error) throw Object.assign(new Error((error as { message?: string }).message ?? 'Lỗi'), error);
      return ((data ?? []) as DongThongBaoDb[]).map(docDongThongBao);
    },
    async layDs(sau) {
      const { data, error } = await sb.rpc('fn_ds_thong_bao', { p_truoc_luc: sau?.taoLuc ?? null, p_truoc_id: sau?.id ?? null });
      if (error) throw Object.assign(new Error((error as { message?: string }).message ?? 'Lỗi'), error);
      const d = data as { chua_doc: number; con_nua: boolean; dong: DongThongBaoDb[] };
      return { chuaDoc: Number(d.chua_doc), conNua: !!d.con_nua, dong: (d.dong ?? []).map(docDongThongBao) };
    },
    async danhDauDaDoc(ids) {
      const { data, error } = await sb.rpc('fn_danh_dau_da_doc', { p_ids: ids ?? null });
      if (error) throw Object.assign(new Error((error as { message?: string }).message ?? 'Lỗi'), error);
      return Number(data ?? 0);
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
