// Bộ chọn màn theo địa chỉ và phiên (YC1.2, YC1 Quy tắc của nhóm, QD8). Không dùng thư viện router (QD25).

export type Vai = 'chu_nha' | 'sale';
export type HoSo = { ten: string | null; soDienThoai: string | null; vaiChon: Vai | null };
export type TrangThaiPhien = 'dang-doc' | 'chua' | 'co';
export type Man = 'dang-tai' | 'A1' | 'xem-truoc-link' | 'hoan-tat' | 'A3' | 'lich';

/** pwa.md P4: /l/<mã> link mời, /x/<mã> link xin lịch. Xem trước không cần đăng nhập (QD8). */
export function laDuongDanLink(duongDan: string): boolean {
  return /^\/[lx]\/[A-Za-z0-9_-]+\/?$/.test(duongDan);
}

/**
 * YC1.2-NT1: chưa đăng nhập thì mọi địa chỉ về A1, trừ link mời, link xin lịch.
 * YC1 Quy tắc "Chưa đăng ký xong thì chưa vào app": hồ sơ thiếu tên hoặc số thì về màn nhập số.
 * YC1.2 bước 4: chưa chọn vai thì A3, đã chọn thì tab Lịch; đến từ link thì màn của link.
 * hoSo: undefined là chưa đọc xong, null là không đọc được.
 */
export function chonMan(v: { duongDan: string; phien: TrangThaiPhien; hoSo: HoSo | null | undefined }): Man {
  if (v.phien === 'dang-doc') return 'dang-tai';
  const link = laDuongDanLink(v.duongDan);
  if (v.phien === 'chua') return link ? 'xem-truoc-link' : 'A1';
  if (v.hoSo === undefined) return 'dang-tai';
  if (!v.hoSo || !v.hoSo.ten || !v.hoSo.soDienThoai) return 'hoan-tat';
  if (link) return 'xem-truoc-link';
  return v.hoSo.vaiChon ? 'lich' : 'A3';
}
