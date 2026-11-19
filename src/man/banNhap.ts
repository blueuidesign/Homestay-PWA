// YC1.2 bước 3: tên và số giữ trên máy tới khi xác nhận xong (sessionStorage, bọc try/catch, pwa.md P10).
import { docNhap, luuNhap, xoaNhap } from '../chung/nhap';
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

// HV3 bước 1, 3, 5, HV3-H1: nháp form Thêm căn (CN5-A1) trên localStorage, giữ 7 ngày kể từ lần sửa cuối.
// Giữ cả mã lần gửi để bấm lại sau khi mở lại trang vẫn là cùng một lần gửi (QT5.6).

const KHOA_THEM_CAN = 'themCan';
export const GIU_NHAP_THEM_CAN_MS = 7 * 24 * 60 * 60 * 1000;
export type BanNhapThemCan = { maCan: string; soPhongNgu: number | null; clientId: string };

export function ghiBanNhapThemCan(b: BanNhapThemCan, bay = Date.now()): void {
  luuNhap(KHOA_THEM_CAN, b, bay);
}

export function docBanNhapThemCan(bay = Date.now()): BanNhapThemCan | null {
  const b = docNhap<Partial<BanNhapThemCan>>(KHOA_THEM_CAN, bay, GIU_NHAP_THEM_CAN_MS);
  if (!b || typeof b !== 'object') return null;
  const so = typeof b.soPhongNgu === 'number' && b.soPhongNgu >= 0 && b.soPhongNgu <= 4 ? b.soPhongNgu : null;
  return { maCan: String(b.maCan ?? ''), soPhongNgu: so, clientId: typeof b.clientId === 'string' ? b.clientId : '' };
}

export function xoaBanNhapThemCan(): void {
  xoaNhap(KHOA_THEM_CAN);
}
