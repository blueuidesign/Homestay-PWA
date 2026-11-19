// Kết quả tìm phòng S2, S4 (YC7.3, US45): thẻ căn, nhóm, độ tươi, sắp xếp, hàng lịch tuần, thanh chọn căn, chạm căn mở đâu.
// YC7 Quy tắc của nhóm (Căn của tôi đứng đầu, Nhóm tự nhập riêng, Độ tươi lịch, Sắp xếp, Chạm căn mở đâu), QT5.4, QT6.4.
// Tính ở app chỉ để hiện: căn, giá, nhóm do database trả (fn_sale_tim, fn_sale_lich).
import { chuPhongNgu, dongThongTin } from './can';
import { chuO, tenHang, type CachXep, type DongLichSale, type OLichSale } from './lichSale';
import { congNgay, homNay, soDem, type Ngay } from './ngay';
import { vietTien } from './tien';
import type { CanTim, DieuKienTim, KetQuaTim } from './timPhong';

/** YC7.3 bước 1, 5: hai chế độ. */
export type CheDoKetQua = 'danh-sach' | 'lich-tuan';
export const CHU_CHE_DO: { ma: CheDoKetQua; chu: string }[] = [
  { ma: 'danh-sach', chu: 'Danh sách' }, { ma: 'lich-tuan', chu: 'Lịch tuần' },
];

export const CAU_CUA_TOI_DAU = 'Căn của tôi luôn ở đầu';
export const CHU_LICH_CUA_BAN = '✓ Lịch của bạn, luôn đúng';
export const CHU_CHUA_CO_GIA = 'Chưa có giá';
export const CHU_GUI_KHACH = 'Gửi cho khách';
/** YC8 làm ở US48: bấm "Gửi cho khách" báo tạm. */
export const CAU_GUI_KHACH_SE_CO = 'Gửi cho khách sẽ có ở bản sau';

/** YC7.3 bước 1: "5 căn trống" (database đếm, không tính căn tự nhập). */
export function chuSoCanTrong(kq: Pick<KetQuaTim, 'soCanTrong'>): string {
  return `${kq.soCanTrong} căn trống`;
}

const DANH_XUNG = new Set(['chú', 'cô', 'anh', 'chị', 'bác', 'em', 'ông', 'bà', 'dì', 'cậu', 'mợ', 'thím']);

/** Tên chủ giữa câu: "Chú Bình" thành "chú Bình"; tên không có danh xưng giữ nguyên. */
function tenGiuaCau(ten: string): string {
  const t = ten.trim();
  const dau = t.split(/\s+/)[0]!.toLowerCase();
  return DANH_XUNG.has(dau) ? dau + t.slice(dau.length) : t;
}

/** YC7.3 bước 3, YC7.3-NT5, QT6.4: "Tự nhập · không có lịch, gọi chú Bình hỏi". */
export function chuTuNhap(tenChu: string | null): string {
  return `Tự nhập · không có lịch, gọi ${tenChu?.trim() ? tenGiuaCau(tenChu) : 'chủ căn'} hỏi`;
}

const GIO_MS = 3_600_000;

/**
 * YC7 Quy tắc "Độ tươi lịch": "Lịch cập nhật 2 giờ trước". Dưới 1 giờ "N phút trước" (dưới 1 phút "vừa xong"), dưới 24 giờ
 * "N giờ trước", rồi theo ngày lịch giờ Việt Nam: "hôm qua", "N ngày trước".
 */
export function chuDoTuoi(lichDoiLuc: string | null, bayGio: Date = new Date()): string | null {
  if (!lichDoiLuc) return null;
  const luc = new Date(lichDoiLuc);
  if (Number.isNaN(luc.getTime())) return null;
  const ms = Math.max(0, bayGio.getTime() - luc.getTime());
  let khi: string;
  if (ms < 60_000) khi = 'vừa xong';
  else if (ms < GIO_MS) khi = `${Math.floor(ms / 60_000)} phút trước`;
  else if (ms < 24 * GIO_MS) khi = `${Math.floor(ms / GIO_MS)} giờ trước`;
  else {
    const ngay = soDem(homNay(luc), homNay(bayGio));
    khi = ngay <= 1 ? 'hôm qua' : `${ngay} ngày trước`;
  }
  return `✓ Lịch cập nhật ${khi}`;
}

/** Một thẻ căn trên S2. */
export type TheCan = {
  canId: string; nhom: CanTim['nhom']; ten: string; phu: string;
  /** Giá chủ (đậm) và phần "bạn bán ..." (nhạt); căn tự nhập không có. */
  gia: { chinh: string; phu: string | null } | null;
  doTuoi: string | null;
};

/** YC7.3 bước 1, 2, 3, YC7.3-NT2, NT5: chữ của một thẻ căn. */
export function theCan(c: CanTim, dk: Pick<DieuKienTim, 'nhan' | 'tra'>, bayGio?: Date): TheCan {
  const pn = c.soPhongNgu != null ? chuPhongNgu(c.soPhongNgu) : null;
  const ten = tenHang(c);
  const view = dongThongTin({ soPhongNgu: null, soGiuong: null, loaiView: c.loaiView, tenToa: null });
  const dem = dk.nhan && dk.tra ? soDem(dk.nhan, dk.tra) : null;
  if (c.nhom === 'tu_nhap') {
    return { canId: c.canId, nhom: c.nhom, ten, phu: [pn, view].filter(Boolean).join(' · '), gia: null, doTuoi: chuTuNhap(c.tenChu) };
  }
  if (c.nhom === 'cua_toi') {
    const gia = c.tongGiaChu == null ? CHU_CHUA_CO_GIA : vietTien(c.tongGiaChu) + (dem ? ` / ${dem} đêm` : '');
    return {
      canId: c.canId, nhom: c.nhom, ten, phu: ['Căn của tôi', view].filter(Boolean).join(' · '),
      gia: { chinh: gia, phu: null }, doTuoi: CHU_LICH_CUA_BAN,
    };
  }
  const gia = c.tongGiaChu == null
    ? { chinh: CHU_CHUA_CO_GIA, phu: null }
    : { chinh: vietTien(c.tongGiaChu), phu: c.tongGiaBan == null ? null : `bạn bán ${vietTien(c.tongGiaBan)}` };
  return {
    canId: c.canId, nhom: c.nhom, ten: pn ? `${ten} · ${pn}` : ten, phu: [c.tenChu?.trim(), view].filter(Boolean).join(' · '),
    gia, doTuoi: chuDoTuoi(c.lichDoiLuc, bayGio),
  };
}

/** Thẻ "2.200.000đ · bạn bán 3.000.000đ" viết liền một dòng (dùng cho test, đọc màn). */
export function chuGiaThe(t: TheCan): string {
  if (!t.gia) return '';
  return t.gia.phu ? `${t.gia.chinh} · ${t.gia.phu}` : t.gia.chinh;
}

export type ThongTinXep = { soBan: number; giaDau: number | null };

/** Từ dòng fn_sale_lich: số đặt phòng bán được và giá đêm đầu của mỗi căn (để sắp "Giá tăng dần", "Bán nhiều nhất"). */
export function thongTinXep(dong: readonly DongLichSale[], dem: Ngay | null): Map<string, ThongTinXep> {
  const kq = new Map<string, ThongTinXep>();
  for (const d of dong) {
    const cu = kq.get(d.canId) ?? { soBan: d.soBan, giaDau: null };
    if (d.dem === dem && d.o === 'trong') cu.giaDau = d.giaBan;
    kq.set(d.canId, cu);
  }
  return kq;
}

const soSanhTen = (a: string, b: string) => a.localeCompare(b, 'vi', { numeric: true, sensitivity: 'base' });

/**
 * YC7 Quy tắc "Sắp xếp" (YC7-H9): theo tên; giá đêm đầu tăng dần, không có giá xếp cuối; bán nhiều trước, bằng nhau theo tên.
 * Chưa có số liệu xếp (lịch chưa đọc xong) thì coi như không có giá, bán 0.
 */
export function xepCan(ds: readonly CanTim[], cach: CachXep, tt: ReadonlyMap<string, ThongTinXep> = new Map()): CanTim[] {
  const ten = (c: CanTim) => tenHang(c);
  const r = [...ds];
  if (cach === 'ten') return r.sort((a, b) => soSanhTen(ten(a), ten(b)));
  if (cach === 'ban') return r.sort((a, b) => (tt.get(b.canId)?.soBan ?? 0) - (tt.get(a.canId)?.soBan ?? 0) || soSanhTen(ten(a), ten(b)));
  return r.sort((a, b) => {
    const ga = tt.get(a.canId)?.giaDau ?? null;
    const gb = tt.get(b.canId)?.giaDau ?? null;
    if (ga == null && gb == null) return soSanhTen(ten(a), ten(b));
    if (ga == null) return 1;
    if (gb == null) return -1;
    return ga - gb || soSanhTen(ten(a), ten(b));
  });
}

export type NhomKetQua = { ma: CanTim['nhom']; tieuDe: string; can: CanTim[] };

/**
 * YC7.3 bước 1, YC7.3-NT1, YC7 Quy tắc "Căn của tôi đứng đầu", "Nhóm tự nhập riêng": "Của tôi · 1", "Nguồn phòng · 4",
 * rồi "Tự nhập · chưa biết lịch". Nhóm rỗng thì bỏ. Sắp xếp chỉ trong mỗi nhóm.
 */
export function chiaNhomKetQua(kq: KetQuaTim, cach: CachXep, tt?: ReadonlyMap<string, ThongTinXep>): NhomKetQua[] {
  const theo = (n: CanTim['nhom']) => xepCan(kq.can.filter((c) => c.nhom === n), cach, tt);
  const cuaToi = theo('cua_toi');
  const nguon = theo('nguon');
  const tuNhap = theo('tu_nhap');
  const ra: NhomKetQua[] = [];
  if (cuaToi.length) ra.push({ ma: 'cua_toi', tieuDe: `Của tôi · ${cuaToi.length}`, can: cuaToi });
  if (nguon.length) ra.push({ ma: 'nguon', tieuDe: `Nguồn phòng · ${nguon.length}`, can: nguon });
  if (tuNhap.length) ra.push({ ma: 'tu_nhap', tieuDe: 'Tự nhập · chưa biết lịch', can: tuNhap });
  return ra;
}

/** YC7.3 bước 4, YC7.3-NT3: thanh đáy. */
export function chuDaChon(so: number): string {
  return so > 0 ? `Đã chọn ${so} căn` : 'Chưa chọn căn';
}

/** Màn đích khi chạm một căn (YC7 Quy tắc "Chạm căn mở đâu", GD22, YC7.3-NT6). Căn của chủ nhà mở S3 (US46, chưa có). */
export type ManDich = 'S3' | 'S6-07' | 'S6-03';
export function manKhiCham(c: Pick<CanTim, 'nhom'>): ManDich {
  if (c.nhom === 'cua_toi') return 'S6-07';
  if (c.nhom === 'tu_nhap') return 'S6-03';
  return 'S3';
}

/** Một hàng S4: một căn của kết quả, bảy ô từ ngày đầu. */
export type HangTuan = { canId: string; nhom: CanTim['nhom']; ten: string; phu: string; o: OLichSale[] };

/**
 * YC7.3 bước 5, YC7.3-NT4: bảng căn × 7 ngày chỉ có các căn của kết quả (cùng điều kiện), theo thứ tự nhóm như S2.
 * Ô lấy từ fn_sale_lich: giá bán rút gọn, "Kín", "?" (căn tự nhập). Căn chưa có dòng lịch thì ô "–".
 */
export function hangTuan(nhom: readonly NhomKetQua[], dong: readonly DongLichSale[], ngay: readonly Ngay[]): HangTuan[] {
  const theoCan = new Map<string, Map<Ngay, DongLichSale>>();
  for (const d of dong) {
    let m = theoCan.get(d.canId);
    if (!m) theoCan.set(d.canId, (m = new Map()));
    m.set(d.dem, d);
  }
  return nhom.flatMap((g) => g.can.map((c) => {
    const m = theoCan.get(c.canId);
    return {
      canId: c.canId, nhom: c.nhom, ten: tenHang(c),
      phu: c.nhom === 'cua_toi' ? 'Của tôi' : c.nhom === 'tu_nhap' ? [c.tenChu?.trim(), 'tự nhập'].filter(Boolean).join(' · ') : (c.tenChu ?? ''),
      o: ngay.map((n): OLichSale => {
        const d = m?.get(n);
        if (!d) return { dem: n, loai: c.nhom === 'tu_nhap' ? 'chua_biet' : 'trong', chu: c.nhom === 'tu_nhap' ? '?' : '–', gia: null };
        return { dem: n, loai: d.o, chu: chuO(d.o, d.giaBan), gia: d.o === 'trong' ? d.giaBan : null };
      }),
    };
  }));
}

/** YC7.3 bước 5: đêm khách hỏi (từ ngày nhận tới trước ngày trả, QT2.1) được tô. */
export function laDemKhachHoi(n: Ngay, dk: Pick<DieuKienTim, 'nhan' | 'tra'>): boolean {
  return !!dk.nhan && !!dk.tra && n >= dk.nhan && n < dk.tra;
}

/** YC7-H4: lịch tuần S4 bắt đầu từ ngày nhận. */
export function ngayDauTuan(dk: Pick<DieuKienTim, 'nhan'>): Ngay | null {
  return dk.nhan;
}

/** Khoảng đọc fn_sale_lich cho bảy ngày từ `tu`. */
export function khoangTuan(tu: Ngay): { tu: Ngay; den: Ngay } {
  return { tu, den: congNgay(tu, 7) };
}
