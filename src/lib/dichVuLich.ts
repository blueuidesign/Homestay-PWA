// Đọc lịch tháng của chủ nhà (YC2.1 bước 1, 4; YC2.2 bước 7, 8; QD4; PQ4.CHU, PQ7.CHU, PQ8.CHU, PQ9.CHU).
// Đọc thẳng bảng booking qua RLS booking_doc (chỉ căn của người gọi; sale không đọc bảng này), khách chính mình nhập
// qua booking_rieng, tên và số sale qua v_nguoi_ket_noi. Ghi chú đặt phòng: database chưa có cột (YC5 thêm).
// Doanh thu tháng (YC2.3, PQ16.CHU) qua fn_doanh_thu_thang: tổng mọi căn của người gọi, kể cả căn đã ẩn.
// Đặt phòng sắp tới (YC2.4 bước 14): đọc bảng booking như bước 1, cùng RLS.
// Lịch tuần (YC2.5, US13): đặt phòng như lịch tháng, giá chủ nhà từng đêm qua fn_gia_tung_dem_cua_toi (PQ5.CHU).
import type { SupabaseClient } from '@supabase/supabase-js';
import { congNgay, homNay as homNayVN, type Ngay } from './ngay';
import type { GiaTuanTungDem } from './lichTuan';
import { khoangThang, type DatPhongLich, type DoanhThuThang, type NguoiDat, type TrangThaiTien } from './lich';

/**
 * Một tháng của lịch: booking chưa hủy có đêm trong tháng, và các căn đã có booking chưa hủy nào chưa (CN1-00).
 * doanhThu (YC2.3): tổng mọi căn của chủ nhà, không theo căn đang xem; thiếu thì không hiện khối.
 */
export type ThangLich = {
  datPhong: DatPhongLich[]; coDatPhong: boolean; doanhThu?: DoanhThuThang;
  /**
   * YC2.4 bước 14: booking chưa hủy có ngày trả sau hôm nay và ngày nhận trước tháng sau (có thể nằm ngoài tháng
   * đang xem). Thiếu thì màn chọn từ datPhong (đủ khi hôm nay thuộc tháng đang xem).
   */
  sapToi?: DatPhongLich[];
};

/** YC2.5 bước 17: một tuần của lịch tuần: booking chưa hủy có đêm trong tuần, giá chủ nhà từng đêm, căn có khách hôm nay. */
export type TuanLich = { datPhong: DatPhongLich[]; gia: GiaTuanTungDem; coKhachHomNay: string[] };

export interface DichVuLich {
  /**
   * YC2.1 bước 1, 4: booking chưa hủy (QT2.1) của các căn `canIds` có đêm trong tháng. YC2.3 bước 12: kèm doanh thu tháng.
   * YC2.4 bước 14: kèm đặt phòng sắp tới tính từ hôm nay theo giờ Việt Nam.
   */
  layThang(canIds: string[], nam: number, thang: number): Promise<ThangLich>;
  /** YC2.5 bước 17, 22: tuần từ thứ Hai `t2`; `homNay` (giờ Việt Nam) cho ô "Có khách hôm nay". Thiếu thì lịch tuần báo như mất mạng. */
  layTuan?(canIds: string[], t2: Ngay, homNay: Ngay): Promise<TuanLich>;
}

type DongBooking = {
  id: string; can_id: string; ngay_nhan: string; ngay_tra: string;
  sale_id: string | null; tien_phong: number; tien_coc: number | null; trang_thai_tien: TrangThaiTien | null;
};

/** YC2.2 bước 8, YC2.5 bước 18: thêm người đặt (khách chính mình nhập, tên sale đang kết nối) vào các dòng booking. */
async function themNguoiDat(sb: SupabaseClient, dong: DongBooking[]): Promise<DatPhongLich[]> {
  // YC2.2 bước 8: khách chính chủ nhà nhập (booking_rieng, RLS chỉ trả dòng của người gọi, QD11, PQ9.CHU)
  // và tên, số sale đang kết nối (v_nguoi_ket_noi, PQ2).
  const khach = new Map<string, string>();
  const sale = new Map<string, { ten: string | null; sdt: string | null }>();
  const saleIds = [...new Set(dong.map((d) => d.sale_id).filter((x): x is string => !!x))];
  if (dong.length) {
    const [rieng, nguoi] = await Promise.all([
      sb.from('booking_rieng').select('booking_id, ten_khach').in('booking_id', dong.map((d) => d.id)),
      saleIds.length
        ? sb.from('v_nguoi_ket_noi').select('id, ten_hien_thi, so_dien_thoai').in('id', saleIds)
        : Promise.resolve({ data: [], error: null }),
    ]);
    if (rieng.error) throw rieng.error;
    if (nguoi.error) throw nguoi.error;
    for (const r of (rieng.data ?? []) as { booking_id: string; ten_khach: string | null }[]) {
      if (r.ten_khach?.trim()) khach.set(r.booking_id, r.ten_khach.trim());
    }
    for (const n of (nguoi.data ?? []) as { id: string; ten_hien_thi: string | null; so_dien_thoai: string | null }[]) {
      sale.set(n.id, { ten: n.ten_hien_thi, sdt: n.so_dien_thoai });
    }
  }

  return dong.map((d) => {
    const ten = khach.get(d.id);
    const nguoiDat: NguoiDat = d.sale_id
      ? { loai: 'sale', ten: sale.get(d.sale_id)?.ten ?? null, sdt: sale.get(d.sale_id)?.sdt ?? null }
      : ten ? { loai: 'khach', ten } : { loai: 'le' };
    return {
      id: d.id, canId: d.can_id, ngayNhan: d.ngay_nhan, ngayTra: d.ngay_tra,
      tienPhong: Number(d.tien_phong), tienCoc: d.tien_coc === null ? null : Number(d.tien_coc),
      trangThaiTien: d.trang_thai_tien, nguoiDat,
    };
  });
}

const COT_BOOKING = 'id, can_id, ngay_nhan, ngay_tra, sale_id, tien_phong, tien_coc, trang_thai_tien';

export function taoDichVuLichSupabase(sb: SupabaseClient): DichVuLich {
  return {
    async layTuan(canIds, t2, homNay) {
      if (!canIds.length) return { datPhong: [], gia: {}, coKhachHomNay: [] };
      const den = congNgay(t2, 7);
      const [tuan, gia, homNayCo] = await Promise.all([
        // PQ7.CHU, PQ8.CHU qua RLS booking_doc: booking chưa hủy có đêm trong tuần (QT2.1).
        sb.from('booking').select(COT_BOOKING).in('can_id', canIds).neq('trang_thai', 'da_huy')
          .lt('ngay_nhan', den).gt('ngay_tra', t2).order('ngay_nhan'),
        // YC2.5-NT2, YC2.5-NT7: giá chủ nhà từng đêm; null là chưa đặt giá.
        sb.rpc('fn_gia_tung_dem_cua_toi', { p_tu: t2, p_den: den }),
        // YC2.5 bước 20 (YC2-H5): căn có khách hôm nay, dù tuần đang xem không chứa hôm nay.
        sb.from('booking').select('can_id').in('can_id', canIds).neq('trang_thai', 'da_huy')
          .lte('ngay_nhan', homNay).gt('ngay_tra', homNay),
      ]);
      if (tuan.error) throw tuan.error;
      if (gia.error) throw gia.error;
      if (homNayCo.error) throw homNayCo.error;
      const g: GiaTuanTungDem = {};
      for (const r of (gia.data ?? []) as { can_id: string; dem: string; gia: number | null }[]) {
        (g[r.can_id] ??= {})[r.dem] = r.gia === null ? null : Number(r.gia);
      }
      const datPhong = await themNguoiDat(sb, (tuan.data ?? []) as DongBooking[]);
      const coKhachHomNay = [...new Set(((homNayCo.data ?? []) as { can_id: string }[]).map((r) => r.can_id))];
      return { datPhong, gia: g, coKhachHomNay };
    },
    async layThang(canIds, nam, thang) {
      const homNay = homNayVN();
      if (!canIds.length) return { datPhong: [], coDatPhong: false, sapToi: [] };
      const { tu, den } = khoangThang(nam, thang);
      const cot = 'id, can_id, ngay_nhan, ngay_tra, sale_id, tien_phong, tien_coc, trang_thai_tien';
      const [thangNay, mot, dt, sapToi] = await Promise.all([
        // YC2.2 bước 8, PQ8.CHU: kèm tiền phòng, cọc, trạng thái tiền và sale đứng tên cho chi tiết ngày.
        sb.from('booking').select(cot)
          .in('can_id', canIds).neq('trang_thai', 'da_huy').lt('ngay_nhan', den).gt('ngay_tra', tu)
          .order('ngay_nhan'),
        // YC2.1 CN1-00: "chưa có đặt phòng nào (ở mọi tháng)".
        sb.from('booking').select('id').in('can_id', canIds).neq('trang_thai', 'da_huy').limit(1),
        // YC2.3 bước 11, 12, QD10, QD12: một dòng doanh thu, số đêm có khách, doanh thu tháng trước.
        sb.rpc('fn_doanh_thu_thang', { p_thang: tu }),
        // YC2.4 bước 14, YC2-H3: chưa hủy, ngày trả sau hôm nay, ngày nhận trong tháng đang xem trở về trước.
        sb.from('booking').select(cot)
          .in('can_id', canIds).neq('trang_thai', 'da_huy').gt('ngay_tra', homNay).lt('ngay_nhan', den)
          .order('ngay_nhan'),
      ]);
      if (thangNay.error) throw thangNay.error;
      if (sapToi.error) throw sapToi.error;
      if (mot.error) throw mot.error;
      if (dt.error) throw dt.error;
      const dongDt = ((dt.data ?? []) as { doanh_thu: number; so_dem: number; doanh_thu_thang_truoc: number }[])[0];
      const doanhThu: DoanhThuThang | undefined = dongDt && {
        doanhThu: Number(dongDt.doanh_thu), soDem: Number(dongDt.so_dem), thangTruoc: Number(dongDt.doanh_thu_thang_truoc),
      };
      const dong = (thangNay.data ?? []) as DongBooking[];
      const dongSapToi = (sapToi.data ?? []) as DongBooking[];
      // Người đặt đọc một lần cho cả hai danh sách (trùng id thì một dòng).
      const moi = new Map<string, DongBooking>();
      for (const d of [...dong, ...dongSapToi]) moi.set(d.id, d);
      const tatCa = [...moi.values()];

      const theoId = new Map((await themNguoiDat(sb, tatCa)).map((d) => [d.id, d]));
      const sang = (d: DongBooking): DatPhongLich => theoId.get(d.id)!;
      const datPhong = dong.map(sang);
      return {
        datPhong, coDatPhong: datPhong.length > 0 || dongSapToi.length > 0 || (mot.data ?? []).length > 0, doanhThu,
        sapToi: dongSapToi.map(sang),
      };
    },
  };
}
