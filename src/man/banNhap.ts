// YC1.2 bước 3: tên và số giữ trên máy tới khi xác nhận xong (sessionStorage, bọc try/catch, pwa.md P10).
const KHOA = 'h247.dangKy';
export type BanNhapDangKy = { ten: string; so: string; email: string };

export function ghiBanNhapDangKy(b: BanNhapDangKy): void {
  try { sessionStorage.setItem(KHOA, JSON.stringify(b)); } catch { /* mất cũng được */ }
}

export function docBanNhapDangKy(): BanNhapDangKy | null {
  try {
    const t = sessionStorage.getItem(KHOA);
    if (!t) return null;
    const b = JSON.parse(t) as Partial<BanNhapDangKy>;
    return { ten: String(b.ten ?? ''), so: String(b.so ?? ''), email: String(b.email ?? '') };
  } catch {
    return null;
  }
}

export function xoaBanNhapDangKy(): void {
  try { sessionStorage.removeItem(KHOA); } catch { /* bỏ qua */ }
}
