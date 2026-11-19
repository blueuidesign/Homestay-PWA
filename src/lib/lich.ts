// Phần tính của lịch tháng chủ nhà (YC2.1, QT2, YC2 Quy tắc "Màu theo căn", "Tuần bắt đầu thứ hai")
// và chi tiết một ngày (YC2.2, QT6.1).
import { congNgay, soDem, type Ngay } from './ngay';
import { vietTien } from './tien';

/** QT6.1: trạng thái tiền của đặt phòng; null khi không có (đặt phòng sale tự ghi cho căn tự nhập). */
export type TrangThaiTien = 'chua_coc' | 'da_coc' | 'da_thanh_toan';

/**
 * YC2.2 bước 8: người đặt. Sale đứng tên (tên, số qua v_nguoi_ket_noi; null khi không còn kết nối),
 * khách chủ nhà nhập có tên (booking_rieng của chính chủ nhà, QD11), hoặc khách lẻ.
 */
export type NguoiDat = { loai: 'sale'; ten: string | null; sdt: string | null } | { loai: 'khach'; ten: string } | { loai: 'le' };

/**
 * Một booking chưa hủy của căn chủ nhà. Phần lịch (YC2.1) luôn có; phần chi tiết ngày (YC2.2: tiền, người đặt,
 * ghi chú) có khi dịch vụ đọc được.
 */
export type DatPhongLich = {
  id: string; canId: string; ngayNhan: Ngay; ngayTra: Ngay;
  tienPhong?: number; tienCoc?: number | null; trangThaiTien?: TrangThaiTien | null; nguoiDat?: NguoiDat; ghiChu?: string | null;
};

/** Căn trên lịch, theo thứ tự hiện (căn thêm trước đứng trước). */
export type CanLich = { id: string; maCan: string };

/**
 * YC2 Quy tắc "Màu theo căn": ba màu đầu theo canvas (1509, 3402, 2501); từ căn thứ 4 dùng tiếp các màu sau
 * (Claude tự chọn, cùng bảng Tailwind 500, khác hẳn màu hành động).
 */
const MAU: readonly string[] = ['#0ea5e9', '#f97316', '#8b5cf6', '#ec4899', '#eab308', '#14b8a6', '#6366f1', '#84cc16', '#ef4444', '#64748b'];

export function mauCan(thuTu: number): string {
  return MAU[((thuTu % MAU.length) + MAU.length) % MAU.length]!;
}

/** YC2.1 bước 3: chip đầu "Cả 2 phòng" khi 2 căn, "Tất cả" khi từ 3 căn; 1 căn thì không có hàng chip (null). */
export function chuChipTatCa(soCan: number): string | null {
  if (soCan < 2) return null;
  return soCan === 2 ? 'Cả 2 phòng' : 'Tất cả';
}

/** YC2.1 bước 1: "Tháng 10/2026". */
export function tenThang(nam: number, thang: number): string {
  return `Tháng ${thang}/${nam}`;
}

/** Khoảng đọc của một tháng: đêm từ `tu` tới trước `den` (ngày 1 tháng sau). */
export function khoangThang(nam: number, thang: number): { tu: Ngay; den: Ngay } {
  const p = (n: number, t: number) => `${n}-${String(t).padStart(2, '0')}-01`;
  return { tu: p(nam, thang), den: thang === 12 ? p(nam + 1, 1) : p(nam, thang + 1) };
}

/**
 * QT2.1, QT2.2: mỗi đêm trong tháng có khách ở căn nào. Booking chiếm đêm từ ngày nhận tới trước ngày trả;
 * đêm thuộc tháng của chính nó. Danh sách vào chỉ có booking chưa hủy (database lọc).
 */
export function demTheoCan(ds: readonly DatPhongLich[], nam: number, thang: number): Map<Ngay, Set<string>> {
  const { tu, den } = khoangThang(nam, thang);
  const kq = new Map<Ngay, Set<string>>();
  for (const b of ds) {
    let d = b.ngayNhan < tu ? tu : b.ngayNhan;
    const het = b.ngayTra < den ? b.ngayTra : den;
    while (d < het) {
      let s = kq.get(d);
      if (!s) kq.set(d, (s = new Set()));
      s.add(b.canId);
      d = congNgay(d, 1);
    }
  }
  return kq;
}

/** YC2.1 bước 2, 3: căn có khách đêm `ngay`; đang lọc một căn thì chỉ căn đó. */
export function canCoKhach(m: Map<Ngay, Set<string>>, ngay: Ngay, canLoc: string | null): string[] {
  const s = m.get(ngay);
  if (!s) return [];
  return canLoc ? (s.has(canLoc) ? [canLoc] : []) : [...s];
}

/** Nhãn ô ngày cho trình đọc màn hình (theo canvas CN1): "Ngày 5, đã đặt phòng 1509, 3402", "Ngày 1, trống". */
export function nhanO(ngayTrongThang: number, maCan: readonly string[]): string {
  return maCan.length ? `Ngày ${ngayTrongThang}, đã đặt phòng ${maCan.join(', ')}` : `Ngày ${ngayTrongThang}, trống`;
}

/** "10/10" từ '2026-10-10'. */
const ngayThangNgan = (ngay: Ngay) => `${ngay.slice(8, 10)}/${ngay.slice(5, 7)}`;

/** YC2.2 bước 7: "Ngày 10/10/2026". */
export function tieuDeNgay(ngay: Ngay): string {
  return `Ngày ${ngayThangNgan(ngay)}/${ngay.slice(0, 4)}`;
}

/** YC2.2 bước 8, QT2.1: "10/10 → 12/10 (2 đêm)"; số đêm từ ngày nhận tới trước ngày trả. */
export function khoangNgay(nhan: Ngay, tra: Ngay): string {
  return `${ngayThangNgan(nhan)} → ${ngayThangNgan(tra)} (${soDem(nhan, tra)} đêm)`;
}

/** YC2.2 bước 8, QT6.1: "2.200.000đ · Cọc: 1.000.000đ", "… · Chưa cọc", "… · Đã thanh toán". */
export function chuTien(tienPhong: number, trangThai: TrangThaiTien | null | undefined, tienCoc: number | null | undefined): string {
  const tien = vietTien(tienPhong);
  if (trangThai === 'da_coc') return `${tien} · Cọc: ${vietTien(tienCoc ?? 0)}`;
  if (trangThai === 'chua_coc') return `${tien} · Chưa cọc`;
  if (trangThai === 'da_thanh_toan') return `${tien} · Đã thanh toán`;
  return tien;
}

/** YC2.2 bước 8: tên sale, tên khách chủ nhà nhập, hoặc "Khách lẻ". Sale không còn kết nối (không đọc được tên) thì "Sale". */
export function chuNguoiDat(n: NguoiDat | undefined): string {
  if (!n || n.loai === 'le') return 'Khách lẻ';
  if (n.loai === 'khach') return n.ten;
  return n.ten ?? 'Sale';
}

/** YC2.2 bước 8 (canvas CN3): số 10 chữ số viết "0912 345 678"; số khác giữ nguyên. */
export function vietSoDienThoai(so: string): string {
  const m = /^(\d{4})(\d{3})(\d{3})$/.exec(so);
  return m ? `${m[1]} ${m[2]} ${m[3]}` : so;
}

/** Một dòng của chi tiết ngày: căn và booking có khách đêm đó (null là trống). */
export type DongNgay = { can: CanLich; datPhong: DatPhongLich | null };

/** YC2.2 bước 7, 8, 10, QT2.1: mỗi căn đang hiện (theo chip) một dòng; booking chiếm đêm `ngay` nếu nhận ≤ ngay < trả. */
export function dongCuaNgay(ds: readonly DatPhongLich[], canHien: readonly CanLich[], ngay: Ngay): DongNgay[] {
  return canHien.map((can) => ({
    can,
    datPhong: ds.find((b) => b.canId === can.id && b.ngayNhan <= ngay && ngay < b.ngayTra) ?? null,
  }));
}

/** YC2.3: doanh thu tháng của chủ nhà (fn_doanh_thu_thang); tiền là số nguyên đồng, số đêm đếm từng đêm của từng căn. */
export type DoanhThuThang = { doanhThu: number; soDem: number; thangTruoc: number };

/** YC2.3 bước 11: "Doanh thu tháng 10". */
export function tieuDeDoanhThu(thang: number): string {
  return `Doanh thu tháng ${thang}`;
}

/**
 * YC2.3 bước 11: dòng nhỏ "13 đêm có khách · tháng 9: 9.600.000đ"; tháng trước không có doanh thu thì chỉ
 * "13 đêm có khách". Tháng 1 thì tháng trước là tháng 12.
 */
export function dongDoanhThu(dt: DoanhThuThang, thang: number): string {
  const dem = `${dt.soDem} đêm có khách`;
  if (dt.thangTruoc <= 0) return dem;
  return `${dem} · tháng ${thang === 1 ? 12 : thang - 1}: ${vietTien(dt.thangTruoc)}`;
}

/** YC2.3 bước 13: tháng không có đêm có khách nào thì không hiện khối doanh thu. */
export function coKhoiDoanhThu(dt: DoanhThuThang | null | undefined): dt is DoanhThuThang {
  return !!dt && dt.soDem > 0;
}
