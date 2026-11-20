// Chữ và luật kiểm phía app của căn tự nhập (YC10.3, S6-02, S6-03, S6-03-00; YC10 "Quy tắc của nhóm", QT3.1, QT6.4, QD11,
// glossary "Phòng ngủ và số giường", "Loại view"). Database là chỗ chặn thật (fn_tao_can_tu_nhap, fn_sua_can_tu_nhap).
import { dongThongTin, ngayThang } from './can';
import { tenHang } from './lichSale';
import { soDem, type Ngay } from './ngay';
import { tenGiuaCau } from './tabCanSale';
import { vietTien } from './tien';

/** YC10.3 bước 2, 3, 6: các ô bắt buộc của S6-02, theo thứ tự trên màn. */
export type FormTuNhap = { tenChu: string; soDienThoai: string; maCan: string; soPhongNgu: number | null };

/** YC10.3 bước 1: lời giải thích đầu S6-02 (chữ của canvas). */
export const CAU_GIAI_THICH =
  'Cho căn của chủ chưa dùng app. Căn này không có lịch trống: mỗi lần khách hỏi, bạn gọi chủ. App lưu ảnh, giá để gửi khách và ghi lại đặt phòng bạn đã chốt.';
/** YC10.3 bước 4. */
export const CAU_GIA_CHU = 'Giá chủ báo qua điện thoại. Không bắt buộc. Dùng để điền sẵn khi đặt phòng.';
/** YC10.3-NT5, S6-02: ghi chú dưới ô số giường. */
export const CAU_SO_GIUONG = 'Không bắt buộc. Thẻ căn ghi "2PN · 3 giường".';
/** YC10.3 bước 9. */
export const CAU_KHONG_PHAI_LICH = 'Đây là đặt phòng của bạn, không phải lịch của căn. Ngày không có đặt phòng chưa chắc còn trống.';
/** YC10.3 bước 9, S6-03-00. */
export const CAU_CHUA_CO_DAT_PHONG = 'Chưa có đặt phòng nào cho căn này';
/** YC10.3 bước 13. */
export const CAU_CHI_XOA_CUA_BAN = 'Chỉ xóa khỏi Nguồn phòng của bạn.';

/**
 * YC10.3 bước 6, YC10.3-NT1, NT2: chỉ nêu ô bắt buộc đang thiếu; giá chủ, số giường không bao giờ nhắc.
 * Form sửa (YC10.3 bước 12, QD11) xóa được số điện thoại: batBuocSo = false.
 */
export function oThieuTuNhap(f: FormTuNhap, batBuocSo = true): string[] {
  const thieu: string[] = [];
  if (!f.tenChu.trim()) thieu.push('tên chủ nhà');
  if (batBuocSo && !f.soDienThoai.trim()) thieu.push('số điện thoại');
  if (!f.maCan.trim()) thieu.push('mã căn');
  if (f.soPhongNgu == null) thieu.push('số phòng ngủ');
  return thieu;
}

/** YC10.3 bước 6: "Còn thiếu: tên chủ nhà, mã căn"; đủ thì null. */
export function dongConThieu(f: FormTuNhap, batBuocSo = true): string | null {
  const thieu = oThieuTuNhap(f, batBuocSo);
  return thieu.length ? 'Còn thiếu: ' + thieu.join(', ') : null;
}

/** YC10.3-NT5: dòng phụ của thẻ căn: "2PN · 3 giường · view biển". */
export function phuTheTuNhap(c: { soPhongNgu: number | null; soGiuong: number | null; loaiView: string | null }): string {
  return dongThongTin({ soPhongNgu: c.soPhongNgu, soGiuong: c.soGiuong, loaiView: c.loaiView, tenToa: null });
}

/** YC10.3 bước 8, S6-03: tên căn "ICON40 1509", "Villa Tuần Châu". */
export function tenCanTuNhap(c: { maCan: string; tenToa: string | null }): string {
  return tenHang(c);
}

/** YC10.3 bước 8, S6-03: số chủ căn che ba số giữa: "0904 *** 330". Số ngắn quá thì chỉ "***". */
export function cheSo(so: string | null): string | null {
  if (!so) return null;
  const d = so.replace(/\D/g, '');
  if (d.length < 8) return '***';
  return `${d.slice(0, 4)} *** ${d.slice(-3)}`;
}

/** pwa.md P5: "Gọi hỏi lịch" mở trình gọi điện bằng link tel:. Không có số thì null (nút không dùng được, YC10.3-NT8). */
export function linkGoi(so: string | null): string | null {
  if (!so) return null;
  const d = so.replace(/[^\d+]/g, '');
  return d ? `tel:${d}` : null;
}

/** YC10.3 bước 8: "Căn này không có lịch trống. Khách hỏi ngày nào, bạn gọi chú Bình hỏi ngày đó." */
export function cauGoiChu(tenChu: string | null): string {
  const ten = tenChu?.trim() ? tenGiuaCau(tenChu) : 'chủ căn';
  return `Căn này không có lịch trống. Khách hỏi ngày nào, bạn gọi ${ten} hỏi ngày đó.`;
}

/** YC10.3 bước 11: "Mời chú Bình dùng app". */
export function nutMoiChu(tenChu: string | null): string {
  return `Mời ${tenChu?.trim() ? tenGiuaCau(tenChu) : 'chủ căn'} dùng app`;
}

/** YC10.3 bước 13 (giả định GD23): "Xác nhận xóa Villa Tuần Châu?". */
export function cauXacNhanXoa(tenCan: string): string {
  return `Xác nhận xóa ${tenCan}?`;
}

/** Một đặt phòng tự ghi của căn (fn_can_tu_nhap): trả chủ là tiền phòng, thu khách là phần riêng của sale (QD11). */
export type DatPhongTuGhi = { id: string; ngayNhan: Ngay; ngayTra: Ngay; traChu: number; thuKhach: number | null };

/**
 * YC10.3 bước 9, YC10.3-NT6, QT3.1: "20/09 → 22/09 (2 đêm)", "Trả chủ 2.800.000đ · Thu khách 3.400.000đ", "+600.000đ".
 * Chưa có thu khách thì không có tiền chênh.
 */
export function dongDatPhong(d: DatPhongTuGhi): { ngay: string; tien: string; chenh: string | null } {
  const ngay = `${ngayThang(d.ngayNhan)} → ${ngayThang(d.ngayTra)} (${soDem(d.ngayNhan, d.ngayTra)} đêm)`;
  if (d.thuKhach == null) return { ngay, tien: `Trả chủ ${vietTien(d.traChu)}`, chenh: null };
  const c = d.thuKhach - d.traChu;
  return { ngay, tien: `Trả chủ ${vietTien(d.traChu)} · Thu khách ${vietTien(d.thuKhach)}`, chenh: (c >= 0 ? '+' : '') + vietTien(c) };
}

/** YC10.3 bước 9: "Đặt phòng bạn đã ghi · 1". */
export function mucDatPhong(so: number): string {
  return `Đặt phòng bạn đã ghi · ${so}`;
}
