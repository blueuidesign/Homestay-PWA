// Chữ của S5 · Gửi cho khách (YC8.1, YC8 "Mẫu tin gửi khách", "Chữ và ảnh gửi riêng", YC8-H1, H6). Chữ từng căn do
// database soạn (fn_soan_tin_gui_khach, chỉ giá bán); ở đây chỉ ghép mẫu tin cho "Sao chép chữ cả N căn" và chữ nút.
import { ngayThang } from './can';
import type { Ngay } from './ngay';

/** Một khối ở S5: chữ do database soạn, ảnh là đường dẫn có hạn 1 giờ (10 ảnh đầu), soAnh là tổng số ảnh của căn. */
export type CanGuiKhach = {
  canId: string; maCan: string; tenToa: string | null; soPhongNgu: number | null; soGiuong: number | null;
  chu: string; soAnh: number; anh: string[]; tongGiaBan: number | null;
};

export type TinGuiKhach = { tu: Ngay; den: Ngay; soDem: number; mauTin: string; tenSale: string; can: CanGuiKhach[] };

/** YC8-H1: mỗi lần gửi tối đa 10 căn (database từ chối lệnh 11 căn với câu này). */
export const SO_CAN_TOI_DA = 10;
export const CAU_QUA_10_CAN = 'Mỗi lần gửi tối đa 10 căn. Quay lại bỏ bớt căn.';
/** YC8-H6: gửi tối đa 10 ảnh đầu. */
export const SO_ANH_TOI_DA = 10;
export const CAU_GIOI_THIEU = 'Nhiều điện thoại không chia sẻ chữ và ảnh chung một lần: mỗi căn chia sẻ chữ một lần, ảnh một lần.';
export const CAU_HOAC_SAO_CHEP = 'Hoặc sao chép chữ rồi dán vào tin nhắn bất kỳ';
export const CAU_DA_SAO_CHEP_NGAN = 'Đã sao chép';

/** YC8 "Mẫu tin gửi khách": mẫu mặc định (database cũng trả mẫu này khi sale chưa có mẫu riêng). */
export const MAU_TIN_MAC_DINH =
  'Em gửi anh chị [Số căn] căn còn trống [Ngày] ([Số đêm]):\n[Danh sách căn]\nAnh chị ưng căn nào báo em giữ phòng nhé.';

/** YC8.1 bước 2: "3 căn · 10/10 → 12/10. Nhiều điện thoại …". */
export function chuDauMan(soCan: number, tu: Ngay, den: Ngay): string {
  return `${soCan} căn · ${ngayThang(tu)} → ${ngayThang(den)}. ${CAU_GIOI_THIEU}`;
}

/** YC8.1 bước 3, YC8-H6: "6 ảnh"; quá 10 ảnh: "12 ảnh, gửi 10 ảnh đầu". */
export function chuSoAnh(soAnh: number): string {
  return soAnh > SO_ANH_TOI_DA ? `${soAnh} ảnh, gửi ${SO_ANH_TOI_DA} ảnh đầu` : `${soAnh} ảnh`;
}

/** YC8.1 bước 5, YC8-H6: "Gửi 6 ảnh", quá 10 ảnh: "Gửi 10 ảnh". */
export function chuNutAnh(soAnh: number): string {
  return `Gửi ${Math.min(soAnh, SO_ANH_TOI_DA)} ảnh`;
}

/** YC8-H6: 10 ảnh đầu theo thứ tự ảnh của căn. */
export function anhSeGui(anh: string[]): string[] {
  return anh.slice(0, SO_ANH_TOI_DA);
}

/** YC8.1 bước 7. */
export function chuNutSaoChepTatCa(soCan: number): string {
  return `Sao chép chữ cả ${soCan} căn`;
}

/**
 * YC8.1 bước 7, YC8.1-NT3, YC8 "Mẫu tin gửi khách": mẫu của sale với [Ngày], [Số đêm], [Số căn], [Danh sách căn], [Tên sale].
 * [Danh sách căn]: chữ từng khối đánh số theo thứ tự trên màn, các căn cách nhau một dòng trống.
 */
export function tinCaNCan(tin: TinGuiKhach): string {
  const ds = tin.can.map((c, i) => `${i + 1}. ${c.chu}`).join('\n\n');
  const thay: Record<string, string> = {
    '[Ngày]': `${ngayThang(tin.tu)} → ${ngayThang(tin.den)}`,
    '[Số đêm]': `${tin.soDem} đêm`,
    '[Số căn]': String(tin.can.length),
    '[Danh sách căn]': ds,
    '[Tên sale]': tin.tenSale,
  };
  return (tin.mauTin || MAU_TIN_MAC_DINH).replace(/\[(Ngày|Số đêm|Số căn|Danh sách căn|Tên sale)\]/g, (o) => thay[o] ?? o);
}
