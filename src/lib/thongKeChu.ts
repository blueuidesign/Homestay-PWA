// Thống kê của chủ nhà CN8, CN8-00 (YC11.1): kiểu dữ liệu đọc từ fn_thong_ke_chu và các dòng chữ trên màn.
// Số tính ở database (YC11 "Dữ liệu"); ở đây chỉ viết ra chữ: so sánh tháng trước, công suất, cột biểu đồ, dòng chưa thu.
import type { Ngay } from './ngay';
import { vietTienBieuDo } from './tien';

/** YC11.1 bước 3: một căn có lịch của chủ nhà trong tháng (kể cả căn đã ẩn còn doanh thu). */
export type CanThongKe = { canId: string; maCan: string; doanhThu: number; soDem: number; daAn: boolean };
/** YC11.1 bước 5: doanh thu một tháng của biểu đồ; thang là ngày 1 của tháng. */
export type ThangBieuDo = { thang: Ngay; doanhThu: number };
/** YC11.1 bước 6, YC11 "Khách lẻ": một dòng người bán; khách lẻ không có saleId. */
export type NguoiBan = { saleId: string | null; ten: string | null; khachLe: boolean; doanhThu: number };
/** YC11.1 bước 7, YC11 "Chưa thu tiền" (YC11-H9): soTien là tiền phòng (chưa cọc) hay tiền phòng trừ tiền cọc (đã cọc). */
export type DongChuaThu = {
  bookingId: string; canId: string; maCan: string; saleId: string | null; ten: string | null; khachLe: boolean;
  ngayNhan: Ngay; ngayTra: Ngay; trangThaiTien: 'chua_coc' | 'da_coc'; soTien: number; conNgay: number;
};
/** YC11.1 bước 1: số liệu một tháng (fn_thong_ke_chu). Không có giá bán, tiền chênh, mức cộng (PQ11.CHU, PQ15.CHU). */
export type ThongKeThang = {
  thang: Ngay; homNay: Ngay; doanhThu: number; doanhThuThangTruoc: number; soDem: number; mauSo: number; congSuat: number;
  can: CanThongKe[]; cacThang: ThangBieuDo[]; nguoiBan: NguoiBan[]; chuaThu: DongChuaThu[]; tongChuaThu: number;
};

/** YC11.1 bước 1: "Tháng 10/2026". */
export function tenThangThongKe(nam: number, thang: number): string {
  return `Tháng ${thang}/${nam}`;
}

/** YC11.1 bước 2: "Doanh thu tháng 10". */
export function tieuDeDoanhThuThang(thang: number): string {
  return `Doanh thu tháng ${thang}`;
}

/**
 * YC11.1 bước 2, YC11 "So với tháng trước", YC11.1-NT3: "+22.9% so với tháng 9". Tháng trước bằng 0 thì null (không có dòng).
 * Làm tròn một số lẻ, có dấu + hay −. Tháng 1 thì tháng trước là tháng 12.
 */
export function dongSoSanh(doanhThu: number, thangTruoc: number, thang: number): string | null {
  if (thangTruoc <= 0) return null;
  const lech = doanhThu - thangTruoc;
  const pt = Math.round((Math.abs(lech) / thangTruoc) * 1000) / 10; // làm tròn nửa xa số 0, như round của Postgres
  const dau = lech < 0 && pt > 0 ? '−' : '+';
  return `${dau}${pt.toFixed(1)}% so với tháng ${thang === 1 ? 12 : thang - 1}`;
}

/** YC11.1 bước 2, 9: dòng dưới doanh thu: so sánh; tháng chưa có đặt phòng thì "Chưa có đặt phòng" (CN8-00). */
export function dongDuoiDoanhThu(tk: ThongKeThang, thang: number): string | null {
  if (tk.soDem === 0) return 'Chưa có đặt phòng';
  return dongSoSanh(tk.doanhThu, tk.doanhThuThangTruoc, thang);
}

/** YC11.1 bước 4, YC11.1-NT2: "13/62"; tháng không có đêm có khách thì "0" (CN8-00). */
export function chuDemCoKhach(soDem: number, mauSo: number): string {
  return soDem === 0 ? '0' : `${soDem}/${mauSo}`;
}

/** YC11.1 bước 4, YC11 "Công suất": "21.0%" (database đã làm tròn một số lẻ); không có đêm có khách thì "0%" (CN8-00). */
export function chuCongSuat(soDem: number, congSuat: number): string {
  return soDem === 0 ? '0%' : `${congSuat.toFixed(1)}%`;
}

/** YC11.1 bước 5: một cột: nhãn "T10", số "11.8tr" và chiều cao theo cột cao nhất; tháng 0đ thì không có thanh, không có số. */
export type CotBieuDo = { nhan: string; so: string | null; cao: number; dangXem: boolean };
export function cotBieuDo(cacThang: ThangBieuDo[], thangDangXem: Ngay): CotBieuDo[] {
  const max = Math.max(0, ...cacThang.map((t) => t.doanhThu));
  return cacThang.map((t) => ({
    nhan: `T${Number(t.thang.slice(5, 7))}`,
    so: t.doanhThu > 0 ? vietTienBieuDo(t.doanhThu) : null,
    cao: t.doanhThu > 0 && max > 0 ? (t.doanhThu / max) * 100 : 0,
    dangXem: t.thang.slice(0, 7) === thangDangXem.slice(0, 7),
  }));
}

/** YC11.1 bước 6: tên dòng người bán. */
export function tenNguoiBan(n: { ten: string | null; khachLe: boolean }): string {
  return n.khachLe ? 'Khách lẻ' : (n.ten?.trim() || 'Sale');
}

/** YC11.1 bước 6: độ dài thanh theo người bán bán nhiều nhất. */
export function doDaiThanh(ds: NguoiBan[], doanhThu: number): number {
  const max = Math.max(0, ...ds.map((n) => n.doanhThu));
  return max > 0 ? (doanhThu / max) * 100 : 0;
}

function ngayNgan(d: Ngay): string {
  return `${d.slice(8, 10)}/${d.slice(5, 7)}`;
}

/** YC11.1 bước 7: dòng chính "Sale Lan · 17/10 → 19/10". */
export function dongChinhChuaThu(d: DongChuaThu): string {
  return `${tenNguoiBan(d)} · ${ngayNgan(d.ngayNhan)} → ${ngayNgan(d.ngayTra)}`;
}

/**
 * YC11.1 bước 7, YC11-H9: dòng phụ "Chưa cọc · nhận phòng sau 10 ngày", "Đã cọc · nhận phòng sau 3 ngày".
 * Số ngày tính theo hôm nay giờ Việt Nam (database trả). Hôm nay nhận thì "nhận phòng hôm nay"; đã qua ngày nhận thì
 * "đã nhận phòng" (Claude tự chọn: YC chỉ có ví dụ ngày nhận sau hôm nay).
 */
export function dongPhuChuaThu(d: DongChuaThu): string {
  const tt = d.trangThaiTien === 'da_coc' ? 'Đã cọc' : 'Chưa cọc';
  const khi = d.conNgay > 0 ? `nhận phòng sau ${d.conNgay} ngày` : d.conNgay === 0 ? 'nhận phòng hôm nay' : 'đã nhận phòng';
  return `${tt} · ${khi}`;
}

/** Canvas CN8: dòng sắp nhận phòng (trong 7 ngày) ghi màu cảnh báo (Claude tự chọn ngưỡng theo hình: 6 ngày đỏ, 10 ngày xám). */
export function chuaThuGap(d: DongChuaThu): boolean {
  return d.conNgay <= 7;
}

export const CAU_CHUA_CO_DAT_PHONG_THANG = 'Chưa có đặt phòng trong tháng.';
export const CAU_KHONG_CO_CHUA_THU = 'Không có khoản nào chưa thu.';
