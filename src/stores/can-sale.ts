// Dữ liệu tab Căn của sale đã xem (US16), giữ trong bộ nhớ: mở lại hiện ngay kèm "Đang cập nhật…" (HV1 bước 2),
// mất mạng vẫn xem được (HV2 bước 1). Không lưu xuống máy: tắt hẳn app là mất.
import type { Can, CanChiTiet, ChiTietNguonPhong, NguonPhong } from "../services/kieu";

export type TabCanSale = { can: Can[]; nguon: NguonPhong };
let tab: TabCanSale | undefined;
const canTuNhap = new Map<string, CanChiTiet>();
const chuNha = new Map<string, ChiTietNguonPhong>();

export const boNhoTabCan = {
  tab: () => tab,
  ghiTab: (t: TabCanSale) => {
    tab = t;
  },
  canChiTiet: (id: string) => canTuNhap.get(id),
  ghiCanChiTiet: (c: CanChiTiet) => void canTuNhap.set(c.id, c),
  chuNha: (id: string) => chuNha.get(id),
  ghiChuNha: (c: ChiTietNguonPhong) => void chuNha.set(c.id, c),
  // Vừa thêm, xóa căn, bỏ nguồn, ghi đặt phòng: bỏ dữ liệu cũ để lần mở lại tải mới
  lamMoi: () => {
    tab = undefined;
    canTuNhap.clear();
    chuNha.clear();
  },
  xoa: () => {
    tab = undefined;
    canTuNhap.clear();
    chuNha.clear();
  },
};
