// Danh sách tòa dùng chung (YC3.4 bước 29 đến 33, QT6.3, YC3-H5). Đọc một lần qua RLS, lọc và xếp chip ở app.

/** Một dòng của toa_nha. khuVuc chỉ có ở tòa Home247 đặt sẵn (YC3-H5). */
export type ToaNha = { id: string; ten: string; khuVuc: string | null; home247: boolean };

/** YC3.4 bước 29: danh sách tòa và tòa người gọi đã dùng cho căn chưa ẩn của mình (mới dùng trước). */
export type DanhSachToa = { ds: ToaNha[]; daDung: string[] };

/** YC3.4 bước 29: tối đa 6 chip, gồm cả chip cuối "+ Tòa khác". */
export const SO_CHIP_TOA = 5;
export const CHIP_TOA_KHAC = '+ Tòa khác';
export const GHI_CHU_CHON_TOA = 'Chọn tòa có sẵn để sale lọc đúng tòa. Không thấy thì thêm tòa mới.';

/** YC3.4 bước 31: bỏ dấu tiếng Việt và hoa thường để so ("Mường" khớp "muong", "Đ" khớp "d"). */
export function boDau(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
}

/** YC3.4 bước 31, YC3.4-NT1: chỉ còn tòa có tên chứa chữ đã gõ. Chưa gõ thì giữ cả danh sách. */
export function locToa(ds: ToaNha[], chu: string): ToaNha[] {
  const k = boDau(chu.trim());
  if (!k) return ds;
  return ds.filter((t) => boDau(t.ten).includes(k));
}

/** YC3.4 bước 31: dòng cuối danh sách khi đã gõ chữ. null khi chưa gõ. */
export function dongThemToaMoi(chu: string): string | null {
  const t = chu.trim();
  return t ? `+ Thêm tòa mới "${t}"` : null;
}

/**
 * YC3.4 bước 29: chip tòa. Tòa đã dùng (mới dùng trước), rồi tòa Home247 đặt sẵn, tối đa SO_CHIP_TOA.
 * Tòa đang chọn không nằm trong số đó (chọn ở CN5-A1b) thì đứng đầu, để người dùng thấy mình đã chọn gì.
 */
export function xepChipToa(ds: ToaNha[], daDung: string[], chon: string | null = null): ToaNha[] {
  const theoId = new Map(ds.map((t) => [t.id, t]));
  const ra: ToaNha[] = [];
  const them = (t: ToaNha | undefined) => { if (t && !ra.includes(t)) ra.push(t); };
  for (const id of daDung) them(theoId.get(id));
  for (const t of ds) if (t.home247) them(t);
  const chip = ra.slice(0, SO_CHIP_TOA);
  const daChon = chon ? theoId.get(chon) : undefined;
  if (daChon && !chip.includes(daChon)) return [daChon, ...chip.slice(0, SO_CHIP_TOA - 1)];
  return chip;
}
