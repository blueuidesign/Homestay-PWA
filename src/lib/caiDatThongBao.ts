// Các công tắc thông báo theo vai (YC12.4 bước 2, 3). Khóa là cột `loai` của thong_bao (khớp LOAI_TB_CHU, LOAI_TB_SALE).
import type { Vai } from './dieuHuong';

export type CongTac = { loai: string; ten: string; phu: string };

/** YC12.4 bước 2: P3, chủ nhà, ba công tắc. YC12-H2 (giả định GD32): "Sale xin xem lịch" có công tắc nhưng database chưa có nguồn sinh thông báo. */
export const CONG_TAC_CHU: CongTac[] = [
  { loai: 'yeu_cau_moi', ten: 'Sale đặt phòng mới', phu: 'Tên sale, căn và ngày ở' },
  { loai: 'sale_xin_xem_lich', ten: 'Sale xin xem lịch', phu: 'Để bạn đồng ý hoặc từ chối' },
  { loai: 'dat_phong_chua_coc', ten: 'Đặt phòng chưa cọc', phu: 'Khi còn 3 ngày đến ngày nhận phòng' },
];

/** YC12.4 bước 3: P12, sale, bốn công tắc. */
export const CONG_TAC_SALE: CongTac[] = [
  { loai: 'chu_dong_y_ket_noi', ten: 'Chủ nhà đồng ý cho xem lịch', phu: 'Căn mới vào Nguồn phòng' },
  { loai: 'can_da_gui_co_nguoi_dat', ten: 'Căn bạn đã gửi khách vừa có người đặt', phu: 'Để báo khách chọn căn khác' },
  { loai: 'yeu_cau_da_chot', ten: 'Chủ nhà xác nhận đặt phòng của bạn', phu: 'Kèm ngày ở và tiền cọc' },
  { loai: 'chu_ghi_dat_phong_cho_sale', ten: 'Chủ nhà ghi đặt phòng cho bạn', phu: 'Khi chủ nhà ghi đặt phòng có bạn là người bán' },
];

export function congTacCuaVai(vai: Vai): CongTac[] {
  return vai === 'chu_nha' ? CONG_TAC_CHU : CONG_TAC_SALE;
}

/** Bật hay tắt một loại: trả danh sách loại đã tắt mới (sắp xếp, không trùng). */
export function doiCongTac(tat: readonly string[], loai: string): string[] {
  return (tat.includes(loai) ? tat.filter((l) => l !== loai) : [...tat, loai]).sort();
}
