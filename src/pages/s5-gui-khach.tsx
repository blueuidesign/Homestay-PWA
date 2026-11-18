import React, { useCallback, useEffect, useRef, useState } from "react";
import { Page, useLocation, useNavigate } from "../nen-tang/giao-dien";
import { DauMan } from "../components/dau-man";
import { DUONG } from "../components/duong-dan";
import { useKhiQuayLai, useMatMang } from "../components/dung-mang";
import { CHU_CHUA_SAO_CHEP, CHU_DA_SAO_CHEP, CHU_LOI_MO_ZALO, TIEU_DE_S5, canIdsCuaState } from "../components/gui-khach-hien-thi";
import { useToast } from "../components/toast";
import { postSaleGuiKhachXem } from "../services/api";
import { guiAnhMotCan, guiChuMotCan, saoChepChuMotCan, saoChepChuTatCa } from "../services/gui-khach";
import { LoiApi, LoiMang, type CanGuiKhach, type KetQuaGuiKhachXem, type TrangThaiGuiKhach } from "../services/kieu";
import { KhungDangTai } from "./a4-chu-nha-moi";
import { ChuaTaiDuoc } from "./cn1-lich-thang";
import { KhongConXem } from "./cn3-man";
import { NoiDungS5 } from "./s5-man";

// S5 · Gửi cho khách (YC5.5). Mở từ S2, S3 với state { can_ids | can_id, ngay_nhan, ngay_tra }.
// Mở màn: POST /sale/gui-khach/xem (không ghi gì). Các nút Gửi mở cửa sổ Zalo qua services/gui-khach.ts; đóng cửa sổ không gửi thì ở lại S5.
// Quay lại từ nền (kể cả sau khi gửi) thì tải lại ngầm, giữ chữ đang hiện (HV3 bước 2). Mất quyền: HV5.
const khungDangTai = <div className="noi-dung"><KhungDangTai /></div>;

export const ManGuiKhach = () => {
  const dieuHuong = useNavigate();
  const viTri = useLocation();
  const toast = useToast();
  const matMang = useMatMang();
  const st = (viTri.state as TrangThaiGuiKhach | null | undefined) ?? null;
  const canIds = canIdsCuaState(st);
  const nhan = st?.ngay_nhan ?? null;
  const tra = st?.ngay_tra ?? null;
  const [ket, setKet] = useState<KetQuaGuiKhachXem | null>(null);
  const [dangTai, setDangTai] = useState(false);
  const [loi, setLoi] = useState<"mang" | "khac" | null>(null);
  const [khongQuyen, setKhongQuyen] = useState<string | null | false>(false);
  const [dangMo, setDangMo] = useState<string | null>(null);
  const [loiGui, setLoiGui] = useState<string | null>(null);
  const lan = useRef(0);
  const dangMoRef = useRef<string | null>(null);

  const tai = useCallback(async () => {
    if (!nhan || !tra || canIds.length === 0) return;
    const l = ++lan.current;
    setDangTai(true);
    try {
      const kq = await postSaleGuiKhachXem({ can_ids: canIds, ngay_nhan: nhan, ngay_tra: tra });
      if (l !== lan.current) return;
      setKet(kq);
      setLoi(null);
      setKhongQuyen(false);
    } catch (e) {
      if (l !== lan.current) return;
      if (e instanceof LoiApi && e.loi === "CHUA_DANG_NHAP") dieuHuong(DUONG.A1, { replace: true, animate: false });
      else if (e instanceof LoiApi && (e.loi === "KHONG_CON_QUYEN" || e.loi === "KHONG_TIM_THAY")) {
        setKet(null);
        setKhongQuyen(e.ly_do || null);
      } else setLoi(e instanceof LoiMang ? "mang" : "khac");
    } finally {
      if (l === lan.current) setDangTai(false);
    }
  }, [canIds.join(","), nhan, tra]);

  useEffect(() => {
    if (!nhan || !tra || canIds.length === 0) {
      dieuHuong(DUONG.TIM_PHONG, { replace: true, animate: false });
      return;
    }
    void tai();
  }, []);
  // Có mạng lại hoặc quay lại từ nền thì tải lại (HV2 bước 4, HV3 bước 2). Đang mở cửa sổ Zalo thì để việc gửi chạy tiếp.
  const matMangTruoc = useRef(matMang);
  useEffect(() => {
    if (matMangTruoc.current && !matMang && !dangMoRef.current) void tai();
    matMangTruoc.current = matMang;
  }, [matMang]);
  useKhiQuayLai(useCallback(() => void tai(), [tai]));

  const mo = async (c: CanGuiKhach, viec: () => Promise<{ kq: "da_gui" | "huy" | "loi" }>) => {
    if (dangMoRef.current || !ket) return;
    dangMoRef.current = c.id;
    setDangMo(c.id);
    setLoiGui(null);
    try {
      const { kq } = await viec();
      if (kq === "loi") setLoiGui(CHU_LOI_MO_ZALO);
    } finally {
      dangMoRef.current = null;
      setDangMo(null);
    }
  };
  const ngay = ket ? { nhan: ket.ngay_nhan, tra: ket.ngay_tra } : null;
  const baoSaoChep = async (viec: Promise<boolean>) => toast((await viec) ? CHU_DA_SAO_CHEP : CHU_CHUA_SAO_CHEP);

  if (!nhan || !tra || canIds.length === 0) return null;
  let noiDung: React.ReactNode;
  if (khongQuyen !== false) {
    noiDung = (
      <div className="noi-dung">
        <KhongConXem lyDo={khongQuyen || undefined} onVe={() => dieuHuong(DUONG.LICH_SALE, { replace: true })} />
      </div>
    );
  } else if (!ket) {
    noiDung = loi ? <div className="noi-dung"><ChuaTaiDuoc matMang={matMang || loi === "mang"} onThuLai={() => void tai()} /></div> : khungDangTai;
  } else {
    noiDung = (
      <NoiDungS5
        ket={ket}
        dangMo={dangMo}
        loi={loiGui}
        onGuiChu={(c) => void mo(c, () => guiChuMotCan(c, ngay!))}
        onGuiAnh={(c) => void mo(c, () => guiAnhMotCan(c, ngay!))}
        onSaoChep={(c) => void baoSaoChep(saoChepChuMotCan(c))}
        onSaoChepTatCa={() => void baoSaoChep(saoChepChuTatCa(ket))}
      />
    );
  }

  return (
    <Page className="man">
      <DauMan ten={TIEU_DE_S5} coLui />
      {matMang && ket ? (
        <div className="hh-banner hh-banner--warning" role="status">
          Mất kết nối. Chữ và giá có thể chưa mới nhất.
        </div>
      ) : (
        dangTai && ket && <div className="dang-cap-nhat">Đang cập nhật…</div>
      )}
      {noiDung}
    </Page>
  );
};
