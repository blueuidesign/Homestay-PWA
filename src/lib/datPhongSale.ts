// Chi tiết đặt phòng phía sale (YC5.9, S3-10 khi chủ đã sửa): kiểu dữ liệu đọc từ fn_sale_xem_dat_phong và chữ trên màn.
// Không có tiền cọc, khách chủ nhập (QD7, QD11). Tiền chênh tính ở database (QT3.1).
import { ngayThang } from './can';
import { chuKhoang } from './chiTietCanSale';
import type { Ngay } from './ngay';
import { vietTien } from './tien';

export type SuaGanNhat = {
  luc: string;
  ngayNhanCu: Ngay | null; ngayTraCu: Ngay | null; tienPhongCu: number | null;
};
export type DatPhongSale = {
  id: string; canId: string; maCan: string; tenToa: string | null; soPhongNgu: number | null;
  tenChu: string; sdtChu: string | null; ngayNhan: Ngay; ngayTra: Ngay; trangThai: 'hieu_luc' | 'da_huy';
  tienPhong: number; giaBan: number; tienChenh: number; daCoc: boolean | null; ghiGiup: boolean;
  suaGanNhat: SuaGanNhat | null;
};

type Json = Record<string, unknown>;
const chu = (x: unknown): string | null => (typeof x === 'string' ? x : null);
const so = (x: unknown): number | null => (x == null ? null : Number(x));

/** jsonb của fn_sale_xem_dat_phong sang kiểu của màn. */
export function docDatPhongSale(d: Json): DatPhongSale {
  const s = d.sua_gan_nhat as Json | null | undefined;
  const n = (s?.noi_dung ?? {}) as Json;
  return {
    id: String(d.id), canId: String(d.can_id), maCan: String(d.ma_can ?? ''), tenToa: chu(d.ten_toa), soPhongNgu: so(d.so_phong_ngu),
    tenChu: String(d.ten_chu ?? ''), sdtChu: chu(d.sdt_chu), ngayNhan: String(d.ngay_nhan), ngayTra: String(d.ngay_tra),
    trangThai: d.trang_thai === 'da_huy' ? 'da_huy' : 'hieu_luc',
    tienPhong: Number(d.tien_phong ?? 0), giaBan: Number(d.gia_ban ?? 0), tienChenh: Number(d.tien_chenh ?? 0),
    daCoc: typeof d.da_coc === 'boolean' ? d.da_coc : null, ghiGiup: d.ghi_giup === true,
    suaGanNhat: s ? { luc: String(s.luc ?? ''), ngayNhanCu: chu(n.ngay_nhan_cu), ngayTraCu: chu(n.ngay_tra_cu), tienPhongCu: so(n.tien_phong_cu) } : null,
  };
}

/** YC5.9 bước 38, canvas S3-10: "Chị Hoa · 11/10 → 13/10 (2 đêm)". */
export function dongChuVaNgay(d: Pick<DatPhongSale, 'tenChu' | 'ngayNhan' | 'ngayTra'>): string {
  return `${d.tenChu} · ${chuKhoang(d.ngayNhan, d.ngayTra)}`;
}

/** QD7: chỉ đã cọc hay chưa, không số tiền; null thì không hiện. */
export function chuCoc(daCoc: boolean | null): string | null {
  return daCoc == null ? null : daCoc ? 'Khách đã cọc' : 'Khách chưa cọc';
}

/** Giờ Việt Nam "10:15 hôm nay" hay "10:15 ngày 06/10". */
function luc(iso: string, homNay: Ngay): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return '';
  const s = new Date(t + 7 * 3_600_000).toISOString();
  return s.slice(0, 10) === homNay ? `${s.slice(11, 16)} hôm nay` : `${s.slice(11, 16)} ngày ${s.slice(8, 10)}/${s.slice(5, 7)}`;
}

/**
 * YC5.6, canvas S3-10: thẻ báo chủ vừa sửa. Dòng ngày chỉ khi ngày đổi, dòng giá chủ chỉ khi tiền phòng đổi. Giá bán giữ nguyên
 * (YC5 "Màn hình" S3-10). Câu cuối "Báo lại khách ngày mới." chỉ khi ngày đổi (Claude tự chọn).
 */
export function theChuSua(d: DatPhongSale, homNay: Ngay):
  { tieuDe: string; ngay: { cu: string; moi: string } | null; gia: { cu: string; moi: string } | null; cuoi: string } | null {
  const s = d.suaGanNhat;
  if (!s) return null;
  const doiNgay = !!s.ngayNhanCu && !!s.ngayTraCu && (s.ngayNhanCu !== d.ngayNhan || s.ngayTraCu !== d.ngayTra);
  const doiGia = s.tienPhongCu != null && s.tienPhongCu !== d.tienPhong;
  const l = luc(s.luc, homNay);
  return {
    tieuDe: `${d.tenChu} đã sửa đặt phòng này${l ? ` lúc ${l}` : ''}`,
    ngay: doiNgay ? { cu: `${ngayThang(s.ngayNhanCu!)} → ${ngayThang(s.ngayTraCu!)}`, moi: chuKhoang(d.ngayNhan, d.ngayTra) } : null,
    gia: doiGia ? { cu: vietTien(s.tienPhongCu!), moi: vietTien(d.tienPhong) } : null,
    cuoi: `Giá bán cho khách giữ ${vietTien(d.giaBan)} như bạn đã báo.${doiNgay ? ' Báo lại khách ngày mới.' : ''}`,
  };
}

/** YC5.9 bước 39: tiền chênh khi gõ giá bán mới (tính tạm trên màn; số lưu do database tính). */
export function chenhTam(giaBan: number, tienPhong: number): number {
  return giaBan - tienPhong;
}

/** YC5.9, YC5-H10: "Tiền chênh 600.000đ", âm thì "−100.000đ". */
export function vietChenh(n: number): string {
  return n < 0 ? `−${vietTien(-n)}` : vietTien(n);
}

export const CAU_GHI_GIUP = (tenChu: string) => `${tenChu} đã ghi giúp bạn`;
export const CAU_DA_HUY = 'Đặt phòng đã hủy';
export const CAU_DA_LUU_GIA = 'Đã lưu giá bán';
