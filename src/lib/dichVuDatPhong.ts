// Đọc đặt phòng chưa hủy các căn của chủ nhà cho form Thêm đặt phòng CN4 (YC5.1 bước 1a, 1b, 4; QD4; PQ7.CHU, PQ9.CHU).
// Đọc thẳng bảng booking qua RLS booking_doc (chỉ căn của người gọi), tên khách chính mình nhập qua booking_rieng (QD11),
// tên sale qua v_nguoi_ket_noi. Lệnh ghi fn_tao_booking nối ở US27, US28 (nút "Thêm đặt phòng" chưa bấm được ở US26).
import type { SupabaseClient } from '@supabase/supabase-js';
import type { DatPhongLich, NguoiDat } from './lich';

export interface DichVuDatPhong {
  /** YC5.1 bước 1a: đặt phòng chưa hủy (QT2.1) của các căn `canIds`, có tên người đặt để hiện ở dòng trùng (bước 4). */
  layDatPhong(canIds: string[]): Promise<DatPhongLich[]>;
}

type Dong = { id: string; can_id: string; ngay_nhan: string; ngay_tra: string; sale_id: string | null };

export function taoDichVuDatPhongSupabase(sb: SupabaseClient): DichVuDatPhong {
  return {
    async layDatPhong(canIds) {
      if (!canIds.length) return [];
      const { data, error } = await sb.from('booking').select('id, can_id, ngay_nhan, ngay_tra, sale_id')
        .in('can_id', canIds).neq('trang_thai', 'da_huy').order('ngay_nhan');
      if (error) throw error;
      const dong = (data ?? []) as Dong[];
      const khach = new Map<string, string>();
      const sale = new Map<string, string | null>();
      const saleIds = [...new Set(dong.map((d) => d.sale_id).filter((x): x is string => !!x))];
      if (dong.length) {
        const [rieng, nguoi] = await Promise.all([
          sb.from('booking_rieng').select('booking_id, ten_khach').in('booking_id', dong.map((d) => d.id)),
          saleIds.length
            ? sb.from('v_nguoi_ket_noi').select('id, ten_hien_thi').in('id', saleIds)
            : Promise.resolve({ data: [], error: null }),
        ]);
        if (rieng.error) throw rieng.error;
        if (nguoi.error) throw nguoi.error;
        for (const r of (rieng.data ?? []) as { booking_id: string; ten_khach: string | null }[]) {
          if (r.ten_khach?.trim()) khach.set(r.booking_id, r.ten_khach.trim());
        }
        for (const n of (nguoi.data ?? []) as { id: string; ten_hien_thi: string | null }[]) sale.set(n.id, n.ten_hien_thi);
      }
      return dong.map((d) => {
        const ten = khach.get(d.id);
        const nguoiDat: NguoiDat = d.sale_id
          ? { loai: 'sale', ten: sale.get(d.sale_id) ?? null, sdt: null }
          : ten ? { loai: 'khach', ten } : { loai: 'le' };
        return { id: d.id, canId: d.can_id, ngayNhan: d.ngay_nhan, ngayTra: d.ngay_tra, nguoiDat };
      });
    },
  };
}
