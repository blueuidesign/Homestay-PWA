import React, { useEffect, useRef, useState } from "react";
import { Page, useLocation, useNavigate } from "../nen-tang/giao-dien";
import { DauMan } from "../components/dau-man";
import { DUONG } from "../components/duong-dan";
import { useMatMang } from "../components/dung-mang";
import { useToast } from "../components/toast";
import { getNgayLe, homNay, postGiaDip } from "../services/api";
import { LoiApi, LoiMang, type MucNgayLe } from "../services/kieu";
import { boNhoGia } from "../stores/gia";
import { docTien } from "./cn4-dat-phong";
import { chamONoiDai, chuChuaCoDai, chuToastDaLuuDip, dienTuNgayLe, kiemDip, loiKhiLuuDip, NoiDungGiaLe, timNgayLe } from "./cn6-gia-le-man";

// US8 · CN6-02, CN6-03, CN6-03-01 Giá ngày lễ, dịp đặc biệt (YC3.5). Vào từ nút "Đặt giá ngày lễ, dịp đặc biệt" hoặc chạm một ngày
// trên lịch giá ở tab Giá. Tải GET /ngay-le, lưu POST /can/:id/gia-dip. Lưu xong về tab Giá, toast.
// Phần đang nhập giữ trong bộ nhớ (stores/gia.ts) để rời app rồi quay lại vẫn còn (HV3).
const khoaMoi = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `k-${Date.now()}-${Math.random()}`;

export const CN6GiaNgayLe = () => {
  const dieuHuong = useNavigate();
  const toast = useToast();
  const matMang = useMatMang();
  const viTri = useLocation();
  const moTu = (viTri.state as { can_id?: string; ma_can?: string; ngay?: string } | null) ?? {};
  const canId = moTu.can_id ?? "";
  const nam = Number(homNay().slice(0, 4));
  const nhap = boNhoGia.nhapDip(canId);
  const [tu, setTu] = useState(nhap.tu || moTu.ngay || "");
  const [den, setDen] = useState(nhap.den || moTu.ngay || "");
  const [ten, setTen] = useState(nhap.ten);
  const [gia, setGia] = useState(nhap.gia);
  const [laLe, setLaLe] = useState(nhap.laLe);
  const [ngayLeId, setNgayLeId] = useState<string | null>(nhap.ngayLeId);
  const [ngayLe, setNgayLe] = useState<MucNgayLe[] | null>(null);
  const [chuNhanh, setChuNhanh] = useState<string | null>(null);
  const [dangLuu, setDangLuu] = useState(false);
  const [loiChung, setLoiChung] = useState<string | null>(null);
  const dangLuuRef = useRef(false);
  // Một khóa cho một nội dung (server.md 1.6): gửi lại cùng nội dung sau lỗi mạng dùng lại khóa (HV2)
  const khoa = useRef(khoaMoi());

  useEffect(() => {
    if (canId) boNhoGia.ghiNhapDip(canId, { tu, den, ten, gia, laLe, ngayLeId });
  }, [canId, tu, den, ten, gia, laLe, ngayLeId]);

  useEffect(() => {
    let conDung = true;
    getNgayLe({ nam })
      .then((kq) => conDung && setNgayLe(kq.muc))
      .catch((e) => {
        if (!conDung) return;
        if (e instanceof LoiApi && e.loi === "CHUA_DANG_NHAP") dieuHuong(DUONG.A1, { replace: true, animate: false });
        else setNgayLe([]); // không tải được dải thì vẫn nhập tay được
      });
    return () => {
      conDung = false;
    };
  }, []);

  const doiForm = () => {
    khoa.current = khoaMoi();
    setLoiChung(null);
  };

  const luu = async () => {
    if (dangLuuRef.current || kiemDip({ tu, den, ten, gia, laLe }) !== null) return;
    const tien = docTien(gia);
    if (tien === null) return;
    dangLuuRef.current = true;
    setDangLuu(true);
    setLoiChung(null);
    try {
      const kq = await postGiaDip(canId, { ten: ten.trim() || null, tu_ngay: tu, den_ngay: den, la_ngay_le: laLe, gia_moi_dem: tien, ngay_le_id: ngayLeId }, khoa.current);
      boNhoGia.boBangCuaCan(canId);
      boNhoGia.ghiNhapDip(canId, { tu: "", den: "", ten: "", gia: "", laLe: false, ngayLeId: null });
      boNhoGia.datQuayVeTabGia(canId);
      toast(chuToastDaLuuDip(kq.ten));
      dieuHuong(-1);
    } catch (e) {
      if (!(e instanceof LoiMang)) khoa.current = khoaMoi(); // lỗi server: lần sau khóa khác (HV1); lỗi mạng giữ khóa (HV2)
      if (e instanceof LoiApi && e.loi === "CHUA_DANG_NHAP") dieuHuong(DUONG.A1, { replace: true, animate: false });
      else setLoiChung(loiKhiLuuDip(e)); // lỗi chồng ngày, lỗi mạng: ở lại màn, giữ nguyên nội dung đang nhập
    } finally {
      dangLuuRef.current = false;
      setDangLuu(false);
    }
  };

  return (
    <Page className="man">
      <DauMan ten="Giá ngày lễ, dịp đặc biệt" coLui />
      <NoiDungGiaLe
        maCan={moTu.ma_can ?? ""}
        ngayLe={ngayLe}
        tu={tu}
        den={den}
        ten={ten}
        gia={gia}
        laLe={laLe}
        dangLuu={dangLuu}
        loiChung={loiChung}
        chuNhanh={chuNhanh}
        matMang={matMang}
        onChonNhanh={(nhan) => {
          const m = timNgayLe(ngayLe, nhan);
          if (!m) {
            setChuNhanh(chuChuaCoDai(nhan, nam));
            return;
          }
          const f = dienTuNgayLe(m);
          setTu(f.tu);
          setDen(f.den);
          setTen(f.ten);
          setNgayLeId(f.ngayLeId);
          setChuNhanh(null);
          doiForm();
        }}
        onDoiNgay={(o, ngay) => {
          if (o === "tu") setTu(ngay);
          else setDen(ngay);
          doiForm();
        }}
        onChamO={(ngay) => {
          const d = chamONoiDai(tu, den, ngay);
          setTu(d.tu);
          setDen(d.den);
          doiForm();
        }}
        onDoiTen={(chu) => {
          setTen(chu);
          doiForm();
        }}
        onDoiGia={(chu) => {
          const tien = docTien(chu);
          setGia(tien === null ? "" : String(tien));
          doiForm();
        }}
        onDoiLe={() => {
          setLaLe((v) => !v);
          doiForm();
        }}
        onLuu={luu}
      />
    </Page>
  );
};
