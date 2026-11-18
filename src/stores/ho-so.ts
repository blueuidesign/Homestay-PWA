// Hồ sơ đã tải và danh sách sale đã xem, giữ trong bộ nhớ (HV1 bước 2, HV2 bước 1). Không lưu xuống máy: tắt app là mất.
import type { DanhSachKetNoi, HoSo } from "../services/kieu";

let hoSo: HoSo | null = null;
// Người dùng đã từ chối hộp thoại Zalo trong lần mở app này: popup lần sau có nút "Mở cài đặt quyền" (HV4 bước 3a)
let daTuChoi = false;
let ketNoi: DanhSachKetNoi | null = null;

export const boNhoHoSo = {
  lay: () => hoSo,
  ghi: (h: HoSo) => {
    hoSo = h;
  },
  daTuChoi: () => daTuChoi,
  ghiTuChoi: (v: boolean) => {
    daTuChoi = v;
  },
  ketNoi: () => ketNoi,
  ghiKetNoi: (k: DanhSachKetNoi) => {
    ketNoi = k;
  },
  xoaKetNoi: () => {
    ketNoi = null;
  },
  xoa: () => {
    hoSo = null;
    daTuChoi = false;
    ketNoi = null;
  },
};
