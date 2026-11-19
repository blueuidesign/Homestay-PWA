// Đọc danh sách căn của chủ nhà qua v_can_cua_toi (YC3.1 bước 9, QD4, PQ3.CHU). Ảnh qua đường dẫn có hạn (QT5.7).
// Thêm căn qua fn_tao_can (YC3.2 bước 18, QT5.6), kèm ảnh theo thứ tự (YC3.3 bước 23, 24).
// Ảnh tải lên kho anh-can vào thư mục của người tải, rồi ghi ảnh tạm qua fn_them_anh_tam (YC3.3 bước 23, QT5.7).
// Danh sách tòa đọc qua RLS (toa_nha_doc), thêm tòa qua fn_them_toa (YC3.4 bước 29, 33, QT6.3).
// Sửa căn: đọc căn và ảnh qua RLS (can_doc, anh_can_doc), ghi qua fn_sua_can (YC3.5 bước 35, 39, PQ3.CHU).
// Xóa căn (ẩn căn) qua fn_xoa_can (YC3.6 bước 42 đến 44, PQ3.CHU, QT5.5).
import type { SupabaseClient } from '@supabase/supabase-js';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { CAU_LOI_FILE, thuAnh } from './anh';
import { taoDichVuDatPhongSupabase, type DichVuDatPhong } from './dichVuDatPhong';
import { taoDichVuGiaSupabase, type DichVuGia } from './dichVuGia';
import { taoDichVuLichSupabase, type DichVuLich } from './dichVuLich';
import type { CanTomTat } from './can';
import { loiTuTaoCan } from './kiemCan';
import type { DanhSachToa } from './toaNha';

/** YC3.2 bước 18: dữ liệu lệnh tạo căn. clientId là mã lần gửi, giữ nguyên khi bấm lại (QT5.6). */
export type CanMoi = {
  maCan: string;
  soPhongNgu: number;
  clientId: string;
  soGiuong?: number | null;
  loaiView?: string | null;
  toaNhaId?: string | null;
  moTa?: string | null;
  /** YC3.3 bước 24: id ảnh đã tải, theo thứ tự chọn; ảnh đầu là ảnh đại diện. */
  anh?: string[];
};

/** YC3.5 bước 35: ảnh đã gắn căn, theo thứ tự; url là đường dẫn có hạn (QT5.7), null khi chưa xin được. */
export type AnhCoSan = { id: string; url: string | null };

/** YC3.5 bước 35: mọi ô của căn để điền sẵn form sửa. */
export type CanSua = {
  id: string; maCan: string; soPhongNgu: number | null; soGiuong: number | null; loaiView: string | null;
  toaNhaId: string | null; moTa: string | null; anh: AnhCoSan[];
};

/**
 * YC3.5 bước 39: chỉ các ô đã đổi. Ô có mà null là bỏ giá trị (xóa trống số giường là bỏ số giường).
 * anh là danh sách id ảnh mới đầy đủ theo thứ tự (ảnh đầu là ảnh đại diện).
 */
export type SuaCan = Partial<{
  maCan: string; soPhongNgu: number; soGiuong: number | null; loaiView: string | null;
  toaNhaId: string | null; moTa: string | null; anh: string[];
}>;

/** HV5, QT5.5: căn không còn của người gọi (đã xóa, mất quyền) nên database từ chối như không thấy. */
export class LoiKhongConCan extends Error {
  constructor() { super('Không tìm thấy căn'); this.name = 'LoiKhongConCan'; }
}

/** YC3.3 bước 23: tải một ảnh. onTienDo nhận 0 đến 100. Hủy bằng tinHieu (rời app, mất mạng: HV3 bước 7). */
export type TaiAnh = (f: File, onTienDo: (phanTram: number) => void, tinHieu: AbortSignal) => Promise<string>;

/** QD16: kho ảnh riêng tư anh-can. QT5.7: đường dẫn có hạn 1 giờ. */
export const KHO_ANH = 'anh-can';
export const HAN_ANH_GIAY = 60 * 60;

export interface DichVuCan {
  /** Căn có lịch, chưa ẩn của người gọi, căn mới thêm trước (YC3.1 bước 9). */
  layCanCuaToi(): Promise<CanTomTat[]>;
  /**
   * YC3.2 bước 18: tạo căn, trả mã căn. Database từ chối thì ném LoiNguoiDung kèm câu (QT5.5).
   * Không bắt buộc để chỗ chỉ đọc danh sách (test của US14) không phải giả lệnh này; thiếu thì form báo như mất mạng.
   */
  taoCan?(c: CanMoi): Promise<string>;
  /**
   * YC3.3 bước 23: thu ảnh, tải vào thư mục của người gọi, ghi ảnh tạm; trả id ảnh tạm.
   * File sai loại, quá cỡ thì ném LoiNguoiDung(CAU_LOI_FILE); database từ chối bằng câu thì LoiNguoiDung kèm câu đó.
   */
  taiAnh?: TaiAnh;
  /** YC3.5 bước 35: căn có lịch, chưa ẩn của người gọi kèm ảnh theo thứ tự; null khi không còn (HV5). */
  layCan?(id: string): Promise<CanSua | null>;
  /** YC3.5 bước 39: sửa căn. P0001 thì LoiNguoiDung kèm câu (QT5.5); căn không còn thì LoiKhongConCan (HV5). */
  suaCan?(id: string, sua: SuaCan): Promise<void>;
  /**
   * YC3.6 bước 42: xóa (ẩn) căn. P0001 ("Căn còn đặt phòng sắp tới") thì LoiNguoiDung kèm câu (bước 43, QT5.5);
   * căn không có, đã xóa, của người khác (42501) thì LoiKhongConCan.
   */
  xoaCan?(id: string): Promise<void>;
  /** YC3.4 bước 29: danh sách tòa chung và tòa người gọi đã dùng cho căn chưa ẩn của mình (mới dùng trước). */
  layToa?(): Promise<DanhSachToa>;
  /** YC3.4 bước 33: thêm tòa, trả mã tòa; tên trùng thì mã tòa đã có (GD21). Database từ chối thì LoiNguoiDung. */
  themToa?(ten: string): Promise<string>;
  /** YC4.2: giá theo tháng của một căn (src/lib/dichVuGia.ts). Thiếu thì tab Giá báo như mất mạng. */
  gia?: DichVuGia;
  /** YC2.1: lịch tháng các căn (src/lib/dichVuLich.ts). Thiếu thì tab Lịch báo như mất mạng. */
  lich?: DichVuLich;
  /** YC5.1: đặt phòng các căn cho form CN4 (src/lib/dichVuDatPhong.ts). Thiếu thì dòng kiểm báo chưa tải được. */
  datPhong?: DichVuDatPhong;
}

function maNgauNhien(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  } catch { /* máy cũ */ }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
}

class LoiTaiAnh extends Error {
  constructor(public trangThai: number) { super('Tải ảnh lỗi ' + trangThai); }
}

/** Tải file thẳng lên API kho bằng XHR để có tiến độ (thư viện supabase-js không báo tiến độ). */
function guiFile(url: string, khoaAnon: string, token: string, duongDan: string, d: { blob: Blob; loai: string },
                 onTienDo: (p: number) => void, tinHieu: AbortSignal): Promise<void> {
  return new Promise((xong, hong) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${url}/storage/v1/object/${KHO_ANH}/${duongDan}`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('apikey', khoaAnon);
    xhr.setRequestHeader('x-upsert', 'false');
    xhr.setRequestHeader('Content-Type', d.loai);
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) onTienDo(Math.min(99, Math.round((e.loaded / e.total) * 100))); };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) { xong(); return; }
      // Kho trả 400 kèm statusCode thật trong thân (413 quá cỡ, 415 sai loại) ở một số bản.
      let ma = xhr.status;
      try { const m = Number((JSON.parse(xhr.responseText) as { statusCode?: unknown }).statusCode); if (m) ma = m; } catch { /* thân không phải JSON */ }
      hong(new LoiTaiAnh(ma));
    };
    xhr.onerror = () => hong(new TypeError('mất mạng'));
    xhr.onabort = () => hong(new DOMException('đã hủy', 'AbortError'));
    if (tinHieu.aborted) { hong(new DOMException('đã hủy', 'AbortError')); return; }
    tinHieu.addEventListener('abort', () => xhr.abort(), { once: true });
    xhr.send(d.blob);
  });
}

type DongView = {
  id: string; ma_can: string; so_phong_ngu: number | null; so_giuong: number | null; loai_view: string | null;
  ten_toa: string | null; so_anh: number; anh_dai_dien: string | null; moi_them: boolean; khach_den: string | null;
};

export function taoDichVuCanSupabase(sb: SupabaseClient): DichVuCan {
  return {
    gia: taoDichVuGiaSupabase(sb), // YC4.2
    lich: taoDichVuLichSupabase(sb), // YC2.1
    datPhong: taoDichVuDatPhongSupabase(sb), // YC5.1

    async layCanCuaToi() {
      const { data, error } = await sb.from('v_can_cua_toi')
        .select('id, ma_can, so_phong_ngu, so_giuong, loai_view, ten_toa, so_anh, anh_dai_dien, moi_them, khach_den')
        .order('tao_luc', { ascending: false });
      if (error) throw error;
      const dong = (data ?? []) as DongView[];
      const duongDan = dong.map((d) => d.anh_dai_dien).filter((d): d is string => !!d);
      const url = new Map<string, string>();
      if (duongDan.length) {
        // Không xin được đường dẫn ảnh thì thẻ vẫn hiện, chỗ ảnh để trống (ảnh không phải dữ liệu chính của thẻ).
        try {
          const { data: ky } = await sb.storage.from(KHO_ANH).createSignedUrls(duongDan, HAN_ANH_GIAY);
          for (const k of ky ?? []) if (k.path && k.signedUrl) url.set(k.path, k.signedUrl);
        } catch { /* bỏ qua */ }
      }
      return dong.map((d) => ({
        id: d.id, maCan: d.ma_can, soPhongNgu: d.so_phong_ngu, soGiuong: d.so_giuong, loaiView: d.loai_view,
        tenToa: d.ten_toa, soAnh: d.so_anh, anhDaiDien: d.anh_dai_dien ? url.get(d.anh_dai_dien) ?? null : null,
        moiThem: d.moi_them, khachDen: d.khach_den,
      }));
    },

    async taoCan(c) {
      const { data, error } = await sb.rpc('fn_tao_can', {
        p_ma_can: c.maCan, p_so_phong_ngu: c.soPhongNgu, p_client_id: c.clientId,
        p_so_giuong: c.soGiuong ?? null, p_loai_view: c.loaiView ?? null,
        p_toa_nha_id: c.toaNhaId ?? null, p_mo_ta: c.moTa ?? null, p_anh: c.anh?.length ? c.anh : null,
      });
      if (error) throw loiTuTaoCan(error);
      return data as string;
    },

    async layCan(id) {
      const { data: phien } = await sb.auth.getSession();
      const nguoi = phien.session?.user.id;
      if (!nguoi) throw new TypeError('chưa đăng nhập');
      // PQ3.CHU: chỉ căn mình giữ, có lịch, chưa ẩn (sale được chia sẻ cũng đọc được dòng căn, nhưng không sửa).
      const [can, anh] = await Promise.all([
        sb.from('can').select('id, ma_can, so_phong_ngu, so_giuong, loai_view, toa_nha_id, mo_ta')
          .eq('id', id).eq('nguoi_giu', nguoi).eq('loai', 'co_lich').is('an_luc', null).maybeSingle(),
        sb.from('anh_can').select('id, duong_dan, thu_tu').eq('can_id', id).order('thu_tu', { ascending: true }),
      ]);
      if (can.error) throw can.error;
      if (anh.error) throw anh.error;
      const c = can.data as { id: string; ma_can: string; so_phong_ngu: number | null; so_giuong: number | null;
                              loai_view: string | null; toa_nha_id: string | null; mo_ta: string | null } | null;
      if (!c) return null;
      const dsAnh = (anh.data ?? []) as { id: string; duong_dan: string }[];
      const url = new Map<string, string>();
      if (dsAnh.length) {
        // Không xin được đường dẫn thì ô ảnh để trống, vẫn sửa được căn.
        try {
          const { data: ky } = await sb.storage.from(KHO_ANH).createSignedUrls(dsAnh.map((a) => a.duong_dan), HAN_ANH_GIAY);
          for (const k of ky ?? []) if (k.path && k.signedUrl) url.set(k.path, k.signedUrl);
        } catch { /* bỏ qua */ }
      }
      return {
        id: c.id, maCan: c.ma_can, soPhongNgu: c.so_phong_ngu, soGiuong: c.so_giuong, loaiView: c.loai_view,
        toaNhaId: c.toa_nha_id, moTa: c.mo_ta, anh: dsAnh.map((a) => ({ id: a.id, url: url.get(a.duong_dan) ?? null })),
      };
    },

    async suaCan(id, sua) {
      const p: Record<string, unknown> = {};
      if ('maCan' in sua) p.ma_can = sua.maCan;
      if ('soPhongNgu' in sua) p.so_phong_ngu = sua.soPhongNgu;
      if ('soGiuong' in sua) p.so_giuong = sua.soGiuong;
      if ('loaiView' in sua) p.loai_view = sua.loaiView;
      if ('toaNhaId' in sua) p.toa_nha_id = sua.toaNhaId;
      if ('moTa' in sua) p.mo_ta = sua.moTa;
      if ('anh' in sua) p.anh = sua.anh;
      const { error } = await sb.rpc('fn_sua_can', { p_can_id: id, p_sua: p });
      if (error) {
        if (error.code === '42501') throw new LoiKhongConCan();
        throw loiTuTaoCan(error);
      }
    },

    async xoaCan(id) {
      const { error } = await sb.rpc('fn_xoa_can', { p_can_id: id });
      if (error) {
        if (error.code === '42501') throw new LoiKhongConCan();
        throw loiTuTaoCan(error);
      }
    },

    async layToa() {
      const [toa, can] = await Promise.all([
        sb.from('toa_nha').select('id, ten, khu_vuc, home247_dat_san').order('ten'),
        // Căn của mình qua v_can_cua_toi (chỉ căn chưa ẩn, có lịch); view không có mã tòa nên khớp theo tên (tên không trùng).
        sb.from('v_can_cua_toi').select('ten_toa, tao_luc').not('ten_toa', 'is', null).order('tao_luc', { ascending: false }),
      ]);
      if (toa.error) throw toa.error;
      if (can.error) throw can.error;
      const ds = ((toa.data ?? []) as { id: string; ten: string; khu_vuc: string | null; home247_dat_san: boolean }[])
        .map((t) => ({ id: t.id, ten: t.ten, khuVuc: t.khu_vuc, home247: t.home247_dat_san }));
      const theoTen = new Map(ds.map((t) => [t.ten.trim().toLowerCase(), t.id]));
      const daDung: string[] = [];
      for (const c of (can.data ?? []) as { ten_toa: string | null }[]) {
        const id = c.ten_toa ? theoTen.get(c.ten_toa.trim().toLowerCase()) : undefined;
        if (id && !daDung.includes(id)) daDung.push(id);
      }
      return { ds, daDung };
    },

    async themToa(ten) {
      const { data, error } = await sb.rpc('fn_them_toa', { p_ten: ten });
      if (error) throw loiTuTaoCan(error);
      return data as string;
    },

    async taiAnh(f, onTienDo, tinHieu) {
      const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
      const khoa = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
      const { data: phien } = await sb.auth.getSession();
      const nguoi = phien.session?.user.id;
      if (!url || !khoa || !phien.session || !nguoi) throw new TypeError('chưa nối database');
      const d = await thuAnh(f);
      // QT5.7, YC3.3-NT5: thư mục đầu là uid người tải (policy anh_can_tai_len).
      const duongDan = `${nguoi}/${maNgauNhien()}.${d.duoi}`;
      try {
        await guiFile(url, khoa, phien.session.access_token, duongDan, d, onTienDo, tinHieu);
      } catch (e) {
        // YC3.3-NT6: kho từ chối vì cỡ hay loại file.
        if (e instanceof LoiTaiAnh && (e.trangThai === 413 || e.trangThai === 415)) throw new LoiNguoiDung(CAU_LOI_FILE);
        throw e;
      }
      const { data, error } = await sb.rpc('fn_them_anh_tam', { p_duong_dan: duongDan });
      if (error) throw loiTuTaoCan(error);
      onTienDo(100);
      return data as string;
    },
  };
}
