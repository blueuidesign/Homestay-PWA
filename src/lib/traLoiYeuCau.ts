// Chủ nhà trả lời yêu cầu đặt phòng (YC9.2, YC9 "Dữ liệu", "Trạng thái yêu cầu", YC9-H4, H5, H10, PQ10.CHU, PQ11.CHU):
// đọc jsonb của fn_yeu_cau_dang_cho, fn_chu_xem_yeu_cau, fn_chap_nhan_yeu_cau, fn_tu_choi_yeu_cau và chữ trên CN1-03, CN9,
// CN9-02, CN9-03. Chỉ chép các trường màn dùng: giá bán, mức cộng, tiền chênh không bao giờ vào dữ liệu của màn.
import { ngayThang } from './can';
import { chuKhoang } from './chiTietCanSale';
import type { Ngay } from './ngay';
import type { TrangThaiYeuCau } from './yeuCau';

type Rpc = Record<string, unknown>;
const so = (x: unknown): number | null => (x == null ? null : Number(x));
const chu = (x: unknown): string | null => (typeof x === 'string' ? x : null);
const dsTen = (x: unknown): string[] => (Array.isArray(x) ? x.filter((t): t is string => typeof t === 'string') : []);
/** YC9.3 bước 1, 2, YC9 "Dữ liệu" cờ trùng: một yêu cầu chờ khác cùng căn có đêm chồng. */
export type TrungYeuCau = { yeuCauId: string; tenSale: string; ngayNhan: Ngay; ngayTra: Ngay; demTrung: Ngay[] };
/** YC9.3 bước 3: một yêu cầu bị từ chối vì đặt phòng vừa nhận (CN9-02). */
export type YeuCauTuChoiTheo = { yeuCauId: string; tenSale: string; ngayNhan: Ngay; ngayTra: Ngay };
const ds = (x: unknown): Rpc[] => (Array.isArray(x) ? x.filter((e): e is Rpc => e != null && typeof e === 'object') : []);
const docTuChoiTheo = (e: Rpc): YeuCauTuChoiTheo => ({
  yeuCauId: String(e.yeu_cau_id), tenSale: String(e.ten_sale ?? ''), ngayNhan: String(e.ngay_nhan), ngayTra: String(e.ngay_tra),
});
const docTrung = (x: unknown): TrungYeuCau[] =>
  ds(x).map((e) => ({ ...docTuChoiTheo(e), demTrung: Array.isArray(e.dem_trung) ? e.dem_trung.map(String) : [] }));
const TRANG_THAI: readonly TrangThaiYeuCau[] = ['cho', 'da_chot', 'bi_tu_choi', 'da_huy', 'het_han'];
const trangThai = (x: unknown): TrangThaiYeuCau => (TRANG_THAI.includes(x as TrangThaiYeuCau) ? (x as TrangThaiYeuCau) : 'cho');

/** YC9.2 bước 1: một dòng của khối "YÊU CẦU ĐẶT PHÒNG" ở CN1-03. */
export type DongYeuCauCho = {
  id: string; canId: string; maCan: string; tenSale: string; ngayNhan: Ngay; ngayTra: Ngay; tongGiaChu: number | null;
  guiLuc: string; trungVoi: string[]; trung?: TrungYeuCau[];
};

/** YC9.2 bước 2: một yêu cầu ở CN9. Đã hủy (YC9-H6) thì chỉ có id và trạng thái, các trường khác để trống. */
export type YeuCauChoChu = {
  id: string; canId: string; maCan: string; tenToa: string | null; saleId: string; tenSale: string; sdtSale: string | null;
  soDatPhong: number; conKetNoi: boolean; ngayNhan: Ngay; ngayTra: Ngay; tongGiaChu: number | null; loiNhan: string | null;
  trangThai: TrangThaiYeuCau; lyDoTuChoi: string | null; guiLuc: string; bookingId: string | null; trungVoi: string[];
  /** YC9.3: cảnh báo trùng ở CN9, các yêu cầu bị từ chối theo ở CN9-02. */
  trung?: TrungYeuCau[]; daTuChoiTheo?: YeuCauTuChoiTheo[];
};

/** Kết quả lệnh chấp nhận, từ chối: doiTrangThai khi yêu cầu không còn chờ lúc bấm (HV3, YC9.2-NT5, NT10). */
export type KetQuaTraLoi = { y: YeuCauChoChu; doiTrangThai: boolean };

/** YC9.2 bước 1, YC9.2-NT2: jsonb của fn_yeu_cau_dang_cho. */
export function docDongYeuCauCho(d: Rpc): DongYeuCauCho {
  return {
    id: String(d.id), canId: String(d.can_id), maCan: String(d.ma_can ?? ''), tenSale: String(d.ten_sale ?? ''),
    ngayNhan: String(d.ngay_nhan), ngayTra: String(d.ngay_tra), tongGiaChu: so(d.tong_gia_chu), guiLuc: String(d.gui_luc ?? ''),
    trungVoi: dsTen(d.trung_voi), trung: docTrung(d.trung),
  };
}

/** YC9.2 bước 2, YC9.2-NT2: jsonb của fn_chu_xem_yeu_cau (cũng là phần chính của kết quả trả lời). */
export function docYeuCauChoChu(d: Rpc): YeuCauChoChu {
  return {
    id: String(d.id), canId: String(d.can_id ?? ''), maCan: String(d.ma_can ?? ''), tenToa: chu(d.ten_toa),
    saleId: String(d.sale_id ?? ''), tenSale: String(d.ten_sale ?? ''), sdtSale: chu(d.sdt_sale), soDatPhong: so(d.so_dat_phong) ?? 0,
    conKetNoi: d.con_ket_noi !== false, ngayNhan: String(d.ngay_nhan ?? ''), ngayTra: String(d.ngay_tra ?? ''),
    tongGiaChu: so(d.tong_gia_chu), loiNhan: chu(d.loi_nhan), trangThai: trangThai(d.trang_thai), lyDoTuChoi: chu(d.ly_do_tu_choi),
    guiLuc: String(d.gui_luc ?? ''), bookingId: chu(d.booking_id), trungVoi: dsTen(d.trung_voi),
    trung: docTrung(d.trung), daTuChoiTheo: ds(d.da_tu_choi_theo).map(docTuChoiTheo),
  };
}

/** HV3, YC9.2-NT5, NT10: jsonb của fn_chap_nhan_yeu_cau, fn_tu_choi_yeu_cau. */
export function docKetQuaTraLoi(d: Rpc): KetQuaTraLoi {
  return { y: docYeuCauChoChu(d), doiTrangThai: d.doi_trang_thai === true };
}

/** CN1-03: "Yêu cầu đặt phòng · 2" (canvas viết hoa bằng CSS). */
export function tieuDeKhoiYeuCau(n: number): string {
  return `Yêu cầu đặt phòng · ${n}`;
}

/** CN1-03: "Sale Hùng đặt phòng 1509". */
export function dongChinhYeuCau(d: Pick<DongYeuCauCho, 'tenSale' | 'maCan'>): string {
  return `${d.tenSale} đặt phòng ${d.maCan}`;
}

/** CN1-03: "10 phút trước" theo giờ gửi; dưới một phút là "vừa xong". */
export function chuGuiTruoc(guiLuc: string, bay: number = Date.now()): string {
  const t = Date.parse(guiLuc);
  if (Number.isNaN(t)) return '';
  const phut = Math.max(0, Math.floor((bay - t) / 60_000));
  if (phut < 1) return 'vừa xong';
  if (phut < 60) return `${phut} phút trước`;
  const gio = Math.floor(phut / 60);
  if (gio < 24) return `${gio} giờ trước`;
  return `${Math.floor(gio / 24)} ngày trước`;
}

/** CN1-03, YC9 "Dữ liệu" cờ trùng: "17/10 → 19/10 · gửi 10 phút trước" hay "18/10 → 19/10 · trùng ngày với Sale Hùng". */
export function dongPhuYeuCau(d: Pick<DongYeuCauCho, 'ngayNhan' | 'ngayTra' | 'guiLuc' | 'trungVoi'>, bay: number = Date.now()): string {
  const ngay = `${ngayThang(d.ngayNhan)} → ${ngayThang(d.ngayTra)}`;
  if (d.trungVoi.length) return `${ngay} · trùng ngày với ${d.trungVoi.join(', ')}`;
  return `${ngay} · gửi ${chuGuiTruoc(d.guiLuc, bay)}`;
}

/** YC9.3 bước 2, YC9.3-NT1: cảnh báo ở CN9 "Trùng 18/10 với yêu cầu của Sale Lan. Chấp nhận yêu cầu này thì yêu cầu của Sale
 * Lan bị từ chối và Sale Lan được báo." Nhiều yêu cầu thì gộp đêm và tên. Không trùng thì null. */
export function cauCanhBaoTrung(trung: readonly TrungYeuCau[] | undefined): string | null {
  if (!trung?.length) return null;
  const dem = [...new Set(trung.flatMap((t) => t.demTrung))].sort().map(ngayThang).join(', ');
  const ten = [...new Set(trung.map((t) => t.tenSale))].join(', ');
  return `Trùng ${dem} với yêu cầu của ${ten}. Chấp nhận yêu cầu này thì yêu cầu của ${ten} bị từ chối và ${ten} được báo.`;
}

/** YC9.3 bước 3, YC9.3-NT2: dòng thêm ở CN9-02 "Yêu cầu của Sale Lan (18/10 → 19/10) đã bị từ chối. Sale Lan được báo." */
export function cauDaTuChoiTheo(d: YeuCauTuChoiTheo): string {
  return `Yêu cầu của ${d.tenSale} (${ngayThang(d.ngayNhan)} → ${ngayThang(d.ngayTra)}) đã bị từ chối. ${d.tenSale} được báo.`;
}

/** CN9: chữ trong vòng tròn, chữ đầu của tên riêng ("Sale Hùng" là "H"). */
export function chuCaiDau(ten: string): string {
  const t = ten.trim().split(/\s+/).pop() ?? '';
  return t.slice(0, 1).toUpperCase();
}

/** CN9: số điện thoại dạng "0912 345 678". */
export function vietSoDienThoai(s: string): string {
  const d = s.replace(/\D/g, '');
  return d.length === 10 ? `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}` : s;
}

/** CN9: "0912 345 678 · đã bán 12 đặt phòng của bạn"; không có số thì chỉ phần sau. */
export function dongSaleCN9(y: Pick<YeuCauChoChu, 'sdtSale' | 'soDatPhong'>): string {
  const ban = `đã bán ${y.soDatPhong} đặt phòng của bạn`;
  return y.sdtSale ? `${vietSoDienThoai(y.sdtSale)} · ${ban}` : ban;
}

/** CN9, CN9-02, CN9-03: "10/10 → 12/10 (2 đêm)". */
export function chuNgayO(tu: Ngay, den: Ngay): string {
  return chuKhoang(tu, den);
}

/** YC9.2 bước 4, YC9-H10: ba chip, lý do không bắt buộc. */
export const LY_DO_TU_CHOI = ['Đã có khách đặt', 'Đang sửa phòng', 'Lý do khác'] as const;
export type LyDoTuChoi = (typeof LY_DO_TU_CHOI)[number];

/** CN9-02: "Đã nhận đặt phòng 1509". */
export function cauDaNhan(maCan: string): string {
  return `Đã nhận đặt phòng ${maCan}`;
}

/** CN9-02: "Đặt phòng đã vào lịch. Sale Hùng được báo." */
export function cauDaVaoLich(tenSale: string): string {
  return `Đặt phòng đã vào lịch. ${tenSale} được báo.`;
}

/** CN9-03: "Đã từ chối yêu cầu của Sale Hùng". */
export function cauDaTuChoi(tenSale: string): string {
  return `Đã từ chối yêu cầu của ${tenSale}`;
}

/** CN9-03: "Sale Hùng được báo kèm lý do "Đã có khách đặt". Ngày 17/10 → 19/10 vẫn trống trong lịch." Không lý do thì bỏ phần lý do. */
export function cauTuChoiPhu(tenSale: string, lyDo: string | null, tu: Ngay, den: Ngay): string {
  const bao = lyDo ? `${tenSale} được báo kèm lý do "${lyDo}".` : `${tenSale} được báo.`;
  return `${bao} Ngày ${ngayThang(tu)} → ${ngayThang(den)} vẫn trống trong lịch.`;
}

/** YC9.2-NT11, YC9-H10, YC9.4 bước 2: lý do sale thấy. Không chọn lý do: "Lý do: Chị Hoa không nhận đặt phòng." */
export function cauLyDoChoSale(tenChu: string, lyDo: string | null): string {
  return lyDo ? `Lý do: ${tenChu} không nhận đặt phòng · ${lyDo}.` : `Lý do: ${tenChu} không nhận đặt phòng.`;
}

/** YC9-H4, YC9.2-NT9: câu database trả khi sale không còn kết nối. */
export const CAU_KHONG_CON_KET_NOI = 'Sale này không còn kết nối với bạn, không nhận được đặt phòng.';
/** YC9 "Trạng thái màn": bấm khi yêu cầu vừa đổi ở máy khác. */
export const CAU_DA_DOI_TRANG_THAI = 'Yêu cầu đã đổi trạng thái';
/** YC9-H5, YC9.2-NT10: CN9 của yêu cầu hết hạn. */
export const CAU_HET_HAN_CN9 = 'Yêu cầu đã hết hạn, không nhận đặt phòng được nữa.';
/** CN9 của yêu cầu đã chốt, bị từ chối mở lại từ thông báo cũ. */
export const CHU_TRANG_THAI_CN9: Record<TrangThaiYeuCau, string> = {
  cho: 'Chờ bạn', da_chot: 'Đã nhận đặt phòng', bi_tu_choi: 'Bị từ chối', da_huy: 'Sale đã hủy yêu cầu này.', het_han: CAU_HET_HAN_CN9,
};
