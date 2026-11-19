// Luật kiểm phía app của form căn (YC3.2 Luật kiểm, bước 16, 17, 20; QT5.5). Database là chỗ chặn thật (fn_tao_can).
import { LoiNguoiDung } from '../chung/matKetNoi';

/** Các ô của form căn. US15 chỉ hiện mã căn và số phòng ngủ; các ô còn lại để YC3.4 (US17) dùng chung luật. */
export type FormCan = {
  maCan: string;
  /** 0 là Studio, 4 là 4PN+ (glossary). null là chưa chọn. */
  soPhongNgu: number | null;
  soGiuong?: number | null;
  loaiView?: string | null;
  moTa?: string | null;
};

export type OCan = 'maCan' | 'soPhongNgu' | 'soGiuong' | 'loaiView' | 'toaNha' | 'moTa';
export type LoiCan = Partial<Record<OCan, string>>;

/** YC3.2 bước 15: hàng chip "Số phòng ngủ". */
export const CHIP_PHONG_NGU: { so: number; chu: string }[] = [
  { so: 0, chu: 'Studio' }, { so: 1, chu: '1PN' }, { so: 2, chu: '2PN' }, { so: 3, chu: '3PN' }, { so: 4, chu: '4PN+' },
];

export const MA_CAN_TOI_DA = 50;
export const MO_TA_TOI_DA = 2000;
export const LOAI_VIEW = ['bien', 'thanh_pho', 'nui'] as const;

export const CAU_DU = 'Đủ thông tin. Ảnh, giá thêm sau cũng được.';
export const CAU_MAT_MANG = 'Chưa lưu được vì mất mạng. Kiểm tra mạng rồi bấm lại.';

/** YC3.2 bước 16, YC3.2-NT1, NT3: chỉ nêu ô bắt buộc còn thiếu (mã căn, số phòng ngủ). */
export function oConThieu(f: Pick<FormCan, 'maCan' | 'soPhongNgu'>): string[] {
  const thieu: string[] = [];
  if (!f.maCan.trim()) thieu.push('mã căn');
  if (f.soPhongNgu == null) thieu.push('số phòng ngủ');
  return thieu;
}

/** YC3.2 bước 16, 17: dòng trên nút "Thêm căn". */
export function dongTrangThai(f: Pick<FormCan, 'maCan' | 'soPhongNgu'>): { du: boolean; chu: string } {
  const thieu = oConThieu(f);
  return thieu.length ? { du: false, chu: 'Còn thiếu: ' + thieu.join(', ') } : { du: true, chu: CAU_DU };
}

/** YC3.2 Luật kiểm: câu lỗi theo ô, giống câu của database. */
export function kiemFormCan(f: FormCan): LoiCan {
  const l: LoiCan = {};
  const ma = f.maCan.trim();
  if (!ma) l.maCan = 'Mã căn không được trống';
  else if ([...ma].length > MA_CAN_TOI_DA) l.maCan = 'Mã căn dài quá 50 ký tự';
  if (f.soPhongNgu == null) l.soPhongNgu = 'Cần chọn số phòng ngủ';
  else if (!Number.isInteger(f.soPhongNgu) || f.soPhongNgu < 0 || f.soPhongNgu > 4) l.soPhongNgu = 'Số phòng ngủ không hợp lệ';
  if (f.soGiuong != null && (!Number.isInteger(f.soGiuong) || f.soGiuong < 1 || f.soGiuong > 50)) l.soGiuong = 'Số giường từ 1 đến 50';
  if (f.loaiView && !(LOAI_VIEW as readonly string[]).includes(f.loaiView)) l.loaiView = 'Loại view không hợp lệ';
  if (f.moTa && [...f.moTa.trim()].length > MO_TA_TOI_DA) l.moTa = 'Mô tả dài tối đa 2.000 ký tự';
  return l;
}

/** YC3.2 bước 20: câu database trả về thuộc ô nào (để hiện ngay dưới ô sai). null là câu chung. */
export function oCuaCau(cau: string): OCan | null {
  if (/^(Mã căn|Đã có căn)/.test(cau)) return 'maCan';
  if (/số phòng ngủ/i.test(cau)) return 'soPhongNgu';
  if (/^Số giường/.test(cau)) return 'soGiuong';
  if (/^Loại view/.test(cau)) return 'loaiView';
  if (/tòa nhà/i.test(cau)) return 'toaNha';
  if (/^Mô tả/.test(cau)) return 'moTa';
  return null;
}

/** YC3.2 bước 20, CN5-A3: dòng đầu form khi database từ chối. */
export function cauDauLoi(soCho: number): string {
  return `Chưa thêm được căn. Sửa ${soCho} chỗ bên dưới.`;
}

/** QT5.5: database từ chối bằng câu tiếng Việt (P0001) thì giữ nguyên câu; lỗi khác để màn xử lý như mất mạng hay lỗi chung. */
export function loiTuTaoCan(e: { code?: string; message?: string }): Error {
  if (e.code === 'P0001' && e.message) return new LoiNguoiDung(e.message);
  const loi = new Error(e.message || 'Lỗi tạo căn');
  (loi as Error & { code?: string }).code = e.code;
  return loi;
}
