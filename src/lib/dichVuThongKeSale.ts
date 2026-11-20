// Đọc thống kê tháng của sale qua fn_thong_ke_sale (YC11.2 bước 1; YC11 "Dữ liệu"; YC11-H8; QD4; PQ15.SALE).
// Lệnh chỉ trả số của người gọi, không nhận mã sale; không có khách, tiền cọc, doanh thu chủ nhà (PQ9.SALE, PQ16.SALE).
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ThongKeSale } from './thongKeSale';

export interface DichVuThongKeSale {
  /** YC11.2 bước 1: số liệu tháng [nam, thang] và tháng trước (bản 1 sale chỉ xem tháng hiện tại, YC11-H8). */
  layThang(nam: number, thang: number): Promise<ThongKeSale>;
}

type Json = Record<string, unknown>;
const so = (x: unknown): number => Number(x ?? 0);
const mang = (x: unknown): Json[] => (Array.isArray(x) ? (x as Json[]) : []);

/** Đổi dữ liệu fn_thong_ke_sale (snake_case) sang kiểu của màn. */
export function docThongKeSale(r: Json): ThongKeSale {
  return {
    thang: String(r.thang), soDatPhong: so(r.so_dat_phong), doanhSo: so(r.doanh_so), tienChenh: so(r.tien_chenh),
    soDatPhongThangTruoc: so(r.so_dat_phong_thang_truoc), doanhSoThangTruoc: so(r.doanh_so_thang_truoc),
    tienChenhThangTruoc: so(r.tien_chenh_thang_truoc),
    theoChu: mang(r.theo_chu).map((d) => ({
      chuId: (d.chu_id as string | null) ?? null, tuNhap: !!d.tu_nhap, ten: String(d.ten ?? ''),
      doanhSo: so(d.doanh_so), tienChenh: so(d.tien_chenh),
    })),
    choChu: mang(r.cho_chu).map((y) => ({
      yeuCauId: String(y.yeu_cau_id), canId: String(y.can_id), maCan: String(y.ma_can),
      tenToa: (y.ten_toa as string | null) ?? null, ngayNhan: String(y.ngay_nhan), ngayTra: String(y.ngay_tra),
      guiLuc: String(y.gui_luc), tenChu: String(y.ten_chu ?? ''),
    })),
    soChoChu: so(r.so_cho_chu),
  };
}

export function taoDichVuThongKeSaleSupabase(sb: SupabaseClient): DichVuThongKeSale {
  return {
    async layThang(nam, thang) {
      const p = `${nam}-${String(thang).padStart(2, '0')}-01`;
      const { data, error } = await sb.rpc('fn_thong_ke_sale', { p_thang: p });
      if (error) throw error;
      return docThongKeSale((data ?? {}) as Json);
    },
  };
}
