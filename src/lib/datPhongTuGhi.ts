// Chữ và luật kiểm phía app của đặt phòng tự ghi cho căn tự nhập (YC10.4, S6-05, S6-06; YC10 "Quy tắc của nhóm" Giá điền sẵn,
// Đặt phòng tự ghi không phải lịch; QT1.3, QT2.2, QT3.1). Database là chỗ chặn thật (fn_ghi_dat_phong_tu_ghi, fn_sua_dat_phong_tu_ghi).
import { ngayThang } from './can';
import { cacDem, congNgay, type Ngay } from './ngay';
import { tenGiuaCau } from './tabCanSale';
import { vietTien } from './tien';

/** YC10.4 Luật kiểm "Ngày nhận, số đêm" như YC5.3. */
export const SO_DEM_TOI_DA = 365;
export const CAU_QUA_365_DEM = 'Một đặt phòng dài tối đa 365 đêm';
export const CAU_CAN_TRA_CHU = 'Cần nhập tiền trả chủ';
export const CAU_CAN_THU_KHACH = 'Cần nhập tiền thu khách';
/** YC10.4 bước 6. */
export const CAU_THEM_SAU = 'Cọc, số khách, ghi chú: thêm sau trong đặt phòng nếu cần.';
/** YC10.4-NT9: chữ nút xóa lần một và lần hai (bấm hai lần). */
export const NUT_XOA = 'Xóa đặt phòng';

/** YC10.4 bước 1: "Villa Tuần Châu · đã chốt với chú Bình". */
export function phuDeDatPhong(tenCan: string, tenChu: string | null): string {
  return `${tenCan} · đã chốt với ${tenChu?.trim() ? tenGiuaCau(tenChu) : 'chủ căn'}`;
}

/** YC10.4 bước 2: chip "Hôm nay 07/10", "Mai 08/10". */
export function chipNgayNhan(homNay: Ngay): { chu: string; ngay: Ngay }[] {
  const mai = congNgay(homNay, 1);
  return [{ chu: `Hôm nay ${ngayThang(homNay)}`, ngay: homNay }, { chu: `Mai ${ngayThang(mai)}`, ngay: mai }];
}

/** YC10.4 bước 3, YC10.4-NT1: "08/10 → 09/10 (1 đêm)". */
export function dongSoDem(nhan: Ngay, soDem: number): string {
  return `${ngayThang(nhan)} → ${ngayThang(congNgay(nhan, soDem))} (${soDem} đêm)`;
}

/** YC10.4 bước 4, YC10.4-NT2, NT3, QT3.1: "Bạn lời 200.000đ" (thu khách trừ trả chủ). Thiếu một ô thì không có dòng. */
export function dongLoi(traChu: number | null, thuKhach: number | null): string | null {
  if (traChu == null || thuKhach == null) return null;
  return `Bạn lời ${vietTien(thuKhach - traChu)}`;
}

/** YC10.4 bước 4: "Giá điền sẵn từ giá chủ đã lưu và giá bán của bạn. Sửa nếu chú Bình báo giá khác." */
export function cauGiaDienSan(tenChu: string | null): string {
  return `Giá điền sẵn từ giá chủ đã lưu và giá bán của bạn. Sửa nếu ${tenChu?.trim() ? tenGiuaCau(tenChu) : 'chủ căn'} báo giá khác.`;
}

/** YC10.4 Luật kiểm: lỗi theo ô, theo thứ tự trên màn; đủ thì rỗng. */
export function kiemDatPhongTuGhi(f: { soDem: number; traChu: number | null; thuKhach: number | null }): {
  soDem?: string; traChu?: string; thuKhach?: string;
} {
  const loi: { soDem?: string; traChu?: string; thuKhach?: string } = {};
  if (f.soDem > SO_DEM_TOI_DA) loi.soDem = CAU_QUA_365_DEM;
  if (f.traChu == null || f.traChu <= 0) loi.traChu = CAU_CAN_TRA_CHU;
  if (f.thuKhach == null || f.thuKhach <= 0) loi.thuKhach = CAU_CAN_THU_KHACH;
  return loi;
}

/** QT2.2: các tháng có đêm của đặt phòng, theo thứ tự: "10", "10 và 11", "12, 1 và 2". */
export function cacThang(nhan: Ngay, tra: Ngay): string {
  const thang: string[] = [];
  for (const d of cacDem(nhan, tra)) {
    const t = String(Number(d.slice(5, 7)));
    if (!thang.includes(t)) thang.push(t);
  }
  return thang.length <= 1 ? thang.join('') : `${thang.slice(0, -1).join(', ')} và ${thang[thang.length - 1]}`;
}

/** YC10.4 bước 5, YC10.4-NT4, S6-06: "Đã lưu đặt phòng 08/10 → 09/10. Tính vào thống kê tháng 10." */
export function cauDaLuu(nhan: Ngay, tra: Ngay): string {
  return `Đã lưu đặt phòng ${ngayThang(nhan)} → ${ngayThang(tra)}. Tính vào thống kê tháng ${cacThang(nhan, tra)}.`;
}

/** YC10.4-NT8: sau "Lưu thay đổi". */
export function cauDaSua(nhan: Ngay, tra: Ngay): string {
  return `Đã lưu thay đổi ${ngayThang(nhan)} → ${ngayThang(tra)}`;
}

/** YC10.4-NT9: chữ nút lần hai, "Xác nhận xóa đặt phòng 08/10 → 09/10?". */
export function cauXacNhanXoaDatPhong(nhan: Ngay, tra: Ngay): string {
  return `Xác nhận xóa đặt phòng ${ngayThang(nhan)} → ${ngayThang(tra)}?`;
}

/** YC10.4-NT9: sau khi xóa. */
export function cauDaXoa(nhan: Ngay, tra: Ngay): string {
  return `Đã xóa đặt phòng ${ngayThang(nhan)} → ${ngayThang(tra)}`;
}
