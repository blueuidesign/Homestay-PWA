// Dịch vụ trang quản trị (YC13, PQ21, QD4). Màn chỉ dùng giao diện này, nên test unit thay được bằng bản giả.
// Mọi lệnh gọi hàm fn_quan_tri_* tự kiểm quyền ở database; app không đọc, ghi thẳng bảng admins.
import type { SupabaseClient } from '@supabase/supabase-js';
import { LoiNguoiDung } from '../chung/matKetNoi';

/** YC13.1 bước 6, YC13-H6: người có phiên mà không còn trong danh sách quản trị viên. */
export class LoiKhongQuyenQuanTri extends LoiNguoiDung {
  constructor() { super('Email này không có quyền quản trị'); }
}

export type QuanTriVien = { email: string; laGoc: boolean; themLuc: string };
/** YC13.2: một dải ngày lễ chung. Ngày dạng YYYY-MM-DD (giờ Việt Nam). */
/** YC13.3: một tòa; home247 true là Home247 đặt sẵn, false là người dùng thêm. */
export type ToaQuanTri = { id: string; ten: string; khuVuc: string | null; home247: boolean };
export type DaiNgayLe = { id: string; nam: number; ten: string; tuNgay: string; denNgay: string };

export interface DichVuQuanTri {
  layPhien(): Promise<{ email: string } | null>;
  /** YC13.1 bước 1 (bản 2): gửi mã như đăng nhập app; quyền kiểm sau khi vào (vao). */
  guiMa(email: string): Promise<void>;
  xacNhanMa(email: string, ma: string): Promise<'dung' | 'sai'>;
  dangXuat(): Promise<void>;
  /** YC13.1 bước 2: vào trang; không có quyền thì ném LoiKhongQuyenQuanTri. */
  vao(): Promise<{ email: string; laGoc: boolean }>;
  danhSach(): Promise<QuanTriVien[]>;
  them(email: string): Promise<void>;
  go(email: string): Promise<void>;
  /** YC13.2 bước 1: dải của năm, xếp theo ngày đầu (đọc qua ngay_le_doc, PQ21). */
  ngayLe(nam: number): Promise<DaiNgayLe[]>;
  /** YC13.2 bước 2: id null là thêm. Sai luật kiểm thì ném LoiNguoiDung với câu của database. */
  luuNgayLe(d: { id: string | null; nam: number; ten: string; tuNgay: string; denNgay: string }): Promise<void>;
  xoaNgayLe(id: string): Promise<void>;
  /** YC13.3 bước 1: mọi tòa (đọc qua toa_nha_doc). */
  toa(): Promise<ToaQuanTri[]>;
  /** YC13.3 bước 2, 3: id null là thêm (Home247 đặt sẵn). */
  luuToa(d: { id: string | null; ten: string; khuVuc: string }): Promise<void>;
  /** YC13.3 bước 4: chuyển căn của `gop` sang `giu`, xóa `gop`. */
  gopToa(giu: string, gop: string): Promise<void>;
}

type LoiPg = { code?: string; message?: string } | null;

/** 42501 là thiếu quyền quản trị; P0001 là câu báo cho người dùng (QT5.5). */
export function doiLoi(e: LoiPg): Error {
  if (e?.code === '42501') return new LoiKhongQuyenQuanTri();
  if (e?.code === 'P0001' && e.message) return new LoiNguoiDung(e.message);
  return new Error(e?.message ?? 'quan-tri');
}

export function taoDichVuQuanTriSupabase(sb: SupabaseClient): DichVuQuanTri {
  const goi = async <T>(ten: string, tham?: Record<string, unknown>): Promise<T> => {
    const { data, error } = await sb.rpc(ten, tham);
    if (error) throw doiLoi(error);
    return data as T;
  };
  return {
    async layPhien() {
      const { data } = await sb.auth.getSession();
      const u = data.session?.user;
      return u ? { email: u.email ?? '' } : null;
    },
    async guiMa(email) {
      // Quản trị viên có thể chưa từng dùng app: cho Supabase Auth tạo tài khoản đăng nhập (không tạo hồ sơ app).
      const { error } = await sb.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } });
      if (error) throw error.status === 429 ? new LoiNguoiDung('Vừa gửi mã xong. Chờ một phút rồi bấm lại.') : error;
    },
    async xacNhanMa(email, ma) {
      const { error } = await sb.auth.verifyOtp({ email: email.trim(), token: ma, type: 'email' });
      if (!error) return 'dung';
      if (error.code === 'otp_expired' || error.status === 403) return 'sai';
      throw error;
    },
    async dangXuat() { await sb.auth.signOut(); },
    async vao() {
      const d = await goi<{ email: string; la_goc: boolean }>('fn_quan_tri_vao');
      return { email: d.email, laGoc: d.la_goc };
    },
    async danhSach() {
      const d = await goi<{ email: string; la_goc: boolean; them_luc: string }[]>('fn_quan_tri_danh_sach');
      return (d ?? []).map((r) => ({ email: r.email, laGoc: r.la_goc, themLuc: r.them_luc }));
    },
    async them(email) { await goi('fn_quan_tri_them', { p_email: email }); },
    async go(email) { await goi('fn_quan_tri_go', { p_email: email }); },
    async ngayLe(nam) {
      const { data, error } = await sb.from('ngay_le').select('id, nam, ten, tu_ngay, den_ngay').eq('nam', nam).order('tu_ngay');
      if (error) throw doiLoi(error);
      return ((data ?? []) as { id: string; nam: number; ten: string; tu_ngay: string; den_ngay: string }[])
        .map((r) => ({ id: r.id, nam: r.nam, ten: r.ten, tuNgay: r.tu_ngay, denNgay: r.den_ngay }));
    },
    async luuNgayLe(d) {
      await goi('fn_quan_tri_luu_ngay_le', { p_id: d.id, p_nam: d.nam, p_ten: d.ten, p_tu_ngay: d.tuNgay, p_den_ngay: d.denNgay });
    },
    async xoaNgayLe(id) { await goi('fn_quan_tri_xoa_ngay_le', { p_id: id }); },
    async toa() {
      const { data, error } = await sb.from('toa_nha').select('id, ten, khu_vuc, home247_dat_san').order('ten');
      if (error) throw doiLoi(error);
      return ((data ?? []) as { id: string; ten: string; khu_vuc: string | null; home247_dat_san: boolean }[])
        .map((t) => ({ id: t.id, ten: t.ten, khuVuc: t.khu_vuc, home247: t.home247_dat_san }));
    },
    async luuToa(d) { await goi('fn_quan_tri_luu_toa', { p_id: d.id, p_ten: d.ten, p_khu_vuc: d.khuVuc }); },
    async gopToa(giu, gop) { await goi('fn_quan_tri_gop_toa', { p_giu: giu, p_gop: gop }); },
  };
}
