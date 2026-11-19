// Tìm phòng của sale (YC7.2, YC7 "Dữ liệu", QD4, KT-DB.3.5): tìm qua fn_sale_tim (database ghi lần tìm), đọc lần tìm gần đây
// và danh sách tòa qua RLS. App không ghi thẳng bảng nào.
import type { SupabaseClient } from '@supabase/supabase-js';
import { LOAI_VIEW } from './kiemCan';
import type { CanTim, DieuKienTim, GoiY, KetQuaTim, LoaiGoiY, MaView } from './timPhong';

export type ToaTim = { id: string; ten: string; home247: boolean };

export interface DichVuTimPhong {
  /** YC7.2 bước 5: tìm căn trống; database ghi lần tìm. Không có căn trống thì có gợi ý (bước 6). */
  tim(dk: DieuKienTim): Promise<KetQuaTim>;
  /** YC7.2 bước 1, NT5: 5 lần tìm gần nhất của người gọi, mới trước. */
  docGanDay(): Promise<DieuKienTim[]>;
  /** YC7.2 bước 3: danh sách tòa. */
  docToa(): Promise<ToaTim[]>;
}

type BoLoc = { so_phong_ngu?: unknown; toa_nha?: unknown; view?: unknown };

function mangSo(x: unknown): number[] {
  return Array.isArray(x) ? x.map(Number).filter((n) => Number.isInteger(n) && n >= 1 && n <= 4) : [];
}
function mangChu(x: unknown): string[] {
  return Array.isArray(x) ? x.filter((s): s is string => typeof s === 'string') : [];
}
function mangView(x: unknown): MaView[] {
  return mangChu(x).filter((s): s is MaView => (LOAI_VIEW as readonly string[]).includes(s));
}
function soHoacNull(x: unknown): number | null {
  return x == null ? null : Number(x);
}

/** Một dòng tim_gan_day sang điều kiện tìm. */
export function docGanDay(d: { tu_ngay: string; den_ngay: string; bo_loc: BoLoc | null }): DieuKienTim {
  const b = d.bo_loc ?? {};
  return { nhan: d.tu_ngay, tra: d.den_ngay, soPhongNgu: mangSo(b.so_phong_ngu), toaNha: mangChu(b.toa_nha), view: mangView(b.view) };
}

const NHOM = new Set(['cua_toi', 'nguon', 'tu_nhap']);
const LOAI = new Set<LoaiGoiY>(['doi_ngay', 'bo_loc_toa', 'bo_loc_view', 'bo_loc_phong_ngu', 'them_phong_ngu']);

type CanRpc = Record<string, unknown>;
type GoiYRpc = Record<string, unknown>;

/** Kết quả jsonb của fn_sale_tim sang dạng màn dùng; dòng lạ bỏ đi. */
export function docKetQuaTim(kq: { so_can_trong?: unknown; can?: unknown; goi_y?: unknown } | null | undefined): KetQuaTim {
  const can: CanTim[] = (Array.isArray(kq?.can) ? (kq!.can as CanRpc[]) : [])
    .filter((c) => NHOM.has(String(c.nhom)))
    .map((c) => ({
      canId: String(c.can_id), nhom: c.nhom as CanTim['nhom'], maCan: String(c.ma_can),
      tenToa: (c.ten_toa as string | null) ?? null, tenChu: (c.ten_chu as string | null) ?? null,
      soPhongNgu: soHoacNull(c.so_phong_ngu), loaiView: (c.loai_view as string | null) ?? null,
      lichDoiLuc: (c.lich_doi_luc as string | null) ?? null,
      tongGiaChu: soHoacNull(c.tong_gia_chu), tongGiaBan: soHoacNull(c.tong_gia_ban), khongCoLich: c.khong_co_lich === true,
    }));
  const goiY: GoiY[] = (Array.isArray(kq?.goi_y) ? (kq!.goi_y as GoiYRpc[]) : [])
    .filter((g) => LOAI.has(g.loai as LoaiGoiY) && Number(g.so_can) > 0)
    .map((g) => ({
      loai: g.loai as LoaiGoiY, soCan: Number(g.so_can), tenToa: mangChu(g.ten_toa),
      dieuKien: { nhan: String(g.tu), tra: String(g.den), soPhongNgu: mangSo(g.so_phong_ngu), toaNha: mangChu(g.toa_nha), view: mangView(g.view) },
    }));
  return { soCanTrong: Number(kq?.so_can_trong ?? 0), can, goiY };
}

const rongThanhNull = <T,>(x: readonly T[]): T[] | null => (x.length ? [...x] : null);

export function taoDichVuTimPhongSupabase(sb: SupabaseClient): DichVuTimPhong {
  return {
    async tim(dk) {
      const { data, error } = await sb.rpc('fn_sale_tim', {
        p_tu: dk.nhan, p_den: dk.tra, p_so_phong_ngu: rongThanhNull(dk.soPhongNgu), p_toa_nha: rongThanhNull(dk.toaNha),
        p_view: rongThanhNull(dk.view),
      });
      if (error) throw Object.assign(new Error(error.message ?? 'Lỗi'), { code: error.code });
      return docKetQuaTim(data as Parameters<typeof docKetQuaTim>[0]);
    },
    async docGanDay() {
      const { data, error } = await sb.from('tim_gan_day').select('tu_ngay, den_ngay, bo_loc')
        .order('tim_luc', { ascending: false }).limit(5);
      if (error) throw error;
      return ((data ?? []) as Parameters<typeof docGanDay>[0][]).map(docGanDay);
    },
    async docToa() {
      const { data, error } = await sb.from('toa_nha').select('id, ten, home247_dat_san').order('ten');
      if (error) throw error;
      return ((data ?? []) as { id: string; ten: string; home247_dat_san: boolean }[])
        .map((t) => ({ id: t.id, ten: t.ten, home247: t.home247_dat_san }));
    },
  };
}
