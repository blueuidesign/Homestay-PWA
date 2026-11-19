// Giá chủ nhà theo tháng của một căn: khoảng giá ô tháng, chữ tháng đã chọn, tên hai ô giá, luật kiểm giá. YC4.2, QT5.3, QT5.1
import { congNgay, laDemCuoiTuan, thuTrongTuan, type Ngay, type Thu } from './ngay';
import { vietKhoangGia } from './tien';

/** Giá một tháng: ngày thường và cuối tuần (YC4 Quy tắc "Giá hai loại đêm"). */
export type GiaThang = { thuong: number; cuoiTuan: number };

/** Một dải giá ngày lễ hay dịp đặc biệt của căn (YC4.3). */
export type DipGia = { id: string; tuNgay: Ngay; denNgay: Ngay; ten: string | null; gia: number; laNgayLe: boolean };

/** Một đêm của lịch giá (fn_lich_gia_thang). gia null là chưa có giá (QT5.3 bước 4). */
export type DemGia = { dem: Ngay; gia: number | null; loai: 'thuong' | 'cuoi_tuan' | 'ngay_le' | 'dip'; coKhach: boolean };

/** YC4.2 Luật kiểm: giá mỗi đêm tối đa 100.000.000đ. */
export const GIA_TOI_DA = 100_000_000;
export const CAU_CAN_NHAP_GIA = 'Cần nhập giá ngày thường và giá cuối tuần';
export const CAU_GIA_LON_HON_0 = 'Giá phải lớn hơn 0';
export const CAU_GIA_TOI_DA = 'Giá mỗi đêm tối đa 100.000.000đ';
export const CAU_CHUA_CHON_THANG = 'Chưa chọn tháng nào. Chọn một tháng bên trên sau đó nhập giá.';
export const CAU_CHUA_CO_GIA = 'Căn này chưa có giá. Chọn tháng, nhập giá ngày thường và cuối tuần rồi bấm Áp dụng. Sale chỉ thấy giá sau khi bạn đặt.';

/** Thứ theo cách của database (isodow): 1 là T2, ..., 6 là T7, 7 là CN. */
export type ThuIso = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export const DEM_CUOI_TUAN_MAC_DINH_ISO: readonly ThuIso[] = [5, 6];
const TEN_THU: Record<ThuIso, string> = { 1: 'T2', 2: 'T3', 3: 'T4', 4: 'T5', 5: 'T6', 6: 'T7', 7: 'CN' };

/** Đổi isodow (database) sang Thu của ngay.ts (0 là Chủ nhật). */
export function sangThu(ds: readonly number[]): Thu[] {
  return ds.map((d) => (d % 7) as Thu);
}

// Các đoạn liền nhau theo vòng tuần; đoạn bắt đầu ngay sau một ngày không thuộc tập.
function doanLien(tap: ThuIso[]): ThuIso[][] {
  if (tap.length === 0) return [];
  if (tap.length === 7) return [[1, 2, 3, 4, 5, 6, 7]];
  const co = new Set(tap);
  const truoc = (d: number) => (d === 1 ? 7 : d - 1) as ThuIso;
  const sau = (d: number) => (d === 7 ? 1 : d + 1) as ThuIso;
  // Bắt đầu đọc từ T2; đoạn vắt qua CN sang T2 thì đọc từ đầu đoạn (vd CN–T5).
  const dau = ([1, 2, 3, 4, 5, 6, 7] as ThuIso[]).filter((d) => co.has(d) && !co.has(truoc(d)));
  return dau.map((d) => {
    const doan: ThuIso[] = [d];
    let x = sau(d);
    while (co.has(x)) { doan.push(x); x = sau(x); }
    return doan;
  }).sort((a, b) => (a[0] === 7 ? 0 : a[0]!) - (b[0] === 7 ? 0 : b[0]!));
}

function chuCacThu(tap: ThuIso[]): string {
  return doanLien(tap).map((d) => (d.length >= 3 ? `${TEN_THU[d[0]!]}–${TEN_THU[d[d.length - 1]!]}` : d.map((x) => TEN_THU[x]).join(', '))).join(', ');
}

/** YC4.2 bước 3: tên hai ô giá theo đêm cuối tuần của chủ nhà (YC4.6). Mặc định "Ngày thường (CN–T5)", "Cuối tuần (T6, T7)". */
export function tenOGia(demCuoiTuan: readonly number[] = DEM_CUOI_TUAN_MAC_DINH_ISO): { thuong: string; cuoiTuan: string } {
  const cuoi = ([1, 2, 3, 4, 5, 6, 7] as ThuIso[]).filter((d) => demCuoiTuan.includes(d));
  const thuong = ([1, 2, 3, 4, 5, 6, 7] as ThuIso[]).filter((d) => !demCuoiTuan.includes(d));
  return {
    thuong: thuong.length ? `Ngày thường (${chuCacThu(thuong)})` : 'Ngày thường',
    cuoiTuan: `Cuối tuần (${chuCacThu(cuoi)})`,
  };
}

/** YC4.2 bước 2, 4: "Tháng 11 – 12", "Tháng 11", tháng rời nhau "Tháng 1, 3 – 5". */
export function chuThang(ds: readonly number[]): string {
  const t = [...new Set(ds)].sort((a, b) => a - b);
  const doan: string[] = [];
  for (let i = 0; i < t.length;) {
    let j = i;
    while (j + 1 < t.length && t[j + 1] === t[j]! + 1) j++;
    doan.push(j > i ? `${t[i]} – ${t[j]}` : `${t[i]}`);
    i = j + 1;
  }
  return doan.length ? `Tháng ${doan.join(', ')}` : '';
}

/** YC4.2 bước 2: dòng "Đang chọn: Tháng 11 – 12 (2 tháng)"; chưa chọn thì câu nhắc. */
export function dongDangChon(ds: readonly number[]): string {
  const n = new Set(ds).size;
  return n ? `Đang chọn: ${chuThang(ds)} (${n} tháng)` : CAU_CHUA_CHON_THANG;
}

/** Ngày đầu tháng 'YYYY-MM-01'. */
export function dauThang(nam: number, thang: number): Ngay {
  return `${nam}-${String(thang).padStart(2, '0')}-01`;
}

/** Các đêm của một tháng. */
export function cacDemCuaThang(nam: number, thang: number): Ngay[] {
  const dau = dauThang(nam, thang);
  const n = new Date(Date.UTC(nam, thang, 0)).getUTCDate();
  return Array.from({ length: n }, (_, i) => congNgay(dau, i));
}

/** QT5.3: giá chủ nhà một đêm của căn có lịch: giá dịp trước, rồi giá tháng; không có thì null. */
export function giaDem(dem: Ngay, giaThang: GiaThang | null | undefined, dip: readonly DipGia[], demCuoiTuan: readonly number[]): number | null {
  const d = dip.find((x) => x.tuNgay <= dem && dem <= x.denNgay);
  if (d) return d.gia;
  if (!giaThang) return null;
  return laDemCuoiTuan(dem, sangThu(demCuoiTuan)) ? giaThang.cuoiTuan : giaThang.thuong;
}

/**
 * YC4.2 bước 1, YC4.2-NT1: chữ ô tháng. Tháng chưa đặt giá thì "Chưa đặt"; có thì khoảng giá thấp nhất – cao nhất
 * của các đêm trong tháng (giá dịp tính vào, như canvas CN6 "800k–1,3tr" ở tháng 10).
 */
export function chuOThang(nam: number, thang: number, giaThang: GiaThang | null | undefined, dip: readonly DipGia[], demCuoiTuan: readonly number[]): string {
  if (!giaThang) return 'Chưa đặt';
  const gia = cacDemCuaThang(nam, thang).map((d) => giaDem(d, giaThang, dip, demCuoiTuan)).filter((g): g is number => g !== null);
  return vietKhoangGia(Math.min(...gia), Math.max(...gia));
}

/** Đọc số tiền người dùng gõ: bỏ dấu chấm, khoảng trắng. Trống thì null, có chữ khác số thì NaN. */
export function docSoTien(chu: string): number | null {
  const s = chu.replace(/[.\s,đ]/g, '');
  if (s === '') return null;
  return /^\d+$/.test(s) ? Number(s) : Number.NaN;
}

/** Viết lại ô giá khi gõ: "800000" thành "800.000". */
export function dinhDangOGia(chu: string): string {
  const s = chu.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** YC4.2 Luật kiểm của hai ô giá. Trả câu lỗi theo bảng, hoặc null khi hợp lệ. */
export function kiemGia(thuong: string, cuoiTuan: string): string | null {
  const a = docSoTien(thuong);
  const b = docSoTien(cuoiTuan);
  if (a === null || b === null) return CAU_CAN_NHAP_GIA;
  if (Number.isNaN(a) || Number.isNaN(b) || a <= 0 || b <= 0) return CAU_GIA_LON_HON_0;
  if (a > GIA_TOI_DA || b > GIA_TOI_DA) return CAU_GIA_TOI_DA;
  return null;
}

/** YC4.2 bước 6: số ô trống đầu lưới (tuần bắt đầu thứ Hai). */
export function soOTrongDau(nam: number, thang: number): number {
  const t = thuTrongTuan(dauThang(nam, thang)); // 0 là CN
  return (t + 6) % 7;
}

/** "T09", "T11": tên tháng ngắn trên nút chuyển tháng. */
export function tenThangNgan(thang: number): string {
  return `T${String(thang).padStart(2, '0')}`;
}

/** Chuyển tháng: trả [năm, tháng] sau khi cộng buoc tháng. */
export function congThang(nam: number, thang: number, buoc: number): [number, number] {
  const n = nam * 12 + (thang - 1) + buoc;
  return [Math.floor(n / 12), (n % 12) + 1];
}

/** "30/04 – 01/05" cho dải giá dịp; một ngày thì một ngày. */
export function chuDai(tu: Ngay, den: Ngay): string {
  const f = (d: Ngay) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;
  return tu === den ? f(tu) : `${f(tu)} – ${f(den)}`;
}

/** YC4 Quy tắc "Tên dịp tự đặt": bỏ trống tên thì "Dịp đặc biệt <ngày đầu> – <ngày cuối>". */
export function tenDip(d: DipGia): string {
  const ten = d.ten?.trim();
  return ten ? ten : `Dịp đặc biệt ${chuDai(d.tuNgay, d.denNgay)}`;
}
