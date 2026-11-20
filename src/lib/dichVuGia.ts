// Giá chủ nhà của một căn (YC4.2, QD4, PQ5.CHU). Đọc giá tháng, giá dịp qua RLS (gia_thang_doc, gia_dip_doc), đêm cuối tuần
// ở hồ sơ của mình (profiles_doc). Ghi giá tháng qua fn_dat_gia_thang; lịch giá một tháng qua fn_lich_gia_thang (QT5.3).
import type { SupabaseClient } from '@supabase/supabase-js';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { DEM_CUOI_TUAN_MAC_DINH_ISO, type DemGia, type DipGia, type GiaThang, type NgayLeChung } from './gia';
import type { GiaTuan } from './can';
import { congNgay, thuTrongTuan, type Ngay } from './ngay';

/** YC4.2 bước 1, 5: giá 12 tháng của một năm (chỉ số 0 là tháng 1; null là chưa đặt), dải dịp phủ năm đó, đêm cuối tuần. */
export type BangGiaNam = { nam: number; thang: (GiaThang | null)[]; dip: DipGia[]; demCuoiTuan: number[] };

export interface DichVuGia {
  layBangGia(canId: string, nam: number): Promise<BangGiaNam>;
  /** YC4.2 bước 4: ghi đè giá các tháng đã chọn ('YYYY-MM-01') trong một giao dịch. Database từ chối thì LoiNguoiDung (QT5.5). */
  datGiaThang(canId: string, thang: Ngay[], thuong: number, cuoiTuan: number): Promise<void>;
  /** YC4.2 bước 6: mỗi đêm của tháng chứa ngày thang. */
  layLichGia(canId: string, thang: Ngay): Promise<DemGia[]>;
  /** YC4.6 bước 1: đêm cuối tuần của chính người gọi (isodow, 1 là T2, 7 là CN). */
  layDemCuoiTuan?(): Promise<number[]>;
  /** YC4.6 bước 3: căn đầu tiên của người gọi và giá tháng của các tháng trong tuần chứa homNay; chưa có căn thì null. */
  layMauTuan?(homNay: Ngay): Promise<MauTuan | null>;
  /** YC4.6 bước 4: ghi đêm cuối tuần của chính người gọi (fn_dat_dem_cuoi_tuan). Database từ chối thì LoiNguoiDung (QT5.5). */
  datDemCuoiTuan?(dem: number[]): Promise<void>;
  /** YC4.1 bước 1: giá thấp nhất, cao nhất của 7 đêm từ thứ Hai `tu`, theo mã căn, cho mọi căn có lịch của người gọi. */
  layGiaTuan?(tu: Ngay): Promise<Record<string, GiaTuan>>;
  /** YC4.4 bước 4: ghi giá tháng cho mọi căn đã chọn trong một giao dịch (fn_dat_gia_thang_nhieu). */
  datGiaThangNhieu?(canIds: string[], thang: Ngay[], thuong: number, cuoiTuan: number): Promise<void>;
  /** YC4.3 bước 1: dải ngày lễ chung của Home247 cho năm `nam` (ngay_le_doc, PQ21). */
  layNgayLe?(nam: number): Promise<NgayLeChung[]>;
  /** YC4.3 bước 7: lưu một dải giá dịp (fn_luu_gia_dip). Database từ chối thì LoiNguoiDung (QT5.5). */
  luuGiaDip?(canId: string, dai: DaiMoi): Promise<void>;
}

/** YC4.3 bước 7: dải giá dịp mới. ten rỗng thì database đặt tên tự động. */
export type DaiMoi = { tuNgay: Ngay; denNgay: Ngay; ten: string; gia: number; laNgayLe: boolean };

/** Căn mẫu cho "Một tuần của phòng <mã>" và giá tháng theo khóa 'YYYY-MM-01'. */
export type MauTuan = { maCan: string; giaThang: Record<Ngay, GiaThang | null> };

/** QT5.5: lỗi P0001 mang câu cho người dùng; lỗi khác để màn hiện câu chung (HV2). */
export function loiGia(e: { code?: string; message?: string }): Error {
  if (e.code === 'P0001' && e.message) return new LoiNguoiDung(e.message);
  const loi = new Error(e.message || 'Lỗi giá');
  (loi as Error & { code?: string }).code = e.code;
  return loi;
}

export function taoDichVuGiaSupabase(sb: SupabaseClient): DichVuGia {
  return {
    async layBangGia(canId, nam) {
      const [gt, dp, hs] = await Promise.all([
        sb.from('gia_thang').select('thang, gia_thuong, gia_cuoi_tuan').eq('can_id', canId)
          .gte('thang', `${nam}-01-01`).lte('thang', `${nam}-12-01`),
        sb.from('gia_dip').select('id, tu_ngay, den_ngay, ten, gia, la_ngay_le').eq('can_id', canId)
          .lte('tu_ngay', `${nam}-12-31`).gte('den_ngay', `${nam}-01-01`).order('tu_ngay'),
        sb.auth.getUser().then(async ({ data }) => data.user
          ? sb.from('profiles').select('dem_cuoi_tuan').eq('id', data.user.id).maybeSingle()
          : { data: null, error: null }),
      ]);
      if (gt.error) throw loiGia(gt.error);
      if (dp.error) throw loiGia(dp.error);
      const thang: (GiaThang | null)[] = Array.from({ length: 12 }, () => null);
      for (const r of (gt.data ?? []) as { thang: string; gia_thuong: number; gia_cuoi_tuan: number }[]) {
        thang[Number(r.thang.slice(5, 7)) - 1] = { thuong: Number(r.gia_thuong), cuoiTuan: Number(r.gia_cuoi_tuan) };
      }
      const dip = ((dp.data ?? []) as { id: string; tu_ngay: string; den_ngay: string; ten: string | null; gia: number; la_ngay_le: boolean }[])
        .map((d) => ({ id: d.id, tuNgay: d.tu_ngay, denNgay: d.den_ngay, ten: d.ten, gia: Number(d.gia), laNgayLe: d.la_ngay_le }));
      const dct = (hs.data as { dem_cuoi_tuan: number[] | null } | null)?.dem_cuoi_tuan;
      return { nam, thang, dip, demCuoiTuan: dct?.length ? dct.map(Number) : [...DEM_CUOI_TUAN_MAC_DINH_ISO] };
    },

    async datGiaThang(canId, thang, thuong, cuoiTuan) {
      const { error } = await sb.rpc('fn_dat_gia_thang', {
        p_can_id: canId, p_thang: thang, p_gia_thuong: thuong, p_gia_cuoi_tuan: cuoiTuan,
      });
      if (error) throw loiGia(error);
    },

    async layLichGia(canId, thang) {
      const { data, error } = await sb.rpc('fn_lich_gia_thang', { p_can_id: canId, p_thang: thang });
      if (error) throw loiGia(error);
      return ((data ?? []) as { dem: string; gia: number | null; loai: DemGia['loai']; co_khach: boolean }[])
        .map((d) => ({ dem: d.dem, gia: d.gia === null ? null : Number(d.gia), loai: d.loai, coKhach: d.co_khach }));
    },

    // YC4.6 bước 1, PQ6.CHU: hồ sơ của chính mình (profiles_doc).
    async layDemCuoiTuan() {
      const { data: u } = await sb.auth.getUser();
      if (!u.user) throw new TypeError('chưa đăng nhập');
      const { data, error } = await sb.from('profiles').select('dem_cuoi_tuan').eq('id', u.user.id).maybeSingle();
      if (error) throw loiGia(error);
      const d = (data as { dem_cuoi_tuan: number[] | null } | null)?.dem_cuoi_tuan;
      return d?.length ? d.map(Number) : [...DEM_CUOI_TUAN_MAC_DINH_ISO];
    },

    // YC4.6 bước 3: căn tạo sớm nhất chưa ẩn của mình (can_doc), giá tháng của các tháng trong tuần (gia_thang_doc).
    async layMauTuan(homNay) {
      const thuHai = congNgay(homNay, -((thuTrongTuan(homNay) + 6) % 7));
      const thang = [...new Set(Array.from({ length: 7 }, (_, i) => `${congNgay(thuHai, i).slice(0, 7)}-01`))];
      const { data: u } = await sb.auth.getUser();
      if (!u.user) throw new TypeError('chưa đăng nhập');
      const can = await sb.from('can').select('id, ma_can').eq('nguoi_giu', u.user.id).is('an_luc', null)
        .order('tao_luc', { ascending: true }).limit(1).maybeSingle();
      if (can.error) throw loiGia(can.error);
      const c = can.data as { id: string; ma_can: string } | null;
      if (!c) return null;
      const gt = await sb.from('gia_thang').select('thang, gia_thuong, gia_cuoi_tuan').eq('can_id', c.id).in('thang', thang);
      if (gt.error) throw loiGia(gt.error);
      const giaThang: Record<Ngay, GiaThang | null> = {};
      for (const r of (gt.data ?? []) as { thang: string; gia_thuong: number; gia_cuoi_tuan: number }[]) {
        giaThang[r.thang] = { thuong: Number(r.gia_thuong), cuoiTuan: Number(r.gia_cuoi_tuan) };
      }
      return { maCan: c.ma_can, giaThang };
    },

    async datDemCuoiTuan(dem) {
      const { error } = await sb.rpc('fn_dat_dem_cuoi_tuan', { p_dem: dem });
      if (error) throw loiGia(error);
    },

    // YC4.4 bước 4, PQ5.CHU: một căn không hợp lệ thì database không ghi căn nào.
    async datGiaThangNhieu(canIds, thang, thuong, cuoiTuan) {
      const { error } = await sb.rpc('fn_dat_gia_thang_nhieu', {
        p_can_ids: canIds, p_thang: thang, p_gia_thuong: thuong, p_gia_cuoi_tuan: cuoiTuan,
      });
      if (error) throw loiGia(error);
    },

    // YC4.3 bước 1, PQ21.CHU: mọi người đã đăng nhập đọc dải ngày lễ chung.
    async layNgayLe(nam) {
      const { data, error } = await sb.from('ngay_le').select('ten, tu_ngay, den_ngay').eq('nam', nam).order('tu_ngay');
      if (error) throw loiGia(error);
      return ((data ?? []) as { ten: string; tu_ngay: string; den_ngay: string }[])
        .map((r) => ({ ten: r.ten, tuNgay: r.tu_ngay, denNgay: r.den_ngay }));
    },

    // YC4.3 bước 7, PQ5.CHU: lệnh fn_luu_gia_dip tự kiểm người giữ căn, luật kiểm, trùng ngày.
    async luuGiaDip(canId, dai) {
      const { error } = await sb.rpc('fn_luu_gia_dip', {
        p_can_id: canId, p_tu_ngay: dai.tuNgay, p_den_ngay: dai.denNgay, p_ten: dai.ten, p_gia: dai.gia, p_la_ngay_le: dai.laNgayLe,
      });
      if (error) throw loiGia(error);
    },

    // YC4.1 bước 1, QT5.3, PQ5.CHU: lệnh fn_gia_tuan_cua_toi.
    async layGiaTuan(tu) {
      const { data, error } = await sb.rpc('fn_gia_tuan_cua_toi', { p_tu: tu });
      if (error) throw loiGia(error);
      const kq: Record<string, GiaTuan> = {};
      for (const r of (data ?? []) as { can_id: string; gia_thap: number | null; gia_cao: number | null }[]) {
        kq[r.can_id] = { thap: r.gia_thap === null ? null : Number(r.gia_thap), cao: r.gia_cao === null ? null : Number(r.gia_cao) };
      }
      return kq;
    },
  };
}
