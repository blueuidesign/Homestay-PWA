// Ảnh căn phía app (YC3.3 bước 23, 26, Luật kiểm "File ảnh", QT5.7, pwa.md P6). Kho mới là chỗ chặn thật
// (bucket anh-can: loại file, 15 MB); app kiểm trước để báo ngay trên ô ảnh và không tải file sai.
import { LoiNguoiDung } from '../chung/matKetNoi';

/** YC3.3 Luật kiểm "Ảnh": mỗi căn tối đa 12 ảnh. */
export const TOI_DA_ANH = 12;
/** YC3.3 Luật kiểm "File ảnh": tới 15 MB (cùng số với file_size_limit của kho). */
export const CO_TOI_DA = 15 * 1024 * 1024;
/** YC3.3: không quá 40 triệu điểm ảnh. */
export const DIEM_ANH_TOI_DA = 40_000_000;
/** YC3.3 bước 23: thu về cạnh dài 1600 px. */
export const CANH_DAI = 1600;
export const LOAI_NHAN = ['image/jpeg', 'image/png', 'image/heic'] as const;
/** HV4-NT6, pwa.md P6: ô chọn file nhận đúng ba loại. */
export const ACCEPT_ANH = 'image/jpeg,image/png,image/heic,.heic';

export const CAU_LOI_FILE = 'Ảnh phải là JPEG, PNG hoặc HEIC, tối đa 15 MB';

/** Một số máy không ghi loại cho file HEIC: nhận theo đuôi .heic. */
export function loaiFile(f: { type: string; name: string }): string {
  if (f.type) return f.type.toLowerCase();
  return /\.heic$/i.test(f.name) ? 'image/heic' : '';
}

/** YC3.3 Luật kiểm "File ảnh", YC3.3-NT6: null là file nhận được, còn lại là câu lỗi của ô ảnh. */
export function kiemFileAnh(f: { type: string; name: string; size: number }): string | null {
  if (!(LOAI_NHAN as readonly string[]).includes(loaiFile(f))) return CAU_LOI_FILE;
  if (f.size > CO_TOI_DA) return CAU_LOI_FILE;
  return null;
}

/** YC3.3 bước 26, YC3.3-NT3: nhận đủ tới chỗ còn trống, bỏ phần thừa. */
export function chiaChoTrong<T>(daCo: number, chon: T[]): { nhan: T[]; bo: number } {
  const con = Math.max(0, TOI_DA_ANH - daCo);
  return { nhan: chon.slice(0, con), bo: Math.max(0, chon.length - con) };
}

/** YC3.3 bước 26: toast khi bỏ ảnh thừa. */
export function cauBoAnh(n: number): string {
  return `Mỗi căn tối đa 12 ảnh. Đã bỏ ${n} ảnh.`;
}

/** YC3.3 bước 23: cỡ mới giữ tỉ lệ, cạnh dài không quá 1600 px (ảnh nhỏ hơn thì giữ nguyên). */
export function coMoi(rong: number, cao: number, canh = CANH_DAI): { rong: number; cao: number } {
  const dai = Math.max(rong, cao);
  if (dai <= canh) return { rong, cao };
  const k = canh / dai;
  return { rong: Math.max(1, Math.round(rong * k)), cao: Math.max(1, Math.round(cao * k)) };
}

/** File đã sẵn để tải lên: JPEG đã thu, hoặc HEIC nguyên file khi trình duyệt không vẽ được. */
export type AnhDaThu = { blob: Blob; duoi: 'jpg' | 'heic'; loai: 'image/jpeg' | 'image/heic' };

type AnhVe = { width: number; height: number; close?: () => void };

async function moAnh(f: Blob): Promise<AnhVe | null> {
  try {
    if (typeof createImageBitmap === 'function') return await createImageBitmap(f);
  } catch { /* trình duyệt không vẽ được loại này (HEIC trên Android, Chrome) */ }
  return null;
}

/**
 * YC3.3 bước 23: vẽ lại ảnh lên canvas rồi xuất JPEG cạnh dài 1600 px. Vẽ lại thì mất EXIF, nên mất vị trí chụp.
 * HEIC trình duyệt không vẽ được thì tải nguyên file (đã đúng loại và cỡ). Quá 40 triệu điểm ảnh, hay JPEG, PNG
 * không mở được, thì báo câu lỗi của ô ảnh.
 */
export async function thuAnh(f: File): Promise<AnhDaThu> {
  const loai = loaiFile(f);
  const anh = await moAnh(f);
  if (!anh) {
    if (loai === 'image/heic') return { blob: f, duoi: 'heic', loai: 'image/heic' };
    throw new LoiNguoiDung(CAU_LOI_FILE);
  }
  try {
    if (anh.width * anh.height > DIEM_ANH_TOI_DA) throw new LoiNguoiDung(CAU_LOI_FILE);
    const { rong, cao } = coMoi(anh.width, anh.height);
    const canvas = document.createElement('canvas');
    canvas.width = rong;
    canvas.height = cao;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('không có canvas');
    ctx.drawImage(anh as CanvasImageSource, 0, 0, rong, cao);
    const blob = await new Promise<Blob | null>((xong) => canvas.toBlob(xong, 'image/jpeg', 0.85));
    if (!blob) throw new Error('không xuất được JPEG');
    return { blob, duoi: 'jpg', loai: 'image/jpeg' };
  } finally {
    anh.close?.();
  }
}
