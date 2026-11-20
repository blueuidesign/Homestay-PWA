// Chủ nhà trả lời yêu cầu (YC9.2, QD4, PQ10.CHU): khối CN1-03 đọc qua fn_yeu_cau_dang_cho, CN9 qua fn_chu_xem_yeu_cau,
// chấp nhận fn_chap_nhan_yeu_cau, từ chối fn_tu_choi_yeu_cau. Câu tiếng Việt của database hiện cho người dùng (QT5.5).
import type { SupabaseClient } from '@supabase/supabase-js';
import { LoiNguoiDung } from '../chung/matKetNoi';
import {
  docDongYeuCauCho, docKetQuaTraLoi, docYeuCauChoChu, type DongYeuCauCho, type KetQuaTraLoi, type LyDoTuChoi, type YeuCauChoChu,
} from './traLoiYeuCau';

export interface DichVuTraLoiYeuCau {
  /** YC9.2 bước 1: các yêu cầu chờ tới căn của mình. */
  layDangCho(): Promise<DongYeuCauCho[]>;
  /** YC9.2 bước 2, HV3: đọc một yêu cầu ở CN9. */
  doc(id: string): Promise<YeuCauChoChu>;
  /** YC9.2 bước 3. */
  chapNhan(id: string): Promise<KetQuaTraLoi>;
  /** YC9.2 bước 5: không chọn lý do thì null (YC9-H10). */
  tuChoi(id: string, lyDo: LyDoTuChoi | null): Promise<KetQuaTraLoi>;
}

type LoiRpc = { message?: string; code?: string };

function loiRpc(error: LoiRpc): Error {
  if (error.code === '42501' || error.code === '22023' || error.code === 'P0001' || error.code === '28000') {
    return new LoiNguoiDung(error.message ?? 'Có lỗi');
  }
  return Object.assign(new Error(error.message ?? 'Lỗi'), { code: error.code });
}

export function taoDichVuTraLoiYeuCauSupabase(sb: SupabaseClient): DichVuTraLoiYeuCau {
  const goi = async (ten: string, thamSo?: Record<string, unknown>): Promise<unknown> => {
    const { data, error } = await sb.rpc(ten, thamSo);
    if (error) throw loiRpc(error as LoiRpc);
    return data;
  };
  return {
    layDangCho: async () => ((await goi('fn_yeu_cau_dang_cho')) as Record<string, unknown>[] | null ?? []).map(docDongYeuCauCho),
    doc: async (id) => docYeuCauChoChu((await goi('fn_chu_xem_yeu_cau', { p_yeu_cau_id: id })) as Record<string, unknown>),
    chapNhan: async (id) => docKetQuaTraLoi((await goi('fn_chap_nhan_yeu_cau', { p_yeu_cau_id: id })) as Record<string, unknown>),
    tuChoi: async (id, lyDo) => docKetQuaTraLoi((await goi('fn_tu_choi_yeu_cau', { p_yeu_cau_id: id, p_ly_do: lyDo })) as Record<string, unknown>),
  };
}
