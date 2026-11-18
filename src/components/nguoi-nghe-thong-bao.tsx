import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "../nen-tang/giao-dien";
import { getThongBao } from "../services/api";
import { boNhoLichSale } from "../stores/lich";
import { layVai } from "../stores/vai";
import { DUONG } from "./duong-dan";
import { useKhiQuayLai } from "./dung-mang";
import { chonToastMoi, CHU_NUT_XEM, type TrangThaiNghe } from "./thong-bao-hien-thi";
import { useToast } from "./toast";

// Toast A9, A9-02 (YC1.10 bước 1, 2): khi sale đang mở app, hỏi GET /thong-bao?gioi_han=20 mỗi 60 giây và mỗi lần quay lại từ nền;
// có lần đồng ý mới của chủ nhà thì hiện toast "<tên> đã đồng ý cho bạn xem lịch", nút "Xem" mở Nguồn phòng (S6). Chậm nhất 60 giây sau khi
// chủ nhà đồng ý (server.md 1.11). Chỉ tài khoản vai sale (toast là của sale). Mất mạng hay lỗi thì bỏ qua, lần hỏi sau thử lại.
// Chưa biết vai (chưa vào app) hay chưa có lần hỏi đầu thì hỏi lại sau vài giây, để lần hỏi đầu (chỉ ghi nhớ) đến sớm.
export const CHU_KY_HOI_MS = 60_000;
const CHU_KY_CHO_MS = 3_000;

export const NguoiNgheThongBao = () => {
  const dieuHuong = useNavigate();
  const toast = useToast();
  const lienQuan = useRef({ dieuHuong, toast });
  lienQuan.current = { dieuHuong, toast };
  const trangThai = useRef<TrangThaiNghe>({ daThay: null });
  const dangHoi = useRef(false);

  const hoi = useCallback(async () => {
    if (layVai() !== "sale" || dangHoi.current) return;
    dangHoi.current = true;
    try {
      const kq = await getThongBao({ gioi_han: 20 });
      const t = chonToastMoi(kq.muc, trangThai.current);
      if (t) {
        boNhoLichSale.lamMoi(); // lịch đã xem chưa có căn của chủ nhà vừa đồng ý
        lienQuan.current.toast({ ...t, nut: { chu: CHU_NUT_XEM, onBam: () => lienQuan.current.dieuHuong(DUONG.CAN_SALE) } });
      }
    } catch {
      // mất mạng, hết phiên: lần sau
    } finally {
      dangHoi.current = false;
    }
  }, []);

  useEffect(() => {
    let con = true;
    let hen: ReturnType<typeof setTimeout>;
    const vong = async () => {
      await hoi();
      if (con) hen = setTimeout(vong, trangThai.current.daThay === null ? CHU_KY_CHO_MS : CHU_KY_HOI_MS);
    };
    hen = setTimeout(vong, CHU_KY_CHO_MS);
    return () => {
      con = false;
      clearTimeout(hen);
    };
  }, [hoi]);
  useKhiQuayLai(hoi);
  return null;
};
