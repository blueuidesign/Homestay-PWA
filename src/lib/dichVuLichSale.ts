// Lịch của sale (YC7.1, YC7 "Dữ liệu", QD4, KT-DB.3.5): đọc qua fn_sale_lich, không đọc bảng booking.
import type { SupabaseClient } from '@supabase/supabase-js';
import type { DongLichSale } from './lichSale';
import type { Ngay } from './ngay';

export interface DichVuLichSale {
  /** YC7.1 bước 2, 6: mọi căn sale được xem, mỗi đêm từ `tu` tới trước `den` một dòng. Rỗng là chưa có căn nào. */
  doc(tu: Ngay, den: Ngay): Promise<DongLichSale[]>;
}

type DongRpc = {
  can_id: string; nhom: string; ma_can: string; ten_toa: string | null; ten_chu: string | null; so_phong_ngu: number | null;
  loai_view: string | null; lich_doi_luc: string | null; so_ban: number | null; dem: string; o: string; gia_ban: number | string | null;
};

const NHOM = new Set(['cua_toi', 'nguon', 'tu_nhap']);
const O = new Set(['kin', 'trong', 'ban', 'chua_biet']);

/** Đổi dòng database sang dạng màn dùng; dòng lạ (nhóm, ô không biết) bỏ đi. Giá bigint có thể về dạng chuỗi. */
export function docDongLichSale(ds: readonly DongRpc[] | null | undefined): DongLichSale[] {
  return (ds ?? []).filter((d) => NHOM.has(d.nhom) && O.has(d.o)).map((d) => ({
    canId: d.can_id, nhom: d.nhom as DongLichSale['nhom'], maCan: d.ma_can, tenToa: d.ten_toa, tenChu: d.ten_chu,
    soPhongNgu: d.so_phong_ngu, loaiView: d.loai_view, lichDoiLuc: d.lich_doi_luc, soBan: Number(d.so_ban ?? 0),
    dem: d.dem, o: d.o as DongLichSale['o'], giaBan: d.gia_ban == null ? null : Number(d.gia_ban),
  }));
}

export function taoDichVuLichSaleSupabase(sb: SupabaseClient): DichVuLichSale {
  return {
    async doc(tu, den) {
      const { data, error } = await sb.rpc('fn_sale_lich', { p_tu: tu, p_den: den });
      if (error) throw Object.assign(new Error(error.message ?? 'Lỗi'), { code: error.code });
      return docDongLichSale(data as DongRpc[] | null);
    },
  };
}
