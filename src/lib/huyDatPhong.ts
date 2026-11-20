// Hủy đặt phòng có sale (YC5.8, QD12): tình trạng hủy đọc từ fn_tinh_trang_huy và chữ trên màn (bước 33 đến 36).
import { ngayThang } from './can';

export type TinhTrang = 'hieu_luc' | 'cho_dong_y' | 'bi_tu_choi' | 'da_huy';
export interface TinhTrangHuy {
  tinhTrang: TinhTrang;
  xinHuyDuoc: boolean;
  toiXin: boolean;
  traLoiDuoc: boolean;
  tenNguoiXin: string | null;
}

export const CAU_DA_XIN_HUY = 'Đã gửi lời xin hủy';
export const CAU_DA_DONG_Y_HUY = 'Đã hủy đặt phòng';
export const CAU_KHONG_DONG_Y_HUY = 'Đã giữ đặt phòng';

/** Đọc jsonb của fn_tinh_trang_huy. */
export function docTinhTrangHuy(d: Record<string, unknown>): TinhTrangHuy {
  const tt = d.tinh_trang;
  return {
    tinhTrang: tt === 'cho_dong_y' || tt === 'bi_tu_choi' || tt === 'da_huy' ? tt : 'hieu_luc',
    xinHuyDuoc: d.xin_huy_duoc === true,
    toiXin: d.toi_xin === true,
    traLoiDuoc: d.tra_loi_duoc === true,
    tenNguoiXin: typeof d.ten_nguoi_xin === 'string' ? d.ten_nguoi_xin : null,
  };
}

/** YC5.8 bước 33 đến 36: nhãn ở cả hai bên. */
export function nhanHuy(t: TinhTrangHuy): string | null {
  if (t.tinhTrang === 'cho_dong_y') return 'Chờ đồng ý hủy';
  if (t.tinhTrang === 'bi_tu_choi') return 'Bị từ chối hủy';
  if (t.tinhTrang === 'da_huy') return 'Đã hủy';
  return null;
}

/** YC5.8 bước 33: "Xin hủy đặt phòng 1509 · 10/10 → 12/10? Sale Hùng phải đồng ý thì mới hủy." */
export function cauHoiXinHuy(maCan: string, ngayNhan: string, ngayTra: string, tenBenKia: string): string {
  return `Xin hủy đặt phòng ${maCan.trim()} · ${ngayThang(ngayNhan)} → ${ngayThang(ngayTra)}? ${tenBenKia} phải đồng ý thì mới hủy.`;
}

/** YC5.8 bước 34: dòng bên kia thấy. */
export function cauNguoiXin(t: TinhTrangHuy): string {
  return `${t.tenNguoiXin ?? 'Bên kia'} xin hủy đặt phòng này`;
}
