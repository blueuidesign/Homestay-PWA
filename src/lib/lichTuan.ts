// Phần tính của lịch tuần nhiều căn CN2 (YC2.5): khung tuần, hàng căn, ô giá, thanh đặt phòng, chip lọc, ba ô tóm tắt.
// QT2.1 (đêm có khách), QT6.1 (trạng thái tiền), YC2 Quy tắc "Tuần bắt đầu thứ hai", glossary "Viết số tiền".
import { chuPhongNgu, thuHaiCuaTuan } from './can';
import { chuNguoiDat, type DatPhongLich, type TrangThaiTien } from './lich';
import { congNgay, thuTrongTuan, type Ngay } from './ngay';
import { vietTienGon } from './tien';

/** Căn trên lịch tuần, theo thứ tự hiện (căn thêm trước đứng trước). */
export type CanTuan = { id: string; maCan: string; soPhongNgu: number | null; tenToa: string | null };

/** YC2.5 bước 17: giá chủ nhà từng đêm theo căn (fn_gia_tung_dem_cua_toi); null là đêm chưa đặt giá. */
export type GiaTuanTungDem = Record<string, Record<Ngay, number | null>>;

const THU = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

/** YC2 Quy tắc "Tuần bắt đầu thứ hai": thứ Hai của tuần chứa `ngay`. */
export function thuHaiTuan(ngay: Ngay): Ngay {
  return thuHaiCuaTuan(ngay);
}

/** YC2.5-NT1: bảy ngày từ thứ Hai `t2` tới Chủ nhật. */
export function cacNgayTuan(t2: Ngay): Ngay[] {
  return Array.from({ length: 7 }, (_, i) => congNgay(t2, i));
}

/** YC2.5 bước 18: tiêu đề cột "T4 07". */
export function tieuDeCot(ngay: Ngay): string {
  return `${THU[thuTrongTuan(ngay)]} ${ngay.slice(8, 10)}`;
}

/** YC2.5 bước 17: "05 – 11/10/2026"; vắt qua tháng "28/09 – 04/10/2026"; vắt qua năm ghi đủ năm hai đầu. */
export function tenTuan(t2: Ngay): string {
  const cn = congNgay(t2, 6);
  const [n1, t1, d1] = t2.split('-');
  const [n2, t2b, d2] = cn.split('-');
  if (n1 !== n2) return `${d1}/${t1}/${n1} – ${d2}/${t2b}/${n2}`;
  if (t1 !== t2b) return `${d1}/${t1} – ${d2}/${t2b}/${n2}`;
  return `${d1} – ${d2}/${t2b}/${n2}`;
}

/** YC2.5 bước 18: dòng phụ của hàng căn "2PN · ICON40"; phần chưa nhập thì bỏ. */
export function dongCan(c: CanTuan): string {
  const phan: string[] = [];
  if (c.soPhongNgu != null) phan.push(chuPhongNgu(c.soPhongNgu));
  if (c.tenToa?.trim()) phan.push(c.tenToa.trim());
  return phan.join(' · ');
}

/** YC2.5 bước 18, YC2.5-NT7: giá đêm rút gọn ("900k", "1,1tr"); đêm chưa đặt giá là "–". */
export function chuOGia(gia: number | null | undefined): string {
  return gia == null ? '–' : vietTienGon(gia);
}

/** YC2.5 bước 18, QT6.1: nhãn tiền trên thanh. */
export function nhanTien(tt: TrangThaiTien | null | undefined): string | null {
  if (tt === 'da_coc') return 'Đã cọc';
  if (tt === 'chua_coc') return 'Chưa cọc';
  if (tt === 'da_thanh_toan') return 'Đã thanh toán';
  return null;
}

/** Một ô của hàng căn: ô trống (giá đêm) hoặc thanh đặt phòng nối từ cột `cot` qua `soCot` cột (0 là T2). */
export type OTuan =
  | { loai: 'trong'; ngay: Ngay; cot: number; gia: number | null; chu: string }
  | { loai: 'thanh'; datPhong: DatPhongLich; cot: number; soCot: number; nguoi: string; nhan: string | null; daTra: boolean };

/** YC2.5 bước 18, QT2.1: các ô của một căn trong tuần; booking chiếm đêm nhận ≤ đêm < trả, cắt theo tuần. */
export function hangTuan(can: CanTuan, t2: Ngay, datPhong: readonly DatPhongLich[], gia: GiaTuanTungDem): OTuan[] {
  const ngay = cacNgayTuan(t2);
  const cua = datPhong.filter((b) => b.canId === can.id);
  const kq: OTuan[] = [];
  for (let i = 0; i < 7;) {
    const d = ngay[i]!;
    const bk = cua.find((x) => x.ngayNhan <= d && d < x.ngayTra);
    if (!bk) {
      const g = gia[can.id]?.[d] ?? null;
      kq.push({ loai: 'trong', ngay: d, cot: i, gia: g, chu: chuOGia(g) });
      i++;
      continue;
    }
    let j = i + 1;
    while (j < 7 && ngay[j]! < bk.ngayTra) j++;
    kq.push({
      loai: 'thanh', datPhong: bk, cot: i, soCot: j - i, nguoi: chuNguoiDat(bk.nguoiDat), nhan: nhanTien(bk.trangThaiTien),
      // Canvas CN2: "Đã cọc / đã thanh toán" thanh đậm, "Chưa cọc" thanh nhạt có viền.
      daTra: bk.trangThaiTien !== 'chua_coc',
    });
    i = j;
  }
  return kq;
}

/** Chip lọc: khoá 'tat-ca', 'toa:<tên>', 'pn:<số>'. */
export type ChipTuan = { khoa: string; chu: string };

/**
 * YC2.5 bước 21: "Tất cả", một chip cho mỗi tòa có căn (theo thứ tự căn), và một chip cho mỗi số phòng ngủ (tăng dần)
 * khi các căn có từ hai số phòng ngủ khác nhau. Căn chưa ghi tòa, chưa ghi số phòng ngủ không sinh chip.
 */
export function chipLoc(ds: readonly CanTuan[]): ChipTuan[] {
  const chip: ChipTuan[] = [{ khoa: 'tat-ca', chu: 'Tất cả' }];
  const toa: string[] = [];
  for (const c of ds) {
    const t = c.tenToa?.trim();
    if (t && !toa.includes(t)) toa.push(t);
  }
  for (const t of toa) chip.push({ khoa: `toa:${t}`, chu: t });
  const pn = [...new Set(ds.map((c) => c.soPhongNgu).filter((x): x is number => x != null))].sort((a, b) => a - b);
  if (pn.length >= 2) for (const p of pn) chip.push({ khoa: `pn:${p}`, chu: p === 0 ? 'Studio' : `${p} phòng ngủ` });
  return chip;
}

/** YC2.5 bước 21: căn khớp chip đang chọn. */
export function locCan<T extends CanTuan>(ds: readonly T[], khoa: string): T[] {
  if (khoa.startsWith('toa:')) return ds.filter((c) => c.tenToa?.trim() === khoa.slice(4));
  if (khoa.startsWith('pn:')) return ds.filter((c) => c.soPhongNgu === Number(khoa.slice(3)));
  return [...ds];
}

/**
 * YC2.5 bước 20 (YC2-H5): ba ô tóm tắt trên các căn đang hiện. "Có khách hôm nay": căn có khách hôm nay (giờ Việt Nam,
 * `coKhachHomNay` do dịch vụ đọc) trên số căn. "Trống tối T7": căn không có khách đêm thứ Bảy của tuần đang xem.
 * "Chưa cọc": đặt phòng còn hiệu lực có ít nhất một đêm trong tuần, trạng thái Chưa cọc.
 */
export function tomTatTuan(canHien: readonly CanTuan[], t2: Ngay, datPhong: readonly DatPhongLich[], coKhachHomNay: readonly string[]):
  { coKhach: string; trongT7: string; chuaCoc: string } {
  const ids = new Set(canHien.map((c) => c.id));
  const coKhach = canHien.filter((c) => coKhachHomNay.includes(c.id)).length;
  const t7 = congNgay(t2, 5);
  const trongT7 = canHien.filter((c) => !datPhong.some((b) => b.canId === c.id && b.ngayNhan <= t7 && t7 < b.ngayTra)).length;
  const den = congNgay(t2, 7);
  const chuaCoc = datPhong.filter((b) => ids.has(b.canId) && b.trangThaiTien === 'chua_coc' && b.ngayNhan < den && b.ngayTra > t2).length;
  return { coKhach: `${coKhach}/${canHien.length}`, trongT7: `${trongT7} căn`, chuaCoc: `${chuaCoc} đặt phòng` };
}
