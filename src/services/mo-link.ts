import { datVai } from "../stores/vai";
import { ghiDongYDieuKhoan, layDongYDieuKhoan } from "../stores/vao-app";
import { getLinkXemTruoc, postLinkDongY, postLinkThemLich, postPhien, postTaiKhoan } from "./api";
import { LoiApi, type KetQuaThemLich, type XemTruocLink, type XemTruocLinkXin } from "./kieu";

// Luồng sale bấm link mời của chủ nhà (mục "Mở app từ link mời của chủ nhà" (US6)). Tách khỏi màn để test.

export type ManLink =
  | { man: "a1_link"; xem: XemTruocLink } // chưa có tài khoản (bước 1)
  | { man: "a10"; xem: XemTruocLink } // có tài khoản, chưa thêm lịch của chủ nhà này (bước 3)
  | { man: "a10_01"; xem: XemTruocLink } // đã thêm rồi (bước 6)
  | { man: "loi_link"; coTaiKhoan: boolean } // link sai, hết hạn, chủ nhà đã xóa tài khoản: A1-link-01
  | { man: "a8"; xin: XemTruocLinkXin; coTaiKhoan: boolean } // link xin lịch của sale, chủ nhà mở (US17, mục "Chủ nhà duyệt lời mời xem lịch" (US17) bước 2)
  | { man: "a8_01" }; // link xin lịch không dùng được: hết hạn, sale đã xóa tài khoản, hoặc chủ nhà đã ngừng sale đó

// Mở app từ link: lấy phiên (không hộp thoại, không xin quyền) rồi xem trước link. Việc này không ghi gì (US6-NT4).
export async function moLink(ma: string): Promise<ManLink> {
  const { tai_khoan } = await postPhien();
  datVai(tai_khoan?.vai_chon ?? null);
  let xem: XemTruocLink | XemTruocLinkXin;
  try {
    xem = await getLinkXemTruoc(ma);
  } catch (e) {
    if (e instanceof LoiApi) {
      // Link xin lịch mà người mở là sale (không phải chủ nhà): không dùng được, A8-01 (api/ket-noi-link.md, [MỞ: CH-057])
      if (e.loi === "KHONG_DUOC_PHEP") return { man: "a8_01" };
      if (e.loi === "LINK_KHONG_DUNG_DUOC") {
        // Lỗi không nói link thuộc loại nào. Tài khoản chủ nhà thì là link xin lịch đã hết, như A8-01 (US22-NT2, HV5); còn lại như cũ
        return tai_khoan?.vai_chon === "chu_nha" ? { man: "a8_01" } : { man: "loi_link", coTaiKhoan: !!tai_khoan };
      }
    }
    throw e;
  }
  if (xem.loai === "xin_lich") return { man: "a8", xin: xem, coTaiKhoan: !!tai_khoan };
  if (!tai_khoan) return { man: "a1_link", xem };
  return { man: xem.da_them ? "a10_01" : "a10", xem };
}

// "Bắt đầu ngay" ở A1-link: bấm là đồng ý điều khoản, tạo tài khoản vai sale, bỏ qua A3 (mục "Mở app từ link mời của chủ nhà" (US6) bước 2, QD9).
// Không xin tên, số điện thoại ở đây (QD2). Link hỏng giữa chừng thì trả loi_link.
export async function batDauTuLink(ma: string): Promise<{ man: "a10" } | { man: "loi_link"; coTaiKhoan: false }> {
  ghiDongYDieuKhoan();
  try {
    const tk = await postTaiKhoan({ vai_chon: "sale", dong_y_dieu_khoan_luc: layDongYDieuKhoan()!, ma_link: ma });
    datVai(tk.vai_chon);
    return { man: "a10" };
  } catch (e) {
    if (e instanceof LoiApi && e.loi === "LINK_KHONG_DUNG_DUOC") return { man: "loi_link", coTaiKhoan: false };
    throw e;
  }
}

export type KetQuaBamThem =
  | { loai: "da_them"; ket_qua: KetQuaThemLich }
  | { loai: "da_co"; ket_qua: KetQuaThemLich } // vừa có kết nối từ trước: về A10-01
  | { loai: "loi_link" }; // link hỏng, hoặc chủ nhà đã ngừng/sale đã bỏ: A1-link-01

// Việc gốc của nút "Thêm lịch của <chủ nhà>" (mục "Mở app từ link mời của chủ nhà" (US6) bước 4). Lỗi mạng ném lên cho màn báo HV2.
export async function themLich(ma: string, khoa: string): Promise<KetQuaBamThem> {
  try {
    const kq = await postLinkThemLich(ma, khoa);
    return { loai: kq.da_co_tu_truoc ? "da_co" : "da_them", ket_qua: kq };
  } catch (e) {
    if (e instanceof LoiApi && (e.loi === "LINK_KHONG_DUNG_DUOC" || e.loi === "KHONG_CON_QUYEN")) return { loai: "loi_link" };
    throw e;
  }
}

export const chuToastDaThemLich = (soCan: number, ten: string | null) => `Đã thêm lịch ${soCan} căn của ${ten ?? "chủ nhà"}`;

export type KetQuaDongY = { loai: "da_dong_y"; ten: string | null; chuNhaMoi: boolean } | { loai: "loi_link" };

// Việc gốc của nút "Đồng ý cho xem lịch" ở A8 (mục "Chủ nhà duyệt lời mời xem lịch" (US17) bước 3). Chủ nhà chưa có tài khoản thì tạo tài khoản vai chủ nhà trước
// (POST /tai-khoan { vai_chon: "chu_nha", ma_link }); bấm Đồng ý là đồng ý Điều khoản như "Bắt đầu ngay" ở A1 [MỞ: CH-058].
// Link không dùng được giữa chừng (chủ nhà đã ngừng, sale đã rút quyền): A8-01. Lỗi mạng ném lên cho màn báo HV2, giữ khóa để bấm lại không tạo hai lần.
export async function dongYXinLich(ma: string, p: { coc: boolean; coTaiKhoan: boolean }, khoa: string): Promise<KetQuaDongY> {
  if (!p.coTaiKhoan) {
    ghiDongYDieuKhoan();
    const tk = await postTaiKhoan({ vai_chon: "chu_nha", dong_y_dieu_khoan_luc: layDongYDieuKhoan()!, ma_link: ma });
    datVai(tk.vai_chon);
  }
  try {
    const kq = await postLinkDongY(ma, { quyen_tinh_trang_coc: p.coc }, khoa);
    return { loai: "da_dong_y", ten: kq.ten_hien_thi_sale, chuNhaMoi: !p.coTaiKhoan };
  } catch (e) {
    if (e instanceof LoiApi && (e.loi === "LINK_KHONG_DUNG_DUOC" || e.loi === "KHONG_CON_QUYEN" || e.loi === "KHONG_DUOC_PHEP")) return { loai: "loi_link" };
    throw e;
  }
}
