// Ngày nghiệp vụ theo giờ Việt Nam và các đêm của một lần ở. QT5.1, QT2.1
//
// Ngày luôn là chuỗi 'YYYY-MM-DD' (kiểu Ngay), không mang giờ, để không lệch
// múi giờ khi máy người dùng đặt giờ khác. Việt Nam là UTC+7 quanh năm, không
// đổi giờ mùa hè, nên "hôm nay" tính bằng cách cộng 7 giờ vào giờ UTC.

/** Ngày dạng 'YYYY-MM-DD'. */
export type Ngay = string;

/** Thứ trong tuần: 0 là Chủ nhật, 1 là thứ Hai, ..., 6 là thứ Bảy. */
export type Thu = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const LECH_GIO_VIET_NAM_MS = 7 * 60 * 60 * 1000;
const MOT_NGAY_MS = 24 * 60 * 60 * 1000;
const DANG_NGAY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Đêm cuối tuần mặc định: đêm thứ Sáu và thứ Bảy (QT5.1). */
export const DEM_CUOI_TUAN_MAC_DINH: readonly Thu[] = [5, 6];

// Đổi Ngay sang mốc UTC 00:00 của ngày đó; ngày sai dạng hay không có thật thì null.
function sangMocUtc(ngay: Ngay): number | null {
  const khop = DANG_NGAY.exec(ngay);
  if (!khop) return null;
  const nam = Number(khop[1]);
  const thang = Number(khop[2]);
  const ngayTrongThang = Number(khop[3]);
  const moc = Date.UTC(nam, thang - 1, ngayTrongThang);
  const d = new Date(moc);
  if (d.getUTCFullYear() !== nam || d.getUTCMonth() !== thang - 1 || d.getUTCDate() !== ngayTrongThang) {
    return null;
  }
  return moc;
}

function mocHopLe(ngay: Ngay): number {
  const moc = sangMocUtc(ngay);
  if (moc === null) throw new RangeError(`Ngày không hợp lệ: ${ngay}`);
  return moc;
}

function tuMocUtc(moc: number): Ngay {
  return new Date(moc).toISOString().slice(0, 10);
}

/** Chuỗi có đúng dạng 'YYYY-MM-DD' và là ngày có thật trên lịch. */
export function laNgay(s: string): boolean {
  return sangMocUtc(s) !== null;
}

/** Hôm nay theo giờ Việt Nam. QT5.1 */
export function homNay(bayGio: Date = new Date()): Ngay {
  return tuMocUtc(bayGio.getTime() + LECH_GIO_VIET_NAM_MS);
}

/** Cộng (hay trừ, khi soNgay âm) một số ngày. */
export function congNgay(ngay: Ngay, soNgay: number): Ngay {
  if (!Number.isInteger(soNgay)) throw new RangeError(`Số ngày phải là số nguyên: ${soNgay}`);
  return tuMocUtc(mocHopLe(ngay) + soNgay * MOT_NGAY_MS);
}

/** Số đêm từ ngày nhận tới trước ngày trả. Ngày trả phải sau ngày nhận. QT5.1, QT2.1 */
export function soDem(nhan: Ngay, tra: Ngay): number {
  const dem = Math.round((mocHopLe(tra) - mocHopLe(nhan)) / MOT_NGAY_MS);
  if (dem < 1) throw new RangeError(`Ngày trả (${tra}) phải sau ngày nhận (${nhan})`);
  return dem;
}

/** Các đêm có khách: từ ngày nhận tới trước ngày trả. QT5.1, QT2.1 */
export function cacDem(nhan: Ngay, tra: Ngay): Ngay[] {
  const n = soDem(nhan, tra);
  return Array.from({ length: n }, (_, i) => congNgay(nhan, i));
}

/** Thứ của một ngày (0 là Chủ nhật). */
export function thuTrongTuan(ngay: Ngay): Thu {
  return new Date(mocHopLe(ngay)).getUTCDay() as Thu;
}

/**
 * Đêm của ngày này có phải đêm cuối tuần không. Mặc định đêm thứ Sáu và thứ Bảy;
 * chủ nhà đổi được nhưng phải có ít nhất một đêm. QT5.1
 */
export function laDemCuoiTuan(ngay: Ngay, demCuoiTuan: readonly Thu[] = DEM_CUOI_TUAN_MAC_DINH): boolean {
  if (demCuoiTuan.length === 0) throw new RangeError('Phải chọn ít nhất một đêm cuối tuần');
  return demCuoiTuan.includes(thuTrongTuan(ngay));
}
