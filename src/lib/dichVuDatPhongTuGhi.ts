// Đặt phòng tự ghi cho căn tự nhập (YC10.4, YC10 "Dữ liệu", QD4, QD11, PQ14.SALE): điền sẵn qua fn_gia_dien_san_tu_ghi, ghi qua
// fn_ghi_dat_phong_tu_ghi, sửa qua fn_sua_dat_phong_tu_ghi, xóa thật qua fn_xoa_dat_phong_tu_ghi. Danh sách đọc ở fn_can_tu_nhap.
import type { SupabaseClient } from '@supabase/supabase-js';
import { LoiNguoiDung } from '../chung/matKetNoi';
import type { Ngay } from './ngay';

/** YC10.4 bước 4: tổng giá chủ và giá bán của các đêm; null khi một đêm chưa có giá chủ (hai ô trống). */
export type GiaDienSan = { traChu: number | null; thuKhach: number | null };

/** YC10.4 bước 5. clientId giữ nguyên khi bấm lại (HV1-NT1, QT5.6). Tiền là số nguyên đồng. */
export type DatPhongTuGhiMoi = { canId: string; ngayNhan: Ngay; ngayTra: Ngay; traChu: number; thuKhach: number; clientId: string };
export type SuaDatPhongTuGhi = { ngayNhan: Ngay; ngayTra: Ngay; traChu: number; thuKhach: number };

export interface DichVuDatPhongTuGhi {
  dienSan(canId: string, ngayNhan: Ngay, ngayTra: Ngay): Promise<GiaDienSan>;
  ghi(d: DatPhongTuGhiMoi): Promise<string>;
  sua(id: string, d: SuaDatPhongTuGhi): Promise<void>;
  xoa(id: string): Promise<void>;
}

const so = (x: unknown): number | null => (x == null ? null : Number(x));

/** jsonb của fn_gia_dien_san_tu_ghi. */
export function docGiaDienSan(d: Record<string, unknown> | null | undefined): GiaDienSan {
  return { traChu: so(d?.tra_chu), thuKhach: so(d?.thu_khach) };
}

function loiRpc(error: { message?: string; code?: string }): Error {
  // 42501: căn hay đặt phòng không còn của người gọi (HV5); P0001: câu tiếng Việt của database (trùng đêm, luật kiểm).
  if (error.code === '42501' || error.code === 'P0001') return new LoiNguoiDung(error.message ?? 'Có lỗi');
  return Object.assign(new Error(error.message ?? 'Lỗi'), { code: error.code });
}

export function taoDichVuDatPhongTuGhiSupabase(sb: SupabaseClient): DichVuDatPhongTuGhi {
  return {
    async dienSan(canId, ngayNhan, ngayTra) {
      const { data, error } = await sb.rpc('fn_gia_dien_san_tu_ghi', { p_can_id: canId, p_ngay_nhan: ngayNhan, p_ngay_tra: ngayTra });
      if (error) throw loiRpc(error);
      return docGiaDienSan(data as Record<string, unknown> | null);
    },
    async ghi(d) {
      const { data, error } = await sb.rpc('fn_ghi_dat_phong_tu_ghi', {
        p_can_id: d.canId, p_ngay_nhan: d.ngayNhan, p_ngay_tra: d.ngayTra, p_tra_chu: d.traChu, p_thu_khach: d.thuKhach,
        p_client_id: d.clientId,
      });
      if (error) throw loiRpc(error);
      return data as string;
    },
    async sua(id, d) {
      const { error } = await sb.rpc('fn_sua_dat_phong_tu_ghi', {
        p_booking_id: id, p_ngay_nhan: d.ngayNhan, p_ngay_tra: d.ngayTra, p_tra_chu: d.traChu, p_thu_khach: d.thuKhach,
      });
      if (error) throw loiRpc(error);
    },
    async xoa(id) {
      const { error } = await sb.rpc('fn_xoa_dat_phong_tu_ghi', { p_booking_id: id });
      if (error) throw loiRpc(error);
    },
  };
}
