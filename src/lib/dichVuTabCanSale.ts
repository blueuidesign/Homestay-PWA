// Tab Căn của sale (YC10.1, YC10 "Dữ liệu", QD4, QD13, KT-DB.3.5): đọc qua fn_tab_can_sale, chi tiết căn của tôi qua
// fn_chi_tiet_can_cua_toi, bỏ dòng chủ đã xóa tài khoản hay đã ngừng cho xem qua fn_sale_bo_dong_chu. Số chủ nhà đọc qua v_nguoi_ket_noi (PQ2.SALE).
// Ảnh đại diện đọc qua RLS (anh_can_doc), xin đường dẫn có hạn 1 giờ từ kho (QT5.7).
import type { SupabaseClient } from '@supabase/supabase-js';
import { LoiNguoiDung } from '../chung/matKetNoi';
import type { CoChuNgung } from './chiTietChuNha';
import { taoDichVuChiTietChuNhaSupabase, type DichVuChiTietChuNha } from './dichVuChiTietChuNha';
import { chiaTabCan, type ChiTietCanCuaToi, type DongTabCan, type TabCan } from './tabCanSale';
import type { Ngay } from './ngay';

export const KHO_ANH_TAB = 'anh-can';
export const HAN_ANH_TAB_GIAY = 60 * 60;

export interface DichVuTabCanSale {
  /** YC10.1 bước 1, 2, 3, 9: ba nhóm của tab Căn. */
  doc(): Promise<TabCan>;
  /** YC10.1 bước 7: chi tiết căn của tôi, 7 đêm từ `tu`. */
  docCanCuaToi(canId: string, tu: Ngay): Promise<ChiTietCanCuaToi>;
  /** YC10.1 bước 10: bỏ dòng chủ nhà đã xóa tài khoản. */
  boDongChu(ketNoiId: string): Promise<void>;
  /** YC10.2 (US55): S6-04 chi tiết chủ nhà, bỏ nguồn. */
  chiTietChuNha?: DichVuChiTietChuNha;
}

type Rpc = Record<string, unknown>;
const so = (x: unknown): number | null => (x == null ? null : Number(x));
const chu = (x: unknown): string | null => (typeof x === 'string' ? x : null);

/** Dòng fn_tab_can_sale sang dạng màn dùng. Nhóm lạ bỏ đi. */
export function docDong(d: Rpc): DongTabCan | null {
  if (d.nhom !== 'cua_toi' && d.nhom !== 'nguon' && d.nhom !== 'tu_nhap') return null;
  return {
    nhom: d.nhom, canId: chu(d.can_id), maCan: chu(d.ma_can), tenToa: chu(d.ten_toa),
    soPhongNgu: so(d.so_phong_ngu), soGiuong: so(d.so_giuong), loaiView: chu(d.loai_view), khachDen: chu(d.khach_den),
    ketNoiId: chu(d.ket_noi_id), chuId: chu(d.chu_id), tenChu: chu(d.ten_chu), chuDaXoa: d.chu_da_xoa_tai_khoan === true,
    capNhatLuc: chu(d.cap_nhat_luc), chuCanTen: chu(d.chu_can_ten),
  };
}

/** jsonb của fn_chi_tiet_can_cua_toi; ảnh vẫn là đường dẫn trong kho. */
export function docChiTietCanCuaToi(d: Rpc): ChiTietCanCuaToi {
  return {
    canId: String(d.can_id), maCan: String(d.ma_can ?? ''), tenToa: chu(d.ten_toa), soPhongNgu: so(d.so_phong_ngu),
    soGiuong: so(d.so_giuong), loaiView: chu(d.loai_view),
    anh: Array.isArray(d.anh) ? (d.anh as unknown[]).filter((x): x is string => typeof x === 'string') : [],
    dem: (Array.isArray(d.dem) ? (d.dem as Rpc[]) : [])
      .filter((x) => x.o === 'kin' || x.o === 'trong')
      .map((x) => ({ ngay: String(x.ngay), o: x.o as 'kin' | 'trong', gia: so(x.gia) })),
  };
}

function loiRpc(error: { message?: string; code?: string }): Error {
  // 42501: không còn quyền (HV5); P0001: câu tiếng Việt của database (QT5.5).
  if (error.code === '42501' || error.code === 'P0001') return new LoiNguoiDung(error.message ?? 'Có lỗi');
  return Object.assign(new Error(error.message ?? 'Lỗi'), { code: error.code });
}

async function kyAnh(sb: SupabaseClient, duongDan: string[]): Promise<Map<string, string>> {
  const url = new Map<string, string>();
  if (!duongDan.length) return url;
  try {
    const { data } = await sb.storage.from(KHO_ANH_TAB).createSignedUrls(duongDan, HAN_ANH_TAB_GIAY);
    for (const k of data ?? []) if (k.path && k.signedUrl) url.set(k.path, k.signedUrl);
  } catch { /* ảnh không phải dữ liệu chính: để trống */ }
  return url;
}

export function taoDichVuTabCanSaleSupabase(sb: SupabaseClient): DichVuTabCanSale {
  return {
    async doc() {
      const { data, error } = await sb.rpc('fn_tab_can_sale');
      if (error) throw loiRpc(error);
      const dong = ((data ?? []) as Rpc[]).map(docDong).filter((d): d is DongTabCan => d !== null);
      // YC10-H1, YC10.2-NT6: kết nối chủ đã ngừng cho xem (cột chu_ngung, US55).
      const ngung = new Set(((data ?? []) as Rpc[]).filter((d) => d.chu_ngung === true).map((d) => String(d.ket_noi_id)));
      const ids = dong.map((d) => d.canId).filter((x): x is string => !!x);
      // Ảnh đại diện và số chủ nhà: thiếu thì thẻ vẫn hiện (không phải dữ liệu chính của tab).
      const anh = new Map<string, string>();
      try {
        if (ids.length) {
          const { data: a } = await sb.from('anh_can').select('can_id, duong_dan, thu_tu').in('can_id', ids)
            .order('thu_tu', { ascending: true, nullsFirst: false });
          for (const r of (a ?? []) as { can_id: string; duong_dan: string }[]) if (!anh.has(r.can_id)) anh.set(r.can_id, r.duong_dan);
        }
      } catch { /* bỏ qua */ }
      const url = await kyAnh(sb, [...anh.values()]);
      for (const d of dong) if (d.canId && anh.has(d.canId)) d.anh = url.get(anh.get(d.canId)!) ?? null;
      const tab = chiaTabCan(dong);
      for (const n of tab.chuNha) if (ngung.has(n.ketNoiId)) (n as typeof n & CoChuNgung).chuNgung = true;
      try {
        const { data: so } = await sb.from('v_nguoi_ket_noi').select('id, so_dien_thoai');
        const sdt = new Map(((so ?? []) as { id: string; so_dien_thoai: string | null }[]).map((r) => [r.id, r.so_dien_thoai]));
        for (const n of tab.chuNha) n.soDienThoai = n.daXoa ? null : sdt.get(n.chuId) ?? null;
      } catch { /* bỏ qua */ }
      return tab;
    },
    async docCanCuaToi(canId, tu) {
      const { data, error } = await sb.rpc('fn_chi_tiet_can_cua_toi', { p_can_id: canId, p_tu: tu });
      if (error) throw loiRpc(error);
      const ct = docChiTietCanCuaToi((data ?? {}) as Rpc);
      const url = await kyAnh(sb, ct.anh);
      return { ...ct, anh: ct.anh.map((p) => url.get(p)).filter((x): x is string => !!x) };
    },
    chiTietChuNha: taoDichVuChiTietChuNhaSupabase(sb),
    async boDongChu(ketNoiId) {
      const { error } = await sb.rpc('fn_sale_bo_dong_chu', { p_ket_noi_id: ketNoiId });
      if (error) throw loiRpc(error);
    },
  };
}
