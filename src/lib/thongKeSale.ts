// Thống kê của sale S7, S7-00 (YC11.2): kiểu dữ liệu đọc từ fn_thong_ke_sale và các dòng chữ trên màn.
// Số tính ở database (YC11 "Dữ liệu", YC11-H2, YC11-H6); ở đây chỉ viết ra chữ. Không có khách, tiền cọc (PQ9.SALE, KT-DB.3.11).
import { tenHang } from './lichSale';
import type { Ngay } from './ngay';
import { dongSoSanh } from './thongKeChu';
import { vietTien } from './tien';

/** YC11.2 bước 4: một dòng theo chủ nhà; chủ căn tự nhập có chuId null, tuNhap true. */
export type DongTheoChu = { chuId: string | null; tuNhap: boolean; ten: string; doanhSo: number; tienChenh: number };
/** YC11.2 bước 5: một yêu cầu đang chờ chủ nhà (không theo tháng, giả định GD26). */
export type YeuCauChoChu = {
  yeuCauId: string; canId: string; maCan: string; tenToa: string | null; ngayNhan: Ngay; ngayTra: Ngay; guiLuc: string;
  tenChu: string;
};
/** YC11.2 bước 1: số liệu tháng của sale (fn_thong_ke_sale). */
export type ThongKeSale = {
  thang: Ngay; soDatPhong: number; doanhSo: number; tienChenh: number;
  soDatPhongThangTruoc: number; doanhSoThangTruoc: number; tienChenhThangTruoc: number;
  theoChu: DongTheoChu[]; choChu: YeuCauChoChu[]; soChoChu: number;
};

/** YC11.2 bước 2: "Tiền chênh tháng 10". */
export function tieuDeTienChenh(thang: number): string {
  return `Tiền chênh tháng ${thang}`;
}

/** YC11.2 bước 2, YC11.2-NT2, YC11 "So với tháng trước": "+33.3% so với tháng 9"; tháng trước 0đ thì không có dòng. */
export function dongSoSanhChenh(tk: Pick<ThongKeSale, 'tienChenh' | 'tienChenhThangTruoc'>, thang: number): string | null {
  return dongSoSanh(tk.tienChenh, tk.tienChenhThangTruoc, thang);
}

function thangTruoc(thang: number): number {
  return thang === 1 ? 12 : thang - 1;
}

/** YC11.2 bước 3: "Tháng 9: 4". */
export function dongDatPhongThangTruoc(so: number, thang: number): string {
  return `Tháng ${thangTruoc(thang)}: ${so}`;
}

/** YC11.2 bước 3: "Tháng 9: 9.800.000đ". */
export function dongDoanhSoThangTruoc(tien: number, thang: number): string {
  return `Tháng ${thangTruoc(thang)}: ${vietTien(tien)}`;
}

/** YC11.2 bước 7: tháng chưa chốt đặt phòng nào thì S7-00 (Claude tự chọn: không đặt phòng nào và doanh số 0đ). */
export function laThangTrong(tk: Pick<ThongKeSale, 'soDatPhong' | 'doanhSo'>): boolean {
  return tk.soDatPhong === 0 && tk.doanhSo === 0;
}

/** YC11.2 bước 4, YC11.2-NT3: "4.800.000đ · chênh 800.000đ". */
export function dongTienTheoChu(d: Pick<DongTheoChu, 'doanhSo' | 'tienChenh'>): string {
  return `${vietTien(d.doanhSo)} · chênh ${vietTien(d.tienChenh)}`;
}

/**
 * Canvas S7: thanh mỗi dòng dài theo dòng doanh số lớn nhất, chia phần giá chủ nhà và phần tiền chênh (phần trăm của thanh đầy).
 * Chênh âm (bán dưới giá chủ) thì không có phần chênh.
 */
export function thanhTheoChu(ds: DongTheoChu[], d: DongTheoChu): { giaChu: number; chenh: number } {
  const max = Math.max(0, ...ds.map((x) => x.doanhSo));
  if (max <= 0 || d.doanhSo <= 0) return { giaChu: 0, chenh: 0 };
  const chenh = Math.max(0, Math.min(d.tienChenh, d.doanhSo));
  return { giaChu: ((d.doanhSo - chenh) / max) * 100, chenh: (chenh / max) * 100 };
}

function ngayNgan(d: Ngay): string {
  return `${d.slice(8, 10)}/${d.slice(5, 7)}`;
}

/** YC11.2 bước 5: "À La Carte 2208 · 10/10 → 12/10". */
export function dongChinhChoChu(y: YeuCauChoChu): string {
  return `${tenHang({ maCan: y.maCan, tenToa: y.tenToa })} · ${ngayNgan(y.ngayNhan)} → ${ngayNgan(y.ngayTra)}`;
}

/**
 * YC11.2 bước 5: "Gửi 14:20 · Anh Tuấn chưa trả lời" (giờ Việt Nam). Gửi trước hôm nay thì kèm ngày "Gửi 14:20 ngày 06/10"
 * (Claude tự chọn: canvas chỉ có ví dụ gửi trong ngày).
 */
export function dongPhuChoChu(y: YeuCauChoChu, homNay: Ngay): string {
  const t = Date.parse(y.guiLuc);
  let gui = '';
  if (!Number.isNaN(t)) {
    const s = new Date(t + 7 * 3_600_000).toISOString();
    gui = s.slice(0, 10) === homNay ? `Gửi ${s.slice(11, 16)}` : `Gửi ${s.slice(11, 16)} ngày ${s.slice(8, 10)}/${s.slice(5, 7)}`;
  }
  return `${gui ? gui + ' · ' : ''}${y.tenChu} chưa trả lời`;
}

export const CHU_THEO_CHU = 'Doanh số theo chủ nhà';
export const CHU_GHI_CHU_CHENH = 'Tiền chênh là giá bán trừ giá chủ nhà';
export const CHU_CHO_CHU = 'Chờ chủ nhà chấp nhận';
export const CHU_XEM_TAT_CA = 'Xem tất cả đặt phòng và yêu cầu';
export const CAU_THANG_TRONG = 'Tháng này chưa chốt đặt phòng nào';
export const CAU_THANG_TRONG_PHU = 'Tìm phòng trống, gửi khách và đặt phòng với chủ nhà. Đặt phòng đã chốt tính ở đây.';
export const CHU_TIM_PHONG = 'Tìm phòng';
