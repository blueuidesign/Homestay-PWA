// Danh sách sale của chủ nhà (YC6.2, QD4, PQ17.CHU). Đọc qua fn_ds_sale_cua_toi, fn_dat_phong_cua_sale; ghi qua
// fn_them_sale_tay, fn_xoa_sale_tay, fn_ngung_cho_xem, fn_dat_xem_coc, fn_bo_dong_sale (tự kiểm người gọi ở database).
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Ngay } from './ngay';
import type { TrangThaiTien } from './lich';
import { vietSoDienThoai } from './lich';
import { loiTuSale } from './kiemSale';

export type NhomSale = 'da_ket_noi' | 'chua_ket_noi' | 'da_ngung';

/** YC6.2 bước 1, 4, 7: một dòng ở CN7. loai them_tay là sale chủ nhà thêm tay (không có tài khoản ghép). */
export type DongSale = {
  id: string;
  loai: 'ket_noi' | 'them_tay';
  saleId: string | null;
  ten: string;
  /** Chỉ khi sale đã cho và chưa xóa tài khoản (PQ2.CHU, QD13); sale thêm tay là số chủ nhà gõ. */
  soDienThoai: string | null;
  nhom: NhomSale;
  daXoaTaiKhoan: boolean;
  /** "Tình trạng cọc" (QD7); null khi dòng không đang kết nối (không có công tắc). */
  xemCoc: boolean | null;
  soDatPhong: number;
  tongTienPhong: number;
  ketNoiLuc: string | null;
  ngungLuc: string | null;
};

/** YC6.2 bước 5: một đặt phòng của sale với chủ nhà này. */
export type DatPhongCuaSale = {
  id: string; maCan: string; ngayNhan: Ngay; ngayTra: Ngay; tienPhong: number;
  trangThai: 'hieu_luc' | 'da_huy'; trangThaiTien: TrangThaiTien | null;
};

export interface DichVuSale {
  layDanhSach(): Promise<DongSale[]>;
  layDatPhong(saleId: string): Promise<DatPhongCuaSale[]>;
  /** YC6.2 bước 4. P0001 thì LoiNguoiDung kèm câu Luật kiểm (QT5.5). */
  themSaleTay(ten: string, so: string): Promise<string>;
  /** YC6.2-NT8. */
  xoaSaleTay(id: string): Promise<void>;
  /** YC6.2 bước 6. Gửi lại khi đã ngừng thì không lỗi. */
  ngungChoXem(ketNoiId: string): Promise<void>;
  /** YC6.2-NT5: trả giá trị database đã ghi. */
  datXemCoc(ketNoiId: string, bat: boolean): Promise<boolean>;
  /** YC6.2 bước 7: bỏ dòng sale đã xóa tài khoản. */
  boDong(ketNoiId: string): Promise<void>;
}

type DongRpc = {
  id: string; loai: 'ket_noi' | 'them_tay'; sale_id: string | null; ten: string | null; so_dien_thoai: string | null; nhom: NhomSale;
  da_xoa_tai_khoan: boolean; xem_coc: boolean | null; so_dat_phong: number; tong_tien_phong: number | string;
  ket_noi_luc: string | null; ngung_luc: string | null;
};
type DatPhongRpc = {
  id: string; ma_can: string; ngay_nhan: string; ngay_tra: string; tien_phong: number | string; trang_thai: 'hieu_luc' | 'da_huy';
  trang_thai_tien: TrangThaiTien | null;
};

export function taoDichVuSaleSupabase(sb: SupabaseClient): DichVuSale {
  const goi = async <T>(ten: string, thamSo?: Record<string, unknown>): Promise<T> => {
    const { data, error } = thamSo === undefined ? await sb.rpc(ten) : await sb.rpc(ten, thamSo);
    if (error) throw loiTuSale(error);
    return data as T;
  };
  return {
    async layDanhSach() {
      const ds = (await goi<DongRpc[] | null>('fn_ds_sale_cua_toi')) ?? [];
      return ds.map((d) => ({
        id: d.id, loai: d.loai, saleId: d.sale_id, ten: d.ten ?? 'Sale', soDienThoai: d.so_dien_thoai, nhom: d.nhom,
        daXoaTaiKhoan: d.da_xoa_tai_khoan, xemCoc: d.xem_coc, soDatPhong: d.so_dat_phong, tongTienPhong: Number(d.tong_tien_phong),
        ketNoiLuc: d.ket_noi_luc, ngungLuc: d.ngung_luc,
      }));
    },
    async layDatPhong(saleId) {
      const ds = (await goi<DatPhongRpc[] | null>('fn_dat_phong_cua_sale', { p_sale_id: saleId })) ?? [];
      return ds.map((d) => ({
        id: d.id, maCan: d.ma_can, ngayNhan: d.ngay_nhan, ngayTra: d.ngay_tra, tienPhong: Number(d.tien_phong),
        trangThai: d.trang_thai, trangThaiTien: d.trang_thai_tien,
      }));
    },
    themSaleTay: (ten, so) => goi<string>('fn_them_sale_tay', { p_ten: ten, p_so: so }),
    async xoaSaleTay(id) { await goi('fn_xoa_sale_tay', { p_id: id }); },
    async ngungChoXem(ketNoiId) { await goi('fn_ngung_cho_xem', { p_ket_noi_id: ketNoiId }); },
    datXemCoc: (ketNoiId, bat) => goi<boolean>('fn_dat_xem_coc', { p_ket_noi_id: ketNoiId, p_bat: bat }),
    async boDong(ketNoiId) { await goi('fn_bo_dong_sale', { p_ket_noi_id: ketNoiId }); },
  };
}

const theoTen = (a: DongSale, b: DongSale) => a.ten.localeCompare(b.ten, 'vi');

/** YC6.2 bước 1, YC6 quy tắc "Nhóm kết nối", YC6-H16: ba nhóm, mỗi nhóm theo tên. */
export function chiaNhom(ds: readonly DongSale[]): { daKetNoi: DongSale[]; chuaKetNoi: DongSale[]; daNgung: DongSale[] } {
  return {
    daKetNoi: ds.filter((d) => d.nhom === 'da_ket_noi').sort(theoTen),
    chuaKetNoi: ds.filter((d) => d.nhom === 'chua_ket_noi').sort(theoTen),
    daNgung: ds.filter((d) => d.nhom === 'da_ngung').sort(theoTen),
  };
}

/** QT5.1: ngày theo giờ Việt Nam, dạng 02/08/2026. */
export function ngayVN(luc: string | null): string {
  if (!luc) return '';
  const d = new Date(luc);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
}

function chuDatPhong(n: number): string {
  return n > 0 ? `${n} đặt phòng` : 'Chưa có đặt phòng';
}

/** YC6.2 bước 1, 4, YC6-H16: chữ phụ dưới tên ở CN7. */
export function dongPhuSale(d: DongSale): string {
  if (d.nhom === 'da_ngung') return [d.ngungLuc ? `Đã ngừng ${ngayVN(d.ngungLuc)}` : 'Đã ngừng', chuDatPhong(d.soDatPhong)].join(' · ');
  if (d.nhom === 'chua_ket_noi') return [d.soDienThoai ? vietSoDienThoai(d.soDienThoai) : null, 'chưa mở link mời'].filter(Boolean).join(' · ');
  return chuDatPhong(d.soDatPhong);
}

/** YC6.2 bước 6. */
export function cauHoiNgung(ten: string): string {
  return `Xác nhận ngừng cho ${ten} xem? Đặt phòng cũ vẫn giữ. Sale không thấy lịch của bạn nữa.`;
}
