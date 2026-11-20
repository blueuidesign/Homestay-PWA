// Yêu cầu đặt phòng phía sale (YC9.1, YC9 "Dữ liệu", "Trạng thái yêu cầu", YC9-H6, H8, QD11, pwa.md P5): đọc jsonb của
// fn_yeu_cau_cua_toi, fn_chu_xem_yeu_cau và chữ trên S3-02, S3-03, S3-07, S3-08.
import { ngayThang } from './can';
import { chuKhoang } from './chiTietCanSale';
import { congNgay, type Ngay } from './ngay';
import { vietTien, vietTienGon } from './tien';

export type TrangThaiYeuCau = 'cho' | 'da_chot' | 'bi_tu_choi' | 'da_huy' | 'het_han';

export type YeuCauCuaToi = {
  id: string; canId: string; maCan: string; tenToa: string | null; soPhongNgu: number | null;
  chu: { ten: string; soDienThoai: string | null; daXoa: boolean };
  ngayNhan: Ngay; ngayTra: Ngay; tongGiaChu: number | null; tongGiaBan: number | null; loiNhan: string | null;
  trangThai: TrangThaiYeuCau; guiLuc: string;
};

type Rpc = Record<string, unknown>;
const so = (x: unknown): number | null => (x == null ? null : Number(x));
const chu = (x: unknown): string | null => (typeof x === 'string' ? x : null);
const TRANG_THAI: readonly TrangThaiYeuCau[] = ['cho', 'da_chot', 'bi_tu_choi', 'da_huy', 'het_han'];

/** YC9 "Dữ liệu": jsonb của fn_yeu_cau_cua_toi (cũng là kết quả gửi, hủy) sang dạng màn dùng. */
export function docYeuCau(d: Rpc): YeuCauCuaToi {
  const c = (d.chu ?? {}) as Rpc;
  const tt = TRANG_THAI.includes(d.trang_thai as TrangThaiYeuCau) ? (d.trang_thai as TrangThaiYeuCau) : 'cho';
  return {
    id: String(d.id), canId: String(d.can_id), maCan: String(d.ma_can ?? ''), tenToa: chu(d.ten_toa), soPhongNgu: so(d.so_phong_ngu),
    chu: { ten: String(c.ten ?? ''), soDienThoai: chu(c.so_dien_thoai), daXoa: c.da_xoa === true },
    ngayNhan: String(d.ngay_nhan), ngayTra: String(d.ngay_tra), tongGiaChu: so(d.tong_gia_chu), tongGiaBan: so(d.tong_gia_ban),
    loiNhan: chu(d.loi_nhan), trangThai: tt, guiLuc: String(d.gui_luc ?? ''),
  };
}

/** YC9.1 bước 1: "Chị Hoa · 10/10 → 12/10 (2 đêm)". */
export function chuDongChu(tenChu: string, tu: Ngay, den: Ngay): string {
  return `${tenChu} · ${chuKhoang(tu, den)}`;
}

/** S3-02: "ICON40 1509 · 10/10 → 12/10". */
export function chuTomTat(c: { tenToa: string | null; maCan: string }, tu: Ngay, den: Ngay): string {
  return `${[c.tenToa, c.maCan].filter(Boolean).join(' ')} · ${ngayThang(tu)} → ${ngayThang(den)}`;
}

/** S3-02: "Chủ nhà: Chị Hoa · 2.200.000đ". */
export function chuChuNhaGia(tenChu: string, tongGiaChu: number | null): string {
  return tongGiaChu == null ? `Chủ nhà: ${tenChu}` : `Chủ nhà: ${tenChu} · ${vietTien(tongGiaChu)}`;
}

export const CAU_GHI_S302 = 'Chủ nhà nhận yêu cầu trong app. Thành đặt phòng khi chủ nhà chấp nhận.';

/** YC9.1 bước 3: "Đang chờ Chị Hoa chấp nhận". */
export function chuChoChu(tenChu: string): string {
  return `Đang chờ ${tenChu} chấp nhận`;
}

/** YC9.1-NT1, bước 3: giờ đã gửi theo giờ Việt Nam (UTC+7, không đổi giờ mùa hè). */
export function chuDaGuiLuc(guiLuc: string): string {
  const t = Date.parse(guiLuc);
  const gio = Number.isNaN(t) ? '' : new Date(t + 7 * 3_600_000).toISOString().slice(11, 16);
  return `Đã gửi lúc ${gio} trong app. Nhắn thêm qua Zalo để chủ nhà thấy nhanh hơn. Bạn được báo khi chủ nhà chấp nhận hoặc từ chối.`;
}

/** YC9.1 bước 3, pwa.md P5, YC9-H8: "Nhắn chủ nhà qua Zalo" mở https://zalo.me/<số>; không có số thì không có nút. */
export function duongDanZalo(so: string | null): string | null {
  const s = (so ?? '').replace(/[^\d]/g, '');
  return s ? `https://zalo.me/${s}` : null;
}

export const CAU_DA_DAT = 'Căn này đã được đặt rồi';

/** YC9.1 bước 3a: "Đêm 10/10 và 11/10 vừa có người đặt. Yêu cầu chưa được gửi." */
export function chuDemKin(dem: readonly Ngay[]): string {
  if (!dem.length) return 'Yêu cầu chưa được gửi.';
  const n = dem.map(ngayThang);
  const ds = n.length === 1 ? n.join('') : `${n.slice(0, -1).join(', ')} và ${n.slice(-1).join('')}`;
  return `Đêm ${ds} vừa có người đặt. Yêu cầu chưa được gửi.`;
}

const THU = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] as const;
export type OQuanh = { ngay: Ngay; thu: string; so: string; chu: string; kin: boolean };

/** YC9.1 bước 3a, S3-07: lịch tải lại từ ngày trước ngày nhận tới ngày trả; đêm kín "Kín", còn lại giá chủ gọn. */
export function oQuanhKhoang(lich: readonly { ngay: Ngay; o: 'kin' | 'trong' }[], dem: readonly { ngay: Ngay; giaChu: number | null }[],
                             tu: Ngay, den: Ngay): OQuanh[] {
  const ra: OQuanh[] = [];
  for (let d = congNgay(tu, -1); d <= den; d = congNgay(d, 1)) {
    const kin = lich.find((l) => l.ngay === d)?.o === 'kin';
    const gia = dem.find((x) => x.ngay === d)?.giaChu ?? null;
    ra.push({ ngay: d, thu: THU[new Date(`${d}T00:00:00Z`).getUTCDay()] ?? '', so: d.slice(8, 10), kin, chu: kin ? 'Kín' : gia == null ? '' : vietTienGon(gia) });
  }
  return ra;
}

export const DO_DAI_LOI_NHAN = 500;

/** YC9.1 Luật kiểm "Lời nhắn": tối đa 500 ký tự. */
export function kiemLoiNhan(s: string): string | null {
  return [...s.trim()].length > DO_DAI_LOI_NHAN ? 'Lời nhắn tối đa 500 ký tự' : null;
}

/** YC9.1 Luật kiểm: toàn khoảng trắng coi như trống. */
export function loiNhanGui(s: string): string | null {
  return s.trim() || null;
}

/** YC9.1 bước 4, S3-08. */
export function chuDaHuy(tenChu: string, tu: Ngay, den: Ngay): string {
  return `Bạn đã hủy yêu cầu đặt phòng ${ngayThang(tu)} → ${ngayThang(den)}. ${tenChu} không còn thấy yêu cầu này.`;
}

export const CAU_DA_HUY_CN9 = 'Sale đã hủy yêu cầu này.';

/** YC9.1-NT13, YC9-H6: chủ nhà mở yêu cầu từ thông báo (CN9). Đã hủy: chỉ một câu, không mang ngày, giá, lời nhắn. */
export function docChuXem(d: Rpc): { id: string; daHuy: boolean; chu: string | null } {
  const daHuy = d.trang_thai === 'da_huy';
  return { id: String(d.id), daHuy, chu: daHuy ? CAU_DA_HUY_CN9 : null };
}
