// Luật kiểm ô ở A2, A11 (YC1.2 Luật kiểm, pwa.md P2). App kiểm để báo sớm; database kiểm lại (fn_dang_ky).

export const CAU_LOI_TEN = 'Nhập họ và tên để sale và chủ nhà biết bạn là ai.';
export const CAU_LOI_SO = 'Số điện thoại cần từ 9 đến 15 chữ số.';
export const CAU_LOI_EMAIL = 'Email chưa đúng dạng, ví dụ tenban@gmail.com.';
export const TEN_TOI_DA = 100;

/** YC1.2: bỏ khoảng trắng, dấu chấm, gạch; còn 9 đến 15 chữ số, cho phép + ở đầu. Sai thì null. */
export function chuanHoaSo(so: string): string | null {
  const x = so.replace(/[\s.-]/g, '');
  return /^\+?[0-9]{9,15}$/.test(x) ? x : null;
}

export function kiemTen(ten: string): string | null {
  const x = ten.trim();
  return x === '' || x.length > TEN_TOI_DA ? CAU_LOI_TEN : null;
}

export function kiemSo(so: string): string | null {
  return chuanHoaSo(so) === null ? CAU_LOI_SO : null;
}

export function kiemEmail(email: string): string | null {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? null : CAU_LOI_EMAIL;
}

/** YC1.2: đủ 6 chữ số thì nút xác nhận mới bấm được. */
export function kiemMa(ma: string): boolean {
  return /^[0-9]{6}$/.test(ma);
}

export type LoiForm = Partial<Record<'ten' | 'so' | 'email', string>>;

/** YC1.2 bước 2 (A2-01): lỗi dưới từng ô theo luật kiểm. */
export function kiemFormDangKy(f: { ten?: string; so: string; email?: string }): LoiForm {
  const loi: LoiForm = {};
  if (f.ten !== undefined) { const l = kiemTen(f.ten); if (l) loi.ten = l; }
  const ls = kiemSo(f.so); if (ls) loi.so = ls;
  if (f.email !== undefined) { const l = kiemEmail(f.email); if (l) loi.email = l; }
  return loi;
}
