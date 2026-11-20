// Yêu cầu đặt phòng phía sale (YC9.1, QD4, QT5.6, PQ10.SALE): gửi qua fn_gui_yeu_cau (không gửi giá, database tự tính),
// đọc qua fn_yeu_cau_cua_toi, hủy qua fn_huy_yeu_cau. YC9.4: kết quả qua fn_ket_qua_yeu_cau, căn tương tự qua fn_can_tuong_tu. Câu tiếng Việt của database hiện cho người dùng (QT5.5).
import type { SupabaseClient } from '@supabase/supabase-js';
import { LoiNguoiDung } from '../chung/matKetNoi';
import type { Ngay } from './ngay';
import { docCanTuongTu, docKetQua, type CanTuongTu, type KetQuaYeuCau } from './ketQuaYeuCau';
import { CAU_DA_DAT, docYeuCau, loiNhanGui, type YeuCauCuaToi } from './yeuCau';

/** YC9.1 bước 3a, QT1.4: có đêm đã thuộc đặt phòng; dem là các đêm kín. */
export class LoiDaDat extends LoiNguoiDung {
  constructor(readonly dem: Ngay[]) {
    super(CAU_DA_DAT);
  }
}

export interface DichVuYeuCau {
  /** YC9.1 bước 2: gửi yêu cầu; clientId là mã lần gửi (QT5.6), bấm lại thì gửi lại cùng mã. */
  gui(p: { canId: string; tu: Ngay; den: Ngay; loiNhan: string; clientId: string }): Promise<YeuCauCuaToi>;
  /** YC9.1 bước 3, HV3: đọc lại yêu cầu của mình. */
  doc(id: string): Promise<YeuCauCuaToi>;
  /** YC9.1 bước 4. */
  huy(id: string): Promise<YeuCauCuaToi>;
  /** YC9.4: kết quả yêu cầu của mình (S3-04, S3-05, S3-09), đọc được cả khi đã bị ngừng. Thiếu thì màn dùng doc. */
  ketQua?(id: string): Promise<KetQuaYeuCau>;
  /** YC9.4 bước 2, 4: căn tương tự trống cùng ngày, chỉ giá bán. Thiếu thì không có mục căn tương tự. */
  canTuongTu?(id: string): Promise<CanTuongTu[]>;
}

type LoiRpc = { message?: string; code?: string; details?: string | null };

function loiRpc(error: LoiRpc): Error {
  if (error.code === 'P0001' && error.message === CAU_DA_DAT) {
    return new LoiDaDat((error.details ?? '').split(',').map((x) => x.trim()).filter(Boolean));
  }
  if (error.code === '42501' || error.code === '22023' || error.code === 'P0001' || error.code === '28000') {
    return new LoiNguoiDung(error.message ?? 'Có lỗi');
  }
  return Object.assign(new Error(error.message ?? 'Lỗi'), { code: error.code });
}

export function taoDichVuYeuCauSupabase(sb: SupabaseClient): DichVuYeuCau {
  const goi = async (ten: string, thamSo: Record<string, unknown>) => {
    const { data, error } = await sb.rpc(ten, thamSo);
    if (error) throw loiRpc(error as LoiRpc);
    return docYeuCau(data as Record<string, unknown>);
  };
  return {
    gui: (p) => goi('fn_gui_yeu_cau', {
      p_can_id: p.canId, p_ngay_nhan: p.tu, p_ngay_tra: p.den, p_loi_nhan: loiNhanGui(p.loiNhan), p_client_id: p.clientId,
    }),
    doc: (id) => goi('fn_yeu_cau_cua_toi', { p_yeu_cau_id: id }),
    huy: (id) => goi('fn_huy_yeu_cau', { p_yeu_cau_id: id }),
    async ketQua(id) {
      const { data, error } = await sb.rpc('fn_ket_qua_yeu_cau', { p_yeu_cau_id: id });
      if (error) throw loiRpc(error as LoiRpc);
      return docKetQua(data as Record<string, unknown>);
    },
    async canTuongTu(id) {
      const { data, error } = await sb.rpc('fn_can_tuong_tu', { p_yeu_cau_id: id });
      if (error) throw loiRpc(error as LoiRpc);
      return ((data ?? []) as Record<string, unknown>[]).map(docCanTuongTu);
    },
  };
}
