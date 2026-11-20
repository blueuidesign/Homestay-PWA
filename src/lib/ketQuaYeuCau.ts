// Kết quả yêu cầu phía sale (YC9.4, YC9-H5, YC9 "Trạng thái yêu cầu", QD7, PQ10.SALE, PQ11.SALE): đọc jsonb của
// fn_ket_qua_yeu_cau, fn_can_tuong_tu và chữ trên S3-04, S3-04-01, S3-05, S3-09.
import { ngayThang } from './can';
import { tieuDeCan } from './chiTietCanSale';
import type { Ngay } from './ngay';
import { vietTien } from './tien';
import { docYeuCau, type TrangThaiYeuCau, type YeuCauCuaToi } from './yeuCau';

export type HetHanVi = 'qua_14_ngay' | 'qua_ngay_nhan';

export type KetQuaYeuCau = YeuCauCuaToi & { lyDoTuChoi: string | null; hetHanVi: HetHanVi | null; conXemCan: boolean };

export type CanTuongTu = {
  canId: string; maCan: string; tenToa: string | null; soPhongNgu: number | null; tenChu: string | null;
  tongGiaBan: number | null; tu: Ngay; den: Ngay;
};

type Rpc = Record<string, unknown>;
const so = (x: unknown): number | null => (x == null ? null : Number(x));
const chu = (x: unknown): string | null => (typeof x === 'string' ? x : null);

/** YC9.4: jsonb của fn_ket_qua_yeu_cau sang dạng màn dùng. */
export function docKetQua(d: Rpc): KetQuaYeuCau {
  const vi = d.het_han_vi === 'qua_14_ngay' || d.het_han_vi === 'qua_ngay_nhan' ? d.het_han_vi : null;
  return { ...docYeuCau(d), lyDoTuChoi: chu(d.ly_do_tu_choi), hetHanVi: vi, conXemCan: d.con_xem_can !== false };
}

/** YC9.4 bước 2, 4, YC9.4-NT5: một căn tương tự; không có giá chủ nhà. */
export function docCanTuongTu(d: Rpc): CanTuongTu {
  return {
    canId: String(d.can_id), maCan: String(d.ma_can ?? ''), tenToa: chu(d.ten_toa), soPhongNgu: so(d.so_phong_ngu),
    tenChu: chu(d.ten_chu), tongGiaBan: so(d.tong_gia_ban), tu: String(d.tu), den: String(d.den),
  };
}

/** Màn kết quả theo trạng thái; tuThongBao: S3-04-01 (quay lại về Thông báo). Chờ, đã hủy thì không phải màn kết quả. */
export function manKetQua(tt: TrangThaiYeuCau, tuThongBao = false): 'S3-04' | 'S3-04-01' | 'S3-05' | 'S3-09' | null {
  if (tt === 'da_chot') return tuThongBao ? 'S3-04-01' : 'S3-04';
  if (tt === 'bi_tu_choi') return 'S3-05';
  if (tt === 'het_han') return 'S3-09';
  return null;
}

/** YC9.4 bước 1: tiêu đề và câu của S3-04. */
export function chuDaChapNhan(tenChu: string, tu: Ngay, den: Ngay): { tieuDe: string; chu: string } {
  return {
    tieuDe: `${tenChu} đã chấp nhận đặt phòng`,
    chu: `Đặt phòng đã vào lịch của chủ nhà. Ngày ${ngayThang(tu)} → ${ngayThang(den)} hiện Kín với các sale khác.`,
  };
}

/** Lý do database ghi khi đêm bị đặt phòng khác lấy (YC9 "Một đêm, một bên thắng"). */
export const LY_DO_DAT_PHONG_KHAC = 'Đã nhận đặt phòng khác';

/**
 * YC9.4 bước 2, 3, YC9.4-NT2, NT3: câu lý do ở S3-05.
 * "Lý do: Chị Hoa không nhận đặt phòng · Đã có khách đặt." / "Lý do: Chị Hoa đã nhận đặt phòng khác cho 10/10 → 12/10."
 */
export function chuBiTuChoi(tenChu: string, lyDo: string | null, tu: Ngay, den: Ngay): string {
  if (lyDo === LY_DO_DAT_PHONG_KHAC) return `Lý do: ${tenChu} đã nhận đặt phòng khác cho ${ngayThang(tu)} → ${ngayThang(den)}.`;
  return lyDo ? `Lý do: ${tenChu} không nhận đặt phòng · ${lyDo}.` : `Lý do: ${tenChu} không nhận đặt phòng.`;
}

/** "14:20 ngày 22/09" theo giờ Việt Nam (UTC+7, không đổi giờ mùa hè). */
export function gioNgayGui(guiLuc: string): string {
  const t = Date.parse(guiLuc);
  if (Number.isNaN(t)) return '';
  const s = new Date(t + 7 * 3_600_000).toISOString();
  return `${s.slice(11, 16)} ngày ${s.slice(8, 10)}/${s.slice(5, 7)}`;
}

/**
 * YC9.4 bước 4, 4a, YC9.4-NT4, NT8, YC9-H5: câu ở S3-09.
 * "Yêu cầu đã hết hạn vì Chị Hoa chưa trả lời trong 2 tuần. Gửi lúc 14:20 ngày 22/09."
 * "Yêu cầu đã hết hạn vì đã qua ngày nhận phòng 10/10. Gửi lúc 14:20 ngày 06/10."
 */
export function chuHetHan(tenChu: string, vi: HetHanVi | null, ngayNhan: Ngay, guiLuc: string): string {
  const ly = vi === 'qua_ngay_nhan' ? `đã qua ngày nhận phòng ${ngayThang(ngayNhan)}` : `${tenChu} chưa trả lời trong 2 tuần`;
  const gui = gioNgayGui(guiLuc);
  return `Yêu cầu đã hết hạn vì ${ly}.` + (gui ? ` Gửi lúc ${gui}.` : '');
}

/** YC9.4 bước 2, YC7.4, canvas S3-05: thẻ căn tương tự "Sapphire 1103 · 3PN", "Bạn bán 1.600.000đ · Anh Tuấn". */
export function theTuongTu(c: CanTuongTu): { ten: string; phu: string } {
  const ban = c.tongGiaBan == null ? 'Chưa có giá' : `Bạn bán ${vietTien(c.tongGiaBan)}`;
  return { ten: tieuDeCan(c), phu: c.tenChu ? `${ban} · ${c.tenChu}` : ban };
}

export const TIEU_DE_TUONG_TU = 'Căn tương tự trống cùng ngày';
