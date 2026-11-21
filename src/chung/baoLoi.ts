// EN7 · Báo lỗi (YC15.3-NT1, YC15 "Báo lỗi", QD29). Bắt lỗi không lường trước của app (window error, promise bị từ chối không ai
// bắt), bỏ số điện thoại, email, phần sau dấu ? của đường dẫn, rồi gửi qua fn_ghi_loi. Không gửi dữ liệu form hay tên.
// Mỗi phiên gửi tối đa 10 lỗi, cùng thông điệp chỉ gửi một lần. Gửi lỗi mà lỗi thì bỏ qua, không làm phiền người dùng.

export type BanGhiLoi = { thongDiep: string; nganXep: string | null; duongDan: string; phienBan: string; trinhDuyet: string };
export type GuiLoi = (b: BanGhiLoi) => Promise<unknown>;

const TOI_DA_MOI_PHIEN = 10;

/** YC15.3-NT1: bỏ email và số điện thoại (9 chữ số trở lên, kể cả có dấu cách, chấm, gạch). */
export function lamSachLoi(s: string | null | undefined, toiDa = 500): string {
  return (s ?? '')
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+/g, '[email]')
    .replace(/\+?\d(?:[ .-]?\d){8,}/g, '[số]')
    .slice(0, toiDa);
}

/** Chỉ giữ đường dẫn, bỏ phần sau dấu ? và #. */
export function duongDanSach(href: string): string {
  try { return lamSachLoi(new URL(href).pathname, 200); } catch { return lamSachLoi(href.split(/[?#]/)[0], 200); }
}

export function banGhiTuLoi(loi: unknown, href: string, phienBan: string, trinhDuyet: string): BanGhiLoi {
  const e = loi instanceof Error ? loi : null;
  const thong = e ? `${e.name}: ${e.message}` : typeof loi === 'string' ? loi : 'Lỗi không rõ';
  return { thongDiep: lamSachLoi(thong), nganXep: e?.stack ? lamSachLoi(e.stack, 4000) : null, duongDan: duongDanSach(href),
    phienBan, trinhDuyet: trinhDuyet.slice(0, 300) };
}

/** Gắn bộ bắt lỗi vào window; trả hàm gỡ. */
export function caiBaoLoi(gui: GuiLoi, phienBan: string = (import.meta.env.VITE_PHIEN_BAN as string | undefined) ?? 'dev'): () => void {
  const daGui = new Set<string>();
  const bao = (loi: unknown) => {
    const b = banGhiTuLoi(loi, window.location.href, phienBan, navigator.userAgent);
    if (daGui.size >= TOI_DA_MOI_PHIEN || daGui.has(b.thongDiep)) return;
    daGui.add(b.thongDiep);
    void gui(b).catch(() => undefined);
  };
  const khiLoi = (ev: ErrorEvent) => bao(ev.error ?? ev.message);
  const khiTuChoi = (ev: PromiseRejectionEvent) => bao(ev.reason);
  window.addEventListener('error', khiLoi);
  window.addEventListener('unhandledrejection', khiTuChoi);
  return () => { window.removeEventListener('error', khiLoi); window.removeEventListener('unhandledrejection', khiTuChoi); };
}
