// Dữ liệu mẫu cho menu Bản thử, lấy từ docs/product/du-lieu-mau.md (DLM.2, DLM.3).
// Chị Hoa là chủ nhà có 2 căn (thêm 2501 cho CN1-02). Giá, sale, đặt phòng mẫu cho US3 ở cuối file (DLM.2 đến DLM.4).
import type { SoPhongNgu } from "./kieu";
import anhSapphire from "../assets/mau/sapphire-1103.jpg";
import anhALaCarte from "../assets/mau/ala-carte-2208.jpg";

// Hồ sơ Chị Hoa đã có số 0904 118 772 (US5 phần Test case, canvas A8-P2, P2)
export const CHI_HOA = { zalo_id: "zalo-chi-hoa", ten: "Chị Hoa", ho_ten: "Nguyễn Hoa", so_dien_thoai: "0904118772" };

type CanMau = {
  ma_can: string;
  so_phong_ngu: SoPhongNgu;
  so_giuong: number | null;
  loai_view: string | null;
  toa_nha: string | null;
  so_anh: number;
};

export const CAN_CUA_CHI_HOA: CanMau[] = [
  { ma_can: "1509", so_phong_ngu: 2, so_giuong: 3, loai_view: "view biển", toa_nha: "ICON40", so_anh: 12 },
  // DLM.3: canvas chưa ghi tòa, số phòng ngủ của 3402 theo canvas CN5 (1PN)
  { ma_can: "3402", so_phong_ngu: 1, so_giuong: null, loai_view: "view biển", toa_nha: null, so_anh: 3 },
];

// Căn thứ ba của Chị Hoa chỉ có trên canvas CN1-02 (DLM.9), 1PN theo US2-KB7
export const CAN_THU_BA_CHI_HOA: CanMau = {
  ma_can: "2501",
  so_phong_ngu: 1,
  so_giuong: null,
  loai_view: null,
  toa_nha: null,
  so_anh: 0,
};

export const HOM_NAY_MAU = "2026-10-07"; // DLM.1: T4 07/10/2026

// US6 · DLM.2, DLM.3: Anh Tuấn có 2 căn, chia sẻ cho Sale Hùng. Ảnh lấy từ canvas A10.
export const ANH_TUAN = { zalo_id: "zalo-anh-tuan", ten: "Anh Tuấn", ho_ten: "Trần Tuấn", so_dien_thoai: "0903555123" };
export const CAN_CUA_ANH_TUAN: (CanMau & { anh: string; gia: { thuong: number; cuoi_tuan: number } })[] = [
  { ma_can: "1103", so_phong_ngu: 3, so_giuong: 2, loai_view: "view thành phố", toa_nha: "Sapphire", so_anh: 1, anh: anhSapphire, gia: { thuong: 700000, cuoi_tuan: 700000 } },
  { ma_can: "2208", so_phong_ngu: 1, so_giuong: 1, loai_view: "view biển", toa_nha: "À La Carte", so_anh: 1, anh: anhALaCarte, gia: { thuong: 1500000, cuoi_tuan: 1500000 } },
];
// DLM.6: đặt phòng của Hùng ở căn Anh Tuấn (H3, H4, H5)
export const BOOKING_ANH_TUAN_MAU = [
  { ma_can: "1103", ngay_nhan: "2026-10-18", ngay_tra: "2026-10-20", tien_phong: 1400000 },
  { ma_can: "1103", ngay_nhan: "2026-10-21", ngay_tra: "2026-10-22", tien_phong: 700000 },
  { ma_can: "2208", ngay_nhan: "2026-10-13", ngay_tra: "2026-10-14", tien_phong: 1500000 },
];
// Tài khoản sale của bản thử. Hùng kết nối cả hai chủ nhà, Lan chỉ Chị Hoa (US6 phần Test case).
// Mức cộng: DLM.2, DLM.3 (Hùng mặc định +400k; 1509 +200k, Sapphire 1103 +100k, À La Carte 2208 +300k).
export const SALE_MAU = [
  { zalo_id: "zalo-sale-hung", ten: "Sale Hùng", so_dien_thoai: "0912345678", muc_cong_mac_dinh: 400000, muc_cong_can: { "1509": 200000, "1103": 100000, "2208": 300000 } as Record<string, number> },
  { zalo_id: "zalo-sale-lan", ten: "Sale Lan", so_dien_thoai: null as string | null, muc_cong_mac_dinh: 0, muc_cong_can: {} as Record<string, number> },
  { zalo_id: "zalo-sale-nga", ten: "Sale Nga", so_dien_thoai: null as string | null, muc_cong_mac_dinh: 0, muc_cong_can: {} as Record<string, number> },
  { zalo_id: "zalo-sale-minh", ten: "Sale Minh", so_dien_thoai: null as string | null, muc_cong_mac_dinh: 0, muc_cong_can: {} as Record<string, number> },
];

// DLM.2: sale đã kết nối với Chị Hoa, theo thứ tự chip ở CN4 (mục "Người đặt, tiền phòng và tiền cọc" (US3) bước 1).
// Số điện thoại và ngày kết nối chỉ Sale Hùng có, lấy từ canvas CN7-04 ("0912 345 678 · kết nối từ 02/08/2026"); DLM chưa ghi.
// Sale còn lại chưa cho số: CN7-04 không hiện số và nút Gọi (api/ket-noi-link.md, PQ2.CHU).
export const SALE_CUA_CHI_HOA: { ten: string; so_dien_thoai: string | null; ket_noi_luc: string }[] = [
  { ten: "Sale Hùng", so_dien_thoai: "0912345678", ket_noi_luc: "2026-08-02T10:00:00+07:00" },
  { ten: "Sale Lan", so_dien_thoai: null, ket_noi_luc: "2026-08-15T09:00:00+07:00" },
  { ten: "Sale Nga", so_dien_thoai: null, ket_noi_luc: "2026-09-01T09:00:00+07:00" },
  { ten: "Sale Minh", so_dien_thoai: null, ket_noi_luc: "2026-09-10T09:00:00+07:00" },
];

// DLM.3: giá chủ một đêm tháng 10, 11, 12/2026; đêm cuối tuần là T6, T7 (mục "Ngày tính giá cuối tuần" (US4)). Căn khác chưa đặt giá.
export const GIA_THANG_MAU: Record<string, { thuong: number; cuoi_tuan: number }> = {
  "1509": { thuong: 900000, cuoi_tuan: 1300000 },
  "3402": { thuong: 800000, cuoi_tuan: 1100000 },
};
// Tháng đã có giá của từng căn. 1509: tháng 10 đến 12. 3402: tháng 6 đến 10 ("Giá 7 tháng" chỉ có sau khi áp dụng
// Tháng 11 – 12, US4-KB1); trước đó Tháng 11, 12 của 3402 ghi "Chưa đặt" (CN6, DLM.3).
export const THANG_CO_GIA_MAU: Record<string, string[]> = {
  "1509": ["2026-10", "2026-11", "2026-12"],
  "3402": ["2026-06", "2026-07", "2026-08", "2026-09", "2026-10"],
};
// DLM.3: dịp đặc biệt của 3402, tính cả hai đầu
// Dải ngày lễ Home247 đặt sẵn (bảng ngay_le). Chỉ dải có số liệu trong mục "Giá ngày lễ và dịp đặc biệt" (US8) / CN6-02: năm 2026 "Lễ 30/4 – 1/5" là T5 30/4 → CN 3/5.
// Quốc khánh 2/9, Tết Dương lịch, Tết Âm lịch chờ EN16 nạp, nên bản thử chưa có (api/gia.md GET /ngay-le).
export const NGAY_LE_MAU = [{ ten: "Lễ 30/4 – 1/5", tu_ngay: "2026-04-30", den_ngay: "2026-05-03" }];

export const GIA_DIP_MAU = [{ ma_can: "3402", tu_ngay: "2026-10-24", den_ngay: "2026-10-25", gia_moi_dem: 1300000 }];

// DLM.4: B1 đến B9. sale null là khách lẻ.
type BookingMau = {
  ma_can: string;
  sale: string | null;
  ngay_nhan: string;
  ngay_tra: string;
  tien_phong: number;
  trang_thai_tien: "chua_coc" | "da_coc_con_thu" | "da_thanh_toan";
  tien_coc: number | null;
};
const b = (ma_can: string, sale: string | null, ngay_nhan: string, ngay_tra: string, tien_phong: number,
  trang_thai_tien: BookingMau["trang_thai_tien"], tien_coc: number | null = null): BookingMau =>
  ({ ma_can, sale, ngay_nhan, ngay_tra, tien_phong, trang_thai_tien, tien_coc });
export const BOOKING_MAU: BookingMau[] = [
  b("1509", "Sale Hùng", "2026-10-10", "2026-10-12", 2200000, "da_coc_con_thu", 1000000),
  b("3402", "Sale Lan", "2026-10-17", "2026-10-19", 1900000, "chua_coc"),
  b("1509", "Sale Hùng", "2026-10-04", "2026-10-06", 1800000, "da_thanh_toan"),
  b("3402", "Sale Lan", "2026-10-05", "2026-10-07", 1600000, "da_thanh_toan"),
  b("1509", null, "2026-10-13", "2026-10-15", 1800000, "chua_coc"),
  b("3402", null, "2026-10-14", "2026-10-15", 800000, "da_thanh_toan"),
  b("1509", "Sale Minh", "2026-10-19", "2026-10-20", 900000, "da_thanh_toan"),
  b("3402", "Sale Minh", "2026-10-21", "2026-10-22", 800000, "da_thanh_toan"),
  b("3402", "Sale Minh", "2026-11-30", "2026-12-02", 1600000, "da_thanh_toan"),
];

// DLM.5: tháng 9 của Chị Hoa chỉ có tổng 9.600.000đ, không có đặt phòng nào (server dlm.sql cũng không có, nên API thật trả 0).
// Server giả cộng tổng này vào "tháng trước" của dữ liệu mẫu để khớp US2-KB13; chờ Tùng quyết (PR US2).
export const DOANH_THU_CU_MAU: Record<string, number> = { "2026-09": 9600000 };
