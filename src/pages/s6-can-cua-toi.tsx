import React, { useCallback, useEffect, useRef, useState } from "react";
import { Page, useLocation, useNavigate } from "../nen-tang/giao-dien";
import {
  CHU_CHUA_THIET_KE_SUA,
  CHU_GUI_KHACH_CHON_NGAY,
  tenCanSale,
} from "../components/can-sale-hien-thi";
import { DauMan } from "../components/dau-man";
import { DUONG } from "../components/duong-dan";
import { useKhiQuayLai, useMatMang } from "../components/dung-mang";
import { useToast } from "../components/toast";
import { getCanChiTiet, getSaleLich, homNay } from "../services/api";
import { LoiApi, LoiMang, type CanChiTiet, type OLichSale } from "../services/kieu";
import { KhungDangTai } from "./a4-chu-nha-moi";
import { ChuaTaiDuoc } from "./cn1-lich-thang";
import { KhongConXem } from "./cn3-man";
import { NoiDungS6CanCuaToi, VIEC } from "./s6-can-cua-toi-man";

// S6-07 · Chi tiết căn của tôi (mục "Danh sách căn và nguồn phòng" (US16) bước 9, NT11). Mở từ nhóm "Căn của tôi" ở S6, state { can_id }.
// Lịch 7 ngày lấy từ GET /sale/lich (ô trống có giá đêm của chính sale, ô kín ghi "Kín"). Ba việc dùng lại màn của chủ nhà (QD13):
// "Đặt phòng" mở CN4, "Sửa căn và giá" mở CN5-02, "Gửi cho khách" mở gửi khách (S5, cần ngày khách hỏi, CH-078 còn mở).
export const ManCanCuaToi = () => {
  const dieuHuong = useNavigate();
  const viTri = useLocation();
  const toast = useToast();
  const matMang = useMatMang();
  const canId = (viTri.state as { can_id?: string } | null)?.can_id ?? "";
  const [can, setCan] = useState<CanChiTiet | null>(null);
  const [o, setO] = useState<OLichSale[] | null>(null);
  const [dangTai, setDangTai] = useState(false);
  const [loi, setLoi] = useState<"mang" | "khac" | null>(null);
  const [khongQuyen, setKhongQuyen] = useState(false);
  const lan = useRef(0);
  const hom = homNay();

  const tai = useCallback(async () => {
    if (!canId) return;
    const l = ++lan.current;
    setDangTai(true);
    try {
      const c = await getCanChiTiet(canId);
      let lich: OLichSale[] | null = null;
      try {
        lich = (await getSaleLich({ tu: homNay(), so_ngay: 7 })).can.find((x) => x.id === canId)?.o ?? null;
      } catch (e) {
        if (e instanceof LoiApi && e.loi === "CHUA_DANG_NHAP") throw e; // lỗi riêng của lịch: màn vẫn hiện, chỉ thiếu lịch
      }
      if (l !== lan.current) return;
      setCan(c);
      setO(lich);
      setLoi(null);
      setKhongQuyen(false);
    } catch (e) {
      if (l !== lan.current) return;
      if (e instanceof LoiApi && e.loi === "CHUA_DANG_NHAP") dieuHuong(DUONG.A1, { replace: true, animate: false });
      else if (e instanceof LoiApi && (e.loi === "KHONG_TIM_THAY" || e.loi === "KHONG_CON_QUYEN")) setKhongQuyen(true); // PQ13: căn người khác, HV5
      else setLoi(e instanceof LoiMang ? "mang" : "khac");
    } finally {
      if (l === lan.current) setDangTai(false);
    }
  }, [canId]);

  useEffect(() => {
    if (!canId) {
      dieuHuong(DUONG.CAN_SALE, { replace: true, animate: false });
      return;
    }
    void tai();
  }, [canId]);
  const matMangTruoc = useRef(matMang);
  useEffect(() => {
    if (matMangTruoc.current && !matMang) void tai();
    matMangTruoc.current = matMang;
  }, [matMang]);
  useKhiQuayLai(useCallback(() => void tai(), [tai]));

  const viec = (ma: (typeof VIEC)[number]["ma"]) => {
    if (!can) return;
    if (ma === "dat_phong") dieuHuong(DUONG.DAT_PHONG, { state: { can_id: can.id } });
    else if (ma === "sua") dieuHuong(DUONG.CHI_TIET_CAN, { state: { can_id: can.id, ma_can: can.ma_can, tab: "thong_tin", thu_tu: 0 } });
    else {
      toast(CHU_GUI_KHACH_CHON_NGAY);
      dieuHuong(DUONG.TIM_PHONG);
    }
  };

  if (!canId) return null;
  let noiDung: React.ReactNode;
  if (khongQuyen) noiDung = <KhongConXem onVe={() => dieuHuong(DUONG.CAN_SALE, { replace: true })} />;
  else if (!can) noiDung = loi ? <ChuaTaiDuoc matMang={matMang || loi === "mang"} onThuLai={() => void tai()} /> : <KhungDangTai />;
  else noiDung = <NoiDungS6CanCuaToi can={can} o={o} hom={hom} onViec={viec} />;
  return (
    <Page className="man">
      <DauMan ten={can ? tenCanSale(can) : "Căn của tôi"} coLui />
      {matMang && can ? (
        <div className="hh-banner hh-banner--warning" role="status">
          Mất kết nối. Lịch có thể chưa mới nhất.
        </div>
      ) : (
        dangTai && can && <div className="dang-cap-nhat">Đang cập nhật…</div>
      )}
      <div className="noi-dung">{noiDung}</div>
    </Page>
  );
};
