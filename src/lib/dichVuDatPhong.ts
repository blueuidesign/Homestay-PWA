// Đọc đặt phòng chưa hủy các căn của chủ nhà cho form Thêm đặt phòng CN4 (YC5.1 bước 1a, 1b, 4; QD4; PQ7.CHU, PQ9.CHU).
// Đọc thẳng bảng booking qua RLS booking_doc (chỉ căn của người gọi), tên khách chính mình nhập qua booking_rieng (QD11),
// tên sale qua v_nguoi_ket_noi. US27 (YC5.2): giá chủ nhà từng đêm (fn_gia_chu_cac_dem), người đặt (ket_noi, v_nguoi_ket_noi,
// fn_ten_khach_da_dung), giờ nhận trả trong hồ sơ của mình, lệnh ghi fn_tao_booking.
// US30 (YC5.5): chi tiết đặt phòng fn_chi_tiet_dat_phong, lệnh fn_da_thu_du, fn_hoan_tac_thu_du (PQ7.CHU, PQ8.CHU, QD11, QD13).
import type { SupabaseClient } from '@supabase/supabase-js';
import { LoiNguoiDung } from '../chung/matKetNoi';
import type { ChiTietDatPhong, GiaDem, SaleKetNoi, TrangThaiTienForm } from './datPhong';
import type { DatPhongLich, NguoiDat, TrangThaiTien } from './lich';

/** YC5.3 bước 9: dữ liệu form gửi lệnh ghi. Tiền là số nguyên đồng. */
export type DatPhongMoi = {
  canId: string; ngayNhan: string; ngayTra: string; tienPhong: number; clientId: string;
  saleId: string | null; tenKhach: string | null; sdtKhach: string | null;
  trangThaiTien: TrangThaiTienForm; tienCoc: number | null;
  soKhach: number | null; gioNhan: string | null; gioTra: string | null; ghiChu: string | null;
};

/** QT5.5: lỗi P0001 mang câu cho người dùng; lỗi khác để màn hiện câu chung (HV2). */
function loiDatPhong(e: { code?: string; message?: string }): Error {
  if (e.code === 'P0001' && e.message) return new LoiNguoiDung(e.message);
  const loi = new Error(e.message || 'Lỗi đặt phòng');
  (loi as Error & { code?: string }).code = e.code;
  return loi;
}

export interface DichVuDatPhong {
  /** YC5.1 bước 1a: đặt phòng chưa hủy (QT2.1) của các căn `canIds`, có tên người đặt để hiện ở dòng trùng (bước 4). */
  layDatPhong(canIds: string[]): Promise<DatPhongLich[]>;
  /** YC5.2 bước 7, QT5.3: giá chủ nhà từng đêm của căn trong [nhận, trả). */
  layGiaDem?(canId: string, ngayNhan: string, ngayTra: string): Promise<GiaDem[]>;
  /** YC5.2 bước 5: sale đang kết nối và tên khách lẻ chủ nhà đã nhập (mới nhất trước, tối đa 10). */
  layNguoiDat?(): Promise<{ sale: SaleKetNoi[]; tenKhach: string[] }>;
  /** YC5.2 bước 8c: giờ nhận, giờ trả trong cài đặt của chủ nhà ("14:00"). */
  layGioMacDinh?(): Promise<{ gioNhan: string; gioTra: string }>;
  /** YC5.3 bước 9: lệnh ghi fn_tao_booking; trả id đặt phòng. Database từ chối thì LoiNguoiDung (QT5.5). */
  taoDatPhong?(d: DatPhongMoi): Promise<string>;
  /** YC5.5 bước 16: chi tiết một đặt phòng của căn mình; null khi không còn (HV5). */
  layChiTiet?(id: string): Promise<ChiTietDatPhong | null>;
  /** YC5.5 bước 20: lệnh ghi đã thu đủ; trả trạng thái tiền mới. */
  daThuDu?(id: string): Promise<TrangThaiTien>;
  /** YC5.5 bước 21: lệnh hoàn tác thu đủ; trả trạng thái tiền mới. */
  hoanTacThuDu?(id: string): Promise<TrangThaiTien>;
}

type DongChiTiet = {
  id: string; can_id: string; ma_can: string; ngay_nhan: string; ngay_tra: string; gio_nhan: string | null; gio_tra: string | null;
  tien_phong: number; tien_coc: number | null; trang_thai_tien: TrangThaiTien | null; co_hoan_tac: boolean; trang_thai: string;
  ghi_chu: string | null; sale_id: string | null; ten_sale: string | null; sdt_sale: string | null; sale_da_xoa: boolean;
  ten_khach: string | null; sdt_khach: string | null; so_khach: number | null;
};

/** YC5.5: đổi một dòng của fn_chi_tiet_dat_phong ra dữ liệu màn. Tiền là số nguyên đồng. */
export function docChiTiet(d: DongChiTiet): ChiTietDatPhong {
  return {
    id: d.id, canId: d.can_id, maCan: d.ma_can, ngayNhan: d.ngay_nhan, ngayTra: d.ngay_tra,
    gioNhan: d.gio_nhan ? d.gio_nhan.slice(0, 5) : null, gioTra: d.gio_tra ? d.gio_tra.slice(0, 5) : null,
    tienPhong: Number(d.tien_phong), tienCoc: d.tien_coc === null ? null : Number(d.tien_coc),
    trangThaiTien: d.trang_thai_tien, coHoanTac: !!d.co_hoan_tac, daHuy: d.trang_thai === 'da_huy',
    ghiChu: d.ghi_chu, saleId: d.sale_id, tenSale: d.ten_sale, sdtSale: d.sdt_sale, saleDaXoa: !!d.sale_da_xoa,
    tenKhach: d.ten_khach, sdtKhach: d.sdt_khach, soKhach: d.so_khach,
  };
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

    async layGiaDem(canId, ngayNhan, ngayTra) {
      const { data, error } = await sb.rpc('fn_gia_chu_cac_dem', { p_can_id: canId, p_ngay_nhan: ngayNhan, p_ngay_tra: ngayTra });
      if (error) throw loiDatPhong(error);
      return ((data ?? []) as { dem: string; gia: number | null }[]).map((d) => ({ dem: d.dem, gia: d.gia === null ? null : Number(d.gia) }));
    },

    // PQ17.CHU: kết nối của mình (ket_noi_doc), tên sale qua v_nguoi_ket_noi; PQ9.CHU: tên khách của mình (fn_ten_khach_da_dung).
    async layNguoiDat() {
      const { data: u } = await sb.auth.getUser();
      if (!u.user) throw new TypeError('chưa đăng nhập');
      const [kn, ten] = await Promise.all([
        sb.from('ket_noi').select('sale_id').eq('chu_id', u.user.id).eq('trang_thai', 'da_ket_noi').order('tao_luc'),
        sb.rpc('fn_ten_khach_da_dung'),
      ]);
      if (kn.error) throw loiDatPhong(kn.error);
      if (ten.error) throw loiDatPhong(ten.error);
      const ids = ((kn.data ?? []) as { sale_id: string }[]).map((k) => k.sale_id);
      const tenSale = new Map<string, string>();
      if (ids.length) {
        const ng = await sb.from('v_nguoi_ket_noi').select('id, ten_hien_thi').in('id', ids);
        if (ng.error) throw loiDatPhong(ng.error);
        for (const n of (ng.data ?? []) as { id: string; ten_hien_thi: string | null }[]) tenSale.set(n.id, n.ten_hien_thi ?? '');
      }
      return {
        sale: ids.filter((id) => tenSale.get(id)).map((id) => ({ id, ten: tenSale.get(id)! })),
        tenKhach: ((ten.data ?? []) as { ten: string }[]).map((r) => r.ten),
      };
    },

    // YC1, PQ6.CHU: hồ sơ của chính mình (profiles_doc).
    async layGioMacDinh() {
      const { data: u } = await sb.auth.getUser();
      if (!u.user) throw new TypeError('chưa đăng nhập');
      const { data, error } = await sb.from('profiles').select('gio_nhan, gio_tra').eq('id', u.user.id).maybeSingle();
      if (error) throw loiDatPhong(error);
      const h = data as { gio_nhan: string | null; gio_tra: string | null } | null;
      return { gioNhan: (h?.gio_nhan ?? '14:00').slice(0, 5), gioTra: (h?.gio_tra ?? '12:00').slice(0, 5) };
    },

    async taoDatPhong(d) {
      const { data, error } = await sb.rpc('fn_tao_booking', {
        p_can_id: d.canId, p_ngay_nhan: d.ngayNhan, p_ngay_tra: d.ngayTra, p_tien_phong: d.tienPhong, p_client_id: d.clientId,
        p_sale_id: d.saleId, p_ten_khach: d.tenKhach, p_sdt_khach: d.sdtKhach, p_trang_thai_tien: d.trangThaiTien,
        p_tien_coc: d.tienCoc, p_so_khach: d.soKhach, p_gio_nhan: d.gioNhan, p_gio_tra: d.gioTra, p_ghi_chu: d.ghiChu,
      });
      if (error) throw loiDatPhong(error);
      return String(data);
    },

    async layChiTiet(id) {
      const { data, error } = await sb.rpc('fn_chi_tiet_dat_phong', { p_booking_id: id });
      if (error) throw loiDatPhong(error);
      const dong = ((data ?? []) as DongChiTiet[])[0];
      return dong ? docChiTiet(dong) : null;
    },

    async daThuDu(id) {
      const { data, error } = await sb.rpc('fn_da_thu_du', { p_booking_id: id });
      if (error) throw loiDatPhong(error);
      return data as TrangThaiTien;
    },

    async hoanTacThuDu(id) {
      const { data, error } = await sb.rpc('fn_hoan_tac_thu_du', { p_booking_id: id });
      if (error) throw loiDatPhong(error);
      return data as TrangThaiTien;
    },
  };
}
