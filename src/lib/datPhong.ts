// Phần tính của form Thêm đặt phòng CN4 (YC5.1): ngày trả theo số đêm, đêm trống đầu tiên, kiểm trùng sớm (bước 4).
// Kiểm ở đây chỉ để báo sớm; chặn thật ở database (QD6, QT1.1, fn_tao_booking). Nháp form theo HV3.
import { docNhap, luuNhap, xoaNhap } from '../chung/nhap';
import { ngayThang } from './can';
import { chuNguoiDat, khoangNgay, type DatPhongLich } from './lich';
import { congNgay, laNgay, type Ngay } from './ngay';

/** YC5.3 Luật kiểm: một đặt phòng dài tối đa 365 đêm. */
export const SO_DEM_TOI_DA = 365;
export const CAU_NGAY_TRA = 'Ngày trả phải sau ngày nhận';
export const CAU_QUA_DAI = 'Một đặt phòng dài tối đa 365 đêm';

/** YC5.1 bước 3: chip "1 đêm", "2 đêm", "3 đêm" hay "Tùy chọn". */
export type ChipDem = 1 | 2 | 3 | 'tuy-chon';

/** YC5.1-NT3: ngày trả = ngày nhận cộng số đêm. */
export function ngayTraTheoSoDem(nhan: Ngay, soDem: number): Ngay {
  return congNgay(nhan, soDem);
}

/** Số đêm giữa hai ngày (âm hay 0 khi ngày trả không sau ngày nhận); null khi ngày sai dạng. */
export function soDemGiua(nhan: Ngay, tra: Ngay): number | null {
  if (!laNgay(nhan) || !laNgay(tra)) return null;
  return Math.round((Date.parse(tra + 'T00:00:00Z') - Date.parse(nhan + 'T00:00:00Z')) / 86400000);
}

/** YC5.1 bước 3: đổi ngày trả bằng tay thì chip tương ứng tự sáng (1, 2, 3) hoặc "Tùy chọn". */
export function chipCuaSoDem(soDem: number | null): ChipDem {
  return soDem === 1 || soDem === 2 || soDem === 3 ? soDem : 'tuy-chon';
}

/** QT2.1: đặt phòng chiếm đêm `dem` khi nhận ≤ dem < trả. */
const chiemDem = (b: DatPhongLich, dem: Ngay) => b.ngayNhan <= dem && dem < b.ngayTra;

/** YC5.1 bước 1a, YC5.1-NT4: đêm trống đầu tiên của căn tính từ `tu` (hôm nay), theo các đặt phòng chưa hủy đã đọc. */
export function demTrongDauTien(ds: readonly DatPhongLich[], canId: string, tu: Ngay): Ngay {
  const cua = ds.filter((b) => b.canId === canId);
  let dem = tu;
  // Mỗi vòng nhảy tới ngày trả của đặt phòng đang chiếm đêm đó, nên dừng sau tối đa số đặt phòng của căn.
  for (let i = 0; i <= cua.length; i++) {
    const chiem = cua.find((b) => chiemDem(b, dem));
    if (!chiem) return dem;
    dem = chiem.ngayTra;
  }
  return dem;
}

/** Kết quả dòng kiểm dưới ô ngày (YC5.1 bước 4). 'chua-du': ngày chưa đủ để kiểm. */
export type KetQuaKiem = { loai: 'chua-du' | 'loi' | 'khong-trung' | 'trung'; chu: string };

/**
 * YC5.1 bước 4, YC5.1-NT1, NT2, QT1.1, QT2.1: so các đêm đã chọn với đặt phòng chưa hủy của cùng căn đã đọc.
 * Trùng nhiều đặt phòng thì nêu đặt phòng có đêm trùng sớm nhất, kèm "và N đặt phòng khác".
 * Ngày trả không sau ngày nhận, quá 365 đêm thì câu của Luật kiểm YC5.3 (YC5.1-NT6, app chặn trước).
 */
export function kiemNgay(ds: readonly DatPhongLich[], canId: string, nhan: Ngay, tra: Ngay): KetQuaKiem {
  const n = soDemGiua(nhan, tra);
  if (n === null) return { loai: 'chua-du', chu: '' };
  if (n < 1) return { loai: 'loi', chu: CAU_NGAY_TRA };
  if (n > SO_DEM_TOI_DA) return { loai: 'loi', chu: CAU_QUA_DAI };
  const trung = ds
    .filter((b) => b.canId === canId && b.ngayNhan < tra && nhan < b.ngayTra)
    .map((b) => ({ b, dem: b.ngayNhan > nhan ? b.ngayNhan : nhan }))
    .sort((x, y) => (x.dem < y.dem ? -1 : x.dem > y.dem ? 1 : x.b.ngayNhan < y.b.ngayNhan ? -1 : 1));
  if (!trung.length) return { loai: 'khong-trung', chu: `✓ ${khoangNgay(nhan, tra)} · không trùng lịch` };
  const { b, dem } = trung[0]!;
  const them = trung.length > 1 ? ` và ${trung.length - 1} đặt phòng khác` : '';
  return {
    loai: 'trung',
    chu: `Trùng đêm ${ngayThang(dem)} với đặt phòng của ${chuNguoiDat(b.nguoiDat)} (${ngayThang(b.ngayNhan)} → ${ngayThang(b.ngayTra)})${them}`,
  };
}

// HV3 bước 1, 3, 5, HV3-NT1, HV3-NT4: nháp CN4 trên localStorage (bọc try/catch trong chung/nhap), giữ 7 ngày (HV3-H1).
// Giữ cả mã lần gửi để bấm lại sau khi mở lại vẫn là cùng một lần gửi (QT5.6).
const KHOA_NHAP = 'datPhong';
export const GIU_NHAP_DAT_PHONG_MS = 7 * 24 * 60 * 60 * 1000;
export type BanNhapDatPhong = { canId: string; ngayNhan: Ngay; ngayTra: Ngay; tuyChon: boolean; clientId: string };

export function ghiBanNhapDatPhong(b: BanNhapDatPhong, bay = Date.now()): void {
  luuNhap(KHOA_NHAP, b, bay);
}

export function docBanNhapDatPhong(bay = Date.now()): BanNhapDatPhong | null {
  const b = docNhap<Partial<BanNhapDatPhong>>(KHOA_NHAP, bay, GIU_NHAP_DAT_PHONG_MS);
  if (!b || typeof b !== 'object') return null;
  const chu = (v: unknown) => (typeof v === 'string' ? v : '');
  if (!chu(b.canId) || !laNgay(chu(b.ngayNhan)) || !laNgay(chu(b.ngayTra))) return null;
  return { canId: chu(b.canId), ngayNhan: chu(b.ngayNhan), ngayTra: chu(b.ngayTra), tuyChon: b.tuyChon === true, clientId: chu(b.clientId) };
}

/** HV3 bước 5, HV3-NT4: lưu xong hay bỏ form thì xóa nháp. */
export function xoaBanNhapDatPhong(): void {
  xoaNhap(KHOA_NHAP);
}
