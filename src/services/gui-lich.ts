import { tinGuiLich } from "../components/sale-hien-thi";
import { postLink, postLinkDaGui } from "./api";
import { zalo } from "./zalo";

// Việc gốc của nút "Gửi lịch qua Zalo" ở CN10 (mục "Chủ nhà chủ động gửi lịch cho sale" (US26) bước 4). Tách khỏi màn để test.
// Tạo link gửi lịch cho các căn đã chọn, rồi mở Zalo: mỗi sale đã chọn một cửa sổ, không chọn ai thì một cửa sổ để tự chọn người nhận.
// App không gửi gì thay chủ nhà và không biết gửi cho ai (nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale quy tắc Không biết gửi cho ai).
// [MỞ: CH-054] Cách Zalo gửi cho nhiều sale (lần lượt hay một lần) chưa chốt. Tạm: lần lượt, một cửa sổ chia sẻ cho mỗi sale,
// vì server không gửi ID Zalo của sale nên openChat chọn sẵn người nhận chưa làm được (zalo-hanh-vi 5.2).
export type NguoiNhan = { id: string; ten: string };
export type KetQuaGuiLich =
  | { loai: "da_gui"; so_cua_so: number } // có ít nhất một cửa sổ Zalo báo đã gửi: CN10-02
  | { loai: "huy" } // đóng cửa sổ mà chưa gửi cho ai: CN10-01
  | { loai: "loi" }; // không mở được Zalo

const khoaMoi = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `k-${Date.now()}-${Math.random()}`;

// khoa: Idempotency-Key của POST /link, giữ nguyên khi bấm lại sau lỗi mạng để không tạo hai link (HV1-NT1).
// Lỗi mạng của POST /link ném lên cho màn báo HV2, Zalo chưa mở.
export async function guiLichQuaZalo(canIds: string[], nguoiNhan: NguoiNhan[], khoa: string): Promise<KetQuaGuiLich> {
  const link = await postLink({ loai: "gui_lich", can_ids: canIds }, khoa);
  const dich: (NguoiNhan | null)[] = nguoiNhan.length > 0 ? nguoiNhan : [null];
  let soGui = 0;
  for (const n of dich) {
    const kq = await zalo.chiaSeChu(tinGuiLich(link.duong_dan, n?.ten ?? null));
    if (kq === "loi") return soGui > 0 ? { loai: "da_gui", so_cua_so: soGui } : { loai: "loi" };
    if (kq === "huy") break; // đóng một cửa sổ thì không mở tiếp cửa sổ sau
    soGui++;
    await postLinkDaGui(link.ma, khoaMoi()).catch(() => {}); // đếm không được thì thôi, tin đã gửi
  }
  return soGui > 0 ? { loai: "da_gui", so_cua_so: soGui } : { loai: "huy" };
}
