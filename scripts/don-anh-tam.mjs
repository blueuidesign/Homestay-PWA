#!/usr/bin/env node
// EN10 · Xóa file ảnh tạm quá 24 giờ và ảnh bị bỏ khỏi căn khỏi kho anh-can (YC3 "Dữ liệu", QT5.7).
// Chạy ở server (GitHub Actions don-anh-tam.yml), không bao giờ trong app. Cần biến SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// (secret của GitHub). Thiếu biến thì in nhắc và thoát 0, để lịch chạy không đỏ khi chưa cấu hình.
// Các bước: fn_don_anh_tam (xóa dòng ảnh tạm quá 24 giờ, file vào hàng đợi), fn_file_cho_xoa (danh sách), xóa file qua
// dịch vụ kho, fn_da_xoa_file (bỏ khỏi hàng đợi những file đã xóa).

/** Số file xóa mỗi lượt; dịch vụ kho nhận tối đa 1.000 đường dẫn một lần gọi. */
export const MOI_LUOT = 500;

/**
 * Một lượt dọn. sb là client Supabase dùng khóa service_role. Trả số file đã xóa.
 * File dịch vụ kho không xóa được thì giữ trong hàng đợi để lượt sau thử lại.
 * @param {{ rpc: Function, storage: { from: (b: string) => { remove: (p: string[]) => Promise<{ data: { name: string }[] | null, error: unknown }> } } }} sb
 */
export async function donAnhTam(sb, soMoiLuot = MOI_LUOT) {
  const don = await sb.rpc('fn_don_anh_tam');
  if (don.error) throw new Error(`fn_don_anh_tam: ${don.error.message ?? don.error}`);
  const ds = await sb.rpc('fn_file_cho_xoa', { p_so: soMoiLuot });
  if (ds.error) throw new Error(`fn_file_cho_xoa: ${ds.error.message ?? ds.error}`);
  const duongDan = (ds.data ?? []).map((x) => (typeof x === 'string' ? x : Object.values(x)[0]));
  if (duongDan.length === 0) return 0;
  const xoa = await sb.storage.from('anh-can').remove(duongDan);
  if (xoa.error) throw new Error(`xóa file: ${xoa.error.message ?? xoa.error}`);
  const daXoa = (xoa.data ?? []).map((o) => o.name);
  const xong = await sb.rpc('fn_da_xoa_file', { p_duong_dan: daXoa });
  if (xong.error) throw new Error(`fn_da_xoa_file: ${xong.error.message ?? xong.error}`);
  return daXoa.length;
}

async function chinh() {
  const url = process.env.SUPABASE_URL;
  const khoa = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !khoa) {
    console.log('Chưa có SUPABASE_URL hay SUPABASE_SERVICE_ROLE_KEY: bỏ qua dọn ảnh (EN10, work/cho-tung.md).');
    return;
  }
  const { createClient } = await import('@supabase/supabase-js');
  const sb = createClient(url, khoa, { auth: { persistSession: false, autoRefreshToken: false } });
  let tong = 0;
  for (let i = 0; i < 20; i++) {
    const n = await donAnhTam(sb);
    tong += n;
    if (n < MOI_LUOT) break;
  }
  console.log(`Đã xóa ${tong} file khỏi kho anh-can.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  chinh().catch((e) => { console.error(String(e?.message ?? e)); process.exit(1); });
}
