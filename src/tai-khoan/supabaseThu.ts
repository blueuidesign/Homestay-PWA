// Kết nối Supabase cho đăng nhập thử (EN3). YC1.2 bước 2, 4; PQ Luật chung 4
// Chỉ dùng khóa công khai (anon). Phiên giữ trên máy và tự làm mới (YC1.2 bước 4).
// Nạp động từ App.tsx, nên bản không bật đăng nhập thử không phải tải thư viện Supabase.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { docKetQuaDangNhap, type KetQuaDangNhap } from './phien';

export function taoKetNoi(url: string, khoaAnon: string): SupabaseClient {
  return createClient(url, khoaAnon, { auth: { persistSession: true, autoRefreshToken: true } });
}

/** Đăng nhập bằng email, mật khẩu (chỉ bản thử). YC1.2 bước 2, 3 */
export async function dangNhapBangMatKhau(kn: SupabaseClient, email: string, matKhau: string): Promise<KetQuaDangNhap> {
  const { error } = await kn.auth.signInWithPassword({ email, password: matKhau });
  return docKetQuaDangNhap(error);
}

/** Tạo hồ sơ ở lần đầu, có rồi thì thôi (fn_tao_ho_so). YC1.2 bước 2 */
export async function taoHoSoNeuChuaCo(kn: SupabaseClient): Promise<boolean> {
  const { error } = await kn.rpc('fn_tao_ho_so');
  return !error;
}
