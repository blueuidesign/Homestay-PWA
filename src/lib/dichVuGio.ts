// Giờ nhận, trả phòng mặc định của chủ nhà (YC1.5, QD4, PQ1): đọc qua RLS profiles_doc, ghi qua fn_dat_gio_nhan_tra.
import type { SupabaseClient } from '@supabase/supabase-js';
import { LoiNguoiDung } from '../chung/matKetNoi';

export type GioMacDinh = { gioNhan: string; gioTra: string };

export interface DichVuGio {
  /** YC1.5 bước 1: giờ của người gọi, dạng "HH:MM"; chưa đặt thì 14:00 và 12:00. */
  doc(): Promise<GioMacDinh>;
  /** YC1.5 bước 3: ghi giờ nhận, giờ trả ("HH:MM"). */
  luu(gioNhan: string, gioTra: string): Promise<void>;
}

export function taoDichVuGioSupabase(sb: SupabaseClient): DichVuGio {
  return {
    async doc() {
      const { data: u } = await sb.auth.getUser();
      const id = u.user?.id;
      if (!id) throw new Error('Chưa đăng nhập');
      const { data, error } = await sb.from('profiles').select('gio_nhan, gio_tra').eq('id', id).maybeSingle();
      if (error) throw error;
      return { gioNhan: String(data?.gio_nhan ?? '14:00').slice(0, 5), gioTra: String(data?.gio_tra ?? '12:00').slice(0, 5) };
    },
    async luu(gioNhan, gioTra) {
      const { error } = await sb.rpc('fn_dat_gio_nhan_tra', { p_nhan: gioNhan, p_tra: gioTra });
      if (!error) return;
      if (error.code === '22023' || error.code === '42501') throw new LoiNguoiDung(error.message);
      throw error;
    },
  };
}

/** YC1.5 bước 2: các giờ chọn được, cách nhau 30 phút. */
export const CAC_GIO: string[] = Array.from({ length: 48 }, (_, i) => `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`);

/** YC1.5 bước 2: "Khách nhận phòng từ 14:00, trả phòng trước 12:00 hôm sau." */
export function tomTatGio(gioNhan: string, gioTra: string): string {
  return `Khách nhận phòng từ ${gioNhan}, trả phòng trước ${gioTra} hôm sau.`;
}
