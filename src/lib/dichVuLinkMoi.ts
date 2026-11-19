// Link mời của chủ nhà (YC6.3, QD8, QD4, PQ18). Xem trước qua fn_xem_link_moi (gọi được khi chưa đăng nhập, không giá),
// thêm lịch qua fn_them_lich_link_moi, lấy link qua fn_lay_link_moi, đổi link qua fn_doi_link_moi. Ảnh xem trước xin đường dẫn
// có hạn từ kho kèm header x-link-moi (policy anh_can_xem_truoc_link).
import type { SupabaseClient } from '@supabase/supabase-js';
import { LoiNguoiDung } from '../chung/matKetNoi';

/** QD16, QT5.7: như KHO_ANH, HAN_ANH_GIAY ở dichVuCan.ts (không nhập để tránh vòng nhập). */
const KHO_ANH = 'anh-can';
const HAN_ANH_GIAY = 60 * 60;

/** YC6.3 bước 4: sơ lược một căn ở A10 (QD8: mã, phòng ngủ, giường, view; không giá). anh là đường dẫn có hạn. */
export type CanXemTruoc = {
  maCan: string; soPhongNgu: number | null; soGiuong: number | null; loaiView: string | null; tenToa: string | null; anh: string | null;
};

export type XemTruocHopLe = {
  trangThai: 'hop_le'; tenChu: string; soCan: number; can: CanXemTruoc[];
  /** YC6.3 bước 7: người gọi đã có kết nối với chủ nhà này (A10-01). */
  daThem: boolean;
  /** YC6-H15: người gọi là người tạo link. */
  cuaMinh: boolean;
  /** YC6-H14: người gọi đang là chủ nhà. */
  saiVai: boolean;
};
/** YC6-H10, YC6-H5: link đã thu hồi, người tạo đã xóa tài khoản, mã sai (khong_dung_duoc) hay quá 21 ngày (het_han). */
export type XemTruocLink = XemTruocHopLe | { trangThai: 'khong_dung_duoc' | 'het_han' };

export interface DichVuLinkMoi {
  xemTruoc(ma: string): Promise<XemTruocLink>;
  /** YC6.3 bước 5. 'da_co' khi đã có kết nối. Link hỏng thì LoiNguoiDung kèm câu A1-link-01. */
  themLich(ma: string): Promise<'da_them' | 'da_co'>;
}

/** YC6.3 bước 1, 6: phần của chủ nhà ở CN7. */
export interface DichVuLinkCuaChu {
  layLinkMoi(): Promise<{ ma: string; soLanGui: number }>;
  doiLinkMoi(): Promise<void>;
}

/** YC6.3 bước 1, pwa.md P4: link https trên tên miền đang chạy app. */
export function duongDanLinkMoi(goc: string, ma: string): string {
  return `${goc.replace(/\/+$/, '')}/l/${ma}`;
}

/** YC6.3 bước 1: tin mời kèm link cho bảng chia sẻ. */
export function tinMoi(link: string): string {
  return `Mời bạn xem lịch phòng trống và giá của tôi trên Lịch phòng Hạ Long: ${link}`;
}

/** A10: "Sapphire 1103". */
export function tenCanXemTruoc(c: CanXemTruoc): string {
  return [c.tenToa, c.maCan].filter(Boolean).join(' ');
}

/** A10: "3PN · 2 giường · view thành phố". */
export function moTaCanXemTruoc(c: CanXemTruoc): string {
  return [
    c.soPhongNgu ? `${c.soPhongNgu}PN` : null,
    c.soGiuong ? `${c.soGiuong} giường` : null,
    c.loaiView || null,
  ].filter(Boolean).join(' · ');
}

/** YC6-H10: câu ở A1-link-01. */
export const CAU_LINK_KHONG_DUNG_DUOC = 'Link mời không còn dùng được.';
export const CAU_LINK_HET_HAN = 'Link mời đã hết hạn.';
export const CAU_NHO_CHU_GUI = 'Nhờ chủ nhà gửi link mới.';
/** YC6-H14, H15. */
export const CAU_LINK_CHO_SALE = 'Link này dành cho sale. Tài khoản của bạn đang là chủ nhà.';
export const CAU_LINK_CUA_MINH = 'Đây là link mời của bạn. Gửi link này cho sale để họ xem lịch.';
/** YC6-H10: hộp hỏi lại khi đổi link. */
export const CAU_HOI_DOI_LINK = 'Đổi link mời? Link cũ sẽ không dùng được nữa. Sale đã thêm lịch vẫn giữ.';

export function cauLinkHong(trangThai: 'khong_dung_duoc' | 'het_han'): string {
  return trangThai === 'het_han' ? CAU_LINK_HET_HAN : CAU_LINK_KHONG_DUNG_DUOC;
}

/** YC6.3 bước 5, A10-02. */
export function cauDaThemLich(soCan: number, tenChu: string): string {
  return `Đã thêm lịch ${soCan} căn của ${tenChu}`;
}

type CanRpc = { ma_can: string; so_phong_ngu: number | null; so_giuong: number | null; loai_view: string | null; ten_toa: string | null; anh: string | null };
type XemTruocRpc = {
  trang_thai: 'hop_le' | 'khong_dung_duoc' | 'het_han'; ten_chu?: string | null; so_can?: number; can?: CanRpc[];
  da_them?: boolean; cua_minh?: boolean; sai_vai?: boolean;
};

/** Đổi dữ liệu fn_xem_link_moi sang dạng màn dùng; ảnh là đường dẫn kho chưa ký. */
export function docXemTruoc(d: XemTruocRpc | null): XemTruocLink {
  if (!d || d.trang_thai !== 'hop_le') return { trangThai: d?.trang_thai === 'het_han' ? 'het_han' : 'khong_dung_duoc' };
  return {
    trangThai: 'hop_le', tenChu: d.ten_chu ?? 'Chủ nhà', soCan: Number(d.so_can ?? 0),
    can: (d.can ?? []).map((c) => ({
      maCan: c.ma_can, soPhongNgu: c.so_phong_ngu, soGiuong: c.so_giuong, loaiView: c.loai_view, tenToa: c.ten_toa, anh: c.anh,
    })),
    daThem: !!d.da_them, cuaMinh: !!d.cua_minh, saiVai: !!d.sai_vai,
  };
}

function loiTuRpc(e: { code?: string; message?: string }): Error {
  // P0001: câu link hỏng, xem quá nhiều; 42501: câu link của mình, link cho sale (YC6-H14, H15). Đều là câu cho người dùng.
  if ((e.code === 'P0001' || e.code === '42501') && e.message) return new LoiNguoiDung(e.message);
  return Object.assign(new Error(e.message ?? 'Lỗi'), { code: e.code });
}

/**
 * kho: địa chỉ Supabase và khóa anon (công khai) để xin ảnh xem trước kèm header x-link-moi. Thiếu thì không có ảnh.
 */
export function taoDichVuLinkMoiSupabase(sb: SupabaseClient, kho?: { url?: string; khoa?: string }): DichVuLinkMoi & DichVuLinkCuaChu {
  const kyAnh = async (ma: string, duongDan: string[]): Promise<Map<string, string>> => {
    const kq = new Map<string, string>();
    if (!duongDan.length || !kho?.url || !kho.khoa) return kq;
    try {
      const goc = kho.url.replace(/\/+$/, '');
      const r = await fetch(`${goc}/storage/v1/object/sign/${KHO_ANH}`, {
        method: 'POST',
        headers: { apikey: kho.khoa, Authorization: `Bearer ${kho.khoa}`, 'Content-Type': 'application/json', 'x-link-moi': ma },
        body: JSON.stringify({ expiresIn: HAN_ANH_GIAY, paths: duongDan }),
      });
      if (!r.ok) return kq;
      const ds = (await r.json()) as { path?: string; signedURL?: string | null }[];
      for (const d of ds) if (d.path && d.signedURL) kq.set(d.path, `${goc}/storage/v1${d.signedURL}`);
    } catch { /* không có ảnh thì vẫn xem trước được */ }
    return kq;
  };
  return {
    async xemTruoc(ma) {
      const { data, error } = await sb.rpc('fn_xem_link_moi', { p_ma: ma });
      if (error) throw loiTuRpc(error);
      const xt = docXemTruoc(data as XemTruocRpc | null);
      if (xt.trangThai !== 'hop_le') return xt;
      const url = await kyAnh(ma, xt.can.map((c) => c.anh).filter((a): a is string => !!a));
      return { ...xt, can: xt.can.map((c) => ({ ...c, anh: c.anh ? url.get(c.anh) ?? null : null })) };
    },
    async themLich(ma) {
      const { data, error } = await sb.rpc('fn_them_lich_link_moi', { p_ma: ma });
      if (error) throw loiTuRpc(error);
      return data === 'da_co' ? 'da_co' : 'da_them';
    },
    async layLinkMoi() {
      const { data, error } = await sb.rpc('fn_lay_link_moi');
      if (error) throw loiTuRpc(error);
      const d = (Array.isArray(data) ? data[0] : data) as { ma: string; so_lan_gui: number } | undefined;
      if (!d) throw new Error('Không có link');
      return { ma: d.ma, soLanGui: d.so_lan_gui };
    },
    async doiLinkMoi() {
      const { error } = await sb.rpc('fn_doi_link_moi');
      if (error) throw loiTuRpc(error);
    },
  };
}
