import { ngayVN, congNgay } from "../services/ngay";

// Chữ hiển thị của A6, A7, A8 (canvas Auth, States; docs/design/screens/A6.md, A7.md, A8.md)

// ---- A6 ----
export const CHU_A6_TIEU_DE = "Xin chủ nhà cho xem lịch";
export const CHU_A6_MO_TA = "Gửi tin này cho chủ nhà qua Zalo. Chủ nhà bấm link và đồng ý là bạn thấy lịch phòng trống.";
export const CHU_A6_TIN_SE_GUI = "Tin nhắn sẽ gửi";
export const CHU_A6_MOT_LINK = "Một link dùng được cho nhiều chủ nhà.";
export const CHU_A6_SAU_KHI_GUI = "Sau khi gửi";
export const CAC_BUOC_SAU_KHI_GUI = [
  { ten: "Chủ nhà mở link trong Zalo", phu: "Chủ chưa dùng app sẽ đăng nhập bằng Zalo trước" },
  { ten: 'Chủ nhà bấm "Đồng ý cho xem lịch"', phu: "Bạn nhận thông báo ngay" },
  { ten: "Lịch của chủ hiện trong Nguồn phòng", phu: "Tìm phòng trống được ngay" },
];
// A6-P1: popup xin tên và số, phần chung của US5 (components/xin-so.tsx). Chữ riêng của A6.
export const CHU_LY_DO_A6 =
  "Chủ nhà nhận ra bạn qua tên và số điện thoại khi mở link xin lịch. Home247 lấy tên, ảnh và số từ Zalo trong một lần, lưu vào hồ sơ của bạn. Khách không bao giờ thấy số này.";
export const CHU_DE_SAU_A6 = "Để sau vẫn gửi được tin. Chủ nhà chưa thấy tên và số của bạn.";
export const CHU_LOI_ZALO_GUI = "Chưa mở được Zalo để gửi tin. Bấm lại";
export const CHU_LOI_SAO_CHEP = "Chưa sao chép được. Bấm lại";

// ---- A7 ----
export const CHU_A7_DA_GUI = "✓ Đã gửi qua Zalo. Đang chờ chủ nhà đồng ý.";
export const CHU_A7_DANG_CHO = "Đang chờ chủ nhà đồng ý";
export const CHU_A7_NHAN_LINK = "Link xin lịch của bạn";
export const CHU_A7_GHI_CHU =
  "Tin được gửi từ cửa sổ của Zalo nên app không biết bạn đã gửi cho ai. App chỉ đếm số lần bạn gửi và số chủ nhà đã đồng ý.";
export const CHU_A7_NHAC = "Chủ nhà lâu chưa trả lời? Nhắn hoặc gọi để nhắc chủ mở link.";
export const CHU_A7_CHUA_GUI = "Chưa gửi link xin lịch";
export const CHU_A7_CHUA_GUI_PHU = "Gửi tin xin lịch cho chủ nhà qua Zalo. Chủ nhà đồng ý là lịch hiện ở đây.";
export const CHU_A7_NUT_CHUA_GUI = "Gửi tin nhắn xin lịch cho chủ nhà";

export const chuSoLanGui = (n: number) => `${n} lần đã gửi qua Zalo`;
export const chuSoChuNhaDongY = (n: number) => `${n} chủ nhà đã đồng ý`;

// "HH:mm" theo giờ Việt Nam
export const chuGioVN = (luc: number) => {
  const d = new Date(luc + 7 * 3600_000);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
};

// "Lần gửi gần nhất lúc 14:20 hôm nay" (A7), "lúc vừa xong" (A7-01). Quá hôm qua thì ghi ngày.
export const chuLanGuiCuoi = (luc: string | null, bayGio: number = Date.now()) => {
  if (!luc) return null;
  const t = Date.parse(luc);
  if (bayGio - t < 60_000) return "Lần gửi gần nhất lúc vừa xong.";
  const ngay = ngayVN(t);
  const hom = ngayVN(bayGio);
  const khi = ngay === hom ? "hôm nay" : ngay === congNgay(hom, -1) ? "hôm qua" : `ngày ${ngay.slice(8, 10)}/${ngay.slice(5, 7)}`;
  return `Lần gửi gần nhất lúc ${chuGioVN(t)} ${khi}.`;
};

// ---- A8 ----
export const CHU_A8_TIEU_DE = "Lời mời xem lịch";
export const CHU_A8_XIN = "xin xem lịch phòng trống của bạn để gửi khách.";
export const chuA8SaleSeThay = (ten: string | null) => `Nếu đồng ý, ${ten ?? "sale"} sẽ thấy`;
export const CAC_DONG_SALE_THAY = [
  "Phòng trống hay đã có người đặt, không thấy tên người đặt",
  "Giá từng đêm",
];
export const CHU_A8_COC = "Đã cọc hay chưa (không thấy số tiền)";
export const CHU_A8_KHONG_THAY = "Không bao giờ thấy tên, số điện thoại khách và doanh thu.";
export const CHU_A8_CHUA_TK = "💡 Chưa có tài khoản? Bấm Đồng ý để đăng nhập bằng Zalo, sau đó thêm căn.";
export const CHU_A8_NUT_DONG_Y = "Đồng ý cho xem lịch";
export const CHU_A8_NUT_TU_CHOI = "Từ chối";
// A8-P1: popup xin tên và số của chủ nhà (phần chung của US5)
export const CHU_DE_SAU_A8 = "Để sau vẫn cho sale xem lịch được. Sale chưa thấy tên và số của bạn.";
// A8-01
export const CHU_A8_01_TIEU_DE = "Bạn không còn xem được mục này";
export const CHU_A8_01_PHU = "Link xin lịch đã hết hạn, sale đã xóa tài khoản, hoặc bạn đã ngừng cho sale này xem lịch.";
export const CHU_A8_01_NUT = "Về Lịch";
// CN7-06 (toast sau khi đồng ý) và A4-01 (chủ nhà mới)
export const chuToastDaChoXem = (ten: string | null) => `Đã cho ${ten ?? "sale"} xem lịch. ${ten ?? "Sale"} nằm trong nhóm Đã kết nối`;
export const chuDaiA401 = (ten: string | null) => `✓ Bạn đã cho ${ten ?? "sale"} xem lịch. Thêm căn để ${ten ?? "sale"} thấy phòng trống.`;
