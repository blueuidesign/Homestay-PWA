// Chữ trên thẻ căn (YC3.1 bước 10 đến 12, glossary "Phòng ngủ và số giường", GD14). Không bao giờ ghi số khách.
import { congNgay, thuTrongTuan, type Ngay } from './ngay';
import { vietTien } from './tien';

/** Một dòng của v_can_cua_toi, đã đổi ảnh đại diện sang đường dẫn có hạn (QT5.7). */
export type CanTomTat = {
  id: string;
  maCan: string;
  soPhongNgu: number | null;
  soGiuong: number | null;
  loaiView: string | null;
  tenToa: string | null;
  soAnh: number;
  /** Đường dẫn ảnh đại diện có hạn 1 giờ; null khi chưa có ảnh hay chưa xin được. */
  anhDaiDien: string | null;
  /** GD14: căn tạo trong 24 giờ qua. */
  moiThem: boolean;
  /** Ngày trả của đặt phòng có đêm hôm nay (giờ Việt Nam); null là trống hôm nay. */
  khachDen: Ngay | null;
};

/** YC3 Quy tắc "Ảnh căn": nên có ít nhất 6 ảnh. */
export const SO_ANH_NEN_CO = 6;
export const CAU_GOI_Y_ANH = 'Nên thêm ảnh: sale cần ít nhất 6 ảnh';

const TEN_VIEW: Record<string, string> = { bien: 'biển', thanh_pho: 'thành phố', nui: 'núi' };

/** YC3.4: loại view "Biển", "Thành phố", "Núi"; lưu mã hay chữ đều ghi "view biển". */
function chuView(v: string): string {
  const k = v.trim();
  return 'view ' + (TEN_VIEW[k] ?? k.toLowerCase());
}

/** Glossary: "2PN", Studio là 0 phòng ngủ. */
export function chuPhongNgu(so: number): string {
  return so === 0 ? 'Studio' : `${so}PN`;
}

/** YC3.1 bước 10, YC3.1-NT3, NT4: "2PN · 3 giường · view biển · ICON40", phần chưa nhập thì bỏ. */
export function dongThongTin(c: Pick<CanTomTat, 'soPhongNgu' | 'soGiuong' | 'loaiView' | 'tenToa'>): string {
  const phan: string[] = [];
  if (c.soPhongNgu != null) phan.push(chuPhongNgu(c.soPhongNgu));
  if (c.soGiuong != null && c.soGiuong > 0) phan.push(`${c.soGiuong} giường`);
  if (c.loaiView && c.loaiView.trim()) phan.push(chuView(c.loaiView));
  if (c.tenToa && c.tenToa.trim()) phan.push(c.tenToa.trim());
  return phan.join(' · ');
}

/** YC3.1-NT5: dưới 6 ảnh thì gợi ý thêm ảnh. */
export function canGoiYAnh(soAnh: number): boolean {
  return soAnh < SO_ANH_NEN_CO;
}

/** YC3.1 bước 10: mã căn là số phòng (chỉ chữ số) thì "Phòng 1509"; nhà mặt đất đặt mã tự do thì giữ nguyên. */
export function tenCan(maCan: string): string {
  const m = maCan.trim();
  return /^\d+$/.test(m) ? `Phòng ${m}` : m;
}

/** YC3.5 bước 35, 39: tên căn giữa câu: "Sửa phòng 1509", "Đã lưu phòng 1509"; mã tự do giữ nguyên ("Sửa Greenbay"). */
export function tenCanGiuaCau(maCan: string): string {
  const t = tenCan(maCan);
  return t.startsWith('Phòng ') ? 'phòng' + t.slice(5) : t;
}

/** "12/10" từ '2026-10-12'. */
export function ngayThang(ngay: Ngay): string {
  const [, thang, ngayTrongThang] = ngay.split('-');
  return `${ngayTrongThang}/${thang}`;
}

/** YC3.1 bước 10: tình trạng hôm nay. */
export function tinhTrangHomNay(c: Pick<CanTomTat, 'khachDen'>): { co: boolean; chu: string } {
  return c.khachDen ? { co: true, chu: `Có khách đến ${ngayThang(c.khachDen)}` } : { co: false, chu: 'Trống hôm nay ✓' };
}

/** YC4.1 bước 1: giá đêm thấp nhất, cao nhất của 7 đêm trong tuần; cả hai null khi không đêm nào có giá. */
export type GiaTuan = { thap: number | null; cao: number | null };

/** YC4.1 bước 1, YC4.1-NT2, QT5.2: "Giá tuần này 900.000đ – 1.300.000đ"; thấp bằng cao thì một số; chưa có giá thì null (YC4.1-NT1). */
export function chuGiaTuan(g: GiaTuan): string | null {
  if (g.thap === null || g.cao === null) return null;
  const a = vietTien(Math.min(g.thap, g.cao));
  const b = vietTien(Math.max(g.thap, g.cao));
  return a === b ? `Giá tuần này ${a}` : `Giá tuần này ${a} – ${b}`;
}

/** YC4.1 bước 1: thứ Hai của tuần chứa ngày đã cho (tuần từ thứ Hai tới Chủ nhật). */
export function thuHaiCuaTuan(ngay: Ngay): Ngay {
  const t = thuTrongTuan(ngay); // 0 là Chủ nhật
  return congNgay(ngay, t === 0 ? -6 : 1 - t);
}
