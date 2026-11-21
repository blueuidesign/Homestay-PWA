// Hồ sơ của chính người gọi (YC1.4, QD4, PQ1, PQ2): đọc qua RLS profiles_doc, ghi qua fn_sua_ho_so. Ảnh đại diện ở kho
// riêng tư anh-dai-dien, xem bằng đường dẫn có hạn (QT5.7).
import type { SupabaseClient } from '@supabase/supabase-js';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { thuAnh } from './anh';

export type HoSoForm = {
  ten: string;
  tenHienThi: string;
  soDienThoai: string;
  email: string;
  /** Đường dẫn có hạn để xem ảnh, null nếu chưa có ảnh. */
  anhUrl: string | null;
};

export type SuaHoSo = { ten: string; tenHienThi: string; soDienThoai: string; anh?: string | null };

export const CAU_LOI_TEN_HIEN_THI = 'Tên hiển thị từ 1 đến 100 ký tự';

export interface DichVuHoSo {
  /** YC1.4 bước 1. */
  doc(): Promise<HoSoForm>;
  /** YC1.4 bước 3: ghi họ tên, tên hiển thị, số, ảnh (anh: đường dẫn đã tải; '' bỏ ảnh; không đặt thì giữ). Sai luật thì LoiNguoiDung. */
  luu(s: SuaHoSo): Promise<void>;
  /** YC1.4 bước 2: tải ảnh lên kho, trả đường dẫn để gửi kèm lúc lưu. */
  taiAnh(f: File): Promise<string>;
  /** YC1.8 bước 3: lệnh xóa tài khoản của chính người gọi (fn_xoa_tai_khoan). Thiếu thì P14 báo lỗi khi bấm lần hai. */
  xoaTaiKhoan?(): Promise<void>;
}

export function taoDichVuHoSoSupabase(sb: SupabaseClient): DichVuHoSo {
  return {
    async doc() {
      const { data: u } = await sb.auth.getUser();
      const id = u.user?.id;
      if (!id) throw new Error('Chưa đăng nhập');
      const { data, error } = await sb.from('profiles').select('ten, ten_hien_thi, so_dien_thoai, anh_dai_dien').eq('id', id).maybeSingle();
      if (error) throw error;
      let anhUrl: string | null = null;
      if (data?.anh_dai_dien) {
        const { data: k } = await sb.storage.from('anh-dai-dien').createSignedUrl(data.anh_dai_dien as string, 60 * 60);
        anhUrl = k?.signedUrl ?? null;
      }
      return {
        ten: data?.ten ?? '', tenHienThi: data?.ten_hien_thi ?? '', soDienThoai: data?.so_dien_thoai ?? '',
        email: u.user?.email ?? '', anhUrl,
      };
    },
    async luu(s) {
      const { error } = await sb.rpc('fn_sua_ho_so', {
        p_ten: s.ten, p_ten_hien_thi: s.tenHienThi, p_so: s.soDienThoai, p_anh: s.anh ?? null,
      });
      if (!error) return;
      if (error.code === '22023' || error.code === '23505' || error.code === '42501') throw new LoiNguoiDung(error.message);
      throw error;
    },
    async taiAnh(f) {
      const { data: u } = await sb.auth.getUser();
      const id = u.user?.id;
      if (!id) throw new Error('Chưa đăng nhập');
      const d = await thuAnh(f);
      const ma = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
      const duongDan = `${id}/${ma}.${d.duoi}`;
      const { error } = await sb.storage.from('anh-dai-dien').upload(duongDan, d.blob, { contentType: d.loai });
      if (error) throw error;
      return duongDan;
    },
    async xoaTaiKhoan() {
      const { error } = await sb.rpc('fn_xoa_tai_khoan');
      if (!error) return;
      if (error.code === '42501') throw new LoiNguoiDung(error.message);
      throw error;
    },
  };
}
