// Phiên đăng nhập tạm của bản thử (EN3). YC1.2 (bảng bước bản thử), QT5.5, PQ Luật chung 4
//
// Chỉ bật khi biến môi trường VITE_DANG_NHAP_THU = "1" và có địa chỉ, khóa công khai (anon) của
// Supabase. Production không đặt cờ này, và vite.config.ts chặn build production nếu cờ bị đặt.

export type KetQuaDangNhap = 'ok' | 'sai' | 'loi';

/** Lỗi Supabase Auth trả về (chỉ những trường cần đọc). */
export interface LoiDangNhap {
  code?: string;
  status?: number;
  message?: string;
}

/** Cấu hình đọc từ import.meta.env. */
export interface CauHinhPhien {
  VITE_DANG_NHAP_THU?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
}

/** Đăng nhập thử chỉ bật khi đủ cấu hình. YC1.2 */
export function dangNhapThuDuocBat(env: CauHinhPhien): boolean {
  return env.VITE_DANG_NHAP_THU === '1' && !!env.VITE_SUPABASE_URL && !!env.VITE_SUPABASE_ANON_KEY;
}

/** Đổi lỗi của Supabase Auth thành ba kết quả màn cần biết. YC1.2 bước 3, QT5.5 */
export function docKetQuaDangNhap(loi: LoiDangNhap | null): KetQuaDangNhap {
  if (!loi) return 'ok';
  if (loi.code === 'invalid_credentials') return 'sai';
  // Bản Supabase cũ không có code: sai email hay mật khẩu trả 400 kèm câu này.
  if (loi.status === 400 && loi.message === 'Invalid login credentials') return 'sai';
  return 'loi';
}
