// Nối Supabase (QD4). URL và khóa anon (công khai) lấy từ biến build VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY.
// Không có khóa service_role trong app. Thiếu biến thì app chạy như chưa đăng nhập (A1 vẫn xem được).
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { taoDichVuCanSupabase, type DichVuCan } from './dichVuCan';
import { taoDichVuSupabase, type DichVuXacThuc } from './xacThuc';

let client: SupabaseClient | null | undefined;
let daTao: DichVuXacThuc | null | undefined;
let daTaoCan: DichVuCan | null | undefined;

function layClient(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = import.meta.env.VITE_SUPABASE_URL;
  const khoa = import.meta.env.VITE_SUPABASE_ANON_KEY;
  client = url && khoa
    ? createClient(url, khoa, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } })
    : null;
  return client;
}

export function dichVuMacDinh(): DichVuXacThuc | null {
  if (daTao !== undefined) return daTao;
  const sb = layClient();
  daTao = sb ? taoDichVuSupabase(sb) : null;
  return daTao;
}

/** YC3.1: đọc căn của chủ nhà, cùng phiên với dịch vụ đăng nhập. */
export function dichVuCanMacDinh(): DichVuCan | null {
  if (daTaoCan !== undefined) return daTaoCan;
  const sb = layClient();
  daTaoCan = sb ? taoDichVuCanSupabase(sb) : null;
  return daTaoCan;
}
