// Bộ chọn màn theo địa chỉ và phiên (YC1.2, YC1 Quy tắc của nhóm, QD8). Không dùng thư viện router (QD25).
import { laNgay } from './ngay';

export type Vai = 'chu_nha' | 'sale';
export type HoSo = { ten: string | null; soDienThoai: string | null; vaiChon: Vai | null };
export type TrangThaiPhien = 'dang-doc' | 'chua' | 'co';
export type Man = 'dang-tai' | 'A1' | 'xem-truoc-link' | 'hoan-tat' | 'A3' | 'lich';

/** pwa.md P4: /l/<mã> link mời, /x/<mã> link xin lịch. Xem trước không cần đăng nhập (QD8). */
export function laDuongDanLink(duongDan: string): boolean {
  return /^\/[lx]\/[A-Za-z0-9_-]+\/?$/.test(duongDan);
}

/** YC6.3, pwa.md P4: mã của link mời /l/<mã>; địa chỉ khác (kể cả link xin lịch /x/) thì null. */
export function maLinkMoi(duongDan: string): string | null {
  const m = /^\/l\/([A-Za-z0-9_-]+)\/?$/.exec(duongDan);
  return m ? m[1]! : null;
}

/** YC6.5, pwa.md P4: mã của link xin lịch /x/<mã>; địa chỉ khác (kể cả link mời /l/) thì null. */
export function maLinkXinLich(duongDan: string): string | null {
  const m = /^\/x\/([A-Za-z0-9_-]+)\/?$/.exec(duongDan);
  return m ? m[1]! : null;
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

/** Màn trong các tab của chủ nhà (YC3.1, canvas thanh tab A4, CN5). Đường dẫn khác thì về tab Lịch. */
export type ManChu =
  | { tab: 'lich' } | { tab: 'can' } | { tab: 'can-moi' } | { tab: 'can-chi-tiet'; id: string } | { tab: 'can-gia'; id: string }
  | { tab: 'can-gia-nhieu' }
  | { tab: 'sale' } | { tab: 'thong-ke' } | { tab: 'ca-nhan' } | { tab: 'dem-cuoi-tuan' } | { tab: 'ho-so' }
  | { tab: 'dat-phong-moi'; canId?: string; ngay?: string } | { tab: 'dat-phong'; id: string } | { tab: 'dat-phong-sua'; id: string };

export const DUONG_DAN_TAB = { lich: '/', can: '/can', sale: '/sale', 'thong-ke': '/thong-ke', 'ca-nhan': '/ca-nhan' } as const;

/** YC3.1 bước 8, 13, 14: /can/moi là CN5-A1, /can/<mã> là CN5-02 (tab Thông tin). YC4.2 bước 1: /can/<mã>/gia là CN6 tab Giá. */
/** YC5.1 bước 1a, 1b: địa chỉ mở CN4, kèm căn và ngày nhận khi bấm "Đặt phòng" ở dòng căn trống của CN3. */
export function duongDanDatPhongMoi(chon?: { canId: string; ngay: string }): string {
  return chon ? `/dat-phong/moi/${chon.canId}/${chon.ngay}` : '/dat-phong/moi';
}

/** YC5.5, YC2.2 bước 9: địa chỉ chi tiết đặt phòng CN3-02. */
export function duongDanDatPhong(id: string): string {
  return `/dat-phong/${id}`;
}

/** YC5.6 bước 24: địa chỉ form sửa đặt phòng CN4-02. */
export function duongDanSuaDatPhong(id: string): string {
  return `/dat-phong/${id}/sua`;
}

export function chonManChu(duongDan: string): ManChu {
  const d = duongDan.replace(/\/+$/, '') || '/';
  if (d === '/can') return { tab: 'can' };
  if (d === '/can/moi') return { tab: 'can-moi' };
  if (d === '/can/gia-nhieu') return { tab: 'can-gia-nhieu' }; // YC4.4 bước 1: CN6-05
  const ct = /^\/can\/([A-Za-z0-9-]+)$/.exec(d);
  if (ct) return { tab: 'can-chi-tiet', id: ct[1]! };
  const gia = /^\/can\/([A-Za-z0-9-]+)\/gia$/.exec(d);
  if (gia && gia[1] !== 'moi') return { tab: 'can-gia', id: gia[1]! };
  if (d === '/sale') return { tab: 'sale' };
  if (d === '/thong-ke') return { tab: 'thong-ke' };
  if (d === '/ca-nhan') return { tab: 'ca-nhan' };
  if (d === '/ca-nhan/ho-so') return { tab: 'ho-so' }; // YC1.4: P2
  if (d === '/ca-nhan/dem-cuoi-tuan') return { tab: 'dem-cuoi-tuan' }; // YC4.6 bước 1: P6
  // YC5.1 bước 1a: /dat-phong/moi mở CN4; bước 1b: /dat-phong/moi/<mã căn>/<ngày nhận> từ chi tiết ngày CN3.
  if (d === '/dat-phong/moi') return { tab: 'dat-phong-moi' };
  const dp = /^\/dat-phong\/moi\/([A-Za-z0-9-]+)\/(\d{4}-\d{2}-\d{2})$/.exec(d);
  if (dp && laNgay(dp[2]!)) return { tab: 'dat-phong-moi', canId: dp[1]!, ngay: dp[2]! };
  // YC5.5: /dat-phong/<mã đặt phòng> mở CN3-02.
  const ctdp = /^\/dat-phong\/([A-Za-z0-9-]+)$/.exec(d);
  if (ctdp && ctdp[1] !== 'moi') return { tab: 'dat-phong', id: ctdp[1]! };
  // YC5.6 bước 24: /dat-phong/<mã đặt phòng>/sua mở CN4-02.
  const sua = /^\/dat-phong\/([A-Za-z0-9-]+)\/sua$/.exec(d);
  if (sua && sua[1] !== 'moi') return { tab: 'dat-phong-sua', id: sua[1]! };
  return { tab: 'lich' };
}
