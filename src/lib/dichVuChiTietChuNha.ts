// S6-04 · Chi tiết chủ nhà (YC10.2, QD4, KT-DB.3.3): đọc qua fn_chi_tiet_chu_nha, bỏ nguồn qua fn_sale_bo_nguon.
// Database không trả căn, giá, số điện thoại khi không còn quyền (YC10-H6); app chỉ vẽ cái database trả.
import type { SupabaseClient } from '@supabase/supabase-js';
import { LoiNguoiDung } from '../chung/matKetNoi';
import type { CanCuaChuNha, ChiTietChuNha } from './chiTietChuNha';

export interface DichVuChiTietChuNha {
  /** YC10.2 bước 1 đến 4: chi tiết một kết nối của sale. */
  doc(ketNoiId: string): Promise<ChiTietChuNha>;
  /** YC10.2 bước 6: bỏ nguồn. */
  boNguon(ketNoiId: string): Promise<void>;
}

type Rpc = Record<string, unknown>;
const so = (x: unknown): number | null => (x == null ? null : Number(x));
const chu = (x: unknown): string | null => (typeof x === 'string' ? x : null);

/** jsonb của fn_chi_tiet_chu_nha sang dạng màn dùng. */
export function docChiTietChuNha(d: Rpc): ChiTietChuNha {
  const chung = { ketNoiId: String(d.ket_noi_id ?? ''), chuId: String(d.chu_id ?? ''), tenChu: String(d.ten_chu ?? '') };
  if (d.trang_thai !== 'da_ket_noi') {
    return { trangThai: 'khong_con_quyen', lyDo: d.ly_do === 'chu_xoa_tai_khoan' ? 'chu_xoa_tai_khoan' : 'chu_ngung', ...chung };
  }
  const can: CanCuaChuNha[] = (Array.isArray(d.can) ? (d.can as Rpc[]) : []).map((c) => ({
    canId: String(c.can_id), maCan: String(c.ma_can ?? ''), tenToa: chu(c.ten_toa), soPhongNgu: so(c.so_phong_ngu),
    soGiuong: so(c.so_giuong), loaiView: chu(c.loai_view), giaDem: so(c.gia_dem),
  }));
  return {
    trangThai: 'da_ket_noi', ...chung, soDienThoai: chu(d.so_dien_thoai), ketNoiTu: chu(d.ket_noi_tu),
    capNhatLuc: chu(d.cap_nhat_luc), xemCoc: d.xem_coc === true, can,
    soDatPhong: so(d.so_dat_phong) ?? 0, tienChenh: so(d.tien_chenh) ?? 0,
  };
}

/** 42501: không còn quyền (HV5); P0001: câu tiếng Việt của database (QT5.5). Giữ mã để màn biết đọc lại. */
function loiRpc(error: { message?: string; code?: string }): Error {
  if (error.code === '42501' || error.code === 'P0001') {
    return Object.assign(new LoiNguoiDung(error.message ?? 'Có lỗi'), { code: error.code });
  }
  return Object.assign(new Error(error.message ?? 'Lỗi'), { code: error.code });
}

export function taoDichVuChiTietChuNhaSupabase(sb: SupabaseClient): DichVuChiTietChuNha {
  return {
    async doc(ketNoiId) {
      const { data, error } = await sb.rpc('fn_chi_tiet_chu_nha', { p_ket_noi_id: ketNoiId });
      if (error) throw loiRpc(error);
      return docChiTietChuNha((data ?? {}) as Rpc);
    },
    async boNguon(ketNoiId) {
      const { error } = await sb.rpc('fn_sale_bo_nguon', { p_ket_noi_id: ketNoiId });
      if (error) throw loiRpc(error);
    },
  };
}
