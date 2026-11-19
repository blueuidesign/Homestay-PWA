// Đọc danh sách căn của chủ nhà qua v_can_cua_toi (YC3.1 bước 9, QD4, PQ3.CHU). Ảnh qua đường dẫn có hạn (QT5.7).
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CanTomTat } from './can';

/** QD16: kho ảnh riêng tư anh-can. QT5.7: đường dẫn có hạn 1 giờ. */
export const KHO_ANH = 'anh-can';
export const HAN_ANH_GIAY = 60 * 60;

export interface DichVuCan {
  /** Căn có lịch, chưa ẩn của người gọi, căn mới thêm trước (YC3.1 bước 9). */
  layCanCuaToi(): Promise<CanTomTat[]>;
}

type DongView = {
  id: string; ma_can: string; so_phong_ngu: number | null; so_giuong: number | null; loai_view: string | null;
  ten_toa: string | null; so_anh: number; anh_dai_dien: string | null; moi_them: boolean; khach_den: string | null;
};

export function taoDichVuCanSupabase(sb: SupabaseClient): DichVuCan {
  return {
    async layCanCuaToi() {
      const { data, error } = await sb.from('v_can_cua_toi')
        .select('id, ma_can, so_phong_ngu, so_giuong, loai_view, ten_toa, so_anh, anh_dai_dien, moi_them, khach_den')
        .order('tao_luc', { ascending: false });
      if (error) throw error;
      const dong = (data ?? []) as DongView[];
      const duongDan = dong.map((d) => d.anh_dai_dien).filter((d): d is string => !!d);
      const url = new Map<string, string>();
      if (duongDan.length) {
        // Không xin được đường dẫn ảnh thì thẻ vẫn hiện, chỗ ảnh để trống (ảnh không phải dữ liệu chính của thẻ).
        try {
          const { data: ky } = await sb.storage.from(KHO_ANH).createSignedUrls(duongDan, HAN_ANH_GIAY);
          for (const k of ky ?? []) if (k.path && k.signedUrl) url.set(k.path, k.signedUrl);
        } catch { /* bỏ qua */ }
      }
      return dong.map((d) => ({
        id: d.id, maCan: d.ma_can, soPhongNgu: d.so_phong_ngu, soGiuong: d.so_giuong, loaiView: d.loai_view,
        tenToa: d.ten_toa, soAnh: d.so_anh, anhDaiDien: d.anh_dai_dien ? url.get(d.anh_dai_dien) ?? null : null,
        moiThem: d.moi_them, khachDen: d.khach_den,
      }));
    },
  };
}
