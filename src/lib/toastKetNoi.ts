// YC6.8 (r11, YC6-H19, H20 Claude tự chốt): chữ toast A9, A9-02 khi chủ nhà đồng ý kết nối, và nhớ dòng đã hiện trên máy.
// Lưu trên máy chỉ thứ mất cũng được, bọc try/catch (pwa.md P10).

export type CanMoi = { toa: string | null; ma: string };
export type ChuDongY = { ten: string; soCan: number; cacCan: CanMoi[] };
/** Một dòng thông báo "chủ đồng ý kết nối" (có thể gom nhiều chủ nhà, GD15). */
export type ThongBaoKetNoi = { id: string; soChu: number; soCan: number; cacChu: ChuDongY[] };

type ChuRpc = { ten?: string | null; so_can?: number | null; cac_can?: { toa?: string | null; ma?: string | null }[] | null };
export type DongThongBao = {
  id: string;
  noi_dung: { ten_chu?: string | null; so_can?: number | null; so_chu?: number | null; cac_chu?: ChuRpc[] | null } | null;
};

/** YC6.8: đổi dòng thong_bao sang dạng toast. Dòng cũ (trước US42) chỉ có ten_chu, so_can. */
export function docThongBaoKetNoi(d: DongThongBao): ThongBaoKetNoi {
  const nd = d.noi_dung ?? {};
  const cacChu: ChuDongY[] = Array.isArray(nd.cac_chu) && nd.cac_chu.length
    ? nd.cac_chu.map((c) => ({
        ten: c.ten || 'Chủ nhà',
        soCan: Number(c.so_can ?? 0),
        cacCan: (c.cac_can ?? []).filter((x) => !!x.ma).map((x) => ({ toa: x.toa || null, ma: x.ma as string })),
      }))
    : [{ ten: nd.ten_chu || 'Chủ nhà', soCan: Number(nd.so_can ?? 0), cacCan: [] }];
  return { id: d.id, soChu: Number(nd.so_chu ?? cacChu.length), soCan: Number(nd.so_can ?? 0), cacChu };
}

/** "a", "a và b", "a, b và c"; nhiều hơn 3 thì hai mục đầu và "và N <khác>". */
function lietKe(muc: string[], tong: number, khac: (n: number) => string): string {
  if (tong > 3) return `${muc.slice(0, 2).join(', ')} và ${khac(tong - 2)}`;
  const ds = muc.slice(0, tong);
  if (ds.length <= 1) return ds.join('');
  return `${ds.slice(0, -1).join(', ')} và ${ds[ds.length - 1]}`;
}

const tenCan = (c: CanMoi) => (c.toa ? `${c.toa} ${c.ma}` : c.ma);
export const CAU_CHUA_CO_CAN = 'Chưa có căn nào, căn mới sẽ tự hiện';

/** YC6.8 bước 1, 2: hai dòng chữ của toast (A9 một chủ nhà, A9-02 gom nhiều chủ nhà). */
export function chuToast(tb: ThongBaoKetNoi): { dong1: string; dong2: string } {
  if (tb.cacChu.length <= 1) {
    const c = tb.cacChu[0] ?? { ten: 'Chủ nhà', soCan: tb.soCan, cacCan: [] };
    const dong2 = c.soCan > 0 && c.cacCan.length
      ? `${lietKe(c.cacCan.map(tenCan), Math.max(c.soCan, c.cacCan.length), (n) => `${n} căn khác`)} đã vào Nguồn phòng`
      : CAU_CHUA_CO_CAN;
    return { dong1: `${c.ten} đã đồng ý cho bạn xem lịch`, dong2 };
  }
  const ten = lietKe(tb.cacChu.map((c) => c.ten), tb.cacChu.length, (n) => `${n} người khác`);
  const can = tb.soCan > 0 ? `${tb.soCan} căn mới trong Nguồn phòng` : CAU_CHUA_CO_CAN;
  return { dong1: `${tb.cacChu.length} chủ nhà đã đồng ý cho bạn xem lịch`, dong2: `${ten} · ${can}` };
}

/** YC6.8 r11: dòng được gom thêm có khóa mới nên hiện lại. */
export const khoaToast = (tb: ThongBaoKetNoi) => `${tb.id}:${tb.cacChu.length}`;

const KHOA_LUU = 'h247.toastKetNoi.daHien';
const GIU_TOI_DA = 50;

/** YC6.8 r11: các dòng máy này đã hiện toast. Không đọc được thì coi như chưa hiện dòng nào. */
export function daHienToast(): Set<string> {
  try {
    const v = JSON.parse(localStorage.getItem(KHOA_LUU) ?? '[]') as unknown;
    return new Set(Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}

/** YC6.8 r11: nhớ thêm các khóa đã hiện (giữ 50 khóa mới nhất). Không ghi được thì bỏ qua. */
export function nhoDaHien(khoa: string[]): void {
  try {
    const ds = [...daHienToast()].filter((k) => !khoa.includes(k)).concat(khoa).slice(-GIU_TOI_DA);
    localStorage.setItem(KHOA_LUU, JSON.stringify(ds));
  } catch { /* máy không cho lưu: mất cũng được */ }
}

/** YC6.8: dòng mới nhất chưa hiện trên máy này (danh sách xếp mới trước), không có thì null. */
export function chonToastMoi(ds: ThongBaoKetNoi[], daHien: Set<string>): ThongBaoKetNoi | null {
  return ds.find((tb) => !daHien.has(khoaToast(tb))) ?? null;
}
