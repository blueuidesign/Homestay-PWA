// Kết nối Supabase của app. Chỉ dùng khóa công khai; mọi bảo vệ nằm ở RLS và hàm fn_* (docs/Thiet_ke_DB.md).
// Chưa đặt biến môi trường thì coSupabase() là false và app chạy bằng dữ liệu mẫu trong máy.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = (import.meta.env?.VITE_SUPABASE_URL as string | undefined)?.trim();
const khoa = (import.meta.env?.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();
const hopLe = !!url && !!khoa && /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url);

let ketNoi: SupabaseClient | null = null;

/** App có được cấu hình để nói chuyện với Supabase không. */
export const coSupabase = (): boolean => hopLe;

/** Kết nối dùng chung cho cả app. Gọi khi coSupabase() là true. */
export const supabase = (): SupabaseClient => {
  if (!hopLe) throw new Error("Chưa đặt VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY");
  return (ketNoi ??= createClient(url!, khoa!, { auth: { persistSession: true, autoRefreshToken: true } }));
};

/** Câu báo lỗi cho người dùng. Hàm fn_* từ chối bằng mã P0001 kèm một câu tiếng Việt: hiện nguyên câu đó (docs/luat-chung/Nghiep_vu.md 1.6). */
export const cauLoi = (loi: { code?: string; message?: string } | null | undefined): string =>
  loi?.code === "P0001" && loi.message ? loi.message : "Có lỗi xảy ra. Bạn thử lại sau ít phút.";

/** Gọi một hàm fn_* của database. Lỗi thì ném Error với câu cho người dùng. */
export async function goiHam<T>(ten: string, thamSo?: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase().rpc(ten, thamSo);
  if (error) throw Object.assign(new Error(cauLoi(error)), { ma: error.code });
  return data as T;
}
