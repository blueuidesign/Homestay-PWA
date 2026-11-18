import type { YeuCauChu, YeuCauSale, YeuCauTrung, LyDoYeuCau, LyDoTuChoi } from "../services/yeu-cau";
import { cacDem, chuNgayNgan, chuTien } from "../services/ngay";
import { chuTuoi } from "./tim-phong-hien-thi";

// Chữ và phép tính hiện của YC4.5 đến YC4.8 (S3-02, S3-03, S3-04, S3-05, S3-07, S3-08, S3-09, CN1-03, CN9, CN9-02, CN9-03).
// Chữ chưa vẽ ở canvas là chữ tạm, ghi "chữ tạm" ở bên dưới và liệt kê ở PR US15.
export const TIEU_DE_S302 = "Đặt phòng";
export const CHU_NHAN_CHU_NHA = "Nhắn chủ nhà (không bắt buộc)";
export const CHU_NUT_GUI_YEU_CAU = "Gửi yêu cầu đặt phòng";
export const CHU_DANG_GUI = "Đang gửi…";
export const CHU_GHI_CHU_S302 = "Chủ nhà nhận yêu cầu trong app. Thành đặt phòng khi chủ nhà chấp nhận.";
export const CHU_DE_SAU_YEU_CAU = "Để sau vẫn gửi yêu cầu được. Chủ nhà chưa thấy tên và số của bạn."; // chữ tạm, theo CHU_DE_SAU_S5
export const CHU_DE_SAU_CHAP_NHAN = "Để sau vẫn chấp nhận được. Sale chưa thấy tên và số của bạn."; // chữ tạm
export const CHU_CHUA_CHON_NGAY = "Chọn ngày ở trước khi gửi yêu cầu đặt phòng"; // chữ tạm: S3 mở từ lưới lịch không có ngày
export const CHU_NUT_CHON_NGAY = "Tìm phòng trống theo ngày"; // chữ tạm
export const CHU_CHUA_GUI_DUOC = "Chưa lưu được, bấm lại khi có mạng"; // HV2 bước 3
export const CHU_LOI_CHUNG = "Có lỗi, chưa làm được. Bấm lại";
// YC4.5 bước 3b, QD18 r8: "Không gửi được yêu cầu. Chủ nhà đã xóa tài khoản trên Home247."
export const chuLoiKhongGui = (lyDo: string) => `Không gửi được yêu cầu. ${lyDo}${/[.!?]$/.test(lyDo) ? "" : "."}`;
export const CHU_DA_DAT_ROI = "Căn này đã được đặt rồi";
export const CHU_NUT_TIM_CAN_KHAC = "Tìm căn khác cùng ngày";
export const CHU_LOI_MO_ZALO = "Chưa mở được Zalo. Bấm lại"; // chữ tạm, theo S5
export const CHU_KHONG_MO_DUOC_GOI = "Không mở được ứng dụng gọi"; // chữ tạm

export const tenCanYC = (can: { ten_toa_nha: string | null; ma_can: string }) => [can.ten_toa_nha, can.ma_can].filter(Boolean).join(" ");
export const chuKhoang = (nhan: string, tra: string) => `${chuNgayNgan(nhan)} → ${chuNgayNgan(tra)}`;
export const chuKhoangDem = (nhan: string, tra: string) => `${chuKhoang(nhan, tra)} (${cacDem(nhan, tra).length} đêm)`;
export const chuDong = (n: number) => `${chuTien(n)}đ`;
export const tenChuNha = (y: Pick<YeuCauSale, "chu_nha">) => y.chu_nha.ten_hien_thi ?? "Chủ nhà";
export const tenSale = (y: Pick<YeuCauChu, "sale">) => y.sale.ten_hien_thi ?? "Sale";

// Giờ, ngày theo giờ Việt Nam
const vn = (iso: string) => new Date(Date.parse(iso) + 7 * 3600_000).toISOString();
export const chuGio = (iso: string) => vn(iso).slice(11, 16);
export const chuNgayCuaLuc = (iso: string) => chuNgayNgan(vn(iso).slice(0, 10));

// S3-03
export const chuDangCho = (y: YeuCauSale) => `Đang chờ ${tenChuNha(y)} chấp nhận`;
export const chuDaGuiLuc = (y: Pick<YeuCauSale, "gui_luc">) =>
  `Đã gửi lúc ${chuGio(y.gui_luc)} trong app. Nhắn thêm qua Zalo để chủ nhà thấy nhanh hơn. Bạn được báo khi chủ nhà chấp nhận hoặc từ chối.`;
export const CHU_NUT_NHAN_ZALO = "Nhắn chủ nhà qua Zalo";
export const CHU_NUT_GOI_CHU = "Gọi chủ nhà";
export const CHU_NUT_HUY = "Hủy yêu cầu";
export const CHU_NUT_XAC_NHAN_HUY = "Xác nhận hủy yêu cầu?";
// Tin điền sẵn vào khung chat (zalo-hanh-vi 5.2)
export const tinNhanChuNha = (y: Pick<YeuCauSale, "can" | "ngay_nhan" | "ngay_tra">) =>
  `Em vừa gửi yêu cầu đặt phòng ${y.can.ma_can} ngày ${chuNgayNgan(y.ngay_nhan)} trong Home247, anh chị xem giúp em.`;

// S3-04
export const chuDaChapNhan = (y: YeuCauSale) => `✓ ${tenChuNha(y)} đã chấp nhận đặt phòng`;
export const chuVaoLich = (y: Pick<YeuCauSale, "ngay_nhan" | "ngay_tra">) =>
  `Đặt phòng đã vào lịch của chủ nhà. Ngày ${chuKhoang(y.ngay_nhan, y.ngay_tra)} hiện Kín với các sale khác.`;
export const CHU_NUT_VE_LICH_PHONG = "Về lịch phòng";

// S3-05
export const NHAN_YEU_CAU_BI_TU_CHOI = "Yêu cầu bị từ chối";
export const TEN_LY_DO: Record<LyDoTuChoi, string> = { da_co_khach: "Đã có khách đặt", dang_sua_phong: "Đang sửa phòng", ly_do_khac: "Lý do khác" };
export const chuLyDoTuChoi = (y: Pick<YeuCauSale, "ly_do" | "chu_nha" | "ngay_nhan" | "ngay_tra">) => {
  const ten = y.chu_nha.ten_hien_thi ?? "Chủ nhà";
  if (y.ly_do === "chu_nhan_dat_khac") return `${ten} đã nhận đặt phòng khác cho ${chuKhoang(y.ngay_nhan, y.ngay_tra)}.`;
  const ly = y.ly_do ? TEN_LY_DO[y.ly_do as LyDoTuChoi] : null;
  return `Lý do: ${ten} không nhận đặt phòng${ly ? ` · ${ly}` : ""}.`;
};
export const NHAN_CAN_TUONG_TU = "CĂN TƯƠNG TỰ TRỐNG CÙNG NGÀY";
export const CHU_NUT_XEM_TAT_CA = "Xem tất cả căn trống";
export const CHU_CHUA_TAI_CAN_TUONG_TU = "Chưa tải được các căn tương tự"; // chữ tạm
export const chuBanBan = (gia: number, tenChu: string | null) => `Bạn bán ${chuDong(gia)}${tenChu ? ` · ${tenChu}` : ""}`;

// S3-09
export const NHAN_YEU_CAU_HET_HAN = "Yêu cầu đã hết hạn";
export const chuHetHan = (y: YeuCauSale) =>
  `Yêu cầu đã hết hạn vì ${tenChuNha(y)} chưa trả lời trong 2 tuần. Gửi lúc ${chuGio(y.gui_luc)} ngày ${chuNgayCuaLuc(y.gui_luc)}.`;

// S3-08
export const NHAN_DA_HUY = "Đã hủy yêu cầu";
export const chuDaHuy = (y: YeuCauSale) =>
  `Bạn đã hủy yêu cầu đặt phòng ${chuKhoang(y.ngay_nhan, y.ngay_tra)}. ${tenChuNha(y)} không còn thấy yêu cầu này.`;

// CN1-03
export const chuKhoiYeuCau = (n: number) => `YÊU CẦU ĐẶT PHÒNG · ${n}`;
export const NHAN_CHO_BAN = "Chờ bạn";
export const CHU_NUT_XEM_TRA_LOI = "Xem và trả lời";
export const chuGuiTruoc = (luc: string, bayGio: number = Date.now()) => `gửi ${chuTuoi(luc, bayGio)}`;
export const chuTrungVoi = (trung: YeuCauTrung[]) => (trung.length === 0 ? null : `trùng ngày với ${trung.map((t) => t.ten_sale ?? "sale khác").join(", ")}`);
export const chuDongKhoi = (y: YeuCauChu, bayGio: number = Date.now()) => {
  const trung = chuTrungVoi(y.trung_yeu_cau ?? []);
  return `${chuKhoang(y.ngay_nhan, y.ngay_tra)} · ${chuGuiTruoc(y.gui_luc, bayGio)}${trung ? ` · ${trung}` : ""}`;
};

// CN9
export const CHU_NUT_CHAP_NHAN = "Chấp nhận đặt phòng";
export const CHU_NUT_TU_CHOI = "Từ chối";
export const CHU_NUT_GUI_TU_CHOI = "Gửi từ chối cho sale";
export const CHU_NUT_QUAY_LAI = "Quay lại";
export const NHAN_SALE_NHAN = "SALE NHẮN";
export const CHU_CHUA_CHON_LY_DO = "Chọn một lý do rồi gửi từ chối"; // chữ tạm: YC4-H3 chưa nói có bắt buộc chọn
// Các đêm trùng giữa hai yêu cầu: "18/10" khi một đêm, "17/10 → 19/10" khi nhiều đêm (chữ tạm)
export const chuDemTrung = (y: Pick<YeuCauChu, "ngay_nhan" | "ngay_tra">, t: Pick<YeuCauTrung, "ngay_nhan" | "ngay_tra">) => {
  const nhan = y.ngay_nhan > t.ngay_nhan ? y.ngay_nhan : t.ngay_nhan;
  const tra = y.ngay_tra < t.ngay_tra ? y.ngay_tra : t.ngay_tra;
  return cacDem(nhan, tra).length === 1 ? chuNgayNgan(nhan) : chuKhoang(nhan, tra);
};
export const chuCanhBaoTrung = (y: Pick<YeuCauChu, "ngay_nhan" | "ngay_tra">, t: YeuCauTrung) => {
  const ten = t.ten_sale ?? "sale khác";
  return `Trùng ${chuDemTrung(y, t)} với yêu cầu của ${ten}. Chấp nhận yêu cầu này thì yêu cầu của ${ten} bị từ chối và ${ten} được báo.`;
};

// CN9-02
export const chuDaNhan = (y: Pick<YeuCauChu, "can">) => `✓ Đã nhận đặt phòng ${y.can.ma_can}`;
export const chuDaVaoLich = (y: Pick<YeuCauChu, "sale">) => `Đặt phòng đã vào lịch. ${y.sale.ten_hien_thi ?? "Sale"} được báo.`;
export const chuBiTuChoiKem = (t: YeuCauTrung) => `Yêu cầu của ${t.ten_sale ?? "sale khác"} (${chuKhoang(t.ngay_nhan, t.ngay_tra)}) đã bị từ chối. ${t.ten_sale ?? "Sale khác"} được báo.`;
export const CHU_NUT_XEM_DAT_PHONG = "Xem đặt phòng";
export const CHU_NUT_VE_LICH = "Về lịch";

// CN9-03
export const chuDaTuChoi = (y: Pick<YeuCauChu, "sale">) => `Đã từ chối yêu cầu của ${y.sale.ten_hien_thi ?? "sale"}`;
export const chuTuChoiKem = (y: Pick<YeuCauChu, "sale" | "ly_do" | "ngay_nhan" | "ngay_tra">) => {
  const ly = y.ly_do && y.ly_do !== "chu_nhan_dat_khac" ? TEN_LY_DO[y.ly_do as LyDoTuChoi] : null;
  return `${y.sale.ten_hien_thi ?? "Sale"} được báo${ly ? ` kèm lý do "${ly}"` : ""}. Ngày ${chuKhoang(y.ngay_nhan, y.ngay_tra)} vẫn trống trong lịch.`;
};

// Yêu cầu không còn chờ khi chủ nhà mở lại (từ thông báo cũ, hoặc vừa đổi ở máy khác, HV3 bước 4). Chữ tạm.
export const chuKhongConCho = (y: Pick<YeuCauChu, "trang_thai" | "sale">) => {
  const sale = y.sale.ten_hien_thi ?? "Sale";
  if (y.trang_thai === "het_han") return `Yêu cầu của ${sale} đã hết hạn.`;
  if (y.trang_thai === "da_huy") return `${sale} đã hủy yêu cầu này.`;
  return null;
};

export const lyDoLaChuNhanDatKhac = (ly: LyDoYeuCau | null) => ly === "chu_nhan_dat_khac";

// Nhãn trạng thái ngắn trên các thẻ
export const NHAN_TRANG_THAI: Record<string, string> = {
  cho_chu: "Chờ chủ nhà",
  da_chot: "Đã chấp nhận",
  bi_tu_choi: NHAN_YEU_CAU_BI_TU_CHOI,
  het_han: NHAN_YEU_CAU_HET_HAN,
  da_huy: NHAN_DA_HUY,
};
