import React, { useCallback, useEffect, useRef, useState } from "react";
import { Page, useNavigate } from "../nen-tang/giao-dien";
import { DauMan } from "../components/dau-man";
import { DUONG } from "../components/duong-dan";
import { useKhiQuayLai, useMatMang } from "../components/dung-mang";
import { chuCaiDau, chuToastDaSaoChep, chuTomTat } from "../components/sale-hien-thi";
import { ThanhTab } from "../components/thanh-tab";
import { useToast } from "../components/toast";
import { CHU_LOI_MANG, useXinSo } from "../components/xin-so";
import { getKetNoi } from "../services/api";
import { guiLinkQuaZalo, saoChepLink } from "../services/link-moi";
import { LoiApi, LoiMang, type DanhSachKetNoi } from "../services/kieu";
import { boNhoHoSo } from "../stores/ho-so";
import { KhungDangTai } from "./a4-chu-nha-moi";
import { CHU_DE_SAU_CN7, NoiDungCN7 } from "./cn7-man";
import { ChuaTaiDuoc } from "./cn1-lich-thang";

// CN7 · Sale của tôi (YC1.9 bước 1), CN7-00 khi chưa có sale nào (bước 2), nút gửi link và sao chép link (bước 1a).
// "Nhắc lại" ở sale chưa kết nối chưa thiết kế (YC1.9 bước 3, [MỞ: YC1-H14]) nên không có nút.

export const TabSale = () => {
  const dieuHuong = useNavigate();
  const toast = useToast();
  const matMang = useMatMang();
  const [ds, setDs] = useState<DanhSachKetNoi | null>(() => boNhoHoSo.ketNoi());
  const [dangTai, setDangTai] = useState(false);
  const [loi, setLoi] = useState<"mang" | "khac" | null>(null);
  const [dangLam, setDangLam] = useState(false);
  const [loiViec, setLoiViec] = useState<string | null>(null);
  const lan = useRef(0);
  const xin = useXinSo("sale", CHU_DE_SAU_CN7);

  const tai = useCallback(async () => {
    const l = ++lan.current;
    setDangTai(true);
    try {
      const kq = await getKetNoi();
      if (l !== lan.current) return;
      boNhoHoSo.ghiKetNoi(kq);
      setDs(kq);
      setLoi(null);
    } catch (e) {
      if (l !== lan.current) return;
      if (e instanceof LoiApi && e.loi === "CHUA_DANG_NHAP") dieuHuong(DUONG.A1, { replace: true, animate: false });
      else setLoi(e instanceof LoiMang ? "mang" : "khac");
    } finally {
      if (l === lan.current) setDangTai(false);
    }
  }, []);

  useEffect(() => {
    tai();
  }, []);
  // Có mạng lại hoặc quay lại từ nền thì tải lại (HV2 bước 4, HV3 bước 2)
  const matMangTruoc = useRef(matMang);
  useEffect(() => {
    if (matMangTruoc.current && !matMang) tai();
    matMangTruoc.current = matMang;
  }, [matMang]);
  useKhiQuayLai(tai);

  // Việc gốc của hai nút (YC1.9 bước 1a); lỗi mạng của server giả hiện ở banner đầu màn
  const lam = (viec: () => Promise<string | null>) => async () => {
    setDangLam(true);
    setLoiViec(null);
    try {
      setLoiViec(await viec());
    } catch (e) {
      setLoiViec(e instanceof LoiMang ? CHU_LOI_MANG : "Có lỗi, chưa làm được. Bấm lại");
    } finally {
      setDangLam(false);
    }
  };
  const guiLink = lam(async () => {
    const kq = await guiLinkQuaZalo();
    return kq === "loi" ? "Chưa mở được Zalo để gửi link. Bấm lại" : null;
  });
  const saoChep = lam(async () => {
    if (!(await saoChepLink())) return "Chưa sao chép được. Bấm lại";
    toast(chuToastDaSaoChep);
    return null;
  });

  let noiDung: React.ReactNode;
  if (!ds) {
    noiDung = loi ? <ChuaTaiDuoc matMang={matMang || loi === "mang"} onThuLai={tai} /> : <KhungDangTai />;
  } else {
    noiDung = (
      <NoiDungCN7
        ds={ds}
        dangLam={dangLam}
        onGuiLink={() => void xin.chay(guiLink)}
        onSaoChep={() => void xin.chay(saoChep)}
        onThemSale={() => dieuHuong(DUONG.SALE_THEM)}
        onMoSale={(id) => dieuHuong(DUONG.SALE_CHI_TIET, { state: { id } })}
      />
    );
  }

  return (
    <Page className="man">
      <DauMan ten="Sale" />
      {matMang && ds ? (
        <div className="hh-banner hh-banner--warning" role="status">
          Mất kết nối. Danh sách có thể chưa mới nhất.
        </div>
      ) : (
        dangTai && ds && <div className="dang-cap-nhat">Đang cập nhật…</div>
      )}
      <div className="noi-dung">
        {loiViec && (
          <div className="hh-banner hh-banner--danger" role="alert">
            <span>⚠️ {loiViec}</span>
          </div>
        )}
        {noiDung}
      </div>
      {xin.popup}
      <ThanhTab dangO={DUONG.SALE} />
    </Page>
  );
};
