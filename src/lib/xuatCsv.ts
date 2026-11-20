// Xuất file CSV (YC1.6, US6): khoảng ngày của các chip, luật kiểm, tên file, dựng nội dung file từ dòng database trả về.
// Hàm thuần, test cạnh file. Database lọc và kiểm quyền (fn_xuat_csv, PQ20); ở đây chỉ định dạng.
import { congNgay, type Ngay } from './ngay';

/** YC1.6 bước 4, YC1.6-NT2: 11 cột theo đúng thứ tự. */
export const COT_CSV = ['Căn', 'Ngày nhận', 'Ngày trả', 'Số đêm', 'Khách', 'SĐT', 'Sale', 'Tổng tiền', 'Đã cọc', 'Còn lại', 'Ghi chú'] as const;

/** Một dòng fn_xuat_csv trả về (một đặt phòng). Tiền là số nguyên đồng giá chủ nhà. */
export type DongXuat = {
  maCan: string; ngayNhan: Ngay; ngayTra: Ngay; soDem: number;
  tenKhach: string | null; sdtKhach: string | null;
  tenSale: string | null; saleDaXoa: boolean;
  tongTien: number; daCoc: number; conLai: number; ghiChu: string | null;
};

export type ChipThoiGian = 'thang-nay' | 'ba-thang' | 'ca-nam' | 'tuy-chon';
export type Khoang = { tu: Ngay; den: Ngay };

/** YC1.6 luật kiểm. */
export const CAU_QUA_NAM = 'Chọn tối đa 1 năm';

function dauThang(ngay: Ngay, luiThang = 0): Ngay {
  const [n, t] = ngay.split('-').map(Number) as [number, number];
  const tong = n * 12 + (t - 1) - luiThang;
  return `${Math.floor(tong / 12)}-${String((tong % 12) + 1).padStart(2, '0')}-01`;
}
function cuoiThang(ngay: Ngay): Ngay {
  const [n, t] = ngay.split('-').map(Number) as [number, number];
  const sau = t === 12 ? `${n + 1}-01-01` : `${n}-${String(t + 1).padStart(2, '0')}-01`;
  return congNgay(sau, -1);
}

/**
 * YC1.6 bước 2: khoảng ngày của chip, tính từ hôm nay giờ Việt Nam. "3 tháng gần nhất" là tháng này và hai tháng trước,
 * từ ngày 1 tới hết tháng này (giả định GD35). "Năm 2026" là cả năm của hôm nay.
 */
export function khoangChip(chip: Exclude<ChipThoiGian, 'tuy-chon'>, homNay: Ngay): Khoang {
  if (chip === 'thang-nay') return { tu: dauThang(homNay), den: cuoiThang(homNay) };
  if (chip === 'ba-thang') return { tu: dauThang(homNay, 2), den: cuoiThang(homNay) };
  const nam = homNay.slice(0, 4);
  return { tu: `${nam}-01-01`, den: `${nam}-12-31` };
}

/** YC1.6 luật kiểm: đến ngày không trước từ ngày, tối đa 366 ngày (tính cả hai đầu). Đúng thì null. */
export function kiemKhoang(tu: Ngay, den: Ngay): string | null {
  if (!tu || !den || den < tu) return CAU_QUA_NAM;
  return congNgay(tu, 365) < den ? CAU_QUA_NAM : null;
}

/** YC1.6 bước 6, GD30. */
export function tenFileCsv(tu: Ngay, den: Ngay): string {
  return `home247-dat-phong-${tu}-${den}.csv`;
}

/** Chữ người dùng nhập: bắt đầu bằng dấu công thức thì thêm dấu nháy để Excel không chạy như công thức. */
function chuAnToan(s: string | null): string {
  if (!s) return '';
  return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
}
function bocO(s: string): string {
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * YC1.6-NT2, NT3: nội dung file. Có BOM UTF-8 để Excel đọc đúng tiếng Việt, xuống dòng CRLF, dấu phẩy ngăn cột.
 * Tiền là số nguyên đồng không dấu ngăn nghìn. Ngày dạng YYYY-MM-DD để Excel ở máy nào cũng hiểu là ngày.
 * Số điện thoại chỉ có chữ số thì ghi ="0..." để Excel giữ số 0 đầu. QT6.5: sale đã xóa tài khoản kèm ghi chú.
 */
export function taoCsv(dong: readonly DongXuat[]): string {
  const hang = [COT_CSV.join(',')];
  for (const d of dong) {
    const sdt = d.sdtKhach && /^\d+$/.test(d.sdtKhach) ? `="${d.sdtKhach}"` : chuAnToan(d.sdtKhach);
    const sale = d.tenSale ? `${d.tenSale}${d.saleDaXoa ? ' (Đã xoá tài khoản)' : ''}` : '';
    const o = [chuAnToan(d.maCan), d.ngayNhan, d.ngayTra, String(d.soDem), chuAnToan(d.tenKhach), sdt, chuAnToan(sale),
      String(Math.trunc(d.tongTien)), String(Math.trunc(d.daCoc)), String(Math.trunc(d.conLai)), chuAnToan(d.ghiChu)];
    hang.push(o.map(bocO).join(','));
  }
  return '﻿' + hang.join('\r\n') + '\r\n';
}
