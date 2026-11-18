import type { Can, CanLichSale, SoPhongNgu, TinhTrangHomNay } from "../services/kieu";
import { chuDong } from "../services/mau-tin";
import { chuNgayNgan } from "../services/ngay";
import { chuLoaiView, chuPhongNgu } from "./can-hien-thi";
import { DUONG } from "./duong-dan";

// Chữ và quy tắc nhỏ của các màn US16: S6, S6-00, S6-02 đến S6-08 (mục "Danh sách căn và nguồn phòng" (US16) đến mục "Ghi booking đã chốt cho căn tự nhập" (US16), mục "Lịch phòng 7 ngày" (US16)). Tách khỏi màn để test.
// Chữ lấy theo YC và docs/design/screens/S6*. Chữ chưa có trong YC hay canvas ghi "chữ tạm", Tùng chốt sau (ghi trong PR).

export const TIEU_DE_S6 = "Nguồn phòng";
export const TEN_NHOM_S6 = { cua_toi: "Căn của tôi", chu_nha: "Chủ nhà đã kết nối", tu_nhap: "Căn tự nhập" } as const;
export const CHU_NHAN_CUA_TOI = "Căn của tôi";

// ---- S6-00 (mục "Danh sách căn và nguồn phòng" (US16) trạng thái rỗng) ----
export const CHU_S6_00_TIEU_DE = "Chưa có căn nào";
export const CHU_S6_00_MO_TA = "Thêm căn của bạn, xin lịch chủ nhà, hoặc tự nhập căn của chủ chưa dùng app.";
export const CHU_S6_00_THEM_CAN = "Thêm căn của tôi";
export const CHU_S6_00_XIN_LICH = "Gửi tin nhắn xin lịch cho chủ nhà";
export const CHU_THEM_CAN_TU_NHAP = "Thêm căn tự nhập";
export const CHU_THEM_CAN = "Thêm căn";

// ---- S6-08 (mục "Danh sách căn và nguồn phòng" (US16) bước 10, 11) ----
export const CHU_DA_XOA_TAI_KHOAN = "đã xóa tài khoản";
export const CHU_DA_XOA_PHU = "Căn và lịch không còn trên app";
export const CHU_BO_KHOI_DANH_SACH = "Bỏ khỏi danh sách";
export const chuToastBoDong = (ten: string | null) => `Đã bỏ ${ten ?? "chủ nhà"} khỏi danh sách`; // chữ tạm
export const CHU_LOI_BO_DONG = "Chưa bỏ được, bấm lại khi có mạng";

// ---- Gợi ý mời (mục "Danh sách căn và nguồn phòng" (US16) bước 4) ----
export const chuGoiYMoi = (tenChuCan: string) => `Mời ${tenChuCan} dùng app để lịch tự cập nhật, không cần gọi hỏi.`;
export const CHU_GUI_LOI_MOI = "Gửi lời mời qua Zalo";
export const CHU_DE_SAU_S6 = "Để sau vẫn gửi lời mời được. Chủ nhà chưa thấy tên và số của bạn."; // chữ tạm, theo CHU_DE_SAU_S5
// Tin mời chung (CH-077 còn mở: nội dung, link). Chữ tạm, chưa có link vì server chưa có link mời chủ căn tự nhập.
export const tinMoiChuCan = (tenChuCan: string) =>
  `Mời ${tenChuCan} dùng Home247 (Lịch phòng Hạ Long) để lịch phòng tự cập nhật, bên em không phải gọi hỏi mỗi lần khách hỏi. Mở Zalo, tìm "Home247" để dùng.`;
export const CHU_LOI_MO_ZALO_MOI = "Chưa mở được Zalo để gửi lời mời. Bấm lại";

// ---- Thẻ căn ----
export const tenCanSale = (c: { toa_nha?: string | { ten: string } | null; ma_can: string }) =>
  [typeof c.toa_nha === "string" ? c.toa_nha : c.toa_nha?.ten, c.ma_can].filter(Boolean).join(" ");

// "2PN · 3 giường · view biển": tòa nhà đã nằm ở tên (mục "Danh sách căn và nguồn phòng" (US16) bước 2, glossary Phòng ngủ và số giường, không ghi số khách)
export const dongPhuCanSale = (c: { so_phong_ngu: SoPhongNgu; so_giuong: number | null; loai_view: string | null }) =>
  [chuPhongNgu(c.so_phong_ngu), c.so_giuong ? `${c.so_giuong} giường` : null, chuLoaiView(c.loai_view)].filter(Boolean).join(" · ");

// Tình trạng hôm nay của căn của tôi (mục "Danh sách căn và nguồn phòng" (US16) bước 1): "Trống hôm nay ✓", "Có khách 12/10". Căn tự nhập không có (null).
export const chuTinhTrangHomNay = (t: TinhTrangHomNay | null | undefined): string | null => {
  if (!t) return null;
  if (t.loai === "trong") return "Trống hôm nay ✓";
  if (t.loai === "khach_den") return "Khách đến hôm nay";
  return t.ngay_tra ? `Có khách ${chuNgayNgan(t.ngay_tra)}` : "Có khách";
};

// Dòng căn tự nhập (US16-NT5): "Chú Bình · chưa dùng app · gọi hỏi lịch". Không bao giờ ghi "Trống hôm nay".
export const dongCanTuNhap = (c: Pick<Can, "ten_chu_can">) => `${c.ten_chu_can || "Chủ căn"} · chưa dùng app · gọi hỏi lịch`;

// Số điện thoại che giữa: "0904 *** 330" (S6-03, mục "Chi tiết căn tự nhập" (US16) bước 1)
export const chuSdtChe = (so: string | null | undefined): string => {
  const s = (so ?? "").replace(/[\s.\-]/g, "");
  if (s.length < 8) return s;
  return `${s.slice(0, 4)} *** ${s.slice(-3)}`;
};

// Chữ cái đầu của tên chủ nhà (S6)
export const chuCaiDau = (ten: string | null | undefined) => (ten ?? "?").trim().charAt(0).toUpperCase() || "?";

// ---- Số nhóm (US16-NT4, NT8): chủ nhà đã rút quyền không tính ----
export const demChuNhaConKetNoi = (dong: { da_xoa_tai_khoan: boolean }[]) => dong.filter((d) => !d.da_xoa_tai_khoan).length;

// ---- S6-02 (mục "Thêm căn tự nhập" (US16)) ----
export const CHU_S6_02_TIEU_DE = "Thêm căn tự nhập";
export const CHU_S6_02_GIAI_THICH =
  "Căn này không có lịch trống: mỗi lần khách hỏi, bạn gọi chủ hỏi. App lưu ảnh, giá và đặt phòng đã chốt cho bạn.";
export const CHU_QD11 = "Tên và số chỉ bạn thấy. Không chia cho sale khác, chủ nhà hay đội nhóm.";
export const CHU_GIA_CHU_GHI_CHU = "Giá chủ báo qua điện thoại. Không bắt buộc. Dùng để điền sẵn khi đặt phòng.";
export const chuToastThemCanTuNhap = (ma: string) => `Đã thêm căn tự nhập ${ma}`; // chữ tạm

// Số điện thoại chủ căn: 9 đến 15 chữ số, cho phép dấu + đầu (api/can-anh.md POST /can); bỏ khoảng trắng, chấm, gạch
export const chuanSdtChuCan = (chu: string): string | null => {
  const so = chu.replace(/[\s.\-]/g, "");
  return /^\+?\d{9,15}$/.test(so) ? so : null;
};

// Dòng "Còn thiếu" (mục "Thêm căn tự nhập" (US16) bước 6, NT1): bốn ô bắt buộc, đúng thứ tự trên màn; số giường, giá chủ không vào
export const dongConThieuTuNhap = (f: { ten: string; sdt: string; ma: string; phongNgu: SoPhongNgu | null }): string | null => {
  const thieu = [
    !f.ten.trim() && "tên chủ nhà",
    !chuanSdtChuCan(f.sdt) && "số điện thoại",
    !f.ma.trim() && "mã căn",
    f.phongNgu === null && "số phòng ngủ",
  ].filter(Boolean);
  return thieu.length ? `Còn thiếu: ${thieu.join(", ")}` : null;
};

// Ô giá: chỉ giữ chữ số, viết có dấu chấm ngăn nghìn; "" là chưa nhập. Tiền là số nguyên đồng.
export const docTien = (chu: string): number | null => {
  const so = chu.replace(/\D/g, "");
  return so === "" ? null : Number(so);
};
export const viTien = (chu: string): string => {
  const n = docTien(chu);
  return n === null ? "" : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

// ---- S6-03 (mục "Chi tiết căn tự nhập" (US16)) ----
export const CHU_CHUA_DUNG_APP = "chưa dùng app";
export const CHU_GOI_HOI_LICH = "Gọi hỏi lịch";
export const chuKhongCoLich = (tenChuCan: string) => `Căn này không có lịch trống. Khách hỏi ngày nào, bạn gọi ${tenChuCan} hỏi ngày đó.`;
export const CHU_DAT_PHONG_DA_GHI = "Đặt phòng bạn đã ghi";
export const CHU_CHI_BAN_THAY = "Chỉ bạn thấy";
export const CHU_GHI_CHU_DAT_PHONG = "Đây là đặt phòng của bạn, không phải lịch của căn. Ngày không có đặt phòng chưa chắc còn trống.";
export const CHU_CHUA_CO_DAT_PHONG = "Chưa có đặt phòng nào cho căn này";
export const CHU_HUONG_DAN_DAT_PHONG = "Có khách đã chốt với chủ căn thì bấm Đặt phòng để ghi lại, tính vào thống kê.";
export const CHU_NUT_DAT_PHONG = "Đặt phòng";
export const CHU_CAN_NAY = "Căn này";
export const CHU_GUI_CHO_KHACH = "Gửi cho khách";
export const CHU_GUI_CHO_KHACH_PHU = "Ảnh và thông tin, giá bán của bạn";
export const CHU_SUA_THONG_TIN = "Sửa thông tin căn";
export const CHU_SUA_THONG_TIN_PHU = "Ảnh, giá chủ, số phòng ngủ";
export const chuMoiDungApp = (ten: string) => `Mời ${ten} dùng app`;
export const CHU_MOI_DUNG_APP_PHU = "Khi đó bạn thấy lịch trống thật, không cần gọi";
export const CHU_XOA_CAN_TU_NHAP = "Xóa căn tự nhập";
export const chuXacNhanXoa = (ten: string) => `Xác nhận xóa ${ten}?`;
export const CHU_XOA_GHI_CHU = "Chỉ xóa khỏi Nguồn phòng của bạn.";
export const CHU_KHONG_XOA = "Không xóa";
export const chuToastXoaCan = (ten: string) => `Đã xóa ${ten}`; // chữ tạm
export const CHU_CHUA_THIET_KE_SUA = "Màn sửa căn tự nhập chưa thiết kế"; // CH-076 còn mở
export const CHU_GUI_KHACH_CHON_NGAY = "Chọn ngày khách hỏi ở Tìm phòng trống rồi gửi cho khách"; // chữ tạm, CH-078

// "01/11 → 03/11 (2 đêm)"
export const chuKhoangDem = (nhan: string, tra: string, soDem: number) => `${chuNgayNgan(nhan)} → ${chuNgayNgan(tra)} (${soDem} đêm)`;
export const chuTienChenh = (n: number) => (n >= 0 ? `+${chuDong(n)}` : `−${chuDong(-n)}`);

// ---- S6-04 (mục "Chi tiết chủ nhà và bỏ nguồn phòng" (US16)) ----
export const CHU_BO_NGUON = "Bỏ nguồn phòng này";
export const chuXacNhanBoNguon = (ten: string) => `Xác nhận bỏ ${ten}?`;
export const chuLoiNhacBoNguon = (ten: string) => `Bạn không thấy lịch của ${ten} nữa. Muốn xem lại phải xin link mới.`;
export const chuChoXem = (ten: string) => `${ten.toUpperCase()} CHO BẠN XEM`;
export const chuKetNoiTu = (iso: string | null) => (iso ? `kết nối từ ${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : null);
export const CHU_GOI = "Gọi";
export const chuToastBoNguon = (ten: string) => `Đã bỏ nguồn phòng ${ten}`; // chữ tạm, màn sau khi bỏ chưa thiết kế (mục "Chi tiết chủ nhà và bỏ nguồn phòng" (US16) bước 6)

// ---- S6-05, S6-06 (mục "Ghi booking đã chốt cho căn tự nhập" (US16)) ----
export const CHU_S6_05_TIEU_DE = "Đặt phòng";
export const chuDaChot = (ten: string, tenChuCan: string) => `${ten} · đã chốt với ${tenChuCan}`;
export const CHU_GHI_CHU_GIA_DIEN_SAN = "Giá điền sẵn từ giá chủ đã lưu và giá bán của bạn. Sửa nếu chủ căn báo giá khác.";
export const CHU_GHI_CHU_THEM_SAU = "Cọc, số khách, ghi chú: thêm sau trong đặt phòng nếu cần.";
export const CHU_DANG_LUU = "Đang lưu…";
export const chuBanLoi = (tra: number | null, thu: number | null): string | null => {
  if (tra === null || thu === null) return null;
  return thu >= tra ? `Bạn lời ${chuDong(thu - tra)}` : `Bạn lỗ ${chuDong(tra - thu)}`; // lỗ: chữ tạm
};
export const chuBaoTrung = (ngay: string) => `Ngày ${chuNgayNgan(ngay)} đã có đặt phòng của căn này. Chọn ngày khác.`;
export const chuToastDaLuuDatPhong = (nhan: string, tra: string) =>
  `Đã lưu đặt phòng ${chuNgayNgan(nhan)} → ${chuNgayNgan(tra)}. Tính vào thống kê tháng ${Number(nhan.slice(5, 7))}.`;
export const CHU_LOI_LUU_MANG = "Chưa lưu được, bấm lại khi có mạng";
export const CHU_LOI_LUU_CHUNG = "Có lỗi, chưa lưu được. Bấm lại";
export const TOI_DA_DEM_GHI = 30;

// ---- S1-04 (mục "Lịch phòng 7 ngày" (US16) bước 6) ----
export const CAC_CACH_XEP: { ma: "ten" | "gia_tang" | "ban_nhieu"; chu: string }[] = [
  { ma: "ten", chu: "Theo tên" },
  { ma: "gia_tang", chu: "Giá tăng dần" },
  { ma: "ban_nhieu", chu: "Bán nhiều nhất" },
];
export const CHU_GHI_CHU_XEP = "Căn của tôi luôn hiện đầu danh sách.";
export const chuCachXep = (ma: "ten" | "gia_tang" | "ban_nhieu") => CAC_CACH_XEP.find((c) => c.ma === ma)!.chu;

// Căn trên lưới S1: hàng "Villa Tuần Châu · Chú Bình · tự nhập" (mục "Lịch phòng 7 ngày" (US16) bước 3). Căn của tôi không có chủ nhà.
export const dongPhuLuoi = (c: CanLichSale) =>
  [c.nhom === "nguon_phong" ? c.chu_nha?.ten_hien_thi : c.loai === "tu_nhap" ? c.ten_chu_can : null, c.loai === "tu_nhap" ? "tự nhập" : null, chuPhongNgu(c.so_phong_ngu)]
    .filter(Boolean)
    .join(" · ");

// Chạm một căn thì mở màn nào (mục "Danh sách căn và nguồn phòng" (US16) bước 7a, 8, 9; mục "Lịch phòng 7 ngày" (US16) bước 8): căn của chủ nhà mở S3 (không phải S6-07: sale không ghi đặt phòng hay sửa giá
// trên căn của chủ nhà, US16-NT10), căn của tôi mở S6-07, căn tự nhập mở S6-03. Tên chủ nhà mở S6-04 (US16-NT11).
export const manKhiChamCan = (nhom: "cua_toi" | "nguon_phong" | "tu_nhap", canId: string) =>
  nhom === "cua_toi"
    ? { duong: DUONG.CAN_CUA_TOI, state: { can_id: canId } }
    : nhom === "tu_nhap"
      ? { duong: DUONG.CAN_TU_NHAP, state: { can_id: canId } }
      : { duong: DUONG.CAN_SALE_CHI_TIET, state: { can_id: canId, ngay_nhan: null, ngay_tra: null } };
export const manKhiChamChuNha = (ketNoiId: string) => ({ duong: DUONG.CHU_NHA_NGUON, state: { id: ketNoiId } });
