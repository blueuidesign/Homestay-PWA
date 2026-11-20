// Xuất file CSV của chủ nhà (YC1.6, QD4, PQ20): đọc căn qua RLS can_doc, đếm qua fn_dem_xuat_csv, lấy dòng qua fn_xuat_csv.
// Database kiểm quyền và luật kiểm; lệnh đếm và lệnh xuất dùng cùng bộ lọc nên số dòng khớp (YC1 "Dữ liệu").
import type { SupabaseClient } from '@supabase/supabase-js';
import { LoiNguoiDung } from '../chung/matKetNoi';
import type { DongXuat } from './xuatCsv';

export type CanChip = { id: string; maCan: string };

export interface DichVuXuatCsv {
  /** YC1.6 bước 3: căn có lịch chưa xóa của người gọi, cho hàng chip. */
  dsCan(): Promise<CanChip[]>;
  /** YC1.6 bước 5: số đặt phòng trong khoảng; canId null là "Tất cả". */
  dem(tu: string, den: string, canId: string | null): Promise<number>;
  /** YC1.6 bước 6: các dòng của file. */
  xuat(tu: string, den: string, canId: string | null): Promise<DongXuat[]>;
}

function loi(error: { code?: string; message: string }): Error {
  if (error.code === '22023' || error.code === '42501') return new LoiNguoiDung(error.message);
  return Object.assign(new Error(error.message), error);
}

export function taoDichVuXuatCsvSupabase(sb: SupabaseClient): DichVuXuatCsv {
  const thamSo = (tu: string, den: string, canId: string | null) => ({ p_tu: tu, p_den: den, p_can_ids: canId ? [canId] : null });
  return {
    async dsCan() {
      const { data: u } = await sb.auth.getUser();
      const id = u.user?.id;
      if (!id) throw new Error('Chưa đăng nhập');
      const { data, error } = await sb.from('can').select('id, ma_can, tao_luc')
        .eq('nguoi_giu', id).eq('loai', 'co_lich').is('an_luc', null).order('tao_luc');
      if (error) throw error;
      return (data ?? []).map((c) => ({ id: c.id as string, maCan: c.ma_can as string }));
    },
    async dem(tu, den, canId) {
      const { data, error } = await sb.rpc('fn_dem_xuat_csv', thamSo(tu, den, canId));
      if (error) throw loi(error);
      return Number(data ?? 0);
    },
    async xuat(tu, den, canId) {
      const { data, error } = await sb.rpc('fn_xuat_csv', thamSo(tu, den, canId));
      if (error) throw loi(error);
      return ((data ?? []) as Record<string, unknown>[]).map((r) => ({
        maCan: String(r.ma_can), ngayNhan: String(r.ngay_nhan), ngayTra: String(r.ngay_tra), soDem: Number(r.so_dem),
        tenKhach: (r.ten_khach as string | null) ?? null, sdtKhach: (r.sdt_khach as string | null) ?? null,
        tenSale: (r.ten_sale as string | null) ?? null, saleDaXoa: Boolean(r.sale_da_xoa),
        tongTien: Number(r.tong_tien), daCoc: Number(r.da_coc), conLai: Number(r.con_lai), ghiChu: (r.ghi_chu as string | null) ?? null,
      }));
    },
  };
}
