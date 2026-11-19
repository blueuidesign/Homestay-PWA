// Chữ và luật nhỏ của màn Gửi lịch cho sale CN10 (YC6.6, YC6-H8, YC8-H5). Link gửi lịch tạo qua fn_gui_lich
// (dichVuLinkMoi.guiLich); sale đã lưu đọc qua fn_ds_sale_cua_toi (dichVuSale.layDanhSach).
import type { DongSale } from './dichVuSale';

/** YC6.6 bước 1. */
export const CAU_GIOI_THIEU_GUI_LICH =
  'Sale nhận link xem lịch trống/kín và giá của các căn đã chọn. Sale chỉ thấy đã cọc hay chưa, không thấy tên khách và số tiền cọc.';
/** YC6.6 bước 2, YC6-H8. */
export const CAU_CHON_IT_NHAT_MOT_CAN = 'Chọn ít nhất một căn';
/** YC6.6 bước 3, YC8-H5. */
export const CAU_SALE_DA_LUU =
  'Sale bạn đã lưu trong tab Sale. Bấm "Chia sẻ lịch" là điện thoại mở bảng chia sẻ kèm link lịch, bạn chọn Zalo hoặc ứng dụng nhắn tin rồi chọn người nhận.';
/** CN10-00. */
export const CAU_CHUA_CO_SALE = 'Chưa có sale nào đã lưu. Bấm "Chia sẻ lịch" rồi chọn sale trong Zalo hoặc danh bạ.';
/** CN10-01. */
export const CAU_CHUA_GUI = 'Bạn chưa gửi. Bảng chia sẻ đã đóng mà chưa gửi cho ai. Bấm "Chia sẻ lịch" để gửi lại.';
/** YC6.6 bước 5, CN10-02, HV8. */
export const CAU_DA_GUI_LICH = 'Đã gửi lịch';
/** Dịch vụ không có lệnh gửi lịch (bản thử không nối database). */
export const CAU_GUI_LICH_SE_CO = 'Gửi lịch sẽ có ở bản sau';

/** YC6.6 bước 4: tin kèm link cho bảng chia sẻ. */
export function tinGuiLich(link: string): string {
  return `Mời bạn xem lịch phòng trống và giá các căn của tôi trên Lịch phòng Hạ Long: ${link}`;
}

/** CN10: "Căn · đã chọn 2/2". */
export function chuDaChon(chon: number, tong: number): string {
  return `Căn · đã chọn ${chon}/${tong}`;
}

/** CN10: "0912 *** 488". */
export function soAnGiua(so: string | null): string | null {
  if (!so) return null;
  const m = /^(\d{4})\d*(\d{3})$/.exec(so.replace(/\s+/g, ''));
  return m ? `${m[1]} *** ${m[2]}` : so;
}

/** YC6.6 bước 3: sale đã lưu để nhắc gửi cho ai; bỏ sale đã ngừng, đã xóa tài khoản. */
export function saleDeNhac(ds: readonly DongSale[]): DongSale[] {
  return ds.filter((d) => d.nhom !== 'da_ngung' && !d.daXoaTaiKhoan).sort((a, b) => a.ten.localeCompare(b.ten, 'vi'));
}
