// Phần tính của lịch 7 ngày của sale S1 (YC7.1): dựng hàng căn từ fn_sale_lich, chữ ô, nhóm, sắp xếp, thanh khoảng ngày.
// YC7 Quy tắc của nhóm (Căn của tôi đứng đầu, Ô ngày ghi giá bán, Sắp xếp), QT2.1, QT5.4, QT6.4, glossary "Viết số tiền".
import { chuPhongNgu, dongThongTin } from './can';
import { congNgay, thuTrongTuan, type Ngay } from './ngay';
import { vietTienGon } from './tien';

/** Một dòng fn_sale_lich: một căn, một đêm (YC7 "Dữ liệu"). */
export type DongLichSale = {
  canId: string; nhom: 'cua_toi' | 'nguon' | 'tu_nhap'; maCan: string; tenToa: string | null; tenChu: string | null;
  soPhongNgu: number | null; loaiView: string | null; lichDoiLuc: string | null; soBan: number;
  dem: Ngay; o: 'kin' | 'trong' | 'ban' | 'chua_biet'; giaBan: number | null;
};

/** Một ô ngày trên S1. */
export type OLichSale = { dem: Ngay; loai: 'kin' | 'trong' | 'ban' | 'chua_biet'; chu: string; gia: number | null };

/** Một hàng căn trên S1. */
export type HangLichSale = {
  canId: string; nhom: DongLichSale['nhom']; ten: string; phu: string; soBan: number; o: OLichSale[];
};

export type CachXep = 'ten' | 'gia' | 'ban';

/** S1-04: ba cách sắp xếp, theo thứ tự trên màn. */
export const CACH_XEP: { ma: CachXep; chu: string }[] = [
  { ma: 'ten', chu: 'Theo tên' }, { ma: 'gia', chu: 'Giá tăng dần' }, { ma: 'ban', chu: 'Bán nhiều nhất' },
];

/** S1: hai nhóm; căn tự nhập đếm chung vào "Nguồn phòng" (canvas S1, DLM: "Nguồn phòng 5 căn: ... 1 tự nhập"). */
export type NhomLichSale = { ma: 'cua_toi' | 'nguon'; tieuDe: string; hang: HangLichSale[] };

/** YC7.1 bước 3, 4, 5, QT6.4: chữ ô. Kín là "Kín"; trống là giá bán rút gọn, chưa đặt giá là "–"; tự nhập "?" hay "Bạn". */
export function chuO(o: DongLichSale['o'], gia: number | null): string {
  if (o === 'kin') return 'Kín';
  if (o === 'ban') return 'Bạn';
  if (o === 'chua_biet') return '?';
  return gia == null ? '–' : vietTienGon(gia);
}

/** YC7.1 bước 3: "ICON40 1509", "3402", "Villa Tuần Châu". */
export function tenHang(d: Pick<DongLichSale, 'maCan' | 'tenToa'>): string {
  const toa = d.tenToa?.trim();
  return toa ? `${toa} ${d.maCan.trim()}` : d.maCan.trim();
}

/** YC7.1 bước 3, 4: dòng phụ. Căn của tôi "2PN · view biển"; nguồn "Chị Hoa · 1PN"; tự nhập "Chú Bình · tự nhập". */
export function phuHang(d: Pick<DongLichSale, 'nhom' | 'tenChu' | 'soPhongNgu' | 'loaiView'>): string {
  if (d.nhom === 'tu_nhap') return [d.tenChu?.trim(), 'tự nhập'].filter(Boolean).join(' · ');
  if (d.nhom === 'cua_toi') return dongThongTin({ soPhongNgu: d.soPhongNgu, soGiuong: null, loaiView: d.loaiView, tenToa: null });
  return [d.tenChu?.trim(), d.soPhongNgu != null ? chuPhongNgu(d.soPhongNgu) : null].filter(Boolean).join(' · ');
}

/** Gom dòng theo căn, giữ thứ tự database; mỗi hàng có đủ các đêm của khoảng. */
export function dungHang(dong: readonly DongLichSale[]): HangLichSale[] {
  const theoCan = new Map<string, HangLichSale>();
  for (const d of dong) {
    let h = theoCan.get(d.canId);
    if (!h) {
      h = { canId: d.canId, nhom: d.nhom, ten: tenHang(d), phu: phuHang(d), soBan: d.soBan, o: [] };
      theoCan.set(d.canId, h);
    }
    h.o.push({ dem: d.dem, loai: d.o, chu: chuO(d.o, d.giaBan), gia: d.o === 'ban' || d.o === 'chua_biet' ? null : d.giaBan });
  }
  for (const h of theoCan.values()) h.o.sort((a, b) => (a.dem < b.dem ? -1 : a.dem > b.dem ? 1 : 0));
  return [...theoCan.values()];
}

const soSanhTen = (a: HangLichSale, b: HangLichSale) => a.ten.localeCompare(b.ten, 'vi', { numeric: true, sensitivity: 'base' });

/** YC7 Quy tắc "Sắp xếp" (YC7-H9): giá đêm đầu tăng dần, không có giá xếp cuối; bán nhiều trước, bằng nhau theo tên. */
export function sapXep(hang: readonly HangLichSale[], cach: CachXep): HangLichSale[] {
  const ds = [...hang];
  if (cach === 'ten') return ds.sort(soSanhTen);
  if (cach === 'ban') return ds.sort((a, b) => b.soBan - a.soBan || soSanhTen(a, b));
  const giaDau = (h: HangLichSale) => h.o[0]?.gia ?? null;
  return ds.sort((a, b) => {
    const ga = giaDau(a);
    const gb = giaDau(b);
    if (ga == null && gb == null) return soSanhTen(a, b);
    if (ga == null) return 1;
    if (gb == null) return -1;
    return ga - gb || soSanhTen(a, b);
  });
}

/** YC7.1 bước 3, 7, YC7 Quy tắc "Căn của tôi đứng đầu": nhóm "Căn của tôi" luôn trên "Nguồn phòng"; nhóm rỗng thì bỏ. */
export function chiaNhom(hang: readonly HangLichSale[], cach: CachXep): NhomLichSale[] {
  const cuaToi = sapXep(hang.filter((h) => h.nhom === 'cua_toi'), cach);
  const nguon = sapXep(hang.filter((h) => h.nhom !== 'cua_toi'), cach);
  const kq: NhomLichSale[] = [];
  if (cuaToi.length) kq.push({ ma: 'cua_toi', tieuDe: `Căn của tôi · ${cuaToi.length}`, hang: cuaToi });
  if (nguon.length) kq.push({ ma: 'nguon', tieuDe: `Nguồn phòng · ${nguon.length}`, hang: nguon });
  return kq;
}

const THU = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

/** YC7.1 bước 3: cột ngày "Nay 07", "T5 08". */
export function cotNgay(ngay: Ngay, homNay: Ngay): { thu: string; ngay: string; laHomNay: boolean } {
  const laHomNay = ngay === homNay;
  return { thu: laHomNay ? 'Nay' : THU[thuTrongTuan(ngay)]!, ngay: ngay.slice(8, 10), laHomNay };
}

/** Bảy ngày từ `tu`. */
export function bayNgay(tu: Ngay): Ngay[] {
  return Array.from({ length: 7 }, (_, i) => congNgay(tu, i));
}

const dm = (n: Ngay) => `${n.slice(8, 10)}/${n.slice(5, 7)}`;

/** YC7.1 bước 2, 6: "7 ngày tới · 07/10 → 13/10" khi bắt đầu từ hôm nay; lùi, tiến thì "14/10 → 20/10". */
export function tenKhoang(tu: Ngay, homNay: Ngay): string {
  const khoang = `${dm(tu)} → ${dm(congNgay(tu, 6))}`;
  return tu === homNay ? `7 ngày tới · ${khoang}` : khoang;
}
