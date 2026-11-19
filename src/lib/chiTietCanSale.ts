// Chữ và giá của S3 · Chi tiết căn của chủ nhà (YC7.4, QT5.4, GD13, glossary "Mức cộng của sale"). Tiền là số nguyên đồng.
import { chuPhongNgu, dongThongTin, ngayThang } from './can';
import { tenHang } from './lichSale';
import { congNgay, soDem, type Ngay } from './ngay';
import { vietTien } from './tien';

/** Một đêm của khoảng đang xem: giá chủ, giá bán theo mức cộng đang lưu (null khi chưa có giá). */
export type DemChiTiet = { ngay: Ngay; giaChu: number | null; giaBan: number | null };
export type OLichChiTiet = { ngay: Ngay; o: 'kin' | 'trong' };

/** Dữ liệu fn_sale_chi_tiet_can khi sale được xem căn; ảnh đã đổi sang đường dẫn có hạn 1 giờ. */
export type ChiTietCanSale = {
  canId: string; maCan: string; tenToa: string | null; khuVuc: string | null; soPhongNgu: number | null; soGiuong: number | null;
  loaiView: string | null; lichDoiLuc: string | null; anh: string[];
  chu: { ten: string; soDienThoai: string | null; soCan: number };
  gioNhan: string; gioTra: string; tu: Ngay; den: Ngay; dem: DemChiTiet[];
  tongGiaChu: number | null; tongGiaBan: number | null;
  mucCong: number; mucCongRieng: number | null; mucCongMacDinh: number; lamTron50k: boolean;
  lich: OLichChiTiet[];
};

/** HV5: database chỉ trả lý do. */
export type KetQuaChiTiet = { khongConQuyen: true; lyDo: string | null } | ({ khongConQuyen: false } & ChiTietCanSale);

/** YC7.4 bước 1, YC3.1: "ICON40 1509 · 2PN". */
export function tieuDeCan(c: Pick<ChiTietCanSale, 'maCan' | 'tenToa' | 'soPhongNgu'>): string {
  const ten = tenHang(c);
  return c.soPhongNgu != null ? `${ten} · ${chuPhongNgu(c.soPhongNgu)}` : ten;
}

/** YC7.4 bước 1, YC7.4-NT4: "2PN · 3 giường · view biển · Bãi Cháy"; không có số khách, phần chưa nhập thì bỏ. */
export function dongThongTinCan(c: Pick<ChiTietCanSale, 'soPhongNgu' | 'soGiuong' | 'loaiView' | 'khuVuc'>): string {
  return dongThongTin({ soPhongNgu: c.soPhongNgu, soGiuong: c.soGiuong, loaiView: c.loaiView, tenToa: c.khuVuc });
}

/** YC7.4 bước 2: "Chủ nhà · 2 căn". */
export function chuChuNha(soCan: number): string {
  return `Chủ nhà · ${soCan} căn`;
}

/** YC7.4 bước 2: nút "Gọi" chỉ khi chủ nhà đã cho số; đường dẫn tel: chỉ có chữ số và dấu +. */
export function duongDanGoi(so: string | null): string | null {
  const s = (so ?? '').replace(/[^\d+]/g, '');
  return s ? `tel:${s}` : null;
}

/** YC7.4 bước 3: "10/10 → 12/10 (2 đêm)". */
export function chuKhoang(tu: Ngay, den: Ngay): string {
  return `${ngayThang(tu)} → ${ngayThang(den)} (${soDem(tu, den)} đêm)`;
}

/** Chip mức cộng: 'mac-dinh' (YC7-H7) hay một mức riêng (0 là "Không cộng"). */
export type ChonMuc = { loai: 'mac-dinh' } | { loai: 'rieng'; muc: number };

/** Glossary "Mức cộng của sale": Không cộng, +100k … +500k; "Tùy chọn" là ô gõ số. */
export const MUC_CO_SAN = [0, 100_000, 200_000, 300_000, 400_000, 500_000] as const;

/** "+200k", "+1,2tr" (viết rút gọn như glossary), 0 là "Không cộng". */
export function chuMuc(muc: number): string {
  if (muc === 0) return 'Không cộng';
  if (muc % 1000 === 0 && muc < 1_000_000) return `+${muc / 1000}k`;
  return `+${vietTien(muc)}`;
}

/** YC7-H7: chip "Mặc định" đứng đầu, ghi kèm mức mặc định: "Mặc định +400k". */
export function chuChipMacDinh(macDinh: number): string {
  return macDinh === 0 ? 'Mặc định (không cộng)' : `Mặc định ${chuMuc(macDinh)}`;
}

export type ChipMuc = { khoa: string; chu: string; chon: ChonMuc | 'tuy-chon'; dangChon: boolean };

/** YC7.4 bước 4, YC7-H7: hàng chip; đang dùng mặc định thì chip "Mặc định" được chọn sẵn; mức riêng lạ thì "Tùy chọn" sáng. */
export function hangChip(c: Pick<ChiTietCanSale, 'mucCongRieng' | 'mucCongMacDinh'>): ChipMuc[] {
  const rieng = c.mucCongRieng;
  const coSan = rieng != null && (MUC_CO_SAN as readonly number[]).includes(rieng);
  return [
    { khoa: 'mac-dinh', chu: chuChipMacDinh(c.mucCongMacDinh), chon: { loai: 'mac-dinh' }, dangChon: rieng == null },
    ...MUC_CO_SAN.map((m): ChipMuc => ({ khoa: `m${m}`, chu: chuMuc(m), chon: { loai: 'rieng', muc: m }, dangChon: rieng === m })),
    { khoa: 'tuy-chon', chu: rieng != null && !coSan ? `Tùy chọn ${chuMuc(rieng)}` : 'Tùy chọn', chon: 'tuy-chon', dangChon: rieng != null && !coSan },
  ];
}

/** QT5.4, GD13: giá bán một đêm = giá chủ + mức cộng; bật làm tròn thì làm tròn lên 50.000đ từng đêm. */
export function giaBanDem(giaChu: number, muc: number, lamTron: boolean): number {
  const g = giaChu + muc;
  return lamTron ? Math.ceil(g / 50_000) * 50_000 : g;
}

/**
 * YC7.4 bước 4, YC7.4-NT1, NT7: "Giá bán cho khách" đổi ngay khi chọn chip, tính từ giá chủ từng đêm. Null khi có đêm chưa có giá.
 * Database tính lại cùng cách khi đọc lại (fn_sale_chi_tiet_can).
 */
export function giaBanTheoChon(c: Pick<ChiTietCanSale, 'dem' | 'mucCongMacDinh' | 'lamTron50k'>, chon: ChonMuc): number | null {
  const muc = chon.loai === 'mac-dinh' ? c.mucCongMacDinh : chon.muc;
  let tong = 0;
  for (const d of c.dem) {
    if (d.giaChu == null) return null;
    tong += giaBanDem(d.giaChu, muc, c.lamTron50k);
  }
  return c.dem.length ? tong : null;
}

/** Mức đang chọn theo dữ liệu database. */
export function chonHienTai(c: Pick<ChiTietCanSale, 'mucCongRieng'>): ChonMuc {
  return c.mucCongRieng == null ? { loai: 'mac-dinh' } : { loai: 'rieng', muc: c.mucCongRieng };
}

/** Một ô "Lịch 2 tuần tới". */
export type OHaiTuan = { ngay: Ngay; so: string; chu: string; loai: 'kin' | 'trong' | 'qua'; khachHoi: boolean };

/**
 * YC7.4 bước 5, YC7-H6: 14 ô từ thứ Hai (database trả), "Kín" hay "Trống"; ngày đã qua để trống chữ (trừ Kín, như canvas);
 * đêm khách hỏi (từ ngày nhận tới trước ngày trả, QT2.1) được tô khi `toKhachHoi`.
 */
export function oHaiTuan(lich: readonly OLichChiTiet[], homNay: Ngay, khach: { tu: Ngay; den: Ngay } | null): OHaiTuan[] {
  return lich.map((l) => {
    const qua = l.ngay < homNay;
    const loai = l.o === 'kin' ? 'kin' : qua ? 'qua' : 'trong';
    return {
      ngay: l.ngay, so: String(Number(l.ngay.slice(8, 10))),
      chu: l.o === 'kin' ? 'Kín' : qua ? '' : 'Trống', loai,
      khachHoi: !!khach && l.ngay >= khach.tu && l.ngay < khach.den,
    };
  });
}

/** YC7.4 bước 6: "Nhận phòng 14:00 · Trả phòng 12:00". */
export function chuGio(gioNhan: string, gioTra: string): string {
  return `Nhận phòng ${gioNhan} · Trả phòng ${gioTra}`;
}

/** YC7 Quy tắc "Chạm căn mở đâu", YC7-H6: khoảng mở S3 từ lịch 7 ngày là ngày đầu đang xem, 1 đêm, không tô ngày khách hỏi. */
export function khoangTuLich(tu: Ngay): { tu: Ngay; den: Ngay; khachHoi: false } {
  return { tu, den: congNgay(tu, 1), khachHoi: false };
}

/** Thứ trong tuần cho đầu lưới, theo canvas. */
export const THU_LUOI = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] as const;

export const CAU_CHI_BAN_THAY = 'Chỉ bạn thấy giá này. Khách và chủ nhà không thấy phần cộng thêm.';
