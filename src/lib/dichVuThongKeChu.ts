// Đọc thống kê tháng của chủ nhà qua fn_thong_ke_chu (YC11.1 bước 1, 8; YC11 "Dữ liệu"; QD4; PQ16.CHU).
// Lệnh chỉ trả số của người gọi, không nhận mã chủ nhà; không có giá bán, tiền chênh, mức cộng, khách của sale (PQ11.CHU).
import type { SupabaseClient } from '@supabase/supabase-js';
import type { DongChuaThu, ThongKeThang } from './thongKeChu';

export interface DichVuThongKeChu {
  /** YC11.1 bước 1, 8: số liệu tháng [nam, thang] và 5 tháng trước. */
  layThang(nam: number, thang: number): Promise<ThongKeThang>;
}

type Json = Record<string, unknown>;
const so = (x: unknown): number => Number(x ?? 0);
const mang = (x: unknown): Json[] => (Array.isArray(x) ? (x as Json[]) : []);

/** Đổi dữ liệu fn_thong_ke_chu (snake_case) sang kiểu của màn. */
export function docThongKe(r: Json): ThongKeThang {
  return {
    thang: String(r.thang), homNay: String(r.hom_nay), doanhThu: so(r.doanh_thu), doanhThuThangTruoc: so(r.doanh_thu_thang_truoc),
    soDem: so(r.so_dem), mauSo: so(r.mau_so), congSuat: so(r.cong_suat),
    can: mang(r.can).map((c) => ({
      canId: String(c.can_id), maCan: String(c.ma_can), doanhThu: so(c.doanh_thu), soDem: so(c.so_dem), daAn: !!c.da_an,
    })),
    cacThang: mang(r.cac_thang).map((t) => ({ thang: String(t.thang), doanhThu: so(t.doanh_thu) })),
    nguoiBan: mang(r.nguoi_ban).map((n) => ({
      saleId: (n.sale_id as string | null) ?? null, ten: (n.ten as string | null) ?? null, khachLe: !!n.khach_le,
      doanhThu: so(n.doanh_thu),
    })),
    chuaThu: mang(r.chua_thu).map((d) => ({
      bookingId: String(d.booking_id), canId: String(d.can_id), maCan: String(d.ma_can),
      saleId: (d.sale_id as string | null) ?? null, ten: (d.ten as string | null) ?? null, khachLe: !!d.khach_le,
      ngayNhan: String(d.ngay_nhan), ngayTra: String(d.ngay_tra),
      trangThaiTien: d.trang_thai_tien === 'da_coc' ? 'da_coc' : 'chua_coc', soTien: so(d.so_tien), conNgay: so(d.con_ngay),
    } satisfies DongChuaThu)),
    tongChuaThu: so(r.tong_chua_thu),
  };
}

export function taoDichVuThongKeChuSupabase(sb: SupabaseClient): DichVuThongKeChu {
  return {
    async layThang(nam, thang) {
      const p = `${nam}-${String(thang).padStart(2, '0')}-01`;
      const { data, error } = await sb.rpc('fn_thong_ke_chu', { p_thang: p });
      if (error) throw error;
      return docThongKe((data ?? {}) as Json);
    },
  };
}
