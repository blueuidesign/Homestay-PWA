// Mức cộng giá mặc định của sale (YC7.5, YC7 "Dữ liệu", PQ11.SALE, QD4, KT-DB.3.6): đọc qua fn_muc_cong_mac_dinh,
// ghi qua fn_dat_muc_cong_mac_dinh. Chỉ của chính người gọi.
import type { SupabaseClient } from '@supabase/supabase-js';
import { LoiNguoiDung } from '../chung/matKetNoi';

export type MucCongMacDinh = { muc: number; lamTron: boolean };

export interface DichVuMucCong {
  /** YC7.5 bước 1: mức cộng mặc định và cờ làm tròn 50.000đ; chưa đặt thì 0, không làm tròn. */
  doc(): Promise<MucCongMacDinh>;
  /** YC7.5 bước 5: ghi mức cộng mặc định (số nguyên đồng, 0 đến 5.000.000đ) và cờ làm tròn. */
  luu(muc: number, lamTron: boolean): Promise<void>;
}

/** jsonb của fn_muc_cong_mac_dinh sang dạng màn dùng. */
export function docMucCong(d: Record<string, unknown> | null | undefined): MucCongMacDinh {
  return { muc: Number(d?.muc_cong_mac_dinh ?? 0), lamTron: d?.lam_tron_50k === true };
}

function loiRpc(error: { message?: string; code?: string }): Error {
  // 22023: ngoài khoảng (YC7-H10); 42501: không phải sale. Câu tiếng Việt của database hiện cho người dùng (QT5.5).
  if (error.code === '42501' || error.code === '22023') return new LoiNguoiDung(error.message ?? 'Có lỗi');
  return Object.assign(new Error(error.message ?? 'Lỗi'), { code: error.code });
}

export function taoDichVuMucCongSupabase(sb: SupabaseClient): DichVuMucCong {
  return {
    async doc() {
      const { data, error } = await sb.rpc('fn_muc_cong_mac_dinh');
      if (error) throw loiRpc(error);
      return docMucCong(data as Record<string, unknown> | null);
    },
    async luu(muc, lamTron) {
      const { error } = await sb.rpc('fn_dat_muc_cong_mac_dinh', { p_muc: muc, p_lam_tron: lamTron });
      if (error) throw loiRpc(error);
    },
  };
}
