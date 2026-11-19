// Phần tính của form Thêm đặt phòng CN4 (YC5.1): ngày trả theo số đêm, đêm trống đầu tiên, kiểm trùng sớm (bước 4).
// Kiểm ở đây chỉ để báo sớm; chặn thật ở database (QD6, QT1.1, fn_tao_booking). Nháp form theo HV3.
import { docNhap, luuNhap, xoaNhap } from '../chung/nhap';
import { ngayThang } from './can';
import { chuNguoiDat, khoangNgay, type DatPhongLich, type TrangThaiTien } from './lich';
import { congNgay, laNgay, thuTrongTuan, type Ngay } from './ngay';
import { vietTien } from './tien';

/** YC5.3 Luật kiểm: một đặt phòng dài tối đa 365 đêm. */
export const SO_DEM_TOI_DA = 365;
export const CAU_NGAY_TRA = 'Ngày trả phải sau ngày nhận';
export const CAU_QUA_DAI = 'Một đặt phòng dài tối đa 365 đêm';

/** YC5.1 bước 3: chip "1 đêm", "2 đêm", "3 đêm" hay "Tùy chọn". */
export type ChipDem = 1 | 2 | 3 | 'tuy-chon';

/** YC5.1-NT3: ngày trả = ngày nhận cộng số đêm. */
export function ngayTraTheoSoDem(nhan: Ngay, soDem: number): Ngay {
  return congNgay(nhan, soDem);
}

/** Số đêm giữa hai ngày (âm hay 0 khi ngày trả không sau ngày nhận); null khi ngày sai dạng. */
export function soDemGiua(nhan: Ngay, tra: Ngay): number | null {
  if (!laNgay(nhan) || !laNgay(tra)) return null;
  return Math.round((Date.parse(tra + 'T00:00:00Z') - Date.parse(nhan + 'T00:00:00Z')) / 86400000);
}

/** YC5.1 bước 3: đổi ngày trả bằng tay thì chip tương ứng tự sáng (1, 2, 3) hoặc "Tùy chọn". */
export function chipCuaSoDem(soDem: number | null): ChipDem {
  return soDem === 1 || soDem === 2 || soDem === 3 ? soDem : 'tuy-chon';
}

/** QT2.1: đặt phòng chiếm đêm `dem` khi nhận ≤ dem < trả. */
const chiemDem = (b: DatPhongLich, dem: Ngay) => b.ngayNhan <= dem && dem < b.ngayTra;

/** YC5.1 bước 1a, YC5.1-NT4: đêm trống đầu tiên của căn tính từ `tu` (hôm nay), theo các đặt phòng chưa hủy đã đọc. */
export function demTrongDauTien(ds: readonly DatPhongLich[], canId: string, tu: Ngay): Ngay {
  const cua = ds.filter((b) => b.canId === canId);
  let dem = tu;
  // Mỗi vòng nhảy tới ngày trả của đặt phòng đang chiếm đêm đó, nên dừng sau tối đa số đặt phòng của căn.
  for (let i = 0; i <= cua.length; i++) {
    const chiem = cua.find((b) => chiemDem(b, dem));
    if (!chiem) return dem;
    dem = chiem.ngayTra;
  }
  return dem;
}

/** Kết quả dòng kiểm dưới ô ngày (YC5.1 bước 4). 'chua-du': ngày chưa đủ để kiểm. */
export type KetQuaKiem = { loai: 'chua-du' | 'loi' | 'khong-trung' | 'trung'; chu: string };

/**
 * YC5.1 bước 4, YC5.1-NT1, NT2, QT1.1, QT2.1: so các đêm đã chọn với đặt phòng chưa hủy của cùng căn đã đọc.
 * Trùng nhiều đặt phòng thì nêu đặt phòng có đêm trùng sớm nhất, kèm "và N đặt phòng khác".
 * Ngày trả không sau ngày nhận, quá 365 đêm thì câu của Luật kiểm YC5.3 (YC5.1-NT6, app chặn trước).
 */
export function kiemNgay(ds: readonly DatPhongLich[], canId: string, nhan: Ngay, tra: Ngay): KetQuaKiem {
  const n = soDemGiua(nhan, tra);
  if (n === null) return { loai: 'chua-du', chu: '' };
  if (n < 1) return { loai: 'loi', chu: CAU_NGAY_TRA };
  if (n > SO_DEM_TOI_DA) return { loai: 'loi', chu: CAU_QUA_DAI };
  const trung = ds
    .filter((b) => b.canId === canId && b.ngayNhan < tra && nhan < b.ngayTra)
    .map((b) => ({ b, dem: b.ngayNhan > nhan ? b.ngayNhan : nhan }))
    .sort((x, y) => (x.dem < y.dem ? -1 : x.dem > y.dem ? 1 : x.b.ngayNhan < y.b.ngayNhan ? -1 : 1));
  if (!trung.length) return { loai: 'khong-trung', chu: `✓ ${khoangNgay(nhan, tra)} · không trùng lịch` };
  const { b, dem } = trung[0]!;
  const them = trung.length > 1 ? ` và ${trung.length - 1} đặt phòng khác` : '';
  return {
    loai: 'trung',
    chu: `Trùng đêm ${ngayThang(dem)} với đặt phòng của ${chuNguoiDat(b.nguoiDat)} (${ngayThang(b.ngayNhan)} → ${ngayThang(b.ngayTra)})${them}`,
  };
}

// HV3 bước 1, 3, 5, HV3-NT1, HV3-NT4: nháp CN4 trên localStorage (bọc try/catch trong chung/nhap), giữ 7 ngày (HV3-H1).
// Giữ cả mã lần gửi để bấm lại sau khi mở lại vẫn là cùng một lần gửi (QT5.6).
const KHOA_NHAP = 'datPhong';
export const GIU_NHAP_DAT_PHONG_MS = 7 * 24 * 60 * 60 * 1000;
export type BanNhapDatPhong = { canId: string; ngayNhan: Ngay; ngayTra: Ngay; tuyChon: boolean; clientId: string };

export function ghiBanNhapDatPhong(b: BanNhapDatPhong, bay = Date.now()): void {
  luuNhap(KHOA_NHAP, b, bay);
}

export function docBanNhapDatPhong(bay = Date.now()): BanNhapDatPhong | null {
  const b = docNhap<Partial<BanNhapDatPhong>>(KHOA_NHAP, bay, GIU_NHAP_DAT_PHONG_MS);
  if (!b || typeof b !== 'object') return null;
  const chu = (v: unknown) => (typeof v === 'string' ? v : '');
  if (!chu(b.canId) || !laNgay(chu(b.ngayNhan)) || !laNgay(chu(b.ngayTra))) return null;
  return { canId: chu(b.canId), ngayNhan: chu(b.ngayNhan), ngayTra: chu(b.ngayTra), tuyChon: b.tuyChon === true, clientId: chu(b.clientId) };
}

/** HV3 bước 5, HV3-NT4: lưu xong hay bỏ form thì xóa nháp. */
export function xoaBanNhapDatPhong(): void {
  xoaNhap(KHOA_NHAP);
}

// ===== YC5.2 · Người đặt, tiền phòng, trạng thái tiền =====

/** YC5.2 bước 5: sale đang kết nối với chủ nhà (YC6), theo thứ tự đọc về. */
export type SaleKetNoi = { id: string; ten: string };

/** YC5.2 bước 5: một chip ở hàng "Khách / Sale". */
export type ChipNguoiDat =
  | { loai: 'sale-moi'; khoa: 'sale-moi'; chu: string }
  | { loai: 'le'; khoa: 'le'; chu: string }
  | { loai: 'sale'; khoa: string; chu: string; id: string }
  | { loai: 'khach'; khoa: string; chu: string; ten: string };

/** YC5.2 bước 5: tối đa 10 tên khách lẻ đã nhập. */
export const SO_TEN_KHACH_TOI_DA = 10;

/**
 * YC5.2 bước 5, YC5.2-NT9: thứ tự chip "+ Sale mới", "Khách lẻ", các sale đang kết nối, rồi tên khách lẻ chủ nhà đã nhập
 * (danh sách đọc về đã mới nhất trước; tối đa 10, mỗi tên một lần).
 */
export function chipNguoiDat(sale: readonly SaleKetNoi[], tenKhach: readonly string[]): ChipNguoiDat[] {
  const ten = [...new Set(tenKhach.map((t) => t.trim()).filter(Boolean))].slice(0, SO_TEN_KHACH_TOI_DA);
  return [
    { loai: 'sale-moi', khoa: 'sale-moi', chu: '+ Sale mới' },
    { loai: 'le', khoa: 'le', chu: 'Khách lẻ' },
    ...sale.map((s) => ({ loai: 'sale' as const, khoa: `sale:${s.id}`, chu: s.ten, id: s.id })),
    ...ten.map((t) => ({ loai: 'khach' as const, khoa: `khach:${t}`, chu: t, ten: t })),
  ];
}

/** YC5.2 bước 6c: dòng nhỏ dưới hàng chip khi chọn sale. */
export function cauChonSale(ten: string): string {
  const goi = ten.replace(/^Sale\s+/i, '');
  return `Đặt phòng của ${ten}: ${goi} được báo và thấy đặt phòng này như của mình.`;
}

/** YC5.2 bước 7, QT5.3: giá chủ nhà của một đêm; null là chưa đặt giá. */
export type GiaDem = { dem: Ngay; gia: number | null };

/** YC5.2 bước 7, YC5.2-NT1, NT5: dòng "31/10: 1.300.000đ" hay "01/12: chưa đặt giá". */
export function dongGiaDem(d: GiaDem): string {
  return `${ngayThang(d.dem)}: ${d.gia === null ? 'chưa đặt giá' : vietTien(d.gia)}`;
}

/** YC5.2 bước 7, QT4.1, YC5.2-NT5: tổng giá chủ nhà các đêm; có đêm chưa có giá (hay không có đêm) thì null (ô để trống). */
export function tongGiaDem(ds: readonly GiaDem[]): number | null {
  if (!ds.length || ds.some((d) => d.gia === null)) return null;
  return ds.reduce((t, d) => t + (d.gia ?? 0), 0);
}

/** YC5.2 bước 8a: ba trạng thái tiền của form (QT6.1). */
export type TrangThaiTienForm = 'chua_coc' | 'da_coc_con_thu' | 'da_thanh_toan';
export const CHIP_TRANG_THAI_TIEN: { gt: TrangThaiTienForm; chu: string }[] = [
  { gt: 'chua_coc', chu: 'Chưa cọc' }, { gt: 'da_coc_con_thu', chu: 'Đã cọc · còn thu' }, { gt: 'da_thanh_toan', chu: 'Đã thanh toán' },
];

export const CAU_CAN_TIEN_PHONG = 'Nhập tiền phòng trước khi lưu';
export const CAU_COC_QUA_TIEN = 'Tiền cọc không được lớn hơn tiền phòng';

/** YC5.2 bước 7d, CN4-01, YC5.2-NT3: tiền phòng trống (hay 0) thì báo và không lưu được. */
export function loiTienPhong(tien: number | null): string | null {
  return tien === null || tien <= 0 ? CAU_CAN_TIEN_PHONG : null;
}

/** YC5.2 bước 8b, YC5.2-NT7 (giả định GD20): cọc chỉ kiểm khi "Đã cọc · còn thu"; để trống được (YC5-H19). */
export function loiTienCoc(trangThai: TrangThaiTienForm, coc: number | null, tien: number | null): string | null {
  if (trangThai !== 'da_coc_con_thu' || coc === null) return null;
  return tien !== null && coc > tien ? CAU_COC_QUA_TIEN : null;
}

/** YC5.2 bước 8c: dòng tóm tắt phần chi tiết, ví dụ "4 khách · 14:00 → 12:00 · Ghi chú". */
export function tomTatChiTiet(soKhach: number, gioNhan: string, gioTra: string, ghiChu: string): string {
  return `${soKhach} khách · ${gioNhan} → ${gioTra}${ghiChu.trim() ? ' · Ghi chú' : ''}`;
}

/** YC5.3 bước 10: tên người đặt trong toast "Đã thêm đặt phòng <người đặt> · <căn>". */
export function tenNguoiDatToast(v: { sale?: string | null; tenKhach?: string | null }): string {
  return v.sale?.trim() || v.tenKhach?.trim() || 'Khách lẻ';
}

// ===== YC5.5 · Chi tiết đặt phòng và thu tiền =====

/**
 * YC5.5 bước 16, 17, 17b, 19, 22: chi tiết một đặt phòng mà chủ nhà đọc qua fn_chi_tiet_dat_phong.
 * Khách (tenKhach, sdtKhach, soKhach) là phần chủ nhà tự nhập; khách do sale nhập không bao giờ có ở đây (QD11).
 * sdtSale chỉ có khi sale đang kết nối và chưa xóa tài khoản (QD13).
 */
export type ChiTietDatPhong = {
  id: string; canId: string; maCan: string; ngayNhan: Ngay; ngayTra: Ngay; gioNhan: string | null; gioTra: string | null;
  tienPhong: number; tienCoc: number | null; trangThaiTien: TrangThaiTien | null; coHoanTac: boolean; daHuy: boolean;
  ghiChu: string | null; saleId: string | null; tenSale: string | null; sdtSale: string | null; saleDaXoa: boolean;
  tenKhach: string | null; sdtKhach: string | null; soKhach: number | null;
};

/** QT6.1: nhãn trạng thái tiền trên CN3-02. */
export function nhanTrangThaiTien(tt: TrangThaiTien | null): string | null {
  if (tt === 'chua_coc') return 'Chưa cọc';
  if (tt === 'da_coc') return 'Đã cọc · còn thu';
  if (tt === 'da_thanh_toan') return 'Đã thanh toán';
  return null;
}

/**
 * YC5 Quy tắc "Tiền còn lại", QT6.1, YC5.5-NT1: còn lại = tiền phòng − tiền cọc, tính lúc hiện, không lưu.
 * Đã thanh toán thì không còn thu gì: 0đ (Claude tự quyết, QD25).
 */
export function tienConLai(tienPhong: number, tienCoc: number | null, tt: TrangThaiTien | null): number {
  if (tt === 'da_thanh_toan') return 0;
  return Math.max(0, tienPhong - (tienCoc ?? 0));
}

const TEN_THU = ['chủ nhật', 'thứ 2', 'thứ 3', 'thứ 4', 'thứ 5', 'thứ 6', 'thứ 7'] as const;

/** YC5.5 bước 16, canvas CN3-02: "Nhận 14:00 thứ 7 · trả 12:00 thứ 2". Không có giờ thì 14:00, 12:00 (YC5 Quy tắc "Giờ nhận trả mặc định"). */
export function dongGioNhanTra(nhan: Ngay, tra: Ngay, gioNhan: string | null, gioTra: string | null): string {
  const gio = (g: string | null, md: string) => (g ?? md).slice(0, 5);
  return `Nhận ${gio(gioNhan, '14:00')} ${TEN_THU[thuTrongTuan(nhan)]} · trả ${gio(gioTra, '12:00')} ${TEN_THU[thuTrongTuan(tra)]}`;
}

/** YC5.5 bước 17, canvas CN3-02: "Khách do sale Hùng bán. …" (tên bỏ chữ "Sale" đầu, như canvas). */
export function cauKhachCuaSale(tenSale: string): string {
  const goi = tenSale.replace(/^Sale\s+/i, '');
  return `Khách do sale ${goi} bán. Tên và số điện thoại khách chỉ sale giữ; cần gì về khách thì gọi sale.`;
}

/** YC5.5 bước 22, CN3-02-01. */
export function cauSaleDaXoa(tenSale: string): string {
  return `${tenSale} đã xóa tài khoản. Đặt phòng vẫn giữ trong lịch của bạn; app không còn số điện thoại của sale này.`;
}

/** YC5.5 bước 16: tiêu đề "Đặt phòng · Sale Hùng", "Đặt phòng · Bà Lan" hay "Đặt phòng · Khách lẻ". */
export function tieuDeChiTiet(d: Pick<ChiTietDatPhong, 'saleId' | 'tenSale' | 'tenKhach'>): string {
  const ten = d.saleId ? (d.tenSale ?? 'Sale') : (d.tenKhach?.trim() || 'Khách lẻ');
  return `Đặt phòng · ${ten}`;
}
