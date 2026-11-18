import React, { useRef, useState } from "react";
import { Page, useNavigate } from "../nen-tang/giao-dien";
import { DauMan } from "../components/dau-man";
import { DUONG } from "../components/duong-dan";
import { chuToastDaThemSale } from "../components/sale-hien-thi";
import { useToast } from "../components/toast";
import { postKetNoi } from "../services/api";
import { LoiApi, LoiMang } from "../services/kieu";
import { boNhoHoSo } from "../stores/ho-so";
import { NoiDungCN705, soHopLe } from "./cn7-man-them";

// CN7-05 · Thêm sale thủ công (mục "Chủ nhà quản lý danh sách sale" (US5) bước 4, US5-NT9): ô Tên sale *, Số điện thoại *, nút "Lưu sale".
const khoaMoi = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `k-${Date.now()}-${Math.random()}`;

export const CN7ThemSale = () => {
  const dieuHuong = useNavigate();
  const toast = useToast();
  const [ten, setTen] = useState("");
  const [so, setSo] = useState("");
  const [daBam, setDaBam] = useState(false);
  const [dangLuu, setDangLuu] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);
  const dangLuuRef = useRef(false);
  // Một khóa cho một nội dung: lưu lại sau lỗi mạng dùng lại khóa (HV2, server.md 1.6)
  const khoa = useRef(khoaMoi());

  const luu = async () => {
    if (dangLuuRef.current) return;
    setDaBam(true);
    if (ten.trim() === "" || !soHopLe(so)) return; // thiếu ô bắt buộc: không gọi server
    dangLuuRef.current = true;
    setDangLuu(true);
    setLoi(null);
    try {
      await postKetNoi({ ten, so_dien_thoai: so }, khoa.current);
      boNhoHoSo.xoaKetNoi();
      toast(chuToastDaThemSale(ten.trim()));
      dieuHuong(DUONG.SALE, { replace: true, animate: false });
    } catch (e) {
      if (!(e instanceof LoiMang)) khoa.current = khoaMoi(); // lỗi server đã xử lý xong: lần sau là lệnh mới (HV1)
      // Hai ô giữ nguyên chữ đã gõ; không tự lưu lại khi có mạng (US5-KB13)
      setLoi(
        e instanceof LoiMang
          ? "Chưa lưu được, bấm lại khi có mạng"
          : e instanceof LoiApi && e.loi === "DU_LIEU_SAI"
            ? "Tên hoặc số điện thoại chưa đúng"
            : "Có lỗi, chưa lưu được. Bấm lại",
      );
    } finally {
      dangLuuRef.current = false;
      setDangLuu(false);
    }
  };

  return (
    <Page className="man">
      <DauMan ten="Thêm sale" coLui />
      <NoiDungCN705
        ten={ten}
        so={so}
        daBam={daBam}
        dangLuu={dangLuu}
        loi={loi}
        onDoiTen={(v) => {
          khoa.current = khoaMoi();
          setTen(v);
        }}
        onDoiSo={(v) => {
          khoa.current = khoaMoi();
          setSo(v);
        }}
        onLuu={luu}
      />
    </Page>
  );
};
