// Gửi thông tin cho khách (YC8.1, YC8 "Dữ liệu", QD4, PQ11.SALE, PQ12.SALE): soạn tin qua fn_soan_tin_gui_khach (không ghi
// gì), ghi lần gửi qua fn_ghi_lan_gui. Ảnh: xin đường dẫn có hạn 1 giờ từ kho, như chi tiết căn (US46).
import type { SupabaseClient } from '@supabase/supabase-js';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { HAN_ANH_SALE_GIAY, KHO_ANH_CAN } from './dichVuChiTietCanSale';
import type { CanGuiKhach, TinGuiKhach } from './guiKhach';
import type { Ngay } from './ngay';

export interface DichVuGuiKhach {
  /** YC8.1 bước 2: chữ từng căn theo thứ tự canIds, giá bán, 10 ảnh đầu (đường dẫn có hạn 1 giờ). */
  soan(canIds: string[], tu: Ngay, den: Ngay): Promise<TinGuiKhach>;
  /** YC8.1 bước 4 đến 7: ghi lần gửi cho các căn (căn, đêm từ tu tới trước den). */
  ghiLanGui(canIds: string[], tu: Ngay, den: Ngay): Promise<void>;
  /** YC8.1 bước 5: tải ảnh thành file để đưa vào bảng chia sẻ hay lưu về máy. */
  taiAnh(urls: string[]): Promise<File[]>;
}

type Rpc = Record<string, unknown>;
const so = (x: unknown): number | null => (x == null ? null : Number(x));
const chu = (x: unknown): string | null => (typeof x === 'string' ? x : null);

/** jsonb của fn_soan_tin_gui_khach sang dạng màn dùng; ảnh vẫn là đường dẫn trong kho. */
export function docTin(d: Rpc | null | undefined): TinGuiKhach {
  const ds = Array.isArray(d?.can) ? (d?.can as Rpc[]) : [];
  const can: CanGuiKhach[] = ds.map((c) => ({
    canId: String(c.can_id), maCan: String(c.ma_can ?? ''), tenToa: chu(c.ten_toa),
    soPhongNgu: so(c.so_phong_ngu), soGiuong: so(c.so_giuong), chu: String(c.chu ?? ''),
    soAnh: Number(c.so_anh ?? 0),
    anh: Array.isArray(c.anh) ? (c.anh as unknown[]).filter((x): x is string => typeof x === 'string') : [],
    tongGiaBan: so(c.tong_gia_ban),
  }));
  return {
    tu: String(d?.tu ?? ''), den: String(d?.den ?? ''), soDem: Number(d?.so_dem ?? 0),
    mauTin: String(d?.mau_tin ?? ''), tenSale: String(d?.ten_sale ?? ''), can,
  };
}

function loiRpc(error: { message?: string; code?: string }): Error {
  // 42501 căn không còn được gửi, 22023 quá 10 căn: câu tiếng Việt của database hiện cho người dùng (QT5.5).
  if (error.code === '42501' || error.code === '22023') return new LoiNguoiDung(error.message ?? 'Có lỗi');
  return Object.assign(new Error(error.message ?? 'Lỗi'), { code: error.code });
}

export function taoDichVuGuiKhachSupabase(sb: SupabaseClient): DichVuGuiKhach {
  return {
    async soan(canIds, tu, den) {
      const { data, error } = await sb.rpc('fn_soan_tin_gui_khach', { p_can_ids: canIds, p_tu: tu, p_den: den });
      if (error) throw loiRpc(error);
      const tin = docTin(data as Rpc | null);
      const tatCa = tin.can.flatMap((c) => c.anh);
      if (!tatCa.length) return tin;
      // Không xin được đường dẫn ảnh thì khối không có ảnh, vẫn gửi được chữ.
      let theo = new Map<string, string>();
      try {
        const { data: ky } = await sb.storage.from(KHO_ANH_CAN).createSignedUrls(tatCa, HAN_ANH_SALE_GIAY);
        theo = new Map((ky ?? []).filter((k) => k.path && k.signedUrl).map((k) => [k.path as string, k.signedUrl as string]));
      } catch { /* bỏ qua */ }
      return { ...tin, can: tin.can.map((c) => ({ ...c, anh: c.anh.map((a) => theo.get(a)).filter((u): u is string => !!u) })) };
    },
    async ghiLanGui(canIds, tu, den) {
      const { error } = await sb.rpc('fn_ghi_lan_gui', { p_can_ids: canIds, p_tu: tu, p_den: den });
      if (error) throw loiRpc(error);
    },
    async taiAnh(urls) {
      return Promise.all(urls.map(async (u, i) => {
        const r = await fetch(u);
        if (!r.ok) throw new Error('Chưa tải được ảnh');
        const b = await r.blob();
        const duoi = b.type === 'image/png' ? 'png' : b.type === 'image/webp' ? 'webp' : 'jpg';
        return new File([b], `anh-${i + 1}.${duoi}`, { type: b.type || 'image/jpeg' });
      }));
    },
  };
}
