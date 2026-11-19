// HV3 · Quay lại từ nền: nháp form trên máy (pwa.md P10) và đọc lại khi quay lại.
import { useEffect, useRef } from 'react';

/** HV3-H1 (giả định): nháp giữ 24 giờ rồi bỏ. Chờ Tùng chốt. */
export const THOI_GIAN_GIU_NHAP_MS = 24 * 60 * 60 * 1000;
const TIEN_TO = 'h247.nhap.';

type BanGhi = { luc: number; giaTri: unknown };

/** HV3 bước 1: lưu nháp mỗi lần sửa. Bọc try/catch, mất cũng được. */
export function luuNhap(khoa: string, giaTri: unknown, bay = Date.now()): void {
  try {
    const b: BanGhi = { luc: bay, giaTri };
    localStorage.setItem(TIEN_TO + khoa, JSON.stringify(b));
  } catch { /* không lưu được thì thôi */ }
}

/** HV3 bước 3: đọc nháp; quá hạn hay hỏng thì bỏ. */
export function docNhap<T>(khoa: string, bay = Date.now(), giuMs = THOI_GIAN_GIU_NHAP_MS): T | null {
  try {
    const tho = localStorage.getItem(TIEN_TO + khoa);
    if (!tho) return null;
    const b = JSON.parse(tho) as BanGhi;
    if (typeof b.luc !== 'number' || bay - b.luc > giuMs) {
      xoaNhap(khoa);
      return null;
    }
    return b.giaTri as T;
  } catch {
    return null;
  }
}

/** HV3 bước 5, HV3-NT4: xóa khi lưu xong hay hủy. */
export function xoaNhap(khoa: string): void {
  try { localStorage.removeItem(TIEN_TO + khoa); } catch { /* bỏ qua */ }
}

export const CAU_KHOI_PHUC = 'Đã khôi phục nội dung bạn đang nhập';

/** HV3 bước 2: chạy hàm khi app từ nền trở lại (visibilitychange sang visible). */
export function useQuayLaiTuNen(khiQuayLai: () => void): void {
  const ham = useRef(khiQuayLai);
  ham.current = khiQuayLai;
  useEffect(() => {
    const doi = () => { if (document.visibilityState === 'visible') ham.current(); };
    document.addEventListener('visibilitychange', doi);
    return () => document.removeEventListener('visibilitychange', doi);
  }, []);
}
