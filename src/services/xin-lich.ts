import { postLinkDaGui } from "./api";
import type { KetQuaChiaSe } from "./zalo";
import type { LinkMoi } from "./kieu";
import { zalo } from "./zalo";

// Việc gốc của hai nút ở A6 (mục "Sale xin chủ nhà cho xem lịch" (US17) bước 2, 4). Tách khỏi màn để test.
const khoaMoi = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `k-${Date.now()}-${Math.random()}`;

// Tin sẵn của A6 (canvas A6: "Chào anh/chị, em là Hùng, sale phòng ở Hạ Long. … zalo.me/s/…"). KB2 ghi tên Zalo của sale.
// Tên hiển thị trống thì bỏ phần "em là …" (nhóm Quản trị và dữ liệu-H: tên trống thì gửi gì chưa chốt). Link là link Mini App, không số điện thoại (US17-NT5).
export const tinXinLich = (tenSale: string | null, duongDan: string) =>
  `Chào anh/chị, em là ${tenSale ? `${tenSale}, ` : ""}sale phòng ở Hạ Long. Anh/chị bấm link dưới đây để cho em xem lịch phòng trống. Em gửi khách nhanh hơn, không phải gọi hỏi từng lần. ${duongDan}`;

// "Gửi qua Zalo": mở cửa sổ gửi của Zalo; chỉ khi báo đã gửi mới đếm một lần (POST /link/:ma/da-gui). Đóng cửa sổ mà chưa gửi: "huy",
// màn ở lại A6 như CN7 (không báo gì, không tăng số). Đếm không được thì thôi, tin đã gửi rồi.
export async function guiXinLichQuaZalo(link: LinkMoi, tin: string): Promise<KetQuaChiaSe> {
  const kq = await zalo.chiaSeChu(tin);
  if (kq === "da_gui") await postLinkDaGui(link.ma, khoaMoi()).catch(() => {});
  return kq;
}

// "Sao chép tin nhắn": sao chép cũng tính một lần gửi (api/ket-noi-link.md da-gui), rồi màn sang A7 (mục "Sale xin chủ nhà cho xem lịch" (US17) bước 4)
export async function saoChepXinLich(link: LinkMoi, tin: string): Promise<boolean> {
  const ok = await zalo.saoChep(tin);
  if (ok) await postLinkDaGui(link.ma, khoaMoi()).catch(() => {});
  return ok;
}
