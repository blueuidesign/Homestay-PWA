// Dịch vụ trang quản trị (YC13, PQ21, QD4). Màn chỉ dùng giao diện này, nên test unit thay được bằng bản giả.
// Mọi lệnh gọi hàm fn_quan_tri_* tự kiểm quyền ở database; app không đọc, ghi thẳng bảng admins.
import type { SupabaseClient } from '@supabase/supabase-js';
import { LoiNguoiDung } from '../chung/matKetNoi';

/** YC13.1 bước 6, YC13-H6: người có phiên mà không còn trong danh sách quản trị viên. */
export class LoiKhongQuyenQuanTri extends LoiNguoiDung {
  constructor() { super('Email này không có quyền quản trị'); }
}

export type QuanTriVien = { email: string; laGoc: boolean; themLuc: string };

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
  };
}
