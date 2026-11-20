// Đặt phòng và yêu cầu của sale S7-03, S7-03-00 (YC11.3): kiểu dữ liệu đọc từ fn_danh_sach_sale và chữ trên màn.
// Trạng thái, tiền chênh tính ở database (YC11 "Dữ liệu"); ở đây chỉ viết ra chữ. Không có khách, tiền cọc (PQ9.SALE).
import { tenHang } from './lichSale';
import type { Ngay } from './ngay';
import { vietTien } from './tien';

export type TrangThaiDong = 'cho' | 'da_chot' | 'bi_tu_choi' | 'het_han' | 'da_huy';

/** YC11.3 bước 1: một dòng của danh sách, đặt phòng (sale đứng tên) hay yêu cầu. */
export type DongDanhSach = {
  loai: 'dat_phong' | 'yeu_cau'; id: string; canId: string; maCan: string; tenToa: string | null;
  ngayNhan: Ngay; ngayTra: Ngay; trangThai: TrangThaiDong; moc: string; guiLuc: string | null;
  tienChenh: number | null; ghiGiup: string | null;
  tuChoi: 'khong_nhan' | 'dat_phong_khac' | null; hetHanVi: 'qua_14_ngay' | 'qua_ngay_nhan' | null;
};
export type DanhSachSale = { dong: DongDanhSach[]; conNua: boolean };

/** YC11 "Dữ liệu": mỗi lần đọc 50 dòng. */
export const SO_DONG_MOT_LAN = 50;

type Json = Record<string, unknown>;
const chu = (x: unknown): string | null => (typeof x === 'string' ? x : null);
const TT: readonly TrangThaiDong[] = ['cho', 'da_chot', 'bi_tu_choi', 'het_han', 'da_huy'];

/** Đổi jsonb của fn_danh_sach_sale sang kiểu của màn. */
export function docDanhSachSale(r: Json): DanhSachSale {
  const dong = Array.isArray(r.dong) ? (r.dong as Json[]) : [];
  return {
    conNua: r.con_nua === true,
    dong: dong.map((d) => ({
      loai: d.loai === 'dat_phong' ? 'dat_phong' : 'yeu_cau',
      id: String(d.id), canId: String(d.can_id), maCan: String(d.ma_can ?? ''), tenToa: chu(d.ten_toa),
      ngayNhan: String(d.ngay_nhan), ngayTra: String(d.ngay_tra),
      trangThai: TT.includes(d.trang_thai as TrangThaiDong) ? (d.trang_thai as TrangThaiDong) : 'cho',
      moc: String(d.moc ?? ''), guiLuc: chu(d.gui_luc),
      tienChenh: d.tien_chenh == null ? null : Number(d.tien_chenh), ghiGiup: chu(d.ghi_giup),
      tuChoi: d.tu_choi === 'khong_nhan' || d.tu_choi === 'dat_phong_khac' ? d.tu_choi : null,
      hetHanVi: d.het_han_vi === 'qua_14_ngay' || d.het_han_vi === 'qua_ngay_nhan' ? d.het_han_vi : null,
    })),
  };
}

function ngayNgan(d: Ngay): string {
  return `${d.slice(8, 10)}/${d.slice(5, 7)}`;
}

/** YC11.3 bước 1, canvas S7-03: "ICON40 1509 · 10/10 → 12/10". */
export function dongChinh(d: Pick<DongDanhSach, 'maCan' | 'tenToa' | 'ngayNhan' | 'ngayTra'>): string {
  return `${tenHang({ maCan: d.maCan, tenToa: d.tenToa })} · ${ngayNgan(d.ngayNhan)} → ${ngayNgan(d.ngayTra)}`;
}

/** YC11.3 bước 2, canvas S7-03: nhãn và màu chip (Chờ chủ, Đã chốt, Hết hạn: vàng; Bị từ chối: đỏ; Đã hủy: xám). */
export function nhanTrangThai(d: Pick<DongDanhSach, 'trangThai'>): { chu: string; mau: 'canh-bao' | 'loi' | 'trung-tinh'; sang: boolean } {
  switch (d.trangThai) {
    case 'cho': return { chu: 'Chờ chủ', mau: 'canh-bao', sang: true };
    case 'da_chot': return { chu: 'Đã chốt', mau: 'canh-bao', sang: true };
    case 'bi_tu_choi': return { chu: 'Bị từ chối', mau: 'loi', sang: false };
    case 'het_han': return { chu: 'Hết hạn', mau: 'canh-bao', sang: false };
    default: return { chu: 'Đã hủy', mau: 'trung-tinh', sang: false };
  }
}

/** Giờ gửi giờ Việt Nam: "14:20", gửi trước hôm nay thì "14:20 ngày 06/10". */
function gioGui(guiLuc: string | null, homNay: Ngay): string {
  const t = guiLuc ? Date.parse(guiLuc) : Number.NaN;
  if (Number.isNaN(t)) return '';
  const s = new Date(t + 7 * 3_600_000).toISOString();
  return s.slice(0, 10) === homNay ? s.slice(11, 16) : `${s.slice(11, 16)} ngày ${s.slice(8, 10)}/${s.slice(5, 7)}`;
}

/**
 * YC11.3 bước 2, 3: câu trạng thái của dòng. Đặt phòng đã hủy (QD12) "Đặt phòng đã hủy" và yêu cầu hết hạn vì qua ngày nhận
 * "Đã qua ngày nhận phòng, chủ chưa trả lời" là Claude tự chốt (US60); câu ghi giúp theo giả định GD25.
 */
export function dongPhu(d: DongDanhSach, homNay: Ngay): string {
  if (d.loai === 'dat_phong') {
    if (d.trangThai === 'da_huy') return 'Đặt phòng đã hủy';
    const dau = d.ghiGiup ? `${d.ghiGiup} đã ghi giúp bạn` : 'Chủ đã chấp nhận';
    return d.tienChenh == null ? dau : `${dau} · chênh ${vietTien(d.tienChenh)}`;
  }
  switch (d.trangThai) {
    case 'cho': {
      const g = gioGui(d.guiLuc, homNay);
      return g ? `Đã gửi yêu cầu ${g}, chờ chủ chấp nhận` : 'Đã gửi yêu cầu, chờ chủ chấp nhận';
    }
    case 'bi_tu_choi': return d.tuChoi === 'dat_phong_khac' ? 'Chủ đã nhận đặt phòng khác cùng ngày' : 'Chủ không nhận';
    case 'het_han': return d.hetHanVi === 'qua_ngay_nhan' ? 'Đã qua ngày nhận phòng, chủ chưa trả lời' : 'Chủ chưa trả lời trong 2 tuần';
    case 'da_huy': return 'Bạn đã hủy yêu cầu';
    default: return 'Chủ đã chấp nhận';
  }
}

/** YC11.3 bước 4, YC11.3-NT9: yêu cầu mở màn kết quả theo trạng thái (S3-03, S3-05, S3-09); đặt phòng mở chi tiết (YC5.9). */
export function manKhiCham(d: Pick<DongDanhSach, 'loai'>): 'ket-qua' | 'dat-phong' {
  return d.loai === 'dat_phong' ? 'dat-phong' : 'ket-qua';
}

export const TIEU_DE_DS = 'Đặt phòng của tôi';
export const CHU_THICH_TIEU_DE = 'Thứ tự trạng thái';
export const CAU_CHU_THICH = 'Chờ chủ → Đã chốt. Chủ từ chối hoặc nhận đặt phòng khác: Bị từ chối. Quá 2 tuần: Hết hạn. Bạn tự hủy: Đã hủy.';
export const CAU_TRONG = 'Chưa có yêu cầu nào';
export const CAU_TRONG_PHU = 'Tìm phòng trống, gửi khách và đặt phòng với chủ nhà. Yêu cầu bạn gửi hiện ở đây.';
export const CHU_XEM_THEM = 'Xem thêm';
