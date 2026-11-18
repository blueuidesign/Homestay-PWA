import type { CanTim, DieuKienTim, GoiYTim, MucTimGanDay } from "../services/kieu";
import { cacDem, chuNgayNgan, chuTien, congNgay } from "../services/ngay";
import { CHIP_LOAI_VIEW, chuLoaiView, chuPhongNgu } from "./can-hien-thi";

// Chữ và luật tính của tìm phòng trống (US12, mục "Tìm phòng trống theo ngày" (US12), mục "Kết quả tìm phòng" (US12)). Không gọi server.

// Điều kiện kèm tên tòa để vẽ ("ICON40" thay vì id). Đi từ màn tìm sang màn kết quả qua state điều hướng.
export type TenToa = Record<string, string>;
export type TrangThaiTim = { dk: DieuKienTim; ten_toa: TenToa };

type PhongNgu = 1 | 2 | 3 | 4;
// Số phòng ngủ ở lọc thêm: 1PN, 2PN, 3PN, 4PN+ (mục "Tìm phòng trống theo ngày" (US12) bước 3). Không có Studio.
export const CHIP_PHONG_NGU_TIM: { gia_tri: number; chu: string }[] = ([1, 2, 3, 4] as PhongNgu[]).map((n) => ({ gia_tri: n, chu: chuPhongNgu(n) }));
export const CHIP_VIEW_TIM = CHIP_LOAI_VIEW;

// Số đêm: chip 1, 2, 3, 4 hoặc "Tùy chọn" (chọn ngày trả)
export type ChipDem = 1 | 2 | 3 | 4 | "tuy_chon";
export const CHIP_DEM: ChipDem[] = [1, 2, 3, 4, "tuy_chon"];
export const chuChipDem = (c: ChipDem) => (c === "tuy_chon" ? "Tùy chọn" : String(c));

export type FormTim = { ngayNhan: string; chipDem: ChipDem; traTuyChon: string; phong: number[]; view: string[]; toa: string[] };
export const formTimTrong = (): FormTim => ({ ngayNhan: "", chipDem: 1, traTuyChon: "", phong: [], view: [], toa: [] });

// Ngày trả = ngày nhận cộng số đêm (US12-NT2). Chưa có ngày nhận thì chưa có ngày trả.
export const ngayTraCuaForm = (f: FormTim): string => {
  if (!f.ngayNhan) return "";
  if (f.chipDem !== "tuy_chon") return congNgay(f.ngayNhan, f.chipDem);
  return f.traTuyChon > f.ngayNhan ? f.traTuyChon : congNgay(f.ngayNhan, 1);
};
export const soDemCuaForm = (f: FormTim) => (f.ngayNhan ? cacDem(f.ngayNhan, ngayTraCuaForm(f)).length : 0);

// Nút "Tìm phòng trống" mờ khi chưa có ngày nhận (US12-NT1)
export const CHU_NUT_TIM = "Tìm phòng trống";
export const CHU_NUT_TIM_CHUA_CO_NGAY = "Chọn ngày nhận để tìm phòng";
export const nutTimBamDuoc = (f: FormTim) => f.ngayNhan !== "";
export const chuNutTim = (f: FormTim) => (nutTimBamDuoc(f) ? CHU_NUT_TIM : CHU_NUT_TIM_CHUA_CO_NGAY);

export const dieuKienTuForm = (f: FormTim): DieuKienTim => ({
  ngay_nhan: f.ngayNhan,
  ngay_tra: ngayTraCuaForm(f),
  so_phong_ngu: [...f.phong].sort((a, b) => a - b),
  loai_view: CHIP_LOAI_VIEW.map((v) => v.ma).filter((m) => f.view.includes(m)),
  toa_nha_id: [...f.toa],
});

// Điền sẵn điều kiện của một lần tìm (US12-NT4)
export const formTuDieuKien = (dk: DieuKienTim): FormTim => {
  const dem = cacDem(dk.ngay_nhan, dk.ngay_tra).length;
  const ngan = dem >= 1 && dem <= 4;
  return {
    ngayNhan: dk.ngay_nhan,
    chipDem: ngan ? (dem as ChipDem) : "tuy_chon",
    traTuyChon: ngan ? "" : dk.ngay_tra,
    phong: [...dk.so_phong_ngu],
    view: [...dk.loai_view],
    toa: [...dk.toa_nha_id],
  };
};
export const dieuKienTuMuc = (m: MucTimGanDay): TrangThaiTim => ({
  dk: { ngay_nhan: m.ngay_nhan, ngay_tra: m.ngay_tra, so_phong_ngu: m.so_phong_ngu, loai_view: m.loai_view, toa_nha_id: m.toa_nha.map((t) => t.id) },
  ten_toa: Object.fromEntries(m.toa_nha.map((t) => [t.id, t.ten])),
});

export const bat = <T,>(ds: T[], v: T): T[] => (ds.includes(v) ? ds.filter((x) => x !== v) : [...ds, v]);

export const chuKhoangNgay = (dk: Pick<DieuKienTim, "ngay_nhan" | "ngay_tra">) => `${chuNgayNgan(dk.ngay_nhan)} → ${chuNgayNgan(dk.ngay_tra)}`;
export const chuSoDem = (dk: Pick<DieuKienTim, "ngay_nhan" | "ngay_tra">) => `${cacDem(dk.ngay_nhan, dk.ngay_tra).length} đêm`;

// Các bộ lọc đang bật, dạng chữ: "2PN, 3PN", "view biển", "ICON40"
const chuPhongLoc = (ds: number[]) =>
  [...ds]
    .sort((a, b) => a - b)
    .map((n) => chuPhongNgu(n as PhongNgu))
    .join(", ");
const chuViewLoc = (ds: string[]) =>
  ds
    .map((m) => chuLoaiView(m))
    .filter(Boolean)
    .join(", ");
const chuToaLoc = (dk: DieuKienTim, ten: TenToa) => dk.toa_nha_id.map((id) => ten[id] ?? id).join(", ");

// "10/10 → 12/10 · 2PN, 3PN · 2 đêm" (mục "Kết quả tìm phòng" (US12) bước 1)
export const chuDieuKien = (dk: DieuKienTim, ten: TenToa) =>
  [chuKhoangNgay(dk), chuPhongLoc(dk.so_phong_ngu), chuViewLoc(dk.loai_view), chuToaLoc(dk, ten), chuSoDem(dk)].filter(Boolean).join(" · ");

// Dòng "Tìm gần đây": "10/10 → 12/10 · 2PN · ICON40" (mục "Tìm phòng trống theo ngày" (US12) bước 1). Không ghi số đêm.
export const chuTimGanDay = (m: MucTimGanDay) =>
  [chuKhoangNgay(m), chuPhongLoc(m.so_phong_ngu), chuViewLoc(m.loai_view), m.toa_nha.map((t) => t.ten).join(", ")].filter(Boolean).join(" · ");

export const chuSoCanTrong = (n: number) => `${n} căn trống`;
export const chuDaChon = (n: number) => `Đã chọn ${n} căn`;
export const CHU_GUI_KHACH = "Gửi cho khách";

// Nhóm kết quả (Tùng 04/11/2026, "Phương án tách"): CỦA TÔI, NGUỒN PHÒNG, rồi TỰ NHẬP · chưa biết lịch. Căn tự nhập không đứng chung "CỦA TÔI".
// laCanCuaToi vẫn gồm căn tự nhập: chỉ dùng cho việc chạm thẻ (S3 chưa có), không dùng để chia nhóm.
export const laCanCuaToi = (c: Pick<CanTim, "nhom">) => c.nhom === "cua_toi" || c.nhom === "tu_nhap";
export const chiaNhomKetQua = (can: CanTim[]) => ({
  cuaToi: can.filter((c) => c.nhom === "cua_toi"),
  nguon: can.filter((c) => c.nhom !== "cua_toi" && c.nhom !== "tu_nhap"),
  tuNhap: can.filter((c) => c.nhom === "tu_nhap"),
});
export const NHAN_NHOM_TU_NHAP = "Tự nhập · chưa biết lịch";

export const tenCanTim = (c: Pick<CanTim, "toa_nha" | "ma_can">) => [c.toa_nha?.ten, c.ma_can].filter(Boolean).join(" ");

// "2PN · 3 giường · view biển · Chị Hoa" (mục "Kết quả tìm phòng" (US12) bước 1: tên căn, số phòng ngủ, chủ nhà, view)
export const dongPhuCanTim = (c: CanTim) =>
  [chuPhongNgu(c.so_phong_ngu), c.so_giuong ? `${c.so_giuong} giường` : null, chuLoaiView(c.loai_view), c.chu_nha?.ten_hien_thi ?? null]
    .filter(Boolean)
    .join(" · ");

export const chuDong = (n: number) => `${chuTien(n)}đ`;
// "2.200.000đ · bạn bán 2.600.000đ". Không có tổng (căn tự nhập chưa giá, đêm chưa đặt giá): trả null. Căn đã chia sẻ luôn có giá (QD20 r2 điểm 3).
export const chuGiaCanTim = (c: CanTim): string | null => {
  const chu = c.tong_gia_chu;
  const ban = c.tong_gia_ban;
  const phan: string[] = [];
  if (chu !== undefined && chu !== null) phan.push(chuDong(chu));
  if (ban !== undefined && ban !== null) phan.push(`bạn bán ${chuDong(ban)}`);
  return phan.length ? phan.join(" · ") : null;
};

// "2 giờ trước". Dưới 1 phút: "vừa xong".
export const chuTuoi = (luc: string, bayGio: number = Date.now()) => {
  const phut = Math.max(0, Math.floor((bayGio - Date.parse(luc)) / 60000));
  if (phut < 1) return "vừa xong";
  if (phut < 60) return `${phut} phút trước`;
  if (phut < 24 * 60) return `${Math.floor(phut / 60)} giờ trước`;
  return `${Math.floor(phut / (24 * 60))} ngày trước`;
};

// Độ tươi lịch (mục "Kết quả tìm phòng" (US12) bước 3): căn của tôi "luôn đúng"; căn tự nhập không có lịch, không bao giờ ghi "trống"
export const CHU_LICH_CUA_BAN = "Lịch của bạn, luôn đúng";
export const chuDoTuoi = (c: CanTim, bayGio: number = Date.now()): string | null => {
  if (c.khong_co_lich || c.nhom === "tu_nhap") {
    const ten = c.ten_chu_can ? c.ten_chu_can.charAt(0).toLowerCase() + c.ten_chu_can.slice(1) : "chủ nhà";
    return `Tự nhập · không có lịch, gọi ${ten} hỏi`;
  }
  if (c.nhom === "cua_toi") return CHU_LICH_CUA_BAN;
  return c.lich_cap_nhat_luc ? `Lịch cập nhật ${chuTuoi(c.lich_cap_nhat_luc, bayGio)}` : null;
};

// S2-00 (mục "Tìm phòng trống theo ngày" (US12) bước 6). Chữ tạm: câu giải thích ghép từ điều kiện, dòng gợi ý.
export const CHU_KHONG_CO_CAN_TRONG = "Không có căn trống";
export const CHU_GHI_CHU_TU_NHAP = "Căn tự nhập không có lịch tự động. Gọi chủ nhà để hỏi.";
export const chuGiaiThichKhongTrong = (dk: DieuKienTim, ten: TenToa) => {
  const loc = [chuPhongLoc(dk.so_phong_ngu), chuViewLoc(dk.loai_view)].filter(Boolean).join(" ");
  const toa = chuToaLoc(dk, ten);
  return `Các căn${loc ? " " + loc : ""}${toa ? " ở " + toa : ""} đã kín ${chuKhoangNgay(dk)}. Thử một trong các cách sau:`;
};
export const chuGoiY = (g: GoiYTim, goc: DieuKienTim): string => {
  if (g.loai === "doi_ngay") return `Đổi sang ${chuKhoangNgay(g.dieu_kien)}`;
  if (g.loai === "bo_loc") {
    if (goc.toa_nha_id.length > 0 && g.dieu_kien.toa_nha_id.length === 0) return "Bỏ lọc tòa nhà";
    if (goc.loai_view.length > 0 && g.dieu_kien.loai_view.length === 0) return "Bỏ lọc loại view";
    return "Bỏ lọc số phòng ngủ";
  }
  return "Đổi số phòng ngủ";
};
export const CHU_SUA_TIM_KIEM = "Sửa tìm kiếm";
