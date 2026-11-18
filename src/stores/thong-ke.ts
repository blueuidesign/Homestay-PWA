// Thống kê chủ nhà đã xem (CN8), giữ trong bộ nhớ: mở lại tab là hiện ngay số cũ (HV1 bước 2), mất mạng vẫn xem được (HV2 bước 1),
// rời app rồi quay lại vẫn đúng tháng đang xem (HV3 bước 2). Không lưu xuống máy: tắt hẳn app là mất.
import type { ThongKeChu } from "../services/kieu";

const daXem = new Map<string, ThongKeChu>();
let thangDangXem: string | null = null;

export const boNhoThongKe = {
  lay: (thang: string) => daXem.get(thang),
  ghi: (t: ThongKeChu) => void daXem.set(t.thang, t),
  dangXem: () => thangDangXem,
  ghiDangXem: (thang: string) => {
    thangDangXem = thang;
  },
  // Vừa ghi hay xóa đặt phòng: số cũ không còn đúng, bỏ để lần mở lại tải mới. Giữ tháng đang xem.
  lamMoi: () => daXem.clear(),
  // Đổi người dùng (menu Bản thử): bỏ hết
  xoa: () => {
    daXem.clear();
    thangDangXem = null;
  },
};
