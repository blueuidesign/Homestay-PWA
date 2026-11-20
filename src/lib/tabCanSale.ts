// Chữ và nhóm của tab Căn của sale (YC10.1, S6, S6-00, S6-07, S6-08; YC10 "Quy tắc của nhóm", QT6.4, glossary
// "Phòng ngủ và số giường"). Không bao giờ ghi số khách; căn tự nhập không có "Trống hôm nay".
import { dongThongTin, ngayThang } from './can';
import { chuDoTuoi } from './ketQuaTim';
import { chuO, tenHang } from './lichSale';
import { thuTrongTuan, type Ngay } from './ngay';

/** Một dòng fn_tab_can_sale (đã đổi tên trường). */
export type DongTabCan = {
  nhom: 'cua_toi' | 'nguon' | 'tu_nhap';
  canId: string | null; maCan: string | null; tenToa: string | null;
  soPhongNgu: number | null; soGiuong: number | null; loaiView: string | null;
  /** Căn của tôi: ngày trả của đặt phòng có đêm hôm nay; null là trống hôm nay. */
  khachDen: Ngay | null;
  ketNoiId: string | null; chuId: string | null; tenChu: string | null; chuDaXoa: boolean;
  /** YC10-H2: lần đổi lịch hay giá gần nhất của các căn chủ đó chia sẻ cho sale này. */
  capNhatLuc: string | null;
  chuCanTen: string | null;
  /** Đường dẫn ảnh đại diện có hạn; null khi chưa có. */
  anh?: string | null;
};

export type TheCanTab = { canId: string; ten: string; phu: string; anh: string | null };
export type TheCanCuaToi = TheCanTab & { tinhTrang: { co: boolean; chu: string } };
export type NhomChuNha = {
  ketNoiId: string; chuId: string; ten: string; daXoa: boolean; capNhat: string | null;
  soDienThoai?: string | null; can: TheCanTab[];
};
export type TheTuNhap = TheCanTab & { tenChuCan: string | null };
export type TabCan = { cuaToi: TheCanCuaToi[]; chuNha: NhomChuNha[]; tuNhap: TheTuNhap[] };

/** YC10.1 bước 1, S6: "Trống hôm nay ✓", "Có khách 12/10". */
export function chuTinhTrang(khachDen: Ngay | null): { co: boolean; chu: string } {
  return khachDen ? { co: true, chu: `Có khách ${ngayThang(khachDen)}` } : { co: false, chu: 'Trống hôm nay ✓' };
}

/** YC10.1 bước 2, S6: "✓ Cập nhật 2 giờ trước", "✓ Cập nhật hôm qua" (cùng cách tính với "Độ tươi lịch" của YC7). */
export function chuCapNhat(luc: string | null, bayGio: Date = new Date()): string | null {
  const s = chuDoTuoi(luc, bayGio);
  return s ? s.replace('✓ Lịch cập nhật ', '✓ Cập nhật ') : null;
}

const DANH_XUNG = new Set(['chú', 'cô', 'anh', 'chị', 'bác', 'em', 'ông', 'bà', 'dì', 'cậu', 'mợ', 'thím']);

/** Tên chủ giữa câu: "Chú Bình" thành "chú Bình"; tên không có danh xưng giữ nguyên. */
export function tenGiuaCau(ten: string): string {
  const t = ten.trim();
  const dau = t.split(/\s+/)[0]!.toLowerCase();
  return DANH_XUNG.has(dau) ? dau + t.slice(dau.length) : t;
}

/** YC10.1 bước 3, YC10.1-NT3, QT6.4: "Chú Bình · chưa dùng app · gọi hỏi lịch". */
export function phuTuNhap(tenChuCan: string | null): string {
  return `${tenChuCan?.trim() || 'Chủ căn'} · chưa dùng app · gọi hỏi lịch`;
}

/** YC10.1 bước 3: "Mời chú Bình dùng app để lịch tự cập nhật, không cần gọi hỏi." */
export function cauMoiChuCan(tenChuCan: string | null): string {
  return `Mời ${tenChuCan?.trim() ? tenGiuaCau(tenChuCan) : 'chủ căn'} dùng app để lịch tự cập nhật, không cần gọi hỏi.`;
}

/**
 * YC10.1 bước 4, pwa.md P3: tin mời chung có link mở app (https trên tên miền đang chạy app). App không tự gửi.
 * Chữ của tin: Claude tự chọn (gói việc không ghi chữ), ghi ở PR.
 */
export function tinMoiDungApp(goc: string): string {
  return `Mời anh/chị dùng Lịch phòng Hạ Long để ghi lịch phòng trống và giá. Sale xem được ngay, không cần gọi hỏi: ${goc.replace(/\/$/, '')}/`;
}

/** Chữ cái đầu của tên chủ nhà ("Chị Hoa" → "H", "Anh Tuấn" → "T"), bỏ danh xưng như canvas S6. */
export function chuCaiDau(ten: string): string {
  const phan = ten.trim().split(/\s+/);
  const ten2 = phan.length > 1 && DANH_XUNG.has(phan[0]!.toLowerCase()) ? phan.slice(1).join(' ') : phan.join(' ');
  return (ten2[0] ?? '?').toUpperCase();
}

function the(d: DongTabCan, phuCoGiuong: boolean): TheCanTab {
  const phu = dongThongTin({ soPhongNgu: d.soPhongNgu, soGiuong: phuCoGiuong ? d.soGiuong : null, loaiView: d.loaiView, tenToa: null });
  return { canId: d.canId!, ten: tenHang({ maCan: d.maCan ?? '', tenToa: d.tenToa }), phu, anh: d.anh ?? null };
}

const soSanhTen = (a: { ten: string }, b: { ten: string }) => a.ten.localeCompare(b.ten, 'vi');

/**
 * YC10.1 bước 1, 2, 3, 9, YC10.1-NT1, NT2, NT7: chia dòng của database thành ba nhóm. Chủ đã xóa tài khoản: một nhóm không
 * có căn. Thứ tự chủ nhà (Claude tự chọn, ghi ở PR): dòng đã xóa tài khoản trước (cần sale xử lý), rồi cập nhật gần nhất trước.
 */
export function chiaTabCan(dong: readonly DongTabCan[]): TabCan {
  const cuaToi: TheCanCuaToi[] = [];
  const tuNhap: TheTuNhap[] = [];
  const chu = new Map<string, NhomChuNha>();
  for (const d of dong) {
    if (d.nhom === 'cua_toi' && d.canId) {
      // S6: căn của tôi "2PN · view biển"; số giường có thì ghi như thẻ căn (YC3.1).
      cuaToi.push({ ...the(d, true), tinhTrang: chuTinhTrang(d.khachDen) });
    } else if (d.nhom === 'tu_nhap' && d.canId) {
      tuNhap.push({ ...the(d, true), phu: phuTuNhap(d.chuCanTen), tenChuCan: d.chuCanTen });
    } else if (d.nhom === 'nguon' && d.ketNoiId && d.chuId) {
      let n = chu.get(d.ketNoiId);
      if (!n) {
        n = { ketNoiId: d.ketNoiId, chuId: d.chuId, ten: d.tenChu ?? '', daXoa: d.chuDaXoa, capNhat: d.chuDaXoa ? null : d.capNhatLuc, can: [] };
        chu.set(d.ketNoiId, n);
      }
      // QD13, YC10.1-NT7: dòng đã xóa tài khoản không có căn dù dữ liệu lạ có gửi kèm.
      if (!n.daXoa && d.canId) n.can.push(the(d, true));
    }
  }
  cuaToi.sort(soSanhTen);
  tuNhap.sort(soSanhTen);
  const chuNha = [...chu.values()];
  for (const n of chuNha) n.can.sort(soSanhTen);
  chuNha.sort((a, b) => (a.daXoa !== b.daXoa ? (a.daXoa ? -1 : 1) : (b.capNhat ?? '').localeCompare(a.capNhat ?? '') || soSanhTen(a, b)));
  return { cuaToi, chuNha, tuNhap };
}

/** YC10.1 bước 9: số đếm nhóm "Chủ nhà đã kết nối" không tính dòng đã xóa tài khoản. */
export function soChuNha(t: TabCan): number {
  return t.chuNha.filter((n) => !n.daXoa).length;
}

/** YC10.1 bước 11, YC10.1-NT10: chưa có căn nào (cả ba nhóm trống, kể cả dòng chủ đã xóa tài khoản) thì S6-00. */
export function tabTrong(t: TabCan): boolean {
  return t.cuaToi.length === 0 && t.chuNha.length === 0 && t.tuNhap.length === 0;
}

/** Chi tiết căn của tôi (fn_chi_tiet_can_cua_toi); ảnh đã đổi sang đường dẫn có hạn. */
export type ChiTietCanCuaToi = {
  canId: string; maCan: string; tenToa: string | null; soPhongNgu: number | null; soGiuong: number | null; loaiView: string | null;
  anh: string[]; dem: { ngay: Ngay; o: 'kin' | 'trong'; gia: number | null }[];
};

/** YC10.1 bước 7, S6-07: tiêu đề "Green Bay 0812", dòng phụ "2PN · view biển". */
export function tenCanCuaToi(c: Pick<ChiTietCanCuaToi, 'maCan' | 'tenToa'>): string {
  return tenHang(c);
}
export function phuCanCuaToi(c: Pick<ChiTietCanCuaToi, 'soPhongNgu' | 'soGiuong' | 'loaiView'>): string {
  return dongThongTin({ soPhongNgu: c.soPhongNgu, soGiuong: c.soGiuong, loaiView: c.loaiView, tenToa: null });
}

const THU = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] as const;

/** YC10.1 bước 7, S6-07 "7 ngày tới · giá đêm của bạn": ô "Nay 07 750k", "T5 08 Kín"; chưa có giá thì "–". */
export function oBayNgay(d: ChiTietCanCuaToi['dem'][number], homNay: Ngay): { thu: string; ngay: string; chu: string; kin: boolean } {
  const kin = d.o === 'kin';
  return {
    thu: d.ngay === homNay ? 'Nay' : THU[thuTrongTuan(d.ngay)]!,
    ngay: d.ngay.slice(8, 10),
    chu: chuO(d.o, d.gia),
    kin,
  };
}
