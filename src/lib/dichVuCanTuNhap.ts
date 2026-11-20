// Căn tự nhập của sale (YC10.3, YC10 "Dữ liệu", QD4, QD11, PQ14.SALE): tạo qua fn_tao_can_tu_nhap, đọc chi tiết qua
// fn_can_tu_nhap (S6-03), sửa qua fn_sua_can_tu_nhap, xóa thật qua fn_xoa_can_tu_nhap. Ảnh xin đường dẫn có hạn 1 giờ (QT5.7).
// Tải ảnh, danh sách tòa, thêm tòa dùng chung với form Thêm căn của chủ nhà (dichVuCan, YC3.3, YC3.4).
import type { SupabaseClient } from '@supabase/supabase-js';
import { LoiNguoiDung } from '../chung/matKetNoi';
import type { DatPhongTuGhi } from './canTuNhap';
import type { AnhCoSan, TaiAnh } from './dichVuCan';
import type { DanhSachToa } from './toaNha';

export const KHO_ANH_TU_NHAP = 'anh-can';
export const HAN_ANH_TU_NHAP_GIAY = 60 * 60;

/** YC10.3 bước 2 đến 5, 7. clientId giữ nguyên khi bấm lại (QT5.6). Giá là số nguyên đồng, null là không nhập. */
export type CanTuNhapMoi = {
  tenChu: string; soDienThoai: string; maCan: string; soPhongNgu: number; clientId: string;
  toaNhaId: string | null; loaiView: string | null; soGiuong: number | null;
  giaThuong: number | null; giaCuoiTuan: number | null; anh: string[];
};

/** YC10.3 bước 12: chỉ các ô đã đổi. soDienThoai null là xóa số (QD11). */
export type SuaCanTuNhap = Partial<{
  tenChu: string; soDienThoai: string | null; maCan: string; soPhongNgu: number; toaNhaId: string | null;
  loaiView: string | null; soGiuong: number | null; giaThuong: number | null; giaCuoiTuan: number | null; anh: string[];
}>;

/** fn_can_tu_nhap, ảnh đã đổi sang đường dẫn có hạn. */
export type ChiTietCanTuNhap = {
  canId: string; maCan: string; toaNhaId: string | null; tenToa: string | null; soPhongNgu: number | null;
  soGiuong: number | null; loaiView: string | null; tenChu: string | null; soDienThoai: string | null;
  giaThuong: number | null; giaCuoiTuan: number | null; anh: AnhCoSan[]; datPhong: DatPhongTuGhi[];
};

export interface DichVuCanTuNhap {
  tao(c: CanTuNhapMoi): Promise<string>;
  doc(canId: string): Promise<ChiTietCanTuNhap>;
  sua(canId: string, s: SuaCanTuNhap): Promise<void>;
  xoa(canId: string): Promise<void>;
  taiAnh?: TaiAnh;
  layToa?: () => Promise<DanhSachToa>;
  themToa?: (ten: string) => Promise<string>;
}

type Rpc = Record<string, unknown>;
const so = (x: unknown): number | null => (x == null ? null : Number(x));
const chu = (x: unknown): string | null => (typeof x === 'string' ? x : null);

/** jsonb của fn_can_tu_nhap; ảnh vẫn là đường dẫn trong kho (url là đường dẫn đó). */
export function docChiTiet(d: Rpc): ChiTietCanTuNhap {
  return {
    canId: String(d.can_id), maCan: String(d.ma_can ?? ''), toaNhaId: chu(d.toa_nha_id), tenToa: chu(d.ten_toa),
    soPhongNgu: so(d.so_phong_ngu), soGiuong: so(d.so_giuong), loaiView: chu(d.loai_view),
    tenChu: chu(d.chu_can_ten), soDienThoai: chu(d.chu_can_sdt), giaThuong: so(d.gia_chu_thuong), giaCuoiTuan: so(d.gia_chu_cuoi_tuan),
    anh: (Array.isArray(d.anh) ? (d.anh as Rpc[]) : []).map((a) => ({ id: String(a.id), url: chu(a.duong_dan) })),
    datPhong: (Array.isArray(d.dat_phong) ? (d.dat_phong as Rpc[]) : []).map((b) => ({
      id: String(b.id), ngayNhan: String(b.ngay_nhan), ngayTra: String(b.ngay_tra), traChu: Number(b.tra_chu), thuKhach: so(b.thu_khach),
    })),
  };
}

/** YC10.3 bước 12: tên trường của p_sua. */
export function thamSoSua(s: SuaCanTuNhap): Rpc {
  const p: Rpc = {};
  if ('tenChu' in s) p.chu_can_ten = s.tenChu;
  if ('soDienThoai' in s) p.chu_can_sdt = s.soDienThoai;
  if ('maCan' in s) p.ma_can = s.maCan;
  if ('soPhongNgu' in s) p.so_phong_ngu = s.soPhongNgu;
  if ('toaNhaId' in s) p.toa_nha_id = s.toaNhaId;
  if ('loaiView' in s) p.loai_view = s.loaiView;
  if ('soGiuong' in s) p.so_giuong = s.soGiuong;
  if ('giaThuong' in s) p.gia_chu_thuong = s.giaThuong;
  if ('giaCuoiTuan' in s) p.gia_chu_cuoi_tuan = s.giaCuoiTuan;
  if ('anh' in s) p.anh = s.anh;
  return p;
}

function loiRpc(error: { message?: string; code?: string }): Error {
  // 42501: không còn quyền hay căn không còn (HV5); P0001: câu tiếng Việt của database (QT5.5).
  if (error.code === '42501' || error.code === 'P0001') return new LoiNguoiDung(error.message ?? 'Có lỗi');
  return Object.assign(new Error(error.message ?? 'Lỗi'), { code: error.code });
}

export function taoDichVuCanTuNhapSupabase(sb: SupabaseClient, chung: Pick<DichVuCanTuNhap, 'taiAnh' | 'layToa' | 'themToa'> = {}): DichVuCanTuNhap {
  return {
    ...chung,
    async tao(c) {
      const { data, error } = await sb.rpc('fn_tao_can_tu_nhap', {
        p_chu_can_ten: c.tenChu, p_chu_can_sdt: c.soDienThoai, p_ma_can: c.maCan, p_so_phong_ngu: c.soPhongNgu,
        p_client_id: c.clientId, p_toa_nha_id: c.toaNhaId, p_loai_view: c.loaiView, p_so_giuong: c.soGiuong,
        p_gia_chu_thuong: c.giaThuong, p_gia_chu_cuoi_tuan: c.giaCuoiTuan, p_anh: c.anh.length ? c.anh : null,
      });
      if (error) throw loiRpc(error);
      return data as string;
    },
    async doc(canId) {
      const { data, error } = await sb.rpc('fn_can_tu_nhap', { p_can_id: canId });
      if (error) throw loiRpc(error);
      const ct = docChiTiet((data ?? {}) as Rpc);
      const duongDan = ct.anh.map((a) => a.url).filter((x): x is string => !!x);
      const url = new Map<string, string>();
      if (duongDan.length) {
        // Không xin được đường dẫn thì ô ảnh để trống (ảnh không phải dữ liệu chính).
        try {
          const { data: ky } = await sb.storage.from(KHO_ANH_TU_NHAP).createSignedUrls(duongDan, HAN_ANH_TU_NHAP_GIAY);
          for (const k of ky ?? []) if (k.path && k.signedUrl) url.set(k.path, k.signedUrl);
        } catch { /* bỏ qua */ }
      }
      return { ...ct, anh: ct.anh.map((a) => ({ id: a.id, url: a.url ? url.get(a.url) ?? null : null })) };
    },
    async sua(canId, s) {
      const { error } = await sb.rpc('fn_sua_can_tu_nhap', { p_can_id: canId, p_sua: thamSoSua(s) });
      if (error) throw loiRpc(error);
    },
    async xoa(canId) {
      const { error } = await sb.rpc('fn_xoa_can_tu_nhap', { p_can_id: canId });
      if (error) throw loiRpc(error);
    },
  };
}
