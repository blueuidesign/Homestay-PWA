import type { CanThongBao, MucThongBao } from "../services/kieu";
import { chuTien, chuNgayNgan, congNgay, ngayVN } from "../services/ngay";
import { chuGioVN } from "./xin-lich-hien-thi";

// Chữ của P13 (thông báo), toast A9 và A9-02 (US17). Chữ theo docs/design/screens/P13.md, P13-00, P13-01, P13-02, A9, A9-02.
// du_lieu theo từng loại ở api/thong-bao-thong-ke-xuat.md "Danh sách loại thông báo": không giá bán, không tên khách (PQ19).

type DuLieu = Record<string, unknown>;
const chuoi = (v: unknown): string | null => (typeof v === "string" && v !== "" ? v : null);
const canCua = (v: unknown): CanThongBao | null =>
  v && typeof v === "object" && typeof (v as CanThongBao).ma_can === "string" ? (v as CanThongBao) : null;
const so = (v: unknown): number | null => (typeof v === "number" ? v : null);

// "1, 2 và 3"
export const noiVi = (ds: string[]) => (ds.length <= 1 ? ds.join("") : `${ds.slice(0, -1).join(", ")} và ${ds[ds.length - 1]}`);

// "ICON40 1509"
export const chuCanTb = (c: CanThongBao) => (c.ten_toa_nha ? `${c.ten_toa_nha} ${c.ma_can}` : c.ma_can);

// "ICON40 1509 và 3402" (cùng tòa: tên tòa một lần), "Sapphire 1103 và À La Carte 2208" (khác tòa)
export const chuCacCan = (cans: CanThongBao[]) => {
  const theoToa = new Map<string, string[]>();
  for (const c of cans) theoToa.set(c.ten_toa_nha ?? "", [...(theoToa.get(c.ten_toa_nha ?? "") ?? []), c.ma_can]);
  return noiVi([...theoToa].map(([toa, ma]) => `${toa ? `${toa} ` : ""}${noiVi(ma)}`));
};
const cacCanCua = (d: DuLieu): CanThongBao[] => (Array.isArray(d.can) ? d.can.map(canCua).filter((c): c is CanThongBao => c !== null) : []);
const dai = (nhan: unknown, tra: unknown) => `${chuNgayNgan(String(nhan))} → ${chuNgayNgan(String(tra))}`;
const tenChu = (d: DuLieu) => chuoi(d.ten_chu_nha) ?? "Chủ nhà";

// ---- Toast A9, A9-02 ----
export const CHU_NUT_XEM = "Xem";
export const CHU_PHU_CHUA_CO_CAN = "Căn của chủ nhà sẽ vào Nguồn phòng khi chủ nhà thêm căn"; // chữ tạm, canvas không vẽ trường hợp chưa có căn [MỞ: CH-061]
export type NoiDungToast = { chu: string; phu: string };

// ds: du_lieu của từng lần đồng ý (một mục gom gồm nhiều lần). Một chủ nhà: A9. Nhiều chủ nhà: A9-02 ("3 chủ nhà … 7 căn mới").
export function toastDongY(ds: DuLieu[]): NoiDungToast {
  if (ds.length === 1) {
    const cans = cacCanCua(ds[0]);
    return {
      chu: `${tenChu(ds[0])} đã đồng ý cho bạn xem lịch`,
      phu: cans.length > 0 ? `${chuCacCan(cans)} đã vào Nguồn phòng` : CHU_PHU_CHUA_CO_CAN,
    };
  }
  const tong = ds.reduce((t, d) => t + (so(d.so_can) ?? cacCanCua(d).length), 0);
  return {
    chu: `${ds.length} chủ nhà đã đồng ý cho bạn xem lịch`,
    phu: `${noiVi(ds.map(tenChu))} · ${tong} căn mới trong Nguồn phòng`,
  };
}

// du_lieu của các lần đồng ý trong một mục, cũ trước mới sau ("Chị Hoa và Anh Tuấn": Chị Hoa đồng ý trước). Server trả mới trước.
const cuDen = (m: MucThongBao): DuLieu[] => (m.du_lieu_gom ? [...m.du_lieu_gom].reverse() : [m.du_lieu]);

export type TrangThaiNghe = { daThay: Set<string> | null };

// Một lần hỏi GET /thong-bao (mỗi 60 giây, và khi quay lại từ nền): toast cho mục chu_dong_y_ket_noi có dòng chưa thấy ở lần trước
// (server.md 1.11, api/thong-bao-thong-ke-xuat.md). Lần hỏi đầu chỉ ghi nhớ, không toast: thông báo cũ là việc của popup lúc mở app (US30).
// Mục gom cả cũ lẫn mới thì toast tính cả nhóm (KB11: "2 chủ nhà … 4 căn mới"). Nhiều mục mới cùng lúc thì gom một toast.
export function chonToastMoi(muc: MucThongBao[], st: TrangThaiNghe): NoiDungToast | null {
  const tatCa = muc.flatMap((m) => m.ids);
  if (st.daThay === null) {
    st.daThay = new Set(tatCa);
    return null;
  }
  const daThay = st.daThay;
  const moi = muc.filter((m) => m.loai === "chu_dong_y_ket_noi" && m.ids.some((id) => !daThay.has(id)));
  for (const id of tatCa) daThay.add(id);
  if (moi.length === 0) return null;
  return toastDongY([...moi].reverse().flatMap(cuDen));
}

// ---- P13 ----
export const CHU_P13_TIEU_DE = "Thông báo";
export const CHU_P13_RONG = "Chưa có thông báo nào";
export const CHU_P13_RONG_PHU = "Khi chủ nhà đồng ý cho xem lịch hay có yêu cầu đặt phòng, thông báo hiện ở đây.";
export const CHU_P13_DANH_DAU = "Đánh dấu đã đọc";
export const chuChuaDoc = (n: number) => `${n} chưa đọc`;

export type DongP13 = { tieuDe: string; chiTiet: string | null };

export function dongThongBao(m: MucThongBao): DongP13 {
  const d = m.du_lieu;
  const can = canCua(d.can);
  const kyTu = (c: CanThongBao | null, nhan: unknown, tra: unknown) => `${c ? `${chuCanTb(c)} · ` : ""}${dai(nhan, tra)}`;
  switch (m.loai) {
    case "chu_dong_y_ket_noi": {
      const ds = cuDen(m);
      const t = toastDongY(ds);
      return { tieuDe: ds.length === 1 ? `${tenChu(ds[0])} đồng ý cho bạn xem lịch` : `${ds.length} chủ nhà đồng ý cho bạn xem lịch`, chiTiet: t.phu };
    }
    case "chu_ngung_ket_noi":
      return {
        tieuDe: `${tenChu(d)} đã ngừng cho bạn xem lịch`,
        chiTiet: `Các căn của ${tenChu(d)} không còn trong Nguồn phòng. Đặt phòng cũ của bạn với ${tenChu(d)} vẫn xem được trong Thống kê.`,
      };
    case "chu_xoa_tai_khoan":
      return { tieuDe: `${tenChu(d)} đã xóa tài khoản`, chiTiet: `Các căn của ${tenChu(d)} không còn trong lịch. Đặt phòng đã chốt vẫn giữ.` };
    case "chu_sua_booking": {
      const canCu = canCua(d.can_cu);
      const doiNgay = d.ngay_nhan_cu !== d.ngay_nhan || d.ngay_tra_cu !== d.ngay_tra;
      const tienCu = so(d.tien_phong_cu);
      const tien = so(d.tien_phong);
      const doiTien = tienCu !== null && tien !== null && tienCu !== tien;
      const dau = canCu && can ? `${chuCanTb(canCu)} đổi sang ${chuCanTb(can)} · ` : can ? `${chuCanTb(can)} · ` : "";
      return {
        tieuDe: `${tenChu(d)} đã sửa đặt phòng của bạn`,
        chiTiet: `${dau}${dai(d.ngay_nhan_cu, d.ngay_tra_cu)}${doiNgay ? ` đổi thành ${dai(d.ngay_nhan, d.ngay_tra)}` : ""}${doiTien ? `, giá chủ nhà ${chuTien(tienCu ?? 0)}đ → ${chuTien(tien ?? 0)}đ` : ""}`,
      };
    }
    case "chu_chap_nhan_yeu_cau":
      return { tieuDe: `${tenChu(d)} đã chấp nhận đặt phòng`, chiTiet: kyTu(can, d.ngay_nhan, d.ngay_tra) };
    case "chu_tu_choi_yeu_cau":
      return { tieuDe: "Yêu cầu đặt phòng bị từ chối", chiTiet: kyTu(can, d.ngay_nhan, d.ngay_tra) };
    case "yeu_cau_het_han":
      return { tieuDe: "Yêu cầu đặt phòng đã hết hạn", chiTiet: kyTu(can, d.ngay_nhan, d.ngay_tra) };
    case "can_da_gui_co_nguoi_dat":
      return { tieuDe: "Căn bạn đã gửi khách vừa có người đặt", chiTiet: kyTu(can, d.ngay_nhan, d.ngay_tra) };
    default:
      // Loại chưa vẽ ở P13 (chu_them_can, chu_ghi_booking_cho_sale, sale_gui_yeu_cau, xin_huy_booking, tra_loi_huy_booking…): [MỞ: CH-060]
      return { tieuDe: "Thông báo mới", chiTiet: null };
  }
}

// Nhóm "Hôm nay" hay "Trước đó" theo ngày Việt Nam, và giờ hiện trên dòng: hôm nay "09:05", hôm qua "Hôm qua", cũ hơn "04/10"
export const laHomNay = (tao: string, bayGio: number = Date.now()) => ngayVN(Date.parse(tao)) === ngayVN(bayGio);
export const chuGioDong = (tao: string, bayGio: number = Date.now()) => {
  const t = Date.parse(tao);
  const ngay = ngayVN(t);
  const hom = ngayVN(bayGio);
  if (ngay === hom) return chuGioVN(t);
  return ngay === congNgay(hom, -1) ? "Hôm qua" : chuNgayNgan(ngay);
};

// Nơi mở khi chạm một dòng (P13 bảng Hành động). Loại chưa có màn đích thì chỉ đánh dấu đã đọc: null.
export type DichThongBao = { duong: "DAT_PHONG_SALE" | "YEU_CAU_SALE" | "YEU_CAU_CHU" | "LICH_SALE" | "CAN_SALE" | "THONG_KE"; state?: { id: string } };
export function dichThongBao(m: MucThongBao): DichThongBao | null {
  switch (m.loai) {
    case "chu_sua_booking":
      return m.booking_id ? { duong: "DAT_PHONG_SALE", state: { id: m.booking_id } } : null; // S3-10
    case "chu_chap_nhan_yeu_cau":
    case "chu_tu_choi_yeu_cau":
    case "yeu_cau_het_han":
      return m.yeu_cau_id ? { duong: "YEU_CAU_SALE", state: { id: m.yeu_cau_id } } : null; // S3-04, S3-05, S3-09
    case "sale_gui_yeu_cau":
      return m.yeu_cau_id ? { duong: "YEU_CAU_CHU", state: { id: m.yeu_cau_id } } : null; // CN9
    case "chu_dong_y_ket_noi":
      return { duong: "LICH_SALE" }; // A10-02: lịch sau khi thêm
    case "chu_xoa_tai_khoan":
      return { duong: "CAN_SALE" }; // S6-08, không mở căn hay lịch của chủ nhà đã xóa (US22-NT4)
    case "chu_ngung_ket_noi":
      return { duong: "THONG_KE" }; // S7-03 chưa làm: tab Thống kê, không mở lịch của chủ nhà đó
    default:
      return null;
  }
}
