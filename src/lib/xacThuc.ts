// Dịch vụ đăng nhập bằng mã email (YC1.2, QD22, QD4). Màn chỉ dùng giao diện này, nên test unit thay được bằng bản giả.
import type { SupabaseClient } from '@supabase/supabase-js';
import { LoiNguoiDung } from '../chung/matKetNoi';
import type { HoSo } from './dieuHuong';
import { CAU_LOI_SO, CAU_LOI_TEN } from './kiemDangKy';

export const CAU_SO_TRUNG = 'Số này đã có tài khoản. Đăng nhập bằng email của tài khoản đó.';
export const CAU_GUI_QUA_NHANH = 'Vừa gửi mã xong. Chờ một phút rồi bấm lại.';
/** YC1.2: mã còn hạn 1 giờ (supabase/config.toml otp_expiry). */
export const HAN_MA_MS = 60 * 60 * 1000;
/** YC1.2, YC1-H12: nút gửi lại bấm được sau 60 giây. */
export const CHO_GUI_LAI_MS = 60 * 1000;

/** fn_dang_ky từ chối: ô nào sai, câu gì (YC1.2 bước 5, A2-01). */
export class LoiDangKy extends LoiNguoiDung {
  constructor(readonly o: 'ten' | 'so' | 'chung', cau: string) {
    super(cau);
  }
}

export interface DichVuXacThuc {
  /** Email của phiên đang có trên máy, null nếu chưa đăng nhập. */
  layPhien(): Promise<{ email: string } | null>;
  /** YC1.2: gửi mã 6 số. taoMoi false thì không tạo tài khoản (A11, YC1.2-NT12). */
  guiMa(email: string, taoMoi: boolean): Promise<'da-gui' | 'chua-co-tai-khoan'>;
  /** 'sai' gồm cả mã hết hạn, đã dùng: Supabase Auth không phân biệt (màn tự phân theo giờ gửi). */
  xacNhanMa(email: string, ma: string): Promise<'dung' | 'sai'>;
  layHoSo(): Promise<HoSo | null>;
  /** fn_dang_ky; lỗi thì ném LoiDangKy. */
  dangKy(ten: string, so: string): Promise<void>;
  dangXuat(): Promise<void>;
  /** Gọi lại khi phiên đổi (đăng nhập, đăng xuất, làm mới). Trả hàm hủy. */
  theoDoiPhien(goiLai: () => void): () => void;
}

type LoiAuth = { code?: string; status?: number; message?: string } | null;

function laGuiQuaNhanh(e: LoiAuth): boolean {
  return !!e && (e.status === 429 || e.code === 'over_email_send_rate_limit');
}

/** YC1.2 bước 5, A2-01: đổi lỗi của fn_dang_ky sang ô và câu cho người dùng. */
export function loiTuDangKy(e: { code?: string; message?: string }): LoiDangKy {
  if (e.code === '23505') return new LoiDangKy('so', CAU_SO_TRUNG);
  const cau = e.message ?? '';
  if (cau === CAU_LOI_TEN) return new LoiDangKy('ten', CAU_LOI_TEN);
  if (cau === CAU_LOI_SO) return new LoiDangKy('so', CAU_LOI_SO);
  if (e.code === 'P0001' && cau) return new LoiDangKy('chung', cau);
  return new LoiDangKy('chung', 'Có lỗi, chưa làm được. Bấm Thử lại');
}

export function taoDichVuSupabase(sb: SupabaseClient): DichVuXacThuc {
  return {
    async layPhien() {
      const { data } = await sb.auth.getSession();
      const u = data.session?.user;
      return u ? { email: u.email ?? '' } : null;
    },
    async guiMa(email, taoMoi) {
      const { error } = await sb.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: taoMoi } });
      if (!error) return 'da-gui';
      // Supabase Auth trả otp_disabled (422) khi email chưa có tài khoản mà không cho tạo mới.
      if (!taoMoi && (error.code === 'otp_disabled' || error.status === 422)) return 'chua-co-tai-khoan';
      if (laGuiQuaNhanh(error)) throw new LoiNguoiDung(CAU_GUI_QUA_NHANH);
      throw error;
    },
    async xacNhanMa(email, ma) {
      const { error } = await sb.auth.verifyOtp({ email: email.trim(), token: ma, type: 'email' });
      if (!error) return 'dung';
      if (error.code === 'otp_expired' || error.status === 403) return 'sai';
      throw error;
    },
    async layHoSo() {
      const { data: u } = await sb.auth.getUser();
      if (!u.user) return null;
      const { data, error } = await sb.from('profiles').select('ten, so_dien_thoai, vai_chon').eq('id', u.user.id).maybeSingle();
      if (error) throw error;
      if (!data) return { ten: null, soDienThoai: null, vaiChon: null };
      return { ten: data.ten, soDienThoai: data.so_dien_thoai, vaiChon: data.vai_chon };
    },
    async dangKy(ten, so) {
      const { error } = await sb.rpc('fn_dang_ky', { p_ten: ten, p_so: so });
      if (error) throw loiTuDangKy(error);
    },
    async dangXuat() {
      await sb.auth.signOut();
    },
    theoDoiPhien(goiLai) {
      const { data } = sb.auth.onAuthStateChange(() => goiLai());
      return () => data.subscription.unsubscribe();
    },
  };
}
