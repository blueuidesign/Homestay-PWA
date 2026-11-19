// Nối Supabase (QD4). URL và khóa anon (công khai) lấy từ biến build VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY.
// Không có khóa service_role trong app. Thiếu biến thì app chạy như chưa đăng nhập (A1 vẫn xem được).
import { createClient } from '@supabase/supabase-js';
import { taoDichVuSupabase, type DichVuXacThuc } from './xacThuc';

let daTao: DichVuXacThuc | null | undefined;

export function dichVuMacDinh(): DichVuXacThuc | null {
  if (daTao !== undefined) return daTao;
  const url = import.meta.env.VITE_SUPABASE_URL;
  const khoa = import.meta.env.VITE_SUPABASE_ANON_KEY;
  daTao = url && khoa
    ? taoDichVuSupabase(createClient(url, khoa, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } }))
    : null;
  return daTao;
}
