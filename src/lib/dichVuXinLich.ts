// Link xin lịch của sale (YC6.4, PQ18.SALE, QD4). Lấy hay tạo link qua fn_lay_link_xin_lich, ghi một lần gửi qua
// fn_gui_link_xin_lich, đọc số đếm của chính mình qua xin_lich_cua_toi (đọc qua RLS). Không có danh sách tên chủ nhà.
// YC6.5, PQ18.CHU: chủ nhà xem trước link qua fn_xem_link_xin_lich, đồng ý qua fn_dong_y_xin_lich (cần đăng nhập).
import type { SupabaseClient } from '@supabase/supabase-js';
import { LoiNguoiDung } from '../chung/matKetNoi';

/** YC6.4 bước 4: số đếm của sale. ma null là chưa mở A6 lần nào. coNguon: đã có kết nối hay căn tự nhập. */
export type SoDemXinLich = {
  ma: string | null; soLanGui: number; guiCuoiLuc: string | null; soChuDongY: number; coNguon: boolean;
};

export interface DichVuXinLich {
  doc(): Promise<SoDemXinLich>;
  /** YC6.4 bước 1: mã link của sale, chưa có thì database tạo. */
  layLink(): Promise<string>;
  /** YC6.4 bước 2, 3: một lần mở bảng chia sẻ hay sao chép. */
  ghiLanGui(): Promise<{ soLanGui: number; guiCuoiLuc: string | null }>;
  /** YC6.5 bước 1, 4: chủ nhà xem trước link xin lịch (cần đăng nhập). */
  xemLoiXin?(ma: string): Promise<LoiXin>;
  /** YC6.5 bước 2: chủ nhà đồng ý. Link không dùng được thì LoiNguoiDung. */
  dongY?(ma: string, xemCoc: boolean): Promise<KetQuaDongY>;
}

/** YC6.5 bước 1, 4, PQ2.CHU: tên sale, số (null khi sale chưa cho); link hỏng không có tên, số nào (HV5). */
export type LoiXin =
  | { trangThai: 'hop_le'; tenSale: string; soDienThoai: string | null; daKetNoi: boolean }
  | { trangThai: 'khong_dung_duoc' };

/** YC6.5 bước 2, YC6-H17: 'da_co' khi đã kết nối từ trước. coCan: chủ nhà đã có căn (chưa có thì A4-01). */
export type KetQuaDongY = { ketQua: 'da_ket_noi' | 'da_co'; tenSale: string; coCan: boolean };

/** YC6.5 bước 2: toast sau khi đồng ý. */
export function cauDaChoXem(tenSale: string): string {
  return `Đã cho ${tenSale} xem lịch`;
}

type LoiXinRpc = { trang_thai?: string; ten_sale?: string | null; so_dien_thoai?: string | null; da_ket_noi?: boolean };

/** Đổi dữ liệu fn_xem_link_xin_lich sang dạng màn dùng. Không hợp lệ thì bỏ hết mọi trường khác. */
export function docLoiXin(d: LoiXinRpc | null | undefined): LoiXin {
  if (!d || d.trang_thai !== 'hop_le') return { trangThai: 'khong_dung_duoc' };
  return { trangThai: 'hop_le', tenSale: d.ten_sale || 'Sale', soDienThoai: d.so_dien_thoai || null, daKetNoi: !!d.da_ket_noi };
}

/** YC6.4 bước 1, pwa.md P4: link https trên tên miền đang chạy app, dạng /x/<mã>. */
export function duongDanLinkXinLich(goc: string, ma: string): string {
  return `${goc.replace(/\/+$/, '')}/x/${ma}`;
}

/** YC6.4 bước 1: tin soạn sẵn ở A6. */
export function tinXinLich(ten: string | null | undefined, link: string): string {
  const ai = ten?.trim() ? `em là ${ten.trim()}, ` : '';
  return `Chào anh/chị, ${ai}sale phòng ở Hạ Long. Anh/chị bấm link dưới đây để cho em xem lịch phòng trống. `
    + `Em gửi khách nhanh hơn, không phải gọi hỏi từng lần.\n${link}`;
}

export type ManXinLich = 'A5' | 'A7-00' | 'A7' | 'co-nguon';

/** YC6.4 bước 4: sale chưa có nguồn: chưa mở A6 lần nào thì A5, có link mà chưa gửi thì A7-00, đã gửi thì A7. */
export function chonManXinLich(d: SoDemXinLich): ManXinLich {
  if (d.coNguon) return 'co-nguon';
  if (d.ma === null) return 'A5';
  return d.soLanGui > 0 ? 'A7' : 'A7-00';
}

const VN = 'Asia/Ho_Chi_Minh';
const ngayVN = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: VN });
const gioVN = (d: Date) => d.toLocaleTimeString('en-GB', { timeZone: VN, hour: '2-digit', minute: '2-digit', hour12: false });

/** A7: "Lần gửi gần nhất lúc …": "vừa xong" (dưới 1 phút), "14:20 hôm nay", "14:20 hôm qua", "14:20 ngày 12/11". Giờ Việt Nam. */
export function lucGuiGanNhat(iso: string, bayGio: Date = new Date()): string {
  const luc = new Date(iso);
  if (bayGio.getTime() - luc.getTime() < 60_000) return 'vừa xong';
  const gio = gioVN(luc);
  const ngay = ngayVN(luc);
  if (ngay === ngayVN(bayGio)) return `${gio} hôm nay`;
  if (ngay === ngayVN(new Date(bayGio.getTime() - 86_400_000))) return `${gio} hôm qua`;
  const [, thang, ngayThang] = ngay.split('-');
  return `${gio} ngày ${ngayThang}/${thang}`;
}

type DocRpc = { ma: string | null; so_lan_gui: number; gui_cuoi_luc: string | null; so_chu_dong_y: number; co_nguon: boolean };

function loiTuRpc(e: { code?: string; message?: string }): Error {
  // 42501: câu vi phạm quyền; P0001: link xin lịch không dùng được (A8-01). Đều là câu cho người dùng.
  if ((e.code === '42501' || e.code === 'P0001') && e.message) return new LoiNguoiDung(e.message);
  return Object.assign(new Error(e.message ?? 'Lỗi'), { code: e.code });
}

const motDong = <T>(data: unknown): T | undefined => (Array.isArray(data) ? data[0] : data) as T | undefined;

export function taoDichVuXinLichSupabase(sb: SupabaseClient): DichVuXinLich {
  return {
    async doc() {
      const { data, error } = await sb.rpc('xin_lich_cua_toi');
      if (error) throw loiTuRpc(error);
      const d = motDong<DocRpc>(data);
      return {
        ma: d?.ma ?? null, soLanGui: Number(d?.so_lan_gui ?? 0), guiCuoiLuc: d?.gui_cuoi_luc ?? null,
        soChuDongY: Number(d?.so_chu_dong_y ?? 0), coNguon: !!d?.co_nguon,
      };
    },
    async layLink() {
      const { data, error } = await sb.rpc('fn_lay_link_xin_lich');
      if (error) throw loiTuRpc(error);
      if (typeof data !== 'string' || !data) throw new Error('Không có link');
      return data;
    },
    async ghiLanGui() {
      const { data, error } = await sb.rpc('fn_gui_link_xin_lich');
      if (error) throw loiTuRpc(error);
      const d = motDong<{ so_lan_gui: number; gui_cuoi_luc: string | null }>(data);
      return { soLanGui: Number(d?.so_lan_gui ?? 0), guiCuoiLuc: d?.gui_cuoi_luc ?? null };
    },
    async xemLoiXin(ma) {
      const { data, error } = await sb.rpc('fn_xem_link_xin_lich', { p_ma: ma });
      if (error) throw loiTuRpc(error);
      return docLoiXin(data as LoiXinRpc | null);
    },
    async dongY(ma, xemCoc) {
      const { data, error } = await sb.rpc('fn_dong_y_xin_lich', { p_ma: ma, p_xem_coc: xemCoc });
      if (error) throw loiTuRpc(error);
      const d = (data ?? {}) as { ket_qua?: string; ten_sale?: string | null; co_can?: boolean };
      return { ketQua: d.ket_qua === 'da_co' ? 'da_co' : 'da_ket_noi', tenSale: d.ten_sale || 'Sale', coCan: !!d.co_can };
    },
  };
}
