// Đọc lịch tháng của chủ nhà (YC2.1 bước 1, 4; QD4; PQ4.CHU, PQ7.CHU). Đọc thẳng bảng booking qua RLS booking_doc
// (chỉ căn của người gọi; sale không đọc bảng này). Chỉ lấy cột lịch: không tiền (PQ8), không khách (PQ9, ở booking_rieng).
import type { SupabaseClient } from '@supabase/supabase-js';
import { khoangThang, type DatPhongLich } from './lich';

/** Một tháng của lịch: booking chưa hủy có đêm trong tháng, và các căn đã có booking chưa hủy nào chưa (CN1-00). */
export type ThangLich = { datPhong: DatPhongLich[]; coDatPhong: boolean };

export interface DichVuLich {
  /** YC2.1 bước 1, 4: booking chưa hủy (QT2.1) của các căn `canIds` có đêm trong tháng. */
  layThang(canIds: string[], nam: number, thang: number): Promise<ThangLich>;
}

export function taoDichVuLichSupabase(sb: SupabaseClient): DichVuLich {
  return {
    async layThang(canIds, nam, thang) {
      if (!canIds.length) return { datPhong: [], coDatPhong: false };
      const { tu, den } = khoangThang(nam, thang);
      const [thangNay, mot] = await Promise.all([
        sb.from('booking').select('id, can_id, ngay_nhan, ngay_tra')
          .in('can_id', canIds).neq('trang_thai', 'da_huy').lt('ngay_nhan', den).gt('ngay_tra', tu)
          .order('ngay_nhan'),
        // YC2.1 CN1-00: "chưa có đặt phòng nào (ở mọi tháng)".
        sb.from('booking').select('id').in('can_id', canIds).neq('trang_thai', 'da_huy').limit(1),
      ]);
      if (thangNay.error) throw thangNay.error;
      if (mot.error) throw mot.error;
      const datPhong = ((thangNay.data ?? []) as { id: string; can_id: string; ngay_nhan: string; ngay_tra: string }[])
        .map((d) => ({ id: d.id, canId: d.can_id, ngayNhan: d.ngay_nhan, ngayTra: d.ngay_tra }));
      return { datPhong, coDatPhong: datPhong.length > 0 || (mot.data ?? []).length > 0 };
    },
  };
}
