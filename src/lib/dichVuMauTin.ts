// Mẫu tin gửi khách của sale (YC8.2, YC8 "Mẫu tin gửi khách", "Dữ liệu", PQ11.SALE, QD4, KT-DB.3.6): đọc qua fn_mau_tin,
// lưu qua fn_dat_mau_tin. Chỉ của chính người gọi. Kiểm mẫu ở màn giống lệnh lưu của database (YC8-H9).
import type { SupabaseClient } from '@supabase/supabase-js';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { MAU_TIN_MAC_DINH } from './guiKhach';

export interface DichVuMauTin {
  /** YC8.2 bước 1: mẫu của người gọi, chưa có thì mẫu mặc định. */
  doc(): Promise<string>;
  /** YC8.2 bước 5: lưu mẫu. Database từ chối (22023, 42501) thì LoiNguoiDung kèm câu. */
  luu(mau: string): Promise<void>;
}

/** YC8.2 bước 1: hàng "Chạm để chèn", theo thứ tự trên canvas P11. */
export const O_CHEN = ['[Ngày]', '[Số đêm]', '[Số căn]', '[Danh sách căn]', '[Tên sale]'] as const;

/** YC8.2 bước 5, YC8-H9. */
export const DO_DAI_TOI_DA = 2000;
export const CAU_CAN_DANH_SACH = 'Mẫu cần có [Danh sách căn]';
export const CAU_QUA_DAI = 'Mẫu tin tối đa 2.000 ký tự';

/** YC8.2-NT5, YC8-H9: câu lỗi khi mẫu không lưu được, null khi lưu được. Đếm ký tự như char_length của Postgres. */
export function loiMauTin(mau: string): string | null {
  if (!mau.trim() || !mau.includes('[Danh sách căn]')) return CAU_CAN_DANH_SACH;
  if ([...mau].length > DO_DAI_TOI_DA) return CAU_QUA_DAI;
  return null;
}

/** YC8.2 bước 2: chèn ô vào chỗ con trỏ (thay đoạn đang chọn); con trỏ đứng ngay sau ô vừa chèn. */
export function chenO(mau: string, o: string, dau: number, cuoi: number): { mau: string; conTro: number } {
  const a = Math.max(0, Math.min(dau, mau.length));
  const b = Math.max(a, Math.min(cuoi, mau.length));
  return { mau: mau.slice(0, a) + o + mau.slice(b), conTro: a + o.length };
}

function loiRpc(error: { message?: string; code?: string }): Error {
  // 22023: mẫu rỗng, thiếu [Danh sách căn], quá dài (YC8-H9); 42501: không phải sale. Câu tiếng Việt hiện cho người dùng.
  if (error.code === '42501' || error.code === '22023') return new LoiNguoiDung(error.message ?? 'Có lỗi');
  return Object.assign(new Error(error.message ?? 'Lỗi'), { code: error.code });
}

export function taoDichVuMauTinSupabase(sb: SupabaseClient): DichVuMauTin {
  return {
    async doc() {
      const { data, error } = await sb.rpc('fn_mau_tin');
      if (error) throw loiRpc(error);
      return typeof data === 'string' && data.trim() ? data : MAU_TIN_MAC_DINH;
    },
    async luu(mau) {
      const { error } = await sb.rpc('fn_dat_mau_tin', { p_mau: mau });
      if (error) throw loiRpc(error);
    },
  };
}
