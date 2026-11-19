// Đọc danh sách căn của chủ nhà qua v_can_cua_toi (YC3.1 bước 9, QD4, PQ3.CHU). Ảnh qua đường dẫn có hạn (QT5.7).
// Thêm căn qua fn_tao_can (YC3.2 bước 18, QT5.6).
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CanTomTat } from './can';
import { loiTuTaoCan } from './kiemCan';

/** YC3.2 bước 18: dữ liệu lệnh tạo căn. clientId là mã lần gửi, giữ nguyên khi bấm lại (QT5.6). */
export type CanMoi = {
  maCan: string;
  soPhongNgu: number;
  clientId: string;
  soGiuong?: number | null;
  loaiView?: string | null;
  toaNhaId?: string | null;
  moTa?: string | null;
};

/** QD16: kho ảnh riêng tư anh-can. QT5.7: đường dẫn có hạn 1 giờ. */
export const KHO_ANH = 'anh-can';
export const HAN_ANH_GIAY = 60 * 60;

export interface DichVuCan {
  /** Căn có lịch, chưa ẩn của người gọi, căn mới thêm trước (YC3.1 bước 9). */
  layCanCuaToi(): Promise<CanTomTat[]>;
  /**
   * YC3.2 bước 18: tạo căn, trả mã căn. Database từ chối thì ném LoiNguoiDung kèm câu (QT5.5).
   * Không bắt buộc để chỗ chỉ đọc danh sách (test của US14) không phải giả lệnh này; thiếu thì form báo như mất mạng.
   */
  taoCan?(c: CanMoi): Promise<string>;
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

    async taoCan(c) {
      const { data, error } = await sb.rpc('fn_tao_can', {
        p_ma_can: c.maCan, p_so_phong_ngu: c.soPhongNgu, p_client_id: c.clientId,
        p_so_giuong: c.soGiuong ?? null, p_loai_view: c.loaiView ?? null,
        p_toa_nha_id: c.toaNhaId ?? null, p_mo_ta: c.moTa ?? null,
      });
      if (error) throw loiTuTaoCan(error);
      return data as string;
    },
  };
}
