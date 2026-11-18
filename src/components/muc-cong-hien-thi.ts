import type { ChiTietCanSale, TrangThaiCanSale } from "../services/kieu";
import { cacDem, chuNgayNgan, chuTien } from "../services/ngay";
import { chuLoaiView, chuPhongNgu } from "./can-hien-thi";
import { DUONG } from "./duong-dan";

// Chữ và luật tính của S3 (YC5.4) và P10 (YC5.6). Không gọi server. Giá bán ở S3 lấy từ server; chỗ tính ở đây chỉ để vẽ ví dụ P10.

// Bộ chip Mức cộng của sale (glossary · Danh sách lựa chọn dùng chung), một bộ chung cho S3 và P10 (YC5.4-NT4, YC5.6-NT4)
export const CHIP_MUC_CONG: { gia_tri: number; chu: string }[] = [
  { gia_tri: 0, chu: "Không cộng" },
  { gia_tri: 100_000, chu: "+100k" },
  { gia_tri: 200_000, chu: "+200k" },
  { gia_tri: 300_000, chu: "+300k" },
  { gia_tri: 400_000, chu: "+400k" },
  { gia_tri: 500_000, chu: "+500k" },
];
export const CHU_TUY_CHON = "Tùy chọn";
export const MAX_MUC_CONG = 10_000_000; // giới hạn kỹ thuật của server (api/sale.md PUT /sale/can/:id/muc-cong)

// Chip đang chọn: mức nằm trong bộ thì chip đó, mức khác là "Tùy chọn"
export const chipDangChon = (soTien: number): number | "tuy_chon" => (CHIP_MUC_CONG.some((c) => c.gia_tri === soTien) ? soTien : "tuy_chon");

// "Không cộng", "+200k", "+250.000đ" (mức Tùy chọn)
export const chuMucCong = (soTien: number): string => CHIP_MUC_CONG.find((c) => c.gia_tri === soTien)?.chu ?? `+${chuTien(soTien)}đ`;

// Ô nhập "Tùy chọn": nhận "250.000", "250000", "250 000". Trống hay sai thì null.
export const docSoTienMucCong = (chu: string): number | null => {
  const so = chu.replace(/[.\s,]/g, "");
  if (!/^\d+$/.test(so)) return null;
  const n = Number(so);
  return n <= MAX_MUC_CONG ? n : null;
};
export const CHU_LOI_MUC_CONG = "Nhập số tiền từ 0 đến 10.000.000đ"; // chữ tạm: canvas chưa vẽ ô nhập Tùy chọn

export const chuDong = (n: number) => `${chuTien(n)}đ`;

// Giá bán một đêm: giá chủ cộng mức cộng, làm tròn lên 50.000đ từng đêm nếu bật [GIẢ ĐỊNH: GD13]
export const giaBanMotDem = (giaChu: number, mucCong: number, lamTron: boolean) =>
  lamTron ? Math.ceil((giaChu + mucCong) / 50_000) * 50_000 : giaChu + mucCong;
export const tongGiaBan = (giaChuTungDem: number[], mucCong: number, lamTron: boolean) =>
  giaChuTungDem.reduce((a, g) => a + giaBanMotDem(g, mucCong, lamTron), 0);

// Ví dụ ở P10 (YC5.6 bước 4, DLM.7): phòng 1509, 2 đêm, giá chủ nhà 1.300.000đ + 900.000đ
export const DEM_VI_DU_P10 = [1_300_000, 900_000];
export const viDuP10 = (mucCong: number, lamTron: boolean) => {
  const chu = DEM_VI_DU_P10.reduce((a, g) => a + g, 0);
  const khach = tongGiaBan(DEM_VI_DU_P10, mucCong, lamTron);
  return { gia_chu: chu, gia_khach: khach, ban_duoc: khach - chu };
};

// Dòng tên căn (YC5.4 bước 1): "ICON40 1509 · 2PN"
export const tenCanS3 = (c: Pick<ChiTietCanSale, "toa_nha" | "ma_can" | "so_phong_ngu">) =>
  [[c.toa_nha?.ten, c.ma_can].filter(Boolean).join(" "), chuPhongNgu(c.so_phong_ngu)].join(" · ");
// "2PN · 3 giường · view biển · Bãi Cháy" (YC5.4-NT5): có số giường thì ghi, chưa có thì chỉ số phòng ngủ. Không có số khách.
export const dongThongTinS3 = (c: Pick<ChiTietCanSale, "toa_nha" | "so_phong_ngu" | "so_giuong" | "loai_view">) =>
  [chuPhongNgu(c.so_phong_ngu), c.so_giuong ? `${c.so_giuong} giường` : null, chuLoaiView(c.loai_view), c.toa_nha?.khu_vuc ?? null].filter(Boolean).join(" · ");

export const chuAnhSo = (so: number, tong: number) => `${so}/${tong}`;
export const chuChuNha = (c: Pick<ChiTietCanSale, "chu_nha">) =>
  `${c.chu_nha.ten_hien_thi ?? "Chủ nhà"} · Chủ nhà · ${c.chu_nha.so_can_chia_se} căn`;
export const chuNgayO = (nhan: string, tra: string) => `${chuNgayNgan(nhan)} → ${chuNgayNgan(tra)} (${cacDem(nhan, tra).length} đêm)`;
export const chuGioNhanTra = (c: Pick<ChiTietCanSale, "gio_nhan" | "gio_tra">) => `Nhận phòng ${c.gio_nhan} · Trả phòng ${c.gio_tra}`;
export const CHU_GHI_CHU_CHI_BAN_THAY = "Chỉ bạn thấy giá này. Khách và chủ nhà không thấy phần cộng thêm.";
export const CHU_GHI_CHU_P10_DAU = "Cộng thêm vào giá chủ nhà mỗi đêm khi soạn tin gửi khách. Khách chỉ thấy giá đã cộng.";
export const CHU_GHI_CHU_P10_CUOI = "Khi soạn tin (S3) vẫn sửa được mức cộng cho từng căn.";
export const CHU_NUT_YEU_CAU = "Gửi yêu cầu đặt phòng";
export const CHU_NUT_GUI_KHACH = "Gửi cho khách";
export const CHU_KHONG_MO_DUOC_GOI = "Không mở được ứng dụng gọi"; // chữ tạm
export const CHU_CHUA_LUU = "Chưa lưu được, bấm lại khi có mạng"; // HV2 bước 3

// Nút "Gửi yêu cầu đặt phòng" mở S3-02 (US15) và "Gửi cho khách" mở S5 (US14) với đúng căn và ngày đang xem (YC5.4-NT3, bước 7, 8).
// Hai màn đó chưa làm: route là màn tạm, state đã đúng để US14, US15 nhận.
export const diDenTuS3 = (loai: "yeu_cau" | "gui_khach", canId: string, nhan: string | null, tra: string | null) => ({
  duong: loai === "yeu_cau" ? DUONG.YEU_CAU_DAT_PHONG : DUONG.GUI_KHACH,
  state: { can_id: canId, ngay_nhan: nhan, ngay_tra: tra } satisfies TrangThaiCanSale,
});
