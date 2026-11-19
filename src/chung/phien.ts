// HV7 · Phiên hết hạn: làm mới rồi gửi lại việc bị từ chối đúng một lần.

export class LoiHetPhien extends Error {
  readonly loaiLoi = 'het-phien';
}

export type KetQuaPhien<T> = { ok: true; giaTri: T } | { ok: false; canDangNhap: true };

/**
 * HV7 bước 1: việc bị từ chối vì hết phiên thì làm mới phiên và gửi lại một lần.
 * HV7 bước 2: làm mới không được thì báo cần đăng nhập (form giữ nháp theo HV3, màn đăng nhập YC1.2).
 */
export async function chayVoiPhien<T>(viec: () => Promise<T>, lamMoi: () => Promise<boolean>): Promise<KetQuaPhien<T>> {
  try {
    return { ok: true, giaTri: await viec() };
  } catch (e) {
    if (!(e instanceof LoiHetPhien)) throw e;
  }
  let duoc = false;
  try { duoc = await lamMoi(); } catch { duoc = false; }
  if (!duoc) return { ok: false, canDangNhap: true };
  try {
    return { ok: true, giaTri: await viec() };
  } catch (e) {
    if (e instanceof LoiHetPhien) return { ok: false, canDangNhap: true };
    throw e;
  }
}
