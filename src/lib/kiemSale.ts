// Luật kiểm phía app của form Thêm sale CN7-05 (YC6.2 Luật kiểm, bước 4). Database là chỗ chặn thật (fn_them_sale_tay).
import { LoiNguoiDung } from '../chung/matKetNoi';

export const TEN_SALE_TOI_DA = 100;
export const CAU_CAN_TEN = 'Cần nhập tên sale';
export const CAU_TEN_DAI = 'Tên dài tối đa 100 ký tự';
export const CAU_SO_SAI = 'Số điện thoại chưa đúng (10 chữ số, bắt đầu bằng 0)';

export type FormSale = { ten: string; so: string };
export type OSale = 'ten' | 'so';
export type LoiSale = Partial<Record<OSale, string>>;

/** YC6.2 Luật kiểm: số bỏ khoảng trắng, dấu chấm, gạch. */
export function chuanSo(so: string): string {
  return so.replace(/[\s.-]/g, '');
}

/** YC6.2 Luật kiểm: câu lỗi theo ô, giống câu của database. */
export function kiemFormSale(f: FormSale): LoiSale {
  const l: LoiSale = {};
  const ten = f.ten.trim();
  if (!ten) l.ten = CAU_CAN_TEN;
  else if ([...ten].length > TEN_SALE_TOI_DA) l.ten = CAU_TEN_DAI;
  if (!/^0\d{9}$/.test(chuanSo(f.so))) l.so = CAU_SO_SAI;
  return l;
}

/** QT5.5: câu database trả về thuộc ô nào (để hiện dưới ô sai). null là câu chung. */
export function oCuaCauSale(cau: string): OSale | null {
  if (cau === CAU_CAN_TEN || cau === CAU_TEN_DAI) return 'ten';
  if (cau === CAU_SO_SAI) return 'so';
  return null;
}

/** QT5.5: P0001 thì giữ câu cho người dùng; lỗi khác giữ mã (42501 là HV5) để màn xử lý. */
export function loiTuSale(e: { code?: string; message?: string }): Error {
  if (e.code === 'P0001' && e.message) return new LoiNguoiDung(e.message);
  const loi = new Error(e.message || 'Lỗi danh sách sale');
  (loi as Error & { code?: string }).code = e.code;
  return loi;
}
