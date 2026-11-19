// Chi tiết căn của chủ nhà cho sale (YC7.4, YC7 "Dữ liệu", QD4, KT-DB.3.5, KT-DB.3.6): đọc qua fn_sale_chi_tiet_can, ghi mức
// cộng riêng qua fn_dat_muc_cong, fn_bo_muc_cong. Ảnh: xin đường dẫn có hạn 1 giờ từ kho (QT5.7, YC7.4-NT6).
import type { SupabaseClient } from '@supabase/supabase-js';
import { LoiNguoiDung } from '../chung/matKetNoi';
import type { ChiTietCanSale, ChonMuc, DemChiTiet, KetQuaChiTiet, OLichChiTiet } from './chiTietCanSale';
import type { Ngay } from './ngay';

export const KHO_ANH_CAN = 'anh-can';
/** YC7 "Dữ liệu": đường dẫn ảnh cho sale có hạn 1 giờ. */
export const HAN_ANH_SALE_GIAY = 60 * 60;

export interface DichVuChiTietCanSale {
  /** YC7.4 bước 1 đến 6: chi tiết căn cho khoảng `tu` tới trước `den`; không còn quyền thì chỉ có lý do (HV5). */
  doc(canId: string, tu: Ngay, den: Ngay): Promise<KetQuaChiTiet>;
  /** YC7.4 bước 4: ghi mức cộng riêng (số, 0 là "Không cộng") hay bỏ mức riêng (chip "Mặc định"). */
  datMuc(canId: string, chon: ChonMuc): Promise<void>;
}

type Rpc = Record<string, unknown>;
const so = (x: unknown): number | null => (x == null ? null : Number(x));
const chu = (x: unknown): string | null => (typeof x === 'string' ? x : null);

/** jsonb của fn_sale_chi_tiet_can sang dạng màn dùng; ảnh vẫn là đường dẫn trong kho. */
export function docChiTiet(d: Rpc | null | undefined): KetQuaChiTiet {
  if (!d || d.khong_con_quyen !== false) return { khongConQuyen: true, lyDo: chu(d?.ly_do) };
  const c = (d.chu ?? {}) as Rpc;
  const dem: DemChiTiet[] = (Array.isArray(d.dem) ? (d.dem as Rpc[]) : [])
    .map((x) => ({ ngay: String(x.ngay), giaChu: so(x.gia_chu), giaBan: so(x.gia_ban) }));
  const lich: OLichChiTiet[] = (Array.isArray(d.lich) ? (d.lich as Rpc[]) : [])
    .filter((x) => x.o === 'kin' || x.o === 'trong')
    .map((x) => ({ ngay: String(x.ngay), o: x.o as OLichChiTiet['o'] }));
  const ct: ChiTietCanSale = {
    canId: String(d.can_id), maCan: String(d.ma_can ?? ''), tenToa: chu(d.ten_toa), khuVuc: chu(d.khu_vuc),
    soPhongNgu: so(d.so_phong_ngu), soGiuong: so(d.so_giuong), loaiView: chu(d.loai_view), lichDoiLuc: chu(d.lich_doi_luc),
    anh: Array.isArray(d.anh) ? (d.anh as unknown[]).filter((x): x is string => typeof x === 'string') : [],
    chu: { ten: String(c.ten ?? ''), soDienThoai: chu(c.so_dien_thoai), soCan: Number(c.so_can ?? 0) },
    gioNhan: String(d.gio_nhan ?? '14:00'), gioTra: String(d.gio_tra ?? '12:00'), tu: String(d.tu), den: String(d.den), dem,
    tongGiaChu: so(d.tong_gia_chu), tongGiaBan: so(d.tong_gia_ban),
    mucCong: Number(d.muc_cong ?? 0), mucCongRieng: so(d.muc_cong_rieng), mucCongMacDinh: Number(d.muc_cong_mac_dinh ?? 0),
    lamTron50k: d.lam_tron_50k === true, lich,
  };
  return { khongConQuyen: false, ...ct };
}

function loiRpc(error: { message?: string; code?: string }): Error {
  // 42501: căn không còn được xem (HV5); câu tiếng Việt của database hiện cho người dùng (QT5.5).
  if (error.code === '42501' || error.code === '22023') return new LoiNguoiDung(error.message ?? 'Có lỗi');
  return Object.assign(new Error(error.message ?? 'Lỗi'), { code: error.code });
}

export function taoDichVuChiTietCanSaleSupabase(sb: SupabaseClient): DichVuChiTietCanSale {
  return {
    async doc(canId, tu, den) {
      const { data, error } = await sb.rpc('fn_sale_chi_tiet_can', { p_can_id: canId, p_tu: tu, p_den: den });
      if (error) throw loiRpc(error);
      const kq = docChiTiet(data as Rpc | null);
      if (kq.khongConQuyen || !kq.anh.length) return kq;
      // Không xin được đường dẫn ảnh thì phần ảnh để trống, vẫn xem được giá và lịch.
      let url: string[] = [];
      try {
        const { data: ky } = await sb.storage.from(KHO_ANH_CAN).createSignedUrls(kq.anh, HAN_ANH_SALE_GIAY);
        const theo = new Map((ky ?? []).filter((k) => k.path && k.signedUrl).map((k) => [k.path as string, k.signedUrl]));
        url = kq.anh.map((a) => theo.get(a)).filter((u): u is string => !!u);
      } catch { /* bỏ qua */ }
      return { ...kq, anh: url };
    },
    async datMuc(canId, chon) {
      const { error } = chon.loai === 'mac-dinh'
        ? await sb.rpc('fn_bo_muc_cong', { p_can_id: canId })
        : await sb.rpc('fn_dat_muc_cong', { p_can_id: canId, p_muc: chon.muc });
      if (error) throw loiRpc(error);
    },
  };
}
