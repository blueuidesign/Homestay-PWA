// Chữ của S6-04 · Chi tiết chủ nhà và dòng chủ nhà đã ngừng ở tab Căn (YC10.2, YC10-H1, YC10-H6, YC10 "Bấm hai lần", QD7,
// QT3.1, HV5, PQ2.SALE, PQ3.SALE, PQ8.SALE, PQ15.SALE). Dữ liệu đọc qua fn_chi_tiet_chu_nha (dichVuChiTietChuNha).
import { dongThongTin } from './can';
import { chuDoTuoi } from './ketQuaTim';
import { vietSoDienThoai } from './lich';
import { tenHang } from './lichSale';
import type { Ngay } from './ngay';
import { vietTien, vietTienGon } from './tien';

export type CanCuaChuNha = {
  canId: string; maCan: string; tenToa: string | null; soPhongNgu: number | null; soGiuong: number | null;
  loaiView: string | null;
  /** Giá chủ đêm hôm nay; null khi chủ chưa đặt giá đêm đó (YC10.2-NT1). */
  giaDem: number | null;
};

export type LyDoKhongConQuyen = 'chu_ngung' | 'chu_xoa_tai_khoan';

export type ChiTietChuNha =
  | {
      trangThai: 'da_ket_noi'; ketNoiId: string; chuId: string; tenChu: string; soDienThoai: string | null;
      ketNoiTu: Ngay | null; capNhatLuc: string | null; xemCoc: boolean; can: CanCuaChuNha[];
      soDatPhong: number; tienChenh: number;
    }
  | { trangThai: 'khong_con_quyen'; lyDo: LyDoKhongConQuyen; ketNoiId: string; chuId: string; tenChu: string };

/** YC10.2 bước 1: "0904 118 772 · kết nối từ 02/08/2026"; chủ chưa cho số thì chỉ ngày kết nối. */
export function dongPhuChuNha(ct: { soDienThoai: string | null; ketNoiTu: Ngay | null }): string {
  const ngay = ct.ketNoiTu ? `kết nối từ ${ct.ketNoiTu.slice(8, 10)}/${ct.ketNoiTu.slice(5, 7)}/${ct.ketNoiTu.slice(0, 4)}` : null;
  return [ct.soDienThoai ? vietSoDienThoai(ct.soDienThoai) : null, ngay].filter(Boolean).join(' · ');
}

/** YC10.2 bước 1, YC7 "Độ tươi lịch": "✓ Lịch tự cập nhật · lần cuối 2 giờ trước". */
export function chuTuCapNhat(luc: string | null, bayGio: Date = new Date()): string | null {
  const s = chuDoTuoi(luc, bayGio);
  return s ? s.replace('✓ Lịch cập nhật ', '✓ Lịch tự cập nhật · lần cuối ') : null;
}

/** YC10.2 bước 2: tiêu đề khối quyền (màn viết hoa bằng CSS như canvas). */
export function tieuDeQuyen(tenChu: string): string {
  return `${tenChu} cho bạn xem`;
}

/** YC10.2 bước 2, YC10.2-NT2, QD7: giá luôn có; "Đã cọc hay chưa" chỉ khi chủ bật "Tình trạng cọc". */
export function dongQuyen(xemCoc: boolean): string[] {
  return ['Phòng trống hay đã đặt', 'Giá từng đêm', ...(xemCoc ? ['Đã cọc hay chưa'] : [])];
}

/** YC10.2 bước 3: tên căn "ICON40 1509". */
export function tenCanChuNha(c: Pick<CanCuaChuNha, 'maCan' | 'tenToa'>): string {
  return tenHang(c);
}

/** YC10.2 bước 3, YC10.2-NT1: "2PN · 3 giường · view biển · 1.800.000đ/đêm"; chưa có giá đêm hôm nay thì không ghi giá. */
export function phuCanChuNha(c: CanCuaChuNha): string {
  const thongTin = dongThongTin({ soPhongNgu: c.soPhongNgu, soGiuong: c.soGiuong, loaiView: c.loaiView, tenToa: null });
  return [thongTin || null, c.giaDem != null ? `${vietTien(c.giaDem)}/đêm` : null].filter(Boolean).join(' · ');
}

/** YC10.2 bước 4: "12 đặt phòng". */
export function chuDaBan(so: number): string {
  return `${so} đặt phòng`;
}

/** YC10.2 bước 4, QT3.1, glossary "Viết số tiền": "6,4tr", "400k". Chênh âm giữ dấu trừ. */
export function chuTienChenh(tien: number): string {
  return tien < 0 ? `-${vietTienGon(-tien)}` : vietTienGon(tien);
}

/** YC10.2 bước 5, YC10 "Bấm hai lần": chữ nút sau lần bấm đầu và câu giải thích. */
export function chuXacNhanBo(tenChu: string): string {
  return `Xác nhận bỏ ${tenChu}?`;
}
export function cauGiaiThichBo(tenChu: string): string {
  return `Bạn không thấy lịch của ${tenChu} nữa. Muốn xem lại phải xin link mới.`;
}

/** HV5, YC10-H6: lý do không còn xem được (cùng câu với S3, US46). */
export function chuLyDo(lyDo: LyDoKhongConQuyen): string {
  return lyDo === 'chu_ngung' ? 'Chủ nhà đã ngừng chia sẻ lịch' : 'Chủ nhà đã xóa tài khoản';
}

/** YC10-H1, YC10.2-NT6: nhãn dòng chủ nhà đã ngừng cho sale xem ở tab Căn. */
export const NHAN_DA_NGUNG = 'đã ngừng cho bạn xem lịch';

/** YC10.2 bước 6: toast sau khi bỏ nguồn (Claude tự chọn chữ, ghi ở PR). */
export function chuDaBo(tenChu: string): string {
  return `Đã bỏ ${tenChu} khỏi nguồn phòng`;
}

/** YC10-H1: nhóm chủ nhà ở tab Căn kèm cờ chủ đã ngừng cho xem (dichVuTabCanSale gắn từ cột chu_ngung). */
export type CoChuNgung = { chuNgung?: boolean };
