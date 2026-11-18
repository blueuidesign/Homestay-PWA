import { anhGuiDuoc } from "../services/gui-khach";
import type { CanGuiKhach, TrangThaiGuiKhach } from "../services/kieu";
import { chuKhoangNgay } from "../services/mau-tin";
import { DUONG } from "./duong-dan";

// Chữ và phép tính hiện của S5 (mục "Gửi thông tin cho khách qua Zalo" (US14)) và P11 (mục "Mẫu tin gửi khách" (US14)). Chữ chưa vẽ ở canvas là chữ tạm, liệt kê ở PR US14.
export const TIEU_DE_S5 = "Gửi cho khách";
export const CHU_GUI_CHU = "Gửi chữ qua Zalo";
export const CHU_SAO_CHEP = "Sao chép chữ";
export const CHU_HOAC_SAO_CHEP = "Hoặc sao chép chữ rồi dán vào tin nhắn bất kỳ";
export const CHU_DA_SAO_CHEP = "Đã sao chép chữ";
export const CHU_CHUA_SAO_CHEP = "Chưa sao chép được. Bấm lại"; // chữ tạm
export const CHU_LOI_MO_ZALO = "Chưa mở được Zalo. Bấm lại"; // chữ tạm, theo CN10
export const CHU_DE_SAU_S5 = "Để sau vẫn gửi cho khách được. Chủ nhà chưa thấy tên và số của bạn."; // chữ tạm, theo CHU_DE_SAU_CN10
export const CHU_CHUA_CO_ANH = "Chưa có ảnh"; // chữ tạm

export const chuSoCanVaNgay = (soCan: number, nhan: string, tra: string) =>
  `${soCan} căn · ${chuKhoangNgay(nhan, tra)}. Zalo không gửi chữ và ảnh chung một tin: mỗi căn gửi chữ một lần, ảnh một lần.`;
export const chuSoAnh = (n: number) => `${n} ảnh`;
export const chuNutGuiAnh = (can: Pick<CanGuiKhach, "anh">) => {
  const n = anhGuiDuoc(can).length;
  return n === 0 ? CHU_CHUA_CO_ANH : `Gửi ${n} ảnh qua Zalo`;
};
// Căn nhiều hơn 10 ảnh: Zalo chỉ nhận 10 ảnh mỗi lần (zalo-hanh-vi 5.3). Chữ tạm.
export const chuGhiChuNhieuAnh = (can: Pick<CanGuiKhach, "anh" | "so_anh">) =>
  can.so_anh > anhGuiDuoc(can).length ? `Căn có ${can.so_anh} ảnh, mỗi lần Zalo chỉ gửi được ${anhGuiDuoc(can).length} ảnh đầu` : null;
export const chuNutSaoChepTatCa = (n: number) => `Sao chép chữ cả ${n} căn`;

// State mở S5 từ S2 (nhiều căn theo thứ tự tích) và từ S3 (một căn)
export const trangThaiGuiKhach = (canIds: string[], nhan: string, tra: string): TrangThaiGuiKhach => ({ can_ids: canIds, ngay_nhan: nhan, ngay_tra: tra });
export const diDenGuiKhach = (canIds: string[], nhan: string, tra: string) => ({ duong: DUONG.GUI_KHACH, state: trangThaiGuiKhach(canIds, nhan, tra) });
// Đọc state: S3 gửi can_id, S2 gửi can_ids
export const canIdsCuaState = (st: TrangThaiGuiKhach | null | undefined): string[] => (st ? st.can_ids ?? (st.can_id ? [st.can_id] : []) : []);

// P11
export const TIEU_DE_P11 = "Mẫu tin gửi khách";
export const NHAN_MAU_TIN = "Mẫu tin";
export const NHAN_CHAM_DE_CHEN = "Chạm để chèn";
export const NHAN_KHACH_NHAN = "Khách sẽ nhận được";
export const CHU_DUNG_LAI_MAU = "Dùng lại mẫu mặc định";
export const CHU_LUU_P11 = "Lưu thay đổi";
export const CHU_MAU_TRONG = "Mẫu tin đang trống. Gõ chữ hoặc bấm Dùng lại mẫu mặc định"; // chữ tạm
export const CHU_MAU_QUA_DAI = "Mẫu tin dài tối đa 2.000 ký tự"; // chữ tạm
