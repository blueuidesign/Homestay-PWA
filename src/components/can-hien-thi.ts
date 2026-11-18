import type { Can, SoPhongNgu } from "../services/kieu";

// Chip số phòng ngủ ở CN5-A1 (YC3.2 bước 1), 0 là Studio, 4 là 4PN+
export const CHIP_PHONG_NGU: { gia_tri: SoPhongNgu; chu: string }[] = [
  { gia_tri: 0, chu: "Studio" },
  { gia_tri: 1, chu: "1PN" },
  { gia_tri: 2, chu: "2PN" },
  { gia_tri: 3, chu: "3PN" },
  { gia_tri: 4, chu: "4PN+" },
];

export const chuPhongNgu = (n: SoPhongNgu) => CHIP_PHONG_NGU.find((c) => c.gia_tri === n)!.chu;

// Tên trên thẻ: mã toàn số ghi "Phòng 1509", mã chữ ghi nguyên ("Greenbay"), như canvas CN5
export const tenThe = (ma: string) => (/^\d+$/.test(ma) ? `Phòng ${ma}` : ma);

// Dòng thông tin thẻ căn (YC3.1 bước 2, glossary Phòng ngủ và số giường của căn):
// "2PN · 3 giường · view biển · ICON40"; chưa có số giường thì không có chữ "giường"; không ghi số khách
export const dongThongTin = (c: Pick<Can, "so_phong_ngu" | "so_giuong" | "loai_view" | "toa_nha">) =>
  [chuPhongNgu(c.so_phong_ngu), c.so_giuong ? `${c.so_giuong} giường` : null, chuLoaiView(c.loai_view), c.toa_nha]
    .filter(Boolean)
    .join(" · ");

// Loại view theo glossary (Danh sách lựa chọn dùng chung): Biển, Thành phố, Núi, không có Vịnh (YC3.2.2-NT3).
// ma là giá trị gửi lên server (`loai_view` của POST /can, PATCH /can/:id).
export const CHIP_LOAI_VIEW: { ma: string; chu: string }[] = [
  { ma: "bien", chu: "Biển" },
  { ma: "thanh_pho", chu: "Thành phố" },
  { ma: "nui", chu: "Núi" },
];
// Mã hoặc chữ cũ của căn mẫu ("view biển") thành mã chip; không khớp thì null
export const maLoaiView = (v: string | null | undefined) => {
  if (!v) return null;
  const k = v.toLowerCase().replace(/^view\s+/, "");
  return CHIP_LOAI_VIEW.find((c) => c.ma === v || c.chu.toLowerCase() === k)?.ma ?? null;
};
// Chữ trên thẻ căn: "view biển". Chữ lạ giữ nguyên.
export const chuLoaiView = (v: string | null | undefined) => {
  if (!v) return null;
  const ma = maLoaiView(v);
  return ma ? `view ${CHIP_LOAI_VIEW.find((c) => c.ma === ma)!.chu.toLowerCase()}` : v;
};

// Các thứ T2 đến CN, số 1 đến 7 (YC3.8)
export const TEN_THU = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
// Tên ô giá "Cuối tuần (T6, T7)" theo đêm đã chọn (YC3.8-NT1, NT2)
export const chuCacThuCuoiTuan = (dem: number[]) => [...dem].sort((a, b) => a - b).map((t) => TEN_THU[t - 1]).join(", ");
// Tên ô giá "Ngày thường (CN–T5)": các thứ còn lại. Một dải liền (vòng qua CN) thì ghi "đầu–cuối", không thì liệt kê.
export const chuCacThuNgayThuong = (dem: number[]) => {
  const con = [1, 2, 3, 4, 5, 6, 7].filter((t) => !dem.includes(t));
  if (con.length === 0) return "";
  if (con.length === 1) return TEN_THU[con[0] - 1];
  // Dải liền theo vòng T2..CN: đúng một chỗ đứt (thứ trước không còn lại)
  const dau = con.filter((t) => !con.includes(t === 1 ? 7 : t - 1));
  if (dau.length === 1) {
    const cuoi = con.find((t) => !con.includes(t === 7 ? 1 : t + 1))!;
    // Dải bắt đầu từ CN thì ghi CN đầu như mặc định "CN–T5"
    return `${TEN_THU[dau[0] - 1]}–${TEN_THU[cuoi - 1]}`;
  }
  return con.map((t) => TEN_THU[t - 1]).join(", ");
};
