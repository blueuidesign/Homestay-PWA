import { tinMoiSale } from "../components/sale-hien-thi";
import { postLink, postLinkDaGui } from "./api";
import { zalo } from "./zalo";

// Việc gốc của hai nút ở CN7, CN7-00 (YC1.9 bước 1a). Tách khỏi màn để test.
const khoaMoi = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `k-${Date.now()}-${Math.random()}`;

// Lấy link mời (đang dùng hoặc mới), mở cửa sổ gửi của Zalo, rồi đếm một lần gửi. Tắt cửa sổ Zalo mà không gửi thì ở lại, không báo gì.
export async function guiLinkQuaZalo(): Promise<"da_gui" | "huy" | "loi"> {
  const link = await postLink({ loai: "moi_sale" }, khoaMoi());
  const kq = await zalo.chiaSeChu(tinMoiSale(link.duong_dan));
  if (kq !== "loi") await postLinkDaGui(link.ma, khoaMoi()).catch(() => {}); // đếm không được thì thôi, cửa sổ đã mở
  return kq;
}

// Lấy link mời rồi sao chép, đếm một lần (YC1.9 bước 1a; sao chép cũng tính một lần, api/ket-noi-link.md da-gui)
export async function saoChepLink(): Promise<boolean> {
  const link = await postLink({ loai: "moi_sale" }, khoaMoi());
  const ok = await zalo.saoChep(link.duong_dan);
  if (ok) await postLinkDaGui(link.ma, khoaMoi()).catch(() => {});
  return ok;
}

