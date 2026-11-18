import { postSaleGuiKhachDaGui } from "./api";
import type { CanGuiKhach, KetQuaGuiKhachXem } from "./kieu";
import { TOI_DA_ANH_MOI_LAN, zalo, type KetQuaChiaSe } from "./zalo";

// Việc gốc của các nút ở S5 (YC5.5 bước 3 đến 6). Tách khỏi màn để test.
// Chữ và ảnh gửi riêng (YC5 quy tắc Chữ và ảnh gửi riêng): mỗi nút một cửa sổ Zalo.
// Chỉ gọi POST /sale/gui-khach/da-gui khi Zalo báo đã chia sẻ (Tùng 04/11/2026, Nhật ký US10: "Đã chia sẻ" là căn cứ biết sale đã gửi).
// Hủy cửa sổ, lỗi Zalo, sao chép: không gọi. Ghi lần gửi lỗi thì thôi, tin đã gửi (như gui-lich.ts).
const khoaMoi = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `k-${Date.now()}-${Math.random()}`;

export type KetQuaGui = { kq: KetQuaChiaSe; daGhi: boolean };

async function ghiNeuDaGui(kq: KetQuaChiaSe, canId: string, ngay: { nhan: string; tra: string }): Promise<KetQuaGui> {
  if (kq !== "da_gui") return { kq, daGhi: false };
  try {
    await postSaleGuiKhachDaGui({ can_id: canId, ngay_nhan: ngay.nhan, ngay_tra: ngay.tra }, khoaMoi());
    return { kq, daGhi: true };
  } catch {
    return { kq, daGhi: false };
  }
}

// "Gửi chữ qua Zalo": chữ của đúng căn đó (YC5.5-NT2)
export async function guiChuMotCan(can: CanGuiKhach, ngay: { nhan: string; tra: string }): Promise<KetQuaGui> {
  return ghiNeuDaGui(await zalo.chiaSeChu(can.chu), can.id, ngay);
}

// Ảnh gửi được mỗi lần: tối đa 10, theo thứ tự ảnh. Căn nhiều hơn 10 ảnh thì gửi 10 ảnh đầu [MỞ: YC5-H6]
export const anhGuiDuoc = (can: Pick<CanGuiKhach, "anh">) =>
  [...can.anh].sort((a, b) => a.thu_tu - b.thu_tu).slice(0, TOI_DA_ANH_MOI_LAN);

export async function guiAnhMotCan(can: CanGuiKhach, ngay: { nhan: string; tra: string }): Promise<KetQuaGui> {
  const anh = anhGuiDuoc(can);
  if (anh.length === 0) return { kq: "loi", daGhi: false };
  return ghiNeuDaGui(await zalo.chiaSeAnh(anh.map((a) => a.duong_dan)), can.id, ngay);
}

// "Sao chép chữ": không gọi server (YC5.5 bước 5)
export const saoChepChuMotCan = (can: Pick<CanGuiKhach, "chu">) => zalo.saoChep(can.chu);

// "Sao chép chữ cả N căn": chữ cả lô theo mẫu tin của sale, các căn theo thứ tự trên màn (YC5.5-NT3, YC5.7-NT3)
export const saoChepChuTatCa = (ket: Pick<KetQuaGuiKhachXem, "chu_tat_ca">) => zalo.saoChep(ket.chu_tat_ca);
