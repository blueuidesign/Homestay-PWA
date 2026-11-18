import type { DongKetNoi, TrangThaiTien } from "../services/kieu";
import { chuNgayNgan } from "../services/ngay";

// Chữ hiển thị của CN7, CN7-04, P2 (canvas CN7, CN7-04, P2)

// "0904118772" hoặc "84904118772" thành "0904 118 772"
export const chuSoDienThoai = (so: string) => {
  const s = so.replace(/\D/g, "");
  const d = s.startsWith("84") && s.length === 11 ? "0" + s.slice(2) : s;
  return /^0\d{9}$/.test(d) ? `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}` : so;
};

// Chữ cái đầu trong ô tròn: "Sale Hùng" thành "H"
export const chuCaiDau = (ten: string) => {
  const t = ten.trim().split(/\s+/);
  return (t[t.length - 1] ?? "?").charAt(0).toUpperCase();
};

// Dòng dưới tên sale ở CN7. Quy tắc suy từ 4 dòng của canvas:
// chưa có đặt phòng; có chưa cọc thì "N đặt phòng · K chưa cọc"; tất cả đã thanh toán thì "N đặt phòng · đã thanh toán";
// còn lại "N đặt phòng tháng này · D đêm".
export const chuTomTat = (d: DongKetNoi) => {
  const t = d.tom_tat;
  if (!t || t.so_dat_phong === 0) return "Chưa có đặt phòng tháng này";
  if (t.so_chua_coc > 0) return `${t.so_dat_phong} đặt phòng · ${t.so_chua_coc} chưa cọc`;
  if (t.da_thanh_toan_het) return `${t.so_dat_phong} đặt phòng · đã thanh toán`;
  return `${t.so_dat_phong} đặt phòng tháng này · ${t.so_dem} đêm`;
};

export const CHU_TIEN: Record<TrangThaiTien, string> = {
  chua_coc: "Chưa cọc",
  da_coc_con_thu: "Đã cọc · còn thu",
  da_thanh_toan: "Đã thanh toán",
};

// "kết nối từ 02/08/2026"
export const chuKetNoiTu = (luc: string | null) => {
  if (!luc) return null;
  const ngay = luc.slice(0, 10);
  return `kết nối từ ${chuNgayNgan(ngay)}/${ngay.slice(0, 4)}`;
};

// Tin kèm link mời gửi qua Zalo. Chữ chưa có trong YC hay canvas: tạm, Tùng chốt sau (ghi trong PR).
export const tinMoiSale = (duongDan: string) =>
  `Mời bạn xem lịch phòng trống của tôi trên Home247 (Lịch phòng Hạ Long). Bấm link để xem, không cần gọi hỏi: ${duongDan}`;

// Tin kèm link lịch gửi qua Zalo từ CN10 (US26). Chữ chưa có trong YC hay canvas: tạm, Tùng chốt sau (ghi trong PR).
// Có tên sale thì mở đầu bằng tên để chủ nhà nhớ cửa sổ này dành cho ai (Zalo không cho chọn sẵn người nhận, zalo-hanh-vi 5.2).
export const tinGuiLich = (duongDan: string, tenSale: string | null) =>
  `${tenSale ? `Gửi ${tenSale}: ` : ""}Lịch phòng trống và giá của tôi trên Home247 (Lịch phòng Hạ Long). Bấm link để xem, không cần gọi hỏi: ${duongDan}`;

// Toast ở CN10-02. Chữ theo bảng Hành vi mục "Chủ nhà chủ động gửi lịch cho sale" (US26) bước 5; CH-052 chưa chốt nên đây là chữ tạm (ghi trong PR).
export const chuToastDaGuiLich = "Đã gửi lịch thành công";

// Chữ toast
export const chuToastDaGuiLink = "Đã mở Zalo để gửi link mời";
export const chuToastDaSaoChep = "Đã sao chép link mời";
export const chuToastDaThemSale = (ten: string) => `Đã thêm ${ten} vào nhóm Chưa kết nối`;
export const chuToastDaNgung = (ten: string) => `Đã ngừng cho ${ten} xem lịch`;
