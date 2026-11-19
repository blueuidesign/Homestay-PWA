// Phần tính của lịch tháng chủ nhà (YC2.1, QT2, YC2 Quy tắc "Màu theo căn", "Tuần bắt đầu thứ hai").
import { congNgay, type Ngay } from './ngay';

/** Một booking chưa hủy, chỉ phần lịch cần (không tiền, không khách). */
export type DatPhongLich = { id: string; canId: string; ngayNhan: Ngay; ngayTra: Ngay };

/** Căn trên lịch, theo thứ tự hiện (căn thêm trước đứng trước). */
export type CanLich = { id: string; maCan: string };

/**
 * YC2 Quy tắc "Màu theo căn": ba màu đầu theo canvas (1509, 3402, 2501); từ căn thứ 4 dùng tiếp các màu sau
 * (Claude tự chọn, cùng bảng Tailwind 500, khác hẳn màu hành động).
 */
const MAU: readonly string[] = ['#0ea5e9', '#f97316', '#8b5cf6', '#ec4899', '#eab308', '#14b8a6', '#6366f1', '#84cc16', '#ef4444', '#64748b'];

export function mauCan(thuTu: number): string {
  return MAU[((thuTu % MAU.length) + MAU.length) % MAU.length]!;
}

/** YC2.1 bước 3: chip đầu "Cả 2 phòng" khi 2 căn, "Tất cả" khi từ 3 căn; 1 căn thì không có hàng chip (null). */
export function chuChipTatCa(soCan: number): string | null {
  if (soCan < 2) return null;
  return soCan === 2 ? 'Cả 2 phòng' : 'Tất cả';
}

/** YC2.1 bước 1: "Tháng 10/2026". */
export function tenThang(nam: number, thang: number): string {
  return `Tháng ${thang}/${nam}`;
}

/** Khoảng đọc của một tháng: đêm từ `tu` tới trước `den` (ngày 1 tháng sau). */
export function khoangThang(nam: number, thang: number): { tu: Ngay; den: Ngay } {
  const p = (n: number, t: number) => `${n}-${String(t).padStart(2, '0')}-01`;
  return { tu: p(nam, thang), den: thang === 12 ? p(nam + 1, 1) : p(nam, thang + 1) };
}

/**
 * QT2.1, QT2.2: mỗi đêm trong tháng có khách ở căn nào. Booking chiếm đêm từ ngày nhận tới trước ngày trả;
 * đêm thuộc tháng của chính nó. Danh sách vào chỉ có booking chưa hủy (database lọc).
 */
export function demTheoCan(ds: readonly DatPhongLich[], nam: number, thang: number): Map<Ngay, Set<string>> {
  const { tu, den } = khoangThang(nam, thang);
  const kq = new Map<Ngay, Set<string>>();
  for (const b of ds) {
    let d = b.ngayNhan < tu ? tu : b.ngayNhan;
    const het = b.ngayTra < den ? b.ngayTra : den;
    while (d < het) {
      let s = kq.get(d);
      if (!s) kq.set(d, (s = new Set()));
      s.add(b.canId);
      d = congNgay(d, 1);
    }
  }
  return kq;
}

/** YC2.1 bước 2, 3: căn có khách đêm `ngay`; đang lọc một căn thì chỉ căn đó. */
export function canCoKhach(m: Map<Ngay, Set<string>>, ngay: Ngay, canLoc: string | null): string[] {
  const s = m.get(ngay);
  if (!s) return [];
  return canLoc ? (s.has(canLoc) ? [canLoc] : []) : [...s];
}

/** Nhãn ô ngày cho trình đọc màn hình (theo canvas CN1): "Ngày 5, đã đặt phòng 1509, 3402", "Ngày 1, trống". */
export function nhanO(ngayTrongThang: number, maCan: readonly string[]): string {
  return maCan.length ? `Ngày ${ngayTrongThang}, đã đặt phòng ${maCan.join(', ')}` : `Ngày ${ngayTrongThang}, trống`;
}
