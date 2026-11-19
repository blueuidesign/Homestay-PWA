// Tìm phòng trống theo ngày (YC7.2, US44): điều kiện tìm, nút đáy, dòng "Tìm gần đây", chữ màn S2-00 và gợi ý.
// Tính ở app chỉ để hiện; database kiểm lại ngày nhận, bộ lọc và đếm căn (fn_sale_tim, YC7.2-NT8).
import { CHIP_VIEW, LOAI_VIEW } from './kiemCan';
import { congNgay, laNgay, soDem, type Ngay } from './ngay';

export type MaView = (typeof LOAI_VIEW)[number];

/** YC7.2 bước 1 đến 3: điều kiện tìm. Lọc rỗng là không lọc. Số phòng ngủ 4 là 4PN trở lên. */
export type DieuKienTim = {
  nhan: Ngay | null;
  tra: Ngay | null;
  soPhongNgu: number[];
  toaNha: string[];
  view: MaView[];
};

export const DIEU_KIEN_TRONG: DieuKienTim = { nhan: null, tra: null, soPhongNgu: [], toaNha: [], view: [] };

/** YC7.2 bước 1: chip số đêm (chip cuối "Tùy chọn" mở ô ngày trả). */
export const CHIP_SO_DEM = [1, 2, 3, 4] as const;
export const CHU_TUY_CHON = 'Tùy chọn';

/** YC7.2 bước 3: chip "Số phòng ngủ" (không có Studio ở màn tìm, canvas S1-02). */
export const CHIP_PHONG_NGU_TIM: { so: number; chu: string }[] = [
  { so: 1, chu: '1PN' }, { so: 2, chu: '2PN' }, { so: 3, chu: '3PN' }, { so: 4, chu: '4PN+' },
];

/** YC7.2 bước 3, YC7.2-NT7: chip "Loại view" dùng chung với YC3.4 (không có "Vịnh"). */
export const CHIP_VIEW_TIM = CHIP_VIEW;

export const CAU_CHUA_CHON_NGAY = 'Chọn ngày nhận để tìm phòng';
export const CHU_NUT_TIM = 'Tìm phòng trống';
export const CAU_TU_NHAP_KHONG_LICH = 'Căn tự nhập không có lịch tự động. Gọi chủ nhà để hỏi.';

/** YC7.2 bước 2, YC7.2-NT2: ngày trả = ngày nhận + số đêm. */
export function ngayTra(nhan: Ngay, soDemChon: number): Ngay {
  return congNgay(nhan, soDemChon);
}

/** Số đêm của điều kiện, null khi chưa đủ ngày hay ngày trả không sau ngày nhận. */
export function soDemCua(dk: Pick<DieuKienTim, 'nhan' | 'tra'>): number | null {
  if (!dk.nhan || !dk.tra || !laNgay(dk.nhan) || !laNgay(dk.tra) || dk.tra <= dk.nhan) return null;
  return soDem(dk.nhan, dk.tra);
}

/** YC7.2 bước 1, 2, YC7.2-NT1, YC7-H1: nút đáy sáng khi có ngày nhận (không trước hôm nay) và ngày trả sau ngày nhận. */
export function trangThaiNutTim(dk: DieuKienTim, homNay: Ngay): { sang: boolean; ghiChu: string | null } {
  if (!dk.nhan || !laNgay(dk.nhan)) return { sang: false, ghiChu: CAU_CHUA_CHON_NGAY };
  if (dk.nhan < homNay) return { sang: false, ghiChu: CAU_CHUA_CHON_NGAY };
  if (soDemCua(dk) === null) return { sang: false, ghiChu: 'Chọn ngày trả sau ngày nhận' };
  if ((soDemCua(dk) ?? 0) > 31) return { sang: false, ghiChu: 'Tìm tối đa 31 đêm' };
  return { sang: true, ghiChu: null };
}

/** "10/10" từ "2026-10-10". */
export function ngayNgan(n: Ngay): string {
  return `${n.slice(8, 10)}/${n.slice(5, 7)}`;
}

export function khoangNgan(nhan: Ngay, tra: Ngay): string {
  return `${ngayNgan(nhan)} → ${ngayNgan(tra)}`;
}

function chuPhongNgu(so: readonly number[]): string | null {
  if (so.length === 0) return null;
  return [...so].sort((a, b) => a - b).map((s) => (s >= 4 ? '4PN+' : `${s}PN`)).join(', ');
}

function chuView(v: readonly string[]): string | null {
  if (v.length === 0) return null;
  return 'view ' + v.map((m) => (CHIP_VIEW.find((c) => c.ma === m)?.chu ?? m).toLowerCase()).join(', ');
}

function chuToa(ids: readonly string[], tenToa: ReadonlyMap<string, string>): string | null {
  const ten = ids.map((id) => tenToa.get(id)).filter((t): t is string => !!t);
  return ten.length ? ten.join(', ') : null;
}

/** YC7.2 bước 1: một dòng "Tìm gần đây", ví dụ "10/10 → 12/10 · 2PN · ICON40", "17/10 → 18/10 · 1PN · view biển". */
export function dongGanDay(dk: DieuKienTim, tenToa: ReadonlyMap<string, string>): string {
  if (!dk.nhan || !dk.tra) return '';
  return [khoangNgan(dk.nhan, dk.tra), chuPhongNgu(dk.soPhongNgu), chuToa(dk.toaNha, tenToa), chuView(dk.view)]
    .filter((x): x is string => !!x).join(' · ');
}

/** S2-00: dòng điều kiện trên đầu, ví dụ "10/10 → 12/10 · 3PN · 2 đêm". */
export function tieuDeKetQua(dk: DieuKienTim): string {
  if (!dk.nhan || !dk.tra) return '';
  const dem = soDemCua(dk);
  return [khoangNgan(dk.nhan, dk.tra), chuPhongNgu(dk.soPhongNgu), dem ? `${dem} đêm` : null]
    .filter((x): x is string => !!x).join(' · ');
}

/** S2-00: "Các căn 3PN ở ICON40 đã kín 10/10 → 12/10. Thử một trong các cách sau:". */
export function cauKhongCoCan(dk: DieuKienTim, tenToa: ReadonlyMap<string, string>, coGoiY: boolean): string {
  if (!dk.nhan || !dk.tra) return '';
  const loai = [chuPhongNgu(dk.soPhongNgu), chuView(dk.view)].filter(Boolean).join(' ');
  const toa = chuToa(dk.toaNha, tenToa);
  const dau = 'Các căn' + (loai ? ' ' + loai : '') + (toa ? ' ở ' + toa : '') + ` đã kín ${khoangNgan(dk.nhan, dk.tra)}.`;
  return coGoiY ? dau + ' Thử một trong các cách sau:' : dau + ' Thử đổi ngày hay bỏ bớt bộ lọc.';
}

/** Một căn trong kết quả fn_sale_tim (YC7.2 bước 5; thẻ đủ ở S2 làm ở US45). */
export type CanTim = {
  canId: string; nhom: 'cua_toi' | 'nguon' | 'tu_nhap'; maCan: string; tenToa: string | null; tenChu: string | null;
  soPhongNgu: number | null; loaiView: string | null; lichDoiLuc: string | null;
  tongGiaChu: number | null; tongGiaBan: number | null; khongCoLich: boolean;
};

export type LoaiGoiY = 'doi_ngay' | 'bo_loc_toa' | 'bo_loc_view' | 'bo_loc_phong_ngu' | 'them_phong_ngu';

/** YC7.2 bước 6: một gợi ý, kèm điều kiện đầy đủ để tìm lại và số căn trống nếu làm theo. */
export type GoiY = { loai: LoaiGoiY; dieuKien: DieuKienTim; soCan: number; tenToa: string[] };

export type KetQuaTim = { soCanTrong: number; can: CanTim[]; goiY: GoiY[] };

/** S2-00: chữ của một gợi ý ("Đổi sang 11/10 → 13/10" · "3 căn trống"). */
export function chuGoiY(g: GoiY, dk: DieuKienTim): { chinh: string; phu: string } {
  const so = `${g.soCan} căn trống`;
  switch (g.loai) {
    case 'doi_ngay':
      return { chinh: `Đổi sang ${khoangNgan(g.dieuKien.nhan!, g.dieuKien.tra!)}`, phu: so };
    case 'bo_loc_toa':
      return { chinh: 'Bỏ lọc tòa nhà', phu: g.tenToa.length ? `${so} ở ${g.tenToa.join(', ')}` : so };
    case 'bo_loc_view':
      return { chinh: 'Bỏ lọc loại view', phu: so };
    case 'bo_loc_phong_ngu':
      return { chinh: 'Bỏ lọc số phòng ngủ', phu: so };
    case 'them_phong_ngu': {
      const them = g.dieuKien.soPhongNgu.filter((s) => !dk.soPhongNgu.includes(s));
      return { chinh: `Thêm ${chuPhongNgu(them) ?? ''}`.trim(), phu: so };
    }
  }
}

/** YC7.2 bước 4, YC7.2-NT4: chạm một dòng "Tìm gần đây" thì điền sẵn điều kiện của lần đó (bản sao, không dùng chung mảng). */
export function dieuKienTuGanDay(g: DieuKienTim): DieuKienTim {
  return { nhan: g.nhan, tra: g.tra, soPhongNgu: [...g.soPhongNgu], toaNha: [...g.toaNha], view: [...g.view] };
}

/** Bật, tắt một giá trị trong bộ lọc nhiều lựa chọn. */
export function batTat<T>(ds: readonly T[], x: T): T[] {
  return ds.includes(x) ? ds.filter((y) => y !== x) : [...ds, x];
}

/** YC7.2 bước 3: chip tòa: tòa người gọi đã dùng ở các lần tìm (mới trước), rồi tòa Home247 đặt sẵn. Không có "Khác" (YC7-H2). */
export function chipToaTim(ds: readonly { id: string; ten: string; home247: boolean }[], ganDay: readonly DieuKienTim[],
                           toiDa = 6): { id: string; ten: string }[] {
  const theoId = new Map(ds.map((t) => [t.id, t]));
  const ra: { id: string; ten: string }[] = [];
  const them = (t: { id: string; ten: string } | undefined) => { if (t && !ra.some((x) => x.id === t.id)) ra.push(t); };
  for (const g of ganDay) for (const id of g.toaNha) them(theoId.get(id));
  for (const t of ds) if (t.home247) them(t);
  return ra.slice(0, toiDa);
}
